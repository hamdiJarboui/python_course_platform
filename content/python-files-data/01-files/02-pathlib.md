---
title: Paths with pathlib
minutes: 10
objectives:
  - Build paths with Path and the / operator
  - Read and write with read_text() and write_text()
  - Create folders and list their contents
scope: lesson
---

# Paths with pathlib

Gluing strings together like `"data" + "/" + name` breaks across operating systems.
The `pathlib` module gives you a `Path` object that knows how paths work.

```python setup
import os, tempfile
os.chdir(tempfile.mkdtemp())
```

```python run
from pathlib import Path

report = Path("reports") / "2026" / "summary.txt"
print(report.as_posix())
print(report.name, report.stem, report.suffix)
print(report.parent.as_posix())
```

## Quick reading and writing

For small files, `write_text()` and `read_text()` do the open/close dance for you.

```python run
from pathlib import Path

folder = Path("reports")
folder.mkdir(exist_ok=True)

page = folder / "hello.txt"
page.write_text("Hi from pathlib!\n", encoding="utf-8")
print(page.read_text(encoding="utf-8"))
print(page.exists(), page.is_file(), folder.is_dir())
```

## Listing and filtering files

```python edit
from pathlib import Path

folder = Path("reports")
folder.mkdir(exist_ok=True)
for name in ["a.txt", "b.txt", "c.csv"]:
    (folder / name).write_text(name, encoding="utf-8")

print(sorted(p.name for p in folder.iterdir()))
print(sorted(p.name for p in folder.glob("*.txt")))
```

> [!TIP] `mkdir(parents=True, exist_ok=True)` creates any missing parent folders and does not complain if the folder is already there.

## Exercise

Write `txt_files(folder)` that returns a **sorted list of names** (strings) of the `.txt` files directly inside `folder`.

```python exercise id=ex-pathlib-txt
from pathlib import Path


def txt_files(folder):
    return []
```

```python tests
from pathlib import Path
d = Path("ex_pathlib")
d.mkdir(exist_ok=True)
for n in ["b.txt", "a.txt", "notes.md", "c.txt"]:
    (d / n).write_text("x", encoding="utf-8")
assert txt_files(d) == ["a.txt", "b.txt", "c.txt"], "Return the sorted names of .txt files only"
assert txt_files(str(d)) == ["a.txt", "b.txt", "c.txt"], "It should also accept a plain string path"
```

```python solution
from pathlib import Path


def txt_files(folder):
    return sorted(p.name for p in Path(folder).glob("*.txt"))
```
