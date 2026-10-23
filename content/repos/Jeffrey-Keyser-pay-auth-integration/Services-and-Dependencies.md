---
title: "Services and Dependencies"
description: "Packages, peers, upstream Pay service and payment providers the library depends on, and what is known about its consumers."
---

# Services and Dependencies

## Depends on

### Runtime npm packages

All five runtime packages are declared at [package.json:L174-L180](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L174-L180).

- **`@jeffrey-keyser/api-errors ^1.0.2`.** The proxy uses its `InternalServerError`, `UnauthorizedError` and `isHttpError` ([src/server/helpers/ProxyRouteHandler.ts:L2](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/helpers/ProxyRouteHandler.ts#L2)).
- **`@jeffrey-keyser/pay-api-types ^5.0.1`.** This is the source of shared types such as `PayProxyConfig` and `AuthEndpoints`. Consumers must import these types directly from it ([src/index.ts:L51-L60](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/index.ts#L51-L60)).
- **`@jeffrey-keyser/personal-ui-kit ^0.4.0`.** It supplies `ThemeProvider` and the theme utilities that are re-exported to consumers ([src/client/react/index.ts:L15-L22](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/react/index.ts#L15-L22)).
- **`i18next` and `react-i18next`.** The library creates an isolated i18n instance with en, es and pt resources ([src/i18n/index.ts:L25-L68](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/i18n/index.ts#L25-L68)).
- **`uuid`.** It is imported by the proxy routes ([src/server/pay-proxy-routes.ts:L11](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/pay-proxy-routes.ts#L11)). It is not listed under `dependencies`, so how it gets resolved is unverified.

### Peers

All three peers are optional ([package.json:L73-L86](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L73-L86)):

- `express ^5.0.0`
- `react`
- `react-dom`

### Upstream services

**Pay service.** Every server setup requires a `payUrl`, and the proxy refuses to build without one ([src/server/pay-proxy-routes.ts:L34-L40](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/pay-proxy-routes.ts#L34-L40)).

The proxy targets Pay's `/api/v1` routes ([src/server/config/route-config.ts:L18-L194](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/config/route-config.ts#L18-L194)). These cover:

- auth
- users
- guest
- account deletion and data export
- OAuth
- admin token generation and revocation
- payments

Which Pay deployment, host or port is used is consumer configuration and unknown here.

**Payment provider SDK.** `PaymentClient` fetches a `providerId` and `publishableKey` from `/payment/provider-config` ([src/client/PaymentClient.ts:L192-L207](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/PaymentClient.ts#L192-L207)).

Only Stripe is auto-registered ([src/client/providers/index.ts:L21-L25](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/providers/index.ts#L21-L25)). Any other provider throws "not registered" unless the consumer adds its own adapter ([src/client/providers/PaymentProviderAdapter.ts:L234-L247](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/providers/PaymentProviderAdapter.ts#L234-L247)).

The README's mention of "Square, PayPal" describes extensibility, not built-in adapters ([README.md:L25-L30](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/README.md#L25-L30)).

### Registry and CI services

- **GitHub Package Registry** is used for both install and publish ([package.json:L95-L97](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L95-L97)).
- **CI** uses a token secret to install scoped packages and uploads coverage to Codecov ([.github/workflows/ci.yml:L25-L58](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/.github/workflows/ci.yml#L25-L58)).

## Consumed by

### Confirmed in this source

No source file in this snapshot declares a consumer.

One consumer is mentioned in documentation only. The 6.3.0 changelog names "consumer applications (like Pantry)" as having been affected by an i18n context conflict ([CHANGELOG.md:L76-L80](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/CHANGELOG.md#L76-L80)). Whether Pantry still uses the current version is unknown.

### Expected (documented usage patterns)

- **Express servers.** They mount `setupPayAuth`, or the manual combination of `authMiddleware`, `createPayProxyRoutes` and `requireAuth` ([README.md:L73-L135](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/README.md#L73-L135)).
- **React or Vite frontends.** They use `PayAuthProvider` or `DefaultPayAuthProvider` ([README.md:L147-L191](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/README.md#L147-L191), [src/client/react/context/DefaultPayAuthProvider.tsx:L39-L65](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/react/context/DefaultPayAuthProvider.tsx#L39-L65)).
- **Browser automation tools such as Playwright or Puppeteer.** They can drive login through the `window.__PAY_AUTH__` API ([src/client/react/context/PayAuthProvider.tsx:L14-L30](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/react/context/PayAuthProvider.tsx#L14-L30)).

### Related upstream reference

Client 404 errors point users to a setup guide inside the `Jeffrey-Keyser/Pay` repository ([src/client/services/error-formatter.ts:L6-L8](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/services/error-formatter.ts#L6-L8)).
