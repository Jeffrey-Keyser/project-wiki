---
title: "Services and Dependencies"
description: "What dev-inbox depends on, which callers are confirmed in source, and which consumers remain expected or unknown."
---

# Services and Dependencies

This page separates what the source confirms from what is only documented or expected. See [Operations](../operations/) for runtime commands.

## Depends on

### Host tooling

- Required: bash, git, tmux, jq, uuidgen, Node.js 18+, Go, and at least one authenticated agent CLI ([README.md:L53-L54](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L53-L54), [package.json:L11-L13](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/package.json#L11-L13)).
- Release-tarball installs also need `perl` and an authenticated `gh` ([docs/PORTABLE-INSTALL.md:L25-L29](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/PORTABLE-INSTALL.md#L25-L29)).

### Agent providers

- Supported providers are Claude, Codex, Copilot, Gemini, Kimi, and OpenCode ([README.md:L21](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L21)).
- `internal/providers` owns selection, health, fallback order, and retry ([docs/inference-layer.md:L33-L36](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/inference-layer.md#L33-L36)).
- **Optional API lane.** The single-shot synthesizers can send requests through an AI Proxy `/v1/chat` instead of the CLI ([docs/model-completion-api-lane.md:L3](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/model-completion-api-lane.md#L3)).
  - It is off by default, or whenever the config file is absent ([docs/model-completion-api-lane.md:L22](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/model-completion-api-lane.md#L22)).
  - The proxy URL appears only in a config example.

### Optional external systems

- **RabbitMQ and Agency HQ.** Both are optional for a portable standalone install. Their integrations degrade gracefully or can be disabled ([README.md:L85-L86](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L85-L86)).
- **GitHub.**
  - `issue-publisher` builds a GitHub tracker for issues and forge lifecycle ([cmd/issue-publisher/main.go:L47-L60](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/cmd/issue-publisher/main.go#L47-L60)).
  - Forge lifecycle stays disabled unless `DEV_INBOX_FORGE_LIFECYCLE_MODE=on` ([cmd/issue-publisher/main.go:L171](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/cmd/issue-publisher/main.go#L171)).
- **OpenClaw.** The supervise heartbeat monitor sends its first alert per incident through OpenClaw ([systemd/README.md:L10](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L10)).
- **Image Studio.** Only two explicit cross-repository CI proofs use it ([docs/ci-testing.md:L17-L21](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/ci-testing.md#L17-L21)).

None of the optional systems above are verified as deployed by this snapshot.

## Consumed by

### Confirmed callers in this repository

- **`/orchestrate` slash command.** It is the manager brain for interactive runs ([CLAUDE.md:L22](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/CLAUDE.md#L22)).
- **`npm run orchestrate`.** It wraps `scripts/manager-standalone.sh` ([package.json:L9](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/package.json#L9)).
- **Plan manager.** It dispatches each slice as a sub-orchestration ([docs/plan-manager-quickstart.md:L3-L5](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/plan-manager-quickstart.md#L3-L5)).
- **`dev-inbox-queued`.** It constructs the production `devinbox` driver, configured with the scripts and plans roots and a `plan-managerd` binary ([cmd/dev-inbox-queued/main.go:L194-L198](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/cmd/dev-inbox-queued/main.go#L194-L198)).
- **`launch-prospector-ideas.sh`.** It runs `manager-standalone.sh` sequentially, one run per repo ([docs/KEY-PATHS.md:L55](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/docs/KEY-PATHS.md#L55)).
- **`issue-triage approve`.** It admits jobs into the work queue, but only in `approval-gated` mode ([cmd/issue-triage/main.go:L323-L344](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/cmd/issue-triage/main.go#L323-L344)).
- **`issue-publisher`.** It consumes the filesystem outboxes ([systemd/README.md:L20](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/systemd/README.md#L20)).

### Expected external consumers (not verified)

- **Agency HQ.** Source comments say the startup and failure markers exist so that Agency HQ can tell when a manager never started ([scripts/manager-standalone.sh:L157-L158](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/scripts/manager-standalone.sh#L157-L158)).
- **Agency HQ release workflow.** Agency HQ is described as owning drain, activation, health, and rollback of reconciler releases ([cmd/project-reconciler-release/main.go:L1-L2](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/cmd/project-reconciler-release/main.go#L1-L2)).
- **Relay sessions.** A cloud agent session can exchange prompts through the opt-in clipboard relay ([README.md:L302-L306](https://github.com/Jeffrey-Keyser/dev-inbox/blob/9a72cd60e5068bd14367dc5f7f9acd50e387b650/README.md#L302-L306)).
  - The relay's enrollment request construction and client-state projection are owned by the source-run Go helper `cmd/relay-enrollment-encode`, which has two operations ([cmd/relay-enrollment-encode/main.go:L1-L109](https://github.com/Jeffrey-Keyser/dev-inbox/blob/d6559913f6af9d75f3c71a43c7053ecc58c65ab2/cmd/relay-enrollment-encode/main.go#L1-L109)):
    - `request --mode token|pay` builds an enrollment request, with optional `--label`, `--explicit-label`, and `--purpose`;
    - `state --url URL` reads an enrollment response on stdin and writes the projected client state.
  - Usage errors exit 64; other failures exit 1 ([cmd/relay-enrollment-encode/main.go:L1-L109](https://github.com/Jeffrey-Keyser/dev-inbox/blob/d6559913f6af9d75f3c71a43c7053ecc58c65ab2/cmd/relay-enrollment-encode/main.go#L1-L109)).
  - The design that moved this work into the typed encoder is recorded with status `done` ([design/relay-enrollment-data-typed-owner/meta.json:L1-L13](https://github.com/Jeffrey-Keyser/dev-inbox/blob/d6559913f6af9d75f3c71a43c7053ecc58c65ab2/design/relay-enrollment-data-typed-owner/meta.json#L1-L13)).
  - Go is already listed under host tooling above.

### Unknown

- Any other downstream reader of `results/` or the event streams (for example, consumers of the runstream publisher) is not identified in the provided source.
