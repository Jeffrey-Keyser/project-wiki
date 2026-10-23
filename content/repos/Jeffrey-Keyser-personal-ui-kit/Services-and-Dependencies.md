---
title: "Services and Dependencies"
description: "What personal-ui-kit depends on at runtime, build time, and in CI, and which callers are confirmed versus unknown."
---

# Services and Dependencies

## Depends on

**Runtime peer dependencies** (supplied by the host app):

- react and react-dom, versions ^18 or ^19 ([ui-kit/package.json:L52-L54](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L52-L54)).
- styled-components ^6 ([ui-kit/package.json:L56](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L56)).
- i18next and react-i18next ([ui-kit/package.json:L52-L55](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L52-L55)).

The UI kit README lists react-router-dom as a peer ([ui-kit/README.md:L19-L23](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/README.md#L19-L23)), but package.json lists it only as a dev dependency ([ui-kit/package.json:L88](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L88)). Treat react-router-dom as not a declared peer.

**Runtime dependencies** bundled with the library: @floating-ui/react, date-fns, and focus-trap-react ([ui-kit/package.json:L58-L61](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L58-L61)).

**External services** referenced by workflows and infrastructure:

- GitHub Packages registry for scoped installs ([.github/workflows/ci.yml:L51-L52](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/.github/workflows/ci.yml#L51-L52)).
- AWS S3, CloudFront, and OIDC role assumption for Storybook deploys ([.github/workflows/deploy-storybook.yml:L40-L66](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/.github/workflows/deploy-storybook.yml#L40-L66)).
- Terraform describes S3, CloudFront, ACM, Route53, and IAM for Storybook hosting ([terraform/README.md:L7-L11](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/terraform/README.md#L7-L11)). Whether that infrastructure is currently applied is unknown.

## Consumed by

**Confirmed callers in the provided source:** none. The excerpts contain no in-repo application that imports the package.

**Expected but unconfirmed:**

- Applications in the Jeffrey-Keyser ecosystem, per the stated purpose ([README.md:L3](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/README.md#L3)). Names and versions are unknown.
- The Storybook site is built from this repo ([ui-kit/package.json:L46](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/ui-kit/package.json#L46)) and documented at https://ui.jeffreykeyser.net ([terraform/README.md:L41](https://github.com/Jeffrey-Keyser/personal-ui-kit/blob/44280758a964365ad37e1aa195c65ec34889da00/terraform/README.md#L41)). Its live status is unverified.
