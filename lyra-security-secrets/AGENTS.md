# lyra-security-secrets

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

Lifecycle management of credentials built on two facts — a secret in git history is public regardless of cleanup, and the best secret expires before it's worth stealing. Rules cover prevention (git prohibition, three-layer scanning, .env hygiene), storage (managed stores → file mounts → env fallback), reduction (identities over secrets), containment (issuance-time scoping), maintenance (rehearsed dual-key rotation), exposure control (logs, URLs, LLM prompts), response (rotate-first runbook), and the inventory that makes everything else answerable.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Committed = compromised** — no guidance ever treats history cleanup as un-leaking; rotation always precedes cleanup.
2. **Fewer, shorter, narrower** — every rule pushes toward fewer secrets (identities), shorter lifetimes (expiry, federation), narrower scopes (issuance-time blast radius).
3. **Layered, because layers fail** — scanning, masking, and storage guidance always assume the layer above missed; single-layer sufficiency claims are defects.
4. **Answerable** — who holds what, what it opens, when it rotates: if the inventory can't answer, the practice isn't happening.

---

## Rules

### 1. Nothing secret enters git

**The rule:** Not code, config, committed .env, base64, or test fixtures; the commit is the leak; committed secrets route to the runbook (rule 9). The declared exception: encrypted-secrets-in-git (SOPS/age/KMS, sealed-secrets) as adopted policy, with keys outside git and the plaintext still governed by this rule.
**When editing:** Keep "encoding is not encryption" and the test-key clause — both are the actual arguments people make while committing secrets. Keep the SOPS exception explicit and bounded — prohibiting a mainstream GitOps pattern by omission costs the rule its credibility, and unbounding the exception costs it its teeth.
**Test for violation:** Any flow where a real credential is committed with a plan to remove it later, or ad-hoc "encrypted" commits outside a declared SOPS-style policy.

### 2. Four scanning layers

**The rule:** Pre-commit + server-side push protection + CI gate + periodic full-history, each named with the failure of the layer before it covers. Push protection is the only layer the leaker can't bypass locally.
**When editing:** Keep the failure-coverage reasoning per layer; a bare "use gitleaks" loses why four placements exist. Push protection stays its own layer — never fold it into "CI": it is the only placement the leaker can't bypass from their own machine.
**Test for violation:** A setup with CI scanning only, presented as complete, or push protection omitted on a platform that offers it.

### 3. .env hygiene with a committed example

**The rule:** `.env*` gitignored, `.env.example` committed as the schema; real values injected per environment, never shared via chat/wiki.
**When editing:** Keep the framing of `.env.example` as *the reason nobody commits the real one* — it's a prevention control, not documentation nicety.
**Test for violation:** A project scaffold without the example file, or values distributed through a chat channel.

### 4. Storage hierarchy, env as fallback

**The rule:** Managed store → file-mounted container secrets → env vars (with the five env leak channels enumerated); app code stays layer-agnostic.
**When editing:** Keep the leak-channel list (inspect, /proc, children, dumps, error reporters) in sync with lyra-podman-deploy rule 8 — they argue the same point from two skills.
**Test for violation:** Env vars recommended as the default rather than the fallback.

### 5. Identities over secrets

**The rule:** OIDC/workload identity/IAM/mTLS so the static secret doesn't exist; every long-lived credential carries a written reason it can't be an identity yet.
**When editing:** Keep the "written reason" requirement — it's what turns preference into policy.
**Test for violation:** A new static cloud key minted where the platform supports federation.

### 6. Scope at issuance for the leak you're planning for

**The rule:** Per environment (CI never holds prod), per service, per permission, expiry at creation; blast radius is an issuance-time decision.
**When editing:** Keep "CI never holds prod credentials" explicit — it's the highest-value single line in the rule.
**Test for violation:** A shared token across environments, or an org-wide token where a scoped one exists.

### 7. Rotation scheduled and rehearsed

**The rule:** Calendar per class + event-driven (departure, suspicion, tooling compromise); dual-key overlap makes it boring; scary rotation is itself a finding.
**When editing:** Keep the supply-chain rule 10 cross-reference (dependency compromise ⇒ rotate CI-reachable credentials) — the two runbooks interlock.
**Test for violation:** A rotation that requires downtime, or none scheduled at all.

### 8. Out of logs, URLs, and prompts

**The rule:** No secrets or derivations logged; no tokens in URLs; scrub lists for reporters/APM; masking is a backstop not a strategy; secrets injected at execution, never pasted into LLM prompts/transcripts/tool configs.
**When editing:** Keep the LLM-pipeline clause — it's the 2026 addition and the exposure class existing guidance misses.
**Test for violation:** A token in a query string, or a credential visible in an agent conversation.

### 9. Rotate first, clean up second

**The rule:** Revoke → assess use from audit logs → cosmetic cleanup → fix the admitting mechanism → record time-to-revoke.
**When editing:** Keep the order and the "cleanup-first is the classic error" warning; keep time-to-revoke as the named metric.
**Test for violation:** A response that opens with `git filter-repo` while the token is live.

### 10. Inventory or it isn't managed

**The rule:** Every credential: opens-what, held-by, scope, dates, rotation owner; the secret store is the natural inventory.
**When editing:** Keep the tie-back to rules 6, 7, and 9 — the inventory is what makes each of them executable.
**Test for violation:** A departure offboarding that can't list what to rotate.

---

## Maintenance notes

- **Adding a rule:** It must serve fewer/shorter/narrower (invariant 2) or answerability (invariant 4), and state which layer failure it covers.
- **Editing a rule:** The env-leak-channel list (rule 4) and the runbook order (rule 9) are shared contracts with lyra-podman-deploy and lyra-security-supply-chain — verify both ends on any change. Tool names (gitleaks, trufflehog) are examples, not dependencies.
- **Deleting a rule:** Rules 1 and 9 carry invariant 1; rule 5 carries invariant 2's strongest form. Removal is a major version.
- **Version policy:** Examples default to the latest stable release of each tool; the stated minimum is the newest LTS or last maintained major (see SKILL.md compatibility). On LTS transitions, bump versions in examples and the patch number.
- **Versioning:** Bump the patch for tool/example refresh, minor for a new lifecycle stage, major if an invariant or the rotate-before-cleanup order changes. Keep SKILL.md and this file in sync.
