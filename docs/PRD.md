# PRD — PyCourses

## Vision
A fast, offline-capable, static platform where learners take Python courses written in
plain Markdown, run code right in the page, test themselves with module quizzes,
and keep a PDF of the course.

## Users
- **Learner**: reads lessons, runs/edits code, takes quizzes, tracks progress, downloads PDF.
- **Author**: writes Markdown in `content/`, previews live, validated in CI. No code changes needed to add a course.

## Functional requirements
| ID | Requirement |
|----|-------------|
| FR-1 | Courses/modules/lessons authored in Markdown + YAML frontmatter (see CONTENT_SPEC) |
| FR-2 | Python code blocks can be run in-browser; editable blocks; stdout/stderr/exceptions shown; stop button; timeout |
| FR-3 | Practice exercises with hidden tests and pass/fail feedback |
| FR-4 | Every module ends with a quiz (single, multiple, true/false, short text); pass score configurable; retry allowed |
| FR-5 | Progress tracking: lesson completion, quiz best score/attempts, resume where I left off, per-module & per-course % |
| FR-6 | Dark / light / system theme, persisted, no flash on load |
| FR-7 | Python-themed visual identity (Python blue + yellow, snake-inspired accents, monospace-first typography) |
| FR-8 | Download a full course as PDF (includes code, outputs, quiz questions + answer key appendix) |
| FR-9 | Course catalog page, course overview (TOC + progress), lesson page with prev/next |
| FR-10 | Search across lessons (client-side) |
| FR-11 | Export/import progress as JSON (backup, device switch) |

## Non-functional requirements
- TypeScript strict, static hosting (GitHub Pages / Netlify / Cloudflare Pages)
- First load < 200 KB JS (Pyodide loaded lazily, only when first run is clicked or lesson has runnable code)
- Lighthouse a11y ≥ 95; WCAG AA contrast both themes
- Works offline after first visit (PWA, phase 5)
- Deterministic builds; content validated in CI

## Out of scope (v1)
User accounts, server-side progress, certificates, payments, comments, AI tutor.

## Success criteria
A new course can be added by dropping Markdown files in `content/<slug>/`, running `pnpm content:build`,
and getting runnable code, quizzes, progress tracking and a PDF with zero code changes.
