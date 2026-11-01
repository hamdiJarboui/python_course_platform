import { useSyncExternalStore } from 'react';
import { runtime } from '@/runtime';
import type { RunStatus, RuntimeState } from '@/runtime';

export interface OutputState {
  running: boolean;
  ran: boolean;
  stdout: string;
  stderr: string;
  result: string | null;
  error: string | null;
  status?: RunStatus;
  durationMs?: number;
}

export const EMPTY_OUTPUT: OutputState = {
  running: false,
  ran: false,
  stdout: '',
  stderr: '',
  result: null,
  error: null,
};

export function useRuntimeState(): RuntimeState {
  return useSyncExternalStore(
    (cb) => runtime.subscribe(cb),
    () => runtime.state,
  );
}

interface PanelProps {
  out: OutputState;
  label?: string;
  /** Hide status notes (timeout / load failure) the caller already shows elsewhere, and an empty panel. */
  quiet?: boolean;
}

/** stdout neutral, stderr danger, result info; announced politely to screen readers. */
export function OutputPanel({ out, label = 'Output', quiet = false }: PanelProps) {
  const rt = useRuntimeState();
  const hasText = out.stdout !== '' || out.stderr !== '' || out.result !== null;
  // A timeout / stop message that Python itself did not print.
  const note = !quiet && (out.status === 'timeout' || out.status === 'stopped') ? out.error : null;
  const loadError =
    !quiet && out.status === 'error' && out.stderr === '' && out.stdout === '' ? out.error : null;

  if (!out.ran && !out.running) return null;
  if (quiet && !out.running && !hasText) return null;
  return (
    <div className="cell__output" aria-live="polite" role="region" aria-label={label} data-testid="output">
      <span className="cell__output-label">{label}</span>
      {out.running && (
        <p className="out-status">
          <span className="spinner" aria-hidden="true" />
          {rt.phase === 'loading' ? (rt.message ?? 'Starting Python…') : 'Running…'}
        </p>
      )}
      {out.stdout !== '' && <pre className="out-stdout">{out.stdout}</pre>}
      {out.stderr !== '' && <pre className="out-stderr">{out.stderr}</pre>}
      {out.result !== null && <pre className="out-result">{`→ ${out.result}`}</pre>}
      {note && <p className="out-stderr">{note}</p>}
      {loadError && <p className="out-stderr">{loadError}</p>}
      {!out.running && out.ran && !hasText && !note && !loadError && <p className="out-empty">(no output)</p>}
    </div>
  );
}
