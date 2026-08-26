# Agent-readability, agent identity, and UCP — verified reference

Retrieved 2026-08-26. **FACT** unless labelled. Sources: IETF Datatracker API, vendor primary docs, `gh api`, direct `curl`.

---

## 1. ⚠️ UCP — Universal Commerce Protocol. The biggest thing nobody had surfaced.

`github.com/Universal-Commerce-Protocol/ucp` · Apache-2.0 · **★3,328** · `https://ucp.dev`

**Co-developed by:** Google, Shopify, Amazon, Microsoft, Meta, Salesforce, Stripe, Etsy, Target, Walmart, Wayfair (+ Amadeus/Booking/Expedia/Hilton/Marriott/Trip.com; DoorDash/Square/Toast/Uber Eats).
**Endorsed by:** Visa, Mastercard, PayPal, Adyen, Klarna, Checkout.com, Worldpay, Fiserv, Flipkart, SAP.
Versions: `v2026-01-11`, `v2026-01-23`, `v2026-04-08`, **`v2026-08-25` (latest)**.

**First-class MCP bindings with concrete tool names:**
- checkout (`dev.ucp.shopping.checkout`): `create_checkout`, `update_checkout`, `complete_checkout`
- catalog: `search_catalog`, `lookup_catalog`, `get_product`
- cart: `create_cart`, `get_cart`, `update_cart`, `cancel_cart`
- order: `get_order`

**It is SHIPPING IN PRODUCTION, unauthenticated, and testable in a hackathon right now.** Shopify serves `https://{shop}.myshopify.com/api/ucp/mcp` exposing exactly `search_catalog`/`lookup_catalog`/`get_product` — a byte-for-byte match with the UCP binding. Verbatim: *"Storefront MCP servers don't require authentication."* Requires an agent profile in `meta: {"ucp-agent": {profile: "…"}}` on every request.

Google's Merchant Center rollout gates the Buy button on attribute **`native_commerce(checkout_eligibility)`** — which does **not** appear in the public product data spec (grep count 0). US/CA/AU, participating merchants only.

⚠️ **ACP and UCP tool names collide semantically but differ lexically:** ACP `create_checkout_session`/`complete_checkout_session` vs UCP `create_checkout`/`complete_checkout`. **An adapter must not assume interchangeability.**

Stripe's own selection table (`docs.stripe.com/agentic-commerce`) reads verbatim: *"**Protocol used** | UCP or ACP | MPP or x402"* — a commerce-API layer over a machine-payments layer. **Stripe lists UCP first, despite co-maintaining ACP.**

## 2. 🔴 Razorpay is absent from every agentic-checkout list — the decisive competitive fact

`FACT`, verified by absence across primary sources:
- **Not** in ACP maintainer/partner material.
- **Not** in UCP co-developed or endorsed lists — **though Flipkart is**.
- **Not** among OpenAI's six supported checkout PSPs: **Stripe, PayPal, Adyen, Checkout.com, Fiserv, Worldpay**.
- Its own MCP server is **not** in the official MCP registry (only the unofficial `io.github.indiamcp/razorpay`).
- `razorpay/razorpay-mcp-server` sits in the **merchant back-office** category, not the **agentic-checkout** category.

> `INFERENCE — high confidence:` **Razorpay is structurally outside the agentic commerce checkout layer that is currently being built by everyone else.** Combined with their six stalled ACP PRs, this is not neglect — it is a company visibly trying and failing to get in. That is precisely why Track 01's why-now names four protocols by name.

## 3. Web Bot Auth — "which agent", and an explicit refusal to say "on whose behalf"

⚠️ **`draft-meunier-web-bot-auth-architecture` is SUPERSEDED — do not cite it.** Current:

> **`draft-meunier-webbotauth-httpsig-protocol-02`** — "HTTP Message Signatures for automated traffic", T. Meunier (Cloudflare) & S. Major (Google), **18 August 2026**, Standards Track.

WG `webbotauth` is real (charter approved 2025-10-23, AD Mike Bishop) but **has adopted ZERO drafts** — everything is individual submissions.

**Mechanism:** RFC 9421. Headers `Signature`, `Signature-Input`, and new **`Signature-Agent`** (Dictionary Structured Header, `https` URI values). `keyid` MUST be base64url **RFC 7638 JWK SHA-256 Thumbprint**; **`tag` MUST be `web-bot-auth`**. Discovery via `/.well-known/http-message-signatures-directory` (media type `application/http-message-signatures-directory+json`, body is a JWKS), or `jwks_uri`, or `cimd`.

**The trust model — quote this, it kills a lot of hand-waving:**
> §4.1: *"A client picks the value it sends, so an **unresolved Signature-Agent is a claim rather than an identity**… verifiers MUST NOT attach policy to it."* · *"A valid signature… **says nothing about who operates the Agent, whether the Agent is benign, or whether the request is authorized.**"*
> §4.6: *"This protocol **does not authenticate human users**, does not provide anonymous authentication, and **does not define authorization or delegation**."*
> Charter out-of-scope: *"Authenticating the end user"* and *"…agent-to-agent interfaces"*.

> **`INFERENCE`: Web Bot Auth answers "which agent" and explicitly REFUSES to answer "on whose behalf". That refusal is the gap.**

**Live in production today** (verified by curl): `https://chatgpt.com/.well-known/http-message-signatures-directory` → 200, Ed25519 JWKS; `https://agent.bot.goog/.well-known/…` → 200, 5 Ed25519 keys. Google: *"A **subset** of requests made by the `Google-Agent` are signed… **We don't sign every request.**"*
⚠️ **Interop split:** Google sends the **dictionary** form (`g="…"`); Cloudflare's docs require the **legacy bare-string** form. **Handle both.**

## 4. Agent identity in payments — comparison

| Scheme | Agent credential | Agent registry | **End-user identity** |
|---|---|---|---|
| Web Bot Auth | Ed25519/RSA key at Signature-Agent URL | No (registry is a `-03` draft with TODOs) | **Explicitly out of scope** |
| Cloudflare | WBA sig / IP / rDNS | Yes, proprietary (BotBase) | `Forwarded` — **experimental** |
| **Visa TAP** | RFC 9421 sig, keys at `mcp.visa.com/.well-known/jwks` | Implied via onboarding | **YES — Visa-signed `idToken` JWT** |
| Mastercard Agent Pay | claimed WBA + `Agent-pay-auth` | asserted; **key directory host NXDOMAIN** | Verifiable Intent (unverified) |
| Google AP2 | Agent key + Mandate JWTs | No — "trust list", left to Verifier | **YES — user-signed Mandate** |
| OpenAI ACP | **bearer API key** + optional HMAC | No | plaintext `Buyer{name,email,phone}` |

**Visa TAP** is the most complete real answer today. Three linked signatures: agent-recognition signature (*"aligned with web-bot-auth"*), **Agentic Consumer Recognition Object**, **Agentic Payment Container**. Two tags: **`agent-browser-auth`** and **`agent-payer-auth`** — *"If the header does not contain… a tag of either… the message has not been signed by a trusted agent."* Replay window **8 minutes**. `idToken` carries obfuscated `email`/`phone_number` + masks; *"the Merchant must also maintain a mapping table."*

**Google AP2 — CORRECT THE MANDATE NAMES.** "Intent Mandate"/"Cart Mandate" is **v0.1.0** terminology. **v0.2.0 (2026-04-28)**: *"AP2 defines two Mandate types: **Checkout Mandate** and **Payment Mandate**."* Intent-Mandate generalised into **Open Mandate**/**Closed Mandate**. Five roles incl. **Trusted Surface** — *"The following role **MUST** be non-agentic: Trusted Surface."* Modes "Human Present (Direct)"/"Human Not Present (Autonomous)". Wire: OpenID4VP `transaction_data`, `dc+sd-jwt`, `vct_values: ["com.emvco.dpc"]`. Verbatim: *"designed explicitly to be compatible with the **Universal Commerce Protocol (UCP)**."* **No MCP binding for AP2 — EVIDENCE NOT FOUND.**

**Mastercard Agent Pay — HYPOTHESIS-grade only.** `developer.mastercard.com/llms.txt` (486 KB) has **zero** matches for "Agent Pay"; `agentpay-key-directory.mastercard.com` → **NXDOMAIN**. One useful verbatim quote though: *"**Consumer-owned agents will not have scheme credentials — and that is expected.**… avoid blocking agents solely because they lack scheme registration."*

## 5. MPP — Machine Payments Protocol (Stripe + Tempo)

`https://mpp.dev`. HTTP 402 challenge → authorize → retry → `Payment-Receipt` header. Extensible **Challenge–Credential** model. Dedicated guide **`/guides/monetize-mcp-server`** — *"Add payments to your MCP server. Charge per tool call"* — plus `/guides/use-mpp-with-x402`. Tooling: npm **`mppx` 0.8.19**, samples `github.com/stripe-samples/machine-payments`.

## 6. Crawler control — the distinction that actually matters

Training vs search vs **user-triggered fetcher**. **Blocking the third blocks your buyers.**

| Vendor | Training | Search | **User-triggered (= the buyer)** |
|---|---|---|---|
| OpenAI | `GPTBot` | `OAI-SearchBot` | **`ChatGPT-User`** |
| Anthropic | `ClaudeBot` | `Claude-SearchBot` | **`Claude-User`** |
| Google | `Google-Extended` | `Googlebot`, `Storebot-Google` | **`Google-Agent`** |
| Perplexity | — | `PerplexityBot` | **`Perplexity-User`** |
| Meta | `meta-externalagent` | `meta-webindexer` | **`meta-externalfetcher`** |

Verbatim: OpenAI — *"**Because these actions are initiated by a user, robots.txt rules may not apply.**"* · Perplexity — *"**this fetcher generally ignores robots.txt rules.**"* · Meta — *"**this crawler may bypass robots.txt rules.**"*

→ **A `Disallow` on user-triggered fetchers buys nothing but lost sales.**

⚠️ **Fork in the road:** Cloudflare's deployed **`Content-Signal:`** (`search`/`ai-input`/`ai-train`, `yes`/`no`) vs IETF's **`Content-Usage:`** (`draft-ietf-aipref-attach-05`; `search`/`train-ai`, `y`/`n`). They disagree on **directive name, token names, AND value encoding**. Parse both. `draft-ietf-aipref-vocab-07` carries *"its contents **DO NOT REFLECT CONSENSUS**."*

Cloudflare: *"**Signed agents are now Verified.** As of July 1, 2026… **Direct** versus **Intermediary** access."* Behaviour taxonomy includes **`Transact` — "Checkout or other transaction actions on behalf of users."** On intermediaries: *"This introduces **transitive trust**… Cloudflare is **experimenting with forwarding information about the end user (RFC 7239 `Forwarded`)**."* → experiment, not a contract. **Pay per crawl is private/closed beta**: `HTTP/2 402` + `crawler-price` → `crawler-exact-price`/`crawler-max-price` → `crawler-charged`. Payment headers **MUST** be in the `signature-input` covered components.

## 7. llms.txt — ship it, never pitch it

Proposal by Jeremy Howard (Answer.AI), 2024-09-03; `AnswerDotAI/llms-txt` ★2,586. **A v2 shipped August 2026** — most online commentary describes v1. v2 adds `.md` page twins, discovery via `rel="alternate" type="text/markdown"` and `rel="describedby"` (deliverable as an HTTP `Link:` header), and **explicitly rejects `/.well-known/`**. `llms-full.txt` is a **Mintlify convention, not in the spec**.

**Google has denied adoption three times on the record** (primary Bluesky posts):
- **John Mueller, 2025-06-17:** *"**FWIW no AI system currently uses llms.txt.**"*
- **Gary Illyes, 2025-07-31** (attribution commonly misreported as Mueller): *"…easy to draw a parallel between 1990's keywords meta tag and this…"*
- **Mueller, 2026-01-20**, asked if Google hosting one is an endorsement: *"…**to be direct, no.**"*

Occurrences of "llms.txt" in crawler docs: Google ×0, Anthropic ×0; OpenAI ×1 and Perplexity ×2 — **all Mintlify publisher banners**. Chrome Lighthouse does now ship an experimental "Agentic browsing" audit category (incl. `WebMCP` audits), but verbatim: *"If the file is not provided… the audit is marked **Not Applicable**"* — **not having one costs nothing.**

→ **VERDICT: ship it (cost ≈ 0), never pitch it.** Defensible claim: *"we serve `.md` page twins with `rel=alternate` `Link:` headers per llms.txt v2"* — **not** *"ChatGPT reads our llms.txt."*

## 8. schema.org — no agent affordances, with one exception

`ItemAvailability` has 12 values; **Google supports only 10** (`MadeToOrder`, `Reserved` absent). `OfferItemCondition` has 4; **Google supports 3** (no `DamagedCondition`).

One notable property: **`checkoutPageURLTemplate`** — a merchant-supplied deep-link template into checkout. `INFERENCE:` the closest thing in core schema.org to an "agent, buy this" affordance.

**Agent-specific schema.org work: EVIDENCE NOT FOUND.** Latest release 30.0 (2026-03-19); direction is GS1/UN-CEFACT/EU Digital Product Passport interop. Google's agent-facing work sits **outside** schema.org (Lighthouse/WebMCP, UCP in Merchant Center).

## 9. Feed specs — required-field divergence

- **Google Merchant Center** unconditionally required: `id`, `title`, `description`, `link`, `image_link`, `availability`, `price`. `availability` = exactly `in_stock`/`out_of_stock`/`preorder`/`backorder`. New and agent-relevant: `structured_title`/`structured_description` carry **`digital_source_type`** ∈ `default` | `trained_algorithmic_media` — **provenance labelling for AI-written copy**, driven by EU/India/NY regulation.
- **ACP feed** — `Product` requires `id`, `variants`; `Variant` requires `id`, `title`; `Price.amount` is **integer minor units**. Enums are deliberately **open**, not JSON Schema `enum`s. Feeds are **non-authoritative**: *"Agents MUST treat checkout responses as authoritative even when they differ from feed data."*
- **Microsoft MMC** — 16 required fields; **`description` is NOT required** (diverges from Google); `availability` uses **spaces** (`in stock`).

## 10. Commerce MCP servers — verified inventory

| Vendor | Repo | Remote | Auth | Tools |
|---|---|---|---|---|
| **Razorpay** | `razorpay/razorpay-mcp-server` (official, MIT, ★229, pushed 2026-08-25) | `https://mcp.razorpay.com/mcp` | **HTTP Basic** (`Basic base64(key:secret)`), *not* OAuth | ~45, one-per-endpoint, plus `detect_stack` and `integrate_razorpay_checkout` |
| Stripe | `stripe/ai` (renamed from `stripe/agent-toolkit`, ★1,763) | `https://mcp.stripe.com` | **OAuth 2.1** | 4 generic (`stripe_api_search`/`_details`/`_read`/`_write`) |
| PayPal | `paypal/agent-toolkit` (★189) | `https://mcp.paypal.com` | — | ~44 |
| Square | `square/square-mcp-server` (Beta, ★107) | `https://mcp.squareup.com/sse` | OAuth | 3 |
| Adyen | `Adyen/adyen-mcp` (**Alpha**, ★25) | local only | API key | 38 |

Razorpay tools unavailable on the remote server: `create_refund`, `close_qr_code`, `create_instant_settlement`, `create_registration_link`.
**Amazon / BigCommerce / Pine Labs MCP servers — EVIDENCE NOT FOUND.**

## 11. Traps — do not repeat these

1. `developer.mastercard.com/product/<anything>` returns **HTTP 200 for every path** (JS SPA). A 200 there is **not** existence evidence.
2. **"Universal Cart" — EVIDENCE NOT FOUND; do not use the term.** Actively falsified: Shopify's full sitemap (43,433 URLs) has zero matches for "universal". `HYPOTHESIS:` a garbling of the real **UCP Cart Capability**. Say "UCP Cart Capability".
3. **"Instant Checkout" — EVIDENCE NOT FOUND** in current OpenAI docs, the ACP repo, or Stripe's docs. **Do not cite a launch-partner list for it.**
4. `draft-meunier-web-bot-auth-architecture` is **superseded** — cite `draft-meunier-webbotauth-httpsig-protocol-02`.
