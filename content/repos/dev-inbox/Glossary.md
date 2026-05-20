---
title: dev-inbox — Glossary
description: Role definitions, key file paths, and environment variables that materially shape orchestration.
---

A compact reference for the terms you will hit when reading `dev-inbox`
source or operating a run. Citations are kept to the line that defines
or describes the term.

## Roles

**Manager.** The orchestration coordinator. Judgment-only: spawns
Planner / Scouts / Workers / Reviewers, blocks on signals, surfaces
decisions to the human. Does not author prompts or read source itself.
Prompt template: `prompts/manager-system.md`
([CLAUDE.md:20](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L20)).
Slash-command brain: `.claude/commands/orchestrate.md`
([CLAUDE.md:17](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L17)).

**Planner.** Decomposes the user prompt into slices; injects personas,
skills, followups, and ADRs; chooses each slice's `enrich` and
`maxRevisions` settings. Writes `results/<runId>/plan.json`. Default
model: opus. Prompt: `prompts/planner-system.md`
([CLAUDE.md:21](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L21)).

**Scout.** Read-only recon agent. Runs in the repo (no worktree) and
emits `tasks/<taskId>/scout.md` when the Planner flagged enrichment.
Prompt: `prompts/scout-system.md`
([CLAUDE.md:10](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L10),
[CLAUDE.md:24](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L24)).

**Worker.** Agent CLI session in a tmux pane, scoped to a dedicated
git worktree. Implements one slice and writes `result.json`. Prompt:
`prompts/worker-system.md`
([CLAUDE.md:8](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L8),
[CLAUDE.md:25-26](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L25-L26)).

**Reviewer.** Agent CLI session that re-enters the Worker's worktree
and writes a structured verdict at `tasks/<taskId>/review.json`.
Prompt: `prompts/reviewer-system.md`
([CLAUDE.md:9](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L9),
[CLAUDE.md:29](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L29)).

**Revision worker.** A Worker re-launch in the same worktree using the
revision prompt template; fixes Reviewer feedback rather than
re-implementing the slice. Prompt:
`prompts/worker-revision-system.md`
([CLAUDE.md:30-31](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L30-L31)).

**Observer.** Optional meta-analysis agent watching the full run
end-to-end. Writes `results/<runId>/observer.json`. Toggled via
`--observe` / `--no-observe` on the Manager. Prompt:
`prompts/observer-system.md`
([CLAUDE.md:11](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L11)).

## Key file paths

| Path | Purpose |
|------|---------|
| `.claude/commands/orchestrate.md` | `/orchestrate` slash command — Manager brain ([CLAUDE.md:17](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L17)) |
| `scripts/manager-standalone.sh` | Standalone entrypoint (webhook / CLI) ([CLAUDE.md:35](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L35)) |
| `scripts/spawn-planner.sh` | Planner launcher; signals `tmux wait-for "planner-<runId>"` ([CLAUDE.md:22](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L22)) |
| `scripts/spawn-worker.sh` | Creates worktree + tmux pane + Worker run ([CLAUDE.md:26](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L26)) |
| `scripts/spawn-reviewer.sh` | Reviewer launcher ([CLAUDE.md:32](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L32)) |
| `scripts/spawn-revision.sh` | Revision-worker launcher ([CLAUDE.md:31](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L31)) |
| `scripts/spawn-scout.sh` | Scout launcher (read-only) ([CLAUDE.md:40](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L40)) |
| `scripts/spawn-observer.sh` | Observer launcher |
| `scripts/write-result.sh` | Writes per-slice `result.json` ([CLAUDE.md:27](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L27)) |
| `scripts/write-review.sh` | Writes per-slice `review.json` ([CLAUDE.md:33](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L33)) |
| `scripts/acquire-slot.sh` / `scripts/release-slot.sh` | Concurrency slot semaphore (`results/.slots/`) — max 12 by default ([acquire-slot.sh:22](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/acquire-slot.sh#L22)) |
| `scripts/recover-orphans.sh` | Orphan / leaked-state recovery ([recover-orphans.sh:1-13](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/recover-orphans.sh#L1-L13)) |
| `scripts/mark-orphaned-runs-failed.sh` | Backfill `failed.json` for plan-less runs |
| `scripts/lib/dispatch-events.sh` | `DispatchEventLogger` — writes `dispatch-events.jsonl` ([CLAUDE.md:48](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L48)) |
| `scripts/lib/event-types.sh` | Frozen event-type registry ([CLAUDE.md:48](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L48)) |
| `scripts/lib/spawn-common.sh` | Shared spawn helpers — slot acquire / release, tmux setup, runner dispatch, dirty-tree salvage |
| `scripts/lib/prompter.sh` | Tool-agnostic prompt smith ([CLAUDE.md:23](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L23)) |
| `scripts/heartbeat-publisher.js` | `task.heartbeat` RabbitMQ publisher ([CLAUDE.md:57](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L57)) |
| `scripts/publish-artifacts.sh` | Image Studio artifact uploader |
| `results/` | Canonical run artifacts root (gitignored — [CLAUDE.md:83](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L83)) |
| `results/<runId>/dispatch-events.jsonl` | Source of truth for run state ([CLAUDE.md:13](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L13)) |
| `results/.slots/` | Concurrency slot lockfile directory |
| `prompts/` | Role prompt templates ([CLAUDE.md:20-32](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L20-L32)) |
| `bin/plan-managerd` | Go projector binary used during bake period ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md)) |
| `systemd/` | Timers + units for background sweeps ([systemd/README.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/systemd/README.md)) |

## Environment variables that materially shape orchestration

| Variable | Default | Effect |
|----------|---------|--------|
| `DEV_INBOX_MAX_SLOTS` | `12` | Global concurrency cap on agent CLI processes ([acquire-slot.sh:22](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/acquire-slot.sh#L22)) |
| `DEV_INBOX_SLOT_TIMEOUT_SECONDS` | `300` | Slot-acquire timeout ([acquire-slot.sh](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/acquire-slot.sh)) |
| `DEV_INBOX_PLANNER_PROVIDER` / `_MODEL` / `_CLI` | per script | Override Planner provider / model / CLI ([spawn-planner.sh](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/spawn-planner.sh)) |
| `DEV_INBOX_PLANNER_TIMEOUT_SECONDS` | `600` | Planner-stage timeout |
| `DEV_INBOX_WORKER_NO_AUTO_COMMIT` | `0` | If `1`, disable auto-salvage of a dirty worktree ([spawn-common.sh](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/lib/spawn-common.sh)) |
| `PROGRESS_POLL_DISABLED` | `0` | Disable progress polling of Workers ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md)) |
| `PROGRESS_POLL_INTERVAL` | `30s` | Worker poll cadence |
| `PROGRESS_POLL_MAX_SECONDS` | `6h` | Max time to wait for a Worker |
| `PLAN_MANAGER_BACKEND` | auto-detect | `bash` forces the legacy projector during the bake ([CLAUDE.md:11](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L11)) |
| `DEV_INBOX_DISPATCH_VALIDATE` | `0` | If `1`, reject events outside the frozen registry ([CLAUDE.md:48](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L48)) |
| `RABBITMQ_URL` | `amqp://localhost:5672` | Heartbeat publisher target ([heartbeat-publisher.js:46](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js#L46)) |
| `HEARTBEAT_INTERVAL_MS` | `30000` | Heartbeat publish interval ([heartbeat-publisher.js](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js)) |
| `HEARTBEAT_EXCHANGE` | `task.heartbeat` | RabbitMQ exchange ([heartbeat-publisher.js](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js)) |
| `HEARTBEAT_DRY_RUN` | `0` | Skip RabbitMQ, only log |
| `IMAGE_STUDIO_SERVICE_TOKEN` / `IMAGE_STUDIO_JWT` | unset | Auth for `publish-artifacts.sh` ([CLAUDE.md:72](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L72)) |
| `IMAGE_STUDIO_DRY_RUN` | `false` | Skip Image Studio uploads ([CLAUDE.md:72](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L72)) |

## Event-type vocabulary

The frozen registry in
[`scripts/lib/event-types.sh`](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/lib/event-types.sh)
defines the events the projector replays
([CLAUDE.md:48](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L48)):
`run_start`, `plan_complete`, `scout_complete`, `worker_spawn`,
`worker_complete`, `verify_complete`, `reviewer_spawn`,
`reviewer_complete`, `revision_spawn`, `revision_complete`,
`fd_advance`, `run_complete`, `run_failed`, `run_aborted`, plus
`failure_classified` (15 total). Other dispatch events (`slot_*`,
`task_*`, `phase_transition`, `observer_*`) flow through unchanged
when validation is off (the default).
