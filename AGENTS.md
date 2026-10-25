# AGENTS.md — Rules for opencode

You are building **PyCourses**: a static, TypeScript web platform for Python courses.
Courses are written in Markdown, code blocks run in the browser (Pyodide), each module
ends with a quiz, progress is tracked, UI supports dark/light mode with a Python theme,
and a whole course can be downloaded as PDF.

## Source of truth (read in this order at the start of EVERY session)
1. `tasks.md`      — what to do next, and its status
2. `PROGRESS.md`   — what has been done, current focus, blockers
3. `docs/ARCHITECTURE.md`, `docs/CONTENT_SPEC.md`, `docs/DESIGN_SYSTEM.md`, `docs/PDF_EXPORT.md`, `docs/TESTING.md`
4. `docs/DECISIONS.md` — do NOT contradict an accepted decision; propose a new ADR instead.

## Progress-tracking protocol (MANDATORY)
Status markers in `tasks.md`: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

1. Pick the first `[ ]` task whose dependencies are all `[x]` (or the one marked `[~]`).
2. Change it to `[~]` and set **Current focus** in `PROGRESS.md` BEFORE writing code.
3. Work on ONE task at a time. Keep the diff small.
4. Definition of Done (all required):
   - Acceptance criteria in the task are met
   - `pnpm typecheck && pnpm lint && pnpm test` pass
   - New behavior has tests (see `docs/TESTING.md`)
   - Docs updated if behavior/contracts changed
5. Mark the task `[x]`, then append a log entry to `PROGRESS.md` (newest first):
   `### YYYY-MM-DD — T-xxx — <title>` with: What changed · Files · Verification · Next.
6. Run `pnpm progress` (script from T-004) to refresh the percentage table in `PROGRESS.md`.
7. If blocked: mark `[!]`, write the reason in `PROGRESS.md` → **Blockers**, move to the next unblocked task.
8. If you discover new work: ADD a new task to `tasks.md` (next free ID) instead of doing it silently.
9. Never mark a task `[x]` without running the checks. Never delete tasks; strike them with `~~text~~` and explain.

## Engineering rules
- TypeScript `strict: true`. No `any` (use `unknown` + narrowing). No default exports except pages/routes.
- Pure logic goes in `src/core/*` (no React, no DOM) so it is unit-testable.
- Python execution ONLY inside the Web Worker (`src/runtime/pyodide.worker.ts`). Never on the main thread.
- No backend. All state is client-side (`localStorage`, versioned + migrated).
- Content is Markdown in `content/`. Never hardcode lesson text in components.
- Accessibility: keyboard-navigable, visible focus, AA contrast in both themes, `prefers-reduced-motion` respected.
- Use the `@frontend-design` skill for UI work; follow `docs/DESIGN_SYSTEM.md` tokens, don't invent colors.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`), one task per commit, include the task ID.

## Commands
`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm e2e` ·
`pnpm content:build` (validate + manifest) · `pnpm content:verify` (run every code block in real Python) ·
`pnpm pdf` (generate PDFs) · `pnpm progress` (update progress table)
