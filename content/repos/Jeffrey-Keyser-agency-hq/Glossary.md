---
title: Glossary
description: Repo-specific terms used in Agency HQ.
---

# Glossary

**CEO agent.** The top-of-stack agent that interfaces with the human via Telegram/NanoClaw and delegates work to department leads. Owns `ceo_messages`, `ceo_directives`, and `ceo_webhook_traces` ([CLAUDE.md:16-17](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L16-L17), [CLAUDE.md:54-58](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L54-L58)).

**CEO directive.** A strategic instruction (build / pause / pursue / deprioritize / investigate / general) translated by the PM into tasks or sprints; stored in `ceo_directives` ([CLAUDE.md:56-58](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L56-L58)).

**Department lead.** An agent persona one tier below the CEO that owns a vertical slice of work and runs facilitator-led meetings; implemented through the meeting engine's agent invoker ([README.md:21](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/README.md#L21), [src/meeting-engine/index.ts:1](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/meeting-engine/index.ts#L1)).

**Meeting.** A scheduled, multi-agent conversation with a typed agenda and structured output (e.g. brainstorm, standup, retro, backlog-grooming). Triggered via `POST /api/v1/meetings/trigger`; only one of a given type can be active at a time ([CLAUDE.md:103-128](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L103-L128)).

**Facilitator.** The discourse driver inside the meeting engine; coordinates agent turns and emits transcripts plus structured artifacts ([src/meeting-engine/index.ts:1-3](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/meeting-engine/index.ts#L1-L3)).

**Scrum board.** The `tasks` table with states `backlog → ready → in-progress → in-review → done`, backed by `task_status_log` for transitions ([CLAUDE.md:40](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L40), [migrations/1710600052200_add-task-status-log.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/migrations/1710600052200_add-task-status-log.ts)).

**Dispatch.** The act of handing a `ready` task to dev-inbox by spawning `manager-standalone.sh`. Tracked in the `dispatches` table; concurrency capped by `dispatch_slots` ([src/execution/dispatcher.ts:28](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/execution/dispatcher.ts#L28), [CLAUDE.md:50-51](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L50-L51)).

**Dispatch slot.** One of a fixed pool (default 4) of concurrency tickets controlling how many parallel dev-inbox runs can be in flight ([CLAUDE.md:50-51](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L50-L51)).

**Heartbeat.** A periodic message on `TaskHeartbeatExchange` emitted by dev-inbox while a task is running; absence beyond `HEARTBEAT_RECOVER_THRESHOLD_MS` flags the task as stalled ([src/execution/index.ts:31-47](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/execution/index.ts#L31-L47)).

**Iteration engine.** A 5-minute interval job that runs stall detection and other proactive checks, gated by the `iteration-engine-enabled` autonomy rule ([src/services/iteration-engine.ts:7-34](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/services/iteration-engine.ts#L7-L34)).

**Ghost task.** A task that appears stuck or zombied; detections are logged in `ghost_task_detections` and reviewed by the auto-resolver ([CLAUDE.md:50-52](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L50-L52), [src/execution/ghost-task-auto-resolver.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/execution/ghost-task-auto-resolver.ts)).

**Autonomy rule.** A row in `autonomy_rules` that maps a decision type to a trust level (propose / act-report / act-exception / autonomous), determining how much the agent may do without human approval ([CLAUDE.md:43](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L43)).

**PM artifact.** A versioned planning document produced by the PM persona, stored across `pm_artifacts` and `pm_artifact_versions` with diffs and approval state ([CLAUDE.md:51](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L51)).

**Three-tier memory.** Identity (always loaded) → working memory (per-project, in `agent_memory`) → archive (`agent_memory_archive`) with compaction ([CLAUDE.md:18](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L18), [CLAUDE.md:48](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L48)).

**Lineage ID.** A UUID propagated across meetings, decisions, tasks, dispatches, and agent sessions so a single human intent can be traced end to end via `/api/v1/lineage` ([CLAUDE.md:52](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L52), [migrations/1710600035000_add-lineage-to-meetings-and-dispatches.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/migrations/1710600035000_add-lineage-to-meetings-and-dispatches.ts)).
