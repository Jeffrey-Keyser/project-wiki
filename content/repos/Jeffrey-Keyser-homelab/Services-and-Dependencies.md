---
title: "Services and Dependencies"
description: "What each homelab service depends on and who consumes it, separating confirmed callers in source from expected or unknown callers."
---

# Services and Dependencies

This page separates relationships confirmed in source from those that are expected or unknown.

## Depends on

- **Agency HQ (forge)** depends on prod services. Explicit environment settings point at prod ([forge/README.md:L15-L16](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L15-L16)). Without them, it falls back to localhost ports ([forge/README.md:L77-L79](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L77-L79)).
- **Agency model inventory** depends on the AI proxy through the bridge. It must use the loopback address, because the Tailscale address returns 401 ([forge/README.md:L22-L24](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L22-L24)).
- **Prod loopback bridge** depends on SSH access to beelink with key-only auth ([forge/systemd/prod-loopback-bridge.service:L8](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/systemd/prod-loopback-bridge.service#L8)).
- **Plan-manager shim** depends on a local openclaw-bridge checkout and the prod bridge for proxied paths ([forge/README.md:L40-L41](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L40-L41)).
- **Provider auth watch** depends on the NanoClaw messages endpoint for alerts ([forge/bin/provider-auth-watch.sh:L22](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/bin/provider-auth-watch.sh#L22)).
- **Cloudflared** depends on a credentials file on the host, which is excluded from Git ([README.md:L237-L238](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L237-L238)).

## Consumed by

**Confirmed in source:**

- **Cloudflared ingress** routes listed hostnames to beelink localhost ports and agency to forge ([cloudflared/config.yml:L155-L157](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/cloudflared/config.yml#L155-L157)).
- **dev-inbox** hardcodes the wake endpoint on 127.0.0.1:3099 ([forge/README.md:L36](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L36)).
- **NanoClaw** prod-side callers reach agency-hq through the socat proxy ([forge/README.md:L42-L44](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/forge/README.md#L42-L44)).
- **Claude Code hook** writes IPC message files for NanoClaw ([dotfiles/claude/hooks/notify-telegram.sh:L47-L55](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/dotfiles/claude/hooks/notify-telegram.sh#L47-L55)).

**Expected or documented, not confirmed here:**

- **Milo** uses the persistent Playwright profile ([playwright/README.md:L44-L57](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/playwright/README.md#L44-L57)). Actual use is unknown from this snapshot.
- **noVNC hostname** maps to port 6080 ([cloudflared/config.yml:L134-L135](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/cloudflared/config.yml#L134-L135)). Whether the Playwright noVNC is the service on that port is unknown.
- **Uptime Kuma** monitoring targets are not in the snapshot.
- **GitHub Actions runner** is documented as a compose service ([README.md:L147](https://github.com/Jeffrey-Keyser/homelab/blob/29fbeff80bda8de0932ee4ffadfa11f873b7cfed/README.md#L147)), but it is not in the provided compose excerpt. Treat it as unknown here.
