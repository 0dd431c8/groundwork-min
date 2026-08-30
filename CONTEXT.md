# Domain context

## Portable Core

Portable Core is the application logic that survives a platform change. It receives ordinary
typed values and returns ordinary values. A separate TypeScript program gives it only ECMAScript
libraries, and a local lint rule rejects Node, Bun, adapter, and entrypoint imports.

## Adapter Boundary

An adapter translates one platform protocol into core inputs and core outputs back into that
protocol. The worked CLI adapter owns argument parsing, whitespace normalization, stdout, stderr,
usage text, and exit codes. Invalid external data never enters core.

## Application Entry

The entrypoint is the composition root. It connects process arguments and streams to the CLI
adapter and assigns the returned exit code. It owns no parsing or application decision.

## Production Artifact

Bun bundles the entrypoint as ESM for Node into `dist/main.mjs`. The full gate then executes that
file with Node, so compatibility is verified rather than inferred from a build flag.
