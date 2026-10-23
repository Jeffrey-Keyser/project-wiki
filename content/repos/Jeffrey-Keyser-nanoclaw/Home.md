---
title: "NanoClaw — Repo Overview"
description: "Personal agent harness: one Node.js process, tmux host runtime, Telegram channel in core, scheduler, and a provider-neutral agent runner."
---

# NanoClaw

NanoClaw is a personal assistant harness built around a stated principle: describe the runtime truthfully. Agent work runs in tmux sessions on the host today, explicit security boundaries are in place today, and isolated runtimes are the next architectural step ([README.md:L6](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L6), [README.md:L18](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L18)). The package now describes itself as a "provider-neutral personal agent runner" ([package.json:L4](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/package.json#L4)).

## At a glance

- **Shape:** a single Node.js process with no microservices. Customization happens through code changes made with Claude Code, not through configuration files ([README.md:L52](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L52), [README.md:L58](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L58)).
- **Language and runtime:** TypeScript, compiled with `tsc`, on Node.js 20 or later ([package.json:L12](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/package.json#L12), [package.json:L65-L67](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/package.json#L65-L67)).
- **Runtime:** the only adapter kind is `tmux-host`, which uses host-process isolation. Its preferred future target is `micro-vm` ([src/runtime-adapter.ts:L5-L14](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/runtime-adapter.ts#L5-L14)).
- **Channels:** only Telegram is imported in the channel barrel. Other channels are expected to arrive through skills or downstream forks ([src/channels/index.ts:L10-L11](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/channels/index.ts#L10-L11), [CLAUDE.md:L11](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/CLAUDE.md#L11)).
- **Agent providers:** the default backend is `opencode`, with `codex` as the fallback. Groups can override both in `container.json` ([src/config.ts:L146-L160](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/config.ts#L146-L160)).
- **Persistence:** SQLite at `store/messages.db`, opened in WAL mode ([src/db/index.ts:L28-L35](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/db/index.ts#L28-L35)).
- **Health:** `GET /health` and `GET /skills` are served from the main process ([README.md:L78](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L78)).

## Who uses it

NanoClaw is built for an individual user who maintains their own fork ([README.md:L56](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L56)).

- **Talking to the assistant:** the user addresses it with a trigger word, `@Andy` by default.
- **Admin surface:** the main channel, which is the user's self-chat, manages groups and tasks across all groups ([README.md:L90-L104](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L90-L104)).
- **Contributors:** core contributions are limited to hardening. New features should be submitted as skills ([CONTRIBUTING.md:L5-L7](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/CONTRIBUTING.md#L5-L7)).

## Main flow

1. **Startup.** The entry point initializes the app and the dispatcher, recovers pending messages, and then starts the message loop ([src/index.ts:L13-L21](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/index.ts#L13-L21)).
2. **Inbound messages.** Channels deliver messages through a shared `onMessage` callback. Remote-control commands are intercepted at this point, and sender-allowlist drops are applied ([src/lifecycle.ts:L349-L360](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/lifecycle.ts#L349-L360)).
3. **Per-group processing.** For each group, the dispatcher:
   - handles `/compact` and `/clear` session commands;
   - enforces the trigger rule for non-main groups;
   - formats the messages and runs the agent;
   - deduplicates results;
   - rolls the message cursor back on failure ([src/message-dispatcher.ts:L120-L288](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/message-dispatcher.ts#L120-L288)).
4. **Agent execution.** The runner reads a single JSON invocation from stdin and returns a result framed by markers on stdout ([container/agent-runner/src/index.ts:L1-L6](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/container/agent-runner/src/index.ts#L1-L6)).
5. **Scheduled work.** Scheduled tasks run in the context of their group and can reply back to it ([README.md:L75](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L75)).

## Wiki pages

- [Architecture](../architecture/)
- [Iteration Loop](../iteration-loop/)
- [Services and Dependencies](../services-and-dependencies/)
- [Operations](../operations/)
- [Glossary](../glossary/)
