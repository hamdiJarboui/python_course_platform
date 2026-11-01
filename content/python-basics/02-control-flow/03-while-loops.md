---
title: while Loops
minutes: 10
objectives:
  - Repeat work while a condition holds
  - Use break and continue
  - Avoid infinite loops
scope: lesson
---

# while Loops

`while` repeats as long as its condition is true. Use it when you do not know in advance how many repeats you need.

```python run
count = 3
while count > 0:
    print("Countdown:", count)
    count -= 1
print("Liftoff!")
```

> [!WARNING] If the condition never becomes false the loop never ends. Always change something inside the loop. The **Stop** button will rescue you.

## break and continue

`break` leaves the loop immediately; `continue` skips to the next iteration.

```python run
for n in range(1, 10):
    if n % 2 == 0:
        continue
    if n > 7:
        break
    print(n)
```

## Loop with a goal

Collatz: halve even numbers, otherwise compute `3n + 1`, until you reach 1.

```python edit
n = 6
steps = 0
while n != 1:
    n = n // 2 if n % 2 == 0 else 3 * n + 1
    steps += 1
print("Steps:", steps)
```

## Exercise

Write `digits(n)` returning how many digits the positive integer `n` has, using a `while` loop (no `len(str(n))`).

```python exercise id=ex-while-digits
def digits(n):
    # TODO
    pass
```

```python tests
assert digits(7) == 1, "digits(7) should be 1"
assert digits(10) == 2, "digits(10) should be 2"
assert digits(98765) == 5, "digits(98765) should be 5"
```

```python solution
def digits(n):
    count = 0
    while n > 0:
        n //= 10
        count += 1
    return count
```
