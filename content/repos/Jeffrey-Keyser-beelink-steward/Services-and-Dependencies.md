---
title: "beelink-steward Services and Dependencies"
description: "What beelink-steward depends on and who consumes it, separating source-confirmed callers from expected or unknown consumers."
---

# Services and Dependencies

## Depends on

- **Go standard library only**, with no external service dependency for the CPU path ([docs/cpu-contract.md:L6](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/cpu-contract.md#L6)).
- **Local kernel and cgroup files** for the configured collector: `/etc/machine-id`, boot ID, uptime and the configured `cpu.stat` ([docs/sensing-sandbox.md:L22-L23](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/sensing-sandbox.md#L22-L23)). The configured collector has no Netdata or network dependency ([docs/sensing-sandbox.md:L29-L30](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/sensing-sandbox.md#L29-L30)).
- **Snapshot spool directory** holding helper outputs ([reader/configured.go:L276-L291](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/reader/configured.go#L276-L291)).
- **Owner grant files** beside the config, loaded through the owner-side loader ([cmd/beelink-steward/configured.go:L23-L28](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/cmd/beelink-steward/configured.go#L23-L28)).
- **Systemd user manager** for the helper units. The default reader denies discovery, and the scheduled collector uses fixed cgroup attribution ([docs/cpu-contract.md:L121-L125](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/cpu-contract.md#L121-L125)).
- **Telegram Bot API** for the digest, the only unit with network access ([deploy/systemd/beelink-steward-digest.service:L3-L8](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/deploy/systemd/beelink-steward-digest.service#L3-L8)).
- **A configured HTTP model endpoint** for triage. It must be HTTPS, or loopback HTTP ([triage/config.go:L147-L167](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/triage/config.go#L147-L167)).

## Consumed by

Confirmed callers in source:

- **The operator and owner**, through the CLI ([cmd/beelink-steward/main.go:L53-L68](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/cmd/beelink-steward/main.go#L53-L68)).
- **The sampler unit**, which runs `sample` with the config and state directory ([deploy/systemd/beelink-steward.service:L9](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/deploy/systemd/beelink-steward.service#L9)).
- **Oneshot units** for the actuator, clean-tmp, digest, triage and the probe helper ([deploy/systemd/beelink-steward-clean-tmp@.service:L18](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/deploy/systemd/beelink-steward-clean-tmp@.service#L18), [deploy/systemd/beelink-steward-healthprobe-user.service:L9](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/deploy/systemd/beelink-steward-healthprobe-user.service#L9)).
- **Status readers.** Older consumers must tolerate the additive `sources` field ([docs/sensing-sandbox.md:L84-L86](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/sensing-sandbox.md#L84-L86)).

Expected or unknown:

- **Dev-inbox.** Proposals are addressed to dev-inbox, but no delivery endpoint or acceptance contract was supplied. Delivery is unknown ([docs/durable-store.md:L148-L151](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/durable-store.md#L148-L151)).
- **Agency HQ.** It appears as a service-health fixture name ([testdata/service-health/agency-gate-2026-10-12-unexpected-body.json:L6](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/testdata/service-health/agency-gate-2026-10-12-unexpected-body.json#L6)). Whether it is configured on the host is unknown.
- **Logos** is the authoritative intent store, referenced by name only ([README.md:L15-L18](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/README.md#L15-L18)).
