import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_OUTPUT_CHARS, PythonRuntime } from './client';
import type { Backend, WorkerApi, WorkerHooks, WorkerRunOutput } from './types';

interface FakeBackend extends Backend {
  terminated: boolean;
  hooks?: WorkerHooks;
  runImpl: (code: string, hooks: WorkerHooks) => Promise<Omit<WorkerRunOutput, 'stdout' | 'stderr'>>;
  loaded: string[][];
}

function makeFactory(runImpl: FakeBackend['runImpl']) {
  const backends: FakeBackend[] = [];
  const factory = (): Backend => {
    const b: FakeBackend = {
      terminated: false,
      loaded: [],
      runImpl,
      api: undefined as unknown as WorkerApi,
      terminate() {
        b.terminated = true;
      },
    };
    b.api = {
      init: (hooks) => {
        b.hooks = hooks;
        return Promise.resolve();
      },
      loadPackages: (names) => {
        b.loaded.push(names);
        return Promise.resolve();
      },
      // Like the real worker: stream through the hooks *and* return the captured text.
      run: async ({ code }) => {
        const hooks = b.hooks as WorkerHooks;
        const buf = { stdout: '', stderr: '' };
        const out = await b.runImpl(code, {
          ...hooks,
          write: (k, t) => {
            buf[k] += t;
            hooks.write(k, t);
          },
        });
        return { ...out, ...buf };
      },
      runExercise: () => Promise.resolve({ passed: true, failures: [], error: null, stdout: '', stderr: '' }),
      resetNamespace: () => Promise.resolve(),
    };
    backends.push(b);
    return b;
  };
  return { factory, backends };
}

const ok = (result: string | null = null) => ({ ok: true, result, error: null });
const never = (): Promise<never> => new Promise(() => undefined);

describe('PythonRuntime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts the worker lazily, runs code and collects output', async () => {
    const { factory, backends } = makeFactory((_code, hooks) => {
      hooks.write('stdout', 'hello\n');
      hooks.write('stderr', 'warn\n');
      return Promise.resolve(ok('42'));
    });
    const rt = new PythonRuntime(factory);
    expect(backends).toHaveLength(0);

    const seen: string[] = [];
    const res = await rt.run({ code: 'x' }, { onOutput: (k, t) => seen.push(`${k}:${t}`) });
    expect(res).toMatchObject({ status: 'ok', stdout: 'hello\n', stderr: 'warn\n', result: '42', error: null });
    expect(seen).toEqual(['stdout:hello\n', 'stderr:warn\n']);
    expect(backends).toHaveLength(1);

    await rt.run({ code: 'y' });
    expect(backends).toHaveLength(1); // the same worker is reused
    expect(rt.state.phase).toBe('idle');
  });

  it('reports a Python error from the worker', async () => {
    const { factory } = makeFactory(() => Promise.resolve({ ok: false, result: null, error: 'ValueError: boom' }));
    const res = await new PythonRuntime(factory).run({ code: 'x' });
    expect(res).toMatchObject({ status: 'error', error: 'ValueError: boom' });
  });

  it('kills an infinite loop at the timeout and recreates the worker', async () => {
    const { factory, backends } = makeFactory(() => never());
    const rt = new PythonRuntime(factory);
    const p = rt.run({ code: 'while True: pass', timeoutMs: 2000 });
    await vi.advanceTimersByTimeAsync(1999);
    expect(backends[0]?.terminated).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const res = await p;
    expect(res.status).toBe('timeout');
    expect(res.error).toMatch(/longer than 2 s/);
    expect(backends[0]?.terminated).toBe(true);

    // The next run gets a brand-new worker.
    const { factory: f2 } = makeFactory(() => Promise.resolve(ok()));
    void f2;
    const next = rt.run({ code: 'print(1)', timeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    await next;
    expect(backends).toHaveLength(2);
  });

  it('stops a run when the abort signal fires', async () => {
    const { factory, backends } = makeFactory(() => never());
    const rt = new PythonRuntime(factory);
    const ctl = new AbortController();
    const p = rt.run({ code: 'loop', signal: ctl.signal, timeoutMs: 60_000 });
    await vi.advanceTimersByTimeAsync(10);
    ctl.abort();
    const res = await p;
    expect(res).toMatchObject({ status: 'stopped', error: 'Stopped' });
    expect(backends[0]?.terminated).toBe(true);
  });

  it('does not start a job whose signal is already aborted', async () => {
    const { factory, backends } = makeFactory(() => Promise.resolve(ok()));
    const ctl = new AbortController();
    ctl.abort();
    const res = await new PythonRuntime(factory).run({ code: 'x', signal: ctl.signal });
    expect(res.status).toBe('stopped');
    expect(backends).toHaveLength(0);
  });

  it('does not count time spent waiting for input() against the budget', async () => {
    let answer: (v: string | null) => void = () => undefined;
    const { factory } = makeFactory(async (_c, hooks) => {
      const text = await hooks.input('Name? ');
      hooks.write('stdout', `hi ${text}\n`);
      return ok();
    });
    const rt = new PythonRuntime(factory);
    const prompts: string[] = [];
    const p = rt.run(
      { code: 'input()', timeoutMs: 1000 },
      {
        onInput: (prompt) => {
          prompts.push(prompt);
          return new Promise((resolve) => {
            answer = resolve;
          });
        },
      },
    );
    await vi.advanceTimersByTimeAsync(60_000); // the user thinks for a minute
    expect(prompts).toEqual(['Name? ']);
    answer('Ada');
    const res = await p;
    expect(res).toMatchObject({ status: 'ok', stdout: 'hi Ada\n' });
  });

  it('still times out after input() resumes', async () => {
    let answer: (v: string | null) => void = () => undefined;
    const { factory } = makeFactory(async (_c, hooks) => {
      await hooks.input('?');
      return never();
    });
    const rt = new PythonRuntime(factory);
    const p = rt.run(
      { code: 'x', timeoutMs: 1000 },
      { onInput: () => new Promise((resolve) => (answer = resolve)) },
    );
    await vi.advanceTimersByTimeAsync(5000);
    answer('x');
    await vi.advanceTimersByTimeAsync(1000);
    expect((await p).status).toBe('timeout');
  });

  it('answers input() with EOF when no handler is registered', async () => {
    let got: string | null | undefined;
    const { factory } = makeFactory(async (_c, hooks) => {
      got = await hooks.input('?');
      return ok();
    });
    await new PythonRuntime(factory).run({ code: 'x' });
    expect(got).toBeNull();
  });

  it('keeps partial output when killed and caps runaway output', async () => {
    const { factory } = makeFactory((_c, hooks) => {
      for (let i = 0; i < 20; i++) hooks.write('stdout', 'x'.repeat(MAX_OUTPUT_CHARS / 4));
      return never();
    });
    const p = new PythonRuntime(factory).run({ code: 'x', timeoutMs: 100 });
    await vi.advanceTimersByTimeAsync(100);
    const res = await p;
    expect(res.status).toBe('timeout');
    expect(res.stdout.length + res.stderr.length).toBeLessThanOrEqual(MAX_OUTPUT_CHARS + 40);
    expect(res.stderr).toContain('[output truncated]');
  });

  it('prefers the output returned by the worker over streamed chunks', async () => {
    // Hook messages travel on a separate port and may be delivered late or not at all.
    const { factory } = makeFactory(() => Promise.resolve(ok()));
    const rt = new PythonRuntime((): Backend => {
      const b = factory();
      return {
        ...b,
        api: { ...b.api, run: () => Promise.resolve({ ...ok(), stdout: 'from result\n', stderr: '' }) },
      };
    });
    expect((await rt.run({ code: 'x' })).stdout).toBe('from result\n');
  });

  it('reports a load failure without crashing and retries with a new worker', async () => {
    let attempt = 0;
    const backends: FakeBackend[] = [];
    const factory = (): Backend => {
      attempt += 1;
      const failing = attempt === 1;
      const b = {
        terminated: false,
        terminate() {
          b.terminated = true;
        },
        api: {
          init: () => (failing ? Promise.reject(new Error('network down')) : Promise.resolve()),
          loadPackages: () => Promise.resolve(),
          run: () => Promise.resolve({ ...ok('1'), stdout: '', stderr: '' }),
          runExercise: () => Promise.resolve({ passed: true, failures: [], error: null, stdout: '', stderr: '' }),
          resetNamespace: () => Promise.resolve(),
        },
      } as unknown as FakeBackend;
      backends.push(b);
      return b;
    };
    const rt = new PythonRuntime(factory);
    const first = await rt.run({ code: 'x' });
    expect(first).toMatchObject({ status: 'error', loadFailed: true });
    expect(first.error).toContain('network down');
    expect((await rt.run({ code: 'x' })).status).toBe('ok');
    expect(backends).toHaveLength(2);
  });

  it('loads each requested package once per worker', async () => {
    const { factory, backends } = makeFactory(() => Promise.resolve(ok()));
    const rt = new PythonRuntime(factory);
    await rt.run({ code: 'x', packages: ['numpy'] });
    await rt.run({ code: 'x', packages: ['numpy', 'pandas'] });
    expect(backends[0]?.loaded).toEqual([['numpy'], ['pandas']]);
  });

  it('serialises concurrent jobs', async () => {
    const order: string[] = [];
    const { factory } = makeFactory(async (code) => {
      order.push(`start:${code}`);
      await Promise.resolve();
      order.push(`end:${code}`);
      return ok();
    });
    const rt = new PythonRuntime(factory);
    await Promise.all([rt.run({ code: 'a' }), rt.run({ code: 'b' })]);
    expect(order).toEqual(['start:a', 'end:a', 'start:b', 'end:b']);
  });

  it('runs exercises and maps timeouts to a failed result', async () => {
    const { factory } = makeFactory(() => never());
    const { factory: ok2 } = makeFactory(() => Promise.resolve(ok()));
    const good = await new PythonRuntime(ok2).runExercise({ code: 'c', tests: 't' });
    expect(good).toMatchObject({ passed: true, status: 'ok' });

    const rt = new PythonRuntime((): Backend => {
      const b = factory();
      return { ...b, api: { ...b.api, runExercise: () => never() } };
    });
    const p = rt.runExercise({ code: 'c', tests: 't', timeoutMs: 500 });
    await vi.advanceTimersByTimeAsync(500);
    const res = await p;
    expect(res).toMatchObject({ status: 'timeout', passed: false });
    expect(res.failures[0]?.message).toMatch(/longer than/);
  });

  it('notifies subscribers of state changes', async () => {
    const { factory } = makeFactory(() => Promise.resolve(ok()));
    const rt = new PythonRuntime(factory);
    const phases: string[] = [];
    const off = rt.subscribe((s) => phases.push(s.phase));
    await rt.run({ code: 'x' });
    off();
    expect(phases).toEqual(['loading', 'running', 'idle']);
  });
});
