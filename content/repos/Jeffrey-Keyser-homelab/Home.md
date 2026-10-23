---
title: "Homelab Wiki Home"
description: "Overview of the Jeffrey-Keyser homelab: two Beelink hosts, Cloudflare ingress, dev and agent tooling, and where to find details."
---

# Homelab

This repository holds configuration, scripts, and runbooks for a personal home server setup used for remote Claude Code CLI access via Tailscale ([README.md:L3](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L3)). Since 2026-10-18 it describes two hosts ([forge/README.md:L3](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L3)):

- `beelink` (prod): PostgreSQL 17, RabbitMQ, Solo Vault, Pay, user-facing apps, cloudflared ingress, the beelink-deploy webhook, netdata, and nanoclaw ([forge/README.md:L7](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L7)).
- `forge` (dev): dev-inbox, agency-hq on port 3040, agent CLIs, and worktrees ([forge/README.md:L8](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L8)).

## At a glance

- **Ingress:** the tracked `cloudflared/config.yml` is the ingress source of truth ([README.md:L237-L238](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L237-L238)). cloudflared does not hot-reload, so changes require a restart ([README.md:L249](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L249)).
- **Deploy path:** the only path from forge to prod is `git push`, then GitHub, then beelink-deploy ([forge/README.md:L10-L11](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L10-L11)).
- **Hardware:** both hosts are Beelink ME Mini N150 units ([README.md:L13-L14](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L13-L14)).
- **Nix pilot:** a local experiment on two application repositories, with production unchanged ([docs/nix-development-pilot.md:L3-L7](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/docs/nix-development-pilot.md#L3-L7)).

## Who uses it

- **Jeffrey**, the owner, who approved the Nix experiment ([docs/nix-development-pilot.md:L3-L4](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/docs/nix-development-pilot.md#L3-L4)).
- **Milo**, an agent that uses a persistent Playwright browser profile ([playwright/README.md:L3](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/playwright/README.md#L3)).
- **Agent roles** such as dev-inbox and Agency, which the auth watcher alert says would stall on provider failure ([forge/bin/provider-auth-watch.sh:L157](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/bin/provider-auth-watch.sh#L157)).
- **Public hostnames:** the ingress maps many hostnames to local ports ([cloudflared/config.yml:L4-L202](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/cloudflared/config.yml#L4-L202)). Which of these are live is not established by this snapshot.

## Main flow

1. Edit the tracked ingress file and run `./scripts/update-cloudflared.sh` on the host ([README.md:L240-L243](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L240-L243)).
2. Forge setup is idempotent and encodes a parity checklist ([forge/bootstrap.sh:L7](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/bootstrap.sh#L7)).
3. Pushed agency-hq changes reach forge through the deploy proxy ([forge/deploy-proxy/deploy.sh:L5](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/deploy-proxy/deploy.sh#L5)).

## Explore

- [Architecture](../architecture/)
- [Iteration loop](../iteration-loop/)
- [Services and dependencies](../services-and-dependencies/)
- [Operations](../operations/)
- [Glossary](../glossary/)
