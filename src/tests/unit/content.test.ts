import { describe, expect, it } from 'vitest';
import { getAllLessons, getCourse, getModules, getQuiz } from '../../lib/content';

describe('course content', () => {
  it('loads six ordered modules with five lessons each', () => {
    const modules = getModules();
    expect(getCourse().id).toBe('python-101');
    expect(modules).toHaveLength(6);
    expect(modules.map((module) => module.order)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(modules.every((module) => module.lessons.length > 0)).toBe(true);
    expect(modules.every((module) => module.lessons.length === 5)).toBe(true);
    expect(getAllLessons()).toHaveLength(30);
  });

  it('has a quiz for every module', () => {
    expect(getModules().every((module) => Boolean(getQuiz(module.id)))).toBe(true);
  });
});
