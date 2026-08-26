# T03 · Business Decline Triage — "it isn't your bank's fault"

**Idea ID:** `T03_business_decline_triage` · **Pool ref:** `pool_demo_ai.md` #8 (see also `pool_measurement.md` #10, DECLINEBENCH — the tier-1 kill-gate variant)
**Judged:** 2026-08-26 · **Panel:** IdeaAgent (adversarial)

---

## One-line pitch

> Roughly one in eight Indian UPI payments fails because of the **customer's** state — no balance, wrong PIN, limit exceeded — and every tool in the market responds by retrying or rerouting, which cannot possibly help; this classifies the actual reason and picks the only intervention that can.

## Problem

NPCI splits UPI failure into **Technical Decline** (systems/network) and **Business Decline** (wrong PIN, insufficient balance, per-day limit exceeded, invalid beneficiary). The industry solved TD — it is ~0.7–0.8% and NPCI's CEO says so. BD was left to the customer, and it is an order of magnitude larger. **Rerouting to another gateway does not create money in the payer's account.**

**Evidence — the best in the entire corpus** (`payment_problems.md` §1.3, Dataful #445, source field NPCI, July 2026 bank-wise remitter data, all `[FACT]`):
- **All 10 publicly-visible banks exceed OC-149's 5% BD target. Five exceed 10%.**
- **Airtel Payments Bank: 72.56% approved, 26.97% BD, 0.47% TD.**
- Volume-weighted across those 10: **12.52% BD vs 0.39% TD** — BD is **32×** TD.
- Historical corroboration (Finbox on NPCI top-50, Mar 2022→Mar 2023): *"81.7% of the total failed transactions were attributed to 'business decline'."*

⚠️ **Coverage caveat that must appear on the slide:** those 10 rows are the alphabetical A–C preview of the top-50 table and **exclude SBI, HDFC, ICICI, Paytm, Yes/PhonePe.** Any average over them is unrepresentative. The defensible claim is the **composition** one, not a system-wide rate.

## User

Any Indian merchant with meaningful UPI volume — which is nearly all of them.

## Solution

Classify the decline into a BD taxonomy from the raw issuer/PSP response, then choose from a small, honest action set: **retry-later-at-a-predicted-hour** (insufficient funds), **switch instrument** (limit exceeded — the daily UPI cap is per-payer-per-rail, so a card genuinely helps), **re-collect via link** (wrong PIN — a human error a retry merely repeats), **stop** (invalid beneficiary — nothing will fix this; do not spend a contact). The last one is the point: **the system's most valuable output is "do nothing".**

## AI role

1. **Decline-string normalisation** — issuer/PSP failure descriptions differ per bank and per PSP; mapping unbounded surface forms onto a bounded BD taxonomy. Shape B.
2. **Retry-hour prediction for insufficient-funds**, conditioned on payer history, ticket size, day-of-month (salary cycles), instrument and bank. Ranking over a continuous action space.

**Deliberately not AI:** the action selection itself. Once the BD class is known, class→action is a **deterministic policy table**, and it must be, because it is the thing that spends money and contacts customers. No LLM anywhere in the money path, enforced by an AST import test with a vacuity guard.

## Razorpay role

Payments API failure codes; Payment Links for re-collect; test-mode failure injection is well supported.

## Competitors

Agent Studio **Subscription Recovery** · **Intelligent Retry Engine** (Sprint 26) · **Optimizer / Smart Router** (random forest over 1bn transactions) · **Vulcan** (claims 8–10% SR improvement via *"hyper-precision real-time routing"*) · in-field: `abhinav-phi/reflex` (rules-first + LLM root-cause, closest competitor, circular holdout), `Akshay1267`, `anditisyou`, and ~63 other T03 repos.

---

## Score table

| Dimension | Max | Score | Justification |
|---|---|---|---|
| Problem strength | 10 | **9** | The best-evidenced problem in the whole corpus and the only one where the regulator's own data shows **every** measurable participant failing the regulator's own target. Named user is everyone. Docked 1 only for the A–C coverage caveat, which is disclosed and handled correctly. |
| Innovation | 10 | **6** | *"Rerouting cannot create balance"* is a genuinely sharp sentence and the BD/TD split is public data almost nobody has read. But the insight produces the **single most-built artefact shape in the field**: classify a failure, pick an intervention. The framing is 8; the system is 4. |
| Originality | 8 | **4** | 24% of the field is in T03 and the great majority of it is decline-classification plus recovery. `abhinav-phi/reflex` is doing rules-first classification with LLM root-cause *today*. You would be entering the most-occupied square on the board with a better argument, not a different artefact. |
| Differentiation | 7 | **4** | **The weakest escape of the five.** It is a *capability* claim — "the shipped stack optimises authorisation and retry; business decline is downstream of both" — argued from outside, against a panel that includes people who built Optimizer and Vulcan. Capability claims are the one class of escape a judge can rebut from knowledge you do not have. The escape is probably *correct*; that is not the same as being *defensible in the room*. |
| Real-world impact | 10 | **8** | If BD recovery works at all, the rupees are enormous — 12.52% of a rail doing 23.66bn transactions a month. Docked 2 because the four available interventions are weak: you cannot create balance either, so your realistic gain is timing plus suppressed contacts. |
| Market opportunity | 7 | **7** | Every Indian merchant, permanent, growing with UPI. Nothing to dock. |
| AI necessity | 8 | **5** | Attackable in a specific way the pool file does not concede. **Razorpay publishes a finite error-code table.** For a merchant on Razorpay, the decline reason arrives as an enumerated code, not free text — so the "unbounded surface forms" premise applies at the issuer/PSP layer the applicant cannot actually access. The visible input is closer to a lookup than a classification. Retry-hour prediction is honest tabular ML. Load-bearing, but less than claimed, and the gap is easy to find. |
| Technical depth | 8 | **5** | Taxonomy construction plus a simulator anchored on public NPCI composition. The anchor is genuinely good practice — it would be the only such anchor in the T03 field. The rest is a classifier and a policy table. |
| Feasibility | 5 | **5** | Test-mode failure injection is well supported; fully buildable. |
| Demo power | 8 | **5** | Scene 3 is good: *"we are not going to contact these three, here's why."* The rest is four buckets and a confusion matrix, and confusion matrices do not move a room. The regex-baseline-mislabels-7-of-them side-by-side is a nice beat but a technical one. |
| Wow factor | 5 | **3** | The *"rerouting cannot create balance"* line is memorable. The artefact is not. |
| UX / product quality | 3 | **3** | Straightforwardly a product. |
| Responsible AI / safety | 3 | **3** | No LLM in the money path with mechanical enforcement; contacts-saved as a headline; explicit abandonment with reasons. Strong. |
| Hackathon competitiveness | 8 | **4** | Most-entered track, closest in-field competitor, weakest escape, undramatic demo. Excellent evidence does not offset four structural disadvantages against a strong field. |
| **TOTAL** | **100** | **71** | |

### Razorpay Fit — scored separately: **72 / 100**

| Component | Score | Reasoning |
|---|---|---|
| Product-surface adjacency | 23/25 | Payments API, failure codes, Payment Links, test-mode injection. Perfect adjacency — this *is* their business. |
| Do they feel the problem? | 22/25 | Success rate is the metric Razorpay sells on and Vulcan's headline claim is an 8–10% SR improvement. They feel this more acutely than anything else in the five. |
| Uncollided-ness | 11/25 | **The lowest of the five.** Optimizer, Vulcan, Smart Retry, Intelligent Retry Engine and Subscription Recovery all live in this neighbourhood. Your escape argument is that they live *next door* rather than *here* — and the neighbours are judging. |
| Pillar-3 (AI judgment) fit | 16/25 | The deterministic policy table and the AST test are excellent. The AI half is thinner than the pitch claims. |

**Note the shape of this fit score:** it is high on *"do they care"* and low on *"is it yours"*. That is the signature of a collided idea, and it is why topical proximity to Razorpay's core is not automatically an advantage.

---

## Judge reaction

**First 10 seconds.** *"Business decline versus technical decline — okay, go on."* Interested but not surprised. Everyone in that room already knows this taxonomy; it is their job. The pitch's edge over a general audience evaporates in front of this specific panel.

**First 60 seconds.** The NPCI table lands hard — *"every bank NPCI publishes is failing NPCI's own target"* is a strong 60-second moment and the single best evidence slide any of these five can build. But the follow-through is the problem: the room now wants to know what you do about it, and the honest answer is "retry at a better hour and stop contacting three people".

**After the demo.** Remembered: the NPCI number, and the three customers deliberately not contacted. Not remembered: the model, because the room's mental comparison is to Optimizer and it will not be favourable.

**Deliberation (five judges, after seeing everything else).**

> **Optimizer PM:** "Their premise is that we don't handle BD. We route on predicted authorisation probability, and predicted authorisation probability *includes* issuer-side refusal patterns. They've drawn our boundary where it's convenient for them."
> **Vulcan/ML lead:** "The NPCI anchor is the best methodological move I've seen today — validating the simulator against a real distribution before generating anything. That's the one thing the whole field skips. I want to hire whoever thought of that."
> **Payments PM:** "The 'do nothing' output is right and nobody builds it. But the value of not sending three SMS is not a slide."
> **Platform eng:** "AST test on the money path, deterministic policy table, published regex baseline. Clean."
> **Hiring manager:** "Best research, most crowded ground. If this had been pointed anywhere else it would be top three."
> **Consensus:** the applicant is impressive; the project is standing in the busiest doorway in the building.

---

## Three-judge split

| | Score | Objections | Recommendation |
|---|---|---|---|
| **Judge A — Product/Business** | **74** | "Your interventions can't create money. Best case you shift a failure a few hours later and save some SMS. That's a feature inside a recovery product, not a product." | Advance only if the contacts-saved economics are made the headline and priced. |
| **Judge B — Senior Engineer** | **74** | "The simulator anchored on public NPCI composition is the strongest single decision in any of these five files. But your classification input is an enumerated Razorpay error code — publish the regex table's accuracy first, and if it's 95% your model is decoration." | Advance. Run the regex baseline on day 1 and be prepared to pivot the AI claim to retry-hour prediction. |
| **Judge C — Hackathon Judge** | **64** | "Sixty-three other repos are in this exact space and one of them has already shipped the rules-first-plus-LLM-root-cause version. Being right is not the same as being distinguishable at 4pm on submission day." | Do not advance as a headline. Advance the *method* into another idea. |

**Disagreement worth preserving:** C is 10 points below A and B, and C is scoring the thing the other two are not — **the field**. A and B are judging the work; C is judging the submission. On a hiring-funnel rubric where the panel sees hundreds of these, C's axis is the one that decides outcomes. The 71 aggregate is generous to A and B's view.

---

## Strongest advantage

**The evidence, and the real-data kill-gate it enables.** Seeding a simulator from *public NPCI bank-wise BD/TD composition* means the synthetic distribution has an external anchor — the `vaibhav375` tier-1 move that `FIELD_BAR.md` §5 rates *"the strongest single move in the field"* and that **exactly one repo in 261 performs.** Doing it in T03, where nobody else has an anchor available, is the highest-value technical decision in this document.

## Strongest weakness

**The escape is a capability claim made to the people who own the capability.** "Routing cannot fix business decline" is a statement about Optimizer's and Vulcan's internals, asserted by someone who has never seen them, to people who have. If a single judge says *"actually, our authorisation model already conditions on issuer refusal patterns"*, there is no reply available.

## FATAL RISK — what is the strongest reason this idea loses?

> **Too common, on the most contested ground on the board, with the one escape that the judges can personally refute.**

T03 is 24% of the field. `abhinav-phi/reflex` already ships rules-first decline classification with LLM root-cause and pre-registered evaluation. Razorpay ships Optimizer, Smart Retry, Intelligent Retry Engine, Subscription Recovery and Vulcan. To win, this submission must be visibly better than ~63 rivals *and* survive a boundary argument against a production system it cannot see. The evidence advantage is real but evidence is a slide; the artefact is what gets compared, and the artefact is the most replicated shape in the competition.

Secondary, and nearly as bad: **the regex baseline may win.** If Razorpay's enumerated error codes map to the BD taxonomy at 95%+ with a lookup table, then per `FIELD_BAR.md` Opening 1 the honest thing to publish is *"a table beats our model"* — which is an excellent integrity artefact and a fatal headline.

## Competitor saturation

**EXTREMELY SATURATED.** Per §21 this alone is not grounds for rejection — and it is not the reason for this verdict. The reason is saturation **plus** the weakest escape **plus** the weakest demo. Any one of those three is survivable.

## Verdict: **GO — conditional, and the condition is strict**

GO *only* if the escape is re-argued from a **capability** claim to a **timing/scope** claim ("the shipped stack decides *before* authorisation and retries *after* failure; nothing decides what to do *given a specific refusal reason*"), which is checkable against published product copy rather than against internals. If it cannot be re-argued that way, this is **NO-GO as a headline submission** and should survive only as the measurement layer and NPCI anchor inside another idea.

**Weakest dimension to fix: differentiation (4/7) — and originality (4/8) cannot be fixed at all.**

## Required improvements

1. **Day 1: publish the regex/lookup-table baseline accuracy on Razorpay's enumerated decline codes.** If it clears 95%, the AI claim must move entirely to retry-hour prediction or the idea is dead.
2. **Re-argue the escape from published product copy only.** Quote Optimizer's and Vulcan's own descriptions and draw the boundary using their words, not your inference about their internals.
3. **Keep the NPCI anchor and make it the headline methodological claim** — *"we validated our simulator against a distribution we did not author, before generating anything"*. This is the strongest asset here and it is currently buried in a technical-depth paragraph.
4. **Price contacts-saved.** "We suppressed 3 of 40 contacts" needs a rupee figure per suppressed contact or Judge A's objection stands.
5. **Three baselines with stated parameters**, including a *tuned* naive retry. Against a panel that ships Smart Retry, a straw-man retry baseline is the single fastest way to lose the room.
6. **Steal-and-carry:** whatever wins, the NPCI real-data kill-gate should be transplanted into it. It is the most valuable thing this idea produced.
