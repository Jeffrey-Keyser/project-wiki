---
title: Glossary
description: Repo-specific terms used in the Life codebase — voice pipeline stages, data shapes, and infra names.
---

# Glossary

### Voice entry pipeline

The five-stage flow that takes a recording from microphone to saved journal entry: **record → transcribe → structure → resolve ambiguities → save**. Implemented across `server/services/voiceEntry.ts` and `server/routes/voiceEntry.ts` ([CLAUDE.md:101-105](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L101-L105)).

### Structure (verb)

The AI step that takes a raw Whisper transcript and produces a punctuated rewrite, a generated title, and fuzzy-matched `@mention` and `#tag` candidates. Runs through GPT-4o-mini behind the AI Proxy ([README.md:21](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L21), [CLAUDE.md:103](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L103)).

### Ambiguity resolution

When the AI is uncertain which existing person or tag a token maps to, the user confirms via chips on the same screen — still without typing. The frontend surface is the `AmbiguityResolver` ([README.md:22](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L22), [CLAUDE.md:104](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L104)).

### Edges

Bidirectional links between two journal entries that share at least one person or tag. Recalculated automatically when an entry changes; the table is `journal_entry_edge` ([CLAUDE.md:107-109](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L107-L109), [CLAUDE.md:139](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L139)).

### `@mention` / `#tag`

In-entry markup. `@mention` resolves to a row in `persons` via `journal_entry_person`; `#tag` resolves to a row in `tag` via `journal_entry_tag` ([CLAUDE.md:130-137](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L130-L137)).

### `life` schema

The Postgres schema that holds the local user registry — `life.users` rows with `pay_uuid` and `email`, plus the atomic upsert `life.get_or_create_user(pay_uuid, email)` used by auto-provisioning ([CLAUDE.md:122-124](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L122-L124)).

### `public` schema

The application schema: `journal`, `user_journal`, `journal_entry`, `persons`, `tag`, `journal_entry_edge`, `journal_entry_image`, and the join tables that wire entries to people and tags ([CLAUDE.md:126-140](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L126-L140)).

### API response envelope

The `{ success: true, data: T }` wrapper applied to all server responses via `server/utils/response.ts` and unwrapped globally by the RTK Query `baseQuery` in `client/src/reducers/journal.api.ts` ([CLAUDE.md:143-144](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L143-L144)).

### Pay auth integration

The SSO library (`@jeffrey-keyser/pay-auth-integration`) and the Express middleware (`payAuthMiddleware.ts`) that validate Pay-issued tokens, map a `pay_uuid` to a local Life user, and create a default journal for new users on first login ([CLAUDE.md:147-150](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L147-L150)).

### AI Proxy

An external Jeffrey-Keyser service that fronts Whisper and GPT-4o-mini. Life sends all AI calls through it via `server/services/aiProxy.ts`; configured by `AI_PROXY_URL` and `AI_PROXY_API_KEY` ([README.md:84-85](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L84-L85), [CLAUDE.md:163-167](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L163-L167)).

### beelink

The self-hosted mini-PC that runs both systemd units, the Postgres container, and is fronted by Cloudflare Tunnel — the only production host for Life ([CLAUDE.md:56-61](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L56-L61)).

### `beelink-deploy`

The webhook listener at `https://deploy.jeffreykeyser.net/webhook` that validates the GitHub signature and runs `./deploy.sh` on the host when `master` advances ([CLAUDE.md:79-83](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L79-L83)).

### Correlation ID

The per-request UUID added by `server/middleware/correlationId.ts` and included in every Winston log line. Mounted first in `server/app.ts` so it is set before any other middleware can log ([server/app.ts:56-57](https://github.com/Jeffrey-Keyser/Life/blob/master/server/app.ts#L56-L57)).

### Synopsis embedding

A vector representation of a person or tag synopsis, generated locally by `@xenova/transformers`, prepared at deploy time via `scripts/prepare-models.ts` and backfilled by `scripts/backfill-embeddings.ts` ([deploy.sh:13-15](https://github.com/Jeffrey-Keyser/Life/blob/master/deploy.sh#L13-L15), [deploy.sh:29-31](https://github.com/Jeffrey-Keyser/Life/blob/master/deploy.sh#L29-L31)).
