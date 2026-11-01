# Python Course Platform — MVP Kickoff Prompt

A single, paste-ready prompt to kick off the minimum viable product (Milestones 0–3 plus a basic usable theme).

## MVP Kickoff Prompt

A single, paste-ready prompt to kick off the **minimum viable product** (Milestones 0–3 plus a basic usable theme). Post-MVP work (PDF export, full accessibility pass, PWA/offline, performance budget, full course authoring beyond the sample) is intentionally deferred.

### MVP Kickoff Prompt (paste as first message)

```
You are the engineering team for PyCourse (4 contributors, 1 shared codebase). Build the MVP only: Milestone 0 (setup) -> Milestone 1 (core content & navigation) -> Milestone 2 (runnable Python) -> Milestone 3 (quiz & progress), plus a basic light/dark theme. Defer PDF export, full accessibility, PWA/offline, performance, and the complete course to post-MVP.

Read first: kickoff.md, ARCHITECTURE.md, STYLES.md (color/type tokens), TESTING.md, TASKS.md, content.md, KICKOFF_PROMPTS.md (per-person prompts).

Kick off in parallel with each person's first unblocked tasks:
- Person 1: P1-01 (content zod schemas) -> P1-02/P1-03 -> P1-04.
- Person 2: P2-01 + P2-02 (Pyodide loader + worker) -> P2-04/P2-05.
- Person 3: P3-01 (quiz schema) + P3-04 (ProgressState + localStorage) -> P3-02/P3-05.
- Person 4: P4-02 (theme inline script + tokens) + P4-01 (layout shell) -> P4-03/P4-07.

Rules:
- One task at a time per person; satisfy acceptance criteria before moving on.
- Agree shared types in src/types/index.ts before Milestone 1 ends; never silently change them.
- Coordinate cross-person contracts: P1-01 before P2-03/P3-01; P2-03 before executable blocks and P4's PythonCodeBlock; P3-01 before P3-04 progress keys.
- Run lint -> typecheck -> tests for touched code before marking a task done; commit with the task ID.
- Keep the app runnable end-to-end after each milestone: browse modules/lessons, run Python in browser, take a quiz, see progress persist across reload, toggle theme.

Stop and ask only if an acceptance criterion is ambiguous or a decision contradicts ARCHITECTURE.md / STYLES.md / TESTING.md.
```

### MVP scope checklist

- [ ] M0: repo scaffolded, stack installed, architecture validated
- [ ] M1: content schema + loaders, 2 modules x 3+ lessons, navigation, course overview/lesson pages
- [ ] M2: Pyodide loads on first use, worker executes code, stdout/stderr + timeout/reset, runnable code blocks in lessons
- [ ] M3: quiz schema + scoring + retry, progress persists to localStorage, lesson/module completion, resume
- [ ] Basic theme: light/dark/system with no flash, tokens applied, responsive enough for desktop

### Handy follow-ups
- "Continue with the next MVP task."
- "Show MVP progress: summarize done vs. remaining MVP tasks and list blockers."
- "Cut scope: move <task> to post-MVP and note it in TASKS.md."
