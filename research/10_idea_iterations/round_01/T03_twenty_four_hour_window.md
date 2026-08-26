# T03 · The Twenty-Four Hour Window — occupying the RBI pre-debit notice interval

**Idea ID:** `T03_twenty_four_hour_window` · **Pool ref:** `pool_demo_ai.md` #9 (absorbs #10, The Fifteen Thousand Cliff)
**Judged:** 2026-08-26 · **Panel:** IdeaAgent (adversarial)

---

## One-line pitch

> RBI now forces every subscription merchant in India to warn every customer 24 hours before every charge — a regulator-mandated cancellation prompt — and that same notice is 24 hours of advance warning nobody is using to save the payment.

## Problem

Recovery agents are post-failure by definition; the entire dunning category begins at T=0. India's e-mandate regime hands merchants something no Western dunning stack has: a **scheduled, universal, legally-required moment before every debit at which the outcome is still changeable.** Today that moment is used only to increase churn.

**Primary evidence — RBI Master Direction *Digital Payments – E-mandate Framework, 2026*, RBI/DPSS/2026-27/396, 21 April 2026, fetched from rbi.org.in:**
- Pre-debit notification **"at least 24 hours prior to the actual charge / debit"**, carrying merchant name, amount, debit date/time, e-mandate reference and reason.
- AFA required above **₹15,000** (₹1,00,000 for insurance / MF / credit-card bills).
- AFA required to register, **modify** or withdraw a mandate; the customer may opt out of a particular transaction using AFA.

⚠️ The UPI Autopay failure-rate figures (8–15%) and the SBI ~70%-fail claim are `[UNVERIFIED FETCH] ⚠️ VENDOR`. **They are not used here.** The framework is the evidence; the magnitude is not evidenced.

## User

Indian subscription merchant — SaaS, OTT, insurance, edtech, D2C replenishment.

## Solution

A T−24h agent. For every mandate entering its notice window: predict **failure probability and cause**, predict **cancellation probability given the notice**, then choose exactly one bounded action — *do nothing* (the majority), *shift the debit date* to a predicted-liquidity day, *split the charge* below the AFA threshold where the plan permits, *downgrade-offer* where cancellation risk dominates, or *pre-warm* with a balance-check nudge. Then measure against the notices where it deliberately did nothing.

## AI role

**Load-bearing, shape C.** A joint prediction over two **competing risks** — will this debit fail, and will this notice cause a cancellation — where the optimal action depends on which risk dominates and where the two point to *opposite* interventions: a nudge that prevents failure also raises salience and may trigger cancellation. That is a genuine decision-theoretic problem with no threshold form, and it is the sharpest AI-necessity shape in the five ideas judged here.

**Deliberately not AI:** the notice content and timing (statutory — must be exactly right, must be templated, must be deterministic), the AFA threshold arithmetic, and eligibility rules for splitting/rescheduling.

## Razorpay role

Subscriptions + UPI Autopay + e-Mandate APIs. **Subscription/mandate failure is the only loss event genuinely manufacturable in a Razorpay sandbox** — settlements do not occur in test mode and dispute creation is unverified. This is the only one of the five whose loss event is real rather than authored.

## Competitors

Agent Studio **Subscription Recovery** (built with ElevenLabs) · UPI Autopay's *"intelligent retry mechanisms"* · **Renewal Shield (coming soon)** · the entire global dunning category. **Every one of them is at or after T=0.**

---

## Score table

| Dimension | Max | Score | Justification |
|---|---|---|---|
| Problem strength | 10 | **7** | Real, India-specific, regulator-created, dated. Docked 3 for an honest reason the pool file states itself: **the magnitude is unevidenced.** The corpus killed every available involuntary-churn number as vendor-grade D. You have a mechanism with a citation and no size. Pillar 1 asks *"did you pick something that actually matters"* — you can argue it matters, you cannot show how much. |
| Innovation | 10 | **8** | Occupying a regulator-manufactured pre-failure interval is the freshest framing in the non-T01 pool, and the competing-risks formulation is the only genuinely decision-theoretic construction among the five. The observation that the compliance artefact *is* the churn instrument is a real insight. |
| Originality | 8 | **6** | Dunning is the most-built category on earth and 24% of this field is in T03. The T−24h framing is new; the surrounding machinery is not. |
| Differentiation | 7 | **6** | A **timing** escape, and timing escapes are checkable in seconds against the incumbent's own product copy. Docked 1 because "Renewal Shield (coming soon)" means Razorpay has already named the window. You are early to a square they have publicly flagged, not one they have missed. |
| Real-world impact | 10 | **6** | Net retained value is a real line. Docked hard for a contradiction the pool file does not resolve: **the headline action may be illegal under the circular it cites.** RBI/DPSS/2026-27/396 requires AFA to *modify* a mandate. If "shift the debit date" is a mandate modification, the flagship intervention triggers the exact friction the system exists to avoid, and the viable action set shrinks to *pre-warm* and *do nothing*. This must be resolved before it is pitched. |
| Market opportunity | 7 | **5** | Indian subscriptions are growing and the regime is permanent. Crowded vendor category. |
| AI necessity | 8 | **6** | The competing-risks shape is genuine and hard. Docked 2 because **both** labels are fully synthetic: you author `P(fail)` *and* `P(cancel|notice)` and then measure a model against them. Unlike #8 there is no external anchor for either — no public dataset of Indian mandate failures, none of notice-induced cancellations. `FIELD_BAR.md` Opening 1 is the field-wide fatal flaw and this idea has no defence against it except the one it hasn't built. |
| Technical depth | 8 | **6** | Competing risks, a mandate state machine, a provably-deterministic statutory content generator. Legitimate depth, no artificial complexity. Not exceptional. |
| Feasibility | 5 | **5** | The only idea of the five with a sandbox-manufacturable loss event. Buildable end-to-end in the window. Best feasibility in the pool. |
| Demo power | 8 | **7** | The RBI circular on screen with *"at least 24 hours prior"* highlighted → a real pre-debit notice → a cancel click → *"the regulator made you send this; it is the best-timed churn prompt in the world and you are paying for it."* Then a mandate at T−24h with two competing probabilities and an action. Legible, dramatic, and the second-best demo of the five. |
| Wow factor | 5 | **4** | That one line survives the day. So does the moment where the system reports **cancellations it induced** as a first-class negative — no vendor has ever shown that number, and a judge notices. |
| UX / product quality | 3 | **3** | Obvious product, obvious screen, obvious recurring job. |
| Responsible AI / safety | 3 | **3** | Best safety posture of the five: no money moves without a gate, statutory content is deterministic and templated, the induced-cancellation cost is published rather than hidden, and the no-action subset's outcome is reported. This is what "would you trust it" looks like. |
| Hackathon competitiveness | 8 | **6** | Most crowded track (24%), but this is the one slice of it that is not retry-and-message. Sandbox-real evidence plus an honest downside metric puts it ahead of nearly all of that 24%. |
| **TOTAL** | **100** | **78** | |

### Razorpay Fit — scored separately: **78 / 100**

| Component | Score | Reasoning |
|---|---|---|
| Product-surface adjacency | 22/25 | Subscriptions, UPI Autopay and e-Mandate are first-class Razorpay surfaces and the demo runs on their sandbox. Highest of the five. |
| Do they feel the problem? | 20/25 | They ship Subscription Recovery and have announced Renewal Shield — they feel it and are actively building into it. That is fit **and** exposure: you are pitching the pre-release version of their roadmap to the people holding the roadmap. |
| Uncollided-ness | 20/25 | The timing escape is clean *today*. "Coming soon" is a countdown on it. |
| Pillar-3 (AI judgment) fit | 16/25 | Load-bearing AI in a genuinely hard shape, plus a strong deterministic boundary around statutory content. Held back by the fully-synthetic label problem. |

---

## Judge reaction

**First 10 seconds.** *"You're using the compliance notice as a signal."* Immediate comprehension and immediate approval. It is the only pitch of the five that lands completely in one sentence.

**First 60 seconds.** Problem, user, why-now (dated April 2026 regulation) and solution all clear. The one thing a sharp judge is already writing down: *"can you actually move the debit date without AFA?"*

**After the demo.** Remembered: the circular on screen, the cancel click, and the batch table that reports **cancellations the system caused**. That last one is the differentiator — it is the only honest-negative any judge will see that day.

**Deliberation (five judges, after seeing everything else).**

> **Subscriptions PM:** "This is the best T03 submission we've seen. It's also within one sprint of something we announced. Renewal Shield is reminders; this is prediction plus a bounded action. Different enough."
> **Compliance/legal:** "Rescheduling a debit is a mandate modification. That needs AFA. Half their action set may not exist. Did anybody ask them?"
> **Vulcan/ML lead:** "Competing risks is the right formulation and I'd hire someone who reached for it. But both outcome variables are theirs. It's a model trained on a story and evaluated against the same story. Same disease as everyone else, better-dressed."
> **Platform eng:** "They report the harm they caused. Nobody else in the building does that. That's the trust signal."
> **Hiring manager:** "Best demo of the non-agentic entries and the clearest thinker on cost asymmetry. The legal question is the one that decides it."
> **Consensus:** top of the T03 pile; one unresolved regulatory question is load-bearing on the score.

---

## Three-judge split

| | Score | Objections | Recommendation |
|---|---|---|---|
| **Judge A — Product/Business** | **80** | "Merchants will not let an agent unilaterally move billing dates — that changes the revenue recognition and the customer's expectation. Your realistic action set is *pre-warm* and *do nothing*, and 'do nothing' does not sell." | Advance. Make *pre-warm* the hero and reschedule the exception. |
| **Judge B — Senior Engineer** | **72** | "You authored both labels. Your AUC is a measure of your generator. And you cite RBI/DPSS/2026-27/396 for the notice requirement and then propose an action the same circular gates behind AFA — you have a citation you did not read to the end. That is *exactly* the SEP-#216 constraint-drift failure mode this corpus documents." | Advance conditionally. Read the circular's modification clause; publish the action-legality table before anything else. |
| **Judge C — Hackathon Judge** | **80** | "In a room of 60 recovery agents this is the one I remember. But the track has 24% of the field and the delta over the second-best T03 entry is narrower than the pitch implies." | Advance. Strongest of the five judged here. |

**Disagreement worth preserving:** B is 8 points below A and C on a specific, checkable factual question — is rescheduling a mandate modification? **That question is worth more than the eight points.** If the answer is yes and unfixable, real-world impact drops to 4 and the total lands near 74; if there is a compliant reschedule path, impact rises to 8 and the total is 80. Resolve it before iterating anything else.

---

## Strongest advantage

**It is the only idea of the five whose loss event is real.** Every other candidate here — VAMP disputes, four-way settlements, payables ageing — is measured against a fixture the applicant authored. Subscription failure is manufacturable in Razorpay test mode. Combined with a metric that publishes its own induced harm, this is the strongest *"would you trust it"* answer in the pool, and "would you trust it" is one of the three named gates inside pillar 2.

## Strongest weakness

**Both outcome labels are invented.** `P(fail)` and `P(cancel|notice)` are generator parameters wearing the costume of ground truth. `FIELD_BAR.md` verified this exact circularity in **every measured repo in the field** — and this idea's headline metric (net retained value) is a *difference of two authored quantities*, which is a strictly worse position than a single authored label because the sign of the result is a free parameter.

## FATAL RISK — what is the strongest reason this idea loses?

> **The flagship action is gated by the same circular the pitch cites.**

RBI/DPSS/2026-27/396 requires AFA to *modify* a mandate. If shifting a debit date is a modification, then the demo's scene 3 — "debit moved to the 3rd" — is either non-compliant or requires the customer to authenticate, which is the friction the entire system exists to avoid. A compliance-literate judge at an Indian PSP will spot this faster than any other flaw in this document, and it is fatal in a specific and humiliating way: **you will have been caught misreading the one primary source your whole pitch rests on.** That is the `THE_LEGAL_SPINE` SEP-#216 failure (₹15,000 asserted as a per-transaction limit when it is a monthly cap) repeated by the applicant, in front of the people who made it.

The lesser fatal risk: **"we announced Renewal Shield in Sprint 26."** The timing escape has a shelf life measured in their release cycle, not yours.

## Competitor saturation

**HIGH** — T03 is 24% of a 261-repo field and dunning is the most-built category in commerce software. Per §21, saturation is **not** grounds for rejection: the T−24h slice is genuinely differentiated within it, and differentiation inside a saturated space still counts. But the differentiation burden is correspondingly high.

## Verdict: **GO**

The strongest of the five judged here on both scales. **Weakest dimension to fix: real-world impact (6/10) — and it is fixable only by resolving the AFA/modification question.**

## Required improvements

1. **Before anything else:** read RBI/DPSS/2026-27/396 to the end and publish an **action-legality table** — for each of the five actions, the clause that permits it and the clause that constrains it. If reschedule and split are both AFA-gated, rebuild the action set around *pre-warm*, *downgrade-offer*, *notice-content variation* and *do nothing*, and say so on slide 1. This table is also the single best pillar-3 artefact this idea can produce.
2. **Build an external anchor for at least one of the two labels.** Public salary-cycle / balance-timing data, published NACH return-reason distributions, or NPCI's bank-wise BD composition as a prior on the insufficient-funds class. Without a real-data tier this is B1 and the panel will find it.
3. **Report the no-action subset as the headline, not the footnote.** "We touched 31 of 300 notices" is a stronger trust claim than any recovery number, and it is the natural answer to *"would you trust it."*
4. **Three baselines with stated parameters** — do-nothing, a *tuned* pre-warm-everything, and best trivial rule (`failed last cycle`). A straw-man baseline against a panel that ships Smart Retry is the fastest available way to lose.
5. **Publish the induced-cancellation count with a confidence interval and never in a smaller font than the recovery number.**
6. Fold #10 (The Fifteen Thousand Cliff) in as the AFA-boundary sub-case rather than a separate idea; it has no standalone strength.
