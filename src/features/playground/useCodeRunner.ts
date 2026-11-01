import { useCallback, useEffect, useRef, useState } from 'react';
import { useRequestInput } from '@/components/InputDialog';
import { runtime } from '@/runtime';
import type { ExerciseResult } from '@/runtime';
import { EMPTY_OUTPUT } from './OutputPanel';
import type { OutputState } from './OutputPanel';
import { useLessonRun } from './context';

interface RunOptions {
  code: string;
  timeoutMs: number;
}

/** Shared by CodeCell and ExerciseCell: run / check / stop with streaming output. */
export function useCodeRunner() {
  const lesson = useLessonRun();
  const requestInput = useRequestInput();
  const [out, setOut] = useState<OutputState>(EMPTY_OUTPUT);
  const abort = useRef<AbortController | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abort.current?.abort(); // free the worker when the learner navigates away
    };
  }, []);

  const base = useCallback(() => {
    const ctl = new AbortController();
    abort.current = ctl;
    setOut({ ...EMPTY_OUTPUT, running: true, ran: true });
    return ctl;
  }, []);

  const callbacks = {
    onOutput: (kind: 'stdout' | 'stderr', text: string) => {
      if (mounted.current) setOut((o) => ({ ...o, [kind]: o[kind] + text }));
    },
    onInput: requestInput,
  };

  const run = useCallback(
    async ({ code, timeoutMs }: RunOptions): Promise<void> => {
      const ctl = base();
      const res = await runtime.run(
        {
          code,
          timeoutMs,
          signal: ctl.signal,
          packages: lesson.packages,
          ...(lesson.scope === 'lesson' && { namespace: lesson.lessonId }),
          ...(lesson.setup !== '' && { setup: lesson.setup }),
        },
        callbacks,
      );
      if (!mounted.current || abort.current !== ctl) return;
      abort.current = null;
      setOut({
        running: false,
        ran: true,
        stdout: res.stdout,
        stderr: res.stderr,
        result: res.result,
        error: res.error,
        status: res.status,
        durationMs: res.durationMs,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lesson, base],
  );

  const check = useCallback(
    async ({ code, tests, timeoutMs }: RunOptions & { tests: string }): Promise<ExerciseResult | undefined> => {
      const ctl = base();
      const res = await runtime.runExercise(
        {
          code,
          tests,
          timeoutMs,
          signal: ctl.signal,
          packages: lesson.packages,
          ...(lesson.setup !== '' && { setup: lesson.setup }),
        },
        callbacks,
      );
      if (!mounted.current || abort.current !== ctl) return undefined;
      abort.current = null;
      setOut({
        running: false,
        ran: true,
        stdout: res.stdout,
        stderr: res.stderr,
        result: null,
        error: res.error,
        status: res.status,
        durationMs: res.durationMs,
      });
      return res;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lesson, base],
  );

  const stop = useCallback(() => abort.current?.abort(), []);
  const clear = useCallback(() => setOut(EMPTY_OUTPUT), []);

  return { out, run, check, stop, clear };
}
