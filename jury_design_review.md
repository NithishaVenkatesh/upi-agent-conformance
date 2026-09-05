# Agent-Delegation-as-Jury: Design Review & Corrected Verdict

**Subject:** the four-agent evaluation pipeline (`competition_brief.md` → `judging_model.md` + `project_dossier.md` → `verdict.md`)
**Target competition:** [Razorpay AI Buildathon](https://razorpay.com/buildathon/)
**Submission under evaluation:** `in.razorpay.upi`, Track 01
**Date:** 2026-09-01 · **Stated deadline:** 2026-09-05

---

## Executive summary

The delegation is a strong **technical due-diligence pipeline** wearing a **juror's robe**. Its architecture — a real information barrier between the auditor and the scorer, a rubric frozen before the submission is seen, gates applied before scores — is correct and worth keeping. Its calibration is not.

Three findings dominate:

1. **The heaviest-weighted criterion is not one Razorpay names, and a criterion Razorpay does name is absent and scored backwards.** Measured Metrics carries 25% and appears in no attributed criteria set. *AI Judgment* — "use AI where it makes sense, not everywhere" — carries 0%, and the verdict's "Wrapper Attack" penalises exactly the behaviour that criterion rewards.
2. **One rubric was applied to five tracks with materially different bars.** Track 02's held-out precision/recall requirement was averaged into a global criterion and charged against a Track 01 submission whose verbatim bar never mentions measurement.
3. **The rubric imported the applicant's self-imposed N≥50 threshold and then scored them against it** — punishing the intellectual honesty the same document praises two sections later.

Re-running the evaluation on a track-correct, criteria-correct instrument moves the submission from **5.4 / BORDERLINE** to **7.4 / ADVANCE**. That swing is re-pointing, not generosity: two criteria rise because the instrument was aimed wrong, and documentation is punished *harder* than before.

| Part | Contents |
|---|---|
| 0 | The delegation: what each agent takes as input (system prompts) |
| 1 | Is there an exact rubric? |
| 2 | Rating the jury, per vertical the hackathon actually evaluates |
| 3 | Deliberation: where it holds, where it breaks, what to change |
| 4 | The corrected review of `in.razorpay.upi` |
| — | Sources and limits |

---
---

# Part 0 — The delegation: what each agent takes as input

Reconstructed from the artifacts. This is a 4-agent linear chain with two information barriers and a phase counter (0–10) spanning the whole pipeline.

```
A. RECON ──► competition_brief.md ──┐
                                     ├──► B. RUBRIC ARCHITECT ──► judging_model.md ──┐
   (public web only)                 │       (never sees the repo)                    │
                                                                                       ├──► D. JUROR ──► verdict.md
C. AUDITOR ────────────────────────────► project_dossier.md ──────────────────────────┘
   (repo only, never sees the rubric)                                    (never sees the repo)
```

## Agent A — Competition Recon (Phase 0)

**Inputs:** competition URL; permission to fetch secondary coverage. **No repo access.**

```
You are a competitive-intelligence analyst. Produce a brief on ONE competition.

Segregate every claim into exactly three buckets and never blur them:
  VERIFIED     — quoted verbatim from the official page, with the quote inline.
  INFERRED     — your reasoning, tagged with a confidence level and the evidence it rests on.
  NOT PUBLISHED — enumerate what you looked for and could not find. This list is a
                  deliverable, not an apology.

Mandatory sections: success condition (verbatim); deliverables per track; each track's
stated bar (verbatim); hard constraints and disqualifiers; application flow; evaluator
profile; evidence of what accepted work looks like; open unknowns.

Rules:
- Never paraphrase a stated bar. Quote it. Downstream agents score against your quotes.
- Record every date as an absolute date, and flag any date you could not confirm.
- Cite every source URL.
- If the official page is JS-rendered and you got only a title, say so. Do not fill
  the gap from secondary coverage without labelling it secondary.
```

## Agent B — Rubric Architect (Phases 1–2)

**Inputs:** `competition_brief.md` + comparative research on adjacent events. **Explicitly denied the submission.**

```
You are designing the scoring instrument BEFORE any submission is seen. You will not
be shown the submission. This is deliberate: a rubric written after reading a project
is a rationalisation of that project.

Phase 1 — Synthesis. Research comparable events. Produce a table contrasting the
prize-hackathon norm against THIS competition's stated bars. Name where they conflict
and which wins. State what a judge would have to be doing wrong to misapply this rubric.

Phase 2 — Rubric. Emit 4–6 weighted criteria. For each:
  - a justification quoting the competition brief,
  - scoring anchors at 1/3/5/7/9 with the EVIDENCE required at each level,
  - an explicit "evidence required for 7+" line.

Then emit: hard gates (disqualifiers, applied before scoring, as caps not deductions);
calibration anchors describing a top-decile and a median submission in prose; the
weighted formula; anti-inflation rules.

Constraints:
- Every anchor threshold must trace to the brief or to a NAMED external comparable.
  You may not invent a number.
- 5 = competent and complete, not a failure. 9 = a practitioner in the domain would
  find it notable.
- End with the literal line "Rubric Frozen." You may not revise it later.
```

## Agent C — Technical Auditor (parallel, independent)

**Inputs:** repo path. **Explicitly denied the rubric and the brief.**

```
You are a technical due-diligence auditor. You do not know how this will be scored and
you must not guess. Report what is true.

Produce: reconstructed thesis derived from CODE, not README; README-vs-code delta;
architecture map; capability inventory; end-to-end viability; evaluation and metrics
findings; AI substance assessment; engineering craft; honest scale; unverifiable claims;
discrepancies between claims and reality.

Rules:
- Tag every capability [VERIFIED] / [PARTIAL] / [MOCKED] and cite file:line. An
  untagged, uncited claim is a defect in YOUR report.
- "Unverifiable" and "absent" are different findings. Never collapse them.
- Separate what the LLM does that is load-bearing from what it does that is decorative.
  Run the deletion test: if the model were removed, what would still work?
- Estimate hand-written vs generated per module.
- Adversarial reading of the README is mandatory: find the overclaims.
```

## Agent D — Juror (Phases 3–10)

**Inputs:** `judging_model.md` + `project_dossier.md`. **Denied the repo** — may only cite the dossier.

```
You are a panel judge. You have a frozen rubric and an evidence dossier. You may not
read the repository; if the dossier does not say it, you do not know it.

Phase 3 — Gates first. Apply each hard gate before any scoring. Distinguish MET /
         FAILED / CANNOT VERIFY. A CANNOT VERIFY is never a deduction.
Phase 4 — Track fit against the verbatim bar.
Phase 5 — Score each criterion. For each: quote the dossier evidence, name the anchor
         you matched, give the score, state what evidence would have earned the next
         anchor up. No benefit of the doubt.
Phase 6 — The strongest rejection. Argue the case against in full force. Include the
         single question that damages the project most, and what a top-tier competitor
         in this track would have shown instead.
Phase 7 — The strongest defence.
Phase 8 — Verdict: weighted total, ADVANCE / BORDERLINE / DECLINE, the single deciding
         factor, and whether the problem is the idea or the execution.
         Then answer: did you feel pressure to revise the frozen rubric? Where? Record it.
Phase 9 — Leverage, ranked by score delta per hour.
Phase 10 — The pivot question: harden, or rebuild?
```

---
---

# Part 1 — Is there an exact rubric?

**No.** Confirmed: `razorpay.com/buildathon/` is JS-rendered and exposes only "Build. Show. Get hired." `razorpay.com/ai-builders/` publishes the process — *"Fill the form → Submit your project or GitHub → If it has signal, we'll call in 48 hrs"* — and **no weights, no dimensions, no thresholds**. The brief's "NOT PUBLISHED" list is correct.

But the inference was under-sourced. Two independent secondary write-ups converge on a **named four-dimension criteria set** that the pipeline never surfaced:

| Razorpay-attributed dimension | What it means | In `judging_model.md`? |
|---|---|---|
| **Problem Taste** | Picking a problem worth picking, not applying AI arbitrarily | Partial — C4, 15% |
| **Build Quality** | Repo cleanliness, code organisation, execution reliability, architecture | Yes — C1, 20% |
| **AI Judgment** | *"Use AI where it makes sense, not everywhere."* Forcing an LLM where a rule-based system would do **scores lower** | **Absent — and inverted** |
| **Failure Recovery** | *"A project that crashes on bad input will score poorly"* regardless of happy-path | Yes — C1 + C3 |

Plus two structural rules the rubric contradicts:

- **Documentation is first-class** — README, repo, video, and architecture walkthrough are integral, not afterthoughts. C5 weights this at **10%**, on an explicit argument that the brief "de-emphasizes presentation."
- **"A well-executed Open Track submission will beat a half-built entry in a core track."** Completeness dominates track prestige. The rubric has no completeness-vs-ambition trade at all.

**Confidence: medium-high.** These are secondary sources, not razorpay.com verbatim. But two independent outlets carry the same "AI Judgment / marked down for forcing an LLM" language, which is not a phrase a blogger invents — and the recon agent had both URLs in its own source list and extracted nothing from them.

---
---

# Part 2 — Rating the jury, per vertical the hackathon actually evaluates

Same 1–9 scale the instrument uses on itself. This scores **instrument fidelity**: does the jury measure this dimension, and does it measure it in the right direction?

| Vertical | Fidelity | Why |
|---|---|---|
| **Build Quality** | **7** | The strongest part. `project_dossier.md` §3/§7 is genuinely panel-grade: file:line citations, 95 tests / 85% coverage, coupling analysis, secrets hygiene, dead-code check, documented concurrency race. This would survive contact with a real reviewer. |
| **Failure Recovery** | **7** | Well covered — the 11-failure-mode table is exactly the evidence this dimension wants. Minor flaw: it is scored twice (C1 *and* C3), so a strength gets 40% of the weight while a gap gets none. |
| **Problem Taste** | **5** | Measured as *fit to a track blurb*, not as *was this worth building*. And Phase 4 says track fit is "EXCELLENT in all seven dimensions" while Phase 6 says "it's in the wrong track." Both stand in the same document, unreconciled, and only one of them was allowed to touch the score. |
| **Documentation** | **3** | Weighted down to 10% on a reasoned but wrong premise. Razorpay treats docs as first-class; the rubric argues them into the cheapest slot, then merges them with the pitch video so a strong ARCHITECTURE.md and a missing video cancel out into a single 5. |
| **Live Defensibility** | **3** | The program's actual gate is a panel interview, and the pipeline models it with *one* question. Phase 6's "Show me a merchant whose revenue grew because of your gate" is excellent — which makes the absence of the other nine conspicuous. The dossier's own **Unverifiable Claims** and **Discrepancies** tables are a ready-made question bank that nothing consumes. |
| **AI Judgment** | **1** | **Scored backwards.** Phase 6's "Wrapper Attack" penalises the project because deleting the LLM leaves a working deterministic gate. Razorpay's stated criterion *rewards* precisely that. Keeping the model off the money path, using integer comparison where the problem is decidable, and refusing a regex fallback where it is not, is the textbook answer to "use AI where it makes sense, not everywhere" — and the instrument files it as the project's central weakness. |
| **Builder signal** (who wrote this) | **1** | Absent. The program's entire thesis is "your code speaks louder than your resume" — the repo is a proxy for the *person*. Dossier §8 notes the frontend is "Generated/Claude-written" and **nothing downstream consumes it**. No attribution vertical, no "would I want this person in the room," no model of the 48-hour callback. The jury scored an artifact; the panel is making a hire. |
| **The jury's own evidence discipline** | **2** | Phase 7 praises the project for suppressing its headline at N=12. Phase 8 then emits "45–55th percentile" and "30–40% shortlist probability" from an explicitly invented field distribution ("assume typical distribution: 10% elite…") with N=0. The instrument commits the exact cherry-pick its own anti-inflation rule was written to prevent, in the section that grades the project for not committing it. |

**As a generic engineering due-diligence pipeline: ~7. As a jury matched to *this* hackathon: ~4.5.**

---
---

# Part 3 — Deliberation

## Where the design holds

**The information barrier is real and it works.** Denying the juror the repo forces every score to trace to a cited dossier line, and it does — verified by spot-check. That single constraint eliminates the failure mode where a judge scores a vibe and reverse-engineers a justification. Keep it.

**Freezing the rubric before seeing the submission** is the right primitive, and the *"Pressure to Revise Rubric"* confession in Phase 8 — recording the moment the juror wanted to award credit for integrity and declined — is a calibration artifact most human panels never produce. That paragraph is the most trustworthy thing in the four files.

**Gates before scores.** Correct ordering, and caps-not-deductions is the right semantics.

**The strongest-rejection phase is the best writing in the set.** *"The agent is a stub… it collects revenue safely, which is not the same"* is a real finding, arrived at honestly, and it is exactly what a panel will say.

**The `[VERIFIED]` / `[PARTIAL]` / `[MOCKED]` + file:line taxonomy** is the most reusable component here. Port it to every future evaluation.

## Where it breaks

**1. The heaviest criterion is not one of Razorpay's, and one of Razorpay's is not in the rubric.** Measured Metrics carries 25% — the single largest weight — and does not appear in the attributed dimension set at all. AI Judgment carries 0% and is scored inverted. That is not a calibration error; the instrument is pointed somewhere else.

**2. One rubric for five tracks with materially different bars.** Track 02's "measured precision/recall on held-out test set" was averaged into a global 25% criterion, then applied to a **Track 01** submission whose verbatim bar is *"Every money action explainable, bounded and gated. Show the audit trail and one failure handled gracefully."* — which mentions no measurement at all. The project satisfied its actual bar on all seven elements (Phase 4 says so) and lost 1.25 weighted points to another track's requirement.

**3. The N≥50 anchor punishes honesty, and probably leaked.** The brief contains no such number. `judging_model.md` C2 anchors invent 50 and 100. The project independently committed to N≥50 in its own ARCHITECTURE.md. The same number in both is the strongest circumstantial evidence that the barrier leaked — ordering cannot be proven from the files, but the number provably has no source in the brief. Worse is the structural consequence: **the rubric imported the applicant's self-imposed threshold and then scored them against it.** A project that never wrote down a standard gets a soft "small sample" note; this one wrote 50, met 12, suppressed its own headline, and got charged for the gap. Phase 7 calls that integrity. Phase 5 prices it at −0.5. Both cannot be right.

**4. The adversarial phases are inert.** Phases 6 and 7 sit *downstream* of the Phase 5 scores, so the strongest attack ever made against this project — "it's a compliance project in a growth track" — cannot move a single number. Deliberation that arrives after the ballot is theatre.

**5. Unverifiable was scored as absent.** The dossier was never asked to check for a pitch video; the juror docked C5 for its absence anyway, after Gate 2 correctly fired PARTIAL and was then not applied. A gap in the *instrument's* scope became a deficiency in the *candidate's* file. Gates need their own evidence source — a clean-container clone-and-run, a link check — not a report written for a different purpose.

**6. The leverage arithmetic is generated, not computed.** Lever #1 moves C5 5→6 (+0.1). Lever #3 moves C5 5→7 (+0.2). The recommended priority order then stacks both. C5 cannot leave 5 twice. And deltas are quoted to two decimals off an integer-anchored scale — 5.4 → 5.42 for adding docstrings is false precision on a scale whose smallest real step is 0.1.

**7. Nothing in the pipeline knows what day it is.** The recon agent emitted a self-contradicting deadline — *"September 5, 2026 (CLOSED as of writing date August 30, 2026)"* — on the single most decision-relevant field in the brief, and no downstream agent flagged it. Phases 9 and 10 then hand out a 40-hour work plan that is only meaningful if the deadline is open. As of 2026-09-01 there are four days, and the top-ranked lever (+1.0, sourcing and hand-labelling 50+ regulatory claims, "research labour, not configuration") is precisely the one that cannot be done well in four days — and the leverage phase had no clock input to notice.

**8. One juror, scoring sequentially, anchoring on itself.** Scores land 6, 5, 7, 7, 5 — compressed around the mean, which is what a single pass with each justification visible to the next produces. The anti-inflation rule guards only the ceiling ("if >50% land on 7+, recalibrate"); nothing guards central-tendency collapse, which is the more common failure.

**9. The auditor is less independent than claimed.** `project_dossier.md`'s section headings map nearly 1:1 onto the rubric's criteria — §4 viability → C1, §5 evaluation → C2, §7 craft → C1/C5, §9 gaps → C2/C5. Either it saw the rubric or both descend from the same brief. Either way the juror is not scoring independent evidence; it is scoring pre-sorted evidence.

**10. Wrong objective function.** ₹75,000/month, 6–12 months, in-person, no prize tier. This is a **hiring gate**, not a competition. The panel's question is "do we want this person for a year," and the repo is the proxy. The instrument has no vertical for that, so the one datum bearing on it — the frontend being AI-generated — is recorded in §8 and consumed by nobody.

## What to change

Ordered by how much the verdict moves.

1. **Rubric per track**, selected at runtime from the declared track. Track 01's metrics criterion should weight *audit-trail completeness and failure-handling depth*, not held-out precision/recall.
2. **Add AI Judgment as a first-class criterion**, with the anchor deliberately inverted from the current Wrapper Attack: *9 = the model is used only where the problem is genuinely undecidable, and everything decidable is deterministic; 1 = an LLM sits on a path a lookup table would serve.* Then re-run the deletion test as a **strength** probe.
3. **Anchors may not cite thresholds originating in the submission.** Every number traces to the brief or a named external comparable, or it does not exist.
4. **Move the adversarial phases upstream of scoring** — or score, attack, re-score, and require the delta to be justified in writing. An unchanged score after Phase 6 must be defended, not assumed.
5. **Add a deliverables-verification agent** with its own evidence: clone in a clean container, `make demo`, confirm the video URL resolves, confirm the repo is public. Gates stop guessing.
6. **Add a panel-simulation agent.** Feed it the dossier's Unverifiable Claims and Discrepancies tables; make it generate ten questions and require the submission to answer them. For a program whose real gate is a live interview, this should be a scored vertical, not an afterthought in Phase 6.
7. **Add a builder-signal vertical.** The auditor already estimates hand-written vs generated per module — give the juror a criterion that consumes it.
8. **Two independent jurors, blind to each other**, reconciled only on criteria differing by ≥2.
9. **Ban unsourced quantities.** No percentile, no probability, without a reference set. Replace with an ordinal — above / at / below the bar — plus the decisive evidence. The instrument must meet the standard it enforces.
10. **Pass `days_remaining` into the leverage phase** and filter levers by feasibility before ranking them.

---
---

# Part 4 — The corrected review of `in.razorpay.upi`

**Instrument:** corrected jury (track-specific rubric, Razorpay-attributed criteria, no fabricated quantities)
**Evidence:** `project_dossier.md` only — held to the same rule imposed on the original juror: if the dossier does not say it, it is not known.

## Gate 0 — Do this before reading the rest

The recon brief says two contradictory things about the deadline in one line: *"Application Deadline: September 5, 2026 (CLOSED as of writing date August 30, 2026)."* Nothing downstream caught it. **Verify the deadline first.** Every recommendation below assumes four days remain; if it is closed, the leverage section is moot and the rest is post-mortem.

## Phase 1 — Gates

| Gate | Status | Note |
|---|---|---|
| Track 02 offense-only | N/A | Track 01 submission |
| Working product | **MET** | `make demo` end-to-end offline; live Razorpay test API HTTP 200 |
| Required deliverables — repo | **MET** | Public, file:line-citable |
| Required deliverables — architecture doc | **MET** | ARCHITECTURE.md, specific |
| Required deliverables — **pitch video** | **UNKNOWN** | Not in the dossier's scope. **Not scored as a deduction.** It is a binary gate: if it does not exist, nothing below matters. |
| Completeness dominance<br/>*("a well-executed Open Track entry beats a half-built core entry")* | **PASS** | The core path — agent → checkout → gate → capture → ledger — is complete. The one stub (Razorpay TSP) is an API Razorpay does not publicly expose. That is not half-built; that is fully built to the available surface. **Say this out loud in the pitch**, or a panel will read "stubbed" as "unfinished." |

## Phase 2 — Scores

Rubric weights: 25% to the only bar Razorpay wrote verbatim for this track; the remainder distributed across the four dimensions attributed to Razorpay, with documentation at 15% because the program calls it first-class.

### C1 · Track 01 Bar Compliance — **8** (25%)

The bar is *"Build agents that grow merchant revenue **or** enable AI-buyer transactions. Every money action explainable, bounded and gated. Show the audit trail and one failure handled gracefully."*

**The original jury attacked a bar this project never had to meet.** Phase 6's killer question — *"show me a merchant whose revenue grew"* — targets the first disjunct. The project satisfies the second: BuyerAgent → UCP discovery → MCP checkout tools → `complete_checkout` → live order creation. That is enabling an AI-buyer transaction, in full.

| Bar element | Evidence | Verdict |
|---|---|---|
| Explainable | Every refusal returns `{code, clause, quote, circular}` | Exceeds |
| Bounded | Four bounds in code: amount ≤ remaining, ≤3 retries/24h, one block per (customer, merchant), ≤90d validity | Meets |
| Gated | `gate/decide.py` pure function on the money path — no network, no clock | Exceeds |
| Audit trail **shown** | Hash-chained, genesis anchored to corpus SHA-256, 5 tamper classes caught, replayable | Exceeds — the bar asks you to *show* one; this is tamper-evident |
| **One** failure handled gracefully | Eleven modes tabulated; the retry classifier is the standout — timeout retryable, other declines not, driven by *server-observed* failures rather than caller assertion | Exceeds by an order of magnitude |

Held from 9 by one hole located precisely inside the claim being scored: **RECONCILE_PENDING** — money moved, ledger append failed — is "not fully implemented." For a payments panel that is the interesting case, and it is the one place the audit trail is incomplete.

### C2 · Build Quality — **8** (20%)

95 tests, 85% coverage, offline in ~2s, zero dependencies beyond stdlib + pytest, no dead code, deliberate coupling direction (agent imports merchant, never gate), live keys refused at load on an `rzp_test_` prefix check, every known hazard named in a docstring rather than hidden.

The standout is `eval/self_conformance.py`: **CI that fails if a gate check names no clause.** A meta-test on your own rubric, which caught a real defect — the first version of that check was itself vacuous. Very few submissions will have anything like it.

Held from 9 by: **FAILURES.md is referenced from multiple files and does not exist** — a dangling internal reference repeated across the repo is a build-quality defect, not only a docs one; the ledger attack table duplicated verbatim in three places; sparse method docstrings; Python 3.11+ untested below.

### C3 · AI Judgment — **8** (15%)

*This is the criterion the original instrument scored backwards.* Razorpay: *"Use AI where it makes sense, not everywhere"* — forcing an LLM where a simpler system suffices **lowers** your score. The old Wrapper Attack penalised this project for the property that criterion rewards.

What the project actually did:

- **The model sits at exactly one point** — extracting `{subject, value, unit, scope, quote, confidence}` from dense regulatory prose. Everything decidable is deterministic: conformance is integer/enum comparison, the gate is a pure function, the ledger is a hash chain.
- **They proved necessity instead of asserting it.** `extract/naive.py` is a regex ablation that reproduces the real SEP #216 error — right number, wrong scope. 0/2 vs 2/2. An ablation is the correct evidence form for "does the model earn its place," and almost nobody runs one.
- **They refused to degrade silently.** No `AZURE_OPENAI_API_KEY` raises rather than falling back to regex.
- **Three-layer output validation:** schema, verbatim-quote-must-appear-in-source (hallucination gate), confidence floor → UNDETERMINED → refuse.
- **The agent LLM is architecturally denied** access to gate, ledger, and payment — so it cannot be argued into moving money.

Held from 9 by the arbitrary 0.6 confidence floor (uncalibrated, and they say so), a 2-case ablation, and — most expensively under *this* criterion — **the README's central sentence overclaims the model's role.** "An AI agent that verifies a merchant's payment terms" describes a more LLM-driven system than the one they built. In a program that marks you down for forcing AI in, marketing yourself as more AI-driven than you are is the specific sin.

### C4 · Failure Recovery — **7** (15%)

Razorpay: *"A project that crashes on bad input will score poorly."*

Fail-closed is the default posture throughout: low confidence → UNDETERMINED → refuse; missing authority → UNDETERMINED; NPCI source down → local checksummed corpus, never a live fetch on the money path. Idempotent replay returns the original response with no side effects. They found and fixed a real blind spot — the HEAD check now runs *before* the empty short-circuit, so deleting the entire log no longer reads as OK.

Held at 7 by three things, one of which is the exact phrasing of the criterion: **claim store missing → crash at import.** They call it "not graceful, but loud," which is a defensible engineering choice and still a crash on bad input. Plus incomplete RECONCILE_PENDING, and multi-process races that corrupt the ledger *silently* — silence is the wrong failure mode for an audit log.

### C5 · Problem Taste — **8** (10%)

They picked: *provider documentation drifts from the regulation that authorises it, and an autonomous buyer agent transacting against those docs will exceed regulatory bounds with nobody noticing.* Then they found three real instances — two in Razorpay's own test API (₹15k vs OC-228's ₹10k; 91d vs 90d), one published (SEP #216 reading a per-month cap as per-transaction).

The original jury filed this as a weakness: *"a Razorpay config issue, not a merchant problem."* That inverts who carries the exposure. The merchant is the one out of spec when they build against a surface that diverges from the circular. And for this specific panel: a student probed your product, found clause-level divergences from the regulation, cited the paragraph, and shipped a gate against it. That is the seam Track 01 exists to probe.

Held from 9 by an honest constraint: all four merchants polled are card-only, so the UPI Reserve Pay path has **zero live users in the sampled market**. The problem is real and currently unpopulated.

### C6 · Documentation & Defensibility — **5** (15%)

ARCHITECTURE.md is above average — entry points, data flow, the LLM boundary, declared limits. Comments explain *why* (lock placement; why two similar-looking checks are distinct). Limits are surfaced rather than buried.

Against that: the program asks applicants by name to explain **"what broke during development and how recovery was executed."** The project has four genuinely good war stories — the SEP #216 scope error, the ledger truncation blind spot, a conformance gate that passed its own vacuous CI, and a concurrency race that went from latent to live when blocks moved to per-(customer, merchant) — and **the single document that would carry them does not exist.** Combined with the README overclaim, this is the largest scoring gap in the submission. It is also the cheapest to close.

Pitch video is gated above, not scored here.

## Phase 3 — Total

| Criterion | Score | Weight | Contribution |
|---|---|---|---|
| Track 01 Bar Compliance | 8 | 25% | 2.00 |
| Build Quality | 8 | 20% | 1.60 |
| AI Judgment | 8 | 15% | 1.20 |
| Failure Recovery | 7 | 15% | 1.05 |
| Problem Taste | 8 | 10% | 0.80 |
| Documentation & Defensibility | 5 | 15% | 0.75 |
| **Total** | | | **7.40** |

**Verdict: ADVANCE**, conditional on the pitch video existing.

### Where the 2.0-point swing from 5.4 comes from

Re-pointing, not generosity — and two of the three moves are the instrument admitting it was aimed wrong:

- **+1.20** — AI Judgment enters as a scored criterion at 8. The old rubric had no such criterion and priced the same evidence *negatively* through the Wrapper Attack.
- **+0.75 net** — the old 25%-weight Measured Metrics criterion, which imposed Track 02's held-out-precision/recall bar and a self-borrowed N≥50 threshold on a Track 01 submission, is retired. That weight now measures the bar Razorpay actually wrote for this track, which the project meets at 8.
- **−0.25 effective** — documentation is punished *harder*, at 15% instead of 10%, because the program says it is first-class. The C6 score of 5 is unchanged; it now costs more.

## Phase 4 — Panel simulation

The thing the original pipeline never did. Questions generated from the dossier's own *Unverifiable Claims* and *Discrepancies* tables — which is exactly where a panel will go.

| # | Question | Answer strength |
|---|---|---|
| 1 | *"Your README says an AI agent verifies merchant terms. Show me where the model actually sits."* | **Dangerous.** The README is wrong. Reframe: the model is deliberately off the money path so it cannot be prompt-injected into a debit — and it is still load-bearing where the problem is undecidable. **Fix the sentence before submitting.** |
| 2 | *"You committed to N≥50 and shipped 12. Why trust anything you measured?"* | **Strong.** "I suppressed the headline rather than report a rate off 12 — here is the harness exiting 2." The gap is the demonstration. |
| 3 | *"We set ₹15,000 for test-mode ergonomics. Are you sure you found a bug?"* | **Medium, and politically delicate.** They already hedged the probes. Answer: not claiming a production bug — claiming an agent built against the documented test surface learns a bound the circular does not authorise. Tone matters more than content here. |
| 4 | *"Money moved. Ledger append failed. Walk me through it."* | **Weak — the highest-risk question.** RECONCILE_PENDING is unimplemented, and it sits inside the audit-trail claim that is the track's headline requirement. |
| 5 | *"Two processes, same block, same instant."* | **Adequate.** In-process RLock only; needs `fcntl.flock` or shared state. Declared, not hidden. |
| 6 | *"Your ledger is forgeable by anyone with write access to both files."* | **Medium.** It raises the bar from editing a line to rebuilding chain + HEAD; the real fix is external timestamping or offline-key signing, consciously out of scope. |
| 7 | *"Seven claims, hand-read. What happens on a 40-page circular?"* | **Weak.** Known largest gap. Do not oversell it. |
| 8 | *"All four merchants are card-only. Who is the user?"* | **Medium.** "Today, nobody — which is why I probed the API instead of the merchants. This is for the agentic-commerce flow you are building toward." |
| 9 | *"Delete the LLM. What breaks?"* | **Strong — rehearse this one.** "Nothing, for the 7 claims in the corpus. Everything at claim #8: a regex finds the number and misses the scope. Here is `naive.py` reproducing SEP #216." This is the AI Judgment answer, and the old jury thought it was fatal. |
| 10 | *"How much of this did you write?"* | **The hiring question.** ~1,300 LOC core is hand-written; the frontend is generated. Be precise and volunteer it. |

## Phase 5 — Leverage, filtered by four days

**Cut from the old plan:** sourcing and hand-labelling 50+ regulatory claims (ranked #1, +1.0, 20–30h of research labour). It cannot be done well by the deadline, and a rushed version produces exactly the cherry-picked N this project has been principled about refusing. Doing it badly costs more than not doing it.

| # | Action | Hours | Effect |
|---|---|---|---|
| 1 | **Confirm the pitch video exists; record it if not.** Show a refusal with its clause citation, the ledger, and one recovery. | 4 | Gate. Binary. Nothing else counts without it. |
| 2 | **Fix the README's central sentence.** State plainly that the model extracts constraints off the money path and the gate is deterministic. | **1** | Best ratio in the set. Converts the worst panel question into the best one; lifts C3 and C6. |
| 3 | **Write FAILURES.md.** Four incidents, already lived: SEP #216, ledger truncation, the vacuous conformance gate, the concurrency race. Error → discovery → impact → fix → commit. | 5 | C6 5 → 7 = **+0.30**. The artifact the program asks for by name. |
| 4 | **Implement RECONCILE_PENDING**, or write the exact recovery path and say why it is not coded. | 6 | C1 8 → 9 = **+0.25**. Closes the worst question. |
| 5 | **Rehearse the deletion test** (Q9) until it is forty seconds long. | 0 | Free. It is the AI Judgment criterion. |

**~16 hours → roughly 8.0.** Skip: multi-process `fcntl`, confidence calibration, method docstrings, the generalizability section, doc de-duplication. All are real; none pay inside four days.

---
---

# Sources and limits

## Sources

- [Razorpay AI Buildathon](https://razorpay.com/buildathon/) — JS-rendered; yields only the tagline. **No rubric published.**
- [Razorpay AI Builders](https://razorpay.com/ai-builders/) — publishes the three-step process; **no weights, dimensions, or thresholds.**
- [CareersInCloud — Buildathon 2026](https://careersincloud.com/blog/razorpay-ai-buildathon-2026-75000-stipend-internship-for-students) — source of the four attributed dimensions (Problem Taste, Build Quality, AI Judgment, Failure Recovery), the "documentation is first-class" rule, and the completeness-dominance rule.
- [Velonx — Tracks, Eligibility, Selection](https://velonx.in/blog/razorpay-ai-buildathon-2026-tracks-eligibility-stipend-selection-process) — independent corroboration of AI Judgment and documentation weighting. Returned HTTP 503 on direct fetch; content retrieved via search index.

## Limits of this review

Stated plainly, held to the standard imposed on the original instrument:

- **No percentile, no shortlist probability.** No field data exists, so no distribution is manufactured. "Above the bar for Track 01" is the strongest honest claim available. Fabricating a percentile is the failure the previous verdict committed in the same breath as praising this project for avoiding it.
- **Dossier only.** The repository was not read. Every score traces to a cited dossier section.
- **The criteria set is secondary-sourced**, not razorpay.com verbatim. Two independent outlets carrying identical "AI Judgment / marked down for forcing an LLM" language is corroborating, not authoritative.
- **Unassessed:** the pitch video (gated, unknown); student eligibility; the applicant's authorship split beyond what dossier §8 records.
- **Single juror, scoring sequentially.** The recommended independent-second-juror pass (Part 3, change #8) has not been run.
