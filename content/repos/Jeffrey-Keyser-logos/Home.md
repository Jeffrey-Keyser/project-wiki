---
title: "Logos — Overview"
description: "Personal knowledge hub that ingests URLs and documents, proposes themed pages for human review, and answers agent queries with citations."
---

# Logos

Logos is a personal **knowledge hub**. It accepts URLs, distills their substance into themed pages, and lets agents ask the hub questions to get synthesized, cited answers ([README.md:L5](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/README.md#L5)). It is built for agentic consumers first. There is no reader UI for browsing the hub ([README.md:L7](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/README.md#L7)). The only HTML surface is a token-gated proposal review page ([src/app.ts:L52-L53](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/app.ts#L52-L53)).

The hub also stores **contexts**, which isolate separate knowledge corpora. It also stores authoritative **project documents** with corpus snapshots and fingerprints ([src/routes/v1/index.ts:L14-L22](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/routes/v1/index.ts#L14-L22), [docs/project-documents.md:L3-L19](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/docs/project-documents.md#L3-L19)).

## At a glance

- **Runtime:** TypeScript on Express 5, with Node `>=20` required by `engines` ([package.json:L29](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/package.json#L29), [package.json:L49-L52](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/package.json#L49-L52)).
- **Storage:** Postgres with pgvector. Search is hybrid: HNSW vector search plus tsvector lexical search, fused with RRF ([README.md:L114-L131](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/README.md#L114-L131), [src/query/retrieve.ts:L104-L109](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/query/retrieve.ts#L104-L109)).
- **Embeddings:** the local model `Xenova/bge-small-en-v1.5`, producing 384-dimension vectors ([src/embed/index.ts:L3-L4](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/embed/index.ts#L3-L4)).
- **LLM paths:**
  - Structured JSON calls go to the Struct service ([src/llm/struct.ts:L3](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/llm/struct.ts#L3)).
  - Free-form calls go through native Codex, Copilot or Gemini CLIs ([src/agents/native-cli.ts:L25](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/agents/native-cli.ts#L25)).
- **Bus:** RabbitMQ. The publisher is best-effort, and the HTTP API keeps working if the broker is down ([src/bin/www.ts:L21-L40](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bin/www.ts#L21-L40)).
- **Port:** defaults to 3070 in config. The systemd unit sets the same value ([src/config/env.ts:L24](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/config/env.ts#L24), [logos.service:L18](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/logos.service#L18)).

## Who uses it

- **The owner, via the `logos` CLI.** The CLI defaults to `https://logos.jeffreykeyser.net` ([src/bin/logos.ts:L5-L36](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bin/logos.ts#L5-L36)).
- **Reviewers in a browser,** through `/proposals?t=…` ([src/middleware/query-token-auth.ts:L4-L17](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/middleware/query-token-auth.ts#L4-L17)).
- **cron-service,** which publishes scheduled `logos.jobs.*` triggers ([src/bus/consumer.ts:L72-L74](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bus/consumer.ts#L72-L74)).
- **Future agent consumers.** The README lists `dev-inbox`, `agency-hq` and `nanoclaw` as future consumers ([README.md:L51-L53](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/README.md#L51-L53)). See [Services and Dependencies](../services-and-dependencies/) for which callers are confirmed.

## Main flow

1. **A URL arrives.** It comes in through `POST /v1/ingest` or a `logos.ingest.requested` event. The target context is resolved, and the URL is deduplicated per context ([src/routes/v1/ingest.ts:L32-L56](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/routes/v1/ingest.ts#L32-L56), [src/ingest/service.ts:L104-L116](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/ingest/service.ts#L104-L116)).
2. **The worker processes it.** It fetches the content, then extracts text with Readability, the PDF extractor or the agent fallback. It stores the source, then chunks and embeds it ([src/worker/ingest.ts:L290-L336](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/worker/ingest.ts#L290-L336)).
3. **A proposal is created.** Struct proposes a new page or an update to a candidate page. The result is stored as a `pending` proposal ([src/worker/ingest.ts:L172-L274](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/worker/ingest.ts#L172-L274)).
4. **A human reviews it.** The reviewer approves, rejects or comments. A comment triggers a synchronous revision ([src/routes/v1/proposals.ts:L111-L201](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/routes/v1/proposals.ts#L111-L201)).
5. **Agents query the hub.** `POST /v1/query` retrieves, expands and synthesizes an answer with citations ([src/query/run.ts:L123-L131](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/query/run.ts#L123-L131)).

## Wiki pages

- [Architecture](../architecture/): components, contracts and data flow.
- [Iteration Loop](../iteration-loop/): scripts, tests and the merge-to-deploy path.
- [Services & Dependencies](../services-and-dependencies/): upstream dependencies and downstream consumers.
- [Operations](../operations/): start, deploy, health checks and logs.
- [Glossary](../glossary/): project-specific terms.
