import type { CourseConfig, ModuleConfig, ParsedLesson, Quiz, ContentBlock } from '../types';
import { courseSchema, lessonFrontmatterSchema, moduleSchema, quizSchema } from './schemas';

const courseFiles = import.meta.glob('../content/courses/python-101/course.json', { eager: true, import: 'default' }) as Record<string, unknown>;
const moduleFiles = import.meta.glob('../content/courses/python-101/*/module.json', { eager: true, import: 'default' }) as Record<string, unknown>;
const quizFiles = import.meta.glob('../content/courses/python-101/*/quiz.json', { eager: true, import: 'default' }) as Record<string, unknown>;
const lessonFiles = import.meta.glob('../content/courses/python-101/*/*.mdx', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

const course = courseSchema.parse(Object.values(courseFiles)[0]);
const modules = Object.values(moduleFiles).map((value) => moduleSchema.parse(value)).sort((a, b) => a.order - b.order) as ModuleConfig[];
const quizzes = Object.values(quizFiles).map((value) => quizSchema.parse(value)) as Quiz[];

export const getCourse = (): CourseConfig => course;
export const getModules = (): ModuleConfig[] => modules;
export const getModule = (id: string) => modules.find((module) => module.id === id);
export const getQuiz = (moduleId: string) => quizzes.find((quiz) => quiz.moduleId === moduleId);

function sourceFor(id: string) {
  return Object.entries(lessonFiles).find(([file]) => file.endsWith(`/${id}.mdx`))?.[1];
}

export function getLesson(id: string): ParsedLesson | undefined {
  const source = sourceFor(id);
  if (!source) return undefined;
  const match = source.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
  if (!match) throw new Error(`Missing frontmatter for lesson ${id}`);
  const frontmatter = lessonFrontmatterSchema.parse(JSON.parse(match[1]));
  const blocks: ContentBlock[] = [];
  const body = match[2].trim();
  const token = /```([^\s]+)(?:\s+title="([^"]+)")?\n([\s\S]*?)```/g;
  let cursor = 0;
  let found: RegExpExecArray | null;
  while ((found = token.exec(body))) {
    if (found.index > cursor) blocks.push({ type: 'text', value: body.slice(cursor, found.index).trim() });
    blocks.push({ type: 'code', language: found[1], title: found[2], code: found[3].trimEnd(), executable: found[1] === 'python-executable' });
    cursor = found.index + found[0].length;
  }
  if (cursor < body.length) blocks.push({ type: 'text', value: body.slice(cursor).trim() });
  return { ...frontmatter, source, blocks };
}

export function getAllLessons() {
  return modules.flatMap((module) => module.lessons.map((lesson) => getLesson(lesson.id)).filter((lesson): lesson is ParsedLesson => Boolean(lesson)));
}
