---
title: "Glossary"
description: "Business HQ terms: domain concepts, exchanges, workflow primitives, and metric definitions, each with source citations."
---

# Glossary

**Business HQ.** This service: the business strategy layer that tracks products, revenue, costs, and profitability ([README.md:3](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/README.md#L3)).

**Agency HQ.** The sibling service that decides what to build ([README.md:9](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/README.md#L9)).

**Product.** A row in `business.products`. Status values are `idea`, `in-development`, `live`, `sunset`, and `archived` ([src/types/models.ts:3](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/types/models.ts#L3), [src/types/models.ts:5-16](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/types/models.ts#L5-L16)).

**Revenue event.** A row in `business.revenue_events`. Sources are `stripe`, `manual`, `subscription`, and `one-time` ([src/types/models.ts:40-52](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/types/models.ts#L40-L52)).

**Subscription revenue event.** Created from `subscription.created` with `amount_cents` set to 0, so it adds no amount on its own ([src/services/pay-consumer.ts:69-70](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/pay-consumer.ts#L69-L70)).

**Cost event.** A row in `business.cost_events`. Categories are `api-usage`, `hosting`, `ai-models`, `infrastructure`, `tools`, and `other` ([src/types/models.ts:66-78](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/types/models.ts#L66-L78)).

**Build event.** A row in `business.build_events`, created from `sprint.completed`. The product is matched by repository ([src/services/agency-consumer.ts:21-35](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/agency-consumer.ts#L21-L35)).

**Financial snapshot.** A row in `business.financial_snapshots` with revenue, costs, net income, MRR, ARR, and live product count ([src/types/models.ts:92-106](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/types/models.ts#L92-L106)). It is upserted per period and start date ([src/services/absurd.ts:76](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/absurd.ts#L76)).

**MRR.** In the snapshot task, the sum of `stripe` and `subscription` revenue over the last 30 days ([src/services/absurd.ts:43-48](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/absurd.ts#L43-L48)). The dashboard instead uses all 30-day revenue and labels it "rough" ([src/routes/versions/v1/dashboard.ts:40-41](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/routes/versions/v1/dashboard.ts#L40-L41)).

**ARR.** MRR multiplied by 12 ([src/services/absurd.ts:58](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/absurd.ts#L58)).

**`pay.events`.** Topic exchange consumed for revenue, with `payment.succeeded` and `subscription.created` ([src/services/pay-consumer.ts:6](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/pay-consumer.ts#L6)).

**`agency.events`.** Exchange consumed for `sprint.completed` ([src/services/agency-consumer.ts:11-13](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/agency-consumer.ts#L11-L13)).

**`cron.jobs`.** Topic exchange for scheduled triggers, bound to `business.daily-snapshot` ([src/services/cron-consumer.ts:4](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/cron-consumer.ts#L4)).

**`business.events`.** Business HQ's outbound exchange, published through the business exchange constant ([src/services/rabbit.ts:45-50](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/rabbit.ts#L45-L50)).

**Absurd.** A Postgres-native durable workflow engine ([src/db/absurd-schema.sql:1-6](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/db/absurd-schema.sql#L1-L6)).

**Absurd queue `business-hq`.** The queue name this service registers under ([src/services/absurd.ts:5](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/absurd.ts#L5)).

**Checkpointed step.** A named `ctx.step` whose result is saved so a retried task does not repeat it, as the code uses it for `collect-metrics` and `save-snapshot` ([src/services/absurd.ts:31](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/absurd.ts#L31), [src/services/absurd.ts:70](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/absurd.ts#L70)).

**`daily-snapshot` task.** The single Absurd task registered by this service ([src/services/absurd.ts:19-21](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/absurd.ts#L19-L21)).

**Idempotency key.** For daily snapshots, `daily-snapshot:<date>:<hour>` ([src/services/absurd.ts:112](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/absurd.ts#L112)).

**Accept-Version.** A request header read for version negotiation. It defaults to version 1 ([src/middleware/versioning.ts:10-17](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/middleware/versioning.ts#L10-L17)).

**Settings.** The `business.settings` key-value table, accessed through the settings DAL. No route using it appears in the excerpts ([src/dal/settings.ts:3-9](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/dal/settings.ts#L3-L9)).

**CFO persona.** The operator-facing persona that reads financial data from this service ([docs/persona-cfo.md:3](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/docs/persona-cfo.md#L3), [docs/persona-cfo.md:37](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/docs/persona-cfo.md#L37)).
