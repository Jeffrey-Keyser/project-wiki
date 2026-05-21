---
title: Glossary
description: Repo-specific terms used throughout the Insta Travel Map codebase and docs.
---

# Glossary

**Pay service** — External authentication and user-management service at `https://pay.jeffreykeyser.net`. Insta Travel Map proxies session/JWT validation to it via `@jeffrey-keyser/pay-auth-integration` rather than storing user records locally ([CLAUDE.md:46-53](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/CLAUDE.md#L46-L53), [server/app.ts:93](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L93)).

**PayUser** — Type imported from `@jeffrey-keyser/pay-api-types`, extending the standard user with Pay-specific fields like `instagramHandle` and `roles`. Available on `req.user` after auth middleware runs ([CLAUDE.md:101](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/CLAUDE.md#L101), [README.md:163-166](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L163-L166)).

**Solo Vault** — Secret-store the server fetches bootstrap secrets from at startup (DATABASE_PASSWORD, SESSION_SECRET, JWT_SECRET, AI_PROXY_APP_ID). Loading is gated by `SOLO_VAULT_API_KEY` in `.env` and must complete before config validation ([server/bin/www.ts:5-17](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/bin/www.ts#L5-L17), [server/app.ts:49-51](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L49-L51)).

**ai-proxy** — Ecosystem proxy at `https://ai-proxy-api.jeffreykeyser.net/api/v1/proxy/openai/chat/completions` that all AI calls must route through; direct use of the `openai` SDK is forbidden. Auth via `X-App-Id` header set to `AI_PROXY_APP_ID` ([CLAUDE.md:215-237](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/CLAUDE.md#L215-L237)).

**BaseDal** — Data Access Layer base class. Concrete DALs extend it for transaction support (`withTransaction`) and parameterized raw SQL execution ([CLAUDE.md:175-180](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/CLAUDE.md#L175-L180)).

**beelink-deploy** — Webhook service running on the Beelink homelab that GitHub Actions calls on push to `main`; it pulls latest code and restarts the `insta-travel-map` systemd service ([.github/workflows/ci-cd-pipeline.yml:104-113](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/.github/workflows/ci-cd-pipeline.yml#L104-L113), [CLAUDE.md:103-106](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/CLAUDE.md#L103-L106)).

**Beelink** — Mini-PC homelab host that runs the backend systemd service, PostgreSQL, and beelink-deploy. Public ingress reaches it via Cloudflare Tunnel ([README.md:7-12](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L7-L12)).

**Cloudflare Tunnel** — Outbound-only tunnel exposing the Beelink server on `https://api.jeffreykeyser.net` without opening inbound firewall ports ([README.md:9](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L9), [README.md:74](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L74)).

**Travel request** — Core domain object — a user-submitted travel itinerary tied to a PayUser id and Instagram handle. Endpoints under `/api/v1/travel-requests` ([server/routes/travel-requests.ts](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/routes/travel-requests.ts), [README.md:115-122](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L115-L122)).

**Access request** — Pre-auth public flow letting users request access before having a Pay account. Routes are explicitly added to the `publicRoutes` allow-list ([server/app.ts:103-106](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L103-L106)).

**`agents:verify` block** — Machine-extracted bash block in `AGENTS.md` between `<!-- agents:verify -->` markers; postflight-verify.sh runs it in worker worktrees to gate completion ([AGENTS.md:32-52](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/AGENTS.md#L32-L52)).

**PayAuth singleton** — Repo invariant: exactly one `new PayAuth(...)` site per app to avoid token-write races. Multiple instances fail verification ([AGENTS.md:13-14](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/AGENTS.md#L13-L14), [AGENTS.md:46-47](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/AGENTS.md#L46-L47)).
