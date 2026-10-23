---
title: "Operations"
description: "Start, install, health, and observability commands for dev-inbox, with documented versus verified runtime clearly separated."
---

# Operations

dev-inbox is not a library. It is a set of CLI entry points plus optional systemd user services. Every command below comes from repository docs or source. **None of it was verified against a running host for this wiki.**

## Start

- **Check the host first** with `scripts/install-check.sh` ([README.md:L56-L58](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L56-L58)).
- **Configure** by copying `.env.example` to `.env` and running `chmod 600` on it ([README.md:L68-L72](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L68-L72)).
- **Standalone run:** `scripts/manager-standalone.sh "<task>"`.
  - Flags: `--auto-approve`, `--enrich`, `--create-pr`, `--branch-only`, `--no-auto-revise`, and `--observe`/`--no-observe` ([scripts/manager-standalone.sh:L290-L302](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/scripts/manager-standalone.sh#L290-L302)).
  - `--retry-failed <runId>` re-runs only the tasks that did not land ([CLAUDE.md:L53](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/CLAUDE.md#L53)).
- **Plans:** `scripts/plan-manager.sh start|status|pause|abort|resume` ([README.md:L181-L185](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L181-L185)).
  - Never edit `state.json`, `slices.json`, or `events.jsonl` by hand ([docs/plan-manager-operations.md:L16-L18](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/plan-manager-operations.md#L16-L18)).
- **Queue:** build it with `make build-dev-inbox-queued`, then use `health`, `report`, `attention list`, or `job inspect` ([README.md:L207-L213](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L207-L213)).
  - The daemon tick defaults to 60s and can be overridden with `DEV_INBOX_QUEUE_TICK_INTERVAL_SECONDS` ([cmd/dev-inbox-queued/main.go:L262-L270](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/cmd/dev-inbox-queued/main.go#L262-L270)).

## Deploy and update

- **Release-tarball installs:**
  - `scripts/install-check.sh update <tag>` stages and probes a release before atomically switching `.portable/active`.
  - `scripts/install-check.sh rollback` restores the previous release ([docs/PORTABLE-INSTALL.md:L113-L116](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/PORTABLE-INSTALL.md#L113-L116), [docs/PORTABLE-INSTALL.md:L184-L187](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/PORTABLE-INSTALL.md#L184-L187)).
  - `results/`, `plans/`, `data/`, `queue/`, and `.env` survive updates ([docs/PORTABLE-INSTALL.md:L131-L137](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/PORTABLE-INSTALL.md#L131-L137)).
- **Owner-invoked promotion:** `runtime-release build|promote|rollback` ([cmd/runtime-release/main.go:L28-L30](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/cmd/runtime-release/main.go#L28-L30)).
  - Its default health gate is `http://127.0.0.1:3099/health`. That is a flag default, not a confirmed live port ([cmd/runtime-release/main.go:L47](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/cmd/runtime-release/main.go#L47)).
- **systemd units:** install with `bash scripts/install-systemd-units.sh`.
  - The installer enables every timer and starts the supervise daemon ([systemd/README.md:L54-L61](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L54-L61)).
  - Installing and enabling units is an operator action; workers never do it ([systemd/README.md:L24-L28](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L24-L28)).

## Units of note

All of these are documented, not verified as running.

- **`dev-inbox-plan-supervise.service`:** always on. It handles recovery and auto-heal and emits a `plan.supervise.tick` every 60s by default ([systemd/README.md:L9](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L9)).
  - The standalone watchdog timer has been retired and folded into supervise ([systemd/README.md:L42-L48](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L42-L48)).
- **Heartbeat monitor:** checks the supervise heartbeat every 2 minutes ([systemd/README.md:L10](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L10)).
- **Cleanup timers:**
  - zombie session cleanup runs hourly with a 24h age floor ([systemd/README.md:L13](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L13));
  - maintenance cleanup runs daily ([systemd/README.md:L11-L12](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L11-L12));
  - dispatch-events TTL cleanup runs daily with a 30-day default ([systemd/README.md:L14-L15](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L14-L15)).
- **Publishers and triage:**
  - runstream publisher ([systemd/README.md:L19](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L19));
  - issue publisher ([systemd/README.md:L20](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L20));
  - issue triage, which defaults to `off` ([systemd/README.md:L21](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L21)).
- **Disabled by default:** the Tier 4 durability sweep and the triage analyzer timers ([systemd/README.md:L33-L38](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L33-L38)).

## Health checks

- **Supervisor:**
  - `systemctl --user status dev-inbox-plan-supervise` and follow its `journalctl` log;
  - `bin/plan-managerd supervise --once` runs a single pass without systemd ([systemd/README.md:L100-L111](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L100-L111)).
- **Latest tick diagnostic:** a `jq` filter over `results/supervise-events.jsonl` ([systemd/README.md:L150-L153](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L150-L153)).
- **Timers and runstream:** `systemctl --user list-timers '*dev-inbox*'` and `runstream-publisher.js health|backlog` ([systemd/README.md:L158-L173](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L158-L173)).
- **Issue publisher:** `issue-publisher status` reports outbox counts ([cmd/issue-publisher/main.go:L257-L276](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/cmd/issue-publisher/main.go#L257-L276)).

## Observability

- **Per-run timeline:** `results/<runId>/dispatch-events.jsonl`.
  - Routing events can be filtered with `jq` on `inference_*` ([docs/inference-layer.md:L21-L26](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/inference-layer.md#L21-L26)).
- **Plans:** `plans/<planId>/events.jsonl` and each slice's `dispatch.log` ([docs/plan-manager-quickstart.md:L67-L72](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/plan-manager-quickstart.md#L67-L72)).
- **Manager stderr:** mirrored to `/tmp/dev-inbox-manager-stderr-<short>.txt` ([scripts/manager-standalone.sh:L152-L155](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/scripts/manager-standalone.sh#L152-L155)).
- **Missing worktrees:** results carry cleanup provenance that explains them ([docs/cleanup-provenance.md:L3-L8](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/cleanup-provenance.md#L3-L8)).
- **Not established by this snapshot:** listening ports, metrics endpoints, and which units actually run on any host.
