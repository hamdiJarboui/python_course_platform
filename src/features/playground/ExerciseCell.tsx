import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { ExerciseData } from '@/core/types';
import type { ExerciseFailure } from '@/runtime';
import { useProgress } from '@/store/progress';
import { StaticCode } from './CodeCell';
import { OutputPanel } from './OutputPanel';
import { useLessonRun } from './context';
import { useCodeRunner } from './useCodeRunner';

const CodeEditor = lazy(() => import('./CodeEditor').then((m) => ({ default: m.CodeEditor })));

type Feedback =
  | { kind: 'pass' }
  | { kind: 'fail'; failures: ExerciseFailure[] }
  | { kind: 'error'; message: string };

export function ExerciseCell({ exercise }: { exercise: ExerciseData }) {
  const lesson = useLessonRun();
  const [code, setCode] = useState(exercise.starter);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const { out, check, stop, clear } = useCodeRunner();

  const solved = useProgress((s) => s.progress.courses[lesson.courseId]?.exercises[exercise.id]?.passed === true);
  const record = useProgress((s) => s.recordExercise);

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus();
  }, [feedback]);

  const doCheck = async (): Promise<void> => {
    if (out.running) return;
    setFeedback(null);
    const res = await check({ code, tests: exercise.tests, timeoutMs: exercise.timeoutMs });
    if (!res) return;
    setAttempts((n) => n + 1);
    if (res.status === 'timeout' || res.status === 'stopped' || res.loadFailed) {
      setFeedback({ kind: 'error', message: res.error ?? 'The check did not finish.' });
      return;
    }
    record(lesson.courseId, exercise.id, res.passed);
    setFeedback(res.passed ? { kind: 'pass' } : { kind: 'fail', failures: res.failures });
  };

  const canSolution = exercise.solution !== undefined && (attempts > 0 || solved);

  return (
    <section className="cell exercise" aria-label={`Exercise ${exercise.title ?? exercise.id}`} data-testid="exercise">
      <div className="cell__bar">
        <span className="cell__title exercise__label">
          <span aria-hidden="true">✎</span> Exercise{exercise.title ? `: ${exercise.title}` : ''}
          {solved && <span className="badge badge--success">✓ Passed</span>}
        </span>
        <div className="cell__actions">
          {out.running ? (
            <button type="button" className="btn btn--sm btn--danger" onClick={stop}>
              <span aria-hidden="true">■</span> Stop
            </button>
          ) : (
            <button type="button" className="btn btn--sm btn--primary" onClick={() => void doCheck()}>
              <span aria-hidden="true">✓</span> Check
            </button>
          )}
          <button
            type="button"
            className="btn btn--sm"
            disabled={code === exercise.starter && !feedback}
            onClick={() => {
              setCode(exercise.starter);
              setFeedback(null);
              clear();
            }}
          >
            <span aria-hidden="true">↺</span> Reset
          </button>
        </div>
      </div>
      <Suspense fallback={<StaticCode html={exercise.starterHtml} />}>
        <CodeEditor
          value={code}
          onChange={setCode}
          onRun={() => void doCheck()}
          label={`Python editor: exercise ${exercise.id}`}
        />
      </Suspense>

      {feedback && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          role="status"
          className={`exercise__feedback exercise__feedback--${feedback.kind === 'pass' ? 'pass' : 'fail'}`}
        >
          {feedback.kind === 'pass' && (
            <>
              <strong>✓ All tests passed — nice work!</strong>
            </>
          )}
          {feedback.kind === 'fail' && (
            <>
              <strong>✗ Not quite yet — {feedback.failures.length === 1 ? '1 test failed' : `${feedback.failures.length} tests failed`}</strong>
              <ul>
                {feedback.failures.map((f, i) => (
                  <li key={i}>{f.message}</li>
                ))}
              </ul>
            </>
          )}
          {feedback.kind === 'error' && <strong>{feedback.message}</strong>}
        </div>
      )}
      <OutputPanel out={out} label="Your program output" />

      {canSolution && (
        <div className="exercise__solution">
          <button
            type="button"
            className="btn btn--sm"
            aria-expanded={showSolution}
            onClick={() => setShowSolution((v) => !v)}
          >
            {showSolution ? 'Hide solution' : 'Show solution'}
          </button>
          {showSolution && exercise.solutionHtml && (
            <div dangerouslySetInnerHTML={{ __html: exercise.solutionHtml }} />
          )}
        </div>
      )}
    </section>
  );
}
