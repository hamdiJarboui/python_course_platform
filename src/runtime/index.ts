import { createWorkerBackend } from './backend';
import { PythonRuntime } from './client';

export { PythonRuntime } from './client';
export type * from './types';

/** One interpreter per tab, started lazily on the first run. */
export const runtime = new PythonRuntime(createWorkerBackend);
