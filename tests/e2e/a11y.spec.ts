import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { answerQuiz, loadQuiz, setTheme } from './helpers';

const pages = [
  { name: 'catalog', path: '/' },
  { name: 'course overview', path: '/c/python-basics' },
  { name: 'lesson', path: '/c/python-basics/01-getting-started/04-numbers-and-input' },
  { name: 'quiz', path: '/c/python-basics/01-getting-started/quiz' },
  { name: 'progress', path: '/progress' },
  { name: 'search', path: '/search?q=loop' },
];

for (const theme of ['light', 'dark'] as const) {
  test.describe(`axe — ${theme} theme`, () => {
    for (const p of pages) {
      test(`${p.name} has no WCAG A/AA violations`, async ({ page }) => {
        await setTheme(page, theme);
        await page.goto(p.path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expect(page.getByRole('main')).toBeVisible();
        // Let lazily loaded content (lesson JSON, editor chunk, search index) settle.
        await page.waitForLoadState('networkidle');
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        expect(
          results.violations.map(
            (v) => `${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ')}`,
          ),
        ).toEqual([]);
      });
    }

    test('quiz result view has no violations', async ({ page }) => {
      await setTheme(page, theme);
      await page.goto('/c/python-basics/01-getting-started/quiz');
      await answerQuiz(page, loadQuiz('python-basics/01-getting-started/99-quiz'), false);
      await page.getByRole('button', { name: /submit answers/i }).click();
      await expect(page.getByTestId('quiz-result')).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      expect(
        results.violations.map((v) => `${v.id}: ${v.help} ${v.nodes[0]?.target.join(' ')}`),
      ).toEqual([]);
    });
  });
}
