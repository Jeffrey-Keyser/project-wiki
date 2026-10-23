---
title: "Feedback Registry"
description: "Overview of the Feedback Registry API, admin client and feedback widget package: purpose, users, main submission flow and links to detailed pages."
---

# Feedback Registry

Feedback Registry is a private Node service for collecting user feedback (bug reports, feature requests and questions) from registered applications. The package describes itself as a unified feedback collection system that provides auto-triage, creates GitHub issues and enables user follow-up ([package.json:L4](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/package.json#L4)).

## At a glance

- **Server**: Express 5 app started from `server/bin/www.ts`; `npm start` runs the compiled `dist` entry and `npm run dev` runs it through ts-node ([server/package.json:L7-L8](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/package.json#L7-L8), [server/package.json:L36](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/package.json#L36)).
- **Port**: `PORT` environment variable, defaulting to 3001 ([server/config/env.ts:L79](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/config/env.ts#L79)).
- **Data**: PostgreSQL. Application and submission tables live in the `feedback` schema ([server/dal/apps.ts:L61](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/dal/apps.ts#L61), [server/dal/submissions.ts:L63](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/dal/submissions.ts#L63)).
- **Identity**: JWTs are validated through the Pay service, defaulting to `https://pay.jeffreykeyser.net` ([server/app.ts:L47](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/app.ts#L47)).
- **Admin client**: React/Vite dashboard in `client/` ([client/package.json:L2-L4](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/client/package.json#L2-L4)).
- **Widget**: `@jeffrey-keyser/feedback-widget` version 1.0.0 ([packages/feedback-widget/package.json:L2-L4](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/packages/feedback-widget/package.json#L2-L4)).
- **Deploy trigger**: a push to `main` calls a `beelink-deploy` webhook; the CI file states that deployment is not performed by GitHub Actions ([.github/workflows/ci-cd-pipeline.yml:L9-L10](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/.github/workflows/ci-cd-pipeline.yml#L9-L10)). The live homelab state is not verified by these sources.

## Who uses it

- **Feedback submitters** can post anonymously or while signed in. The submission route is public in the auth configuration ([server/app.ts:L61-L62](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/app.ts#L61-L62)).
- **Registered apps** are identified by an `appId` and a GitHub repository in `owner/repo` form ([server/routes/admin/apps.ts:L112-L127](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/routes/admin/apps.ts#L112-L127)).
- **Maintainers** use admin routes, which require the `admin` role or the `feedback:admin` permission ([server/routes/admin/index.ts:L29-L37](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/routes/admin/index.ts#L29-L37)).
- **Embedding apps**: the widget package is published from this repo, but the source provided does not confirm which applications embed it.

## Main flow

1. A client posts to `/api/v1/feedback`, limited to 10 submissions per hour per limiter configuration ([server/routes/feedback.ts:L28-L35](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/routes/feedback.ts#L28-L35)).
2. `submitFeedback` checks that the app is registered, stores the submission, sets a fingerprint and marks likely duplicates ([server/services/FeedbackService.ts:L181-L230](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/FeedbackService.ts#L181-L230)).
3. Auto-triage runs in the background when the app enables it ([server/services/AutoTriageService.ts:L41-L49](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/AutoTriageService.ts#L41-L49)).
4. A linked GitHub issue that is closed marks the submission resolved and notifies the submitter ([server/routes/webhooks.ts:L191-L211](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/routes/webhooks.ts#L191-L211)).

## Wiki pages

- [Architecture](../architecture/) — components, contracts and data flow.
- [Iteration Loop](../iteration-loop/) — local commands, CI jobs and deploy trigger.
- [Services and Dependencies](../services-and-dependencies/) — outbound integrations and known or unknown callers.
- [Operations](../operations/) — start, health, configuration and observability.
- [Glossary](../glossary/) — project-specific terms.
