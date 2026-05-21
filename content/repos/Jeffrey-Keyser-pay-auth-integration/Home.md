---
title: pay-auth-integration — Overview
description: TypeScript package providing Express auth middleware, payment client SDK, and React UI components for the Pay system.
---

# pay-auth-integration

`@jeffrey-keyser/pay-auth-integration` — npm package shipping authentication middleware, payment client SDK, and React components for integrating apps with the Pay backend ([README.md:1-6](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L1-L6)).

Published to GitHub Package Registry under scope `@jeffrey-keyser` ([package.json:95-97](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L95-L97)). Current version `6.9.2` ([package.json:3](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L3)).

## At a glance

- **Kind**: library (multi-entry npm package), not a deployable service ([package.json:9-35](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L9-L35)).
- **Language**: TypeScript, dual ESM/CJS build ([package.json:99-109](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L99-L109)).
- **Subpath exports**: `/server`, `/client`, `/client/react`, `/testing` ([package.json:15-34](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L15-L34)).
- **Peer deps**: `express ^5.0.0` (optional), `react` / `react-dom` (optional) ([package.json:73-86](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L73-L86)).
- **Node**: `>=20.0.0` ([package.json:87-89](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L87-L89)).
- **License**: MIT ([package.json:90](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L90)).

## Who uses it

Downstream apps that talk to a Pay server. Server side: Express apps mount `setupPayAuth({...})` to proxy auth endpoints and validate tokens ([README.md:75-104](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L75-L104)). Client side: React apps wrap their tree in `<PayAuthProvider>` and use `<AuthModal>` / `<PaymentModal>` for UI ([README.md:148-191](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L148-L191)).

Consumer apps do not call Pay directly — package design is a backend-proxy pattern where browser → consumer server → Pay ([README.md:138-145](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L138-L145)).

## How work moves

Changes flow through changesets ([package.json:128-130](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L128-L130)), build via dual tsc passes ([package.json:99-102](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L99-L102)), and ship via GitHub Actions on push to `main` ([.github/workflows/ci.yml:68-100](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/.github/workflows/ci.yml#L68-L100)).

## Wiki pages

- [Architecture](./architecture/)
- [Iteration Loop](./iteration-loop/)
- [Services and Dependencies](./services-and-dependencies/)
- [Operations](./operations/)
- [Glossary](./glossary/)
