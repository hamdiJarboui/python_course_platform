import type { ReactNode } from 'react';

export interface CourseConfig { id: string; title: string; description: string; version: string; modules: Array<{ id: string; order: number }>; }
export interface ModuleConfig { id: string; title: string; description: string; order: number; lessons: Array<{ id: string; order: number; title: string }>; quiz: { id: string; file: string }; }
export interface LessonFrontmatter { id: string; title: string; moduleId: string; order: number; description?: string; }
export interface Lesson { frontmatter: LessonFrontmatter; body: ReactNode; source: string; }
export type QuestionType = 'single' | 'multiple' | 'true_false' | 'short_text';
export interface QuizOption { id: string; label: string; }
export interface QuizQuestion { id: string; type: QuestionType; prompt: string; options?: QuizOption[]; correct: string[] | boolean; explanation?: string; points?: number; }
export interface Quiz { id: string; moduleId: string; title: string; passScore: number; questions: QuizQuestion[]; }
export interface QuizAttempt { attemptId: string; moduleId: string; quizId: string; answers: Record<string, string[] | boolean | string>; score: number; passed: boolean; completedAt: string; }
export interface QuizResult { attempt: QuizAttempt; questions: Array<QuizQuestion & { userAnswer?: string[] | boolean | string; correct?: boolean }>; passed: boolean; }
export interface LessonProgress { completed: boolean; completedAt?: string; lastVisitedAt: string; codeEdits?: Record<string, string>; }
export interface ModuleProgress { completed: boolean; completedAt?: string; quizAttempts: QuizAttempt[]; }
export type ThemePreference = 'light' | 'dark' | 'system';
export interface ProgressState { version: number; courseId: string; lessons: Record<string, LessonProgress>; modules: Record<string, ModuleProgress>; lastVisitedLessonId?: string; theme?: ThemePreference; storageError?: string; }
export interface ExecutableCodeBlockProps { blockId: string; code: string; language: string; status: 'idle' | 'running' | 'success' | 'error' | 'timeout'; stdout: string; stderr: string; onRun: (code: string) => void; onReset: () => void; }
export type ContentBlock = { type: 'text'; value: string } | { type: 'code'; language: string; code: string; executable: boolean; title?: string };
export interface ParsedLesson extends LessonFrontmatter { source: string; blocks: ContentBlock[]; }
export type Answer = string[] | boolean | string;
