---
title: Requirements and acceptance checks
description: How authoritative Logos documents, the indexed ledger, acceptance checks, verdicts and parity receipts relate on the Projects Requirements view. Documents the deployed revision 4523d08, observed 2026-10-29; this is not a live project health report.
---

# Requirements and acceptance checks

This guide explains how the Requirements view on a project page fits together. It covers what each dimension means, how owner-governed acceptance checks change a verdict, and why a parity receipt is not always the same as sustained parity. Everything here describes deployed revision `4523d08`, observed 2026-10-29, except where a later source revision is cited. It does not report whether any project is currently healthy. For the page itself, start from [the overview](../home/) and the [Projects guide](../projects-guide/).

## Four dimensions that do not collapse

The Requirements view mixes several different facts. Keep them apart when you read it.

- **Authoritative Logos documents.** The Logos context is the source of truth. Reconciliation reads a complete snapshot of it, and a context change event or recovery fingerprint mismatch starts a new run. Requirement coverage on the project is one of `unknown`, `indexed`, `unindexed`, `stale`, or `intentionally-loopless`, and a project needs a Dev Inbox ledger loop before activation or admission unless it is registered as loopless ([docs/project-reconciliation.md L65-L74](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L65-L74); [L96-L100](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L96-L100)).
- **Derived indexed ledger.** The indexer carves requirement IDs from the documents. The ledger is derived data, not the document itself. Each indexer or checker pass writes a bounded evidence row with its pass ID, loop and corpus binding, selected IDs, and failures ([L76-L83](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L76-L83)).
- **Satisfaction.** Satisfaction is a verdict per requirement, written to `satisfaction.json`. Requirements decided by executable checks carry `source: acceptance`; the judged checker decides the rest ([L363-L369](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L363-L369)).
- **Dirty and recheck.** A row is dirty when its evidence no longer matches the current corpus or code. The header counts rows needing recheck separately from open, covered, and total rows ([src/routes/dashboard/templates/project-requirements.ts L251-L279](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-requirements.ts#L251-L279)).

The header states that open, recheck, and coverage overlap and are not four partitions of the total. A single requirement can be open, need recheck, and be covered by a locked check at the same time. Do not add the counts up.

Coverage is also not the same as a verdict. The index label can read Indexed while a row is unsatisfied, and a Stale index label overrides the others when satisfaction data is stale or unavailable ([L255-L257](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-requirements.ts#L255-L257)).

## Requirements subviews, filters and inspector

The Requirements tab has three subviews: **Requirements**, **Acceptance checks**, and **Pass history**. Each has its own filters ([L282-L300](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-requirements.ts#L282-L300)).

- **Requirements** filters by verdict (satisfied, unsatisfied, blocked, unknown), by recheck state, and by coverage (locked check, contested check, or none). A grouping option groups rows by source.
- **Acceptance checks** filters by lifecycle state, latest result, kind, and evidence strength. The page notes that Locked is a governance state, not a result.
- **Pass history** shows only the newest retained passes. Its note states that committed means the pass wrote its output, not that every row succeeded.

The inspector on a requirement shows the verdict, freshness, the latest recorded explanation, the linked acceptance checks, source and evidence SHA, and the recent checker passes that selected this ID. The explanation section says when no explanation exists that this is not a passing check. The inspector also labels the passes list as selections, not a verdict history ([L392-L410](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-requirements.ts#L392-L410)).

A check inspector shows the state, kind, measurement, the latest result with its output tail, the result history, and technical details such as the environment, environment version, script hash, bound SHAs, and proofs ([L412-L455](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-requirements.ts#L412-L455)).

## Governance versus results

An acceptance check has two separate properties.

- **Governance state** says whether the check may gate a requirement. The states are `locked`, `contested`, `stale`, `declined`, `retired`, and `promoted`. A locked gate or census can decide evidence; a lead remains advisory. A contested check does not gate, because a spot-check disagreed, and the requirement falls back to judged evidence until the owner relocks it ([src/types/project-acceptance.ts L1-L9](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/types/project-acceptance.ts#L1-L9); [template L412-L461](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-requirements.ts#L412-L461)).
- **Result** is what the latest run measured: pass, fail, regressed, or error, plus an outcome (pass, fail, inconclusive, or unavailable).

A locked state records the governance decision; a passing result records one measurement. A contested check can show a passing last execution. Read the state first, then the result.

Owner-governed means the owner-authenticated project API and Agency's own drafting pass are the only writers. Reconciliation agents and Dev Inbox workers have no write path ([docs/project-reconciliation.md L139-L144](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L139-L144)). Any owner edit takes ownership of a drafted check and marks it `origin: owner` ([L562-L564](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L562-L564)). Each role change is recorded with the actor, reason, and the script digest it applied to ([L394-L397](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L394-L397)).

The Run check control requests an owner-triggered measurement; reconciliation also executes locked checks automatically. Owner edits that change kind or script reset the baseline and best recorded value, so the next run establishes a new baseline ([template L463-L465](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-requirements.ts#L463-L465)).

## Check kinds, count direction and baselines

There are two kinds.

- **Ratchet** is a bash script that prints the remaining violation count as its last stdout line and exits 0. Lower is better. It passes when `value <= target`, usually a target of 0.
- **Binary** passes on exit 0 and fails on exit 1. Any other exit is an execution error ([docs/project-reconciliation.md L146-L150](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L146-L150)).

For ratchets, three numbers matter:

- **Target**: the value the check must reach or go below.
- **Baseline**: the first valid measurement under the current definition.
- **Floor** (shown as Best recorded value): the lowest value ever measured with the current script. A measurement above the floor is recorded as `regressed`, moves the requirement to the front of the target queue, and appears on the dashboard ([L151-L155](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L151-L155); [template L425-L429](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-requirements.ts#L425-L429)).

Before a regression is recorded, the measurement is re-run once. A confirmation that disagrees records an execution error instead ([docs/project-reconciliation.md L202-L207](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L202-L207)).

Scripts do not inherit Agency's environment. They run in a checkout of each governed repository at the bound SHA, and only named variables pass through ([L163-L176](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L163-L176)).

Trend lines drop repeated values, so a flat run of the same count is shown once ([template L241-L244](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-requirements.ts#L241-L244)).

## Evidence environments and declines

An environment decides where evidence comes from. A drafted check contributes only what must be true. Environments carry an evidence strength: `simulated` is weaker than `source`, which is weaker than `deployed`. Weaker environments are dropped when a requirement's `minEvidence` is higher ([docs/project-reconciliation.md L209-L234](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L209-L234)). The environment table lists what each one provides ([L236-L247](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L236-L247)).

Before a check is locked, its assertion must pass a mechanical gate with no imports, process access, network, or dynamic code. Each check then has to fail under named known-bad faults, one per distinct part of its requirement, up to sixteen. The check locks only if every fault raises the count above the clean run ([L262-L290](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L262-L290); [docs/project-reconciliation.md](https://github.com/Jeffrey-Keyser/agency-hq/blob/8598a9473789582e2b8276e9bc7fd00a5bcb418d/docs/project-reconciliation.md)).

### Proof controls for a currently failing existential

An existential requirement ("at least one X exists") that already fails in production counts its maximum of one violation, so no fault can raise the count above the clean run. For that case only, an environment may declare named `proofControls`, each with fixed owner-authored setup (`fault`, `args`, `description`), and the requirement's manifest params must explicitly list the control name in `proofControls` ([docs/project-reconciliation.md](https://github.com/Jeffrey-Keyser/agency-hq/blob/8598a9473789582e2b8276e9bc7fd00a5bcb418d/docs/project-reconciliation.md)).

A proof can then name `control`. Agency first runs the assertion in a fresh world set up by the control's own fault and args (the author cannot override them) and requires a count of exactly zero. It then runs the adverse fault in a separate fresh world and requires a count greater than that zero. Unknown control names, names the requirement does not allow, and nonzero or failed controls are rejected. The actual production count, baseline, floor and pass/fail outcome are unchanged; the proof outcome records `productionClean`, `control` and the control execution separately from the control count ([src/services/project-acceptance-environments.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/8598a9473789582e2b8276e9bc7fd00a5bcb418d/src/services/project-acceptance-environments.ts), [src/types/project-acceptance.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/8598a9473789582e2b8276e9bc7fd00a5bcb418d/src/types/project-acceptance.ts)). The owner API and the drafter both reject proofs naming a control that is not allowed for the requirement ([src/services/project-acceptance-admin.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/8598a9473789582e2b8276e9bc7fd00a5bcb418d/src/services/project-acceptance-admin.ts), [src/services/project-acceptance-environment-drafting.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/8598a9473789582e2b8276e9bc7fd00a5bcb418d/src/services/project-acceptance-environment-drafting.ts)).

The drafting prompt lists allowed controls only for requirements that permit them. A drafter can dry-run a control through the try endpoint by sending `{assertion, environment, control}`; the result reports mode `control`. Combining `control` with `fault` or `args` returns HTTP 400, because control setup is owner-defined ([src/services/project-acceptance-try.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/8598a9473789582e2b8276e9bc7fd00a5bcb418d/src/services/project-acceptance-try.ts)).

Control definitions and the allowlist are part of the environment version only for requirements that allow controls. Requirements without controls, and unrelated environments, keep their previous versions and proof behavior ([src/services/project-acceptance-environments.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/8598a9473789582e2b8276e9bc7fd00a5bcb418d/src/services/project-acceptance-environments.ts)). `project-ecosystem-commerce` allows a control only for DONE-08, with a captured [production preflight](https://github.com/Jeffrey-Keyser/agency-hq/blob/8598a9473789582e2b8276e9bc7fd00a5bcb418d/docs/operations/ecosystem-readings-done08-preflight.json) and [owner assertion](https://github.com/Jeffrey-Keyser/agency-hq/blob/8598a9473789582e2b8276e9bc7fd00a5bcb418d/docs/operations/ecosystem-readings-paying-customer.mjs); see [Architecture](../architecture/).

### Drafter dry runs through the scoped stdio tool

For a bound draft job, Agency issues a scoped try token and writes a mode-0600 `try.json` with a fixed loopback URL (`http://127.0.0.1:<PORT>/api/v1/acceptance-try`) and the token. Other providers keep the shell `try.mjs` command in the prompt. Codex author and revision invocations additionally get a per-invocation `acceptance_try` stdio MCP server (`acceptance/try-mcp.mjs`) whose only tool, `try_assertion`, takes assertion source text plus optional `environment`, `fault`/`args`, or `control`. No scratch file or shell HTTP request is needed, and the prompt gains a note to use the tool instead of the shell command. Review invocations get neither the tool nor the note; they receive already-executed evidence ([src/services/project-acceptance-drafter.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/bd0cad958f991504878e1dd89ed0fd37b6eb733d/src/services/project-acceptance-drafter.ts), [src/services/acceptance-role-provider.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/bd0cad958f991504878e1dd89ed0fd37b6eb733d/src/services/acceptance-role-provider.ts), [docs/project-reconciliation.md](https://github.com/Jeffrey-Keyser/agency-hq/blob/bd0cad958f991504878e1dd89ed0fd37b6eb733d/docs/project-reconciliation.md)).

The server is passed to Codex only as `-c mcp_servers.acceptance_try.*` overrides for that invocation (command is the Node executable, args are the bridge and config file, enabled tools `try_assertion`, tool timeout 660 s, required). No global Codex configuration changes, and the Codex shell stays `--sandbox read-only` with its existing network policy; the MCP host runs the trusted bridge outside the shell sandbox. Server names must match `^[a-z][a-z0-9_]*$` ([src/lib/codex-backend.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/bd0cad958f991504878e1dd89ed0fd37b6eb733d/src/lib/codex-backend.ts), [src/lib/agent-backend.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/bd0cad958f991504878e1dd89ed0fd37b6eb733d/src/lib/agent-backend.ts)).

The bridge refuses to start unless its config URL is plain HTTP to `127.0.0.1` or `[::1]` at exactly `/api/v1/acceptance-try` with no query, fragment or credentials, and the token is a nonempty string of at most 256 characters. It accepts no model-selected URL, token, file path or command: tool calls with undeclared fields, a non-object `args`, an empty assertion, or an assertion over 32768 bytes return a tool error without contacting Agency. Input over 1 MiB ends the bridge ([acceptance/try-mcp.mjs](https://github.com/Jeffrey-Keyser/agency-hq/blob/bd0cad958f991504878e1dd89ed0fd37b6eb733d/acceptance/try-mcp.mjs), [acceptance/tests/try-mcp.test.mjs](https://github.com/Jeffrey-Keyser/agency-hq/blob/bd0cad958f991504878e1dd89ed0fd37b6eb733d/acceptance/tests/try-mcp.test.mjs)).

During MCP initialization the bridge preflights `GET /api/v1/acceptance-try`. The GET uses the same loopback/proxy and token checks as POST, returns only `{ready, environments, remaining}`, and executes no assertion or deployment work and consumes no try; an unknown or expired token returns 403. A failed preflight prevents Codex startup and retries the draft as an invocation error. After startup, request failures (including a revoked token) are MCP tool errors labelled as harness errors, never product counts or proof of a missing producer. Revocation, expiry, assertion gating, per-round budgets and deployment admission stay enforced by the existing POST path ([src/routes/versions/v1/acceptance-try.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/bd0cad958f991504878e1dd89ed0fd37b6eb733d/src/routes/versions/v1/acceptance-try.ts), [src/services/project-acceptance-try.ts](https://github.com/Jeffrey-Keyser/agency-hq/blob/bd0cad958f991504878e1dd89ed0fd37b6eb733d/src/services/project-acceptance-try.ts), [docs/project-reconciliation.md](https://github.com/Jeffrey-Keyser/agency-hq/blob/bd0cad958f991504878e1dd89ed0fd37b6eb733d/docs/project-reconciliation.md)).

### Declines

Some requirements cannot be measured yet. The drafter declines with a typed reason, and the owner routes the decline to an action:

- `environment`: build or bind an environment.
- `domain_undeclared`: declare the set the requirement ranges over.
- `measure_absent`: the product does not yet record what the requirement is about. It stays judged until a design lands it.
- `judgment`: reclassify as an aim or review.
- `rejected`: gate, proof, or review rejected every draft.

The owner lists these with the declines route ([docs/project-reconciliation.md L531-L545](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L531-L545); [src/types/project-acceptance.ts L11-L19 and L29-L30](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/types/project-acceptance.ts#L11-L30)). The inspector shows a declined check's missing environment or decline kind with its suggested action ([template L434](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-requirements.ts#L434)). A declined draft is not a failed execution.

Auto-drafting runs as durable jobs outside reconciliation. A draft that is approved and executes cleanly is locked with its first value as baseline and floor. Its first in-run pass is spot-checked by the judged checker. A disagreement contests the check ([L445-L487](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L445-L487)). A reworded requirement makes its drafted check stale and it is redrafted ([L489-L490](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L489-L490)).

## Roles, outcomes and target selection

Role says what a check is for, independent of its result:

- `gate` decides a product requirement. Only a failed gate nominates an implementation target.
- `census` counts coverage or certification. It blocks parity but never takes the target.
- `lead` supplies search hints only. It never decides or blocks ([docs/project-reconciliation.md L377-L383](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L377-L383); [src/types/project-acceptance.ts L34-L41](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/types/project-acceptance.ts#L34-L41)).

Outcome is what the result meant. An inconclusive gate makes its requirement unknown and is listed to the agents as evidence work. It never occupies the target. A failed gate is still targeted when another check on the same requirement is unavailable ([docs/project-reconciliation.md L384-L393](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L384-L393); [src/types/project-acceptance.ts L43-L58](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/types/project-acceptance.ts#L43-L58)).

A run picks one target deterministically: a regression first, then the failing checked requirement with the largest remaining distance, then judged-unsatisfied rows, then never-verified rows ([docs/project-reconciliation.md L370-L376](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L370-L376)). Two kinds of target are demoted behind every fresh one: certification-only targets and repeatedly inconclusive targets ([L398-L407](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L398-L407)).

Target selection also has a bounded, evidence-aware layer. Executable acceptance runs first. A stale selected requirement can use one priority slot. Reselection uses the same verdicts, exclusions and policy ([docs/project-target-selection.md L3-L10](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-target-selection.md#L3-L10)). A blocked target can be deferred by explicit unresolved `blocked_on` IDs or a typed, verified runtime blocker. It becomes `blocked`, never a fabricated product failure ([docs/project-target-selection.md L14-L31](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-target-selection.md#L14-L31)). If every remaining target is deferred, the run records a typed wait rather than inventing an inconclusive completion ([L41-L56](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-target-selection.md#L41-L56)).

## Parity: one receipt versus three

A parity outcome means the analysis and independent challenge found no uncovered actionable mismatch. It is accepted as verified only when the requirement index and current evidence support it and no blocking design, paused unfinished work, or implemented work awaiting verification remains ([completion evidence gate](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/dal/project-reconciliation.ts#L1024-L1053)).

When every indexed requirement is satisfied by an executed acceptance check at the bound corpus and application revisions, one verified parity receipt reaches sustained parity. The transition sets the displayed streak to 3 and moves the project to `awaiting-owner`. If any requirement still uses judged evidence, three agreeing verified parity receipts at the same binding are required. A changed application binding resets the streak ([implemented parity transition](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/lib/project-reconciliation-state.ts#L20-L44)).

The older blanket three-receipt wording in the source document does not describe the fully executable fast path. The implementation above resolves that ambiguity. Sustained parity disables recurrence and requests an owner decision; it is a conclusion about the bound evidence, not a guarantee about every possible product behavior ([owner notification](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/services/project-reconciliation.ts#L423-L435)).

## Interpretation table

| What you see | What it means | What it does not mean |
| --- | --- | --- |
| Coverage Indexed | The ledger has a current index for the loop | The requirement is satisfied |
| Needs recheck | The evidence is not current for the corpus or code binding | A product failure was measured |
| Locked check | The owner or auto-draft gates this requirement | The check passes now |
| Contested check | A spot-check disagreed; judged evidence applies | The last run failed |
| Ratchet value above floor | A regression was confirmed on re-run | The baseline was wrong |
| Result inconclusive | Measured but not decided | A product failure |
| Result unavailable | The harness could not measure | The product fails |
| Census role check failing | Coverage is incomplete | A gate failure with a target |
| Declined with measure_absent | The product does not yet record the fact | A broken check |
| Proof against a control | The assertion counts zero in an owner-defined valid world and more under the fault | The production count or floor changed |
| Dry-run harness error from `try_assertion` | The scoped transport or token failed | A product failure or a missing producer |
| One parity receipt | Sustained only if all rows are executable | Sustained parity for judged projects |

## Worked example with placeholders

This example is hypothetical. It uses placeholder names and no live results.

Suppose `EXAMPLE-UI-01` says a settings page has no horizontal overflow on phone viewports. An owner-approved check `example-settings-overflow` is a ratchet with target 0, locked and gating, bound to a deployed environment. Its baseline was measured at 3 when the environment version was first recorded. The floor is 0, the best value recorded. The latest run measured 2, which is above the target, but below the baseline and above the floor.

A measurement of 2 is above both the target (0) and the best recorded value (0), even though it improved on the original baseline (3). With the same script and evidence environment, a confirming re-run at 2 records status `regressed` and outcome `fail`. If confirmation disagrees, the result is an execution error instead. The requirement is unsatisfied and the confirmed regression has target priority. Evidence freshness is a separate question: it depends on the current requirement, corpus, and application binding, not just whether the text changed ([floor and regression](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L151-L155), [regression confirmation](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L202-L207)).

If the environment is unavailable, the check cannot establish a product failure and the requirement is unknown. A change of environment version resets the environment-backed check's baseline and floor and requires its proofs again, so an old floor is not used as a comparable measurement in a different environment ([environment-version binding](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/services/project-acceptance-pass.ts#L74-L106)).

If instead the requirement has no deciding executable check, it remains model-judged and appears as `judged · weak`. A satisfied judged row can contribute to parity, but the project still needs three agreeing verified receipts ([judged requirements](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L363-L371)).

## Related guides

- [Projects guide](../projects-guide/): where to find the Requirements tab and project controls.
- [Reconciliation lifecycle](../reconciliation-lifecycle/): how runs move through phases and holds.
- [Projects troubleshooting](../projects-troubleshooting/): diagnosing stalled runs, drafts, and stale indexes.
- [Overview](../home/): the wiki home page.
