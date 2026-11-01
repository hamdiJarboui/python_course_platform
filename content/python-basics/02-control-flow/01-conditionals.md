---
title: Conditionals
minutes: 12
objectives:
  - Compare values with comparison operators
  - Combine conditions with and, or, not
  - Branch with if, elif and else
scope: lesson
---

# Conditionals

## Booleans and comparisons

Comparisons produce `True` or `False`.

```python run
print(5 > 3)
print(5 == 5)
print(5 != 5)
print("a" < "b")
print(3 <= 2)
```

> [!WARNING] `=` assigns, `==` compares. Mixing them up is a classic bug.

## if / elif / else

Indentation (4 spaces) defines the block.

```python edit
temperature = 18

if temperature > 25:
    print("Hot")
elif temperature > 15:
    print("Mild")
else:
    print("Cold")
```

## and, or, not

```python run
age = 20
has_ticket = True

print(age >= 18 and has_ticket)
print(age < 18 or has_ticket)
print(not has_ticket)
```

## Truthiness

Empty values count as false: `0`, `""`, `[]`, `None`. Everything else is true.

```python run
name = ""
if name:
    print("Hello", name)
else:
    print("No name given")
```

> [!PYTHONIC] Write `if items:` instead of `if len(items) > 0:`.

## Exercise

Write `grade(score)` returning `"A"` for 90+, `"B"` for 80–89, `"C"` for 70–79 and `"F"` otherwise.

```python exercise id=ex-cond-grade
def grade(score):
    # TODO
    pass
```

```python tests
assert grade(95) == "A", "95 should be A"
assert grade(90) == "A", "90 should be A"
assert grade(85) == "B", "85 should be B"
assert grade(70) == "C", "70 should be C"
assert grade(12) == "F", "12 should be F"
```

```python solution
def grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    return "F"
```
