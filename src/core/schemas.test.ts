import { describe, expect, it } from 'vitest';
import {
  courseYmlSchema,
  lessonFrontmatterSchema,
  questionSchema,
  quizQuestionsSchema,
} from './schemas';
import { resolveTheme, nextThemeMode, parseThemeMode } from './theme';

describe('courseYmlSchema', () => {
  const base = {
    id: 'python-basics',
    title: 'T',
    description: 'D',
    level: 'beginner',
    version: '1.0.0',
  };
  it('applies defaults', () => {
    expect(courseYmlSchema.parse(base)).toMatchObject({ gating: 'none', pythonPackages: [] });
  });
  it('rejects a bad id and bad version', () => {
    expect(courseYmlSchema.safeParse({ ...base, id: 'Bad Id' }).success).toBe(false);
    expect(courseYmlSchema.safeParse({ ...base, version: '1' }).success).toBe(false);
  });
});

describe('lessonFrontmatterSchema', () => {
  it('requires at least one objective', () => {
    expect(lessonFrontmatterSchema.safeParse({ title: 'x', minutes: 5, objectives: [] }).success).toBe(false);
    expect(
      lessonFrontmatterSchema.parse({ title: 'x', minutes: 5, objectives: ['a'] }),
    ).toMatchObject({ scope: 'cell', concept: false });
  });
});

describe('questionSchema', () => {
  it('rejects an out-of-range single answer', () => {
    const r = questionSchema.safeParse({ type: 'single', q: 'q', options: ['a', 'b'], answer: 2, explain: 'e' });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toContain('out of range');
  });
  it('rejects out-of-range or duplicate multiple answers', () => {
    expect(
      questionSchema.safeParse({ type: 'multiple', q: 'q', options: ['a', 'b'], answer: [0, 5], explain: 'e' }).success,
    ).toBe(false);
    expect(
      questionSchema.safeParse({ type: 'multiple', q: 'q', options: ['a', 'b'], answer: [0, 0], explain: 'e' }).success,
    ).toBe(false);
  });
  it('requires explain', () => {
    expect(questionSchema.safeParse({ type: 'boolean', q: 'q', answer: true }).success).toBe(false);
  });
  it('requires at least five questions', () => {
    const q = { type: 'boolean', q: 'q', answer: true, explain: 'e' };
    expect(quizQuestionsSchema.safeParse([q, q, q, q]).success).toBe(false);
    expect(quizQuestionsSchema.safeParse([q, q, q, q, q]).success).toBe(true);
  });
});

describe('theme', () => {
  it('resolves system mode with the OS preference', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
  });
  it('parses unknown values as system and cycles modes', () => {
    expect(parseThemeMode('bogus')).toBe('system');
    expect(parseThemeMode(null)).toBe('system');
    expect(parseThemeMode('dark')).toBe('dark');
    expect(nextThemeMode('system')).toBe('light');
    expect(nextThemeMode('light')).toBe('dark');
    expect(nextThemeMode('dark')).toBe('system');
  });
});
