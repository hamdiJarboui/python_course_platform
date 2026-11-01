import { Suspense, lazy, useState } from 'react';
import type { CodeCellData } from '@/core/types';
import { OutputPanel } from './OutputPanel';
import { useCodeRunner } from './useCodeRunner';
import { useCopy } from './useCopy';

const CodeEditor = lazy(() => import('./CodeEditor').then((m) => ({ default: m.CodeEditor })));

/** Pre-rendered, highlighted code: shown instantly and while the editor chunk loads. */
export function StaticCode({ html }: { html: string }) {
  return <div className="cell__editor" dangerouslySetInnerHTML={{ __html: html }} />;
}

interface Props {
  cell: CodeCellData;
}

export function CodeCell({ cell }: Props) {
  const editable = cell.kind === 'edit';
  const [code, setCode] = useState(cell.code);
  const { out, run, stop, clear } = useCodeRunner();
  const { copied, copy } = useCopy();
  const title = cell.title ?? (editable ? 'Try it — edit and run' : 'Example');
  const dirty = code !== cell.code;

  const doRun = (): void => {
    if (!out.running) void run({ code, timeoutMs: cell.timeoutMs });
  };

  return (
    <section className="cell" aria-label={title} data-testid={editable ? 'cell-edit' : 'cell-run'}>
      <div className="cell__bar">
        <span className="cell__title">{title}</span>
        <div className="cell__actions">
          {out.running ? (
            <button type="button" className="btn btn--sm btn--danger" onClick={stop}>
              <span aria-hidden="true">■</span> Stop
            </button>
          ) : (
            <button type="button" className="btn btn--sm btn--primary" onClick={doRun}>
              <span aria-hidden="true">▶</span> Run
            </button>
          )}
          {editable && (
            <button
              type="button"
              className="btn btn--sm"
              disabled={!dirty && !out.ran}
              onClick={() => {
                setCode(cell.code);
                clear();
              }}
            >
              <span aria-hidden="true">↺</span> Reset
            </button>
          )}
          <button type="button" className="btn btn--sm" onClick={() => void copy(code)}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      {editable ? (
        <Suspense fallback={<StaticCode html={cell.html} />}>
          <CodeEditor
            value={code}
            onChange={setCode}
            onRun={doRun}
            label={`Python editor: ${title}`}
          />
        </Suspense>
      ) : (
        <StaticCode html={cell.html} />
      )}
      <OutputPanel out={out} />
    </section>
  );
}
