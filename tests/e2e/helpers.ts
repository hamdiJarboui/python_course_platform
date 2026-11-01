import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Locator, Page } from '@playwright/test';

export interface QuizQuestion {
  type: 'single' | 'multiple' | 'boolean' | 'short';
  q: string;
  answer: number | number[] | boolean | string[];
}
export interface QuizJson {
  title: string;
  passScore: number;
  questions: QuizQuestion[];
}

export function loadQuiz(id: string): QuizJson {
  const file = fileURLToPath(
    new URL(`../../src/generated/lessons/${id.replace(/\//g, '__')}.json`, import.meta.url),
  );
  return JSON.parse(readFileSync(file, 'utf8')) as QuizJson;
}

/** Question text as rendered (inline code backticks are removed by the quiz UI). */
const plain = (s: string): string => s.replace(/`/g, '');

function fieldsetFor(page: Page, q: QuizQuestion): Locator {
  // The question text is unique within a quiz; `has` avoids partial matches between similar questions.
  return page
    .locator('fieldset')
    .filter({ has: page.getByText(plain(q.q), { exact: false }) })
    .first();
}

/** Answers every question correctly (or deliberately wrong when `correct` is false). */
export async function answerQuiz(page: Page, quiz: QuizJson, correct = true): Promise<void> {
  for (const q of quiz.questions) {
    const box = fieldsetFor(page, q);
    switch (q.type) {
      case 'single': {
        const target = correct ? (q.answer as number) : ((q.answer as number) + 1) % 2;
        await box.getByRole('radio').nth(target).check();
        break;
      }
      case 'multiple': {
        const answers = q.answer as number[];
        const boxes = box.getByRole('checkbox');
        const total = await boxes.count();
        const chosen = correct
          ? answers
          : [[...Array(total).keys()].find((i) => !answers.includes(i)) ?? 0];
        for (const i of chosen) await boxes.nth(i).check();
        break;
      }
      case 'boolean': {
        const value = correct ? (q.answer as boolean) : !(q.answer as boolean);
        await box
          .getByRole('radio')
          .nth(value ? 0 : 1)
          .check();
        break;
      }
      case 'short':
        await box
          .getByRole('textbox')
          .fill(correct ? ((q.answer as string[])[0] ?? '') : 'definitely wrong');
        break;
    }
  }
}

export async function setTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('pycourses:theme', t);
    } catch {
      /* ignore */
    }
  }, theme);
}
