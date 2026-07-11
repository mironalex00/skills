# lyra-security-containers

Container runtime hardening with Podman, on one operating principle: assume the app gets compromised and make the container a dead end. Rootless engine + non-root user (both, always), cap-drop=all with proven add-backs, read-only rootfs with declared writable paths, seccomp/SELinux kept enforcing, userns=auto between containers, no socket mounts, no host networking, pids/memory limits as DoS containment, distroless images as post-compromise tool denial, and scan-and-rebuild lifecycle. Ends with the debugging ladder that fixes denials narrowly instead of disabling defenses.

**Reach for it when:** hardening a container deployment, reviewing run flags/compose/quadlets for security, evaluating a third-party image's privilege demands, or a permission error is tempting someone toward `--privileged`.

**Don't:** image construction (`lyra-podman-images`), deployment mechanics (`lyra-podman-deploy`), code-level vulnerabilities (`lyra-security-appsec`), or secrets policy (`lyra-security-secrets`).

_Part of the [skill collection](../README.md)._
