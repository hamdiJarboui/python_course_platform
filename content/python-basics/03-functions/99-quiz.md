---
type: quiz
title: Functions Quiz
passScore: 70
shuffle: true
---

```quiz
- type: short
  q: Which keyword defines a function?
  answer: [def]
  explain: Functions are defined with def.

- type: single
  q: What does a function without a return statement give back?
  options: ["0", '""', "None", "False"]
  answer: 2
  explain: A function that does not return explicitly returns None.

- type: boolean
  q: A variable assigned inside a function is visible everywhere in the program.
  answer: false
  explain: It is local to the function unless declared global (which you should avoid).

- type: single
  q: What does def f(a, b=2) mean for b?
  options: ["b is required", "b defaults to 2 when omitted", "b must always be 2", "b is a keyword"]
  answer: 1
  explain: Default values are used when the caller omits the argument.

- type: multiple
  q: Which of these are good practice for functions?
  options: ["Do one thing", "Use mutable defaults like items=[]", "Return values instead of mutating globals", "Write a docstring"]
  answer: [0, 2, 3]
  explain: Mutable defaults are shared between calls and cause surprising bugs.

- type: single
  q: What does sorted(["bb", "a", "ccc"], key=len) return?
  options: ["['a', 'bb', 'ccc']", "['ccc', 'bb', 'a']", "['bb', 'a', 'ccc']", "['a', 'ccc', 'bb']"]
  answer: 0
  explain: key=len sorts by string length, shortest first.

- type: boolean
  q: "`*args` collects extra positional arguments into a tuple."
  answer: true
  explain: Inside the function args is a tuple of the extra positional values.
```
