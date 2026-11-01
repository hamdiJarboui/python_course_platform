---
title: JSON and Working with Text
minutes: 12
objectives:
  - Convert Python data to and from JSON
  - Read and write text with file-like objects
  - Use with for safe resource handling
scope: lesson
---

# JSON and Working with Text

## JSON

JSON is the common exchange format for data. `json.dumps` turns Python data into text; `json.loads` turns it back.

```python run
import json

data = {"name": "Ada", "langs": ["python", "c"], "active": True}
text = json.dumps(data, indent=2)
print(text)

back = json.loads(text)
print(back["langs"][0])
print(back == data)
```

## File-like objects

`io.StringIO` behaves like a file kept in memory, so the same code works for files and strings.

```python run
import io

buffer = io.StringIO()
buffer.write("line one\n")
buffer.write("line two\n")
buffer.seek(0)

for line in buffer:
    print(line.strip().upper())
```

## The with statement

`with` guarantees cleanup, even if an error occurs. Real files use the same pattern:

```python
with open("notes.txt", "w") as f:
    f.write("hello\n")

with open("notes.txt") as f:
    print(f.read())
```

> [!TIP] In the browser, files live in a temporary in-memory file system and disappear when the page reloads.

## Parsing text

```python run
csv_text = "name,score\nAda,95\nGrace,98\n"
rows = [line.split(",") for line in csv_text.strip().splitlines()]
header, *records = rows
scores = {name: int(score) for name, score in records}
print(header)
print(scores)
```

## Exercise

Write `to_json_sorted(data)` returning the JSON text of a dict with keys sorted alphabetically and no extra whitespace formatting (default separators).

```python exercise id=ex-json-sorted
import json

def to_json_sorted(data):
    # TODO
    pass
```

```python tests
assert to_json_sorted({"b": 1, "a": 2}) == '{"a": 2, "b": 1}', "keys sorted"
assert to_json_sorted({}) == "{}", "empty dict"
```

```python solution
import json

def to_json_sorted(data):
    return json.dumps(data, sort_keys=True)
```
