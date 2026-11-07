import { z } from 'zod';

export const courseSchema = z.object({ id: z.string(), title: z.string(), description: z.string(), version: z.string(), modules: z.array(z.object({ id: z.string(), order: z.number().int() })) });
export const moduleSchema = z.object({ id: z.string(), title: z.string(), description: z.string(), order: z.number().int(), lessons: z.array(z.object({ id: z.string(), order: z.number().int(), title: z.string() })), quiz: z.object({ id: z.string(), file: z.string() }) });
export const lessonFrontmatterSchema = z.object({ id: z.string(), title: z.string(), moduleId: z.string(), order: z.number().int(), description: z.string().optional() });
export const quizSchema = z.object({ id: z.string(), moduleId: z.string(), title: z.string(), passScore: z.number().min(0).max(100), questions: z.array(z.object({ id: z.string(), type: z.enum(['single', 'multiple', 'true_false', 'short_text']), prompt: z.string(), options: z.array(z.object({ id: z.string(), label: z.string() })).optional(), correct: z.union([z.array(z.string()), z.boolean()]), explanation: z.string().optional(), points: z.number().positive().optional() })) });
