---
type: quiz
title: Errors and Standard Library Quiz
passScore: 70
shuffle: true
---

```quiz
- type: single
  q: Which block always runs, whether or not an exception occurred?
  options: ["else", "finally", "except", "try"]
  answer: 1
  explain: finally always executes, which makes it ideal for cleanup.

- type: short
  q: Which keyword raises an exception?
  answer: [raise]
  explain: Use raise ValueError("message") to signal an error.

- type: boolean
  q: A bare `except:` is recommended because it catches everything.
  answer: false
  explain: It hides bugs. Catch specific exceptions instead.

- type: single
  q: Which function converts a Python dict to JSON text?
  options: ["json.loads", "json.dumps", "json.parse", "json.encode_dict"]
  answer: 1
  explain: dumps = dump to string; loads = load from string.

- type: single
  q: What does `if __name__ == "__main__":` check?
  options: ["That Python 3 is used", "That the file is run directly rather than imported", "That main() exists", "That there are no errors"]
  answer: 1
  explain: The guard keeps script-only code from running on import.

- type: multiple
  q: Which are part of Python's standard library?
  options: [math, random, collections, flask]
  answer: [0, 1, 2]
  explain: flask is a third-party package that must be installed separately.

- type: boolean
  q: The `with` statement guarantees cleanup even if an error occurs.
  answer: true
  explain: Context managers close resources automatically.
```
