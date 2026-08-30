# Contributing

Install the versions selected by `.bun-version` and `.node-version`, then install dependencies:

```sh
bun install
```

Read `AGENTS.md` and the scoped guide for the work you are doing. Keep tests beside the code they
cover and run the narrowest useful test command while iterating.

Before opening a pull request:

```sh
bun run check
```

The command is the same gate CI runs. Do not lower thresholds, silence findings, or bypass a broken
check. Explain user-visible behavior and any architecture-rule change in the pull request.
