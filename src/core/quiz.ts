import type { Answer, Question, Quiz, QuizResult } from './types';

/** Lowercases (unless case-sensitive), trims and collapses inner whitespace. */
export function normalizeShort(value: string, caseSensitive = false): string {
  const collapsed = value.trim().replace(/\s+/g, ' ');
  return caseSensitive ? collapsed : collapsed.toLowerCase();
}

export function isAnswered(question: Question, answer: Answer): boolean {
  switch (question.type) {
    case 'single':
      return typeof answer === 'number';
    case 'multiple':
      return Array.isArray(answer) && answer.length > 0;
    case 'boolean':
      return typeof answer === 'boolean';
    case 'short':
      return typeof answer === 'string' && answer.trim().length > 0;
  }
}

export function isCorrect(question: Question, answer: Answer): boolean {
  if (!isAnswered(question, answer)) return false;
  switch (question.type) {
    case 'single':
      return answer === question.answer;
    case 'multiple': {
      if (!Array.isArray(answer)) return false;
      const given = new Set(answer);
      const expected = new Set(question.answer);
      return given.size === expected.size && [...expected].every((i) => given.has(i));
    }
    case 'boolean':
      return answer === question.answer;
    case 'short': {
      if (typeof answer !== 'string') return false;
      const cs = question.caseSensitive ?? false;
      const given = normalizeShort(answer, cs);
      return question.answer.some((a) => normalizeShort(a, cs) === given);
    }
  }
}

/**
 * Grades a quiz. `answers[i]` belongs to `quiz.questions[i]`; missing entries count as unanswered.
 * The score is the percentage of fully correct questions (no partial credit), rounded.
 */
export function gradeQuiz(quiz: Pick<Quiz, 'questions' | 'passScore'>, answers: Answer[]): QuizResult {
  const results = quiz.questions.map((question, i) => {
    const answer = answers[i];
    return { answered: isAnswered(question, answer), correct: isCorrect(question, answer) };
  });
  const total = quiz.questions.length;
  const correctCount = results.filter((r) => r.correct).length;
  const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  return { score, correctCount, total, passed: total > 0 && score >= quiz.passScore, results };
}

/** Deterministic Fisher–Yates shuffle (mulberry32) so a quiz attempt can be reproduced in tests. */
export function shuffled<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    const a = out[i] as T;
    out[i] = out[j] as T;
    out[j] = a;
  }
  return out;
}
