---
title: "Agency HQ"
description: "Agent orchestration service for the Jeffrey-Keyser ecosystem, now being reset around Runs, Topology and a supervised control plane."
---

# Agency HQ

Agency HQ is an agent orchestration system, described as a "company of agents" for autonomous software development across the Jeffrey-Keyser ecosystem ([README.md:L3](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/README.md#L3)). Historically it was the dev-strategy layer: a CEO agent talked to the human over Telegram, ran meetings, and kept a scrum board, while [dev-inbox](/repos/jeffrey-keyser-dev-inbox/home/) handled tactical execution ([README.md:L16](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/README.md#L16)). It runs alongside [Business HQ](https://github.com/Jeffrey-Keyser/business-hq): Agency HQ decides what to build and Business HQ tracks whether it makes money ([README.md:L18](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/README.md#L18)).

**A product reset is in progress.** The target product centres on the **Runs** and **Topology** views plus a small supervised control plane for proposals, decisions, dev-inbox dispatch and outcome reporting. The dashboard, Kanban, backlog, sprint, meeting, CEO-agent, persona and memory mechanisms are legacy surfaces under audit, not parity requirements ([README.md:L5-L12](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/README.md#L5-L12), [CLAUDE.md:L5-L14](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/CLAUDE.md#L5-L14)). Legacy behaviour stays in place until its callers and data dependencies are audited ([CLAUDE.md:L12-L14](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/CLAUDE.md#L12-L14)).

## At a glance

- **Stack:** Express 5 + TypeScript, PostgreSQL 17, RabbitMQ, systemd user service on Ubuntu 24.04 (documented) ([README.md:L39-L42](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/README.md#L39-L42)).
- **Port:** the unit file sets `PORT=3040` ([agency-hq.service:L18](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/agency-hq.service#L18)).
- **Entry point:** `src/bin/www.ts` attests the deployment runtime, resolves credentials, validates schema, then listens ([src/bin/www.ts:L98-L171](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/bin/www.ts#L98-L171)).
- **HTTP surface:** `/`, `/dashboard` and `/api/v1` ([src/app.ts:L90-L94](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/app.ts#L90-L94)), plus a root `/topology` alias for the operator view ([src/routes/index.ts:L16-L19](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/routes/index.ts#L16-L19)).
- **Access:** public-hostname requests need a Pay admin session or owner JWT; local callers are not gated ([CLAUDE.md:L94](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/CLAUDE.md#L94)).

## Who uses it

- **The operator**, through the Runs and Topology views and the supervised control plane ([CLAUDE.md:L5-L7](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/CLAUDE.md#L5-L7)); legacy flows use the Telegram CEO interface ([README.md:L30](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/README.md#L30)).
- **dev-inbox**, which Agency HQ invokes by spawning its manager script ([src/execution/dispatcher.ts:L34](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/execution/dispatcher.ts#L34)).
- Other callers are documented or expected rather than confirmed; see [Services and Dependencies](../services-and-dependencies/).

## Main flow

1. Work becomes a task in `ready`; a database trigger emits `task_ready` and the dispatch listener picks it up ([docs/event-bus.md:L9-L56](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/event-bus.md#L9-L56)).
2. The dispatcher runs build-freshness, autonomy, attempt-cap and duplicate gates, then spawns dev-inbox ([src/execution/dispatcher.ts:L146-L349](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/execution/dispatcher.ts#L146-L349)).
3. dev-inbox writes plan, result and review files that the result watcher reconciles into task status ([docs/execution-architecture.md:L85-L102](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/execution-architecture.md#L85-L102)).
4. Run events are projected into `agency.run_*` tables and served to the Runs view through `/api/v1/run-analyses` ([src/dal/run-analyses.ts:L145-L178](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/dal/run-analyses.ts#L145-L178), [src/routes/dashboard/templates/runs-plan-groups.ts:L65](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/routes/dashboard/templates/runs-plan-groups.ts#L65)).

<!-- curated:start -->
## Projects documentation

The Projects workspace governs a project from its Logos intent documents through requirement evidence, reconciliation, design review, implementation, and verified completion. These source-backed guides cover the deployed Agency HQ revision `4523d08`, observed on 2026-10-29.

- [Projects guide](../projects-guide/) — registration, configuration, and all eight workspace tabs.
- [Reconciliation lifecycle](../reconciliation-lifecycle/) — triggers, admissions, analysis, challenge, design publication, execution, and parity.
- [Requirements and acceptance checks](../requirements-and-acceptance/) — indexing, verdicts, coverage, check roles, measurements, and pass history.
- [Projects troubleshooting](../projects-troubleshooting/) — diagnose missing evidence, held runs, capacity limits, queue failures, and completion gaps.
<!-- curated:end -->

## Wiki pages

- [Architecture](../architecture/) — components, contracts and process layout.
- [Iteration Loop](../iteration-loop/) — contributor workflow from change to deploy.
- [Services and Dependencies](../services-and-dependencies/) — what Agency HQ calls and who calls it.
- [Operations](../operations/) — start, deploy, test, health and observability.
- [Glossary](../glossary/) — project-specific terms.
