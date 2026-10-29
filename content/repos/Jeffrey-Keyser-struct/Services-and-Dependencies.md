---
title: "Struct Services and Dependencies"
description: "What Struct depends on, and which callers are confirmed in source versus documented or unknown."
---

# Services and Dependencies

## Depends on

- **Local agent CLI.** `AGENT_CLI_BIN` must point to a working Claude CLI ([README.md:L8](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/README.md#L8)). Other providers use their own bin variables ([README.md:L21-L28](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/README.md#L21-L28)).
- **Host OAuth state.** `codex`, `kimi`, and `opencode` rely on on-disk auth directories, and runners preserve `HOME` for that reason ([README.md:L30](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/README.md#L30)).
- **Codex sandbox.** The Codex runner defaults `CODEX_EXEC_FLAGS` to `--sandbox read-only --skip-git-repo-check` and forces `--sandbox read-only` even when configured flags request a wider sandbox or approval policy ([server/config/env.ts:L156](https://github.com/Jeffrey-Keyser/struct/blob/485e0bc74909d8b40d147ea24238363eaa0db7ef/server/config/env.ts#L156), [server/services/CodexRunner.ts:L34](https://github.com/Jeffrey-Keyser/struct/blob/485e0bc74909d8b40d147ea24238363eaa0db7ef/server/services/CodexRunner.ts#L34)). The example env file and the systemd unit use the same read-only default ([server/.env.example:L16](https://github.com/Jeffrey-Keyser/struct/blob/485e0bc74909d8b40d147ea24238363eaa0db7ef/server/.env.example#L16), [struct.service:L25](https://github.com/Jeffrey-Keyser/struct/blob/485e0bc74909d8b40d147ea24238363eaa0db7ef/struct.service#L25)).
- **Prompt Registry.** Required for `POST /api/v1/run/template` ([CLAUDE.md:L10](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/CLAUDE.md#L10)). The default base URL is `http://localhost:3002` ([server/config/env.ts:L188-L192](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/config/env.ts#L188-L192)). Templates are fetched from `/api/v1/prompts/` ([server/services/TemplateService.ts:L151](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/services/TemplateService.ts#L151)).
- **Agency HQ (optional).** When `AGENCY_HQ_URL` is set, Struct reads `GET /api/v1/dispatch-config/{role}` ([server/services/DispatchConfigSync.ts:L92-L98](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/services/DispatchConfigSync.ts#L92-L98)). Without it, the env provider is kept ([server/config/env.ts:L278](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/config/env.ts#L278)).
- **RabbitMQ (optional).** With `RABBITMQ_URL` set, Struct binds a private queue to `agency.events` for `dispatch-config.updated` ([server/services/DispatchConfigSync.ts:L145-L153](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/services/DispatchConfigSync.ts#L145-L153)).
- **Libraries.** The server uses `@jeffrey-keyser/express-server-factory` ([server/app.ts:L1](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/app.ts#L1)) and `@jeffrey-keyser/message-contracts` for the dispatch exchange ([server/services/DispatchConfigSync.ts:L2-L6](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/services/DispatchConfigSync.ts#L2-L6)).

## Consumed by

**Confirmed in source**

- The deploy script calls `GET /metrics` and `GET /runtime-config` on the local port ([deploy.sh:L51](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/deploy.sh#L51), [deploy.sh:L73](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/deploy.sh#L73)).

**Documented, not verified here**

- Downstream callers use the run endpoints and envelope ([README.md:L3](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/README.md#L3)). No caller is named in the excerpts.
- Agency HQ's Models page shows the runtime config next to its row ([CLAUDE.md:L65](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/CLAUDE.md#L65)). Source here shows Struct reading from Agency HQ, not Agency HQ calling Struct.

**Unknown**

- Which services call `/api/v1/run` or `/api/v1/run/template` in production is unknown. The excerpts do not identify them, so none are listed as consumers.

## Not confirmed

- Whether Prompt Registry, Agency HQ, or RabbitMQ are reachable in any given environment is unknown from source alone.
