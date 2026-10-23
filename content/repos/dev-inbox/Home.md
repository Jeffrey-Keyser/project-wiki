---
title: "dev-inbox — Home"
description: "Multi-provider agent orchestration that turns a software request into isolated, verified, reviewed, and recoverable delivery."
---

# dev-inbox

dev-inbox is a multi-provider agent orchestration system for reviewed, recoverable software delivery ([README.md:L3](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L3)). It turns a software request into isolated implementation work, verification, review, and a controlled landing decision. It can do this for one interactive request, a dependency-ordered multi-slice plan, or preapproved work admitted through a durable unattended queue ([README.md:L8-L11](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L8-L11)).

## At a glance

- **Version and license:** 2.0.0, MIT, private npm package ([package.json:L2-L5](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/package.json#L2-L5)).
- **Operating modes:**
  - standalone runs through `scripts/manager-standalone.sh` or `/orchestrate`;
  - the plan manager handles multi-slice plans;
  - the `bin/dev-inbox-queued` work queue, which is shadow-only by default;
  - the read-only `/prospector` for analysis ([README.md:L42-L47](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L42-L47)).
- **Providers:** Claude, Codex, Copilot, Gemini, Kimi, and OpenCode ([README.md:L21](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L21)).
- **Runtime split:** the Go `plan-managerd` owns projection, state transitions, provider selection, failure classification, supervision, and recovery. Bash stays at the agent, tmux, git, and operator edges ([README.md:L170-L172](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L170-L172)).
- **State:** filesystem-based. `results/<runId>/dispatch-events.jsonl` is canonical for run state transitions, and role writers own the artifact bodies ([CLAUDE.md:L13-L14](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/CLAUDE.md#L13-L14)).
- **Host requirements:** Linux, macOS, or WSL2 with bash, git, tmux, jq, uuidgen, Node.js 18+, Go, and at least one authenticated agent CLI ([README.md:L53-L54](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L53-L54)).

## Who uses it

- **An operator** starts runs from the CLI or from Claude Code's `/orchestrate`. The operator approves or edits the plan unless `--auto-approve` is passed ([README.md:L91-L126](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L91-L126)).
- **The plan manager** dispatches each plan slice as its own sub-orchestration run ([docs/plan-manager-quickstart.md:L3-L8](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/plan-manager-quickstart.md#L3-L8)).
- **The work queue** wraps branch-ready standalone runs with durable admission. It is not an auto-merge service ([README.md:L201-L218](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L201-L218)).
- **Agency HQ** is named in source comments as a watcher of startup and failure markers. It is optional for a portable install, and this snapshot does not establish how it is deployed ([scripts/manager-standalone.sh:L61-L66](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/scripts/manager-standalone.sh#L61-L66), [README.md:L85-L86](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L85-L86)).

## Main flow

A standalone run moves through eight steps ([README.md:L123-L137](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L123-L137)):

1. **Plan:** a planner produces the tasks.
2. **Approve:** the operator accepts or edits the plan.
3. **Enrich (optional):** scouts gather read-only context.
4. **Implement:** workers run in separate tmux panes and git worktrees.
5. **Verify:** the declared commands run and produce a receipt.
6. **Review:** reviewers inspect identity-bound evidence.
7. **Revise:** a bounded revision follows `request-changes`.
8. **Complete:** the work lands as a merge, a PR/MR, or a branch-ready handoff.

An observer can monitor the run and report process findings. It does not take part in implementation or review decisions ([README.md:L139-L140](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L139-L140)).

Operator gates stay in front of destructive, ambiguous, or production-sensitive actions ([README.md:L22](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L22)). Queue preapproval authorizes execution only; it does not authorize a merge or a production deployment ([README.md:L313](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L313)).

## Wiki pages

- [Architecture](../architecture/): components, the Go/Bash split, and state contracts.
- [Iteration Loop](../iteration-loop/): the contributor test and CI workflow.
- [Services and Dependencies](../services-and-dependencies/): what dev-inbox depends on and who consumes it.
- [Operations](../operations/): start, install, health, and observability.
- [Glossary](../glossary/): project-specific terms.
