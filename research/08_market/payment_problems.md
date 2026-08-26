# Payment Failures & Checkout Abandonment in India — Evidence Pack

**Compiled:** 2026-08-26 · **All retrieval dates: 2026-08-26** · **Geography: India (merchants)**

**Labelling convention used throughout:**
- `[FACT]` — the figure is directly stated in the cited source.
- `[INFERENCE]` — my arithmetic derived from sourced facts; working is always shown.
- `[HYPOTHESIS]` — a plausible reading not established by any source.
- `⚠️ VENDOR` — source is a company selling a solution to the problem it is quantifying (motivated).
- `SECONDARY` — a news/analyst report of a primary (RBI/NPCI) fact, used because the primary was inaccessible.

**Access note (important for reproducibility):** `npci.org.in` returns **HTTP 403 Forbidden** to programmatic fetches (Akamai "Access Denied"), including the OC-149 circular PDFs and the UPI Ecosystem Statistics page. Every NPCI figure below is therefore sourced either (a) from a reputable secondary that quotes NPCI, or (b) from **Dataful**, a commercial data aggregator that republishes NPCI's monthly bank-wise remitter table verbatim. This is flagged at each point of use. `rbi.org.in` was fetched directly and is primary.

---

## 1. UPI decline rates — technical (TD) and business (BD)

### 1.1 The regulatory thresholds: NPCI Circular OC-149

| Item | Value | Label |
|---|---|---|
| Circular | NPCI/UPI/OC No. 149/2022-23, "Reduction of business decline in UPI" | [FACT] |
| Date | 13 May 2022 (addendum OC-149A dated **15 June 2022**) | [FACT] |
| Technical Decline (TD) target | **< 1%** | [FACT] |
| Business Decline (BD) target | **< 5%** | [FACT] |
| Additional RBI-driven instruction | banks to run customer literacy campaigns where **BD > 10%** | [FACT] |

> "Operating Circular (OC) 149, dated May 13, 2022, communicated to UPI members to work towards reducing Technical Declines (TD) to below 1% and Business Declines (BD) to below 5%."

Sources: the circular PDFs exist at
`https://www.npci.org.in/PDF/npci/upi/circular/2022/UPI-OC-149-Reduction-of-business-decline-in-UPI.pdf` and
`https://www.npci.org.in/PDF/npci/upi/circular/2022/OC149-A-Addendum-to-OC-149-Reduction-of-business-declines-in-UPI.pdf`
— **both returned 403 to every fetch attempt** (direct, browser-headers, and via a text-extraction proxy). The thresholds above are taken from secondary sources that quote the circular (see Sources table, rows S1–S3). **The exact verbatim sentence from the circular itself is `EVIDENCE NOT FOUND`** — do not put quotation marks around OC-149 language in the pitch.

**Definitions** (NPCI's own taxonomy, as reported):
- **Technical Decline (TD)** — "transaction decline due to technical reasons, such as unavailability of systems and network issues on bank or NPCI side." `[FACT, SECONDARY]`
- **Business Decline (BD)** — decline due to the customer/issuer business condition: wrong UPI PIN, insufficient balance, per-day limit exceeded, invalid beneficiary account. `[FACT, SECONDARY]`

### 1.2 System-wide technical decline rate

| Figure | Value | Who said it | When | Label |
|---|---|---|---|---|
| UPI technical decline rate | **0.7–0.8%** | Dilip Asbe, MD & CEO, NPCI | 20 Nov 2024 | [FACT, SECONDARY] |
| Historical TD rate | **8–10%** | same | referring to 2016 | [FACT, SECONDARY] |
| Active UPI users | 400 million | same | Nov 2024 | [FACT, SECONDARY] |

> "The technical decline rates have reduced to 0.7-0.8 per cent" — Dilip Asbe, NPCI MD & CEO, quoted by Zee Business, 20 Nov 2024.
> Historical comparison given in the same statement: "as high as 8-10 per cent in 2016".

URL: https://www.zeebiz.com/economy-infra/news-only-08-of-upi-transactions-face-technical-declines-now-npci-327217
(Direct fetch 403; retrieved via r.jina.ai text proxy on 2026-08-26.)

⚠️ Note: this is a **2024** statement. `EVIDENCE NOT FOUND` for an NPCI-official system-wide TD% dated 2026.

### 1.3 Bank-wise TD / BD — actual published NPCI numbers, **July 2026**

Source: Dataful dataset #445, "Year, Month and Bank wise Top 50 Performing Remitter Banks in UPI Transactions", **source field: National Payments Corporation of India**, monthly, coverage 2019-20 → 2026-27, 3,570 rows × 11 columns, last refreshed **August 2026**.
URL: https://dataful.in/datasets/445/ — retrieved 2026-08-26.
Fields: `total_volume` (millions), `approved` (%), `bd` (%), `td` (%), `total_debit_reversal_count`, `debit_reversal_success` (%).

**Rows visible on the dataset page (July 2026-27), all `[FACT]`:**

| Remitter bank | Volume (mn) | Approved % | **BD %** | **TD %** | Breaches OC-149? |
|---|---:|---:|---:|---:|---|
| Airtel Payments Bank | 789.122 | **72.56** | **26.97** | 0.47 | BD 5.4× over the 5% target; >10% ⇒ literacy-campaign trigger |
| AU Small Finance Bank | 100.425 | 85.69 | 14.09 | 0.22 | BD >10% |
| Axis Bank Ltd. | 1,056.594 | 92.94 | 7.05 | 0.00 | BD over 5% |
| Bandhan Bank | 107.123 | 93.41 | 6.20 | 0.40 | BD over 5% |
| Bank of Baroda | 1,774.429 | 85.83 | 13.95 | 0.22 | BD >10% |
| Bank of India | 764.090 | 89.98 | 9.34 | 0.68 | BD over 5% |
| Bank of Maharashtra | 263.628 | 89.71 | 10.27 | 0.02 | BD >10% |
| Baroda U.P. Bank | 101.399 | 90.17 | 7.88 | **1.95** | BD over 5%; **TD ~2× over the 1% TD target** |
| Canara Bank | 1,251.608 | 90.48 | 9.28 | 0.24 | BD over 5% |
| Central Bank of India | 453.775 | 86.12 | 12.25 | **1.63** | BD >10%; **TD over 1%** |

**Coverage caveat — read before quoting:** these are the **10 rows rendered on the public dataset preview**, which are alphabetical (A–C). They are **not** the full top-50 and **exclude SBI, HDFC, ICICI, Paytm Payments Bank, Yes Bank/PhonePe** etc. Any average computed over them is unrepresentative of the system.

`[INFERENCE]` Volume-weighted across **only these 10 banks**: total volume 6,662.193 mn; weighted approved **87.09%**, weighted BD **12.52%**, weighted TD **0.39%**; declined transactions **859.7 mn in one month across 10 banks**.
*Working:* Σ(volᵢ×metricᵢ)/Σ(volᵢ); declines = 6,662.193 × (12.52+0.39)/100 = 859.7 mn.

**The load-bearing finding:** across every single one of these 10 banks, **BD exceeds NPCI's 5% target**, and 5 of 10 exceed the 10% level that OC-149 flags for customer-literacy intervention. TD is largely compliant (<1%) for 8 of 10. **The unsolved problem in Indian UPI in 2026 is business decline, not technical decline.** `[FACT + INFERENCE]`

### 1.4 Historical composition of UPI failures (BD vs TD split)

Analysis of NPCI top-50-remitter data, March 2022 → March 2023 (Finbox / Substack, SECONDARY, derived from NPCI):

| Figure | Value | Label |
|---|---|---|
| Failed UPI transactions, March 2022 | **445.85 million** | [FACT, SECONDARY] |
| Failed UPI transactions, March 2023 | **625.23 million** | [FACT, SECONDARY] |
| Failed share of monthly transactions | **~7% to ~9%** | [FACT, SECONDARY] |
| Share of failures that were **business** declines | **81.7%** | [FACT, SECONDARY] |
| Share of failures that were **technical** declines | **18.26%** | [FACT, SECONDARY] |
| SBI TD, March 2023 | 2.45% | [FACT, SECONDARY] |
| IDBI Bank TD, March 2023 | 7.16% | [FACT, SECONDARY] |
| India Post Payments Bank TD, March 2023 | 4.26% | [FACT, SECONDARY] |

> "the number of failed transactions has remained somewhat consistent from 445.85 million in March 2022 to 625.23 million in March 2023."
> "The percentage of failed transactions hovered between ~7% and ~9% of the monthly transactions over the last year."
> "81.7% of the total failed transactions were attributed to 'business decline'." / "The remaining 18.26% failed transactions occurred due 'technical decline'."

URL: https://finbox.substack.com/p/the-chink-in-the-upi-armour — retrieved 2026-08-26.

Note the 7–9% total-failure band is **consistent with** the July 2026 bank-wise data above (weighted 12.9% decline for the 10 A–C banks, which skew toward payments banks / PSBs with high BD).

### 1.5 Absolute scale — the INFERENCE the pitch needs

Base facts:

| Figure | Value | Source | Label |
|---|---|---|---|
| UPI volume, **July 2026** | **23.66 billion** transactions (all-time record) | NPCI data via Entrackr / Business Standard | [FACT, SECONDARY] |
| UPI value, July 2026 | **₹29.88 lakh crore** | same | [FACT, SECONDARY] |
| Daily average, July 2026 | **763 million** transactions/day; **₹96,383 crore**/day | same | [FACT, SECONDARY] |
| MoM | +4.1% volume (June: 22.72 bn); +3.3% value (June: ₹28.92 lakh crore) | same | [FACT, SECONDARY] |
| YoY | +22% volume, +19% value | same | [FACT, SECONDARY] |

**`[INFERENCE] A — technical declines per month, simple method.**
23.66 bn × 0.8% = **189.3 million technically-declined UPI transactions per month.**
At 0.7%: 165.6 million. Per day: 763 mn × 0.8% = **6.10 million technical declines per day.**
*Assumption stated:* treats the NPCI headline volume as the denominator of attempts.

**`[INFERENCE] B — grossing up for the fact that headline volume is successful transactions.**
If the 23.66 bn headline is *approved* transactions and the system-level approval rate resembles the 87.09% weighted approval of the 10 banks above, attempts ≈ 23.66 / 0.8709 = **27.17 bn attempts**, i.e. **≈3.51 billion declined UPI transactions in July 2026**.
*Caveat:* the 87.09% is drawn from an unrepresentative A–C bank subset skewed high-BD; the true system approval rate is almost certainly higher, so 3.51 bn is an **upper bound**. Using the historical 7–9% failure band instead gives **1.8–2.3 billion declined transactions per month**. Present the 7–9% band, not the 87.09% figure, if you want the defensible number.

**`[INFERENCE] C — rupee value of technically-declined UPI volume.**
₹29.88 lakh crore × 0.8% = **₹23,904 crore (~₹0.24 lakh crore) per month** of UPI value hitting a technical decline.
*Assumption stated:* declined transactions carry the same average ticket size as successful ones. NPCI does not publish value-weighted decline data — **`EVIDENCE NOT FOUND`** for a value-weighted decline figure.

---

## 2. Card, netbanking and cross-method success rates

**Primary-source status:** neither RBI nor NPCI publishes a card or netbanking *success rate* series. RBI's Payment System Report publishes volume/value mix, not approval rates. **`EVIDENCE NOT FOUND` for a regulator-published Indian card success rate.** Everything in this section is vendor- or blog-sourced and must be flagged as such in the pitch.

⚠️ **VENDOR (Razorpay — sells the fix):** https://razorpay.com/blog/payment-success-rate-optimization-india/ — retrieved 2026-08-26.

| Metric | Value | Attribution in source | Label |
|---|---|---|---|
| UPI technical decline | ~0.8% ⇒ "payment success rate of about 99.2%" | Razorpay, citing Nov 2024 | [FACT as-stated] ⚠️ VENDOR |
| Credit/debit cards (domestic) success | **85–90%** | Razorpay analysis, no external source | ⚠️ VENDOR, unverifiable |
| Netbanking success | **90–95%** | Razorpay analysis, no external source | ⚠️ VENDOR, unverifiable |
| International cards success | **70–80%** | Razorpay analysis, no external source | ⚠️ VENDOR, unverifiable |
| Blended Indian D2C success rate | **68–74%** | Razorpay benchmark | ⚠️ VENDOR, unverifiable |
| Metro / Tier-2 / Tier-3 success | **78–82% / 62–68% / 55–62%** | Razorpay data | ⚠️ VENDOR, unverifiable |
| False-decline cost ratio | "For every ₹100 saved by preventing fraud, brands lose ₹400–600 to falsely declined legitimate orders" | Razorpay analysis | ⚠️ VENDOR, unverifiable |
| Post-decline churn | "40% of customers won't return after their card is declined" | Razorpay research | ⚠️ VENDOR, unverifiable |
| Revenue math | 5pp success-rate improvement on ₹1 crore monthly GMV ≈ ₹5 lakh/month | Razorpay calculation | [INFERENCE by vendor — arithmetic is trivially correct] |

⚠️ **VENDOR (Razorpay):** https://razorpay.com/blog/multi-gateway-routing-payment-orchestration-in-india-how-smart-routing-improves-success-rates/

| Metric | Value | Label |
|---|---|---|
| Single-gateway baseline success | "typically achieve only 80-85% payment success rates" | ⚠️ VENDOR, no source |
| Post-failure churn | "62% of customers who experience a failed online transaction never return" — attributed only to "a 2021 study", **study not named** | ⚠️ VENDOR, **unsourced — do not use** |
| UPI share of India payments volume | 83.4% in FY25 | ⚠️ VENDOR, no source (but see §5 for the RBI figure of 85.5%) |

⚠️ **VENDOR (Razorpay), UPI Intent flow:** "Intent Flow achieves a success rate of approximately 92-95%" — https://razorpay.com/blog/mobile-checkout-india-reduce-load-failures/

**Third-party aggregator (non-Razorpay, still non-primary):** productgrowth.in reports typical merchant blended UPI success of **92–96%**, and explicitly notes that PSP-level success figures "are aggregated from merchant audits, case-study claims" and that **"none publish official recurring benchmarks."** URL: https://productgrowth.in/insights/fintech/upi-payment-success-rates/ — retrieved 2026-08-26. Treat all PSP-specific success rates (Razorpay 93–96%, PayU 91–94%, Cashfree 92–95%) as `[HYPOTHESIS]`.

---

## 3. RBI: Turn Around Time (TAT) harmonisation & ₹100/day compensation

**PRIMARY SOURCE — fetched directly from rbi.org.in on 2026-08-26.**
URL: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11693&Mode=0

| Item | Value | Label |
|---|---|---|
| Circular | **RBI/2019-20/67, DPSS.CO.PD No.629/02.01.014/2019-20** | [FACT, PRIMARY] |
| Title | "Harmonisation of Turn Around Time (TAT) and customer compensation for failed transactions using authorised Payment Systems" | [FACT, PRIMARY] |
| Date issued | **20 September 2019** | [FACT, PRIMARY] |
| Effective | **15 October 2019** | [FACT, PRIMARY] |

**Compensation schedule (all ₹100 per day of delay beyond the stated auto-reversal deadline):** `[FACT, PRIMARY]`

| Payment system | Failure scenario | Auto-reversal deadline | Penalty |
|---|---|---|---|
| ATM | Account debited, cash not dispensed | **T + 5 days** | ₹100/day beyond T+5 |
| Card-to-card transfer | Debited, beneficiary not credited | **T + 1 day** | ₹100/day beyond T+1 |
| PoS / Card-Not-Present | Debited, no confirmation | **T + 5 days** | ₹100/day beyond T+5 |
| **IMPS** | Beneficiary not credited | **T + 1 day** | ₹100/day beyond T+1 |
| **UPI (P2P)** | Transfer not credited | **T + 1 day** | ₹100/day beyond T+1 |
| **UPI (merchant / P2M)** | No transaction confirmation | **T + 5 days** | ₹100/day beyond T+5 |
| Aadhaar-enabled (AePS) | Merchant confirmation delay | **T + 5 days** | ₹100/day beyond T+5 |
| APBS | Beneficiary credit delay | **T + 1 day** | ₹100/day beyond T+1 |
| NACH | Credit / reversal delay | **T + 1 day** | ₹100/day beyond T+1 |
| PPIs (wallets) | On-us transaction failure | **T + 1 day** | ₹100/day beyond T+1 |

> **Load-bearing quote (primary):** "Wherever financial compensation is involved, the same shall be effected to the customer's account suo moto, without waiting for a complaint."

**Why this matters for a merchant-facing pitch** `[HYPOTHESIS]`: the ₹100/day liability sits on the *bank*, not the merchant. But the T+1 / T+5 reversal window is precisely the period during which a merchant's customer has money debited, no order confirmed, and a support ticket open. The regulation defines the size of the customer-experience hole, not who pays for it.

---

## 4. Bank downtime, UPI outages, and NPCI/RBI response

### 4.1 Outage incidents

| Date | Duration | Cause | Label |
|---|---|---|---|
| **12 April 2025** | **~5 hours (~300 minutes)** — longest UPI downtime in recent years | PSP banks flooding NPCI with 'Check Transaction Status' API calls | [FACT, SECONDARY] |
| **March 2025** (partial/intermittent) | **95 minutes** | not disclosed | [FACT, SECONDARY] |
| **26 March 2025** | **>1 hour** | SD-WAN (software-defined WAN) technical malfunction | [FACT, SECONDARY] |
| **2 April 2025** | duration not disclosed | not disclosed | [FACT, SECONDARY] |
| **January 2022** | **187 minutes** | not disclosed | [FACT, SECONDARY] |

Root cause, quoted: *"payment service provider (PSP) banks sending an excessive number of 'Check Transaction Status' API calls which overwhelmed the system's capacity and led to instability."*
UPI scale at the time of the April 2025 outage: *"the platform handling a record of 20 billion transactions worth Rs 25 trillion (US$300 billion) in March 2025 alone."*
URL: https://www.sg.atlstech.com/asia-payments-research-category/upi-outages-in-early-2025-indicate-need-for-tighter-controls-and-monitoring.html (formerly Kapronasia) — retrieved 2026-08-26.

Corroborating: ORF Online, "UPI at Scale: Outages and the Push for Resilient Systems" — confirms outages in March, April and May 2025 and notes UPI volume dipped from 18.3 bn (March 2025) to 17.89 bn (April 2025), attributing the dip in part to "the frequent nature of outages." `[FACT, SECONDARY]` URL: https://www.orfonline.org/expert-speak/upi-at-scale-outages-and-the-push-for-resilient-systems

⚠️ Note: ORF's UPI volume series (18.3 bn March 2025) and the Kapronasia "20 billion in March 2025" figure **disagree**. Use the ORF/NPCI-style figure (18.3 bn) — it is consistent with the 23.66 bn July 2026 record and +22% YoY. Flag the discrepancy if pressed.

### 4.2 NPCI's regulatory response — API rate limiting circular

**NPCI circular dated 26 April 2025** `[FACT, SECONDARY]`, reported at https://upstox.com/news/business-news/latest-updates/banks-told-to-audit-upi-systems-follow-new-api-usage-norms-amid-outages-npci-circular/article-164050/ — retrieved 2026-08-26.

| Rule | Value |
|---|---|
| First 'Check Transaction Status' call | only **after 90 seconds** from transaction authentication |
| Max calls | **3 calls within a 2-hour window** |
| Batch processing | **not permitted**; banks must stop requests after known error codes |
| Audit | mandatory audit by **CERT-In empanelled** firms; annual API-usage reviews thereafter |

Root-cause language quoted from the circular: *"excessive and repetitive invocation of 'check transaction status' API at high transactions per second (TPS) by some PSP banks."*

`[HYPOTHESIS]` This is the single strongest structural argument for merchant-side intelligence: NPCI has now **capped** how aggressively a payment stack may poll for status. A merchant/PSP that cannot resolve payment state without polling is regulatorily constrained from brute-forcing it.

### 4.3 RBI enforcement against bank downtime (precedent)

| Bank | Action | Date | Label |
|---|---|---|---|
| **HDFC Bank** | RBI ordered halt to all new digital launches and new credit-card sourcing after repeated internet/mobile banking and payment-utility outages | **Dec 2020** (lifted in stages; credit cards Aug 2021) | [FACT, SECONDARY] |
| **Kotak Mahindra Bank** | RBI barred onboarding new customers via online/mobile channels and issuing new credit cards, citing "frequent and significant outages" of core banking and digital channels over two years, most recently **15 April 2024** | **24 April 2024** | [FACT, SECONDARY] |

RBI Governor on the HDFC outages: *"You cannot put lakhs [of customers] in difficulty for hours"* (Business Standard, Dec 2020). `[FACT, SECONDARY]`

Source URLs (Business Standard returned 403 to programmatic fetch; headline+standfirst captured via search index — treat as SECONDARY and verify before quoting verbatim):
- https://www.business-standard.com/article/finance/halt-digital-launches-stop-selling-new-credit-cards-rbi-tells-hdfc-bank-120120300354_1.html
- https://www.business-standard.com/article/finance/you-cannot-put-lakhs-in-difficulty-for-hours-rbi-governor-on-hdfc-bank-120120400598_1.html
- https://www.startupcityindia.com/news/rbi-restrictions-on-kotak-mahindra-bank

### 4.4 Public NPCI outage reporting

NPCI publishes bank-wise **uptime / availability** alongside BD-TD on its "UPI Ecosystem Statistics" page (`https://www.npci.org.in/what-we-do/upi/upi-ecosystem-statistics` → now `https://www.npci.org.in/product/ecosystem-statistics/upi`). **The page is 403 to programmatic access and JS-rendered**; a proxy fetch surfaced only the chargeback table (e.g. July: YES BANK PHONEPE 4,794,368,589 transactions at 0.0000% chargeback ratio; SBI 2,264,527,039 at 0.0000%). **`EVIDENCE NOT FOUND` for machine-readable bank-wise uptime figures in this pass** — a human should open that page in a browser to pull the uptime column.

---

## 5. Payment retry, smart routing and failure recovery

**No regulator or industry-body data exists on retry/routing recovery.** Everything here is vendor-sourced and motivated. Flag every one of these numbers in the pitch.

| Claim | Value | Source | Label |
|---|---|---|---|
| Automated retries recover failed transactions | **15–20%** of failures, adding **3–5 percentage points** to overall PSR | Razorpay | ⚠️ VENDOR, no external cite |
| Smart routing vs single gateway | improves approval rates by **10–30%** | Razorpay | ⚠️ VENDOR, no external cite |
| Cascading logic recovery | **5–15%** of previously failed transactions | Razorpay / ECS Payments | ⚠️ VENDOR |
| Well-configured retry strategy | recovers **10–30%** of initially declined transactions | Gr4vy / Tagada (orchestration vendors) | ⚠️ VENDOR |
| Multi-PSP retry routing | **+2–5 percentage points** additional recovery | orchestration vendor blogs | ⚠️ VENDOR |
| ML signals over rule-based retries | **+5–12%** incremental recovery | orchestration vendor blogs | ⚠️ VENDOR |
| Subscription dunning recovery | up to **57%** of initially failed attempts recoverable | cited by Razorpay as **Stripe data, 2023** | ⚠️ VENDOR-of-VENDOR — verify against Stripe primary before use |

Source URLs: https://razorpay.com/blog/payment-success-rate-optimization-india/ · https://razorpay.com/blog/multi-gateway-routing-payment-orchestration-in-india-how-smart-routing-improves-success-rates/ · https://gr4vy.com/posts/payment-retry-logic-explained-smart-retries-for-failed-transactions-in-2026/ · https://www.ecspayments.com/smart-payment-routing/

`[HYPOTHESIS]` The convergent 10–30% recovery range across four independent (but all motivated) vendors is weak-to-moderate evidence that the true number is somewhere in that band. Do not present it as established.

---

## 6. Checkout abandonment

### 6.1 The canonical global benchmark — Baymard Institute

**PRIMARY (Baymard is the recognised research body, not a payments vendor).** URL: https://baymard.com/lists/cart-abandonment-rate — retrieved 2026-08-26.

| Figure | Value | Label |
|---|---|---|
| Average documented cart abandonment rate | **70.22%** | [FACT] |
| Basis | meta-analysis of **50** different published studies | [FACT] |
| Last updated | **22 September 2025** | [FACT] |

> **Exact quote:** "Based on the data we collected, we've calculated the average cart abandonment rate of 70.22%."

Individual studies in the meta-analysis range widely — Uptain 2025: 71.72%; SaleCycle 2020: 84.27%; Fresh Relevance 2021: 59.22%. `[FACT]`

**Recoverable revenue:**
> "the potential for a 35.26% increase in conversion rate translates to $260 billion worth of lost orders which are recoverable solely through a better checkout flow & design."
Geography: **combined US + EU ecommerce sales.** `[FACT]` — **Do not apply this to India.**

### 6.2 Reasons for abandonment — Baymard's latest quantitative study (US shoppers, updated Sept 2025)

Excludes the non-actionable "just browsing" segment, which is separately **42%** of US shoppers. `[FACT]`

| Reason | Share |
|---|---|
| Extra costs too high (shipping, tax, fees) | **40%** |
| Delivery was too slow | 20% |
| Didn't trust the site with credit card information | 19% |
| Site wanted me to create an account | 18% |
| Too long / complicated checkout process | 17% |
| **Website had errors / crashed** | **17%** |
| Returns policy wasn't satisfactory | 13% |
| Couldn't see / calculate total order cost up-front | 12% |
| **Credit card was declined** | **10%** |
| **Weren't enough payment methods** | **9%** |
| I don't know | 7% |

All `[FACT]`, same URL. Sample size and survey date are **not disclosed on the public page — `EVIDENCE NOT FOUND`.**

⚠️ Version discrepancy worth knowing: the widely-circulated "48% extra costs" figure is Baymard's **2024** cut; the current (Sept 2025) figure is **40%**. Use 40% and cite the 2025 update.

**The three payment-specific rows — errors/crashes 17%, card declined 10%, too few payment methods 9% — are the directly addressable share.** `[INFERENCE]` These are not mutually exclusive (respondents could select multiple), so they **cannot be summed to 36%**. Present them individually.

### 6.3 Mobile vs desktop

| Figure | Value | Source | Label |
|---|---|---|---|
| Mobile abandonment | **80.02%** | Razorpay Learn (compiling third-party data) | [FACT as-stated] ⚠️ VENDOR-compiled |
| Desktop abandonment | **66.41%** | same | [FACT as-stated] ⚠️ VENDOR-compiled |
| Desktop / Mobile / Tablet | 73.07% / **85.65%** / 80.74% | Shiprocket Checkout | ⚠️ VENDOR, conflicting |
| Mobile share of Indian ecommerce traffic | "over 60%" | Razorpay Learn | ⚠️ VENDOR |
| Mobile share of Indian web traffic | **77.92%** (vs 59.14% global avg) | Razorpay blog | ⚠️ VENDOR |
| Android share of Indian mobile traffic | **95.21%** | Razorpay blog | ⚠️ VENDOR |

Baymard's own page **does not** break out mobile vs desktop — `EVIDENCE NOT FOUND` from the canonical source. The two vendor figures above (80.02% vs 85.65% mobile) disagree by 5.6pp; treat the *direction* (mobile ~13–14pp worse than desktop) as `[HYPOTHESIS]` rather than the level.

URLs: https://razorpay.com/learn/cart-abandonment-rate-101/ · https://checkout.shiprocket.in/blog/latest-cart-abandonment-statistics-2025/

### 6.4 India-specific abandonment

**There is no Baymard-equivalent India study.** The Indian numbers in circulation are all vendor blog content.

| Claim | Value | Source | Label |
|---|---|---|---|
| Indian mobile cart abandonment | **85%** | Razorpay blog | ⚠️ VENDOR, no methodology |
| India average checkout conversion rate | **2.8%** | Razorpay blog | ⚠️ VENDOR, no methodology |
| Typical Indian D2C conversion rate | **~2%** vs Amazon/Flipkart **~10%** | Razorpay Learn | ⚠️ VENDOR — but a striking, quotable gap |
| Account-creation requirement drop-off | **~26% of all drop-offs** | Razorpay blog | ⚠️ VENDOR |
| Satisfaction decay | "Every 10-second delay in checkout drops customer satisfaction by 15%" | Razorpay blog | ⚠️ VENDOR, no source |
| Vertical abandonment (global, compiled) | Luxury/Jewellery 82.84% · Beauty 80.92% · Home/Furniture 80.32% · Fashion 78.53% · Multi-brand retail 76.90% · Food/Bev 63.62% · Consumer goods 57.37% | Razorpay Learn | ⚠️ VENDOR-compiled |

**`EVIDENCE NOT FOUND`: a non-vendor, methodologically-disclosed India cart-abandonment rate.** This is a genuine gap in the public record and is worth *saying out loud* in the pitch — it is itself an argument that Indian checkout is under-measured.

### 6.5 Razorpay's own product claims — VENDOR, use only with attribution

⚠️ All of the following are **Razorpay marketing claims about Razorpay's own product**. They are motivated and none disclose methodology, sample, or control group.

| Claim | Value | URL |
|---|---|---|
| Magic Checkout conversion boost | **15%**, "trusted by 10,000+ brands" | razorpay.com (Magic Checkout marketing) |
| Cart abandonment reduction | **22%** | Razorpay Magic Checkout materials |
| Shopper network for prefill | **100 million+ shoppers** | https://razorpay.com/learn/cart-abandonment-rate-101/ |
| Case: Oleum Cottage | **54%** conversion increase; checkout "5X faster" | https://razorpay.com/learn/reduce-cart-abandonment-rate-with-magic/ |
| Case: Uberlyfe | **14%** conversion increase | same |
| Case: Deodap | address pre-fill alone → **10%** sales increase | same |
| Case: Reload Casuals | order conversion 27.37% → 43.22% (**+57.91%**) | Razorpay case study |
| Case: Root Deep | **30%** conversion uplift | Razorpay case study |
| Single-page mobile checkout (India) | **12–17%** conversion improvement, **21–26%** RTO reduction | https://razorpay.com/blog/mobile-checkout-india-reduce-load-failures/ |

**Handling advice:** the single-merchant case studies (54%, 57.91%) are survivorship-selected and should not be generalised. The portfolio-level "15% conversion boost / 22% abandonment reduction" is the only claim with a plausible n, and even that has no disclosed baseline.

---

## 7. ₹ value of failed / abandoned transactions in Indian ecommerce

**`EVIDENCE NOT FOUND` — there is no credible published rupee figure for the value of abandoned Indian ecommerce carts.** The closest available anchors:

1. **Baymard, US+EU only:** $260 billion in lost orders recoverable through better checkout design. `[FACT]` — **not transferable to India.**
2. **`[INFERENCE]` UPI-value proxy (see §1.5C):** ₹29.88 lakh crore × 0.8% TD = **≈ ₹23,904 crore/month** of UPI transaction value hitting a technical decline. This is *all* UPI (P2P + P2M), not ecommerce-only, and assumes failed transactions carry the same average ticket. Do not call this "lost ecommerce revenue."
3. A circulating "USD 18 billion in sales revenue annually" abandonment figure appears in a Shiprocket post attributed to "Flowium" — **unverified, global, and traceable only to marketing content. Do not use.**

**If you need a number, build it transparently on stage:** state UPI monthly value (₹29.88 lakh crore, NPCI/July 2026), state the decline rate you are applying (0.8% TD, or 7–9% total failure per the NPCI-derived 2022-23 analysis), and show the multiplication. Label it INFERENCE. Do not import a foreign dollar figure.

---

## 8. Regulatory friction: authentication (3DS / OTP / AFA)

| Item | Value | Label |
|---|---|---|
| Instrument | **RBI (Authentication Mechanisms for Digital Payment Transactions) Directions, 2025** | [FACT, SECONDARY] |
| Issued | **25 September 2025** | [FACT, SECONDARY] |
| Compliance deadline | **1 April 2026** | [FACT, SECONDARY] |
| Cross-border CNP AFA deadline | **1 October 2026** | [FACT, SECONDARY] |
| Precursor drafts | Alternative Authentication Mechanisms draft **31 July 2024**; cross-border CNP AFA draft **7 February 2025** | [FACT, SECONDARY] |
| Core rule | at least **two distinct** authentication factors, at least one **dynamically created for one-time use** | [FACT, SECONDARY] |
| Status of SMS OTP | remains an accepted method; framework encourages biometrics/tokens | [FACT, SECONDARY] |
| Exemptions | small-value contactless card payments **up to ₹5,000** at PoS; e-mandate recurring transactions; small-value offline digital payments; gift PPIs | [FACT, SECONDARY] |

Sources (law-firm and analyst commentary; **the RBI notification ID was not captured** — `EVIDENCE NOT FOUND` for the exact circular reference number and rbi.org.in URL, verify before citing):
- https://www.khaitanco.com/thought-leadership/RBI-Authentication-Mechanisms-for-Digital-Payments-Transactions-Directions
- https://www.mondaq.com/india/new-technology/1728730/understanding-rbi-authentication-mechanisms-for-digital-payment-transactions-directions-2025-obligations-for-banks-nbfcs-and-payment-providers
- https://www.business-standard.com/markets/capital-market-news/rbi-issues-directions-on-framework-on-authentication-mechanisms-for-digital-payment-transactions-125092501090_1.html

### OTP delivery failure / drop-off
**`EVIDENCE NOT FOUND` for a credible, methodologically-disclosed OTP drop-off rate in India.** Every figure returned by search came from SMS/CPaaS vendors selling OTP delivery, with no methodology:
- "SMS OTP delivery failure rates can reach 15-20% in certain geographic regions" — MojoAuth (⚠️ vendor, sells passwordless auth — *maximally* motivated to inflate this).
- "SMS transactional messages typically achieve 92–98% delivery rates" in India — SMS vendor blog (⚠️ vendor, contradicts the above).
- "even a 1 percent OTP failure rate translates to 8-15 percent revenue at risk" — vendor blog, arithmetic not shown and not reproducible.
**Do not use any OTP drop-off number in the pitch.** Cited failure causes (DLT template mismatch, grey-route delivery, operator congestion at peak, aggregator DLRs that don't reflect device delivery) are directionally plausible `[HYPOTHESIS]` and can be described qualitatively without a number.

---

## 9. Macro context (for sizing the market)

| Figure | Value | Source | Label |
|---|---|---|---|
| UPI share of India payment **volume**, H2 2025 | **85.5%** | RBI Payment System Report (via Business Standard / Storyboard18) | [FACT, SECONDARY] |
| UPI share of India payment **value**, H2 2025 | **9.5%** | same | [FACT, SECONDARY] |
| RTGS share of value | 68.6% | same | [FACT, SECONDARY] |
| India daily payment transactions | **77.6 crore/day (776 million/day)** | RBI Payment System Report | [FACT, SECONDARY] |
| UPI transactions, H2 2025 | **12,191 crore (121.91 billion)** vs 1,530 crore in H1 2021 | RBI PSR | [FACT, SECONDARY] |
| Digital payments share of total transaction volume | **99.8%** of volume, **97.8%** of value | RBI PSR | [FACT, SECONDARY] |
| UPI FY2025-26 | crossed **200 billion** transactions; growth slowed to **30% YoY** (vs 42% in FY24-25) | RBI PSR via Business Upturn | [FACT, SECONDARY] |
| Banks live on UPI | **741** | Business Today, 25 Aug 2026 | [FACT, SECONDARY] |
| RBI Ombudsman complaints FY25 | **13.34 lakh**, +13.55% YoY | RBI Annual Report of Ombudsman Scheme 2024-25 via The Tribune | [FACT, SECONDARY] |
| — Mobile/electronic banking share | **12.74%** (declining) | same | [FACT, SECONDARY] |
| — ATM/debit-card complaints | fell 14.56% (FY23) → **7.47%** (FY25) | same | [FACT, SECONDARY] |

⚠️ Note: the Ombudsman report **does not break out "failed transaction" as a category** — `EVIDENCE NOT FOUND` for a count of failed-transaction complaints.
⚠️ Note: one secondary reported "credit cards 17.15%, mobile banking 16.86%" while another reported "credit cards +20.04%, mobile/electronic banking 12.74%". These are inconsistent — **verify against the RBI report PDF before using any Ombudsman category share.**

---

## 10. The three defensible headline claims (what to actually put on a slide)

1. **Business decline, not technical decline, is the unsolved problem.** In NPCI's July 2026 bank-wise remitter data, **all 10** publicly-visible banks exceed OC-149's 5% business-decline target; five exceed 10%. Airtel Payments Bank approved only **72.56%** of UPI transactions with **26.97% BD**. `[FACT]`
2. **The absolute scale is enormous even at "good" rates.** At NPCI's own stated 0.8% technical-decline rate applied to July 2026's record 23.66 bn transactions: **≈189 million technically-declined UPI transactions per month, ≈6.1 million per day.** `[INFERENCE — working shown in §1.5]`
3. **Checkout abandonment is 70.22% globally (Baymard, 50-study meta-analysis, Sept 2025)** and the payment-specific reasons — site errors/crashes **17%**, card declined **10%**, too few payment methods **9%** — are exactly the ones a payments layer can move. `[FACT]`

---

## Sources

| # | Title | URL | Type | Retrieved | Notes |
|---|---|---|---|---|---|
| P1 | RBI: Harmonisation of Turn Around Time (TAT) and customer compensation for failed transactions using authorised Payment Systems — RBI/2019-20/67, DPSS.CO.PD No.629/02.01.014/2019-20, 20 Sep 2019 | https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11693&Mode=0 | **Regulator (PRIMARY)** | 2026-08-26 | Fetched successfully; full TAT table + ₹100/day compensation |
| P2 | Baymard Institute — 50 Cart Abandonment Rate Statistics (updated 22 Sep 2025) | https://baymard.com/lists/cart-abandonment-rate | **Research institute (PRIMARY)** | 2026-08-26 | 70.22% average; reason breakdown; $260bn US+EU |
| N1 | NPCI — UPI OC-149, Reduction of business decline in UPI | https://www.npci.org.in/PDF/npci/upi/circular/2022/UPI-OC-149-Reduction-of-business-decline-in-UPI.pdf | Industry body (PRIMARY) | 2026-08-26 | **403 Forbidden — NOT retrieved** |
| N2 | NPCI — OC-149-A Addendum, 15 Jun 2022 | https://www.npci.org.in/PDF/npci/upi/circular/2022/OC149-A-Addendum-to-OC-149-Reduction-of-business-declines-in-UPI.pdf | Industry body (PRIMARY) | 2026-08-26 | **403 Forbidden — NOT retrieved** |
| N3 | NPCI — UPI Ecosystem Statistics | https://www.npci.org.in/what-we-do/upi/upi-ecosystem-statistics · https://www.npci.org.in/product/ecosystem-statistics/upi | Industry body (PRIMARY) | 2026-08-26 | 403 direct; via proxy only chargeback table rendered; uptime/BD-TD tables not machine-readable |
| N4 | NPCI — UPI Product Statistics | https://www.npci.org.in/what-we-do/upi/product-statistics | Industry body (PRIMARY) | 2026-08-26 | 403 / empty via proxy |
| S1 | Dataful — Dataset 445: Year, Month and Bank wise Top 50 Performing Remitter Banks in UPI Transactions (source: NPCI) | https://dataful.in/datasets/445/ | Data aggregator (republishes NPCI) | 2026-08-26 | **Bank-wise approved/BD/TD, July 2026** — best available NPCI proxy |
| S2 | Zee Business — "Only 0.8% of UPI transactions face 'technical declines' now: NPCI" (Dilip Asbe, 20 Nov 2024) | https://www.zeebiz.com/economy-infra/news-only-08-of-upi-transactions-face-technical-declines-now-npci-327217 | News (quotes NPCI CEO) | 2026-08-26 | 403 direct; retrieved via r.jina.ai proxy |
| S3 | Finbox (Substack) — "The chink in the UPI armour" | https://finbox.substack.com/p/the-chink-in-the-upi-armour | Analyst newsletter (analyses NPCI data) | 2026-08-26 | 445.85mn→625.23mn failures; 7–9%; 81.7% BD / 18.26% TD |
| S4 | Entrackr — UPI hits highest-ever monthly volume with 23.66 bn transactions in July | https://entrackr.com/news/upi-hits-highest-ever-monthly-volume-with-2366-bn-transactions-in-july-12217613 | News (NPCI data) | 2026-08-26 | July 2026: 23.66bn / ₹29.88 lakh crore |
| S5 | Business Standard — UPI clocks record monthly volume as July transactions rise 4.1% to 23.66 bn | https://www.business-standard.com/finance/news/upi-transactions-hit-record-23-66-billion-in-july-value-rs-29-88-trillion-126080100548_1.html | News (NPCI data) | 2026-08-26 | Corroborates S4; 403 to fetch, headline captured |
| S6 | Kapronasia / Atlas Technologies — UPI outages in early 2025 indicate need for tighter controls and monitoring | https://www.sg.atlstech.com/asia-payments-research-category/upi-outages-in-early-2025-indicate-need-for-tighter-controls-and-monitoring.html | Industry analyst | 2026-08-26 | Apr 12 2025 ~5hr; Mar 2025 95min; Jan 2022 187min; API rules |
| S7 | ORF Online — UPI at Scale: Outages and the Push for Resilient Systems | https://www.orfonline.org/expert-speak/upi-at-scale-outages-and-the-push-for-resilient-systems | Think tank | 2026-08-26 | Mar 2025 18.3bn → Apr 2025 17.89bn dip |
| S8 | Business Standard — UPI outages lasted 282 minutes across two incidents in 2022, 2025 | https://www.business-standard.com/finance/news/upi-outages-lasted-282-minutes-across-two-incidents-in-2022-2025-125041300574_1.html | News | 2026-08-26 | **403 — not retrieved**; headline figure 282 min = 95 + 187 |
| S9 | Upstox — Banks told to audit UPI systems, follow new API usage norms amid outages: NPCI circular (26 Apr 2025) | https://upstox.com/news/business-news/latest-updates/banks-told-to-audit-upi-systems-follow-new-api-usage-norms-amid-outages-npci-circular/article-164050/ | News (quotes NPCI circular) | 2026-08-26 | 90s delay; 3 calls / 2 hours; CERT-In audit |
| S10 | MediaNama — NPCI issues new guidelines to curb UPI outage | https://www.medianama.com/2025/04/223-npci-new-guidelines-upi-outage/ | News | 2026-08-26 | **403 — not retrieved** |
| S11 | The Tribune — RBI Ombudsman sees 13.34 lakh complaints in FY25 | https://www.tribuneindia.com/news/banking-complaints/rbi-ombudsman-sees-13-34-lakh-complaints-in-fy25-loans-credit-cards-dominate | News (reports RBI Annual Report of Ombudsman Scheme 2024-25) | 2026-08-26 | +13.55% YoY; category shares |
| S12 | Storyboard18 — UPI accounted for 85.5% of volumes, RTGS handled 68.6% of value: RBI report | https://www.storyboard18.com/digital/upi-accounted-for-85-5-of-volumes-rtgs-handled-68-6-of-value-rbi-report-98515.htm | News (reports RBI Payment System Report) | 2026-08-26 | H2 2025 |
| S13 | Business Standard — UPI accounts for 85% of payment volumes: RBI's Payment System Report | https://www.business-standard.com/finance/news/upi-accounts-for-85-of-payment-volumes-rbi-s-payment-system-report-125102301181_1.html | News (RBI PSR) | 2026-08-26 | |
| S14 | Business Today — 741 banks on UPI: How India built the world's biggest real-time payments ecosystem (25 Aug 2026) | https://www.businesstoday.in/latest/economy/story/741-banks-on-upi-how-india-built-the-worlds-biggest-real-time-payments-ecosystem-551210-2026-08-25 | News | 2026-08-26 | 741 banks live |
| S15 | Business Upturn — UPI crosses 200 billion transactions in 2025-26 as growth slows to 30%, RBI report shows | https://www.businessupturn.com/sectors/banking/upi-crosses-200-billion-transactions-in-2025-26-as-growth-slows-to-30-rbi-report-shows | News (RBI PSR) | 2026-08-26 | |
| S16 | Business Standard — Halt digital launches, stop selling new credit cards, RBI tells HDFC Bank (Dec 2020) | https://www.business-standard.com/article/finance/halt-digital-launches-stop-selling-new-credit-cards-rbi-tells-hdfc-bank-120120300354_1.html | News | 2026-08-26 | 403 to fetch; headline captured |
| S17 | Business Standard — "You cannot put lakhs in difficulty for hours": RBI governor on HDFC Bank | https://www.business-standard.com/article/finance/you-cannot-put-lakhs-in-difficulty-for-hours-rbi-governor-on-hdfc-bank-120120400598_1.html | News | 2026-08-26 | 403 to fetch; headline captured |
| S18 | StartupCity India — RBI imposes restrictions on Kotak Mahindra Bank's online services and credit card issuance | https://www.startupcityindia.com/news/rbi-restrictions-on-kotak-mahindra-bank | News | 2026-08-26 | Apr 2024; "frequent and significant outages" |
| L1 | Khaitan & Co — RBI (Authentication Mechanisms for Digital Payments Transactions) Directions | https://www.khaitanco.com/thought-leadership/RBI-Authentication-Mechanisms-for-Digital-Payments-Transactions-Directions | Law firm | 2026-08-26 | 25 Sep 2025; compliance 1 Apr 2026 |
| L2 | Mondaq — Understanding RBI (Authentication Mechanisms for Digital Payment Transactions) Directions, 2025 | https://www.mondaq.com/india/new-technology/1728730/understanding-rbi-authentication-mechanisms-for-digital-payment-transactions-directions-2025-obligations-for-banks-nbfcs-and-payment-providers | Law firm/analyst | 2026-08-26 | Exemptions incl. ₹5,000 contactless |
| L3 | Business Standard — RBI issues directions on framework on authentication mechanisms for digital payment transactions | https://www.business-standard.com/markets/capital-market-news/rbi-issues-directions-on-framework-on-authentication-mechanisms-for-digital-payment-transactions-125092501090_1.html | News | 2026-08-26 | 25 Sep 2025 |
| V1 | ⚠️ Razorpay — Payment Success Rate Optimization India (2026 Guide) | https://razorpay.com/blog/payment-success-rate-optimization-india/ | **VENDOR (motivated)** | 2026-08-26 | Card/netbanking/D2C success rates; retry recovery 15–20% |
| V2 | ⚠️ Razorpay — Multi-Gateway Routing & Payment Orchestration in India | https://razorpay.com/blog/multi-gateway-routing-payment-orchestration-in-india-how-smart-routing-improves-success-rates/ | **VENDOR** | 2026-08-26 | 10–30% routing uplift; 62% churn claim is UNSOURCED |
| V3 | ⚠️ Razorpay — What is Cart Abandonment Rate? Exact Formula and Benchmarks | https://razorpay.com/learn/cart-abandonment-rate-101/ | **VENDOR** | 2026-08-26 | Vertical rates; mobile 80.02% / desktop 66.41%; D2C 2% vs marketplace 10% |
| V4 | ⚠️ Razorpay — How Magic Checkout Reduces Cart Abandonment Rate | https://razorpay.com/learn/reduce-cart-abandonment-rate-with-magic/ | **VENDOR** | 2026-08-26 | Merchant case studies (54%, 14%, 10%) |
| V5 | ⚠️ Razorpay — Mobile Checkout India 2026: Fix Load Failures & Actually Boost Sales | https://razorpay.com/blog/mobile-checkout-india-reduce-load-failures/ | **VENDOR** | 2026-08-26 | 85% mobile abandonment; 2.8% conversion; Intent flow 92–95% |
| V6 | ⚠️ Shiprocket Checkout — Cart Abandonment Statistics 2025 | https://checkout.shiprocket.in/blog/latest-cart-abandonment-statistics-2025/ | **VENDOR** | 2026-08-26 | Device rates; no India-specific data despite India focus |
| V7 | ⚠️ Gr4vy — Payment retry logic explained: smart retries for failed transactions in 2026 | https://gr4vy.com/posts/payment-retry-logic-explained-smart-retries-for-failed-transactions-in-2026/ | **VENDOR (orchestrator)** | 2026-08-26 | 10–30% retry recovery |
| V8 | ⚠️ ECS Payments — Using Smart Payment Routing and Retries to Recover Failed Transactions | https://www.ecspayments.com/smart-payment-routing/ | **VENDOR** | 2026-08-26 | 5–15% cascade recovery |
| V9 | ⚠️ MojoAuth — SMS OTP Delivery Problems and Solutions | https://mojoauth.com/white-papers/sms-otp-delivery-problems-solutions/ | **VENDOR (sells passwordless auth)** | 2026-08-26 | 15–20% OTP failure claim — maximally motivated, DO NOT USE |
| B1 | productgrowth.in — UPI Payment Success Rates: 2026 Benchmarks | https://productgrowth.in/insights/fintech/upi-payment-success-rates/ | Industry blog (non-vendor) | 2026-08-26 | Useful for its admission that no PSP publishes official benchmarks |
| B2 | Worldline India Digital Payment Report CY2025 in Review | https://worldline.com/en-in/home/main-navigation/resources/reports-and-insights/2025/india-digital-payment-report-calendar-year-2025-in-review | Industry (PSP, but a recognised report series) | 2026-08-26 | Checked for success/decline rates — **contains none**; card volume/value only |

---

## Appendix: what is NOT established (do not fill these gaps by guessing)

- Verbatim text of NPCI OC-149 (403-blocked).
- NPCI-official system-wide TD% for any month in 2026.
- Bank-wise UPI **uptime** figures (NPCI publishes them; page not machine-accessible).
- Any regulator-published card or netbanking success rate for India.
- A count of "failed transaction" complaints in the RBI Ombudsman report.
- A methodologically-disclosed India cart-abandonment rate.
- Any credible India OTP drop-off rate.
- The rupee value of abandoned Indian ecommerce carts.
- Baymard's survey sample size and field date for the reasons breakdown.
- The exact RBI notification ID/URL for the Authentication Mechanisms Directions, 2025.
