# AgentArch — shubhambhattog/recoup

| Field | Value |
|---|---|
| Repository | `shubhambhattog/recoup` |
| Local clone | `/tmp/rzp_scratch/shubhambhattog_recoup` |
| Competition | Razorpay AI Buildathon 2026 — **Track 03** (AI Revenue Recovery) |
| Placement | UNDETERMINED — no placement information in repo |
| Stack | Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Vercel AI SDK (`@ai-sdk/google`) · Razorpay Node SDK (test mode) · `node:test` · GitHub Actions |
| Size | 4,229 LOC across 33 `.ts`/`.tsx` files (excl. `node_modules`), 75 tracked files |
| Docs | `README.md` (~230 lines) · `ARCHITECTURE.md` (186) · `SIMULATION.md` (166) · `FAILURE_STORY.md` (271) |

> **Reproduction note.** Every finding below marked `VERIFIED-BY-EXECUTION` was
> obtained by running the repo on this machine: `npm ci` → `npx tsx
> src/scripts/run-batch.ts`, `npm test`, `npx tsx src/scripts/eval-diagnosis.ts`.
> All three succeeded on a clean clone with **no API keys and no network**.

---

## Original Problem

Revenue recovery: detect money at risk (failed payments, failed subscriptions,
abandoned checkouts, overdue B2B invoices), diagnose the root cause, choose an
intervention, execute it under hard bounds, and report **measured money recovered
across a batch** with an audit trail, escalation and stopping rules. This maps
one-to-one onto the Track 03 bar, including its explicit rejection of
cherry-picking ("one cherry-picked match proves nothing").

## Original Solution (as claimed)

> *"Recoup recovers **more** money than naive retries, and it **cannot** misbehave
> with money — every action is bounded, gated, idempotent, and auditable."*

Headline claims: 61.9% ± 4.2% recovery across 50 seeds / 6,000 cases; 6.38×
pooled uplift over a naive baseline; 92.3% ± 2.2% diagnosis accuracy against
hidden ground truth; **0 double charges** in every one of 6,000 cases; 0 contacts
after opt-out; 0 quiet-hours contacts; 790-event replayable ledger.

---

## Actual Architecture (from code)

### Shape

A **deterministic event-driven simulation over virtual time**, with the LLM
confined to a single classification seam.

```
generateBatch(seed)                 sim/generate.ts:243   ← cases + hidden personas + hidden truth labels
  → runRecovery(cases, executor)    engine/loop.ts:67     ← priority-queue event loop over virtual time
      DIAGNOSE   engine/diagnose.ts:95    rules → (LLM | offline heuristic)
      DECIDE     engine/policy.ts:88      pure deterministic ladder per root cause
      GATE       engine/guardrails.ts:63  6 ordered bounds; only path to a money action
      ACT        engine/executor.ts       SimExecutor | RazorpayExecutor (same interface)
      OBSERVE    loop.ts:127-223          charged_success | charged_failed | charge_unknown → RECONCILE
  → computeReport(...)              metrics/report.ts:82
  + runBaseline(sameCases, freshWorld)  engine/baseline.ts:17  ← the A/B actually executes
```

`engine/run.ts:52-91` is the single entry point used by the CLI, the sweep, the
tests **and** the web API — so the dashboard number and the terminal number
cannot diverge. That is a deliberate and correct choice.

### The Executor seam

`engine/executor.ts:38-41` defines a two-method interface (`execute`,
`reconcile`). `SimExecutor` (`:43-113`) drives the measured batch; `RazorpayExecutor`
(`engine/razorpay-executor.ts`) drives real test-mode Payment Links. The recovery
loop imports neither concretely. **This is the strongest structural idea in the
repo** — the same decision code that produces the metrics is the code that talks
to Razorpay, so "the numbers are honest AND the integration is real" is
architecturally enforced rather than asserted.

### Ground-truth isolation

`sim/world.ts:1-14` states the rule and the code honours it: `World` holds
`Persona` (will this customer pay, when, what does it take) and
`generate.ts:23` holds `truthRootCause`. Grepping `src/lib/engine/*` — **nothing
in the decision path imports `sim/world` except `SimExecutor`**, which only calls
`settle`/`reconcile`/`deliverMessage` and receives no persona information. The
asymmetry is real.

### Determinism

Custom seeded RNG (`core/rng.ts`), virtual clock (`core/time.ts`), money in
integer paise (`core/money.ts`), no `Math.random` and no wall clock in the engine.
`run-batch.ts` reproduced the README's seed-42 numbers exactly on first run.

### Where the LLM actually is

Two declared capabilities on a narrow interface (`ai/types.ts:38`):

| Capability | Call site | Wired into the measured pipeline? |
|---|---|---|
| `classifyRootCause` | `ai/llm.ts:44-61`, invoked from `engine/diagnose.ts:101` | **Yes, but opt-in only.** `run-batch.ts:120` and `eval-diagnosis.ts:32` pass an `Llm` only when `LLM=1`. The default headless run makes **0 model calls** (`VERIFIED-BY-EXECUTION`: `Model calls made 0`). |
| `composeMessage` | `ai/llm.ts:63-82` | **No.** `grep -rn "composeMessage" src/` → defined in `ai/llm.ts`, declared in `ai/types.ts`, called **only** from `scripts/llm-smoke.ts:27`. Customer messages in every executable path come from the hardcoded template function `engine/policy.ts:63-85`. |

Uses structured output (`generateObject` with a `z.enum` of 15 root causes,
`ai/llm.ts:13-35`) so the model cannot return an off-schema value, and the system
prompt explicitly says *"Only classify — do NOT recommend or take any action."*
That constraint is enforced structurally: `Llm` has no method that can produce a
money action.

---

## What The Code Proves

### 1. Is the measurement real or theatre?

**The measurement *machinery* is genuinely real. What it measures is a world the
author wrote, and two of the headline numbers are structurally guaranteed rather
than discovered.**

#### Real — `VERIFIED-BY-EXECUTION`

- **The baseline actually runs.** `engine/run.ts:76-79` regenerates the identical
  case set, constructs a fresh `World`, and calls `runBaseline(...)`
  (`engine/baseline.ts:17-58`), which executes a real 3× hourly retry loop against
  the same simulator. It is not a constant, not a README number, not a stub.
  Observed on seed 42: agent 52/70 = ₹3,51,957 vs baseline 11/70 = ₹1,03,854.
- **The batch is real.** 120 cases per run, 50 seeds in the sweep, all
  reproducible from seed. `npm run recover:batch` emits
  `artifacts/ledger.jsonl` — 790 events, matching the README exactly.
- **Diagnosis is graded against a label the agent cannot see.**
  `metrics/diagnosis.ts:40-99` compares `c.diagnosis.rootCause` against
  `truthRootCause`, splits by path, and money-weights the confusions. Observed:
  88.3% overall / 100% rules / **72.0% text**, exactly the README's seed-42
  figures. **The repo reports its own text-path classifier as wrong 28% of the
  time.** That is the single most credible thing in either repository.
- **An exception list exists and is printed.** `report.ts:154-161`; observed "46
  of 120 could not auto-resolve", each with a reason.
- **CI enforces it.** `.github/workflows/ci.yml` runs typecheck, lint, 24 tests,
  a 25-seed sweep that `process.exit(1)`s on any double-charge
  (`scripts/sweep.ts:220-224`), and a production build.
- **`npm test` passes 24/24** on a clean clone, including a randomised-policy
  fuzz suite (`tests/guardrails.test.ts:39-126`) that varies attempt caps,
  contact caps, cooldowns, budgets, thresholds and all three chaos parameters,
  and asserts per-case invariants — cooldown gaps, deadline compliance,
  `recoveredAmount === amount`, every `unknown` outcome reconciled, and **hard
  declines never re-charged** (`:100-102`).

#### Not real — the two structural holes

**(a) `postOptOutContacts` is a hardcoded zero.** `engine/loop.ts:85` initialises
it to `0`; `grep -rn "postOptOutContacts" src/` shows it is **never incremented
anywhere in the codebase** — only read, in `sweep.ts:79/121`, `run-batch.ts:89`,
`Dashboard.tsx:390`, and asserted `=== 0` in `tests/guardrails.test.ts:56`. It is
one of the four headline safety numbers in the README table
(*"Contacts after opt-out · quiet-hours contacts | 0 · 0 | 0 in every run"*), it
is printed by the CLI, it is a green tick on the dashboard, it is a CI gate
(`sweep.ts:122,126`) — and it is a literal `0`. The *behaviour* is correct
(`guardrails.ts:77-79` blocks opted-out customers absolutely; `loop.ts:205-212`
terminates the case on opt-out), but the *metric* has no instrument behind it and
the *test* can never fail. This is precisely the "constant score" pattern.

`quietHoursContacts` is a weaker version of the same problem: it *is* incremented
(`loop.ts:190`) but only inside `message_sent`, after the gate has already
deferred every quiet-hours contact using the identical predicate
(`guardrails.ts:107-125` vs `loop.ts:111-112`). It can be non-zero only if the
gate has a bug — defensible as an invariant assertion, but it is not an
independent measurement. (A genuinely independent check does exist:
`tests/guardrails.test.ts:128-143` re-derives quiet-hours violations from the
ledger.)

**(b) "0 double charges in 6,000 cases" is closer to a proof than a
finding.** `World.doubleCharges` increments only when a *second successful
capture* occurs on the same `caseId` under a *different* key
(`world.ts:118`). But `loop.ts:238` skips any case already `recovered`, and both
`charged_success` (`:134-144`) and a reconciled `charge_unknown` (`:167-177`) set
`recovered` immediately. A second capture is therefore unreachable by control
flow, not by luck. The number is true and the reconciliation code is genuinely
correct — but the sweep is confirming a structural property, not sampling a risk.
To the author's credit, `SIMULATION.md` says exactly this: *"the safety results
are structural and would hold under any assumptions."*

#### The methodological hole the docs do *not* disclose — `FACT`

**The baseline cannot recover the dominant archetype by construction.**

- `generate.ts:74-82` — the largest archetype (weight 12, plus weight 8 for the
  subscription variant) is `insufficient_funds`, whose persona is
  `funds_on_date` with `fundsAt = t + rng.int(12, 96) HOURS`.
- `world.ts:86-87` — a charge succeeds only when `t >= fundsAt`.
- `baseline.ts:26-27` — the baseline retries at `t`, `t+1h`, `t+2h`.

The baseline therefore has a **0% recovery rate on ~29% of the weighted case mix,
guaranteed**, because the author chose both the funds-arrival distribution and
the baseline's retry cadence. `SIMULATION.md:84-92` describes the baseline as
"deliberately dumb" and defends the like-for-like segmentation, but never states
that its retry window is an order of magnitude shorter than the delay it is
retrying against. Real naive dunning — and Razorpay's own Smart Retry, which the
judges built — retries over **days**. A 3-hour ladder is not a naive baseline; it
is a baseline configured to fail. **The 6.38× uplift is a function of two
authored constants**, and it is the number a Razorpay engineer will attack.

Secondary: `run.ts:63` vs `:77` give the agent world and the baseline world
*different RNG streams* (`seed ^ 0xa6e7` vs `seed ^ 0xb33f`). The README says
"same world"; the code comment says "fresh world". Over 6,000 cases the chaos
realisation washes out, but "the same cases + the same world" is not literally
what runs.

#### The diagnosis eval is not a held-out test set — `FACT`

It is graded against a hidden label, which is better than most. But the **input
distribution has six distinct strings.** `generate.ts` defines 15 archetypes, of
which 6 route to the text path, and each has **one fixed `description`**
(`:176, :187, :198, :209, :221, :233`). All 50 text-path cases in a 120-case
batch are repetitions of those 6 sentences.

Worse, the offline heuristic's accuracy is a *closed-form function of the
archetype weights*, not a statistic. `diagnose.ts:76-87` keyword-matches; walk it
against the 6 strings:

| Archetype (weight) | Description contains | Heuristic predicts | Truth | ✓/✗ |
|---|---|---|---|---|
| price-abandon (10) | "price", "shipping" | `buyer_price_sensitive` | same | ✓ |
| distracted-abandon (10) | — | `buyer_distracted` | same | ✓ |
| window shopper (5) | — | `buyer_distracted` | `unrecoverable` | ✗ |
| B2B cashflow (7) | — | `b2b_cashflow` | same | ✓ |
| B2B dispute (4) | "dispute", "complaint" | `b2b_dispute` | same | ✓ |
| B2B bad debt (3) | — | `b2b_cashflow` | `unrecoverable` | ✗ |

Correct weight = 31 / 39 = **79.5%** — which is the README's sweep figure of
"text path 79.4%". `VERIFIED-BY-EXECUTION`: `eval-diagnosis` on seed 42 reports
72.0% text path with exactly two confusions,
`unrecoverable → b2b_cashflow` (6 cases) and
`unrecoverable → buyer_distracted` (8 cases) — i.e. **the two ✗ rows above and
nothing else.** The eval has no lexical variety, no paraphrase, no noise, no
adversarial text. It measures whether the author's keyword list matches the
author's own six sentences. The LLM's reported 72% → 84% lift is the model
correctly labelling one of those two archetypes.

**Verdict on measurement: real harness, honest reporting, self-authored
substrate.** It is far above the hackathon bar and the author says so himself in
`SIMULATION.md:96-113` ("What we are *not* claiming"). But the two numbers a
reviewer would quote — 6.38× uplift and 92.3% diagnosis accuracy — are the two
that are most determined by authored constants.

### 2. Is the AI load-bearing or decorative?

**Decorative in the default reproducible pipeline, by explicit design; genuinely
load-bearing only in the opt-in `LLM=1` path; and one of its two advertised jobs
is not wired up at all.**

- `VERIFIED-BY-EXECUTION`: the default `npm run recover:batch` reports
  `Model calls made 0`. Every headline number in the README is produced with
  **zero** LLM involvement. The author states this openly
  (`README` "The headline metrics elsewhere in this README are the **offline**
  ones"), which converts a weakness into a rubric strength — but factually, the
  AI is not in the measured loop.
- Where it *is* wired (`diagnose.ts:99-118`), it is correctly placed: only cases
  the deterministic classifier returned `null` for (`diagnose.ts:96-97`), never a
  case whose Razorpay error code already answers the question. `VERIFIED`: 70/120
  cases are rules-only, 50 are text-path — 58.3% never reach a model, matching
  the README.
- It cannot touch money. `Llm` (`ai/types.ts`) exposes only `classifyRootCause`
  and `composeMessage`; `policy.ts:88-183` and `guardrails.ts:63-157` are pure
  functions of the diagnosis label and the policy config.
- Failure is handled: `diagnose.ts:115-118` catches any LLM error and falls back
  to the deterministic heuristic rather than crashing the batch.
- **Would a for-loop and a regex do the same job?** For 58% of cases the author
  already answered "yes" and used regex (`diagnoseByRules`, `diagnose.ts:20-65`).
  For the remaining 42%, the offline heuristic — which *is* a regex
  (`diagnose.ts:68-92`) — gets 72–79% and the model gets 84%. So on this
  synthetic corpus, a regex does **~86% of the model's job**. That is an honest
  finding the repo itself publishes, and it is the correct answer to the rubric's
  "where you chose not to use one" clause. But it also means the LLM's measured
  marginal value here is small and rests on six sentences.

### 3. Four Pillars

| Pillar | Verdict |
|---|---|
| **(a) Does it actually run?** | **Yes — best-in-class.** `VERIFIED-BY-EXECUTION` on a clean clone with no keys and no network: `npm ci` → `run-batch` (full scorecard + 790-event ledger), `npm test` (24/24), `eval-diagnosis` (reproduces README figures exactly). `package-lock.json` is committed so `npm ci` is reproducible even though `package.json` uses caret ranges. `.env.example` is honest — it opens with *"Everything here is OPTIONAL"* — and every variable it lists is genuinely read: `GEMINI_API_KEY`/`GOOGLE_GENERATIVE_AI_API_KEY`/`AI_GATEWAY_API_KEY`/`LLM_MODEL` at `ai/model.ts:22-25`, `LLM` at `run-batch.ts:120`, `RAZORPAY_KEY_ID`/`SECRET` in `razorpay/client.ts`, `SEED`/`N` in the scripts. `RAZORPAY_ALLOW_NOTIFICATIONS` is read (`client.ts:46`) but not listed in `.env.example` — the only mismatch, and it is safe-by-omission. Seed data is generated deterministically rather than committed, which is better than shipping a database. |
| **(b) Is it structured?** | **Yes.** Layered by responsibility, not by file type: `core/` (rng, money, time, env), `domain/` (types, policy config), `engine/` (diagnose · policy · guardrails · loop · executor · baseline · run), `sim/`, `ai/`, `razorpay/`, `metrics/`, `ledger/`. Largest file is 334 lines. The `Executor` interface (`executor.ts:38`) and the `Llm` interface (`ai/types.ts`) are the two seams that matter and both are narrow. Every file opens with a comment explaining *why* it exists, not what it does. |
| **(c) Deliberate non-use of AI?** | **Yes — and it is documented, argued, and *measured*.** `diagnose.ts:1-10` is an explicit rationale ("We do NOT ask an LLM 'why did card_expired fail' — the answer is in the code"). `README` has a dedicated section, "AI judgment: the right tool, and where we chose *not* to use one", with a comparison table. `SIMULATION.md:113-121` states the LLM is not required. And `npm run eval:diagnosis` turns the claim into a reproducible number: rules path 100%, so a model there adds nothing. **This is a direct, deliberate hit on the highest-signal clause of the Razorpay rubric,** and it is the single thing that most distinguishes this repo. |
| **(d) Is failure handling real?** | **Real, and it is the design centre rather than an afterthought.** (i) `charge_unknown` → mandatory reconcile before any re-charge (`loop.ts:155-182`), enforced by a test that every `unknown` attempt carries a `reconciledResult` (`tests/guardrails.test.ts:84-91`). (ii) Transient API errors retried **with the same idempotency key**, up to 4 times, each retry written to the ledger (`executor.ts:74-97`); on exhaustion it returns `charged_failed` with an explicit ledger note that idempotency guarantees no money moved (`:98-105`). (iii) LLM failure → deterministic heuristic fallback (`diagnose.ts:115-118`). (iv) Live Razorpay path refuses to start on a live key (`razorpay-live-batch.ts:60-63`). (v) Outbound notifications require **two** independent locks — an explicit `notify` argument *and* `RAZORPAY_ALLOW_NOTIFICATIONS=1` (`client.ts:42-46,141-143`) — with a test asserting the default is off. (vi) `FAILURE_STORY.md` documents nine distinct failures including two the author says he'd least like to admit; §7 is the near-miss where a guardrail system almost texted real strangers, which is the reason for (v). **No timeouts are configured on the Razorpay or AI SDK clients** — the one notable gap. |

### 4. Audit trail / bounded actions / stopping rules

| Requirement | Implemented in code? | Evidence |
|---|---|---|
| **Audit trail** | **Real and complete** | `ledger/ledger.ts:8-19` — 11 event types with monotonic `seq`, virtual timestamp, `caseId`, human summary and structured `data`. `loop.ts` appends at every transition: detection (`:227`), diagnosis with confidence and source (`:262`), plan with rationale (`:280`), gate block with reason (`:288`), execution (`:191`), result (`:142/151/162`), reconciliation (`:172/179`), recovery (`:143/177/250`), opt-out (`:210`), exception (`:118`). `VERIFIED`: 790 events written to `artifacts/ledger.jsonl` for 120 cases. Replayable in the dashboard over virtual time. |
| **Bounded — money attempts** | Real | `guardrails.ts:87-90`, cap `maxMoneyAttemptsPerCase: 3` (`config.ts:49`), with the Visa/Mastercard reattempt rationale cited inline (`:44-48`). Fuzz-asserted (`guardrails.test.ts:62-65`). |
| **Bounded — cooldown** | Real | `guardrails.ts:91-98`; asserted per-attempt-pair (`guardrails.test.ts:72-75`). |
| **Bounded — contact caps** | Real | Per-case (`guardrails.ts:103-105`) and per-customer-per-local-day (`:127-135`, deferring to tomorrow rather than failing). |
| **Bounded — quiet hours** | Real, and regulation-cited | `guardrails.ts:107-125`; `config.ts:54-59` cites RBI's 12 Aug 2022 recovery-agent guideline for the 08:00–19:00 window. Independently re-derived from the ledger in `guardrails.test.ts:128-143`. |
| **Bounded — spend** | Real | Per-case incentive cap and batch-wide budget (`guardrails.ts:139-147`), asserted against ledger totals (`guardrails.test.ts:106-112`). |
| **Gated — human approval** | **Real, and it costs money on purpose** | `guardrails.ts:150-155` + `policy.ts:55-60` (threshold ₹25,000). With `humanGate: "manual"`, cases park as `awaiting_human`; `guardrails.test.ts:145-166` asserts (a) something is actually parked, (b) everything parked is above threshold, (c) supplying `approvedCaseIds` releases exactly those. A gate that is proven to *block* is rarer than one that is claimed. |
| **Stopping rules** | Real | Opt-out is absolute and permanent (`guardrails.ts:77-79`); case deadline stops all chasing (`:82-84`); policy ladder terminates explicitly per root cause (`policy.ts:126+`, e.g. `terminal("stop", "Funds retries + method-switch exhausted.")`); `b2b_dispute` and `risk_declined` route to `escalate_human` and are asserted to have **zero** money attempts (`guardrails.test.ts:100-102`). Fuzz suite asserts every case reaches a terminal state (`:61`). |
| **Idempotency** | Real | Sim: `executor.ts:73` key = `caseId:pay:attemptIndex`, replayed identically on transient error. Live: Razorpay `reference_id`, with five dedicated tests covering stability, step-sensitivity, run-scoping, the 40-char limit, and loud rejection rather than silent truncation (`tests/razorpay.test.ts`). |

**Every one of these is code, not README prose.** This is the most completely
implemented bounded-autonomy layer of the two repos by a wide margin.

### 5. The single best engineering idea

**One decision engine, two executors — with the measured metrics and the real
integration necessarily produced by the same code path.**

`engine/executor.ts:38-41` defines a two-method interface; `SimExecutor` (`:43`)
and `RazorpayExecutor` (`engine/razorpay-executor.ts`) implement it; `loop.ts`
depends only on the interface. `guardrails.ts:43-50` even carries a
`linkBasedExecutor` flag so that when the executor fulfils every intervention via
a customer-facing payment link, a `retry_payment` is correctly reclassified as a
*contact* and made subject to the RBI quiet-hours window
(`guardrails.ts:73-74`) — an integration-specific compliance subtlety that most
people would never notice.

Why this is worth reimplementing: it structurally eliminates the most common
hackathon lie — *"the demo runs on mocks, the numbers come from somewhere else."*
Here there is no separate demo path to diverge. Combined with `run.ts` being the
single entry point for CLI, sweep, tests and the web API, the dashboard number
**cannot** disagree with the terminal number.

**How to reimplement independently:** (1) Define the outside world as a narrow
interface with the *smallest* method set your loop needs — here, two. (2) Write
the simulator implementation first and make it own hidden ground truth the
decision code cannot import. (3) Write the real implementation second against the
same interface. (4) Make one function the sole entry point for every consumer.
(5) Add a flag on the guard context for behaviours that differ between
implementations (like `linkBasedExecutor`) rather than branching inside the loop.

**Runner-up, worth stealing separately:** *reconcile-before-re-charge on an
unknown outcome* (`loop.ts:155-182`). Treating "unknown" as a distinct third
outcome — never as a failure — and mandating a source-of-truth check before any
retry is the correct primitive for any money system, and the test that every
`unknown` carries a `reconciledResult` (`guardrails.test.ts:84-91`) is how you
keep it correct.

### 6. The weakest thing (30 seconds)

**"Recovers more money than naive retries" rests on a baseline that retries for
3 hours against customers whose funds arrive in 12–96 hours.**

`baseline.ts:26-27` (retry at `t`, `t+1h`, `t+2h`) versus `generate.ts:80`
(`fundsAt = t + 12..96 HOURS`) means the baseline recovers **0%** of the single
largest archetype by construction. Both constants were chosen by the same author.
Razorpay ships Smart Retry, whose whole premise is retrying over days at
issuer-informed times — so the judges know precisely what a real retry ladder
looks like, and it is not this. The uplift figure is the most quotable number in
the README and the least defensible.

`SIMULATION.md` §4 defends the like-for-like *segmentation* but never mentions
the *timing* asymmetry. Being this candid everywhere else makes the omission
conspicuous.

**Second poke, five seconds later:** `grep postOptOutContacts` → a headline
safety metric, a CI gate and a dashboard tick that is a hardcoded `0` never
incremented by any code path.

### 7. Overclaim ledger

This repo is unusually honest — `SIMULATION.md:96-113` pre-empts several
criticisms and `FAILURE_STORY.md` §2 describes deleting a flattering "1790%
uplift". These are the claims that survive that filter and are still wrong or
undisclosed.

| # | Claim | Where claimed | What the code shows |
|---|---|---|---|
| 1 | The LLM *"does exactly two things... 2. **Compose** the customer message (Hinglish where the customer's locale is `hi-IN`)"* | `README` §"AI judgment" | `composeMessage` (`ai/llm.ts:63`) is called **only** from `scripts/llm-smoke.ts:27`. Not by `loop.ts`, not by `policy.ts`, not by `razorpay-live-batch.ts` (`:69` uses `llm` for `diagnose` only). Every Hinglish message is a hardcoded template at `policy.ts:63-85`. **One of the LLM's two advertised jobs is not wired into any pipeline.** |
| 2 | *"Contacts after opt-out — **0** — 0 in every run"* presented as a measured invariant | `README` evidence table; `SIMULATION.md:110`; `run-batch.ts:89`; `Dashboard.tsx:390`; `sweep.ts:121-126` | `loop.ts:85` sets it to `0` and **no code anywhere increments it**. The behaviour is correct; the metric is a constant and the test (`guardrails.test.ts:56`) can never fail. |
| 3 | *"Uplift vs naive baseline (pooled, like-for-like) **6.38×**"* | `README` evidence table; `SIMULATION.md:108` | The baseline retries within 3h (`baseline.ts:27`) against personas whose funds arrive in 12–96h (`generate.ts:80`) — 0% recovery on ~29% of weighted mix, by construction. Undisclosed in `SIMULATION.md` §4, which discusses only the segmentation. |
| 4 | *"Both run on the **same generated cases and the same world config**"* | `SIMULATION.md:92-93`; README *"same cases + same world"* | Same cases and same *config*, but different RNG streams: `seed ^ 0xa6e7` (agent, `run.ts:63`) vs `seed ^ 0xb33f` (baseline, `run.ts:77`). `run.ts:75` says "fresh world". Different chaos realisation. |
| 5 | *"Diagnosis accuracy vs hidden ground truth 92.3%"* presented as a measured classifier score | `README` evidence table | The text path has **six distinct input strings** (`generate.ts:176,187,198,209,221,233`) repeated across the batch, and heuristic accuracy is a closed-form function of the archetype weights (31/39 = 79.5% ≡ the reported 79.4%). `VERIFIED-BY-EXECUTION`: exactly two confusion classes, both `unrecoverable`. No lexical variety, no paraphrase, no adversarial input. |
| 6 | *"rules path 100%"* | `README`; `eval-diagnosis` output | True as computed, but partly definitional: `metrics/diagnosis.ts:63-64` assigns a case to the "llm" bucket if `isBehavioural(**truth**)` — i.e. the path label is derived from the answer key, not from which classifier actually ran. In practice `diagnoseByRules` returns `null` on all behavioural cases so no leakage occurs, but a bucket defined by ground truth cannot be a clean accuracy split. |
| 7 | *"reports **measured money recovered** ... on Razorpay test-mode APIs"* (lede) | `README` opening paragraph | The measured money is entirely simulated (`SimExecutor`). The Razorpay path is real but separate, requires keys, and is not the source of any reported figure. Clarified further down the README and in `SIMULATION.md`, but the lede conflates them. |
| 8 | Internal inconsistency: text-path accuracy quoted as **72%**, **79.4%** and **84%** | `README` (all three); `SIMULATION.md:27` (72%) vs `:107` (92.3% overall) | All three are real numbers (seed-42 offline / 50-seed offline / seed-42 Gemini) but they appear in adjacent prose without consistent labelling, so *"the text-only path gets 72% right, not 100%"* sits a few paragraphs from a table saying 79.4%. |
| 9 | `RAZORPAY_ALLOW_NOTIFICATIONS` is documented in the README as a required lock | `README` §"Razorpay test-mode integration" | Read at `razorpay/client.ts:46`, but **absent from `.env.example`**. Safe-by-omission (default off) — the only `.env.example`/code drift in the repo. |

Note the overclaims are all **framing and instrumentation** issues, not fabricated
functionality. Nothing in this repo claims a capability that does not exist,
except item 1.

---

## Candidate Patterns

### P1 — One decision engine, two executors, one entry point
- **Type:** `ARCHITECTURE_PATTERN`
- **Source:** `src/lib/engine/executor.ts:38-41` (interface), `:43-113` (`SimExecutor`), `src/lib/engine/razorpay-executor.ts` (real), `src/lib/engine/run.ts:52-91` (single entry point for CLI + sweep + tests + `/api/run`), `src/lib/engine/guardrails.ts:43-50,73-74` (`linkBasedExecutor` compliance flag).
- **Why strong:** It makes "the measured numbers and the live integration come from the same code" a structural fact rather than a claim. There is no `if (demoMode)` because there is no second code path to gate.
- **Why relevant:** Razorpay's stated thesis is that *verification capacity* is the bottleneck. This pattern is a verification-capacity multiplier: a reviewer can check one loop and know it governs both the metrics and the money.
- **Razorpay applicability:** Every track. Any agent that must be both *measured over a batch* and *demonstrated against a live API* needs exactly this seam.
- **How to independently reimplement:** Smallest possible interface (two methods here); simulator implementation owns hidden truth and is unimportable by the decision code; real implementation second; one entry-point function for every consumer; put implementation-specific compliance differences on the guard context, not in the loop.
- **Risks:** The simulator becomes the thing you optimise against — see the baseline-timing critique. Mitigate by making the simulator's constants externally sourced or sensitivity-swept, and by publishing the sensitivity table (which this repo does).
- **Score: 9/10**

### P2 — Reconcile-before-re-charge: "unknown" as a first-class third outcome
- **Type:** `FAILURE_HANDLING_PATTERN`
- **Source:** `src/lib/engine/executor.ts:19-27` (`charge_unknown` in the outcome union), `src/lib/engine/loop.ts:155-182` (mandatory reconcile), `src/lib/sim/world.ts:122-124` (chaos source), `src/tests/guardrails.test.ts:84-91` (invariant).
- **Why strong:** Almost every naive money integration collapses `unknown` into `failed` and re-charges. Making it a distinct outcome that *cannot* proceed without a source-of-truth check is the smallest change that eliminates the entire double-charge class. `baseline.ts:50-51` demonstrates the counterfactual in executable code.
- **Why relevant:** "Every money action explainable, bounded and gated." This is the specific unglamorous failure that separates a system you'd trust with money from one you wouldn't.
- **Razorpay applicability:** Tracks 02 and 03 directly; universal for any payment retry loop.
- **How to independently reimplement:** (1) Make the outcome type a three-valued union — never a boolean. (2) On `unknown`, call the source of truth keyed by the idempotency key before any retry decision. (3) Record the reconciled result on the attempt itself. (4) Assert as a test invariant that no `unknown` attempt exists without a `reconciledResult`. (5) Ledger both the unknown and the reconciliation with the key.
- **Risks:** Only as good as the reconcile call — needs its own timeout/retry against a real API, which this repo does not configure.
- **Score: 9/10**

### P3 — Ground-truth-owning simulator with an import firewall, plus self-graded diagnosis
- **Type:** `EVALUATION_PATTERN`
- **Source:** `src/lib/sim/world.ts:1-14` (stated rule), `src/lib/sim/generate.ts:8-11,22-23` (`truthRootCause`), `src/lib/metrics/diagnosis.ts:40-99` (money-weighted scoring), `src/scripts/eval-diagnosis.ts` (head-to-head classifier comparison).
- **Why strong:** It lets you report *"our text classifier is wrong 28% of the time and here is the ₹4.06L sitting behind those wrong calls"* — an honest-metrics-with-false-positive-cost artefact, which is verbatim what the Track 03 bar asks for. Money-weighting the confusion matrix (`diagnosis.ts:24,72`) is the right call for a payments context: not all errors cost the same.
- **Why relevant:** Directly answers "measured precision and recall on a held-out test set" and "honest metrics including false-positive cost".
- **Razorpay applicability:** Tracks 01/02/03. The A/B harness comparing *regex vs model on identical cases with cost attached* is the cleanest way to evidence the rubric's "where you chose not to use one".
- **How to independently reimplement:** (1) Generator emits `(input, hiddenLabel)` pairs. (2) Decision code must not be able to import the label — enforce with a lint rule or module boundary, not a comment. (3) Score by path **and** by money. (4) Report the confusion classes, not just the headline. (5) **Fix the flaw here:** generate lexical variety — paraphrase, noise, typos, mixed-language, contradictory signals. Six fixed sentences is a lookup table, not a test set. (6) Derive the path label from *which classifier ran*, not from ground truth (`diagnosis.ts:63-64`).
- **Risks:** As implemented, both the accuracy figure and the keyword heuristic were authored by the same person against the same six strings; the metric has near-zero statistical content. The pattern is excellent; this instance of it is under-powered.
- **Score: 7/10**

### P4 — Policy config as a single cited object; gate as the sole path to a money action
- **Type:** `COMPONENT_PATTERN`
- **Source:** `src/lib/domain/config.ts:15-67` (every bound in one interface, with RBI and card-network citations inline at `:44-48,54-59`), `src/lib/engine/guardrails.ts:63-157` (six ordered checks; the only path to `executor.execute`), `src/lib/engine/loop.ts:286-325` (block → defer / fallback / stop / escalate).
- **Why strong:** Every bound is one greppable object, so a reviewer can audit the entire risk surface in 60 seconds. Citing the regulation *next to the constant* is a genuinely uncommon move and directly serves "would you trust it". The gate distinguishes **deferral** (`retryAt` — come back later) from **termination** (`fallback: "stop"`) from **escalation**, which is the distinction real recovery systems need.
- **Why relevant:** "Bounded and gated" plus "compliant escalation, stopping rules" in one component.
- **Razorpay applicability:** Universal for money-touching agents.
- **How to independently reimplement:** One `Policy` interface, one `DEFAULT_POLICY`, regulatory citation as a comment on the constant it justifies. Gate returns a rich decision (`allowed`, `reason`, `retryAt?`, `fallback?`), not a boolean. Fuzz the policy itself in tests so safety cannot depend on the chosen values (`guardrails.test.ts:21-33`).
- **Risks:** None significant. The `linkBasedExecutor` flag (`guardrails.ts:43-50`) is subtle and easy to get wrong when adding a third executor.
- **Score: 8/10**

### P5 — Two-lock outbound-delivery kill switch on synthetic data
- **Type:** `FAILURE_HANDLING_PATTERN`
- **Source:** `src/lib/razorpay/client.ts:42-46,120,141-143`; test at `src/tests/razorpay.test.ts` ("notifications are off unless explicitly enabled in the environment"); narrative in `FAILURE_STORY.md` §7.
- **Why strong:** Synthetic customers carry real-*format* Indian mobile numbers (`generate.ts:44`), so a single default-on notification flag would text real strangers. Requiring **both** an explicit per-call `notify` argument **and** an environment opt-in — plus a test asserting the default — is the correct response to a near-miss, and every ledger entry records `notificationsSent`.
- **Why relevant:** This *is* a failure-recovery narrative with a code fix attached, which is what Razorpay reads first.
- **Razorpay applicability:** Any project generating synthetic PII-shaped data. Cheap and universally applicable.
- **How to independently reimplement:** Two independent locks (argument + env), default off, a test that asserts the default, and an audit field recording whether delivery occurred.
- **Risks:** None. Consider generating reserved/unroutable number ranges as a third layer.
- **Score: 7/10**

## Selected Patterns

- **P1 — One decision engine, two executors, one entry point.** The single most
  transferable idea in either repository.
- **P2 — Reconcile-before-re-charge with `unknown` as a first-class outcome.**
  Small, self-contained, eliminates an entire class of money bug.
- **P4 — Cited policy config + gate as sole money path.** Cheap to build,
  disproportionate credibility return.
- **P5 — Two-lock outbound kill switch.** Twenty lines; prevents the exact
  incident that produces a bad failure story.
- **P3 — Ground-truth simulator + self-graded diagnosis** — *selected with a
  mandatory fix*: the input corpus must have real lexical variety, and the path
  label must be derived from which classifier ran rather than from the answer key.

## Rejected Patterns

- **The naive baseline as implemented (`engine/baseline.ts`).** Running a baseline
  is the right instinct and the code genuinely executes — but this particular
  baseline is configured to lose (3-hour retry window against a 12–96 hour funds
  delay). Reusing it reproduces the flattering comparison. If you build a
  baseline, size its parameters from the vendor's published behaviour (Razorpay
  Smart Retry) or sweep them, and **report the uplift as a function of the
  baseline's retry window**, not as a scalar.
- **`postOptOutContacts` as a reported metric.** A counter that is never
  incremented is worse than no counter: it occupies the slot where a real
  measurement should be and it green-ticks a CI gate. If a property is structural,
  assert it structurally (as `guardrails.test.ts:128-143` correctly does for quiet
  hours by re-deriving from the ledger) rather than reporting a constant as data.
- **The six-string text corpus in `sim/generate.ts`.** The archetype generator is
  a good pattern; six fixed description strings is not a classification test set.
- **The `Llm.composeMessage` capability.** Declared, implemented, tested by a
  smoke script, advertised in the README — and never called by the product. Either
  wire it into the loop or delete it; a dead interface method that appears in the
  "here is where AI earns its place" section is the one place this repo overclaims.

---

## Overall Scores

| Dimension | Score | Justification |
|---|---|---|
| Idea | **8/10** | Revenue recovery is squarely on-brief and the framing — *"recovers more AND cannot misbehave with money"* — is exactly the dual claim the track asks for; the cost is that Razorpay already ships Subscription Recovery and Abandoned Cart Conversion in Agent Studio, so it is judged against a production baseline the author cannot see. |
| Solution | **8/10** | It genuinely solves the problem inside its own world — batch recovery, exception list, escalation, human gate, live Razorpay path — but the world is self-authored and the headline uplift depends on a baseline configured to fail. |
| Architecture | **9/10** | The `Executor` seam plus a single entry point for CLI/sweep/tests/API is a reusable, independently reimplementable pattern that structurally eliminates demo-versus-metrics divergence, with clean layering and narrow interfaces throughout. |
| AI usage | **8/10** | Correctly surgical — rules for structured error codes, model only for genuinely ambiguous text, never in the money path, structured output, fallback on failure, and the non-use decision is *measured* rather than asserted — but the default pipeline makes zero model calls and one of the two advertised LLM jobs is not wired in. |
| Razorpay relevance | **9/10** | Bounded actions, gated money, idempotency, reconciliation, RBI-cited quiet hours, escalation, stopping rules, honest exception list, audit ledger, real test-mode integration with a live-key refusal — it hits every clause of the Track 03 bar and the four rubric pillars. |
| Engineering quality | **8/10** | Deterministic seeded engine, integer paise, 24 passing tests including randomised-policy fuzzing, CI that fails on any double-charge, no leaked secrets, honest `.env.example`, per-file rationale comments; debits are the absence of client timeouts, one dead-constant metric, and a metric bucket derived from the answer key. |
| Demonstrability | **9/10** | `VERIFIED-BY-EXECUTION`: clean clone → four commands → full scorecard, 790-event ledger, graded eval, all offline in under a minute; plus a replayable dashboard with chaos sliders and a human-gate toggle that visibly costs ₹99k — the human gate blocking five actions on camera is a genuinely strong five-minute demo beat. |

## Final AgentArch Verdict

**Verdict: `ARCHITECTURE_PATTERN` — select P1, P2, P4, P5 outright and P3 with a
corpus fix.** The most completely engineered repository of the two and one that
clears the Razorpay bar on all four pillars, with a bounded-autonomy layer that is
entirely code rather than prose — undermined only by a naive baseline configured
to lose, a six-sentence classification corpus, and one headline safety metric
that is a hardcoded zero.
