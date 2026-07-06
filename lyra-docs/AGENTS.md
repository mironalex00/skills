# lyra-docs

**Version 1.0.0**
Alexandru Miron
July 2026

> This document is for agents and LLMs maintaining, extending, or refactoring this skill — not for end users invoking it. End users read `SKILL.md`. This file is the maintenance contract: it tells the next agent what the skill's invariants are, what must not drift when rules are added or edited, and how to verify a change is safe.

---

## Abstract

lyra-docs reads a codebase and writes a `docs/` folder at the project root. It is the documentation-generation skill in the collection, distinct from `lyra-analyze-codebase` (which reports risks, not documentation) and from `docs` (which writes prose without reading code). The core constraint: every claim cites a file and line, and inferred intent is forbidden.

---

## Invariants (do not break these)

1. **Every prose claim cites a file and line range.**
   Why it's load-bearing: without citations, the skill becomes a hallucination engine. A doc that says "the auth module handles sessions" without pointing to `src/auth/session.ts:12-40` is a guess wearing prose. Lose this and the skill is worse than no docs because the clean writing hides the rot.

2. **Inferred intent is forbidden; only observable behavior and explicit decisions are documented.**
   Why it's load-bearing: a citation does not make an inference true. "The auth module exists to centralize session logic" is intent — it reads minds. "The auth module exports `createSession`, `verifySession`, and `destroySession` (`src/auth/index.ts:3-5`)" is observable. The first is hallucination; the second is documentation. Decisions go in `decisions.md` only when the code states them directly.

3. **The per-file council gate runs before any file lands.**
   Why it's load-bearing: the five-advisor review (accuracy, citations, slop, repetition, completeness) is the quality gate. Skipping it on a "small" file is how banned vocabulary, uncited claims, and repetition ship.

---

## Rules (mirror of SKILL.md, framed for maintainers)

### 1. docs/ holds only irreducible knowledge

- **The rule:** Documentation holds what the code cannot express: how pieces fit, module responsibilities, explicit decisions. It does not re-describe what symbols declare.
- **When editing:** If you add a section that paraphrases a function signature or restates a type definition, cut it. The test: could a reader regenerate this paragraph by reading the code? If yes, it is slop.
- **Test for violation:** Pick any paragraph in `modules/*.md`. If deleting it leaves the reader no less informed about the code's structure, the paragraph is redundant.

### 2. Every claim cites file and line

- **The rule:** Prose claims carry `file/path.ext:42` or `file/path.ext:42-58`. No citation, no claim. Untraceable claims are omitted.
- **When editing:** Adding a claim without a citation breaks the invariant. If the claim is important but unverifiable, write "Not determined from source" — do not infer.
- **Test for violation:** Grep the file for sentences ending in a period not followed by a backtick-citation. Each must be a structural statement (a heading, a list intro), not a factual claim.

### 3. Inferred intent is forbidden

- **The rule:** Document observable behavior and explicit decisions. Do not write "this module exists to..." or "the purpose of this function is...". Purpose is inferred; behavior is observed.
- **When editing:** If a sentence attributes motivation to the code, rewrite it as a description of what the code does. "The cache layer reduces database load" becomes "the cache layer stores results for 5 minutes (`src/cache.ts:14`)".
- **Test for violation:** Search for "exists to", "is designed to", "the purpose of", "is meant to". Each is an intent claim and must be rewritten or cut.

### 4. decisions.md records only explicit decisions

- **The rule:** `decisions.md` contains choices the code states directly: `// We chose X because Y` comments, ADR files, config with explanatory comments. Inferred patterns go in `architecture.md` with a citation.
- **When editing:** Adding an inferred decision to `decisions.md` breaks the invariant. If you cannot cite a comment, ADR, or commit message that states the decision, it does not go in `decisions.md`.
- **Test for violation:** Every entry in `decisions.md` must quote or cite the source where the decision is stated. Entries without a source are hallucinations.

### 5. Generated code and scale are handled explicitly

- **The rule:** Skip generated code (detected by `// generated` headers, `gen/` paths, build config). For repos over 500 source files, sample strategically and note the sampling in `docs/README.md`.
- **When editing:** If the skill starts documenting a generated file, the detection failed. Add the path pattern to the skip list. If the repo is large and no sampling note appears in `docs/README.md`, the scale rule was not applied.
- **Test for violation:** Check `docs/README.md` for a sampling note on large repos. Check `directory-tree.md` for any file under `gen/` or with a `// generated` header.

### 6. Every file is stamped with a verification commit

- **The rule:** Each generated file has `Verified at commit <hash>` at the top. When the code changes, the stamp is stale and the file needs re-verification.
- **When editing:** Removing the stamp breaks drift detection. If the commit is unavailable (no git repo), stamp with the date and note "no git history available".
- **Test for violation:** Grep for `Verified at commit` at the top of every file in `docs/`. Missing stamps mean the file is unverified.

### 7. The per-file council gate runs before landing

- **The rule:** Draft → five-advisor review (accuracy, citations, slop, repetition, completeness) → rewrite → verify. Zero blocking findings required to land.
- **When editing:** If you skip the gate on a file, the invariant is broken. The gate applies to every file regardless of length.
- **Test for violation:** The file should have evidence of the review pass. If the council review log is absent, the gate was skipped.

### 8. The anti-slop checklist is enforced

- **The rule:** No emojis, no banned vocabulary (leverage, utilize, seamless, robust, showcase, foster, delve, additionally, moreover, crucial, pivotal, enhance, unlock, elevate, harness, intricate, vibrant, testament, underscore, paradigm, synergy, ecosystem, innovative, cutting-edge), no boilerplate openers, no hedges, sentence-case headings.
- **When editing:** Adding a banned word to your own prose breaks the checklist. The full list is in `references/anti-slop-rules.md`.
- **Test for violation:** Run the banned-vocabulary grep from `references/anti-slop-rules.md` against the file. Any hit is a blocking finding.

---

## Maintenance notes

### Adding a rule

Append, do not insert mid-list. Rule numbers are referenced in reviews and external docs. New rule gets `N + 1`. Add it to both `SKILL.md` and `AGENTS.md` in the same commit. Bump the version in `plugin.json` (minor for additive, major for breaking).

### Editing an existing rule

Preserve the rule number. If the meaning changes enough to mislead anyone citing it, that is a major-version bump. Re-check every citation example under that rule — if you change the wording, the examples may need to move.

### Deleting a rule

Do not. Deprecate instead — leave the rule in place with a one-line note: "Deprecated in vN.0.0; superseded by rule M." Renumbering breaks external citations.

### Versioning

- Patch: wording fixes, new examples, typo fixes.
- Minor: new rule added, existing rule clarified without meaning change.
- Major: rule meaning changes, rule removed, or the docs/ tree structure changes.

### Cross-references

This skill composes with `lyra-analyze-codebase` (run first to map the codebase), `lyra-clean-architecture` (name the pattern in `architecture.md`), `lyra-api-design` (describe contracts in `api/`), and `humanizer` (its Wikipedia-based patterns inspired the anti-slop checklist). See `references/related-skills.md` in the `lyra` skill for the full composition map.