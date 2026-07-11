# lyra-security-containers

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

Runtime hardening of the container-host boundary under the principle "defense in depth against your own image": layered de-privileging (rootless + non-root + cap-drop + no-new-privileges), mandatory-access-control kept enforcing (seccomp, SELinux), isolation extensions (read-only rootfs, mode-appropriate user-namespace separation, network least privilege), the socket-is-the-host prohibition, limits as DoS containment, minimal images as post-compromise tool denial, scan-and-rebuild lifecycle, and a diagnose-don't-disable debugging ladder. Podman-first, Docker-portable.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Assume compromise** — every rule is justified by what an attacker inside the container can do next, not by compliance.
2. **Defenses are never disabled to fix errors** — the skill may narrow a control (one cap, one label, one tmpfs), never remove one (`--privileged`, unconfined, permissive, label=disable are always findings).
3. **Layers are independent** — rootless does not excuse root-in-container; distroless does not excuse capabilities; each layer is argued on its own.
4. **Containers are replaced, not repaired** — patching running containers or long-lived containers presented as normal violates the lifecycle model.

---

## Rules

### 1. Rootless engine AND non-root user

**The rule:** Both layers, each cutting a different escape story; mapped root still owns the container's filesystem and capabilities.
**When editing:** Keep the explanation of what mapped root *can still do* — "rootless makes root-in-container fine" is the misconception this rule kills.
**Test for violation:** Guidance treating either layer as sufficient alone.

### 2. cap-drop=all, proven add-backs, --privileged never

**The rule:** Zero capabilities as the default claim; each add-back demonstrated by the actual failure; `--privileged` = absence of all containment; demanding third-party images get investigated.
**When editing:** Keep the definition of `--privileged` spelled out (all caps, no seccomp, no SELinux, all devices) — its name undersells it.
**Test for violation:** A default capability set accepted, or `--privileged` in any production example.

### 3. Read-only rootfs with declared writable paths

**The rule:** `--read-only` + explicit tmpfs + named volumes; writability is documentation by construction.
**When editing:** Keep the quadlet directives (`ReadOnly=`, `Tmpfs=`) aligned with lyra-podman-deploy's unit examples.
**Test for violation:** A writable rootfs accepted because "the app needs it" without identifying the paths.

### 4. Seccomp/SELinux enforcing; narrow profiles, never unconfined

**The rule:** Labels (`:Z/:z`) fix volume denials; custom narrower profiles fix genuine syscall needs; `no-new-privileges` blocks setuid escalation.
**When editing:** Keep "the disease pretending to be the cure" framing and the lyra-podman-deploy rule 7 cross-reference.
**Test for violation:** Any unconfined/disable/permissive suggestion, even "temporarily".

### 5. Inter-container isolation, per engine mode

**The rule:** Rootful/system podman: `--userns=auto` (non-overlapping per-container UID ranges). Rootless: `--userns=auto` is NOT supported — per-service user accounts provide the equivalent separation. Genuinely untrusted code escalates to gVisor/Kata sandboxed runtimes.
**When editing:** Keep this distinct from rule 1 (host protection vs inter-container protection), and keep the rootful-only caveat explicit — presenting userns=auto as stacking on rootless is a propagating error: the flag simply doesn't work under a rootless engine, and readers hit a dead end on the suite's own default posture.
**Test for violation:** `--userns=auto` recommended in a rootless context, or multi-service host guidance without inter-container isolation consideration.

### 6. The socket is the host

**The rule:** Socket mount = ability to start a privileged container = root; alternatives ranked (no-socket designs > filtered proxy > rootless socket).
**When editing:** Keep the alternatives ranked — the rule without alternatives just gets violated by the first tool that asks.
**Test for violation:** A compose/quadlet example mounting the socket without the finding flag.

### 7. Network least privilege

**The rule:** No host networking (it's `--privileged` for the network); internal networks for no-egress tiers; 127.0.0.1-bound publishes behind a proxy.
**When editing:** Keep the `--network=host` equivalence framing; keep consistency with lyra-podman-deploy rule 6 (which owns the mechanics).
**Test for violation:** Host networking suggested for performance without measurement or alternatives.

### 8. Limits are security controls

**The rule:** memory, cpus, and pids-limit (fork-bomb containment) on every production container; absence equated with missing authentication.
**When editing:** Keep pids-limit first-class — it's the one that's both most forgotten and most host-lethal.
**Test for violation:** A production spec without limits passing review.

### 9. Minimal images as runtime security; secrets never in image or env

**The rule:** Every shipped binary is attacker tooling; distroless turns RCE into a toolless room; debug variants exist so prod never grows a shell; secrets are file-mounted.
**When editing:** Keep the three cross-references (lyra-podman-images 2, lyra-security-secrets 4, lyra-podman-deploy 8) — this rule is the junction point of the container triangle.
**Test for violation:** A shell added to a prod image "for debugging".

### 10. Scan-and-rebuild lifecycle

**The rule:** CI gate + scheduled scans of deployed images; rebuild on base updates; replace, never repair; long uptimes are unpatched software.
**When editing:** Keep "containers are replaced, never repaired" — it's invariant 4 in rule form.
**Test for violation:** In-place patching guidance, or scanning without the deployed-image schedule.

### 11. Diagnose, don't disable

**The rule:** Error → mechanism → narrowest fix → documented why; the fast flags are disabled defenses.
**When editing:** This rule is the skill's enforcement of invariant 2 — keep the ladder's four steps and the closing warning intact.
**Test for violation:** Any debugging path ending in a broad flag rather than a narrow fix.

---

## Maintenance notes

- **Adding a rule:** Justify it from attacker-next-move (invariant 1), give the narrow-fix path (invariant 2), and note Docker parity or divergence. Runtime only — build-time content belongs to lyra-podman-images.
- **Editing a rule:** This skill is one corner of the container triangle (lyra-podman-images = build, lyra-podman-deploy = operate, this = harden); the six cross-references between them are load-bearing — verify both ends when touching any.
- **Deleting a rule:** Rules 2, 4, and 11 carry invariant 2; rule 6 is the single highest-severity item in the skill. Removal is a major version.
- **Version policy:** Examples default to the latest stable release of each tool; the stated minimum is the newest LTS or last maintained major (see SKILL.md compatibility). On LTS transitions, bump versions in examples and the patch number.
- **Versioning:** Bump the patch for flag/tool refresh, minor for a new hardening layer, major if an invariant changes. Keep SKILL.md and this file in sync.
