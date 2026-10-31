---
title: Projects troubleshooting
description: Symptom-based operator runbook for Agency HQ Projects, reconciliation runs, admissions, Dev Inbox queue jobs, plans, external execution, and storyboard governing-corpus errors on Forge. Read-first diagnostics, then conditional owner actions. Revision 4523d08, observed 2026-10-29.
---

# Projects troubleshooting

This runbook is organized by symptom. Start with the read-only checks in each section, then take an owner action only when the evidence matches its condition. It describes deployed revision 4523d08, observed 2026-10-29. It does not report live project health. Agency HQ and Dev Inbox run on Forge. The user-facing wiki runs on Beelink. Paths and examples below use placeholders such as `<job-id>`, `<plan-id>`, `<slug>`, and `<projectId>`.

## Keep these objects separate

Most confusion in this area comes from treating different objects as one thing. Keep these distinctions in mind before you act.

- **Reconciliation run.** Agency generates a design by running primary and challenge analysis against indexed requirements. A trigger requests that analysis; admission decides whether it can start. It is separate from an implementation job. See [project reconciliation](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L568-L575) for the phase sequence.
- **Admission attempt and receipt.** An admission attempt is the durable record that a run was requested. A recovery receipt records what a repair changed. Neither one is a run. Closing an expired admission marks only that attempt failed and keeps its history. It does not stop a run or start a replacement. The dialog states this directly, and the code only offers the close control for an eligible `requested` attempt with no admitted run and a matching stuck finding. See [the expired-admission dialog](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-expired-admission.ts#L12-L16) and [its help text](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-expired-admission.ts#L34).
- **Implementation job and plan.** Dev Inbox owns queue jobs and plans. Queue `running` does not prove each plan slice is progressing. See [queue recovery triage](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/runbooks/project-queue-recovery.md#L14-L26).
- **Automatic approval.** This is a project preference that moves a proposal to `accepted`. It is not merge authority. The Dev Inbox queue's review policy and its queue pause, release, and merge controls still apply. See [automatic approval](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L637-L656).
- **Merge authority.** A plan's completion sign-off is the operator control that merges and pushes an integration branch. Use it only after review. See [completed slices waiting for sign-off](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/runbooks/project-queue-recovery.md#L53-L63).

Do not start a new reconciliation run to repair a Dev Inbox implementation job. The queue runbook says this directly. A project reconciliation trigger does not repair a job. See [terminal collection ambiguity](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/runbooks/project-queue-recovery.md#L49-L51).

## Configured or inactive project

**Read first.** Open the project's workspace and confirm its status, cadence, and owner. A newly registered project stays `configured` with Cron disabled. The first distinct `logos.context.changed` event activates it. Events for contexts with no configured heartbeat fail closed, so a missing heartbeat cannot be repaired from a Logos event. See [registration and activation](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L36-L55).

Also check the recovery pass. For a new project it activates only when the complete authoritative Logos snapshot is valid and nonempty. For an established project it reactivates only when the snapshot fingerprint differs from the stored heartbeat. See [the recovery pass](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L96-L106).

**Owner action, if the evidence supports it.** For a paused or awaiting-owner project, use the owner action endpoint with `leave-paused`, `resubmit`, or `reactivate` only after you have reviewed the evidence. The `leave-paused` and `resubmit` actions require a named verified identity. Identityless or header-only requests return HTTP 403 with `owner-identity-required`. See [owner identity requirements](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L26-L34) and [owner actions](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L697-L700).

Do not edit the heartbeat by hand. The configuration paths are the registration endpoint and the auto-approval route.

## Unindexed or stale requirements

**Read first.** Check the project's requirement coverage state: `unknown`, `indexed`, `unindexed`, `stale`, or `intentionally-loopless`. Existing projects begin as `unknown`. Recovery validates the current corpus before it changes the state. A normal project needs a Dev Inbox ledger loop for its Logos context before activation or run admission. See [requirement coverage](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L65-L74).

Open the Requirements view and inspect recent indexer and checker passes. Each pass records its bounded evidence row, and a pass starts `pending` before its file is replaced. An interrupted update is resolved from the pass ID in the file. Failures use stable categories and do not store raw provider errors. See [evidence rows](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L76-L83).

**Owner action, if the project is deliberately loopless.** Only an owner may register an intentionally loopless project with `allowLoopless` set to true. Runs then proceed without a ledger, but parity stays inconclusive until an index exists. Do not set this flag to get past a missing ledger on a normal project. See [the loopless rule](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L68-L73).

## Parity inconclusive

**Interpretation.** A parity receipt is accepted only when every indexed requirement in every loop has satisfied, clean checker evidence bound to the run's complete application SHA map. Until evidence catches up, the receipt is inconclusive. It reports the number of freshly satisfied rows. A rising count counts as progress for the no-progress guard. For model-judged evidence, three verified receipts at the same corpus and application revisions are required for sustained parity. Fully acceptance-backed evidence can reach sustained parity with one verified receipt ([implemented transition](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/lib/project-reconciliation-state.ts#L20-L44)). See [parity receipts](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L85-L94).

**Read first.** Open the run's acceptance block and check failing gates. An inconclusive or unavailable gate makes its requirement unknown and is listed as evidence work. It never occupies the target. Check roles matter here. A `census` check blocks parity without taking the target. A `lead` check supplies hints only. See [check roles and outcomes](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L377-L393).

To change how a check counts, use the role route with a required reason. This is an owner decision that is audited. See [the role change endpoint](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L394-L397).

**Owner action.** If an acceptance check is contested, unavailable, or missing, read the declines and gaps before redrafting anything. `GET /api/v1/project-reconciliation/<projectId>/acceptance-declines` groups declines by kind. `GET /api/v1/project-reconciliation/<projectId>/acceptance-environment-gaps` lists environments that cannot measure a requirement. A gap is the platform's backlog, not something to work around in a script. See [declines and gaps](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L531-L545) and [gap handling](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L347-L349).

To queue drafts for uncovered requirements, use `POST /api/v1/project-reconciliation/<projectId>/acceptance-drafts`. Do not repeat it in a loop. Use `retryFailed` only after you have read why drafts failed. See [the owner API table](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L547-L564).

## Inconclusive runs behind a blocking locked gate

**Symptom.** Several completed runs in a row are inconclusive, no design is proposed, and the Needs-you digest shows a repair in the requirements section. The attention kind is `acceptance-gate-stall`. The digest action names what the gates measured: "Fix failing gate" when every blocking gate measured a failure, "Diagnose gate evidence" when every blocking gate was unavailable or inconclusive, and "Fix or diagnose gates" when the stall mixes both.

**Meaning.** After each completed run, Agency looks at the latest completed runs. The default window is three, set by `PROJECT_RECONCILIATION_GATE_STALL_RUNS`. When all of them are inconclusive and a locked gate's latest result is not a pass, the attention is raised. Every locked gate that is not passing blocks, whatever its outcome. Failed runs and runs with an `error` outcome neither extend nor break the streak, and any conclusive outcome ends it. The attention lists each blocking gate with its requirement IDs, the date it has been blocking since (the oldest non-pass result after its last pass), its outcome, its last pass date or "no recent pass", value against target, and a bounded output tail of about 400 characters with ANSI codes removed. Gates whose requirement was targeted by a run in the streak are listed first, and at most five are shown. The attention clears when a run is conclusive or when no locked gate is failing. Sources: [gate stall assessment](https://github.com/Jeffrey-Keyser/agency-hq/blob/59ab4650621b1e8a9f98753edac66879b2ba2793/src/lib/project-gate-stall.ts), [attention wording](https://github.com/Jeffrey-Keyser/agency-hq/blob/59ab4650621b1e8a9f98753edac66879b2ba2793/src/lib/project-attention-digest.ts), [review after a completed run](https://github.com/Jeffrey-Keyser/agency-hq/blob/4196208c7fde4ac3d0bbc6a5d6b5f6bb0e3c0c1a/src/services/project-gate-stall.ts), [completion hook](https://github.com/Jeffrey-Keyser/agency-hq/blob/4196208c7fde4ac3d0bbc6a5d6b5f6bb0e3c0c1a/src/services/project-reconciliation.ts).

This is a different condition from the no-progress hold below. The hold depends on unchanged code and corpus. A gate stall can happen while the code and corpus keep changing, which is why the blocking gate itself is surfaced.

**Read first.** Open the Requirements tab, switch to Acceptance checks, and filter to locked gates whose latest result is not a pass. Read each gate's outcome, output tail, and pass history. Then decide which case you are looking at. If a gate measured a failure, the application may have regressed, and the fix belongs in the application, or the check fixture is stale after an intentional change. If a gate was unavailable or inconclusive, the evidence environment or check harness needs diagnosis (setup, credentials, timeouts, unstable fixtures). Its state is left as is.

**Owner action, if the evidence supports it.** For measured failures, fix the application, or change the stale check's state. Marking a check `stale` makes it redrafted from current code. Marking it `contested` stops it gating and returns the requirement to judged evidence until it is relocked. Both are owner mutations on the acceptance API. For unavailable or inconclusive gates, diagnose the harness or environment and rerun the checks. The stall clears after a later run is conclusive or after no locked gate is left failing to pass.

## Operational failure pause and automatic recovery

Repeated operational failures pause recurrence and disable the synchronized Cron job; the default threshold is three. Inspect the retained failure receipts and the pause cause. Recovery can reactivate an operationally paused project after the design store checks clean and an exponential cooldown has elapsed (30 minutes initially by default). Automatic reactivation has a bounded budget, default three until a run completes; when it is spent, the owner must fix the cause and reactivate. An explicit owner pause is separate from this operational recovery policy ([operational failure threshold](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/services/project-reconciliation.ts#L627-L650), [automatic recovery](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/services/project-reconciliation.ts#L568-L607), [recovery budget](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/services/project-reconciliation.ts#L40-L51)).

## No-progress hold

**Meaning.** An admission holds further automatic runs after three inconclusive visits to the same cited code seam, or five consecutive inconclusive runs at the same corpus and application binding. The hold is a durable `rejected-no-progress` admission with owner attention. It does not assert parity or resolve a document conflict. See [the no-progress hold](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L590-L600).

**Read first.** Confirm whether the corpus or cited code changed. A changed corpus or cited code can admit another run. Also confirm that the hold is not a target-evidence wait, which is handled separately below. A hold already in force still needs its normal evidence change or an owner resolution. See [authority and hold rules](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-target-selection.md#L53-L56).

**Owner action.** Use `resubmit` as a deliberate owner-authorized one-off after reviewing the recorded evidence. It can admit another run at the same binding; it does not assert parity or change the requirements. See [owner actions](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L697-L700).

## Design capacity full

**Meaning.** When the durable open-design projection reaches its configured capacity, Agency declines the trigger before it calls either reconciliation agent. Dev Inbox separately rechecks the same budget at promotion. See [capacity enforcement](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L116-L128).

**Read first.** Check the project's Design capacity value. A blank field inherits the global value. Changing one project does not raise any other project's limit. See [per-project capacity](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L116-L123).

**Owner action.** Inspect the designs occupying slots. Complete, reject, or pause them only when the corresponding lifecycle conditions hold. If more concurrent open designs are intended, the owner can change Design capacity in Configuration; this changes the limit rather than closing unfinished work.

## Proposed, unpublished, or accepted design

**Publication.** When a run materializes a proposal, Dev Inbox copies only the generated design into a clean worktree, regenerates the design catalog, verifies that exactly one design changed, and pushes. Publication verifies cited code lines against the bound revision. If that fails, the local proposal stays inspectable and its GitHub link stays hidden until verified publication succeeds. See [publication](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L620-L635).

**Automatic acceptance.** A proposal moves to `accepted` automatically only when the project is active, automatic approval is on, the run completed conflict-free, and its blocking proposal reached the canonical Dev Inbox branch. A staged or unavailable publication raises a recovery notification. It is never treated as an approval request. See [automatic acceptance](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L637-L644).

**Read first.** Check the design's state, its publication state, and the run that produced it. Ordinary unrelated staged work should not block read-only reconciliation or clean-worktree proposal publication. Inspect malformed/unmerged design-catalog state or canonical-checkout synchronization separately. For an intentional deployment change, `PROJECT_RECONCILIATION_CANONICAL_DIR` can select a dedicated clean Dev Inbox clone; keep it on `main`, advance it only by fast-forward, and configure the queue to read the same design root. See [canonical checkout](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L673-L681).

Do not treat an accepted design as merged. Automatic acceptance is a design lifecycle step. Merge authority remains with the queue's controls and plan sign-off.

## Queue waiting, blocked, or failed

**Read first.** Open the project's Designs and Work queue section. Check whether the daemon is running, whether the queue is paused, and which job holds the execution slot. A `queued` job can be healthy because the queue runs one outer job at a time. See [queue triage](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/runbooks/project-queue-recovery.md#L3-L18).

Run the durable inspection command for the job. It is read-only:

`DEV_INBOX_QUEUE_ROOT=/home/jkeyser/dev-inbox/queue /home/jkeyser/dev-inbox/scripts/work-queue.sh job inspect --json <job-id>`

For a plan job, use `/home/jkeyser/dev-inbox/scripts/plan-manager.sh status <externalExecutionId>`, then read the plan's `state.json`, `slices.json`, and child verification artifacts. See [the triage steps](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/runbooks/project-queue-recovery.md#L19-L24).

**Recovery behavior.** Agency's accepted-design recovery pass replays a missing queue admission. If a matching job exists, it leaves that job alone. A blocked, failed, dead, or canceled job creates grouped project attention with its queue reason. The pass does not enqueue a duplicate implementation. See [queue recovery behavior](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/runbooks/project-queue-recovery.md#L8-L12).

**Terminal collection ambiguity.** This message means the plan's terminal state and the queue's acceptance evidence disagree. Inspect child `verify.json`, review, and merge evidence before any retry. A plan marked `complete` can still have a failed child verification. Retrying the same design then risks repeating merged work. If the implementation is already on the target branch, verify in an isolated checkout, cancel the duplicate job with `work-queue.sh job cancel --json <job-id>`, abort the paused plan with `plan-manager.sh abort <plan-id> --reason <explanation>`, and advance the design. If the implementation is incomplete, resolve the child failure first, use plan-manager's native recovery controls, and retry the queue job only after the outcome is unambiguous. See [terminal collection ambiguity](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/runbooks/project-queue-recovery.md#L28-L51).

Do not edit queue projections or plan slices by hand. Do not use `run-now` to repair an implementation job.

## Completed slices with merge pending

**Symptom.** Every slice is `done`, but `plan-manager.sh status` reports `terminal-complete-merge-pending.json`. The queue keeps showing `running` until the plan is finalized. Agency raises grouped attention for this handoff. See [the handoff](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/runbooks/project-queue-recovery.md#L53-L58).

**Read first.** Review the slice `verifyPass` signals, the child review and verification artifacts, the integration branch diff, and a merge check against current `main`.

**Owner action.** Only after that review, run the native control `scripts/plan-manager-tools/complete.sh <plan-id> --sign-off`. This is merge authority. It merges and pushes the integration branch, and a routine queue tick then records the job's terminal result. Do not run it from a dashboard alert alone. See [the sign-off control](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/runbooks/project-queue-recovery.md#L58-L63).

## Succeeded job with an accepted design

**Meaning.** A queue `succeeded` status does not close an Agency design by itself. Agency requests lifecycle completion from the committed completion event. It checks the published design, the exact queue attempt, the verified slice reviews, and whether the approved candidate reached the target branch. The event is only a wake hint. See [completion requests](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/runbooks/project-queue-recovery.md#L65-L73).

The accepted-design recovery pass retries completion every five minutes and at startup. It creates attention if a succeeded job still cannot close its design. See [the recovery retry](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/runbooks/project-queue-recovery.md#L75-L78).

**Owner action, if verified work landed.** Confirm the plan's completion proof and the target branch first. Then, in an isolated worktree at current remote `main`, use `design.sh link-plan <slug> <plan-id>`, `design.sh advance <slug> done`, `design.sh reindex`, and `design.sh reconcile`. Publish only the design index and metadata changes, then confirm the open slug and WIP occupancy clear. Do not enqueue a new implementation for the succeeded design. See [the completion steps](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/runbooks/project-queue-recovery.md#L79-L84).

## External execution ownership

**Meaning.** `execution_owner` chooses who implements a design. It does not change how the design is generated. External designs remain `proposed` while being implemented. Agency will not accept them automatically, enqueue them, or start an inline run for them. See [external execution scope](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/operations/external-project-execution.md#L3-L32).

**Read first.** Check the project's owner value before you re-enable recurrence or start a manual run. Changing the mode affects only future designs and new Dev Inbox admissions. It does not reassign existing work. See [enable and disable](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/operations/external-project-execution.md#L8-L25).

**Owner actions.** Transfer and claim are separate, audited owner decisions. Transfer is allowed only for a proposed Dev Inbox design with complete provenance and a terminal originating run admitted after execution fencing was installed. Historical pre-fence runs stay blocked. See [transfer rules](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/operations/external-project-execution.md#L34-L63). Claims are idempotent with a `claimId`, and a different claimant is rejected. See [claims](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/operations/external-project-execution.md#L65-L75).

A completion receipt is submitted with the design's immutable identity. Agency verifies commit ancestry against the configured repository. Test evidence is an attestation, not a rerun, so Agency does not execute the submitted commands. See [the receipt](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/operations/external-project-execution.md#L84-L115). A `202 pending` result keeps WIP occupied, and normal recovery retries publication. See [pending completion](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/operations/external-project-execution.md#L117-L125).

## Unavailable source or credentials

**Access.** The Projects pages require a Pay account with the current `admin` role. Sign-in creates a session that lasts at most four hours. Agency verifies each session against Pay. Pay outages fail closed for Projects access. See [Projects access](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L5-L18).

**Automated callers.** External read-only clients must send an Agency HQ JWT with the `admin`, `engineering-lead`, or `ceo` role. Browser sessions are not used. See [automated callers](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L20-L23).

**Acceptance login.** The shared test account is read from the Solo Vault. Values whose names include PASSWORD, SECRET, TOKEN, or API_KEY are redacted from script output. A deployed-app check that cannot sign in has an unavailable harness or environment; it cannot establish a product failure. Inspect the recorded outcome and diagnostics. See [shared login](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L192-L200).

**Failure receipts.** Failed runs keep their immutable SHAs and a mode-0600 receipt under `results/reconciliation/<projectId>/<runId>.failure.json`. Start there when a source or credential problem is suspected. See [failure receipts](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-reconciliation.md#L130-L135).

**Ambiguous evidence.** The target-selection guide keeps a `runtime-binding-unavailable` result as a requirement-local wait. It does not become a fabricated product failure or a satisfied requirement. See [requirement-local waits](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-target-selection.md#L12-L31). When every remaining target is deferred, the server records a `target-evidence-blocked` wait. It does not spend an expensive agent. See [no eligible target](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/project-target-selection.md#L41-L51).

## Storyboard governing-corpus 403, 409, or 503

The storyboard publisher cannot create or revise documents in Agency's own governing Logos corpus. Both the canonical project and context are `project-agency-hq`. Missing or mismatched identities fail closed. See [the boundary](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/operations/storyboard-governing-corpus.md#L8-L14).

**403.** The document is absent or changed. Create or revise the document through the existing owner Logos workflow, then use **Reconcile existing receipt** once the exact content is present. A 403 means no Logos write happened and no publication receipt was fabricated. See [the owner workflow](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/operations/storyboard-governing-corpus.md#L16-L34).

**409.** The accepted preview's context or publication mode no longer matches the trusted registration. Request a fresh preview. The owner UI sends `expectedContextSlug` and `expectedPublicationMode` with each publish or retry, so a rebound alias cannot turn a receipt click into a write. See [accepted-preview binding](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/operations/storyboard-governing-corpus.md#L42-L56).

**503.** The document or snapshot could not be verified. Retry after the Logos snapshot is available. The preview stays visible. An interrupted receipt is retried with the same idempotency key. See [retry behavior](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/operations/storyboard-governing-corpus.md#L28-L34).

## Escalation and destructive recovery

Stop when the evidence is contradictory or missing. Do not start a reconciliation run, enqueue a job, or edit a JSON file to force agreement. Record the job ID, plan ID, design slug, run ID, and the exact output you read. Then follow the authoritative recovery runbook before any destructive step, such as a plan abort, a job cancel, or a merge. See [the authoritative recovery runbook](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/docs/runbooks/project-queue-recovery.md#L1-L84).

Use the Work queue section and grouped attention rows as entry points for the recorded evidence. Attention rows link the owner to the project section and to `/dashboard/runs?job=<job-id>` for each job, as the attention renderer builds them. See [attention links](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-attention.ts#L59-L64). Attention cards display only the recorded text, and an unavailable digest shows a retry control rather than a guessed state. See [unavailable state](https://github.com/Jeffrey-Keyser/agency-hq/blob/4523d08c221914ed3ae6c036d227fb64c95f2566/src/routes/dashboard/templates/project-attention.ts#L114-L117).

## Related guides

- [Projects guide](../projects-guide/) for the dashboard workflow.
- [Reconciliation lifecycle](../reconciliation-lifecycle/) for run phases and admissions.
- [Requirements and acceptance](../requirements-and-acceptance/) for checks, roles, and declines.
- [Overview](../home/) for the wiki home.
