# CONTENT SPEC — authoring courses in Markdown

## Folder rules
`content/<course-slug>/course.yml`, then `NN-<module-slug>/module.yml`, lessons `NN-<slug>.md`,
and **every module ends with `99-quiz.md`** (build fails if missing). Numeric prefix = order.

### course.yml
```yaml
id: python-basics
title: Python Basics
description: Learn Python from zero.
level: beginner
version: 1.0.0
gating: none            # none | quiz
pythonPackages: []      # e.g. [numpy]
```

### module.yml
```yaml
title: Getting Started
summary: Install nothing — run Python in your browser.
```

## Lesson file
```markdown
---
title: Hello, Python
minutes: 8
objectives:
  - Print text with print()
  - Understand how Python runs a script
scope: cell        # cell (fresh namespace per run) | lesson (cells share state top→bottom)
---

# Hello, Python

Intro text with **bold**, `inline code`, tables, lists (GFM) and math $a^2+b^2=c^2$.

```python run
print("Hello, world!")
```
```

## Code fence flags
| Fence | Behavior |
|---|---|
| ```` ```python ```` | Highlighted only, not runnable |
| ```` ```python run ```` | Read-only code + **Run** button + output panel |
| ```` ```python edit ```` | Editable (CodeMirror) + Run + Reset |
| ```` ```python exercise id=ex-sum ```` | Editable starter code + **Check** button; must be followed by a `tests` fence |
| ```` ```python tests ```` | Hidden tests for the preceding exercise (not rendered in UI; rendered in PDF answer key) |
| ```` ```python solution ```` | Collapsed "Show solution" (appears after 1 failed attempt) |
| ```` ```text output ```` | Static expected-output block |

Optional meta: `title="hello.py"`, `timeout=5`, `hidden-setup` (a fence `python setup` runs invisibly before cells).

### Exercise example
````markdown
```python exercise id=ex-add
def add(a, b):
    # TODO
    pass
```

```python tests
assert add(2, 3) == 5, "add(2, 3) should be 5"
assert add(-1, 1) == 0, "add(-1, 1) should be 0"
```

```python solution
def add(a, b):
    return a + b
```
````

## Callouts
```markdown
> [!NOTE] ...      > [!TIP] ...      > [!WARNING] ...      > [!PYTHONIC] Idiomatic Python tip
```

## Quiz file (`99-quiz.md`)
````markdown
---
type: quiz
title: Module 1 Quiz
passScore: 70          # percent
shuffle: true
---

```quiz
- type: single
  q: Which function prints text?
  options: [echo(), print(), write(), say()]
  answer: 1
  explain: print() writes to standard output.

- type: multiple
  q: Which are valid variable names?
  options: [my_var, 2cool, _x, class]
  answer: [0, 2]
  explain: Names cannot start with a digit or be keywords.

- type: boolean
  q: Python is statically typed.
  answer: false
  explain: Python is dynamically typed.

- type: short
  q: What keyword defines a function?
  answer: [def]
  explain: Functions are defined with `def`.
```
````
Rules: ≥ 5 questions per quiz; `explain` required; `answer` indices validated at build.

## Authoring checklist
- Every lesson has `title`, `minutes`, ≥1 objective.
- ≥ 1 runnable block per lesson (except pure-concept lessons, flag `concept: true`).
- No external images without `alt`; images live in `content/<course>/assets/`.
- Run `pnpm content:build && pnpm content:verify` before committing.
