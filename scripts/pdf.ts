/**
 * `pnpm pdf [course-id …]` — generate public/pdf/<course>.pdf (docs/PDF_EXPORT.md, ADR-004).
 *
 * 1. `vite preview` serves the production build (build it first with `pnpm build`).
 * 2. Chromium opens /print/<course>; every runnable cell executes in real Pyodide.
 * 3. Once `window.__PRINT_READY__` is true, the page is printed to A4 with bookmarks, header and page numbers.
 *
 * Env: PW_CHANNEL (e.g. "chrome" to use an installed Chrome), PDF_TIMEOUT_MS (default 180000), BASE_PATH.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { preview } from 'vite';
import type { PdfManifest } from '../src/features/pdf/PdfDownload';
import type { Manifest } from '../src/core/types';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = `${root}public/pdf`;
const distDir = `${root}dist`;
const timeoutMs = Number(process.env['PDF_TIMEOUT_MS'] ?? 180_000);
const base = (process.env['BASE_PATH'] ?? '/').replace(/\/?$/, '/');

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function main(): Promise<void> {
  if (!existsSync(`${distDir}/index.html`)) {
    console.log('dist/ not found — running `pnpm build` first…');
    const r = spawnSync('pnpm', ['build'], { cwd: root, stdio: 'inherit', shell: true });
    if (r.status !== 0) throw new Error('pnpm build failed');
  }

  const manifest = JSON.parse(
    await readFile(`${root}src/generated/manifest.json`, 'utf8'),
  ) as Manifest;
  const wanted = process.argv.slice(2);
  const courses = manifest.courses.filter((c) => wanted.length === 0 || wanted.includes(c.id));
  if (courses.length === 0)
    throw new Error(`No matching course (${wanted.join(', ') || 'none in manifest'})`);

  await mkdir(outDir, { recursive: true });
  let existing: PdfManifest = {};
  try {
    existing = JSON.parse(await readFile(`${outDir}/manifest.json`, 'utf8')) as PdfManifest;
  } catch {
    /* first run */
  }

  const server = await preview({
    root,
    base,
    preview: { port: 0, strictPort: false, host: '127.0.0.1' },
    logLevel: 'error',
  });
  const address = server.httpServer.address();
  if (!address || typeof address === 'string') throw new Error('preview server did not start');
  const origin = `http://127.0.0.1:${address.port}`;

  const channel = process.env['PW_CHANNEL'];
  const browser = await chromium.launch(channel ? { channel } : {});
  try {
    for (const course of courses) {
      const started = Date.now();
      const context = await browser.newContext({
        viewport: { width: 1000, height: 1400 },
        serviceWorkers: 'block',
      });
      const page = await context.newPage();
      page.on('pageerror', (e) => console.error(`  [page error] ${e.message}`));
      await page.goto(`${origin}${base}print/${course.id}?print=1`);
      process.stdout.write(`• ${course.title}: running code cells… `);
      await page.waitForFunction(() => window.__PRINT_READY__ === true, undefined, {
        timeout: timeoutMs,
      });
      const warnings = await page.locator('.print-warning').count();

      const file = `${course.id}.pdf`;
      await page.pdf({
        path: `${outDir}/${file}`,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
        displayHeaderFooter: true,
        outline: true,
        tagged: true,
        headerTemplate: `<div style="font-size:8px;width:100%;padding:0 16mm;color:#566176;font-family:sans-serif">${esc(course.title)}</div>`,
        footerTemplate:
          '<div style="font-size:8px;width:100%;padding:0 16mm;text-align:right;color:#566176;font-family:sans-serif">' +
          'page <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      });
      await context.close();

      const bytes = (await stat(`${outDir}/${file}`)).size;
      const pages = (await PDFDocument.load(await readFile(`${outDir}/${file}`))).getPageCount();
      existing[course.id] = {
        file,
        bytes,
        version: course.version,
        generatedAt: new Date().toISOString(),
        pages,
      };
      console.log(
        `${pages} pages, ${(bytes / 1024).toFixed(0)} KB, ${((Date.now() - started) / 1000).toFixed(1)} s` +
          (warnings > 0 ? `  ⚠ ${warnings} cell(s) without output` : ''),
      );
    }
  } finally {
    await browser.close();
    await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
  }

  await writeFile(`${outDir}/manifest.json`, JSON.stringify(existing, null, 2));
  console.log(`pdf ok → ${outDir}`);
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
