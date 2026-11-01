---
title: Scope and Return Values
minutes: 10
objectives:
  - Distinguish local and global variables
  - Return multiple values
  - Avoid modifying global state
scope: lesson
---

# Scope and Return Values

## Local vs global

Variables created inside a function are **local**: they vanish when it returns.

```python run
message = "global"

def show():
    message = "local"
    print(message)

show()
print(message)
```

```text output
local
global
```

> [!NOTE] Python looks up names in this order: Local, Enclosing, Global, Built-in (LEGB).

## Avoid `global`

The `global` keyword lets a function rebind a global name, but it makes code hard to follow. Pass values in and return results instead.

```python run
def increment(counter):
    return counter + 1

count = 0
count = increment(count)
count = increment(count)
print(count)
```

## Returning several values

A function can return a tuple, which you can unpack.

```python run
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([4, 9, 1, 7])
print(low, high)
```

## Exercise

Write `stats(numbers)` returning a tuple `(minimum, maximum, average)`.

```python exercise id=ex-scope-stats
def stats(numbers):
    # TODO
    pass
```

```python tests
assert stats([1, 2, 3]) == (1, 3, 2), "stats([1, 2, 3]) should be (1, 3, 2)"
assert stats([10]) == (10, 10, 10), "single item"
assert stats([2, 4, 9, 1]) == (1, 9, 4), "stats([2, 4, 9, 1]) should be (1, 9, 4)"
```

```python solution
def stats(numbers):
    return min(numbers), max(numbers), sum(numbers) / len(numbers)
```
