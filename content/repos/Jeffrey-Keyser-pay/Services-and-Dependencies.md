---
title: Services and Dependencies
description: Inbound and outbound integrations for the Pay backend.
---

# Services and Dependencies

## Depends on

### Runtime services
- **PostgreSQL** — primary store, two schemas (`contact`, `billing`); accessed via `pg` ([server/package.json:69](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L69), [CLAUDE.md:386-413](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L386-L413)).
- **Redis** — JWT blacklist, session storage, rate-limiting, generic cache via `ioredis` ([server/package.json:65](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L65), [CLAUDE.md:264-282](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L264-L282)).
- **Stripe** — payment provider; default `PaymentProvider` implementation ([server/package.json:72](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L72), [CLAUDE.md:144-160](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L144-L160)).
- **SMTP server** — outbound email via Nodemailer; can be swapped for mock or console ([server/package.json:68](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L68), [CONTRIBUTING.md:240-249](https://github.com/Jeffrey-Keyser/pay/blob/main/CONTRIBUTING.md#L240-L249)).
- **AWS S3** — `@aws-sdk/client-s3` for file storage; swappable to local filesystem ([server/package.json:38-39](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L38-L39), [CLAUDE.md:251-258](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L251-L258)).
- **AMQP / RabbitMQ** — event bus via `amqplib` ([server/package.json:51](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L51)).
- **OpenTelemetry collector (OTLP/HTTP)** — exporter target for traces ([server/package.json:48-50](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L48-L50)).

### First-party packages
- `@jeffrey-keyser/pay-domain-core` — domain services ([server/package.json:46](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L46)).
- `@jeffrey-keyser/pay-api-types` — shared DTOs/types ([server/package.json:44](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L44)).
- `@jeffrey-keyser/api-errors` — typed errors, `HttpErrorMapper`, correlation IDs ([server/package.json:40](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L40)).
- `@jeffrey-keyser/database-base-config` — shared migration toolchain ([server/package.json:41](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L41), [CLAUDE.md:386-413](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L386-L413)).
- `@jeffrey-keyser/pay-auth-integration` — server middleware + react components consumed by downstream apps ([server/package.json:45](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L45)).
- `@jeffrey-keyser/message-contracts` — typed event payloads for the bus ([server/package.json:43](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L43)).
- `@jeffrey-keyser/github-error-issues` — middleware that opens GitHub issues on errors ([server/package.json:42](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L42), [server/app.ts:3](https://github.com/Jeffrey-Keyser/pay/blob/main/server/app.ts#L3)).

### Framework / lib
- Express 5, body-parser, cookie-parser, cors, helmet equivalents, express-session, express-rate-limit, swagger-jsdoc, jsonwebtoken, bcrypt, pino + pino-http ([server/package.json:53-75](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L53-L75)).

## Consumed by

- **ServerlessWebTemplate** — primary downstream consumer; uses Pay for auth + payments ([CLAUDE.md:7-9](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L7-L9)).
- **`@jeffrey-keyser/pay-auth-integration`** — published SDK whose server middleware and React widgets proxy through this backend; lives in its own repo but pins to Pay's API ([CLAUDE.md:443-471](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L443-L471)).
- **Personal web apps** — any app calling `/api/v1/users/*`, `/api/v1/payment/*`, `/api/v1/apps/*` ([CLAUDE.md:53-75](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L53-L75)).
- **Swagger UI** at `/api-docs` — human + automation consumers ([README.md:140-143](https://github.com/Jeffrey-Keyser/pay/blob/main/README.md#L140-L143)).
- **Admin token holders** — generated via `POST /users/admin/generateToken` for system integration and Swagger automation ([CLAUDE.md:480-501](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L480-L501)).

## Cross-repo wiki

- `pay-domain-core` — [https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-pay-domain-core/](https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-pay-domain-core/)
- `pay-api-types` — [https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-pay-api-types/](https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-pay-api-types/)
- `pay-auth-integration` — [https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-pay-auth-integration/](https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-pay-auth-integration/)
- `database-base-config` — [https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-database-base-config/](https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-database-base-config/)
