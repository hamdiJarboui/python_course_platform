import * as Comlink from 'comlink';
import type { Backend, WorkerApi, WorkerHooks } from './types';

/** Starts the Pyodide worker. Kept apart from client.ts so tests can inject a fake backend. */
export function createWorkerBackend(): Backend {
  const worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), { type: 'module' });
  const remote = Comlink.wrap<WorkerApi>(worker);
  const api: WorkerApi = {
    // Hooks contain functions, so they must cross the boundary as proxies.
    init: (hooks: WorkerHooks) => remote.init(Comlink.proxy(hooks)),
    loadPackages: (names) => remote.loadPackages(names),
    run: (req) => remote.run(req),
    runExercise: (req) => remote.runExercise(req),
    resetNamespace: (ns) => remote.resetNamespace(ns),
  };
  return {
    api,
    terminate: () => {
      remote[Comlink.releaseProxy]();
      worker.terminate();
    },
  };
}
