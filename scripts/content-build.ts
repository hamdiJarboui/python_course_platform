/**
 * `pnpm content:build` — validate `content/` and emit `src/generated/**`.
 * Exits non-zero (with file:line messages) on any authoring error.
 */
import { fileURLToPath } from 'node:url';
import { buildContent } from '../src/content/node';

const root = fileURLToPath(new URL('..', import.meta.url));
const base = process.env['BASE_PATH'] ?? '/';

const summary = await buildContent(
  {
    contentDir: `${root}content`,
    outDir: `${root}src/generated`,
    publicDir: `${root}public`,
  },
  {
    includeFixtures: process.env['INCLUDE_FIXTURES'] === '1',
    assetBase: `${base.endsWith('/') ? base : `${base}/`}course-assets/`,
  },
);

if (summary.errors.length > 0) {
  console.error(`\ncontent:build failed with ${summary.errors.length} error(s):\n`);
  for (const e of summary.errors) console.error(`  ✗ ${e.toString()}`);
  console.error('');
  process.exit(1);
}

const lessons = Object.keys(summary.lessons).length;
console.log(
  `content:build ok — ${summary.manifest.courses.length} course(s), ${lessons} lesson(s), ` +
    `${Object.keys(summary.quizzes).length} quiz(zes) from ${summary.files} files`,
);
