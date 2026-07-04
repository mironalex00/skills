# lyra-ci-cd

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

Language-agnostic CI/CD rules across GitHub Actions, GitLab CI, and CircleCI for pipelines that stay fast, safe, and reversible. The pipeline is the source of truth: stages gate each other in cost order, quality gates block merge, promotion moves one artifact through dev → staging → prod, and every deploy has a tested rollback. The three Lyra gate skills plug in as non-optional stages.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Pipeline is the source of truth** — what's not in the pipeline didn't happen; "I tested it locally" is not a gate.
2. **One artifact, one promotion path** — dev → staging → prod, the same artifact that passed staging ships to prod, never rebuilt per environment.
3. **Reversibility** — every deploy has an automated, tested rollback under five minutes; an untested rollback is not a rollback.

---

## Rules

### 1. Stages gate each other in cost order: lint → type-check → test → build → deploy

**The rule:** Cheap checks run first so a two-second lint failure kills the pipeline before a two-minute build; each stage depends on the previous, and no stage runs until its gate passes.
**When editing:** Keep the stage order and the `needs:`/`requires:` dependency wiring; the order is load-bearing.
**Test for violation:** A `build` job that runs before `lint`, or a `deploy` that runs regardless of `test` failure.

### 2. Quality gates block merge — no bypass, no override

**The rule:** Every PR passes lint, type-check, and the full test suite before merge — no `--no-verify`, no "skip CI" labels, no `allow_failure: true` on gates, no "I tested it locally." Branch protection enforces required status checks and blocks direct commits and force-push to main.
**When editing:** Keep the full list of bypass anti-patterns; each is a real failure mode.
**Test for violation:** A `--no-verify` commit, a skip-CI label, or `allow_failure: true` on a gate job.

### 3. Promotion is one-way: dev → staging → prod, same artifact

**The rule:** Staging is automatic on merge to main; prod requires a version tag plus human approval on a protected environment — the artifact that passed staging is the one that ships, never rebuilt for a different environment, never deployed from a laptop.
**When editing:** Keep both constraints — same artifact AND protected env for prod.
**Test for violation:** A prod deploy that rebuilds from source, or a deploy triggered from a developer machine.

### 4. Match deployment strategy to risk

**The rule:** Rolling for stateless backward-compatible changes, blue-green for zero-downtime instant rollback, canary for high-risk uncertain impact (5% → 25% → 50% → 100% with health checks at each stage); blue-green keeps the previous environment warm for 30 minutes after cutover.
**When editing:** Keep the three-row strategy table and the canary step percentages.
**Test for violation:** A blue-green deploy for a stateless service, or a canary without health checks at each step.

### 5. Secrets are injected, never committed, never logged

**The rule:** Secrets come from the platform secret store (GitHub Secrets, GitLab masked+protected variables, CircleCI Contexts), scoped per environment and rotated quarterly — never `echo` one or pass it as a CLI argument, since platforms mask known values but not derived ones, and arguments show up in the process list.
**When editing:** Keep the "derived values aren't masked" and "process list" details; they're the non-obvious failure modes.
**Test for violation:** A secret in a committed file, an `echo` of a secret, or a secret passed as a CLI argument.

### 6. Cache everything cacheable with deterministic keys

**The rule:** Cache dependencies keyed on the lockfile hash, build artifacts keyed on inputs, and Docker layers keyed on the Dockerfile plus lockfile — never use timestamp keys, they invalidate for no reason and rebuild from scratch.
**When editing:** Keep the "never timestamp keys" warning; it's the common mistake.
**Test for violation:** A cache key containing a timestamp or `run_id`.

### 7. Parallelize independent work

**The rule:** Run independent jobs in parallel and use matrix builds for multi-version, multi-platform testing — a 12-minute sequential pipeline often becomes a 3-minute parallel one. Keep `fail-fast: true` so a failure cancels the rest of the matrix.
**When editing:** Keep the 12min → 3min example and the `fail-fast` qualifier.
**Test for violation:** A sequential pipeline where jobs have no dependencies on each other.

### 8. Every deploy has an automated, tested rollback under five minutes

**The rule:** If you cannot roll back in under five minutes, the deployment strategy is wrong — rollback runs on health-check failure, not human intervention. Run a rollback drill in staging monthly; an untested rollback is not a rollback.
**When editing:** Keep the five-minute threshold and the monthly drill cadence.
**Test for violation:** A deploy with no automated rollback, or a rollback that's never been tested.

### 9. Keep pipelines under ten minutes

**The rule:** Target PR feedback under five minutes and full deploy under ten — measure per-stage duration and attack the slowest stage first, usually the test suite (shard it) or the build (cache it). A 15-minute pipeline is one people avoid running.
**When editing:** Keep both thresholds (5min PR, 10min deploy) and the "attack the slowest stage" guidance.
**Test for violation:** A pipeline over ten minutes with no per-stage timing data.

### 10. Quarantine flaky gates within 24 hours

**The rule:** A flaky gate is no gate — quarantine on first flake, fix the root cause, un-quarantine with a regression test that reproduces it; never retry-to-green, track flake rate, and auto-quarantine anything above 2%.
**When editing:** Keep the 24-hour window, the 2% threshold, and the "never retry-to-green" rule.
**Test for violation:** A gate that's been retried-to-green with no quarantine or issue filed.

### 11. Emit telemetry on every run

**The rule:** Each pipeline emits duration per stage, pass/fail per stage, artifact hash, deploy version, and rollback events — alert on duration regression > 20%, flake rate > 2%, or rollback rate > 5%, the leading indicators that the pipeline is quietly going wrong.
**When editing:** Keep the five telemetry fields and the three alert thresholds.
**Test for violation:** A pipeline with no telemetry emission, or missing alert thresholds.

---

## Maintenance notes

- **Adding a rule:** Number it sequentially, verify it holds across all three platforms (GitHub Actions, GitLab CI, CircleCI) — the skill is language- and platform-agnostic by design. Update the Abstract if the rule count changes.
- **Editing a rule:** Preserve the cross-platform framing — a rule that only works on GitHub Actions belongs in a platform-specific skill, not here. The Lyra gate table (lyra-tdd, lyra-code-review, lyra-e2e-testing) is part of the contract; keep the stage mappings aligned with rules 1 and 2.
- **Deleting a rule:** Check whether the gate table, the promotion path (rule 3), or the rollback invariant depends on it; rules 2, 3, and 8 are the safety backbone.
- **Versioning:** Bump the patch for clarifications, minor for new rules, major if a rule is removed or the source-of-truth invariant changes. Keep SKILL.md and this file in sync.