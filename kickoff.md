# Python Course Platform — Project Kickoff

**Status:** Ready to start implementation  
**Audience:** Engineering team of 4 + stakeholders  
**Source documents:** ARCHITECTURE.md, STYLES.md, TESTING.md, TASKS.md, content.md

---

## 1. Project Vision

**PyCourse** is a frontend-first, local-first web platform for learning Python through Markdown/MDX-based courses. Learners browse modules and lessons, edit and run Python code blocks directly in the browser (Pyodide), take a quiz at the end of each module, and have their progress persisted locally. The UI supports dark/light mode with a Python-inspired visual theme, and the full course can be exported as a PDF.

**No backend required.** The app is a static site that runs entirely in the browser.

---

## 2. Team & Roles

| Person | Role | Focus |
|---|---|---|
| Person 1 | Content Engineer | Content schema, MDX lessons, module/quiz metadata, content loaders, validation |
| Person 2 | Python Runtime Engineer | Pyodide integration, Web Worker, runnable code blocks, stdout/stderr, timeout/reset |
| Person 3 | Quiz and Progress Engineer | Quiz schema, scoring, retry logic, progress persistence, lesson/module completion, export/import |
| Person 4 | UI, Theme, and PDF Engineer | App layout, sidebar/header, dark/light theme, design tokens, responsive, PDF export, accessibility |

---

## 3. Timeline & Milestones

6 weeks, 5 milestones:

| Milestone | Focus | Target |
|---|---|---|
| M0 | Project setup & architecture validation | End of Week 1 |
| M1 | Core content & navigation | End of Week 2 |
| M2 | Runnable Python support | End of Week 3 |
| M3 | Quiz & progress system | End of Week 4 |
| M4 | Theme, PDF export, polish | End of Week 5 |
| M5 | Integration, testing, documentation | End of Week 6 |

Full task breakdown with IDs, owners, dependencies, deliverables, acceptance criteria, priorities, and effort estimates is in **TASKS.md**.

---

## 4. Design System — Kickoff Prompt Specs (Color & Styles)

These specs are the authoritative reference for implementing the theme, UI components, and print styles. Full details in **STYLES.md**.

### 4.1 Color Palette

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--color-primary` | `#3776AB` | `#4D96C6` | Primary buttons, links, accents |
| `--color-primary-hover` | `#2C5F8A` | `#3E7EA8` | Primary hover |
| `--color-accent` | `#FFD43B` | `#FFE066` | Highlights, cautions |
| `--color-accent-dark` | `#CCA92E` | `#E6C84D` | Text on accent background |
| `--color-success` | `#28A745` | `#34CE57` | Success / pass |
| `--color-error` | `#DC3545` | `#EF5350` | Error / fail |
| `--color-bg` | `#FFFFFF` | `#0F172A` | Page background |
| `--color-bg-surface` | `#F8F9FA` | `#1E293B` | Cards, sidebars |
| `--color-bg-code` | `#F1F3F5` | `#0B1120` | Static code blocks |
| `--color-bg-code-run` | `#E8F4FD` | `#122A45` | Runnable code blocks |
| `--color-text-primary` | `#1A1A1A` | `#F1F5F9` | Headings, body |
| `--color-text-secondary` | `#4A5568` | `#94A3B8` | Secondary text |
| `--color-border` | `#D1D5DB` | `#334155` | Input borders, dividers |
| `--color-border-focus` | `#3776AB` | `#4D96C6` | Focus rings |

### 4.2 Theme Implementation

- Apply `data-theme="light"` / `"dark"` / `"system"` on `<html>`
- Inline `<head>` script sets theme before React hydration (no flash)
- Persisted to `localStorage` as `light`, `dark`, or `system`
- Components consume tokens via `var()` — no hard-coded theme colors
- All combinations must meet WCAG AA contrast (4.5:1 for text, 3:1 for UI)

### 4.3 Typography

- Sans: system-ui stack (UI text)
- Mono: ui-monospace stack (code blocks, inline code)
- Scale: 0.75rem (xs) → 2.25rem (4xl)
- Line-height: 1.25 (tight) / 1.5 (base) / 1.75 (relaxed)

### 4.4 Print Styles (`@media print`)

- Hide nav, sidebar, header, theme toggle, buttons
- White backgrounds, black text, high-contrast monochrome code blocks
- `break-inside: avoid` on code blocks and quiz questions
- Page breaks between modules
- Links show URL in parentheses

---

## 5. Architecture at a Glance

Full details in **ARCHITECTURE.md**.

**Stack:** React 18/19 + TypeScript 5, Vite, React Router DOM v6, Zustand, Pyodide (CDN), Vitest + Playwright.

**Key routes:**
- `/` — Course overview
- `/modules/:moduleId` — Module page
- `/modules/:moduleId/lessons/:lessonId` — Lesson page
- `/modules/:moduleId/quiz` — Quiz page
- `/export/pdf` — PDF export (print view)
- `/settings` — Theme + progress export/import
- `/resume` — Redirect to last visited lesson

**Core data types** (in `src/types/index.ts`): `CourseConfig`, `ModuleConfig`, `Lesson`, `Quiz`, `QuizQuestion`, `QuizAttempt`, `QuizResult`, `ProgressState`, `ThemePreference`, `ExecutableCodeBlockProps`.

**Content model:** `course.json` → `module.json` → lesson `.mdx` files + `quiz.json`, all ordered by `order` field, validated with zod.

---

## 6. Course Content Plan

Full lesson text lives in **content.md**. Summary:

| Module | Lessons | Quiz |
|---|---|---|
| 1. Introduction to Python | Welcome, What is Python?, Installing Python, Running First Program, Understanding Errors | 5 questions |
| 2. Python Basics | Variables, Data Types, Numbers & Math, Strings, User Input | 5 questions |
| 3. Control Flow | Boolean Logic, If Statements, Else/Elif, While Loops, For Loops | 5 questions |
| 4. Functions | Defining Functions, Parameters, Return Values, Scope, Built-in Functions | 5 questions |
| 5. Data Structures | Lists, Tuples, Dictionaries, Sets, Choosing the Right Structure | 5 questions |
| 6. Final Project | Planning, Building Console App, Debugging, Presenting, Next Steps | 5 questions |

Every lesson includes: title, estimated time, objectives, explanation, ≥1 runnable Python block (`python run`), common mistakes, practice exercise, summary, and progress-completion marker.

---

## 7. Testing Strategy

Full details in **TESTING.md**.

| Layer | Tool | Target |
|---|---|---|
| Unit | Vitest | 90%+ coverage on scoring, storage, validation |
| Component | React Testing Library | 80%+ on UI components |
| Integration | Vitest + RTL | Store + component flows |
| E2E | Playwright | Critical paths (full course, Python run, theme persist, PDF) |
| Content validation | Zod + CI gate | All content files validated on every PR |

**CI pipeline:** lint → typecheck → unit → components → content validation → E2E → build. All must pass to merge.

---

## 8. Definition of Done

The team can begin implementation when:

- [ ] All four people have reviewed and agreed on ARCHITECTURE.md, STYLES.md, TESTING.md, TASKS.md
- [ ] Milestone 0 tasks are clear and unblocked
- [ ] Every task has an owner, dependencies, deliverables, acceptance criteria, priority, and effort estimate
- [ ] Cross-person dependencies are documented and confirmed
- [ ] No major feature area is unassigned

---

## 9. Immediate Next Steps (Milestone 0)

1. **Person 1:** Define zod schemas for `course.json`, `module.json`, lesson frontmatter, `quiz.json` (P1-01)
2. **Person 2:** Configure Pyodide CDN loader and Web Worker entry point (P2-01, P2-02)
3. **Person 3:** Define `ProgressState` type and localStorage persistence layer (P3-04)
4. **Person 4:** Set up `data-theme` inline script + CSS custom properties (P4-02)
5. **All:** Agree on shared types in `src/types/index.ts` before end of Week 1

---

## 10. Files in This Kickoff

| File | Purpose |
|---|---|
| `kickoff.md` | This document — project kickoff summary |
| `KICKOFF_PROMPTS.md` | Ready-to-paste kickoff prompts for each team member by role (Person 1–4) |
| `ARCHITECTURE.md` | Full architecture specification (19 sections) |
| `STYLES.md` | Design tokens, color palette, theme & print specs |
| `TESTING.md` | Test strategy across all layers + CI gate |
| `TASKS.md` | 4-person task breakdown across 5 milestones |
| `content.md` | Full Markdown course content source |

---

## 11. Kickoff Prompts — by Person / Role

Each block below is a ready-to-paste kickoff prompt for the named team member (or their coding agent) to start their work. They assume the source documents in this repo (`ARCHITECTURE.md`, `STYLES.md`, `TESTING.md`, `TASKS.md`, `content.md`, `kickoff.md`) are the source of truth. Work one task at a time, satisfy its acceptance criteria, then move to the next.

### 11.1 Person 1 — Content Engineer

```
You are Person 1 — Content Engineer for PyCourse (a frontend-first, local-first Python course platform).

Read first: kickoff.md, ARCHITECTURE.md (sections 5 routes, core data types, content model), TASKS.md (Person 1 tasks), content.md (course plan and lesson copy), STYLES.md (content-adjacent tokens).

Your goal: own the content model end-to-end. Kick off with task P1-01 (define zod schemas for course.json, module.json, lesson frontmatter, and quiz.json, plus validation rules). Then proceed in dependency order:
  P1-01 -> P1-03 (content loaders) and P1-02 (folder structure + 2 modules x 3+ lessons)
  -> P1-04 (navigation helpers; needs P3-01 progress keys)
  -> P1-05 (full course authoring; needs P2-03 executable block contract)
  -> P1-06 (CI content validation).

Rules:
- Implement one task at a time; meet its acceptance criteria before moving on.
- Put shared types in src/types/index.ts only after agreeing with all owners; never silently change them.
- Coordinate: P1-01 must finish before P2-03 and P3-01 are finalized; P2-03 must finish before P1-05 authors executable blocks.
- All content files must pass zod validation; invalid files must fail CI.
- Commit each completed task with its ID (e.g. "P1-01: define content zod schemas").

Stop and ask if an acceptance criterion is ambiguous or a decision contradicts ARCHITECTURE.md.
```

### 11.2 Person 2 — Python Runtime Engineer

```
You are Person 2 — Python Runtime Engineer for PyCourse.

Read first: kickoff.md, ARCHITECTURE.md (stack, routes, core data types), TASKS.md (Person 2 tasks), STYLES.md (code block tokens), TESTING.md (runtime test expectations).

Your goal: own Pyodide integration and runnable code blocks. Kick off with tasks P2-01 (Pyodide CDN loader + readiness promise + loading UI) and P2-02 (Python Web Worker entry point + postMessage protocol). Then proceed in dependency order:
  P2-01 -> P2-02 -> P2-04 (stdout/stderr capture) and P2-05 (execution state store)
  -> P2-06 (timeout + reset) and P2-08 (safety limits)
  -> P2-03 (runnable code block contract; needs P1-01 and P4-01)
  -> P2-07 (code editor integration spec; needs P2-03 and P4-01).

Rules:
- Keep all Pyodide work off the main thread via the worker; never block the UI.
- Enforce the 10s execution timeout and truncate oversized output.
- Coordinate: P2-03 (block contract) must finish before P1-05 authors executable blocks and before Person 4 builds PythonCodeBlock UI.
- Commit each completed task with its ID (e.g. "P2-01: configure Pyodide CDN loader").

Stop and ask if an acceptance criterion is ambiguous or a decision contradicts ARCHITECTURE.md.
```

### 11.3 Person 3 — Quiz and Progress Engineer

```
You are Person 3 — Quiz and Progress Engineer for PyCourse.

Read first: kickoff.md, ARCHITECTURE.md (core data types, routes), TASKS.md (Person 3 tasks), TESTING.md (scoring/storage test expectations).

Your goal: own quiz schema, scoring, retry logic, and progress persistence. Kick off with task P3-01 (quiz schema + state flow) and P3-04 (ProgressState type + localStorage persistence layer). Then proceed in dependency order:
  P3-01 -> P3-02 (scoring logic) and P3-03 (retry logic)
  -> P3-05 (lesson completion tracking; needs P1-04 navigation)
  -> P3-06 (module completion rules; needs P3-02 and P3-05)
  -> P3-07 (quiz result persistence + display)
  -> P3-08 (progress export/import).

Rules:
- Persist progress to localStorage with a version field and migration support; catch storage errors.
- Coordinate: P3-01 must finish before P3-04 progress keys are finalized; P3-04 feeds P1-04 resume candidates.
- Commit each completed task with its ID (e.g. "P3-04: define ProgressState and persistence layer").

Stop and ask if an acceptance criterion is ambiguous or a decision contradicts ARCHITECTURE.md.
```

### 11.4 Person 4 — UI, Theme, and PDF Engineer

```
You are Person 4 — UI, Theme, and PDF Engineer for PyCourse.

Read first: kickoff.md (sections 4 design system + 5 architecture), ARCHITECTURE.md (routes, core data types), TASKS.md (Person 4 tasks), STYLES.md (authoritative color/type/print specs), TESTING.md (component/a11y expectations).

Your goal: own app layout, theme, design tokens, responsive behavior, PDF export, and accessibility. Kick off with task P4-02 (data-theme inline script + CSS custom properties) and P4-01 (app layout shell, sidebar/header, router wiring, UI primitives). Then proceed in dependency order:
  P4-02 -> P4-03 (Python-themed design tokens)
  P4-01 -> P4-04 (responsive behavior), P4-07 (course page components; needs P1-03/P1-04)
  -> P4-05 (PDF export route + print styles; needs P1-06 content complete)
  -> P4-06 (accessibility polish).

Rules:
- Apply data-theme on <html> before React hydration (no flash); persist to localStorage; respect system preference.
- Use design tokens via var(); no hard-coded theme colors in components; meet WCAG AA contrast.
- Coordinate: P4-01 provides context for P2-03; P4-05 needs near-final content from P1-06.
- Commit each completed task with its ID (e.g. "P4-02: set up data-theme inline script + CSS variables").

Stop and ask if an acceptance criterion is ambiguous or a decision contradicts ARCHITECTURE.md / STYLES.md.
```

### 11.5 Shared kick-off checklist (all)

- [ ] All four owners have reviewed ARCHITECTURE.md, STYLES.md, TESTING.md, and TASKS.md.
- [ ] Shared types in `src/types/index.ts` agreed before Milestone 1 ends.
- [ ] Milestone 0 first tasks started: P1-01, P2-01/P2-02, P3-04, P4-02.
- [ ] Weekly sync + integration day at the start of each milestone scheduled.

### Handy follow-ups

- "Continue with the next task."
- "Show me current progress: summarize TASKS.md and list blockers."
- "Audit: compare the implementation against ARCHITECTURE.md and list deviations as new tasks."
