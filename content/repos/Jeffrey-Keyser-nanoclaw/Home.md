---
title: NanoClaw — Repo Overview
description: "Personal Claude assistant harness: one Node process, tmux-based agent runtime, channel + scheduler core."
---

# NanoClaw

Personal Claude assistant harness. Single Node.js process, skill-based channel system, tmux host execution as the shipping runtime, with a runtime adapter seam for future isolated runtimes ([README.md:6](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L6), [CLAUDE.md:7-12](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L7-L12)).

## At a glance

- **Language / runtime:** TypeScript on Node 20+, compiled via `tsc`, run with `tsx` in dev ([package.json:64-66](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L64-L66), [package.json:11-17](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L11-L17)).
- **Shape:** one Node process, a few source files, no microservices ([README.md:52](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L52)).
- **Default runtime:** tmux on the host, not Docker / Apple Container / micro-VM ([README.md:18](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L18), [CLAUDE.md:9](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L9)).
- **Channels:** Telegram lives in core; everything else arrives via Claude Code skills or downstream forks ([README.md:72-73](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L72-L73), [CLAUDE.md:11](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L11)).
- **Persistence:** SQLite via `better-sqlite3` ([package.json:40](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L40), [CLAUDE.md:23](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L23)).
- **Orchestration partner:** Agency HQ provides dispatch slots, worktrees, stall recovery ([README.md:76](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L76), [CLAUDE.md:97-100](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L97-L100)).
- **Customization model:** fork the repo and let Claude Code modify it; no config sprawl ([README.md:56-58](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L56-L58), [README.md:113-122](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L113-L122)).

## Who uses it

A single end user driving their own personal Claude assistant from a messaging channel (default Telegram), with the main-channel self-chat acting as the admin surface for groups, scheduled tasks, and cross-group visibility ([README.md:74](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L74), [README.md:90-104](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L90-L104)).

## How work moves through the repo

1. A message arrives in a channel, which self-registered at startup ([CLAUDE.md:16](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L16)).
2. The router formats it and the trigger pattern decides whether to wake the agent ([CLAUDE.md:18-20](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L18-L20), [src/config.ts:67-70](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L67-L70)).
3. The orchestrator queues work for the group and the dispatch pool hands it to a tmux-backed agent session with explicit mounts ([CLAUDE.md:14-22](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L14-L22), [README.md:173-177](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L173-L177)).
4. The agent talks to Claude via a host-side credential proxy so real Anthropic keys stay off the agent process ([README.md:79](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L79), [src/config.ts:47-50](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L47-L50)).
5. Output flows back through the router to the originating channel; the scheduler also injects recurring or one-shot tasks on the same path ([README.md:75](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L75), [CLAUDE.md:19](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L19)).

## Wiki pages

- [Architecture](./architecture/)
- [Iteration Loop](./iteration-loop/)
- [Services and Dependencies](./services-and-dependencies/)
- [Operations](./operations/)
- [Glossary](./glossary/)
