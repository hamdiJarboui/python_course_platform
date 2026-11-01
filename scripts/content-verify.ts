/**
 * `pnpm content:verify` — run every runnable block and every exercise solution in real CPython.
 *
 * Uses the browser's own harness (src/runtime/pc_harness.py), so a pass here means the example
 * behaves the same way in the page. Also checks that `text output` blocks match what the preceding
 * code prints and that exercise starter code does not already pass its tests.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { compileContent } from '../src/content/compile';
import type { VerifyLesson } from '../src/content/compile';
import { loadContentFiles } from '../src/content/node';

const root = fileURLToPath(new URL('..', import.meta.url));
const runner = `${root}scripts/verify_runner.py`;
const LESSON_TIMEOUT_MS = Number(process.env['VERIFY_TIMEOUT_MS'] ?? 60_000);

interface Problem {
  kind: string;
  id: string;
  message: string;
}

function pythonCandidates(): string[] {
  return [process.env['PYTHON'], 'python3', 'python'].filter((c): c is string => Boolean(c));
}

function runPython(cmd: string, input: string): Promise<{ code: number | null; stdout: string; stderr: string; missing: boolean }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, ['-I', runner], { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      stderr += `\nTimed out after ${LESSON_TIMEOUT_MS / 1000}s`;
    }, LESSON_TIMEOUT_MS);
    child.stdout.on('data', (d: Buffer) => (stdout += d.toString()));
    child.stderr.on('data', (d: Buffer) => (stderr += d.toString()));
    child.on('error', () => {
      clearTimeout(timer);
      resolve({ code: null, stdout, stderr, missing: true });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, missing: false });
    });
    child.stdin.end(input);
  });
}

async function verifyLesson(lesson: VerifyLesson, python: string): Promise<Problem[]> {
  const r = await runPython(python, JSON.stringify(lesson));
  if (r.code !== 0) {
    return [{ kind: 'runner', id: lesson.id, message: `Python runner failed (exit ${r.code}): ${r.stderr.trim()}` }];
  }
  return JSON.parse(r.stdout) as Problem[];
}

async function main(): Promise<void> {
  const files = await loadContentFiles(`${root}content`);
  const result = await compileContent(files, { includeFixtures: true });
  if (result.errors.length > 0) {
    console.error('content has build errors — run `pnpm content:build` first:');
    for (const e of result.errors) console.error(`  ✗ ${e.toString()}`);
    process.exit(1);
  }

  let python: string | undefined;
  for (const cmd of pythonCandidates()) {
    const probe = await runPython(cmd, '{"scope":"cell","setup":"","cells":[],"exercises":[]}');
    if (!probe.missing && probe.code === 0) {
      python = cmd;
      break;
    }
  }
  if (!python) {
    console.error('No working Python 3.9+ found. Install Python or set the PYTHON environment variable.');
    process.exit(1);
  }

  let cells = 0;
  let exercises = 0;
  let failures = 0;
  for (const lesson of result.verify) {
    const problems = await verifyLesson(lesson, python);
    cells += lesson.cells.length;
    exercises += lesson.exercises.length;
    for (const p of problems) {
      failures += 1;
      const item = [...lesson.cells, ...lesson.exercises].find((x) => x.id === p.id);
      const where = item ? `${lesson.file}:${item.line}` : lesson.file;
      console.error(`  ✗ ${where} [${p.id}]: ${p.message.replace(/\n/g, '\n      ')}`);
    }
  }

  if (failures > 0) {
    console.error(`\ncontent:verify failed: ${failures} problem(s) in ${result.verify.length} lesson(s)`);
    process.exit(1);
  }
  console.log(
    `content:verify ok — ${cells} code block(s) and ${exercises} exercise(s) in ${result.verify.length} lesson(s) ` +
      `verified with ${python}`,
  );
}

await main();
