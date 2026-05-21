---
title: Glossary
description: Repo-specific terms used in Pantry Manager.
---

# Glossary

**Product** — Catalog entity; a unique purchasable SKU with name, category, default unit, optional barcode. Defined by `pantry.products` table and the `Product` interface ([src/dal/products.ts:3-11](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/dal/products.ts#L3-L11), [migrations/1710600000000_initial-pantry-schema.ts:8-18](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/migrations/1710600000000_initial-pantry-schema.ts#L8-L18)).

**Pantry item** — A specific user's current stock of a product: quantity, unit, purchase date, expiry, reorder threshold. Joins `pantry.products` via `product_id` and scopes by `user_id` ([migrations/1710600000000_initial-pantry-schema.ts:24-41](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/migrations/1710600000000_initial-pantry-schema.ts#L24-L41)).

**Purchase history** — Time-series record of purchases per product per user; backbone for cycle-time analysis driving nudges ([migrations/1710600000000_initial-pantry-schema.ts:44-50](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/migrations/1710600000000_initial-pantry-schema.ts#L44-L50)).

**Low-stock** — Pantry items where `quantity <= reorder_threshold`. Surfaced via `GET /api/v1/pantry-items/low-stock` ([README.md:36](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L36)).

**Nudge** — Reorder suggestion derived from purchase cadence. Each nudge has an avg-days-between-purchases, days-overdue, confidence score, and a data source of either `category_prior` or `personal_history` ([src/dal/nudges.ts:7-17](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/dal/nudges.ts#L7-L17)).

**Confidence score** — Numeric weighting of nudge trust based on observed cycle count; ≥5 cycles = 0.9 in the current scoring step ([src/dal/nudges.ts:39-40](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/dal/nudges.ts#L39-L40)).

**Non-perishable categories** — Whitelist (`household`, `pantry`, `dry-goods`, `dairy-alt`, `beverages`) used to gate which products are eligible for cycle-based nudges ([src/dal/nudges.ts:3](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/dal/nudges.ts#L3)).

**Default cycle days** — Fallback expected reorder interval (14 days) when no personal history exists ([src/dal/nudges.ts:5](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/dal/nudges.ts#L5)).

**Receipt parse** — Multer-uploaded receipt file shipped to Taggun OCR; line items above confidence threshold 0.7 become products + purchase rows ([src/dal/receipts.ts:4-37](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/dal/receipts.ts#L4-L37)).

**pay_uuid** — External user identifier from the pay-auth service; upserted into `pantry.users` and mapped to a local integer `id` by the user-resolution middleware ([src/app.ts:28-44](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/app.ts#L28-L44)).

**Seed from Ping** — Backfill path that hydrates products and purchase history from Ping transactions; lives in `src/dal/seed-from-ping.ts` and supports the line-item capture roadmap ([README.md:10](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L10)).

**API key (PANTRY_MANAGER_API_KEY)** — Service-wide shared secret required on every non-public request via `X-API-Key` header or `Authorization: Bearer`; boot fails if unset ([src/middleware/api-key-auth.ts:11-19](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/middleware/api-key-auth.ts#L11-L19), [src/config/env.ts:52-55](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/config/env.ts#L52-L55)).
