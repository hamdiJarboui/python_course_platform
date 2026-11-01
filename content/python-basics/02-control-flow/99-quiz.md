---
type: quiz
title: Control Flow Quiz
passScore: 70
shuffle: true
---

```quiz
- type: single
  q: What does list(range(2, 8, 2)) produce?
  options: ["[2, 4, 6]", "[2, 4, 6, 8]", "[2, 3, 4, 5, 6, 7]", "[4, 6, 8]"]
  answer: 0
  explain: range excludes the stop value, so it yields 2, 4, 6.

- type: boolean
  q: "`=` and `==` do the same thing in Python."
  answer: false
  explain: "`=` assigns a value; `==` compares two values."

- type: multiple
  q: Which values are falsy?
  options: ["0", '""', "[]", '"False"']
  answer: [0, 1, 2]
  explain: Zero, the empty string and the empty list are falsy. The text "False" is a non-empty string, so it is truthy.

- type: short
  q: Which keyword exits a loop immediately?
  answer: [break]
  explain: break stops the loop; continue only skips to the next iteration.

- type: single
  q: "In `for i in range(3): print(i)`, what is the last value printed?"
  options: ["0", "2", "3", "Nothing"]
  answer: 1
  explain: The loop prints 0, 1, 2, so the last printed value is 2.

- type: single
  q: Which call returns a new sorted list without changing the original?
  options: ["nums.sort()", "sorted(nums)", "nums.order()", "sort(nums)"]
  answer: 1
  explain: sorted() returns a new list; list.sort() sorts in place and returns None.

- type: boolean
  q: A while loop whose condition never becomes false runs forever.
  answer: true
  explain: Always change a variable used by the condition inside the loop.
```
