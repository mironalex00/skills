# lyra-de-slop

**Version 1.0.0**
Alexandru Miron
July 2026

> **Note:**
> This is a maintenance contract for agents who edit this skill, not end-user
> documentation. It captures the invariants that must hold, mirrors the rules
> from SKILL.md in maintainer framing, and explains how to edit safely. Read
> this before changing SKILL.md or adding, editing, or removing a rule.

---

## Abstract

Behavior-preserving removal of AI-generation artifacts across three surfaces: code (comments, types, dead code, debug artifacts, defensive theater, over-abstraction, over-nesting), prose (AI-register vocabulary, decorative structure, content-free documentation), and tests (assertion-free tests, mocks of the unit under test, scaffolds that manufacture false green). Diff-scoped by default, whole-tree only on request, and every sweep is backstopped by typechecker + tests — framed honestly as necessary evidence rather than proof, with risk-calibrated review for behavior-adjacent removals. The 2026 redesign added the prose and test surfaces and made verification mandatory rather than suggested.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Behavior preservation** — lyra-de-slop never changes what the code does; anything that would is out of scope and routed to lyra-bug-hunter or a refactoring skill.
2. **Reviewable scope** — the default is the branch diff; pre-existing slop outside it is reported, never silently edited.
3. **Verified sweeps, honestly framed** — typecheck + tests run after every sweep and a cleanup that breaks either is reverted and flagged as load-bearing; green is treated as necessary evidence, never as proof of behavior preservation, and behavior-adjacent removals (defensive theater, test deletions) carry per-site justification.

---

## Rules

### 1. Delete narration, keep constraints

**The rule:** Comments restating code, narrating generation, or logging the change are deleted; comments carrying a *why* or an inexpressible constraint stay.
**When editing:** Keep the three narration categories distinct — the "change-log comment" (`// added validation`) is the most common 2026 artifact and must stay named.
**Test for violation:** A sweep that deletes a comment explaining a workaround's reason, or keeps `// new helper function`.

### 2. Real types over escape hatches, typed once at the boundary

**The rule:** `any`/`as any`/bare `@ts-ignore` become real types; unknowable data becomes `unknown` + narrowing; the boundary is typed once instead of casting at each use.
**When editing:** Keep the boundary-first strategy — per-use casting is the anti-pattern this rule exists to prevent.
**Test for violation:** A fix that replaces one `any` with five scattered `as` casts.

### 3. Dead code goes; side-effect imports are not dead

**The rule:** Commented-out blocks, unused symbols, unreachable branches, and finished feature flags are removed; CSS/polyfill/registration imports are checked before cutting.
**When editing:** Keep the side-effect-import warning — it is the highest-frequency way a lyra-de-slop pass breaks a build.
**Test for violation:** A removed import that a bundler needed for its side effect.

### 4. Debug artifacts routed or removed; TODOs get owners or die

**The rule:** Console/print debugging is deleted or routed through the project logger; TODO/FIXME needs an owner or issue link to survive.
**When editing:** Keep the logger-respect clause — projects with a logging service must not gain raw console calls back.
**Test for violation:** A `console.log` left because it "might be useful", or a surviving bare TODO.

### 5. Defensive theater dies; boundary validation lives

**The rule:** Try/catch and null-guards on trusted internal paths that cannot fail are removed; validation at user input, network, filesystem, and third-party boundaries stays. The test is reachability: can any input execute this branch?
**When editing:** Keep the reachability test phrasing — without it, this rule gets misapplied to real boundaries.
**Test for violation:** Removed input validation on a request handler, or kept try/catch around a pure function call.

### 6–7. Over-abstraction inlined, over-nesting inverted

**The rule:** Single-caller helpers, no-op wrappers, unused config, and one-implementation interfaces are collapsed (three concrete uses justify abstraction); nesting pyramids become guard clauses and early returns, matching file style.
**When editing:** Keep "match the surrounding file's style" — lyra-de-slop must not impose a new style while removing one.
**Test for violation:** An early-return rewrite in a file that consistently uses single-exit style.

### 8–9. Prose slop: AI register and content-free docs

**The rule:** AI-register vocabulary, emoji headers, diff-restating bullets, hedged non-claims, section-for-section's-sake docs, signature-repeating JSDoc, and padded changelogs are removed or rewritten to say less, accurately.
**When editing:** Keep the vocabulary list current — it drifts as models change registers; additions need to be words humans genuinely avoid in technical prose.
**Test for violation:** A README that still opens with a 🚀 header, or a changelog entry rewritten to be *longer*.

### 10. Dependency slop: packages installed by reflex

**The rule:** Diff-scope dependency additions get swept: zero-use packages removed, heavy deps for one stdlib-coverable call inlined, duplicates consolidated; detect via knip/depcheck or imports-vs-manifest grep.
**When editing:** Keep the lyra-security-supply-chain rule 4 pairing (policy there, cleanup here) — without it this rule drifts into dependency-policy territory it doesn't own.
**Test for violation:** A sweep that cleans code but waves through a lodash added for one `isEmpty` call.

### 11. Test slop: tests that prove nothing

**The rule:** Assertion-free tests, mocks of the unit under test, scenario-named scaffolds that never exercise the scenario, and unreviewed snapshots are repaired when intent is recoverable, deleted when they assert nothing; a deleted fake test is not lost coverage.
**When editing:** Keep "it was never coverage" — the objection this rule always meets is a coverage metric, and the metric is the thing being gamed.
**Test for violation:** A kept test whose only assertion is `toBeDefined()` on a typed non-nullable, or a sweep that skips test files to protect a coverage number.

### Verification (mandatory): verify, then report by type with counts

**The rule:** Typecheck + tests after every sweep, revert-and-flag anything load-bearing, never touch configs/entry points/reasoned lint pragmas, report grouped counts plus suspicious-but-kept items. Green is necessary evidence, not proof: behavior-adjacent removals (rules 5, 10, and 11) get dry-run first and per-site justification, weighted by how thin coverage is.
**When editing:** Keep verification mandatory, the protected-file list explicit, and the evidence-not-proof framing — restoring the old "proves nothing changed" claim is a regression.
**Test for violation:** A sweep reported as done with no typecheck/test evidence, or a defensive-theater removal shipped with no justification.

---

## Maintenance notes

- **Adding a rule:** It must target a *generation artifact* (exists because a model wrote it), be behavior-preserving, and state its false-positive guard the way rules 3 and 5 do.
- **Editing a rule:** The scopes table is part of the contract — `--changed` stays the default; whole-tree stays opt-in. The prose surface (rules 8–9) must stay artifact-removal, not style rewriting; voice work belongs to a humanizer-type skill.
- **Deleting a rule:** The Verification section and invariant 2 (scope) are the safety backbone; the skill without them is a chainsaw.
- **Version policy:** Examples default to the latest stable release of each tool; the stated minimum is the newest LTS or last maintained major (see SKILL.md compatibility). On LTS transitions, bump versions in examples and the patch number.
- **Versioning:** Bump the patch for vocabulary-list updates, minor for a new artifact category, major if scoping defaults or the behavior-preservation invariant change. Keep SKILL.md and this file in sync.
