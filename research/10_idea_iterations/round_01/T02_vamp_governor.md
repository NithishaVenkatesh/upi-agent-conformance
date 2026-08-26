# T02 · VAMP Governor — managing a monthly dispute *count* ratio as a portfolio constraint

**Idea ID:** `T02_vamp_governor` · **Pool ref:** `pool_demo_ai.md` #1 (see also `pool_measurement.md` #18, CE3.0 QUALIFIER — which contradicts it on the AI role; see below)
**Judged:** 2026-08-26 · **Panel:** IdeaAgent (adversarial)

---

## One-line pitch

> A compliance-ratio controller that decides, across a month's dispute portfolio, which disputes to fight, which to refund pre-emptively and which to CE3.0-qualify — because Visa's threshold counts **events**, not rupees, and the cheapest way to stay under it is often to lose money on purpose.

## Problem

Visa VAMP scores an acquirer/merchant on `count[Fraud TC40 + Disputes TC15] ÷ count[settled TC05]`, evaluated monthly. Merchants fight representments after the fact, one dispute at a time. But the ratio's own definition contains two numerator exclusions — CE3.0-qualified fraud and disputes resolved through **pre-dispute** solutions — so a dispute prevented or resolved upstream never enters the numerator, while a dispute **won on representment still does**. Nobody manages the ratio; everybody manages the disputes.

**Evidence — Visa VAMP fact sheet 2025, PRIMARY, verbatim** (`risk_problems.md` §3.1): acquirer **Above Standard ≥50bps, Excessive ≥70bps**; Excessive Merchant AP/Canada/EU/US **≥220bps → ≥150bps on 1 Apr 2026**, minimum 1,500 monthly count; effective 1 Jun 2025.

**And footnote 1, verbatim:** *"Programs for Brazil, Chile, and **India** will be announced later."*

That footnote is quoted in the pitch as evidence the problem is arriving. **The panel reads it the opposite way, and that reading is the whole judgment below.**

## User

Risk/finance lead at a mid-size Indian D2C or cross-border merchant whose acquirer is about to have a bad month. **In India, today, this user does not exist** — only the subset transacting into AP/EU/US/Canada acquiring is exposed.

## Solution

A monthly controller. Ingest the dispute + settled-transaction stream, forecast end-of-month ratio under a do-nothing policy, then solve a constrained allocation: per open dispute choose `FIGHT` / `PRE-EMPT-REFUND` / `CE3.0-ASSEMBLE` / `ACCEPT`, subject to (a) staying under a target bps, (b) a rupee budget for pre-emptive refunds, (c) never refunding a winnable dispute *unless* the ratio constraint binds — and saying so explicitly when it does.

## AI role

LLM on exactly one thing: reading the heterogeneous dispute artefact bundle (order record, comms thread, courier POD text, AVS/device blob) and returning a structured **CE3.0 qualification verdict with per-criterion justification**.

**Deliberately not AI:** the ratio arithmetic, the threshold comparison, the allocation solve, the budget accounting — all integer count over integer count, reported exact and without a confidence interval (adopting `tfthushaar`'s `calibrator.py` discipline verbatim).

> ⚠️ **An unresolved internal contradiction in the corpus that the panel must flag.** `pool_measurement.md` #18 argues the exact opposite on the same task: *"CE3.0 criteria evaluation is a rule and must be, because it is a **published network rule** — using a model here would be strictly worse and slower, and saying so is a direct pillar-3 hit."* The CE3.0 criteria are enumerable (two qualifying prior transactions 120–365 days old sharing two of: device ID, IP, delivery address, account ID). If #18 is right — and on the face of the criteria it is — then the **only** AI in this idea is misplaced, and the system is a deterministic controller with a decorative classifier. This contradiction must be resolved before the idea proceeds, and the resolution decides whether the idea has any AI at all.

## Razorpay role

Disputes API + settlement/transaction counts as the TC05 denominator; Refunds API as the gated pre-emptive action.

## Competitors

Agent Studio **Dispute Responder** (per-dispute) · Chargeflow / Chargebacks911 class vendors (all per-dispute) · in-field: `srijan2607/fraud-pulse`. **Nobody in a 261-repo field manages a ratio.**

---

## Score table

| Dimension | Max | Score | Justification |
|---|---|---|---|
| Problem strength | 10 | **5** | The mechanism is documented at grade A from a card-network primary. But **the programme does not apply in India and Visa has said so in writing.** Pillar 1 is *"did you pick something that actually matters"*, graded by an Indian PSP; the honest answer is *"it will matter, on an unannounced date, with unannounced parameters, to the subset of Indian merchants with foreign acquiring."* That is a materially weaker problem than the other four judged here, and the footnote the pitch quotes as a strength is read by the room as the disqualifier. |
| Innovation | 10 | **8** | **The best pure analytical insight of the five.** Optimising a set-level count constraint versus optimising each item is a real and rarely-drawn distinction, and the observation that it produces *opposite* actions on the same input — refund a dispute you would win — is genuinely non-obvious. If insight alone were scored, this places first. |
| Originality | 8 | **6** | Nobody in-field, and no vendor in the chargeback category, manages the ratio rather than the disputes. Docked because portfolio-constraint optimisation is a well-known technique being applied to a new object, not a new technique. |
| Differentiation | 7 | **6** | Escape axis E3 (**portfolio objective, not per-item objective**) is structurally strong: your system and Dispute Responder produce *different actions on identical input*, which is a demonstrable difference rather than a positioning claim. That demonstration is the best differentiation artefact in the pool. |
| Real-world impact | 10 | **4** | Hypothetical in the judges' market. For a global merchant it is real money — VAMP penalties are levied and the 1 Apr 2026 tightening to 150bps is dated. But impact you cannot instantiate for the judge's own customers is impact you cannot claim. |
| Market opportunity | 7 | **4** | The market will exist. *"Announced later"* is an unbounded date and the parameters are unknown, so you cannot even size the exposure. |
| AI necessity | 8 | **4** | Thin before the contradiction, and possibly zero after it. The single LLM task is CE3.0 qualification, which `pool_measurement.md` #18 argues convincingly is a **published rule** that a model would execute strictly worse. If that is right, this is a deterministic optimiser with an LLM ornament — a direct pillar-3 failure. The salvageable version is narrower: extracting structured facts (delivery address, device ID) from unstructured artefacts *before* a deterministic criteria evaluation. That is defensible but small. |
| Technical depth | 8 | **7** | Genuine: constrained allocation under forecast uncertainty, forecast-vs-actual calibration, and a numerator/denominator definition that must be implemented exactly right or the entire system is wrong. Depth without artificial complexity. |
| Feasibility | 5 | **3** | Weakest of the five. Dispute creation in test mode is unverified, so the dispute ledger, the TC40/TC15/TC05 streams and the evidence bundles are all authored — three layers of fixture between the code and reality. And you must simulate transaction and dispute distributions you have never observed. |
| Demo power | 8 | **6** | A bps gauge climbing toward a penalty line with 9 days left is a good scene 1, and the allocation table dropping it below the line is a good scene 3. The close is the strongest single **sentence** in any of the five: *"we refunded ₹X on 2 disputes we would probably have won. That was the price of the constraint."* Docked because scene 1 requires the judge to already accept that the line exists in India — and it doesn't. |
| Wow factor | 5 | **4** | "Sometimes the right move is to lose on purpose" is memorable and survives the day. |
| UX / product quality | 3 | **2** | Productisable but niche — the buyer is a risk lead at a merchant large enough to have a monthly dispute count above 1,500. |
| Responsible AI / safety | 3 | **2** | Handled with gating, but note the shape of the action: this system **spends the merchant's money on purpose** to manage a compliance number. That is the most aggressive autonomous action of the five and it needs a stronger justification than the others. Also worth checking against T02's explicit site disqualifier (*"strictly defense-only"*) — a ratio governor is defensive, but "engineer the numerator" is a framing worth not using out loud. |
| Hackathon competitiveness | 8 | **4** | Uncrowded within T02 (15% of field) and analytically the smartest entry. Fatally exposed to a ten-second question about whether the problem exists here. |
| **TOTAL** | **100** | **65** | |

### Razorpay Fit — scored separately: **58 / 100** — the lowest of the five

| Component | Score | Reasoning |
|---|---|---|
| Product-surface adjacency | 16/25 | Disputes API, settlement counts and Refunds API are all real Razorpay surfaces and the plumbing fits. |
| Do they feel the problem? | 8/25 | **The decisive cell.** Visa has stated in writing that the programme does not yet apply to India. Razorpay is an acquirer and *acquirer-level* VAMP thresholds are the version that would bite them — which is a genuinely interesting angle the pitch does not take. As pitched (merchant-side, India, a programme Visa says is unannounced here), the panel's honest reaction is *"this is not our problem yet."* Pillar 1 is graded, and Razorpay is not a neutral judge of what matters. |
| Uncollided-ness | 20/25 | Dispute Responder is per-dispute; nothing manages the ratio. Clean escape, real. |
| Pillar-3 (AI judgment) fit | 14/25 | An exemplary deterministic-boundary argument attached to an LLM role that may not belong. Strong on half, weak-to-void on the other. |

---

## Judge reaction

**First 10 seconds.** *"VAMP doesn't apply in India yet."* This is the reaction. It arrives before the second sentence of the pitch, from any risk person on the panel, and the applicant then spends the remaining 4 minutes 50 seconds recovering. **No other idea in this round has a ten-second kill available to a judge.**

**First 60 seconds.** If the room grants the premise, everything is clear and the insight lands well. But the premise is exactly what will not be granted.

**After the demo.** Remembered: the closing sentence about deliberately refunding winnable disputes. That line is genuinely excellent and it is the thing the panel will quote to each other. Also remembered: that the whole thing was hypothetical.

**Deliberation (five judges, after seeing everything else).**

> **Risk lead:** "Smartest analysis of the day. Also solving a problem that Visa has publicly said doesn't apply here yet. Both of those are true."
> **Payments PM:** "The acquirer-side version is *our* exposure. If they'd pitched it as 'here's a tool for Razorpay's own VAMP ratio' I'd be much more interested. They pitched it at merchants."
> **Vulcan/ML lead:** "Where's the model? CE3.0 is a rule with four enumerated criteria and a date window. They put an LLM on the one thing in their system that shouldn't have one, and then wrote an excellent essay about not putting LLMs on the things that shouldn't have them."
> **Compliance:** "Every number in their evaluation is invented — the disputes, the settled counts, the evidence bundles. There is no anchor anywhere."
> **Hiring manager:** "I'd talk to them. I would not shortlist the project."
> **Consensus:** best thinker, worst-targeted project. The insight is transferable; the target is not.

---

## Three-judge split

| | Score | Objections | Recommendation |
|---|---|---|---|
| **Judge A — Product/Business** | **56** | "No Indian buyer today. And you are asking a merchant to authorise an agent to refund disputes it could win — that is a very hard sale even when the maths is right." | Do not advance as pitched. Re-target at a live Indian constraint. |
| **Judge B — Senior Engineer** | **68** | "The controller is well-specified and the exact-arithmetic-no-CI discipline is correct. But your only LLM sits on a published rule, and your entire evaluation is three layers of your own fixtures. Nothing here has ever touched a real dispute." | Advance the *architecture*, not the target. |
| **Judge C — Hackathon Judge** | **58** | "A judge kills this in ten seconds with a fact from the applicant's own slide. That is the worst possible failure mode — you handed them the footnote." | Do not advance. Transplant the insight. |

**Disagreement worth preserving:** B is 10–12 points above A and C, and B is the only one judging the machine rather than the target. **The machine is good and the target is wrong**, and in a hiring funnel a wrong target is not recoverable by good machinery — pillar 1 is graded first and independently.

---

## Strongest advantage

**The portfolio-versus-per-item insight, which is transferable and should be transplanted.** The observation that a count-based monthly constraint makes the optimal per-item action *differ from* the per-item-optimal action is genuinely valuable, and it is the only idea of the five whose escape can be **demonstrated** rather than argued: run both policies on the same input and show them diverge. That demonstration is worth more than the idea it currently sits inside.

## Strongest weakness

**The problem is not live in the judges' jurisdiction, and the applicant's own evidence says so.** Quoting *"Programs for Brazil, Chile, and India will be announced later"* is intellectually honest and tactically self-destructive: it is a primary-source citation that the problem does not apply here, placed in the pitch by the applicant.

## FATAL RISK — what is the strongest reason this idea loses?

> **Weak market for these judges, on a problem the applicant's own primary source says has not arrived in India — compounded by an LLM placed on the one component that should be deterministic.**

Two independent kills, either sufficient:

1. **Pillar 1 (problem taste), ten seconds.** Razorpay is not a neutral judge of what matters. What matters to them is Indian payments now. A merchant-side controller for an unannounced Indian programme fails the first pillar before the demo starts.
2. **Pillar 3 (AI judgment), two minutes.** If CE3.0 qualification is a published rule with four enumerated criteria — and it is — then the sole AI in the system is misplaced. The submission would then consist of an exemplary *"where we did not use AI"* document attached to a system whose only use of AI is the wrong one. That is a uniquely bad outcome: the essay indicts the code.

**Note the corpus contradiction as a live risk.** `pool_demo_ai.md` #1 and `pool_measurement.md` #18 disagree about whether CE3.0 qualification should be a model. That disagreement was never resolved. Whoever builds this must resolve it in writing on day 1, and the likely resolution eliminates the AI.

## Competitor saturation

**LOW** — nobody in-field manages a ratio; the chargeback vendor category is uniformly per-dispute. **Saturation is not the problem here and the low figure should not be read as encouragement.** Per §21 saturation is not grounds for rejection; equally, its absence is not grounds for advancement. This idea is empty ground because the problem is not yet here.

## Verdict: **NO-GO**

Discard as pitched. **Reason:** the problem does not exist in the judges' market on the applicant's own evidence (pillar 1), and the single AI component is probably misplaced (pillar 3). Two named rubric pillars fail before build quality is assessed.

## Required improvements — i.e. how to save the *insight*

1. **Transplant the portfolio-constraint controller onto a constraint that is live in India today.** Three candidates, in order:
   - **NPCI OC-149's 5% business-decline target** — a live, published, per-participant threshold that **every measurable bank currently breaches**. A controller that manages a merchant's or PSP's position against a real NPCI target is the same machine pointed at a real number, and it inherits the best evidence in the corpus.
   - **RBI's T+1 / T+5 reversal TAT windows** with the ₹100/day compensation (RBI/2019-20/67) — a live, priced, dated obligation.
   - **The acquirer-side VAMP ratio as Razorpay's own exposure**, per the Payments PM's remark. Narrower audience, far higher relevance.
2. **Resolve the CE3.0 contradiction in writing before building.** If the criteria are enumerable, make evaluation deterministic and move the model to *structured fact extraction from unstructured evidence artefacts*, which is a real shape-B task and defensible.
3. **Build the divergence demo regardless of target** — same input, two policies, different actions, side by side. It is the single most persuasive artefact this idea can produce and it transfers to any constraint.
4. **Never quote the India footnote in the pitch** unless the idea has been re-targeted. As pitched, it is a primary-source citation against yourself.
