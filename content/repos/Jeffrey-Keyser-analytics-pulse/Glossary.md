---
title: Glossary
description: Repo-specific terminology for Analytics-Pulse.
---

# Glossary

### Pay service
External authentication and user-profile service hosted at `https://pay.jeffreykeyser.net`. Analytics-Pulse does not store user identity locally; it validates JWTs and proxies profile lookups through `@jeffrey-keyser/pay-auth-integration`. Setup, public-routes list, and fallback URL live in the auth-setup block ([server/app.ts:32-93](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L32-L93)).

### Project
A logical grouping in Analytics-Pulse representing one tracked website or app. Owns its API keys, goals, campaigns, email preferences, and event history. Managed under `/api/v1/projects/*` ([README.md:427-444](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L427-L444)).

### API key (`ap_*`)
Per-project, bcrypt-hashed secret used by the tracking SDK to authenticate event ingestion calls. Issued by `POST /api/v1/projects/:projectId/api-keys` and shown in plaintext exactly once. Distinct from JWT bearer tokens used by the dashboard ([README.md:446-462](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L446-L462), [server/app.ts:166-178](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L166-L178)).

### Tracking library
The browser SDK at `tracking-library/`, published as `@analytics-pulse/tracking-library`. Built with Rollup into ESM, CJS, and minified UMD bundles for `<script>` embedding ([tracking-library/package.json:1-10](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/tracking-library/package.json#L1-L10)).

### Goal
A user-defined conversion event — event-based, pageview-based, or value-based. Goal completions feed funnel analysis and conversion-rate reporting ([README.md:31-37](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L31-L37), [README.md:502-520](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L502-L520)).

### Funnel
A multi-step path through ordered goals, queried via `POST /api/v1/projects/:id/goals/funnel` ([README.md:512-520](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L512-L520)).

### Campaign / UTM
A set of events sharing UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`). Tracked with first-touch attribution so the originating UTM stays on the session even after navigation ([README.md:38-44](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L38-L44)).

### Daily aggregation
A pre-computed rollup table populated by `server/cron/dailyAggregation.ts` running at 1 AM UTC. Lets the dashboard load instantly without scanning raw event partitions ([server/cron/dailyAggregation.ts:32-36](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/cron/dailyAggregation.ts#L32-L36), [README.md:67-71](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L67-L71)).

### Partition / partition maintenance
Monthly Postgres partitions on the events table that bound query scans to a small time window. The `partitionMaintenance` cron creates next-month partitions and drops aged-out ones; `/api/v1/partitions/*` admin endpoints expose the current state ([server/app.ts:35](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L35), [server/routes/versions/v1/index.ts:143-145](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/routes/versions/v1/index.ts#L143-L145)).

### Public routes
The whitelist of paths that bypass Pay auth — tracking, error ingestion, unsubscribe, diagnostics, Swagger, root. Anything not on the list requires a valid JWT ([server/app.ts:53-71](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L53-L71)).

### Version negotiation
The middleware chain that adds the `API-Version` response header, redirects legacy `/v1/*` URLs to `/api/v1/*`, and rejects requests that ask for an unsupported version ([server/app.ts:217-223](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L217-L223)).

### OIDC role
The IAM role created by Terraform (`enable_github_oidc = true`) that GitHub Actions assumes via `aws-actions/configure-aws-credentials@v4`. Replaces long-lived AWS access keys in CI ([README.md:353-380](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L353-L380)).

### `new-service-auto.sh`
The bootstrap script that takes the repo from clone to live deployment in <10 minutes. Idempotent, with rollback on failure ([README.md:238-291](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L238-L291)).
