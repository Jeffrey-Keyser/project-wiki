---
title: "Services and Dependencies"
description: "Confirmed upstream dependencies and consumers of Life, with unknown or expected callers clearly marked."
---

# Services and Dependencies

Life is an application, not a library. It depends on several services and has a small set of confirmed callers. Entries below are labeled as confirmed, documented, or unknown.

## Depends on

### Pay SSO (confirmed)

- Server config reads `PAY_SERVICE_URL` into `payServiceUrl`, with a default ([server/config/env.ts:220](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/config/env.ts#L220)).
- The user routes build Pay API URLs from that config ([server/routes/users.ts:20-21](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/users.ts#L20-L21)).
- The client uses `VITE_PAY_URL` ([client/src/config/payAuth.ts:4](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/client/src/config/payAuth.ts#L4)).

### AI Proxy (confirmed in code)

- Transcription and chat requests go to `AI_PROXY_URL` with a bearer key ([server/services/aiProxy.ts:119](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/services/aiProxy.ts#L119), [server/services/aiProxy.ts:144-147](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/services/aiProxy.ts#L144-L147)).
- The shared key can be hydrated from a secrets file on the host. Only `AI_PROXY_API_KEY` is read from it ([server/config/env.ts:84](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/config/env.ts#L84), [docs/DEPLOYMENT.md:37-45](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/docs/DEPLOYMENT.md#L37-L45)).

### Struct analysis service (confirmed in code)

- `STRUCT_URL` is used for voice structuring, edge explanations, synopses, and insights ([server/config/env.ts:227](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/config/env.ts#L227), [server/services/voiceEntry.ts:244](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/services/voiceEntry.ts#L244), [server/services/personSynopsis.service.ts:67](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/services/personSynopsis.service.ts#L67), [server/services/search.service.ts:175](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/services/search.service.ts#L175)).
- Deployment status of this service is unknown from these excerpts.

### PostgreSQL (confirmed)

- The server uses `pg` through a connection pool. The health route runs a query against it ([server/routes/health.ts:60](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/health.ts#L60)).
- Schema and procedures are applied from `server/db` ([docs/DEPLOYMENT.md:79-85](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/docs/DEPLOYMENT.md#L79-L85)).

### Object storage (confirmed in code)

- The storage factory supports only the `s3` provider ([server/services/storage/index.ts:9-12](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/services/storage/index.ts#L9-L12)). The bucket and region are configurable ([server/config/env.ts:235-236](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/config/env.ts#L235-L236)).

### Local embedding model (confirmed in code)

- Synopsis vectors come from `Xenova/bge-small-en-v1.5` ([server/embed/index.ts:4](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/embed/index.ts#L4)). Deploy prepares it ([deploy.sh:13-15](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/deploy.sh#L13-L15)).

### Feedback Registry (confirmed in code)

- The feedback route forwards submissions to an external API ([server/routes/feedback.ts:20](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/feedback.ts#L20)). It sends a bearer key only when one is configured ([server/routes/feedback.ts:63-65](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/feedback.ts#L63-L65)).

### GitHub error reporting (confirmed in code, production-gated)

- The error middleware is enabled only when `NODE_ENV` is production ([server/app.ts:117-123](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/app.ts#L117-L123)).

### Solo Vault (confirmed in code, optional)

- At startup the server loads selected secrets from a local vault URL when `SOLO_VAULT_KEY` is set. Otherwise it logs a warning and uses `.env` ([server/config/vault.ts:1](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/config/vault.ts#L1), [server/config/vault.ts:27-32](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/config/vault.ts#L27-L32)).

## Consumed by

### Browser clients (confirmed)

- The client calls the API base from `VITE_API_URL` ([client/src/config/api.ts:2](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/client/src/config/api.ts#L2)).
- Share readers call the unauthenticated public routes ([server/app.ts:110](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/app.ts#L110)).

### Smoke script (documented caller)

- The post-deploy smoke test calls the production voice transcribe route with a token and audio fixture ([docs/DEPLOYMENT.md:53-58](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/docs/DEPLOYMENT.md#L53-L58)).

### beelink-deploy webhook (documented, not verified)

- The docs say GitHub pushes trigger this listener, which runs `./deploy.sh` ([docs/DEPLOYMENT.md:24](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/docs/DEPLOYMENT.md#L24)). Its code is not in the excerpts.

### Unknown or expected callers

- **Health probes**: a load balancer, uptime monitor, or Cloudflare check may call `/health`. No such configuration is in the excerpts ([server/app.ts:97](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/app.ts#L97)).
- **Other Jeffrey-Keyser services** calling Life's API are not confirmed by any excerpt.
- **Pay** is a relying party on Life's side only. See the Pay guide: https://wiki.jeffreykeyser.net/repos/jeffrey-keyser-pay/home/
