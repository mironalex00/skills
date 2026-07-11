# Containerfile patterns

Canonical, fully-optimized Containerfiles applying every rule from [SKILL.md](../SKILL.md): multi-stage, digest-pinned bases, volatility-ordered layers, cache mounts, non-root runtime, exec-form entrypoints, OCI labels. Digests below are placeholders — resolve real ones with `skopeo inspect docker://<image> | jq -r .Digest`. **Image tags are placeholders too**: they were the newest LTS/stable at last update (2026-07) — verify what's current before copying, exactly as you would the digests. No `# syntax=` directive appears below: buildah/podman support cache/secret mounts and heredocs natively and ignore that BuildKit-frontend line; add `# syntax=docker/dockerfile:1` only if the same file must also build under Docker.

## Node.js (pnpm) — API server

```dockerfile
FROM docker.io/library/node:24-slim@sha256:PINNED AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
# corepack ships in Node <=24 and reads the "packageManager" field from
# package.json (required — pnpm errors without it). Node >=25 removed corepack:
# there, install pnpm directly instead: RUN npm install -g pnpm@10
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM docker.io/library/node:24-slim@sha256:PINNED AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps  --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3000
ENTRYPOINT ["node", "dist/main.js"]
LABEL org.opencontainers.image.source="https://github.com/org/app" \
      org.opencontainers.image.version="1.0.0"
```

Why two install stages: `deps` produces production `node_modules` (what ships); `build` gets dev dependencies for the compiler. Both hit the same pnpm store cache mount, so the second install is nearly free. If the framework supports a self-contained output (Next.js `output: "standalone"`, or bundling the server with esbuild), ship that instead of `node_modules` — it's routinely 5–10× smaller.

Build:

```bash
podman build -t ghcr.io/org/app:1.0.0 .
# private registry during install, kept out of layers:
podman build --secret id=npmrc,src=$HOME/.npmrc -t ghcr.io/org/app:1.0.0 .
```

## Go — static binary on scratch

```dockerfile
FROM docker.io/library/golang:1.26@sha256:PINNED AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download
COPY . .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/app .

FROM scratch
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /out/app /app
USER 65534:65534
ENTRYPOINT ["/app"]
```

`CGO_ENABLED=0` + `-trimpath -ldflags="-s -w"` gives a static, stripped, path-independent binary. Copy CA certificates or TLS calls fail. If you need a shell for debugging, use `gcr.io/distroless/static:debug` in a debug tag — not in prod. Result is typically 5–15 MB total.

## Python — uv on distroless-style slim

```dockerfile
FROM docker.io/library/python:3.14-slim@sha256:PINNED AS build
COPY --from=ghcr.io/astral-sh/uv:0.9@sha256:PINNED /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev

FROM docker.io/library/python:3.14-slim@sha256:PINNED
WORKDIR /app
RUN groupadd -r app && useradd -r -g app app
COPY --from=build --chown=app:app /app /app
ENV PATH="/app/.venv/bin:$PATH" PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
USER app
ENTRYPOINT ["python", "-m", "app"]
```

The venv is built once and copied whole; the runtime stage never runs an installer. `--no-install-project` first keeps the dependency layer cached across source-only changes.

## Multi-arch release

```bash
podman build --platform linux/amd64,linux/arm64 \
  --manifest ghcr.io/org/app:1.0.0 \
  --timestamp 0 .
podman manifest push --all ghcr.io/org/app:1.0.0 docker://ghcr.io/org/app:1.0.0
```

## CI build with registry cache

```bash
podman build --layers \
  --cache-from ghcr.io/org/app-cache \
  --cache-to   ghcr.io/org/app-cache \
  -t ghcr.io/org/app:${GIT_SHA} .
podman push ghcr.io/org/app:${GIT_SHA}
```

## Debugging size

```bash
podman image tree ghcr.io/org/app:1.0.0        # layers and sizes
podman history --no-trunc ghcr.io/org/app:1.0.0 # which instruction made each layer
dive ghcr.io/org/app:1.0.0                      # wasted-bytes analysis
```

Checklist when an image is too big: base image tag too fat → dev deps in final stage → package-manager cache baked into a layer (should be a cache mount) → build context leaked via missing `.containerignore` → assets shipped that a CDN should serve.
