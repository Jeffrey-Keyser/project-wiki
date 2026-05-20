---
title: dev-inbox
description: Agent orchestration system that decomposes tasks and spawns parallel implementation-agent workers across the Jeffrey-Keyser ecosystem.
---

`dev-inbox` is a manager/worker orchestration pipeline that takes a
natural-language software task, breaks it into parallel slices, delegates each
to an AI agent running in an isolated git worktree, reviews the results, and
merges approved changes back to `main`
([README.md:12](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L12)).

## At a glance

- **What it is.** Orchestration coordinator that fans out one human prompt
  into many concurrent slices and reconciles their output.
  ([CLAUDE.md:1-12](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L1-L12))
- **How work is shaped.** A Planner decomposes the prompt into a canonical
  `plan.json`; Workers implement each slice in a worktree; Reviewers gate
  merges; optional Scouts and Observer add context and meta-analysis.
  ([CLAUDE.md:6-12](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L6-L12))
- **State model.** Filesystem-first. The canonical record of any run lives
  under `results/<runId>/` with `dispatch-events.jsonl` as the source of
  truth.
  ([CLAUDE.md:11-13](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md#L11-L13))
- **Entry points.** The `/orchestrate` slash command inside an Agent CLI
  session, or `scripts/manager-standalone.sh "<prompt>"` for headless /
  webhook starts.
  ([README.md:14-19](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md#L14-L19),
  [CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md))

## Canonical references

- Repo README — `dev-inbox/README.md` (project root).
  [Read on GitHub](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/README.md).
- Developer notes — `dev-inbox/CLAUDE.md` documents the key paths, event
  schema, and bake-period state. Read this before changing orchestration
  internals.
  ([CLAUDE.md](https://github.com/Jeffrey-Keyser/dev-inbox/blob/main/CLAUDE.md))

## Wiki pages

- [Architecture](./architecture/) — the high-level agent roles and signal
  flow, with a Mermaid diagram.
- [Iteration loop](./iteration-loop/) — one slice from planning through
  merge, with a sequence diagram.
- [Services and dependencies](./services-and-dependencies/) — inbound and
  outbound integrations (prompt-registry, agency-hq dispatch slots,
  RabbitMQ heartbeats, Image Studio).
- [Operations](./operations/) — how to start runs, inspect them in tmux,
  recover leaked state, and find logs.
- [Glossary](./glossary/) — role definitions, key file paths, and the
  environment variables that materially shape orchestration behavior.

## When this wiki is the right place to look

Use these pages when you need a stable, source-cited overview of how
`dev-inbox` orchestration is structured. The READMEs and `CLAUDE.md` inside
the repo remain the authoritative implementation reference — every claim
below cites a specific `file:line` in that source so the wiki can be
audited against the code at any time.
