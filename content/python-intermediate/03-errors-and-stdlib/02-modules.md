---
title: Modules and the Standard Library
minutes: 12
objectives:
  - Import modules in different ways
  - Use math, random, datetime and collections
  - Understand the __name__ == "__main__" idiom
scope: lesson
---

# Modules and the Standard Library

A **module** is a Python file you can import. Python ships with a huge standard library.

```python run
import math

print(math.sqrt(16))
print(math.pi)
print(math.floor(2.7), math.ceil(2.1))
```

## Import styles

```python run
from math import sqrt, pi
import math as m

print(sqrt(25), round(pi, 3), m.factorial(5))
```

> [!NOTE] Avoid `from module import *`; it hides where names come from.

## Handy modules

```python run
import random
from collections import Counter, defaultdict
from datetime import date

random.seed(1)                      # reproducible results
print(random.choice(["a", "b", "c"]) in "abc")

print(Counter("mississippi").most_common(2))

groups = defaultdict(list)
for word in ["apple", "avocado", "banana"]:
    groups[word[0]].append(word)
print(dict(groups))

print(date(2024, 2, 29).strftime("%d/%m/%Y"))
```

## The main guard

Code under this check runs only when the file is executed directly, not when imported.

```python run
def main():
    print("running as a script")

if __name__ == "__main__":
    main()
```

## Exercise

Write `most_common_word(text)` returning the most frequent word (lower-case). Break ties by the word that appears first.

```python exercise id=ex-mod-commonword
from collections import Counter

def most_common_word(text):
    # TODO
    pass
```

```python tests
assert most_common_word("a b a") == "a", "a is most common"
assert most_common_word("The cat the dog the end") == "the", "case-insensitive"
assert most_common_word("x y") == "x", "tie -> first seen"
```

```python solution
from collections import Counter

def most_common_word(text):
    words = text.lower().split()
    return Counter(words).most_common(1)[0][0]
```
