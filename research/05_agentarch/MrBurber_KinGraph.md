# AgentArch — MrBurber/KinGraph

| Field | Value |
|---|---|
| Repository | `MrBurber/KinGraph` |
| Local path | `/tmp/rzp_scratch/MrBurber_KinGraph` |
| Competition | Razorpay AI Buildathon — Track 02, AI Risk Manager (defense-only abuse-ring detection) |
| Placement | UNDETERMINED — submission only; no placement signal in repo or git history |
| Size | 729 LOC Python across 7 files; 10 commits |
| Verdict class | `FAILURE_HANDLING_PATTERN` (the guardrail) + `EVALUATION_PATTERN` (partial) — the detector itself is `NOT_USEFUL` |

---

## Original Problem (as stated)

Fraud rings farm signup/referral bonuses with multiple fake accounts. `README.md:5-12`:
*"The hard part isn't spotting shared identifiers (device, IP, address, phone) — it's
telling a real fraud ring apart from a real family sharing a delivery address."*

That is the correct hard problem. It is also, as this analysis will show, the problem
the code does not solve.

## Original Solution (as claimed)

Cluster accounts on **both** shared identifiers **and** behavioural-embedding
similarity, so a household (shared address, independent behaviour) is separated from
a ring (shared identifiers *and* matching behaviour). Package flagged rings as
evidence for a human via an LLM narrative layer with a hard defense-only guardrail.

---

## Actual Architecture (from code)

Batch CLI scripts. No service, no API, no DB, no auth, no network I/O of any kind.

| Stage | File:line | What actually happens |
|---|---|---|
| Data | `data/generate_accounts.py:8-96` | 2,500 accounts/split × 2 splits (dev seed=1, test seed=2). Plants 40 rings + 100 households per split. Ground truth written to a separate `ground_truth_labels.csv`. |
| Graph | `src/graph_builder.py:12-23` | Identifier edges: `groupby` each of 4 identifier columns, all pairs within a group, accumulating a `set` of which columns matched. |
| Graph | `src/graph_builder.py:26-38` | Embedding edges: full `cosine_similarity(vectors)` O(n²), edge iff `sim >= 0.9`. |
| Detect | `src/detect_rings.py:10-14` | `edge_weight = len(shared_identifiers) + (3 if embedding_similarity present)`. |
| Detect | `src/detect_rings.py:17-38` | Drop edges below `min_edge_weight=3.0`, take `nx.connected_components`, keep components of size ≥ 3. |
| Eval | `src/evaluate.py:9-72` | Pairwise precision/recall over ground-truth ring co-membership, plus household false-flag rate and clean-account false-flag count. |
| Sweep | `src/threshold_sweep.py:15-40` | 3×4 grid over `similarity_threshold × min_edge_weight`, **dev split only**. |
| Evidence | `src/evidence_agent.py:24-92` | Regex blocklist + optional semantic classifier, with deterministic template fallback. |
| Demo | `src/demo.py:39-94` | Prints one ring and one household side by side. |

**State:** CSV files on disk. **Communication:** function calls. **AuthN/AuthZ:** none.
**Validation:** none beyond a `FileNotFoundError` at `kaggle_graph_compare.py:17`.

---

## 1. IS THE MEASUREMENT REAL OR THEATRE?

**Verdict: THEATRE, and provably so. The 100% / 100% / 0% is a tautology of the data
generator — the detector is measuring the width of a gap the author's own RNG left
open. But this is the rare case where the author half-said so himself.**

### (a) Is there ANY ground truth? — YES, and this is done right.
Unlike most unsupervised clustering demos, KinGraph does have real labels:
`data/generate_accounts.py:90-94` writes `ring_id` / `household_id` per account to a
file the detector never opens (verified: `detect_rings.py` and `graph_builder.py`
read only `accounts_features.csv`). `evaluate.py:14-33` computes **pairwise**
precision/recall over ring co-membership pairs — which is the correct metric for
clustering where predicted cluster IDs don't align with truth IDs. The evaluator also
reports household false-flag rate (`evaluate.py:42-45`) and clean-account false flags
(`evaluate.py:47-53`) separately.

The measurement *apparatus* is genuinely well built. The problem is what it is
measuring.

### (b) Train/test discipline — GOOD, and better than most.
Two independently seeded populations (`generate_accounts.py:101-104`, dev seed=1 /
test seed=2). The threshold sweep is dev-only (`threshold_sweep.py:8`, hardcoded to
`data/dev`), and `FINDINGS.md:174-193` states the operating point was chosen from the
dev curve. No threshold was fitted on test. This is exactly the discipline the RTO
repo failed at.

### (c) Reproducible? — YES. Verified by execution.
Ran `python3 detect_rings.py test && python3 evaluate.py test`:
```
Flagged 40 candidate rings, 194 accounts total.
recall 100.0%, precision 100.0%, households wrongly flagged: 0/296 (0.0%)
```
Byte-identical to the committed `data/test/eval_report.json` and to
`README.md:138-142`. Runs clean, no crash, no setup beyond four pip packages.

### (d) CIRCULAR / SELF-FULFILLING — YES. FATAL. Here is the proof.

Read the generator and the detector side by side.

**Generator, `generate_accounts.py:17`:** every account gets
`embeddings = rng.normal(0, 1, size=(n, 16))` — i.i.d. Gaussian.
**Generator, `generate_accounts.py:38, 46`:** each ring gets one
`operator_embed = rng.normal(0,1,16)`, and every member is overwritten with
`operator_embed + rng.normal(0, 0.06, 16)`.

Ring members are therefore points scattered at σ=0.06 around a shared centroid of
norm ≈4. Non-members are independent 16-d Gaussians, whose pairwise cosine similarity
concentrates near 0.

**Detector, `graph_builder.py:36`:** edge iff `cosine >= 0.9`.

I measured the actual separation on the held-out test split:

```
same-ring pairs   n=422        min cosine = 0.9842   mean = 0.9960
all other pairs   n=3,123,328  max cosine = 0.9064   mean = 0.0001
SEPARATION GAP: (0.9064, 0.9842) — EMPTY
```

**Every threshold in a 0.078-wide window yields exactly 100% precision and 100%
recall.** There is no classification problem here. There is a `>` against a number
the generator guaranteed would work.

**And it gets worse — the identifier half of the system is dead code at the shipped
operating point.** `detect_rings.py:10-14` adds `+3` for the mere presence of an
embedding edge, and `min_edge_weight=3.0`. So:
- Any embedding edge (weight ≥ 3) survives **alone**.
- A household sharing address + IP has `len(shared_identifiers)==2` → weight 2 →
  **dropped**.
- Rings share exactly one identifier pattern (`generate_accounts.py:36`) → weight 1
  → dropped, and are recovered *entirely* by the embedding edge.

I ran the ablation: rebuilt the graph with **all identifier edges removed**, keeping
only `build_embedding_edges(df, 0.9)`, on the test split:

```
EMBEDDING-EDGES-ONLY:
  pairwise_precision 1.0, pairwise_recall 1.0, pairwise_f1 1.0
  household_accounts_wrongly_flagged 0/296
  clean_accounts_wrongly_flagged 0/2010
```

**Byte-identical to the headline result.** Deleting `build_identifier_edges()`
entirely — the four identifier columns, the `groupby`, the pair accumulation, the
whole "shared device/IP/address/phone" premise that the project is *named after* —
changes nothing.

This collapses three separate claims at once:
1. `README.md:8-10` "clusters accounts using **both** shared identifiers **and**
   behavioral-embedding similarity" — the identifier half contributes zero.
2. `README.md:155-159` threat model: *"deliberately requires multiple independent
   signals ... so an attacker has to defeat all of them simultaneously"* — false. It
   requires **one** signal. An attacker who varies behaviour defeats the entire
   system; an attacker who shares a device and varies behaviour is invisible.
3. `FINDINGS.md:66-69` "requiring `min_edge_weight >= 3` (at least one identifier
   plus a behavioral match, **or a strong behavioral match alone**)" — the author
   wrote the disjunction that makes his own system single-signal, in parentheses,
   and did not follow it through to the threat-model contradiction.

The "hard negative" households are separated not because the algorithm is clever but
because their embeddings were never touched by the generator. `demo.py` output on a
real household: `Avg behavioral similarity: -0.34`. That is not a near-miss the
detector resolved; it is i.i.d. noise.

The threshold sweep (`data/threshold_sweep_dev.csv`) reads as a real curve —
precision 0.471 → 0.734 → 1.000 → 1.000 as weight goes 1→4 — but every point on it
is a function of the same planted margin. The `min_edge_weight=4.0` row (recall
collapses to 0.621) that `FINDINGS.md:189-193` presents as "the real tradeoff" is
just the point where rings whose members failed the 85%/90% identifier-copy dice roll
(`generate_accounts.py:48-53`) lose their second signal.

### (e) The author's own honesty — this is genuinely unusual and must be credited.

`FINDINGS.md:71-78`: *"Why a perfect score here isn't suspicious, but also isn't the
whole story: the synthetic data was constructed with a clean separating signal by
design ... it is not evidence that real-world fraud is this cleanly separable."*

He names the circularity. He also:
- Ran a real-data check (Kaggle IEEE-CIS), got **0.67x lift — worse than baseline**,
  and published it (`FINDINGS.md:90-98`).
- Ran a second attempt (joint `card1+card2+addr1+D1` UID), got 1.10x / 0.91x, and
  called it *"noise, not a real signal"* (`FINDINGS.md:100-103`).
- Diagnosed *why* correctly: `addr1` has 255 unique values, `P_emaildomain` 59,
  `DeviceInfo` is OS strings — *"identity resolution quality is the actual bottleneck
  for this class of detector, not the clustering algorithm"* (`FINDINGS.md:105-114`).
- Disclosed the O(n²) scalability wall and the ANN caveat that sklearn's cosine
  `NearestNeighbors` is still brute-force internally (`FINDINGS.md:203-210`).
- Disclosed that the semantic guardrail classifier is a stub (`FINDINGS.md:227-231`).

That is more honest self-reporting than the rest of this corpus combined. Track 02
asks for "honest metrics including false-positive cost" and the rubric's "what broke,
and what you did about it" — `FINDINGS.md` is a serious attempt at both.

**But the honesty is quarantined.** `README.md:136-142` leads with the 100/100/0
table under the heading "Current status". The Kaggle null result is a link. And
critically: the author never took the one extra step — running the ablation I ran
above — that would have shown him his identifier layer does nothing. The disclosure
covers the flaw he could see. The bigger flaw was one `for` loop away.

### (f) A methodological flaw in the Kaggle check the author did not catch
`kaggle_graph_compare.py:66` computes lift as the **unweighted mean of per-cluster
fraud rates**, not the pooled fraud rate over clustered transactions. With many
size-3 clusters this is a high-variance, biased estimator. Worse,
`kaggle_graph_compare.py:27-28` random-samples 50k of ~590k rows *before* building
the graph — which shreds the identity groups the method depends on (a genuine 3-row
group survives intact with probability ≈ (1/12)², ~0.7%). The null result is
therefore partly a sampling artifact, not purely a data-quality finding. The
conclusion drawn (`FINDINGS.md:105-114`) is still defensible on the cardinality
evidence, but the experiment does not support it as cleanly as claimed.

---

## 2. IS THE AI LOAD-BEARING OR DECORATIVE?

**There is no AI in this repository. Not decorative — absent.**

Grep across all files for `openai|anthropic|gemini|groq|ollama|langchain|transformers|api_key|requests|httpx`: **one** hit, and it is a comment —
`evidence_agent.py:117`: `# real LLM call here (e.g. an Anthropic/OpenAI call)`.

No SDK. No `requirements.txt` at all (setup is four packages listed in prose at
`README.md:99`: `numpy pandas networkx scikit-learn` — none of which is an LLM
client). No API key handling, no `.env`, no config.

### The LLM layer that does not exist
`README.md:65-70`: *"**`src/evidence_agent.py`** — turns a flagged ring's evidence
into a narrative note for a human analyst **via an LLM call**."*

`evidence_agent.py:77`: `def generate_investigation_summary(ring_evidence, llm_fn=None, classifier_fn=None)`.
`evidence_agent.py:78-80`: if `llm_fn is None` → `deterministic_fallback_summary()`.

`llm_fn` is dependency-injected and **never supplied with a real implementation
anywhere in the repo**. The `__main__` block passes four hand-written stub functions
(`evidence_agent.py:104-119`) that return string literals. And `demo.py:81` —
the single command the README advertises as *"the fastest way to see the whole
pipeline work end to end"* (`README.md:28`) — calls
`generate_investigation_summary(ring_evidence)` with **no** `llm_fn`.

I ran `demo.py`. The "Investigation note for analyst" it prints is verbatim the
f-string at `evidence_agent.py:67-74`. **The LLM path is never executed, in the demo
or anywhere else.**

To be fair: `FINDINGS.md:227-231` discloses the *classifier* stub. It does not
disclose that the primary `llm_fn` is equally absent, and the README asserts the LLM
call as fact.

### Would a for-loop / SQL GROUP BY do this?
Almost entirely, yes — and the README's own framing invites the question.

- `build_identifier_edges` (`graph_builder.py:12-23`) is literally
  `GROUP BY device_id HAVING COUNT(*) > 1`, four times, unioned. And per §1(d) it is
  dead weight at the operating point.
- `nx.connected_components` (`detect_rings.py:31`) is union-find. Not AI. Not even
  machine learning.
- `cosine_similarity >= 0.9` (`graph_builder.py:36`) is one line of numpy.

The word "behavioral embedding" is carrying enormous weight for something that is,
in this repo, **a column of numbers the generator wrote**. There is no encoder, no
model, no featurisation step — `generate_accounts.py:17` produces `embed_0..embed_15`
from `rng.normal`. In a real system, producing that embedding is 95% of the work and
the only place ML would live. It is precisely the part that is stubbed out.

### Deliberate non-use of AI — the one place this scores well
`evidence_agent.py:66-74` `deterministic_fallback_summary` is an explicit,
argued choice to render safety-critical output from a template rather than a model,
and `FINDINGS.md:122-141` explains why. That is a direct hit on the rubric's
*"the right tool in the right place, and where you chose not to use one."* It is
undercut only by the fact that the template is not the fallback — it is the **only**
path that ever runs.

---

## 3. FOUR PILLARS

### (a) Does it run? — YES. Cleanly. Best in this pair.
Verified end to end on a clean machine:
- `python3 src/demo.py` → correct output, both scenarios, no crash.
- `python3 src/detect_rings.py test && python3 src/evaluate.py test` → reproduces
  the README table exactly.

- **Deps pinned:** NO — and there is **no `requirements.txt`, no `pyproject.toml`,
  no `setup.py`** at all. Setup is four bare package names in a README code block
  (`README.md:96-100`). A reviewer must copy-paste prose.
- **Model artifact:** N/A — there is no model. Nothing to retrain.
- **Seed data:** YES, and this is the strongest "does it run" property in the corpus:
  `data/dev/` and `data/test/` ship with features, ground truth, predictions **and**
  `eval_report.json` already committed. A reviewer can verify the headline number
  without running anything, then re-run and watch it match.

### (b) Structured? — YES. The cleanest structure of the two.
Seven files, each with one job, longest is 141 lines. Real dependency injection
(`llm_fn`, `classifier_fn` as parameters). Functions are pure and take explicit
arguments — `detect(features_csv, similarity_threshold, min_edge_weight)`
(`detect_rings.py:25`) is properly parameterised, which is exactly why
`threshold_sweep.py:21` can call it in a loop without duplicating logic. Compare the
RTO repo, which reimplemented its sweep three times.

Detector/evaluator separation is enforced by convention and stated at
`generate_accounts.py:119`. Held.

### (c) Deliberate non-use of AI — **the strongest thing in this repo.**
`FINDINGS.md:122-141` argues the case explicitly: the fallback narrative is
*"built purely from structured fields — no free-form text at all — so the tool cannot
emit anything but read-only evidence regardless of what the model tries to produce."*
Written down, argued, and implemented. Most repos in this corpus have this
architecture by accident and get no credit; this one claims it correctly.

### (d) Real failure handling — thin, but the one that exists is the right one.
Total exception handling in the repo: `evidence_agent.py:85-92` (catch
`ActionLeakageError` → deterministic fallback) and `kaggle_graph_compare.py:17`
(missing-file error with a helpful message including the download URL).

Missing everywhere else: no validation that `accounts_features.csv` has `embed_*`
columns (`graph_builder.py:27` returns `[]` silently if absent → empty graph → zero
predictions → **`evaluate.py` reports precision 0.0 rather than erroring**), no
guard on `predictions.csv` being empty (`threshold_sweep.py:22-23` handles it,
`evaluate.py:81` does not), no memory guard on the O(n²) matrix that
`FINDINGS.md:143-151` identifies as the scalability wall.

**Zero tests.** No test file, no `assert`, no CI. The `__main__` blocks in
`evidence_agent.py:95-141` are the closest thing — four hand-checked cases whose
results are printed, not asserted. `FINDINGS.md:131-135` calls this "verified with
three cases", which is a printout, not a verification.

---

## 4. AUDIT TRAIL / BOUNDED ACTIONS / STOPPING RULES / DEFENSE-ONLY

| Requirement | Status | Evidence |
|---|---|---|
| **Defense-only** | **COMPLIANT, and enforced in code** | The entire action space is "write a string to stdout". Nothing can block, suspend, charge, or message. Genuinely offense-incapable. |
| **Bounded actions — the guardrail** | **REAL, and the best code in the repo** | `evidence_agent.py:8-29`: 10 compiled regex patterns; `validate_narrative_only` raises `ActionLeakageError` on any match. `evidence_agent.py:85-92`: caught → output **discarded** and replaced by a template built only from structured fields. The LLM's text cannot reach the analyst if it contains action language. |
| **Guardrail honesty** | **REAL** | `FINDINGS.md:137-141` explicitly states the keyword blocklist misses paraphrases, and `evidence_agent.py:110-111` ships a deliberate counter-example (`"should probably no longer be able to transact"`) that defeats the regex. Building your own bypass into your test cases is a genuinely mature move. |
| **Guardrail — second layer** | **WIRING ONLY** | `validate_no_implied_action_semantic` (`evidence_agent.py:59-63`) is real code, but its only caller passes `stub_semantic_classifier` (`evidence_agent.py:113-119`), which is `return "YES" if "no longer be able to transact" in prompt else "NO"` — a substring match against the exact demo string. Disclosed at `FINDINGS.md:227-231`. |
| **Audit trail** | **ABSENT** | No log file, no JSONL, no decision record. Nothing persists why an account was flagged. `predictions.csv` stores `(account_id, predicted_ring_id)` and nothing else — no score, no evidence, no timestamp, no threshold. The `fallback_reason` field (`evidence_agent.py:92`) is returned to the caller and **never written anywhere**. Track 02 asks to "show the audit trail"; this repo has none. |
| **Stopping rules** | **ABSENT** | No cap on flags per run, no volume circuit-breaker, no escalation ceiling. |
| **Human-in-the-loop** | **PROSE ONLY** | `evidence_agent.py:73` prints *"Routed to analyst queue for manual review."* There is no queue. |

The guardrail is the real asset. The audit trail — the thing the track names
explicitly — is the conspicuous hole.

---

## 5. THE SINGLE BEST ENGINEERING IDEA

**`FAILURE_HANDLING_PATTERN` — validate-or-discard: an LLM output that fails a safety
check is not repaired, retried, or re-prompted; it is thrown away and replaced by a
deterministic template built only from structured fields.**

Source: `evidence_agent.py:24-29` (validator), `evidence_agent.py:66-74` (template),
`evidence_agent.py:85-92` (the swap), `evidence_agent.py:59-63` (optional second
layer).

**Why this is the right pattern and not the obvious one:** the instinctive move when
an LLM emits something unsafe is to retry with a stronger prompt, or to strip the
offending phrase. Both leave the model in the loop and both are unbounded. This
design makes the failure mode *structurally* safe: the worst case is a boring
template containing only fields the system already computed. Combined with dependency
injection (`llm_fn` as a parameter, `evidence_agent.py:77`), the whole thing is
testable with zero API calls — you can prove the guardrail holds against a
deliberately hostile model by passing one.

**Layering is right too:** cheap deterministic check first (regex, `:24-29`),
expensive semantic check second and optional (`:59-63`), both feeding one fallback.

**Razorpay applicability: direct and high.** Any LLM that drafts text a human will act
on near money — dispute responses, chargeback narratives, collections messages,
merchant notifications. The rubric's "bounded and gated" and "would you trust it" are
both answered by "the model cannot emit anything that isn't first proven safe, and if
it fails we degrade to a template".

**How to independently reimplement (~60 lines):**
1. Define the *forbidden* output class as compiled regex (verbs of action, an
   `^ACTION:` line shape) — not a whitelist.
2. `validate(text) -> text` that raises a typed error naming the matched pattern.
3. `fallback(evidence: dict) -> str` built only from structured fields, no free text.
4. `generate(evidence, llm_fn=None)` returning `{narrative, source, fallback_reason}`
   — the provenance tag is what makes it auditable.
5. **Improve on KinGraph:** (a) *persist* `fallback_reason` and `source` to an audit
   log — KinGraph computes both and drops them on the floor; (b) alarm on fallback
   rate, because a model that trips the guardrail 40% of the time is a live incident;
   (c) ship real tests, not `__main__` printouts.

**Risks:** a keyword blocklist is bypassable by paraphrase — the author says so and
proves it. Do not present it as complete coverage. Also: if the LLM path is never
exercised, the guardrail is untested in production conditions, which is exactly
KinGraph's situation.

---

## 6. THE WEAKEST THING — the 30-second hole

**Delete `build_identifier_edges()` and every headline number stays identical.**

The project is named KinGraph. `README.md:5-12` says the hard part is separating a
ring from a family sharing an address. `README.md:155-159` claims the detector
"deliberately requires multiple independent signals ... so an attacker has to defeat
all of them simultaneously."

At `min_edge_weight=3.0`, the `+3` bonus for any embedding edge
(`detect_rings.py:12-13`) means a single behavioural-similarity edge clears the bar
alone, while a household's two shared identifiers score 2 and are discarded. I ran
the ablation on the held-out test split: embedding edges only, no identifiers at all
→ **precision 1.0, recall 1.0, households 0/296, clean accounts 0/2010.** Identical.

So the answer to *"how does it tell a ring from a family?"* is: **it doesn't look at
the address at all.** It looks at a 16-dimensional vector that the data generator
drew from `N(operator_centroid, 0.06)` for rings and `N(0, 1)` for everyone else,
leaving an empty gap between 0.9064 and 0.9842. The detector is a `>` against a
number inside that gap.

A Razorpay engineer asks: *"what happens when a ring uses different devices per
account?"* — the system is unaffected, because it never used devices. *"What happens
when a ring randomises its behaviour?"* — the system detects nothing at all, because
behaviour is the only signal. The stated threat model is inverted.

Runner-up: the README asserts an LLM call (`README.md:66`) that does not exist
anywhere in the repository.

---

## 7. EVERY OVERCLAIM — README says X, code shows Y

| # | README / FINDINGS says | Code shows | Severity |
|---|---|---|---|
| 1 | "clusters accounts using **both** shared identifiers **and** behavioral-embedding similarity" (`README.md:8-10`) | At `min_edge_weight=3.0` identifier edges are filtered out entirely. Ablation removing all identifier edges reproduces 100/100/0 exactly. | **CRITICAL** — the central architectural claim. |
| 2 | Threat model: "deliberately requires **multiple independent signals** ... an attacker has to defeat all of them simultaneously" (`README.md:155-159`) | Requires exactly one: cosine ≥ 0.9. Defeating behavioural similarity defeats the whole system. | **CRITICAL** |
| 3 | "turns a flagged ring's evidence into a narrative note ... **via an LLM call**" (`README.md:65-66`) | No LLM SDK, no API key, no HTTP client anywhere. `llm_fn` defaults to `None` and `demo.py:81` never supplies one. Every note ever produced is the f-string at `evidence_agent.py:67-74`. | **CRITICAL** |
| 4 | "the hard part ... is telling a real fraud ring apart from a real family" (`README.md:6-8`) | The hard case is trivial by construction: household embeddings are untouched i.i.d. noise. Measured household similarity in `demo.py` output: **-0.34**. Not a near miss. | **HIGH** |
| 5 | 100% precision / 100% recall / 0% household false-flag (`README.md:138-142`) | Reproduces exactly, but is a tautology: measured separation gap (0.9064, 0.9842) is empty, so *any* threshold in a 0.078 window scores 100/100. | **HIGH** (partly self-disclosed at `FINDINGS.md:71-78`) |
| 6 | "behavioral-embedding similarity" (`README.md:9`) | `embed_0..15` come from `rng.normal(0,1,16)` (`generate_accounts.py:17`). There is no encoder, no featurisation, no model. The embedding — the only real ML in the design — is stubbed. | **HIGH** |
| 7 | "Verified with three cases" / "Verified with four cases" (`FINDINGS.md:131`, `:221`) | `__main__` `print()` statements. No `assert`, no test file, no CI in the repo. | **MEDIUM** |
| 8 | "Ground truth ... the detector never reads" (`README.md:41-42`) | True for `detect_rings.py`/`graph_builder.py`. But `demo.py:41,46-59` reads `ground_truth_labels.csv` to *choose which* ring and household to display — the demo is label-guided cherry-picking, benign but undisclosed against a claim stated that strongly. | **LOW** |
| 9 | Kaggle check: "1.10x at n=100k, 0.91x at n=200k — i.e. noise" (`FINDINGS.md:100-103`) | Lift is the unweighted mean of per-cluster rates (`kaggle_graph_compare.py:66`), not pooled; and `--sample` random-samples rows *before* graph construction (`:27-28`), shredding the identity groups the method needs. The null result is partly a sampling artifact. Conclusion survives, experiment doesn't support it as stated. | **MEDIUM** |
| 10 | "`min_edge_weight >= 3` (at least one identifier plus a behavioral match, **or a strong behavioral match alone**)" (`FINDINGS.md:66-68`) | Accurate — and directly contradicts overclaim #2 three files away. The author wrote the disproof of his own threat model and didn't notice. | **HIGH** (internal contradiction) |
| 11 | "ANN alternative to brute-force" (`FINDINGS.md:195-210`) | Honest — the author states sklearn's cosine `NearestNeighbors` is still brute-force internally and calls it "a demonstrated integration point, not a claimed complexity fix". **Not an overclaim.** Listed for completeness. | **NONE** |
| 12 | "flags and explains, it never auto-blocks" (`README.md:11-12`) | Verified true. Nothing in the repo can take an action. **Not an overclaim.** | **NONE** |

---

## Candidate Patterns

### PATTERN A — Validate-or-discard LLM safety guardrail with deterministic fallback
- **Type:** `FAILURE_HANDLING_PATTERN`
- **Source:** `evidence_agent.py:8-29`, `:59-63`, `:66-74`, `:77-92`
- **Why strong:** Structurally bounds an LLM's blast radius: unsafe output is thrown
  away, not repaired. Dependency injection makes it testable without an API key.
  Two-layer (cheap regex → expensive semantic) is the right cost ordering.
- **Why relevant:** "every money action explainable, bounded and gated" is Track 03's
  verbatim bar and the rubric's "would you trust it".
- **Razorpay applicability:** Dispute responder, collections messaging, merchant
  comms — anywhere an LLM drafts text near money.
- **Reimplement:** ~60 lines (see §5). **Add what KinGraph lacks: persist
  `source` + `fallback_reason` to an audit log and alarm on fallback rate.**
- **Risks:** Blocklists are bypassable; do not oversell. An unexercised guardrail is
  an untested guardrail.
- **Score: 8/10** — the highest-value single artifact across both repos reviewed.

### PATTERN B — Hard-negative-first synthetic evaluation with held-out ground truth
- **Type:** `EVALUATION_PATTERN`
- **Source:** `generate_accounts.py:62-76` (households), `evaluate.py:42-53`
- **Why strong (as intent):** Planting the *confusable* class explicitly and
  reporting its false-flag rate as a named first-class metric —
  `household_false_flag_rate` (`evaluate.py:67-69`) alongside
  `clean_accounts_wrongly_flagged` (`:70-71`) — is exactly the "false-positive cost"
  discipline Track 02 demands. Separating "wrongly flagged an innocent" from
  "wrongly flagged a *sympathetic* innocent" is a distinction most builds never make.
- **Why weak (as executed):** The hard negative isn't hard. Households got shared
  identifiers but untouched embeddings, so the signal the detector uses was never
  contested. **The pattern is only worth anything if the negative is placed adversarially
  against the exact signal the detector relies on.**
- **Reimplement:** Keep the metric taxonomy (`evaluate.py:55-72` is a good report
  shape). Replace the generator: make some fraction of rings behaviourally
  *dissimilar*, and some fraction of households behaviourally *similar* (a family
  genuinely does shop alike), and see what the numbers do.
- **Score: 5/10** — good bones, hollow execution.

### PATTERN C — Pairwise precision/recall for cluster-shaped detection
- **Type:** `EVALUATION_PATTERN`
- **Source:** `evaluate.py:9-33`
- **Why strong:** The correct, standard answer to "my predicted cluster IDs don't
  line up with ground-truth IDs" — score co-membership pairs instead. Also reports
  `true_rings_partially_recovered_ge50pct` (`:35-40`) as a second lens, which is the
  operationally meaningful number (a ring is useful to an analyst if half of it is
  surfaced).
- **Razorpay applicability:** Any entity-resolution or linkage detector.
- **Reimplement:** ~25 lines using `itertools.combinations` over grouped labels.
- **Risks:** Pairwise metrics are dominated by large clusters (a size-8 ring
  contributes 28 pairs, a size-3 ring contributes 3). Report per-ring recovery too —
  which this repo does.
- **Score: 7/10**

### PATTERN D — Ship the eval report as a committed artifact
- **Type:** `DATA_PATTERN`
- **Source:** `data/test/eval_report.json`, `data/dev/eval_report.json`,
  `data/threshold_sweep_dev.csv`, written by `evaluate.py:90-91`
- **Why strong:** A reviewer reads the number before running anything, then re-runs
  and watches it match. Removes all trust cost from the headline claim. Cheap.
- **Score: 6/10**

## Rejected Patterns

- **`detect_rings.py` in its entirety.** `connected_components` on a threshold graph
  is union-find; the ablation proves it only ever uses one signal; and
  `edge_weight()`'s `+3` magic number (`:13`) is what silently voids the whole
  identifier layer. Reusing this would import the bug.
- **`build_identifier_edges` (`graph_builder.py:12-23`).** It is `GROUP BY` with an
  O(k²) inner double loop over each group — will explode on a real identifier with a
  high-cardinality-but-not-unique value (a shared corporate IP, a `gmail.com`
  equivalent). `kaggle_graph_compare.py:41` guards this with `MAX_GROUP_SIZE = 200`;
  `graph_builder.py` has **no such guard**. The author learned the lesson in one file
  and did not back-port it.
- **The behavioural embedding.** `rng.normal(0,1,16)`. There is nothing here.
- **`build_embedding_edges_ann` (`graph_builder.py:41-62`).** The author's own
  `FINDINGS.md:203-210` concedes it is still brute-force. It is a placeholder with a
  correct interface — take the interface idea, not the code.

---

## Overall Scores

| Dimension | Score | One-sentence justification |
|---|---|---|
| **Idea** | **7/10** | Ring-vs-household disambiguation is the genuinely hard and genuinely valuable framing in abuse detection, and naming the sympathetic false positive as the core difficulty is real problem taste — docked because the build then solves the easy version. |
| **Solution** | **2/10** | The detector is a cosine threshold against a gap the author's own RNG guaranteed, the identifier half is provably inert, and the LLM evidence layer does not exist. |
| **Architecture** | **6/10** | Genuinely clean: seven single-purpose files, real dependency injection, parameterised `detect()` reused by the sweep, detector/evaluator separation enforced — undermined by a magic `+3` that silently voids a whole subsystem. |
| **AI usage** | **3/10** | There is no AI: no LLM call, no encoder, no model — but `FINDINGS.md:122-141` argues the deliberate-non-use case for the deterministic fallback explicitly and correctly, which is the one clause of the rubric this repo genuinely hits. |
| **Razorpay relevance** | **6/10** | Promo/referral abuse rings are a real Razorpay-adjacent loss class and the guardrail transfers directly to Agent-Studio-style responders, but the detector transfers nothing. |
| **Engineering quality** | **4/10** | Runs cleanly first try with committed seed data and eval artifacts — but zero tests, no `requirements.txt` at all, no audit log, no input validation, and an unguarded O(k²) group expansion the author guarded in a different file. |
| **Demonstrability** | **7/10** | `python demo.py` works, prints a flagged ring and a spared household side by side, and the committed `eval_report.json` matches a live re-run — the single most demo-ready artifact in this pair, right up until someone asks what happens if the ring uses different devices. |

---

## Final AgentArch Verdict

The most intellectually honest writeup in the corpus wrapped around a detector whose
100%/100% is a tautology of its own random-number generator and whose entire
identifier layer can be deleted without changing a single digit — take the
validate-or-discard LLM guardrail, which is the best sixty lines of code either repo
contains, and leave the graph.
