---
title: "nof1 Experiment Tracker"
description: "Start here: what the nof1 personal N-of-1 experiment tracker does, its main flow, and where to find details."
---

# nof1 Experiment Tracker

nof1 is a personal framework for running structured experiments on everyday questions, with enough rigor to learn something from the results ([README.md:L3-L4](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/README.md#L3-L4)). It adds lightweight structure through phases, observations, and simple comparisons ([README.md:L10](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/README.md#L10)).

## At a glance

- **Backend:** Express 5 and TypeScript on port 3060 ([CLAUDE.md:L12](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/CLAUDE.md#L12)). The config default is also 3060 ([server/config/env.ts:L39](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/config/env.ts#L39)).
- **Frontend:** React 19 and Vite single-page app on port 3061 ([client/vite.config.ts:L7](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/client/vite.config.ts#L7)).
- **Database:** PostgreSQL tables in the `nof1` schema ([server/db/schema/001-nof1-tables.sql:L4](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/db/schema/001-nof1-tables.sql#L4)).
- **Auth:** Pay auth routes mounted at `/auth` ([server/app.ts:L140](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/app.ts#L140)).
- **Health:** `/health` includes a database check ([server/app.ts:L106-L114](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/app.ts#L106-L114)).

## Who uses it

The README describes a single-user app with no accounts, collaboration, or sharing ([README.md:L22](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/README.md#L22)). The server is more specific: each experiment belongs to an authenticated Pay user, and reads and writes are filtered by that owner ([server/dal/ExperimentDal.ts:L11-L16](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/dal/ExperimentDal.ts#L11-L16)). The bundled React client is the only confirmed caller in these excerpts.

## Main flow

1. Create an experiment with a question and optional hypothesis ([server/routes/versions/v1/experiments.ts:L108-L124](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/routes/versions/v1/experiments.ts#L108-L124)).
2. Define variables and metrics ([server/routes/versions/v1/variables.ts:L104-L115](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/routes/versions/v1/variables.ts#L104-L115), [server/routes/versions/v1/metrics.ts:L108-L119](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/routes/versions/v1/metrics.ts#L108-L119)).
3. Split the experiment into phases with fixed conditions ([server/routes/versions/v1/phases.ts:L107-L118](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/routes/versions/v1/phases.ts#L107-L118)).
4. Quick-log an entry with observations ([server/routes/versions/v1/entries.ts:L145-L163](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/routes/versions/v1/entries.ts#L145-L163)). A phase accepts only one entry per calendar day ([server/dal/EntryDal.ts:L20-L25](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/dal/EntryDal.ts#L20-L25)).
5. Read computed comparisons, trends, and coverage checks ([server/dal/InsightDal.ts:L290-L297](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/dal/InsightDal.ts#L290-L297)).

Templates can also spawn an experiment with predefined variables, metrics, and phases ([server/routes/versions/v1/templates.ts:L219-L233](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/routes/versions/v1/templates.ts#L219-L233)).

## Explore

- [Architecture](../architecture/)
- [Iteration Loop](../iteration-loop/)
- [Services and Dependencies](../services-and-dependencies/)
- [Operations](../operations/)
- [Glossary](../glossary/)
