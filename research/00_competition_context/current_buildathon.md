# Razorpay AI Buildathon — Competition Context (Source of Truth)

| Field | Value |
|---|---|
| Source URL | https://razorpay.com/buildathon/ |
| Retrieved | 2026-08-26 |
| Retrieval method | Direct HTTP GET (curl, Chrome UA), HTTP 200, 55,357 bytes |
| Raw snapshot | `raw/razorpay_buildathon_2026-08-26.html` / `.txt` |
| Application form | https://forms.gle/d9r2gvxp8cmoZhon9 → `https://docs.google.com/forms/d/e/1FAIpQLScJ9XSqVCB2oaPwEMH0Zk3I1OpILFW1WpWdWweQ2950jdRzlg/viewform` |
| Form snapshot | `raw/application_form_structure.json` |
| Evidence class | **FACT** — all quotations below are verbatim from the live page |

---

## 0. THE SINGLE MOST IMPORTANT REFRAME

> **This is not a prize hackathon. It is a hiring funnel.**

Page title: *"Razorpay AI Buildathon — Build. Show. Get hired."*

Verbatim: *"Think you can build real AI? Prove it. **A student-only program to discover and hire our next generation of AI Builder Interns.**"*

Verbatim: *"No resume screening. No long application. Four steps: pick a track, build something real, show your work (a public repo, a 5 minute pitch video, the architecture), and **if it has signal we call you in**."*

**Strategic consequences (INFERENCE, high confidence):**

1. There is **no 1st/2nd/3rd place**. There is a **bar** and a **signal threshold**. The phrase used on every track is literally *"The bar:"*. The objective function is *clear the bar convincingly*, not *out-rank N teams*.
2. The evaluator is **a hiring panel**, not a sponsor-booth judge. Verbatim: *"Shortlisted builders go straight to a panel."* Panels evaluate **the builder**, using the project as the artifact. Therefore the *"Build Challenges & Technical Obstacles"* form field is not filler — it is an interview question asked in advance.
3. Verbatim: *"Your code speaks louder than your resume."* → **repo quality is a first-class deliverable**, not a supporting document. This is the opposite of a typical hackathon where the demo dominates and the repo is never opened.
4. Selection is likely **non-rivalrous within a track** — Razorpay hires N interns, so multiple people doing the same track can all be hired. **Saturation of an idea matters far less than it would in a ranked hackathon.** What matters is whether *this individual* demonstrably cleared the bar.
5. Submission is **individual** (form collects Full Name, College Name, Graduation Year — no team fields).

---

## 1. THE OFFER

Verbatim: *"₹75,000 (monthly stipend) · 6 or 12 (months, your choice) · In-person (Bangalore, from September). Shortlisted builders go straight to a panel. No aptitude test. No group discussion."*

- Stipend: ₹75,000/month
- Duration: 6 or 12 months (candidate's choice)
- Location: In-person, Bangalore
- Start: September
- Process after shortlist: direct panel. No aptitude test, no GD.

## 2. ELIGIBILITY

- Verbatim: *"Students only."*
- Form field `Graduation Year` is a **closed dropdown**: **2027, 2028, 2029 only.** → graduating 2026 or earlier is ineligible; this is a hard gate.
- Form field: *"In-person Internship availability starting September"* — Yes/No, **required**. Answering "No" is presumed disqualifying.
- Form field: *"Preferred Internship Duration"* — 6-Month / 12-Month.

## 3. SUBMISSION REQUIREMENTS (from the live application form — authoritative)

The form is titled **"Razorpay AI Builder - Registration Form"** and has 14 items across 3 sections (Internship Details, Track Selection). Required fields:

| # | Field | Type | Notes |
|---|---|---|---|
| 1 | Full Name | short text | required |
| 2 | College Name | short text | required |
| 3 | Graduation Year | dropdown | 2027 / 2028 / 2029 |
| 4 | In-person availability from September | radio | Yes / No |
| 5 | Preferred Internship Duration | radio | 6-Month / 12-Month |
| 6 | **Selected Track** | dropdown | one of the 5 tracks; **one track only** |
| 7 | **Project Name / Title** | short text | required |
| 8 | **Project Objectives** | paragraph | prompt: *"What does it solve?"* |
| 9 | **GitHub Repository URL** | short text | must be **public** |
| 10 | **5-min Pitch Video Link** | short text | hard 5-minute format |
| 11 | **Build Challenges & Technical Obstacles** | paragraph | prompt: *"What issues did you face while building, and how did you solve them?"* |
| 12 | **Final Submission Confirmation** | checkbox | *"I confirm that this is my official final project submission. I understand that **no further changes or edits can be made after submitting**."* |

**Hard constraints derived (FACT):**
- **One shot.** No edits after submit. Do not submit early.
- **One track.** Cannot hedge across tracks.
- Public repo is mandatory and is explicitly named on the landing page as part of "show your work."
- Landing page names a third artifact the form does not have its own field for: **"the architecture."** → architecture documentation must live **inside the repo** (e.g. `ARCHITECTURE.md` + diagram).

**Deadline: EVIDENCE NOT FOUND.** No date appears on the landing page or the form. Internship starts September; today is 2026-08-26. This implies an **imminent or already-passing deadline** and is the single highest-priority open question. See `OPEN_QUESTIONS.md`.

## 4. THE TRACKS — VERBATIM

### Track 01 — AI Growth & Agentic Commerce
- **Goal:** *"Grow the merchant's revenue, and make them sellable to AI buyers."*
- **Task:** *"Build an agent that grows revenue for a merchant on Razorpay test-mode APIs, or that makes a merchant transactable by an AI buyer end to end."*
- **Why now:** *"NPCI's UAP and the global protocol race (ACP, AP2, x402) make agent-to-agent commerce the open problem of the year, and Razorpay's in-app pilots are already live."*
- **Example directions:** *"Conversational in-app checkout, Agent-readable catalog, Upsell & cross-sell agent, Campaign orchestrator."*
- **The bar:** *"Every money action explainable, bounded and gated. Show the audit trail and one failure handled gracefully."*

### Track 02 — AI Risk Manager
- **Goal:** *"Stop the merchant losing money to fraud, returns and chargebacks."*
- **Task:** *"Build a working detector, verifier or auto-responder for one class of loss, with measured precision and recall on a held-out test set."*
- **Why now:** *"AI-enabled fraud is hitting Indian BFSI while returns and chargebacks quietly eat margin. This track surfaces the risk and ML minded builders the others miss."*
- **Example directions:** *"Chargeback evidence responder, Return-risk scorer, Fraud-spike detector, Abuse-ring sentinel."*
- **The bar:** *"Honest metrics including false-positive cost. Strictly defense-only: anything offense-capable is disqualified."*

### Track 03 — AI Revenue Recovery
- **Goal:** *"Find revenue that's slipping away and win it back."*
- **Task:** *"Build an agent that detects revenue at risk, determines the right intervention, and executes a bounded recovery workflow: from payment failures and checkout abandonment to overdue receivables."*
- **Why now:** *"Revenue loss rarely happens in one clean step. A payment degrades, a checkout gets abandoned, a subscription fails, or an invoice goes overdue. AI can now close the loop from detecting the problem to diagnosing it, choosing the right intervention, and recovering the money."*
- **Example directions:** *"Payment degradation → root cause → recovery action, Checkout drop-off recovery, Failed-subscription recovery, B2B receivables chaser, Mandate retry sequencer, Hinglish voice recovery, Promise-to-pay tracker."*
- **The bar:** *"Don't just identify the problem. Show measured money recovered across a batch, with compliant escalation, stopping rules, and an audit trail."*

### Track 04 — AI Finance Controller
- **Goal:** *"Run the books and the cash position."*
- **Task:** *"Build an agent that closes one finance-ops loop across a 50+ record batch of synthetic data, reporting its match rate and the exceptions it could not resolve."*
- **Why now:** *"The 2026 builder consensus: verification capacity, not generation speed, is the bottleneck. Reconciliation, settlement and forecasting are still done by hand."*
- **Example directions:** *"Multi-source reconciliation, Settlement Q&A agent, Forward cash forecaster, Tax-line matcher."*
- **The bar:** *"Throughput plus measured accuracy plus an honest exception list. One cherry-picked match proves nothing."*

### Track 05 — Open Track
- **Goal:** *"Build what you believe should exist."*
- **Task:** *"Have an idea that doesn't fit the tracks above? Build it. Pick a real problem, use AI meaningfully, and show us something that works. Any domain, workflow, or user is fair game."*
- **Why now:** *"The best ideas don't always fit a predefined category. This track exists for builders who see an opportunity we didn't."*
- **Example directions:** *"Surprise us, Solve a problem you deeply understand, Build something we haven't thought of."*
- **The bar:** *"Open doesn't mean easier. Show a real problem, a working product, meaningful use of AI, and evidence that it creates value. The same bar for execution, reliability, and depth applies here."*

---

## 5. DISQUALIFICATION CONDITIONS

Only **one explicit disqualifier** appears anywhere on the page (FACT):

> Track 02: *"Strictly defense-only: **anything offense-capable is disqualified**."*

Implicit gates (INFERENCE): non-public repo; graduation year outside 2027–2029; unavailable in-person in Bangalore from September; video materially over 5 minutes.

No other rules, terms, code of conduct, or FAQ page exists. The landing page + form constitute the entire published ruleset. (Verified: page contains only one external link — the form — plus JS/font assets.)

---

## 6. DECODING "THE BAR" — WHAT IS ACTUALLY BEING TESTED

The five bars are not five different rubrics. Reading them together, **the same four demands recur** (INFERENCE, high confidence — this is the most load-bearing analysis in this document):

| Demand | T01 | T02 | T03 | T04 | T05 |
|---|---|---|---|---|---|
| **Measured, honest numbers over a batch** | — | "measured precision and recall on a **held-out test set**" | "**measured** money recovered **across a batch**" | "throughput plus measured accuracy", "**50+ record batch**", "One cherry-picked match proves nothing" | "evidence that it creates value" |
| **Admit what you got wrong** | "one failure handled gracefully" | "**honest** metrics including **false-positive cost**" | "stopping rules" | "an **honest exception list**" | — |
| **Bounded / gated autonomy** | "explainable, bounded and gated" | defense-only | "**compliant escalation, stopping rules**" | — | "reliability" |
| **Auditability** | "**show the audit trail**" | — | "**an audit trail**" | "exception list" | "execution, reliability, and depth" |

**Synthesis — the thing Razorpay is actually screening for:**

> They are screening for builders who can make an AI system **trustworthy enough to touch money**: one that reports its own error rate honestly, refuses to act when uncertain, stays inside bounds, and leaves a record of why it did what it did.

This is a **verification-capacity** thesis, stated outright in Track 04's why-now: *"The 2026 builder consensus: verification capacity, not generation speed, is the bottleneck."*

**The dominant anti-pattern to avoid:** a slick demo with one happy-path transaction and no error bars. Three of five bars explicitly pre-empt exactly this ("one cherry-picked match proves nothing", "don't just identify the problem", "honest metrics including false-positive cost").

## 7. NAMED TECHNICAL SIGNALS (to be pursued in Phase 1)

The page names specific technologies unprompted — these are direct evidence of what Razorpay engineering is currently thinking about:

- **NPCI UAP** (Unified Agentic Protocol / NPCI's agentic payments layer)
- **ACP** (Agentic Commerce Protocol — OpenAI/Stripe)
- **AP2** (Agent Payments Protocol — Google)
- **x402** (Coinbase HTTP 402 payments protocol)
- **Razorpay test-mode APIs** (explicitly the sanctioned build surface for Track 01)
- *"Razorpay's in-app pilots are already live"* — agentic commerce is a shipping product line, not a research topic.

## 8. CHANGE LOG

| Date | Change |
|---|---|
| 2026-08-26 | Initial capture. Baseline snapshot stored in `raw/`. |
