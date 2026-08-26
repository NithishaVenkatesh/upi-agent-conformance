# Agentic Commerce Protocol Landscape — as of 2026-08-26

**Purpose:** decode the four protocols Razorpay named verbatim in Track 01 (NPCI UAP, ACP, AP2, x402), establish what is actually *specified* vs. merely *announced*, and identify exploitable unsolved problems for a Buildathon submission.

**Retrieval date for all sources: 2026-08-26** unless stated otherwise.

---

## 0. How to read this document

Every claim carries a label:

| Label | Meaning |
|---|---|
| **FACT** | Directly stated in the cited source. Primary sources (spec files, circulars, official press releases) preferred. |
| **INFERENCE** | Reasoned from cited facts. Could be wrong. |
| **HYPOTHESIS** | Speculative. Do not build on it. |
| `EVIDENCE NOT FOUND` | Searched, did not find. **Not** the same as "does not exist" — but do **not** fill it in from memory. |

Source-type tiers, descending reliability:
1. **Primary** — spec file, regulatory circular, gazette notification, official press release
2. **Vendor official docs** — accurate about their own product, promotional about the market
3. **Trade press** — MediaNama, Business Standard, Entrackr; law-firm and regtech analysis
4. **Vendor marketing blog** — chargeback vendors, PSP landscape reports. Useful for framing, weak for facts
5. **SEO aggregator** — do not cite

### Methodology honesty

`firecrawl` MCP was unavailable this session (Docker not running; `~/.superstack/web/bin/webup` → `Docker not running — start Docker Desktop`). `camoufox` MCP failed with a `better-sqlite3` `NODE_MODULE_VERSION` mismatch. Research used `WebSearch` (budget exhausted mid-session), `curl` with full browser headers, the Playwright MCP browser, and the `gh` CLI.

- **rbi.org.in** — 403 to `curl`/WebFetch, but **fully readable by driving a real browser**. The RBI quotes in §10 are captured page text, not summaries.
- **npci.org.in** — Akamai-blocked for HTML; **PDFs were retrievable** with full browser headers. One NPCI PDF was obtained directly (§2.3). All NPCI *circular text* below is secondary.
- **business-standard.com**, **cnbc.com**, **openai.com/index/\*** — paywalled or 403.

---

## 1. Executive summary

### The four protocols Razorpay named

They are **not four competitors for one slot**, and three of the four changed materially after their 2025 launches. Anything written from a Sept-2025 understanding is now wrong in specifics.

| Protocol | State on 2026-08-26 | Verdict |
|---|---|---|
| **NPCI UAP** | **No spec, no circular, no date.** Zero of **221** NPCI UPI circulars (2019–2026) mention it; RBI's corpus returns **one** hit for `agentic` (a non-binding committee report) and nothing for UAP. Single anonymously-sourced press report; *"likely to require a regulatory nod from RBI."* | **Do not build against it** |
| **ACP** (OpenAI + Stripe + **Meta**) | Spec real, Apache-2.0 — but **OpenAI wound down ChatGPT Instant Checkout in March 2026**; no spec release since **2026-04-17**. `delegate_payment` is a hard `$ref` to `PaymentMethodCard` with **no extension point**, and `Allowance.reason` has **exactly one legal value, `one_time`**. | **Structurally cannot do UPI** |
| **AP2** (Google) | **v0.2.0 (2026-04-28) — Intent/Cart/Payment is superseded** by **Checkout Mandate + Payment Mandate** as SD-JWT VCs, with Intent generalised into Open/Closed. **Richest authorization model in the field (8 constraint types), and names `"type": "UPI"` in a normative example.** Repositioned as the payment-authorization **extension inside UCP**. Repo has merged nothing since 2026-04-29. | **Best conceptual fit for India; low momentum** |
| **x402** (Coinbase) | **Contributed to the Linux Foundation** — charter 2026-03-31, operational launch 2026-07-14, 40 members incl. Visa, Mastercard, Stripe, Google, AWS, Shopify, Cloudflare. Canonical repo is now `x402-foundation/x402`; **`coinbase/x402` is a downstream fork**. Published volume figures **disagree by up to 19×** between two trackers. | **Only neutral governance of the four; stablecoin settlement is a non-starter in India** |

### The three things the brief doesn't say

**1. The most important protocol isn't on Razorpay's list.** **UCP** (Google + Shopify, Jan 2026) is co-developed by Google, Shopify, Amazon, Microsoft, Meta, Salesforce, Stripe, Etsy, Target, Walmart and Wayfair, and endorsed by Visa, Mastercard, PayPal, Adyen and **Flipkart**. 3,328★ vs ACP's 1,523★. It is **live in production** in Google AI Mode and Gemini, ships **unauthenticated MCP endpoints** at `https://{shop}.myshopify.com/api/ucp/mcp` you can test today, and **AP2 rides inside it as an extension**. **Razorpay is in neither its co-developed nor its endorsed list.**

**2. Razorpay has been pushing at the wrong door for nine months.** Six PRs into the ACP repo — **#46 open since 2025-12-03**, and #215–#218 stalled since 2026-05-15 — every one an attempt to add UPI. **None merged.** Meanwhile UCP explicitly invites a *regional PSP* to publish a payment handler **with no committee approval at all**. *(Note: `gh search code --owner razorpay` returns zero here and is a structurally invalid method — org-scoped search cannot see PRs filed into third-party repos. §3.4.)*

**3. In India, none of the four is what ships.** Live Indian agentic payments run on **UPI Reserve Pay (SBMD) + MCP**. The sanctioned agent rail is **NPCI OC 201-B (8 Oct 2025)**, which extended UPI Circle delegation from IoT hardware to **software** — title now confirmed from NPCI's own circular API.

### The two regulatory facts that constrain everything

**No RBI or NPCI instrument grants, denies, or conditions an AI agent's authority to initiate a payment.** The rails exist; the rule about agents does not.

**And the caps are small.** UPI Reserve Pay: **₹10,000 per merchant, ≤90 days**. UPI Circle software delegation: **₹5,000/txn, ₹15,000/month**. AFA-free recurring ceiling: **₹15,000/transaction** (RBI E-mandate Framework 2026, §10.3). **Every credible India demo is a low-ticket, high-frequency demo.**

### The five most exploitable gaps

Full treatment in §9. Ranked by *(demonstrable in a hackathon) × (nobody owns it)*:

| # | Gap | The hook |
|---|---|---|
| **1** | **Razorpay's own MCP server has no mandate primitives** | ~45 tools, and **not one** creates, inspects, bounds or revokes a Reserve Pay block. The live rail and the official MCP server are unconnected in the open-source surface. |
| **2** | **A constraint engine for UPI Reserve Pay** | UPI gives you *one amount and one date*. AP2 specifies **eight** constraint types verbatim. Implement them as a deterministic gate. |
| **3** | **Risk-tiered escalation via URL-mode elicitation** | MCP's **only** normative payment sentence: servers *"**MUST** use URL mode"* for payment credentials, and clients **MUST** get consent before navigation. A spec-required human checkpoint nobody in India uses — and the only clean answer to the ₹15,000 AFA cliff. |
| **4** | **A scope-conformance adjudicator keyed on `transaction_id`** | AP2 declares dispute retrieval out of scope and then **names the design**: *"would be done by using the Payment Mandate `transaction_id` as the key to request it."* |
| **5** | **A UCP payment handler for UPI** | *"each provider—whether it's Google, Shopify, or a **regional PSP**—publishes their own handler specification… without committee votes."* No permission needed. Contrast six stalled ACP PRs. |

**And the honest framing for a submission:** the highest-starred open-source project at the UPI × agentic-payments intersection has **2 stars** (§8.5). x402 has 6,542. This is genuinely greenfield — every serious artefact in the field assumes cards or crypto.

---

## 2. NPCI UAP — Unified Agent Protocol

### 2.1 Name and status

**FACT** — The name is **"Unified Agent Protocol" (UAP)**, not "Unified Agentic Protocol". Every source traces to a single Business Standard scoop.

> "The proposed new standard for artificial intelligence (AI)-led agentic payments, a Unified Agent Protocol (UAP), could place the country among the first to build national infrastructure for agentic payments, said the persons, who spoke on condition anonymity. Work is under­way at the National Payments Corp­oration of India (NPCI) to develop the proposed UAP in consultation with the industry"
> — Ajinkya Kawale, ["India may allow agentic AI-led UPI transactions under new NPCI protocol"](https://www.business-standard.com/finance/news/india-may-allow-agentic-ai-led-upi-transactions-under-new-npci-protocol-126070801343_1.html), *Business Standard*, 2026-07-09 (tier 3, paywalled beyond lede)

#### 🟢 Status — now settled against PRIMARY sources (upgraded from `EVIDENCE NOT FOUND`)

An earlier pass could only say "not found." Both primary registries have since been searched exhaustively, and the negative is now a **positive finding**.

**FACT — NPCI's complete UPI circular corpus contains no UAP and no agentic circular.**
Queried NPCI's own backing API, `https://www.npci.org.in/api/circulars/upi?pageNum=1&year=<YYYY>&sort=desc&size=100&locale=en`, for **every year 2019–2026** (retrieved 2026-08-26, via browser same-origin `fetch`, since the endpoint 403s to `curl`):

| FY bucket | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 | **Total** |
|---|---|---|---|---|---|---|---|---|---|
| Circulars | 10 | 10 | 37 | 35 | 39 | 32 | 41 | 17 | **221** |

Case-insensitive matches for `agentic`, `unified agent`, `UAP` across all **221** circular titles: **zero**. Highest circular number published: **OC 236 (FY 2026-27)**.

**FACT — RBI has published nothing on it either.** `rbi.org.in/Scripts/SearchResults.aspx` (retrieved 2026-08-26):
- `search=agentic` → **`TotalRec = 1`** — the non-binding FREE-AI Committee Report, glossary only.
- `search=Unified+Agent+Protocol` → 14 records, but all are **word-soup matches** on the individual words (hits include documents from 2000, 2001, 2009 and 2015). **No document titled or concerning a Unified Agent Protocol.**

**Still `EVIDENCE NOT FOUND`:** any named NPCI official on the record about UAP; any named participant list; any UAP specification, draft, consultation paper or launch date.

**FACT (tier 3):** Business Standard reports that **"The launch of UAP is likely to require a regulatory nod from RBI."**

> ### ✅ Verdict on UAP's status
>
> **The claim "NPCI's Unified Agentic Protocol is not live — it is pending RBI approval" is CONFIRMED on its first half and PARTIALLY SUPPORTED on its second.**
>
> - **"Not live" — CONFIRMED, primary.** Zero of 221 NPCI UPI circulars mention it; RBI's corpus returns one glossary hit for `agentic` and nothing for UAP. There is no spec, no circular, no pilot, and no date. **FACT.**
> - **"Pending RBI approval" — reported, not documented.** The only basis is Business Standard's anonymously-sourced *"likely to require a regulatory nod from RBI."* No RBI or NPCI document says an approval is pending, because no document mentions UAP at all. **Correct in substance, tier-3 in provenance — attribute it, don't state it as regulatory fact.**
> - **Naming nit worth getting right:** the reported name is **"Unified Agent Protocol"**, not "Unified Agentic Protocol." Both Business Standard and Outlook Business use *Agent*.
>
> **Do not build against UAP as if it were a rule.** Build against what UAP would wrap: UPI Circle (OC 201-B) and UPI Reserve Pay (OC 228).

### 2.2 What UAP is reported to specify

All from the same scoop, syndicated. **FACT (per source):**

- "a trusted, common, interoperable infrast­ructure through which AI agents can be **registered, verified, and authorised** to transact across the UPI ecosystem **without changing the underlying rails**"
- "The protocol would verify whether an AI agent is authorised to act on behalf of a user, **define the limits of that authority** and **establish accountability**."
- "NPCI's role would remain limited to validating whether a payment request is genuine, similar to the current UPI system, **without visibility into what is being purchased**."
- "AI agents could originate from merchant apps, payment platforms, AI assistants such as ChatGPT and Claude, or dedicated agentic platforms."
- First use cases expected: "low-value, repetitive purchases—such as groceries, dairy products and other daily essentials"
— [Outlook Business, 2026-07-09](https://www.outlookbusiness.com/news/india-plans-ai-powered-upi-payments-framework-through-unified-agent-protocol) (tier 3, syndicating Business Standard)

**On "UAP is built on UPI Circle":** widely repeated by aggregators and asserted by MediaNama's summary of Business Standard. I could not confirm it in the retrievable Business Standard or Outlook Business text. Treat as **LOW CONFIDENCE**. *(It is, however, the architecturally obvious reading given OC 201-B — see §2.4.)*

### 2.3 UPI Reserve Pay / Single Block Multiple Debits (SBMD)

This is the rail every live Indian agentic payment currently runs on.

#### ⚠️ A naming conflict, resolved

MediaNama states SBMD is *"which **Pine Labs brands as** UPI ReservePay"* ([2026-06-12](https://www.medianama.com/2026/06/223-pine-labs-agentic-payments-protocol-upi-liability-privacy-questions/)). **This is wrong**, and it matters because it would misattribute a national brand to a private PSP.

**FACT (primary — NPCI's own 23-page PDF, retrieved directly from npci.org.in):** NPCI publishes a *UPI Reserve Pay Brand Guideline* which states **"The logo is derived from the UPI and NPCI brand elements"**, mandates a 1:1 height ratio between "the UPI Reserve Pay logo and Partner logo", and prescribes usage "in all the partners app, website and communication materials". NPCI's circular is titled *"Enhancement in UPI Single Block Multiple Debits (**UPI Reserve Pay**)"*. NPCI's own Executive Director uses the term (§2.5). **UPI Reserve Pay is NPCI's brand for SBMD.** — [npci.org.in PDF](https://www.npci.org.in/uploads/UPI_Reserve_Pay_Guidlines_b4cb359cbc.pdf)

#### The circulars

**🟢 FACT — circular identifiers and exact titles confirmed from NPCI's own circular API** (`/api/circulars/upi`, retrieved 2026-08-26). Titles are verbatim `fileName` values:

| Circular | Verbatim title | FY bucket | PDF |
|---|---|---|---|
| **OC No. 200** | "UPI \| OC No. 200 \| FY 24-25 – Enablement of UPI Mandate feature of Single Block Multiple Debits" | 2024 | [`UPI_OC_No_200_FY_24_25_…_f2f9bc9230.pdf`](https://www.npci.org.in/uploads/UPI_OC_No_200_FY_24_25_Enablement_of_UPI_Mandate_feature_of_Single_Block_Multiple_Debits_f2f9bc9230.pdf) |
| **OC No. 228** | "UPI \| OC No. 228 \| FY 2025-26 \| Enhancement in UPI Single Block Multiple Debits (UPI Reserve Pay)" | 2025 | [`UPI_OC_No_228_FY_2025_26_…_a9095c181d.pdf`](https://www.npci.org.in/uploads/UPI_OC_No_228_FY_2025_26_Enhancement_in_UPI_Single_Block_Multiple_Debits_UPI_Reserve_Pay_a9095c181d.pdf) |

> ⚠️ **The OC 228 PDF is a 2-page scanned image with no text layer** (verified: `textlen 0, images 1` on both pages). Identifier, exact title and existence are **primary**; the *operative text* remains secondary. Do not present the limits below as a verbatim quote from the circular.

Mechanic (OC 200, as quoted by TeamLease RegTech): "UPI mandate is created with block functionality where customers can **pre-authorize a transaction by blocking funds** in the account for multiple debits which shall be initiated later till the blocked funds get exhausted or the mandated service has been revoked." **P2M only.**

Operative terms of the 2026 enhancement, per two independent compliance trackers:
- **Maximum block ₹10,000, for up to 90 days. One block per merchant per customer.**
- Extended to all UPI-permitted fund sources: Savings, Current, Overdraft, RuPay Credit Cards, pre-sanctioned Credit Lines
- Issuers must "send notifications for block creation, modification, debit, revoke, or expiry" and "**debit only utilized amounts**"
- Acquirers: enable "initially for verified online merchants with **low-ticket, high-frequency** transactions"; failed transactions retryable "**up to 3 times in 24 hours**"
- Members must follow **RBI TAT and compensation guidelines**, provide **Online Dispute Resolution (ODR)**, reconcile using **purpose code 77**
- UPI apps must provide easy revocation and a consolidated view of all active blocks
— [Complinity](https://complinity.com/legal-update/npci-issues-enhancements-in-upi-single-block-multiple-debits-upi-reserve-pay--20722/), [Lawrbit](https://www.lawrbit.com/article/what-is-new-in-upi-rules-2025-key-changes-you-should-know/) (tier 3)

The ₹10,000 / 90-day figures are **independently confirmed on the record by Razorpay** (§10.1). Three independent corroborations (two compliance trackers + Razorpay) of the same numbers — **FACT-medium, high confidence.**

#### NPCI-mandated UX controls (FACT, primary PDF)

Directly relevant because they are three of the four controls an agentic-spend UX needs:
- "It is **mandated** to have the option to **manage (create, modify & revoke / cancel)** UPI Reserve Pay when the user views their payment methods."
- "**Push notification must be sent to users whenever any amount is debited** from an active Reserve, or any Reserve is created / Modified."
- "User must be able to view their **transaction history and reserve details**"
- "Available limit and End date for the Reserve post modification should be clearly mentioned"

**INFERENCE:** NPCI has mandated revocability, per-debit notification, and balance/expiry visibility. It has **not** mandated scoping by category, item, counterparty, or frequency. That gap is where a build can live (§9, Gap 3).

### 2.4 🔴 NPCI OC 201-B — the actual agentic rail (and the thing most people miss)

**🟢 FACT — identifier and exact title confirmed from NPCI's circular API** (retrieved 2026-08-26): *"UPI | OC No. 201B | FY 2025-26 | Addendum to NPCI/UPI/2024-25/OC 201– Introduction of IoT devices & software on UPI Circle"*, PDF at [`UPI_OC_No_201_B_FY_2025_26_…_09ec83c893.pdf`](https://www.npci.org.in/uploads/UPI_OC_No_201_B_FY_2025_26_Addendum_to_NPCI_UPI_2024_25_OC_201_Introduction_of_Io_T_devices_software_on_UPI_Circle_09ec83c893.pdf). The sibling circulars are likewise confirmed: **OC No. 201** ("Introduction of “UPI Circle” – Delegated Payments for secondary users", FY 24-25) and **OC No. 201 A** ("… Full Delegation Additional Requirements", FY 2025-26).

**Operative detail below is FACT-medium (law-firm analysis; the NPCI PDFs were not text-extracted):**

> **`NPCI/UPI/OC-201B/2025-26` — "Addendum to NPCI/UPI/2024-25/OC 201 — Introduction of IoT Devices & Software on UPI Circle", 8 October 2025**, effective immediately.

Khaitan & Co's reading, verbatim from their client note:
> "By enabling this integration, the NPCI has, inter alia, established a **foundational framework for 'agentic payments'** within the UPI ecosystem, i.e., payments executed by AI agents (such as chatbots like ChatGPT) that can initiate, authenticate and complete transactions on a user's behalf, while fully preserving user control, security and consent."
> — [Khaitan & Co ERGO, *"Enabling Agentic Payments on UPI Rails"*, 20 Nov 2025](https://www.khaitanco.com/sites/default/files/2025-11/ERGO%20-%20Enabling%20Agentic%20Payments%20%20on%20UPI%20Rails%20-%2020%20November%202025.pdf) (tier 3, law firm)

Operative controls as described:

| Control | Rule |
|---|---|
| Scope | **Domestic P2M only.** Cross-border and P2P excluded. |
| Limits | **₹5,000 per transaction; ₹15,000 per month per Device** |
| Cooling period | **24 hours** after new delegation, cumulative cap **₹5,000** |
| Device cap | **5 Devices** per Primary User |
| Linking | Primary and secondary Device must be in **close physical proximity**; explicit consent via **2FA** |
| Allowlist | "Only Devices expressly authorised by NPCI may be linked" — **NPCI has not published the permitted-device list** |
| Registration | Secondary PSP must capture **Device ID and/or user details** and validate on **every** payment request; user profile ID recorded for software; same mobile number for profile and UPI Circle registration |
| Exclusivity | A user may accept delegation for a given Device from **only one** Primary UPI app |
| Interop | Devices without a dedicated app must integrate with **multiple** secondary UPI apps; exclusive partnerships discouraged |
| Issuer | Issuer banks must validate **both Device ID and user ID** before debiting |
| Ops | RBI **TAT/compensation** circular (20 Sep 2019) applies; **ODR mandatory**; data localisation compliance |
| Rollout | "access to these features will be restricted to a **limited user group**" |

**Lineage (FACT-medium):**
- `NPCI/UPI/OC No.201/2024-25`, *"Introduction of 'UPI Circle' – Delegated Payments for Secondary Users"*, **13 Aug 2024**. Full Delegation (₹5,000/txn, ₹15,000/month, ≤5 secondaries) vs **Partial Delegation** (secondary initiates, **primary completes with their own UPI PIN**).
- `NPCI/UPI/OC/201A/2025-26`, **8 Jul 2025** (comply by 31 Aug 2025): tightened Full Delegation to identified natural persons — secondary must be categorised as "family member (Child/Parent/Spouse/Sibling/Other Family Member) or Domestic or Small Business Employee", verified against an **Officially Valid Document** under the KYC Master Direction 2016.
- Then, three months later, **201-B opened it to software.**
— TeamLease RegTech articles [34761](https://www.teamleaseregtech.com/updates/article/34761/), [44355](https://www.teamleaseregtech.com/updates/article/44355/) (tier 3, regtech tracker)

**INFERENCE (high confidence):** OC 201-B, not UAP, is the sanctioned Indian agentic-payments framework **that already exists**. UAP would formalise and generalise it. The 201-A → 201-B sequence — tighten to identified humans, then admit software — reads as NPCI deliberately extending a *person*-delegation trust model to *software* delegates.

### 2.5 What actually ships in India today

Track 01 says "Razorpay's in-app pilots are already live." Here is what that means, sourced.

| Date | Event | Source |
|---|---|---|
| **2025-10-10** | Razorpay + NPCI + **OpenAI** launch agentic payments on **ChatGPT**. Rails: **UPI Circle and UPI Reserve Pay**. Banks: **Axis Bank, Airtel Payments Bank**. First merchant **BigBasket**. Pilot stage. | [MediaNama](https://www.medianama.com/2025/10/223-razorpay-npci-openai-agentic-payments-upi-chagpt/) |
| **2026-02-17** | **Cashfree "Here"** with **Mastercard + Swiggy** — "India's first payments extension for AI apps", built for **OpenAI Apps SDK and Anthropic MCP**. UPI + passkey cards. **Not ACP.** | [Cashfree newsroom](https://www.cashfree.com/news-room/cashfree-payments-unveils-india%E2%80%99s-first-payments-extension-for-ai-apps-launches-cashfree-here-in-collaboration-with-mastercard-and-swiggy-at-india-ai-impact-summit-2026/) (tier 2) |
| **2026-02-20** | Razorpay + NPCI announce Agentic Payments **on Claude** at the India AI Impact Summit. Zomato, Swiggy, Zepto. "Currently in a **pilot phase with a select group of users**." Built on **UPI Reserve Pay**. | [Razorpay blog](https://razorpay.com/blog/agentic-payments-and-npci/) (tier 2) |
| **2026-03-12** | FTX 2026 in-app pilots: **Zomato, PVR INOX, Vodafone Idea, Bluestone, Honasa (The Derma Co)**. Payment via UPI Reserve Pay "without redirections to UPI Apps." Earlier GFF 2025 pilot on the Vi app. | [Razorpay blog](https://razorpay.com/blog/agentic-payments-the-future-of-in-app-commerce/) (tier 2) |
| **2026-03-23/26** | Razorpay + **Sarvam AI** voice agent demo. Spending cap **₹10,000**. Harshil Mathur announces rollout with **20+ partners**. | [MediaNama](https://www.medianama.com/2026/03/223-razorpay-sarvam-ai-ai-agent-payments-indus-app/) |
| **2026-06-11** | **Pine Labs launches P3P** — a competing Indian agentic protocol (§6.3). | [MediaNama](https://www.medianama.com/2026/06/223-pine-labs-agentic-payments-protocol-upi-liability-privacy-questions/) |

**FACT (Razorpay official, [razorpay.com/agentic-payments](https://razorpay.com/agentic-payments/)):**
> **Agentic Methods** — **UPI Reserve Pay (Live)**: "Enable consent-based, pre-authorized payments that allow AI agents to transact securely within approved spending limits." **UPI Circle (Coming soon)**: "Support delegated and shared payment authorizations."
> **AI-Ready MCP & APIs** — "40+ composable tools & APIs"
> Agentic Payments for In-App Commerce: **"Live in Beta"**

On-the-record NPCI quote, same page:
> "UPI was built to make digital payments simple, secure, and universal, and Agentic Payments takes that vision into the next era. With UPI Reserve Pay, users can give consent once and allow intelligent systems to transact on their behalf in a controlled, transparent way."
> — **Sohini Rajola, Executive Director – Growth, NPCI**

**And an important nuance on how "agentic" the shipped product actually is (tier 3, MediaNama 2026-06-12):**
> "Razorpay has offered agentic UPI payments since October 2025, first with NPCI and OpenAI on ChatGPT, and later with Anthropic on Claude. In those cases, **the payment still requires the user's final consent before completion**, even though the shopping and checkout happen inside a specific AI assistant."

Razorpay's own description of the demo step ([MediaNama 2026-03-25](https://www.medianama.com/2026/03/223-razorpay-sarvam-ai-ai-agent-payments-indus-app/)): a "Proceed to Pay" button appears and the user taps it manually — "**The agent does not complete the transaction autonomously.**" Razorpay says "Proceed to Pay" replaces the *PIN redirect*, not the cart confirmation, and that "eliminating the PIN redirect is what makes the integration agentic." Razorpay adds its stack "**also allows for users to provide confirmation and delegate purchase fully to an agent**" — but the demo does not show it.

**INFERENCE (high confidence):** India's agentic commerce runs on **UPI Reserve Pay + MCP**, with a **human tap still in the loop** in the shipped Razorpay flows. UAP is the prospective national standard that would formalise what Razorpay, Pine Labs and Cashfree are already doing bilaterally.

---

## 3. ACP — Agentic Commerce Protocol (OpenAI + Stripe + Meta)

### 3.1 Identity, governance, status

**FACT:**
- Spec site [agenticcommerce.dev](https://www.agenticcommerce.dev/); repo [`agentic-commerce-protocol/agentic-commerce-protocol`](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol), **Apache-2.0**, **1,523★**, last push **2026-07-18** (`gh api`, 2026-08-26)
- **Meta joined the TSC on 2026-04-24** (commit `ADMIN: Add Meta as TSC member (#236)`). Stripe's docs now describe ACP as "created by Stripe, OpenAI, and Meta."
- **Founding Maintainers retain veto over the TSC**, framed as transitional (`docs/governance.md`)
- **Last spec release: 2026-04-17.** None since — 4+ months.
- **Not donated to any standards body.** `EVIDENCE NOT FOUND`, confirmed by two independent passes reading `docs/governance.md`.
- No ACP Domain Working Group chartered despite the mechanism existing. `EVIDENCE NOT FOUND`

**⚠️ Correction worth propagating:** the "Food Tech Council" (Block/Square, DoorDash, Google, Toast, Uber Eats) belongs to **UCP, not ACP**. Multiple aggregators misattribute it.

### 3.2 🔴 OpenAI wound down Instant Checkout in March 2026

**FACT** — ended ~6 months after launch.

> "We've found that the initial version of Instant Checkout did not offer the level of flexibility that we aspire to provide, so we're allowing merchants to use their own checkout experiences while we focus our efforts on product discovery."
> — OpenAI, quoted in [The Keyword, 2026-03-25](https://www.thekeyword.co/news/openai-chatgpt-instant-checkout-scrapped) (tier 3)

Reported causes:
- **Only ~12 of Shopify's millions of merchants** ever went live
- Users researched in ChatGPT, purchased on familiar retail sites
- Real-time inventory sync across millions of catalogs did not scale
- **OpenAI had not built the tax-collection infrastructure required for merchant-of-record transactions across US states**
- Walmart reported **3× lower conversion** in-ChatGPT vs click-through ([Retail Insight Network, 2026-03-23](https://www.retail-insight-network.com/news/openai-shifts-chatgpt-shopping-plans-to-retailer-run-apps-report/))

**ACP did not die — its use case narrowed.** Seven retailers are live via ACP for **discovery**: Target, Sephora, Nordstrom, Lowe's, Best Buy, The Home Depot, Wayfair. Shopify merchants integrate automatically via **Shopify Catalog**. Walmart replaced its Instant Checkout integration with a dedicated in-ChatGPT app.

Corroborated by [Digital Commerce 360, 2026-03-06](https://www.digitalcommerce360.com/2026/03/06/openai-shifts-checkout-plans-agentic-commerce-strategy/).

**INFERENCE (high confidence):** ACP lost its anchor demand driver in March 2026, which converges with the independently-measured repo signal (no release since 2026-04-17). **ACP momentum stalled in Q2 2026.**

### 3.3 What ACP specifies

> ✅ **Everything in this subsection was read directly from the spec files at `spec/2026-04-17/` on 2026-08-26** via `gh api` + raw.githubusercontent.com. Field names, enums and header semantics are verbatim.

**Repo layout (FACT):** `spec/` contains dated directories — `2025-09-29`, `2025-12-12`, `2026-01-16`, `2026-01-30`, `2026-04-17`, `unreleased`. **Versioning is directory-only; git tags and GitHub Releases are both empty.** `rfcs/` holds 15 RFCs; `docs/` holds `governance.md`, `mcp-binding.md`, `operating-model.md`, `principles-mission.md`, and SEP guidelines.

The 2026-04-17 release ships six OpenAPI documents: `openapi.agentic_checkout.yaml`, `openapi.agentic_checkout_webhook.yaml`, `openapi.cart.yaml`, `openapi.delegate_authentication.yaml`, `openapi.delegate_payment.yaml`, `openapi.feed.yaml`; seven JSON Schemas; and one OpenRPC document.

#### Agentic Checkout API — verbatim endpoints

`title: Agentic Checkout API`, `version: "2026-04-17"`

| Method + path | `operationId` |
|---|---|
| `POST /checkout_sessions` | `createCheckoutSession` |
| `POST /checkout_sessions/{checkout_session_id}` | `updateCheckoutSession` |
| `GET /checkout_sessions/{checkout_session_id}` | `getCheckoutSession` |
| `POST /checkout_sessions/{checkout_session_id}/complete` | `completeCheckoutSession` |
| `POST /checkout_sessions/{checkout_session_id}/cancel` | `cancelCheckoutSession` |

**`CheckoutSession.status` — the 11-value enum, verbatim:**
`incomplete` · `not_ready_for_payment` · `requires_escalation` · `authentication_required` · `ready_for_payment` · `pending_approval` · `complete_in_progress` · `completed` · `canceled` · `in_progress` · `expired`

> ⚠️ **Note (corrects the common secondary-source claim):** ACP **does** have escalation states — `requires_escalation`, `authentication_required` and `pending_approval`. It is closer to UCP here than the secondary literature suggests. What it lacks is UCP's `continue_url` handoff mechanism.

**Headers (verbatim from `components/parameters`):**

| Header | Required | Note (verbatim where quoted) |
|---|---|---|
| `Authorization` | **true** | "Bearer token for API authentication" (`bearerAuth`, `bearerFormat: API Key`) |
| `Content-Type` | **true** | `application/json` |
| `API-Version` | **true** | example `"2026-01-16"` ⚠️ *stale — the spec directory is `2026-04-17`* |
| `Idempotency-Key` | **true** | "Idempotency key. **MUST be present on all POST requests.** Opaque string, max 255 characters. UUID v4 recommended. **Scoped to authenticated identity + endpoint.**" |
| `Accept-Language` | false | |
| `User-Agent` | false | example `ChatGPT/2.0 (Mac OS X 15.0.1; arm64; build 0)` |
| `Request-Id` | false | |
| `Signature` | **false** | "HMAC signature for webhook verification" |
| `Timestamp` | **false** | "RFC 3339 date-time string for request timing validation" |

🔴 **The signature contradiction, confirmed at source:** `Signature` and `Timestamp` are `required: false` in the OpenAPI, while the RFC text describes signing as MUST (§2.2) and RECOMMENDED (§2.3). This is open issue **#294** — *"Mutating REST requests do not have a consistent mandatory signature and freshness contract"* — with PRs #285/#287/#288 pending. **Unresolved.** Idempotency is mandatory; authenticity is not.

Responses echo `Idempotency-Key` and carry a flag that is "true when the response is a cached replay of a previous request with the same Idempotency-Key".

#### Delegate Payment — and the reason ACP cannot do UPI

`title: Agentic Commerce — Delegate Payment API`, single endpoint **`POST /agentic_commerce/delegate_payment`** (`operationId: delegatePayment`).

**`DelegatePaymentRequest`** — required: `payment_method`, `allowance`, `risk_signals`, `metadata`; optional `billing_address`.

🔴 **`payment_method` is a direct `$ref: "#/components/schemas/PaymentMethodCard"` — not a `oneOf`.** The entire schema file defines exactly one payment-method type. `PaymentMethodCard.type` is `enum: [card]`, "Payment method type, **always 'card'**", with `card_number_type: enum [fpan, network_token]`, `number`, `exp_month`, `exp_year`, `name`, `cvc`, `cryptogram`, `eci_value`, `checks_performed`.

**This is FACT from primary source: ACP's delegated-payment model is structurally incapable of expressing UPI, and it is not an oversight of omission — there is no extension point.**

**`Allowance` — all six required fields, verbatim:**

| Field | Type | Description (verbatim) |
|---|---|---|
| `reason` | string | `enum: [one_time]` — "Usage pattern for this allowance; **currently only `one_time` is supported**" |
| `max_amount` | integer | "Maximum charge amount in minor units" |
| `currency` | string | `^[a-z]{3}$` — ISO-4217 **lowercase** |
| `checkout_session_id` | string | "Identifier of the checkout session this payment is for" |
| `merchant_id` | string | max 256 — "Unique identifier for the merchant authorized to use this token" |
| `expires_at` | string | ISO 8601 expiry |

🔴 **`reason` has exactly one legal value, `one_time`.** Compare AP2's eight constraint types with recurrence, cumulative budget, payee sets and execution windows (§4.4). **ACP cannot express a recurring or budgeted agent allowance at all.**

**`DelegatePaymentResponse`** — required `id`, `created`, `metadata`. `id` is a "Unique **vault token** identifier (`vt_...`)", example `vt_01J8Z3WXYZ9ABC123`. The agent never holds the raw PAN; the PSP vaults it.

Also present: `RiskSignal` (`type: enum [card_testing]`, `score`, `action: enum [blocked, manual_review, authorized]`) and an `Error` schema with `type: enum [invalid_request, rate_limit_exceeded, processing_error, service_unavailable]` and `code: enum [invalid_card, duplicate_request, idempotency_conflict, too_many_requests, idempotency_key_required, idempotency_in_flight]`.

**FACT-medium (not verified by me):** Stripe's Shared Payment Token implementation is geo-limited to **US / Canada / select Europe**.

#### Product Feed — and there are two incompatible ones

`title: Agentic Commerce — Feed API`, endpoints **`POST /feeds`** (`createFeed`), **`GET /feeds/{id}`** (`getFeed`), **`GET /feeds/{id}/products`** (`getFeedProducts`), **`upsertFeedProducts`**.

`schema.feed.json` required-field sets, verbatim:

| Schema | Required |
|---|---|
| `Product` | **`id`, `variants`** — *that's all* |
| `Variant` | `id`, `title` |
| `Price` | `amount`, `currency` |
| `Barcode` | `type`, `value` |
| `Media` | `type`, `url` |
| `UnitPrice` | `amount`, `currency`, `measure`, `reference` |
| `FeedMetadata` | `id` |

Other `$defs`: `Description`, `Availability`, `VariantOption`, `Category`, `Link`, `Seller`, `Condition`, `Measure`, `ReferenceMeasure`.

🔴 **FACT-medium:** this repo JSON Feed API is **not** what OpenAI runs in production. OpenAI's production feed is a **flat TSV/CSV, Google-Shopping-compatible**, with a different required-field set (`item_id`, `is_eligible_checkout`, `seller_tos`, …). **A merchant targeting ChatGPT builds the TSV, not this API.** Do not assume the repo spec is the integration surface.

#### Webhooks

**`POST /agentic_checkout/webhooks/order_events`** (`operationId: postOrderEvents`).

**`Merchant-Signature`** header, **required: true** — verbatim: *"`t=<unix_seconds>,v1=<64_hex>`. **HMAC-SHA256(timestamp + "." + raw_body, secret)**. Return 401 if invalid."* Pattern `^t=\d+,v1=[a-fA-F0-9]{64}$`.

Event `type` — verbatim: *"Event type. **Implementations MUST accept unrecognized values gracefully.** Defined values: `'order_create'`, `'order_update'`. `order_create` for new orders, `order_update` for changes to existing orders."*

> ⚠️ Note the divergence: the OpenAPI **example keys** are `order_created` / `order_updated` while the **field values** are `order_create` / `order_update`. Easy to get wrong.

#### Refunds and disputes — nuanced, and worth stating precisely

**FACT (verified at source):** ACP has **no refund endpoint and no dispute endpoint.** Refunds are *representable* but only as **notifications**: an `order_update` event whose `refunds` array carries `type: "refund"` and whose totals array carries `{ type: amount_refunded, display_text: "Refunded", amount: … }`.

**INFERENCE:** ACP models the refund as something that happened elsewhere and is being reported to the agent. The agent cannot initiate one, and there is no dispute object at all. **The merchant remains merchant-of-record.** An unreleased `rfcs/rfc.intent_traces.md` exists — the beginnings of a dispute-evidence story, unshipped.

**FACT — other open security-shaped issues (2026-08):**
- `#292` — "Delegate authentication result is not bound to the final authorization terms"
- `#293` — "Digital fulfillment can expose a transferable bearer entitlement"

**FACT-medium — the spec contradicts itself in ~11 places**, including `Item` having no `quantity` field and three mutually incompatible `payment_data` shapes.

### 3.4 India + ACP

**🔴 FACT — Razorpay has filed SIX PRs into the ACP repo, five of them still open. Every one is an attempt to get UPI into ACP.** Verified individually via `gh api repos/agentic-commerce-protocol/agentic-commerce-protocol/pulls/<n>`, 2026-08-26:

| PR | State | Author | Created | Last update | Title (verbatim) |
|---|---|---|---|---|---|
| **#46** | **open** | `jating06` | 2025-12-03 | 2026-02-05 | "feat: Add **UPI payment method support** to Agentic Commerce Protocol" |
| #213 | closed, unmerged | `himanshu-rzp` | 2026-04-06 | 2026-04-30 | "Add Razorpay payment handlers (**UPI and Reserve Pay**)" |
| #215 | open | `himanshu-rzp` | 2026-04-12 | 2026-05-15 | "SEP: Add Razorpay **Magic Checkout** Payment Handler" |
| #216 | open | `himanshu-rzp` | 2026-04-12 | 2026-05-15 | "SEP: Add Razorpay **UPI Circle Delegated** Payment Handler" |
| #217 | open | `himanshu-rzp` | 2026-04-12 | 2026-05-15 | "SEP: Add Razorpay **UPI Intent** Payment Handler" |
| #218 | open | `himanshu-rzp` | 2026-04-12 | 2026-05-15 | "SEP: Add Razorpay **S2S Cards** Payment Handler" |

- **None is merged.** ~1,900 lines across four open SEPs, with Stripe/Meta TSC review comments, generalized to `dev.acp.*` naming after TSC feedback.
- **#46 has sat open for nearly nine months** (created 2025-12-03, untouched since 2026-02-05) — the longest-standing unanswered UPI proposal in the repo.
- The 2026-04 batch has been **stalled since 2026-05-15**, awaiting a TSC sponsor. **Last maintainer contact: 2026-05-15 — over three months.**
- Razorpay is **not** a corporate CLA signatory (individual CLA only, via CLA Assistant on #213).
- PR **#215** is a `redirect_checkout` handler generalized from Razorpay Magic Checkout — it sidesteps the card-only constraint by handing off to a hosted page.

> ⚠️ **Methodological warning — this one cost a research pass.** `gh search code --owner razorpay` returns **zero** ACP results and is **structurally invalid** for this question: org-scoped code search only indexes an org's *own* repositories and **cannot see PRs its employees file into third-party repos**. The only correct method is querying the *target* repo's pull list. A "Razorpay has no ACP involvement" conclusion drawn from `--owner razorpay` is an artefact of the tool, not a finding.

**INFERENCE (high confidence):** the PR titles map one-to-one onto exactly the primitives ACP's `delegate_payment` cannot express (§3.3) — **UPI Circle delegated mandates, `upi://` intent URIs, Reserve Pay blocks, and S2S cards.** Razorpay's SEPs exist *because* `payment_method` is a hard `$ref` to `PaymentMethodCard` with no extension point. They plausibly stalled for the same structural reason.

**INFERENCE:** Razorpay has been **lobbying ACP from outside for nine months without a merge, while shipping production agentic payments on an entirely different stack** (UPI Reserve Pay + MCP, §2.5). Contrast UCP, where a regional PSP can publish a payment handler **without any committee approval at all** (§6.1) — see Gap 9.

`EVIDENCE NOT FOUND`: NPCI or UPI as a *released* ACP payment handler; any Indian entity on the ACP corporate CLA list or TSC; ChatGPT Instant Checkout availability in India; a formal ACP↔UCP merger. **`stripe/agentic-commerce-samples` and `openai/openai-agentic-commerce` 404 — these repos do not exist; do not cite them.**

---

## 4. AP2 — Agent Payments Protocol (Google)

### 4.1 🔴 The mandate model changed. Do not use the Sept-2025 description.

Widely-circulated summaries describe AP2 as **Intent Mandate → Cart Mandate → Payment Mandate**. **That is v0.1.0 and it is superseded.** **v0.2.0 (2026-04-28) renamed them:**

| v0.1.0 (do not cite) | v0.2.0 (current) |
|---|---|
| Cart Mandate | **Checkout Mandate** (`mandate.checkout.1`) |
| Payment Mandate | **Payment Mandate** (`mandate.payment.1`) — name retained, schema changed |
| Intent Mandate | **generalised into the Open / Closed Mandate distinction** — `mandate.checkout.open.1` / `mandate.payment.open.1` carry the *constraints*; the closed form carries the concrete transaction |

**INFERENCE:** "Intent" did not disappear, it was **promoted from a mandate type into a modality** applying to both mandate types. An *open* mandate is pre-authorisation-with-constraints; a *closed* mandate is the concrete instance that must satisfy them. This is a cleaner model and it is what makes the eight constraint types in §4.4 possible.

**FACT (primary, [ap2-protocol.org/ap2/specification/](https://ap2-protocol.org/ap2/specification/)):**
> "**Agentic Payment Protocol (v0.2)** … AP2 defines two Mandate types: **Checkout Mandate** and **Payment Mandate**."

> "AP2 operates as a security feature **within a Commerce Protocol**. … AP2 is designed explicitly to be **compatible with the Universal Commerce Protocol (UCP)** and integrates seamlessly."

The sitemap confirms: `/ap2/specification/`, `/ap2/agent_authorization/`, `/ap2/checkout_mandate/`, `/ap2/payment_mandate/`, `/ap2/flows/`, `/ap2/security_and_privacy_considerations/`, `/ap2/implementation_considerations/`. There is **no** `intent_mandate` or `cart_mandate` page.

Licence Apache-2.0. Repo `google-agentic-commerce/AP2`. v0.2 dated **2026-04-28**.

**⚠️ Momentum warning (FACT-medium):** the AP2 repo has **merged nothing since 2026-04-29**, with 147 open issues, and normative work reportedly moved to FIDO. Two research passes independently flagged this.

### 4.2 Roles (verbatim)

| Role | Responsibility (verbatim) |
|---|---|
| **Shopping Agent (SA)** | "performing product discovery, building the checkout, and executing the purchase" |
| **Credential Provider (CP)** | "the source of Payment Credentials… responsible for verifying that this Agent is authorized to access this Payment Credential, and **scoping the Payment Credential appropriately**" |
| **Merchant (M)** | "providing and completing the Checkout… responsible for the integrity of the inventory, pricing, and any merchant discounts" |
| **Merchant Payment Processor (MPP)** | "verifying that the Payment Credential shared by the Credential Provider has been authorized to pay for this Checkout instance" |
| **Trusted Surface (TS)** | "a UI surface that is trusted to get informed user consent for an Intent before creating a user-signed Mandate" |

**FACT — the agentic/non-agentic split, and the sharpest design principle in the whole landscape:**
> "The following role **MUST be non-agentic**: **Trusted Surface**."
> "when either role is agentic, then **the Agent itself is a potential attacker**. As such, additional tamper-evident mechanisms are needed"
> "When this document refers to validation or processing for a particular role, it **MUST happen in deterministic code**"

AP2 explicitly treats the LLM as untrusted and puts every verification step in deterministic code.

### 4.3 Checkout Mandate (verbatim schema)

> "A closed Checkout Mandate MUST use the value `mandate.checkout.1` for the `vct` claim and an open Checkout Mandate MUST use the value `mandate.checkout.open.1`."

| Name | Type | Required | Sel. Disclosable | Description (verbatim) |
|---|---|---|---|---|
| `vct` | string | Yes | No | "Verifiable Credential Type claim as defined in SD-JWT. MUST be 'mandate.checkout'." |
| `checkout_jwt` | string | Yes | Yes | "base64url-encoded serialized **merchant-signed JWT** of the Checkout payload." |
| `checkout_hash` | string | Yes | No | "base64url-encoded hash of the `checkout_jwt` field value, uniquely identifying this checkout." |
| `iat` / `exp` | integer | No | No | timestamps |

> "when used with the Universal Commerce Protocol this MUST be the **Checkout object**."

**Open Checkout Mandate constraints** (pre-authorization scoping):
- `checkout.allowed_merchants` — `allowed: Array[Merchant]`, selectively disclosable
- `checkout.line_items` — `items: Array[LineItemRequirements]` each with `id`, `acceptable_items[]`, `quantity`. Evaluated as a **maximal-flow problem** over a bipartite graph.

> "NOTE: This evaluation does **not support splitting the open Checkout Mandate across multiple Checkouts**. Future constraint extensions can add this support, but consideration must be given to **how multiple duplicate orders can be prevented**."

### 4.4 Payment Mandate (verbatim schema)

> "A closed Payment Mandate MUST use the value `mandate.payment.1` for the `vct` claim, and an open Payment Mandate MUST use the value `mandate.payment.open.1`."

| Name | Type | Required | Description (verbatim) |
|---|---|---|---|
| `vct` | string | Yes | "MUST be 'mandate.payment'." |
| `transaction_id` | string | Yes | "base64url-encoded hash of the `checkout_jwt` field value, uniquely identifying the checkout associated with this." |
| `payee` | Merchant | Yes | "The merchant receiving the payment." |
| `pisp` | Pisp | No | "The Payment Initiation Service Provider." |
| `payment_amount` | Amount | Yes | ISO 4217 currency + integer minor units. "Final value confirmed by the user." |
| `payment_instrument` | PaymentInstrument | Yes | "The payment instrument used." |
| `execution_date` | string | No | "ISO8601 date of execution… When absent indicates immediate execution." |
| `risk_data` | object | No | "An map of relevant risk signals collected by the trusted surface at time of mandate creation." |
| `iat` / `exp` | integer | No | timestamps |

**🇮🇳 The spec's own example for `payment.allowed_payment_instruments` includes UPI:**

```json
{ "type": "payment.allowed_payment_instruments",
  "allowed": [
    { "id": "abe3c...", "type": "card", "description": "network ··· 1234" },
    { "id": "zde4d...", "type": "UPI",  "description": "user****@bankname" }
  ] }
```

**INFERENCE (high confidence):** Unlike ACP (card-only), **AP2 v0.2 is payment-instrument-agnostic and already names UPI in a normative example.** For an Indian build, AP2 is structurally the more hospitable of the two.

#### The eight Payment Mandate constraints — the richest scoping model in the field

| Type (verbatim) | What it bounds |
|---|---|
| `payment.agent_recurrence` | `frequency` enum: `ON_DEMAND`, `DAILY`, `WEEKLY`, `BIWEEKLY`, `MONTHLY`, `QUARTERLY`, `ANNUALLY`; optional `max_occurrences` |
| `payment.allowed_payees` | `allowed: Array[Merchant]` |
| `payment.allowed_payment_instruments` | `allowed: Array[PaymentInstrument]` |
| `payment.allowed_pisps` | `allowed: Array[Pisp]` |
| `payment.amount_range` | `currency`, `max` (required), `min` (optional), minor units |
| `payment.budget` | `max`, `currency` — cumulative: "the requested amount plus the total sum of amounts from previously closed Payment Mandates MUST be less than or equal to `max`" |
| `payment.reference` | `conditional_transaction_id` — binds to a specific open Checkout Mandate |
| `payment.execution_date` | `not_before`, `not_after` |

**FACT — replay/binding hardening:**
> "To prevent rainbow table attacks, the Checkout JWT MUST be signed using a digital signature scheme (e.g., **ECDSA**) and **not a deterministic signature (e.g., Ed25519)**."

### 4.5 Cryptography and agent identity

Two-step model: **Mandate Delegation** (user approves Mandate Content on a Trusted Surface → signed Mandate to the Agent) then **Action Authorization** (Verifier challenges; Agent presents Mandate; Verifier returns a Receipt).

> "Due to their non-deterministic processes, even well-behaving Agents need to have their behavior **tightly constrained above what a normal authorization model would require of human users**."

Two trust models:
1. **User Credential** — Issuer / Trusted Surface as Holder / Agent. "a single User Credential [can] delegate Mandates to many different Agents, without the Verifier needing to have an explicit trust relationship with each Agent."
2. **Trusted Agent Provider** — "simpler trust model, but requires Verifiers to establish trust with **every** Agent Provider."

Wire format: **SD-JWT VCs** over **OpenID4VP**, using `transaction_data`. The mandate delegation object MUST contain:
- `type` — REQUIRED, MUST be `"delegate"`
- `format` — REQUIRED, VDC format of the returned Mandate
- `delegate_payload` — REQUIRED, array of Mandate Content payloads
- `delegate_disclosures` — OPTIONAL, Selective Disclosures

> "It is RECOMMENDED to use the **Digital Credentials API** for delegation with OpenID4VP where available."

The non-normative example uses `dcql_query` against a `com.emvco.dpc` credential (EMVCo Digital Payment Credential) revealing `card_last_four`, `card_network_code`, `credential_id`. ISO mDocs (ISO 18013-5) are named as an alternative VDC format.

### 4.6 Dispute handling — AP2 goes furthest, and *still* declares the hard part out of scope

**FACT (verbatim, "Dispute Evidence"):**
> "In the case of a dispute, the Checkout Mandate and Receipt, and Payment Mandate and Receipt can be brought together to provide a **non-repudiable picture of the transaction**. **Specific details of how this is used for dispute resolution, retention, and retrieval requirements are outside the scope of this specification.**"

> "NOTE: Providing an **automated method to retrieve the Checkout Mandate**, from either the Shopping Agent or the Merchant, would provide **substantial utility to the ecosystem**. The exact details are **outside the scope of the current version**, but would be done by using the Payment Mandate `transaction_id` as the key to request it."

AP2 *does* specify a normative dispute-time verification procedure (5 MUST steps: verify Checkout Mandate per Merchant rules; independently recompute the `checkout_jwt` hash; match the Checkout Receipt `reference` to the closed-Checkout-Mandate hash; verify the Payment Mandate per MPP rules using `checkout_hash`; match the Payment Receipt `reference`).

> "After all these steps have been performed successfully, then the information contained in the Checkout Mandate and Payment Mandate **is able to be used as evidence as to what the user, and each role saw**."

**FACT (AP2 FAQ):**
> "A primary objective is to provide supporting evidence that helps payment networks establish accountability and liability principles. In a dispute, the network adjudicator (e.g., Card Network) can use the user-signed Checkout Mandate and compare the details of what was agreed upon…"

> "**What prevents an agent from 'hallucinating' and making an incorrect purchase?** The principle of *Verifiable Intent, Not Inferred Action* addresses this risk. Transactions must be anchored to deterministic, non-repudiable proof of intent from all parties, such as the user-signed Checkout Mandate, rather than relying only on interpreting the probabilistic and ambiguous outputs of a language model."

**INFERENCE (high confidence):** AP2 provides the **evidence** and explicitly declines to provide the **adjudication, retention, or retrieval**. That is a spec-acknowledged, named hole — see §9, Gap 1.

### 4.7 AP2 ↔ UCP ↔ x402 ↔ MCP

**FACT (AP2 FAQ, verbatim):**
> "While the **Universal Commerce Protocol orchestrates the broader purchase lifecycle, AP2 is the specialized payment layer** responsible for authorizing and signing transactions. … **Merchants will be able to integrate AP2 as an extension within the Universal Commerce Protocol** for transactions which are driven by AI Agents."

> "If you are a merchant who would like to showcase products and allow users to complete inline checkout on Google's AI surfaces like AI Mode and Gemini, then you should use Universal Commerce Protocol. You can enhance the protocol with the **AP2 extension if you plan to build autonomous purchase scenarios where AI Agents can make purchases in the user's absence**."

On x402:
> "We designed AP2 to be a **payment-agnostic** protocol… As a first step, check out **`google-agentic-commerce/a2a-x402`** which is an implementation of A2A in conjunction with the x402 standard."

Published sample flows: **Human Present Cards**, **Human Present x402**, **Human Not Present Cards**, **Human Not Present x402**, **Digital Payment Credentials Android**.

**⛏️ The single most build-actionable cryptographic pattern found in this entire research effort:** AP2's `x402_credentials_provider_mcp/server.py` computes

```python
nonce = Web3.keccak(text=mandate_chain)
```

— binding the EIP-3009 on-chain authorization cryptographically and inseparably to the user's signed AP2 mandate chain. **The pattern is version-independent and worth copying even though the official `a2a-x402` bridge is stale** (double-pinned to obsolete versions of both protocols; `x402Version: 1`).

**FACT — no shipped official AP2 SDK or MCP server:**
> "**Is there a MCP server or a SDK which is ready for 'my framework of choice'?** We are working on an SDK and a MCP server right now, in collaboration with payment service providers. **Check back soon.**"

### 4.8 Adopters

**FACT-medium:** 60+ collaborating organizations at v0.1 — card networks (Mastercard, Amex, JCB, UnionPay), PSPs (Adyen, Worldpay, PayPal), Revolut, Coinbase, Mysten Labs, Ant International, Salesforce, ServiceNow, Intuit, Forter. Revolut announced AP2 support for Revolut Pay across UK/EEA on [2026-01-19](https://www.revolut.com/news/revolut_to_enable_frictionless_checkout_across_all_agentic_commerce_platforms_for_the_uk_and_eea/).

**FACT-medium:** **Juspay is the sole Indian endorser.** No NPCI, no Razorpay, no Paytm.

---

## 5. x402 (Coinbase → Linux Foundation)

### 5.1 Governance — the biggest change, and a repo trap

**FACT (primary):** The in-repo charter PDF reads **"x402 a Series of LF Projects, LLC"**, adopted **2026-03-31**.

> "**SAN FRANCISCO, July 14, 2026** – The Linux Foundation … today announced the **operational launch of the x402 Foundation** and the **completed contribution of the x402 protocol by Coinbase**. The Foundation is now fully active under formal, open governance…"
> "**Since the Foundation's intent to launch in April, 40 organizations have joined as members.**"
> — [Linux Foundation, 2026-07-14](https://www.linuxfoundation.org/press/linux-foundation-announces-operational-launch-of-x402-foundation-to-standardize-internet-native-payments-for-ai-agents-and-applications)

Membership:
- **Premier (17):** Adyen, AWS, American Express, Circle, Cloudflare, Coinbase, Fiserv, **Google**, Mastercard, Monad Foundation, MoonPay, Ripple, **Shopify**, Solana Foundation, Stellar Development Foundation, **Stripe**, **Visa**
- **General (18):** Aleo, Fireblocks, Galaxia Moneytree, Hecto Financial, Injective, KakaoPay, Kite AI, LayerZero Labs, Merit Systems, NEAR Foundation, Orthogonal, Polygon Labs, Quant Network, SKALE, t54 labs, utexo, World Liberty Financial, zerohash
- **Associate (5):** BSV Association, Cardano Foundation, Casper, Japan Contents Blockchain Initiative, OMA3

Earlier intent announcement: [Linux Foundation, 2026-04-02, at MCP Dev Summit North America](https://www.linuxfoundation.org/press/linux-foundation-is-launching-the-x402-foundation-and-welcoming-the-contribution-of-the-x402-protocol) — "initially developed by **Coinbase, Cloudflare, and Stripe**."

**FACT — x402 is no longer stablecoin-only** (LF release): "with support for payment types **ranging from traditional cards to stablecoins**."

> 🔴 **Repo trap: the canonical repo is [`x402-foundation/x402`](https://github.com/x402-foundation/x402) (TypeScript, 6,542★, last push 2026-08-25). `coinbase/x402` is now a DOWNSTREAM FORK** — exactly what a completed LF contribution looks like. Residual branding remains: `SECURITY.md` still routes disclosures to `hackerone.com/coinbase`.

**FACT:** the TSC is still only **3 orgs** (Coinbase, Cloudflare, Stripe) despite 40 members. **`ROADMAP.md` is one line: `(update coming soon)`.** No GitHub Releases — versioning is 546 tags only.

**INFERENCE (high confidence):** **x402 is the only one of Razorpay's four named protocols under genuinely neutral, vendor-independent governance.** ACP is Stripe/OpenAI/Meta-controlled with founder veto; AP2 is Google's; UAP is NPCI's.

### 5.2 Mechanics — and the silent-failure trap

**FACT (spec, verbatim):**
> "Response bodies are a server implementation concern. **All x402 protocol information is communicated through headers.**"

The spec's own 402 example has a body of `{}`. 🔴 **Any code written against a v1 tutorial that parses the 402 JSON body will see nothing and fail silently.**

**FACT:** v2 SDKs are wire-compatible with v1 peers. `typescript/packages/core/src/http/x402HTTPClient.ts` branches on version and emits `X-PAYMENT` when `x402Version === 1`, reading `X-PAYMENT-RESPONSE` as fallback. Migration doc: "The facilitator supports both V1 and V2 protocols."

**FACT — three EVM asset transfer methods:** `eip3009`, `permit2`, and **`ERC-7710`** (smart-account delegation). **ERC-7710 is the only one supporting multi-use authorizations** — verification by pure simulation, no trusted allowlist needed. MetaMask Delegation Framework is the named implementation. **For any recurring agent-payment design this is the relevant primitive.**

**FACT — canonical contracts** (same address on every EVM chain, CREATE2 vanity `0x4020…`, permissionless deployment "only gas"):

| Contract | Address |
|---|---|
| `x402ExactPermit2Proxy` | `0x402085c248EeA27D92E8b30b2C58ed07f9E20001` |
| `x402UptoPermit2Proxy` | `0x402015c795ecb48A360bDC6e35a2EaEb313a0002` |
| `x402BatchSettlement` | `0x4020074e9dF2ce1deE5A9C1b5c3f541D02a10003` |

Three Cantina audits in-repo (`cantina_x402_{feb,mar,may}2026.pdf` — existence verified, contents not read).

**FACT — MCP binding, exact keys:**
- Payment required → tool result with **`isError: true`**, `PaymentRequired` in **both** `structuredContent` (REQUIRED) and `content[0].text` (REQUIRED, stringified)
- Payment → MCP `_meta` key **`"x402/payment"`**
- Settlement → MCP `_meta` key **`"x402/payment-response"`**
- Resource URLs: `mcp://tool/<name>` · package `@x402/mcp` v2.23.0 · Cloudflare's `agents` package is the referenced implementation

**FACT — the gotcha most likely to break a demo:** clients by default allow only `DEFAULT_ASSETS` and **cap a single payment at $1 USD** (`maxAmountPerPayment`). Override via `spendControls.allowedAssets` or `spendControls: false`.

**FACT — SDK language coverage is uneven:**

| Network | TS | Go | Python |
|---|---|---|---|
| evm, svm | ✅ | ✅ | ✅ |
| tvm (TON) | ✅ | ❌ | ✅ |
| avm, stellar, aptos, hedera, keeta, near, ccd, xrpl | ✅ | ❌ | ❌ |

npm 2.23.0 / go v2.23.0 / pypi 2.20.0, all at commit 2026-08-18. An unreleased first-party Java SDK exists (`java/pom.xml`, `1.0.0-SNAPSHOT`). Public `x402.org` facilitator is **testnet-only**.

**FACT:** x402's A2A transport spec references Google's extension URI `https://github.com/google-a2a/a2a-x402/v0.1` via the `X-A2A-Extensions` header — the AP2 link is bidirectional.

### 5.3 🔴 Adoption — the volume numbers are contested by up to 19×

Two published trackers, scraped the same day, same nominal 30-day window:

| Metric | x402.org "Last 30 Days" | x402scan.com "Past 30 Days" | Ratio |
|---|---|---|---|
| Transactions | 75.41M | 14.53M | **5.2×** |
| Volume | $24.24M | $1.27M | **19.1×** |
| Buyers | 94.06K | 22K | 4.3× |
| Sellers | 22K | **26K** | 0.85× (**inverted**) |

x402scan is built by **Merit Systems**, itself a General member of the x402 Foundation — ecosystem-adjacent, not independent. Neither source publishes methodology, chain coverage, an as-of timestamp, or a definition of "transaction." The **sellers figure runs the opposite direction** from every other metric, which rules out "one tracker indexes fewer chains."

**HYPOTHESIS (unverified, do not assert):** `batch-settlement` collapses many HTTP requests into one on-chain settlement, so per-request vs per-redemption counting could produce this divergence.

> ⚠️ **Do not cite either figure as authoritative.** Name the source explicitly as vendor-reported, or state the range ("$1.3M–$24M/month depending on tracker"). Earlier third-party reporting agrees the picture is murky: [Coindesk, 2026-03-11](https://www.coindesk.com/markets/2026/03/11/coinbase-backed-ai-payments-protocol-wants-to-fix-micropayment-but-demand-is-just-not-there-yet) found declining weekly counts, ~$0.20 average value, and "a substantial fraction of observed transactions flagged as **test or synthetic traffic**."

**Far better evidence — services with actual live traffic** (x402scan Featured Services, past 30 days):

| Service | Volume | Txns | Buyers | Chain |
|---|---|---|---|---|
| BlockRun (`blockrun.ai`) — AI model routing | $187.36K | 7.73M | 614 | Base |
| BlockRun AI Gateway (`sol.blockrun.ai`) | $48.61K | 4.3M | 45 | Solana |
| claw402 | $1.90K | 948.65K | 151 | Base |
| Cluster Protocol | $106.52K | 125.06K | 721 | Base |
| BotPay | $1.65K | 24.16K | **3.77K** | Base + Solana |

**Three observations that should shape a build:**
1. **Every featured service settles on Base and/or Solana with USDC.** The 11 other supported ecosystems show **no visible production traffic**.
2. **BlockRun alone is ~83% of counted transactions** (12.03M of 14.53M). Any "N million x402 transactions" claim is substantially a claim about one AI-inference gateway.
3. v2 is confirmed in production (Otto AI advertises "x402 V2").

### 5.4 Refunds / reversibility

**FACT — a reversal scheme exists but is not shippable.** The `auth-capture` scheme (`authorize` / `charge` / `capture` / `void` / `refund` / `reclaim`) is:
- **spec-stage only** (v1.1, 2026-08-18)
- **EVM-only**
- **absent from the docs site**
- **not listed as a supported scheme in the README**
- has a client example but **no server example**
- **none of the 14 listed facilitators advertise support for it**

Its own appendix flags an unresolved question: *"**Refund funding** — who supplies refund liquidity."* For `"delegated"` operators it concedes: *"within those bounds it is **trust, not proof**."*

**Practical reversal options today:** `batch-settlement` channel refunds (`refund` / `refundWithSignature`, plus a payer-controlled `initiateWithdraw`/`finalizeWithdraw` escape hatch after a 15min–30day delay), or business-logic refunds (send a new transfer back) — which the FAQ names as the normal answer.

**Tellingly, third-party extensions exist precisely because the core spec has no dispute process:** **`x402r`** ("Non-custodial refund and **arbitration** protocol") and **`zauth`** ("Monitoring, verification, and refund SDK"). Neither is first-party.

---

## 6. The protocols Razorpay's brief doesn't name — but that now matter more

### 6.1 UCP — Universal Commerce Protocol (Google + Shopify)

**Arguably the most important omission from Track 01's list.**

**FACT:** Launched **2026-01-11**. Repo [`Universal-Commerce-Protocol/ucp`](https://github.com/Universal-Commerce-Protocol/ucp), **Apache-2.0**, **3,328★**, last push **2026-08-25** — *more than 2× ACP's stars and far more active.* Site [ucp.dev](https://ucp.dev).

**FACT (primary, [Shopify Engineering, 2026-01-11](https://shopify.engineering/ucp), Ilya Grigorik):**

Layering:
- "**Shopping service** defines core transaction primitives: checkout session, line items, totals, messages, status"
- "**Capabilities** add major functional areas: Checkout, Orders, Catalog—each independently versioned"
- "**Extensions** augment capabilities with domain-specific schemas via composition"

Discovery & negotiation:
> "Both merchants and agents publish profiles declaring what they support. Discovery is the process of fetching these profiles; negotiation computes their intersection. Example merchant profile, published at **`/.well-known/ucp`** on merchant's site"

> "UCP uses **reverse-domain naming**: `dev.ucp.shopping.*` is hosted at ucp.dev; `com.loyaltyprovider.*` belongs to loyaltyprovider.com. **Own the domain, own the namespace.** … security through namespace binding, not bureaucracy."

**The checkout state machine — verbatim, and the field's best HITL primitive:**
> "- `incomplete`: missing required information; agent should attempt to resolve via API
> - `requires_escalation`: buyer input required; agent should attempt API resolution and, if unable, hand off via `continue_url`
> - `ready_for_complete`: all information collected; agent can finalize programmatically"

> "The buyer follows `continue_url` and picks up exactly where the agent left off. **No transaction is ever left behind: when an agent hits a capability gap, the protocol routes around it.**"

**Embedded Checkout Protocol (ECP):**
> "ECP establishes a **JSON-RPC 2.0** channel (state updates from merchant, credentials and context from agent)… Payment collection surfaces the host's native payment sheet."
> "…advanced agent branding capabilities and **strong sandboxing for PCIv4 compliance**"

**Payment handlers — the direct opening for an Indian build:**
> "Rather than the protocol defining every payment method, **each provider—whether it's Google, Shopify, or a regional PSP—publishes their own handler specification.** The merchant just advertises which handlers they accept; the agent picks one and follows its spec. New payment methods grow into the ecosystem **without committee votes or core version bumps**."

**Adopters:** "Co-developed with Google. Supported by **Etsy, Target, Walmart, Wayfair, and millions of Shopify merchants**." Live in **Google AI Mode in Search** and the **Gemini app**.

**FACT — the backer list is the broadest of any protocol here.**
- **Co-developed by:** Google, Shopify, **Amazon, Microsoft, Meta, Salesforce, Stripe, Etsy, Target, Walmart, Wayfair**
- **Endorsed by:** **Visa, Mastercard, PayPal, Adyen, Flipkart**

**FACT-medium:** governance is also the most formalized — a Governance Council (Google/Shopify/Stripe + 2 open seats) and **three Domain Tech Councils**: Shopping (17 members), Food, Lodging.

> 🔴 **Two facts to hold together.**
> **(a)** UCP is the only protocol backed simultaneously by all three US hyperscalers, both dominant card networks, *and* the two largest Western commerce platforms. **Visa and Mastercard endorse UCP while also being x402 Foundation Premier members** — further evidence for the "layered stack, not a winner" reading (§6.4).
> **(b)** **Razorpay appears in neither the co-developed nor the endorsed list.** **Flipkart is the only Indian name in either.**
>
> **INFERENCE (high confidence):** Razorpay has spent nine months pushing six unmerged PRs at ACP (§3.4) — the protocol whose anchor use case was wound down (§3.2) and which is structurally card-only — while being absent from UCP, the protocol that is actually shipping in production, has AP2 riding inside it, and **explicitly invites a regional PSP to publish a payment handler with no committee approval required.** That asymmetry is the single clearest strategic opening in this document (Gap 9).

### 6.2 Visa TAP & Mastercard Agent Pay — the agent *identity* layer

**FACT (primary, [Cloudflare, "Securing Agentic Commerce"](https://blog.cloudflare.com/secure-agentic-commerce/)):**

> "Visa developed the Trusted Agent Protocol and Mastercard developed Agent Pay to help merchants distinguish legitimate, approved agents from malicious bots. **Both Trusted Agent Protocol and Agent Pay leverage Web Bot Auth as the agent authentication layer**"

> "**Web Bot Auth** allows an agent to provide a stable identifier by using **HTTP Message Signatures** with public key cryptography."

> "Both Visa and Mastercard protocols require agents to **register and have their public keys (referenced as the `keyid` in the `Signature-Input` header) in a well-known directory**… Visa and Mastercard will be hosting their own directories"

> "Both protocols build on Web Bot Auth by introducing a **new tag** that agents must supply in the `Signature-Input` header, which **indicates whether the agent is browsing or purchasing**. … Agents must also include the **`nonce` field**… to provide **protection against replay attacks**."

**Verbatim wire example:**

```http
GET /path/to/resource HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0 Chrome/113.0.0 MyShoppingAgent/1.1
Signature-Input: sig2=("@authority" "@path");
  created=1735689600; expires=1735693200;
  keyid="poqkLGiymh_W0uP6PZFw-dvez3QJT5SolqXBCW38r0U";
  alg="Ed25519";
  nonce="e8N7S2MFd/qrd6T2R3tdfAuuANngKI7LFtKYI/vowzk4IAZyadIX6wW25MwG7DCT9RUKAJ0qVkU0mEeLEIW1qg==";
  tag="web-bot-auth"
Signature: sig2=:jdq0SqOwHdyHr9+r5jw3iYZH6aNGKijYp/EstF4RQTQdi5N5YYKrD+mCT1HA1nZDsi6nJKuHxUi/5Syp3rLWBA==:
```

Cloudflare's verification steps, verbatim:
> "1. Confirm the presence of the `Signature-Input` and `Signature` headers.
> 2. Pull the `keyid` from the `Signature-Input`. If Cloudflare has not previously retrieved and cached the key, fetch it from the public key directory.
> 3. Confirm the current time falls between the `created` and `expires` timestamps.
> 4. **Check `nonce` uniqueness in the cache** … ensuring the request is not a malicious copy of a prior, legitimate interaction."

What merchants get:
> "First, merchants can **identify a registered agent and distinguish whether a particular interaction is intended to browse or to pay**. Second, merchants can **link an agent to a consumer identity**. Last, merchants can **indicate to agents how a payment is expected**, whether that is through a network token, browser-use guest checkout, or a micropayment."

> "**American Express will also be leveraging Web Bot Auth** as the foundation to their agentic commerce offering."

**INFERENCE (high confidence):** **Web Bot Auth / RFC 9421 HTTP Message Signatures is the de-facto convergence point for agent identity** — Visa, Mastercard and Amex all delegate to it. It is the most standardised and least contested layer in the whole landscape. **Nothing equivalent exists on the UPI side.**

### 6.3 Pine Labs P3P — India's *shipped* agentic protocol

Launched **2026-06-11**. Directly relevant because an Indian PSP already built the thing.

**FACT (primary, [Pine Labs docs](https://www.pinelabs.com/docs/online-payments/ai/p3p)):**
> "Pine Labs Payments Protocol (P3P) is an **open payments protocol** that enables AI agents, merchants, and autonomous systems to securely initiate, authorize, and execute payments **without a human at the point of transaction**."

> "Every transaction is **scoped and bounded at issuance**. Payment tokens are tied to a **specific resource, amount, and expiry**. They cannot be replayed, redirected, or reused."

> "Every completed transaction returns a **cryptographically verifiable receipt**. Receipts serve as proof of payment for audit trails, compliance, and **dispute resolution**."

Payment methods, verbatim from the [Quickstart](https://www.pinelabs.com/docs/online-payments/ai/p3p/quickstart):
1. `PaymentMethod.OTM` — One Time Mandate (available now)
2. `PaymentMethod.RESERVE_PAY` — UPI ReservePay (available now)
3. `PaymentMethod.CARD` — Cards (available now, pre-auth + subsequent captures)
4. **Stablecoin — "Future scope"**

**Verbatim wire protocol:**
```http
HTTP/1.1 402 Payment Required
WWW-Authenticate: Payment <challenge>
Content-Type: application/problem+json
Cache-Control: no-store
```

Headers read by the server: **`P3P-Credential`**, **`X-Grantex-Token`**. Success returns the resource plus a **`Payment-Receipt`** header.
Grantex scopes required: **`mpp:payment:initiate`**, **`mpp:payment:max_txn_paise:*`**.
Balance endpoint: **`GET /mpp/v1/balance`**. SDKs: `p3p-server-sdk`, `p3p-client-sdk` (TypeScript, Python).
> "The server SDK derives the local P3P challenge **HMAC** key from `PINELABS_CLIENT_SECRET` internally."

Live users (**FACT-medium**, single press source): **Gullak** (digital gold — "buy Rs 500 of gold if the price drops below Rs 16,000 per gram") is live; **Vijay Sales** in PoC.

**INFERENCE:** P3P = **x402's HTTP-402 pattern + a delegated-authorization layer (Grantex) + UPI mandates as the settlement rail**. The clearest existing proof that the four named protocols' ideas can be assembled on Indian rails.

### 6.4 Others worth knowing

Primary source for this subsection: [Custena / Genesis Software Group, *The State of Agent Payment Protocols (April 2026)*](https://github.com/Custena/agent-payment-protocols) — **vendor-authored, self-discloses "We are participants in this market, not a neutral third party"**, but every load-bearing claim carries a resolved primary URL. Tier 4 with tier-1 footnotes.

| Protocol | Owner | Status | Note |
|---|---|---|---|
| **MPP** (Machine Payments Protocol) | Stripe + Tempo Labs | Mainnet **2026-03-18**, 100+ live services | Only HTTP-402 protocol carrying **fiat alongside crypto**. IETF `draft-ryan-httpauth-payment`. Visa published a Card Specification SDK for it. |
| **L402** | Lightning Labs | Production since Mar 2020 | Macaroon-based **reusable credentials with caveats** |
| **Amex ACE** | American Express | Dev Kit **2026-04-14** | Ships **Amex Agent Purchase Protection** — "existing cardmember protections extended to errors made by registered AI agents". **The only named liability product in the field.** |
| **Visa Intelligent Commerce Connect** | Visa | **2026-04-08** | A single Visa endpoint that **translates between TAP, MPP, ACP and UCP**. An institutional admission that no single protocol wins. |
| **Alibaba/Ant Agentic Commerce Trust Protocol** | Ant | Live at scale | **Alipay processed 120 million AI-initiated payments in one week in Feb 2026** ([BusinessWire](https://www.businesswire.com/news/home/20260213770962/en/Alipay-AI-Payment-Exceeds-120-Million-Transactions-in-One-Week-as-Agentic-Commerce-Accelerates-in-China)) — roughly an order of magnitude more than all Western deployments combined. |

**FACT-medium:** Mastercard Agent Pay is live across nine APAC markets **including India**, plus a LatAm wave; Mastercard + Santander completed "Europe's first live end-to-end agent-initiated payment" in a **controlled environment** (Mar 2026). Architecture is a **layered SD-JWT credential set** (L1 issuer-bound identity, L2 user-signed intent with optional autonomous-mandate constraints, L3 short-lived agent-signed fulfillment). Mastercard open-sourced the **Verifiable Intent** spec.

---

## 7. MCP — how agents actually call commerce tools

> ✅ **§7.2–§7.6 and §7A are primary-sourced**: ACP's `docs/mcp-binding.md`, the MCP `2026-07-28` and `2025-11-25` specifications and `schema.ts`, the MCP SEP/PR history via `gh api`, IETF Datatracker, and live `curl` against production key directories.
>
> ⚠️ **One methodological caveat that turned out to matter:** the MCP revision I read first (`2025-11-25`) is *not* current — see the version correction in §7.3. ACP's MCP binding links the older revision, which is itself a useful signal about how fast this layer is moving.

### 7.1 MCP is the transport in every live Indian deployment

**FACT** — Razorpay confirmed on the record that the Sarvam ↔ Razorpay handoff uses MCP:
> "Security measures at the MCP layer include **decoupled authorisation** and **context isolation against prompt injection attacks**."
> — Razorpay, [MediaNama, 2026-03-25](https://www.medianama.com/2026/03/223-razorpay-sarvam-ai-ai-agent-payments-indus-app/)

**FACT-medium:** MCP was donated by Anthropic to a neutral foundation (Agentic AI Foundation / Linux Foundation) in **December 2025**.
**FACT:** ACP added an **MCP module** in its 2026-04-17 release.
**FACT:** x402 has a normative MCP transport binding with `_meta` keys `"x402/payment"` and `"x402/payment-response"` (§5.2).
**FACT:** AP2's official MCP server is **not yet shipped**.
**FACT:** Cashfree "Here" is built for **OpenAI Apps SDK and Anthropic MCP**.
**FACT:** The Linux Foundation announced the x402 Foundation *at the MCP Dev Summit North America*.

### 7.2 ACP's MCP transport binding — read directly from `docs/mcp-binding.md`

> ✅ Verified at source on 2026-08-26. This is the most concrete commerce↔MCP binding published by any of the four protocols, and it is worth reading before designing any agent-facing commerce tool surface.

**FACT (verbatim):**
> "MCP is a **second transport binding for ACP, alongside REST**. … The binding is purely additive — the REST API, JSON Schemas, and protocol semantics are unchanged."

**Transport:** "JSON-RPC 2.0 over MCP's **Streamable HTTP** transport" — the doc links the **`2025-11-25`** MCP specification revision. Single endpoint, e.g. `/mcp`, separate from REST paths.

**Discovery (FACT — and directly reusable):**
> "ACP provides a well-known discovery document (**`/.well-known/acp.json`**) that advertises the seller's capabilities, supported API versions, and available transports. When a seller supports MCP, the **`transports` array** in the discovery document includes `"mcp"`."

*(Compare UCP's `/.well-known/ucp` profile — §6.1. Two protocols, same pattern, different path.)*

**The five tools — verbatim, one per REST operation:**

| MCP Tool | REST Operation |
|---|---|
| `create_checkout_session` | `POST /checkout_sessions` |
| `get_checkout_session` | `GET /checkout_sessions/{id}` |
| `update_checkout_session` | `POST /checkout_sessions/{id}` |
| `complete_checkout_session` | `POST /checkout_sessions/{id}/complete` |
| `cancel_checkout_session` | `POST /checkout_sessions/{id}/cancel` |

> "All 5 operations are exposed as MCP **Tools, not Resources**. Checkout sessions are transient, agent-driven objects… MCP Resources are better suited for future capabilities like product catalog access or order history."

**Argument structure:** every call is `{ "meta": {...}, "id": "...", "payload": {...} }`, with `payload` `$ref`-ing the existing ACP request schemas.

**🔴 Two security-relevant findings:**

**(a) `Authorization` is deliberately kept out of the tool schema — verbatim, and this is good practice worth copying:**
> "The `Authorization` header is **intentionally excluded** from `meta`. MCP servers handle authentication at the connection level (via server configuration or OAuth), not per tool call. **Including bearer tokens in tool arguments would expose them in tool schemas visible to LLMs.**"

**(b) The MCP binding *downgrades* idempotency.** In the REST spec `Idempotency-Key` is **`required: true`** — "MUST be present on all POST requests" (§3.3). In the MCP header-mapping table `meta.idempotency_key` is **Required: No**, "Recommended for create and complete". `meta.signature` and `meta.timestamp` are likewise **No**.

**INFERENCE (high confidence):** the MCP transport is **weaker than the REST transport on both replay protection and request authenticity** for the same operations. Combined with open issue #294 (§3.3), an ACP-over-MCP checkout has *no mandatory* integrity control at all. **This is a real, citable defect and a legitimate thing to fix in a build.**

**PCI warning, verbatim:**
> "When an MCP server operates as a proxy to a merchant's REST API, the proxy processes all tool arguments **including payment instrument tokens** in `complete_checkout_session`. Proxy operators that handle payment data **SHOULD** evaluate PCI DSS scope requirements. … **Third-party hosted proxies that inspect or log payment payloads may be in PCI scope even if they do not store card data.**"

**Error mapping:** all ACP errors use JSON-RPC code **`-32000`** uniformly; "consumers **MUST** inspect `data.type` and `data.code`". `-32602` is reserved for envelope-level malformity. `data.type` ∈ {`invalid_request`, `request_not_idempotent`, `processing_error`, `service_unavailable`}. Auth failures (401/403) currently surface as `data.type: invalid_request` "**until ACP introduces dedicated authentication/authorization error types**".

**FACT (negative finding):** `docs/mcp-binding.md` contains **no reference to MCP tool annotations** (`readOnlyHint` / `destructiveHint` / etc.), **no elicitation**, and **no user-consent requirement** anywhere. Section headings are: Overview, Tool Definitions, Argument Structure, Header Mapping, Response Mapping, Error Handling, Capability Negotiation, Conformance, Scope, Security Considerations.

**INFERENCE:** ACP's MCP binding is a pure transport mapping. **It delegates every human-in-the-loop decision to the MCP client, and says nothing about it** — even though `complete_checkout_session` moves real money.

### 7.3 The MCP base spec — authorization and consent, read at source

> 🔴 **VERSION CORRECTION.** I first read revision `2025-11-25` (the revision ACP's MCP binding links). **That is not current.** `modelcontextprotocol.io/specification/latest` **307-redirects to `/specification/2026-07-28`**. Published set: `2024-11-05`, `2025-03-26`, `2025-06-18`, `2025-11-25`, **`2026-07-28`**, `draft`. Authoritative schema: `schema/2026-07-28/schema.ts`. Both revisions are cited below and **labelled**.

#### 🔴 `2026-07-28` breaking changes that will bite a commerce build (FACT, from the changelog)

- **MCP is now stateless.** The `initialize` / `notifications/initialized` handshake is **removed**; every request carries `_meta` keys `io.modelcontextprotocol/protocolVersion` and `io.modelcontextprotocol/clientCapabilities` (SEP-2575).
- 🔴 **`Mcp-Session-Id` and protocol-level sessions are REMOVED** (SEP-2567). Cross-call state must be a **server-minted handle passed as an ordinary tool argument**. *For carts and checkout sessions this is the single most consequential change* — and note it is exactly what ACP already does with `checkout_session_id`.
- New **`server/discover`** RPC — servers **MUST** implement it.
- **MRTR (Multi Round-Trip Requests)** replaces server-initiated requests (SEP-2322). Server returns `InputRequiredResult` (`resultType: "input_required"`) carrying `inputRequests`; the client retries the *original* request with `inputResponses`. All results now carry a required `resultType`.
- `ping`, `logging/setLevel`, `notifications/roots/list_changed` removed. SSE resumability (`Last-Event-ID`) removed. Tasks moved to extension `io.modelcontextprotocol/tasks`.
- **Roots, Sampling and Logging are DEPRECATED** (SEP-2577, Final, 2026-04-14). Sampling page verbatim: *"New implementations **SHOULD NOT** adopt it; existing implementations **SHOULD** migrate to integrating directly with LLM provider APIs."*

**INFERENCE:** with Sampling and Roots deprecated, the client→server surface is effectively **just Elicitation**. Design around that.

**Authorization — FACT, verbatim normative language:**
- "A protected MCP server acts as an **OAuth 2.1 resource server**"; "An MCP client acts as an **OAuth 2.1 client**". Referenced draft: **`draft-ietf-oauth-v2-1-13`**.
- "Authorization servers **MUST implement OAuth 2.1** with appropriate security measures"
- "MCP servers **MUST implement OAuth 2.0 Protected Resource Metadata (RFC 9728)**"; "MCP clients **MUST use** OAuth 2.0 Protected Resource Metadata for authorization server discovery."
- Discovery at `/.well-known/oauth-protected-resource` (root) **or** `/.well-known/oauth-protected-resource/<mcp-path>`; clients "**MUST support both discovery mechanisms**".
- "MCP clients **MUST implement Resource Indicators for OAuth 2.0 as defined in RFC 8707**… MUST use the **canonical URI** of the MCP server."
- "MCP servers **MUST validate that access tokens were issued specifically for them as the intended audience**"; **token passthrough is "explicitly forbidden"** (confused-deputy risk).
- 🔴 **Dynamic Client Registration (RFC 7591) is now DEPRECATED** in `2026-07-28` (PR #2858) — verbatim *"retained for backwards compatibility with authorization servers that do not support Client ID Metadata Documents."* **Do not build on DCR.** `SHOULD` is reserved for **OAuth Client ID Metadata Documents (CIMD)**, `draft-ietf-oauth-client-id-metadata-document-00`. *(In `2025-11-25` DCR was still `MAY`; this changed.)*
- PKCE `S256` **MUST**; clients **MUST refuse to proceed** if `code_challenge_methods_supported` is absent.
- RFC 9207 `iss`: AS **SHOULD** include; clients **MUST** validate a present `iss` by exact string comparison before redeeming the code.
- **RFC 8707 `resource` MUST be sent in BOTH authorization and token requests, regardless of AS support.** Servers **MUST** validate audience and **MUST NOT** accept or transit any other tokens.
- Step-up auth: `403` + `WWW-Authenticate: Bearer error="insufficient_scope", scope="…", resource_metadata="…"`.
- Authorization is **OPTIONAL** overall; HTTP transports **SHOULD** conform; **STDIO SHOULD NOT** (use env credentials).
- Confused deputy: proxies with static client IDs **MUST** obtain user consent per dynamically registered client.
- Extensions at `modelcontextprotocol/ext-auth`: **OAuth Client Credentials** (M2M) and **Enterprise-Managed Authorization**.

#### 🔴 Human-in-the-loop: the "must" is not a MUST

**FACT — the consent language sits in NON-normative prose; the RFC-2119 language is only SHOULD.**

The spec overview's "Security and Trust & Safety" section uses a **lowercase, non-RFC2119** must: *"Hosts **must** obtain explicit user consent before invoking any tool."* Immediately followed by: *"While MCP itself cannot enforce these security principles at the protocol level, implementors **SHOULD**: 1. Build robust consent and authorization flows…"*

`/server/tools`, verbatim:
> "implementations are free to expose tools through any interface pattern that suits their needs—**the protocol itself does not mandate any specific user interaction model.**"
> "For trust & safety and security, there **SHOULD** always be a human in the loop with the ability to deny tool invocations. Applications **SHOULD**: Provide UI that makes clear which tools are being exposed… Insert clear visual indicators when tools are invoked… **Present confirmation prompts to the user for operations**, to ensure a human is in the loop"

**INFERENCE (high confidence):** **There is no protocol-level enforcement of pre-purchase approval anywhere in MCP.** Layer that on ACP's MCP binding — which says nothing about consent and makes signing optional (§7.2) — and **an ACP-over-MCP purchase has no protocol-mandated human checkpoint and no protocol-mandated request authenticity.** Both are pushed onto the implementer. *This is a legitimate build thesis.*

#### Tool annotations — exact names, verified in `schema.ts`

**FACT** — `interface ToolAnnotations` (schema.ts L1912–1954):

| Field | Default | Meaning |
|---|---|---|
| `title?: string` | — | |
| **`readOnlyHint?: boolean`** | **false** | |
| **`destructiveHint?: boolean`** | **true** | meaningful only when `readOnlyHint == false` |
| **`idempotentHint?: boolean`** | **false** | |
| **`openWorldHint?: boolean`** | **true** | |

Also on Tool: `outputSchema`, and an `execution` object with `taskSupport: "forbidden" (default) | "optional" | "required"`.

Schema comment, verbatim: *"NOTE: all properties in `ToolAnnotations` are **hints**… Clients should never make tool use decisions based on `ToolAnnotations` received from untrusted servers."* Spec Warning: *"clients **MUST** consider tool annotations to be untrusted unless they come from trusted servers."*

**INFERENCE:** annotations are advisory. Marking `capture_payment` as `destructiveHint: true` **obligates nothing**. A merchant's own MCP server declaring its `complete_checkout_session` non-destructive is not something a client may rely on — trust must come from elsewhere, which is exactly the agent-identity gap (Gap 4). *(A **Tool Annotations Interest Group** exists — facilitators from GitHub and OpenAI, participants from Cloudflare, Microsoft, Nordstrom — chartered to assess whether these four hints suffice. Repo `experimental-ext-tool-annotations`.)*

#### 🟢 Elicitation — and the one genuinely NORMATIVE payment rule in all of MCP

**FACT, verbatim, and this is the most directly actionable sentence in this entire document for a Razorpay build:**

> "Servers **MUST NOT** use **form mode** elicitation to request sensitive information such as passwords, API keys, access tokens, or **payment credentials**. Servers **MUST** use **URL mode** for interactions involving such sensitive information."

Two modes:
- **`form`** — structured JSON Schema, **flat objects with primitive properties only**, data exposed to the client.
- **`url`** — out-of-band; data other than the URL is **not** exposed to the client. Params `mode: "url"`, `message`, `url`. Actions: `accept` | `decline` | `cancel`.

URL mode (introduced in `2025-11-25`), verbatim: *"essential for auth flows, **payment processing**, and other sensitive or secure operations."* ⚠️ **`accept` means consent to open the URL, not completion** — the server correlates the outcome itself via its own `requestState` on retry. In `2026-07-28`, `notifications/elicitation/complete` and `elicitationId` were **removed**; correlation is now `requestState` under MRTR.

Client obligations, verbatim: clients **MUST** show which server is asking, provide decline/cancel, allow review/modify in form mode, and *"For URL mode, **clearly display the target domain/host and gather user consent before navigation**."*

> **⛏️ This is the spec-blessed handoff.** URL-mode elicitation is *the* sanctioned way for an MCP server to bounce the user to a hosted Razorpay checkout / UPI mandate page mid-tool-call — and it is the only place MCP puts a **MUST** anywhere near payments.

#### MCP has no payments primitive, and the proposal to add one is dead

**FACT:**
- **SEP-2007, "Add MCP Payment Support Specification"** (PR #2007, created 2025-12-23) proposed a `payment` capability (`{"protocols": ["x402"]}`), payment info in `tools/list`, and JSON-RPC error **`-32402`**. **CLOSED UNMERGED 2026-06-24**, maintainer comment verbatim: *"This SEP has not received a sponsor in the past 6 months and is considered dormant."* Companions #2008 and #2009 also closed.
- **Issue #3229** "RFC: Native Token Metering, Session Budgets, and Payment Tracking (x402)" — opened 2026-08-11, **closed 2026-08-23**.
- `gh search issues "monetiz"` in the spec repo → **0 results**.
- There is **no payments or commerce working group.** The closest is the **Financial Services Interest Group** (facilitator at Bloomberg), scoped to compliance, auditability, lineage, attestation, policy enforcement — **payments explicitly not in scope**.
- Related **open, unmerged**: **SEP-2752** "HTTP Message Signing for MCP Client Authentication" (RFC 9421 proof-of-possession, opened 2026-05-19) and **SEP-2127** "MCP Server Cards" (proposes `.well-known/ai-catalog.json`).

**INFERENCE (high confidence):** payments in MCP are a **vacuum by decision, not by oversight.** x402 and MPP fill it from outside via `_meta` (§5.2). That vacuum is the clearest standards-shaped hole in the landscape.

### 7.4 🔴 Razorpay's official MCP server exposes **no agentic-mandate primitives**

Read directly from [`razorpay/razorpay-mcp-server`](https://github.com/razorpay/razorpay-mcp-server) (Go, **MIT**, **229★**, last push **2026-08-25**).

**FACT — the ~45 exposed tools cover:** payments (`capture_payment`, `fetch_payment`, `initiate_payment`, `resend_otp`, `submit_otp`, …), payment links, orders, refunds (`create_refund`, `fetch_refund`, …), QR codes, settlements, payouts, tokens (`fetch_tokens`, `revoke_token`), registration links, and two integration helpers (`detect_stack`, `integrate_razorpay_checkout`).

**FACT — what is NOT there:** **no tool for UPI Reserve Pay**, no block/mandate creation, no spend-limit setting, no mandate-balance query, no mandate revocation, no agent-scoped authorization. The words "Reserve Pay", "agentic", and "mandate" do not appear in the tool table.

**INFERENCE (high confidence — the single most actionable finding here):** Razorpay ships (a) a live UPI Reserve Pay agentic rail and (b) an official MCP server — **and the two are not connected in the open-source surface.** An agent using `razorpay-mcp-server` today cannot create, inspect, bound, or revoke a Reserve Pay block. A concrete, demonstrable, buildable gap in Razorpay's own stack.

**FACT (security-relevant):** `resend_otp` and `submit_otp` are exposed as MCP tools. **INFERENCE:** an LLM handling OTP submission is a prompt-injection-shaped risk surface, and it is the exact step AFA exists to protect. It also brushes against RBI's customer-negligence definition (§10.6).

### 7.5 Human-in-the-loop primitives, by protocol

| Protocol | Native escalation primitive | Evidence |
|---|---|---|
| **UCP** | `requires_escalation` status + `continue_url` handoff + ECP embedded checkout | **FACT**, verbatim |
| **AP2** | **Trusted Surface** role, which **MUST be non-agentic**; user signs the Mandate there | **FACT**, verbatim |
| **UPI Circle** | **Partial delegation** — agent/secondary initiates, primary approves with UPI PIN | FACT-medium |
| **UPI Reserve Pay** | Consent shifted to *mandate setup only*; **no per-transaction escalation** | FACT |
| **ACP** | ✅ `requires_escalation`, `authentication_required`, `pending_approval` session states — **but no `continue_url`-style handoff mechanism** | **FACT**, read from `openapi.agentic_checkout.yaml` |
| **x402** | `EVIDENCE NOT FOUND` | — |
| **MCP** | Tool annotations / elicitation — **not verified in this pass** | `EVIDENCE NOT FOUND` |

**INFERENCE:** UCP is the only protocol that pairs an escalation *state* with a defined escalation *mechanism* (`continue_url` + ECP embedded checkout). ACP declares the states but leaves the handoff to the implementer. **UPI Reserve Pay has neither** — once the block is set, every debit inside it is unattended.

---

### 7.6 Commerce MCP servers that exist today

All verified via `gh api` / vendor docs, 2026-08-26.

| Vendor | Repo | Official? | Remote endpoint | Auth | Tools |
|---|---|---|---|---|---|
| **Razorpay** | `razorpay/razorpay-mcp-server` (MIT, 229★) | Yes — *"Razorpay's Official MCP Server"* | **`https://mcp.razorpay.com/mcp`** | **HTTP Basic** (`Basic base64(key:secret)`) — *not* OAuth | ~45, one per endpoint |
| **Stripe** | **`stripe/ai`** (renamed from `stripe/agent-toolkit`; MIT, 1,763★) | Yes | `https://mcp.stripe.com` | **OAuth 2.1**, restricted-API-key fallback; `Stripe-Account` for Connect | **16**, incl. 4 generic gateways |
| **PayPal** | `paypal/agent-toolkit` (Apache-2.0, 189★) | Yes | `https://mcp.paypal.com` | client ID+secret → Bearer | ~44 |
| **Shopify** | Storefront MCP (docs only) | Yes | `https://{shop}.myshopify.com/api/mcp` and **`/api/ucp/mcp`** | **None** — *"don't require authentication"* | see below |
| **Square** | `square/square-mcp-server` (Apache-2.0, 107★) — **Beta** | Yes | `https://mcp.squareup.com/sse` (**legacy SSE**) | OAuth / `ACCESS_TOKEN` | **3** |
| **Adyen** | `Adyen/adyen-mcp` (25★) — **Alpha** | Yes | **None** — local only | `ADYEN_API_KEY` | 38 |
| **WooCommerce** | in core 10.3 | Yes — "developer preview" | self-hosted | — | — |
| **Amazon** / **BigCommerce** / **Pine Labs** | — | `EVIDENCE NOT FOUND` (`pinelabs/pinelabs-mcp-server` 404) | | | |

**🔴 Design divergence worth acting on (INFERENCE).** Stripe collapses ~100 API methods into four generic gateways (`stripe_api_search` / `_details` / `_read` / `_write`) — verbatim rationale *"without increasing the context window unnecessarily."* Square goes further: **only three tools** (`get_service_info` → `get_type_info` → `make_api_request`). **Razorpay's ~45 one-tool-per-endpoint design is the outlier among PSPs and is a real context-budget liability.** Four Razorpay tools are unavailable on the remote server: `create_refund`, `close_qr_code`, `create_instant_settlement`, `create_registration_link`.

**FACT:** searching the official MCP registry for `razorpay` returns exactly one entry — the **unofficial** `io.github.indiamcp/razorpay`. **Razorpay's own server is not registered.** Low-effort, high-visibility gap.

**Shopify tool names (FACT, verbatim):** `/api/mcp` → `get_cart`, `update_cart`, `search_shop_policies_and_faqs`. **`/api/ucp/mcp` → `search_catalog`, `lookup_catalog`, `get_product`** — and Shopify's docs say verbatim *"Storefront MCP implements the **UCP Catalog capability** and its MCP binding."* Requires an agent profile in `meta: {"ucp-agent": {profile: "…"}}` on every request. **This endpoint is unauthenticated and testable during a hackathon right now.**
*(`Shopify/consumer-agent-mcp` is ARCHIVED; `Shopify/dev-mcp` does not exist as a repo — npm `@shopify/dev-mcp` only.)*

**UCP's MCP bindings — concrete tool names (FACT):**

| Capability ID | Tools |
|---|---|
| `dev.ucp.shopping.checkout` | `create_checkout`, `update_checkout`, `complete_checkout` |
| `dev.ucp.shopping.catalog.search` / `.lookup` | `search_catalog`, `lookup_catalog`, `get_product` |
| `dev.ucp.shopping.cart` | `create_cart`, `get_cart`, `update_cart`, `cancel_cart` |
| `dev.ucp.shopping.order` | `get_order` |

> ⚠️ **ACP and UCP tool names collide semantically but differ lexically:** ACP `create_checkout_session` / `complete_checkout_session` vs UCP `create_checkout` / `complete_checkout`; UCP `get_cart`/`update_cart` vs Shopify Storefront's identically-named but *different* tools. **Any adapter must not assume interchangeability.**

**FACT — OpenAI Apps SDK / ChatGPT apps.** `developers.openai.com/apps-sdk` now **redirects to `/plugins`**. It is MCP-native (Tools, Resources, Prompts, Instructions over streamable HTTP, *"the authorization flow defined by the MCP specification"*, now with CIMD). Checkout: default is external redirect; the beta embedded path is **`window.openai.requestCheckout()`** → ChatGPT payment sheet → ChatGPT invokes a **`complete_checkout`** tool on your MCP server. Test mode `payment_mode: "test"`.

> 🔴 **Supported PSPs, verbatim: Stripe, PayPal, Adyen, Checkout.com, Fiserv, Worldpay. Razorpay is not on this list.**

**FACT:** Stripe's own selection table at `docs.stripe.com/agentic-commerce` reads verbatim: *"**Protocol used** | UCP or ACP | MPP or x402"* — i.e. a commerce-API layer over a machine-payments layer. **MPP** (`mpp.dev`, Stripe + Tempo) even ships a guide literally titled **`/guides/monetize-mcp-server`** — *"Add payments to your MCP server. Charge per tool call."* npm `mppx` 0.8.19.

---

## 7A. Merchant "agent-readability" — what a merchant must actually do

### 7A.1 llms.txt — real convention, largely hype as a crawler contract

**FACT.** Proposed by **Jeremy Howard** (Answer.AI), byline **2024-09-03**. Repo `AnswerDotAI/llms-txt` (Apache-2.0, 2,586★). **A v2 shipped August 2026** — most online commentary still describes v1.

Format: optional BOM → **H1 (the only required section)** → blockquote summary → markdown sections *except headings* → H2-delimited file lists of `[name](url): notes`. v2 adds **`.md` page twins**, discovery via **`rel="alternate" type="text/markdown"`** and **`rel="describedby"`**, deliverable as an HTTP **`Link:`** header. **v2 explicitly rejects `/.well-known/`.**

**`llms-full.txt` is a Mintlify convention, NOT in the spec.** Verified: `docs.anthropic.com/llms.txt` = 63,970 B; **`docs.anthropic.com/llms-full.txt` = 39,763,086 B (~39.8 MB)** — larger than any production context window.

**🔴 Google has denied it three times on the record** (all verified as primary Bluesky posts):
- **John Mueller, 2025-06-17:** *"**FWIW no AI system currently uses llms.txt.**"* and *"…**none of them fetch the llms.txt file**."*
- **Gary Illyes, 2025-07-31:** *"it's very easy to draw a parallel between 1990's keywords meta tag and this, and we all know how… useful the keywords meta tag became, very fast"*
- **Mueller, 2026-01-20**, asked if Google hosting `ai.google.dev/api/llms.txt` is an endorsement: *"…**to be direct, no.**"*

**Negative evidence — occurrences of "llms.txt" in crawler docs:** Google common-crawlers **0**, Google crawlers overview **0**, Google AI features **0**, Anthropic crawler FAQ **0**. OpenAI's bots doc: 1 — *the Mintlify publisher banner*. Perplexity: 2 — *both the Mintlify banner*. All four describe control **exclusively via robots.txt**.

`EVIDENCE NOT FOUND`: **no OpenAI, Anthropic, Google or Perplexity statement that their crawler consumes llms.txt.**

The strongest pro-signal is Google's own, and it needs reading carefully: **Chrome Lighthouse ships an "Agentic browsing" audit category** (updated 2026-05-05) with an llms.txt audit, plus `WebMCP integration`, `Registered WebMCP tools`, `Forms missing declarative WebMCP`, `WebMCP schema validity`. But it is a **developer diagnostic, not Googlebot**; it is **experimental (Chrome 150+)**; and verbatim: *"If the file is not provided… the audit is marked **Not Applicable (N/A)**"* — **not having one costs you nothing.**

> **Verdict (INFERENCE):** ship it, cost ≈ 0; **never pitch it**. The defensible claim is *"we serve `.md` page twins with `rel=alternate` / `rel=describedby` `Link:` headers per llms.txt v2"* — not *"ChatGPT reads our llms.txt."*

### 7A.2 schema.org Product / Offer

Extracted programmatically from `schema.org/version/latest/schemaorg-current-https.jsonld` (3,219 nodes); verbatim `rdfs:label` values.

**`ItemAvailability` — all 12:** `BackOrder`, `Discontinued`, `InStock`, `InStoreOnly`, `LimitedAvailability`, `MadeToOrder`, `OnlineOnly`, `OutOfStock`, `PreOrder`, `PreSale`, `Reserved`, `SoldOut`.
⚠️ **Google supports only 10** — `MadeToOrder` and `Reserved` are absent from Google's list, and Google instructs *"Don't specify more than one value."*
**`OfferItemCondition`:** `DamagedCondition`, `NewCondition`, `RefurbishedCondition`, `UsedCondition` — **Google supports only 3** (no `DamagedCondition`).

**`Offer` commerce properties:** `price`, `priceCurrency`, `priceSpecification`, `priceValidUntil`, `availability`, `availabilityStarts`/`Ends`, `inventoryLevel`, `itemCondition`, `sku`, `mpn`, `gtin`/`gtin8`/`12`/`13`/`14`, `asin`, `hasGS1DigitalLink`, `shippingDetails`, `hasMerchantReturnPolicy`, `seller`, `offeredBy`, `eligibleQuantity`, `eligibleRegion`, `acceptedPaymentMethod`, `availableDeliveryMethod`, `deliveryLeadTime`, `validFrom`/`validThrough`, `validForMemberTier`, `businessFunction`, and — **flag this one** — **`checkoutPageURLTemplate`**, a merchant-supplied deep-link template into checkout.

> **INFERENCE:** `checkoutPageURLTemplate` is the closest thing in core schema.org to an "agent, buy this" affordance, and it is almost entirely unused.

`MerchantReturnPolicy` carries `returnPolicyCategory`, `merchantReturnDays`, `merchantReturnLink`, `returnMethod`, `returnFees`, `restockingFee`, `refundType`, `returnLabelSource`, `applicableCountry`, `inStoreReturnsOffered` — **the richest machine-readable returns vocabulary in the landscape, and no agentic protocol consumes it.**

**Agent-specific schema.org work: `EVIDENCE NOT FOUND`.** Latest release **30.0 (2026-03-19)**. The 2025–26 direction is GS1 / UN-CEFACT / EU Digital Product Passport interop plus `OnlineMarketplace` (29.4) — **no agent class, no agentic-commerce terms.** Google's agent-facing work sits *outside* schema.org: Lighthouse/WebMCP and UCP in Merchant Center.

### 7A.3 Product feed specs — required-field comparison

**Google Merchant Center — unconditionally required:** `id` · `title`|`structured_title` · `description`|`structured_description` · `link` · `image_link` · `availability` · `price`. Conditional: `brand`, `mpn`, `condition`, `gtin` (*"strongly recommended"*), `shipping` (required for **IN**, AU, AT, BE, CA, CZ, FR, DE, IE, IL…), `age_group`/`gender`, `certification`, `availability_date`.
`availability` values, exactly four: **`in_stock`, `out_of_stock`, `preorder`, `backorder`**.
🔴 **New and agent-relevant:** `structured_title`/`structured_description` carry **`digital_source_type`** with exactly two values — **`default`** (*"not created using generative AI"*) and **`trained_algorithmic_media`** (*"created using Generative AI"*). Provenance labelling for AI-written merchandising copy, driven partly by **India's** AI rules.

**ACP feed** (`schema.feed.json`): `Product` requires **`id`, `variants`**; `Variant` requires `id`, `title`; `Price` requires `amount` (**integer, minor units**) + `currency` (`^[A-Z]{3}$`). **Enums are deliberately OPEN** ("Known values include…"), not JSON Schema `enum`s. Two architectural facts, verbatim: *"The Product Feed API is **hosted by the agent**… **Agents MUST NOT call Product Feed API endpoints on merchants**"*, and feeds are non-authoritative — *"Agents MUST treat checkout responses as authoritative even when they differ from feed data."*

**UCP Catalog:** `Product` requires **`id` (Global ID), `title`, `description`, `price_range`, `variants`**. Its **`quantity_unit`** (UN/CEFACT unit codes, e.g. `{"unit":"LBR","scale":2,"increment":25}`) is **more expressive than any other spec surveyed — no other feed handles sell-by-weight or metered pricing this precisely.**

**Microsoft MMC:** 16 required fields — and **`description` is NOT among them**, a real divergence from Google. `availability` values use **spaces** (`in stock`). Several fields annotated *"MMC does not use this field; it's included for **Google compatibility**."*

**The universal core (INFERENCE, high confidence)** — exactly five concepts are required by *every* feed spec surveyed:

> **`id` · `title` · `price` (+currency) · `image` · `availability`**

`link`/`url` is required by both **ad-driven** feeds (Google, Microsoft) but **optional** in both **agent-native** protocols (ACP, UCP). **INFERENCE:** agents transact via API rather than navigating, so the URL degrades from transaction requirement to citation nicety.

**Five structural divergences to design around (INFERENCE):**
1. **Money.** Google uses decimal strings (`15.00 USD`); ACP **and** UCP independently converged on **integer minor units + separate ISO 4217 code**. Normalize internally to that.
2. **Closed vs open enums.** Google/Microsoft validate closed enums; ACP uses open extensible strings; UCP uses reverse-DNS capability IDs. You must **map**, not pass through.
3. **Flat row vs Product→Variant.** Google/Microsoft are flat with post-hoc `item_group_id`; ACP and UCP are natively two-level. **Largest transform cost moving from ad feeds to agentic feeds.**
4. **Push vs pull.** Google/Microsoft/ACP: merchant pushes (and in ACP the *agent* hosts the feed API). UCP/Storefront MCP/NLWeb: agent pulls live — which removes feed staleness entirely.
5. 🔴 **Authority.** ACP and UCP both declare feed pricing **non-authoritative** and checkout **authoritative**. No such concept exists in ad feeds. **This is the key safety property the agentic protocols added, and it is the right default to copy.**

> ⚠️ **"Shopify Universal Cart" — `EVIDENCE NOT FOUND`, and actively falsified.** Shopify's complete sitemap (43,433 URLs) has **zero** case-insensitive matches for "universal"; `gh search repos "shopify universal cart"` → empty. **HYPOTHESIS: a garbling of the real UCP Cart Capability. Say "UCP Cart Capability."**

**Microsoft NLWeb — real, but it moved:** canonical repo is **`nlweb-ai/NLWeb`** (MIT, 6,250★); `microsoft/NLWeb` redirects there. Endpoints **`/ask`** and **`/mcp`**; every NLWeb instance is also an MCP server supporting method `ask`; results carry a **`schema_object`** (the item as schema.org JSON). Verbatim: *"**NLWeb is to MCP/A2A what HTML is to HTTP.**"* ⚠️ the README's cited spec URL `nlweb.ai/spec` **404s**; the real spec is `docs/nlweb-rest-api.md`.

### 7A.4 Agent identity on the open web — the IETF picture

**FACT — exact draft, and the commonly-cited name is superseded.** `draft-meunier-web-bot-auth-architecture` exists but is **Replaced**. The current document is:

> **`draft-meunier-webbotauth-httpsig-protocol-02`** — *"HTTP Message Signatures for automated traffic"*, **T. Meunier (Cloudflare)** and **S. Major (Google)**, dated **18 August 2026**, Standards Track, expires 2027-02-19.

**FACT — the WG is real but has adopted nothing.** Acronym **`webbotauth`**, active, charter **Approved 2025-10-23**, AD Mike Bishop. But `?name__startswith=draft-ietf-webbotauth` → **total_count 0**. Everything is individual submissions.

**Mechanism, verbatim.** Builds on **RFC 9421**. Headers `Signature`, `Signature-Input`, and **`Signature-Agent`** — new, a Dictionary Structured Header whose member values MUST be `https` URI Strings. Required `@signature-params`: at least one of `@authority`/`@target-uri`; `created`; `expires` (≤24h recommended); **`keyid` MUST be a base64url RFC 7638 JWK SHA-256 Thumbprint**; **`tag` MUST be `web-bot-auth`**. Key discovery has three `type` values: **`directory`** (default; `/.well-known/http-message-signatures-directory`, media type `application/http-message-signatures-directory+json`, body a JWKS), **`jwks_uri`**, and **`cimd`** — *the same OAuth Client ID Metadata Document mechanism MCP auth now prefers.*

**🔴 The trust model — quote this, it kills a lot of hand-waving:**
> §4.1: *"A client picks the value it sends, so an **unresolved Signature-Agent is a claim rather than an identity**… verifiers MUST NOT attach policy to it."*
> §4.1: *"A valid signature… **says nothing about who operates the Agent, whether the Agent is benign, or whether the request is authorized.**"*
> §4.6: *"This protocol **does not authenticate human users**, does not provide anonymous authentication, and **does not define authorization or delegation**."*
> §7.2: *"The key used for signing MUST NOT be tied to a specific human individual."*
> Charter out-of-scope: *"Authenticating the end user"* and *"Authenticating access to content not intended for human consumption (e.g., HTTP APIs, **agent-to-agent interfaces**)"* — **MCP servers are explicitly out of charter scope.**

> **INFERENCE — this is the crux of Gap 4:** Web Bot Auth answers **"which agent"** and formally **refuses** to answer **"on whose behalf."** That refusal is the gap the whole agentic-commerce stack is currently building around.

**It is LIVE today — two production key directories, verified by curl:**
- **`https://chatgpt.com/.well-known/http-message-signatures-directory`** → 200, Ed25519 JWKS, plus non-standard members `"signature_agent":"https://chatgpt.com"` and `"purpose":"ai"`.
- **`https://agent.bot.goog/.well-known/http-message-signatures-directory`** → 200, 5 Ed25519 keys. Google's doc (updated 2026-05-04): *"A **subset** of requests made by the `Google-Agent` are signed… authenticated as `https://agent.bot.goog`"*, header `Signature-Agent: g="https://agent.bot.goog"`, and *"**We don't sign every request.**"*
- ⚠️ **Live interop split:** Google sends the **dictionary** form (`g="…"`); Cloudflare's docs *require* the **legacy bare-string** form and explicitly troubleshoot *"use a structured string, not a dictionary."* **Handle both.**

**The buyer-vs-scraper flag exists only in an individual `-03` draft.** `draft-meunier-webbotauth-registry-03` ("Signature Agent Card", authors incl. Kirazci/Amazon and Meunier/Cloudflare) defines `web_bot_auth.trigger`: **`fetcher`** = request initiated by the user; **`crawler`** = autonomous scanning. Two of its members are literally marked **"TODO: specify a format."** Not deployable — a design north star.

**Cloudflare (FACT, verbatim):**
- *"**Signed agents are now Verified.** As of July 1, 2026… a new metadata field tracked in **BotBase**: **Direct** versus **Intermediary** access."* Behaviour taxonomy includes **`Transact` — "Checkout or other transaction actions on behalf of users."**
- The key sentence: *"Because an **intermediary** acts on behalf of many different end users… This introduces **transitive trust**… Cloudflare is **experimenting with forwarding information about the end user (using the `Forwarded` header defined in RFC 7239)**."* → **INFERENCE: an experiment, not a contract. Do not build merchant policy on it.**
- **Pay per crawl** (private/closed beta) wire protocol: `HTTP/2 402` + `crawler-price: USD 0.01` → client sends `crawler-exact-price` or `crawler-max-price` → `200` + `crawler-charged: USD 0.01`. **Crucially, payment headers MUST be in the `signature-input` covered components** — i.e. **Pay Per Crawl = Web Bot Auth + signed price headers.** Cloudflare is Merchant of Record.

**robots.txt — and the distinction that actually matters for commerce:**

| Vendor | Training | Search | **User-triggered (= your buyer)** |
|---|---|---|---|
| OpenAI | `GPTBot` | `OAI-SearchBot` | **`ChatGPT-User`** |
| Anthropic | `ClaudeBot` | `Claude-SearchBot` | **`Claude-User`** |
| Google | `Google-Extended` (token only) | `Googlebot`, `Storebot-Google` | **`Google-Agent`** |
| Perplexity | — | `PerplexityBot` | **`Perplexity-User`** |
| Meta | `meta-externalagent` | `meta-webindexer` | **`meta-externalfetcher`** |

Vendor words, verbatim: OpenAI — *"**Because these actions are initiated by a user, robots.txt rules may not apply.**"* Perplexity — *"**Since a user requested the fetch, this fetcher generally ignores robots.txt rules.**"* Meta — *"…including helping AI navigate websites to complete tasks for users. Accordingly, **this crawler may bypass robots.txt rules**."*

> **INFERENCE: a `Disallow` on the user-triggered fetchers buys you nothing but lost sales.** Cloudflare's own managed robots.txt default blocks **training crawlers only** and deliberately leaves the fetchers alone.

⚠️ **A real fork in the road (INFERENCE):** Cloudflare's *deployed* `Content-Signal:` directive (`search`/`ai-input`/`ai-train`, values `yes`/`no`) and IETF's `Content-Usage:` (`search`/`train-ai`, values `y`/`n`, `draft-ietf-aipref-attach-05`) disagree on **directive name, token names, AND value encoding**. `ai-input` exists in the deployed one and not the IETF one. The IETF content-signals draft `draft-romm-aipref-contentsignals-00` **EXPIRED 2026-04-04**, and `draft-ietf-aipref-vocab-07` carries the front-matter warning *"its contents **DO NOT REFLECT CONSENSUS** of the Working Group."* **Anyone parsing robots.txt in 2026 must handle both.**

**Visa TAP is the most complete real answer to "on whose behalf" today.** Three linked signatures: an agent-recognition signature in the header (*"based on the HTTP Message Signatures defined by RFC 9421 [and **aligned with web-bot-auth**]"*), an Agentic Consumer Recognition Object in the body, and an Agentic Payment Container. Two tags, verbatim: **`agent-browser-auth`** (browsing) and **`agent-payer-auth`** (checkout) — *"If the header does not contain a message signature with a Signature-Input field containing a tag of either agent-browser-auth or agent-payer-auth, the message has not been signed by a trusted agent."* Replay window **8 minutes** plus nonce cache. The `idToken` is a Visa-signed JWT (`typ` = `JWT+ext.id_token`) with **obfuscated** `email`/`phone_number` plus `email_mask`/`phone_number_mask` — *"the Merchant must also maintain a mapping table."* It also defines a **`browsingIOU`** used *"if the Merchant has requested payment using a **402 response code**."* Keys at `mcp.visa.com/.well-known/jwks` (verified 200).

> ⚠️ **Mastercard Agent Pay — `EVIDENCE NOT FOUND` for a normative spec.** `developer.mastercard.com/llms.txt` (486 KB full product index) has **zero** matches for "Agent Pay". `host agentpay-key-directory.mastercard.com` → **NXDOMAIN**. And a research trap worth remembering: `developer.mastercard.com/product/agent-pay/` returns HTTP **200** — but so does `product/this-does-not-exist-xyz123`. **It is a JS SPA that 200s every path; a 200 there is not evidence.** Treat Agent Pay's wire details as HYPOTHESIS-grade.

One genuinely useful Mastercard line, verbatim: *"**Consumer-owned agents will not have scheme credentials — and that is expected**… avoid blocking agents solely because they lack scheme registration."*

**Bridging payments and identity (FACT):** x402's `specs/extensions/http-message-signatures.md` verbatim *"establishes the **identity** of the paying agent through cryptographic signatures (**RFC 9421**)"*, with `tags: ["web-bot-auth", "agent-browser-auth"]` — **the payments stack already points at IETF Web Bot Auth and Visa TAP tags.**

#### What a merchant can actually do today — a four-signal ladder (INFERENCE)

Evaluated in order, **none allowed to hard-block on its own**:
1. **Verify RFC 9421** `Signature`/`Signature-Input`/`Signature-Agent`; resolve the URL, fetch the JWKS, verify. Accept **both** dictionary and legacy string forms. Validate `created`/`expires`/`nonce`. Two real agents (ChatGPT, Google-Agent) are testable end-to-end today.
2. **Route on `tag`:** `web-bot-auth` (generic) vs `agent-browser-auth` / `agent-payer-auth` (Visa) — **this gives you browse-vs-buy intent, cryptographically bound, for free.**
3. **Fallback:** UA token + published IP prefix + rDNS. Never the sole basis for allow.
4. **"On whose behalf" comes only from the payments layer** — Visa `idToken`, AP2 Mandate, or ACP `Buyer` — and treat ACP's `Buyer` as **unauthenticated PII**.

Two things worth saying out loud in a demo, both primary-sourced: **(a)** a valid signature proves *nothing about authorization* (`httpsig-protocol-02` §4.1); **(b)** the correct default for an unsigned agentic request is **CNP fraud controls, not a block** (Mastercard's own guide; Google's *"we don't sign every request"*).

**Aspirational, not deployable:** a cross-vendor agent registry; a standard "on whose behalf" HTTP signal; a single robots.txt AI-preference vocabulary; `trigger: fetcher` vs `trigger: crawler`.

---

## 8. Open-source implementations

All measured via `gh api` on **2026-08-26**.

### 8.1 Protocol specs & reference implementations

| Repo | ★ | Lang | Licence | Last push | Notes |
|---|---:|---|---|---|---|
| [`x402-foundation/x402`](https://github.com/x402-foundation/x402) | 6,542 | TypeScript | — | 2026-08-25 | **Canonical.** LF project. `coinbase/x402` is a fork. |
| [`Universal-Commerce-Protocol/ucp`](https://github.com/Universal-Commerce-Protocol/ucp) | 3,328 | Python | Apache-2.0 | 2026-08-25 | [ucp.dev](https://ucp.dev) |
| [`agentic-commerce-protocol/agentic-commerce-protocol`](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol) | 1,523 | JavaScript | Apache-2.0 | 2026-07-18 | **No release since 2026-04-17** |
| `google-agentic-commerce/AP2` | — | — | Apache-2.0 | merged nothing since 2026-04-29 | [ap2-protocol.org](https://ap2-protocol.org), v0.2 |
| `google-agentic-commerce/a2a-x402` | — | — | — | stale | AP2↔x402 bridge; double-pinned to obsolete versions |
| [`visa/trusted-agent-protocol`](https://github.com/visa/trusted-agent-protocol) | 196 | Python | — | 2025-10-28 | |
| [`cloudflare/web-bot-auth`](https://github.com/cloudflare/web-bot-auth) | 149 | Rust | — | 2026-08-22 | "Sign and verify orchestrated HTTP requests" — the shared identity primitive |
| [`forter/trusted-agentic-commerce-protocol`](https://github.com/forter/trusted-agentic-commerce-protocol) | 179 | JavaScript | — | 2026-07-08 | |
| `tempoxyz/mpp-specs` | — | — | — | — | MPP method specs |
| [`lightninglabs/L402`](https://github.com/lightninglabs/L402) | — | — | — | — | |

### 8.2 Agent authorization / identity — Grantex

[`mishrasanjeev/grantex`](https://github.com/mishrasanjeev/grantex) — TypeScript, **Apache-2.0**, 31★, last push 2026-08-21, [grantex.dev](https://grantex.dev). **The delegation layer Pine Labs P3P uses.** Spec **v1.0 Final** (Feb 2026, frozen). IETF `draft-mishra-oauth-agent-grants`. SDKs `@grantex/sdk` 0.3.13, `grantex` 0.3.14 (PyPI), `grantex-go` v0.1.10; plus `@grantex/mcp` and `@grantex/mcp-auth`.

**Primitives (FACT, read directly from `SPEC.md`)** — the most implementation-ready agent-authorization model available, and already wired into an Indian PSP:

- **Agent identity:** `did:grantex:<ULID>` resolving to an identity document with `declaredScopes` and a `JsonWebKey2020` `verificationMethod`. Identity Services **MUST use RS256**; public keys **MUST** be published at `/.well-known/jwks.json`; key rotation MUST be supported without changing the DID.
- **Scope grammar:** `resource:action[:constraint]` — e.g. `payments:initiate:max_500`. Standard registry includes `payments:read`, `payments:initiate`, `payments:initiate:max_N`. Custom scopes use reverse-domain notation.
- **Grant Token:** RS256 JWT with custom claims `agt` (Agent DID), `dev` (developer org), `grnt` (Grant ID for revocation lookup), `scp` (scopes).
- **Revocation:** `DELETE /v1/grants/{grantId}`, `POST /v1/tokens/revoke`, online check `POST /v1/tokens/verify`. "Implementations caching revocation state **MUST NOT cache for longer than 5 minutes**. High-stakes scopes (`payments:initiate`, …) **SHOULD always use online verification**."
- **TTL guidance:** payments → **1 hour**; standard tasks → 8h; background agents → 24h max.
- **Audit trail:** append-only **hash chain**. `hash = SHA-256(entryId + agentId + grantId + action + status + timestamp + metadata_canonical + prevHash)`, canonical JSON with sorted keys. "This makes any retrospective tampering detectable."
- **Multi-agent delegation:** sub-agent tokens carry `parentAgt`, `parentGrnt`, `delegationDepth`. "Sub-agent scopes **MUST be a subset** of the parent's scopes"; default depth limit **3**, hard cap **10**; "The original Principal can revoke the root Grant to invalidate the entire chain." Endpoint `POST /v1/grants/delegate`.
- Ships published **DPDP** and **EU AI Act** control mappings.

> ⚠️ Grantex publishes its own limitations — a good sign, but heed them: "MCP Auth `2.0.2` keeps authorization codes **in process memory**, does not render consent, and has an **incomplete Grantex code handoff**." Read `COMPATIBILITY.md` and `release-status` first.

### 8.3 PSP MCP servers

| Repo | ★ | Lang | Licence | Last push | Notes |
|---|---:|---|---|---|---|
| [`razorpay/razorpay-mcp-server`](https://github.com/razorpay/razorpay-mcp-server) | 229 | Go | MIT | 2026-08-25 | Official. ~45 tools. **No Reserve Pay / mandate tools** (§7.2). |
| Pine Labs MCP Server | — | — | — | — | Documented under pinelabs.com/docs → AI Solutions → MCP Server. Repo URL `EVIDENCE NOT FOUND`. |

### 8.4 Dispute / trust layers — thin, and that's the point

| Repo | ★ | Lang | Last push | Notes |
|---|---:|---|---|---|
| [`internet-court/internet-court-skill`](https://github.com/internet-court/internet-court-skill) | 4,874 | TypeScript | 2026-08-19 | "The trust layer for agent-to-agent commerce — natural-language mandates, ERC-7710 delegated permissions, x402 payments, escrow, and **dispute resolution**". Frames the problem exactly: *"The building blocks already exist, but they are fragmented, and **each one is built for the happy path. When a deal goes wrong, every layer passes the problem down the line.**"* Its layer table names **verification & disputes** as "the layer nobody else owns". Crypto/escrow-native (GenLayer, Kleros, UMA) — **not applicable to UPI**. |
| `x402r` / `zauth` | — | — | — | Third-party x402 refund + arbitration extensions. Neither first-party. |
| [`NVIDIA-AI-Blueprints/Retail-Agentic-Commerce`](https://github.com/NVIDIA-AI-Blueprints/Retail-Agentic-Commerce) | 68 | Python | 2026-08-24 | Reference implementation of **both ACP and UCP** |
| [`Custena/agent-payment-protocols`](https://github.com/Custena/agent-payment-protocols) | 10 | — | 2026-04-20 | Best single secondary landscape source found |

### 8.5 🔴 The UPI × agentic intersection is essentially empty

`gh search repositories "UPI agentic payments agent"`, top results, 2026-08-26:

| Repo | ★ | Last push |
|---|---:|---|
| `alokemajumder/OpenAgentPay` | 2 | 2026-03-30 |
| `amarpathak/upiagent` | 1 | 2026-04-24 |
| `dharmik-at/x402-UPI` | 1 | 2025-09-13 |
| `sumitkumar24b/TrustGate` | 1 | 2026-08-23 |
| `CODER7657/pramana` | 1 | 2026-08-26 |

**FACT:** the highest-starred open-source project at the UPI × agentic-payments intersection has **2 stars**.

**INFERENCE (high confidence):** This is greenfield. Compare x402 6,542★, UCP 3,328★, ACP 1,523★. Every serious open-source agentic-commerce artifact assumes cards or crypto. **Nobody has built the UPI equivalent.**

---

## 9. 🔴 UNSOLVED PROBLEMS / GAPS

The highest-value section. Each gap is stated with evidence that it is genuinely open, not merely under-documented.

### Gap 1 — Who bears the loss when an agent buys the wrong thing

**The regulatory position: there isn't one — anywhere.**

**FACT:** "As of 2026, **no jurisdiction has enacted regulation specifically addressing autonomous AI purchasing.**" — [Justt, 2026-06-30](https://justt.ai/blog/ai-agent-chargeback-liability/) (tier 4)

**FACT (primary, and this is the Indian version of the same finding):** an **RBI site-wide search for `agentic`** on 2026-08-26 returned **1 of 1 records** — the non-binding FREE-AI committee report, and there only in its glossary. Two 2026 RBI speeches on AI (Governor Malhotra, 11 Aug 2026; DG Murmu, 19 Aug 2026) contain **zero occurrences of "agent."**

**FACT-medium (corroborated by two independent passes; no scheme primary found by either):** **Neither Visa nor Mastercard has published a binding chargeback rule specific to agent-initiated disputes.** The absence appears real, not a research gap. And **Visa VAMP / Mastercard ECM dispute-ratio thresholds apply unchanged** to agent-initiated transactions.

**The three-party problem** (Justt, verbatim):
> "The consumer delegated authority to the agent, but arguably **did not authorize this specific action**. The AI provider built the reasoning engine that made the call, but **did not initiate the transaction directly**. The merchant accepted the order, but **had no way to verify the intent behind it**. Three parties potentially to blame. None of them a slam dunk case."

**The industry's actual position — Razorpay, on the record:**
> "**the introduction of agentic shopping does not rewrite the rules of commercial liability.**"

Razorpay's split, per MediaNama:
- **Merchant** (e.g. Swiggy) handles the dispute and refund if the agent orders the wrong item
- **Razorpay** bears liability for **payment security**
- **Sarvam** (the AI interface layer) bears **no financial liability**

**INFERENCE (high confidence):** Under this split, **the entity that made the wrong decision — the model — carries zero liability**, and the merchant absorbs the cost of a mistake it neither made nor could detect. That is the load-bearing structural defect of agentic commerce right now.

MediaNama's roundtables reached no consensus twice ([2025-10](https://www.medianama.com/2025/10/223-razorpay-npci-openai-agentic-payments-upi-chagpt/), [2026-06](https://www.medianama.com/2026/06/223-pine-labs-agentic-payments-protocol-upi-liability-privacy-questions/)), flagging **reversibility** as the key variable: "agentic purchases that can be easily resolved by returning items could have lower liability than decisions that cannot be reversed." Razorpay concurs: "A food order is reversible. **Higher value transactions may not be.**"

**What RBI's own committee says it *should* be (FREE-AI, non-binding), verbatim:**
> **Sutra 5 — Accountability:** "**Accountability rests with the entities deploying AI.** … remain **fully accountable for the decisions and outcomes** that arise from the use of these systems, **regardless of their level of automation or autonomous functioning.** … **Accountability cannot be delegated to the model and underlying algorithm.**"
> **¶4.4.49:** "**REs must remain liable for the actions and outcomes of the autonomous AI systems they deploy**, just as they are for other forms of operational or technological risk."

**But** the June 2026 liability amendment — issued **ten months after** FREE-AI — **does not codify this.** The gap is real and documented.

**What the protocols do and don't do:**
- **AP2** produces the evidence, declares dispute resolution/retention/retrieval **explicitly out of scope**
- **ACP** keeps the merchant as MoR and has **no refund or dispute endpoint at all**
- **x402** has no shippable reversal primitive; `auth-capture` can't even answer "who supplies refund liquidity"
- **P3P** markets "verifiable receipt… supports dispute resolution" but "**has not stated who actually bears liability**"
- The only commercial answer anywhere: **Amex Agent Purchase Protection**

> **⛏️ Exploitable:** AP2 hands you the exact hook it declined to build — *"would be done by using the Payment Mandate `transaction_id` as the key to request it."* Build a **mandate-retrieval and scope-conformance adjudicator**: ingest Checkout Mandate + Receipt + Payment Mandate + Receipt, mechanically execute AP2's five MUST verification steps, and emit a deterministic verdict — *"the agent was / was not within the user's signed authority."* No one owns this and the spec asks for it by name.

### Gap 2 — The evidence that would settle a dispute is not being captured

**FACT:** "merchants pay by default since **traditional evidence like device fingerprints and browsing history doesn't exist** for agent-initiated transactions" — Justt.

The four evidence classes merchants will need but nobody emits ([Chargeflow](https://www.chargeflow.io/blog/agentic-commerce-chargebacks-the-evidence-playbook-merchants-need), verbatim):
> - "**Delegated authority proof**: Documentation that the consumer granted the AI agent permission to make purchases on their behalf
> - **Parameter records**: The rules, limits, and constraints the customer set for the agent, including spending caps, category restrictions, and approval requirements
> - **Scope compliance**: Evidence that the agent acted within the parameters the customer defined, not outside them
> - **Notification timestamps**: Proof that the customer was notified about the purchase in real time and had the opportunity to cancel or modify the order"

**And the volume problem is psychological, not fraud-driven:**
> "You do not need more actual fraud for agentic commerce to increase your dispute volume. **The psychological distance between your customer and an agent-initiated purchase is enough.** … When an AI agent handles the entire process, the customer has no emotional connection to the purchase. The charge appears on their statement like any other unfamiliar transaction, and the natural response is to dispute it."

New dispute categories fitting no existing reason code: *AI agent buys the wrong product* ("a gray area between 'not as described' and buyer's remorse"), *AI agent exceeds spending authority*, *AI agent misses pricing errors*, *"I didn't authorize that"* ("The broadest risk").

**This is doubly urgent in India** because under the post-1-Jan-2027 regime **"The burden of proving customer liability in complaints involving fraudulent EBTs shall lie on the bank"** (§10.5, ¶76K) — so whoever can *produce* the agent's authority trail decides the outcome.

> **⛏️ Exploitable:** an **agent-transaction evidence recorder** — middleware between the agent and the PSP emitting a signed, hash-chained record of (delegated authority, parameter set, per-transaction scope-conformance decision, notification timestamp). Grantex's audit hash-chain (§8.2) is a ready-made primitive; nothing binds it to UPI transactions today.

### Gap 3 — The authorization is coarse exactly where it needs to be fine

| Rail | What the user can bound |
|---|---|
| **AP2 Payment Mandate** | payees, instruments, PISPs, amount range, recurrence frequency + max occurrences, cumulative budget, execution-date window, binding to a specific checkout — **8 constraint types** |
| **AP2 Checkout Mandate** | allowed merchants, allowed line items with quantities |
| **Grantex** | `payments:initiate:max_N`, arbitrary reverse-domain custom scopes, TTL, delegation depth |
| **ACP `Allowance`** | max amount, currency, one checkout session, one merchant, expiry — and **`reason` has exactly one legal value, `one_time`**. No recurrence, no budget. |
| **UPI Reserve Pay** | **one number (≤₹10,000) and one date (≤90 days), per merchant.** That's it. |
| **UPI Circle / OC 201-B** | ₹5,000/txn, ₹15,000/month, per Device |

**INFERENCE (high confidence):** India's live agentic rail offers **an amount and an expiry**. It cannot express *category*, *item*, *counterparty-within-merchant*, *frequency*, *time-of-day*, or *per-transaction ceiling distinct from the block total*. Every richer constraint in the field has to be enforced **above** the rail, by software nobody has written for UPI.

The demand is articulated and unmet — MediaNama's editor proposing exactly this:
> "**Limits**: … Limit max amount per transaction, say Rs 100 by default. Limit number of transactions (5) and amount transacted per month (Rs. 500). Limit transactions per day (1), per week (2)."
> "**Identity**: Step one has to be to give agents their **own delegated handles**… something like `agent-nixxin@ybl`… **Separate agent PIN, on by default.**"
> — Nikhil Pahwa, [MediaNama, 2026-07-10](https://www.medianama.com/2026/07/223-npci-agentic-payments-upi/)

> **⛏️ Exploitable:** a **policy/constraint engine for UPI Reserve Pay** implementing AP2's eight constraint types (or Grantex's scope grammar) as a deterministic gate in front of Razorpay's payment APIs — turning "₹10,000 for 90 days" into "≤₹300/txn, ≤5 txns/week, groceries only, Zepto and BigBasket only, not between 00:00–06:00, hard stop at ₹2,000/month." Every constraint is already specified verbatim by AP2; **none exists on UPI**.

### Gap 4 — Agent identity has converged everywhere except India

**FACT:** Visa TAP, Mastercard Agent Pay and Amex all delegate agent authentication to **Web Bot Auth / RFC 9421**, with `keyid` resolved from a network-hosted public-key directory, a `tag` distinguishing browse-vs-purchase, and a `nonce` for replay protection (§6.2, verbatim).
**FACT:** AP2 uses `did:` / SD-JWT VCs over OpenID4VP with a Trusted Surface that MUST be non-agentic.
**FACT:** Grantex uses `did:grantex:<ULID>` with JWKS at `/.well-known/jwks.json`.

`EVIDENCE NOT FOUND`: **any agent-identity mechanism on UPI** exposed to merchants. NPCI OC 201-B does require the Secondary PSP to capture and validate a **Device ID and/or user profile ID on every payment request**, and the issuer to validate **both** before debiting — but that is a closed bank-to-bank check, not a merchant-verifiable credential, and the **NPCI-authorised device/software allowlist has not been published**.

UAP is *reported* to intend exactly this ("registered, verified, and authorised") but has no spec.

**And the standard itself formally refuses to close the gap — verbatim, `draft-meunier-webbotauth-httpsig-protocol-02`:**
> §4.6: *"This protocol **does not authenticate human users**, does not provide anonymous authentication, and **does not define authorization or delegation**."*
> §4.1: *"A valid signature… **says nothing about who operates the Agent, whether the Agent is benign, or whether the request is authorized**."*

**INFERENCE:** "which agent" is solved and deployed (ChatGPT and Google-Agent both serve live key directories today — §7A.4). **"On whose behalf" is unsolved by design**, and every payments protocol is independently reinventing an answer: Visa's `idToken`, AP2's user-signed Mandate, ACP's plaintext `Buyer` object, Cloudflare's *experimental* `Forwarded` header. **This is the deepest structural gap in the landscape.**

> **⛏️ Exploitable:** a **Web Bot Auth profile for UPI merchants** — an RFC 9421 verifier a Razorpay-integrated merchant can drop in, resolving agent keys from a directory, accepting both the dictionary and legacy `Signature-Agent` forms, enforcing nonce-uniqueness, routing on the `agent-browser-auth` vs `agent-payer-auth` tag, and **binding the verified agent identity to the Reserve Pay block that authorised it** — supplying the "on whose behalf" half that the IETF draft explicitly declines to. The missing link between global identity convergence and India's actual rail.

### Gap 5 — No per-transaction human-in-the-loop on the Indian rail

**FACT (Razorpay, on the record):**
> "**UPI Reserve Pay doesn't skip authentication; it merely shifts it to the beginning of the journey.**"

Accurate — and the whole problem. Once the mandate is set, **every debit inside the block is unattended**.

Contrast: **UCP** has `requires_escalation` + `continue_url`; **AP2** has a Trusted Surface that MUST be non-agentic; **UPI Circle partial delegation** has PIN-per-transaction but is person-shaped and "coming soon" on Razorpay.

**And there is a hard regulatory cliff at the top of the range.** Under the E-mandate Framework 2026 (§10.3) AFA-free recurring transactions stop at **₹15,000**; above that AFA is required — and there is no human present to supply it. MediaNama poses it directly: "**It is not clear how P3P handles a single agent-initiated payment above that limit, given there is no human present to authenticate it.**"

> **⛏️ Exploitable:** a **risk-tiered escalation layer** — implement UCP's `requires_escalation` semantics over UPI Reserve Pay. Below a policy threshold the agent debits silently; above it, the agent is forced into a `continue_url` handoff producing a genuine human confirmation. This is the missing safety valve, it maps onto an already-standardised state machine, **and it is the only clean way to serve transactions above the ₹15,000 AFA cliff.**

### Gap 6 — Refunds go to the account, not to the agent's understanding

`EVIDENCE NOT FOUND` — **no protocol here specifies where a refund lands in the agent's model, who initiates it, or how a refund settles back into a mandate's consumed budget.**

Concrete open questions with no cited answer:
- If an agent spent ₹800 of a ₹10,000 Reserve Pay block and the merchant refunds ₹800, does `amount_remaining` restore? NPCI says issuers must "debit only utilized amounts"; the **refund path is `EVIDENCE NOT FOUND`**.
- **AP2's `payment.budget` says "the amount MUST be added to the accumulated total for future evaluation" — and says nothing about subtracting on refund.** A real, readable hole in a live spec.
- **ACP has no refund or dispute endpoint at all.**
- x402's `auth-capture` cannot answer "who supplies refund liquidity."
- Who is the counterparty for a return when the buyer never visited the merchant's site?

> **⛏️ Exploitable:** **refund-aware budget accounting.** AP2's budget constraint is monotonically increasing with no decrement rule. Implementing — and upstreaming — refund reconciliation against a mandate's consumed budget is a small, precise, demonstrably-missing piece of a live spec.

### Gap 7 — Replay, duplicate orders, and the specs' own admissions

**FACT (AP2 Checkout Mandate, verbatim):**
> "NOTE: This evaluation does not support splitting the open Checkout Mandate across multiple Checkouts. Future constraint extensions can add this support, but consideration must be given to **how multiple duplicate orders can be prevented**."

**FACT (ACP issue #294, unresolved):** "Mutating REST requests do not have a consistent mandatory signature and freshness contract" — `Signature` is MUST in the RFC and `required: false` in the OpenAPI.

Web Bot Auth solves replay with `nonce` + `created`/`expires` + a uniqueness cache. AP2 binds mandate-to-checkout with `checkout_hash` and forbids deterministic signatures. P3P claims tokens "cannot be replayed, redirected, or reused."

**INFERENCE:** replay protection exists in the identity layer and in AP2, is **broken in ACP**, and is `EVIDENCE NOT FOUND` on UPI Reserve Pay — where NPCI specifies a *retry policy* ("up to 3 times in 24 hours"), not an idempotency guarantee.

### Gap 8 — Data governance is undisclosed

**FACT:** asked what transaction data goes to AI providers vs stays with the PSP, **Pine Labs CEO Amrish Rau declined to answer.** "Whether the user's prompts, transaction records and spending behaviour are stored, passed to AI providers such as OpenAI or Anthropic, or used to train their AI models, **has not been disclosed**." — MediaNama, 2026-06-12
**FACT:** Sarvam AI did not respond to queries on how voice data is stored and processed.

**INFERENCE:** every live Indian agentic payment flow routes purchase intent through a foreign LLM provider, and no participant has publicly stated its DPDP consent basis or data-residency posture. See §10.7 — **an agent that decides for itself what to buy is plausibly a Data Fiduciary in its own right**, with a full standalone-notice / purpose-limitation / 90-day-DSAR obligation set arriving ~May 2027.

### Gap 9 — Ten protocols, zero interoperation

**FACT-medium:** "more than ten payment protocols launched to let AI agents spend money on their own… **None of them interoperate.**" The same companies back several at once: **Stripe is an ACP lead maintainer AND on UCP councils AND an x402 Premier member AND co-authored MPP.** Visa's institutional response is **Intelligent Commerce Connect**, a single endpoint translating between TAP, MPP, ACP and UCP. **INFERENCE:** that product exists because interop is unsolved.

> **⛏️ Exploitable (India-shaped, and the lowest-friction path of all):** a **UCP payment handler for UPI Reserve Pay**. UCP's design explicitly invites it — *"each provider—whether it's Google, Shopify, or a **regional PSP**—publishes their own handler specification… New payment methods grow into the ecosystem **without committee votes or core version bumps**."* No permission needed, no TSC sponsor required (contrast Razorpay's four stalled ACP SEPs), namespace self-asserted by domain ownership. **This is the single lowest-friction way to put UPI into a global agentic protocol.**

### Gap 10 — MCP has no payments primitive, and the proposal to add one was closed

**FACT:** SEP-2007 "Add MCP Payment Support Specification" was **closed unmerged on 2026-06-24** for lack of a sponsor; the follow-up issue #3229 was closed 2026-08-23; there is **no payments or commerce working group** (§7.3). x402 and MPP fill the vacuum from outside, via `_meta["x402/payment"]` and an HTTP-402 challenge respectively.

**And the one normative payment sentence MCP does have points straight at a hosted checkout:**
> "Servers **MUST NOT** use form mode elicitation to request… **payment credentials**. Servers **MUST** use **URL mode**."

> **⛏️ Exploitable — and this is probably the single best-shaped build in the document.** MCP mandates URL-mode elicitation for anything touching payment credentials, and mandates that the client *"clearly display the target domain/host and gather user consent before navigation."* That is, verbatim, **a spec-required human consent checkpoint bound to a merchant-controlled URL** — i.e. exactly the shape of a Razorpay-hosted checkout / UPI mandate page invoked mid-tool-call. Nothing in the Indian stack uses it. Combine with Gap 5's risk-tiered escalation and you get a defensible answer to the ₹15,000 AFA cliff *that the MCP spec itself asks for*.

### Gap 11 — The Indian liability cliff arrives 1 January 2027

Fully developed in §10.6. In short: **INFERENCE (high stakes, needs legal verification)** — a debit executed under a validly-registered, AFA-authenticated e-mandate is, on the plain text of RBI's new definition, an **authorised** transaction. It is therefore **not** an "Unauthorised EBT", **not** a "Fraudulent EBT", and the zero-liability provisions do not engage. **The customer bears the loss.** The three escape routes — third-party breach, bank negligence, and the customer-negligence trap — are set out in §10.6 and each is directly actionable in a design.

---

## 10. India regulatory constraints

**All RBI text in this section is primary, captured by driving a real browser against rbi.org.in on 2026-08-26.** All NPCI circular text is **secondary** (npci.org.in blocked).

### 10.1 The hard numbers that constrain every Indian agentic build

| Rail | Cap | Source quality |
|---|---|---|
| **UPI Reserve Pay (SBMD)** | **₹10,000 per merchant, ≤90 days, one block per merchant per customer** | FACT-medium (2 trackers + Razorpay on record) |
| **UPI Circle / OC 201-B (software delegate)** | **₹5,000/txn, ₹15,000/month per Device**, domestic P2M only, ≤5 Devices, 24-hr cooling at ₹5,000 | FACT-medium (law-firm analysis) |
| **E-mandate AFA-free ceiling** | **₹15,000 per transaction** (₹1,00,000 for insurance premium / mutual-fund subscription / credit-card bill only) | **FACT (RBI primary)** |

Razorpay confirms the first on the record:
> "The spending cap is up to **Rs 10,000 per mandate**, valid for up to **90 days**. Users can revoke the mandate anytime and receive real-time notifications for every debit."

**INFERENCE (high confidence):** any India agentic-commerce demo is today a **low-ticket, high-frequency** demo. NPCI says so explicitly ("verified online merchants with low-ticket, high-frequency transactions"). Groceries, food, recharges, small subscriptions. Not electronics, not travel, not B2B procurement.

### 10.2 AFA — Additional Factor of Authentication

**FACT (primary):**
> **Reserve Bank of India (Authentication mechanisms for digital payment transactions) Directions, 2025**
> **RBI/2025-26/79 · CO.DPSS.POLC.No. S 668/02-14-015/2025-2026 · 25 September 2025**
> [rbi.org.in/Scripts/NotificationUser.aspx?Id=12898](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12898&Mode=0)
> §3: "shall ensure compliance with these directions by **April 01, 2026**."

Lineage: Statement on Developmental and Regulatory Policies 08 Feb 2024 → draft on alternative authentication 31 Jul 2024 → draft on AFA for cross-border CNP 07 Feb 2025 → final Directions 25 Sep 2025.

**Non-OTP factors are permitted — FACT, verbatim:**
> §5: "The factors of authentication can be from **"something the user has", "something the user knows" or "something the user is"** and may comprise, inter-alia, password, SMS based OTP, passphrase, PIN, card hardware, software token, fingerprint, or any other form of biometrics"
> §6(a): "All digital payment transactions shall be authenticated by **at least two distinct factors** … unless exempted." Issuers "**may, at their discretion, offer a choice** of authentication factors."
> §6(b): "for digital payment transactions, other than card present transactions, **at least one of the factors of authentication is dynamically created or proven**, i.e., the proof of possession … is **unique to that transaction**."
> §6(c): "compromise of one factor does not affect reliability of the other."

**Delegated / agent authentication is NOT contemplated — FACT (negative finding).** The word "agent" does not appear. Every factor is defined as a **"Credential of the customer"**, and §5 defines authentication as *"Process of validating and confirming the credentials of **the customer who is originating the payment instruction**."*

**The complete exemption list (Annexure-1) — the only ways out of 2FA:**

| # | Use case |
|---|---|
| 1 | Small-value contactless card transactions |
| 2 | **Recurring transactions (other than the first) under the e-mandate framework** |
| 3 | Select PPIs — PPI-MTS and Gift PPIs |
| 4 | NETC (FASTag) |
| 5 | Small-value offline-mode digital payments |
| 6 | Travel bookings via GDS/IATA on commercial/corporate cards |

**"AI agent acting autonomously" is not on the list.** The only realistic fit is #2.

**Three more clauses that matter:**
> §8 (risk-based): issuers "may … identify transactions for evaluation against **behavioural / contextual parameters such as transaction location, user behaviour patterns, device attributes, historical transaction profile**" and add checks beyond the two-factor minimum.
> §9: "**If any loss arises out of transactions effected without complying with these directions, the issuer shall compensate the customer for the loss in full without demur.**" Issuers "shall ensure adherence to the provisions of the **Digital Personal Data Protection Act, 2023**."
> §7 (open access): tokenisation/authentication service must be "**accessible to all the applications / token requestors** functioning in that operating environment."

§10: by **1 October 2026** card issuers must validate non-recurring cross-border CNP where an overseas merchant requests authentication, and run a risk-based mechanism for all cross-border CNP.

### 10.3 E-mandate — the single most load-bearing document

**FACT (primary):**
> **Digital Payments – E-mandate Framework, 2026**
> **RBI/DPSS/2026-27/396 · RBI/CO.DPSS.POLC.No.S56/02.14.003/2026-27 · 21 April 2026**
> [rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13374](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13374)
> §1(b): "**effective immediately**." §2: applies to "all Payment System Providers and Payment System Participants … domestic or cross-border, **using cards / PPI / UPI**."

Issued under s.10(2) r/w s.18 PSS Act 2007. **Consolidates and repeals eight prior circulars**, including the dedicated UPI e-mandate circular of 10 Jan 2020 — **so UPI Autopay is governed by this framework.**

**§8 — the AFA-exemption cap, verbatim:**
> **(a) "All recurring transactions may be authorised without AFA up to ₹15,000/- per transaction. Transactions above this amount shall be subject to AFA."**
> **(b) "Payment of insurance premiums, subscription to mutual funds, and credit card bill payments may be made without AFA up to ₹1,00,000/- per transaction."**

*(History: ₹2,000 in Aug 2019 → ₹5,000 → ₹15,000 in June 2022 → ₹1,00,000 for the three named categories from Dec 2023. The 2026 framework carries both forward unchanged. **There is no higher general cap as of 2026-08-26.**)*

> ✅ This **verifies and corrects** the tier-3 MediaNama attribution used earlier in this research. The framework is real; the ₹15,000 figure is real; the correct citation is **RBI/DPSS/2026-27/396 dated 21 April 2026**, not a "Digital Payments E-Mandate Framework, 2026" of unstated provenance.

**§4–5 — every mandate touchpoint requires *customer* AFA, verbatim:**
> §4(a) "The mandate shall be registered only after **successful validation of additional factor of authentication (AFA)**"
> §4(b) validity period must be specified; customer may modify validity or **withdraw the e-mandate at any point of time**
> §4(c) for variable-amount mandates "the issuer shall provide the customer with a facility to **specify the maximum value** of any recurring transaction"
> §4(e) "**Any modification in, or withdrawal of, an existing e-mandate shall require AFA validation** by the issuer."
> §5(a) "**The first transaction under an e-mandate shall require AFA validation.**"
> §5(b) "**Payments under e-mandates shall not be subject to any other limits / controls set by the customer.**"

**§6 — pre-debit notification, verbatim:**
> §6(a) "An issuer shall send a pre-transaction notification to the customer, **at least 24 hours prior to the actual charge / debit**."
> §6(b) must state "the merchant's name, transaction amount, date / time of debit, reference number of e-mandate, reason for debit."
> §6(c) "The issuer shall provider a customer with a facility to **opt-out of any particular transaction or the e-mandate**. **Any such opt-out shall be validated by the issuer using AFA.**"
> §6(d) not required for **FASTag** and **NCMC** auto-replenishment.
> §7 post-transaction notification mandatory, with grievance-redressal details.

**§9(b) — the liability hook:** "**RBI instructions on limiting liability of customers for unauthorised transactions shall be applicable to recurring transactions under e-mandates as well.**"

**FACT (negative finding):** the 2026 framework contains **no** reference to AI agents, agentic payments, delegates, or third parties creating mandates on a customer's behalf. Everything is customer ↔ issuer with customer AFA.

> 🔴 **§6(a) is a product-shaping constraint that is widely overlooked: an agent cannot execute an impulse purchase under an e-mandate and have the debit land the same minute.** 24 hours' notice is mandatory. This is a large part of *why* Indian agentic payments run on Reserve Pay/SBMD blocks rather than classic e-mandates.

### 10.4 Card-on-File Tokenisation — why cards are the harder path

**FACT (primary chain):**

| Circular | Ref | Date |
|---|---|---|
| Tokenisation – Card transactions | RBI/2018-19/103, DPSS.CO.PD.No.1463/02.14.003/2018-19 | 08 Jan 2019 |
| Extending Scope of Permitted Devices | CO.DPSS.POLC.No.S-469/02-14-003/2021-22 | 25 Aug 2021 |
| Permitting CoFT Services | RBI/2021-22/96, CO.DPSS.POLC.No.S-516/02-14-003/2021-22 | 07 Sep 2021 |
| Restriction on Storage of Actual Card Data | RBI/2022-2023/95, CO.DPSS.POLC.No.S-760/02-14-003/2022-23 | 28 Jul 2022 |
| CoFT – Enabling Tokenisation through Card Issuing Banks | RBI/2023-24/91, CO.DPSS.POLC.No.S-919/02-14-003/2023-24 | **20 Dec 2023** |

> ⚠️ The issuer/network-level CoFT circular is **20 December 2023**, not 2024 as commonly stated. `EVIDENCE NOT FOUND` for any 2024/2025/2026 CoFT circular.

**Who may hold the PAN — verbatim:**
> 07 Sep 2021 ¶4: "With effect from January 1, 2022, **no entity in the card transaction / payment chain, other than the card issuers and / or card networks, shall store the actual card data.**"
> 28 Jul 2022 ¶3(b)(1): "the merchant or its Payment Aggregator (PA) … **can save the CoF data for a maximum period of T+4 days.**"
> 08 Jan 2019: "**Token requestors shall not store PAN or any other card detail.**"

**The decisive constraint — verbatim:**
> 07 Sep 2021 Annex ¶1: "For the purpose of CoFT, **the token shall be unique for a combination of card, token requestor and merchant.**"
> Annex ¶6: TSP must ensure "the transaction request has **originated from the merchant and the token requestor with whom the token is associated.**"
> ¶3(e): "Tokenisation of card data shall be done with **explicit customer consent requiring Additional Factor of Authentication (AFA) validation** by card issuer."

**Third-party provisioning is permitted, but narrowly — verbatim:**
> 2019: "permit authorised card payment networks to offer card tokenisation services to **any token requestor**" … "token requestor (i.e., **third party app provider**)" … "The **ultimate responsibility** for the card tokenisation services rendered rests with the authorised card networks."

**INFERENCE:** an AI agent could in principle be a **network-certified token requestor**. It could never be a TSP (issuer/network only), never hold a PAN, and never hold one portable token spendable anywhere — **each merchant needs its own token, provisioned with consent + AFA.** The binding constraint is **authentication, not tokenisation**: from 1 Apr 2026 an unattended agent card transaction must fit an Annexure-1 exemption, and the only realistic fit is the recurring e-mandate.

### 10.5 Payment Aggregator rules — never let the agent hold money

**FACT (primary):**
> **Reserve Bank of India (Regulation of Payment Aggregators) Directions, 2025**
> **RBI/DPSS/2025-26/141 · 15 September 2025** · [BS_ViewMasDirections id=12896](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896)
> *Date independently corroborated by the E-mandate Framework 2026 §3(a), which cites it by name and date.*

Repeals the 17 Mar 2020 PA/PG Guidelines, the 31 Mar 2021 amendment, and the **31 Oct 2023** PA-CB circular. *(⚠️ PA-CB is 31 Oct 2023 — `EVIDENCE NOT FOUND` for a "25 Jul 2022" PA circular; the 28 Jul 2022 circular is the CoF-storage one.)*

**The trigger — verbatim (2020 text, which states the principle most cleanly):**
> §1.1.2: "PGs are entities that provide technology infrastructure to route and facilitate processing of an online payment transaction **without any involvement in handling of funds**."
> §3.2: "**Bank and non-bank PAs handle funds** as part of their activities."

**The clause that kills open-web agent shopping — verbatim (2025 Directions):**
> ¶10(a): "**A PA shall aggregate funds only for the merchant with whom it has a contractual relationship.**"
> ¶10(b): "A PA business shall not carry out marketplace business."
> ¶16(a): non-bank PA must maintain collected funds "in a **separate escrow account** with any Scheduled Commercial Bank (SCB) in India."

**Merchant-of-record:** `EVIDENCE NOT FOUND` — the term does not appear in either the 2020 guidelines or the 2025 Directions. **INFERENCE:** RBI regulates by **fund flow and contract**, not by MoR.

> 🔴 **Design rule: the agent must never touch money.** An agent that authenticates the *user* into the *user's own* instrument, with funds moving user → existing PSP → merchant, sits on the PG side of the line. An agent that pools user funds and later pays merchants is squarely a PA — and ¶10(a) makes that **structurally impossible** for open-web shopping, because the agent has no contract with most merchants it would pay.

> ⚠️ Two items flagged for primary re-reading before relying on them: (i) the express "no non-bank shall undertake PA business without authorisation" sentence was not located in the 2025 Directions — the statutory hook is likely **s.4 PSS Act 2007**; (ii) the 2025 Directions appear to have **dropped the prescriptive Ts+1/Td+1/Tr+1 settlement timelines** in favour of "As per the agreement between the PA and the merchant". A "no mandated timeline" conclusion is high-consequence — verify Chapter V.

### 10.6 🔴 Liability — the regime has changed; do not build against the 2017 circular

**FACT.** The July 2017 "Limiting Liability of Customers in Unauthorised Electronic Banking Transactions" instructions were **consolidated into the RBI (Commercial Banks – Responsible Business Conduct) Directions, 2025**, and then **substantially rewritten** on 24 June 2026. Verbatim:

> "Instructions on '**Limiting Liability of Customers in Unauthorised Electronic Banking Transactions**' for Commercial Banks … have been **consolidated in the Reserve Bank of India (Commercial Banks - Responsible Business Conduct) Directions, 2025**. On a review, it has been decided to issue **revised instructions** on the subject."

> **Reserve Bank of India (Commercial Banks – Responsible Business Conduct) Third Amendment Directions, 2026**
> **RBI/2026-27/167 · DOR.MCS.REC.No.130/01-01-032/2026-27 · 24 June 2026** · [Id=13543](https://rbi.org.in/scripts/NotificationUser.aspx?Mode=0&Id=13543)
> Issued under s.35A, Banking Regulation Act 1949. Parallel amendments same day for SFBs (13544), Payments Banks (13545), RRBs (13547), UCBs (13548), Rural Co-ops (13549).
> **§3(2): "These Directions shall apply in cases of electronic banking transactions undertaken by customers of a bank on or after January 1, 2027."**

It deletes old section D (¶¶64–76) and substitutes **"DA. Customer Protection in Fraudulent Electronic Banking Transactions"**.

> ⚠️ **For transactions occurring TODAY (Aug 2026) it is the consolidated 2025 RBC text — not this amendment — that governs.** That consolidated text (§D ¶¶64–76) and the original 2017 rupee-liability table were **NOT retrieved**. `EVIDENCE NOT FOUND` — do not rely on remembered numbers.

**The definitions that decide the agent question — verbatim:**
> **4(26B)** "**Unauthorised electronic banking transaction (Unauthorised EBT) means an EBT which is not authorised by a customer** and inter alia includes an EBT occurring on account of negligence by a bank and / or a third-party breach."
> **4(15A)** "**Fraudulent EBT** means an EBT executed by a third-party using the credentials obtained from the customer through fraudulent means or executed by the customer by granting approval under coercion or duress from the third-party, and / or an unauthorised EBT as defined at paragraph 4(26B)."
> **4(26.1A)** "**Third-party breach** means a situation where the deficiency lies neither with the bank nor with the customer but lies elsewhere in the system and **includes deficiency on the part of an intermediary such as a Third-Party Application Provider (TPAP), Payment Aggregator (PA), Payment Gateway (PG), Telecom Service Provider (TSP), etc.**"
> **4(20C)** "**Negligence by a customer** inter alia includes… (i) failing to exercise reasonable care in usage of credentials such as PIN, password, OTP or other details (e.g., **providing credentials for carrying out transactions to another person, whether intentionally or otherwise**…)"

**Liability allocation — verbatim:**
> **76K.** "The **burden of proving customer liability** in complaints involving fraudulent EBTs shall lie **on the bank**."
> **76L.** **Zero liability** where the fraudulent EBT occurs due to **negligence / deficiency on the part of the bank**, "**irrespective of whether the transaction is reported by the customer or not**."
> **76M.** **Zero liability** in cases of **third-party breach** where the customer reports "**within five calendar days** from the date of its occurrence." After five days, liability is "**as per the bank's policy**."
> **76N.** Where the fraudulent EBT occurs due to **negligence by the customer**, the customer "**shall be liable for the loss** … **until he / she reports** the fraudulent EBT to the bank."
> **76O.** Loss after reporting → borne by the bank.
> **76Q.** Resolution: **≤45 calendar days** domestic, **≤60 calendar days** cross-border.
> **76R.** Reversal **value-dated to original date**; credit cards get **shadow reversal within five calendar days**.
> **76D.** Instant SMS alerts mandatory for **all EBTs above ₹500**.

**New small-value compensation pool — 76T, verbatim:** a "**bona fide victim, being an individual person, including a sole proprietor**", with "**gross loss of an amount up to ₹50,000**" under 76N, "shall be compensated **85 per cent of the net loss amount … or ₹25,000, whichever is less, once during her / his lifetime**", conditional on reporting to **cybercrime.gov.in / helpline 1930 and to the bank within five calendar days**. Funded RBI 65% / customer's bank 10% / beneficiary bank 10% (domestic). **76U:** available only for frauds occurring up to one year from the effective date.

#### 🔴 The core question, answered — INFERENCE, clearly labelled

**Q: if an AI agent initiates a wrong or fraudulent payment under a valid customer mandate, is the customer liable?**

**INFERENCE, reasoning from 4(26B):** "Unauthorised EBT means an EBT which is **not authorised by a customer**." A debit executed under an e-mandate that the customer **registered with AFA** (§4(a)), whose **first transaction was AFA-validated** (§5(a)), and of which the customer received **24-hour pre-debit notice with an AFA-protected opt-out** (§6(a),(c)) is, on the plain text, **an authorised transaction**. It is therefore **not** an Unauthorised EBT, **not** a Fraudulent EBT, and **76L/76M do not engage. The customer would bear the loss.** *This is the central risk in the whole design space.*

**Three routes out, each INFERENCE and each directly actionable:**

1. **Third-party breach (4(26.1A)).** The definition is explicitly open-ended — "includes deficiency on the part of an intermediary such as a **TPAP, PA, PG, TSP, etc.**" An AI agent operator or a Secondary PSP under UPI Circle is arguably such an intermediary. If the agent misfires because of *its* deficiency, that reads as a third-party breach → **76M zero liability if reported within five calendar days.** **The most promising route**, and it turns entirely on whether RBI or a bank treats an agent operator as an "intermediary."
2. **Bank negligence (4(20B)) + Authentication Directions §9.** If the agent transaction was processed **without complying with the Authentication Directions**, §9 bites hard: *"the issuer shall compensate the customer for the loss in full without demur."* An unattended agent debit above ₹15,000 with no AFA is a compliance failure and the issuer eats it.
3. **Customer negligence (4(20C)(i)) — the trap.** "providing credentials for carrying out transactions **to another person, whether intentionally or otherwise**." **If a build asks the user to hand the agent a UPI PIN, an OTP, or card credentials, that is close to textbook customer negligence and the customer becomes liable under 76N.** 🔴 **Design rule: never let the agent touch a credential.** Use the OC 201-B delegation model, where the Secondary app authenticates with its own Device ID / user ID and the *issuer* validates both — the customer's PIN never leaves the primary app. *(Note this cuts directly against `submit_otp` being an MCP tool — §7.2.)*

**HYPOTHESIS:** FREE-AI Sutra 5 + ¶4.4.49 signal RBI's *intended* direction — push liability onto the **deploying regulated entity**, not the customer. But FREE-AI is non-binding, and the June 2026 amendment, issued **ten months after** it, does not codify it.

**Dispute plumbing that does exist:**
- **ODR:** RBI/2020-21/21 · DPSS.CO.PD No.116/02.12.004/2020-21 · **6 Aug 2020** — verified by its verbatim citation at ¶60 of the RBI (Commercial Banks – Digital Payment Security Controls) Directions, 2026 (RBI/DoS/2026-27/411, 31 July 2026, [Id=13642](https://rbi.org.in/scripts/NotificationUser.aspx?Mode=0&Id=13642)).
- ⚠️ **The 2021 Master Direction on Digital Payment Security Controls has been REPLACED** by entity-wise 2026 Directions (Commercial Banks 13642, SFB 13633, PB 13624, UCB 13615, NBFC 13591 — all 31 Jul 2026). If a build references the 2021 MD, update it.
- **TAT / failed-transaction compensation, 20 September 2019** — title and date confirmed via NPCI OC 201-B's citation. **Circular number and per-day compensation amounts: `EVIDENCE NOT FOUND`. Do not cite a number.**

### 10.7 DPDP Act 2023 and the 2025 Rules

**FACT (primary gazette text, extracted):**
> **Digital Personal Data Protection Rules, 2025** — **MeitY Notification G.S.R. 846(E), 13 November 2025**, Gazette of India Extraordinary Part II—Sec. 3(i). Made under s.40(1)–(2), DPDP Act 2023 (22 of 2023). Draft was G.S.R. 02(E), 3 Jan 2025; 6,915 public inputs.
> [DPDP Rules 2025 PDF](https://www.dpdpa.com/DPDP_Rules_2025_English_only.pdf) · [PIB Backgrounder, 17 Nov 2025](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190655)

**Commencement — Rule 1, verbatim:**
> "(2) **Rules 1, 2 and 17 to 21** shall come into force **on the date of their publication**.
> (3) **Rule 4** shall come into force **one year after** the date of publication.
> (4) **Rules 3, 5 to 16, 22 and 23** shall come into force **eighteen months after** the date of publication."

→ Rule 4 (**Consent Manager registration**) ≈ **13 November 2026**. Substantive obligations — notice (r.3), consent, security safeguards, breach notification, children's data, SDF duties (r.5–16) — ≈ **13 May 2027**.

**INFERENCE (relevant to a hackathon timeline):** as of 2026-08-26 **the substantive DPDP obligations are not yet in force.** You are building in the runway. But the Authentication Directions §9 *already* require issuers to adhere to the DPDP Act.

Operative content (PIB Backgrounder, tier 2 official):
- **Consent Managers must be companies based in India**, registered with the Data Protection Board
- Rule 3: notice must "be presented and be understandable **independently of any other information**", with "an **itemised description** of such personal data" and "the **specified purpose or purposes**"
- Withdrawal must be **as easy as giving** consent (r.3(c)(i))
- Breach: notify all affected individuals **without delay**, plain language, impact + remediation + contact
- DSAR response: **within ninety days**
- SDFs: independent audits, DPIAs, possible localisation directions
- Penalties: up to **₹250 cr** (security safeguards), **₹200 cr** (breach notification / children's data), **₹50 cr** residual. Appeals to **TDSAT**.

**INFERENCE:** an agent that **decides for itself what to buy, when, and from whom** is determining the *purpose and means* of processing — making it a **Data Fiduciary in its own right**, not a Processor for the merchant or PSP. That pulls in the full stack: standalone itemised consent notice, purpose limitation, easy withdrawal, 90-day DSARs, breach notification, published contact. **No regulator has classified AI agents; `EVIDENCE NOT FOUND` for any MeitY guidance on the point.**

### 10.8 What RBI has *actually said* about AI agents

**FACT (negative, primary):** RBI site-wide search for `agentic` on 2026-08-26 → **1 of 1 records**: the FREE-AI Committee Report, glossary only. Nothing in Notifications, Master Directions, or Press Releases. Two 2026 AI speeches — Governor Malhotra ([Id=1567](https://rbi.org.in/scripts/BS_SpeechesView.aspx?Id=1567), 11 Aug 2026) and DG Murmu ([Id=1570](https://rbi.org.in/scripts/BS_SpeechesView.aspx?Id=1570), 19 Aug 2026) — contain **zero occurrences of "agent."**

The Governor's framing: *"the Reserve Bank sees AI as a capability to be responsibly harnessed and not merely as a risk to be contained."*

**FREE-AI Committee Report** — released **13 August 2025**, committee constituted by RBI Press Release 26 Dec 2024. **7 Sutras, 6 pillars, 26 recommendations.** [RBI page](https://rbi.org.in/scripts/PublicationReportDetails.aspx?ID=1306) · [PDF](https://rbidocs.rbi.org.in/rdocs//PublicationReport/Pdfs/FREEAIR130820250A24FF2D4578453F824C72ED9F5D5851.PDF)

**¶4.4.49 — the passage that speaks directly to agentic payments, verbatim:**
> "**When these systems are tasked with financial functions such as investment decisions, loan processing, or payment execution, they are able to operate with access to real-world customer assets like bank accounts or financial data.** … Autonomous AI, even when performing simple individual tasks, can generate complex, unintended consequences if not managed well. **REs must use autonomous AI only after establishing clear safeguards and accountability frameworks, supported by well-defined testing protocols and standard operating procedures (SoPs). Consumers should be made to fully understand the consequences before being allowed to use such tools.** While exceptions may be considered for the use of autonomous AI in **routine or low-risk tasks, human oversight remains a critical factor in medium-risk to high-risk tasks.** REs must clearly define the tasks AI can perform autonomously and instances when human oversight is required. **REs must remain liable for the actions and outcomes of the autonomous AI systems they deploy.**"

**Sutra 2 — People First:** "AI should augment human decision-making but **defer to human judgment** … final authority should rest with humans, who should be able to **override AI** … Citizens should be made aware of AI-generated content and be informed when interacting with AI systems."

**Recommendation 8 — graded liability, verbatim excerpts:**
> "Legal liability is typically presented in a binary manner… However, AI systems are inherently probabilistic, with outputs that are often non-deterministic. This makes it challenging to apply this traditional, rigid framework of liability."
> "**Since customer protection is non-negotiable, the RE must remain fully responsible for compensating losses or damages to consumers.** However, a graded approach to **supervisory action** would help encourage AI innovation."
> The concession is conditional: "It should not apply in cases of repeated violations, recurring breaches, or gross negligence."

**Recommendation 16 — AI System Governance Framework:** model inventory, validation, drift/bias detection, fallback mechanisms, red-teaming, incident recording and reporting.

**Glossary, verbatim:** "**Agentic AI** — an automated entity that senses and responds to its environment and takes actions to achieve its goals. [ISO/IEC 22989]"; "**Agent to Agent (A2A) protocol** — A communication protocol enabling autonomous agents to interact without human involvement."

> 🔴 **CRITICAL: FREE-AI is a committee report, not binding regulation.** `EVIDENCE NOT FOUND` that RBI has issued any direction implementing its recommendations as of 2026-08-26. Adjacent instruments exist — *Guidance on Regulatory Principles for Model Risk Management, 2026* (24 Jun 2026) and *Draft Guidance on Regulatory Expectations for Data Governance* (15 Jul 2026) — but were not read; `EVIDENCE NOT FOUND` on whether they address agents.

### 10.9 The five open regulatory questions Indian trade press has posed

Verbatim headings from [MediaNama, 2026-06-12](https://www.medianama.com/2026/06/223-pine-labs-agentic-payments-protocol-upi-liability-privacy-questions/) — each a legitimate thing for a build to take a position on:

1. **"Is Pine Labs using the UPI mandate framework for a purpose it was not built for?"**
   > "A UPI mandate… originally supported **recurring, scheduled payments to a known merchant**… **It did not originally support one-off, event-triggered purchases that an AI agent independently decides and executes.**"
   > "**Pine Labs has not publicly stated whether NPCI created or approved a separate framework for autonomous AI-triggered purchases under UPI mandates.**"
2. **"How does P3P square with RBI's rule that every payment needs an extra security check?"** — the ₹15,000 AFA cliff (§10.3)
3. **"Who is responsible if an AI agent makes a wrong or unauthorised payment?"** — Gap 1 / §10.6
4. **"What data does P3P share with AI providers, and on what terms?"** — Gap 8 / §10.7
5. **"Does the stablecoin roadmap clash with India's position on crypto?"**
   > "**India does not recognise cryptocurrencies as legal tender**, and the RBI has repeatedly raised concerns…"
   > **INFERENCE:** this rules out x402's default settlement model for an India-domestic build.

### 10.10 Consolidated regulatory hard constraints

1. **Two-factor authentication is the default for all domestic digital payments from 1 Apr 2026**, with a **closed** exemption list that does **not** include "AI agent acting autonomously."
2. The only realistic exemption is **recurring e-mandate after the first transaction**, capped at **₹15,000/transaction**.
3. Mandate creation, modification, withdrawal and per-transaction opt-out **all** require **customer AFA**. There is **no delegated mandate creation**.
4. **24-hour pre-debit notification** is mandatory (except FASTag/NCMC).
5. On UPI, the sanctioned agent rail is **OC 201-B**: ₹5,000/txn, ₹15,000/month, domestic P2M, NPCI-authorised software only, limited-user rollout.
6. On cards: the agent can never hold a PAN; CoF tokens are **merchant-locked**; the agent's only legitimate role is **network-certified token requestor**.
7. **Never hold funds.** PA ¶10(a) makes the PA route structurally incompatible with open-web agent shopping.
8. **Never let the agent touch a credential** — 4(20C)(i) makes credential-sharing customer negligence.
9. **Instrument for the five-calendar-day clock** and produce both a bank report and a cybercrime.gov.in / 1930 report.
10. **Build the audit trail as a first-class feature** — 76K puts the burden of proof on the bank, and whoever can *prove* what the agent did and on whose instruction wins the dispute.

### 10.11 Explicitly NOT verified

`EVIDENCE NOT FOUND` — do not fill from memory:
- The **original July 2017** circular text and rupee-liability table; **§D ¶¶64–76 of the RBC Directions 2025** — *which is what governs transactions today*. **Highest-priority follow-up.**
- **TAT circular (20 Sep 2019)** — circular number and compensation amounts
- **All NPCI circulars** — no primary text obtained; npci.org.in blocked
- NPCI **UDIR / UPI Help**; UPI chargeback & TCC rules; RuPay dispute management rules; the reported Feb-2025 auto-acceptance-of-chargeback change (**do not assert it**)
- **RBI Integrated Ombudsman Scheme 2021** — date, scope, compensation caps
- Current **UPI per-transaction / per-day caps** from a primary NPCI source
- **PPI circular on limiting liability** (Jan 2019); cooperative-bank/RRB parallel (Dec 2017)
- **Payments Vision 2025** content ([ID=1202](https://rbi.org.in/scripts/PublicationReportDetails.aspx?ID=1202), located but not read); any successor Vision; **any regulatory sandbox cohort on agentic payments**
- **RBI Discussion Paper – Exploring Safeguards in Digital Payments to Curb Frauds**, 9 Apr 2026 ([Id=23810](https://rbi.org.in/scripts/PublicationsView.aspx?Id=23810)) — located, not read
- **FREE-AI chair attribution** (reported as Prof. Pushpak Bhattacharyya, IIT Bombay) — secondary only
- **Merchant-of-record** in Indian payments regulation — the term does not appear
- **PA Directions 2025 Chapter V** settlement timelines and the authorisation-requirement sentence

---

## 11. Comparison table

| | **NPCI UAP** | **ACP** | **AP2** | **x402** | **UCP** | **P3P** |
|---|---|---|---|---|---|---|
| **Owner** | NPCI | OpenAI + Stripe + Meta | Google | Coinbase → **Linux Foundation** | Google + Shopify | Pine Labs |
| **Governance** | National body, no public process | TSC w/ **founder veto**; not donated | Google-owned, Apache-2.0 | ✅ **Neutral LF foundation**, 40 members (TSC still 3 orgs) | Governance Council + 3 Domain Councils | Single vendor |
| **Spec public?** | ❌ **No spec found** | ✅ Apache-2.0 | ✅ Apache-2.0, **v0.2** | ✅ v2 | ✅ Apache-2.0 | ✅ Public docs |
| **Layer** | Payment authorization (national) | Commerce / checkout | **Payment authorization** | Payment (HTTP 402) | **Commerce orchestration** | Payment (402) + delegation |
| **Momentum** | Press report only | ⚠️ **anchor use case wound down Mar 2026**; no release since 2026-04-17 | ⚠️ nothing merged since 2026-04-29, 147 open issues | ✅ pushed 2026-08-25 | ✅ pushed 2026-08-25 | Live since Jun 2026 |
| **Authorization primitive** | Unknown | `delegate_payment` → `vt_` vault token + 6-field `Allowance`, **`reason` enum = `one_time` only** | **Checkout + Payment Mandate** (SD-JWT VC), **8 constraint types** | Wallet/session; ERC-7710 for multi-use | Capability negotiation at `/.well-known/ucp` | Grantex scoped token + UPI mandate |
| **Agent identity** | "registered, verified" (unspecified) | Bearer API key only | `did:` / SD-JWT VC over OpenID4VP; **Trusted Surface MUST be non-agentic** | Wallet address | Agent profile URL | `did:grantex:` + JWKS |
| **Request integrity** | Unknown | `Idempotency-Key` **required**; `Signature` **`required: false`** (issue #294) | `checkout_hash` binding; ECDSA mandated over Ed25519 | header-carried | — | HMAC challenge |
| **HITL escalation** | Unknown | ⚠️ states yes (`requires_escalation`, `pending_approval`), **handoff mechanism no** | ✅ Trusted Surface | ❌ | ✅ `requires_escalation` **+ `continue_url` + ECP** | ❌ mandate-only |
| **Dispute support** | ODR inherited from UPI | ❌ no refund/dispute **endpoint**; refunds are notify-only via `order_update` | ✅ evidence + 5-step verification; **adjudication/retrieval out of scope** | ❌ `auth-capture` unshippable | via merchant | receipt only; liability unstated |
| **UPI support** | ✅ native | ❌ **structurally card-only** | ✅ **`"type": "UPI"` in a normative example** | ❌ | ✅ via **regional PSP payment handler** | ✅ ReservePay + OTM |
| **Repo ★ (2026-08-26)** | — | 1,523 | — | **6,542** | **3,328** | — |

---

## 12. Evidence index

### RBI — primary, captured via browser from rbi.org.in, 2026-08-26

| # | Document | Ref & date | URL |
|---|---|---|---|
| R1 | RBI (Authentication mechanisms for digital payment transactions) Directions, 2025 | RBI/2025-26/79; CO.DPSS.POLC.No. S 668/02-14-015/2025-2026; 25 Sep 2025 | https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12898&Mode=0 |
| R2 | **Digital Payments – E-mandate Framework, 2026** | RBI/DPSS/2026-27/396; S56/02.14.003/2026-27; **21 Apr 2026** | https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13374 |
| R3 | RBC Third Amendment Directions, 2026 (customer liability) | RBI/2026-27/167; DOR.MCS.REC.No.130/01-01-032/2026-27; 24 Jun 2026; applies to txns on/after 1 Jan 2027 | https://rbi.org.in/scripts/NotificationUser.aspx?Mode=0&Id=13543 |
| R4 | RBI (Commercial Banks – Digital Payment Security Controls) Directions, 2026 | RBI/DoS/2026-27/411; 31 Jul 2026 | https://rbi.org.in/scripts/NotificationUser.aspx?Mode=0&Id=13642 |
| R5 | FREE-AI Committee Report | 13 Aug 2025 | https://rbi.org.in/scripts/PublicationReportDetails.aspx?ID=1306 · [PDF](https://rbidocs.rbi.org.in/rdocs//PublicationReport/Pdfs/FREEAIR130820250A24FF2D4578453F824C72ED9F5D5851.PDF) |
| R6 | Speech — Governor Sanjay Malhotra, FIBAC 2026 | 11 Aug 2026 | https://rbi.org.in/scripts/BS_SpeechesView.aspx?Id=1567 |
| R7 | Speech — DG S.C. Murmu | 19 Aug 2026 | https://rbi.org.in/scripts/BS_SpeechesView.aspx?Id=1570 |
| R8 | RBI site search for "agentic" — 1 of 1 records | 2026-08-26 | https://www.rbi.org.in/Scripts/SearchResults.aspx?search=agentic |
| R9 | Parallel RBC Amendment Directions (SFB/PB/RRB/UCB/RCB) | all 24 Jun 2026 | Ids 13544, 13545, 13547, 13548, 13549 |
| R10 | ODR System for Digital Payments (verified via R4 ¶60) | RBI/2020-21/21; DPSS.CO.PD No.116/02.12.004/2020-21; 6 Aug 2020 | — |
| R11 | Tokenisation – Card transactions | RBI/2018-19/103; 8 Jan 2019 | https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11449&Mode=0 |
| R12 | Permitting CoFT Services | RBI/2021-22/96; 7 Sep 2021 | https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12159&Mode=0 |
| R13 | Restriction on Storage of Actual Card Data | RBI/2022-2023/95; 28 Jul 2022 | https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12363&Mode=0 ⚠️ re-verify |
| R14 | CoFT – Enabling Tokenisation through Card Issuing Banks | RBI/2023-24/91; **20 Dec 2023** | https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12573&Mode=0 ⚠️ re-verify |
| R15 | RBI (Regulation of Payment Aggregators) Directions, 2025 | RBI/DPSS/2025-26/141; **15 Sep 2025** (date corroborated by R2 §3(a)) | https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896 ⚠️ re-verify Ch. V |
| R16 | Guidelines on Regulation of PAs and PGs — **REPEALED** | DPSS.CO.PD.No.1810/02.14.008/2019-20; 17 Mar 2020 | https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11822 |
| R17 | MD on Digital Payment Security Controls — **REPLACED by R4** | RBI/2020-21/74; 18 Feb 2021 | https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12032&Mode=0 |

### Government of India — DPDP

| # | Document | Ref & date | URL |
|---|---|---|---|
| G1 | Digital Personal Data Protection Rules, 2025 (gazette text) | **G.S.R. 846(E), 13 Nov 2025** | https://www.dpdpa.com/DPDP_Rules_2025_English_only.pdf |
| G2 | PIB Backgrounder — DPDP Rules 2025 Notified | 17 Nov 2025 | https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190655 |

### NPCI — circular corpus now primary (identifiers + titles); operative text still secondary

| # | Item | Ref & date | Source |
|---|---|---|---|
| N1 | **UPI Reserve Pay Brand Guideline (PDF, 23pp)** — *primary, retrieved directly* | — | https://www.npci.org.in/uploads/UPI_Reserve_Pay_Guidlines_b4cb359cbc.pdf |
| N2 | Introduction of "UPI Circle" – Delegated Payments for Secondary Users | NPCI/UPI/OC No.201/2024-25; 13 Aug 2024 | TeamLease RegTech art. 34761 |
| N3 | UPI Circle – Full Delegation Additional Requirements | NPCI/UPI/OC/201A/2025-26; 8 Jul 2025 | TeamLease RegTech art. 44355 |
| N4 | **Addendum to OC 201 — IoT Devices & Software on UPI Circle** | **NPCI/UPI/OC-201B/2025-26; 8 Oct 2025** | [Khaitan & Co ERGO, 20 Nov 2025](https://www.khaitanco.com/sites/default/files/2025-11/ERGO%20-%20Enabling%20Agentic%20Payments%20%20on%20UPI%20Rails%20-%2020%20November%202025.pdf); Mondaq; Complinity 20724 |
| N5 | Enablement of UPI Mandate feature of Single Block Multiple Debits | UPI-OC-No-200-FY-24-25; 31 Jul 2024 | TeamLease RegTech art. 34174 |
| N6 | Enhancement in UPI SBMD (UPI Reserve Pay) | `UPI_OC_No_228_FY_2025_26` | [Complinity](https://complinity.com/legal-update/npci-issues-enhancements-in-upi-single-block-multiple-debits-upi-reserve-pay--20722/); [Lawrbit](https://www.lawrbit.com/article/what-is-new-in-upi-rules-2025-key-changes-you-should-know/) |

### Protocol specs — primary

| # | Title | URL |
|---|---|---|
| P1 | AP2 v0.2 specification | https://ap2-protocol.org/ap2/specification/ |
| P2 | AP2 Checkout Mandate | https://ap2-protocol.org/ap2/checkout_mandate/ |
| P3 | AP2 Payment Mandate | https://ap2-protocol.org/ap2/payment_mandate/ |
| P4 | AP2 Agent Authorization | https://ap2-protocol.org/ap2/agent_authorization/ |
| P5 | AP2 FAQ | https://ap2-protocol.org/faq/ |
| P6 | Grantex Protocol Specification v1.0 Final | https://github.com/mishrasanjeev/grantex/blob/main/SPEC.md |
| P7 | Pine Labs P3P Overview | https://www.pinelabs.com/docs/online-payments/ai/p3p |
| P8 | Pine Labs P3P Quickstart | https://www.pinelabs.com/docs/online-payments/ai/p3p/quickstart |
| P9 | ACP spec repo | https://github.com/agentic-commerce-protocol/agentic-commerce-protocol |
| P10 | UCP spec repo | https://github.com/Universal-Commerce-Protocol/ucp |
| P11 | x402 (canonical, LF) | https://github.com/x402-foundation/x402 |
| P12 | Razorpay MCP Server | https://github.com/razorpay/razorpay-mcp-server |

### Official announcements

| # | Title | Date | URL |
|---|---|---|---|
| O1 | LF Announces Operational Launch of x402 Foundation | 2026-07-14 | https://www.linuxfoundation.org/press/linux-foundation-announces-operational-launch-of-x402-foundation-to-standardize-internet-native-payments-for-ai-agents-and-applications |
| O2 | LF is Launching the x402 Foundation | 2026-04-02 | https://www.linuxfoundation.org/press/linux-foundation-is-launching-the-x402-foundation-and-welcoming-the-contribution-of-the-x402-protocol |
| O3 | Building the Universal Commerce Protocol (Ilya Grigorik) | 2026-01-11 | https://shopify.engineering/ucp |
| O4 | Securing Agentic Commerce (Web Bot Auth / TAP / Agent Pay) | — | https://blog.cloudflare.com/secure-agentic-commerce/ |
| O5 | Razorpay & NPCI: Agentic Payments on Claude | 2026-02-20 | https://razorpay.com/blog/agentic-payments-and-npci/ |
| O6 | Razorpay Agentic Payments product page | — | https://razorpay.com/agentic-payments/ |
| O7 | Razorpay — Agentic Payments for In-App Commerce (FTX pilots) | 2026-03-12 | https://razorpay.com/blog/agentic-payments-the-future-of-in-app-commerce/ |
| O8 | Cashfree "Here" with Mastercard + Swiggy | 2026-02-17 | https://www.cashfree.com/news-room/cashfree-payments-unveils-india%E2%80%99s-first-payments-extension-for-ai-apps-launches-cashfree-here-in-collaboration-with-mastercard-and-swiggy-at-india-ai-impact-summit-2026/ |
| O9 | Alipay AI Payment Exceeds 120M Transactions in One Week | 2026-02-13 | https://www.businesswire.com/news/home/20260213770962/en/Alipay-AI-Payment-Exceeds-120-Million-Transactions-in-One-Week-as-Agentic-Commerce-Accelerates-in-China |
| O10 | Revolut / AP2 support UK+EEA | 2026-01-19 | https://www.revolut.com/news/revolut_to_enable_frictionless_checkout_across_all_agentic_commerce_platforms_for_the_uk_and_eea/ |

### Trade press

| # | Title | Outlet | Date | URL |
|---|---|---|---|---|
| T1 | India may allow agentic AI-led UPI transactions under new NPCI protocol | Business Standard | 2026-07-09 | https://www.business-standard.com/finance/news/india-may-allow-agentic-ai-led-upi-transactions-under-new-npci-protocol-126070801343_1.html |
| T2 | India Plans AI-Powered UPI Payments Framework Through UAP | Outlook Business | 2026-07-09 | https://www.outlookbusiness.com/news/india-plans-ai-powered-upi-payments-framework-through-unified-agent-protocol |
| T3 | How NPCI should approach agentic payments (Nikhil Pahwa) | MediaNama | 2026-07-10 | https://www.medianama.com/2026/07/223-npci-agentic-payments-upi/ |
| T4 | Pine Labs launches agentic payments protocol… liability and privacy questions | MediaNama | 2026-06-12 | https://www.medianama.com/2026/06/223-pine-labs-agentic-payments-protocol-upi-liability-privacy-questions/ |
| T5 | Razorpay explains how its AI voice agent pays for you and what happens when it goes wrong | MediaNama | 2026-03-25 | https://www.medianama.com/2026/03/223-razorpay-sarvam-ai-ai-agent-payments-indus-app/ |
| T6 | Razorpay and NPCI launch pilot for agentic payments via ChatGPT | MediaNama | 2025-10-10 | https://www.medianama.com/2025/10/223-razorpay-npci-openai-agentic-payments-upi-chagpt/ |
| T7 | OpenAI Ends Instant Checkout in ChatGPT | The Keyword | 2026-03-25 | https://www.thekeyword.co/news/openai-chatgpt-instant-checkout-scrapped |
| T8 | OpenAI shifts checkout plans in its agentic commerce strategy | Digital Commerce 360 | 2026-03-06 | https://www.digitalcommerce360.com/2026/03/06/openai-shifts-checkout-plans-agentic-commerce-strategy/ |
| T9 | OpenAI shifts ChatGPT shopping plans to retailer-run apps | Retail Insight Network | 2026-03-23 | https://www.retail-insight-network.com/news/openai-shifts-chatgpt-shopping-plans-to-retailer-run-apps-report/ |
| T10 | Coinbase-Backed AI Payments Protocol… Demand Is Just Not There Yet | Coindesk | 2026-03-11 | https://www.coindesk.com/markets/2026/03/11/coinbase-backed-ai-payments-protocol-wants-to-fix-micropayment-but-demand-is-just-not-there-yet |
| T11 | ixigo voice payments still require 2FA | MediaNama | 2026-07 | https://www.medianama.com/2026/07/223-ixigo-voice-payments-rbi-rules-human-authentication/ |
| T12 | Can Razorpay Turn ChatGPT Into India's Next Commerce Channel? | Inc42 | — | https://inc42.com/features/can-razorpay-turn-chatgpt-into-indias-next-commerce-channel/ |

### Analysis — tier 3–4, verify before relying

| # | Title | Type | URL |
|---|---|---|---|
| A1 | Khaitan & Co, "Enabling Agentic Payments on UPI Rails" | Law firm, 20 Nov 2025 | https://www.khaitanco.com/sites/default/files/2025-11/ERGO%20-%20Enabling%20Agentic%20Payments%20%20on%20UPI%20Rails%20-%2020%20November%202025.pdf |
| A2 | Custena, *The State of Agent Payment Protocols (April 2026)* | **Vendor-authored, self-disclosed market participant**; fully footnoted | https://github.com/Custena/agent-payment-protocols |
| A3 | Justt, "The Chargeback Liability Gap" | Chargeback vendor, 2026-06-30 | https://justt.ai/blog/ai-agent-chargeback-liability/ |
| A4 | Chargeflow, "Agentic Commerce Chargebacks: Evidence Playbook" | Chargeback vendor | https://www.chargeflow.io/blog/agentic-commerce-chargebacks-the-evidence-playbook-merchants-need |
| A5 | Chargeflow, "Agentic Commerce Regulation 2026" | Chargeback vendor | https://www.chargeflow.io/blog/agentic-commerce-regulation-what-merchants-need-to-know |
| A6 | Paytm — UPI Circle transaction limits | Vendor blog | https://paytm.com/blog/payments/upi/what-is-upi-circle-transaction-limits/ |
| A7 | Zeta — Delegate Payments with UPI Circle | Vendor blog | https://www.zeta.tech/us/resources/blog/delegate-payments-with-upi-circle/ |

---

## 13. Consolidated `EVIDENCE NOT FOUND`

**Do not let anything downstream fill these from memory.**

**NPCI / UAP**

> 🟢 **Two items formerly listed here have been CLOSED against primary sources (§2.1).** UAP's absence from NPCI's 221-circular corpus and from RBI's search index is now a **positive finding**, not a gap. Circular identifiers and exact titles for OC 200 / 201 / 201-A / 201-B / 228 are likewise now primary.

Still genuinely open:
- Any UAP specification, draft, consultation paper, pilot, launch date, or **named participant** — and any **named NPCI official on the record**
- That UAP is built on UPI Circle (widely repeated; unconfirmed in the retrievable primaries — though architecturally the obvious reading given OC 201-B)
- **The operative text of every NPCI circular.** All are **scanned images with no text layer** (OC 228 verified: `textlen 0, images 1` on both pages). OCR would be required. Limits are triple-corroborated but not verbatim-quotable.
- NPCI's authorised device/software allowlist under OC 201-B — **not published**
- NPCI UDIR / UPI chargeback & TCC rules / RuPay dispute rules; the reported Feb-2025 auto-acceptance change

**RBI** — see §10.11 for the full list. Highest priority: **§D ¶¶64–76 of the RBC Directions 2025** (what governs today) and the **TAT circular number/amounts**.

**ACP**
- Donated to any standards body; any Domain Working Group chartered
- The exact required-field list of **OpenAI's production TSV product feed** (distinct from the repo's JSON Feed API — see §3.3)
- The full country list for Stripe's Shared Payment Token
- Any Indian entity on the corporate CLA list or TSC; NPCI/UPI as a released payment handler
- ChatGPT Instant Checkout availability in India
- Any spec release after 2026-04-17 (none exists — verified via git)
- `stripe/agentic-commerce-samples`, `openai/openai-agentic-commerce` — **404, do not cite**
- Formal ACP↔UCP merger

**AP2 / x402 / UCP**
- Any Indian entity in the AP2 partner list beyond **Juspay**
- Shipped official AP2 SDK or MCP server
- Any x402 refund/reversal primitive that is actually supported by a facilitator
- Authoritative x402 transaction volume — **two published trackers disagree by up to 19×**
- UCP payment-handler registry contents

**Cross-cutting**
- Published Visa/Mastercard **binding chargeback rule** for agent-initiated disputes (absence corroborated by two passes)
- Any jurisdiction with enacted agentic-purchasing regulation
- Where a refund lands in any protocol's agent model
- The operative EU AI Act high-risk date (tier-4 sources conflict: 2026-08-02 vs Dec 2027)
- Amazon retail MCP server · BigCommerce MCP server · **Pine Labs MCP server repo** (`pinelabs/pinelabs-mcp-server` 404)
- A **normative Mastercard Agent Pay spec** — `developer.mastercard.com/llms.txt` has zero matches for "Agent Pay"; `agentpay-key-directory.mastercard.com` is **NXDOMAIN**
- An **AP2 MCP binding** (AP2 binds to A2A and UCP, not MCP)
- **"Shopify Universal Cart"** — actively falsified; say "UCP Cart Capability"
- **"Instant Checkout" partner list** in current OpenAI docs — the brand is absent from developer docs, the ACP README, and Stripe's agentic-commerce doc set
- Any **OpenAI-documented robots token for Operator or Atlas**; Anthropic-documented `anthropic-ai`/`Claude-Web`; a Microsoft AI-training opt-out token; a ByteDance-primary `Bytespider` doc
- **Agent-specific schema.org vocabulary** (release 30.0, 2026-03-19 — none exists)
- Any statement by **OpenAI, Anthropic, Google or Perplexity that their crawler consumes llms.txt**

**Source-quality warning:** these aggregators surfaced repeatedly and **nothing here is sourced solely to them**: eco.com, stellagent.ai, digitalapplied.com, agenticplug.ai, ucphub.ai, whalesbook.com, techzeel.net, clearingpost.com, siliconindia.com.

---

## 14. Appendix — sources added in the final verification pass

| Title | URL / method | Type | Retrieved |
|---|---|---|---|
| **NPCI UPI circular corpus, all years 2019–2026 (221 circulars)** | `https://www.npci.org.in/api/circulars/upi?pageNum=1&year=<YYYY>&sort=desc&size=100&locale=en` — via browser same-origin `fetch` (403s to `curl`) | **NPCI primary API** | 2026-08-26 |
| NPCI UPI circulars landing page | https://www.npci.org.in/circulars/upi | NPCI primary | 2026-08-26 |
| NPCI OC 228 PDF (scanned, no text layer) | https://www.npci.org.in/uploads/UPI_OC_No_228_FY_2025_26_Enhancement_in_UPI_Single_Block_Multiple_Debits_UPI_Reserve_Pay_a9095c181d.pdf | NPCI primary | 2026-08-26 |
| NPCI OC 201-B PDF | https://www.npci.org.in/uploads/UPI_OC_No_201_B_FY_2025_26_Addendum_to_NPCI_UPI_2024_25_OC_201_Introduction_of_Io_T_devices_software_on_UPI_Circle_09ec83c893.pdf | NPCI primary | 2026-08-26 |
| NPCI OC 201 / 201-A / 200 PDFs | see §2.3, §2.4 | NPCI primary | 2026-08-26 |
| RBI site search — `agentic` (`TotalRec = 1`) | https://www.rbi.org.in/Scripts/SearchResults.aspx?search=agentic | RBI primary | 2026-08-26 |
| RBI site search — `Unified Agent Protocol` (14 word-soup hits, none relevant) | https://www.rbi.org.in/Scripts/SearchResults.aspx?search=Unified+Agent+Protocol | RBI primary | 2026-08-26 |
| Razorpay's six ACP PRs (#46, #213, #215–#218) | `gh api repos/agentic-commerce-protocol/agentic-commerce-protocol/pulls/<n>` | GitHub primary | 2026-08-26 |
| ACP — MCP Transport Binding | https://raw.githubusercontent.com/agentic-commerce-protocol/agentic-commerce-protocol/main/docs/mcp-binding.md | Primary spec | 2026-08-26 |
| ACP — `spec/2026-04-17/openapi/openapi.agentic_checkout.yaml` | raw.githubusercontent.com/…/spec/2026-04-17/openapi/openapi.agentic_checkout.yaml | Primary spec | 2026-08-26 |
| ACP — `openapi.delegate_payment.yaml` | …/spec/2026-04-17/openapi/openapi.delegate_payment.yaml | Primary spec | 2026-08-26 |
| ACP — `openapi.agentic_checkout_webhook.yaml` | …/spec/2026-04-17/openapi/openapi.agentic_checkout_webhook.yaml | Primary spec | 2026-08-26 |
| ACP — `openapi.feed.yaml`, `json-schema/schema.feed.json` | …/spec/2026-04-17/ | Primary spec | 2026-08-26 |
| MCP Specification — Authorization | https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization | Primary spec | 2026-08-26 |
| MCP Specification — Server / Tools | https://modelcontextprotocol.io/specification/2025-11-25/server/tools | Primary spec | 2026-08-26 |
| MCP `latest` → `2026-07-28` redirect, changelog, `schema/2026-07-28/schema.ts` | modelcontextprotocol.io + repo | Primary spec | 2026-08-26 |

### Five claims corrected during this research — calibration notes

Each of these would have survived a summary-only process. They are the reason the document quotes spec files and circular APIs rather than blog posts.

| # | The plausible claim | What primary sources showed |
|---|---|---|
| 1 | *"UPI Reserve Pay is Pine Labs' brand for SBMD"* — MediaNama, tier 3 | **Refuted.** NPCI's own brand-guideline PDF says the logo *"is derived from the UPI and NPCI brand elements"*, and NPCI's circular is titled *"…(UPI Reserve Pay)"*. **It is NPCI's brand.** (§2.3) |
| 2 | *"ACP has no escalation states"* — implied by secondary summaries | **Refuted.** `openapi.agentic_checkout.yaml` defines `requires_escalation`, `authentication_required`, `pending_approval`. What ACP lacks is UCP's `continue_url` *mechanism*. (§3.3) |
| 3 | *"Razorpay has no ACP involvement"* — what `gh search code --owner razorpay` returns | **Refuted, and the method was invalid.** Six PRs exist in the *target* repo. Org-scoped code search cannot see them. (§3.4) |
| 4 | *"AP2 uses Intent / Cart / Payment Mandates"* — every Sept-2025 summary | **Superseded.** v0.2.0 (2026-04-28): **Checkout + Payment Mandate**, Intent generalised into Open/Closed. (§4.1) |
| 5 | *"MCP's current spec is `2025-11-25`"* — which is what ACP's own binding links | **Not current.** `/specification/latest` 307-redirects to **`2026-07-28`**, which removes sessions entirely. (§7.3) |

And one methodological trap worth carrying forward: **`developer.mastercard.com` returns HTTP 200 for every path**, including `product/this-does-not-exist-xyz123`. A 200 from a JS SPA is not evidence a page exists.

### Coverage statement

**Verified against primary sources:** all AP2 v0.2 schemas and constraint types; all ACP 2026-04-17 OpenAPI/JSON-Schema surfaces; ACP's MCP binding; MCP authorization, tools and elicitation; the x402 Linux Foundation contribution; UCP's architecture, state machine and MCP bindings; Web Bot Auth's current IETF draft and two live production key directories; **NPCI's complete 221-circular UPI corpus**; RBI's Authentication Directions 2025, E-mandate Framework 2026, RBC Third Amendment 2026, CoFT chain, PA Directions 2025 and FREE-AI; and the DPDP Rules 2025 gazette text.

**Known to remain secondary or unverified:** the *operative text* of every NPCI circular (all are scanned images); RBC Directions 2025 §D ¶¶64–76 — **which is what governs transactions today** and is the highest-priority follow-up; the TAT circular's number and amounts; x402's true transaction volume; Mastercard Agent Pay's wire format; and the merchant-readability items listed in §13.
