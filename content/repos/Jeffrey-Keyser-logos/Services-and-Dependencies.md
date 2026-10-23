---
title: "Logos — Services & Dependencies"
description: "Upstream services Logos calls, and confirmed versus expected downstream consumers of its HTTP API and RabbitMQ events."
---

# Services & Dependencies

This page separates dependencies that appear in code from those that only appear in documentation. A dependency having source code here does not prove it is deployed.

## Depends on

### Runtime services

- **Postgres with pgvector.** Logos uses a pool of up to 5 connections. SSL defaults to on in production ([src/config/env.ts:L29-L43](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/config/env.ts#L29-L43), [src/db/connection.ts:L4](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/db/connection.ts#L4)).
- **RabbitMQ.**
  - `RABBITMQ_URL` is required in production ([src/config/env.ts:L50-L58](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/config/env.ts#L50-L58)).
  - The exchange definition comes from `@jeffrey-keyser/message-contracts` ([src/bus/rabbit.ts:L2-L16](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bus/rabbit.ts#L2-L16)).
  - If the broker is unavailable, the HTTP API keeps working ([src/bin/www.ts:L21-L25](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bin/www.ts#L21-L25)).
- **Struct.**
  - Configured through `LOGOS_STRUCT_URL`, defaulting to `http://localhost:3032`, with the bearer token `LOGOS_STRUCT_TOKEN` ([src/llm/struct.ts:L3](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/llm/struct.ts#L3), [src/llm/struct.ts:L56-L57](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/llm/struct.ts#L56-L57)).
  - Used for page proposals, revisions and answer synthesis ([src/worker/ingest.ts:L203-L217](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/worker/ingest.ts#L203-L217), [src/proposals/revise.ts:L101-L119](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/proposals/revise.ts#L101-L119), [src/query/synthesize.ts:L87-L95](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/query/synthesize.ts#L87-L95)).
- **prompt-registry.** Prompt bodies are fetched by key at runtime ([src/llm/struct.ts:L59](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/llm/struct.ts#L59), [src/worker/ingest.ts:L312](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/worker/ingest.ts#L312)). The deploy seeds them and fails if seeding fails ([deploy.sh:L121-L126](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/deploy.sh#L121-L126)).
- **Solo Vault.** It supplies the database password, service token, Struct token and RabbitMQ URL at deploy time ([deploy.sh:L62-L71](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/deploy.sh#L62-L71)). The CLI also reads `service-token` from it ([src/bin/logos.ts:L48-L63](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bin/logos.ts#L48-L63)).
- **cron-service.** `register-cron` posts job specifications to it. Failure is tolerated ([deploy.sh:L128-L134](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/deploy.sh#L128-L134)).
- **Native agent CLIs.** Logos shells out to `codex`, `gh copilot` and `gemini` from the host PATH ([src/agents/native-cli.ts:L38-L50](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/agents/native-cli.ts#L38-L50)).
- **The public web.**
  - Article and PDF fetches use a capped body size and a 20s timeout ([src/ingest/fetch.ts:L1-L4](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/ingest/fetch.ts#L1-L4)).
  - The model loader may fetch remotely as a fallback ([src/embed/index.ts:L20-L22](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/embed/index.ts#L20-L22)).
- **beelink-deploy.** It is documented as the auto-deploy driver that invokes `deploy.sh` ([deploy.sh:L4-L7](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/deploy.sh#L4-L7), [README.md:L54](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/README.md#L54)).

### Libraries

| Library | Purpose | Source |
|---|---|---|
| `express-server-factory` | Server scaffolding | [package.json:L20-L22](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/package.json#L20-L22) |
| `database-base-config` | Database pool and DAL base | [package.json:L20-L22](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/package.json#L20-L22) |
| `message-contracts` | Event routing keys and payload types | [package.json:L20-L22](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/package.json#L20-L22) |
| `@mozilla/readability`, `jsdom`, `pdf-parse` | Content extraction | [package.json:L23-L33](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/package.json#L23-L33) |
| `@xenova/transformers` | Local embeddings | [package.json:L23-L33](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/package.json#L23-L33) |
| `marked`, `diff` | Proposal rendering and diffs | [package.json:L23-L33](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/package.json#L23-L33) |

## Consumed by

### Confirmed in this repository

- **`logos` CLI.** It calls `/v1/*` with a bearer token ([src/bin/logos.ts:L134-L157](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bin/logos.ts#L134-L157)).
- **`/proposals` HTML router.** It calls `/v1/proposals/*` internally ([src/routes/proposals-html.ts:L116-L120](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/routes/proposals-html.ts#L116-L120)).
- **RSS poller.** Logos publishes `logos.ingest.requested` for itself to consume ([src/cron/rss-poll.ts:L77-L84](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/cron/rss-poll.ts#L77-L84)).

### Inbound events handled

The consumer handles five routing keys ([src/bus/consumer.ts:L51-L57](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bus/consumer.ts#L51-L57)):

- `logos.ingest.requested`
- `logos.proposal.commented`
- `logos.jobs.digest`
- `logos.jobs.reembed`
- `logos.jobs.rss`

The `logos.jobs.*` keys are expected to come from cron-service ([src/bus/consumer.ts:L72-L74](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bus/consumer.ts#L72-L74)). Whether cron-service actually publishes them in production is not verified here.

### Emitted events

Logos emits eight routing keys ([src/bus/rabbit.ts:L175-L205](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bus/rabbit.ts#L175-L205)):

- `ingest.requested`
- `ingest.completed`
- `ingest.failed`
- `proposal.created`
- `proposal.applied`
- `page.created`
- `digest.ready`
- `context.changed`

Known subscribers by event:

- **`logos.digest.ready`:** a code comment names NanoClaw as the only consumer ([src/bus/rabbit.ts:L18-L19](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bus/rabbit.ts#L18-L19)).
- **`logos.context.changed`:**
  - Documented consumers must still refetch the full snapshot after the event ([docs/project-documents.md:L17-L19](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/docs/project-documents.md#L17-L19)).
  - Agency HQ is described as running standard contexts ([docs/project-documents.md:L76-L80](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/docs/project-documents.md#L76-L80)).
  - Logos itself does not consume this event.
- **All other events:** subscribers are unknown.

### Expected or future

The README lists `dev-inbox` and `agency-hq` as future `POST /v1/query` callers, and `nanoclaw` as a future mobile review surface ([README.md:L51-L53](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/README.md#L51-L53)). Treat these as unconfirmed.
