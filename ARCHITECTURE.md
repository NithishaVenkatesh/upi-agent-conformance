# Architecture

**Problem.** A merchant reads Razorpay's docs — *"Guaranteed Collection… you receive payment regardless of customer's later financial situation"* — designs a ship-first flow, delivers, and the debit declines. NPCI OC-228 acquirer §2 says the opposite in one sentence: *"The block created shall **not** be treated as the guarantee of payment."* Nothing checks vendor claims against the circulars that authorise them. We found **five** such drifts — across two companies **and this project itself** (`FAILURES.md` #1).

**Invariant.** *No rupee bound is enforced unless it traces to a clause in a checksummed document. The model reads documents. The model never moves money.*

## Run it

```bash
git clone … && cp .env.example .env      # rzp_test_ keys only; live keys are refused
make demo      # bounded purchase + two refusals, written to the ledger   (~2s, no network)
make verify    # walks ledger forward, backward, HEAD-anchored; runs self-conformance
make test      # 95 tests, offline, ~2s
make eval      # conformance batch; suppresses the headline below N=50 (see Status)
make serve     # merchant on :8080 — /.well-known/ucp + /api/ucp/mcp
```

`make demo` output, verbatim:

```
REFUSED cap_exceeds_authority · NPCI/UPI/OC No.228 Issuer §5 ·
  "The block created to be maximum of Rs.10,000 of block limit and up to 90 days."
  · declared ₹25,000 > authorised ₹10,000
ALLOWED authorised
REFUSED retry_not_permitted · NPCI/UPI/OC No.228 Acquirer §3 ·
  "acquiring entities may retry maximum 3 times in 24 hours (no retries for any other declines)"
  · retry attempted on a non-timeout decline
```

## Status

| | |
|---|---|
| Built, tested, running | gate · ledger + HEAD anchor · claim store · conformance engine · UCP profile + MCP server · buyer agent · naive baseline · LLM extractor · eval harness · **95 tests, 85% coverage** |
| Live-verified | 4 real Indian merchants confirmed card-only via Playwright (`pytest -m network`) |
| Awaiting credentials | Azure OpenAI (extractor runs against a deterministic fake meanwhile) · Razorpay test keys (capture is stubbed **and declared**) |
| **`make eval` exits 2 — VACUOUS** | The scored pool is 6 controls + 8 unlabelled merchant profiles. **The positive class is empty**, so a detection rate would be 0/0. The five real drifts sit in the discovery set and are excluded by design to avoid inflating the rate. **Closing this is research labour, not configuration**: ~50 independently-sourced claims, hand-labelled against circulars the way OC-201 and OC-228 were. It is the largest remaining gap in the project — larger than the payment integration. (`FAILURES.md` #5) |
| Extraction at scale — **unverified** | The 7 authoritative claims were hand-read from the scans, not produced end-to-end by `extract/llm.py`. Contract tests cover schema, hallucinated quotes and the naive-baseline comparison; they are not evidence of reliability across dozens of messier pages. |
| E2E — **passing, but opt-in** | 3 Playwright tests (discovery → MCP purchase; live premise check). Network-marked, so `make test` stays offline. Last run 2026-08-26: **4 passed**, all four real merchants still card-only. Run with `pytest -m network`. |
| Kill-gate 2 — **open** | Whether Razorpay test mode supports the Reserve Pay mandate flow is **unknown**. `tools/probe_testmode.py` is built but unrun. Fallback rail: UPI Autopay. |
## Components

| Component | LLM? | Job |
|---|---|---|
| `corpus/` | — | Source documents + SHA-256 + provenance. Immutable; new versions are new rows. |
| `extract/` | **yes** | Scanned page → claims. **The only LLM in the constraint path.** |
| `corpus/claims/` | — | Authoritative claims keyed by `(doc_sha256, clause)`. Append-only. |
| `conform/` | — | `declared × authoritative → PASS｜FAIL｜UNDETERMINED` + citation |
| `gate/decide.py` | — | Money-path enforcement. Pure function. |
| `gate/ledger.py` | — | Hash-chained, HEAD-anchored audit log. |
| `merchant/` | — | UCP handler `in.razorpay.upi`, `/.well-known/ucp`, MCP checkout tools. |
| `agent/` | **yes** | Goal decomposition, product choice. **Off the money path.** |
| `eval/` | — | Batch harness, baselines, ablations, self-conformance. |

## Money path — no LLM

```
agent → merchant → GATE ─┬─ conformance verdict PASS?
                         ├─ block cap ≤ ₹10,000, validity ≤ 90d   [OC-228 §5]
                         ├─ amount ≤ remaining                    (integer paise)
                         ├─ retries ≤ 3/24h, timeouts only        [OC-228 §3]
                         ├─ one block per (customer, merchant)    [OC-228 §4]
                         ├─ validity ≤ 90d as a CAP, not just expiry  [OC-228 §5]
                         └─ idempotency key unused
   fail → ledger.append(REFUSED, code, clause) → 403 {code, clause, quote, remaining}
   pass → razorpay.capture(idem_key) → ledger.append(DECISION) → 200 {receipt}
```

`decide(req, block, verdict, now)` — pure, no network, no clock read, replayable from the ledger.
**A gate check that names no clause fails CI** — `.github/workflows/conformance.yml` → `eval/self_conformance.py`, which **self-tests against three known-bad fixtures before trusting itself to pass**. Its first version was vacuous (`FAILURES.md` #3).

**Adversarial input.** Merchant documents are untrusted. Extraction output is schema-constrained, and **the gate reads the claim store, never raw merchant text** — so a prompt-injected term sheet cannot become policy. It can only fail to parse, which yields `UNDETERMINED` → refuse.

## Where the LLM is, and is not

| Stage | LLM | Why |
|---|---|---|
| Circular / terms extraction | **yes** | Joint value + unit + scope + **meaning**. Naive regex reads OC-201 §7 and returns ₹15,000 as per-transaction — the error that shipped in Razorpay's own SEP #216 and stood four months. Drift #4 is semantic, not numeric; no regex reaches it. |
| Conformance compare | no | Integer + enum. Decidable — a model adds nondeterminism. |
| Gate, arithmetic, retry counting | no | Money path. Must replay identically. |
| Idempotency, hashing | no | Deterministic by definition. |
| Buyer agent | **yes** | Goal decomposition. Off the money path. |

## Numbers

| | |
|---|---|
| **Headline** | conformance detection over **N=50+** claims from documents **we did not author** (NPCI, RBI, published PSP specs, live UCP declarations) |
| **Effective n** | parsed / attempted, printed beside the headline — never the denominator we'd prefer |
| **Baseline** | naive regex ("first ₹ near 'limit'") — reproduces the shipped 3× error, catches **0** semantic drifts |
| **Ablation** | naive extractor config → derives ₹15,000-per-transaction → **harm reported in rupees** |
| **Induced harm** | correct claims we wrongly refused — same table, same font |
| **Abstention** | `UNDETERMINED` counted separately; never silently a guess |

⚠️ **The 4/4 out-of-sample result is a discovery set, not a test set.** Those four documents were found *by looking for drift*; reporting that we then find drift in them is selection-authored and proves less than it appears. It is reported as an existence proof — *this class of error is real and reachable* — not as a detection rate. The N=50+ batch is the measurement; it is drawn independently of how the four were found.

Labels come from documents we did not write — the only defence against a compromised measurement target.

## Failure modes

| Failure | Behaviour |
|---|---|
| NPCI 403 / source down | serve checksummed local corpus; **never fetch live in the money path** |
| Extraction low-confidence | `UNDETERMINED` → refuse, counted, surfaced |
| Claim store unavailable | **fail closed** — a gate that cannot cite cannot authorise |
| Counterparty terms hash changed | invalidate verdict → re-check → refuse until resolved |
| Razorpay timeout | retry ≤3/24h, **timeouts only**; any other decline → no retry [OC-228 §3] |
| Duplicate request | idempotency key → replay original response, no side effects |
| **Ledger append fails after capture** | money moved, audit missing → `RECONCILE_PENDING`, block further authorisation on that block, surface in `make verify`. **Availability sacrificed to auditability.** |
| Ledger tamper | verification fails → refuse all authorisation |

**Fail-closed is a choice.** A payment system that authorises while blind is worse than one that stops: a refusal costs a sale; an unbounded debit costs trust and unwinds only by dispute.

## Ledger — and what it does not prove

`hash = SHA256(prev_hash ‖ canonical_json(payload))`, genesis anchored to the corpus
manifest, plus a `HEAD` file committing to **length and tip**.

Five tamper attacks are committed as `eval/tamper.py` and run in CI. **Two of them
defeated the first implementation while this document claimed otherwise** — see
`FAILURES.md` #2. All five are now caught:

```
$ python3 -m eval.tamper
  [CAUGHT] edit a payload in place    → forward: hash mismatch at seq 0
  [CAUGHT] truncate the head          → genesis anchor mismatch
  [CAUGHT] truncate the tail          → HEAD commits to 4 entries, found 3
  [CAUGHT] re-forge the whole chain   → tip mismatch: HEAD does not match last entry
  [CAUGHT] delete the entire log      → log deleted: HEAD commits to 4 entries, found 0
```

> **Residual limit.** An attacker who can write **or delete** both the log and `HEAD`
> can re-forge or erase the chain and verification returns OK — deletion needs no write
> access to content at all. **A hash chain proves internal consistency, not authenticity.**
> Closing it needs an anchor we do not control: external timestamping or an append-only
> remote. **Not implemented.**

Verdicts re-derive from `(counterparty_doc_sha256, constraint_store_version,
extractor_version)` — all three recorded, so a verdict is reproducible months later.


## Limits and non-goals

- **Razorpay TSP has no public API** (0 hits across 2,282 doc URLs) — the delegation layer is **stubbed and declared**, here, in the README, and in the video.
- **Reserve Pay in test mode is unverified** — probe built (`tools/probe_testmode.py`), awaiting keys. Fallback rail: UPI Autopay.
- Extraction quality is the system's ceiling. Measured, not asserted.
- **Not** a general contract analyser — payment constraints only.
- **Not** a fraud, ML-risk, or revenue-recovery system.
- `UNDETERMINED` may be high on poor scans. Reported, not suppressed.
