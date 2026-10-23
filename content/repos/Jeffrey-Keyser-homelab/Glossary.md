---
title: "Glossary"
description: "Project-specific homelab terms such as prod, forge, dev-inbox, loopback bridge, and immutable deploy, each with a source citation."
---

# Glossary

- **Prod (beelink):** the production host for data, apps, and ingress ([README.md:L5](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L5)).
- **Forge:** the dev host, also called `forge`, for dev-inbox, agency-hq, and agent CLIs ([forge/README.md:L1](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L1), [L8](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L8)).
- **Ingress source of truth:** the tracked `cloudflared/config.yml` ([README.md:L237](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L237)).
- **beelink-deploy:** the deploy webhook on prod ([forge/README.md:L7](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L7)).
- **Immutable worktree deploy:** a release worktree keyed by commit SHA ([forge/bin/agency-hq-remote-deploy.sh:L10-L11](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/bin/agency-hq-remote-deploy.sh#L10-L11)).
- **Prod loopback bridge:** an SSH session that forwards prod ports onto forge localhost ([forge/README.md:L17-L19](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L17-L19)).
- **Plan-manager shim:** the forge service on 127.0.0.1:3099 that serves wake routes and proxies the rest to prod ([forge/bin/plan-manager-shim.js:L2-L4](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/bin/plan-manager-shim.js#L2-L4)).
- **Agency proxy:** the prod socat relay on port 3040 to forge ([forge/prod-side/agency-hq-forge-proxy.service:L1](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/prod-side/agency-hq-forge-proxy.service#L1)).
- **Model inventory:** the Agency HQ setting that points the AI proxy status URL at loopback ([forge/README.md:L22-L23](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L22-L23)).
- **Parity checklist:** known forge setup traps recorded from earlier debugging ([forge/README.md:L61](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L61)).
- **Provider auth watch:** a probe of agent CLI auth that alerts through NanoClaw ([forge/bin/provider-auth-watch.sh:L2-L3](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/bin/provider-auth-watch.sh#L2-L3)).
- **NanoClaw:** the messaging component on prod that receives alerts and IPC files ([forge/README.md:L7](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L7), [dotfiles/claude/hooks/notify-telegram.sh:L5](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/dotfiles/claude/hooks/notify-telegram.sh#L5)).
- **Milo:** the agent that uses the persistent Playwright profile ([playwright/README.md:L3](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/playwright/README.md#L3)).
- **Nix pilot:** the local pinned-toolchain experiment for Prompt Registry and Spanish Studio ([docs/nix-development-pilot.md:L3-L4](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/docs/nix-development-pilot.md#L3-L4), [L11-L12](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/docs/nix-development-pilot.md#L11-L12)).
