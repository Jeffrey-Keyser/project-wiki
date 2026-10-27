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
- **`@jeffrey-keyser/message-contracts`** provides event payload types. The inactive `EventPublisher` imports them as types only ([server/services/EventPublisher.ts](https://github.com/Jeffrey-Keyser/ping/blob/03ee2f4b952bdcf9d5397284b5751a50c8d5513c/server/services/EventPublisher.ts)).
- **Other declared server packages:** `database-base-config`, `express-middleware-suite`, `github-error-issues`, and `pay-api-types` ([server/package.json:L24-L29](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L24-L29)). Being declared does not show runtime use.
- **Client packages:** `feedback-widget`, `personal-ui-kit`, and `redux-app-toolkit` ([client/package.json:L9-L13](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/package.json#L9-L13)).
- Installs need `GITHUB_TOKEN` for these packages ([AGENTS.md:L21-L23](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/AGENTS.md#L21-L23)).

### Third-party runtime

- **PostgreSQL.** The root `package.json` declares `pg` ([package.json:L4](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/package.json#L4)), and DAL files query through a shared pool ([server/dal/PingDal.ts:L1](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/dal/PingDal.ts#L1)). The pool module itself is not in the excerpts.
- **RabbitMQ client (`amqplib`).** `server/package.json` still declares it ([server/package.json:L31](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L31)). The inactive `EventPublisher` no longer imports it and does not connect to a broker ([server/services/EventPublisher.ts](https://github.com/Jeffrey-Keyser/ping/blob/03ee2f4b952bdcf9d5397284b5751a50c8d5513c/server/services/EventPublisher.ts)). This change did not modify the package manifest, so whether the dependency is removed later is not shown.
- **Express 5, express-session, ws, and pino** ([server/package.json:L40-L53](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L40-L53)).
- **Leaflet and Recharts** in the client ([client/package.json:L22](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/package.json#L22), [client/package.json:L31](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/package.json#L31)).

### External services

- **Pay service.** The default URL is `https://pay.jeffreykeyser.net`, overridable by `PAY_SERVICE_URL` ([server/app.ts:L81](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L81), [server/config/env.ts:L145-L146](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/config/env.ts#L145-L146)).
- **Analytics Pulse.** `ANALYTICS_PULSE_URL` remains a compatible config value with a default set in config ([server/config/env.ts:L152](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/config/env.ts#L152)). `sendTelemetryEvent` no longer posts to it and has no effect on this sender; telemetry is logged locally ([server/services/telemetry.ts](https://github.com/Jeffrey-Keyser/ping/blob/fa26c56e872f22f1d71dd625498d1404bebcbbef/server/services/telemetry.ts), [docs/designs/local-routine-telemetry.md](https://github.com/Jeffrey-Keyser/ping/blob/fa26c56e872f22f1d71dd625498d1404bebcbbef/docs/designs/local-routine-telemetry.md)). Whether a receiver is live is unknown.
- **Runtime incident transport.** Configured through environment flags; the README points to a coordinated rollout in another repo ([README.md:L142-L144](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L142-L144)). Live status is unknown.
- **Cloudflare Tunnel** as public ingress ([README.md:L35](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L35)).
- **`beelink-deploy` webhook**, which runs the deploy script ([README.md:L63](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L63)). Its configuration is not in the repo.

## Consumed by

### Confirmed in source

- **The web app** calls the API through RTK Query slices ([client/src/reducers/index.ts:L6-L14](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/src/reducers/index.ts#L6-L14)).
- **Shortcut installers** can fetch iCloud links from `/api/v1/shortcuts/links`, which is public ([server/routes/shortcuts.ts:L47-L56](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/shortcuts.ts#L47-L56), [server/app.ts:L108](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L108)).

### Routine-event consumers (inactive)

- External consumers of the routine-event feed stop receiving it once the updated process runs. The affected events are location arrivals and departures, Bluetooth connect and disconnect, drive start and end, and workout session completion. No storage transition, package update, or external consumer change is required by the design ([docs/designs/routine-event-channel-inactive.md](https://github.com/Jeffrey-Keyser/ping/blob/03ee2f4b952bdcf9d5397284b5751a50c8d5513c/docs/designs/routine-event-channel-inactive.md), [server/services/EventPublisher.ts](https://github.com/Jeffrey-Keyser/ping/blob/03ee2f4b952bdcf9d5397284b5751a50c8d5513c/server/services/EventPublisher.ts)).
- Weekly digest behavior is documented as unchanged. `DigestService` and `CronSubscriber` keep their own delivery behavior through the digest boundary ([docs/designs/routine-event-channel-inactive.md](https://github.com/Jeffrey-Keyser/ping/blob/03ee2f4b952bdcf9d5397284b5751a50c8d5513c/docs/designs/routine-event-channel-inactive.md)).

### Documented, not verified

- **Apple Shortcuts on the owner's phone** post to location, mood, health, weight, and expense endpoints ([docs/SHORTCUT_ICLOUD_UPLOAD.md:L77](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/SHORTCUT_ICLOUD_UPLOAD.md#L77), [docs/SHORTCUT_ICLOUD_UPLOAD.md:L94](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/SHORTCUT_ICLOUD_UPLOAD.md#L94)). The repo does not verify installed copies ([docs/MOBILE_INTEGRATION.md:L353](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/MOBILE_INTEGRATION.md#L353)).
- **`openclaw-bridge`** was previously named in source as the intended RabbitMQ consumer. The inactive publisher no longer carries that comment ([server/services/EventPublisher.ts](https://github.com/Jeffrey-Keyser/ping/blob/03ee2f4b952bdcf9d5397284b5751a50c8d5513c/server/services/EventPublisher.ts)). A drive-related handler is still described in docs ([docs/DRIVE_TRACKING.md:L306-L315](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/DRIVE_TRACKING.md#L306-L315)). Neither is verified here, so treat it as unconfirmed.

### Unknown or planned

- **Other RabbitMQ subscribers.** The excerpts do not show who else binds to the exchange, so no others are listed.
- **Native iOS app.** Planned to use the same `X-Ping-Key` and JSON protocol ([README.md:L115](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L115)). It does not exist in this snapshot.
