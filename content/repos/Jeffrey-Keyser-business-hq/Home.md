---
title: "Business HQ — Overview"
description: "Business strategy and finance service that ingests revenue and build events, computes daily financial snapshots, and exposes a v1 REST API."
---

# Business HQ

Business HQ is the financial layer of the Jeffrey-Keyser ecosystem. It tracks products, revenue, costs, and profitability ([README.md:3](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/README.md#L3)). It ingests Stripe revenue events, tracks costs, computes daily snapshots (MRR, ARR, net income), and keeps a product catalog ([README.md:7](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/README.md#L7)).

It runs alongside Agency HQ. Agency HQ decides what to build; Business HQ tracks whether it makes money ([README.md:9](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/README.md#L9)).

## At a glance

- **Package**: `business-hq` version 0.1.0, private ([package.json:2-4](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/package.json#L2-L4)).
- **Stack**: Express 5 and TypeScript, PostgreSQL 17, RabbitMQ via amqplib ([README.md:26-28](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/README.md#L26-L28)).
- **Port**: defaults to 3041 in config ([src/config/env.ts:24](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/config/env.ts#L24)); the systemd unit also sets `PORT=3041` ([business-hq.service:8](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/business-hq.service#L8)).
- **Schemas**: `business` for application data and `absurd` for the workflow engine ([README.md:22](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/README.md#L22)).
- **Inbound exchanges**: `pay.events`, `agency.events`, and `cron.jobs` consumers ([src/bin/www.ts:6-8](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/bin/www.ts#L6-L8), [src/bin/www.ts:28-30](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/bin/www.ts#L28-L30)).
- **Outbound**: publisher helpers for `business.events` ([src/services/event-publisher.ts:13](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/event-publisher.ts#L13)).
- **API**: `/api/v1/` with products, revenue, costs, and dashboard ([src/routes/versions/v1/index.ts:10-13](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/routes/versions/v1/index.ts#L10-L13)).
- **Auth**: disabled in the server configuration ([src/app.ts:52](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/app.ts#L52)).

## Who uses it

- **Documented**: the CFO persona is specified to read financial data from `http://localhost:3041/api/v1` ([docs/persona-cfo.md:37](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/docs/persona-cfo.md#L37)). Whether that persona is running is unknown.
- **Event sources**: the README diagram shows Stripe/Pay and Agency HQ feeding this service ([README.md:14-15](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/README.md#L14-L15)). The provided source only shows that this service subscribes to those exchanges; the publishers' deployment status is unknown.
- **UI**: no human-facing UI appears in the excerpts. The root route returns service metadata as JSON ([src/routes/index.ts:5-11](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/routes/index.ts#L5-L11)).

## Main flow

1. A `payment.succeeded` event creates a `stripe` revenue event, deduplicated by payment ID, and publishes `revenue_updated` ([src/services/pay-consumer.ts:22-48](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/pay-consumer.ts#L22-L48)).
2. A `sprint.completed` event creates a build event, linked to a product by repository when matched ([src/services/agency-consumer.ts:21-35](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/agency-consumer.ts#L21-L35)).
3. A `business.daily-snapshot` cron message spawns an Absurd task ([src/services/cron-consumer.ts:18-21](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/cron-consumer.ts#L18-L21)).
4. The Absurd task collects metrics, then upserts a `financial_snapshots` row for the date ([src/services/absurd.ts:30-100](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/absurd.ts#L30-L100)).
5. The `/api/v1/dashboard` endpoint queries the base tables directly for a 30-day view, not the snapshot table ([src/routes/versions/v1/dashboard.ts:13-34](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/routes/versions/v1/dashboard.ts#L13-L34)).

## Wiki pages

- [Architecture](../architecture/)
- [Iteration Loop](../iteration-loop/)
- [Services and Dependencies](../services-and-dependencies/)
- [Operations](../operations/)
- [Glossary](../glossary/)
