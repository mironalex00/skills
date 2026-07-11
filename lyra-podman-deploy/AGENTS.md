# lyra-podman-deploy

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

Podman deployment on systemd hosts with quadlets as the unit of deployment: rootless defaults with their three operational consequences (subuid mapping, unprivileged ports, linger), health-gated startup that makes dependency ordering real, pull-based auto-update with health-fail rollback, digest-based release history, pods/networks/volumes/secrets/limits, and journald-first debugging. Compose and kube play are positioned as dev/migration paths, not production.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Systemd supervises; scripts don't** — every production container is a generated systemd unit with restart policy and boot startup; `podman run` in a shell script is the anti-pattern the skill replaces.
2. **Health gates everything** — startup ordering, auto-update rollback, and restart-on-failure all key off container health, not process existence.
3. **Rollback is a digest, not a hope** — deploys reference immutable digests (or auto-update channels with automatic rollback); mutable-tag deploys are called out as having no rollback.
4. **Rootless is the default posture** — rootful requires a stated reason in the unit.

---

## Rules

### 1. Rootless with its three consequences named

**The rule:** subuid/subgid mapping, unprivileged-port sysctl (or proxy/socket activation), and linger — stated together because each produces a distinct "works interactively, fails deployed" incident.
**When editing:** Keep all three; the linger one is the most-forgotten.
**Test for violation:** Deployment guidance that doesn't mention linger for a user service.

### 2. Quadlets are the deployment unit

**The rule:** `.container` files under `containers/systemd/`; `generate systemd` is deprecated; compose YAML is dev-only. The minimal unit example carries the full contract (digest pin, secret mount, health, Notify, AutoUpdate, Restart, WantedBy).
**When editing:** The example unit is normative — every line in it is a rule elsewhere in the skill; keep them consistent.
**Test for violation:** A production recommendation built on `podman run` + `Restart=` absent, or new content using `podman generate systemd`.

### 3. Health declared at runtime, Notify=healthy

**The rule:** HealthCmd + HealthOnFailure + Notify=healthy so `After=` means "after healthy"; startup probes for slow boots.
**When editing:** Keep the cross-reference to lyra-podman-images rule 12 (OCI images carry no HEALTHCHECK) — the two skills split this on purpose.
**Test for violation:** An `After=db.service` dependency where the db unit lacks `Notify=healthy`, presented as safe ordering.

### 4. Auto-update with rollback

**The rule:** `AutoUpdate=registry` + timer = pull-based deploys; failed-to-start-healthy updates self-revert; push-style deploys use digest rewrite by CI instead.
**When editing:** Keep the channel-tags-XOR-digests guidance from the references file aligned with this rule — mixing both is the common misconfiguration.
**Test for violation:** Auto-update guidance without the rollback behavior mentioned, or a host on both `:prod` tag and digest pinning.

### 5. Digest history is the rollback mechanism

**The rule:** Deploy digests, retain N previous images, rollback = previous digest + restart.
**When editing:** Keep the "mutable tag = no rollback" sentence verbatim in spirit.
**Test for violation:** A prune job with `--all` recommended on a production host.

### 6. Pods share localhost; networks isolate; publish minimally

**The rule:** `.pod` for co-located sidecars, `.network` + name-based DNS otherwise, `127.0.0.1` binding behind a proxy, never host networking for convenience.
**When editing:** Keep the pod-vs-network decision distinct — merging them loses the "when do I need a pod" answer.
**Test for violation:** `--network=host` suggested for anything but a measured, stated need.

### 7. Volumes named, `:Z/:z/:U` on SELinux, in a backup job

**The rule:** Named volumes for data, bind mounts for config, SELinux labels over disabling SELinux, and "a volume without backup doesn't exist."
**When editing:** Keep `:Z` vs `:z` (private vs shared) correct — swapping them breaks multi-container mounts.
**Test for violation:** Advice to set SELinux permissive to fix a volume error.

### 8. Secrets as mounted files

**The rule:** `podman secret` + `type=mount`; env leaks via inspect//proc/children/dumps; `type=env` is legacy fallback; rotation = new version + restart.
**When editing:** Keep the enumeration of env leak channels — it's the persuasive part.
**Test for violation:** A secret recommended via `Environment=`.

### 9. Limits on every production unit

**The rule:** MemoryMax/CPUQuota (or PodmanArgs), pids-limit; unlimited containers OOM their neighbors.
**When editing:** Prefer systemd-level directives in quadlet examples over PodmanArgs where equivalents exist.
**Test for violation:** A production unit example without a memory limit.

### 10. Journald + generator dry-run for debugging

**The rule:** journalctl per unit; the generator `--dryrun` is the first tool when a unit doesn't appear (quadlet errors fail silently).
**When editing:** Keep the debug checklist in references ordered by failure frequency.
**Test for violation:** Debug guidance that starts with the container instead of the unit.

### 11. Compose/socket for dev; kube play for migration

**The rule:** Docker tooling via podman.socket for dev parity; production stays quadlets; multi-node means Kubernetes, with kube generate/play as the bridge.
**When editing:** Keep the scope line hard — this skill must not grow orchestrator content.
**Test for violation:** Production guidance built on podman-compose.

---

## Maintenance notes

- **Adding a rule:** It must run rootless on a stock systemd host and keep the quadlet as the deployment unit. Long examples go to `references/quadlet-patterns.md`; the SKILL.md unit example stays minimal-but-complete.
- **Editing a rule:** The minimal unit in rule 2 and the full stack in the references must stay in sync line-for-line with the rules they illustrate. Podman 5.x assumptions (pasta, Notify=healthy) live in `compatibility`.
- **Deleting a rule:** Rules 2, 3, and 5 carry invariants 1–3; removing any requires a major version.
- **Version policy:** Examples default to the latest stable release of each tool; the stated minimum is the newest LTS or last maintained major (see SKILL.md compatibility). On LTS transitions, bump versions in examples and the patch number.
- **Versioning:** Bump the patch for directive/example refresh, minor for a new rule or pattern, major if the quadlet-first model or an invariant changes. Keep SKILL.md and this file in sync.
