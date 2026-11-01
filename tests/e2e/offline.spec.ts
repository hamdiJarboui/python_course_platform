import { expect, test } from '@playwright/test';

// Service workers are blocked by default in playwright.config.ts; this spec opts in.
test.use({ serviceWorkers: 'allow' });

test('after one visit the app and Python run offline', async ({ page, context }) => {
  test.setTimeout(180_000);
  const url = '/c/python-basics/01-getting-started/01-hello-python';
  await page.goto(url);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // Reload so the worker controls the page, then warm the Pyodide cache with a real run.
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const cell = page.getByTestId('cell-run').first();
  await cell.getByRole('button', { name: /run/i }).click();
  await expect(cell.getByTestId('output')).toContainText('Hello, world!', { timeout: 90_000 });

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  const again = page.getByTestId('cell-run').first();
  await again.getByRole('button', { name: /run/i }).click();
  await expect(again.getByTestId('output')).toContainText('Hello, world!', { timeout: 90_000 });
});
