---
title: Glossary
description: Repo-specific terms for feedback-registry with one-paragraph definitions and citations to where each is defined.
---

# Glossary

**Submission.** A single piece of user feedback — bug, feature, or question — persisted in `feedback.submissions`. Carries `app_id`, `type`, `title`, `description`, optional `user_id`/`email`, plus metadata (browser, OS, screenshot URL) and triage state ([README.md:344-401](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L344-L401)).

**Short ID.** A short, URL-safe identifier (`fb_a1b2c3d4` style) returned to the user for tracking, distinct from the internal UUID. Stored in `feedback.submissions.short_id` and exposed on tracking URLs ([README.md:223-232](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L223-L232), [README.md:361-365](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L361-L365)).

**App ID.** The string key (e.g. `travel-map`, `pay-portal`) identifying the source application. Foreign-keyed from `submissions.app_id` to `feedback.apps.app_id`; each app row records its GitHub repo, maintainers, and auto-triage flag ([README.md:355-359](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L355-L359)).

**Auto-triage.** AI-driven classification of incoming submissions into type + severity + labels, performed by `AutoTriageService` against the Struct service. When Struct is unavailable, falls back to keyword-based triage and still advances the submission to `triaged` ([CLAUDE.md:174-179](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L174-L179)).

**Fingerprint.** A hash stored in `feedback.submissions.fingerprint` used to detect duplicate reports. New submissions whose fingerprint matches an existing row are linked via `duplicate_of` instead of opening a fresh GitHub issue ([README.md:380-384](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L380-L384), [README.md:32](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L32)).

**Triage.** The admin action that assigns severity, labels, and assignee to a submission and (optionally) creates the linked GitHub issue. Driven by `POST /api/v1/admin/feedback/:id/triage` and the `FeedbackService.triage` flow that dispatches `feedback.triaged` webhooks ([README.md:286-298](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L286-L298), [server/services/FeedbackService.ts:463](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/services/FeedbackService.ts#L463)).

**Resolution.** The closing action: admin posts to `/api/v1/admin/feedback/:id/resolve` with a resolution string and `notifyUser` flag. Sets `resolved_at`, fires `feedback.resolved` per-app + global webhooks, and (if `notify_on_resolve` is true) queues an email ([README.md:300-311](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L300-L311), [server/services/FeedbackService.ts:516-520](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/services/FeedbackService.ts#L516-L520)).

**Internal comment.** A row in `feedback.comments` with `is_internal=true` — visible to maintainers in the admin dashboard but never returned in the public `/api/v1/feedback/:id` payload ([README.md:425-446](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L425-L446)).

**Per-app webhook.** Outbound HTTP callback configured per registered app, dispatched by `WebhookDispatchService` on `feedback.triaged` and `feedback.resolved`. Lets each app react locally (e.g., highlight resolved bugs in-app) ([server/services/FeedbackService.ts:463-516](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/services/FeedbackService.ts#L463-L516)).

**Global webhook.** Cross-service callback fired by `GlobalWebhookService` on `feedback.created` and `feedback.resolved` for ecosystem-wide listeners — analytics, dashboards, `github-error-issues` ([server/services/GlobalWebhookService.ts:19](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/services/GlobalWebhookService.ts#L19)).

**Struct service.** Internal-only AI structured-output service on port 3032, exposing `POST /api/v1/run` with a JSON schema and returning schema-conformant Claude responses. Used by `AutoTriageService`; absent in production, hence the keyword fallback ([CLAUDE.md:174-179](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L174-L179)).

**Pay service.** External identity provider at `https://pay.jeffreykeyser.net`. JWTs from Pay carry the `user_id` that links submissions to authenticated users; admin endpoints require an admin-tier Pay JWT ([CLAUDE.md:223-229](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L223-L229), [README.md:264-270](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L264-L270)).

**beelink-deploy.** Homelab webhook receiver that handles all deploys for this repo. CI POSTs `{service, ref}` on merge to `main`; the receiver pulls + builds + restarts the systemd unit. Replaces the Lambda-deploy path implied by the template ([.github/workflows/ci-cd-pipeline.yml:9-10](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L9-L10), [.github/workflows/ci-cd-pipeline.yml:73-85](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L73-L85)).

**thrash action.** Automated maintenance trigger that the repo explicitly opts into: produce a small, low-risk PR — docs/clarity fixes, obvious quality issues — and verify lint, unit tests, and build before opening ([README.md:17-25](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L17-L25)).

**feedback-widget.** Embeddable React component (`@jeffrey-keyser/feedback-widget`) shipped from `packages/feedback-widget` and consumed by every ecosystem frontend to render the floating "report bug / request feature" UI ([packages/feedback-widget/package.json:1-5](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/packages/feedback-widget/package.json#L1-L5)).
