# Correction: UPI Circle and UPI Reserve Pay are DIFFERENT RAILS

Two research agents reported conflicting limits. They were describing **two different products**. Reconciled 2026-08-26 against Razorpay's own documentation (`https://razorpay.com/docs/payments/payment-methods/upi/reserve-pay/`, HTTP 200) and NPCI circulars.

> ⚠️ **This corrects an earlier synthesis in `THE_LEGAL_SPINE.md` §3.** The claim "the per-purchase human trigger is legally mandatory" is **true for UPI Circle AI Profiles and false for UPI Reserve Pay.** The distinction changes the design — and in our favour.

---

## The two rails

| | **UPI Circle** (OC-201 / 201A / 201B) | **UPI Reserve Pay / SBMD** (OC-228) |
|---|---|---|
| What it is | Primary account holder **delegates** spending to a **secondary user** | Customer **blocks their own funds**; merchant debits against the block |
| Who spends | A different person (or an "AI Profile") | The merchant, within a customer-authorised envelope |
| Authorisation | Delegation set up once; secondary transacts | **Customer blocks with UPI PIN once** |
| Per-debit re-auth | AI Profiles: *"debit transactions using IoT shall be only initiated by explicit user action"* (OC-201B) | **None** — verbatim: *"debit exact amounts automatically as they fulfil orders… **without requiring additional customer authentication**"* |
| Limits | **₹5,000/txn, ₹15,000/month**, 5 delegates max | **`EVIDENCE NOT FOUND`** — see below |
| AI agent eligible? | **No** for full delegation (OC-201A restricts to KYC-verified family/employees). AI Profiles exist only as a **CUG pilot** (OC-201B) | Not person-scoped — the block is a merchant-side facility |
| Razorpay MCP support | **None** | **Yes** — `create_order` with `token.type = "single_block_multiple_debit"` |

**The rail Razorpay's agent surface actually implements is Reserve Pay, not Circle.** SEP #216 is about Circle; the MCP server is about Reserve Pay. They are not the same thing, and conflating them is exactly the error to avoid.

## Reserve Pay, in Razorpay's own words — `FACT`, verbatim

> *"Block customer funds upfront, debit as you deliver value."*
> *"UPI Reserve Pay with **Single Block Multi Debit (SBMD)** enables businesses to block customer funds upfront and debit automatically as products or services are delivered."*
> *"Customers block estimated spending amount in their account via **UPI PIN authorisation**."*
> *"Debit exact amounts instantly from the **pre-approved limit set by the customer**."*
> *"…**without requiring additional customer authentication**."*
> *"**Guaranteed Collection:** Funds are pre-blocked, ensuring you receive payment regardless of customer's later financial situation."*

Razorpay's own illustrative example: *"Customers reserve **₹2,000 monthly for groceries**."*

## ⚠️ Razorpay's docs assert limits and then do not state them — `FACT`

The page has a **"Limits"** heading followed by *"The following standard limits apply to UPI Reserve Pay:"* — and then **no table renders**. The next content is: *"Handy Tips — Contact our Support team to check eligibility or discuss custom configurations for specific use cases."*

So: **the numeric limits for Reserve Pay are `EVIDENCE NOT FOUND`.** The earlier "₹10,000 / 90 days" figure is single-sourced and unverified — **do not use it** until corroborated against OC-228 directly (the circular is a scanned image; `pdftotext` returns nothing).

## Why this correction *strengthens* the thesis

Under Reserve Pay, one human PIN authorisation creates a bounded envelope, and **every debit inside that envelope happens with no further human involvement.**

~~NPCI enforces the envelope's amount ceiling and nothing else — no payee restriction, no category, no velocity, no per-transaction sub-limit.~~ **← THIS WAS WRONG. See `../11_final_selection/OC228_READ_FIRSTHAND.md`.** OC-228 specifies a retry-velocity rule (max 3 per 24h, timeouts only), a structural per-(customer,merchant) payee binding, a mandatory pre-debit unutilised-balance check, and revocation. **The correct claim is that Razorpay's agent surface implements almost none of what NPCI specifies** — not that NPCI specifies nothing. Razorpay's MCP surface can express exactly three fields: `max_amount`, `frequency`, `expire_at`.

> **Therefore: the only thing standing between an autonomous agent and the money inside a customer's blocked funds is whatever constraint logic the merchant implements — and the official agent interface gives them three fields to do it with.**

That is a sharper and more honest argument than the earlier "human trigger is legally mandatory" framing:
- It does not depend on a CUG pilot (OC-201B) that is not generally available.
- It does not depend on UAP, which is not live.
- It describes a facility that is **documented, GA, and reachable from Razorpay's own MCP server today**.
- The risk is concrete and demonstrable rather than regulatory-hypothetical.

## What remains true from the earlier synthesis

- **RBI Authentication Directions 2025** (in force 1 Apr 2026) still require a factor unique to each transaction *for authentication events*. Reserve Pay's model is that the **block creation** is the authenticated event. `INFERENCE:` this is why SBMD exists as a distinct NPCI product — it front-loads AFA into the block.
- **MCP's URL-mode elicitation** remains the spec-blessed mechanism for any human checkpoint we choose to add — and adding one at block-creation time (or at a risk threshold) is a design choice we can defend, not a legal obligation we are satisfying.
- UPI Circle's ₹5,000 / ₹15,000 figures remain **correct for Circle**, and Razorpay's SEP #216 remains wrong by 3× **about Circle**.

## Action items
- [ ] Corroborate Reserve Pay numeric limits against **NPCI OC-228** (scanned; must be read as page images).
- [ ] Verify by execution whether test mode accepts `single_block_multiple_debit` (probe built: `tools/probe_testmode.py`).
- [ ] Amend `THE_LEGAL_SPINE.md` §3 to point here.
