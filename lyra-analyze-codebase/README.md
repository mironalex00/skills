# lyra-analyze-codebase

One unified, read-only skill that analyzes any codebase across architecture, security, performance, and code quality, and produces a severity-ranked report instead of a bullet dump. Every finding cites a file and line, gets an earned P0–P3 severity, and carries a specific recommendation. Language-agnostic — it discovers the stack from manifest files rather than assuming it.
When it surfaces bugs it points to `lyra-debug`; when architecture is the concern, `lyra-clean-architecture`. Supersedes `analyze-codebase` and `analyze-project`.

**Reach for it when:** someone says "analyze", "audit", "review the codebase", "find vulnerabilities", "tech debt", "code quality", "understand this project", or hands you a directory with analysis intent.

**Don't:** expect it to modify the codebase — it inspects only, by construction.

_Part of the [skill collection](../README.md)._