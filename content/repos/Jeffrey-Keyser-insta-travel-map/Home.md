---
title: Insta Travel Map
description: Travel request management web app with Instagram integration and Pay authentication, backend hosted on a Beelink homelab.
---

# Insta Travel Map

Production web application for travel request management with Instagram handle integration and Pay-service authentication ([README.md:1-4](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L1-L4)). Backend runs as a systemd service on a Beelink homelab; Cloudflare Tunnel handles public ingress ([README.md:7-12](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L7-L12)).

## At a glance

- **Frontend**: React 19 + Redux Toolkit + Vite, deployed to S3/CloudFront ([client/package.json:29-42](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/client/package.json#L29-L42), [README.md:486-490](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L486-L490)).
- **Backend**: Express 5 + TypeScript Node service built on `@jeffrey-keyser/express-server-factory` ([server/package.json:15-43](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/package.json#L15-L43), [server/app.ts:1-4](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L1-L4)).
- **Auth**: Pay-service integration via `@jeffrey-keyser/pay-auth-integration` pinned to `^6.10.1` ([AGENTS.md:5-13](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/AGENTS.md#L5-L13)).
- **Database**: PostgreSQL on Beelink, session store via `connect-session-sequelize` ([server/app.ts:216-236](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/server/app.ts#L216-L236), [CLAUDE.md:69-72](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/CLAUDE.md#L69-L72)).
- **Public ingress**: Cloudflare Tunnel to `localhost:<PORT>` — no open firewall ports ([README.md:9](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L9), [README.md:74](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L74)).
- **CI/CD**: On push to `main`, GitHub Actions deploys frontend to S3 and POSTs to the beelink-deploy webhook to redeploy backend ([.github/workflows/ci-cd-pipeline.yml:99-113](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/.github/workflows/ci-cd-pipeline.yml#L99-L113)).

## Who uses it

End users submit travel requests tied to their authenticated Pay account and Instagram handle ([README.md:115-122](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L115-L122)). Admin users get a separate dashboard guarded by the `admin` role ([README.md:124-156](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/README.md#L124-L156)).

## How work moves through this repo

Feature branches → PR → CI test suite via the private composite action `node-build` ([.github/workflows/ci-cd-pipeline.yml:10-41](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/.github/workflows/ci-cd-pipeline.yml#L10-L41)) → merge to `main` → parallel frontend (S3/CloudFront) and backend (beelink webhook) deploys ([.github/workflows/ci-cd-pipeline.yml:44-113](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/main/.github/workflows/ci-cd-pipeline.yml#L44-L113)).

## Wiki pages

- [Architecture](./architecture/) — internal layout, server factory wiring, routes/DAL/services.
- [Iteration Loop](./iteration-loop/) — feature change cycle from idea to merge.
- [Services and Dependencies](./services-and-dependencies/) — Pay, AI-proxy, S3/CloudFront, beelink-deploy.
- [Operations](./operations/) — systemd unit, Cloudflare Tunnel, health probes, logs.
- [Glossary](./glossary/) — Pay, ai-proxy, BaseDal, PayUser, beelink-deploy.
