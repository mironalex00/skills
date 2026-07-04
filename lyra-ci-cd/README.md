# lyra-ci-cd

CI/CD pipeline rules that hold across GitHub Actions, GitLab CI, and CircleCI — stage gating, quality gates, one-way promotion, tested rollback, caching, parallelization, and secrets hygiene. It folds the old anti-pattern list into the rules they belong to, so "manual prod deploy" and "no rollback plan" aren't a separate list to forget. Wires `lyra-tdd`, `lyra-code-review`, and `lyra-e2e-testing` in as non-optional pipeline stages.

**Reach for it when:** writing pipeline configs, designing deploy workflows, configuring gates, implementing rollback, or debugging a pipeline failure.

**Don't:** local dev workflows, infrastructure provisioning, monitoring setup, or CI plugin development.

*Part of the [13-skill collection](../README.md).*