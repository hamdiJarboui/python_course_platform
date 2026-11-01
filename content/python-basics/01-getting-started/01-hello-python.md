---
title: Hello, Python
minutes: 8
objectives:
  - Print text with print()
  - Understand how Python runs a script
  - Write comments
scope: cell
---

# Hello, Python

Python is a readable, general-purpose language used for web apps, data science, automation and more.
A Python program is a list of **statements** that the interpreter runs from top to bottom.

## Your first program

Press **Run** to execute the code below. The result appears in the output panel.

```python run
print("Hello, world!")
```

```text output
Hello, world!
```

`print()` is a **function**: you give it a value inside the parentheses and it writes that value to the screen.

## Printing several things

`print()` accepts many values separated by commas and puts a space between them.

```python edit
print("Python", "is", "fun")
print("2 + 3 =", 2 + 3)
```

Change the text and run it again — editing is the fastest way to learn.

> [!TIP] Strings can use single or double quotes: `'hi'` and `"hi"` are the same thing.

## Comments

Anything after `#` is ignored by Python. Use comments to explain *why*, not *what*.

```python run
# This line is a comment
print("Comments are ignored")  # so is this part
```

## Errors are normal

When Python cannot understand your code it shows an error message that names the line and the problem.
This snippet is missing its closing quote, so it fails with a `SyntaxError`:

```python
print("Missing a quote)
```

Read the message, fix the code, run again. That loop is most of programming.

> [!NOTE] Python is case-sensitive: `print` works, `Print` does not.

## Exercise

Create a variable named `greeting` that holds the text `Hello, PyCourses!` and print it.

```python exercise id=ex-hello-greeting
# Create greeting, then print it
```

```python tests
assert "greeting" in globals(), "Create a variable called greeting"
assert greeting == "Hello, PyCourses!", "greeting should be exactly 'Hello, PyCourses!'"
```

```python solution
greeting = "Hello, PyCourses!"
print(greeting)
```
