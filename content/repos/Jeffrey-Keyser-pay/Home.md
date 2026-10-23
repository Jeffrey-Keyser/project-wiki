---
title: "Pay Overview"
description: "Overview of the Pay authentication and payment backend: purpose, consumers, request flow, and links to the other wiki pages."
---

# Pay

Pay is a standardized payment processing and user authentication backend for personal web application deployments. It provides JWT authentication, Stripe payment integration, and guest login ([README.md:3](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L3)). The project is described as the payment backend used by ServerlessWebTemplate ([CLAUDE.md:7](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/CLAUDE.md#L7)).

## At a glance

- Express 5 on TypeScript; Node 20.x is the documented runtime ([server/package.json:64](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/package.json#L64), [README.md:38](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L38)).
- Domain services come from `@jeffrey-keyser/pay-domain-core` and are assembled in a singleton container ([server/services/DomainServiceContainer.ts:1-8](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/services/DomainServiceContainer.ts#L1-L8), [server/services/DomainServiceContainer.ts:52-77](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/services/DomainServiceContainer.ts#L52-L77)).
- Primary API prefix is `/api/v1`; legacy paths are redirected ([server/app.ts:183-187](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/app.ts#L183-L187), [CLAUDE.md:56-61](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/CLAUDE.md#L56-L61)).
- The payment provider is chosen by `PAYMENT_PROVIDER`, whose schema accepts `stripe` or `mock` ([server/config/env.ts:53-57](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/config/env.ts#L53-L57)).
- Error responses carry a correlation ID ([server/app.ts:227-231](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/app.ts#L227-L231)).
- Documented deployment is a systemd service on a VPS updated by `deploy.sh` ([README.md:184-185](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L184-L185), [deploy.sh:22](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/deploy.sh#L22)). This snapshot does not include the systemd unit, so the live state is not verified here.

## Who uses it

- **Documented:** personal web app deployments ([README.md:3](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L3)) and ServerlessWebTemplate, which uses this project's types and the `pay-auth-integration` runtime code ([README.md:29-30](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/README.md#L29-L30)).
- **Not verified:** the excerpts do not show the concrete callers. See [Services and Dependencies](../services-and-dependencies/).

## Main flow

An inbound request enters Express, passes session, CORS, correlation, tracing, and version middleware ([server/app.ts:125-146](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/app.ts#L125-L146)). The `/api/v1` router aggregates route modules for users, payments, apps, OTP, and OAuth ([server/routes/v1/index.ts:33-69](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/routes/v1/index.ts#L33-L69)). Handlers call domain services, and a shared error handler maps failures to HTTP responses ([server/app.ts:210-235](https://github.com/Jeffrey-Keyser/pay/blob/b20e905b08aa915debd6fa262a1f8015368cdb05/server/app.ts#L210-L235)).

## Wiki pages

- [Architecture](../architecture/): components, contracts, and adapter selection.
- [Iteration Loop](../iteration-loop/): local workflow, checks, and deploy.
- [Services and Dependencies](../services-and-dependencies/): outbound dependencies and consumers.
- [Operations](../operations/): commands, health checks, and observability.
- [Glossary](../glossary/): project-specific terms.
