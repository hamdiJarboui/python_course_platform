---
title: Reading and Writing Files
minutes: 12
objectives:
  - Open files with open() and a with block
  - Write, append and read text
  - Loop over a file line by line
scope: lesson
---

# Reading and Writing Files

Programs become useful when they remember things between runs. The simplest way is a **file**.
In this course every file lives in a private, in-browser file system, so experiment freely.

```python setup
import os, tempfile
os.chdir(tempfile.mkdtemp())
```

## Writing a file

`open(path, mode)` returns a file object. Mode `"w"` creates the file (or empties it first).
Always use a `with` block — it closes the file for you, even if an error happens.

```python run
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("first line\n")
    f.write("second line\n")

print("saved!")
```

## Reading it back

```python run
with open("notes.txt", encoding="utf-8") as f:
    text = f.read()

print(repr(text))
print(text.splitlines())
```

| Mode | Meaning |
|---|---|
| `"r"` | read (the default) — file must exist |
| `"w"` | write — creates or **overwrites** |
| `"a"` | append — adds to the end |
| `"x"` | create — fails if the file exists |

> [!WARNING] `"w"` silently wipes the existing contents. Use `"a"` to add, or `"x"` to be safe.

## Appending and looping over lines

A file object is iterable: each step gives you one line, including its `\n`.

```python edit
with open("notes.txt", "a", encoding="utf-8") as f:
    f.write("third line\n")

with open("notes.txt", encoding="utf-8") as f:
    for number, line in enumerate(f, start=1):
        print(number, line.rstrip())
```

> [!PYTHONIC] Pass `encoding="utf-8"` explicitly. The default depends on the operating system, which is a classic source of "works on my machine" bugs.

## Exercise

Write a function `save_lines(path, lines)` that writes each string in `lines` to the file on its own line,
and `count_lines(path)` that returns how many lines the file has.

```python exercise id=ex-files-save-count
def save_lines(path, lines):
    pass


def count_lines(path):
    pass
```

```python tests
save_lines("shopping.txt", ["eggs", "milk", "bread"])
with open("shopping.txt", encoding="utf-8") as f:
    assert f.read() == "eggs\nmilk\nbread\n", "Each item should be on its own line, ending with a newline"
assert count_lines("shopping.txt") == 3, "count_lines should return 3 for three items"
save_lines("empty.txt", [])
assert count_lines("empty.txt") == 0, "An empty file has 0 lines"
```

```python solution
def save_lines(path, lines):
    with open(path, "w", encoding="utf-8") as f:
        for line in lines:
            f.write(line + "\n")


def count_lines(path):
    with open(path, encoding="utf-8") as f:
        return sum(1 for _ in f)
```
