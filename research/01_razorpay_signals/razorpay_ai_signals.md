# Razorpay — AI / Agent / Agentic Commerce Signals

**Retrieval date: 2026-08-26** (all URLs retrieved on this date unless noted)
**Researcher note on tooling:** firecrawl MCP was unavailable (Docker daemon not running; `~/.superstack/web/bin/webup` returned "Docker not running"). All retrieval done via WebSearch + WebFetch + direct `curl` scrapes. Where a page returned HTTP 403 to WebFetch, that is noted inline and the claim is sourced from an alternate primary/secondary source or marked EVIDENCE NOT FOUND.

**Labels used:** `FACT` = directly stated in a retrieved source. `INFERENCE` = my reasoning from ≥2 facts. `HYPOTHESIS` = plausible, unverified.
**Source classes:** (a) Razorpay-official, (b) press/secondary, (c) industry-wide context not Razorpay-specific.

---

## Executive orientation (read this first)

Razorpay is **not** an early-stage AI player to be pitched a first agentic idea. As of 2026-08-26 they have shipped, in the last ~16 months:

- an official MCP server (Apr 2025) and a hosted Remote MCP 2.0 (Jun 2025);
- agentic UPI payments in ChatGPT with NPCI + OpenAI (private beta, Oct 2025);
- agentic UPI payments in Claude with NPCI (pilot, Feb 2026) across Zomato/Swiggy/Zepto;
- an Agent Studio + Agentic Experience Platform on Anthropic's Claude Agent SDK (Mar 2026);
- a payments CLI framed for "the AI Agent Era" (May 2026);
- an internal autonomous coding agent platform, **Slash** (blogged May 2026), merging ~1/3 of PRs with no human in the loop;
- RazorpayX agentic banking beta (Jun 2026);
- **Vulcan**, a proprietary transformer foundation model for payments with NVIDIA + AWS (Aug 18, 2026);
- a public org-wide AI curriculum, **ai-playbook**, last pushed 2026-08-25.

Anything proposed to them must clear that bar.

---

## 1. MCP Server & Agent Toolkit

### FACT — Razorpay ships an official MCP server, local and remote
- **Repo:** https://github.com/razorpay/razorpay-mcp-server — "Razorpay's Official MCP Server" (source class a, GitHub README, retrieved 2026-08-26 via raw.githubusercontent.com).
- **Remote endpoint (verbatim from README config blocks):** `https://mcp.razorpay.com/mcp`, invoked via `npx mcp-remote` with an `Authorization: Basic <Base64(key:secret)>` header. Documented setups for **Cursor** and **Claude Desktop**.
- **Tool surface (verbatim README table):** 40+ tools. Categories: Payments (`capture_payment`, `fetch_payment`, `initiate_payment`, `resend_otp`, `submit_otp`, …), Payment Links (incl. `create_payment_link_upi`), Orders, Refunds, QR Codes, Settlements (incl. instant settlements), Payouts (RazorpayX), Tokens (`fetch_tokens`, `revoke_token`), Registration Links, plus two **MCP Integration Helper** tools that are not API wrappers: `detect_stack` ("Detect project language/framework for checkout integration") and `integrate_razorpay_checkout` ("Generate end-to-end Razorpay Standard Checkout integration code for supported frameworks").
- **Notable gaps in the Remote server** (README "Remote Server Support" column marks ❌): `create_refund`, `close_qr_code`, `create_instant_settlement`, `create_registration_link`. INFERENCE: Razorpay deliberately withholds the most irreversible money-moving / destructive actions from the hosted remote surface. This is a real, citable design position on agent safety.
- **Stated use cases (verbatim README):** "Workflow Automation: Automate your day to day workflow using Razorpay MCP Server." / "Agentic Applications: Building AI powered tools that interact with Razorpay's payment ecosystem using this Razorpay MCP server."

### FACT — Official docs
- https://razorpay.com/docs/mcp-server/ — "About Razorpay MCP Server" (source class a). Nav tree confirms sub-pages: Use Cases, OAuth, Available Tools, Setup Guides, Integrations, Configuration, FAQs. Claims "35+ tools". Lists supported clients: "Claude Desktop, Cursor, and Visual Studio Code."
- https://razorpay.com/docs/mcp-server/use-cases/ — verbatim example prompts: *"Create a Payment Link for ₹25,000 for Acme Enterprises"*, *"Show me settlement details for last week"*, *"Can you share trend for failed payments in the last 30 days?"*, *"Why did Gaurav Kumar's payment fail yesterday?"* Framed for **support, sales, and finance teams**, not just developers.
- https://razorpay.com/docs/mcp-server/faqs/ — FAQ #2 verbatim: *"Yes, the Razorpay MCP Server is an official integration designed for production use."*
- Adjacent developer surfaces in the same docs nav: **Razorpay CLI** and **Razorpay n8n Node**.

### FACT — Razorpay's own blog/newsroom about MCP
- **Newsroom (source class a):** "Razorpay Becomes One of the First Payment Gateways to Launch MCP Server For Instant AI Payment Integration" — https://razorpay.com/newsroom/razorpay-becomes-indias-first-payment-gateway-to-launch-mcp-server-for-instant-ai-payment-integration/ — announcement dated **29 April 2025**.
- **Blog (source class a):** "Razorpay Remote MCP 2.0 – The Next Leap in AI-powered Payments" — https://razorpay.com/blog/razorpay-remote-mcp-2-0-the-next-leap-in-ai-powered-payments/ — dated **12 June 2025**. Describes a "fully hosted, self-serve AI-native payments infrastructure layer"; "over 35 specialized tools"; token-based auth with automatic rotation; zero infra overhead.
  - **Verbatim quote, attributed:** *"The best technology is invisible technology. With Remote MCP, we're making that philosophy a reality for payments."* — **Anand Lakshmanan, VP Product, Razorpay**.
- **Exec social (source class b, X/Twitter — not directly fetchable, surfaced via search index):** Shashank Kumar, https://x.com/shashank_kr/status/1916426439785848867 — *"The @Razorpay MCP Server is officially live! Razorpay becomes India's first payment gateway with an Official MCP (Model Context Protocol) Server, designed for an AI-first world."* **CAUTION:** this quote comes from a search-engine snippet of the X post; I could not fetch x.com directly. Treat as high-confidence-but-secondhand.

### FACT — Razorpay CLI, positioned for agents
- **Newsroom (a):** "Razorpay Brings Payment Command Line Interface to India; Built for Developers and the AI Agent Era" — https://razorpay.com/newsroom/razorpay-brings-payment-command-line-interface-to-india-built-for-developers-and-the-ai-agent-era/ — **27 May 2026**. Explicitly names **Claude Cowork** and **OpenAI Codex** as environments the CLI is meant to be driven from.
  - **Verbatim quote, attributed:** *"Dashboards will continue to exist, but they can no longer be the only way businesses interact with payments."* — **Khilan Haria, Chief Product Officer, Razorpay**.

---

## 2. Agentic Commerce Pilots — resolving the "in-app pilots are already live" claim

### FACT — The Buildathon claim, verbatim
Scraped directly from https://razorpay.com/buildathon/ (source class a, `curl` scrape, 2026-08-26), Track 01 "Why now" block, **verbatim**:

> "NPCI's UAP and the global protocol race (ACP, AP2, x402) make agent-to-agent commerce the open problem of the year, and Razorpay's in-app pilots are already live."

### FACT — What the "in-app pilots" actually are
The claim is **substantiated**. Razorpay runs a named product line called **Agentic Payments** with three surfaces, one of which is literally called "In-App".

**Product page:** https://razorpay.com/agentic-payments/ — "Razorpay Agentic Payments | India's First AI-Powered Conversational Payments" (source class a). Three deployment models: **In-App Commerce**, **LLM Platforms**, **Voice AI**. Status markers on that page: **UPI Reserve Pay = live**; **In-App Commerce = beta**; **UPI Circle = coming soon**.

**Named in-app pilot merchants** (source class a, https://razorpay.com/blog/agentic-payments-the-future-of-in-app-commerce/):
- **FTX 2026 in-app pilot cohort (5 merchants):** Zomato, PVR INOX, Vodafone Idea, Bluestone, Honasa (The Derma Co).
- **GFF 2025 first in-app pilot:** Vodafone Idea (Vi) app — verbatim: *"The in-app AI understood the user's usual recharge pattern, recommended the most relevant plan, and completed the payment seamlessly within the same flow."*
- Worked example, verbatim user intent: *"I want a high-protein meal that can reach within 30 minutes."* → agent interprets, searches across restaurants, curates, pays via UPI Reserve Pay with no app redirection. Verbatim outcome claim: *"The user doesn't need to search, compare multiple restaurant pages, or manually build a cart."*
- **Status caveat (FACT):** that blog characterises all of these as **pilots / early partnerships**, not GA. The `/agentic-payments/` page labels In-App Commerce **beta**.

**India AI Impact Summit launch page** (source class a, https://razorpay.com/m/india-ai-impact-summit-2026-razorpay-launches/) confirms three separate agentic launches with named partners:
| Surface | Named launch partners |
|---|---|
| Agentic Payments for Claude | Zepto, Swiggy, Zomato |
| Agentic Payments for Voice-AI | Gnani.ai, SuperU, Zomato Nugget |
| Agentic Payments for In-App | Vodafone |
| International Payments (AI builders) | Replit |

### FACT — Pilot #1: ChatGPT + NPCI + OpenAI (Oct 2025)
- **Blog (a):** https://razorpay.com/blog/razorpay-unveils-agentic-payments-on-chatgpt-with-npci-indias-first-ai-powered-conversational-payment-experience/ — **9 October 2025**. Private beta. Partners: NPCI, OpenAI/ChatGPT. Banking partners: **Axis Bank, Airtel Payments Bank**. Merchants: **bigbasket (Tata), Vodafone Idea (Vi)**. Rails: **UPI Circle** and **UPI Reserve Pay**.
  - **Verbatim quote, attributed:** *"With Agentic Payments, we're enabling effortless shopping through AI assistants. From discovery to checkout, bigbasket and Razorpay integration delivers a fast, seamless grocery shopping experience—all in one conversation."* — **Preeti Jain, Product Head, bigbasket**.
- Showcased at **GFF 2025** (source class b: India TV, Fintech Singapore, Electronic Payments International).

### FACT — Pilot #2: Claude + NPCI (Feb 2026) — the flagship
- **Blog (a):** https://razorpay.com/blog/agentic-payments-and-npci/ — announced **20 February 2026** at the **India AI Impact Summit, New Delhi**. Author: Rashmee Lahon.
- **Newsroom title (a):** "Razorpay & NPCI Launch Agentic Payments on Claude, Powering Zomato, Swiggy & Zepto" (listed on https://razorpay.com/newsroom/, 20 Feb 2026).
- **Status — important:** the Razorpay blog itself says it is **"currently in a pilot phase with a select group of users"** and **"in pilot with a closed user group."** Several press headlines say "go live" (BusinessToday, AnalyticsIndiaMag). **INFERENCE:** press over-states GA; the primary source says closed pilot. Use "pilot" language.
- **Rails:** UPI Reserve Pay. Verbatim mechanism: *"Built on UPI Reserve Pay, the system allows users to give a one-time, consent-based authorization by setting spending limits for a merchant."*
- **Exec quotes (source class b, AnalyticsIndiaMag — https://analyticsindiamag.com/ai-news/razorpay-npci-enable-in-chat-upi-payments-on-claude-for-zomato-swiggy-zepto, retrieved 2026-08-26):**
  - **Harshil Mathur, CEO & Co-founder, Razorpay:** *"AI shouldn't stop at recommendations - it should finish the job."*
  - **Harshil Mathur:** *"Today, the real challenge with AI-led commerce isn't intelligence - it's trust."*
  - **Sohini Rajola, Executive Director – Growth, NPCI:** *"With UPI Reserve Pay, users can give consent once and allow intelligent systems to transact on their behalf in a controlled, transparent way."*
  - *(These three are attributed in a secondary outlet. High confidence, but I did not retrieve them from a Razorpay-hosted page.)*

### FACT — Pilot #3: Voice AI (Sarvam AI, superU, Gnani.ai)
- **Sarvam AI partnership** (source class a for existence: https://www.sarvam.ai/partnerships/razorpay; class b for detail: Entrackr, Business Standard, Medianama — Mar 2026). Three layers:
  1. Conversational commerce inside the **Indus App**, starting with **Swiggy**;
  2. Embedded voice commerce for third-party sites — early build for **The Derma Co**;
  3. Sarvam's stack integrated into **Razorpay Agent Studio** for Hindi/Hinglish multilingual agents.
- **Reported risk parameters (source class b, Medianama 2026-03; WebFetch returned 403, sourced from search index — treat as MEDIUM confidence):** upfront authentication, **spending limit capped at ₹10,000**, and *"if the agent orders the wrong thing, the merchant bears the liability."* **This liability-allocation detail, if true, is strategically significant and worth independent re-verification.**
- **superU** (source class b: Electronic Payments International) — "real-time, fully automated agentic payment system."
- **Razorpay blog on voice:** https://razorpay.com/blog/razorpay-agentic-payments-voice-ai/ (source class a, exists; not deep-fetched).

### INFERENCE
The "in-app pilots are already live" claim on the Buildathon page is **true but narrow**: it refers to merchant-app-embedded agentic checkout in **beta** with ~5–6 named merchants, not a generally-available product. A hackathon submission that merely demos "conversational checkout" is re-demonstrating something Razorpay already runs in production-adjacent beta with Zomato and Vodafone Idea.

---

## 3. Protocol Positions (UAP, AP2, ACP, x402, MCP)

| Protocol | Razorpay position | Evidence |
|---|---|---|
| **MCP** | **Deep, official, shipped.** Local + remote servers, 40+ tools, production-supported, in the docs IA as a first-class Developer Tool. Also used *internally* — Slash accesses external systems via an "MCP and CLI Gateway". | FACT — GitHub README, razorpay.com/docs/mcp-server/, Remote MCP 2.0 blog, Slash blog |
| **NPCI UAP (Unified Agent Protocol)** | **Aware and named publicly; deepest de-facto NPCI relationship of any Indian PA.** Razorpay is NPCI's named partner on both live agentic pilots (ChatGPT Oct 2025, Claude Feb 2026), built on **UPI Reserve Pay** + **UPI Circle** — the delegated-payment primitives UAP is reported to build on. **But: no source shows Razorpay named as a formal UAP launch partner or working-group member.** | FACT (pilots + Buildathon page naming UAP). **EVIDENCE NOT FOUND** for formal UAP membership. |
| **Google AP2** | **Not a partner, as far as I can verify.** The Sep 2025 AP2 launch partner list (60+ names: Adyen, Amex, Ant International, Coinbase, Etsy, Forter, Intuit, JCB, Mastercard, Mysten Labs, PayPal, Revolut, Salesforce, ServiceNow, UnionPay, Worldpay…) **does not include Razorpay** in any source I retrieved. | **EVIDENCE NOT FOUND.** Do not claim Razorpay is an AP2 partner. |
| **OpenAI/Stripe ACP** | **Not a launch partner, as far as I can verify.** Razorpay's OpenAI relationship is the NPCI/UPI-in-ChatGPT pilot (Oct 2025), which predates and is architecturally distinct from ACP (UPI rails, not ACP checkout spec). | **EVIDENCE NOT FOUND** for ACP membership. |
| **x402** | **EVIDENCE NOT FOUND** for any Razorpay participation. | — |

### FACT — The one and only Razorpay-authored statement naming AP2/ACP/x402
The **Buildathon page** (razorpay.com/buildathon/, Track 01) is, in everything I retrieved, the **only Razorpay-owned surface that names ACP, AP2, and x402 at all**. Verbatim again:

> "NPCI's UAP and the global protocol race (ACP, AP2, x402) make agent-to-agent commerce the open problem of the year, and Razorpay's in-app pilots are already live."

**INFERENCE (high value):** Razorpay frames these as a *"protocol race"* it is watching from an India/UPI-first position, not one it has picked a side in. Its actual bet is **UPI rails (Reserve Pay / Circle) + MCP as the agent interface**. It has no public commitment to any Western agentic-commerce standard.

**HYPOTHESIS:** the reason Track 01 exists, and the reason "agent-readable catalog" is a listed example direction, is that Razorpay has a **merchant-side gap** — its merchants are not discoverable/transactable by *third-party* AI buyers (ChatGPT/Gemini shopping agents) under ACP/AP2. Razorpay solved *agent-initiates-payment*; it has not publicly solved *merchant-is-machine-readable*. Unverified but strongly suggested by the track brief's phrasing: *"make them sellable to AI buyers"* / *"makes a merchant transactable by an AI buyer end to end."*

### Industry context (source class c — NOT Razorpay-specific)
- NPCI is reported to be developing **UAP**, to register/verify/authorise AI agents across the UPI ecosystem without changing underlying rails. Reported **July 2026** (Business Standard, Outlook Business, siliconindia). **Requires RBI approval; not launched as of the reporting.** Do not state UAP is live.
- ACP = OpenAI + Stripe (checkout/merchant-integration layer). AP2 = Google, 60+ partners, later donated to the FIDO Alliance. x402 = Coinbase-origin execution/settlement layer; Google shipped an "A2A x402" extension. Widely described as **layered, not mutually exclusive**.

---

## 4. Shipped AI Products

### FACT — Vulcan: proprietary payments foundation model (the biggest recent signal)
- **Source (class a, joint press release hosted by AWS):** https://press.aboutamazon.com/aws-international/2026/8/razorpay-launches-vulcan-indias-first-ai-payments-foundation-model-fueled-by-nvidia-and-aws-re-architecting-payments-for-a-350-bn-e-comm-future-by-2030 — **18 August 2026** (eight days before this report).
- **What:** "India's first transformer-based AI foundation model designed specifically for payments." Replaces fragmented single-purpose ML models with one intelligence layer.
- **Scale (verbatim figures):** ~**3 trillion data points**, **4 billion payments**, ~**3,000 signals per transaction**. Trained on **NVIDIA GPUs**, built/deployed on **AWS / Amazon SageMaker**. Architecture and training data proprietary to Razorpay.
- **Claimed metrics:** **8–10%** improvement in payment success rates; **8x** increase in international card fraud detection; **5x** improvement identifying fraudulent/disputed transactions without more false positives; **40%** more shoppers shown their preferred UPI app on Magic Checkout (→ claimed 1–2 lakh extra purchases/month).
- **Four functions:** hyper-precision real-time routing; network-level fraud detection across merchants; **RTO risk intelligence for COD orders**; predictive checkout personalisation.
- **Status:** live on production networks; early components already processing transactions for **Blinkit, Bachatt, redBus**.
- **Notable:** the release contains **no mention of agentic commerce or any agent protocol.** INFERENCE: Vulcan is the *risk/routing* brain; the agentic stack is a separate product line. They have not (publicly) fused them.
- Corroboration (class b): Business Standard, Medianama, freepressjournal, techtimes, paymentexpert (2026-08-18 to 08-21).

### FACT — Agent Studio + Agentic Experience Platform
- **Newsroom (a):** "Razorpay Launches the World's First AI-Native Agent Studio for Payments at FTX'26, Powered by Anthropic's Claude" — **12 March 2026**. Blog: https://razorpay.com/blog/agent-studio-ai-agents-by-razorpay/
- Built on **Anthropic's Claude Agent SDK**. A **B2B agent marketplace + builder** for payments and business banking.
- **Pre-built agents (verbatim list):** Dispute Responder; Subscription Recovery (built with **ElevenLabs**); Abandoned Cart Conversion (**SuperU** and **Nugget by Zomato** versions); Cashflow Forecaster (3–7 day cash position + risk alerts); **RTO Shield** (high-risk COD detection pre-dispatch); **RTO Insights**; Settlement Insights (daily WhatsApp summary).
- **No-Code Agent Builder (beta)** also announced. Availability: **early access**.
- **Agentic Experience Platform — three capabilities (source class b, thepaypers 2026-03-16):**
  1. **Agentic Onboarding** — merchant setup from 30–45 min → ~5 min via automated identity verification;
  2. **Agentic Dashboard** — natural-language payment ops;
  3. **Agentic Integration** — sub-10-minute integration via **Claude Code** and no-code platforms like **Replit**.
- Third-party integrations named: Shopify, WhatsApp, Shiprocket, Slack, QuickBooks.
- **Quotes:** Harshil Mathur (CEO): *"Agent Studio enables companies to deploy AI agents that can monitor revenue flows…"* (partial, thepaypers). Irina Ghose (**MD, Anthropic India**) also quoted. **CAUTION: both partial/secondary — do not present as complete verbatim.**

### FACT — RazorpayX Agentic Banking
- **Newsroom (a):** "For the First Time in India, Businesses on RazorpayX Can Now Bank with AI Agents That Work While They Sleep" — **1 June 2026**.
- **Components:** **Cashflow Insights** (real-time consolidated balances/projections); **Receivables Agent** (automated invoice follow-ups); **Payout Agent** (conversational disbursement, instruction → OTP approval in seconds).
- **Status:** Cashflow Insights and Payout Agent in **beta** for RazorpayX Connected Banking+ users.
- **Verbatim quote, attributed:** *"When routine financial operations run themselves, finance teams stop being reactive and start being consequential."* — **Ayush Bansal, VP and General Manager, RazorpayX**.

### FACT — Thirdwatch → Magic Checkout (the ML fraud/RTO lineage)
- **Acquisition (a):** https://razorpay.com/blog/thirdwatch-acquisition-rto-fraud-ecommerce/ — Razorpay's **first acquisition**, **August 2019**, of Gurugram-based AI startup **Thirdwatch** (founded 2016 by Adarsh Jain and Shashank Agarwal). ML + big data producing a **real-time transaction risk score / red-green flag**.
- **Merger (a):** https://razorpay.com/blog/thirdwatch-has-merged-with-magic-checkout/ — Thirdwatch merged into **Razorpay Magic Checkout**; standalone Thirdwatch app/dashboard **discontinued 1 January 2023**.
- **Magic Checkout AI today:** AI pre-fills user details, personalises payment experience, and **disables COD for high-risk users** to cut RTO. As of Aug 2026, RTO risk scoring is a named Vulcan function — INFERENCE: the Thirdwatch lineage has been absorbed into Vulcan.

### FACT — Replit partnership
- **Newsroom/blog (a):** https://razorpay.com/newsroom/razorpay-becomes-the-india-payments-partner-for-replits-global-ai-platform/ and https://razorpay.com/blog/razorpay-partners-with-replit/ — **17 February 2026**, unveiled at the AI Impact Summit.
- Replit goes live with Razorpay's **International Payments Suite**; Indian users pay in INR via UPI/cards; Razorpay handles compliance, FX, USD settlement so Replit needs no Indian entity. Rolling out in **beta**. Framing: let AI-first builders monetise vibe-coded apps.

### "Ray" AI assistant
**EVIDENCE NOT FOUND.** No source I retrieved shows a Razorpay AI assistant named "Ray". The internal assistant is named **Slash** (see §6). **Do not use the name "Ray".**

### Turbo UPI
**EVIDENCE NOT FOUND** for any AI/agentic claim specifically attached to "Turbo UPI" in the sources retrieved. Turbo UPI exists as a Razorpay product but I found no AI-branded claim about it in this pass. Treat as unverified.

### AI reconciliation
Partial: **Settlement Insights** agent and **Cashflow Forecaster** (Agent Studio) and **Cashflow Insights** (RazorpayX) touch recon/settlement. A dedicated "AI reconciliation" product name was **NOT FOUND**. Note that the Buildathon's Track 04 (AI Finance Controller) targets exactly reconciliation/settlement/forecasting and says verbatim: *"Reconciliation, settlement and forecasting are still done by hand."* INFERENCE: Razorpay considers recon an **unsolved** area internally.

---

## 5. Executive AI Statements

> Quotes below are reproduced only where I actually retrieved them. Where a quote came from a search-engine snippet rather than a fetched page, it is flagged. Several outlets (business-standard.com, yourstory.com, tipranks.com, the-ken.com, medianama.com, x.com) returned **HTTP 403** to WebFetch.

### Harshil Mathur — CEO & Co-founder
- **FACT, retrieved (AnalyticsIndiaMag, 2026-02-20):** *"AI shouldn't stop at recommendations - it should finish the job."*
- **FACT, retrieved (AnalyticsIndiaMag, 2026-02-20):** *"Today, the real challenge with AI-led commerce isn't intelligence - it's trust."*
- **SNIPPET-SOURCED (X, 2026-03-13, https://x.com/harshilmathur/status/2032395094712824183) — could not fetch x.com directly:** *"A few months ago we asked ourselves a hard question. If we were building @Razorpay today what would it look like? The honest answer was uncomfortable. We wouldn't add AI to Razorpay. We would rebuild everything. So we did"* — thread reportedly claims AI-agent onboarding in ~3 min, integration from a prompt in ~2 min, and replacing the dashboard with talking to an agent.
- **SNIPPET-SOURCED (ANI / The Tribune, 2026-03-12, FTX'26):** *"This is the world's first platform. We have an agent platform that is built on top of payments."* and *"The business of running a business can completely go away because a single person can operate like a team of 100 agents."* URLs: https://aninews.in/news/business/worlds-first-platform-built-on-top-of-payments-razorpay-ceo-harshil-mathur-on-ai-agent-studio-for-autonomous-operational-tasks20260312135137/ ; https://www.tribuneindia.com/news/business/worlds-first-platform-built-on-top-of-payments-razorpay-ceo-harshil-mathur-on-ai-agent-studio-for-autonomous-operational-tasks/ — **verify before quoting publicly.**
- **SNIPPET-SOURCED framing line, repeated across FTX'26 coverage:** *"For 20 years businesses had to learn software. Now software will learn your business."*
- **Podcast (exists, not fetched — 403):** The Ken, *Zero Shot* — "Razorpay CEO Harshil Mathur on how agentic commerce will unfold in India" — https://the-ken.com/podcasts/zero-shot/razorpay-ceo-harshil-mathur-on-how-agentic-commerce-will-unfold-in-india/ . **Content EVIDENCE NOT FOUND** (paywalled/403).
- **Also exists (not fetched):** BW Marketing World, "Collections, Conversions & Commerce: Razorpay's Harshil Mathur On Three-front Push Into Agentic AI" — https://www.bwmarketingworld.com/article/when-agentic-comes-in-actions-start-happening-you-can-bring-commerce-into-it-says-razorpay-s-harshil-mathur-594231
- **Also exists (not fetched):** Z47, "Razorpay replaced their entire onboarding with AI Agents | Harshil Mathur | Intelligent Indians" — https://www.z47.com/z47-moments/razorpay-agentic-ai-unstarted

### Shashank Kumar — Co-founder & CTO (also referred to as MD in some coverage)
- **FACT, retrieved (digitalterminal.in, 2026-08-04):** *"The next decade of financial infrastructure will be built very differently from the last."*
- **SNIPPET-SOURCED (same press cycle):** *"software won't just help businesses operate – it will increasingly reason, decide, and act on their behalf"*, and a vision of *"AI agents discovering products, negotiating terms, and completing transactions autonomously."*
- **SNIPPET-SOURCED (X, https://x.com/shashank_kr/status/2056246734465253859):** *"We recently built an AI assistant inside @Razorpay called Slash. It reads our entire codebase, debugs production incidents, reviews specs, writes code, reviews every single PR, answer tech queries and also raises PRs for small features. It's easily accessible through Slack."*
- **SNIPPET-SOURCED (X, https://x.com/shashank_kr/status/1916426439785848867):** MCP server launch, quoted in §1.
- Speaker listed at **Cypher 2026** (AI conference) — https://cypher.analyticsindiamag.com/speakers/shashank-kumar
- **Business Standard interview (403, not fetched):** "India has an opportunity to leapfrog on AI: Razorpay's Shashank Kumar" — https://www.business-standard.com/companies/people/india-has-an-opportunity-to-leapfrog-on-ai-razorpay-s-shashank-kumar-126031201191_1.html — headline itself is the signal; body **EVIDENCE NOT FOUND**.

### Other named leaders (FACT, retrieved — digitalterminal.in, 2026-08-04)
Razorpay announced four senior engineering/AI hires:
| Name | From | Role at Razorpay |
|---|---|---|
| Sudhir Reddy | Ex CTO & Co-founder, Divyam.ai | Sr. Individual Contributor, AI & Data Architecture |
| Abhishek Agarwal | Microsoft | Engineering Leader |
| Bhavya Shivaprakash | Salesforce | Engineering Leader |
| Anuj Mathur | CRED | Engineering Leader |

- **Verbatim, attributed:** *"Getting AI into production at financial scale is a hard, unglamorous problem."* — **Praburam Rambadran, Sr. Vice President – Engineering, Razorpay**.
- **Verbatim, attributed:** *"I've always believed AI earns its place not by being clever, but by being trustworthy."* — **Sudhir Reddy**.
- **Verbatim, attributed:** *"The best technology is invisible technology. With Remote MCP, we're making that philosophy a reality for payments."* — **Anand Lakshmanan, VP Product** (Jun 2025).
- **Verbatim, attributed:** *"Dashboards will continue to exist, but they can no longer be the only way businesses interact with payments."* — **Khilan Haria, Chief Product Officer** (May 2026).
- **Verbatim, attributed:** *"When routine financial operations run themselves, finance teams stop being reactive and start being consequential."* — **Ayush Bansal, VP & GM, RazorpayX** (Jun 2026).

**A "Head of AI" title:** **EVIDENCE NOT FOUND.** Closest is Sudhir Reddy (Sr. IC, AI & Data Architecture) and Praburam Rambadran (SVP Engineering).

---

## 6. Internal AI Adoption

### FACT — "Slash": Razorpay's internal autonomous agent platform
- **Blog (source class a):** https://razorpay.com/blog/razorpay-engineers-built-slash-slash-builds-the-rest/ — **18 May 2026**.
- **What:** a cloud-based autonomous agent platform that writes code, opens PRs, reviews PRs, answers questions, and integrates with **15+ internal systems**.
- **Four execution modes:**
  1. **Launch Agents** — single-repo, batch, multi-repo, or clean-slate task modes; streams execution logs.
  2. **Slash Reviewer** — specialised **sub-agents**, each owning one dimension: **bug detection, security, code quality, Razorpay design system, internationalization, pre-mortem**. Each sub-agent **clones the repo and reads surrounding file context rather than working from the diff alone**.
  3. **Slash Event Listener** — auto-assigns and handles cross-functional tickets.
  4. **Scheduled Skills** — hundreds of repeatable tasks in a catalog.
- **Infrastructure:** an **MCP and CLI Gateway** with **scoped permissions** for external system access, plus **Discover**, an internal knowledge graph over GitHub PRs, Slack, Google Drive, AWS and ticketing systems.
- **Metrics (Q1 2026, verbatim/near-verbatim):** "tens of thousands of agent sessions"; "thousands of PRs created and merged every month"; **"over a third of them merged without a human in the loop"**; PRs 100/wk → 1,000/wk within a month; zero-human-review merges 10/wk → 100/wk; Discover queries 1,000/wk → tens of thousands/wk.
- **Agent Readiness Score:** repos scored on **Context** (documentation quality), **Testing** (coverage + infra), **CI/CD** (deployment automation). **80% across all three = "Agent Ready."**
- **Access points:** `@Slash` in Slack, ticket auto-assignment, GitHub CI pipeline trigger.
- **Corroborating exec stat (SNIPPET-SOURCED, Harshil Mathur, X https://x.com/harshilmathur/status/2056261949944647890):** *"Slash is awesome. 1000+ people used it in the last 2 weeks. 1000+ PRs merged. 97% success rate. But it isn't the stats. The fact that it lives inside Slack has changed the culture. Not just engineers - PMs, support, sales, account managers, everyone now casually pulls Slash into…"*

### FACT — `razorpay/ai-playbook` — public org-wide AI curriculum
- **Repo:** https://github.com/razorpay/ai-playbook — public, default branch `master`, **created 2026-05-13**, **last pushed 2026-08-25** (GitHub API, retrieved 2026-08-26). 349 files. Only **4 stars** — INFERENCE: public but not promoted externally; it is an internal artefact that happens to be open.
- **Hosted site:** https://razorpay.github.io/ai-playbook/ (Astro Starlight, auto-deployed on merge to master, with PR-preview builds).
- **Version:** **v0.61 alpha**, README updated **2026-08-13**.
- **Verbatim self-description (README):** *"The operating manual for Razorpay's AI builder program. A belt-progression curriculum, seven reusable Claude Code skill definitions, and a Starlight hub — all built on one Markdown source of truth."*
- **Verbatim thesis (README):** *"A playbook for AI-native engineering at Razorpay. It starts before tools — before Terminal, before 'what's an API' — and climbs through Foundation, four belts (White, Yellow, Green, Black), and a Staff+ Council layer for senior contributors."* And: **"Belts are earned by shipping, not by reading — every belt has required modules, hands-on quests, and a boss-fight capstone."**

**Structure (from repo tree, FACT):**
- `foundation/` — Tech 101 (10 chapters) + Ops 101 (8 chapters), explicitly for **non-engineers**.
- `prologue/` — 12 chapters (mental model, enablement stack, operating principles, safety brief, self-assessment).
- `belts/01-white` — 12 modules: file system, terminal fluency, git as savepoints, auth setup, installing the stack, **LLM gateway**, **Compass plugin**, green/yellow/red, first conversation, prompt quality 101, **permission system**, first PR. Quests W-0/W-1 + Boss Fight W-B.
- `belts/02-yellow` — 14 modules incl. tool atlas, tool decision tree, **context 101**, **CLAUDE.md primer**, **permissions and hooks**, **LiteLLM & enterprise**, **Figma MCP**, **Slack and GWorkspace MCPs**, bug hunting, debugging loop, PR craft.
- `belts/03-green` — 28 modules in three parts:
  - *a-craft*: three pillars, context windows, CLAUDE.md for a real service, **hierarchical CLAUDE.md**, CLAUDE.local.md, **skills overview**, **writing your first skill**, **subagents**, **worktrees**, **hooks and slash commands**, advanced prompting.
  - *b-practices*: Playwright + Claude Code, **Playwright skill pattern**, tests-seed-spec, **design-to-code**, **Blade deep dive**, **production-compiler skill**, daily loop, design preview platform, **observability with AI**, debugging the hard kind.
  - *c-guardrails*: **redlines**, **LLM proxy**, **PII/PCI/RBI**, **prompt injection**, **pre-ship-check skill**, **blade-compliance skill**, **security-review subagent**.
- `belts/04-black` — 16 modules: **internal MCP server**, **skill-pack publishing**, **Cowork plugin marketplace**, **Agent SDK**, **multi-agent orchestration**, **tool design**, progressive disclosure, **memory systems**, **prompt evals**, **cost and observability**, **effort and routing**, office hours, embedded sprints, **writing an AI RFC**, API council, plugin/skill governance.
- `belts/05-council` — Staff+ layer, invitation-only, with an RFC pipeline and multi-year horizon.
- `appendices/` — A Tool Atlas … N Methodologies, incl. **H1 "Never put this in a prompt"** reference card, CLAUDE.md templates (service / monorepo / local), RFC template, SKILL.md templates (full + minimum), certification policy.

**The seven Claude Code skill definitions (FACT, verbatim from `prologue/12-whats-shipping.md`):**
`playbook-course`, `setup-verify`, `pre-ship-check`, `blade-compliance-reviewer`, `production-compiler`, `design-intel`, `security-review-subagent`.
> Important caveat, **verbatim**: *"They document intended workflows; confirm the current runnable distribution in #ai-help."* — i.e. these are **reference definitions, not shipped runnable skills**. The README repeats this: *"A source definition and a runnable distribution are separate contracts."*

**The stated operating philosophy (FACT, `prologue/07-operating-principles.md`, updated 2026-07-19) — this is the single most useful document for understanding how Razorpay wants engineers to build with AI:**
- **Verbatim thesis:** *"Most AI-coding failures are context failures. The fix isn't a better prompt: it's a knowledge base your AI maintains alongside you, between sessions, between tasks, between teammates."*
- Named philosophy: **knowledge-base-driven development**.
- It explicitly profiles three external frameworks it says converge on the same idea: **gstack** (Garry Tan; specialist roles + GBrain KB-as-MCP + `/learn`), **Get Shit Done / GSD** (TÂCHES; `.planning/` dir, `STATE.md`, subagent "waves", solving "context rot"), and **Karpathy's LLM Wiki** (Apr 2026 gist; `index.md` + append-only `log.md` + `.kb/pages/`; ingest/query/lint; anti-RAG).
- **Verbatim closing principle:** *"Stop letting context evaporate. Compound it."*
- **Verbatim on the human's role:** *"People still decide which source is authoritative, verify contested claims, and adjudicate contradictions. Forgetting to use the KB is one failure mode; confidently compounding a stale claim is worse."*
- Internal analogues named: the **Compass plugin** (a Razorpay-specific KB shipped as Claude Code skills, described as "same shape as gstack's GBrain"), and the **Razorpay Knowledge Base** as "Layer 3 of the Enablement Stack."

**The origin story (FACT, `prologue/02-bd1-bd2-origin.md`, updated 2026-04-26) — a candid internal post-mortem, published publicly:**
- **Builder Day 1:** dozens of non-engineers, Claude Code, a full day. **"Features shipped to staging or production: zero."** The vast majority of the day went to setup debugging (MDM laptop restrictions, missing admin passwords, broken installs).
- **Verbatim retro takeaway:** *"People need working setups BEFORE event day. No exceptions."*
- **Builder Day 2:** same format after three weeks of structured prep + a mandatory setup gate + a colour-coded triage tracker → **"Non-engineers pushed dozens of commits across two days. Multiple pull requests landed in production-adjacent repos same-week."**
- Four named root causes: invisible laptop restrictions; *"'15-minute setup' was fiction"* (real end-to-end is 30–60 min if everything works); wrong mentor:attendee ratio (~1:10 turning into a queue); **no plan B for blocked people** — *"'Blocked' was a dead-end state, not a branch in the flow."*
- **Verbatim principle:** *"setup as Layer 0."*

**INFERENCE:** the ai-playbook tells you exactly what Razorpay's engineering leadership values in an AI builder: **context engineering over prompt cleverness; CLAUDE.md/skills/subagents/hooks as the real craft; evals, cost and routing as senior skills; and guardrails (PII/PCI/RBI, prompt injection, redlines, pre-ship checks) as non-negotiable.** A Buildathon submission that mirrors that vocabulary and shows an audit trail speaks their language natively.

---

## 7. The Buildathon Itself

**Official page:** https://razorpay.com/buildathon/ — "Razorpay AI Buildathon — Build. Show. Get hired." (source class a, scraped verbatim 2026-08-26).

**Framing (verbatim):**
> "Think you can build real AI? Prove it. A student-only program to discover and hire our next generation of AI Builder Interns."
> "Students only. 6 or 12 month AI Builder Internship. In-person, Bangalore, from September."
> "No resume screening. No long application. Four steps: pick a track, build something real, show your work (a public repo, a 5 minute pitch video, the architecture), and if it has signal we call you in."

**Offer (verbatim):** "₹75,000 (monthly stipend) · 6 or 12 (months, your choice) · In-person (Bangalore, from September). Shortlisted builders go straight to a panel. No aptitude test. No group discussion. Your code speaks louder than your resume."

**Application deadline:** **5 September** (2026). *Source: X post by @ajay_2512x, https://x.com/ajay_2512x/status/2090393869473165453, and secondary aggregators (velonx.in, placement-officer.com). The razorpay.com/buildathon/ page text I scraped does **not** itself state the deadline — it may be behind the "Apply now" flow. Treat the 5 Sep date as **secondary-sourced, MEDIUM confidence** and re-verify on the application form.*

**Press:** TipRanks — "Razorpay Hosts AI Buildathon to Deepen Ties With Developer Ecosystem" (403 to WebFetch; headline only). No Razorpay newsroom press release for the Buildathon was found on https://razorpay.com/newsroom/.

### The five tracks — verbatim briefs

**01 — AI Growth & Agentic Commerce.** *"Grow the merchant's revenue, and make them sellable to AI buyers."* Build an agent that grows revenue for a merchant **on Razorpay test-mode APIs**, or that **makes a merchant transactable by an AI buyer end to end**.
- *Why now:* "NPCI's UAP and the global protocol race (ACP, AP2, x402) make agent-to-agent commerce the open problem of the year, and Razorpay's in-app pilots are already live."
- *Example directions:* Conversational in-app checkout, **Agent-readable catalog**, Upsell & cross-sell agent, Campaign orchestrator.
- **The bar (verbatim):** *"Every money action explainable, bounded and gated. Show the audit trail and one failure handled gracefully."*

**02 — AI Risk Manager.** *"Stop the merchant losing money to fraud, returns and chargebacks."* A working detector/verifier/auto-responder for one loss class, with **measured precision and recall on a held-out test set**.
- *Why now:* "AI-enabled fraud is hitting Indian BFSI while returns and chargebacks quietly eat margin."
- *Examples:* Chargeback evidence responder, Return-risk scorer, Fraud-spike detector, Abuse-ring sentinel.
- **The bar:** *"Honest metrics including false-positive cost. Strictly defense-only: anything offense-capable is disqualified."*

**03 — AI Revenue Recovery.** *"Find revenue that's slipping away and win it back."* Detect revenue at risk → determine intervention → execute a **bounded** recovery workflow.
- *Examples:* Payment degradation → root cause → recovery action, Checkout drop-off recovery, Failed-subscription recovery, B2B receivables chaser, Mandate retry sequencer, **Hinglish voice recovery**, Promise-to-pay tracker.
- **The bar:** *"Don't just identify the problem. Show measured money recovered across a batch, with compliant escalation, stopping rules, and an audit trail."*

**04 — AI Finance Controller.** *"Run the books and the cash position."* Close one finance-ops loop across a **50+ record batch of synthetic data**, reporting **match rate** and **unresolved exceptions**.
- *Why now (verbatim, notable):* **"The 2026 builder consensus: verification capacity, not generation speed, is the bottleneck. Reconciliation, settlement and forecasting are still done by hand."**
- *Examples:* Multi-source reconciliation, Settlement Q&A agent, Forward cash forecaster, Tax-line matcher.
- **The bar:** *"Throughput plus measured accuracy plus an honest exception list. One cherry-picked match proves nothing."*

**05 — Open Track.** *"Build what you believe should exist."*
- **The bar:** *"Open doesn't mean easier. Show a real problem, a working product, meaningful use of AI, and evidence that it creates value."*

### INFERENCE — what the rubric actually rewards
Every single track's "bar" demands the same four things: **measured numbers on held-out/batch data, bounded actions, an audit trail, and honest failure/exception reporting.** Not one bar mentions model choice, novelty, or UI. This is a **verification-and-governance rubric wearing an agent costume**, and it lines up exactly with the ai-playbook's Green Belt guardrails section (redlines, pre-ship-check, prompt injection, PII/PCI/RBI) and Black Belt's prompt-evals module.

---

## 8. Evidence Gaps

**Explicitly could not verify (do NOT assert these):**
1. **Razorpay as an AP2 launch partner** — EVIDENCE NOT FOUND. Not in the published 60+ partner list in any retrieved source.
2. **Razorpay as an ACP (OpenAI/Stripe) partner or adopter** — EVIDENCE NOT FOUND.
3. **Any Razorpay x402 involvement** — EVIDENCE NOT FOUND.
4. **Razorpay as a formal NPCI UAP working-group member / named launch partner** — EVIDENCE NOT FOUND. It is NPCI's partner on *agentic pilots built on UPI Reserve Pay/Circle*, which is adjacent but not the same thing. UAP itself is reported as **not yet launched** and **pending RBI approval** (as of Jul 2026 reporting).
5. **A Razorpay AI assistant named "Ray"** — EVIDENCE NOT FOUND. The internal one is **Slash**.
6. **Any AI/agentic claim specific to "Turbo UPI"** — EVIDENCE NOT FOUND in this pass.
7. **A named "Head of AI"** at Razorpay — EVIDENCE NOT FOUND.
8. **A Razorpay newsroom press release for the AI Buildathon** — not present on razorpay.com/newsroom/ as of retrieval.
9. **Buildathon judging panel composition, exact event dates, or submission portal mechanics** — not on the public page.

**Retrieved only as search-engine snippets, not fetched pages (MEDIUM confidence — re-verify before quoting publicly):**
- All X/Twitter quotes (Harshil Mathur, Shashank Kumar) — x.com not fetchable.
- Harshil Mathur's ANI/Tribune FTX'26 quotes.
- Medianama's Sarvam detail: **₹10,000 cap** and **"the merchant bears the liability."** This is the single most strategically loaded unverified claim in this report.
- The 5 September Buildathon application deadline.

**403-blocked sources worth a second attempt with a real browser (camoufox) or once Docker/firecrawl is up:**
business-standard.com, yourstory.com, tipranks.com, the-ken.com, medianama.com, paymentexpert.com, cxotoday.com, x.com.

**Not yet examined but likely high-value:**
- `razorpay/ai-playbook` deep files: `belts/04-black/a-platform/B01-internal-mcp-server.md`, `B04-agent-sdk.md`, `B05-multi-agent-orchestration.md`, `B06-tool-design.md`, `belts/03-green/c-guardrails/*` (redlines, PII/PCI/RBI, prompt injection), `appendices/N-methodologies/*`, and the three actually-present `skills/*/SKILL.md` files (`blade-compliance-reviewer`, `design-intel`, `playbook-course`).
- Razorpay Agent Studio public docs / early-access terms.
- Whether Vulcan is exposed via any API/MCP tool to merchants or only used internally for routing.
