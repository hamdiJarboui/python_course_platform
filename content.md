---
title: "Python Programming Course"
slug: "python-programming-course"
description: "A beginner-friendly Python course with interactive lessons, runnable examples, exercises, and quizzes."
theme: "python"
language: "en"
level: "beginner"
version: "1.0.0"
modules:
  - id: "introduction-to-python"
    title: "Introduction to Python"
  - id: "python-basics"
    title: "Python Basics"
  - id: "control-flow"
    title: "Control Flow"
  - id: "functions"
    title: "Functions"
  - id: "data-structures"
    title: "Data Structures"
  - id: "final-project"
    title: "Final Project"
---

# Python Programming Course

## Table of Contents

1. [Course Overview](#course-overview)
2. [Module: Introduction to Python](#module-introduction-to-python)
3. [Module: Python Basics](#module-python-basics)
4. [Module: Control Flow](#module-control-flow)
5. [Module: Functions](#module-functions)
6. [Module: Data Structures](#module-data-structures)
7. [Module: Final Project](#module-final-project)
8. [Course Completion](#course-completion)

## Course Overview

Welcome to the Python Programming Course. This course is designed for beginners who want to learn Python from the ground up. You will work through six modules, each containing focused lessons, hands-on examples, practice exercises, and a quiz.

### What You Will Learn

- How Python works and how to run Python programs
- Variables, data types, and basic operators
- How to control the flow of your programs with conditionals and loops
- How to write and use your own functions
- How to store and organize data using lists, tuples, dictionaries, and sets
- How to plan and build a small Python project

### How to Use This Course

- Read each lesson carefully and run the code examples.
- Edit the runnable code blocks to experiment with your own ideas.
- Complete the practice exercises at the end of each lesson.
- Take the quiz at the end of each module to check your understanding.
- Your progress is saved automatically so you can resume where you left off.

---

<!-- module id="introduction-to-python" slug="introduction-to-python" title="Introduction to Python" order=1 -->

## Module: Introduction to Python

This module introduces you to Python and helps you write and run your first Python programs.

### Learning Objectives

By the end of this module, you will be able to:

- Explain what Python is and where it is used.
- Install Python on your computer.
- Write and run a simple Python program.
- Read and understand common Python error messages.

### Lessons

#### Lesson: Welcome to the Course

Welcome! You are starting your journey with Python, one of the most popular programming languages in the world. Python is used for web development, data science, automation, artificial intelligence, and much more.

**Estimated time:** 10 minutes

**Learning objectives:**

- Understand what this course covers.
- Know how to navigate the platform.
- Feel ready to start learning.

Python was created by Guido van Rossum and first released in 1991. Its design emphasizes code readability and simplicity, making it an excellent first language.

```python run title="Your first Python output"
print("Welcome to Python!")
```

Edit the message inside the quotes and run the block again to see the output change.

**Common mistakes:**

- Forgetting to save or run the code after editing.
- Expecting output to appear without a `print()` statement.

**Practice exercise:** Change the text inside `print()` to introduce yourself, then run the block.

**Lesson summary:** You have seen your first Python program run. In the next lesson, you will learn what Python is and why it is so widely used.

<!-- progress:lesson-complete id="welcome-to-the-course" -->

<!-- /lesson -->

#### Lesson: What is Python?

Python is a high-level, interpreted programming language. High-level means it is closer to human language than machine code. Interpreted means the code is executed line by line by the Python interpreter.

**Estimated time:** 15 minutes

**Learning objectives:**

- Describe Python's main characteristics.
- List common uses of Python.
- Understand the difference between interpreted and compiled languages.

Python is known for its clean syntax. It uses indentation to structure code, which makes programs easy to read.

```python run title="Python version info"
import sys
print("Python version:", sys.version)
```

This program imports the `sys` module and prints the version of Python running in your browser.

**Common mistakes:**

- Assuming Python code needs to be compiled before running.
- Confusing Python with other languages that use curly braces for blocks.

**Practice experiment:** Try removing the `import sys` line and running the block again. Observe the error message.

**Lesson summary:** Python is an interpreted, high-level language valued for readability and versatility. You are now ready to install Python and run your own programs.

<!-- progress:lesson-complete id="what-is-python" -->

<!-- /lesson -->

#### Lesson: Installing Python

To write Python programs on your own computer, you need to install Python. This platform runs Python in your browser, but installing Python locally lets you build projects outside the browser.

**Estimated time:** 15 minutes

**Learning objectives:**

- Know where to download Python.
- Understand how to verify the installation.
- Be able to run Python from the terminal or command prompt.

Visit python.org to download the latest version for your operating system. During installation, check the option to add Python to your system PATH.

After installation, open a terminal or command prompt and run:

```bash
python --version
```

You should see output similar to `Python 3.12.x`.

**Common mistakes:**

- Forgetting to check "Add Python to PATH" during installation on Windows.
- Typing `python` when the system expects `python3` on macOS or Linux.

**Practice exercise:** Open your terminal and run `python --version` or `python3 --version` to confirm Python is installed.

**Lesson summary:** You now know how to install Python and verify it from the command line.

<!-- progress:lesson-complete id="installing-python" -->

<!-- /lesson -->

#### Lesson: Running Your First Python Program

There are two common ways to run Python code: interactively in the Python REPL, or by saving code to a `.py` file and running it.

**Estimated time:** 20 minutes

**Learning objectives:**

- Run Python code interactively.
- Create and run a Python script file.
- Understand the difference between the REPL and a script.

To start the interactive REPL, type `python` in your terminal and press Enter. You will see a `>>>` prompt where you can type code line by line.

To run a script, save your code in a file named `hello.py`:

```python
print("Hello, Python!")
print("This is my first program.")
```

Then run it from the terminal:

```bash
python hello.py
```

```python run title="Running a multi-line program"
print("Hello, Python!")
print("This is my first program.")
print("I am learning to code.")
```

**Common mistakes:**

- Forgetting to save the file before running it.
- Running the wrong file or being in the wrong directory.

**Practice exercise:** Create a file named `greeting.py` with two `print()` statements and run it.

**Lesson summary:** You can now run Python code both interactively and from script files.

<!-- progress:lesson-complete id="running-your-first-python-program" -->

<!-- /lesson -->

#### Lesson: Understanding Errors

Every programmer encounters errors. Python error messages are designed to be readable and helpful. Learning to read them will save you time.

**Estimated time:** 15 minutes

**Learning objectives:**

- Identify common Python error types.
- Read a Python traceback.
- Fix simple syntax and runtime errors.

Common error types include:

- `SyntaxError`: The code breaks Python's grammar rules.
- `NameError`: You used a variable that has not been defined.
- `TypeError`: You tried to do something with the wrong data type.
- `IndentationError`: Your indentation is inconsistent.

```python run title="A common error example"
# This will cause a NameError because greeting is not defined
print(greeting)
```

When you run the block above, Python will show a `NameError` with details about what went wrong.

**Common mistakes:**

- Misspelling variable names.
- Forgetting to define a variable before using it.
- Using inconsistent indentation.

**Practice exercise:** Intentionally create a `NameError` by printing an undefined variable, then fix it by defining the variable first.

**Lesson summary:** Error messages are your friend. They tell you what went wrong and where, so you can fix it and keep learning.

<!-- progress:lesson-complete id="understanding-errors" -->

<!-- /lesson -->

## Module Summary

In this module, you learned:

- What Python is and why it is popular.
- How to install Python and run programs.
- How to write your first Python programs.
- How to read and fix common Python errors.

You are ready to move on to Python Basics, where you will learn about variables and data types.

---

<!-- quiz module="introduction-to-python" title="Introduction to Python Quiz" passingScore=70 -->

```json
{
  "moduleId": "introduction-to-python",
  "title": "Introduction to Python Quiz",
  "questions": [
    {
      "id": "intro-q1",
      "type": "single-choice",
      "question": "What does the print() function do?",
      "options": [
        "Displays output to the screen",
        "Creates a variable",
        "Stops the program",
        "Imports a module"
      ],
      "correctAnswer": 0,
      "explanation": "print() displays output to the console or terminal."
    },
    {
      "id": "intro-q2",
      "type": "true-false",
      "question": "Python is a compiled language only.",
      "correctAnswer": false,
      "explanation": "Python is typically interpreted, executing code line by line."
    },
    {
      "id": "intro-q3",
      "type": "multiple-choice",
      "question": "Which of the following are valid ways to run Python code?",
      "options": [
        "Interactive REPL",
        "Saving code to a .py file and running it",
        "Using a web browser only",
        "Running from the terminal with python filename.py"
      ],
      "correctAnswers": [0, 1, 3],
      "explanation": "Python can be run interactively or from script files. A web browser is not required unless using an online platform."
    },
    {
      "id": "intro-q4",
      "type": "true-false",
      "question": "Python was first released in 1991.",
      "correctAnswer": true,
      "explanation": "Python was created by Guido van Rossum and first released in 1991."
    },
    {
      "id": "intro-q5",
      "type": "single-choice",
      "question": "Which command checks the installed Python version?",
      "options": [
        "python --version",
        "python install",
        "python start",
        "python help"
      ],
      "correctAnswer": 0,
      "explanation": "Running python --version or python3 --version displays the installed Python version."
    }
  ]
}
```

<!-- /quiz -->

<!-- /module -->

---

<!-- module id="python-basics" slug="python-basics" title="Python Basics" order=2 -->

## Module: Python Basics

This module covers the fundamental building blocks of Python: variables, data types, numbers, strings, and user input.

### Learning Objectives

By the end of this module, you will be able to:

- Create and use variables.
- Work with common data types.
- Perform math operations with numbers.
- Manipulate strings.
- Get input from the user.

### Lessons

#### Lesson: Variables

A variable is a name that stores a value. You can use the variable name later to refer to that value.

**Estimated time:** 15 minutes

**Learning objectives:**

- Create variables in Python.
- Assign values to variables.
- Reassign variables with new values.
- Follow Python naming conventions.

```python run title="Creating variables"
name = "Alice"
age = 30
print(name)
print(age)
```

Variables in Python are created by assignment. You do not need to declare the type.

**Common mistakes:**

- Using spaces in variable names (use underscores instead).
- Starting a variable name with a number.
- Using Python keywords like `if` or `while` as variable names.

**Practice exercise:** Create two variables, `first_name` and `city`, assign them values, and print both.

**Lesson summary:** Variables let you store and reuse values in your programs.

<!-- progress:lesson-complete id="variables" -->

<!-- /lesson -->

#### Lesson: Data Types

Every value in Python has a type. Common types include integers, floats, strings, booleans, and None.

**Estimated time:** 20 minutes

**Learning objectives:**

- Identify common Python data types.
- Use the `type()` function to check a value's type.
- Understand the difference between int, float, str, bool, and None.

```python run title="Checking data types"
print(type(42))
print(type(3.14))
print(type("Hello"))
print(type(True))
print(type(None))
```

**Common mistakes:**

- Confusing integers with floats.
- Treating numbers stored as strings as actual numbers.

**Practice exercise:** Create variables of each main type and print their types using `type()`.

**Lesson summary:** Python has several built-in data types, and `type()` helps you inspect them.

<!-- progress:lesson-complete id="data-types" -->

<!-- /lesson -->

#### Lesson: Numbers and Math

Python supports integers and floating-point numbers. You can perform addition, subtraction, multiplication, division, and more.

**Estimated time:** 20 minutes

**Learning objectives:**

- Use arithmetic operators in Python.
- Understand integer division vs float division.
- Use the modulo operator.
- Work with exponents.

```python run title="Basic math in Python"
a = 10
b = 3
print(a + b)
print(a - b)
print(a * b)
print(a / b)
print(a // b)
print(a % b)
print(a ** b)
```

**Common mistakes:**

- Using `/` when you want integer division (`//`).
- Forgetting that division by zero raises an error.

**Practice exercise:** Calculate the area of a rectangle with width 7 and height 4, then print the result.

**Lesson summary:** Python provides all the standard arithmetic operators you need for basic math.

<!-- progress:lesson-complete id="numbers-and-math" -->

<!-- /lesson -->

#### Lesson: Strings

Strings are sequences of text. Python makes it easy to create, combine, and manipulate strings.

**Estimated time:** 20 minutes

**Learning objectives:**

- Create strings with single or double quotes.
- Concatenate strings.
- Use f-strings for formatting.
- Access individual characters.

```python run title="Working with strings"
first = "Python"
second = "Course"
message = first + " " + second
print(message)
print(f"Welcome to {message}!")
print(message[0])
```

**Common mistakes:**

- Forgetting quotes around string values.
- Trying to concatenate a string with a number directly.

**Practice exercise:** Use an f-string to print a sentence that includes your name and age.

**Lesson summary:** Strings are versatile and f-strings make it easy to embed variables in text.

<!-- progress:lesson-complete id="strings" -->

<!-- /lesson -->

#### Lesson: User Input

Programs often need input from the person running them. The `input()` function reads text from the user.

**Estimated time:** 15 minutes

**Learning objectives:**

- Use `input()` to get user text.
- Convert input to other types when needed.
- Combine input with output.

```python run title="Getting user input"
# name = input("What is your name? ")
# print("Hello, " + name + "!")
print("input() would pause and wait for you to type.")
```

In this browser environment, `input()` is simulated. The example shows how you would use it in a local Python program.

**Common mistakes:**

- Forgetting that `input()` always returns a string.
- Not converting numeric input with `int()` or `float()`.

**Practice exercise:** Write a program that asks for the user's favorite color and prints a response using that color.

**Lesson summary:** The `input()` function makes your programs interactive by reading user text.

<!-- progress:lesson-complete id="user-input" -->

<!-- /lesson -->

## Module Summary

In this module, you learned:

- How to create and use variables.
- Common data types and how to check them.
- Basic math operations with numbers.
- String creation and formatting.
- How to get input from users.

Next, you will learn Control Flow to make programs that make decisions and repeat actions.

---

<!-- quiz module="python-basics" title="Python Basics Quiz" passingScore=70 -->

```json
{
  "moduleId": "python-basics",
  "title": "Python Basics Quiz",
  "questions": [
    {
      "id": "basics-q1",
      "type": "single-choice",
      "question": "Which of the following is a valid variable name in Python?",
      "options": [
        "my_variable",
        "2nd_variable",
        "total-value",
        "class"
      ],
      "correctAnswer": 0,
      "explanation": "my_variable follows Python naming rules. The others start with a number, contain a hyphen, or use a reserved keyword."
    },
    {
      "id": "basics-q2",
      "type": "true-false",
      "question": "The type() function returns the data type of a value.",
      "correctAnswer": true,
      "explanation": "type() shows you what kind of value a variable holds."
    },
    {
      "id": "basics-q3",
      "type": "multiple-choice",
      "question": "Which operations are valid with two integers in Python?",
      "options": [
        "Addition (+)",
        "Floor division (//)",
        "String concatenation without conversion",
        "Exponentiation (**)"
      ],
      "correctAnswers": [0, 1, 3],
      "explanation": "Integers support addition, floor division, and exponentiation. String concatenation requires both values to be strings."
    },
    {
      "id": "basics-q4",
      "type": "true-false",
      "question": "input() always returns a string.",
      "correctAnswer": true,
      "explanation": "Even if the user types a number, input() gives you a string. Use int() or float() to convert it."
    },
    {
      "id": "basics-q5",
      "type": "single-choice",
      "question": "What is the output of type(3.14)?",
      "options": [
        "<class 'int'>",
        "<class 'float'>",
        "<class 'str'>",
        "<class 'bool'>"
      ],
      "correctAnswer": 1,
      "explanation": "3.14 is a floating-point number, so its type is float."
    }
  ]
}
```

<!-- /quiz -->

<!-- /module -->

---

<!-- module id="control-flow" slug="control-flow" title="Control Flow" order=3 -->

## Module: Control Flow

This module teaches you how to make decisions in your code and repeat actions using loops.

### Learning Objectives

By the end of this module, you will be able to:

- Use Boolean values and comparison operators.
- Write if, elif, and else statements.
- Use while loops.
- Use for loops.
- Control loop execution with break and continue.

### Lessons

#### Lesson: Boolean Logic

Booleans represent truth values: `True` or `False`. Comparison operators produce Boolean results.

**Estimated time:** 15 minutes

**Learning objectives:**

- Create Boolean values.
- Use comparison operators such as `==`, `!=`, `>`, `<`, `>=`, `<=`.
- Combine conditions with `and`, `or`, and `not`.

```python run title="Boolean values and comparisons"
age = 18
print(age == 18)
print(age > 21)
print(age >= 18 and age < 65)
print(not (age > 100))
```

**Common mistakes:**

- Using `=` instead of `==` for comparison.
- Confusing `and` with `or` in compound conditions.

**Practice exercise:** Write a comparison that checks if a number is between 1 and 100, then print the result.

**Lesson summary:** Booleans and comparisons let your program make decisions based on data.

<!-- progress:lesson-complete id="boolean-logic" -->

<!-- /lesson -->

#### Lesson: If Statements

The `if` statement runs a block of code only when a condition is true.

**Estimated time:** 20 minutes

**Learning objectives:**

- Write a basic `if` statement.
- Use indentation to define the block.
- Understand truthy and falsy values.

```python run title="Simple if statement"
temperature = 30
if temperature > 25:
    print("It is warm outside.")
```

Only the indented line runs when the condition is true.

**Common mistakes:**

- Forgetting the colon at the end of the `if` line.
- Forgetting to indent the code inside the block.

**Practice exercise:** Write an `if` statement that checks if a score is greater than 50 and prints "Passing".

**Lesson summary:** `if` statements let your program choose whether to run code based on a condition.

<!-- progress:lesson-complete id="if-statements" -->

<!-- /lesson -->

#### Lesson: Else and Elif

`else` runs when the `if` condition is false. `elif` checks additional conditions in order.

**Estimated time:** 20 minutes

**Learning objectives:**

- Use `else` to handle the fallback case.
- Chain multiple conditions with `elif`.
- Understand that only the first matching branch runs.

```python run title="If elif else"
score = 85
if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
else:
    print("Grade: D or below")
```

**Common mistakes:**

- Placing `else` before `elif`.
- Forgetting that `elif` branches are checked in order and stop at the first match.

**Practice exercise:** Write an `if-elif-else` block that prints different messages based on the time of day (morning, afternoon, evening).

**Lesson summary:** `elif` and `else` help you handle multiple possible cases in your programs.

<!-- progress:lesson-complete id="else-and-elif" -->

<!-- /lesson -->

#### Lesson: While Loops

A `while` loop repeats code as long as a condition remains true.

**Estimated time:** 20 minutes

**Learning objectives:**

- Write a `while` loop.
- Update a counter so the loop can end.
- Understand infinite loops and how to avoid them.

```python run title="Counting with while"
count = 1
while count <= 5:
    print(count)
    count = count + 1
```

**Common mistakes:**

- Forgetting to update the loop variable, creating an infinite loop.
- Using a condition that is always true.

**Practice exercise:** Write a `while` loop that counts down from 5 to 1.

**Lesson summary:** `while` loops repeat actions until a condition becomes false.

<!-- progress:lesson-complete id="while-loops" -->

<!-- /lesson -->

#### Lesson: For Loops

A `for` loop repeats code once for each item in a sequence, such as a range or a string.

**Estimated time:** 20 minutes

**Learning objectives:**

- Write a `for` loop with `range()`.
- Iterate over characters in a string.
- Use `break` and `continue` inside loops.

```python run title="Looping with for"
for i in range(1, 6):
    print(i)

print("---")

for letter in "Python":
    print(letter)
```

**Common mistakes:**

- Forgetting that `range(1, 6)` stops before 6.
- Modifying the loop variable inside the loop body.

**Practice exercise:** Write a `for` loop that prints each letter of the word "Loop" on its own line.

**Lesson summary:** `for` loops are ideal for repeating actions over sequences and ranges.

<!-- progress:lesson-complete id="for-loops" -->

<!-- /lesson -->

## Module Summary

In this module, you learned:

- How to use Boolean values and comparison operators.
- How to write `if`, `elif`, and `else` statements.
- How to repeat code with `while` and `for` loops.
- How to control loops with `break` and `continue`.

Next, you will learn Functions to organize your code into reusable pieces.

---

<!-- quiz module="control-flow" title="Control Flow Quiz" passingScore=70 -->

```json
{
  "moduleId": "control-flow",
  "title": "Control Flow Quiz",
  "questions": [
    {
      "id": "control-q1",
      "type": "single-choice",
      "question": "Which operator checks if two values are equal?",
      "options": [
        "=",
        "==",
        "!=",
        "==="
      ],
      "correctAnswer": 1,
      "explanation": "The == operator checks equality. A single = is assignment."
    },
    {
      "id": "control-q2",
      "type": "true-false",
      "question": "Only the first matching elif branch executes.",
      "correctAnswer": true,
      "explanation": "Python evaluates elif branches in order and stops at the first match."
    },
    {
      "id": "control-q3",
      "type": "multiple-choice",
      "question": "Which statements are true about while loops?",
      "options": [
        "They repeat while a condition is true.",
        "They always run at least once.",
        "They can run forever if the condition never becomes false.",
        "They require a counter variable."
      ],
      "correctAnswers": [0, 2],
      "explanation": "While loops repeat while true and can be infinite. They do not always run once, and a counter is optional."
    },
    {
      "id": "control-q4",
      "type": "true-false",
      "question": "range(1, 6) includes the number 6.",
      "correctAnswer": false,
      "explanation": "range(1, 6) produces numbers from 1 up to, but not including, 6."
    },
    {
      "id": "control-q5",
      "type": "single-choice",
      "question": "What does break do inside a loop?",
      "options": [
        "Skips to the next iteration",
        "Exits the loop immediately",
        "Restarts the loop",
        "Pauses the loop"
      ],
      "correctAnswer": 1,
      "explanation": "break exits the loop immediately. continue skips to the next iteration."
    }
  ]
}
```

<!-- /quiz -->

<!-- /module -->

---

<!-- module id="functions" slug="functions" title="Functions" order=4 -->

## Module: Functions

This module teaches you how to define and use functions to organize and reuse code.

### Learning Objectives

By the end of this module, you will be able to:

- Define functions with `def`.
- Pass parameters and arguments.
- Return values from functions.
- Understand local and global scope.
- Use common built-in functions.

### Lessons

#### Lesson: Defining Functions

A function is a named block of code that you can call whenever you need it.

**Estimated time:** 20 minutes

**Learning objectives:**

- Define a function with `def`.
- Call a function by name.
- Understand why functions reduce repetition.

```python run title="Defining and calling a function"
def greet():
    print("Hello!")
    print("Welcome to Python.")

greet()
greet()
```

The function runs twice because we call it twice.

**Common mistakes:**

- Forgetting the parentheses when calling a function.
- Defining a function but never calling it.

**Practice exercise:** Define a function that prints a welcome message and call it three times.

**Lesson summary:** Functions let you write code once and reuse it many times.

<!-- progress:lesson-complete id="defining-functions" -->

<!-- /lesson -->

#### Lesson: Parameters and Arguments

Parameters let you pass information into a function when you call it.

**Estimated time:** 20 minutes

**Learning objectives:**

- Define functions with parameters.
- Pass arguments when calling functions.
- Use multiple parameters.

```python run title="Function with parameters"
def greet_person(name):
    print("Hello, " + name + "!")

greet_person("Alice")
greet_person("Bob")
```

Each call passes a different name into the `name` parameter.

**Common mistakes:**

- Calling a function without required arguments.
- Confusing parameter names with variable names outside the function.

**Practice exercise:** Write a function that takes a number and prints its double.

**Lesson summary:** Parameters make functions flexible by letting you pass different values each time.

<!-- progress:lesson-complete id="parameters-and-arguments" -->

<!-- /lesson -->

#### Lesson: Return Values

Functions can send a result back to the caller using `return`.

**Estimated time:** 20 minutes

**Learning objectives:**

- Use `return` to send a value back from a function.
- Store the result of a function call in a variable.
- Understand the difference between `print` and `return`.

```python run title="Returning a value"
def add(a, b):
    return a + b

result = add(5, 3)
print(result)
```

`print` shows output; `return` sends a value back for further use.

**Common mistakes:**

- Forgetting `return`, which makes the function return `None`.
- Using `print` inside a function when you need `return`.

**Practice exercise:** Write a function that multiplies two numbers and returns the product.

**Lesson summary:** `return` lets functions produce values that other parts of your program can use.

<!-- progress:lesson-complete id="return-values" -->

<!-- /lesson -->

#### Lesson: Scope

Scope determines where a variable can be accessed in your program.

**Estimated time:** 15 minutes

**Learning objectives:**

- Distinguish between local and global scope.
- Understand that variables inside a function are local.
- Know that variables defined outside functions are global.

```python run title="Local and global scope"
message = "I am global"

def show_scope():
    local_message = "I am local"
    print(message)
    print(local_message)

show_scope()
```

`local_message` only exists inside `show_scope`.

**Common mistakes:**

- Trying to use a local variable outside its function.
- Assuming a variable changed inside a function affects the global version.

**Practice exercise:** Define a global variable and a local variable with the same name, then print both inside a function.

**Lesson summary:** Scope controls where variables are visible and can be used.

<!-- progress:lesson-complete id="scope" -->

<!-- /lesson -->

#### Lesson: Built-in Functions

Python provides many built-in functions you can use without importing anything.

**Estimated time:** 20 minutes

**Learning objectives:**

- Use `len()`, `str()`, `int()`, `float()`, `max()`, `min()`, `sum()`.
- Understand what each function does.
- Combine built-in functions in expressions.

```python run title="Using built-in functions"
words = ["Python", "is", "fun"]
print(len(words))
print(max(10, 25, 7))
print(min(10, 25, 7))
print(sum([1, 2, 3, 4]))
```

**Common mistakes:**

- Passing the wrong type to a built-in function.
- Forgetting that `len()` works on sequences, not numbers.

**Practice exercise:** Use `len()` to print the length of your name as a string.

**Lesson summary:** Built-in functions provide ready-to-use tools for common tasks.

<!-- progress:lesson-complete id="built-in-functions" -->

<!-- /lesson -->

## Module Summary

In this module, you learned:

- How to define and call functions.
- How to pass parameters and arguments.
- How to return values from functions.
- The difference between local and global scope.
- How to use common built-in functions.

Next, you will learn Data Structures to store collections of data.

---

<!-- quiz module="functions" title="Functions Quiz" passingScore=70 -->

```json
{
  "moduleId": "functions",
  "title": "Functions Quiz",
  "questions": [
    {
      "id": "func-q1",
      "type": "single-choice",
      "question": "Which keyword defines a function in Python?",
      "options": [
        "function",
        "def",
        "func",
        "define"
      ],
      "correctAnswer": 1,
      "explanation": "The def keyword is used to define functions in Python."
    },
    {
      "id": "func-q2",
      "type": "true-false",
      "question": "A function can return only one value.",
      "correctAnswer": false,
      "explanation": "A function can return a tuple, which effectively returns multiple values."
    },
    {
      "id": "func-q3",
      "type": "multiple-choice",
      "question": "Which of the following are built-in Python functions?",
      "options": [
        "print()",
        "len()",
        "main()",
        "max()"
      ],
      "correctAnswers": [0, 1, 3],
      "explanation": "print(), len(), and max() are built-in. main() is not a built-in Python function."
    },
    {
      "id": "func-q4",
      "type": "true-false",
      "question": "Variables created inside a function are local to that function.",
      "correctAnswer": true,
      "explanation": "Local variables only exist inside the function where they are defined."
    },
    {
      "id": "func-q5",
      "type": "single-choice",
      "question": "What does a function return if there is no return statement?",
      "options": [
        "0",
        "None",
        "False",
        "An empty string"
      ],
      "correctAnswer": 1,
      "explanation": "Functions without a return statement implicitly return None."
    }
  ]
}
```

<!-- /quiz -->

<!-- /module -->

---

<!-- module id="data-structures" slug="data-structures" title="Data Structures" order=5 -->

## Module: Data Structures

This module teaches you how to store and organize collections of data using lists, tuples, dictionaries, and sets.

### Learning Objectives

By the end of this module, you will be able to:

- Create and modify lists.
- Use tuples for fixed data.
- Store key-value pairs in dictionaries.
- Use sets for unique items.
- Choose the right data structure for a task.

### Lessons

#### Lesson: Lists

Lists are ordered, changeable collections of items.

**Estimated time:** 20 minutes

**Learning objectives:**

- Create a list with square brackets.
- Access items by index.
- Add, remove, and change items.
- Use common list methods.

```python run title="Working with lists"
fruits = ["apple", "banana", "cherry"]
print(fruits[0])
fruits.append("orange")
print(fruits)
fruits[1] = "blueberry"
print(fruits)
```

**Common mistakes:**

- Using an index that is out of range.
- Forgetting that list indexes start at 0.

**Practice exercise:** Create a list of three colors, add a fourth, and print the list.

**Lesson summary:** Lists are flexible containers for ordered collections of items.

<!-- progress:lesson-complete id="lists" -->

<!-- /lesson -->

#### Lesson: Tuples

Tuples are ordered collections that cannot be changed after creation.

**Estimated time:** 15 minutes

**Learning objectives:**

- Create a tuple with parentheses.
- Access items by index.
- Understand when to use a tuple instead of a list.

```python run title="Working with tuples"
point = (10, 20)
print(point[0])
print(point[1])
```

**Common mistakes:**

- Trying to change a tuple item after creation.
- Confusing tuple syntax with list syntax.

**Practice exercise:** Create a tuple with your name and birth year, then print both items.

**Lesson summary:** Tuples are ideal for data that should not change.

<!-- progress:lesson-complete id="tuples" -->

<!-- /lesson -->

#### Lesson: Dictionaries

Dictionaries store data as key-value pairs.

**Estimated time:** 20 minutes

**Learning objectives:**

- Create a dictionary with curly braces.
- Access values by key.
- Add, update, and remove entries.
- Check if a key exists.

```python run title="Working with dictionaries"
person = {"name": "Alice", "age": 30}
print(person["name"])
person["city"] = "New York"
print(person)
```

**Common mistakes:**

- Accessing a key that does not exist.
- Using a mutable type as a dictionary key.

**Practice exercise:** Create a dictionary for a book with title, author, and year, then print the title.

**Lesson summary:** Dictionaries let you look up values quickly using meaningful keys.

<!-- progress:lesson-complete id="dictionaries" -->

<!-- /lesson -->

#### Lesson: Sets

Sets store unique items and are useful for membership tests.

**Estimated time:** 15 minutes

**Learning objectives:**

- Create a set with curly braces or `set()`.
- Add and remove items.
- Use sets to remove duplicates.
- Check membership with `in`.

```python run title="Working with sets"
numbers = {1, 2, 3, 2}
print(numbers)
numbers.add(4)
print(numbers)
print(3 in numbers)
```

**Common mistakes:**

- Assuming sets preserve order.
- Trying to access items by index.

**Practice exercise:** Create a set of three city names, add a duplicate, and show that duplicates are removed.

**Lesson summary:** Sets store unique items and make membership tests fast.

<!-- progress:lesson-complete id="sets" -->

<!-- /lesson -->

#### Lesson: Choosing the Right Data Structure

Different data structures fit different tasks.

**Estimated time:** 15 minutes

**Learning objectives:**

- Compare lists, tuples, dictionaries, and sets.
- Choose the best structure for a given scenario.
- Explain the trade-offs of each.

| Structure | Mutable | Ordered | Best For |
|-----------|---------|---------|----------|
| List | Yes | Yes | Ordered, changeable collections |
| Tuple | No | Yes | Fixed records |
| Dictionary | Yes | Yes | Key-value lookups |
| Set | Yes | No | Unique items, membership tests |

```python run title="Quick comparison"
shopping_list = ["milk", "eggs", "bread"]
coordinates = (40.7128, -74.0060)
user = {"name": "Sam", "role": "student"}
tags = {"python", "coding", "beginner"}
```

**Common mistakes:**

- Using a list when a set would be better for uniqueness.
- Using a dictionary when order matters more than key lookup.

**Practice exercise:** Decide which data structure to use for storing a list of unique email addresses and explain why.

**Lesson summary:** Choosing the right data structure makes your code clearer and more efficient.

<!-- progress:lesson-complete id="choosing-the-right-data-structure" -->

<!-- /lesson -->

## Module Summary

In this module, you learned:

- How to create and modify lists.
- How to use tuples for fixed data.
- How to store key-value pairs in dictionaries.
- How to use sets for unique items.
- How to choose the right data structure for a task.

Next, you will build your Final Project to apply everything you have learned.

---

<!-- quiz module="data-structures" title="Data Structures Quiz" passingScore=70 -->

```json
{
  "moduleId": "data-structures",
  "title": "Data Structures Quiz",
  "questions": [
    {
      "id": "ds-q1",
      "type": "single-choice",
      "question": "Which data structure stores key-value pairs?",
      "options": [
        "List",
        "Tuple",
        "Dictionary",
        "Set"
      ],
      "correctAnswer": 2,
      "explanation": "Dictionaries store data as key-value pairs."
    },
    {
      "id": "ds-q2",
      "type": "true-false",
      "question": "Lists are mutable, meaning you can change their contents.",
      "correctAnswer": true,
      "explanation": "You can add, remove, and change items in a list."
    },
    {
      "id": "ds-q3",
      "type": "multiple-choice",
      "question": "Which characteristics describe sets?",
      "options": [
        "Items are unique",
        "Items are ordered",
        "Support membership tests with in",
        "Allow duplicate values"
      ],
      "correctAnswers": [0, 2],
      "explanation": "Sets store unique items and support fast membership tests. They are unordered and do not allow duplicates."
    },
    {
      "id": "ds-q4",
      "type": "true-false",
      "question": "Tuple items can be changed after the tuple is created.",
      "correctAnswer": false,
      "explanation": "Tuples are immutable and cannot be modified after creation."
    },
    {
      "id": "ds-q5",
      "type": "single-choice",
      "question": "What is the index of the first item in a Python list?",
      "options": [
        "0",
        "1",
        "-1",
        "2"
      ],
      "correctAnswer": 0,
      "explanation": "Python lists are zero-indexed, so the first item is at index 0."
    }
  ]
}
```

<!-- /quiz -->

<!-- /module -->

---

<!-- module id="final-project" slug="final-project" title="Final Project" order=6 -->

## Module: Final Project

This module guides you through planning, building, debugging, and presenting a small Python project.

### Learning Objectives

By the end of this module, you will be able to:

- Plan a simple Python project before coding.
- Build a console application.
- Debug common issues.
- Present your work and explain your code.
- Identify next steps for continued learning.

### Lessons

#### Lesson: Planning a Python Project

Good planning saves time and keeps your project focused.

**Estimated time:** 20 minutes

**Learning objectives:**

- Define a clear project goal.
- Break the project into small steps.
- Choose the data structures you will need.

Example project: a contact manager that stores names and phone numbers.

```python run title="Project plan sketch"
contacts = {}
def add_contact(name, phone):
    contacts[name] = phone
    print("Added", name)

add_contact("Alice", "555-1234")
print(contacts)
```

**Common mistakes:**

- Trying to build everything at once.
- Skipping the planning step.

**Practice exercise:** Write down the goal and three steps for a project of your choice.

**Lesson summary:** A simple plan helps you build your project step by step.

<!-- progress:lesson-complete id="planning-a-python-project" -->

<!-- /lesson -->

#### Lesson: Building a Simple Console Application

Now you will build a small interactive program that runs in the console.

**Estimated time:** 30 minutes

**Learning objectives:**

- Combine variables, conditionals, loops, and functions.
- Use `input()` to make the program interactive.
- Store data in a dictionary or list.

```python run title="Simple contact manager"
contacts = {}

def show_menu():
    print("\n--- Contact Manager ---")
    print("1. Add contact")
    print("2. List contacts")
    print("3. Exit")

show_menu()
choice = "1"
if choice == "1":
    contacts["Sam"] = "555-0000"
    print("Contact added.")
elif choice == "2":
    for name, phone in contacts.items():
        print(name, ":", phone)
```

In a local environment, you would replace `choice = "1"` with `choice = input("Choose an option: ")`.

**Common mistakes:**

- Forgetting to convert input when numbers are needed.
- Not handling invalid menu choices.

**Practice exercise:** Add a "remove contact" option to the menu above.

**Lesson summary:** You have built a small interactive console application.

<!-- progress:lesson-complete id="building-a-simple-console-application" -->

<!-- /lesson -->

#### Lesson: Debugging and Improving the Project

No program works perfectly the first time. Debugging is a normal part of development.

**Estimated time:** 20 minutes

**Learning objectives:**

- Read Python error messages.
- Use `print()` to check variable values.
- Fix common bugs in your project.

```python run title="Debugging example"
def get_contact(name):
    if name in contacts:
        return contacts[name]
    return "Not found"

print(get_contact("Sam"))
print(get_contact("Unknown"))
```

**Common mistakes:**

- Ignoring error messages.
- Changing multiple things at once instead of testing one fix at a time.

**Practice exercise:** Intentionally introduce a bug into your contact manager, then find and fix it.

**Lesson summary:** Debugging helps you understand your code and make it more reliable.

<!-- progress:lesson-complete id="debugging-and-improving-the-project" -->

<!-- /lesson -->

#### Lesson: Presenting Your Project

Explaining your code helps others understand it and helps you solidify your knowledge.

**Estimated time:** 15 minutes

**Learning objectives:**

- Describe what your program does.
- Explain the key parts of your code.
- Share your project with others.

**Practice exercise:** Write a short description of your contact manager: what it does, how to use it, and what you learned building it.

**Lesson summary:** Presentation skills make you a better communicator and developer.

<!-- progress:lesson-complete id="presenting-your-project" -->

<!-- /lesson -->

#### Lesson: Next Steps

Congratulations on completing the course! Here are ideas for continuing your Python journey.

**Estimated time:** 10 minutes

**Learning objectives:**

- Identify areas for further study.
- Choose a next project.
- Find resources for continued learning.

Suggested next steps:

- Build small projects like a calculator, to-do list, or number guessing game.
- Learn testing with `unittest` or `pytest`.
- Learn to work with APIs and web data.
- Explore web development with Flask or Django.
- Explore data science with pandas and matplotlib.
- Learn automation with Python scripts.

```python run title="Celebration"
print("Congratulations on completing the Python course!")
print("Keep coding and keep learning.")
```

**Lesson summary:** You have a solid foundation in Python. The best way to keep improving is to build more projects.

<!-- progress:lesson-complete id="next-steps" -->

<!-- /lesson -->

## Module Summary

In this module, you learned:

- How to plan a Python project.
- How to build a simple console application.
- How to debug and improve your code.
- How to present your project.
- What to study next.

You have completed all six modules. Well done!

---

<!-- quiz module="final-project" title="Final Project Quiz" passingScore=70 -->

```json
{
  "moduleId": "final-project",
  "title": "Final Project Quiz",
  "questions": [
    {
      "id": "final-q1",
      "type": "single-choice",
      "question": "Why is planning important before coding a project?",
      "options": [
        "It makes the code run faster",
        "It breaks the project into manageable steps",
        "It replaces the need to write code",
        "It is required by Python"
      ],
      "correctAnswer": 1,
      "explanation": "Planning helps you break the project into small, manageable steps."
    },
    {
      "id": "final-q2",
      "type": "true-false",
      "question": "Debugging is a normal part of software development.",
      "correctAnswer": true,
      "explanation": "All programmers debug their code; it is a standard part of development."
    },
    {
      "id": "final-q3",
      "type": "multiple-choice",
      "question": "Which are good next steps after finishing this course?",
      "options": [
        "Build small projects",
        "Never code again",
        "Learn testing with pytest",
        "Explore web development with Flask or Django"
      ],
      "correctAnswers": [0, 2, 3],
      "explanation": "Building projects, learning testing, and exploring web frameworks are all great ways to continue."
    },
    {
      "id": "final-q4",
      "type": "true-false",
      "question": "print() is a useful tool for debugging variable values.",
      "correctAnswer": true,
      "explanation": "Printing variable values helps you see what your program is doing at each step."
    },
    {
      "id": "final-q5",
      "type": "single-choice",
      "question": "What is the best way to improve as a programmer after a beginner course?",
      "options": [
        "Read about programming without coding",
        "Build more projects",
        "Memorize every built-in function",
        "Wait for a more advanced course"
      ],
      "correctAnswer": 1,
      "explanation": "Building more projects is one of the most effective ways to improve your skills."
    }
  ]
}
```

<!-- /quiz -->

<!-- /module -->

---

## Course Completion

Congratulations! You have completed the Python Programming Course.

You have learned the fundamentals of Python, including:

- Running Python programs and reading error messages
- Variables, data types, and basic math
- Strings, user input, and formatting
- Conditionals and loops
- Functions, parameters, return values, and scope
- Lists, tuples, dictionaries, and sets
- Planning, building, debugging, and presenting a project

### What You Can Do Next

- **Build small projects:** A calculator, a to-do list, or a number guessing game.
- **Learn testing:** Explore `unittest` or `pytest` to verify your code works correctly.
- **Learn APIs:** Fetch data from web services and use it in your programs.
- **Learn web development:** Try Flask or Django to build web applications with Python.
- **Learn data science:** Explore pandas, matplotlib, and Jupyter notebooks.
- **Learn automation:** Write scripts to automate repetitive tasks on your computer.

Keep practicing, keep building, and enjoy your journey with Python.