---
title: "Operations"
description: "How this library is built, tested, and published, and what runtime facts are documented versus verified."
---

# Operations

## Library, not a service

This is a library. The package has no start command in the provided excerpts. Its entry points are compiled files in `dist` ([package.json:L5-L9](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/package.json#L5-L9)). Consumers install it with npm ([README.md:L7-L9](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/README.md#L7-L9)).

## Commands

| Task | Command | Source |
|------|---------|--------|
| Build | `npm run build` | [package.json:L12](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/package.json#L12) |
| Lint | `npm run lint` | [package.json:L13](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/package.json#L13) |
| Test | `npm test` | [package.json:L14](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/package.json#L14) |

## Publishing

`prepublishOnly` runs the build before publish ([package.json:L15](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/package.json#L15)). Publishing targets the GitHub npm registry ([package.json:L36-L38](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/package.json#L36-L38)). The provided excerpts do not show a deploy workflow or a version-bump process.

## Health and observability

Unknown. The provided excerpts contain no health endpoints, logging, metrics, or tracing code. Do not assume any exist.

## Documented versus verified

- **Verified in source:** the npm scripts, the TypeScript and lint configuration, and the publish configuration.
- **Documented only:** consumer roles named in comments and in the README.
- **Unknown:** whether CI runs these scripts, whether any consumer runs this version, and the Node.js version required. No engine field appears in the excerpt.
