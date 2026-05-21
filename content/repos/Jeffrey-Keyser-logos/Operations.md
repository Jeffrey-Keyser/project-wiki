---
title: Logos — Operations
description: Deploy path, systemd unit, port, secrets, health probe, logging, and on-call notes for the Logos service.
---

# Operations

Logos is a deployable HTTP service, not a library. It runs on the Beelink homelab box behind a Cloudflare Tunnel.

## Runtime

| Item | Value |
|---|---|
| Entry | `dist/bin/www.js` ([logos.service:9](https://github.com/Jeffrey-Keyser/logos/blob/main/logos.service#L9)) |
| Port | **3070** ([logos.service:19](https://github.com/Jeffrey-Keyser/logos/blob/main/logos.service#L19), [README.md:426](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L426)) |
| Domain | `logos.jeffreykeyser.net` ([README.md:426](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L426)) |
| Systemd unit | `logos.service` (user unit at `~/.config/systemd/user/logos.service`) ([logos.service](https://github.com/Jeffrey-Keyser/logos/blob/main/logos.service), [README.md:424](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L424)) |
| Working dir | `/home/jkeyser/logos` ([logos.service:8](https://github.com/Jeffrey-Keyser/logos/blob/main/logos.service#L8)) |
| Restart policy | `on-failure`, RestartSec=2, StartLimitBurst=5 ([logos.service:12-15](https://github.com/Jeffrey-Keyser/logos/blob/main/logos.service#L12-L15)) |
| Env file | `/home/jkeyser/logos/.env` populated from Solo Vault at deploy ([logos.service:21](https://github.com/Jeffrey-Keyser/logos/blob/main/logos.service#L21), [README.md:432](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L432)) |

## Start / stop

```bash
systemctl --user start logos
systemctl --user restart logos
journalctl --user -u logos -f
```

`ExecStop` sends SIGTERM with a 15s timeout; the process drains the ingest worker, closes the RabbitMQ consumer/publisher, then closes the HTTP server ([logos.service:10-11](https://github.com/Jeffrey-Keyser/logos/blob/main/logos.service#L10-L11), [src/bin/www.ts:62-82](https://github.com/Jeffrey-Keyser/logos/blob/main/src/bin/www.ts#L62-L82)).

## Deploy path

Auto-deploy is driven by `beelink-deploy` on push to `main`. The hook invokes `deploy.sh` which:

1. Exports `XDG_RUNTIME_DIR` and `DBUS_SESSION_BUS_ADDRESS` so `systemctl --user` works under the deploy daemon ([deploy.sh:4-7](https://github.com/Jeffrey-Keyser/logos/blob/main/deploy.sh#L4-L7)).
2. Pulls secret values from Solo Vault (`SOLO_VAULT_URL`, default `http://localhost:3015`) into `.env` ([deploy.sh:10-11](https://github.com/Jeffrey-Keyser/logos/blob/main/deploy.sh#L10-L11)).
3. Runs `npm ci`, `npm run build`, `npm run migrate`, then `systemctl --user restart logos` ([README.md:430](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L430)).

Pre-deploy one-time setup includes `npm run prepare:models` to fetch the 130MB `bge-small-en-v1.5` ONNX file into `~/logos/models/` ([README.md:454-455](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L454-L455)).

## Cloudflare Tunnel

Add to `~/.cloudflared/config.yml`:

```yaml
ingress:
  - hostname: logos.jeffreykeyser.net
    service: http://localhost:3070
```

([README.md:436-443](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L436-L443))

## Health probe

`GET /health` is unauthenticated and returns `{status, db, embed, took_ms}`. The embedding model is warmed (one dummy embed) before `app.listen()` so a healthy `/health` implies ONNX is loaded ([src/app.ts:42-50](https://github.com/Jeffrey-Keyser/logos/blob/main/src/app.ts#L42-L50), [src/bin/www.ts:12-14](https://github.com/Jeffrey-Keyser/logos/blob/main/src/bin/www.ts#L12-L14), [README.md:416](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L416)).

## Logging

Structured request logging via `express-server-factory`'s `dev` logger, with `/health` filtered out to keep journals quiet ([src/app.ts:32-36](https://github.com/Jeffrey-Keyser/logos/blob/main/src/app.ts#L32-L36)). Errors are logged with method + path context ([src/app.ts:55-64](https://github.com/Jeffrey-Keyser/logos/blob/main/src/app.ts#L55-L64)). Read with `journalctl --user -u logos`.

## Resilience

The RabbitMQ client connects after the HTTP listener is up; if the broker is unreachable the process logs `[bus] initial connect failed; HTTP up, bus disabled` and continues serving HTTP. The bus reconnects on its own schedule ([src/bin/www.ts:26-40](https://github.com/Jeffrey-Keyser/logos/blob/main/src/bin/www.ts#L26-L40)).

## Secrets

Solo Vault namespace `logos` holds `service-token`, `struct-token`, `rabbitmq-*`, `db-password`. Real values are pulled into `~/logos/.env` at deploy time; `.env.example` lists keys ([README.md:30](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L30), [README.md:92](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L92), [README.md:432](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L432)).

## Auth model

Single bearer token on `/v1/*` ([src/app.ts:50](https://github.com/Jeffrey-Keyser/logos/blob/main/src/app.ts#L50)). The browser-only `/proposals` route uses a `?t=<token>` query-token middleware inside the router ([src/app.ts:52-53](https://github.com/Jeffrey-Keyser/logos/blob/main/src/app.ts#L52-L53)). `/health` is open ([README.md:416](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L416)).

## On-call cheatsheet

- HTTP 500s — check `journalctl --user -u logos -n 200` for the request-error log lines emitted by `app.ts` ([src/app.ts:57-61](https://github.com/Jeffrey-Keyser/logos/blob/main/src/app.ts#L57-L61)).
- Ingest stuck — look at `ingest_job.status` and `last_error` columns; the worker uses `SELECT ... FOR UPDATE SKIP LOCKED` so manual `UPDATE` to `failed` is safe ([README.md:220-222](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L220-L222)).
- Embedding warmup slow — cold load is ~3.1s on the N150, then ~50ms steady-state; `/health` will block until warmup returns ([README.md:508-513](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L508-L513), [src/bin/www.ts:12](https://github.com/Jeffrey-Keyser/logos/blob/main/src/bin/www.ts#L12)).
- Bus down — non-fatal; HTTP continues. Reconnects on its own ([src/bin/www.ts:36-40](https://github.com/Jeffrey-Keyser/logos/blob/main/src/bin/www.ts#L36-L40)).
