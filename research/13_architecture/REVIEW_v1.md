# AgentA review — `ARCHITECTURE_v1.md`

**Reviewed:** 2026-08-26 · **Corpus:** n=99 winner/finalist repos + 31-repo control cohort · **Rubric:** Razorpay four pillars, recovered verbatim.

**Measured first, before scoring.** The brief said "~1,400 words." It is **1,040** — 870 prose, 170 inside fences, 29 table rows across 6 tables. That correction matters: the doc is 4% over the −8 penalty threshold, not 40% over. One deletion clears it.

---

## 1. Score table

### FORM — 21 / 40

| Dimension | Score | Justification (anchor cited) |
|---|---:|---|
| **Runnability** | **3 / 12** | §9 is 42 words and the operative sentence is future-tense: *"**Target:** `git clone && make demo` works on a clean machine."* A target is not a Quick Start. No prerequisites, no env var names, no seed path, no expected output, no pinned versions. Anchor: Quick Start is the **#1 section at 86% (protocol) / 73% (Google-NVIDIA)** and the corpus records that *"in every repo that has both, the install instructions are longer than the architecture."* Here the ratio is **inverted 25:1** (1,040 words of architecture, 42 of run). Razorpay pillar 2 is verbatim *"does it run"*. Credit for naming one container, one command, and a seeded corpus — that is why this is 3 and not 0. |
| **Length discipline** | **5 / 8** | 1,040 words against a **137-word median**. But see §7 — I judge the 137-word median to be the **wrong comparator** for a standalone file, and I score this dimension on density rather than raw count. Density is genuinely high: 6 tables, 29 rows, no filler paragraph, no tech-stack padding. Anchor for the credit: *"tables carry more architecture than diagrams do"* — the corpus's densest artifacts are Aegis's `Layer\|Job\|Owner\|Invariant`, and v1's `#\|Component\|Deterministic?\|Responsibility` is structurally the same object. Deduction is for the ~180 words that carry nothing (see Part 4), not for the total. The mandated −8 still applies in the ledger; this dimension score is not a substitute for it. |
| **Artifact choice** | **5 / 6** | Two Mermaid blocks, zero ASCII. Anchor says ASCII 20 : Mermaid 8. **I am not deducting for Mermaid** — see §7 for the argument. Both diagrams are regenerable text, which avoids the corpus's real diagram failure (`Unknown1502/Compliance-Guardian-AI`: 6 purpose-built PNGs, README embeds zero; **5 of 14** diagram-bearing Google-NVIDIA repos have an un-editable raster as their only artifact). The §4.3 sequence diagram is the rare and correct one: **only 3/45 and 3/22** repos have a sequence diagram, and *"the dominant mental model documented is what components exist, almost never what happens in what order."* Deduct 1: the §2 context graph is the corpus-**modal** artifact — *"a component graph whose nodes are agent names and whose edges are unlabelled"* — and is 100% redundant with the §3 table, which has a `Deterministic?` column the graph lacks. |
| **Judge-first ordering** | **5 / 8** | Leading with the invariant is **defensible and within the strongest observed pattern** (see §7) — but the document has **no problem statement anywhere**. A judge reading only this file never learns that Razorpay's own docs say *"Guaranteed Collection"* while OC-228 §2 says *"shall NOT be treated as the guarantee of payment."* That contradiction is the entire pillar-1 asset and it is sitting in `FINAL_IDEA.md`, unlinked. Anchor: **0/22 lead with the problem, 5/45 (11%) in protocol** — free differentiation, declined. Also: no "Judges start here", no demo pointer, no link to the video, the eval, or `FAILURES.md`. And the H1 reads *"draft for AgentA review"* — internal scaffolding in a file destined for a public repo. |
| **Claim-then-proof** | **3 / 6** | Split verdict. **Strong:** gate checks 3–6 each name the clause they enforce (OC-228 §3, §4) — that is the corpus's "explorer-link-per-claim" habit translated to regulation, and it is the document's best structural idea. **Weak:** zero file paths, zero script names, zero test names in 1,040 words. *"A check with no clause cannot be added — **CI rejects it**"* names no workflow. *"verifiable **in both directions**"* names no verify script. *"the naive regex reproduces a shipped 3× bug"* — true and sourced two directories away (OC-201 §7, ACP SEP #216) — cites nothing here. Compare Kinora: `src/x402/server.ts`, `npm run verify:royalty`, `test_a_bad_route_is_refused_even_though_the_cap_was_respected`. Anchor: unanchored assertion is *"the corpus's most common weakness."* |

### SUBSTANCE — 40 / 60

| Dimension | Score | Justification (anchor cited) |
|---|---:|---|
| **Money-path safety** | **10 / 12** | The document's strongest area, and it clears the Razorpay bar (*"every money action explainable, bounded and gated"*). §4.3 is titled *"no LLM anywhere"*; the Gate is *"a pure function of `(request, block_state, verdict, clock)`"* — a **testable, replayable** claim, not a posture. Seven ordered checks, integer paise, each clause-named. Refusal is first-class *and recorded*: `REFUSED` is appended to the ledger **before** the 403, and the 403 carries `{refusal_code, clause, quote, remaining}`. That beats `RequestTap/RequestTap-Router`'s DENIED-as-outcome-class (the corpus benchmark) because it carries the authorising clause. The ordered narrowing checks are the same shape as Kinora's *"each one can only ever narrow what happens next"* — the corpus's clearest single-line agent-bounds statement. **−2:** no stated behaviour when the Constraint Store itself is unavailable (§6 covers hash mismatch, not absence); and check 1 requires `verdict == PASS` without stating that *missing* ≡ `UNDETERMINED` ≡ refuse. Fail-closed is obviously intended; it is not written. |
| **Audit trail** | **7 / 10** | Hash-chained, append-only, *"verifiable **in both directions**"* — the bidirectional property is exactly what the bar asks for and is absent from all 15 corpus repos that document an audit trail. Verdict cache key `(counterparty_doc_sha256, constraint_store_version)` makes verdicts **re-derivable months later**, which is stronger than the corpus norm of linking a tx hash. **−3, two reasons.** (a) The chain is **unanchored**: `hash = H(prev_hash \|\| payload)` in an operator-controlled SQLite file is tamper-evident only to a reader holding an independent head. No signature, no published head, no external timestamp — and, unlike Kinora (*"the compliance attestation is **self-issued**… not third-party verification"*), the limit is not stated. (b) `H` is unnamed and the concatenation is not length-prefixed. |
| **Failure handling** | **7 / 10** | Genuinely rare and genuinely good. A 7-row failure table against **29% (protocol) / 1 of 22 (5%, Google-NVIDIA)**, where *"the corpus contains exactly **one** systematic failure taxonomy."* `UNDETERMINED` is a designed outcome, not an error: *"Low confidence does not become a guess — it becomes `UNDETERMINED`"*, counted and surfaced. Fail-closed is applied consistently. **−3:** (a) The choice is **exhibited but never argued**. The rubric asks *"fail-closed or fail-open, and is the choice argued?"* The cost of failing closed — a merchant with a bad scan cannot transact at all — is the content of §10 item 4 and is never connected to the design decision. (b) Three missing rows, one of them serious: **Constraint Store unavailable**; **extractor returns schema-violating garbage** (§4.1 covers *low confidence*, not *malformed* — and the Google-NVIDIA absence list reads verbatim *"none has a 'what happens when the LLM returns garbage' section"*); and, worst, **ledger append fails after a successful capture**. §4.3 sequences `G->>R: create/capture` *then* `G-->>L: append DECISION`. If that append fails, money has moved with no audit record — which directly violates the spirit of §1, and no row covers it. |
| **Honest metrics** | **3 / 12** | **The document's largest hole, and it is entirely self-inflicted.** The complete treatment of measurement in 1,040 words is one table cell: *"Eval \| ✅ \| Batch harness, baselines, ablations, self-conformance."* No n. No effective n. No baseline result. No induced-harm figure. No label provenance. No `UNDETERMINED` rate. Razorpay demands *"honest metrics including false-positive cost"*, *"an honest exception list"*, and warns *"one cherry-picked match proves nothing."* The corollary anchor is unambiguous: **EVAL.md 0/99, ablations 0/99, held-out P/R 0/99 — "that gap is the entire opportunity."** `FINAL_IDEA.md` already contains 50+ externally-authored claims, a naive-regex baseline that reproduces a shipped 3× error, a harm-in-rupees ablation, and induced harm reported *"in the same font as the win."* **None of it crossed into the architecture doc.** Compounding it, §10 item 2 asserts *"Mitigated by **measurement**, not by claims"* — which is itself an unmeasured claim about measurement. Credit for: naming baselines/ablations/self-conformance as architectural components, and §4.1's *"counted, never silently dropped"* denominator discipline. |
| **Deliberate non-use of AI** | **9 / 10** | Near-perfect, and the rarest asset in the document. A 7-row table with a specific `Why` column against an anchor of **2/45 and 0/22** stating this as a design claim. The reasons are not generic: *"adds nondeterminism to a decidable question"*, *"Integer paise"*, *"Counting"*, *"Cryptographic, deterministic by definition."* This is a direct strike on what the recovered rubric calls *"the most discriminating clause on the entire site"* — *"and where you chose not to use one."* **−1, both positional:** it sits at §7, **below the data model and the failure table**, when it is the highest-scoring rare thing in the file; and the table's single best sentence — *"the naive regex reproduces a shipped 3× bug and cannot catch semantic contradictions at all"* — is buried in a cell with no citation. Minor: the title says *"where we do NOT use an LLM"* but rows 1 and 7 are `Yes`. It is an LLM-**placement** table, which is better; title it so. |
| **Limitations / non-goals** | **4 / 6** | Present and honest, against **20% (protocol) / 0 of 22 (Google-NVIDIA)** — *"concentrated in the strongest repos."* Item 1 discloses a real capability gap (TSP stubbed); item 4 pre-empts the ugliest number (*"`UNDETERMINED` rate may be high… reported, not hidden"*). **−2:** no non-goals; the unanchored-ledger limit is not stated; self-conformance is not disclosed as non-independent (the checker checking its own corpus is not validation, and Kinora is the corpus's standard for saying so out loud). **And one internal contradiction worth fixing regardless of score:** §4.2 promises verdicts are *"re-derived months later"*, but §5's `ConstraintClaim` has **no `extractor_version` / `model_id` field**. If a third-party model version drifts, the claim of re-derivability is false. That is a reproducibility hole in the doc's own headline property. |

---

## 2. Total and penalty ledger

| | |
|---|---:|
| FORM | 21 / 40 |
| SUBSTANCE | 40 / 60 |
| **Raw** | **61** |

| Penalty | Applied | Reason |
|---|---:|---|
| Architecture section over 1,000 words | **−8** | 1,040 words measured. Mandated, applies. It is 40 words over — **the cheapest 8 points in the document.** |
| A claim with no proof anchor | **−4** | Applied **once**, for *"A check with no clause cannot be added — CI rejects it"* — a claim about an enforced CI control with no workflow, file, or test named. `"verifiable in both directions"` and the 3×-bug claim are equally unanchored; I did **not** stack further −4s for them because they are already priced into Claim-then-proof at 3/6, and double-counting would be dishonest. |
| Metric without effective n | not applied | There is no metric to attach an n to. Already crushed at Honest metrics 3/12; applying this too would double-count the same absence. |
| Self-authored ground truth as measurement | not applied | Labels are externally authored (NPCI/RBI/vendor docs). `self_conformance` is disclosed as a self-check, not presented as measurement. Clean. |
| Un-regenerable diagram as only artifact | not applied | Both diagrams are Mermaid — regenerable text. |
| Invented / unverifiable fact | not applied | I attempted to falsify the load-bearing numerics. *"retry ≤3 per 24h, timeouts only (OC-228 §3)"* is **verbatim-corroborated** in `01_razorpay_signals/india_rails_delegated_payments.md:663` against the primary circular. ₹10,000, 90 days, merchant binding all corroborate. **No fabrication found.** Noted instead as a claim-then-proof miss: a verbatim primary quote exists two directories away and is not cited. |
| LLM in the money path | not applied | Explicitly and structurally excluded. |
| **Total penalties** | **−12** | |

# **TOTAL: 49 / 100 — REWORK**

---

## 3. The three highest-leverage fixes, ranked by points per hour

**1. Move the numbers in. (~1 hour → +8)**
Replace §3 row 9 with a real `## What we measured` section. Every input already exists in `FINAL_IDEA.md`: headline conformance rate, **effective n on the same line**, the naive-regex baseline that reproduces the shipped 3× error, the extractor ablation with **harm in rupees**, refusals and `UNDETERMINED` as counted outcomes, and **induced harm** — every correct claim wrongly flagged. Add one line naming who authored the labels (*"NPCI, RBI and vendor documents. We wrote none of them."*). Honest metrics 3→11. This is the single largest scoring delta available and it requires **writing down work that is already done**. Anchor: 0/99 corpus repos do this, and Razorpay demands it.

**2. Add `## Run it` and `## Verify it` with real commands and real output. (~1 hour → +7)**
Kill the word *"Target:"*. Print the actual command sequence, the prerequisites, the env var names, and — critically — **the expected output of a refusal**, so a judge sees the 403 with the quoted clause before deciding whether to clone. Then name the artifacts: the CI workflow that rejects a clause-less gate check, and the script that walks the ledger chain in both directions. Runnability 3→8, Claim-then-proof 3→5, and it clears the −4. Anchor: **#1 section at 73–86%**; pillar 2 is *"does it run."*

**3. Cut to ≤900 words and put three lines of problem at the top. (~30 minutes → +10)**
Execute Part 4 below to clear the −8 mechanically. With the reclaimed space, open with the contradiction — *"Guaranteed Collection"* against *"shall NOT be treated as the guarantee of payment"* — **above** the invariant, then let the invariant land as the consequence. Clears −8, Judge-first 5→7.

> Executed in full, these three take **49 → ~74**. That is **ITERATE**, not SHIP. Say that plainly: the document is two hours of work from being defensible and considerably more than that from being strong, and the remaining gap after these three is the ledger-after-capture failure row, the unanchored-chain disclosure, and the `extractor_version` field.

---

## 4. What to DELETE

Budget: **1,040 now → target ≤880**, leaving ~120 words of headroom for the metrics and run-it sections above while staying clear of the penalty threshold. Total identified: **~180 words**.

### DELETE ENTIRELY

**§5 "Data model (core)" — all 60 words. Cut 45, keep 15.**
You asked whether the corpus's 0× data-model documentation is a gap in the corpus or a gap in v1's priorities. **It is a gap in v1's priorities.** The corpus does not omit schemas by oversight — it omits them because a schema is the one artifact a judge can read straight from `models.py` in ten seconds and cannot be wrong about. It is the lowest information-per-word section in the document: it lists which fields exist (retrievable from code) and says nothing about what is *enforced* (retrievable nowhere else). Anchor: **data model as its own section is 0/22 in Google-NVIDIA and absent in 33/45 of protocol**; *"none publishes a schema, an ERD, or the shape of the objects flowing between agents"* — and 0 of the 22 Mermaid blocks in the entire 99-repo corpus is an `erDiagram`.

**Two lines are exceptions and must survive, relocated:**
- `LedgerEntry(seq, prev_hash, payload_json, hash) -- hash = H(prev_hash || payload)` — this is not a schema, it is the **construction of your tamper-evidence claim**. Move it into §3 row 6 or the audit paragraph, and name `H`.
- `status[RESOLVED|UNDETERMINED]` — proves `UNDETERMINED` is a **stored state**, not a runtime nicety. Move into §6 row 2.
- Delete `Document`, `ConstraintClaim` (minus the enum), `Counterparty`, `Verdict`, `Block` — **~45 words**. (Then add `extractor_version` to `ConstraintClaim` in the *code*, where it belongs, per §2's contradiction note.)

**§2 "Context" Mermaid graph — all 47 words.**
Fully redundant with the §3 Components table, which contains every node **plus** a `Deterministic?` column the graph lacks. It is also the corpus's modal artifact — *"a component graph whose nodes are agent names and whose edges are unlabelled"* — i.e. precisely the diagram that carries **zero** differentiation because everyone has one. Keeping only §4.3 leaves you with a **sequence** diagram as your sole visual, which is what **19/22 and 42/45 of the corpus lack**. One rare diagram beats one rare diagram plus one universal one. **−47 words, and it makes the remaining diagram louder.**

### CUT HARD

**§8 "Security / threat model" — from 65 words to ~25. (−40)**
Keep **only** the prompt-injection bullet. It is the one bullet that is architecturally load-bearing: *"the gate reads the **store**, never raw merchant text"* is a restatement of §1 in the adversarial register, and it is the correct answer to the obvious attack on a document-reading payment agent.

Delete the other three:
- *"Tampered corpus → checksums verified at load"* — **duplicate** of §6 row 1 and §3 row 1. Third statement of the same fact.
- *"Replay → idempotency keys, ledger chain"* — **duplicate** of §4.3 check 7 and §6 row 5.
- *"Secrets → test-mode keys only, `.env`, never committed"* — universal hygiene, zero differentiating signal. Anchor: `SECURITY.md` is absent in **42/45**, and *"six have a security-ish heading; four say anything specific; zero threat models."* Nobody in 99 repos scored on this, and a bullet saying you did not commit your keys reads as a bullet written to have a bullet.

**§3 Components, rows 7–9 — trim `Responsibility` to ≤6 words each. (−20)**
Rows 1–6 are the constraint path and earn their prose. Row 7 (Merchant) and row 8 (Buyer Agent) do not. Row 9 (Eval) should not be trimmed but **promoted out** into the new metrics section — a measurement programme summarised as one table cell is the exact failure the score punishes.

### DELETE THE SELF-PRAISE — ~20 words, and it is the most important deletion by ratio

The document repeatedly tells the reader it is being rigorous instead of letting the reader conclude it. Each of these is a sentence about the document rather than about the system:

- §1: *"Everything below follows from that sentence."* (7) — **demonstrate it, do not assert it.**
- §4.2: *"Reproducibility is a design requirement, not a nicety."* (8) — restates the sentence immediately before it, in a more pleased tone.
- §10 heading: *"(stated, not hidden)"* (3) — a Limitations section stating that it is not hiding things is doing the opposite of what makes Limitations sections credible.
- §4.1: *"never silently dropped"* — duplicates *"counted"* in the same sentence.

Anchor by counter-example: the corpus's strongest honesty artifacts — `planbound`'s Honesty box, `Hourglass`'s `## 5. Defect: the DCA per-swap cap does not bind`, Kinora's *"the attestation is self-issued"* — **never once congratulate themselves.** Hourglass states an exploitable hole in its own cap enforcement in flat declarative sentences. That is why it reads as credible. Every self-congratulatory clause you leave in makes the genuinely rare content around it read as marketing.

**Also delete:** the H1 suffix *"— draft for AgentA review"*. This file is going in a public repo.

### DO NOT DELETE — guarding against over-cutting

§7 no-LLM table (**2/45** — your rarest asset). §6 failure table (**1/22**). §4.3's seven gate checks **with their clause references** — the claim-to-clause anchoring is the document's structural signature and the thing no corpus repo has. §10. The §1 invariant. The §4.3 sequence diagram.

---

## 5. The 30-second judge test

**What a reader retains:**

> **"The model may read documents. The model may never move money."**

That is a genuinely excellent thing to retain. It is the one sentence in the document a judge would quote back in a debrief, it is structurally the same opening move as `Hokutoman00/aegis-resilient-agents` (*"Hedge first, fallback second, continuously chaos-verified"*) and `LingSiewWin/HumanMandate` (*"An allowance bound to a person, not an address"*), and it lands a direct hit on pillar 3. Credit where due: the top 40 words of this document are the best 40 words in it.

**What they do not retain — and this is the verdict:**

At 30 seconds a reader reaches §1, the §2 diagram, and the top of §3. In that window they learn **nothing** about:

| Pillar | Verbatim test | Where it lives in v1 | Visible in 30s? |
|---|---|---|---|
| **1. Problem taste** | *"did you pick something that actually matters"* | **nowhere in this file** | ❌ |
| **2. Build quality** | *"does it run"* | §9, one future-tense sentence, position 9 of 10 | ❌ |
| **3. AI judgment** | *"where you chose not to use one"* | §7, below the data model | ❌ (but §1 partially carries it) |
| **4. Failure recovery** | *"what broke, and what you did about it"* | **nowhere in this file** — `FAILURES.md` is not linked | ❌ |

**v1 serves one of four graded pillars above the fold, and the three it misses are all already written down elsewhere in this repository.** The problem is not that the document is wrong — on money-path safety and LLM placement it is better than anything in a 99-repo corpus. The problem is that it is **the wrong 1,040 words** out of the ~2,500 this project has already produced. A judge who reads only this file cannot tell you what it is for, whether it runs, what it caught, or what broke.

---

## 6. Verdict

# `REWORK` — 49 / 100

The substance is unusually strong and the form is losing it. Money-path safety (10/12), the no-LLM table (9/10) and the failure taxonomy (7/10) are each individually rarer than anything in the corpus. They are wrapped in a document with no problem, no numbers, no proof anchors and no way to run it — which means the four things it does better than 99 repos are invisible to the reader who decides.

Two hours of work reaches ~74 (`ITERATE`). Reaching `SHIP` additionally requires: the ledger-append-after-capture failure row, an honest sentence about the chain being unanchored, and `extractor_version` on `ConstraintClaim`.

---

## Appendix — your five suspicions, tested

**(1) "v1 is ~1,400 words, 10× the median. Is length the wrong frame?"**
The word count is wrong (**1,040**, not 1,400) and the frame is **half wrong**.

The 137-word median measures **README sections**, not standalone files. The right comparator for a standalone `ARCHITECTURE.md` is the six that exist in the protocol corpus: **1,484 / 1,564 / 1,699 / 1,552 / 241 / 230**. Against those, 1,040 is *below* median — v1 is a **short** standalone architecture doc, not a long one. And Razorpay's step 03 names *"repo, 5-min video, **architecture**"* as a deliverable, which legitimises a standalone file the corpus never needed. So on its own terms: **not too long.**

But the corpus supplies the counter-argument that decides it. `Unknown1502/Compliance-Guardian-AI` shipped a **1,699-word** `docs/ARCHITECTURE.md` and six purpose-built diagrams, and **the README references none of them** — the corpus records this as *"a real, repeated failure mode."* And **0/22 Google-NVIDIA winners authored an `ARCHITECTURE.md` at all**; architecture lives in the README or nowhere. Combine that with the control-cohort finding and the ruling is:

> **Length is not the risk. Orphaning is.** 1,040 words is fine **if and only if** the README carries a ≤150-word compressed version — invariant, one table, one link — that pulls the judge here. If this file is the only home, the length is fatal regardless of quality, because the file will not be opened.

The −8 penalty still applies mechanically and you should still cut to ≤900, because **~180 of those words are pure redundancy and self-praise** — cut them for density, not for the median.

**(2) "Leading with an invariant, not the problem. Better or worse?"**
**Better than the corpus norm, worse than the available maximum.**

*"The model may read documents. The model may never move money"* is a bold-thesis blockquote, and **13/45 (29%)** open that way. The correlation is striking: among bold-thesis openers, **9 (69%)** also carry Limits/HITL/refusal markers, versus **18%** among the 22 that open with a plain capability sentence. Leading with an invariant puts v1 inside the strongest observed cluster, not outside it.

The failure is not the invariant — it is that **the problem never appears at all**, at any position. **0/22 and 5/45 lead with the problem**, which is genuinely free differentiation, and this project has the strongest problem statement I have seen in any of these corpora: a first-party contradiction between a vendor's own documentation and the circular that authorises it, verifiable by a judge in ten seconds. Put three lines of it *above* the invariant so the invariant reads as a **consequence** rather than an assertion. You keep the strongest opening move and add the rarest one.

**(3) "Mermaid vs ASCII 2.5:1 — does it matter, or is it crypto-repo culture?"**
**It does not matter. I am not deducting for it, and here is why the anchor should not be applied.**

The 2.5:1 ratio comes from the protocol/AI corpus, which is ETHGlobal-heavy — plausibly cultural. But the Google-NVIDIA cohort is an independent ecosystem and shows **Mermaid 5/22 (23%) vs ASCII 6/22 (27%)** — essentially parity. So the 2.5:1 does not replicate, and treating it as a general law would be over-reading one hackathon family. More decisively: in the **control comparison**, Mermaid is one of only **two** metrics where winners lead non-winners (**23% vs 13%**) — weak and small-n, but it points the *opposite* way from the deduction.

What the diagram anchors actually support is a different and stronger claim: **regenerability** (0/22 have `.drawio`/`.excalidraw`; 5 of 14 diagram-bearing repos have raster-only, un-editable artifacts) and **rarity of kind** (sequence diagrams 3/45 and 3/22; data-model diagrams **0/99**). v1 is regenerable and holds a rare kind. The correct action is not "convert Mermaid to ASCII" — it is **delete the redundant component graph and keep the sequence diagram**, which I have put in Part 4.

**(4) "No Quick Start — #1 section at 73–86%, and pillar 2 is literally 'does it run'."**
**Confirmed, and it is the single biggest form defect — 9 points lost on one dimension.**

The corpus is unusually blunt here: *"Documentation effort is spent on reproduction, not on comprehension"*; *"the README is optimised for a judge who wants to **run** the thing, not for a reader who wants to **understand** it"*; and in **every** repo that has both, install is longer than architecture. v1 inverts that 25:1 and its one run sentence is a **stated target**, not a working command. Razorpay's pillar-2 text splits into three gates — *"does it run, is it structured, would you trust it"* — and v1 currently answers gates 2 and 3 well and gate 1 not at all.

The nuance worth keeping: the fix is **placement**, not volume. A Quick Start belongs in the README. What belongs *here* is a `## Verify it` block naming the runnable artifacts behind this file's claims — the ledger walker, the CI check that rejects a clause-less gate, the eval batch — which is the `Kinora` / `liminalshruti` *"verify it without trusting this repo"* pattern (**9/45** have a verification *procedure*, and it is the second most common form of evaluation in a corpus with almost no evaluation).

**(5) "v1 has a data model; the corpus documents data models 0 times. Corpus gap or v1 gap?"**
**A v1 gap.** Answered in full in Part 4. Short version: the corpus omits schemas because a schema is the one artifact a judge can read straight from the code and cannot be wrong about — it is the lowest information-per-word section available. **0/99 corpus Mermaid blocks are `erDiagram`**; 0/22 have a data-model section; 33/45 have none. Delete 45 of the 60 words. Keep exactly the two lines that are not schema but **claim**: the ledger chain construction (which *is* your tamper-evidence argument) and the `RESOLVED|UNDETERMINED` enum (which proves abstention is a persisted state). Then add `extractor_version` to `ConstraintClaim` **in the code**, because without it §4.2's re-derivability promise is false.

---

*Reviewed against `research/12_architecture_corpus/` (n=99 + 31 control) and `research/00_competition_context/THE_REAL_RUBRIC.md`. Every scoring claim carries an anchor. Where I departed from a corpus anchor — the Mermaid non-deduction, and scoring length on density rather than raw count — I said so and gave the reason.*
