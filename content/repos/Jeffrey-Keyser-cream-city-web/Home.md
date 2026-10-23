---
title: "Cream City Web"
description: "Overview of the Cream City Web repository: an AI-operated Milwaukee web design micro-business, its at-a-glance facts, users, main flow, and links to deeper wiki pages."
---

# Cream City Web

Cream City Web is the operational repository for a web design micro-business serving small businesses in the Milwaukee area. An AI operator runs it on behalf of owner Jeffrey Keyser and discloses that it is an AI ([CLAUDE.md:L3](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L3)). The repo combines an operator runbook, a PostgreSQL schema, CLI scripts for leads, sites, email, staging and billing, an Express payment API, a static site server, and a Cloudflare email worker ([README.md:L3](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/README.md#L3), [README.md:L38-L48](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/README.md#L38-L48)).

The offer is an affordable static website, with a free mockup provided before any commitment ([PROBLEM.md:L21-L27](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/PROBLEM.md#L21-L27)).

## At a glance

- **Runtime:** Node package declared as `"type": "module"` ([package.json:L5](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/package.json#L5)). The Node version is not pinned in the provided excerpts, so it is unknown.
- **Database:** PostgreSQL 17, database `cream_city_web`, on localhost ([README.md:L7](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/README.md#L7), [schema.sql:L2](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/schema.sql#L2)).
- **Operator cadence:** hourly during 9am to 5pm CT, Monday to Friday, plus ad-hoc runs ([CLAUDE.md:L15-L17](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L15-L17)).
- **Outreach:** marked BLOCKED until a P.O. box, site polish, and a simulated customer journey are confirmed ([CLAUDE.md:L110-L116](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L110-L116)).
- **Lead flow:** `new` through `converted`, with `not_interested` and `dead` as off-ramps ([README.md:L32-L33](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/README.md#L32-L33)).

## Who uses it

- **Jeffrey Keyser** approves outreach drafts and handles escalations, including spend above $20 ([CLAUDE.md:L183-L189](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L183-L189)).
- **The operator** runs Claude Code sessions that follow the runbook ([CLAUDE.md:L8-L30](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L8-L30)).
- **Prospects and customers** view mockups on subdomains ([README.md:L75-L77](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/README.md#L75-L77)) and are directed to pay with a payment code ([tools.md:L158-L160](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/tools.md#L158-L160)). The pay page itself is not in the snapshot.

## Main flow

1. A trigger starts a run. The operator records it and reads pipeline state ([CLAUDE.md:L26-L30](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L26-L30)).
2. The operator picks the highest-priority work, starting with customer commitments ([CLAUDE.md:L198-L204](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L198-L204)).
3. Actions are logged, a run log is written, and changes are committed and pushed ([CLAUDE.md:L43-L44](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L43-L44), [CLAUDE.md:L48](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L48), [CLAUDE.md:L66](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/CLAUDE.md#L66)).

Payment follows a separate path. The API looks up a pending code and creates a Stripe Checkout session through the Pay API ([api/server.mjs:L170-L171](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L170-L171), [api/server.mjs:L221-L229](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L221-L229)). A `checkout.session.completed` webhook then marks the code used and creates or updates the customer ([api/server.mjs:L263-L306](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L263-L306)).

## Wiki pages

- [Architecture](../architecture/): components, contracts, and a component diagram.
- [Iteration Loop](../iteration-loop/): the run cycle and contributor checks.
- [Services & Dependencies](../services-and-dependencies/): what the repo depends on and who calls it.
- [Operations](../operations/): start, deploy, test, health, and observability.
- [Glossary](../glossary/): project terms with sources.
