---
title: "Glossary"
description: "Project-specific dev-inbox terms with source citations."
---

# Glossary

Shared vocabulary is maintained in `docs/DOMAIN-GLOSSARY.md`. This page summarizes the key terms. For how they fit together, see [Architecture](../architecture/).

## Runs, plans, and roles

- **Run.** One standalone orchestration. Its state lives in `results/<runId>/` ([README.md:L151-L152](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L151-L152)).
- **Dispatch event log.** `dispatch-events.jsonl`, the canonical record of run state transitions. Its events wake barriers, and the matching artifacts confirm completion ([CLAUDE.md:L14](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/CLAUDE.md#L14)).
- **Writer of record.** The role or manager writer that owns an artifact body such as `result.json` or `review.json`. Projection never replaces it ([CLAUDE.md:L14](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/CLAUDE.md#L14)).
- **Plan / Slice.**
  - A plan is a multi-slice state-machine aggregate stored in `plans/<planId>/` ([docs/DOMAIN-GLOSSARY.md:L103](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/DOMAIN-GLOSSARY.md#L103)).
  - A slice is one typed plan entry; it is either task-backed or a sub-orchestration ([docs/DOMAIN-GLOSSARY.md:L104](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/DOMAIN-GLOSSARY.md#L104)).
- **Slice acceptance vs task acceptance criteria.** Two distinct contracts. The plan compiler translates slice acceptance into task acceptance criteria ([docs/DOMAIN-GLOSSARY.md:L27-L33](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/DOMAIN-GLOSSARY.md#L27-L33)).
- **plan-managerd.** The sole Go plan-manager runtime, built with `bin/build-plan-managerd.sh` ([CLAUDE.md:L26](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/CLAUDE.md#L26)).
- **Supervise tick.** The `plan.supervise.tick` heartbeat. Its payload carries a `supervise-health/v1` outcome ([systemd/README.md:L142-L145](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L142-L145)).
- **Task mode.** One of three modes ([CLAUDE.md:L61-L65](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/CLAUDE.md#L61-L65)):
  - `implementation`, the default;
  - `design`, which produces a sourced markdown deliverable;
  - `release`, an explicitly authorized release action.
- **Scout vs prospector.**
  - A scout does per-task, read-only enrichment that is injected into the worker's context.
  - A prospector generates ideas, persisted to `results/prospector-choices.jsonl` ([CLAUDE.md:L78-L79](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/CLAUDE.md#L78-L79)).
- **Observer mode.**
  - `live`, the default, monitors the run as it happens.
  - `terminal` runs once against a deterministic `run-observe brief` ([README.md:L109-L113](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L109-L113)).

## Review and verification

- **Slot.** One entry in the filesystem semaphore under `results/.slots/`, which caps concurrent agent CLIs at 12 ([CLAUDE.md:L99](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/CLAUDE.md#L99)).
- **Review tier.** `trivial`, `small`, or `full`. A `trivial` diff skips the LLM and receives a synthetic approve ([CLAUDE.md:L101](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/CLAUDE.md#L101)).
- **Revision loop.** A revision worker that answers `request-changes`, bounded by `maxRevisions` (default 3) ([CLAUDE.md:L102](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/CLAUDE.md#L102)).
- **Scope downgrade.** A pure over-reach `request-changes` is routed as `approve-with-followup`. This happens when every blocking issue cites a declared slice boundary ([CLAUDE.md:L104](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/CLAUDE.md#L104)).
- **Submit-check.** A read-only in-loop validator that returns either a normalized draft or a coded correction ([cmd/scout-submit-check/main.go:L3-L8](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/cmd/scout-submit-check/main.go#L3-L8)).
- **Assurance receipt.** Immutable, write-once evidence of one trusted verification pass ([docs/assurance-receipts.md:L3-L8](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/assurance-receipts.md#L3-L8)).
- **Cleanup provenance.** A structured `cleanup_decision` recorded before any worktree or session removal ([docs/cleanup-provenance.md:L3-L8](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/cleanup-provenance.md#L3-L8)).

## Work queue

- **Batch → Job → Attempt → Intent.** The queue aggregate chain. A retry adds a new Attempt rather than replacing the Job ([docs/DOMAIN-GLOSSARY.md:L36-L42](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/DOMAIN-GLOSSARY.md#L36-L42)).
- **Shadow / released bake / unattended.** The three daemon modes. Shadow is the default ([cmd/dev-inbox-queued/main.go:L155-L174](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/cmd/dev-inbox-queued/main.go#L155-L174)).
- **`DEV_INBOX_QUEUE_MAX_ACTIVE_JOBS`.** The global cap on concurrently active outer jobs. Each repository is still limited to one active job ([cmd/dev-inbox-queued/main.go:L243-L248](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/cmd/dev-inbox-queued/main.go#L243-L248)).

## Measurement

- **Reading.** A read-only, provenance-carrying measurement result produced by `orchmeasure` ([docs/DOMAIN-GLOSSARY.md:L68](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/DOMAIN-GLOSSARY.md#L68), [docs/KEY-PATHS.md:L73](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/KEY-PATHS.md#L73)).
