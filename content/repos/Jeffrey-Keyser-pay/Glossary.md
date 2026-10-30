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

**Payment ownership**: check that a provider customer, subscription, or payment intent belongs to the authenticated user. A resource owned by someone else is reported as not found ([server/services/PaymentOwnershipService.ts](https://github.com/Jeffrey-Keyser/pay/blob/3691e055cf05ba49dd332e6125b4f11e7497eb09/server/services/PaymentOwnershipService.ts)).

**pay_user_id**: metadata key Pay stamps on payment intents to record the creating user. Client metadata cannot override it ([server/services/PaymentOwnershipService.ts](https://github.com/Jeffrey-Keyser/pay/blob/3691e055cf05ba49dd332e6125b4f11e7497eb09/server/services/PaymentOwnershipService.ts), [server/routes/payment/intents.ts](https://github.com/Jeffrey-Keyser/pay/blob/3691e055cf05ba49dd332e6125b4f11e7497eb09/server/routes/payment/intents.ts)).

**Public catalog**: anonymous `GET /apps?visibility=public` listing of active EXTERNAL apps. The portfolio site hostnames (`jeffreykeyser.net` and `www.jeffreykeyser.net`) are omitted from this listing; registry rows are unchanged. Every other app registry request requires an admin token ([server/services/AppService.ts](https://github.com/Jeffrey-Keyser/pay/blob/1a5021a08cd2507dbb6bba7ccc6b5ba02bcef3c2/server/services/AppService.ts), [server/routes/apps.ts](https://github.com/Jeffrey-Keyser/pay/blob/1a5021a08cd2507dbb6bba7ccc6b5ba02bcef3c2/server/routes/apps.ts), [server/routes/apps.ts:22-36](https://github.com/Jeffrey-Keyser/pay/blob/3691e055cf05ba49dd332e6125b4f11e7497eb09/server/routes/apps.ts#L22-L36)).

**Stripe webhook active-owner exclusion**: per-event guard that lets one Stripe delivery of an event hold ownership at a time. A competing delivery of the same event fails closed with a retryable 409 or 500 and does not run handlers. It is a PostgreSQL advisory session lock on a guard pool, documented in [docs/STRIPE_WEBHOOK_OWNERSHIP.md](https://github.com/Jeffrey-Keyser/pay/blob/1a5021a08cd2507dbb6bba7ccc6b5ba02bcef3c2/docs/STRIPE_WEBHOOK_OWNERSHIP.md) and implemented in [server/services/StripeWebhookOwnership.ts](https://github.com/Jeffrey-Keyser/pay/blob/1a5021a08cd2507dbb6bba7ccc6b5ba02bcef3c2/server/services/StripeWebhookOwnership.ts).

**Guest session**: temporary session created by `POST /users/guest`, with a 24-hour expiry and IP rate limiting ([README.md:109-116](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L109-L116), [README.md:123-125](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L123-L125)).

**Guest cleanup run**: a pass that removes expired guests and records a summary for reporting ([server/services/GuestCleanupService.ts:63-91](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/services/GuestCleanupService.ts#L63-L91)).

**Admin token**: API token with a `type` of `api_key` and system-admin identity, which is the credential the app registry routes require. Every admin token has a `jti` for revocation and always expires: the default is 30 days and the maximum is 365 days. Tokens minted before this change without an `exp` claim keep working until revoked ([server/infrastructure/TokenService.ts](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/server/infrastructure/TokenService.ts)). Admin tokens cannot mint or revoke tokens themselves: those routes require a signed-in user session (`requireUserSession`) and return `403 USER_SESSION_REQUIRED` for API tokens ([server/routes/users/admin.ts](https://github.com/Jeffrey-Keyser/pay/blob/b8012e55990bc34ead37bafdd471c1fd075df301/server/routes/users/admin.ts), [server/middleware/authMiddleware.ts](https://github.com/Jeffrey-Keyser/pay/blob/b8012e55990bc34ead37bafdd471c1fd075df301/server/middleware/authMiddleware.ts)). A token minted through `POST /users/admin/generateToken` records the minting admin's user id as `createdBy`, rather than the earlier fixed `system` value ([server/routes/users/admin.ts:118-121](https://github.com/Jeffrey-Keyser/pay/blob/48044f710fc8e7bb1d335a3b3b256d916a3f5b27/server/routes/users/admin.ts#L118-L121)).

**Service token**: short-lived JWT for headless clients, issued from a shared secret ([docs/service-auth.md:7-9](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/docs/service-auth.md#L7-L9)). Each token carries a fingerprint of the current `SERVICE_ACCOUNT_SECRET`, so rotating the secret ends refresh chains. Revoked service tokens are rejected and cannot be refreshed ([docs/service-auth.md](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/docs/service-auth.md)).

**Verified email (OAuth)**: the `emailVerified` flag on the provider user info. Sign-in joins an existing account by email only when this is true, so other sign-ins must link the provider explicitly ([server/infrastructure/oauth/OAuthProviderStrategy.ts](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/server/infrastructure/oauth/OAuthProviderStrategy.ts)).

**Placeholder secret**: the published default values for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`. They are development-only defaults; production startup refuses them ([server/config/env.ts](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/server/config/env.ts)).

**Scopes claim**: JSON array of registered OAuth scope names added to access tokens ([docs/scopes.md:51-59](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/docs/scopes.md#L51-L59)).

**API versioning**: primary `/api/v1` prefix with legacy redirects ([server/routes/v1/index.ts:27-31](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/routes/v1/index.ts#L27-L31), [CLAUDE.md:56-61](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/CLAUDE.md#L56-L61)).

**ActionResponse**: standard response envelope with `status`, `message`, and `result` ([server/config/swaggerConfig.ts:50-75](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/swaggerConfig.ts#L50-L75)).

**Correlation ID**: request identifier returned in error bodies ([server/app.ts:227-231](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/app.ts#L227-L231)).

**Dependency type**: API field `dependencyType`, mapped from the domain `type` ([server/routes/apps.ts:21-28](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/routes/apps.ts#L21-L28)).

**contact and billing schemas**: PostgreSQL schemas; `contact` holds customers and OAuth scopes, `billing` holds subscriptions ([docs/PROVIDER_AGNOSTIC_MIGRATION.md:22-27](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/docs/PROVIDER_AGNOSTIC_MIGRATION.md#L22-L27), [docs/scopes.md:37](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/docs/scopes.md#L37)).

**deploy.sh**: VPS script that pulls `main`, installs the locked dependencies with `npm ci`, builds, migrates, restarts `pay`, and then polls `/health` for up to 60 seconds. A deploy whose service does not answer is reported as failed. It requires `NODE_AUTH_TOKEN` before installing ([deploy.sh:1-48](https://github.com/Jeffrey-Keyser/pay/blob/48044f710fc8e7bb1d335a3b3b256d916a3f5b27/deploy.sh#L1-L48), [deploy.sh:10-18](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/deploy.sh#L10-L18)).

**NODE_AUTH_TOKEN**: environment variable that `server/.npmrc` reads as the GitHub Packages token. It is supplied at runtime rather than committed ([server/.npmrc](https://github.com/Jeffrey-Keyser/pay/blob/fa40c5038223c663f3410e91aa6fc807ad681b04/server/.npmrc)).

**pay-auth-integration**: companion package listed as a server dependency ([server/package.json:48](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L48), [README.md:29](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L29)).
