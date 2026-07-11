# Quadlet patterns

Worked quadlet units applying the rules from [SKILL.md](../SKILL.md). User units live in `~/.config/containers/systemd/`, system units in `/etc/containers/systemd/`. Digests shown as `@sha256:PINNED` are placeholders — resolve the real one with `skopeo inspect docker://<image> | jq -r .Digest` before deploying; a literal `PINNED` will fail to pull. After any change: `systemctl --user daemon-reload` (drop `--user` for system units). Verify generation with:

```bash
/usr/lib/systemd/system-generators/podman-system-generator --user --dryrun
```

## Full stack: network + volume + database + app

`app.network`:

```ini
[Network]
# containers on this network resolve each other by name
```

`db-data.volume`:

```ini
[Volume]
```

`db.container`:

```ini
[Unit]
Description=Postgres

[Container]
Image=docker.io/library/postgres:18@sha256:PINNED
# quadlet's default container name is systemd-%N (here: systemd-db);
# DNS registers the CONTAINER name, so set it explicitly or "db" won't resolve
ContainerName=db
Network=app.network
Volume=db-data.volume:/var/lib/postgresql/data:Z
Secret=db-password,type=mount
Environment=POSTGRES_PASSWORD_FILE=/run/secrets/db-password
HealthCmd=pg_isready -U postgres
Notify=healthy

[Service]
Restart=always

[Install]
WantedBy=default.target
```

`app.container`:

```ini
[Unit]
Description=API server
Wants=db.service
After=db.service

[Container]
# channel tag + AutoUpdate; for CI-driven deploys pin @sha256 and drop AutoUpdate
Image=ghcr.io/org/app:prod
AutoUpdate=registry
ContainerName=app
Network=app.network
PublishPort=127.0.0.1:3000:3000
# create before first start: printf '%s' '...' | podman secret create app-db-url -
Secret=app-db-url,type=mount
HealthCmd=/app/healthcheck
HealthOnFailure=kill
Notify=healthy

[Service]
Restart=always
# resource limits are systemd directives — they belong here, not under [Container]
MemoryMax=512M
# Notify=healthy counts image pull + startup + health ramp against the start
# timeout; a slow pull on first deploy or auto-update can spuriously fail the
# unit (and a failed update triggers rollback). Size this generously.
TimeoutStartSec=900

[Install]
WantedBy=default.target
```

Because both units use `Notify=healthy`, `After=db.service` means "after Postgres is *healthy*", not merely started — the app never races the database. The app reaches Postgres at `db:5432` via network DNS **because `ContainerName=db` is set** — DNS registers container names, and quadlet's default name is `systemd-<unit>`, not the unit basename (alternatively, set `NetworkAlias=db`). `HealthCmd` runs *inside* the container: on distroless/scratch images there is no shell or curl, so ship a tiny healthcheck binary in the image (as `/app/healthcheck` here) — a `curl` health command contradicts the minimal images this suite builds.

## Pod: app + sidecar sharing localhost

`web.pod`:

```ini
[Pod]
PublishPort=127.0.0.1:8080:8080
```

`caddy-data.volume`:

```ini
[Volume]
```

`web-app.container`:

```ini
[Container]
Image=ghcr.io/org/web@sha256:PINNED
Pod=web.pod
Notify=healthy
HealthCmd=/app/healthcheck

[Service]
Restart=always

[Install]
WantedBy=default.target
```

`web-proxy.container`:

```ini
[Container]
Image=docker.io/library/caddy:2@sha256:PINNED
Pod=web.pod
Volume=/srv/web/Caddyfile:/etc/caddy/Caddyfile:ro,Z
Volume=caddy-data.volume:/data

[Service]
Restart=always

[Install]
WantedBy=default.target
```

Ports publish on the **pod**; members talk over `localhost` (proxy → app at `localhost:3000`). Every unit needs its `[Install]` section — without it the unit generates but never starts at boot. For public TLS, publish `80`/`443` on the pod and give Caddy a real hostname in the Caddyfile: it provisions and renews certificates automatically (ACME) as long as `/data` persists — that's the volume above.

## Zero-downtime restarts: socket activation

A quadlet restart drops traffic for the restart window. systemd socket activation closes it: systemd owns the listening socket, queues connections during the restart, and hands the socket to the new container. A `.socket` unit named after the service, plus the container reading the inherited fd:

`app.socket` (a plain systemd unit, same directory conventions):

```ini
[Socket]
ListenStream=127.0.0.1:3000

[Install]
WantedBy=sockets.target
```

In `app.container`, drop `PublishPort=` and let the app accept the socket systemd passes (`LISTEN_FDS`; native support in Caddy/nginx and most Go/Rust servers, or wrap with `systemd-socket-proxyd`). `systemctl --user restart app` then queues connections instead of refusing them. If the app can't accept inherited sockets, put the socket-activated proxy in front and restart the app behind it.

## Auto-update deployment loop

```bash
# one-time host setup
systemctl --user enable --now podman-auto-update.timer
loginctl enable-linger "$USER"

# manual converge + dry run
podman auto-update --dry-run
podman auto-update
```

With `AutoUpdate=registry` and a `Notify=healthy` unit, a pushed image that fails its health check is rolled back to the previous image automatically. Ship mutable *channel* tags (`:prod`) for auto-update hosts, or digests + CI-driven unit rewrite for push-style deploys — not both.

## Secrets

```bash
printf '%s' 'postgres://app:...@db:5432/app' | podman secret create app-db-url -
podman secret ls
# rotate: create app-db-url-v2, update Secret= line, daemon-reload, restart
```

## Rollback (digest-pinned deploys)

```bash
podman images --format '{{.Repository}} {{.Digest}} {{.Created}}' | grep org/app
# edit app.container -> previous digest
systemctl --user daemon-reload && systemctl --user restart app
```

## Debug checklist when a unit misbehaves

1. Unit missing after daemon-reload → run the generator `--dryrun`; quadlet syntax errors make the unit silently not generate.
2. Starts then dies → `journalctl --user -u app -e`; check `podman ps -a` for the exit code.
3. Healthy never reached → run `HealthCmd` manually via `podman exec`; check `Notify=healthy` vs an app that doesn't listen yet (add `HealthStartupCmd=`).
4. Container name doesn't resolve over network DNS → quadlet's default name is `systemd-<unit>`, not the unit basename; set `ContainerName=` or `NetworkAlias=`.
5. Unit times out at start (then auto-update "rolls back" a healthy image) → `Notify=healthy` counts pull + startup + health ramp against `TimeoutStartSec`; raise it in `[Service]`.
6. Port unreachable → rootless + port < 1024? (`sysctl net.ipv4.ip_unprivileged_port_start`); published on `127.0.0.1` but tested from outside?
7. Permission denied on volume → SELinux: missing `:Z`/`:z`; ownership: missing `:U`.
8. Dies at logout → `loginctl enable-linger`.
