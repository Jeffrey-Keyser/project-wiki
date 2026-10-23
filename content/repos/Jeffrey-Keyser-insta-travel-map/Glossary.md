---
title: "Glossary"
description: "Project-specific terms used in the Insta Travel Map codebase, with source citations."
---

# Glossary

**Pay service**: External auth and user service. The server reads its URL from `PAY_SERVICE_URL`, defaulting to `https://pay.jeffreykeyser.net` ([server/config/env.ts:L103-L104](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/config/env.ts#L103-L104)).

**PayUser**: Pay-auth user type on the server, imported from `@jeffrey-keyser/pay-auth-integration` and placed on `req.user` ([server/types/express.d.ts:L6](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/types/express.d.ts#L6), [server/types/express.d.ts:L17](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/types/express.d.ts#L17)). The client declares its own shape with `id`, `email`, `roles`, and related fields ([client/src/types/app.ts:L31-L38](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/src/types/app.ts#L31-L38)).

**PayAuth singleton**: Repo rule that a single `new PayAuth(...)` site exists per app, enforced by the verify block ([AGENTS.md:L17](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/AGENTS.md#L17), [AGENTS.md:L45-L46](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/AGENTS.md#L45-L46)).

**`agents:verify` block**: Marked bash block in `AGENTS.md` that a dev-inbox script extracts and runs ([AGENTS.md:L33-L35](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/AGENTS.md#L33-L35)).

**Solo Vault**: Secret store. The server uses `SOLO_VAULT_API_KEY` as the bootstrap credential, then loads required secrets such as `DATABASE_PASSWORD` into the environment ([server/config/vault.ts:L8-L9](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/config/vault.ts#L8-L9), [server/config/vault.ts:L26](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/config/vault.ts#L26)).

**ai-proxy**: Required route for AI calls, at `https://ai-proxy-api.jeffreykeyser.net`, authenticated with the `X-App-Id` header ([CLAUDE.md:L222-L225](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/CLAUDE.md#L222-L225)).

**BaseDal**: DAL base class described in CLAUDE.md for transactions and parameterized SQL. It is not present in the provided excerpts ([CLAUDE.md:L95](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/CLAUDE.md#L95)).

**Beelink**: Mini PC homelab that the README names as the backend host ([README.md:L4](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/README.md#L4)).

**beelink-deploy**: Webhook that CI calls on pushes to `main`. CI sends `{repository, ref}` with a bearer token ([.github/workflows/ci-cd-pipeline.yml:L105-L113](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/.github/workflows/ci-cd-pipeline.yml#L105-L113)). What the webhook does on the host is documented in CLAUDE.md ([CLAUDE.md:L154-L158](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/CLAUDE.md#L154-L158)).

**Cloudflare Tunnel**: Public ingress that the README says routes to the local server without open ports ([README.md:L9](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/README.md#L9)).

**Travel request**: A user's map pin with a note and an optional Instagram handle, stored in `travel.travel_requests` ([server/services/TravelRequestService.ts:L116-L121](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/services/TravelRequestService.ts#L116-L121), [server/services/TravelRequestService.ts:L40-L41](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/services/TravelRequestService.ts#L40-L41)).

**Access request**: Public flow that creates an ACL entry through the Pay service by handle ([server/routes/access-requests.ts:L71](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/routes/access-requests.ts#L71)). The `pending` status is mapped to `requested` for clients ([server/routes/access-requests.ts:L179](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/routes/access-requests.ts#L179)).

**ACL status**: The client uses `requested`, `allowed`, and `blocked` ([client/src/containers/AdminAcl.tsx:L14-L15](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/src/containers/AdminAcl.tsx#L14-L15)). The local `instagram_acl` schema uses `allowed` and `blocked` ([server/db/schema/01_create_instagram_acl.sql:L5](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/db/schema/01_create_instagram_acl.sql#L5)). Its runtime use is unknown.

**PayProxyClient**: Pay-package client that proxies customer and payment calls for the `/api/v1/customers` routes ([server/routes/payment.ts:L2-L4](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/routes/payment.ts#L2-L4)).

**ServerConfigV2**: The factory config type that `server/app.ts` populates ([server/app.ts:L3](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/app.ts#L3)).

**Legacy `/v1` redirect**: Middleware that sends `/v1/*` requests to `/api/v1/*` with a 301 ([server/middleware/versioning.ts:L58-L62](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/middleware/versioning.ts#L58-L62)).

**`ig_auth_token`**: Cookie name used by a session-renew route that signs tokens with `JWT_SECRET`. The route is not mounted in the visible routers, so its status is unknown ([server/routes/session/renew.ts:L25](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/routes/session/renew.ts#L25), [server/routes/session/renew.ts:L32](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/routes/session/renew.ts#L32)).
