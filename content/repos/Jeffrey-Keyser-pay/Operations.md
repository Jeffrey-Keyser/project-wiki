---
title: "Operations"
description: "How Pay is started, deployed, tested, and checked for health, with documented versus verified runtime details and observability settings."
---

# Operations

Pay is a private Express service, not a library. Its `server` package is marked private and exposes start, build, and test scripts ([server/package.json:2-11](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L2-L11)).

## Commands

- **Dev start:** `npm start` (nodemon with `ts-node ./bin/www.ts`) ([server/package.json:9](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L9)).
- **Production start:** `npm run start:prod` runs build then `node dist/src/bin/www.js` ([server/package.json:10](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L10)). The tsconfig sets `outDir` to `./dist` with `rootDir` `./` ([server/tsconfig.json:6-7](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/tsconfig.json#L6-L7)), so the compiled entry path is unverified.
- **Deploy:** `./deploy.sh`, which requires `NODE_AUTH_TOKEN` (see [Deploy target](#deploy-target)) ([deploy.sh:1-23](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/deploy.sh#L1-L23)).
- **Tests:** `npm test` (Jest), `npm run test:integration` and `npm run test:docker` (Vitest and Docker Compose) ([server/package.json:11-15](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L11-L15)).
- **Checks:** `npm run lint` and `npm run build` ([server/package.json:8](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L8), [server/package.json:16](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L16)).

## Deploy target

- The documented target is a systemd service named `pay` on a VPS ([README.md:184-185](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L184-L185), [deploy.sh:22](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/deploy.sh#L22)).
- `deploy.sh` pulls `main`, installs dev dependencies, builds, runs `migrate:local`, and restarts `pay` ([deploy.sh:5-22](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/deploy.sh#L5-L22)).
- **Registry token:** `deploy.sh` exits before `npm install` unless `NODE_AUTH_TOKEN` is set, either exported or in `~/.pay-deploy.env` on the host. The running service is not touched in that case ([deploy.sh:10-18](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/deploy.sh#L10-L18)). `server/.npmrc` reads the same variable ([server/.npmrc](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/server/.npmrc)).
- **Port:** unknown. `www.ts` reads `PORT` and falls back to `80` ([server/bin/www.ts:21](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/bin/www.ts#L21)), while the env schema defaults to `3000` ([server/config/env.ts:44-47](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/env.ts#L44-L47)). `deploy.sh` frees TCP 3017 ([deploy.sh:20](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/deploy.sh#L20)), but the unit file is not in this snapshot, so the live port is not verified.

## Secrets and production configuration

- Production configuration should come from the environment, for example a systemd `EnvironmentFile`, rather than `server/.env`. In this snapshot `server/.env` is still tracked in git; the runbook describes moving it out first ([docs/SECURITY_REMEDIATION_RUNBOOK.md](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/docs/SECURITY_REMEDIATION_RUNBOOK.md)).
- `JWT_SECRET` and `REFRESH_TOKEN_SECRET` use their published placeholder values only as development defaults. When `NODE_ENV=production`, startup throws if either still holds a placeholder; in development it logs a warning ([server/config/env.ts](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/server/config/env.ts)).

## Health checks

- `GET /ping` returns `pong` ([server/routes/index.ts:54-56](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/routes/index.ts#L54-L56)).
- `GET /health` runs `SELECT version()` and reports memory and event-loop lag; failure returns an error response ([server/routes/index.ts:80-108](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/routes/index.ts#L80-L108)).
- `GET /health/redis` writes and reads a temporary key ([server/routes/index.ts:139-176](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/routes/index.ts#L139-L176)).
- The same index router is mounted under `/api/v1` ([server/routes/v1/index.ts:36-37](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/routes/v1/index.ts#L36-L37)).

## Observability

- **Logs:** pino-http logs requests ([server/app.ts:148](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/app.ts#L148)). Log destination is not in the excerpts.
- **Unhandled rejections:** a process-level handler in `bin/www.ts` logs them through the pino logger, so a stray rejection does not exit the process ([server/bin/www.ts](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/server/bin/www.ts)).
- **Tracing:** tracing loads first in `www.ts` ([server/bin/www.ts:10](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/bin/www.ts#L10)), but is off by default ([server/config/env.ts:241-244](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/env.ts#L241-L244)). The exporter defaults to console ([server/config/env.ts:245-248](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/env.ts#L245-L248)).
- **Correlation IDs:** attached to requests and included in error bodies ([server/app.ts:139](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/app.ts#L139), [server/app.ts:230](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/app.ts#L230)).
- **Error stacks:** included only in development ([server/app.ts:46-48](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/app.ts#L46-L48)).

## Rollback

- **Database:** `npm run migrate:down` rolls back the last migration ([server/package.json:21](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L21)).
- **Code:** no rollback script is in the snapshot. Reverting on `main` and rerunning `deploy.sh` is the implied path ([deploy.sh:5](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/deploy.sh#L5)).

## Documented versus verified

Legacy AWS Lambda and Terraform are documented as a fallback ([README.md:187-195](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L187-L195)). Their files are not in this snapshot, so they are not verified as deployed.

Operator steps for the security remediation (revoking committed tokens, moving secrets out of git, the deploy registry token, and behaviour changes) are in [docs/SECURITY_REMEDIATION_RUNBOOK.md](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/docs/SECURITY_REMEDIATION_RUNBOOK.md). This snapshot does not show whether those steps have been completed.
