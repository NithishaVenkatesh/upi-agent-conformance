# AgentA review — `ARCHITECTURE_v2.md`

**Reviewed:** 2026-08-26 · **Corpus:** n=99 winner/finalist repos + 31-repo control cohort · **Rubric:** Razorpay four pillars, recovered verbatim · **Prior:** `REVIEW_v1.md` (49/100 REWORK)

**Scored fresh.** I re-derived every dimension from the text before opening v1, then computed deltas.

**Measured first.** **668 prose words** excluding fenced code (768 including). The author reports 622; the difference is tokenisation of table cells and `§`/`₹` glyphs. Either count clears the 1,000-word threshold by a wide margin. 26 table rows across 5 tables, 2 code fences, 1 ASCII diagram, 0 Mermaid, 0 rasters.

**Falsification pass, before scoring.** I attempted to break the load-bearing facts:

| Claim in v2 | Status |
|---|---|
| *"0 hits across 2,282 doc URLs"* | **Corroborated** — `research/01_razorpay_signals/india_rails_delegated_payments.md:397` and `07_razorpay_winning_intersection/THE_LEGAL_SPINE.md:82`, against Razorpay's own `sitemap/razorpay/IN/urls.txt`. |
| *"five drifts, across two companies and this project itself"* | **Corroborated** — `FINAL_IDEA.md` table: Razorpay ×3, Cashfree ×1, ours ×1. Arithmetic is exact. |
| OC-228 §2 *"shall not be treated as the guarantee of payment"* | **Verbatim**, checksummed corpus present at `corpus/npci/`. |
| Razorpay *"Guaranteed Collection"* | **Verbatim**, `corpus/primary_sources/rzp_reserve_pay.html`. |
| SEP #216 3× error / OC-201 §7 | **Corroborated** in `FINAL_IDEA.md` and `01_razorpay_signals/`. |
| `tools/probe_testmode.py`, `.env.example` | **Exist on disk.** 131 lines. |
| `Makefile`, `README.md`, `gate/decide.py`, `eval/self_conformance.py`, `.github/workflows/conformance.yml`, `eval/report.md` | **Do not exist.** This governs Q2 and Q5 below. |

**No fabrication found.** Every world-fact in this document survives contact with its source. That was true in v1 and remains true.

---

## 1. Score table, with delta vs v1

### FORM — 32 / 40 (v1: 21) · **Δ +11**

| Dimension | v1 | v2 | Δ | Justification (anchor cited) |
|---|---:|---:|---:|---|
| **Runnability** | 3 | **8** | **+5** | The word *"Target:"* is gone and what replaced it is the right shape: four commands, an env step, a runtime (`~90s`), and — the move that matters — **the expected output of a refusal, printed**: `REFUSED cap_exceeds_authority · OC-228 §5 · "maximum of Rs.10,000 of block limit" · declared ₹25,000`. A judge sees the system's central behaviour *before* deciding whether to clone. Anchor: Quick Start is the **#1 section at 86% (protocol) / 73% (Google-NVIDIA)**; pillar 2 is verbatim *"does it run."* **−4:** of the five entry points named, **none exists** — no `Makefile`, no `README.md`, no `gate/`, no `eval/`, no `.github/`. Also no prerequisites (runtime, Docker, ports), and `git clone …` has an ellipsis where the URL goes. See Q2. |
| **Length discipline** | 5 | **7** | **+2** | 668 prose words, down 36% from 1,040, with **more** substance (see Substance +10). That is density improving, not content being traded away — the rare test of whether a cut worked. Zero filler paragraphs, zero tech-stack padding, no sentence about the document itself. Anchor: *"tables carry more architecture than diagrams"* — v2 is now 5 tables and 1 ASCII flow. **−1:** the cut went one section too far. The v1 `Component \| Deterministic? \| Responsibility` table is gone and nothing replaced it; a reader can no longer enumerate the system's parts or see which are deterministic. That table was structurally identical to Aegis's `Layer\|Job\|Owner\|Invariant`, the densest artifact in the corpus. |
| **Artifact choice** | 5 | **6** | **+1** | **Full marks.** ASCII money-path flow (corpus **ASCII 20 : Mermaid 8**), five tables, every artifact regenerable, zero rasters — avoiding the corpus's real diagram failure (`Unknown1502/Compliance-Guardian-AI`: 6 purpose-built PNGs, README embeds none; **5 of 14** diagram-bearing Google-NVIDIA repos are raster-only). The corpus-**modal** artifact — the unlabelled component graph — is correctly deleted. Loss of the Mermaid sequence diagram (rare: **3/45, 3/22**) is offset: the ASCII flow **preserves order**, including the load-bearing detail that `ledger.append(REFUSED)` precedes the 403. |
| **Judge-first ordering** | 5 | **7** | **+2** | The largest structural improvement in the rewrite. It now leads with the problem — **0/22 and 5/45 do**, free differentiation, declined in v1 and taken here — and the problem is a **first-party contradiction between two published documents**, checkable by a judge in ten seconds. Then four words do enormous work: *"and this project itself."* That puts **pillar 4** — *"what broke, and what you did about it,"* which Razorpay says *"is the one we read first"* — above the fold, in a document that had no trace of it in v1. The invariant now lands as a **consequence** rather than an assertion. **−1:** no *"Judges start here"*, and no link to `FAILURES.md`, the video, or `eval/report.md` — the four words promise a story the file never points at. |
| **Claim-then-proof** | 3 | **4** | **+1** | v1 had zero file paths in 1,040 words; v2 names six artifacts in 668 — `gate/decide.py`, `eval/self_conformance.py`, `.github/workflows/conformance.yml`, `tools/probe_testmode.py`, `eval/report.md`, `make verify`. The clause-per-gate-check habit survives and is now joined by clause-per-refusal *in the printed output*, which is the strongest form of this pattern I have seen in any corpus: the proof anchor is the product's own stdout. **−2:** four of six named artifacts don't exist, and the imported numerics are still unanchored *here* — *"2,282 doc URLs"*, *"SEP #216"*, *"four months"* are all verbatim-sourced two directories away and cite nothing in this file. Anchor: unanchored assertion is *"the corpus's most common weakness."* |

### SUBSTANCE — 50 / 60 (v1: 40) · **Δ +10**

| Dimension | v1 | v2 | Δ | Justification (anchor cited) |
|---|---:|---:|---:|---|
| **Money-path safety** | 10 | **10** | **0** | **Held — but not by standing still.** Two v1 deductions are fixed: *Constraint store unavailable → fail closed* is now an explicit row, and `UNDETERMINED → refuse` closes the missing-verdict gap. The seven ordered checks survive **with their clause references**, the pure-function claim survives and now names its module, and the refusal payload survives intact. That still clears the Razorpay bar verbatim — *"every money action explainable, bounded and gated"* — and still beats `RequestTap/RequestTap-Router`'s DENIED-as-outcome-class because the refusal carries the authorising clause. **The two fixes were cancelled by one deletion.** v1's prompt-injection bullet — *"the gate reads the **store**, never raw merchant text"* — is gone. For a payment agent whose primary input is **adversarial merchant-authored documents**, that is the second-most-important safety property in the system after "no LLM in the money path," and my v1 review explicitly said keep it. Net zero. See Q1. |
| **Audit trail** | 7 | **9** | **+2** | `H` is now `SHA256`, `canonical_json()` resolves the length-prefix ambiguity I flagged, and **genesis is anchored to the corpus manifest hash** — a better move than the one I asked for, because it binds the ledger to the constraint corpus: you cannot swap the corpus and keep the ledger. Bidirectionality is now **argued**, not asserted: *"a forward-only walk passes trivially if entries are truncated"* — the correct reason, and absent from all 15 corpus repos that document an audit trail. `extractor_version` added to the re-derivation key, resolving the §4.2/§5 contradiction that made v1's headline reproducibility claim false. **−1:** the chain is **still unanchored** and the limit is **still not disclosed**. No signature, no published head, no external timestamp. Kinora is the corpus standard here — *"the compliance attestation is **self-issued**… not third-party verification"* — and one sentence would close it. This was deduction (a) in v1 and it did not land. |
| **Failure handling** | 7 | **9** | **+2** | Both v1 deductions addressed, and the harder one addressed well. The **ledger-append-after-capture** row is present with a designed response (`RECONCILE_PENDING`), a containment action (block further authorisations for that block), a surfacing path (`make verify`), and — the part that earns the points — the **tradeoff named**: *"Availability is sacrificed to auditability."* Nothing in the 99-repo corpus does this; **only one repo has a systematic failure taxonomy at all** (29% protocol / **1 of 22** Google-NVIDIA). And fail-closed is now **argued** in one sentence that prices both sides: *"a refusal costs a sale, an unbounded debit costs trust and is unwindable only by dispute."* The rubric asks *"fail-closed or fail-open, and is the choice argued?"* — that is an argument. **−1:** the third missing row is still missing — **extractor returns schema-violating garbage**, which is *not* the same as low confidence. The Google-NVIDIA absence list reads verbatim *"none has a 'what happens when the LLM returns garbage' section."* Clock skew was also dropped in the cut. |
| **Honest metrics** | 3 | **7** | **+4** | **The biggest single gain, and still the weakest dimension.** Every structural element Razorpay demands is now named in one place: effective n beside the headline, a deployable baseline, an ablation denominated in **rupees**, induced harm *"same table, same font"*, abstention counted separately, and external label provenance. Against **EVAL.md 0/99 · ablations 0/99 · held-out P/R 0/99**, this is more measurement *design* than exists in the entire corpus, and the rubric is explicit that *"that gap is the entire opportunity."* **−5, and the reason is Q3:** four of seven cells contain **no number**. *"N=50+"* is a sample-size target, not a result. *"claims parsed / attempted, printed beside the headline"* is a description of a field. *"harm reported in rupees"* names no rupees. The one filled cell — **4/4 out-of-sample** — is the four drifts found by hand during research, now re-presented as a test set. That is **selection-authored**, and it is exactly what *"one cherry-picked match proves nothing"* warns about, four times. See Q3. |
| **Deliberate non-use of AI** | 9 | **10** | **+1** | **Full marks, and every v1 criticism landed.** (a) Position: it was §7, below the data model; it is now section 3 of 8, above the failure table. (b) The buried sentence is **promoted and expanded** — the naive-regex-reproduces-a-shipped-3×-error claim now carries its citation (SEP #216, OC-201 §7, *"stood four months"*) and the decisive line *"Drift #4 is semantic, not numeric; no regex can reach it."* (c) The mislabelled title is fixed: *"Where the LLM is, and is not"* — it is a placement table and now says so. Against **2/45 and 0/22**, this remains the rarest asset in the document and a direct strike on what the recovered rubric calls *"the most discriminating clause on the entire site"* — *"and where you chose not to use one."* |
| **Limitations / non-goals** | 4 | **5** | **+1** | Non-goals now present and sharp (*"Not a general contract analyser"*, *"Not a fraud, ML-risk or recovery system"*) against **0/22 in the Google-NVIDIA cohort**, where Non-Goals is on the zero-occurrence list. TSP stub carries its evidence inline. And the strongest line in the section is new: *"Reserve Pay in test mode is **unverified** at time of writing; probe: `tools/probe_testmode.py`"* — disclosing an **open kill-gate** in the architecture document, with a named probe that **actually exists on disk**. That is the register of `Hourglass`'s *"Defect: the DCA per-swap cap does not bind"* and it is why this section reads as credible rather than defensive. **−1:** the two disclosures I asked for are still absent — the ledger chain is unanchored/self-issued, and `self_conformance` checking the system against its own corpus is **not independent validation**. |

---

## 2. Total and penalty ledger

| | v1 | v2 | Δ |
|---|---:|---:|---:|
| FORM | 21 / 40 | **32 / 40** | **+11** |
| SUBSTANCE | 40 / 60 | **50 / 60** | **+10** |
| Raw | 61 | **82** | **+21** |
| Penalties | −12 | **−4** | **+8** |

| Penalty | Applied | Reason |
|---|---:|---|
| Architecture section over 1,000 words | **not applied** (was −8) | **668 prose words measured.** Cleared. |
| A claim with no proof anchor | **−4** | Applied **once**, for `` `make demo` prints a real refusal: `REFUSED cap_exceeds_authority…` ``. The word *"prints"* in the present indicative, and the word *"real"*, assert **observed program output** for a program that does not exist — no `Makefile`, no `gate/`. This is a stronger assertion than v1's *"Target:"*, and therefore a different failure, not the same one renamed. I do **not** stack further −4s for the other four missing artifacts; they are already priced into Runnability 8/12 and Claim-then-proof 4/6, and double-counting would be dishonest. |
| Metric without effective n | not applied | Effective n is explicitly designed in and named. There is no headline **value** to attach it to — the absence is total, and it is already crushed at Honest metrics 7/12. Applying this would double-count the same hole. |
| Self-authored ground truth as measurement | **not applied — but read this** | **Labels** are external (NPCI, RBI, published PSP specs, live UCP declarations) and the document says so plainly. That is clean and it is the project's central asset. **Sample selection is not.** The four out-of-sample documents were *found* during research; presenting 4/4 on the discovery set as out-of-sample performance is a selection artefact, not a self-authored label. It does not trip this penalty as written. It is nonetheless the **highest-integrity-risk sentence in the document** and fix #2 addresses it. |
| Un-regenerable diagram as only artifact | not applied | ASCII + tables. Fully regenerable. |
| Invented / unverifiable fact | not applied | Falsification pass above. Every load-bearing numeric survives contact with a primary source in this repository. |
| LLM in the money path | not applied | Structurally excluded, and now argued rather than asserted. |
| **Total** | −12 | **−4** | |

# **TOTAL: 78 / 100 — `ITERATE`** (v1: 49 · **Δ +29**)

### Is iteration improving the document, or churning it?

**Improving, and the shape of the gain proves it.** Churn would show as points moving between dimensions at constant total, or as FORM rising while SUBSTANCE fell. Neither happened:

- **SUBSTANCE gained 10 points while the document lost 36% of its words.** That is the definitive test and it passes. Compression did not buy form with substance; it bought both.
- **Gains are distributed across 9 of 11 dimensions**, not concentrated in one rewrite-sensitive area. Nothing regressed to a lower score.
- **Every specific v1 defect I named was addressed except three**, and all three are named below.
- Two dimensions hit their ceiling (Artifact choice 6/6, Non-use of AI 10/10) — the remaining headroom is now genuinely concentrated, which is what a converging document looks like.

The one thing that *did* churn: Money-path safety held at 10/12 by **fixing two things and deleting a third**. That is the failure mode this rewrite was at risk of, it occurred exactly once, and it is fix #3.

---

## 3. Your five adversarial questions, tested

**Q1 — Did compression destroy substance? Money-path safety was 10/12, non-use 9/10. Did they survive?**

**Non-use survived and improved to 10/10.** All three of my v1 sub-criticisms — position, buried uncited sentence, mislabelled title — were fixed, and the trim from 7 rows to 5 is a genuine improvement (merging *limit arithmetic* + *retry accounting* into *"Gate, arithmetic, retry count"* loses nothing and reads faster). This is the clearest evidence that the cut was executed with judgment rather than a word budget.

**Money-path safety survived at 10/12 but through an unlucky exchange.** Everything load-bearing is intact — seven ordered checks with clauses, integer paise, pure function, refusal-before-403, refusal payload with clause and quote. Two v1 deductions were repaid. But **the prompt-injection bullet was deleted**, and my v1 review explicitly ring-fenced it: *"Keep only the prompt-injection bullet. It is the one bullet that is architecturally load-bearing."* The rest of §8 deserved to die and did. That one did not. This system's entire input surface is documents written by the counterparty it is deciding whether to pay; *"the gate reads the **store**, never raw merchant text"* is the answer to the first question any competent reviewer asks, and it is now unstated.

**Two other losses, both real, neither fatal:**

- **The component inventory.** v1's 9-row `Component | Deterministic? | Responsibility` table is gone. This is not a data model — it is the map of what is and is not deterministic, i.e. the invariant made auditable per-component. Corpus anchor cuts *for* restoring it: **component topology appears 11×**, it is the single most-documented architecture artifact, and the version with an invariant/owner column is the densest thing in the corpus.
- **The ingestion pipeline and the claim schema fields.** `value_minor_units · unit · scope · subject · clause_ref · page · verbatim_quote · confidence` is gone. `verbatim_quote` and `confidence` are the mechanism behind two of v2's headline behaviours — the quoted clause in the refusal string, and `UNDETERMINED`. v2 exhibits both and explains neither. (I still stand by deleting the *data model*; this is not that. This is the provenance of the quote.)

**Verdict on Q1: no, compression did not destroy substance — with one named exception and two named omissions, totalling ~120 words to restore against 330 words of penalty-free headroom.** You did not trade substance for form. You lost three specific things while gaining ten.

---

**Q2 — Are the commands real, or is naming non-existent files the same sin as "Target:"?**

**It is a different sin, currently worse, and about to be much better than either.**

*"Target: `make demo` works"* is an **admission of non-existence**. It is honest and worth nothing — a judge reads it, learns the thing does not run, and stops.

*"`make demo` prints a real refusal: `REFUSED cap_exceeds_authority…`"* is an **assertion of existence** that is false today. Epistemically that is worse: a reader has no way to know it is aspirational, and if they clone and hit `make: *** No rule to make target 'demo'`, the failure is not local — **it retroactively contaminates every other claim in the file**, including the ones I verified as true. The corpus has the precise warning, from `planbound`'s Honesty box: *"a verification surface that silently verifies nothing is worse than none — **it looks like evidence**."*

That is why I applied the −4 there and only there.

**But the forward-declaration is not dishonest in intent, and the evidence says so.** The seed corpus genuinely exists (`corpus/npci/` with `CHECKSUMS.txt`, `PROVENANCE.md`, and a quarantined decoy file). `.env.example` exists and enforces `rzp_test_`. `tools/probe_testmode.py` exists, 131 lines. The document *does* flag an unbuilt thing as unbuilt when it knows one — the Reserve Pay test-mode line. So this is a build-in-progress naming its own targets, not a fabricator.

**The ruling:** naming the files is the right call **only if you build them**, and the asymmetry is severe. Built, the refusal string becomes the single strongest proof anchor in the document — a claim whose evidence is the product's own stdout. Unbuilt at submission, it is a −8-class failure against pillar 2's first gate, worse than v1's honest `Target:`. There is no middle position. This is fix #1 and it is not close.

---

**Q3 — Is the Numbers section real measurement or a promise of measurement?**

**It is a schema of a metric. A schema earns partial credit and it has earned 4 of the 9 points available. It cannot earn the rest.**

Cell by cell, which contain a result:

| Cell | Contains a number? | Assessment |
|---|---|---|
| Headline | ✗ | *"N=50+"* is a **target sample size**. No conformance rate. |
| Effective n | ✗ | *"claims parsed / attempted, printed beside the headline"* — a **field definition**, not a value. |
| Baseline | **partial** | *"reproduces the shipped 3× error"* is a real, externally verified fact. *"catches 0 semantic drifts"* is analytic and defensible. This cell is genuine. |
| Ablation | ✗ | *"harm reported in rupees"* — no rupees. |
| Induced harm | ✗ | *"same table, same font"* — no count. |
| Out-of-sample | **✓ 4/4** | The only measured result — **and it has a selection problem.** |
| Abstention | ✗ | Policy, not rate. |

**Does a schema-of-a-metric earn points?** Yes, some, and I want to be precise about why. The corpus anchor is unambiguous — **EVAL.md 0/99, ablations 0/99, held-out P/R 0/99** — and *"rigor tracks being required to, not placing well."* Committing **in writing** to effective-n-beside-the-headline, to a baseline a competent engineer would actually deploy, to a rupee-denominated ablation, and to publishing induced harm in the same font as the win, is a measurement design that does not exist anywhere in 99 repos. It is a real architectural commitment and it constrains what you can later report. That is worth points.

**What it cannot do is clear the Razorpay bar,** which is present-tense and demands *"honest metrics including false-positive cost"* and *"an honest exception list."* A table of correctly-shaped empty cells is a promise to be honest, not an honest number. Hence 7/12, not 11.

**And the one number you do have is the one I would attack hardest.** The four documents were **found by hand during research** — they are the discovery set. Re-presenting them as *"out-of-sample"* and scoring 4/4 is precisely *"one cherry-picked match proves nothing,"* run four times. Note what is **not** wrong: the labels are external and uncompromised, which remains this project's single best structural asset. The problem is sample selection, not ground truth, which is why it does not trip the −5. But a reviewer who spots it will discount the whole Numbers section, and the fix costs 30 words.

---

**Q4 — Is 668 words now too short for a named required artifact?**

**No — and the framing is a trap I should name rather than answer inside.**

The corpus standalone-architecture population is **bimodal**: 1,484 / 1,564 / 1,552 / 1,699 in one cluster, 241 / 230 in the other. 668 sits in neither. But the control cohort settles this: **135 words (winners) vs 133 (non-winners)**, and non-winners were *more* likely to have an architecture section at all. **Architecture-doc length does not correlate with winning.** Growing toward the 1,500-word cluster would be optimising a variable measured to have no signal — and my own agent brief forbids it.

So the only legitimate test is: **what does a reader need that is not here?** From Q1, exactly four things — prompt injection, the component/determinism inventory, how a claim acquires its `verbatim_quote` and `confidence`, and the runtime conformance flow (how a counterparty's declared terms actually become the `verdict PASS?` the gate reads; v2 references the verdict five times and never says where it comes from).

That is **~120–150 words of load-bearing content**, and you have **330 words of penalty-free headroom.**

> **668 is not too short. It is short by four specific things, and long by none. Target ~800–820, and add only those four.**

The corpus counterexample that decides the upper bound still stands: `Unknown1502/Compliance-Guardian-AI` shipped a **1,699-word** `docs/ARCHITECTURE.md` plus six purpose-built diagrams **that the README references zero times** — recorded as *"a real, repeated failure mode."* Which is Q5.

---

**Q5 — Orphaning. Does the absence of the README stub cost points now?**

**It costs one point directly, and it is the single largest uncounted risk to the file.** My v1 ruling was conditional and the condition is still unmet:

> *"1,040 words is fine **if and only if** the README carries a ≤150-word compressed version… If this file is the only home, the length is fatal regardless of quality, because the file will not be opened."*

**There is no `README.md` in this repository at all.** And v2 has made the exposure worse in a way v1 did not: it now **asserts** the README's contents — *"the delegation layer is **stubbed and declared, in the README**, here, and in the video."* The file cites a document that does not exist as corroboration for its own honesty. I did not stack a second −4 for this (the first is already applied and stacking would double-count the same root cause), but it is the same defect and it is the sentence a hostile reviewer would quote.

The anchors are decisive: **0/22 Google-NVIDIA winners authored an `ARCHITECTURE.md` at all** — architecture lives in the README or nowhere; **6/45** in protocol; and Quick Start beats architecture **86% to 46%**. Razorpay's step 03 names *"repo, 5-min video, architecture"*, which legitimises the standalone file — but a judge arrives at the **repo root**. A repo root with no README is a repo that does not get read, and 78 points of architecture in an unopened file scores zero.

**Cost accounting:** −1 inside Judge-first ordering (no entry point, no links out). The rest of the risk is **not a scoring deduction — it is an existential one**, and it belongs in fix #1 alongside the Makefile because both are "build the thing you named."

---

## 4. The three highest-leverage remaining fixes

**1. Build the five files you named. Start with the one line. (~2–3 h → +5, and removes an existential risk)**
`Makefile` (3 targets), `gate/decide.py`, `eval/self_conformance.py`, `.github/workflows/conformance.yml`, and a **`README.md` carrying the ≤150-word compressed version** — invariant, the refusal string, one link here. Minimum viable definition of done: **`make demo` prints exactly the refusal string already written in this document.** That single line, made true, converts the document's most exposed liability into the strongest proof anchor in it — a claim whose evidence is the product's own stdout, which no repo in the corpus has. Runnability 8→11, Claim-then-proof 4→5, clears the −4, and closes Q5. Nothing else in this list matters if a judge cannot open or run the repo.

**2. Put one real number in each Numbers row, and disclose the selection. (~1 h once `make eval` runs → +4)**
Replace *"N=50+"* with the measured n and the measured rate. One rupee figure in the ablation row. One integer in induced harm. One percentage in abstention. Then add the thirty words that are worth more than any of them:

> *"The four out-of-sample documents were found during research, not sampled. They are a discovery set; 4/4 on them is not a generalisation claim."*

Honest metrics 7→11. That sentence is the difference between the corpus's best-in-class honesty register — `Hourglass` naming its own unbinding cap, `planbound` naming its own broken verification surface — and the field's defining failure. Volunteering the weakness in your best number is the most credible thing a measurement section can do, and **0 of 99 repos do it.**

**3. Restore ~130 words: prompt injection, a 5-row component table, and where the verdict comes from. (~30 min → +3)**
You have 330 words of headroom before any penalty. Restore, in order of value: (a) *"extraction output is schema-constrained and never becomes executable policy without passing conformance; the gate reads the **store**, never raw merchant text"* — the answer to the obvious attack on a document-reading payment agent, deleted against explicit instruction; (b) a 5-row `Component | Deterministic? | Responsibility` table — corpus's densest artifact type, **component topology 11×**; (c) one line on the runtime conformance flow, so the `verdict PASS?` the gate reads has a stated origin, including `verbatim_quote` and `confidence` as claim fields. Money-path safety 10→11, Length discipline 7→8, Claim-then-proof +1.

> Executed in full: **78 → ~90.** That is `SHIP`. The remaining gap after these three is small and named: the unanchored-ledger disclosure, the *"self_conformance is not independent"* sentence, and the schema-violating-extractor-output failure row — together about 60 words and worth ~2 points.

---

## 5. What to DELETE

**Almost nothing — and that is the report.** v1's deletion list ran to ~180 words of redundancy and self-praise. v2 executed it and did not reintroduce any. There is no filler paragraph, no tech-stack section, no sentence about the document, no duplicate fact, no self-congratulation. This section is now three lines long, which is the correct outcome of a successful cut.

- **Trim one clause.** *"That is the only defence against the field's defining failure — every measured repo has a compromised measurement target."* Keep the first sentence (*"Labels come from documents we did not write."*) — it is the strongest twelve words in the Numbers section. Cut the em-dash clause: it is a claim **about the field**, unanchored in this file, and it tips from stating a property into arguing for one's own superiority — the register v1 was penalised for. **−16 words.**
- **Soften one hardcoded number.** `make eval # 50-claim batch` will be wrong the moment the corpus grows. Say `full batch → eval/report.md` and let the report carry n.
- **Do not delete anything else.** Guarding explicitly against over-cutting on the next pass: the problem statement and both verbatim quotes; *"and this project itself"*; the printed refusal string; the seven gate checks **with clauses**; the LLM-placement table; the `RECONCILE_PENDING` row and its tradeoff sentence; the fail-closed argument; the forward-and-backward reasoning; the `probe_testmode.py` disclosure. The next edit should be **net additive** — the first time I have written that about this document.

---

## 6. The 30-second judge test

**v1 retained:** one sentence, and nothing about what the system was for, whether it ran, what it caught, or what broke. **One of four graded pillars above the fold.**

**v2 retained, in reading order:**

> *"Guaranteed Collection… you receive payment regardless of customer's later financial situation."*
> *"The block created shall **not** be treated as the guarantee of payment."*
> **Five such drifts, across two companies and this project itself.**
> **The model reads documents. The model never moves money.**
> `REFUSED cap_exceeds_authority · OC-228 §5 · "maximum of Rs.10,000 of block limit" · declared ₹25,000`

| Pillar | Verbatim test | Visible in 30s? | v1 |
|---|---|---|---|
| **1. Problem taste** | *"did you pick something that actually matters"* | ✅ two contradicting published documents, line 1, checkable in ten seconds | ❌ |
| **2. Build quality** | *"does it run"* | ⚠️ commands and expected output are there and legible; **the files are not** | ❌ |
| **3. AI judgment** | *"where you chose not to use one"* | ✅ invariant at line 2, placement table at section 3 | ❌ |
| **4. Failure recovery** | *"what broke, and what you did about it"* | ✅ *"and this project itself"* — four words, above the fold | ❌ |

**Four of four now serve, against one of four in v1** — and pillar 4 is the one Razorpay says *"is the one we read first."* The thirty-second reader now leaves with a contradiction they can check, a rule they can quote, and a refusal string they can picture. The only pillar not fully landed is the one where the answer is "write the Makefile."

---

## 7. Verdict

# `ITERATE` — 78 / 100 (v1: 49 · **Δ +29**)

The rewrite worked, and it worked in the way that is hardest to fake: **substance rose 10 points while the document lost 36% of its words.** Nothing regressed. Nine of eleven dimensions improved, two reached their ceiling, and the −8 length penalty and the biggest scoring hole (Honest metrics, 3→7) were both attacked at once. This is not churn.

It is not `SHIP`, for two reasons that are the same reason:

**Everything now turns on things existing.** The document's strongest new asset — a printed refusal string that a judge can reproduce — and its largest remaining liability — five named files, including the README, none of which exist — are the same sentence viewed from two sides. Build them and the file's credibility compounds; ship without them and every verified-true claim in it is read as decoration.

**And the Numbers section is a promise, honestly shaped.** Correct shape, four empty cells, one result drawn from the discovery set. Filling it is an hour of work *after* the eval runs, plus thirty words volunteering the selection limit — which is the single most credible sentence available to this project and the one no repo in a 99-repo corpus wrote.

Two focused sessions reach ~90. The document is no longer the problem; the repository is.

---

*Reviewed against `research/12_architecture_corpus/` (n=99 + 31 control) and `research/00_competition_context/THE_REAL_RUBRIC.md`. Every scoring claim carries an anchor. Filesystem existence of all named artifacts was verified directly, not assumed. Where I departed from a corpus anchor — declining to grow the document toward the 1,500-word standalone cluster, on the grounds that the control cohort measures architecture-doc length to have no signal — I said so and gave the reason.*
