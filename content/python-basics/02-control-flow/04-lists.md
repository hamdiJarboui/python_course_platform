---
title: Lists
minutes: 14
objectives:
  - Create and modify lists
  - Slice and sort lists
  - Build lists with comprehensions
scope: lesson
---

# Lists

A list is an ordered, changeable collection.

```python run
fruits = ["apple", "banana", "cherry"]
print(fruits[0])
print(fruits[-1])
print(len(fruits))
```

## Changing lists

```python edit
nums = [3, 1, 2]
nums.append(10)
nums.insert(0, 99)
nums.remove(1)
last = nums.pop()
print(nums, last)

nums.sort()
print(nums)
print(sorted(nums, reverse=True))
```

`sort()` changes the list in place; `sorted()` returns a new one.

## Slicing and membership

```python run
letters = ["a", "b", "c", "d", "e"]
print(letters[1:4])
print(letters[::2])
print("c" in letters)
```

## List comprehensions

A compact way to build a list from another sequence.

```python run
squares = [n * n for n in range(1, 6)]
evens = [n for n in range(10) if n % 2 == 0]
print(squares)
print(evens)
```

> [!PYTHONIC] Comprehensions replace most "create empty list, loop, append" patterns.

## Exercise

Write `squares_of_evens(nums)` returning a list with the square of each even number, keeping order.

```python exercise id=ex-lists-squares
def squares_of_evens(nums):
    # TODO
    pass
```

```python tests
assert squares_of_evens([1, 2, 3, 4]) == [4, 16], "[1, 2, 3, 4] -> [4, 16]"
assert squares_of_evens([]) == [], "empty list -> empty list"
assert squares_of_evens([5, 7]) == [], "no evens -> []"
```

```python solution
def squares_of_evens(nums):
    return [n * n for n in nums if n % 2 == 0]
```
