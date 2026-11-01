# Python Course Platform — Task Breakdown

**Team:** 4 contributors  
**Companion document:** ARCHITECTURE.md  
**Estimated duration:** 6 weeks  
**Effort scale:** S (small, ≤1 week), M (medium, 1–2 weeks), L (large, 2–3 weeks)

---

## 1. Team Roles

| Person | Role | Responsibility area |
|---|---|---|
| Person 1 | Content Engineer | Content folder structure, Markdown/MDX schema, module & lesson metadata, sample course content, content loading utilities, navigation data model, content validation. |
| Person 2 | Python Runtime Engineer | Pyodide integration strategy, Python Web Worker design, runnable code block contract, stdout/stderr handling, execution state management, timeout & reset behavior, code editor integration requirements. |
| Person 3 | Quiz and Progress Engineer | Quiz schema, quiz state flow, scoring logic, retry logic, progress persistence model, lesson completion tracking, module completion rules, export/import progress design. |
| Person 4 | UI, Theme, and PDF Engineer | App layout, sidebar & header, dark/light theme system, Python-themed design tokens, responsive behavior, PDF export route/flow, print styles, accessibility polish. |

---

## 2. Milestones

| Milestone | Focus | Target |
|---|---|---|
| Milestone 0 | Project setup and architecture validation | End of Week 1 |
| Milestone 1 | Core content and navigation | End of Week 2 |
| Milestone 2 | Runnable Python support | End of Week 3 |
| Milestone 3 | Quiz and progress system | End of Week 4 |
| Milestone 4 | Theme, PDF export, and polish | End of Week 5 |
| Milestone 5 | Integration, testing, and documentation | End of Week 6 |

---

## 3. Task Breakdown by Person

### Person 1: Content Engineer

#### P1-01: Define course content schema
Owner: Person 1
Goal: Create the content model for modules, lessons, and quizzes, including zod validation schemas.
Dependencies: Architecture approval
Deliverables:
- zod schemas for course.json, module.json, lesson frontmatter, quiz.json
- sample module structure
- validation rules
Acceptance Criteria:
- Modules can be loaded in declared order
- Lessons are associated with a module and ordered within it
- Quiz files are linked to modules
- Invalid content files are rejected by validation
Priority: High
Effort: M

#### P1-02: Create folder structure and sample course content
Owner: Person 1
Goal: Scaffold `src/content/courses/python-101/` with 2 modules and at least 3 lessons each, authored in MDX with frontmatter, plus module.json and quiz.json per module.
Dependencies: P1-01
Deliverables:
- content/courses/python-101/ folder structure
- 2 modules × 3+ lessons (MDX)
- module.json and quiz.json per module
Acceptance Criteria:
- Course overview data loads from course.json
- Lesson MDX files include frontmatter with id, title, moduleId, order
- At least one lesson per module contains an executable python-executable block
Priority: High
Effort: L

#### P1-03: Build content loading utilities
Owner: Person 1
Goal: Typed loaders for course.json, module.json, lesson MDX, and quiz.json used by the router and pages.
Dependencies: P1-01
Deliverables:
- src/lib/content.ts with loaders
- typed imports/frontmatter extraction for MDX
Acceptance Criteria:
- Course, module, lesson, and quiz data load with full TypeScript types
- Missing or malformed content surfaces a clear error state
Priority: High
Effort: M

#### P1-04: Implement navigation data model
Owner: Person 1
Goal: Compute previous/next lesson navigation and resume candidates from module/lesson order.
Dependencies: P1-03, P3-01 (progress keys for resume)
Deliverables:
- navigation helper (prev/next lesson resolution)
- first-lesson-of-next-module chaining
Acceptance Criteria:
- Given a lesson ID, the previous and next lesson are resolvable
- Last lesson of a module links to the first lesson of the next module
- Resume candidate is derived from lastVisitedLessonId
Priority: Medium
Effort: M

#### P1-05: Author full sample course
Owner: Person 1
Goal: Write the complete lesson copy and quiz questions for the sample course, including executable Python blocks.
Dependencies: P1-02, P2-03 (executable block contract)
Deliverables:
- Complete MDX lessons for all modules
- Complete quiz.json files per module
Acceptance Criteria:
- Every module ends with a quiz
- Quizzes cover single, multiple, true/false, and short_text question types
- Lessons reference executable blocks consistent with P2-03 contract
Priority: High
Effort: L

#### P1-06: Content validation in CI
Owner: Person 1
Goal: Add a CI validation step that runs zod schemas over all content files.
Dependencies: P1-01
Deliverables:
- CI content validation script
- Schema versioning strategy note
Acceptance Criteria:
- Invalid content fails the build/CI
- New content files are validated before merge
Priority: Medium
Effort: S

---

### Person 2: Python Runtime Engineer

#### P2-01: Pyodide integration strategy and loading
Owner: Person 2
Goal: Configure Pyodide CDN loading (with optional self-host path), a readiness promise, and a loading UI state.
Dependencies: Architecture approval
Deliverables:
- pyodide loader module
- loading/ready/error status states
Acceptance Criteria:
- Pyodide loads from CDN on first use
- UI shows "Loading Python runtime…" until ready
- Subsequent uses skip re-download (cached promise)
Priority: High
Effort: L

#### P2-02: Design Python Web Worker
Owner: Person 2
Goal: Create `src/worker/pythonWorker.ts` that initializes Pyodide off the main thread and executes code via postMessage.
Dependencies: P2-01
Deliverables:
- worker entry point
- postMessage protocol (RUN, RESULT, STATUS messages)
Acceptance Criteria:
- Code execution does not block the UI thread
- Worker reports loading/ready/error status back to main thread
Priority: High
Effort: L

#### P2-03: Define runnable code block contract
Owner: Person 2
Goal: Specify the props contract between the MDX layer and the Python runner for executable code blocks.
Dependencies: P1-01, P2-02, P4-01 (UI shell context)
Deliverables:
- ExecutableCodeBlockProps type definition
- blockId convention for code persistence
Acceptance Criteria:
- Contract covers code, language, status, stdout, stderr, onRun, onReset
- blockId uniquely identifies a block within a lesson for edit persistence
Priority: High
Effort: M

#### P2-04: stdout/stderr capture and output panel
Owner: Person 2
Goal: Capture Python stdout/stderr in the worker and return them for display in an output panel.
Dependencies: P2-02
Deliverables:
- stream capture mechanism in worker
- result message with stdout/stderr/error/duration
Acceptance Criteria:
- stdout and stderr are separately capturable
- Output panel renders both streams distinctly
- Large output is truncated with a notice
Priority: High
Effort: M

#### P2-05: Execution state management
Owner: Person 2
Goal: Manage per-block execution status (idle/running/success/error/timeout) in the Python store.
Dependencies: P2-02
Deliverables:
- pythonStore (Zustand) with execution status per blockId
Acceptance Criteria:
- Run button disables while running
- Error state surfaces the exception message
- Status resets to idle on reset or new code
Priority: High
Effort: M

#### P2-06: Timeout and reset behavior
Owner: Person 2
Goal: Enforce execution time limits and allow resetting a block to its original source.
Dependencies: P2-02, P2-04
Deliverables:
- AbortController-based timeout (e.g., 10s)
- worker termination on timeout
- reset restores original code from content
Acceptance Criteria:
- Execution exceeding the limit returns a timeout error
- Reset button restores original source and clears output
- Edited code is preserved across navigation via progress store
Priority: High
Effort: M

#### P2-07: Code editor integration requirements
Owner: Person 2
Goal: Define editor component requirements (with Person 4) for the editable Python block.
Dependencies: P2-03, P4-01
Deliverables:
- Editor component spec (props, monospace, read-only vs editable modes)
Acceptance Criteria:
- Editor supports keyboard shortcuts for Run (e.g., Ctrl+Enter)
- Editor is theme-aware (dark/light)
Priority: Medium
Effort: M

#### P2-08: Safety limits
Owner: Person 2
Goal: Constrain Pyodide execution to a safe subset (virtual FS only, no network, output cap).
Dependencies: P2-02
Deliverables:
- Worker sandboxing notes
- Output size cap constant
Acceptance Criteria:
- No real file system or network access from executed code
- Output beyond the cap is truncated
Priority: Medium
Effort: S

---

### Person 3: Quiz and Progress Engineer

#### P3-01: Define quiz schema and state flow
Owner: Person 3
Goal: Define the quiz JSON schema and the end-to-end quiz state flow (load → answer → submit → score → review → retry).
Dependencies: P1-01
Deliverables:
- quiz.json schema (zod)
- QuizAttempt, QuizResult, QuizSubmission types
- state flow diagram/notes
Acceptance Criteria:
- All question types (single, multiple, true_false, short_text) represented
- Flow handles answers, scoring, and retry cleanly
Priority: High
Effort: M

#### P3-02: Implement scoring logic
Owner: Person 3
Goal: Compute quiz scores from answers and compare against passScore.
Dependencies: P3-01
Deliverables:
- scoring function (points earned / total points × 100)
- pass/fail determination
Acceptance Criteria:
- Single choice: full points if correct option selected
- Multiple choice: partial or all-or-nothing scoring documented and implemented
- Score is 0–100; passed = score >= passScore
Priority: High
Effort: S

#### P3-03: Implement retry logic
Owner: Person 3
Goal: Track quiz attempts and allow unlimited (or capped) retries.
Dependencies: P3-01
Deliverables:
- attempt storage with attemptId and timestamp
- retry reset behavior
Acceptance Criteria:
- Each submission creates a new attempt record
- Learner can restart the quiz after viewing results
Priority: Medium
Effort: S

#### P3-04: Build progress persistence model
Owner: Person 3
Goal: Define ProgressState shape and persistence layer (localStorage primary, IndexedDB optional).
Dependencies: P3-01
Deliverables:
- ProgressState type
- localStorage read/write with rehydration
- optional IndexedDB overflow path
Acceptance Criteria:
- Progress survives page reload
- Version field supports future migrations
- Storage errors are caught and surfaced gracefully
Priority: High
Effort: M

#### P3-05: Lesson completion tracking
Owner: Person 3
Goal: Track completed lessons and last visited lesson.
Dependencies: P3-04, P1-04
Deliverables:
- markLessonComplete action
- lastVisitedLessonId / lastVisitedAt updates
Acceptance Criteria:
- Completing a lesson persists to localStorage
- Every lesson visit updates lastVisitedLessonId
Priority: High
Effort: S

#### P3-06: Module completion rules
Owner: Person 3
Goal: Determine module completion from lesson completion + passed quiz.
Dependencies: P3-02, P3-05
Deliverables:
- isModuleCompleted derived rule
- module completion timestamp
Acceptance Criteria:
- Module completes only when all lessons complete AND latest quiz passed
- Completion state reflected on module page and course overview
Priority: High
Effort: M

#### P3-07: Quiz result persistence and display
Owner: Person 3
Goal: Save quiz attempts and show correct answers + explanations after submission.
Dependencies: P3-01, P3-04
Deliverables:
- saveQuizAttempt action
- QuizResult view with per-question correctness and explanations
Acceptance Criteria:
- Attempts are appended to module progress
- After submission, user sees which answers were correct/incorrect with explanations
Priority: High
Effort: M

#### P3-08: Progress export/import
Owner: Person 3
Goal: Download progress as JSON and upload/import with validation and merge.
Dependencies: P3-04
Deliverables:
- export progress JSON file
- import progress with schema validation and merge strategy
Acceptance Criteria:
- Exported file contains all progress data
- Imported file validates against current schema; version mismatches handled
Priority: Medium
Effort: M

---

### Person 4: UI, Theme, and PDF Engineer

#### P4-01: App layout shell
Owner: Person 4
Goal: Build Layout, Sidebar, Header, route wiring, and primitive UI components.
Dependencies: P1-03 (content loading for navigation)
Deliverables:
- src/components/layout/* (Layout, Sidebar, Header, ThemeToggle)
- src/components/ui/* primitives
- router integration with all routes
Acceptance Criteria:
- All routes from ARCHITECTURE.md section 5 render in the layout
- Sidebar lists modules; header shows course title and user actions
Priority: High
Effort: L

#### P4-02: Dark/light theme system
Owner: Person 4
Goal: Implement theme persistence, system preference detection, and flash-free theme application.
Dependencies: Architecture approval
Deliverables:
- inline <head> theme script
- data-theme attribute on <html>
- themeStore persistence to localStorage
Acceptance Criteria:
- Theme applied before React hydration (no flash)
- Toggle persists choice across reloads
- System preference respected when set to "system"
Priority: High
Effort: M

#### P4-03: Python-themed design tokens
Owner: Person 4
Goal: Define CSS custom properties for colors, surfaces, and accents inspired by Python.
Dependencies: P4-02
Deliverables:
- globals.css design tokens (python blue #3776AB, python yellow #FFD43B, slate surfaces)
Acceptance Criteria:
- Tokens used consistently across light and dark themes
- WCAG AA contrast verified for primary colors
Priority: High
Effort: S

#### P4-04: Responsive behavior
Owner: Person 4
Goal: Make layout responsive: collapsible sidebar/drawer on mobile, code block horizontal scroll.
Dependencies: P4-01
Deliverables:
- breakpoint CSS (768px / 1024px)
- mobile drawer behavior
Acceptance Criteria:
- Course navigable on mobile viewport
- Code blocks remain readable on small screens
Priority: Medium
Effort: M

#### P4-05: PDF export route and print styles
Owner: Person 4
Goal: Build /export/pdf page with print-friendly layout and window.print() integration.
Dependencies: P4-01, P1-06 (content complete)
Deliverables:
- PdfExportPage component
- print.css (@media print styles)
- print trigger (window.print())
Acceptance Criteria:
- Full course renders in print layout (modules, lessons, code blocks, quizzes)
- Nav, sidebar, buttons hidden in print
- Code blocks use print-safe styling with page-break control
Priority: High
Effort: L

#### P4-06: Accessibility polish
Owner: Person 4
Goal: Apply accessibility requirements across focus states, keyboard nav, quiz ARIA, and theme toggle.
Dependencies: P4-01 … P4-05
Deliverables:
- focus-visible styling across components
- skip-to-content link
- quiz fieldset/legend and radiogroup markup
- theme toggle accessible name + keyboard activation
Acceptance Criteria:
- Keyboard-only navigation completes core flows
- Quiz interactions are screen-reader accessible
- Theme toggle announces current theme
Priority: High
Effort: M

#### P4-07: Course page UI components
Owner: Person 4
Goal: Implement CourseOverview, ModuleList, LessonPage, PrevNextNav, ResumeBanner.
Dependencies: P1-03, P1-04, P4-01
Deliverables:
- course page components wired to content loaders and progress store
Acceptance Criteria:
- Overview shows module list with completion summary
- Lesson page renders MDX with prev/next nav
- Resume banner offers jump to last visited lesson
Priority: High
Effort: L

---

## 4. Parallel Work Plan

**Tasks that can proceed in parallel:**
- Person 2 can begin P2-01 (Pyodide loading) and P2-02 (worker) immediately after Milestone 0, independent of content.
- Person 4 can begin P4-02 (theme system) and P4-01 (layout shell) in Milestone 1 alongside Person 1's content authoring, since theme and layout do not depend on lesson copy.
- Person 1's content authoring (P1-02, P1-05) runs in parallel with Person 2's worker development (P2-02 … P2-06).

**Coordination points:**
- P1-01 (content schema) must finish before P2-03 (executable block contract) and P3-01 (quiz schema) are finalized.
- P2-03 must finish before P1-05 authors executable blocks and before Person 4 builds PythonCodeBlock UI.
- P3-01 must finish before P3-04 (progress keys reference lesson/module IDs from P1).
- P4-05 (PDF export) requires near-final content from P1-06 to validate print layout.
- All four owners must agree on shared types in `src/types/index.ts` before Milestone 1 ends.
- Weekly sync recommended; integration day at the start of each milestone.

---

## 5. Integration Points

**File contracts:**
- `content/courses/<id>/course.json` → consumed by P1 (loader), P4 (overview/sidebar navigation).
- `content/courses/<id>/modules/<id>/module.json` → module page data.
- Lesson MDX frontmatter → lesson page metadata + navigation keys.
- `content/courses/<id>/modules/<id>/quiz.json` → quiz engine input.

**Shared data shapes (defined in `src/types/index.ts`, consumed by all):**
- `CourseConfig`, `ModuleConfig`, `LessonFrontmatter`, `Lesson`
- `Quiz`, `QuizQuestion`, `QuizSubmission`, `QuizAttempt`, `QuizResult`
- `ProgressState`, `LessonProgress`, `ModuleProgress`
- `ThemePreference`
- `ExecutableCodeBlockProps`

**Component prop contracts (shapes only):**
- `PythonCodeBlock { blockId, code, language, status, stdout, stderr, onRun, onReset }` — owned by P2, rendered by P1's MDX layer and styled by P4.
- `QuizPage { moduleId }` — owned by P3, rendered inside P4's layout.
- `ThemeToggle { }` — owned by P4, consumes `themeStore`.
- `ProgressIndicator { }` — owned by P3, consumes `progressStore`.

**API contracts:** None required for Milestones 0–4 (local-first). If a backend is added later, the contract surface is limited to progress sync and content delivery endpoints.

---

## 6. Risk Areas

| Risk | Description | Mitigation |
|---|---|---|
| Pyodide loading performance | Pyodide is several MB; first-run delay may feel slow. | Lazy-load on first executable block, show loading UI, cache readiness promise, optional self-hosting. |
| PDF export quality | Print pagination, code overflow, and browser variation. | Iterate print.css on real content; test print-to-PDF in Chrome/Firefox/Safari; consider a client-side PDF library fallback. |
| Quiz state persistence | localStorage quota (~5 MB), schema drift across versions. | Versioned ProgressState, export/import fallback, IndexedDB overflow path. |
| Markdown extensibility | Custom executable blocks require disciplined MDX/rehype use. | Zod content validation, rehype-sanitize allow-list, explicit fence marker for executable blocks. |
| Accessibility | Quiz interactions, focus management, theme toggle. | Dedicated accessibility task (P4-06), axe/Playwright checks, ARIA review before Milestone 5. |
| Mobile responsiveness | Sidebar and code blocks on small screens. | Breakpoints, horizontal code scroll, drawer navigation, device-emulator testing. |

---

## 7. Definition of Done

The team is ready to begin implementation when:

- ARCHITECTURE.md and TASKS.md are reviewed and approved by all four contributors.
- Milestone 0 is complete: repository scaffolded, stack installed, architecture validated.
- Every task has a single owner, listed dependencies, deliverables, acceptance criteria, priority, and effort estimate.
- Cross-person dependencies are documented and confirmed by the affected owners.
- No major feature area is unassigned: content (P1), Python runtime (P2), quiz & progress (P3), UI/theme/PDF (P4), and testing (shared, Milestone 5) are all covered.