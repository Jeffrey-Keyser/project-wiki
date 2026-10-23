---
title: "beelink-steward Operations"
description: "How beelink-steward is built, run, tested, checked for health and activated, with documented versus verified runtime status made explicit."
---

# Operations

beelink-steward is a command-line binary run by systemd user units, not a library. Its packages are in one Go module ([go.mod:L1](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/go.mod#L1)).

## Build and run

- Build: `go build -o /tmp/beelink-steward ./cmd/beelink-steward`. The `/tmp` output path is the documented example ([docs/durable-store.md:L8-L9](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/durable-store.md#L8-L9)).
- Collect: `sample --config ... --state ...` ([docs/durable-store.md:L10](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/durable-store.md#L10)). The sampler unit uses the same command ([deploy/systemd/beelink-steward.service:L9](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/deploy/systemd/beelink-steward.service#L9)).
- Timers: helper timers fire at `*-*-* *:02/5:00`, offset from the sampler ([docs/sensing-sandbox.md:L161-L163](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/sensing-sandbox.md#L161-L163)).

## Health and observability

- `status` and `status.json` show exceptions and `sources`. `status.json` carries a revision that matches committed state ([docs/durable-store.md:L42-L43](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/durable-store.md#L42-L43), [docs/sensing-sandbox.md:L51-L66](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/sensing-sandbox.md#L51-L66)).
- A failed commit records a degraded heartbeat with the failing stage ([cmd/beelink-steward/configured_store.go:L41-L46](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/cmd/beelink-steward/configured_store.go#L41-L46)).
- Audit reads go through the `audit` subcommand ([cmd/beelink-steward/main.go:L63-L64](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/cmd/beelink-steward/main.go#L63-L64)).
- The daily digest sends at most one message per day ([deploy/systemd/beelink-steward-digest.service:L3-L8](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/deploy/systemd/beelink-steward-digest.service#L3-L8)).
- Output is bounded at 1 MiB, and status lists at most 100 active exceptions ([docs/durable-store.md:L142-L143](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/durable-store.md#L142-L143)).

## Test

- `go vet ./...`, `go test -count=1 ./...` and `go test -race ./...` ([docs/cpu-contract.md:L9-L11](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/cpu-contract.md#L9-L11)).
- Replay corpora through the verify manifest ([config/verify/beelink-steward.json:L3-L14](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/config/verify/beelink-steward.json#L3-L14)).

## Deployment and activation

Units are source only. Installing, enabling and the sandbox check are operator steps ([docs/maintenance-contract.md:L221-L239](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/maintenance-contract.md#L221-L239)). Proc concealment is unresolved, so confinement is not verified ([docs/sensing-sandbox.md:L130-L132](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/sensing-sandbox.md#L130-L132)).

## Documented versus verified

- Documented: the commands, unit files and contracts above.
- Verified in these excerpts: none of the host runs. The excerpts contain no test output.
- Unknown: whether any timer is enabled, the live config contents, and the state directory's backup status.

Back up the state directory as durable state ([docs/durable-store.md:L144-L146](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/durable-store.md#L144-L146)). Before a downgrade, use a policy-aware binary or restore a compatible backup ([docs/cpu-contract.md:L183-L185](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/cpu-contract.md#L183-L185)).
