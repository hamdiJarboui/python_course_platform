import { describe, expect, it } from 'vitest';
import {
  completeLesson,
  courseProgress,
  courseSequence,
  emptyProgress,
  isCourseComplete,
  isModuleUnlocked,
  moduleProgress,
  neighbours,
  previousQuizPending,
  recordExercise,
  recordQuizAttempt,
  resetCourse,
  resumeTarget,
  setLast,
  uncompleteLesson,
} from './progress';
import type { Course, Module } from './types';

function mod(n: number, lessons: number): Module {
  const id = `c/m${n}`;
  return {
    id,
    courseId: 'c',
    slug: `m${n}`,
    title: `Module ${n}`,
    summary: '',
    order: n,
    quiz: { id: `${id}/99-quiz`, slug: 'quiz', title: 'Quiz', passScore: 70, questionCount: 5 },
    lessons: Array.from({ length: lessons }, (_, i) => ({
      id: `${id}/l${i + 1}`,
      slug: `l${i + 1}`,
      title: `L${i + 1}`,
      order: i + 1,
      minutes: 5,
      hasRunnable: true,
      objectives: ['x'],
      exercises: [],
    })),
  };
}

function course(gating: 'none' | 'quiz' = 'none'): Course {
  return {
    id: 'c',
    title: 'C',
    description: '',
    level: 'beginner',
    version: '1.0.0',
    gating,
    pythonPackages: [],
    minutes: 30,
    modules: [mod(1, 2), mod(2, 2)],
  };
}

describe('reducers', () => {
  it('completes and uncompletes lessons immutably', () => {
    const p0 = emptyProgress();
    const p1 = completeLesson(p0, 'c', 'c/m1/l1', new Date('2026-01-01T00:00:00Z'));
    expect(p0.courses).toEqual({});
    expect(p1.courses['c']?.lessons['c/m1/l1']?.completedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(completeLesson(p1, 'c', 'c/m1/l1')).toBe(p1);
    expect(uncompleteLesson(p1, 'c', 'c/m1/l1').courses['c']?.lessons).toEqual({});
    expect(uncompleteLesson(p0, 'c', 'nope')).toBe(p0);
  });

  it('keeps best score, counts attempts and never un-passes', () => {
    let p = recordQuizAttempt(emptyProgress(), 'c', 'q', { score: 80, passed: true });
    p = recordQuizAttempt(p, 'c', 'q', { score: 40, passed: false });
    const q = p.courses['c']?.quizzes['q'];
    expect(q).toMatchObject({ best: 80, attempts: 2, passed: true });
  });

  it('records exercises and keeps a pass', () => {
    let p = recordExercise(emptyProgress(), 'c', 'ex', false);
    expect(p.courses['c']?.exercises['ex']?.passed).toBe(false);
    p = recordExercise(p, 'c', 'ex', true);
    expect(p.courses['c']?.exercises['ex']?.passed).toBe(true);
    expect(recordExercise(p, 'c', 'ex', false)).toBe(p);
  });

  it('sets the resume pointer and resets a course', () => {
    let p = setLast(emptyProgress(), 'c', 'c/m1/l1');
    expect(setLast(p, 'c', 'c/m1/l1')).toBe(p);
    p = resetCourse(p, 'c');
    expect(p.courses).toEqual({});
  });
});

describe('percentages', () => {
  it('counts lessons and quizzes equally', () => {
    const c = course();
    let p = completeLesson(emptyProgress(), 'c', 'c/m1/l1');
    expect(moduleProgress(p, c, c.modules[0] as Module)).toEqual({
      done: 1,
      total: 3,
      percent: 33,
    });
    p = recordQuizAttempt(p, 'c', 'c/m1/99-quiz', { score: 100, passed: true });
    expect(courseProgress(p, c)).toEqual({ done: 2, total: 6, percent: 33 });
  });

  it('does not count a failed quiz attempt', () => {
    const c = course();
    const p = recordQuizAttempt(emptyProgress(), 'c', 'c/m1/99-quiz', { score: 10, passed: false });
    expect(courseProgress(p, c).done).toBe(0);
  });

  it('detects a complete course', () => {
    const c = course();
    let p = emptyProgress();
    for (const m of c.modules) {
      for (const l of m.lessons) p = completeLesson(p, c.id, l.id);
      p = recordQuizAttempt(p, c.id, m.quiz.id, { score: 100, passed: true });
    }
    expect(isCourseComplete(p, c)).toBe(true);
    expect(courseProgress(p, c).percent).toBe(100);
  });
});

describe('gating', () => {
  it('never locks with gating none but nudges', () => {
    const c = course('none');
    expect(isModuleUnlocked(emptyProgress(), c, 1)).toBe(true);
    expect(previousQuizPending(emptyProgress(), c, 1)).toBe(true);
    expect(previousQuizPending(emptyProgress(), c, 0)).toBe(false);
  });

  it('locks module n+1 until module n quiz is passed with gating quiz', () => {
    const c = course('quiz');
    expect(isModuleUnlocked(emptyProgress(), c, 0)).toBe(true);
    expect(isModuleUnlocked(emptyProgress(), c, 1)).toBe(false);
    const failed = recordQuizAttempt(emptyProgress(), 'c', 'c/m1/99-quiz', {
      score: 20,
      passed: false,
    });
    expect(isModuleUnlocked(failed, c, 1)).toBe(false);
    const passed = recordQuizAttempt(failed, 'c', 'c/m1/99-quiz', { score: 90, passed: true });
    expect(isModuleUnlocked(passed, c, 1)).toBe(true);
  });
});

describe('resume and navigation', () => {
  it('lists lessons then the quiz per module', () => {
    expect(courseSequence(course()).map((t) => t.id)).toEqual([
      'c/m1/l1',
      'c/m1/l2',
      'c/m1/99-quiz',
      'c/m2/l1',
      'c/m2/l2',
      'c/m2/99-quiz',
    ]);
  });

  it('starts at the first item for a new learner', () => {
    expect(resumeTarget(emptyProgress(), course())?.id).toBe('c/m1/l1');
  });

  it('continues at the last opened item while it is unfinished', () => {
    const p = setLast(emptyProgress(), 'c', 'c/m1/l2');
    expect(resumeTarget(p, course())?.id).toBe('c/m1/l2');
  });

  it('moves on once the last item is complete', () => {
    let p = setLast(emptyProgress(), 'c', 'c/m1/l1');
    p = completeLesson(p, 'c', 'c/m1/l1');
    expect(resumeTarget(p, course())?.id).toBe('c/m1/l2');
  });

  it('skips locked modules when gating', () => {
    const c = course('quiz');
    let p = emptyProgress();
    for (const l of c.modules[0]?.lessons ?? []) p = completeLesson(p, c.id, l.id);
    // quiz of module 1 is still open and module 2 is locked.
    expect(resumeTarget(p, c)?.id).toBe('c/m1/99-quiz');
  });

  it('returns prev/next neighbours across modules', () => {
    const c = course();
    expect(neighbours(c, 'c/m1/99-quiz')).toMatchObject({
      prev: { id: 'c/m1/l2' },
      next: { id: 'c/m2/l1' },
    });
    expect(neighbours(c, 'c/m1/l1').prev).toBeUndefined();
    expect(neighbours(c, 'missing')).toEqual({});
  });
});
