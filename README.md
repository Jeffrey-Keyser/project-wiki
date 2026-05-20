# project-wiki

Centralized ecosystem wiki for the Jeffrey-Keyser projects. This repository
hosts the static site generated from per-repo Markdown content collected under
`content/`.

The wiki is built with [Astro](https://astro.build) and the
[Starlight](https://starlight.astro.build) docs template. Mermaid code blocks
are rendered to inline SVG at build time via `rehype-mermaid`.

## Layout

```
content/
  index.md            # landing page
  repos/              # per-repository wiki content (added by later slices)
    _smoke/           # build smoke tests (kept out of the navigation tree)
.wiki-config.json     # repo allowlist for downstream tooling
astro.config.mjs      # Astro + Starlight + Mermaid configuration
src/content.config.ts # Starlight docs collection pointed at ../content
```

## Local development

```bash
npm install
npm run dev      # local preview at http://localhost:4321
npm run build    # static build into dist/
```

## Deployment (Beelink homelab)

In production this repo runs as two separate Node processes under systemd
user units on the Beelink host: the auth-gated Express front-server
(`server/index.js`, invoked via `npm start`) and a standalone RabbitMQ
updater consumer (`server/updater.js`, invoked via `npm run start:updater`).

- **Local port:** `3062` (set via `PORT` in the systemd unit; picked
  from the 3060-band by inspecting the host with `ss -tlnp` — 3060/3061
  are nof1, 3070 is logos).
- **Public URL:** `https://wiki.jeffreykeyser.net`, exposed through the
  shared `beelink` Cloudflare tunnel. The ingress entry lives in
  `/etc/cloudflared/config.yml` and forwards to `http://localhost:3062`,
  matching the pattern used by `business.jeffreykeyser.net`,
  `pantry-manager.jeffreykeyser.net`, `agency.jeffreykeyser.net`, and
  `cron.jeffreykeyser.net`.
- **Service unit:** `~/.config/systemd/user/project-wiki.service` runs
  `npm start` from `/home/jkeyser/project-wiki/`. Manage it with
  `systemctl --user {status,restart,start,stop} project-wiki.service`
  and view logs via `journalctl --user -u project-wiki.service`. The
  unit declares an `ExecStartPost` port-readiness gate that polls
  `ss -tln "( sport = :3062 )"` for up to ~10s, so `systemctl restart`
  only returns once node has actually bound `:3062` — without this,
  immediate post-restart probes (e.g. the dev-inbox verify gate's
  `curl https://wiki.jeffreykeyser.net/`) can briefly hit `502 Bad
  Gateway` from the Cloudflare tunnel while node is still booting.
- **Auth:** the front-server requires `PUBLIC_ORIGIN`,
  `PAY_AUTH_BASE_URL`, and a built `dist/` (see `.env.example`). The
  systemd unit pins `PUBLIC_ORIGIN=https://wiki.jeffreykeyser.net` and
  `PAY_AUTH_BASE_URL=https://pay.jeffreykeyser.net`; unauthenticated
  requests `302` to the Pay login UI and only admins can reach the
  Starlight pages.
- **Updater unit:** `~/.config/systemd/user/project-wiki-updater.service`
  runs `npm run start:updater` as a separate long-lived consumer. It
  binds durable queue `wiki.updater.queue` to durable topic exchange
  `wiki.events` with routing key `wiki.update.#`, then logs receipts as
  `received wiki.update.<repo> sha=<sha> msg=<title>` before acking.

## Plan and roadmap

The end-to-end design for this wiki — including the per-repo ingestion pipeline,
allowlist semantics, and hosting decisions — lives in
`~/dev-inbox/plans/project-wiki-plan.md`. Read that plan before adding new
features to this repo so changes stay aligned with the broader roadmap.
