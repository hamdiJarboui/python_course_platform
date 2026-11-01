---
title: Comprehensions and Generators
minutes: 12
objectives:
  - Write list, dict and set comprehensions
  - Use conditions and nested loops in comprehensions
  - Save memory with generator expressions
scope: lesson
---

# Comprehensions and Generators

## The three forms

```python run
words = ["apple", "kiwi", "banana"]
print([w.upper() for w in words])
print({w: len(w) for w in words})
print({len(w) for w in words})
```

## Conditions

```python run
nums = range(10)
print([n for n in nums if n % 3 == 0])
print(["even" if n % 2 == 0 else "odd" for n in range(4)])
```

## Nested loops

```python run
pairs = [(x, y) for x in range(1, 3) for y in "ab"]
print(pairs)
```

> [!WARNING] More than two clauses becomes hard to read — use a normal loop instead.

## Generator expressions

Round brackets create values lazily, one at a time, without building a list.

```python run
total = sum(n * n for n in range(1000))
print(total)

gen = (n for n in range(3))
print(next(gen), next(gen), next(gen))
```

## Generator functions

`yield` produces a value and pauses the function.

```python run
def countdown(n):
    while n > 0:
        yield n
        n -= 1

print(list(countdown(3)))
```

## Exercise

Write `word_lengths(sentence)` returning a dict mapping each word of the sentence to its length.

```python exercise id=ex-comp-wordlen
def word_lengths(sentence):
    # TODO
    pass
```

```python tests
assert word_lengths("hi there") == {"hi": 2, "there": 5}, "hi there"
assert word_lengths("") == {}, "empty sentence"
```

```python solution
def word_lengths(sentence):
    return {w: len(w) for w in sentence.split()}
```
