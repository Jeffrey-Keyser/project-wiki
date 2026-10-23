---
title: "Logos — Operations"
description: "How Logos is started, deployed, health-checked and observed, separating documented runtime from verified facts."
---

# Operations

Logos is a deployable HTTP service, not a library. Its entry point is `dist/bin/www.js` ([package.json:L9](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/package.json#L9)).

**Everything on this page is documented by source files.** Nothing here was checked against a live host.

## Start and stop

- **Locally.** Use `npm run dev`. To run the compiled build, use `npm run build && npm start` ([package.json:L7-L9](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/package.json#L7-L9)).
- **On the host, via the `logos.service` unit.** The unit ([logos.service:L7-L20](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/logos.service#L7-L20)):
  - runs from `/home/jkeyser/logos`;
  - sets `PORT=3070` and `NODE_ENV=production`;
  - points `TRANSFORMERS_CACHE` at the models directory;
  - loads `.env`;
  - uses `Restart=on-failure`.
- **Restart command.** The deploy script restarts the service with `systemctl --user restart logos` ([deploy.sh:L136-L137](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/deploy.sh#L136-L137)).
- **Shutdown.** On SIGTERM the process stops the worker and drains the bus best-effort, then closes the HTTP server ([src/bin/www.ts:L62-L80](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bin/www.ts#L62-L80)). Systemd allows 15s for this ([logos.service:L10](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/logos.service#L10)).
- **Startup failures.** If the embedding warmup fails, the process exits ([src/bin/www.ts:L12-L13](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bin/www.ts#L12-L13), [src/bin/www.ts:L81-L84](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bin/www.ts#L81-L84)).

## Deploy

`deploy.sh` runs these steps in order ([deploy.sh:L87-L152](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/deploy.sh#L87-L152)):

1. `git pull origin main`.
2. Pull secrets with `solo-vault pull`. If that fails, fall back to Vault over HTTP. If that also fails, keep the existing `.env`.
3. `npm ci --include=dev`.
4. `prepare:models`.
5. `build`.
6. `migrate`.
7. `seed:prompts`.
8. `register-cron`. A failure here is non-fatal.
9. Restart the service.
10. Poll `curl http://localhost:3070/health` up to 20 times.

Secret keys written into `.env` are `DATABASE_PASSWORD`, `LOGOS_SERVICE_TOKEN`, `LOGOS_STRUCT_TOKEN`, `RABBITMQ_URL` and optionally `CRON_API_KEY` ([deploy.sh:L68-L82](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/deploy.sh#L68-L82)).

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
  - `[bus]` for connect, reconnect and publish drops ([src/bus/rabbit.ts:L207-L228](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bus/rabbit.ts#L207-L228)).
  - `[ingest]` for worker jobs ([src/worker/ingest.ts:L293](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/worker/ingest.ts#L293)).
  - `[cron]` for RSS, digest and reembed summaries ([src/cron/rss-poll.ts:L123-L125](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/cron/rss-poll.ts#L123-L125)).
- **Where logs go.** Logs go to stdout. Reading them through the user journal is likely but not confirmed.
- **Domain audit data:**
  - `ingest_job.status`, `attempts` and `last_error` record job progress ([src/db/repos/ingest-job.ts:L11-L23](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/db/repos/ingest-job.ts#L11-L23)).
  - `query_log` rows record outcome, latency, context scope and caller. They are written fire-and-forget ([src/query/run.ts:L94-L121](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/query/run.ts#L94-L121)).
  - The daily digest lists empty-hub questions from the past 24h ([src/cron/digest.ts:L77-L93](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/cron/digest.ts#L77-L93)).
- **Metrics.** No metrics exporter is visible in the provided excerpts.
