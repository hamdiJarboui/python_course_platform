import { createContext, useContext } from 'react';
import type { ID, LessonScope } from '@/core/types';

/** What a code cell needs to know about the lesson it lives in. */
export interface LessonRunContext {
  courseId: ID;
  lessonId: ID;
  scope: LessonScope;
  /** Hidden `python setup` code. */
  setup: string;
  /** Packages the course allows (`course.yml → pythonPackages`). */
  packages: string[];
}

const LessonRunCtx = createContext<LessonRunContext | null>(null);
export const LessonRunProvider = LessonRunCtx.Provider;

export function useLessonRun(): LessonRunContext {
  const ctx = useContext(LessonRunCtx);
  if (!ctx) throw new Error('Code cells must be rendered inside a lesson');
  return ctx;
}
