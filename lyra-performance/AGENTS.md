# lyra-performance

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

A measurement-first performance skill for the full stack — React/Next.js render and Core Web Vitals on the frontend, API latency and DB queries on the backend. Every optimization is a hypothesis until a benchmark proves it; changes that don't measure up get reverted. Fourteen rules cover N+1 elimination, indexing, pagination, caching, code splitting, lazy loading, memoization, and image optimization, each with a bad/good pair.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Measurement-first** — every optimization is a hypothesis tested against a before/after number; "I think this is slow" is not a hypothesis.
2. **The profiling loop** — measure → identify → hypothesize → fix → re-measure → guard; skipping measure or re-measure breaks the loop and turns the skill into guessing.
3. **Composition over scope** — this skill fixes known bottlenecks; `lyra-analyze-codebase` finds candidates, `lyra-database` owns deep query work. The three compose, they don't overlap.

---

## Rules

### 1. Optimize from a benchmark, not a hunch

**The rule:** If you can't state the current number and the target, you're gambling — hypotheses come from profile data, never intuition; the bottleneck sets the max gain (Amdahl), so anything else is wasted effort.
**When editing:** Keep the "p95 is 340ms, target <200ms" example; it's the hypothesis format every rule assumes.
**Test for violation:** A change with no stated baseline number or target.

### 2. Re-measure, then guard the gain

**The rule:** Every fix is a hypothesis tested against before/after numbers; if the number didn't move, revert — complexity without gain is a regression. Add a budget check or regression test so the win survives next quarter.
**When editing:** Keep the `bundlesize` and `lhci` examples; the guard is what makes the fix durable.
**Test for violation:** A merged optimization with no regression test or budget guard.

### 3. Measure synthetic AND real users

**The rule:** Synthetic (Lighthouse, DevTools) gives reproducible isolation; RUM (web-vitals, CrUX, APM) gives real-user truth — a fix that passes synthetic but misses RUM didn't improve the user's experience.
**When editing:** Keep the `web-vitals` import example; RUM is the truth source.
**Test for violation:** A fix validated only on the developer's machine.

### 4. Follow the symptom-to-cause tree

**The rule:** Don't guess what's slow — walk the symptom to the cause: first page load (bundle, TTFB, render-blocking), interaction sluggish (long tasks, layout thrash), navigation (API times, fetch waterfalls, N+1 client fetches), backend (queries, pool, CPU, locks, GC).
**When editing:** Keep the tree diagram; it's the diagnostic the rest of the rules hang off.
**Test for violation:** A fix that targets a cause before the symptom-to-cause path is walked.

### 5. Eliminate N+1 queries

**The rule:** One query inside a loop is the most common backend performance bug, and it scales with record count — batch with a join or a single `WHERE IN`.
**When editing:** Keep the Prisma `include` example; the `for`-loop with `await` is the anti-pattern.
**Test for violation:** An `await` inside a `for`-loop over DB records.

### 6. Index for your query patterns

**The rule:** Every `WHERE`, `JOIN`, and `ORDER BY` column needs an index; verify with `EXPLAIN ANALYZE` — an index that exists but isn't used is dead weight that slows every write.
**When editing:** Keep the `EXPLAIN ANALYZE` verification step; an unverified index is a guess.
**Test for violation:** A query with a `WHERE` on an unindexed column at scale.

### 7. Paginate every list endpoint

**The rule:** An unbounded `findMany()` is a data-volume bomb — one user with 100K records takes down the endpoint. Always `take` with a stable `orderBy`.
**When editing:** Keep the `take` + `skip` + `orderBy` example; the stable `orderBy` is what makes pagination correct.
**Test for violation:** A `findMany()` with no `take` limit.

### 8. Cache with a TTL and an invalidation strategy

**The rule:** A cache without invalidation is a stale-data bug waiting to ship — layer caches by scope (browser → CDN → app → DB), each with a TTL matched to how stale the data can get and a signal that invalidates it.
**When editing:** Keep the "invalidate on write: `cached = null`" comment in the example; the invalidation is the rule, not the cache.
**Test for violation:** A cache with no TTL or no invalidation on write.

### 9. Hit Core Web Vitals thresholds

**The rule:** LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 — measured in RUM, not synthetic; a synthetic pass doesn't count, and if RUM shows a miss, you have a real problem.
**When editing:** Keep the RUM qualifier; synthetic-only passes are false confidence.
**Test for violation:** A team celebrating synthetic Lighthouse scores while RUM shows a miss.

### 10. Code-split bundles and lazy-load heavy components

**The rule:** The initial bundle loads on every user, so split by route and defer heavy, rarely-used components behind `lazy()` + `Suspense`.
**When editing:** Keep the `lazy` + `Suspense` pair; both are needed.
**Test for violation:** A `SettingsPage` or `ChartLibrary` in the initial bundle.

### 11. Memoize only when measurement proves it

**The rule:** `useMemo` and `React.memo` aren't free — they add allocation and comparison overhead; apply only when a measurement shows the re-render is expensive and the memo comparison is cheaper. Hoist stable references out, or a new object on every render defeats `React.memo`.
**When editing:** Keep the "trivial label vs. heavy sort" bad/good pair.
**Test for violation:** A `useMemo` on a string template literal.

### 12. Optimize images with dimensions, modern formats, and priority

**The rule:** Images are the largest LCP contributor — provide dimensions (prevents CLS), modern formats (AVIF/WebP), responsive `srcset`, and `fetchpriority="high"` on the LCP image.
**When editing:** Keep all four attributes in the good example; dropping any weakens the rule.
**Test for violation:** An `<img>` tag with no width/height, no `srcset`, or no modern format.

### 13. Don't optimize what isn't the bottleneck

**The rule:** Optimizing non-bottleneck code adds complexity and slows the next developer — don't trade readability for a gain that's neither measured nor significant (>10%); fix N+1 and unbounded queries now, defer micro-optimizations honestly.
**When editing:** Keep the "fix now for N+1/unbounded queries, defer for micro-opts" distinction.
**Test for violation:** A micro-optimization (`x >> 1`) with no measured gain.

### 14. Compose with lyra-analyze-codebase and lyra-database

**The rule:** Use `lyra-analyze-codebase` to scan the repo for anti-patterns (N+1, missing indexes, unbounded queries, large bundles) before you profile, and `lyra-database` for deep query work (EXPLAIN plans, index strategy, denormalization) when the database is the bottleneck.
**When editing:** Keep the four-step composition diagram (`analyze-codebase` → `performance` → `database` → `performance`); it defines the handoff boundaries.
**Test for violation:** A performance investigation that doesn't reference `analyze-codebase` or `database` when those layers are involved.

---

## Maintenance notes

- **Adding a rule:** Number it sequentially, ship it with a bad/good code pair, and verify it fits the profiling loop (measure → fix → re-measure → guard). Update the Abstract's rule count.
- **Editing a rule:** Preserve the bad/good pair and the measurement framing — a rule without a "state the number" hook drifts into generic advice. The targets table at the end of SKILL.md is part of the contract; keep thresholds aligned with rules 9 and the bundle-size rule.
- **Deleting a rule:** Check whether the profiling loop, the symptom-to-cause tree (rule 4), or the composition diagram (rule 14) depends on it; rules 1 and 2 are the measurement backbone.
- **Versioning:** Bump the patch for clarifications, minor for new rules, major if a rule is removed or the measurement-first invariant changes. Keep SKILL.md and this file in sync.