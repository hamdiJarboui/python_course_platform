import { parse as parseYaml } from 'yaml';
import {
  courseYmlSchema,
  lessonFrontmatterSchema,
  moduleYmlSchema,
  quizFrontmatterSchema,
} from '@/core/schemas';
import type {
  Course,
  ID,
  LessonContent,
  LessonMeta,
  Manifest,
  Module,
  Quiz,
} from '@/core/types';
import { ContentError } from './errors';
import { compileBody, parseMarkdown, readFrontmatter } from './markdown';
import { parseQuizYaml } from './quiz';

export const QUIZ_FILE = '99-quiz.md';
export const FIXTURES_DIR = '__fixtures__';

const ORDERED = /^(\d{2})-([a-z0-9][a-z0-9-]*)$/;

export interface SearchDoc {
  id: ID;
  courseId: ID;
  courseTitle: string;
  moduleTitle: string;
  title: string;
  /** Route path, e.g. "/c/python-basics/01-getting-started/01-hello-python". */
  route: string;
  headings: string;
  text: string;
}

export interface CompileOptions {
  /** Include `__fixtures__` courses in the manifest (they are always validated). */
  includeFixtures?: boolean;
  /** URL prefix for course assets. Defaults to "/course-assets/". */
  assetBase?: string;
}

/** Everything `content:verify` needs to run a lesson in real CPython and point at the source line. */
export interface VerifyLesson {
  id: ID;
  file: string;
  scope: 'cell' | 'lesson';
  setup: string;
  cells: { id: string; line: number; code: string; expected?: string }[];
  exercises: { id: string; line: number; starter: string; tests: string; solution?: string }[];
}

export interface CompileResult {
  verify: VerifyLesson[];
  manifest: Manifest;
  lessons: Record<ID, LessonContent>;
  quizzes: Record<ID, Quiz>;
  search: SearchDoc[];
  errors: ContentError[];
}

interface Ordered {
  dir: string;
  name: string;
  order: number;
  slug: string;
}

function dirname(path: string): string {
  const i = path.lastIndexOf('/');
  return i < 0 ? '' : path.slice(0, i);
}
function basename(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1);
}
function join(...parts: string[]): string {
  return parts.filter((p) => p !== '').join('/');
}

/** Resolves "./a/../b.md" style relative paths against a directory (posix, no leading slash). */
function resolveRelative(fromDir: string, rel: string): string {
  const out: string[] = fromDir === '' ? [] : fromDir.split('/');
  for (const seg of rel.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') out.pop();
    else out.push(seg);
  }
  return out.join('/');
}

function toContentError(file: string, err: unknown): ContentError {
  if (err instanceof ContentError) return err;
  return new ContentError(file, undefined, err instanceof Error ? err.message : String(err));
}

function yamlFile<T>(
  files: Record<string, string>,
  path: string,
  schema: { safeParse(v: unknown): { success: true; data: T } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } } },
  errors: ContentError[],
): T | undefined {
  const text = files[path];
  if (text === undefined) return undefined;
  try {
    const parsed = schema.safeParse(parseYaml(text));
    if (parsed.success) return parsed.data;
    for (const issue of parsed.error.issues) {
      const where = issue.path.length ? `"${issue.path.map(String).join('.')}": ` : '';
      errors.push(new ContentError(path, undefined, `${where}${issue.message}`));
    }
  } catch (e) {
    errors.push(toContentError(path, e));
  }
  return undefined;
}

function listOrdered(files: Record<string, string>, dir: string, kind: 'dir' | 'md'): Ordered[] {
  const seen = new Set<string>();
  const out: Ordered[] = [];
  const prefix = dir === '' ? '' : `${dir}/`;
  for (const path of Object.keys(files)) {
    if (!path.startsWith(prefix)) continue;
    const rest = path.slice(prefix.length);
    const parts = rest.split('/');
    let name: string | undefined;
    if (kind === 'dir' && parts.length === 2 && parts[1] === 'module.yml') name = parts[0];
    if (kind === 'md' && parts.length === 1 && rest.endsWith('.md')) name = rest.slice(0, -3);
    if (!name || seen.has(name)) continue;
    const m = ORDERED.exec(name);
    if (!m) continue;
    seen.add(name);
    out.push({ dir: join(dir, kind === 'dir' ? name : rest), name, order: Number(m[1]), slug: name });
  }
  return out.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

/**
 * Compiles an in-memory content tree (relative posix path → text) into the manifest,
 * per-lesson content, quizzes and the search corpus. Never throws for content problems;
 * every problem is collected in `errors` with file and line.
 */
export async function compileContent(
  files: Record<string, string>,
  options: CompileOptions = {},
): Promise<CompileResult> {
  const errors: ContentError[] = [];
  const courses: Course[] = [];
  const lessons: Record<ID, LessonContent> = {};
  const quizzes: Record<ID, Quiz> = {};
  const search: SearchDoc[] = [];
  const verify: VerifyLesson[] = [];
  const courseIds = new Map<string, string>();

  const courseFiles = Object.keys(files)
    .filter((p) => basename(p) === 'course.yml')
    .sort();

  for (const courseFile of courseFiles) {
    const root = dirname(courseFile);
    const isFixture = root.split('/').includes(FIXTURES_DIR);
    const cy = yamlFile(files, courseFile, courseYmlSchema, errors);
    if (!cy) continue;

    if (basename(root) !== cy.id) {
      errors.push(new ContentError(courseFile, undefined, `"id" (${cy.id}) must equal the folder name (${basename(root)})`));
      continue;
    }
    const clash = courseIds.get(cy.id);
    if (clash) {
      errors.push(new ContentError(courseFile, undefined, `duplicate course id "${cy.id}" (also in ${clash})`));
      continue;
    }
    courseIds.set(cy.id, courseFile);

    const assetBase = `${options.assetBase ?? '/course-assets/'}${cy.id}/`;
    const mods = listOrdered(files, root, 'dir');
    const modules: Module[] = [];
    const exerciseOwner = new Map<string, string>();
    const cLessons: Record<ID, LessonContent> = {};
    const cQuizzes: Record<ID, Quiz> = {};
    const cSearch: SearchDoc[] = [];
    const cVerify: VerifyLesson[] = [];

    // Route lookup for relative .md links, built from the directory structure alone.
    const fileToRoute = new Map<string, string>();
    for (const m of mods) {
      for (const l of listOrdered(files, m.dir, 'md')) {
        fileToRoute.set(
          `${l.dir}`,
          l.name === QUIZ_FILE.replace('.md', '') ? `/c/${cy.id}/${m.slug}/quiz` : `/c/${cy.id}/${m.slug}/${l.slug}`,
        );
      }
    }

    const seenOrders = new Set<number>();
    for (const m of mods) {
      if (seenOrders.has(m.order)) {
        errors.push(new ContentError(join(m.dir, 'module.yml'), undefined, `duplicate module number ${String(m.order).padStart(2, '0')}`));
      }
      seenOrders.add(m.order);
      const my = yamlFile(files, join(m.dir, 'module.yml'), moduleYmlSchema, errors);
      if (!my) continue;
      const moduleId = `${cy.id}/${m.slug}`;

      for (const path of Object.keys(files)) {
        if (dirname(path) === m.dir && path.endsWith('.md') && !ORDERED.test(basename(path).slice(0, -3))) {
          errors.push(new ContentError(path, undefined, 'lesson files must be named NN-slug.md (e.g. 01-hello-python.md)'));
        }
      }
      const mdFiles = listOrdered(files, m.dir, 'md');
      const lessonFiles = mdFiles.filter((f) => f.name !== QUIZ_FILE.replace('.md', ''));
      const quizFile = join(m.dir, QUIZ_FILE);

      const lessonMetas: LessonMeta[] = [];
      const lessonOrders = new Set<number>();
      for (const lf of lessonFiles) {
        const path = `${lf.dir}`;
        if (lf.order === 99) {
          errors.push(new ContentError(path, undefined, 'number 99 is reserved for the module quiz (99-quiz.md)'));
          continue;
        }
        if (lessonOrders.has(lf.order)) {
          errors.push(new ContentError(path, undefined, `duplicate lesson number ${String(lf.order).padStart(2, '0')} in module`));
        }
        lessonOrders.add(lf.order);
        const lessonId = `${moduleId}/${lf.slug}`;
        try {
          const tree = parseMarkdown(files[path] as string);
          const { data: fm, body } = readFrontmatter(tree, lessonFrontmatterSchema, path);
          const dirOfLesson = dirname(path);
          const compiled = await compileBody(body, {
            file: path,
            assetBase,
            resolveLink: (href) => fileToRoute.get(resolveRelative(dirOfLesson, href)),
          });
          if (!compiled.hasRunnable && !fm.concept) {
            throw new ContentError(path, 1, 'every lesson needs at least one runnable block (set "concept: true" for a pure-concept lesson)');
          }
          for (const ex of compiled.exerciseIds) {
            const owner = exerciseOwner.get(ex);
            if (owner) throw new ContentError(path, undefined, `duplicate exercise id "${ex}" (also used in ${owner})`);
            exerciseOwner.set(ex, path);
          }
          cVerify.push({
            id: lessonId,
            file: path,
            scope: fm.scope,
            setup: compiled.setup,
            cells: compiled.blocks.flatMap((b) =>
              b.type === 'cell'
                ? [
                    {
                      id: b.cell.id,
                      line: compiled.lines[b.cell.id] ?? 0,
                      code: b.cell.code,
                      ...(compiled.expected[b.cell.id] !== undefined && { expected: compiled.expected[b.cell.id] as string }),
                    },
                  ]
                : [],
            ),
            exercises: compiled.blocks.flatMap((b) =>
              b.type === 'exercise'
                ? [
                    {
                      id: b.exercise.id,
                      line: compiled.lines[b.exercise.id] ?? 0,
                      starter: b.exercise.starter,
                      tests: b.exercise.tests,
                      ...(b.exercise.solution !== undefined && { solution: b.exercise.solution }),
                    },
                  ]
                : [],
            ),
          });
          cLessons[lessonId] = {
            id: lessonId,
            title: fm.title,
            minutes: fm.minutes,
            objectives: fm.objectives,
            scope: fm.scope,
            setup: compiled.setup,
            headings: compiled.headings,
            blocks: compiled.blocks,
          };
          lessonMetas.push({
            id: lessonId,
            slug: lf.slug,
            title: fm.title,
            order: lf.order,
            minutes: fm.minutes,
            hasRunnable: compiled.hasRunnable,
            objectives: fm.objectives,
            exercises: compiled.exerciseIds,
          });
          cSearch.push({
            id: lessonId,
            courseId: cy.id,
            courseTitle: cy.title,
            moduleTitle: my.title,
            title: fm.title,
            route: `/c/${cy.id}/${m.slug}/${lf.slug}`,
            headings: compiled.headings.map((h) => h.text).join(' '),
            text: compiled.text,
          });
        } catch (e) {
          errors.push(toContentError(path, e));
        }
      }

      if (lessonMetas.length === 0 && lessonFiles.length === 0) {
        errors.push(new ContentError(join(m.dir, 'module.yml'), undefined, 'module has no lessons'));
      }

      // The quiz is mandatory (ADR-006).
      let quizMeta: Module['quiz'] | undefined;
      if (files[quizFile] === undefined) {
        errors.push(new ContentError(m.dir, undefined, `module "${m.slug}" has no ${QUIZ_FILE} — every module must end with a quiz`));
      } else {
        try {
          const tree = parseMarkdown(files[quizFile]);
          const { data: qfm, body } = readFrontmatter(tree, quizFrontmatterSchema, quizFile);
          const fences = body.filter((n) => n.type === 'code' && n.lang === 'quiz');
          if (fences.length !== 1) {
            throw new ContentError(quizFile, undefined, `expected exactly one \`\`\`quiz fence, found ${fences.length}`);
          }
          const fence = fences[0];
          if (fence?.type !== 'code') throw new ContentError(quizFile, undefined, 'missing quiz fence');
          const questions = parseQuizYaml(fence.value, quizFile, fence.position?.start.line ?? 1);
          const quizId = `${moduleId}/99-quiz`;
          cQuizzes[quizId] = {
            id: quizId,
            title: qfm.title,
            passScore: qfm.passScore,
            shuffle: qfm.shuffle,
            questions,
          };
          quizMeta = {
            id: quizId,
            slug: 'quiz',
            title: qfm.title,
            passScore: qfm.passScore,
            questionCount: questions.length,
          };
        } catch (e) {
          errors.push(toContentError(quizFile, e));
        }
      }

      if (quizMeta) {
        modules.push({
          id: moduleId,
          courseId: cy.id,
          slug: m.slug,
          title: my.title,
          summary: my.summary,
          order: m.order,
          lessons: lessonMetas,
          quiz: quizMeta,
        });
      }
    }

    if (mods.length === 0) {
      errors.push(new ContentError(courseFile, undefined, 'course has no modules'));
    }

    if (isFixture && !options.includeFixtures) continue; // validated, but hidden from the production catalog

    Object.assign(lessons, cLessons);
    Object.assign(quizzes, cQuizzes);
    search.push(...cSearch);
    verify.push(...cVerify);

    courses.push({
      id: cy.id,
      title: cy.title,
      description: cy.description,
      level: cy.level,
      version: cy.version,
      gating: cy.gating,
      pythonPackages: cy.pythonPackages,
      minutes: modules.reduce((n, mod) => n + mod.lessons.reduce((s, l) => s + l.minutes, 0), 0),
      modules,
    });
  }

  return { manifest: { courses }, lessons, quizzes, search, verify, errors };
}
