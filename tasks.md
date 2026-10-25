# tasks.md — PyCourses backlog

Status: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked
Each task: **ID — title** · deps · acceptance criteria (AC). Follow the protocol in `AGENTS.md`.
Work top-to-bottom; do not start a phase while an earlier phase has open tasks unless blocked.

---
## Phase 0 — Foundation
- [ ] **T-001 — Scaffold project** · deps: none
  AC: Vite + React + TS strict, pnpm, folder layout from ARCHITECTURE §3, path alias `@/`, `pnpm dev/build` work.
- [ ] **T-002 — Lint, format, typecheck, hooks** · deps: T-001
  AC: ESLint (typescript-eslint strict) + Prettier + `pnpm typecheck` + `pnpm lint`; lint-staged + husky pre-commit.
- [ ] **T-003 — Test tooling** · deps: T-001
  AC: Vitest + Testing Library + Playwright configured; one passing sample test each; `pnpm test`, `pnpm e2e`.
- [ ] **T-004 — Progress script** · deps: T-001
  AC: `pnpm progress` parses `tasks.md`, counts `[ ] [~] [x] [!]` per phase, rewrites the table between
  `<!-- PROGRESS:START -->` and `<!-- PROGRESS:END -->` in `PROGRESS.md`; has unit tests.
- [ ] **T-005 — CI pipeline** · deps: T-002, T-003
  AC: GitHub Actions: typecheck → lint → test → content:build → build → e2e. Caches pnpm.

## Phase 1 — Core domain (pure TS)
- [ ] **T-010 — Domain types + Zod schemas** · deps: T-001
  AC: `src/core/types.ts` (Course, Module, Lesson, Quiz, Question…) + Zod schemas for course.yml, module.yml, lesson frontmatter, quiz.
- [ ] **T-011 — Quiz grading engine** · deps: T-010
  AC: `gradeQuiz(quiz, answers)` supports single/multiple/boolean/short (normalization, caseSensitive), returns score %, per-question result, passed flag. ≥ 90 % coverage.
- [ ] **T-012 — Progress model + math** · deps: T-010
  AC: pure reducers: completeLesson, recordQuizAttempt (best score, attempts), course/module %, resume pointer, unlock rules for `gating`. Tested.
- [ ] **T-013 — Storage adapter** · deps: T-012
  AC: localStorage adapter with versioning, migrations, corruption backup, in-memory fallback, export/import JSON. Tested.

## Phase 2 — Content pipeline
- [ ] **T-020 — Markdown parser pipeline** · deps: T-010
  AC: unified pipeline (gfm, frontmatter, math, callouts `[!NOTE]`) → hast; syntax highlighting; unit tests with fixtures.
- [ ] **T-021 — Code-fence plugin** · deps: T-020
  AC: parses flags `run|edit|exercise|tests|solution|setup`, meta (`id`, `title`, `timeout`), links exercise↔tests↔solution; errors on bad flags.
- [ ] **T-022 — Quiz-fence plugin** · deps: T-020, T-010
  AC: ```` ```quiz ```` YAML → validated Quiz object; invalid answer index fails with file+line.
- [ ] **T-023 — `content:build` script** · deps: T-021, T-022
  AC: walks `content/`, validates, emits manifest + per-lesson JSON + search index to `src/generated/`; fails if a module lacks `99-quiz.md`, duplicate IDs, bad links.
- [ ] **T-024 — Fixture course** · deps: T-023
  AC: `content/__fixtures__/demo/` with 2 modules, lessons using every fence type, 2 quizzes.
- [ ] **T-025 — Sample real course "Python Basics"** · deps: T-023
  AC: ≥ 3 modules (Getting Started, Control Flow, Functions), ≥ 4 lessons each, quiz per module (≥ 6 questions), exercises with tests.

## Phase 3 — Python runtime
- [ ] **T-030 — Pyodide worker + client** · deps: T-001
  AC: lazy load; `run(code, {timeout})` returns `{stdout, stderr, result, error, durationMs}`; fresh namespace per run; tests.
- [ ] **T-031 — Stop/timeout/restart** · deps: T-030
  AC: infinite loop is killed within timeout+500ms, worker recreated, UI can Stop; tested.
- [ ] **T-032 — `input()` bridge** · deps: T-030
  AC: `input(prompt)` opens a modal and resolves with user text; tested with mock.
- [ ] **T-033 — Exercise runner** · deps: T-030, T-021
  AC: runs learner code + hidden tests, returns `{passed, failures[]}`; assertion messages surfaced.
- [ ] **T-034 — Package loading** · deps: T-030
  AC: only packages listed in `course.yml` are loadable; load progress shown.
- [ ] **T-035 — `content:verify` script** · deps: T-023
  AC: runs every runnable block + exercise solution in real CPython (subprocess, timeout); CI gate; clear error output with file/line.

## Phase 4 — UI
- [ ] **T-040 — Design tokens + themes** · deps: T-001
  AC: `tokens.css` per DESIGN_SYSTEM; light/dark; `system|light|dark`; no flash (inline script); persisted; `ThemeToggle` accessible; tests.
- [ ] **T-041 — App shell + routing** · deps: T-040
  AC: routes from ARCHITECTURE §10, Header, Layout, 404, error boundary.
- [ ] **T-042 — Catalog + course overview** · deps: T-041, T-023
  AC: course cards, TOC with module/lesson progress, resume button, level/minutes metadata.
- [ ] **T-043 — Lesson page renderer** · deps: T-041, T-021
  AC: renders hast with sidebar TOC, prev/next, "Mark complete", callouts, anchored headings.
- [ ] **T-044 — CodeCell (run/edit)** · deps: T-043, T-030, T-031
  AC: CodeMirror 6, theme-aware, Run/Stop/Reset/Copy, output panel states, `aria-live`.
- [ ] **T-045 — Exercise component** · deps: T-044, T-033
  AC: Check, pass/fail feedback, hint, solution reveal after failed attempt; saves `exercises` progress.
- [ ] **T-046 — Quiz UI** · deps: T-041, T-011, T-022
  AC: all question types, submit, explanations, score summary, pass/fail, retry, review; saves attempts; keyboard accessible.
- [ ] **T-047 — Progress store + hooks** · deps: T-012, T-013
  AC: Zustand store wired to storage; progress bar component; sidebar checkmarks; resume pointer.
- [ ] **T-048 — Module gating** · deps: T-047, T-046
  AC: `gating: quiz` locks next module until pass; `none` shows nudge only.
- [ ] **T-049 — Progress dashboard + export/import** · deps: T-047
  AC: `/progress` page, per-course stats, JSON export/import with validation.
- [ ] **T-050 — Search** · deps: T-023, T-041
  AC: MiniSearch over lessons, results with snippet, keyboard shortcut `/`.
- [ ] **T-051 — Python-themed polish** · deps: T-042..T-046
  AC: snake progress line, logo, callout icons, empty/error states; use `@frontend-design`; reduced-motion respected.
- [ ] **T-052 — Responsive + mobile drawer** · deps: T-043
  AC: layouts at 640/900/1200; no horizontal page scroll.
- [ ] **T-053 — Accessibility pass** · deps: T-051
  AC: axe e2e clean (catalog, lesson, quiz × 2 themes), contrast check script, focus order verified.

## Phase 5 — PDF export
- [ ] **T-060 — Print route + print.css** · deps: T-043, T-044
  AC: `/print/:course` renders all lessons, light theme, auto-runs cells, sets `window.__PRINT_READY__`.
- [ ] **T-061 — PDF generator script** · deps: T-060
  AC: `pnpm pdf` produces `public/pdf/<course>.pdf` per PDF_EXPORT.md (cover, bookmarks, header/footer, outputs, quiz answer key).
- [ ] **T-062 — Download button + print lesson** · deps: T-061, T-042
  AC: Download PDF on overview with size/version; Print lesson button; graceful missing-PDF state.
- [ ] **T-063 — PDF e2e test** · deps: T-061
  AC: asserts file exists, page count ≥ modules, contains title text.

## Phase 6 — Release
- [ ] **T-070 — PWA / offline** · deps: T-044
  AC: service worker caches app shell, lessons visited, Pyodide assets; offline run works.
- [ ] **T-071 — Full e2e journey** · deps: T-048, T-062
  AC: open course → run → complete lessons → pass quiz → reload keeps progress → toggle theme persists → download PDF.
- [ ] **T-072 — Performance budget** · deps: T-071
  AC: initial JS < 200 KB gz, Lighthouse perf ≥ 90, a11y ≥ 95.
- [ ] **T-073 — Docs + deploy** · deps: T-071
  AC: README (authoring guide link, commands), deploy workflow to Pages/Netlify, live URL in `PROGRESS.md`.
