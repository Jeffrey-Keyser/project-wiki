---
title: Operations
description: How to install, run, monitor, and recover dev-inbox in production.
---

# Operations

`dev-inbox` is not a long-running daemon. It is a CLI/webhook engine: every run is launched by `scripts/manager-standalone.sh`, lives for the duration of the orchestration, and exits when the plan is complete or terminated ([README.md:79-94](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L79-L94)). There is no HTTP listener, no port to bind, and no persistent server unit. The supporting infrastructure is a set of systemd user timers and one Node background process per active worker.

## Start / invoke

- **Interactive**: `/orchestrate <prompt>` inside Claude Code ([README.md:71-75](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L71-L75)).
- **CLI / webhook**: `scripts/manager-standalone.sh "<prompt>" [--auto-approve|--auto-revise|--observe|--enrich|--create-pr|--verbose]` ([README.md:79-94](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L79-L94)).
- **npm shortcut**: `npm run orchestrate` is a passthrough to the standalone script ([package.json:7-10](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/package.json#L7-L10)).
- **SIGHUP**: the manager traps and ignores `SIGHUP` so it survives parent-shell exit during long blocking waits on `tmux wait-for` ([scripts/manager-standalone.sh:4-7](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/manager-standalone.sh#L4-L7)).

There is no listening port — every run is a transient shell pipeline.

## Background processes

- **Heartbeat publisher** — one `scripts/heartbeat-publisher.js` Node process spawns per active worker / reviewer / revision and publishes `task.heartbeat` to RabbitMQ every 30s. On SIGTERM/SIGINT it sends a final `status="stopped"` heartbeat and exits cleanly ([scripts/heartbeat-publisher.js:3-29](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js#L3-L29)).
- **Progress poller** — `scripts/progress-poller.sh` is spawned in the background by `spawn-worker.sh`; it polls the worker's tmux pane and worktree git state every `PROGRESS_POLL_INTERVAL` seconds (default 30s, capped by `PROGRESS_POLL_MAX_SECONDS`, default 6h) and writes `results/<runId>/tasks/<taskId>/progress.json` ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `progress-poller.sh` row).

## Systemd user units

Install all timers via the idempotent installer:

```bash
scripts/install-systemd-units.sh
```

It symlinks the units below into `~/.config/systemd/user/`, runs `daemon-reload`, enables timers, and warns if `loginctl enable-linger` is off ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `install-systemd-units.sh` row).

| Unit | Cadence | Purpose |
|------|---------|---------|
| `dev-inbox-zombie-cleanup.timer` | every 15 minutes | Runs `scripts/cleanup-zombie-sessions.sh --fix` to kill orphaned tmux sessions with no matching active task in Agency HQ ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — zombie-cleanup rows). |
| `dev-inbox-failure-stats.timer` | weekly (`Persistent=true`) | Runs `scripts/memory-stats.sh --json` and snapshots `data/failure-stats-YYYY-MM-DD.json` ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — failure-stats rows). |
| `dev-inbox-bake-telemetry.timer` | daily (`Persistent=true`) | Runs `scripts/bake-telemetry-cleanup.sh` to prune `results/bake-telemetry.jsonl` entries older than 14 days ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — bake-telemetry rows). |
| `dev-inbox-plan-watchdog.timer` | shipped under `systemd/dev-inbox-plan-watchdog.timer` | Watchdog for long-running plan-manager runs (unit ships in the repo; see `systemd/README.md` for current cadence). |

Unit docs (install, status, retrigger, logs, failure modes) live in [`systemd/README.md`](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/systemd/README.md).

## Logs and observability

- **Structured run logs** — `scripts/lib/logging.sh::log_msg` emits `[RUN_ID][TASK_ID][COMPONENT]` prefixed lines to stderr from every script ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `logging.sh` row).
- **Manager stderr** — captured per-run to `/tmp/dev-inbox-manager-stderr-<runShort>.txt` so the EXIT trap can include the tail in `failed.json#capturedStderr` ([scripts/manager-standalone.sh:65-69](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/manager-standalone.sh#L65-L69)).
- **Event log** — `results/<runId>/dispatch-events.jsonl` is the canonical lifecycle telemetry stream (phase transitions, role spawn/complete, failure classification). External watchers consume it directly ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Lifecycle telemetry" bullet in "Concurrency & Reliability" section).
- **Heartbeats** — RabbitMQ exchange `task.heartbeat` carries `status` ∈ `{working, blocked, waiting, stopped}` every 30s per active worker/reviewer/revision ([scripts/heartbeat-publisher.js:18-26](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js#L18-L26)).
- **Progress snapshots** — `results/<runId>/tasks/<taskId>/progress.json` exposes the in-flight tmux tail, commit count, dirty file count, and elapsed seconds; final status is one of `result-landed | tmux-gone | budget-exhausted` ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — progress.json row in the result-file contract).

## Health probes

There is no HTTP health endpoint. Health is observable through:

- `scripts/check-providers.sh` — interactive status table for every configured AI provider ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `check-providers.sh` row).
- `scripts/cleanup-zombie-sessions.sh --health` — surface orphan/zombie counts ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `cleanup-zombie-sessions.sh` row).
- `scripts/recover-orphans.sh --fix [--max-age HOURS]` — repairs completed-but-unreviewed tasks and reclaims leaked concurrency slots; also runs self-heal from worker exit ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Concurrency & Reliability" section).

## On-call notes

- **Manager crashed before plan landed** — look for `results/<runId>/failed.json` with `stage: pre-plan`; the `capturedStderr` field carries the last ~2KB of stderr ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "failed.json schema" block).
- **Planner failed** — `results/<runId>/plan.json` will contain `status: "failed"` with a `reason`. The EXIT trap intentionally does **not** also write `failed.json` because the planner failure is already represented ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — Watcher contract bullets).
- **Slot leak** — run `scripts/recover-orphans.sh --fix`; stale slots (>30 min) are auto-cleaned but the helper handles edge cases ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Concurrency & Reliability" section).
- **Plan-manager Go rollback** — `bash scripts/plan-manager-go-rollback.sh` writes `PLAN_MANAGER_BACKEND=bash` into the repo-root `.env`. Undo by deleting the line or setting it back to `go` ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Plan-Manager Go Backend" section).

## Tests

`npm test` (or `bash scripts/run-tests.sh`) runs the full auto-discovered suite of `test-*.sh` files; `bash scripts/run-tests-loop.sh` reruns the suite repeatedly for flake hunting and stops on the first failing iteration ([README.md:194-206](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L194-L206), [CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Testing" section). Convention is to run `npm test` before pushing to `main`; no pre-push hook enforces this ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Pre-push convention" section).
