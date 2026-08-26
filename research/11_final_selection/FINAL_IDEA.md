# FINAL IDEA (v2 — re-narrated, not re-architected)

**Track 01 — AI Growth & Agentic Commerce**
Global **82**/100 · Razorpay fit **90**/100 · Confidence **84**/100

---

## THE PITCH

> **Razorpay's own documentation tells merchants that UPI Reserve Pay guarantees collection. NPCI's circular says the opposite, in one sentence. A merchant who believes the documentation ships the goods, the debit declines, and the merchant eats the loss.**
>
> **We built the agent-payable Indian merchant that checks every payment claim against the circular that authorises it — and refuses, quoting the clause, when they don't match. We ran it against four real published documents. It caught all four.**

## THE ONE-SENTENCE VERSION

**An AI agent that verifies a merchant's payment terms against RBI and NPCI circulars before it spends — and can prove why it refused.**

---

## WHAT CHANGED FROM v1, AND WHY

v1 was correct but read as a compliance linter. The diagnosis was right — *citation is the mechanism, not the value* — but my first fix was wrong: I tried to re-architect around a "customer's money gets stuck" story that **collapses on OC-228's own text** (see `../10_idea_iterations/round_02/REFRAME_REVIEW.md`).

**What was wrong with my reframe, in short:**
- *"No revoke tool"* — **false.** `revoke_token` exists; OC-228 UPI Apps §1 mandates a second path in the customer's app. **This was my own drift** → `FAILURES.md` #1.
- *"A failed debit burns the block"* — **no mechanism in OC-228 produces this.** "Burned" would be a state only our simulator defines — i.e. a self-authored label, the exact tautology that killed every measured repo in the field.
- *The baseline is defeated by one subtraction:* `remaining = max_amount − Σ(merchant-initiated debits)`, and issuer §4 makes the merchant the sole debiting party. That is `days_to_estimated <= 2` in a new costume.

**So: the architecture stays. The story changes.** The legibility problem is fixed in the *demo order* and the *headline metric's framing* — about a day of work, no new subsystems — and it keeps the only asset that beat five rival ideas: **ground truth we did not author.**

---

## THE PROBLEM — money, merchant-facing, and true

**NPCI, OC-228, acquirer §2, verbatim:**
> *"The block created shall **NOT** be treated as the guarantee of payment, only the successful debit response received by the merchant… shall be considered for payment."*

**Razorpay's own Reserve Pay documentation, verbatim:**
> *"**Guaranteed Collection:** Funds are pre-blocked, **ensuring you receive payment regardless of customer's later financial situation.**"*

These are direct contradictions about **what the primitive means.**

And OC-228 acquirer §4 permits **post-service debit** for metered categories — *"cab aggregators, EVs, etc."* So the harm is concrete and ordinary:

> **A merchant reads "Guaranteed Collection", designs a ship-first flow, delivers the service, and then the debit declines. The merchant carries the loss.**

No invented state. No simulator. The victim is a **Razorpay merchant** — precisely who Razorpay serves.

## IT IS NOT ONE ERROR — four for four

| # | Vendor | Claim | Circular | Failure mode |
|---|---|---|---|---|
| 1 | Razorpay, ACP SEP #216 | ₹15,000 is a *"hard **per-transaction** limit"* | OC-201 §7: ₹15,000 is **monthly**; per-txn is ₹5,000 | **Scope (3×)** |
| 2 | Razorpay, MCP server | *no limit validation at all* | OC-228: ₹10,000/block, 90 days | **Omission** |
| 3 | Cashfree docs | ₹10,000 **per month** | OC-228 (twice): per **block** | **Period** |
| 4 | Razorpay Reserve Pay docs | *"Guaranteed Collection"* | OC-228 §2: *"shall NOT be treated as the guarantee of payment"* | **Semantic** |
| 5 | **This project** | *"no tool revokes a block"* | our own `THE_GAP.md`, same day | **Our own drift** → `FAILURES.md` #1 |

Timing kills the legacy-drift defence: Razorpay's Reserve Pay launch blog is **12 Mar 2026**; the MCP server HEAD is **26 Mar 2026**. The missing validation **shipped with the launch.**

**Framing rule — non-negotiable.** Never a gotcha. The systemic claim is both safer and truer: *constraint claims drift from the regulation authorising them; nothing catches it; here is the mechanism that does — and it caught us too.*

## WHY AI IS NECESSARY — pillar 3

Failure mode #4 **is not a number.** No regex, no limit-comparison, no schema check can catch *"Guaranteed Collection"* contradicting *"shall not be treated as the guarantee of payment."* It requires resolving what a **claim means** against what a **clause says**.

And the naive baseline — *"first ₹ figure near the word 'limit'"* — reads OC-201 §7 and returns ₹15,000 as per-transaction: **reproducing the exact error that shipped in Razorpay's standards PR and stood four months.** OC-201 §7 and §9 contain **three rupee figures with three different scopes in one paragraph.**

**The ablation ties this to money:** run the checker with a naive extractor config → it derives ₹15,000-per-transaction → and we report **the harm delta in rupees** across the batch. Pillar 3 is no longer an argument; it is a line item.

**Where we deliberately do NOT use an LLM** (published as a table — a direct hit on *"and where you chose not to use one"*): the enforcement gate, limit arithmetic, integer-paise handling, signature verification, idempotency, retry accounting. **The model never touches the money path.**

## THE METRIC — externally authored, which is the whole point

**Headline: conformance detection over 50+ payment-constraint claims** drawn from documents **we did not write** — NPCI circulars, RBI directions, published PSP specs, live UCP handler declarations, vendor documentation.

Framed as a **conformance rate, not an accuracy score** — "claims checked / violations found / clause cited" reads as a product output; "extraction accuracy" reads as a benchmark.

Reported on the same line as the headline: **effective n** · the **naive-regex baseline** (which reproduces the shipped 3× error and catches none of the semantic ones) · the **extractor ablation with harm in rupees** · **refusals and `UNDETERMINED`** as counted first-class outcomes · **induced harm** — every correct claim we wrongly flagged — in the same font as the win.

> Against the field's defining failure — *every measured repo has a compromised measurement target* — this is the only design where **the labels come from documents we did not author**, and where the system disagrees with a *published* third-party document and is right.

## THE 5-MINUTE DEMO — re-ordered for legibility

| # | Scene | Beat |
|---|---|---|
| 1 | **The hole** | `curl https://zouk.co.in/.well-known/ucp` → `com.google.pay`, `dev.shopify.card`. **No UPI.** A real Indian brand an agent cannot pay by UPI, in a country that is 80%+ UPI. |
| 2 | **The money** ★ | Merchant reads *"Guaranteed Collection"*, ships the service, debit declines, **merchant eats it — rupees on screen.** Then the circular, one sentence: *"shall NOT be treated as the guarantee of payment."* |
| 3 | **The check** | Our agent reads the merchant's declared terms, resolves the claim against OC-228, and **refuses — quoting the clause.** |
| 4 | **Controlled execution** | A conformant purchase completes: real Razorpay **test-mode** payment, inside the bound, hash-chained receipt. |
| 5 | **The closer** ★ | Point it at four real published documents — two Razorpay, one Cashfree, one our own. **4/4 — including ours.** |

Cart under **₹5,000**; block under **₹10,000**.

## RISKS

| Risk | Mitigation |
|---|---|
| Reads as a linter | **Fixed by scene order** — money first, mechanism second, out-of-sample last. |
| ~~NPCI 403s~~ | ✅ **Cleared.** 288 circulars archived; OC-201/OC-228/OC-200 retrieved, read, checksummed. |
| Test mode may reject the mandate flow | ⚠️ **The only open gate.** `tools/probe_testmode.py` awaits keys. Fallback: **ALT-2 Drift Index (78/80)** — zero test-mode dependency. |
| We are wrong about a limit ourselves | **Already happened once** (`FAILURES.md` #1). Now automated: `eval/self_conformance.py` runs the checker over our own corpus in CI. |
| Reads as an attack on a Razorpay engineer | Systemic framing only; **we are instance #5 in our own table.** |
| Competitor `aryanpajnee` | Contests the mandate layer, which we are not building. He has 153 unit tests and **no batch measurement.** |

## WHY THIS WINS

- **Problem taste** — a merchant losing money to a documentation contradiction, reproducible by the judge in ten seconds.
- **Build quality** — clone-and-run, deterministic money path, hash-chained ledger.
- **AI judgment** — one irreplaceable LLM job that a regex provably cannot do, plus a published table of where we refused to use one.
- **Failure recovery** — we became instance #5 of our own thesis in four days, caught it, and automated the check. **That box is read first, and ours is genuine and unchosen.**

## ALTERNATIVES ON FILE
**ALT-2 Drift Index** (78/80) — best global score, zero test-mode dependency, **the fallback if kill-gate 2 fails.**
**ALT-1 settlement-risk gate** (72/84) — its money story is merged into scene 2 above.
**ALT-3 ship the handler** (74/93) — highest fit, fails pillar 3 alone; already the host here.
