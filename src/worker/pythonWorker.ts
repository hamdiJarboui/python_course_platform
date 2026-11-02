interface RunMessage { type: 'RUN'; code: string; blockId: string }
type WorkerMessage = RunMessage | { type: 'RESET' };
interface PyodideAPI { runPythonAsync: (code: string) => Promise<unknown>; setStdout: (options: { batched: (text: string) => void }) => void; setStderr: (options: { batched: (text: string) => void }) => void }
const workerGlobal = globalThis as unknown as { importScripts: (...urls: string[]) => void; loadPyodide: (options: { indexURL: string }) => Promise<PyodideAPI> };
const OUTPUT_LIMIT = 20_000;
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
let runtime: Promise<PyodideAPI> | undefined;
let stdout = ''; let stderr = ''; let truncated = false;
function appendOutput(current: string, text: string) {
  const remaining = OUTPUT_LIMIT - current.length;
  if (text.length > remaining) truncated = true;
  return current + text.slice(0, Math.max(0, remaining));
}
const send = (data: unknown) => self.postMessage(data);
async function getRuntime() {
  if (!runtime) {
    send({ type: 'STATUS', status: 'loading' });
    runtime = (async () => { workerGlobal.importScripts(`${PYODIDE_URL}pyodide.js`); return workerGlobal.loadPyodide({ indexURL: PYODIDE_URL }); })();
  }
  const pyodide = await runtime;
  pyodide.setStdout({ batched: (text) => { stdout = appendOutput(stdout, `${text}\n`); } });
  pyodide.setStderr({ batched: (text) => { stderr = appendOutput(stderr, `${text}\n`); } });
  send({ type: 'STATUS', status: 'ready' }); return pyodide;
}
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  if (event.data.type === 'RESET') { runtime = undefined; send({ type: 'STATUS', status: 'idle' }); return; }
  const { code, blockId } = event.data; stdout = ''; stderr = ''; truncated = false; const started = performance.now();
  try {
    const pyodide = await getRuntime();
    await pyodide.runPythonAsync(`import builtins\n_pycourse_import = builtins.__import__\ndef _pycourse_restricted_import(name, *args, **kwargs):\n    if name.split('.')[0] in {'js', 'socket', 'urllib', 'requests', 'http', 'ftplib'}:\n        raise ImportError('Network and browser APIs are disabled in this course runner')\n    return _pycourse_import(name, *args, **kwargs)\nbuiltins.__import__ = _pycourse_restricted_import\n`);
    await pyodide.runPythonAsync(code);
    send({ type: 'RESULT', blockId, stdout: stdout.slice(0, OUTPUT_LIMIT) + (truncated ? '\n[Output truncated]' : ''), stderr: stderr.slice(0, OUTPUT_LIMIT), duration: performance.now() - started });
  } catch (error) { send({ type: 'RESULT', blockId, stdout: stdout.slice(0, OUTPUT_LIMIT), stderr: stderr.slice(0, OUTPUT_LIMIT), error: error instanceof Error ? error.message : String(error), duration: performance.now() - started }); }
};
