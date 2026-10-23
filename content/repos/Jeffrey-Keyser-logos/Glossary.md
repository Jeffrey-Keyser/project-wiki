---
title: "Logos — Glossary"
description: "Project-specific terms: contexts, pages, proposals, project documents, corpus fingerprints, retrieval and bus vocabulary."
---

# Glossary

**Hub.** The living set of themed pages that Logos distills from ingested sources. Agents query it for cited answers ([README.md:L5](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/README.md#L5)).

**Context.** An isolation boundary that scopes sources, ingest jobs, pages and feeds. Slugs must match `[a-z0-9][a-z0-9-]{0,63}` ([src/routes/v1/contexts.ts:L15-L18](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/routes/v1/contexts.ts#L15-L18)). A context named `project-<project>-<goal>` holds the requirements for one durable reconciliation goal ([docs/project-documents.md:L21-L33](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/docs/project-documents.md#L21-L33)).

**Default context.** The seeded `default` slug ([src/config/context.ts:L5](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/config/context.ts#L5)). Ingests and queries that omit a context use it, and it cannot be renamed ([src/routes/v1/contexts.ts:L84-L86](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/routes/v1/contexts.ts#L84-L86)).

**Source.** One ingested URL per context. It records the `extraction_method` used: `readability`, `pdf` or `agent:<provider>` ([src/worker/ingest.ts:L301-L336](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/worker/ingest.ts#L301-L336)).

**ingest_job.** The worker's queue row. Its statuses are `queued`, `fetching`, `extracting`, `propose_pending`, `done` and `failed` ([src/db/repos/ingest-job.ts:L3-L9](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/db/repos/ingest-job.ts#L3-L9)).

**Already-known.** The short-circuit result when a URL already exists in the target context and `force` is not set ([src/ingest/service.ts:L104-L116](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/ingest/service.ts#L104-L116)).

**Page and page_section.** A page is a row plus ordered, typed sections. Section kinds are `overview`, `key_insight`, `open_question`, `see_also` and `citation_note`. Markdown is rendered from the sections on read ([README.md:L139-L149](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/README.md#L139-L149), [src/pages/render.ts:L7-L13](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/pages/render.ts#L7-L13)).

**Proposal.** A pending change to the hub. Statuses are `pending`, `approved`, `rejected`, `commented` and `superseded`. Kinds include `create_page` and `update_page` ([src/db/repos/proposal.ts:L3-L15](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/db/repos/proposal.ts#L3-L15)). Only `pending` and `commented` proposals can be approved or rejected ([src/routes/v1/proposals.ts:L117-L121](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/routes/v1/proposals.ts#L117-L121)).

**Revise / superseded.** A comment triggers a synchronous Struct call using the `logos/proposal-revise` prompt. The call produces a new pending proposal, and the old one becomes `superseded` ([src/proposals/revise.ts:L13](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/proposals/revise.ts#L13), [src/proposals/revise.ts:L131-L142](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/proposals/revise.ts#L131-L142)).

**Theme, canonical and alias.** Themes are free-form labels invented by the LLM and linked to pages ([src/proposals/apply.ts:L314-L332](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/proposals/apply.ts#L314-L332)). Merging two themes makes the loser an alias of the winner, which becomes canonical ([src/routes/v1/themes.ts:L137-L166](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/routes/v1/themes.ts#L137-L166)).

**Struct call.** A schema-validated JSON request to Struct's `/api/v1/run` endpoint. The input is embedded in the prompt ([src/llm/struct.ts:L60-L70](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/llm/struct.ts#L60-L70)).

**Native agent dispatch.** A free-form CLI call to Codex, Copilot or Gemini. It acquires a lockfile slot first. A `pin` value deterministically picks the first provider to try ([src/agents/native-cli.ts:L110-L120](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/agents/native-cli.ts#L110-L120)).

**RRF.** Reciprocal Rank Fusion of the semantic and lexical result lists, with k=60 and 20 candidates per list ([src/query/retrieve.ts:L68-L70](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/query/retrieve.ts#L68-L70)).

**Semantic distance gate.** The 0.5 cosine-distance ceiling that drops off-topic vector hits before fusion ([src/query/retrieve.ts:L111-L116](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/query/retrieve.ts#L111-L116)).

**Empty-hub.** The query outcome when nothing is retrieved. The answer is "Logos has nothing indexed on this topic yet." ([src/query/run.ts:L66](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/query/run.ts#L66)).

**Degraded answer.** The retrieval-only response returned when synthesis fails ([src/query/run.ts:L68-L78](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/query/run.ts#L68-L78)).

**Project document.** A stable-ID document whose revisions are immutable. Kinds are `markdown`, `text` or `url`, and documents can be reversibly deactivated ([src/db/repos/project-document.ts:L3-L17](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/db/repos/project-document.ts#L3-L17)).

**Corpus snapshot / fingerprint.** A snapshot is the complete set of active documents in a context. The fingerprint is a `sha256:` hash over the sorted document IDs, content hashes and titles ([src/project-documents/service.ts:L49-L54](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/project-documents/service.ts#L49-L54)).

**logos.context.changed.** An event emitted only when a context's fingerprint actually changes ([src/project-documents/service.ts:L100-L123](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/project-documents/service.ts#L100-L123)).

**logos.events.** The topic exchange Logos publishes to. It is asserted on every connect ([src/bus/rabbit.ts:L60-L65](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/bus/rabbit.ts#L60-L65)).

**Digest.** A daily summary of pending proposals, published as `logos.digest.ready` ([src/cron/digest.ts:L64-L69](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/cron/digest.ts#L64-L69)).

**embedding_version.** A per-chunk version number compared against `CURRENT_EMBEDDING_VERSION` to find rows that need re-embedding ([src/embed/constants.ts:L1-L6](https://github.com/Jeffrey-Keyser/logos/blob/818a9eeb9f98a6c82656c22be7eeeb73bd1f9cd0/src/embed/constants.ts#L1-L6)).
