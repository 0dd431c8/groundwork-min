---
name: testing
description: Write or change application, adapter, custom-lint-rule, or quality-infrastructure tests in this template.
---

# Testing

- Colocate production tests as `*.test.ts`. Import `describe`, `it`, `expect`, and mocks explicitly
  from Vitest; globals are not enabled.
- Test core as pure input and output. Test adapters through injected I/O and assert protocol output,
  errors, and status or exit codes separately.
- Use the `app` project for `src` and the `lint` project for local Oxlint rules. A lint-rule case
  must run the real Oxlint binary through `lint/test/harness.ts`, not call rule internals directly.
- Add one configuration test when enabling a local rule; plugin tests alone cannot prove the
  shipped `.oxlintrc.jsonc` turns it on.
- Global V8 thresholds are 90% for statements, branches, functions, and lines. Improve missing
  behavior coverage rather than excluding a hand-written module or lowering the floor.
