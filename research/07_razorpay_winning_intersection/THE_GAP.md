# The Gap — verified first-hand against Razorpay's own source

| Field | Value |
|---|---|
| Method | Full clone of `razorpay/razorpay-mcp-server` @ `7950d51`, tool registrations enumerated from `pkg/razorpay/*.go` |
| Verified by | This session, directly from source — **not** taken from an agent's report |
| Retrieved | 2026-08-26 |
| Evidence class | **FACT** |

> ⚠️ **A research agent reported that Razorpay's MCP server has "no mandate primitives — not one tool creates, inspects, bounds or revokes a Reserve Pay block." That is wrong**, and I corrected it by reading the source. The truth is more interesting and much more useful: **the primitives exist but are almost empty.**

---

## 1. The complete tool surface — 43 tools

```
capture_payment · close_qr_code · create_instant_settlement · create_order
create_payment_link · create_qr_code · create_refund · create_registration_link
fetch_all_instant_settlements · fetch_all_orders · fetch_all_payment_links
fetch_all_payments · fetch_all_payouts · fetch_all_qr_codes · fetch_all_refunds
fetch_all_settlements · fetch_instant_settlement_with_id
fetch_multiple_refunds_for_payment · fetch_order · fetch_order_payments
fetch_payment · fetch_payment_card_details · fetch_payment_link
fetch_payments_for_qr_code · fetch_payout_with_id · fetch_qr_code
fetch_qr_codes_by_customer_id · fetch_qr_codes_by_payment_id · fetch_refund
fetch_settlement_recon_details · fetch_settlement_with_id
fetch_specific_refund_for_payment · fetch_tokens · initiate_payment
payment_link_notify · payment_link_upi_create · resend_otp · revoke_token
submit_otp · update_order · update_payment · update_payment_link · update_refund
```

## 2. What mandate support actually exists — `FACT`, verbatim from `pkg/razorpay/orders.go`

`create_order` **does** create a UPI Reserve Pay block:

> *"For MANDATE ORDERS (recurring payments): You MUST provide ALL of these fields: amount, currency, method='upi', customer_id (starts with 'cust_'), and token object."*
>
> *"The token object … must contain: **max_amount** (positive number in paise), **frequency** (`as_presented`/`monthly`/`one_time`/`yearly`/`weekly`/`daily`), **type='single_block_multiple_debit'** (only supported type), and optionally **expire_at** (Unix timestamp, defaults to today+60days)."*

Supporting tools: `fetch_tokens` (list a customer's saved instruments), `revoke_token` (*"Once revoked, the token cannot be used for future payments"*).

`single_block_multiple_debit` **is** UPI Reserve Pay — NPCI's UPI Single Block Multiple Debits, per circular OC 228.

## 3. The gap, stated exactly

**The entire spend authority expressible on Razorpay's agent surface is three fields:**

| Expressible | Field |
|---|---|
| An amount ceiling | `max_amount` (paise) |
| A frequency bucket | `frequency` ∈ `as_presented`/`monthly`/`one_time`/`yearly`/`weekly`/`daily` |
| An expiry | `expire_at` (default today + 60 days) |

**Not expressible — verified absent from all 43 tools and from the token schema:**

| Missing constraint | Why it matters |
|---|---|
| **Allowed payees / merchant restriction** | The block does not say *who* may be paid. |
| **Category (MCC) restriction** | Cannot say "groceries, not electronics". |
| **Velocity** (N debits per period) | `frequency` is a bucket label, not a rate limit. |
| **Per-transaction cap distinct from cumulative cap** | One ceiling serves both meanings. |
| **Decrement-on-refund** | No rule for restoring budget when money comes back. |
| **Purpose / scope binding** | Nothing binds the money to *what it is for*. |
| **Conditional or contextual rules** | No "only if in stock", "only below quoted price". |
| **Inspect remaining balance of a block** | No tool answers "how much of this mandate is left?" |

**Comparator:** Google's AP2 specifies **eight** constraint types verbatim (`agent_recurrence`, `budget`, `amount_range`, `allowed_payees`, …). ACP is *worse* than Razorpay — `Allowance.reason` has exactly one legal value, `one_time`, single-use, one merchant, one session.

> **`INFERENCE` — the thesis, in one sentence:**
> **India has a live delegated-payment rail (UPI Reserve Pay, OC 228) and an official agent interface to it (Razorpay MCP), but the authority you can express across that interface is an amount, a cadence label, and a date — which is not enough to safely let an agent spend money on your behalf.**

This is not a gap in a draft spec that may never ship. It is a gap between **two things Razorpay already operates in production**.

## 4. A second, safety-shaped observation — `FACT`

From `pkg/razorpay/payments.go` (~line 929), the server instructs the model:

```go
response["next_tool"] = "submit_otp"
response["next_tool_params"] = map[string]interface{}{
    "payment_id": paymentID,
    "otp_string": "{OTP_CODE_FROM_USER}",
}
```
> *"Use 'submit_otp' tool with the OTP code received from user to complete payment authentication."*

**The LLM is in the loop for the Additional Factor of Authentication step** — the step RBI mandates specifically to ensure a *human* authorised the debit. The model is instructed to collect the OTP from the user and submit it.

This is a **design observation about an open-source tool, offered defensively** — it argues for *more* human-checkpointing, not less, and suggests no attack. It matters because it is the sharpest available illustration of the thesis: the agent surface can broker the human-authorisation factor, but cannot express a spending bound.

**MCP's own normative rule points the other way.** The only RFC-2119 sentence about payments in the entire MCP spec:
> *"Servers **MUST NOT** use form mode elicitation to request sensitive information such as passwords, API keys, access tokens, or **payment credentials**. Servers **MUST** use URL mode for interactions involving such sensitive information."*

→ **URL-mode elicitation is the spec-blessed human checkpoint, and nothing in the Indian agent surface uses it.**

## 5. Why the surrounding standards do not close this

| Layer | What it says about "on whose behalf, within what bounds" |
|---|---|
| **Web Bot Auth** (`draft-meunier-webbotauth-httpsig-protocol-02`) | Explicitly refuses: *"does not authenticate human users… **does not define authorization or delegation**."* Answers *which agent*, not *for whom*. |
| **ACP** | `Allowance`: one merchant × one session × one currency × max amount × expiry, **single-use**. Card-only. Stripe SPT excludes India. Razorpay's six PRs to fix this are **stalled for want of a TSC sponsor**. |
| **MCP** | **No payment primitive.** SEP-2007 closed unmerged 2026-06-24 for want of a sponsor. Human approval is **SHOULD, unenforced**; tool annotations explicitly *"untrusted"*. |
| **UCP** | Shipping, MCP-native, backed by Google/Shopify/Amazon/Microsoft/Stripe/Visa/Mastercard — **and Razorpay is in neither its co-developed nor endorsed lists** (Flipkart is the only Indian name). Notably, **UCP invites a regional PSP to publish a payment handler with no committee approval.** |
| **NPCI UAP** | **Not live — verified negative.** Zero matches for `agentic` / `unified agent` / `UAP` across **all 221 NPCI UPI circulars, 2019–2026**. "Pending RBI approval" traces only to one anonymously-sourced Business Standard line; no RBI or NPCI document mentions UAP at all. Correct name is *Unified Agent Protocol*. |

## 6. What this licenses us to claim — and what it does not

**Can claim (`FACT`):**
- Razorpay's official agent interface can express only amount + cadence + expiry.
- AP2 specifies eight constraint types; ACP's allowance permits one use.
- UAP is not live and is not mentioned in any NPCI circular.
- Razorpay is absent from ACP partners, UCP backers, and OpenAI's six checkout PSPs.
- The OTP/AFA step is model-brokered in the official server.

**Must NOT claim:**
- ❌ *"Nobody is working on bounded agent spend authority."* **False** — `aryanpajnee/RazorpayBuildathon` is doing signed, bounded mandates competently (see `../05_agentarch/ARYAN_direct_competitor.md`).
- ❌ *"UAP requires RBI approval."* Reported, not documented. Attribute it.
- ❌ *"Razorpay has no mandate primitives."* False — corrected above.
- ❌ Any framing that reads as an exploit against the OTP flow.

## 7. The differentiation, given the competitor

The mandate layer is occupied. The field's **universal** blind spot is not:

> **Every measured repo in the field has a compromised measurement target.** Nobody checks label leakage, nobody builds an honest baseline, nobody ablates, nobody reports effective `n`. And the closest competitor has no measurement at all yet.

So the defensible position is not "we invented bounded mandates". It is: **a constraint layer over UPI Reserve Pay whose headline number survives a determined attack** — real baseline, ablation proving the constraint engine is load-bearing, effective `n` reported, and refusals counted as first-class outcomes rather than hidden.

## Open — pending the India-rails agent
- Exact NPCI limits for UPI Reserve Pay / UPI Circle (per-transaction, cumulative, delegate count, mandate lifetime). Needed to ground constraints in real regulatory ceilings rather than invented ones.
- Whether test mode actually permits `single_block_multiple_debit` order creation end-to-end. **This is the feasibility gate for the whole direction and must be tested by execution, not assumed.**
