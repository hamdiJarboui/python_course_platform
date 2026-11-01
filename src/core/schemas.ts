import { z } from 'zod';
import type { Manifest } from './types';

const slug = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'must be lowercase letters, digits and dashes');

export const courseYmlSchema = z.object({
  id: slug,
  title: z.string().min(1),
  description: z.string().min(1),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'must be semver, e.g. 1.0.0'),
  gating: z.enum(['none', 'quiz']).default('none'),
  pythonPackages: z.array(z.string()).default([]),
});
export type CourseYml = z.infer<typeof courseYmlSchema>;

export const moduleYmlSchema = z.object({
  title: z.string().min(1),
  summary: z.string().default(''),
});
export type ModuleYml = z.infer<typeof moduleYmlSchema>;

export const lessonFrontmatterSchema = z.object({
  title: z.string().min(1),
  minutes: z.number().int().positive(),
  objectives: z.array(z.string().min(1)).min(1, 'at least one objective is required'),
  scope: z.enum(['cell', 'lesson']).default('cell'),
  /** Pure-concept lessons may skip the "at least one runnable block" rule. */
  concept: z.boolean().default(false),
});
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;

export const quizFrontmatterSchema = z.object({
  type: z.literal('quiz'),
  title: z.string().min(1),
  passScore: z.number().min(1).max(100).default(70),
  shuffle: z.boolean().default(false),
});
export type QuizFrontmatter = z.infer<typeof quizFrontmatterSchema>;

const explain = z.string().min(1, 'explain is required');
const q = z.string().min(1);

export const questionSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('single'),
      q,
      options: z.array(z.string().min(1)).min(2),
      answer: z.number().int(),
      explain,
    }),
    z.object({
      type: z.literal('multiple'),
      q,
      options: z.array(z.string().min(1)).min(2),
      answer: z.array(z.number().int()).min(1),
      explain,
    }),
    z.object({ type: z.literal('boolean'), q, answer: z.boolean(), explain }),
    z.object({
      type: z.literal('short'),
      q,
      answer: z.array(z.string().min(1)).min(1),
      caseSensitive: z.boolean().optional(),
      explain,
    }),
  ])
  .superRefine((question, ctx) => {
    if (question.type === 'single' && !inRange(question.answer, question.options.length)) {
      ctx.addIssue({
        code: 'custom',
        path: ['answer'],
        message: `answer index ${question.answer} is out of range (0..${question.options.length - 1})`,
      });
    }
    if (question.type === 'multiple') {
      const bad = question.answer.filter((a) => !inRange(a, question.options.length));
      if (bad.length > 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['answer'],
          message: `answer index ${bad.join(', ')} is out of range (0..${question.options.length - 1})`,
        });
      }
      if (new Set(question.answer).size !== question.answer.length) {
        ctx.addIssue({ code: 'custom', path: ['answer'], message: 'answer contains duplicates' });
      }
    }
  });

function inRange(n: number, length: number): boolean {
  return Number.isInteger(n) && n >= 0 && n < length;
}

export const MIN_QUIZ_QUESTIONS = 5;
export const quizQuestionsSchema = z
  .array(questionSchema)
  .min(MIN_QUIZ_QUESTIONS, `a quiz needs at least ${MIN_QUIZ_QUESTIONS} questions`);

/** Runtime validation of the generated manifest (cheap, guards against stale builds). */
const lessonMetaSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  order: z.number(),
  minutes: z.number(),
  hasRunnable: z.boolean(),
  objectives: z.array(z.string()),
  exercises: z.array(z.string()),
});
const quizMetaSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  passScore: z.number(),
  questionCount: z.number(),
});
export const manifestSchema = z.object({
  courses: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      level: z.enum(['beginner', 'intermediate', 'advanced']),
      version: z.string(),
      gating: z.enum(['none', 'quiz']),
      pythonPackages: z.array(z.string()),
      minutes: z.number(),
      modules: z.array(
        z.object({
          id: z.string(),
          courseId: z.string(),
          slug: z.string(),
          title: z.string(),
          summary: z.string(),
          order: z.number(),
          lessons: z.array(lessonMetaSchema),
          quiz: quizMetaSchema,
        }),
      ),
    }),
  ),
}) satisfies z.ZodType<Manifest>;
