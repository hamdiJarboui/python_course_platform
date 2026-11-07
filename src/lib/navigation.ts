import type { ParsedLesson } from '../types';
import { getAllLessons } from './content';

export function getPrevNextLesson(lessonId: string, allLessons: ParsedLesson[] = getAllLessons()) {
  const index = allLessons.findIndex((lesson) => lesson.id === lessonId);
  return { previous: index > 0 ? allLessons[index - 1] : undefined, next: index >= 0 ? allLessons[index + 1] : undefined };
}

export const getResumeLesson = (lastVisitedLessonId?: string) => lastVisitedLessonId ? getAllLessons().find((lesson) => lesson.id === lastVisitedLessonId) : undefined;
