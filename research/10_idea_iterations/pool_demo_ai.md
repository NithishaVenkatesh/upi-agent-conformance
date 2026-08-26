# Idea Pool — Demo-First × AI-Necessity-First · Tracks 02 / 03 / 04

**Generated:** 2026-08-26 · **Agent:** IdeaGenerator (demo-first + AI-necessity-first entry points)
**Assignment:** stress-test whether Tracks 02/03/04 beat the lead researcher's converged Track 01.
**Scope:** 19 ideas. Not pre-filtered. Not scored. Some deliberately too-ambitious, some deliberately too-plain — both marked.

---

## 0. How I ran the two entry points

**AI-necessity-first, strictly applied.** Before an idea entered the pool I asked: *what is the residual after a competent engineer writes the obvious `if/else` and the obvious SQL query?* Three shapes survive that test and everything below is one of them:

| Shape | Why a rule cannot do it | Example in pool |
|---|---|---|
| **A. Join across records that share no key** | A deterministic matcher needs a join key. Four systems describing the same rupee have none (`08_market/finance_ops_problems.md` §2). Fuzzy many-to-many over incompatible granularity/timestamp conventions is the canonical model-over-rule case. | #16, #17, #19, #20 |
| **B. Classify a free-text or heterogeneous artefact into a decision** | Issuer decline strings, dispute narratives, delivery evidence, supplier invoices — unbounded surface forms, bounded decision space. | #2, #8, #12, #17 |
| **C. Choose an action under an asymmetric, *portfolio-level* cost function** | Per-item rules cannot optimise a constraint defined over a *set* (a monthly count ratio, a batch budget, an aggregate exposure). This is the shape rules are worst at and it is systematically under-built. | #1, #3, #9, #10 |

Anything that reduced to "an LLM writes a nicer dunning email" was rejected at the door. Where an idea is genuinely thin on AI necessity I say so in its own row rather than hiding it.

**Demo-first, strictly applied.** Every idea below has a five-scene arc with the shape **BEFORE → AI REASONING → ACTION → RESULT → THE THING THAT WENT WRONG**. Scene 5 is deliberate: `THE_REAL_RUBRIC.md` §3 establishes *"What broke, and how you got out"* is read **first**, and `FIELD_BAR.md` Opening 7 establishes that essentially the whole field fakes it with scripted chaos injection. A demo that ends on a real failure is differentiated by construction.

**Two structural constraints I applied to every idea:**

1. **Test-mode asymmetry.** Settlements do not occur in test mode; dispute creation is unverified; **subscription/mandate failure is the only loss event genuinely manufacturable in a Razorpay sandbox.** Ideas that need a real loss event are marked `SANDBOX RISK`.
2. **The Agent Studio collision** (`THE_REAL_RUBRIC.md` §6, `track_scorecard.md` adjustment A). Every idea carries an explicit escape claim. Ideas that do not escape are marked **`COLLIDES`** and kept anyway, because a pool without them cannot calibrate.

---

## 1. The collision map — read before the ideas

Razorpay ships, in production: **Dispute Responder · Subscription Recovery · Abandoned Cart Conversion · RTO Shield · RTO Insights · Settlement Insights · Cashflow Forecaster** (Agent Studio, PR 2026-03-12, `01_razorpay_signals/razorpay_ai_signals.md` §4), plus **Vulcan** — transformer payments foundation model, ~3tn data points, ~3,000 signals/transaction, doing routing, network-level fraud, **RTO risk for COD**, and checkout personalisation (AWS joint PR 2026-08-18, same file).

There are exactly **five axes** on which a student build can escape this. I derived them by asking what each shipped agent *structurally cannot be*, given what it is:

| # | Escape axis | Why it works | Ideas using it |
|---|---|---|---|
| **E1** | **Wrong side of the transaction.** Every Agent Studio agent serves the *money-receiving* merchant. Nothing serves the merchant as *payer*. | Razorpay's Receivables Agent chases *your* debtors. Nobody agent-ises *your payables*, where Section 43B(h) put the tax liability. | #11, #20 |
| **E2** | **Wrong side of the clock.** Recovery agents are post-failure by definition. RBI has created a mandatory *pre-failure* window. | E-mandate Framework 2026 requires a pre-debit notice **"at least 24 hours prior"** (RBI/DPSS/2026-27/396, `08_market/revenue_leakage_problems.md` §1.1). That is 24 hours of known-in-advance, addressable time that no post-failure agent can occupy. | #9, #10, #8 |
| **E3** | **Portfolio objective, not per-item objective.** Every shipped agent optimises one dispute, one cart, one subscription. | Visa VAMP is a **count-based monthly ratio** with CE3.0 and pre-dispute resolution as *numerator exclusions* (`08_market/risk_problems.md` §3.1, Visa primary). Winning individual disputes and managing a ratio are different optimisation problems and can point in opposite directions. | #1, #3 |
| **E4** | **Explicitly excluded scope, in Razorpay's own legal text.** | Chargeback Shield's published terms exclude disputes about *"the quality, delivery, or description of goods or services"* (`01_razorpay_signals/razorpay_product_signals.md` §2.3). Razorpay has written down what it does not cover. | #2 |
| **E5** | **Measuring the incumbent instead of imitating it.** A verification artefact aimed at an automated money system is not a competitor to that system. | Razorpay's stated thesis, verbatim in Track 04's why-now: *"verification capacity, not generation speed, is the bottleneck."* | #3, #7, #18 |

**The axes that do NOT work** (and I want this on record so nobody rediscovers them): "better prompts", "more channels", "Hinglish", "prettier dashboard", "we also do WhatsApp". Agent Studio ships Subscription Recovery built with **ElevenLabs** and Abandoned Cart with **SuperU and Nugget by Zomato**. The voice-and-channel axis is closed.

---

# TRACK 02 — AI RISK MANAGER

---

## Idea 1 — **VAMP Governor**

**Pitch.** A compliance-ratio controller that decides, across a month's dispute portfolio, which disputes to fight, which to refund pre-emptively, and which to CE3.0-qualify — because Visa's threshold counts *events*, not rupees, and the cheapest way to stay under it is often to lose money on purpose.

**Problem.** Visa VAMP scores an acquirer/merchant on `count[Fraud TC40 + Disputes TC15] ÷ count[settled TC05]`, evaluated monthly. Merchants fight representments after the fact, one dispute at a time. But the ratio's own definition contains two exclusions — CE3.0-qualified fraud and **disputes resolved through pre-dispute solutions** — which means a dispute *prevented or resolved upstream never enters the numerator at all*, while a dispute *won on representment still does*. Nobody manages the ratio; everybody manages the disputes.

**Target user.** Risk/finance lead at a mid-size Indian D2C or cross-border merchant whose acquirer is about to have a bad month.

**Why it matters — corpus.** Visa VAMP fact sheet 2025, PRIMARY, verbatim (`08_market/risk_problems.md` §3.1): acquirer **Above Standard ≥50bps, Excessive ≥70bps**; Excessive Merchant AP/Canada/EU/US **≥220bps → ≥150bps on 1 Apr 2026**, min 1,500 monthly count. And footnote 1, verbatim: *"Programs for Brazil, Chile, and **India** will be announced later."* A hard, count-based, monthly, penalty-bearing threshold is arriving in India on a known trajectory with unknown local parameters.

**Solution.** A monthly controller. Ingest the dispute + settled-transaction stream, forecast end-of-month ratio under a do-nothing policy, then solve a constrained allocation: for each open dispute choose `FIGHT` / `PRE-EMPT-REFUND` / `CE3.0-ASSEMBLE` / `ACCEPT`, subject to (a) staying under a target bps, (b) a rupee budget for pre-emptive refunds, (c) never refunding a dispute the evidence says is winnable *unless* the ratio constraint binds — and say so explicitly when it does.

**AI role.** LLM on exactly one thing: reading the heterogeneous dispute artefact bundle (order record, comms thread, courier POD text, AVS/device blob) and returning a structured **CE3.0 qualification verdict with a per-criterion justification** — because CE3.0 qualification is a matching judgement over unbounded free text against bounded criteria (shape B).
**Where I would deliberately NOT use AI.** The ratio arithmetic, the threshold comparison, the allocation solve, and the budget accounting. All deterministic — an integer count divided by an integer count. `FIELD_BAR.md` records `tfthushaar`'s insight that deterministic arithmetic must be reported *exact and without a confidence interval*; I would adopt that verbatim and put the CI only on the LLM's qualification verdict.

**Razorpay role.** Disputes API + settlement/transaction counts as the TC05 denominator; refunds API as the pre-emptive action, gated.

**Key workflow.** `ingest disputes + settled counts → deterministic ratio forecast → if forecast < target: no action, log why → else: LLM CE3.0-qualify each open dispute → deterministic allocation under budget → gated actions → month-end reconcile forecast vs actual.`

**Batch metric.** Over 200 synthetic disputes across 3 simulated months: **realised end-of-month VAMP ratio under the governor vs under three baselines (do-nothing / fight-everything / refund-everything), plus rupees spent per basis point of ratio avoided**, with the count of disputes where the governor refunded a *winnable* dispute reported as an explicit self-inflicted cost line.

**Escapes the collision (E3).** Dispute Responder optimises *one dispute's outcome*. This optimises *a monthly count constraint* and will, correctly, sometimes instruct the merchant to lose a dispute it could win. Those two systems produce different actions on the same input; that is a demonstrable, defensible difference, not a positioning claim. It is also aimed at a threshold whose India parameters Visa has publicly not yet announced.

**Technical depth.** Constrained allocation under uncertainty; forecast-vs-actual calibration; a numerator/denominator definition that must be implemented exactly right or the whole thing is wrong.

**5-scene demo.**
1. **BEFORE** — a bps gauge climbing toward 150 with 9 days left in the month; "your acquirer gets penalised at this number, and you don't know it."
2. **AI REASONING** — the CE3.0 qualifier reads three dispute bundles and returns per-criterion verdicts; one qualifies, one doesn't, one is refused as insufficient evidence.
3. **ACTION** — allocation table: 4 FIGHT, 11 CE3.0, 6 PRE-EMPT-REFUND (₹ cost shown), 2 ACCEPT. The gauge drops below the line.
4. **RESULT** — month-end: forecast vs actual ratio, and the honest line *"we refunded ₹X on 2 disputes we would probably have won. That was the price of the constraint."*
5. **WHAT BROKE** — the real one.

**Differentiation.** Nobody in a 261-repo field is managing a ratio; they are all managing disputes.
**Competitors.** Agent Studio Dispute Responder; Chargeflow/Chargebacks911 class vendors (all per-dispute).
**Track.** Primary T02 · Secondary T04.
**Risk.** `SANDBOX RISK` — dispute creation in test mode is unverified. Mitigation: run entirely on a synthetic dispute ledger and be loud that it is synthetic.

---

## Idea 2 — **The Excluded Eighty** (non-fraud dispute defence)

**Pitch.** Razorpay's own Chargeback Shield terms exclude disputes about quality, delivery and description — so build the defender for exactly the category Razorpay has written down that it does not cover.

**Problem.** The reimbursement products cover *fraud* reason codes. The volume category for Indian D2C is service/delivery/description — "it never arrived", "it wasn't what was described". Those need an evidence narrative assembled from courier scans, chat logs, product copy and photos, which is exactly what a merchant does by hand at 11pm.

**Target user.** D2C ops lead handling 20–200 disputes/month.

**Why it matters — corpus.** Chargeback Shield published terms, verbatim (`01_razorpay_signals/razorpay_product_signals.md` §2.3): coverage excludes chargebacks about *"the quality, delivery, or description of goods or services (e.g., undelivered goods, defective products, or services not as described)"*, and the aggregate coverage ceiling is left literally blank as `"INR [₹]"`. The corpus's own inference on that line: *"the largest dispute category for Indian D2C (service/delivery disputes) is explicitly out of scope — leaving an unserved merchant need."*
⚠️ The *size* of that category in India is `EVIDENCE NOT FOUND` — India dispute mechanics could not be retrieved (npci.org.in 403, `risk_problems.md` §3.3). **Do not put a percentage on this.** The exclusion is the evidence; the volume is not.

**Solution.** An evidence-assembly agent for non-fraud reason codes: retrieve every artefact that touches the order, decide which of them actually rebut *this specific* reason code, assemble a submission, and — critically — **refuse to submit when the evidence does not rebut**, telling the merchant to refund instead.

**AI role.** Retrieval + entailment: does artefact *X* rebut claim *Y*? That is textual entailment over unbounded evidence, not a rule.
**NOT AI.** Reason-code routing, deadline arithmetic, submission formatting, and the refusal threshold — all deterministic.

**Razorpay role.** Disputes API, orders, payments, refunds.
**Batch metric.** Over 100 synthetic non-fraud disputes with *planted ground truth* (each generated as genuinely-rebuttable or genuinely-not): **precision and recall of the "submit vs refund" decision, plus the false-submit rate** — the cost line, since a doomed submission burns the deadline and the fee.

**Escapes the collision (E4).** This is the one axis where Razorpay has published, in a legal document, the boundary of what it does. Building inside a stated exclusion is not competing with the shipped product; it is completing it. Strongest clean escape in the pool.
**Technical depth.** Moderate. Retrieval + entailment + deadline state machine.
**5-scene demo.** 1. A dispute reading "item not as described" and a folder of 14 unrelated artefacts. 2. The agent selects 3, rejects 11, and explains each rejection. 3. Submission assembled + one case **refused** with "refund this, you will lose." 4. Batch table: submit/refund precision-recall + false-submit cost. 5. What broke.
**Competitors.** Agent Studio Dispute Responder (fraud-shaped); the whole chargeback-vendor category.
**Track.** Primary T02 · Secondary T03.

---

## Idea 3 — **Regret** (the false-decline ledger) ⭐ strongest AI-necessity case in T02

**Pitch.** Every fraud system reports what it caught; this one reports what it *cost*, by reconstructing the counterfactual revenue of the orders it declined — and it uses Razorpay's own published number as the yardstick.

**Problem.** Risk teams are measured on fraud caught. The false-positive side is invisible because a declined good order leaves no trace — no refund, no chargeback, no ticket, just a customer who left. So the objective function is optimised on one side only, forever.

**Target user.** Anyone who owns a fraud threshold and cannot defend it upward or downward.

**Why it matters — corpus.** Razorpay's own published blog figure (`01_razorpay_signals/razorpay_product_signals.md` §6.1 / §6.5): **"For every ₹100 saved by preventing fraud, brands lose ₹400–600 to falsely declined legitimate orders."** That is Razorpay's number, on Razorpay's site, and it says the false-positive side is 4–6× the true-positive side. Reinforced by Track 02's bar naming *"honest metrics including false-positive cost"* as its explicit requirement (`current_buildathon.md` §Track 02), and by the RBI composition fact that card/internet fraud is **66.8% of India's fraud cases but 7.2% of value** (`08_market/risk_problems.md` §1) — i.e. the thing being defended against is individually small, which makes over-blocking disproportionately expensive.

**Solution.** A shadow-mode harness. Run the incumbent rule set and a candidate model side by side over a labelled batch; for every declined order estimate the counterfactual outcome; produce a signed rupee ledger of `fraud avoided − revenue destroyed − review labour`; and output the **threshold that maximises the ledger**, not the one that maximises recall.

**AI role.** Honestly, **thin — and that is the point.** The counterfactual estimator is propensity-weighted arithmetic, not an LLM. The only LLM use is turning the resulting ledger into a defensible written rationale for a threshold change. This idea's `WHERE_WE_DID_NOT_USE_AI.md` would be the longest document in the repo, which is a *direct hit* on rubric pillar 3 — *"the right tool in the right place, and where you chose not to use one"* — but it is also a real weakness: if a judge wants load-bearing AI, this is the weakest of my T02 ideas and I am not going to pretend otherwise.
**NOT AI.** The estimator, the cost matrix, the threshold sweep, the ledger.

**Batch metric.** Over 2,000 synthetic transactions with known fraud labels *and* known would-have-converted labels: **net rupee ledger at the incumbent threshold vs the optimised threshold, with a confidence interval, plus the ablation showing what a depth-1 decision stump achieves** (per `FIELD_BAR.md` Opening 1 — the field-wide fatal flaw is nobody checks their label isn't a restatement of their features).

**Escapes the collision (E5).** Vulcan claims *"5x improvement identifying fraudulent/disputed transactions **without more false positives**"* (AWS PR, `razorpay_ai_signals.md` §4). This system is the instrument that would *verify* that claim. Building the measuring device for the incumbent's headline metric is a different product from building a competitor to it — and it lands squarely on the verification-capacity thesis Razorpay states in its own Track 04 why-now.
**Technical depth.** Counterfactual estimation with an honest treatment of the unobservable; this is where `vaibhav375`'s real-data kill-gate idea (`FIELD_BAR.md` §5 item 7) would be borrowed.
**5-scene demo.** 1. A fraud dashboard proudly showing "₹4.2L fraud blocked". 2. The same month re-rendered as a signed ledger: `−₹18L`. 3. Threshold sweep; the optimum is *looser* than the incumbent. 4. Ablation table incl. the one-feature stump. 5. What broke.
**Competitors.** None in-field doing the negative side (`FIELD_BAR.md` records zero repos running honest baselines or ablations).
**Track.** Primary T02 · Secondary T05.

---

## Idea 4 — **Empty Box** (return-abuse adjudicator) — *deliberately plain*

**Pitch.** Score returns for abuse before the refund fires, using return history, item mix and the delta between what was claimed and what came back.

**Problem.** Return fraud is high-volume, low-value, and manual review does not scale to it.
**Why it matters — corpus.** NRF *2025 Retail Returns Landscape*, PRIMARY (`08_market/risk_problems.md` §4.1): **$849.9bn returned, 19.3% of online sales, 9% of all returns fraudulent**; rising tactics *"overstated quantity of returns (71%), empty box or 'box of rocks' (65%), decoy returns such as counterfeit items (64%)"*; **45% of consumers think "bending the truth" on a return is acceptable**; and **"85% said they are employing AI to detect or prevent return fraud."**
⚠️ NRF is US. India return-fraud rate is `EVIDENCE NOT FOUND`. Redseer's 15–20% fashion return rate is `[UNVERIFIED FETCH]`.

**AI role.** Weak. This is gradient boosting on tabular features plus a small LLM pass on return-reason free text. **Marked honestly: mostly not an AI-necessity idea.**
**Batch metric.** Precision/recall on a held-out set of 500 synthetic returns, with cost matrix `C_FP = lost customer LTV`, `C_FN = item value + two shipping legs`.
**Escapes the collision — ❌ `COLLIDES` (partially).** Agent Studio has RTO Shield and RTO Insights; Vulcan names *"RTO risk intelligence for COD orders"* as one of four functions. Post-delivery *return* abuse is adjacent-but-not-identical to pre-shipment *RTO* risk, which is a thin escape and probably not thin enough. **The 85%-of-retailers-already-use-AI fact cuts both ways: it proves the category, and it proves the category is full.**
**Why it's in the pool.** It is the highest-scoring idea on measurability and the lowest on differentiation. The pool needs that corner occupied to calibrate.
**Track.** Primary T02.

---

## Idea 5 — **Payout Ring Sentinel** (defence-only, money-out side)

**Pitch.** Detect coordinated beneficiary rings on the *payout* side — the direction RazorpayX moves money and the direction the fraud research is thinnest.

**Problem.** Everyone models money-in fraud. Money-out — vendor payouts, refunds to new beneficiaries, payroll to freshly-added accounts — is where mule networks actually land.
**Why it matters — corpus.** RBI built **MuleHunter.ai** and had **23 banks live as of 17 Dec 2025**, and is building the **Digital Payments Intelligence Platform** to *"leverage artificial intelligence to flag risky transactions"* (`08_market/risk_problems.md` §1.2). The corpus's own read: *"the regulator has publicly conceded that AI is the right tool for this class of problem and is deploying it itself."* Coordinated multi-account abuse is regulator-acknowledged in India even without a published rate (§5: *"`EVIDENCE NOT FOUND` — no credible quantified data for India. Do not assert a number."*).
**AI role.** Graph embedding + community detection over the beneficiary graph; LLM only to write the escalation narrative.
**NOT AI.** Every hard rule (velocity, new-beneficiary-plus-large-amount, round-number detection) stays deterministic and is reported as a separate baseline.
**Batch metric.** Ring-level precision/recall on 50 planted rings inside 5,000 synthetic payouts — **plus the ablation `FIELD_BAR.md` §Opening 6 shows nobody runs**: delete the graph edges entirely and re-report. `MrBurber/KinGraph` is the cautionary tale here — deleting all identifier edges reproduced its result byte-identically. Publishing that ablation *is* the contribution.
**Escapes the collision (partial).** Agent Studio has no payout-risk agent; Vulcan is described as network-level fraud detection on *payments*. But RazorpayX Payouts already advertises AI-optimised verification. **Medium-strength escape.**
⚠️ **Track 02 disqualifier check:** *"Strictly defense-only: anything offense-capable is disqualified."* A ring detector is defence; a ring *generator* for synthetic data is arguably offence-adjacent. The generator must be kept in a clearly-labelled test fixture and the README must address this head-on.
**Track.** Primary T02 · Secondary T04.

---

## Idea 6 — **Not A Bot, Not A Human** (agent-traffic risk triage)

**Pitch.** Every fraud heuristic fires the wrong way on a legitimate AI shopping agent; build the triage layer that tells them apart, in both directions.

**Problem.** Representment and fraud scoring rest on human-presence signals — IP, device fingerprint, AVS, session behaviour, prior history. An agent transaction breaks all of them at once: data-centre IP, no browsing session, no behavioural history. Existing engines are *designed* to reject exactly that signature.
**Why it matters — corpus.** `08_market/market_problems.md` #13, honestly labelled `[INFERENCE] / —` (reasoned, not measured): *"Cuts both ways: agentic traffic looks like fraud, and fraud can hide inside agentic traffic."* Supported by the live finding that four major Indian D2C brands serve UCP profiles with **card-only** payment handlers (`07_razorpay_winning_intersection/THE_UPI_HOLE.md`), i.e. agent traffic is already arriving at Indian merchants.
**Magnitude:** `HYPOTHESIS — unevidenced`. There is no measured volume of agent traffic at Indian merchants in the corpus.
**AI role.** Classify request provenance from a bundle of weak, individually-useless signals plus signed-mandate presence; the decision space is `HUMAN / VERIFIED-AGENT / UNVERIFIED-AGENT / ADVERSARY`.
**Batch metric.** 4-class confusion matrix over 1,000 synthetic sessions, with the headline being **the false-decline rate on the VERIFIED-AGENT class** — the class a conventional engine gets wrong by construction. Include a run of a *conventional* rules engine on the same batch to show it failing.
**Escapes the collision (strong).** Agent Studio serves merchants; Agentic Payments serves the buy side; Vulcan's release contains **no mention of agentic commerce or any agent protocol** (`razorpay_ai_signals.md` §4, explicit note: *"They have not (publicly) fused them."*). The seam between the risk brain and the agent stack is unoccupied.
**Track.** Primary T02 · Secondary T01. **This is the T02 idea that most threatens T01's uniqueness argument — it takes T01's strategic ground and puts it on T02's measurable footing.**

---

## Idea 7 — **Tautology** (adversarial label auditor) — *deliberately too-ambitious / meta*

**Pitch.** A harness that attacks a risk model's own headline number: hunts for the one-feature stump, the single comparison, the regex and the majority-class baseline that reproduce its labels — and fails the build if one of them gets close.

**Why it matters — corpus.** `FIELD_BAR.md` Opening 1, verified across **every measured repo in the field**: `SaxenaLakshya`'s depth-3 tree recovers **99.18%** of labels; `komallbarhate`'s `days_to_estimated <= 2` scores **AUC 0.9435 / $58,705** vs the LightGBM's **0.8615 / $50,250** — one subtraction beats the whole stack by $8,455; `abhinav-phi`'s holdout is **accuracy 1.0, 500/500, perfectly diagonal, with the LLM off**. Verdict in the corpus: *"the field has learned to measure carefully. It has not learned to check what it is measuring."*
**Why it's too-ambitious/wrong-shaped.** It is a *tool for hackathon judges*, not a merchant product. It fails rubric pillar 1 ("did you pick something that actually matters" — to a *business*). **Kept because the technique belongs inside every other idea in this pool as a component, not as the product.** Every idea above and below should ship this as ~30 lines of `sklearn.tree.DecisionTreeClassifier(max_depth=1..3)`.
**Track.** T05 if anything. **Do not submit. Do steal.**

---

# TRACK 03 — AI REVENUE RECOVERY

---

## Idea 8 — **Business Decline Triage** ("it isn't your bank's fault") ⭐ best evidence in the pool

**Pitch.** Twelve percent of Indian UPI payments fail because of the *customer's* state — no balance, wrong PIN, limit exceeded — and every tool in the market responds by retrying or rerouting, which cannot possibly help; this classifies the actual reason and picks the only intervention that can.

**Problem.** NPCI splits UPI failure into **Technical Decline** (systems/network) and **Business Decline** (wrong PIN, insufficient balance, per-day limit exceeded, invalid beneficiary). The industry solved TD — it is ~0.8% and NPCI's CEO says so. BD was left to the customer, and it is an order of magnitude larger. **Rerouting to another gateway does not create money in the payer's account.**

**Target user.** Any Indian merchant with meaningful UPI volume — which is nearly all of them.

**Why it matters — corpus.** `08_market/payment_problems.md` §1.3, Dataful #445 (source field: NPCI), **July 2026 bank-wise remitter data**, all `[FACT]`:
- **All 10 publicly-visible banks exceed OC-149's 5% BD target. Five exceed 10%.**
- **Airtel Payments Bank: 72.56% approved, 26.97% BD, 0.47% TD.**
- Volume-weighted across those 10: **12.52% BD vs 0.39% TD** — BD is **32×** TD.
- Historical corroboration (Finbox on NPCI top-50, Mar 2022→Mar 2023): **"81.7% of the total failed transactions were attributed to 'business decline'"** vs 18.26% technical.
- ⚠️ **Coverage caveat that must appear on the slide:** those 10 rows are the alphabetical A–C preview of the top-50 table and **exclude SBI, HDFC, ICICI, Paytm, Yes/PhonePe**. Any average over them is unrepresentative. The defensible claim is the *composition* one, not a system-wide rate.

**Solution.** Classify the decline into a BD taxonomy from the raw issuer/PSP response, then choose from a small, honest action set: **retry-later-with-a-predicted-hour** (insufficient funds — when does this payer usually have balance?), **switch instrument** (limit exceeded — the daily UPI cap is per-payer-per-rail, so a card or a different VPA genuinely helps), **re-collect via link** (wrong PIN — a human error that a retry repeats), **stop** (invalid beneficiary — nothing will fix this, do not spend a contact on it). The last one is the important one: **the system's most valuable output is "do nothing".**

**AI role (load-bearing).** Two places, both shape-B or shape-C:
1. **Decline-string normalisation.** Issuer/PSP failure descriptions are unbounded free text that differ per bank and per PSP; mapping them onto a bounded BD taxonomy is the classic messy-surface-form-to-clean-decision problem. A regex table gets the common ones and silently mislabels the tail — and I would *publish* the regex table's accuracy alongside the model's, per `FIELD_BAR.md` Opening 1.
2. **Retry-hour prediction for insufficient-funds.** Conditioned on payer history, ticket size, day-of-month (salary cycles), instrument and bank. This is a ranking problem over a continuous action space, not a rule.
**Where I would deliberately NOT use AI.** The action selection itself — once the BD class is known, the mapping to an action is a **deterministic policy table**, and it must be, because it is the thing that spends money and contacts customers. Also: no LLM anywhere in the money path, enforced by an AST import test in CI (borrowed from `vaibhav375`'s `test_kernel_no_llm_imports.py`, with its vacuity guard).

**Razorpay role.** Payments API failure codes; Payment Links for re-collect; test-mode failure injection is well supported.

**Batch metric.** Over 1,000 synthetic declines calibrated to the NPCI BD/TD composition: **(a)** BD-class accuracy vs a regex baseline **and** vs a depth-1 stump; **(b)** recovery rate vs *three* baselines — do-nothing, a **tuned** naive retry (t, +1h, +2h), and Razorpay's own published behaviour as a reference point; **(c)** the metric I actually care about: **contacts saved** — the number of customers *not* messaged because the class was `invalid beneficiary` or `wrong PIN`, since suppressed contacts are pure margin. Confidence interval on all three.

**Escapes the collision (E2 + a genuine capability gap).** This is the sharpest escape argument in the pool and it is worth stating precisely:
- **Optimizer / Smart Router** routes across gateways using a random forest over 1bn transactions. **Routing cannot fix business decline** — the payer's bank did not fail, it refused. Razorpay's own Optimizer page frames its value as failover and downtime response.
- **Vulcan** does *"hyper-precision real-time routing"* and claims **8–10% SR improvement** — again a routing/authorisation-optimisation claim, on the *pre-authorisation* decision.
- **Subscription Recovery** works on recurring mandates, not one-off checkout declines.
- **Intelligent Retry Engine** (Sprint 26) retries — and the whole point of the BD taxonomy is that **retrying is the wrong action for 2 of 4 BD classes**.
So the escape is not "we do it better"; it is **"the shipped stack optimises the authorisation decision and the retry schedule, and business decline is downstream of both."** A judge can check that claim against their own product in thirty seconds, which is exactly why it is worth making.

**Technical depth.** Decline taxonomy construction; a simulator seeded from *public NPCI bank-wise BD/TD* so the synthetic distribution has an external anchor — which is the `vaibhav375` real-data kill-gate move (`FIELD_BAR.md` §5 item 7) and would be **the only such anchor in the T03 field**.

**5-scene demo.**
1. **BEFORE** — 40 failed UPI payments; a conventional dashboard says "40 failures, retry all". Money lost: ₹X.
2. **AI REASONING** — the classifier splits them: 22 insufficient-funds, 9 limit-exceeded, 6 wrong-PIN, 3 invalid-beneficiary. Side-by-side, the regex baseline mislabels 7 of them and you can see which.
3. **ACTION** — 22 scheduled to a *predicted hour*, 9 offered a card, 6 sent a fresh link, **3 explicitly abandoned with a reason**. "We are not going to contact these three. Here's why."
4. **RESULT** — recovery vs three baselines with CIs, plus contacts-saved, plus the honest line: the tuned naive baseline gets uncomfortably close on one class.
5. **WHAT BROKE** — the real one.

**Differentiation.** 24% of the field is in T03 and essentially all of it is doing retry-and-message. The BD/TD distinction is public NPCI data that almost nobody has read.
**Competitors.** Agent Studio Subscription Recovery; Intelligent Retry Engine; `abhinav-phi/reflex` (rules-first + LLM root-cause — closest in-field, and its holdout is circular).
**Track.** Primary T03 · Secondary T02.

---

## Idea 9 — **The Twenty-Four Hour Window** ⭐ best demo in the pool

**Pitch.** RBI now forces every subscription merchant in India to warn every customer 24 hours before every charge — a regulator-mandated cancellation prompt — and that same notice is 24 hours of advance warning that nobody is using to save the payment.

**Problem.** Recovery agents are post-failure by definition. But India's e-mandate regime hands merchants something no Western dunning stack has: a **scheduled, universal, legally-required moment before every debit**, at which the outcome is still changeable. Right now that moment is used only to increase churn.

**Target user.** Indian subscription merchant — SaaS, OTT, insurance, edtech, D2C replenishment.

**Why it matters — corpus.** RBI Master Direction *"Digital Payments – E-mandate Framework, 2026"*, **RBI/DPSS/2026-27/396, dated 21 April 2026**, fetched from rbi.org.in, PRIMARY (`08_market/revenue_leakage_problems.md` §1.1):
- Pre-debit notification must be sent **"at least 24 hours prior to the actual charge / debit"**, containing merchant name, amount, debit date/time, e-mandate reference and reason.
- AFA required above **₹15,000** (₹1,00,000 for insurance/MF/credit-card bills).
- AFA required to register, modify **or withdraw** a mandate; customer may opt out of a particular transaction using AFA.
The corpus's own inference, which I am adopting: India's regime creates *"(a) an AFA cliff at a fixed rupee threshold, and (b) a **regulator-mandated daily churn prompt**. Both are predictable in timing."*
⚠️ The UPI Autopay failure rate (8–15%) and the SBI ~70%-fail claim are `[UNVERIFIED FETCH]` ⚠️ VENDOR. **Do not use them.** The RBI framework is the evidence.

**Solution.** A T−24h agent. For every mandate entering its notice window: predict failure probability *and cause*; predict cancellation probability given the notice; then choose one bounded pre-emptive action — **do nothing** (most cases), **shift the debit date** to a predicted-liquidity day, **split the charge** below the AFA threshold where the plan permits, **downgrade-offer** where cancellation risk dominates, or **pre-warm** with a balance-check nudge. Then measure against the notices where it deliberately did nothing.

**AI role (load-bearing).** A **joint** prediction over two competing risks — *will this debit fail* and *will this notice cause a cancellation* — where the optimal action depends on which risk dominates and the two point to opposite interventions (a nudge that prevents failure also raises salience and may trigger cancellation). That is a genuine decision-theoretic problem, not a threshold.
**NOT AI.** The notice content and timing (statutory — must be exactly right, must be templated, must be deterministic), the AFA threshold arithmetic, and the eligibility rules for splitting/rescheduling.

**Razorpay role.** Subscriptions + UPI Autopay + e-Mandate APIs. **This is the one loss event genuinely manufacturable in a sandbox**, which makes it the most honest demo in the pool.

**Batch metric.** Over 300 synthetic mandates through 2 cycles: **(a)** failure-prediction AUC at T−24h vs a naive "failed last time" baseline; **(b)** the headline — **net retained value = (charges saved) − (cancellations induced)**, with the induced-cancellation count reported as a *first-class negative*, because the intervention has a real downside and no vendor ever reports it; **(c)** the count of notices where the agent chose no action, and the outcome of that subset.

**Escapes the collision (E2, cleanly).** Agent Studio's Subscription Recovery *"analyses failed payments, triggers retention"* — its trigger is the failure. UPI Autopay ships *"intelligent retry mechanisms for failed payments"* and a *"Renewal Shield (coming soon)"* for reminders (`razorpay_product_signals.md` §1.6). **Every one of those is at or after T=0.** This system's entire operating region is T−24h→T−0, an interval that exists *because a 2026 regulation created it*, and which the shipped product's own descriptions place outside their scope. That is a timing gap, not a quality claim, and timing gaps are checkable.

**Technical depth.** Competing-risks modelling; a statutory-content generator that must be provably deterministic; mandate state machine.

**5-scene demo.**
1. **BEFORE** — the RBI circular on screen, the "at least 24 hours prior" clause highlighted. Then a real pre-debit notice, and a cancel click. *"The regulator made you send this. It is the best-timed churn prompt in the world and you're paying for it."*
2. **AI REASONING** — a mandate at T−24h: `P(fail)=0.71` (insufficient funds, salary lands on the 2nd, debit is on the 30th), `P(cancel|notice)=0.09`. Failure risk dominates → reschedule.
3. **ACTION** — debit moved to the 3rd; notice regenerated with statutorily-correct content; a second mandate where `P(cancel)` dominates gets **no action and a logged reason**; a third crossing ₹15,000 is flagged for the AFA cliff.
4. **RESULT** — batch table: charges saved, **cancellations induced (shown, not hidden)**, net retained value with a CI, and the no-action subset's outcome.
5. **WHAT BROKE** — the real one.

**Competitors.** Agent Studio Subscription Recovery (ElevenLabs); Renewal Shield; the entire dunning category — all post-failure.
**Track.** Primary T03 · Secondary T04.

---

## Idea 10 — **The Fifteen Thousand Cliff**

**Pitch.** Every recurring charge above ₹15,000 drops out of the automated flow into an interactive authentication step at a moment the customer did not choose; this restructures the billing book so fewer charges cross the line.

**Problem.** A fixed rupee threshold in a regulation is a discontinuity in a merchant's revenue. Nobody manages their billing book *against* it.
**Why it matters — corpus.** Same RBI primary as #9: general AFA-free ceiling **₹15,000/transaction**; elevated **₹1,00,000** for insurance premiums, mutual fund subscriptions and credit-card bills (`revenue_leakage_problems.md` §1.1). Also relevant: Razorpay Sprint 26 ships *"Higher card auto-debit limits (₹1 lakh)"*, confirming the threshold is live product surface.
**Solution.** Scan the mandate book; identify charges crossing the cliff; propose legal restructurings — split into two sub-₹15,000 debits where the plan allows, re-anchor the billing date, move the customer to a category with the ₹1L ceiling where genuinely applicable, or accept the AFA and pre-warm the customer.
**AI role.** **Weak, and I'll say so.** Threshold detection is arithmetic. The only defensible AI use is classifying a merchant's plan catalogue (free text, inconsistent naming) into "splittable / not splittable" and judging whether a product genuinely falls in an exempt category — a compliance judgement over free text. **This is a `WHERE_WE_DID_NOT_USE_AI.md` idea more than an AI idea.**
**Batch metric.** Over 200 mandates: **share of annual charge-volume crossing the AFA cliff before vs after restructuring**, plus the count of restructurings the system **refused** as non-compliant.
**Escapes the collision (E2).** No shipped agent operates on the *structure of the billing book*; they operate on individual events. Clean but narrow.
**Weakness.** Possibly too plain, and the restructuring may be commercially unacceptable to real merchants (splitting a charge changes the product). **Marked as a component of #9 rather than a standalone.**
**Track.** Primary T03.

---

## Idea 11 — **Payer's Conscience** (Section 43B(h) payables agent) ⭐ cleanest structural escape

**Pitch.** Since 1 April 2024, paying a small supplier late costs the *buyer* its own tax deduction — so build the agent that sits on the payables side and tells a company which of its own invoices are about to become a tax event.

**Problem.** ₹7.34 lakh crore is frozen in MSME receivables. Every product built for it chases the *creditor's* side: reminders, dunning, factoring. But the incentive changed on the *debtor's* side, and nobody has moved there. The buyer now needs to know, per invoice: is this supplier Udyam-registered as micro or small? What is the applicable clock — 15 days or the agreed date capped at 45? Which invoices breach it this quarter? What is the deduction disallowance if they do?

**Target user.** Finance controller at a mid-size Indian buyer with hundreds of suppliers — precisely RazorpayX's customer.

**Why it matters — corpus.** `08_market/revenue_leakage_problems.md` §2:
- **₹7.34 lakh crore as of March 2024** in delayed MSME payments — *Delayed Payments Report 3.0*, GAME + FISME + C2FO, fetched from fisme.org.in. ⚠️ **Publisher affiliation must be flagged on the slide**: GAME and FISME are MSME-advocacy bodies and C2FO sells working-capital finance; all three benefit from a large number.
- Scale framing `[INFERENCE, working shown]`: ≈ **a quarter of one month of total UPI throughput** (₹29.88 lakh crore, July 2026), permanently frozen rather than circulating.
- **Section 43B(h)**, Finance Act 2023, effective **1 April 2024**: if the supplier is Udyam-registered micro/small, the buyer must pay within 15 days absent a written agreement, or by the agreed date capped at **45 days** (MSMED Act s.15); **the buyer cannot claim the income-tax deduction until the MSME is actually paid**; plus compound interest at three times the RBI bank rate. The corpus's own read: *"Before FY2024-25, paying an MSME late was a working-capital decision. After 43B(h), it is a tax event that hits the buyer's own P&L."*
- The statutory remedy is broken: MSME Samadhaan has disposed **~19.6% of applications and ~14.7% of disputed value** `[INFERENCE]` — *"the formal statutory remedy resolves roughly one case in five. That is the argument that the problem must be solved upstream."*
- Razorpay's own PR figure, for comparison: **"₹8.1 trillion is estimated to be locked in delayed payments to MSMEs in India"** (RazorpayX AI Agents PR, 2026-06-01).

**Solution.** Ingest the payables ledger and supplier master. For each invoice: **(1)** classify the supplier's MSME status from whatever the ledger actually contains (a name, a GSTIN, sometimes a Udyam number, often nothing); **(2)** extract the agreed payment term from the contract/PO free text; **(3)** compute the statutory clock deterministically; **(4)** rank the payment run by *tax exposure per rupee paid*; **(5)** produce a gated payment schedule and a disallowance forecast.

**AI role (load-bearing, shape A+B).**
- **Supplier identity resolution** — the payables ledger names "Sharma Ent.", "Sharma Enterprises Pvt Ltd", "SHARMA ENT (VENDOR)"; the Udyam register names something else. This is entity resolution across records with no shared key. It is the single hardest thing in the build and it is unambiguously not a `LIKE '%sharma%'` query.
- **Payment-term extraction** from unstructured contract/PO text, where "Net 45 from GRN" and "45 days from receipt of goods" and "payment within six weeks" are the same term.
**Where I would deliberately NOT use AI.** The 15/45-day arithmetic, the interest calculation, the disallowance computation, and the payment gate. Tax arithmetic that is 99% right is worse than useless; it goes in a pure function with property-based tests and no model anywhere near it. This is the single strongest `WHERE_WE_DID_NOT_USE_AI.md` row available in the whole pool, because the *cost* of the rule is legible: we give up handling ambiguous term language, and we escalate those to a human instead of guessing.

**Razorpay role.** RazorpayX Vendor Payments / payables ledger; Payouts as the gated money action.

**Batch metric.** Over 300 synthetic payables against a synthetic Udyam register with **deliberately planted hard cases** (name variants, split entities, a supplier that de-registered mid-year, a supplier registered as *medium* and therefore out of scope):
**(a)** supplier-classification precision/recall — with the **false-positive cost named**: wrongly classifying a supplier as micro/small forces an unnecessary early payment and destroys working capital, which is the expensive error and the one nobody measures;
**(b)** breach-detection recall against ground truth;
**(c)** an **attrition ledger** — `N_in → N_classified → N_scheduled` with every drop reason, per `FIELD_BAR.md` Opening 5.

**Escapes the collision (E1 — the cleanest in the pool).** Razorpay's Receivables Agent *"follow[s] up on unpaid invoices and send[s] timely payment reminders"* — **it is the creditor's agent.** Cashflow Forecaster forecasts *your* position. Vendor Payments does OCR, TDS and approvals but has no MSME-clock or 43B(h) logic in anything the corpus records. There is no shipped Razorpay agent whose principal is the *payer facing a statutory deadline*. This is not a quality claim or a timing claim — it is a **different principal**, and it is the escape a judge is least able to argue with.

**Technical depth.** Entity resolution; statutory date arithmetic with holiday/GRN edge cases; ranked payment scheduling under a cash constraint.

**5-scene demo.**
1. **BEFORE** — a 300-row payables ageing report. *"Somewhere in here are the invoices that will cost you your tax deduction. Your ERP does not know which, because it does not know which of your suppliers are Udyam-registered micro enterprises."*
2. **AI REASONING** — entity resolution on three genuinely nasty supplier names, shown live, including one the system **refuses** to resolve and escalates.
3. **ACTION** — the payment run re-ranked by tax exposure per rupee; ₹X of payments moved forward; a disallowance forecast with and without the change.
4. **RESULT** — classification precision/recall with the false-positive (over-early-payment) cost stated; attrition ledger reconciling 300 → scheduled.
5. **WHAT BROKE** — the real one. (Prediction: the Udyam matching is where it breaks, and that is a *good* failure story.)

**Competitors.** Agent Studio has none on this side. Vendor-side: Recordent, C2FO — all creditor-side. **The nearest in-field competitor is nobody.**
**Track.** Primary T03 · Secondary T04. **This is my strongest candidate to beat Track 01 on problem taste.**

---

## Idea 12 — **Promise Keeper** (promise-to-pay verifier)

**Pitch.** A debtor says "I'll pay Friday"; this predicts whether they will, so collections effort goes only to the promises that won't be kept.
**Problem.** Collections teams chase everyone equally. Most promises are kept; chasing a customer who was going to pay anyway costs relationship capital and staff time.
**Why it matters — corpus.** Razorpay names *"Promise-to-pay tracker"* as an explicit Track 03 example direction (`current_buildathon.md` §Track 03) — which is a signal of interest and simultaneously a warning that the obvious version is expected. The underlying receivables pain is the ₹7.34 lakh crore figure above. **Magnitude of promise-breakage specifically: `HYPOTHESIS — unevidenced`.** The corpus has no data on promise-to-pay kept rates in India.
**AI role.** Extract the promise (date, amount, conditionality) from free-text comms — genuinely shape-B — then predict keeping. Prediction is tabular.
**NOT AI.** Escalation ladder, contact-frequency caps, and the stopping rule.
**Batch metric.** Over 200 promises: precision/recall on "will break", plus **contacts saved** vs chase-everyone, plus the cost of a false "will break" (an unnecessary chase to a good customer).
**Escapes the collision — ⚠️ weak.** Razorpay's Receivables Agent already does automated invoice follow-ups. The escape would be "we decide *not* to follow up", which is real but thin, and it's a Razorpay-named example direction so the field will be full of it.
**Track.** Primary T03. **Marked: good component, weak standalone.**

---

## Idea 13 — **Counterfactual Recovery Ledger** — *deliberately plain, rubric-maximal*

**Pitch.** Every recovery number in this competition will be gross and baseline-free; this one holds out a randomised control group and reports incremental rupees only.
**Why it matters — corpus.** `FIELD_BAR.md` Opening 2: *"Every uplift claim in the field rests on a baseline the same author designed to lose."* Worked example: `shubhambhattog`'s **6.38× uplift** comes from a baseline retrying at t/+1h/+2h while the generator sets funds arrival at **t+12–96h** — the baseline recovers 0% of the largest archetype *by construction*, from two constants the same author chose, undisclosed in the simulation doc. And `track_scorecard.md` on T03: *"Most of the field will report gross recovery with no baseline — exactly the cherry-pick the bar warns against."*
**AI role.** **None load-bearing.** This is an evaluation methodology, and its honesty is the product.
**Batch metric.** Incremental recovery with a CI over a randomised holdout; three baselines published (do-nothing, tuned-naive, best trivial rule).
**Escapes the collision — ❌ `COLLIDES` with the field, not with Agent Studio.** `vaibhav375/recovery-ledger` is already doing exactly this, with Criteo/Hillstrom validation, and is the single strongest repo `FIELD_BAR.md` examined. **Do not build this as the product. Build it as the measurement layer of #8 or #9.**
**Track.** T03.

---

## Idea 14 — **Hinglish Voice Recovery** — *included only to be ruled out*

**Pitch.** A Hinglish voice agent that calls customers to recover failed payments.
**Escapes the collision — ❌ `COLLIDES` completely, twice over.** (i) Razorpay names *"Hinglish voice recovery"* as a Track 03 example direction. (ii) Agent Studio's **Subscription Recovery agent is built with ElevenLabs**, and Razorpay has shipped Agentic Payments for Voice-AI with **Gnani.ai, SuperU and Zomato Nugget**, plus a **Sarvam AI** partnership specifically for Hindi/Hinglish multilingual agents inside Agent Studio (`razorpay_ai_signals.md` §2, §4). (iii) The largest repo in the entire enumerated field is `manimimohit-glitch/voice-recovery-agent`, 87 MB, *"Hinglish AI voice agent for failed-payment recovery"* (`THE_ACTUAL_FIELD.md`).
**Verdict.** The most-collided idea it is possible to have in this competition. **Recorded so it is never accidentally reinvented.**
**Track.** T03.

---

## Idea 15 — **Abandonment Cause Attribution** — *plain*

**Pitch.** Split cart abandonment into the payment-addressable slice and the rest, and only act on the addressable part.
**Why it matters — corpus.** Baymard Institute meta-analysis of **50 studies**, updated Sep 2025, PRIMARY: **70.22%** average documented cart abandonment; payment-addressable reasons **site errors/crashes 17%, card declined 10%, too few payment methods 9%** (`08_market/payment_problems.md` §10 claim 3). ⚠️ Note the corpus's kill-list: *"Baymard: 48% abandon due to extra costs"* is **superseded**; current is 40%.
**AI role.** Weak-to-moderate — session-sequence classification.
**Escapes the collision — ❌ `COLLIDES`.** Agent Studio ships Abandoned Cart Conversion in two flavours; Magic Checkout and Konnect both ship cart recovery; Vulcan does checkout personalisation. **The most-occupied square on the board after voice.**
**Kept because:** the *attribution* framing (deciding which abandonments are payment-caused and therefore worth a payment intervention) is a genuinely different question from *recovering* abandonment, and a thin version of it belongs inside #8. As a standalone: no.
**Track.** T03.

---

# TRACK 04 — AI FINANCE CONTROLLER

---

## Idea 16 — **Four Files, One Rupee** ⭐ best pure demo in the pool

**Pitch.** Put four files on screen that all describe the same rupee and cannot be joined — ERP order, bank credit, PG settlement, marketplace payout — and then join them, with an exception ledger that admits everything it could not.

**Problem.** No two of those four share a primary key, a granularity, or a timestamp convention. Between the order and the bank credit sit MDR, TDS u/s 194-O (1%), GST TCS, refunds netted from two cycles ago, chargebacks debited separately, and rolling reserve that is *neither in the bank nor in receivables*. So it is done in Excel, everywhere, forever.

**Target user.** Finance team at any Indian merchant selling across own-site + marketplace + offline.

**Why it matters — corpus.** `08_market/finance_ops_problems.md` §2, and `market_problems.md` #6 — where the corpus makes an unusually strong claim: *"**No credible statistic exists — and that is the honest finding.**"* And then: *"this is the strongest **demo** in the pack… Showing four files that cannot be joined is more persuasive than any statistic."* And in §6 of the same file: *"**Do not lead with a productivity statistic.** Lead with the artefact."*
⚠️ Explicitly do **not** use: the 6.4-day close median (`[UNVERIFIED FETCH]`, APQC primary not located), the 30–40% vs 40–50% reconciliation-share figures (two vendors disagreeing by 20 points), or any "hours saved". The corpus killed all of them.
**The one defensible hook** is structural, not statistical: **"3–5 different systems"** — *"because it is structural rather than statistical, and it is exactly what makes reconciliation a matching problem rather than a data-entry problem."*

**Solution.** A three-tier matcher. **Tier 1:** exact deterministic joins on any key that does exist (UTR, order ID, payment ID) — and *measure what fraction Tier 1 alone gets*, because that is the honest baseline. **Tier 2:** deterministic amount-and-window matching with fee/TDS/TCS/GST reconstruction — still no model. **Tier 3:** the residual, which is where a model earns its place: fuzzy many-to-many over records with drifted timestamps, netted refunds spanning cycles, and partial settlements. Then an **exception ledger** that reconciles `N_in → N_matched → N_exception` with a named reason per exception.

**AI role (load-bearing on the residual only, shape A).** Candidate generation and match scoring for the many-to-many residual — one bank credit against a set of settlements against a set of orders, where the correct grouping is not derivable from any key. Plus a natural-language explanation per exception (*"this ₹4,812 credit is short by exactly the 1% 194-O TDS on the 3 October marketplace batch"*), which is what turns an exception into an actionable item.
**Where I would deliberately NOT use AI.** Tiers 1 and 2 — with an AST test failing the build if an LLM import appears in the matching kernel. **And this is the honest cost:** by refusing a model in Tier 2 I give up some matches that a fuzzy scorer would have caught, and I would publish exactly how many. That column is the whole argument for pillar 3.

**Razorpay role.** Settlement reports, settlement recon details (`fetch_settlement_recon_details` exists in the MCP tool surface per `THE_GAP.md` §1), payments and refunds. ⚠️ **`SANDBOX RISK`: settlements do not occur in test mode.** Mitigation: generate the four artefacts synthetically with a documented generator, and be aggressively loud that they are synthetic — per `FIELD_BAR.md`, the field's characteristic sin is a compromised measurement target that is disclosed on page 8 rather than page 1.

**Batch metric.** Track 04's bar names it: **50+ records**. I would run **1,000+**: **match rate by tier** (so Tier-1-only is visible as the trivial baseline), **precision of Tier-3 matches against planted ground truth** (a fuzzy matcher that matches everything is worthless), **unresolved-exception count with a reason histogram**, and the **ablation** — delete Tier 3 entirely and re-report, which nobody in the field does (`FIELD_BAR.md` Opening 6).

**Escapes the collision (E5, moderately).** Agent Studio's **Settlement Insights** is *"daily payout summaries via WhatsApp"* — a summariser over data that is already joined. **Cashflow Forecaster** predicts a position. RazorpayX's **Bookkeeping** and **Reporting** agents are named in Sprint 26 but the corpus records `EVIDENCE NOT FOUND` at page level for their capabilities. Optimizer's Single View Reconciliation is a **cross-PG view**, i.e. it unifies Razorpay's own and other PGs' transaction records — it does not join the merchant's ERP or a marketplace payout report.
**Honest assessment of this escape: it is the weakest of my three headline ideas.** Razorpay is visibly moving here (Source-to-Pay already claims 3-way PO-GRN-Invoice matching and *"GST Input Tax Credit verification against filings"*). The defensible framing is not "they don't do recon" — it is **"the ERP↔marketplace↔bank join is outside the PG's data boundary, and the exception ledger is the product."**

**Technical depth.** Tiered matching; fee/tax reconstruction arithmetic; many-to-many assignment; exception taxonomy.
**AI-necessity honest note.** `track_scorecard.md` scores T04's AI leverage **6/10, the weakest of any track**, with the reasoning *"Reconciliation is largely deterministic matching."* I agree. The Tier-3 residual is real AI, but if the residual turns out to be 4% of records, the AI is 4% load-bearing — and I would have to report that. **That is either the best pillar-3 answer in the competition or a fatal thinness, depending entirely on how big the residual actually is. It is measurable on day 2 and should be measured before committing.**

**5-scene demo.**
1. **BEFORE** — four files side by side, same rupee, four different amounts, four different dates, no shared column. Ten seconds, no narration needed. *This is the strongest single visual in the entire pool.*
2. **AI REASONING** — Tier 1 clears 61%. Tier 2 clears another 27%. Then one genuinely ugly residual case, reasoned aloud: a bank credit that is three settlements minus a refund from two cycles back minus 194-O TDS.
3. **ACTION** — matched ledger written; 4 exceptions **escalated, not guessed**.
4. **RESULT** — match rate by tier, Tier-3 precision, exception reason histogram, and the ablation row showing what Tier 3 actually bought.
5. **WHAT BROKE** — the real one.

**Competitors.** In-field: `tfthushaar/razorpay_buildathon`, `SuryaSK-dev/razorpay-ai-finance-controller`, `Amritbiswas07/kosh-ai-finance-controller` — T04 is 10% of the field and this is the obvious build within it.
**Track.** Primary T04 · Secondary T03.

---

## Idea 17 — **"Your Supplier Just Filed Late"** (GSTR-2B timing adjudicator)

**Pitch.** Most GST input-credit mismatches are not fraud, they are a supplier who filed after the 11th — and telling those apart from genuinely missing invoices is a monthly, high-volume judgement call over near-duplicate records.

**Problem.** A business's input tax credit depends on *someone else's* filing behaviour. Where the GSTR-3B claim exceeds GSTR-2B beyond tolerance, the portal **auto-generates Form DRC-01C algorithmically, within days**. The taxpayer cannot fix this by being compliant.

**Target user.** Finance/tax lead at any GST-registered Indian business with hundreds of monthly purchase invoices.

**Why it matters — corpus.** `08_market/finance_ops_problems.md` §3.1, structural and consistent across Indian tax-practice sources: GSTR-2B is auto-populated from *suppliers'* GSTR-1; excess claim beyond tolerance auto-generates **DRC-01C**; *"Most mismatches are **timing, not evasion**: if a supplier files GSTR-1 after the 11th, or files under the QRMP scheme after the 13th, the ITC shifts into the next month's GSTR-2B."* The corpus's verdict: *"the correct answer is usually 'this is the same invoice, the supplier just filed late' — a judgement call over near-duplicate records."*
⚠️ **Magnitude is `EVIDENCE NOT FOUND` and the corpus says so explicitly** — GSTN/CBIC publish no DRC-01C volume; the only figure encountered was a vendor's *hypothetical worked illustration* which *"is not evidence of anything and must not be quoted."* **This idea must be pitched on mechanism alone.**

**Solution.** Ingest purchase register + GSTR-2B + prior months' 2B. Classify each unmatched invoice into: **timing (supplier filed late — will appear next month)** / **data error (GSTIN typo, invoice-number format, date convention)** / **genuinely absent (supplier has not filed at all)** / **our error (duplicate claim)**. Then produce a claim recommendation and a supplier-chase list ranked by rupees at risk.
**AI role (shape A+B).** Near-duplicate invoice matching across two registers that disagree on invoice-number formatting, date convention, rounding and line-item granularity — plus the *classification* of the mismatch cause, which is the actual judgement. A rule can match exact invoice numbers; it cannot decide that `INV/2026-27/0412` and `INV-412` from the same GSTIN for the same amount three days apart are the same document.
**NOT AI.** The tolerance arithmetic, the DRC-01C threshold logic, the claim computation, and the filing deadline calendar.
**Batch metric.** Over 500 synthetic purchase invoices against synthetic GSTR-2B with **injected timing skew and injected format noise**: mismatch-cause classification precision/recall per class, with the cost asymmetry stated — **claiming credit that isn't there triggers an automated notice; failing to claim credit that is there is a permanent cash loss.** Those are not symmetric and the threshold must reflect it.
**Escapes the collision (moderate).** Razorpay's Source-to-Pay claims *"GST Input Tax Credit verification against filings"* — a verification, i.e. a match/no-match. **The unoccupied part is the causal classification and the resulting action**: match/no-match tells you there is a problem; "your supplier filed on the 14th, this lands next month, do not claim it and do not chase them" tells you what to do. Real but not enormous.
**Technical depth.** High. Near-duplicate resolution with domain-specific normalisation.
**5-scene demo.** 1. 500 invoices, 43 unmatched, one auto-generated DRC-01C notice on screen. 2. The classifier splits the 43 into four causes; two genuinely hard cases reasoned aloud. 3. Claim adjusted; 6 suppliers chased; 11 invoices deferred to next month with dates. 4. Per-class precision/recall and the asymmetric cost table. 5. What broke.
**Track.** Primary T04 · Secondary T03.

---

## Idea 18 — **The TAT Auditor** (RBI ₹100/day compensation)

**Pitch.** RBI requires PSPs to compensate customers ₹100/day for late reversals **without waiting for a complaint** — so build the auditor that checks whether that actually happened.

**Why it matters — corpus.** RBI/2019-20/67, **DPSS.CO.PD No.629/02.01.014/2019-20, 20 Sep 2019**, fetched directly from rbi.org.in, PRIMARY (`08_market/market_problems.md` #16, `payment_problems.md` source P1): **₹100/day** beyond T+1 (UPI P2P, IMPS, NACH, PPI) or T+5 (ATM, PoS/CNP, UPI merchant), and verbatim: *"Wherever financial compensation is involved, the same shall be effected to the customer's account **suo moto, without waiting for a complaint**."* The corpus's note: *"Suo-moto compensation is hard to audit from outside."*
**Solution.** Match the failed-transaction stream to the reversal stream, compute each TAT deadline deterministically, detect breaches, and compute the compensation owed. Then check whether it was paid.
**AI role.** **Almost none, and that is the honest answer** — this is deadline arithmetic and stream matching. The only model-shaped part is matching a reversal to its originating failure when the identifiers drift, which is a small instance of shape A.
**Batch metric.** Over 1,000 synthetic failure/reversal pairs with injected delays: **breach-detection recall and false-breach rate**, plus total compensation owed vs paid.
**Escapes the collision (E5, strongly — and uncomfortably).** No shipped Razorpay agent audits Razorpay's own regulatory obligations. That is a genuinely unoccupied square. **It is also politically awkward**: the artefact's natural user is a regulator or a customer, and the judges are the PSP. `HYPOTHESIS — unevidenced` that this would be received well. Reframing it as a *merchant-facing* tool ("are your customers' refunds hitting the TAT?") defuses it and weakens it simultaneously.
**Why it's in the pool.** It is the highest-integrity, lowest-AI, most-awkward idea available, and the pool needs that corner.
**Track.** Primary T04 · Secondary T02/T05.

---

## Idea 19 — **Reserve X-Ray** (rolling reserve / settlement hold)

**Pitch.** Money on settlement hold is neither in the bank nor in receivables — it is invisible to both sides of the reconciliation; surface it, age it, and forecast its release.
**Why it matters — corpus.** `08_market/finance_ops_problems.md` §2 table, on settlement holds / rolling reserve: *"Money is neither in the bank nor in receivables — invisible to both sides of the recon."* Razorpay Route ships an explicit **"On Hold"** settlement mode — *"Put settlement on hold for a transfer until your business conditions are met"* (`razorpay_product_signals.md` §1.5) — so the mechanism is first-class product surface. **Magnitude: `EVIDENCE NOT FOUND`.**
**AI role.** **Thin.** Release-date forecasting is time series; the hold ledger is deterministic. Marked honestly as a weak AI-necessity idea.
**Batch metric.** Forecast error on release dates over 200 held transfers; plus the reconciliation-completeness delta from including holds (how many previously-unexplained exceptions in #16 resolve once holds are modelled).
**Escapes the collision.** Cashflow Forecaster forecasts cash; it is not documented as modelling held balances. **Weak-to-moderate escape.**
**Best use.** A *component* of #16 that resolves a specific exception class — which is exactly how it earns its place: it converts unexplained exceptions into explained ones, and that delta is measurable.
**Track.** Primary T04.

---

## Idea 20 — **Suspense** (unidentified-receipt resolver)

**Pitch.** Money arrives in the account with a payer name and a UTR and nothing else; this figures out which invoice it is against, and refuses when it can't.
**Why it matters — corpus.** Smart Collect 2.0 exists precisely because bank-transfer collections don't self-reconcile — virtual accounts are Razorpay's *deterministic* answer (give each customer a unique identifier so the join key is manufactured in advance). Testimonial: *"saved us 60+ hours every month of manual reconciliation tasks"* (`razorpay_product_signals.md` §1.7). **The residual is every payer who does not use the virtual account** — pays to the main account, pays a rounded amount, pays three invoices in one transfer, or pays with a narration of `NEFT/SHARMA/9812`.
`EVIDENCE NOT FOUND` for the value sitting in Indian merchants' suspense accounts (`finance_ops_problems.md` §2 says so explicitly).
**AI role (shape A).** Match an opaque bank narration + amount + date to a set of open invoices, including one-transfer-to-many-invoices, part-payments and rounded payments. Genuine many-to-many with no key.
**NOT AI.** Anything where the virtual-account identifier *is* present — that path must be deterministic and must be measured separately, so the model is only ever credited with the residual it actually resolved.
**Batch metric.** Over 400 synthetic receipts (a controlled mix of VA-tagged and untagged): **auto-match rate on the untagged residual, precision against ground truth, and unresolved count** — plus the deterministic tier reported separately so the model's contribution is not inflated by it. This split *is* the anti-tautology defence for this idea.
**Escapes the collision (E1-adjacent).** Smart Collect solves this by *preventing* the problem for cooperating payers. Nothing addresses non-cooperating payers. Narrow, honest, real.
**Track.** Primary T04 · Secondary T03.

---

# 2. Clustering

| Cluster | Ideas | Keep-strongest |
|---|---|---|
| **Compliance-threshold management** | 1, 10, 18 | **#1 VAMP Governor** — #10 and #18 are the same shape at lower stakes |
| **Dispute & evidence** | 1, 2 | Both survive; different objectives (portfolio vs per-case) |
| **Cost-of-being-wrong instrumentation** | 3, 7 | **#3 Regret** — #7 is a component, not a product |
| **Tabular risk scoring** | 4, 5, 6 | **#6** on differentiation, **#4** on measurability; #5 sits between |
| **Payment-failure diagnosis** | 8, 15 | **#8 Business Decline Triage** — #15 is a strictly weaker restatement |
| **Pre-failure subscription work** | 9, 10 | **#9 Twenty-Four Hour Window**, with #10 folded in as a sub-case |
| **Receivables / payables** | 11, 12, 20 | **#11 Payer's Conscience** — #12 and #20 are creditor-side and crowded |
| **Multi-source matching** | 16, 17, 19, 20 | **#16 Four Files**, with 17/19/20 as exception classes inside it |
| **Measurement methodology** | 3, 7, 13 | All three are *layers*, not products. Fold into whatever is built. |
| **Collided / recorded-to-avoid** | 13, 14, 15, (4) | Keep on file so they are not reinvented |

**Consolidation.** Twenty ideas reduce to **six genuinely distinct strategic directions**: portfolio-compliance control (#1), cost-of-false-positives instrumentation (#3), business-decline diagnosis (#8), the regulator-created pre-debit window (#9), the payer-side statutory clock (#11), and multi-source matching with an exception ledger (#16). Everything else is one of those six wearing different clothes, or a component of one.

---

# 3. Cross-cutting build components (apply to whichever idea wins)

Directly from `FIELD_BAR.md` §5, where these are listed as the things that separate the top 5 and **essentially nobody does**:

1. **Adversarial baseline hunt** — depth-1/2/3 stump, single comparison, majority class, regex, published as a table *even when the trivial rule wins*. ~30 lines. Highest value-per-line artefact available.
2. **Three baselines, parameters stated** — do-nothing, *tuned* naive rule, best trivial rule. A straw-man baseline is the fastest way to lose credibility with a panel that ships Smart Retry.
3. **Attrition ledger** — `N_in → N_scored → N_reported`, every drop with a reason, effective n printed next to every headline.
4. **Ablation table** — delete each signal, re-report, **keep the rows where nothing moved**.
5. **`WHERE_WE_DID_NOT_USE_AI.md` with a COST column**, enforced by an AST import test with a vacuity guard.
6. **A real-data kill-gate before the synthetic evaluation** — for #8 this is public NPCI bank-wise BD/TD; for #11 it is the actual Udyam registry format; for #16 it is a real Razorpay settlement report schema. This is the single strongest move available and only one repo in the field does it.
7. **The failure narrative as a real debugging story**, not chaos injection. Read first.

---

# 4. VERDICT — do my tracks beat Track 01?

**Short answer: no, but the margin is smaller than the scorecard says, and one idea genuinely contests it.**

**Where I think the scorecard is wrong.** `track_scorecard.md` §Method caveats already concedes the most contestable point: *"Adjustment (A) is the most contestable choice here. It reads 'business impact' as impact to Razorpay. Read instead as impact to merchants, T02/T03/T04 each regain 4 and **T03 leads outright at ~82**."* I want to push harder than that. The −4 is applied **uniformly across each track**, but the collision is **not uniform within a track**. RTO Shield collides at 1.0 with an RTO scorer and at ~0.1 with a payer-side 43B(h) agent. Applying a track-level penalty to an idea-level phenomenon systematically penalises the escaping ideas along with the colliding ones. **The right treatment is per-idea, and I have given one for all twenty.**

**Where the scorecard is right, and decisively.** The rubric grades **problem taste** — *"did you pick something that actually matters"* — and Razorpay is not a neutral judge of "matters". Track 01 is the only track where a submission maps onto something Razorpay is **publicly, visibly stuck on**: six PRs into the ACP repo adding UPI, five open, none merged, stalled since 2026-05-15 for want of a TSC sponsor, authored by two people who are #1 and #5 committers on Razorpay's own MCP server. Combined with the ten-second-reproducible finding that four major Indian D2C brands serve live UCP profiles that **cannot take UPI in a country that is 80%+ UPI** (`THE_UPI_HOLE.md`), that is a problem-taste argument no T02/T03/T04 idea can match. Not because my problems are smaller — ₹7.34 lakh crore is not small — but because **the judge does not personally feel my problems as an open wound.**

**Three specific things the T01 case has that my tracks structurally cannot get:**
1. **A gap between two things Razorpay already operates in production** (`THE_GAP.md`): UPI Reserve Pay is live, Razorpay MCP is live, and the total spend authority expressible across that interface is `max_amount` + a frequency bucket + an expiry — no payee restriction, no MCC, no velocity, no decrement-on-refund, no way to inspect a block's remaining balance. AP2 specifies eight constraint types. That is a *verified-from-source* deficiency in the judges' own shipped surface.
2. **Field thinness with a documented reason.** T01 is 6% of 261 repos vs T03's 24%, and its one serious sell-side occupant's headline evidence is *"a deterministic mock whose rerun delta is exactly zero."*
3. **A demo that is legible in five seconds** — *"watch an agent buy from an Indian merchant, then watch it get stopped when it shouldn't."*

**The honest counter-argument, which I am obliged to make properly.** T01's provisional score is **~58 + ⏳(40)** — 40 points are *unresolved*, and two of the three gating cells are **AI leverage** and **measurability**. The scorecard's own words: *"A protocol bridge can be excellent engineering with a decorative LLM — which fails rubric pillar 3 outright."* That is not a small risk. It is the risk that the highest-ceiling track produces a submission that fails a named pillar by construction. **My three headline ideas do not carry that risk**, and that is worth stating plainly:

| | AI necessity | Batch metric | Sandbox-safe |
|---|---|---|---|
| **#8 BD Triage** | shape B + C, load-bearing, defensible | 1,000 declines, 3 baselines, contacts-saved | ✅ failure injection well supported |
| **#9 24-Hour Window** | shape C, competing risks, genuinely hard | 300 mandates, net retained value incl. induced churn | ✅ **the only loss event manufacturable in test mode** |
| **#11 Payer's Conscience** | shape A + B, entity resolution is the crux | 300 payables, FP cost = destroyed working capital | ✅ fully synthetic, needs no test mode at all |

**My actual verdict, in order:**

1. **Track 01 remains correct** — *conditional on the two gating questions resolving yes.* If UPI Reserve Pay works on test keys and the AI is load-bearing rather than decorative, nothing in my three tracks beats it, because problem taste is graded and T01 wins problem taste with the judges specifically.
2. **If either gate fails, do not fall back to a generic T03 recovery agent.** Fall back to **#11 Payer's Conscience**. It is the only idea I generated whose escape from Agent Studio is a *different principal* rather than a different quality, timing or scope — Razorpay's Receivables Agent is the creditor's agent and there is no payer's agent anywhere in the shipped stack. It rests on the second-best-evidenced problem in the corpus (₹7.34 lakh crore, GAME+FISME+C2FO) backed by **statute that needs no citation at all** (43B(h)), it needs zero test-mode access, and its hard part — entity resolution between a payables ledger and the Udyam register — is unambiguously not solvable with `if/else` and a SQL query.
3. **#8 Business Decline Triage is the strongest *evidence* in the pool** and the argument for it is a good one — the shipped stack optimises authorisation and retry, and business decline is downstream of both. But it sits in the most crowded track (24%) with the closest in-field competitor (`abhinav-phi/reflex`), and its escape is a capability argument, which is the kind a judge who works on Vulcan can push back on from knowledge I do not have. **Highest evidence, most contested ground.**
4. **#9 Twenty-Four Hour Window is the best demo in the pool** and the cleanest timing escape, and it is the *only* idea whose loss event is genuinely manufacturable in a sandbox. If demo legibility and honest measurement are weighted above problem taste, this wins my three tracks. It does not beat T01, but it is the idea I would build if I had six days instead of eight.
5. **T04 does not beat T01 and should not be the fallback**, despite #16 being the best pure visual in the pool. `track_scorecard.md` scores its AI leverage 6/10 and I agree with the reasoning. A submission whose AI turns out to be load-bearing on 4% of records is a pillar-3 liability, and you cannot know the residual size until you build the deterministic tiers. **#16's four-unjoinable-files opening should be stolen as a demo device regardless of which idea wins.**

**One thing I would tell the lead researcher to actually go check**, because it would change my answer: **measure the Tier-1/Tier-2 residual for #16 on day 2.** If deterministic matching clears >90%, T04 is dead as a serious option and the fallback is #11. If it clears <70%, #16 becomes a genuine contender and my ordering above is wrong.

---

## Integrity register for this document

| Claim | Status |
|---|---|
| All NPCI BD/TD figures | `[FACT]` via Dataful #445 (source field: NPCI). **10-bank A–C preview only — excludes SBI/HDFC/ICICI/Paytm/PhonePe. Not system-representative. Stated at every use.** |
| RBI e-mandate provisions | `[FACT]` — RBI/DPSS/2026-27/396, fetched from rbi.org.in |
| Visa VAMP thresholds and India footnote | `[FACT]` — Visa primary fact sheet 2025, verbatim |
| ₹7.34 lakh crore MSME receivables | `[FACT — SECONDARY]`, publisher affiliation (MSME advocacy + working-capital lender) **must be disclosed on any slide** |
| Section 43B(h) | Statute. Needs no source. |
| NRF returns figures | `[FACT]` — **US only.** India equivalent `EVIDENCE NOT FOUND` |
| Baymard 70.22% | `[FACT]` — 50-study meta-analysis. Do **not** use the superseded 48%-extra-costs figure. |
| Razorpay's ₹400–600 false-decline claim | Razorpay's own marketing claim, not independently audited. Cite as such. |
| India RTO rate | **Never stated in this document.** Vendor range 20–40%, prepaid estimates differ 7×. |
| Agent-traffic volume at Indian merchants (#6) | `HYPOTHESIS — unevidenced` |
| Promise-to-pay breakage rate (#12) | `HYPOTHESIS — unevidenced` |
| DRC-01C volume / ITC blocked value (#17) | `EVIDENCE NOT FOUND` — pitched on mechanism only |
| Suspense-account value (#20), rolling-reserve value (#19), India non-fraud dispute share (#2) | `EVIDENCE NOT FOUND` |
| Reception of a regulator-facing audit tool (#18) | `HYPOTHESIS — unevidenced` |
| Statistics invented for this document | **Zero.** |
