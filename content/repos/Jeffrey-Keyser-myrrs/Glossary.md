---
title: Glossary
description: Repo-specific terms used across Myrrs code and docs.
---

# Glossary

**Myrrs.** "My Random Routine Scheduler" — the product. Probability-based, streak-aware daily routine scheduler ([CLAUDE.md:7](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L7)).

**Routine.** A user-defined recurring activity with ratings and probability, persisted in the `routines` table ([CLAUDE.md:78-81](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L78-L81), [src/server/dal/RoutineRepository.ts](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/dal/RoutineRepository.ts)).

**Routine task.** A concrete scheduled instance of a routine on a given day; completion is tracked on this row, not the routine itself ([CLAUDE.md:79](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L79), [src/server/dal/TaskRepository.ts](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/dal/TaskRepository.ts)).

**Streak.** Counters and metrics tracked per routine in `routine_streaks`, consumed by the rule engine to bias future scheduling ([CLAUDE.md:80](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L80)).

**Rule.** Constraint evaluated by the rule engine. Comes from `@jeffrey-keyser/myrrs-domain-core`; subtypes include temporal and streak rules ([CLAUDE.md:96-103](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L96-L103), [src/server/package.json:18](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/package.json#L18)).

**Rule engine.** Orchestrator that runs all registered rules and returns a `RuleEvaluationResult`. Hard constraints block scheduling; soft constraints influence scoring ([CLAUDE.md:119-124](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L119-L124)).

**Rule configuration.** Per-user customization of how a rule is applied, stored in `user_rule_configurations` and accessed via `RuleConfigurationRepository` ([src/server/dal/RuleConfigurationRepository.ts](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/dal/RuleConfigurationRepository.ts), [CLAUDE.md:42-44](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L42-L44)).

**User scheduling preferences.** User-tunable knobs (time windows, frequency caps) that feed the scheduler, kept in `user_scheduling_preferences` ([CLAUDE.md:81](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L81), [src/server/dal/UserSchedulingPreferencesRepository.ts](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/dal/UserSchedulingPreferencesRepository.ts)).

**PayAuth.** External identity provider at `pay.jeffreykeyser.net`. Myrrs wires it via `setupPayAuth` from `@jeffrey-keyser/pay-auth-integration`, which mounts `/auth/*` routes and a session-aware middleware ([src/server/app.ts:38-51](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L38-L51)).

**UserResolutionService.** Local service that maps a PayAuth-authenticated principal to a Myrrs `users` row, auto-provisioning on first request ([src/server/app.ts:34-35](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L34-L35), [src/server/services/UserResolutionService.ts](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/services/UserResolutionService.ts)).

**`resolveUserData` middleware.** Express middleware that runs after PayAuth and attaches the resolved Myrrs user record to the request before any business route ([src/server/app.ts:120](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L120), [src/server/middleware/resolveUserData.ts](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/middleware/resolveUserData.ts)).

**Domain core.** The `@jeffrey-keyser/myrrs-domain-core` package — owns scheduling primitives, `Rule`/`RuleEngine`, and is called directly from route handlers now that the local `services/routines` wrappers were removed ([src/server/services/routines/index.ts:1-3](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/services/routines/index.ts#L1-L3)).

**`myrrs` schema.** Postgres schema name (env `DATABASE_SCHEMA=myrrs`) inside the shared `jkeyser` database, used for table isolation from other apps on the same instance ([CLAUDE.md:174-181](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L174-L181)).

**`deploy.sh`.** Repo-root one-shot deploy script: pull, build both workspaces, restart both systemd units ([deploy.sh:1-23](https://github.com/Jeffrey-Keyser/myrrs/blob/main/deploy.sh#L1-L23)).
