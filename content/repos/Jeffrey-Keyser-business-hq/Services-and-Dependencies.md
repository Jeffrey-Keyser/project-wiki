---
title: "Services and Dependencies"
description: "What Business HQ depends on, which exchanges it consumes and publishes, and which callers are confirmed in source versus documented or unknown."
---

# Services and Dependencies

## Depends on

### Runtime services
- **PostgreSQL 17** with the `business` schema for application data and `absurd` for the workflow engine ([README.md:22](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/README.md#L22), [README.md:27](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/README.md#L27)). Connection settings come from `DATABASE_*` or `DB_*` environment variables ([src/config/env.ts:36-41](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/config/env.ts#L36-L41)).
- **RabbitMQ**, defaulting to `amqp://localhost:5672` and overridable with `RABBITMQ_URL` ([src/services/rabbit.ts:4](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/rabbit.ts#L4)).

### Inbound exchanges (subscribed by this service)
- `pay.events` topic exchange, for `payment.succeeded` and `subscription.created` ([src/services/pay-consumer.ts:6](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/pay-consumer.ts#L6), [src/services/pay-consumer.ts:14-16](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/pay-consumer.ts#L14-L16)). The routing-key strings are passed literally in source.
- `agency.events`, using `AgencyExchange.routingKeys.sprintCompleted` ([src/services/agency-consumer.ts:11-13](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/agency-consumer.ts#L11-L13)). The concrete key value is defined in the external contracts package, which is not provided.
- `cron.jobs` topic exchange, for `business.daily-snapshot` ([src/services/cron-consumer.ts:4](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/cron-consumer.ts#L4), [src/services/cron-consumer.ts:10-12](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/cron-consumer.ts#L10-L12)).

### Key packages
- `@jeffrey-keyser/express-server-factory` builds the Express app and health check ([src/app.ts:1-5](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/app.ts#L1-L5)).
- `@jeffrey-keyser/message-contracts` supplies the exchange constants ([src/services/rabbit.ts:2](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/rabbit.ts#L2)).
- `absurd-sdk` provides durable workflows ([src/services/absurd.ts:1](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/absurd.ts#L1)).
- `amqplib`, `pg`, and `node-pg-migrate` are listed as runtime dependencies ([package.json:21-24](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/package.json#L21-L24)).

## Consumed by

### Confirmed in source
- **`business.events` publishing.** `publishRevenueUpdated` is called after a payment-derived revenue row is created ([src/services/pay-consumer.ts:43-48](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/pay-consumer.ts#L43-L48)). The publisher awaits the publish call but does not check its boolean result ([src/services/event-publisher.ts:13-17](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/event-publisher.ts#L13-L17)).
- **Routing-key publishers without callers.** `publishProductLaunched` and `publishMilestoneReached` are defined ([src/services/event-publisher.ts:23-47](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/event-publisher.ts#L23-L47)). No caller appears in the provided excerpts.

### Documented expectations (not verified in code)
- The CFO persona reads `/dashboard`, `/products`, `/revenue`, and `/costs` from the local API ([docs/persona-cfo.md:37-43](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/docs/persona-cfo.md#L37-L43)). Whether that persona runs against this service is unknown.
- The README lists the same REST endpoints for external callers ([README.md:34-41](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/README.md#L34-L41)).

### Unknown
- Subscribers to `business.events` are unknown. Source does not show any.
- Whether Agency HQ and the Pay service are deployed and publishing is unknown. The source only shows consumer bindings.

## Sibling repository

- [agency-hq](https://github.com/Jeffrey-Keyser/agency-hq) is named as the development-strategy counterpart ([README.md:9](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/README.md#L9)). Source here does not show it calling this API.
