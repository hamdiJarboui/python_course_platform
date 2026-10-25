# DECISIONS (ADR log)

Format: **ADR-NNN — Title — Status** · Context · Decision · Consequences. Add new ADRs at the bottom.

**ADR-001 — Static SPA, no backend — Accepted**
Context: need cheap hosting, offline, privacy. Decision: Vite + React, progress in localStorage. Consequences: no cross-device sync (mitigated by JSON export/import).

**ADR-002 — Pyodide in a Web Worker — Accepted**
Context: run Python client-side safely without freezing UI. Decision: dedicated worker + comlink; terminate on timeout. Consequences: ~10 MB runtime download, lazily loaded; `input()` needs a message bridge.

**ADR-003 — Markdown with custom fence flags + YAML quiz blocks — Accepted**
Context: authors want plain Markdown. Decision: unified/remark pipeline, fences like ```` ```python run ````, ```` ```quiz ````. Consequences: custom parser plugins must be well-tested; MDX avoided to keep content portable.

**ADR-004 — PDF generated at build time with Playwright — Accepted**
Context: need PDF with real outputs and consistent look. Decision: print route + Chromium. Consequences: CI needs Chromium; PDFs regenerate on content change.

**ADR-005 — CSS variables for theming (no Tailwind) — Accepted**
Context: dark/light + print theme + CodeMirror/Shiki theming. Decision: tokens in CSS variables. Consequences: manual utility styling; consistent theming everywhere.

**ADR-006 — Quiz required per module, gating configurable — Accepted**
Decision: build fails if a module has no quiz; `gating: none|quiz` per course (default none).

**ADR-007 — Zustand for state — Accepted**
Decision: small, persist middleware, store logic delegates to pure `core` functions.
