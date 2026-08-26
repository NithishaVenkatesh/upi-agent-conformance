# Agentic Commerce: What Breaks When AI Agents Transact — Evidence Pack

**Compiled:** 2026-08-26 · **All retrieval dates: 2026-08-26**

**Labelling:** `[FACT]` fetched & read · `[FACT — SECONDARY]` · `[UNVERIFIED FETCH]` search synthesis, page not openable — **lead, not citation** · `[INFERENCE]` working shown · `[HYPOTHESIS]` · `⚠️ VENDOR`.

> **Note on evidence type.** This area is ~18 months old, so there is very little *measured* data and a great deal of *protocol specification*. That is actually favourable: protocol specs are primary sources, they are precise, and they state the problems explicitly in the words of Google, Visa and Mastercard. **The strongest evidence here is what the networks themselves say is broken** — not market-size projections, which at this stage are all guesses.

---

## 1. The problem, in Google's own words — PRIMARY, fetched

**Source: Google Cloud Blog, "Announcing Agent Payments Protocol (AP2)", 17 September 2025.** Fetched directly. `[FACT]`

Google frames agentic payments as three unanswered questions. These are the cleanest statement of the problem available from any source:

| Problem | Google's framing |
|---|---|
| **Authorization** | "Proving that a user gave an agent the specific authority to make a particular purchase." |
| **Authenticity** | "Enabling a merchant to be sure that an agent's request accurately reflects the user's true intent." |
| **Accountability** | "Determining accountability if a fraudulent or incorrect transaction occurs." |

**AP2's answer — verifiable Mandates:** `[FACT]`
- **Intent Mandate** — captures the user's initial request and provides auditable context for the whole interaction. For *delegated* (human-not-present) tasks it specifies the rules of engagement, including **price limits and conditions**.
- **Cart Mandate** — created once the agent presents specific items; "creates a secure, unchangeable record of the exact items and price."

**Launch coalition:** **more than 60 organisations**, including Adyen, American Express, Ant International, Coinbase, Etsy, Forter, Intuit, JCB, Mastercard, Mysten Labs, PayPal, Revolut, Salesforce, ServiceNow, UnionPay International, Worldpay. `[FACT]`

> **`[INFERENCE]` The single most important structural fact here:** the entire agentic-payments stack is being built around **cryptographically signed statements of intent that are separate from the payment instrument**. That means the artefact that resolves a dispute is no longer "did the cardholder authorise this card" but "does this Cart Mandate match this Intent Mandate, and did the agent stay inside the stated limits and conditions." **Dispute resolution becomes a document-comparison problem over structured mandates** — which is tractable, and which nobody has built the merchant-side tooling for yet.

---

## 2. The competing/adjacent protocols

`[FACT — SECONDARY]` — dates and mechanics corroborated across multiple reports; individual pages not fetched.

| Standard | Owner | Announced | Mechanism |
|---|---|---|---|
| **Agent Payments Protocol (AP2)** | Google | **17 Sep 2025** | Intent + Cart Mandates; instrument-agnostic (cards and stablecoins) |
| **Agentic Commerce Protocol (ACP)** | OpenAI + Stripe | Sep 2025 | Shared Payment Tokens; powers **Instant Checkout**, launched with Etsy sellers |
| **Agent Pay / Agentic Tokens** | Mastercard | **29 Apr 2025** | Extension of Mastercard Digital Enablement Service (MDES); agent identity encoded into the token |
| **Trusted Agent Protocol (TAP) / Intelligent Commerce** | Visa | 2025 | Visa credentialing for agents; announced collaboration with OpenAI |
| **A2A (Agent2Agent)** | Google | Apr 2025 | Agent-to-agent comms layer AP2 sits on top of |
| **MCP** | Anthropic | 2024 | Tool-access layer (not payments) |

**Attribution matters and is being designed in:** Mastercard's Agentic Tokens and ACP's Shared Payment Tokens **both encode agent identity into the transaction record specifically so that disputes can attribute correctly**. `[UNVERIFIED FETCH]`

> **`[INFERENCE]` — four incompatible standards, one merchant.** As of mid-2026, an Indian merchant that wants to be transactable by AI buyers faces AP2, ACP, Mastercard Agent Pay and Visa TAP simultaneously, with different identity models and different token semantics. **The integration/normalisation problem is real and immediate**, and it is the kind of problem a payment aggregator like Razorpay is structurally positioned to absorb on the merchant's behalf.

---

## 3. What actually breaks

### 3.1 Trust is the binding constraint, not the technology

| Claim | Figure | Status |
|---|---|---|
| Trust identified as the **#1 barrier** to agentic commerce deployment, ahead of all technical concerns | qualitative | `[UNVERIFIED FETCH]` — attributed to **Juniper Research, April 2026**. Juniper is an analyst house, not a vendor. **Worth buying/finding; would be a strong citation.** |
| Share of US population that trusts AI with financial decisions | **10%** | `[UNVERIFIED FETCH]` — **high-impact if verified. Trace before use.** |

### 3.2 The liability gap — the most consequential open problem

> "As of 2026, no government has enacted agentic commerce regulation that specifically addresses who is liable when an AI agent makes a purchase autonomously." `[UNVERIFIED FETCH]`

When an autonomous agent executes a disputed transaction, responsibility is potentially shared across **the agent provider, the merchant, the financial institution, and the payment network** — with no statutory allocation. `[UNVERIFIED FETCH]`

> **`[INFERENCE]` This lands on the merchant by default.** In existing card rules, an unauthorised card-not-present transaction is presumptively the merchant's loss unless the merchant can produce compelling evidence. Nothing in the current dispute rulebooks contemplates "the cardholder's agent bought it and the cardholder says they didn't mean it." **Absent a rule change, agent-initiated disputes flow into the merchant's ordinary dispute ratio** — including, per `risk_problems.md` §3.1, **the Visa VAMP ratio, which is count-based and threshold-triggered.** An agent that misinterprets an instruction at scale is therefore not just a refund problem; it is a **compliance-threshold problem** for the acquirer.

### 3.3 Disputes assume a human who can be asked

> "Traditional dispute flows assume direct user intent. Agentic commerce requires processors to log decision context, permissions, and execution paths." `[UNVERIFIED FETCH]`

`[INFERENCE]` The merchant-side representment process today rests on artefacts that evidence *human* presence: IP, device fingerprint, AVS match, login history, prior order history, delivery confirmation. **An agent transaction breaks most of these signals simultaneously** — the device is a data centre, the IP is a cloud provider, there is no browsing session, and the "customer" has no prior behavioural history with the merchant. **Every heuristic that a fraud engine currently uses to distinguish a good customer from a bot fires the wrong way on a legitimate agent.** This is the sharpest technical statement of the problem I can make from the evidence, and it cuts both ways: agentic traffic looks like fraud, and fraud can now hide inside agentic traffic.

### 3.4 Proposed mitigations (i.e. what the ecosystem thinks the product surface is)

`[UNVERIFIED FETCH]`, but consistently listed across sources:
- **Know Your Agent (KYA)** identity frameworks
- Cryptographic signing; **Web Bot Auth** standards
- **Graded permissions and spending limits**
- **Human-in-the-loop checks** for high-risk actions
- Enhanced dispute and recovery flows with decision-context logging

---

## 4. The India gap

`EVIDENCE NOT FOUND`, and this is the most interesting finding in the file:

- **No NPCI or RBI agent-mandate primitive was located.** UPI has an e-mandate framework (see `revenue_leakage_problems.md` §1.1) built entirely around **AFA — a human entering a factor**. AP2's delegated-task model, where the human is explicitly *not present* at execution, has no obvious mapping onto a regime whose core control is "the customer authenticates each debit above ₹15,000."
- **Visa's VAMP fact sheet explicitly states "Programs for Brazil, Chile, and India will be announced later"** (`risk_problems.md` §3.1, PRIMARY). So even the dispute-monitoring regime that agent traffic would flow into is unspecified for India.
- No India-specific agentic-commerce volume, merchant-readiness, or consumer-trust data was located.

> **`[HYPOTHESIS]` — the strongest available thesis in this area.** India has the world's largest real-time payments rail and a recurring-payments regime built on the assumption of a present, authenticating human. Agentic commerce assumes an absent human acting through a delegated, limit-bounded mandate. **These two designs are in direct tension, and no Indian regulator has yet resolved it.** A merchant-side system that can (a) accept an AP2/ACP mandate, (b) translate its limits and conditions into something an Indian payment instrument can actually enforce, and (c) retain the mandate as dispute evidence, is addressing a gap that demonstrably exists rather than one that has been assumed.
>
> **Caveat, stated plainly: this is a hypothesis, not a finding.** It rests on an absence of evidence (no located NPCI agent primitive), and absence of evidence in a 403-blocked domain is weak. **Before pitching it, check npci.org.in circulars directly from a browser.**

---

## 5. Track mapping

Maps to **Track 1 (AI Growth & Agentic Commerce — "merchants transactable by AI buyers")** and secondarily **Track 2 (AI Risk Manager)** via §3.3.

| Consideration | Assessment |
|---|---|
| **Evidence quality** | Mixed. Protocol specs are excellent primaries; market data is nonexistent. |
| **Novelty** | High — the field is ~18 months old. |
| **Risk** | **The absence of measured data cuts both ways.** You cannot size the pain, so a judge cannot verify the problem is expensive *yet*. Contrast with MSME receivables (₹7.34 lakh crore, dated, sourced). |
| **Best framing** | Lead with the **Google AP2 three-questions primary** (§1) — it is the problem statement from the party building the rails, needs no defending, and nobody can call it vendor spin because Google isn't selling the merchant anything. |

---

## Sources

| # | Title | Publisher / type | URL | Status |
|---|---|---|---|---|
| A1 | Announcing Agent Payments Protocol (AP2) | Google Cloud / **PRIMARY, FETCHED** | https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol | 2026-08-26 ✅ |
| A2 | Visa Acquirer Monitoring Program fact sheet 2025 (India program "announced later") | Visa / **PRIMARY, FETCHED** | https://corporate.visa.com/content/dam/VCOM/corporate/visa-perspectives/security-and-trust/documents/visa-acquirer-monitoring-program-fact-sheet-2025.pdf | 2026-08-26 ✅ |
| A3 | How Agentic AI Will Reshape Payments — IMF Notes Vol 2026 Issue 004 | IMF / **neutral institution — HIGH VALUE, NOT YET READ** | https://www.elibrary.imf.org/view/journals/068/2026/004/article-A001-en.xml | **not fetched — READ THIS** |
| A4 | Visa and Mastercard both launch new agentic AI payments tools (16 Oct 2025) | Digital Commerce 360 / news | https://www.digitalcommerce360.com/2025/10/16/visa-mastercard-both-launch-agentic-ai-payments-tools/ | not fetched |
| A5 | Agentic commerce in 2026: Where we stand and what lies ahead | FinTech Futures / trade press | https://www.fintechfutures.com/ai-in-fintech/agentic-commerce-in-2026-where-we-stand-and-what-lies-ahead | not fetched |
| A6 | AI Agent Chargeback Liability: Who Pays & How to Prepare | Chargeflow / ⚠️ VENDOR | https://www.chargeflow.io/blog/ai-agent-chargeback-liability | not fetched |
| A7 | Agentic Commerce and the Future of Payments | Accenture / consultancy | https://www.accenture.com/us-en/blogs/banking/agentic-commerce-payments | not fetched |
| A8 | What Is Mastercard Agent Pay? / AP2 Protocol Explained | Eco / ⚠️ VENDOR explainers | https://eco.com/support/en/articles/15192001-what-is-mastercard-agent-pay-ai-agent-commerce-protocol-in-2026 | not fetched |
| A9 | Juniper Research agentic commerce study, April 2026 (trust = #1 barrier; 10% US trust in AI for financial decisions) | Juniper / analyst | — **primary not located; TRACE** | not fetched |

## Verification TODO
1. **Read the IMF note (A3).** A neutral multilateral institution writing on agentic payments in 2026 is the highest-credibility source available in this space and it is sitting unread.
2. **Trace the Juniper Research April 2026 study** for the trust figures.
3. **Check npci.org.in circulars from a browser** for any agent/delegated-mandate primitive — §4's central hypothesis depends on its absence.
4. Read the **AP2 spec** itself (github.com/google-agentic-commerce/AP2) rather than the announcement blog.
