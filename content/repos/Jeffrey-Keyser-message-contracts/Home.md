---
title: "message-contracts Home"
description: "Overview of the shared RabbitMQ message types and exchange constants package."
---

# @jeffrey-keyser/message-contracts

This repository publishes a TypeScript package of shared RabbitMQ message types and exchange constants for the Jeffrey-Keyser ecosystem ([README.md:L3](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/README.md#L3)). The provided source defines interfaces, constants, and small helpers rather than running services ([src/index.ts:L1-L6](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/index.ts#L1-L6)).

## At a glance

- Package version 1.21.0 ([package.json:L3](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/package.json#L3)).
- Entry points are `dist/index.js` and `dist/index.d.ts` ([package.json:L5-L6](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/package.json#L5-L6)).
- The README lists five exchanges ([README.md:L118-L124](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/README.md#L118-L124)); the exchange constants file defines more ([src/exchanges.ts:L17-L24](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/exchanges.ts#L17-L24)).
- License is MIT ([package.json:L28](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/package.json#L28)).
- Publishing is configured for the GitHub npm registry ([package.json:L36-L38](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/package.json#L36-L38)).

## Who uses it

The README names Cron, Agency HQ, and Dev Inbox as participants in correlation-ID workflows ([README.md:L27-L31](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/README.md#L27-L31)). A source comment says the cron-service UI uses the cron target registry ([src/cron-targets.ts:L2-L5](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/cron-targets.ts#L2-L5)). Whether any consumer is deployed is unknown from this source.

## Main flow

1. The originating cron run generates a correlation ID ([src/correlation.ts:L4-L6](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/correlation.ts#L4-L6)).
2. Cron-originated messages carry it in the optional `correlation_id` field ([src/cron/events.ts:L25](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/cron/events.ts#L25)).
3. Consumers must propagate the exact value unchanged ([src/correlation.ts:L10-L14](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/correlation.ts#L10-L14)).
4. Dev Inbox terminal receipts repeat the same ID ([src/dev-inbox/events.ts:L10-L15](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/dev-inbox/events.ts#L10-L15)).

## Explore

- [Architecture](../architecture/)
- [Iteration loop](../iteration-loop/)
- [Services and dependencies](../services-and-dependencies/)
- [Operations](../operations/)
- [Glossary](../glossary/)
