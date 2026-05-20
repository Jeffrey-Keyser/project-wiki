---
title: dev-inbox — Services and Dependencies
description: Inbound and outbound services dev-inbox talks to, with source citations.
---

This page catalogues the runtime services `dev-inbox` interacts with.
Each claim is backed by a concrete `file:line` reference in the
`dev-inbox` source.

## Outbound dependencies

### Prompt registry (`prompt-api.jeffreykeyser.net`)

The Manager fetches **ecosystem** and **host** context, plus an
optional persona catalog, from the centralized
[prompt-registry](../../prompt-registry/) before planning. The exact
calls live in the orchestrate slash command:

```bash
curl -s https://prompt-api.jeffreykeyser.net/api/v1/prompts/Jeffrey-Keyser%2Fecosystem | jq -r '.data.value' > /tmp/eco.txt
curl -s https://prompt-api.jeffreykeyser.net/api/v1/prompts/Jeffrey-Keyser%2Fhost      | jq -r '.data.value' > /tmp/host.txt
```

([orchestrate.md:52-57](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/.claude/commands/orchestrate.md#L52-L57)).
The persona catalog endpoint is used to dynamically discover relevant
personas for Planner / Worker / Reviewer prompts:

```bash
curl -s https://prompt-api.jeffreykeyser.net/api/v1/prompts/catalog | jq '.data | map({namespace, count})'
```

([orchestrate.md:70](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/.claude/commands/orchestrate.md#L70)).
The Prompter library
[`scripts/lib/prompter.sh`](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/lib/prompter.sh)
encapsulates the persona fetch for Worker / Reviewer / Revision prompts
([CLAUDE.md:23](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L23)).

### Agency HQ — dispatch slots and config (best-effort)

Each spawn script claims a dispatch slot from `agency-hq` so that the
broader agency dashboard knows what is running. The call is
**best-effort**: failures degrade gracefully and the slice still runs.

- Planner: "Claim agency-hq planner dispatch slot (best-effort)"
  ([spawn-planner.sh](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/spawn-planner.sh)).
- Worker: "Claim agency-hq worker dispatch slot (best-effort)" at
  [spawn-worker.sh:220](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/spawn-worker.sh#L220);
  dispatch-config fetch at
  [spawn-worker.sh:240](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/spawn-worker.sh#L240).
- Reviewer:
  [spawn-reviewer.sh](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/spawn-reviewer.sh).
- Scout:
  [spawn-scout.sh](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/spawn-scout.sh).
- Revision:
  [spawn-revision.sh](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/spawn-revision.sh).

The Manager-side webhook dispatch flow is also documented in
[`CLAUDE.md`](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md)
under the bake-period notes (`scripts/manager-standalone.sh` writes
the canonical `startup.json` / `failed.json` markers Agency HQ
consumes —
[CLAUDE.md:35](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L35)).

### RabbitMQ — heartbeat publishing

Long-running Workers, Reviewers, and Revision workers run alongside a
heartbeat daemon that publishes `task.heartbeat` events to RabbitMQ
every `HEARTBEAT_INTERVAL_MS` (default 30 000 ms):

- Header contract — [`scripts/heartbeat-publisher.js`](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js).
- Default URL — `amqp://localhost:5672`, overridable via `RABBITMQ_URL`
  ([heartbeat-publisher.js:23](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js#L23),
  [heartbeat-publisher.js:46](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js#L46)).
- Exchange — `task.heartbeat`, topic, declared in the publisher
  ([heartbeat-publisher.js](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js)).
- `amqplib` is loaded dynamically from sibling `node_modules` of
  agency-hq / business-hq / pantry / cron-hq so the dev-inbox repo
  does not own the dependency itself
  ([heartbeat-publisher.js:57-64](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js#L57-L64)).

> **Scope note.** The dev-inbox source documents RabbitMQ for the
> heartbeat publisher path; the rest of orchestration state remains
> filesystem-first (`dispatch-events.jsonl`,
> [ADR — Filesystem-Based State](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/docs/adrs/filesystem-state.md)).
> Do not assume RabbitMQ as the source of truth for run state.

### Image Studio — artifact publishing

Worker / Prospector tasks that emit images publish them to Image
Studio via
[`scripts/publish-artifacts.sh`](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/publish-artifacts.sh).
The script POSTs `artifacts[]` entries from the result file to
`https://images-api.../api/v1/import`. Auth is via
`IMAGE_STUDIO_SERVICE_TOKEN` (preferred) or the legacy
`IMAGE_STUDIO_JWT`
([CLAUDE.md:72](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L72)).

## Inbound dependencies

### `/orchestrate` slash command

The primary inbound entry point inside an Agent CLI session — defined
in
[`.claude/commands/orchestrate.md`](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/.claude/commands/orchestrate.md).
Acts as the Manager brain
([CLAUDE.md:17](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L17)).

### `scripts/manager-standalone.sh` — webhook / CLI entry

Standalone entry for webhook or scripted starts. Takes the prompt as
the first positional argument and runs the full orchestration flow
end-to-end, including writing the canonical `results/<runId>/startup.json`
and `results/<runId>/failed.json` markers that Agency HQ polls
([CLAUDE.md:35](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L35)).

### Background systemd timers

Three background units run on the Beelink homelab (see
[Operations](../operations/) for the journalctl commands):

- `dev-inbox-zombie-cleanup.timer` — 15-minute cadence cleanup
  ([systemd/README.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/systemd/README.md)).
- `dev-inbox-bake-telemetry.timer` — daily telemetry retention
  ([CLAUDE.md:69](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L69)).
- `dev-inbox-plan-watchdog.service` — plan-stage timeout watchdog.

## Concurrency and state primitives

- **Slot semaphore** —
  [`scripts/acquire-slot.sh:22`](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/acquire-slot.sh#L22)
  enforces a default cap of 12 concurrent agents
  (`DEV_INBOX_MAX_SLOTS`) using lockfiles in `results/.slots/`.
- **Dispatch events** —
  [`scripts/lib/dispatch-events.sh`](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/lib/dispatch-events.sh)
  appends to `results/<runId>/dispatch-events.jsonl` with `flock`
  serialization and `python3 os.fsync` on flush
  ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md)).
