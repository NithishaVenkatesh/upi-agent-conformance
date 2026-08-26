# ACP — Agentic Commerce Protocol: verified spec reference

| Field | Value |
|---|---|
| Repo | `github.com/agentic-commerce-protocol/agentic-commerce-protocol` |
| Read at HEAD | `7fdd78df677a94dce04c770644b0fbbb1401272b` (2026-07-18), full clone |
| Retrieved | 2026-08-26 |
| License | Apache-2.0 · `NOTICE`: Copyright 2025 OpenAI / Copyright 2025 Stripe |
| Spec version | **`2026-04-17`** (date-based, directory-per-version, no semver) |
| Tags / releases | **both empty** — no tagged artifact; a "release" is a directory |
| Status | `beta`; individual RFCs `Draft` or `Proposal` |
| Stars / forks | 1,523 / 242 |
| Evidence class | **FACT** — read directly from spec files unless labelled otherwise |

Released versions: `2025-09-29` · `2025-12-12` (fulfillment) · `2026-01-16` (capability negotiation) · `2026-01-30` (extensions, discounts, payment handlers) · `2026-04-17` (cart, feed, orders, authentication, MCP) · `spec/unreleased/`.

Vendor docs: OpenAI https://developers.openai.com/commerce/ (append `.md` for markdown) · Stripe https://docs.stripe.com/agentic-commerce

---

## 1. ⚠️ THERE ARE TWO INCOMPATIBLE PRODUCT FEED SPECS

**1A — repo Feed API (JSON, aspirational).** `spec/2026-04-17/openapi/openapi.feed.yaml`, `rfcs/rfc.product_feeds.md` (**Status: Proposal, unreleased**).

Direction is **inverted vs checkout**. Verbatim §3.1: *"The Product Feed API is hosted by the agent. Merchants and seller platforms call these endpoints… **Agents MUST NOT call Product Feed API endpoints on merchants**."* Changelog: *"a **push model**: merchants push product catalog metadata and product records to Agents."*

| Method + Path | operationId |
|---|---|
| `POST /feeds` | `createFeed` → 201 `FeedMetadata` |
| `GET /feeds/{id}` | `getFeed` |
| `GET /feeds/{id}/products` | `getFeedProducts` |
| `PATCH /feeds/{id}/products` | `upsertFeedProducts` — partial upsert by `Product.id` |

Schema (`additionalProperties: false` throughout): `FeedMetadata` requires `id`; `Product` requires `id`, `variants`; `Variant` requires `id`, `title`; `Price` requires `amount` (integer, **minor units**) + `currency` (`^[A-Z]{3}$`); `Availability` requires nothing. `Availability.status` is extensible: *"Known values include `in_stock`, `limited_stock`, `backorder`, `preorder`, `out_of_stock`, `discontinued`."*

Non-goals verbatim: *"Feed prices are discovery-time signals. Checkout session responses remain authoritative."* · *"Availability in a feed does not reserve inventory."*

**1B — OpenAI's PRODUCTION feed (flat delimited, Google-Shopping-compatible).** https://developers.openai.com/commerce/specs/feed.md — **this is what actually ships in ChatGPT today, and it is not JSON.**

Verbatim: *"Upload a UTF-8, tab-delimited `.txt` or `.tsv` file, or a comma-delimited `.csv`."* · *"one header row with canonical lowercase, underscore-separated field names"* · *"JSON, spreadsheet, XML, RSS, and Atom sources are not part of this compatibility path."*

Required (non-Ads schema): `is_eligible_search`, `is_eligible_checkout` (*"`is_eligible_search` must be `true` for `is_eligible_checkout` to be enabled"*), `item_id` (≤100, *"must remain stable over time"*), `title` (≤150), `description` (≤5,000), `url` (*"Must resolve with HTTP 200"*), `brand` (≤70), `image_url`, `price` (e.g. `79.99 USD`), `availability` ∈ `in_stock|out_of_stock|pre_order|backorder|unknown`, `availability_date` (if pre_order), `seller_name` (≤70), `seller_privacy_policy` + `seller_tos` (*"Required if `is_eligible_checkout` is true"*), `target_countries`.

Returns fields are **all optional**: `accepts_returns`, `return_deadline_in_days`, `accepts_exchanges`, `return_policy`.

Merchant identity is **not** merchant-controlled: *"OpenAI trims and uses that registered name as the seller identity on every row. An uploaded `seller_name` cannot override it."*

> `INFERENCE (high confidence):` 1A is the future cross-agent standard; **1B is what you must implement to sell in ChatGPT today.**

## 2. Agentic Checkout — five endpoints, merchant-hosted

`spec/2026-04-17/openapi/openapi.agentic_checkout.yaml` (3,365 lines, OpenAPI 3.1.0, `servers: [https://merchant.example.com]`, `bearerAuth`).

| Method + Path | operationId | Success |
|---|---|---|
| `POST /checkout_sessions` | `createCheckoutSession` | **201** |
| `POST /checkout_sessions/{id}` | `updateCheckoutSession` | 200 |
| `GET /checkout_sessions/{id}` | `getCheckoutSession` | 200 |
| `POST /checkout_sessions/{id}/complete` | `completeCheckoutSession` | 200 `CheckoutSessionWithOrder` |
| `POST /checkout_sessions/{id}/cancel` | `cancelCheckoutSession` | 200; **405** if already completed/canceled |

**No PATCH, no DELETE.** Required: create → `["line_items","currency","capabilities"]`; complete → `["payment_data"]`; update → nothing.

**Two error channels (key design point):** `Error` for protocol-level 4xx/5xx — *"Use Error—not MessageError—when there is no valid session state to return"*; `MessageError` inside a **200 OK** `CheckoutSession.messages[]` for business failures (out-of-stock, declined). `Error.param` is *"RFC 9535 JSONPath"*, e.g. `$.buyer.email`.

**`status` enum — 11 values, in file order:** `incomplete`, `not_ready_for_payment`, `requires_escalation`, `authentication_required`, `ready_for_payment`, `pending_approval`, `complete_in_progress`, `completed`, `canceled`, `in_progress`, `expired`. **No state-transition diagram is given.**

⚠️ **OpenAI's LIVE spec (`API-Version: 2025-09-12`) has only 4 states** — `not_ready_for_payment`, `ready_for_payment`, `completed`, `canceled` — plus legacy `payment_provider`, `fulfillment_address`, and a `refunds[]` the repo removed. **Build against your counterparty's version, not the repo's.**

**MCP binding** (`docs/mcp-binding.md`) — second transport, *"purely additive"*, JSON-RPC 2.0 over MCP Streamable HTTP. Five tools: `create_checkout_session`, `get_checkout_session`, `update_checkout_session`, `complete_checkout_session`, `cancel_checkout_session`. *"Implementers MUST resolve and bundle all `$ref` targets before serving tool schemas to MCP clients."*

**Discovery** (`rfcs/rfc.discovery.md`, Proposal) — `GET /.well-known/acp.json`, no auth, `max-age=3600` min, `404` = no ACP support. Anti-enumeration rule: *"the discovery document MUST NOT accept or return `merchant_id` or any merchant-specific identifiers."*

## 3. Delegate Payment — card only, and no India path

`POST /agentic_commerce/delegate_payment` → **201**. Verbatim: *"**Exactly one credential type is currently supported: card**."*

**Call direction is `OpenAI -> PSP`**, despite the OpenAPI's misleading `servers: merchant.example.com`. Verbatim: *"Directly integrating with OpenAI via the Delegated Payment Spec is only for **PSPs or PCI DSS level 1 merchants using their own vaults**."*

**The agent holds the card on file.** Buyers *"save it in ChatGPT"*; OpenAI transmits the credential to the PSP/vault; the merchant only ever sees a token (`vt_…`, called a *vault token* in the OpenAPI and a *Shared Payment Token / SPT* in `rfc.payment_handlers.md` — `INFERENCE:` same artifact, Stripe's product name leaked into the RFCs).

### The `Allowance` model — the entire expressible scope

All six fields **required**:

| Field | Constraint |
|---|---|
| `reason` | **only `one_time`** |
| `max_amount` | integer, minor units |
| `currency` | `^[a-z]{3}$` — **lowercase** |
| `checkout_session_id` | one session |
| `merchant_id` | ≤256, one merchant |
| `expires_at` | RFC 3339; *"token **MUST** become invalid at or after `allowance.expires_at`"* |

**Expressible:** one merchant × one session × one currency × a max amount × an expiry, single use.
**NOT expressible (`FACT` by omission):** recurring/multi-use · multi-merchant · per-period budgets · MCC/category restrictions · geographic limits · velocity rules.

`RiskSignal.type` has exactly **one** value: `card_testing`. `action` ∈ `blocked | manual_review | authorized`.

### 🌍 Geography — the decisive constraint

https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens (*"Public preview"*), verbatim:
> *"SPTs are available to agents, customers and sellers in **the US, Canada and select European countries**."*

**India is not named.** (Full country list `NOT RETRIEVED`.) Agent-side Stripe integration is *"Private preview… Join the waitlist."*

`psp` values present anywhere in the repo (exhaustive grep): **`"stripe"` and `"seller_managed"` only.**

## 4. Headers, signing, idempotency

Required on both checkout and delegate_payment: `Authorization` (Bearer), `Content-Type`, `API-Version` (`YYYY-MM-DD`), **`Idempotency-Key`** (*"MUST be present on all POST requests"*, ≤255, UUIDv4 recommended, *"scoped to authenticated identity + endpoint"*). Optional: `Signature`, `Timestamp`, `Request-Id`, `Accept-Language`, `User-Agent`.

### ⚠️ The Signature MUST-vs-`required:false` defect

- `rfcs/rfc.delegate_payment.md` §2.2: *"Client **MUST** compute a detached signature… and place it in the `Signature` header."*
- **Same file** §2.3: *"`Signature: <base64url>` (**RECOMMENDED**)"*
- Both OpenAPI files: `required: false`
- `openapi.agentic_checkout.yaml` description is copy-pasted wrong: *"HMAC signature for webhook verification"* — it is a request header, not a webhook.

Three open PRs target this, all still open: **#285**, **#287**, **#288**.

**Algorithms are not in the spec.** §2.1: *"Server advertises acceptable signature algorithms (e.g., Ed25519, ES256) **out-of-band**."* Canonicalization is informative only (*"MAY implement… RFC 8785 (JCS)"*).
> `INFERENCE (high confidence):` **request signing cannot be implemented from the spec alone.**

### Idempotency — this part IS fully normative

`rfc.delegate_payment.md` §5 (*"Canonical reference… Supersedes prior idempotency rules"*):
- Equivalence = *"semantic JSON equality of the request body only; headers are excluded."* Key order → equivalent. `1.0` vs `1` → equivalent. **`null` vs absent → DIFFERENT** (*"`null` means 'clear this field'; absent means 'do not modify'"*). **Array order → NOT equivalent.**
- Replay: *"MUST return the original response with the same HTTP status code"*, SHOULD set `Idempotent-Replayed: true`, and *"MUST NOT re-execute side effects."*
- **5xx MUST NOT be cached**; retry after 5xx *"MUST be processed as a fresh request."* Retention ≥ 24 h.

| Scenario | HTTP | code | Retryable |
|---|---|---|---|
| Missing header | 400 | `idempotency_key_required` | Yes |
| Same key, different body | **422** | `idempotency_conflict` | **No (permanent)** |
| Same key, in flight | 409 | `idempotency_in_flight` | Yes — honour `Retry-After` |

Transport: *"MUST use HTTPS/**TLS 1.3**"*; *"logs **MUST NOT** contain full PAN or CVC."*

## 5. Webhooks — orders only, merchant → agent

Single endpoint: `POST /agentic_checkout/webhooks/order_events`, **hosted by OpenAI**.

`Merchant-Signature` header, **`required: true`**, `pattern: ^t=\d+,v1=[a-fA-F0-9]{64}$`. Verbatim: *"Signed payload is `timestamp + "." + raw_body`; HMAC-SHA256… Recommended timestamp tolerance is 300 seconds."* (`INFERENCE:` byte-for-byte Stripe's webhook scheme.)

Payload rule: *"The `data` field **MUST** contain the full Order object (not incremental deltas)."*

**Event names differ by source:** repo → `order_create`, `order_update`; OpenAI live → `order_created`, `order_updated`.

**There is NO agent→merchant webhook and NO session-level event — orders only** (`FACT`, by exhaustive path enumeration).

## 6. Refunds, disputes, liability — the money quotes

OpenAI, https://developers.openai.com/commerce/specs/payment.md, verbatim:
> - **"OpenAI is not the merchant of record.** Under the Agentic Commerce Protocol, merchants bring their own PSP and process payments as they would for any other digital transaction."
> - **"Merchant-owned payments.** Settlement, refunds, chargebacks, and compliance remain with the merchant and their PSP."
> - **"PCI Scope.** Directly integrating with the Delegated Payment Spec involves directly handling cardholder data (CHD) and may affect your PCI scope."

Repo README: *"Let your users discover and transact… **without being the merchant of record**."*
agenticcommerce.dev: *"businesses **maintain their customer relationships as the merchant of record**."*

> **There is no liability shift, no interchange arrangement, and no chargeback-protection mechanism anywhere in ACP.** The merchant carries normal CNP exposure. The only protocol-level mitigations are (a) the `Allowance` scope, (b) `RiskSignal` (`card_testing` only), (c) optional 3DS.

**Refunds and disputes are DATA, not an API.** `Adjustment.type` verbatim: *"'refund', 'credit', 'return', 'exchange', 'price_adjustment', 'cancellation', 'dispute'… **'dispute' covers chargebacks**."* Status: `pending | completed | failed`.

**There is NO `POST /refunds`, NO dispute-response endpoint, NO evidence-submission surface anywhere in the spec** (`FACT`, exhaustive enumeration across all six OpenAPI files). Refunds execute on the merchant's own rails; ACP only carries the notification.

`rfcs/rfc.intent_traces.md` (consent/intent audit trail) exists but is **unreleased**.

## 7. Eleven internal contradictions in the released spec

Each verified by reading the file. These break strict-validation builds.

1. **`Item` has no `quantity` field, yet every example sends one.** `Item` = `{id, name, unit_amount}`, `required: ["id"]`, `additionalProperties: false` — **published examples fail validation against the published schema.**
2. **Examples send `items:`, schema requires `line_items:`** — and a schema-level example introduces `product_id`, which exists nowhere. Open PRs #289, #270.
3. **Three mutually incompatible `payment_data` shapes in one version:** `{token, provider}` (path examples + OpenAI live) · `{handler_id, instrument:{...}}` (schema `anyOf`) · `{type:"vault_token", token}` (schema example). Token prefix appears as both `spt_` and `vt_`. `HYPOTHESIS:` `{token, provider}` is legacy/production, `handler_id` is forward. **Confirm with your counterparty.**
4. **Currency case inconsistent** — `Allowance.currency` / `Adjustment.currency` are `^[a-z]{3}$`, feed `Price.currency` is `^[A-Z]{3}$`.
5. **`Signature` MUST vs `required:false`** (§4).
6. **`PaymentHandler.display_order` structurally misplaced** — sibling of `properties`. Open PR #284.
7. **`PaymentMethodCard.virtual`** required per RFC §3.3/§7, absent from OpenAPI `required`.
8. **Webhook event names differ** repo vs live.
9. **`openapi.feed.yaml` has no `security` block at all** — no auth on any feed endpoint.
10. **`spec/2026-04-17/` ships files its own changelog calls "unreleased"** (the Feed API).
11. **Repo spec is ahead of live implementation** — 11 statuses vs 4, `adjustments[]` vs `refunds[]`.

## 8. Razorpay's SEPs — see `razorpay_acp_stalled_upi.md`

Summary of what each proposes (verbatim from PR bodies):

- **#213 (closed)** — handlers `in.razorpay.upi` and `in.razorpay.reserve_pay`. Superseded by the four SEPs.
- **#215 Redirect Checkout** — *"refactored to a generic `redirect_checkout` schema that any hosted checkout provider can implement."*
- **#216 UPI Circle** — *"NPCI's delegated payment system… solving the gap for India's 600M+ UPI users where no equivalent delegated payment mechanism currently exists in ACP."* Mechanism: *"a **cryptogram-based delegation model**: users authorize a mandate once, and the platform fetches a fresh one-time `upi_circle_cryptogram` from Razorpay TSP before each `complete_checkout_session` call."* Renamed `com.razorpay.upi_circle` → `dev.acp.upi_circle`.
- **#217 UPI Intent** — *"the platform generates a fresh NPCI-compliant `upi://` URI per transaction."* *"**600M+ UPI users** have no ACP-native in-chat payment path"*; *"UPI is 80%+ of India's digital payments, $2.6T annually."*
- **#218 S2S Cards** — *"Indian merchants using Razorpay have customer card tokens stored via **Razorpay Token HQ (RBI CoFT mandate)**. These tokens cannot be charged through ACP today."*

Blocking gate: `docs/governance.md` — *"Every SEP **must be sponsored by a TSC member** to proceed."* None has a sponsor. Reviews from Stripe (2026-05-14) and Meta (2026-04-22) were answered within 24h; **no maintainer reply since 2026-05-15.**

**Verified negative — exhaustive grep for `razorpay|payu|cashfree|juspay|npci|ccavenue|billdesk|india|upi` across the repo: ZERO matches.** No India support exists in any spec file, released or unreleased.

## 9. Reference implementations — the ecosystem is thin

**There is no first-party OSS reference server.** `stripe/agentic-commerce-samples` and `openai/openai-agentic-commerce` **both 404 — do not cite them.**

| Repo | ★ | Lang | Last push |
|---|---|---|---|
| `NVIDIA-AI-Blueprints/Retail-Agentic-Commerce` | 68 | Python | **2026-08-24** — ACP **and UCP** |
| `forter/trusted-agentic-commerce-protocol` | 179 | JS | 2026-07-08 — adjacent (agent auth), **not ACP** |
| `vercel/acp-handler` | 24 | TS | 2025-12-14 — stale |
| `nekuda-ai/ACP-Checkout-Gateway` | 19 | TS | 2026-01-26 |
| `sumup/acp` | 3 | Go | **2026-08-21** |
| `run-as-root/ACP-for-Magento-2` | 13 | PHP | 2025-10-10 |
| `svix/agentic-commerce-protocol` | 6 | Java | 2025-10-28 |
| `shopbridge/shopbridge-php` | 6 | PHP | 2025-10-01 |

> `INFERENCE:` only NVIDIA's blueprint and SumUp's Go SDK show 2026-08 activity, and NVIDIA hedges across ACP and UCP.

## 10. Two hazards to carry into any build

1. **Version pinning is the #1 practical hazard.** Repo `2026-04-17` vs OpenAI live `2025-09-12` differ on session states (11 vs 4), payload shape (`line_items` vs `items`), payment token shape, and webhook event names. **State plainly which version any code targets.**
2. **ACP `delegate_payment` supports card only, and Stripe's SPT excludes India.** Any India story is (a) Razorpay's four unmerged SEPs, or (b) outside ACP entirely.

## NOT RETRIEVED (do not fabricate)
- OpenAI feed upload transport (portal vs SFTP vs URL pull)
- Stripe SPT full supported-country list
- Razorpay PR branch names
