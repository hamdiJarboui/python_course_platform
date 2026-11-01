---
title: for Loops
minutes: 12
objectives:
  - Iterate over sequences with for
  - Generate numbers with range()
  - Use enumerate() for index and value
scope: lesson
---

# for Loops

A `for` loop runs a block once for every item in a sequence.

```python run
for letter in "abc":
    print(letter)
```

## range()

`range(stop)`, `range(start, stop)` and `range(start, stop, step)` produce numbers. The stop value is **excluded**.

```python run
for i in range(3):
    print(i)

print(list(range(2, 10, 3)))
```

```text output
0
1
2
[2, 5, 8]
```

## Accumulating a result

```python edit
total = 0
for n in range(1, 6):
    total += n
print(total)
```

## enumerate

```python run
colors = ["red", "green", "blue"]
for index, color in enumerate(colors, start=1):
    print(index, color)
```

> [!PYTHONIC] Use `enumerate()` instead of `range(len(items))`.

## Exercise

Write `sum_to(n)` that returns the sum of all integers from `1` to `n` inclusive using a loop.

```python exercise id=ex-for-sumto
def sum_to(n):
    # TODO
    pass
```

```python tests
assert sum_to(1) == 1, "sum_to(1) should be 1"
assert sum_to(5) == 15, "sum_to(5) should be 15"
assert sum_to(100) == 5050, "sum_to(100) should be 5050"
assert sum_to(0) == 0, "sum_to(0) should be 0"
```

```python solution
def sum_to(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
```
