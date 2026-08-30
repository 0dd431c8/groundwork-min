# TypeScript application template

A portable-core starter: TypeScript 7, Bun tooling, a Node-compatible ESM example, Oxlint,
Oxfmt, jscpd and Vitest. Runtime dependencies are intentionally empty.

The rules here are enforced by `.oxlintrc.jsonc` and the three TypeScript programs. Breaking one
fails `bun run check` rather than waiting for review.

## Guides

Read the matching guide before changing code in that area.

| Work                                         | Guide                                      |
| -------------------------------------------- | ------------------------------------------ |
| Adding or changing portable logic            | `.agents/skills/core-development/SKILL.md` |
| Adding a platform boundary or entrypoint     | `.agents/skills/adapters/SKILL.md`         |
| Writing tests                                | `.agents/skills/testing/SKILL.md`          |
| Adding environment or external configuration | `.agents/skills/configuration/SKILL.md`    |
| Adding a lint rule or diagnosing one         | `.agents/skills/lint-rules/SKILL.md`       |
| Starting a real project from the template    | `.agents/skills/template-setup/SKILL.md`   |

## Commands

| Command                           | Purpose                                                  |
| --------------------------------- | -------------------------------------------------------- |
| `bun run dev -- <name>`           | Watch the source entrypoint                              |
| `bun run start -- <name>`         | Run the source entrypoint once                           |
| `bun run build`                   | Typecheck and bundle for Node                            |
| `bun run check`                   | Format, lint, dupes, types, coverage, bundle, Node smoke |
| `bun run test`                    | Watch application tests                                  |
| `bun run test:infra`              | Watch local-rule tests                                   |
| `bun run test:coverage`           | Run all test projects with coverage                      |
| `bun run lint` / `lint:fix`       | Check or fix lint findings                               |
| `bun run format` / `format:check` | Write or check formatting                                |
| `bun run typecheck`               | Check application, core portability, and tooling         |

Run `bun run check` before claiming work is complete. CI runs that exact command.

## Dependency direction

```text
core <- adapters <- main
  ^_________________|
```

- `src/core/` holds platform-neutral decisions. No Node, Bun, browser globals, environment reads,
  process access, adapter imports, or main imports.
- `src/adapters/` owns platform I/O and validates untrusted input. It may import core but not main.
- `src/main.ts` composes the selected adapters and core behavior and starts the process. Keep it
  thin; application decisions belong in core and protocol decisions belong in an adapter.
- Tests are colocated and are not production layers.

`tsconfig.core.json` checks production core without platform ambient types. The local
`boundary/dependency-direction` rule catches forbidden imports and reports the correct direction.
Use relative `.ts` imports; there is no path alias.

## External data

Anything from arguments, environment variables, files, requests, queues, storage, or third-party
APIs is untrusted. Parse it in an adapter, then pass a typed ordinary value into core. A tiny local
parser is right for a tiny contract; add a schema library when it removes more validation code than
it introduces. Do not use a TypeScript assertion as runtime validation.

## Quality rules

Oxlint enables correctness, suspicious, pedantic, and performance categories plus type-aware
promise and safety rules. No `any`, non-null assertion, `console`, `@ts-ignore`, floating promise,
or implicit exported return type. Production files stay under 400 lines, functions under 40 lines,
and complexity under 15.

Do not work around a failed gate. No disable comment for convenience, raised limit, jscpd ignore,
lowered coverage threshold, skipped test, or weakened assertion. Fix the cause. If the rule itself
is wrong, change its implementation, tests, configuration, and documentation together.

Search before writing a helper or abstraction. A second real caller is the signal to extract; one
speculative caller is not. jscpd and the local dry rule catch literal copies, but only the initial
search catches two differently written implementations of the same idea.

## Tooling boundary

`lint/`, `.githooks/`, and root config files are tooling, checked by `tsconfig.tooling.json` with
Bun types. They do not import application source. Bun is the package manager, script runner,
source development runtime, and bundler. Node 24+ is the production artifact contract and the final
step of `check`.
