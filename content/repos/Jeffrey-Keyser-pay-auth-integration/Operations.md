---
title: Operations
description: Library package — no deployable surface. Build, publish, and consumer runtime notes.
---

# Operations

## Deployable surface

**None.** This repo is a pure npm package: `package.json` `main`/`module`/`types` point at `dist/`, `exports` declare subpath entries, and there is no `bin`, no `start` script, no Dockerfile, no server entry point ([package.json:5-35](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L5-L35), [package.json:98-137](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L98-L137)). README describes itself as a "package" providing middleware, SDK, and components for consumers to mount in their own services ([README.md:1-6](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L1-L6)).

No port, no systemd unit, no health probe to operate — those concerns live in the consuming app. The closest the package gets is a `/auth/ping` health endpoint the consumer's server exposes once `setupPayAuth` is mounted ([README.md:194-198](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L194-L198)).

## Build

```bash
npm run build
```

Runs `build:esm` (tsc with `tsconfig.esm.json`), `build:cjs` (tsc with `tsconfig.cjs.json`), `fix:esm-imports` (post-process via `scripts/fix-esm-imports.mjs`), and `copy:assets` (CSS + locales) ([package.json:99-109](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L99-L109)).

Outputs land in `dist/esm/` and `dist/cjs/`. `prepublishOnly` runs clean → build → typecheck before any publish ([package.json:118](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L118)).

## Publish

GitHub Actions `publish` job triggers on push to `main`. Uses `changesets/action@v1` to either open a Version PR (when pending changesets are present) or run `npm run release` to publish to `npm.pkg.github.com` ([.github/workflows/ci.yml:68-100](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/.github/workflows/ci.yml#L68-L100), [package.json:129-130](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/package.json#L129-L130)).

Auth uses `PACKAGE_TOKEN` secret ([.github/workflows/ci.yml:28](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/.github/workflows/ci.yml#L28)). A separate `publish.yml.disabled` exists but is currently inactive (file rename in `.github/workflows/`).

## CI

`build-and-test` runs on every PR and on push to `main`/`develop`, matrixed Node 20 + 22. Steps: install, typecheck, test:coverage, build ESM + CJS, copy assets, `npm pack --dry-run`, codecov upload, dist artifact upload ([.github/workflows/ci.yml:1-66](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/.github/workflows/ci.yml#L1-L66)).

## Observability

No app telemetry — observability is the consumer's. Package offers debug hooks:

- `debug: true` flag on `setupPayAuth` / `PayAuthProvider` enables verbose logging ([README.md:549-557](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L549-L557)).
- `createAuthDebugInfo`, `testAuthConnectivity`, `generateDebugReport` exposed from client for in-app diagnostics ([src/client/index.ts:36-42](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/client/index.ts#L36-L42)).
- Runtime validator runs async on `setupPayAuth` and logs config issues when `debug` is on ([src/server/index.ts:82-94](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/src/server/index.ts#L82-L94)).

## On-call

No on-call rota — library. Failures surface as build/typecheck errors in consumer CI or as auth failures in consumer apps. Troubleshooting guide covers the common consumer-side issues: 404s when middleware is mounted without proxy routes, CORS, unexpected logouts, env var loading ([README.md:520-565](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L520-L565), [TROUBLESHOOTING_GUIDE.md](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/TROUBLESHOOTING_GUIDE.md)).

Issues route through `Jeffrey-Keyser/Pay` ([README.md:594](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/main/README.md#L594)).
