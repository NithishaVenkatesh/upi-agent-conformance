# Risk: Fraud, Chargebacks, Disputes, Returns — Evidence Pack

**Compiled:** 2026-08-26 · **All retrieval dates: 2026-08-26** · **Geography: India-first, global where India data does not exist**

**Labelling convention:**
- `[FACT]` — directly stated in a source I fetched and read.
- `[FACT — SECONDARY]` — a news/analyst report of a primary (RBI/NPCI/Parliament) fact; primary was inaccessible.
- `[UNVERIFIED FETCH]` — the figure came from a search-engine synthesis whose underlying page I could **not** open (403/anti-bot). **Treat as a lead, not a citation. Verify before it goes in a slide.**
- `[INFERENCE]` — my arithmetic from sourced facts; working always shown.
- `[HYPOTHESIS]` — plausible reading, not established.
- `⚠️ VENDOR` — source sells a solution to the problem it is quantifying. Motivated. The chargeback-statistics industry is almost entirely this.

**Tooling constraints hit during this research (disclosed for reproducibility):**
- `npci.org.in` returns HTTP 403 to all programmatic fetches.
- `reddit.com`, `trustpilot.com`, `yourstory.com`, `pwc.in` returned 403 / anti-bot to every route tried (WebFetch, Firecrawl basic + stealth proxy, direct curl, Reddit JSON API).
- The session's WebSearch budget (200 calls) was exhausted mid-research.
- Consequence: several India fraud figures below are marked `[UNVERIFIED FETCH]`. **They are leads.** Do not put them on a slide without opening the source.

---

## 1. RBI fraud data — the primary India number

**Source: RBI, *Report on Trend and Progress of Banking in India 2024-25*.** Reported via MediaNama, 30 Dec 2025, which links the RBI PDF directly. `[FACT — SECONDARY]`

| Metric | FY2024-25 | FY2023-24 | Change |
|---|---|---|---|
| Fraud cases reported by banks | **11,615** | 35,530 | −67.3% |
| Amount involved | **₹3,497 crore** | ₹5,856 crore | −40.3% |

**Composition of FY25 frauds — this is the important part:**

| Category | Cases | % of cases | Amount | % of amount |
|---|---|---|---|---|
| **Card & internet** | **7,756** | **66.8%** | **₹252 cr** | **7.2%** |
| Advances | 2,214 | 19.1% | ₹1,159 cr | 33.2% |
| Deposit | 701 | 6.0% | ₹325 cr | 9.3% |
| Others (misc/operational) | 608 | 5.2% | ₹1,587 cr | 45.4% |

> "Card and internet frauds formed the largest share by volume, accounting for 66.8% of total cases, with 7,756 incidents, but represented only 7.2% of the total amount, at Rs 252 crore."

**H1 FY2025-26 (Apr–Sep 2025), date-of-occurrence basis:** 509 fraud cases, ₹111 crore. Card & internet: 128 cases, ₹4 crore. `[FACT — SECONDARY]`

### 1.1 Three caveats the RBI itself attaches — read these before quoting the numbers

These matter, because the headline "fraud fell 67%" is not what it looks like:

1. **"Amounts involved, not actual losses."** RBI explicitly cautions the fraud tables report amount involved, which "may change over time depending on recoveries and supervisory review." `[FACT — SECONDARY]`
2. **Reporting year ≠ occurrence year.** "Frauds reported in a given year may relate to transactions that occurred several years earlier and may subsequently be revised, reclassified, or withdrawn." `[FACT — SECONDARY]`
3. **A Supreme Court judgement mechanically deflated the series.** Following the March 2023 SC direction that borrowers must be heard before an account is classified fraudulent, **banks withdrew 942 fraud cases involving ₹1,28,031 crore** as of 30 Sep 2025. Separately, 122 cases worth ₹18,336 crore from earlier years were re-reported afresh during FY25. `[FACT — SECONDARY]`

> **`[INFERENCE]`** The FY25 decline in *case count* is therefore partly a reclassification artefact, not purely a security improvement. **Do not pitch "fraud is falling in India."** The defensible framing is the *composition* one: **two-thirds of all bank-reported fraud cases in India are now card-and-internet fraud, at an average amount involved of ₹252 cr ÷ 7,756 = ₹3.25 lakh per case** — high-frequency, low-value, retail-and-small-merchant fraud. That is precisely the shape of problem that rules-based systems handle badly and ML handles well.

### 1.2 RBI is itself building AI fraud infrastructure — strong "why AI now" evidence

`[FACT — SECONDARY]`, same source:
- **MuleHunter.ai** — RBI-developed system to help banks identify and flag mule accounts. **23 banks had implemented it as of 17 December 2025.**
- **Digital Payments Intelligence Platform (DPIP)** — under development, "aims to leverage artificial intelligence to flag risky transactions and enable intelligence-sharing for fraud detection and prevention across the ecosystem."
- RBI is **reviewing its 2017 instructions on limiting customer liability** in unauthorised electronic banking transactions, citing "changes in payment channels, increased digital transaction volumes, and evolving fraud patterns."

> **Why this matters for a pitch:** the regulator has publicly conceded that AI is the right tool for this class of problem and is deploying it itself. An AI risk product is not a speculative bet in India in 2026; it is aligned with stated RBI direction.

---

## 2. Digital payment fraud & UPI fraud — Parliament data

⚠️ **Everything in this section is `[UNVERIFIED FETCH]`.** These came from search-result synthesis; `yourstory.com` and the aggregator sites returned 403 to every fetch attempt. The underlying primary is Lok Sabha / Rajya Sabha starred-question answers from the Ministry of Finance (MoS Pankaj Chaudhary), which are published on **sansad.in** and **pib.gov.in**. **Verify there before use.**

| Claim | Figure | Status |
|---|---|---|
| Digital payment fraud incidents, FY2021-22 → FY2025-26 (5 years) | 5,85,751 incidents, ₹3,590.70 crore | `[UNVERIFIED FETCH]` |
| UPI fraud, FY2023-24 | 13.42 lakh incidents, ₹1,087 crore | `[UNVERIFIED FETCH]` |
| UPI fraud, FY2022-23 | ₹573 crore | `[UNVERIFIED FETCH]` |
| UPI fraud, first 8 months of FY2025-26 | 10.64 lakh incidents, ₹805 crore | `[UNVERIFIED FETCH]` |
| Internet banking fraud (highest by amount, 5-yr) | ₹1,730.14 crore | `[UNVERIFIED FETCH]` |
| Credit card fraud (5-yr) | ₹1,447.27 crore | `[UNVERIFIED FETCH]` |
| **Fraud chargebacks successfully recovered (Apr–Sep 2025)** | **~6%** | `[UNVERIFIED FETCH]` |
| Fraud cases acted on within 7 days / 30 days (Apr–Sep 2025) | 22% / 92% | `[UNVERIFIED FETCH]` |

> **The single most pitch-relevant number here is the ~6% recovery rate**, if it verifies. It says post-facto remediation is essentially broken and the entire value has to be captured *before* the money moves. That is the argument for real-time risk scoring over after-the-fact dispute handling. **Verify it first.**

**Note on double-counting:** the RBI series (§1) and the Parliament series (§2) are **not the same universe** and must never be added together. RBI counts frauds *reported by banks under RBI's fraud-classification framework*. The Parliament series counts *incidents reported through payment-system/cybercrime reporting channels*. The Parliament incident counts are ~100x the RBI case counts for this reason. `[INFERENCE]`

---

## 3. Chargebacks and disputes

### 3.1 Visa Acquirer Monitoring Program (VAMP) — PRIMARY, verbatim

**Source: Visa, "Visa Acquirer Monitoring Program Overview" fact sheet, 2025 (PDF, corporate.visa.com), doc created 14 May 2025.** This is a card-network primary document, extracted verbatim. `[FACT]`

**The formula:**
> "VAMP Ratio = Count of [Fraud (TC40) + Disputes (TC15)] ÷ Count of Settled Transactions (TC05)"

Applies to **card-not-present VisaNet transactions** (domestic and cross-border). Consolidates the old VAMP, Visa Fraud Monitoring Program and Visa Dispute Monitoring Program into one global program. **Thresholds effective 1 June 2025**; advisory period ended 30 September 2025.

**Acquirer thresholds:**
> "An acquirer's portfolio is identified as Above Standard if its VAMP ratio is ≥50bps and as Excessive if ≥70bps"

**Excessive Merchant thresholds** (apply if the acquirer is not itself Above Standard/Excessive):

| Region | VAMP Ratio | Min monthly count of fraud + disputes |
|---|---|---|
| AP, Canada, EU, U.S. | **≥220bps** → **reduced to ≥150bps on 1 April 2026** | ≥1,500 |
| LAC | ≥150bps | ≥1,500 |
| CEMEA | ≥220bps | ≥150 **and** amount ≥ USD 75,000 |

**Enumeration (card-testing) thresholds:**
> "VAMP Enumeration Ratio, defined as [Count of Enumerated Authorization Transactions (Approved + Declined)] ÷ [Count of Authorization Transactions (Approved+ Declined)], ≥ 2000 bps"
> "VAMP Enumeration Transaction Count, defined as Enumerated Transactions (Approved + Declined), ≥ 300,000"

**Compelling Evidence 3.0 is a ratio-exclusion lever:**
> "Excludes TC 40 fraud qualified for Compelling Evidence 3.0, contingent on the timing of the data extract."
> "Excludes disputes resolved through pre-dispute solutions, contingent on the timing of the data extract."

**⭐ India-specific, straight from the footnote:**
> "1 Programs for Brazil, Chile, and India will be announced later."

> **`[INFERENCE]` — why this is a genuine opening.** Visa has published a hard, count-based, monthly ratio that determines whether an Indian merchant's acquirer gets penalised — **but the India program parameters were still unannounced as of the 2025 fact sheet.** Two consequences: (a) Indian merchants have a compliance regime arriving on a known trajectory with unknown local thresholds, and (b) because CE3.0 qualification and pre-dispute resolution *remove* items from the numerator, the highest-leverage intervention is **automatically assembling qualifying evidence at the moment of dispute**, not fighting representments later. That is a well-shaped AI task: gather order, device, AVS, delivery, prior-transaction-history artefacts and decide whether they meet CE3.0's matching criteria.

### 3.2 Chargeback cost and friendly-fraud statistics — ⚠️ ALL VENDOR, ALL UNVERIFIED

I could not open a single one of these sources. **Every number below is published by a company that sells chargeback services.** There is no neutral corroboration. `[UNVERIFIED FETCH]` `⚠️ VENDOR`

| Claim | Figure | Publisher type |
|---|---|---|
| Processor chargeback fee per dispute | $20–$50 | ⚠️ vendor |
| All-in merchant cost per chargeback | ~$110 | ⚠️ vendor |
| Cost multiplier per $1 of chargeback | $5.13 (attributed to LexisNexis *True Cost of Fraud* 2026) | ⚠️ vendor (LexisNexis Risk Solutions sells fraud tooling) |
| Friendly fraud share of ecommerce disputes | 61% (2025) / ~75% (other vendor) | ⚠️ vendor — **the two figures disagree; that is itself a signal about the data quality** |
| First-party fraud share of all reported fraud | 36% globally | ⚠️ vendor |
| Fraudulent chargebacks as share of merchant chargeback volume | ~45% globally | ⚠️ vendor |

> **Recommendation: do not build a pitch on these.** If you need a dispute-cost number, use the Visa primary (§3.1) for the *mechanism* and the *consequence of breaching a threshold*, which is documented and neutral, rather than a vendor's dollar figure. If you must cite a dollar figure, attribute it explicitly on the slide as "vendor-published, uncorroborated."

### 3.3 India dispute mechanics
`EVIDENCE NOT FOUND` — NPCI's URCS (UPI dispute resolution) timelines, RBI chargeback rules for cards in India, and India card dispute TAT could not be retrieved (npci.org.in 403, search budget exhausted). **This is a real gap and a real opportunity: the India dispute rulebook is genuinely hard to find, which is itself evidence merchants don't know it either.** `[HYPOTHESIS]`

---

## 4. Returns and return fraud

### 4.1 NRF 2025 Retail Returns Landscape — PRIMARY, verbatim (US)

**Source: National Retail Federation, "Consumers Expected to Return Nearly $850 Billion in Merchandise in 2025", nrf.com press release.** NRF is the retail industry body, not a vendor. `[FACT]`

> "Retailers estimate that 15.8% of their annual sales will be returned this year, totaling $849.9 billion"
> "An estimated 19.3% of online sales will be returned in 2025."
> "The report found that 9% of all returns are fraudulent."
> "85% said they are employing AI to detect or prevent return fraud."

**Fraud tactics increasing** (share of retailers that track them reporting an increase):
> "overstated quantity of returns (71%), empty box or 'box of rocks' (65%) and decoy returns such as counterfeit items (64%)."

**Consumer behaviour:**
> "Close to two-thirds of consumers admit to participating in at least one costly returns behavior" (incl. wardrobing and bracketing)
> "Just under half (45%) believe 'bending the truth' is acceptable when making returns."

**`[INFERENCE]`** 9% of $849.9bn = **≈$76.5bn of fraudulent returns in the US in 2025**. *Working: 0.09 × 849.9 = 76.49.* Caveat: NRF's 9% is "% of all returns" by the retailer survey; applying it to the dollar total assumes fraudulent returns have the same average value as honest ones. They may not. Label this as a derived estimate, not an NRF figure.

> **`[FACT]` The 85% number is the strongest single "why AI now" datapoint in this whole pack.** 85% of retailers already say they use AI for return fraud. The market has already decided this is an AI problem. The competitive question is quality, not category creation.

### 4.2 India return rates

| Claim | Figure | Status |
|---|---|---|
| Redseer: fashion return rate | 15–20% | `[UNVERIFIED FETCH]` — Redseer is a credible analyst house; **worth verifying, best India lead here** |
| Redseer: electronics return rate | 12–14% | `[UNVERIFIED FETCH]` |
| India ecommerce return rate 2022 | 14.90% | `[UNVERIFIED FETCH]` (restofworld.org stat-of-the-day) |
| "Apparel returns 25–40% in India" | 25–40% | ⚠️ **WEAK — vendor/SEO blogs only, no methodology, figures vary wildly between sources. Do not use.** |

`EVIDENCE NOT FOUND` — any India return-fraud rate, any India cost-per-return, any Myntra/Nykaa/Ajio disclosed return figure.

### 4.3 RTO (Return to Origin) — India's distinctive returns problem
Covered in `merchant_problems.md`. **Short version: every RTO rate figure available for India is published by a logistics or COD-optimisation vendor selling RTO reduction. Treat accordingly.**

---

## 5. Promo abuse, account takeover, abuse rings
`EVIDENCE NOT FOUND` — no credible quantified data located for India within the research budget. Do not assert a number.

**What *is* evidenced and adjacent:** RBI's MuleHunter.ai exists specifically because **mule account networks** are a recognised systemic problem the regulator felt it had to build a detection model for (§1.2). That is the abuse-ring problem in its Indian form, and it is regulator-acknowledged. `[FACT — SECONDARY]` → `[INFERENCE]` that coordinated multi-account abuse is a live, officially-recognised India problem even without a published rate.

---

## Sources

| # | Title | Publisher / type | URL | Retrieved |
|---|---|---|---|---|
| R1 | Cards & Internet Fraud Made Up 66% Of Cases In FY25 Amid Decline in Banking Fraud: RBI Data (30 Dec 2025) — reports RBI *Report on Trend and Progress of Banking in India 2024-25* | MediaNama / news, secondary to RBI primary | https://www.medianama.com/2025/12/223-cards-internet-fraud-66-in-fy25-decline-banking-rbi/ | 2026-08-26 |
| R2 | RBI *Report on Trend and Progress in Banking in India* (PDF, as linked by R1) | RBI / regulator — PRIMARY | https://www.medianama.com/wp-content/uploads/2025/12/0RTP291220258C89B9E5F3F240AEB82AC25A1707A8C6.pdf | 2026-08-26 (link noted, not independently opened) |
| R3 | Visa Acquirer Monitoring Program Overview fact sheet 2025 (PDF) | Visa / card network — PRIMARY | https://corporate.visa.com/content/dam/VCOM/corporate/visa-perspectives/security-and-trust/documents/visa-acquirer-monitoring-program-fact-sheet-2025.pdf | 2026-08-26 |
| R4 | Consumers Expected to Return Nearly $850 Billion in Merchandise in 2025 | NRF / industry body — PRIMARY | https://nrf.com/media-center/press-releases/consumers-expected-to-return-nearly-850-billion-in-merchandise-in-2025 | 2026-08-26 |
| R5 | 2025 Retail Returns Landscape | NRF / industry body | https://nrf.com/research/2025-retail-returns-landscape | 2026-08-26 (referenced) |
| R6 | UPI frauds peak in FY24, show signs of decline (Parliament data) | YourStory / news | https://yourstory.com/2025/12/upi-frauds-peak-in-fy24-show-signs-of-decline-parliament-data | **403 — NOT FETCHED** |
| R7 | Combating payments fraud in India's digital payments landscape (Apr 2025) | PwC India / consultancy | https://www.pwc.in/ghost-templates/combating-payments-fraud-in-Indias-digital-payments-landscape.html | **403 — NOT FETCHED** |
| R8 | Digital Payment Frauds Cross 5.83 Lakh Cases, ₹3,588 Crore Involved: Government | HelloBanker / news aggregator — low quality | https://hellobanker.in/digital-payment-frauds-cross-5-83-lakh-cases-%E2%82%B93588-crore-involved-government/ | **NOT FETCHED** |
| R9 | India ecommerce fashion return rate (14.90%, 2022) | Rest of World / news | https://restofworld.org/stat-of-the-day/india-ecommerce-fashion/ | **NOT FETCHED** |
| R10 | Chargeback statistics compilations (multiple) | Chargeflow, Chargebacks911, ClearSale, Chargeback.io — ⚠️ ALL VENDOR | see §3.2 | **NOT FETCHED** |

## Verification TODO before any of this reaches a slide
1. Open **sansad.in / pib.gov.in** for the Finance Ministry UPI-fraud answers. Everything in §2 depends on it, especially the **~6% chargeback recovery** figure.
2. Open the **RBI Trend & Progress PDF** (R2) directly from rbi.org.in to confirm §1 first-hand.
3. Find the **Redseer** India returns primary for §4.2.
4. Confirm whether Visa has since **announced the India VAMP program** (footnote 1 of R3 says it was pending).
