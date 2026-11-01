---
title: Classes and Instances
minutes: 14
objectives:
  - Define a class with __init__
  - Add methods that use self
  - Distinguish instance and class attributes
scope: lesson
---

# Classes and Instances

A **class** is a blueprint; an **instance** is one object built from it.

```python run
class Dog:
    species = "Canis familiaris"      # class attribute, shared

    def __init__(self, name):
        self.name = name              # instance attribute

    def bark(self):
        return f"{self.name} says woof!"

rex = Dog("Rex")
fido = Dog("Fido")
print(rex.bark())
print(fido.name, fido.species)
```

`__init__` runs when you create an object. `self` is the instance the method is called on.

## State changes through methods

```python edit
class Counter:
    def __init__(self):
        self.value = 0

    def increment(self, by=1):
        self.value += by
        return self.value

c = Counter()
c.increment()
c.increment(5)
print(c.value)
```

> [!PYTHONIC] Keep attributes simple. Python has no `private` keyword; a leading underscore (`_cache`) means "internal, please don't touch".

## Exercise

Create a class `Rectangle(width, height)` with methods `area()` and `perimeter()`.

```python exercise id=ex-class-rectangle
class Rectangle:
    # TODO
    pass
```

```python tests
r = Rectangle(3, 4)
assert r.area() == 12, "area of 3x4 should be 12"
assert r.perimeter() == 14, "perimeter of 3x4 should be 14"
assert Rectangle(1, 1).area() == 1, "1x1 area"
```

```python solution
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)
```
