import { useRef, useState } from 'react';
import { useProgressStore } from '../stores/progressStore';
import type { ExecutableCodeBlockProps } from '../types';

export function PythonCodeBlock({ blockId, code, language, lessonId }: ExecutableCodeBlockProps & { lessonId: string }) {
  const saved = useProgressStore((state) => state.lessons[lessonId]?.codeEdits?.[blockId]);
  const saveEdit = useProgressStore((state) => state.setCodeEdit);
  const runnerRef = useRef<import('../lib/python').PythonRunner | null>(null);
  const [value, setValue] = useState(saved ?? code); const [status, setStatus] = useState<ExecutableCodeBlockProps['status']>('idle');
  const [stdout, setStdout] = useState(''); const [stderr, setStderr] = useState(''); const [error, setError] = useState(''); const [runtimeStatus, setRuntimeStatus] = useState('');
  async function run() {
    setStatus('running'); setError(''); setStdout(''); setStderr(''); setRuntimeStatus('Loading Python runtime…');
    try { const { pythonRunner } = await import('../lib/python'); runnerRef.current = pythonRunner; pythonRunner.onStatus = (next) => setRuntimeStatus(next === 'ready' ? 'Python ready' : next === 'loading' ? 'Loading Python runtime…' : ''); const result = await pythonRunner.run(blockId, value); setStdout(result.stdout); setStderr(result.stderr); setError(result.error ?? ''); setStatus(result.timeout ? 'timeout' : result.error ? 'error' : 'success'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); setStatus('error'); }
    finally { setRuntimeStatus(''); }
  }
  function update(value: string) { setValue(value); saveEdit(lessonId, blockId, value); setStatus('idle'); }
  function reset() { update(code); setStdout(''); setStderr(''); setError(''); runnerRef.current?.reset(); }
  return <section className="python-block" aria-label="Runnable Python code">
    <div className="python-block__bar"><span>{language.toUpperCase()} · editable</span><span className="python-block__runtime" role="status">{runtimeStatus}</span></div>
    <textarea aria-label="Python code" spellCheck={false} value={value} onChange={(event) => update(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); void run(); } }} />
    <div className="python-block__actions"><button className="button button-primary" onClick={() => void run()} disabled={status === 'running'}>{status === 'running' ? 'Running…' : 'Run code'}</button><button className="button button-quiet" onClick={reset}>Reset</button><span className="hint">Ctrl + Enter to run</span></div>
    <div className={`output output-${status}`} aria-live="polite"><div className="output__heading"><strong>Output</strong><span>{status === 'success' ? 'Finished' : status === 'error' ? 'Error' : status === 'timeout' ? 'Timed out' : ''}</span></div>{stdout && <div className="output__stdout"><span>stdout</span><pre>{stdout}</pre></div>}{stderr && <div className="output__stderr"><span>stderr</span><pre>{stderr}</pre></div>}{error && <p className="error-text">{error}</p>}{status === 'running' ? <p className="output__loading"><span className="loading-indicator" />Preparing your Python code…</p> : !stdout && !stderr && !error ? <p className="output__empty">Run the example to see its output.</p> : null}</div>
  </section>;
}
