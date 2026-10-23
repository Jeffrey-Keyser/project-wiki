---
title: "personal-ui-kit Wiki Home"
description: "Overview of the personal-ui-kit React component library, its key facts, intended users, and main contributor and release flow."
---

# personal-ui-kit

personal-ui-kit is a React component library with shared UI components for the Jeffrey-Keyser ecosystem ([README.md:L3](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/README.md#L3)). The library source lives in the `ui-kit/` directory ([README.md:L32](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/README.md#L32)).

## At a glance

- Package name in `package.json` is `@jeffrey-keyser/personal-ui-kit`, version 0.4.1 ([ui-kit/package.json:L2-L3](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L2-L3)).
- Older docs cite `@jkeyser/ui-kit` and version 0.5.3; these are stale relative to current source ([ui-kit/README.md:L7-L12](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/README.md#L7-L12)).
- Built with TypeScript, styled-components, Vite, and Vitest ([CLAUDE.md:L15-L18](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/CLAUDE.md#L15-L18)).
- Package entry re-exports the design system, atoms, and molecules ([ui-kit/src/index.ts:L2-L7](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/src/index.ts#L2-L7)).
- Library build emits ES and CommonJS bundles ([ui-kit/vite.config.ts:L38-L39](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/vite.config.ts#L38-L39)).
- A live documentation site is documented at https://ui.jeffreykeyser.net ([README.md:L7](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/README.md#L7)). Whether it currently serves this build is unknown from this snapshot.

## Who uses it

- **Application developers** install the package and wrap their app in `ThemeProvider` ([README.md:L17-L27](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/README.md#L17-L27)).
- **Contributors** develop components with Storybook and Vitest ([README.md:L29-L42](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/README.md#L29-L42)).
- **Confirmed downstream consumers** are unknown in the provided excerpts. See the Services page.

## Main flow

1. Install the package and render components inside a theme provider.
2. Change code under `ui-kit/`, run Storybook and tests locally.
3. Pull requests trigger gated CI for tests and builds ([.github/workflows/ci.yml:L5-L14](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/.github/workflows/ci.yml#L5-L14)).
4. A push to `main` runs a Storybook deploy workflow ([.github/workflows/deploy-storybook.yml:L4-L5](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/.github/workflows/deploy-storybook.yml#L4-L5)).

## Explore

- [Architecture](../architecture/): components, contracts, and build outputs.
- [Iteration Loop](../iteration-loop/): contributor workflow and CI.
- [Services and Dependencies](../services-and-dependencies/): what the library depends on and who calls it.
- [Operations](../operations/): commands, deployment, and observability.
- [Glossary](../glossary/): project-specific terms.
