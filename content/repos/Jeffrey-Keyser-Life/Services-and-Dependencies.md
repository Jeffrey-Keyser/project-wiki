---
title: Services and Dependencies
description: Inbound and outbound integrations of the Life repo — Pay SSO, AI Proxy, PostgreSQL, S3, GitHub, and the systems that consume Life.
---

# Services and Dependencies

Life is a leaf application — it consumes several Jeffrey-Keyser services and external SaaS, and is consumed only by the end user's browser (and the deploy webhook on the host).

## Depends on

### Inbound auth — Pay SSO

- Library: `@jeffrey-keyser/pay-auth-integration` v6.10.1 on the client, v6.9.0 on the server ([client/package.json:7](https://github.com/Jeffrey-Keyser/Life/blob/master/client/package.json#L7), [server/package.json:24](https://github.com/Jeffrey-Keyser/Life/blob/master/server/package.json#L24)).
- `payAuthMiddleware.ts` validates every authenticated request against `PAY_SERVICE_URL` and auto-provisions a local user on first login ([CLAUDE.md:155-159](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L155-L159)).
- The frontend is configured with `VITE_PAY_URL` at build time, baked into the bundle ([README.md:65-67](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L65-L67)).

### AI Proxy (Whisper + GPT-4o-mini)

- All transcription and structuring calls go through the AI Proxy service via `server/services/aiProxy.ts`; the server holds no OpenAI key directly ([README.md:84-85](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L84-L85)).
- Configured via `AI_PROXY_URL` and `AI_PROXY_API_KEY` in `server/.env`, with a fallback hydration path from `/etc/ai-proxy/secrets.env` on the beelink host ([CLAUDE.md:163-167](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L163-L167), [docs/DEPLOYMENT.md:35-47](https://github.com/Jeffrey-Keyser/Life/blob/master/docs/DEPLOYMENT.md#L35-L47)).

### PostgreSQL

- Driver: `pg` v8 ([server/package.json:42](https://github.com/Jeffrey-Keyser/Life/blob/master/server/package.json#L42)).
- Two schemas — `public` (journals, entries, persons, tags, edges, images) and `life` (user mapping with `pay_uuid` → local user id) ([CLAUDE.md:118-141](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L118-L141)).
- Session storage uses `connect-pg-simple` against the same database ([server/package.json:29](https://github.com/Jeffrey-Keyser/Life/blob/master/server/package.json#L29)).
- Schema lifecycle is `server/db/deploy.sh`: `schema/` → `migrations/` → `stored_procedures/` ([docs/DEPLOYMENT.md:77-85](https://github.com/Jeffrey-Keyser/Life/blob/master/docs/DEPLOYMENT.md#L77-L85)).

### S3 (audio + images)

- `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` ([server/package.json:21-22](https://github.com/Jeffrey-Keyser/Life/blob/master/server/package.json#L21-L22)).
- Used for journal entry audio and the `journal_entry_image` records that keep S3 keys and dominant colors in the DB ([CLAUDE.md:140](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L140)).

### Local embedding model

- `@xenova/transformers` runs an embedding model locally for synopsis vectors; the deploy script primes it idempotently via `scripts/prepare-models.ts` ([server/package.json:27](https://github.com/Jeffrey-Keyser/Life/blob/master/server/package.json#L27), [deploy.sh:13-15](https://github.com/Jeffrey-Keyser/Life/blob/master/deploy.sh#L13-L15)).
- Synopsis embeddings are backfilled on every deploy via `scripts/backfill-embeddings.ts` (no-op when caught up) ([deploy.sh:29-31](https://github.com/Jeffrey-Keyser/Life/blob/master/deploy.sh#L29-L31)).

### GitHub (error issues)

- `@jeffrey-keyser/github-error-issues` opens GitHub Issues for production exceptions; controlled by `GITHUB_TOKEN`/`GITHUB_REPO` and a `NODE_ENV === "production"` gate ([server/app.ts:117-123](https://github.com/Jeffrey-Keyser/Life/blob/master/server/app.ts#L117-L123)).

### UI kit and editor

- `@jeffrey-keyser/personal-ui-kit` for primitives, `@jeffrey-keyser/feedback-widget` for in-app feedback, TipTap (`@tiptap/*`) for the rich-text editing surface used in deeper edit views, Cytoscape for graphs ([client/package.json:6-23](https://github.com/Jeffrey-Keyser/Life/blob/master/client/package.json#L6-L23)).

### Frameworks

- Server: Express 5 + TypeScript 5 ([server/package.json:34](https://github.com/Jeffrey-Keyser/Life/blob/master/server/package.json#L34), [server/package.json:79](https://github.com/Jeffrey-Keyser/Life/blob/master/server/package.json#L79)).
- Client: React 19 + Vite 6 + Redux Toolkit 2 ([client/package.json:27-31](https://github.com/Jeffrey-Keyser/Life/blob/master/client/package.json#L27-L31), [client/package.json:84](https://github.com/Jeffrey-Keyser/Life/blob/master/client/package.json#L84)).

## Consumed by

### End-user browsers

- Public frontend at `https://life.jeffreykeyser.net`, public API at `https://life-api.jeffreykeyser.net`, both fronted by Cloudflare Tunnel ([docs/DEPLOYMENT.md:8-12](https://github.com/Jeffrey-Keyser/Life/blob/master/docs/DEPLOYMENT.md#L8-L12)).
- Voice capture requires `getUserMedia` and so requires HTTPS or `localhost` ([README.md:58](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L58)).

### beelink-deploy webhook

- The deploy listener consumes GitHub push events on `master` and runs `./deploy.sh` on the host ([CLAUDE.md:79-83](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L79-L83), [docs/DEPLOYMENT.md:21-25](https://github.com/Jeffrey-Keyser/Life/blob/master/docs/DEPLOYMENT.md#L21-L25)).

### Pay SSO (downstream relationship)

- Life is a Pay relying-party; it does not expose endpoints that Pay calls back. See the Pay wiki at `https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-pay/` for the auth flow's other side.
