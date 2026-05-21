---
title: Cream City Web
description: Autonomous web design micro-business automation for Milwaukee small businesses — lead scouting, mockup generation, outreach, billing, and operator runbook.
---

# Cream City Web

Cream City Web is the operational repo for an AI-run web design micro-business serving small businesses in the Milwaukee area. The repo bundles the runbook (`CLAUDE.md`), the PostgreSQL schema, lead/site/billing scripts, an Express payment API, static-site templates, and a Cloudflare email-receiver worker into one workspace ([README.md:1-4](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L1-L4)).

## At a glance

- **Operator:** Claude Code sessions, triggered hourly via `cron-service → RabbitMQ → openclaw-bridge → OpenCLAW` ([CLAUDE.md:13-19](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L13-L19)).
- **Stack:** Node 22 ESM, Express 5, `pg`, `amqplib`, `resend`, `stripe`, `jsdom` ([package.json:17-25](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/package.json#L17-L25)).
- **Datastore:** PostgreSQL 17 database `cream_city_web` on localhost ([README.md:5-14](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L5-L14)).
- **Core tables:** `leads`, `outreach`, `customers`, `sites`, `staging_sites`, `spend`, `suppression_list`, `runs` ([README.md:18-27](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L18-L27)).
- **Lead flow:** `new → qualified → mockup_built → mockup_ready → outreach_sent → responded → interested → converted` ([README.md:31-34](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L31-L34)).
- **Runtime entry:** `npm start` or `systemctl start cream-city-web-server` ([README.md:64-71](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L64-L71)).
- **Outreach status:** BLOCKED until P.O. Box activation + site polish + simulated journey ([CLAUDE.md:104-128](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L104-L128)).

## Who uses it

- **Jeffrey Keyser** — sole proprietor. Approves outreach drafts, handles spend > $20, completes in-person tasks ([CLAUDE.md:172-189](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L172-L189)).
- **Claude (autonomous operator)** — drives every run. Reads `data/state.md`, picks priority work, logs actions, commits, and pushes ([CLAUDE.md:21-95](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L21-L95)).
- **Prospects/customers** — interact via mockup subdomains, outbound emails from `ai@creamcityweb.com`, and Stripe-hosted checkout ([tools.md:28-34](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L28-L34)).

## How work moves through this repo

Each scheduled or ad-hoc trigger spawns a Claude Code session that records a row in `runs`, executes one priority slice (customer commitment → warm follow-up → in-flight build → scouting → tooling), writes a `data/runs/YYYY-MM-DD-HHMM.md` log, finalizes the run, commits, and pushes ([CLAUDE.md:22-95](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L22-L95)).

## Wiki pages

- [Architecture](./architecture/) — internal modules + Mermaid diagram.
- [Iteration Loop](./iteration-loop/) — the run cycle from trigger to push.
- [Services & Dependencies](./services-and-dependencies/) — inbound/outbound integrations.
- [Operations](./operations/) — deploy, runtime, observability.
- [Glossary](./glossary/) — repo-specific terms.
