# lyra-security-supply-chain

Defends the path from "someone published code" to "your production runs it" — with mechanism, not vigilance. Lockfiles enforced and reviewed, install scripts contained, a release-age cooldown that outwaits worm-speed attacks, deliberate dependency adoption, digest-pinned images and SHA-pinned actions, SBOMs on every release, keyless signing with deploy-time verification, provenance attestations, CI hardened as the crown-jewel target, registry hygiene against dependency confusion — and the five-step incident drill for when a poisoned package lands anyway.

**Reach for it when:** adding or updating dependencies, setting lockfile/registry/renovate policy, hardening CI, designing release signing and SBOMs, or responding to a dependency CVE or compromise.

**Don't:** vulnerabilities in your own code (`lyra-security-appsec`), CI pipeline mechanics beyond hardening (`lyra-ci-cd-automation`), image construction (`lyra-podman-images`), or credential storage (`lyra-security-secrets`).

_Part of the [skill collection](../README.md)._
