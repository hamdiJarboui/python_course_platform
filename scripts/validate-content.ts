import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { courseSchema, moduleSchema, quizSchema, lessonFrontmatterSchema } from '../src/lib/schemas';
const root = join(process.cwd(), 'src/content/courses/python-101');
const course = courseSchema.parse(JSON.parse(await readFile(join(root, 'course.json'), 'utf8')));
const orders = course.modules.map((module) => module.order);
if (orders.some((order, index) => order !== index + 1)) throw new Error('Course module orders must be sequential starting at 1.');
for (const { id: moduleId } of course.modules) {
  const dir = join(root, moduleId);
  const module = moduleSchema.parse(JSON.parse(await readFile(join(dir, 'module.json'), 'utf8')));
  if (module.id !== moduleId) throw new Error(`Module ID mismatch in ${moduleId}.`);
  if (module.lessons.some((lesson, index) => lesson.order !== index + 1)) throw new Error(`Lesson orders must be sequential in ${moduleId}.`);
  const quiz = quizSchema.parse(JSON.parse(await readFile(join(dir, 'quiz.json'), 'utf8')));
  if (quiz.id !== module.quiz.id || quiz.moduleId !== moduleId) throw new Error(`Quiz linkage mismatch in ${moduleId}.`);
  if (quiz.questions.some((question) => !question.explanation)) throw new Error(`Every quiz question needs an explanation in ${moduleId}.`);
  const files = (await readdir(dir)).filter((file) => file.endsWith('.mdx'));
  const lessonIds = new Set(files.map((file) => file.replace(/\.mdx$/, '')));
  for (const lesson of module.lessons) if (!lessonIds.has(lesson.id)) throw new Error(`Missing lesson file for ${moduleId}/${lesson.id}.`);
  for (const file of files) { const raw = await readFile(join(dir, file), 'utf8'); const frontmatter = JSON.parse(raw.match(/^---\s*([\s\S]*?)\s*---/)?.[1] ?? '{}'); lessonFrontmatterSchema.parse(frontmatter); }
}
console.log('Content validation passed.');
