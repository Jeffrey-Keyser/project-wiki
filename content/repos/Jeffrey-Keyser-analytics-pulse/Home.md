---
title: "Analytics-Pulse Overview"
description: "Overview of the self-hosted, privacy-focused Analytics-Pulse platform: its deliverables, shipped workflows, main flow, and links to the other wiki pages."
---

# Analytics-Pulse

Analytics-Pulse is a self-hosted, privacy-focused web analytics platform with a React 19 admin client, an Express 5 API, PostgreSQL-backed analytics storage, and deployment assets for AWS and container-based environments ([README.md:L5](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/README.md#L5)). The product privacy behaviors listed in the README are no cookies, Do Not Track handling, and hashed IP addresses ([README.md:L51-L53](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/README.md#L51-L53)).

The architecture doc describes three deliverables: an admin client, an API, and a standalone tracking library ([docs/ARCHITECTURE.md:L7-L11](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/ARCHITECTURE.md#L7-L11)). The README asks readers to treat the application code as the primary source of truth for what is shipped ([README.md:L25](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/README.md#L25)).

## At a glance

- **Admin client:** React 19 and Vite under `client` ([docs/ARCHITECTURE.md:L9](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/ARCHITECTURE.md#L9)), with shipped routes for the dashboard, campaigns, real-time, events, settings, and API keys ([docs/ARCHITECTURE.md:L19-L26](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/ARCHITECTURE.md#L19-L26)).
- **API:** Express 5 and TypeScript under `server` ([docs/ARCHITECTURE.md:L10](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/ARCHITECTURE.md#L10)), mounted under `/api/v1` ([server/routes/versions/v1/index.ts:L31-L35](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/routes/versions/v1/index.ts#L31-L35)).
- **Tracking library:** `@analytics-pulse/tracking-library`, packaged as ESM, CJS, and browser bundles ([tracking-library/package.json:L2-L8](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/tracking-library/package.json#L2-L8)).
- **Storage:** PostgreSQL with default pool size 2 to 20 ([server/config/env.ts:L115-L116](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/config/env.ts#L115-L116)). The events table is partitioned by month ([docs/ARCHITECTURE.md:L187-L188](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/ARCHITECTURE.md#L187-L188)).
- **Auth:** Pay auth integration, with the Pay URL defaulting to `https://pay.jeffreykeyser.net` ([server/app.ts:L84-L87](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L84-L87)).
- **Background work:** Daily aggregation, partition maintenance, and email reporting are started in-process ([server/app.ts:L136](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L136)).
- **Deployment:** Terraform and Docker assets exist; the exact production topology is environment-specific and unknown from these excerpts ([docs/ARCHITECTURE.md:L13](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/ARCHITECTURE.md#L13)).

**Shipped versus API-first:** Project management, historical and real-time analytics, custom events, export, campaigns, API keys, and settings are shipped in the client ([README.md:L9](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/README.md#L9)). Goals, funnels, email preferences, error dashboards, partition admin, and performance admin are API-first ([README.md:L44-L47](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/README.md#L44-L47)).

## Who uses it

- **Site operators** create a project, generate an API key, and install the tracking snippet ([README.md:L82-L109](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/README.md#L82-L109)).
- **Dashboard users** navigate project-scoped analytics pages ([docs/ARCHITECTURE.md:L17-L26](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/ARCHITECTURE.md#L17-L26)).
- **Deployers** running their own instance use the automated setup script, which requires `GITHUB_TOKEN` ([scripts/new-service-auto.sh:L226-L231](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/scripts/new-service-auto.sh#L226-L231)).
- **Contributors** follow the guide in the contributing document ([CONTRIBUTING.md:L1-L3](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/CONTRIBUTING.md#L1-L3)).

## Main flow

1. An admin creates a project and generates an API key, which is shown only once ([README.md:L86-L95](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/README.md#L86-L95)).
2. The tracker posts to the public track endpoints, which use API-key authentication ([server/app.ts:L98-L100](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L98-L100)).
3. The daily aggregation job is scheduled for `0 1 * * *` in UTC ([server/cron/dailyAggregation.ts:L33](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/cron/dailyAggregation.ts#L33), [server/cron/dailyAggregation.ts:L96-L97](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/cron/dailyAggregation.ts#L96-L97)).
4. The dashboard reads project analytics through authenticated `/api/v1/projects/:id/*` routes ([docs/ARCHITECTURE.md:L41-L48](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/ARCHITECTURE.md#L41-L48)).
5. Operators confirm health with `/health` and runtime telemetry ([docs/OPERATIONS.md:L50-L54](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/OPERATIONS.md#L50-L54)).

## Wiki pages

- [Architecture](../architecture/): components, contracts, and the component map.
- [Iteration Loop](../iteration-loop/): contributor workflow, scripts, and CI.
- [Services and Dependencies](../services-and-dependencies/): confirmed and unknown integrations.
- [Operations](../operations/): start, deploy, test, health, and observability.
- [Glossary](../glossary/): project-specific terms.
