# Revenue Leakage: Subscriptions, Involuntary Churn, B2B Receivables — Evidence Pack

**Compiled:** 2026-08-26 · **All retrieval dates: 2026-08-26** · **Geography: India-first**

**Labelling:** `[FACT]` fetched & read · `[FACT — SECONDARY]` news report of a primary · `[UNVERIFIED FETCH]` search synthesis, page not openable — **lead, not citation** · `[INFERENCE]` my arithmetic, working shown · `[HYPOTHESIS]` · `⚠️ VENDOR` motivated source.

---

## 1. Recurring payments in India — the regulatory shape of the problem

### 1.1 RBI Digital Payments – E-mandate Framework, 2026 — PRIMARY, fetched from rbi.org.in

**Source: RBI Master Direction, "Digital Payments – E-mandate Framework, 2026", circular RBI/DPSS/2026-27/396, dated 21 April 2026.** `[FACT]`

This is the current, consolidated rulebook — it supersedes the scattered 2019–2023 e-mandate circulars. Key provisions as fetched:

| Provision | Rule |
|---|---|
| **Registration** | Requires "successful validation of additional factor of authentication (AFA), in addition to the normal process" |
| **First transaction** | Requires AFA |
| **Modification / withdrawal of a mandate** | Requires AFA |
| **Opt-out of a particular transaction** | Customer can, using AFA |
| **Pre-debit notification** | Issuer must notify **"at least 24 hours prior to the actual charge / debit"**, containing merchant name, amount, debit date/time, e-mandate reference number, and reason for debit |
| **Notification exemption** | FASTag and National Common Mobility Card auto-replenishment mandates |
| **General AFA-free ceiling** | **₹15,000 per transaction**; above this, AFA required |
| **Elevated AFA-free ceiling** | **₹1,00,000 per transaction** for insurance premiums, mutual fund subscriptions, and credit card bill payments |

> **Why this is the whole ballgame for subscription revenue in India.** Every recurring charge above ₹15,000 (or ₹1 lakh in the three exempt categories) drops out of the automated flow and into an interactive AFA step. An interactive step at a moment the customer did not choose is a drop-off point. Simultaneously, the mandatory 24-hour pre-debit notification is a *documented, universal, scheduled cancellation prompt* delivered to every subscriber before every charge.
>
> **`[INFERENCE]`** India's recurring-payments regime therefore creates two structurally distinct revenue-loss mechanisms that do not exist in the same form in US/EU card-on-file: (a) an **AFA cliff** at a fixed rupee threshold, and (b) a **regulator-mandated daily churn prompt**. Both are predictable in timing — which is exactly what makes them addressable by a model that knows *which* mandates are about to fail and *why*.

### 1.2 UPI Autopay scale and failure

| Claim | Figure | Status |
|---|---|---|
| UPI Autopay mandates, Nov 2025 | 1.27 billion, ~10x vs Jan 2024 | `[UNVERIFIED FETCH]` |
| UPI Autopay failure rate | 8–15% | ⚠️ `[UNVERIFIED FETCH]` — **blog/vendor, no methodology. WEAK.** |
| Card mandate failure rate (comparison) | 2–3% | ⚠️ `[UNVERIFIED FETCH]` — same weak source |
| SBI auto-debit approval rate | ~30% approved / ~70% fail, "predominantly business-related, insufficient funds at the moment the mandate is triggered" | ⚠️ `[UNVERIFIED FETCH]` — **striking if true, but single weak source. Verify or drop.** |

`EVIDENCE NOT FOUND` — an NPCI-published UPI Autopay decline rate. NPCI does publish mandate-level statistics but npci.org.in returns 403 to programmatic fetch.

> **The structural cause is well-established even without the rate**: e-mandates are *pull* transactions executed on a schedule the payer did not pick, against a balance the payer did not top up for that moment. UPI is stateless per-transaction; there is no issuer-side "keep trying" behaviour of the kind card networks provide. `[HYPOTHESIS — mechanism is sound, magnitude unevidenced]`

### 1.3 Involuntary churn — ⚠️ ENTIRELY VENDOR-SOURCED, ALL UNVERIFIED

Every figure below is published by a company selling dunning/recovery software, and I could not open any of the sources. `[UNVERIFIED FETCH]` `⚠️ VENDOR`

| Claim | Figure |
|---|---|
| Global cost of failed subscription payments, 2025 | ~$129 billion |
| Involuntary churn as share of all subscription losses | 20–40% |
| Median failed-payment recovery rate (SaaS) | 47.6% |
| Recovery with intelligent retry logic vs single retry | 68% vs 23% |
| Average transaction failure rate across industries | 7.9% |
| Share of payment failures caused by expired cards | 42% |
| Typical MRR lost to failed payments + involuntary churn | ~9% |

> **Recommendation:** the *mechanism* (involuntary churn is recoverable, voluntary churn largely isn't) is real and uncontroversial. The *numbers* are marketing. **Use the RBI framework (§1.1) as your evidence base for India instead** — it is primary, specific, and nobody else in the room will have read it.

---

## 2. B2B receivables — the best-evidenced India number in this entire pack

### 2.1 ₹7.34 lakh crore locked in delayed MSME payments

**Source: *Delayed Payments Report 3.0 — "MSME's Access to Finance and Timely Payments"*, published jointly by the Global Alliance for Mass Entrepreneurship (GAME), the Federation of Indian Micro and Small & Medium Enterprises (FISME), and C2FO.** Reported on fisme.org.in, fetched directly. `[FACT — SECONDARY, from the publishing industry body's own site]`

> **"Rs 7.34 lakh crore as of March 2024"** — total value of delayed payments owed to Indian MSMEs.

- Down from **₹10.7 lakh crore in 2022** — a ~30% decline. `[UNVERIFIED FETCH]` for the 2022 figure and the 30%; the ₹7.34 lakh crore / March 2024 pair is the fetched, solid one.
- Owed across India's **6.4 million MSMEs**. `[UNVERIFIED FETCH]`
- **Micro enterprises are the worst hit — payment delays reportedly ~3x longer than those experienced by larger firms.** `[UNVERIFIED FETCH]`

**Caveat on the publisher:** GAME and FISME are MSME-advocacy organisations and C2FO sells working-capital financing. They are **not neutral** — all three benefit from the number being large. It is nonetheless the most-cited India figure, is methodologically described, and is the third iteration of a tracked series. Flag the affiliation on the slide; don't hide it.

> **`[INFERENCE]` Scale check.** ₹7.34 lakh crore = ₹7.34 trillion ≈ **US$88 billion** at ~₹83/USD. *Working: 7.34e12 ÷ 83 = 8.84e10.*
> A second framing, using the UPI volume from `payment_problems.md`: UPI processed ₹29.88 lakh crore in July 2026. So **the money owed to and withheld from Indian MSMEs is roughly a quarter of one month of total UPI throughput — permanently frozen rather than circulating.** *Working: 7.34 ÷ 29.88 = 0.246.*

### 2.2 MSME Samadhaan — the enforcement channel, and its failure rate

| Claim | Figure | Status |
|---|---|---|
| Applications filed by MSMEs against buyers since Oct 2017 | 1.76 lakh, involving **₹41,105 crore** | `[UNVERIFIED FETCH]` |
| Cases actually disposed by MSE Facilitation Councils | 34,551, involving ₹6,052 crore | `[UNVERIFIED FETCH]` |
| Applications filed as of mid-2025 | >2.18 lakh | `[UNVERIFIED FETCH]` |

`[INFERENCE]` If those figures verify: **34,551 ÷ 1,76,000 ≈ 19.6% of applications disposed**, and **₹6,052 cr ÷ ₹41,105 cr ≈ 14.7% of the disputed value resolved.** The formal statutory remedy resolves roughly one case in five. *That is the argument that the problem must be solved upstream, before it becomes a dispute.*

**Access note:** `samadhaan.msme.gov.in` — the official portal with the live dashboard — **refused connection (ECONNREFUSED)** at time of research. The portal publishes exactly these counters live. **Retry it; it is the primary and it is free.**

### 2.3 Section 43B(h) — the tax rule that made this everyone's problem

`[FACT — SECONDARY]`, corroborated across multiple Indian tax-practice sources:

- Introduced by the **Finance Act 2023**, effective **1 April 2024**.
- If the supplier is a **Udyam-registered micro or small enterprise**, the buyer must pay within **15 days** where there is no written agreement, or by the agreed date subject to an **outer cap of 45 days** (per Section 15, MSMED Act).
- **The buyer cannot claim the income-tax deduction on that expense until the MSME is actually paid.** The deduction is deferred to the year of actual payment.
- Buyer can additionally face **compound interest at three times the RBI bank rate**, monthly.

> **This is the "why now" for B2B receivables in India.** Before FY2024-25, paying an MSME late was a working-capital decision. After 43B(h), it is a **tax event that hits the buyer's own P&L**. Every mid-size and large Indian buyer now has a compliance reason — not just a goodwill reason — to know exactly which of its payables are to Udyam-registered micro/small suppliers and which are approaching day 45. **That classification problem (is this vendor MSME-registered? when does the clock expire? which invoices breach?) is unglamorous, high-volume, document-driven, and a natural fit for extraction + matching models.** `[INFERENCE]`

### 2.4 DSO and payment cycles

| Claim | Figure | Status |
|---|---|---|
| National average invoice payment cycle, Indian MSMEs | **73 days** | ⚠️ `[UNVERIFIED FETCH]` — Recordent *Indian SME Receivables Report 2026*; Recordent sells receivables/credit-management software. Sample described as ~1.1 lakh MSMEs, 10+ lakh transaction-level data points. |
| Average overdue receivables per Indian SME | ₹3.83 crore | ⚠️ `[UNVERIFIED FETCH]` — same vendor |
| Share of India's Gross Value Added locked in delayed B2B payments | **5.9%** | `[UNVERIFIED FETCH]` — **high-impact if verified; find the primary** |
| SIDBI-RBI MSME survey (2025): delayed payments among top-3 constraints on MSME growth | qualitative | `[UNVERIFIED FETCH]` — **SIDBI/RBI would be a strong primary. Chase this one.** |

---

## 3. General revenue leakage

| Claim | Figure | Status |
|---|---|---|
| Share of realised EBITA a company should expect to lose to leakage annually | **1–5%** (attributed to EY) | `[UNVERIFIED FETCH]` — widely repeated; **I could not locate the underlying EY publication.** Treat as folklore until traced. |
| Share of companies experiencing some form of revenue leakage | 42% (attributed to MGI Research) | `[UNVERIFIED FETCH]` |
| Subscription businesses' revenue lost to leakage, by billing model | 3–9% | ⚠️ VENDOR |

> ⚠️ **Caution.** "Companies lose 1–5% of revenue to leakage" is one of the most-laundered statistics in B2B software marketing. It is repeated by dozens of vendors, all citing "EY", none citing a specific EY report, page, or year. **Marked `UNVERIFIED — DO NOT USE IN PITCH` unless someone finds the actual EY document.**

---

## 4. What this means for track selection

**Track 3 (AI Revenue Recovery)** and **Track 5 (Open)** are both well served here, but with very different evidence quality:

| Sub-problem | Evidence quality | Verdict |
|---|---|---|
| **B2B receivables / MSME 45-day rule** | **Strong.** ₹7.34 lakh crore from a named, tracked, third-edition report; Section 43B(h) is statute and needs no source at all. | **Best-evidenced revenue-recovery problem available.** |
| **India e-mandate / AFA-driven subscription failure** | **Strong on mechanism** (RBI primary, fetched), **weak on magnitude** (no published decline rate). | Strong pitch if framed around the *regulatory structure* rather than a failure percentage. |
| **Involuntary churn / dunning** | **Weak.** All vendor, all unverified, and it's a crowded product category. | Avoid as the headline. |
| **Generic "revenue leakage %"** | **Unusable.** | Do not cite. |

---

## Sources

| # | Title | Publisher / type | URL | Retrieved / status |
|---|---|---|---|---|
| L1 | Digital Payments – E-mandate Framework, 2026 (RBI/DPSS/2026-27/396, 21 Apr 2026) | RBI / regulator — **PRIMARY, FETCHED** | https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13374 | 2026-08-26 ✅ |
| L2 | Delayed Payments To MSMEs Decline From Rs 10 Lakh Cr To Rs 7 Lakh Cr, But Challenges Persist: GAME-FISME Report | FISME / industry body — **FETCHED** | https://fisme.org.in/study/delayed-payments-to-msmes-decline-from-rs-10-lakh-cr-to-rs-7-lakh-cr-but-challenges-persist-game-fisme-report/ | 2026-08-26 ✅ |
| L3 | Delayed Payment Prevention to MSMEs & Startups | GAME / industry body | https://massentrepreneurship.org/delayed-payments/ | referenced, not fetched |
| L4 | MSME Samadhaan portal (live dashboard) | Ministry of MSME / **govt PRIMARY** | https://samadhaan.msme.gov.in/MyMsme/MSEFC/MSEFC_Welcome.aspx | **ECONNREFUSED — RETRY THIS** |
| L5 | RBI raises limit of e-mandates for recurring online transactions to ₹1 lakh | Business Standard / news | https://www.business-standard.com/amp/economy/interviews/rbi-raises-limit-of-e-mandates-for-recurring-online-transactions-to-1-lakh-123120801110_1.html | not fetched |
| L6 | RBI mandates additional factor authentication for e-mandates | MediaNama / news | https://www.medianama.com/2026/04/223-rbi-additional-factor-authentication-e-mandates/ | not fetched |
| L7 | Indian SMEs Face Mounting Working Capital Stress… (Recordent Report) | ⚠️ VENDOR via news | https://financialsamachar.com/indian-smes-face-mounting-working-capital-stress-as-average-overdue-receivables-cross-%E2%82%B93-83-crore-recordent-report/ | not fetched |
| L8 | Involuntary churn / failed-payment recovery benchmarks | ⚠️ VENDOR (Slicker, RetentionLens) | https://www.slickerhq.com/resources/blog/2025-failed-payment-recovery-benchmarks-saas-median-47-percent · https://retentionlens.com/state-of-involuntary-churn | not fetched |
| L9 | Section 43B(h) MSME Payment Rule explainers | Indian tax-practice sites / secondary to statute | https://busy.in/tds/section-43bh-msme-payment-rule-and-45-day-limit-explained/ | not fetched — **statute itself is the real source: Income Tax Act s.43B(h) + MSMED Act s.15** |

## Verification TODO
1. **Retry samadhaan.msme.gov.in** — free, official, live counters for §2.2.
2. Find the **GAME/FISME Delayed Payments Report 3.0 PDF** for the 6.4m MSMEs and 3x micro-enterprise multiple.
3. Chase the **SIDBI-RBI MSME survey 2025** — would upgrade §2.4 from vendor to regulator.
4. Trace or drop the **"EY 1–5% leakage"** claim.
