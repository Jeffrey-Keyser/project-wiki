---
title: "Spanish Studio Home"
description: "Overview of the spanish-studio practice app, its runtime pieces, learner flow, and links to the other wiki pages."
---

# Spanish Studio

Spanish Studio is an interface-driven, voice-centric Spanish practice surface. It sits beside the spanish-tutor project, reusing the `spanish.*` schema in the `ping` database for level, vocabulary, SM-2, and sessions, and adds a web UI and voice pipeline ([README.md:3-5](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L3-L5)).

## At a glance

- Live site: spanish-studio.jeffreykeyser.net ([README.md:7](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L7)).
- Server: TypeScript and Express, default port 3054 ([README.md:31](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L31), [env.ts:72](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/config/env.ts#L72)).
- Client: React, Vite, and Redux Toolkit, port 3055 ([README.md:32](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L32)).
- Intonation sidecar: Flask service, loopback port 3056 by default ([app.py:153-154](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/intonation-sidecar/app.py#L153-L154)).
- README status lists AI role-play, pronunciation review, and F0 intonation as shipped ([README.md:15-24](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L15-L24)). The Reading Workbench is also listed as a feature ([README.md:25-27](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L25-L27)).

## Who uses it

- **Learners** run role-play scenes with AI personas, record turns, and review pronunciation and coach feedback ([README.md:15-24](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L15-L24)).
- **Developers** run the server and client locally; the Vite dev server proxies `/api` to the server ([README.md:42-52](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L42-L52), [vite.config.ts:18-19](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/client/vite.config.ts#L18-L19)).
- **QA automation** can run a four-step live HTTP workflow against the public service ([README.md:75-81](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L75-L81)).

## Main flow

1. Starting a conversation selects a level-eligible persona, or honors a requested persona only when it is eligible ([conversation-start.ts:338-342](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/lib/conversation-start.ts#L338-L342)).
2. Each learner turn is persisted, then followed by a bounded batch of persona turns ([conversation-advance.ts:49](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/lib/conversation-advance.ts#L49), [conversation-advance.ts:159-164](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/lib/conversation-advance.ts#L159-L164)).
3. Spanish lines are synthesized and cached on disk; a cache hit never calls Azure ([tts.ts:57-70](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/routes/versions/v1/tts.ts#L57-L70)).
4. Ending a conversation completes it and generates coach review data ([README.md:123](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L123), [conversation-complete.ts:157-184](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/lib/conversation-complete.ts#L157-L184)).
5. The Reading Workbench runs separately: source, passage, attempt, OCR, analysis, then observation triage ([README.md:126-134](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L126-L134)).

## Pages

- [Architecture](../architecture/): components and contracts.
- [Iteration loop](../iteration-loop/): contributor workflow.
- [Services and dependencies](../services-and-dependencies/): what the app depends on and who calls it.
- [Operations](../operations/): start, deploy, test, health, and observability.
- [Glossary](../glossary/): project terms.
