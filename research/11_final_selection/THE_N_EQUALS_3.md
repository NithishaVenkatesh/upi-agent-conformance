# The thesis is no longer argued — it is demonstrated five times, and one of them is ours

**Every restatement of an NPCI constraint encountered in this entire effort has been wrong — including our own.**

⚠️ **Instance #5 is us.** A project whose thesis is *"restatements drift from their source"* drifted from its own source in four days. It is included here deliberately: it is the strongest evidence that the mechanism is needed, and removing it would be the same act of convenient editing the thesis condemns.
Three independent instances, three different vendors, three different failure modes. Only the circulars themselves and NPCI's own product page have held up.

| # | Who | The claim | The circular | Failure mode |
|---|---|---|---|---|
| 1 | **Razorpay**, ACP SEP #216 (public standards body, reviewed by Stripe + Meta) | *"NPCI's UPI Circle specification imposes a hard **per-transaction** limit"* of ₹15,000 | OC-201 item 7: ₹15,000 is the maximum **monthly** limit per delegation; **per-transaction is ₹5,000** | **Scope error — 3×.** Right number, wrong unit. |
| 2 | **Razorpay**, official MCP server (`create_order`, `token.max_amount`) | *no limit stated or validated at all* | OC-228: block capped at **₹10,000**, up to **90 days** | **Omission.** The cap simply is not there. |
| 3b | **Razorpay**, Reserve Pay documentation | *"**Guaranteed Collection:** Funds are pre-blocked, ensuring you receive payment regardless of customer's later financial situation."* | OC-228 acquirer §2: *"The block created shall **NOT** be treated as the guarantee of payment"* | **Semantic.** Not a number at all — no regex or limit-check can catch it. |
| **5** | **THIS PROJECT** | *"no tool revokes a block"* (written in 2 documents) | Our own `THE_GAP.md`, written the **same day** from a full clone, lists `revoke_token` among the 43 tools | **Our own drift** — and it ran in the direction that made our gap look bigger. See `../../FAILURES.md` #1. |
| 3 | **Cashfree**, public documentation | cap is ₹10,000 **per month** | OC-228, twice: *"the **block** created to be maximum of Rs.10,000 of **block limit** and up to 90 days"*; NPCI product page: *"₹10,000 **per block**"* | **Period error.** A per-block cap restated as per-month — and contradicted by the 90-day block lifetime. |

`FACT` — instance 1 verified by this session reading OC-201 directly; instance 3 verified by OCR of OC-228's pages, resolving a conflict a prior pass had to leave open.

## Why this changes the project

**Before:** "We found an error in a Razorpay engineer's pull request." — an anecdote, `n=1`, and awkward to present to a panel that may include him.

**After:** *"Vendor restatements of NPCI limits drift from the circulars that authorise them. We found three, across two companies, in three different ways, while doing ordinary research. Nothing catches this class of error. Here is the mechanism that does."*

Three consequences:

1. **The gotcha problem dissolves.** It is no longer about one engineer or one company. Razorpay is 2 of 3, but so is the pattern — and a Cashfree instance proves it is industry-wide, not a Razorpay competence issue.
2. **It is a measured phenomenon, not a claim.** `n=3` from an unsystematic sweep implies a base rate worth measuring properly — which is exactly what the batch metric does, over 50+ constraint claims from documents we did not author.
3. **The failure modes are distinct**, which is the strongest possible argument that a *general* checker is needed rather than three point fixes: scope error, omission, period error. A regex for "₹15,000" catches none of them.

## Timing kills the "legacy drift" defence — `FACT`

- Razorpay's Reserve Pay **launch blog: 12 Mar 2026**
- Razorpay MCP server HEAD inspected: **26 Mar 2026**

The missing limit validation is **not** old code that drifted. **It shipped with the launch, two weeks later.**

## Reserve Pay limits — now settled

| Parameter | Value | Source |
|---|---|---|
| Block maximum | **₹10,000 per block** | OC-228, stated twice; NPCI product page |
| Block lifetime | **up to 90 days** | OC-228 |
| Monthly cap | **none exists** | absent from both circulars |
| Launch | **8 Oct 2025**, RBI Governor, at GFF — scoped to *"UPI SBMD **on Credit Accounts**"* | NPCI press release (primary) |

⚠️ **Nuance worth stating correctly:** "launched Oct 2025" is misleading. The *feature* dates from **OC-200 (Jul 2024**, enablement deadline Nov 2024). What launched in Oct 2025 was the **credit-account extension plus the brand name**.

**Apps (vendor-stated, live pages):** BHIM, INDMoney, Navi (10 Oct 2025), Paytm.
**Marked LOW — do not cite:** BHIM SBI, PhonePe, GPay, BOB epay — search-snippet only, unreproducible on live pages.
**Banks: `EVIDENCE NOT FOUND`** — no issuer has published anything.

## A trap that cuts our way

Paytm's March 2025 "SBMD launch" is **stock-trading blocks** on Axis/Yes Bank handles — **purpose code 76 at ₹5 lakh**, not the ₹10,000 merchant track.

This is independent real-world evidence that **the two purpose codes ship as separate products with different limits** — strengthening the inference that OC-228's ₹10,000 does not reach PC-76, and illustrating precisely the *scope* ambiguity that produces failure mode #1.
