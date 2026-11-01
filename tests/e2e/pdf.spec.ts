import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * Needs `pnpm pdf` to have run (CI does this before e2e). Asserts the contract from docs/PDF_EXPORT.md:
 * file exists, ≥ 1 page per module, bookmarks, selectable text with the course title, answer key.
 */
const dir = fileURLToPath(new URL('../../public/pdf/', import.meta.url));
const manifest = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../../src/generated/manifest.json', import.meta.url)),
    'utf8',
  ),
) as { courses: { id: string; title: string; modules: unknown[] }[] };

for (const course of manifest.courses) {
  test(`PDF for ${course.id} is complete`, async () => {
    const file = `${dir}${course.id}.pdf`;
    expect(existsSync(file), `missing ${file} — run \`pnpm pdf\``).toBe(true);

    const doc = await getDocument({ data: new Uint8Array(readFileSync(file)) }).promise;
    expect(doc.numPages).toBeGreaterThanOrEqual(course.modules.length);

    const outline = await doc.getOutline();
    expect(outline?.length ?? 0).toBeGreaterThan(0);

    const texts: string[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const content = await (await doc.getPage(n)).getTextContent();
      texts.push(content.items.map((i) => ('str' in i ? i.str : '')).join(' '));
    }
    const all = texts.join('\n');
    expect(texts[0]).toContain(course.title);
    expect(all).toContain('Answer key');
    expect(all).not.toContain('output unavailable');
    expect(readFileSync(file).byteLength).toBeLessThan(10 * 1024 * 1024);
  });

  test(`course page offers the ${course.id} PDF download`, async ({ page }) => {
    await page.goto(`/c/${course.id}`);
    await expect(page.getByTestId('pdf-download')).toBeVisible();
    const response = await page.request.get(`/pdf/${course.id}.pdf`);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('pdf');
  });
}
