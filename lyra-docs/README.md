# lyra-docs

Reads a codebase and writes documentation to `docs/` at the project root. The documentation holds only knowledge the code cannot express itself: how the pieces fit, each module's responsibility, decisions the code makes explicit. It does not re-describe what every function does — that rots the moment the code changes.

Every prose claim cites a file and line range. Claims that cannot be traced to specific lines are omitted, not invented. The skill documents observable behavior and explicit decisions, never inferred purpose. Each file passes a five-advisor council review — accuracy, citations, slop, repetition, completeness — before it lands.

**Reach for it when:** generating or refreshing a project's docs/ folder from the source code.
**Don't:** inline docstrings, README quickstart, changelogs, or anything that paraphrases what the symbols already declare.

_Part of the [skill collection](../README.md)._