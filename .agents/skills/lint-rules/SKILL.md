---
name: lint-rules
description: Diagnose, add, or change Oxlint configuration and the local boundary or duplicate-function plugins under lint.
---

# Lint rules

Read the reported message and locate the architectural cause before changing configuration.

- Do not add a disable comment merely to unblock work. If a valid case cannot be expressed by the
  rule, explain the exception or change the rule and its contract.
- Local plugins use the minimal ESTree shapes in `lint/types.ts` and run through Oxlint's JavaScript
  bridge. Avoid casts by widening those shared optional shapes only for fields a rule actually uses.
- Test local rules through the real binary with focused pass and fail fixtures. Assert the rule code,
  location, and corrective message where each matters.
- Add or update `lint/config.test.ts` whenever rule activation changes. Run `bun run test:infra`,
  then the complete `bun run check`.
- Keep rule messages prescriptive: name the forbidden dependency and the valid destination or
  alternative so a contributor can fix the finding from the output alone.
