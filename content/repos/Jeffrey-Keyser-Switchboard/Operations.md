---
title: "Operations"
description: "Start, build, test, health, and observability commands for Switchboard, with documented versus verified runtime notes."
---

# Operations

Switchboard is a long-running Node/Express service, not a library. The current deployment document describes a self-hosted systemd unit behind a Cloudflare Tunnel ([DEPLOYMENT_BEELINK.md:L3-L6](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/docs/DEPLOYMENT_BEELINK.md#L3-L6)). That is documented. The excerpts do not prove it is currently running.

## Commands

| Task | Command | Source |
|------|---------|--------|
| Dev server | `npm run dev` (ts-node `bin/www.ts`) | [server/package.json:L7](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/package.json#L7) |
| Build | `npm run build` (tsc) | [server/package.json:L8](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/package.json#L8) |
| Start | `npm start` (`node ./dist/bin/www.js`) | [server/package.json:L6](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/package.json#L6) |
| Lint | `npm run lint` | [server/package.json:L10](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/package.json#L10) |
| Test | `npm test` / `npm run test:coverage` | [server/package.json:L11-L13](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/package.json#L11-L13) |
| DB deploy | `cd server/db && ./deploy.sh` | [deploy.sh:L3-L6](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/db/deploy.sh#L3-L6) |

## Deploy and runtime

- **Port.** `bin/www.ts` listens on `config.PORT` ([www.ts:L17](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/bin/www.ts#L17)). The documented value is `3053`, bound to localhost, with a note to keep it in sync with `server/.env` ([DEPLOYMENT_BEELINK.md:L14-L27](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/docs/DEPLOYMENT_BEELINK.md#L14-L27)). The default in `config/env.ts` is not in the excerpts, so it is unknown.
- **Process.** The unit is `switchboard-server`, managed with `systemctl --user` ([DEPLOYMENT_BEELINK.md:L57-L58](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/docs/DEPLOYMENT_BEELINK.md#L57-L58)).
- **Public URL.** Documented as `switchboard.jeffreykeyser.net` ([DEPLOYMENT_BEELINK.md:L19](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/docs/DEPLOYMENT_BEELINK.md#L19)).
- **Cache.** Documented default is in-memory (`CACHE_STRATEGY=memory`) ([DEPLOYMENT_BEELINK.md:L22](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/docs/DEPLOYMENT_BEELINK.md#L22)).
- **Docs versus verified.** The Lambda deploy steps in the older README and CLAUDE guide are not current. Check the Beelink document and the workflow comment before relying on either ([ci-cd-pipeline.yml:L215-L222](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/.github/workflows/ci-cd-pipeline.yml#L215-L222)).

## Health

- `GET /health` is enabled by the app's health check config, with a database check ([app.ts:L160-L168](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/app.ts#L160-L168)). The documented response shape is in [MONITORING.md](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/docs/MONITORING.md#L14-L34).
- `GET /ping` returns `pong` ([routes/index.ts:L22-L24](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/routes/index.ts#L22-L24)).
- `GET /api/v1/cache/health` reports cache health and strategy ([routes/cache.ts:L54-L70](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/routes/cache.ts#L54-L70)).
- `GET /api/v1/diagnostics/detailed` calls `getDetailedDiagnostics` ([routes/diagnostics.ts:L106-L109](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/routes/diagnostics.ts#L106-L109)).

## Observability

- **Logs.** The code mostly uses `console.log` and `console.error` ([DAL base query logging](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/dal/BaseDal.ts#L21-L32)). The app logs its config at startup ([app.ts:L29-L37](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/app.ts#L29-L37)).
- **Metrics.** CloudWatch metrics are gated by environment ([metrics.ts:L36](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/middleware/metrics.ts#L36)). Dashboards and alarms are documented in [ALERTS.md](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/docs/ALERTS.md#L5-L7), not verified.
- **Realtime.** SSE polls every 2 seconds and sends a heartbeat every 30 seconds ([realtime.ts:L141](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/routes/realtime.ts#L141), [realtime.ts:L177-L183](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/routes/realtime.ts#L177-L183)).

## Testing

Backend CI runs `npm run test:coverage` in `server/` on pull requests ([ci-cd-pipeline.yml:L146-L151](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/.github/workflows/ci-cd-pipeline.yml#L146-L151)).
