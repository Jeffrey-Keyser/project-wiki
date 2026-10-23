---
title: "Pantry Manager"
description: "Overview of the Pantry Manager inventory service: what it owns, who calls it, how requests flow, and where to read next."
---

# Pantry Manager

Pantry Manager is a standalone inventory management service for the Jeffrey-Keyser ecosystem. It tracks products, pantry stock levels, and purchase history with a data model that is independent of Ping's transaction layer ([README.md:L3](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/README.md#L3)). The README states its goals as owning the inventory domain, backing a Pantry Intelligence roadmap, feeding cross-domain insights, and providing a line-item capture foundation ([README.md:L7-L10](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/README.md#L7-L10)).

## At a glance

- **Package** — `pantry-manager` 0.1.0, marked private, a Node service rather than a published library ([package.json:L2-L4](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/package.json#L2-L4)).
- **Stack** — Express 5 and TypeScript; PostgreSQL 17 with a `pantry` schema as documented in the README ([README.md:L14-L15](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/README.md#L14-L15)).
- **Port** — 3052 by default in config ([src/config/env.ts:L24](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/config/env.ts#L24)).
- **Auth** — Pay-auth user resolution plus an API key check for non-public paths ([src/app.ts:L27-L48](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/app.ts#L27-L48), [src/middleware/api-key-auth.ts:L4-L20](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/middleware/api-key-auth.ts#L4-L20)).
- **Resources** — products, pantry-items, receipts, nudges, admin, and authority, mounted under the v1 router ([src/routes/versions/v1/index.ts:L12-L17](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/routes/versions/v1/index.ts#L12-L17)).
- **Client** — a React SPA in `client/` that lists pantry items ([client/src/pages/DashboardPage.tsx:L6](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/client/src/pages/DashboardPage.tsx#L6)).

## Who uses it

- **Confirmed in source:** the bundled SPA calls `/api/v1/pantry-items` through RTK Query ([client/src/store/api/pantryItems.ts:L23](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/client/src/store/api/pantryItems.ts#L23), [client/src/store/api/pantryItems.ts:L35](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/client/src/store/api/pantryItems.ts#L35)).
- **Documented only:** the README says Agency HQ's morning briefing is already wired to stock data ([README.md:L9](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/README.md#L9)). No consumer code is in the excerpts, so this is unverified here.
- **Roadmap:** meal planning and grocery list generation are future integrations ([README.md:L9](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/README.md#L9)).

## Main flow

A request enters the Express app, passes API key checks and user resolution, then reaches a versioned router. Routers call DAL functions that issue `pg` pool queries ([src/app.ts:L86-L104](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/app.ts#L86-L104), [src/db/connection.ts:L4](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/db/connection.ts#L4)).

Writes to products and pantry items require receipt lineage. Without it, the API returns a 422 with code `receipt-required` ([src/dal/inventoryLineage.ts:L1-L2](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/inventoryLineage.ts#L1-L2), [src/routes/versions/v1/pantry-items.ts:L31-L34](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/routes/versions/v1/pantry-items.ts#L31-L34)). This is a notable departure from the README's plain CRUD description ([README.md:L19-L36](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/README.md#L19-L36)).

## Explore

- [Architecture](../architecture/) — components, contracts, and request layers.
- [Iteration Loop](../iteration-loop/) — how contributors change and ship code.
- [Services and Dependencies](../services-and-dependencies/) — outbound integrations and known callers.
- [Operations](../operations/) — commands, deployment, health, and logs.
- [Glossary](../glossary/) — project-specific terms.
