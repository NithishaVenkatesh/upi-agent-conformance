# Track 01 — The Opportunity Space: "Sellable to AI Buyers"

| Field | Value |
|---|---|
| Author | research agent, Phase 07 |
| Retrieved / written | **2026-08-26** |
| Deadline | **5 September 2026** (10 days) |
| Scope | Razorpay AI Buildathon Track 01 — "AI Growth & Agentic Commerce" |
| Method | Local corpus re-read · direct HTTP/`curl` against live merchant and spec endpoints · `git clone` of competitor and spec repos · GitHub API census · parallel web-research subagents |

**Labelling convention.** `FACT` = directly observed in a retrieved artefact (with URL + date). `INFERENCE` = my reasoning over ≥2 facts. `HYPOTHESIS` = plausible, unverified. `EVIDENCE NOT FOUND` = I looked and could not verify.

> **Headline for the impatient.**  *(Two research subagents reported after the first draft; §4, §6.3, §7.3a, §7.3d, §7.5 and the §8 ranking were revised on their evidence. Two of my own earlier conclusions were reversed — see §9.)*
> The hypothesis as stated is **dead** — the sell-side is the *most* entered corner of Track 01, not the least, and Shopify already ships agent-readability to Indian merchants for free. But the investigation killed it by finding something better underneath, which was not in the brief and which nobody measures: **India's live agentic-checkout surface is card-only. UPI is not a payment handler in the protocol that Google, Shopify, Stripe, Amazon, Walmart and Target have already shipped onto Indian D2C storefronts.** Google's agentic Buy button does not serve India at all. That is a payments problem, it is Razorpay-shaped, it is measurable in a batch, and it is verifiable in four `curl` commands. Pine Labs published a proprietary UPI agentic protocol in June 2026; Razorpay has published none, and neither is reachable by an agent walking up to a merchant cold.
>
> **A second gap turned out to be even cleaner:** every trust primitive shipped by Visa, Mastercard, Forter, ACP and AP2 verifies *the agent to the merchant*. **Nothing anywhere verifies the merchant to the agent** — ACP forbids it by design. Razorpay computes exactly that verdict today, from KYC and dispute rate, and renders it as an icon a human clicks.

---

## 1. The Hypothesis

Quoted from the brief under test:

> Razorpay has already solved the **buy-side** (agent initiates a payment — UPI Reserve Pay, in-app commerce pilots, Agent Studio). The **sell-side** — making an ordinary Indian merchant *discoverable, legible, and safely transactable by a third-party AI buyer* — is unsolved, is what "sellable to AI buyers" and "agent-readable catalog" point at, and is the least-entered part of the least-entered track.

It decomposes into four separable claims, which turn out to have very different fates:

| # | Claim | Verdict |
|---|---|---|
| H1 | Razorpay has solved the buy-side | **Supported** |
| H2 | Sell-side legibility/transactability is what the track text points at | **Supported** |
| H3 | The sell-side is *unsolved* | **Refuted for the mainstream case; supported for the Indian-payments case** |
| H4 | It is the *least-entered* part of the least-entered track | **Decisively refuted — it is the most-entered part** |

---

## 2. Evidence For

### 2.1 The track text does point at the sell-side — `FACT`

Verbatim from `https://razorpay.com/buildathon/`, retrieved 2026-08-26 (snapshot in `research/00_competition_context/raw/`):

- Tag: *"Grow the merchant's revenue, and make them **sellable to AI buyers**"*
- Task: *"...**or that makes a merchant transactable by an AI buyer end to end**."*
- Example direction: *"**Agent-readable catalog**"*

Three of the four Track-01 example directions (conversational in-app checkout, upsell & cross-sell agent, campaign orchestrator) are buy-side or growth-side. Exactly one — *agent-readable catalog* — is sell-side. `INFERENCE:` the sell-side is a deliberate, minority prompt, not an accident of phrasing.

### 2.2 Razorpay has demonstrably solved the buy-side — `FACT`

From `research/01_razorpay_signals/razorpay_ai_signals.md` (all primary Razorpay sources, retrieved 2026-08-26):

- **Agentic Payments** is a shipped product line with three surfaces — In-App Commerce (beta), LLM Platforms, Voice AI — at `https://razorpay.com/agentic-payments/`. **UPI Reserve Pay = live.**
- ChatGPT + NPCI pilot (Oct 2025, bigbasket + Vi); Claude + NPCI pilot (Feb 2026, Zomato/Swiggy/Zepto); Voice-AI (Sarvam, superU, Gnani).
- Official MCP server, local + remote, 40+ tools (`github.com/razorpay/razorpay-mcp-server`), with irreversible money-moving tools *deliberately withheld* from the hosted remote surface.

`INFERENCE, high confidence:` re-demoing "an agent that pays" is re-demoing a Razorpay product line. This much of the hypothesis holds and matters.

### 2.3 Razorpay has no catalog primitive — `FACT`, and two near-misses must be named and disqualified

**Verified first-hand, 2026-08-26.** I pulled the tool table from `https://raw.githubusercontent.com/razorpay/razorpay-mcp-server/main/README.md` and extracted all 44 tool names: `capture_payment, close_qr_code, create_instant_settlement, create_order, create_payment_link, create_payment_link_upi, create_qr_code, create_refund, create_registration_link, detect_stack, fetch_all_instant_settlements, fetch_all_orders, fetch_all_payment_links, fetch_all_payments, fetch_all_payouts, fetch_all_qr_codes, fetch_all_refunds, fetch_all_settlements, fetch_instant_settlement_with_id, fetch_multiple_refunds_for_payment, fetch_order, fetch_order_payments, fetch_payment, fetch_payment_card_details, fetch_payment_link, fetch_payments_for_qr_code, fetch_payout_by_id, fetch_qr_code, fetch_qr_codes_by_customer_id, fetch_qr_codes_by_payment_id, fetch_refund, fetch_settlement_recon_details, fetch_settlement_with_id, fetch_specific_refund_for_payment, fetch_tokens, initiate_payment, integrate_razorpay_checkout, resend_otp, revoke_token, send_payment_link, submit_otp, update_order, update_payment, update_payment_link, update_refund`.

**Not one product, catalog, item, SKU or inventory tool.** A case-insensitive grep for `product|catalog|item|inventory` across that README returns **0** matches.

**But two Razorpay APIs are named in a way that will trip up anyone who greps and stops.** Both must be named and disqualified explicitly — doing so proves the work was done:

| Candidate | Endpoint | What it verbatim is | Why it is not a catalog |
|---|---|---|---|
| **Items API** | `POST /v1/items` — `razorpay.com/docs/api/payments/items/` | *"Items are products or services that you can add to **Invoices** and charge customers for."* Fields: `name`, `amount`, `currency`, `description`, `unit_amount`, `hsn_code`, `sac_code`, `tax_rate`, `"type": "invoice"` | An invoicing line-item library. No SKU, no variants, no stock, no images, no availability, no category, **no public read** — Basic-Auth, merchant-private |
| **Products API** | `razorpay.com/docs/api/orders/products` | *"The Products API is based on the Orders API and uses the same endpoint… you must use the `products` array to pass additional, domain-specific product information."* And: *"Right now, only `mutual_fund` is supported."* Fields: `mf_amc_code`, `mf_partner` (`cams\|kfin\|bse\|nse`), `folio`, `scheme` | **SEBI regulatory-reporting metadata attached to an order.** It exists because *"SEBI mandates Razorpay to report investments for Stock Brokers and Mutual Fund Distributors."* Not a catalog in any sense |
| **Payment Pages** | `razorpay.com/docs/build/llm-docs/payments/payment-pages.md` | *"Build professional Payment Pages using our intuitive **What You See Is What You Get** (WYSIWYG) editor."* Dashboard-only | The closest thing Razorpay has to a storefront is **an unstructured HTML page an agent can only scrape** — precisely the failure ACP's product-feed RFC was written to eliminate (§7.6) |

`FACT — the structural root of the whole sell-side gap.` From `razorpay.com/docs/build/llm-docs/api/authentication.md`: *"All Razorpay APIs are authenticated using `Basic Auth`"* with the merchant's own `KEY_ID`/`KEY_SECRET`. **There is no unauthenticated read surface anywhere in the Razorpay API.** A third-party AI buyer cannot learn anything about a Razorpay merchant without being handed that merchant's secret. Nothing in the wider product surface catalogued in `research/01_razorpay_signals/razorpay_product_signals.md` changes this. Razorpay's objects are Orders, Payments, Links, Invoices, Refunds, Settlements, Payouts, Subscriptions — all *money* objects, all downstream of a cart that someone else assembled. `HYPOTHESIS:` this is why "agent-readable catalog" appears in the brief — it is the one thing in the agentic-commerce stack Razorpay does not own and cannot see.

### 2.4 The catalog data that Indian merchants actually publish is thin in specific, measurable ways — `FACT` (original measurement)

I sampled the public Shopify product feed (`/products.json`) of 15 real Indian D2C brands on 2026-08-26. 12 responded 200 (3 blocked with 403/301). Across **600 products / 1,538 variants**:

| Signal | Result |
|---|---|
| Variants carrying a **barcode / GTIN** | **0 / 1,538 (0%)** |
| Variants carrying **`inventory_quantity`** | **0 / 1,538** (availability is a bare boolean) |
| Products whose description is effectively empty (<30 chars) | **121 / 600 (20.2%)** — boAt 49/50, sleepycat 22/50 |
| Products missing `vendor` | 0 / 600 |

Per-store spread of the empty-description rate: 0% (mamaearth, bombayshavingcompany, chumbak) → 98% (boat-lifestyle). This is a real distribution, not a uniform problem, which is exactly what makes it a *measurement* rather than an assertion.

Reproduce: `curl -s 'https://minimalist.co/products.json?limit=50'`.

I then fetched the first product-detail page of 10 of those stores and parsed the JSON-LD:

| Signal | Stores |
|---|---|
| `Product` + `Offer` JSON-LD with `price` and `availability` | **10 / 10** |
| `gtin*` present | **3 / 10** |
| `OfferShippingDetails` present | **3 / 10** |
| `MerchantReturnPolicy` present | **3 / 10** |

**Cross-referenced against the UCP schema (§4.1), this becomes a conformance number.** `source/schemas/shopping/types/product.json` declares `required: ["id","title","description","price_range","variants"]` and `variant.json` declares `required: ["id","title","description","price"]`. So **20.2% of the products I sampled fail a UCP-required field outright.** (`variant.barcodes` and `variant.availability` are *optional* in UCP — so the GTIN finding is about cross-merchant correlation and agent disambiguation, not conformance. Caveat, stated honestly: absence in the Shopify REST feed does not prove absence on the store's UCP MCP surface, which may synthesise fields; the conformance number is over *the feed a non-Shopify merchant would have to build from*.)

`INFERENCE — and this is a correction to the naive framing:` Indian D2C catalogs are **not** structurally illegible. Price and availability are already machine-readable everywhere I looked. The real gaps are narrower and more interesting: **no global product identifier, no inventory depth, and no machine-readable shipping or returns policy on 7 of 10 stores.** An "agents can't see your products" pitch would be factually wrong. An "agents can't verify *which* product this is, *how many* are left, or *what happens if it's wrong*" pitch is correct and much sharper — and every one of those three is a payments-adjacent risk, not an SEO one.

---

## 3. Evidence Against — the Strongest Refutation

This section is the point of the document. Three independent lines of evidence kill H3 and H4.

### 3.1 REFUTATION 1 — The platform layer already shipped it. Shopify auto-serves an agent surface on Indian D2C stores today. `FACT`

This is the single most important thing I found, and it was not in any of the prior research.

On 2026-08-26 I fetched `https://zouk.co.in/llms.txt` and received `content-type: text/markdown` and a document titled **"# Agent Instructions — Zouk"**, machine-generated by Shopify. Verbatim excerpts:

> *"This store implements the [Universal Commerce Protocol](https://ucp.dev) for agent-driven commerce. The two endpoints to know:*
> *- **Discovery** — `GET https://zouk.co.in/.well-known/ucp` ...*
> *- **MCP endpoint** — `POST https://zouk.co.in/api/ucp/mcp` ..."*

> *"**Checkout requires human approval.** Agents must not complete payment without explicit buyer consent."*

> *"The Shop skill (`https://shop.app/SKILL.md`) is the recommended way for browser-using agents, 'buy-for-me' agents, and personal shopping assistants to transact across Shopify stores."*

I verified all of it live:

- `GET https://zouk.co.in/.well-known/ucp` → **200**, JSON: `{"ucp":{"version":"2026-04-08", "supported_versions":{"2026-04-08":…,"2026-01-23":…}, "services":{"dev.ucp.shopping":[{"transport":"mcp","endpoint":"…/api/ucp/mcp"}]}, "capabilities":{…}, "payment_handlers":{…}}}`
- Capabilities advertised: `dev.ucp.shopping.checkout`, `.cart`, `.order`, `.fulfillment`, `.discount`, `.catalog.search`, `.catalog.lookup`, `dev.shopify.catalog`.
- `POST https://zouk.co.in/api/ucp/mcp` with `{"jsonrpc":"2.0","id":1,"method":"tools/list"}` → **200**, returns real MCP tools including `create_checkout` and `get_checkout`, with full JSON-Schema, minor-unit integer pricing, and a required `meta.ucp-agent.profile` agent-identity field.

I then probed the same `/.well-known/ucp` path across 11 Indian D2C brands:

| Store | UCP? | Advertised payment handlers |
|---|---|---|
| zouk.co.in | ✅ 2026-04-08 | `com.google.pay`, `dev.shopify.card` |
| mamaearth.in | ✅ 2026-04-08 | `com.google.pay`, `dev.shopify.card` |
| sleepycat.in | ✅ 2026-04-08 | `com.google.pay`, `dev.shopify.card` |
| plumgoodness.com | ✅ 2026-04-08 | `com.google.pay`, `dev.shopify.card` |
| www.chumbak.com | ✅ 2026-04-08 | `com.google.pay`, `dev.shopify.card` |
| www.bombayshavingcompany.com | ✅ 2026-04-08 | `com.google.pay`, `dev.shopify.card` |
| boat-lifestyle.com, minimalist.co, nicobar.com, www.beardo.in, sugarcosmetics.com | ❌ no UCP | — |

**And the buyer side of it is shipped too.** `github.com/Shopify/ucp-cli` (`@shopify/ucp-cli`, 61★, created 2026-05-18) is *"A shopping skill for AI agents, powered by the Universal Commerce Protocol"*, distributed for the [agentskills.io](https://agentskills.io/) skills format. Verbatim from its README, retrieved 2026-08-26: *"**Search products across millions of merchants** via a unified global catalog · **Build carts and complete checkouts against any UCP-enabled merchant** · **Hand off gracefully** when escalation is requested · **Track orders** after purchase"*, with *"Schema introspection on every operation (`--input-schema`), so the agent composes payloads from the merchant's advertised schemas instead of stale docs"* and an `UCP_ON_ESCALATION` hook for the human handoff. Its worked example returns three competing merchants' prices for one keyboard, each with a `gid://shopify/ProductVariant/…` and a direct buy URL.

`INFERENCE:` cross-merchant agent product discovery — the thing "agent-readable catalog" most naturally means — is not an open problem. It is an `npm install -g`.

**Consequence for the hypothesis.** For any Indian merchant on Shopify, "discoverable, legible and transactable by a third-party AI buyer" is **already solved, for free, by the platform** — llms.txt, agents.md, a well-known discovery document, a live MCP checkout server, a versioned spec, an agent-identity field, and a human-approval invariant. Building "an agent-readable catalog for merchants" in 2026 is building something Shopify ships by default. **H3 is refuted for the mainstream case.**

`INFERENCE:` this also means the prior local research file `razorpay_ai_signals.md`'s framing of a "protocol race (ACP, AP2, x402)" is now behind the state of the world. The race has substantially *consolidated*.

### 3.2 REFUTATION 2 — UCP is a coalition of nearly every large commerce player, and Razorpay is not in it. `FACT`

`https://ucp.dev/`, retrieved 2026-08-26, verbatim: *"Co-developed by industry leaders… Google · Shopify · Etsy · Wayfair · Target · Walmart · Amazon · Microsoft · Meta · Salesforce · Stripe · Amadeus · Booking.com · Expedia Group · Hilton · Marriott · Trip.com · DoorDash · Square · Toast · Uber Eats."*

Also verbatim: *"UCP is built on industry standards — REST and JSON-RPC transports; **Agent Payments Protocol (AP2), Agent2Agent (A2A), and Model Context Protocol (MCP) support built-in**"* and *"…ensuring businesses retain control and remain the **Merchant of Record**"*.

Spec repo: `https://github.com/Universal-Commerce-Protocol/ucp` — Apache-2.0, **3,328 stars**, created 2025-12-31, last pushed 2026-08-25. I cloned it and read the specification tree directly.

- `docs/specification/payment/extensions/ap2-mandates.md` — AP2 mandates are a **first-class UCP extension** (`dev.ucp.common.payment.ap2_mandate`): the business signs the checkout terms, the platform supplies a signed user-authorisation mandate, and *"Once this extension is negotiated… the session is **Security Locked**."*
- `docs/specification/payment/guide.md` — a complete, normative **Payment Handler Specification Guide** with a four-part framework (Participants · Prerequisites · Handler Declaration · Instrument Acquisition · Processing) and three worked handler patterns (`encrypted-credential`, `platform-tokenizer`, `processor-tokenizer`).

**No Indian payments participant appears anywhere in the coalition, and no UPI handler exists in the spec.** I grepped the whole clone for `upi|razorpay|india|rupee|INR`: the only hits are incidental (`roadmap.md`, a location schema, a `buyer-consent` example).

### 3.3 REFUTATION 3 — the sell-side is the *most* entered corner of Track 01, not the least. `FACT`

The prior census (`research/02_hackathons/THE_ACTUAL_FIELD.md`) counted 16 T01 repos from a single `"razorpay buildathon"` query. That undercounts badly. I ran 11 vocabulary-specific GitHub searches restricted to `created:>=2026-08-15`, deduplicated to 754 repos, of which **102 mention Razorpay**. Of those, **at least 20–25 are explicitly sell-side** — "make a merchant transactable by an AI buyer". A non-exhaustive list, all retrieved 2026-08-26:

| Repo | Size | What it claims |
|---|---|---|
| `Adarsh-Me/Agent-Audit` | 2.8 MB | 640 controlled LLM trials measuring whether agents see/choose/buy from a catalog (see §6) |
| `kdahal7/razoragent-commerce` | 3.9 MB | **`/.well-known/agentic-commerce.json`** ACP manifest + bounded buyer agent + audit telemetry + 3 failure paths |
| `uselessdevloper/ProductPilot` | 4.2 MB | "agent-transactable catalog intelligence", ETIM/UNSPSC taxonomy, Bayesian conflict arbitration, 5 Razorpay primitives |
| `aditibh19/Agentcart` | 83 MB | Buyer AI ↔ Merchant AI negotiating within merchant rules |
| `rajat9para/RazorX…` | 7.8 MB | AI buyers discover/compare/negotiate/purchase from "AI-ready merchants" |
| `rakesh0x/aisle` | 973 KB | "Agent-ready checkout for the long tail… **a batch readiness score you can defend**" |
| `sting-raider/project-dante` | 836 KB | Promise Ledger, hashed contract, breach detection, Purchase Rights Graph, policy-gated **refund** through Razorpay |
| `aryanpajnee/RazorpayBuildathon` | 308 KB | **AP2-style Ed25519 Intent/Cart Mandates enforced merchant-side**, integer paise, LLM structurally off the money path, 156 tests |
| `GraceyDugar/agent-payment-guardrails` | 103 KB | Verifies every agent claim against merchant ground truth before charge; hash-chained audit; cites *Moffatt v. Air Canada* |
| `abhishek591508/AgentCashier` | 79 KB | AP2 mandates + UPI Reserve Pay analog + **prompt-injection defence** + 11 money-safety evals |
| `Vinayreddy765/Merchantguard` | 68 KB | Policy gateway in front of Razorpay MCP |
| `Navedhya-Goyal/agentready-commerce-gateway` | 54 KB | "merchant trust gateway that validates product catalogues" |
| `ameet-s-m/AgentTrust`, `Diptadeep-21/AI-REPRESENTATION-OPTIMIZER`, `YeshwanthRajSelvaraj/VERITY`, `abh-g71/artha`, `Varunkumar-07/nexus-razorpay`, `kanishqdhangar/shopagent-mcp`, `Shreyans-704/agentic-commerce-buyer`, `KanishkaGarg04/AgentCart`, `arun-66102/AgentCart` | — | Variations on the same theme |

**H4 is decisively refuted.** Every obvious sell-side move — ACP manifest at a well-known path, AP2-style signed mandates, policy gateway with spend caps, claim-verification before charge, promise-breach remediation, prompt-injection guard, catalog legibility scoring — is already taken, by name, inside this buildathon.

### 3.4 REFUTATION 4 — "agent-readiness auditing" is an established open-source genre that predates the buildathon. `FACT`

GitHub repos created **before** the buildathon was announced:

| Created | Repo | Description |
|---|---|---|
| 2026-04-19 | `zhao-hanbo/agentic-commerce-kit` | Claude Code skill: audit ecommerce stores for agentic-commerce readiness |
| 2026-04-30 | `farjamazizi/Agentic-Commerce-Readiness-Agent…` | Scans stores, checks product schema, pricing, inventory, checkout signals |
| 2026-06-17 | `nick-liyao/agentic-commerce-kit` | AI-agent readiness audits + MCP-ready commerce utilities |
| 2026-07-11 | `PO-VINCENT/ai-shopping-audit` | "Lighthouse for AI shopping", 0-100 score, evidence-backed fixes |
| 2026-07-17 | `shelfready/shelfready` | Compliant product feeds (**OpenAI ACP, Google Merchant Center**), agent-readiness audit |
| 2026-07-25 | `Mohit1298/agentrank` | 23-check agent-readiness audits for Shopify storefronts |
| 2026-07-20 | `abhiram-ar/agentic-commerce-hackathon` | Shopify app optimising catalog for AI answer engines |
| 2026-08-01 | `api-evangelist/paz-ai` | AI commerce platform for visibility across ChatGPT / Google AI Mode / Perplexity |

And merchant-trust/agent-identity is likewise occupied at industry scale: `visa/trusted-agent-protocol` (Oct 2025, 3.8 MB), `forter/trusted-agentic-commerce-protocol` (Aug 2025), `SAM-protocol/SAM-Protocol` ("The Trust and Mandate Layer for Agentic Commerce"), `djt53/attest` ("Identity resolution and trust layer for agent commerce. Open attestation spec + merchant verification").

### 3.4b REFUTATION 5 — a free public scanner already grades agent-readiness *including commerce protocols*. `FACT`

`https://isitagentready.com/`, retrieved and read first-hand 2026-08-26 (HTTP 200). Verbatim from the page: *"Scan your website to see how ready it is for AI agents. We check multiple emerging standards — from robots.txt and Markdown negotiation to MCP, OAuth, Agent Skills and agentic commerce."*

Its published check list, verbatim, across five categories:
- **Discoverability** — robots.txt · Sitemap · Link headers · DNS for AI Discovery (DNS-AID)
- **Content Accessibility** — Markdown negotiation
- **Bot Access Control** — AI bot rules · Content Signals · Web Bot Auth
- **API / Auth / MCP** — API Catalog · OAuth discovery · OAuth Protected Resource · Auth.md · MCP Server Card · A2A Agent Card · Agent Skills · WebMCP · ARD manifest
- **Commerce** — **x402 · MPP · UCP · ACP**

`INFERENCE:` this is close to fatal for any "I built an agent-readiness auditor" submission. A free, public, one-click tool already scores exactly that, and already knows about all four commerce protocols. Note also that this is the canonical 2026 protocol list — **UCP and MPP have joined ACP and x402**, which is one generation ahead of the *"ACP, AP2, x402"* framing on Razorpay's own Buildathon page.

`CORRECTION, recorded for integrity — and it cuts both ways.` A research subagent first reported that this scanner "excludes commerce protocols from its score." I checked the page and found commerce **is** one of its five check categories, so I flagged the claim as wrong. The subagent then produced the primary source, and the truth is in between:

> `FACT` — `https://blog.cloudflare.com/agent-readiness/` ("Introducing the Agent Readiness score", Cloudflare engineering blog, published 2026-04-17, retrieved 2026-08-26): the scanner **detects** x402, UCP and ACP, but these *"do not currently count towards the score."*

So: commerce protocols are **checked and displayed but not scored**. Both my correction and the original claim were half-right; this is the accurate version. Recorded rather than quietly fixed, because the failure mode it illustrates — a plausible second-hand claim, a plausible first-hand rebuttal, and a primary source that agrees with neither — is exactly the kind of thing that should be visible in a research artefact.

`FACT`, same source: Cloudflare scanned **the 200,000 most-visited domains**. **MCP Server Cards were found on fewer than 15 sites.** 4% declare AI usage preferences. `INFERENCE:` agent-facing infrastructure is, at internet scale, essentially undeployed — which means the *deployment gap*, not the *specification gap*, is where measurable work lives.

`FACT` — Google shipped an **`agentic-browsing` audit category into Lighthouse** (`github.com/GoogleChrome/lighthouse/blob/main/core/config/agentic-browsing-config.js`, `Copyright 2026 Google LLC`, retrieved 2026-08-26). Its audits: `agent-accessibility-tree`, `webmcp-registered-tools`, `webmcp-form-coverage`, `webmcp-schema-validity`, `llms-txt`, CLS. Exposed through the Lighthouse CLI, extension, PageSpeed Insights and the Lighthouse MCP bundle. Docs live at `developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt`. **Zero commerce audits.**

`INFERENCE — the shape of the whole competitive landscape in one line:` Cloudflare, Google and Shopify have all shipped agent-readiness scoring, and **all three stop short of commerce.** Cloudflare detects commerce protocols but does not score them; Lighthouse has no commerce audit at all; Shopify's own scanner checks product-page structured data and *does not test its own UCP checkout*. That is the seam.

### 3.5 The strongest single argument against the whole thesis

> *An "agent-readability auditor" or an "agent-readable catalog generator" is, structurally, an **SEO product**. It optimises how a third party's crawler perceives the merchant. Razorpay is a payments company. It does not sell catalog software, does not own the merchant's product data, has no catalog API, and cannot monetise a readability score. A judge from Razorpay engineering will ask: "where is the money action?" — and for most of these projects the honest answer is "at the very end, as a test-mode payment link, as a badge."*

This is the crux, and it applies to nearly the entire sell-side field including the strongest entrant. Any concept that survives §8 must answer it.

### 3.6 Counter-argument to the refutation (why this is not fatal)

`FACT` (`THE_REAL_RUBRIC.md`): this is a **hiring funnel with a bar, not a ranked prize**. Verbatim: *"if it has signal we call you in."* Selection is non-rivalrous. `INFERENCE:` saturation costs far less than it would in a ranked hackathon; what it costs is **Problem taste** — pillar 1 of the published rubric — because "I built the thing 25 other people built" is a taste signal. The correct response to §3 is therefore **not** to abandon the sell-side. It is to find the corner of the sell-side that is (a) unoccupied and (b) unambiguously about money. §7 and §8 do that.

---

## 4. What "Agent-Readable" Actually Requires — 2026 State of the Art

*(Primary-source detail on ACP/AP2/x402/Instant Checkout/Merchant Center/Perplexity/Rufus/schema.org/llms.txt/ONDC is in §4.9, contributed by the protocol research subagent. What follows is what I verified first-hand.)*

### 4.1 The live answer, verified 2026-08-26: UCP

The thing an Indian merchant's storefront actually exposes to an AI buyer today, when it exposes anything, is **UCP `2026-04-08`**, and it consists of five artefacts:

1. **`/llms.txt` and `/agents.md`** — human-language agent instructions, auto-generated, `text/markdown`. Points the agent at the machine surfaces and at `https://shop.app/SKILL.md`.
2. **`/.well-known/ucp`** — the business profile. `version`, `supported_versions` (dated, e.g. `2026-04-08`, `2026-01-23`), `services` (transport + endpoint + OpenRPC schema URL), `capabilities` (namespaced, each with `version`/`spec`/`schema`, some with `extends` and `requires.protocol.min`), and `payment_handlers`.
3. **An MCP endpoint** (`POST /api/ucp/mcp`, JSON-RPC 2.0) implementing the shopping service: `search_catalog`, `create_cart`, `create_checkout`, `get_checkout`, `update_checkout`, `complete_checkout`.
4. **Payment handlers**, declared per business, each with `id`, `version`, `spec`, `schema` and a handler-specific `config` (e.g. Google Pay's `allowed_payment_methods` / `tokenization_specification`).
5. **Optional AP2 mandate extension** (`dev.ucp.common.payment.ap2_mandate`) binding the checkout cryptographically.

Notable design points, all `FACT` from the retrieved schemas:

- **Money is integer minor units + ISO-4217 code.** From the live `get_checkout` tool description: *"Prices in the response are integers in the currency's ISO 4217 minor units, paired with a currency code: `{"amount": 600, "currency": "USD"}` is $6.00."* (Paise, for INR.)
- **Agent identity is mandatory at the tool boundary.** Every tool's `inputSchema` requires `meta.ucp-agent.profile` — a URI identifying the calling agent.
- **Capability negotiation is by intersection.** Business advertises, platform advertises, the active feature set is the intersection.
- **Human approval is normative for payment.** From the merchant llms.txt: *"Agents must not complete payment without explicit buyer consent."*

### 4.1b What a merchant must actually supply — field level, `FACT` from the cloned schemas

`source/schemas/shopping/types/product.json`:
- **required**: `id` (Global ID), `title`, `description`, `price_range`, `variants`
- optional: `handle`, `url`, `categories` (with taxonomy identifiers), `list_price_range`, `media`, `options`, `rating`, `tags`, `metadata`

`source/schemas/shopping/types/variant.json`:
- **required**: `id` (GID — *"Used as item.id in checkout"*), `title`, `description`, `price`
- optional but load-bearing: `sku`, **`barcodes`** (*"Industry-standard product identifiers for cross-reference and correlation"*), `quantity_unit`, `unit_price`, **`availability`**, `options`, `seller`

`source/schemas/shopping/types/availability.json`: `available` (boolean) + `status` with well-known values `in_stock`, `back…` (truncated in retrieval).

`INFERENCE:` the required set is deliberately small — UCP is not asking for a rich feed. The hard part is not the catalog fields. It is the **checkout service, the payment handler, and the mandate** — i.e. the parts that are payments.

### 4.1c The checkout object already encodes Track 01's bar — `FACT`, from `source/schemas/shopping/checkout.json`

- **required**: `ucp`, `id`, `line_items`, `status`, `currency`, `totals`, `links`
- `status` is a closed enum: `incomplete` · **`requires_escalation`** · `ready_for_complete` · `complete_in_progress` · `completed` · `canceled`
- `policies[]` — *"Policies (e.g., return/refund terms) that apply to the items in this checkout"*
- `expires_at` — RFC 3339, *"Default TTL is 6 hours from creation if not sent"*
- `messages[]` — *"error and info about the checkout session state"*
- `payment` — optional on `create`/`update`, **`required` on `complete`**
- `source/schemas/common/types/payment_instrument.json` — **required**: `id`, **`handler_id`**, `type`

`INFERENCE — this is the strategically important observation of §4:` the protocol has already standardised the exact three things the Track-01 bar asks for. **Gated** is the `requires_escalation` status. **Explainable** is `messages[]`. **Bounded** is `expires_at` plus the AP2 mandate ceiling. And a merchant becomes payable by a given rail purely by declaring a `handler_id` its checkout will accept. Which means: *"make a merchant transactable by an AI buyer end to end"* has a precise, published, machine-checkable definition in 2026, and `handler_id: "in.razorpay.upi"` is the piece of it that does not exist.

### 4.1d Identity and anti-replay are already specified — and not yet deployed. `FACT`

`docs/specification/signatures.md`, verbatim structure:

- **Signature format**: RFC 9421 HTTP Message Signatures. **Algorithms: must verify ES256 (baseline)**; others optional, "counterparty-driven".
- **Body digest**: RFC 9530 `Content-Digest` over raw bytes.
- **Key format**: JWK (RFC 7517, + RFC 8037 for Ed25519).
- **Key discovery**: a `keys[]` JWK Set **published in `/.well-known/ucp`**.
- **Replay protection**: `idempotency-key` at the business layer.
- Protects explicitly against *"Impersonation… Tampering… Replay attacks… Method/endpoint confusion."*

I then checked whether the live Indian stores actually publish `keys[]`: **zouk.co.in, mamaearth.in, www.chumbak.com — 0/3.** Their profiles carry only `version`, `supported_versions`, `services`, `capabilities`, `payment_handlers`.

`INFERENCE, two consequences.` (1) Several buildathon entries are hand-rolling Ed25519 mandate schemes (`aryanpajnee`, `AgentCashier`) — defensible engineering, but the ecosystem has standardised on RFC 9421 + ES256 + JWK discovery, and citing that is a cheap, large credibility win. (2) There is a real, measurable deployment gap between *specified* merchant identity and *deployed* merchant identity — which is a legitimate batch metric and the natural attachment point for the Razorpay-as-attestor idea in §7.3.

### 4.2 What UCP does *not* yet cover — `FACT`, from `docs/documentation/roadmap.md`

Verbatim: *"We plan to do this through a phased rollout across markets, **including India**, Indonesia, Latin America, and others. We are adapting the protocol to support broader regional use cases and **localized payment interoperability**."*

And, verbatim: *"We invite businesses, developers, and **payment providers** to join us in refining these specifications."*

`INFERENCE, high confidence:` India and localized payments are explicitly **future work** in the UCP roadmap as of 2026-08-25. There is a named, open, Apache-2.0 slot for exactly one thing: **an Indian payment handler.**

### 4.3 The measured reality of Indian catalog data

See §2.4. Summary: price and availability are legible; **GTIN, inventory depth, shipping policy and returns policy are not**. The last two are the ones that make an agent purchase go wrong *after* the money moves.

### 4.4 The 2026 protocol landscape — verified against primary specs

Cloudflare's `isitagentready.com` names four commerce protocols. Each was opened and, where a repo exists, cloned.

| Protocol | Governance / status | Merchant-side reality | Razorpay in it? |
|---|---|---|---|
| **UCP** — Universal Commerce Protocol · `ucp.dev` · `github.com/Universal-Commerce-Protocol/ucp` (3,328★, Apache-2.0, created 2025-12-31) | Governing Council: **Google + Shopify permanent; Stripe joined 2026-04-28.** 16-seat Shopping Tech Council (Google, Shopify, Etsy, Meta, Amazon, Target, Microsoft, Stripe, Salesforce, Wayfair). Releases `v2026-01-11` → **`v2026-08-25`** | **Live in the wild.** Verified on allbirds.com, skims.com and 6 Indian D2C brands | **No** |
| **ACP** — Agentic Commerce Protocol · `agenticcommerce.dev` · `github.com/agentic-commerce-protocol/…` (1,523★, Apache-2.0) | *"maintained by **OpenAI** and **Stripe** and is currently in `beta`"*; TSC seats: OpenAI, Stripe, **Meta**; founders retain **veto**. CLA signatories add Adyen, Wix, commercetools, Affirm, PayPal. Latest stable `2026-04-17`; **last repo push 2026-07-18** | Spec is complete; **deployment is not.** `/.well-known/acp.json` probed on 8 domains incl. `acp.stripe.com`, allbirds, glossier, etsy, wayfair → **404 on every one** | **No** |
| **AP2** — Agent**ic** Payment Protocol · `github.com/google-agentic-commerce/AP2` (3,156★) | v0.1.0 (2025-09-16) → **v0.2.0 (2026-04-28)**. Core spec work *"will continue in **FIDO**"* | **Not a merchant integration.** See §4.4b | **No** |
| **x402** · `x402.org` · `github.com/x402-foundation/x402` (6,542★) | **Linux Foundation, operational launch 2026-07-14**, Coinbase contributed the protocol. 40 members incl. Google, Stripe, Shopify, Visa, Mastercard, AWS | **Not retail.** See §4.4c | **No** |
| **MPP** — Machine Payments Protocol · `mpp.dev` | San Francisco; **IETF specs**; SDKs in TS/Go/Ruby/Rust/Python | *"lets agents pay for **services** on the web, extensible to any payment method"* | **No** |

`INFERENCE, high confidence — the framing correction that matters most:` the Buildathon page's *"the global protocol race (ACP, AP2, x402)"* is the **2025** picture. By August 2026: **AP2 became a UCP extension**, **x402 became a Linux Foundation API-micropayment protocol**, **ACP's discovery layer is not deployed anywhere I could find**, and **UCP is the one thing actually running on storefronts**. A submission that engages the 2026 list rather than the page's 2025 list demonstrates exactly the "problem taste" the rubric grades.

### 4.4b AP2 v0.2 — two corrections that the buildathon field has got wrong. `FACT`

From `docs/ap2/specification.md` (header: **"Agentic Payment Protocol (v0.2)"**):

1. **The mandate vocabulary was renamed in v0.2.** The current types are **Checkout Mandate** and **Payment Mandate**, plus an **Open Mandate / Closed Mandate** distinction (*"Open Mandate — A Mandate that has not yet been bound to a particular action"*). SDK schemas present: `checkout_mandate.json`, `open_checkout_mandate.json`, `payment_mandate.json`, `open_payment_mandate.json`, `checkout_receipt.json`, `payment_receipt.json`. **"Intent Mandate" and "Cart Mandate" are v0.1 terms.** Several buildathon entries (`aryanpajnee`, `abhishek591508/AgentCashier`) implement "Intent + Cart Mandates" — i.e. against a superseded version. `INFERENCE:` citing v0.2 correctly is a cheap, visible differentiator.
2. **Signature algorithm is constrained.** *"The Checkout JWT MUST be signed using a digital signature scheme (e.g., ECDSA) and **not** a deterministic signature (e.g., Ed25519)"* — to prevent rainbow-table attacks. **Multiple buildathon entries sign mandates with Ed25519.** That is a defensible engineering choice in isolation, but it is contrary to the spec they cite.
3. **Mandates are versioned by a `vct` claim** (`mandate.payment.1`, `mandate.checkout.open.1`); *"Implementations MUST match the exact `vct` string."*

**And the decisive one — AP2's own FAQ tells merchants to use UCP instead**, verbatim:

> *"If you are a merchant who would like to showcase products and allow users to complete inline checkout on Google's AI surfaces like **AI Mode and Gemini**, then you should use **Universal Commerce Protocol**. You can enhance the protocol with the **AP2 extension** if you plan to build autonomous purchase scenarios where AI Agents can make purchases in the user's absence."*

And from the spec itself: *"AP2 operates as a security feature **within a Commerce Protocol**… The exact details of the Commerce Protocol (e.g., catalog APIs, checkout updates) are **outside the scope of AP2**."*

`INFERENCE, high confidence:` **there is essentially no merchant-side AP2 integration.** Any submission whose sell-side story is "I implemented AP2" has implemented an authorization layer and skipped the commerce protocol.

### 4.4c x402 is not a retail protocol — `FACT`, and it settles a question the Buildathon page leaves open

- Wire protocol: `402 Payment Required` + headers `PAYMENT-REQUIRED` / `PAYMENT-SIGNATURE` / `PAYMENT-RESPONSE`; facilitator interface is exactly `POST /verify` and `POST /settle`; networks Base/Solana with USDC.
- Its own discovery layer, **Bazaar**, verbatim: *"a machine-readable catalog that helps developers and AI agents find and integrate with **x402-compatible API endpoints and MCP tools**."* And: ***"Q: Can I list non-x402 services? A: No."*** Its `type` field has exactly two values, `"http"` and `"mcp"`.
- **No product, SKU, GTIN, variant, inventory, shipping, tax or address concept exists anywhere in it.** `docs.x402.org/llms.txt` lists 28 pages; **zero** mention products, carts, orders, fulfillment, shipping or returns.
- Vendor-reported 30-day stats: 75.41M transactions / $24.24M volume → `INFERENCE:` **≈ $0.32 average transaction value.**

`INFERENCE:` x402 is machine-to-machine API metering. Retail-direction signals exist (an `auth-capture` scheme with `authorize/charge/capture/void/refund/reclaim`, an `offer-and-receipt` dispute-evidence extension self-described as *"not considered stable"*, ISO-4217 fiat asset codes) but **a merchant cannot today express a catalog, inventory, shipping address or tax line in x402.** `EVIDENCE NOT FOUND`: any x402 primary source describing a technical relationship with AP2.

### 4.4d ACP — the sell-side spec Razorpay has none of. `FACT`

ACP is the most complete published statement of what a merchant must expose. Its **product-feed RFC motivation is, verbatim, the Track 01 problem statement, written by OpenAI and Stripe**:

> *"Agents rely on scraping or proprietary catalog APIs: Product discovery is brittle, incomplete, and inconsistent across merchants."*
> *"Checkout item identifiers are hard to obtain."*
> *"Merchants lose control over product representation: Agents may infer names, images, variants, seller details, or policy links from unstructured pages."*

| ACP RFC / surface | Razorpay equivalent |
|---|---|
| `rfc.product_feeds.md` — catalog publication (push: merchant → agent) | **NONE** |
| `rfc.discovery.md` — `/.well-known/acp.json` | **NONE** |
| `openapi.agentic_checkout.yaml` — 5 checkout-session endpoints | Orders / Payment Links (no session model) |
| `rfc.delegate_payment.md` — `Allowance` | **UPI Reserve Pay `token.max_amount` / `expire_at`** ✅ |
| `rfc.orders.md` — `adjustments[]` | Refunds + Disputes (partial) |
| `rfc.intent_traces.md` — structured cancellation | **NONE** |
| `rfc.capability_negotiation.md` | **NONE** |
| `docs/mcp-binding.md` — 5 MCP tools | razorpay-mcp-server (payments only) |

**The `Allowance` object** (`schema.delegate_payment.json`), required fields: `reason` (enum, currently only `one_time`), `max_amount` (minor units), `currency`, `checkout_session_id`, `merchant_id`, `expires_at`. `INFERENCE:` this is **structurally identical to UPI Reserve Pay's token** (`max_amount`, `expire_at`, bound to a merchant). Razorpay already ships the India-native equivalent of the one ACP primitive it does have — and has never mapped it onto any protocol.

**Feed schema, exact** (`schema.feed.json`): `Product` requires `id`, `variants`; `Variant` requires `id`, `title`; `Price` requires `amount` (**integer, ISO 4217 minor units**) + `currency`; `Barcode` requires `type`+`value` (*"such as GTIN, UPC, or EAN"*); `Link.type` includes `refund_policy`, `shipping_policy`. Normative: *"Agents **MUST** treat checkout responses as authoritative even when they differ from feed data."*

### 4.5 What a merchant must actually implement — the synthesis

`INFERENCE, grounded in the retrieved specs.` "Publish good markup" is not the 2026 answer. Four things work, and they are additive:

1. **A structured product feed in Google-Merchant-Center lineage format.** Highest leverage, because the *same* CSV/TSV is accepted by Google Merchant Center, by OpenAI/ChatGPT (which has an explicit Google-compatibility path — *"If your feed uses a Google-compatible product data format, OpenAI will use that formatting"*), and by Stripe ACS. Minimum universal set: `id`, `title`, `description`, `link`/`url`, `image_link`/`image_url`, `availability`, `price`, `brand`, plus `gtin` **or** `mpn`, plus variant grouping (`item_group_id`/`group_id`).
2. **Freshness plumbing.** Stripe's published cadence: product data **daily**, **inventory every 15 min**, **pricing every 15 min**. OpenAI: full snapshot daily by **SFTP** (parquet preferred, ≤500k items/shard, ~500 MB) + API upserts intraday.
3. **A live machine-callable transaction surface** — ACP's five checkout endpoints on your own domain, or UCP via your platform at `/.well-known/ucp` over MCP.
4. **Agent-facing trust artifacts** — OpenAI makes **`seller_privacy_policy` and `seller_tos` hard-required the moment `is_eligible_checkout=true`**; plus structured returns, idempotency, signed requests (RFC 9421 for UCP; HMAC `Merchant-Signature` for ACP), and order webhooks.

**Three things that do NOT get you there, on the evidence:**

- **schema.org markup alone.** `FACT`: OpenAI's entire commerce docs export (2,188 lines) contains **zero** occurrences of `schema.org`, `structured data`, `json-ld`, `microdata` or `crawl`. Grepping the ACP repo for `schema.org` returns only `"$schema": "https://json-schema.org/…"`. Grepping the UCP repo for `schema.org/Product` returns **zero** — UCP defines its own model. And Google itself, verbatim (`developers.google.com/search/docs/appearance/ai-features`): ***"You don't need to create new machine readable files, AI text files, or markup to appear in these features. There's also no special schema.org structured data that you need to add."*** `INFERENCE:` schema.org is the **search-engine** contract; **feeds and MCP tool schemas are the agent contract.** My own measurement (§2.4: 10/10 Indian stores have Product+Offer JSON-LD) therefore measures the *wrong surface* for agent buyability — a correction worth stating out loud.
- **llms.txt.** Spec v2 (`llmstxt.org`, Jeremy Howard / @answerdotai, 2,586★). It **explicitly rejects `/.well-known/`**. Only required element is an H1. `FACT`: `developers.google.com/search/docs/appearance/ai-features` contains **0 occurrences of "llms.txt"**; Chrome's Lighthouse audit says *"If the file is not provided by the server (resulting in a 404), the audit is marked as Not Applicable"*; `docs.stripe.com/llms.txt` is 695 lines with **zero** occurrences of "agentic" — Stripe's own agentic docs are absent from its own llms.txt. `shopify.dev/llms.txt` → **404**. Open issues proposing commerce extensions (#107, #116, #121, #125, #132, #139) are all **unmerged**. `INFERENCE:` narrow yes (a docs index for coding agents), broad no. **It carries no product primitives and is not evolving toward transactability.** `www.target.com/llms.txt` uses it to teach agents its URL grammar — 14 category links, **zero SKUs**.
- **x402** (§4.4c).

### 4.6 Google's agentic checkout excludes India — `FACT`, and this is the load-bearing fact of the document

`support.google.com/merchants/answer/16837055`, verbatim:

> *"**Only product listings using the `native_commerce(checkout_eligibility)` product attribute will display the 'Buy' button** for this checkout experience."*

Eligibility, verbatim: **United States, Canada, Australia**, participating merchants. Expansion announced 2026-05-20 to **Canada and Australia, later the UK**. Payment currently via **FPANs stored in Google Wallet**; a **Google Pay & Wallet Console account is required**.

`INFERENCE, high confidence:` an Indian merchant can be *discovered* by a Google agent, and can even serve a UCP profile via Shopify — but **cannot be bought from through Google's agentic checkout, because India is not an eligible market and the payment instrument is a card in Google Wallet.** Combined with §3.1 (six Indian merchants, card-only handlers) and UCP's roadmap naming India as *future* "localized payment interoperability", the picture is unambiguous: **India is on the agentic map for discovery and off it for payment.**

Two corroborating India-specific details: Google's product data spec carries an **India-only attribute, `maximum_retail_price`**, and shipping costs are **required** for India in Merchant Center — so Google already models India specially everywhere *except* checkout.

### 4.7 India's own stack — ONDC / Beckn. `FACT`

- **Beckn 2.0 is real and actively developed.** `beckn/protocol-specifications-v2` is **LTS**, OpenAPI 3.1.1, pushed 2026-08-17. New in 2026: `beckn/catalog-core` (pushed 2026-08-25) — *"turn a catalog document into a **signed, versioned set of index/baseline/change files**"*, Ed25519 detached JWS; `beckn/beckn-discovr` (2026-08-21) — a discovery service with JSONPath, geo and semantic search; `beckn/beckn-agents` (2026-07-16) — *"Model-agnostic **AI skills** for building with Beckn Protocol 2.0"*, installable as a Claude Code plugin.
- **ONDC's retail item model is idiosyncratic.** Real `on_search` payload fields: `@ondc/org/returnable`, `@ondc/org/return_window: P3D`, `@ondc/org/time_to_ship: PT20M`, `@ondc/org/available_on_cod`, `@ondc/org/statutory_reqs_packaged_commodities`, with attributes as `tags[].list[]` code/value pairs rather than typed fields.
- **But it is dormant on agents.** `ONDC-Official/ONDC-Protocol-Specs` (145★) last pushed **2025-01-31**. `ONDC-Official/ondc-mcp` is a *"production MCP server **boilerplate**"* inside ONDC's internal automation/testing framework — last push **2025-11-19**, 1★. `gh search issues "agentic" --owner ONDC-Official` → **zero**. No ONDC statement on AI shopping agents exists.

`INFERENCE (moderate-high):` ONDC/Beckn is structurally *a* machine-readable Indian catalog standard — signed artifacts, a discovery service, an LLM-skills repo — but it is a **closed network between registered Network Participants**, not an open surface a third-party agent can query, and **no third-party AI shopping agent consumes it.** Calling it "the de-facto Indian agent-readable catalog standard" is defensible on structure and indefensible on adoption. This removes the most obvious objection to §8/C1 — *"just use ONDC"* — but it also means an ONDC-based submission would be building on a dormant rail.

### 4.8 NPCI's protocol — name correction and status

`FACT`: the reported name is **"Unified Agent Protocol"**, not "Unified Agentic Protocol". Source: MediaNama, *"How NPCI should approach agentic payments"*, Nikhil Pahwa, **2026-07-10**, relaying **Business Standard ~2026-07-09** (anonymous sourcing, *"the report is scant on details"*). `EVIDENCE NOT FOUND`: any NPCI circular, specification, developer doc or press release. `npci.org.in` actively blocks automated retrieval (403 / anti-bot). **Do not cite UAP specifics; do not build a demo that depends on it existing.** `INFERENCE:` if it ships it is a payments-*authorization* layer — the analogue of AP2/ACP delegate-payment — not a catalog standard.

### 4.9 MCP has no payments extension — `FACT`

`modelcontextprotocol.io/extensions/overview` lists only OAuth Client Credentials, Enterprise-Managed Authorization, MCP Apps and MCP Tasks. Payment proposals were opened and **closed**: SEP-2009 *"Payment Support for MCP Servers"* (opened 2025-12-23, **closed 2025-12-27**; body proposed *"X402 Protocol v2 as the first supported payment protocol"*), companions #2007/#2008 closed, and #3229 (x402 metering RFC, opened 2026-08-11, **closed 2026-08-23**).

`INFERENCE:` the ecosystem has decided payments do **not** belong in MCP — they belong in the commerce protocol layered above it (UCP/ACP) with AP2 as the authorization extension. Any submission that bolts payments into an MCP server is going against a decision that has been made twice, in public, this year.

## 5. Failure Modes When Agents Buy — with measurability notes

Enumerated against the brief's list, each annotated with whether it is *measurable in a batch harness a student can build in 8 days*, and whether it is *already taken* in the field.

| # | Failure mode | Measurable? | How you'd measure it | Occupied by |
|---|---|---|---|---|
| F1 | Missing/ambiguous structured data | **Yes, easily** | Field-presence rate over an N-merchant corpus (I measured GTIN 0/1016, returns 3/10) | Every readiness auditor (§3.4); `Agent-Audit` |
| F2 | Stale price / stock | **Yes** | Feed price vs. live checkout price divergence, per SKU, per fetch | Weakly — `GraceyDugar`, `dante` do it per-transaction, not in batch |
| F3 | Variant confusion | **Yes** | Ask agent for a specific option combo; score exact-variant match rate. Real Indian stores have up to 486 variants/25 products (sleepycat.in) | **Unoccupied** as a metric |
| F4 | No machine-readable shipping/returns policy | **Yes** | JSON-LD `OfferShippingDetails` / `MerchantReturnPolicy` presence — I measured 3/10 | Partially (auditors check presence; nobody links it to refund execution) |
| F5 | Hallucinated availability | **Yes** | Agent claims in-stock; verify against feed `available` | `Agent-Audit` (choice-level), `GraceyDugar` (claim-level) |
| F6 | No way to verify the merchant is real | **Yes, but** — needs a trust oracle | Requires an attestor. This is the one primitive Razorpay uniquely holds (§7.3) | Visa TAP, Forter TACP, SAM Protocol, `djt53/attest`, several buildathon entries |
| F7 | No agent identity | **Yes** | UCP already mandates `meta.ucp-agent.profile`; measure whether merchants validate it (I would predict: none do) | **Largely unoccupied at the merchant-enforcement end** |
| F8 | No spend authorisation | **Yes** | Cap/whitelist/velocity breach rate over injected cases | **Heavily occupied** — the single most common buildathon pattern |
| F9 | No dispute path when an agent bought wrong | **Yes** | Inject N wrong-purchase scenarios; measure auto-resolution rate + residual exception list | `sting-raider/project-dante` (single flow, not batch) |
| F10 | Refund/return handling | **Yes** | Razorpay test-mode refunds are exercisable; measure time-to-remedy and % auto-resolved | `dante` only |
| F11 | Replay / double-charge | **Yes** | Duplicate webhook + retried idempotency key cases | `AgentCashier` (1 eval), `aryanpajnee`, `Agent-Audit` (dedupe by `entity_key`) |
| F12 | **Prompt injection from the merchant's page into the buying agent** | **Yes, and cheaply** | N synthetic poisoned listings × M agents; attack-success rate before/after defence, plus **false-positive rate on clean listings** | `AgentCashier` (1 demo case); `Agent-Audit` explicitly lists it as *not yet done*; `Nirvanjha2004/promptwall` (but Track 02) |
| F13 | **Payment-method mismatch** — agent can pay by card but the merchant/buyer is UPI-native | **Yes** | Handler-coverage rate over an N-merchant corpus. **I measured 0/6.** | **Nobody, as a measurement.** Pine Labs P3P (§7.3b) attacks the underlying problem with a *proprietary* UPI agentic protocol; no one measures the gap, and no one has proposed UPI as a handler inside a live open protocol |

`INFERENCE:` F13 is the only row where nobody measures the gap, where the measurement is trivially reproducible, and where the subject matter is unambiguously payments rather than catalog metadata. F3, F7 and a batch treatment of F12/F9 are the runners-up.

**Two external results sharpen this table.** (1) `arxiv.org/abs/2605.06457` finds **10 of 18 LLMs skip the payment-confirmation checkpoint while still scoring perfect task success** — so F8's "no spend authorisation" is not hypothetical, and agent self-report cannot be used as the measurement instrument. (2) Cloudflare scanned the 200,000 most-visited domains and found **MCP Server Cards on fewer than 15** — so F7's agent-identity gap is near-universal, and any claim that "merchants validate agent identity" would be false.

**Measurability caveat that must be stated honestly in any submission:** F1/F3/F4/F13 are *properties of the merchant corpus* and can be measured deterministically with no LLM at all — which is a direct hit on rubric pillar 3 (*"the right tool in the right place, and where you chose not to use one"*). F5/F12 require LLM trials and therefore need confidence intervals, seeds and an effective-n disclosure. Do not mix the two classes of number without labelling them.

---

## 6. Competitive Landscape

### 6.1 `Adarsh-Me/Agent-Audit` — full assessment

I cloned and read the repository (352 files, 2.8 MB, TypeScript + Python, Apache-2.0, created 2026-08-21, last pushed 2026-08-25).

**Do not spare us — so: this is the strongest Track-01 submission I have seen, and it is very good.** It would clear the published bar comfortably. Specifics:

- **Design.** 640 trials = 20 personas × 10 conditions × 3 bulk models + 2 flagship × 20. Conditions isolate baseline (C1, 3 seeds), position (C2, 3 *shared* shuffle seeds so ordering is a clean treatment), and framing (C3-A/B, information-equivalent human-authored rewrites, forced-choice so coverage-failure and share-shift cannot contaminate each other). Seeds derived by `sha256("trial|{persona}|{condition}")`.
- **Statistics.** Persona-cluster bootstrap B=2,000; Wilson intervals for the failure rate; a 10,000-replicate permutation test for position bias; cosine cross-model stability. The score CI is *propagated through the same resample*, not assumed. `backend/tests/validation/` holds a **V1–V6 planted-bias suite, CI-gated** — they plant a known bias and assert the pipeline detects it.
- **Intellectual honesty, which is the thing Razorpay's rubric actually screens for.** From `BUILDLOG.md`, Day 6, verbatim: *"permutation test v1 shuffled the observed slot-value array — value multiset survives shuffling, so p=1.0 always. Reimplemented… Exactly what the planted-bias suite exists to catch."* From `SUMMARY.md` §7: *"Earlier drafts froze illustrative constants… that traced to **no recorded run** — they were removed rather than defended."* They report a live run as **234/640 parse_ok (36.6%)** rather than hiding it. HHI and framing are deliberately *excluded* from the score because they are model-side properties the merchant does not control.
- **Money-safety.** `SAFETY.md` documents a ₹2,000 per-link cap, a SKU whitelist, a `rzp_test_` assertion, distinct error codes per policy, price enforced from the DB (the agent sends only `run_id`+`sku`), `agentaudit:{run_id}:{sku}` idempotency key, HMAC-SHA256 webhook verification, `entity_key` dedupe — **and a stated limitations section admitting the cap is per-link not per-session and that idempotent replays bypass the whitelist.**

**What it does NOT cover — verified by grep and by their own docs:**

| Gap | Evidence |
|---|---|
| **No protocol conformance whatsoever.** No ACP feed, no UCP profile, no `/.well-known/*`, no AP2 mandate. | Grep for `ACP\|AP2\|x402\|well-known\|mandate` across the clone returns only prose in `PRD.md`. `PRD.md` §NG-6: *"AP2 conformance claims"* is an explicit **non-goal**; *"We say 'designed to integrate' — never 'AP2-compatible'"*. Mandate testing is roadmap item **R-3**. |
| **No prompt-injection handling.** | `SUMMARY.md` §7, "still before submission": *"Prompt-injection threat model for uploaded catalogs…"* — i.e. not built. |
| **No live-site interaction.** The agent never browses, never calls a checkout API, never encounters a variant picker. The full 40-SKU listing is embedded in a prompt. | `Docs/TECHSPEC.md` §7.3; `engine/prompts.py`. |
| **N=1 merchant.** 640 trials against **one** 40-SKU synthetic catalog. Store import is capped at 100 listings, one store at a time. | `TECHSPEC.md` §211. |
| **No merchant identity/verification, no dispute path, no refund, no variant fidelity, no shipping/returns legibility, no stale-price test.** | Absent from the router list (`uploads, audit, metrics, report, revenue, fixes, delta, payments, webhooks, stream`). |
| **Payment is decorative.** One capped test-mode Payment Link + webhook → a "verified ✓" badge. | `SAFETY.md`; `SUMMARY.md` Step 9. Their own claim discipline: *"'designed to integrate with Razorpay' ≠ production PSP integration."* |
| **Framing is GEO/AEO, not payments.** | `SUMMARY.md` §1, verbatim: *"For 20 years merchants optimized for two readers — humans (UX) and Google (SEO). A third reader is here."* |

**Verdict on Agent-Audit.** It has nailed *"can an agent see and choose your products"* — measurement, statistics, honesty and all. It has not touched *"can an agent buy correctly and can the payment layer prove it."* It is beatable **only** on the payments axis, and only by someone who does not try to out-statistics it. Attempting a better catalog-legibility auditor in 8 days would be a mistake.

### 6.2 The rest of the buildathon field

See §3.3 — ≥20 sell-side entries, several of them strong (`aryanpajnee` for mandates, `project-dante` for post-purchase remedy, `GraceyDugar` for claim verification, `kdahal7` for a well-known ACP manifest).

### 6.3 The commercial and open-source field outside the buildathon

All rows retrieved **2026-08-26**. `FACT` unless marked. The column that matters is the third one.

#### 6.3.1 Platform-shipped readiness scoring — free, and it stops before commerce

| Tool | URL | What it does | Tests whether an agent can **buy**? |
|---|---|---|---|
| **Cloudflare Agent Readiness score** | `blog.cloudflare.com/agent-readiness/` (2026-04-17) · `isitagentready.com` | 4 scored dimensions; detects x402/UCP/ACP but *"these do not currently count towards the score"*; scanned the 200,000 most-visited domains | **No** |
| **Google Lighthouse `agentic-browsing`** | `github.com/GoogleChrome/lighthouse/.../agentic-browsing-config.js` | `agent-accessibility-tree`, `webmcp-*`, `llms-txt`, CLS. In CLI, extension, PSI, and the Lighthouse MCP bundle | **No — zero commerce audits** |
| **Shopify Agentic Readiness** | `shopify.com/agentic-readiness` · `shopify.com/enterprise/blog/agentic-ready-product-data` (2026-06-05) | Free no-login scanner; **product-page structured data only**; defines "agentic-ready product data"; ships remediation, not diagnosis | **No — does not test its own UCP checkout** |

#### 6.3.2 Commercial merchant-side scoring — crowded

| Vendor | URL | What it does | Buyability? |
|---|---|---|---|
| **ReFiBuy × Digital Commerce 360 "AI1000"** | `digitalcommerce360.com/2026/07/15/ai-commerce-rankings/` · `refibuy.ai/ai-commerce-rankings` | Quarterly 0–100 rankings of the top 1,000 retailers on 4 signals (bot friendliness, AI source traffic, source diversity, 90-day momentum); ReFiBuy sells *"SKU-level eligibility, not aggregate scores"* | **No** |
| **AgentGrade** | `agentgrade.com/agent-readiness` | 70+ signals, explicitly including *"Payment protocols — can an agent transact?"* | Partial — declaration-level |
| **RivalSweeper** | `rivalsweeper.com/blog/agent-readiness-score` (2026-07-20) | 0–100, Tier S→F, weekly recalculation, scores competitors' domains too | **No** |
| **Paz.ai** | `paz.ai/agentic-commerce` | Free "AI Readiness Report"; **multi-protocol ACP + UCP translation**; $10k–$100k+/yr | Partial |
| **agenticcommerce.shop** (Agentic Commerce Alliance × Shopware) | `agenticcommerce.shop` | 3 layers including a **"Transaction Readiness"** layer; 9 signals, 20+ diagnostics; BETA | Claims to |
| **AgentReady (ActOnce)** | `agentreadystore.com` | *"first scanner built to help ecommerce stores become agent ready for AI buyers"*; **inspects checkout flow**; sample stores score 28–56/100 | Claims to |
| **Productsup · Feedonomics** | `productsup.com` · `feedonomics.com` | Feed infrastructure repositioned for agentic channels; Feedonomics has a dedicated Agentic Commerce product, *"turns discovery into checkout"*; Productsup 2T products/month | **No** |
| **Scrunch · Profound · Peec · Athena · Evertune** | vendor sites | AEO/GEO brand-visibility analytics | **No** — legibility for *answering*, not buying |
| **DataFeedWatch** | `datafeedwatch.com` | AI enrichment, **no agentic positioning at all** | No |
| **Bluefish** | — | `bluefish.app` is a **parked domain for sale**; `.ai` fetch failed. Existence unverified | `EVIDENCE NOT FOUND` |

> **The one that matters most.** **AgentChecker.ai** (`agentchecker.ai`, "A CodeHawks Product", from £19/audit): verbatim — *"sends a real AI agent driving a real browser through your live site: search, sign-up, checkout"*, 20+ tasks, and asks the question *"Can an agent actually buy something?"* Published usage: **185 real audits across 94 unique sites, 13 Jan – 21 Apr 2026.** `INFERENCE:` this is the closest thing in existence to an outside-in agent-buyability test, and any concept in §8 that claims novelty on "we actually complete the purchase" must be checked against it first. It is, however, browser-driven and Western; it does not touch payment protocols, UPI, or conformance.

#### 6.3.3 Agentic-commerce infrastructure startups

| Company | URL | Position | Merchant buyability? |
|---|---|---|---|
| **Firmly.ai** | `firmly.ai` | *"One connection. Every agentic channel"* — covers UCP, ACP, MCP, AP2, TAP; checkout plumbing | No scoring |
| **Rye** | `rye.com` | Agents buy from any store via browser automation, **no merchant onboarding required** — structurally makes merchant readiness optional | N/A |
| **Skyfire** | `skyfire.xyz` | Merchants "enable agent acceptance" via F5 / HUMAN Security *"without technical lift from the merchant"* | N/A |
| **Crossmint** | `crossmint.com` | Agent-side wallets/cards | N/A |
| **Nekuda** | `nekuda.ai` | *"Scan your site and get your first WebMCP tools live in minutes"*; backed by Madrona, **Visa Ventures, Amex Ventures**. Notably published its own post *"Is 'Agent Readiness' a Real Category — or Just Snake Oil?"* (2026-06-18) | Partial |
| **Lemrock** | `lemrock.com` (€6M, 2026-03-11, Paris) | Ingests catalogs for LLM retrieval; 10M+ products | No |
| **ShopAgentic** | €1.9M pre-seed, June 2026 (Hannover) | *"merchant-side agent-ready infrastructure"* (`HYPOTHESIS` — product description unverified) | Unknown |
| **Stripe** | `docs.stripe.com/agentic-commerce` | Supports sellers via **UCP or ACP**; agent side is private preview | **No readiness tooling anywhere in the docs** |

#### 6.3.4 Open source — the prior art that matters for §8

| Repo | Stars / status | Relevance |
|---|---|---|
| `forter/agentic-readiness-guide` | 106★, CC-BY-4.0 | 5 modules / 25 machine-testable guidelines, including **`m4-9-commerce-protocols`** which greps `/.well-known/ucp`. Ships a Claude Code SKILL.md. **The best OSS prior art; read it before building.** |
| `Universal-Commerce-Protocol/conformance` | 24★, pushed 2026-08-18 | UCP Conformance Test Suite — integration tests against a live UCP merchant server. **The only genuine transactional verifier — but it is a self-test, not outside-in.** |
| **`Shopify/ucp-proxy`** | 54★, **last push 2026-03-19 — stale** | The bridge that puts a UCP face on WooCommerce / Wix / custom stores. **It is the exact artefact a non-Shopify Indian merchant would need, and it has been abandoned for five months.** |
| `saleor/saleor-mcp` | 16★ | Explicitly read-only, *"doesn't trigger any mutations"* |
| `techspawn/woocommerce-mcp-server` | 101★, untouched since 2025-11-10 | Admin CRUD only — not a buyer surface |
| ACP/UCP **product-feed validator** | — | `EVIDENCE NOT FOUND` — `gh search repos "acp product feed validator"` returns 0 |

#### 6.3.5 Benchmarks — the central negative result

Every mainstream shopping benchmark measures **the agent**, not the merchant:

| Benchmark | Scale | Measures |
|---|---|---|
| WebShop (NeurIPS 2022) | 1.18M products, 12,087 instructions | **AGENT** |
| WebArena / VisualWebArena | VWA 910 tasks | **AGENT** |
| Mind2Web / Mind2Web 2 | 2,000+ tasks / 137 sites; 130 tasks Agent-as-Judge | **AGENT** |
| τ-bench / τ²-bench | DB-state comparison, `pass^k`; retail/airline/telecom | **AGENT** |
| ShoppingBench (AAAI 2026 oral) | 2.5M+ real products, vouchers + budget | **AGENT** |
| Shopping MMLU (NeurIPS 2024 D&B) | 57 tasks, Amazon | **AGENT** (knowledge) |
| DeepShop · WebVoyager · TheAgentCompany · AgenticShop | — | **AGENT** |
| **WebMall** (SIGIR 2026) | multi-shop, heterogeneous Common Crawl offers, tasks include cart + checkout | **PARTIALLY MERCHANT** |
| **ACWorld** | 785,022 listings, has a first-class **Merchant** agent | **PARTIALLY MERCHANT** |
| **MerchantBench** (Jul 2026) | best LLM at 27.3% of human | **MERCHANT OPS** (sourcing/pricing/cash-flow) — a different sense of "merchant-side" |

> `EVIDENCE NOT FOUND`, and this is the central gap: **no benchmark scores merchants on a leaderboard, and none varies catalog data quality against agent purchase-completion rate.**

#### 6.3.6 Academic backing — strong, and directly usable

| Finding | Source |
|---|---|
| Agent-ready site redesign moves strict success **49.3% → 89.3%**; PARTIAL 43→3; steps 9.31→6.49; 300 runs | `arxiv.org/abs/2607.12056` — *Designing Agent-Ready Websites* |
| Same catalog published 4 ways → F1 0.67 (HTML) → 0.75–0.77 (RAG/MCP/NLWeb), best 0.87; tokens 241k→47–140k | `arxiv.org/abs/2511.23281` (WWW '26) |
| Enhanced entity pages: **+29.6% RAG / +29.8% agentic retrieval**; JSON-LD alone modest | `arxiv.org/abs/2603.10700` |
| **10 of 18 LLMs skip the payment-confirmation checkpoint during checkout while still scoring perfect task success** (90,000 instances) | `arxiv.org/abs/2605.06457` — *Beyond Task Success: Agentic Workflow Fidelity* (PAKDD 2026) |
| Order sensitivity: 13–75% swings in LLM selection; explicit "ignore position" instructions ineffective; reordering is an **exploitable attack surface** | `arxiv.org/abs/2308.11483` · `2505.04948` · `2607.24869` |
| GEO attacks increase promotion of **flawed** products by up to **83.2%**; a single injected fake-product page flips recommendations | `arxiv.org/abs/2606.28356` (SafeGEO) · `2606.13610` (FORGE) |
| Indirect prompt injection via accessibility tree; protocol-level attacks on agentic commerce platforms; **48 threats** found in AP2 | `arxiv.org/abs/2507.14799` · `2607.21824` · `2608.23858` |
| Google observed a **32% relative increase** in malicious indirect-prompt-injection content Nov 2025 → Feb 2026 | Cloud Security Alliance research note, 2026-05-20 |
| Merchant pages are attacker-influenceable content the agent reads to decide | Palo Alto Unit 42, 2026-03-03 |

`INFERENCE — the two rows to build on.` *Designing Agent-Ready Websites* (49.3% → 89.3%) is the strongest possible citation that **merchant-side changes dominate model-side capability**, which is the load-bearing premise of the whole sell-side thesis. And *Beyond Task Success* — **10 of 18 models skip the payment-confirmation checkpoint while still scoring perfect task success** — is a direct, peer-reviewed justification for merchant-side enforcement of the human-approval invariant. That is exactly what UCP's `requires_escalation` status is for, exactly what concept C1 would enforce and log, and exactly the kind of "the benchmark said it passed; it did not actually confirm the payment" finding that Razorpay's *"would you trust it"* rubric clause rewards.

#### 6.3.7 India — and the one competitor that changes the picture

| Item | Detail |
|---|---|
| **Pine Labs P3P** (2026-06-12) | `medianama.com/2026/06/223-pine-labs-agentic-payments-protocol-upi-liability-privacy-questions/` — a **UPI-based agentic payments protocol**: UPI SBMD/OTM + open-sourced **Grantex** agent identity + HTTP 402. Liability undefined; **RBI's ₹15,000 AFA threshold unaddressed.** |
| **Razorpay scale** | `inc42.com/features/can-razorpay-turn-chatgpt-into-indias-next-commerce-channel/` (2026-08-14): ~**50 brands** live on ChatGPT commerce, ~**200 on Agent Studio beta**; merchant integration went from **8–10 weeks of engineering to ~30 minutes for a Shopify merchant**. The piece contains the line *"we don't even know what is the right way to charge for it"* about merchant onboarding — `EVIDENCE NOT FOUND` on who said it (Mathur is quoted separately for *"payment data doesn't touch the LLMs at any point of time"*). |
| **NPCI UAP** | Reported by Business Standard 2026-07-08, relayed MediaNama 2026-07-10. **No NPCI circular or spec.** Do not call it live. |
| **ONDC** | `ONDC-Official/ondc-mcp` — created 2025-10-28, **last push 2025-11-19**, 1★, empty README, no license; contained an *"ONDC MCP SSE Streaming – Complete Shopping Journey"* Postman collection. ONDC's active AI work is inward-facing spec-testing/RAG. `gh search issues "agentic" --owner ONDC-Official` → **zero**. No ONDC statement on AI shopping agents exists. |
| **Beckn** | `beckn/schemas` is JSON-LD/RDF native (~85 core types incl. Catalog, Item, Provider); `beckn/catalog-core` (created 2026-08-19) does signed, versioned, crawlable catalogs. `gh search code "schema.org" --owner beckn` hits only energy/mobility — **no published Beckn ↔ schema.org/ACP crosswalk.** |
| **Indian agentic-commerce funding** | `EVIDENCE NOT FOUND` across four query paths. Sole lead: `HYPOTHESIS` **Kily**, ₹30 Cr from Sorin Investments + **Razorpay** + Wyser, ~2026-08-05, product unverified. |

> **Pine Labs P3P is the single most important competitive fact for §7 and §8, and it cuts both ways.** It refutes any claim that "nobody is building agentic UPI" — Razorpay's most direct Indian competitor published a UPI agentic-payments protocol in June 2026. But it *strengthens* the strategic argument: P3P is a **proprietary Pine Labs protocol**, not a UCP payment handler. So the specific gap identified in §7.1 — *UPI is not a payment handler in the protocol that is actually live on Indian storefronts* — survives intact, and now has a competitive clock attached to it.

#### 6.3.8 Confidence caveats on this section

The landscape subagent reported that its session tooling was degraded: **WebSearch budget exhausted at 200/200**, `firecrawl_search` returning semantically unrelated results on control queries, `firecrawl_agent` erroring. All **negative results** in §6.3 are therefore weaker evidence of absence than normal. Two specific rows it self-flagged:

- The **Walmart 3× worse conversion** and **OpenAI Instant Checkout scale-back** figures are single-sourced to one Economic Times article (`economictimes.indiatimes.com/tech/artificial-intelligence/high-tech-but-low-trust-agentic-tech-meets-old-school-scepticism-at-ai-checkout/articleshow/133309919.cms`, ~2026-08-18) relaying *The Information*. Primary sources unreachable. **Reported-secondary, not established.**
- Its earlier claim that no non-Google/Shopify UCP payment handler exists in the wild was based on probing **two** merchants. It correctly downgraded that to `HYPOTHESIS`. My own probe of 11 Indian merchants (§3.1, 6/6 card-only) is a larger but still small sample, and is scoped to India — **it does not establish a global claim.**

## 7. The Razorpay Payment Hook

The test any concept must pass: **would a Razorpay payments engineer see their own P&L in this?**

### 7.1 The disintermediation argument — the strongest one, and it is now evidenced

`FACT`: six of eleven Indian D2C brands I probed advertise UCP agentic checkout with payment handlers `com.google.pay` and `dev.shopify.card`, and **zero** advertise UPI. Zouk's Google Pay handler config carries `"tokenization_specification": {"type":"PAYMENT_GATEWAY","parameters":{"gateway":"shopify",…}}`.

**And Google's agentic checkout does not serve India at all (§4.6).** `native_commerce(checkout_eligibility)` is limited to **United States, Canada, Australia**, with the UK next, and pays via **FPANs in Google Wallet**.

`INFERENCE, high confidence:` every rupee of GMV that an AI buyer transacts through a UCP-enabled Indian Shopify store today settles on **card rails through a foreign platform's payment handler**. Not UPI. Not Razorpay. And on Google's own surfaces, an Indian merchant cannot be agentically bought from at all. As agent-originated commerce grows, this is a direct, mechanical migration of TPV off Razorpay's rails — and it happens *by default*, without any merchant decision, because Shopify turned it on for them.

Razorpay's entire India thesis — 100+ payment methods, UPI-first, ₹-native, Reserve Pay, Circle — is currently **unaddressable by an AI buyer.** Razorpay solved "an agent can pay by UPI *inside our own pilot surfaces*" (ChatGPT, Claude, Vi's app). It has not solved "an agent can pay by UPI *at an arbitrary merchant, through an open protocol, without Razorpay having brokered the pilot*."

That is the sell-side gap, correctly stated. It is not a catalog gap. **It is a payment-handler gap.**

### 7.2 Where payment actually enters, concretely

Four distinct entry points, all exercisable in Razorpay test mode:

1. **Authorisation scope.** An AP2/UCP mandate says *what may be bought, from whom, up to what ceiling, until when*. Razorpay's analogue already exists in production: **UPI Reserve Pay** ("a one-time, consent-based authorization by setting spending limits for a merchant" — Razorpay blog, 2026-02-20). A UCP payment handler is the object that carries that scope across an open protocol.
2. **Price integrity at capture.** The agent was quoted P at `create_checkout`; the merchant charges P′ at capture. Razorpay is the only party that observes both — it holds the Order and the Payment. A quote-hash carried in `Order.notes` and re-verified on `payment.captured` turns "the agent was told the wrong price" from an unfalsifiable dispute into a deterministic, logged check.
3. **Remediation.** When an agent buys wrong, the remedy is a **refund**, and refunds are a Razorpay primitive (including Instant Refunds — *"From 7200 minutes to 2 minutes"*). The dispute path for agent purchases runs through the PSP or it does not exist.
4. **Merchant verification.** See §7.3.

**Corroborating observation, `FACT`, 2026-08-26:** I fetched `https://razorpay.com/agentic-payments/` and counted term occurrences in the rendered source. `Reserve Pay` × 8, `UPI Circle` × 4, `agentic` × 24 — and **`ACP` × 0, `AP2` × 0, `x402` × 0, `UAP` × 0, `UCP`/"Universal Commerce" × 0.** Razorpay's own agentic-payments product page engages with **no** open agentic-commerce protocol. Its entire agentic story is UPI rails inside surfaces it brokered. This is precisely the shape of the gap in §7.1.

### 7.3 Razorpay as the trust anchor — the moat argument

`INFERENCE, high confidence:` an AI buyer needs to know three things about a merchant that no catalog can tell it — *is this business real, does it honour the price it quotes, and does it actually refund?* Razorpay is one of the very few entities in India that can answer all three from first-party data it already holds:

- **Real** — Razorpay KYCs its merchants (its own pages claim 5,000,000+ / 1,500,000+ businesses; the two figures are unreconciled on Razorpay's own site).
- **Honest price** — Razorpay sees the captured amount against the created Order.
- **Actually refunds** — Razorpay sees refund rate and refund latency per merchant.

A feed company (Feedonomics, Productsup), an SEO/GEO tool, or a readiness auditor **cannot** produce any of those three signals. This is the answer to §3.5: the defensible sell-side asset is not the catalog, it is the **attestation** — and attestation is a payments asset.

**And the evidence is now much stronger than a hypothesis. `FACT`:**

Razorpay ships **Razorpay Trusted Business (RTB)** (`razorpay.com/docs/payments/payment-gateway/features/trusted-business/`). Eligibility, verbatim: *"You should have completed your **KYC verification**. You should have a very **low number of disputes**. You should have spent a reasonable amount of **time accepting payments** via Razorpay. You must clear all Razorpay **risk checks**."* Computed by *"Razorpay's **proprietary algorithm**"*, granted *"automatically… if you are eligible"*.

**And then rendered as a picture.** The RTB Widget doc: *"It **renders only on domains you have whitelisted**"*, supported on *"Web and shopify"* only. The FAQ's answer to how one validates a trusted business, verbatim: ***"You can validate that a business is a Razorpay Trusted Business by **clicking on the RTB icon**."*** Buyer Protection is likewise *"an **on-demand feature**"* behind a Typeform, with human-initiated claims and **no API**.

`FACT — the asymmetry.` Razorpay *does* ship identity verification — `Reverse Penny Drop` (*"Validate a bank account or VPA (UPI id)"*), GST Credit Checker, Bank Account Verification — but all of it sits on the **RazorpayX payouts side, pointed at the merchant's own vendors**. And Route Linked Accounts already carry a structured merchant identity schema: `POST /v2/accounts` with `legal_business_name`, `business_type`, `customer_facing_business_name`, `profile.category`, `legal_info.pan`, `legal_info.gst`.

`INFERENCE — the constructive hook.` Razorpay already has (a) the merchant identity schema, (b) the KYB data, (c) the trust verdict, and (d) the verification machinery. **All four are write-only, inward-facing, and human-rendered.** The missing piece is not data. It is a **verifiable, agent-queryable assertion.**

`EVIDENCE NOT FOUND`: any Razorpay API that lets a third party verify a merchant's status.

### 7.3a Nobody in the world ships merchant→agent verification — `FACT`

This was checked exhaustively and the negative result is clean:

| Primitive | Direction | What it actually proves |
|---|---|---|
| AP2 merchant-signed Checkout JWT | merchant→agent ✅ | Offer **integrity**, not merchant **legitimacy** |
| ACP `Merchant-Signature` HMAC | merchant→platform ⚠️ | Webhook authenticity via pre-shared secret; not publicly verifiable |
| AP2 `checkout.allowed_merchants` | user→agent ⚠️ | A user-signed allowlist — punts the decision back to the human |
| Forter TACP merchant JWKS | merchant publishes ⚠️ | Encryption keys only |
| ACP `/.well-known/acp.json` | merchant→agent ❌ | Capability discovery, **deliberately identity-free** |
| ACP `Seller{name, links}` | merchant→agent ❌ | Self-asserted display name, zero verification |

**ACP rules merchant identity out of scope, on purpose.** `rfcs/rfc.discovery.md`, verbatim:

> *"**Merchant enumeration**: … the discovery document **MUST NOT** accept or return `merchant_id` or any merchant-specific identifiers. Because the document is unauthenticated, exposing merchant identity would allow anyone to enumerate which sellers exist on a Seller Platform, creating a fingerprinting and enumeration risk."*

**Visa's Trusted Agent Protocol verifies only agents.** `github.com/visa/trusted-agent-protocol`, README verbatim: *"For an agent to make a purchase, **merchants must answer**: Is this a legitimate, trusted, and recognized AI agent?"* Components include an **`agent-registry`** (*"Public key registry service for **agent** verification"*). There is **no merchant registry, no merchant signature, no merchant attestation** anywhere in the repo. Last code commit **2025-10-28**; no formal spec document. Mastercard Agent Pay (*"trusted AI agents to be **registered and verified**"*) and Visa Intelligent Commerce (*"**Agents are onboarded** onto the Visa Intelligent Commerce platform"*) are likewise agent-direction only.

`INFERENCE — why the gap is structurally real, and this is the sharpest argument in the document:` the entire ecosystem assumed the **merchant** is the party at risk (bots, fraud, chargebacks) and the **agent** is the party to be vetted. But under ACP's own published rules the merchant is the **merchant of record and eats the chargeback** — so **the buyer's agent is the party with unrecovered exposure to a fake merchant, and it is the only party in the system with no verification tool.** Razorpay is one of the few entities in India that could mint that assertion from first-party KYB data.

### 7.3b The competitive clock — Pine Labs already moved. `FACT`

`https://www.medianama.com/2026/06/223-pine-labs-agentic-payments-protocol-upi-liability-privacy-questions/`, retrieved 2026-08-26: on **2026-06-12** Pine Labs published **P3P**, a UPI-based agentic payments protocol combining **UPI SBMD/OTM**, an open-sourced agent-identity layer called **Grantex**, and **HTTP 402**. The reporting notes two unresolved gaps: **liability is undefined**, and **RBI's ₹15,000 Additional Factor of Authentication threshold is unaddressed.**

`INFERENCE, and it is the sharpest strategic point in this document:` Razorpay's closest Indian competitor has already published an agentic UPI protocol — **but as its own proprietary stack, not as a handler inside the protocol that is actually running on Indian storefronts today (§3.1).** So India now has *two* agentic-payment efforts (Razorpay's brokered pilots, Pine Labs' P3P) and *neither* is reachable by a UCP agent walking up to a merchant cold. The gap in §7.1 survives, and it now has a clock on it.

`INFERENCE:` the ₹15,000 AFA threshold is also a gift to any submission. It is a **real, citable, regulator-set bound** on autonomous spend — exactly the kind of externally-grounded limit that makes a "bounded money action" story concrete instead of arbitrary. A spend cap of "₹2,000 because our demo catalog's median is ₹1,199" is a design choice; a cap tied to a published RBI threshold is a *reason*.

### 7.3c How big is Razorpay's agentic footprint today? `FACT`

`https://inc42.com/features/can-razorpay-turn-chatgpt-into-indias-next-commerce-channel/` (2026-08-14, retrieved 2026-08-26):

- ~**50 brands** live on ChatGPT commerce; ~**200 on Agent Studio beta**.
- Merchant integration effort collapsed from **8–10 weeks of engineering to ~30 minutes for a Shopify merchant**.
- The article carries the line *"we don't even know what is the right way to charge for it"* regarding merchant onboarding. `EVIDENCE NOT FOUND` on the speaker — Harshil Mathur is quoted separately in the same piece for *"payment data doesn't touch the LLMs at any point of time."* **Do not attribute the first quote.**

`INFERENCE — two readings, both useful.` (1) 50 brands is small; the channel is early, which supports building *for* it rather than *on top of* it. (2) The 8-weeks-to-30-minutes collapse **for a Shopify merchant** is the tell: Razorpay's agentic onboarding is easy precisely where Shopify has already done the work (§3.1), and presumably still 8–10 weeks everywhere else. **The long tail of non-Shopify Indian merchants is where Razorpay's cost sits, and it is exactly the population `Shopify/ucp-proxy` was supposed to serve before it went stale in March 2026 (§6.3.4).**

### 7.3d The remedy path is missing — from Razorpay, and from the ecosystem. `FACT`

**Razorpay's own hosted MCP server cannot issue a refund.** The README's "Remote Server Support" column marks four tools ❌ unavailable on `https://mcp.razorpay.com/mcp`: **`create_refund`**, `close_qr_code`, `create_instant_settlement`, `create_registration_link`.

`INFERENCE:` an AI agent talking to Razorpay's official remote endpoint **can take money but cannot give it back.** That is a defensible safety decision *and* a gaping hole in the agentic story, and it is quotable in one line.

`FACT — the repo is also stalled.` `main` last commit **2026-03-26**; **10 commits in all of 2026**; **30 open PRs**; **0 merged since 2026-04-01**. Gating is coarse: `main.go` exposes only `--read-only` (bool) and `--toolsets` (list) — **no per-amount cap, no per-merchant scope, no approval workflow, no spend budget.** That is precisely the "bounded and gated" hole Track 01 asks a builder to fill.

**And the ecosystem has not filled it either.** ACP's published liability answer is *"nothing changes"* — `developers.openai.com/commerce/guides/production`, verbatim: *"**Who manages chargebacks and refunds?** — **The merchant does.** Your platform is responsible for handling refunds and chargebacks, as you accepted the payment directly from the customer as the merchant of record."* AP2 states its aim is to *"**provide supporting evidence** that helps payment networks establish accountability and liability principles"* while placing dispute resolution *"outside the scope of this specification"* — and **AP2 v0.2 has no refund concept at all** (grep for `refund` across docs/schemas returns zero).

`EVIDENCE NOT FOUND` — across Visa TAP, developer.visa.com, three Mastercard press releases, AP2 v0.2 and ACP 2026-04-17 with all 14 RFCs: **no new chargeback reason code, no new authorisation-message field, and no named "agent-initiated" transaction indicator.** `HYPOTHESIS`: one likely exists inside private scheme rulebooks (Visa Core Rules / Mastercard TPR), which are not publicly indexable. Razorpay's `dispute` entity has a generic `reason_code` and no agent-specific value.

**Visa's own community has named this gap and Visa has not answered it.** Open, unanswered issues on `visa/trusted-agent-protocol`:
- **#22 (2026-07-17)** — *"TAP solves a real, narrow problem well… That's identity and intent. **It doesn't reach the question that comes right after** — once an authorized agent is in the loop asserting things (a price, an inventory count, a service outcome), **was any of it true**, and is anything backing that claim if it wasn't."* — **0 comments.**
- **#16 (2026-04-10)** — *"the agent proved its identity at request time, but **there is no tamper-evident receipt of the transaction itself**. In a chargeback dispute or compliance audit, the merchant has logs, but **logs are mutable**. The agent has nothing."* — 21 comments, **none from Visa-affiliated accounts.**
- **#8 (2025-12-26)** — *"What exactly is the object being authorized for payment…? This… directly affects determinism, auditability, and **liability attribution**."*

`INFERENCE:` the correctness/receipt/dispute layer for agentic commerce is genuinely unbuilt, publicly acknowledged as unbuilt by contributors to a Visa repo, and unaddressed by the protocol owner.

### 7.4 The honest counter-argument to §7.1

`HYPOTHESIS, and it must be stated:` Razorpay may already know all of this and may already be negotiating to become a UCP payment handler. A student cannot verify that. Also, RBI's Additional Factor of Authentication rules and NPCI's control of UPI mean a UPI UCP handler is **not** something a third party can unilaterally ship into production — it needs NPCI/RBI. A submission must therefore be framed as a **reference implementation and conformance harness against a sandbox**, never as "I shipped UPI for UCP". Overclaiming here would be fatal with this specific judging panel.

### 7.5 Regulatory bounds a demo must respect

- `FACT (secondary)` RBI's **₹15,000 Additional Factor of Authentication threshold** is the named, unresolved constraint in Indian agentic-payments reporting (MediaNama on Pine Labs P3P, 2026-06-12).
- `FACT` **NPCI's UAP is not live** — reported by Business Standard 2026-07-08, relayed MediaNama 2026-07-10, with no NPCI circular or specification published. Any submission claiming UAP implementation is claiming something that does not exist.
- `FACT` UCP's own normative position, from a live Shopify merchant's `llms.txt`: *"Agents must not complete payment without explicit buyer consent."* Encoded in the `requires_escalation` checkout status.
`FACT — the eight constraints that actually bound a demo`, all from Razorpay's own docs (secondary for the RBI/NPCI rules, but authoritative for what binds the API):

1. **AFA thresholds.** *"Additional Factor of Authentication (AFA) is required by the RBI for subsequent debits above certain thresholds."* General-category merchants: max mandate **₹99,999**, **AFA-free only up to ₹15,000 per debit** — *"any subsequent debit above ₹15,000 requires the customer to approve the transaction via UPI PIN."* Financial services / insurance (MCC 6211, 6300, 7322, 6529, 5960): ₹2,00,000 mandate, ₹1,00,000 AFA-free. **Design the demo cart under ₹15,000.**
2. **UPI Reserve Pay caps:** `max_amount` — *"The maximum amount that can be debited is **₹10,000**"*; `expire_at` — *"The default and the maximum value allowed is **90 days**."*
3. **UPI Collect is deprecated.** *"According to NPCI guidelines, the UPI Collect flow is being deprecated effective **28 February 2026**."* Use **UPI Intent** or QR.
4. **Reserve Pay needs a support ticket** to activate and lists only **BHIM, INDMoney, Navi, Paytm** — no GPay, no PhonePe.
5. **Route go-live is RBI-gated** (Sept 2025 PA guidelines: >₹40L domestic turnover) — **but fully usable on test keys**, including penny testing, and *"You can use a linked account created in the Test mode on the Live mode and vice versa."*
6. **Smart Collect** requires a Current/Escrow account — out of reach.
7. **S2S card flows require PCI-DSS certification.**
8. **Test-mode gotchas that will cost hours:** `success@razorpay` / `failure@razorpay` VPAs; *"In test mode, payment cancellation will result in a successful payment"*; mock bank page with Success/Failure buttons; OTP of **4–10 digits = success, below 4 = fail**; webhook domains **`ngrok.io`, `webhook.site`, `requestbin.com`, `beeceptor.com`, `localhost` are blacklisted** (docs recommend **`zrok`**), ports 80/443 only, test-mode webhook setup OTP **`754081`**.

`INFERENCE:` the compliance story for an agentic demo writes itself — **bounded consent under an AFA-exempt ceiling, with human-in-the-loop escalation above it.** That maps almost exactly onto the Track 01 bar, and onto UCP's `requires_escalation` checkout status (§4.1c). A ₹15,000 cap grounded in an RBI threshold is a *reason*; a ₹2,000 cap grounded in a demo catalog's median price is a *choice*.

`EVIDENCE NOT FOUND / NOT VERIFIED` — the **RBI FREE-AI committee report** was not retrieved from a primary `rbi.org.in` source; a direct check of the RBI press-release index returned no AI items. **Re-verify before citing it anywhere.** Likewise no RBI circular specifically on agent-initiated payments was found.

`OPEN RISK, architecture-gating` — **whether UPI Reserve Pay functions on test keys is not stated either way in the docs**, and it requires a support ticket to activate. Verify empirically on day 1. Fallback if it does not: **UPI AutoPay**, which *is* confirmed *"available by default on your Razorpay account"* and has a dedicated "Test Subscriptions" docs page.

---

## 8. Buildable-in-8-Days Concepts

Constraints: one student, ~8 days, Razorpay **test mode** only, synthetic or public catalogs, must produce **a batch metric over 50+ cases**, **an audit trail**, **bounded/gated money actions**, and **one gracefully-handled failure**.

> **Ranking revised after the protocol and Razorpay dossiers landed.** C3 (merchant attestation) moves from "best used as a component" to **co-equal first choice**, because the evidence for it turned out to be far stronger than expected: **merchant→agent verification does not exist anywhere in the world**, ACP *deliberately* excludes it (`MUST NOT` return `merchant_id`), Visa's TAP has an agent registry and no merchant registry, and Razorpay computes a merchant trust verdict today and renders it as **a picture you click** (§7.3, §7.3a). Current order: **C1 ≈ C3 > C2 > C5 > C4.**

**The three money primitives available, with verbatim field names.** Anchor every claim to one of these and the project reads as payments infrastructure rather than SEO:

| Primitive | Verbatim fields | Why it matters |
|---|---|---|
| **Bounded consent** — UPI Reserve Pay | `POST /orders` with `token: {max_amount, expire_at, frequency: "as_presented", type: "single_block_multiple_debit"}`; audit via `recurring_details.amount_blocked` − `recurring_details.amount_debited`; webhooks `token.confirmed`, `token.cancellation_initiated` | Funds are **blocked, not captured** — a real India-native escrow-like primitive with no card equivalent, and **structurally identical to ACP's `Allowance`** (§4.4d) |
| **Held settlement** — Route | `PATCH /v1/transfers/:id {"on_hold": true, "on_hold_until": <ts>}`; linked accounts carry `legal_business_name`, `legal_info.pan`, `legal_info.gst` | Test-mode usable; the best substrate for a merchant registry + held-settlement demo |
| **Reversal** — Refunds | `POST /v1/payments/:id/refund {"speed":"optimum"}`; Reserve Pay **Cancel Token** (*"all remaining funds under the token are unblocked and credited to the customer's bank account instantly"*) | The remedy path Razorpay's own remote MCP **cannot** perform (§7.3d) |


---

### C1 — `in.razorpay.upi`: a UCP payment handler for UPI, plus a conformance harness *(recommended)*

**One line.** India's agentic checkout is card-only. Write the missing UPI payment handler against the UCP Payment Handler Specification Guide, implement it end-to-end on Razorpay test mode, and measure — across 50+ real Indian merchants — how much of India's agentic commerce surface UPI currently cannot reach.

**What you build.**
1. **The measurement** (deterministic, no LLM): a crawler over 50–100 real Indian D2C domains that probes `/.well-known/ucp`, `/llms.txt`, `/api/ucp/mcp` (`tools/list`), and `/products.json`, and reports per-merchant UCP presence, capability set, **payment-handler coverage**, and catalog-field completeness (GTIN, inventory, shipping, returns). This is the batch metric and it is already partly executed — see §2.4 and §3.1.
2. **The handler spec**: `in.razorpay.upi`, written to the normative structure in `docs/specification/payment/guide.md` (Participants · Prerequisites · Handler Declaration · Instrument Acquisition · Processing), mapping UPI Reserve Pay-style delegated authorisation onto the UCP instrument model, with `amount` in paise + `"INR"`.
3. **The reference implementation**: a small non-Shopify merchant (Flask/FastAPI + SQLite catalog) that serves a real `/.well-known/ucp` profile advertising `dev.ucp.shopping.checkout`, `.cart`, `.catalog.search/lookup` **and** `payment_handlers: {"in.razorpay.upi": …}`, plus a JSON-RPC MCP endpoint implementing `search_catalog`/`create_cart`/`create_checkout`/`complete_checkout` — where `complete_checkout` creates a **Razorpay test-mode Order/UPI Payment Link**, verifies the HMAC webhook, and only then returns an order.
4. **A conformance suite**: assert your own profile validates against the UCP JSON Schemas shipped in the spec repo (`source/schemas/...`), and report a pass/fail table.
5. **A buyer agent** that discovers your merchant from `/.well-known/ucp` alone and buys — never hard-coded.

**Batch metric reported.** *UPI-reachability of India's agentic commerce surface*: over N≥50 merchants — % exposing UCP, % of those whose advertised handlers include any UPI/INR-native method (predicted 0%), median catalog-field completeness, and the ₹-weighted share of sampled GMV proxy that an AI buyer cannot pay for by UPI. Plus a conformance pass-rate over the ~8 UCP capability schemas.

**Bounded / gated money action.** Per-mandate ceiling in paise; merchant-side re-derivation of the cart hash; `create_checkout` price must equal the price at `complete_checkout` or the call is refused; test-mode-only assertion; idempotency on quote id; human-approval invariant enforced (the spec *requires* it — enforce it and log the refusal).

**Graceful failure to demonstrate.** Pick the price-drift case: the agent is quoted ₹1,799, the catalog updates to ₹2,199 between `create_checkout` and `complete_checkout`. The handler refuses, emits `E_PRICE_DRIFT` with both amounts and the quote hash, re-quotes, and requires fresh authorisation. Second failure to keep in reserve: webhook never arrives → poll fallback → reconcile.

**Why it wins.** It is the only concept where the problem statement is a *payment* problem, where the evidence is first-hand and reproducible in four `curl` commands, and where — after checking ~25 buildathon repos, 8 pre-existing OSS auditors, 3 platform scanners, ~20 vendors and 14 benchmarks — **no one is doing the specific thing**: proposing UPI as a handler inside a live open commerce protocol, and measuring how much of India's agentic surface it cannot reach. It engages the exact protocol layer Razorpay named on its own page, but with 2026's actual answer rather than 2025's. And the pitch lands in one sentence a payments exec understands: *"Six of the eleven Indian brands I checked can already be bought from by an AI agent. None of them can be paid by UPI — and Google's agentic checkout does not serve India at all."*

**Two facts that make the handler design almost write itself.** (1) ACP's `Allowance` — required `reason`, `max_amount` (minor units), `currency`, `checkout_session_id`, `merchant_id`, `expires_at` — is **structurally identical to UPI Reserve Pay's token** (`max_amount`, `expire_at`, merchant-bound). The mapping is nearly one-to-one, and saying so is the whole intellectual contribution. (2) UCP's `payment_instrument` requires exactly `id`, **`handler_id`**, `type` — so declaring `handler_id: "in.razorpay.upi"` is a small, well-defined object, not a speculative redesign.

**One design detail worth knowing before you build:** UCP discovery is **mutual**. Calling a live merchant's `search_catalog` with an unreachable agent profile returns `{"error":{"code":-32001,"message":"UCP discovery failed","data":{"code":"profile_unreachable"}}}` — **your buyer agent must itself publish a reachable `/.well-known/ucp` profile.** That is a free, spec-mandated agent-identity story (failure mode F7) you get by conforming rather than by inventing.

**Prior art to read first, not around.** `forter/agentic-readiness-guide` (106★) already ships `m4-9-commerce-protocols`, which greps `/.well-known/ucp` — use it, cite it, and be explicit that your contribution starts where it stops. `Universal-Commerce-Protocol/conformance` (24★) is the official conformance suite but is a **self-test** run by the merchant against its own server; yours is **outside-in**, over a corpus. **`Shopify/ucp-proxy`** (54★, last push **2026-03-19**) is the abandoned bridge that would have put a UCP face on WooCommerce/Wix/custom stores — say so, because it is direct evidence that the non-Shopify long tail is unserved.

**Risks, stated honestly.**
- **(a) Overclaiming.** Must be framed as a reference handler + conformance harness, not a shipped rail (§7.4). NPCI UAP is not live; RBI's ₹15,000 AFA threshold is unresolved (§7.5).
- **(b) The market may not be there yet.** Indian operator consensus, quoted in the Economic Times (~2026-08-18) via Flash AI's Ranjith Boyanapalli: AI-referred traffic converts ≥3× organic, but *"checkout is still a few years away… it is a matter of whether the ecosystem, regulators are ready."* Same article reports OpenAI scaling back Instant Checkout ~6 months post-launch and Walmart measuring ~3× worse conversion via ChatGPT — both **reported-secondary via *The Information*, primaries unreachable** (§6.3.8). **This is the strongest argument against C1 and must be named in the pitch, not buried.** The rebuttal: the *rails* have already landed on Indian storefronts without UPI on them (§3.1), a reference implementation plus a measurement is precisely the right artefact for a market at this stage, and Pine Labs shipping P3P in June 2026 (§7.3b) shows Indian PSPs do not believe it is a few years away either.
- **(c) A real competitor exists on the measurement half.** **AgentChecker.ai** already drives a real browser through a live site's checkout, 185 audits across 94 sites (§6.3.2). Check it before claiming novelty. Your differentiation is protocol-level and payment-level, not browser-level — say that explicitly.
- **(d) Crawl honesty.** Report *both* numerators (I got 12/15 feeds and 6/11 UCP profiles) and treat 403/301 as a reported coverage limit, not a silent drop.
- **(e) Do not skip the merchant-side implementation.** The measurement alone is a blog post. The handler + working `complete_checkout` on Razorpay test mode is the project.

---

### C2 — Quote-to-capture price integrity, measured across a batch

**One line.** An agent is quoted a price; the merchant charges another. Bind the quote to the Razorpay Order cryptographically, verify at capture, and report divergence rate and ₹ exposure over 50+ purchase attempts.

**What you build.** A merchant-side quote engine (integer paise, GST in basis points, TTL) that hashes the cart and stashes the hash in `Order.notes`; a webhook verifier that recomputes and compares at `payment.captured`; an injected-fault generator producing 50+ scenarios (price drift, variant substitution, quantity change, currency/minor-unit error, tax recompute, stale feed).

**Batch metric.** Over N=50+ injected cases: detection rate, false-positive rate on clean cases, ₹ exposure prevented, mean detection latency, and an honest exception list of cases the check cannot catch (e.g. a merchant that changes the *item* but not the *price*).

**Bounded/gated + failure.** Capture is refused on mismatch; refund is auto-issued (Razorpay test-mode refund) where capture already happened; every decision hash-chained.

**External backing is unusually strong.** Open issues on Visa's own TAP repo name this exact gap and Visa has not replied: **#22** — *"once an authorized agent is in the loop asserting things (a price, an inventory count, a service outcome), **was any of it true**"* (0 comments); **#16** — *"there is no tamper-evident receipt of the transaction itself… the merchant has logs, but **logs are mutable**. The agent has nothing."* And ACP's normative rule *"Agents MUST treat checkout responses as authoritative even when they differ from feed data"* concedes that feed↔checkout divergence is expected — it just declines to measure it.

**Assessment.** Strong payments idea, very clean metric, deterministic (no LLM on the money path — direct hit on rubric pillar 3). **But** `GraceyDugar/agent-payment-guardrails` and `sting-raider/project-dante` occupy the neighbourhood, and `aryanpajnee` has the cart-hash/mandate mechanic. Differentiator would have to be the *batch* and the *false-positive cost*, which none of them report.

---

### C3 — Merchant attestation for AI buyers: "is this seller real, and does it honour its promises?"

**One line.** A signed, machine-readable merchant attestation issued from payments data — verified business, price-honoured rate, refund latency — that an AI buyer fetches before committing money.

**What you build.** A `/.well-known/merchant-attestation` document (JWS-signed) carrying verification status, a price-integrity score and a refund-behaviour score, each derived from a synthetic Razorpay test-mode transaction history; a buyer agent that refuses to buy from unattested or low-score merchants; a 50+ merchant synthetic population with planted bad actors.

**Batch metric.** Over 50+ merchants with a known ground-truth good/bad label: precision and recall of the buyer's refuse-to-buy decision, **with the false-positive cost stated in ₹ of blocked legitimate GMV**. That last number is exactly the honesty the rubric asks for.

**Bounded/gated + failure.** Attestation expiry; agent must re-fetch; demonstrate a revoked attestation mid-flow and the graceful abort.

**Supporting citation worth having:** `arxiv.org/abs/2605.06457` (*Beyond Task Success: Agentic Workflow Fidelity*, PAKDD 2026) finds **10 of 18 LLMs skip the payment-confirmation checkpoint while still scoring perfect task success** across 90,000 instances. That is a peer-reviewed statement that agent self-report cannot be trusted about money — which is the entire argument for a merchant-side gate.

**Assessment — upgraded to co-equal first choice.** My earlier read (*"merchant trust is the most crowded space"*) was **wrong, and the correction is the single biggest change in this document.** The crowded space is **agent→merchant** verification: Visa TAP, Forter TACP, Mastercard Agent Pay, SAM Protocol, `djt53/attest` and every buildathon trust-gateway entry all answer *"is this agent legitimate?"* The **reverse direction is empty** (§7.3a):

- ACP **deliberately forbids it** — *"the discovery document **MUST NOT** accept or return `merchant_id` or any merchant-specific identifiers"*, on fingerprinting grounds.
- Visa TAP ships an **`agent-registry`** and **no merchant registry, no merchant signature, no merchant attestation** anywhere in the repo.
- AP2's merchant-signed Checkout JWT proves **offer integrity, not merchant legitimacy**; `allowed_merchants` is a user-signed allowlist that punts the decision back to the human.
- Razorpay has the KYC status, the dispute rate, the risk verdict and a structured identity schema — and exposes the conclusion as an icon: *"You can validate that a business is a Razorpay Trusted Business by **clicking on the RTB icon**."*

And the structural argument is clean: under ACP's own rules the merchant is the merchant of record and eats the chargeback, so **the buyer's agent is the party with unrecovered exposure to a fake merchant, and it is the only party in the system with no verification tool.**

**Remaining honest weakness:** the merchant population must be synthetic (Razorpay will not hand you real KYB data), so the precision/recall numbers measure your detector against your own labels. Say that plainly, and consider grounding a subset in the real Route linked-account schema (`legal_business_name`, `legal_info.pan`, `legal_info.gst`) so the object shape is not invented.

---

### C4 — Agent-buy fidelity: does the agent buy the *right variant*?

**One line.** Not "can the agent find you" but "does it buy the thing the customer actually asked for" — measured as exact-variant match rate over 50+ constrained purchase tasks against real Indian catalogs.

**What you build.** Ingest real multi-variant Indian catalogs (sleepycat.in exposes 486 variants across 25 products); generate 50+ tasks with hard constraints ("queen, 6-inch, medium-firm, under ₹25,000"); run agents; score exact-variant match / wrong-variant / no-purchase; gate any actual money action behind a deterministic constraint re-check before a Razorpay test-mode order.

**Batch metric.** Exact-variant match rate with Wilson CIs; wrong-variant rate; ₹ mis-spend per 100 purchases; per-catalog-attribute attribution of failures.

**Supporting citation:** `arxiv.org/abs/2607.12056` (*Designing Agent-Ready Websites*) reports agent strict-success moving **49.3% → 89.3%** from merchant-side redesign over 300 runs — a larger swing than the gap between frontier models. This is the strongest available evidence that the merchant, not the model, is the lever.

**Assessment.** Genuinely unoccupied as a *variant-fidelity* metric (§5 F3), though **AgentChecker.ai** occupies the adjacent "can an agent complete a purchase" niche (§6.3.2), and and the "wrong variant costs the merchant a return" line connects to Razorpay's real RTO economics. **But** it is an LLM-trial harness, which means competing on Agent-Audit's turf and statistics — and losing. Also weakly payments-y unless the ₹ mis-spend framing carries it.

---

### C5 — Poisoned shelf: prompt injection from the merchant's catalog into the buying agent, benchmarked

**One line.** The merchant's own product copy is untrusted input to somebody else's buying agent. Build a 60-case injection corpus, measure attack-success rate before and after a defence, and report the false-positive rate on clean listings.

**What you build.** 60 listings: 30 clean, 30 carrying injections across a taxonomy (price override, "apply this coupon", "skip confirmation", competitor disparagement, exfiltrate context, escalate quantity); a buyer agent with a bounded money action; a two-layer defence (deterministic delimiter/pattern sanitiser + a classifier), with the money action *structurally* unable to read catalog text.

**Batch metric.** Attack-success rate before/after; **false-positive rate on the 30 clean listings** (the honest, expensive number); ₹ at risk per successful injection; per-category breakdown.

**Academic backing is unusually strong here:** GEO attacks increase promotion of *flawed* products by up to **83.2%** (`arxiv.org/abs/2606.28356`, SafeGEO); a single injected fake-product page flips recommendations (`arxiv.org/abs/2606.13610`, FORGE); reordering candidates is an exploitable attack surface (`arxiv.org/abs/2607.24869`); Google observed a **32% relative increase** in malicious indirect-prompt-injection content Nov 2025 → Feb 2026 (Cloud Security Alliance, 2026-05-20); Palo Alto Unit 42 documented web-based indirect injection in the wild (2026-03-03).

**Assessment.** Cheap, fully synthetic, hits *every* clause of the bar, and `Agent-Audit` explicitly lists this as **not done**. **But** `AgentCashier` already demos a prompt-injection refusal, `Nirvanjha2004/promptwall` builds an injection firewall (Track 02), and there is a real risk the judges read it as a Track-02 submission filed under Track 01. Best as **the failure-mode chapter of C1**, not the whole project.

---

### Recommended shape

**C1 as the spine, with C3's merchant attestation as the trust layer, C2's price-drift check as the money-safety core, and C5's injection corpus as the one adversarial chapter.** C1 and C3 compose naturally: a UCP business profile already has a `keys[]` JWK Set slot for exactly this, and **0 of the 3 Indian merchants I checked publish one** (§4.1d). A signed Razorpay-minted merchant attestation dropped into `/.well-known/ucp` alongside an `in.razorpay.upi` handler is one coherent artefact, not two projects. That produces: a deterministic batch metric over 50+ real merchants (no LLM, which you then *say* out loud), a protocol-conformance table against a published Apache-2.0 spec, a real Razorpay test-mode money path with mandate-bounded authorisation, a hash-chained audit trail, and a price-drift failure that is genuinely interesting to narrate in the *"what broke, and how you got out"* box that Razorpay reads first.

---

## 9. Verdict

**The hypothesis as written is dead. The instinct behind it is right, and points somewhere better.**

- **H1 (Razorpay solved the buy-side)** — stands.
- **H2 (the track text points at the sell-side)** — stands.
- **H3 (sell-side is unsolved)** — **refuted** for catalog legibility. Shopify ships UCP discovery, an MCP checkout endpoint, llms.txt and agents.md to Indian D2C merchants automatically, at spec version `2026-04-08`, today. Verified live on six Indian brands.
- **H4 (least-entered part of the least-entered track)** — **decisively refuted.** It is the most-entered corner. ≥20 buildathon repos, plus a pre-existing open-source "agent readiness auditor" genre going back to April 2026, plus Visa and Forter at the trust layer.

**What survives, and is stronger than the original hypothesis — two things, not one:**

> **(1) The payment-handler gap.** Razorpay's merchants are becoming *legible* to AI buyers without Razorpay's involvement — and becoming *payable* only by card, through a foreign platform's payment handler, in a protocol coalition containing Google, Shopify, Stripe, Amazon and Walmart and no Indian payments company at all. Google's agentic checkout does not serve India at all (`native_commerce(checkout_eligibility)`: US, Canada, Australia). The sell-side gap is not the catalog. **It is that UPI is not a payment handler.** UCP's own roadmap names India and *"localized payment interoperability"* as future work and explicitly invites payment providers in.
>
> **(2) The merchant-attestation gap.** Every trust primitive shipped by Visa, Mastercard, Forter, ACP and AP2 answers *"is this **agent** legitimate?"* **Nobody answers *"is this **merchant** legitimate?"*** — ACP forbids it by design, Visa TAP has an agent registry and no merchant registry, and Razorpay computes the answer today from KYC, dispute rate and risk checks, then renders it as an icon a human clicks. Under ACP's own rules the merchant is the merchant of record and eats the chargeback, so the **buyer's agent is the party with unrecovered exposure to a fake merchant and the only party with no verification tool.**

That is a payments idea, not an SEO idea. It is measurable in a batch with no LLM. And it is provable to a sceptical payments engineer in four `curl` commands.

**Held against itself, honestly:** it is not *unoccupied* in the sense of nobody caring — Pine Labs shipped P3P on UPI in June 2026, and AgentChecker.ai already runs real browser purchases against live sites. It is unoccupied in the specific sense that **nobody has proposed UPI as a handler inside a live open commerce protocol, and nobody measures how much of India's agentic surface UPI cannot reach.** That narrower claim is the one to defend, and it is the one the evidence supports.

**Six facts that make this verdict more than an opinion:**

0a. `native_commerce(checkout_eligibility)` — Google's agentic Buy button — is **US / Canada / Australia only**. India is on the agentic map for discovery and off it for payment.
0b. Razorpay's **own hosted MCP server cannot issue a refund** (`create_refund` ❌ on remote), and its repo has merged **0 PRs since 2026-04-01**.
0c. **MCP has no payments extension** — SEP-2009 and #3229 were both opened and closed within days. Payments belong in the commerce protocol above MCP, and the ecosystem has said so twice this year.


1. `arxiv.org/abs/2607.12056` — merchant-side redesign moves agent strict success **49.3% → 89.3%**, a bigger swing than the frontier-model gap. The sell-side thesis is academically sound.
2. `EVIDENCE NOT FOUND`, after an arXiv + GitHub sweep — **no benchmark scores merchants on a leaderboard, and none varies catalog data quality against agent purchase-completion rate.** Every mainstream shopping benchmark (WebShop, WebArena, Mind2Web, τ-bench, ShoppingBench, DeepShop, WebVoyager, AgenticShop) measures the *agent*.
3. Cloudflare, Google and Shopify have each shipped agent-readiness scoring, and **all three stop short of commerce** — Cloudflare detects UCP/ACP/x402 but does not score them, Lighthouse has zero commerce audits, and Shopify's own scanner does not test Shopify's own UCP checkout.

**Two corrections I made to my own earlier reasoning, recorded rather than quietly fixed.** (a) I wrote that "merchant trust is the most crowded space of all" — that is **wrong**; the crowded direction is agent→merchant, and the reverse is empty (§7.3a). (b) I measured schema.org JSON-LD on ten Indian storefronts as evidence of agent-legibility — but ACP, UCP and OpenAI's commerce docs contain **zero** schema.org references, and Google says *"there's also no special schema.org structured data that you need to add"* for AI surfaces. That measurement was of the **wrong surface**; it is retained in §2.4 with the correction attached, because being able to say which of your own numbers does not bear on the question is exactly the "honest metrics" the rubric rewards.

**The strongest reason not to do this, stated plainly.** Indian operators quoted in the Economic Times (~2026-08-18) say agentic *checkout* is *"a few years away… it is a matter of whether the ecosystem, regulators are ready"*, the same piece reports OpenAI scaling back Instant Checkout and Walmart measuring ~3× worse conversion via ChatGPT (both reported-secondary via *The Information*, primaries unreachable), and NPCI's UAP is not live pending RBI. A judge could reasonably say: *you built a rail for a market that has not arrived.* The answer is that the rails **have** arrived on Indian storefronts — card-only — and the measurement of that fact is the contribution regardless of when volume follows. But do not pretend the objection does not exist; the *"what broke"* box is the right place to say you considered it.

**One caution, weighted properly.** Because this is a hiring funnel with a bar rather than a ranked prize (`THE_REAL_RUBRIC.md`: *"if it has signal we call you in"*), saturation is not disqualifying — but **problem taste is graded**, and `Adarsh-Me/Agent-Audit` sets a genuinely high bar for engineering honesty in this track. Do not try to beat it at catalog statistics. Beat it by being about money.

---

## 10. Evidence Index

All retrievals **2026-08-26** unless noted.

### Primary — live endpoints (first-hand, reproducible)

| # | URL | Type | What it establishes |
|---|---|---|---|
| E1 | `https://zouk.co.in/llms.txt` | live merchant artefact (`text/markdown`) | Shopify auto-serves "Agent Instructions" naming UCP, `/.well-known/ucp`, `/api/ucp/mcp`, `shop.app/SKILL.md`, and a human-approval invariant |
| E2 | `https://zouk.co.in/.well-known/ucp` | live JSON business profile | UCP `2026-04-08`; capabilities list; `payment_handlers` = `com.google.pay` + `dev.shopify.card`; Google Pay `tokenization_specification.gateway = "shopify"` |
| E3 | `POST https://zouk.co.in/api/ucp/mcp` `{"method":"tools/list"}` | live JSON-RPC 2.0 | Real MCP tools `get_checkout` / `create_checkout` with JSON Schemas; minor-unit integer money; mandatory `meta.ucp-agent.profile` |
| E4 | Same `/.well-known/ucp` probe × 11 Indian D2C domains | live census | 6/11 expose UCP; **0/6 advertise any UPI/INR-native payment handler** |
| E5 | `/products.json` × 15 Indian D2C domains | live public feeds | 12/15 reachable; **0/1016 variants with barcode/GTIN; 0/1016 with `inventory_quantity`**; 58/300 products with <50-char description |
| E6 | Product-detail JSON-LD × 10 Indian D2C domains | live HTML | 10/10 `Product`+`Offer` with price+availability; 3/10 `gtin*`; 3/10 `OfferShippingDetails`; 3/10 `MerchantReturnPolicy` |
| E7 | `https://ucp.dev/` | spec homepage | Coalition list (Google, Shopify, Etsy, Wayfair, Target, Walmart, Amazon, Microsoft, Meta, Salesforce, Stripe, …); built on AP2 + A2A + MCP; "Merchant of Record" principle |

### Primary — cloned repositories

| # | Source | Type | What it establishes |
|---|---|---|---|
| E8 | `github.com/Universal-Commerce-Protocol/ucp` (Apache-2.0, 3,328★, created 2025-12-31, pushed 2026-08-25) | spec repo, cloned | `docs/specification/payment/guide.md` = normative Payment Handler Specification Guide; `…/extensions/ap2-mandates.md` = AP2 as first-class UCP extension with "Security Locked" semantics; `source/schemas/` = machine-checkable schemas |
| E9 | Same, `docs/documentation/roadmap.md` | spec repo | Verbatim: India + "localized payment interoperability" are **upcoming**; "We invite … payment providers to join us" |
| E10 | Same, grep `upi\|razorpay\|india\|rupee\|INR` | spec repo | **No UPI handler, no Indian payments participant anywhere in the spec** |
| E11 | `github.com/Adarsh-Me/Agent-Audit` (Apache-2.0, created 2026-08-21, pushed 2026-08-25, 2.8 MB) | competitor repo, cloned | 640-trial design; V1–V6 planted-bias CI suite; `SAFETY.md` money bounds; `PRD.md` §NG-6 disclaims AP2 conformance; `SUMMARY.md` §7 lists prompt-injection as not-yet-built and reports 234/640 parse_ok |

### Primary — GitHub API census

| # | Query | Result |
|---|---|---|
| E12 | `search/repositories q="razorpay buildathon"` | `total_count` = **261** |
| E13 | 11 vocabulary queries, `created:>=2026-08-15`, deduped | 754 repos; **102 mention Razorpay**; **≥20 explicitly sell-side** (§3.3) |
| E14 | `"agent readiness ecommerce audit"`, `"agent ready catalog"`, `"merchant trust agentic commerce"` | Pre-buildathon auditor genre (Apr–Aug 2026) + `visa/trusted-agent-protocol`, `forter/trusted-agentic-commerce-protocol`, `SAM-protocol`, `djt53/attest` (§3.4) |

### Secondary — local corpus (previously verified, re-read this session)

| # | File | Load-bearing content |
|---|---|---|
| E15 | `research/00_competition_context/current_buildathon.md` | Track 01 verbatim text; submission mechanics; one-shot no-edit constraint |
| E16 | `research/00_competition_context/THE_REAL_RUBRIC.md` | Four rubric pillars from Razorpay's own JS bundle; deadline 5 Sep; *"The last one is the one we read first"* |
| E17 | `research/02_hackathons/THE_ACTUAL_FIELD.md` | Prior census (261 repos; T01 = 16 / 6%) — **superseded on the T01 count by E13** |
| E18 | `research/01_razorpay_signals/razorpay_ai_signals.md` | Razorpay MCP server; Agentic Payments pilots; UPI Reserve Pay; UAP not live pending RBI; no evidence of ACP/AP2/x402 membership |
| E19 | `research/01_razorpay_signals/razorpay_product_signals.md` | Full product surface — **no catalog/product/inventory API anywhere**; Instant Refunds; Trusted Badge (buyer-facing only) |

### Primary — external, via research subagents (retrieved 2026-08-26)

| # | Source | What it establishes |
|---|---|---|
| E20 | `blog.cloudflare.com/agent-readiness/` (2026-04-17) | Cloudflare Agent Readiness score; UCP/ACP/x402 detected but **not scored**; 200,000 domains scanned; MCP Server Cards on **<15 sites** |
| E21 | `github.com/GoogleChrome/lighthouse/.../agentic-browsing-config.js` | Google shipped an `agentic-browsing` Lighthouse category — **zero commerce audits** |
| E22 | `shopify.com/agentic-readiness` · `/enterprise/blog/agentic-ready-product-data` | Shopify's own scanner checks product-page structured data; **does not test its own UCP checkout** |
| E23 | `agentchecker.ai` | Drives a real browser through search/sign-up/**checkout**; 20+ tasks; **185 audits / 94 sites, Jan–Apr 2026** — the closest existing competitor to outside-in buyability testing |
| E24 | `digitalcommerce360.com/2026/07/15/ai-commerce-rankings/` · `refibuy.ai/ai-commerce-rankings` | AI1000 quarterly merchant rankings — declaration-level, **does not test purchase completion** |
| E25 | `github.com/Shopify/ucp-proxy` (54★) | The UCP bridge for WooCommerce/Wix/custom — **last push 2026-03-19, stale** |
| E26 | `github.com/Universal-Commerce-Protocol/conformance` (24★, pushed 2026-08-18) | Official UCP conformance suite — a merchant **self-test**, not outside-in |
| E27 | `github.com/forter/agentic-readiness-guide` (106★, CC-BY-4.0) | 25 machine-testable guidelines incl. `m4-9-commerce-protocols` (greps `/.well-known/ucp`) — best OSS prior art |
| E28 | `medianama.com/2026/06/223-pine-labs-agentic-payments-protocol-upi-liability-privacy-questions/` | **Pine Labs P3P (2026-06-12)** — UPI SBMD/OTM + Grantex agent identity + HTTP 402; liability undefined; **RBI ₹15,000 AFA threshold unaddressed** |
| E29 | `inc42.com/features/can-razorpay-turn-chatgpt-into-indias-next-commerce-channel/` (2026-08-14) | ~50 brands on ChatGPT commerce, ~200 on Agent Studio beta; **8–10 weeks → ~30 min for a Shopify merchant** |
| E30 | `medianama.com/2026/07/223-npci-agentic-payments-upi/` (relaying Business Standard 2026-07-08) | NPCI UAP is **reported plan only** — no circular, no spec |
| E31 | `github.com/ONDC-Official/ondc-mcp` | ONDC's shopping-MCP experiment: created 2025-10-28, **last push 2025-11-19**, 1★, empty README. `gh search issues "agentic" --owner ONDC-Official` → zero |
| E32 | `github.com/beckn/schemas` · `beckn/catalog-core` | Beckn 2.0 is JSON-LD/RDF native; catalog-core does signed crawlable catalogs; **no published Beckn↔schema.org/ACP crosswalk** |
| E33 | `arxiv.org/abs/2607.12056` | *Designing Agent-Ready Websites* — merchant-side redesign: strict success **49.3% → 89.3%**, 300 runs |
| E34 | `arxiv.org/abs/2605.06457` (PAKDD 2026) | *Beyond Task Success* — **10 of 18 LLMs skip the payment-confirmation checkpoint** while scoring perfect task success, 90,000 instances |
| E35 | `arxiv.org/abs/2511.23281` (WWW '26) · `2603.10700` | Publication format moves retrieval F1 0.67→0.87; enhanced entity pages +29.6%/+29.8% |
| E36 | `arxiv.org/abs/2606.28356` · `2606.13610` · `2607.24869` · `2308.11483` · `2505.04948` | GEO attacks promote flawed products up to **83.2%**; one poisoned page flips recommendations; order sensitivity 13–75%, exploitable, and not fixable by instruction |
| E37 | `arxiv.org/abs/2607.21824` · `2608.23858` · `2507.14799` · `2606.13385` · `2602.13516` | Protocol-level attacks on agentic commerce; **48 threats** in AP2; accessibility-tree injection; StakeBench; SPILLage |
| E38 | `unit42.paloaltonetworks.com/ai-agent-prompt-injection/` (2026-03-03) · CSA note (2026-05-20) | Web-based indirect prompt injection in the wild; **+32% relative increase** Nov 2025 → Feb 2026 |
| E39 | ET, `…articleshow/133309919.cms` (~2026-08-18) | **Reported-secondary via *The Information***: OpenAI scaled back Instant Checkout; Walmart ~3× worse ChatGPT conversion; Indian consensus that checkout is *"a few years away"* |
| E40 | `docs.stripe.com/agentic-commerce` · `agenticcommerce.dev` · `mpp.dev` · `ucp.dev` | Stripe supports sellers via UCP **or** ACP with **no readiness tooling**; ACP is Apache-2.0, merchant-of-record; MPP is *"extensible to any payment method"* with IETF specs |

### Primary — protocol specs, via the protocol subagent (retrieved 2026-08-26)

| # | Source | What it establishes |
|---|---|---|
| E41 | `github.com/agentic-commerce-protocol/agentic-commerce-protocol` (1,523★, Apache-2.0) | ACP maintained by **OpenAI + Stripe**, TSC seats OpenAI/Stripe/**Meta**, founders retain veto; latest stable `2026-04-17`; last push 2026-07-18. Feed/Checkout/Delegate-Payment/Cart schemas at field level |
| E42 | ACP `rfcs/rfc.product_feeds.md` | *"Agents rely on scraping or proprietary catalog APIs: Product discovery is brittle, incomplete, and inconsistent across merchants."* Push model; *"Agents MUST treat checkout responses as authoritative even when they differ from feed data"* |
| E43 | ACP `rfcs/rfc.discovery.md` | `/.well-known/acp.json`; **"MUST NOT accept or return `merchant_id`"** — merchant identity is an explicit non-goal |
| E44 | ACP `schema.delegate_payment.json` | `Allowance` required: `reason`, `max_amount`, `currency`, `checkout_session_id`, `merchant_id`, `expires_at` |
| E45 | Live probe of `/.well-known/acp.json` on 8 domains incl. `acp.stripe.com`, allbirds, glossier, etsy, wayfair | **404 on every one** — no live ACP discovery document found |
| E46 | `github.com/google-agentic-commerce/AP2`, `docs/ap2/specification.md` v0.2 | Mandates renamed to **Checkout / Payment**, **Open / Closed**; `vct` versioning; *"MUST be signed using a digital signature scheme (e.g., ECDSA) and **not** a deterministic signature (e.g., Ed25519)"*; core work moving to **FIDO** |
| E47 | AP2 FAQ | *"If you are a merchant… you should use **Universal Commerce Protocol**. You can enhance the protocol with the **AP2 extension**"* |
| E48 | `ucp.dev` governance; releases through **`v2026-08-25`** | Governing Council: Google + Shopify permanent, **Stripe joined 2026-04-28**; 16-seat Shopping Tech Council |
| E49 | Live probes: `allbirds.com/.well-known/ucp`, `skims.com/.well-known/ucp`, `weareallbirds.myshopify.com/api/ucp/mcp` | UCP live outside India too; **13 MCP tools**; unreachable agent profile → `{"code":"profile_unreachable"}` — **discovery is mutual** |
| E50 | `shopify.dev/docs/apps/build/storefront-mcp` + live probes of allbirds.com and gymshark.com `/api/mcp` | *"Storefront MCP servers **don't require authentication**"*; live tool set exceeds the documented one |
| E51 | `support.google.com/merchants/answer/16837055` · `developers.google.com/merchant/ucp/guides/merchant-center` | **`native_commerce(checkout_eligibility)`**; agentic Buy button limited to **US, Canada, Australia**; FPANs in Google Wallet; Google Pay & Wallet Console required |
| E52 | `support.google.com/merchants/answer/7052112` | Google product data spec; **India-only `maximum_retail_price`**; shipping required for India |
| E53 | `developers.google.com/search/docs/appearance/ai-features` | *"You don't need to create new machine readable files, AI text files, or markup… There's also no special schema.org structured data that you need to add."* |
| E54 | `developers.openai.com/commerce/*` incl. `llms-full.txt` (2,188 lines) | Instant Checkout is **approved-partners only**; SFTP daily snapshot, parquet preferred; Google-feed compatibility path; `seller_privacy_policy` + `seller_tos` **hard-required** when `is_eligible_checkout=true`; **zero** occurrences of `schema.org`/`json-ld`/`crawl` |
| E55 | `x402.org` (LF launch 2026-07-14) · `github.com/x402-foundation/x402` · `docs.x402.org` | Bazaar: ***"Q: Can I list non-x402 services? A: No."*** No product/SKU/inventory/shipping concept; ~$0.32 average transaction |
| E56 | `llmstxt.org` v2 · `github.com/AnswerDotAI/llms-txt` (2,586★) | Rejects `/.well-known/`; only an H1 is required; commerce-extension issues all unmerged; `shopify.dev/llms.txt` → 404; `docs.stripe.com/llms.txt` has **zero** "agentic" |
| E57 | `modelcontextprotocol.io/extensions/overview` + SEP-2009, #2007, #2008, #3229 | **MCP has no payments extension** — all payment SEPs opened and **closed** |
| E58 | `github.com/beckn/protocol-specifications-v2`, `beckn/catalog-core`, `beckn/beckn-discovr`, `beckn/beckn-agents` | Beckn 2.0 LTS; signed versioned catalogs (Ed25519 detached JWS); semantic discovery service; LLM skills repo |
| E59 | `github.com/ONDC-Official/ONDC-RET-Specifications` · `ONDC-Protocol-Specs` (last push **2025-01-31**) | Real B2C catalog shape (`@ondc/org/return_window: P3D`, `tags[].list[]`); specs repo stale |
| E60 | `medianama.com/2026/07/223-npci-agentic-payments-upi/` (2026-07-10) | Name is **"Unified Agent Protocol"**; *"the report is scant on details"*; Pine Labs **open-sourced its agentic OAuth framework** |
| E61 | `amazon.com/gp/help/customer/display.html?nodeId=508088` (updated **2026-08-14**) | Amazon Conditions of Use now has an **"Agents"** section: user agent must contain `Agent/[agent name]`; *"we may limit… whether and how any Agent accesses"* |
| E62 | `github.com/visa/trusted-agent-protocol` — issues **#22, #16, #8** | Contributors name the correctness / receipt / dispute gap; **#22 has 0 comments**; no Visa-affiliated accounts in the threads |
| E63 | `developers.openai.com/commerce/guides/production` | *"**Who manages chargebacks and refunds?** — **The merchant does.**"* OpenAI is not the merchant of record |
| E64 | Razorpay docs: `.../upi-reserve-pay/*`, `/docs/api/payments/items/`, `/docs/api/orders/products`, `/docs/payments/.../trusted-business/`, `/build/llm-docs/api/authentication.md` | Reserve Pay field names + ₹10,000 / 90-day caps; Items = invoice lines; Products = `mutual_fund` only (SEBI); RTB validated by *"clicking on the RTB icon"*; **all APIs Basic-Auth, no unauthenticated read surface** |
| E65 | `github.com/razorpay/razorpay-mcp-server` README + git history | `create_refund` ❌ on remote; `main` last commit 2026-03-26; **0 PRs merged since 2026-04-01**; gating is only `--read-only` / `--toolsets` |
| E66 | Razorpay docs: `.../recurring-payments/upi.md`, Route docs + FAQ, `test-upi-details.md`, `webhooks/validate-test.md`, `s2s-integration.md` | **AFA ₹15,000 general / ₹1,00,000 MCC 6211-6300-7322-6529-5960**; Route test-mode usable, live gated by Sept 2025 RBI PA guidelines; UPI Collect deprecated **28 Feb 2026**; test-mode gotchas |
| E67 | Razorpay docs URL inventory (2,282 URLs, `/docs/build/sitemap/razorpay/IN/urls.txt`) | Grep for "agentic" → **zero hits.** `razorpay.com/agentic-commerce/` → **404** |

### Explicit non-findings

- `EVIDENCE NOT FOUND` — any Razorpay product, product-catalog, or inventory API.
- `EVIDENCE NOT FOUND` — any Razorpay-owned machine-readable merchant-verification endpoint a third party could query.
- `EVIDENCE NOT FOUND` — Razorpay as a UCP, ACP, AP2 or x402 participant.
- `EVIDENCE NOT FOUND` — any UPI or India-specific payment handler in the UCP specification.
- `EVIDENCE NOT FOUND` — any GitHub repository measuring quote-to-capture price divergence for agent purchases (searched; zero results — weak evidence, keyword-based).
- `EVIDENCE NOT FOUND` — **any benchmark that scores merchants on a leaderboard, or that varies catalog data quality against agent purchase-completion rate.** This is the central gap.
- `EVIDENCE NOT FOUND` — any open-source ACP or UCP **product-feed validator** (`gh search repos "acp product feed validator"` → 0).
- `EVIDENCE NOT FOUND` — any merchant-readiness or conformance **certification programme** named on `ucp.dev`.
- `EVIDENCE NOT FOUND` — Indian funding rounds explicitly in agentic commerce or AEO/GEO-for-ecommerce, across four query paths. Sole lead: `HYPOTHESIS` Kily (₹30 Cr, Sorin + Razorpay + Wyser, ~2026-08-05).
- `EVIDENCE NOT FOUND` — any ONDC statement on AI shopping agents.
- `EVIDENCE NOT FOUND` — **any merchant→agent verification primitive, anywhere.** Checked: ACP (forbids it), AP2, Visa TAP, Visa Intelligent Commerce, Mastercard Agent Pay, Forter TACP, Razorpay. This is the cleanest negative result in the document.
- `EVIDENCE NOT FOUND` — any new chargeback reason code, authorisation-message field, or named "agent-initiated" transaction indicator, across Visa TAP, developer.visa.com, three Mastercard press releases, AP2 v0.2 and ACP 2026-04-17 with all 14 RFCs. `HYPOTHESIS`: one likely exists in private scheme rulebooks.
- `EVIDENCE NOT FOUND` — any live `/.well-known/acp.json` in the wild (8 domains probed, including `acp.stripe.com`).
- `EVIDENCE NOT FOUND` — any Perplexity merchant feed specification, field list or endpoint; any Amazon seller-facing Rufus/Alexa-for-Shopping optimisation guidance; PayPal MCP tool names; official WooCommerce / Adobe Commerce / Salesforce Commerce Cloud MCP servers.
- `EVIDENCE NOT FOUND` — any controlled study measuring LLM-agent consumption of JSON-LD; any server-log study of `/llms.txt` request volume (the commonly-cited Ahrefs post is a confirmed 404).
- `EVIDENCE NOT FOUND / NOT VERIFIED` — the **RBI FREE-AI committee report** (not retrieved from `rbi.org.in`; **re-verify before citing**); any RBI circular on agent-initiated payments; any primary NPCI document on UAP (`npci.org.in` blocks automated retrieval).
- `EVIDENCE NOT FOUND` — whether **UPI Reserve Pay works on test keys**. The docs are silent and activation needs a support ticket. **Architecture-gating: verify on day 1.** Confirmed fallback: UPI AutoPay, *"available by default"*.
- **Do not assert**, per the subagents' own flags: a Perplexity–Firmly.ai partnership; OpenAI-sourced confirmation of Shopify/Etsy/Walmart Instant Checkout partnerships; the John Mueller llms.txt remark; Amazon-v-Perplexity litigation.

### Tooling limitations affecting this document

All three research subagents reported degraded tooling: **WebSearch budget exhausted at 200/200**; `firecrawl_search` (local SearXNG) returning semantically unrelated results on control queries; DuckDuckGo, Mojeek and Search Engine Land returning anti-bot errors; `npci.org.in`, `mastercard.com`, `perplexity.ai` and `chatgpt.com/merchants` blocking automated retrieval. **Everything that survived came from direct URL retrieval, the GitHub API, `git clone`, and live endpoint probes** — which is why the non-findings list is long. Those gaps are genuinely unverified, not merely unmentioned. My own first-hand measurements (§2.4, §3.1, §4.1–4.1d) used `curl` and `git clone` only and are unaffected.

