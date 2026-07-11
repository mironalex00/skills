# lyra-ci-cd

CI/CD pipeline rules that hold across GitHub Actions, GitLab CI, and CircleCI — stage gating, quality gates, one-way promotion, tested rollback, caching, parallelization, and secrets hygiene. It folds the old anti-pattern list into the rules they belong to, so "manual prod deploy" and "no rollback plan" aren't a separate list to forget.
Wires `lyra-tdd`, `lyra-code-review`, and `lyra-e2e-testing` in as non-optional pipeline stages.

**Reach for it when:** writing deliberately minimal, non-container pipeline configs. For containerized stacks — and for the current form of the shared rules (SHA-pinned actions, OIDC, digest promotion, signing) — use [`lyra-ci-cd-automation`](../lyra-ci-cd-automation/README.md), which supersedes this skill where they disagree.

**Don't:** local dev workflows, infrastructure provisioning, monitoring setup, or CI plugin development.

_Part of the [skill collection](../README.md)._