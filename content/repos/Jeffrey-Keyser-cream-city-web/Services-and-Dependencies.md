---
title: "Services & Dependencies"
description: "Inbound and outbound integrations of Cream City Web, separating libraries and external services from confirmed callers, documented-only callers, and unknown consumers."
---

# Services & Dependencies

## Depends on

### npm packages
- `express` and `cors` form the payment API HTTP layer ([package.json:L19-L20](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/package.json#L19-L20)).
- `pg` is the PostgreSQL client ([package.json:L22](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/package.json#L22), [db.mjs:L87](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/db.mjs#L87)).
- `amqplib` publishes inbound email events in `poll-email.mjs` ([package.json:L18](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/package.json#L18), [poll-email.mjs:L244-L257](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/poll-email.mjs#L244-L257)).
- `resend` sends outreach and confirmation email ([send-email.mjs:L21](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/send-email.mjs#L21), [api/server.mjs:L326-L329](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L326-L329)).
- `stripe` is listed as a dependency ([package.json:L24](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/package.json#L24)). The API verifies webhook signatures by hand with `crypto` ([api/server.mjs:L246-L252](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L246-L252)).
- `jsdom` parses HTML for site edits ([site-modifier.mjs:L21](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/site-modifier.mjs#L21)).

### External services
- **PostgreSQL** `cream_city_web` on localhost ([README.md:L7](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/README.md#L7)).
- **Pay API**, the billing backend, set by `PAY_API_URL` with a bearer token ([api/server.mjs:L43-L44](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L43-L44), [billing.mjs:L25-L26](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/billing.mjs#L25-L26)).
- **Stripe** Checkout and webhooks. The webhook secret is read from `STRIPE_WEBHOOK_SECRET` ([api/server.mjs:L243](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L243)).
- **Resend** for outbound email from `ai@creamcityweb.com` ([send-email.mjs:L38](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/send-email.mjs#L38), [tools.md:L28-L31](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/tools.md#L28-L31)).
- **Cloudflare**: DNS and tunnel via `cloudflared tunnel route dns -f beelink` ([deploy.mjs:L46](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/deploy.mjs#L46)), Email Routing, and Workers ([tools.md:L37-L42](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/tools.md#L37-L42)).
- **RabbitMQ** defaults to `amqp://localhost` and publishes to exchange `ccw.events` ([poll-email.mjs:L45-L47](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/poll-email.mjs#L45-L47)). The operator trigger uses `cron.jobs` `ccw.run` ([CLAUDE.md:L19](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L19)).
- **NanoClaw IPC** drops JSON files into a fixed directory to reach Telegram ([run.mjs:L21](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/run.mjs#L21), [run.mjs:L32](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/run.mjs#L32)).
- **Solo Vault** overrides env values through `loadSecrets()` ([db.mjs:L6](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/db.mjs#L6), [api/server.mjs:L39](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L39)). The loader is not in the snapshot.
- **Himalaya CLI** reads the inbox for `poll-email.mjs` ([poll-email.mjs:L24](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/poll-email.mjs#L24), [poll-email.mjs:L93](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/poll-email.mjs#L93)). The runbook calls it secondary ([runbook.md:L268](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/docs/runbook.md#L268)).
- **Brave Search** and **Google APIs** support scouting and admin ([tools.md:L9-L24](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/tools.md#L9-L24)).

## Consumed by

**Confirmed in source:**
- **Stripe** is expected to call `POST /webhook/stripe` ([api/server.mjs:L10](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L10), [api/server.mjs:L240](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L240)). Stripe's configuration is not visible.
- **Cloudflare Email Routing** is expected to invoke the worker's `email` handler ([index.js:L8-L9](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/workers/email-receiver/src/index.js#L8-L9)). The worker posts to the configured webhook ([index.js:L42](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/workers/email-receiver/src/index.js#L42)).
- **Browsers** request sites from the static server ([serve.mjs:L2-L5](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/serve.mjs#L2-L5)).

**Documented only, not verified:**
- **cron-service** publishes hourly triggers ([CLAUDE.md:L16-L19](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L16-L19)). The cross-repo wiki reference is https://wiki.jeffreykeyser.net/repos/jeffrey-keyser-cron-service/home/.
- **openclaw-bridge and OpenCLAW** consume the trigger and receive the email webhook ([tools.md:L39](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/tools.md#L39)). Their source is not in the snapshot.
- **Prospects** reach mockups at `{slug}.creamcityweb.com` and staging at `staging.creamcityweb.com` ([README.md:L75-L77](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/README.md#L75-L77)).

**Unknown:** any other callers of the Pay API, the payment page, or the Stripe webhook. The provided excerpts do not show them.

## Notes on mismatches

- The staging banner's feedback link uses `creamcityweb@outlook.com`, the legacy address ([staging.mjs:L193](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/staging.mjs#L193)). The runbook marks that account as deprecated ([tools.md:L44-L46](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/tools.md#L44-L46)).
