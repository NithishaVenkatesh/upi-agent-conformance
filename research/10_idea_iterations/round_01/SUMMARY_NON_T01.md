# Round 01 — Summary: the non-T01 counter-case (Tracks 02 / 03 / 04)

**Judged:** 2026-08-26 · **Panel:** IdeaAgent (adversarial) · **Posture:** unimpressed by default; a well-argued 58 beats a generous 82.
**Brief:** judge five ideas from Tracks 02/03/04 as the counter-case to the converged Track 01 recommendation. Score global strength and Razorpay fit **separately**. Apply the collision penalty at **idea** level, never track level.

---

## The ranked table

| # | Idea | Track | **Global /100** | **Razorpay fit /100** | Saturation | Verdict |
|---|---|---|---|---|---|---|
| 1 | **The Twenty-Four Hour Window** — occupy the RBI-mandated pre-debit notice interval | T03 | **78** | **78** | HIGH | **GO** |
| 2 | **Payer's Conscience** — Section 43B(h) buyer-side payables agent | T03 | **73** | **74** | LOW (in-field ~zero) | **GO** |
| 3 | **Business Decline Triage** — classify UPI business declines, pick the only workable intervention | T03 | **71** | **72** | EXTREMELY SATURATED | **GO — conditional** (escape must be re-argued from capability→timing/scope, else NO-GO) |
| 4 | **VAMP Governor** — manage Visa's monthly dispute *count* ratio as a portfolio constraint | T02 | **65** | **58** | LOW | **NO-GO** |
| 5 | **Four Files, One Rupee** — tiered ERP↔bank↔PG↔marketplace matcher, ₹0 exception ledger | T04 | **64** | **62** | EXTREMELY SATURATED | **NO-GO** (reversible on one measurement — see below) |

Full judgments: `T03_twenty_four_hour_window.md` · `T03_payers_conscience.md` · `T03_business_decline_triage.md` · `T02_vamp_governor.md` · `T04_four_files_one_rupee.md`.

---

## Dimension heat map — where each idea actually wins and loses

| Dimension (max) | 24h Window | Payer's Conscience | BD Triage | VAMP Governor | Four Files |
|---|---|---|---|---|---|
| Problem strength (10) | 7 | 8 | **9** | 5 | 7 |
| Innovation (10) | **8** | 7 | 6 | **8** | 5 |
| Originality (8) | 6 | **6** | 4 | 6 | 3 |
| Differentiation (7) | **6** | **6** | 4 | **6** | 3 |
| Real-world impact (10) | 6 | 7 | **8** | 4 | 6 |
| Market opportunity (7) | 5 | 5 | **7** | 4 | 6 |
| **AI necessity (8)** | **6** | 5 | 5 | 4 | **3** |
| Technical depth (8) | 6 | 6 | 5 | **7** | **7** |
| Feasibility (5) | **5** | 4 | **5** | 3 | 4 |
| **Demo power (8)** | 7 | 5 | 5 | 6 | **8** |
| Wow (5) | 4 | 3 | 3 | 4 | 4 |
| UX/product (3) | 3 | 3 | 3 | 2 | 3 |
| Responsible AI (3) | **3** | **3** | **3** | 2 | 2 |
| Hackathon competitiveness (8) | **6** | 5 | 4 | 4 | 3 |
| **TOTAL** | **78** | **73** | **71** | **65** | **64** |

**The pattern that matters: no idea in this set scores above 6/8 on AI necessity.** That is not five coincidences — it is the shape of Tracks 02/03/04 once Agent Studio and Vulcan have taken the parts where AI is obviously load-bearing. What remains for a student build is either tabular ML that a gradient booster does (and pillar 3 rewards admitting), or a deterministic controller with a classifier on the tail.

---

## The four decisive findings

### 1. The collision penalty at idea level confirms the methodological correction — and it changes the ranking

Applying the −4 at track level would have compressed all five toward the middle. Applied per-idea against five escape axes, the spread is 20 points and the ordering inverts against the track scorecard: **T03 (nominally ~78) supplies the top three; T04 (~71) and T02 (~71) supply the bottom two.** The correction was worth making and it is now empirically load-bearing, not just methodologically tidy.

The escapes, ranked by how hard they are to rebut **in the room**:

| Rank | Escape | Idea | Why it holds — or doesn't |
|---|---|---|---|
| 1 | **Different principal** | Payer's Conscience | The judge cannot rebut it. Receivables Agent is the creditor's agent; there is no payer's agent anywhere in the shipped stack. This is a structural fact, not a quality claim. |
| 2 | **Different timing** | 24h Window | Checkable in seconds against Razorpay's own product copy — every shipped recovery agent is at or after T=0. Shelf life = their release cycle ("Renewal Shield, coming soon"). |
| 3 | **Different objective** | VAMP Governor | Demonstrable — run both policies on identical input and show them diverge. Strong escape attached to a dead target. |
| 4 | **Different data boundary** | Four Files | Thin, and Source-to-Pay's shipped 3-way matching is walking into it. |
| 5 | **Different capability** | BD Triage | **Weakest kind.** Asserted about production internals the applicant has never seen, to the people who built them. Probably true; not defensible. |

### 2. Every one of the five has an authored measurement target

`FIELD_BAR.md` §0: *"every single measured repo in the field has a compromised measurement target."* These five would join it.

| Idea | Ground truth | External anchor available? |
|---|---|---|
| BD Triage | Synthetic declines | **Yes — public NPCI bank-wise BD/TD composition.** The only idea of the five with a real kill-gate available, and it is the single best technical decision in this round. |
| 24h Window | `P(fail)` **and** `P(cancel\|notice)` both authored | No. Worse than a single authored label — the headline is a *difference of two invented quantities*, so its sign is a free parameter. |
| Payer's Conscience | Synthetic Udyam register | No — Udyam is not bulk-downloadable. The crux (entity resolution) is self-graded. |
| Four Files | Planted correspondences | No — settlements do not occur in test mode. |
| VAMP Governor | Authored disputes, TC40/15/05 streams **and** evidence bundles | No. Three layers of fixture. |

**Recommendation for whichever idea proceeds: the NPCI real-data kill-gate is transplantable, and it should be transplanted.**

### 3. Two ideas fail a named rubric pillar before build quality is assessed

- **VAMP Governor** fails **pillar 1** (problem taste): Visa's own footnote says the programme is unannounced in India. The applicant quotes it as evidence *for* the idea; the panel reads it as a ten-second kill. It also probably fails **pillar 3** — the corpus contradicts itself on whether CE3.0 qualification (a published rule with four enumerable criteria) should be a model at all, and the likely resolution deletes the only AI in the system.
- **Four Files** is structurally squeezed by **pillar 3**: to satisfy it you must publish the tier table; the tier table is what shows the deterministic cascade doing most of the work. **The more honestly it is measured, the worse it scores on the pillar it is trying to satisfy.**

### 4. Every idea leaning on an unevidenced magnitude was docked, and the docks were large

Per the brief's warning about the non-existent India RTO rate, the same discipline was applied throughout: **24h Window** −3 on problem strength (magnitude unevidenced; all involuntary-churn figures are vendor-grade D and were correctly excluded); **Four Files** −3 (corpus finds no credible statistic exists); **VAMP** −5 (programme not live in India); **Payer's Conscience** −2 (headline number belongs to two advocacy bodies and a working-capital lender). **BD Triage** was docked only −1, because its number is the one traceable to NPCI. No idea was rewarded for a number it could not defend.

---

## The falsifiable test — #16 / Four Files

As specified in the brief, the day-2 deterministic-residual measurement, and exactly how the score moves:

| Deterministic (Tier 1 + Tier 2) clear rate | AI necessity | New total | Consequence |
|---|---|---|---|
| **>90%** | 3 → **1** | **≈60** | **T04 is dead as an option.** The model is a rounding error on the product. Fallback becomes `T03_payers_conscience`. Publish the finding — *"we measured our own AI's contribution before building it and it was 4%"* is a genuinely good failure narrative and a bad submission. |
| 70–90% | 3 → 4 | ≈65 | Verdict unchanged. Still NO-GO. |
| **<70%** | 3 → **6** | **≈70** | **Genuine contender.** A 30%+ irreducible fuzzy residual makes the AI unambiguously load-bearing and converts the tier table from a confession into a proof. Earns a **GO** — but still below the 24h Window (78) and Payer's Conscience (73), and still facing nine named rivals. |

**Cost: a few hours. Run it before any further T04 work.** It is the most decision-relevant measurement in this round.

---

## Portable assets — take these regardless of what gets built

Four things were produced by ideas that lost, and are worth more than the ideas that produced them:

1. **The four-unjoinable-files opening** (Four Files). The strongest single visual in the entire corpus — ten seconds, no narration, universal recognition. Put it on top of whatever wins.
2. **The NPCI real-data kill-gate** (BD Triage). Validating a simulator against a distribution you did not author, before generating anything. `FIELD_BAR.md` §5 rates this the strongest single move in the field; **exactly one repo in 261 does it.**
3. **The policy-divergence demo** (VAMP Governor). Same input, two objectives, different actions, side by side. The only *demonstrable* escape in the pool.
4. **The published-negative discipline** (24h Window). Reporting the harm your intervention caused — induced cancellations — as a first-class line in the same font as the win. No vendor and no repo in the field does this, and it is the most direct available answer to pillar 2's *"would you trust it."*

---

## THE VERDICT ASKED FOR: does any of these beat a strong Track 01 entry?

**No. And the honest reason is not the one the fallback case assumes.**

The natural expectation was that T02/T03/T04 would beat T01 on the two things T01 is gated on — **AI leverage** and **measurability** — while conceding problem taste. That expectation does not survive the scoring.

**On AI necessity, the fallbacks do not rescue anything.** The best of the five scores **6/8**; the median is 5/8; the T04 entry scores 3/8. `track_scorecard.md` flags T01's decorative-LLM risk as *"the real risk"* — but a 6/8 is not a solution to that risk, it is the same risk one notch quieter. **Choosing a T03 idea does not buy load-bearing AI; it buys a slightly better argument about load-bearing AI.**

**On measurability, the advantage is real but thin.** All five produce an honest batch metric over 50+ cases. Only **one** — BD Triage — has an external anchor available, and that anchor is transplantable into a T01 build. Every other target is authored, which means every other idea walks into `FIELD_BAR.md` Opening 1, the flaw verified in **every measured repo in the field**. Four of these five would be attackable in the same 30 seconds that killed the field.

**On problem taste, the gap is decisive and it is not close.** Pillar 1 is graded, and **Razorpay is not a neutral judge of what "matters."** Track 01 maps onto something they are publicly, visibly stuck on: six PRs into the ACP repo adding UPI, five open, none merged, stalled since 2026-05-15 for want of a TSC sponsor, authored by the #1 and #5 committers on their own MCP server — plus absence from every agentic-checkout partner list while Flipkart is present. Combined with a finding a judge can reproduce in ten seconds (four major Indian D2C brands serving live UCP profiles that cannot take UPI, in a country that is 80%+ UPI), that is a problem-taste argument **none of these five can match** — not because these problems are smaller (₹7.34 lakh crore is not small) but because the judge does not personally feel them as an open wound. On this evidence they feel **BD Triage's** problem acutely — and that is precisely why BD Triage's ground is the most contested on the board.

**Add the field-density fact:** T01 is 6% of 261 repos with one serious sell-side occupant whose headline evidence is *a deterministic mock whose rerun delta is exactly zero*. T03 is 24%. These five would be competing against ~63 rivals; a T01 entry competes against roughly one.

### The one honest caveat

T01's ~58 + ⏳(40) is provisional, and if **both** gates fail — no live delegated rail to bound against, **and** no way to make the AI load-bearing rather than decorative — then a T01 submission fails pillar 3 by construction, and a construction-failure is worse than any score here. **In that specific scenario, and only that one, the fallback is `T03_payers_conscience` (73/74)** — not because it is the highest-scoring (the 24h Window is), but because its escape is the only one in the pool a judge cannot argue with, it needs no test-mode access whatsoever, and it is the one idea whose *thinking* the panel unanimously respected even where they doubted the build.

### Recommendation

| Priority | Action |
|---|---|
| **1** | **Proceed with Track 01**, conditional on the two gates. Nothing here beats it on problem taste, field density or demo legibility, and nothing here solves the AI-necessity problem that Track 01 is gated on. |
| **2** | **Resolve the T01 gates first, not the fallback.** The fallbacks are 73 and 78 with authored labels; that is not a safety net worth switching to pre-emptively. |
| **3** | **If both T01 gates fail → `T03_payers_conscience`.** Then immediately measure the GSTIN-presence residual, because that measurement decides whether it has any AI either. |
| **4** | **If demo legibility and sandbox-honest measurement are weighted above problem taste → `T03_twenty_four_hour_window` (78).** Resolve the RBI mandate-modification/AFA question before anything else; it is load-bearing on 6 points. |
| **5** | **Transplant the four portable assets regardless of the choice.** They cost hours and they are what separates a top-5 submission from a tidy one. |
