---
title: Pantry Manager
description: Standalone inventory service for products, pantry stock, and purchase history in the Jeffrey-Keyser ecosystem.
---

# Pantry Manager

Express 5 + PostgreSQL service that owns the inventory domain — products, pantry items, purchase history, receipt parsing, and reorder nudges. Backbone for the Pantry Intelligence roadmap (low-stock alerts, reorder suggestions, expiry tracking) and feeds Agency HQ's morning briefing ([README.md:3-10](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L3-L10)).

## At a glance

- **Stack** — Express 5, TypeScript, PostgreSQL 17 (`pantry_manager` DB, `pantry` schema), port 3052 ([README.md:13-17](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L13-L17))
- **Auth** — pay-auth-integration user resolution + project-wide `X-API-Key` middleware ([src/app.ts:27-48](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/app.ts#L27-L48), [src/middleware/api-key-auth.ts:6-20](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/middleware/api-key-auth.ts#L6-L20))
- **Resources** — products, pantry-items, receipts (Taggun OCR), nudges, admin ([src/routes/versions/v1/index.ts:11-15](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/routes/versions/v1/index.ts#L11-L15))
- **Client** — React 19 + Redux Toolkit + Vite SPA under `client/` ([client/package.json:11-18](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/client/package.json#L11-L18))
- **Deploy** — user systemd unit `pantry-manager.service`, served at `https://pantry-manager.jeffreykeyser.net` ([pantry-manager.service:1-23](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/pantry-manager.service#L1-L23), [README.md:49-58](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L49-L58))

## Who uses it

Cross-domain consumer: Agency HQ morning briefing pulls stock data. Future: meal planning, grocery list gen, line-item extraction from Ping transactions ([README.md:5-10](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L5-L10)).

## How work moves through it

Schema-first: migrations in `migrations/` define `pantry.*` tables → DAL functions in `src/dal/` wrap pool queries → versioned routers under `src/routes/versions/v1/` mount per resource → `src/app.ts` composes middleware via `express-server-factory`. Build with `tsc`, restart user systemd unit ([README.md:38-56](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L38-L56)).

## Wiki pages

- [Architecture](./architecture/)
- [Iteration Loop](./iteration-loop/)
- [Services and Dependencies](./services-and-dependencies/)
- [Operations](./operations/)
- [Glossary](./glossary/)
