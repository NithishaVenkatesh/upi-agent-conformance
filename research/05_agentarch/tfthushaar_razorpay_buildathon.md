# AgentArch — tfthushaar/razorpay_buildathon (Settlement Reconciliation Copilot)

| Field | Value |
|---|---|
| Repository | https://github.com/tfthushaar/razorpay_buildathon |
| Competition | Razorpay AI Buildathon — **Track 04** (AI Finance Controller) |
| Head | `7120936`, first commit 2026-08-24, 50 commits |
| Deployed | razorpay-buildathon-five.vercel.app |
| Scratch clone | `/tmp/rzp_scratch/tfthushaar_razorpay_buildathon` |

## Original Problem

A Razorpay settlement is one bank credit standing in for hundreds of transactions, net of fees,
GST and refund offsets. The system explodes the credit back into its transactions, narrates
*which hop* in the causal chain broke, and **only auto-resolves what it has statistically earned
trust on** — escalating the rest with a stated reason.

## Actual Architecture (from code)

`backend/app/`: `chain/builder.py` (causal chain), `matching/`, `feeleak/`, `narrator/agent.py`
(the LLM layer, 36KB — largest source file), `calibration/` (`wilson.py`, `calibrator.py`,
`drift.py`, `history.py`), `audit/logger.py`, `connectors/razorpay_sandbox.py`, `data_gen/generate.py`,
`erp/`. Frontend React. `backend/tests/`: `test_api`, `test_narrator`, `test_pipeline`,
`test_calibration`, `test_razorpay_sandbox`.

Evidence committed under `docs/evidence/`: a 3.3MB `50k-batch-run-2026-08-25.json`, a
`verified_audit_log.db`, `verified_calibration_history.db`, and a raw Razorpay sandbox API dump.

### The standout idea: autonomy that is earned, revocable, and statistically gated

`backend/app/calibration/wilson.py` + `calibrator.py`. Per-category accuracy is tracked, and a
category is granted **auto-resolve** only when the **Wilson 95% CI lower bound** clears a threshold
(`DEFAULT_THRESHOLD = 0.90`) — not the point estimate.

`wilson.py:1-7` argues the choice: per-category sample sizes in a 50–200 record batch are small, so
"a flat '92%' with no interval invites exactly the kind of scrutiny a judge should apply."
`wilson.py:15` — `n == 0` returns `(0.0, 1.0)`, "maximal uncertainty, not '0% accurate'". Correct.

`calibrator.py:1-15` states which decisions are eligible: only narrator-classified ones.
Deterministic Pass 1/Pass 2 resolutions "are arithmetic facts, not statistical estimates, so
running a confidence interval over them would be conceptually wrong." **Calibration is reserved
for exactly the cases where AI judgment is actually being exercised.** That is a genuinely
sophisticated distinction and a direct hit on rubric pillar 3.

`calibrator.py:35-38` — `NEVER_AUTO_RESOLVE = {"genuine_error"}`: "no accuracy number, however
high, makes auto-resolving an admittedly-unexplained case the right move." The README leans on
this: `genuine_error` measured 80.3% and **stayed escalated anyway**. "A system willing to *not*
act is the only reason a finance team would ever let it act."

### Two self-discovered gaming vectors, both fixed — the best failure narrative in the field

**Vector 1 — mock decisions were earning autonomy.** `calibrator.py:17-25`:
> "only decisions from a real LLM provider (`provider != "mock"`) count toward the auto-resolve
> decision… This was caught empirically: **6 consecutive mock-mode batch runs alone crossed the 90%
> Wilson-lower-bound threshold for netting_trap with no LLM ever having been called.**"

**Vector 2 — a statistically deep one.** `calibrator.py:40-52`:
> "repeatedly clicking 'Run batch' on the same (default) seed re-observes the SAME small set of
> cases and inflates `n` with correlated, not independent, samples… Found live in this project's
> own committed evidence: `docs/evidence/real-ollama-run-2026-08-24.json` reports
> duplicate_refund n=15, but seed=42 only ever produces 4 DISTINCT duplicate_refund transactions…
> **The Wilson bound alone can't catch this**: given enough repeated (not independent) trials at a
> genuinely high per-case accuracy, ci_lower approaches the point estimate and would eventually
> clear 90% even with zero real distinct-case diversity."

Fix: `MIN_DISTINCT_TRANSACTIONS_FOR_AUTO_RESOLVE = 15`, "on top of the existing statistical-
confidence requirement, not instead of it."

Recognising that **a confidence interval computed over non-independent repeated observations is
meaningless** is a real statistical insight, and the builder caught it in his own committed
evidence and left the incriminating file in the repo. This is the highest-quality "what broke and
how I got out" material I found anywhere in the field.

### Honest labelling of the throughput gap

The README scoreboard does not hide the mock/real split:
- Batch: "**50,000 (mock provider) / 120 (real Ollama)**"
- Throughput: "5,508 tx/sec (mock, 50k scale) — **2.58 tx/sec (real LLM, measured, not
  extrapolated)**. The 2,000× gap is the deterministic/LLM split below, not two different systems."
- Real Razorpay data: a disclosed discrepancy is walked through arithmetically (raw `fee: 1180,
  tax: 180` on a 50000-paise payment → pre-tax base 1000 = 2.0%, matching the `card` rate constant,
  "not `netbanking` — a real, disclosed discrepancy").
- "settlement is structurally unavailable in test mode, **verified not assumed**."

## What The Code Proves

### Claims VERIFIED
| Claim | Evidence |
|---|---|
| Wilson lower-bound gating, not point estimate | `calibration/wilson.py:12-21`, `calibrator.py` |
| A category permanently excluded from autonomy | `calibrator.py:35-38` `NEVER_AUTO_RESOLVE` |
| Mock decisions cannot earn autonomy | `calibrator.py:17-25`, `ScoredDecision.provider` field |
| Distinct-transaction floor against correlated resampling | `calibrator.py:40-52` |
| Calibration applied only to AI-judgment decisions | `calibrator.py:1-15` |
| Mock vs real scale/throughput labelled | README scoreboard |
| Committed raw evidence incl. audit-log DB | `docs/evidence/` (50k JSON, `verified_audit_log.db`) |

### Overclaims and problems — **flagged**

1. **The headline scale is mock.** "50+ record batch → 50,000" is a **mock provider** run; the real
   LLM run is **120 records** with 7 escalations. It *is* labelled, in the same table — but "50,000"
   is the number in the scoreboard cell, and a reader skimming the left column sees a 1000× overstatement
   of what the AI actually processed. The real, defensible claim is 120.
2. **`true_label` is present in the scored decision object.** `ScoredDecision.true_label` is
   commented "scoring-only; never influences the predicted_category itself" (`calibrator.py:~57`).
   I read the field declaration and the comment; **UNDETERMINED — I did not trace every consumer of
   `ScoredDecision` in `narrator/agent.py` (36KB) to confirm the label never reaches the classifier
   path.** A reviewer will want that proven, not commented.
3. **Ground truth for accuracy comes from `data_gen/generate.py`** — a synthetic generator. The same
   circularity risk as the rest of the field applies: if the generator plants `netting_trap` cases
   with a signature the narrator prompt describes, 98.3% measures the generator. There is **no
   real-data tier** here.
4. **Auto-resolve was earned on 59 distinct cases** for `netting_trap` and 37 for `duplicate_refund`.
   That is small. The Wilson bound is doing exactly the right job of being honest about it (lower
   bound 91.0% vs point 98.3%), but the absolute evidence base is thin.
5. **No `requirements.txt` pinning verified.** `UNDETERMINED — the census lists a `requirements.txt`
   in the quickstart but I did not open it to check for exact pins.` No `.env.example` was detected
   by the census, and `docker-compose.yml` is present without a Makefile.
6. Repo name is `razorpay_buildathon` — a generic name for a submission whose product is named
   "Settlement Reconciliation Copilot." Minor, but it is the first thing a reviewer sees.

## Candidate Patterns

### P1 — Earned, Revocable Autonomy via Wilson Lower Bound `ARCHITECTURE_PATTERN` — **SELECT, top-3 in field**
- **Source:** `backend/app/calibration/wilson.py`, `calibrator.py:30-52`
- **What:** the agent does not get blanket permission to act. Per **category**, track measured
  accuracy; grant auto-resolve only when the Wilson 95% CI **lower bound** clears a threshold; keep
  it revocable as evidence accumulates; and hold some categories permanently ineligible regardless
  of the number.
- **Why strong:** it is the most concrete answer I have seen to "bounded and gated" and
  "calibrated autonomy." It converts autonomy from a design-time constant into a **measured,
  earned, revocable runtime property** — and it makes the system's willingness to *refuse* a
  headline feature rather than a limitation.
- **Razorpay applicability:** T04's "throughput plus measured accuracy plus an honest exception
  list" directly; T02 and T03's gating clauses just as well.
- **Reimplement:** ~40 lines. Wilson interval function; per-category (successes, n) accumulator over
  scored decisions; `decision = auto_resolve if ci_lower >= threshold and category not in NEVER and
  distinct_n >= floor else escalate`. Expose the threshold as a live dial since re-aggregation is cheap.
- **Risks:** requires trustworthy `true_label`s, which on synthetic data reintroduces circularity;
  and it needs the two anti-gaming guards below or it is trivially satisfiable.
- **Score: 10/10**

### P2 — Anti-Gaming Guards on an Earned-Trust Gate `EVALUATION_PATTERN` — **SELECT**
- **Source:** `calibrator.py:17-25` (provider-aware) and `:40-52` (distinct-transaction floor)
- **What:** (a) only decisions from a **real** model provider count toward earning autonomy — mock/
  stub decisions are recorded (`mock_n`) but never gate; (b) require a floor of **distinct** cases,
  because a CI over correlated repeated observations converges on the point estimate and will
  eventually clear any threshold with zero real evidence diversity.
- **Why strong:** guard (b) is a subtle and correct statistical point that most builders — and many
  reviewers — would miss. Shipping the guard *and* the story of finding it in your own evidence file
  is worth more than the feature.
- **Score: 10/10**

### P3 — Calibrate Only Where AI Judgment Is Exercised `COMPONENT_PATTERN` — **SELECT**
- **Source:** `calibrator.py:1-15`
- **What:** deterministic arithmetic results are reported as **exact**; only model-judgment
  decisions get a confidence interval. Running a CI over a provably-correct computation is
  "conceptually wrong… and could wrongly gate a provably-correct category on small-N noise."
- **Why relevant:** it is a precise, defensible articulation of the AI/deterministic boundary —
  rubric pillar 3 — expressed in the measurement layer rather than in prose.
- **Score: 9/10**

### P4 — Causal-Chain Localisation `SOLUTION_PATTERN` — consider
- `order → payment → fee → refund(s) → settlement`; a mismatch is attributed to the **specific hop**
  that diverges, so the output is "the fee deduction hasn't posted yet," not "these two numbers
  disagree." Good product instinct, and it makes escalations actionable.
- **Score: 8/10**

## Rejected Patterns
- **Headlining a mock-provider batch size.** "50,000" next to "50+ record batch" invites the
  reviewer to discover for himself that the AI touched 120. Lead with 120 and mention 50k as a
  deterministic-path scale test.
- **`true_label` living on the same object the classifier consumes.** Even if never read on that
  path, it is an unnecessary leakage surface. Keep ground truth in a separate scoring join.

## Overall Scores

| Dimension | Score | Justification |
|---|---|---|
| Idea | 8 | Settlement explosion is a real, unglamorous finance-ops loop and less crowded than dunning. |
| Solution | 8 | Closes the loop with narration and escalation, but the real-LLM evidence base is 120 records. |
| Architecture | 8 | Clear chain/matching/narrator/calibration/audit separation. |
| AI usage | **9** | The deterministic/LLM boundary is drawn in the *measurement* layer, and mock output is explicitly barred from earning trust. |
| Razorpay relevance | 9 | T04 bar item by item; real sandbox API dump with a disclosed fee discrepancy. |
| Engineering quality | 8 | Strong reasoning in docstrings and committed evidence DBs; pinning and env setup unverified. |
| Demonstrability | **9** | The calibration dial, escalation queue with tool traces, and a live Vercel deploy make an excellent 5-minute video. |

## Final AgentArch Verdict

**The best "bounded autonomy" mechanism in the field — autonomy earned per-category against a
Wilson lower bound, permanently denied to one category, and defended by two anti-gaming guards the
builder discovered by catching his own system cheating in his own committed evidence.**
