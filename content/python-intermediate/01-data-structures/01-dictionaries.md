---
title: Dictionaries
minutes: 14
objectives:
  - Create, read and update dictionaries
  - Loop over keys, values and items
  - Count things with a dictionary
scope: lesson
---

# Dictionaries

A dictionary maps **keys** to **values**.

```python run
person = {"name": "Ada", "age": 36}
print(person["name"])
person["city"] = "London"
print(person)
print(len(person))
```

## Safe lookups

`person["x"]` raises `KeyError` if the key is missing. `get()` returns a default instead.

```python run
person = {"name": "Ada"}
print(person.get("age"))
print(person.get("age", 0))
print("name" in person)
```

## Iterating

```python run
prices = {"apple": 1.5, "pear": 2.0}
for fruit in prices:
    print(fruit)
for fruit, price in prices.items():
    print(f"{fruit}: {price:.2f}")
print(list(prices.values()))
```

## Counting

```python edit
text = "the cat and the hat"
counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1
print(counts)
```

> [!PYTHONIC] `collections.Counter(text.split())` does the counting for you.

## Dict comprehensions

```python run
squares = {n: n * n for n in range(1, 5)}
print(squares)
```

## Exercise

Write `char_count(text)` returning a dict mapping each character to how many times it appears.

```python exercise id=ex-dict-charcount
def char_count(text):
    # TODO
    pass
```

```python tests
assert char_count("aab") == {"a": 2, "b": 1}, "char_count('aab')"
assert char_count("") == {}, "empty string"
assert char_count("hello")["l"] == 2, "l appears twice in hello"
```

```python solution
def char_count(text):
    counts = {}
    for ch in text:
        counts[ch] = counts.get(ch, 0) + 1
    return counts
```
