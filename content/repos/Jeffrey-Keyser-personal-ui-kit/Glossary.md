---
title: "Glossary"
description: "Project-specific terms used in personal-ui-kit, each with a source citation."
---

# Glossary

- **Atoms**: basic UI building blocks, under `atoms/` ([CLAUDE.md:L9](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/CLAUDE.md#L9)).
- **Molecules**: components composed of atoms, under `molecules/` ([CLAUDE.md:L10](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/CLAUDE.md#L10)).
- **Design system**: theme configuration, tokens, and styled-components setup ([CLAUDE.md:L11](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/CLAUDE.md#L11)).
- **Barrel file**: an `index.ts` that re-exports a component, such as the atoms barrel ([ui-kit/src/atoms/index.ts:L1-L63](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/src/atoms/index.ts#L1-L63)).
- **ThemeProvider**: wraps the app and provides theme context ([CLAUDE.md:L61](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/CLAUDE.md#L61)).
- **Design tokens**: colors, typography, and spacing defined in `design-system/tokens.ts` ([CLAUDE.md:L62](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/CLAUDE.md#L62)).
- **Context provider and hook pair**: for example `MenuProvider` and `useMenuContext`, which throw outside the provider ([ui-kit/src/molecules/Menu/MenuContext.tsx:L12-L38](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/src/molecules/Menu/MenuContext.tsx#L12-L38)).
- **LegacyMenu and MenuNew**: the two Menu exports ([ui-kit/src/molecules/Menu/index.ts:L2-L6](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/src/molecules/Menu/index.ts#L2-L6)).
- **TabsCompat and SnackbarCompat**: compatibility exports alongside the main Tabs and Snackbar ([ui-kit/src/molecules/Tabs/index.ts:L2](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/src/molecules/Tabs/index.ts#L2), [ui-kit/src/molecules/Snackbar/index.ts:L3](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/src/molecules/Snackbar/index.ts#L3)).
- **Peer dependencies**: host-supplied packages such as react and styled-components ([ui-kit/package.json:L51](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L51)).
- **isolatedDeclarations**: a TypeScript option enabled for the project ([ui-kit/tsconfig.json:L4](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/tsconfig.json#L4)).
- **Gated Build (CI)**: the workflow that runs tests, package build, and Storybook build ([.github/workflows/ci.yml:L1](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/.github/workflows/ci.yml#L1)).
- **CI Status Check**: the summary job that fails when a required job fails ([.github/workflows/ci.yml:L153-L157](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/.github/workflows/ci.yml#L153-L157)).
- **Test Suite**: the workflow that also accepts `workflow_call` ([.github/workflows/test.yml:L27-L28](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/.github/workflows/test.yml#L27-L28)).
- **OIDC**: the `id-token` permission used by the Storybook deploy ([.github/workflows/deploy-storybook.yml:L12](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/.github/workflows/deploy-storybook.yml#L12)).
- **storybook-static**: the static Storybook output directory uploaded as an artifact ([.github/workflows/ci.yml:L150](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/.github/workflows/ci.yml#L150)).
