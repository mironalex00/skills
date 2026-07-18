# lyra-council

**Version 2.0.0**
Alexandru Miron
July 2026

> This document is for agents and LLMs maintaining, extending, or refactoring this skill, not for end users invoking it. End users read `SKILL.md`. This file is the maintenance contract: it tells the next agent what the skill's invariants are, what must not drift when rules are added or edited, and how to verify a change is safe.

---

## Abstract

lyra-council is the deliberation engine of the collection. It spawns five subagents in parallel, each with a fixed persona, peer-reviews their outputs anonymously, and synthesizes a verdict through a chairman. Every session is persisted to `.lyra/council/` — Markdown session files plus an append-only digest ledger, local runtime state the skill itself keeps out of version control — so future councils can read what past councils concluded. It is distinct from the external `llm-council` skill (which covers the same methodology without memory or composition) and from `council-of-llms` (which spawns different models rather than different personas). The core constraint: each advisor is a real subagent, not one model roleplaying five experts, and every session is written to disk before the skill reports done.

---

## Invariants (do not break these)

1. **Each advisor is a separate subagent, spawned in parallel.**
   Why it is load-bearing: one model roleplaying five experts produces five answers that share the model's blind spots. Five subagents produce five independent answers. Lose this and the council is theater — the peer review and synthesis rounds have nothing real to work with.

2. **Peer review is anonymized and randomized per session.**
   Why it is load-bearing: if reviewers know which advisor wrote which response, they defer to the thinking style rather than evaluating the reasoning. A fixed mapping (always Contrarian = A) lets reviewers infer the source. The mapping must be randomized and recorded in `anonymization_map` so the chairman can de-anonymize.

3. **Every session is written to disk before the skill reports done — both tiers at once.**
   Why it is load-bearing: memory is what makes the council accumulate. A session that lives only in chat is lost. The write to `.lyra/council/sessions/{id}.md` and the digest block appended to `ledger.md` must both succeed before the verdict is presented as final. Writing the digest at save time — not at task close — is also what makes pruning safe later: the permanent record exists before anyone considers deleting the body.

4. **Write-once governs content, not file survival. Revisions create new sessions that reference the old.**
   Why it is load-bearing: editing a past session or a ledger block destroys the audit trail. If the second council on pricing overwrites the first, no one can reconstruct how the thinking evolved. The `refs:` field is how the chain is preserved. Deleting a pruned body does not break the trail, because its digest has been permanent since save time and a `pruned` event marks the gap — but an edit anywhere does.

5. **The chairman may side with a minority.**
   Why it is load-bearing: a council that always defers to the majority is a vote, not a synthesis. The chairman's job is to weigh reasoning, not count heads. If four advisors say "do it" but the one dissenter's reasoning is strongest, the chairman sides with the dissenter and explains why.

---

## Rules (mirror of SKILL.md, framed for maintainers)

### 1. Frame the question neutrally

- **The rule:** Reframe the user's raw question with context from the workspace, into a neutral prompt all five advisors receive. No opinion from the framer.
- **When editing:** If the framing step starts injecting the framer's recommended answer, the council is steered. Keep framing neutral.
- **Test for violation:** Read the framed question. If it leans toward one answer, reframe.

### 2. Query memory before convening

- **The rule:** Grep `.lyra/council/ledger.md`. Find sessions with overlapping tags or topic. Feed up to three prior-session notes (id, topic, recommendation, first action) into the advisor prompt.
- **When editing:** If the memory query is skipped, the second council on a topic ignores the first. The accumulation breaks.
- **Test for violation:** The session file's Prior sessions section should be populated when overlapping blocks exist in the ledger.

### 3. Spawn five advisors in parallel

- **The rule:** Use the Task tool, one subagent per advisor, all spawned before any returns. Each gets its persona, the framed question, and prior-session notes.
- **When editing:** Spawning advisors sequentially lets earlier responses bleed into later ones. Parallel is the constraint.
- **Test for violation:** The spawn calls must be issued in one batch, not one at a time.

### 4. Tolerate one timeout, stop at two

- **The rule:** If one advisor times out, proceed with four — its section keeps the heading with the single line `_Timed out._`. If two or more time out, stop, save a partial session with `incomplete: true` in its frontmatter, and tell the user.
- **When editing:** Synthesizing from three or fewer advisors produces a confident verdict from a thin picture. The threshold is four.
- **Test for violation:** A session with three advisor responses and a full verdict violates the invariant.

### 5. Anonymize and randomize for peer review

- **The rule:** Map advisors to letters A through E with a random permutation. Record the mapping on the `Mapping:` line of the Peer review section. Spawn five reviewer subagents in parallel. Each sees all five anonymized responses and answers the three questions from `references/peer-review-protocol.md`.
- **When editing:** A fixed mapping (Contrarian always A) lets reviewers infer the source. Randomize per session. Anonymity matters during the review round only — the persisted session names its authors, and the mapping line is the audit of the round.
- **Test for violation:** Check the `Mapping:` lines across session files. If two sessions have the same mapping, the randomization is broken.

### 6. Chairman synthesis follows the fixed shape

- **The rule:** The verdict has five sections: agrees, clashes, blind spots, recommendation, one thing to do first. The chairman may side with a minority. "It depends" is not a recommendation.
- **When editing:** Adding a sixth section or removing one breaks the contract that lyra-docs and other compositors rely on.
- **Test for violation:** The `## Verdict` section of the session file has exactly the five fixed subsections.

### 7. Persist before reporting done

- **The rule:** Write the session file, then append its digest block to the ledger. Only then present the verdict as final.
- **When editing:** Presenting the verdict before both writes succeed risks losing the session — or worse, a session with no permanent digest, which would make a later prune destructive.
- **Test for violation:** The ledger block for a session must exist after the skill reports done.

### 8. Substituting advisors is allowed; the count and tension are not

- **The rule:** A caller (lyra-docs, lyra-code-review) may substitute its own five personas. Exactly five. Each with a distinct angle. The angles must create tension.
- **When editing:** Allowing four or six advisors, or allowing overlapping angles, breaks the tension structure the synthesis depends on.
- **Test for violation:** The `advisors:` frontmatter field records which set was used. The set must have five entries.

### 9. Guard the store before writing

- **The rule:** On every convening, before the first write: skip if not in a git worktree; ensure `.lyra` is ignored (`git check-ignore -q .lyra`, else append `.lyra/` to the root `.gitignore`, creating it if missing); if `git ls-files .lyra` returns anything, stop without writing and report the untrack commands — never run `git rm -r --cached` automatically.
- **When editing:** The guard must stay in the write path, per convening — a one-time install check misses tracked state that reappears. The refusal must stay a refusal: auto-untracking stages changes the user never reviewed, and mid-rebase or in a linked worktree it corrupts state.
- **Test for violation:** Convene in a repo where `.lyra/` is tracked. The skill must stop before writing a session, and must not have staged anything.

### 10. Prune only on confirmation; the ledger is append-only

- **The rule:** Pruning deletes settled session bodies and appends one `pruned` event each. It never edits or removes existing ledger blocks, and it never triggers on an inferred task-completion signal — the skill proposes, the owner confirms or asks.
- **When editing:** "The task finished" is fuzzy: tasks reopen, get reframed, get abandoned. An automatic trigger will eventually delete a body someone still needed. And any in-place ledger edit breaks invariant 4.
- **Test for violation:** A `pruned` event with no owner confirmation in the transcript, a deleted body with no `pruned` event, or any diff to an existing ledger block.

---

## Maintenance notes

### Adding a rule

Append, do not insert mid-list. Rule numbers are referenced in reviews and external docs. A new rule gets `N + 1`. Add it to both `SKILL.md` and `AGENTS.md` in the same commit. Bump the version in `plugin.json` (minor for additive, major for breaking).

### Editing an existing rule

Preserve the rule number. If the meaning changes enough to mislead anyone citing it, that is a major-version bump. Re-check every example under that rule.

### Deleting a rule

Do not. Deprecate instead — leave the rule in place with a one-line note: "Deprecated in vN.0.0; superseded by rule M." Renumbering breaks external citations.

### Versioning

- Patch: wording fixes, new examples, typo fixes.
- Minor: new rule added, existing rule clarified without meaning change.
- Major: rule meaning changes, rule removed, or the session schema changes in a way that breaks existing readers.

A schema change to the session file is always a major version. The session files already on disk must remain readable; if the schema changes, write a migration note in `references/memory-schema.md` and bump to the next major version.

### Cross-references

This skill composes with `lyra-docs` (per-file review gate), `lyra` (decisions surfaced during prompt optimization), `lyra-code-review` (pre-merge tradeoffs), and `lyra-clean-architecture` (contested pattern choices). The external `llm-council` skill covers similar ground without memory or composition; inside the Collection, lyra-council is preferred. See `references/related-skills.md` in the `lyra` skill for the full composition map.