---
title: "Operations"
description: "Commands, deployment workflow, testing, and observability for personal-ui-kit, clarifying documented versus verified runtime behavior."
---

# Operations

## Library, not a service

personal-ui-kit is an npm library. Its package metadata points to `dist` entry files ([ui-kit/package.json:L9-L11](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L9-L11)). The provided excerpts define no server, process, or port for the library itself.

## Commands

Run from `ui-kit/` ([CLAUDE.md:L25](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/CLAUDE.md#L25)):

- Dev server: `npm run dev`. Port is unknown from source.
- Storybook: `npm run storybook`, port 6006 ([ui-kit/package.json:L45](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L45)).
- Build: `npm run build` ([ui-kit/package.json:L40](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L40)). The `prepare` script also runs it ([ui-kit/package.json:L43](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L43)).
- Static Storybook: `npm run build-storybook` ([ui-kit/package.json:L46](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L46)).
- Tests: `npm test` ([ui-kit/package.json:L42](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L42)).
- Publish: `prepublishOnly` runs tests ([ui-kit/package.json:L44](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L44)). Publish targets the GitHub Packages registry ([ui-kit/package.json:L113-L115](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L113-L115)).

## Deployment

The Storybook deploy workflow runs on pushes to `main` that touch `ui-kit/` ([.github/workflows/deploy-storybook.yml:L4-L7](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/.github/workflows/deploy-storybook.yml#L4-L7)). It syncs static files to S3 and invalidates CloudFront ([.github/workflows/deploy-storybook.yml:L49-L66](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/.github/workflows/deploy-storybook.yml#L49-L66)).

## Health and observability

- **Health checks:** none defined in the provided excerpts. `HealthIndicator` is a UI component, not an endpoint ([ui-kit/src/atoms/HealthIndicator/index.ts:L1-L6](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/src/atoms/HealthIndicator/index.ts#L1-L6)).
- **Test artifacts:** CI uploads coverage for 7 days ([.github/workflows/test.yml:L69-L75](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/.github/workflows/test.yml#L69-L75)) and coverage reports for 30 days ([.github/workflows/test.yml:L118-L124](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/.github/workflows/test.yml#L118-L124)).
- **Coverage reporters:** text and lcov via v8 ([ui-kit/vite.config.ts:L67-L69](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/vite.config.ts#L67-L69)).
- **Runtime logging or metrics:** unknown; not present in excerpts.

## Documented versus verified

- Documented: the live site at https://ui.jeffreykeyser.net ([README.md:L7](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/README.md#L7)).
- Verified in source: the workflows and scripts above. Whether recent runs succeeded or the site is live is not verifiable from this snapshot.
