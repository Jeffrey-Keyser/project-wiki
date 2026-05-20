---
title: dev-inbox — Operations
description: Start runs, inspect them in tmux and results/, recover leaked state, and find logs.
---

This is the runbook for `dev-inbox`. Every command here is the one
documented in the dev-inbox source — see the `file:line` citations if
behavior diverges from what you observe.

## Start a run

### From inside an Agent CLI session

Use the `/orchestrate` slash command. The full spec lives at
[`.claude/commands/orchestrate.md`](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/.claude/commands/orchestrate.md)
([CLAUDE.md:17](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L17)).
The slash command is the Manager brain; the user prompt becomes the
run's seed task.

### From a shell / webhook

```bash
scripts/manager-standalone.sh "<prompt>" [--auto-approve] [--auto-revise] [--verbose]
```

This is the standalone entrypoint used for webhook starts and
scripted invocations. It initializes `results/<runId>/`, writes the
run-level `README.md`, and atomically writes the canonical
`startup.json` (and `failed.json` on failure) for Agency HQ
([CLAUDE.md:35](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L35),
[README.md:14-19](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L14-L19)).

Useful manager flags:

- `--auto-approve` — skip the human plan-approval gate.
- `--auto-revise` — auto-spawn revision workers on reviewer feedback.
- `--observe` / `--no-observe` — toggle the Observer side-channel
  agent (default: enabled —
  [CLAUDE.md:11](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L11)).
- `--enrich` — opt into per-task Scout enrichment passes.

## Inspect a running run

### Find the tmux session

Sessions are named `dev-inbox-<run-token>` by
[`tmux_session_name_for_run`](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/lib/spawn-common.sh#L293-L296)
in `scripts/lib/spawn-common.sh`.

```bash
tmux ls                            # list all dev-inbox sessions
tmux attach -t dev-inbox-<runId>   # detach with Ctrl-b d
```

Each role window is named for its component (e.g. `worker-<taskId>`,
`reviewer-<taskId>`) — see
[`ensure_tmux_session`](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/lib/spawn-common.sh#L311-L350).

### Inspect the on-disk run

Everything lands under `results/<runId>/`
([CLAUDE.md:11](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L11)):

| Path | What it is |
|------|------------|
| `results/<runId>/startup.json` | Liveness marker — proves the run started ([CLAUDE.md:35](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L35)) |
| `results/<runId>/failed.json` | Liveness marker — written on failure ([CLAUDE.md:35](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L35)) |
| `results/<runId>/plan.json` | Canonical task plan ([CLAUDE.md:21](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L21)) |
| `results/<runId>/dispatch-events.jsonl` | Source of truth for run state ([CLAUDE.md:13](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L13)) |
| `results/<runId>/tasks/<taskId>/result.json` | Per-slice worker result ([CLAUDE.md:27](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L27)) |
| `results/<runId>/tasks/<taskId>/review.json` | Reviewer verdict ([CLAUDE.md:33](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L33)) |
| `results/<runId>/tasks/<taskId>/scout.md` | Optional Scout enrichment |
| `results/<runId>/tasks/<taskId>/revision-<attempt>.md` | Per-revision feedback |
| `results/<runId>/observer.json` | Observer meta-analysis ([CLAUDE.md:11](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L11)) |

To follow live activity, tail the event log:

```bash
tail -F results/<runId>/dispatch-events.jsonl | jq .
```

## Recover leaked state

```bash
scripts/recover-orphans.sh             # dry-run report
scripts/recover-orphans.sh --fix       # actually fix
scripts/recover-orphans.sh --max-age 4 # only consider runs younger than 4h
```

From the script header
([recover-orphans.sh:1-13](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/recover-orphans.sh#L1-L13)),
it handles three failure modes:

1. **Completed workers that never got reviewed** — spawns the missing
   Reviewer.
2. **Stale tmux sessions where all tasks are fully resolved** — kills
   the session.
3. **Leaked concurrency slots from dead processes** — removes stale
   slot files from `results/.slots/`.

A complementary backfill scanner,
[`scripts/mark-orphaned-runs-failed.sh`](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/mark-orphaned-runs-failed.sh),
walks every `startup.json` and writes a matching `failed.json` for
runs that never produced a plan
([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md)).

Operator-targeted recovery is also possible per slice:

```bash
scripts/plan-manager-tools/retry-reviewer.sh <planId> <sliceId> <runId>
```

Re-spawns only the Reviewer for an existing slice, preserving Worker
artifacts and worktree state
([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md)).

## Where logs land

| Source | Where to read |
|--------|---------------|
| `dispatch-events.jsonl` | `tail -F results/<runId>/dispatch-events.jsonl` |
| Manager stderr (standalone) | `/tmp/dev-inbox-manager-stderr-<runId-short>.txt` ([manager-standalone.sh](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/manager-standalone.sh)) |
| Planner stderr | `results/<runId>/planner.stderr` |
| Zombie cleanup timer | `journalctl --user -u dev-inbox-zombie-cleanup.service` ([systemd/README.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/systemd/README.md)) |
| Bake telemetry retention | `journalctl --user -u dev-inbox-bake-telemetry.service` ([CLAUDE.md:69](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L69)) |
| Plan watchdog | `journalctl --user -u dev-inbox-plan-watchdog.service` |
| Heartbeat publisher | optional file at `$HEARTBEAT_LOG_FILE` ([heartbeat-publisher.js:23](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js#L23)) |

## Common knobs

The most impactful environment variables for an operator:

- `DEV_INBOX_MAX_SLOTS` (default `12`) — global concurrency cap
  ([acquire-slot.sh:22](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/acquire-slot.sh#L22)).
- `DEV_INBOX_SLOT_TIMEOUT_SECONDS` — slot-acquire timeout.
- `PROGRESS_POLL_DISABLED`, `PROGRESS_POLL_INTERVAL`,
  `PROGRESS_POLL_MAX_SECONDS` — Worker progress polling
  ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md)).
- `RABBITMQ_URL` — heartbeat publisher URL
  ([heartbeat-publisher.js:46](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js#L46)).
- `PLAN_MANAGER_BACKEND=bash` — force the bash projector during the
  bake period
  ([CLAUDE.md:11](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L11)).

A fuller list is in the [Glossary](../glossary/).
