# Architecture

**Problem.** A merchant reads Razorpay's docs — *"Guaranteed Collection… you receive payment regardless of customer's later financial situation"* — designs a ship-first flow, delivers, and the debit declines. NPCI OC-228 §2 says the opposite in one sentence: *"The block created shall **not** be treated as the guarantee of payment."* Nothing checks vendor claims against the circulars that authorise them. We found **five** such drifts, across two companies **and this project itself**.

**Invariant.** *No rupee bound is enforced unless it traces to a clause in a checksummed document. The model reads documents. The model never moves money.*

## Run it

```bash
git clone … && cp .env.example .env   # rzp_test_ keys; live keys are refused
make demo      # seeds corpus, starts merchant, runs one bounded purchase   (~90s)
make eval      # 50-claim batch → eval/report.md
make verify    # walks ledger both directions; exits 1 on break
```
`make demo` prints a real refusal: `REFUSED cap_exceeds_authority · OC-228 §5 · "maximum of Rs.10,000 of block limit" · declared ₹25,000`

## Money path — no LLM

```
agent → merchant → GATE ─┬─ verdict PASS?      (conformance)
                         ├─ amount ≤ remaining (integer paise)
                         ├─ block ≤ ₹10,000, ≤ 90d   [OC-228 §5]
                         ├─ retries ≤ 3/24h, timeouts only  [OC-228 §3]
                         ├─ one block per (customer,merchant) [OC-228 §4]
                         └─ idempotency key unused
        fail → ledger.append(REFUSED, code, clause) → 403 {code, clause, quote, remaining}
        pass → razorpay.capture(idem_key) → ledger.append(DECISION) → 200 {receipt}
```
The gate is a pure function of `(request, block_state, verdict, clock)` — `gate/decide.py`, replayable from the ledger. **A gate check that names no clause fails CI** (`.github/workflows/conformance.yml` → `eval/self_conformance.py`).

## Where the LLM is, and is not

| Stage | LLM | Why |
|---|---|---|
| Circular/terms extraction | **yes** | Joint value+unit+scope+**meaning**. Naive regex reads OC-201 §7 and returns ₹15,000 as per-transaction — the error that shipped in Razorpay's own SEP #216 and stood four months. Drift #4 is semantic, not numeric; no regex can reach it. |
| Conformance compare | no | Integer + enum. Decidable; a model would add nondeterminism. |
| Gate, arithmetic, retry count | no | Money path. Must replay identically. |
| Idempotency, hashing | no | Deterministic by definition. |
| Buyer agent | yes | Goal decomposition. Off the money path. |

## Numbers

| | |
|---|---|
| **Headline** | conformance detection over **N=50+** payment-constraint claims from documents **we did not author** (NPCI, RBI, published PSP specs, live UCP declarations) |
| **Effective n** | claims parsed / attempted, printed beside the headline — never the denominator we'd prefer |
| **Baseline** | naive regex ("first ₹ near 'limit'") — reproduces the shipped 3× error, catches **0** semantic drifts |
| **Ablation** | naive extractor config → derives ₹15,000-per-transaction → **harm reported in rupees** |
| **Induced harm** | correct claims we wrongly refused, same table, same font |
| **Out-of-sample** | 4 real published documents — 2 Razorpay, 1 Cashfree, **1 ours** → 4/4 |
| **Abstention** | `UNDETERMINED` counted separately; never silently a guess |

Labels come from documents we did not write. That is the only defence against the field's defining failure — *every measured repo has a compromised measurement target*.

## Failure modes

| Failure | Behaviour |
|---|---|
| NPCI 403 / source down | serve checksummed local corpus; **never fetch live in the money path** |
| Extraction low-confidence | `UNDETERMINED` → refuse, counted, surfaced |
| Constraint store unavailable | **fail closed** — refuse. A gate that cannot cite cannot authorise. |
| Counterparty terms hash changed | invalidate verdict → re-check → refuse until resolved |
| Razorpay timeout | retry ≤3/24h, **timeouts only**; any other decline → no retry [OC-228 §3] |
| Duplicate request | idempotency key → replay original response, no side effects |
| **Ledger append fails after capture** | money moved, audit missing → mark `RECONCILE_PENDING`, block further authorisations for that block, surface in `make verify`. **Availability is sacrificed to auditability.** |
| Ledger tamper | chain check fails → refuse all authorisation |

**Fail-closed is a choice.** A payment system that authorises while blind is worse than one that stops: a refusal costs a sale, an unbounded debit costs trust and is unwindable only by dispute.

## Ledger

`entry.hash = SHA256(prev_hash ‖ canonical_json(payload))`, genesis anchored to the corpus manifest hash. Verified **forward and backward** — a forward-only walk passes trivially if entries are truncated. Verdicts re-derive from `(counterparty_doc_sha256, constraint_store_version, extractor_version)`; all three are recorded, so a verdict is reproducible months later.

## Limits and non-goals

- **Razorpay TSP has no public API** (0 hits across 2,282 doc URLs) — the delegation layer is **stubbed and declared**, in the README, here, and in the video.
- Extraction quality is the system's ceiling. Measured, not asserted.
- **Not** a general contract analyser — payment constraints only.
- **Not** a fraud, ML-risk or recovery system.
- `UNDETERMINED` may be high on poor scans. Reported, not suppressed.
- Reserve Pay in test mode is **unverified** at time of writing; probe: `tools/probe_testmode.py`.
