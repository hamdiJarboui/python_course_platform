import { useEffect, useRef, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; data: T };

/** Loads data when `key` changes. The loader is read from a ref so callers can pass inline closures. */
export function useAsync<T>(key: string, loader: () => Promise<T>): AsyncState<T> & { reload: () => void } {
  const [nonce, setNonce] = useState(0);
  const token = `${key}#${nonce}`;
  const [result, setResult] = useState<{ token: string; value: AsyncState<T> } | null>(null);
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    let cancelled = false;
    loaderRef.current().then(
      (data) => {
        if (!cancelled) setResult({ token, value: { status: 'ready', data } });
      },
      (e: unknown) => {
        if (!cancelled) {
          setResult({ token, value: { status: 'error', error: e instanceof Error ? e : new Error(String(e)) } });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Loading is derived: a result for another key/nonce is stale.
  const state: AsyncState<T> = result?.token === token ? result.value : { status: 'loading' };
  return { ...state, reload: () => setNonce((n) => n + 1) };
}
