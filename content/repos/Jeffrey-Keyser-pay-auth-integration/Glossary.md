---
title: Glossary
description: Repo-specific terms — auth roles, payment abstractions, and config primitives that show up across the codebase.
---

# Glossary

## PayAuth

Client-side authentication class. Single entry point for login, register, logout, token access, and event listeners against a consumer-server proxy. Constructed with `baseUrl` (consumer server, not Pay directly), optional `authEndpoints`, and `debug` flag ([README.md:294-311](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L294-L311), source at [src/client/pay-auth.ts](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/client/pay-auth.ts)).

## setupPayAuth

One-call server bootstrap that wires both `authMiddleware` (token validation) and `createPayProxyRoutes` (auth endpoint forwarder) onto an Express app. Defined at [src/server/index.ts:37-126](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/server/index.ts#L37-L126). Returns `{ middleware, routes, applyTo }`; `applyTo` lets the consumer mount later if they didn't pass `app` in config ([README.md:261-278](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L261-L278)).

## PayProxyClient / createPayProxyRoutes

Server-side proxy machinery that forwards requests from the consumer's `/auth/*` (and payment) namespaces to the upstream Pay service. Exported from [src/server/index.ts:27-29](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/server/index.ts#L27-L29). Backend-proxy obfuscation pattern is a deliberate design: browsers never call Pay directly ([README.md:138-145](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L138-L145)).

## PaymentClient

Provider-agnostic payment SDK that loads the correct provider SDK at runtime from backend config. Exposes `createPaymentElements`, `confirmPayment`, etc. ([README.md:313-330](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L313-L330), source at [src/client/PaymentClient.ts](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/client/PaymentClient.ts)).

## PaymentProviderAdapter

Interface implemented per payment processor (Stripe, Square, PayPal…). Adapters declare `providerId`, `providerName`, and async `initialize`/`createPaymentElements`/`confirmPayment` methods. Registered with `PaymentProviderAdapterFactory.register` ([README.md:427-444](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L427-L444), [src/client/providers/PaymentProviderAdapter.ts](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/client/providers/PaymentProviderAdapter.ts)).

## CustomerService / SubscriptionService / ProductService

Payment management services introduced in v6.5.0+. Higher-level wrappers around proxy routes for customer, subscription, and product CRUD ([src/client/index.ts:31-34](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/client/index.ts#L31-L34)).

## Guest Conversion

Flow for upgrading an anonymous/guest account into a full registered user, invoked through `PayAuthProvider`'s `guestConversion` config and the `convertGuestToUser` action exposed on `usePayAuth()` ([README.md:336-350](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L336-L350), [README.md:382-384](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L382-L384)).

## PayAuthConfigBuilder

Fluent builder for the server config object accepted by `setupPayAuth`. Lives in `core/configuration` and re-exported from both root and server entries ([src/index.ts:38-49](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/index.ts#L38-L49), [src/server/index.ts:206](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/server/index.ts#L206)).

## ConfigurationFactory

Companion factory producing prebuilt configs for `development`, `production`, `testing` environments. Backs `createDevelopmentSetup`, `createProductionSetup`, `createTestingSetup`, `createEnvironmentSetup` helpers ([src/server/index.ts:171-203](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/server/index.ts#L171-L203)).

## AuthModalThemeBuilder / THEME_PRESETS

Theme construction utilities for `<AuthModal>` and `<PaymentModal>`. Underlying styling comes from `@jeffrey-keyser/personal-ui-kit` ([src/index.ts:38-49](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/index.ts#L38-L49), [README.md:447-465](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L447-L465)).

## requireAuth / requireAdmin / requireRole / requirePermission

Express route guards layered on top of `authMiddleware`. Reject unauthorized requests before they hit handlers ([README.md:282-286](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L282-L286), [src/server/index.ts:128-144](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/server/index.ts#L128-L144)).

## ValidatedPayAuthConfig

Server config shape after validation, used as the input type to `setupPayAuth`. Defined alongside `validatePayAuthConfiguration` and `PayAuthConfigurationError` in [src/server/validation.ts](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/server/validation.ts) and re-exported at [src/server/index.ts:219](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/server/index.ts#L219).

## Subpath exports

Package ships five entry points — `.`, `./server`, `./client`, `./client/react`, `./testing` — each with its own ESM/CJS/types triple, so consumers pull only the surface they need ([package.json:9-34](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L9-L34)).

## Changeset

Pending-version-bump file under `.changeset/`. Generated via `npx changeset`, consumed by `npm run version` and `npm run release` in CI to drive semver bumps and CHANGELOG entries ([package.json:128-130](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L128-L130), [.changeset/config.json](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/.changeset/config.json)).
