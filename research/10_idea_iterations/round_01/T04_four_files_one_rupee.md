# T04 · Four Files, One Rupee — tiered ERP↔bank↔PG↔marketplace matcher with a ₹0 exception ledger

**Idea ID:** `T04_four_files_one_rupee` · **Pool ref:** `pool_demo_ai.md` #16 (merged with `pool_measurement.md` #04 ATTRITION; absorbs #17, #19, #20 as exception classes)
**Judged:** 2026-08-26 · **Panel:** IdeaAgent (adversarial)

---

## One-line pitch

> Put four files on screen that all describe the same rupee and cannot be joined — ERP order, bank credit, PG settlement, marketplace payout — and then join them, with an exception ledger that admits everything it could not.

## Problem

No two of those four share a primary key, a granularity, or a timestamp convention. Between the order and the bank credit sit MDR, TDS u/s 194-O (1%), GST TCS, refunds netted from two cycles ago, chargebacks debited separately, and rolling reserve that is **neither in the bank nor in receivables**. So it is done in Excel, everywhere, forever.

**The corpus's honest finding on magnitude** (`market_problems.md` #6): *"**No credible statistic exists — and that is the honest finding.**"* The killed numbers are explicitly named: the 6.4-day close median (`[UNVERIFIED FETCH]`, APQC primary not located), the 30–40% vs 40–50% reconciliation-share figures (two vendors disagreeing by 20 points), and any "hours saved". **The one defensible hook is structural, not statistical: 3–5 different systems.**

## User

Finance controller at any Indian merchant selling across own-site + marketplace + offline, at monthly close.

## Solution

A three-tier matcher.
- **Tier 1** — exact deterministic joins on any key that does exist (UTR, order ID, payment ID), *and measure what fraction Tier 1 alone gets*, because that is the honest baseline.
- **Tier 2** — deterministic amount-and-window matching with fee / TDS / TCS / GST reconstruction. Still no model.
- **Tier 3** — the residual: fuzzy many-to-many over records with drifted timestamps, netted refunds spanning cycles, partial settlements.

Then an **exception ledger** reconciling `N_in → N_matched → N_exception` with a named reason per exception, and a rupee residual that **must sum to ₹0 or the build fails**.

## AI role

Candidate generation and match scoring **on the Tier-3 residual only** (shape A), plus a natural-language explanation per exception (*"this ₹4,812 credit is short by exactly the 1% 194-O TDS on the 3 October marketplace batch"*). LLM hypotheses are **arithmetically replayed and discarded if they do not reconcile** — validate-or-discard, not retry.

**Deliberately not AI:** Tiers 1 and 2, all arithmetic, the ledger — with an AST test failing the build if an LLM import appears in the matching kernel. Tax constants (194-O at 1%, GST TCS) cited to statute in a comment adjacent to the constant, as a guard against the constraint-drift failure mode.

## Razorpay role

Settlement reports, `fetch_settlement_recon_details` (present in the MCP tool surface), payments and refunds. ⚠️ **`SANDBOX RISK`: settlements do not occur in test mode.** All four artefacts must be generated synthetically with a published generator.

## Competitors

**Agent Studio:** Settlement Insights (WhatsApp payout summaries over already-joined data), Cashflow Forecaster, RazorpayX Bookkeeping/Reporting agents, Optimizer's Single View Reconciliation (cross-PG, not cross-ERP), **Source-to-Pay — which already claims 3-way PO/GRN/Invoice matching and GST ITC verification against filings.**
**In-field — the most crowded framing in the competition:** `tfthushaar/razorpay_buildathon`, `SuryaSK-dev/razorpay-ai-finance-controller`, `Amritbiswas07/kosh-ai-finance-controller`, `Samyak17Jain/reconciliation-sentinel`, `ch24btech11028-create/recoagent`, `cloudavenue0012-creator/settlement-reconciliation-engine`, `JazR20/reckon`, `simpleciki/unreconciled` — **nine named rivals already advertising arithmetic replay and adversarial self-audit.**

---

## Score table

| Dimension | Max | Score | Justification |
|---|---|---|---|
| Problem strength | 10 | **7** | Universally recognised, structurally documented, obviously real. Docked 3 because **the corpus itself cannot size it** and killed every candidate statistic. Pillar 1 is *"did you pick something that actually matters"* — recognition is a weaker answer than measurement, and the pitch is forced to lead with an artefact because it has no number. That is a good tactical choice made from a bad position. |
| Innovation | 10 | **5** | The ₹0-or-the-build-fails ledger is good engineering discipline. It is not an insight. Tiered matching with an exception queue is the textbook architecture for this problem and has been since before hackathons existed. |
| Originality | 8 | **3** | Nine named in-field rivals on the same artefact, and `pool_measurement.md` explicitly records T04 as *"weakest [for the measurement framing], where nine named rivals are already advertising adversarial self-audit, arithmetic replay and eval harnesses."* Both differentiating moves — the exception ledger and the replay — are already claimed by rivals. |
| Differentiation | 7 | **3** | The escape ("the ERP↔marketplace↔bank join is outside the PG's data boundary") is structurally sound but thin, and Source-to-Pay's shipped 3-way matching plus ITC verification against filings means Razorpay is visibly walking into it. The pool file grades this its own weakest escape and the panel agrees. |
| Real-world impact | 10 | **6** | Genuine finance-team relief, no revenue or risk movement, no money action at all. Value is labour and error reduction, which is exactly the class of value the corpus could find no credible number for. |
| Market opportunity | 7 | **6** | Every multi-channel merchant, permanent, recurring monthly. Also the most commoditised software category in this document. |
| AI necessity | 8 | **3** | **The decisive cell, and the file admits it:** *"if the residual turns out to be 4% of records, the AI is 4% load-bearing — and I would have to report that."* `track_scorecard.md` independently scores T04's AI leverage **6/10, the weakest of any track**, reasoning *"reconciliation is largely deterministic matching."* Two independent assessments agree. Against a rubric pillar named **AI judgment**, entering the track with the least AI is a structural handicap that no amount of build quality repairs. |
| Technical depth | 8 | **7** | Genuinely the best of the five: many-to-many assignment, tolerance algebra in integer paise, fee/tax reconstruction, an exception taxonomy, a hash-chained ledger tested in **both** directions. Real depth with no artificial complexity. |
| Feasibility | 5 | **4** | Buildable. Docked 1 for the sandbox gap — settlements do not occur in test mode, so all four artefacts and all ground truth are authored, and the "planted correspondence" is by definition your own generator's. |
| Demo power | 8 | **8** | **Full marks, and the only full marks awarded in this round.** Four files, same rupee, four different amounts, four different dates, no shared column. Ten seconds, no narration. Every finance person in the room has lived it. This is the strongest single visual in the entire idea corpus and it should be extracted and reused regardless of which idea is built. |
| Wow factor | 5 | **4** | The opening image survives the day. The ₹0 residual is a satisfying close. |
| UX / product quality | 3 | **3** | Obviously a product; produces a signed close pack a controller acts on. |
| Responsible AI / safety | 3 | **2** | Safe — it moves no money. Docked 1 because pillar 2's *"would you trust it"* is fundamentally about money-safety, and a read-only system has less to prove and therefore proves less. |
| Hackathon competitiveness | 8 | **3** | Most crowded on precisely its differentiating framing, in the track with the weakest AI case, against nine named rivals doing the same thing. |
| **TOTAL** | **100** | **64** | |

### Razorpay Fit — scored separately: **62 / 100**

| Component | Score | Reasoning |
|---|---|---|
| Product-surface adjacency | 20/25 | Settlement reports and recon details are first-class Razorpay surfaces and `fetch_settlement_recon_details` exists in their MCP tool set. |
| Do they feel the problem? | 14/25 | Settlement Insights and Cashflow Forecaster ship, so they feel it — and have already answered it in the shape they chose. The unserved part (ERP + marketplace) is outside their data boundary, which cuts both ways: it is uncollided *because* it is not their business. |
| Uncollided-ness | 14/25 | Source-to-Pay 3-way matching, Single View Reconciliation, Settlement Insights, Bookkeeping agent. Crowded from inside as well as outside. |
| Pillar-3 (AI judgment) fit | 14/25 | The `WHERE_WE_DID_NOT_USE_AI.md` with a cost column would be genuinely excellent. The where-we-*did* may be 4% of records. A superb answer to half of pillar 3 and a poor answer to the other half. |

---

## Judge reaction

**First 10 seconds.** The best ten seconds of the five, by a distance. Four files, one rupee, no shared column — instant, physical recognition from anyone who has closed a month. No competing idea here can match it.

**First 60 seconds.** Problem obvious, user obvious, solution obvious. The trouble arrives precisely at 60 seconds, when the room realises it has understood the whole thing and starts asking *"and what's the AI for?"*

**After the demo.** Remembered: the four files. Also remembered: the tier table showing Tier 1 clearing 61% and Tier 2 another 27% — which is honest, admirable, and quietly devastating, because it tells the room that 88% of the product is a SQL join and the model handles 12%.

**Deliberation (five judges, after seeing everything else).**

> **Finance-products PM:** "That opening image is the best thing I've seen all day. I'd put it in a deck."
> **Vulcan/ML lead:** "And then they showed me that their deterministic tiers do 88% of the work. They were honest about it, which I respect, and it also answered my question about whether to advance them."
> **Platform eng:** "Integer paise, tamper test in both directions, statute-cited constants, AST gate. Best-built of the lot. If build quality were the only pillar this wins."
> **Hiring manager:** "We had eight of these today. Two of them also had exception ledgers. One had arithmetic replay. This one was the tidiest."
> **Payments PM:** "Source-to-Pay does 3-way matching already. They're not wrong that ERP-plus-marketplace is outside our boundary, but 'outside our boundary' is a strange thing to lead with in our hackathon."
> **Consensus:** best engineering, best visual, least distinguishable, least AI. Advances on craft, not on judgment.

---

## Three-judge split

| | Score | Objections | Recommendation |
|---|---|---|---|
| **Judge A — Product/Business** | **68** | "Real pain, real product, no number. And the buyer is a finance team that already bought a recon tool. What is the wedge?" | Advance only with a named exception class nobody else resolves (rolling reserve, or GSTR-2B timing). |
| **Judge B — Senior Engineer** | **70** | "The cleanest build here. It is also the one where I can most clearly see that the model is optional. Publish the Tier-3 contribution and let it decide for you — that measurement is a day-2 experiment, not a week-2 one." | Advance conditionally on the residual measurement. |
| **Judge C — Hackathon Judge** | **54** | "Nine rivals, same artefact, same framing, same self-audit vocabulary. The visual is the only thing that separates it and a visual is not a submission." | Do not advance as a headline. Extract the opening and put it on top of something else. |

**Disagreement worth preserving:** C is **16 points** below B — the widest split in this round. B is scoring the code; C is scoring the crowd. In a hiring funnel where the panel sees the whole T04 cohort back to back, C's axis dominates, and the 64 aggregate is already the generous reading.

---

## The falsifiable test — and exactly how the score moves

The pool file names the right experiment and it is the single most decision-relevant measurement in this entire round:

> **Measure the Tier-1 + Tier-2 deterministic clear rate on a realistic synthetic batch, on day 2, before committing.**

| Outcome | AI necessity | Technical depth | Differentiation | **New total** | Verdict |
|---|---|---|---|---|---|
| **Deterministic clears >90%** | 3 → **1** | 7 → 6 | 3 → 2 | **≈ 60** | **NO-GO, hard.** The model is a rounding error on the product. T04 is dead as an option and the fallback is `T03_payers_conscience`. Publish the finding as an artefact and move on — *"we measured our own AI's contribution before building it and it was 4%"* is a genuinely good failure narrative and a bad submission. |
| **Deterministic clears 70–90%** | 3 → 4 | 7 | 3 | **≈ 65** | Unchanged verdict. Still crowded, still the weakest AI track, still a demo in search of a differentiator. |
| **Deterministic clears <70%** | 3 → **6** | 7 → **8** | 3 → **4** | **≈ 70** | **Genuine contender.** A 30%+ irreducible fuzzy residual makes the AI unambiguously load-bearing and turns the tier table from a confession into a proof. Still below `T03_twenty_four_hour_window` (78) and `T03_payers_conscience` (73), and still facing nine rivals — but it would earn a GO and a second round. |

**This experiment costs a few hours and should be run before any further work on T04.**

---

## Strongest advantage

**The opening visual, which is the best in the entire corpus and is transferable.** Four unjoinable files describing one rupee is more persuasive than any statistic, requires no narration, and works on a judge who has never seen a payment gateway. It should be stolen for whichever idea is actually built.

## Strongest weakness

**It enters the track with the least AI, in a competition whose third rubric pillar is AI judgment, on the most-replicated artefact of the five.** Two independent assessments (`track_scorecard.md`: 6/10 AI leverage; the idea's own author: *"if the residual is 4%, the AI is 4% load-bearing"*) reach the same conclusion before a line is written.

## FATAL RISK — what is the strongest reason this idea loses?

> **Insufficient AI necessity in a saturated space — and the honest reporting that pillar 3 demands is the thing that exposes it.**

The idea's own integrity discipline is its undoing. To satisfy pillar 3 you must publish the tier table. The tier table shows the deterministic cascade doing most of the work. A judge reading *"Tier 1: 61%, Tier 2: 27%, Tier 3: 12%"* correctly concludes that 88% of this system is a well-written SQL join and that the LLM handles the tail. That is excellent engineering and a poor answer to *"the right tool in the right place"* — because the honest answer turns out to be *"mostly, no tool at all."*

This is a genuine trap and worth naming precisely: **the more honestly this idea is measured, the worse it scores on the pillar it is trying to satisfy.** The only escape is if the residual is genuinely large, which is why the day-2 measurement is not optional.

Second fatal risk, independent of the first: **nine named rivals with the same artefact and the same self-audit vocabulary**, in a track that is 10% of a 261-repo field. Being the tidiest of nine is not a shortlist position.

## Competitor saturation

**EXTREMELY SATURATED** on the artefact **and** on the differentiating framing — the rarer and more damaging combination. Per §21 saturation alone is not grounds for rejection; here it compounds with a 3/8 AI-necessity score, and that combination is.

## Verdict: **NO-GO as a headline submission** — reversible on one measurement

Discard unless the day-2 deterministic-residual test returns **<70%**, in which case re-open as a **GO** at ≈70.

**Reason for NO-GO:** the intersection of the weakest AI-necessity case in the five, the most crowded artefact, and an escape its own author grades weakest. The demo is outstanding and the engineering would likely be the best of the five — neither offsets entering the AI-judgment pillar with the least AI.

## Required improvements — if it is re-opened

1. **Run the residual measurement first.** Nothing else matters until that number exists.
2. **Extract the four-files opening now, unconditionally, and give it to whichever idea wins.** It is the most valuable single asset produced by either idea pool.
3. **If re-opened, differentiate on an exception class nobody else resolves** — rolling reserve / settlement hold (pool #19: *"neither in the bank nor in receivables, invisible to both sides"*) or GSTR-2B supplier-timing (pool #17). Converting unexplained exceptions into explained ones is a measurable delta and the only differentiator available among nine rivals.
4. **Keep the ₹0-or-fail gate and the both-directions tamper test.** They are the strongest build-quality artefacts here and they transfer.
5. **Do not lead with any productivity statistic.** The corpus killed all of them; lead with the artefact, as the corpus instructs.
