---
title: Business HQ — Overview
description: Business strategy and finance service tracking products, revenue, costs, and profitability across the Jeffrey-Keyser ecosystem.
---

# Business HQ

Business strategy layer. Tracks products, revenue, costs, profitability across Jeffrey-Keyser ecosystem ([README.md:3](https://github.com/Jeffrey-Keyser/business-hq/blob/main/README.md#L3)). Runs alongside Agency HQ — Agency HQ decides what to build, Business HQ tracks whether it makes money ([README.md:9](https://github.com/Jeffrey-Keyser/business-hq/blob/main/README.md#L9)).

## At a glance

- **Role**: Financial backbone — ingests Stripe revenue via `pay.events`, tracks costs, computes daily MRR/ARR/net income snapshots ([README.md:7](https://github.com/Jeffrey-Keyser/business-hq/blob/main/README.md#L7)).
- **Stack**: Express 5 + TypeScript, PostgreSQL 17, RabbitMQ (amqplib), Absurd durable workflows ([README.md:25-30](https://github.com/Jeffrey-Keyser/business-hq/blob/main/README.md#L25-L30)).
- **Port**: 3041, systemd user service ([business-hq.service:7-8](https://github.com/Jeffrey-Keyser/business-hq/blob/main/business-hq.service#L7-L8)).
- **Schema**: `business` (app data) + `absurd` (workflow engine) in shared Postgres ([README.md:22](https://github.com/Jeffrey-Keyser/business-hq/blob/main/README.md#L22)).
- **Inbound**: `pay.events`, `agency.events`, `cron.jobs` exchanges ([src/bin/www.ts:26-31](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/bin/www.ts#L26-L31)).
- **Outbound**: `business.events` (revenue updates, product launches, milestones) ([src/services/event-publisher.ts:7-48](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/event-publisher.ts#L7-L48)).
- **API**: REST at `/api/v1/` — products, revenue, costs, dashboard ([README.md:34-41](https://github.com/Jeffrey-Keyser/business-hq/blob/main/README.md#L34-L41)).

## Who uses it

Operator-facing CFO persona consumes the dashboard ([docs/persona-cfo.md](https://github.com/Jeffrey-Keyser/business-hq/blob/main/docs/persona-cfo.md)). Sibling services publish events into it; no human-facing UI is shipped from this repo — it is API + worker only.

## How work moves through it

1. External payment events land on `pay.events`; consumer creates `revenue_events` rows ([src/services/pay-consumer.ts:14-58](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/pay-consumer.ts#L14-L58)).
2. Agency HQ sprint completions land on `agency.events`; consumer creates `build_events` rows ([src/services/agency-consumer.ts:11-45](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/agency-consumer.ts#L11-L45)).
3. Cron service publishes `business.daily-snapshot` on `cron.jobs`; cron-consumer spawns Absurd task ([src/services/cron-consumer.ts:10-34](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/cron-consumer.ts#L10-L34)).
4. Absurd worker runs checkpointed `collect-metrics` → `save-snapshot` steps, upserting `financial_snapshots` ([src/services/absurd.ts:30-100](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/absurd.ts#L30-L100)).
5. Snapshot serves the `/api/v1/dashboard` 30-day rollup ([README.md:41](https://github.com/Jeffrey-Keyser/business-hq/blob/main/README.md#L41)).

## Wiki pages

- [Architecture](./architecture/)
- [Iteration Loop](./iteration-loop/)
- [Services and Dependencies](./services-and-dependencies/)
- [Operations](./operations/)
- [Glossary](./glossary/)
