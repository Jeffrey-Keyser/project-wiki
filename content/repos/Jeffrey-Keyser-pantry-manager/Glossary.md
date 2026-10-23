---
title: "Glossary"
description: "Project-specific Pantry Manager terms, each tied to the source that defines it."
---

# Glossary

**Product** — A named catalog entry with optional category, default unit, and barcode. The DAL type and create path live in ([src/dal/products.ts:L4-L22](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/products.ts#L4-L22)). Product names are matched case-insensitively during receipt parsing ([src/dal/receipts.ts:L122-L126](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/receipts.ts#L122-L126)).

**Pantry item** — A user's stock record for a product, with quantity, unit, purchase time, expiry, and reorder threshold ([src/dal/pantry-items.ts:L4-L19](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/pantry-items.ts#L4-L19)).

**Purchase history** — Per-user purchase rows keyed by product. Nudge logic reads these rows ([src/dal/receipts.ts:L141-L155](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/receipts.ts#L141-L155)).

**Low stock** — Pantry items where `quantity <= reorder_threshold` ([src/dal/pantry-items.ts:L148-L163](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/pantry-items.ts#L148-L163)).

**Receipt lineage** — The receipt, receipt run, and run-ingredient identifiers that every inventory write must include. Aliases such as `run_id` are accepted ([src/dal/inventoryLineage.ts:L6-L10](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/inventoryLineage.ts#L6-L10), [src/dal/inventoryLineage.ts:L47-L60](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/inventoryLineage.ts#L47-L60)).

**Receipt-required** — The error and 422 code returned when lineage is missing ([src/dal/inventoryLineage.ts:L1-L4](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/inventoryLineage.ts#L1-L4), [src/routes/versions/v1/products.ts:L17-L19](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/routes/versions/v1/products.ts#L17-L19)).

**Authority report** — A count of rows missing any lineage field, flagged `authoritative` only when the count is zero ([src/dal/authority.ts:L4](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/authority.ts#L4), [src/dal/inventoryLineage.ts:L114-L119](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/inventoryLineage.ts#L114-L119)).

**Nudge** — An overdue reorder suggestion with cycle length, days overdue, confidence, and data source ([src/dal/nudges.ts:L7-L17](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/nudges.ts#L7-L17), [src/dal/nudges.ts:L119](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/nudges.ts#L119)).

**Confidence score** — Nudge trust, which is 0.9 at five or more cycles, 0.75 at four, 0.6 at three, and 0 otherwise ([src/dal/nudges.ts:L39-L44](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/nudges.ts#L39-L44)).

**Category frequency** — A per-category median interval with a `low`, `medium`, or `high` confidence label. It requires at least three intervals ([src/dal/nudges.ts:L169](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/nudges.ts#L169), [src/dal/nudges.ts:L226-L229](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/nudges.ts#L226-L229)).

**Non-perishable categories** — The allowlist of categories eligible for cycle-based nudges ([src/dal/nudges.ts:L3](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/nudges.ts#L3)).

**Default cycle days** — The 14-day fallback interval when no better data exists ([src/dal/nudges.ts:L5](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/nudges.ts#L5)).

**Receipt parse** — Upload an image to `/receipts/parse`, send it to Taggun, and keep lines with confidence at least 0.7 ([src/dal/receipts.ts:L55](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/receipts.ts#L55), [src/routes/versions/v1/receipts.ts:L10](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/routes/versions/v1/receipts.ts#L10)).

**pay_uuid** — The external Pay user ID, upserted into `pantry.users` to produce a local integer `id` ([src/app.ts:L27-L43](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/app.ts#L27-L43)).

**Seed from Ping** — The admin-triggered import of Ping grocery expenses, deduplicated per product per day ([src/dal/seed-from-ping.ts:L72-L80](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/seed-from-ping.ts#L72-L80)).

**API key** — `PANTRY_MANAGER_API_KEY`, the shared secret for non-public requests ([src/middleware/api-key-auth.ts:L15](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/middleware/api-key-auth.ts#L15)).
