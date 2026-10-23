---
title: "Glossary"
description: "Project-specific terms for the Pay auth and payment integration package, with source citations."
---

# Glossary

**Backend proxy.** The core design pattern of the package. The consumer's Express server forwards auth and payment calls to Pay, so client applications never see the Pay service directly ([src/server/pay-proxy-routes.ts:L1-L5](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/pay-proxy-routes.ts#L1-L5)).

**setupPayAuth.** The recommended one-call server setup. It:
- builds the middleware and the proxy routes;
- defaults `authPath` to `/auth`;
- returns `{ middleware, routes, applyTo }`.

([src/server/index.ts:L31-L126](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/index.ts#L31-L126))

**createPayProxyRoutes / PayProxyClient.** The Express router that forwards requests to Pay. It adds correlation IDs and a `/health` route ([src/server/pay-proxy-routes.ts:L28-L90](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/pay-proxy-routes.ts#L28-L90)).

**ProxyRouteConfig.** A declarative description of one proxied route. Its fields are `path`, `method`, `requiresAuth`, `cacheable` and an optional `cacheTTL` ([src/server/config/route-config.ts:L6-L12](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/config/route-config.ts#L6-L12)).

**API_V1.** The `/api/v1` prefix applied to all upstream Pay routes. It was introduced in 6.5.5 ([src/server/config/route-config.ts:L14-L18](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/config/route-config.ts#L14-L18), [CHANGELOG.md:L10-L24](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/CHANGELOG.md#L10-L24)).

**ProxyRouteHandler.** The command-style handler behind each proxied route ([src/server/helpers/ProxyRouteHandler.ts:L8-L48](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/helpers/ProxyRouteHandler.ts#L8-L48)). It handles:
- the auth check;
- caching;
- forwarding the request;
- passing errors through.

**ActionResponse error format.** The standard error body: `{ status: 'error', message, code, details, correlationId }` ([src/server/pay-proxy-routes.ts:L108-L135](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/pay-proxy-routes.ts#L108-L135), [CHANGELOG.md:L321-L344](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/CHANGELOG.md#L321-L344)).

**Public routes.** Paths that skip authentication. They are matched exactly or with `*` wildcards ([src/server/services/route-matcher-service.ts:L9-L33](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/services/route-matcher-service.ts#L9-L33)). `setupPayAuth` adds `${authPath}/*` to the list automatically ([src/server/index.ts:L59-L63](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/index.ts#L59-L63)).

**ValidatedPayAuthConfig / PayAuthConfigurationError.** The server configuration shape, and the error thrown when that configuration fails validation ([src/server/validation.ts:L13-L49](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/server/validation.ts#L13-L49)).

**PayAuthConfigBuilder / ConfigurationFactory.** A fluent builder for the server configuration, with defaults filled in ([src/core/configuration/builders.ts:L80-L188](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/core/configuration/builders.ts#L80-L188)). The factory adds presets for development, production, testing and high-security ([src/core/configuration/configuration-factory.ts:L235-L315](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/core/configuration/configuration-factory.ts#L235-L315)).

**THEME_PRESETS / AuthModalThemeBuilder.** The `modern-blue`, `dark-mode` and `light-gray` themes ([src/core/configuration/configuration-factory.ts:L92-L148](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/core/configuration/configuration-factory.ts#L92-L148)). `AuthModalThemeBuilder` is a deprecated compatibility shim over the same themes ([src/core/configuration/index.ts:L30-L41](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/core/configuration/index.ts#L30-L41)).

**PayAuth.** The client authentication facade. It exposes `login`, `register`, `loginAsGuest`, `logout` and `getUser`, plus event subscription ([src/client/pay-auth.ts:L137-L294](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/pay-auth.ts#L137-L294)).

**AuthState.** The states of the client's auth state machine ([src/client/services/auth-state-machine.ts:L4-L12](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/services/auth-state-machine.ts#L4-L12)):
- IDLE
- INITIALIZING
- AUTHENTICATING
- AUTHENTICATED
- GUEST_AUTHENTICATED
- UNAUTHENTICATED
- ERROR

**Cookie-based refresh.** The access token is stored in client storage under the key `accessToken`. The refresh token is an httpOnly cookie that the client never reads ([src/client/services/token-storage-service.ts:L3-L37](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/services/token-storage-service.ts#L3-L37)). A 401 response triggers `performTokenRefresh` ([src/client/pay-auth.ts:L313-L353](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/pay-auth.ts#L313-L353)).

**Guest conversion.** Upgrading a guest session to a full account. The handler maps HTTP 409 and 401 responses to user-facing messages and emits a `guestConverted` event ([src/client/services/handlers/guest-handler.ts:L84-L135](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/services/handlers/guest-handler.ts#L84-L135)).

**PaymentClient.** The provider-agnostic payment client. It fetches the provider configuration, then creates the matching adapter ([src/client/PaymentClient.ts:L187-L241](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/PaymentClient.ts#L187-L241)).

**PaymentProviderAdapter / Factory.** The interface each payment provider must implement, and the registry that holds the implementations ([src/client/providers/PaymentProviderAdapter.ts:L143-L247](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/providers/PaymentProviderAdapter.ts#L143-L247)).

**CustomerService / SubscriptionService / ProductService.** Wrappers over the `/payment/...` endpoints, with local caching. For example, `ensureCustomer` is idempotent: it creates the customer only if needed ([src/client/services/CustomerService.ts:L72-L105](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/services/CustomerService.ts#L72-L105)).

**DefaultPayAuthProvider.** A zero-config variant of `PayAuthProvider` ([src/client/react/context/DefaultPayAuthProvider.tsx:L39-L51](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/react/context/DefaultPayAuthProvider.tsx#L39-L51)). It resolves `VITE_PAY_URL` and `VITE_PAY_DEBUG` on its own.

**`window.__PAY_AUTH__`.** A programmatic auth API exposed on `window` for automation tools ([src/client/react/context/PayAuthProvider.tsx:L127-L148](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/client/react/context/PayAuthProvider.tsx#L127-L148)).

**payAuthI18n.** An i18next instance private to the package, so it does not shadow the host app's own translations ([src/i18n/index.ts:L52-L68](https://github.com/Jeffrey-Keyser/pay-auth-integration/blob/d4ecf76d913db4ff0a5178aae561fd0fe16c4e03/src/i18n/index.ts#L52-L68)).
