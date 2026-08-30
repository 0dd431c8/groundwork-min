# groundwork-min

A production-shaped TypeScript application starter with a portable core, replaceable platform
adapters, and architecture rules enforced by the linter. Bun owns package management and builds;
the default production artifact is an ESM bundle for Node 24 or newer.

The template has no runtime dependencies. `bun run check` verifies formatting, type-aware lint,
dependency direction, duplication, strict types, coverage-enforced tests, the production bundle,
and execution of that bundle with Node.

| Concern                     | Choice                               |
| --------------------------- | ------------------------------------ |
| Language                    | TypeScript 7, strict beyond `strict` |
| Package manager and bundler | Bun 1.3.14                           |
| Production baseline         | Node 24+, ESM                        |
| Quality                     | Oxlint, Oxfmt, jscpd                 |
| Tests                       | Vitest with V8 coverage              |
| Runtime dependencies        | None                                 |

## Quick start

Install [Bun](https://bun.sh/) and [Node 24 or newer](https://nodejs.org/), then create a project:

```sh
bun create 0dd431c8/groundwork-min my-app
cd my-app
bun run start -- Ada
```

The example prints:

```text
Hello, Ada!
```

Run the complete gate before pushing:

```sh
bun run check
```

## Why this starter

- `src/core/` is checked without Node, Bun, or browser types. A platform API used there is a type
  error even if the main application can see it.
- A tested local Oxlint rule rejects imports from core to adapters or main, adapter imports from
  main, and Node or Bun modules imported by core.
- The default CLI keeps argument parsing, process output, and exit codes at the boundary. Core
  receives a normalized string and returns a plain string.
- Type-aware linting catches floating promises, unsafe values, deprecated APIs, and incomplete
  switches against the real TypeScript program.
- Tests sit beside the code they cover. Global coverage cannot fall below 90% for statements,
  branches, functions, or lines.
- Local and CI use the same `bun run check`; the emitted `dist/main.mjs` is executed with Node as
  the final step.
- `AGENTS.md` and scoped skills give coding agents the same short, executable conventions that a
  contributor sees.

## Architecture

```text
src/
  core/       platform-neutral decisions and transformations
  adapters/   CLI, HTTP, browser, worker, database, and other platform boundaries
  main.ts     composition and startup only
lint/         tested local Oxlint rules
.githooks/    staged-file formatting, lint fixes, and typechecking
```

Dependencies point toward the portable core:

```text
core <- adapters <- main
  ^_________________|
```

Core may use standard ECMAScript values and portable packages. It cannot import an adapter, the
entrypoint, Node built-ins, or Bun APIs. An adapter parses untrusted platform input into ordinary
values before calling core and translates the result back to its platform. Main imports whichever
core and adapter modules it needs to compose the running application; it does not hold decisions.

The default example is intentionally small:

- `createGreeting(name)` is pure core logic.
- `runCli(args, io)` validates arguments and maps outcomes to stdout, stderr, and an exit code.
- `main.ts` connects `process.argv` and process streams to `runCli`.

Use relative `.ts` imports. There is no path alias for the bundler or runtime to reinterpret.

## Scripts

| Command                           | What it does                                                     |
| --------------------------------- | ---------------------------------------------------------------- |
| `bun run dev -- Ada`              | Run the TypeScript entrypoint in watch mode                      |
| `bun run start -- Ada`            | Run the TypeScript entrypoint once with Bun                      |
| `bun run build`                   | Typecheck, then create `dist/main.mjs` for Node                  |
| `bun run bundle`                  | Create the bundle without repeating typechecking                 |
| `bun run smoke`                   | Execute the existing bundle with Node                            |
| `bun run test`                    | Watch application tests                                          |
| `bun run test:infra`              | Watch local-lint-rule tests                                      |
| `bun run test:coverage`           | Run every test project with coverage                             |
| `bun run lint` / `lint:fix`       | Check or fix lint findings                                       |
| `bun run format` / `format:check` | Write or check formatting                                        |
| `bun run dupes`                   | Reject copied implementations across production and tooling code |
| `bun run typecheck`               | Check application, portable core, and tooling programs           |
| `bun run check`                   | Run the complete local and CI gate                               |

`bun run build` uses Bun's Node target and ESM format with an external source map. Bun transpiles
and bundles; TypeScript remains the typechecker. The direct `bundle` command exists so `check` does
not typecheck twice.

## Testing and quality gates

Vitest has two independent projects:

- `app` runs colocated core and adapter tests in Node.
- `lint` runs each local rule through the real Oxlint binary and tests the shipped configuration.

The coverage report includes production core and adapters, including files no test imported. The
thin process-wiring entrypoint is excluded; its built form is exercised by the Node smoke step.

The pre-commit hook formats and lint-fixes staged source files, re-stages them, and runs every
TypeScript program. It refuses partially staged files because re-staging an automatic fix would
silently widen the commit. `bun install` configures `core.hooksPath` automatically.

Do not silence a failing quality gate to make it green. Each local rule reports the architectural
alternative. If a rule is wrong, change the rule and its tests instead of routing around it.

## Adapting the template

The greeting CLI proves the boundary and is not a framework commitment. For a real project:

1. Delete the greeting core and tests.
2. Replace the CLI adapter and `main.ts` with the platform boundary you need.
3. Rename the package and usage text, then rewrite this README and `CONTEXT.md`.
4. Keep `tsconfig.core.json`; it is the portability check. Change the application TypeScript
   types and libraries for the selected adapter—for example DOM types for a browser adapter.
5. Replace the Bun bundle command if the platform needs a framework build, then keep that build
   and an appropriate smoke check at the end of `bun run check`.

Validate raw input in the adapter. The starter uses a small local parser because one positional
argument does not justify a dependency. Add a schema library when real input complexity warrants
it; TypeScript types alone do not validate values from a process, request, file, or environment.

This is a single private application template. Package publishing, declarations, workspaces,
framework profiles, and deployment infrastructure are intentionally left to projects that need
them.

## Origin and license

`groundwork-min` is an independent sibling derived from
[`0dd431c8/groundwork` at `0597f97`](https://github.com/0dd431c8/groundwork/tree/0597f9768572c62f44cc157c31690605079e21a7).
It keeps that starter's executable-guidance approach while removing its frontend stack.

[MIT](LICENSE)
