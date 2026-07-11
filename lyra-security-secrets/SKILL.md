---
name: lyra-security-secrets
description: "Secrets management across the lifecycle: keeping credentials out of git, layered scanning (pre-commit/CI/history), storage hierarchy from platform stores down to .env hygiene, file-mounted secrets in containers, short-lived OIDC identities over static keys, scoping and rotation policy, and the leak-response runbook where rotation comes before cleanup. Use when handling API keys/tokens/passwords, setting up env config, wiring secrets into CI or containers, choosing auth between services, or responding to a leaked credential."
compatibility: "No tools required to apply the policies. Optional: gitleaks or trufflehog (scanning), a platform secret store or vault. Composes with lyra-security-appsec, lyra-security-supply-chain, lyra-ci-cd-automation, lyra-podman-deploy. Version policy: examples target the latest stable release of every tool; minimum supported is the newest LTS (or last maintained major), and features newer than the minimum are flagged inline."
---

# lyra-security-secrets

## What it does

Manages the full life of a credential: where it lives, how it reaches code, who can read it, how long it's valid, and what happens the day it leaks. Two facts drive every rule: **a secret that touches git history is public** — history rewrites don't un-leak it from forks, clones, caches, and scrapers that saw it first — and **the best secret is one that expires before it's worth stealing**. Everything here pushes toward fewer secrets, shorter lives, narrower scopes, and a rehearsed response.

## The rules

### 1. Nothing secret enters git — no exceptions, no "just for now"

Not in code, not in config, not in a committed `.env`, not base64'd (encoding is not encryption), not in a test fixture "because it's a test key". Scrapers index public commits within minutes, and private repos become public, get forked, and get cloned onto laptops. The commit is the leak; everything after is damage control. If it was committed, go to rule 9 — rotation first, cleanup second.

The one legitimate exception is **encrypted secrets in git** (SOPS with age/KMS, sealed-secrets): ciphertext is committed, keys live outside git, and a leaked repo leaks nothing usable. It's a real pattern for GitOps — adopt it as declared policy with key rotation and access control on the decryption keys, not as improvisation, and remember the rule still applies to the *plaintext*: a decrypted value pasted into a commit is a leak like any other.

### 2. Scan at four layers, because each covers the one before it failing

Pre-commit hook (gitleaks/trufflehog — catches the mistake before it's history), **server-side push protection** (GitHub/GitLab secret scanning that rejects the push — the only layer the leaker can't `--no-verify` past and the one that works from a laptop with no hooks installed), CI gate on every push (catches what push protection's patterns miss), and periodic full-history scans (catches what predates the tooling and validates that "old" findings were actually rotated). CI scanning without the earlier layers means every catch is already an incident.

### 3. `.env` hygiene is the floor, not the ceiling

`.env*` in `.gitignore` (with `!.env.example`); a committed `.env.example` documenting every variable with placeholder values — it's the schema that stops "works on my machine" and the reason nobody commits the real one "so the team has it". Real values arrive per environment: injected by the platform in prod, local-only files in dev, never shared through chat or a wiki page (that's just git with worse audit logs).

### 4. Storage hierarchy: managed stores down, env vars are the compatibility layer

Order of preference: **platform/workload secret store** (cloud secret manager, Vault, CI's secret store) with access control, audit, and versioning → **file-mounted secrets** in containers (`podman secret`, `/run/secrets/...`) → **environment variables** as the legacy-app fallback — env leaks through `inspect`, `/proc/<pid>/environ`, child processes, crash dumps, and error reporters that helpfully attach the environment. Config layers read secrets at startup from wherever the hierarchy provides; application code never knows which layer it was.

### 5. Prefer identities over secrets at all

The strongest secret management is not needing the secret: OIDC/workload identity between CI and cloud (lyra-ci-cd-automation rule 2), IAM roles between services, mTLS with short-lived certs. Where a credential must exist, prefer **dynamic secrets** — Vault-style engines that mint per-lease database/cloud credentials on demand and expire them in minutes, turning "rotate the DB password" into a non-event because there is no long-lived DB password. A static key is a liability that must be stored, scoped, rotated, and leaked; a federated identity or short lease is minted per use, expires in minutes, and names its holder in the audit log. Every long-lived credential in the inventory should have a written reason it can't be an identity or a lease yet.

### 6. Scope like it will leak — because you're planning for when it does

Per environment (CI secrets ≠ staging ≠ prod — CI never holds prod credentials), per service, per permission (read-only tokens for readers; fine-grained personal access tokens scoped to one repo and one permission over classic all-repos god-tokens), with expiry set at creation. Blast radius is decided at issuance time, not incident time: a leaked read-only staging token is a Tuesday; a leaked org-admin token is a disclosure.

### 7. Rotation is scheduled, not aspirational

Calendar-driven per class (highest-value first), event-driven always: on departure of anyone who had access, on any suspicion, on any tooling compromise (lyra-security-supply-chain rule 10 — the dependency ran in CI with your env). Rotation must be *rehearsed and boring* — dual-key overlap (issue new, deploy, revoke old) so it's a non-event; if rotating a credential is scary, that's the finding, and it means you can't rotate under incident pressure either.

### 8. Secrets stay out of logs, errors, URLs, and prompts

Never log a secret or anything derived from it; never put tokens in URLs (they land in access logs, proxies, referrers, browser history); redact known-shape values in the logging layer as the backstop, but don't rely on masking — platforms mask exact known values, not derivations or substrings. Error reporters and APM agents get an explicit scrub list. And 2026's addition: secrets pasted into LLM prompts, agent transcripts, or MCP tool configs are disclosures to whatever retention that pipeline has — inject at execution, keep them out of the conversation.

### 9. The leak runbook: rotate first, clean up second

(1) **Rotate/revoke now** — the credential is compromised from the moment of exposure, not the moment of cleanup; (2) **assess use** — audit logs for access between exposure and revocation; (3) **then** clean up the artifact (history rewrite, cache purge) knowing it's cosmetic — assume copies exist; (4) fix the mechanism that let it in (missing hook? missing scan? secret that should've been an identity?); (5) write it down — time-to-revoke is the metric that matters. Cleanup-first responses are the classic error: the token stays live while the team argues with `git filter-repo`.

### 10. Inventory or it isn't managed

A list of every credential: what it opens, who/what holds it, scope, issue date, expiry, rotation owner. Unowned secrets don't get rotated; forgotten secrets don't get revoked on departure; and the incident drill's "rotate everything the compromised code could reach" is only answerable from an inventory. The secret store's contents are the natural inventory — which is one more reason everything lives there and not in a `.env` on a server.

---

_Part of the [skill collection](../README.md)._
