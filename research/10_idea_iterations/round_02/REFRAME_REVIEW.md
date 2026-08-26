# REFRAME_REVIEW — adversarial panel on the "runtime money harm" reframe

| Field | Value |
|---|---|
| Panel | IdeaAgent (`.claude/agents/ideaagent.md`) |
| Reviewing | `research/10_idea_iterations/round_02/TRANSFORMATION.md` (R1 — "Safe agent wallet") |
| Against | `research/11_final_selection/*` · `THE_REAL_RUBRIC.md` · `FIELD_BAR.md` · `ARYAN_direct_competitor.md` · `MASTER_BUILD_PROMPT.md` |
| Date | 2026-08-26 · 10 days to deadline |
| Verdict | **NO-GO as proposed.** GO for a narrower variant (ALT-4). |

---

# 0. HEADLINE

The reframe is directionally right about the diagnosis and **factually wrong about the harm**.

The diagnosis — *"citation is the mechanism, not the value"* — is correct and well argued. But the fix
substitutes a money-harm story that **does not survive its own corpus**, and in doing so it trades away
the single asset that made A4 win in round 01: **ground truth authored by someone else.** It replaces
externally-sourced labels with a simulator we write, which is precisely the failure mode
`FIELD_BAR.md` §2 Opening 1 identifies as field-fatal.

Two of the three legs of the harm story are refuted by documents already in this repository.

> **Scores: Global 60/100 · Razorpay fit 62/100.**
> (Down from 82/88. The fit score is *lower* than global because the false claims are made
> specifically about Razorpay's own shipped code, to the people who shipped it.)

---

# 1. THE FATAL FACT — found in our own corpus, not invented

`research/07_razorpay_winning_intersection/THE_GAP.md` — evidence class **FACT**, verified by full clone
of `razorpay/razorpay-mcp-server` @ `7950d51`, tool registrations enumerated from source — lists among
the 43 tools:

```
... resend_otp · revoke_token · submit_otp ...
```

and, verbatim from that file:

> *"Supporting tools: `fetch_tokens` (list a customer's saved instruments), **`revoke_token`**
> (*"Once revoked, the token cannot be used for future payments"*)."*

The token in question is `type='single_block_multiple_debit'` — **which is the Reserve Pay block.**

## Therefore: **"There is also no revoke tool" is false.**

`TRANSFORMATION.md` line 4 of the harm chain asserts *"There is no revoke tool either."* Our own
first-hand source-read says there is. This is not a nuance; **it is the load-bearing leg of
"stuck for up to 90 days."** Remove it and the sentence collapses.

Worse: `MASTER_BUILD_PROMPT.md` §3.3 reproduces the same error in its gap table —
*"Revocation, easy access → ❌ no tool revokes a block"* — directly contradicting `THE_GAP.md`,
which is the more rigorous document (source-read vs. summary). **The build prompt has already
drifted from its own primary source.**

> ⚠️ This is exactly the failure mode the project exists to criticise: a restatement drifting from
> the authority it derives from. We are instance #5, and we are the vendor. **Fix this before
> anything else.** If a Razorpay judge greps their own tool list during the video, the project's
> entire integrity claim dies in one second.

**Second-order damage:** `revoke_token` also weakens the "missing primitives" product framing generally.
The pitch is *"an MCP server exposing what Razorpay's does not."* One of the four headline primitives
already exists on the incumbent surface.

---

# 2. THE SEVEN ATTACKS

## Attack 1 — Is it a product, or a linter in a costume?

**It is a linter in a costume, and the costume is thinner than the proposal thinks.**

Read the reframe's own component list: extractor · store · conformance comparison · gate · handler ·
ledger · eval. That is **A4's architecture with a wrapper**. The only genuinely new components are the
five primitive wrappers (`remaining_balance`, `revoke_block`, `retry_budget`, `validate_block`,
`history`) — described in the scope table as **"S — wrappers over state"**, i.e. arithmetic over a
table we own.

The reframe changes *the README's first paragraph*. It does not change what is built. That is a
narrative move, not a product move — and the panel should say so plainly rather than reward the
vocabulary.

There is a real product hiding here, but it is not "safety primitives." It is §3's answer.

**Score contribution: Problem strength 6/10, UX/product 2/3.**

---

## Attack 2 — ★ IS THE HARM REAL? **Largely no. It is theatrical, and it collapses on OC-228's own text.**

This is the crux, as the brief says. Here is the chain, tested link by link against the circular.

### The claimed chain
1. Agent holds ₹10,000 / 90-day block.
2. Cannot query unutilised balance (no MCP tool).
3. Debit fails.
4. Agent retries → violates §3 (max 3/24h, timeouts only).
5. No revoke tool.
6. → **"The customer's ₹10,000 is blocked, unspendable, and stuck for up to 90 days."**

### Link-by-link

**Link 2 — TRUE but misattributed.** OC-228 acquirer §5(d) — *"The current block limits (unutilised)
are always checked before initiating a debit"* — is an obligation **on the acquirer**, i.e. on
Razorpay, not on the merchant's agent. Razorpay is *mandated* to perform this check.
`INFERENCE — high confidence:` therefore Razorpay performs it server-side, and an over-limit debit
is rejected by Razorpay before it ever reaches NPCI. The MCP surface not *exposing* the number is a
**legibility gap**, not an enforcement gap. Reasoning: a regulated acquirer that failed a
twice-stated mandatory pre-debit check would be in breach on every transaction; the far more
plausible reading is that the check runs and the agent simply cannot see it.

**Link 3 — TRUE but harmless.** A debit exceeding the remaining envelope declines. Reinforcing this,
acquirer §5(c): *"…along with the responsibility of **issuer to validate every debit**."*
**Two independent parties validate before money moves.** `INFERENCE — high confidence:` a decline
moves no money and consumes no envelope. Nothing in OC-228 states that a declined debit decrements a
block; §3 explicitly says timeouts are *"reversed in real-time and shall not be settled
(not to be treated as deemed debit)."* The circular's only statement about failed debits is that
they leave no trace.

> **There is no mechanism in OC-228 by which a block is "burned."** "Blocks burned" is a state that
> exists only in a simulator we would write. See Attack 5.

**Link 4 — TRUE as a compliance breach, FALSE as money harm.** §3's retry budget binds
*"acquiring entities"* — Razorpay. The agent is not the retrying entity; it initiates new payment
attempts, and whether those aggregate into §3's budget is a property of **Razorpay's** implementation.
An agent that hammers a declining block produces (a) a compliance question for the acquirer and
(b) a decline-rate problem that banks do monitor — both real, neither a rupee lost by the customer.

**Link 5 — FALSE.** `revoke_token` exists (§1 above). And independently, **OC-228 UPI Apps §1 mandates
*"Easy access to revoke the block"* in the customer's own UPI app** — BHIM, Paytm, Navi. The customer
holds a revoke path the merchant cannot take away. The block is *not* a prison.

**Link 6 — FALSE.** It requires links 5 and 3 to hold. Neither does.

### What IS real — and it is better than what was claimed

Three genuine harms survive, and none of them is the one in the pitch:

1. **The agent cannot make a correct decision.** It cannot size a basket to a remaining envelope,
   so it either over-commits (order accepted, debit declines, fulfilment already promised) or
   under-utilises (leaves conversion on the table). This is a **commerce-quality** harm, not a
   funds-locked harm.

2. ★ **The merchant-credit harm — and it is money-real.** OC-228 acquirer §2, verbatim:
   *"**The block created shall NOT be treated as the guarantee of payment**, only the successful
   debit response received by the merchant … shall be considered for payment."*
   Razorpay's own Reserve Pay documentation says, verbatim:
   *"**Guaranteed Collection:** Funds are pre-blocked, ensuring you receive payment regardless of
   customer's later financial situation."*
   OC-228 acquirer §4 then permits post-service debit for metered categories (*"cab aggregators,
   EVs"*). **A merchant that believes Razorpay's documentation will deliver goods against a block,
   the debit will decline, and the merchant eats the loss.** That is a rupee figure, attributable
   to a verbatim contradiction between a vendor document and the circular that defines the primitive.

3. **Retry breach exposure** sits with the acquirer, and an agentic merchant amplifies it.

> **Harm #2 is the harm the reframe should have been built on.** It is money-real, it is
> merchant-facing, it requires no invented simulator state, and — decisively — **it is the one harm
> whose ground truth is a document we did not write.** The proposal walked past it to reach for a
> customer-money story that is not true.

**Verdict on Attack 2: the harm as pitched is theatrical. A different, adjacent harm is real. The
reframe as written collapses; a re-pointed version survives.**

---

## Attack 3 — Is Arm A a fair baseline? **No. It is the field's straw-man failure with better branding.**

The defence offered is: *"it cannot be a straw man because it is the incumbent's own production
tooling."* **That defence is a category error.** Provenance does not make a baseline fair. Fairness is
about *how the baseline is operated*, and a competent engineer operating Razorpay's MCP server does
not behave like the Arm A agent described.

### The trivial avoidance

Remaining balance on a Reserve Pay block is:

```
remaining = block_amount − Σ(successful debits against this token)
```

Every term is known to the merchant:
- `block_amount` — **the merchant created the block** (`create_order`, `token.max_amount`).
- Each debit — **the merchant initiated every one of them.**
- OC-228 issuer §4: *"One mobile number … is allowed to create **only one block at a time for the
  particular merchant**."* → **the merchant is the sole debiting party.** There is no third-party
  spend to miss.

And it isn't even "client-side": `fetch_tokens`, `fetch_order`, `fetch_order_payments`,
`fetch_all_payments` are all in the 43. **A competent engineer reconstructs remaining balance from
Razorpay's own read tools with one subtraction.**

> This is `komallbarhate`'s `days_to_estimated <= 2` (FIELD_BAR §2, Opening 1) wearing a new costume:
> **one subtraction beats the whole stack.** The panel found that pattern in the field and called it
> field-fatal. Reproducing it deliberately, in the arm we designed to lose, is worse than stumbling
> into it.

### How much does this weaken it? A lot — but not to zero

Client-side reconstruction is right in the common case and **wrong exactly where it matters**:
- **Out-of-band mutation.** Acquirer §5(c) mandates *"update and revoke"*; UPI Apps §2 mandates a
  history including *"creation, debits, **modification**"*. A customer who reduces or revokes the
  block from their UPI app silently invalidates the merchant's ledger.
- **Ambiguous states.** §3's timeout→auto-reversal window is precisely where a client-side counter
  disagrees with the truth.
- **Expiry** relative to a promised delivery date.

That is a genuine, narrow, honest argument. It is also **~5% of episodes**, and it must be stated
that way. The proposal's own text already concedes this (*"INFERENCE — flagged for verification"*)
and then keeps the headline anyway. **Do not headline a delta a subtraction erases.**

**Required if this survives at all:** Arm A+ (competent engineer, client-side reconstruction) is not
"if time permits" — it is **the only honest baseline**, and Arm A-naive should be deleted, not
demoted. `FIELD_BAR.md` §2 Opening 2: *"Razorpay ships Smart Retry; a straw-man retry baseline is the
fastest way to lose credibility with this specific judging panel."*

**Score contribution: Differentiation 3/7.**

---

## Attack 4 — Does the LLM survive? **The gate's LLM does not. The proposed rescue is real but unbuilt and on the wrong rail.**

**The objection is correct and the proposal identifies it correctly:** ₹10,000 / 90 days / 3-retries
are five constants. An LLM that resolves five constants once, offline, is a **build-time script**.
Pillar 3 — *"the right tool in the right place"* — is not satisfied by an ornament, and this panel
killed A1, A2 and B1 on exactly this test.

### The proposed rescue: runtime evaluation of *counterparties'* declared constraints

This is a genuinely good idea. It converts the LLM job from "extract our constants once" to
"evaluate arbitrary counterparty prose against the authorising clause, per-merchant, per-purchase" —
per-merchant, runtime, unbounded, linguistic. All four properties are real. **It is the best single
idea in `TRANSFORMATION.md`.**

But three problems, and the third is serious:

1. **It is unbuilt and unscoped.** There is no corpus of merchant constraint declarations. The four
   UCP profiles we have declare *payment handlers*, not constraints — `keys[]` is empty on all four
   (`MASTER_BUILD_PROMPT.md` §2.1). The runtime-evaluation premise currently has **n≈0 live inputs**.
   The four-for-four drift instances are **vendor documentation**, not per-merchant declarations, and
   they are evaluated once, not at runtime.

2. **It re-inflates scope** at the exact moment scope is already over budget (Attack 7).

3. ★ **The keystone LLM demo is on the wrong rail.** The irreplaceable-LLM argument rests on OC-201 §7
   — three rupee figures, three scopes, one paragraph — which is **UPI Circle**. The product is built
   on **UPI Reserve Pay / OC-228**. `MASTER_BUILD_PROMPT.md` §3.2 states in bold: *"The two rails are
   different. Never conflate them."* So the pillar-3 showpiece is an extraction from a circular the
   product does not use, and OC-228's own limits (₹10,000, 90 days) are **flat, unambiguous, and
   trivially regex-able**. A sharp judge will ask: *"if the hard extraction is on Circle and your
   product runs on Reserve Pay, what does the model do in your product?"* **There is currently no
   good answer.**

### The one move that would genuinely save it

Make the LLM causally upstream of the episode metric, and ablate through it:

> Run the 50 episodes twice. Arm B-naive uses a gate configured from the **naive extractor**
> (regex-nearest-₹-figure), which reads OC-201 §7 and yields ₹15,000-per-transaction — the shipped
> 3× error. Arm B uses the LLM-extracted config. **Report the episode-level harm delta between two
> configs produced by two extractors.**

That makes the extraction quality *measurable in rupees* rather than in F1, ties pillar 3 to the
headline number, and reuses the keystone honestly. **If the reframe proceeds, this is mandatory.**
It still does not fix the rail mismatch.

**Score contribution: AI necessity 4/8.**

---

## Attack 5 — Does the measurement survive the 30-second attack? **No. This is the decisive objection.**

Round 01 selected A4 for exactly one reason, stated in `FINAL_IDEA.md`:

> *"**Only A4's labels come from documents it did not write**"*

**The reframe throws that away.** Walk the proposed outcomes:

| Outcome | Who authored the label? |
|---|---|
| **Blocks burned** | **Us.** No mechanism in OC-228 burns a block (Attack 2). "Burned" is a state our mock issuer defines, with a threshold we choose. |
| **₹ stranded** | **Us.** Follows from "burned." Zero in reality — `revoke_token` + in-app revoke. |
| **NPCI violations attempted** | **Mixed.** The *rules* are NPCI's; the *episodes that trigger them* are our agent, our merchant, our carts, our decline injection. **We author the exposure.** |
| **Successful purchases** | **Us**, in test mode. |
| **False refusals** | **Us** — "valid purchase" is our label. |

Razorpay test mode does not block real funds, does not run an issuer, and does not enforce §3 retry
budgets. `INFERENCE — high confidence:` **every episode outcome is produced by a mock issuer we
write.** Both the generator and the grader are ours.

That is **doubly-authored fiction** — the exact charge on which round 01 rejected A2 and B1
(`FINAL_IDEA.md`, Attack 2). The tautology is not subtle: *we write the simulator that decides when a
block burns, then report that our gate prevents burns.*

### The 30-second attack, verbatim

> **Judge B:** "Where does 'block burned' come from?"
> **Us:** "Our episode simulator."
> **Judge B:** "Who wrote the simulator?"
> **Us:** "We did."
> **Judge B:** "So the arm without your gate burns blocks because your simulator burns them."

There is no recovery from that. Compare with the artifact this replaces: **the 4/4 out-of-sample run
against Razorpay SEP #216, Razorpay MCP, Cashfree docs and Razorpay Reserve Pay docs** — four live,
published, third-party documents, none authored by us, and the system is right about all four. That
is one of the two or three most defensible measurement artifacts available in this entire field.

> **Trading a 4/4 externally-authored out-of-sample hit for a self-authored simulator is the single
> worst move available in this project.** It is legible; it is not defensible; and this panel has
> established that the Razorpay reviewers run these attacks.

**Score contribution: this alone costs ~15 points and is the primary reason for NO-GO.**

---

## Attack 6 — Demo legibility in 60 seconds? **Yes — and that is the danger.**

"The customer's money is stuck" is dramatically more legible than "this number lacks a citation."
Legibility is genuinely the reframe's win, and it should not be dismissed.

But legibility is only an asset when the claim is **true**. A claim this legible is the one a judge
*will* probe, and this panel is:
- the people who wrote `revoke_token`,
- the people who operate the acquirer-side §5(d) balance check,
- the people who know the block auto-releases.

Making a vivid, false claim about their rail, in a project whose entire thesis is *"vendors misstate
the circulars,"* is the maximum-damage failure mode. `MASTER_BUILD_PROMPT.md` §9 already names it:

> *"Our entire thesis is that vendors misstate NPCI limits. **The one unacceptable outcome is us
> doing the same thing.**"*

**A legible falsehood scores worse than an illegible truth**, in front of a panel that reads the
failure narrative first.

**Score contribution: Demo power 6/8 — high ceiling, high variance, currently mispointed.**

---

## Attack 7 — Scope. **Too big, and the schedule is already over budget.**

Standing commitments (`MASTER_BUILD_PROMPT.md` Part 8, days 2–10): extractor · store · ≥50-claim eval
set · conformance engine · CI gate · UCP handler · `/.well-known/ucp` · 3 MCP tools · enforcement gate
· hash-chained ledger · buyer agent · 4/4 out-of-sample · ARCHITECTURE.md · clone-and-run verification
· video.

The reframe **adds**: a second MCP server (5 primitives + transport + schemas) · a merchant with
inventory/fulfilment state · a **mock issuer** (the only way episodes can have outcomes) ·
**≥50 episodes × 2–3 arms** with orchestration, seeding, determinism and result storage.

And it **does not remove the extractor or the conformance engine** — those are demoted, not deleted.

Meanwhile **kill-gate 2 remains open** — no test-mode key has executed a payment. Confidence was held
below 90 *solely* on that gate, and the reframe makes a working money path *more* load-bearing, not
less: "controlled execution inside the bound" is now scene 4 of the harm narrative rather than a nice-
to-have.

`INFERENCE — high confidence:` **this does not land in 8 days at a quality that passes
*"does it run, is it structured, would you trust it."*** The most likely outcome is a two-arm episode
harness with a shallow mock issuer and a half-finished extractor — which is the worst of both:
a self-authored metric *and* a weakened citation engine.

**Score contribution: Feasibility 2/5.**

---

# 3. SCORE TABLE — the reframe as proposed

| Dimension | Max | Score | Justification |
|---|---|---|---|
| Problem strength | 10 | **6** | Underlying problem real (agent surface implements little of what OC-228 mandates). Stated harm is not. |
| Innovation | 10 | **5** | Repackaging of A4+A1. The counterparty-runtime-evaluation idea is genuinely novel but unbuilt. |
| Originality | 8 | **5** | "Missing primitives + gate" is adjacent to `aryanpajnee`'s specified 7-check gate / 14 refusal codes. |
| Differentiation | 7 | **3** | Differentiation was measurement. The reframe makes the measurement self-authored. Arm A avoidable by a subtraction. |
| Real-world impact | 10 | **5** | Customer-money harm refuted. Merchant-credit harm real but not the pitch. |
| Market opportunity | 7 | **6** | Unchanged and genuine — agent-payable UPI in an 80%-UPI market. |
| AI necessity | 8 | **4** | Gate constants make the LLM ornamental. Rescue is real but unbuilt, and the keystone extraction is on the wrong rail. |
| Technical depth | 8 | **6** | Five real subsystems. Depth is present; it is also the feasibility problem. |
| Feasibility | 5 | **2** | 5 subsystems + mock issuer + 2-arm harness in 8 days, kill-gate 2 open. |
| Demo power | 8 | **6** | Highly legible. High variance — refutable live by a judge who greps their own tool list. |
| Wow factor | 5 | **3** | "We built the missing tools" is competent, not memorable. The 4/4 out-of-sample hit was the memorable thing, and it is demoted. |
| UX / product quality | 3 | **2** | Primitives are wrappers over state we own. |
| Responsible AI / safety | 3 | **3** | LLM off the money path; refusals first-class. Genuinely good. |
| Hackathon competitiveness | 8 | **4** | Loses to A4-as-was on measurement; loses to `aryanpajnee` on gate completeness if the harness eats the schedule. |
| **TOTAL** | **100** | **60** | |

## Razorpay fit — separate scale, /100

| Component | Weight | Score | Note |
|---|---|---|---|
| Track 01 alignment | 20 | 19 | Bullseye. *"Every money action explainable, bounded and gated."* |
| Rail relevance (Reserve Pay, MCP, UPI) | 20 | 18 | They ship all three. |
| Problem taste a Razorpay judge feels | 20 | 11 | Feels it — then checks it. |
| **Factual accuracy about Razorpay's own code** | 20 | **2** | ⚠️ *"There is no revoke tool"* is refuted by our own source-read. Asserted to its authors. |
| Non-duplication of Agent Studio / Vulcan | 10 | 9 | Genuinely not a Razorpay product re-demo. |
| Framing risk (gotcha perception) | 10 | 3 | Reframe centres a harm story *about Razorpay's tooling*, dropping the systemic 2-companies framing that defused this. |
| **TOTAL** | **100** | **62** | |

> **The fit score is dominated by one row.** Remove the two false claims and honour the systemic
> framing and fit returns to ~85. The build prompt must be corrected regardless of which idea wins.

---

# 4. JUDGE REACTION

**First 10 seconds.** *"An agent gets an Indian customer's ₹10,000 stuck for 90 days — we built the
tools that stop it."* Strong. Best opening line the project has produced. Everyone leans in.

**First 60 seconds.** Problem, user, solution and why-now are all clear — a genuine improvement over
the linter framing. Then the payments person in the room says: *"Wait — stuck how? It auto-releases,
and you can revoke it."* The energy drains in about four seconds.

**After demo.** Remembered: a nicely built merchant, a two-arm chart, and **"the one who told us our
rail does something it doesn't."** The 4/4 out-of-sample hit — the strongest artifact in the whole
project — is remembered dimly, if at all, because it was demoted to scene 5 depth material.

**Deliberation.**

> **Judge B (Senior Engineer):** "The harm chain has two broken links. `revoke_token` is in our tool
> list. And §5(d) is *our* obligation — we run that check. Their agent can't see it; nothing burns."
>
> **Judge A (Product):** "The merchant harm is real though. We do say 'Guaranteed Collection' and the
> circular says the block is explicitly not a guarantee. That's a genuine finding and it's ours to fix.
> Why is that on slide five?"
>
> **Judge C (Hackathon):** "Where did 'block burned' come from?"
> **Judge B:** "Their simulator."
> **Judge C:** "Then the chart is a chart of their own assumptions. That's the same problem as half
> the field."
>
> **Judge A:** "The four-for-four thing — four live published documents, all wrong, and they're right
> about all four? *That's* the submission. Why did they bury it?"
>
> **Judge B:** "And their baseline. Remaining balance is `max_amount` minus the debits *they
> initiated*. `fetch_order_payments` is right there. That's a subtraction."
>
> **Judge C:** "Craft is high. Judgment slipped. If they'd led with the four documents and kept the
> merchant as the stage rather than the story, I'd be arguing to shortlist."

**Three-judge split**

| Judge | Score | Objection | Recommendation |
|---|---|---|---|
| **A — Product** | 62 | Right harm exists; wrong one chosen. Primitives are wrappers. | Re-point at the merchant-credit harm. Weak yes. |
| **B — Engineer** | 52 | Two refuted claims about our shipped code. Baseline is one subtraction. Mock issuer is the whole measurement. | **No.** Fix the facts first. |
| **C — Hackathon** | 58 | Legible but self-graded. They had the field's best externally-authored artifact and demoted it. | **No** as framed; yes for ALT-4. |

**Disagreement, not averaged:** A is 10 points above B. That gap *is* the finding — the reframe is a
better **pitch** and a worse **submission**. Judge A is scoring the story; Judge B is scoring the
evidence. This panel reads the evidence.

---

# 5. FATAL RISK

> **What is the strongest reason this idea loses?**
>
> **It replaces externally-authored ground truth with a self-authored simulator, and the harm that
> simulator dramatises does not occur on the real rail.**
>
> Round 01 selected A4 over five rivals on exactly one criterion: its labels came from documents it
> did not write. The reframe surrenders that criterion to gain legibility, and the legibility it
> gains is attached to a claim refuted by two lines in this repository's own corpus — one of them a
> tool name in Razorpay's own source. **Both halves of the trade fail.**

**Secondary fatal risk:** the panel includes the authors of `revoke_token`. A project whose thesis is
*"vendors misstate the circulars"* asserting a false thing about their code is not a scoring
deduction — it is a disqualifying credibility event.

**Competitor saturation: `LOW`.** Track 01 sell-side has one serious occupant
(`aryanpajnee`) and one mock-evidenced one (`Adarsh-Me`). Saturation is not the problem here;
self-inflicted evidence damage is.

---

# 6. ALTERNATIVE REFRAMINGS

Assets in hand: the UPI hole (4 live merchants, `curl`-reproducible) · Reserve Pay as a bounded-
envelope rail · the missing MCP primitives · the four-for-four vendor drift finding · the
circular-extraction engine · 288 archived circulars, 3 read first-hand and checksummed.

---

## ALT-1 — **"Not a Guarantee" — the settlement-risk gate for agentic Reserve Pay merchants**

> *"Razorpay's docs say a Reserve Pay block guarantees collection. NPCI's circular says, verbatim,
> that it does not. An agentic merchant will ship goods on that promise. We measure what that costs,
> and gate it."*

**Product.** Sits between the merchant's agent and fulfilment. Before an agent-driven order ships, it
decides whether **this block can actually pay for this basket**: envelope headroom · expiry vs.
promised delivery date · retry budget already consumed · the single-block-per-(customer, merchant)
constraint (issuer §4) · category timing rule (acquirer §4: pre-debit for quick-commerce, post-debit
for metered). Outcome ∈ `FULFIL` / `HOLD` / `REFUSE`, each with the clause.

**Harm.** Money-real, merchant-facing, **needs no invented state**: goods delivered against a block
that could not pay. Directly sourced to a verbatim vendor/circular contradiction.

**Ground truth.** Partly external (the eligibility rules are OC-228's; the contradiction is
published). Episodes are still ours — the residual weakness — but the *rule* being violated is not.

**Why better.** It uses the reframe's strongest asset (money legibility) attached to a claim that is
**true**, and it keeps the citation engine load-bearing: `FULFIL`/`HOLD` decisions cite clauses.
It also converts drift finding #4 (semantic) from a research footnote into the product's reason to
exist.

**Weak.** Scope still large. Episode outcomes still partly self-authored. Requires kill-gate 2.

> **Global 72 · Fit 84.**

---

## ALT-2 — **The Drift Index — a measured base rate for Indian agentic-payment constraint claims**

> *"Every published restatement of an NPCI limit we checked was wrong. We checked four. Here is what
> happens when you check two hundred — and here is the CI action that stops the next one."*

**Product.** Point the extraction engine at the live agent-facing surface of Indian payments —
Razorpay docs + MCP tool schemas, Cashfree, PhonePe, Paytm, BHIM, ACP SEPs, UCP handler
declarations — and publish a **measured drift rate over ≥50 (target 200) constraint claims from
documents we did not author**, broken down by the four failure modes (scope / omission / period /
semantic). Ships as a GitHub Action any PSP runs over its own docs and SDKs, plus a live index.

**Ground truth. ★ Fully external.** The claims are published by third parties; the authority is the
circulars. **This is the only alternative with a headline number no judge can attribute to us.**
It preserves and *scales* the artifact the reframe was about to discard: 4/4 becomes n≈200 with a
confidence interval, an attrition ledger (`N_in → N_scored → N_reported`), and `UNDETERMINED` counted
first-class.

**LLM: maximally load-bearing.** Joint value+unit+scope+meaning over arbitrary vendor prose and
scanned circulars, with the naive regex baseline reproducing the shipped 3× error and catching **zero**
of the semantic class. This is the cleanest pillar-3 argument the project has ever had.

**Why better.** Directly executes `FIELD_BAR.md` §5's "sufficient" items 6, 7 and 9 — the three
things nobody in the field does. `X% of published agent-facing payment constraints in India
contradict the circular that authorises them` is a sentence no other submission can produce.

**Weak.** ⚠️ **It is unambiguously a linter** — the original diagnosis, accepted rather than fixed.
Framing risk is elevated (Razorpay is 2 of 4 known instances). Needs the systemic framing held
rigidly and a *non-Razorpay* instance as the lead example.

> **Global 78 · Fit 80.** Highest global score of the alternatives; the fit ceiling is the linter tax.

---

## ALT-3 — **Ship `in.razorpay.upi` — the payment handler that does not exist**

> *"Four live Indian brands accept Visa, Mastercard, Amex, Discover and Diners from an AI agent.
> None accepts UPI. Here is the handler that fixes it, end to end, with a real test-mode payment."*

**Product.** A spec-conformant UCP payment handler for UPI, published at `/.well-known/ucp`, with
`create_checkout` / `update_checkout` / `complete_checkout`, backed by Reserve Pay, ending in an
executed test-mode payment.

**Ground truth.** The four merchants' **live profiles**, which we did not author and a judge verifies
with one `curl`. Metric: agent purchase completion at real merchant profiles, before → after.

**Why better.** Maximum Razorpay fit and maximum demo legibility of any option. Zero factual risk —
every claim is `curl`-verifiable. UCP *invites* a regional PSP to publish a handler without committee
approval, so the "why hasn't Razorpay done this" question has a flattering answer: nothing was
stopping it.

**Weak. ★ Pillar 3 fails outright** unless the LLM is given the counterparty-reconciliation job from
Attack 4 — which is unbuilt. This is precisely why round 01 rejected A1 alone. Also fully dependent
on kill-gate 2.

> **Global 74 · Fit 93.** The best fit available and the worst pillar-3 exposure. **Not viable alone
> — but it is the correct *host*.**

---

## ALT-4 ★ — **Don't reframe. Re-narrate. Keep A4's metric; lead with the money.**

> *"An agent will act on the merchant's documentation, not on the circular. Four times out of four,
> the documentation was wrong — including one that promises the block guarantees payment when the
> circular says, verbatim, that it does not. Here is an agent acting on it. Here is what it costs.
> Here is the mechanism that catches it."*

**This is my recommendation.** It accepts the diagnosis in `TRANSFORMATION.md` in full — *citation is
the mechanism, not the value* — and fixes it **in the narrative and the demo order**, without touching
the measurement target.

**What changes** (all narrative/ordering, ~1 day of work, no new subsystems):

| | Now | ALT-4 |
|---|---|---|
| Scene 1 | `curl` → no UPI | unchanged — keep it, it is the best 10 seconds in the project |
| **Scene 2** | extractor reads OC-228 | ★ **an agent reads Razorpay's "Guaranteed Collection" page and ships goods. The circular says the block is not a guarantee. Money at risk, on screen, in rupees.** |
| Scene 3 | gate cites a clause | unchanged — now it is *rescuing* the scene-2 agent |
| Scene 4 | test-mode payment inside the bound | unchanged |
| **Scene 5** | uncited claim refused; SEP #216 fails | ★ **the 4/4 run, promoted to the closer, framed as "four live published documents, none written by us, and it is right about all four"** |
| Headline metric | extraction accuracy, n≥50, external | **unchanged — this is the asset** |
| Secondary metric | — | ~15 episodes showing what an agent *does* with a wrong constraint. **Illustrative, explicitly labelled as such, never the headline.** |
| User | compliance engineer | **the merchant who is about to ship goods** |

**Why this is better than the reframe.** It buys ~80% of the legibility for ~10% of the schedule cost
and **zero** measurement damage. The headline number stays externally authored. The LLM stays
load-bearing because extraction accuracy stays the headline. `revoke_token` never has to be
misdescribed. Scope is unchanged, so kill-gate 2 remains the only open unknown.

**Weak.** Still not a "product" in the SaaS sense — but it *is* a working agent-payable merchant with
a runtime gate, hosting a measured engine, and it stops apologising for that.

> **Global 82 · Fit 90.**

---

## Alternatives, ranked

| | Idea | Global | Fit | Verdict |
|---|---|---|---|---|
| **1** | **ALT-4 — re-narrate, keep the metric** | **82** | **90** | ★ **RECOMMENDED** |
| 2 | ALT-2 — the Drift Index | 78 | 80 | Strong fallback if kill-gate 2 fails. Zero test-mode dependency. |
| 3 | ALT-1 — "Not a Guarantee" settlement gate | 72 | 84 | Best *true* money story. Merge its scene-2 into ALT-4 rather than building it standalone. |
| 4 | ALT-3 — ship the handler | 74 | 93 | Not viable alone (pillar 3). **Correct host** — ALT-4 already contains it. |
| 5 | **The reframe as proposed** | **60** | **62** | **NO-GO** |

Note that ALT-4 = ALT-3 (host) + A4 (core) + ALT-1's scene 2 (narrative). **The composite was already
right. The reframe mistook a narrative problem for an architectural one.**

---

# 7. VERDICT

## `NO-GO` on the reframe as proposed. `GO` on ALT-4.

**Reason for NO-GO** — three, any one sufficient:
1. **Two factual legs of the harm are refuted by this repository's own primary sources** —
   `revoke_token` exists in the 43; acquirer §5(d)/(c) put the balance check and per-debit validation
   on the acquirer and issuer, so nothing burns.
2. **The measurement becomes self-authored**, surrendering the sole criterion on which A4 was selected.
3. **Arm A is defeated by one subtraction** over Razorpay's own read tools.

**Weakest dimension to fix on ALT-4:** *product legibility of the headline artifact*. Extraction
accuracy is the right number and the wrong noun. State it as
**"published constraint claims that contradict their authorising circular: 4/4 out-of-sample, N/50 in
batch"** — a *conformance* number, not an *accuracy* number. Same measurement, product framing.

---

# 8. REQUIRED IMPROVEMENTS — in order

### Immediate — correctness, before any code

1. ★ **Correct `MASTER_BUILD_PROMPT.md` §3.3.** `revoke_token` exists (`THE_GAP.md`, source-read).
   Strike-through and annotate per Part 9's own rule — **do not silently edit.**
2. ★ **Delete every instance of "no revoke tool" and "stuck for 90 days"** from `TRANSFORMATION.md`
   and anywhere downstream.
3. **Restate the gap precisely and defensibly:** *"Razorpay's agent surface exposes revocation but
   not **legibility** — no tool answers 'how much of this block is left?', and OC-228 acquirer §5(e)
   mandates that remaining balance be **displayed**."* True, narrower, survives contact.
4. **Log this as the first entry in `FAILURES.md`.** *"We asserted a missing tool that our own
   source-read had already found. Our thesis is that restatements drift from their source; we drifted
   from ours in four days."* `FIELD_BAR.md` §2 Opening 7: the field writes scripted chaos-injection
   and the panel reads the failure narrative first. **This is the best genuine, unchosen failure the
   project has produced.**

### Adopt from the reframe — it is not all wrong

5. **Promote the "Guaranteed Collection" contradiction to demo scene 2.** It is the only money-real,
   externally-sourced harm in the corpus and it is currently buried.
6. **Keep the merchant as the stage, not the story.** The reframe is right that the host must feel
   like commerce.
7. **Build ~15 illustrative episodes**, labelled *illustrative*, never headlined. They earn the
   money narrative without contaminating the metric.
8. **Add the extractor-config ablation** (Attack 4): re-run episodes with the naive-extractor config
   (₹15,000-per-transaction) vs the LLM config, and report the delta **in rupees**. Ties pillar 3 to
   the money story. `FIELD_BAR.md` §5 item 10 — nobody in the field ablates.

### Reject

9. **Do not make episode outcomes the headline metric.**
10. **Do not ship Arm A-naive.** If any arm baseline appears, it is Arm A+ (client-side reconstruction
    from `fetch_order_payments`), and the honest finding — *"a subtraction gets you ~95% of the way;
    our primitive earns its keep only on out-of-band modification and the timeout-reversal window"* —
    is published as a limitation, not hidden. **That row is worth more than the ones that move.**
11. **Do not build a second MCP server.** Kill-gate 2 is still open; spend the budget on the money path.
12. **Hold the systemic framing rigidly.** Four instances, two companies, four failure modes. Lead the
    video with the **Cashfree** instance, not a Razorpay one.
