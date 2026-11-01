/// <reference lib="webworker" />
/**
 * Dedicated worker that owns the Pyodide interpreter (ADR-002). All Python runs here, never on the
 * main thread. The main thread talks to it through Comlink (see client.ts / backend.ts).
 */
import * as Comlink from 'comlink';
import harnessSource from './pc_harness.py?raw';
import type {
  ExerciseFailure,
  OutputKind,
  WorkerApi,
  WorkerExerciseOutput,
  WorkerHooks,
  WorkerRunOutput,
} from './types';

export const PYODIDE_VERSION = '0.26.4';
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
/** Per-run cap on captured output, so a runaway print loop cannot flood the page. */
const MAX_OUTPUT_CHARS = 100_000;

interface PyProxyLike {
  toJs(options?: object): unknown;
  destroy(): void;
}
interface HarnessModule {
  set_hooks(
    write: (kind: string, text: string) => void,
    input: (prompt: string) => Promise<string | null>,
  ): void;
  run(source: string, namespace: string | undefined, setup: string): Promise<PyProxyLike>;
  run_exercise(source: string, tests: string, setup: string): Promise<PyProxyLike>;
  reset_namespace(namespace?: string): void;
}
interface Pyodide {
  loadPackage(
    names: string[],
    options?: { messageCallback?: (m: string) => void; errorCallback?: (m: string) => void },
  ): Promise<unknown>;
  FS: { writeFile(path: string, data: string): void };
  pyimport(name: string): HarnessModule;
}
interface PyodideModule {
  loadPyodide(options: { indexURL: string }): Promise<Pyodide>;
}

let pyodide: Pyodide | undefined;
let harness: HarnessModule | undefined;
let hooks: WorkerHooks | undefined;
let forwarded = 0;
const captured = { stdout: '', stderr: '' };

function resetCapture(): void {
  forwarded = 0;
  captured.stdout = '';
  captured.stderr = '';
}

function need<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`${what} is not initialised`);
  return value;
}

function toObject<T>(proxy: PyProxyLike): T {
  try {
    return proxy.toJs({ dict_converter: Object.fromEntries }) as T;
  } finally {
    proxy.destroy();
  }
}

const api: WorkerApi = {
  async init(h) {
    hooks = h;
    await h.status('Downloading Python (about 10 MB, cached afterwards)…');
    const mod = (await import(/* @vite-ignore */ `${INDEX_URL}pyodide.mjs`)) as PyodideModule;
    const py = await mod.loadPyodide({ indexURL: INDEX_URL });
    await h.status('Starting Python…');
    py.FS.writeFile('/home/pyodide/pc_harness.py', harnessSource);
    const mod2 = py.pyimport('pc_harness');
    mod2.set_hooks(
      (kind, text) => {
        if (forwarded >= MAX_OUTPUT_CHARS) return;
        const chunk = text.slice(0, MAX_OUTPUT_CHARS - forwarded);
        forwarded += chunk.length;
        captured[kind as OutputKind] += chunk;
        void hooks?.write(kind as OutputKind, chunk);
        if (forwarded >= MAX_OUTPUT_CHARS) captured.stderr += '\n[output truncated]\n';
      },
      (prompt) => need(hooks, 'hooks').input(prompt),
    );
    pyodide = py;
    harness = mod2;
  },

  async loadPackages(names) {
    const py = need(pyodide, 'Python');
    const report = (m: string): void => void hooks?.status(m);
    await py.loadPackage(names, { messageCallback: report, errorCallback: report });
  },

  async run({ code, namespace, setup }): Promise<WorkerRunOutput> {
    resetCapture();
    const raw = await need(harness, 'Python').run(code, namespace, setup ?? '');
    const out = toObject<Partial<WorkerRunOutput>>(raw);
    // Python `None` arrives as `undefined`; the client contract uses `null`.
    return {
      ok: out.ok === true,
      result: out.result ?? null,
      error: out.error ?? null,
      stdout: captured.stdout,
      stderr: captured.stderr,
    };
  },

  async runExercise({ code, tests, setup }): Promise<WorkerExerciseOutput> {
    resetCapture();
    const raw = await need(harness, 'Python').run_exercise(code, tests, setup ?? '');
    const out = toObject<{ passed: boolean; failures: ExerciseFailure[]; error?: string | null }>(
      raw,
    );
    const failures = out.failures.map((f) => ({ message: f.message, test: f.test ?? null }));
    return {
      passed: out.passed,
      failures,
      error: out.error ?? null,
      stdout: captured.stdout,
      stderr: captured.stderr,
    };
  },

  async resetNamespace(namespace) {
    need(harness, 'Python').reset_namespace(namespace);
  },
};

Comlink.expose(api);
