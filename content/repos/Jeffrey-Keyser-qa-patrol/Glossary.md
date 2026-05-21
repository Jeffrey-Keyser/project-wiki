---
title: Glossary
description: Repo-specific terms used across QA Patrol code, routes, and docs.
---

# Glossary

**Run** — a single QA execution against a target app or URL, persisted as a `qa.runs` row with status `pending` → `running` → `pass | partial | fail | error` ([README.md:140-147](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L140-L147)).

**Workflow** — a reusable, named definition of steps + optional cron schedule, stored in `qa.workflows` and synced to cron-service via `cron-client.ts` ([CLAUDE.md:39](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L39), [CLAUDE.md:48](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L48)).

**Step** — one atomic browser action: `navigate`, `click`, `fill`, `screenshot`, `assert-visible`, `assert-text`, `wait` ([README.md:130-138](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L130-L138)). Defined in `src/services/playwright-runner.ts` ([CLAUDE.md:28](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L28)).

**Promote** — `POST /api/v1/runs/:id/promote` turns a successful ad-hoc run into a saved workflow ([README.md:82](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L82)).

**Probe** — smoke-test subsystem layered on top of runs, with its own tables, routes (`probe-runs.ts`), and a dedicated runner (`probe-runner.ts`); seeded by migrations `1000000005000`–`1000000009000` ([src/routes/versions/v1/probe-runs.ts](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/src/routes/versions/v1/probe-runs.ts), [migrations/1000000005000_create-probe-tables.ts](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/migrations/1000000005000_create-probe-tables.ts)).

**Pay-auth app** — a target detected by `auth-detector.ts` as requiring the ecosystem login flow; triggers the 3-tier login in `auth.ts` ([CLAUDE.md:29-30](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L29-L30)).

**`__PAY_AUTH__`** — programmatic login hook exposed on the target window object; tier 1 of the auth fallback ladder ([README.md:244](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L244)).

**React onChange hack** — legacy tier-3 login fallback that drives controlled inputs through React's internal setter ([README.md:246](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L246)).

**Instructions** — free-text request field; `step-generator.ts` decomposes it into a structured step array via gpt-4o ([README.md:215-216](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L215-L216)).

**Vision analysis** — optional gating where screenshots are sent to a vision model for content checks; opt-in via `options.enableVisionAnalysis` ([README.md:217](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L217)).

**Evidence** — screenshots and captured logs written under `evidence/runs/<runId>/` and served by the static `/evidence` router ([CLAUDE.md:42](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L42), [app.ts:16-18](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/src/app.ts#L16-L18)).

**Keep-latest-per-group** — evidence retention policy that preserves the most recent run per `workflow_id` or `app_key` group; orphan directories are kept untouched ([CLAUDE.md:55](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L55)).

**Completion hooks** — fire-and-forget post-run fan-out: RabbitMQ → webhook → Telegram → GitHub issues → evidence cleanup ([CLAUDE.md:54](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L54)).

**`qa.events`** — RabbitMQ exchange for run lifecycle events (`run.completed`, `run.failed`, `workflow.completed`) emitted by `rabbitmq-publisher.ts` ([CLAUDE.md:34](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L34), [README.md:223](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L223)).

**Callback URL** — request-supplied webhook hit on completion; protected against SSRF by `webhook-notifier.ts` ([CLAUDE.md:38](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L38)).

**`DISPLAY=:99`** — Xvfb virtual display used by system Chrome under the systemd unit so Playwright can run "headful" on a server ([CLAUDE.md:9](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L9)).
