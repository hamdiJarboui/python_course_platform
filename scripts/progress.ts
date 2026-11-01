/** `pnpm progress` — refresh the summary table in PROGRESS.md from tasks.md (T-004). */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseTasks, renderSummary, replaceSummary } from './progress-lib';

const root = fileURLToPath(new URL('..', import.meta.url));
const tasksMd = await readFile(`${root}tasks.md`, 'utf8');
const progressMd = await readFile(`${root}PROGRESS.md`, 'utf8');

const parsed = parseTasks(tasksMd);
if (parsed.tasks.length === 0) {
  console.error(
    'No tasks found in tasks.md — is the format `- [ ] **T-001 — Title** · **A**` intact?',
  );
  process.exit(1);
}

const next = replaceSummary(progressMd, renderSummary(parsed));
if (next === progressMd) {
  console.log('progress: already up to date');
} else {
  await writeFile(`${root}PROGRESS.md`, next, 'utf8');
  const done = parsed.tasks.filter((t) => t.marker === 'x').length;
  console.log(`progress: PROGRESS.md updated — ${done}/${parsed.tasks.length} tasks done`);
}
