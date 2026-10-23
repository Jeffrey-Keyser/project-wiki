---
title: "Operations"
description: "Start, deploy, health and observability for the self-hosted AI Proxy service, separating documented runtime facts from what is verified."
---

# Operations

AI Proxy is a deployable HTTP service, not a library. Everything below comes from repository source and docs. Nothing on this page was verified against the live host.

## Start

- **Locally.** Run `npm run dev`. In production the command is `npm start`, which runs `node ./dist/bin/www.js` ([server/package.json:L6-L7](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/package.json#L6-L7)).
- **systemd unit.** The canonical unit file is `deploy/ai-proxy.service`. It:
  - runs as `jkeyser` from the `server/` directory;
  - sets `NODE_ENV=production`;
  - executes `/usr/bin/node …/dist/bin/www.js`;
  - restarts on failure after 10 seconds ([deploy/ai-proxy.service:L5-L23](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/deploy/ai-proxy.service#L5-L23)).
- **Shutdown.** On SIGTERM or SIGINT the server closes and flushes telemetry. If the port is already in use (EADDRINUSE), the process exits with code 1 ([server/bin/www.ts:L28-L52](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/bin/www.ts#L28-L52)).

## Deploy

1. On the host, run `./deploy.sh` from the repo root. Tune it with `HEALTH_URL`, `HEALTH_TIMEOUT_SECS` (default 45), `HEALTH_INTERVAL_SECS` (default 3) and `RESTART_CMD` ([docs/deployment.md:L146-L167](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/deployment.md#L146-L167)).
2. If you need to restart manually: `sudo systemctl restart ai-proxy`.
3. Check the service: `systemctl status ai-proxy`.
4. Read logs: `journalctl -u ai-proxy -f` ([CLAUDE.md:L164-L176](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/CLAUDE.md#L164-L176)).

The old wiki described a systemd *user* unit. The current docs and unit file use a system unit, and the AWS deployment path is legacy ([docs/deployment.md:L181](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/deployment.md#L181)).

## Configuration and secrets

**Where values come from.** Configuration is read in this order, and a value that is already set is never overridden ([server/config/env.ts:L46-L72](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/config/env.ts#L46-L72), [server/config/env.ts:L125](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/config/env.ts#L125)):
1. The process environment.
2. A shared secrets file, read before any other setting.
3. `server/.env`.

**Secrets file path.** The code default is `/etc/ai-proxy/secrets.env`; `AI_PROXY_SECRETS_FILE` overrides it ([server/config/env.ts:L35](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/config/env.ts#L35)). Newer docs say the host points that variable at a file under the service user's `~/.config/ai-proxy/` ([docs/image-model-setup.md:L18-L27](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/image-model-setup.md#L18-L27)).

**Missing service key.** If `AI_PROXY_API_KEY` is missing, startup stops with an error naming the secrets path ([docs/deployment.md:L122-L124](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/deployment.md#L122-L124)).

**Claude budget variables** ([docs/anthropic-credit-lane.md:L11-L17](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/anthropic-credit-lane.md#L11-L17)):
- `ANTHROPIC_MONTHLY_BUDGET_USD`, default 90.
- `ANTHROPIC_DAILY_BUDGET_USD`.
- `ANTHROPIC_BUDGET_CYCLE_DAY`, which must be 1–28.

## Health and observability

- **`GET /health`** is served by the server factory and includes a database check ([server/app.ts:L171-L179](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/app.ts#L171-L179)).
- **`GET /ping`** returns `pong` ([server/routes/index.ts:L14-L16](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/routes/index.ts#L14-L16)).
- **`GET /v1/diagnostics/detailed`** reports backend, database and auth-service status ([server/routes/diagnostics.ts:L86-L97](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/routes/diagnostics.ts#L86-L97)).
- **`GET /internal/anthropic-budget`** answers direct loopback requests only. It reports cycle spend and remaining budget ([docs/anthropic-credit-lane.md:L37-L41](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/anthropic-credit-lane.md#L37-L41)).
- **Tracing.** OpenTelemetry starts before Express loads ([server/bin/www.ts:L10-L12](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/bin/www.ts#L10-L12)). Each request gets an OpenTelemetry trace context derived from its correlation ID, which also appears in logs and in `X-Request-ID` ([server/middleware/correlationId.ts:L9-L17](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/correlationId.ts#L9-L17)). The exporter endpoint is not shown in the provided source.
- **Startup banner.** On boot the server logs its version, `NODE_ENV`, `PORT`, `ORIGIN_BASE_URL` and `PAY_SERVICE_URL` ([server/app.ts:L38-L45](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/app.ts#L38-L45)).

## Documented vs verified

| Topic | What the sources say | Status |
|---|---|---|
| Port | Code default is 3001 ([server/config/env.ts:L134](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/config/env.ts#L134)). CLAUDE.md says 3005 ([CLAUDE.md:L179](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/CLAUDE.md#L179)). The deployment guide's health URL uses 3001 ([docs/deployment.md:L164](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/deployment.md#L164)). | Unverified |
| Public hostname | `ai-proxy.jeffreykeyser.net` ([docs/deployment.md:L7](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/deployment.md#L7)), `api.ai-proxy.jeffreykeyser.net` ([README.md:L183](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/README.md#L183)) and `ai-proxy-api.jeffreykeyser.net` ([docs/TYPESAFE_SYSTEM_ONE.md:L54](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/TYPESAFE_SYSTEM_ONE.md#L54)) all appear. | Inconsistent |
| TypeSafe endpoint | Local and public `/v1/systemone` calls returned 200 on the recorded date ([docs/TYPESAFE_SYSTEM_ONE.md:L23-L27](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/TYPESAFE_SYSTEM_ONE.md#L23-L27)) | Point-in-time evidence |

## Known gotchas

- **Image requests over HTTP/3.** Long image generations can fail under Cloudflare HTTP/3 with `QUIC_TOO_MANY_RTOS`. The fix is to disable HTTP/3 for the zone ([README.md:L304-L313](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/README.md#L304-L313)).
- **Claude budget check failures.** If the budget check itself fails, the request is allowed through. The Anthropic Console spend limit remains the hard backstop ([server/middleware/anthropicBudget.ts:L9-L12](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/anthropicBudget.ts#L9-L12)).

See [Iteration Loop](../iteration-loop/) for how changes reach the host.
