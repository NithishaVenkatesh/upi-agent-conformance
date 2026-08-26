# OC-228 read first-hand — three corrections to our own corpus, and a fourth vendor misstatement

**NPCI/UPI/OC No.228**, "Enhancement in UPI Single Block Multiple Debits (UPI Reserve Pay)". Signed **Sourabh Tomar, Head UPI Product**. Scan `CreationDate: Wed 8 Oct 2025`.
Source: `corpus/npci/OC-228_SBMD_ReservePay_live-2026-08-26.pdf`, SHA-256 `f478fbc17a0391c8…`, fetched live (not Wayback). Page 2 read visually by this session.
**Evidence class: FACT — read from the document.**

---

## ✅ Confirmed: the Reserve Pay limits

> **Issuer §5:** *"The block created to be maximum of **Rs.10,000 of block limit and up to 90 days**."*
> **Acquirer §5(b):** *"Allow user to enter the amount and select the end date as per their choice up to maximum of **Rs.10,000 of block limit and up to 90 days**."*

Stated twice. **₹10,000 per block, 90 days. No monthly cap exists** — confirming Cashfree's "per month" restatement is wrong.

Also: *"Members are advised to enable UPI Reserve Pay to **all UPI-permitted source of funds** (including SA, CA, OD, RuPay Credit Card, pre-sanctioned Credit lines, etc.)"*

---

## ❌ CORRECTION 1 — "no velocity rule" was WRONG

I claimed NPCI enforces an amount ceiling and nothing else. **There is a velocity rule, and it is unusually specific:**

> **Acquirer §3:** *"the timeout on the debit transaction with Issuer/ Payer PSP shall be treated as a decline transaction and will be reversed in real-time and shall not be settled (not to be treated as deemed debit). **Only for afore-mentioned scenarios, acquiring entities may retry maximum 3 times in 24 hours (no retries for any other declines).**"*

**Max 3 retries per 24 hours, timeouts only, and no retries whatsoever for any other decline class.**

This is materially important, and it cuts **for** us rather than against: it is a hard, enumerable, per-decline-class rule that an agent could trivially violate, and **Razorpay's MCP server implements no retry accounting at all.** It is now the single sharpest example of a constraint that exists in the circular and is absent from the agent surface.

## ❌ CORRECTION 2 — "no payee restriction" was WRONG (structurally)

> **Issuer §4 (p1):** *"One mobile number (assumed as one customer) is allowed to create **only one block at a time for the particular merchant**."*
> **UPI Apps §2:** *"…consolidated view of all active blocks, **merchant specific display along with merchant name**…"*

The block is a per-`(customer, merchant)` object **by construction**. Payee-binding is not a control anyone sets — it is inherent to the primitive.

⚠️ **Stated honestly:** the sentence *"this block may only be debited by the bound merchant"* appears in **neither** circular. The single-merchant binding is a strong presupposition of §4's language plus §2's display requirement — it is **`INFERENCE`, not verbatim.** Annex A (referenced in OC-200 p3) is unpublished.

## ✅ CORRECTION 3 — "no category restriction" SURVIVES, precisely

There is **no MCC or merchant-category control.** The only qualitative gate is an *onboarding conduct obligation* on the acquirer:

> **Acquirer §1:** *"To begin with UPI Reserve Pay shall be enabled only for **online verified merchants with low ticket and high frequency transactions** and hence selection of the online merchants must adhere to this principle."*

Categories appear **only as examples governing debit *timing*, not eligibility**:
> **Acquirer §4:** *"…delivery of goods and service should only be after the confirmation of successful debit… for categories such as **quick commerce, food delivery**, etc. For use cases wherein amount is not fixed and is determined based on the services consumed (e.g.: **cab aggregators, EVs**, etc.), merchant may debit post successful delivery of services."*

Purpose codes (OC-200: `76` securities, `77` online goods/services) are **acquirer-set routing tags**, not category scoping.

---

## 🔴 THE FOURTH VENDOR MISSTATEMENT — and the first that is not a number

> **NPCI, OC-228, Acquirer §2, verbatim:**
> *"**The block created shall NOT be treated as the guarantee of payment**, only the successful debit response received by the merchant (for the debit initiated by the customer action on merchant's platform) shall be considered for payment."*

> **Razorpay's own Reserve Pay documentation, verbatim:**
> *"**Guaranteed Collection:** Funds are pre-blocked, **ensuring you receive payment regardless of customer's later financial situation.**"*

**These are direct contradictions.** NPCI says the block is explicitly *not* a payment guarantee; Razorpay's marketing page says it guarantees collection.

This is the **fourth** instance and a **new failure mode — semantic, not numeric.** No limit-checker that only compares rupee figures would catch it. It is a claim about *what the primitive means*, and it is contradicted by the circular that defines it.

| # | Vendor | Failure mode |
|---|---|---|
| 1 | Razorpay SEP #216 | **Scope** — monthly cap stated as per-transaction (3×) |
| 2 | Razorpay MCP server | **Omission** — no limit validation at all |
| 3 | Cashfree docs | **Period** — per-block cap stated as per-month |
| 4 | **Razorpay Reserve Pay docs** | **Semantic** — "Guaranteed Collection" vs *"shall NOT be treated as the guarantee of payment"* |

**Four for four. Two companies. Four distinct failure modes.** A regex catches none of them.

---

## What NPCI mandates that Razorpay's agent surface does not expose

> **Acquirer §5(d):** *"The current block limits (**unutilised**) are always checked before initiating a debit."*
> **Acquirer §5(e):** *"Display of original block value, **remaining balance**, expiry date and transaction history (including creation, debits, modification)."*
> **Acquirer §5(c):** *"Easy access on merchant's platform to **update and revoke** along with the responsibility of issuer to **validate every debit**."*
> **UPI Apps §1:** *"Easy access to **revoke** the block."*

NPCI **requires** that unutilised balance be checked before every debit and displayed to the user. ~~**Razorpay's MCP server has no tool that returns a block's remaining balance, and none that revokes a block.**~~
**← CORRECTION (same day). The revoke half of this is FALSE and it is my own drift.** `THE_GAP.md`, written by me from a full clone of `razorpay-mcp-server` @ `7950d51`, lists **`revoke_token`** among the 43 tools: *"Once revoked, the token cannot be used for future payments."* I contradicted my own source-read within hours. OC-228 UPI Apps §1 also mandates *"Easy access to revoke the block"* in the customer's own app — so there are two revoke paths.
**What survives:** no tool returns a block's **unutilised balance**, despite OC-228 acquirer §5(d) mandating that check before every debit. That gap is real. The revocation gap was not. See `FAILURES.md` entry #1.

## Net effect on the thesis

**The core conclusion holds and is now better evidenced:** none of the restrictions above is expressible or enforceable *per debit* through the agent surface. Anything richer than an amount ceiling must be built above the rail.

But the gap is now **more precisely stated, and partly smaller than I claimed**. NPCI does specify more than an amount: a retry-velocity rule, a structural payee binding, a pre-debit unutilised-balance check, and revocation. **The gap is not that NPCI specifies nothing — it is that Razorpay's agent surface implements almost none of what NPCI specifies.** That is a stronger and more defensible claim, and I was wrong to state the simpler version.
