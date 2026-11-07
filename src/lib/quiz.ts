import type { Answer, QuizQuestion } from '../types';
export function answersEqual(actual: Answer | undefined, correct: string[] | boolean): boolean {
  if (actual === undefined) return false;
  if (typeof correct === 'boolean') return actual === correct;
  if (typeof actual === 'string') return correct.some((value) => value.toLowerCase() === actual.trim().toLowerCase());
  return Array.isArray(actual) && actual.length === correct.length && actual.every((value) => correct.includes(value));
}
export function scoreQuiz(answers: Record<string, Answer>, questions: QuizQuestion[]) {
  const total = questions.reduce((sum, question) => sum + (question.points ?? 1), 0);
  const earned = questions.reduce((sum, question) => sum + (answersEqual(answers[question.id], question.correct) ? (question.points ?? 1) : 0), 0);
  return total ? Math.round((earned / total) * 100) : 0;
}
export const isPassed = (score: number, passScore: number) => score >= passScore;
