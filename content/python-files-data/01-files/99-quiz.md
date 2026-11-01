---
type: quiz
title: Working with Files Quiz
passScore: 70
shuffle: true
---

```quiz
- type: single
  q: Which mode opens a file for writing and erases what was there?
  options: ['"r"', '"a"', '"w"', '"x"']
  answer: 2
  explain: '"w" truncates the file first. "a" appends and "x" refuses to overwrite.'

- type: boolean
  q: A with block closes the file even if an exception happens inside it.
  answer: true
  explain: That is exactly why with is the recommended way to work with files.

- type: single
  q: What does Path("data") / "a.csv" produce?
  options: ["A TypeError", "A plain string", "A Path pointing to data/a.csv", "A list of paths"]
  answer: 2
  explain: The / operator joins Path objects and strings into a new Path.

- type: multiple
  q: Which statements about csv.DictReader are true?
  options: ["Each row is a dictionary", "Numbers are converted automatically", "Keys come from the header line", "It only reads files with two columns"]
  answer: [0, 2]
  explain: Rows are dicts keyed by the header, but every value stays a string.

- type: short
  q: Which keyword argument of open() should you set to an empty string for CSV files? (just its name)
  answer: ["newline"]
  explain: newline="" lets the csv module manage line endings itself.

- type: single
  q: Which Path attribute gives the file name without its extension?
  options: [".name", ".stem", ".suffix", ".parent"]
  answer: 1
  explain: For report.txt, .stem is "report", .suffix is ".txt" and .name is "report.txt".
```
