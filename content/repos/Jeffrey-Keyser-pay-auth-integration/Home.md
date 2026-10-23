---
title: "pay-auth-integration — Overview"
description: "TypeScript library providing Express proxy/auth middleware, a browser auth and payment SDK, and React components for apps that integrate with the Pay service."
---

# pay-auth-integration

`@jeffrey-keyser/pay-auth-integration` is an npm library. Apps use it to add Pay-backed authentication and payments. It provides four things: Express middleware, a JavaScript/TypeScript client SDK, provider-agnostic payment processing, and React components ([README.md:L1-L6](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/README.md#L1-L6)).

Its central design is a backend proxy. The consumer's server forwards auth and payment calls to Pay, so browsers never contact Pay directly. In the source's own words, the proxy "completely obfuscates the Pay service from client applications" ([src/server/pay-proxy-routes.ts:L1-L5](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/pay-proxy-routes.ts#L1-L5)).

## At a glance

- **Package and version:** `@jeffrey-keyser/pay-auth-integration` at version `6.9.2` ([package.json:L2-L3](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L2-L3)).
- **Kind:** a library, not a service. It exposes five subpath entry points: `.`, `./server`, `./client`, `./client/react` and `./testing` ([package.json:L9-L35](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L9-L35)).
- **Registry:** published to GitHub Package Registry ([package.json:L95-L97](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L95-L97)). Consumers need a scoped `.npmrc` to install it ([README.md:L47-L51](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/README.md#L47-L51)).
- **Runtime requirements:**
  - Node `>=20.0.0`.
  - Optional peer dependencies: `express ^5.0.0`, `react` and `react-dom` ([package.json:L73-L89](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L73-L89)).
- **License:** MIT ([package.json:L90](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L90)).
- **Stale package description:** the `description` field still mentions v6.0.1 and personal-ui-kit v0.1.13 ([package.json:L4](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L4)). The actual dependency is `^0.4.0` ([package.json:L177](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L177)).

## Who uses it

The README describes two kinds of consumer:

- **Express servers** call `setupPayAuth` ([README.md:L73-L105](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/README.md#L73-L105)).
- **React apps** wrap their tree in `PayAuthProvider` and render `AuthModal` ([README.md:L147-L191](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/README.md#L147-L191)).

The only named consumer is an app called Pantry. It appears once, in a changelog entry ([CHANGELOG.md:L80](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/CHANGELOG.md#L80)). See [Services and Dependencies](../services-and-dependencies/) for which callers are confirmed and which are only expected.

## Main flow

1. **Browser to consumer server.** The browser SDK points at the consumer's own server, not at Pay. The README states that `VITE_PAY_URL` "Points to YOUR server" ([README.md:L137-L145](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/README.md#L137-L145)).
2. **Server setup.** `setupPayAuth` builds two pieces and mounts them on the app ([src/server/index.ts:L37-L126](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/index.ts#L37-L126)):
   - token-validation middleware;
   - a proxy router, mounted at `authPath`, which defaults to `/auth`.
3. **Forwarding to Pay.** The proxy forwards requests to Pay's versioned `/api/v1/...` endpoints ([src/server/config/route-config.ts:L14-L18](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/config/route-config.ts#L14-L18), [CHANGELOG.md:L10-L32](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/CHANGELOG.md#L10-L32)).
4. **Payments.** `PaymentClient` fetches the payment provider configuration from the backend, then initializes a matching adapter. Only Stripe is registered by default ([src/client/PaymentClient.ts:L192-L241](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/PaymentClient.ts#L192-L241), [src/client/providers/index.ts:L21-L25](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/providers/index.ts#L21-L25)).

## Wiki pages

- [Architecture](../architecture/)
- [Iteration Loop](../iteration-loop/)
- [Services and Dependencies](../services-and-dependencies/)
- [Operations](../operations/)
- [Glossary](../glossary/)
