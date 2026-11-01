"""PyCourses execution harness.

Runs learner code with captured output, last-expression results, readable
tracebacks, an awaitable ``input()`` and hidden exercise tests.

This one file is loaded into Pyodide (see pyodide.worker.ts) *and* executed by
real CPython in the unit tests, so keep it free of Pyodide-only imports.
"""

import ast
import builtins
import inspect
import linecache
import sys
import traceback

USER_FILE = "main.py"
SETUP_FILE = "setup.py"
TESTS_FILE = "tests.py"

_namespaces = {}
_hooks = {"write": None, "input": None}


def set_hooks(write, input_):
    """``write(kind, text)`` receives output; ``input_(prompt)`` returns an awaitable str or None."""
    _hooks["write"] = write
    _hooks["input"] = input_


def _write(kind, text):
    write = _hooks["write"]
    if write is not None and text:
        write(kind, text)


class _Stream:
    def __init__(self, kind):
        self.kind = kind

    def write(self, text):
        text = str(text)
        _write(self.kind, text)
        return len(text)

    def flush(self):
        pass

    def isatty(self):
        return False


def _sync_input(prompt=""):
    raise RuntimeError(
        "input() only works at the top level of your code in the browser "
        "(not inside a function or class). Call input() there and pass the value in."
    )


async def _async_input(prompt=""):
    prompt = str(prompt)
    hook = _hooks["input"]
    if hook is None:
        raise EOFError("EOF when reading a line")
    answer = await hook(prompt)
    if answer is None:
        raise EOFError("EOF when reading a line")
    answer = str(answer)
    _write("stdout", prompt + answer + "\n")
    return answer


def new_namespace():
    return {
        "__name__": "__main__",
        "__builtins__": builtins,
        "input": _sync_input,
        "__pc_input__": _async_input,
    }


def get_namespace(ns_id):
    if ns_id is None:
        return new_namespace()
    if ns_id not in _namespaces:
        _namespaces[ns_id] = new_namespace()
    return _namespaces[ns_id]


def reset_namespace(ns_id=None):
    if ns_id is None:
        _namespaces.clear()
    else:
        _namespaces.pop(ns_id, None)


class _InputToAwait(ast.NodeTransformer):
    """Rewrites top-level ``input(...)`` calls to ``await __pc_input__(...)``.

    A worker cannot block synchronously on the page, so input() is made awaitable.
    Calls nested in functions, classes, lambdas or comprehensions keep the plain
    ``input`` which raises a helpful error.
    """

    def __init__(self):
        self.depth = 0

    def _nested(self, node):
        self.depth += 1
        self.generic_visit(node)
        self.depth -= 1
        return node

    visit_FunctionDef = _nested
    visit_AsyncFunctionDef = _nested
    visit_Lambda = _nested
    visit_ClassDef = _nested
    visit_ListComp = _nested
    visit_SetComp = _nested
    visit_DictComp = _nested
    visit_GeneratorExp = _nested

    def visit_Call(self, node):
        self.generic_visit(node)
        if self.depth == 0 and isinstance(node.func, ast.Name) and node.func.id == "input":
            node.func = ast.copy_location(ast.Name("__pc_input__", ast.Load()), node.func)
            return ast.copy_location(ast.Await(value=node), node)
        return node


_FLAGS = ast.PyCF_ALLOW_TOP_LEVEL_AWAIT


async def _exec(source, ns, filename):
    """Executes ``source`` in ``ns``; returns the value of a trailing expression (or None)."""
    linecache.cache[filename] = (len(source), None, source.splitlines(True), filename)
    tree = ast.parse(source, filename, "exec")
    tree = _InputToAwait().visit(tree)
    last = None
    if tree.body and isinstance(tree.body[-1], ast.Expr):
        last = ast.Expression(tree.body.pop().value)
    ast.fix_missing_locations(tree)

    code = compile(tree, filename, "exec", flags=_FLAGS)
    outcome = eval(code, ns)
    if code.co_flags & inspect.CO_COROUTINE:
        await outcome

    if last is None:
        return None
    ast.fix_missing_locations(last)
    code = compile(last, filename, "eval", flags=_FLAGS)
    value = eval(code, ns)
    if code.co_flags & inspect.CO_COROUTINE:
        value = await value
    return value


def _user_traceback(tb):
    """Drops harness frames so learners only see their own code."""
    while tb is not None and tb.tb_frame.f_code.co_filename not in (USER_FILE, SETUP_FILE):
        tb = tb.tb_next
    return tb


def _summary(exc):
    name = type(exc).__name__
    text = str(exc)
    return f"{name}: {text}" if text else name


def _report(exc):
    traceback.print_exception(type(exc), exc, _user_traceback(exc.__traceback__), file=sys.stderr)


class _Redirect:
    def __enter__(self):
        self.saved = (sys.stdout, sys.stderr)
        sys.stdout, sys.stderr = _Stream("stdout"), _Stream("stderr")

    def __exit__(self, *exc_info):
        sys.stdout, sys.stderr = self.saved
        return False


async def run(source, ns_id=None, setup=""):
    """Runs a cell. Returns ``{"ok", "result", "error"}``; output goes through the write hook."""
    out = {"ok": True, "result": None, "error": None}
    ns = get_namespace(ns_id)
    with _Redirect():
        try:
            if setup and not ns.get("__pc_setup_done__"):
                await _exec(setup, ns, SETUP_FILE)
                ns["__pc_setup_done__"] = True
            value = await _exec(source, ns, USER_FILE)
            if value is not None:
                out["result"] = repr(value)
        except SystemExit:
            pass
        except BaseException as exc:  # noqa: BLE001 - learner code may raise anything
            out["ok"] = False
            out["error"] = _summary(exc)
            _report(exc)
    return out


async def run_exercise(source, tests, setup=""):
    """Runs learner ``source`` then every top-level statement of ``tests`` independently.

    Returns ``{"passed", "failures": [{"message", "test"}], "error"}``.
    """
    ns = new_namespace()
    result = {"passed": False, "failures": [], "error": None}
    with _Redirect():
        try:
            if setup:
                await _exec(setup, ns, SETUP_FILE)
            await _exec(source, ns, USER_FILE)
        except SystemExit:
            pass
        except BaseException as exc:  # noqa: BLE001
            result["error"] = _summary(exc)
            result["failures"].append(
                {
                    "message": "Your code raised an error before the tests could run: " + _summary(exc),
                    "test": None,
                }
            )
            _report(exc)
            return result

        try:
            tree = ast.parse(tests, TESTS_FILE)
        except SyntaxError as exc:
            result["error"] = "tests: " + _summary(exc)
            result["failures"].append({"message": "The exercise tests are broken: " + _summary(exc), "test": None})
            return result

        for stmt in tree.body:
            snippet = ast.get_source_segment(tests, stmt) or ast.unparse(stmt)
            module = ast.fix_missing_locations(ast.Module(body=[stmt], type_ignores=[]))
            try:
                exec(compile(module, TESTS_FILE, "exec"), ns)
            except AssertionError as exc:
                message = str(exc) or "assertion failed: " + snippet
                result["failures"].append({"message": message, "test": snippet})
            except Exception as exc:  # noqa: BLE001
                result["failures"].append({"message": _summary(exc), "test": snippet})

    result["passed"] = not result["failures"]
    return result
