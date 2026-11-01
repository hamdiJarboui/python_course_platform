---
title: Exceptions
minutes: 12
objectives:
  - Catch errors with try/except
  - Use else and finally
  - Raise and define your own exceptions
scope: lesson
---

# Exceptions

When something goes wrong Python raises an **exception**. Unhandled, it stops the program; handled, it lets you recover.

```python run
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")
```

## Several handlers, else and finally

```python run
def parse_age(text):
    try:
        age = int(text)
    except ValueError:
        print(f"{text!r} is not a number")
        return None
    else:
        print("Parsed OK")
        return age
    finally:
        print("done")

print(parse_age("42"))
print(parse_age("abc"))
```

- `else` runs only if no exception happened.
- `finally` always runs — ideal for cleanup.

> [!WARNING] Never write a bare `except:`. It hides bugs and even catches Ctrl+C. Catch the specific exception.

## Raising exceptions

```python run
def set_percent(value):
    if not 0 <= value <= 100:
        raise ValueError(f"percent out of range: {value}")
    return value

try:
    set_percent(150)
except ValueError as err:
    print("Error:", err)
```

## Custom exceptions

```python run
class InsufficientFunds(Exception):
    pass

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFunds(f"need {amount - balance} more")
    return balance - amount

try:
    withdraw(10, 25)
except InsufficientFunds as err:
    print(err)
```

> [!PYTHONIC] "Easier to ask forgiveness than permission" (EAFP): try the operation and handle the failure.

## Exercise

Write `safe_int(text, default=0)` returning `int(text)` or `default` if the text is not a valid integer.

```python exercise id=ex-exc-safeint
def safe_int(text, default=0):
    # TODO
    pass
```

```python tests
assert safe_int("12") == 12, "valid number"
assert safe_int("x") == 0, "default is 0"
assert safe_int("x", -1) == -1, "custom default"
assert safe_int("") == 0, "empty string"
```

```python solution
def safe_int(text, default=0):
    try:
        return int(text)
    except ValueError:
        return default
```
