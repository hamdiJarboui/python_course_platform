# Python Course Platform — Architecture

**Status:** Architecture specification (pre-implementation)  
**Audience:** Engineering team of 4  
**Companion document:** TASKS.md

---

## 1. Project Summary

**Platform** (working title: PyCourse) is a frontend-first, local-first web platform for learning Python through Markdown/MDX-based courses. Learners browse modules and lessons, edit and run Python code blocks directly in the browser, take a quiz at the end of each module, and have their progress persisted locally. The UI supports dark and light modes with a Python-inspired visual theme, and the full course can be exported as a PDF.

**Main goals**
- Author and deliver course content entirely in Markdown/MDX with structured metadata.
- Run Python code in the browser using Pyodide (no backend required).
- Track learner progress locally (lessons, modules, quiz attempts, last visited lesson).
- Provide an accessible, responsive UI with dark/light mode and no theme flash on load.
- Export the complete course (modules, lessons, code blocks, quizzes) to PDF client-side.

**Main constraints**
- Application built with TypeScript.
- Course content in Markdown/MDX; metadata in frontmatter/JSON/YAML.
- Frontend-first, local-first; avoid a backend unless absolutely necessary.
- Client-side Python execution only.
- Deployable as a static site.

**Key assumptions**
- React + Vite as the frontend foundation.
- Pyodide loaded from a CDN (with optional self-hosting).
- localStorage as primary persistence; IndexedDB as optional overflow.
- Browser print-to-PDF as the primary export path.

---

## 2. Recommended Technology Stack

| Concern | Recommendation | Rationale |
|---|---|---|
| Framework | React 18/19 + TypeScript 5 | Component UI, strict typing, large ecosystem |
| Build tool | Vite | Fast dev server, static builds, MDX plugin support |
| Routing | React Router DOM v6 | Dynamic routes for modules, lessons, quizzes |
| Styling | CSS custom properties (design tokens) + optional CSS modules | No heavy UI library; full control over theming |
| Markdown/MDX | @mdx-js/react, gray-matter (frontmatter), rehype-highlight/rehype-sanitize, zod (validation) | MDX components, metadata extraction, syntax highlighting, safe HTML |
| Python execution | Pyodide (CDN/jsDelivr, optional self-host) + Web Worker | Browser-based Python, off main thread |
| State management | Zustand | Minimal boilerplate global stores with persistence middleware |
| Local persistence | localStorage (primary), IndexedDB via idb-keyval (optional overflow) | Simple key/value progress; larger payloads if needed |
| PDF export | Browser `window.print()` with `@media print` stylesheet | Zero dependencies, print-friendly layout |
| Testing | Vitest, React Testing Library, Playwright | Unit, component, and E2E coverage |
| Tooling | ESLint, Prettier, TypeScript strict mode | Code quality and type safety |

---

## 3. High-Level Architecture

The application is a single-page application that runs entirely in the browser. Content files (MDX lessons, JSON module/quiz metadata) are loaded as static assets. The MDX layer compiles lessons into React trees with custom components. Runnable Python code blocks are handled by a dedicated Web Worker that loads Pyodide on demand. Learner progress is stored locally and drives resume behavior and module gating. A theme manager applies dark/light mode before React hydrates to prevent flash. PDF export is a print-layout page triggered by `window.print()`.

### Architecture diagram

```
                          ┌─────────────────────────────────────────┐
                          │           Browser (Client Only)          │
                          │                                           │
┌─────────────────────┐   │   Router (React Router DOM)              │
│                     │   │   ┌──────────────────────────────┐       │
│   Content files     │   │   │  /       CourseOverview      │       │
│  course.json        │   │   │  /modules/:id                │       │
│  module.json        │   │   │  /modules/:id/lessons/:lesson│       │
│  lesson.mdx         │   │   │  /modules/:id/quiz           │       │
│  quiz.json          │   │   │  /export/pdf                 │       │
│                     │   │   │  /settings                   │       │
│                     │   │   └───────────┬──────────────────┘       │
└──────────┬──────────┘   │               │                            │
           │               ▼               ▼                            │
           │   ┌─────────────────────────────────────────────┐         │
           │   │              UI Layer (React)               │         │
           │   │  Layout · Sidebar · Header · Pages · UI kit │         │
           │   └──────────┬────────────────┬─────────────────┘         │
           │              │                │                             │
           │   ┌──────────┴──────────┐  ┌──┴──────────┐                 │
           │   │  MDX Rendering      │  │  Quiz       │                 │
           │   │  (custom components)│  │  Engine     │                 │
           │   └──────────┬──────────┘  └──────┬──────┘                 │
           │              │                    │                          │
           │   ┌──────────┴──────────┐  ┌──────┴──────┐                  │
           │   │ Python Executable   │  │ Progress    │                  │
           │   │ Code Blocks ───────▶│ Web Worker ───▶│ Store            │
           │   │                     │ (Pyodide)     │ (localStorage)   │
           │   └──────────┬──────────┘  └──────┬──────┘                  │
           │              │                    │                          │
           │   ┌──────────┴──────────┐  ┌──────┴──────┐                  │
           │   │ Theme Manager       │  │ PDF Export  │                  │
           │   │ (dark/light/system) │  │ (print CSS) │                  │
           │   └─────────────────────┘  └─────────────┘                  │
                                                                          │
Relationships:                                                            │
- Content feeds MDX rendering and the quiz engine.                       │
- Python executable blocks call the Pyodide worker; results flow back to │
  the UI output panel.                                                   │
- Quiz results and lesson completion update the progress store, which   │
  gates module completion and drives resume.                             │
- Theme manager styles all layers; PDF export renders the full content   │
  tree in a print-friendly layout.                                       │
```

---

## 4. Folder Structure

```
python-course-platform/
├── README.md
├── ARCHITECTURE.md
├── TASKS.md
├── index.html
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── prettier.config.*
├── vitest.config.ts
├── playwright.config.ts
├── public/
│   └── pyodide/                 # Optional self-hosted Pyodide (else CDN)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx               # Route definitions
│   ├── stores/                  # Zustand stores
│   │   ├── progressStore.ts
│   │   ├── themeStore.ts
│   │   └── pythonStore.ts
│   ├── lib/
│   │   ├── content.ts           # Content loaders + zod validation
│   │   ├── mdx.ts               # MDX compiler + MDXProvider components
│   │   ├── python.ts            # Pyodide worker bridge (postMessage)
│   │   ├── quiz.ts              # Scoring + validation helpers
│   │   ├── pdf.ts               # Print/PDF helpers
│   │   └── storage.ts           # localStorage / IndexedDB wrappers
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── course/
│   │   │   ├── CourseOverview.tsx
│   │   │   ├── ModuleList.tsx
│   │   │   ├── LessonPage.tsx
│   │   │   ├── PrevNextNav.tsx
│   │   │   └── ResumeBanner.tsx
│   │   ├── python/
│   │   │   ├── PythonCodeBlock.tsx
│   │   │   ├── PythonRunner.tsx
│   │   │   ├── OutputPanel.tsx
│   │   │   └── RunResetButtons.tsx
│   │   ├── quiz/
│   │   │   ├── QuizPage.tsx
│   │   │   ├── QuestionRenderer.tsx
│   │   │   ├── QuizResult.tsx
│   │   │   └── RetryControl.tsx
│   │   ├── progress/
│   │   │   ├── ProgressIndicator.tsx
│   │   │   └── ExportImportProgress.tsx
│   │   ├── export/
│   │   │   └── PdfExportPage.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Dialog.tsx
│   │       └── Tooltip.tsx
│   ├── hooks/
│   │   ├── useContent.ts
│   │   ├── useProgress.ts
│   │   ├── useQuiz.ts
│   │   ├── usePython.ts
│   │   └── useTheme.ts
│   ├── types/
│   │   └── index.ts             # All shared TypeScript interfaces
│   ├── styles/
│   │   ├── globals.css          # Design tokens + dark/light variables
│   │   ├── print.css            # @media print styles
│   │   └── code.css             # Code block styling
│   ├── content/
│   │   └── courses/
│   │       └── python-101/
│   │           ├── course.json
│   │           ├── modules/
│   │           │   ├── 01-basics/
│   │           │   │   ├── module.json
│   │           │   │   ├── lesson-01.mdx
│   │           │   │   └── quiz.json
│   │           │   └── ...
│   │           └── ...
│   ├── worker/
│   │   └── pythonWorker.ts      # Pyodide Web Worker entry point
│   └── tests/
│       ├── content/
│       ├── components/
│       └── integration/
```

---

## 5. Routing Architecture

| Route | Renders | Purpose |
|---|---|---|
| `/` | `CourseOverview` | Course overview: title, description, module list with completion summary. |
| `/modules/:moduleId` | `ModulePage` | Module metadata, ordered lesson list, quiz entry point, module completion state. |
| `/modules/:moduleId/lessons/:lessonId` | `LessonPage` | MDX lesson body, executable code blocks, previous/next navigation, resume marker. |
| `/modules/:moduleId/quiz` | `QuizPage` | Quiz form (all question types), submission, results, retry control. |
| `/export/pdf` | `PdfExportPage` | Full-course print view; triggers `window.print()`. |
| `/settings` | `SettingsPage` | Theme preference, progress export/import. |
| `/resume` | Redirect (client-side) | Redirects to `lastVisitedLessonId` from progress store. |

Dynamic segments `:moduleId` and `:lessonId` must match content IDs defined in `course.json` / `module.json`. Unknown module or lesson IDs render a 404-style "not found" state within the layout.

---

## 6. Content Model

Content lives under `src/content/courses/<courseId>/`. Each module is a folder containing `module.json`, lesson MDX files, and `quiz.json`.

### Example: course.json
```json
{
  "id": "python-101",
  "title": "Python 101",
  "description": "Introduction to Python programming",
  "version": "1.0.0",
  "modules": [
    { "id": "basics", "order": 1 },
    { "id": "data-structures", "order": 2 }
  ]
}
```

### Example: module.json
```json
{
  "id": "basics",
  "title": "Python Basics",
  "description": "Variables, types, and control flow",
  "order": 1,
  "lessons": [
    { "id": "hello-world", "order": 1 },
    { "id": "variables", "order": 2 }
  ],
  "quiz": { "id": "basics-quiz", "file": "quiz.json" }
}
```

### Example: lesson MDX (frontmatter + body)
```mdx
---
id: hello-world
title: Your First Python Program
moduleId: basics
order: 1
---

# Your First Python Program

Print a message to the console.

```python-executable
print("Hello, Python!")
```

Try changing the message above and run it again.
```

### Example: quiz.json
```json
{
  "id": "basics-quiz",
  "moduleId": "basics",
  "title": "Basics Quiz",
  "passScore": 70,
  "questions": [
    {
      "id": "q1",
      "type": "single",
      "prompt": "Which keyword defines a function?",
      "options": [
        { "id": "a", "label": "def" },
        { "id": "b", "label": "func" },
        { "id": "c", "label": "define" }
      ],
      "correct": ["a"],
      "explanation": "Use `def` to define functions in Python."
    },
    {
      "id": "q2",
      "type": "multiple",
      "prompt": "Which are mutable types?",
      "options": [
        { "id": "a", "label": "list" },
        { "id": "b", "label": "tuple" },
        { "id": "c", "label": "dict" }
      ],
      "correct": ["a", "c"],
      "explanation": "Lists and dicts are mutable; tuples are not."
    },
    {
      "id": "q3",
      "type": "true_false",
      "prompt": "Python is a compiled language only.",
      "correct": false,
      "explanation": "Python is typically interpreted (compiled to bytecode)."
    },
    {
      "id": "q4",
      "type": "short_text",
      "prompt": "What is the output of `type([])`?",
      "correct": ["<class 'list'>", "list"],
      "explanation": "The type of an empty list is `list`."
    }
  ]
}
```

### Ordering
- Modules are ordered by the `order` field in `course.json` (and `module.json`).
- Lessons are ordered by the `order` field inside `module.json`.
- Previous/next navigation is computed from these order fields; the first lesson of the next module follows the last lesson of the current module.

---

## 7. Core Data Types

All definitions live in `src/types/index.ts`. These are type definitions only; no implementation code beyond types.

```ts
// --- Course config ---
export interface CourseConfig {
  id: string;
  title: string;
  description: string;
  version: string;
  modules: Array<{ id: string; order: number }>;
}

export interface ModuleConfig {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Array<{ id: string; order: number }>;
  quiz: { id: string; file: string };
}

export interface LessonFrontmatter {
  id: string;
  title: string;
  moduleId: string;
  order: number;
  description?: string;
}

export interface Lesson {
  frontmatter: LessonFrontmatter;
  body: React.ReactNode; // compiled MDX
  source: string;        // raw MDX source
}

// --- Quiz ---
export type QuestionType = 'single' | 'multiple' | 'true_false' | 'short_text';

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: QuizOption[];          // single / multiple
  correct: string[] | boolean;     // option ids, or boolean for true_false
  explanation?: string;
  points?: number;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  passScore: number;               // 0-100
  questions: QuizQuestion[];
}

export interface QuizSubmission {
  questionId: string;
  answer: string[] | boolean | string;
}

export interface QuizAttempt {
  attemptId: string;
  moduleId: string;
  quizId: string;
  answers: Record<string, string[] | boolean | string>;
  score: number;                   // 0-100
  passed: boolean;
  completedAt: string;             // ISO timestamp
}

export interface QuizResult {
  attempt: QuizAttempt;
  questions: Array<QuizQuestion & { userAnswer?: string[] | boolean | string; correct?: boolean }>;
  passed: boolean;
}

// --- Progress ---
export interface LessonProgress {
  completed: boolean;
  completedAt?: string;
  lastVisitedAt: string;
  codeEdits?: Record<string, string>; // blockId -> edited source
}

export interface ModuleProgress {
  completed: boolean;
  completedAt?: string;
  quizAttempts: QuizAttempt[];
}

export interface ProgressState {
  version: number;
  courseId: string;
  lessons: Record<string, LessonProgress>;
  modules: Record<string, ModuleProgress>;
  lastVisitedLessonId?: string;
  theme?: ThemePreference;
}

// --- Theme ---
export type ThemePreference = 'light' | 'dark' | 'system';

// --- Code block ---
export interface ExecutableCodeBlockProps {
  blockId: string;
  code: string;
  language: string;
  status: 'idle' | 'running' | 'success' | 'error' | 'timeout';
  stdout: string;
  stderr: string;
  onRun: (code: string) => void;
  onReset: () => void;
}
```

---

## 8. Markdown and MDX Rendering Architecture

**Parsing strategy.** MDX files are compiled at build time via the Vite/MDX plugin into React components. Frontmatter is extracted separately (gray-matter or Vite frontmatter plugin) and typed as `LessonFrontmatter`. Lessons are imported as page-level components keyed by module/lesson ID.

**Custom components.** An `MDXProvider` maps HTML elements to custom UI components:
- `code` / `pre`: normal code blocks render syntax-highlighted, read-only.
- Custom `PythonExecutable` component: renders the interactive editor + run/reset controls + output panel.
- `a`, `h1`–`h6`, `p`, `blockquote`, `ul`/`ol`: styled theme-aware components.

**Detecting runnable Python blocks.** Runnable blocks are marked in MDX with a distinct fence info string (recommended: `` ```python-executable ``) or via an MDX shortcode component `<PythonCode>`. The MDX renderer routes these to `PythonCodeBlock` instead of the normal code block.

**Normal vs executable code blocks.**
- Normal block (`` ```python ``): syntax-highlighted static snippet; no editor, no run button.
- Executable block: editable editor, Run button, Reset button, stdout/stderr output panel, loading/runtime state.

---

## 9. Python Execution Architecture

**Browser-based Python.** Pyodide is loaded from a CDN (jsDelivr) on first use; optional self-hosting under `public/pyodide/` for offline or air-gapped use.

**Loading strategy.** Pyodide is lazy-loaded only when the first executable code block is rendered or the user clicks Run. Until ready, the runner shows a "Loading Python runtime…" state. The `pyodideReady` promise is cached so subsequent executions skip the download.

**Web Worker.** Pyodide initialization and code execution run inside a Web Worker (`src/worker/pythonWorker.ts`) to keep the UI thread responsive. Communication via `postMessage`:
- Main → worker: `{ type: 'RUN', code, blockId }`
- Worker → main: `{ type: 'RESULT', blockId, stdout, stderr, error, duration }`
- Worker → main: `{ type: 'STATUS', blockId, status: 'loading'|'ready'|'error' }`

**stdout/stderr capture.** The worker redirects `sys.stdout` and `sys.stderr` to in-memory buffers (or uses Pyodide's `setStdout`) so output is captured as text and returned in the result message. Output larger than a configured cap is truncated with a notice.

**Timeout / safety.** Execution is wrapped with an `AbortController`; if it exceeds the configured limit (e.g., 10 seconds), the worker is terminated and a timeout error is returned. Additional safeguards: virtual file system only (no real FS access), no network access from Pyodide, maximum output size cap.

**Edited code and reset.** Each editable block's current source is tracked in `ProgressState.lessons[lessonId].codeEdits[blockId]`. Reset restores the original source from the lesson content. Edited code persists across navigation within the course session.

---

## 10. Quiz Engine Architecture

**Quiz loading.** On entering `/modules/:moduleId/quiz`, the corresponding `quiz.json` is loaded and validated against the quiz schema. Questions are rendered by type through `QuestionRenderer`.

**Validation.** Client-side validation ensures required questions are answered before submission. Single/multiple choice validate selected option IDs; true/false validates boolean; short text validates non-empty (or matches an accepted answer set if provided).

**Scoring.** Each question carries an optional `points` weight (default 1). Score = (points earned / total points) × 100. `passed = score >= passScore`.

**Retry behavior.** Learners may retry unlimited times (configurable per quiz). Each attempt is stored with a unique `attemptId`, timestamp, answers, score, and passed flag.

**Result persistence.** Attempts are appended to `ProgressState.modules[moduleId].quizAttempts`. The latest attempt is exposed for the results view.

**Correct answers and explanations.** After submission, `QuizResult` displays each question with the user's answer, correctness, and explanation. Correct answers are always revealed after submission.

**Module completion rule.** A module is marked complete when (a) all its lessons are marked complete and (b) the latest quiz attempt is passed. Module completion updates `ProgressState.modules[moduleId].completed`.

---

## 11. Progress Tracking Architecture

**Progress state shape.** See `ProgressState` in section 7: per-lesson completion, per-module completion and quiz attempts, `lastVisitedLessonId`, optional theme preference.

**Where stored.** Primary: `localStorage` under a namespaced key (e.g., `pycourse:progress`). Optional overflow: IndexedDB via `idb-keyval` if payload approaches quota.

**Lesson completion trigger.** A lesson is marked complete when the learner explicitly marks it complete (checkbox/button on the lesson page). `lastVisitedLessonId` and `lastVisitedAt` update on every lesson visit.

**Quiz → module completion.** On quiz submission, the attempt is saved. If `passed` and all lessons are complete, `ModuleProgress.completed` is set.

**Resume learning.** On app initialization, the router reads `lastVisitedLessonId`. A `ResumeBanner` on the course overview offers to jump to the last visited lesson; the `/resume` route redirects there directly.

**Export/import progress.** Progress can be downloaded as a JSON file (export) and uploaded (import). Import validates the incoming shape against the current schema version and merges or replaces local progress, with migration handling for version mismatches.

---

## 12. Theme System Architecture

**Implementation.** A `data-theme` attribute (`light` | `dark`) is applied to the `<html>` element. CSS variables in `globals.css` define colors, surfaces, and accents for each theme. Components read the variables; no hard-coded theme colors in components.

**Persistence.** Theme choice is stored in `localStorage` as `light`, `dark`, or `system`. The toggle writes to both `localStorage` and the Zustand `themeStore`.

**System preference detection.** When `theme === 'system'`, `window.matchMedia('(prefers-color-scheme: dark)')` resolves the effective color scheme; a listener updates the attribute when the OS preference changes.

**No flash of incorrect theme.** A small inline script in `<head>` runs before React hydration: it reads `localStorage` (or the media query) and sets `data-theme` on `<html>` immediately, so the first paint already matches the chosen theme.

**Python-inspired design tokens.** Colors derived from the Python brand palette: Python blue (`#3776AB`) for primary actions/accents, Python yellow (`#FFD43B`) for highlights/cautions, slate/gray surfaces for backgrounds, with contrast ratios meeting WCAG AA for both themes.

---

## 13. PDF Export Architecture

**Recommended approach.** Browser print-to-PDF via a dedicated `/export/pdf` route. The page renders the complete course in a single-column print layout. The user triggers `window.print()` and chooses "Save as PDF". Client-side print CSS (`@media print`) handles the layout; no third-party PDF library is required as the primary path.

**Content included.** All modules, lessons (MDX body), code blocks (static source only — no live execution), and quizzes (questions; answers shown or hidden per a print toggle). Navigation, sidebars, theme toggles, and buttons are hidden in print mode.

**Print styling.** `@media print` styles: white background for code blocks, dark text, page-break control (`break-inside: avoid` on code blocks and questions), fitted fonts, URL underlines for links. Code blocks use a high-contrast print-safe theme.

**Code blocks and quizzes for export.** Code blocks render the current lesson source (or original source if preferred). Quizzes render as static question lists; interactivity (selection, submission) is necessarily lost.

**Limitations and risks.**
- Live Python execution output cannot be captured at print time unless snapshotted earlier.
- Long code snippets or wide output tables may overflow print pages.
- Browser print dialogs vary; exact pagination differs between Chrome/Firefox/Safari.
- If print quality proves insufficient, a fallback client-side PDF library (e.g., `jspdf` + `html2canvas`/`pdfhtml`) can be added later.

---

## 14. State Management Architecture

**Global state (Zustand stores).**
- `themeStore`: active theme, effective theme, toggle action.
- `progressStore`: `ProgressState`, lesson completion, module completion, attempt saving, export/import.
- `pythonStore`: Pyodide readiness, per-block execution status, stdout/stderr.

**Local state (React component state).**
- Per-block editor drafts before they are persisted to progress.
- UI toggles: modals, dropdowns, resume banner dismissal, quiz answer focus.

**Persistence strategy.** The `progressStore` uses Zustand persist middleware to write `ProgressState` to `localStorage` on change and rehydrate on init. A version field supports future schema migrations.

**Initialization flow.**
1. Inline `<head>` script applies theme attribute (prevents flash).
2. App mounts; stores hydrate from `localStorage`.
3. Router loads `course.json`; content layer resolves modules/lessons.
4. If `lastVisitedLessonId` exists, `ResumeBanner` is shown; `/resume` redirects there.
5. Pyodide loads lazily on first run.

---

## 15. Accessibility and UX Requirements

- **Keyboard navigation:** All interactive elements reachable via Tab; skip-to-main-content link; visible focus outlines (`:focus-visible`).
- **Focus states:** Custom focus rings consistent across themes; focus trapped in modals/dialogs.
- **Readable code blocks:** Monospace font stack, sufficient contrast, line wrapping or horizontal scroll, language label announced to screen readers.
- **Responsive layout:** Sidebar collapses to a drawer on mobile; breakpoints at 768px/1024px; code blocks scroll horizontally on small screens.
- **Accessible quiz interactions:** `fieldset`/`legend` for question groups, `role="radiogroup"` for single choice, `aria-describedby` linking explanations, live region (`aria-live="polite"`) for submission feedback.
- **Accessible theme toggle:** Button with accessible label, keyboard activatable (Enter/Space), announces current theme.

---

## 16. Security and Reliability Considerations

- **Browser-based code execution:** Pyodide runs in the same browser sandbox as the app. Lesson code is treated as untrusted within that sandbox; no credentials or secrets are stored client-side.
- **Infinite loop handling:** Per-execution timeout via `AbortController`; worker termination on timeout; user-visible timeout error.
- **Large output handling:** `stdout`/`stderr` capped (e.g., 50,000 characters); truncation notice shown.
- **Storage limits:** `localStorage` ~5 MB quota; monitor usage, surface warnings, offer export/import, fall back to IndexedDB.
- **Content validation:** All `course.json`, `module.json`, `quiz.json` validated with zod schemas on load; unknown question types rejected.
- **Safe Markdown rendering:** `rehype-sanitize` with an allow-list of tags/attributes to prevent XSS from course content; executable blocks only activated via the explicit fence marker/component.

---

## 17. Testing Strategy

- **Unit tests (Vitest):** Storage helpers, quiz scoring/pass logic, URL/slug generation, theme effective-color-scheme resolution, content schema validation.
- **Component tests (React Testing Library):** `PythonCodeBlock` run/reset/output flow, `QuizPage` submission and retry, `LessonPage` previous/next navigation, theme toggle persistence.
- **Integration tests:** Progress + quiz gating module completion; MDX lesson rendering with executable and normal code blocks; export/import round-trip.
- **End-to-end tests (Playwright):** Navigate full course, run a Python block, complete a quiz, verify module completion, toggle theme and reload, trigger PDF export print flow.
- **Content validation tests:** CI script validates every content file against zod schemas; fails the build on invalid content.

---

## 18. Future Improvements

- **Optional backend:** Authentication, course authoring CMS, API for content delivery.
- **User accounts:** Per-user progress, named learner profiles.
- **Cloud progress sync:** Sync `ProgressState` to a backend; cross-device resume.
- **More quiz types:** Fill-in-the-blank, ordering, code-completion (Parsons problems).
- **Certificates:** Generate PDF certificates on course completion.
- **Search:** Client-side search over lesson content (e.g., Flexsearch).
- **Code auto-grading:** Run hidden unit tests against learner code via Pyodide for graded exercises.