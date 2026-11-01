/** `pnpm size` — fail if the JS needed for first load exceeds the budget (PRD: < 200 KB gzipped). */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('..', import.meta.url));
const BUDGET_KB = Number(process.env['JS_BUDGET_KB'] ?? 200);

const html = await readFile(`${root}dist/index.html`, 'utf8');
// Entry script and eagerly preloaded chunks; lazy routes, the editor and Pyodide are excluded by design.
const files = new Set<string>();
for (const m of html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+\.js)"/g)) {
  files.add((m[1] as string).replace(/^.*?\/assets\//, 'assets/'));
}
if (files.size === 0) throw new Error('No scripts found in dist/index.html — run `pnpm build` first');

let total = 0;
for (const f of files) {
  const gz = gzipSync(await readFile(`${root}dist/${f}`)).length;
  total += gz;
  console.log(`  ${(gz / 1024).toFixed(1).padStart(7)} KB  ${f}`);
}
const kb = total / 1024;
console.log(`initial JS: ${kb.toFixed(1)} KB gzipped (budget ${BUDGET_KB} KB)`);
if (kb > BUDGET_KB) {
  console.error('size budget exceeded');
  process.exit(1);
}
