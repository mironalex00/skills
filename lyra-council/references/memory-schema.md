# Memory schema

The council persists every session to disk so future councils can read what past councils concluded. Memory is what turns five one-shot advisors into an accumulating institution.

Schema version 2. Sessions are Markdown, the index is an append-only Markdown ledger, and the store polices its own git status. The v1 schema (JSON sessions + `index.jsonl`) is retired; the migration path is at the end of this file.

## File layout

```
.lyra/council/
├── sessions/
│   └── council-{YYYY-MM-DD-HHMM}-{shortid}.md
└── ledger.md
```

The `.lyra/` directory lives at the project root and is **local runtime state — it is never committed**. If there is no project (the user is running the council outside a project directory), fall back to `~/.lyra/council/` with the same layout. The skill writes to whichever exists; if neither exists, it creates `.lyra/council/` in the current working directory.

Session IDs sort chronologically by prefix and include a short random suffix to avoid collisions when two councils convene in the same minute: `council-2026-07-15-1432-a1b2`. The suffix is four hex characters from a hash of the topic, or random if no topic. Sessions migrated from schema v1 keep their original ids, which may predate this rule; the suffix rule governs sessions created under v2.

## The git guard

The store keeps itself out of version control. Before the first write of every convening — not once at install, because tracked state can reappear (a force-add, a clone of a repo that committed `.lyra/` under v1, a reverted `.gitignore`) — run, in order:

1. `git rev-parse --is-inside-work-tree` — outside a git repository there is nothing to pollute; skip the guard and write.
2. `git check-ignore -q .lyra` — if the path is not ignored, append a `.lyra/` line to the repository root `.gitignore`, creating the file if it does not exist. `check-ignore` beats grepping `.gitignore` because it honors nested ignore files, `.git/info/exclude`, and the user's global ignore — any of which may already cover the path.
3. `git ls-files .lyra` — if anything is tracked, **stop before writing**. Do not untrack automatically: `git rm -r --cached` as a silent side effect can stage changes the user never reviewed, and mid-rebase or in a linked worktree it is actively dangerous. Report the exact recovery (`git rm -r --cached .lyra`, then commit) and convene only after the store is clean.

## Session file

One Markdown file per session: flat YAML frontmatter for the queryable fields, verbatim prose under fixed headings for everything else. Two rules keep it grep-safe and formatter-safe:

- **Frontmatter values are flat single-line scalars.** `tags` and `refs` are plain comma-separated strings, never YAML lists — brackets invite type coercion (`[no, yes]` becomes booleans) and give formatters something to re-wrap.
- **Body headings are the exact strings below, unnumbered.** A reader keyed on heading text survives markdown formatters, which renumber lists and strip whitespace but do not rename headings.

```markdown
---
id: council-2026-07-15-1432-a1b2
schema: 2
date: 2026-07-15
topic: Beginner Claude course at $297
tags: pricing, course, launch
refs: council-2026-07-10-0915-x3y4
advisors: default
---

# council-2026-07-15-1432-a1b2

## Question

Framed: The user is deciding whether to build a $297 beginner course on
Claude Code for a non-technical solopreneur audience. Context: ... What is
at stake: ...

Raw: Should I build a $297 course on Claude Code for beginners? My audience
is mostly non-technical solopreneurs.

Context files: CLAUDE.md, memory/audience.md

## Prior sessions

- council-2026-07-10-0915-x3y4 (Pricing for the automation workshop):
  recommendation — price at $97 to validate demand; first action — run the
  workshop once at $97.

## Advisor — Contrarian

[verbatim response, no escaping]

## Advisor — First Principles

[verbatim response]

## Advisor — Expansionist

[verbatim response]

## Advisor — Outsider

[verbatim response]

## Advisor — Executor

[verbatim response]

## Peer review

Mapping: A=outsider, B=first_principles, C=executor, D=contrarian, E=expansionist

### Review 1

1. Strongest: ...
2. Biggest blind spot: ...
3. All five missed: ...

### Review 2
...

## Verdict

### Where the council agrees
...

### Where the council clashes
...

### Blind spots the council caught
...

### The recommendation
...

### The one thing to do first
...
```

Notes:

- **Advisor sections are de-anonymized.** The persisted record always names its authors — anonymity matters during the peer-review round, not after synthesis. The `Mapping:` line preserves the audit of which advisor was which letter, and it must differ between sessions (randomized per round).
- A timed-out advisor keeps its heading with the single line `_Timed out._`
- `incomplete: true` is added to the frontmatter only when the round could not finish (two or more timeouts). It records a fact about the save. Session files carry **no mutable status** — lifecycle state lives in the ledger, so session files never need editing.
- `schema: 2` marks the format version. File extension distinguishes v1 (`.json`) from v2 (`.md`); the field is what a future v3 migration will key on.
- `advisors:` is `default` or a flat comma list of the five substituted personas (e.g. `advisors: accuracy, citations, slop, repetition, completeness` for the lyra-docs gate).
- Two optional closing sections may follow the Verdict, and only these: `## Fixes applied` (when confirmed findings were applied in-session) and `## Chairman notes` (chairman context that fits no fixed heading — e.g. why a round is incomplete). Nothing else is added to the heading set.
- An LLM writes and reads this file directly: no escaping, no parse step, no serializer. A human opens it and reads a document.

## The ledger

`ledger.md` is the permanent tier and the **only index** — one file, so the index and the surviving digest can never drift apart. It is append-only: blocks are added whole, existing blocks are never edited. Two event kinds.

A **session block**, appended at save time together with the session file:

```markdown
### council-2026-07-15-1432-a1b2
- date: 2026-07-15
- topic: Beginner Claude course at $297
- tags: pricing, course, launch
- refs: council-2026-07-10-0915-x3y4
- recommendation: Do not build the course yet. Validate with a
  lower-commitment offer first, reframed around the outcome not the tool.
- first action: Run a $97 live workshop to 50 people.
- advisors: contrarian — $297 overpriced vs competition; first principles —
  validate demand before building; expansionist — ceiling is a $997 program;
  outsider — "Claude Code" means nothing to the buyer; executor — workshop
  first, course later.
```

A **pruned block**, appended when a session's full body is deleted:

```markdown
### pruned council-2026-07-15-1432-a1b2
- date: 2026-07-20
- note: body removed after task close; the session block above is the record
```

Status is derived from the latest event for an id, so nothing is ever edited in place. Appending whole self-contained blocks is the discipline, not an OS-level guarantee: re-read the ledger tail immediately before appending so a block landed by another session is not clobbered, and where the environment offers atomic append or a lock, use it. Write order within a save: session file first, then ledger block. A crash between the two leaves an orphaned session file — the next convening (or the validator) detects the missing block and repairs it by appending one built from the intact file, which is an append, not an edit.

Precedence: the ledger is the source of truth for queries and lifecycle state; the session file is the source of truth for full content while it exists.

## Lifecycle

Both tiers are written at save time — the digest is **not** deferred to task close. That single decision is what makes pruning safe: from the moment a session is saved, everything the audit trail promises (question, verdict, first action, each advisor's position, the reference chain) already lives in the permanent tier.

The global task is the unit of work that convened the councils — the plan, feature, or decision the owner is driving. It is settled when the owner says so: there is no machine-detectable "task finished" event, which is exactly why pruning waits for a human.

Pruning deletes `sessions/*.md` bodies whose global task is settled and appends one `pruned` event per deleted file. It is the one deliberate loss in the design: the digest keeps the decision and each advisor's position, not every word of the deliberation. That loss never happens implicitly — it is the owner's explicit trade of detail for a leaner store, which is why confirmation is mandatory. Constraints:

- Pruning never touches the ledger's existing blocks.
- Pruning never runs on an inferred signal. "The task finished" is fuzzy — tasks reopen, get reframed, get abandoned — so an automatic trigger will eventually delete a body mid-dispute. The skill may **propose** pruning when a task looks settled; the owner confirms or asks for it explicitly.
- Nothing breaks if bodies are never pruned. Files are small and git-ignored; pruning is housekeeping that keeps `grep` across `sessions/` token-lean, not required maintenance.

## Query patterns

Everything is grep; there is nothing to parse.

By tag (matches ledger blocks and session frontmatter alike):

```
grep -n "tags:.*pricing" .lyra/council/ledger.md
grep -l "tags:.*pricing" .lyra/council/sessions/*.md
```

By topic substring:

```
grep -in "topic:.*course" .lyra/council/ledger.md
```

By date:

```
grep -n "^### council-2026-07" .lyra/council/ledger.md
```

By reference to a prior session:

```
grep -n "refs:.*council-2026-07-10-0915" .lyra/council/ledger.md
```

Full digest for one session (the block is short; over-grab and trim):

```
grep -A 10 "^### council-2026-07-15-1432-a1b2$" .lyra/council/ledger.md
```

Lifecycle states:

```
grep -l "incomplete: true" .lyra/council/sessions/*.md
grep -n "^### pruned " .lyra/council/ledger.md
```

## What to feed advisors from prior sessions

Do not dump prior sessions into the advisor prompt. Feed a compressed note per prior session, built from its ledger block:

```
Prior session council-2026-07-10-0915-x3y4 (topic: "Pricing for the automation workshop"):
- Recommendation: price at $97 to validate demand before raising.
- First action: run the workshop once at $97 before considering a higher tier.
```

Three lines per prior session; if more than three match, take the three most recent. Open the full session file only when the reasoning behind a verdict is itself in question — and only if the body still exists. If it was pruned, the ledger block is the record, and that is enough for inheritance.

## Immutability — what write-once means here

Write-once governs **content**: a session file is never edited after it is written, and a ledger block is never edited after it is appended. Write-once does not promise that a session file survives forever: a body may be deleted after its task settles, because its digest has been permanent since save time. The audit trail is the ledger chain plus whatever bodies still exist.

If a session was written with an error (wrong topic, broken structure), do not fix it in place. Write a new session with a corrected topic and a reference to the broken one. The broken one stays as a record of what actually happened. If a decision is revisited, the new session lists the prior session's id in `refs:` — reading the chain reconstructs how the thinking evolved.

## What does not go in memory

The council does not save: the user's raw input beyond what is in the `Raw:` line, the contents of context files that were read (those live in the workspace already), or any PII the user included in their question. If the raw question contains secrets, redact them before writing the session file and note the redaction inline: `Raw: Should I use API key sk-... in production? [redacted]`.

Memory is for the council's conclusions and reasoning, not for exfiltrating workspace contents.

## Migration from the JSON era (schema v1)

Installs upgraded from v1 have `sessions/*.json` and an `index.jsonl`. On the first convening after the upgrade, migrate once — before the git guard writes anything new:

1. Convert each JSON session to the session template above, field for field, losslessly: framed and raw question, context files, prior-session notes, the five advisor texts verbatim, the anonymization map (as the `Mapping:` line), the five peer reviews, the verdict's five subsections, tags, references, and any `incomplete` flag.
2. Rebuild `ledger.md` from the converted sessions, oldest first, one session block each.
3. Verify every v1 field found a destination, then remove the JSON originals — move them to `sessions/json-era/` (inert, still git-ignored) or delete them at the owner's choice.
4. Keep no dual-format reader. After migration the JSON schema is never read again; a permanent two-format code path is lasting complexity for a one-time problem.
