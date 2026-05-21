---
title: Logos — Overview
description: Personal knowledge hub that ingests URLs, distills them into themed pages, and answers agent queries with citations.
---

# Logos

Logos is a personal **knowledge hub**: feed it URLs, it reads, distills, and indexes the substance into themed pages, then answers agent queries with citations ([README.md:1-7](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L1-L7)).

It is built **agentic-consumers-first** — no human reader UI, just a programmable substrate other agents (and a CLI) interrogate ([README.md:7](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L7)).

## At a glance

- **Runtime.** Node 22, TypeScript 5, Express 5 ([README.md:84](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L84)).
- **Storage.** Postgres 17 + pgvector, hybrid HNSW + tsvector search fused via RRF ([README.md:97-115](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L97-L115)).
- **LLM.** Structured ops via `Jeffrey-Keyser/struct`; free-form ops via native CLI dispatcher (Claude/Copilot/Gemini) ([README.md:88-89](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L88-L89)).
- **Embeddings.** Local `bge-small-en-v1.5` ONNX via `@xenova/transformers`, 384 dim ([README.md:90](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L90), [package.json:25](https://github.com/Jeffrey-Keyser/logos/blob/main/package.json#L25)).
- **Bus.** RabbitMQ topic exchange `logos.events` via `amqplib` ([README.md:87](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L87), [src/bus/rabbit.ts](https://github.com/Jeffrey-Keyser/logos/blob/main/src/bus/rabbit.ts)).
- **Surface.** HTTP under `/v1/*` plus a thin `logos` CLI shell ([src/routes/v1/index.ts:1-20](https://github.com/Jeffrey-Keyser/logos/blob/main/src/routes/v1/index.ts#L1-L20), [README.md:392-407](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L392-L407)).
- **Port.** 3070, behind Cloudflare Tunnel at `logos.jeffreykeyser.net` ([README.md:425-443](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L425-L443)).

## Who uses it

Single-user (Jeff) for now, agentic consumers next: `dev-inbox` worker agents call `POST /v1/query` to ground plans; future `agency-hq` agents will push interesting URLs back as ingest events ([README.md:34-35](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L34-L35)).

## How work moves through it

1. URL arrives via CLI, `POST /v1/ingest`, or `logos.ingest.requested` on RabbitMQ ([README.md:46-58](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L46-L58)).
2. Worker fetches HTML, runs Readability (or CLI-agent fallback), chunks + embeds locally, calls Struct to produce a page proposal ([README.md:184-199](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L184-L199)).
3. Proposal lands in `pending`; user reviews via CLI (`logos proposals show <id>`), approves/rejects/comments ([README.md:268-280](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L268-L280)).
4. Approved proposals mutate `page` + `page_section`, regenerate `page_chunk` embeddings, emit `logos.proposal.applied` ([README.md:374-375](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L374-L375), [src/proposals/apply.ts](https://github.com/Jeffrey-Keyser/logos/blob/main/src/proposals/apply.ts)).
5. Agents call `POST /v1/query` — hybrid retrieval, Struct synthesis, structured citations returned ([README.md:291-336](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L291-L336)).

## Wiki pages

- [Architecture](./architecture/) — module/service layout, role contracts.
- [Iteration Loop](./iteration-loop/) — how a change moves idea→merge inside this repo.
- [Services & Dependencies](./services-and-dependencies/) — inbound/outbound integrations.
- [Operations](./operations/) — deploy, runtime, observability.
- [Glossary](./glossary/) — repo-specific terms.
