---
title: All fence types
minutes: 6
objectives:
  - See every fence flag
scope: lesson
---

# All fence types

Math inline $a^2 + b^2 = c^2$ and a table:

| a | b |
|---|---|
| 1 | 2 |

```python setup
GREETING = "hi"
```

```python run title="hello.py" timeout=5
print(GREETING)
```

```text output
hi
```

```python edit
x = 21
x * 2
```

Plain, highlighted only:

```python
print("not runnable")
```

> [!NOTE] A note.

> [!TIP] A tip.

> [!WARNING] A warning.

> [!PYTHONIC] A pythonic tip.

Read the [next lesson](02-links.md#target).

```python exercise id=demo-add
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
