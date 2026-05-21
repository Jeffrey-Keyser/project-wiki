---
title: Feedback Registry — Overview
description: Unified feedback collection service for the Jeffrey-Keyser ecosystem — submission API, auto-triage, GitHub issue creation, and user follow-up.
---

# Feedback Registry

Backend service + embeddable widget for collecting bug reports, feature requests, and questions from every app in the Jeffrey-Keyser ecosystem. It auto-triages submissions, opens GitHub issues in the right repo, and notifies users when their feedback is resolved ([README.md:1-3](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L1-L3)).

Where it fits in the ecosystem feedback stack: `github-error-issues` handles app errors, `dev-inbox` handles developer ideas, Analytics Pulse handles telemetry — Feedback Registry owns the **user-submitted bug reports & feature requests** lane ([README.md:8-14](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L8-L14)).

## At a glance

- **Type**: Express/TypeScript HTTP API (`@jeffrey-keyser/feedback-registry`) + companion admin UI client + embeddable `@jeffrey-keyser/feedback-widget` ([server/package.json:1-5](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/package.json#L1-L5), [packages/feedback-widget/package.json:1-5](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/packages/feedback-widget/package.json#L1-L5)).
- **Runtime**: Node 20, Express 5, PostgreSQL (`feedback` schema) via `@jeffrey-keyser/database-base-config` ([server/package.json:18-36](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/package.json#L18-L36), [README.md:344-352](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L344-L352)).
- **Public API**: `https://api.feedback.jeffreykeyser.net` exposing `/api/v1/feedback`, `/api/v1/admin/*`, `/api/v1/webhooks/github` ([README.md:184-188](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L184-L188), [server/routes/versions/v1/index.ts:45-61](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/routes/versions/v1/index.ts#L45-L61)).
- **Deploy target**: Homelab Beelink via `beelink-deploy` webhook + systemd unit. Not GitHub Actions deploy ([.github/workflows/ci-cd-pipeline.yml:9-10](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L9-L10), [.github/workflows/ci-cd-pipeline.yml:73-85](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L73-L85)).
- **Bootstrapped from**: `ServerlessWebTemplate` (Terraform + Lambda patterns retained even though current deploy is homelab) ([README.md:41-49](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L41-L49)).

## Who uses it

- **End users** of ecosystem apps (Travel Map, Workout, Pay Portal, Pantry, Solo Vault) submit feedback through the widget, optionally with a JWT for attribution ([README.md:118-127](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L118-L127)).
- **Maintainers** triage, comment, resolve via admin endpoints — auth proxied through `pay-auth-integration` ([README.md:264-298](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L264-L298), [server/app.ts:32-34](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/app.ts#L32-L34)).
- **Other services** (`github-error-issues`, app webhooks) interact via the global webhook dispatcher and shared event names like `feedback.triaged`, `feedback.resolved` ([server/services/FeedbackService.ts:463-520](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/services/FeedbackService.ts#L463-L520)).

## How work moves through it

1. Client SDK / widget POSTs to `/api/v1/feedback` with app id, type, title, description, metadata.
2. `FeedbackService` persists the submission, fingerprints for dedup, dispatches `feedback.triaged` / `feedback.resolved` webhooks on state changes ([server/services/FeedbackService.ts:463-520](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/services/FeedbackService.ts#L463-L520)).
3. `AutoTriageService` classifies severity/labels (calls Struct service at port 3032 when present, keyword fallback otherwise) ([CLAUDE.md:174-179](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L174-L179)).
4. `GitHubService` opens an issue in the target repo recorded in `feedback.apps` ([README.md:312-324](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L312-L324)).
5. GitHub `issues.closed` webhook syncs back to feedback status; notification email fires ([README.md:335-342](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L335-L342)).

## Wiki pages

- [Architecture](./architecture/) — internal modules: routes, services, DAL, infrastructure adapters.
- [Iteration Loop](./iteration-loop/) — how a code change moves from branch to homelab.
- [Services and Dependencies](./services-and-dependencies/) — inbound consumers and outbound integrations.
- [Operations](./operations/) — start command, port, systemd, health probes, logs.
- [Glossary](./glossary/) — repo-specific terms (submission, fingerprint, triage, app id).
