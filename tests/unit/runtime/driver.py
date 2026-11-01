"""Test driver: runs the real harness (src/runtime/pc_harness.py) under CPython.

Reads a JSON list of operations on stdin and prints a JSON list of results.
Operations: {"op": "run"|"exercise"|"reset", ...}. Inputs for input() come from "inputs".
"""

import asyncio
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "src", "runtime"))

import pc_harness  # noqa: E402


async def main():
    ops = json.load(sys.stdin)
    results = []
    for op in ops:
        writes = []
        inputs = list(op.get("inputs", []))
        prompts = []

        async def fake_input(prompt):
            prompts.append(prompt)
            return inputs.pop(0) if inputs else None

        pc_harness.set_hooks(lambda kind, text: writes.append([kind, text]), fake_input)
        if op["op"] == "run":
            res = await pc_harness.run(op["code"], op.get("ns"), op.get("setup", ""))
        elif op["op"] == "exercise":
            res = await pc_harness.run_exercise(op["code"], op["tests"], op.get("setup", ""))
        else:
            pc_harness.reset_namespace(op.get("ns"))
            res = {}
        stdout = "".join(t for k, t in writes if k == "stdout")
        stderr = "".join(t for k, t in writes if k == "stderr")
        results.append({"res": res, "stdout": stdout, "stderr": stderr, "prompts": prompts})
    print(json.dumps(results))


asyncio.run(main())
