# Python Course Platform — Testing Strategy

**Status:** Test specification (pre-implementation)  
**Audience:** Engineering team of 4  
**Companion documents:** ARCHITECTURE.md, TASKS.md, STYLES.md

---

## 1. Testing Philosophy

- **Frontend-first, local-first:** Tests run against the client-side application; no backend required.
- **Content-driven:** Every content file (`course.json`, `module.json`, `lesson.mdx`, `quiz.json`) is validated against zod schemas in CI.
- **Progress-safe:** Tests verify that progress persists across reloads and that quiz state correctly gates module completion.
- **Accessibility-aware:** Keyboard navigation, focus management, ARIA, and contrast are tested where practical.
- **Theme-safe:** Dark/light/system themes are tested for correct application and no flash on load.

---

## 2. Tooling

| Layer | Tool | Purpose |
|---|---|---|
| Unit | Vitest | Fast unit tests for pure functions and utilities |
| Component | React Testing Library | Rendered component behavior with user-like interactions |
| Integration | Vitest + React Testing Library | Cross-store and cross-component flows |
| End-to-end | Playwright | Full browser navigation, Python execution, PDF export, theme persistence |
| Content validation | Zod + custom CI script | Schema validation for all content files |
| Accessibility | axe-core / Playwright axe | Automated a11y checks in E2E and component tests |
| Lint/Type | ESLint + TypeScript strict mode | Static analysis as a test gate |

---

## 3. Test Pyramid

```
          /\
         /E2E\       Playwright (critical paths only)
        /------\
       /  Integration \   Vitest + RTL (store + component flows)
      /----------------\
     /    Component    \   React Testing Library (UI components)
    /--------------------\
   /      Unit           \   Vitest (pure functions, scoring, storage)
  /------------------------\
 Content Validation        Zod CI gate (all content files)
```

Recommended ratio: 70% unit / 20% component & integration / 10% E2E.

---

## 4. Unit Tests (Vitest)

**Location:** `src/tests/unit/`

| Test Area | What to Test | Example Cases |
|---|---|---|
| Quiz scoring | `scoreQuiz(answers, questions)` | Single correct, multiple partial, all wrong, empty answers |
| Pass/fail | `isPassed(score, passScore)` | Boundary at passScore, above, below |
| Progress helpers | `markLessonComplete`, `isModuleCompleted` | All lessons done + quiz passed = module complete; missing lesson = incomplete |
| Content validation | Zod schemas for `course.json`, `module.json`, `quiz.json` | Valid content passes; missing required fields fails; unknown question type fails |
| Navigation | `getPrevNextLesson(moduleId, lessonId, course)` | First lesson has no prev; last lesson of module links to first of next module |
| Theme | `resolveEffectiveTheme(preference, systemPreference)` | `system` + dark OS = dark; `light` = light; `dark` = dark |
| Storage | `loadProgress` / `saveProgress` round-trip | Corrupted JSON handled gracefully; version field preserved |
| Python worker protocol | Message shape validation | `{ type: 'RUN', code, blockId }` and `{ type: 'RESULT', ... }` shapes |

**Acceptance criteria:** All unit tests run in under 30 seconds; 100% pass required for CI.

---

## 5. Component Tests (React Testing Library)

**Location:** `src/tests/components/`

| Component | What to Test |
|---|---|
| `PythonCodeBlock` | Run button triggers execution; Reset restores original code; loading state shown while Pyodide loads; stdout/stderr rendered separately; error message displayed on failure |
| `QuizPage` | All question types render; required-question validation blocks submission; results show correct/incorrect + explanations; retry clears answers and increments attempt count |
| `LessonPage` | MDX renders with custom components; previous/next navigation works; progress:lesson-complete marker triggers completion; resume banner shows last visited lesson |
| `ThemeToggle` | Toggles between light/dark/system; persists to localStorage; applies `data-theme` before hydration (mocked); no flash on simulated reload |
| `CourseOverview` | Module list renders with completion summary; resume button redirects to last visited lesson |
| `ModulePage` | Lesson list ordered correctly; quiz link visible; module completion reflected after all lessons + passed quiz |
| `PdfExportPage` | Print view hides navigation/sidebar/buttons; triggers `window.print()` |

**Acceptance criteria:** Component tests use `user-event` for interactions; `screen` queries over container queries; tests are theme-agnostic (run in both light and dark via `data-theme`).

---

## 6. Integration Tests (Vitest + React Testing Library)

**Location:** `src/tests/integration/`

| Flow | What to Test |
|---|---|
| Lesson completion → module gating | Completing all lessons in a module + passing quiz marks module complete; course overview reflects completion |
| Quiz retry persistence | Multiple attempts stored; latest attempt determines pass/fail; older attempts preserved in history |
| Progress export/import | Export produces valid JSON; import validates schema and merges/replaces; version mismatch handled |
| Theme + reload | Theme persists after page reload; system preference updates when OS changes |
| MDX with executable blocks | Lesson with `python-executable` block renders `PythonCodeBlock`; normal `python` block renders static code only |
| Python worker integration | (Mocked worker) RUN message → RESULT message flows through store to output panel |

**Acceptance criteria:** Integration tests run against real stores with `localStorage` mocked; no external network calls.

---

## 7. End-to-End Tests (Playwright)

**Location:** `src/tests/e2e/`

| Scenario | Steps | Assertion |
|---|---|---|
| Full course navigation | Open `/` → click module 1 → lesson 1 → run code block → mark complete → next lesson → quiz → submit → pass → module complete | Progress indicators update; final module shows complete |
| Python execution | Open a lesson with a runnable block → click Run → verify stdout appears | Output panel shows expected result; loading state appears then disappears |
| Theme toggle + reload | Toggle to dark mode → reload page → verify dark mode persists | `data-theme="dark"` on `<html>` after reload |
| Resume learning | Visit lesson 3 → close tab → reopen `/` → click Resume → redirected to lesson 3 | URL matches `/modules/:id/lessons/lesson-3` |
| PDF export | Navigate to `/export/pdf` → trigger print → verify print dialog opens | `window.print()` called; print view contains module titles and code blocks |
| Quiz retry | Submit failing quiz → retry → submit passing quiz → module marked complete | Two attempts stored; latest passed; module complete |
| Accessibility smoke | Tab through lesson page → verify focus visible → verify skip-to-content link | Focus ring visible on all interactive elements; skip link present |

**Acceptance criteria:** E2E tests run in Chrome (headless) and Firefox; critical path tests must pass before merge.

---

## 8. Content Validation Tests (CI Gate)

**Location:** CI pipeline + `src/tests/content/`

Every content file is validated on push/PR:

- `course.json` matches `CourseConfig` schema
- `module.json` matches `ModuleConfig` schema
- Lesson MDX frontmatter matches `LessonFrontmatter` schema
- `quiz.json` matches `Quiz` schema
- Quiz question types limited to `single-choice`, `multiple-choice`, `true-false`
- Every question has `id`, `type`, `prompt`, `correct`, `explanation`
- Numeric indexes used for `correctAnswer` / `correctAnswers`
- Module order fields are sequential starting at 1
- Lesson order fields are sequential within each module
- Every module has exactly one `quiz.json`

**Failure behavior:** CI build fails if any content file is invalid. PR cannot merge until fixed.

---

## 9. Accessibility Testing

- **axe-core:** Automated a11y scans in Playwright E2E tests on key pages (course overview, lesson, quiz, settings)
- **Keyboard navigation:** Tab order verified on lesson page, quiz form, theme toggle, sidebar
- **Focus states:** `:focus-visible` rings present on all interactive components
- **ARIA:** `fieldset`/`legend` on quiz questions, `role="radiogroup"` for single choice, `aria-live` on submission feedback
- **Contrast:** Automated contrast check (WCAG AA) for all color token combinations in both themes

---

## 10. Test Data & Mocks

- **Pyodide:** Mocked in unit/component tests; real Pyodide only in E2E (with timeout)
- **localStorage:** Mocked in Vitest; real in Playwright
- **Content:** Use a minimal test course fixture (1 module, 2 lessons, 1 quiz) rather than the full course
- **Progress:** Fresh `ProgressState` per test; no cross-test pollution

---

## 11. Coverage Goals

| Layer | Target Coverage |
|---|---|
| Unit (scoring, storage, validation) | 90%+ |
| Components | 80%+ |
| Integration | 70%+ |
| E2E | Critical paths only (no percentage target) |

Coverage is a guide, not a gate. All critical user flows must be covered by at least one test layer.

---

## 12. CI Configuration

| Stage | Command | When |
|---|---|---|
| Lint | `npm run lint` | Every PR |
| Type check | `npm run typecheck` | Every PR |
| Unit tests | `npm run test:unit` | Every PR |
| Component tests | `npm run test:components` | Every PR |
| Content validation | `npm run test:content` | Every PR |
| E2E tests | `npm run test:e2e` | Every PR + nightly on main |
| Build | `npm run build` | Every PR |

**Merge gate:** All stages must pass. E2E failures on flaky tests may be retried once.

---

## 13. Responsibilities by Role

| Person | Testing Responsibility |
|---|---|
| Person 1 (Content) | Content validation schemas, content fixture maintenance |
| Person 2 (Python Runtime) | Python worker message-shape tests, execution timeout tests, mocked worker integration |
| Person 3 (Quiz & Progress) | Quiz scoring tests, progress persistence tests, module gating integration tests |
| Person 4 (UI/Theme/PDF) | Component tests, theme persistence tests, accessibility tests, PDF print flow E2E |
