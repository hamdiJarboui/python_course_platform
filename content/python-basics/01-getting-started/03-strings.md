---
title: Working with Strings
minutes: 12
objectives:
  - Build strings with f-strings
  - Use common string methods
  - Index and slice text
scope: lesson
---

# Working with Strings

A string is a sequence of characters. Use quotes, or triple quotes for several lines.

```python run
s = "Python"
poem = """Roses are red,
Violets are blue."""
print(s)
print(poem)
```

## f-strings

Put an `f` before the quote and write expressions in `{}`.

```python run
name = "Ada"
score = 92.456
print(f"{name} scored {score:.1f}%")
print(f"Double: {score * 2:.2f}")
```

> [!PYTHONIC] Prefer f-strings over `+` concatenation or `%` formatting.

## Useful methods

```python run
text = "  Hello, Python  "
print(text.strip())
print(text.upper())
print(text.lower())
print(text.replace("Python", "World"))
print("a,b,c".split(","))
print("-".join(["x", "y", "z"]))
```

Strings are **immutable**: methods return a new string, they never change the original.

## Indexing and slicing

Indexes start at `0`; negative indexes count from the end.

```python run
word = "Python"
print(word[0])      # P
print(word[-1])     # n
print(word[1:4])    # yth
print(word[:2])     # Py
print(word[::-1])   # nohtyP
print(len(word))    # 6
```

```text output
P
n
yth
Py
nohtyP
6
```

## Exercise

Write `shout(name)` that returns the name in upper case followed by an exclamation mark, e.g. `shout("ada")` → `"ADA!"`.

```python exercise id=ex-strings-shout
def shout(name):
    # TODO
    pass
```

```python tests
assert shout("ada") == "ADA!", "shout('ada') should be 'ADA!'"
assert shout("Py") == "PY!", "shout('Py') should be 'PY!'"
```

```python solution
def shout(name):
    return name.upper() + "!"
```
