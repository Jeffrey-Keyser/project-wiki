---
title: "nof1 Services and Dependencies"
description: "What nof1 depends on and who consumes it, separating confirmed callers from expected or unknown ones."
---

# Services and Dependencies

## Depends on

- **PostgreSQL:** Database settings are read from environment variables and passed to a shared pool ([server/config/env.ts:L45-L56](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/config/env.ts#L45-L56), [server/db/connection.ts:L1-L4](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/db/connection.ts#L1-L4)). The schema lives in the `nof1` schema ([server/db/schema/001-nof1-tables.sql:L4](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/db/schema/001-nof1-tables.sql#L4)).
- **Pay auth service:** The API uses `setupPayAuth` with a Pay URL defaulting to the public Pay host ([server/app.ts:L20](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/app.ts#L20), [server/app.ts:L31-L33](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/app.ts#L31-L33)). The client also points its auth provider at the API ([client/src/index.tsx:L26](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/client/src/index.tsx#L26)).
- **Session table:** Sessions are stored in `nof1.user_sessions` ([server/app.ts:L81-L89](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/app.ts#L81-L89)).
- **RabbitMQ:** A `RABBITMQ_URL` setting defaults to a local AMQP URL ([server/config/env.ts:L74](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/config/env.ts#L74)). No publishing or consuming code appears in the excerpts, so actual use is unknown.
- **Cloudflare Tunnel:** Routing is documented as configured outside the repo ([CLAUDE.md:L17](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/CLAUDE.md#L17)). This is documented, not verified.

## Consumed by

**Confirmed:**

- **nof1 React client:** It calls the API under `/api/v1` with a configurable base URL ([client/src/store/api.ts:L25-L30](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/client/src/store/api.ts#L25-L30)).

**Expected or unknown:**

- **Other API clients:** Swagger UI is served at `/api-docs` and is public ([server/app.ts:L39](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/app.ts#L39), [server/app.ts:L116-L121](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/app.ts#L116-L121)). The excerpts show no other callers. Treat any other consumer as unknown.
- **Message consumers:** Unknown. The config exists, but no consumer is in the excerpts.
- **Pay service:** The API calls it for authentication. Whether Pay depends on nof1 is unknown.

Source existence does not confirm a deployment. Verify production wiring before documenting it as live.
