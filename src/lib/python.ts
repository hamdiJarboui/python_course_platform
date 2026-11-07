export interface RunResult { blockId: string; stdout: string; stderr: string; error?: string; duration: number; }
let worker: Worker | undefined;
const pending = new Map<string, { resolve: (result: RunResult) => void; timer: number }>();
function getWorker() {
  worker ??= new Worker(new URL('../worker/pythonWorker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (event: MessageEvent<{ type: string; blockId?: string; status?: string } & Partial<RunResult>>) => {
    if (event.data.type !== 'RESULT' || !event.data.blockId) return;
    const request = pending.get(event.data.blockId);
    if (!request) return;
    window.clearTimeout(request.timer);
    pending.delete(event.data.blockId);
    request.resolve({
      blockId: event.data.blockId,
      stdout: event.data.stdout ?? '',
      stderr: event.data.stderr ?? '',
      error: event.data.error,
      duration: event.data.duration ?? 0,
    });
  };
  return worker;
}
export function runPython(code: string, blockId: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      pending.delete(blockId);
      worker?.terminate();
      worker = undefined;
      resolve({ blockId, stdout: '', stderr: '', error: 'Execution timed out after 10 seconds.', duration: 10000 });
    }, 10000);
    pending.set(blockId, { resolve, timer });
    getWorker().postMessage({ type: 'RUN', code, blockId });
  });
}
