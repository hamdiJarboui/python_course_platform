import { describe, expect, it } from 'vitest';
import { getAllLessons } from '../../lib/content';
import { getPrevNextLesson } from '../../lib/navigation';

describe('lesson navigation', () => {
  it('chains the end of one module to the next', () => {
    const lessons = getAllLessons();
    const result = getPrevNextLesson('understanding-errors', lessons);
    expect(result.next?.moduleId).toBe('python-basics');
    expect(result.next?.order).toBe(1);
  });

  it('returns no previous lesson for the first lesson', () => {
    expect(getPrevNextLesson(getAllLessons()[0].id).previous).toBeUndefined();
  });
});
