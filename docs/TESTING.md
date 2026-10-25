# TESTING STRATEGY

| Layer | Tool | What | Where |
|---|---|---|---|
| Unit (pure) | Vitest | grading, progress math, unlock rules, storage migrations, manifest validation | `tests/unit`, next to `src/core` |
| Content | `content:build` | Zod schema, ordering, required quiz per module, link integrity | CI gate |
| Content (Python) | `content:verify` | Every runnable block + exercise solution passes tests in real CPython | CI gate |
| Component | Vitest + Testing Library | Quiz flow, CodeCell states, ThemeToggle, ProgressBar | `src/**/*.test.tsx` |
| Runtime | Vitest (node + pyodide npm) | run/stdout/stderr/exception/timeout/exercise tests | `tests/unit/runtime` |
| E2E | Playwright | open course → run cell → complete lesson → pass quiz → progress persists on reload → theme persists → PDF exists | `tests/e2e` |
| A11y | `@axe-core/playwright` | no critical violations on catalog, lesson, quiz in both themes | e2e |

## Rules
- Every task with logic ships tests in the same commit.
- Coverage targets: `src/core` ≥ 90 %, overall ≥ 70 %.
- Flaky e2e tests are fixed or quarantined with a tracking task, never silently skipped.
- Test fixtures course lives in `content/__fixtures__/` (excluded from the catalog in production).
