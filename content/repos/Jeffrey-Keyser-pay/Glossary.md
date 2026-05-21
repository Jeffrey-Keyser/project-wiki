---
title: Glossary
description: Pay-specific terms and where they are defined.
---

# Glossary

**Pay** — this repo: standardized payment + auth backend used by ServerlessWebTemplate and personal web apps ([README.md:1-4](https://github.com/Jeffrey-Keyser/pay/blob/main/README.md#L1-L4)).

**DomainServiceContainer** — singleton that constructs and exposes all domain services and infrastructure adapters; routes pull dependencies through it ([server/services/DomainServiceContainer.ts:49-60](https://github.com/Jeffrey-Keyser/pay/blob/main/server/services/DomainServiceContainer.ts#L49-L60)).

**Port** — provider-agnostic TypeScript interface for an external concern. Defined under `server/ports/` (Email, Storage, Cache, Otp, EventBus, Revocation) ([server/ports](https://github.com/Jeffrey-Keyser/pay/blob/main/server/ports), [CLAUDE.md:175-217](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L175-L217)).

**Adapter** — concrete implementation of a Port (e.g. `NodemailerEmailAdapter`, `S3StorageAdapter`, `RedisAdapter`). Lives under `server/adapters/<concern>/` ([server/adapters](https://github.com/Jeffrey-Keyser/pay/blob/main/server/adapters), [CLAUDE.md:198-217](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L198-L217)).

**PaymentProvider** — generic interface for any payment provider; default implementation is `StripePaymentProvider` ([server/infrastructure/providers](https://github.com/Jeffrey-Keyser/pay/blob/main/server/infrastructure/providers), [CLAUDE.md:144-160](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L144-L160)).

**Guest login** — temporary auth session with `guest:read`/`guest:trial` scope, 24h expiry, IP rate-limited, convertible to full user ([README.md:108-138](https://github.com/Jeffrey-Keyser/pay/blob/main/README.md#L108-L138)).

**Admin token** — long-lived API token issued by `POST /users/admin/generateToken`; revocable via Redis blacklist ([CLAUDE.md:480-501](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L480-L501)).

**API versioning** — URL-path scheme: primary at `/api/v1/*`, legacy unversioned paths 308-redirect to `/api/v1/*`; `API-Version` + `Accept` headers also honored ([CLAUDE.md:53-75](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L53-L75)).

**ActionResponse** — standard success envelope (`ActionResponse.success(...)`) used by route handlers, defined in `pay-api-types` ([CLAUDE.md:711-720](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L711-L720)).

**Correlation ID** — UUID attached to each request by `correlationIdMiddleware`, surfaced on every error response and log line ([CLAUDE.md:758-773](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L758-L773), [server/app.ts:2](https://github.com/Jeffrey-Keyser/pay/blob/main/server/app.ts#L2)).

**pgmigrations** — table that tracks applied migrations from the shared `database-base-config` package ([CLAUDE.md:418-422](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L418-L422)).

**contact schema / billing schema** — PostgreSQL schemas. `contact` holds users, apps, customers, payment_intents; `billing` holds subscriptions, items, usage_events ([CLAUDE.md:457-475](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L457-L475)).

**deploy.sh** — VPS deploy script: pull, install, build, restart systemd `pay` unit ([deploy.sh:1-17](https://github.com/Jeffrey-Keyser/pay/blob/main/deploy.sh#L1-L17)).

**pay-auth-integration** — companion SDK package (separate repo) that downstream apps install to proxy auth UI/middleware through this backend ([CLAUDE.md:443-471](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L443-L471)).
