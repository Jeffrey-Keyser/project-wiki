---
title: "Glossary"
description: "Project-specific terms used across Analytics-Pulse, each with source citations."
---

# Glossary

**Pay service.** The external authentication and profile service at `https://pay.jeffreykeyser.net` by default. The server configures Pay auth with it ([server/app.ts:L84-L87](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L84-L87)).

**Project.** A tracked website or app. Projects are managed under the projects route group ([docs/API_REFERENCE.md:L124-L126](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/API_REFERENCE.md#L124-L126)).

**API key (`ap_` prefix).** A key for tracking endpoints. Its format is documented in Swagger, and it can be sent as a bearer token or query parameter ([server/app.ts:L214-L219](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L214-L219)). Full keys are not returned after creation ([docs/API_REFERENCE.md:L336](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/API_REFERENCE.md#L336)).

**Tracking library.** The browser SDK, published as `@analytics-pulse/tracking-library` ([tracking-library/package.json:L2](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/tracking-library/package.json#L2)).

**Public routes.** Paths that bypass Pay auth, such as track, errors, unsubscribe, diagnostics, and Swagger ([server/app.ts:L90-L108](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L90-L108)).

**Version negotiation.** The middleware chain for version headers, legacy redirects, and version validation ([server/app.ts:L264-L270](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L264-L270)).

**Background job.** A `node-cron` task started from the app when its flag is enabled ([server/app.ts:L48-L79](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L48-L79)).

**Daily aggregation.** The job that rolls up prior-day analytics for all active projects at 01:00 UTC ([server/cron/dailyAggregation.ts:L12-L26](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/cron/dailyAggregation.ts#L12-L26)). Its results go to the `analytics_daily` table ([docs/ARCHITECTURE.md:L246-L248](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/ARCHITECTURE.md#L246-L248)).

**Partition.** A monthly range slice of the events table, named `events_YYYY_MM` ([docs/PARTITION_STRATEGY.md:L18-L24](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/PARTITION_STRATEGY.md#L18-L24)).

**Runtime telemetry.** Background job state served at `/api/v1/diagnostics/runtime` ([docs/ARCHITECTURE.md:L72-L78](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/ARCHITECTURE.md#L72-L78)).

**Goal.** A conversion definition with type `event`, `pageview`, or `value` ([server/routes/goals.ts:L286-L288](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/routes/goals.ts#L286-L288)). Goals are API-first, not a shipped dashboard workflow ([README.md:L44](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/README.md#L44)).

**Funnel.** An ordered goal path, exposed at the goals funnel route ([server/routes/versions/v1/index.ts:L122](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/routes/versions/v1/index.ts#L122)). It is backend-only in the README ([README.md:L44](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/README.md#L44)).

**Campaign and UTM.** Campaigns group events by UTM parameters, including source, medium, campaign, term, and content ([server/routes/campaigns.ts:L8-L10](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/routes/campaigns.ts#L8-L10), [docs/TRACKING_GUIDE.md:L292-L296](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/TRACKING_GUIDE.md#L292-L296)).

**Error reporting.** Errors are deduplicated by fingerprint, and repeated occurrences increase a counter ([server/routes/errors.ts:L37-L38](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/routes/errors.ts#L37-L38)).

**Email reporting schedule.** Daily, weekly, and monthly reports at 09:00 ([docs/OPERATIONS.md:L81-L83](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/OPERATIONS.md#L81-L83)).

**Shipped versus API-first.** A label for workflows in the client versus those only available through the API ([README.md:L9-L10](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/README.md#L9-L10)).

**Schema migration tracking.** Applied migrations are recorded in `schema_migrations` ([docs/OPERATIONS.md:L41-L42](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/OPERATIONS.md#L41-L42)).

**Admin-only routes.** Aggregation, partitions, and performance routes require an admin ([server/routes/versions/v1/index.ts:L137-L149](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/routes/versions/v1/index.ts#L137-L149)).

**OIDC role.** The AWS role that GitHub Actions assumes through OIDC, documented as created by Terraform ([CLAUDE.md:L264-L266](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/CLAUDE.md#L264-L266)).
