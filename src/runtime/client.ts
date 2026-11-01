import type {
  Backend,
  BackendFactory,
  ExerciseRequest,
  ExerciseResult,
  OutputKind,
  RunCallbacks,
  RunRequest,
  RunResult,
  RunStatus,
  RuntimeState,
  WorkerApi,
  WorkerHooks,
  WorkerOutput,
} from './types';

export const DEFAULT_TIMEOUT_MS = 10_000;
/** Output beyond this is dropped so a runaway print loop cannot freeze the page. */
export const MAX_OUTPUT_CHARS = 100_000;

interface ActiveRun {
  stdout: string;
  stderr: string;
  truncated: boolean;
  cb: RunCallbacks;
  /** Aborts when the run ends so a pending input prompt can close. */
  inputAbort: AbortController;
  pauseClock: () => void;
  resumeClock: () => void;
}

type Listener = (state: RuntimeState) => void;

/**
 * Owns the Python Web Worker: lazy start, one job at a time, hard timeout / Stop by
 * terminating and recreating the worker (an infinite loop cannot be interrupted otherwise).
 */
export class PythonRuntime {
  private backend: Backend | undefined;
  private ready: Promise<void> | undefined;
  private loadedPackages = new Set<string>();
  private queue: Promise<unknown> = Promise.resolve();
  private active: ActiveRun | undefined;
  private listeners = new Set<Listener>();
  private _state: RuntimeState = { phase: 'idle' };

  constructor(private readonly factory: BackendFactory) {}

  get state(): RuntimeState {
    return this._state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(state: RuntimeState): void {
    this._state = state;
    for (const l of this.listeners) l(state);
  }

  // ---------------------------------------------------------------- public

  run(req: RunRequest, cb: RunCallbacks = {}): Promise<RunResult> {
    return this.enqueue(req.signal, async (ctx) => {
      const out = await this.job(req, cb, ctx, (api) =>
        api.run({
          code: req.code,
          ...(req.namespace !== undefined && { namespace: req.namespace }),
          ...(req.setup !== undefined && { setup: req.setup }),
        }),
      );
      if (out.kind !== 'done') return out.result;
      const { ok, result, error, stdout, stderr } = out.value;
      return { ...out.base, stdout, stderr, status: ok ? 'ok' : 'error', result, error } satisfies RunResult;
    });
  }

  runExercise(req: ExerciseRequest, cb: RunCallbacks = {}): Promise<ExerciseResult> {
    return this.enqueue(req.signal, async (ctx) => {
      const out = await this.job(req, cb, ctx, (api) =>
        api.runExercise({
          code: req.code,
          tests: req.tests,
          ...(req.setup !== undefined && { setup: req.setup }),
        }),
      );
      if (out.kind !== 'done') {
        const r = out.result;
        return {
          status: r.status,
          passed: false,
          failures: r.error ? [{ message: r.error, test: null }] : [],
          stdout: r.stdout,
          stderr: r.stderr,
          error: r.error,
          durationMs: r.durationMs,
          ...(r.loadFailed && { loadFailed: true }),
        } satisfies ExerciseResult;
      }
      const { passed, failures, error, stdout, stderr } = out.value;
      const { result: _unused, ...base } = out.base;
      return {
        ...base,
        stdout,
        stderr,
        status: error ? 'error' : 'ok',
        passed,
        failures,
        error,
      } satisfies ExerciseResult;
    });
  }

  /** Forgets a shared namespace (the "Reset" button of lesson-scoped cells). */
  async resetNamespace(namespace?: string): Promise<void> {
    if (!this.backend) return;
    await this.backend.api.resetNamespace(namespace);
  }

  /** Kills the worker. The next run starts a fresh one. */
  dispose(): void {
    this.killBackend();
    this.setState({ phase: 'idle' });
  }

  // --------------------------------------------------------------- internals

  private enqueue<T>(signal: AbortSignal | undefined, fn: (ctx: { signal?: AbortSignal }) => Promise<T>): Promise<T> {
    const next = this.queue.then(() => fn({ ...(signal && { signal }) }));
    this.queue = next.catch(() => undefined);
    return next;
  }

  private killBackend(): void {
    this.backend?.terminate();
    this.backend = undefined;
    this.ready = undefined;
    this.loadedPackages.clear();
  }

  private hooks(): WorkerHooks {
    return {
      write: (kind: OutputKind, text: string) => {
        const run = this.active;
        if (!run) return;
        const room = MAX_OUTPUT_CHARS - run.stdout.length - run.stderr.length;
        if (room <= 0) {
          if (!run.truncated) {
            run.truncated = true;
            run.stderr += '\n[output truncated]\n';
          }
          return;
        }
        const chunk = text.length > room ? text.slice(0, room) : text;
        if (kind === 'stdout') run.stdout += chunk;
        else run.stderr += chunk;
        run.cb.onOutput?.(kind, chunk);
      },
      input: async (prompt: string) => {
        const run = this.active;
        if (!run?.cb.onInput) return null;
        run.pauseClock();
        try {
          return await run.cb.onInput(prompt, run.inputAbort.signal);
        } finally {
          run.resumeClock();
        }
      },
      status: (message: string) => {
        if (this._state.phase === 'loading') this.setState({ phase: 'loading', message });
      },
    };
  }

  private async ensureReady(packages: string[]): Promise<Backend> {
    if (!this.backend) {
      this.backend = this.factory();
      this.loadedPackages.clear();
      const api = this.backend.api;
      this.ready = api.init(this.hooks());
    }
    const backend = this.backend;
    await this.ready;
    const missing = packages.filter((p) => !this.loadedPackages.has(p));
    if (missing.length > 0) {
      await backend.api.loadPackages(missing);
      missing.forEach((p) => this.loadedPackages.add(p));
    }
    return backend;
  }

  /**
   * Runs `call` on the worker with timeout + abort handling. Resolves `done` with the worker output,
   * or `ended` with a ready-made result when the run was killed or Python failed to load.
   */
  private async job<W extends WorkerOutput>(
    req: { timeoutMs?: number; packages?: string[]; signal?: AbortSignal },
    cb: RunCallbacks,
    ctx: { signal?: AbortSignal },
    call: (api: WorkerApi) => Promise<W>,
  ): Promise<
    | { kind: 'done'; value: W; base: Omit<RunResult, 'status' | 'error'> }
    | { kind: 'ended'; result: RunResult }
  > {
    const empty = (status: RunStatus, error: string | null, extra: Partial<RunResult> = {}): RunResult => ({
      status,
      stdout: '',
      stderr: '',
      result: null,
      error,
      durationMs: 0,
      ...extra,
    });

    if (ctx.signal?.aborted) return { kind: 'ended', result: empty('stopped', 'Stopped') };

    const run: ActiveRun = {
      stdout: '',
      stderr: '',
      truncated: false,
      cb,
      inputAbort: new AbortController(),
      pauseClock: () => undefined,
      resumeClock: () => undefined,
    };

    // 1. Start / load Python (not counted against the time budget).
    this.active = run;
    this.setState({ phase: 'loading', message: this.backend ? 'Preparing…' : 'Starting Python…' });
    let backend: Backend;
    try {
      backend = await this.raceAbort(this.ensureReady(req.packages ?? []), ctx.signal);
    } catch (e) {
      this.active = undefined;
      this.killBackend();
      this.setState({ phase: 'idle' });
      if (ctx.signal?.aborted) return { kind: 'ended', result: empty('stopped', 'Stopped') };
      const message = e instanceof Error ? e.message : String(e);
      return {
        kind: 'ended',
        result: empty('error', `Could not load Python: ${message}. Check your connection and try again.`, {
          loadFailed: true,
        }),
      };
    }

    // 2. Execute with a time budget that pauses while waiting for input().
    this.setState({ phase: 'running' });
    const timeoutMs = req.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const execStart = Date.now();

    const outcome = await new Promise<
      { kind: 'value'; value: W } | { kind: 'killed'; status: 'timeout' | 'stopped' } | { kind: 'failed'; error: string }
    >((resolve) => {
      let remaining = timeoutMs;
      let armedAt = Date.now();
      let timer: ReturnType<typeof setTimeout> | undefined;
      let settled = false;

      const settle = (o: Parameters<typeof resolve>[0]): void => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        ctx.signal?.removeEventListener('abort', onAbort);
        resolve(o);
      };
      const arm = (): void => {
        armedAt = Date.now();
        timer = setTimeout(() => settle({ kind: 'killed', status: 'timeout' }), remaining);
      };
      const onAbort = (): void => settle({ kind: 'killed', status: 'stopped' });

      run.pauseClock = () => {
        if (timer) clearTimeout(timer);
        timer = undefined;
        remaining = Math.max(0, remaining - (Date.now() - armedAt));
      };
      run.resumeClock = () => {
        if (!settled) arm();
      };

      ctx.signal?.addEventListener('abort', onAbort, { once: true });
      arm();
      call(backend.api).then(
        (value) => settle({ kind: 'value', value }),
        (e: unknown) => settle({ kind: 'failed', error: e instanceof Error ? e.message : String(e) }),
      );
    });

    this.active = undefined;
    run.inputAbort.abort();
    const durationMs = Date.now() - execStart;
    const base = { stdout: run.stdout, stderr: run.stderr, result: null, durationMs } as const;

    if (outcome.kind === 'value') {
      this.setState({ phase: 'idle' });
      return { kind: 'done', value: outcome.value, base };
    }

    // Timeout, Stop, or a crashed worker: the interpreter state is unknown, so start over.
    this.killBackend();
    this.setState({ phase: 'idle' });
    if (outcome.kind === 'killed') {
      const error =
        outcome.status === 'timeout'
          ? `TimeoutError: execution took longer than ${Math.round(timeoutMs / 1000)} s and was stopped. The Python worker was restarted.`
          : 'Stopped';
      return { kind: 'ended', result: { ...base, status: outcome.status, error } };
    }
    return {
      kind: 'ended',
      result: { ...base, status: 'error', error: `Python worker crashed: ${outcome.error}` },
    };
  }

  private raceAbort<T>(p: Promise<T>, signal: AbortSignal | undefined): Promise<T> {
    if (!signal) return p;
    return new Promise<T>((resolve, reject) => {
      const onAbort = (): void => reject(new Error('aborted'));
      signal.addEventListener('abort', onAbort, { once: true });
      p.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
    });
  }
}
