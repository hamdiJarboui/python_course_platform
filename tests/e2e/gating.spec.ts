import { expect, test } from '@playwright/test';
import { answerQuiz, loadQuiz } from './helpers';

// python-intermediate sets `gating: quiz`: module n+1 stays locked until quiz n is passed.
const C = 'python-intermediate';

test('later modules are locked until the previous quiz is passed', async ({ page }) => {
  await page.goto(`/c/${C}/02-classes/01-classes-basics`);
  await expect(page.getByRole('heading', { name: /module is locked/i })).toBeVisible();
  await page.goto(`/c/${C}/02-classes/quiz`);
  await expect(page.getByRole('heading', { name: /locked/i })).toBeVisible();

  await page.goto(`/c/${C}/01-data-structures/quiz`);
  await answerQuiz(page, loadQuiz(`${C}/01-data-structures/99-quiz`), true);
  await page.getByRole('button', { name: /submit answers/i }).click();
  await expect(page.getByTestId('quiz-result')).toContainText('You passed');

  await page.goto(`/c/${C}/02-classes/01-classes-basics`);
  await expect(page.getByRole('heading', { name: /module is locked/i })).toHaveCount(0);
  await expect(page.getByTestId('exercise').first()).toBeVisible();
});
