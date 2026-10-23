---
title: "presence-signal Home"
description: "Overview of the local Wi-Fi presence signal service, its main flow, and links to the rest of the wiki."
---

# presence-signal

presence-signal is a minimal, local-only Wi-Fi presence signal for the Beelink homelab. It polls a Calix GigaSpire BLAST u4 client table once per minute and checks the owner's per-network MAC. [README.md:L3-L6](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/README.md#L3-L6)

Device connectivity is only a proxy for presence, so it can produce false positives or negatives. The service does not inspect traffic. [README.md:L17-L19](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/README.md#L17-L19)

## At a glance

- Package version 0.1.0, marked private, ES module, Node.js 24 or later. [package.json:L3-L5](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/package.json#L3-L5)
- Long-running entry point is `dist/index.js`. [package.json:L10](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/package.json#L10)
- Health endpoint on loopback port 3075. [README.md:L68](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/README.md#L68)
- Notifications go to the NanoClaw message API. Default URL: `http://127.0.0.1:3102/api/v1/messages`. [src/config.ts:L116](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/config.ts#L116)

## Who uses it

The owner's phone MAC is the anchor signal. Other people appear only as configured targets, each with labeled MAC addresses. [README.md:L35-L42](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/README.md#L35-L42) Operators read `/history` and `/health` through loopback `curl` commands. [README.md:L89-L94](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/README.md#L89-L94) Other consumers are not confirmed; see the services page.

## Main flow

1. Fetch active clients from the router. [src/service.ts:L66](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/service.ts#L66)
2. Save the snapshot to history before notifying. [src/service.ts:L76](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/service.ts#L76)
3. Evaluate owner absence and target presence. [src/presence.ts:L27-L50](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/presence.ts#L27-L50)
4. Send one arrival alert after the stable-poll threshold, then latch. [src/presence.ts:L62](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/presence.ts#L62)
5. Send one departure notice when every target has left for the configured number of polls, then clear the latch. [src/presence.ts:L63](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/presence.ts#L63)

## Pages

- [Architecture](../architecture/)
- [Iteration loop](../iteration-loop/)
- [Services and dependencies](../services-and-dependencies/)
- [Operations](../operations/)
- [Glossary](../glossary/)
