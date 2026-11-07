# Python Course Platform — Kickoff Prompts (by Person / Role)

Ready-to-paste kickoff prompts for each team member to start their tasks. Source of truth: ARCHITECTURE.md, STYLES.md, TESTING.md, TASKS.md, content.md, kickoff.md.

## Kickoff Prompts — by Person / Role

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
