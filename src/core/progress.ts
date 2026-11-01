import type {
  Course,
  CourseProgress,
  ID,
  Module,
  ProgressV1,
  QuizResult,
} from './types';

export const PROGRESS_VERSION = 1;

export function emptyProgress(): ProgressV1 {
  return { version: PROGRESS_VERSION, courses: {} };
}

export function emptyCourseProgress(): CourseProgress {
  return { lessons: {}, quizzes: {}, exercises: {} };
}

function courseOf(progress: ProgressV1, courseId: ID): CourseProgress {
  return progress.courses[courseId] ?? emptyCourseProgress();
}

function withCourse(progress: ProgressV1, courseId: ID, next: CourseProgress): ProgressV1 {
  return { ...progress, courses: { ...progress.courses, [courseId]: next } };
}

// ---------------------------------------------------------------- reducers

export function completeLesson(
  progress: ProgressV1,
  courseId: ID,
  lessonId: ID,
  now: Date = new Date(),
): ProgressV1 {
  const c = courseOf(progress, courseId);
  if (c.lessons[lessonId]) return progress;
  return withCourse(progress, courseId, {
    ...c,
    lessons: { ...c.lessons, [lessonId]: { completedAt: now.toISOString() } },
  });
}

export function uncompleteLesson(progress: ProgressV1, courseId: ID, lessonId: ID): ProgressV1 {
  const c = courseOf(progress, courseId);
  if (!c.lessons[lessonId]) return progress;
  const { [lessonId]: _removed, ...rest } = c.lessons;
  return withCourse(progress, courseId, { ...c, lessons: rest });
}

/** Keeps the best score, counts attempts, and never un-passes a quiz. */
export function recordQuizAttempt(
  progress: ProgressV1,
  courseId: ID,
  quizId: ID,
  result: Pick<QuizResult, 'score' | 'passed'>,
  now: Date = new Date(),
): ProgressV1 {
  const c = courseOf(progress, courseId);
  const prev = c.quizzes[quizId];
  return withCourse(progress, courseId, {
    ...c,
    quizzes: {
      ...c.quizzes,
      [quizId]: {
        best: Math.max(prev?.best ?? 0, result.score),
        attempts: (prev?.attempts ?? 0) + 1,
        passed: (prev?.passed ?? false) || result.passed,
        lastAt: now.toISOString(),
      },
    },
  });
}

export function recordExercise(
  progress: ProgressV1,
  courseId: ID,
  exerciseId: string,
  passed: boolean,
  now: Date = new Date(),
): ProgressV1 {
  const c = courseOf(progress, courseId);
  // A passed exercise stays passed.
  if (c.exercises[exerciseId]?.passed) return progress;
  return withCourse(progress, courseId, {
    ...c,
    exercises: { ...c.exercises, [exerciseId]: { passed, at: now.toISOString() } },
  });
}

export function setLast(progress: ProgressV1, courseId: ID, id: ID): ProgressV1 {
  const c = courseOf(progress, courseId);
  if (c.last === id) return progress;
  return withCourse(progress, courseId, { ...c, last: id });
}

export function resetCourse(progress: ProgressV1, courseId: ID): ProgressV1 {
  const { [courseId]: _removed, ...rest } = progress.courses;
  return { ...progress, courses: rest };
}

// -------------------------------------------------------------------- math

export interface Fraction {
  done: number;
  total: number;
  /** Whole percent 0..100. */
  percent: number;
}

function fraction(done: number, total: number): Fraction {
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/** Module % = (completed lessons + passed quiz) / (lessons + 1 quiz). */
export function moduleProgress(progress: ProgressV1, course: Course, mod: Module): Fraction {
  const c = courseOf(progress, course.id);
  const lessons = mod.lessons.filter((l) => c.lessons[l.id]).length;
  const quiz = c.quizzes[mod.quiz.id]?.passed ? 1 : 0;
  return fraction(lessons + quiz, mod.lessons.length + 1);
}

/** Course % = (completed lessons + passed quizzes) / (total lessons + total quizzes). */
export function courseProgress(progress: ProgressV1, course: Course): Fraction {
  let done = 0;
  let total = 0;
  for (const mod of course.modules) {
    const f = moduleProgress(progress, course, mod);
    done += f.done;
    total += f.total;
  }
  return fraction(done, total);
}

export function isLessonComplete(progress: ProgressV1, courseId: ID, lessonId: ID): boolean {
  return Boolean(progress.courses[courseId]?.lessons[lessonId]);
}

export function isQuizPassed(progress: ProgressV1, courseId: ID, quizId: ID): boolean {
  return Boolean(progress.courses[courseId]?.quizzes[quizId]?.passed);
}

export function isCourseComplete(progress: ProgressV1, course: Course): boolean {
  const f = courseProgress(progress, course);
  return f.total > 0 && f.done === f.total;
}

export function isModuleComplete(progress: ProgressV1, course: Course, mod: Module): boolean {
  const f = moduleProgress(progress, course, mod);
  return f.done === f.total;
}

// ------------------------------------------------------------------ gating

/**
 * `gating: quiz` → module n+1 stays locked until the quiz of every earlier module has been passed.
 * `gating: none` → nothing is ever locked (the UI only shows a nudge).
 */
export function isModuleUnlocked(progress: ProgressV1, course: Course, moduleIndex: number): boolean {
  if (course.gating === 'none') return true;
  for (let i = 0; i < moduleIndex; i++) {
    const prev = course.modules[i];
    if (!prev || !isQuizPassed(progress, course.id, prev.quiz.id)) return false;
  }
  return true;
}

/** True when the previous module's quiz is not passed yet (used for the soft nudge). */
export function previousQuizPending(progress: ProgressV1, course: Course, moduleIndex: number): boolean {
  const prev = course.modules[moduleIndex - 1];
  return prev !== undefined && !isQuizPassed(progress, course.id, prev.quiz.id);
}

// ------------------------------------------------------------------ resume

export interface ResumeTarget {
  kind: 'lesson' | 'quiz';
  moduleSlug: string;
  /** Lesson slug; `'quiz'` for a module quiz. */
  slug: string;
  id: ID;
}

/** Ordered list of everything learnable in a course: lessons then the module quiz, per module. */
export function courseSequence(course: Course): ResumeTarget[] {
  return course.modules.flatMap((mod) => [
    ...mod.lessons.map(
      (l): ResumeTarget => ({ kind: 'lesson', moduleSlug: mod.slug, slug: l.slug, id: l.id }),
    ),
    { kind: 'quiz', moduleSlug: mod.slug, slug: 'quiz', id: mod.quiz.id } satisfies ResumeTarget,
  ]);
}

function isDone(progress: ProgressV1, course: Course, t: ResumeTarget): boolean {
  return t.kind === 'lesson'
    ? isLessonComplete(progress, course.id, t.id)
    : isQuizPassed(progress, course.id, t.id);
}

/**
 * Where "Continue" should go: the item after the last one opened if it exists and is unfinished
 * or still the current one; otherwise the first unfinished unlocked item; otherwise the start.
 */
export function resumeTarget(progress: ProgressV1, course: Course): ResumeTarget | undefined {
  const seq = courseSequence(course);
  if (seq.length === 0) return undefined;
  const moduleIndex = new Map(course.modules.map((m, i) => [m.slug, i]));
  const unlocked = (t: ResumeTarget): boolean =>
    isModuleUnlocked(progress, course, moduleIndex.get(t.moduleSlug) ?? 0);

  const last = progress.courses[course.id]?.last;
  const lastIdx = last ? seq.findIndex((t) => t.id === last) : -1;
  if (lastIdx >= 0) {
    const current = seq[lastIdx] as ResumeTarget;
    if (!isDone(progress, course, current) && unlocked(current)) return current;
    const next = seq.slice(lastIdx + 1).find((t) => !isDone(progress, course, t) && unlocked(t));
    if (next) return next;
  }
  return seq.find((t) => !isDone(progress, course, t) && unlocked(t)) ?? seq[0];
}

export interface Neighbours {
  prev?: ResumeTarget;
  next?: ResumeTarget;
}

export function neighbours(course: Course, id: ID): Neighbours {
  const seq = courseSequence(course);
  const i = seq.findIndex((t) => t.id === id);
  if (i < 0) return {};
  return { prev: seq[i - 1], next: seq[i + 1] };
}
