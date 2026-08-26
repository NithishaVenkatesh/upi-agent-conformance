# AgentArch — Sivanandinisaravanakumar/rto-risk-agent

| Field | Value |
|---|---|
| Repository | `Sivanandinisaravanakumar/rto-risk-agent` |
| Local path | `/tmp/rzp_scratch/Sivanandinisaravanakumar_rto-risk-agent` |
| Competition | Razorpay AI Buildathon — Track 02, AI Risk Manager (direction: return-risk scorer) |
| Placement | UNDETERMINED — submission only; no placement signal in repo or git history |
| Size | 1,126 LOC Python across 5 files; 11 commits, all authored via GitHub web UI ("Add files via upload") |
| Verdict class | `EVALUATION_PATTERN` (partial) + `IDEA_ONLY` — the honest-cost-table idea survives; the measurement does not |

---

## Original Problem (as stated)

Indian D2C merchants lose money to RTO (return-to-origin) — COD orders refused at
the doorstep. There is no pre-dispatch flag/explain/intervene loop. `README.md:32-42`.
The framing is genuinely good and the scope note (`README.md:16-25`, explicitly
excluding post-delivery returns because a pre-dispatch agent cannot act on them) is
the single sharpest piece of thinking in the repo.

## Original Solution (as claimed)

Feature builder → RandomForest/XGBoost → SHAP explain → risk-band decision policy →
bounded action (proceed / SMS / prepaid nudge / escalate) → append-only audit log.
`README.md:46-73`.

---

## Actual Architecture (from code)

**Batch scripts, not a service.** There is no API, no queue, no async, no DB, no
auth, no network I/O of any kind. Verified by grep: the only `http` string in the
repo is a Google Fonts `@import` in the Streamlit CSS (`dashboard.py:22`). There
is **zero LLM, zero external API, zero secret**.

| Stage | File:line | What actually happens |
|---|---|---|
| Data | `generate_dataset.py:51-120` | 8,000 rows generated from a hand-written risk formula (see Circularity below). No real data anywhere. |
| Train v1 | `train_model.py:109-153` | `train_test_split(test_size=0.2, random_state=42, stratify=y)`; sklearn `Pipeline(ColumnTransformer → RandomForestClassifier(n_estimators=300, max_depth=6, min_samples_leaf=25))`. |
| Train v2 | `train_model_v2.py:125-186` | 5-fold `StratifiedKFold` CV across LogReg / RF / XGB, then a *separate* single split for threshold + SHAP. Saves `return_risk_model.pkl`, `operating_threshold.pkl`, `shap_explainer.pkl`. |
| Explain | `agent.py:50-83` (SHAP) / `agent.py:86-107` (rules) | SHAP `TreeExplainer` on transformed features, one-hot-aware filtering (`agent.py:72-75`) — genuinely correct. Falls back to a hand-written `if` ladder. |
| Decide | `agent.py:110-146` | Pure deterministic policy: band from `RISK_BAND_THRESHOLDS = {"high": 0.38, "medium": 0.28}` (`agent.py:39`), plus a hard `order_value > 3000 → escalate` gate. |
| Audit | `agent.py:177-179` | `open(AUDIT_LOG_PATH, "a")` + one JSON line per decision. 45 real lines committed. |
| UI | `dashboard.py` (418 lines, ~150 of them inline CSS/SVG) | Streamlit; 4 tabs. |

**Communication:** all in-process function calls. **State:** two pickles and a
JSONL file on local disk. **AuthN/AuthZ:** none. **Validation:** none — `score_order`
accepts any dict; missing keys silently become `.get(k, 0)` defaults
(`agent.py:151-152`, `agent.py:169-174`).

---

## 1. IS THE MEASUREMENT REAL OR THEATRE?

**Verdict: half-real. The numbers reproduce exactly, but the threshold that
produces them was fitted on the test set, and the threshold is not the one the
shipped agent uses.**

### (a) Train/test split — random, not temporal
`train_model.py:114-116` — plain stratified random split. The dataset has an
`hour_of_order` column but no date, so a temporal split is impossible by
construction (`generate_dataset.py:80`). For an RTO model, where population drift
and seasonality are the whole game, a random split is the wrong split. Not
disqualifying for synthetic data, but it means nothing has been demonstrated about
generalisation over time.

### (b) LEAKAGE — YES, confirmed. Threshold selected on the test set.
`train_model.py:121` computes `y_proba` on `X_test`. Lines 131-139 sweep 10
thresholds **against `y_test`**. Line 146 picks `best_threshold = max(rows, key=F1)`.
Line 149-150 then re-scores `y_test` at that threshold and prints those numbers as
"Held-out test set metrics" (`train_model.py:68`).

There is no validation split. The single hyperparameter the agent actually operates
on — the decision threshold — is chosen by maximising F1 on the same 1,600 rows the
precision/recall are reported from. `train_model_v2.py:145-152` repeats the identical
pattern. The optimism here is small in absolute terms (one scalar over a smooth
1,600-row curve), but it is exactly the mistake Track 02's "held-out test set"
clause exists to prevent, and the README does not disclose it.

A second, larger leak sits in the UI. `dashboard.py:377-388` — the Policy Simulator
scores `X_all = df[...]` , i.e. **all 8,000 rows including the 6,400 the model
trained on**, and renders the resulting precision/recall/cost as headline metrics
(`dashboard.py:392-395`). The code comment at `dashboard.py:374-376` admits this
("illustrative, not a true held-out re-evaluation") — but nothing in the UI tells the
viewer, and this is the tab a demo would linger on.

### (c) README numbers reproducible? — YES. Verified by execution.
Ran `python3 train_model.py` on a clean copy (sklearn 1.7.2):

```
Precision 0.32 | Recall 0.71 | F1 0.44 | ROC-AUC 0.617
TN 582 | FP 611 | FN 119 | TP 288
```

README table (`README.md:118-123`) claims 0.32 / 0.71 / 0.44 / 0.62. **Exact match.**
This is real and should be credited — `random_state=42` is set in both the generator
(`generate_dataset.py:16`) and the split, the CSV is committed, and the numbers fall
out of a script. Most repos in this corpus cannot say that.

### (d) CIRCULAR LABELS — YES, but with an unusually honest twist.

Read side by side:

- **Generator** `generate_dataset.py:86-99`: `risk = 0.05 + pincode_risk*0.5 +
  (category_mult-1)*0.06 + (0.10 if COD else -0.03) + past_return_rate*0.35 + ... `
  then `risk = clip(risk + N(0, 0.06))`, then `returned = 1 if U(0,1) < risk`.
- **Model** `train_model.py:29-34`: consumes those same 12 fields.

The label is a monotone function of exactly the features handed to the model. The
model is recovering the generator's own formula. Nothing about real RTO behaviour is
being learned, and the "ML" adds nothing a hand-written logistic scorecard would not.

**However** — and this is the twist that separates this repo from the usual
self-fulfilling-prophecy build — the label is drawn *stochastically* from `risk`
(`generate_dataset.py:99`), not thresholded. Mean risk is ~25%, so Bernoulli sampling
imposes a hard Bayes ceiling. That is why ROC-AUC is 0.62 rather than 0.99. The
author states this intent explicitly at `generate_dataset.py:10` ("Noise is injected
so accuracy won't be unrealistically perfect") and again at `README.md:136-138`
("These numbers are honest, not impressive"). Deliberately capping your own headline
metric is a rare and creditable act of taste.

The circularity is still fatal to the *scientific* claim (the model has never seen a
real return) but the author did not use it to manufacture a fake 0.95.

### (e) The finding the author surfaced and should have led with
`train_model.py:141-145` + `README.md:125-134`: under the stated cost model
(FP ≈ ₹450 lost sale, FN ≈ ₹180 RTO cost), **pure cost minimisation says never flag
anything.** The author reports this instead of burying it. Reproduced above: total
cost at the chosen operating point is ₹296,370, of which ₹274,950 is false positives.
The agent as configured *destroys* ~₹275k of value on 1,600 orders to save ~₹21k.
Naming that out loud is a direct hit on Track 02's "honest metrics including
false-positive cost" clause, and it is the best thing in this repo.

---

## 2. IS THE AI LOAD-BEARING OR DECORATIVE?

**There is no LLM. Confirmed by grep across all files:** zero matches for `openai`,
`anthropic`, `gemini`, `groq`, `ollama`, `langchain`, `api_key`, or any HTTP client.
The only hits for `transformers` are `ColumnTransformer` (`train_model.py:43`).

So the question becomes: is the *ML* load-bearing?

**Partly — and less than claimed.** The RandomForest produces a probability that a
deterministic ladder (`agent.py:42-47`) immediately collapses into three buckets.
The action policy (`agent.py:110-146`) is pure `if/elif`. So the model's entire
contribution is choosing which of three bands an order lands in.

Would a for-loop do it? **On this dataset, yes, provably** — the generator's risk
formula is a weighted linear sum, so a 12-term scorecard reproduces the model to
within noise. The author's own `train_model_v2.py:96` output shows LogReg, RF and XGB
land within 0.02 AUC of each other, which is the tell.

**Where the ML earns its place:** the SHAP layer (`agent.py:50-83`) is the one part
a rule engine cannot replicate. The one-hot suppression at `agent.py:72-75` — only
showing the categorical column that is actually `1`, so a single order doesn't get
explained by both "COD" and "Prepaid" — is a real, non-obvious correctness fix. That
is the transferable code in this repo.

**Deliberate non-use of AI:** there is no LLM, and the decision policy is
deliberately deterministic. But **there is no written statement anywhere that this
was a choice.** `README.md:169-174` ("What I'd build next") never mentions it. Under
the rubric's most discriminating clause — *"and where you chose not to use one"* —
this repo has the right architecture and forfeits the credit for it by never saying
so. That is a 20-line table left on the table.

---

## 3. FOUR PILLARS

### (a) Does it run?
**Following the README's own instructions: NO. It crashes.**

`README.md:147` says:
```bash
pip install pandas scikit-learn streamlit joblib
```
That omits `shap` and `xgboost`. `agent.py:27-33`:
```python
try:
    _shap_explainer = joblib.load(SHAP_EXPLAINER_PATH)
    ...
except FileNotFoundError:
```
The committed `shap_explainer.pkl` unpickles a `shap` class. With `shap` absent this
raises **`ModuleNotFoundError`**, which `except FileNotFoundError` does not catch.
Reproduced on a clean environment:

```
File "agent.py", line 28, in <module>
    _shap_explainer = joblib.load(SHAP_EXPLAINER_PATH)
ModuleNotFoundError: No module named 'shap'
```

This kills `agent.py` **at import time**, and therefore also kills `dashboard.py`,
which does `from agent import score_order` at `dashboard.py:15`. A reviewer who
copy-pastes the README's install line sees a stack trace on the first command they
run after training. `requirements.txt` does list `shap` and `xgboost`, so the repo is
one README line away from working — but "does it run" is a graded gate and this fails
it on the documented path.

The fix is `except (FileNotFoundError, ModuleNotFoundError, Exception)`. The author
already wrote exactly that defensive pattern 130 lines later at `agent.py:157`
(`except Exception`), which makes the omission a genuine slip rather than ignorance.

- **Deps pinned:** NO. `requirements.txt` has seven bare package names, no versions.
- **Model artifact committed:** YES — `return_risk_model.pkl`, `shap_explainer.pkl`,
  `shap_feature_names.pkl`, `operating_threshold.pkl` all present. Verified loadable:
  the pipeline's classifier is `RandomForestClassifier`; `operating_threshold.pkl`
  deserialises to `0.25`. No retrain needed.
- **Seed data:** YES — `orders_dataset.csv` (8,000 rows) committed, plus 45 real
  audit-log lines.

### (b) Structured?
Adequate, with one bad file. Generator / trainer / decision layer / UI are cleanly
separated, and `agent.py` is properly importable-and-testable (pure functions taking
a dict). But `dashboard.py` is 418 lines of which roughly 150 are inline `<style>`
and hand-written SVG path data (`dashboard.py:20-87`, `107-134`, `162-165`,
`313-335`), and it re-implements the threshold sweep a third time
(`dashboard.py:401-415`, after `train_model.py:131` and `train_model_v2.py:113`).
Three copies of the same loop with three different threshold ranges (0.15-0.65,
0.15-0.65, 0.10-0.65).

Two live training scripts (`train_model.py`, `train_model_v2.py`) with no statement
of which one produced the committed artifact, and a README that documents only the
v1 script (`README.md:150`) while the committed pickles came from v2 (they include
`shap_explainer.pkl`, which only v2 writes, at `train_model_v2.py:167`).

### (c) Deliberate non-use of AI
**Present in the architecture, absent from the writeup.** See §2. Score forfeited.

### (d) Real failure handling
Four `try/except` blocks total, all narrow:
- `agent.py:27-33` — the one that is wrong (see above).
- `agent.py:155-158` — `except Exception` → fall back from SHAP to rule-based
  reasons. This one is good: a graceful degradation path that preserves the
  explanation contract.
- `dashboard.py:181-184`, `dashboard.py:342-353` — missing audit log → empty state.

What is missing: no input validation on `score_order` (an order dict missing
`pincode_tier` will reach `pipe.predict_proba` and throw a sklearn error into the
Streamlit UI), no schema check, no handling of a corrupt audit-log line
(`dashboard.py:344` `json.loads` on every line — one malformed line breaks the whole
Decision Log tab), no rate limiting, no retry. **Zero tests. No test file, no
assert, no CI.**

---

## 4. AUDIT TRAIL / BOUNDED ACTIONS / STOPPING RULES / DEFENSE-ONLY

| Claim | Status | Evidence |
|---|---|---|
| Audit trail | **REAL** | `agent.py:177-179` writes 11 structured fields per decision to JSONL, unconditionally, before returning. 45 real lines committed. |
| "Append-only" / "immutable" (`dashboard.py:333`) | **OVERCLAIM** | It is `open(path, "a")` on a local file. No hash chain, no signature, no WORM store, no sequence number. Any process can truncate it. |
| Bounded actions | **REAL** | `agent.py:130-133`: `order_value > 3000` forces `action_type="escalate"` and `requires_human_approval=True`. The agent's whole action space is four strings; none of them mutate anything. |
| Defense-only | **COMPLIANT** | Nothing in the repo can cancel, block, charge, or message. The "SMS" and "prepaid nudge" are string labels. Genuinely offense-incapable. |
| Stopping rules | **README-ONLY** | `agent.py:37-38`: `MAX_AUTO_BLOCKS_PER_CUSTOMER_DAY = 1` with the inline comment `# (not fully enforced in this demo, documented as a guardrail for production)`. The constant is defined and **never read**. Grep confirms zero other references. Credit for labelling it honestly in a comment; it is still a guardrail that does not exist. |

**Additional guardrail defect:** `agent.py:174` —
`"confidence": round(abs(prob - 0.5) * 2, 2)`. For a model whose entire useful output
range is 0.10-0.50, this metric is worse than useless: it is *minimised* at the
riskiest orders. The committed audit log proves it — line 1 records
`return_probability: 0.4825, risk_band: "High", confidence: 0.03`. The dashboard
renders this as **"Model Confidence: 3%"** next to a High Risk escalation
(`dashboard.py:281`). A reviewer who opens the audit log sees the agent's single
highest-risk decision labelled 3% confident. The code comment calls it a "crude
distance-from-uncertain proxy" — it is not a proxy for anything; it is an artifact
of a threshold that is nowhere near 0.5.

---

## 5. THE SINGLE BEST ENGINEERING IDEA

**`EVALUATION_PATTERN` — the cost-weighted threshold table that is allowed to
return an inconvenient answer.**

Source: `train_model.py:126-147`, surfaced at `README.md:125-134`.

Not the sweep itself (trivial), but the discipline around it: state FP and FN costs
as named constants (`train_model.py:26-27`), print rupees alongside precision/recall
at every threshold, then **report that cost-minimisation says "never flag" and
refuse to hide it** — while separately justifying why a different operating point was
chosen anyway (`train_model.py:141-145`).

Most risk demos pick the threshold that flatters the F1 and never compute what the
false positives cost in money. This one computes it, finds the answer embarrassing,
and prints it. That is precisely the "honest metrics including false-positive cost"
behaviour Track 02 asks for, and it generalises to any money-touching classifier.

**How to independently reimplement:** two constants, one loop over thresholds, a
confusion matrix per threshold, a rupee column, and a written paragraph naming the
threshold your own cost model prefers *and* the threshold you actually shipped, with
the reason for the gap. ~30 lines.

**How to do it better than this repo did:** select the threshold on a *validation*
split, report on test; and then make the shipped agent actually use the selected
number.

---

## 6. THE WEAKEST THING — the 30-second hole

**The reported metrics do not describe the shipped agent, and it takes two file-opens
to see it.**

- README headline (`README.md:116`): *"operating threshold 0.25"*, precision 0.32,
  recall 0.71.
- `train_model_v2.py:156` dumps `operating_threshold.pkl` = 0.25. Verified.
- **Nothing loads it.** Grep for `operating_threshold` returns exactly one hit in the
  entire repo — the line that writes it.
- The agent's real thresholds are `agent.py:39`:
  `RISK_BAND_THRESHOLDS = {"high": 0.38, "medium": 0.28}`.

So the precision and recall on the front page are measured at 0.25, and the agent
ships at 0.28/0.38. Nobody has measured precision or recall at the thresholds the
agent actually uses. And a third set of bands (0.45 / 0.22) exists in a dead function
at `train_model.py:88-93`.

A Razorpay reviewer asks one question — *"what is the precision of the band the agent
actually escalates on?"* — and there is no answer in the repo.

Runner-up: the `ModuleNotFoundError` on the documented install path (§3a), which is
worse in a live demo but easier to forgive.

---

## 7. EVERY OVERCLAIM — README says X, code shows Y

| # | README / UI says | Code shows | Severity |
|---|---|---|---|
| 1 | "Held-out test set (20% split), operating threshold 0.25" → P 0.32 / R 0.71 (`README.md:116-123`) | Threshold chosen by maximising F1 **on that same test set** (`train_model.py:131-149`). No validation split exists. | **HIGH** — this is the exact clause the track grades. |
| 2 | "operating threshold 0.25" | Agent operates at 0.28 / 0.38 (`agent.py:39`); `operating_threshold.pkl` is written and never read. | **HIGH** |
| 3 | "**autonomous agent**" (`README.md:3`, `dashboard.py:128`) | Three hardcoded dicts in a `for` loop (`agent.py:187-210`) plus a Streamlit form. No loop, no tool use, no planning, no state, no trigger. | **HIGH** |
| 4 | "Every decision is still written to an **immutable** audit log" (`dashboard.py:333`); "append-only" (`README.md:104`) | `open(path, "a")` on local disk. No integrity mechanism. | **MEDIUM** |
| 5 | Guardrail: agent "never auto-blocks a high-value order alone", cap of 1 block/customer/day (`README.md:99-101`, `agent.py:37`) | `MAX_AUTO_BLOCKS_PER_CUSTOMER_DAY` is defined and never referenced. Author's own comment admits "not fully enforced". | **MEDIUM** (mitigated by self-disclosure) |
| 6 | "Model Confidence" shown to the user (`dashboard.py:281`) | `abs(prob-0.5)*2` (`agent.py:174`) — anti-correlated with risk over the model's actual output range. Committed log shows a High-risk escalation at "3% confidence". | **MEDIUM** |
| 7 | Roadmap: "Replace rule-based explanations **with SHAP**" (`README.md:171`) | SHAP is already fully implemented (`agent.py:50-83`, `train_model_v2.py:159-183`) and is the default path. README is stale against its own repo. | **LOW** (undersells) |
| 8 | Run instructions install 4 packages (`README.md:147`) | `agent.py` and `dashboard.py` both crash at import without `shap`; `train_model_v2.py` needs `xgboost`. | **HIGH** for "does it run" |
| 9 | Policy Simulator presented as live precision/recall (`dashboard.py:392-398`) | Computed over all 8,000 rows, 6,400 of them training data (`dashboard.py:377-388`). Admitted only in a source comment. | **MEDIUM** |
| 10 | "Trained a RandomForest classifier" (`README.md:112`) | True for the committed artifact, but `train_model_v2.py:83-106` implements a model-selection routine that can pick XGBoost or LogReg; the README documents `train_model.py` (`README.md:150`) which is not what produced the committed pickles. | **LOW** |
| 11 | "8,000-order synthetic dataset with **realistic RTO patterns**" (`README.md:112`) | Patterns are the author's own priors written as a linear formula (`generate_dataset.py:86-96`) with no citation to any real RTO study or dataset. | **MEDIUM** — "realistic" is doing unearned work. |

**Notable NON-overclaims (credit where due):** the metrics table reproduces exactly;
the cost-minimisation-says-never-flag finding is real and volunteered
(`README.md:127-134`); "These numbers are honest, not impressive" (`README.md:136`)
is accurate; the scope note excluding post-delivery returns (`README.md:16-25`) is
correct and self-limiting; the audit log is real and populated.

---

## Candidate Patterns

### PATTERN A — Cost-weighted threshold table that reports the inconvenient answer
- **Type:** `EVALUATION_PATTERN`
- **Source:** `train_model.py:22-27`, `train_model.py:126-147`, `README.md:125-134`
- **Why strong:** Converts a classifier metric into rupees, then refuses to suppress
  the result when the economics say the agent shouldn't exist.
- **Razorpay applicability:** Direct — Track 02's "honest metrics including
  false-positive cost" and Track 03's "measured money recovered".
- **Reimplement:** ~30 lines. Two cost constants, threshold loop, confusion matrix,
  rupee column. **Fix their bug:** tune on validation, report on test.
- **Risk:** The cost constants are asserted, not sourced. Ours must cite something.
- **Score: 7/10**

### PATTERN B — One-hot-aware SHAP reason extraction
- **Type:** `COMPONENT_PATTERN`
- **Source:** `agent.py:50-83`, specifically the active-column filter at
  `agent.py:72-75`
- **Why strong:** Naive per-order SHAP over a `ColumnTransformer` output shows a
  customer both "COD increases risk" and "Prepaid decreases risk" for the *same*
  order. Suppressing inactive one-hot columns is the correct fix and is not obvious
  until you have shipped it once.
- **Razorpay applicability:** Any explainable money decision built on tabular ML.
- **Reimplement:** ~25 lines: `prep.transform` → `TreeExplainer.shap_values` →
  zip with `get_feature_names_out()` → drop `cat__` columns where the transformed
  value is 0 → sort by `|shap|`.
- **Risk:** SHAP is a heavy dependency and — as this repo demonstrates — a crash
  surface. Wrap the import, not just the load.
- **Score: 7/10**

### PATTERN C — Graceful explanation degradation
- **Type:** `FAILURE_HANDLING_PATTERN`
- **Source:** `agent.py:154-160`
- **Why strong:** The explanation contract (`reasons: list[str]`) is preserved
  whether SHAP works, is absent, or throws. The caller never branches.
- **Why weak:** The pattern is correct at the call site and wrong at the import
  site 130 lines above (`agent.py:27-33`), which is what actually breaks. Reimplement
  the intent, not the code.
- **Score: 5/10**

### PATTERN D — Structured `action_type` tag alongside human-readable action
- **Type:** `COMPONENT_PATTERN`
- **Source:** `agent.py:141-146`, consumed at `dashboard.py:187-189`
- **Why strong:** Emitting a machine tag (`prepaid_nudge`, `escalate`, `sms_confirm`)
  next to the prose means the audit log is aggregatable without parsing English.
  Small, cheap, and the thing everyone forgets.
- **Score: 6/10**

## Rejected Patterns

- **The "agent" framing.** `agent.py` is a scoring function plus an `if/elif` ladder.
  Nothing loops, plans, retries, or calls a tool. Reusing the word here would import
  the overclaim.
- **The synthetic data generator.** `generate_dataset.py` is the circularity engine.
  Its *stochastic-label* trick (`:99`) is worth stealing in isolation; the generator
  as a whole is not.
- **The `confidence` field** (`agent.py:174`). Actively misleading. Delete on sight.
- **`dashboard.py`.** 150 lines of inline SVG and a metrics tab that scores the
  training set.
- **Two parallel training scripts.** `train_model.py` and `train_model_v2.py` share
  ~70% of their code and disagree about which is canonical.

---

## Overall Scores

| Dimension | Score | One-sentence justification |
|---|---|---|
| **Idea** | **7/10** | RTO is a genuinely expensive, genuinely Indian, genuinely pre-dispatch-actionable loss class, and the scope note excluding post-delivery returns (`README.md:16-25`) shows real problem taste — docked because Razorpay already ships RTO Shield in Agent Studio and the repo never acknowledges the incumbent. |
| **Solution** | **4/10** | It demos solving the problem on data it invented: no real orders, no intervention outcome measured, and the reported operating point is not the one the agent runs at. |
| **Architecture** | **5/10** | Clean separation of generate / train / decide / display with importable pure functions, undermined by three copies of the threshold sweep, two rival training scripts, and a 418-line UI file. |
| **AI usage** | **4/10** | No LLM anywhere (correct call, never claimed as one), but the RandomForest is recovering a linear formula the author wrote, so a scorecard would match it — only the SHAP layer does work a `for` loop cannot. |
| **Razorpay relevance** | **7/10** | The COD→prepaid framing (`README.md:87-95`) ties return risk to payment conversion, which is a genuinely Razorpay-shaped angle rather than a generic e-commerce one. |
| **Engineering quality** | **3/10** | Zero tests, unpinned deps, a documented install path that raises `ModuleNotFoundError`, an unenforced guardrail constant, a nonsense confidence metric, and metrics computed on training data in the UI. |
| **Demonstrability** | **6/10** | Model artifacts and seed data are committed and the Streamlit app is legible enough to carry five minutes — provided the presenter installs `shap` first and never opens the Policy Simulator tab. |

---

## Final AgentArch Verdict

A repo with unusually good problem taste and a rare willingness to publish its own
inconvenient cost finding, wrapped around a circular synthetic dataset, a threshold
fitted on the test set, and an agent that operates at a threshold nobody has ever
measured — take the cost-table discipline and the one-hot SHAP filter, leave
everything else.
