# Code Review Findings

> **STATUS — updated 2026-08-27 after remediation.** C1, C3, H1, H2, H3, M3, L2 and a
> newly-found H4 are **FIXED**, each with regression tests that failed first. **C2 was
> my error** and is corrected in place below — it was not reachable, and I said it was.
> M1, M2, L1, L3 remain open. The suite is now **168 passing, 8 deselected**; `make
> verify` green; `make eval` unchanged at positive class 2, detected 2.
>
> **Second pass, 2026-08-27:** M1, M2 and M5 are now fixed, **C2 is un-withdrawn**
> (M5 made blocks shared, so the contended path is real and the lock is load-bearing),
> and the headline figures have been **re-probed under the new guards and came back
> unchanged** — ₹15,000 and 91 days, no INDETERMINATE abort, no ceiling hit, caveats
> preserved. Suite: **183 passing, 8 deselected**. Remaining open: M4, L1, L3.

Read of the working tree at `812fef1`, 2026-08-27. Every finding below was
**reproduced against the running code**, not inferred from a read. Repro commands are
included so each can be checked or refuted independently. Where I could not reproduce a
suspected defect, I say so rather than reporting it as real.

Baseline state at time of review: `128 passed, 7 deselected in 2.36s`; `make verify`
green (ledger 130 entries, 3/3 self-test fixtures, 5/5 tamper attacks caught);
`make eval` positive class 2, detected 2, headline suppressed at N=8 against N≥50.

**Original summary (as first reported):** 3 critical, 3 high, 4 medium, 3 low.
**After verification:** 2 critical (C2 withdrawn), 4 high (H4 added), 4 medium, 3 low. The three critical findings all sit on
the money path or its audit trail, and all three are concurrency or failure-path issues —
areas the test suite exercises single-threaded and on the happy path only.

---

## CRITICAL

### C1 · Concurrent requests permanently corrupt the hash-chained ledger

> **FIXED** — `413c1d5`. `Ledger.append()` now holds a `threading.Lock` across the whole
> read→derive→write→HEAD sequence. 5 regression tests, all of which failed first,
> including one driving 8 concurrent completions through the real `ThreadingHTTPServer`.
> Documented limit: this is an in-process lock. It makes one instance safe for the
> deployed threading server; it does **not** make two processes safe — that needs
> `fcntl.flock`. Stated in the docstring rather than implied.

**Where:** `gate/ledger.py:38-48` (`append`), reached from `merchant/server.py:96,105`
via `ThreadingHTTPServer` (`merchant/server.py:178`).

`append()` is a read-modify-write with no lock:

```python
es = self._entries()                       # read the whole log
prev = es[-1]["hash"] if es else genesis()
e = {"seq": len(es), "prev_hash": prev, ...}
with open(self.path, "a") as f: ...        # then write
```

Two threads interleave between the read and the write, both compute the same `prev`, and
both emit an entry with the same `seq`. The backward walk in `verify()` then fails
forever. The server appends on **every** `complete_checkout` and every replay, and it is
a threading server, so two concurrent agents are sufficient.

**Reproduced, 3/3 runs, through the real HTTP server** (8 concurrent MCP
`complete_checkout` calls, `FakeCapture`, isolated ledger path):

```
8 concurrent MCP complete_checkout calls over the real HTTP server
ledger verify(): BROKEN — backward: chain break between seq 6 and 7
ledger verify(): BROKEN — backward: chain break between seq 6 and 7
ledger verify(): BROKEN — backward: chain break between seq 6 and 7
```

Direct unit repro, 3/3 (12 threads, `tempfile` ledger): `BROKEN — backward: chain break
between seq 10 and 11`.

**Why this is the worst one.** The corruption is *indistinguishable from tampering*. The
message a reviewer sees after two concurrent purchases is the same message
`eval/tamper.py` prints when an attacker edits the log. `make verify` fails, the audit
claim collapses, and the cause looks like an attack. It is also unrecoverable — the chain
cannot be repaired without breaking the genesis anchor.

**Fix:** a `threading.Lock` held across read→write in `append()`. `Ledger` instances are
per-`Merchant`, so one instance lock suffices for the in-process case; a file lock
(`fcntl.flock`) is needed if more than one process ever writes.

---

### C2 · The block balance can be overdrawn — WITHDRAWN, then RESTORED by M5

> **I got this wrong, and then it became right.** As originally written it was false:
> not reachable, reported as a live critical. After M5 made blocks shared per
> (customer, merchant) — which is what SBMD requires — the contended path is real, and
> the lock installed in `413c1d5` is load-bearing rather than latent. The sequence
> matters: the guard went in first, so the data-model change was a modelling fix and
> not also a correctness regression.
>
> The original report was still wrong on the evidence I had at the time, and the
> reasoning below stands as the record of how.
>
> **What I did wrong.** `create_checkout` gives every checkout its **own** block object,
> so concurrent completions touch disjoint state. My reproduction aliased the blocks
> together myself — `m2.blocks[cid] = m2.blocks[cs[0]]` — and I then read the
> consequence as a property of the system. Re-run without the aliasing:
> `distinct block objects for 6 checkouts: 6` / `any negative? False`.
>
> That is a harness artifact reported as a finding, which is precisely the error class
> this repository exists to catalogue, committed by the review that was auditing for it.
> It is the same shape as H2 (a search ceiling reported as a discovered bound) — I
> flagged that one in someone else's code an hour before making it in my own.
>
> **What is actually true, and still worth fixing.** The unsafe check-then-act pattern is
> real, and it becomes live the moment one block is drawn on by more than one checkout —
> which is what `single_block_multiple_debit` *means*. A per-block lock went in with
> `413c1d5`, labelled latent in both the code and here.
>
> **The real finding underneath** is a modelling one, and it is not a race: **one block
> per checkout is not SBMD.** A block that is created, debited once and discarded is not
> a reservation, and `insufficient_block_balance` can therefore only ever fire on a
> checkout's first and only debit. Filed as **M5** below.

**Where (of the latent pattern):** `gate/decide.py:52` and
`merchant/server.py` (`block["remaining_minor"] -= c.total_minor`).

Classic check-then-act across a thread boundary. `decide()` is pure and correct in
isolation; the *decrement* that makes its answer true happens later, unsynchronised, in
the caller. N concurrent purchases against one block all read the same
`remaining_minor`, all pass, and all decrement.

**Reproduced only with blocks I aliased myself, 2/2 runs** — see the correction above.
A block with room for exactly two ₹2,499 totes, hit with six concurrent completes:

```
B. block had Rs.4,998 (room for 2). remaining now Rs.-9,996
   -> OVERDRAWN: balance went negative
```

Four purchases beyond authorisation, and the ledger records all six as
`decision: authorised`, `clause: Issuer §5` — the clause the gate cites while permitting
its own violation.

**Why it matters here specifically.** `insufficient_block_balance` is one of the nine
refusals the project's self-conformance gate verifies carries a citation. The citation is
correct; the enforcement is not atomic. A refusal that cites a clause it does not
actually hold under concurrency is a stronger version of the failure mode this codebase
exists to catch.

**Fix (applied, as a latent guard):** a per-block `RLock` held across replay-check →
`decide()` → capture → debit. It travels with the block rather than the checkout,
because the thing that must serialise is the reservation, not the session drawing on it.
The pure-function design of `decide()` is right and did not change — the caller is where
the invariant leaks.

---

### C3 · `make test` creates real Razorpay orders when `.env` is present

> **FIXED** — `705b0e8`.

**Where:** `merchant/razorpay_client.py:10-12` (`load_env()` at import, added in
`fa278a8`), `merchant/razorpay_client.py:76-80` (`default_capture`), against
`pyproject.toml:4` (`addopts = "-q -m 'not network'"`).

`pyproject.toml` configures the default suite to be offline via the `network` marker.
Only one test carries that marker. But `load_env()` now runs at **import** of the
Razorpay client, so `default_capture()` returns the live `RazorpayCapture` for every
unmarked test that constructs a `Merchant` — `tests/test_server.py`,
`tests/test_e2e.py`, and `eval/demo.py`.

**Confirmed directly.** Exercising the exact code path `test_server.py` uses:

```
capture_mode: live-test-mode
order_id: order_TUaOKnO4eMBsdm   mode: live-test-mode
```

`order_TUaOKnO4eMBsdm` is a real Razorpay order ID — not `order_fake_` or `order_test_`.
Timing corroborates: `pytest tests/test_server.py` takes 1.36s with keys, 0.89s with
`RAZORPAY_KEY_ID=` blanked, consistent with one live HTTPS round-trip.

**Why it matters.** Three consequences, in order of severity: (1) the offline guarantee
in `pyproject.toml` is false, so `make test` is non-deterministic and fails without a
network; (2) every full test run leaves orders on the Razorpay account; (3) a rate-limit
or outage turns a green suite red for reasons unrelated to the code.

This was introduced by the commit that *fixed* the opposite honesty bug (`make demo`
reporting STUBBED with valid keys beside it). The fix was right; its blast radius reached
the test suite.

**Fix:** `conftest.py` should force `RAZORPAY_KEY_ID` out of the environment for every
unmarked test (`monkeypatch.delenv`, autouse fixture), so live capture requires the
`network` marker explicitly. That preserves the demo fix while restoring the offline
guarantee.

---

## HIGH

### H1 · A rate-limit is indistinguishable from a rejection inside the probe's binary search

> **FIXED** — `89c5725`.

**Where:** `eval/probe_cases.py:29-36` (`_post`), `:47` (`_try_mandate`), `:51-60`
(`_bisect`).

`_post` returns `(status, body)` for any `HTTPError`. `_try_mandate` collapses that to
`s == 200`. So a 429, a 5xx, or an auth blip returns exactly the same `False` that a
genuine "max_amount exceeds permitted value" returns, and `_bisect` moves its ceiling
down accordingly.

**Reproduced.** One injected transient rejection below the true bound:

```
true API bound      Rs.15,000
_bisect reports     Rs.12,587
error               16.1%  from ONE transient rejection
```

The ₹15,000 figure is the project's headline external finding — it is what
`eval/probe_findings.json`, the positive class, and the disclosure draft all rest on. A
single 429 during `make probe` silently rewrites it, and the cache is then committed as
fact with a `probed_at` timestamp that makes it look freshly verified.

**Fix:** `_try_mandate` should return a three-way (`ACCEPTED` / `REJECTED_BY_RULE` /
`INDETERMINATE`), gated on the error `code`/`description` actually matching a bound
violation. `_bisect` should abort on `INDETERMINATE` rather than treat it as a ceiling.
This is the same fail-closed rule `conform/engine.py` already applies to
`UNDETERMINED` — the probe is the one place in the codebase that does not follow it.

### H2 · `_bisect` cannot distinguish "found the bound" from "hit my own search ceiling"

> **FIXED** — `89c5725`.

**Where:** `eval/probe_cases.py:51-60`.

The loop narrows `lo` toward `hi` but never tests `hi` itself, and there is no
post-condition asserting the answer is strictly below the ceiling.

**Reproduced:**

```
A. API accepts everything -> _bisect returns 9999999 paise = Rs.99,999
   (search ceiling was 10000000 paise = Rs.100,000; result is ceiling-1)
```

An unbounded parameter is reported as a precise discovered bound of ₹99,999 — an
artifact of the harness presented as a property of the counterparty. The same holds for
validity: `hi=400` would yield "the API accepts up to 399 days."

The current committed values (₹15,000 of ₹100,000; 91 of 400 days) are comfortably
inside their ceilings, so **the shipped numbers are not affected**. The defect is that
nothing in the code would have told anyone if they had been.

**Fix:** `assert result < hi - tol`, or return `None` with a distinct
`CEILING_NOT_REACHED` signal.

### H3 · Payment-rail failure drops the agent's connection and leaves the ledger asserting an authorisation that never happened

> **FIXED** — `853f45a`.

**Where:** `merchant/server.py:110` (`self.store.complete(...)` uncaught),
`merchant/server.py:170-173` (handler catches `KeyError` only),
`merchant/razorpay_client.py:72` (`raise RuntimeError("timeout")`).

**Reproduced** — capture raising `RuntimeError("timeout")`, the one class OC-228 §3 makes
retryable:

```
agent receives: RemoteDisconnected: Remote end closed connection without response

ledger entry: {'event': 'authorise', 'checkout': 'cs_17d4307df6da',
               'decision': 'authorised', 'clause': 'Issuer §5'}
```

Three problems in one path:

1. The ledger permanently records `authorised` with no corresponding outcome. The audit
   trail asserts something the system did not do.
2. The agent gets a dropped TCP connection — not a JSON-RPC error, and not the clause.
   Everywhere else in this codebase a refusal carries its authority; this path carries
   nothing.
3. `classify_failure()` — the function that encodes "timeouts are retryable, nothing
   else is" — **is never called.** `grep` finds callers only in `tests/test_razorpay.py`
   and one comment. So the agent cannot learn that this specific failure is the one it is
   permitted to retry, which is precisely the decision OC-228 §3 governs.

**Fix:** wrap the capture, append a second ledger entry recording the outcome
(`captured` / `capture_failed`), and return a JSON-RPC error built from
`classify_failure()` so `retryable` and the clause quote reach the agent.

---

## MEDIUM

### M1 · The ground-truth label is a hardcoded constant, not the claim store

> **FIXED** — `0581a7c`.

**Where:** `eval/probe_cases.py:78` (`"FAIL" if max_amt > 1_000_000 else "PASS"`) and
`:93` (`"FAIL" if max_days > 90 else "PASS"`).

`1_000_000` and `90` are typed into the case generator, duplicating
`OC228-5-block-max` and `OC228-5-block-days` in
`corpus/claims/authoritative.json`. If the store is corrected, the committed labels
silently disagree with the authority `conform/engine.py` actually compares against.

This also weakens the module's own headline argument. Its docstring says "Nobody can
argue the label came from us. The API said it; the circular judges it." The *declared
value* genuinely comes from the API — that part holds. But the **label** currently comes
from a constant in our source, not from the circular. Deriving it from
`_load_authorities()` would make the docstring literally true.

### M2 · `render_comparison()` — the caveat gate's enforcement arm — has no production callers

> **FIXED** — `0581a7c`.

**Where:** `eval/probe_cache.py:98`.

`grep` finds it only in `tests/test_caveat_gate.py`. Nothing in `eval/`, `merchant/`, the
Makefile, or any shipped artifact renders a comparison through it.

To be fair to the design: the **load-time** half of the gate (`_assert_hedged`, called
from `load_cached_cases`) *is* live and does fire on every `make eval` — that half is
real and working. But the commit message describes `render_comparison()` as the thing
that "REFUSES to draw the disagreement rather than draw it bare," and today no drawing
path goes through it. Any future page, slide or disclosure that formats these numbers by
hand bypasses the gate entirely and reintroduces FAILURES.md #8.

Given this project's own catalogue of "checks that cannot fire," this is worth naming
before it ships, not after. **Fix:** route every artifact that prints these figures
through `render_comparison()`, and add a test asserting no committed artifact contains
the bare figures without the caveat strings.

### M3 · The gate's retry rules are unreachable through the server

> **FIXED** — `853f45a`.

**Where:** `gate/decide.py:75-83`; `merchant/server.py:99`.

`decide()` implements `retry_not_permitted` and `retry_budget_exhausted` against
`req.get("is_retry")` and `req.get("retry_of_timeout")`. The server builds
`req = {"amount_minor": ..., "idem_key": ...}` and never sets either key. `grep` confirms
`is_retry` appears only in `gate/decide.py` and `tests/test_gate.py`.

So two of the nine refusals — the two that enforce OC-228 §3, the clause the buyer agent
and the README both lean on — cannot fire in the running system. They are correct,
tested, and disconnected. Pairs with H3: the classification is unwired at one end and the
enforcement unreachable at the other.

### M4 · A non-numeric `confidence` crashes extraction instead of dropping the claim

**Where:** `extract/llm.py:120` (`float(c["confidence"])`).

The module's stated rule 1 is "anything malformed is rejected, never repaired," and it is
implemented that way for missing fields, bad units and hallucinated quotes — each
`continue`s past the bad claim. Confidence is the exception: a model returning
`"confidence": "high"` raises out of the loop and discards every *valid* claim in the
batch alongside the bad one.

**Reproduced:** `ValueError: could not convert string to float: 'high'`.

**Fix:** wrap in `try/except (TypeError, ValueError): continue`, consistent with the
three checks above it.

---

## LOW

### L1 · `Ledger.append()` is O(n) per call, O(n²) over a session

`gate/ledger.py:39` re-reads and re-parses the entire log on every append, only to obtain
`len()` and the last hash. The committed ledger is already at 130 entries and grows on
every demo run and every request. Not a problem at present scale; it is the kind of thing
that becomes one silently. The `HEAD` sidecar already stores `count` and `head` — enough
to append without reading the log at all.

### L2 · `_post` assumes every error body is JSON

> **FIXED** — `89c5725`.

`eval/probe_cases.py:35` calls `json.loads(e.read())` unconditionally. A proxy or CDN
returning an HTML 502 raises `JSONDecodeError` mid-probe. Loud rather than silent, so low
severity — but it aborts a ~33-call probe partway with no partial result.

### L3 · `load_env()` returns names it did not load

`gate/config.py:23-28` appends `k` to `loaded` outside the `if k not in os.environ`
guard, so the returned list includes keys that were already set and deliberately skipped.
The docstring says "Returns the names loaded." Cosmetic, but the function's whole purpose
is to report accurately what the process is wired to.

---

### H4 · `make probe` regenerates a cache its own caveat gate then rejects

> **FIXED** — `89c5725`. Found while fixing H1.

**Where:** `eval/probe_cases.py` `__main__`, against `eval/probe_cache.py:_assert_hedged`.

`probe()` builds findings with `parameter`, `api_enforces*`, `circular_authorises*` and
`circular`. The three required caveat fields — `framing`, `not_claimed`,
`alternatives_not_excluded` — are hand-authored prose that exists **only** in the
committed artifact. `__main__` dumped the fresh findings straight over that file.

**Confirmed:** feeding `_assert_hedged` exactly what `probe()` produces raises
`finding 'max_amount' is missing 'alternatives_not_excluded'`. So running `make probe`
made `make eval` refuse to load, and the obvious way out of that bind is to weaken the
gate — which would reintroduce FAILURES.md #8 permanently.

**Fix:** `carry_caveats()` re-attaches each hedge by parameter name, **refuses** for a
parameter with no prior hedge (a machine can regenerate a number; it cannot author the
caveat), and **flags** when the figure moved, because prose written about ₹15,000 must
not be silently reused to describe a different number.

---

### M5 · One block per checkout is not `single_block_multiple_debit`

> **FIXED** — `92fc9dc`. Treated as blocking rather than documented: a declared
> capability that does not match the primitive is this project's own thesis pointed
> inward, and the exact check a sharp reviewer has been taught to run. Blocks are now
> keyed by `(customer_id, merchant_id)` — one reservation, many debits, drawn down
> until the bound refuses. Two consequences: `insufficient_block_balance` can finally
> fire through accumulated draw-down (the case §5 exists for), and OC-228 Issuer §4
> becomes structural rather than a field we assert about ourselves. 9 tests.

**Where:** `merchant/server.py` `create_checkout` —
`self.blocks[c.id] = _default_block(...)`.

Surfaced by withdrawing C2. Every checkout gets a fresh block with a full
`remaining_minor`, is debited at most once, and is then discarded. So:

- `remaining_minor` never meaningfully decrements across purchases;
- `insufficient_block_balance` can only fire if one checkout's total exceeds a whole
  fresh block — never through accumulated draw-down, which is the case the bound exists
  for;
- the UCP profile advertises
  `{"type": "upi_reserve_pay", "mandate": "single_block_multiple_debit"}`, and the server
  implements single-block-**single**-debit.

The gate's arithmetic is right. The state it is handed does not model the thing the
clause governs. This is a data-model change, not a bug fix, which is why it is filed
rather than patched here — and it is the change that makes the C2 lock load-bearing.

---

## Checked and NOT reproduced

Reported so the negative result is on record rather than re-derived later.

- **Double capture on a concurrent replayed idempotency key.** Same check-then-act shape
  as C2, at `merchant/checkout.py:46` (`if idem_key in self._idem`) and
  `merchant/server.py:102`. I tried 12 trials × 16 threads synchronised on a
  `threading.Barrier`, with an artificially widened capture window:
  `worst-case capture() invocations: 1 (expected 1)`. CPython's GIL appears to make the
  dict membership test plus the subsequent write effectively atomic across this narrow
  window. **I could not make it fail, so I am not calling it a bug** — but it is the same
  pattern as C2 and the lock that fixes C2 should cover it, at which point the question
  is moot.
- **Tamper suite regression from the new exit code 3.** `eval/verify_ledger.py` now exits
  3 on `EMPTY`, and `eval/tamper.py:9` tests `returncode == 0`. I checked all five
  attacks: the delete-the-log attack leaves `HEAD` in place, which `state()` correctly
  classifies `BROKEN` (exit 1), not `EMPTY`. All 5 still report `[CAUGHT]`. No regression.
- **`_bisect` monotonicity.** The search assumes the accept-set is a contiguous range
  from `lo`. Plausible failure mode, but I have no evidence the Razorpay API violates it
  and did not spend live calls testing it. Noted as an unverified assumption, not a
  finding.

---

## Pattern across these findings

The test suite is strong where it looks — 128 tests, self-testing verification surfaces,
vacuity guards, an honest eval harness that refuses to flatter itself. Every finding
above lives in one of the two places that suite does not reach:

**Concurrency** (C1, C2, and the unproven idempotency case). Every test is
single-threaded. `ThreadingHTTPServer` is the deployed configuration. The gap is
structural, not an oversight in any individual test.

**Failure paths of the live rail** (C3, H1, H3). These became reachable only when real
keys arrived in commit `fa278a8`. Before that, `FakeCapture` never raised, never
rate-limited, and never left the ledger inconsistent. The code that handles a rail that
*fails* is the newest and least exercised in the repository.

Two suggested additions, in priority order:

1. A concurrency test class — N threads against one `Merchant`, asserting the ledger
   verifies and `remaining_minor >= 0` afterwards. This would have caught C1 and C2, and
   both are one lock away from fixed.
2. An autouse fixture that strips `RAZORPAY_KEY_ID` from unmarked tests. This restores
   the offline guarantee C3 broke and costs nothing.

---

## Open after remediation

| ID | Status | Note |
|---|---|---|
| C1 | **fixed** `413c1d5` | in-process lock; cross-process needs `fcntl.flock` |
| C2 | **restored** `92fc9dc` | wrong when filed; real once M5 shared the blocks |
| C3 | **fixed** `705b0e8` | first attempt did nothing; fixed at conftest import |
| H1 | **fixed** `89c5725` | three-way outcome; **re-probed, figures unchanged** |
| H2 | **fixed** `89c5725` | ceiling assertion |
| H3 | **fixed** `853f45a` | rail failure now structured, recorded, classified |
| H4 | **fixed** `89c5725` | caveats carried across regeneration |
| M1 | **fixed** `0581a7c` | label now read from the checksummed store |
| M2 | **fixed** `0581a7c` | `make eval` renders only through the gate |
| M3 | **fixed** `853f45a` | §3 reachable, and un-spoofable |
| M4 | open | non-numeric confidence crashes rather than drops |
| M5 | **fixed** `92fc9dc` | real SBMD: one block, many debits |
| L1 | open | `append()` is O(n) per call |
| L2 | **fixed** `89c5725` | non-JSON error bodies |
| L3 | open | `load_env()` returns names it skipped |

**The headline number is now verified, not merely obtained.** `make probe` was re-run
against the live test API under the new classifier on 2026-08-27T06:05:01. Both figures
came back **unchanged** — ₹15,000 and 91 days — with no `INDETERMINATE` abort (every
non-200 during the search was attributable to the probed parameter), no ceiling hit, and
all three hedge fields carried across intact with no `value_changed_since_caveat` flag.

That the numbers did not move is itself the finding: the originals were not artifacts of
an unclassified rate-limit or of the search range. The disclosure draft and the `/drift`
scene can cite them as verified.

## Two notes on this review's own reliability

**I made the error I was auditing for.** C2 was reported as a live critical on the
strength of a reproduction whose key condition I had introduced myself. It took a
re-check without the aliasing to see it. A review is a claim like any other, and this
one shipped an unverified one.

**The first C3 fix was a guard that could not fire.** An autouse function-scoped fixture
passed its own tests and protected nothing, because pytest builds module-scoped fixtures
first. The suite stayed green. It was caught only by asserting against the live object
(`RazorpayCapture / live-test-mode`) instead of trusting the fixture's own promise —
which is the same lesson FAILURES.md #3 and #4 already record, relearned.
