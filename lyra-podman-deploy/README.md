# lyra-podman-deploy

Deploying containers with Podman on systemd hosts: quadlet units as the deployment primitive, rootless by default, health-gated startup ordering (`Notify=healthy`), pull-based auto-update with automatic rollback, digest-pinned releases, pods and named networks, SELinux-aware volumes, file-mounted secrets, and resource limits on everything. Worked quadlet stacks and a debug checklist live in `references/`.

**Reach for it when:** deploying services with podman, writing `.container`/`.pod`/`.network`/`.volume` files, setting up auto-updating hosts, or debugging rootless networking, volume permissions, or unit startup.

**Don't:** building the images (`lyra-podman-images`), pipeline design (`lyra-ci-cd-automation`), runtime security flags (`lyra-security-containers`), or multi-node orchestration (that's Kubernetes).

_Part of the [skill collection](../README.md)._
