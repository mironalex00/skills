# lyra-e2e-testing

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

End-to-end testing discipline that keeps the browser-test layer thin — accessible locators over test IDs, auto-waiting over sleeps, per-test data over shared state, sharding with merged reports over slow serial runs. Targets Playwright but the rules transfer to Cypress, Selenium, and WebdriverIO. Assumes `lyra-tdd` owns the unit layer and `lyra-ci-cd` owns the pipeline graph.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Thin e2e layer** — only what unit and integration tests can't reach; retesting unit behavior at the browser burns CI minutes for zero new confidence.
2. **Stable locators** — accessible queries (`getByRole`, `getByLabel`) mirror how users and assistive tech find elements and survive refactors; CSS/XPath selectors don't.
3. **Test isolation** — each test seeds and cleans its own data via an API factory; shared state across tests is the root of flakiness.

---

## Rules

### 1. Test the journey, not the component tree

**The rule:** E2E covers only what unit and integration can't — user journeys, cross-system integration, real-browser rendering; target roughly 70% unit, 20% integration, 10% e2e.
**When editing:** Keep the 70/20/10 ratio; it's the budget that keeps the e2e layer thin.
**Test for violation:** An e2e test that verifies math a unit test already covers.

### 2. Reach for accessible locators first; reserve test IDs for last-resort cases

**The rule:** `getByRole`, `getByLabel`, `getByText` survive refactors and surface a11y gaps as test failures; use `getByTestId` only when no accessible query works, with a comment saying why.
**When editing:** Keep the "no accessible query" exception clause; blanket bans on test IDs don't survive third-party widgets.
**Test for violation:** A `getByTestId` call with no comment explaining why an accessible query wouldn't work.

### 3. Assert what the user sees, never DOM structure or class names

**The rule:** Assert text, visibility, role, and state — not class names, store shape, or internal attributes; a behavior-preserving refactor must not break a test, and if it does, the test was coupled to implementation.
**When editing:** Keep the `toHaveClass(/is-selected/)` anti-example; it's the canonical coupling smell.
**Test for violation:** An `expect` on a class name or internal data attribute.

### 4. No sleeps — let locators auto-wait and assertions retry

**The rule:** `waitForTimeout` manufactures flakiness and slow suites — Playwright locators auto-wait, and `expect(locator).toBeVisible()` retries until timeout; wait for a condition, never a clock.
**When editing:** Keep the bad/good pair; the "wait for a condition, not a clock" line is the rule's core.
**Test for violation:** Any `page.waitForTimeout` call.

### 5. Retries are a safety net, not a fix

**The rule:** `retries: 2` in CI absorbs environmental flake, but a test that needs retries to pass is in debt — flake above 2% gets reproduced with `--repeat-each=20 --workers=1`, root-caused, and fixed, or quarantined with `test.fixme` and an issue link.
**When editing:** Keep the 2% flake threshold and the `test.fixme`-with-issue pattern.
**Test for violation:** A test that's been retried-to-green in CI with no issue filed.

### 6. No shared state — each test seeds and cleans its own data via an API factory

**The rule:** Every test runs in a clean context, seeds through the API (never the UI of a previous test), cleans up in `afterEach`, and uses unique suffixes — hardcoded `"test-user-1"` collides across workers and branches.
**When editing:** Keep the `apiFactory` fixture pattern with `crypto.randomUUID()`; the uniqueness is what prevents cross-worker collisions.
**Test for violation:** A test that depends on data created by an earlier test, or a hardcoded `"test-user-1"`.

### 7. No `expect(true)`, no swallowed failures, no smoke tests in the merge gate

**The rule:** A test whose only assertion is `expect(true)` is not a test, a `try/catch` that swallows failures manufactures green, and a page-load-with-no-assertion is smoke — keep smoke if you want, but exclude it from the merge gate.
**When editing:** Keep all three anti-patterns together; they're the false-confidence trio.
**Test for violation:** A test with `expect(true).toBe(true)` or an empty `try/catch` around a click.

### 8. One journey per test; split at journey boundaries

**The rule:** Each test exercises one user behavior with a clear pass/fail — a test that logs in, browses, adds to cart, checks out, and reviews is five tests stitched into one, and when it fails you can't tell which step broke.
**When editing:** Keep the `describe`-block split example; it's the refactor pattern.
**Test for violation:** A test over ~50 lines or covering more than one user goal.

### 9. Page Objects for shared flows, obeying the same locator rules

**The rule:** Build a Page Object when three or more tests repeat the same flow; one-off locators stay inline — a Page Object that hides `[data-testid]` behind a friendly name has not fixed the coupling, it has renamed it.
**When editing:** Keep the "three or more" threshold and the locator-rule inheritance.
**Test for violation:** A Page Object using `getByTestId` or raw CSS.

### 10. `fullyParallel` by default; serial is an exception with a comment

**The rule:** `fullyParallel: true` is the default — a test that can't run in parallel is breaking isolation (rule 6), not parallelism; `test.describe.serial` is allowed with a comment, never as a habit.
**When editing:** Keep the "fix the isolation, do not disable parallelism" framing.
**Test for violation:** A `serial` block with no comment explaining why.

### 11. Shard across runners, then merge the reports

**The rule:** For suites over five minutes, shard with `--shard=i/n`, upload each shard's blob report, run a final job that merges them into one verdict and one HTML report — sharding without merging yields N partial reports instead of an answer.
**When editing:** Keep the YAML example with the merge job; the merge step is what makes sharding worthwhile.
**Test for violation:** A sharded config with no merge step.

### 12. Capture screenshot, video, and trace on every failure

**The rule:** Configure once in `playwright.config` — `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`; a failed test without a trace is debug-by-guessing, and the minutes saved by disabling capture are the hours lost debugging.
**When editing:** Keep all three capture modes; dropping any turns a debuggable failure into a guess.
**Test for violation:** A `playwright.config` with `trace: 'off'` or missing the failure-capture block.

---

## Maintenance notes

- **Adding a rule:** Number it sequentially, ship it with a bad/good TypeScript pair, and verify it doesn't overlap with an existing rule. Update the Abstract if the rule count changes.
- **Editing a rule:** Preserve the bad/good pair and the locator-rule inheritance across Page Objects (rule 9) — the locator discipline is what makes the suite refactor-safe.
- **Deleting a rule:** Check whether the merge-gate exclusion (rule 7), the sharding pattern (rule 11), or any cross-reference (lyra-tdd, lyra-ci-cd) depends on it; rules 6 and 10 are the isolation backbone.
- **Versioning:** Bump the patch for clarifications, minor for new rules, major if a rule is removed or the thin-layer invariant changes. Keep SKILL.md and this file in sync.