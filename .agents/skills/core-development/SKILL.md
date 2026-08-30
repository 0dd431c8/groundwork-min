---
name: core-development
description: Add or change platform-neutral application logic under src/core without leaking runtime or adapter concerns into it.
---

# Core development

Core holds decisions that survive a move between CLI, server, browser, and worker adapters.

- Accept ordinary typed values and return ordinary values. Do not read arguments, environment,
  files, requests, clocks, randomness, storage, or process state directly.
- Put protocol parsing and runtime error mapping in an adapter. Core may return a domain-specific
  discriminated union when callers need to distinguish valid business outcomes.
- Do not import Node or Bun modules, browser-only packages, `src/adapters`, or `src/main.ts`.
  `tsconfig.core.json` and the boundary lint rule enforce this from different directions.
- Keep related tests beside the core module. Cover decisions and boundary values without mocking a
  platform that core cannot see.
- Search for an existing operation before adding a helper. Extract shared behavior only after a
  second real caller establishes its shape.
