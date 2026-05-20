---
title: Glossary
description: Repo-specific terms used throughout dev-inbox orchestration code, prompts, and docs.
---

# Glossary

- **Manager** — The orchestration coordinator that runs end-to-end for a single prompt. Implemented as `scripts/manager-standalone.sh`; it spawns planner, scouts, workers, reviewers, revisions, and the observer, and blocks on `tmux wait-for` signals. The manager is judgment-only — no inline planning, no source reads ([README.md:50-52](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L50-L52)).

- **Planner** — Single-shot agent that decomposes the user prompt into `results/<runId>/plan.json` with tasks, dependencies, personas, and acceptance criteria. Run by `scripts/spawn-planner.sh`; default provider is Claude `opus` ([README.md:52-53](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L52-L53), [CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `prompts/planner-system.md` row).

- **Scout** — Read-only per-task recon agent that produces `results/<runId>/tasks/<taskId>/scout.md`, a hybrid YAML-frontmatter + markdown brief. Briefs are cached per `<repoSlug>@<sha>:<taskFingerprint>` with a 30-day TTL ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Task Enrichment (Scout)" section).

- **Worker** — Implementation agent running inside a tmux pane and a per-task git worktree. Implements code changes, adds tests, verifies, and commits. Launched by `scripts/spawn-worker.sh` ([README.md:54-55](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L54-L55)).

- **Reviewer** — Agent that reviews a completed worker's branch and emits one of `approve`, `request-changes`, or `reject` into `results/<runId>/tasks/<taskId>/review.json`. Launched by `scripts/spawn-reviewer.sh`; small/empty outputs trigger a single 5-second-delayed retry ([README.md:55-56](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L55-L56), [CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Concurrency & Reliability" section).

- **Revision** — Re-run of a worker agent in the same worktree to address reviewer feedback. Bounded by `maxRevisions` per task (default 1). `reject` verdicts are never auto-revised. Launched by `scripts/spawn-revision.sh` ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `spawn-revision.sh` row).

- **Observer** — Optional meta-analysis agent that monitors the full orchestration lifecycle (planning through reviews) and reports process-level findings to `results/<runId>/observer.json` ([CLAUDE.md:6-7](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L6-L7)).

- **Prospector** — Read-only repo-analysis agent that emits feature ideas without modifying code. Selections persist to `results/prospector-choices.jsonl` ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — prospector rows).

- **Plan-manager runtime / `plan-managerd`** — The Go binary at `bin/plan-managerd` that implements the run state machine, projects events into canonical files (`plan-managerd project <runId>`), and resolves provider selection (`plan-managerd providers select --role <role>`). It is built by `bin/build-plan-managerd.sh` and not committed ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `bin/plan-managerd` row).

- **Dispatch event log** — `results/<runId>/dispatch-events.jsonl`, the append-only canonical record of run state. `scripts/lib/dispatch-events.sh` writes entries under `flock` with `os.fsync` on flush; `scripts/lib/event-types.sh` freezes the 15-event registry the projector replays ([CLAUDE.md:9-12](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L9-L12), [CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `dispatch-events.sh` and `event-types.sh` rows).

- **Projection** — A canonical file derived from replaying the dispatch event log: `startup.json`, `plan.json`, `summary.json`, per-task `result.json` / `review.json` / `verify.json`, and the FD `meta.json` mirror. Replay is idempotent ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Result file contract" section).

- **Run directory** — The canonical filesystem home for a single orchestration: `results/<runId>/...`. All top-level run-level and task-scoped JSON mirrors are retired; consumers must read from the canonical paths ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "State" bullet in Architecture).

- **Slot** — A filesystem semaphore entry under `results/.slots/`. Caps the system at 12 concurrent agent CLI processes; entries older than 30 minutes are reaped as stale. Managed by `scripts/acquire-slot.sh` / `scripts/release-slot.sh` ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Concurrency & Reliability" section).

- **Heartbeat** — A `task.heartbeat` JSON event published every 30s to RabbitMQ by `scripts/heartbeat-publisher.js`. Status enum is `{working, blocked, waiting, stopped}`; a final `stopped` heartbeat is sent on SIGTERM/SIGINT ([scripts/heartbeat-publisher.js:3-9](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/scripts/heartbeat-publisher.js#L3-L9)).

- **Task mode** — Per-task field controlling worker/reviewer prompt shape. `implementation` (default) expects code + tests + commits. `design` expects a markdown deliverable committed to the branch, with Confirmed vs Inferred separation ([README.md:179-184](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L179-L184)).

- **Enrichment** — A per-task `enrich: true` flag that tells the manager to spawn a scout before the worker. The scout brief body is prepended to the worker's `context` field inside `<scout>` tags ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Task Enrichment (Scout)" section).

- **Verify gate** — Deterministic post-worker / pre-reviewer step run by `scripts/verify-task.sh`; runs each `verifyCommands` entry and records exit codes, durations, and stdout/stderr tails in `results/<runId>/tasks/<taskId>/verify.json` ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `verify.json` row in the result-file contract).

- **Failure taxonomy** — Frozen failure-mode slug catalog in `docs/failure-taxonomy.md`. The runtime classifier `scripts/classify-failure.sh` joins terminal runs against `data/known-failures.jsonl` and writes `results/<runId>/failure-classification.json`, plus a `failure_classified` dispatch event ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Failure Classification" section).

- **Terminal status** — Frozen enum used in `results/<runId>/summary.json#status`: `complete | failed | merge-failed | worker-failed | review-rejected | reviewer-aborted | planner-failed | trap-aborted`. Derived by `scripts/lib/sub-orch-status.sh::derive_terminal_status`; new values must be added there first ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — Terminal status table).

- **Bake period** — The 14-day dual-write window started May 10 2026 during the event-sourcing migration. Manager + spawn scripts continue to write the projected files directly while events flow in parallel; once the bake closes, `scripts/recover-orphans.sh` and `scripts/mark-orphaned-runs-failed.sh` are deleted because replay over the event log replaces both ([CLAUDE.md:9-12](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L9-L12)).
