---
title: "Glossary"
description: "Project-specific terms used in QA Patrol code, routes, and docs, each tied to a source citation."
---

# Glossary

**Run** — one execution record in `qa.runs`. Overall status is pass, partial, fail, or error ([README.md:L142-L147](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L142-L147), [src/routes/versions/v1/runs.ts:L109-L114](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/runs.ts#L109-L114)).

**Workflow** — a stored, reusable definition with an optional schedule ([CLAUDE.md:L47](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/CLAUDE.md#L47)). Scheduled workflows are registered with cron-service ([src/routes/versions/v1/workflows.ts:L61-L63](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/workflows.ts#L61-L63)).

**Step** — one browser action. Valid actions are `navigate`, `click`, `fill`, `screenshot`, `assert-visible`, `assert-text`, and `wait` ([src/types/models.ts:L3](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/types/models.ts#L3)).

**Instructions** — free text that the AI proxy turns into a step array when no steps are given ([src/services/step-generator.ts:L44-L47](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/step-generator.ts#L44-L47)).

**Promote** — `POST /api/v1/runs/:id/promote`, which turns a completed run into a workflow ([src/routes/versions/v1/runs.ts:L210-L213](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/runs.ts#L210-L213)).

**Probe** — a smoke check with its own run records, triggered by API or cron ([src/routes/versions/v1/probe-runs.ts:L169-L193](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/probe-runs.ts#L169-L193)).

**Probe finding** — a severity-tagged result attached to a probe run ([src/types/models.ts:L134](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/types/models.ts#L134), [src/routes/versions/v1/probe-runs.ts:L53-L82](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/probe-runs.ts#L53-L82)).

**Probe run status** — includes `skipped` and `dry_run_complete` in addition to pass, fail, and error ([src/types/models.ts:L133](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/types/models.ts#L133)).

**Escalation** — probe setting with modes `every` (the default) and `consecutive` ([src/services/probe-runner.ts:L28](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/probe-runner.ts#L28), [src/services/probe-runner.ts:L355-L359](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/probe-runner.ts#L355-L359)).

**Trigger source** — who started a run. Manual is the HTTP default, and cron-delivered probe triggers record `cron` ([src/routes/versions/v1/probe-runs.ts:L177-L182](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/probe-runs.ts#L177-L182), [src/services/rabbitmq-consumer.ts:L72-L75](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/rabbitmq-consumer.ts#L72-L75)).

**Pay-auth** — the auth type for targets that need the ecosystem login ([src/services/auth-detector.ts:L3](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/auth-detector.ts#L3), [src/services/auth-detector.ts:L32-L39](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/auth-detector.ts#L32-L39)).

**qa-support profile** — the protected auth profile. It names the `PAY_AUTH_EMAIL` and `PAY_AUTH_PASSWORD` secrets, not their values ([src/services/auth-profile.ts:L22-L33](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/auth-profile.ts#L22-L33)).

**Auth state store** — protected per-identity browser state under `QA_PATROL_AUTH_STATE_DIR` ([src/services/auth-state-store.ts:L318-L320](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/auth-state-store.ts#L318-L320)). State files require owner-only permissions ([src/services/auth-state-store.ts:L61-L62](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/auth-state-store.ts#L61-L62)).

**`__PAY_AUTH__`** — the first login tier, a programmatic login API on the page ([src/services/auth.ts:L37-L47](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/auth.ts#L37-L47)).

**React onChange fallback** — the last login tier, which drives React change handlers directly ([src/services/auth.ts:L59-L68](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/auth.ts#L59-L68)).

**Evidence** — per-run screenshots stored under `evidence/runs/<runId>` ([src/services/playwright-runner.ts:L142-L143](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/playwright-runner.ts#L142-L143)) and served at `/evidence` ([src/app.ts:L15-L18](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/app.ts#L15-L18)).

**Keep-latest-per-group** — the retention strategy that keeps the newest run per workflow or app ([src/services/evidence-cleanup.ts:L104-L107](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/evidence-cleanup.ts#L104-L107)).

**Completion hooks** — fire-and-forget work after a run: RabbitMQ, callback, GitHub issues, and evidence cleanup ([src/routes/versions/v1/runs.ts:L256-L293](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/runs.ts#L256-L293)).

**Callback URL** — a caller-supplied webhook for run results. Private and loopback hosts are blocked ([src/services/webhook-notifier.ts:L5-L25](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/webhook-notifier.ts#L5-L25)).

**`qa.events`** — the documented run-event exchange name ([README.md:L229](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L229)). The code takes the exact name from the message-contracts package ([src/services/rabbitmq-publisher.ts:L57](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/rabbitmq-publisher.ts#L57)).

**`cron.jobs`** — the exchange that cron triggers arrive on ([src/services/rabbitmq-consumer.ts:L8](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/rabbitmq-consumer.ts#L8)).

**`qa.probes`** — the exchange for probe events ([src/services/probe-event-publisher.ts:L8](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/probe-event-publisher.ts#L8)).

**`DISPLAY=:99`** — the virtual display that system Chrome uses under the service unit ([qa-patrol.service:L10](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/qa-patrol.service#L10), [README.md:L184](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L184)).

**Ping proof** — an operator-only live authentication check, pending verification ([docs/ping-auth-proof.md:L3](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/docs/ping-auth-proof.md#L3)).

**Kill switch** — `QA_PATROL_LIVE_PROOF_KILL_SWITCH`. Only an explicit `0` lets the Ping proof proceed ([src/services/ping-proof.ts:L120-L122](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/ping-proof.ts#L120-L122)).
