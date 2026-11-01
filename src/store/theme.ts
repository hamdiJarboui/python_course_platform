import { useSyncExternalStore } from 'react';
import { THEME_KEY, nextThemeMode, parseThemeMode, resolveTheme } from '@/core/theme';
import type { ResolvedTheme, ThemeMode } from '@/core/theme';

/** Small external store: the mode lives in localStorage, the resolved theme on <html data-theme>. */
let mode: ThemeMode = readMode();
const listeners = new Set<() => void>();
const media =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : undefined;

function readMode(): ThemeMode {
  try {
    return parseThemeMode(localStorage.getItem(THEME_KEY));
  } catch {
    return 'system';
  }
}

function resolved(): ResolvedTheme {
  return resolveTheme(mode, media?.matches ?? false);
}

function apply(): void {
  const theme = resolved();
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-theme-mode', mode);
  root.style.colorScheme = theme;
  for (const l of listeners) l();
}

media?.addEventListener('change', () => {
  if (mode === 'system') apply();
});

export function setThemeMode(next: ThemeMode): void {
  mode = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* private mode: the choice lasts for this session only */
  }
  apply();
}

export function cycleThemeMode(): void {
  setThemeMode(nextThemeMode(mode));
}

/** Forces a theme without persisting (used by the print route). */
export function forceTheme(theme: ResolvedTheme): () => void {
  const root = document.documentElement;
  const prev = root.getAttribute('data-theme');
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
  return () => {
    if (prev) root.setAttribute('data-theme', prev);
    apply();
  };
}

export function useTheme(): { mode: ThemeMode; theme: ResolvedTheme } {
  const snapshot = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => `${mode}|${resolved()}`,
  );
  const [m, t] = snapshot.split('|') as [ThemeMode, ResolvedTheme];
  return { mode: m, theme: t };
}
