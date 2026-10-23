---
title: "Operations"
description: "Commands to set up, deploy, and check the homelab, plus observability and what is documented versus verified in this snapshot."
---

# Operations

This repository is a host configuration and operations repo. The excerpts show scripts and service units, not a library API. Nothing here was executed while writing this page.

## Start and setup

- **Host setup:** run `./scripts/setup.sh` as a regular user ([README.md:L100-L101](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L100-L101)).
- **Forge setup:** run `forge/bootstrap.sh` as the regular user over SSH, after the listed prerequisites ([forge/bootstrap.sh:L3-L5](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/bootstrap.sh#L3-L5)).
- **Compose services:** `docker compose up -d` ([docker-compose.yml:L2](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/docker-compose.yml#L2)).
- **Data disk:** `scripts/mount-ssd.sh`, which refuses root ([scripts/mount-ssd.sh:L11-L14](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/scripts/mount-ssd.sh#L11-L14)). It partitions and formats only when the partition is missing ([L21-L32](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/scripts/mount-ssd.sh#L21-L32)).
- **Browser login:** `./install.sh`, then `./open-browser.sh` ([playwright/README.md:L7-L22](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/playwright/README.md#L7-L22)).

## Deploy and ingress

- **Ingress change:** `./scripts/update-cloudflared.sh` ([README.md:L243](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L243)). It restarts cloudflared, which causes a short outage for every hostname ([README.md:L249-L250](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L249-L250)).
- **Agency deploy:** push, then the deploy proxy runs the forge remote deploy ([forge/deploy-proxy/deploy.sh:L5](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/deploy-proxy/deploy.sh#L5)).

## Health and observability

- **Plan-manager shim:** `GET /health` on the shim ([forge/bin/plan-manager-shim.js:L13](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/bin/plan-manager-shim.js#L13)).
- **OpenClaw:** `openclaw gateway status` and `openclaw channels status` ([README.md:L205](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L205), [L222](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L222)).
- **Auth watch:** a timer runs every 3 hours ([forge/systemd/provider-auth-watch.timer:L5-L6](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/systemd/provider-auth-watch.timer#L5-L6)). It supports `--dry-run` and `--test-alert` ([forge/bin/provider-auth-watch.sh:L16](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/bin/provider-auth-watch.sh#L16)). It alerts after two consecutive failures ([L12-L14](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/bin/provider-auth-watch.sh#L12-L14)).
- **Uptime Kuma:** published on host port 3001 ([docker-compose.yml:L26](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/docker-compose.yml#L26)). Cloudflared also maps `apps-api` to port 3001 ([cloudflared/config.yml:L6-L7](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/cloudflared/config.yml#L6-L7)). Which service owns that port is unknown.
- **Netdata:** cloudflared maps a metrics hostname to port 19999 ([cloudflared/config.yml:L141-L143](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/cloudflared/config.yml#L141-L143)).

## Documented versus verified

- The Nix pilot records a local x86_64 Linux check with test counts and timings ([docs/nix-development-pilot.md:L69-L75](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/docs/nix-development-pilot.md#L69-L75)). It does not establish CI or other-platform behavior ([L104-L108](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/docs/nix-development-pilot.md#L104-L108)).
- Current runtime state of any host is unknown from this snapshot.
