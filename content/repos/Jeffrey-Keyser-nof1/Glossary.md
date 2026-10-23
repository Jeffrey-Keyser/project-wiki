---
title: "nof1 Glossary"
description: "Project-specific terms used in nof1, with source citations for each definition."
---

# Glossary

**Experiment**
: The top-level container for a question under investigation ([README.md:L54](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/README.md#L54)). Each experiment is scoped to one owner ([server/dal/ExperimentDal.ts:L11-L16](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/dal/ExperimentDal.ts#L11-L16)).

**Phase**
: A time period with fixed conditions. The README calls it the most important structural concept ([README.md:L123-L125](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/README.md#L123-L125)). Phases have an `order` ([server/db/schema/001-nof1-tables.sql:L50](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/db/schema/001-nof1-tables.sql#L50)).

**Variable and is_controlled**
: An independent factor. `is_controlled` marks whether it is held constant or deliberately varied ([README.md:L89](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/README.md#L89)).

**Metric**
: A measured outcome. Its `prompt` is shown during logging to keep wording consistent ([README.md:L101](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/README.md#L101), [README.md:L119](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/README.md#L119)).

**Entry**
: One logging event. A phase may hold only one entry per calendar day ([server/dal/EntryDal.ts:L20-L25](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/dal/EntryDal.ts#L20-L25)).

**Observation and skipped**
: A single metric value within an entry. `skipped` means the metric was not measured that day ([README.md:L179](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/README.md#L179)).

**Quick log**
: The fast entry flow, which the README calls the most important UX in the app ([README.md:L18](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/README.md#L18)).

**Insight and ComputedInsight**
: Derived findings computed on request, not persisted ([server/types/domain.ts:L123-L125](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/types/domain.ts#L123-L125)). Confidence is low below 6 data points, medium from 6, and high from 16 ([server/dal/InsightDal.ts:L40-L42](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/dal/InsightDal.ts#L40-L42)). The README's older thresholds of 5 and 15 are superseded ([README.md:L229](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/README.md#L229)).

**Template and built-in template**
: A reusable experiment blueprint ([README.md:L192](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/README.md#L192)). Built-ins carry a stable `slug` used for idempotent seeding ([server/db/builtinTemplates.ts:L6-L7](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/db/builtinTemplates.ts#L6-L7)).

**Pay user**
: The authenticated owner id, read from the request. There is no anonymous fallback ([server/routes/requireUser.ts:L4-L12](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/routes/requireUser.ts#L4-L12)).

**Legacy owner**
: The sentinel owner `legacy`, assigned to experiments created before user scoping ([server/db/schema/002-experiments-user-id.sql:L12-L16](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/db/schema/002-experiments-user-id.sql#L12-L16)).

**Mockup review**
: The process for checking client screens against reference mockups at 393 by 852 ([MOCKUP_ALIGNMENT_PLAN.md:L15-L17](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/MOCKUP_ALIGNMENT_PLAN.md#L15-L17)).
