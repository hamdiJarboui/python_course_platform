// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CodeCellData, ExerciseData } from '@/core/types';
import { progressStore } from '@/store/progress';

const run = vi.fn();
const runExercise = vi.fn();
vi.mock('@/runtime', () => ({
  runtime: {
    run: (...args: unknown[]) => run(...args),
    runExercise: (...args: unknown[]) => runExercise(...args),
    subscribe: () => () => undefined,
    state: { phase: 'idle' },
  },
}));
// The real editor is CodeMirror (needs layout); a textarea stands in for it here.
vi.mock('./CodeEditor', () => ({
  CodeEditor: ({ value, onChange, label }: { value: string; onChange?: (v: string) => void; label: string }) => (
    <textarea aria-label={label} value={value} onChange={(e) => onChange?.(e.target.value)} />
  ),
}));

const { CodeCell } = await import('./CodeCell');
const { ExerciseCell } = await import('./ExerciseCell');
const { LessonRunProvider } = await import('./context');

const lesson = { courseId: 'c', lessonId: 'c/m/l', scope: 'lesson' as const, setup: 'X = 1', packages: [] };
const wrap = (ui: React.ReactNode) => render(<LessonRunProvider value={lesson}>{ui}</LessonRunProvider>);

const cell: CodeCellData = {
  id: 'cell-1',
  kind: 'run',
  code: 'print(1)',
  html: '<pre class="shiki"><code>print(1)</code></pre>',
  timeoutMs: 5000,
};
const editCell: CodeCellData = { ...cell, kind: 'edit' };

const ok = { status: 'ok', stdout: '', stderr: '', result: null, error: null, durationMs: 1 };

describe('CodeCell', () => {
  beforeEach(() => {
    run.mockReset();
    runExercise.mockReset();
    progressStore.setState({ progress: { version: 1, courses: {} } });
  });

  it('runs with lesson scope, setup and timeout, then shows stdout and the result', async () => {
    run.mockResolvedValue({ ...ok, stdout: 'hello\n', result: '42' });
    const user = userEvent.setup();
    wrap(<CodeCell cell={cell} />);
    expect(screen.queryByRole('region', { name: /output/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /run/i }));
    const out = await screen.findByRole('region', { name: /output/i });
    await waitFor(() => expect(out).toHaveTextContent('hello'));
    expect(out).toHaveTextContent('→ 42');
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'print(1)', timeoutMs: 5000, namespace: 'c/m/l', setup: 'X = 1' }),
      expect.any(Object),
    );
  });

  it('shows stderr separately and a notice for timeouts', async () => {
    run.mockResolvedValue({
      ...ok,
      status: 'timeout',
      stderr: 'partial\n',
      error: 'TimeoutError: execution took longer than 5 s',
    });
    const user = userEvent.setup();
    wrap(<CodeCell cell={cell} />);
    await user.click(screen.getByRole('button', { name: /run/i }));
    const out = await screen.findByRole('region', { name: /output/i });
    await waitFor(() => expect(out).toHaveTextContent(/TimeoutError/));
    expect(out.querySelector('.out-stderr')).toBeTruthy();
  });

  it('offers Stop while running and aborts the run', async () => {
    let signal: AbortSignal | undefined;
    run.mockImplementation((req: { signal: AbortSignal }) => {
      signal = req.signal;
      return new Promise((resolve) => req.signal.addEventListener('abort', () => resolve({ ...ok, status: 'stopped', error: 'Stopped' })));
    });
    const user = userEvent.setup();
    wrap(<CodeCell cell={cell} />);
    await user.click(screen.getByRole('button', { name: /run/i }));
    await user.click(await screen.findByRole('button', { name: /stop/i }));
    expect(signal?.aborted).toBe(true);
    expect(await screen.findByRole('button', { name: /run/i })).toBeInTheDocument();
  });

  it('aborts a running cell when the lesson is left', async () => {
    let signal: AbortSignal | undefined;
    run.mockImplementation((req: { signal: AbortSignal }) => {
      signal = req.signal;
      return new Promise(() => undefined);
    });
    const user = userEvent.setup();
    const { unmount } = wrap(<CodeCell cell={cell} />);
    await user.click(screen.getByRole('button', { name: /run/i }));
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('edit cells can be edited, run with the edited code, and reset', async () => {
    run.mockResolvedValue(ok);
    const user = userEvent.setup();
    wrap(<CodeCell cell={editCell} />);
    const editor = await screen.findByRole('textbox');
    await user.clear(editor);
    await user.type(editor, 'print(2)');
    await user.click(screen.getByRole('button', { name: /^▶?\s*run/i }));
    await waitFor(() => expect(run).toHaveBeenCalled());
    expect(run.mock.calls[0]?.[0]).toMatchObject({ code: 'print(2)' });
    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByRole('textbox')).toHaveValue('print(1)');
  });
});

describe('ExerciseCell', () => {
  const exercise: ExerciseData = {
    id: 'ex-add',
    starter: 'def add(a, b):\n    pass',
    starterHtml: '<pre class="shiki"></pre>',
    tests: 'assert add(1, 2) == 3',
    testsHtml: '',
    solution: 'def add(a, b):\n    return a + b',
    solutionHtml: '<pre class="shiki"><code>return a + b</code></pre>',
    timeoutMs: 5000,
  };
  const base = { ...ok, passed: false, failures: [] };

  beforeEach(() => {
    run.mockReset();
    runExercise.mockReset();
    progressStore.setState({ progress: { version: 1, courses: {} } });
  });

  it('shows failures, reveals the solution only after an attempt, and keeps progress on pass', async () => {
    runExercise.mockResolvedValueOnce({ ...base, failures: [{ message: 'add(1, 2) should be 3', test: null }] });
    const user = userEvent.setup();
    wrap(<ExerciseCell exercise={exercise} />);
    expect(screen.queryByRole('button', { name: /show solution/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /check/i }));
    expect(await screen.findByText('add(1, 2) should be 3')).toBeInTheDocument();
    expect(progressStore.getState().progress.courses['c']?.exercises['ex-add']?.passed).toBe(false);

    await user.click(screen.getByRole('button', { name: /show solution/i }));
    expect(screen.getByText(/return a \+ b/)).toBeInTheDocument();

    runExercise.mockResolvedValueOnce({ ...base, passed: true });
    await user.click(screen.getByRole('button', { name: /check/i }));
    expect(await screen.findByText(/all tests passed/i)).toBeInTheDocument();
    expect(progressStore.getState().progress.courses['c']?.exercises['ex-add']?.passed).toBe(true);
    expect(screen.getByText(/✓ Passed/)).toBeInTheDocument();
  });

  it('does not record an attempt when the check timed out', async () => {
    runExercise.mockResolvedValueOnce({ ...base, status: 'timeout', error: 'TimeoutError: too slow' });
    const user = userEvent.setup();
    wrap(<ExerciseCell exercise={exercise} />);
    await user.click(screen.getByRole('button', { name: /check/i }));
    expect(await screen.findByText(/TimeoutError: too slow/)).toBeInTheDocument();
    expect(progressStore.getState().progress.courses['c']?.exercises['ex-add']).toBeUndefined();
  });
});
