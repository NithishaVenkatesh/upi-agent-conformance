# What broke, and how I got out

Kept live from the first day. Razorpay's form asks for this and their own copy says *"the last one is the one we read first"* — so it is written as things break, not reconstructed at submission time.

---

## #1 · 2026-08-26 — The project drifted from its own source, in four days, about its own thesis

**What broke.** This project's entire thesis is that *restatements of a constraint drift from the source document that authorises them, and nothing catches it.* We had found four instances across two companies.

Then I produced the fifth. Mine.

On 26 Aug I cloned `razorpay/razorpay-mcp-server` @ `7950d51`, enumerated all 43 tools from `pkg/razorpay/*.go`, and wrote into `THE_GAP.md` — evidence class **FACT**:

> *"Supporting tools: `fetch_tokens` (list a customer's saved instruments), **`revoke_token`** (*"Once revoked, the token cannot be used for future payments"*)."*

Hours later, writing up NPCI OC-228, I wrote in two separate documents:

> *"Razorpay's MCP server has no tool that returns a block's remaining balance, and **none that revokes a block**."*

Both statements are mine. Both were written the same day. **The second contradicts the first, and the first was correct** — verified again against `pkg/razorpay/tokens.go:232`. OC-228 UPI Apps §1 independently mandates *"Easy access to revoke the block"* in the customer's own app, so there were two revoke paths and I had claimed zero.

**How I got out.** An adversarial review agent caught it by cross-checking my claim against my own earlier file rather than against the world — the one check I had not automated. I re-verified against the clone before accepting the correction, then struck through both claims in place with an annotation rather than silently editing them, per the integrity rule this project already had.

**Why it happened.** The drift was *directional*: I was assembling a gap analysis, and "no revoke tool" made the gap larger. I did not re-read my own source note because I believed I remembered it. **That is exactly the mechanism behind all four vendor instances** — nobody re-reads the circular either, and the drift always runs in the direction the author wants.

**What I'd tell the next person.** Your own corpus is a counterparty. The conformance check has to run against your own claims, not just theirs — and it has to run continuously, because the drift appears within hours, not months. This is now `eval/self_conformance.py`, and it runs in CI over the repo's own documents. It would have caught this in seconds.

**What survives, precisely.** The *balance* gap is real: no tool returns a block's unutilised balance, despite OC-228 acquirer §5(d) mandating that check before every debit. The *revocation* gap was not real. The corrected claim is narrower and true.

**Cost:** ~2 hours of downstream analysis built on a false premise, including one product reframe that had to be discarded.
**Verified:** `grep -n revoke_token pkg/razorpay/tokens.go` → line 232; both affected documents annotated; self-conformance check added.

---

## #2 · 2026-08-26 — I claimed a security property my ledger did not have, and found it by attacking my own claim

**What broke.** The architecture document said, of the audit ledger:

> *"Verified **forward and backward** — a forward-only walk passes trivially if entries are truncated."*

That sentence is wrong, and I wrote it before writing the code. I built the ledger, then ran five tamper attacks against it rather than assuming the claim held:

| Attack | Result |
|---|---|
| Edit a payload in place, leave hashes | ✅ caught (forward hash mismatch) |
| Truncate the **head** | ✅ caught (genesis anchored to corpus manifest) |
| Rebuild the corpus underneath | ✅ caught (genesis anchor moves) |
| **Truncate the tail** | ❌ **PASSED** |
| **Re-forge the whole chain** | ❌ **PASSED** |

**The backward walk does not catch tail truncation.** After truncation the surviving chain is *internally consistent* — every `prev_hash` still matches its predecessor — so walking it in either direction proves nothing about entries that no longer exist. My stated rationale for bidirectional verification was simply false.

**How I got out.** Added a `HEAD` anchor written on every append, committing to **length and tip**. Both attacks now fail:

```
truncated: HEAD commits to 3 entries, found 2
tip mismatch: HEAD does not match last entry
```

**The residual limit, stated rather than hidden.** An attacker with write access to **both** the log and `HEAD` can re-forge the chain and verification returns OK. **A hash chain proves internal consistency, not authenticity.** Closing that needs an anchor we do not control — external timestamping, or an append-only remote. Not implemented. It is now in the code docstring and in the architecture's limits section, because a tamper-evidence claim that overstates its threat model is worse than none: *it looks like evidence.*

**What I'd tell the next person.** Two things. First: **a hash-chain claim is untested until you truncate the log.** Everyone tests in-place edits; almost nobody tests deletion, and deletion is the attack that matters for an audit trail — you remove the refusal you don't want seen. Second, and worse: **I wrote the security property into the design document before the code existed, and the document was persuasive enough that I nearly shipped it.** Prose is not a proof.

**Why it matters here.** This is the same failure mode as `FAILURES.md` #1 and as all four vendor drifts: **a confident restatement that outran its source.** The source in this case was code I had not written yet.

**Cost:** ~40 minutes. **Verified:** 5 attacks scripted; 3 previously passing now fail closed; residual limit documented in `gate/ledger.py` docstring and the architecture.

---

## #3 · 2026-08-26 — The check that guards against drift was itself vacuous, and the diagram described bounds the code did not enforce

**What broke.** Three defects, found by a reviewer *running and attacking* the code rather than reading it. Every one existed in the prose before it existed in the code.

**(a) `self_conformance.py` had no possible true positive.** It was written to fail CI when a refusal carries no clause. It read only `node.args`, so `Decision(allowed=False, code="x")` — keyword form — skipped the check entirely. Worse: it demanded the clause be an `ast.Constant`, while *every real refusal in `decide.py`* passes `c["clause"]`, a `Subscript`. **It could not have fired against the code it guarded, in either direction.** A verification surface that silently verifies nothing is worse than none: it looks like evidence.

**(b) Deleting the entire ledger returned `ledger OK`.** `verify()` short-circuited on an empty log before consulting `HEAD`. The truncation class that HEAD was added to close (`FAILURES.md` #2) was still open at its limit case — and the residual-limit disclosure I had written scoped the threat too narrowly, to "write access to both". **Deletion needs no write access to content at all.**

**(c) Two of five money-path bounds in the architecture diagram were not in `decide.py`.** Per-`(customer, merchant)` uniqueness was absent entirely. Validity was checked as *expiry* while the refusal string printed `validity capped at 90 days` — asserting a bound it never enforced.

**How I got out.** (a) normalised positional and keyword args, accepted expressions as clauses, and **made the check self-test against three known-bad fixtures before trusting itself to pass** — if it cannot catch a planted failure it exits 1. (b) moved the `HEAD` consultation above the empty short-circuit and widened the disclosure to "write **or delete**". (c) implemented both bounds, added claim `OC228-4-one-block`, and split validity into a *cap* check and an *expiry* check.

**What I'd tell the next person.** **Write the failing test before the guard.** All three were assertions that outran their implementation — (c) is literally `FAILURES.md` #1's mechanism a third time, committed *inside the artifact built to catch it*. And the meta-lesson: **a checker must be checked.** Ours now proves it can fail before it reports a pass.

**Cost:** ~90 minutes. **Verified:** `eval/tamper.py` committed, 5/5 attacks caught; `self_conformance.py` self-test 3/3; `make demo` prints the two new clause-cited refusals; CI at `.github/workflows/conformance.yml`.

---

## #4 · 2026-08-26 — The tamper suite silently became a no-op, and reported success for it

**What broke.** `make verify` suddenly reported two of five attacks uncaught:

```
[PASSED] edit a payload in place   → ledger OK
[PASSED] re-forge the whole chain  → ledger OK
```

The ledger had not regressed. **The attacks had.** Both mutations flip `payload["decision"]` to `"authorised"` — and after the demo was rewired, the entry at `seq 0` *already* held `"authorised"`. The mutation changed nothing, an unchanged log naturally verifies, and the suite dutifully reported the ledger was broken.

The result was **data-dependent**: the same code reported CAUGHT or PASSED depending on what the demo happened to write that day. A tamper suite whose verdict depends on unrelated content is not a test.

**How I got out.** The mutation now writes a sentinel that cannot already be present, and **asserts the payload actually changed** before the attack is allowed to count. The runner separately re-reads the file and, if the bytes are identical, prints `[VACUOUS]` and fails rather than passing:

```
assert before != after, "vacuity guard: mutation was a no-op, attack proves nothing"
```

**What I'd tell the next person.** This is the **third** time the same shape has appeared in this project: `self_conformance.py` had no possible true positive (#3); one of my own unit tests asserted on integer values that collide by coincidence; and now the tamper suite. **The pattern is always a check that can silently do nothing while reporting success.**

It is the identical failure to the one the project exists to catch — a confident report that outran what was actually verified — only pointed inward. Corpus finding, for context: **0 of 224 winner repos ship an ablation**, and the reason is visible here. Verifying that your verifier can fail is *more* work than writing it, and nothing forces you to do it.

**The rule now applied everywhere:** *a check must prove it can fail before its pass is believed.* `self_conformance.py` runs three known-bad fixtures first. `eval/tamper.py` asserts its mutation bit. `eval/harness.py` refuses to print a headline below the committed n.

**Cost:** ~25 minutes. **Verified:** 5/5 attacks caught with the guard active; guard itself proven by asserting on a no-op mutation.

---

## #5 · 2026-08-26 — The honesty harness reported a metric over an empty positive class

**What broke.** An external reviewer read the committed eval output and asked what the 14 scored cases actually were. They were 6 conformant controls and 8 merchant profiles with no UPI handler at all.

**Zero violations. The positive class was empty.**

`detected = 0`, `true_fail = 0`. A detection rate of **0/0** measures nothing, and the harness printed it as a result — under a header explaining how careful it was being about effective *n*. The component whose entire purpose is to prevent a compromised measurement target had one.

A second bug sat underneath. Eight cases carry the label `UNDETERMINED`, which `run_batch()` handled in neither the PASS nor the FAIL branch: they inflated `scored` to 14 while belonging to no class. The suite already asserts `true_pass + true_fail == scored` — **and passed**, because the fixture contained no `UNDETERMINED` labels. The test was fixture-blind. Real numbers: `scored=14`, `true_pass+true_fail=6`.

**How I got out.**
- The harness now refuses when `true_fail == 0`, with reason `VACUOUS`, and prints the size of the positive class beside every headline.
- Separated two things that were conflated: **`unlabelled`** (no ground truth exists — the case cannot test anything) from **`undetermined`** (ground truth exists and the engine abstained). Only the second is a system behaviour worth reporting.
- Replaced the fixture-blind test with one that includes an `UNDETERMINED` label, plus a test asserting an all-controls pool is reported as vacuous.

Honest output now: `6 scored / 14 attempted (8 unlabelled, 0 abstained)`, `positive class: 0`, `VACUOUS`.

**What I'd tell the next person.** **A metric can be vacuous in two directions, and everyone only checks one.** The field's known failure is a positive class so easy that a stump predicts it. This is the mirror image — a positive class so empty that nothing *can* be predicted — and it is harder to see, because every individual number looks defensible. `detected: 0` reads as modest rather than as broken.

Ask of any evaluation: **how many true positives are in the denominator, and what would it take for this number to be wrong?** If nothing could make it wrong, it is not a measurement.

This is the **fifth** instance of one shape in this project: a check that can silently do nothing while reporting success. It found me in the CI gate (#3), the tamper suite (#4), a unit test, and now the eval harness itself.

**Cost:** ~35 minutes. **Verified:** `make eval` exits 2 with `VACUOUS`; 97 tests pass including two new regression tests; the invariant now holds on production data.
