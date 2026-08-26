# India Merchant Operational Pain: COD, RTO, Settlement — Evidence Pack

**Compiled:** 2026-08-26 · **All retrieval dates: 2026-08-26** · **Geography: India**

**Labelling:** `[FACT]` fetched & read · `[FACT — SECONDARY]` · `[UNVERIFIED FETCH]` search synthesis, page not openable — **lead, not citation** · `[INFERENCE]` working shown · `[HYPOTHESIS]` · `⚠️ VENDOR` motivated source · `ANECDOTE` single merchant account, evidence of *existence* not of *rate*.

> ## ⚠️ Read this before using anything in §1
>
> **Every single RTO and COD rate figure available for India is published by a company that sells RTO-reduction or COD-optimisation software.** Shiprocket, Shipway, Shipmozo, GoKwik, Clickpost, Qikink, Twinr, Egrow — all vendors, all selling the fix, none publishing methodology, sample size, or time period. The figures they publish **disagree with each other by more than 2x** (RTO "20–25%", "25–35%", "26%", "up to 40%").
>
> This does not mean RTO isn't a real and expensive problem — it plainly is, and it is genuinely India-specific. It means **there is no citable number for it**, and a judge who works in Indian e-commerce will know that. Pitch the *mechanism*, and if you must give a range, attribute it on the slide as "logistics-vendor estimates, range 20–35%, no published methodology."
>
> `EVIDENCE NOT FOUND`: any neutral, regulator, industry-body, or listed-company disclosure of an Indian RTO rate. **Delhivery and Ecom Express annual reports / DRHPs were not retrieved and are the single best place to look for a non-vendor figure** — they are SEBI-filed and legally accountable. See Verification TODO.

---

## 1. COD and RTO economics

### 1.1 The best-evidenced India datapoint in this file

**Source: Unicommerce festive-season report, 2025 Diwali period.** Reported via MediaBrief. `[FACT — SECONDARY]` ⚠️ Unicommerce is an e-commerce SaaS vendor, **but** this is derived from its own platform telemetry with a disclosed base, which makes it materially better than a blog estimate.

Base: **over 150 million transactions** processed through Unicommerce's Uniware platform across the 25-day festive periods of 2024 and 2025.

| Metric (2025 festive season, YoY) | Figure |
|---|---|
| Prepaid order growth | **+26%** |
| COD order growth (volume) | **+22%** |
| COD growth (GMV) | **+35%** |
| Tier II + Tier III share of total orders | **~55%** |
| Tier II order growth | +28% |
| Tier I + metro order growth | +24% |
| Tier III order growth | +23% |

> **`[INFERENCE]` Two things worth noticing, and the second is the important one.**
> 1. COD GMV grew (+35%) considerably faster than COD volume (+22%). *Working: implies average COD order value rose ~10.7%, since 1.35/1.22 = 1.107.* **Indian shoppers are putting higher-value goods on COD**, which raises the rupee exposure per RTO event.
> 2. **55% of orders now come from Tier II/III cities** — the geography that every vendor source independently identifies as having the worst address quality and the highest RTO rates. The COD/RTO exposure is growing in exactly the segment where it is most expensive to serve.
>
> This pair — rising COD ticket size, majority of volume in the hardest-to-deliver geography — is a defensible argument that RTO cost is *increasing*, built from a disclosed-base dataset rather than a vendor's marketing claim.

### 1.2 RTO and COD rates — vendor estimates only

| Claim | Figure | Status |
|---|---|---|
| India average RTO rate | 20–25%, or 25–35% depending on source; "up to 40%" in fashion/footwear | ⚠️ `[UNVERIFIED FETCH]` VENDOR — **sources disagree; do not state a single number** |
| Global benchmark RTO rate (for contrast) | 8–12% | ⚠️ `[UNVERIFIED FETCH]` VENDOR |
| RTO rate on COD orders | 20–30%, or "nearly 26%" | ⚠️ `[UNVERIFIED FETCH]` VENDOR |
| RTO rate on prepaid orders | 10–15%, or "less than 2%" | ⚠️ `[UNVERIFIED FETCH]` VENDOR — **note these two vendor figures differ by 7x. This range is not usable.** |
| COD share of Indian e-commerce orders | ~65% | ⚠️ `[UNVERIFIED FETCH]` VENDOR blog, no methodology |
| Claimed RTO reduction from vendor tooling | "up to 45%" | ⚠️ VENDOR marketing claim — **not evidence of anything** |

`EVIDENCE NOT FOUND` — cost per RTO in rupees (forward leg + reverse leg + packaging + inventory blocking + working-capital cost); total ₹ value of RTO losses to Indian e-commerce annually; any quantification of serial-RTO-offender behaviour or fake-order rates.

### 1.3 The mechanism — which *is* solid, and doesn't need a statistic

`[INFERENCE]`, derived from the structure of the instrument rather than from a survey:

COD inverts the risk model of e-commerce. In a prepaid order the merchant holds the money and the risk is *fulfilment*. In a COD order:
- The merchant **ships inventory against zero commitment from the buyer.** There is no financial cost to abandoning at the door.
- The merchant pays the **forward shipping leg regardless**, and on refusal pays the **reverse leg too** — two shipping costs and zero revenue.
- The goods return **weeks later**, having been out of sellable inventory during the highest-demand window.
- **Nothing in the transaction verifies the address, the phone number, or the buyer's intent** before the merchant incurs cost.

> This is a **pre-shipment risk-scoring problem with a clean label** — every historical order has a known outcome (delivered / RTO). It is one of the most naturally supervised-learning-shaped problems in the entire pack.

### 1.4 Worldpay / Global Payments Report — the neutral source that would settle §1.2
`[FACT — SECONDARY]` The Worldpay (now Global Payments) *Global Payments Report* publishes India e-commerce payment-method shares. The 2025 edition reports **digital wallets at 68% of Indian e-commerce spend and 61% of POS spend**. `[UNVERIFIED FETCH]`

The report's India chapter contains a COD share figure, but **it was not retrieved.** The PDF is public: https://offers.worldpayglobal.com/rs/850-JOA-856/images/GPR25.pdf — **fetch it; it is the neutral COD number this file is missing.**

---

## 2. Settlement and working capital

`EVIDENCE NOT FOUND` for every quantitative claim in this section. I could not source: standard settlement cycles by aggregator, rolling-reserve percentages, incidence of settlement holds, or the working-capital impact on small Indian merchants.

**What is structurally documented** (see `finance_ops_problems.md` §2): money reaches an Indian merchant net of MDR, TDS u/s 194-O, GST TCS, refunds from prior cycles, chargeback adjustments and any withheld reserve — with no shared key or timestamp convention between the PG settlement report, the bank credit, and the ERP order record. `[INFERENCE]`

**RBI's Turn Around Time framework is the one hard, primary anchor available on the consumer side** (documented fully in `payment_problems.md`): RBI/2019-20/67, DPSS.CO.PD No.629/02.01.014/2019-20, 20 Sep 2019 — **₹100 per day** compensation for delayed reversal of failed transactions, payable **suo moto**, without waiting for a complaint. `[FACT]` That establishes the regulator's position that *delay in returning money is itself a compensable harm* — a useful precedent to cite, though it governs failed-transaction reversals rather than merchant settlement.

---

## 3. Onboarding, KYC friction and account holds

`EVIDENCE NOT FOUND` — no quantified data located on merchant onboarding times, KYC rejection rates, account-freeze incidence, or deactivation rates for any Indian payment aggregator.

`[HYPOTHESIS]` This is one of the loudest categories of merchant complaint anecdotally, and it is *entirely* unmeasured in public sources. **The absence is itself notable** — RBI's Payment Aggregator framework licenses these entities, but no aggregate merchant-experience data is published.

---

## 4. "In Their Own Words" — ⚠️ SECTION BLOCKED, DELIBERATELY LEFT EMPTY

**`EVIDENCE NOT FOUND` — zero verbatim merchant quotes were obtained.**

This section was an explicit deliverable and I could not complete it. Rather than paraphrase, reconstruct, or "representatively" write quotes — which would be fabrication and is the one unrecoverable failure mode for a pitch — **it is empty.**

### What was tried and how it failed

| Route | Result |
|---|---|
| `WebSearch` with `site:reddit.com` | Anthropic's user agent is **blocked from reddit.com**; domain filter rejected outright |
| `WebFetch` on reddit.com URLs | 403 |
| Reddit public JSON API (`/search.json`) via curl with browser UA | Blocked, non-JSON response |
| `agent-reach` skill | `agent-reach doctor` reports reddit + twitter "ok", but **`rdt-cli` and `twitter-cli` are not on PATH**; `agent-reach` CLI has no `reddit`/`twitter` subcommands. Skill is misconfigured. |
| `opencli` (listed backend) | No reddit or twitter adapter installed |
| Firecrawl scrape (basic + stealth proxy) on reddit.com, trustpilot.com, g2.com | `document_antibot` on all |
| MouthShut | Fetched successfully but the guessed URL resolved to an unrelated product page |
| consumercomplaints.in | Guessed URL → 404 |
| Firecrawl search / local SearXNG | **Backend is broken** — returns unrelated cached results (cricket scores, GitHub repos) for every query. Cannot be used to find the correct URLs. |
| `WebSearch` (to find correct URLs) | **Session budget of 200 calls exhausted** |

**Root cause: no working search + anti-bot on every review platform = no way to locate a real complaint URL, and I will not cite a URL I have not opened.**

### Manual retrieval playbook — 15 minutes in a logged-in browser will fill this section

Search these directly and copy quotes verbatim with permalink + date:

1. **Reddit** — `site:reddit.com razorpay settlement delayed`, plus r/IndiaBusiness, r/StartUpIndia, r/developersIndia, r/IndianStreetBets, r/ecommerce, r/smallbusiness. Search terms that surface the sharpest complaints: `"funds on hold"`, `"settlement not received"`, `"account under review"`, `"reserve balance"`, `"reconciliation nightmare"`.
2. **X/Twitter** — search `@Razorpay settlement`, `@Cashfree settlement`, `@PayU_India refund` filtered to replies; merchant escalations happen publicly there.
3. **G2 / Capterra** — Razorpay, Cashfree, PayU, Instamojo; **filter to 1–2 star reviews and sort by most recent.**
4. **MouthShut** — search "Razorpay" from the site's own search box rather than guessing a product-ID URL (that is what failed here).
5. **Trustpilot** — trustpilot.com/review/razorpay.com.

**Discipline when collecting:** quote verbatim, keep to 1–2 sentences, record permalink + subreddit/platform + date, and label each `ANECDOTE`. A wall of ten real merchant sentences is worth more in a pitch than any statistic in this pack — but only if every one of them is real.

---

## 5. Assessment for track selection

| Sub-problem | Evidence quality | Verdict |
|---|---|---|
| **COD/RTO pre-shipment risk** | **Mechanism: strong. Rates: unusable.** Best supporting datapoint is Unicommerce's 150m-transaction festive base (§1.1). | **Excellent problem shape, poor citations.** Ideal ML framing (clean labels, pre-shipment decision point). Pitch the mechanism, not a rate. |
| **Settlement / working capital** | Weak — nothing quantified. | Supporting material only. |
| **Onboarding / holds** | None. | Do not pitch. |
| **Merchant voice** | **Zero, blocked.** | **Fixable in 15 minutes manually. Highest effort-to-value ratio remaining in this whole research effort.** |

Maps to **Track 2 (AI Risk Manager)** — RTO prediction is a returns/risk problem and the track explicitly requires precision/recall on a held-out test set, which an RTO classifier suits perfectly — and to **Track 3 (AI Revenue Recovery)** via COD-to-prepaid conversion.

---

## Sources

| # | Title | Publisher / type | URL | Status |
|---|---|---|---|---|
| M1 | Unicommerce reports 24% order volume growth during 2025 Diwali festive season | MediaBrief / news reporting ⚠️ vendor telemetry (150m txn base) | https://mediabrief.com/unicommerce-reports-24-order-volume-growth-during-2025-diwali-festive-season/ | not fetched — **`[UNVERIFIED FETCH]`, verify** |
| M2 | Global Payments Report 2025 (India chapter — COD share) | Worldpay / **industry, comparatively neutral** | https://offers.worldpayglobal.com/rs/850-JOA-856/images/GPR25.pdf | **not fetched — HIGHEST-VALUE MISSING SOURCE** |
| M3 | Global Payments Report 2025 landing page | Worldpay | https://www.worldpay.com/en/global-payments-report-2025 | not fetched |
| M4 | How RTO Protection Services Reduce E-Commerce Revenue Loss | Shiprocket / ⚠️ VENDOR | https://www.shiprocket.in/blog/rto-protection-for-sellers/ | not fetched |
| M5 | How to Reduce RTO in eCommerce: 2026 Guide for Indian Sellers | Shipmozo / ⚠️ VENDOR | https://www.shipmozo.com/blog/how-to-reduce-rto-in-ecommerce | not fetched |
| M6 | What Is RTO (Return to Origin)? How to Reduce It? (2026) | Qikink / ⚠️ VENDOR | https://qikink.com/blog/what-is-return-to-origin-how-it-affects-online-businesses/ | not fetched |
| M7 | Festive Season Sales Report 2024 | Unicommerce / ⚠️ VENDOR | https://unicommerce.com/blog/festive-season-sale-report-order-volume-surges-over-last-year/ | not fetched |
| M8 | RBI TAT harmonisation circular (₹100/day, suo moto) | RBI / **regulator PRIMARY** | https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11693&Mode=0 | fetched in `payment_problems.md` ✅ |
| M9 | Merchant complaint quotes | Reddit / X / G2 / Trustpilot / MouthShut | see §4 playbook | **ALL BLOCKED — NONE COLLECTED** |

## Verification TODO (ranked by value)
1. **Collect the merchant quotes manually (§4).** 15 minutes, highest value.
2. **Fetch the Worldpay GPR 2025 PDF (M2)** for a neutral India COD share — replaces the weakest vendor claim in §1.2.
3. **Delhivery / Ecom Express annual reports and DRHPs** (bseindia.com / nseindia.com / company IR pages) for a SEBI-filed, legally accountable RTO figure. This would be the only non-vendor RTO number in existence.
4. **Verify the Unicommerce festive figures (M1)** — currently the backbone of §1 and unfetched.
