---
title: Services and Dependencies
description: Inbound and outbound integrations for NanoClaw — what it depends on and what depends on it.
---

# Services and Dependencies

## Depends on

### Runtime + tooling
- **Node.js ≥20** ([package.json:64-66](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L64-L66)).
- **tmux** on macOS or Linux — the shipping agent runtime ([README.md:128](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L128), [src/runtime-adapter.ts:34-40](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/runtime-adapter.ts#L34-L40)).
- **Claude Code** CLI for setup + skill execution ([README.md:130](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L130)).

### npm runtime dependencies
- `@jeffrey-keyser/message-contracts` — shared message contracts ([package.json:37](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L37)).
- `amqplib` + `@types/amqplib` — AMQP / RabbitMQ client used by the messaging integration ([package.json:38-39](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L38-L39)).
- `better-sqlite3` — embedded SQLite store ([package.json:40](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L40)).
- `cron-parser` — schedule parsing for the task scheduler ([package.json:41](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L41)).
- `grammy` — Telegram bot framework backing the in-core Telegram channel ([package.json:42](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L42)).
- `pino` + `pino-pretty` — structured logging ([package.json:43-44](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L43-L44)).
- `yaml`, `zod` — config + schema validation ([package.json:45-46](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L45-L46)).

### External services
- **Anthropic API** (or any Claude-API-compatible endpoint) reached through the host-side credential proxy; configurable via `ANTHROPIC_BASE_URL` / `ANTHROPIC_AUTH_TOKEN` ([README.md:230-244](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L230-L244), [README.md:79](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L79)).
- **Agency HQ** for dispatch slots, worktree management, and stall recovery ([README.md:76](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L76), [src/lifecycle.ts:50-56](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/lifecycle.ts#L50-L56)). The dispatch loop writes `dispatch_blocked_until` back to Agency HQ via `PUT /api/v1/tasks/:id` ([CLAUDE.md:117-127](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L117-L127)).
- **Solo Vault** at `https://api.vault.jeffreykeyser.net` for encrypted secret fetch; falls back to `.env` when `SOLO_VAULT_TOKEN` is unset ([src/config.ts:72-80](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L72-L80)).
- **Telegram Bot API** via `grammy` for the in-core Telegram channel ([package.json:42](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L42), [README.md:72](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L72)).
- **GitHub CLI (`gh`)** for the PR workflow helpers ([README.md:138-146](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L138-L146), [CLAUDE.md:34-40](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L34-L40)).

### Filesystem inputs
- Host-side allowlists outside the project root: `~/.config/nanoclaw/mount-allowlist.json` and `~/.config/nanoclaw/sender-allowlist.json` ([src/config.ts:22-34](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L22-L34)).
- Project-local `store/`, `groups/`, `data/` directories ([src/config.ts:35-37](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L35-L37)).

## Consumed by

- **Messaging channels** (Telegram in-core; WhatsApp, Slack, Discord, Gmail, X via skills) — they push inbound messages into the router and receive outbound replies ([README.md:72-86](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L72-L86)).
- **Agency HQ orchestration** consumes NanoClaw's `/health` snapshot and dispatch reports; NanoClaw is the worker side of that exchange ([README.md:76](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L76), [CLAUDE.md:97-100](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L97-L100)).
- **Claude Code skills** ship under `.claude/skills/` and transform a NanoClaw fork in place; the repo is their target surface ([CONTRIBUTING.md:9-21](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CONTRIBUTING.md#L9-L21)).
- **The host user**, through the main channel self-chat, which is the admin/control surface for groups, scheduled tasks, and cross-group visibility ([README.md:74](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L74), [README.md:98-104](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L98-L104)).
- **HTTP probes** (operator scripts, uptime monitors) consume `GET /skills` and `GET /health` exposed from the skill/health server ([CLAUDE.md:13](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L13), [README.md:78](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L78)).
