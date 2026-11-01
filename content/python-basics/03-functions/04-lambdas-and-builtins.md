---
title: Lambdas and Helpful Built-ins
minutes: 10
objectives:
  - Write small anonymous functions with lambda
  - Use map, filter and sorted with a key function
  - Pass functions as arguments
scope: lesson
---

# Lambdas and Helpful Built-ins

Functions are values: you can store them in variables and pass them to other functions.

```python run
def shout(text):
    return text.upper()

f = shout
print(f("hi"))
```

## lambda

A `lambda` is a one-line anonymous function.

```python run
double = lambda x: x * 2
print(double(21))
```

## key functions

`sorted`, `min` and `max` accept a `key` function.

```python run
words = ["pear", "fig", "banana", "kiwi"]
print(sorted(words, key=len))
print(max(words, key=len))
print(sorted(words, key=lambda w: w[-1]))
```

## map and filter

```python run
nums = [1, 2, 3, 4, 5, 6]
print(list(map(lambda n: n * n, nums)))
print(list(filter(lambda n: n % 2 == 0, nums)))
```

> [!PYTHONIC] A list comprehension is often clearer than `map`/`filter` with a lambda: `[n * n for n in nums]`.

## Exercise

Write `sort_by_length(words)` returning the words sorted by length, shortest first. Equal lengths keep their original order.

```python exercise id=ex-lambda-sortlen
def sort_by_length(words):
    # TODO
    pass
```

```python tests
assert sort_by_length(["ccc", "a", "bb"]) == ["a", "bb", "ccc"], "sort by length"
assert sort_by_length(["bb", "aa", "c"]) == ["c", "bb", "aa"], "stable for equal lengths"
assert sort_by_length([]) == [], "empty list"
```

```python solution
def sort_by_length(words):
    return sorted(words, key=len)
```
