# Kickoff prompt for opencode (paste as the first message)

```
Read AGENTS.md, tasks.md, PROGRESS.md and everything in docs/ first.
You are building PyCourses exactly as specified. Follow the progress-tracking
protocol in AGENTS.md strictly:

1. Start with the first unblocked task in tasks.md (T-001).
2. Mark it [~] and update "Current focus" in PROGRESS.md before coding.
3. Implement only that task, with tests, until its acceptance criteria pass.
4. Run: pnpm typecheck && pnpm lint && pnpm test
5. Mark it [x], add a log entry to PROGRESS.md, run `pnpm progress`
   (once T-004 exists), commit with the task ID.
6. Continue with the next task. Stop and ask me only if an acceptance
   criterion is ambiguous or a decision contradicts docs/DECISIONS.md.

For any UI task use @frontend-design and the tokens in docs/DESIGN_SYSTEM.md.
```

## Handy follow-ups
- "Continue with the next task." 
- "Show me current progress: summarize tasks.md and PROGRESS.md, list blockers."
- "Audit: compare the code against docs/ARCHITECTURE.md and list deviations as new tasks."
- "Add a new course module on <topic> following docs/CONTENT_SPEC.md and add its tasks."
