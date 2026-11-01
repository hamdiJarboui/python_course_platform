---
type: quiz
title: Data Structures Quiz
passScore: 70
shuffle: true
---

```quiz
- type: single
  q: Which call returns 0 instead of raising an error when the key "age" is missing from dict d?
  options: ['d["age"]', 'd.get("age", 0)', 'd.age', 'd.pop("age")']
  answer: 1
  explain: dict.get(key, default) returns the default for missing keys.

- type: boolean
  q: Tuples can be modified after they are created.
  answer: false
  explain: Tuples are immutable.

- type: single
  q: What is len({1, 2, 2, 3})?
  options: ["4", "3", "2", "1"]
  answer: 1
  explain: Sets store unique values, so the duplicate 2 is dropped.

- type: multiple
  q: Which are valid comprehensions?
  options: ["[n for n in range(3)]", "{n: n for n in range(3)}", "{n for n in range(3)}", "<n for n in range(3)>"]
  answer: [0, 1, 2]
  explain: Python has list, dict and set comprehensions. Angle brackets are not valid.

- type: short
  q: Which keyword turns a function into a generator?
  answer: [yield]
  explain: A function containing yield returns a generator object.

- type: single
  q: Which operator gives the intersection of two sets?
  options: ["|", "&", "-", "^"]
  answer: 1
  explain: "& is intersection, | is union, - is difference, ^ is symmetric difference."

- type: boolean
  q: A generator expression builds the entire list in memory first.
  answer: false
  explain: Generators produce values lazily, one at a time.
```
