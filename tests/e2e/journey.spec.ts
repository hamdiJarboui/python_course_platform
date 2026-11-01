import { expect, test } from '@playwright/test';
import { answerQuiz, loadQuiz } from './helpers';

const COURSE = 'python-basics';
const MODULE = '01-getting-started';

test.describe('learner journey', () => {
  test('open course → run code → complete lesson → pass quiz → progress survives reload', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Catalog → course overview → first lesson.
    await page
      .getByTestId(`course-card-${COURSE}`)
      .getByRole('link', { name: /start course/i })
      .click();
    await expect(page).toHaveURL(new RegExp(`/c/${COURSE}$`));
    await page.getByRole('link', { name: /start the course/i }).click();
    await expect(page).toHaveURL(new RegExp(`/c/${COURSE}/${MODULE}/01-hello-python`));

    // Run the first example in real Pyodide (first run downloads Python, so allow time).
    const firstCell = page.getByTestId('cell-run').first();
    await firstCell.getByRole('button', { name: /run/i }).click();
    await expect(firstCell.getByTestId('output')).toContainText('Hello, world!', {
      timeout: 60_000,
    });

    // Mark the lesson complete; it shows in the sidebar and survives a reload.
    await page.getByRole('button', { name: /mark complete/i }).click();
    await expect(page.getByRole('button', { name: /completed/i })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: /completed/i })).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: /contents/i }).getByText('Hello, Python'),
    ).toBeVisible();

    // Pass the module quiz.
    await page.goto(`/c/${COURSE}/${MODULE}/quiz`);
    const quiz = loadQuiz(`${COURSE}/${MODULE}/99-quiz`);
    await expect(page.locator('fieldset')).toHaveCount(quiz.questions.length);
    await answerQuiz(page, quiz, true);
    await page.getByRole('button', { name: /submit answers/i }).click();
    const result = page.getByTestId('quiz-result');
    await expect(result).toContainText('You passed');
    await expect(result).toContainText('100%');

    // Progress is persisted and visible on the dashboard.
    await page.reload();
    await page.goto('/progress');
    await expect(page.getByText('1/3', { exact: false }).first()).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('pycourses:progress:v1'));
    expect(JSON.parse(stored ?? '{}')).toMatchObject({ version: 1 });
  });

  test('a failed quiz can be retried and does not count as passed', async ({ page }) => {
    await page.goto(`/c/${COURSE}/${MODULE}/quiz`);
    const quiz = loadQuiz(`${COURSE}/${MODULE}/99-quiz`);
    await answerQuiz(page, quiz, false);
    await page.getByRole('button', { name: /submit answers/i }).click();
    await expect(page.getByTestId('quiz-result')).toContainText('Not passed');
    await page.getByRole('button', { name: /try again/i }).click();
    await expect(page.getByRole('button', { name: /submit answers/i })).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('pycourses:progress:v1'));
    const quizzes = JSON.parse(stored ?? '{}').courses?.[COURSE]?.quizzes ?? {};
    expect(Object.values(quizzes)[0]).toMatchObject({ passed: false, attempts: 1 });
  });

  test('an exercise gives feedback and accepts a correct solution', async ({ page }) => {
    await page.goto(`/c/${COURSE}/${MODULE}/04-numbers-and-input`);
    const exercise = page.getByTestId('exercise');
    await exercise.getByRole('button', { name: /check/i }).click();
    await expect(exercise).toContainText(/tests? failed/i, { timeout: 60_000 });

    await exercise.getByRole('button', { name: /show solution/i }).click();
    await expect(exercise).toContainText('return (a + b) / 2');

    // Type the solution into the editor and check again.
    const editor = exercise.getByRole('textbox').first();
    await editor.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('def average(a, b):\n');
    await page.keyboard.type('return (a + b) / 2');
    await exercise.getByRole('button', { name: /check/i }).click();
    await expect(exercise).toContainText('All tests passed', { timeout: 30_000 });
  });

  test('theme choice persists across reloads without a flash', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    const toggle = page.getByRole('button', { name: /^theme:/i });
    // system → light → dark
    await toggle.click();
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('search finds lessons and "/" focuses the search box', async ({ page }) => {
    await page.goto('/');
    // The layout is a lazy route: wait for it before pressing the shortcut.
    await expect(page.getByRole('searchbox').first()).toBeVisible();
    await page.getByRole('heading', { level: 1 }).click();
    await page.keyboard.press('/');
    await expect(page.getByRole('searchbox').first()).toBeFocused();
    await page.keyboard.type('enumerate');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/search\?q=enumerate/);
    await expect(page.getByRole('link', { name: 'for Loops' })).toBeVisible();
  });

  test('unknown routes show a friendly 404', async ({ page }) => {
    await page.goto('/c/python-basics/99-nope/zzz');
    await expect(page.getByTestId('not-found')).toBeVisible();
    await page.goto('/definitely/not/here');
    await expect(page.getByTestId('not-found')).toBeVisible();
  });

  test('progress can be exported and re-imported', async ({ page }) => {
    await page.goto(`/c/${COURSE}/${MODULE}/01-hello-python`);
    await page.getByRole('button', { name: /mark complete/i }).click();
    await page.goto('/progress');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: /export progress/i }).click();
    const file = await (await download).path();
    expect(file).toBeTruthy();

    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.locator('#import-file').setInputFiles(file);
    await expect(page.getByRole('status').filter({ hasText: /imported/i })).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('pycourses:progress:v1'));
    expect(stored).toContain('01-hello-python');
  });
});
