# Evidence-First Rule

Apply this rule for every coding, review, debugging, deployment, and repository-management task across any AI agent.

Source files:

- `../AGENTS.md`
- `../core/anti-hallucination.md`
- `../core/safe-commands.md`

## Required Behavior

- Read relevant files before making claims about the project.
- Treat command output as stronger evidence than memory or assumptions.
- Separate verified facts, assumptions, and recommendations.
- Do not claim build/test/lint success unless the command ran successfully.
- Do not invent dependencies, routes, credentials, APIs, database schemas, or deployment state.
- If a task is ambiguous and implementation risk is real, ask the smallest necessary clarification.

## Completion Gate

Before saying the task is done:

1. List what evidence was checked.
2. Run the strongest available validation command.
3. Report any validation that could not be run.
4. Mention remaining risk only if it matters.
