# AgentArch — Competitive Field Index

Forensic analysis of the **live** Razorpay AI Buildathon field (261 public repos, deadline
5 Sep 2026). Every repo below was cloned to `/tmp/rzp_scratch/` and read as source. README claims
were treated as hypotheses and verified or contradicted in code.

Full per-repo reports in this directory. Strategic synthesis: **[`FIELD_BAR.md`](FIELD_BAR.md)**.

## Comparison table

| Repo | Track | Measurement real? | AI load-bearing? | Audit/bounds real? | Idea | Sol | Arch | AI | Rzp | Eng | Demo | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **vaibhav375/recovery-ledger** | T03 | **YES — real RCT tier (Criteo/Hillstrom) before sim** | Yes, and exclusion zone enforced by build-failing AST test | **Yes** — hash chain tested both directions, 11 stopping rules + reachability guard | 7 | 9 | 9 | **10** | 9 | **10** | 7 | **Field bar-setter for integrity** |
| **tfthushaar/razorpay_buildathon** | T04 | Partly — 120 real-LLM records; 50k is mock | Yes; mock output barred from earning trust | **Yes** — Wilson-lower-bound earned autonomy + 2 anti-gaming guards | 8 | 8 | 8 | 9 | 9 | 8 | **9** | **Best bounded-autonomy mechanism in field** |
| **shubhambhattog/recoup** | T03 | Harness real & reproduced; **baseline is straw-man** | Deliberately near-zero (0 model calls default) — honest | Yes, but `postOptOutContacts` is a hardcoded `0` | 8 | 8 | **9** | 8 | 9 | 8 | **9** | Excellent engineering, one fatal baseline |
| **abhinav-phi/reflex** | T03 | Protocol pre-registered & tagged; **holdout scores 1.0 (circular)** | Rules-first + real output validator; was a noop until Amendment 2 | Yes — shield, ledger, published missed gate | 6 | 8 | 9 | 8 | 8 | 9 | 7 | Research-grade method, circular target |
| **Adarsh-Me/Agent-Audit** | **T01** | Instrument validated (**8 tests pass on fresh clone**); committed run is a **mock**, rerun delta = 0 | Yes — LLM choice *is* the measured object | **Yes** — spend cap / SKU whitelist / test-mode-only, distinct policy codes | **9** | 6 | 8 | 7 | **9** | 8 | 8 | **Best problem framing; mock evidence** |
| **komallbarhate/AI-Risk-Manager** | T02 | Reproduces byte-identically — but **one subtraction beats the model** | No LLM (well argued); TreeSHAP real | Real cost matrix + append-only SHAP audit log | 6 | 4 | 7 | 4 | 7 | 6 | 7 | Real apparatus, tautological target |
| **Sivanandinisaravanakumar/rto-risk-agent** | T02 | README numbers **reproduce exactly** — but threshold tuned on `y_test`, circular labels | No LLM (grep-confirmed); RF recovers the author's own formula | Partial; metrics threshold ≠ agent threshold | 7 | 4 | 5 | 4 | 7 | 3 | 6 | Good taste, circular data |
| **VeerGetGit/RazorPay_agentic_checkout** | **T01** | **NO — `evals/` is a 0-byte `__init__.py`; zero assertions** | **No — decorative**; 457-line regex file does the work | **NO** — "Payment successful" on an unpaid Order | 6 | 3 | 4 | 2 | 5 | 3 | 4 | Passes every surface heuristic, measures nothing |
| **SaxenaLakshya/AI-Risk-Manager** | T02 | **NO — training notebook deleted; depth-3 tree recovers 99.18%** | **No LLM at all**; "Claude layer" field dropped before scoring | **NO** — no audit trail, no auth | 4 | 2 | 3 | 2 | 3 | 2 | 3 | **NOT_USEFUL — theatre** |
| MrBurber/KinGraph | T02 | Has real ground truth & dev/test discipline — but **deleting all identifier edges reproduces 100/100 byte-identically** | **No — absent**; `llm_fn` defaults to `None`, "embedding" is `rng.normal(0,1,16)` | **No audit trail at all** | 7 | 2 | 6 | 3 | 6 | 4 | 7 | Honest writeup, inert premise |

## Selected patterns — ranked by value to us

| # | Pattern | Type | Source | Score |
|---|---|---|---|---|
| 1 | **Two-tier validation: real RCT data before synthetic** | `EVALUATION_PATTERN` | vaibhav375 `RESULTS.md`, `experiments/tier1_*` | 10 |
| 2 | **Mechanically-enforced AI exclusion zone** (AST test fails build) | `ARCHITECTURE_PATTERN` | vaibhav375 `tests/test_kernel_no_llm_imports.py` | 10 |
| 3 | **Earned, revocable autonomy via Wilson lower bound** | `ARCHITECTURE_PATTERN` | tfthushaar `calibration/wilson.py`, `calibrator.py` | 10 |
| 4 | **Anti-gaming guards on an earned-trust gate** (provider-aware + distinct-case floor) | `EVALUATION_PATTERN` | tfthushaar `calibrator.py:17-52` | 10 |
| 5 | **Pre-registered eval protocol with git-tagged amendments** | `EVALUATION_PATTERN` | abhinav-phi `eval/PROTOCOL.md` | 10 |
| 6 | **Planted-bias instrument validation** (V1–V6) | `EVALUATION_PATTERN` | Adarsh-Me `tests/validation/test_validation_suite.py` | 9 |
| 7 | **Both-directions tamper test** (a `return False` verifier passes naive tests) | `FAILURE_HANDLING_PATTERN` | vaibhav375 `tests/test_ledger_tamper.py` | 9 |
| 8 | **Incremental-vs-gross accounting w/ no-contact holdout** | `SOLUTION_PATTERN` | vaibhav375 `RESULTS.md` | 9 |
| 9 | **Cost-asymmetric output validator** (the Hinglish loophole) | `COMPONENT_PATTERN` | abhinav-phi `packages/prompts/validators.py:24-37` | 9 |
| 10 | **Publish a pre-registered gate you MISSED** | `EVALUATION_PATTERN` | abhinav-phi `docs/limitations.md` §2 | 9 |
| 11 | **Adversarial proxy-label validation with a control cohort** | `DATA_PATTERN` | komallbarhate | 9 |
| 12 | **Calibrate only where AI judgment is exercised** | `COMPONENT_PATTERN` | tfthushaar `calibrator.py:1-15` | 9 |
| 13 | **Distinct-policy rejection codes + server-resolved amounts** | `COMPONENT_PATTERN` | Adarsh-Me `routers/payments.py:53-113` | 8 |
| 14 | **Cluster bootstrap for correlated trials** | `MODEL_PATTERN` | Adarsh-Me `stats/bootstrap.py:15-63` | 8 |
| 15 | **One decision engine, two executors, one entry point** | `ARCHITECTURE_PATTERN` | shubhambhattog `Executor` seam | 8 |
| 16 | **Stopping-rule reachability guard** | `COMPONENT_PATTERN` | vaibhav375 `test_all_stopping_rules.py:197` | 8 |
| 17 | **Validate-or-discard LLM guardrail** (unsafe output thrown away, not retried; DI-testable with no key; author ships his own bypass as a test) | `FAILURE_HANDLING_PATTERN` | MrBurber `evidence_agent.py` | 9 |
| 18 | **Component ablation as a published result** (delete each signal, re-measure — if the metric does not move, the component is inert) | `EVALUATION_PATTERN` | *derived — nobody in the field does this* | 10 |
| 19 | **Publish your own inconvenient cost finding** (cost-minimisation said "never flag": FP ₹275k vs FN ₹21k — published anyway) | `EVALUATION_PATTERN` | Sivanandini cost-weighted threshold table | 8 |

## Rejected patterns — looked good, do not reuse

| Anti-pattern | Where | Why rejected |
|---|---|---|
| Recorded demo run from a deterministic mock | Adarsh-Me `demo/manifest.json` | Rerun metrics byte-identical to original ⇒ the "proof of improvement" delta is exactly 0 |
| Straw-man baseline | shubhambhattog `baseline.ts:27` vs `generate.ts:80` | Baseline retries at +1h/+2h; funds arrive t+12–96h ⇒ 0% recovery **by construction**; 6.38× uplift is two constants the author chose |
| `accuracy: 1.0`, perfectly diagonal confusion matrix | abhinav-phi `eval/results/dx_holdout/` | Labels drawn from the same taxonomy the rules match — measures the generator |
| Headlining a mock-provider batch size | tfthushaar "50,000" | Real-LLM batch is 120; invites the reviewer to find the 1000× gap himself |
| Static shields.io "164 tests passing" badge | abhinav-phi README | Asserts nothing; not a CI badge |
| `true_label` on the object the classifier consumes | tfthushaar `ScoredDecision` | Unnecessary leakage surface even if never read on that path |
| "Calibrated confidence bands" | komallbarhate | `CalibratedClassifierCV` imported and never called; `calibrated_probability` byte-identical to raw score |
| Deleting the training notebook | SaxenaLakshya commit `6b332c9` | Nothing reproduces; metrics become unfalsifiable text |
| Multi-signal threat-model claims | MrBurber `FINDINGS.md:66-68` | Claims an attacker "must defeat all signals"; requires exactly one — the author wrote the disproof himself without noticing |
| Writing an operating threshold you never read | Sivanandini `operating_threshold.pkl` | Metrics reported at 0.25; agent runs at 0.28/0.38 (`agent.py:39`) — nobody measured precision at the band the agent actually escalates on |
