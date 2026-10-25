# DESIGN SYSTEM — Python theme, dark & light

Use the `@frontend-design` skill for layout/typography polish, but stay inside these tokens.

## Brand
Python blue + yellow, calm and code-first. Playful but not childish. Subtle snake motif
(a thin winding line under headings or progress bar), no clip-art.

## Tokens (`src/styles/tokens.css`)
```css
:root, [data-theme="light"] {
  --py-blue:        #306998;
  --py-blue-strong: #1f4e79;
  --py-yellow:      #ffd43b;
  --py-yellow-deep: #e0b000;

  --bg:        #f7f9fc;
  --surface:   #ffffff;
  --surface-2: #eef2f7;
  --border:    #d6dde8;
  --text:      #1b2430;
  --text-muted:#566176;
  --accent:    var(--py-blue);
  --accent-contrast: #ffffff;
  --highlight: var(--py-yellow);
  --success:#1a7f4b; --danger:#c0392b; --warning:#b7791f; --info:#2b6cb0;
  --code-bg:#f1f4f9; --code-text:#1b2430;
  --focus: 0 0 0 3px rgba(48,105,152,.45);
}
[data-theme="dark"] {
  --bg:        #0f1620;
  --surface:   #161f2b;
  --surface-2: #1e2938;
  --border:    #2b3a4e;
  --text:      #e6edf5;
  --text-muted:#9fb0c5;
  --accent:    #ffd43b;           /* yellow pops on dark */
  --accent-contrast:#1b2430;
  --highlight: #4b8bbe;
  --success:#4cc38a; --danger:#ff7b72; --warning:#e3b341; --info:#6cb6ff;
  --code-bg:#0b121b; --code-text:#e6edf5;
  --focus: 0 0 0 3px rgba(255,212,59,.5);
}
:root {
  --font-ui:   "Inter", system-ui, sans-serif;
  --font-code: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
  --radius: 10px; --radius-sm: 6px;
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-6:24px; --space-8:32px;
  --measure: 72ch;       /* lesson text width */
}
```
Contrast rule: text on surfaces ≥ 4.5:1, UI borders/icons ≥ 3:1 — verify with automated check (task T-053).

## Theme behavior
- Modes: `system` (default) · `light` · `dark`; stored in `localStorage: pycourses:theme`.
- `index.html` inline script applies `data-theme` before first paint.
- Toggle in header: accessible button (`aria-pressed`, label "Theme: dark"), keyboard-operable.
- `color-scheme` set per theme so native controls match.

## Components & states
| Component | Notes |
|---|---|
| Header | logo (snake-py mark), catalog link, search, progress link, theme toggle |
| Sidebar TOC | modules collapsible, ✓ for completed lessons, 🔒 only when gating=quiz, current highlighted |
| Lesson page | measure 72ch, sticky progress bar, prev/next, "Mark complete" |
| CodeCell | header (filename, Run ▶, Stop ■, Reset ↺, Copy), editor, output panel (stdout neutral, stderr danger, result info), running spinner, timeout message |
| Exercise | Check button, pass (success) / fail (list of messages) states, hint + solution reveal |
| Quiz | one question per screen or all-on-page (setting), progress dots, instant explanation after submit, result summary with pass/fail, retry, review wrong answers |
| ProgressBar | snake-line fill animation (disabled under reduced motion) |
| Callouts | NOTE/TIP/WARNING/PYTHONIC with icon + left border color |
| Badges | "Module passed", "Course complete" |

## Layout
Desktop: sidebar (280px) + content. Tablet/mobile: sidebar becomes a drawer; code cells scroll horizontally, never the page.
Breakpoints: 640 / 900 / 1200.

## Motion & a11y
Transitions ≤ 200ms, none under `prefers-reduced-motion`. Focus ring always visible. Output panel `aria-live="polite"`.
Quiz options are real radio/checkbox inputs with labels.

## Print stylesheet (`print.css`)
Light palette forced, no sidebar/header, code blocks `break-inside: avoid`, links show URL, page numbers, headings keep-with-next.
