# AgentArch — komallbarhate/AI-Risk-Manager

| Field | Value |
|---|---|
| Repository | `https://github.com/komallbarhate/AI-Risk-Manager` |
| Local clone analysed | `/tmp/rzp_scratch/komallbarhate_AI-Risk-Manager` |
| Competition | Razorpay AI Buildathon — Track 02 (AI Risk Manager), self-declared Defense-Only |
| Placement | Submission, not a placed winner (no ranking evidence) |
| HEAD | `b528366` "Fix demo Case 1 timing data; suppress SHAP warnings…" |
| Commits total | **2** |
| Files at HEAD | 29 + full raw Olist dataset (126 MB committed) |
| Analyst verdict class | `EVALUATION_PATTERN` + `DATA_PATTERN` (two patterns worth taking; the model itself is not) |

---

## Executive summary of the forensic result

This repo is **the inverse of the usual hackathon failure**. The measurement machinery is real,
runnable, and byte-for-byte reproducible — I re-ran `eval/evaluate.py` and it regenerated
`reports/evaluation_summary.md` **identical** to the committed file, and every number in the README's
headline table matches. The cost matrix is a genuine cost matrix. TreeSHAP is genuinely computed
per-request. The audit log is genuinely append-only. The author even ran a label-validation study
before modelling and documented a leakage fix they made mid-build.

And it is all measuring a tautology.

**A single subtraction beats the entire LightGBM stack on the author's own test set and own cost
model.** The rule `days_to_estimated_at_complaint <= 2` scores **ROC-AUC 0.9435 / precision 0.498 /
recall 0.877 / net savings $58,705** versus the model's **0.8615 / 0.481 / 0.765 / $50,250**. The
"AI Risk Manager" saves **17% less money** than one comparison operator, and the repo's own
"heuristic baseline" is a strawman constructed to lose.

---

## Original Problem (README, §1)

Detect **complaint-timing anomalies** — buyers filing 1-star defect complaints *before* receiving
goods, manufacturing a paper trail to exploit automated refund workflows. Built on the public Olist
Brazilian e-commerce dataset (95,824 delivered orders with reviews).

Label (`pipeline/feature_builder.py:82-85`):
```python
df["is_anomaly"] = (
    (df["review_score"] == 1) &
    (df["review_creation_date"] < df["order_delivered_customer_date"])
).astype(int)
```

The README is explicit that this is a proxy, not ground-truth fraud
(`feature_builder.py:12`: *"This is a risk/anomaly proxy, not ground truth fraud"*). That honesty is
real and is credited below. It is also, as shown in §1(d), **not honest enough** — the proxy is worse
than the author realised.

---

## Actual Architecture (from code)

```
data/raw/*.csv  (8 Olist tables, 126 MB, committed)
      │
      ▼  pipeline/feature_builder.py
   label is_anomaly (fb:82-85)  ·  30 features, Groups A–F (fb:231-249)
   target-encoding fitted on TRAIN ONLY (fb:222-224)   ← correct
   train_test_split(random_state=42, stratify) (fb:214-219) ← RANDOM, not temporal
      │
      ├──► data/processed/train.parquet  76,659 × 45   (2,824 pos)
      └──► data/processed/test.parquet   19,165 × 45   (  706 pos, 3.68%)
                    │
   ┌────────────────┴────────────────────────────────┐
   ▼                                                 ▼
scoring/model.py  RiskScorer                   eval/evaluate.py
  LGBMClassifier(scale_pos_weight≈26)  m:97-112    4-policy cost comparison
  shap.TreeExplainer                   m:116       C_FP=$25 C_FN=$120  e:32-33
  score_single → prob, band, conf,     m:136-215   threshold sweep      e:109-122
                 top-3 SHAP factors                writes reports/*.md  e:182
      │
      ▼
agent/decision_engine.py  RiskDecisionAgent.process_event   de:29-128
  L1 ML score  (de:40)   +   L2 heuristics HF-1..HF-5 (de:45)
  policy ladder de:60-86 → AUTO_APPROVE | FLAG_FOR_REVIEW | AUTO_DENY
      │
      ▼
agent/audit_logger.py → logs/audit_trail.jsonl   (append-only, al:31-32)
      │
      ▼
demo.py — 5 hardcoded cases (4 fabricated dicts + 1 hand-transcribed real order)
```

- **Sync/async:** entirely synchronous, batch + CLI. No service, no API, no queue.
- **Datastores:** parquet on disk + a JSONL append log. No DB.
- **External systems / APIs:** none. **AuthN/AuthZ:** none needed (CLI only).
- **Validation:** `_prepare_features` (`model.py:78-85`) coerces to numeric and `fillna(0.0)` —
  a silent-failure risk: an unparseable field becomes `0.0` and scores as a legitimate value with
  no warning.
- **State management:** stateless per event; `customer_prior_*` features are precomputed in the
  pipeline, so the running agent has no customer memory.

---

## 1. Is the measurement real or theatre? — **REAL MACHINERY, TAUTOLOGICAL TARGET**

### (a) Train/test split — genuine, **but RANDOM, not temporal**

`pipeline/feature_builder.py:214-219`:
```python
train_df, test_df = train_test_split(df, test_size=0.20, random_state=42, stratify=df["is_anomaly"])
```

Verified from the committed parquets:
```
train dates: 2016-10-03 → 2018-08-29     test dates: 2016-09-15 → 2018-08-29
```
Complete temporal overlap. For a fraud/abuse model this is the wrong split — it lets the model see
the future distribution and, more concretely here, the seller and category mix. The README's framing
("**point-in-time**", "zero lookahead leakage") describes *feature construction*, which is genuinely
point-in-time, but a reader will hear "temporal validation", which this is not. The README never
states the split is random.

### (b) Leakage — **three distinct vectors, one of them a headline-number problem**

**(b1) Threshold tuned on the test set, metrics reported from the same set — CONFIRMED.**
`eval/evaluate.py:109-135`:
```python
thresholds = np.linspace(0.1, 0.9, 81)
for th in thresholds:
    yp = (probs >= th).astype(int)          # probs are TEST-set probabilities
    ...
    if c < best_cost: best_cost, best_thresh = c, th
...
"precision": precision_score(y_test, y_pred_opt)   # reported at the same threshold
```
There is no validation split anywhere in the repo. `RiskScorer.train(self, train_df, val_df=None)`
(`model.py:87`) accepts a `val_df` and **never uses it** — dead parameter. So the headline
**"Cost-Optimal (P ≥ 0.66) → precision 0.481, $50,250 saved"** is an in-sample-tuned number presented
as a production number. The README's *Key Takeaway 2* explicitly sells this ("Tuning the risk
threshold directly balances C_FP vs C_FN") without disclosing that the tuning set is the reporting set.

*Fairness note, since this cuts both ways:* the magnitude is small. The un-tuned P≥0.50 row gives
0.464 / $49,365 versus the tuned 0.481 / $50,250 — a ~$885 (1.8%) optimism. The cost surface is flat
so the bias is minor. **The principle is still violated and the disclosure is still missing**, and a
Razorpay reviewer will flag it regardless of magnitude.

**(b2) `seller_avg_review_score` includes the scored order's own review — CONFIRMED in code.**
`feature_builder.py:199-202` computes seller statistics from the **full `reviews` table**, before the
split and without excluding the current order:
```python
seller_stats = reviews.merge(items[["order_id","seller_id"]], ...).groupby("seller_id").agg(
    seller_review_count=("review_score","count"),
    seller_avg_review_score=("review_score","mean"))
```
Since `review_score == 1` is half the label definition, each test row's own review score is baked
into its own `seller_avg_review_score` feature. Diluted by seller volume, but material for
low-volume sellers. Not mentioned anywhere in the README. Compare with lines 222-224, where the
author *did* correctly restrict `category_anomaly_base_rate` and `seller_anomaly_rate` to the train
split — so the author knows the pattern and missed one instance of it.

**(b3) `customer_prior_anomaly_count` crosses the split — minor.**
`feature_builder.py:191-195` builds it from `is_anomaly` over the whole frame before splitting.
878 of 19,165 test customers (4.6%) also appear in train. The `shift(1).cumsum()` is causal in
purchase order so it is not lookahead, but test-row labels can feed train-row features. Small, and
the author's own analysis (96.88% single-order customers) bounds it.

**Credit where due:** the README *volunteers* a leakage fix it made — dropping
`actual_delivery_days` / `delivery_early_days` and re-reporting ROC-AUC **down** from 0.8796 to
0.8615 and precision **down** from 60.7% to 48.1%. **Publishing a table where your own numbers get
worse is the single most credible thing in either repo I reviewed.** It is exactly the "what broke
and how you got out" artifact the rubric reads first.

### (c) Reproducibility — **YES, fully. Verified by execution.**

```
$ .venv/bin/python eval/evaluate.py
ROC-AUC = 0.8615 | PR-AUC = 0.4590
1. Naive No-Op            P=0.000 R=0.000  cost=$84,720  savings=$0
2. Simple Rule Baseline   P=0.003 R=0.016  cost=$172,575 savings=-$87,855
3. AI Risk Model P>=0.50  P=0.464 R=0.768  cost=$35,355  savings=$49,365
4. Cost-Optimal  P>=0.66  P=0.481 R=0.765  cost=$34,470  savings=$50,250
$ diff <committed reports/evaluation_summary.md> <regenerated>   →  IDENTICAL
```
Every README number is generated by a committed script from committed data and a committed model.
**Nothing is hardcoded.** This clears Track 02's core bar mechanically, and puts the repo in the top
decile of hackathon submissions on this axis alone.

### (d) Circular label — **CONFIRMED, and worse than the author documented. THIS IS THE FATAL FLAW.**

The data is **real**, not synthetic — so this is not the Kaggle-generator failure. It is a subtler and
more interesting one: **the label and the strongest feature are two views of the same timestamp
arithmetic, mediated by an Olist operational artifact.**

Olist emails the review survey when the order is delivered — or, if it has not arrived, at around the
**estimated delivery date + 2 days**. Measured on the committed test set:

| Cohort | quantiles of `review_creation_date − order_estimated_delivery_date` (days) at .01/.10/.25/.50/.75/.90/.99 |
|---|---|
| **Positives** (`is_anomaly=1`) | −19.95, **+1, +2, +2, +2**, +3, +7 |
| **Negatives** | −35, −22, −16, **−12**, −7, −3, +2 |

The positive class collapses onto a **+2-day spike**. That is not buyer behaviour; that is a mail
scheduler. The feature `days_to_estimated_at_complaint` (`feature_builder.py:161`) is exactly the
negation of this quantity — so it is a near-deterministic marker of the label.

Consequence, measured:

| Detector | ROC-AUC | PR-AUC | Precision | Recall | Net savings (author's own cost model) |
|---|---|---|---|---|---|
| **`-days_to_estimated_at_complaint`, cost-opt th** | **0.9435** | 0.4535 | **0.498** | **0.877** | **$58,705** |
| `complaint_to_estimated_ratio`, cost-opt th | 0.9419 | 0.3703 | 0.433 | 0.915 | $56,370 |
| One-line rule `days_to_estimated <= 0` | — | — | 0.357 | 0.925 | $48,935 |
| **LightGBM (repo, P ≥ 0.66)** | 0.8615 | 0.4590 | 0.481 | 0.765 | $50,250 |
| Repo's own "Simple Heuristic Baseline" | — | — | **0.003** | 0.016 | −$87,855 |

**A single feature, thresholded, strictly dominates the 30-feature LightGBM model on ROC-AUC,
precision, recall and dollars saved.** The model is not a "calibrated refinement of a single timing
signal" (README, Known Limitations) — it is a *degradation* of it.

And the residual is explained too. Among the 1,656 test orders where `review < delivery`, the review
score distribution is `{1★: 706, 2★: 112, 3★: 174, 4★: 200, 5★: 464}`. The timing half of the label is
~free; the `review_score == 1` half is essentially unpredictable from order metadata. **706/1656 =
0.426 — and the model's reported precision is 0.481.** The model's precision *is* the base rate of
1-star among late deliveries. It has learned "was the delivery late" and nothing else.

**The system therefore flags late deliveries as return abuse.** 950 of those 1,656 pre-delivery
complaints are 2–5 star reviews from customers whose parcel was late. In production this would route
refund friction toward customers the *merchant's own carrier* failed. That is the opposite of a risk
manager. The README's Known Limitation ("roughly 1-in-3 positive labels represent legitimate
frustration") understates it: the *entire discriminative signal* is carrier lateness.

### (e) Cost-weighted evaluation — **REAL. The best-implemented thing in either repo.**

`eval/evaluate.py:32-33, 57-59, 78-80, 94-96, 114-122`:
```python
COST_FP = 25.0
COST_FN = 120.0
tn, fp, fn, tp = confusion_matrix(y_test, yp).ravel()
c = (fp * COST_FP) + (fn * COST_FN)
```
An actual asymmetric cost applied to an actual confusion matrix, swept across 81 thresholds, compared
against a defined **do-nothing baseline** (Policy 1: approve-all, $84,720 = 706 × $120), with savings
expressed relative to that baseline. This is exactly the shape Track 02 asks for and it is
implemented correctly. The costs themselves are asserted, not sourced — but they are stated, visible
in one place, and trivially swappable.

**Caveat that undercuts it:** the policy table evaluates a **pure threshold classifier**. The shipped
system is a **three-action agent** (`decision_engine.py:60-86`) with hardcoded bands 0.25 / 0.65 /
0.75 — which are *not* the cost-optimal 0.66, and which route a large middle region to
`FLAG_FOR_REVIEW` (a human, with a real cost, never priced). **The measured numbers do not describe
the deployed decision policy.** The agent itself is never evaluated on the batch.

---

## 2. Is the AI load-bearing or decorative?

### LLM calls: **ZERO — and this is argued, deliberately, and well.**
Verified: no LLM SDK in `requirements.txt` (`pandas, numpy, scikit-learn, lightgbm, shap, pyarrow`);
no `openai|anthropic|claude|gpt` reference anywhere. The README's *"Right Tool in the Right Place"*
table (§3) is a direct, four-row hit on the rubric's *"and where you chose not to use one"* clause —
LightGBM over deep nets, TreeSHAP over LIME (determinism for audit), deterministic rules over ML for
hard policy gates, deterministic policy agent over an LLM ("Generative LLMs hallucinate risk
probabilities and produce non-deterministic financial actions"). Plus explicit **descoping** with
evidence: repeat-customer rules dropped because 96.88% of Olist customers have exactly one order;
review-text NLP dropped for negligible marginal signal.

**This is the strongest pillar-3 answer I have seen in this corpus.** It is undermined only by the
fact that the deterministic-rule layer it praises turns out to be mostly non-functional (below), and
by §1(d) — the honest conclusion of its own logic would have been "don't use ML here either."

### TreeSHAP: **genuinely computed, per-request, not printed once.**
`scoring/model.py:116` builds `shap.TreeExplainer(self.model)`; `model.py:172-182` calls
`self.explainer.shap_values(X_single)` **inside `score_single`**, handles all three SHAP output
shapes (list / 3-D / 2-D), takes the top-3 by `|value|`, and maps each to a plain-English template
(`model.py:26-46`). Verified live by running `demo.py`: the attributions in the terminal
(`days_to_estimated_at_complaint (+1.966)`, `complaint_to_estimated_ratio (+0.961)`) reproduce the
README's Case 5 numbers exactly, and land in `logs/audit_trail.jsonl` attached to the decision record.
**This is real local explainability wired into the audit trail, not global feature importance.**
It is the second-best thing in the repo.

### The deterministic "Layer 2" rules: **mostly dead, and one of them reads the label.**

**HF-1 is a ground-truth oracle.** `scoring/heuristics.py:45`:
```python
if order_data.get("is_anomaly") == 1 or is_pre_delivery_complaint:
```
`is_anomaly` is the **label**. `test.parquet` carries it as a column. Any event dict sourced from the
processed data will fire HF-1 because the answer is in the payload. It is unknowable at decision
time. And `decision_engine.py:66` gates the **AUTO_DENY** path on it
(`has_critical_flag and risk_score >= 0.65`) — so the money-denying branch is label-corroborated.
It does not contaminate `eval/evaluate.py` (which uses only `probs`), so the reported metrics are
clean — but **the demo's most important action is gated on the answer key.**

**HF-2 and HF-5 can never fire.** Both require `order_status == "canceled"` /
`post_carrier_canceled` (`heuristics.py:58, 86`), but `feature_builder.py:73` restricts the entire
universe to `order_status == "delivered"`. Two of five "deterministic business rules" are structurally
unreachable in this pipeline.

**HF-4 is near-dead:** requires `customer_prior_order_count >= 3` (`heuristics.py:77`) against the
author's own finding that 96.88% of customers have one order.

So the "Layer 2 Heuristic Flags Panel" the architecture diagram gives equal billing to is: one label
echo, two unreachable rules, one near-unreachable rule, and one category/value check (HF-3).

### Verdict
The AI is **not decorative — it is worse than that: it is net-negative.** It is genuinely wired in
(SHAP in the audit record, model in the decision path), but on the author's own test set and own cost
function it loses to one subtraction by $8,455. Under the rubric's *"would a `for` loop and a regex do
this?"* the answer here is measurably **yes, and better.**

---

## 3. Four pillars

**(a) Does it run?** — **Yes, and it did, in my hands.**
- I created a clean venv, `pip install -r requirements.txt`, and ran `eval/evaluate.py` and `demo.py`
  end-to-end with no edits. Both worked.
- **Trained model artifact is committed** (`models/risk_scorer.pkl`) — no retraining needed.
- **Seed data is committed in full** (126 MB of raw Olist CSVs + both processed parquets). Heavy, but
  it means the reviewer's clone reproduces the exact numbers. Correct tradeoff for this rubric.
- README has real, ordered setup steps (§Setup, 5 steps).
- **Deps are NOT pinned** — all `>=` (`requirements.txt`). It worked on lightgbm 4.7 / shap 0.52 today;
  it is one upstream release from a pickle-load break. Saxena pinned; this repo did not.
- `scripts/find_real_failure_case.py:16,27,28` references `actual_delivery_days` and
  `delivery_early_days` — **columns removed by the leakage fix**; verified absent from `test.parquet`.
  The script that allegedly sourced the flagship failure case **crashes with `KeyError`**. Stale
  artifact left in the repo.

**(b) Is it structured?** — **Yes, genuinely.** Clean layer separation:
`pipeline/` (data) → `scoring/` (model + rules) → `agent/` (policy + audit) → `eval/` → `demo.py` →
`scripts/` (one-off analyses). Packages have `__init__.py`. Files are 30-320 lines. The
`RiskScorer.save/load` roundtrip (`model.py:217-236`) correctly rebuilds the SHAP explainer on load.
`FEATURE_COLS` is duplicated verbatim in `feature_builder.py:231-249` and `model.py:48-66` — a real
drift hazard, and the pipeline's copy is **dead code** (assigned, never used or persisted). Also the
comments miscount it (docstring says 28, the group comments sum to 29, the list has 30).

**(c) Deliberate non-use of AI?** — **Yes, best-in-corpus.** See §2. A four-row justification table
plus three documented descoping decisions with supporting numbers, backed by runnable scripts
(`scripts/repeat_customer_analysis.py`, `scripts/r5_signal_validation.py`).

**(d) Real failure handling?** — **Partly real, partly staged.**
- *Real:* `CARRIER_FAILURE_ESCALATION_POLICY` (`decision_engine.py:60-65`) is a genuine domain
  override — if the complaint was filed >5 days past the promised date, no automated action is taken
  regardless of score, and the case is escalated with a named reason. That is the correct instinct
  and it is the **first** branch in the ladder, so it wins over AUTO_DENY. Good design.
- *Real:* the leakage-fix narrative in the README, with numbers going down.
- *Staged:* the "Surfaced Real Failure Case" is a **hand-transcribed** dict (`demo.py:88-123`), not a
  row read from `test.parquet`. Its committed audit records show the score drifting **0.9923 → 0.9923
  → 0.5634 → 0.5634** across commits as the author edited the hand-entered numbers. And it sets
  `"is_pre_delivery_complaint": True` (`demo.py:122`) on a case whose stated ground truth is
  `is_anomaly = 0` — internally contradictory, and it makes HF-1 fire CRITICAL on a legitimate order.
- *Absent:* no `try/except` anywhere in `scoring/`, `agent/`, or `eval/`. `_prepare_features`
  (`model.py:84`) silently `fillna(0.0)`s anything unparseable — a bad field becomes a confident
  low-risk score with no warning. No timeout, no retry, no model-staleness check, no schema validation
  on the incoming event dict.

---

## 4. Audit trail / bounded actions / stopping rules / defense-only

| Demand | Status | Evidence |
|---|---|---|
| **Audit trail** | **REAL, in code.** Append-only JSONL, one record per decision, containing event_id, order_id, timestamp, full ML output, all SHAP attributions, all heuristic flags, action, policy rule applied, escalation reason, and `audit_metadata` naming the model version and the label proxy. | `agent/audit_logger.py:23-34`; `decision_engine.py:103-127`; `logs/audit_trail.jsonl` (20 records after my run, was 15) |
| **Bounded actions** | **REAL but under-bounded.** Exactly three actions, enumerated in one place (`AUTO_APPROVE` / `FLAG_FOR_REVIEW` / `AUTO_DENY`), unreachable-branch-safe (the `else` at :84 defaults to review). But no rate limit, no daily deny cap, no value ceiling on auto-deny, no reversal path. A high-value order and a R$20 order take the same path. | `decision_engine.py:55-86` |
| **Stopping rules** | **REAL.** Two independent circuit-breakers that both halt automation: carrier-delay override (:60) and `confidence == "LOW"` → human (:78). Unlike Saxena's, these are *consumed* — they change the action. | `decision_engine.py:60-65, 78-83` |
| **Defense-only** | **Compliant.** Passive scoring only; nothing writes to a payment system; no threshold-probing or attack-simulation surface. `.gitignore` explicitly excludes `kaggle.json`, `*.key`, `*.token`, `.env*`. No secrets found in the tree. | `.gitignore`; full-tree read |
| **Money-safety** | Undermined by §1(d): the actions are well-gated but the signal they gate on is carrier lateness. | — |

**Audit-log honesty bonus:** because the log is genuinely append-only and committed, it *records the
author's own regressions*. The committed trail shows an earlier run where Case 1 — labelled
"Standard Legitimate Return (Clean Order Profile)" — scored **0.908 and was AUTO_DENIED**. That is
what the final commit message ("Fix demo Case 1 timing data") was fixing. An append-only log that
preserves evidence against its owner is working as designed, and I credit it.

**Audit-log finding that is not a bonus:** across every committed run, **Case 2 — the flagship
"High-Risk Pre-Delivery Timing Anomaly (Abuse Pattern)" — scores 0.0483 / 0.0747.** Effectively zero
risk. The ML model **completely fails to detect the demo's own designed abuse case**, and it is caught
only by HF-1, which fired because `demo.py:172` hardcodes `"is_pre_delivery_complaint": True`.
**AUTO_DENY never fires on the intended abuse case in any committed run.**

---

## 5. The single best engineering idea worth independently reimplementing

### **Adversarial proxy-label validation with a control cohort, run BEFORE any modelling.**

`scripts/r5_signal_validation.py` (184 lines) — and the README §3 "Label Correction Discovery" that
reports its output.

The method: the author proposed a labelling rule (`review_date < estimated_delivery_date`), then —
before training anything — asked *"is this measuring the construct I named, or an artifact?"* and
answered it with a **control group**: run the same rule against 4–5★ reviews, which by construction
contain no abuse. Result: the rule fired on 60.8% of 1★ **and 94.6% of 4–5★** — it was measuring
Olist's delivery-estimate padding, not buyer behaviour. The rule was replaced with a strict version
(`review_date < actual_delivered_date`), re-validated (37.6% of 1★ vs 4.5% of 4–5★ → **8.4× lift**),
and locked in.

**Why this is the best idea in the corpus:** proxy labels are the default condition in payments risk —
you almost never have adjudicated fraud labels, so you build on chargeback flags, dispute filings,
manual-review outcomes. Every such proxy is a hypothesis. This is a cheap, general, and *falsifying*
test of that hypothesis: **apply your candidate label rule to a cohort that cannot contain the
phenomenon; if the rule fires at a similar rate there, it is measuring an artifact.** A single ratio
kills a bad label before you spend a week on features.

- **Type:** `EVALUATION_PATTERN` (with a `DATA_PATTERN` sibling)
- **Source:** `scripts/r5_signal_validation.py:1-12, 47-77, 160-184`; README §3
- **Razorpay applicability:** Direct hit on Tracks 02, 03 and 04. Any repo whose label is
  "chargeback filed" / "dispute raised" / "flagged by ops" needs exactly this before it reports a
  precision number.
- **How to independently reimplement:** (1) State the label rule. (2) Identify a cohort where the
  target phenomenon is definitionally absent. (3) Compute rule-fire-rate in target cohort ÷ control
  cohort. (4) Publish the ratio next to the label definition; refuse to proceed below ~3×.
  (5) **Extend it further than this repo did** — also regress the label on each individual feature
  and publish the best single-feature AUC as your floor (see §6).
- **Risks:** a clean control ratio is necessary but **not sufficient** — this repo passed its own test
  at 8.4× and still shipped a tautology, because the artifact moved from the *estimate* timestamp to
  the *survey-scheduling* timestamp. The pattern must be paired with the single-feature-baseline check.
- **Score:** **8/10**

### Runner-up: **SHAP attributions written into the append-only audit record**
`decision_engine.py:115-118` + `audit_logger.py:31-32`. Every automated money decision carries its
own top-3 mathematical attributions, in plain English, in a durable log line, alongside the model
version and the label proxy it was trained on. That is precisely *"every money action explainable,
bounded and gated… show the audit trail."*
Type `COMPONENT_PATTERN`, score **7/10**.

### Runner-up: **Cost-matrix policy comparison against an explicit do-nothing baseline**
`eval/evaluate.py:32-135`. Score **7/10** as a *shape*; **4/10** as executed here (test-set-tuned
threshold, strawman rule baseline, evaluates the scorer rather than the agent).

---

## 6. The weakest thing — where a Razorpay engineer pokes a hole in 30 seconds

**They read the README's own "Known Limitations" — which admits
`days_to_estimated_at_complaint` dominates with SHAP magnitudes of ±3–7 versus <1 for everything else
— and then look at the "Simple Heuristic Baseline" row in the policy table: precision 0.003.**

That is the hole. If one feature dominates that completely, the honest baseline is *that feature,
thresholded*. Instead the repo's rule baseline is `is_high_risk_category == 1 AND
days_to_estimated_at_complaint > 0` (`eval/evaluate.py:75`) — a two-condition rule using the *wrong
sign* on the dominant feature, gated by a category filter that discards most positives. It scores
0.003 precision and −103.7% cost reduction. **It is a strawman that makes the ML look indispensable.**

Run the real baseline and the model loses:

```
days_to_estimated_at_complaint <= 2   →  ROC-AUC 0.9435  P 0.498  R 0.877  saves $58,705
LightGBM + TreeSHAP (P >= 0.66)       →  ROC-AUC 0.8615  P 0.481  R 0.765  saves $50,250
```

**A one-line rule beats the entire ML stack by $8,455 (17%) on the author's own cost model and own
test set.** The follow-up question — *"so what does the model add?"* — has no good answer, and the
answer it does have (§1(d): the model's 0.481 precision is exactly the 0.426 base rate of 1★ among
late deliveries) makes it worse: the system is a late-delivery detector wearing a fraud label.

Second poke, ~10 seconds later: `eval/evaluate.py:109-122` tunes the threshold on `y_test` and
reports precision at that threshold, with no validation split in the repo.

Third: `scoring/heuristics.py:45` reads `is_anomaly` — the label — as a decision input, and
`decision_engine.py:66` gates AUTO_DENY on it.

---

## 7. Every overclaim — README says X, code shows Y

| # | README / docstring claims | Code shows | Evidence |
|---|---|---|---|
| 1 | *"calibrated confidence bands"*, *"Probability Calibration (Isotonic Regression) for true Bayesian risk estimates"*, output field `calibrated_probability` | **No calibration is performed.** `CalibratedClassifierCV` is imported and never called; `self.calibrator = None` and is never assigned; `calibrated_probability` is `round(prob,4)` — byte-identical to `risk_score`. Worse, `scale_pos_weight ≈ 26` **guarantees** the probabilities are mis-calibrated upward. | `model.py:6` (docstring), `model.py:17` (unused import), `model.py:72`, `model.py:105`, `model.py:209` vs `211` |
| 2 | *"Simple Heuristic Baseline"* represents what rules can achieve (P=0.003) | The real single-feature rule achieves **P=0.498, R=0.877, $58,705 saved** — beating the ML model. The chosen baseline uses the wrong sign on the dominant feature and adds a category filter. | `eval/evaluate.py:75`; reproduced in §6 |
| 3 | *"**$50,250** net savings"* / *"48.1% precision"* as production numbers | Threshold selected by sweeping against `y_test` and reported on `y_test`. No validation split exists. Un-tuned value is 0.464 / $49,365. | `eval/evaluate.py:109-135`; `model.py:87` (`val_df` never used) |
| 4 | *"Layer 2: Heuristic Flags (Deterministic Rules) HF-1..HF-5"*, equal billing in the architecture diagram | HF-1 reads the **label** `is_anomaly`; HF-2 and HF-5 require `order_status == "canceled"` but the universe is `delivered`-only (structurally unreachable); HF-4 requires ≥3 prior orders against the author's own 96.88%-single-order finding. One of five rules is genuinely operational. | `heuristics.py:45, 58, 77, 86`; `feature_builder.py:73` |
| 5 | AUTO_DENY = *"Score ≥ 0.65 & Corroborated Flag"* — presented as ML+rule corroboration | The "corroborating flag" is HF-1, i.e. the ground-truth label. In the demo it fires because `demo.py:172, 122` hardcodes `is_pre_delivery_complaint: True`. | `decision_engine.py:66`; `heuristics.py:45`; `demo.py:172, 122` |
| 6 | Case 2 is the *"High-Risk Pre-Delivery Timing Anomaly (Abuse Pattern)"* demonstration | The ML model scores it **0.0483 / 0.0747** in every committed run — near-zero risk. It never reaches AUTO_DENY; it exits via `RULE_ML_DISCREPANCY_POLICY`. The model fails the demo's own abuse case. | `logs/audit_trail.jsonl` (all committed runs) |
| 7 | *"Surfaced Real Failure Case… Exact real record from held-out test split"* | A **hand-transcribed** dict, not read from `test.parquet`. Its committed score drifts 0.9923 → 0.5634 across commits as the author edited the numbers. It also sets `is_pre_delivery_complaint: True` on a case whose stated ground truth is `is_anomaly = 0`. | `demo.py:83-123`, esp. `:122`; `logs/audit_trail.jsonl` |
| 8 | The script that found the failure case | `scripts/find_real_failure_case.py:16` filters on `actual_delivery_days` / `delivery_early_days` — **columns removed by the leakage fix and absent from `test.parquet`**. The script raises `KeyError`. | verified against committed parquet schema (45 cols, neither present) |
| 9 | *"strictly point-in-time"*, *"zero lookahead leakage"* | Feature construction is point-in-time — genuinely. But the **split is random with full temporal overlap** (train 2016-10→2018-08, test 2016-09→2018-08), which the README never discloses; and `seller_avg_review_score` is computed over **all** reviews including the scored order's own — and `review_score == 1` is half the label. | `feature_builder.py:214-219, 199-202`; parquet date ranges |
| 10 | *"29 leak-free features"* / docstring *"28 features"* / group comments summing to 29 | The list contains **30**. Also `feature_cols` in `feature_builder.py` is **dead** — assigned, never used, never persisted; the real list is a **verbatim duplicate** in `model.py:48-66`. | `feature_builder.py:230-249`; `model.py:48-66` |
| 11 | *"verified low-latency inference (~41.8ms end-to-end including exact TreeSHAP)"* | No benchmark, timer, or profiling code exists anywhere in the repository. Unreproducible assertion. | full-tree grep for timing instrumentation |
| 12 | *"PR-AUC 0.4590 — **12.5×** lift"* (README) vs *"**14.6×** lift"* (`evaluate.py:143,157` and the generated report) | Two different multipliers for the same number in the same submission. 0.4590/0.0368 = 12.47×, so the README is right and the **code prints the wrong figure** — and the code's figure is a hardcoded string, not computed. | README §2 vs `eval/evaluate.py:143, 157` |
| 13 | *"~1-in-3 positive labels represent legitimate customer frustration"* (stated ceiling) | Understated. **The entire discriminative signal is carrier lateness.** Among test orders with `review < delivery`, only 706/1656 (42.6%) are 1★ — and the model's precision is 0.481, i.e. the base rate. Beyond "was it late", the model contributes ~nothing. | reproduced in §1(d) |
| 14 | *"Production-structured"* | CLI + parquet only. No service, no API, no container, no tests directory, no CI, unpinned `>=` deps, and no `try/except` in any of `scoring/`, `agent/`, `eval/`. | `requirements.txt`; full-tree read |

---

## Candidate Patterns

### P1 — Adversarial proxy-label validation with a control cohort
`EVALUATION_PATTERN` · `scripts/r5_signal_validation.py`, README §3 · **8/10** · **SELECTED** (see §5)

### P2 — SHAP attributions embedded in an append-only decision audit record
`COMPONENT_PATTERN` · `model.py:172-206`, `decision_engine.py:103-127`, `audit_logger.py:23-34` · **7/10** · **SELECTED**
Reimplement: make the audit record the *only* return type of the decision function, so an
unexplained decision is structurally impossible. Include `model_version` and `label_proxy` in every
record (`decision_engine.py:119-123`) — cheap, and it makes a stale model detectable from the log
alone. Risk: SHAP adds real latency per call; batch or cache for high QPS.

### P3 — Cost-matrix policy ladder against an explicit do-nothing baseline
`EVALUATION_PATTERN` · `eval/evaluate.py:32-135` · **7/10 as shape, 4/10 as executed** · **SELECTED WITH FIXES**
Take the shape; fix three things this repo got wrong: (i) tune the threshold on a **validation**
split and report on test; (ii) make the rule baseline the **best single feature**, not a strawman;
(iii) price the review queue — `FLAG_FOR_REVIEW` has a real per-case cost and here it is free.

### P4 — Domain-override circuit-breaker ahead of the score ladder
`FAILURE_HANDLING_PATTERN` · `decision_engine.py:60-65` · **6/10** · **SELECTED**
"If the merchant's own carrier was ≥5 days late, no automated denial regardless of score." A
first-position override that can only *reduce* autonomy. Cheap, legible, auditable, and the right
instinct for money systems. Reimplement as a list of named veto predicates evaluated before the
score bands, each writing its own `policy_rule_applied` string to the audit record.

### P5 — REJECTED: the LightGBM scorer itself
`MODEL_PATTERN` · Rejected because a single thresholded feature beats it on ROC-AUC, precision,
recall and dollars, on its own test set and its own cost model. Reusing it would import a
late-delivery detector labelled as fraud detection.

### P6 — REJECTED: the HF-1..HF-5 "Heuristic Flags Panel"
`COMPONENT_PATTERN` · Rejected: HF-1 reads the label, HF-2/HF-5 are structurally unreachable, HF-4 is
near-unreachable. The *architecture* (rules surfaced side-by-side with ML, never blended into the
score — `heuristics.py:6-7`) is a good idea worth keeping. The *rules* are not.

### P7 — REJECTED: the confidence-band scheme
`COMPONENT_PATTERN` · `model.py:154-169`. Bands are hardcoded cuts on an **uncalibrated**,
`scale_pos_weight`-inflated probability, so `confidence_level == "HIGH"` does not mean the model is
more often right. Reusing it would propagate false assurance into `decision_engine.py:70`, where
`confidence == "HIGH"` is a precondition for **AUTO_DENY**.

---

## Selected Patterns
**P1** (proxy-label control-cohort validation — the headline takeaway) · **P2** (SHAP-in-audit-record) ·
**P3** (cost-matrix policy ladder, with the three fixes) · **P4** (domain-override circuit-breaker).

## Rejected Patterns
**P5** the model · **P6** the heuristic rules · **P7** the confidence bands · the demo harness ·
`scripts/find_real_failure_case.py` (broken) · the "calibration" claim (does not exist).

---

## Overall Scores

| Dimension | Score | Justification |
|---|---|---|
| **Idea** | 6/10 | Complaint-timing abuse is a genuine, bounded, Track-02-appropriate loss vector, but the chosen operationalisation turns out to detect carrier lateness rather than buyer behaviour. |
| **Solution** | 4/10 | It solves the measurement problem impeccably and the detection problem not at all — a one-line rule saves $8,455 more on the author's own numbers. |
| **Architecture** | 7/10 | Genuinely clean four-layer separation with an append-only audit trail, bounded actions and real stopping rules; docked for duplicated feature lists, dead code, and rule layers that cannot fire. |
| **AI usage** | 4/10 | Best-in-corpus *argument* for where not to use an LLM, and TreeSHAP is truly load-bearing — but the ML itself is measurably worse than the `for` loop and regex the rubric asks you to consider. |
| **Razorpay relevance** | 7/10 | Cost matrix, FP pricing, audit trail, escalation policy and an explicit deliberate-non-use table hit four of the bar's demands directly; the underlying detector would not survive a production review. |
| **Engineering quality** | 6/10 | Reproduces byte-for-byte from a clean clone and runs end-to-end — but unpinned deps, zero `try/except` in the core path, silent `fillna(0.0)`, a broken script, and a label read as a decision input. |
| **Demonstrability** | 7/10 | `demo.py` runs, prints real SHAP attributions and writes real audit records — undercut by the fact that its flagship abuse case scores 0.05 and is caught only by a hardcoded flag. |

---

## Final AgentArch Verdict

**The most honest measurement apparatus in the corpus, pointed at a tautology:** every README number
regenerates byte-identically from committed code, the cost matrix and audit trail are real, and the
author volunteered a leakage fix that made their own numbers worse — yet the label is a near-artifact
of Olist's review-survey scheduler, and `days_to_estimated_at_complaint <= 2` beats the entire
LightGBM + TreeSHAP stack on ROC-AUC, precision, recall and dollars saved.

**Selection: `EVALUATION_PATTERN` + `DATA_PATTERN`** — take P1, P2, P3, P4; leave the model.

---

### Calibration notes for our own build
1. **The bar is lower than expected on rigour and higher than expected on skepticism.** Reproducible
   metrics + a cost matrix + an audit trail already puts a repo in the top decile. But a reviewer who
   knows the domain will still kill it in 30 seconds with a one-line baseline.
2. **Always publish your best single-feature baseline.** It is five lines. This repo would have
   survived far better having *reported* that a threshold beats its model — as a finding — than
   having a reviewer discover it.
3. **Never let a label column travel inside the event payload.** `heuristics.py:45` is what happens
   when the scored object and the training row are the same dict.
4. **Evaluate the agent, not the scorer.** The policy table here measures a threshold classifier;
   the shipped system has three actions and different thresholds. Price the human-review queue.
5. **The control-cohort label test (P1) is the single most transferable idea found. Use it — and pair
   it with the single-feature-AUC check, because this repo passed P1 at 8.4× and still shipped a
   tautology.**
