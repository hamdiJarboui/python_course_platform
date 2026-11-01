import { THEME_MODES } from '@/core/theme';
import type { ThemeMode } from '@/core/theme';
import { cycleThemeMode, useTheme } from '@/store/theme';

const PATHS: Record<ThemeMode, string> = {
  system: 'M4 5h16v10H4zM9 19h6M12 15v4',
  light:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  dark: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
};

export function ThemeToggle() {
  const { mode, theme } = useTheme();
  const label = mode === 'system' ? `Theme: system (${theme})` : `Theme: ${mode}`;
  return (
    <button
      type="button"
      className="btn btn--sm theme-toggle"
      aria-pressed={theme === 'dark'}
      aria-label={label}
      title={`${label} — click to switch (${THEME_MODES.join(' → ')})`}
      onClick={cycleThemeMode}
    >
      <svg
        key={mode}
        className="theme-toggle__icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d={PATHS[mode]} />
      </svg>
      <span aria-hidden="true">{mode}</span>
    </button>
  );
}
