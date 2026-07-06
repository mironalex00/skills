# lyra-tdd

**Version 1.0.0** · Alexandru Miron · July 2026

> This file is a maintenance contract for agents editing the lyra-tdd skill.
> It is not the user-facing spec — that lives in SKILL.md. Read it before
> changing rules, examples, or thresholds; every edit ripples into any agent
> that invokes the skill downstream.

## Abstract

lyra-tdd is a test-driven development skill with a coverage gate that catches
dummy tests — not just line coverage, but branch coverage plus mutation testing
across nine languages. 
It is maintained as part of the skill Lyra collection.
What sets it apart is the anti-dummy-test rule set: ten rules that block the
easy routes to a green suite that asserts nothing.

## Invariants

These three properties carry the skill's weight. Breaking any one silently
turns lyra-tdd into ordinary TDD advice.

- **The rules are gates, not aspirations.** Softening "100% branches as the floor" to "aim for high coverage" removes the only thing that distinguishes this skill from generic TDD guidance.
- **Mutation testing is the truth check; coverage is the floor.** Keeping them stacked preserves the claim to catch dummy tests. Flattening to coverage-only collapses rules 3 and 10 into one weak rule.
- **Every rule is paired with a bad/good example.** Examples are how agents recognise violations in review. A rule without an example becomes a slogan.

## Rules

### 1. Plan first — no code without a spec

- **The rule:** state behavior in one sentence (Given/when/then), list inputs/outputs/edges, turn each spec line into a test name before writing code.
- **When editing:** keep the Given/when/then framing and the spec-line → test-name link. The one-sentence behavior statement is load-bearing.
- **Test for violation:** tests appear with no matching spec sentence, or production code ships before any test name exists.

### 2. One test at a time: red, green, refactor

- **The rule:** write one failing test, confirm it fails for the right reason (assertion, not compile error), write minimum code, refactor green. Never batch.
- **When editing:** keep the per-language command table — it is the only place agents learn the right runner invocation. The "fails for the right reason" check separates this from test-after-the-fact.
- **Test for violation:** a PR adds multiple tests at once, or a test that fails for a compile/syntax reason rather than an assertion.

### 3. 100% coverage is the floor, not the goal

- **The rule:** require 100% branches as the floor, 100% lines as a secondary gate, and mutation score ≥ 95% as the truth check. Documented exclusions only — generated code, feature-flag-gated code, type-system-unreachable branches — each with a comment naming the reason.
- **When editing:** preserve the three-layer stacking (branches, lines, mutation). The exclusion list is closed; widening it weakens the gate.
- **Test for violation:** a PR lowers a threshold, broadens the exclusion list, or drops the mutation layer.

### 4. No tautology tests

- **The rule:** a test must exercise the code under test, not the language or the test framework.
- **When editing:** keep the bad/good Python pair — the good example asserts `add(...)` results, not `2 + 2`. It is the clearest illustration of the failure mode.
- **Test for violation:** a test whose setup mirrors its assertion, or that would still pass if the function under test were deleted.

### 5. No `expect(true)` or empty assertions

- **The rule:** a test whose only assertion is `expect(true).toBe(true)`, `assert True`, or a constant `.toBeTruthy()` is not a test. Delete it.
- **When editing:** keep the TypeScript bad/good pair — the bad case calls the function and asserts a literal; the good case asserts on the return value.
- **Test for violation:** a test that calls a function but asserts on a literal, or asserts nothing at all.

### 6. Don't test the mock

- **The rule:** assert on what the system under test does — the call it makes and the transformation it applies — not on values you set on the mock.
- **When editing:** keep the `toHaveBeenCalledWith` + `toEqual` pair in the good example; it is the canonical "verify the call, verify the transformation" pattern.
- **Test for violation:** a test asserts on a value the test itself set on a mock, rather than on a mock call or a transformed return value.

### 7. Every test asserts at least one observable outcome

- **The rule:** observable means return value, thrown error, published event, written row, or sent message. A test that only calls code asserts nothing — rename it `smoke_*` and exclude it from coverage.
- **When editing:** preserve the five-item observable list — it is how agents judge edge cases the examples don't cover. Keep the `smoke_*` escape valve.
- **Test for violation:** a test that calls a function and asserts nothing, or counts toward coverage without an observable outcome.

### 8. No happy-path-only suites

- **The rule:** for every public function, exercise at minimum one valid input, one boundary, one invalid, and one empty/null where applicable.
- **When editing:** keep the four-case minimum (valid, boundary, invalid, empty/null). The "where applicable" qualifier matters — not every function has a null case.
- **Test for violation:** a suite for a public function ships with only valid inputs, or skips every boundary and error path.

### 9. No copy-paste parameterized tests with identical assertions

- **The rule:** parameterized rows must exercise different paths, not assert the same shape with different values.
- **When editing:** keep the Python `is_positive` example — the bad case asserting `True` for five positive inputs is the canonical anti-pattern.
- **Test for violation:** a parameterized test whose rows all pass through the same branch and assert the same outcome.

### 10. A surviving mutant is a dummy test

- **The rule:** run mutation testing. Every surviving mutant is a test that happens to pass — fix the test, not the mutant.
- **When editing:** keep the "fix the test, not the mutant" inversion. It is the one-line summary that prevents maintainers from "improving" the mutant so a failing test passes.
- **Test for violation:** a PR disables mutation testing, raises the survival tolerance, or patches a mutant so a failing test passes.

## Maintenance notes

**Adding a rule.** Append at the next number. Provide a one-line rule, a "when editing" note, and a violation test. If the rule needs a bad/good example to be recognisable in review, write one — a rule without an example rarely fires. Bump the minor version.

**Editing a rule.** Keep the rule's number and title stable across edits; agents may reference rules by number. If the edit changes what counts as a violation, note the old behaviour in the commit so reviewers can audit existing code against the new rule. Bump the minor version for intent changes, patch for wording.

**Deleting a rule.** Don't. Deprecate instead: strike the body, leave the title with a note that the rule is no longer enforced and why, and keep the number reserved. Removing a number shifts every later rule and breaks any external reference. Bump the major version.

**Versioning.** The version at the top tracks the rule set, not the prose. Any change to what the rules require is a version bump; a typo fix is not. Keep SKILL.md and AGENTS.md in lockstep — they describe the same contract from two sides.