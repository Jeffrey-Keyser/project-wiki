---
title: "Services and Dependencies"
description: "Outbound dependencies of the Pay server and its known, documented, and unverified consumers, with source citations."
---

# Services and Dependencies

## Depends on

### Runtime services

- **PostgreSQL** is configured through `DB_*` settings, and `DATABASE_URL` overrides them in test setups ([server/config/env.ts:9-20](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/env.ts#L9-L20), [server/config/env.ts:87-101](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/env.ts#L87-L101)). The `pg` client is a dependency ([server/package.json:72](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L72)).
- **Redis** is configured with `REDIS_HOST` and `REDIS_PORT` ([server/config/env.ts:164-171](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/env.ts#L164-L171)) and is used by the health route ([server/routes/index.ts:146](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/routes/index.ts#L146)).
- **Stripe** is the default payment provider. The server creates a client when `STRIPE_SECRET_KEY` is set ([server/routes/webhooks.ts:16-20](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/routes/webhooks.ts#L16-L20), [server/config/env.ts:78-80](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/env.ts#L78-L80)).
- **SMTP** is used by the Nodemailer path, configured by `SMTP_*` variables ([server/config/env.ts:119-138](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/env.ts#L119-L138)). The `nodemailer` dependency is pinned to `^10.2.1` at this commit ([server/package.json:71](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/server/package.json#L71)).
- **AWS S3** is available through `@aws-sdk/client-s3` and `S3_EXPORTS_BUCKET` ([server/package.json:41](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L41), [server/config/env.ts:35-38](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/env.ts#L35-L38)).
- **AMQP** is conditional on `RABBITMQ_URL` ([server/config/env.ts:223-225](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/env.ts#L223-L225), [server/package.json:54](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L54)).
- **OTLP collector** is used only when `OTEL_ENABLED` is true; it defaults to false ([server/config/env.ts:241-253](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/env.ts#L241-L253)).
- **GitHub issue creation** runs only when `GITHUB_ERROR_ISSUES_ENABLED` is set ([server/app.ts:200-208](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/app.ts#L200-L208)).

### First-party packages

- `@jeffrey-keyser/pay-domain-core` provides domain services ([server/package.json:49](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L49)).
- `@jeffrey-keyser/pay-api-types` provides shared DTOs ([server/package.json:47](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L47)).
- `@jeffrey-keyser/api-errors` provides typed errors and correlation IDs ([server/app.ts:2](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/app.ts#L2)).
- `@jeffrey-keyser/pay-auth-integration` is listed as a server dependency ([server/package.json:48](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L48)). This is a dependency of Pay, not evidence of a consumer.
- `@jeffrey-keyser/database-base-config` supplies the migration toolchain ([server/package.json:44](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L44)).
- Scoped `@jeffrey-keyser/*` packages are installed from GitHub Packages. `server/.npmrc` reads the token from `NODE_AUTH_TOKEN`, and the token is no longer committed ([server/.npmrc](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/server/.npmrc)).

## Consumed by

**Confirmed in this snapshot:** no inbound caller code is in the excerpts, so no caller is confirmed from source.

**Documented, not verified:**

- **ServerlessWebTemplate** uses Pay types and `pay-auth-integration` runtime code ([README.md:29-30](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L29-L30), [CLAUDE.md:7](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/CLAUDE.md#L7)).
- **Swagger UI** at `/api-docs` is served by this server ([server/app.ts:158-166](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/app.ts#L158-L166)).
- **Service account clients** may call `/api/v1/auth/service-token` ([docs/service-auth.md:15-18](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/docs/service-auth.md#L15-L18), [server/routes/v1/index.ts:42-43](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/routes/v1/index.ts#L42-L43)). Refresh and re-issue rules are described in [docs/service-auth.md](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/docs/service-auth.md).

**Expected, unknown:** other personal web apps calling `/api/v1` user, payment, and app routes ([README.md:3](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L3)). No concrete list is in the snapshot.

## Cross-repo wiki

- `pay-domain-core`: [pay-domain-core source](https://github.com/Jeffrey-Keyser/pay-domain-core)
- `pay-api-types`: [pay-api-types source](https://github.com/Jeffrey-Keyser/pay-api-types)
- `pay-auth-integration`: [https://wiki.jeffreykeyser.net/repos/jeffrey-keyser-pay-auth-integration/home/](/repos/jeffrey-keyser-pay-auth-integration/home/)
- `database-base-config`: [database-base-config source](https://github.com/Jeffrey-Keyser/database-base-config)
