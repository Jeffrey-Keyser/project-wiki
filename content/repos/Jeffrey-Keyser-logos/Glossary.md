---
title: Logos — Glossary
description: Repo-specific terms — page, page_section, proposal, source, theme, struct call, native-CLI dispatch, RRF.
---

# Glossary

### Hub
The collection of themed `page` rows in the `logos` schema — the "living" output of the system. Distinct from the archive of raw `source` rows ([README.md:5](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L5)).

### Page
A themed entry in the hub. Not a single markdown blob — a `page` row plus an ordered list of `page_section` rows, with markdown rendered from the structured form on read. Keyed by `slug`, versioned via `page.version` ([README.md:122-132](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L122-L132)).

### page_section
An ordered, typed unit of page content. `kind ∈ {overview, key_insight, open_question, see_also, citation_note}`. Diff-style proposals operate on these semantic units rather than fighting freeform-text diffs ([README.md:128-130](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L128-L130)).

### Source
A single ingested URL row in `logos.source`. Unique on `url`; holds `raw_text`, `extraction_method`, `content_hash`. Sources are chunked into `source_chunk` rows for citation grounding ([README.md:138](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L138)).

### Theme
A tag namespace row in `logos.theme`. Has a slug, name, description, and a `vector(384)` embedding so the worker can pick candidate pages by theme similarity at proposal time ([README.md:140](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L140), [README.md:192](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L192)).

### Proposal
A pending change to a page — every mutation to the hub goes through this gate. State machine: `pending → approved | rejected | commented → superseded`. `commented` re-runs through Struct with the `logos/proposal-revise` prompt ([README.md:254-266](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L254-L266), [src/proposals/revise.ts](https://github.com/Jeffrey-Keyser/logos/blob/main/src/proposals/revise.ts)).

### Struct call
A `POST http://localhost:3032/api/v1/run` to `Jeffrey-Keyser/struct` with `{prompt, input, schema}`. Struct loops Claude CLI internally on parse/validation failure and returns a typed object. Used for proposal generation, proposal revision, and answer synthesis ([README.md:226-248](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L226-L248), [src/llm/struct.ts](https://github.com/Jeffrey-Keyser/logos/blob/main/src/llm/struct.ts)).

### Native CLI dispatch
The non-Struct LLM path — `src/agents/native-cli.ts` shells out to whichever installed CLI agent (`claude`, `gh copilot`, `gemini`) is available, acquires a concurrency slot via lockfile, pipes a prompt in, returns stdout. Primary use is extraction fallback when Readability returns < 500 chars ([README.md:88-89](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L88-L89), [README.md:175-177](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L175-L177)).

### extraction_method
A `source` column recording which extractor produced `raw_text`: `readability`, `agent:claude`, `agent:copilot`, `agent:gemini`. Lets ops audit fallback rate per provider ([README.md:177](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L177)).

### page_chunk / source_chunk
Embedding-row tables. `page_chunk` powers query-time retrieval; `source_chunk` powers article-level citation grounding. Both use `vector(384)` with an HNSW cosine index ([README.md:139-144](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L139-L144), [README.md:151-154](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L151-L154)).

### RRF (Reciprocal Rank Fusion)
The fusion step in `/v1/query`: take top-20 chunks by HNSW cosine and top-20 by tsvector rank, combine with RRF (k=60), dedup by page. Handles the "embedding misses the proper noun" failure mode without learned reranking ([README.md:101](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L101), [README.md:328-329](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L328-L329)).

### ingest_job
The queue table the in-process worker polls with `SELECT ... FOR UPDATE SKIP LOCKED`. Status enum: `queued | fetching | extracting | proposing | done | failed`. Idempotent on `source.url` — a second ingest of a known URL returns the existing job unless `?force=true` ([README.md:146](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L146), [README.md:163-166](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L163-L166), [README.md:218](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L218)).

### logos.events
The RabbitMQ topic exchange Logos publishes to and consumes from. Routing keys are namespaced under `logos.*` and payloads are typed via `@jeffrey-keyser/message-contracts` ([README.md:360-376](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L360-L376), [package.json:22](https://github.com/Jeffrey-Keyser/logos/blob/main/package.json#L22)).

### Phase PRD
A self-contained, agent-executable spec under `prds/phase-*.md`. Each phase is meant to be handed off as a single file to one worker; the README §16 ledger tracks which phases are ✅ Done ([README.md:469-470](https://github.com/Jeffrey-Keyser/logos/blob/main/README.md#L469-L470), [prds/](https://github.com/Jeffrey-Keyser/logos/blob/main/prds)).
