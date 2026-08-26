# AgentArch — SaxenaLakshya/AI-Risk-Manager

| Field | Value |
|---|---|
| Repository | `https://github.com/SaxenaLakshya/AI-Risk-Manager` |
| Local clone analysed | `/tmp/rzp_scratch/SaxenaLakshya_AI-Risk-Manager` |
| Competition | Razorpay AI Buildathon — Track 02 (AI Risk Manager) |
| Placement | Submission, not a placed winner (no ranking evidence) |
| HEAD | `6b332c9` "ML Models trained and API created" (2026-08-25) |
| Commits total | **2** |
| Files at HEAD | **15** (no README, no tests, no training code) |
| Analyst verdict class | `NOT_USEFUL` |

---

## Original Problem (inferred — no README exists)

There is **no README.md at HEAD** (`git ls-tree -r HEAD --name-only`). The problem statement had to
be reconstructed from `app.py:1-17` and the dataset schema. The intended problem is: classify an
e-commerce return request into `Legitimate / Policy Abuser / Fraudulent Return / Wardrobing`.

The claim under test — "cost-weighted evaluation" — **does not appear anywhere in the repository.**
A full-tree grep for `cost|weight|precision|recall|threshold|audit` returns only:
- `app.py:38` `UNCERTAIN_THRESHOLD = 0.60` (a hardcoded constant, never tuned)
- `model metrics/Model Performances.txt` `f1_weighted`, `precision_macro`, `recall_macro`

`f1_weighted` is **sklearn's class-support-weighted F1**. It has nothing to do with the cost of a
false positive. If the phrase "cost-weighted evaluation" was used in the submission, it is an
overclaim resting on a scikit-learn averaging keyword.

---

## Actual Architecture (from code)

```
 ecommerce_return_abuse_dataset.csv (60,000 rows, Kaggle synthetic)
        │
        │   [ TRAINING CODE: ABSENT AT HEAD — deleted in commit 6b332c9 ]
        ▼
 artifacts/{preprocessor,xgb_model,ada_model,label_map}.pkl   (committed binaries)
        │
        ▼
 app.py  ──►  FastAPI  POST /score-order
              preprocessor.transform(df)              app.py:89
              proba = (xgb.predict_proba + ada.predict_proba)/2   app.py:97-99
              predicted_class = argmax                app.py:101-102
              is_uncertain = max_proba < 0.60         app.py:104
              ► JSON {predicted_class, confidence, is_uncertain, class_probabilities}
```

- **Components:** one FastAPI file (125 lines), one broken offline scoring script (54 lines).
- **Models:** XGBoost (`artifacts/xgb_model.json` — `num_class: 4`, `num_trees: 400`, `num_feature: 46`)
  + AdaBoost, combined by unweighted probability averaging (`app.py:99`).
- **Datastores:** none. **External APIs:** none. **Async:** none. **State:** none.
- **AuthN / AuthZ / rate limiting:** **absent** — `/score-order` is unauthenticated (`app.py:124-126`).
- **Validation:** Pydantic bounds on the binary fields only (`app.py:56-68`); no bounds on
  `avg_order_value_usd`, `refund_amount_requested_usd`, `previous_dispute_count`.
- **Failure handling:** exactly one `try/except` (`app.py:88-95`) around `preprocessor.transform`,
  re-raised as HTTP 400. Model inference itself is unguarded.
- **Audit trail:** **absent.** Nothing is persisted. No log line is written anywhere in the repo.
- **Bounded actions / stopping rules:** **absent.** The service returns a label; it takes no action,
  so there is nothing to bound. `is_uncertain` is computed and returned but no code consumes it.

---

## 1. Is the measurement real or theatre? — **THEATRE**

### (a) Train/test split — UNDETERMINED, because the code that made it is gone
`model metrics/Model Performances.txt` reports "Training set" and "Test set" blocks for six models,
so a split existed on the author's machine. **The script that produced it is not in the repository.**
`git show --stat 6b332c9` shows `Feature Engineering.ipynb | 4289 ---` — the notebook was
**deleted in the same commit that added the artifacts**. The earlier commit `9a58346` contains a
notebook, but it operates on `ecommerce_returns_synthetic_data.csv` (10,001 rows) — a *different
dataset* also deleted at HEAD. **No code in the repository trains a model on the 60,000-row dataset
that ships with it.** Whether the split was temporal or random cannot be determined from the artifact.

### (b) Leakage — the reported numbers are not reproducible, so leakage cannot be excluded
There is no script that computes precision or recall. `Model Performances.txt` is a **pasted text
dump**. A reviewer cannot re-derive a single number in it. The threshold `0.60` (`app.py:38`) is a
magic constant with no tuning code and no justification.

### (c) Reproducibility — **NO**. The only executable "test" is broken.
`model metrics/test.py:9-12` loads `preprocessor.pkl`, `xgb_model.pkl`, `ada_model.pkl`,
`label_map.pkl` from the **current working directory**. Those files live in `artifacts/`.
Verified by execution:

```
$ cd "model metrics" && python3 test.py
FileNotFoundError: [Errno 2] No such file or directory: 'preprocessor.pkl'
```

It also fails from the repo root (`test_orders.csv` not found there). There is no working directory
from which this script runs.

Worse: even if the paths were fixed, `test.py` **computes no metrics**. `model metrics/test_orders.csv`
has 20 rows and **no label column** (header ends at `wishlist_to_cart_time_hrs`). `test.py:46-52`
prints predicted classes and counts how many fall below 0.60 confidence. **Precision and recall are
never computed anywhere in this repository.** Track 02's bar — *"measured precision and recall on a
held-out test set"* — is not met by any executable artifact.

### (d) Synthetic data with a circular label — **CONFIRMED, FATAL**

`ecommerce_return_abuse_dataset.csv` is a Kaggle synthetic file. `abuse_type` and `abuse_label` are a
**perfect bijection** (verified: crosstab is strictly diagonal — `Legitimate`↔0, `Policy Abuser`↔1,
`Fraudulent Return`↔2, `Wardrobing`↔3). The label is generated by a small deterministic threshold
rule over a handful of the feature columns. Verified by fitting shallow decision trees on the raw
CSV:

| Tree depth | In-sample accuracy (all numeric features) | In-sample accuracy (only the 22 features `app.py` actually serves) |
|---|---|---|
| 2 | 0.9146 | 0.8911 |
| **3** | **0.9918** | 0.9460 |
| 4 | 0.9979 | 0.9667 |
| 5 | 0.9988 | 0.9759 |
| 6 | — | **0.9806** |

A **depth-3** decision tree recovers **99.18%** of the labels. The recovered rule is legible:

```
return_rate_pct <= 15.8
├── customer_support_contacts <= 1.5
│   ├── days_to_return <= 41  → tracking_number_valid ? Legitimate : Fraudulent
│   └── days_to_return  > 41  → Wardrobing
└── customer_support_contacts > 1.5 → {Fraudulent | Wardrobing} by days_to_return
return_rate_pct > 15.8 → mostly Policy Abuser, split on wishlist_to_cart_time_hrs / days_to_return
```

The reported XGBoost test accuracy of **0.9880** (`Model Performances.txt`) is **within noise of the
0.9806 that a depth-6 tree gets by memorising the generator on the served feature set**. The model is
not detecting return abuse. It is **re-deriving the `if/else` block that wrote the CSV.**

This is the fatal flaw. It is also the most instructive one: on this dataset, *any* model gets ~98%,
so 98% carries **zero information about the system's value.** (Majority-class baseline is 70.1%.)

### (e) "Cost-weighted evaluation" — **SLOGAN, NOT CODE**
No cost matrix. No `confusion_matrix` call. No `C_FP`/`C_FN`. No dollar figure. No expected-loss
calculation. Nothing in the repository weights an error by its consequence.
The only "weighted" token is sklearn's `f1_weighted` averaging keyword.

---

## 2. Is the AI load-bearing or decorative? — **There is no AI, and no LLM at all**

Grep across the whole tree for `llm|claude|openai|anthropic|gpt` yields exactly **one hit**, and it is
a comment about work not done:

```python
# app.py:70-71
    # Optional free-text field, useful later for the Claude layer
    return_reason: Optional[str] = None
```

`return_reason` is accepted by the schema and then **explicitly dropped before scoring**
(`app.py:85`: `order.dict(exclude={"return_reason"})`). So the one free-text field — the only place
an LLM could plausibly add value in a return-abuse system — is discarded.
`requirements.txt` contains no LLM SDK.

This is gradient-boosted trees on tabular data. That is a defensible engineering choice, and under
the rubric's *"where you chose not to use one"* clause it could have scored well — **if it had been
argued.** It is not argued anywhere, because there is no README. It reads as absence, not judgement.

---

## 3. Four pillars

**(a) Does it run?**
- Deps **pinned exactly** (`requirements.txt` — `sklearn==1.6.1`, `numpy==2.1.3`, `xgboost==3.4.1`). Good.
- Model artifacts **are committed** — no retraining needed to serve. Good, and the better half of this repo.
- Seed data present (11 MB CSV committed).
- **But:** `artifacts/preprocessor.pkl` fails to unpickle on sklearn ≥ 1.7 —
  `AttributeError: module 'sklearn.compose._column_transformer' has no attribute '_RemainderColsList'`.
  It will only load inside the pinned environment. No Dockerfile, no `.python-version`, no setup
  instructions (there is no README to put them in).
- The one runnable script is broken (see 1c).
- **No README ⇒ a reviewer cannot know how to start it.** Under *"does it run"* this is close to fatal
  on its own.

**(b) Is it structured?** Marginally. Two Python files. `app.py` is clean, commented, artifacts loaded
once at startup rather than per-request (`app.py:30-36`) — a genuinely correct choice. But there is no
module boundary, no package, no config, no tests directory. `model metrics/` has a space in the
directory name.

**(c) Deliberate non-use of AI?** **Absent as an argument.** The system contains no LLM, but nowhere
does the repo say why. `app.py:70` says the opposite — that a Claude layer is planned. This converts
what could have been a pillar-3 strength into a pillar-3 blank.

**(d) Real failure handling?** One `try/except` on preprocessing (`app.py:88-95`) with a genuinely
useful error message about unseen categories. That is the single best line in the repo. Everything
else is unguarded: no timeout, no retry, no circuit breaker, no health check on model staleness
(`/health` at `app.py:119-121` returns a constant `{"status":"ok"}` without touching the model).

---

## 4. Audit trail / bounded actions / stopping rules / defense-only

| Demand | Status |
|---|---|
| Audit trail | **Absent in code and in README (no README).** Zero persistence, zero logging. |
| Bounded actions | N/A — the service takes no action; it returns a label. |
| Stopping rules | `is_uncertain` (`app.py:104`) is **computed and returned but never consumed**. There is no escalation path, no human queue, no gate. It is a field, not a rule. |
| Defense-only compliance | **Compliant by construction.** Nothing offense-capable. But also nothing that probes or tests its own boundaries. |
| Money-safety | The endpoint is unauthenticated and unrate-limited (`app.py:124`). Nothing here would be allowed near a refund decision. |

---

## 5. The single best engineering idea worth reimplementing

**Artifact-pinned, load-once inference service with an explicit unseen-category failure mode**
(`app.py:30-36`, `app.py:88-95`).

The pattern: fit the preprocessor once during training, **serialise the fitted preprocessor alongside
the model**, and at serve time call `preprocessor.transform` rather than re-deriving encodings —
then catch the transform failure specifically and return a 400 that names the cause ("check category
values are valid"). This eliminates the single most common train/serve skew bug in tabular ML
(hand-rolled `get_dummies` at inference producing different column orders). `test.py:16` shows the
author understood this explicitly: *"Use the SAME fitted preprocessor from training — no manual
get_dummies needed."*

That is a real, correct, transferable instinct. It is worth ~15 lines and it is the only thing in this
repository I would carry forward. Type: `COMPONENT_PATTERN`. Score: **5/10** — correct but small,
and widely known.

---

## 6. The weakest thing — where a Razorpay engineer pokes a hole in 30 seconds

**They open the repo, see no README, and are done.** *"Does it run"* is one of three explicit
build-quality gates, and there is no instruction anywhere for how to run it.

If they get past that, the second 30 seconds: **"98.8% accuracy on a fraud problem"** is a red flag,
not a result. Any reviewer who has trained a fraud model knows that number means the label leaked or
the data is generated. They will open the CSV, see `abuse_type` and `abuse_label` as parallel columns,
and conclude in under a minute that the model is memorising a rule-based generator. The
`Decision Tree — Training set accuracy: 1.0000` line in the author's own metrics file is the tell they
will spot first.

Third: the *"cost-weighted evaluation"* claim collides with a repo containing no cost model at all.

---

## 7. Every overclaim — README says X, code shows Y

There is no README, so the overclaims are those in the submission text and the metrics file.

| Claim | What the code shows | Evidence |
|---|---|---|
| "Cost-weighted evaluation" | **No cost matrix, no confusion matrix, no C_FP/C_FN, no dollar figure exists in the repo.** The only "weighted" token is sklearn's `f1_weighted` class-support averaging. | full-tree grep; `model metrics/Model Performances.txt` |
| Implied "measured precision and recall on a held-out test set" | Precision/recall are **never computed by any script in the repo**. The numbers are a pasted text dump with no generating code. | `model metrics/Model Performances.txt`; `git show --stat 6b332c9` (notebook deleted) |
| Metrics reflect a held-out test set | The split code was **deleted in the same commit that added the artifacts**. Reproducibility is zero. | `git show --stat 6b332c9`: `Feature Engineering.ipynb \| 4289 ---` |
| "AI Risk Manager" | No LLM, no agent, no loop, no tool use. A 4-class tabular classifier behind one POST route. | `requirements.txt`; `app.py` in full |
| Repo name implies a *manager* (takes/gates actions) | Takes no action, gates nothing, logs nothing, persists nothing. `is_uncertain` is returned and never used. | `app.py:104`, `app.py:108-113` |
| `model metrics/test.py` implies a test suite | Cannot execute from any directory; computes no metric; scores 20 **unlabelled** rows. | verified `FileNotFoundError`; `test_orders.csv` header |
| 98.8% accuracy demonstrates detection skill | A depth-3 tree on the raw CSV gets 99.18%. The label is a deterministic function of the features. | reproduced: see §1(d) table |
| Ensemble of XGBoost + AdaBoost adds value | Unweighted probability average of a 0.9880-accuracy model with a 0.9781-accuracy model, on data where any model scores ~0.98. No ablation. AdaBoost strictly degrades the better model. | `app.py:99`; `Model Performances.txt` |
| `/health` indicates service health | Returns a hardcoded constant; never touches the loaded models. | `app.py:119-121` |

---

## Candidate Patterns

### P1 — Fitted-preprocessor-as-artifact with named transform failure
- **Type:** `COMPONENT_PATTERN`
- **Source:** `app.py:30-36`, `app.py:88-95`, `model metrics/test.py:16-17`
- **Why strong:** Kills train/serve skew; converts a silent wrong-answer bug into a loud 400.
- **Razorpay applicability:** Any tabular risk scorer behind an API in Tracks 02/03/04.
- **How to reimplement:** `joblib.dump` the fitted `ColumnTransformer` next to the model; at serve
  time wrap `transform()` in a try/except that returns a 4xx naming the offending category.
- **Risks:** pickle version-coupling — demonstrated live here (fails on sklearn 1.7).
  Mitigate with a Docker pin or ONNX/skops export.
- **Score:** 5/10

### P2 — REJECTED: "confidence < 0.60 ⇒ uncertain" as a stopping rule
- **Type:** would-be `FAILURE_HANDLING_PATTERN`
- **Source:** `app.py:38`, `app.py:104`
- **Why rejected:** The threshold is a magic constant with no tuning code, no cost justification, and
  **no consumer** — nothing branches on `is_uncertain`. Additionally, on a 4-class softmax the max
  probability is not a calibrated confidence, and it is not calibrated here. This looks like a
  stopping rule and is a display field.

### P3 — REJECTED: 4-class abuse taxonomy (Legitimate / Policy Abuser / Fraudulent Return / Wardrobing)
- **Type:** `IDEA_ONLY`
- **Why rejected as *evidence*, retained as *framing*:** The taxonomy itself is reasonable and maps
  to real merchant loss categories. But here it is inherited wholesale from a Kaggle synthetic file,
  and the four classes are a bijection with a generator rule. Reusing the *names* is fine; reusing
  anything downstream of them from this repo is not.

---

## Selected Patterns
- **P1** (marginal — 15 lines, well-known, but correct).

## Rejected Patterns
- **P2** — fake stopping rule (computed, never consumed, untuned constant).
- **P3** — taxonomy is borrowed from the dataset, not derived from the problem.
- **Everything else.** The ensemble, the metrics file, the "test" script, and the model artifacts are
  all downstream of a circular synthetic label and carry no signal.

---

## Overall Scores

| Dimension | Score | Justification |
|---|---|---|
| **Idea** | 4/10 | Return abuse is a real merchant loss vector and Track-02-appropriate, but the framing is entirely inherited from a Kaggle CSV rather than argued from evidence. |
| **Solution** | 2/10 | It demos classification; it never demonstrates detection, because the thing classified is a rule the model was handed. |
| **Architecture** | 3/10 | One clean 125-line FastAPI file with correct load-once artifact handling — and literally nothing else: no persistence, no auth, no queue, no gate, no audit. |
| **AI usage** | 2/10 | Zero LLM (defensible), but zero *argument* for zero LLM, plus a comment promising "the Claude layer" later — so it reads as unfinished rather than deliberate. |
| **Razorpay relevance** | 3/10 | The problem is on-track and the serving shape is familiar, but nothing here touches the bar's actual demands (honest metrics, FP cost, bounded actions, audit trail). |
| **Engineering quality** | 2/10 | No README, no tests, no logging, no auth, the one test script cannot execute, and the training code was deleted in the final commit. |
| **Demonstrability** | 3/10 | A live `POST /score-order` returning four class probabilities would demo in 20 seconds — and the first question ("what's your precision on abusers?") has no answer in the repo. |

---

## Final AgentArch Verdict

**A competently-served model measuring nothing:** the 98.8% headline is a depth-3 decision rule
recovered from a synthetic generator, the training code was deleted in the final commit, the sole
test script cannot execute, precision and recall are computed nowhere, and the advertised
"cost-weighted evaluation" is scikit-learn's `f1_weighted` keyword.

**Selection: `NOT_USEFUL`** (retain `COMPONENT_PATTERN` P1 only, at low priority).

---

### Calibration note for our own build
This repo is the clearest available demonstration of the **circular-synthetic-label trap**, which is
the dominant failure mode in Track 02. Two defences follow directly:
1. **Never report an accuracy above ~90% on a fraud problem without first fitting a depth-3 tree to
   your own labels and publishing that number as a baseline.** If the tree matches your model, your
   label is a rule and your model is a mirror.
2. **Publish the label-generation provenance.** If the data is synthetic, state the generator; if it
   is a proxy, state the proxy and validate it against a control group before building on it.
