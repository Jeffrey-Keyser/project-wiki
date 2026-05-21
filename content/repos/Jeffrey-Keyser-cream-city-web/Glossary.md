---
title: Glossary
description: Cream City Web vocabulary — run, lead status values, mockup vs. staging, suppression list, NanoClaw IPC, and other repo-specific terms.
---

# Glossary

### Run
One Claude Code session triggered by RabbitMQ or ad-hoc invocation. Recorded as a row in the `runs` table by `node scripts/run.mjs start` and closed by `run.mjs end` ([scripts/run.mjs:48-60](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/scripts/run.mjs#L48-L60), [CLAUDE.md:22-69](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L22-L69)).

### Lead status
Pipeline state for a `leads` row. Canonical flow: `new → qualified → mockup_built → mockup_ready → outreach_sent → responded → interested → converted`, with off-ramps `not_interested → dead` ([README.md:31-34](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L31-L34)).

### Mockup
A speculative site built for a prospect *before* outreach, rendered into `sites/{slug}/` by `node scripts/build-site.mjs <template> <data.json> sites/{slug}` ([tools.md:85-89](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L85-L89)). Screenshots saved as `mockup-{slug}.png` at the project root ([README.md:79-81](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L79-L81)).

### Staging
Customer-facing preview workflow for *already-deployed* sites — tracked in `staging_sites`, served at `staging.creamcityweb.com/{slug}.html`. New mockups do NOT go in `sites/staging/` ([tools.md:48-52](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L48-L52), [README.md:73-77](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L73-L77)).

### Suppression list
Compliance opt-out table. Must be consulted before any send via `node scripts/scout.mjs check-suppressed <email>` ([tools.md:34-35](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L34-L35)).

### Approval flow
Mandatory human-in-the-loop gate. `scripts/send-email.mjs request-approval <lead_id> <template>` writes a NanoClaw IPC payload that reaches Jeffrey on Telegram with an `APPROVE-{lead_id}` reply code ([CLAUDE.md:162-170](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L162-L170)).

### NanoClaw IPC
File-drop interface at `/home/jkeyser/nanoclaw/data/ipc/schedule_task/`. JSON files in this directory are picked up and delivered as Telegram messages ([scripts/run.mjs:21-34](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/scripts/run.mjs#L21-L34)).

### Solo Vault
Secret store layered on top of `.env` by `scripts/secrets.mjs#loadSecrets()` — called at API startup so vault values override file values ([api/server.mjs:22-39](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/api/server.mjs#L22-L39)).

### Pay API
External billing service at `pay-api.jeffreykeyser.net`. This repo calls it via bearer-token-authenticated `/api/v1/*` endpoints ([api/server.mjs:42-65](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/api/server.mjs#L42-L65)).

### Outreach block
Active hold preventing any prospect-facing email until P.O. Box activation, mockup site polish, and a simulated end-to-end customer journey are all complete ([CLAUDE.md:104-128](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L104-L128)).

### Template family
One of three site starting points — `general`, `restaurant`, `services` — under `templates/`. Treated as semantic references, not rigid molds ([tools.md:85-89](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L85-L89)).
