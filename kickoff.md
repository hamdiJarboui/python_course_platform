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
| `ARCHITECTURE.md` | Full architecture specification (19 sections) |
| `STYLES.md` | Design tokens, color palette, theme & print specs |
| `TESTING.md` | Test strategy across all layers + CI gate |
| `TASKS.md` | 4-person task breakdown across 5 milestones |
| `content.md` | Full Markdown course content source |
