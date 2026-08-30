---
name: template-setup
description: Initialize a real project from groundwork-min or maintain its hooks, CI, version pins, metadata, and shared agent guidance.
---

# Template setup

Use only the mode matching the task.

## Initialize a project

1. Remove the greeting core, CLI adapter, and their tests; replace `src/main.ts` with the real
   composition root.
2. Rename `package.json`, CLI usage text, README, CONTEXT, repository links, and security contact.
3. Keep `tsconfig.core.json`. Change application platform types and libraries without giving those
   ambient types to core.
4. Replace `bundle` and `smoke` for the chosen runtime or framework, keeping both at the end of
   `check`. A production build that is never executed needs a platform-specific verification step.
5. Add external configuration through the configuration guide. Add `.env.example` only when a
   documented non-secret key exists.

## Maintain template plumbing

- `.bun-version`, `.node-version`, package engines, and CI setup must describe the same supported
  toolchains. The lockfile is committed and CI installs it frozen.
- `bun install` sets `core.hooksPath` to `.githooks`. The hook refuses partially staged files,
  formats and lint-fixes eligible files, re-stages them, then runs all TypeScript programs.
- First-party skills live in `.agents/skills`; `.claude/skills` entries symlink to them. Add a row to
  `AGENTS.md` with every new skill. Keep instructions specific to decisions this repository makes.
- Preserve the upstream MIT notice and origin attribution when maintaining the public template.
