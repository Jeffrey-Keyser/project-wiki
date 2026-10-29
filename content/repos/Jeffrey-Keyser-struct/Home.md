---
title: "Struct Home"
description: "Overview of the Struct structured-completion service, its main request flow, and a map of this wiki."
---

# Struct

Struct is an internal structured-completion service. It accepts a direct prompt or a Prompt Registry template, runs a local agent CLI, optionally validates the output against JSON Schema, and returns a stable response envelope for downstream callers ([README.md:L3](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/README.md#L3)).

## At a glance

- Express service. The default port is 3032 when `PORT` is unset ([server/config/env.ts:L160](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/config/env.ts#L160)).
- It is a service, not a library. The package `main` is `dist/bin/www.js` ([server/package.json:L5](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/package.json#L5)).
- Four CLI providers can back it: `claude-code` (default), `codex`, `kimi`, and `opencode` ([server/config/providers.ts:L3](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/config/providers.ts#L3)).
- Node.js 22 is the documented runtime ([README.md:L7](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/README.md#L7)).
- Documentation describes the service as internal-network first. Optional `STRUCT_API_KEY` enforcement and in-memory rate limiting are available ([README.md:L85-L87](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/README.md#L85-L87)).
- The Codex runner always runs with `--sandbox read-only`. Configured exec flags that widen the sandbox or approval policy are stripped with a warning ([README.md:L88](https://github.com/Jeffrey-Keyser/struct/blob/485e0bc74909d8b40d147ea24238363eaa0db7ef/README.md#L88), [server/services/CodexRunner.ts:L34](https://github.com/Jeffrey-Keyser/struct/blob/485e0bc74909d8b40d147ea24238363eaa0db7ef/server/services/CodexRunner.ts#L34)).
- No database. Async jobs and the template cache are held in process memory ([server/services/AsyncJobService.ts:L35](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/services/AsyncJobService.ts#L35), [server/services/TemplateService.ts:L17](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/services/TemplateService.ts#L17)).

## Who uses it

- Confirmed in this snapshot: the deploy script polls `/metrics` to wait for idle, then reads `/runtime-config` for a post-deploy summary ([deploy.sh:L51](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/deploy.sh#L51), [deploy.sh:L73-L74](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/deploy.sh#L73-L74)).
- Documented: downstream callers consume the envelope ([README.md:L3](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/README.md#L3)). No named caller appears in the source excerpts. See the Services page.

## Main flow

1. A caller posts to `POST /api/v1/run` or `POST /api/v1/run/template` ([README.md:L59-L60](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/README.md#L59-L60)).
2. Request bodies are validated with Zod schemas ([server/types/api.ts:L46-L55](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/types/api.ts#L46-L55)).
3. Template requests are resolved first. Missing templates, timeouts, and empty values map to 404, 504, and 502 ([README.md:L61](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/README.md#L61)).
4. `StructRunner` takes a concurrency slot and runs the selected tool runner ([server/services/StructRunner.ts:L227-L238](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/services/StructRunner.ts#L227-L238)).
5. In structured mode, output is extracted and validated, and retries occur on mismatch ([server/services/StructRunner.ts:L335-L358](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/services/StructRunner.ts#L335-L358)).
6. The response envelope is returned. Direct runs return HTTP 200 for both success and runner-level failure ([README.md:L59](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/README.md#L59)).

## Wiki map

- [Architecture](../architecture/)
- [Iteration loop](../iteration-loop/)
- [Services and dependencies](../services-and-dependencies/)
- [Operations](../operations/)
- [Glossary](../glossary/)
