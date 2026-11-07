import { describe, expect, it } from 'vitest';
import { isPassed, scoreQuiz } from '../../lib/quiz';

describe('quiz scoring', () => {
  const questions = [
    { id: 'single', type: 'single' as const, prompt: 'Pick one', correct: ['a'], points: 2 },
    { id: 'boolean', type: 'true_false' as const, prompt: 'True?', correct: true, points: 1 },
    { id: 'multiple', type: 'multiple' as const, prompt: 'Pick two', correct: ['a', 'b'], points: 1 },
  ];

  it('weights answers and returns a percentage', () => {
    expect(scoreQuiz({ single: ['a'], boolean: true, multiple: ['a'] }, questions)).toBe(75);
    expect(scoreQuiz({ single: ['a'], boolean: true, multiple: ['a', 'b'] }, questions)).toBe(100);
  });

  it('uses an inclusive pass boundary', () => {
    expect(isPassed(70, 70)).toBe(true);
    expect(isPassed(69, 70)).toBe(false);
  });
});
