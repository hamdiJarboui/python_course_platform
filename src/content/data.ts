/** Browser-side access to the generated content (manifest, lessons, quizzes, search index). */
import type MiniSearch from 'minisearch';
import { manifestSchema } from '@/core/schemas';
import type { Course, ID, LessonContent, LessonMeta, Manifest, Module, Quiz } from '@/core/types';
import manifestJson from '@/generated/manifest.json';
import { idToFile } from './ids';
import { loadSearchIndex } from './search';

export const manifest: Manifest = manifestSchema.parse(manifestJson);

const chunks = import.meta.glob('../generated/lessons/*.json', { import: 'default' }) as Record<
  string,
  () => Promise<unknown>
>;

async function loadChunk<T>(id: ID): Promise<T> {
  const loader = chunks[`../generated/lessons/${idToFile(id)}`];
  if (!loader) throw new Error(`Content not found: ${id}`);
  return (await loader()) as T;
}

export const loadLesson = (id: ID): Promise<LessonContent> => loadChunk<LessonContent>(id);
export const loadQuiz = (id: ID): Promise<Quiz> => loadChunk<Quiz>(id);

let searchPromise: Promise<MiniSearch> | undefined;
export function getSearchIndex(): Promise<MiniSearch> {
  searchPromise ??= import('@/generated/search-index.json').then((m) => loadSearchIndex(m.default as object));
  return searchPromise;
}

export function getCourse(id: string | undefined): Course | undefined {
  return manifest.courses.find((c) => c.id === id);
}

export function getModule(course: Course | undefined, slug: string | undefined): Module | undefined {
  return course?.modules.find((m) => m.slug === slug);
}

export function getLesson(mod: Module | undefined, slug: string | undefined): LessonMeta | undefined {
  return mod?.lessons.find((l) => l.slug === slug);
}

export function lessonPath(course: Course, mod: Module, lesson: LessonMeta): string {
  return `/c/${course.id}/${mod.slug}/${lesson.slug}`;
}

export function quizPath(course: Course, mod: Module): string {
  return `/c/${course.id}/${mod.slug}/quiz`;
}

/** Route path for a sequence target (see `courseSequence`). */
export function targetPath(courseId: ID, t: { kind: 'lesson' | 'quiz'; moduleSlug: string; slug: string }): string {
  return `/c/${courseId}/${t.moduleSlug}/${t.kind === 'quiz' ? 'quiz' : t.slug}`;
}
