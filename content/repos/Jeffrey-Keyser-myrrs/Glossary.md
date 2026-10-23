---
title: "Myrrs Glossary"
description: "Project-specific Myrrs terms with source citations, including places where the source uses inconsistent definitions."
---

# Glossary

Terms as they appear in source. Where sources disagree, both versions are noted.

**Routine.** A user-defined activity with name, ratings, duration, and status ([src/server/types/models/index.ts:L39-L62](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/types/models/index.ts#L39-L62)).

**Routine task.** A scheduled instance of a routine on a date, with a status and completion fields ([src/server/types/models/index.ts:L64-L84](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/types/models/index.ts#L64-L84)). Statuses include pending, completed, skipped, regretted, and rescheduled ([L74](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/types/models/index.ts#L74)).

**Routine streak.** Per-routine counters for current and longest streak, completions, skips, and regrets ([src/server/types/models/index.ts:L86-L101](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/types/models/index.ts#L86-L101)).

**Regret.** Replacing a scheduled task with another eligible routine. `regenerateRoutineTask` picks one at random ([src/server/routes/routines.ts:L190-L213](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/routines.ts#L190-L213)). `markRegretted` sets the regretted status ([src/server/dal/TaskRepository.ts:L260-L273](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/dal/TaskRepository.ts#L260-L273)).

**Chaos mode.** A schedule variant that raises the hour budget, shuffles routines, and jitters start times ([src/server/routes/routines.ts:L155-L188](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/routines.ts#L155-L188)). The preference flag is `chaosModeEnabled` ([src/server/types/models/index.ts:L123](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/types/models/index.ts#L123)).

**Rule.** A domain-core constraint evaluated by the rule engine. This repo registers temporal, max-daily-limit, and frequency rules ([src/server/routes/routines.ts:L43-L46](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/routines.ts#L43-L46)).

**Hard and soft constraint.** Hard constraints block scheduling; soft constraints influence scoring ([CLAUDE.md:L153-L154](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L153-L154)). The client labels temporal and linkage rules as hard and the rest as soft ([src/client/src/components/config/RuleCard.tsx:L60-L73](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/src/components/config/RuleCard.tsx#L60-L73)).

**Rule configuration.** A user's settings for one rule, including enabled state, priority, and parameters ([src/server/types/models/index.ts:L134-L148](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/types/models/index.ts#L134-L148)).

**User scheduling preferences.** Per-user settings for daily hours, time windows, rating weights, and chaos mode ([src/server/types/models/index.ts:L112-L132](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/types/models/index.ts#L112-L132)).

**Rating weights.** The model keys are enjoyability, difficulty, importance, and energy ([src/server/types/models/index.ts:L117-L122](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/types/models/index.ts#L117-L122)). The profile preference validator requires enjoyment, importance, and effort ([src/server/routes/profile.ts:L209](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/profile.ts#L209)). Verify the keys before use.

**Rarity tier.** Labels from baseline to mythic. The server averages three 1-10 ratings and applies cut-offs at 4, 6, 7, 8, and 9 ([src/server/routes/schedule.ts:L20-L31](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/schedule.ts#L20-L31)). The client uses cut-offs from 2.0 to 4.5 on the form's ratings ([src/client/src/components/config/RoutineCard.tsx:L36-L44](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/src/components/config/RoutineCard.tsx#L36-L44)). The labels match but the thresholds do not.

**PayAuth.** The external identity provider, configured through `PAY_SERVICE_URL` and wired by `setupPayAuth` ([src/server/app.ts:L38-L40](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L38-L40)).

**Pay UUID and myrrs user id.** `pay_uuid` is the PayAuth identity. `myrrs_user_id` is the local numeric key ([src/server/dal/UsersDal.ts:L3-L9](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/dal/UsersDal.ts#L3-L9)). Requests carry it as `req.userData.myrrsUserId` ([src/server/middleware/resolveUserData.ts:L29](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/middleware/resolveUserData.ts#L29)).

**UserResolutionService.** Gets or creates the mapping row, then provisions a local user with a generated username on first use ([src/server/services/UserResolutionService.ts:L13-L44](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/services/UserResolutionService.ts#L13-L44), [L70-L77](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/services/UserResolutionService.ts#L70-L77)).

**Myrrs schema.** The Postgres schema named by `DATABASE_SCHEMA` ([src/server/app.ts:L87](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L87)). CLAUDE.md documents it as `myrrs` ([CLAUDE.md:L195](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L195)).

**deploy.sh.** The repo-root script that pulls `main`, installs, builds both workspaces, and restarts both user units ([deploy.sh:L5-L23](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/deploy.sh#L5-L23)).
