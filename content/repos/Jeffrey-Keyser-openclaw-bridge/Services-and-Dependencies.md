---
title: "Services and Dependencies"
description: "What openclaw-bridge depends on and what consumes it, separating confirmed callers in source from expected or unknown consumers."
---

# Services and Dependencies

The bridge consumes RabbitMQ events and HTTP requests, then calls out to agent endpoints and several local services. Confirmed means the source shows the call. Expected means the source only suggests a consumer, and unknown means this snapshot does not show it.

## Depends on

**Libraries.** Express, body-parser, amqplib, the message contracts package, `pg`, `mailparser`, `resend`, `twilio`, and the Anthropic SDK are listed in the package manifest ([package.json:L13-L22](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/package.json#L13-L22)). The excerpts show no `resend` or Anthropic import, so their use is unknown.

**RabbitMQ (confirmed).** Connects using `RABBITMQ_URL` ([src/services/rabbit.js:L10](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/rabbit.js#L10)). The bridge also calls the management API for queue and consumer state ([src/services/rabbit.js:L158-L174](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/rabbit.js#L158-L174)).

**OpenClaw webhook (confirmed call).** Default URL is a localhost hook path, and the bearer token comes from `OPENCLAW_HOOK_TOKEN` ([src/services/openclaw.js:L8-L9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/openclaw.js#L8-L9)). The source includes a fallback token value, which should be removed.

**NanoClaw agent API (confirmed call, gated).** Used only when `NANOCLAW_ENABLED` is `true` ([src/services/nanoclaw.js:L7](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/nanoclaw.js#L7)). The default URL is `http://127.0.0.1:3102/api/v1/agent-events` ([L8](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/nanoclaw.js#L8)). Whether NanoClaw is enabled in production is unknown.

**Ping API.** Used for gym workout provisioning. Base URL defaults to `localhost:3007`, with `PING_API_KEY` as the key ([src/handlers/ping.js:L19-L20](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/ping.js#L19-L20)). Without the key, the handler returns a fallback message ([L115-L118](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/ping.js#L115-L118)).

**Other HTTP services called directly:**
- Prompt registry, default `localhost:3002`, for thrash prompts ([src/handlers/thrash.js:L15](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/thrash.js#L15)).
- Cron service API, default `localhost:3016`, for Spanish lesson jobs ([src/handlers/spanish-scheduler.js:L22](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/spanish-scheduler.js#L22)).
- Flights service at `localhost:3081` for parse and purge commands ([src/handlers/flights.js:L15](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/flights.js#L15), [src/handlers/flights-purge.js:L15](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/flights-purge.js#L15)).
- Twilio API, through credentials in environment variables ([src/handlers/twilio.js:L21-L25](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/twilio.js#L21-L25)).

**Postgres.** The Spanish tutor and CCW email webhook each create a `pg` pool with a configurable connection string ([src/handlers/spanish.js:L21-L23](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/spanish.js#L21-L23), [src/handlers/ccw-email-webhook.js:L15-L17](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/ccw-email-webhook.js#L15-L17)).

**Local CLIs.** The email proxy runs `himalaya`, and the calendar route references `ical.py` ([src/index.js:L258-L263](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L258-L263)).

**Filesystem.** Agency tasks are written as JSON files into an IPC directory for NanoClaw ([src/handlers/agency.js:L16](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/agency.js#L16), [L43-L62](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/agency.js#L43-L62)).

## Inbound sources

Confirmed subscriptions, from the handler registry and each module:
- `ping.events` fanout, used by the ping, workout, and drive handlers ([src/handlers/workout.js:L78](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/workout.js#L78), [src/handlers/drive.js:L94](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/drive.js#L94)).
- `cron.alerts` with pattern `#` ([src/handlers/cron.js:L14-L16](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/cron.js#L14-L16)).
- `cron.jobs` triggers for briefing, news, backups, flights, and reconnect probe ([src/handlers/briefing.js:L11-L13](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/briefing.js#L11-L13), [src/handlers/reconnect-probe.js:L17-L19](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/reconnect-probe.js#L17-L19)).
- `ccw.events` with `email.*` and `contact.*` patterns ([src/handlers/ccw-email.js:L22-L24](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/ccw-email.js#L22-L24), [src/handlers/ccw-contact.js:L11-L13](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/ccw-contact.js#L11-L13)).
- `agency.events`, `packages.events`, and `thrash.events` ([src/handlers/agency.js:L12-L14](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/agency.js#L12-L14), [src/handlers/package.js:L11-L13](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/package.js#L11-L13), [src/handlers/thrash.js:L11-L13](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/thrash.js#L11-L13)).

HTTP inbound routes include `/twilio/*`, `/email/inbound`, and `/ccw/contact` ([src/index.js:L130-L153](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L130-L153), [L205-L212](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L205-L212), [L225-L227](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L225-L227)). The decisions handler says it is called from Agency HQ, but the route is not visible in the excerpt ([src/handlers/decisions.js:L5-L7](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/decisions.js#L5-L7)).

## Consumed by

- **Milo / OpenClaw:** confirmed as the webhook target. Receipt on the other end is unknown ([src/services/openclaw.js:L53-L68](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/openclaw.js#L53-L68)).
- **NanoClaw:** confirmed as the agent-events target when enabled. The IPC directory is an expected consumer of agency tasks, but the consumer is not in this snapshot ([src/handlers/agency.js:L16](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/agency.js#L16)).
- **Cloudflare email worker:** described as the sender of `/email/inbound` ([src/index.js:L204](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L204)). Unknown and unverified here.
- **Cron-service admin UI:** the CORS comment names a cron-service origin ([src/index.js:L35](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L35)). The caller is expected, not confirmed.
- **Spanish tutor and session tutor:** they consume messages published by the dispatchers on the same Spanish exchanges ([src/handlers/spanish-dispatcher.js:L35](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/spanish-dispatcher.js#L35), [src/handlers/spanish-session-tutor.js:L16-L18](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/spanish-session-tutor.js#L16-L18)).

Not in the registry: the older wiki listed `qa-patrol`, `summary`, `cron-health`, and `logos`. No such entries appear in the current registry ([src/handlers/index.js:L38-L62](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/index.js#L38-L62)). A documented auto-reply handler is also absent from the registry ([docs/ccw-auto-reply.md:L62](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/docs/ccw-auto-reply.md#L62)).
