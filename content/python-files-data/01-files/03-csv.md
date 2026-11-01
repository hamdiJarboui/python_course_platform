---
title: CSV Files
minutes: 12
objectives:
  - Read rows with csv.DictReader
  - Write rows with csv.DictWriter
  - Convert text cells into numbers
scope: lesson
---

# CSV Files

**CSV** (comma-separated values) is the lingua franca of spreadsheets. The `csv` module handles
the tricky parts — quoting, commas inside values, line endings — so you don't have to.

```python setup
import os, tempfile
os.chdir(tempfile.mkdtemp())
with open("scores.csv", "w", encoding="utf-8", newline="") as f:
    f.write("name,score\nAda,91\nGrace,88\nLinus,75\n")
```

## Reading rows

`csv.DictReader` turns every row into a dictionary keyed by the header line.

```python run
import csv

with open("scores.csv", encoding="utf-8", newline="") as f:
    for row in csv.DictReader(f):
        print(row["name"], "scored", row["score"])
```

> [!WARNING] Every cell is read as a **string**. Convert with `int()` or `float()` before doing maths.

```python run
import csv

with open("scores.csv", encoding="utf-8", newline="") as f:
    scores = [int(row["score"]) for row in csv.DictReader(f)]

print(scores, "average:", sum(scores) / len(scores))
```

## Writing rows

```python edit
import csv

people = [
    {"name": "Ada", "city": "London"},
    {"name": "Guido", "city": "Amsterdam, NL"},
]

with open("people.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "city"])
    writer.writeheader()
    writer.writerows(people)

with open("people.csv", encoding="utf-8", newline="") as f:
    print(f.read())
```

Notice how `"Amsterdam, NL"` was quoted automatically because it contains a comma.

> [!PYTHONIC] Open CSV files with `newline=""`. The csv module manages line endings itself; without it you can get blank lines between rows on Windows.

## Exercise

Write `top_scorer(path)` that reads a CSV with `name` and `score` columns and returns the **name** with the highest score.

```python exercise id=ex-csv-top
import csv


def top_scorer(path):
    pass
```

```python tests
assert top_scorer("scores.csv") == "Ada", "Ada has the highest score in scores.csv"
with open("t.csv", "w", encoding="utf-8", newline="") as f:
    f.write("name,score\nA,9\nB,10\nC,100\n")
assert top_scorer("t.csv") == "C", "Compare scores as numbers, not strings ('100' < '9' as text!)"
```

```python solution
import csv


def top_scorer(path):
    with open(path, encoding="utf-8", newline="") as f:
        best = max(csv.DictReader(f), key=lambda row: int(row["score"]))
    return best["name"]
```
