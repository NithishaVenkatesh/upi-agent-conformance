# AgentArch — Adarsh-Me/Agent-Audit

| Field | Value |
|---|---|
| Repository | https://github.com/Adarsh-Me/Agent-Audit |
| Competition | Razorpay AI Buildathon — **Track 01** (AI Growth & Agentic Commerce) |
| Placement | Live field, deadline 5 Sep 2026 |
| Head | `43c4edb`, first commit 2026-08-22, 50 commits, 1 primary author |
| Scratch clone | `/tmp/rzp_scratch/Adarsh-Me_Agent-Audit` |

## Original Problem

"Can AI shopping agents actually see, choose, and buy from your catalog?" Sell-side
**agent-readability audit**: run controlled shopping trials with LLM agents against a merchant
catalog, measure whether the catalog is legible/choosable by agents, convert to a score + a
rupee revenue-at-risk figure, propose human-approved fixes, and re-run to measure the delta.

This is the single most strategically interesting problem framing in the shortlist: it occupies
the **sell-side** of agentic commerce (make the merchant transactable by an AI buyer) rather than
building yet another buying agent.

## Actual Architecture (from code)

- **Trial engine** `backend/app/engine/` — conditions (`conditions.py`), prompt construction
  (`prompts.py`), async provider client (`client.py`), runner (`runner.py`), response cache,
  parser. 640 trials over personas × conditions × models.
- **Provider client** `backend/app/engine/client.py:1-80` — genuinely production-shaped:
  semaphore concurrency, 3 attempts with 1/2/4s backoff, **circuit breaker** (opens after 10
  consecutive failures, 60s cooldown, half-open probe — `client.py:59-80`), a **cost ledger**
  priced per model that aborts the run at `COST_CAP_USD`, and a global min-request-interval
  (`MIN_REQUEST_INTERVAL_S = 3.2`, `client.py:45`) to stay under free-tier rate limits.
- **Statistics** `backend/app/stats/` — `metrics.py` (M1–M6), `bootstrap.py`, `legibility.py`.
- **Remediation** `backend/app/remediate/fixes.py` (189 lines) — propose → per-row human approval
  → mirror gated on zero pending rows.
- **Money actions** `backend/app/routers/payments.py` — Razorpay test-mode payment links.
- **MCP server** `mcp-server/server.mjs` — stdio MCP exposing audit_status / get_report /
  create_payment_link to external AI agents.
- Frontend Next.js + SSE progress stream; Postgres with SQLite fallback.

### The statistics are real

`backend/app/stats/bootstrap.py:15-63` implements a **persona-cluster bootstrap**: it resamples
*personas* with replacement (the correct clustering unit, because trials within a persona
correlate), recomputes **all** metrics on each resample, and takes a percentile CI. The score CI
is genuinely propagated through the same resample rather than assumed — the docstring says so and
the code does it (`bootstrap.py:41-47`). `bootstrap.py:60-62` correctly pads implicit zeros for
SKUs absent from a resample, which is the kind of detail people get wrong.

This is competent applied statistics, not decoration.

### The best thing in the repo: planted-bias instrument validation

`backend/tests/validation/test_validation_suite.py` (177 lines) is a **V1–V6 suite that validates
the measurement instrument against known planted ground truth**:

- `test_v1_monopoly_recovers:57` — all trials pick one SKU ⇒ assert `hhi_norm >= 0.95`.
- `test_v2_uniform_recovers:68` — uniform random choice ⇒ assert `hhi_norm <= 0.05`.
- `test_v3_position_bias_detected:80` — plant an 80% slot-1 preference ⇒ assert
  `top3_capture > 0.25`, `lift > 3.0`, permutation `p_value < 0.001`.
- `test_v4_disjoint_models_low_cosine:105` — two models choosing from disjoint halves ⇒ cosine < 0.1.
- `test_v5_framing_swap_recovered:115` — plant an exact 0.40→0.15 / 0.10→0.35 share swap ⇒ assert
  recovered per-SKU deltas land in [0.20, 0.30].
- `test_v6_wilson_contains_planted_null_rate:150` — plant exactly 30% nulls ⇒ Wilson CI covers 0.30.

**VERIFIED BY EXECUTION.** Fresh clone, Python 3.13, `pip install -r requirements.txt` (exact
pins, `backend/requirements.txt:1-16`), `pytest tests/validation -q` → **8 passed in 1.54s**.

### Money-action bounds are real code, not README words

`SAFETY.md` claims three server-side policies; all three are implemented in
`backend/app/routers/payments.py`:
- `payments.py:53-57` — refuses any key not starting `rzp_test_` → E505 `test_mode_only`.
- `payments.py:105-108` — SKU whitelist → E504 `sku_whitelist`.
- `payments.py:110-113` — per-link spend cap → E503 `spend_cap`.
- `payments.py:202-204` — HMAC webhook signature verification.
Crucially, the enforcement is against the **DB-stored price**: "the agent sends only `run_id` +
`sku` and cannot influence the charged amount" (SAFETY.md) — confirmed by the handler signature.
Each rejection returns a distinct `details.policy`, so an auditor can tell which rule fired.

## What The Code Proves

### Claims VERIFIED
| Claim | Evidence |
|---|---|
| Persona-cluster bootstrap CIs, score CI propagated not assumed | `stats/bootstrap.py:15-63` — correct |
| V1–V6 planted-bias suite exists and is CI-gated | `tests/validation/test_validation_suite.py`; **8 passed on fresh clone** |
| Money actions bounded (cap / whitelist / test-mode-only) | `routers/payments.py:53,105,110` |
| Retry, backoff, circuit breaker, cost cap | `engine/client.py:59-80`, `PRICING_USD_PER_MTOK` |
| Human-gated remediation, nothing auto-applies | `remediate/fixes.py`, E401/409 gate on pending rows |
| Deps pinned exactly | `backend/requirements.txt` |

### Claims CONTRADICTED or OVERCLAIMED — **flagged**

1. **The headline "640 trials with real LLM agents" is, in the committed artifact, a mock.**
   `demo/manifest.json` ends with `"provider": "mock-deterministic"`, `cost_usd: 0.0`,
   `cache_hits: 0`. Generated by `backend/scripts/record_demo_run.py:74`, which sets that label
   explicitly. **To the builder's real credit this is disclosed** in README:113 and
   `Docs/SUMMARY.md:139`. But the README's opening line — "runs 640 randomized, controlled
   shopping trials with real LLM agents" — is the first thing a reviewer reads, and it is not what
   the committed numbers are.

2. **The "verified by re-run" remediation loop proves nothing in the committed artifact.**
   In `demo/manifest.json`, `rerun.metrics` are **byte-identical to `original_run.metrics`** on
   every single field (score 66.11750492590751 → 66.11750492590751; f_task 0.075 → 0.075). The
   measured delta of the human-approved fixes is exactly **zero**. This is an inevitable
   consequence of a deterministic mock provider that ignores the catalog changes — but it means
   the flagship "re-run proves the delta" mechanism has never actually demonstrated a delta.

3. **"Cross-model stability: do GPT/Gemini/Claude agree?"** (README metrics table) is not what
   runs. `backend/app/engine/models.yaml` pins `mimo-v2.5-free` (OpenCode Zen),
   `stealth/ox-alpha`, and `nvidia/nemotron-3.5-lightning:free`. **No GPT, no Gemini, no Claude.**
   The manifest's `gpt-4o-mini` / `gpt-4o` entries are from an older git sha (`247591e8`) and no
   longer match `PRICING_USD_PER_MTOK` in `client.py:31-37`. The stale manifest and the current
   model registry disagree.
   Compounding this: `stability.mean = 1.0000000000000002` in the manifest — *perfect* cross-model
   agreement, which is the signature of a mock where all "models" run identical scripted logic.

4. **The live run's real yield is poor, and only disclosed deep in a doc.**
   `Docs/SUMMARY.md:115`: live run `8db28ce8` = **640 attempted / 234 parse_ok (36.6%)**. A 63%
   parse-failure rate. This is honestly recorded (and the failures surface as
   `parse_failure_rate`, not silence, which is the right design) but it is not in the README.

5. `Docs/FINALSPRINT.md:26` still has an open checkbox: "Regenerate `demo/manifest.json` from the
   live pair — kill `mock-deterministic`." The builder knows. It is unresolved as of head.

**Calibration note:** this repo is *more* honest than most — it labels its own mock, records its
own 36.6% parse rate, and keeps a public gap list. The overclaim is in README emphasis, not in
fabricated data. That distinction matters.

## Candidate Patterns

### P1 — Planted-Bias Instrument Validation `EVALUATION_PATTERN` — **SELECT, highest value**
- **Source:** `backend/tests/validation/test_validation_suite.py:57-177`
- **What:** Before trusting any metric, generate synthetic inputs containing a *known* effect and
  assert the metric layer recovers it. A metric that fails its planted case does not ship.
- **Why strong:** It validates the **instrument**, independently of the model or the data. This is
  the cleanest available answer to Razorpay's "would you trust it" gate, and almost nobody does it.
  It also costs very little — the generators are ~15 lines each.
- **Razorpay applicability:** universal. Any track. Before reporting precision/recall, money
  recovered, or a match rate, prove the code that computes it can recover a planted answer.
- **Reimplement:** for each headline metric, write a generator with a closed-form expected value
  (monopoly → HHI=1; uniform → HHI=0; exactly 30% nulls → Wilson covers 0.30) and assert recovery
  with tolerances. Gate CI on it.
- **Risks:** planted cases can be too easy; they validate the metric, *not* the data pipeline
  feeding it. Must be paired with an end-to-end check.
- **Score: 9/10**

### P2 — Distinct-Policy Rejection Codes `COMPONENT_PATTERN` — SELECT
- **Source:** `backend/app/routers/payments.py:53-113`
- **What:** every money-action refusal returns a distinct code **and** `details.policy` naming the
  rule that fired; enforcement uses the DB-stored price so the agent cannot influence the amount.
- **Why relevant:** directly satisfies T01's "every money action explainable, bounded and gated."
  The "agent supplies an identifier, server resolves the amount" inversion is the important half —
  it removes an entire class of agent-driven price manipulation.
- **Score: 8/10**

### P3 — Cluster Bootstrap for Correlated Trials `MODEL_PATTERN` — SELECT
- **Source:** `backend/app/stats/bootstrap.py:15-63`
- **What:** resample the *cluster* (persona), not the observation, when observations within a
  cluster correlate; recompute all metrics per replicate so the composite score's CI is propagated.
- **Why relevant:** any batch metric we report over repeated trials per entity has this structure.
  Naive per-observation bootstrap understates CI width.
- **Score: 8/10**

### P4 — Provider Cost Ledger with Hard Abort `COMPONENT_PATTERN` — consider
- `client.py` cost ledger + `COST_CAP_USD` → run goes to **partial state, never silent**.
- Partial-never-rendered-as-complete is a genuine honesty primitive.
- **Score: 7/10**

## Rejected Patterns
- **The mock-deterministic recorded run.** Do not copy. A recorded manifest whose rerun is
  byte-identical to its original run is an artifact that actively undermines the mechanism it is
  meant to prove. If we record a demo run, the rerun must show a real, non-zero delta.
- **The 640-trial framing itself.** Trial count is a vanity number; 640 trials against free/stealth
  models with a 36.6% parse rate is ~234 effective observations. Report effective n, not attempts.

## Overall Scores

| Dimension | Score | Justification |
|---|---|---|
| Idea | **9** | Sell-side agent-readability is the least-crowded, most strategically live framing in the whole field. |
| Solution | 6 | The pipeline is complete end-to-end, but the committed evidence is a mock and the flagship rerun-delta is zero. |
| Architecture | 8 | Clean separation (engine / stats / revenue / remediate / routers); real circuit breaker, cache, cost ledger. |
| AI usage | 7 | LLM choice behaviour *is* the measured object, so AI is genuinely load-bearing — but the recorded artifact bypasses it entirely. |
| Razorpay relevance | **9** | Track 01, test-mode payment links, HMAC webhooks, MCP server, explicit money-action bounds. |
| Engineering quality | 8 | Exact pins, tests pass on fresh clone, honest gap list; docstrings explain *why*. |
| Demonstrability | 8 | `make seed-demo && make demo-check` is a zero-key demo path; SSE live trial stream is good video. |

## Final AgentArch Verdict

**The best problem framing in the field wrapped around genuinely competent statistics and a
verified instrument-validation suite — undermined by a committed demo artifact that is a
deterministic mock whose "proof of improvement" rerun produces a delta of exactly zero.**
