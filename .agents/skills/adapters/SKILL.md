---
name: adapters
description: Add or change a CLI, HTTP, browser, worker, storage, or other platform adapter and its composition entrypoint.
---

# Adapters and entrypoints

An adapter translates a platform protocol; main only wires adapters into the process.

- Treat every external value as untrusted. Parse arguments, environment, requests, files, and API
  responses before passing normalized values to core.
- Keep protocol policy here: status or exit codes, headers, serialization, stdout/stderr, retries,
  and platform error messages. Keep application decisions in core.
- Depend on core, never on `src/main.ts`. Adapters at the same layer may share a module only after a
  real second use demonstrates the common contract.
- Inject narrow I/O capabilities into callable adapter functions so tests can observe behavior
  without patching globals. Wire real platform globals once in `src/main.ts`.
- When replacing the default Node CLI, update application TypeScript types, build and smoke scripts,
  README commands, and the template-setup guide. Preserve the platform-free core check.
