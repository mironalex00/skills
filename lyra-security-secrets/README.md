# lyra-security-secrets

Secrets across their whole life: never entering git (a committed secret is public — rotation beats cleanup), three-layer scanning (pre-commit, CI, full history), `.env` hygiene with a committed example schema, the storage hierarchy (managed stores → file-mounted container secrets → env vars as legacy fallback), identities over secrets (OIDC/workload identity so the secret doesn't exist), issuance-time scoping, rehearsed dual-key rotation, log/URL/prompt exposure control, the rotate-first leak runbook, and the inventory that makes all of it answerable.

**Reach for it when:** handling API keys/tokens/passwords, setting up environment config, wiring secrets into CI or containers, choosing service-to-service auth, or responding to a leaked credential.

**Don't:** application crypto and password hashing (`lyra-security-appsec`), CI pipeline mechanics (`lyra-ci-cd-automation`), container secret mounting mechanics (`lyra-podman-deploy`), or dependency compromise response beyond the rotation hand-off (`lyra-security-supply-chain`).

_Part of the [skill collection](../README.md)._
