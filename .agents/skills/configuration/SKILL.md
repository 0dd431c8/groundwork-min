---
name: configuration
description: Add environment variables or other external application configuration while preserving runtime validation and core portability.
---

# Configuration

Configuration is external input and belongs to an adapter.

- Read environment or platform configuration once at the boundary. Parse required values, defaults,
  allowed values, and numeric or boolean syntax before constructing core inputs.
- A TypeScript type or assertion does not validate a runtime string. Use a small explicit parser for
  a small contract; add a portable schema library when the contract becomes large enough to justify
  the dependency.
- Report configuration errors before starting application work and without printing secret values.
- Document non-secret keys in `.env.example` only after the first real key exists. Never commit
  `.env` files or credentials.
- If configuration becomes portable application policy rather than platform input, pass its parsed
  value into core; do not let core read the environment itself.
