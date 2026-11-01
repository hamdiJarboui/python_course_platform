import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, ReactNode } from 'react';

type RequestInput = (prompt: string, signal: AbortSignal) => Promise<string | null>;

const InputContext = createContext<RequestInput>(() => Promise.resolve(null));

export function useRequestInput(): RequestInput {
  return useContext(InputContext);
}

interface Pending {
  prompt: string;
  resolve: (value: string | null) => void;
}

/** Hosts the modal behind Python's `input()`. Mount once near the root. */
export function InputProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);

  const request = useCallback<RequestInput>((prompt, signal) => {
    return new Promise<string | null>((resolve) => {
      const onAbort = (): void => done(null);
      const done = (value: string | null): void => {
        signal.removeEventListener('abort', onAbort);
        setPending((p) => (p?.resolve === done ? null : p));
        resolve(value);
      };
      if (signal.aborted) {
        resolve(null);
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
      setPending({ prompt, resolve: done });
    });
  }, []);

  return (
    <InputContext.Provider value={request}>
      {children}
      {pending && <InputModal prompt={pending.prompt} onDone={pending.resolve} />}
    </InputContext.Provider>
  );
}

function InputModal({ prompt, onDone }: { prompt: string; onDone: (v: string | null) => void }) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previous = document.activeElement;
    inputRef.current?.focus();
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    onDone(text);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>): void => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onDone(null);
    } else if (e.key === 'Tab') {
      // Keep focus inside the dialog.
      const focusable = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('input, button'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  return (
    <div className="modal-backdrop">
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="input-title"
        aria-describedby="input-prompt"
        onSubmit={submit}
        onKeyDown={onKeyDown}
      >
        <h2 id="input-title">Your program is asking for input</h2>
        <p className="modal__prompt" id="input-prompt">
          {prompt || 'input()'}
        </p>
        <label className="sr-only" htmlFor="input-field">
          Your answer
        </label>
        <input
          id="input-field"
          ref={inputRef}
          type="text"
          value={text}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="modal__actions">
          <button type="button" className="btn btn--sm" onClick={() => onDone(null)}>
            Cancel (EOF)
          </button>
          <button type="submit" className="btn btn--sm btn--primary">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
