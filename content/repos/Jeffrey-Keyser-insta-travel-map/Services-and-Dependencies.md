---
title: Services and Dependencies
description: Inbound and outbound integrations — Pay auth, ai-proxy, S3/CloudFront, beelink-deploy, GitHub.
---

# Services and Dependencies

## Depends on

### Internal Jeffrey-Keyser packages
- `@jeffrey-keyser/pay-auth-integration` `^6.10.1` — server-side `setupPayAuth` + client-side `usePayAuth`. Version pin enforced; private subpaths forbidden ([server/package.json:22](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/package.json#L22), [client/package.json:8](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/client/package.json#L8), [AGENTS.md:5-19](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/AGENTS.md#L5-L19)).
- `@jeffrey-keyser/express-server-factory` — server bootstrap factory ([server/package.json:19](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/package.json#L19)).
- `@jeffrey-keyser/express-middleware-suite` — shared middleware ([server/package.json:18](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/package.json#L18)).
- `@jeffrey-keyser/database-base-config` — PG pool + session table management ([server/package.json:17](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/package.json#L17)).
- `@jeffrey-keyser/api-errors` — error response shape ([server/package.json:16](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/package.json#L16)).
- `@jeffrey-keyser/github-error-issues` — auto-opens GitHub issues on runtime errors ([server/package.json:20](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/package.json#L20), [server/app.ts:5-8](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L5-L8)).
- `@jeffrey-keyser/pay-api-types` — typed Pay-service contracts ([server/package.json:21](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/package.json#L21)).
- `@jeffrey-keyser/personal-ui-kit`, `@jeffrey-keyser/redux-app-toolkit`, `@jeffrey-keyser/feedback-widget` — client UI/state primitives ([client/package.json:7-11](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/client/package.json#L7-L11)).

### Third-party runtime
- Express 5, `express-session`, `cookie-parser`, `cors`, `helmet`-equivalent via factory ([server/package.json:26-34](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/package.json#L26-L34)).
- `pg` + `connect-session-sequelize` for PG-backed sessions ([server/package.json:26](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/package.json#L26), [server/package.json:39](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/package.json#L39)).
- `swagger-jsdoc` + `swagger-ui-express` for `/api-docs` ([server/package.json:41-42](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/package.json#L41-L42)).
- React 19, Redux Toolkit, react-leaflet, Stripe Elements, react-i18next, Vite ([client/package.json:29-42](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/client/package.json#L29-L42)).

### External services
- **Pay service** at `https://pay.jeffreykeyser.net` — issues sessions/JWTs, source of `PayUser` ([server/app.ts:93](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L93), [CLAUDE.md:46-53](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/CLAUDE.md#L46-L53)).
- **Solo Vault** — bootstrap secrets (DATABASE_PASSWORD, SESSION_SECRET, JWT_SECRET, AI_PROXY_APP_ID) loaded via `loadVaultSecrets()` ([server/app.ts:49-51](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L49-L51), [CLAUDE.md:225](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/CLAUDE.md#L225)).
- **ai-proxy** at `https://ai-proxy-api.jeffreykeyser.net` — all AI/LLM traffic routes here, not direct OpenAI. Auth via `X-App-Id: $AI_PROXY_APP_ID` ([CLAUDE.md:215-237](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/CLAUDE.md#L215-L237)).
- **GitHub Packages** — registry for `@jeffrey-keyser/*` packages; install requires `GITHUB_TOKEN` ([AGENTS.md:21-29](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/AGENTS.md#L21-L29)).
- **AWS S3 + CloudFront** — frontend hosting ([README.md:486-490](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L486-L490)).
- **beelink-deploy** webhook — backend redeploy trigger ([.github/workflows/ci-cd-pipeline.yml:104-113](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/.github/workflows/ci-cd-pipeline.yml#L104-L113)).
- **Stripe** — payment processing via Stripe Elements ([client/package.json:13-14](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/client/package.json#L13-L14), [CLAUDE.md:38](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/CLAUDE.md#L38)).

## Consumed by

- **End users** via `https://travel.jeffreykeyser.net` (CORS allow-list) calling `https://api.jeffreykeyser.net` ([server/app.ts:182-203](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L182-L203)).
- **Pay service** — calls back into `/auth` flows during login redirect ([server/app.ts:189](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L189), [server/app.ts:288-292](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L288-L292)).
- **github-error-issues service** consumes 5xx error events emitted from the error handler ([server/app.ts:312-327](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L312-L327)).
- **Swagger UI consumers** at `/api-docs` ([README.md:80-82](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L80-L82)).

No upstream Jeffrey-Keyser app currently imports this repo as a library — it ships as a standalone product surface.
