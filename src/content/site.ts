/** Marketing and reference copy for the non-course pages (home, about, FAQ, roadmap, cheatsheet). */

export interface Feature {
  icon: string;
  title: string;
  text: string;
}

export const FEATURES: readonly Feature[] = [
  {
    icon: 'M8 5v14l11-7z',
    title: 'Run code instantly',
    text: 'Every example runs in a real Python interpreter inside your browser. Edit it, break it, run it again.',
  },
  {
    icon: 'M4 12l5 5L20 6',
    title: 'Quizzes that unlock',
    text: 'Each module ends with a quiz. Pass it to open the next module and lock in what you learned.',
  },
  {
    icon: 'M3 17l6-6 4 4 8-8M15 7h6v6',
    title: 'Progress that sticks',
    text: 'Pick up exactly where you left off. Your progress lives on your device and can be exported any time.',
  },
  {
    icon: 'M7 3h8l4 4v14H7zM15 3v4h4',
    title: 'Take it offline',
    text: 'Download a whole course as a PDF to read on a train, a plane or anywhere without signal.',
  },
  {
    icon: 'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z',
    title: 'Light and dark',
    text: 'A calm interface in both themes, fully keyboard friendly, with motion that respects your settings.',
  },
  {
    icon: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
    title: 'Instant search',
    text: 'Press / anywhere to jump straight to the lesson that explains what you are stuck on.',
  },
];

export interface Step {
  title: string;
  text: string;
}

export const STEPS: readonly Step[] = [
  { title: 'Pick a course', text: 'Start with the basics or jump to the intermediate path. No account, no setup.' },
  { title: 'Read, run, repeat', text: 'Short lessons with live code cells and exercises that check your answer.' },
  { title: 'Pass the quiz', text: 'Prove it at the end of every module, then unlock the next one.' },
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQ: readonly Faq[] = [
  {
    q: 'Do I need to install Python?',
    a: 'No. Code runs in your browser using Pyodide, a version of Python compiled to WebAssembly. The first run downloads it once, then it is cached.',
  },
  {
    q: 'Is it really free? Do I need an account?',
    a: 'There are no accounts and nothing to pay for. There is no server either, so we never see your code or your progress.',
  },
  {
    q: 'Where is my progress stored?',
    a: 'In your browser’s local storage on this device. Use Progress → Export to back it up or move it to another browser.',
  },
  {
    q: 'Can I use it without an internet connection?',
    a: 'After your first visit, lessons and the Python runtime are cached, so most things keep working offline. You can also download any course as a PDF.',
  },
  {
    q: 'Which Python features are supported?',
    a: 'The standard library and most pure-Python code work. Things that need real sockets, threads or native extensions do not run in a browser.',
  },
  {
    q: 'I am completely new to programming. Where do I start?',
    a: 'Start with Python Basics. It assumes no experience and builds up from printing text to writing your own functions.',
  },
];

export interface UpcomingTopic {
  title: string;
  text: string;
}

export const UPCOMING: readonly UpcomingTopic[] = [
  { title: 'Working with files and data', text: 'Read and write files, CSV and JSON like a pro.' },
  { title: 'Testing and debugging', text: 'Catch bugs early with asserts, tests and a debugger mindset.' },
  { title: 'Async and concurrency', text: 'Do many things at once with asyncio.' },
  { title: 'Data analysis', text: 'Explore data with the tools professionals reach for.' },
];

export interface CheatGroup {
  title: string;
  items: readonly { code: string; note: string }[];
}

export const CHEATSHEET: readonly CheatGroup[] = [
  {
    title: 'Basics',
    items: [
      { code: 'print("hi", x)', note: 'Show values' },
      { code: 'name = input("Name? ")', note: 'Read a line of text' },
      { code: 'int("5"), float("2.5"), str(7)', note: 'Convert types' },
      { code: 'x, y = 1, 2', note: 'Assign several at once' },
      { code: 'f"{name} is {age}"', note: 'Format a string' },
    ],
  },
  {
    title: 'Control flow',
    items: [
      { code: 'if a > b: ... elif a == b: ... else: ...', note: 'Branch' },
      { code: 'for i in range(5): ...', note: 'Loop 0 to 4' },
      { code: 'while cond: ...', note: 'Loop while true' },
      { code: 'break / continue', note: 'Leave or skip an iteration' },
      { code: 'x if cond else y', note: 'Inline choice' },
    ],
  },
  {
    title: 'Lists and strings',
    items: [
      { code: 'nums = [1, 2, 3]; nums.append(4)', note: 'Make and grow a list' },
      { code: 'nums[0], nums[-1], nums[1:3]', note: 'Index and slice' },
      { code: '[n * 2 for n in nums if n > 1]', note: 'Comprehension' },
      { code: '"a,b".split(","), " ".join(words)', note: 'Split and join' },
      { code: 's.strip().lower().replace("a", "b")', note: 'Clean up text' },
    ],
  },
  {
    title: 'Dicts, tuples and sets',
    items: [
      { code: 'd = {"a": 1}; d["b"] = 2', note: 'Make and add' },
      { code: 'd.get("z", 0)', note: 'Safe lookup' },
      { code: 'for k, v in d.items(): ...', note: 'Loop over pairs' },
      { code: 'set([1, 1, 2]) → {1, 2}', note: 'Unique values' },
      { code: 'a, b = (1, 2)', note: 'Unpack a tuple' },
    ],
  },
  {
    title: 'Functions',
    items: [
      { code: 'def add(a, b=0): return a + b', note: 'Define with a default' },
      { code: 'def f(*args, **kwargs): ...', note: 'Accept anything' },
      { code: 'lambda x: x * 2', note: 'Tiny anonymous function' },
      { code: 'sorted(items, key=len)', note: 'Sort by a rule' },
      { code: 'len, min, max, sum, any, all', note: 'Handy built-ins' },
    ],
  },
  {
    title: 'Classes and errors',
    items: [
      { code: 'class Dog(Animal): ...', note: 'Inherit' },
      { code: 'def __init__(self, name): ...', note: 'Constructor' },
      { code: 'def __repr__(self): ...', note: 'Debug-friendly text' },
      { code: 'try: ... except ValueError as e: ...', note: 'Handle an error' },
      { code: 'raise ValueError("bad input")', note: 'Raise one yourself' },
    ],
  },
];
