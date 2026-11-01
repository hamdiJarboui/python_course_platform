---
title: Variables and Types
minutes: 10
objectives:
  - Store values in variables
  - Recognise int, float, str and bool
  - Use type() and convert between types
scope: lesson
---

# Variables and Types

A **variable** is a name that points to a value. You create one with `=`.

```python run
name = "Ada"
age = 36
print(name, "is", age)
```

## Naming rules

- Letters, digits and `_` only, and it cannot start with a digit.
- Case-sensitive: `score` and `Score` are different.
- Cannot be a keyword such as `if`, `for` or `class`.
- Style (PEP 8): use `snake_case`.

> [!PYTHONIC] Prefer `total_price` over `tp` or `totalPrice`. Names should read like words.

## The basic types

| Type | Example | Meaning |
|---|---|---|
| `int` | `42` | whole numbers |
| `float` | `3.14` | decimal numbers |
| `str` | `"hi"` | text |
| `bool` | `True` | true / false |

Use `type()` to ask Python what something is.

```python run
print(type(42))
print(type(3.14))
print(type("hi"))
print(type(True))
```

## Changing a variable

Variables can be reassigned, even to a different type (Python is dynamically typed).

```python edit
x = 10
x = x + 5
print(x)
x = "now I am text"
print(x, type(x))
```

## Converting types

`int()`, `float()`, `str()` and `bool()` convert values.

```python run
print(int("7") + 1)
print(float(3))
print("Score: " + str(95))
```

> [!WARNING] `"5" + 5` raises a `TypeError`. Convert first: `int("5") + 5`.

## Exercise

Given `price = 20` and `quantity = 3`, compute `total` as the product.

```python exercise id=ex-types-total
price = 20
quantity = 3
# compute total
```

```python tests
assert "total" in globals(), "Define total"
assert total == 60, "total should be price * quantity = 60"
```

```python solution
price = 20
quantity = 3
total = price * quantity
print(total)
```
