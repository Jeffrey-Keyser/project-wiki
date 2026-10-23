---
title: "beelink-steward Home"
description: "Overview of the advisory-first Beelink host care agent: what it watches, who uses it, the main flow, and links to the other wiki pages."
---

# beelink-steward

beelink-steward is an advisory-first host care agent for the Beelink homelab host. It watches for memory pressure, sustained process hogs, failed units, service health, and disk and `/tmp` growth. It explains what is wrong and why, and acts only through tools the owner grants one at a time ([README.md:L3-L6](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/README.md#L3-L6)).

## At a glance

- Go 1.22 module that uses the standard library ([go.mod:L1-L3](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/go.mod#L1-L3), [docs/cpu-contract.md:L6](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/cpu-contract.md#L6)).
- One CLI binary dispatches sampling, replay, owner review, grants, actuation, digest and triage subcommands ([cmd/beelink-steward/main.go:L42-L44](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/cmd/beelink-steward/main.go#L42-L44)).
- Each detector has a versioned contract under `docs/`, such as the [memory contract](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/memory-contract.md#L3-L7).
- Durable state is a local directory with an authoritative `state.json` and a derived `status.json` ([docs/durable-store.md:L34-L43](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/durable-store.md#L34-L43)).
- Systemd user units live in `deploy/`. Installing and enabling them is an operator step ([docs/sensing-sandbox.md:L5-L8](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/sensing-sandbox.md#L5-L8)).
- Whether any unit is enabled on the real host is unknown from these excerpts.

## Who uses it

- **The owner** reads status, evidence and proposals, acknowledges or suppresses exceptions, records judgments, and restores grants ([README.md:L43-L48](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/README.md#L43-L48), [docs/durable-store.md:L101-L104](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/durable-store.md#L101-L104)).
- **Systemd user units** run the sampler, the granted actuator, the digest and triage ([deploy/systemd/beelink-steward.service:L9](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/deploy/systemd/beelink-steward.service#L9), [deploy/systemd/beelink-steward-digest.service:L3-L4](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/deploy/systemd/beelink-steward-digest.service#L3-L4)).
- **Contributors** run the replay corpora and Go checks listed in [config/verify/beelink-steward.json:L3-L14](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/config/verify/beelink-steward.json#L3-L14).
- Product intent is held outside this repository, in Logos and Agency HQ ([README.md:L15-L21](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/README.md#L15-L21)). This wiki does not restate it.

## Main flow

1. Helper units capture bounded snapshots into a spool directory ([docs/sensing-sandbox.md:L155-L159](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/sensing-sandbox.md#L155-L159)).
2. The configured sampler runs each detector and commits under one store lock ([cmd/beelink-steward/configured.go:L56-L60](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/cmd/beelink-steward/configured.go#L56-L60)).
3. A qualifying result opens or refreshes one exception with retained evidence. A valid clearing window closes it ([docs/durable-store.md:L50-L52](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/docs/durable-store.md#L50-L52)).
4. Owner tools act only under grants and admission checks ([README.md:L36-L38](https://github.com/Jeffrey-Keyser/beelink-steward/blob/4c0dad5b395f187fd67343b0af6b4119f48df1ac/README.md#L36-L38)).

## Explore

- [Architecture](../architecture/)
- [Iteration loop](../iteration-loop/)
- [Services and dependencies](../services-and-dependencies/)
- [Operations](../operations/)
- [Glossary](../glossary/)
