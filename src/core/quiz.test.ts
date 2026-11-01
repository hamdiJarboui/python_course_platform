import { describe, expect, it } from 'vitest';
import { gradeQuiz, isCorrect, normalizeShort, shuffled } from './quiz';
import type { Question } from './types';

const single: Question = { type: 'single', q: 'q', options: ['a', 'b', 'c'], answer: 1, explain: 'e' };
const multiple: Question = {
  type: 'multiple',
  q: 'q',
  options: ['a', 'b', 'c', 'd'],
  answer: [0, 2],
  explain: 'e',
};
const bool: Question = { type: 'boolean', q: 'q', answer: false, explain: 'e' };
const short: Question = { type: 'short', q: 'q', answer: ['def', 'DEF keyword'], explain: 'e' };
const shortCs: Question = { type: 'short', q: 'q', answer: ['None'], caseSensitive: true, explain: 'e' };

describe('normalizeShort', () => {
  it('trims, collapses whitespace and lowercases by default', () => {
    expect(normalizeShort('  Hello   World ')).toBe('hello world');
  });
  it('keeps case when case-sensitive', () => {
    expect(normalizeShort(' None ', true)).toBe('None');
  });
});

describe('isCorrect', () => {
  it('grades single choice', () => {
    expect(isCorrect(single, 1)).toBe(true);
    expect(isCorrect(single, 0)).toBe(false);
    expect(isCorrect(single, undefined)).toBe(false);
  });
  it('grades multiple choice as an exact set, order-independent', () => {
    expect(isCorrect(multiple, [2, 0])).toBe(true);
    expect(isCorrect(multiple, [0])).toBe(false);
    expect(isCorrect(multiple, [0, 1, 2])).toBe(false);
    expect(isCorrect(multiple, [])).toBe(false);
  });
  it('grades booleans, including a false answer', () => {
    expect(isCorrect(bool, false)).toBe(true);
    expect(isCorrect(bool, true)).toBe(false);
    expect(isCorrect(bool, undefined)).toBe(false);
  });
  it('grades short answers with normalization and alternatives', () => {
    expect(isCorrect(short, ' DEF ')).toBe(true);
    expect(isCorrect(short, 'def  keyword')).toBe(true);
    expect(isCorrect(short, 'fn')).toBe(false);
    expect(isCorrect(short, '   ')).toBe(false);
  });
  it('honours caseSensitive', () => {
    expect(isCorrect(shortCs, 'None')).toBe(true);
    expect(isCorrect(shortCs, 'none')).toBe(false);
  });
  it('rejects answers of the wrong shape', () => {
    expect(isCorrect(single, 'b')).toBe(false);
    expect(isCorrect(multiple, 1)).toBe(false);
  });
});

describe('gradeQuiz', () => {
  const quiz = { passScore: 70, questions: [single, multiple, bool, short] };

  it('scores a perfect attempt', () => {
    const r = gradeQuiz(quiz, [1, [0, 2], false, 'def']);
    expect(r).toMatchObject({ score: 100, correctCount: 4, total: 4, passed: true });
    expect(r.results.every((x) => x.correct && x.answered)).toBe(true);
  });

  it('rounds the percentage and applies the pass threshold', () => {
    const r = gradeQuiz(quiz, [1, [0, 2], true, 'x']);
    expect(r.score).toBe(50);
    expect(r.passed).toBe(false);
    const exactly = gradeQuiz({ ...quiz, passScore: 75 }, [1, [0, 2], false, 'x']);
    expect(exactly.score).toBe(75);
    expect(exactly.passed).toBe(true);
  });

  it('treats missing answers as unanswered and wrong', () => {
    const r = gradeQuiz(quiz, [1]);
    expect(r.results[1]).toEqual({ answered: false, correct: false });
    expect(r.score).toBe(25);
  });

  it('never passes an empty quiz', () => {
    expect(gradeQuiz({ passScore: 0, questions: [] }, [])).toMatchObject({ score: 0, passed: false });
  });
});

describe('shuffled', () => {
  it('is deterministic per seed and does not mutate its input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = shuffled(input, 42);
    expect(shuffled(input, 42)).toEqual(a);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...a].sort()).toEqual(input);
  });
  it('differs between seeds', () => {
    const input = Array.from({ length: 20 }, (_, i) => i);
    expect(shuffled(input, 1)).not.toEqual(shuffled(input, 2));
  });
});
