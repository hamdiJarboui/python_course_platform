---
type: quiz
title: Classes Quiz
passScore: 70
shuffle: true
---

```quiz
- type: short
  q: What is the conventional name of the first parameter of an instance method?
  answer: [self]
  explain: self refers to the instance the method is called on.

- type: single
  q: Which method runs when a new object is created?
  options: ["__new_object__", "__init__", "__start__", "__create__"]
  answer: 1
  explain: __init__ initialises the new instance.

- type: boolean
  q: A class attribute is shared by all instances of the class.
  answer: true
  explain: Class attributes live on the class, so every instance sees the same value.

- type: single
  q: What does super().__init__(...) do inside a subclass?
  options: ["Deletes the parent", "Calls the parent's __init__", "Creates a second object", "Makes the class abstract"]
  answer: 1
  explain: super() gives access to the parent class so you can reuse its behaviour.

- type: multiple
  q: Which dunder methods exist for the listed purposes?
  options: ["__repr__ for developer-friendly text", "__add__ for the + operator", "__len__ for len()", "__print__ for print()"]
  answer: [0, 1, 2]
  explain: There is no __print__ method; print() uses __str__ or __repr__.

- type: single
  q: Dog extends Animal and both define speak(). Calling Dog().speak() runs...
  options: ["Animal.speak", "Dog.speak", "Both", "Neither"]
  answer: 1
  explain: The subclass override takes precedence.
```
