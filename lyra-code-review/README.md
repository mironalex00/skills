# lyra-code-review

The pre-merge review gate. One pass walks seven categories — correctness, security and data isolation, type and language hygiene (TS/Python/PHP), database safety, test existence and quality, devex regressions, feature-flag leaks — and labels every finding P0, P1, P2, or P3. Each severity carries an explicit merge consequence. The core differentiator is the anti-dummy-test gate: tautology tests, `expect(true)`, testing-the-mock, and catch-all try/catch blocks are all P0s. 100% coverage with all-dummy tests is also a P0. Output is a findings list ending in one verdict.

**Reach for it when:** reviewing a diff, evaluating a PR, running `/code-review`, or asked "is this safe to merge?" — your code, another agent's, or a human's.

**Don't:** skip the test scan because the implementation looks fine. Hollow tests look like tests but assert nothing.

*Part of the [13-skill collection](../README.md).*