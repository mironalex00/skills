# lyra-security-appsec

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

Defensive application security organized around the source-to-sink model: barriers at trust boundaries (validation), parameterized sinks (injection family), server-side deny-by-default object-level authorization, solved-problem authentication, SSRF/upload/error/header/crypto discipline, and a review methodology that walks attacker-influenced paths and ranks by exploitability × impact. OWASP/ASVS-grounded but edition-independent. Strictly defensive: the skill teaches placing and reviewing barriers, never operating attacks.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Source-to-sink is the frame** — every rule is a barrier on that path; additions that don't fit the frame (compliance trivia, tool advertisements) don't belong.
2. **Parameterized APIs over cleverer escaping** — the skill never teaches sanitization where a structural API exists.
3. **Deny-by-default** — authorization, error paths, and CORS all fail closed; any example that fails open is a defect.
4. **Defensive only** — findings are described by attacker capability, but the skill contains no exploitation tooling or offensive procedure.

---

## Rules

### 1. Boundary validation: allowlist, canonicalize-then-validate

**The rule:** Schema validation at the edge, allowlists over blocklists, length limits, canonicalization before validation, HMAC verification (timing-safe, replay-windowed) on webhooks before parsing; internal code trusts typed inputs.
**When editing:** Keep the `..%2f` decode-order example, the webhook clause, and the lyra-de-slop cross-reference (internal re-validation is noise, boundary omission is a breach).
**Test for violation:** Guidance validating before decoding, a blocklist presented as sufficient, or a webhook handler that parses before verifying.

### 2. Parameterize every sink

**The rule:** Bound parameters, exec-with-arg-arrays, path-join + prefix check after resolution, framework escaping with justified-and-sanitized exceptions, user data never concatenated into template source, data-only deserialization formats with type allowlists where native formats are unavoidable.
**When editing:** Keep the closing sentence ("the parameterized API, not a cleverer escape function") — it's the rule's spine. The sink list must stay complete: SQL, shell, path, HTML, templates, deserializers, XML parsers (XXE).
**Test for violation:** A recommended escape/sanitize wrapper where a parameterized API exists, or native object deserialization of attacker bytes without an allowlist.

### 3. Authorization: server-side, deny-by-default, object-level

**The rule:** Unstated = denied; object-level ownership checks (IDOR/BOLA); client-supplied identity is a claim until verified; UI hiding isn't access control.
**When editing:** Keep IDOR/BOLA named and flagged as the most common real-world API hole — reviewers under-weight it exactly because it's boring.
**Test for violation:** An endpoint check that stops at "authenticated", or a tenant id read from the request body.

### 4. Auth has solved answers

**The rule:** argon2id/bcrypt, session regeneration + server-side invalidation + cookie flags, JWT algorithm allowlist + expiry + revocation story, rate-limited auth endpoints.
**When editing:** Keep "a JWT you can't revoke is a bearer token for its full lifetime" — it's the design consequence people miss.
**Test for violation:** A fast hash for passwords, or JWT guidance without revocation.

### 5. SSRF guards on user-influenced outbound requests

**The rule:** Destination allowlists; otherwise resolve-and-reject private/link-local/metadata ranges, pin resolved IPs (rebinding), control redirects.
**When editing:** Keep the metadata-endpoint mention — cloud credential theft is what elevates SSRF from quirk to critical.
**Test for violation:** URL validation done on the string without resolving the address.

### 6. Uploads: content-validated, quarantined, renamed

**The rule:** Content sniffing over extension/MIME, size limits, server-generated names, storage outside the webroot, non-executable serving, hardened image processing.
**When editing:** Keep the decompression-bomb note — upload DoS is routinely forgotten next to upload RCE.
**Test for violation:** An upload flow keying anything off the client-supplied filename.

### 7. Errors boring outside, rich inside, failing closed

**The rule:** Generic client messages + correlation ids; full context in logs minus secrets/PII; authz exceptions deny; constant-time/response where enumeration matters.
**When editing:** Keep "an exception in an authz check denies" — fail-open error handling is the classic subtle breach.
**Test for violation:** A catch block around an authz check that continues on error.

### 8. Headers, CORS, rate limits, mass assignment — on by default

**The rule:** CSP/HSTS/nosniff/frame denial as baseline; CORS explicit allowlist (reflecting Origin = `*` with extra steps); CSRF tokens (or custom-header checks) for cookie-authenticated state changes — SameSite narrows, doesn't close; rate + size limits on unauthenticated/expensive paths; DTO allowlists, never spread request bodies into models.
**When editing:** Keep mass assignment in this rule with its `role: "admin"` example, and keep CSRF explicit — "SameSite handles it" is the modern version of forgetting it; neither has another home.
**Test for violation:** A handler spreading `req.body` into a persistence call, or a cookie-authenticated mutation with no CSRF defense beyond SameSite.

### 9. Crypto: boring, modern, delegated

**The rule:** TLS everywhere, CSPRNG only, AEAD via vetted libraries, no homemade constructions; key handling deferred to lyra-security-secrets.
**When editing:** Keep the deferral — key storage guidance duplicated here will drift from lyra-security-secrets.
**Test for violation:** `Math.random` in anything security-relevant, or inline key-management advice.

### 10. LLM features are a source and a sink at once

**The rule:** Prompt injection = untrusted input reaching a privileged sink; everything the model reads can carry instructions, so model output is untrusted input; contain (tool allowlists, human gates on irreversible actions, no secrets in prompts) rather than sanitize; model-emitted markup rendered to others is an XSS source under rule 2.
**When editing:** Keep "contain instead of sanitize" — filtering injection is the losing strategy this rule exists to preempt; keep the lyra-security-secrets rule 8 cross-reference.
**Test for violation:** Model output passed to eval/shell/unparameterized query, or an injection defense built solely on prompt filtering.

### 11. Review = walk the paths, verify like lyra-bug-hunter, rank by exploitability × impact

**The rule:** Enumerate sources and sinks (LLM surfaces included), walk paths for barriers, findings need concrete attacker input + achieved effect, fixes land with regression tests encoding the attack.
**When editing:** Keep the lyra-bug-hunter evidence cross-reference — it's what keeps reviews from producing unverifiable FUD.
**Test for violation:** A finding with no attacker input, or a severity assigned without both factors.

---

## Maintenance notes

- **Adding a rule:** It must be a barrier placeable in code, framed source-to-sink, defensive, and framework-agnostic (TypeScript examples welcome, TypeScript dependence not).
- **Editing a rule:** The source and sink enumerations in "What it does" are the review methodology's input — keep them synchronized with the sinks covered by rule 2 and the sources implied by rules 1, 5, 6.
- **Deleting a rule:** Rules 1–3 are the injection+authz core covering the large majority of real-world findings; removal is a major version.
- **Version policy:** Examples default to the latest stable release of each tool; the stated minimum is the newest LTS or last maintained major (see SKILL.md compatibility). On LTS transitions, bump versions in examples and the patch number.
- **Versioning:** Bump the patch for example refresh, minor for a new barrier rule, major if the source-to-sink frame or the defensive-only invariant changes. Keep SKILL.md and this file in sync.
