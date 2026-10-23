---
title: "Ping Services and Dependencies"
description: "What Ping depends on, and which callers are confirmed in source versus documented or unknown."
---

# Services and Dependencies

## Depends on

### Internal packages (GitHub Packages)

- **`@jeffrey-keyser/pay-auth-integration`**, pinned at `^6.10.1`, used by the server and client. Only public subpaths are allowed ([server/package.json:L30](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L30), [client/package.json:L11](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/package.json#L11), [AGENTS.md:L8-L12](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/AGENTS.md#L8-L12)).
- **`@jeffrey-keyser/express-server-factory`**, which the app imports for its server setup ([server/app.ts:L2-L3](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L2-L3), [server/package.json:L26](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L26)).
- **`@jeffrey-keyser/api-errors`** provides `correlationIdMiddleware` ([server/app.ts:L7](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L7)).
- **`@jeffrey-keyser/message-contracts`** provides event types and the exchange definition ([server/services/EventPublisher.ts:L2](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/EventPublisher.ts#L2)).
- **Other declared server packages:** `database-base-config`, `express-middleware-suite`, `github-error-issues`, and `pay-api-types` ([server/package.json:L24-L29](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L24-L29)). Being declared does not show runtime use.
- **Client packages:** `feedback-widget`, `personal-ui-kit`, and `redux-app-toolkit` ([client/package.json:L9-L13](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/package.json#L9-L13)).
- Installs need `GITHUB_TOKEN` for these packages ([AGENTS.md:L21-L23](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/AGENTS.md#L21-L23)).

### Third-party runtime

- **PostgreSQL.** The root `package.json` declares `pg` ([package.json:L4](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/package.json#L4)), and DAL files query through a shared pool ([server/dal/PingDal.ts:L1](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/dal/PingDal.ts#L1)). The pool module itself is not in the excerpts.
- **RabbitMQ** via `amqplib` ([server/package.json:L31](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L31)).
- **Express 5, express-session, ws, and pino** ([server/package.json:L40-L53](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L40-L53)).
- **Leaflet and Recharts** in the client ([client/package.json:L22](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/package.json#L22), [client/package.json:L31](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/package.json#L31)).

### External services

- **Pay service.** The default URL is `https://pay.jeffreykeyser.net`, overridable by `PAY_SERVICE_URL` ([server/app.ts:L81](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L81), [server/config/env.ts:L145-L146](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/config/env.ts#L145-L146)).
- **Analytics Pulse.** The default URL is set in config, and telemetry is fire-and-forget ([server/config/env.ts:L152](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/config/env.ts#L152), [server/services/telemetry.ts:L12](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/telemetry.ts#L12)). Whether a receiver is live is unknown.
- **Runtime incident transport.** Configured through environment flags; the README points to a coordinated rollout in another repo ([README.md:L142-L144](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L142-L144)). Live status is unknown.
- **Cloudflare Tunnel** as public ingress ([README.md:L35](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L35)).
- **`beelink-deploy` webhook**, which runs the deploy script ([README.md:L63](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L63)). Its configuration is not in the repo.

## Consumed by

### Confirmed in source

- **The web app** calls the API through RTK Query slices ([client/src/reducers/index.ts:L6-L14](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/src/reducers/index.ts#L6-L14)).
- **Shortcut installers** can fetch iCloud links from `/api/v1/shortcuts/links`, which is public ([server/routes/shortcuts.ts:L47-L56](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/shortcuts.ts#L47-L56), [server/app.ts:L108](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L108)).

### Documented, not verified

- **Apple Shortcuts on the owner's phone** post to location, mood, health, weight, and expense endpoints ([docs/SHORTCUT_ICLOUD_UPLOAD.md:L77](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/SHORTCUT_ICLOUD_UPLOAD.md#L77), [docs/SHORTCUT_ICLOUD_UPLOAD.md:L94](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/SHORTCUT_ICLOUD_UPLOAD.md#L94)). The repo does not verify installed copies ([docs/MOBILE_INTEGRATION.md:L353](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/MOBILE_INTEGRATION.md#L353)).
- **`openclaw-bridge`** is named as the intended RabbitMQ consumer ([server/services/EventPublisher.ts:L205-L207](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/EventPublisher.ts#L205-L207)). A drive-related handler is described in docs ([docs/DRIVE_TRACKING.md:L306-L315](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/DRIVE_TRACKING.md#L306-L315)). Neither is verified here, so treat it as expected and unconfirmed.

### Unknown or planned

- **Other RabbitMQ subscribers.** The excerpts do not show who else binds to the exchange, so no others are listed.
- **Native iOS app.** Planned to use the same `X-Ping-Key` and JSON protocol ([README.md:L115](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L115)). It does not exist in this snapshot.
