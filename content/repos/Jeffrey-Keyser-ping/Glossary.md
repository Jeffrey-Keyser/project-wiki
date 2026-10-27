---
title: "Ping Glossary"
description: "Project-specific Ping terms with source citations."
---

# Glossary

**Ping.** The product name, and also a location record (GPS sample) stored in the pings table through `PingDal` ([README.md:L1-L3](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L1-L3), [server/dal/PingDal.ts:L24-L28](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/dal/PingDal.ts#L24-L28)).

**Ambient signal.** A passive event from everyday routines, such as a Bluetooth connect, that can trigger automation ([README.md:L7](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L7)).

**Passive signal.** One of three integration properties. Examples include a WiFi join, a Bluetooth connect, or a charger plug-in ([README.md:L12](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L12)).

**Compound signal context.** Combining several weak signals into one specific inference, such as leaving home plus car Bluetooth at a given time ([README.md:L16](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L16)).

**Zone.** A named geographic area. `ZoneResolutionService` picks the closest zone whose radius contains a point, and prefers the smaller radius on ties ([server/domain/services/ZoneResolutionService.ts:L9-L14](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/domain/services/ZoneResolutionService.ts#L9-L14)). A location request can also name a zone by `zoneId`, which bypasses coordinate matching ([server/domain/services/PingService.ts](https://github.com/Jeffrey-Keyser/ping/blob/c7a003f89bb14a959bb433f8aa02a61ac81775ed/server/domain/services/PingService.ts)).

**Minimum stay (`dwellMinutes`).** A per-zone setting, a whole number from 0 to 1440 with a default of 5. An arrival counts as a visit only after this many minutes. Zero counts arrivals immediately ([server/routes/zones.ts](https://github.com/Jeffrey-Keyser/ping/blob/c7a003f89bb14a959bb433f8aa02a61ac81775ed/server/routes/zones.ts), [server/db/schema/027-visit-dwell.sql](https://github.com/Jeffrey-Keyser/ping/blob/c7a003f89bb14a959bb433f8aa02a61ac81775ed/server/db/schema/027-visit-dwell.sql)).

**Pending arrival.** An arrival saved in `ping.pending_arrivals` while its minimum stay runs. It ends as `confirmed`, `passing_through`, or `superseded` ([server/services/ArrivalDwellService.ts](https://github.com/Jeffrey-Keyser/ping/blob/c7a003f89bb14a959bb433f8aa02a61ac81775ed/server/services/ArrivalDwellService.ts), [server/db/schema/027-visit-dwell.sql](https://github.com/Jeffrey-Keyser/ping/blob/c7a003f89bb14a959bb433f8aa02a61ac81775ed/server/db/schema/027-visit-dwell.sql)).

**Passing through.** A short stop whose departure comes before the minimum stay ends. It creates no visit and no arrival event ([docs/MOBILE_INTEGRATION.md](https://github.com/Jeffrey-Keyser/ping/blob/c7a003f89bb14a959bb433f8aa02a61ac81775ed/docs/MOBILE_INTEGRATION.md)).

**Visit.** A stay in a zone with arrival and departure pings. At most one active visit per user is enforced by a partial unique index ([server/dal/VisitDal.ts:L49-L58](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/dal/VisitDal.ts#L49-L58)). With the minimum stay in place, a visit starts at the original arrival time once it qualifies ([docs/MOBILE_INTEGRATION.md](https://github.com/Jeffrey-Keyser/ping/blob/c7a003f89bb14a959bb433f8aa02a61ac81775ed/docs/MOBILE_INTEGRATION.md)).

**Drive.** A car trip recorded by a drive row and optional waypoints. Drives start and end on Bluetooth events and can stream over WebSocket ([docs/DRIVE_TRACKING.md:L7-L13](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/DRIVE_TRACKING.md#L7-L13), [server/dal/DriveDal.ts:L40-L44](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/dal/DriveDal.ts#L40-L44)).

**Bluetooth event.** An inbound connect or disconnect report from a Shortcut. The connect route publishes an event and can start a drive ([server/routes/bluetooth.ts:L53-L71](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/bluetooth.ts#L53-L71)).

**X-Ping-Key.** The header carrying the API key used by Shortcuts. The connectivity route checks presence only ([server/routes/connectivity.ts:L8](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/connectivity.ts#L8), [README.md:L73](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L73)).

**X-Idempotency-Key.** An optional client key for safe resends of location captures ([docs/MOBILE_INTEGRATION.md:L78](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/MOBILE_INTEGRATION.md#L78)). Retries should reuse the same key and the original `capturedAt` value ([docs/MOBILE_INTEGRATION.md](https://github.com/Jeffrey-Keyser/ping/blob/c7a003f89bb14a959bb433f8aa02a61ac81775ed/docs/MOBILE_INTEGRATION.md)).

**Replay completion.** The rule that a keyed capture returns its saved result, and an unfinished one returns HTTP 500 for retry or 409 for reconciliation ([docs/MOBILE_INTEGRATION.md:L345-L351](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/MOBILE_INTEGRATION.md#L345-L351)).

**Shortcut link.** An iCloud URL for an installer shortcut, served by `/api/v1/shortcuts/links` ([server/routes/shortcuts.ts:L47-L51](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/shortcuts.ts#L47-L51)).

**Pay service / PayAuth.** The external auth service at the Pay URL, integrated through `setupPayAuth` ([server/app.ts:L70](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L70), [server/app.ts:L81](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L81)). `AGENTS.md` requires one instance per app ([AGENTS.md:L17](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/AGENTS.md#L17)). A Pay principal whose id is not a UUID, such as the system admin token, cannot resolve to a Ping user. It gets a 401 on user-scoped `/api` routes and skips resolution on public routes and `/auth/*` ([server/middleware/auth.ts:L61-L88](https://github.com/Jeffrey-Keyser/ping/blob/4251764f43dc5cf7c361dc50848d3035afaab269/server/middleware/auth.ts#L61-L88)).

**JEFF_USER_ID.** A hard-coded account ID. The publisher sends events only for this account ([server/services/EventPublisher.ts:L6-L7](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/EventPublisher.ts#L6-L7)).

**PingExchange.** The RabbitMQ exchange name and routing keys from `@jeffrey-keyser/message-contracts` ([server/services/EventPublisher.ts:L69-L73](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/EventPublisher.ts#L69-L73)).

**DAL.** The Data Access Layer. Each class wraps raw parameterized SQL and requires a `userId` ([server/dal/DriveDal.ts:L37-L38](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/dal/DriveDal.ts#L37-L38)).

**Grocery zone provisioning.** A manual CLI that bulk-creates zones for one selected account in a single transaction ([server/scripts/groceryZoneProvisioning.ts:L4-L18](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/scripts/groceryZoneProvisioning.ts#L4-L18)).

**Capture health.** A per-source report showing whether each capture source is still sending data ([server/routes/capture-health.ts:L14-L19](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/capture-health.ts#L14-L19)).

**Runtime incident capture.** Forwarding of backend 5xx responses and browser errors to a shared incident transport, enabled by environment flags ([README.md:L142-L144](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L142-L144)).

**agents:verify block.** The marked bash block in `AGENTS.md` that a coding agent runs before finishing ([AGENTS.md:L33-L35](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/AGENTS.md#L33-L35)).

**beelink-deploy.** The webhook service that runs `deploy.sh` on push to `main` ([README.md:L63](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L63)).

**Analytics Pulse.** The external telemetry endpoint Ping sends fire-and-forget events to ([server/services/telemetry.ts:L11-L13](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/telemetry.ts#L11-L13)).
