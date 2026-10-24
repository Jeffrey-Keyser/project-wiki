---
title: "Glossary"
description: "Project-specific Agency HQ terms with source citations."
---

# Glossary

**Product reset.** The redesign that centres Agency HQ on Runs, Topology and a supervised control plane, with older mechanisms treated as legacy surfaces under audit ([CLAUDE.md:L5-L14](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/CLAUDE.md#L5-L14)).

**Supervised control plane.** The small target core for proposals, decisions, dev-inbox dispatch and outcome reporting ([CLAUDE.md:L5-L7](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/CLAUDE.md#L5-L7)).

**Legacy surface.** The dashboard, Kanban, backlog, sprint, meeting, CEO-agent, persona and memory mechanisms; still running, not parity requirements ([README.md:L5-L9](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/README.md#L5-L9)).

**Topology view.** Operator view at `/dashboard/topology`, aliased at `/topology` ([src/routes/index.ts:L16-L19](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/routes/index.ts#L16-L19)).

**Runs list.** The run history view; it can group runs by plan while recent-run paging stays independent ([src/routes/dashboard/templates/runs-plan-groups.ts:L1](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/routes/dashboard/templates/runs-plan-groups.ts#L1)).

**Run trace / run projection.** Read models in `agency.run_traces`, `run_steps`, `run_invocations`, `run_slices` and `run_events` derived from the runstream ledger ([src/dal/run-analyses.ts:L156-L178](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/dal/run-analyses.ts#L156-L178)), filled by a durable projection worker ([src/bin/www.ts:L222-L227](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/bin/www.ts#L222-L227)).

**Plan.** The unit a run is attributed to by `plan_id`; its manifest is `plans/<id>/slices.json` ([src/services/run-list-context.ts:L60-L69](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/services/run-list-context.ts#L60-L69)).

**Slice.** A unit of work in a plan, with index, title and status normalised to completed, running, failed or blocked ([src/services/run-list-context.ts:L41-L48](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/services/run-list-context.ts#L41-L48)).

**Run attempt.** One execution of a slice; attempts are ordered by `slice.dispatched` events ([src/dal/run-analyses.ts:L181-L205](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/dal/run-analyses.ts#L181-L205)). The Runs list shows the latest and hides earlier attempts behind a toggle ([src/routes/dashboard/templates/runs-plan-groups.ts:L29-L33](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/routes/dashboard/templates/runs-plan-groups.ts#L29-L33)).

**Dispatch.** Handing a `ready` task to dev-inbox by spawning `manager-standalone.sh` ([src/execution/dispatcher.ts:L339-L349](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/execution/dispatcher.ts#L339-L349)).

**Dispatch gate.** A sequential precondition that allows, blocks or throws `DispatchError` ([src/execution/dispatcher.ts:L146-L158](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/execution/dispatcher.ts#L146-L158)).

**Dispatch slot.** One of a fixed four concurrency slots for parallel execution ([CLAUDE.md:L85](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/CLAUDE.md#L85)).

**Trust level.** `propose`, `act-report`, `act-exception` or `autonomous`, set per decision type in `autonomy_rules` ([docs/autonomy-rules.md:L7-L14](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/autonomy-rules.md#L7-L14)).

**autonomous-mode.** The global autonomy row; on only when its trust level is `autonomous` ([docs/autonomy-rules.md:L173-L178](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/autonomy-rules.md#L173-L178)).

**Iteration engine.** A timer (default 5 minutes) gated by the `iteration-engine-enabled` rule; it turns issued CEO directives whose `blocked_by` tasks are done into backlog tasks and logs stalled slots ([src/services/iteration-engine.ts:L13-L15](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/services/iteration-engine.ts#L13-L15), [src/services/iteration-engine.ts:L128-L145](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/services/iteration-engine.ts#L128-L145)). Older docs calling it unimplemented are stale ([docs/codebase-audit.md:L16](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/codebase-audit.md#L16)).

**Ghost task.** An `in-progress` or `in-review` task stale beyond `GHOST_TASK_THRESHOLD_HOURS` (default 24). In autonomous mode it returns to `ready`, or to `blocked` after two stalls ([src/execution/ghost-task-auto-resolver.ts:L11-L34](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/execution/ghost-task-auto-resolver.ts#L11-L34), [src/execution/ghost-task-auto-resolver.ts:L68-L77](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/execution/ghost-task-auto-resolver.ts#L68-L77)).

**Deployment work / admission.** Work wrapped in `withDeploymentWork`, admitted only while the attested runtime holds exclusivity ([src/execution/dispatcher.ts:L1](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/execution/dispatcher.ts#L1), [src/bin/www.ts:L101-L108](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/bin/www.ts#L101-L108)).

**External access gate.** Middleware requiring Pay admin or owner credentials for public-hostname requests ([src/app.ts:L112-L114](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/app.ts#L112-L114)).

**Acceptance workspace.** Temporary shared clones at bound SHAs where acceptance scripts run ([src/services/project-acceptance.ts:L93-L98](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/services/project-acceptance.ts#L93-L98)).

**Ratchet.** An acceptance check printing its count as the last stdout line ([src/services/project-acceptance.ts:L305-L311](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/services/project-acceptance.ts#L305-L311)).

**Readings root.** A repository's live state directory exposed as `ACCEPTANCE_READINGS_<REPO>` ([acceptance/environments/readings-reader.mjs:L131-L135](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/acceptance/environments/readings-reader.mjs#L131-L135)).

**Model consumer.** A workload whose provider/model is controlled from the Models page on next invocation ([docs/model-consumers.md:L3-L14](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/model-consumers.md#L3-L14)).

**Portfolio steward.** A service started at boot with its own model row ([src/bin/www.ts:L232](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/bin/www.ts#L232), [docs/model-consumers.md:L42](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/model-consumers.md#L42)).

**Meeting template (legacy).** Agenda definitions for standup, sprint-planning, ad-hoc, brainstorm, creative-brainstorm, implementation, design-review, retro and backlog-grooming ([src/meeting-engine/templates/index.ts:L13-L23](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/meeting-engine/templates/index.ts#L13-L23)); design-review is a placeholder ([CLAUDE.md:L129](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/CLAUDE.md#L129)).

**Logos proposal card.** The Telegram message sent for each `logos.proposal.created` event. It shows the proposal title, summary, section count and rationale, with Approve and three preset reject buttons. A tap calls Logos directly and replaces the card with the result ([src/services/logos-proposal-cards.ts:L130-L139](https://github.com/Jeffrey-Keyser/agency-hq/blob/28c1fbc06d4be757b1d3c3550dfc54a5320e299c/src/services/logos-proposal-cards.ts#L130-L139), [src/services/telegram-cards.ts:L109-L127](https://github.com/Jeffrey-Keyser/agency-hq/blob/28c1fbc06d4be757b1d3c3550dfc54a5320e299c/src/services/telegram-cards.ts#L109-L127)).

**Homelab Stewardship snapshot.** A read-only JSON review view of requirements, acceptance evidence, designs and open issues for the owner's external review assistant. It is served at `/api/v1/homelab-stewardship`, its download at `/api/v1/homelab-stewardship/export`, and the page at `/dashboard/stewardship`. Each source reports its own status and observation time, and nothing in it grants authority to run checks or change state ([docs/homelab-stewardship.md](https://github.com/Jeffrey-Keyser/agency-hq/blob/e1373ec3d1886686eccee7765f302b34c139e23b/docs/homelab-stewardship.md)).

**Deciding check.** An acceptance check that can decide a requirement's verification state. It must be `locked`, have role `gate` or `census`, and have a `kind`. `lead` checks are shown in the snapshot but never decide ([docs/homelab-stewardship.md](https://github.com/Jeffrey-Keyser/agency-hq/blob/e1373ec3d1886686eccee7765f302b34c139e23b/docs/homelab-stewardship.md), [src/services/homelab-stewardship/compose.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/e1373ec3d1886686eccee7765f302b34c139e23b/src/services/homelab-stewardship/compose.ts)).
