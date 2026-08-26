# AgentA review — `ARCHITECTURE.md` (final)

**Reviewed:** 2026-08-26 · **Corpus:** 224 winner/finalist repos (n=99 + n=125) + 31-repo control cohort · **Rubric:** `THE_REAL_RUBRIC.md`, recovered verbatim · **Prior:** `REVIEW_v1.md` (49) · `REVIEW_v2.md` (78)

**I ran everything.** `make demo`, `make verify`, `make eval`, and six attacks of my own against `gate/ledger.py` and `eval/self_conformance.py`. Nothing below is inferred from prose.

---

## 0. Measurement, before scoring

**Word count.** The claimed **974 is honest and I reproduced it to within one word (973)** — fenced code stripped, table separator rows stripped, pipes treated as whitespace. Naive `split()` with fences stripped gives **1,186**. Both counts are defensible; the author is not undercounting in bad faith. Growth vs v2 is **+46%** by the author's method, **+77%** by mine. 6 tables, 2 ASCII blocks, 0 Mermaid, 0 rasters.

**The v2 −4 is discharged.** Every named entry point now exists and runs:

| Command | Result | Time |
|---|---|---|
| `make demo` | 2 refusals + 1 allow, appended to ledger, exit 0 | instant, no network |
| `make verify` | `12 entries verified (forward, backward, HEAD-anchored)` + self-conformance, exit 0 | instant |
| `make eval` | `NOT YET IMPLEMENTED`, **exit 2** | instant |

**Does the demo output match the doc?** Substantively yes — the refusal codes, circulars, clauses, quotes and detail strings are character-identical. **"Verbatim" is not literally true:** the doc inserts line breaks and two-space continuation indents that the program does not emit, drops the `── make demo ──` header, and drops the trailing `ledger: OK — 12 entries verified` line. In a document that trades entirely on precision, using the word *verbatim* for a reflowed excerpt is a self-inflicted wound. Cost: nothing scored, but fix it — the real output pastes fine.

### Falsification pass — three claims fail

| Claim | Status |
|---|---|
| `make demo` prints the refusal string | **TRUE.** Reproduced. |
| `decide()` is pure — no network, no clock read | **TRUE.** `now_ts` is injected; `STORE` is a local JSON read at import. |
| Genesis anchored to corpus manifest | **TRUE.** `genesis()` hashes `corpus/claims/authoritative.json`. |
| HEAD commits to length + tip | **TRUE**, and it does catch partial truncation — **but see attack #6 below.** |
| *"Five tamper attacks are scripted."* | **FALSE.** `grep -rn tamper gate eval tools` → nothing. There is no attack script anywhere in the repo. The results table is prose about an experiment a judge cannot re-run. |
| *"A gate check that names no clause fails CI."* | **FALSE, twice over.** There is no CI — `.github/` does not exist. And I defeated the check in one line (below). |
| Money path enforces *"one block per (customer, merchant) [OC-228 §4]"* | **FALSE.** `merchant_id` / `customer_id` appear only in a docstring. No such check exists in `decide.py`. |
| Money path enforces *"validity ≤ 90d [OC-228 §5]"* | **FALSE.** `decide()` checks `now_ts > block["expires_ts"]` — that is *expiry*, not a *cap*. A merchant declaring a 365-day block is authorised. Worse, the refusal detail string prints `validity capped at 90 days` while performing a different check, so the citation is actively misleading. |

**No fabricated world-facts.** As in v1 and v2, every external numeric (OC-228, OC-201, SEP #216, 2,282 doc URLs) survives contact with its primary source. The failures above are all *internal*: the prose outruns the code it now ships alongside.

### Attack 1 — I defeated `eval/self_conformance.py` in one line

```python
return Decision(allowed=False, code="silent_refusal_no_clause")
```

Inserted into `decide()`, this is a refusal that names no clause. Result:

```
self-conformance: 3 claims cited, 5 in store
CI exit=0        ← the check passed
```

The mechanism: the refusal loop is guarded by `if n.args and isinstance(n.args[0], ast.Constant)`. **Keyword arguments produce an empty `n.args`, so the entire check is skipped.** The vacuity guard does not save it — that guard only counts `_claim()` citations, which are untouched.

**It is worse than that. The check has no possible true positive against idiomatic code in this file.** Every real refusal passes `c["clause"]` — an `ast.Subscript`, not an `ast.Constant` — so `isinstance(n.args[2], ast.Constant)` is False and the branch never fires. The only shape it can catch is `Decision(False, "x", "")`, a literal empty string nobody writes, and the one call site that *does* use a literal (`idempotency_replay`) is explicitly exempted. It also reads exactly one file, so any second gate module is unchecked.

The document quotes `planbound`'s honesty box in `eval/batch.py` — *"a verification surface that silently verifies nothing looks like evidence"* — and then ships precisely that in `eval/self_conformance.py`. This is the sharpest finding in the review.

### Attack 6 — total erasure defeats the HEAD anchor

`FAILURES.md` #2 says tail truncation and re-forge are *"now caught."* Truncating to **zero** is not:

```
$ rm eval/ledger.jsonl        # HEAD left in place, committing to 12 entries
$ make verify
ledger OK — empty
exit=0
```

`verify()` returns `(True, "empty")` before HEAD is ever consulted. Delete the whole audit log and the verification surface reports OK. Attack #4 in the doc's own table — *truncate the tail* — taken to its limit, still passes. The fix is a one-line reorder (check HEAD before the empty short-circuit), but as shipped, **the ledger fails open on total erasure in a system whose stated policy is fail-closed.**

---

## 1. Score table, with deltas vs v1 and v2

### FORM — 33 / 40 (v1: 21 · v2: 32) · **Δ +1**

| Dimension | v1 | v2 | **final** | Δ | Justification (anchor) |
|---|---:|---:|---:|---:|---|
| **Runnability** | 3 | 8 | **10** | **+2** | The v2 liability is now the strongest asset in the repo. Three commands, all real, all run in under a second with no network, and `make eval` **exits 2 deliberately** — a designed refusal to report a number, which is rarer than any metric. Anchor: Quick Start is the **#1 section at 73–86%**; pillar 2 is verbatim *"does it run."* **−2:** `git clone …` still has a literal ellipsis where the URL goes — a judge cannot execute line 1 of the Quick Start. No Python version pin, no `requirements.txt`, no prerequisites (a `.venv` exists but is undeclared). And a fresh clone that has never run `make demo` will get `ledger OK — empty` from `make verify`. |
| **Length discipline** | 5 | 7 | **6** | **−1** | 973 words against a corpus median of **137** (protocol/AI) and **89** (corpus 3, n=25). The +46% growth bought real content — component table, Status, ledger attack results, residual limit, discovery disclosure — every item I asked for in v2, and none of it filler. **But it crossed from dense into duplicative**, which is new and is why this drops. The ledger attack table is reproduced near-verbatim in `FAILURES.md` #2; the residual-limit paragraph now appears **three times** (here, `FAILURES.md`, and the `gate/ledger.py` docstring) in almost identical words. That duplication did not exist in v2 because the other files did not. Anchor: *"density beats completeness"* — and 973 is 3% from the −8 cliff on the author's own count, over it on mine. |
| **Artifact choice** | 5 | 6 | **6** | 0 | **Full marks, held.** 6 tables, 2 ASCII blocks, 0 Mermaid, 0 rasters, everything regenerable. Corpus **ASCII 20 : Mermaid 8**; the restored `Component \| LLM? \| Job` table is the corpus's densest artifact type (**component topology 11×**) with an ownership column, and it is the right thing to have brought back. Avoids the corpus's real diagram failure (`Unknown1502/Compliance-Guardian-AI`: six purpose-built PNGs the README references zero times). |
| **Judge-first ordering** | 5 | 7 | **7** | 0 | **Orphaning is fully closed and that was existential.** `README.md` at 152 words leads with the problem, carries a **runnable curl** whose output is the entire market thesis, and links to both other files. Anchor: **0/22 winners lead with the problem**; **0/22 authored an ARCHITECTURE.md at all** — a judge arrives at the repo root and now finds one. **−1, and the reason changed:** `## Status` — the section that tells a reader most of this system is unbuilt — sits **8th of 10**. Nine sections of confident present tense precede it. Corpus anchor cuts the other way here: architecture heading position is **median 3rd**, and the *Judge-first* structure I hold up as the winning shape puts `## Status` before `## Verify`, not after everything. A judge who stops at 60% of this file leaves with a materially wrong impression of what exists. |
| **Claim-then-proof** | 3 | 4 | **4** | 0 | **Held, and the reason it held is the finding of this review.** The gain is real: the demo output is now the product's own stdout, which **no repo in 224 has as a proof anchor**, and I reproduced it. The loss cancels it exactly: **three claims in this document are falsified by the code it ships with** — the tamper script that does not exist, the CI check that neither exists nor works, and two of five advertised money-path bounds that are not implemented. Anchor: unanchored assertion is *"the corpus's most common weakness."* v2's problem was claims about absent files. This is worse in kind: **the files are present and contradict the prose**, so the claims are now cheaply falsifiable by exactly the payments engineers judging this. |

### SUBSTANCE — 50 / 60 (v1: 40 · v2: 50) · **Δ 0**

| Dimension | v1 | v2 | **final** | Δ | Justification (anchor) |
|---|---:|---:|---:|---:|---|
| **Money-path safety** | 10 | 10 | **10** | 0 | **Held by an even trade, for the second review running.** Credit: the prompt-injection paragraph is **restored** — *"the gate reads the claim store, never raw merchant text"* — closing the v2 deletion I explicitly ring-fenced, and it is the answer to the first question any competent reviewer asks of a document-reading payment agent. `decide()` is genuinely pure: I confirmed no network, no clock read, injected `now_ts`, integer paise throughout, refusal-before-403 ordering, `_claim()` refusing to authorise on a non-`RESOLVED` claim. Refusals carry code + circular + clause + verbatim quote — that clears *"every money action explainable, bounded and gated"* and beats `RequestTap/RequestTap-Router`'s DENIED-as-outcome-class. **−2:** two of the five bounds in the ASCII diagram are not enforced (per-pair uniqueness absent entirely; validity checked as expiry not as a cap, with a refusal string that misdescribes its own check). And the LLM is out of the money path partly because **there is no LLM anywhere yet** — `verdict` is hardcoded `"PASS"` in `eval/demo.py`, so the first gate check has no producer. |
| **Audit trail** | 7 | 9 | **8** | **−1** | **The best-designed component in the repo, downgraded for a hole I found in the fix.** HEAD anchoring is built and works — I confirmed length and tip commitments both fire. Genesis anchored to the corpus manifest genuinely binds ledger to constraint store. Verdicts re-derive from a three-part key, all three recorded. And the **residual-limit disclosure is real, not performative**: it is in the doc, in `FAILURES.md` #2, and in the `verify()` docstring where a maintainer will actually hit it; it names the threat model precisely (*"proves internal consistency, not authenticity"*), names the fix (external timestamping / append-only remote), and says **"Not implemented."** Against **33% audit/provenance** in the payments family and Kinora's self-issued attestation as the corpus standard, this is the strongest audit section I have scored. **−2:** (a) attack #6 — **deleting the log entirely returns `ledger OK`**, so the truncation class the HEAD anchor was added to close is not closed; (b) the five attacks are **not scripted in the repo**, so the one table of measured results in the entire document is unreproducible prose. |
| **Failure handling** | 7 | 9 | **9** | 0 | **Held.** Eight-row failure table, `RECONCILE_PENDING` with a containment action and a surfacing path, and the tradeoff **named**: *"Availability sacrificed to auditability."* Fail-closed argued in one sentence pricing both sides. `UNDETERMINED` is a designed outcome, not an error. `make eval` exiting 2 is a real, running, designed failure. Anchor: failure handling documented in **29% (protocol) / 1 of 22 (Google-NVIDIA)**; a *systematic* taxonomy appears **once in 224**. **−1:** my v2 ask did not land — there is still no **schema-violating extractor output** row, which is not the same as low confidence. The Google-NVIDIA absence list reads verbatim *"none has a 'what happens when the LLM returns garbage' section"*, and this remains free. |
| **Honest metrics** | 3 | 7 | **8** | **+1** | **The discovery-set disclosure is adequate, not self-serving, and it earns the point.** It names the mechanism (*"found by looking for drift"*), names the fallacy (*"selection-authored"*), downgrades its own number to an **existence proof**, and — the structurally smart move — **4/4 now appears nowhere except inside its own disclaimer.** It is never a headline. Against **0 of 224 repos** volunteering a weakness in their best number, this is the single most credible sentence available to this project and it is now written. **−4, unchanged in size:** Razorpay's bar is present tense — *"honest metrics including false-positive cost"*, *"an honest exception list"* — and **there are still zero results.** `make eval` exits 2. The Numbers table has one number, and it is disclaimed away. *"The N=50+ batch is the measurement"* is future tense wearing present-tense clothes; three rows (Ablation, Induced harm, Abstention) still contain no value. **Labels remain external** — NPCI, RBI, published specs — which is the project's best structural asset and keeps the −5 self-authored-ground-truth penalty off the table. |
| **Deliberate non-use of AI** | 9 | 10 | **10** | 0 | **Full marks, held.** Five-row placement table, each row argued rather than asserted, with the decisive line carrying its citation: naive regex reads OC-201 §7 and returns ₹15,000 per-transaction — *"the error that shipped in Razorpay's own SEP #216 and stood four months"* — and *"Drift #4 is semantic, not numeric; no regex reaches it."* Anchor: explicit non-use appears **2/45 and 0/22**; the recovered rubric calls *"and where you chose not to use one"* the most discriminating clause on the site. This remains the rarest asset in the document. |
| **Limitations / non-goals** | 4 | 5 | **5** | 0 | **Held, and the one that did not land is now the one that matters most.** Landed from v2: the ledger residual limit, disclosed in three places. Standing strengths: TSP stub with inline evidence (0 hits / 2,282 URLs), Reserve Pay **unverified** with a named probe that exists on disk, two sharp non-goals against **Non-Goals = 0 occurrences** in the Google-NVIDIA cohort and **`## Limitations` = 1 occurrence in 104** in corpus 3. **−1:** my other v2 ask — *"self-conformance is not independent validation"* — is still absent, and it has stopped being a rhetorical nicety. I defeated the check in one line; the document asserts it as a CI invariant. A limitations section that discloses the ledger's ceiling while asserting a conformance guarantee that does not hold is inconsistent with itself. |

---

## 2. Total and penalty ledger

| | v1 | v2 | **final** |
|---|---:|---:|---:|
| FORM | 21 / 40 | 32 / 40 | **33 / 40** |
| SUBSTANCE | 40 / 60 | 50 / 60 | **50 / 60** |
| Raw | 61 | 82 | **83** |
| Penalties | −12 | −4 | **−8** |

| Penalty | Applied | Reason |
|---|---:|---|
| Architecture section over 1,000 words | **not applied** (−8 avoided) | **973 by the author's method, reproduced independently.** Clears by 27 words. Applied on my naive count it would trigger; I take the author's method because it is reproducible and excludes markup, and I priced the bloat inside Length discipline instead of double-charging. |
| A claim with no proof anchor | **−4** | *"Five tamper attacks are scripted."* No script exists in `gate/`, `eval/`, `tools/`, or anywhere else. This is the **exact v2 sin recurring in a new location**: present-indicative assertion of an artifact that is not on disk. The one table of measured results in the document cannot be re-run by a judge. |
| A claim with no proof anchor | **−4 (stacked)** | *"A gate check that names no clause fails CI."* **I am stacking, and the root cause differs, which is my stated condition for stacking.** The first −4 is an absent artifact. This is a **present artifact that does not do what is claimed** — no CI exists, and the check itself is defeated by a keyword argument and has no possible true positive against the code it guards. v2's failure was unfalsifiable; this one I falsified in sixty seconds, and so can a judge. |
| Metric without effective n | not applied | Effective n is designed in and named; there is no headline value to attach it to. Already crushed at Honest metrics 8/12; applying it would double-count. |
| Self-authored ground truth as measurement | **not applied** | Labels are external and the document says so. The selection problem is now **explicitly disclosed** by the author, which is the fix I asked for in v2 and it landed. |
| Un-regenerable diagram as only artifact | not applied | ASCII + tables, zero rasters. |
| Invented / unverifiable fact | not applied | No fabricated world-fact in three reviews. Every external numeric survives its primary source. |
| LLM in the money path | not applied | Structurally excluded and argued. |
| **Total** | −12 | −4 | **−8** |

# **TOTAL: 75 / 100 — `ITERATE`** (v1: 49 · v2: 78 · **Δ −3**)

### Did this go backwards? Read this before reacting to the number.

**The document improved. The score fell. Both are true and they are the same event.**

Raw score rose 82 → 83. Runnability gained 2, Honest metrics gained 1, the orphaning risk that I called *existential* in v2 is gone, the prompt-injection deletion is repaired, the discovery-set disclosure is exactly right, and the ledger's residual limit is disclosed in three places. Nine of eleven dimensions are at or above their v2 value.

**What changed is that the claims became checkable, and three of them failed the check.** In v2 I could not test *"a gate check that names no clause fails CI"* because there was no gate and no check; it cost 0 directly. Now there is one, I attacked it, and it fell in a single line. Same for the tamper script and the two unenforced bounds. **Building the code did not create these defects — it exposed defects that were already in the prose and were previously unfalsifiable.** That is progress in engineering and a loss in scoring, and I am not going to launder the loss.

But be clear about the exposure. A Razorpay judge is a payments engineer. `eval/self_conformance.py` is **41 lines**. The distance between reading *"A gate check that names no clause fails CI"* and discovering it inspects one file for literal constants that no call site produces is about sixty seconds. That is the risk being priced, and it is correctly priced at −8.

**All three penalised defects are small code fixes, not rewrites.** Executed, this document is **87–88 and `SHIP`.**

---

## 3. Your six questions, answered

**Q1 — Is 974 words a regression?** *Mildly, and not for the reason you expect.* The content added is the content I asked for, all of it load-bearing, none of it filler. The corpus median is 137 and the control cohort proves **length does not correlate with winning** — so growth per se is not the charge. The charge is **duplication**, which is new: the ledger attack table and the residual-limit paragraph now exist in near-identical form in two and three files respectively. That was impossible in v2. Cut ~120 words of duplication (below) and 973 becomes ~850, which is the right size for a repo that also has a README and a FAILURES.md carrying load. **−1, not −8.**

**Q2 — Does a mostly-unbuilt system deserve substance points?** *Yes, but only the ones it earned, and it is closer to the line than the Status table admits.* Five of nine components are unbuilt, including **both LLM components** — so the entire *"Where the LLM is, and is not"* section, which is the document's rarest asset, describes software that does not exist. `verdict` is hardcoded `"PASS"` in `demo.py`; the first gate check has no producer. The model is out of the money path partly because there is no model. **However**: the gate, ledger, HEAD anchoring, claim store and refusal semantics are *built and I ran them*, and those are precisely the dimensions I scored (Money-path safety, Audit trail, Failure handling). I did **not** award substance for the unbuilt extractor. The `## Status` table is **honest, not hedging** — it names five unbuilt components without softening, and `make eval` exiting 2 rather than printing a placeholder number is the single most disciplined thing in the repo. Its defect is **position, not content**: 8th of 10, after nine sections of confident present tense. Move it to 3rd and the hedging question disappears entirely.

**Q3 — Is the discovery-set disclosure sufficient?** *Yes. It is the strongest sentence in the document and I want it protected.* It names the mechanism, names the fallacy by its correct name, and demotes the number to an existence proof — and structurally, **4/4 now appears only inside its own disclaimer and never as a headline**, which is more than I asked for. Against **0 of 224** repos volunteering a weakness in their best number, this is best-in-corpus. **It does not still inflate.** The remaining problem in that section is not 4/4 — it is that the other six rows are empty and *"The N=50+ batch is the measurement"* asserts in the present tense a measurement that exits 2.

**Q4 — Does `make demo` run, and match verbatim?** *Runs; matches substantively; "verbatim" is technically false.* Codes, circulars, clauses, quotes and detail strings are character-identical — I diffed them. The doc adds line breaks and indentation the program does not emit, and drops the header and the trailing ledger line. Fix by pasting the real output. Separately: the demo appends to a **committed** `eval/ledger.jsonl` on every run, so the count grows (it is at 12 from four runs). Not a doc claim, but a judge running it twice will see a different number than you do.

**Q5 — Is the residual-limit disclosure real or performative?** *Real — the most credible thing in the document — and simultaneously incomplete in a way the disclosure hides.* Real because it lives in `verify()`'s docstring where a maintainer hits it, names the threat model exactly, names the unimplemented fix, and says "Not implemented." Documenting a hole does **not** substitute for fixing it, and this document does not pretend otherwise — it fixed two of two attacks it found and disclosed the third class it cannot fix. That is the correct division. **But:** the disclosure scopes the residual risk to *"an attacker with write access to both the log and HEAD."* That is too narrow. **An attacker who simply deletes the log needs no write access to anything** and `make verify` prints `ledger OK`. The stated threat model is wrong in the permissive direction, which is precisely the failure `FAILURES.md` #2 exists to memorialise. One-line fix; move the HEAD check above the empty short-circuit.

**Q6 — Does `self_conformance.py` enforce what the doc claims?** *No. I defeated it in one line, and it has no possible true positive against the code it guards.* Keyword arguments empty `n.args` and skip the refusal check entirely. The vacuity guard does not cover this — it counts `_claim()` citations, which the attack leaves intact. And because every real refusal passes `c["clause"]` (an `ast.Subscript`, not an `ast.Constant`), the branch never fires on any existing call site; the only catchable shape is a literal empty string that no one writes, and the sole literal-bearing call is exempted. It also reads exactly one file. **Plus there is no CI** — `.github/` does not exist, so nothing runs it on push. The claim is false in two independent ways.

---

## 4. The three highest-leverage fixes

**1. Make the two verification surfaces actually verify. (~45 min → +9, and clears both −4s)**
Three edits, none large. (a) **`self_conformance.py`**: normalise keywords into positionals before inspecting (`kw.arg == "allowed"` / `"clause"`), reject any refusal whose clause argument is absent *or* is not a resolvable `_claim(...)` field, walk **every** module under `gate/`, and add a **self-test** — a fixture refusal with no clause that the check must catch, so the check is itself checked. (b) **`gate/ledger.py`**: move the HEAD comparison **above** `if not es: return True, "empty"`, so total erasure fails closed. (c) Commit **`eval/tamper.py`** running all six attacks and wire it into `make verify`, so the results table in the document becomes reproducible output instead of prose. Then add `.github/workflows/conformance.yml` running `make verify` — nine lines — so the word "CI" is true. This converts the document's two remaining liabilities into its second and third proof anchors. Claim-then-proof 4→6, Audit trail 8→10, Limitations 5→6, **−8 penalty cleared.**

**2. Reconcile the money-path diagram with `decide.py`. (~15 min → +2)**
Two choices per line, and either is honest. Implement the per-`(customer, merchant)` uniqueness check and a real `expires_ts - now ≤ 90d` **cap** (distinct from the expiry check), or **delete those two lines from the ASCII flow.** Also fix the `block_expired` refusal detail, which currently prints `validity capped at 90 days` while checking something else — a misleading citation in a system whose entire thesis is that citations must not drift from their source. This is `FAILURES.md` #1's exact mechanism, committed a third time. Money-path safety 10→12.

**3. Run the eval, or stop writing about it in the present tense. (~1 h → +3)**
Whichever comes first. If the batch runs, put one real value in every Numbers row — a rate, a rupee figure for the ablation, an integer for induced harm, a percentage for abstention — with effective n beside the headline. If it does not run by submission, retitle the section **`## Measurement plan`** and change *"The N=50+ batch **is** the measurement"* to *"**will be**"*. A correctly-shaped empty table under a heading that admits it is a plan costs nothing; the same table under `## Numbers` reads as a result that is missing. Honest metrics 8→11.

> Executed in full: **75 → 87–88 = `SHIP`.** Fix #1 alone reaches 84.

---

## 5. What to DELETE

The document is 973 words with ~120 of pure duplication that did not exist in v2, because `README.md` and `FAILURES.md` did not exist in v2. **Every cut below is a cut of something now stored twice.**

- **The five-row ledger attack table (≈70 words).** It is reproduced near-verbatim in `FAILURES.md` #2, which is one click away and which the README already points at. Replace with one line: *"Five tamper attacks scripted; two initially passed. Results and the fix: `FAILURES.md` #2, reproducible via `make verify`."* Keeps the honesty, loses the transcription. (Once fix #1 lands, that line points at running code, which is strictly better than a table.)
- **The residual-limit block quote (≈60 words) — cut to one sentence.** It now exists three times in near-identical words: here, `FAILURES.md` #2, and the `verify()` docstring. Keep *"A hash chain proves internal consistency, not authenticity. Closing that needs an anchor we do not control. Not implemented."* and let the other two carry the elaboration.
- **`"That is the only defence against the field's defining failure — every measured repo has a compromised measurement target."` (16 words).** **I asked for this in v2 and it did not land.** Keep the twelve words before it — *"Labels come from documents we did not write"* — which are the strongest in the section. Cut the em-dash clause: it is a claim about the field, unanchored in this file, and it tips from stating a property into arguing one's own superiority.
- **The three empty Numbers rows** (Ablation, Induced harm, Abstention) — **fill them or move them under `## Measurement plan`.** Do not leave them under `## Numbers`. See fix #3.

**Do not delete:** the two contradicting quotes and *"and this project itself"*; the invariant; the printed refusal output; the component table (restored correctly, corpus's densest artifact type); the LLM-placement table; the prompt-injection paragraph (restored correctly, do not remove it a second time); `RECONCILE_PENDING` and its tradeoff sentence; the fail-closed argument; the discovery-set disclosure; the `## Status` table; the `probe_testmode.py` disclosure. **Move `## Status` to third position** — that is a move, not a cut.

---

## 6. The 30-second judge test

A judge now lands on **`README.md`**, which did not exist in v2. In thirty seconds they retain, in reading order:

> *"Four live Indian D2C brands serve agentic-checkout profiles today. **None accepts UPI**, in a country that is 80%+ UPI."*
> `curl -s https://zouk.co.in/.well-known/ucp | jq '.ucp.payment_handlers | keys'`
> `["com.google.pay", "dev.shopify.card"]`
> *"including the two times this project committed the exact error it was built to catch."*

Then, if they open `ARCHITECTURE.md`:

> *"The model reads documents. The model never moves money."*
> `REFUSED cap_exceeds_authority · NPCI/UPI/OC No.228 Issuer §5 · "maximum of Rs.10,000 of block limit" · declared ₹25,000 > authorised ₹10,000`

**That is the best thirty seconds any document I have scored in this corpus delivers.** A market gap the judge can verify with one shell command, a one-line invariant, and a refusal string that is the program's own stdout. Corpus anchor: **0/22 lead with the problem**; **25% of corpus-3 winners have no human-written documentation at all**, one of them an Atlassian regional winner reading `# Forge Hello World`.

| Pillar | Verbatim test | Visible in 30s? | v1 | v2 |
|---|---|---|---|---|
| **1. Problem taste** | *"did you pick something that actually matters"* | ✅ two contradicting published documents + a live `curl` a judge can run | ❌ | ✅ |
| **2. Build quality** | *"does it run"* | ✅ **it runs — I ran it** | ❌ | ⚠️ |
| **3. AI judgment** | *"where you chose not to use one"* | ✅ invariant line 2, placement table section 3 | ❌ | ✅ |
| **4. Failure recovery** | *"what broke, and what you did about it"* | ✅ two entries, one of them a false security claim the author attacked and broke | ❌ | ✅ |

**Four of four, and pillar 2 has flipped from warning to clear** — which is the pillar that carried the v2 −4. What the thirty-second reader does **not** learn is that five of nine components are unbuilt; `## Status` is 8th. And the thirty-*minute* reader — the one who opens the 41-line `self_conformance.py` — finds the claim that costs this submission eight points.

---

## 7. Verdict

# `ITERATE` — 75 / 100 (v1: 49 · v2: 78)

**The three-review arc is 49 → 78 → 75, and the dip is not decay.** Raw score rose every time (61 → 82 → 83). What moved is the penalty ledger, from −12 to −4 to −8, and it moved because **the document stopped making claims that could not be checked and started making claims that could.** Three of those failed. The corpus finding that governs my scoring — *"rigor tracks being required to, not placing well"* — cuts here in the author's favour: nobody made you write a tamper table or a CI invariant, and the ones you wrote are the ones that broke.

**What is genuinely excellent and should not be touched:** the demo output as a proof anchor (**0 of 224** repos have one); the discovery-set disclosure (**0 of 224** volunteer a weakness in their best number); the deliberate-non-use table (**2 of 45**); `make eval` exiting 2 rather than printing a number; the residual-limit disclosure in the docstring; and `FAILURES.md` #2, which is the register of a senior engineer and which almost no hackathon submission in 224 repos attempts.

**What holds it at 75 is three small lies told by an otherwise honest document.** A tamper script that is not in the repo. A CI check that neither exists nor works. Two money-path bounds drawn in the diagram and absent from `decide.py` — which is `FAILURES.md` #1's mechanism, *a confident restatement that outran its source*, committed for the third time, inside the artifact built to catch it. The irony is not the point; the exposure is. All three are code fixes measured in minutes, and all three are found by a judge in under two minutes.

**One session — about ninety minutes on fixes 1 and 2 — reaches 87 and `SHIP`.** The document is no longer the problem and the repository is no longer the problem. **The gap between them is.**

---

*Reviewed against `research/12_architecture_corpus/` (224 repos + 31-repo control) and `research/00_competition_context/THE_REAL_RUBRIC.md`. Every scoring claim carries an anchor. Every named artifact was checked on disk; `make demo`, `make verify` and `make eval` were executed; `eval/self_conformance.py` and `gate/ledger.py` were attacked directly and both were defeated, with the defeating input recorded above and the working tree restored afterward. Where I departed from a corpus anchor — declining to apply the −8 length penalty on my own higher word count, on the grounds that the author's counting method is reproducible and excludes markup — I said so and gave the reason.*
