---
title: "Glossary"
description: "NanoClaw-specific terms with source citations."
---

# Glossary

**Agent event.** A tracked unit of agent work with statuses such as running, completed and failed. It is stored in SQLite and pruned after 7 days ([src/db/index.ts:L49-L62](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/db/index.ts#L49-L62), [src/lifecycle.ts:L185](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/lifecycle.ts#L185)). Agent events can be submitted through `/api/v1/agent-events` ([README.md:L157-L161](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L157-L161)).

**Agent runner.** The host process that handles one invocation per run. It reads JSON on stdin and writes its result to stdout between `---NANOCLAW_OUTPUT_START---` and `---NANOCLAW_OUTPUT_END---` markers. Provider selection is delegated to a `RunnerBackend` ([container/agent-runner/src/index.ts:L1-L6](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/container/agent-runner/src/index.ts#L1-L6), [container/agent-runner/src/index.ts:L33-L34](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/container/agent-runner/src/index.ts#L33-L34)).

**Agency HQ.** An external service that owns task dispatch. NanoClaw's polling dispatcher is a legacy compatibility mode ([src/agency-hq-dispatcher.ts:L45-L51](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/agency-hq-dispatcher.ts#L45-L51)).

**Capture execution.** An agent run against a diagnostic copy of a group, with no extra mounts. Its output is captured rather than sent to the channel ([src/message-dispatcher.ts:L55-L98](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/message-dispatcher.ts#L55-L98)).

**Channel.** A messaging adapter that implements `ownsJid`, `sendMessage` and related methods, and registers itself when imported ([docs/channel-development.md:L7-L12](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/docs/channel-development.md#L7-L12)). Telegram is the only channel in core ([src/channels/index.ts:L10-L11](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/channels/index.ts#L10-L11)).

**CLAUDE.local.md.** The editable per-group memory and persona file. `groups/{name}/CLAUDE.md` is a generated wrapper around it ([CLAUDE.md:L30-L31](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/CLAUDE.md#L30-L31)).

**Credential proxy.** A local HTTP proxy that holds the real credentials. Agent sessions are given only a placeholder auth value ([docs/SECURITY.md:L73-L79](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/docs/SECURITY.md#L73-L79)).

**Dispatch slot.** A worker slot used by legacy parallel dispatch. Each slot moves through the states acquiring → executing → releasing → free. Slots are stored in SQLite by default, or in Agency HQ's PostgreSQL when `DISPATCH_SLOTS_PG=true` ([src/dispatch-pool.ts:L4-L25](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/dispatch-pool.ts#L4-L25)). There are four slots ([src/dispatch-pool-constants.ts:L2](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/dispatch-pool-constants.ts#L2)).

**`dispatch_blocked_until`.** A penalty timestamp the legacy loop sets on a task after three failed dispatch attempts ([src/dispatch-loop.ts:L34-L42](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/dispatch-loop.ts#L34-L42)). Clearing it requires SQL in Agency HQ ([CLAUDE.md:L131-L140](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/CLAUDE.md#L131-L140)).

**`DISPATCH_PARALLEL`.** Controls parallel dispatch ([CLAUDE.md:L121-L127](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/CLAUDE.md#L121-L127)):
- `true` force-enables it.
- `false` is a kill switch.
- Leaving it unset lets the metrics gate decide.

**GroupQueue.** The queue that orders per-group work, instantiated once in lifecycle ([src/lifecycle.ts:L84](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/lifecycle.ts#L84)).

**IPC.** JSON request files placed in `data/ipc/{group}/messages|tasks/` and processed by `src/ipc.ts` ([docs/IPC.md:L5](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/docs/IPC.md#L5)).

**Main group.** The trusted admin group. Only the main group can register groups or target other groups' chats and tasks ([docs/SECURITY.md:L56-L67](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/docs/SECURITY.md#L56-L67)).

**Metrics gate.** Agency HQ's `/notifications/metrics/gate` check. It must pass before parallel dispatch is enabled automatically ([src/agency-hq-dispatcher.ts:L249-L293](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/agency-hq-dispatcher.ts#L249-L293)).

**Mount allowlist.** The file `~/.config/nanoclaw/mount-allowlist.json`. It is stored outside the project and is never mounted into agent sessions ([src/config.ts:L22-L28](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/config.ts#L22-L28)). It contains `allowedRoots` and `blockedPatterns` ([config-examples/mount-allowlist.json:L1-L25](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/config-examples/mount-allowlist.json#L1-L25)).

**Runtime adapter.** The interface that sits between orchestration and execution. Its only implementation is `TmuxRuntimeAdapter`, with kind `tmux-host` ([src/runtime-adapter.ts:L22-L42](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/runtime-adapter.ts#L22-L42)).

**Sender allowlist.** The file `~/.config/nanoclaw/sender-allowlist.json`, which controls who can trigger the agent ([src/config.ts:L29-L34](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/config.ts#L29-L34), [src/message-dispatcher.ts:L166-L174](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/message-dispatcher.ts#L166-L174)).

**Service guard.** A PreToolUse hook that blocks agents from running `systemctl` against nanoclaw ([container/hooks/service-guard.sh:L1-L8](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/container/hooks/service-guard.sh#L1-L8)).

**Skill.** A markdown file in `.claude/skills/` that teaches Claude Code how to transform a NanoClaw installation ([CONTRIBUTING.md:L11](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/CONTRIBUTING.md#L11)).

**Trigger pattern.** The regular expression `^@<ASSISTANT_NAME>\b`, matched case-insensitively. `ASSISTANT_NAME` defaults to `Andy` ([src/config.ts:L11-L12](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/config.ts#L11-L12), [src/config.ts:L67-L70](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/config.ts#L67-L70)).

**Worker slot JID.** The internal chat identifier `internal:dev-inbox:N` assigned to a dispatch slot ([src/dispatch-slot-backends.ts:L17-L19](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/dispatch-slot-backends.ts#L17-L19)).
