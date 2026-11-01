import type { ID } from '@/core/types';

/** "course/module/lesson" → "course__module__lesson.json" (flat file names for code splitting). */
export function idToFile(id: ID): string {
  return `${id.replace(/\//g, '__')}.json`;
}
