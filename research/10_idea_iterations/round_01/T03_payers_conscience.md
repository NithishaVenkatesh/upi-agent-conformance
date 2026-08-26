# T03 · Payer's Conscience — Section 43B(h) payables agent

**Idea ID:** `T03_payers_conscience` · **Pool ref:** `pool_demo_ai.md` #11 (see also `pool_measurement.md` #19, the creditor-side mirror)
**Judged:** 2026-08-26 · **Panel:** IdeaAgent (adversarial)

---

## One-line pitch

> Since 1 April 2024, paying a small supplier late costs the **buyer** its own tax deduction — so build the agent that sits on the payables side and tells a company which of its own invoices are about to become a tax event.

## Problem

₹7.34 lakh crore of MSME receivables sit frozen (*Delayed Payments Report 3.0*, GAME + FISME + C2FO, Mar 2024 — **publishers are two MSME-advocacy bodies and a working-capital lender; affiliation must be disclosed on any slide**). Every product built against that number chases the **creditor's** side: reminders, dunning, factoring, invoice discounting. Section 43B(h) (Finance Act 2023, effective 1 Apr 2024) moved the incentive to the **debtor's** side: if the supplier is Udyam-registered micro or small, the buyer must pay within 15 days absent a written agreement, or by the agreed date capped at 45 days (MSMED s.15), and **cannot claim the income-tax deduction until the MSME is actually paid**, plus compound interest at 3× the RBI bank rate.

The statutory remedy is broken in the direction that matters: MSME Samadhaan has disposed ~19.6% of applications and ~14.7% of disputed value `[INFERENCE]` — roughly one case in five. The problem must be solved upstream, on the payer's ledger.

## User

Finance controller at a mid-size Indian buyer with hundreds of suppliers — nominally the RazorpayX customer.

## Solution

Ingest the payables ledger + supplier master. Per invoice: (1) classify the supplier's MSME status from whatever the ledger actually contains (a name, sometimes a GSTIN, rarely a Udyam number, often nothing); (2) extract the agreed payment term from contract/PO free text; (3) compute the statutory clock **deterministically**; (4) rank the payment run by tax exposure per rupee paid; (5) emit a gated payment schedule and a disallowance forecast.

## AI role

- **Supplier identity resolution** across a payables ledger and the Udyam register with no shared key ("Sharma Ent." / "Sharma Enterprises Pvt Ltd" / "SHARMA ENT (VENDOR)"). Shape A.
- **Payment-term extraction** from unstructured contract text ("Net 45 from GRN" ≡ "45 days from receipt of goods" ≡ "payment within six weeks"). Shape B.

**Deliberately not AI:** the 15/45-day arithmetic, the 3× bank-rate interest, the disallowance computation, the payment gate. Tax arithmetic that is 99% right is worse than useless. This is the strongest `WHERE_WE_DID_NOT_USE_AI.md` row available in the whole pool because the **cost of the rule is legible**: ambiguous term language is escalated to a human rather than guessed.

## Razorpay role

RazorpayX Vendor Payments / payables ledger as the data surface; Payouts as the gated money action. **Needs no test-mode access at all** — fully synthetic.

## Competitors

- **Agent Studio:** none on this side. Receivables Agent is explicitly the *creditor's* agent.
- **In-field (261 repos):** effectively nobody. `Chinmay0608/razorpay-buildathon-receivables-chaser` is the creditor-side mirror, not this.
- **Outside the hackathon — the panel has not weighted this and should:** Tally, Zoho Books, ClearTax and every mid-tier Indian ERP shipped 43B(h) ageing reports during FY 2024-25. The *report* exists commercially. What does not exist is the entity-resolution layer that makes it work when the ledger has no Udyam number.

---

## Score table

| Dimension | Max | Score | Justification |
|---|---|---|---|
| Problem strength | 10 | **8** | Statute-backed, India-only, ₹7.34 lakh crore, named user. Docked 2 because the *pain is displaced in time*: the buyer feels 43B(h) at year-end tax filing via its auditor, not at the payment run — and the entity that feels it (the CFO) is not the entity that runs the ledger. "Serious problem" yes; "meaningful pain, felt now" is weaker than the number suggests. |
| Innovation | 10 | **7** | The principal-flip is a genuine insight and the best strategic observation in the non-T01 pool. But the *system* it produces is an accounts-payable feature — rank a payment run by a computed exposure. The insight is 9; the artefact is 5. |
| Originality | 8 | **6** | Zero in-field competition, which is rare. Docked because Indian accounting software already ships the deterministic half. |
| Differentiation | 7 | **6** | Escape axis E1 (different **principal**) is the only escape in the entire pool a judge cannot rebut with product knowledge. Razorpay's Receivables Agent chases *your* debtors; nothing agentises *your* payables. That is a structural fact about the shipped stack, not a quality claim. Docked 1 because Razorpay may have chosen the creditor side deliberately — their customer wants to be paid, not to pay earlier. |
| Real-world impact | 10 | **7** | Moves working capital and a real tax line. Docked because the system's recommended action is *"pay your suppliers sooner"*, which a cash-constrained controller can and will simply decline. The agent's authority is advisory over a decision the human has strong reasons to override. |
| Market opportunity | 7 | **5** | 6.4m MSMEs, structurally permanent. Docked because the buyer-side is contested by ERP/accounting incumbents who own the ledger. |
| AI necessity | 8 | **5** | **The weakest cell and the one that decides this idea.** The claim is entity resolution with no join key. But Indian payables masters frequently *do* carry GSTIN, and the Udyam register is keyed on PAN/GSTIN — where GSTIN is present the join is a deterministic lookup and the LLM is decorative. The AI is load-bearing only on the residual, and the residual size is unmeasured. This is structurally the same exposure as #16, and it has not been acknowledged. |
| Technical depth | 8 | **6** | Entity resolution + statutory date arithmetic with GRN/holiday edge cases + ranked scheduling under a cash constraint. Real, not artificial. Not deep. |
| Feasibility | 5 | **4** | Fully synthetic, no sandbox dependency, buildable in the window. Docked 1: the Udyam register is not bulk-downloadable, so the "real-data kill-gate" (`FIELD_BAR.md` §5 item 7) is hard to construct here — you would be resolving against a register you wrote. |
| Demo power | 8 | **5** | A 300-row ageing report is not a visual. "Watch entity resolution happen" is the least cinematic scene in the pool. The re-ranked payment run and the disallowance forecast are decent scenes 3 and 4, and the refusal-and-escalate beat is good. But this loses badly to #9 and #16 in the first 30 seconds. |
| Wow factor | 5 | **3** | One genuinely memorable line: *"before FY 2024-25 paying an MSME late was a working-capital decision; now it is a tax event."* That is the whole wow. |
| UX / product quality | 3 | **3** | This is a product, not an experiment. It has a buyer, a screen, and a recurring job. |
| Responsible AI / safety | 3 | **3** | Deterministic tax math, gated payouts, explicit refusal-and-escalate path, false-positive cost named (wrongly classifying a supplier as micro/small destroys working capital via unnecessary early payment). Exemplary. |
| Hackathon competitiveness | 8 | **5** | Uncrowded ground and the cleanest escape argument. Held down by weak demo power and an attackable AI-necessity case in a competition whose pillar 3 is *specifically* about AI judgment. |
| **TOTAL** | **100** | **73** | |

### Razorpay Fit — scored separately: **74 / 100**

| Component | Score | Reasoning |
|---|---|---|
| Product-surface adjacency | 18/25 | RazorpayX Vendor Payments + Payouts is the right home. But it is a *feature request* against a product they already run, not a gap in their platform thinking. |
| Do they feel the problem? | 20/25 | Razorpay's own PR (RazorpayX AI Agents, 2026-06-01) quotes **"₹8.1 trillion locked in delayed payments to MSMEs"** — they picked this number themselves, so they visibly feel the problem. **But they answered it with a receivables agent.** That is evidence they have already considered this space and chosen the other side. A judge may read the payer-side pitch as "you took the side that doesn't pay us." |
| Uncollided-ness | 22/25 | Best in the five. No shipped agent has the payer as principal. |
| Pillar-3 (AI judgment) fit | 14/25 | The `WHERE_WE_DID_NOT_USE_AI.md` is superb; the where-we-*did* is thin and depends on an unmeasured residual. |

---

## Judge reaction

**First 10 seconds.** *"Wait — you're building for the buyer?"* Genuine head-turn. Every other T03 submission in the room is a chaser. This one is the only thing pointed the other way, and that registers instantly.

**First 60 seconds.** Problem clear. User clear. Why-now clear and dated (1 Apr 2024, statute, no citation needed). Solution clear. **The one thing not clear at 60 seconds: why an LLM.** A judge who does Indian accounts payable will be composing the GSTIN objection while you are still on slide 2.

**After the demo.** Remembered: the sentence about the tax event, and the moment the system *refused* to resolve a supplier name and escalated. Not remembered: any number, because the headline number belongs to advocacy publishers and you will (correctly) have hedged it on the slide. That hedge is the right call and it costs you the punch.

**Deliberation (five judges, after seeing everything else).**

> **Payments PM:** "This is the only submission all day that wasn't a version of something we ship. That counts."
> **Vulcan/ML lead:** "It also barely uses a model. The entity-resolution story is real *if* the ledger has no GSTIN. Did they measure how often it doesn't? No. So they don't know how big their own AI is."
> **RazorpayX PM:** "We looked at 43B(h). We built the receivables agent instead, on purpose — our customer is the one who wants money in. Building the payer-side tool is building the thing that tells our customer to part with cash sooner."
> **Platform eng:** "The tax arithmetic being a pure function with property tests and no model near it is the best pillar-3 answer I've read today. That table is worth more than the model."
> **Hiring manager:** "I'd interview them. The reasoning about *whose agent this is* is the kind of thinking the role description asks for. Whether the build is a top-5 build is a different question."
> **Consensus:** strongest *thinking*, mid-pack *artefact*. Advances on problem taste; does not win on AI judgment.

---

## Three-judge split

| | Score | Objections | Recommendation |
|---|---|---|---|
| **Judge A — Product/Business** | **76** | "Who signs the cheque for this? The controller's incentive is to delay payment; you are selling them a reason to accelerate it. That's a compliance sale, and compliance sales are made to auditors, not to ops." | Ship it, but reframe the buyer as the *tax function*, and make the disallowance forecast the hero, not the payment schedule. |
| **Judge B — Senior Engineer** | **66** | "Show me the residual. What fraction of your synthetic payables rows have a GSTIN? If it's 80%, your model handles 20% and your headline is a SQL join. Also: your Udyam register is one you invented, so your entity-resolution ground truth is your own generator — that is exactly the B1 tautology `FIELD_BAR` catalogues in every repo it measured." | Measure the no-key residual on day 1. Find a real Udyam-format sample as a kill-gate or drop the entity-resolution claim to a supporting role. |
| **Judge C — Hackathon Judge** | **74** | "Against a strong field, this wins the 'nobody else did this' point and loses the 'show me the moment' point. The demo has no five-second visual." | Advance. Fix the demo or borrow #16's four-files opening. |

**Disagreement worth preserving:** A and C are ~10 points above B. B is the only one who ran the attack. **On this panel's own methodology, B is right and the aggregate is generous.** The 73 already reflects B's discount; do not average it away.

---

## Strongest advantage

**A different principal.** Not a different quality, timing, scope or measurement — a different *party to the transaction*. Of the five escape axes in `pool_demo_ai.md` §1, E1 is the only one a Razorpay judge cannot rebut with information the applicant does not have. Everything else in this file is negotiable; this is not.

## Strongest weakness

**The AI is load-bearing on an unmeasured residual, and the residual may be small.** Identical in structure to #16's admitted flaw — and unlike #16, this file never admits it. Pillar 3 is *"the right tool in the right place"*; an entity resolver deployed where a GSTIN join already exists is the wrong tool in the wrong place, and the judge who owns vendor payments will know it.

## FATAL RISK — what is the strongest reason this idea loses?

> **A judge asks: "what percentage of your payables rows already carry a GSTIN, and what does the deterministic join get you on those?" — and there is no number.**

If the answer is high, this collapses to *"an accounting report with a language model bolted onto the tail"*, which fails pillar 3 by construction and is also a product Tally already ships. The second-order version is worse: the Udyam register you resolve against is one you generated, so even the residual's accuracy is measured against your own fixture. That is the exact failure `FIELD_BAR.md` Opening 1 finds in **every measured repo in the field**, and this idea walks into it while claiming entity resolution as its crux.

Secondary risk, lower probability but unanswerable if it lands: **RazorpayX may have deliberately declined the payer side** because it tells their customer to part with cash. The pitch then reads as strategically naive to the one person in the room who owns that roadmap.

## Competitor saturation

**LOW** (in-field: effectively zero; Agent Studio: zero) · **MODERATE** once Indian accounting software is counted, which the corpus does not do and should.

## Verdict: **GO**

Worth another iteration. **Weakest dimension to fix: AI necessity (5/8).**

## Required improvements

1. **Day-1, before any build:** generate a realistic payables master and measure the **no-join-key residual**. If GSTIN presence >80%, the entity-resolution thesis is dead and this must be re-pitched on the *payment-term extraction* axis (unstructured contract text has no deterministic path at all) or abandoned.
2. **Find one real Udyam record format** — a screenshot, a published certificate layout, a public sample — and build a kill-gate tier against it before any synthetic evaluation runs. Without this, the crux metric is self-graded.
3. **Fix the demo's first ten seconds.** Do not open on an ageing report. Open on a tax computation with a disallowed line item and a rupee figure.
4. **Add the adversarial baseline hunt** to the classification metric: `LIKE '%name%'`, exact-GSTIN join, and a depth-1 stump. Publish the table even when the trivial rule wins — *especially* then.
5. **Answer the roadmap objection explicitly in the README**, in one paragraph: why the payer-side agent is a Razorpay opportunity rather than a Razorpay conflict.
6. Reframe the primary user from controller → tax/compliance function, per Judge A.
