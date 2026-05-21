---
title: Operations
description: Deploy, runtime, observability, and on-call notes for the Insta Travel Map service.
---

# Operations

## Deploy

- **Frontend**: GitHub Actions builds `client/` and runs the `s3-deploy` composite action — sync to S3 bucket, invalidate CloudFront `/*` ([.github/workflows/ci-cd-pipeline.yml:90-96](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/.github/workflows/ci-cd-pipeline.yml#L90-L96)).
- **Backend**: GitHub Actions POSTs to `BEELINK_DEPLOY_WEBHOOK_URL` with `{repository, ref}` and bearer `BEELINK_DEPLOY_TOKEN`; beelink-deploy pulls main and restarts the systemd unit ([.github/workflows/ci-cd-pipeline.yml:104-113](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/.github/workflows/ci-cd-pipeline.yml#L104-L113), [CLAUDE.md:103-106](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/CLAUDE.md#L103-L106)).
- **Archived path**: AWS Lambda / ECR / Terraform config retired to `terraform/_archive/` — reference only ([README.md:480](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L480)).

## Runtime

- **Process**: `node ./dist/bin/www.js` started by `npm start` ([server/package.json:6](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/package.json#L6)).
- **Systemd unit**: `/etc/systemd/system/insta-travel-map.service` — `User=deploy`, `WorkingDirectory=/opt/insta-travel-map/server`, `Restart=on-failure`, `EnvironmentFile=/opt/insta-travel-map/server/.env` ([README.md:55-72](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L55-L72)).
- **Port**: production `PORT=3002`, exposed only on localhost ([README.md:104](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L104)).
- **Ingress**: Cloudflare Tunnel maps `https://api.jeffreykeyser.net` → `http://localhost:<PORT>` — no inbound firewall ports ([README.md:9](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L9), [README.md:74](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L74)).
- **Startup ordering**: Solo Vault secrets must resolve before config validation and DB pool creation — both `bin/www.ts` and `initializeApp()` enforce this ([server/bin/www.ts:5-17](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/bin/www.ts#L5-L17), [server/app.ts:17-27](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L17-L27)).
- **Graceful shutdown**: SIGTERM/SIGINT close HTTP server within 10s, then force exit ([server/bin/www.ts:80-97](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/bin/www.ts#L80-L97)).

## Observability

- **Health probe**: `GET /health` returns `{status, service, version, timestamp}`; DB health wired via `dal/diagnostics` ([server/app.ts:244-252](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L244-L252), [server/app.ts:356-365](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L356-L365)).
- **Auth health**: `GET /health/auth` tests Pay-service connectivity ([README.md:384-393](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L384-L393)).
- **Logs**: structured JSON in production, text + `dev` morgan format locally; sensitive headers (`authorization`, `cookie`, `x-api-key`) and body fields (`password`, `token`, `secret`, `apiKey`, `creditCard`) redacted ([server/app.ts:167-177](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L167-L177)).
- **Correlation IDs**: `x-request-id` request context enabled, trustProxy on in prod ([server/app.ts:149-153](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L149-L153)).
- **Rate limit**: 100 req/min/IP in prod (500 in dev), `/health` and `/ping` exempt ([server/app.ts:156-164](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L156-L164)).
- **Error reporting**: uncaught route errors logged as `API_ERROR` JSON; `github-error-issues` fires-and-forgets to open a GitHub issue with stack + request metadata ([server/app.ts:296-328](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L296-L328)).
- **API docs**: Swagger UI at `/api-docs`, generated from JSDoc in `routes/**/*.ts` ([README.md:80-86](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L80-L86), [server/app.ts:254-286](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L254-L286)).

## On-call notes

- `EADDRINUSE` on startup → another process holding `PORT` ([server/bin/www.ts:71-74](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/bin/www.ts#L71-L74)).
- `CRITICAL: Pay authentication middleware/routes is missing!` → `setupPayAuth` returned partial result; check Pay package version + network to `PAY_SERVICE_URL` ([server/app.ts:125-136](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L125-L136)).
- `401 unauthenticated` from `npm.pkg.github.com` during install → `GITHUB_TOKEN` unset; see `.npmrc` requirement ([AGENTS.md:24-28](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/AGENTS.md#L24-L28)).
- Production CORS errors → confirm origin is in the allow-list at [server/app.ts:182-203](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L182-L203).
