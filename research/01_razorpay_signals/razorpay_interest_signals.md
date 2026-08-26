# Razorpay Interest Signals — Synthesis

**Compiled:** 2026-08-26
**Purpose:** Rank what Razorpay demonstrably cares about, map to the five AI Buildathon tracks, and document the hard API reality that constrains any submission.

**Evidence labels used throughout:** `FACT` = directly stated in a cited source. `INFERENCE` = reasoned from cited facts. `HYPOTHESIS` = plausible, unverified. `EVIDENCE NOT FOUND` = could not verify.

**Method note / limitation:** The local Firecrawl stack was unavailable during this research (Docker daemon not running; `~/.superstack/web/bin/webup` returned `Docker not running — start Docker Desktop`). All web evidence was therefore gathered via WebSearch/WebFetch and the authenticated `gh` CLI. WebFetch summarises pages through a small model, so long enumerations (e.g. full webhook event indexes) may be incomplete rather than absent. Anywhere this matters, it is flagged.

---

## PART A.0 — THE DOMINANT STRATEGIC FACT (read this first)

**Razorpay has already shipped the products the five tracks describe.**

`FACT` — independently verified by fetching `https://razorpay.com/agent-studio/` on 2026-08-26 (and corroborated by a parallel research pass, see `razorpay_product_signals.md`):

**Razorpay Agent Studio** is live, and it is **built on Anthropic's Claude Agent SDK**. Its prebuilt agents:

| Agent Studio agent | What it does (per page) | Hackathon track it pre-empts |
|---|---|---|
| **Dispute Responder** | *"Auto-responds to chargebacks with optimized evidence to maximize dispute win rates"* | **Track 02** |
| **RTO Shield** | Detects high-risk COD orders pre-dispatch using **LLM address validation** | **Track 02** |
| **RTO Insights** | Analyses return patterns across pincodes, products, customers | Track 02 |
| **Subscription Recovery** | Analyses failed subscription payments, smarter retry logic, customer nudges | **Track 03** |
| **Abandoned Cart Conversion** | Identifies abandoned carts, re-engages via WhatsApp/email with offers | **Track 03** |
| **Settlement Insights** | Daily settlement summaries via WhatsApp | **Track 04** |
| **Cashflow Forecaster** | Predicts cash position 3–7 days ahead with alerts | **Track 04** |

Also on the page: *"Customize Prebuilt Agents"* (available now), *"Build from Scratch"* (**Beta**), *"Onboard as AI Partner"* (available now).

The positioning line, verbatim — and it is the best statement of merchant pain Razorpay has published:

> *"Every month, businesses lose revenue not because payments fail, but because no one has time to fix what happens after."*
> *"Agent Studio introduces AI agents that automatically detect these problems and take action on your behalf."*

### What this means (INFERENCE, high confidence)

1. **The five tracks are Razorpay's product roadmap, not an open research brief.** They are recruiting people who can build in an idiom they have already committed to — Claude Agent SDK, bounded agents, post-payment recovery.
2. **A submission that rebuilds Dispute Responder, Subscription Recovery, Abandoned Cart, or Cashflow Forecaster is re-demoing a shipped product** and will be judged against a production baseline it cannot see. This is the single biggest avoidable mistake.
3. **The winnable moves are: extend, verify, or fill a visible gap** — not replicate. Specifically:
   - The **MCP coverage gap** (C.7): no disputes/subscriptions/route/downtime tools on the agent surface, with a tool-generator skill sitting right there.
   - **Track 01's actual wording** — making merchants *sellable to AI buyers*, agent-readable catalogue. Razorpay solved *agent-initiates-payment* (UPI Reserve Pay, In-App Commerce beta); they have **not** solved *merchant-is-machine-readable-to-third-party-agents*. `INFERENCE`: that is the real hole.
   - **Chargeback Shield's stated exclusion** — it covers only fraud reason codes on non-3DS cross-border, explicitly excluding quality/delivery/description disputes, which are the highest-volume category (see `razorpay_product_signals.md`). An auto-responder aimed at the *uncovered* category is additive, not duplicative.
   - **Measurement/verification harnesses** — every track brief asks for numbers on held-out data, bounded actions, and audit trails. `INFERENCE`: verification is undersupplied relative to generation.

---

## PART A — RANKED: WHAT RAZORPAY DEMONSTRABLY CARES ABOUT

Ranked by strength and recency of evidence, not by guesswork.

### 1. Being the AI-agent-accessible payments rail for India — TOP SIGNAL

**Evidence (FACT):** Razorpay ships an **official MCP server**.
- `github.com/razorpay/razorpay-mcp-server` — "Razorpay's Official MCP Server", Go, 229 stars, topics `mcp`/`mcp-server`/`razorpay`, created **2025-04-26**, last updated **2026-08-17**. Source type: GitHub API via `gh`, retrieved 2026-08-26.
- Hosted remote endpoint at **`https://mcp.razorpay.com/mcp`**, run by Razorpay itself. Source: repo README, retrieved 2026-08-26.
- Official docs section exists: `https://razorpay.com/docs/mcp-server/`, `/docs/mcp-server/remote/`, `/docs/mcp-server/faqs/`. Source: WebSearch + WebFetch, retrieved 2026-08-26.
- Docs claim **"35+ tools covering"** payments, orders, payment links, refunds, QR codes, settlements, payouts, and Standard Checkout integration codegen. Source: `razorpay.com/docs/mcp-server/`, retrieved 2026-08-26.

**Why this is the top signal (INFERENCE):** A company does not build, host, document, and continuously maintain an MCP server for 16 months unless agent-accessibility is a strategic bet. The repo is not a demo — it has CODEOWNERS, a test-coverage commit, tool annotations, and a release cadence.

**Sustained investment (FACT)** — commit titles on default branch, `gh api repos/razorpay/razorpay-mcp-server/commits`, retrieved 2026-08-26:
- `2026-03-26` — "feat: add tool generator skill for AI agents (#93)"
- `2026-03-26` — "Rzp7464/feat create registration link (#96)"
- `2026-02-26` — "add agentic_integration tools (#78)"
- `2025-12-30` — "feat: Add tool annotations for improved LLM tool understanding (#73)"
- `2026-01-07` — "feat: add OpenWorldHintAnnotation to tool options (#75)"

`INFERENCE`: "tool annotations for improved LLM tool understanding" and `OpenWorldHintAnnotation` are agent-ergonomics work — Razorpay engineers are actively tuning how well an LLM can *reason over* their tools, not just exposing endpoints. That is a strong statement of intent.

**Leadership endorsement (FACT, second-hand — verify verbatim before quoting):** A post attributed to **Shashank Kumar** (Razorpay co-founder/MD) on X states the Razorpay MCP Server is live and that "Razorpay becomes India's first payment gateway with an Official MCP (Model Context Protocol) Server, designed for an AI-first world." Source: `x.com/shashank_kr/status/1916426439785848867` surfaced via WebSearch, retrieved 2026-08-26. **Caveat:** surfaced as a search result snippet; the post body was not independently fetched. Treat the "India's first" claim as *Razorpay's own positioning*, not verified fact.

---

### 2. AI-native engineering as an org-wide operating model

**Evidence (FACT):** `github.com/razorpay/ai-playbook` — **"Razorpay Org-Wide AI Playbook"**, public, last updated 2026-08-21, published to GitHub Pages at `https://razorpay.github.io/ai-playbook/`. Source: GitHub API + repo README/INDEX.md, retrieved 2026-08-26.

Self-description (FACT, verbatim from README): *"The operating manual for Razorpay's AI builder program. A belt-progression curriculum, seven reusable Claude Code skill definitions, and a Starlight hub — all built on one Markdown source of truth."* Version **v0.61 alpha**, updated 2026-08-13.

Structure (FACT): Foundation → White → Yellow → Green → Black belts → **Staff+ Council**. INDEX.md states belts are *"earned by shipping, not by reading"* and each belt has *"required modules, hands-on quests, and a boss-fight capstone."*

The seven shipped Claude Code skill definitions (FACT, `repos/razorpay/ai-playbook/contents/skills`):
`blade-compliance-reviewer`, `design-intel`, `playbook-course`, `pre-ship-check`, `production-compiler`, `security-review-subagent`, `setup-verify`

Stated influences (FACT, INDEX.md verbatim): *"Drawn from the best patterns of Ramp, Intercom, Shopify, StackBlitz, Zapier, Duolingo, Anthropic's own engineering literature, and our internal Builder Day learnings."*

Tooling named in the playbook (FACT): Claude Code, Claude.ai, **Cowork**, **Compass**, **Slash**, Cursor, Figma MCP, **the Agent SDK**, Blade + Code Connect.

**INFERENCE — high confidence and strategically decisive:** This repo is almost certainly the parent program of the "AI Builder Intern" buildathon. The phrase in the README is literally *"Razorpay's AI builder program."* The judging population is an org that has (a) a formal belt curriculum, (b) opinionated views on what a *good* Claude Code skill looks like, and (c) named artifacts like `pre-ship-check` and `production-compiler`.

**Actionable consequence:** A submission that looks like a well-formed, bounded, guardrailed **agent/skill with a defined output shape** will read as native to this org. A submission that is a chat wrapper will not. The README's own words for what they inspect: *"Understanding how a bounded skill should behave before it is distributed."*

---

### 2b. Agents in their own production loop — "Slash" and "Vulcan"

Two findings from the parallel AI research pass (full sourcing in `razorpay_ai_signals.md`) that belong in any ranking of what Razorpay cares about:

**Slash** — Razorpay's internal autonomous agent platform. `FACT`, blog dated **2026-05-18**, `razorpay.com/blog/razorpay-engineers-built-slash-slash-builds-the-rest/`. Architecture includes a **Slash Reviewer** composed of specialised sub-agents each owning one dimension — *bug detection, security, code quality, Razorpay design system, internationalization, pre-mortem* — where each sub-agent **clones the repo and reads surrounding file context rather than working from the diff alone**. Reached via `@Slash` in Slack, ticket auto-assignment, and a GitHub CI trigger. Over a third of PRs reportedly merged with no human in the loop.

**Vulcan** — `FACT`, joint press release hosted by AWS, **2026-08-18** (eight days before this research): a proprietary transformer **foundation model for payments**, built with NVIDIA and AWS, in production. `INFERENCE` from the release: Vulcan is the *risk and routing* brain; it contains **no mention of agentic commerce**, so the risk model and the agent stack are still separate product lines.

**INFERENCE — three consequences:**
1. Razorpay is far past "should we use AI." Pitching them AI basics will read as naive.
2. The **sub-agent-per-dimension** pattern and the **read-surrounding-context-not-just-the-diff** principle are house style. A submission architected that way speaks their language.
3. `EVIDENCE NOT FOUND` for any Razorpay AI assistant named **"Ray"** — the internal one is **Slash**. Do not use the name "Ray".

### 3. Developer ergonomics and first-class test-mode tooling

**Evidence (FACT):** `github.com/razorpay/razorpay-cli` — "Command-line interface for the Razorpay API", Go, v1.0.9, last updated 2026-08-24. Command groups present in `cmd/` (GitHub API, retrieved 2026-08-26):
`customers`, `disputes`, `documents`, `invoices`, `orders`, `payment-links`, `payments`, `qr-codes`, `refunds`, `route`, `settlements`, `smart-collect`, `subscriptions`

README (FACT) explicitly foregrounds test keys: *"Generate keys from the Razorpay Dashboard — `rzp_test_` for development, `rzp_live_` for production."* The worked example in the README uses `rzp_test_1DP5mmOlF5G5ag`.

**INFERENCE:** Razorpay treats test-mode-first development as the normal path, and has recently (2026) invested in a CLI whose surface *exactly matches* the buildathon tracks — disputes, settlements, subscriptions, refunds, route, smart-collect.

Broad official SDK coverage (FACT): node, php, python, java, go, ruby, .NET, plus mobile wrappers (React Native, Flutter, Cordova, Capacitor) and e-commerce plugins (WooCommerce, Magento, PrestaShop, OpenCart, WHMCS, EDD).

---

### 4. Design-system and frontend craft

**Evidence (FACT):** `razorpay/blade` — *"Design System that powers Razorpay"*, TypeScript, **649 stars** (the org's most-starred repo), updated 2026-08-25.

`FACT`: The ai-playbook has a dedicated skill `blade-compliance-reviewer` and a Green-belt module *"G.15 — Design-to-code: Figma + Blade + Code Connect."*

**INFERENCE:** Blade is not a side project — it is the org's UI standard *and* it has been wired into their AI tooling. A submission with a Blade-consistent or at least visually disciplined UI will land better than an unstyled demo. `HYPOTHESIS`: using Blade itself could be a differentiator, but confirm it is installable publicly before committing.

---

### 5. India-specific financial infrastructure as a public good

**Evidence (FACT):** `razorpay/ifsc` (*"IFSC Codes Repository"*, 393 stars, updated 2026-08-25) and `razorpay/ifsc-api` (standalone API, 88 stars). Also `razorpay/go-financial` (*"A go port of numpy-financial functions and more"*, 317 stars) and `razorpay/i18nify` (*"One stop solution for all your internationalisation needs"*, 28 stars).

**INFERENCE:** Razorpay invests in reusable, correctness-critical financial primitives and publishes them. Money-handling correctness is a cultural value — note `razorpay/go-money` ("Go implementation of Fowler's Money pattern"). A submission that is sloppy about currency subunits, rounding, or reconciliation arithmetic will be noticed.

---

### 6. Reconciliation and settlement as a first-class product concern

**Evidence (FACT):** The **Settlement Reconciliation Report API** (`GET /v1/settlements/recon/combined?year=yyyy&month=mm`) returns *"a list of all transactions such as payments, refunds, transfers and adjustments"* settled in a period, with fields including `entity_id`, `type` (payment/refund/transfer/adjustment), `debit`, `credit`, `amount`, `fee`, `tax`, `currency`, `settled`, `on_hold`, `settled_at`, `posted_at`, `settlement_id`, `settlement_utr`, `payment_id`, `order_id`, `order_receipt`, `dispute_id`, `credit_type`, `method`, `card_network`, `card_issuer`, `card_type`. Source: `razorpay.com/docs/api/settlements/fetch-recon/`, retrieved 2026-08-26.

`FACT`: Default domestic settlement cycle is **T+2 working days**; **Instant Settlements** exist but *"You must request activation from Razorpay's support team"*. Partial settlements occur when live balance is below the scheduled amount. Source: `razorpay.com/docs/payments/settlements/`, retrieved 2026-08-26.

`FACT`: A **"Single Reconciliation View"** product page exists under Optimizer: `razorpay.com/docs/payments/optimizer/reconciliation/`.

**INFERENCE:** `fee` and `tax` broken out per transaction line, plus `dispute_id` linkage, means tax-line matching and dispute-to-settlement tracing are *genuinely computable* from the API — Track 04 is technically well-supported on the data model. But see the test-mode caveat in Part C.

---

### 7. Payment success rate, downtime and failure recovery

**Evidence (FACT):** A dedicated **Payment Downtime API** exists — `razorpay.com/docs/api/payments/downtime/`. Two endpoints (fetch all, fetch by ID). Docs state: *"Downtime is when one or more payment options underperform, leading to considerable delays in payment processing."* Covers *"cards, netbanking and UPI."*

`FACT`: Corresponding webhook events exist — `payment.downtime.started`, `payment.downtime.resolved`, `payment.downtime.updated`. Source: `razorpay.com/docs/webhooks/payloads/payments/`, retrieved 2026-08-26.

`FACT` — an important operational detail Razorpay documents explicitly: *"you may receive a `payment.failed` webhook followed by a `payment.captured` webhook for the same transaction, particularly with UPI payments when customers retry after initial failures."* Source: same page.

**INFERENCE:** Razorpay has productised *failure awareness* as a data feed. Any Track 03 (Revenue Recovery) submission that ignores the downtime feed is leaving Razorpay's own most differentiated signal on the table. The `payment.failed → payment.captured` ordering caveat is also a real correctness trap that a naive recovery agent would fall into — handling it correctly is a cheap credibility win.

`EVIDENCE NOT FOUND` (this session): specific published success-rate percentage benchmarks for Optimizer or smart routing. A parallel research agent covered product marketing pages; see `razorpay_product_signals.md`.

---

### 8. Disputes and chargebacks as a structured, automatable workflow

**Evidence (FACT):** Disputes API has 6 endpoints — Fetch All, Fetch by ID, Fetch by ID (expanded payment), Fetch by ID (expanded settlement), **Accept a Dispute (POST)**, **Contest a Dispute (PATCH)**. Contest is documented as *"Contests a dispute with explanations and supporting documents to submit evidences."* Source: `razorpay.com/docs/api/disputes/`, retrieved 2026-08-26.

`FACT` — full dispute entity (source: `razorpay.com/docs/api/disputes/entity/`, retrieved 2026-08-26):
`id`, `entity`, `payment_id`, `amount`, `currency`, `amount_deducted`, `reason_code`, `reason_description`, **`respond_by`** (Unix deadline), `status`, `phase`, `created_at`, `evidence`

`status` values: `open`, `under_review`, `won`, `lost`, `closed`
`phase` values: `fraud`, `retrieval`, `chargeback`, `pre_arbitration`, `arbitration`

`evidence` sub-fields: `amount`, `summary`, `shipping_proof[]`, `billing_proof[]`, `cancellation_proof[]`, `customer_communication[]`, `proof_of_service[]`, `explanation_letter[]`, `refund_confirmation[]`, `access_activity_log[]`, `refund_cancellation_policy[]`, `term_and_conditions[]`, `others[]`, `submitted_at`

`FACT`: Razorpay's own docs concede the hard part — *"The pre-arbitration and arbitration dispute phases are usually long-drawn, complicated, and challenging."* Source: `razorpay.com/docs/payment-gateway/disputes/`, retrieved 2026-08-26.

**INFERENCE — this is the single most "auto-responder shaped" API Razorpay exposes.** A structured evidence schema with typed document slots, a machine-readable deadline (`respond_by`), a binary accept-vs-contest decision, and a won/lost ground-truth label is *exactly* the shape needed to build a detector/verifier/auto-responder with measurable precision and recall. Track 02 is unusually well-served by the API design.

---

### 9. Subscriptions / recurring revenue and dunning

**Evidence (FACT):** Test mode supports a genuine subscription failure loop. From `razorpay.com/docs/payments/subscriptions/test/` (retrieved 2026-08-26):
- *"In test mode, you can simulate these charges from the Dashboard using the Charge this now button."*
- Successful charge → fires `subscription.charged`
- Failed charge → subscription moves to `pending`, fires `subscription.pending`
- **Failing a charge 4 times exhausts retries → subscription moves to `halted`, fires `subscription.halted`**

**INFERENCE:** Razorpay has modelled a full dunning state machine (`active → pending → halted`) with a defined retry budget of 4. This is directly buildable against in test mode — see Part C, where this turns out to be one of the very few *loss events you can actually manufacture* in a sandbox.

---

### 10. Marketplace / split-payment complexity (Route)

**Evidence (FACT):** Route API has ~22 endpoints covering linked accounts, stakeholders, product configuration, three transfer types (from order, from payment, direct), transfer retrieval by payment/order/settlement/ID, **reversals**, and **settlement hold/release controls** on transfers. Source: `razorpay.com/docs/api/payments/route/`, retrieved 2026-08-26.

`FACT`: Route has its own reporting surface — `razorpay.com/docs/payments/route/view-reports/` — with per-Linked-Account and consolidated reports.

**INFERENCE:** Multi-party settlement is where merchant reconciliation genuinely breaks. `on_hold` transfers plus reversals plus per-linked-account settlement is a real, gnarly finance-ops problem — good Track 04 territory with less competition than plain recon.

---

### 11. Fraud, RTO and COD risk (Magic Checkout)

**Evidence (FACT):** Magic Checkout docs describe **COD Intelligence** which *"uses risk analysis to block high-risk COD orders"*, and RTO reduction strategies including preventing customers with past RTO behaviour from placing COD orders, filtering *"COD orders with gibberish/incomplete addresses"*, charging differential COD fees for medium-risk orders, and disabling COD for high-risk users. Sources: `razorpay.com/docs/payments/magic-checkout/`, `/rto-analytics/overview/`, `/rto-reduction/logistics-partners/`, retrieved 2026-08-26.

`FACT`: Logistics partner integrations named — Shiprocket, Delhivery, iThink Logistics, Unicommerce, ClickPost — to *"fetch order status and provide RTO protection on COD orders."*

`FACT`: Merchant-facing manual review exists — `razorpay.com/docs/payments/magic-checkout/review-cod-orders/`.

**INFERENCE:** Razorpay already has an ML risk product here. Building "an RTO risk scorer" competes head-on with a shipped Razorpay product and will be judged against their internal baseline — a risky play. Building the *review/decisioning/appeal layer around it* (the manual-review queue is documented as manual) is the softer, more winnable target.

---

### 11b. Cost efficiency as the dominant engineering value

`FACT`, from the engineering blog corpus (full sourcing in `razorpay_engineering_signals.md` §4a): Razorpay's most-repeated public engineering achievements are **dollars saved**, not throughput — ~**$2M/year** off the data platform, ~**$300,000/year** off Kubernetes, **62%** off metrics ingestion (450B → 170B samples/day), **>60%** off Trino infrastructure, **80%** of 10,000+ daily CI jobs moved to spot instances at 99.2% job success.

Agent-specific efficiency results they have published:
- **Bumblebee** (merchant fraud review, 2025-12-17): pre-automation load of **20,000 alerts / 12,000 merchant reviews / 8,500 human hours per month**; success rate 88% → **99%+**; eval time 35s → **8–12s**; token usage **−60%**.
- **Security triage** (2026-06-09): ~7–8 of every 10 SAST alerts were false positives; **750 hours → 2 hours**; L1 accuracy 75–80%.
- **On-call** (2026-04-29): **15–20 incidents weekly**, MTTI 20–40 min each = 6–8 engineer-hours/week.

**INFERENCE — directly actionable for a submission.** Razorpay's own house metric for an AI system is *human hours removed and cost per unit of work*, reported alongside an accuracy number and a false-positive cost. That is exactly the shape of the Buildathon rubric. A submission that reports **throughput + accuracy + false-positive cost + hours saved** is speaking their native evaluation language. One that reports only a demo is not.

`FACT`: they also publish failure honestly — the Bumblebee post states *"We threw away two complete implementations"*, and the 2021 outage post narrates *"a moment of panic and chaos"* with 45 minutes of no root cause. `INFERENCE`: an honest limitations section will be read as credibility, not weakness.

### 11c. Agents on internal toil — and the boundary they have now crossed

`FACT`: nine of eleven 2026 engineering-blog posts are LLM/agent systems, all aimed at internal engineering toil (on-call investigation, RCA drafting, security triage, fraud review, and **Hermes** — 220 per-employee agents, ~84 daily active, one instance logging 15,039 sessions in 8 weeks, 98 self-taught skills).

`INFERENCE`, and worth stating plainly: **the engineering blog alone gives a misleading picture.** It suggests Razorpay applies agents only to internal workflow, never to the money path. That reading is contradicted by Agent Studio (Part A.0), which is merchant-facing and on the money path. The two stories are told on different surfaces — engineering blog vs product/press. Any research that reads only one surface will draw the wrong conclusion.

### 12. Reliability and scale engineering culture

**Evidence (FACT, org-repo based):** `razorpay/devstack` (*"Razorpay DevX cloud on laptop solution"*, Go, 133 stars), `razorpay/metro` (*"The Service Bus!"*, Go, 56 stars), `razorpay/trino-gateway` (*"Traffic routing for Trino Clusters"*, Python, 31 stars), `razorpay/thirdeye` (real-time time-series monitoring + RCA, Java), `razorpay/alohomora` (*"razorpay's secret distribution system"*), `razorpay/bhadra` (*"Vulnerability Management Platform"*), `razorpay/concierge` (AWS security-group access control), Kubernetes tooling (`imagepullsecret-patcher`, `kubestash`, `etcd-backup`).

**INFERENCE:** Go for new services; a **PHP/Laravel monolith still present** alongside "thousands of microservices"; Python for data; TypeScript for frontend. **Kubernetes in production since late 2016.** Kong/Istio/Traefik/Spinnaker/Terraform; Trino + Alluxio + Databricks + Kafka + Flink + Delta on S3; a documented Prometheus → Thanos → VictoriaMetrics → managed-platform observability arc.

**⚠ DO NOT QUOTE THESE — `EVIDENCE NOT FOUND` after active search** (full list in `razorpay_engineering_signals.md` §4c/§8):
- **Payment-gateway TPS or peak throughput of any kind.** The only TPS figure in the entire corpus is a 2022 *notifications* subsystem (2K ceiling / 1K peak) — **it is not payments throughput and must not be presented as such.**
- **IPL / Diwali / Big Billion Days peak traffic numbers.** Named as load drivers; no figures attached.
- **Uptime SLA / "five nines" / 99.99%.** No numeric availability commitment found. The nearest number is a *dashboard UI* crash-free-sessions metric (~99.9X%), not API uptime.
- **Public incident postmortems.** `status.razorpay.com` shows live status and a 90-day strip, but RCAs are described as internal artefacts.
- **Chaos engineering.** No fault-injection or game-day material exists; the adjacent published work is shadow-traffic analysis and perf testing.
- **Published prior art on ledger design, reconciliation, idempotency, or payment-routing architecture.** `HYPOTHESIS`: treated as competitively sensitive (routing is a paid product — Optimizer). **Do not assume published Razorpay prior art exists on these; a plan that relies on it is building on nothing.**

`FACT` — repo-health caution: **do not judge Razorpay OSS by `pushed_at`.** A fleet-wide bot pattern makes dormant repos look alive. `metro` and `devstack` are effectively dead since 2022 despite 2026 push dates. Genuinely active: **blade**, **ifsc**, **i18nify**, **razorpay-cli**, **razorpay-mcp-server**, **trino-gateway**. `thirdeye` is a **fork** of `project-thirdeye/thirdeye`, not Razorpay work.

---

## PART B — TRACK MAPPING

| Track | Razorpay evidence supporting it | API/data availability in test mode | Already shipped by Razorpay? | Verdict |
|---|---|---|---|---|
| **01 — AI Growth & Agentic Commerce** | Official MCP server + hosted `mcp.razorpay.com/mcp` + `agentic_integration` tools + docs + Agentic Payments page (UPI Reserve Pay **live**, In-App Commerce **beta**, UPI Circle **coming soon**) | **Strong.** MCP explicitly supports `rzp_test_` keys (C.1) | **Partly.** Agent-*initiated payment* is solved. **Agent-readable merchant catalogue is not.** | **Best strategic alignment IF you attack the unsolved half — sell-side agent-readability, not conversational checkout** |
| **02 — AI Risk Manager** | Disputes API with accept/contest + typed evidence schema + `respond_by` + won/lost labels; Magic Checkout COD/RTO engine | Dispute creation in test mode unverified (C.4), but brief asks only for a **held-out test set** (C.2b) — synthetic corpus is acceptable | **Yes — Dispute Responder + RTO Shield are live in Agent Studio** | **Best API *shape* for precision/recall claims, but head-on collision with a shipped agent. Viable mainly via the uncovered non-fraud dispute categories Chargeback Shield excludes** |
| **03 — AI Revenue Recovery** | Downtime API + downtime webhooks + `payment.failed`→`payment.captured` semantics + subscription `pending`/`halted` dunning machine; richest published pain data (see product file) | **Strongest of any track.** Subscription failure is the one loss event genuinely manufacturable in test mode (C.3) | **Yes — Subscription Recovery + Abandoned Cart are live** | **Best demonstrability; worst duplication risk. Differentiate on measurement/verification, not on the agent itself** |
| **04 — AI Finance Controller** | Settlement recon API with `fee`/`tax`/`dispute_id` lines; Route reversals + on-hold; T+2; Smart Collect 2.0; ₹8.1T MSME receivables pain | Settlements don't occur in test mode (C.2) — **but the brief explicitly asks for a "50+ record batch of synthetic data" (C.2b), so this is not a blocker** | **Yes — Settlement Insights + Cashflow Forecaster are live** | **Underrated. Sandbox gap is pre-authorised by the rubric; the brief's own line — "verification capacity, not generation speed, is the bottleneck" — is the thesis. Differentiate via Route multi-party recon or tax-line matching** |
| **05 — Open Track** | ai-playbook belt program, MCP tool-gen skill, Blade, developer tooling, financial primitives | N/A | The MCP **coverage gap** is explicitly unshipped | **Underrated. The MCP disputes/subscriptions tool contribution lives naturally here or in 02/03** |

---

## PART C — API SURFACE REALITY CHECK

**This section is the load-bearing one.** Track 01 explicitly requires building "on Razorpay test-mode APIs." Getting this wrong invalidates a submission. Every item below is sourced; unverified items are marked plainly.

### C.0 The baseline claim, and why it is misleading

`FACT`: Razorpay's own docs state — *"Both modes provide the same functionalities, except that real payments cannot be accepted in Test mode."* and *"You have to generate a separate set of API keys for Live and Test modes."* Source: `razorpay.com/docs/payments/dashboard/test-live-modes/`, retrieved 2026-08-26.

**Do not take this at face value.** The page references a comparison table that was not retrievable in the fetched content, and multiple documented and user-reported behaviours below contradict the "same functionalities" framing. `INFERENCE`: the sentence is marketing-adjacent, not a technical contract.

### C.1 CONFIRMED WORKING in test mode

| Capability | Evidence | Source |
|---|---|---|
| **Razorpay MCP Server with test keys** | Docs FAQ states verbatim: *"For test mode, use test environment API keys (starting with `rzp_test_`)"*, and the server **auto-detects environment from the key**. | `razorpay.com/docs/mcp-server/faqs/`, 2026-08-26 |
| Orders — create/fetch/update/fetch-payments | Standard; `razorpay-cli` README shows a live `orders create` returning `order_RB58MiP5SPFYyM` with a `rzp_test_` key | `github.com/razorpay/razorpay-cli` README, 2026-08-26 |
| Payments — simulated success/failure | Mock bank page with **Success** and **Failure** buttons; test cards; UPI `success@razorpay` | `razorpay.com/docs/payments/payments/faqs/`, 2026-08-26 |
| **Subscriptions — full dunning loop** | Dashboard "Charge this now"; success → `subscription.charged`; failure → `pending` + `subscription.pending`; **4 failures → `halted` + `subscription.halted`** | `razorpay.com/docs/payments/subscriptions/test/`, 2026-08-26 |
| Smart Collect — test payments | Dashboard: select Customer Identifier → "Make a Test Payment" | `razorpay.com/docs/payments/smart-collect/test-payments/`, `/docs/smart-collect/testing/`, 2026-08-26 |
| Route — test API keys supported | Docs direct users to fork the Razorpay Postman workspace using Test API Keys | `razorpay.com/docs/api/payments/route/`, 2026-08-26 |
| Webhooks — separate test/live URLs | Dashboard supports distinct webhook endpoints per mode | via WebSearch of Razorpay docs, 2026-08-26 |
| **RazorpayX payouts — with dummy balance** | *"Test Mode has its own dummy balance. No real money is used in the Test Mode."* Contacts/fund accounts/payouts fully creatable. | `razorpay.com/docs/razorpayx/test-mode/`, 2026-08-26 |
| Payment Links, QR Codes, Invoices, Customers, Tokens | Present in `razorpay-cli` command surface and MCP tool list, both test-key-driven | `razorpay-cli` `cmd/`; MCP README, 2026-08-26 |

### C.2 CONFIRMED / STRONGLY INDICATED **NOT** WORKING in test mode

| Gap | Evidence | Confidence |
|---|---|---|
| **Real settlements do not occur** | `EVIDENCE NOT FOUND` in Razorpay's own docs — the settlements page and FAQs contain **no** test-mode section. Third-party sources state test transactions *"won't appear in real settlement reports"* and that test keys mean nothing is *"captured or settled."* | **HIGH that settlements don't occur; MEDIUM on exact API behaviour.** `HYPOTHESIS`: `/v1/settlements` and `/v1/settlements/recon/combined` return empty arrays with test keys. **This is unverified and must be tested with real test keys before any Track 04 submission depends on it.** |
| **RazorpayX Approval Workflow absent** | Docs state verbatim: *"The **Approval Workflow** is not available in the test mode. This means the `pending` and `rejected` states are not available."* | **FACT** |
| **RazorpayX payouts do not auto-progress** | Docs: payouts default to `processing` (or `queued`); *"From the `processing` state, you will have to manually move the payout to the next state from the Dashboard."* Corroborated by unresolved user report: razorpay-java issue #313, "Payout Status Remains 'Processing' in Test Mode". | **FACT (docs) + corroborating user report** |
| **Test and live data are fully isolated** | *"Contacts, Fund accounts and Payouts created in the Test Mode do not appear in the live environment"* and vice versa. | **FACT** |
| **Test-mode card tokens expire in 3 days** | *"In test mode, you can perform a subsequent debit only within 3 days of token creation, as card tokens are valid for 3 days only."* | **FACT** — a real trap for any long-horizon subscription demo |
| **Subscription update blocked after test charges** | *"You cannot test the update subscription feature if any test charges (beyond the initial authentication payment) have been made."* | **FACT** |
| **No time fast-forward** | No capability to skip to future billing cycles; each charge must be manually triggered. | **FACT** |

### C.2b IMPORTANT RECONCILIATION — the organisers already expect synthetic data

Before treating the test-mode gaps above as disqualifying, note what the track briefs actually ask for (`FACT`, verbatim from `razorpay.com/buildathon/`, retrieved 2026-08-26 — full text in `razorpay_ai_signals.md` §7):

- **Track 04** asks you to close a finance-ops loop across a **"50+ record batch of synthetic data"**, reporting **match rate** and **unresolved exceptions**.
- **Track 02** asks for **"measured precision and recall on a held-out test set"** — it does not require the data be live.
- **Track 03** asks for **"measured money recovered across a batch"**.
- Only **Track 01** names test-mode APIs explicitly: build *"on Razorpay test-mode APIs"*.

**INFERENCE — this materially softens the C.2 blocker.** Razorpay knows settlements and disputes cannot be manufactured in a sandbox. The rubric is built around *batches* and *held-out sets*, not live money. So:

- The test-mode gaps are **not** a reason to avoid Tracks 02 and 04.
- They **are** a reason to be explicit and honest about data provenance — which the rubric rewards (*"an honest exception list"*, *"honest metrics including false-positive cost"*).
- **Track 01 is the one place where test-mode API fluency is non-negotiable**, and happily it is also the best-supported (C.1: MCP + `rzp_test_` keys confirmed).

`INFERENCE`: the strongest hybrid is a submission that uses **real test-mode APIs for the action/execution path** (where Razorpay can see you actually integrated) and **synthetic batches for the measurement path** (where volume is needed for credible precision/recall). Stating that split openly is a feature, not an apology.

### C.3 The most important asymmetry for track choice

`INFERENCE`, and it is the sharpest finding in this document:

**Test mode lets you manufacture *subscription* failure events, but not *settlement* events and (probably) not *dispute* events.**

- Subscription failure → `pending` → `halted` is a **documented, dashboard-triggerable, webhook-emitting** loss event.
- Settlement lines require live money movement.
- Disputes originate from issuing banks — there is no documented way to conjure one in a sandbox.

**Consequence:** Track 03 (Revenue Recovery) is the only track where a live end-to-end demo can show a *real loss event occurring and being recovered*, entirely on test-mode APIs, with real webhooks firing. Tracks 02 and 04 will require synthetic/seeded data for the interesting half of the story.

### C.4 Disputes in test mode — the honest answer

`EVIDENCE NOT FOUND.` Razorpay's disputes documentation (`/docs/payment-gateway/disputes/`, `/docs/api/disputes/`, `/docs/api/disputes/entity/`) contains **zero mentions of test mode**. A general web search surfaced an unsourced claim that disputes/chargebacks can be created from the Dashboard, but this could not be confirmed against Razorpay documentation and **should not be relied upon.**

**Required action before committing to Track 02:** log into a Razorpay test dashboard and check whether a dispute can be created. If it cannot, any Track 02 submission must seed its own dispute corpus — which is defensible if stated openly, since the *decision logic* (accept vs contest, evidence selection, deadline triage) is the actual contribution and can be evaluated on a labelled synthetic set with real precision/recall numbers.

### C.5 Remote MCP server tool restrictions — a concrete gotcha

`FACT` (from the repo README's per-tool "Remote Server Support" column, retrieved 2026-08-26). These tools are marked **not supported on the remote server** and require running the **local** MCP server:

- `create_refund`
- `close_qr_code`
- `create_instant_settlement`
- `create_registration_link`

All other listed tools are supported remotely. `INFERENCE`: Razorpay gates money-moving and irreversible operations off the hosted endpoint. **If a submission needs programmatic refunds — which a Revenue Recovery or Risk agent plausibly does — it must run the local Docker MCP server (`razorpay/mcp` on Docker Hub), not `mcp.razorpay.com/mcp`.** Plan the demo environment accordingly.

`FACT`: Endpoint migration — `https://mcp.razorpay.com/sse` was deprecated effective **2025-08-13**, replaced by `https://mcp.razorpay.com/mcp` with streamable HTTP. Use the `/mcp` endpoint.

`FACT`: Remote auth is HTTP Basic with `base64(key_id:key_secret)`. Local auth uses `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` env vars directly.

### C.6 Full MCP tool inventory (verbatim from README, 2026-08-26)

Grouped by domain. `[LOCAL ONLY]` marks tools unsupported on the remote server.

- **Payments (8):** `capture_payment`, `fetch_payment`, `fetch_payment_card_details`, `fetch_all_payments`, `update_payment`, `initiate_payment`, `resend_otp`, `submit_otp`
- **Payment Links (6):** `create_payment_link`, `create_payment_link_upi`, `fetch_all_payment_links`, `fetch_payment_link`, `send_payment_link`, `update_payment_link`
- **Orders (5):** `create_order`, `fetch_order`, `fetch_all_orders`, `update_order`, `fetch_order_payments`
- **Refunds (6):** `create_refund` `[LOCAL ONLY]`, `fetch_refund`, `fetch_all_refunds`, `update_refund`, `fetch_multiple_refunds_for_payment`, `fetch_specific_refund_for_payment`
- **QR Codes (7):** `create_qr_code`, `fetch_qr_code`, `fetch_all_qr_codes`, `fetch_qr_codes_by_customer_id`, `fetch_qr_codes_by_payment_id`, `fetch_payments_for_qr_code`, `close_qr_code` `[LOCAL ONLY]`
- **Settlements (6):** `fetch_all_settlements`, `fetch_settlement_with_id`, **`fetch_settlement_recon_details`**, `create_instant_settlement` `[LOCAL ONLY]`, `fetch_all_instant_settlements`, `fetch_instant_settlement_with_id`
- **Payouts (2):** `fetch_all_payouts`, `fetch_payout_by_id`
- **Tokens (2):** `fetch_tokens`, `revoke_token`
- **Registration Links (1):** `create_registration_link` `[LOCAL ONLY]`
- **Integration helpers (2):** `detect_stack`, `integrate_razorpay_checkout`

### C.7 What the MCP server does **NOT** cover — the gap that is also an opportunity

`FACT` — by inspection of the tool table above, the MCP server exposes **no tools** for:

- **Disputes** (no fetch/accept/contest) — despite the REST API and the CLI both supporting them
- **Subscriptions / Plans** (only `create_registration_link`)
- **Route / transfers / reversals**
- **Smart Collect / virtual accounts**
- **Invoices**
- **Customers**
- **Payment Downtime**
- **Reports**

**INFERENCE — strategically significant.** Razorpay's REST API and `razorpay-cli` both cover disputes, subscriptions, route and smart-collect, but the MCP server does not. There is a visible, self-evident gap between what Razorpay's agent surface exposes and what its own API supports.

**HYPOTHESIS (flagged as such, but worth serious weight):** Contributing tools that close this gap — a disputes tool set, a subscriptions/dunning tool set, a downtime tool — is the most legible possible demonstration of "I understand your platform and moved it forward." It is buildable, verifiable, and maps cleanly onto Tracks 02 and 03.

**And Razorpay has already built the on-ramp for exactly this.** `FACT`, retrieved 2026-08-26 via `gh`: the MCP server repo contains a Claude Code skill at **`.claude/skills/razorpay-mcp-tool-gen/SKILL.md`** (added in commit #93, "feat: add tool generator skill for AI agents", 2026-03-26). Its own description:

> *"Generate Razorpay MCP server tool implementations from API documentation URLs, curl commands, or request/response examples. Produces Go tool code, unit tests, registration, and README updates."*

Its documented 9-step workflow ends at **"Step 9: Create branch, commit, and open PR (if gh available)."** It specifies a parameter-to-validator mapping table, tool naming conventions (`fetch_{resource}`, `fetch_all_{resources}`, `create_{resource}`, `update_{resource}`), file placement in `pkg/razorpay/{resource_type}.go`, and registration in `pkg/razorpay/tools.go`.

`FACT`: the repo also ships `AGENTS.md` ("instructions for AI coding agents working on this repository"), a `.cursor` directory, `.agents`, and `CONTRIBUTING.md` which states verbatim: *"We use Cursor to contribute - our AI developer."* House style: 80-char lines, `goimports` with local prefix, `make test/fmt/lint/build`, branch `username/feature`, commits `[type]: description`.

**INFERENCE — this substantially de-risks the C.7 play.** Razorpay has published a skill whose explicit purpose is to let an AI agent generate new MCP tools and open a PR. Using their own tool-generator skill to close their own coverage gap (e.g. disputes) is a near-perfect fit with the ai-playbook's belt philosophy ("earned by shipping"). It is also *checkable* — the linter and test suite are the acceptance criteria.

### C.8 Known test-mode friction — user-reported, unresolved

These are **open, unresolved GitHub issues** in Razorpay's own repos. `FACT` that the issue exists and is open; the underlying cause is **not** verified and several may be user error. Treat as risk-register items to test early, not as established platform defects. All retrieved 2026-08-26 via `gh`.

| Issue | Repo | Opened | Status |
|---|---|---|---|
| "Automatic Capture does not work in test mode" — *"I've to manually capture payments in test mode even after automatic capture is enabled."* | razorpay-ruby #259 | 2025-07-22 | open, 0 comments |
| "Getting error while initiating refund in test mode" — `BAD_REQUEST_ERROR / invalid request sent` on a captured payment | razorpay-node #438 | 2025-04-03 | open, 3 comments |
| "Webhook Failing Due to Missing `X-Razorpay-Signature` Header (Test Mode)" | razorpay-node #453 | 2025-07-07 | open, 1 comment |
| "Payout Status Remains 'Processing' in Test Mode" | razorpay-java #313 | 2024-03-19 | open — **note: this is documented intended behaviour**, see C.2 |
| "Could not create customer identifier for test environment" — 404 on `/v1/virtual_accounts` | razorpay-java #305 | 2024-02-28 | open, 0 comments |
| "seller does not support recurring payments ... in test mode" | razorpay-ruby #269 | 2026-05-27 | open |

**Actionable consequence:** budget time on day one to independently verify, with real test keys: (1) auto-capture, (2) refund creation, (3) webhook signature delivery, (4) virtual account creation. Do not discover these on demo day.

### C.9 Reports — a structural limitation

`FACT`: Report generation is a **Dashboard** function, not a general REST API. Docs: navigate to Reports → select type/period/format → Generate. Formats CSV/XLSX/XLS. *"It can take a few minutes to a couple of hours to generate a report depending on the data size."* Concurrency limit: *"a maximum of 3 reports at the same time."* Source: `razorpay.com/docs/payments/dashboard/reports/`, retrieved 2026-08-26.

**INFERENCE:** For a Track 04 agent, the programmatic reconciliation entry point is `fetch_settlement_recon_details` / `GET /v1/settlements/recon/combined` — **not** the Reports feature. Do not architect around Reports; it is human-in-the-loop, slow, and rate-limited.

### C.10 API surface confirmed to exist (REST reference index)

`FACT`, from `razorpay.com/docs/api/`, retrieved 2026-08-26:

**Payments:** Orders, Payments, **Downtime**, Settlements, Instant Settlements, Refunds, **Disputes**, Documents, Customers, Payment Links, QR Codes, Invoices, Subscriptions, Route, Smart Collect
**Bills:** About, Entity, Create, Update, Delete
**Partners:** Account onboarding, Product Configuration, Stakeholder, Upload Document, Webhooks
**Payout APIs:** Contacts, Fund Accounts, Payouts, Payout Links, Transactions

`FACT`: Webhook events confirmed on the payments payload page — `payment.authorized`, `payment.captured`, `payment.failed`, `payment.downtime.started`, `payment.downtime.resolved`, `payment.downtime.updated`, `order.paid`. Subscription events confirmed from the subscriptions test page — `subscription.charged`, `subscription.pending`, `subscription.halted`.

`EVIDENCE NOT FOUND`: a complete, verified index of **all** webhook events across every product. `razorpay.com/docs/webhooks/supported-events/` returned HTTP 404. The full list exists somewhere in the webhooks docs tree but was not located this session. **Verify dispute and settlement webhook event names directly before designing around them.**

### C.11 Webhook testing mechanics — practical constraints that will bite

All `FACT`, from `razorpay.com/docs/webhooks/validate-test/`, retrieved 2026-08-26:

- **There is no Dashboard webhook simulator.** Webhooks fire only from actual transactions conducted in Test mode. You cannot hand-trigger an arbitrary event. (This reinforces C.3: the subscription "Charge this now" button is one of the very few *event generators* available.)
- **Common tunnel/interceptor domains are blacklisted** for security — RequestBin, Webhook.site, Beeceptor, and **`ngrok.io`** among them. Razorpay's docs recommend **`zrok`** to create a tunnel instead. `INFERENCE`: a demo that assumes ngrok will fail silently. Plan the tunnel early.
- **Test-mode webhook setup requires a default OTP: `754081`.**
- **Signature verification:** HMAC-SHA256, webhook secret as key, **raw request body** as message. Docs warn explicitly not to parse or cast the body before verifying. All official SDKs ship a verification helper.
- **Idempotency:** duplicate webhooks do occur; de-duplicate on the `x-razorpay-event-id` header.
- Test payloads have the **same structure** as live events.

`INFERENCE`: taken together with the documented `payment.failed` → `payment.captured` ordering quirk (Part A §7), Razorpay's webhook layer is at-least-once and out-of-order. A submission whose event handling is idempotent and order-tolerant demonstrates real platform literacy; one that assumes exactly-once, in-order delivery is quietly wrong in a way Razorpay engineers will spot immediately.

`EVIDENCE NOT FOUND`: the complete webhook event index. A "List of Webhook Events" page is referenced in the webhooks nav, but `/docs/webhooks/supported-events/`, `/docs/webhooks/events/` and `/docs/webhooks/payloads/` all failed to yield it (two 404s and one non-enumerating page). Confirmed event names remain limited to those in C.10.

---

## PART D — OPEN QUESTIONS TO RESOLVE BEFORE COMMITTING

1. **Can a dispute be created in test mode?** (blocks Track 02 demo realism) — resolve by logging into a test dashboard.
2. **Do `/v1/settlements` and `/v1/settlements/recon/combined` return anything with `rzp_test_` keys?** (blocks Track 04) — resolve with a single curl.
3. **What is the complete webhook event list**, specifically `dispute.*` and `settlement.*` event names? — `/docs/webhooks/supported-events/` is 404; find the live path.
4. **Is `razorpay/blade` publicly installable** and usable outside Razorpay's internal stack?
5. **Do the four remote-MCP-restricted tools work on the local Docker server with test keys?** — verify `create_refund` specifically.
6. ~~**What exactly are the "in-app pilots"?**~~ **RESOLVED** — see `razorpay_ai_signals.md`. In-app agentic checkout in beta with named merchants; `razorpay.com/agentic-payments/` marks In-App Commerce **beta**, UPI Reserve Pay **live**, UPI Circle **coming soon**.
7. **Confirm the application deadline.** Secondary sources indicate **5 September 2026**, but the buildathon page text itself does not state it (MEDIUM confidence). **Verify on the application form — this is time-critical.**
8. **Does `zrok` (Razorpay's recommended tunnel) work in your environment?** ngrok.io, webhook.site, RequestBin and Beeceptor are blacklisted (C.11). Test before demo day.

---

## PART E — RECOMMENDATION

`INFERENCE` throughout this section. Reasoning is shown so it can be challenged.

### The rubric is the real signal

Every track's stated bar demands the same four things and **none of them mention model choice, novelty, or UI**:
1. Measured numbers on held-out or batch data
2. Bounded, gated actions
3. An audit trail
4. Honest failure / exception reporting

Track 04 states the thesis outright: *"verification capacity, not generation speed, is the bottleneck."* Track 01 says *"Every money action explainable, bounded and gated. Show the audit trail and one failure handled gracefully."* Track 02 disqualifies anything offense-capable.

**This is a verification-and-governance rubric wearing an agent costume.** It aligns exactly with the ai-playbook's Green Belt guardrails material and the `pre-ship-check` / `security-review-subagent` skills. Optimise for *provable, bounded, auditable* — not for scope.

### Which track is most winnable

Ranked, with the reasoning that matters:

**1. Track 01, attacking the sell-side gap.** Razorpay has solved agent-*initiates*-payment (UPI Reserve Pay live, In-App Commerce beta, MCP shipped). It has **not** publicly solved *merchant-is-machine-readable-to-third-party-agents* — which is precisely what the brief's own example direction **"Agent-readable catalog"** and the phrase *"make them sellable to AI buyers"* point at. It is also the only track where test-mode APIs are mandated, and the only one where the required infrastructure (MCP + `rzp_test_` keys) is confirmed working. Crowding risk is real, but most entrants will build conversational checkout — i.e. re-demo the beta. Going sell-side sidesteps them.

**2. Track 05 / the MCP coverage gap.** Razorpay's own agent surface has no disputes, subscriptions, Route, Smart Collect, or downtime tools, while its REST API and CLI cover all of them. Razorpay ships a Claude Code skill (`razorpay-mcp-tool-gen`) whose entire purpose is generating such tools and opening a PR. Closing that gap is small, verifiable (their linter + tests are the acceptance criteria), and is the single most legible "I understand and improved your platform" artifact available. Weakness: on its own it is a contribution, not a product — best used *alongside* a track submission rather than instead of one.

**3. Track 03, differentiated on measurement.** Best demonstrability of any track — subscription failure is the one loss event you can genuinely manufacture in test mode with real webhooks firing (C.3). Richest published pain data. But Subscription Recovery and Abandoned Cart are **already shipped**. Only worth it if the contribution is the *evaluation harness* — measured money recovered across a batch, stopping rules, compliant escalation — rather than the recovery agent itself.

**4. Track 04.** Genuinely underrated. The sandbox gap is pre-authorised by the rubric (C.2b), competition will be thinner, and Route multi-party reconciliation (on-hold transfers, reversals, per-linked-account settlement) is a real, hard, un-shipped problem. Weakness: Settlement Insights and Cashflow Forecaster already exist.

**5. Track 02.** Best-shaped API in the whole platform for a precision/recall story — typed evidence slots, machine-readable `respond_by`, won/lost ground truth. But Dispute Responder is shipped and it is the most obvious idea in the track. Only take it with the non-fraud dispute angle (the categories Chargeback Shield explicitly excludes).

### Three things that would sink a submission

1. **Rebuilding an Agent Studio prebuilt agent.** Judged against a production baseline you cannot see.
2. **Assuming exactly-once, in-order webhooks.** Razorpay documents at-least-once delivery, `x-razorpay-event-id` de-duplication, and a `payment.failed` → `payment.captured` ordering quirk. Getting this right is cheap credibility; getting it wrong is a visible tell.
3. **Discovering test-mode friction on demo day.** Auto-capture, refunds, webhook signatures, virtual accounts and the ngrok blacklist all have open reports or documented gotchas (C.8, C.11). Verify all of them in the first session.
