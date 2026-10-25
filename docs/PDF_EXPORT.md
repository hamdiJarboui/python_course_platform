# PDF EXPORT

## Goal
"Download course (PDF)" on every course overview. One PDF per course containing:
cover → TOC → every module (lessons with code **and executed outputs**) → module quiz questions → **answer key appendix**.

## Strategy (decision ADR-004)
**Build-time generation with Playwright**, served as a static file `public/pdf/<course-slug>.pdf`.
Why: identical typography to the web app, outputs from real Pyodide runs, no heavy client bundle, works offline once cached.

### Flow (`scripts/pdf.ts`)
1. Start `vite preview` on a free port.
2. For each course: open `/print/<course>` in Chromium with `?print=1`.
3. The print route renders ALL lessons sequentially in the **light** theme. Each `python run|edit` cell auto-executes
   (sequentially, shared Pyodide) and renders its output beneath the code; exercises show starter code + (in appendix) solutions.
4. Wait for `window.__PRINT_READY__ === true` (set when all cells finished; 120 s max, failures are printed inline as "⚠ output unavailable").
5. `page.pdf({ format: 'A4', printBackground: true, margin: {top:'18mm',bottom:'18mm',left:'16mm',right:'16mm'}, displayHeaderFooter: true, headerTemplate, footerTemplate })`
   — header: course title; footer: `page X / Y`.
6. Write to `public/pdf/<course>.pdf`; also write `public/pdf/manifest.json` with size + generatedAt + course version.
7. Add PDF outline (bookmarks) from h1/h2 via Chromium `generateDocumentOutline: true`.

### UI
- Course overview: **Download PDF** button → `<a href="/pdf/<slug>.pdf" download>` with file size and "generated for v1.0.0".
- Lesson page: **Print lesson** (uses `window.print()` + `print.css`).
- If the PDF is missing (dev mode) the button shows a tooltip "Run `pnpm pdf`".

## Print layout rules
- Cover page: title, description, level, version, date, Python badge.
- Auto TOC with page numbers (CSS `target-counter` is NOT reliable in Chromium → render TOC without numbers, rely on PDF bookmarks; page numbers optional via post-process with `pdf-lib`).
- Fonts embedded (self-hosted woff2) so output is deterministic.
- Quiz section: questions only in the module; **Answer Key** appendix at the end with explanations.

## Acceptance
- PDF opens, has bookmarks, correct page count, selectable text, code blocks not split mid-block when ≤ 40 lines.
- Contains outputs for ≥ 95% runnable cells; failures flagged inline.
- Size < 10 MB for a 10-module course.
- e2e test `tests/e2e/pdf.spec.ts` asserts file exists, has ≥ 1 page per module, contains course title text.
