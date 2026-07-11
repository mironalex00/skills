# lyra-podman-images

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

Image building with Podman/Buildah organized around one mental model — an image is layers, a layer written is a layer shipped — from which every rule derives: multi-stage separation, base minimization with digest pinning, volatility-ordered layers, cache/secret mounts, same-layer cleanup, non-root runtime, reproducibility, multi-arch manifests, registry cache, and measurement. Worked Containerfiles live in `references/containerfile-patterns.md`.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Ship only what executes** — the final stage contains artifacts and their runtime, nothing else; anything with a compiler or dev dependency in the final stage violates the skill.
2. **Cache is a design input, not luck** — layer ordering, cache mounts, and registry cache are load-bearing; an edit that trades cache reuse for elegance is a regression.
3. **Nothing secret, nothing floating** — no secret ever enters a layer (config, history, or filesystem), and no base image floats on a mutable tag.
4. **Podman-native, Docker-compatible** — rules are written for rootless, daemonless podman/buildah, noting docker/buildx parity where it exists; nothing may require a privileged daemon.

---

## Rules

### 1. Multi-stage always

**The rule:** Build stages carry toolchains; the final stage receives artifacts via `COPY --from=`. Stages are named; `--target` supports partial builds.
**When editing:** Keep the pointer to the references file — the worked examples are the skill's proof of concept.
**Test for violation:** A recommended Containerfile whose final stage runs an installer or contains a compiler.

### 2. Smallest viable base, digest-pinned

**The rule:** Descend scratch → distroless/Wolfi → alpine → slim/ubi-minimal until something breaks; pin by digest; update digests deliberately.
**When editing:** Keep the musl caveat on alpine and the "full tag carries compilers" warning; both are recurring real-world traps.
**Test for violation:** `FROM node:22` in a runtime stage, or any unpinned `FROM` presented as production-ready.

### 3. Layers ordered least- to most-volatile

**The rule:** Manifests → install → source, so source edits reuse the dependency layer.
**When editing:** Keep the concrete pnpm example — the pattern is only obvious once seen.
**Test for violation:** `COPY . .` before dependency installation.

### 4. Cache mounts for package caches

**The rule:** `RUN --mount=type=cache` persists caches across builds without entering layers; use `sharing=locked` for apt/dnf.
**When editing:** Keep at least one example per ecosystem class (JS store, compiler cache, OS package cache).
**Test for violation:** A pattern that bakes a package cache into a layer and then rm's it in the same RUN when a cache mount was available.

### 5. Same-layer cleanup for what can't be cache-mounted

**The rule:** Deletion only shrinks the layer it happens in; install-and-clean in one RUN; heredocs for legibility.
**When editing:** Keep the physical explanation (later deletion still ships) — it's the model users lack.
**Test for violation:** A separate `RUN rm -rf /var/lib/apt/lists/*` instruction.

### 6. Secrets only via secret mounts

**The rule:** `--mount=type=secret` at build; never ARG (history) nor ENV (config) — both extractable from the pulled image.
**When editing:** Keep the ARG-vs-ENV distinction explicit; "ARG is safe" is a widespread false belief.
**Test for violation:** An `ARG NPM_TOKEN` anywhere in guidance.

### 7. `.containerignore` is mandatory

**The rule:** Exclude VCS, dependencies, outputs, env files, fixtures; podman reads `.containerignore` then `.dockerignore`.
**When editing:** Keep the three consequences (slow builds, cache busting, secret leakage) — the third is the security tie-in.
**Test for violation:** A project scaffold without an ignore file next to its Containerfile.

### 8. Non-root runtime, COPY-time ownership

**The rule:** `USER` non-root in the final stage; `--chown`/`--chmod` on COPY instead of RUN chmod (layer duplication); exec-form ENTRYPOINT needs no shell.
**When editing:** Keep the "no shell is a feature" framing — it pre-empts the usual objection.
**Test for violation:** A final stage running as root, or a `RUN chmod -R` after a COPY.

### 9. Reproducibility: pinned inputs, stripped timestamps

**The rule:** `--timestamp 0`/`SOURCE_DATE_EPOCH` + digest-pinned bases + lockfiles ⇒ stable digests; `--squash` trades cache for layer hygiene and is reserved for terminal images.
**When editing:** Keep the squash trade-off sentence; unconditional squash advice is a common error.
**Test for violation:** Reproducibility claimed while any input floats.

### 10–11. Multi-arch manifests; registry-shared CI cache

**The rule:** `--platform` + `--manifest` + `manifest push --all`; CI uses `--layers --cache-from/--cache-to` against a cache repo.
**When editing:** Keep the qemu note and the dependency on rule 3 (cache reuse needs good ordering).
**Test for violation:** Per-arch tags juggled by hand, or CI builds with no cache source.

### 12. HEALTHCHECK is a format decision; OCI labels always

**The rule:** HEALTHCHECK requires `--format docker`; OCI-format images declare health at runtime (owned by lyra-podman-deploy); `org.opencontainers.image.*` labels are non-optional.
**When editing:** Keep the cross-reference to lyra-podman-deploy — the two skills split build-time vs run-time on purpose.
**Test for violation:** A HEALTHCHECK instruction recommended without the format caveat.

### 13. Measure with a size budget

**The rule:** `image tree`, `history`, `dive`, `system df`; per-image budget; regression = failing test; the four biggest wins ranked.
**When editing:** Keep the ranked wins list — it's the triage order.
**Test for violation:** Optimization advice given without a measurement step.

---

## Maintenance notes

- **Adding a rule:** Derive it from the layer model (invariant framing) and verify it works rootless without a daemon. If it needs more than ~10 lines of example, the example goes to `references/containerfile-patterns.md`.
- **Editing a rule:** Keep SKILL.md examples and the references file consistent (same flag spellings, same pinning style). Podman version assumptions are stated in `compatibility` — update there, not inline.
- **Deleting a rule:** Rules 1, 3, and 6 carry invariants 1–3; removing any requires a major version.
- **Version policy:** Examples default to the latest stable release of each tool; the stated minimum is the newest LTS or last maintained major (see SKILL.md compatibility). On LTS transitions, bump versions in examples and the patch number.
- **Versioning:** Bump the patch for flag/example refresh, minor for a new rule or reference pattern, major if the layer mental model or an invariant changes. Keep SKILL.md and this file in sync.
