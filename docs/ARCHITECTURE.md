# ARCHITECTURE

## 1. Style
Static **client-side SPA** + **build-time content pipeline**. No server. Layered, with pure core logic
isolated from UI and from the Python runtime.

```
 ┌──────────────────────────────  BUILD TIME  ──────────────────────────────┐
 │ content/**/*.md ─► content:build ─► validate (zod) ─► manifest.json       │
 │                                  └► lesson JSON/HTML AST chunks           │
 │ content:verify ─► run every ```python block in real CPython (CI gate)     │
 │ pdf ─► Playwright loads /print/:course ─► runs cells in Pyodide ─► PDF    │
 └───────────────────────────────────────────────────────────────────────────┘
 ┌──────────────────────────────  RUN TIME  ────────────────────────────────┐
 │  UI (React + Router)                                                      │
 │   pages ─► features ─► components                                         │
 │        │         │                                                        │
 │        ▼         ▼                                                        │
 │  core (pure TS)         stores (Zustand)        runtime (Web Worker)      │
 │  - content model        - progress (persist)    - Pyodide loader          │
 │  - quiz grading         - theme                 - run / stop / timeout    │
 │  - progress math        - settings              - stdout/stderr capture   │
 │  - unlock rules                                 - exercise test runner    │
 │        │                                                                  │
 │        ▼                                                                  │
 │  storage adapter (localStorage, versioned + migrations, JSON export)      │
 └───────────────────────────────────────────────────────────────────────────┘
```

## 2. Tech stack (see DECISIONS.md for rationale)
| Concern | Choice |
|---|---|
| Language | TypeScript 5 (strict) |
| Build | Vite |
| UI | React 18 + React Router (data router) |
| Styling | CSS variables (design tokens) + CSS Modules; Tailwind NOT used |
| State | Zustand + `persist` middleware (custom storage adapter) |
| Markdown | unified: `remark-parse` → `remark-gfm` → `remark-frontmatter` → `remark-math` → custom plugins → `rehype` (+ `rehype-pretty-code`/Shiki for highlighting) |
| Python in browser | Pyodide in a dedicated Web Worker, `comlink` for RPC |
| Code editor | CodeMirror 6 (Python lang, light/dark themes) |
| Quiz schema | YAML in ```` ```quiz ```` fence, validated by Zod |
| PDF | Build-time Playwright (Chromium) printing the `/print/:course` route |
| Search | MiniSearch index built at content build |
| Tests | Vitest (unit), Testing Library, Playwright (e2e + pdf), `pytest`-free python verify script |
| Lint/format | ESLint (typescript-eslint strict) + Prettier |
| Package mgr | pnpm |

## 3. Repository layout
```
.
├─ AGENTS.md  tasks.md  PROGRESS.md  opencode.json
├─ docs/
├─ content/
│  └─ python-basics/
│     ├─ course.yml
│     ├─ 01-getting-started/
│     │  ├─ module.yml
│     │  ├─ 01-hello-python.md
│     │  ├─ 02-variables.md
│     │  └─ 99-quiz.md              # module quiz (type: quiz)
│     └─ 02-control-flow/ ...
├─ scripts/
│  ├─ content-build.ts   content-verify.ts   pdf.ts   progress.ts
├─ src/
│  ├─ core/        # PURE: types, content model, grading, progress math, unlock rules
│  ├─ content/     # remark/rehype plugins, loaders, manifest types
│  ├─ runtime/     # pyodide.worker.ts, client.ts (comlink), exercise runner
│  ├─ store/       # progress.ts, theme.ts, settings.ts, storage.ts (+migrations)
│  ├─ features/
│  │  ├─ catalog/  ├─ course/  ├─ lesson/  ├─ quiz/  ├─ playground/  ├─ search/  ├─ pdf/
│  ├─ components/  # CodeCell, Quiz, ThemeToggle, ProgressBar, Callout, Layout…
│  ├─ routes/      # router config, pages
│  ├─ styles/      # tokens.css, base.css, print.css, themes
│  └─ main.tsx
├─ public/         # pdf/*.pdf (generated), favicon, pyodide assets (optional self-host)
└─ tests/          # unit/, e2e/
```

## 4. Core domain model (`src/core/types.ts`)
```ts
export type ID = string;                      // "python-basics/01-getting-started/01-hello-python"

export interface Course {
  id: ID; title: string; description: string; level: 'beginner'|'intermediate'|'advanced';
  version: string; gating: 'none'|'quiz';     // quiz = next module locked until quiz passed
  modules: Module[]; pythonPackages?: string[]; // micropip/pyodide packages allowed
}
export interface Module {
  id: ID; courseId: ID; title: string; order: number;
  lessons: LessonMeta[]; quiz: QuizMeta;      // quiz is REQUIRED (build fails otherwise)
}
export interface LessonMeta { id: ID; title: string; order: number; minutes: number; hasRunnable: boolean }
export interface Quiz { id: ID; passScore: number; questions: Question[]; shuffle: boolean }
export type Question =
  | { type: 'single';   q: string; options: string[]; answer: number;     explain: string }
  | { type: 'multiple'; q: string; options: string[]; answer: number[];   explain: string }
  | { type: 'boolean';  q: string; answer: boolean;                       explain: string }
  | { type: 'short';    q: string; answer: string[]; caseSensitive?: boolean; explain: string };
```

## 5. Content pipeline
1. `content:build` walks `content/`, parses frontmatter/YAML, validates with Zod, emits:
   - `src/generated/manifest.json` (courses → modules → lessons, order, minutes, flags)
   - `src/generated/lessons/<id>.json` (mdast/hast + extracted code cells + quiz) — code-split per lesson
   - `src/generated/search-index.json`
2. Hard build errors: missing quiz in a module, duplicate IDs, unknown code-fence flags, broken internal links, quiz answer index out of range.
3. `content:verify` executes every `python run|edit` block (and exercise solution + tests) in real CPython with a timeout, to guarantee examples are not broken.

## 6. Python runtime (Web Worker)
- Lazy: Pyodide loaded on first Run, shared across all cells on a page (one interpreter per tab).
- **Isolation per run**: each run executes in a fresh `globals()` dict; "Shared scope" lessons can opt in (`scope: lesson`) so cells run top-to-bottom like a notebook.
- stdout/stderr captured by redirecting `sys.stdout/sys.stderr`; return last-expression repr.
- **Stop/timeout**: default 10 s; on timeout the worker is `terminate()`d and recreated (Pyodide interrupt buffer used first when `SharedArrayBuffer` is available).
- `input()` supported via modal prompt (worker ↔ main message).
- Exercises: learner code + hidden test block run in the same namespace; tests use plain `assert` with messages; result `{passed, failures[]}`.
- Packages: only those listed in `course.yml → pythonPackages` (loaded via `loadPackage`/`micropip`).
- Security: runs in browser sandbox; no network access promised to content; CSP limits scripts to self + Pyodide CDN (or self-hosted).

## 7. Progress & quiz logic (pure, in `src/core`)
```ts
interface ProgressV1 {
  version: 1;
  courses: Record<ID, {
    lessons: Record<ID, { completedAt: string }>;
    quizzes: Record<ID, { best: number; attempts: number; passed: boolean; lastAt: string }>;
    exercises: Record<string, { passed: boolean; at: string }>;
    last?: ID;                       // resume pointer
  }>;
}
```
- Course % = (completed lessons + passed quizzes) / (total lessons + total quizzes).
- Module % computed the same way. A lesson auto-completes on "Mark complete" or when scrolled to end + all its exercises passed (setting).
- Unlock: `gating: quiz` → module *n+1* locked until module *n* quiz `passed`. Default `none` (only shows a nudge).
- Storage key `pycourses:progress:v1`; adapter handles migrations, corruption fallback (backup then reset), JSON import/export.

## 8. Theming
- Tokens in `src/styles/tokens.css`; `[data-theme="light|dark"]` on `<html>`.
- Inline script in `index.html` sets theme before paint (prevents flash). Mode: `system | light | dark`.
- CodeMirror and Shiki themes swapped via CSS variables / dual-theme output.

## 9. PDF export
See `PDF_EXPORT.md`. Summary: generated at build (`pnpm pdf`) to `public/pdf/<course>.pdf` and linked by the
"Download PDF" button; `print.css` also makes the browser "Print lesson" output clean.

## 10. Routes
```
/                              catalog
/c/:course                     overview (TOC, progress, PDF button, resume)
/c/:course/:module/:lesson     lesson
/c/:course/:module/quiz        module quiz
/print/:course                 print-only full course (used by PDF generator)
/progress                      progress dashboard + import/export
/search?q=
```

## 11. Error handling & edge cases
- Pyodide fails to load → inline error with retry; rest of lesson still readable.
- localStorage unavailable/quota → in-memory fallback + banner.
- Unknown lesson ID → 404 page with course link.
- Content version bump → keep progress for unchanged lesson IDs; orphaned entries ignored.

## 12. Deployment
Static output of `vite build` + `public/pdf`. CI: typecheck → lint → unit → content:build → content:verify → build → e2e → pdf → deploy.
