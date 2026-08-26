# FIELD_BAR — What the top band of the Razorpay Buildathon field actually looks like

| Field | Value |
|---|---|
| Basis | 10 shortlisted repos cloned and read as source; 45-repo structural sample; 261-repo census |
| Retrieved | 2026-08-26 (deadline 5 Sep 2026 — 10 days out) |
| Evidence class | **FACT** for every `path:line` citation; `INFERENCE` labelled inline |
| Method | README claims treated as hypotheses; verified or contradicted in code. Two repos executed. |

---

## 0. Headline

The serious band is **much stronger than a normal hackathon** and **much weaker than it looks**.

Three repos (`vaibhav375/recovery-ledger`, `tfthushaar`, `shubhambhattog/recoup`) contain
engineering-integrity machinery I would not expect from a mid-level professional: build-failing
AST tests that enforce an AI exclusion zone, autonomy gated on a Wilson confidence lower bound with
two anti-gaming guards, pre-registered evaluation protocols with git-tagged amendments and
preserved superseded results.

And yet **every single measured repo in the field has a compromised measurement target.** Not one
of the ten reports a number that survives a determined 30-second attack. The sophistication is
real; it is pointed at the wrong thing.

> **The field has learned to *measure carefully*. It has not learned to *check what it is measuring*.**
> That gap is our opening, and it is wide.

---

## 1. What the best genuinely do well

These are real, verified, and set the bar we must clear.

| # | Capability | Who | Evidence |
|---|---|---|---|
| 1 | **Enforce the AI/deterministic boundary mechanically** | vaibhav375 | `tests/test_kernel_no_llm_imports.py` — AST-walks `kernel/`, fails the build on any `openai`/`anthropic` import, **with a vacuity guard** (`:42` asserts files were found) |
| 2 | **Gate autonomy on a statistical lower bound, per category, revocably** | tfthushaar | `calibration/wilson.py:12-21`; auto-resolve requires Wilson **CI lower bound** ≥ 0.90, not the point estimate |
| 3 | **Catch their own system gaming its own gate** | tfthushaar | `calibrator.py:17-25` — "6 consecutive mock-mode batch runs alone crossed the 90% threshold with no LLM ever having been called" |
| 4 | **Understand that a CI over correlated samples is meaningless** | tfthushaar | `calibrator.py:40-52` — re-running one seed inflates `n` with non-independent samples; `ci_lower` converges to the point estimate and clears any threshold. Fixed with a distinct-case floor |
| 5 | **Pre-register the evaluation before running it** | abhinav-phi | `eval/PROTOCOL.md` tagged `eval-preregistered-v1`; two amendments each tagged; `eval/results/superseded_pre_amendment/` preserved |
| 6 | **Publish a target they missed** | abhinav-phi | "G1 … **MISSED**. Actual +10.24 pp vs ≥+15 pp. We claim the win we measured, not the one we hoped for." |
| 7 | **Validate causal machinery on real randomised data before synthetic** | vaibhav375 | Criteo + Hillstrom tier-1 kill-gate; IPS/SNIPS reproduce the datasets' own arm-mean ATE exactly |
| 8 | **Validate the measurement instrument against planted ground truth** | Adarsh-Me | `tests/validation/test_validation_suite.py` V1–V6 — **I ran it: 8 passed on a fresh clone** |
| 9 | **Test a verifier in both directions** | vaibhav375 | `test_ledger_tamper.py:1-8` — "a function that always returns False passes a naive test" |
| 10 | **Withdraw their own overclaims in their own README** | vaibhav375 | "the sign of the difference flips with the sample, so 'beats' would be an overclaim"; "**DR is the honest weak spot**"; four revisions logged rather than quietly replaced |
| 11 | **Bound money actions with distinct, auditable refusal codes** | Adarsh-Me | `routers/payments.py:53/105/110` — E505 test-mode-only, E504 whitelist, E503 spend cap, each with `details.policy`; **amount resolved server-side from the DB**, agent sends only `sku` |
| 12 | **Report the mock/real split rather than hiding it** | tfthushaar | "5,508 tx/sec (mock) — **2.58 tx/sec (real LLM, measured, not extrapolated)**. The 2,000× gap is…" |

**`INFERENCE — high confidence:` a submission that does none of these is not in the top 30.**

---

## 2. What essentially NOBODY does — our openings (7)

Ranked by leverage. These are the gaps, and each is cheap relative to its persuasive value.

### Opening 1 — **Nobody checks that their label is not a restatement of their features.** ⭐ biggest

This is the field-wide fatal flaw. Verified in **every** measured repo:

| Repo | The circularity |
|---|---|
| SaxenaLakshya | `abuse_type`/`abuse_label` are a perfect bijection; a **depth-3 decision tree recovers 99.18%** of labels. Reported XGBoost: 98.80%. The model re-derives the generator's `if/else` |
| komallbarhate | Olist mails the review survey ~2 days after estimated delivery when the parcel is late. **`days_to_estimated <= 2` alone scores AUC 0.9435 / $58,705 saved vs the LightGBM's 0.8615 / $50,250.** One subtraction beats the whole stack by $8,455 |
| abhinav-phi | `dx_holdout` = **accuracy 1.0, 500/500, perfectly diagonal confusion matrix**, with the LLM *off*. The generator emits strings from the same 11-code taxonomy the rules match |
| Sivanandini | Circular synthetic labels + threshold leak |
| tfthushaar | Ground truth from `data_gen/generate.py`; no real-data tier |
| shubhambhattog | Text corpus has **six distinct strings**; heuristic accuracy is a closed-form function of archetype weights (31/39 = 79.5% ≡ reported 79.4%) |
| MrBurber | Has real ground truth and dev/test discipline — yet same-ring cosine min **0.9842** vs all-other-pairs max **0.9064**: an *empty* 0.078 gap, so any threshold in the window scores 100/100 |

**Only `vaibhav375` defends against this** — and only for the causal machinery, via the Criteo/
Hillstrom tier.

**Our move:** for every headline number, run and publish an **adversarial baseline hunt** — a
one-feature decision stump, a single comparison, a majority-class baseline, a regex. If a trivial
rule gets within a few points of your model, say so *in the README*, in a table. Either the model
earns its complexity or you have found the tautology before the judge did. This is ~30 lines of
`sklearn.tree.DecisionTreeClassifier(max_depth=1..3)` and it is the single highest-value artifact
available to us.

### Opening 2 — **Nobody builds an honest baseline.**

Every uplift claim in the field rests on a baseline the same author designed to lose.

- shubhambhattog's **6.38× uplift**: `baseline.ts:27` retries at t, +1h, +2h; `generate.ts:80`
  sets funds arrival at t+12–96h. The baseline recovers 0% of the largest archetype **by
  construction**, from two constants the same author chose. Undisclosed in `SIMULATION.md` §4.
- komallbarhate's rule baseline scores P=0.003 — it uses **the wrong sign** on the dominant feature.
- abhinav-phi is the honourable exception: B1 is a *tuned* naive baseline (retry×3 + blast SMS×2)
  at 21.16%, and it publishes B0 (do-nothing) at 4.68% too.

**Our move:** publish **three** baselines — do-nothing, a *tuned* naive rule, and the best trivial
rule from Opening 1 — and state the parameters of each. Then invite the reader to attack them.
Razorpay ships Smart Retry; a straw-man retry baseline is the fastest way to lose credibility with
this specific judging panel.

### Opening 3 — **Nobody measures the sell-side of agentic commerce.** ⭐ strategic

Track 01 has 16 of 261 repos (6%). Filtering the full census for sell-side language, the serious
occupants are:

- `Adarsh-Me/Agent-Audit` (2.8 MB) — the only real one; **and its committed evidence is a
  deterministic mock whose rerun delta is exactly zero.**
- `aryanpajnee/RazorpayBuildathon` (308 KB) — "a merchant an AI buyer agent can transact with under
  signed and bounded authority" — genuinely adjacent, unexamined.
- `VeerGetGit/RazorPay_agentic_checkout` (10 MB, mostly committed `node_modules`) — **zero
  assertions anywhere**; `payment_node.py:91` prints "Payment successful! 🎉" for an unpaid Order;
  its own committed DB has 5 orders, all `status='pending'`.
- Everything else in the sell-side cluster is 0–132 KB — stubs.

**`INFERENCE — high confidence:` the sell-side agent-readability problem has exactly one serious
occupant, and that occupant's headline evidence is a mock.** Razorpay frames this track most
urgently on its own page ("the open problem of the year", "in-app pilots are already live"). This
is the thinnest serious competition in the entire field.

### Opening 4 — **Nobody writes down where they deliberately did NOT use AI in a way that costs them anything.**

Rubric pillar 3 is explicit: *"the right tool in the right place, **and where you chose not to use
one**."* Field behaviour:

- 2 repos argue it properly (vaibhav375's row-by-row table; komallbarhate's argument, called
  "best-in-corpus" by the analysis).
- 1 enforces it mechanically (vaibhav375's AST test).
- 1 draws the boundary in the *measurement layer* — tfthushaar's `calibrator.py:1-15`: deterministic
  arithmetic results are reported as **exact** and never get a confidence interval, because
  "running a CI over a provably-correct computation is conceptually wrong." Calibration is reserved
  for where AI judgment is actually exercised. This is the most sophisticated version I found.
- Several repos have **no LLM at all** and never say why (Sivanandini, SaxenaLakshya) — which
  scores as an absence, not a judgment.
- The inverse failure is common: VeerGetGit's `input_guard.py:14-18` claims Guardrails AI + Llama
  Prompt Guard; the code is three substring scans and zero models.

**Our move:** a `WHERE_WE_DID_NOT_USE_AI.md` table with a *cost* column — what we gave up by using
a rule. Plus the AST-enforcement test. Cheap, and a direct hit on a named pillar.

### Opening 5 — **Nobody reports effective n, or what their pipeline threw away.**

- Adarsh-Me's live run: **640 attempted / 234 parse_ok (36.6%)** — disclosed only in
  `Docs/SUMMARY.md:115`, not the README, while "640 trials" is the headline.
- tfthushaar headlines "50,000" (mock); the real-LLM batch is **120**.
- shubhambhattog's `postOptOutContacts` is initialised to `0` at `loop.ts:85` and **never
  incremented** — a headline metric, a dashboard tick and a CI gate that is a constant.
- komallbarhate's HF-2/HF-5 rules are structurally unreachable (require `canceled`; universe is
  `delivered`-only).

**Our move:** an **exception/attrition ledger** — every record that entered, every record dropped,
with the reason, reconciling to the reported denominator. Track 04's bar literally asks for "an
honest exception list"; Track 02 asks for "false-positive cost". A table that reconciles
`N_in → N_scored → N_reported` with named drop reasons is rare and instantly credible.

### Opening 6 — **Nobody runs an ablation on their own system.** ⭐ underrated

Not one of the ten repos deletes a component and re-measures. When we did it for them, the result
was decisive:

- **`MrBurber/KinGraph`**: deleting **all identifier edges** — the device/IP/address graph the
  project is named for — reproduces **100/100/0 byte-identically**. At `min_edge_weight=3.0` the
  `+3` bonus (`detect_rings.py:12`) lets a single embedding edge pass alone while genuine households
  (weight 2) are dropped. The entire premise is inert, and the author never checked.
- **`komallbarhate`**: the whole LightGBM + TreeSHAP stack is beaten by `days_to_estimated <= 2`.
- **`SaxenaLakshya`**: a depth-3 tree recovers 99.18% of the labels.

An ablation table — *remove each signal, re-report the metric* — is ~20 lines, and it is the only
thing that proves a multi-component system is not one component wearing a costume. It also produces
the best possible failure narrative when a component turns out not to matter.

**Our move:** publish an ablation table for every claimed signal, and keep any row where the metric
*doesn't* move. That row is worth more than the ones that do.

### Opening 7 — **Nobody demonstrates a failure they did not choose.**

Every "failure handled gracefully" I found is a scripted injection. The genuinely compelling
failure stories in the field are *build* failures the author stumbled into and documented —
tfthushaar catching his own mock runs earning autonomy, abhinav-phi discovering his eval LLM was a
noop, vaibhav375's four withdrawn numbers.

Recall the rubric: *"What broke, and how you got out"* — **"The last one is the one we read
first."** `INFERENCE — high confidence:` the highest-leverage 300 words of the submission are a
real debugging narrative, and the field is mostly writing scripted chaos-injection demos instead.

---

## 3. The median of the *serious* band

Filtering to repos with a real build (excluding the ~33% noise floor):

- **Ships:** FastAPI/Next or TS monorepo, a synthetic data generator, a dashboard, a README with a
  metrics table, `docker-compose.yml`.
- **Claims:** a headline percentage or rupee figure, "audit trail", "guardrails", "bounded".
- **Actually has:** a script that produces the number; a train/test split of some kind; an
  append-only log.
- **Actually lacks:** a defensible label, an honest baseline, effective-n reporting, any validation
  that the metric code is correct, and any deliberate-non-use-of-AI argument.
- **Structural sample (n=45, generous substring heuristics — upper bounds):** any path containing
  "test" 67%; "eval"/"benchmark"/"metric" 40%; `.github/workflows` **16%**; a deps manifest 87%;
  any "architecture" file 29%. Median 63 tracked files; 14/45 under 25 files.

> **Critical calibration: these heuristics are near-worthless.** `VeerGetGit` scores `test=True,
> eval=True, ci=True, deps=True` — and its `backend/evals/` is a **0-byte `__init__.py`**, its three
> "test" scripts contain **zero assertions** (they POST, `print()` 120 chars, and sleep), and its
> `requirements.txt` pins nothing while listing two non-installable packages. A commit message says
> "all 10 tests passing"; nothing in the repo can compute passing.
>
> `INFERENCE — high confidence:` a large fraction of the 40% "has eval" cohort is this. **Real
> held-out evaluation in the field is plausibly under 10%, and defensible evaluation is ~1 repo.**

---

## 4. How much is genuine vs. README theatre?

Sorted by the gap between claim and code.

| Band | Repos | Character |
|---|---|---|
| **Genuine, exceeds its claims** | `vaibhav375` | README *understates*: it withdraws its own headline ("'beats' would be an overclaim"), names its weak spot, logs four revisions |
| **Genuine with a labelled gap** | `tfthushaar`, `abhinav-phi`, `shubhambhattog` | Machinery is real and reproduces; each has one undisclosed or under-disclosed hole (mock scale / circular holdout / straw-man baseline) |
| **Genuine machinery, compromised target** | `Adarsh-Me`, `komallbarhate` | Code does what it says; the thing being measured is a mock or a tautology. Both **disclose it somewhere** — neither in the README's first screen |
| **Honest writeup, inert system** | `MrBurber`, `Sivanandini` | `FINDINGS.md` publishes a Kaggle null result (0.67× lift, *worse* than baseline) and names its own circularity — while the graph premise is provably inert and the "LLM investigation note" is an f-string |
| **Theatre** | `SaxenaLakshya`, `VeerGetGit` | Training notebook deleted in the commit that added the artifacts (`6b332c9`: `Feature Engineering.ipynb \| 4289 ---`); "Payment successful! 🎉" on an unpaid Order; guardrail library claims backed by substring scans; 20 session bearer tokens in git |

**Rough split of the shortlist (the *top* of a 261-repo field): ~30% genuine, ~50% genuine-but-
compromised or inert, ~20% theatre.** Extrapolating to the full field, `INFERENCE — medium confidence:`
theatre dominates below the shortlist, because the shortlist was selected for sophisticated
*descriptions* and even there two of ten collapsed on contact.

**The single most useful calibration:** sophisticated vocabulary in a repo description
("calibrated autonomy", "cost-weighted evaluation", "incremental measurement") predicted real
engineering **about half the time**. `SaxenaLakshya/AI-Risk-Manager` advertised "cost-weighted
evaluation" and contains **no cost matrix, no confusion matrix, and no C_FP/C_FN anywhere** — the
only "weighted" token in the repo is sklearn's `f1_weighted` averaging keyword.

---

## 5. What would it take to be clearly in the top 5?

Concretely, and in priority order. `INFERENCE — high confidence`, grounded in the evidence above.

**Necessary — the price of entry (the top band already does these):**

1. **Clone-and-run in under five minutes, verified on a clean machine.** Exact pins. A `make demo`
   that needs no API key. *(Note: Adarsh-Me's pinned reqs failed to build on Python 3.14 and
   succeeded on 3.13 — test against the default `python3` a reviewer will actually have.)*
2. **A batch number with a confidence interval**, not a point estimate.
3. **A real audit trail, tested in both directions.**
4. **Stopping rules that exist as code**, plus a reachability test proving none is dead.
5. **A `WHERE_WE_DID_NOT_USE_AI.md`**, enforced by an AST test that fails the build.

**Sufficient — what actually separates the top 5 (nobody reliably does these):**

6. **Attack your own number in public and publish the attack.** Run the adversarial baseline hunt
   (depth-1/2/3 stump, single comparison, majority class, regex). Publish the table even when — 
   *especially* when — a trivial rule comes close. Then either justify the model's complexity or
   change the target. **This alone would put a submission ahead of eight of the ten repos here.**
7. **Validate on something you did not generate.** A real public dataset, a real API response, real
   issuer decline strings — as a kill-gate *before* the synthetic evaluation. This is
   `vaibhav375`'s tier-1 idea and it is the strongest single move in the field.
8. **Publish a pre-registered protocol with a git tag that provably predates your first result** —
   and then report a gate you missed.
9. **Publish the attrition ledger**: `N_in → N_scored → N_reported`, every drop with a reason, and
   the effective n next to every headline.
10. **Publish an ablation table** — delete each signal, re-report the metric, and keep the rows
    where nothing moved.
11. **Write the failure narrative as a real debugging story**, not a chaos-injection demo. It is
    read first.

**And the strategic multiplier:**

12. **Pick Track 01's sell-side.** 6% of the field, one serious occupant whose headline evidence is
    a mock, framed by Razorpay itself as "the open problem of the year." A submission that measures
    agent-readability *with a defensible target* — real catalogs, real models, effective n reported,
    an honest baseline — would have essentially no direct competition. The cost is real: it demands
    Razorpay test-mode integration plus the UAP/ACP/AP2/x402 protocol layer, which is exactly why
    the field avoided it.

> **The compressed answer:** the top band already measures carefully. To be clearly top-5 you must
> **measure the right thing, prove your target is not a tautology, and show the attack you ran
> against your own headline.** In a field where a single subtraction beats a LightGBM stack and a
> "holdout" scores a perfect 1.0, being the one submission that publicly tries to break its own
> number is the highest-value 30 lines of code available.

---

## 6. Named risks to us

- **Adarsh-Me is 10 days ahead on the same idea.** Its problem framing is the best in the field. Its
  weakness is evidence quality, not conception. If we enter this space we must beat it on
  *defensible measurement*, not on concept.
- **Razorpay ships Agent Studio** (Dispute Responder, RTO Shield, Subscription Recovery, Abandoned
  Cart, Settlement Insights, Cashflow Forecaster) — mapping almost 1:1 onto Tracks 02/03/04 where
  **49% of the field is building**. Those submissions are judged against an invisible production
  baseline by the people who built it.
- **Do not confuse this field's honesty with safety.** The best repos are honest *because* their
  authors ran the attacks. The panel will run them too.

## 7. Open items

- `aryanpajnee/RazorpayBuildathon` — the one unexamined serious sell-side Track 01 repo.
  **Recommend examining before committing to Track 01.**
- Not executed: `vaibhav375` tier-1 (needs ~340 MB Criteo download), `abhinav-phi` suite (needs
  Postgres 16 + Redis). Both `UNDETERMINED` by execution; read as source only.
