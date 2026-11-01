---
title: Tuples and Sets
minutes: 10
objectives:
  - Use tuples as fixed records and unpack them
  - Use sets to remove duplicates
  - Apply set operations
scope: lesson
---

# Tuples and Sets

## Tuples

A tuple is an **immutable** sequence. Use it for fixed groups of values.

```python run
point = (3, 4)
x, y = point
print(x, y)
print(point[0])
single = (5,)
print(type(single))
```

> [!NOTE] Trying `point[0] = 1` raises a `TypeError` because tuples cannot change.

## Sets

A set stores **unique** items and has no order.

```python run
tags = {"python", "code", "python"}
print(tags)
print(len(tags))
print("code" in tags)
```

Remove duplicates from a list:

```python run
nums = [3, 1, 3, 2, 1]
print(sorted(set(nums)))
```

## Set operations

```python run
a = {1, 2, 3, 4}
b = {3, 4, 5}
print(sorted(a | b))   # union
print(sorted(a & b))   # intersection
print(sorted(a - b))   # difference
print(sorted(a ^ b))   # symmetric difference
```

## Exercise

Write `unique_sorted(items)` returning the distinct items in ascending order.

```python exercise id=ex-set-unique
def unique_sorted(items):
    # TODO
    pass
```

```python tests
assert unique_sorted([3, 1, 3, 2]) == [1, 2, 3], "[3, 1, 3, 2] -> [1, 2, 3]"
assert unique_sorted([]) == [], "empty"
assert unique_sorted(["b", "a", "b"]) == ["a", "b"], "strings"
```

```python solution
def unique_sorted(items):
    return sorted(set(items))
```
