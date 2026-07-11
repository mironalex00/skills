# lyra-ci-cd-automation

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

Pipeline rules for the commit-to-production path, 2026 edition: cost-ordered blocking gates, pinned-and-least-privileged CI (SHA pins, OIDC, no pull_request_target footguns), deterministic caches including registry-shared Podman layer cache, build-once/promote-by-digest with cosign sign-and-verify, artifact scan gates with SBOMs, one-way promotion, sub-five-minute tested rollback with migration discipline, sub-ten-minute loops, flake quarantine, and telemetry. Container builds are rootless podman — no privileged DinD anywhere in the skill.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Pipeline is the source of truth** — what didn't pass the pipeline didn't happen; no local-testing exceptions, no bypass paths.
2. **Fast, safe, reversible — together** — a rule that improves one by sacrificing another (e.g. skipping scans for speed) is a regression, not a trade-off.
3. **One artifact, one digest, one promotion path** — the digest that passed staging ships to prod; signing without deploy-time verification is decoration.
4. **CI itself is an attack surface** — every example carries pinning, least privilege, and OIDC; a convenience example that relaxes these is a vulnerability.

---

## Rules

### 1. Cost-ordered blocking gates

**The rule:** lint → typecheck → test → build → integration → E2E, each a required status check; no bypass mechanisms; broken gates get fixed, not routed around.
**When editing:** Keep the full bypass blacklist (`--no-verify`, skip-CI, `continue-on-error`, direct push) — each is a real failure mode.
**Test for violation:** A gate job with `continue-on-error: true`, or a stage order that runs build before lint.

### 2. Pin and permission everything

**The rule:** Actions by SHA, images by digest, toolchains by version; `permissions: contents: read` baseline; OIDC over long-lived secrets; never untrusted code with secrets in scope.
**When editing:** Keep the `pull_request_target` warning by name — it is the most-exploited CI misconfiguration in the wild.
**Test for violation:** `uses: some/action@v4` unpinned in an example, or a workflow without a `permissions:` block.

### 3. Deterministic caches, registry layer cache, rootless builds

**The rule:** Lockfile-hash keys only; podman `--cache-from/--cache-to` for layers; rootless podman on standard runners, no privileged DinD.
**When editing:** Keep the cross-reference to lyra-podman-images rules 3–4 — cache effectiveness is decided in the Containerfile, not the workflow.
**Test for violation:** A cache key containing a timestamp/run id, or a `docker:dind` privileged service in an example.

### 4. Build once, promote by digest, sign and verify

**The rule:** One artifact per commit; staging's digest is prod's digest; cosign keyless at build, verified at deploy; tags for humans, digests for machines.
**When editing:** Keep both cosign snippets — sign without verify is the half-implementation this rule exists to prevent.
**Test for violation:** A prod deploy that rebuilds, or signing guidance with no verification step.

### 5. Scan the artifact, SBOM the release, rescan on schedule

**The rule:** Image scan blocks promotion on fixable Critical/High; dependency audit in PR; SBOM attached; scheduled rescans of deployed artifacts.
**When editing:** Keep the "CVEs land after build time" rationale and the hand-off to lyra-security-supply-chain for response.
**Test for violation:** Scanning positioned as build-time-only.

### 6. Parallelize, path-filter, cancel superseded

**The rule:** Concurrent independent jobs, fail-fast matrices, path filters, concurrency groups with cancel-in-progress.
**When editing:** Keep concurrency-cancel labeled as the cheapest win — it's the one people skip.
**Test for violation:** A sequential pipeline of independent jobs, or docs-only PRs running E2E.

### 7. One-way promotion, human gate at prod, prod-shaped staging

**The rule:** Auto-staging on merge; tag + protected-environment approval for prod; staging uses the same artifact and deploy mechanism as prod.
**When editing:** Keep the "prod-shaped or it verifies nothing" clause and the lyra-podman-deploy cross-reference.
**Test for violation:** A staging environment that deploys differently than prod.

### 8. Rollback: automated, tested, < 5 minutes, migration-compatible

**The rule:** Previous digest on health-check failure; monthly staging drills; migrations separate from code and bidirectionally compatible one release.
**When editing:** Keep the migration clause — code rollback without schema compatibility is the way "tested rollback" fails in production anyway.
**Test for violation:** A rollback plan requiring human dashboard-watching, or migrations deployed atomically with code.

### 9. Ten-minute loop, attack the slowest stage

**The rule:** < 5 min PR feedback, < 10 min deploy; per-stage measurement; shard tests, cache builds.
**When editing:** Keep both thresholds and the "bypassed pipeline" consequence.
**Test for violation:** Speed guidance without per-stage measurement first.

### 10. Quarantine flakes in 24h, never retry-to-green

**The rule:** First flake quarantines; root-cause fix; regression test to exit; 2% auto-quarantine threshold.
**When editing:** Keep "retry-to-green teaches that red is negotiable" — the cultural rationale is the rule.
**Test for violation:** A retry block added to a known-flaky gate.

### 11. Telemetry with alert thresholds

**The rule:** Stage durations, pass/fail, digest, version, rollbacks; alerts at duration +20%, flake 2%, rollback 5%.
**When editing:** Keep the five fields and three thresholds in sync with any values cited elsewhere in the skill.
**Test for violation:** A pipeline example emitting nothing.

---

## Maintenance notes

- **Adding a rule:** Verify it holds beyond GitHub Actions (GitLab CI at minimum) and doesn't sacrifice one of fast/safe/reversible for another. Container examples must stay rootless podman.
- **Editing a rule:** The cross-references (lyra-podman-images 3–4, lyra-podman-deploy promotion mechanics, lyra-security-supply-chain CI section) are part of the contract — keep them pointing at real content.
- **Deleting a rule:** Rules 1, 4, and 8 are the safety backbone; rules 2 and 5 are the security backbone. Any removal is a major version.
- **Version policy:** Examples default to the latest stable release of each tool; the stated minimum is the newest LTS or last maintained major (see SKILL.md compatibility). On LTS transitions, bump versions in examples and the patch number.
- **Versioning:** Bump the patch for example/threshold refresh, minor for new rules, major if an invariant or the promotion model changes. Keep SKILL.md and this file in sync.
