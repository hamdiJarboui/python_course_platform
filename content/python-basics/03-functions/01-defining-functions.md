---
title: Defining Functions
minutes: 10
objectives:
  - Define a function with def
  - Return values with return
  - Document a function with a docstring
scope: lesson
---

# Defining Functions

A function is a named, reusable block of code.

```python run
def greet(name):
    print(f"Hello, {name}!")

greet("Ada")
greet("Grace")
```

## return

`print` shows a value; `return` hands a value back to the caller so it can be reused.

```python run
def square(n):
    return n * n

result = square(7)
print(result)
print(square(2) + square(3))
```

A function without `return` gives back `None`.

```python run
def nothing():
    pass

print(nothing())
```

## Docstrings

The first string in a function documents it.

```python run
def area(width, height):
    """Return the area of a rectangle."""
    return width * height

print(area(3, 4))
help(area)
```

> [!PYTHONIC] Small functions that do one thing and return a value are easy to test and reuse.

## Exercise

Write `is_even(n)` that returns `True` for even integers and `False` otherwise.

```python exercise id=ex-func-iseven
def is_even(n):
    # TODO
    pass
```

```python tests
assert is_even(2) is True, "2 is even"
assert is_even(7) is False, "7 is odd"
assert is_even(0) is True, "0 is even"
assert is_even(-4) is True, "-4 is even"
```

```python solution
def is_even(n):
    return n % 2 == 0
```
