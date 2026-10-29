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
  ecosystem/          # global architecture and repository directory
  repos/              # per-repository wiki content (added by later slices)
    _smoke/           # build smoke tests (kept out of the navigation tree)
.wiki-config.json     # repo allowlist + per-repo ignorePaths for the updater
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
- **Production builds:** the updater rebuilds Astro on this host. Keep Playwright
  as a production dependency: `rehype-mermaid` imports it through
  `mermaid-isomorphic`, including when packages are installed with `--omit=dev`.
  The matching Chromium headless browser must also be available to the service
  user (on a new host, install it with `npx playwright install chromium`).
- **Updater unit:** `~/.config/systemd/user/project-wiki-updater.service`
  runs `npm run start:updater` as a separate long-lived consumer. It
  binds durable queue `wiki.updater.queue` to durable topic exchange
  `wiki.events` with routing key `wiki.update.#`, then logs receipts as
  `received wiki.update.<repo> sha=<sha> msg=<title>` before acking.
  RabbitMQ credentials are supplied via `~/.config/project-wiki-updater.env`
  as `RABBITMQ_URL=amqp://...`.

### Ignored paths

`.wiki-config.json` `ignorePaths` maps a repo to path globs whose changes never
warrant a wiki update. A push whose changed files all match is skipped as
`ignored-paths-only` before the diff fetch and the generator call. dev-inbox ignores
`design/**`: its design-record commits (propose / complete / accept, dozens a day)
only touch `design/INDEX.json` and per-record files.

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

## Global ecosystem map

`content/ecosystem/overview.md` is the cross-repository architecture and directory, linked from the home page. It is a dated scaffold based on the ecosystem/host prompts and existing guides. Repository update events currently maintain per-repo pages; refresh this overview when host ownership, shared contracts, major integrations, or wiki coverage changes.

`npm run build` also exports standalone SVGs under `/diagrams/` for opening or downloading the maps at full size. Keep the three Mermaid blocks in topology, events, and delivery order so their stable filenames stay aligned.


## Background wiki automation (Forge)

The `project-wiki-worker.service` unit in `deploy/` replaces the legacy Beelink updater consumer. Run exactly one consumer; keep the authenticated front-server on Beelink. The worker accepts existing `wiki.update.#` events and `wiki.page.updated`, saves intake to a private SQLite WAL database before acknowledging RabbitMQ, and coalesces each repository for 30 minutes. Daily source checks also catch ecosystem/host registry changes. Guide links and the home directory are generated from files on disk without inference. The catalog describes registered repositories, not a GitHub account census or live service health.

Background generation uses AI Proxy's application-owned `/v1/batches` endpoints. Routine global updates use Haiku 5.5; structural registry/host/allowlist changes require a second batch with an Opus 5.5 approval. Repository updates resolve the existing `project-wiki-generator` central selection and accept Haiku/Opus 5.5 only. A non-Claude or unsupported selection blocks that update visibly. Interactive onboarding/reindex commands keep their immediate path. There is no background CLI or synchronous fallback. Batch results can take up to 24 hours per stage.

Repository refreshes discover existing Markdown guides directly under each repository's wiki directory, including additional pages such as the Agency HQ Projects guides. The six standard pages keep their order; additional pages follow alphabetically and appear in the generated directory. Only regular `.md` files with letters, digits, hyphens or underscores in their names are included (starting with a letter or digit); symlinks, hidden files and nested directories are excluded. Duplicate case-insensitive page slugs block discovery. A complete standard guide still means all six standard pages exist, regardless of extra pages.

Batch repository prompts include every discovered page in full within a 256 KiB guide budget. A repository that exceeds the budget is held before inference instead of silently omitting later pages; the event remains pending and worker status reports a refresh error. Existing-page validation, curated blocks, source/document guards and normal publication checks still apply. Onboarding creates the six standard pages; additional guides must first be authored and published before the refresh worker can maintain them. Paid refreshes remain subject to the configured allowance and submission cutoff below.

Configure a private `~/.config/project-wiki-worker.env` (mode 600) on Forge:

```dotenv
RABBITMQ_URL=amqp://user:password@100.99.136.81:5672
AI_PROXY_URL=http://127.0.0.1:3005
AI_PROXY_API_KEY=<dedicated batch-only application key>
WIKI_BATCH_UNTIL=2026-11-03T00:00:00Z
PROJECT_WIKI_AGENCY_URL=http://127.0.0.1:3040
PROJECT_WIKI_SOURCE_DIFF_CACHE=/home/jkeyser/.cache/project-wiki/source-diffs
```

The rollout application has a **one-time $80 lifetime allowance**, an explicit expiry, and access only to Haiku/Opus 5.5. The shared proxy cap still applies. This is not a recurring $80 subscription or a monthly reset. The initial November 3 cutoff leaves processing time before the earliest reported November 4 credit expiry; new structural drafts stop one day earlier to leave time for their review. Polling and free directory checks continue after submissions stop. Confirm the actual credit expiry in the provider console before extending the cutoff.

Use `scripts/wiki-worker.sh status` for pending batches, job counts, source-check timestamps, submission/poll errors, and publication recovery. `scripts/wiki-worker.sh check` requests a source check while holding the same exclusive process lock as the service; stop the service before using it. Both require the configured environment. Normal operation uses the installed systemd unit and checks each minute. Runtime state defaults to `~/.local/state/project-wiki/automation`; protect the whole directory (700), including SQLite, source snapshots and prompts. Never commit or attach its contents publicly.

Requests and idempotency keys persist before HTTP submission. An uncertain provider submission retains its proxy reservation and is surfaced for manual reconciliation; never generate a fresh key or enable a fallback to bypass it. Known failed/invalid results remain visible and are not automatically rebilled. A source or document change can produce a new job. Check `AI Proxy /internal/anthropic-budget` (service auth) for settled cost and outstanding reservations.

Global drafts explicitly use low reasoning effort within the existing 24,000-token output ceiling, leaving room for the rewritten narrative instead of consuming the ceiling on hidden reasoning. Global drafts and Opus review decisions accept bare JSON or a single JSON code fence covering the whole response; prose-wrapped or ambiguous decisions, truncated output, invalid narratives and explicit review rejections still fail closed. Worker status exposes `lastResultError` as a timestamped stable category (for example `model-output-token-limit`, `invalid-result-json`, `global-diagram-count`, or `opus-review-rejected`), without provider output or rejection text. A versioned global generation policy distinguishes the current draft request from earlier failed requests while retaining deterministic idempotency. Historical failed jobs and rejected reviews are not requeued or reclassified automatically.

Before applying a repository result, the worker requires unchanged source-page hashes and an ancestor source revision. It can publish a valid older code snapshot, then enqueue a catch-up update, so busy repositories do not starve. Global results require unchanged structural inputs, narrative and curated catalog fields. `<!-- curated:start -->...<!-- curated:end -->` blocks are preserved exactly. Unknown pages, truncated responses, active content, credentials and destructive changes are rejected. Build/render/link/anchor/diagram checks run on Forge before a normal fast-forward Git push. The Beelink installer verifies the current main revision, archive hash and safe paths, then atomically exchanges the built directory. A durable publish intent retries installation after a crash without making another model call. An intervening main commit causes revalidation rather than a force push.

Install `scripts/install-wiki-artifact.sh` on Beelink first, with executable permissions. The Forge worker needs its normal GitHub SSH access and `ssh beelink`. Copy the supplied service unit to `~/.config/systemd/user/`, use a production dependency install in `~/project-wiki-worker`, and set `NPM_CONFIG_USERCONFIG` to the existing authenticated npm config. At cutover, verify the old updater is idle, stop/disable it, then enable/start the Forge worker. Rollback: stop Forge first, verify there are no pending model results to apply, and re-enable the legacy consumer; pending batch reservations remain tracked by AI Proxy. Do not run both consumers together.
