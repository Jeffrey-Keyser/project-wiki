---
title: "Services and Dependencies"
description: "Confirmed runtime dependencies and known or unknown callers of the presence-signal service."
---

# Services and Dependencies

## Depends on

- **Calix GigaSpire router.** Default URL is `https://192.168.1.1`. [src/config.ts:L95](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/config.ts#L95) The client calls `get_nonce.cmd`, `login.cgi`, and `device_table.cmd`. [src/calix.ts:L111-L128](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/calix.ts#L111-L128)
- **Solo Vault (optional).** Used only when `SOLO_VAULT_API_KEY` is set. Default base URL is `http://127.0.0.1:3015/v1`. [src/config.ts:L61-L64](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/config.ts#L61-L64) It posts to the bulk secrets endpoint. [src/vault.ts:L18](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/vault.ts#L18)
- **NanoClaw message API.** Default URL is `http://127.0.0.1:3102/api/v1/messages`. [src/config.ts:L116](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/config.ts#L116) The service orders after `nanoclaw.service` in the unit file. [presence-signal.service:L3](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/presence-signal.service#L3)
- **Local files.** The state file, poll history, and optional target file are read or written on disk. [src/config.ts:L87-L91](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/config.ts#L87-L91)

## Consumed by

Confirmed from source or docs:

- **Deploy script.** It polls `/health` after restart. [deploy.sh:L10](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/deploy.sh#L10)
- **Operators.** The README documents `curl` reads of `/history`. [README.md:L92-L94](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/README.md#L92-L94)
- **Reporting agents.** AGENTS.md describes applying device labels to reports. [AGENTS.md:L3-L5](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/AGENTS.md#L3-L5)

Not confirmed:

- **NanoClaw** is the notification destination in configuration. Whether it is running is unknown.
- **Other dashboards or services** reading `/history` or `/health` are unknown. The excerpts show no such callers.
