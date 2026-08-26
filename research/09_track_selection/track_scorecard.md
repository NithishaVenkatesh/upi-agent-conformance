# Track Scorecard

**Status: PROVISIONAL.** Two gating inputs outstanding: the forensic pass on competitor repos (`05_agentarch/FIELD_BAR.md`) and Indian delegated-payment rails (`01_razorpay_signals/india_rails_delegated_payments.md`). Cells depending on them are ⏳.

Scoring: Razorpay alignment /20 · Evidence from winning projects /15 · Market pain /20 · Business impact /15 · AI leverage /10 · Engineering depth /10 · Measurability /5 · Demo potential /5 = **/100**.

Per §21 of the brief, **saturation is NOT scored negatively.** It is recorded as context.

---

## Two standing adjustments, applied uniformly

> ### ⚠️ METHODOLOGICAL CORRECTION (2026-08-26)
>
> Adjustment (A) below was **applied at track level to an idea-level phenomenon**, and that is wrong. It was identified by the counter-case agent, which was briefed specifically to defeat Track 01 and instead found this.
>
> Collision is a property of an *idea*, not a *track*. Razorpay's RTO Shield collides ~1.0 with an RTO-risk scorer and only ~0.1 with a payer-side Section 43B(h) agent. A uniform −4 punishes the escaping ideas alongside the colliding ones, and would have caused us to under-rate the best non-T01 idea in the pool.
>
> **Therefore: the −4 below is retained only as a description of the *median* idea in each track. It must NOT be applied to a specific idea.** Per-idea collision is assessed by IdeaAgent against five escape axes: different **principal**, different **quality**, different **timing**, different **scope**, different **measurement**. The strongest escape found is *different principal* — Razorpay's Receivables Agent is the creditor's agent, and there is no payer's agent anywhere in the shipped stack.

**(A) The Agent Studio collision (median-idea adjustment only — see correction above).** Razorpay ships in production an Agent Studio containing Dispute Responder, RTO Shield, Subscription Recovery, Abandoned Cart Conversion, Settlement Insights and Cashflow Forecaster — mapping near one-to-one onto the example directions for **T02, T03, T04**. Building the obvious thing there demos a student version of the judges' own product against an invisible production baseline. → **−4 Business impact for T02/T03/T04.**

**(B) The field has converged.** The 41-competition corpus and the 261-repo live census both show deterministic-first/LLM-on-the-residual, held-out precision-recall, and explicit refusal/escalation are **table stakes**. → compresses *Evidence from winners* for all tracks: the pattern library gives us the floor, not an edge.

---

## T01 — AI Growth & Agentic Commerce

| Dimension | Score | Basis |
|---|---|---|
| Razorpay alignment | **20**/20 | Strongest in the corpus, and it strengthened twice during research. (i) Razorpay has **six PRs** into the ACP repo adding UPI — five open, none merged, stalled since 2026-05-15 for want of a TSC sponsor; authors `himanshu-rzp` and `jating06` are **#1 and #5 committers on `razorpay/razorpay-mcp-server`**. (ii) Razorpay is absent from **every** agentic-checkout list: not an ACP partner, not in UCP's co-developed *or* endorsed lists (**Flipkart is**), and not among OpenAI's six supported checkout PSPs (Stripe, PayPal, Adyen, Checkout.com, Fiserv, Worldpay). Their own MCP server isn't even in the MCP registry. This is a company visibly trying and failing to get in — which is exactly why the track's why-now names four protocols. |
| Evidence from winners | 9/15 | Real transferable prior art (`planbound` spend envelopes, `HumanMandate` caps+revocation+step-up, `Hourglass` revocable recurring delegation, `x402r-sdk` refunds/disputes as primitives, `Glassbox402` independent receipt log). But prior art raises the floor as much as it informs. |
| Market pain | ⏳ | **Gating.** Hinges on whether India has a *live* delegated rail or only an announced one. |
| Business impact | **15**/15 | Exempt from adjustment (A) — Razorpay has *not* solved this and is publicly stuck. India is 80%+ UPI; ACP delegate-payment is **card-only**; Stripe SPT covers *"the US, Canada and select European countries"* with India unnamed. |
| AI leverage | ⏳ | **The real risk.** A protocol bridge can be excellent engineering with a decorative LLM — which fails rubric pillar 3 ("the right tool in the right place, and where you chose not to use one") outright. Must be resolved before committing. |
| Engineering depth | 9/10 | Normative idempotency (ACP §5: null-vs-absent, array ordering, 409/422 semantics), RFC 9421 signing, 11-state machine, MCP **URL-mode elicitation** (the spec-blessed payment handoff: *"Servers MUST use URL mode"* for payment credentials), webhook HMAC verification. Depth without artificial complexity. |
| Measurability | ⏳ | **Gating.** Needs a credible batch metric over 50+ cases. |
| Demo potential | 5/5 | "Watch an agent buy from an Indian merchant — then watch it get stopped when it shouldn't." Legible in seconds. |
| **Provisional** | **~58 + ⏳(40)** | Highest ceiling, highest unresolved risk. |

Saturation (context): **6% — thinnest by ~4×.** Under-entered because it demands real test-mode integration *plus* protocol work, where T02/T03 reduce to tabular ML on synthetic CSVs.

## T02 — AI Risk Manager · **~71**

| Dimension | Score | Basis |
|---|---|---|
| Razorpay alignment | 14/20 | Genuine — but **Vulcan**, their transformer payments foundation model built with NVIDIA and AWS, already does fraud detection in production. |
| Evidence from winners | 12/15 | Richest transferable corpus. |
| Market pain | 16/20 | Card & internet fraud = **66.8% of India's bank-reported fraud cases (7,756) but only 7.2% of value (₹252 cr)** — RBI *Trend & Progress 2024-25*. High-frequency/low-value → automation-shaped. NRF: **$849.9bn returned in 2025, 19.3% of online sales, 9% fraudulent.** Weakness: **no trustworthy India RTO rate exists** — vendor estimates span 20–40% and prepaid estimates differ **7×**. |
| Business impact | 11−4 = **7**/15 | Adjustment (A): RTO Shield and Dispute Responder already ship. |
| AI leverage | 7/10 | Strong ML case, weaker *LLM* case. Much of the value is gradient boosting — fine, and pillar 3 rewards saying so, but it caps the ceiling. |
| Engineering depth | 7/10 | Well-trodden; hard to look deep. |
| Measurability | **5**/5 | Best of any track — the bar literally specifies precision/recall on a held-out set with false-positive cost. |
| Demo potential | 3/5 | Confusion matrices don't move a room. |

⚠️ Carries the **only explicit disqualifier on the site**: *"Strictly defense-only: anything offense-capable is disqualified."* Saturation: 15%.

## T03 — AI Revenue Recovery · **~78**

| Dimension | Score | Basis |
|---|---|---|
| Razorpay alignment | 15/20 | Core business — but Subscription Recovery and Abandoned Cart Conversion already ship. |
| Evidence from winners | 11/15 | Good corpus; also where 24% of the field sits. |
| Market pain | **19**/20 | **Best-evidenced problem in the entire corpus.** All 10 publicly-visible banks in NPCI's July 2026 remitter data breach OC-149's **5% business-decline target; 5 exceed 10%; Airtel Payments Bank at 26.97% BD** (Dataful #445, source NPCI). *Business* decline — not technical decline — is the unsolved part. Plus **₹7.34 lakh crore of MSME receivables frozen** (GAME+FISME+C2FO, Mar 2024) and **70.22% cart abandonment** (Baymard, 50-study meta-analysis). |
| Business impact | 14−4 = **10**/15 | Adjustment (A). |
| AI leverage | 8/10 | Root-cause diagnosis over failure codes is genuinely LLM-shaped. |
| Engineering depth | 7/10 | Heavily trodden by the field. |
| Measurability | 4/5 | Measurable, but needs a defensible **counterfactual**. Most of the field will report gross recovery with no baseline — exactly the cherry-pick the bar warns against. |
| Demo potential | 4/5 | Before/after with a rupee figure. |

Saturation: **24% — most-entered.** Per §21 this doesn't cut the score; it raises the differentiation burden.

## T04 — AI Finance Controller · **~71**

| Dimension | Score | Basis |
|---|---|---|
| Razorpay alignment | 13/20 | Settlement Insights and Cashflow Forecaster already ship. |
| Evidence from winners | 12/15 | Strongest single blueprint: `invoice-agent-x12-starter` (10/10) — EDI ingest → rule validation → anomaly scoring → ERP post with **dry-run** + HITL approval. |
| Market pain | 15/20 | Real but harder to quantify credibly; several candidate statistics were killed as unverifiable. |
| Business impact | 12−4 = **8**/15 | Adjustment (A). |
| AI leverage | **6**/10 | **Weakest AI case.** Reconciliation is largely deterministic matching — which pillar 3 would *reward* admitting, but which leaves little for AI to do. |
| Engineering depth | 8/10 | Batch pipelines, matching strategies, exception handling. |
| Measurability | **5**/5 | The bar names it: 50+ records, match rate, honest exception list. |
| Demo potential | 4/5 | Four unjoinable files reconciling themselves is the most *visually* legible problem of the five. |

Saturation: 10%.

## T05 — Open Track — dominated

Not scored; it is a container. Verbatim: *"Open doesn't mean easier… The same bar for execution, reliability, and depth applies here."*

`INFERENCE:` Open **forfeits the largest scoring component — Razorpay alignment — while inheriting an identical bar.** Correct only if the best idea genuinely fits no track. Given T01's breadth (*"**or** that makes a merchant transactable by an AI buyer end to end"*), almost nothing plausible fails to fit.

---

## Standing

| Track | Total | Shape |
|---|---|---|
| T03 Revenue Recovery | ~78 | Best evidence · most crowded · collides with shipped product |
| T02 Risk Manager | ~71 | Safest floor · lowest ceiling · only disqualifier |
| T04 Finance Controller | ~71 | Most measurable · weakest AI necessity |
| **T01 Agentic Commerce** | **~58 + ⏳40** | **Highest ceiling · thinnest field · uniquely uncollided** |
| T05 Open | — | Dominated |

## The decision reduces to one question

> Does India have a **live** delegated-payment rail with documented limits an agent can be bounded against — and can a T01 build produce an **honest batch metric** with **load-bearing** (not decorative) AI?
>
> - **Yes** → T01 wins clearly: the only track that is not a re-demo of a shipped Razorpay product, the thinnest field, and mapped onto an internal effort Razorpay is publicly blocked on.
> - **No** → the ceiling collapses; T03 wins on evidence, differentiated by a **credible counterfactual baseline** — the thing the crowded field will almost universally skip.

## The shape of the gap, if T01 survives

Cross-tabulating ACP × MCP × x402 × UCP × Web Bot Auth, the unoccupied ground is narrow and specific:

- **Web Bot Auth** answers *which agent* and **explicitly refuses** *on whose behalf*: *"does not authenticate human users… does not define authorization or delegation."*
- **ACP `Allowance`** expresses only one merchant × one session × one currency × max amount × expiry, **single-use** — no recurring, multi-merchant, per-period, MCC, or velocity limits.
- **MCP** has **no payment primitive** (SEP-2007 died for lack of a sponsor — the same failure mode as Razorpay's SEPs) and human approval is **SHOULD, unenforced**, with tool annotations explicitly *"untrusted"*.
- **UCP** is shipping and MCP-native — **and Razorpay is not in it.**

> **"On whose behalf, and within what bounds, on Indian rails"** is the unoccupied intersection. Notably, it is close to a restatement of T01's own bar: *"Every money action explainable, bounded and gated. Show the audit trail and one failure handled gracefully."*

## The counter-case, argued and resolved

An agent was briefed to build the strongest possible case for Tracks 02/03/04 and to attack Track 01. It generated 20 ideas across those tracks and concluded:

> **"No, my tracks do not beat Track 01 — but the scorecard's reasoning needs one correction."**

Its surviving argument for T01, which is stronger than anything in my own reasoning:

> **Problem taste is a graded pillar, and Razorpay is not a neutral judge of what "matters."** T01 is the only track that maps onto something they are *visibly stuck on* — six ACP PRs, five open, stalled since 2026-05-15 — plus a finding a judge can reproduce in ten seconds. No T02/T03/T04 idea can buy that. ₹7.34 lakh crore of frozen MSME receivables is not small, but **the judge does not feel it as an open wound.**

Its honest counter, which stands: **T01 carries 40 unresolved points**, two of which are *AI leverage* and *measurability* — the risk that the highest-ceiling track fails rubric pillar 3 by construction. The recommended non-T01 ideas carry neither risk.

**Agreed fallback ordering if either T01 gate fails:** build **Payer's Conscience** (buyer-side 43B(h) payables agent), *not* a generic T03 recovery agent. It is the only idea whose escape is a **different principal** rather than a different quality/timing/scope; it is backed by statute needing no citation; it needs zero test-mode access; and its crux — entity resolution between a payables ledger and the Udyam register — is unambiguously not `if/else` + SQL.

**One falsifiable test that would change the ordering:** measure the Tier-1/Tier-2 deterministic residual for four-way reconciliation on day 2. **>90% deterministic → T04 is dead as an option. <70% → it becomes a real contender and this ordering is wrong.**

## Method caveats
- Scores are calibrated judgement, not measurement. The ordering and reasoning matter more than the ±3.
- **Adjustment (A) is the most contestable choice here.** It reads "business impact" as impact *to Razorpay*. Read instead as impact *to merchants*, T02/T03/T04 each regain 4 and **T03 leads outright at ~82**. This must be stress-tested by IdeaAgent, not treated as settled.
