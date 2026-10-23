---
title: "Services and Dependencies"
description: "What message-contracts depends on, and which consumers are confirmed versus only documented in source comments."
---

# Services and Dependencies

## Depends on

- **Runtime packages.** The provided `package.json` shows only development dependencies: TypeScript, ESLint, Vitest, and their plugins ([package.json:L29-L35](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/package.json#L29-L35)). No runtime dependencies section appears in that excerpt.
- **amqplib.** The README examples import `amqplib` ([README.md:L40](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/README.md#L40)). This is an example, not a declared dependency in the excerpt.
- **Other modules.** The exchange file imports Spanish vocabulary constants ([src/exchanges.ts:L8-L11](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/exchanges.ts#L8-L11)).

## Consumed by: confirmed

No consumer code is present in the provided excerpts, so no caller is confirmed from this repository alone.

## Consumed by: documented in source comments (not verified)

These are named in comments or declared names. They do not prove deployment.

- **cron-service UI.** The target registry says it is used there ([src/cron-targets.ts:L2-L5](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/cron-targets.ts#L2-L5)).
- **analytics-pulse.** Cron and Pay comments name it as a subscriber ([src/cron/events.ts:L21-L22](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/cron/events.ts#L21-L22), [src/pay/events.ts:L5-L7](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/pay/events.ts#L5-L7)).
- **agency-hq.** QA probe and Agency comments name it as a consumer and publisher ([src/qa/probes-events.ts:L6-L8](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/qa/probes-events.ts#L6-L8), [src/agency/events.ts:L4-L5](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/agency/events.ts#L4-L5)).
- **openclaw-bridge.** Reminder, summary, thrash, and Spanish modules declare queue names for it ([src/reminders/events.ts:L25-L32](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/reminders/events.ts#L25-L32), [src/spanish/events.ts:L52-L64](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/spanish/events.ts#L52-L64)). Consumer status is unknown.
- **Spanish Studio and Spanish Tutor.** Vocabulary comments name them as producers ([src/spanish/vocabulary-seed-events.ts:L32](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/spanish/vocabulary-seed-events.ts#L32), [L59](https://github.com/Jeffrey-Keyser/message-contracts/blob/95d5d12e4d2de5407329ffd5a5406e470b0ec0f8/src/spanish/vocabulary-seed-events.ts#L59)).

Other callers may exist. They are unknown from these excerpts.
