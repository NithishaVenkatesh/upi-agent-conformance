# The UPI Hole — verified live, first-hand, reproducible in ten seconds

| Field | Value |
|---|---|
| Method | `curl https://<domain>/.well-known/ucp` against live Indian D2C storefronts |
| Verified by | This session, directly. Raw responses archived in `evidence/`. |
| Retrieved | 2026-08-26 |
| Evidence class | **FACT** |

## The finding

Four major Indian D2C brands serve **live UCP `2026-04-08` profiles** with working MCP endpoints. Every one of them declares exactly two payment handlers, and **not one accepts UPI.**

| Merchant | `payment_handlers` | Methods |
|---|---|---|
| zouk.co.in | `com.google.pay`, `dev.shopify.card` | CARD, card |
| bombayshavingcompany.com | `com.google.pay`, `dev.shopify.card` | CARD, card |
| boat-lifestyle.com | `com.google.pay`, `dev.shopify.card` | CARD, card |
| mamaearth.in | `com.google.pay`, `dev.shopify.card` | CARD, card |

Verbatim from `https://zouk.co.in/.well-known/ucp` (full copy in `evidence/`):

```json
"payment_handlers": {
  "com.google.pay": [{ "id": "gpay", "version": "2026-01-11",
    "config": { "allowed_payment_methods": [{
        "type": "CARD",
        "parameters": { "allowed_card_networks":
          ["VISA","MASTERCARD","AMEX","DISCOVER"] },
        "tokenization_specification": { "type": "PAYMENT_GATEWAY",
          "parameters": { "gateway": "shopify" } } }] } }],
  "dev.shopify.card": [{ "id": "shopify.card", "version": "2026-01-15",
    "spec": "https://ucp.dev/specification/payment-handler-guide",
    "config": { "payment_methods": [{ "type": "card",
      "enabled_card_brands":
        ["visa","master","american_express","discover","diners_club"] }] } }]
}
```

Note that even the Google Pay handler is `"type": "CARD"` — **not** UPI-via-GPay.

## Why this is the finding

> **An AI agent shopping at an Indian brand, for an Indian customer, can pay by Visa, Mastercard, Amex, Discover or Diners Club — in a country where UPI is 80%+ of digital payments.**

The agentic commerce surface for Indian merchants is **card-only**. India is on the agentic map for *discovery* and off it for *payment*.

Corroborating facts:
- Google's agentic Buy button (`native_commerce(checkout_eligibility)`) serves **US / Canada / Australia only**.
- ACP's `delegate_payment` supports *"exactly one credential type: card"*; Stripe's Shared Payment Tokens cover *"the US, Canada and select European countries"* — India unnamed.
- Razorpay's six PRs to add UPI to ACP: five open, none merged, stalled since 2026-05-15 for want of a TSC sponsor. Their own words: *"600M+ UPI users have no ACP-native in-chat payment path… UPI is 80%+ of India's digital payments, $2.6T annually."*
- **NPCI UAP is not live** — zero matches across all 221 NPCI UPI circulars, 2019–2026.

## Why it is buildable rather than merely true

The handler is **a self-declared JSON block against a published guide** — `https://ucp.dev/specification/payment-handler-guide`, referenced by Shopify's own live handler above.

**UCP explicitly invites a regional PSP to publish a payment handler with no committee approval.** This is the exact inverse of ACP, where Razorpay has been blocked for 3.5 months awaiting a sponsor. `in.razorpay.upi` can be written, published and demonstrated by anyone, today, without permission.

`keys[]` is unpopulated on all four merchants — the slot UCP defines for merchant attestation is empty everywhere.

## What this licenses — and what it does not

**Claim (`FACT`, reproducible by the judge in ten seconds):** four live Indian merchants expose agentic checkout that cannot take UPI.

**Do NOT claim:**
- ❌ *"The sell-side is unsolved."* **Refuted.** Indian merchants already serve UCP profiles, `llms.txt`, and MCP endpoints — Shopify generates them automatically. Agent-readiness auditing is an established OSS genre dating to April 2026, and ≥20 sell-side Buildathon repos exist. **Catalog legibility is solved; payment is not.**
- ❌ *"Nobody is building bounded agent mandates."* **Refuted** — see `../05_agentarch/ARYAN_direct_competitor.md`.
- ❌ That a published handler is *adopted*. Publishing a spec-conformant handler and a conformance harness is the contribution; merchant adoption is not in our gift.

## Hard constraints that shape the build — from the Track 01 deep-dive

| Constraint | Value | Consequence |
|---|---|---|
| RBI AFA threshold | **₹15,000** | Keep the demo cart **under ₹15,000** or the flow needs step-up auth. |
| UPI Reserve Pay cap | **₹10,000 / 90 days** (pending corroboration) | The realistic mandate envelope. |
| UPI Collect | **died 28 Feb 2026** | Do not design around it. |
| AP2 signing | **ECDSA, not Ed25519** | Several Buildathon repos — including the direct competitor — use Ed25519. If confirmed, this is a spec-conformance error the field shares. |
| Reserve Pay on test keys | **UNDOCUMENTED** | ⚠️ **Architecture-gating. Verify by execution on day 1.** Fallback: UPI AutoPay. |

## Two reversals recorded rather than hidden

The Track 01 agent overturned two of its own conclusions, and they are preserved:
1. It first called merchant trust *"the most crowded space of all"* — wrong. The crowded direction is **agent→merchant**; **merchant→agent is near-empty**. ACP forbids the reverse *by design* (`MUST NOT` return `merchant_id`).
2. It measured schema.org JSON-LD across ten storefronts as evidence of agent-legibility — then found ACP, UCP and OpenAI's commerce docs contain **zero** schema.org references. **That measurement was of the wrong surface.** Retained with the correction attached — a useful reminder that measuring the wrong target is the field's defining failure.

## The second surviving gap: nothing verifies the merchant to the agent

Visa TAP, Mastercard Agent Pay, Forter, ACP and AP2 all verify **the agent**. None verifies **the merchant**.

Razorpay already computes this verdict today from KYC and dispute rate — and renders it as **an icon a human clicks**: *"You can validate that a business is a Razorpay Trusted Business by clicking on the RTB icon."*

`INFERENCE:` a human-clickable trust badge is useless to an agent. Minting that same verdict as a signed, agent-queryable attestation into the `keys[]` slot UCP already defines — and which **0 of 4 Indian merchants populate** — is a payments-native contribution only a PSP can credibly make.
