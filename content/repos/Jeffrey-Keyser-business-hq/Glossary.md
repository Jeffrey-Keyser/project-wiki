---
title: Glossary
description: Business HQ–specific terms — domain concepts, message routing keys, and workflow primitives used in this repo.
---

# Glossary

**Business HQ.** This service. Business strategy layer tracking products, revenue, costs, profitability ([README.md:3](https://github.com/Jeffrey-Keyser/business-hq/blob/main/README.md#L3)).

**Agency HQ.** Sibling service that decides what to build. Publishes `agency.events`; Business HQ consumes its `sprint.completed` to populate `build_events` ([README.md:9](https://github.com/Jeffrey-Keyser/business-hq/blob/main/README.md#L9), [src/services/agency-consumer.ts:11-45](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/agency-consumer.ts#L11-L45)).

**Product.** Row in `business.products`. Catalog of things built: name, status (`idea` | `in-development` | `live` | `sunset` | `archived`), repo, service, url, is_monetized ([CLAUDE.md:37](https://github.com/Jeffrey-Keyser/business-hq/blob/main/CLAUDE.md#L37)).

**Revenue event.** Row in `business.revenue_events`. Every dollar in — Stripe payment, subscription, or manual entry. Source values include `stripe`, `subscription` ([CLAUDE.md:38](https://github.com/Jeffrey-Keyser/business-hq/blob/main/CLAUDE.md#L38), [src/services/pay-consumer.ts:36](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/pay-consumer.ts#L36)).

**Cost event.** Row in `business.cost_events`. API usage, hosting, AI model spend ([CLAUDE.md:39](https://github.com/Jeffrey-Keyser/business-hq/blob/main/CLAUDE.md#L39)).

**Financial snapshot.** Row in `business.financial_snapshots`. Daily rollup uniqued by `(period, period_start)`; carries `total_revenue_cents`, `total_costs_cents`, `net_income_cents`, `mrr_cents`, `arr_cents`, `live_product_count` ([src/services/absurd.ts:72-83](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/absurd.ts#L72-L83)).

**MRR.** Monthly Recurring Revenue. Computed as sum of `revenue_events.amount_cents` over the last 30 days where `source IN ('stripe', 'subscription')` ([src/services/absurd.ts:42-48](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/absurd.ts#L42-L48)).

**ARR.** Annual Recurring Revenue. `mrr_cents * 12` ([src/services/absurd.ts:58](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/absurd.ts#L58)).

**Build event.** Row in `business.build_events`. Created from agency `sprint.completed`; product resolved via `repository` field lookup against `products.repo` ([src/services/agency-consumer.ts:21-35](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/agency-consumer.ts#L21-L35)).

**`pay.events`.** Topic exchange consumed for revenue. Routing keys: `payment.succeeded`, `subscription.created` ([src/services/pay-consumer.ts:6-87](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/pay-consumer.ts#L6-L87)).

**`agency.events`.** Exchange consumed for build velocity. Routing key: `AgencyExchange.routingKeys.sprintCompleted` ([src/services/agency-consumer.ts:13](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/agency-consumer.ts#L13)).

**`cron.jobs`.** Topic exchange consumed for scheduled triggers. Routing key: `business.daily-snapshot` ([src/services/cron-consumer.ts:4-13](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/cron-consumer.ts#L4-L13)).

**`business.events`.** Topic exchange this repo publishes. Routing keys: `revenue_updated`, `product_launched`, `milestone_reached` ([src/services/event-publisher.ts:7-48](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/event-publisher.ts#L7-L48)).

**Absurd.** Postgres-native durable workflow engine. Tasks registered with `absurd.registerTask`; checkpointed steps via `ctx.step` are re-entry safe on retry ([src/services/absurd.ts:18-104](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/absurd.ts#L18-L104)).

**`daily-snapshot` task.** The single Absurd task in this repo. Two steps: `collect-metrics` and `save-snapshot`. Spawned by cron-consumer; idempotency key shape `daily-snapshot:<YYYY-MM-DD>:<hour>` ([src/services/absurd.ts:30-115](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/absurd.ts#L30-L115)).

**CFO persona.** Operator-facing persona that consumes Business HQ output. Defined in [docs/persona-cfo.md](https://github.com/Jeffrey-Keyser/business-hq/blob/main/docs/persona-cfo.md).
