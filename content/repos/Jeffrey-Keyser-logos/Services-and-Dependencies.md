---
title: Logos — Services & Dependencies
description: Inbound and outbound integrations — what Logos consumes from the Jeffrey-Keyser ecosystem and which services consume Logos.
---

# Services & Dependencies

## Depends on

### Jeffrey-Keyser ecosystem services
- **`Jeffrey-Keyser/struct`** — structured LLM ops at `http://localhost:3032/api/v1/run`. Used for page proposals, proposal revision, and answer synthesis. Bearer token in Solo Vault `logos/struct-token` ([README.md:27](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L27), [README.md:446-447](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L446-L447)).
- **`Jeffrey-Keyser/prompt-registry`** — versioned prompt bodies under namespace `logos/` (`extract-fallback`, `page-propose`, `proposal-revise`, `answer-synthesize`) ([README.md:29](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L29), [README.md:457-463](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L457-L463)).
- **`Jeffrey-Keyser/solo-vault`** — secrets namespace `logos`: service token, RabbitMQ creds, DB password ([README.md:30](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L30)).
- **`@jeffrey-keyser/express-server-factory`** — CORS, `/health`, error mapping, structured logs ([README.md:31](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L31), [package.json:21](https://github.com/Jeffrey-Keyser/logos/blob/main/package.json#L21)).
- **`@jeffrey-keyser/database-base-config`** — pool config + `node-pg-migrate` integration ([README.md:32](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L32), [package.json:20](https://github.com/Jeffrey-Keyser/logos/blob/main/package.json#L20)).
- **`@jeffrey-keyser/message-contracts`** — typed payloads for `logos.events` routing keys ([package.json:22](https://github.com/Jeffrey-Keyser/logos/blob/main/package.json#L22)).
- **`Jeffrey-Keyser/cron-service`** — scheduled re-ingest, daily proposal digest, RSS poll (optional publisher) ([README.md:33](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L33), [src/cron/](https://github.com/Jeffrey-Keyser/logos/blob/main/src/cron)).
- **`Jeffrey-Keyser/beelink-deploy`** — auto-deploy on push to `main` ([README.md:37](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L37), [deploy.sh](https://github.com/Jeffrey-Keyser/logos/blob/main/deploy.sh)).

### External libraries
- **Postgres 17 + pgvector** — primary store, HNSW vector index, tsvector GIN for lexical ([README.md:86](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L86), [README.md:150-158](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L150-L158)).
- **RabbitMQ** via `amqplib` — topic exchange `logos.events` ([README.md:87](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L87), [package.json:26](https://github.com/Jeffrey-Keyser/logos/blob/main/package.json#L26)).
- **`@mozilla/readability` + `jsdom`** — HTML main-content extraction ([package.json:23](https://github.com/Jeffrey-Keyser/logos/blob/main/package.json#L23), [package.json:30](https://github.com/Jeffrey-Keyser/logos/blob/main/package.json#L30)).
- **`pdf-parse`** — PDF text extraction path ([package.json:33](https://github.com/Jeffrey-Keyser/logos/blob/main/package.json#L33), [src/ingest/extract-pdf.ts](https://github.com/Jeffrey-Keyser/logos/blob/main/src/ingest/extract-pdf.ts)).
- **`@xenova/transformers`** — ONNX runtime hosting `bge-small-en-v1.5` ([package.json:25](https://github.com/Jeffrey-Keyser/logos/blob/main/package.json#L25)).
- **`diff`, `marked`** — proposal diff rendering and markdown view ([package.json:27](https://github.com/Jeffrey-Keyser/logos/blob/main/package.json#L27), [package.json:31](https://github.com/Jeffrey-Keyser/logos/blob/main/package.json#L31)).

### Host-installed CLIs (no auth managed in Logos)
- **Claude CLI** (`claude`), **Copilot CLI** (`gh copilot`), **Gemini CLI** (`gemini`) — each authenticates via its own subscription on the host; Logos shells out via `src/agents/native-cli.ts` ([README.md:449-451](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L449-L451)).

## Consumed by

- **`Jeffrey-Keyser/dev-inbox`** — future query consumer: a worker agent calls `POST /v1/query` to ground plans. Also the source of the native multi-provider dispatcher shape ([README.md:28](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L28), [README.md:34](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L34)).
- **`Jeffrey-Keyser/agency-hq`** — future query consumer; may also push interesting URLs back as ingest events ([README.md:35](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L35)).
- **`Jeffrey-Keyser/nanoclaw`** — future Telegram surface for pending-proposal review on mobile ([README.md:36](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L36)).
- **Skill consumers** — any repo dropping `skills/logos/query.md` into its `.claude/skills/` directs its agent to call `POST /v1/query` ([README.md:340-354](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L340-L354), [skills/](https://github.com/Jeffrey-Keyser/logos/blob/main/skills)).

## Event contracts

`logos.events` topic exchange. Consumed: `logos.ingest.requested`, `logos.proposal.commented`. Emitted: `logos.ingest.completed`, `logos.ingest.failed`, `logos.proposal.created`, `logos.proposal.applied`, `logos.page.created` ([README.md:362-376](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L362-L376)).
