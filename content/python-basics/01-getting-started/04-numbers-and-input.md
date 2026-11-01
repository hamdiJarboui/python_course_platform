---
title: Numbers and User Input
minutes: 12
objectives:
  - Use arithmetic operators
  - Understand integer vs float division
  - Read user input with input()
scope: lesson
---

# Numbers and User Input

## Arithmetic operators

| Operator | Meaning | Example | Result |
|---|---|---|---|
| `+` `-` `*` | add, subtract, multiply | `2 * 3` | `6` |
| `/` | true division (always float) | `7 / 2` | `3.5` |
| `//` | floor division | `7 // 2` | `3` |
| `%` | remainder | `7 % 2` | `1` |
| `**` | power | `2 ** 10` | `1024` |

```python run
print(7 / 2)
print(7 // 2)
print(7 % 2)
print(2 ** 10)
print(2 + 3 * 4)
print((2 + 3) * 4)
```

Multiplication happens before addition; use parentheses to be explicit.

## Floats are approximate

```python run
print(0.1 + 0.2)
print(round(0.1 + 0.2, 2))
```

> [!NOTE] Computers store floats in binary, so some decimals cannot be exact. Use `round()` when displaying.

## Handy built-ins

```python run
print(abs(-5))
print(max(3, 9, 4))
print(min(3, 9, 4))
print(round(3.14159, 2))
print(divmod(17, 5))
```

## Reading input

`input(prompt)` pauses, shows the prompt and returns what the user typed **as a string**.

```python edit
name = input("What is your name? ")
print(f"Nice to meet you, {name}!")
```

Because the result is text, convert it before doing maths:

```python edit
age = int(input("Your age: "))
print(f"Next year you will be {age + 1}.")
```

## Exercise

Write `average(a, b)` that returns the mean of two numbers.

```python exercise id=ex-numbers-average
def average(a, b):
    # TODO
    pass
```

```python tests
assert average(2, 4) == 3, "average(2, 4) should be 3"
assert average(1, 2) == 1.5, "average(1, 2) should be 1.5"
assert average(-2, 2) == 0, "average(-2, 2) should be 0"
```

```python solution
def average(a, b):
    return (a + b) / 2
```
