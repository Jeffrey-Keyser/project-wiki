---
title: dev-inbox — Home
description: Manager/worker agent orchestration system that decomposes a natural-language task into parallel AI workers, reviews them, and merges to main.
---

# dev-inbox

`dev-inbox` is a manager/worker orchestration pipeline that takes a natural-language software task, breaks it into parallel subtasks, delegates each to an AI agent running in an isolated git worktree, reviews the results, and merges approved changes back to `main` ([README.md:10-19](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L10-L19)).

## At a glance

- **Type**: bash-first orchestration engine with a Go state-machine binary (`bin/plan-managerd`) and a small Node heartbeat publisher ([README.md:230-235](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L230-L235)).
- **Entry points**: `/orchestrate` Claude slash command and `scripts/manager-standalone.sh "<prompt>"` for CLI/webhook callers ([README.md:71-94](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L71-L94)).
- **Core roles**: Manager, Planner, Scout, Worker, Reviewer, Revision, Observer — each is an Agent CLI session, most run inside a tmux pane and a per-task git worktree ([README.md:47-57](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L47-L57)).
- **State model**: filesystem-based, event-sourced. `results/<runId>/dispatch-events.jsonl` is the source of truth; every other file is a projection ([README.md:60-67](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L60-L67), [CLAUDE.md:9-12](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L9-L12)).
- **Concurrency**: a global semaphore caps the system at 12 concurrent agent CLI processes across workers, reviewers, scouts, prospectors, and observer ([README.md:222-228](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L222-L228)).
- **Stack**: bash, tmux, jq, git, Node ≥ 18, RabbitMQ, multi-provider AI CLIs (Claude / Codex / Gemini / Kimi / Copilot) ([README.md:229-235](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L229-L235)).

## Who uses it

- A single human operator triggers a run via `/orchestrate` or `scripts/manager-standalone.sh`, optionally with `--auto-approve`, `--auto-revise`, `--observe`, `--enrich`, or `--create-pr` ([README.md:79-94](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L79-L94)).
- Agency HQ consumes run artifacts via a watcher contract that reads canonical `results/<runId>/startup.json`, `plan.json`, `failed.json`, and `summary.json` paths ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — "Watcher contract (Agency HQ)" section).
- Downstream tooling (Image Studio, prompt-registry, RabbitMQ heartbeat consumers) is wired in via the spawn scripts and `scripts/publish-artifacts.sh` ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md) — `publish-artifacts.sh` row in Key Paths table).

## How work moves through it

A run flows through a fixed lifecycle: gather context → plan → approve → optional scout enrichment → spawn workers in parallel worktrees → block on tmux signals → spawn reviewers → optional revision loop → observer report → human accept/reject → merge to `main` and clean up worktrees ([README.md:164-178](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L164-L178)). Each step appends events to `dispatch-events.jsonl`, which the Go plan-manager projects into the per-task `result.json`, `review.json`, and `verify.json` files that Agency HQ reads ([CLAUDE.md:9-12](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L9-L12)).

## Wiki pages

- [Architecture](./architecture/) — modules, roles, and the Go/bash split.
- [Iteration Loop](./iteration-loop/) — how a change moves from prompt to merged commit inside this repo.
- [Services and Dependencies](./services-and-dependencies/) — inbound and outbound integrations.
- [Operations](./operations/) — install, run, systemd units, observability.
- [Glossary](./glossary/) — repo-specific terms.
