> # ⛔ STATUS: THIS REFRAME WAS REJECTED — NO-GO (60/100, down from 82)
>
> **Kept for the record, not for the build.** The *diagnosis* below is correct and was carried forward: *citation is the mechanism, not the value.* The *fix* was wrong.
>
> It was refuted in `REFRAME_REVIEW.md` on three counts: (a) *"no revoke tool"* is **false** — `revoke_token` exists, and this was our own drift (`FAILURES.md` #1); (b) **no mechanism in OC-228 burns a block** — "burned" would be a state only our simulator defines, i.e. a self-authored label, the exact tautology that killed every measured repo in the field; (c) the baseline is defeated by one subtraction, `remaining = max_amount − Σ(merchant-initiated debits)`.
>
> **It mistook a narrative problem for an architectural one**, and paid for legibility with the only asset that won round 01 — externally-authored ground truth.
>
> **Superseded by `../../11_final_selection/FINAL_IDEA.md` (v2): re-narrate, don't re-architect.**

# Transforming a research artifact into a product — the reasoning

## The diagnosis

**Old pitch:** *"An AI agent pays an Indian merchant by UPI — and no rupee bound exists unless it cites the circular that authorises it, checked in CI."*

Why it reads as research:

| Symptom | Cause |
|---|---|
| Feels like a linter | The headline artifact is a **CI gate** — dev-time, not runtime |
| User is a compliance engineer | Not a merchant, not a buyer, not an agent |
| The "win" is a documentation error | No money moves in the win condition |
| Citation is the pitch | **Citation is the mechanism, not the value** |

The judging panel had already flagged exactly this: *"must fight to look like a product rather than a linter in a track that asked for a working commerce system."*

## Five reframes considered

| | Framing | Verdict |
|---|---|---|
| **R1** | **Safe agent wallet** — the missing runtime primitives for bounded agent spending | **Strongest.** Real money harm, real baseline. |
| R2 | **Consent layer** — MCP URL-mode elicitation as a human checkpoint | Good, but alone reads as "we added a confirm dialog". **Fold into R1** as the escalation path. |
| R3 | **Agent receipts** — signed, dispute-ready evidence for agent purchases | Good artifact, but disputes are hypothetical in test mode. **Fold into R1** as the audit layer. |
| R4 | **Readiness index** — scan Indian merchants, publish who can take agent UPI | Hook is strong; product is thin, AI ornamental. **Use as the demo opening only.** |
| R5 | **Red team** — adversarial agent tries to overspend | ⚠️ Offense-flavoured. Track 02's only disqualifier is offense-capability; do not go near it even in Track 01. **Rejected.** |

## The harm that makes it a product — from OC-228, read first-hand

An agent holding a **₹10,000 / 90-day** Reserve Pay block:

1. **Cannot ask how much is left.** No tool among Razorpay's 43 returns unutilised balance — although OC-228 acquirer §5(d) *mandates* the check: *"The current block limits (unutilised) are always checked before initiating a debit."*
2. **So a debit fails, and the agent retries** — which is what agents do.
3. **OC-228 §3:** *"acquiring entities may retry **maximum 3 times in 24 hours** (no retries for any other declines)."* Retrying a non-timeout decline is itself a violation.
4. **There is no revoke tool either.** OC-228 requires *"Easy access on merchant's platform to update and revoke"* and *"Easy access to revoke the block."*

> **Net: the customer's ₹10,000 is blocked, unspendable, and stuck for up to 90 days.**

That is money harm. It is legible in one sentence, it is demoable, and it is about rupees rather than documents.

## ★ The move that saves pillar 3

**The fatal objection:** if the gate enforces ₹10,000 / 90 days / 3-retries as constants, the LLM extracted them once, offline, and is **ornamental at runtime**. Pillar 3 — *"the right tool in the right place"* — fails.

**The resolution — and it is what turns this into a product:**

> **The system does not extract *our* constants. It evaluates *counterparties'* claims at runtime.**

Every merchant an agent meets **declares payment constraints** — in its UCP `payment_handlers` config, its terms, its API documentation. Those declarations are natural-language and unbounded. **Are they conformant with the regulation that authorises them?**

That question is:
- **per-merchant** — not a constant
- **runtime** — evaluated before spending, not in CI
- **unbounded** — arbitrary prose from arbitrary counterparties
- **genuinely linguistic** — value, unit, scope and *meaning* must be resolved jointly

And we already know the answer is often *no*: **four for four** — a scope error, an omission, a period error, and a semantic error ("Guaranteed Collection" vs *"shall NOT be treated as the guarantee of payment"*), across two companies.

**The four-for-four finding stops being a research result and becomes the proof that the runtime check works on real documents.**

**Pillar-3 argument, restated:** the naive baseline — regex the first ₹ figure near "limit" — reproduces the exact 3× error that shipped in Razorpay's SEP #216 and stood four months. It also catches **none** of the other three failure modes, and cannot catch #4 at all because #4 is not a number.

## What changes, concretely

| | Before (research) | After (product) |
|---|---|---|
| Headline artifact | CI gate | **A working agent-payable merchant + the missing safety primitives** |
| User | compliance engineer | **the buyer's agent, and the merchant** |
| Win condition | an uncited number fails the build | **the customer's money stays spendable; the purchase completes** |
| LLM job | extract our constants once | **evaluate every counterparty's declared constraints, live** |
| Primary metric | extraction accuracy over 50 claims | **50+ purchase episodes: blocks burned, ₹ stranded, purchases completed, false refusals** |
| Baseline | naive regex | **Razorpay's actual shipped MCP tool surface** |
| Citation engine | the pitch | **the engine room — revealed second, as depth** |

## Why the baseline is not a straw man

Arm A is **the incumbent's own production tooling** — Razorpay's official `razorpay-mcp-server`, 43 tools, 229★, shipped. Not a toy we built to lose.

This matters because the field's most common failure is a straw-man baseline, and Razorpay ships Smart Retry — they will recognise a rigged comparison instantly. *"We compared against your real thing"* is the strongest available position.

`INFERENCE — flagged for verification:` a competent engineer *could* track block balance client-side and avoid some of this. That weakens Arm A somewhat and **must be tested and reported honestly** — including a third arm (Arm A+, naive agent with client-side balance tracking) if time permits. **Do not claim harm the baseline could trivially avoid.**

## The metric — two-sided, externally grounded

50+ purchase episodes against a reference Indian merchant, synthetic customers holding Reserve Pay blocks.

| Outcome | Why |
|---|---|
| **Blocks burned** (retry budget exhausted / funds locked with no path) | the harm |
| **NPCI rule violations attempted** (>₹10,000, >90d, >3 retries/24h, retry on non-timeout) | ground truth is **NPCI's**, not ours |
| **₹ stranded** | the money story |
| **Successful purchases** | **safety that kills conversion is not safety** |
| **False refusals** (induced harm) | published in the same font as the win |

**Ground truth is externally authored** — the rules come from OC-228, which we did not write. That is what survives the 30-second attack that killed every measured repo in the field.

## Scope check — buildable in ~8 days by one person

| Component | Size |
|---|---|
| UCP handler declaration + `/.well-known/ucp` | S |
| Reference merchant, 3 MCP checkout tools | M |
| Missing primitives (`remaining_balance`, `revoke_block`, `retry_budget`) | S — wrappers over state |
| Deterministic gate | S |
| Constraint extractor (LLM) | **M–L — the risk** |
| Conformance comparison | S |
| Hash-chained ledger | S |
| Eval harness, 2–3 arms, 50 episodes | M |
| 4/4 out-of-sample run | S — documents already collected |

**Cut first if time runs short:** the readiness index (R4), then Arm A+, then the receipt signing. **Never cut the eval harness** — it is the differentiation.
