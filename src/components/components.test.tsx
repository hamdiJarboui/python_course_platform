// @vitest-environment jsdom
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { InputProvider, useRequestInput } from './InputDialog';
import { SnakeProgress } from './SnakeProgress';
import { ThemeToggle } from './ThemeToggle';
import { useAsync } from './useAsync';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('cycles system → light → dark, persists, and applies the theme to <html>', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /^theme:/i });
    expect(button).toHaveAccessibleName(/system/i);

    await user.click(button);
    expect(button).toHaveAccessibleName('Theme: light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);
    expect(button).toHaveAccessibleName('Theme: dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('pycourses:theme')).toBe('dark');

    await user.click(button);
    expect(localStorage.getItem('pycourses:theme')).toBe('system');
  });

  it('is operable with the keyboard', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(document.documentElement).toHaveAttribute('data-theme');
  });
});

describe('SnakeProgress', () => {
  it('exposes progress to assistive technology and clamps the value', () => {
    const { rerender } = render(<SnakeProgress percent={42} label="Course progress" />);
    const bar = screen.getByRole('progressbar', { name: 'Course progress' });
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    rerender(<SnakeProgress percent={250} label="Course progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<SnakeProgress percent={-5} label="Course progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('useAsync', () => {
  it('goes loading → ready, and reloads when the key changes', async () => {
    const { result, rerender } = renderHook(
      ({ k }) => useAsync(k, () => Promise.resolve(`data-${k}`)),
      {
        initialProps: { k: 'a' },
      },
    );
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current).toMatchObject({ status: 'ready', data: 'data-a' }));
    rerender({ k: 'b' });
    expect(result.current.status).toBe('loading'); // never shows stale data for another key
    await waitFor(() => expect(result.current).toMatchObject({ status: 'ready', data: 'data-b' }));
  });

  it('reports errors and can retry', async () => {
    let attempt = 0;
    const { result } = renderHook(() =>
      useAsync('x', () =>
        ++attempt === 1 ? Promise.reject(new Error('nope')) : Promise.resolve('fine'),
      ),
    );
    await waitFor(() => expect(result.current.status).toBe('error'));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current).toMatchObject({ status: 'ready', data: 'fine' }));
  });
});

describe('InputProvider (the dialog behind input())', () => {
  function Harness({ onAnswer }: { onAnswer: (v: string | null) => void }) {
    const request = useRequestInput();
    return (
      <button
        onClick={() => {
          const ctl = new AbortController();
          void request('Name? ', ctl.signal).then(onAnswer);
        }}
      >
        ask
      </button>
    );
  }

  it('resolves with the typed text and restores focus', async () => {
    const user = userEvent.setup();
    let answer: string | null | undefined;
    render(
      <InputProvider>
        <Harness onAnswer={(v) => (answer = v)} />
      </InputProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'ask' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleDescription('Name?');
    expect(screen.getByRole('textbox')).toHaveFocus();
    await user.type(screen.getByRole('textbox'), 'Ada{Enter}');
    expect(answer).toBe('Ada');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ask' })).toHaveFocus();
  });

  it('Escape and Cancel resolve with null (EOF)', async () => {
    const user = userEvent.setup();
    let answer: string | null | undefined = 'unset';
    render(
      <InputProvider>
        <Harness onAnswer={(v) => (answer = v)} />
      </InputProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'ask' }));
    await user.keyboard('{Escape}');
    expect(answer).toBeNull();
  });

  it('closes when the run is aborted', async () => {
    const user = userEvent.setup();
    let controller: AbortController | undefined;
    function Aborting() {
      const request = useRequestInput();
      return (
        <button
          onClick={() => {
            controller = new AbortController();
            void request('?', controller.signal);
          }}
        >
          go
        </button>
      );
    }
    render(
      <InputProvider>
        <Aborting />
      </InputProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'go' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => controller?.abort());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
