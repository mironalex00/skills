# lyra-nodejs

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

Node.js backend rules grounded in the single-threaded event loop with a libuv thread pool — every framework choice, async pattern, stream usage, and security posture flows from that fact. Sixteen rules derive from the mental model instead of snippets to cargo-cult. Business logic lives behind ports and is tested with in-memory fakes; mocking `pg` or `express` means the boundary is in the wrong place.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Single-threaded event loop** — every rule traces back to this fact; if a proposed rule doesn't, it belongs in another skill.
2. **Bad/good TypeScript pairs** — each rule ships an example so advice survives contact with real code; a rule without a pair is too abstract to apply.
3. **Boundary discipline** — business logic lives in framework-agnostic use cases depending on ports, never in route handlers that import PrismaClient.

---

## Rules

### 1. Never block the event loop with CPU-bound sync work

**The rule:** A 200ms sync loop stalls every connected client for 200ms — reach for the async variant of `pbkdf2`, `fs.readFile`, and large `JSON.parse`.
**When editing:** Keep the `pbkdf2Sync` → `pbkdf2` bad/good pair; it's the canonical teaching example.
**Test for violation:** Any `*Sync` call or long-running sync loop on a request path.

### 2. Reason about microtask vs macrotask ordering

**The rule:** `nextTick` > `Promise.then` > `setImmediate` > `setTimeout` > I/O; recursive `nextTick` starves I/O, and `setTimeout(0)` does not fire before a resolved promise.
**When editing:** Keep the ordering list intact — removing a tier breaks the mental model.
**Test for violation:** Code that assumes `setTimeout(0)` fires before a resolved promise.

### 3. Handle every promise rejection

**The rule:** Since Node 15, unhandled rejections kill the process by default — catch at the call site and add a process-level safety net in bootstrap.
**When editing:** Keep both layers (call-site `.catch` AND `process.on('unhandledRejection')`); one without the other is incomplete.
**Test for violation:** A `.then()` without `.catch()`, or a bootstrap with no `unhandledRejection` handler.

### 4. Choose the framework by team scale and need, not by hype

**The rule:** Match the framework to the team and workload — Express for simple/legacy, Fastify for new perf-sensitive, NestJS for enterprise ≥3 devs.
**When editing:** Keep the three-row framework selection table; updating it is allowed but the structure is the reference.
**Test for violation:** NestJS for a 3-route webhook, or Express for a 50-route enterprise domain.

### 5. Use `Promise.all` for concurrent calls, `allSettled` when partial failure is OK

**The rule:** Sequential `await` in a loop turns N parallelizable calls into N round-trips; `Promise.all` rejects on first failure, `allSettled` collects them for bulk ops.
**When editing:** Keep both variants distinguished — they are not interchangeable.
**Test for violation:** A `for` loop of sequential `await`s where the calls are independent.

### 6. Centralize error handling — don't wrap every function in try/catch

**The rule:** Try/catch on every function swallows context and hides the real cause — catch once at the handler boundary, let errors propagate with full stack traces.
**When editing:** Keep the `setErrorHandler` example; the centralized pattern is the point.
**Test for violation:** A `try/catch` returning `null` inside a service function.

### 7. Stream payloads larger than ~1MB — never buffer entire bodies

**The rule:** Buffering a 2GB upload into a single `Buffer` exhausts heap under concurrent load — streams process in chunks and keep memory flat.
**When editing:** Keep the ~1MB threshold; it's the trigger point for "stream, don't buffer."
**Test for violation:** `fs.readFile` on a path that could exceed 1MB, piped into `res.send`.

### 8. Always handle stream errors and use `pipeline` for backpressure

**The rule:** Unhandled `error` events crash the process; manual `.pipe()` doesn't forward errors or clean up — use `pipeline`.
**When editing:** Keep the `pipeline` example; `.pipe().pipe()` chains are the anti-pattern this rule exists to catch.
**Test for violation:** A `.pipe().pipe()` chain with no error handler or `pipeline` wrapper.

### 9. Use `worker_threads` for CPU-bound work over ~100ms — never for I/O

**The rule:** The JS thread is single; CPU work blocks it. I/O is already parallel via libuv — moving it to a worker adds overhead with no benefit.
**When editing:** Keep the ~100ms threshold and the "never for I/O" qualifier; both are load-bearing.
**Test for violation:** A `worker_threads` pool for DB calls, or a sync hash on the main thread taking seconds.

### 10. Use connection pooling — never open a connection per request

**The rule:** Opening a DB connection costs 50–200ms; per-request connections add that latency every call and exhaust the DB's connection limit under load.
**When editing:** Keep the `pg.Pool` example; the per-request `pg.Client` pattern is the anti-pattern.
**Test for violation:** `new pg.Client()` inside a request handler.

### 11. Use parameterized queries — never string-concatenate SQL

**The rule:** String concatenation in SQL is injection, even on "internal-only" endpoints.
**When editing:** Keep the `$1` parameterized example; the template-literal anti-pattern is the teaching tool.
**Test for violation:** Any `pool.query` with a template literal interpolating user input.

### 12. Validate and sanitize all input with a schema — never trust `req.body`

**The rule:** Every client field is adversarial — schema validation at the boundary is the first defense against injection, prototype pollution, and type coercion.
**When editing:** Keep the zod example with the `role` enum default; the point is boundary validation, not zod specifically.
**Test for violation:** `db.user.create({ ...req.body })` without a schema parse.

### 13. Manage secrets via env vars and a secrets manager — never hardcode

**The rule:** Hardcoded secrets leak via git history, logs, and bundles — load from env at startup, fail fast if missing, use a secrets manager in prod.
**When editing:** Keep the `requiredEnv` fail-fast pattern; silent fallback to a default secret is worse than a crash.
**Test for violation:** Any string literal that looks like a key, token, or password in source.

### 14. Keep dependencies lean and harden HTTP — audit, headers, CORS, rate-limit

**The rule:** Every dependency is attack surface — `npm audit` in CI, pin majors, `helmet`, explicit CORS allowlist (never `*` in prod), rate-limit auth.
**When editing:** Keep the four-part list (audit, headers, CORS, rate-limit); dropping any weakens the rule.
**Test for violation:** `cors()` with no origin config, or a missing rate limit on `/auth/login`.

### 15. Enable compression, set cache headers, and use all CPU cores

**The rule:** Three low-effort wins — gzip/brotli saves 60–80% bandwidth, `Cache-Control` + `ETag` skips redundant work, clustering runs one process per core.
**When editing:** Keep all three wins together; they're cheap and compound.
**Test for violation:** A single-process server with no compression and no cache headers on a read-heavy endpoint.

### 16. Keep business logic out of route handlers

**The rule:** Handlers are outer adapters — business logic belongs in framework-agnostic use cases that depend on ports, not `PrismaClient`.
**When editing:** Keep the `createOrder.execute(req.body)` one-liner handler example; it's the target shape.
**Test for violation:** A route handler that reads stock, checks quantity, and writes an order directly.

---

## Maintenance notes

- **Adding a rule:** Number it sequentially, ship it with a bad/good TypeScript pair, and verify it traces back to the single-threaded event loop invariant. Update the Abstract's rule count.
- **Editing a rule:** Preserve the bad/good pair — the example is what makes the rule apply in real code. Swapping zod for another validator is fine; dropping the boundary-validation point is not.
- **Deleting a rule:** Check whether the framework selection table or any cross-reference (lyra-tdd, lyra-clean-architecture, lyra-clean-code) depends on it.
- **Versioning:** Bump the patch for clarifications, minor for new rules, major if a rule is removed or the event-loop invariant stops being the organizing principle. Keep SKILL.md and this file in sync.