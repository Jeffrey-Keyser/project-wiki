---
title: Services and Dependencies
description: Runtime deps, peer deps, external systems the package talks to, and known consumers.
---

# Services and Dependencies

## Depends on

### Runtime npm deps

- `@jeffrey-keyser/api-errors ^1.0.2` — shared error classes ([package.json:175](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L175)).
- `@jeffrey-keyser/pay-api-types ^5.0.1` — authoritative type definitions for Pay API; v6.0.0 stopped re-exporting and now requires direct import from this package ([package.json:176](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L176), [src/index.ts:51-61](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/index.ts#L51-L61)).
- `@jeffrey-keyser/personal-ui-kit ^0.4.0` — theming + base components for the React surface ([package.json:177](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L177), [README.md:21](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L21)).
- `i18next ^25.6.3`, `react-i18next ^15.4.1` — translations (en/es/pt) ([package.json:178-179](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L178-L179), [README.md:22](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L22)).

### Peer deps (consumer-provided)

- `express ^5.0.0` — optional, server entry only ([package.json:73-79](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L73-L79)).
- `react`, `react-dom` — optional, React entry only ([package.json:80-86](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L80-L86)).

### Runtime services

- **Pay backend** — every server config requires `payUrl`; middleware validates tokens against Pay and proxy routes forward requests there ([README.md:91-98](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L91-L98), [src/server/index.ts:104-110](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/server/index.ts#L104-L110)). Pay now uses versioned `/api/v1/...` endpoints — package updated in 6.5.5 ([CHANGELOG.md:10-32](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/CHANGELOG.md#L10-L32)).
- **Payment provider SDKs** — loaded dynamically in the browser based on backend config; Stripe ships built-in via `StripeProviderAdapter`, others pluggable through `PaymentProviderAdapter` ([README.md:25-31](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L25-L31), [src/client/index.ts:25-29](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/client/index.ts#L25-L29)).

### Registries

- **GitHub Package Registry** (`npm.pkg.github.com`) — install + publish target; consumers need scoped `.npmrc` with token ([README.md:46-51](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L46-L51), [package.json:95-97](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L95-L97)).

### Dev/CI deps

Jest 30, ts-jest 29, jest-environment-jsdom, @testing-library/react 16, Storybook 8, Vite 6, TypeScript 5.9, changesets 2.30 ([package.json:138-173](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L138-L173)). Codecov upload on Node 20 leg of CI ([.github/workflows/ci.yml:51-58](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/.github/workflows/ci.yml#L51-L58)).

## Consumed by

This is a library; consumers are downstream apps that install `@jeffrey-keyser/pay-auth-integration`. The README markets two consumer shapes:

- **Express servers** — use `/server` entry to proxy + validate auth ([README.md:73-135](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L73-L135)).
- **React frontends** — use `/client/react` for `<PayAuthProvider>`, `<AuthModal>`, `<PaymentModal>` ([README.md:148-191](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L148-L191)).

Support routed to the Pay umbrella repo: `Jeffrey-Keyser/Pay` issues tracker ([README.md:594](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L594)). Treat that as the canonical upstream consumer / coordination point for the Pay service this package integrates with.
