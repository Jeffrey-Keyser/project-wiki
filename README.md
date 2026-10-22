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
  RabbitMQ credentials are supplied via `~/.config/project-wiki-updater.env`
  as `RABBITMQ_URL=amqp://...`.

### Source diff in the prompt

The generator sees the pushed change's diff, not just its commit message and file
list. The updater fetches the commit over SSH into a bare partial clone per repo
(`PROJECT_WIKI_SOURCE_DIFF_CACHE`, default `~/.cache/project-wiki/source-diffs/`;
commits and trees only, diffed blobs load lazily) and diffs the push's `before`
when the event carries it, else the head commit's first parent. Lockfiles and build
output are excluded; source files get the budget before tests, each file is capped
at 8 KB and the whole diff at 40 KB, and files that do not fit are listed by name.
If the fetch fails the update runs without a diff. `PROJECT_WIKI_SOURCE_DIFF=off`
turns it off.

## Plan and roadmap

The end-to-end design for this wiki — including the per-repo ingestion pipeline,
allowlist semantics, and hosting decisions — lives in
`~/dev-inbox/plans/project-wiki-plan.md`. Read that plan before adding new
features to this repo so changes stay aligned with the broader roadmap.


## Generator model control

Agency HQ **Models → Project Wiki / Page generation** controls the
`project-wiki-generator` role for automatic updates, onboarding and reindexing.
The next invocation reads the saved provider, model and reasoning level; active
calls retain their selection. Claude, Codex and Kimi use the existing CLI
adapters and output validators. No automatic cross-provider retry is added.

A missing row, HTTP 5xx or an unreachable registry retains the existing
`PROJECT_WIKI_GENERATOR_*`, agent-provider and scaffolder-alias defaults.
Malformed rows, unsupported adapters, invalid selectors and other HTTP errors
fail closed. Central selections replace the whole tuple, so an old environment
model cannot leak into a different provider. An empty central model uses that
CLI's own default. Saving in Agency validates against its existing model catalog.

Set `PROJECT_WIKI_MODEL_SOURCE=env` to bypass central settings for a process or
CLI command; restart the updater after changing its environment. Set
`PROJECT_WIKI_AGENCY_URL` to override the default `http://127.0.0.1:3040`.
The explicit `test-provider <provider>` smoke command remains request-selected.
Reviewer and bulk roles are declared defaults without invocation paths; agent
is only consulted by the explicit smoke command. They are not independent
production controls. Reindexing currently uses the generator, not the bulk role.

Selector-only receipts are written atomically to
`~/.local/state/project-wiki/model-status/project-wiki-generator.json`; use the
same `PROJECT_WIKI_MODEL_STATUS_DIR` in Wiki and Agency if relocating them.
They record CLI running/finished/failed observations, not proof of a provider's
underlying model identity or publication success. Output validation and Git
publication occur after the CLI finishes. Concurrent calls report the most
recent receipt; a restart can leave a historical running observation. No prompts,
credentials or raw errors are stored. No invocation means unknown status.

### Claude API lane and run log

`PROJECT_WIKI_AI_PROXY` picks how a **claude** selection reaches the model. The
Agency row still picks the model and effort.

| Value | Behaviour |
|---|---|
| `off` (default) | claude CLI only, as above. |
| `primary` | AI Proxy `/v1/chat` first, paid from the Max plan's monthly API credit (the proxy prices and caps it). If the proxy refuses (budget exhausted, HTTP error, truncated or empty reply), the claude CLI runs instead. |
| `fallback` | CLI first; the proxy answers only if the CLI fails. |

Codex and Kimi selections ignore the setting. Aliases map to API models:
`haiku` → `claude-haiku-5-5`, `sonnet` → `claude-sonnet-5-5`,
`opus` → `claude-opus-5-5`. The key is the proxy's `project-wiki` application, read
from `PROJECT_WIKI_AI_PROXY_KEY_FILE` (default
`~/.config/project-wiki/ai-proxy.key`). That application allows only Haiku and
Sonnet 5.5. `PROJECT_WIKI_AI_PROXY_URL` defaults to `http://127.0.0.1:3005`.
Replies may use up to `PROJECT_WIKI_AI_PROXY_MAX_TOKENS` (default 64000): full page
rewrites for several pages plus thinking overran the old 16000 cap.

Every generator call and every processed update appends one line to
`runs.jsonl` beside the receipt (`project-wiki-run/v1`).
- `kind: "invocation"` lines record repo, sha, model, transport, state, duration,
  token usage and any fallback.
- `kind: "outcome"` lines record each message's result (`updated`, `skipped` with
  its reason, or `failed`) and the number of pages changed.

Failures are stored as a coarse `errorKind` (such as `http-429-ANTHROPIC_BUDGET_EXHAUSTED`
or `exit-1`), never as prompt or error text. The file rotates to `runs.jsonl.1`
past 5 MiB. Quick look:
`tail -n 20 ~/.local/state/project-wiki/model-status/runs.jsonl | jq -c .`

Deploy the source and restart `project-wiki-updater.service` only when its queue
has zero unacknowledged messages and its cgroup has no active provider/build
children. The CLI reads updated source on its next invocation. This change does
not require a static-site rebuild or front-server restart. Roll back to the
previous source revision and restart the idle updater, or use the environment
bypass above. No existing model preferences are seeded or rewritten.


Verification for the 2026-10-17 integration: all 22 server and 17 CLI tests
passed, including HTTP registry fixtures, provider argument capture, failure
handling, and updater output validation. Provider tests use local fake binaries;
no paid inference is needed. Release `87c7392` was loaded by an idle updater
restart; a read-only resolver check using its environment retained the existing
Claude/default selection. No dispatch preferences were written.
