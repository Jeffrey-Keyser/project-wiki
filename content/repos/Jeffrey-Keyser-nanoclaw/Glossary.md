---
title: Glossary
description: NanoClaw-specific terms with one-paragraph definitions and source-file citations.
---

# Glossary

**Agency HQ.** External orchestration service that owns dispatch slots, worktrees, stall detection, and recovery flows. NanoClaw is the worker side: it asks for tasks, reports outcomes, and writes back `dispatch_blocked_until` via `PUT /api/v1/tasks/:id` after repeated dispatch failures ([README.md:76](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L76), [CLAUDE.md:113-129](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L113-L129)).

**Channel.** A self-registering inbound/outbound surface that talks to the user. Channels live in `src/channels/` and register themselves at startup via the registry. Telegram is the only channel in core; others arrive via skills or forks ([CLAUDE.md:16](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L16), [README.md:72-86](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L72-L86)).

**Credential proxy.** Host-side process that holds the real Anthropic credentials and exposes a local API for the agent so secrets never enter the agent's environment. Bind port defaults to `3001` (`CREDENTIAL_PROXY_PORT`) ([README.md:79](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L79), [src/config.ts:47-50](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L47-L50)).

**Dispatch pool.** The slot-lifecycle manager that owns concurrent worker slots, startup recovery, and drain behavior. Implemented in `src/dispatch-pool.ts`. Parallel mode (4 slots) is gated by a metrics check, with `DISPATCH_PARALLEL` as the override switch ([CLAUDE.md:23](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L23), [CLAUDE.md:94-110](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L94-L110)).

**`dispatch_blocked_until`.** Timestamp set on a task by NanoClaw after 3 consecutive dispatch failures, blocking retry for 24 hours. Clearing it requires direct SQL against Agency HQ's Postgres `tasks` table — restarting NanoClaw only resets the in-memory retry counter ([CLAUDE.md:113-129](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L113-L129)).

**Group.** A scoped conversational context with its own files, sessions, mounts, and `CLAUDE.md` / `CLAUDE.local.md` instruction files under `groups/{name}/`. `CLAUDE.local.md` is the editable source of truth; `CLAUDE.md` may be rewritten at container spawn into a composed wrapper ([README.md:74](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L74), [CLAUDE.md:55-58](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L55-L58)).

**Group queue.** Per-group FIFO of pending work, instantiated once in `lifecycle.ts` as `new GroupQueue()` and consumed by the dispatch pool ([src/lifecycle.ts:80](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/lifecycle.ts#L80)).

**IPC watcher.** Filesystem-based IPC mechanism that watches a directory for task / message / feedback files and routes them to handlers in `src/ipc/`. Started by `lifecycle.ts` and polled at `IPC_POLL_INTERVAL` (1s) ([CLAUDE.md:18](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L18), [src/config.ts:55-56](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L55-L56)).

**Main channel / main group.** The user's self-chat that acts as the admin surface — group registration, cross-group task visibility, narrow admin actions, remote control — gated separately from non-admin groups ([README.md:74](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L74)).

**Mount allowlist.** JSON allowlist file at `~/.config/nanoclaw/mount-allowlist.json`, stored *outside* the project root specifically so it is never mounted into the agent. Validates what host paths agents may see ([src/config.ts:22-28](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L22-L28)).

**Runtime adapter.** Abstraction in `src/runtime-adapter.ts` describing the agent runtime contract (`RuntimeKind`, `RuntimeDescriptor`, `AgentRuntimeAdapter`). The only shipping implementation is `TmuxRuntimeAdapter` (`kind: 'tmux-host'`) with `preferredTarget: 'micro-vm'` noting the next architectural step ([src/runtime-adapter.ts:5-40](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/runtime-adapter.ts#L5-L40)).

**Sender allowlist.** JSON allowlist at `~/.config/nanoclaw/sender-allowlist.json` controlling which message senders are accepted; loaded by `src/sender-allowlist.ts` and used by the router ([src/config.ts:29-34](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L29-L34), [src/lifecycle.ts:42-46](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/lifecycle.ts#L42-L46)).

**Skill.** A markdown file under `.claude/skills/` that teaches Claude Code how to transform a NanoClaw installation. Skill PRs must not modify source files — they are *instructions*, not pre-built code ([CONTRIBUTING.md:9-15](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CONTRIBUTING.md#L9-L15)).

**Solo Vault.** Encrypted secrets backend at `https://api.vault.jeffreykeyser.net`. When `SOLO_VAULT_TOKEN` is set, secrets are fetched from `/v1/secrets/:project/:env/:key`; otherwise NanoClaw falls back to `.env` ([src/config.ts:72-80](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L72-L80)).

**Trigger pattern.** Regex built from `ASSISTANT_NAME` (default `Andy`) that decides whether an inbound message wakes the agent — `^@Andy\b` case-insensitive by default ([src/config.ts:11-15](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L11-L15), [src/config.ts:67-70](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L67-L70)).
