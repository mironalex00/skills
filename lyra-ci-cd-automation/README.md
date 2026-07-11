# lyra-ci-cd-automation

CI/CD pipelines that are fast, safe, and reversible — all three, or none. Cost-ordered gates behind branch protection, SHA-pinned actions with least-privilege OIDC, lockfile-keyed caches, rootless Podman builds with registry layer cache, build-once/promote-by-digest with cosign signing and verification, scan gates on the artifact, one-way promotion with a human gate at prod, sub-five-minute tested rollback, and telemetry with alert thresholds.

**Reach for it when:** writing or reviewing pipeline configs, moving container builds into CI, designing deploy/promotion workflows, hardening CI security, or debugging a slow or flaky pipeline.

**Don't:** Containerfile optimization (`lyra-podman-images`), host-side deployment mechanics (`lyra-podman-deploy`), dependency/provenance policy beyond CI (`lyra-security-supply-chain`), local dev workflows — or non-container pipelines, where `lyra-ci-cd`'s platform-agnostic rules are the better start.

_Part of the [skill collection](../README.md)._
