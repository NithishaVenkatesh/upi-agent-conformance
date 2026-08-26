# Finance Operations: Reconciliation, Settlement, Cash Forecasting, GST — Evidence Pack

**Compiled:** 2026-08-26 · **All retrieval dates: 2026-08-26** · **Geography: India-first**

**Labelling:** `[FACT]` fetched & read · `[FACT — SECONDARY]` · `[UNVERIFIED FETCH]` search synthesis, page not openable — **lead, not citation** · `[INFERENCE]` working shown · `[HYPOTHESIS]` · `⚠️ VENDOR` motivated.

> **Read this first.** This is the weakest-evidenced of the six problem areas, and you should know that before you build on it. Reconciliation pain is *universally asserted* and *almost never measured by a neutral party*. Close-cycle benchmarks come from close-automation vendors. Reconciliation-time percentages come from reconciliation-software vendors. There is no RBI or MCA publication that quantifies how long Indian finance teams spend matching a PG settlement file against a bank statement. **The structural India-specific facts in §3 (GST/ITC) are the solid ground here; the productivity percentages in §1 are not.**

---

## 1. The reconciliation and close burden

### 1.1 Days to close the books

| Claim | Figure | Status |
|---|---|---|
| Median days for a finance team to close its books monthly | **6.4 days** (attributed to APQC benchmarking, n≈2,300 organisations) | `[UNVERIFIED FETCH]` — APQC is a **neutral benchmarking body**, which makes this the best number in the section **if traced**. Chase the APQC primary. |
| Top-quartile close | ≤4.8 days | `[UNVERIFIED FETCH]` |
| Bottom-quartile close | ≥10 days | `[UNVERIFIED FETCH]` |
| Teams taking ≥6 business days to close | 50% | ⚠️ `[UNVERIFIED FETCH]` — Ledge 2025 survey; Ledge sells close automation |
| Teams closing in ≤3 days | 18% | ⚠️ `[UNVERIFIED FETCH]` — same vendor |
| Teams taking >7 business days regularly | 27% | ⚠️ `[UNVERIFIED FETCH]` — same vendor |

### 1.2 Share of close effort that is reconciliation

| Claim | Figure | Status |
|---|---|---|
| Manual reconciliation as share of close-cycle time | 30–40% | ⚠️ `[UNVERIFIED FETCH]` VENDOR |
| Alternative vendor estimate | 40–50% | ⚠️ `[UNVERIFIED FETCH]` VENDOR — **note the two vendor estimates disagree by 20 percentage points** |
| Hours per month on reconciliation | 20–50 | ⚠️ `[UNVERIFIED FETCH]` VENDOR |
| Number of distinct systems used to complete reconciliation | 3–5 | ⚠️ `[UNVERIFIED FETCH]` VENDOR |

> **`[INFERENCE]`** Combining a neutral close figure with a vendor reconciliation share is methodologically unsound (different populations, different definitions). **Do not compute "X days of reconciliation per month" and present it as a finding.** If you need a hook, the defensible one is the **"3–5 different systems"** shape of the problem — because it is structural rather than statistical, and it is exactly what makes reconciliation a matching problem rather than a data-entry problem.

`EVIDENCE NOT FOUND` — any India-specific measurement of finance-team reconciliation effort. Any measurement of error rates in manual reconciliation. Any cost-per-close figure for Indian companies.

---

## 2. Settlement and payout mismatch — the multi-source matching problem

**No quantified evidence was located for any claim in this section within the research budget.** What follows is the *structure* of the problem, which is documented by the mechanics of the instruments themselves rather than by a survey. Labelled `[HYPOTHESIS]` / `[INFERENCE]` accordingly and **presented without invented numbers**.

An Indian merchant selling across a website, a marketplace, and offline receives money through channels that each net out differently before it lands:

| Deduction / adjustment | Where it happens | Why it breaks line-level matching |
|---|---|---|
| **MDR / PG fees** | Deducted from gross before settlement | Settlement amount ≠ order amount; fee slabs differ by instrument (UPI vs card vs netbanking vs EMI) |
| **TDS u/s 194-O (1%)** | Deducted by the e-commerce operator on gross sales to the participant | Deduction sits with the marketplace, not the PG; appears in Form 26AS on a different cadence than the payout |
| **TCS under GST** | Collected by the marketplace operator | Reflected in GSTR-8 / the electronic cash ledger, not the bank statement |
| **Refunds** | Netted against future settlements | A refund from cycle N reduces the payout in cycle N+2; the two are not adjacent in any file |
| **Chargebacks & reversals** | Netted or debited separately | Same timing dislocation, plus provisional debits later reversed |
| **Settlement holds / rolling reserve** | Withheld by the PG | Money is neither in the bank nor in receivables — invisible to both sides of the recon |

> **`[INFERENCE]` — this is the actual technical problem, and it is a good one.** A merchant's ERP has *orders*. The bank statement has *net credits*. The PG settlement report has *transactions with fees*. The marketplace payout report has *sales minus commission minus TDS minus TCS minus returns*. **No two of these four share a primary key, a granularity, or a timestamp convention.** Reconciliation is therefore a fuzzy many-to-many matching problem over records that were never designed to be joined — which is precisely the class of problem where a model outperforms a deterministic rule engine, and precisely why every merchant does it in Excel.
>
> **`[HYPOTHESIS]`** This is likely the single most *demonstrable* problem in the whole pack for a hackathon, because the artefacts (settlement report, bank statement, order export) are all reproducible in test mode with no real data. See the data-availability column in `market_problems.md`.

`EVIDENCE NOT FOUND` — % of settlements that mismatch; average time to resolve a mismatch; value of unidentified receipts sitting in Indian merchants' suspense accounts.

---

## 3. GST and Input Tax Credit matching — the solid India-specific ground

### 3.1 The mechanism (structural, not statistical)

`[FACT — SECONDARY]`, consistent across multiple Indian tax-practice sources:

- **ITC mismatch** = the gap between Input Tax Credit a business claims in **GSTR-3B** and the ITC actually available in **GSTR-2B**, which is auto-populated from *suppliers'* **GSTR-1** filings.
- The taxpayer's credit therefore **depends on someone else's filing behaviour**, not their own.
- Where GSTR-3B ITC exceeds GSTR-2B beyond the system tolerance, **the GST portal auto-generates Form DRC-01C** — a system-generated notice, issued algorithmically, typically within days.
- Most mismatches are **timing, not evasion**: if a supplier files GSTR-1 after the 11th, or files under the QRMP scheme after the 13th, the ITC shifts into the *next* month's GSTR-2B.
- **Rule 36(4)** is the provision historically capping provisional ITC against unmatched invoices.
- **e-invoicing (IRN)** adds a further reconciliation surface for businesses above the turnover threshold.

> **Why this is a genuinely good AI problem, and specific to India.** The taxpayer must reconcile, every month, thousands of purchase invoices against a government-generated statement they do not control, where the failure mode is not fraud but *counterparty timing*, and where the penalty is an automated notice plus blocked working capital. It is high-volume, document-centric, deadline-driven, and the correct answer is usually "this is the same invoice, the supplier just filed late" — a judgement call over near-duplicate records. `[INFERENCE]`

### 3.2 The magnitude

`EVIDENCE NOT FOUND` for all of the following, and I want to be explicit that I looked:
- Aggregate value of ITC blocked or denied in India due to mismatch.
- Number of DRC-01C notices issued (GSTN/CBIC do not appear to publish this).
- Number of GST notices issued to businesses over reconciliation errors.
- Cost of GST compliance per Indian business.

The only figure encountered was a **vendor's worked illustration** (a hypothetical business with ₹1.5 cr monthly purchases, 18% GST, ₹27 lakh monthly ITC, 10% mismatch → ₹32.4 lakh annual cash impact). ⚠️ **This is an example, not a measurement. It is not evidence of anything and must not be quoted as a statistic.**

### 3.3 Market sizing
`EVIDENCE NOT FOUND` — number of GST-registered businesses in India, Udyam registration count, and Razorpay's stated merchant count could not be retrieved (WebSearch budget exhausted). **All three are easy, public, and should be filled in before the pitch:** GSTN publishes registration counts; udyamregistration.gov.in publishes a live counter; Razorpay states its merchant count on its own About/press pages.

---

## 4. Cash forecasting

### 4.1 ⚠️ The "82% of small businesses fail due to cash flow" statistic — DO NOT USE

`UNVERIFIED — DO NOT USE IN PITCH`

I specifically tried to trace this one because it is ubiquitous. Findings:
- It is attributed to **"a U.S. Bank study by Jessie Hagan."**
- It is repeated by the U.S. Chamber of Commerce, SCORE, SBA-affiliated content, and hundreds of vendors.
- **No accessible copy of the original study, its methodology, sample, or publication date could be located.** Several sources that repeat it also concede the framing has been "oversimplified" — the original claim was that cash-flow mismanagement was a *contributing factor*, not the sole cause, in the failures studied.

> **Verdict: this is a laundered statistic.** It has a plausible origin story and no retrievable primary. A judge who knows the payments/SMB space may well know this — citing it is a downside risk with no upside. **Use the MSME receivables data in `revenue_leakage_problems.md` §2 instead**, which is sourced, dated, and India-specific.

### 4.2 Forecasting accuracy
`EVIDENCE NOT FOUND` — no credible benchmark for treasury/cash-forecast variance located, for India or globally.

---

## 5. Revenue leakage
See `revenue_leakage_problems.md` §3. Short version: the "1–5% of revenue/EBITA" figure attributed to EY could not be traced to any specific EY publication and is marked **UNVERIFIED — DO NOT USE**.

---

## 6. Honest assessment for track selection

**Track 4 (AI Finance Controller)** has the **best problem shape and the worst statistics** of any track in this pack.

| | |
|---|---|
| **Strength** | The multi-source matching problem (§2) and GST/ITC mismatch (§3.1) are structurally real, India-specific, mechanically well-understood, and genuinely hard. They do not need a statistic to be believable to anyone who has done the job. |
| **Weakness** | There is **no defensible headline number**. Every "finance teams waste X% of time on reconciliation" figure is vendor-published, and the two leading vendor estimates disagree by 20 points. |
| **Implication for the pitch** | **Do not lead with a productivity statistic.** Lead with the *artefact*: show four real files that describe the same money and cannot be joined. That demonstration is stronger than any number you could cite, and it is fully reproducible in Razorpay test mode. |

---

## Sources

| # | Title | Publisher / type | URL | Status |
|---|---|---|---|---|
| F1 | 50% of finance teams still take over a week to close the books | CFO.com / news, reporting Ledge survey | https://www.cfo.com/news/50-of-finance-take-week-to-close-books-ledge-month-end-close-time-cfo-three-day-close-myth-/746085/ | not fetched |
| F2 | The state of month-end close in 2025: finance team benchmarks | ⚠️ VENDOR (Ledge) | https://www.ledge.co/content/month-end-close-benchmarks-for-2025 | not fetched |
| F3 | APQC close-cycle benchmarks (6.4-day median) | APQC / **neutral benchmarking body** | — **primary URL not located; CHASE THIS** | not fetched |
| F4 | ITC Mismatch in GSTR-2B vs GSTR-3B | ClearTax / Indian tax-practice, secondary to GST law | https://cleartax.in/s/itc-mismatch-gstr-2b-vs-gstr-3b | not fetched |
| F5 | GSTR-2B Reconciliation: How to Fix GST Mismatches | Tally Solutions / ⚠️ VENDOR but authoritative on GST mechanics | https://tallysolutions.com/gst/gstr-2b-reconciliation-mismatches-how-to-fix/ | not fetched |
| F6 | Reconciliation Errors That Trigger GST Notices India | TransactIG / vendor | https://www.terra-insight.com/insights/reconciliation-errors-gst-notices-india/ | not fetched |
| F7 | "82% of small businesses fail from cash flow" — origin discussion | multiple ⚠️ VENDOR | https://www.smbcompass.com/small-businesses-fail-cash-flow-data/ | not fetched — **see §4.1, DO NOT USE** |
| F8 | Revenue leakage 1–5% of EBITA (attributed to EY) | multiple ⚠️ VENDOR, EY primary not located | — | **UNTRACEABLE** |

## Verification TODO
1. **APQC primary** for the 6.4-day close median — the only potentially neutral productivity number in this file.
2. **GSTN / CBIC** for any published DRC-01C or ITC-mismatch volume.
3. **GSTN registration count, Udyam counter, Razorpay merchant count** — three easy public numbers, currently missing.
