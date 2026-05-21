---
title: Analytics-Pulse — Overview
description: Self-hosted, privacy-first web analytics platform built on serverless AWS, with a React dashboard, Express/Lambda API, and a JS tracking library.
---

# Analytics-Pulse

Analytics-Pulse is a self-hosted, privacy-focused web analytics platform. It tracks pageviews, sessions, custom events, goals, and UTM campaigns without cookies, hashing IPs before storage and respecting Do-Not-Track ([README.md:3-5](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L3-L5), [README.md:58-64](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L58-L64)).

The repo is a monorepo containing three deployables — an Express/Lambda API, a Vite/React dashboard, and an npm-published JS tracking snippet — plus Terraform that provisions the AWS infrastructure they run on ([README.md:1022-1043](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L1022-L1043)).

## At a glance

- **Backend:** Express 5 on AWS Lambda via `serverless-http`, fronted by API Gateway ([server/app.ts:1-5](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L1-L5), [README.md:1032-1033](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L1032-L1033)).
- **Frontend:** React 19 + Redux Toolkit + RTK Query, served from S3 + CloudFront ([client/package.json:18-25](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/client/package.json#L18-L25), [README.md:1034-1035](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L1034-L1035)).
- **Tracking SDK:** `@analytics-pulse/tracking-library`, ~lightweight browser snippet published to npm ([tracking-library/package.json:1-10](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/tracking-library/package.json#L1-L10)).
- **Datastore:** PostgreSQL (RDS) with monthly partitioned event tables and pre-computed daily rollups ([README.md:67-71](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L67-L71)).
- **Auth:** External Pay service (`pay.jeffreykeyser.net`) wired via `@jeffrey-keyser/pay-auth-integration` ([server/app.ts:32-93](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L32-L93)).
- **API contract:** Versioned under `/api/v1/*`; tracking endpoints use API-key auth, dashboard endpoints use JWT bearer ([CLAUDE.md](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/CLAUDE.md), [server/routes/versions/v1/index.ts:73-149](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/routes/versions/v1/index.ts#L73-L149)).
- **Scheduled work:** In-process `node-cron` jobs for daily aggregation, partition maintenance, and email reports ([server/cron/dailyAggregation.ts:32-36](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/cron/dailyAggregation.ts#L32-L36), [server/app.ts:34-36](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L34-L36)).
- **Infra:** Terraform 1.13.5+, state in `tf-state-jeffrey-keyser-prod` S3 bucket, OIDC for GitHub Actions ([README.md:307-317](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L307-L317), [README.md:341-346](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L341-L346)).

## Who uses it

- **Site operators** install the JS snippet on their site and read the dashboard ([README.md:104-135](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L104-L135)).
- **Service owners** (the people deploying their own instance) run the automated `new-service-auto.sh` flow to go from clone to live in <10 min ([README.md:238-291](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L238-L291)).
- **Tracking SDK consumers** install `@analytics-pulse/tracking-library` from npm and call `track()` against the deployed API ([README.md:118-134](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L118-L134)).

## How work moves through this repo

A typical change touches one of three surfaces: the API (`server/`), the dashboard (`client/`), or the tracking SDK (`tracking-library/`). Each surface has its own test suite (Jest for server + SDK, Vitest for client) and shares the top-level Terraform definitions for deployment ([README.md:996-1018](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L996-L1018)). CI/CD lives in GitHub Actions and uses OIDC to assume an AWS role created by Terraform ([README.md:353-380](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L353-L380)).

## Wiki pages

- [Architecture](./architecture/) — internal module layout, request flow, datastore shape.
- [Iteration Loop](./iteration-loop/) — how a change goes from edit to merge to deployed.
- [Services and Dependencies](./services-and-dependencies/) — inbound/outbound integrations.
- [Operations](./operations/) — deploy, runtime, observability.
- [Glossary](./glossary/) — repo-specific terminology.
