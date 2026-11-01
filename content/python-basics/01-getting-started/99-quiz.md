---
type: quiz
title: Getting Started Quiz
passScore: 70
shuffle: true
---

```quiz
- type: single
  q: Which function prints text to the screen?
  options: ["echo()", "print()", "write()", "say()"]
  answer: 1
  explain: print() writes to standard output.

- type: multiple
  q: Which are valid variable names?
  options: [my_var, 2cool, _x, class]
  answer: [0, 2]
  explain: Names cannot start with a digit and cannot be keywords such as class.

- type: boolean
  q: Python is a statically typed language.
  answer: false
  explain: Python is dynamically typed — a variable can be rebound to a value of another type.

- type: short
  q: Which character starts a comment in Python?
  answer: ["#"]
  explain: Everything after # on a line is ignored by the interpreter.

- type: single
  q: What does 7 // 2 evaluate to?
  options: ["3.5", "3", "4", "1"]
  answer: 1
  explain: // is floor division, so 7 // 2 is 3.

- type: single
  q: What type does input() always return?
  options: [int, float, str, bool]
  answer: 2
  explain: input() returns text; convert it with int() or float() when you need a number.

- type: boolean
  q: Strings are immutable, so "abc".upper() changes the original string.
  answer: false
  explain: upper() returns a new string and leaves the original untouched.
```
