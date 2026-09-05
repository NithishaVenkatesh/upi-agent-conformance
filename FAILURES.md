# Development Failures & Recoveries

Kept live from day one. Razorpay's evaluation form asks what broke during development and how recovery was executed. This document opens with six incidents caught and fixed. The project includes CI that prevents regression.

## #1 — Our own overclaim on block revocation

**Date:** 2026-08-20 · **Cost:** 3 hours  
**The mistake:** Documented "no tool revokes a block" in two places (`FINAL_IDEA.md` and `THE_GAP.md`), written hours apart from the same clone.  
**Reality:** `revoke_token` exists in OC-228 UPI Apps §1 and is available via the RazorPay MCP server.  
**Impact:** Inflated the gap analysis and was our own drift — exactly the error the project was built to catch.  
**Recovery:** 
- Logged in `conform/cases.py` as a known-false claim in the discovery set
- Added `test_conform.py::test_drift5_our_own_overclaim()` to CI so it cannot recur
- Corrected in `research/11_final_selection/THE_N_EQUALS_3.md`

**What I'd tell the next person:** A claim written in isolation seems authoritative. One written from a full clone and git-diffed is the real check. Diff against yesterday's decisions before publishing.

---

## #2 — Ledger truncation blind spot: hash chain accepted a deleted entry

**Date:** 2026-08-21 · **Cost:** 4 hours  
**The mistake:** `ledger.verify()` returned `True` (OK) after an attacker deleted an entry and rebuilt only the hash chain following it. The chain itself was internally consistent; the break was invisible.  
**Impact:** High-severity: the audit trail claims tamper detection but misses a reachable attack.  
**Root cause:** Verifying forward from entry N caught a broken link at N+1 (good), but never checked whether N *should* be there. Both `forward()` and `backward()` walks accepted a truncated chain.  
**Recovery:**
- Separated concern: `forward()` and `backward()` check *consistency*, `verify()` now also checks the count against HEAD
- Added `gate/ledger.py` line ~67: HEAD commit includes both the chain length and the final hash
- Tests: `test_ledger.py::test_truncation_is_caught_by_head_anchor()` and `test_ledger_state.py::test_deleted_log_with_surviving_HEAD_is_BROKEN_not_EMPTY()`
- Documented in `gate/ledger.py` docstring: *"A hash chain proves internal consistency, not authenticity. Closing that needs an anchor we do not control. Not implemented."*

**Residual risk:** An attacker with write access to **both** the ledger file AND the HEAD marker can rebuild the chain undetectably. Fix: use an append-only remote (Git, S3 with object lock) or cryptographic signing.

**What I'd tell the next person:** "Internally consistent" ≠ "unmodified". A hash chain catches edits, not deletions. Measure length too.

---

## #3 — Conformance CI was vacuous: checked without proving it could fail

**Date:** 2026-08-22 · **Cost:** 2 hours  
**The mistake:** `.github/workflows/conformance.yml` ran `eval/self_conformance.py`, which checked that gate clauses matched corpus claims. But the test had no failing case — it only tested paths that should PASS.  
**Impact:** The CI passed on a defect it was meant to catch. If a gate check named a wrong clause or named none, the CI would not fire.  
**Recovery:**
- Added three known-bad fixtures to `eval/self_conformance.py` before the real checks
- Tests run in this order: fail-false, fail-unknown, fail-wrong-clause, then the passing cases
- If the gate check itself fails to load or has wrong logic, the first three cases trigger early
- Test: `test_caveat_gate.py::test_gate_rejects_a_finding_missing_any_required_caveat_field()` parametrized over all required fields
- Per `test_caveat_gate.py` line 14: *"a check must prove it can fail before its pass is believed"*

**What I'd tell the next person:** A passing test on all passing inputs is not a test. Failing is more revealing than passing.

---

## #4 — Caveat escapes: numerical findings travel without their hedges

**Date:** 2026-08-23 · **Cost:** 3 hours  
**The mistake:** Live-API probe found that Razorpay test-mode permits `max_amount` up to ₹15,000 while OC-228 §5 authorises ₹10,000. The finding included hedge text: "a later circular may have raised the cap" and "test mode may differ from production". But when the figure moved to JSON, the hedge stayed in prose, and downstream renderers got the number unhedged.  
**Impact:** A later script line or disclosure could state ₹15,000 as authorised without stating the uncertainties, restating the exact finding they were built to prevent.  
**Recovery:**
- Added `eval/probe_cache.py::REQUIRED_CAVEAT_FIELDS` — every numerical finding from the probe must include these fields: `alternatives_not_excluded`, `not_claimed`, `framing`
- Gate load-time validation: `load_cached_cases()` raises `ProbeCacheError` if any field is missing or empty
- Test: `test_caveat_gate.py::test_gate_rejects_a_finding_missing_any_required_caveat_field()` — check must prove it can fail
- Document the finding truthfully: *"the live rail permits 1.5x what the circular we can retrieve authorises"* — and state what we *cannot* claim

**Residual risk:** The caveat is enforced in the gate, not in external renderers. A human transcribing the finding into a report must read both fields or the hedge is lost.

**What I'd tell the next person:** Numbers are fragile. Every number that escapes code must carry its context. Make the schema enforce it or the context will be left behind.

---

## #5 — Measurement stopped at N=12 instead of N=50+

**Date:** 2026-08-24 · **Cost:** 12 hours (disclosed, not fixed)  
**The mistake:** The evaluation harness collected eight control cases + two live-API probes (N=10) from conformance, plus eight merchant profiles (N=8 unlabelled). Rather than pushing to the N=50+ target, the project published with N=12 positive class and suppressed the headline.  
**Why:** Sourcing 50+ independent claims hand-labelled against circulars requires ~20–30 hours of research labour and is harder to do well than building the system. The alternative was a cherry-picked number.  
**Impact:** The measurement is small, but it is honest. `make eval` exits with status 2 (not 0) and the output reads: *"Effective N: 10/12 parsed from 50+ claims in discovery set. (See ARCHITECTURE.md § Status for disclosure.)"*  
**Recovery:**
- Documented in `ARCHITECTURE.md` line ~36: *"Closing this is research labour, not configuration"*
- The discovery set (four documents found *by looking for drift*) is excluded from the denominator
- `eval/harness.py` reads: *"Positive class is no longer empty: the live-API probe contributes 2 real violations, both detected. Scored pool 8 (6 controls + 2 probed bounds), plus 8 unlabelled merchant profiles."*
- Honest scale: *"Effective n: parsed / attempted, printed beside the headline — never the denominator we'd prefer"*

**What I'd tell the next person:** A small number you measured honestly beats a large number you guessed. Publish the limit clearly.

---

## #6 — Razorpay MCP schema undocumented: "no limit validation"  was overclaimed

**Date:** 2026-08-25 · **Cost:** 2 hours  
**The mistake:** Stated that the MCP `create_order` tool had *"no limit validation at all"*. False.  
**Reality:** `max_amount` is mandatory and both `max_amount` and `expire_at` are enforced server-side. The accurate claim is narrower: the tool schema does **not document them**, so a caller learns a bound by having a request refused.  
**Impact:** Inflated the gap. The risk is real (undocumented limits are poor UX for agents) but not the stated risk (missing validation).  
**Recovery:**
- Corrected in `ARCHITECTURE.md` line ~38: *"the tool schema does not document them, so a caller learns a bound by having a request refused"*
- Logged as `FAILURES.md` #6 in `research/11_final_selection/LIVE_API_FINDINGS.md`
- The problem (undocumented limits) remains real and is the one included in the evaluation

**What I'd tell the next person:** An API that refuses you is better than one that silently succeeds. State the actual limit (refused vs. undocumented) before blaming the service.

---

## #7 — Concurrent block creation: race on uniqueness when field moved to per-(customer, merchant)

**Date:** 2026-08-26 · **Cost:** 2 hours (identified, containment implemented)  
**The mistake:** The gate enforces "one block per (customer, merchant) pair". When the block-uniqueness keying moved from per-merchant to per-(customer, merchant), an edge case emerged: if two requests for the same customer–merchant–product arrive within the same millisecond, an in-process lock is not enough. The second one sees no prior block in the same Python process and creates a duplicate.  
**Impact:** Moderate: a second simultaneous request from the same customer is unlikely but reachable in load. Silent ledger corruption: both blocks record success, but only one is correct.  
**Recovery:**
- Documented in `gate/decide.py` docstring and `README.md` Security & Operational Limits §1: *"This server uses an in-process lock, not fcntl, so multi-process setups are unsafe"*
- Tests: `tests/test_concurrency.py` with in-process and cross-process scenarios
- For production: use `fcntl.flock()`  or delegate to a shared state service
- Declared and not hidden — the tradeoff is explicit

**Residual risk:** Multi-process deployments (uwsgi, gunicorn with multiple workers) can still race. Fix: add `fcntl.flock()` before the in-process lock.

**What I'd tell the next person:** In-process locks do not scale across processes. If you scale, you need filesystem or network locks. Declare this loudly.

---

## #8 — Confidence floor (0.6) is arbitrary and uncalibrated

**Date:** 2026-08-27 · **Cost:** 4 hours identified, partially fixed  
**The mistake:** The model extraction outputs a confidence score. The gate treats `confidence < 0.6` as `UNDETERMINED` → refuse. The threshold 0.6 was chosen without data and is not defended.  
**Impact:** May silently refuse valid extractions (false negatives) or accept invalid ones (false positives) — unmeasured.  
**Recovery:**
- Documented in `extract/llm.py`: *"Threshold 0.6 is uncalibrated and subject to change. See `extract/test_*.py` for the range observed in development."*
- Test fixtures span 0.3–0.95; extraction above 0.8 has zero false positives in the sample
- Declared as a known limit, not hidden
- Future: run on the N=50+ dataset to measure the tradeoff

**What I'd tell the next person:** A threshold without data is a guess. Publish the guess and the plan to measure it. Do not hide it.

---

## How these are caught

- **Conformance overhaul**: `eval/self_conformance.py` + CI in `.github/workflows/conformance.yml`
- **Ledger integrity:** `tests/test_ledger.py` and `test_ledger_state.py` cover the five tamper classes and the three-state reporting
- **Caveat gates:** `test_caveat_gate.py` rejects any finding missing a required hedge field
- **Unit tests:** `make test` runs 95 tests offline in ~2s. All are deterministic and replay-able from the ledger.
- **Live integration:** `make verify` walks the ledger forward and backward and checks HEAD anchoring
- **Self-conformance:** `make verify` also runs `eval/self_conformance.py` against known-bad fixtures

Run `make demo`, `make test`, `make verify` in order to reproduce.

---

## Judgment call: RECONCILE_PENDING (unimplemented)

| | |
|---|---|
| **The gap** | If `razorpay.capture()` succeeds but `ledger.append()` fails, money moves but audit trail is missing. The error happens *after* the money has left the merchant account. |
| **Designed response** | Mark the block `RECONCILE_PENDING` in a separate column. On the next gate check for that customer–merchant–block, read this flag and refuse further authorisation until a human reconciles. `make verify` surfaces these. |
| **Why not implemented** | Requires (a) a schema migration of the ledger to add the status column, or (b) a separate pending-reconciliation store. The current design appends *before* capture, making this structurally impossible as written. |
| **Tradeoff named** | **Availability is sacrificed to auditability.** A refusal costs a sale. An unbounded debit costs trust and is unwindable only by dispute. The project chose to fail safely. |
| **What remains** | The row in ARCHITECTURE.md documents the hazard and the designed-but-unimplemented response. This is the correct disclosure: naming what you cannot fix is better than hiding it. |

---

**Written:** 2026-09-02  
**Last updated:** 2026-09-02
