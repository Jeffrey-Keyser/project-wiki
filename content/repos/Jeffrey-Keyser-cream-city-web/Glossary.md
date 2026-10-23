---
title: "Glossary"
description: "Project-specific Cream City Web terms such as run, lead status, mockup, staging, suppression list, approval flow, payment code, and Solo Vault, each with source citations."
---

# Glossary

### Run
One operator session, recorded by `run.mjs start` and closed by `run.mjs end` ([run.mjs:L48-L62](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/run.mjs#L48-L62), [CLAUDE.md:L15-L19](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L15-L19)).

### Lead status
The `leads.status` field. The README flow is `new` through `converted` ([README.md:L32](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/README.md#L32)). The schema comment lists different values and omits `mockup_built` and `mockup_ready` ([schema.sql:L25](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/schema.sql#L25)). Stale-lead queries use `scouted` and `ready` ([lead-queries.mjs:L13](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/lead-queries.mjs#L13)). The source disagrees, so treat the set as unresolved.

### Mockup
A prospect site built before outreach, in `sites/{slug}/` ([tools.md:L52](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/tools.md#L52), [tools.md:L85-L89](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/tools.md#L85-L89)). Screenshots are saved as `mockup-{slug}.png` ([README.md:L81](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/README.md#L81)).

### Staging
A preview copy of a site for customer review. Staging is for iterating on existing sites, not for first mockups ([tools.md:L198](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/tools.md#L198)). Quick staging URLs use `staging.creamcityweb.com/{slug}.html` ([README.md:L76](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/README.md#L76)). Full staging uses `staging-{slug}-{hash}` ([staging.mjs:L55-L60](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/staging.mjs#L55-L60)).

### Suppression list
The `suppression_list` table of opt-outs and bounces ([schema.sql:L91-L99](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/schema.sql#L91-L99)). Email sends are blocked for listed addresses ([send-email.mjs:L200-L204](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/send-email.mjs#L200-L204)).

### Approval flow
Policy requiring Jeffrey's explicit approval before outreach ([CLAUDE.md:L176-L183](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L176-L183)). The separate `approval-flow.mjs` promotes staging to production ([approval-flow.mjs:L2-L14](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/approval-flow.mjs#L2-L14)).

### NanoClaw IPC
A file-drop directory that delivers JSON to Telegram ([run.mjs:L21](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/run.mjs#L21), [run.mjs:L24-L34](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/run.mjs#L24-L34)).

### Payment code
A one-time `CCW-` code that starts a Stripe Checkout session ([schema.sql:L189](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/schema.sql#L189), [tools.md:L152-L160](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/tools.md#L152-L160)). Valid tiers are `basic`, `enhanced`, and `custom_domain` ([schema.sql:L192](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/schema.sql#L192)).

### Pay API
The external billing service. This repo calls its `/api/v1` routes with a bearer token ([api/server.mjs:L43](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L43), [api/server.mjs:L59](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L59)).

### Solo Vault
A secret source that overrides `.env` values ([db.mjs:L79-L81](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/db.mjs#L79-L81)). Its implementation is not in the snapshot.

### Outreach block
An active hold on prospect email until the three prerequisites are confirmed ([CLAUDE.md:L110-L116](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L110-L116)).

### Template family
One of the starting layouts for `build-site.mjs`: `general`, `restaurant`, or `services` ([build-site.mjs:L144](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/build-site.mjs#L144)). Templates are references, not rigid molds ([CLAUDE.md:L253-L255](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L253-L255)).

### Slug
A URL-safe name made by `slugify`, used for leads and site folders ([utils.mjs:L10-L15](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/lib/utils.mjs#L10-L15), [leads.mjs:L109](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/leads.mjs#L109)).

### Email intent
A classification of inbound email. Valid values include `feedback`, `approval`, `question`, and `spam` ([email-intent.mjs:L38-L48](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/email-intent.mjs#L38-L48)).

### Email feedback system
A customer-iteration design marked *Proposed* ([EMAIL_FEEDBACK_SYSTEM.md:L3](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/docs/EMAIL_FEEDBACK_SYSTEM.md#L3)). Its scripts are present, but their use in production is unknown.
