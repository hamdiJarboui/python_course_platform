/**
 * Domain contract shared by the content pipeline (build time) and the UI (run time).
 * Pure types only — no React, no DOM.
 */

/** Slash-separated path id, e.g. "python-basics/01-getting-started/01-hello-python". */
export type ID = string;

export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Gating = 'none' | 'quiz';
export type LessonScope = 'cell' | 'lesson';

// ---------------------------------------------------------------- manifest

export interface LessonMeta {
  id: ID;
  /** Last path segment, used in URLs. */
  slug: string;
  title: string;
  order: number;
  minutes: number;
  hasRunnable: boolean;
  objectives: string[];
  /** Ids of exercises contained in the lesson. */
  exercises: string[];
}

export interface QuizMeta {
  id: ID;
  slug: string;
  title: string;
  passScore: number;
  questionCount: number;
}

export interface Module {
  id: ID;
  courseId: ID;
  slug: string;
  title: string;
  summary: string;
  order: number;
  lessons: LessonMeta[];
  /** REQUIRED — the build fails for a module without a quiz (ADR-006). */
  quiz: QuizMeta;
}

export interface Course {
  id: ID;
  title: string;
  description: string;
  level: Level;
  version: string;
  gating: Gating;
  pythonPackages: string[];
  minutes: number;
  modules: Module[];
}

export interface Manifest {
  courses: Course[];
}

// ----------------------------------------------------------------- quizzes

export type Question =
  | { type: 'single'; q: string; options: string[]; answer: number; explain: string }
  | { type: 'multiple'; q: string; options: string[]; answer: number[]; explain: string }
  | { type: 'boolean'; q: string; answer: boolean; explain: string }
  | { type: 'short'; q: string; answer: string[]; caseSensitive?: boolean; explain: string };

export interface Quiz {
  id: ID;
  title: string;
  /** Percent, 0..100. */
  passScore: number;
  shuffle: boolean;
  questions: Question[];
}

/** What a learner can answer, per question type. `undefined` = unanswered. */
export type Answer = number | number[] | boolean | string | undefined;

export interface QuestionResult {
  correct: boolean;
  answered: boolean;
}

export interface QuizResult {
  /** Percent, rounded. */
  score: number;
  correctCount: number;
  total: number;
  passed: boolean;
  results: QuestionResult[];
}

// ------------------------------------------------------------ lesson content

export interface Heading {
  id: string;
  text: string;
  depth: number;
}

export interface CodeCellData {
  id: string;
  kind: 'run' | 'edit';
  code: string;
  /** Syntax-highlighted `<pre>` (build time) — shown instantly and used by the print route. */
  html: string;
  title?: string;
  timeoutMs: number;
}

export interface ExerciseData {
  id: string;
  starter: string;
  starterHtml: string;
  tests: string;
  testsHtml: string;
  solution?: string;
  solutionHtml?: string;
  title?: string;
  timeoutMs: number;
}

export type LessonBlock =
  | { type: 'html'; html: string }
  | { type: 'cell'; cell: CodeCellData }
  | { type: 'exercise'; exercise: ExerciseData };

export interface LessonContent {
  id: ID;
  title: string;
  minutes: number;
  objectives: string[];
  scope: LessonScope;
  /** Invisible code run before each execution (from a `python setup` fence). */
  setup: string;
  headings: Heading[];
  blocks: LessonBlock[];
}

// ----------------------------------------------------------------- progress

export interface LessonProgress {
  completedAt: string;
}
export interface QuizProgress {
  best: number;
  attempts: number;
  passed: boolean;
  lastAt: string;
}
export interface ExerciseProgress {
  passed: boolean;
  at: string;
}
export interface CourseProgress {
  lessons: Record<ID, LessonProgress>;
  quizzes: Record<ID, QuizProgress>;
  exercises: Record<string, ExerciseProgress>;
  /** Resume pointer: the last lesson/quiz id the learner opened. */
  last?: ID;
}
export interface ProgressV1 {
  version: 1;
  courses: Record<ID, CourseProgress>;
}
