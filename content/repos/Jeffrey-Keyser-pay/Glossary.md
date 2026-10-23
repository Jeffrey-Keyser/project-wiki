---
title: "Glossary"
description: "Project-specific Pay terms with source citations for where each term is defined or used."
---

# Glossary

**Pay**: standardized payment and authentication backend for personal web apps ([README.md:3](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L3)).

**DomainServiceContainer**: singleton that builds repositories, providers, and domain services ([server/services/DomainServiceContainer.ts:52-77](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/services/DomainServiceContainer.ts#L52-L77)).

**Port**: provider-agnostic interface for an external concern, such as email or cache ([CLAUDE.md:239-253](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/CLAUDE.md#L239-L253)).

**Adapter**: implementation of a port, selected by a factory and an env variable ([CLAUDE.md:255-270](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/CLAUDE.md#L255-L270)).

**PaymentProvider**: generic payment interface with a Stripe implementation ([docs/PAYMENT_PROVIDER_ABSTRACTION.md:13-16](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/docs/PAYMENT_PROVIDER_ABSTRACTION.md#L13-L16)).

**ProviderCustomerId**: domain value object for a provider's customer identifier, validated without provider-specific format rules ([docs/PAYMENT_PROVIDER_ABSTRACTION.md:37-40](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/docs/PAYMENT_PROVIDER_ABSTRACTION.md#L37-L40)).

**Guest session**: temporary session created by `POST /users/guest`, with a 24-hour expiry and IP rate limiting ([README.md:109-116](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L109-L116), [README.md:123-125](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L123-L125)).

**Guest cleanup run**: a pass that removes expired guests and records a summary for reporting ([server/services/GuestCleanupService.ts:63-91](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/services/GuestCleanupService.ts#L63-L91)).

**Admin token**: long-lived API token with a `type` of `api_key` and system-admin identity ([server/infrastructure/TokenService.ts:284-304](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/infrastructure/TokenService.ts#L284-L304)).

**Service token**: short-lived JWT for headless clients, issued from a shared secret ([docs/service-auth.md:7-9](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/docs/service-auth.md#L7-L9)).

**Scopes claim**: JSON array of registered OAuth scope names added to access tokens ([docs/scopes.md:51-59](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/docs/scopes.md#L51-L59)).

**API versioning**: primary `/api/v1` prefix with legacy redirects ([server/routes/v1/index.ts:27-31](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/routes/v1/index.ts#L27-L31), [CLAUDE.md:56-61](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/CLAUDE.md#L56-L61)).

**ActionResponse**: standard response envelope with `status`, `message`, and `result` ([server/config/swaggerConfig.ts:50-75](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/swaggerConfig.ts#L50-L75)).

**Correlation ID**: request identifier returned in error bodies ([server/app.ts:227-231](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/app.ts#L227-L231)).

**Dependency type**: API field `dependencyType`, mapped from the domain `type` ([server/routes/apps.ts:21-28](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/routes/apps.ts#L21-L28)).

**contact and billing schemas**: PostgreSQL schemas; `contact` holds customers and OAuth scopes, `billing` holds subscriptions ([docs/PROVIDER_AGNOSTIC_MIGRATION.md:22-27](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/docs/PROVIDER_AGNOSTIC_MIGRATION.md#L22-L27), [docs/scopes.md:37](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/docs/scopes.md#L37)).

**deploy.sh**: VPS script that pulls `main`, builds, migrates, and restarts `pay` ([deploy.sh:1-23](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/deploy.sh#L1-L23)).

**pay-auth-integration**: companion package listed as a server dependency ([server/package.json:48](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L48), [README.md:29](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L29)).
