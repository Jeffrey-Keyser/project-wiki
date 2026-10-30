---
title: "Logos — Operations"
description: "How Logos is started, deployed, health-checked and observed, separating documented runtime from verified facts."
---

# Operations

Logos is a deployable HTTP service, not a library. Its entry point is `dist/bin/www.js` ([package.json:L9](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/package.json#L9)).

**Everything on this page is documented by source files.** Nothing here was checked against a live host.

## Start and stop

- **Locally.** Use `npm run dev`. To run the compiled build, use `npm run build && npm start` ([package.json:L7-L9](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/package.json#L7-L9)).
- **On the host, via the `logos.service` unit.** `deploy.sh` installs the repository copy of the unit ([logos.service](https://github.com/Jeffrey-Keyser/logos/blob/c7ea06ff741f3e3daab4d624768ba94553d85708/logos.service), [deploy.sh](https://github.com/Jeffrey-Keyser/logos/blob/c7ea06ff741f3e3daab4d624768ba94553d85708/deploy.sh)). The unit:
  - runs from the `/home/jkeyser/releases/logos/current` symlink, which points at the immutable release for the deployed commit, not from the `~/logos` source checkout;
  - sets `PORT=3070` and `NODE_ENV=production` ([logos.service:L7-L20](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/logos.service#L7-L20));
  - points `TRANSFORMERS_CACHE` at the models directory;
  - loads `.env`. Each release reaches the shared `/home/jkeyser/logos/.env` through a symlink that `deploy.sh` creates;
  - uses `Restart=on-failure`.
- **Restart command.** `deploy.sh` restarts the service with `systemctl --user restart logos` after it has switched `current` ([deploy.sh](https://github.com/Jeffrey-Keyser/logos/blob/c7ea06ff741f3e3daab4d624768ba94553d85708/deploy.sh)). Running that command by hand restarts whichever release `current` points to.
- **Shutdown.** On SIGTERM the process stops the worker and drains the bus best-effort, then closes the HTTP server ([src/bin/www.ts:L62-L80](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bin/www.ts#L62-L80)). Systemd allows 15s for this ([logos.service:L10](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/logos.service#L10)).
- **Startup failures.** If the embedding warmup fails, the process exits ([src/bin/www.ts:L12-L13](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bin/www.ts#L12-L13), [src/bin/www.ts:L81-L84](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bin/www.ts#L81-L84)).

## Deploy

Deploys are immutable and per commit. Under `beelink-deploy`'s `deploymentMode: immutable-worktree`, each merged commit is checked out clean at `~/releases/logos/<sha>`, and `deploy.sh` runs there ([README.md](https://github.com/Jeffrey-Keyser/logos/blob/c7ea06ff741f3e3daab4d624768ba94553d85708/README.md)). The script does not build the live `~/logos` checkout, so uncommitted edits there are never deployed ([deploy.sh](https://github.com/Jeffrey-Keyser/logos/blob/c7ea06ff741f3e3daab4d624768ba94553d85708/deploy.sh)).

Before doing anything else, `deploy.sh` requires ([deploy.sh](https://github.com/Jeffrey-Keyser/logos/blob/c7ea06ff741f3e3daab4d624768ba94553d85708/deploy.sh)):

- `BEELINK_DEPLOY_IMMUTABLE_REVISION` set to a 40-character lowercase commit SHA. Otherwise it refuses in-place deployment;
- a `HEAD` equal to that SHA;
- a clean worktree, with no untracked files;
- a release that is not already `releases/logos/current`.

It then takes a non-blocking lock on `~/releases/logos/.logos-deployment.lock`. The source checkout defaults to `/home/jkeyser/logos` and can be overridden with `BEELINK_DEPLOY_SOURCE_PATH`.

Steps run in this order:

1. Link the shared `~/logos/.env` into the release as `.env`.
2. Pull secrets with `solo-vault pull` into the shared `.env`. If that fails, fall back to Vault over HTTP. The HTTP fallback fetches each secret key independently. A key whose fetch fails, returns an HTTP error, is unparsable, or is missing, null or empty keeps its existing `.env` value. The keys that were fetched successfully are staged on a copy of `.env` and written in one atomic rename. If no key can be fetched, the function fails and `.env` stays byte-identical ([deploy.sh](https://github.com/Jeffrey-Keyser/logos/blob/91d3a349b1a27e3036cf774e14c31d27119b6458/deploy.sh)).
3. `npm ci --include=dev`.
4. `prepare:models`, which uses the shared model cache.
5. `build`.
6. `migrate`.
7. `seed:prompts`. A failure here fails the deploy.
8. `register-cron`. A failure here is non-fatal.
9. Switch `~/releases/logos/current` to this release, atomically. If the repository `logos.service` differs from `~/.config/systemd/user/logos.service`, copy it over and run `systemctl --user daemon-reload`.
10. Restart `logos.service`.
11. Poll `curl http://localhost:3070/health` up to 20 times. If it never answers, roll back and exit 1.
12. On success, prune old releases.

**Rollback.** Rollback repoints `current` to the previous release, or removes the link if there was none. It then restores the saved unit file, reloads systemd, restarts the service and checks `/health` again. Rollback does not run `migrate:down`, so migrations applied by the failed release stay in place.

**Pruning.** After a healthy deploy, older release worktrees are removed from the source checkout with `git worktree remove --force`. The three most recently modified release directories are kept. The current and previous releases are never removed ([deploy.sh](https://github.com/Jeffrey-Keyser/logos/blob/c7ea06ff741f3e3daab4d624768ba94553d85708/deploy.sh)).

Secret keys written into `.env` are `DATABASE_PASSWORD`, `LOGOS_SERVICE_TOKEN`, `LOGOS_STRUCT_TOKEN`, `RABBITMQ_URL` and optionally `CRON_API_KEY` ([deploy.sh:L68-L82](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/deploy.sh#L68-L82)). The HTTP fallback fetches `CRON_API_KEY` from `cron-service/production/CRON_API_KEY` and treats it like the other keys: if that fetch fails, the existing value is kept ([deploy.sh](https://github.com/Jeffrey-Keyser/logos/blob/91d3a349b1a27e3036cf774e14c31d27119b6458/deploy.sh)).

**Public hostname.** The CLI defaults to `https://logos.jeffreykeyser.net` ([src/bin/logos.ts:L5](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bin/logos.ts#L5)). A code comment mentions a cloudflared edge in front of Logos ([src/query/synthesize.ts:L29-L37](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/query/synthesize.ts#L29-L37)). The tunnel configuration itself is not in the provided source.

## Health and status

| Endpoint | Auth | Checks | Source |
|---|---|---|---|
| `GET /health` | none | Liveness only. Returns `{status:"ok"}` with no database or model check. | [src/routes/health.ts:L7-L13](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/routes/health.ts#L7-L13) |
| `GET /ready` | none | Runs `SELECT 1` and an embedding probe. Returns 503 on failure. | [src/routes/health.ts:L22-L53](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/routes/health.ts#L22-L53) |
| `GET /v1/_status` | bearer token | Reports version, uptime, model and latest migration. | [src/routes/v1/status.ts:L14-L30](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/routes/v1/status.ts#L14-L30) |

**The deploy smoke test only hits `/health`.** A passing deploy therefore does not prove that the database or embeddings are ready. Check `/ready` for that.

## Observability

- **Request logs.** Logs use Morgan's `dev` format, and `/health` and `/ready` are skipped ([src/app.ts:L33-L37](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/app.ts#L33-L37)). Errors are logged with the request method and path ([src/app.ts:L56-L64](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/app.ts#L56-L64)).
- **Console prefixes:**
  - `[bus]` for connect, reconnect, publish drops and consumer settle failures. A failed ack or nack on a closed channel is logged as a warning and not retried by the process; the broker redelivers the unacked message ([src/bus/rabbit.ts:L207-L228](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bus/rabbit.ts#L207-L228), [src/bus/consumer.ts](https://github.com/Jeffrey-Keyser/logos/blob/91d3a349b1a27e3036cf774e14c31d27119b6458/src/bus/consumer.ts)).
  - `[ingest]` for worker jobs ([src/worker/ingest.ts:L293](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/worker/ingest.ts#L293)).
  - `[cron]` for RSS, digest and reembed summaries ([src/cron/rss-poll.ts:L123-L125](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/cron/rss-poll.ts#L123-L125)).
- **Where logs go.** Logs go to stdout. Reading them through the user journal is likely but not confirmed.
- **Domain audit data:**
  - `ingest_job.status`, `attempts` and `last_error` record job progress ([src/db/repos/ingest-job.ts:L11-L23](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/db/repos/ingest-job.ts#L11-L23)).
  - `query_log` rows record outcome, latency, context scope and caller. They are written fire-and-forget ([src/query/run.ts:L94-L121](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/query/run.ts#L94-L121)).
  - The daily digest lists empty-hub questions from the past 24h ([src/cron/digest.ts:L77-L93](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/cron/digest.ts#L77-L93)).
- **Metrics.** No metrics exporter is visible in the provided excerpts.
