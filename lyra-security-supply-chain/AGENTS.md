# lyra-security-supply-chain

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

Supply-chain security as mechanism over vigilance: enforced-and-reviewed lockfiles, contained install scripts, release-age cooldown, deliberate adoption, digest/SHA pinning of images and actions, SBOM inventory, keyless signing with deploy-time verification and provenance, CI treated as the crown-jewel target, single-door registry hygiene, and a rehearsed incident drill. Calibrated against the real attack patterns of the 2020s (typosquats, maintainer-account worms, install-script exfiltration, xz-style build-input backdoors) without depending on any single incident's details.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Mechanism over vigilance** — every rule is an enforced control (frozen install, ignored scripts, cooldown, pin, verification gate), never "review carefully" as the only barrier.
2. **Verification closes every loop** — pinning without diff review, signing without deploy-time verification, SBOMs nobody can query: each is the half-measure the skill exists to prevent.
3. **Inventory answers in minutes** — the SBOM/registry/audit infrastructure must support the incident drill; a rule that generates artifacts nobody can query violates this.
4. **Defensive only** — attack patterns are described to justify controls, never operationalized.

---

## Rules

### 1. Lockfiles are law

**The rule:** Committed, frozen in CI across ecosystems, and reviewed — unexplained package changes and integrity-hash churn are findings.
**When editing:** Keep the review clause; "lockfile committed" without diff review is the common cargo-cult version.
**Test for violation:** CI running a non-frozen install, or lockfile diffs waved through as noise.

### 2. Install scripts contained

**The rule:** Scripts ignored by default, allowlisted where genuinely needed; dependency code still runs at build/test, so least-privileged CI and sandboxes back it up.
**When editing:** Keep the honest scope note (containment at install ≠ containment at runtime) — overclaiming here breeds false safety.
**Test for violation:** A blanket `--ignore-scripts` presented as complete protection, or scripts enabled globally for one package's sake.

### 3. Cooldown on new releases

**The rule:** Mandatory release age (order of 7–14 days) with a fast-track exception for reviewed security fixes.
**When editing:** Keep the reasoning (compromised versions get yanked within days) and the exception — a cooldown with no security-fix bypass gets disabled the first urgent CVE.
**Test for violation:** Auto-merge of day-old releases, or a cooldown policy without the exception path.

### 4. Adoption is a decision

**The rule:** Stdlib-first, maintenance and tree checks, typosquat verification, fewer-bigger-boring over micro-packages, grouped deliberate updates.
**When editing:** Keep "every package is a maintainer account that can be phished" — it reframes dependency count as attack surface.
**Test for violation:** A new micro-dependency added for functionality the stdlib provides.

### 5. Images, actions, toolchains are dependencies

**The rule:** Digest-pinned FROM, SHA-pinned actions, versioned toolchains, bot-maintained bumps — and the AI inputs: MCP servers vetted/pinned/cooldowned like packages, models and datasets pinned by hash, all inventoried in the SBOM.
**When editing:** Keep both cross-references (lyra-podman-images rule 2, lyra-ci-cd-automation rule 2) — this rule is the policy; those are the implementations. Keep the MCP clause current; it's the fastest-moving item in the skill.
**Test for violation:** A floating tag or `@v4` ref anywhere in recommended config, or an MCP server added to an agent config without version pinning.

### 6. SBOM every release, scan continuously

**The rule:** Generated at build, attached to releases, queryable across *deployed* versions; continuous rescans against fresh feeds.
**When editing:** Keep the deployed-vs-building distinction — SBOMs of images nobody runs answer nothing.
**Test for violation:** SBOM generation with no retention/query story, or scanning framed as build-time-only.

### 7. Sign with verification as the point

**The rule:** Keyless signing at build, signature + identity verified at deploy — including host-level enforcement via podman's `/etc/containers/policy.json` (unsigned images refuse to pull) — plus provenance attestations for the build path.
**When editing:** Keep "verification is the point" framing and the identity check (not just "a valid signature exists"). Keep policy.json named — it's the suite's only host-side verification mechanism and pairs with, not replaces, the CI verify step.
**Test for violation:** Signing guidance whose deploy step doesn't verify.

### 8. CI hardened as the crown-jewel target

**The rule:** Least-privilege tokens, OIDC, SHA pins, fork-PR secret isolation, protected workflow files, and mechanized egress control (default-deny/allowlisted runner egress with alerts — not log-file "awareness").
**When editing:** Keep the "why" framing (CI holds signing identity + registry write) distinct from lyra-ci-cd-automation's "how"; drift between the two lists is the maintenance risk.
**Test for violation:** A workflow file editable without review while being a required check.

### 9. One trusted registry door

**The rule:** Pull-through proxy/private registry as allowlist + cache + audit point; per-ecosystem registry scoping; internal namespaces claimed publicly against dependency confusion.
**When editing:** Keep the dependency-confusion mechanism (gap between internal names and public registries) explicit.
**Test for violation:** Internal package names unclaimed publicly, or resolvers allowed to fall through to arbitrary hosts.

### 10. The incident drill

**The rule:** SBOM query → contain (pin known-good, freeze) → rotate everything the code could reach → audit what it did → postmortem into a mechanism.
**When editing:** Keep the order (inventory before containment before rotation) and the lyra-security-secrets rule 7 hand-off; keep the closing principle — fixes are mechanisms, not resolutions.
**Test for violation:** A response plan that starts with rotation before knowing scope, or ends without a mechanism change.

---

## Maintenance notes

- **Adding a rule:** It must be a mechanism (enforceable, auditable), ecosystem-plural (npm/pnpm examples fine, npm-only logic not), and support the incident drill's minutes-not-weeks promise.
- **Editing a rule:** Attack references stay pattern-level (worm-speed publication, install-script exfiltration) rather than incident-named where possible — patterns age; incident details rot. Keep cross-references to lyra-ci-cd-automation, lyra-podman-images, and lyra-security-secrets pointing at real rules.
- **Deleting a rule:** Rules 1, 7, and 10 carry invariants 1–3 respectively; removal is a major version.
- **Version policy:** Examples default to the latest stable release of each tool; the stated minimum is the newest LTS or last maintained major (see SKILL.md compatibility). On LTS transitions, bump versions in examples and the patch number.
- **Versioning:** Bump the patch for tool/flag refresh, minor for a new control, major if an invariant or the mechanism-over-vigilance frame changes. Keep SKILL.md and this file in sync.
