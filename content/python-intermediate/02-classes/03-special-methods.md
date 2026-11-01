---
title: Special Methods
minutes: 12
objectives:
  - Customise printing with __repr__ and __str__
  - Overload operators like + and ==
  - Make objects iterable-friendly with __len__
scope: lesson
---

# Special Methods

Methods named `__like_this__` ("dunder" methods) let your objects work with built-in syntax.

```python run
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

    def __add__(self, other):
        return Point(self.x + other.x, self.y + other.y)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

p = Point(1, 2) + Point(3, 4)
print(p)
print(p == Point(4, 6))
```

## __str__ vs __repr__

`__repr__` is for developers (unambiguous); `__str__` is for users. `print()` uses `__str__`, falling back to `__repr__`.

## __len__ and __getitem__

```python run
class Playlist:
    def __init__(self, songs):
        self.songs = songs

    def __len__(self):
        return len(self.songs)

    def __getitem__(self, index):
        return self.songs[index]

pl = Playlist(["a", "b", "c"])
print(len(pl), pl[1])
for song in pl:
    print(song)
```

> [!NOTE] Defining `__getitem__` is enough to make an object iterable with `for`.

## Exercise

Write class `Money(amount)` where `+` returns a new `Money` with the summed amount, and `repr` looks like `Money(15)`.

```python exercise id=ex-dunder-money
class Money:
    # TODO
    pass
```

```python tests
m = Money(5) + Money(10)
assert isinstance(m, Money), "+ should return Money"
assert m.amount == 15, "amounts should add"
assert repr(m) == "Money(15)", "repr should be Money(15)"
```

```python solution
class Money:
    def __init__(self, amount):
        self.amount = amount

    def __add__(self, other):
        return Money(self.amount + other.amount)

    def __repr__(self):
        return f"Money({self.amount})"
```
