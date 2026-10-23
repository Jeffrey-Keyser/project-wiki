---
title: "Operations"
description: "Library operations: build, test, release, consumer-side health checks and debug observability, with documented versus verified runtime noted."
---

# Operations

## This is a library

The package has no start script or service entry point. `main`, `module`, `types` and `exports` all point into `dist/` ([package.json:L5-L35](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L5-L35)).

Ports, process managers and hosting all belong to the consuming application. The README's `app.listen(3001)` is example code inside a consumer app, not a deployment fact ([README.md:L104](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/README.md#L104)).

Two scripts look like runtime commands but are not:

- `dev` runs `ts-node src/pay-middleware.ts` ([package.json:L111](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L111)). That file is not in this snapshot, so whether `dev` works is unverified.
- `postinstall` only prints a hint to run `npm run validate` ([package.json:L134](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L134)).

## Commands

| Purpose | Command | Source |
|---|---|---|
| Build ESM, CJS and assets | `npm run build` | [package.json:L99-L109](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L99-L109) |
| Test | `npm test`, `npm run test:coverage` | [package.json:L112-L114](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L112-L114) |
| Typecheck | `npm run typecheck` | [package.json:L120](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L120) |
| Validate consumer setup | `npm run validate` | [package.json:L125-L126](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L125-L126) |
| Migration check | `npm run check:migration` | [package.json:L127-L128](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/package.json#L127-L128) |
| Release | `npm run release`, via the CI changesets action | [.github/workflows/ci.yml:L93-L100](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/.github/workflows/ci.yml#L93-L100) |

Publishing happens only from pushes to `main` ([.github/workflows/ci.yml:L68-L72](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/.github/workflows/ci.yml#L68-L72)).

## Health checks (in consumer apps)

### Documented

The README says that once a consumer server mounts the proxy, `curl http://localhost:3001/auth/ping` should return `{"status":"success","message":"Service is healthy"}` ([README.md:L193-L199](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/README.md#L193-L199)). The troubleshooting guide repeats this check ([TROUBLESHOOTING_GUIDE.md:L29-L47](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/TROUBLESHOOTING_GUIDE.md#L29-L47)). The host and port in that command are illustrative.

### Verified in source

The proxy router defines a local `GET /health` route ([src/server/pay-proxy-routes.ts:L83-L90](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/pay-proxy-routes.ts#L83-L90)). It:

- is mounted under the auth path;
- returns `status: 'healthy'` and `service: 'pay-proxy'`;
- does not contact Pay.

The ping route config targets Pay's `/api/v1/auth/ping` ([src/server/config/route-config.ts:L24-L30](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/config/route-config.ts#L24-L30)). `PayProxyClient.createRouter` is not in this snapshot, so the local path it binds that route to is unverified.

## Observability

### Correlation IDs

Each proxied request reuses an incoming correlation ID if one exists, or generates a new one. The ID is returned in `X-Correlation-ID` ([src/server/pay-proxy-routes.ts:L60-L77](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/pay-proxy-routes.ts#L60-L77)).

### Error logs

Proxy errors are written with `console.error`. Each entry includes the correlation ID, duration, path and method. Stack traces are included only when `debug` is on ([src/server/pay-proxy-routes.ts:L92-L136](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/pay-proxy-routes.ts#L92-L136)).

There is no metrics exporter in the shown source.

### Debug and validation

- With `debug` or `logConfiguration` set, `setupPayAuth` logs its configuration and validation results. It also runs a runtime validation asynchronously ([src/server/index.ts:L65-L95](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/index.ts#L65-L95)).
- `SecurityValidator` warns about three settings in production: debug mode, a localhost URL, and plain HTTP ([src/server/validation/config-validation-pipeline.ts:L139-L182](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/validation/config-validation-pipeline.ts#L139-L182)).
- Client-side debug helpers include `testAuthConnectivity` and `generateDebugReport` ([src/client/index.ts:L35-L42](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/index.ts#L35-L42)).

## Tunables

`cacheTtlMs` and `cacheMaxSize` are documented as read from the `PAY_AUTH_CACHE_TTL` and `PAY_AUTH_CACHE_MAX_SIZE` environment variables. Their defaults are 300000 ms and 1000 entries ([src/server/validation.ts:L43-L46](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/validation.ts#L43-L46)). The code that reads those variables is not in this snapshot.

The production preset sets `ttl: 300` for `cacheTtl` ([src/core/configuration/configuration-factory.ts:L258-L274](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/core/configuration/configuration-factory.ts#L258-L274)). The unit of `cacheTtl` is not stated, so treat it as unknown.
