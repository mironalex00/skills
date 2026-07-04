# lyra-api-design

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

Design APIs as contracts, not afterthoughts — covering resource modeling, HTTP semantics, OpenAPI-first contracts, pagination, errors, auth, and backwards compatibility across REST, GraphQL, and gRPC. Each rule states the consequence of breaking it and ships with a bad/good pair, because abstract advice doesn't survive contact with real clients. Breaking changes are a last resort; developer experience is a design requirement.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **API as contract** — the OpenAPI spec is the source of truth; drift between spec and behavior is a bug that CI should catch.
2. **Backwards compatibility by default** — breaking changes are a last resort with a version bump, a migration guide, and a sunset.
3. **Bad/good pairs anchor each rule** — abstract advice ("use proper status codes") doesn't survive contact with real clients without an example.

---

## Rules

### 1. Resources are nouns, not verbs

**The rule:** A URL names a thing — a user, an order, an invoice — not an action; a verb in the URL means you designed an RPC and labeled it REST.
**When editing:** Keep the `POST /api/createOrder` → `POST /api/orders` pair; it's the canonical teaching example.
**Test for violation:** Any URL path containing `create`, `update`, `delete`, or `get` as a segment.

### 2. Plural nouns, consistent casing, shallow nesting

**The rule:** Use `/users`, `/users/{id}`, `/users/{id}/orders`; pick snake_case or kebab-case and stick to it; stop nesting at one level — flatten deep chains to a top-level resource scoped by query param.
**When editing:** Keep the "flatten to `/orders/{id}/items` and scope by query param" guidance.
**Test for violation:** A URL with three or more levels of nesting.

### 3. HTTP methods are the verbs

**The rule:** GET reads, POST creates, PUT replaces, PATCH patches, DELETE removes — if you're writing `/users/{id}/update`, the method is wrong.
**When editing:** Keep the method-to-action mapping; it's the REST foundation.
**Test for violation:** A `POST` to a path ending in `/update` or `/delete`.

### 4. Status codes encode outcomes

**The rule:** 2xx success, 4xx client problem, 5xx server problem — proxies, monitors, and clients branch on status first, so a 200 with an error body breaks every layer above your code.
**When editing:** Keep the `200 OK { "error": "not found" }` anti-pattern; it's the failure mode this rule prevents.
**Test for violation:** Any 200 response with an `error` field in the body.

### 5. Use the full status vocabulary

**The rule:** Don't compress every client error to 400 — 409 for duplicates, 422 for valid JSON with bad semantics, 401 vs 403 for missing auth vs missing permission, 429 for rate limits, 410 for gone.
**When editing:** Keep the specific code list; precision is what lets clients branch correctly.
**Test for violation:** A 400 for a duplicate resource that should be 409.

### 6. The spec is the source of truth

**The rule:** Write or generate `openapi.yaml` first — code validates against it, clients generate from it, every operation declares success and error responses; drift is a bug.
**When editing:** Keep the "code first, paste a stale Swagger doc later" anti-pattern.
**Test for violation:** A repo with code but no `openapi.yaml`, or a spec that CI doesn't validate against live behavior.

### 7. Every field has a type, constraint, and description

**The rule:** JSON Schema with `required`, `format`, `minimum`, `maximum`, `pattern`, `maxLength` for every field; use the right JSON type (`"price": 9.99`, not `"price": "9.99"`); no `any`.
**When editing:** Keep the "9.99 not '9.99'" example; type discipline is the point.
**Test for violation:** A schema field with type `any`, or a number sent as a string.

### 8. Every collection is paginated, prefer cursors

**The rule:** An unbounded `GET /api/users` returning 100k rows is a DoS vector and a memory bomb — enforce default and max page size, prefer cursor pagination over offset.
**When editing:** Keep the offset-shifts-on-insert explanation; it's why cursors win.
**Test for violation:** A `GET /api/users` with no `limit` param.

### 9. Filter, sort, project via allowlisted params

**The rule:** `?status=active&sort=-created_at&fields=id,name` is fine; accepting raw DB column names from the client is not — define allowed fields in the schema.
**When editing:** Keep the "leaks internals and opens injection paths" consequence.
**Test for violation:** A query handler that passes `req.query.sort` directly to an `ORDER BY` clause.

### 10. One error envelope, everywhere

**The rule:** Every error shares the same shape — `code` to branch, `message` for humans, `details`, `requestId`; a single envelope means clients write that logic once.
**When editing:** Keep the JSON envelope example; the four fields are the contract.
**Test for violation:** Two endpoints with different error response shapes.

### 11. Error messages are actionable

**The rule:** Name the field, the constraint violated, and the received value when safe — "email must be a valid address; received 'foo@bar'" gets the next request right.
**When editing:** Keep the actionable-message example; "Invalid input" is the anti-pattern.
**Test for violation:** An error message that doesn't name the field or the constraint.

### 12. Auth is explicit and rate limits are visible

**The rule:** Every endpoint declares its auth scheme in OpenAPI (bearer, API key, mTLS, OAuth2 scope); rate-limited requests return 429 with `Retry-After` and `X-RateLimit-*` headers.
**When editing:** Keep both halves — auth declaration AND visible rate limits; a silent throttle causes confusion, a 429 without retry guidance causes retry storms.
**Test for violation:** An endpoint with no auth scheme in the spec, or a 429 without `Retry-After`.

### 13. Idempotency keys for retried writes

**The rule:** POST and PUT that a client may retry should accept an `Idempotency-Key` header, with the server deduping by key — without it, network retries create duplicate orders, charges, and emails.
**When editing:** Keep the duplicate-charge consequence; it's why the rule exists.
**Test for violation:** A `POST /api/charges` with no idempotency key support.

### 14. Expand, don't break

**The rule:** Safe changes add optional fields, new endpoints, or new optional params; removing a field, changing a type, making optional required, or changing a status code breaks every client.
**When editing:** Keep the `name` → `fullName` example with the deprecation path.
**Test for violation:** A field rename without a deprecated alias, or an optional field made required.

### 15. Version at the boundary, deprecate with a sunset

**The rule:** One version per API surface, bumped atomically (`/v1/...` or `Accept: application/vnd.api+json;version=1`); deprecating emits `Deprecation` and `Sunset` headers with a migration guide and keeps old behavior alive until the sunset date.
**When editing:** Keep the "410 Gone with no warning is a betrayal, not a deprecation" line; it sets the tone.
**Test for violation:** A removed endpoint with no `Deprecation`/`Sunset` headers and no migration doc.

### 16. Time-to-first-call is the metric; docs and SDKs are generated

**The rule:** If a new dev can't make a successful authenticated call in 15 minutes, the DX is broken — render OpenAPI into interactive try-it-out docs and generate client SDKs from the spec; hand-maintained SDKs drift.
**When editing:** Keep the 15-minute threshold and the "hand-maintained SDKs drift" note.
**Test for violation:** A hand-written SDK, or docs that don't match the spec.

---

## Maintenance notes

- **Adding a rule:** Number it sequentially, ship it with a bad/good pair, and verify it doesn't overlap with an existing rule. Update the Abstract's rule count.
- **Editing a rule:** Preserve the bad/good example — the example is what makes the rule survive contact with real clients. Swapping a protocol in the selection table is fine; weakening the contract-first invariant is not.
- **Deleting a rule:** Check whether the protocol selection table or any cross-reference (lyra-nodejs, lyra-code-review) depends on it; rules 6 and 14 are the contract and compatibility backbone.
- **Versioning:** Bump the patch for clarifications, minor for new rules, major if a rule is removed or the contract-first invariant changes. Keep SKILL.md and this file in sync.