---
title: "Glossary"
description: "Project-specific terms used in presence-signal, with source citations."
---

# Glossary

**Owner MAC.** The per-network MAC address of the owner's device, from `PRESENCE_OWNER_MAC` or direct configuration. [src/config.ts:L86](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/config.ts#L86)

**Required target.** A labeled person with at least one connected registered MAC. Every target must be present. [README.md:L35-L44](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/README.md#L35-L44)

**Legacy name/count rule.** Without a target file, two clients matching `^HOST_PC(?:\(|$)` by default. [README.md:L52-L55](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/README.md#L52-L55)

**Qualifying streak.** Consecutive polls where the owner is away and targets are present. [src/presence.ts:L50-L51](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/presence.ts#L50-L51)

**Owner away.** The owner MAC has been absent for at least the away threshold. [src/presence.ts:L28-L29](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/presence.ts#L28-L29)

**Latch (`notified`).** Holds after an arrival alert until the owner returns or every target leaves. [src/presence.ts:L52-L53](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/presence.ts#L52-L53)

**Departure streak.** Consecutive polls with no targets present while latched. [src/presence.ts:L54](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/presence.ts#L54)

**DEPARTURE_STABLE_POLLS.** Polls required before a departure notice, default 5. [src/config.ts:L111-L115](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/config.ts#L111-L115)

**Poll history.** Snapshots of active clients kept for 24 hours. [src/poll-history.ts:L5](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/poll-history.ts#L5)

**historyError.** Health field reporting the last history write failure. [src/service.ts:L19](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/service.ts#L19)

**isActive.** Calix row flag. Rows with `isActive: 0` are treated as disconnected. [src/calix.ts:L68-L71](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/calix.ts#L68-L71)

**Device labels.** Optional user-supplied display names for reports, keyed by MAC. The running service does not load them. [AGENTS.md:L3-L9](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/AGENTS.md#L3-L9)

**Solo Vault.** Secret source for four configured keys when an API key is set. [README.md:L23-L30](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/README.md#L23-L30)
