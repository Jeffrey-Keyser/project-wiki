---
title: "Glossary"
description: "Project-specific terms used in Feedback Registry, each defined with citations to the source that establishes it."
---

# Glossary

**Submission.** A feedback record (bug, feature or question) inserted into `feedback.submissions` ([server/dal/submissions.ts:L63-L67](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/dal/submissions.ts#L63-L67)). Feedback types are limited to bug, feature and question ([server/routes/feedback.ts:L158-L160](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/routes/feedback.ts#L158-L160)).

**Short ID.** The public tracking identifier. The service treats IDs matching three uppercase letters, a hyphen and eight uppercase letters or digits as short IDs ([server/services/FeedbackService.ts:L295-L299](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/FeedbackService.ts#L295-L299)).

**App ID.** The lowercase, hyphenated key for a registered application ([server/services/AppService.ts:L26-L31](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/AppService.ts#L26-L31)). Submissions to unregistered apps are rejected ([server/services/FeedbackService.ts:L181-L184](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/FeedbackService.ts#L181-L184)).

**Fingerprint.** A 16-character hash of app ID, normalized title and error-like description text, used to find likely duplicates ([server/services/FeedbackService.ts:L111-L115](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/FeedbackService.ts#L111-L115)).

**Duplicate.** A submission whose fingerprint matches earlier ones is marked as a duplicate of the oldest match ([server/services/FeedbackService.ts:L223-L229](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/FeedbackService.ts#L223-L229)).

**Auto-triage.** Background classification of a newly submitted item when the app enables it, followed by triage fields and an internal comment ([server/services/AutoTriageService.ts:L74-L97](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/AutoTriageService.ts#L74-L97)).

**Severity.** One of low, medium, high or critical ([server/services/TriageClassification.ts:L10](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/TriageClassification.ts#L10)). Critical is reserved for reported data loss, security issues or crashes ([server/services/TriageClassification.ts:L23](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/TriageClassification.ts#L23)).

**Topic label.** A fixed topic such as `ui`, `auth` or `api` ([server/services/TriageClassification.ts:L11](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/TriageClassification.ts#L11)).

**Jev.** The primary classifier, reached at `FEEDBACK_JEV_ENDPOINT`. Its model must be pinned, such as `jev-1.13.0` ([server/services/JevTriageClassifier.ts:L57-L58](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/JevTriageClassifier.ts#L57-L58)).

**Struct service.** The fallback classifier at `STRUCT_URL`, called at `/api/v1/run` ([server/services/TriageClassifier.ts:L61](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/TriageClassifier.ts#L61)). CLAUDE.md describes it as internal only ([CLAUDE.md:L238](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/CLAUDE.md#L238)).

**Keyword rules.** The last-resort classifier that inspects title and description text ([server/services/TriageClassification.ts:L65-L70](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/TriageClassification.ts#L65-L70)).

**Internal comment.** A comment with `is_internal` set. Public feedback reads exclude these ([server/dal/comments.ts:L82-L95](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/dal/comments.ts#L82-L95), [server/services/FeedbackService.ts:L305-L306](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/FeedbackService.ts#L305-L306)).

**Per-app webhook.** A callback posted to an app's configured `webhookUrl` ([server/services/WebhookDispatchService.ts:L14-L23](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/WebhookDispatchService.ts#L14-L23)).

**Global webhook.** A signed callback to `FEEDBACK_WEBHOOK_URL`, sent with an `x-webhook-signature` header ([server/services/GlobalWebhookService.ts:L18-L24](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/GlobalWebhookService.ts#L18-L24), [server/services/GlobalWebhookService.ts:L42](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/GlobalWebhookService.ts#L42)).

**Issue outbox.** The background publisher that creates GitHub issues from committed intents on a 30-second timer when a token is set ([server/services/FeedbackIssueOutbox.ts:L9-L10](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/FeedbackIssueOutbox.ts#L9-L10), [server/services/FeedbackIssueOutbox.ts:L29](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/FeedbackIssueOutbox.ts#L29)).

**Pay service.** The external identity provider whose JWTs the server validates ([server/app.ts:L34](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/app.ts#L34)).

**Incident.** A runtime failure tracked separately from user feedback in the incidents schema ([docs/runtime-incidents.md:L3-L5](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/docs/runtime-incidents.md#L3-L5)).

**Repair mode.** Application policy controlling automated repair work. It defaults to advisory ([docs/runtime-incidents.md:L33](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/docs/runtime-incidents.md#L33)).

**Operator token.** The credential that protects incident metrics and inspection routes ([server/incidents/routes.ts:L73-L79](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/incidents/routes.ts#L73-L79)).

**beelink-deploy.** The external webhook that CI calls on pushes to `main` ([.github/workflows/ci-cd-pipeline.yml:L9-L10](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/.github/workflows/ci-cd-pipeline.yml#L9-L10)).

**feedback-widget.** The embeddable React package `@jeffrey-keyser/feedback-widget` ([packages/feedback-widget/package.json:L2-L4](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/packages/feedback-widget/package.json#L2-L4)).

**Correlation ID.** A per-request identifier assigned by middleware ([server/app.ts:L221-L222](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/app.ts#L221-L222)).
