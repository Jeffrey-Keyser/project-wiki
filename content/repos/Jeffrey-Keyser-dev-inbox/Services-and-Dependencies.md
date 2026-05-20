---
title: Services and Dependencies
description: Inbound triggers, outbound integrations, and the runtime tools dev-inbox needs at every step.
---

# Services and Dependencies

## Depends on

### Runtime tools

- **bash, tmux, jq, git, uuidgen** — required on the host; tmux is the IPC layer for `wait-for` signals and pane attachment, jq parses every JSON state file ([README.md:229-235](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L229-L235)).
- **Node ≥ 18.0.0** — needed by the heartbeat publisher and the dispatch API surface ([package.json:11-13](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/package.json#L11-L13)).
- **Go toolchain** (for builders only) — `bin/build-plan-managerd.sh` runs `go build -o bin/plan-managerd ./cmd/plan-managerd` from the repo root; the binary is not committed ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `bin/build-plan-managerd.sh` row).

### AI provider CLIs

`dev-inbox` ships a single provider selector for every role (manager, planner, worker, reviewer, revision, scout, prospector, observer). Any one of Claude, Copilot, Gemini, Codex, or Kimi CLIs may serve as the agent runtime, selected by `DEV_INBOX_AGENT_PROVIDER` with per-role overrides via `DEV_INBOX_<ROLE>_PROVIDER` ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Provider Selection" section).

Provider selection is resolved by the Go runtime (`bin/plan-managerd providers select --role <role>`), with `scripts/lib/inference-router.sh` exporting the selected `DEV_INBOX_AGENT_*` env vars so tmux runner heredocs inherit them ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Per-role overrides" section).

### Provider health and fallback

- `scripts/lib/provider-health.sh` performs two-tier checks (rich OAuth/JSONL quota → probe fallback) and returns a recommended fallback order; the default chain is `claude,codex,copilot,gemini,kimi` ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `provider-health.sh` row and `DEV_INBOX_PROVIDER_FALLBACK_ORDER` config row).
- `scripts/check-providers.sh` is the standalone CLI for inspecting provider status ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `check-providers.sh` row).

### External services

- **RabbitMQ** — required for heartbeat publishing. Workers spawn `scripts/heartbeat-publisher.js` as a background process that publishes `task.heartbeat` events every 30s to the `task.heartbeat` topic exchange ([scripts/heartbeat-publisher.js:1-26](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js#L1-L26), [README.md:225-228](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L225-L228)). RabbitMQ unavailability is tolerated — the publisher logs an error and keeps beating ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `heartbeat-publisher.js` row).
- **prompt-registry API** (`prompt-api.jeffreykeyser.net`) — supplies ecosystem context, personas, and ADRs. The planner pre-fetches persona content at plan time and embeds it into each task (`workerPersonaContent`, `reviewerPersonaContent`); spawn scripts fall back to fetching at spawn time in compact mode ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Persona Pre-Fetch (Planner, slice 5)" section, [README.md:233-235](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L233-L235)).
- **GitHub** — the merge step pushes to `main` and `scripts/branch-cleanup.sh` triages remote `dev-inbox/*` branches ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `branch-cleanup.sh` row).
- **Image Studio** — `scripts/publish-artifacts.sh` posts `artifacts[]` from worker/prospector results to the Image Studio split-host import flow (`POST https://images-api.../api/v1/import`) and stores deep links into the canonical run dir; requires `IMAGE_STUDIO_SERVICE_TOKEN` (or legacy `IMAGE_STUDIO_JWT`) ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `publish-artifacts.sh` row).

## Consumed by

- **Agency HQ** — the primary external watcher. Reads canonical `results/<runId>/{startup,plan,failed,summary}.json` to track run lifecycle, with a frozen result-file contract and trap semantics so it can always distinguish "manager never started" from "manager crashed before plan landed" ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Watcher contract (Agency HQ)" section).
- **`/orchestrate` slash command** — `.claude/commands/orchestrate.md` is the interactive entry point that shells into `scripts/manager-standalone.sh` ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `.claude/commands/orchestrate.md` row).
- **`/prospector` slash command** — `.claude/commands/prospector.md` runs read-only repo analysis via `scripts/spawn-prospector.sh`, producing idea proposals persisted to `results/prospector-choices.jsonl` ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — prospector rows).
- **Weekly leaderboard / failure stats** — `scripts/memory-stats.sh` walks `results/*/dispatch-events.jsonl` for `failure_classified` events and snapshots to `data/failure-stats-YYYY-MM-DD.json` under the `dev-inbox-failure-stats.timer` systemd unit ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `memory-stats.sh` row).
- **Heartbeat consumers** — anything subscribed to RabbitMQ topic `task.heartbeat` receives the worker/reviewer/revision liveness stream described above ([scripts/heartbeat-publisher.js:3-9](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js#L3-L9)).
