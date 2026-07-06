# lyra-code-review

**Version 1.0.0**
Alexandru Miron
July 2026

> **Note:**
> For agents and LLMs maintaining the lyra-code-review skill. It mirrors SKILL.md in the same rule shape the skill uses to review PRs — title, the rule, when editing, test for violation. The audience is whoever edits this skill next.

---

## Abstract

lyra-code-review is the pre-merge review gate for the Lyra collection. It walks one checklist across seven categories, labels every finding P0 through P3, and ends in a single verdict with explicit merge consequences. Its differentiator is the anti-dummy-test gate: hollow tests that pass without asserting real behavior are treated as P0s, because coverage theater is worse than no tests.

---

## Invariants

Three properties hold the skill together; break any of them and the gate quietly stops gating.

1. **P0 blocks merge unconditionally.** Data loss, security breach, broken build, or a dummy test masquerading as coverage — none of these negotiate. The verdict never softens a P0 into "request changes".
2. **The anti-dummy-test gate is mandatory.** Every new or modified test is scanned against the six patterns. Skipping the scan because the implementation looks fine is exactly how theater ships.
3. **Severity is earned, not guessed.** A finding is P0 because it matches a defined P0 shape, not because it feels serious. When in doubt, find the matching rule before assigning a level.

---

## Rules

### 1. Correctness

**The rule:** the change matches the spec, task, or PR description, and handles edge cases (null, empty, zero, boundary, off-by-one, overflow), error paths, and races.

**When editing:** a missed edge case or an unhandled error path is P1. A race in a concurrent or async path that can corrupt state is P0.

**Test for violation:** delete the production code under test — does any test go red? Does every `try` have a meaningful `catch`? Are null, empty, zero, and boundary inputs exercised?

### 2. Security & data isolation

**The rule:** every query in a multi-tenant system filters by tenant; soft-deleted records are filtered; auth guards protect every protected route; input is validated via DTOs or schemas; no secrets are committed, logged, or leaked; all queries are parameterized.

**When editing:** a missing tenant filter, a raw `req.body` reaching logic, string concatenation in SQL or shell, or a leaked secret is P0. Missing input validation is P1.

**Test for violation:** grep the diff for `req.body`, `SELECT` built by concatenation, and token-shaped log calls. Confirm every new query carries a tenant predicate.

### 3. Type & language hygiene

**The rule:** TypeScript avoids `any`, bare `unknown` without a guard, `@ts-ignore` without a comment, missing return types on public functions, and `console.log` in production. Python uses type hints, avoids bare `except:`, and keeps `print()` out of production. PHP uses `declare(strict_types=1)`, typed properties and return types, and keeps `dump()`/`dd()` out of committed code.

**When editing:** an `@ts-ignore`, `# type: ignore`, or `@phpstan-ignore-line` without justification is P2. A bare `except:` swallowing errors is P1. Debugging artifacts left in production paths are P2.

**Test for violation:** search the diff for `any`, `@ts-ignore`, `except:`, `dump(`, `dd(`, `print(`, and `console.log`; each occurrence needs a comment or removal.

### 4. Database safety

**The rule:** tenant and soft-delete filters in every applicable query; projections on large documents (no `SELECT *` when a subset suffices); indexes for new query patterns; no N+1; multi-step mutations wrapped in a transaction.

**When editing:** a query inside a loop is P1. Unwrapped sequential `await db.update()` calls that can leave the DB half-written are P0. A missing index on a new query pattern is P2.

**Test for violation:** count queries per loop iteration. Confirm transactions wrap every multi-step mutation. Check that each new `WHERE` clause has a backing index.

### 5. Test existence & quality

**The rule:** tests exist for every new public method, every behavior change, and every bug fix (with a regression test). Tests assert behavior, not implementation. Tests cover the error path. Coverage did not drop.

**When editing:** a missing test for a new public method or behavior change is P1. 100% coverage with all-dummy tests is P0 — coverage theater is worse than no tests. A missing regression test for a bug fix is P1.

**Test for violation:** flip a `<` to `>` in the production code. If no test goes red, the test is a dummy — escalate via rule 8.

### 6. Devex regressions

**The rule:** env var renames or additions update `.env.example` and are announced in the PR description; port or network remaps update the README and dependent config; new mandatory setup scripts and build steps are documented in the PR description and setup guide.

**When editing:** an unannounced env var addition is P1. A port remap with no README update is P2. A new required build step with no migration note is P1.

**Test for violation:** diff `.env.example` against the env var reads in the code. Diff the PR description against the setup steps a fresh contributor would need.

### 7. Feature-flag / gate leaks

**The rule:** the flag check is present on both the UI and the API handler, in the happy path and the error path, and in background jobs. Always-on constants like `const ENABLE_NEW_X = true` do not bypass the flag service. Every flag has a linked issue or TODO for cleanup.

**When editing:** a flag check absent from the API handler, the error handler, or a background job is P0. An always-on constant bypassing the flag service is P0. A flag without a linked cleanup issue is P1.

**Test for violation:** grep for the flag name across UI, API, and worker code. Confirm the flag service (not a constant) is the source of truth. Confirm a cleanup TODO or issue exists.

### 8. The anti-dummy-test gate

**The rule:** every new or modified test is scanned against six patterns. Any match is P0.

1. **Tautology** — asserts the language, not the code. Delete the production code and the test still passes.
2. **`expect(true)` / always-passing** — proves the function didn't throw, nothing about correctness.
3. **Testing the mock** — the mock is the subject of the assertion, not the real code under test.
4. **No assertions** — the test renders or calls something but never asserts. "It didn't crash" is not a test.
5. **Testing implementation, not behavior** — locks in private details and makes refactoring impossible.
6. **Catch-all try/catch swallowing failures** — the test passes whether the function works or throws.

**When editing:** any of the six patterns is P0, regardless of how impressive the surrounding coverage number looks.

**Test for violation:** for each test, ask: if I deleted the production code, would this test fail? If I flipped a comparison operator, would this test fail? If the answer is no, the test matches one of the six patterns.

### 9. The verdict

**The rule:** the findings list ends in one verdict — any P0 blocks; any P1 requests changes (fix or defer with a linked issue); P2 only approves with notes; P3 only approves.

**When editing:** the verdict is the last thing the skill emits. P0 and P1 are merge-gating; P2 and P3 are advisory. The verdict never rewrites a P0 as a P1 to unblock a merge.

**Test for violation:** does the output end in exactly one verdict line? Does every P0 in the findings map to a block? Has any P0 been quietly downgraded?

---

## Maintenance notes

- This file mirrors SKILL.md. If the seven categories, six anti-dummy-test patterns, or verdict ladder change in SKILL.md, update this file in the same edit — the two stay in lockstep.
- Severity assignments live in the "When editing" fields, not as tags on rule titles, because one rule can produce different severities depending on shape (rule 4's "query in a loop" is P1, "unwrapped multi-step mutation" is P0).
- New languages beyond TS/Python/PHP belong in rule 3. Keep the per-language checklist to three buckets: type safety, ignored-warning justification, debugging-artifact removal.
- If a new dummy-test pattern appears in the wild, add it to rule 8 — but only if materially different from the existing six. The gate's value is being scannable, not exhaustive.
- The verdict ladder is intentionally coarse. Resist adding P0.5 or "P1 with a wink" — either the finding blocks, or it doesn't.

_Part of the [skill collection](../README.md)._