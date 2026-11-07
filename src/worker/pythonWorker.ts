const cap = (value: string) => value.length > 10000 ? `${value.slice(0, 10000)}\n[Output truncated]` : value;
self.onmessage = async (event: MessageEvent<{ type: 'RUN'; code: string; blockId: string }>) => {
  const { code, blockId } = event.data;
  if (event.data.type !== 'RUN') return;
  self.postMessage({ type: 'STATUS', blockId, status: 'loading' });
  try {
    const pyodideUrl = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.mjs';
    const module = await import(/* @vite-ignore */ pyodideUrl);
    const pyodide = await module.loadPyodide();
    self.postMessage({ type: 'STATUS', blockId, status: 'ready' });
    const startedAt = performance.now();
    let stdout = ''; let stderr = '';
    pyodide.setStdout({ batched: (text: string) => { stdout += text; } });
    pyodide.setStderr({ batched: (text: string) => { stderr += text; } });
    await pyodide.runPythonAsync(code);
    self.postMessage({ type: 'RESULT', blockId, stdout: cap(stdout), stderr: cap(stderr), duration: performance.now() - startedAt });
  } catch (error) {
    self.postMessage({ type: 'STATUS', blockId, status: 'error' });
    self.postMessage({ type: 'RESULT', blockId, stdout: '', stderr: '', error: error instanceof Error ? error.message : String(error), duration: 0 });
  }
};
