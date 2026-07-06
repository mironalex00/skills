# Anti-hallucination rules

The core constraint: every prose claim cites a file and line range. Inferred intent is forbidden. This file expands those rules with concrete patterns and failure modes.

## Citation syntax

- Single line: `file/path.ext:42`
- Line range: `file/path.ext:42-58`
- Multiple files for one claim: `file/path.ext:42 (also src/a.ts:10, src/b.ts:33)`
- Directory-level claim (e.g. "all controllers extend BaseController"): `src/controllers/` with a list of the files inspected

A citation must point to lines the reader can open and verify. If the line range is wide (over 30 lines), the claim is probably too vague — narrow it or split it.

## What counts as a claim

A claim is any sentence that asserts something about the code. Structural statements (headings, list introductions like "The auth module exports:") are not claims when they introduce a cited list. Once the list items carry citations, the intro is structural.

"What the code does" is a claim. "What the code is for" is a claim about intent and is forbidden.

## The grep-to-read-to-cite loop

1. Grep for the pattern (function name, config key, route path).
2. Read the matching file and surrounding context — a match is a lead, not a finding.
3. Cite the exact line range that supports the claim.
4. Verify by re-reading the cited lines with the claim in mind. If they do not support it, rewrite or omit.

## Forbidden inferences

These patterns read minds. Rewrite or cut them.

- "The auth module exists to centralize session logic." (intent)
- "This function is designed to be called by the scheduler." (purpose)
- "The cache layer reduces database load." (unverifiable effect)
- "Developers should use this utility for..." (prescriptive guidance not in the code)
- "This pattern was chosen for performance reasons." (inferred rationale)

Rewrite as observable behavior:

- "The auth module exports `createSession`, `verifySession`, and `destroySession` (`src/auth/index.ts:3-5`)." (observable)
- "The function is called from `src/scheduler.ts:22`." (observable caller)
- "The cache layer stores results for 5 minutes (`src/cache.ts:14`)." (observable config)

## Explicit decisions vs inferred patterns

A decision is explicit when the code states it:

- A comment: `// We chose Redis over Memcached because we need persistence`
- An ADR file: `docs/adr/0001-redis-over-memcached.md`
- A config comment: `# Using 5 min TTL to balance freshness and load`
- A commit message: `feat: switch to Redis for session storage (persistence)`

A pattern you notice is an observation, not a decision. "The codebase uses repository classes everywhere" is an observation — it goes in `architecture.md` with citations to representative files. "We chose the repository pattern for testability" is an inferred decision — it does not go in `decisions.md` unless a comment or ADR says so.

## Handling uncertainty

When the code is ambiguous or the claim cannot be verified:

- Omit the claim. This is the default.
- Write "Not determined from source" if the absence of information is itself worth noting.
- Never fill the gap with an inference. A missing explanation is honest; an invented one is a hallucination.

## Verifying citations

After drafting a file, re-open each cited file and line range. Read it with the claim in mind. Three outcomes:

1. The lines directly support the claim. Pass.
2. The lines relate but require interpretation. Rewrite the claim to match what the lines literally say, or widen the citation to include the supporting context.
3. The lines do not support the claim. Cut the claim or rewrite it to match the source.

A citation that does not verify is worse than no citation — it lends credibility to a false claim.

## The drift problem

Generated docs are a snapshot. By the next commit, line numbers move, functions rename, files vanish. The commit-hash stamp at the top of each file (`Verified at commit <hash>`) makes staleness visible. When the code changes, the stamp is stale and the file needs re-verification.

Future work: a `lyra-docs check` command that re-opens every citation against the current code and reports mismatches. Until then, the stamp is the contract — if it is old, the reader knows to verify before trusting.