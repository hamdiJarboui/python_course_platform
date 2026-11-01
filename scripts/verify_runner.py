"""Runs one lesson's code in real CPython using the very same harness the browser uses.

stdin : JSON {"scope", "setup", "cells": [...], "exercises": [...]} (see scripts/content-verify.ts)
stdout: JSON list of problems [{"kind", "id", "message"}]; an empty list means the lesson is sound.
"""

import asyncio
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "src", "runtime"))

import pc_harness  # noqa: E402


def sample_answer(prompt):
    return "Ada" if "name" in prompt.lower() else "10"


async def answer(prompt):
    return sample_answer(prompt)


def last_line(text):
    lines = [ln for ln in text.strip().splitlines() if ln.strip()]
    return lines[-1] if lines else ""


async def main():
    job = json.load(sys.stdin)
    problems = []
    writes = []
    pc_harness.set_hooks(lambda kind, text: writes.append((kind, text)), answer)

    def captured(kind):
        return "".join(t for k, t in writes if k == kind)

    ns_id = "lesson" if job["scope"] == "lesson" else None
    for cell in job["cells"]:
        del writes[:]
        res = await pc_harness.run(cell["code"], ns_id, job["setup"])
        if not res["ok"]:
            problems.append(
                {
                    "kind": "cell",
                    "id": cell["id"],
                    "message": "code block raised " + str(res["error"]) + "\n" + captured("stderr").rstrip(),
                }
            )
            continue
        expected = cell.get("expected")
        if expected is not None:
            actual = captured("stdout").rstrip()
            if actual.strip() != expected.strip():
                problems.append(
                    {
                        "kind": "output",
                        "id": cell["id"],
                        "message": "the `text output` block does not match what the code prints.\n"
                        + "--- expected ---\n" + expected.rstrip() + "\n--- actual ---\n" + actual,
                    }
                )

    for ex in job["exercises"]:
        if ex.get("solution") is None:
            problems.append({"kind": "exercise", "id": ex["id"], "message": "exercise has no `python solution` block"})
        else:
            del writes[:]
            res = await pc_harness.run_exercise(ex["solution"], ex["tests"], job["setup"])
            if not res["passed"]:
                msgs = "; ".join(f["message"] for f in res["failures"])
                problems.append({"kind": "exercise", "id": ex["id"], "message": "the solution fails its own tests: " + msgs})
        del writes[:]
        starter = await pc_harness.run_exercise(ex["starter"], ex["tests"], job["setup"])
        if starter["passed"]:
            problems.append(
                {"kind": "exercise", "id": ex["id"], "message": "the starter code already passes the tests (nothing to solve)"}
            )

    print(json.dumps(problems))


asyncio.run(main())
