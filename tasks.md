# tasks.md — PyCourses backlog

Status: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked
Each task: **ID — title** · **owner** · deps · acceptance criteria (AC). Follow the protocol in `AGENTS.md`.
Work top-to-bottom within YOUR tasks; do not start a phase while an earlier phase has open tasks unless blocked.

## Team split (2 developers)
| Dev | Stream | Owns (code areas) |
|---|---|---|
| **Dev A** | Engine: scaffold, domain, content pipeline, Python runtime, interactive components, offline | `src/core/**`, `src/content/**`, `src/runtime/**`, `src/components/{playground,quiz}/**`, `scripts/content-*`, `public/sw` |
| **Dev B** | Product: tooling/CI, design system, app shell, catalog/lesson/search/progress UI, PDF, release, **course content** | `src/app/**`, `src/components/{catalog,course,lesson,search,pdf}/**`, `src/styles/**`, `scripts/{progress,pdf}*`, `.github/**`, `content/**` |

Rules for working together
1. Only pick tasks whose **owner is you**. Take another dev's task only after agreeing in the PR/chat and changing the owner here.
2. One branch per task: `feat/T-0xx-short-name` (Dev A) · `feat/T-0xx-short-name` (Dev B); PR into `main`, reviewed by the other dev.
3. **Hand-offs** (a task blocked by the other dev's task) are marked `⇄`. Merge the dependency first, or stub the interface from `src/core/types.ts` (T-010) and agree on it in the PR.
4. Shared files (`tasks.md`, `PROGRESS.md`, `package.json`, `docs/**`): keep edits small and rebase often to avoid conflicts. Run `pnpm progress` only on `main` after merging.
5. Until T-001 is merged, Dev B works on content (T-024..T-026) and design docs; no code conflicts possible.

Workload: Dev A 22 tasks · Dev B 22 tasks.

---
## Phase 0 — Foundation
- [ ] **T-001 — Scaffold project** · **A** · deps: none  ⟵ *critical path, do first*
  AC: Vite + React + TS strict, pnpm, folder layout from ARCHITECTURE §3, path alias `@/`, `pnpm dev/build` work.
- [ ] **T-002 — Lint, format, typecheck, hooks** · **B** · deps: T-001
  AC: ESLint (typescript-eslint strict) + Prettier + `pnpm typecheck` + `pnpm lint`; lint-staged + husky pre-commit.
- [ ] **T-003 — Test tooling** · **A** · deps: T-001
  AC: Vitest + Testing Library + Playwright configured; one passing sample test each; `pnpm test`, `pnpm e2e`.
- [ ] **T-004 — Progress script** · **B** · deps: T-001
  AC: `pnpm progress` parses `tasks.md`, counts `[ ] [~] [x] [!]` per phase, rewrites the table between
  `<!-- PROGRESS:START -->` and `<!-- PROGRESS:END -->` in `PROGRESS.md`; has unit tests.
  Note: the parser must ignore the `· **A**`/`· **B**` owner tag and may add a per-owner table.
- [ ] **T-005 — CI pipeline** · **B** · deps: T-002, T-003 ⇄
  AC: GitHub Actions: typecheck → lint → test → content:build → build → e2e. Caches pnpm.

## Phase 1 — Core domain (pure TS)  — all Dev A
- [ ] **T-010 — Domain types + Zod schemas** · **A** · deps: T-001
  AC: `src/core/types.ts` (Course, Module, Lesson, Quiz, Question…) + Zod schemas for course.yml, module.yml, lesson frontmatter, quiz.
  Hand-off: merge this early — it is the contract Dev B codes the UI against.
- [ ] **T-011 — Quiz grading engine** · **A** · deps: T-010
  AC: `gradeQuiz(quiz, answers)` supports single/multiple/boolean/short (normalization, caseSensitive), returns score %, per-question result, passed flag. ≥ 90 % coverage.
- [ ] **T-012 — Progress model + math** · **A** · deps: T-010
  AC: pure reducers: completeLesson, recordQuizAttempt (best score, attempts), course/module %, resume pointer, unlock rules for `gating`. Tested.
- [ ] **T-013 — Storage adapter** · **A** · deps: T-012
  AC: localStorage adapter with versioning, migrations, corruption backup, in-memory fallback, export/import JSON. Tested.

## Phase 2 — Content pipeline
- [ ] **T-020 — Markdown parser pipeline** · **A** · deps: T-010
  AC: unified pipeline (gfm, frontmatter, math, callouts `[!NOTE]`) → hast; syntax highlighting; unit tests with fixtures.
- [ ] **T-021 — Code-fence plugin** · **A** · deps: T-020
  AC: parses flags `run|edit|exercise|tests|solution|setup`, meta (`id`, `title`, `timeout`), links exercise↔tests↔solution; errors on bad flags.
- [ ] **T-022 — Quiz-fence plugin** · **A** · deps: T-020, T-010
  AC: ```` ```quiz ```` YAML → validated Quiz object; invalid answer index fails with file+line.
- [ ] **T-023 — `content:build` script** · **A** · deps: T-021, T-022
  AC: walks `content/`, validates, emits manifest + per-lesson JSON + search index to `src/generated/`; fails if a module lacks `99-quiz.md`, duplicate IDs, bad links.
- [ ] **T-024 — Fixture course** · **B** · deps: T-023 ⇄
  AC: `content/__fixtures__/demo/` with 2 modules, lessons using every fence type, 2 quizzes.
- [~] **T-025 — Sample real course "Python Basics"** · **B** · deps: T-023 ⇄
  AC: ≥ 3 modules (Getting Started, Control Flow, Functions), ≥ 4 lessons each, quiz per module (≥ 6 questions), exercises with tests.
  Status: **content written** in `content/python-basics/` (3 modules × 4 lessons + 3 quizzes, 7 questions each, 12 exercises with tests+solutions).
  Pre-checked with a throw-away script: every `run`/`edit` block and every solution passes its tests in CPython, quiz YAML parses, answer indices valid.
  Remaining before `[x]`: Dev B reviews wording, then `pnpm content:build && pnpm content:verify` pass once T-023/T-035 exist.
- [~] **T-026 — Second real course "Python Intermediate"** · **B** · deps: T-023 ⇄  *(added: content was missing)*
  AC: `content/python-intermediate/` with ≥ 3 modules (Data Structures, Classes and Objects, Errors and the Standard Library), ≥ 3 lessons each, quiz per module (≥ 6 questions), exercises with tests, `gating: quiz`.
  Status: **content written** (3 modules × 3 lessons + 3 quizzes, 9 exercises). Same pre-check as T-025. Remaining: review + `content:build`/`content:verify`.

## Phase 3 — Python runtime  — all Dev A
- [ ] **T-030 — Pyodide worker + client** · **A** · deps: T-001
  AC: lazy load; `run(code, {timeout})` returns `{stdout, stderr, result, error, durationMs}`; fresh namespace per run; tests.
- [ ] **T-031 — Stop/timeout/restart** · **A** · deps: T-030
  AC: infinite loop is killed within timeout+500ms, worker recreated, UI can Stop; tested.
- [ ] **T-032 — `input()` bridge** · **A** · deps: T-030
  AC: `input(prompt)` opens a modal and resolves with user text; tested with mock.
- [ ] **T-033 — Exercise runner** · **A** · deps: T-030, T-021
  AC: runs learner code + hidden tests, returns `{passed, failures[]}`; assertion messages surfaced.
- [ ] **T-034 — Package loading** · **A** · deps: T-030
  AC: only packages listed in `course.yml` are loadable; load progress shown.
- [ ] **T-035 — `content:verify` script** · **A** · deps: T-023
  AC: runs every runnable block + exercise solution in real CPython (subprocess, timeout); CI gate; clear error output with file/line.

## Phase 4 — UI
- [ ] **T-040 — Design tokens + themes** · **B** · deps: T-001
  AC: `tokens.css` per DESIGN_SYSTEM; light/dark; `system|light|dark`; no flash (inline script); persisted; `ThemeToggle` accessible; tests.
- [ ] **T-041 — App shell + routing** · **B** · deps: T-040
  AC: routes from ARCHITECTURE §10, Header, Layout, 404, error boundary.
- [ ] **T-042 — Catalog + course overview** · **B** · deps: T-041, T-023 ⇄
  AC: course cards, TOC with module/lesson progress, resume button, level/minutes metadata.
- [ ] **T-043 — Lesson page renderer** · **B** · deps: T-041, T-021 ⇄
  AC: renders hast with sidebar TOC, prev/next, "Mark complete", callouts, anchored headings.
- [ ] **T-044 — CodeCell (run/edit)** · **A** · deps: T-043 ⇄, T-030, T-031
  AC: CodeMirror 6, theme-aware, Run/Stop/Reset/Copy, output panel states, `aria-live`.
- [ ] **T-045 — Exercise component** · **A** · deps: T-044, T-033
  AC: Check, pass/fail feedback, hint, solution reveal after failed attempt; saves `exercises` progress.
- [ ] **T-046 — Quiz UI** · **A** · deps: T-041 ⇄, T-011, T-022
  AC: all question types, submit, explanations, score summary, pass/fail, retry, review; saves attempts; keyboard accessible.
- [ ] **T-047 — Progress store + hooks** · **A** · deps: T-012, T-013
  AC: Zustand store wired to storage; progress bar component; sidebar checkmarks; resume pointer.
  Hand-off: Dev B consumes the hooks in T-042/T-043/T-049.
- [ ] **T-048 — Module gating** · **A** · deps: T-047, T-046
  AC: `gating: quiz` locks next module until pass; `none` shows nudge only.
- [ ] **T-049 — Progress dashboard + export/import** · **B** · deps: T-047 ⇄
  AC: `/progress` page, per-course stats, JSON export/import with validation.
- [ ] **T-050 — Search** · **B** · deps: T-023 ⇄, T-041
  AC: MiniSearch over lessons, results with snippet, keyboard shortcut `/`.
- [ ] **T-051 — Python-themed polish** · **B** · deps: T-042..T-046 ⇄
  AC: snake progress line, logo, callout icons, empty/error states; use `@frontend-design`; reduced-motion respected.
- [ ] **T-052 — Responsive + mobile drawer** · **B** · deps: T-043
  AC: layouts at 640/900/1200; no horizontal page scroll.
- [ ] **T-053 — Accessibility pass** · **B** · deps: T-051
  AC: axe e2e clean (catalog, lesson, quiz × 2 themes), contrast check script, focus order verified.

## Phase 5 — PDF export  — all Dev B
- [ ] **T-060 — Print route + print.css** · **B** · deps: T-043, T-044 ⇄
  AC: `/print/:course` renders all lessons, light theme, auto-runs cells, sets `window.__PRINT_READY__`.
- [ ] **T-061 — PDF generator script** · **B** · deps: T-060
  AC: `pnpm pdf` produces `public/pdf/<course>.pdf` per PDF_EXPORT.md (cover, bookmarks, header/footer, outputs, quiz answer key).
- [ ] **T-062 — Download button + print lesson** · **B** · deps: T-061, T-042
  AC: Download PDF on overview with size/version; Print lesson button; graceful missing-PDF state.
- [ ] **T-063 — PDF e2e test** · **B** · deps: T-061
  AC: asserts file exists, page count ≥ modules, contains title text.

## Phase 6 — Release
- [ ] **T-070 — PWA / offline** · **A** · deps: T-044
  AC: service worker caches app shell, lessons visited, Pyodide assets; offline run works.
- [ ] **T-071 — Full e2e journey** · **B** · deps: T-048 ⇄, T-062
  AC: open course → run → complete lessons → pass quiz → reload keeps progress → toggle theme persists → download PDF.
- [ ] **T-072 — Performance budget** · **B** · deps: T-071
  AC: initial JS < 200 KB gz, Lighthouse perf ≥ 90, a11y ≥ 95.
- [ ] **T-073 — Docs + deploy** · **B** · deps: T-071
  AC: README (authoring guide link, commands), deploy workflow to Pages/Netlify, live URL in `PROGRESS.md`.
