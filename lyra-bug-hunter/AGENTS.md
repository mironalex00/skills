# lyra-bug-hunter

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

Adversarial bug hunting built on four sequential roles — Recon, Hunter, Skeptic, Referee — with evidence discipline at every hand-off. The 2026 redesign is deliberately self-contained: no helper scripts, no subagent requirement, no external services; phase state persists in `.lyra/bug-hunter/` files so any agent in any runtime can run and resume the pipeline. Fix mode repairs confirmed bugs one commit at a time with per-fix verification and auto-revert.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Adversarial separation, honestly labeled** — every finding is challenged before confirmation: in an isolated sub-agent context when the runtime provides one, as a disciplined and *declared* self-review when it doesn't. The Skeptic pass is mandatory; removing it turns the skill into a linter with confidence issues, and claiming independence for a self-reviewed pass violates invariant 4.
2. **Evidence discipline** — a finding without a concrete runtime trigger is not a finding; a dismissal without counter-evidence is not a dismissal; a fix without verification is not a fix.
3. **Self-containment** — the pipeline must run with zero optional dependencies (no scripts, no subagents, no network). Anything added as tooling must degrade to agent-executed instructions.
4. **Honest reporting** — dismissed findings and partial coverage are always disclosed; the skill never claims completeness it didn't achieve.

---

## Rules

### 1. Recon classifies before the Hunter reads

**The rule:** Risk-ranked scanning (CRITICAL auth/money/parsing first) so truncated runs still covered what matters; tests are CONTEXT-ONLY.
**When editing:** Keep the five risk tiers and the "tests are read for intent, not hunted in" clause.
**Test for violation:** A hunt that reads files in directory order, or reports "bugs" inside test files.

### 2. Every finding needs a runtime trigger

**The rule:** A valid finding names file, lines, claim, and the concrete input/state that makes it misbehave. Style and architecture complaints are out of scope.
**When editing:** Keep the explicit rejection of "could be cleaner" findings and the pointer to lyra-de-slop for style.
**Test for violation:** A finding whose "trigger" is a quality judgement rather than an input or state.

### 3. The Skeptic reads code fresh and tries to kill the finding

**The rule:** Disproof requires evidence (upstream guard, type constraint, caller analysis, pinning test); survival requires recording the strongest objection that failed. Isolated sub-agent context when available; declared structured self-review otherwise.
**When editing:** Keep the "reads the surrounding code fresh" requirement and the two-tier separation honesty — a Skeptic that only re-reads the claim is a rubber stamp, and a self-review that calls itself independent is a lie.
**Test for violation:** A Skeptic verdict with no cited code evidence in either direction, or a report that doesn't say which separation tier ran.

### 4. Referee verdicts are CONFIRMED or PLAUSIBLE, and only CONFIRMED is auto-fixable

**The rule:** CONFIRMED needs a reachable failure scenario; PLAUSIBLE goes to manual review. Each CONFIRMED entry records executed vs static evidence, and Critical/High static-only confirmations escalate to an executed reproduction before auto-fix. Severity is exploitability × impact.
**When editing:** Keep the two-verdict model; adding a third verdict tier historically becomes a dumping ground that erodes evidence discipline. Executed/static is an evidence *annotation*, not a third verdict — keep it that way.
**Test for violation:** An auto-fix applied to a PLAUSIBLE finding, or a Critical fix applied off a static-only confirmation when a test runner was available.

### 5. Diff scopes scan full file contents

**The rule:** `--changed`, `--pr`, and `--staged` resolve to file lists, then scan whole files — a change often breaks code it didn't touch. Non-source files are filtered out.
**When editing:** Keep both halves: full-content scanning AND the non-source filter with its "nothing scannable" early exit.
**Test for violation:** A PR review that only reads added lines, or a scan that hunts in a lockfile.

### 6. Fix phase: runner precondition, baseline, branch, one bug per commit, verify, revert on regression

**The rule:** No test runner ⇒ fix mode degrades to `--dry-run` (stated, not silent); untrusted repos run their tests sandboxed; dirty trees stop the phase for a user decision (never silently stash); test baseline first, dedicated branch, minimal diffs in severity order, Critical/High static-only confirmations get executed reproductions before their fix, targeted test then full suite after each fix, auto-revert new failures as `FIX_REVERTED`.
**When editing:** Keep the ordering (precondition before baseline before branch before fix), the per-fix verification granularity, and the three safety guards — runner-degrade, sandbox-for-untrusted, ask-before-stash — each closes a distinct failure mode (fabricated verification, arbitrary code execution, data loss).
**Test for violation:** Two bugs fixed in one commit, a fix left in place after it introduced a test failure, a fix applied with no runner available, or a user's dirty tree stashed without asking.

### 7. Reports disclose dismissals and coverage

**The rule:** Confirmed first, then plausible, then dismissed with reasons; partial coverage is stated with counts; a clean report is presented as a good result.
**When editing:** Keep the dismissed section — it is what makes the Skeptic auditable.
**Test for violation:** A report that omits dismissed findings or claims "audit complete" with unscanned files.

### 8. Large codebases chunk and resume via `.lyra/bug-hunter/` state

**The rule:** Chunk by directory/service, persist recon + findings + completed-chunk notes to `.lyra/bug-hunter/`, resume runs skip done chunks. The directory is gitignored.
**When editing:** Keep state file-based and human-readable (markdown) — resumability across different agent runtimes depends on it.
**Test for violation:** A resumed run that re-scans completed chunks, or state that only lives in the conversation.

---

## Maintenance notes

- **Adding a rule:** It must work in a bare agent runtime (invariant 3) and preserve the finder/checker separation (invariant 1). Number it sequentially and update the Abstract if the pipeline shape changes.
- **Editing a rule:** The Hunter checklist in SKILL.md §2 is curated for runtime behavior — additions must be triggerable defects, not smells. Keep the scopes table and the non-source filter in sync with rule 5.
- **Deleting a rule:** Rules 2, 3, and 6 are the evidence backbone; deleting any of them requires a major version and a rewrite of the Abstract.
- **Version policy:** Examples default to the latest stable release of each tool; the stated minimum is the newest LTS or last maintained major (see SKILL.md compatibility). On LTS transitions, bump versions in examples and the patch number.
- **Versioning:** Bump the patch for clarifications, minor for new hunt categories or scopes, major if a pipeline role is added/removed or an invariant changes. Keep SKILL.md and this file in sync.
