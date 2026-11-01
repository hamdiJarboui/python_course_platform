---
title: Arguments and Defaults
minutes: 12
objectives:
  - Use positional and keyword arguments
  - Give parameters default values
  - Accept a variable number of arguments
scope: lesson
---

# Arguments and Defaults

## Positional and keyword arguments

```python run
def describe(name, animal):
    print(f"{name} is a {animal}")

describe("Rex", "dog")
describe(animal="cat", name="Tom")
```

## Default values

```python run
def power(base, exponent=2):
    return base ** exponent

print(power(5))
print(power(2, 10))
```

> [!WARNING] Never use a mutable default such as `def f(items=[])`. The same list is reused on every call. Use `None` and create the list inside.

```python run
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

print(add_item("a"))
print(add_item("b"))
```

## *args and **kwargs

`*args` collects extra positional arguments in a tuple, `**kwargs` collects keyword arguments in a dict.

```python edit
def total(*numbers):
    return sum(numbers)

def show(**options):
    for key, value in options.items():
        print(key, "=", value)

print(total(1, 2, 3, 4))
show(color="blue", size=10)
```

## Exercise

Write `greet(name, greeting="Hello")` returning e.g. `"Hello, Ada!"`.

```python exercise id=ex-args-greet
def greet(name, greeting="Hello"):
    # TODO
    pass
```

```python tests
assert greet("Ada") == "Hello, Ada!", "default greeting"
assert greet("Ada", "Hi") == "Hi, Ada!", "custom greeting"
assert greet(greeting="Hey", name="Bo") == "Hey, Bo!", "keyword args"
```

```python solution
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"
```
