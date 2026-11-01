# PROGRESS

> Maintained by opencode per `AGENTS.md`. Newest log entries first. Do not hand-edit the table between the markers — run `pnpm progress`.

## Current focus
- **Dev A:** T-001 — Scaffold project (not started)
- **Dev B:** T-025 / T-026 — review the written course content (no code dependency yet)

## Summary
<!-- PROGRESS:START -->
| Phase | Done | In progress | Blocked | Todo | Total | % |
|---|---|---|---|---|---|---|
| 0 Foundation | 0 | 0 | 0 | 5 | 5 | 0% |
| 1 Core domain | 0 | 0 | 0 | 4 | 4 | 0% |
| 2 Content pipeline | 0 | 2 | 0 | 5 | 7 | 0% |
| 3 Python runtime | 0 | 0 | 0 | 6 | 6 | 0% |
| 4 UI | 0 | 0 | 0 | 14 | 14 | 0% |
| 5 PDF export | 0 | 0 | 0 | 4 | 4 | 0% |
| 6 Release | 0 | 0 | 0 | 4 | 4 | 0% |
| **Total** | **0** | **2** | **0** | **42** | **44** | **0%** |
<!-- PROGRESS:END -->

## Blockers
_None._

## Decisions pending
_None. (Add ADRs to `docs/DECISIONS.md`.)_

## Log
<!-- Newest first. Template:
### YYYY-MM-DD — T-xxx — Title
- What changed:
- Files:
- Verification: (commands run + result)
- Next:
-->
### 2026-11-01 — T-025 / T-026 — Course content written + backlog split between two developers
- What changed: authored the missing course content — **Python Basics** (3 modules × 4 lessons, 3 quizzes) and **Python Intermediate** (3 modules × 3 lessons, 3 quizzes), 21 lessons-with-exercises-and-quizzes in total. Split `tasks.md` into Dev A (engine) and Dev B (product + content), 22 tasks each, with working rules and `⇄` hand-off markers. Added T-026. Table below updated by hand because `pnpm progress` (T-004) does not exist yet.
- Files: `content/python-basics/**`, `content/python-intermediate/**`, `tasks.md`, `PROGRESS.md`.
- Verification: throw-away script (not committed) ran every `run`/`edit` block, every exercise solution against its tests, checked starter code does not already pass, and parsed all quiz YAML (≥ 5 questions, `explain` present, valid answer indices, unique exercise ids) — all pass in CPython. `pnpm` checks not run (project not scaffolded). T-025/T-026 stay `[~]` until `content:build`/`content:verify` exist and pass.
- Next: Dev A → T-001. Dev B → review content, then T-002/T-004 once T-001 is merged.

### Project initialized — docs created
- What changed: PRD, architecture, content spec, design system, PDF spec, testing strategy, ADRs, task backlog.
- Next: T-001.
