---
title: Pay — Overview
description: Standardized payment processing and user authentication backend for personal web applications.
---

# Pay

Pay is standardized backend for JWT authentication, provider-agnostic payment processing, and app/RBAC management, used by personal web app deployments and the ServerlessWebTemplate ([README.md:1-4](https://github.com/Jeffrey-Keyser/pay/blob/main/README.md#L1-L4), [CLAUDE.md:7-9](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L7-L9)).

## At a glance

- Express 5 + TypeScript on Node 20, PostgreSQL + Redis runtime ([server/package.json:5-72](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L5-L72), [CONTRIBUTING.md:9-15](https://github.com/Jeffrey-Keyser/pay/blob/main/CONTRIBUTING.md#L9-L15)).
- Domain-Driven Design — services come from `@jeffrey-keyser/pay-domain-core`, wired in `DomainServiceContainer` ([server/services/DomainServiceContainer.ts:1-34](https://github.com/Jeffrey-Keyser/pay/blob/main/server/services/DomainServiceContainer.ts#L1-L34)).
- Hexagonal ports/adapters for Email, Storage, Cache, OTP, EventBus, Revocation ([server/ports](https://github.com/Jeffrey-Keyser/pay/blob/main/server/ports), [CLAUDE.md:175-217](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L175-L217)).
- Provider-agnostic payments, Stripe as default ([CLAUDE.md:144-160](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L144-L160)).
- URL-path API versioning at `/api/v1/`, legacy paths 308-redirect ([CLAUDE.md:53-75](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L53-L75)).
- Deployed to VPS via systemd `pay.service`, restarted by `deploy.sh` ([deploy.sh:1-17](https://github.com/Jeffrey-Keyser/pay/blob/main/deploy.sh#L1-L17)).
- Centralized types from `@jeffrey-keyser/pay-api-types`, errors from `@jeffrey-keyser/api-errors` ([README.md:5-13](https://github.com/Jeffrey-Keyser/pay/blob/main/README.md#L5-L13), [server/app.ts:2](https://github.com/Jeffrey-Keyser/pay/blob/main/server/app.ts#L2)).

## Who uses it

Downstream consumers are the ServerlessWebTemplate and other personal web apps that authenticate, manage RBAC, and process payments through Pay. `@jeffrey-keyser/pay-auth-integration` is the client/server SDK used by those apps to proxy auth through Pay ([CLAUDE.md:443-471](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L443-L471)).

## How work moves through it

Inbound HTTP hits Express, routes resolve under `/api/v1/*` (with legacy redirects), middleware authenticates and rate-limits, route handlers call services/domain layer, repositories persist via PostgreSQL, Redis caches blacklist/sessions, Stripe handles payments ([server/app.ts:21-37](https://github.com/Jeffrey-Keyser/pay/blob/main/server/app.ts#L21-L37), [server/routes](https://github.com/Jeffrey-Keyser/pay/blob/main/server/routes)).

## Wiki pages

- [Architecture](./architecture/) — module layout, domain container, ports/adapters.
- [Iteration Loop](./iteration-loop/) — how a change moves from edit to merged + deployed.
- [Services and Dependencies](./services-and-dependencies/) — inbound/outbound integrations.
- [Operations](./operations/) — deploy, runtime, observability.
- [Glossary](./glossary/) — repo-specific terms.
