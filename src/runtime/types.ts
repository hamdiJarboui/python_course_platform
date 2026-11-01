export type OutputKind = 'stdout' | 'stderr';

/** Why a run ended. `timeout` and `stopped` mean the worker was killed and recreated. */
export type RunStatus = 'ok' | 'error' | 'timeout' | 'stopped';

export interface RunCallbacks {
  /** Called as output is produced (also available in the final result). */
  onOutput?: (kind: OutputKind, text: string) => void;
  /**
   * Called when the program calls `input()`. Resolve with the text, or `null` to signal EOF.
   * `signal` aborts when the run is killed so the prompt can be dismissed.
   */
  onInput?: (prompt: string, signal: AbortSignal) => Promise<string | null>;
}

export interface RunRequest {
  code: string;
  /** Execution time budget (time spent waiting for `input()` is not counted). Default 10 s. */
  timeoutMs?: number;
  /** Cells sharing a namespace id behave like a notebook; omit for a fresh namespace per run. */
  namespace?: string;
  /** Hidden code executed before `code` (once per namespace). */
  setup?: string;
  /** Pyodide packages to load first; the caller passes only what the course allows. */
  packages?: string[];
  /** Aborting kills the run and restarts the worker. */
  signal?: AbortSignal;
}

export interface ExerciseRequest {
  code: string;
  tests: string;
  timeoutMs?: number;
  setup?: string;
  packages?: string[];
  signal?: AbortSignal;
}

export interface RunResult {
  status: RunStatus;
  stdout: string;
  stderr: string;
  /** `repr()` of a trailing expression, if any. */
  result: string | null;
  /** One-line error summary (`ValueError: ...`, timeout message, load failure). */
  error: string | null;
  durationMs: number;
  /** True when Python itself could not be loaded (offline, blocked CDN). */
  loadFailed?: boolean;
}

export interface ExerciseFailure {
  message: string;
  /** The failing test statement, if known. */
  test: string | null;
}

export interface ExerciseResult {
  status: RunStatus;
  passed: boolean;
  failures: ExerciseFailure[];
  stdout: string;
  stderr: string;
  error: string | null;
  durationMs: number;
  loadFailed?: boolean;
}

export interface RuntimeState {
  phase: 'idle' | 'loading' | 'running';
  /** Human-readable progress, e.g. "Downloading Python…". */
  message?: string;
}

// ------------------------------------------------------------ worker contract

export interface WorkerHooks {
  write(kind: OutputKind, text: string): void;
  input(prompt: string): Promise<string | null>;
  status(message: string): void;
}

/**
 * Output is returned in the result as well as streamed through `hooks.write`: the hooks travel over
 * a separate MessagePort, so a streamed chunk can arrive after the result. The returned text is
 * authoritative; streaming only powers live display and partial output when a run is killed.
 */
export interface WorkerOutput {
  stdout: string;
  stderr: string;
}

export interface WorkerRunOutput extends WorkerOutput {
  ok: boolean;
  result: string | null;
  error: string | null;
}

export interface WorkerExerciseOutput extends WorkerOutput {
  passed: boolean;
  failures: ExerciseFailure[];
  error: string | null;
}

export interface WorkerApi {
  init(hooks: WorkerHooks): Promise<void>;
  loadPackages(names: string[]): Promise<void>;
  run(req: { code: string; namespace?: string; setup?: string }): Promise<WorkerRunOutput>;
  runExercise(req: { code: string; tests: string; setup?: string }): Promise<WorkerExerciseOutput>;
  resetNamespace(namespace?: string): Promise<void>;
}

export interface Backend {
  api: WorkerApi;
  terminate(): void;
}
export type BackendFactory = () => Backend;
