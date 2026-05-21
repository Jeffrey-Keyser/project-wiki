---
title: Services and Dependencies
description: Inbound and outbound integrations for business-hq — libraries, message exchanges, datastores, and consumers downstream.
---

# Services and Dependencies

## Depends on

### Runtime services
- **PostgreSQL 17** — shared instance; `business` schema for app data, `absurd` schema for workflow engine ([README.md:22](https://github.com/Jeffrey-Keyser/business-hq/blob/main/README.md#L22)).
- **RabbitMQ** — `amqp://localhost:5672` by default, via `RABBITMQ_URL` env ([src/services/rabbit.ts:4](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/rabbit.ts#L4)).

### Inbound exchanges (subscribed)
- `pay.events` topic exchange — `payment.succeeded`, `subscription.created` ([src/services/pay-consumer.ts:6](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/pay-consumer.ts#L6), [src/services/pay-consumer.ts:14-87](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/pay-consumer.ts#L14-L87)).
- `agency.events` — `AgencyExchange.routingKeys.sprintCompleted` from Agency HQ ([src/services/agency-consumer.ts:13](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/agency-consumer.ts#L13)).
- `cron.jobs` topic exchange — `business.daily-snapshot` ([src/services/cron-consumer.ts:4-13](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/cron-consumer.ts#L4-L13)).

### NPM packages
- `@jeffrey-keyser/express-server-factory` ^2.0.1 — Express app builder, health check, version middleware ([package.json:18](https://github.com/Jeffrey-Keyser/business-hq/blob/main/package.json#L18)).
- `@jeffrey-keyser/database-base-config` ^2.0.4 — shared Postgres config ([package.json:17](https://github.com/Jeffrey-Keyser/business-hq/blob/main/package.json#L17)).
- `@jeffrey-keyser/message-contracts` ^1.9.0 — `BusinessExchange`, `AgencyExchange` constants ([package.json:19](https://github.com/Jeffrey-Keyser/business-hq/blob/main/package.json#L19)).
- `absurd-sdk` ^0.3.0 — Postgres-native durable workflows ([package.json:20](https://github.com/Jeffrey-Keyser/business-hq/blob/main/package.json#L20)).
- `amqplib` ^0.10.9, `express` ^5.0.0, `pg` ^8.16.3, `node-pg-migrate` ^8.0.3 ([package.json:21-25](https://github.com/Jeffrey-Keyser/business-hq/blob/main/package.json#L21-L25)).

## Consumed by

### Outbound exchange (published)
`business.events` — three routing keys ([src/services/event-publisher.ts:7-48](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/event-publisher.ts#L7-L48)):
- `revenue_updated` — emitted after a payment-derived `revenue_events` row is created.
- `product_launched` — emitted when a product transitions to `live`.
- `milestone_reached` — generic milestone signal.

Any sibling service that subscribes to `business.events` is a downstream consumer. The CFO persona and ecosystem dashboards are the documented consumers ([docs/persona-cfo.md](https://github.com/Jeffrey-Keyser/business-hq/blob/main/docs/persona-cfo.md)).

### REST consumers
`/api/v1/products`, `/api/v1/revenue`, `/api/v1/costs`, `/api/v1/dashboard` ([README.md:34-41](https://github.com/Jeffrey-Keyser/business-hq/blob/main/README.md#L34-L41)). External callers (e.g., a future dashboard UI or CFO operator tooling) hit these.

## Sibling repo

- [agency-hq](https://github.com/Jeffrey-Keyser/agency-hq) — publishes `agency.events`; counterpart that decides what to build while business-hq tracks revenue ([README.md:9](https://github.com/Jeffrey-Keyser/business-hq/blob/main/README.md#L9)).
