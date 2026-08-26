# AgentArch — abhinav-phi/reflex

| Field | Value |
|---|---|
| Repository | https://github.com/abhinav-phi/reflex |
| Competition | Razorpay AI Buildathon — **Track 03** (AI Revenue Recovery) |
| Head | `b4f2a6e`, first commit 2026-08-23, 36 commits, 3 author identities |
| Scratch clone | `/tmp/rzp_scratch/abhinav-phi_reflex` |

## Original Problem

Indian subscription/D2C merchants lose recurring revenue to failed UPI AutoPay debits, card
declines and e-mandate/NACH failures, and respond with either silence or blast SMS. Reflex
diagnoses the **root cause** of each failure and chooses a bounded intervention.

Governing principle, stated up front: ***AI proposes, deterministic code disposes.***

## Actual Architecture (from code)

Monorepo: `apps/api` (FastAPI), `apps/workers` (planner, dispatcher, runner), `apps/eval`
(pipeline + runner), `apps/web` (React), `packages/core`, `packages/brain` (EV policy),
`packages/shield` (guardrails), `packages/ledger`, `packages/connectors` (`razorpay.py`),
`packages/prompts` (templates + validators), `alembic/` migrations.

Flow: Razorpay test-mode webhooks (HMAC verify, dedup) → diagnosis worker (**rules first, LLM only
on the tail**) → Brain (EV policy: `p_recover × amount − channel_cost − annoyance_penalty`) →
**Shield** (deterministic, fail-closed, non-overridable — the policy can only *propose* to it) →
executors → hash-chained ledger.

Test tree is unusually broad: `tests/{ai,api,e2e,integration,load,security,unit}`.

### The standout: a pre-registered evaluation protocol with git-tagged amendments

`eval/PROTOCOL.md` is tagged `eval-preregistered-v1` and states the protocol was "committed,
tagged, and pushed **before** the first evaluation result was produced. Any change to this file
after results exist invalidates provenance and must be recorded as a protocol amendment (new tag,
old results marked superseded)."

Two amendments are recorded in the file itself, each with its own tag, each timestamped relative to
results. `eval/results/` contains a directory literally named
**`superseded_pre_amendment/`** — superseded results are preserved, not deleted.

Simulation-integrity rules are declared: "no target metric may be hard-coded into agent/UI code…
actuals are reported whatever they are; **one honestly-reported cohort where Reflex loses or
correctly declines is mandatory** in `docs/limitations.md`."

This is research-grade methodology and I found no other repo in the shortlist doing it.

### Pre-registered gates, honestly reported as MISSED

`docs/limitations.md` reports actuals against pre-registered gates G1–G6:

| Arm | Recovery % [95% CI] | Cost/₹100 | Complaint % |
|---|---|---|---|
| B0 do nothing | 4.68 [3.71, 5.75] | ₹0 | 0% |
| B1 tuned naive (retry×3 + blast SMS×2) | 21.16 [19.10, 23.36] | ₹0.15 | 0.567 |
| **Reflex** | **31.40 [28.94, 33.98]** | ₹0.27 | 0.244 |

> "**G1 incremental recovery vs B1 ≥ +15 pp — MISSED.** Actual +10.24 pp [+7.83, +12.62].
> Reflex beats tuned-naive decisively (the CI excludes 0) but by less than the aspirational target.
> **We claim the win we measured, not the one we hoped for.**"

Pre-registering a target and then publishing your own miss is the strongest honesty signal
available. Note also the baseline is a **tuned** naive baseline, not a strawman, and per-seed
results are published (34.33 / 29.62 / 30.15).

### The builder disclosed that his own LLM was a no-op

`eval/PROTOCOL.md` Amendment 2: "the eval pipeline **previously hardcoded a noop LLM**, so the
'reflex' arm was rules-only regardless of keys." That is precisely the "fake AI" failure mode I
hunt for — found, disclosed, tagged, and fixed by the builder himself, with the prior run
"preserved verbatim" as the record of the degraded configuration.

### Best component: the digit/URL/₹ span validator and the "Hinglish loophole"

`packages/prompts/validators.py` — the LLM never authors an amount, link, deadline or UPI handle;
numbers are DB-injected after generation.

- `:24` — `_FORBIDDEN = re.compile(r"\d|http|₹|UPI-", re.IGNORECASE)`
- `:26-37` — **`_NUMBER_WORDS`**: the builder found that "an LLM can bypass the digit regex by
  verbalizing amounts ('teen sau rupaye', 'five hundred')", so spelled-out Hindi/Hinglish and
  English numerals are rejected wholesale.
- `:27-29` — the asymmetry is argued: "a false-positive rejection costs only the safe deterministic
  template, while a miss lets an unverifiable verbalized amount reach a customer."

That is a genuine red-team finding against one's own guardrail, with the right cost-asymmetric
resolution. `DiagnosisOutput`/`ReplyIntentOutput` are strict Pydantic schemas with
`extra="forbid"`, range-checked confidence, and a documented fallback (one retry → deterministic
`UNKNOWN_AMBIGUOUS`).

## What The Code Proves

### Claims VERIFIED
| Claim | Evidence |
|---|---|
| LLM never authors a number/link/handle | `packages/prompts/validators.py:24,30-37` |
| Strict schemas + deterministic fallback | `validators.py:42-70` (`extra="forbid"`, confidence range) |
| Pre-registered protocol with tagged amendments | `eval/PROTOCOL.md`; `eval/results/superseded_pre_amendment/` |
| Gates reported honestly including a MISS | `docs/limitations.md` §2 (G1 MISSED) |
| Baseline is tuned, not a strawman | B1 = retry×3 + blast SMS×2 at 21.16% |
| Rules-first, LLM on the ambiguous tail only | `dx_holdout` `rules_coverage: 0.896` |

### Overclaims and problems — **flagged**

1. **`eval/results/dx_holdout/report.json` reports `accuracy: 1.0`, 500/500 correct, with a
   perfectly diagonal confusion matrix — and `llm_configured: false`.** A 100% accuracy on a
   "holdout" is not a triumph, it is a **circularity alarm**: the synthetic generator
   (`apps/eval/generator.py`, `CODE_MIXTURE`) emits decline strings drawn from the same 11-code
   canonical taxonomy that the rule table matches against. The rules fire on 89.6% and the
   conservative `UNKNOWN_AMBIGUOUS` fallback absorbs the rest. **This measures the generator, not
   the diagnoser.** It would collapse on real issuer strings — which is exactly the ambiguous tail
   the LLM is supposed to exist for. This is the repo's single biggest hole and a Razorpay engineer
   will find it in under a minute.
2. **Every headline number is `[SIMULATED]`** — correctly and repeatedly labelled, but the
   simulator's constants are "assumptions calibrated to public patterns… **not ground truth from a
   real merchant**." Unlike recovery-ledger, there is **no real-data tier** validating the
   machinery before the simulator. That is the material methodological gap between the two.
3. **README badge "tests — 164 passing"** — `UNDETERMINED — I read the badge and the test tree
   (tests/{ai,api,e2e,integration,load,security,unit}) but did not execute the suite; it requires
   Postgres 16 + Redis per docker-compose.` The badge is a static shields.io image, not a CI status
   badge, so it asserts nothing by itself.
4. **"[Live Demo Video](#)"** — the link is an empty anchor. Nothing behind it at head.
5. Channel executors (WA/SMS/Email/Voice) are explicitly labelled `SIMULATED` in the architecture
   diagram — honest, but it means no outbound action is ever really bounded in production terms.

## Candidate Patterns

### P1 — Pre-Registered Evaluation Protocol with Tagged Amendments `EVALUATION_PATTERN` — **SELECT**
- **Source:** `eval/PROTOCOL.md`; `eval/results/superseded_pre_amendment/`
- **What:** commit and git-tag the metric definitions, gates and simulator version *before*
  producing any result. Changes require a new tag; superseded results are preserved verbatim.
- **Why strong:** it makes p-hacking and post-hoc goalpost-moving **mechanically visible**. It
  costs one markdown file and one `git tag`, and it converts every subsequent number from "trust
  me" into "check the tag date."
- **Razorpay applicability:** universal, and it is the cheapest credibility purchase available to
  us — a single file, written before we run anything.
- **Reimplement:** write `EVAL_PROTOCOL.md` defining metrics, gates, batch construction and seeds;
  `git tag eval-v1` and push **before** the first run; if the protocol must change, tag an
  amendment and move old results to `superseded/`.
- **Risks:** only credible if the tag genuinely predates the results — the git history must back it.
- **Score: 10/10**

### P2 — Publish a Pre-Registered Gate You Missed `EVALUATION_PATTERN` — **SELECT**
- **Source:** `docs/limitations.md` §2 (G1 MISSED, +10.24 pp vs ≥+15 pp target)
- **What:** declare aspirational thresholds in advance, then report pass/miss honestly, and state
  "we claim the win we measured, not the one we hoped for."
- **Why relevant:** rubric pillar 4 ("what broke, and what you did about it") and every track bar's
  honesty clause. A published miss buys more credibility than three passes.
- **Score: 9/10**

### P3 — Cost-Asymmetric Output Validator (the Hinglish loophole) `COMPONENT_PATTERN` — **SELECT**
- **Source:** `packages/prompts/validators.py:24-37`
- **What:** never let the LLM emit money-bearing tokens; reject digits, URLs, ₹, UPI prefixes **and
  spelled-out numerals in both languages**; render amounts from the DB via slot templates. Justify
  the strictness by cost asymmetry.
- **Why strong:** it closes a bypass most people never consider, and it is the concrete mechanism
  behind "the LLM never authors an amount" — a claim many repos make and none but this one enforce.
- **Reimplement:** regex for digit/URL/currency + a whole-word numeral-word set for every language
  the messages support; reject the whole span and fall back to the deterministic template.
- **Risks:** the word list is unbounded (other languages, "a couple hundred"); it is a mitigation,
  not a proof. Pair it with the structural fix — the LLM never sees the amount at all.
- **Score: 9/10**

### P4 — Rules-First / LLM-Tail with Measured Coverage `WORKFLOW_PATTERN` — SELECT (with a caveat)
- Deterministic lookup handles the bulk; the LLM is invoked only on rule-misses, and the **coverage
  split is measured and published** (`rules_coverage: 0.896`). Reporting the split is the good part.
- **Caveat:** must be evaluated on data whose labels were *not* generated from the same taxonomy —
  see the circularity problem above.
- **Score: 7/10**

## Rejected Patterns
- **The `dx_holdout` accuracy=1.0 result.** Do not reproduce this shape. Any evaluation returning
  100% with a perfectly diagonal confusion matrix should be treated as a bug in the evaluation, not
  a result. If we ever see 1.0, we go looking for the leak.
- **Static shields.io "164 tests passing" badges.** They assert nothing. Use a real CI badge or none.

## Overall Scores

| Dimension | Score | Justification |
|---|---|---|
| Idea | 6 | Failed-payment dunning is the single most crowded track-03 idea and collides with Razorpay's shipped Subscription Recovery agent. |
| Solution | 8 | Genuine closed loop with a tuned baseline, EV policy and a non-overridable shield. |
| Architecture | 9 | Brain/Shield/Hands/Ledger separation with propose-only policy is clean and legible. |
| AI usage | 8 | Rules-first with a measured tail and a real output validator — docked because the eval's LLM was a noop until Amendment 2. |
| Razorpay relevance | 8 | T03 bar addressed; HMAC webhooks and a real `connectors/razorpay.py`. |
| Engineering quality | 9 | Pre-registration, amendments, superseded artifacts, 7 test categories, alembic migrations. |
| Demonstrability | 7 | Good architecture story and failure narrative; demo video link is an empty anchor at head. |

## Final AgentArch Verdict

**Research-grade evaluation discipline — pre-registered, tagged, amended in the open, with a
published missed gate and a self-disclosed noop-LLM bug — sitting on top of a synthetic holdout
that scores a perfect 1.0 because its labels come from the same taxonomy the rules match.**
