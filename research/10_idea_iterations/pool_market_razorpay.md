# Idea Pool — Market-First and Razorpay-First Entry Points

**Agent:** IdeaGenerator · **Entry points:** market-first, Razorpay-first · **Focus:** Track 01 (AI Growth & Agentic Commerce) + Track 05 (Open)
**Generated:** 2026-08-26 · **Deadline:** 5 Sep 2026 (10 days) · **Builder:** one student, individual, one track

> **This file does not score.** It generates range. Some ideas here are deliberately too ambitious and some deliberately too plain, because the scoring pass needs calibration spread. IdeaAgent narrows.

## Citation key

| Tag | File |
|---|---|
| `[RUBRIC]` | `research/00_competition_context/THE_REAL_RUBRIC.md` |
| `[GAP]` | `research/07_razorpay_winning_intersection/THE_GAP.md` |
| `[HOLE]` | `research/07_razorpay_winning_intersection/THE_UPI_HOLE.md` |
| `[SPINE]` | `research/07_razorpay_winning_intersection/THE_LEGAL_SPINE.md` |
| `[BAR]` | `research/05_agentarch/FIELD_BAR.md` |
| `[ARYAN]` | `research/05_agentarch/ARYAN_direct_competitor.md` |
| `[MKT]` | `research/08_market/market_problems.md` |
| `[TRACK]` | `research/09_track_selection/track_scorecard.md` |

Anything not traceable to one of these is marked **`HYPOTHESIS — unevidenced`**.

## Standing constraints applied to every idea below

- Buildable by one student in ~8 days.
- Demonstrable on synthetic or Razorpay **test-mode** data.
- Must report an **honest batch metric over 50+ cases** — with an adversarial baseline, effective `n`, and an attrition ledger `[BAR Openings 1/2/5]`.
- AI must be **load-bearing**, and the submission must document where AI was deliberately *not* used `[RUBRIC §2, pillar 3]`.
- Money actions bounded, gated, audit-trailed.
- **Delegation API is not public** — zero hits for `tsp`/`delegat`/`cryptogram`/`agentic` across all 2,282 Razorpay doc URLs `[SPINE §5]`. Every idea touching delegation **must stub and declare**.
- Demo cart **< ₹5,000/txn**, ₹15,000/month envelope, ≤5 delegates, domestic P2M only `[SPINE §8]`.

---

# PART A — RAZORPAY-FIRST
*Start from a structural advantage nobody else has: sitting on the rail, being the regional PSP, being the KYC/dispute-rate authority, owning the mandate primitive.*

---

## A1 · `in.razorpay.upi` — the UPI payment handler UCP is waiting for

**Pitch.** Publish and prove a spec-conformant UCP payment handler that lets an AI agent pay an Indian merchant with UPI, plus the conformance harness that decides whether a handler declaration is honest.

**Problem.** Four major Indian D2C brands (zouk.co.in, bombayshavingcompany.com, boat-lifestyle.com, mamaearth.in) serve live UCP `2026-04-08` profiles advertising exactly two payment handlers — `com.google.pay` and `dev.shopify.card` — and **not one accepts UPI**; even the Google Pay handler is `"type": "CARD"` `[HOLE]`. An AI agent shopping at an Indian brand for an Indian customer can pay by Visa/Mastercard/Amex/Discover/Diners and nothing else.

**Target user.** Indian D2C merchants accepting agent traffic; and the PSP that wants to be the rail underneath it.

**Why it matters.** India is 80%+ UPI, $2.6T annually, 600M+ users with no ACP-native in-chat payment path — Razorpay's own words in their stalled PRs `[HOLE]`. ACP's `delegate_payment` supports *"exactly one credential type: card"*; Stripe SPT covers the US, Canada and select European countries with India unnamed `[HOLE]`. Razorpay's six PRs adding UPI to ACP have been stalled since 2026-05-15 for want of a TSC sponsor `[TRACK T01]`. **But UCP explicitly invites a regional PSP to publish a payment handler with no committee approval** `[HOLE]` — the exact inverse of the door Razorpay is stuck outside.

**Solution.** (a) A `in.razorpay.upi` handler declaration conforming to `ucp.dev/specification/payment-handler-guide`; (b) a reference merchant serving it at `/.well-known/ucp`; (c) a buyer agent that discovers it and completes a UPI payment in Razorpay test mode; (d) **a conformance harness** that fetches any merchant's UCP profile and checks the handler declaration against both the published guide *and* the NPCI/RBI ceilings that authorise it.

**AI role.** LLM does buyer-side goal decomposition, handler selection under ambiguity, and natural-language explanation of a conformance failure. **Deliberately NOT AI:** handler schema validation, amount arithmetic (integer paise), signature verification, limit enforcement, and the pass/fail conformance verdict — all deterministic, and enforced by an AST test that fails the build on any model import inside the money path `[BAR capability 1]`.

**Razorpay role.** Test-mode order creation + UPI payment; the handler is *named for and specified by* Razorpay as the regional PSP; RTB/KYC as the merchant-side trust input.

**Key workflow.** discover `/.well-known/ucp` → parse handlers → select `in.razorpay.upi` → build cart → **URL-mode elicitation human checkpoint** → Razorpay order → UPI test payment → signed receipt → append-only ledger.

**Batch metric.** Over **≥60 synthetic UCP merchant profiles** (4 real + 56 mutated: missing fields, wrong version, over-limit `max_amount`, absent `keys[]`, malformed handler config): **conformance-verdict precision/recall against a hand-labelled ground truth**, with a depth-1..3 decision-stump adversarial baseline published alongside `[BAR Opening 1]`, effective `n` and an attrition ledger `N_in → N_parsed → N_scored`.

**Technical depth.** UCP profile parsing, MCP-native endpoints, RFC 9421 signing, integer-paise money, URL-mode elicitation, NPCI ceiling encoding.

**Demo.** Side-by-side: agent buys from a real Indian merchant profile → **card only, no UPI**. Then the same agent against our handler → UPI pays. Then a mutated profile → refused, with the refusal code and the circular clause that produced it.

**Differentiation.** The catalogue-legibility genre is *solved* — Shopify auto-generates UCP profiles, `llms.txt` and MCP endpoints, and ≥20 sell-side Buildathon repos exist `[HOLE]`. **Payment is not solved.** This is the one lane where being Indian and being a PSP is the whole advantage.

**Competitors.** `Adarsh-Me/Agent-Audit` (the only serious sell-side repo; its committed evidence is a deterministic mock with a rerun delta of exactly zero) `[BAR Opening 3]`; `aryanpajnee/RazorpayBuildathon` (mandate layer, not handler layer) `[ARYAN]`.

**Tracks.** Primary **T01** · Secondary T05.

---

## A2 · Merchant Attestation Service — filling the empty `keys[]` slot

**Pitch.** Mint Razorpay's existing merchant-trust verdict as a signed, agent-queryable attestation into the `keys[]` slot UCP already defines and that 0 of 4 live Indian merchants populate.

**Problem.** Everything in the field verifies **the agent** — Visa TAP, Mastercard Agent Pay, Forter, ACP, AP2. **Nothing verifies the merchant to the agent**, and ACP forbids it by design (`MUST NOT` return `merchant_id`) `[HOLE]`. Razorpay already computes that verdict from KYC and dispute rate — and renders it as **an icon a human clicks**: *"You can validate that a business is a Razorpay Trusted Business by clicking on the RTB icon"* `[HOLE]`. A human-clickable badge is useless to an agent.

**Target user.** Buyer agents deciding whether a discovered merchant is safe to transact with; merchants who want agent traffic to convert.

**Why it matters.** `keys[]` — the slot UCP defines for merchant attestation — is **unpopulated on all four verified live Indian merchants** `[HOLE]`. The Track 01 research agent initially called merchant trust *"the most crowded space of all"*, then overturned itself: the crowded direction is agent→merchant; **merchant→agent is near-empty** `[HOLE]`.

**Solution.** An attestation issuer that takes merchant signals (KYC status, dispute rate, settlement history, chargeback ratio, account age — synthetic/test-mode), produces a bounded, expiring, revocable signed claim, publishes it into `keys[]`, and ships a verifier an agent runs before committing money. Includes revocation and freshness semantics.

**AI role.** LLM adjudicates *unstructured* merchant signals a rules engine cannot join — policy-page text, refund-policy plausibility, catalogue/legal-entity consistency — and produces a graded rationale. **Deliberately NOT AI:** the numeric dispute-rate threshold, KYC boolean, signature generation/verification, expiry checks, and the final issue/deny gate. AI produces *evidence*; a deterministic rule produces the *verdict*.

**Razorpay role.** This is the **only** contribution in the pool that literally only a PSP can make: Razorpay is already the authority on a merchant's KYC and dispute rate. The idea is "publish what you already know, in a format a machine can consume."

**Key workflow.** merchant signals → evidence extraction → deterministic scoring → sign → publish to `keys[]` → agent fetches → verifies → proceeds or refuses with a code.

**Batch metric.** Over **≥100 synthetic merchants** with planted ground-truth risk labels (independent of the features, to defeat label leakage): attestation **precision/recall + a cost-weighted FP/FN table** (FP = agent transacts with a bad merchant; FN = a good merchant loses agent revenue). Ablation: delete each signal, re-report `[BAR Opening 6]`. Adversarial baseline: does `dispute_rate > x` alone match the whole stack?

**Technical depth.** Signed claim format, key rotation, revocation lists, freshness windows, verifier hardened in both directions (a verifier that always returns `True` must fail the test) `[BAR capability 9]`.

**Demo.** Agent about to pay a plausible-looking storefront → attestation missing → refuses. Then a revoked attestation → refuses with a different code. Then valid → pays. Then RTB icon on screen: "this verdict already exists — it just isn't machine-readable."

**Differentiation.** Inverts the field's direction of travel. Nothing observed verifies the merchant.

**Competitors.** None found in the corpus on the merchant→agent direction `[HOLE]`.

**Tracks.** Primary **T01** · Secondary T05.

---

## A3 · The Constraint Layer — eight authority types on a three-field rail

**Pitch.** A deterministic constraint engine that expresses allowed-payees, category, velocity, per-txn-vs-cumulative, purpose binding and decrement-on-refund on top of UPI Reserve Pay, which natively expresses only an amount, a cadence label and a date.

**Problem.** The entire spend authority expressible on Razorpay's official agent surface is three fields — `max_amount`, `frequency`, `expire_at` `[GAP §3]`. Verified absent across all 43 MCP tools and the token schema: allowed payees, MCC scoping, velocity, per-transaction-vs-cumulative distinction, decrement-on-refund, purpose binding, conditional rules, and **any way to ask how much of a mandate is left** `[GAP §3]`. AP2 specifies eight constraint types verbatim; ACP is worse — `Allowance.reason` has exactly one legal value, `one_time` `[GAP §3]`.

**Target user.** Anyone letting an agent spend on their behalf; the PSP that must underwrite it.

**Why it matters.** *"India has a live delegated-payment rail (UPI Reserve Pay, OC 228) and an official agent interface to it (Razorpay MCP), but the authority you can express across that interface is an amount, a cadence label, and a date — which is not enough to safely let an agent spend money on your behalf"* `[GAP §3]`. **This is a gap between two things Razorpay already operates in production**, not a gap in a draft spec. Also: NPCI has **no MCC/category scoping anywhere in the corpus** `[SPINE §1]`, so category limits *must* be implemented above the rail `[SPINE §8]`.

**Solution.** A constraint compiler + enforcement gate: eight constraint types, each with a distinct refusal code, evaluated deterministically before any money call, with a hash-chained ledger and a `remaining_authority` inspection endpoint the rail does not provide.

**AI role.** Translate a natural-language spend policy ("₹3,000 a month for groceries, only from shops I've bought from before, never electronics") into a candidate constraint set — **then a deterministic validator accepts or rejects the compilation, and the human confirms**. AI never evaluates a constraint at runtime. **Deliberately NOT AI:** every runtime authorisation decision, all money arithmetic, refund decrement, velocity counting, ledger hashing.

**Razorpay role.** `create_order` with the `single_block_multiple_debit` token block; `fetch_tokens`; `revoke_token` `[GAP §2]`. **Declared stub:** delegation/TSP is not a public surface `[SPINE §5]`.

**Key workflow.** policy text → compile → human confirm → mandate created → each agent spend passes the gate → refusal or debit → ledger append → `remaining_authority` query.

**Batch metric.** **≥200 synthetic spend attempts** across a constraint suite: **authorisation decision accuracy vs a hand-written oracle, with refusals counted as first-class outcomes** and per-constraint-type breakdown. Plus an **ablation**: delete each constraint type, re-measure — and *keep the rows where nothing moves* `[BAR Opening 6]`. Plus an NL→constraint compilation accuracy figure with its own held-out set.

**Technical depth.** Constraint algebra, refund-aware budget accounting, hash-chained ledger, per-code refusal taxonomy, idempotency across process races.

**Demo.** Agent tries six purchases against one mandate: passes, then blocked by payee, then by category, then by velocity, then refund restores budget and the previously-blocked purchase now passes.

**Differentiation.** ⚠️ **The mandate layer is occupied.** `aryanpajnee/RazorpayBuildathon` does signed bounded mandates competently with 153 real tests and a structurally-enforced no-LLM money path `[ARYAN]`. **Do not claim novelty of the thesis** `[ARYAN]`. The available edge is that they have **no batch metric, no held-out set, no baseline, no ablation** `[ARYAN]`, and the whole field's measurement targets are compromised `[BAR Opening 1]`. Differentiate on measurement, not concept.

**Competitors.** `aryanpajnee/RazorpayBuildathon` — direct, one day of work as of 2026-08-25, assume finished `[ARYAN]`.

**Tracks.** Primary **T01** · Secondary T05.

---

## A4 · Circular — a conformance harness that checks constraints against the regulation authorising them

**Pitch.** A validator that reads a declared spend-constraint block and checks every number in it against the actual NPCI circular or RBI direction that authorises it — the mechanism whose absence let a 3× error sit unchallenged in a public standards body for four months.

**Problem.** Razorpay's own ACP SEP #216 states *"NPCI's UPI Circle specification imposes a hard **per-transaction** limit"* of ₹15,000. **₹15,000 is the monthly cap; per-transaction is ₹5,000 — the claim is wrong by 3×** `[SPINE §4]`. The same document claims the mandate carries *"merchant category restrictions"* — **no MCC or category scoping exists anywhere in the NPCI corpus** `[SPINE §4]`. It contradicts itself in a later table, and both its cited references are dead (`razorpay.com/docs/payments/upi-circle` → HTTP 404, verified, both variants) `[SPINE §4]`.

**Target user.** Anyone shipping a delegated-payment integration in India; standards contributors; compliance reviewers.

**Why it matters.** *"A constraint claim written by the PSP with the most UPI expertise in the world, submitted into a public standards body, reviewed by Stripe and Meta, drifted 3× from the circular that authorises it — and nothing caught it, for four months"* `[SPINE §4]`. **The error is not the finding; the absence of any mechanism that would catch it is the finding** `[SPINE §4]`.

⚠️ **Framing discipline, from the corpus:** ❌ not as a gotcha — naming an individual's error to a panel that may include him is a bad trade. ✅ as the product argument `[SPINE §4]`.

**Solution.** A machine-readable encoding of the Indian delegated-payment ceiling set (OC-201 ₹5,000/txn, ₹15,000/month, 5 delegates; OC-201A KYC-OVD exclusion of AI agents; OC-201B CUG/P2M-only/explicit-user-action; RBI AFA ₹15,000 and the dynamic-factor requirement; first-24h ₹2,000 conservative side of the documented conflict) — each rule carrying a citation — plus a linter that runs over any constraint declaration, spec PR, or mandate JSON.

**AI role.** Extract candidate normative rules from circular text (NPCI circulars are **scanned images** — `pdftotext` returns nothing, they must be read as page images `[SPINE header]`), and flag internal inconsistency in prose declarations. **Deliberately NOT AI:** the rule table itself is hand-verified and frozen; every numeric comparison is deterministic; the LLM never decides compliance, only surfaces candidates for human confirmation. Provenance for every rule is a human-checked citation.

**Razorpay role.** The rule set is Razorpay's operating envelope; the linter runs against Razorpay MCP `create_order` token blocks and against ACP/UCP/AP2 declarations.

**Key workflow.** ingest declaration → normalise units (paise! ₹15,000 vs 1500000) → match rule → verdict + citation → diff report.

**Batch metric.** **≥80 constraint declarations** (real: the six Razorpay ACP PRs, four live UCP profiles, MCP token schema; synthetic: 60+ mutants with planted violations): **violation-detection precision/recall with the false-positive cost stated**, plus a per-rule breakdown, plus an honest list of declarations the linter could not adjudicate.

**Technical depth.** Unit normalisation (the classic paise/rupee and per-txn/per-month conflations), citation provenance chain, OCR-sourced rule extraction with human gate, internal-consistency checking.

**Demo.** Feed it a real public spec document. It emits: `PER_TXN_LIMIT_MISMATCH — declared ₹15,000, OC-201 authorises ₹5,000 per transaction (₹15,000 is the monthly cap)` and `UNSUPPORTED_CONSTRAINT — MCC scoping is not authorised by any circular in the corpus`.

**Differentiation.** Razorpay's rubric rewards *verification*, not generation — *"verification capacity, not generation speed, is the bottleneck"*. This is a pure verification artifact. Nothing in the field does it.

**Competitors.** None found.

**Tracks.** Primary **T01** · Secondary T05.

---

## A5 · Elicit — the URL-mode human checkpoint the spec already mandates

**Pitch.** Replace the model-brokered OTP with the only payment mechanism MCP normatively specifies, and measure what it costs and what it saves.

**Problem.** Razorpay's official MCP server instructs the model: `response["next_tool"] = "submit_otp"`, `"otp_string": "{OTP_CODE_FROM_USER}"` `[GAP §4]`. **The LLM is in the loop for the Additional Factor of Authentication step — the step RBI mandates specifically to ensure a human authorised the debit** `[GAP §4]`. Meanwhile the only RFC-2119 payment sentence in the entire MCP spec says servers **MUST NOT** use form-mode elicitation for payment credentials and **MUST** use URL mode — **and nothing in the Indian agent surface uses it** `[GAP §4]`.

**Target user.** Anyone building an agent that pays on Indian rails.

**Why it matters.** Four independent sources converge on the same design: NPCI OC-201B (*"debit transactions using IoT shall be only initiated by explicit user action"*), RBI Authentication Directions 2025 (a factor *"dynamically created … unique to that transaction"*, in force 1 Apr 2026, non-compliance shifting full liability to the issuer), the MCP spec's URL-mode MUST, and RBI FREE-AI/MeitY human-in-the-loop `[SPINE §3]`. **The per-purchase human trigger is not a limitation to engineer around. In India it is legally mandatory — and MCP already specifies the mechanism** `[SPINE §3]`. An agent holding a static credential **cannot lawfully pay in India** `[SPINE §2]`.

**Solution.** A reference MCP payment server that uses URL-mode elicitation as the authorisation checkpoint: the model receives an opaque handle, never a credential; the human completes the factor out-of-band; the server binds the resulting authorisation to a specific cart hash and a specific amount, single-use, time-boxed. Plus a **credential-leakage detector** that scans agent transcripts for the failure mode.

**AI role.** The agent composes the cart and explains what is about to be charged in plain language. **Deliberately NOT AI — and this is the whole point:** the model is *structurally excluded* from touching the authentication factor at all. This is the sharpest possible answer to rubric pillar 3, *"where you chose not to use one"* `[RUBRIC §2]`, because the exclusion is enforced by protocol design, not by intent.

**Razorpay role.** Razorpay MCP is the concrete before-case; Razorpay test-mode payments are the after-case.

**Key workflow.** agent → `create_order` → server returns URL-mode elicitation bound to `cart_hash` + amount → human authorises → server debits → receipt → ledger.

**Batch metric.** **≥100 simulated purchase flows** across three arms — (a) model-brokered OTP, (b) URL-mode elicitation, (c) no checkpoint — measuring **credential-exposure rate (how often a secret enters the model's context), unauthorised-debit rate under an injected prompt-injection suite, and added latency/abandonment cost of the checkpoint**. Report the cost honestly, not just the benefit.

**Technical depth.** MCP elicitation modes, cart-hash binding, single-use nonces, prompt-injection test corpus, transcript scanning.

**Demo.** Injected instruction tells the agent to forward the OTP. Arm (a): it does. Arm (b): there is nothing to forward — the model never held it.

**Differentiation.** ⚠️ Must be framed **defensively**, as a design observation about an open-source tool that argues for *more* human-checkpointing. **Do not frame as an exploit against the OTP flow** `[GAP §6]`.

**Competitors.** None found using URL-mode elicitation on Indian rails `[GAP §4]`.

**Tracks.** Primary **T01** · Secondary T05.

---

## A6 · Remaining — the mandate balance primitive that does not exist

**Pitch.** A refund-aware, velocity-aware authority ledger that answers the one question no Razorpay tool answers: how much of this mandate is left?

**Problem.** Verified absent from all 43 tools: **"Inspect remaining balance of a block"** — *"No tool answers 'how much of this mandate is left?'"* — and **decrement-on-refund**: *"No rule for restoring budget when money comes back"* `[GAP §3]`.

**Target user.** The human who granted the mandate; the agent that must decide whether to attempt a purchase; the merchant deciding whether to hold stock.

**Why it matters.** An agent that cannot query remaining authority must either attempt-and-fail (burning a decline, and India already runs 12.52% volume-weighted business decline across the ten publicly-visible banks `[MKT #1]`) or maintain its own shadow accounting, which drifts. The refund case is worse: money comes back and nobody knows whether the budget did.

**Solution.** A double-entry authority ledger sitting beside the token: every debit reserves, every settlement commits, every refund releases, every expiry sweeps. Exposes `remaining(mandate_id)` with a reconciliation proof against the PG's own payment/refund records.

**AI role.** Classify ambiguous inbound events (partial refund vs price adjustment vs chargeback reversal vs duplicate webhook) where the payload does not determine the answer. **Deliberately NOT AI:** all balance arithmetic, all reservation/commit/release transitions, all reconciliation. Deterministic double-entry, integer paise, with an invariant test that total reserved + available + spent is constant.

**Razorpay role.** `fetch_all_payments`, `fetch_all_refunds`, `fetch_multiple_refunds_for_payment`, `fetch_tokens`, webhooks `[GAP §1]`. The reconciliation source of truth is Razorpay's own records.

**Key workflow.** mandate → reserve → debit → webhook → commit → refund → release → `remaining()` query → nightly reconcile.

**Batch metric.** **≥300 synthetic event streams** including out-of-order webhooks, duplicates, partial refunds, and chargebacks: **balance-reconciliation match rate against ground truth, with a full exception list of unreconciled cases and their reasons** `[BAR Opening 5]`. Report `N_in → N_matched → N_exception`.

**Technical depth.** Double-entry accounting, idempotent webhook processing, out-of-order tolerance, invariant testing.

**Demo.** A mandate drains to zero, a refund arrives, and the same purchase that was refused ten seconds ago now succeeds — with the ledger shown live.

**Differentiation.** Small, unglamorous, and provably missing. Reconciliation is the field's most-legible demo genre `[MKT #6]` but nobody has applied it to *authority* rather than to *money*.

**Competitors.** None found.

**Tracks.** Primary **T01** · Secondary T05.

---

## A7 · Cross-Merchant Agent Reputation — the view only the rail has

**Pitch.** Score an inbound agent's legitimacy using the one signal no single merchant possesses: its behaviour across every merchant on the same PSP.

**Problem.** Every fraud heuristic fires the wrong way on a legitimate agent — representment and fraud scoring rest on human-presence signals (IP, device fingerprint, AVS, session behaviour, prior history) and an agent transaction breaks **all of them simultaneously**: data-centre IP, no browsing session, no behavioural history `[MKT #13]`. And it cuts both ways: agentic traffic looks like fraud, and fraud can hide inside agentic traffic `[MKT #13]`.

**Target user.** Merchants receiving agent traffic; the PSP underwriting them.

**Why it matters.** Existing engines are *designed* to reject exactly this signature `[MKT #13]`. Web Bot Auth explicitly refuses to help — *"does not authenticate human users… does not define authorization or delegation"* — it answers *which agent*, not *for whom* `[GAP §5]`. Meanwhile card & internet fraud is **66.8% of India's bank-reported fraud cases but only 7.2% of value** (RBI *Trend & Progress 2024-25*) — high-frequency, low-value, automation-shaped `[MKT #5]`.

**Razorpay role.** **This is the structural advantage.** A single merchant sees one agent once. The PSP sees the same agent key across hundreds of merchants, with settlement outcomes, refund rates and dispute outcomes attached. Nobody else can compute this.

**Solution.** An agent-identity reputation service keyed on signed agent identity (Web Bot Auth signature agent + mandate key), aggregating cross-merchant outcome history, emitting a bounded score plus a refusal/step-up recommendation, with per-merchant privacy boundaries respected (aggregate outcomes, not merchant-identifying detail).

**AI role.** Sequence modelling over cross-merchant agent behaviour to detect coordinated patterns a per-merchant rule cannot see; natural-language rationale for a human reviewer. **Deliberately NOT AI:** the block/allow threshold, the privacy filter, and any signature verification.

**Batch metric.** **≥500 synthetic agent sessions** (legit agents, human traffic, fraudulent agents, fraud hiding behind a legit agent identity) with labels planted *independently of the features*: **precision/recall with an explicit cost matrix** (FP = a legitimate agent purchase blocked; FN = fraud admitted), plus a per-merchant-only baseline to prove the cross-merchant view is load-bearing — **the ablation is the entire argument** `[BAR Opening 6]`.

**Demo.** A conventional human-presence fraud engine blocks a legitimate agent. Ours passes it — and simultaneously catches a fraudulent one that the conventional engine waved through because it mimicked human signals.

**Differentiation.** T02-adjacent, so ⚠️ it collides with **Vulcan**, Razorpay's production payments foundation model doing fraud detection with NVIDIA and AWS `[TRACK T02]`. Must be pitched on the *cross-merchant agent-identity* axis specifically, not on "AI fraud detection".

**Risk.** ⚠️ T02 carries the only explicit disqualifier on the site — *"Strictly defense-only: anything offense-capable is disqualified"* `[TRACK T02]`. The synthetic-fraud generator must be handled carefully.

**Tracks.** Primary **T01** · Secondary T02.

---

## A8 · Agent Decline Intelligence — the failure codes only the rail sees

**Pitch.** A pre-attempt rail chooser for agent purchases that predicts *business* decline from context and picks the instrument before the attempt, rather than reporting failure after it.

**Problem.** All **10** publicly-visible banks in NPCI's July 2026 bank-wise remitter data exceed OC-149's 5% business-decline target; 5 exceed 10%; Airtel Payments Bank sits at **72.56% approved / 26.97% BD**; volume-weighted across those ten it is **12.52% BD vs 0.39% TD** (Dataful #445, source field NPCI) `[MKT #1]`. Banks optimised technical decline to ~0.8% because NPCI measured it; **business decline was left to the customer** `[MKT #1]`.

**Target user.** Merchants; agents that must decide whether to attempt now or wait.

**Why it matters.** For a human, a business decline is a retry and mild annoyance. **For an agent it is a hard stop with no recovery path** — there is no human present to switch instruments, and under RBI Authentication Directions 2025 the agent cannot silently re-attempt with a different static credential `[SPINE §2]`. Nothing sits between *"insufficient funds / wrong PIN / limit exceeded"* and an abandoned cart `[MKT #1]`.

**Razorpay role.** Razorpay sees decline reason codes across banks, instruments, times of day and ticket sizes. Decline reason codes are reproducible in Razorpay test mode, and NPCI bank-wise BD/TD is public and can seed a simulator `[MKT #1]`.

**AI role.** Ranking instruments/rails conditioned on context (bank, hour, ticket size, prior attempts, mandate headroom) — *"a ranking problem, not a rules problem"* `[MKT #1]`. **Deliberately NOT AI:** the ceiling checks (₹5,000/txn, monthly envelope, AFA ₹15,000), the retry-timing rule, and any money movement.

**Batch metric.** **≥1,000 simulated payment attempts** seeded from public NPCI bank-wise BD/TD: **decline-avoidance rate vs three baselines — do-nothing, a *tuned* naive retry rule, and the best trivial one-feature rule** `[BAR Opening 2]`. ⚠️ Razorpay ships Smart Retry; a straw-man retry baseline is the fastest way to lose credibility with this specific panel `[BAR Opening 2]`.

**Demo.** 200 agent purchases, side by side. Baseline: N declines, agent stalls. Ours: routed pre-attempt, decline count drops, and the cases where it *didn't help* are shown too.

**Differentiation.** The evidence is the best in the corpus. The risk is saturation — T03 holds 24% of the field `[TRACK T03]`. Reframing it as *agent* decline (no human to recover) is the differentiator.

**Competitors.** Razorpay's own Smart Retry and Subscription Recovery ship in production `[RUBRIC §6]`.

**Tracks.** Primary **T01** (agent framing) · Secondary T03.

---

## A9 · Handler Registry — a directory of who can actually take an agent's money in India

**Pitch.** Continuously audit every discoverable Indian merchant's agentic-checkout profile and publish the payment-capability gap as a live, reproducible dataset.

**Problem.** The UPI hole is currently a four-merchant anecdote `[HOLE]`. It is almost certainly a pattern, but nobody has measured it at scale.

**Target user.** Razorpay strategy; merchants; the standards bodies Razorpay is blocked outside of.

**Why it matters.** The claim *"four live Indian merchants expose agentic checkout that cannot take UPI"* is reproducible by a judge in ten seconds `[HOLE]`. Scaled to hundreds of merchants with an honest denominator, it becomes the single most citable fact in the Indian agentic-commerce conversation — and it is *exactly* the evidence Razorpay's stalled ACP PRs needed `[HOLE]`.

**Solution.** A crawler over Indian D2C domains fetching `/.well-known/ucp`, `llms.txt`, ACP endpoints and MCP manifests; a deterministic classifier of declared payment capability; a published dataset + dashboard with full attrition accounting.

**AI role.** Only where the surface is unstructured — inferring capability from prose docs or non-conforming profiles. **Deliberately NOT AI:** every JSON-declared handler is parsed deterministically. This is a strong pillar-3 story: *most of this system has no model in it, on purpose, because the data is already structured.*

**Batch metric.** **≥300 domains attempted**: coverage table `N_attempted → N_reachable → N_with_profile → N_classified`, with **every drop reason named** `[BAR Opening 5]`; UPI-acceptance rate with a confidence interval; classifier accuracy against a hand-labelled subsample of 50.

**Demo.** The dashboard, plus a live `curl` of one merchant on screen so the judge can reproduce it.

**Differentiation.** ⚠️ **This is deliberately one of the "too plain" ideas.** Agent-readiness auditing is *an established OSS genre dating to April 2026* and ≥20 sell-side Buildathon repos exist; **catalogue legibility is solved** `[HOLE]`. It survives only if the *payment-capability* axis is the measured thing — which is the unsolved part.

**Competitors.** `Adarsh-Me/Agent-Audit` and the whole audit genre `[BAR Opening 3]`.

**Tracks.** Primary **T01** · Secondary T05.

---

## A10 · Protocol Bridge — one merchant surface, four incompatible agent protocols

**Pitch.** A normalisation layer that accepts ACP, UCP, AP2 and x402 authority objects and reduces them to one internally-enforced authority model, so a merchant integrates once.

**Problem.** AP2 (Google, 17 Sep 2025), ACP (OpenAI+Stripe, Sep 2025), Mastercard Agent Pay (29 Apr 2025) and Visa TAP all use different identity models and different token semantics, and **no normalisation layer exists** `[MKT #18]`.

**Target user.** Merchants; aggregators.

**Why it matters.** *"An aggregator absorbing this on the merchant's behalf is structurally the right place for it"* `[MKT #18]` — and an aggregator is precisely what Razorpay is. Also: the four protocols express wildly different authority. ACP's `Allowance` is one merchant × one session × one currency × max amount × expiry, single-use; AP2 has eight constraint types; Razorpay MCP has three fields `[GAP §3, §5]`. **Normalising them means deciding what happens when a protocol expresses less authority than the rail requires** — that is the interesting part.

**Solution.** Adapters + a canonical authority object + a *lossiness report* that states, per protocol, exactly which constraints could not be represented and what the safe default is.

**AI role.** Semantic mapping of unfamiliar/extension fields between protocols, proposed with confidence and human-gated. **Deliberately NOT AI:** the canonical model, all enforcement, and any default that widens authority (defaults may only ever narrow).

**Razorpay role.** Aggregator position; Razorpay MCP as one of the adapters and the settlement rail underneath all of them.

**Batch metric.** **≥120 authority objects** across four protocols: **round-trip fidelity rate and, more importantly, the lossiness table** — for each protocol pair, which constraints survive. Plus a safety metric: **zero authority-widening translations across the whole batch** (a hard gate, and a failure is a headline finding, not a bug to hide).

**Demo.** The same purchase attempt arrives as ACP, then as AP2, then as UCP. One gate, three refusal codes, one ledger.

**Differentiation.** Engineering depth is high (ACP §5 normative idempotency: null-vs-absent, array ordering, 409/422 semantics; RFC 9421 signing) `[TRACK T01]`. ⚠️ **Risk named explicitly in the corpus:** *"A protocol bridge can be excellent engineering with a decorative LLM — which fails rubric pillar 3 outright"* `[TRACK T01]`. The AI must be load-bearing or this idea is dead.

**Competitors.** None found.

**Tracks.** Primary **T01** · Secondary T05.

---

## A11 · Refusal Explainer — treating "no" as a first-class product surface

**Pitch.** When an agent's purchase is refused, produce a machine-readable and human-readable explanation good enough that the agent can decide what to do next and the human can decide whether the rule was right.

**Problem.** Refusals are the *normal* outcome in a legally-bounded agent system — ₹5,000/txn, ₹15,000/month, 5 delegates, CUG pilot, domestic P2M only, explicit user action per debit `[SPINE §3]`. But the field hides them: nobody counts refusals as first-class outcomes, and the corpus's own recommendation is that a defensible system must count *"refusals as first-class outcomes rather than hidden"* `[GAP §7]`.

**Target user.** Agents; the humans who granted authority; merchant support.

**Why it matters.** `[BAR Opening 5]` — the field's headline denominators quietly exclude what the pipeline dropped: Adarsh-Me's 640 attempted / 234 parse_ok (36.6%) disclosed only in a docs file, not the README. A system whose refusals are legible is the direct inverse of that failure mode.

**Solution.** Structured refusal codes with a citation to the authorising rule, a suggested remediation (raise the limit? wait for the monthly reset? use a different instrument?), a counterfactual (*"this would have passed if the cart were ₹340 lower"*), and an appeal path to a human.

**AI role.** Generate the human-readable narrative and the remediation suggestion from the structured refusal. **Deliberately NOT AI:** the refusal decision itself, the code, and the counterfactual computation (which is arithmetic over the constraint set, not inference).

**Razorpay role.** Refusal taxonomy grounded in Razorpay's actual error surface plus the NPCI/RBI ceiling set.

**Batch metric.** **≥150 refused attempts**: **remediation-correctness rate** (does following the suggestion actually make the attempt pass? — verifiable by re-running it) and **counterfactual exactness** (deterministic, therefore reported as exact with no confidence interval — the tfthushaar move: *"running a CI over a provably-correct computation is conceptually wrong"* `[BAR Opening 4]`).

**Demo.** Six refusals, six distinct codes, one of them followed to a successful re-attempt.

**Differentiation.** Small and modest on its own — best as a component of A3/A5. Included as a deliberately narrow-scope idea.

**Competitors.** `aryanpajnee`'s gate-spec has 7 checks and 14 refusal codes — but as a specification, not code `[ARYAN]`.

**Tracks.** Primary **T01** · Secondary T05.

---

## A12 · Agent Dispute Adjudicator — accountability as document comparison

**Pitch.** When an agent purchase goes wrong, decide who is accountable by mechanically comparing the signed intent mandate, the signed cart mandate, and what actually settled.

**Problem.** AP2's own announcement names three open problems verbatim: proving the user gave *specific* authority; the merchant knowing the request reflects *true intent*; and **determining accountability when it goes wrong** `[MKT #12]`. *"As of 2026, no government has enacted agentic commerce regulation that specifically addresses who is liable when an AI agent makes a purchase autonomously"* `[MKT #14, grade C, UNVERIFIED FETCH — attribute carefully]`.

**Target user.** Merchants (who bear CNP disputes presumptively `[MKT #14, INFERENCE]`), agent operators, the PSP.

**Why it matters.** `[MKT #14, INFERENCE]` agent-initiated disputes flow into the merchant's ordinary dispute ratio — **including the count-based VAMP ratio**, where Visa's Excessive Merchant threshold moved from ≥220bps to ≥150bps on 1 Apr 2026 and *"Programs for Brazil, Chile, and India will be announced later"* `[MKT #10, grade A]`. **An agent misreading an instruction at scale becomes a compliance-threshold event, not just refunds.** And *"nothing exists on the merchant side to accept, validate, enforce or retain a mandate"* `[MKT #12]`.

**Solution.** A retained-mandate store + an adjudication engine: intent mandate vs cart mandate vs settled transaction vs delivery evidence, producing a structured accountability verdict (user authorised / agent exceeded / merchant substituted / rail failed) with the evidence bundle attached.

**AI role.** Judge *semantic* conformance where structure cannot: did "buy me running shoes under ₹4,000" authorise *these* shoes? That is genuine judgment and not expressible as a rule. **Deliberately NOT AI:** signature verification, amount/limit comparison, timestamp ordering, hash matching, and the final verdict when the structured comparison is decisive — the model is only consulted on the residual.

**Razorpay role.** Razorpay is the party that holds the settlement truth and the dispute record; adjudication belongs where both the mandate and the money are visible.

**Batch metric.** **≥100 synthetic disputes** with planted ground-truth accountability, deliberately including cases where the structured comparison is decisive and cases where it is not: **accountability-verdict accuracy overall, and separately on the LLM-only residual** — because the interesting number is whether the model earns its place. Adversarial baseline: what accuracy does "always blame the agent" get? `[BAR Opening 1]`

**Demo.** Three disputes. One resolved by arithmetic in 3ms. One resolved by the model reading intent. One escalated to a human because neither could decide — and that escalation is counted, not hidden.

**Differentiation.** *"Dispute resolution becomes document comparison over structured mandates — tractable, and unbuilt"* `[MKT #12]`. ⚠️ Collides partially with Razorpay's shipped **Dispute Responder** in Agent Studio `[RUBRIC §6]` — but that is card-dispute representment, not agent-mandate adjudication. Must say so explicitly.

**Tracks.** Primary **T01** · Secondary T02.

---

# PART B — MARKET-FIRST
*Start from an evidenced painful problem, then ask what could solve it.*

---

## B1 · The Empty Quadrant — a feasibility oracle for Indian agent payments

**Pitch.** Answer, for any proposed agent-payment scenario, whether it is legally executable in India today — and if not, exactly which clause stops it and what the nearest legal alternative is.

**Problem.** *"At most ₹5,000 per transaction and ₹15,000 per month, domestic P2M only, as one of five delegates, inside a CUG pilot — and delegation removes the UPI PIN, not the human"* `[SPINE §3]`. The higher-value alternative, UPI Autopay (AFA-free to ₹15,000; ₹1,00,000 for insurance/MF/credit-card categories) buys those limits **by fixing the payee in advance**, so the agent has no discretion — and the 2026 Master Direction explicitly **forbids customer-set sub-limits** on it `[SPINE §3]`. **The quadrant everyone wants — high cap and agent discretion — is empty. That is precisely the quadrant ACP's `delegate_payment` assumes exists** `[SPINE §3]`.

**Target user.** Every builder, PM and compliance reviewer designing an agentic payment product for India — and, implicitly, the panel.

**Why it matters.** OC-201A (8 Jul 2025) requires full-delegation secondaries to be family members or KYC-OVD-identified employees → **an AI agent cannot qualify as a full-delegation secondary** `[SPINE §1]`. OC-201B opens an "AI Profiles" CUG pilot, domestic P2M only, with the decisive clause *"debit transactions using IoT shall be only initiated by explicit user action"* `[SPINE §1]`. Almost nobody building in this space knows any of this — and one PSP's public standards submission got the headline number wrong by 3× `[SPINE §4]`.

**Solution.** A scenario evaluator: describe an agent-payment use case in plain language → structured scenario → rule engine over the encoded circular set → verdict (`EXECUTABLE` / `EXECUTABLE_WITH_CONSTRAINTS` / `NOT_AUTHORISED`) + the exact citation + the nearest legal variant + a machine-readable constraint block ready to feed A3.

**AI role.** Natural-language scenario → structured parameters (amount, cadence, payee scope, delegate count, domestic/cross-border, P2M/P2P, human-trigger presence). **Deliberately NOT AI:** the rule set, the evaluation, the verdict, the citations. The model is a *parser*, and the system is designed so that a mis-parse is caught by showing the extracted parameters back to the user before evaluating.

**Razorpay role.** The rule set is Razorpay's operating envelope; outputs are directly consumable as Razorpay MCP `create_order` token blocks.

**Key workflow.** scenario text → parse → confirm parameters → evaluate → verdict + citations + nearest-legal-variant → export constraint block.

**Batch metric.** **≥100 scenarios** (hand-labelled by reading the circulars, including adversarial near-misses at ₹4,999/₹5,001, delegate 5 vs 6, P2P vs P2M, first-24h ₹2,000 vs ₹5,000): **verdict accuracy with per-rule breakdown and a published list of scenarios the system refuses to adjudicate**. Parse accuracy measured separately from evaluation accuracy — because conflating them is exactly the label-leakage trap `[BAR Opening 1]`.

**Technical depth.** Rules-as-data with citation provenance, OCR-sourced from scanned circulars `[SPINE header]`, adversarial boundary testing, documented handling of the ₹5,000-vs-₹2,000 first-24h conflict (design to ₹2,000) `[SPINE §1]`.

**Demo.** Type "let my agent buy groceries up to ₹8,000 a week from any store" → `NOT_AUTHORISED`, three clauses cited, nearest legal variant offered, constraint block exported.

**Differentiation.** Pure verification, zero generation. Directly serves Razorpay's stated thesis that verification capacity is the bottleneck. And it is the artifact that would have caught the 3× error `[SPINE §4]`.

**Competitors.** None found. ⚠️ Every GitHub hit for "NPCI UAP" is another Buildathon entrant — circular evidence; **do not build on UAP** `[SPINE §7]`.

**Tracks.** Primary **T01** · Secondary T05.

---

## B2 · Hallucinated Cart — measuring what agents get wrong about Indian catalogues

**Pitch.** A held-out benchmark that measures how often a shopping agent invents a SKU, a price or a stock status against a real merchant catalogue — and a deterministic grounding layer that stops it before money moves.

**Problem.** `HYPOTHESIS — unevidenced` at the magnitude level: the corpus does not measure agent catalogue-hallucination rates. What *is* evidenced is the shape of the defence: the strongest competitor's design principle is *"the buyer names a sku; the merchant names the price"* `[ARYAN]`, and the best-in-field money-safety pattern resolves **amount server-side from the DB, with the agent sending only `sku`** `[BAR capability 11]`. Both exist because the failure mode is real enough that two independent builders defended against it.

**Target user.** Merchants exposing catalogues to agents; agent builders.

**Why it matters.** Four live Indian merchants already serve machine-readable catalogues via UCP and MCP `[HOLE]` — the surface is real and shipping. A price hallucination in an agentic checkout is not a wrong answer, it is a wrong *debit*.

**Solution.** (a) A benchmark harness that queries agents against real Indian merchant catalogues and scores SKU existence, price exactness (integer paise), variant correctness and stock claims; (b) a grounding gate that refuses to build a cart from any unverified assertion.

**AI role.** The agent under test is the AI — the *system* is the measurement instrument, which is deliberately deterministic. **Deliberately NOT AI:** the grader. A model grading a model is exactly the failure abhinav-phi found when his eval LLM turned out to be a noop `[BAR Opening 7]`; grading here is exact string/integer comparison against catalogue truth.

**Razorpay role.** Server-side amount resolution at order creation is the enforcement point; Razorpay `create_order` is where a hallucinated price becomes a real one.

**Batch metric.** **≥200 shopping queries** across the four verified live Indian merchant catalogues (real data — *"validate on something you did not generate"*, the strongest single move in the field `[BAR §5 item 7]`): **hallucination rate by type, with a per-merchant breakdown, effective `n`, and an attrition ledger for queries that could not be graded**. Baseline: an exact-match retriever.

**Demo.** An agent confidently proposes a ₹1,299 product. The catalogue says ₹1,899. The gate refuses. Then run 200 and show the rate.

**Differentiation.** Uses **real, live, third-party data** as the target — the single defence against the field's universal fatal flaw, that every measured repo's label is a restatement of its own generator `[BAR Opening 1]`.

**Competitors.** None found on the pricing-truth axis.

**Tracks.** Primary **T01** · Secondary T05.

---

## B3 · Double-Buy — collision detection for parallel agents

**Pitch.** Detect and prevent the failure mode where two agents, or one agent retried, buy the same thing twice against one mandate.

**Problem.** The direct competitor names this as an unfixed defect in its own repo: *"`UNIQUE`-constraint idempotency deduplicates rows not actions, so a cross-process race can double-order"*, and *"stock checked at quote time but never reserved"* `[ARYAN]`. An honest competitor found it in their own code and could not fix it in time.

**Target user.** Merchants; mandate holders.

**Why it matters.** UPI is the most retried rail in India — 12.52% volume-weighted business decline `[MKT #1]` and ~189m technical declines a month at 0.7–0.8% of 23.66bn July 2026 transactions `[MKT #11, INFERENCE with stated assumptions]`. High retry rates plus agents that retry automatically plus row-level rather than action-level idempotency is a duplicate-charge generator. And RBI already prices the harm of a failed transaction not reversed: **₹100/day beyond the TAT window, payable suo moto without waiting for a complaint** `[MKT #16, grade A]`.

**Solution.** Action-level idempotency: a reservation protocol keyed on (mandate, cart hash, intent nonce) with stock reservation at quote time, cross-process safe, plus a duplicate-detection sweep over settled payments.

**AI role.** Classify *near*-duplicates that are not byte-identical — same intent, different cart ordering, a re-quote after a price change, a genuine second purchase of the same item. This is precisely the case where a rule cannot decide. **Deliberately NOT AI:** exact-duplicate detection (hash comparison), the reservation lock, and the refund trigger.

**Razorpay role.** `create_order` idempotency, `fetch_all_payments`, `create_refund` as the remediation `[GAP §1]`.

**Batch metric.** **≥500 concurrent purchase attempts** including deliberate races: **duplicate-charge rate (target zero) and near-duplicate classification precision/recall**, with the false-positive cost stated explicitly — blocking a genuine second purchase is a real cost, and must be reported, not buried.

**Technical depth.** Distributed locking, action-vs-row idempotency, cart canonicalisation and hashing, concurrency test harness.

**Demo.** Fire 50 concurrent identical requests. Naive implementation: N charges. Ours: 1 charge, 49 coded refusals.

**Differentiation.** Attacks a defect a strong competitor publicly could not fix `[ARYAN]`, using a race-condition test harness — the kind of thing that generates a genuinely interesting failure narrative, which is *read first* `[RUBRIC §3]`.

**Tracks.** Primary **T01** · Secondary T05.

---

## B4 · Subscription AFA Cliff Navigator for agent-managed mandates

**Pitch.** Predict which agent-managed recurring mandates will fail at the ₹15,000 AFA cliff or die at the regulator-mandated pre-debit notice, and act before either happens.

**Problem.** RBI *Digital Payments – E-mandate Framework, 2026* (RBI/DPSS/2026-27/396, 21 Apr 2026): AFA required above **₹15,000** (₹1,00,000 for insurance/MF/credit-card bills); **pre-debit notification at least 24 hours prior to the actual charge**; AFA also required to register, modify or withdraw a mandate `[MKT #9, grade A]`.

**Target user.** Subscription merchants in India; agents managing recurring spend.

**Why it matters.** *"Western dunning playbooks assume card-on-file with issuer-side retry behaviour. India's regime is structurally different and the tooling hasn't followed"* `[MKT #9]`. **Both loss mechanisms are predictable in timing** — you know which mandates cross ₹15,000 and exactly when every pre-debit notice fires `[MKT #9]`. The pre-debit notice is a **regulator-mandated churn prompt before every charge**. For an agent-held mandate this compounds: the agent cannot supply AFA (a factor must be *unique to that transaction* `[SPINE §2]`), so every cliff crossing is a mandatory human interrupt that must be scheduled, not discovered.

**Solution.** A mandate book scanner: forecast each upcoming debit, flag cliff crossings, schedule the human checkpoint (via URL-mode elicitation, per A5) ahead of the notice window, and score cancellation risk per notice.

**AI role.** Per-mandate failure/cancel scoring conditioned on amount trajectory, notice history and prior response. **Deliberately NOT AI:** the ₹15,000 threshold test, the 24-hour window arithmetic, and the decision to require AFA — all statutory and deterministic. This is a clean pillar-3 story: *the regulator wrote the rule; we do not ask a model to guess it.*

**Razorpay role.** `create_registration_link`, `fetch_tokens`, `revoke_token`, UPI Autopay `[GAP §1]`.

**Batch metric.** **≥200 synthetic mandates** with amounts straddling ₹15,000 and simulated notification-to-cancel behaviour `[MKT #9 demo column]`: **cliff-detection exactness (deterministic → reported exact, no CI) and cancel-prediction precision/recall against three baselines including a tuned naive rule** `[BAR Opening 2]`.

**Demo.** A mandate book scrolls; three renewals light up red 26 hours before their notice fires; one is rescued by a scheduled human checkpoint.

**Differentiation.** ⚠️ Collides with Razorpay's shipped **Subscription Recovery** `[RUBRIC §6]` and T03 is 24% of the field `[TRACK T03]`. Only defensible on the *agent-held mandate cannot supply AFA* axis. **Included partly as a calibration point — this is close to a re-demo of a shipped product.**

**Tracks.** Primary T03 · Secondary **T01**.

---

## B5 · Reversal Watchdog — auditing a compensation the regulator already mandated

**Pitch.** An independent watchdog that detects breached failed-transaction reversal deadlines and computes the ₹100/day compensation the rules say must be paid without anyone asking.

**Problem.** RBI/2019-20/67, DPSS.CO.PD No.629/02.01.014/2019-20 (20 Sep 2019): **₹100/day** beyond T+1 (UPI P2P, IMPS, NACH, PPI) or T+5 (ATM, PoS/CNP, UPI merchant), and *"Wherever financial compensation is involved, the same shall be effected to the customer's account suo moto, **without waiting for a complaint**"* `[MKT #16, grade A]`.

**Target user.** Customers; merchants; PSP compliance teams.

**Why it matters.** *"Suo-moto compensation is hard to audit from outside"* `[MKT #16]`. At ~189m technical declines a month `[MKT #11, INFERENCE]`, even a small breach rate is a large number of unpaid ₹100s. This is a rare case where the regulator has already priced the harm, so the metric needs no vendor statistic.

**Solution.** Ingest a reversal stream, compute TAT windows per instrument class, detect breaches, compute compensation owed, and produce a reconciled, auditable exception register.

**AI role.** Classify ambiguous reversal events into instrument classes where the raw record does not determine the TAT window, and read unstructured failure narratives. **Deliberately NOT AI:** the calendar arithmetic, the TAT table, the ₹100/day computation — reported exact, no confidence interval `[BAR Opening 4]`.

**Razorpay role.** `fetch_all_refunds`, `fetch_settlement_recon_details`, `fetch_all_settlements` `[GAP §1]`; Razorpay sits exactly where reversal streams are visible.

**Batch metric.** **≥400 synthetic reversal events** with injected delays `[MKT #16 demo column]`: **breach-detection precision/recall, total compensation computed vs ground truth, and a full exception list of events that could not be classified** — reconciling `N_in → N_classified → N_adjudicated` `[BAR Opening 5]`.

**Demo.** Four hundred reversals in, an exception register out, with the rupee total and the named unresolvables.

**Differentiation.** Deliberately unglamorous, regulator-grounded, and heavily deterministic — which is a *feature* for pillar 3, but caps the AI-leverage ceiling. **Included as a "too plain" calibration point.**

**Tracks.** Primary **T05** · Secondary T03.

---

## B6 · Outage-Aware Agent Governor

**Pitch.** Detect a degrading bank in real time and steer agent retries away from it, within the polling budget NPCI now enforces.

**Problem.** 12 Apr 2025 saw ~5 hours of UPI downtime, the longest recent; Mar 2025, 95 min; Jan 2022, 187 min. NPCI's response circular now **caps status polling: first check only after 90 seconds, max 3 calls per 2-hour window**, mandatory CERT-In audit — root cause *"excessive and repetitive invocation of 'check transaction status' API at high TPS by some PSP banks"* `[MKT #15, grade B]`.

**Target user.** Merchants; agent operators.

**Why it matters.** *"Merchants have no visibility into which bank is degrading, and are now rate-limited on asking"* `[MKT #15]`. An agent's natural response to failure is to retry harder — which is *precisely* the behaviour NPCI just outlawed. **An unsupervised agent on Indian rails is, by default, a polling-abuse machine.**

**Solution.** A shared degradation estimator that infers bank health from *outcome* signals (declines, latencies, timeouts) rather than from polling, plus a governor that enforces the 90s/3-per-2h budget as a hard cap on every agent under it, with backpressure and a documented degraded-mode.

**AI role.** Change-point detection over noisy multi-bank outcome streams to distinguish a genuine brownout from ordinary variance. **Deliberately NOT AI:** the polling budget enforcement (a hard counter), the retry schedule, and any money action.

**Razorpay role.** The aggregator position again — cross-merchant outcome telemetry is the only way to infer bank health without polling.

**Batch metric.** **≥50 simulated brownout episodes** across banks: **detection latency and false-alarm rate vs a threshold baseline, plus a hard compliance gate — zero polling-budget violations across the whole batch**, with any violation reported as a headline failure.

**Demo.** A bank browns out. Naive agent: retries, breaches the budget, still fails. Governed agent: detects in N seconds, routes away, stays inside the budget — with the counter on screen.

**Differentiation.** Compliance-as-a-metric is rare, and "zero violations" is an honest, attackable, binary claim.

**Tracks.** Primary **T05** · Secondary T03.

---

## B7 · Agent Funnel — measuring where agents abandon, and why

**Pitch.** Instrument the agentic checkout funnel end-to-end and produce the first honest attrition ledger for agent purchases on Indian merchants.

**Problem.** **70.22%** average documented cart abandonment (Baymard meta-analysis of 50 studies, updated Sep 2025), with payment-addressable reasons: **site errors/crashes 17%, card declined 10%, too few payment methods 9%** `[MKT #4, grade A]`.

**Target user.** Merchants; Razorpay growth.

**Why it matters.** *"too few payment methods 9%"* is a human-checkout figure — but the four verified live Indian agentic profiles offer **exactly two payment handlers, neither of which accepts UPI, in a country that is 80%+ UPI** `[HOLE]`. `HYPOTHESIS — unevidenced:` the agentic funnel's payment-method attrition should therefore be dramatically worse than the human one. **This idea's entire value is that it would measure that rather than assert it.**

**Solution.** A funnel harness that runs agents through discovery → catalogue → cart → payment-handler selection → authorisation → settlement against real merchant profiles and synthetic ones, recording every drop with a reason.

**AI role.** Cluster free-text agent failure reasons into a stable taxonomy. **Deliberately NOT AI:** the funnel stage transitions, the counting, and the denominators.

**Razorpay role.** Razorpay owns checkout, so funnel telemetry is native to it; the payment stage runs in test mode.

**Batch metric.** **≥300 agent purchase attempts**: a full funnel table `N_started → N_discovered → N_carted → N_handler_matched → N_authorised → N_settled` with **every drop reason named and reconciling exactly to the denominator** `[BAR Opening 5]` — and separately, the share of attrition attributable to payment-method unavailability.

**Demo.** The funnel chart, with the payment-handler stage collapsing.

**Differentiation.** ⚠️ This is an **instrument, not a product**. On its own it is thin. Its real strength is as the measurement layer under A1 — and pairing them turns A1's claim from an assertion into a number.

**Tracks.** Primary **T01** · Secondary T05.

---

## B8 · MSME Spine — agentic collection on ₹7.34 lakh crore of frozen receivables

**Pitch.** An agent that determines which of your unpaid invoices breach the statutory 45-day MSME window, and executes a bounded, gated escalation.

**Problem.** **₹7.34 lakh crore of MSME receivables frozen as of March 2024**, down from ₹10.7 lakh crore in 2022 — *Delayed Payments Report 3.0*, GAME + FISME + C2FO `[MKT #2, grade B — publishers are MSME-advocacy plus a working-capital lender; flag the affiliation]`. ≈ a quarter of one month of total UPI throughput `[MKT #2, INFERENCE]`.

**Target user.** 6.4m Indian MSMEs; micro-enterprises worst, ~3× longer delays `[MKT #2]`.

**Why it matters.** MSME Samadhaan, the statutory remedy, has disposed ~19.6% of applications and ~14.7% of disputed value `[MKT #2, INFERENCE]` — *"a litigation-shaped remedy for a cash-flow-shaped problem"*. But **Section 43B(h) changed the incentive on 1 Apr 2024**: late payment to a Udyam-registered micro/small supplier now **disallows the buyer's tax deduction** `[MKT #2]`. The lever now exists; the tooling does not.

**Solution.** Invoice ingest → Udyam status determination → day-45 breach computation → a graded, human-gated escalation ladder (reminder → 43B(h) notice → Samadhaan filing pack), with every outbound action bounded and logged.

**AI role.** Document extraction from heterogeneous invoices and vendor-status evidence, and drafting the escalation correspondence. **Deliberately NOT AI:** the day-45 arithmetic, the Udyam-registered boolean, the escalation-stage gate, and any legal assertion — all deterministic, and every escalation requires a human release.

**Razorpay role.** ⚠️ **Weakest Razorpay tie in the pool** — this is RazorpayX/payouts territory at best. Honest about it: this is a market-first idea whose problem is excellent and whose Razorpay alignment is poor. Included for range.

**Batch metric.** **≥200 synthetic invoices** with Udyam status and ageing buckets `[MKT #2 demo column]`: **breach-detection exactness (deterministic) and extraction accuracy on a held-out set with a full exception list**, plus an escalation-precision figure (how many escalations were later found unwarranted — the false-positive cost is a damaged commercial relationship, and must be stated).

**Demo.** Two hundred invoices in, a ranked escalation queue out, one letter drafted, human approves, action logged.

**Differentiation.** Best-evidenced India-only problem after UPI decline `[MKT #2]`. But T05/T03 fit, and Open **forfeits the largest scoring component — Razorpay alignment — while inheriting an identical bar** `[TRACK T05]`.

**Tracks.** Primary T03 · Secondary **T05**.

---

## B9 · Agent Purchase Receipts — an independent, verifiable record both sides can audit

**Pitch.** A hash-chained, independently verifiable receipt log for agent purchases that neither the agent operator nor the merchant can silently rewrite.

**Problem.** *"Nothing exists on the merchant side to accept, validate, enforce or retain a mandate"* `[MKT #12]`, and the accountability question has no rulebook `[MKT #14]`.

**Target user.** Both sides of an agent transaction, and whoever adjudicates between them.

**Why it matters.** MCP's tool annotations are explicitly *"untrusted"* and human approval is **SHOULD, unenforced** `[GAP §5]`. Web Bot Auth explicitly does not define authorization or delegation `[GAP §5]`. In a system where no layer is trusted, the record has to be.

**Solution.** An append-only, hash-chained receipt store binding intent mandate hash → cart hash → order id → payment id → settlement, with an independent verifier and tamper tests **in both directions** — *"a function that always returns False passes a naive test"* `[BAR capability 9]`.

**AI role.** ⚠️ **Almost none, honestly.** Only anomaly narration over the chain. **This is the point:** the idea's pillar-3 story is that a verifiable ledger is the wrong place for a model, and the write-up would say so with a cost column `[BAR Opening 4]`. But it also means AI leverage is genuinely low, which is a real weakness.

**Razorpay role.** Payment/settlement records are the reconciliation anchor.

**Batch metric.** **≥1,000 ledger entries with an injected tamper suite**: **tamper-detection rate (must be 100%) and false-positive rate on legitimate mutations (must be 0%)**, plus reconciliation match rate against Razorpay test-mode records with a named exception list.

**Demo.** Flip one byte in entry 417. The verifier names the entry and the field.

**Differentiation.** Table stakes at the top of the field — `vaibhav375` already tests a verifier in both directions `[BAR capability 9]`. **Included deliberately as a "too plain" calibration point: this is a component, not a submission.**

**Tracks.** Primary **T01** · Secondary T05.

---

## B10 · Step-Up Router — deciding when a human must be interrupted

**Pitch.** A policy engine that decides, per transaction, whether to proceed, step up to a human factor, or refuse — optimising the tradeoff nobody is measuring.

**Problem.** In India the human trigger is **legally required per purchase** `[SPINE §8]` — but *how* it is triggered still has a cost. Interrupt too often and the agent is useless; interrupt too rarely and the system is unlawful `[SPINE §2]`.

**Target user.** Agent operators; merchants; the PSP.

**Why it matters.** Four sources converge on requiring the human trigger `[SPINE §3]`, and RBI Authentication Directions 2025 shift **full liability to the issuer** on non-compliance `[SPINE §2]`. Yet no measured repo in the field reports the *cost* of its human checkpoints — the entire field reports benefits and hides costs `[BAR Opening 2, Opening 5]`.

**Solution.** A step-up decision policy over transaction context (amount vs ceilings, payee novelty, mandate headroom, deviation from stated intent, time since last human interaction), with a hard floor: certain classes *always* step up regardless of what the policy says.

**AI role.** Estimate deviation-from-intent — how far this purchase is from what the human actually asked for. That is a semantic judgment a rule cannot make. **Deliberately NOT AI:** every statutory floor (₹15,000 AFA, ₹5,000/txn, first-24h ₹2,000), which override the policy unconditionally. The model can only ever make the system *more* cautious, never less — enforced structurally.

**Razorpay role.** Razorpay owns the checkout surface where a step-up is actually rendered.

**Batch metric.** **≥300 transactions** with labelled "should have interrupted" ground truth: **interrupt precision/recall with an explicit two-sided cost — human-interruption count (the cost) against unauthorised-spend prevented (the benefit)** — plus a hard gate that no statutory-floor case was ever skipped (zero tolerance), plus an ablation removing the model to prove it is load-bearing `[BAR Opening 6]`.

**Demo.** Thirty purchases run; four interrupts fire; the two-sided cost table is shown, including the interrupt that turned out to be unnecessary.

**Differentiation.** Reports the *cost* of its own safety mechanism. Almost nothing in the field reports a cost `[BAR Opening 2]`.

**Tracks.** Primary **T01** · Secondary T05.

---

## B11 · Intent Drift — did the agent buy what you actually asked for?

**Pitch.** Measure and gate the semantic gap between a human's stated intent and the cart an agent assembled, before the money moves.

**Problem.** AP2 names it verbatim as an open problem: *"the merchant knowing the request reflects true intent"* `[MKT #12, grade A]`. And the direct competitor identified the deeper version: *"`verify()` proves a mandate was signed by the holder of the key it carries and has not changed since. It does not prove that key belongs to anyone entitled to spend… **A valid signature proves origin, not permission**"* `[ARYAN]`.

**Target user.** Mandate holders; merchants; dispute adjudicators.

**Why it matters.** Independent convergence: Web Bot Auth reaches the same conclusion from the other direction — *"an unresolved Signature-Agent is a claim rather than an identity"* `[ARYAN]`. **Signature verification is solved and structurally insufficient. Intent conformance is the unsolved half.**

**Solution.** A conformance scorer over (stated intent, assembled cart) producing a graded verdict — conforming / borderline / divergent — with the divergent dimension named (item, quantity, price, brand, timing), gating the money action on the verdict.

**AI role.** This is the load-bearing AI in the pool. Semantic intent conformance is **not** expressible as a rule — "running shoes under ₹4,000" vs a specific SKU is exactly the residual left after every deterministic check passes. **Deliberately NOT AI:** price ceiling, quantity limit, payee allowlist, and category — all checked deterministically *first*, so the model only ever sees what arithmetic could not decide. The model's scope is minimised by design and that reduction is measurable.

**Razorpay role.** The gate sits immediately before `create_order`; server-side amount resolution is the backstop `[BAR capability 11]`.

**Batch metric.** **≥150 (intent, cart) pairs** with hand-labelled conformance, including adversarial near-misses (right category wrong brand, right item wrong quantity, within budget but wrong purpose): **conformance-verdict precision/recall — reported separately on the full set and on the deterministic-check residual**, because the headline number on the full set is contaminated by cases arithmetic already decided. That separation is the honest-measurement move `[BAR Opening 1]`. Adversarial baseline: keyword overlap, and a depth-3 stump over structured features.

**Demo.** "Buy me running shoes under ₹4,000." The agent picks ₹3,800 formal shoes. Every deterministic check passes. The gate refuses on intent divergence.

**Differentiation.** Directly answers the question the strongest competitor raised and left open `[ARYAN]`. And it is one of the few places in this whole pool where an LLM is genuinely irreplaceable.

**Tracks.** Primary **T01** · Secondary T05.

---

## B12 · The Attack Harness — a submission whose product is breaking its own number

**Pitch.** Build a modest agentic-payment system, then build a far more serious adversarial evaluation kit around it, and publish every attack that succeeded.

**Problem.** **Every single measured repo in the field has a compromised measurement target. Not one of the ten reports a number that survives a determined 30-second attack** `[BAR §0]`. A depth-3 tree recovers 99.18% of one repo's labels; a single subtraction (`days_to_estimated <= 2`) beats another's LightGBM stack by $8,455; a third's "holdout" scores a perfect 1.0 with the LLM off; deleting *all* identifier edges from a graph project reproduces its headline 100/100/0 byte-identically `[BAR Opening 1, Opening 6]`.

**Target user.** The judges, directly.

**Why it matters.** *"The field has learned to measure carefully. It has not learned to check what it is measuring. That gap is our opening, and it is wide"* `[BAR §0]`. And: *"in a field where a single subtraction beats a LightGBM stack and a 'holdout' scores a perfect 1.0, being the one submission that publicly tries to break its own number is the highest-value 30 lines of code available"* `[BAR §5]`.

**Solution.** A reusable evaluation kit: adversarial baseline hunt (depth-1/2/3 stumps, single comparisons, majority class, regex), label-leakage detector, component ablation runner, effective-`n` and attrition ledger generator, pre-registration tooling with git tags, and a report that publishes every attack including the ones that succeeded — applied to our own system first, and to a couple of public repos as validation.

**AI role.** Propose candidate leakage hypotheses and adversarial features from a schema — a genuinely hard search problem. **Deliberately NOT AI:** every attack is then *executed deterministically* and every number is computed, not inferred. A model may suggest an attack; only code may claim one landed.

**Razorpay role.** ⚠️ **Weak** — this is meta-methodology, not payments. It would have to be applied *to* a Razorpay-native system to score on alignment. Best as a wrapper around A1/A3/B11, not as a standalone.

**Batch metric.** Self-referential and honest: **for each headline number our own system claims, the best trivial baseline's score alongside it**, plus a published count of attacks attempted vs attacks that landed.

**Demo.** Our own headline number on screen. Then a depth-1 decision stump next to it. Then the gap — or the absence of one, admitted.

**Differentiation.** ⚠️ **Deliberately included as a "too ambitious / possibly mis-shaped" idea.** It targets the exact opening the corpus identifies as widest, but it risks failing pillar 1 (*"did you pick something that actually matters"* `[RUBRIC §2]`) because meta-evaluation is not a payments problem. **The corpus's actual recommendation is to use this as a *technique* inside a payments submission, not as the submission.**

**Tracks.** Primary **T05** · Secondary T01.

---

# CLUSTERING

| Cluster | Ideas | Note |
|---|---|---|
| **Agentic payment rails (India-specific)** | A1, A5, A10, B2, B7 | The UPI hole and the protocol surface. **A1 is the strongest representative.** |
| **Bounded spend authority** | A3, A6, A11, B10 | ⚠️ **Contested by `aryanpajnee` `[ARYAN]`.** A3 is the flagship; A6 and A11 are components of it; B10 is the interesting orthogonal angle (measuring the *cost* of safety). |
| **Merchant-side trust and attestation** | A2, A7 | Near-empty direction `[HOLE]`. **A2 is the strongest** — A7 drifts into T02/Vulcan territory. |
| **Regulatory conformance / verification** | A4, B1 | ⚠️ **Near-duplicates** — same rule table, same citations, same OCR pipeline. B1 is the user-facing framing (scenario in → verdict out); A4 is the CI-linter framing (declaration in → violation out). **Keep one, or build one engine with two front-ends.** |
| **Accountability and audit** | A12, B3, B9 | B9 is a component (table stakes `[BAR capability 9]`). A12 is the substantive one. B3 attacks a named competitor defect. |
| **Intent and grounding** | B2, B11 | ⚠️ **Adjacent** — B2 checks the cart against the *catalogue*, B11 checks it against the *human*. Both are load-bearing-AI arguments; they compose well and could be one system. |
| **Payment optimisation / revenue recovery** | A8, B4, B6 | ⚠️ All collide with shipped Razorpay products (Smart Retry, Subscription Recovery) `[RUBRIC §6]` and with the 24%-saturated T03 `[TRACK T03]`. |
| **Financial control / ops** | B5, B8 | Weakest Razorpay alignment; T05 forfeits the largest scoring component `[TRACK T05]`. Included for range. |
| **Meta-methodology** | B12 | Not a submission. A technique to apply to whichever idea wins. |

## Near-duplicates flagged

1. **A4 ≈ B1** — one rule engine, two front-ends. Do not build both.
2. **A6 + A11 ⊂ A3** — components, not submissions.
3. **B9 ⊂ every idea** — a hash-chained audit ledger is table stakes, not a differentiator.
4. **B2 ≈ B11** — different reference truths (catalogue vs human intent); strongest combined.
5. **A9 ≈ B7** — both are measurement instruments over the same merchant surface; B7 is the better framing because it measures the funnel outcome, not just the declaration.
6. **A7 ≈ A2** inverted — A2 verifies merchants to agents; A7 verifies agents to merchants. Different directions, but they share the attestation plumbing.

## Cross-cutting notes

- **Every idea touching delegation must stub and declare the TSP layer** `[SPINE §5]`. This is a disclosure requirement, not a flaw.
- **Do not build on UAP** — it rests on one anonymously-sourced Business Standard scoop, zero circulars, and every GitHub hit is another Buildathon entrant `[SPINE §7]`.
- **Do not claim novelty of the bounded-mandate thesis** `[ARYAN]`.
- **`FAILURES.md` written live is table stakes now, not an edge** — the direct competitor is already doing it `[ARYAN]`.
- **Verify UPI Reserve Pay on test keys by execution on day 1.** It is architecture-gating and undocumented; fallback is UPI Autopay `[HOLE]`.
- Test-mode signup escape hatch, already paid for by a competitor: choose business type **Individual** (not Sole Proprietorship) to reveal the "Get test keys" button `[ARYAN]`.
