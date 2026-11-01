---
title: Inheritance
minutes: 12
objectives:
  - Create a subclass
  - Override methods and call super()
  - Use polymorphism
scope: lesson
---

# Inheritance

A subclass reuses and extends a parent class.

```python run
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

class Cat(Animal):
    def speak(self):
        return "Meow"

class Dog(Animal):
    def speak(self):
        return "Woof"

for pet in [Cat("Tom"), Dog("Rex"), Animal("Generic")]:
    print(pet.name, pet.speak())
```

Calling the same method on different types and getting type-specific behaviour is called **polymorphism**.

## super()

`super()` calls the parent's version of a method.

```python run
class Vehicle:
    def __init__(self, wheels):
        self.wheels = wheels

class Bike(Vehicle):
    def __init__(self, brand):
        super().__init__(2)
        self.brand = brand

b = Bike("Trek")
print(b.wheels, b.brand)
print(isinstance(b, Vehicle))
```

> [!TIP] Prefer composition ("has a") over inheritance ("is a") when the relationship is not truly an "is-a".

## Exercise

Given `Shape` with `area()` returning `0`, write `Square(side)` extending it and overriding `area()`.

```python exercise id=ex-inherit-square
class Shape:
    def area(self):
        return 0

class Square(Shape):
    # TODO
    pass
```

```python tests
s = Square(5)
assert isinstance(s, Shape), "Square must extend Shape"
assert s.area() == 25, "Square(5).area() should be 25"
assert Shape().area() == 0, "Shape.area() stays 0"
```

```python solution
class Shape:
    def area(self):
        return 0

class Square(Shape):
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2
```
