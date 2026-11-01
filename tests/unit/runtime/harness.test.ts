import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const driver = fileURLToPath(new URL('./driver.py', import.meta.url));

function findPython(): string | undefined {
  for (const cmd of [process.env['PYTHON'], 'python3', 'python']) {
    if (!cmd) continue;
    const r = spawnSync(cmd, ['-c', 'import sys; print(sys.version_info >= (3, 9))'], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim() === 'True') return cmd;
  }
  return undefined;
}
const python = findPython();

interface Op {
  op: 'run' | 'exercise' | 'reset';
  code?: string;
  tests?: string;
  ns?: string;
  setup?: string;
  inputs?: string[];
}
interface Out {
  res: Record<string, unknown>;
  stdout: string;
  stderr: string;
  prompts: string[];
}

function drive(ops: Op[]): Out[] {
  const r = spawnSync(python as string, ['-I', driver], { input: JSON.stringify(ops), encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`driver failed:\n${r.stderr}`);
  return JSON.parse(r.stdout) as Out[];
}
const one = (op: Op): Out => drive([op])[0] as Out;

describe.skipIf(!python)('python harness (real CPython)', () => {
  it('captures stdout and returns the last expression', () => {
    const o = one({ op: 'run', code: 'print("hi")\n1 + 2' });
    expect(o.stdout).toBe('hi\n');
    expect(o.res).toEqual({ ok: true, result: '3', error: null });
  });

  it('does not report None results', () => {
    expect(one({ op: 'run', code: 'print(1)' }).res).toMatchObject({ result: null });
  });

  it('routes errors to stderr with a user-only traceback', () => {
    const o = one({ op: 'run', code: 'def f():\n    return 1 / 0\n\nf()\n' });
    expect(o.res).toMatchObject({ ok: false, error: 'ZeroDivisionError: division by zero' });
    expect(o.stderr).toContain('Traceback (most recent call last):');
    expect(o.stderr).toContain('File "main.py", line 4');
    expect(o.stderr).toContain('return 1 / 0');
    expect(o.stderr).not.toContain('pc_harness');
  });

  it('reports syntax errors readably', () => {
    const o = one({ op: 'run', code: 'print("a"\n' });
    expect(o.res).toMatchObject({ ok: false });
    expect(String(o.res['error'])).toMatch(/^SyntaxError/);
    expect(o.stderr).toContain('SyntaxError');
  });

  it('treats SystemExit as a normal end', () => {
    expect(one({ op: 'run', code: 'print(1)\nraise SystemExit(0)' }).res).toMatchObject({ ok: true });
  });

  it('uses a fresh namespace per run unless one is named', () => {
    const [a, b] = drive([
      { op: 'run', code: 'x = 1' },
      { op: 'run', code: 'print(x)' },
    ]) as [Out, Out];
    expect(a.res).toMatchObject({ ok: true });
    expect(b.res).toMatchObject({ ok: false, error: "NameError: name 'x' is not defined" });
  });

  it('shares state in a named namespace and can reset it', () => {
    const r = drive([
      { op: 'run', code: 'x = 41', ns: 'lesson' },
      { op: 'run', code: 'x + 1', ns: 'lesson' },
      { op: 'reset', ns: 'lesson' },
      { op: 'run', code: 'x', ns: 'lesson' },
    ]);
    expect(r[1]?.res).toMatchObject({ result: '42' });
    expect(r[3]?.res).toMatchObject({ ok: false });
  });

  it('runs setup once per namespace', () => {
    const r = drive([
      { op: 'run', code: 'print(N)', setup: 'N = 7', ns: 's' },
      { op: 'run', code: 'N += 1\nprint(N)', setup: 'N = 7', ns: 's' },
    ]);
    expect(r[0]?.stdout).toBe('7\n');
    expect(r[1]?.stdout).toBe('8\n');
  });

  it('makes top-level input() awaitable and echoes prompt + answer', () => {
    const o = one({
      op: 'run',
      code: 'name = input("Name? ")\nage = int(input("Age: "))\nprint(f"{name} is {age + 1} next year")',
      inputs: ['Ada', '36'],
    });
    expect(o.prompts).toEqual(['Name? ', 'Age: ']);
    expect(o.stdout).toBe('Name? Ada\nAge: 36\nAda is 37 next year\n');
    expect(o.res).toMatchObject({ ok: true });
  });

  it('raises EOFError when the prompt is cancelled', () => {
    const o = one({ op: 'run', code: 'input("x")', inputs: [] });
    expect(o.res).toMatchObject({ ok: false, error: 'EOFError: EOF when reading a line' });
  });

  it('explains input() inside functions instead of hanging', () => {
    const o = one({ op: 'run', code: 'def ask():\n    return input("?")\n\nask()' });
    expect(o.res).toMatchObject({ ok: false });
    expect(String(o.res['error'])).toContain('top level');
  });

  it('exercise: passes with a correct solution', () => {
    const o = one({
      op: 'exercise',
      code: 'def add(a, b):\n    return a + b',
      tests: 'assert add(2, 3) == 5, "add(2, 3) should be 5"\nassert add(-1, 1) == 0',
    });
    expect(o.res).toMatchObject({ passed: true, failures: [], error: null });
  });

  it('exercise: collects every failing assertion with its message', () => {
    const o = one({
      op: 'exercise',
      code: 'def add(a, b):\n    pass',
      tests:
        'assert add(2, 3) == 5, "add(2, 3) should be 5"\nassert add(0, 0) == 0\nassert add(1, 1) == 2, "one plus one"',
    });
    const res = o.res as { passed: boolean; failures: { message: string; test: string }[] };
    expect(res.passed).toBe(false);
    expect(res.failures.map((f) => f.message)).toEqual([
      'add(2, 3) should be 5',
      'assertion failed: assert add(0, 0) == 0',
      'one plus one',
    ]);
  });

  it('exercise: reports learner errors before tests run', () => {
    const o = one({ op: 'exercise', code: 'def add(a, b)\n    return', tests: 'assert True' });
    expect(o.res).toMatchObject({ passed: false });
    expect(String((o.res as { error: string }).error)).toMatch(/SyntaxError/);
    const missing = one({ op: 'exercise', code: 'x = 1', tests: 'assert add(1, 2) == 3' });
    expect((missing.res as { failures: { message: string }[] }).failures[0]?.message).toContain('NameError');
  });

  it('exercise: runs tests in a fresh namespace each time', () => {
    const r = drive([
      { op: 'exercise', code: 'x = 1', tests: 'assert x == 1' },
      { op: 'exercise', code: 'y = 1', tests: 'assert x == 1, "x leaked"' },
    ]);
    expect(r[0]?.res).toMatchObject({ passed: true });
    expect(r[1]?.res).toMatchObject({ passed: false });
  });
});
