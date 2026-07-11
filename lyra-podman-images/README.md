# lyra-podman-images

Container image building with Podman/Buildah, tuned for the three things that matter: small (multi-stage, minimal digest-pinned bases down to scratch/distroless, same-layer cleanup), fast (volatility-ordered layers, cache mounts, registry-shared CI cache), and reproducible (pinned inputs, stripped timestamps, multi-arch manifests). Includes canonical Node/pnpm, Go/scratch, and Python/uv Containerfiles in `references/`.

**Reach for it when:** writing or reviewing a Containerfile/Dockerfile, shrinking an image, speeding up container builds locally or in CI, going multi-arch, or keeping secrets out of layers.

**Don't:** running or deploying containers (`lyra-podman-deploy`), pipeline design (`lyra-ci-cd-automation`), or runtime hardening flags (`lyra-security-containers`).

_Part of the [skill collection](../README.md)._
