---
title: "Services and Dependencies"
description: "What NanoClaw depends on, and which callers are confirmed versus expected or unknown."
---

# Services and Dependencies

## Depends on

### Host tooling
- **tmux and Node.js:** `tmux` must be on `PATH`. The runtime adapter throws a fatal error if `tmux -V` fails ([src/runtime-adapter.ts:L60-L96](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/runtime-adapter.ts#L60-L96)). Node.js 20 or newer is required ([package.json:L65-L67](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/package.json#L65-L67)).
- **Agent CLIs:** the configured agent CLI binaries default to the `opencode` backend, with `codex` as the fallback ([src/config.ts:L148-L160](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/config.ts#L148-L160)).
- **Claude Code:** used for setup and for running skills ([README.md:L126-L132](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L126-L132)).

### npm libraries
The runtime dependencies are listed in [package.json:L37-L47](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/package.json#L37-L47):
- `better-sqlite3`
- `grammy`
- `cron-parser`
- `pino`
- `zod`
- `yaml`
- `amqplib`
- `@jeffrey-keyser/message-contracts`

This page does not infer what the contracts package is used for.

### External services referenced in config
All of the defaults below are overridable. Their presence in config does not prove that a given installation uses them.

- **Agency HQ** at `AGENCY_HQ_URL`, default `http://localhost:3040` ([src/config.ts:L94-L98](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/config.ts#L94-L98)).
  - NanoClaw's own polling dispatcher only runs when `NANOCLAW_LEGACY_AGENCY_DISPATCH=true` ([src/agency-hq-dispatcher.ts:L49-L51](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/agency-hq-dispatcher.ts#L49-L51)).
  - In legacy mode the PostgreSQL slot backend calls `/dispatch-slots/*` ([src/dispatch-slot-backends.ts:L132-L165](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/dispatch-slot-backends.ts#L132-L165)).
  - `npm run verify` reads `/api/v1/dispatch-config/:role` ([src/cli/verify-config.ts:L64-L82](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/cli/verify-config.ts#L64-L82)).
- **Solo Vault** for secrets. When `SOLO_VAULT_TOKEN` is unset, secrets fall back to `.env` ([src/config.ts:L72-L82](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/config.ts#L72-L82)).
- **RabbitMQ** at `RABBITMQ_URL`. NanoClaw subscribes to `CronJobTriggered` events on the `cron.jobs` exchange ([src/config.ts:L89-L92](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/config.ts#L89-L92)).
- **Pantry Manager** at `PANTRY_MANAGER_URL`, default `http://localhost:3052` ([src/config.ts:L84-L87](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/config.ts#L84-L87)).
- **Model API:** any Claude-API-compatible endpoint, set with `ANTHROPIC_BASE_URL` ([README.md:L246-L253](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L246-L253)).
  - The proxy injects the real credential at request time ([docs/SECURITY.md:L73-L79](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/docs/SECURITY.md#L73-L79)).

### Host files
- **Allowlists:** the mount and sender allowlists live under `~/.config/nanoclaw/` ([src/config.ts:L22-L34](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/config.ts#L22-L34)).
- **Project directories:** `store/`, `groups/` and `data/` ([src/config.ts:L35-L37](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/config.ts#L35-L37)).

## Consumed by

### Confirmed in source
- **Telegram channel:** registered through the channel barrel ([src/channels/index.ts:L10-L11](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/channels/index.ts#L10-L11)). It feeds the shared `onMessage` callback ([src/lifecycle.ts:L349-L350](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/lifecycle.ts#L349-L350)).
- **`scripts/reload-service.mjs`:** calls the health check and the agent-event smoke ([scripts/reload-service.mjs:L74-L113](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/scripts/reload-service.mjs#L74-L113)).
  - The smoke posts to `/api/v1/agent-events` and reads the result back ([README.md:L157-L162](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L157-L162)).
- **`npm run verify`:** reads `/health` on `SKILL_SERVER_PORT` ([src/cli/verify-config.ts:L84-L95](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/cli/verify-config.ts#L84-L95)).
- **Agent runner:** spawns the `nanoclaw` MCP stdio server for each invocation ([container/agent-runner/src/index.ts:L113-L119](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/container/agent-runner/src/index.ts#L113-L119)).

### Expected, with unverified callers
- **Message API:** `POST /api/v1/messages` is documented for proactive outbound messaging ([docs/MESSAGE_API.md:L1-L13](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/docs/MESSAGE_API.md#L1-L13)). No external caller is identified in the attached source.
- **Agency HQ and dev-inbox:** these own dispatch and the `slot.*` event stream ([README.md:L167-L169](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L167-L169)). The exact interface they use to hand work to NanoClaw is not shown here.
- **Skills and forks:** additional channels and integrations are expected to arrive this way ([README.md:L81-L86](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L81-L86)).
