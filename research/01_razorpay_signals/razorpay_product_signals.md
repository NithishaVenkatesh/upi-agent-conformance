# Razorpay Product Surface & Published Merchant Pain — Evidence File

**Retrieval date:** 2026-08-26
**Researcher note on method:** Firecrawl MCP was unavailable this session (`firecrawl_map` / `firecrawl_scrape` returned "Request failed"; `~/.superstack/web/bin/webup` reported "Docker not running"). All evidence below was collected via **WebFetch / WebSearch** plus **direct `curl` of razorpay.com sitemaps and raw HTML**. Sitemap inventory came from `https://razorpay.com/sitemap.xml` → `build/sitemap/razorpay.txt`, `framer_sitemap.xml`, `x_sitemap.xml`, `payroll_sitemap.xml`.

**Labelling convention used throughout:**
- **FACT** = directly stated on the cited Razorpay-owned page (still Razorpay's *own claim*, not independently audited).
- **INFERENCE** = my reasoning from the cited page.
- **HYPOTHESIS** = speculative, unverified.
- **EVIDENCE NOT FOUND** = I looked and could not verify.

> **Integrity warning:** every percentage in this document is a **marketing claim published by Razorpay** (often sourced from a single merchant testimonial or case study). None are independently audited figures. Treat them as directional positioning, not as established market fact.

---

## 0. Company-level scale claims

| Claim | Value | Source | Type |
|---|---|---|---|
| Businesses on Razorpay | "50,00,000+ businesses powering payments with Razorpay" (i.e. 5 million+) — footer stat on multiple product pages | https://razorpay.com/route/ , https://razorpay.com/subscriptions/ | FACT (site claim), retrieved 2026-08-26 |
| Businesses (alt figure) | "1.5 million+ businesses across India" | https://razorpay.com/omnichannel-payments/ | FACT (site claim) — **NOTE: conflicts with the 5M+ footer figure; Razorpay publishes both.** |
| TPV milestone (2024) | "$150 Billion" annualised TPV; "majority market share… India's Market Leader in the Digital Payments Processing category" | Press release, 2024-02-23, https://razorpay.com/newsroom/razorpay-surpasses-150-billion-tpv-milestone-unveils-payment-gateway-3-0-forays-into-marketing-stack-with-engage-and-introduces-the-fintech-world-to-ai-assistant-ray/ | FACT (press release claim) |
| TPV (current) | "annualized Total Payment Volume (TPV) of $180 billion"; "more than 300 million end consumers" | Surfaced via WebSearch over razorpay.com newsroom/blog, 2026-08-26 | FACT-with-caveat — **I could not open the single canonical page carrying this figure; treat as lower-confidence than the $150B press release.** |
| RazorpayX scale | "$10 Billion total payout volume processed in 2024"; "70% of India's Unicorns"; "1,000+ partners" | https://razorpay.com/x/ | FACT (site claim) |
| RazorpayX startup penetration | "90% of India's top tech startups are on RazorpayX" | https://razorpay.com/x/tax-payments/ | FACT (site claim) |
| Razorpay POS | "60% growth in Annualised Recurring Revenue" since acquisition; "40% growth in its TPV this financial year"; "~10% of Razorpay's overall revenue"; "expansion of touch-points by over 235,000 in FY2023"; "15,000+ pincodes" | https://razorpay.com/blog/redefining-in-store-payments/ | FACT (blog claim, FY23-era) |
| Magic Checkout network | "200Mn+ customers from across the Razorpay network" prefilled at checkout | https://razorpay.com/blog/razorpay-magicx-for-shopify-plus/ | FACT (blog claim) |

---

## 1. Accept-payments family (online)

### 1.1 Payment Gateway
**URL:** https://razorpay.com/payment-gateway/ · Source type: product page · Retrieved 2026-08-26

- **What it does (FACT):** "100+ payment methods, including Cards, UPI, NetBanking"; "Intelligent payment infrastructure that delivers high success rates"; PCI DSS Level 1; all-in-one dashboard for "payments, refunds, settlements, and analytics"; "Conversion-Optimized Checkout"; developer APIs + real-time webhooks.
- **Merchant pain claimed solved (FACT):** transaction failure / low success rate, integration complexity, multi-channel acceptance, settlement delay.
- **Numbers on this page:** "Zero platform fee for 90 days". **EVIDENCE NOT FOUND** — no uptime %, SR %, TPV or merchant count is published on the PG landing page itself.

### 1.2 Payment Gateway 3.0 (announced 2024-02-23)
**URL:** https://razorpay.com/newsroom/razorpay-surpasses-150-billion-tpv-milestone-unveils-payment-gateway-3-0-.../ · Source type: press release

- **FACT (claim):** PG 3.0 expected to deliver "more than 30% higher conversions".
- **FACT (features):** Razorpay Trusted Badge + Buyer Protection; Reserve Online & Pick Up In-Store widget; **Quickbuy Technology** ("1-step vs. traditional 6-step checkout"); on-the-fly coupon codes; prefilled addresses/auto-selected payment method; COD with RTO and fraud protection; **FraudShield** (chargeback reimbursement promise); **AI-Powered RTO Suite with loss protection guarantee**.
- **FACT (market framing):** online shoppers 10M (2015) → "250 million currently", projected 600M in 5–10 years; "only 10% of online shoppers cross the barrier of deciding what to buy"; "only 1/4th of these potential buyers make a purchase"; "80% of in-store payments happen via QR, however, only 2% is from organized retail".

### 1.3 Magic Checkout (one-click checkout, COD/RTO)
**URLs:** https://razorpay.com/magic/ · https://razorpay.com/docs/payments/magic-checkout/ · https://razorpay.com/blog/razorpay-magicx-for-shopify-plus/ · https://razorpay.com/blog/arxstudios-magic-checkout-case-study/ · Retrieved 2026-08-26

- **What it does (FACT, from /magic/ and docs):** AI-powered checkout that pre-fills identity/address from the Razorpay network; "Login with Razorpay" one-click checkout with "precision retargeting"; smart auto-selection of address + shipping with real-time delivery estimates; payment-method recommendation across 100+ methods ranked by shopper history; **biometric authentication replacing card OTP**; **Risk Detection Engine** identifying high-risk COD orders and nudging to prepay or charging a differential COD fee; **RTO Protection** (automated reimbursement for failed COD deliveries); Offer Engine analysing "10,000+ behavioural signals"; affordability widget; payments on WhatsApp for cart recovery; gift cards.
- **Docs-level mechanics (FACT):** "Prevent customers with past RTO behaviour from placing COD orders"; "Filter out COD orders with gibberish/incomplete addresses"; customers "securely save addresses and payment details for future use across Razorpay network sites".
- **Merchant pain claimed solved (FACT):** cart abandonment from checkout friction; RTO losses on COD; low repeat purchase; price sensitivity.
- **Published numbers (all Razorpay's own claims):**
  - Borosil testimonial: "7.3% Increase in order conversion rate", "5X Faster checkout process" — https://razorpay.com/magic/
  - Nappa Dori testimonial: "14% Increase in order conversion rate" — https://razorpay.com/magic/
  - Testimonial tile: "70% Prepaid order share increased", "36.36% Reduction in RTO rates" — https://razorpay.com/magic/ (the same 36.36% RTO figure is reused on /payment-links/ and /qr-code/)
  - ARXSTUDIOS case study: RTO "15-20%" → "5%" = "a 66-75% reduction"; conversion "1.7%" → "2.6%" = "a 50%+ increase" — https://razorpay.com/blog/arxstudios-magic-checkout-case-study/
  - MagicX (Shopify Plus): "40% Higher Conversion" via checkout "5 times faster"; "50% Fewer RTOs"; "100% RTO Protection" (MagicX absorbs RTO cost); "20% Higher Share of Prepaid Orders"; "200Mn+ customers from across the Razorpay network" — https://razorpay.com/blog/razorpay-magicx-for-shopify-plus/
  - Market framing on same blog: "70% of customers abandon their carts"; online returns "at least 30%" vs traditional retail "8.89% return rate".
- **Pricing:** **EVIDENCE NOT FOUND** on the product page.

### 1.4 Optimizer (multi-PG smart routing)
**URL:** https://razorpay.com/optimizer-intelligent-payments-routing/ · Retrieved 2026-08-26 (verified against raw HTML)

- **What it does (FACT):** a "wrapper" over payment systems letting a merchant route transactions across multiple payment gateways from a single integration. **Smart Router** — proprietary AI using a "random forest algorithm" over "historical data from over 1 Bn transactions". **DIY routing dashboard** — manual rules by payment method, value, other parameters. **Automatic failover** — "automatically select the next route if the first one fails". **Real-time downtime alerts** with rule changes in seconds. Standardised gateway integration cutting typical 2-month integration to "24 hours and ZERO EFFORT".
- **Published numbers (Razorpay's own claims, verified in raw HTML):**
  - "a 5% uplift in transaction success, which equates to a 10% increase in revenue!"
  - Stat tiles: "10% Increase in revenue", "5% Increase in transaction success rate", "1440x Reduction in routing cost and time", "28x Reduction in TAT and cost of integrating new gateways"
  - Headline copy: "Spike your success rates by over 10%"  — **NOTE: the page carries both "5%" and "over 10%" SR-lift framings; they are not reconciled on the page.**
- **Merchant pain claimed solved (FACT):** failed transactions damaging CX, high transaction cost across providers, slow/complex gateway integrations, lack of real-time control.
- **Companion capability — Single View Reconciliation (FACT):** Optimizer merchants "see transactions and settlement information on their Razorpay dashboard, regardless of whether payments were processed by Razorpay or an external payments aggregator." Pain named: finance teams "have traditionally had to download and manually reconcile payments and settlements from various payment aggregators". Sources: https://razorpay.com/blog/single-view-recon/ , https://razorpay.com/docs/payments/optimizer/reconciliation/
- **Pricing:** **EVIDENCE NOT FOUND**.

### 1.5 Route (split payments / marketplace settlement)
**URL:** https://razorpay.com/route/ · Retrieved 2026-08-26

- **What it does (FACT):** "Split and distribute payments, Automate vendor payouts." Multiple transfers from one payment to linked accounts; onboard "vendors, sellers, service providers, etc. as linked accounts"; three settlement modes — Default ("as per the defined settlement schedule"), Scheduled ("Explicitly set the settlement date for a transfer"), **On Hold** ("Put settlement on hold for a transfer until your business conditions are met"); API transfers with reversals; `transfer.created` / `transfer.reversed` webhooks.
- **Merchant pain claimed solved (FACT):** "Money movement in the real world is a monumental task with strict compliance requirements"; manual reconciliation; marketplace commission payouts; seller refund disputes.
- **Numbers (FACT):** "100,000+ Sellers? Millions of transactions? Razorpay Route is built for scale."
- **Pricing (FACT):** limited-time "0.25%* → 0.1%* Charged on every transfer as addon pricing" over standard PG pricing; GST applicable.

### 1.6 Subscriptions / Recurring
**URLs:** https://razorpay.com/subscriptions/ · https://razorpay.com/upi-autopay/ · https://razorpay.com/e-mandate/ · Retrieved 2026-08-26

- **Subscriptions (FACT):** "Enable recurring payment schedule, control the billing cycle and get instant alerts on subscription activity"; "a powerful hosted solution that handles edge cases like card change, retries, email alerts etc." Cards (credit/debit/prepaid per RBI), e-Mandate via netbanking or debit card, UPI (PhonePe, GPay, Paytm, BHIM + "40+ banks"). Billing models: fixed schedule, quantity-based, usage-based; trials, upfront charge, add-ons, discounts; upgrade/downgrade with proration; "nearly 100 currencies"; webhooks on state change.
  - Pricing (FACT): "0.5% addon fee" limited-time (standard "0.9%") per subscription payment, plus standard platform fees, GST applicable.
- **UPI Autopay (FACT):** "Set. Forget. Get Paid." Mandates across "60+ UPI apps"; low-friction ₹1 authorisation; pre-debit notifications; **"intelligent retry mechanisms for failed payments"**; **Subscription Command Center**; in-plan upgrades without billing disruption; **Renewal Shield (coming soon)** for automated reminders; Smart Intent (contextual UPI app selection); dynamic QR mandate approval; registration links.
  - Published numbers (FACT, Razorpay claims): **"8% improvement in debit collections through intelligent retries"**; "Highest mandate attempt to registration ratio" among providers; "Best-in-class mandate renewal rate". Framing pain: "Customer acquisition is expensive" → "Intelligent Revenue-Protect" to prevent losing customers to payment failures.
- **e-Mandate / e-NACH (FACT):** e-NACH governed by NPCI, "40+ banks"; e-Mandate bank-controlled, "4-5 banks". Legacy ECS was manual/physical; e-Mandate "reduced the processing time from 21 to just 2 working days, in most cases."
- **Churn statistics:** **EVIDENCE NOT FOUND** on these pages. (See §6 for the 57% subscription-recovery figure published on the Razorpay blog.)

### 1.7 Smart Collect 2.0 (virtual accounts)
**URL:** https://razorpay.com/smart-collect/ · Retrieved 2026-08-26

- **What it does (FACT):** "Automatically reconcile incoming UPI, IMPS, NEFT and RTGS payments and enjoy real-time, instant collections that keep your cash flow agile." Unique identifier series (virtual accounts + virtual UPI IDs) linked to the business bank account; brandable identifiers; real-time tracking via API/webhooks/dashboard; whitelisted-customer acceptance for compliance; "Seamlessly refund any payment made to the wrong and deactivated Identifiers."
- **Merchant pain claimed solved (FACT):** manual reconciliation of bank-transfer collections; finance teams "focus on growth instead of manual reconciliations and cash flow management."
- **Published number (FACT, single testimonial):** Vishvajit Sonagara, founder of Quicko — Smart Collect "saved us 60+ hours every month of manual reconciliation tasks."
- **Target verticals (FACT):** broking, lending, B2B marketplaces, real estate, education, healthcare, franchises, ad monetisation, crowdfunding.
- **Pricing:** **EVIDENCE NOT FOUND**.

### 1.8 No-code collection surface — Payment Pages, Payment Links, Invoices, Payment Buttons, QR
| Product | URL | What it does (FACT) | Pain claimed (FACT) | Numbers (FACT) |
|---|---|---|---|---|
| Payment Pages | https://razorpay.com/payment-pages/ | "Create Payment Pages, customise layouts, and launch a payment web page without coding"; automated receipts "reducing manual work"; custom URL + brand colours; custom fields; real-time tracking | no website / no dev skills; manual collection; collecting from many customers without resetting links | "Pay zero* platform fee for 90 days" |
| Payment Links | https://razorpay.com/payment-links/ | "Create a payment link & accept payments in seconds. Share… via SMS, email or WhatsApp"; "180+ payment methods"; installments/upfront/advance; **bulk generation via .csv/.xlsx** ("hundreds of payment links at once"); webhooks; APIs to "automate payment link creation and collection" | receivables collection friction, COD reduction, repeat card-entry friction | merchant testimonial "our RTO rate dropping by 36.36%"; "60% of our customers paying via cards and 40% opting for UPI" |
| Invoices | https://razorpay.com/invoices/ | "Create and send GST compliant invoices that your customers can pay online instantly"; auto GST/discount/shipping calculation; partial payments; templates; PDF; **account receivables tracking**; APIs | slow cash flow/collection; manual invoice creation; no receivables visibility; GST compliance | 0% platform fee first 3 months up to ₹3,00,000, then 2% (3% premium instruments); ₹0 setup/AMC |
| Payment Buttons | https://razorpay.com/payment-buttons/ | one line of code, live in <5 min; one-time **and recurring/subscription**; automated receipts incl. 80G; offers from dashboard; international; works with Wix/GoDaddy | setup complexity, integration burden, mobile UX | Standard plan 2% (3% for Diners/Amex/International/EMI/Corporate CC); ₹0 setup, ₹0 AMC |
| QR Codes | https://razorpay.com/qr-code/ | "Generate unlimited QR codes in seconds—be it UPI QR, Bharat QR, or Merchant QR"; multi-payment QR incl. cards; branded QR; real-time notifications; "60+ UPI Apps"; no POS hardware needed | in-store checkout, **COD-to-digital conversion**, event collections, multi-location tracking, WhatsApp/social selling | testimonial: "significant reduction in COD orders and returns, with our RTO rate dropping by 36.36%" |

### 1.9 Settlements & Instant Settlement
**URL:** https://razorpay.com/settlement/ (Razorpay Capital-branded) · Retrieved 2026-08-26

- **On-Demand Settlement (FACT):** "Transfer to your bank account within 10 seconds"; "Works during non-banking hours, weekends, and bank holidays"; covers "all the payment methods, be it credit cards or net banking."
- **Same-Day Settlement (FACT):** "T+0 cycle", "Enable from Day 1", "Schedule unlimited settlements on working days". Cutoffs: 9:00AM–4:59PM settles 5:00PM same day; 5:00PM–8:59AM settles 9:00AM next day.
- **Fees (FACT):** On-Demand "0.20 - 0.30%"; Same-Day "0.15 - 0.20%"; "₹ 0.00 One-Time Setup Fee"; "₹ 0.00 Annual Maintenance Fee".
- **Pain claimed (FACT):** working capital constraint — "Service customer with cash in hand or save on interest"; testimonial: "Early settlement option helped us to manage our business with even a low working capital."

### 1.10 Instant Refunds
**URL:** https://razorpay.com/instant-refunds/ · Retrieved 2026-08-26
- **FACT:** refund reaches the original source in ~2 minutes vs the 5–7 business day standard — framed as **"From 7200 minutes to 2 minutes."** Full refund-outcome visibility at PG level; dashboard or API.
- **Pain claimed (FACT):** customer frustration at "5 to 7 business days"; support-ticket load; retention. Testimonial: **"Our NPS has shot up by 10-points after using Razorpay's Instant Refunds."**
- Related case study (FACT): "Furlenco reduces customer complaints by 70% on automating refunds via RazorpayX" — https://razorpay.com/case-studies/furlenco-reduces-customer-complaints-by-70-on-automating-refunds-via-razorpayx/

### 1.11 Reconciliation & Reports (not a standalone SKU)
- **FACT:** Reconciliation is delivered as dashboard reports + product features rather than a named standalone product. Settlement Reconciliation Report is downloadable daily/monthly from the Reports section of the dashboard (https://razorpay.com/docs/payments/settlements/dashboard/). Optimizer adds cross-PG **Single Reconciliation View** (https://razorpay.com/docs/payments/optimizer/reconciliation/). Smart Collect 2.0 delivers auto-recon of bank transfers. Razorpay POS advertises "AI-powered reconciliation for transaction matching."
- **EVIDENCE NOT FOUND:** a dedicated `razorpay.com/reconciliation/` product page.

---

## 2. Risk, fraud, RTO & disputes

### 2.1 Thirdwatch
- **FACT:** Razorpay acquired Thirdwatch in **August 2019** — its first acquisition — https://razorpay.com/blog/thirdwatch-acquisition-rto-fraud-ecommerce/
- **FACT:** Thirdwatch was an "AI-driven product that helps eCommerce/D2C brands prevent RTOs by analyzing shoppers' orders based on different parameters and flagging risky orders in real-time"; also flagged COD fraud, junk/incomplete addresses, historical patterns; shipped as Shopify/WooCommerce/Magento apps.
- **FACT (status):** **Thirdwatch has been merged into Razorpay Magic Checkout** — https://razorpay.com/blog/thirdwatch-has-merged-with-magic-checkout/ . So there is **no standalone Thirdwatch product page today**; RTO prediction now ships as Magic Checkout's Risk Detection Engine / RTO Suite.
- ML background: https://razorpay.com/blog/detect-fraud-using-ml-ai-thirdwatch/

### 2.2 RTO Suite / RTO Protection
- **FACT:** PG 3.0 press release names an "AI-Powered RTO Suite with loss protection guarantee" and "FraudShield: Chargeback reimbursement promise" (2024-02-23 PR).
- **FACT:** MagicX claims "100% RTO Protection — MagicX absorbs RTO costs if orders are returned to origin" and "50% Fewer RTOs" by dynamically disabling COD for high-risk shoppers.

### 2.3 Chargeback Shield / Razorpay Shield Program
**URL:** https://razorpay.com/terms/chargeback-shield/ · Source type: legal terms · Retrieved 2026-08-26
- **FACT:** covers eligible **fraud-reason-code** chargebacks on **cross-border export** payments, during the enrolment period, subject to merchant compliance.
- **FACT (exclusions):** does NOT cover chargebacks about "the quality, delivery, or description of goods or services (e.g., undelivered goods, defective products, or services not as described)", non-fraud reason codes, or transactions Razorpay excludes in writing.
- **FACT:** "coverage is applicable only to non-3DS international transactions" unless otherwise agreed; capped at "a maximum aggregate coverage ceiling of INR [₹]" — **the ceiling is left blank in the published terms.**
- **INFERENCE:** the largest dispute category for Indian D2C (service/delivery disputes) is explicitly *out of scope* — leaving an unserved merchant need around non-fraud dispute defence.

### 2.4 Biometric Passkey authentication
**URL:** https://razorpay.com/newsroom/say-goodbye-to-otps-razorpay-along-with-mastercard-and-visa-launches-rbi-compliant-biometric-passkey/ · press release, **2026-03-31**
- **FACT (claims):** "reduces OTP-led authentication errors by 35%"; "up to 95% transaction success rates"; "nearly 35% of payment failures stem from authentication challenges such as delayed OTPs, incorrect entry, or redirection errors"; RBI data cited: "over 13,500 internet fraud cases and losses exceeding ₹520 crore" in FY25.

### 2.5 Smart AML Risk Screening / Chargeback Fraud Protection (international)
- **FACT:** listed among Sprint 2026 international-payments launches — https://razorpay.com/sprint/26 . Detail beyond the name: **EVIDENCE NOT FOUND**.

---

## 3. RazorpayX — business banking & money-out

### 3.1 RazorpayX (umbrella)
**URL:** https://razorpay.com/x/ · Retrieved 2026-08-26
- **FACT:** "The all-in-one business banking suite" to "accept, process, and disburse payments." Modules: **Business Banking+** (current account, instant beneficiary addition, bulk payouts up to 50k per single OTP), **API Payouts** (AI-powered multi-bank routing, claimed "99.9% success rate", UPI/IMPS/NEFT/RTGS/card payouts), **Vendor Payments** (OCR invoice sourcing, multi-layer approvals), **Payroll** (compliance across 28 states; TDS/PF/PT/ESIC; 25+ HRMS integrations), **Corporate Card** ("up to 30% off on 500+ top SaaS, marketing and tech tools"), **Escrow+**, **Tax Payments**.
- **FACT (stats):** "$10 Billion" payout volume in 2024; **"79.99% payout success rate"** *(as rendered on the page — see caveat below)*; "70% of India's Unicorns"; "1,000+ partners".
- **Reported customer outcomes (FACT, testimonials):** 10–12 hours saved monthly; payroll error elimination; refund cycles from "2-3 days reduced to under 2 hours".

### 3.2 RazorpayX Payouts
**URL:** https://razorpay.com/x/payouts/ · Retrieved 2026-08-26 (also verified against raw HTML)
- **FACT:** "The payout stack powering India's fastest-growing businesses"; "Smart payout engine built for scale and efficiency — supported via dashboard, file uploads, and best-in-class APIs." IMPS/NEFT/RTGS "even on Bank Holidays"; UPI VPA payouts; Amazon Pay wallet; **Visa Direct and Mastercard Send** card payouts. Bulk: "Supports 50000 payouts in a single file", "Smart bulk templates, catch errors at source". "Customisable multi-level approval workflows" with role-based access. Auto-reconciliation: "Search any transaction in seconds"; "Low-balance alerts prevent payout delays". Fund-account verification: "AI optimisation between penniless & pennydrop for a **99.9% success rate**", "Zero onboarding drop-offs, with fastest verifications in under ~2secs".
- **Stat-tile caveat (IMPORTANT):** the hero stat tiles are **JS-animated counters**; raw HTML shows partially-rendered values ("10.00 % Success Rate in ~5s", "10 %+ Reconciliation Accuracy", "<0.2% Payouts Stuck in Processing", "1-minute Downtime Alerts"). The success-rate and reconciliation-accuracy tiles could **not be resolved to their final values** — record as **EVIDENCE NOT FOUND / ambiguous**, and do not quote "10%".
- **Unambiguous testimonial numbers (FACT):** Astrotalk co-founder Anmol Jain — "the 15% higher success rates compared to other platforms"; MPL product lead — "RazorpayX made partner payouts 100% error-free, 80% faster & fully automated"; another testimonial — "an 11% reduction in cost".

### 3.3 RazorpayX Current Account / Business Banking+
**URL:** https://razorpay.com/x/current-accounts/
- **FACT:** "the command centre for your business finance"; "50,000 payouts in a single OTP with industry-leading payouts success rates"; "10,000+ businesses"; automation of "vendor payments, taxes, payroll"; granular access controls + self-serve online approval workflows; internet banking, auto sweep, NEFT/RTGS/IMPS, free cheque collection, access to credit via Razorpay Capital. Tiers: Core / Pro / Advanced.

### 3.4 Vendor Payments & Source-to-Pay / AP Automation
**URLs:** https://razorpay.com/x/vendor-payments/ · https://razorpay.com/x/ap-automation/ · https://razorpay.com/x/source-to-pay/
- **FACT (Vendor Payments):** "Track invoices, pay vendors, close books, & more on one platform." OCR invoice scanning; custom merchant email or vendor portal for invoice sourcing; multiple line items/tax codes/payment terms; **automatic TDS calculation and deduction**, with RazorpayX paying the government at month-end and supplying challans; multi-layer approvals (team + amount based) with email approvals; partial payments; bulk vendor import; due-date alerts; ERP integration with real-time bookkeeping sync; **6-point vendor verification** (add-on); tracking of cash/cheque payments.
- **Pain claimed, verbatim (FACT):** "from chaos to control" — replacing "Invoices in your email, Vendors following up on payments, Requesting approvals on messaging apps," and "Making batch payments via CSVs weekly."
- **FACT (Source-to-Pay stats):** "4,950+ customers"; "950+ hours saved monthly"; "20% reduction in reconciliation time"; businesses save "up to 70% in time and operational costs". Adds automated **3-way matching (PO-GRN-Invoice)**, "GST Input Tax Credit verification against filings", single-OTP bulk payout.

### 3.5 RazorpayX Tax Payments
**URL:** https://razorpay.com/x/tax-payments/
- **FACT:** "All-in-one automated tax payments crafted for startups." "Automated TDS deductions and payments, whether you are paying suppliers, contractors, or running payroll." Invite CAs with custom access + spending limits "eliminating the need to share banking passwords"; central challan storage; auto-pay/reminders; supports **TDS, TCS, GST, advance tax**.
- **Pain claimed (FACT):** multiple slow government portals; security risk of sharing banking credentials; manual TDS calculation errors; lost challans; penalty risk from missed deadlines.
- **Stat (FACT):** "90% of India's top tech startups are on RazorpayX".

### 3.6 RazorpayX Payroll
**URL:** https://razorpay.com/payroll/
- **FACT:** "Fully-Automated Payroll & Compliance Software" to "disburse salaries, file & pay taxes". "Automate payment of TDS, PF, PT & ESIC, along with tax filing"; digital Form 16; real-time regulatory change alerts; salaries to employees/contractors/freelancers; off-cycle payroll; leave & attendance feeding salary; payslips via WhatsApp; CTC calculators & offer-letter generators; instant reimbursements; bulk additions/deductions; **45+ HRMS integrations**.
- **Stats (FACT):** "10,000+ companies"; one customer saved "over 300 hours annually"; "1-Hour Onboarding". Promo: "1 month FREE + 20% OFF on semi-annual plans".
- Enterprise variant: https://razorpay.com/x/payroll-enterprise/ ; Sprint 2026 adds "Payroll Engine 2.0", "AI Payslip", "Payroll Approvals Agent".

### 3.7 Other RazorpayX modules (names verified from x_sitemap.xml, detail not scraped)
Corporate Cards, Line of Credit, Escrow Accounts, Forex, Digital Lending, Bank Account Verification, Internet Banking, X One, Accounting Payouts, Partner/accountant programs. Feature-level detail for these: **EVIDENCE NOT FOUND** this session.

---

## 4. Razorpay Capital (lending)

**URLs:** https://razorpay.com/capital/get-money-within-a-flash/ · https://razorpay.com/capital/cash-advance/ · https://razorpay.com/capital/working-capital-loans/ · https://razorpay.com/capital/instant-settlements/ · https://razorpay.com/x/digital-lending/

- **FACT:** Razorpay Capital spans **Business Loans, Instant Settlements and Corporate Cards**.
- **Cash Advance (FACT):** short-term credit line; "Withdrawal within 10 seconds"; "Repay easily from settlements"; "Pay Interest only when you use"; "get backup for unexpected cash needs without a fresh application every time"; "Available for selected merchants only!". Underwriting uses **payment history, not just credit history**, approving "within a few hours or instantly in some cases".
- **Regulatory (FACT):** operated by Razorpay Tech Solutions Private Limited, "authorized by RBI as a Lending Service Provider".
- **Amounts (FACT, lower confidence — surfaced via search snippets of razorpay.com pages rather than a page I opened directly):** business financing "up to ₹2 Crores"; company ambition "to support businesses with up to 100 Crores of credit"; framing that collateral-free loans normally take "5-15 days for small businesses".
- **Market framing (FACT, Razorpay blog):** "India has more than 63 million MSMEs, with 40% having availed loans from formal channels while 60% don't have easy access to working capital loans."
- **Total disbursement figures / merchant counts:** **EVIDENCE NOT FOUND**.

---

## 5. Offline, omnichannel, growth-marketing, international

### 5.1 Razorpay POS (ex-Ezetap) · https://razorpay.com/pos/ , https://razorpay.com/digipos/
- **FACT:** swipe machines + QR devices. "UPI payments in just 1.5 seconds, cards under 15 seconds"; **self-healing technology** that auto-resolves common device issues; "Connect with 150+ ERP and billing tools seamlessly"; **AI-powered reconciliation for transaction matching**; flexible EMI and dynamic currency conversion; **Razorpay Billme** interactive paperless billing.
- Devices (FACT): All-in-One POS, Smart POS with Dock, Android Mini POS, Smart POS with IR Scanner; Growth DQR, Tap & Scan Soundbox, Bharat Soundbox, Signature Soundbox.
- **FACT (2024 PR):** Dynamic QR Device = "India's First UPI-Led QR Stack for Enterprises", QR + NFC contactless, at "one-third the price of a standard PoS terminal".
- **FACT (regulatory):** "Razorpay POS Receives RBI Approval for Offline Payment Aggregator Licence" — 2026-01-22.
- **FACT (stats, FY23 blog):** see §0. Also "91% of the TPV from April to October 2023 was attributed to UPI"; **"21% increase in the conversion of Cash on Delivery to digital payments"** in FY2023. Pain named: CoD creates "operational complexities… challenges in payment reconciliation and cash management."

### 5.2 Omnichannel Payments · https://razorpay.com/omnichannel-payments/
- **FACT:** "India's first platform to unify your online and offline worlds"; online + in-store + on-delivery payment links + WhatsApp; "manage reconciliation, settlements, and refunds in one place"; "1.5 million+ businesses across India".
- Pain claimed (FACT): fragmented journeys, disconnected systems/multiple dashboards, online/offline settlement complexity.

### 5.3 Razorpay Engage (growth marketing) · https://razorpay.com/engage/
- **FACT:** "Payments powered growth marketing suite"; "Supercharge acquisition and retention with payments at the core." Six modules: **Offers Engine** ("Create, customise & set rules for offers", "Co-fund deals with banks or businesses"), **Gift Cards** ("Distribute among Razorpay's 8M+ business network"), **Loyalty Wallet** ("Streamline refunds, rewards & gift cards all on one platform"; "Save ~70% operations cost"), **RazorpayBillme** (digital bill ad spaces with offers/surveys/catalogues), **Contextual Marketing Suite** ("Hyper-targeted transaction-led promotions"), **Enterprise Loyalty Suite**.
- Merchants named (FACT): Swiggy, FnP.
- **Note:** Engage was launched at the same 2024-02-23 press event as PG 3.0 and RAY.

### 5.4 Razorpay Konnect (WhatsApp suite) · https://razorpay.com/konnect/
- **FACT:** "The complete WhatsApp suite for your business… engage customers, drive conversations, and turn those into conversions!" Ten capabilities incl. chat widget, click-to-WhatsApp ads, broadcasts, catalogues, WhatsApp payment links, in-app WhatsApp payments, no-code chatbots, **Abandoned Cart Recovery** (one-click checkout), **Automated Order Updates** ("Reduce RTOs with automated order & address confirmations"), multi-agent dashboard with "360° customer views".
- **Published numbers (FACT, but note rendering issue):** "2X higher conversions"; "Conversion rate on WhatsApp is 10% higher than on D2C websites"; "Reduce acquisition costs by 50% and boost customer lifetime value by 20%". Two further tiles rendered as "1X better CTRs" and "1X better reach" — **these are almost certainly animated counters mid-render; do not quote as "1X".**

### 5.5 Merchant of Record / international · https://razorpay.com/merchant-of-record/ , https://razorpay.com/accept-international-payments/
- **FACT:** MoR for Indian exporters — "Accept over 100 currencies and multiple payment methods"; 100+ countries; "Automate GST and VAT remittance across jurisdictions"; 24/7 fraud monitoring; subscription billing; real-time analytics; buyer support for payment queries and disputes; "Get started in minutes without any coding expertise".
- **FACT (status):** **currently waitlist-phase, not fully launched.**
- **FACT:** "Razorpay Secures RBI's Cross-Border License" — press release 2025-12-02.

### 5.6 Tax / GST / accounting-adjacent
- RazorpayX Tax Payments (TDS/TCS/GST/advance tax) — §3.5.
- Vendor Payments TDS automation + **GST ITC verification against filings** (Source-to-Pay) — §3.4.
- Invoices: GST-compliant invoicing — §1.8.
- Payroll: TDS/PF/PT/ESIC filing, Form 16 — §3.6.
- **Softex filing** (https://razorpay.com/softex-filing/) and **Import-Export Code** (https://razorpay.com/import-export-code/) exist in the sitemap as compliance-adjacent services — detail **EVIDENCE NOT FOUND** this session.
- Free tools: GST late fee calculator, income tax calculator, payslip generator, AP-days calculator etc. under /x/.
- **No standalone bookkeeping/accounting GL product found.** Sprint 2026 lists a **"Bookkeeping" agent** and **"Reporting" agent** under Agentic Business Banking (§7).

---

## 6. Published merchant pain & statistics (the "why this hurts" evidence base)

> All figures are **Razorpay's published claims** on Razorpay-owned properties. Where Razorpay attributes to a third party (RBI, NPCI) I note it.

### 6.1 Payment success rate / failure — the richest published dataset
**Source:** "Payment Success Rate Optimization India (2026 Guide)", Razorpay blog, published **2026-05-05** — https://razorpay.com/blog/payment-success-rate-optimization-india/

| Metric | Published value |
|---|---|
| India average **D2C success rate** | **68–74%** |
| Target benchmark | **85%+** |
| SR by geography | Metro 78–82% · Tier-2 62–68% · Tier-3 55–62% (**27pp metro-to-tier-3 gap**) |
| SR by method | UPI ~99.2% (0.8% technical decline) · cards 85–90% · netbanking 90–95% · **international cards 70–80%** |
| Cart abandonment cause | "Nearly 70% of cart abandonment in India happens due to payment failures" |
| Customer loss after decline | 40% of customers won't return after a card decline |
| Evening peak degradation | SR drops **8–12 pp during 7–10 PM** |
| Mobile vs desktop | 68–72% mobile vs 76–80% desktop |
| False-decline cost | "For every ₹100 saved by preventing fraud, brands lose ₹400–600 to falsely declined legitimate orders" |
| Automated retries | recover **15–20% of failed transactions** (adds 3–5 pp) |
| **Subscription payment recovery** | **"Up to 57% recovery on initially failed attempts"** |
| Network tokens | +4.4% approval rate |
| Local acquiring | +17.9% LTV vs cross-border |
| Revenue math | 5pp SR improvement on ₹1 crore monthly GMV ≈ ₹5 lakh/month (₹60 lakh/year) |

**Source:** "Multi-Gateway Routing & Payment Orchestration in India", Razorpay blog, **2026-08-06** — https://razorpay.com/blog/multi-gateway-routing-payment-orchestration-in-india-how-smart-routing-improves-success-rates/
- "smart routing can improve approval rates by **10-30%** versus a single-gateway setup"
- single-gateway baseline: "**80-85%** payment success rates"; UPI at peak dips to 80-85% from 90-95%
- cascading logic recovers "**5-15% of previously failed transactions**"
- "**62% of customers who experience a failed online transaction never return**"
- India context: "129.3 billion real-time payments in 2023"; "UPI accounts for **83.4%** of India's payments ecosystem volume in FY25"; "84% of electronic payments made in India are real-time"; "731 banks live on UPI by June 2026"
- Pain narrative: businesses "quietly leak revenue" via single-gateway routing and do "manual firefighting each week"

**Source:** "Introducing the most effective way to recover failed payments" (Failed Payments Recovery / retargeting via WhatsApp, Email, SMS) — https://razorpay.com/blog/introducing-the-most-effective-way-to-recover-failed-payments/
- "20-25% of payments fail due to reasons that are beyond the control of the businesses"
- "More than 50% payment failures are due to customer errors or network issues"
- "1 out of every 3" mobile payment users "encounter network issues such as low data connectivity"
- "52% are not likely to return for future purchases" after a payment failure
- Product claim: "**Recover up to 20% of failed payments**"; "**Grow your revenue by up to 10%**"

**Source:** Biometric Passkey PR, 2026-03-31 — "nearly **35% of payment failures stem from authentication challenges** such as delayed OTPs, incorrect entry, or redirection errors"; passkeys cut OTP-led auth errors 35% and drive "up to 95% transaction success".

**Source:** SR Masterclass (Razorpay Academy) — https://razorpay.com/academy/srmasterclass/ — "1.5 hours of on-demand video | 7 quizzes | 1 situation-based assessment"; five modules (Payment Transaction Fundamentals, Card Payment Fundamentals, UPI Payment Fundamentals, Platform Innovations and SR Best Practices, Final Evaluation); taught by six senior Razorpay staff. **INFERENCE:** Razorpay treats "SR" as a first-class merchant-facing metric worth an entire certification course — strong signal that SR is the #1 published merchant pain.

### 6.2 Checkout abandonment / RTO / COD
- "70% of customers abandon their carts"; online returns "at least 30%" vs retail 8.89% (MagicX blog).
- "only 10% of online shoppers cross the barrier of deciding what to buy"; "only 1/4th of these potential buyers make a purchase" (2024-02-23 PR).
- ARXSTUDIOS: RTO 15-20% → 5%. Magic testimonials: RTO −36.36%, prepaid share +70%.
- Razorpay POS: "21% increase in the conversion of Cash on Delivery to digital payments" FY23.
- Razorpay publishes a whole ebook, **"India and Cash on Delivery — Why #CoDZarooriHai for Indian customers"** — https://razorpay.com/ebooks/india_and_cod/

### 6.3 Receivables / collections delay
- **"₹8.1 trillion is estimated to be locked in delayed payments to MSMEs in India"** — RazorpayX AI Agents PR, **2026-06-01** — https://razorpay.com/newsroom/for-the-first-time-in-india-businesses-on-razorpayx-can-now-bank-with-ai-agents-that-work-while-they-sleep/ . Same PR: finance teams stuck "in a cycle of follow-ups, manual configurations, and reconciliation work"; tools are "too expensive, too fragmented, or simply absent".
- "60% [of India's 63M MSMEs] don't have easy access to working capital loans" (Razorpay Capital blog).

### 6.4 Reconciliation burden
- Smart Collect testimonial: "saved us 60+ hours every month of manual reconciliation tasks".
- Source-to-Pay: "950+ hours saved monthly", "20% reduction in reconciliation time", "up to 70% in time and operational costs".
- Agent Studio PR: "Manual reconciliation work: reduced from hours to seconds".
- Optimizer recon blog: finance teams "download and manually reconcile payments and settlements from various payment aggregators".
- Vendor Payments pain copy: "Invoices in your email, Vendors following up on payments, Requesting approvals on messaging apps, Making batch payments via CSVs weekly."

### 6.5 Fraud & disputes
- RBI-attributed, via Razorpay PR: "over 13,500 internet fraud cases and losses exceeding ₹520 crore" in FY25.
- False declines: "₹400–600 lost per ₹100 of fraud prevented."
- Chargeback Shield explicitly excludes non-fraud (service/delivery/description) disputes — the volume category is uncovered.

### 6.6 The report series ("The Era of Rising X")
- **FACT:** the series is titled **"The Era of Rising Fintech"** — a recurring (originally quarterly) Razorpay report on how India makes and accepts payments, built on Razorpay platform transaction data. Index: https://razorpay.com/blog/era-of-rising-fintech-digital-payments-upi-report
- Sample edition (2019-04-17): 11.8bn digital transactions in H1 FY2018-19; P2M mix cards 56.48% / netbanking 23.8% / UPI 17% / wallets 1.87%; wallets fell 6%→1.5% YoY.
- Other editions found: 2020 report (tier-2/3 cities >half of online payments); "Digital Payments Grew by 76% in the last 12 months"; "India Sees 383% Growth in Digital Payments From FY'18 to FY'19"; COVID-era editions.
- **EVIDENCE NOT FOUND:** a 2025 or 2026 edition of "The Era of Rising Fintech", and no "state of payments 2025/2026" annual report. The recent-year equivalent appears to be the **Razorpay Sprint** launch event (https://razorpay.com/sprint/26, "100+ Launches") plus the newsroom, not a data report.
- **EVIDENCE NOT FOUND:** a working index of Razorpay white papers — https://razorpay.com/white-papers/ resolved to navigation only. Ebooks that DO exist: India and CoD; Payroll and Compliance; Subscriptions Ecommerce; Banks vs Fintech; Complete Guide to Closing the Financial Year.

---

## 7. Razorpay's own AI/agentic surface (2025-2026) — directly track-shaped

This is the most important finding for hackathon positioning: **Razorpay has already shipped an agent product whose agent list is nearly a 1:1 map of the five hackathon tracks.**

### 7.1 Agent Studio
**URLs:** https://razorpay.com/agent-studio/ · PR **2026-03-12**: https://razorpay.com/newsroom/razorpay-launches-the-worlds-first-ai-native-agent-studio-for-payments-at-ftx26-powered-by-anthropics-claude/

- **FACT:** "A B2B agent marketplace and builder platform for Payments and Business Banking, built using the **Claude Agent SDK from Anthropic**."
- **Framing pain, verbatim (FACT):** *"Every month, businesses lose revenue not because payments fail, but because no one has time to fix what happens after."* And from the PR: *"The business of managing online commerce – recovering abandoned carts, retrying failed subscriptions, reconciling settlements, resolving disputes – still demands significant manual effort."*
- **Harshil Mathur (Co-founder & CEO) quote (FACT):** "Businesses don't just need more software anymore – they need intelligence that can act."
- **Shipped/featured agents (FACT):**
  | Agent | Function |
  |---|---|
  | **Dispute Responder** | auto-responds to chargebacks with optimised evidence |
  | **Subscription Recovery** | analyses failed payments, triggers retention |
  | **Abandoned Cart Conversion** | re-engages via WhatsApp/email |
  | **RTO Shield / RTO Shielder** | detects high-risk COD orders before shipment |
  | **RTO Insights** | analyses return patterns across pincodes and products |
  | **Settlement Insights** | daily payout summaries via WhatsApp |
  | **Cashflow Forecaster** | predicts cash position 3–7 days ahead |
- **Three usage models (FACT):** customise prebuilt agents; onboard as an AI partner; build custom agents from scratch (Beta).
- **Stats (FACT, PR):** onboarding "30-45 minutes to 5 minutes"; integration "under 10 minutes"; manual reconciliation "from hours to seconds".
- **STRATEGIC NOTE (INFERENCE):** a hackathon submission that simply rebuilds "dispute responder" or "abandoned cart agent" is duplicating a shipped Razorpay product. Differentiation must come from a sharper wedge, better evidence generation, or a gap (e.g. **non-fraud dispute defence**, which Chargeback Shield explicitly excludes).

### 7.2 Agentic Payments (making merchants transactable by AI buyers)
**URLs:** https://razorpay.com/agentic-payments/ · https://razorpay.com/blog/razorpay-unveils-agentic-payments-on-chatgpt-with-npci-.../ (**2025-10-09**) · PR **2026-02-20** (NPCI + Claude, Zomato/Swiggy/Zepto)
- **FACT:** "Razorpay brings payments into AI-native journeys, so transactions happen at the speed of intent." Three surfaces: **In-App Commerce** (Live in Beta), **LLM Integration** (active with bigbasket, Vi), **Voice AI** (signup).
- **FACT (rails):** **UPI Reserve Pay** — Live — "consent-based, pre-authorized payments that allow AI agents to transact securely within approved spending limits"; **UPI Circle** — coming soon — delegated authorisations. Partners: NPCI, Axis Bank, Airtel Payments Bank.
- **FACT:** "40+ composable tools and APIs"; full-stack methods (UPI, cards, wallets, netbanking); "Real-time fraud detection and compliance built for AI-led transactions".
- **FACT (adjacent launches):** Razorpay MCP + Remote MCP, n8n node, Replit integration, **Payment CLI** (PR 2026-05-27), **payments inside OpenAI Codex** (PR 2026-04-06), **card payments via Google Pay** as first Indian PA (PR 2026-04-22).
- Pilots named (FACT, via press coverage of Razorpay announcements): Zomato, Swiggy, Zepto, PVR INOX, Vodafone Idea, Bluestone, Honasa, bigbasket.

### 7.3 Agentic Business Banking
**URL:** https://razorpay.com/agentic-business-banking/ (page returned nav-only via WebFetch → **EVIDENCE NOT FOUND at page level**). Verified instead via PR **2026-06-01** and https://razorpay.com/sprint/26.
- **FACT (PR):** agents live/beta for RazorpayX Connected Banking+ users:
  - **Cashflow Insights** — consolidates "account balances, incoming payments, cash flow, and how long current funds are likely to last"
  - **Receivables Agent** — "following up on unpaid invoices and sending timely payment reminders"
  - **Payout Agent** — "type who you want to pay", agent fetches payee details, OTP approval "in seconds"
- **FACT (Sprint 26 list):** Agentic Business Banking = Insights, Receivables, Payouts, **Bookkeeping**, **Reporting** agents.

### 7.4 RAY / Ray Smart Assist and RazorSense
- **FACT:** **RAY** = Razorpay's AI assistant announced 2024-02-23 — resolves queries on Payments, Payouts, Payroll, Vendor payments; "Generates integration code on request"; English + Hindi + regional languages upcoming. Sprint 2026 lists "Ray Smart Assist" under Agentic Platform.
- **FACT:** **RazorSense** (https://razorpay.com/razorsense/) is **a design language, not a risk/analytics product** — "The Glyph" and "The Flutes", emotional states Calm/Joyful/Caution/Regret, "built for the Humans in the AI Era." *(Flagging because the name reads like an analytics product; it is not.)*

### 7.5 Razorpay Sprint 2026 launch list (selected, all FACT from https://razorpay.com/sprint/26)
Payment Gateway: Biometric Card Authentication · UPI Reserve Pay · CardSync with CRED · **Intelligent Retry Engine** · Enterprise SSO (Azure AD, Okta) · ₹1 UPI Autopay Registrations · UPI Mandate Cancellation APIs · 8 & 9-digit BIN support · Higher card auto-debit limits (₹1 lakh) · Upgraded Card Retry · Copilot-Powered Card Migration.
D2C: Quick Buy 2.0 · Buyer Protection · Login with Razorpay · Omnichannel Payments · Self Healing POS · POS Command Centre · Order Milestone Badges · ClickPost integration · Growth DQR · Divyang Drishti Pay.
International: Localised Checkout · Apple Pay · Google Pay · **Smart AML Risk Screening** · **Chargeback Fraud Protection** · Saved Cards · Exporter Dashboard 2.0 · **Intelligent Routing** · In-House Cards Switch · new global accounts (UAE, Australia, Switzerland, Canada) · Optimised Messaging.
Marketing: Rewards Marketplace 2.0 · Lounge Connect · Omni-channel Gift Cards · Wallet-Based Refunds.
Banking: Agentic Business Banking · Bank Account Verification for Employees · Corporate Card · Payroll Engine 2.0 · AI Payslip · Payroll Approvals Agent · DirectToPhone Payouts · Instant Reimbursements · Automated TDS Payments and Filing · **Smart Collect 2.0** · AI-powered Multi-Bank Routing.

---

## 8. Track-mapping table

Tracks: **T1** AI Growth & Agentic Commerce · **T2** AI Risk Manager · **T3** AI Revenue Recovery · **T4** AI Finance Controller · **T5** Open

| Product / surface | URL | Primary track | Secondary | Why (evidence hook) |
|---|---|---|---|---|
| Payment Gateway / PG 3.0 | /payment-gateway/ | T3 | T1 | SR + "30% higher conversions" claim; Quickbuy 1-step checkout |
| **Magic Checkout / MagicX** | /magic/ | **T3** | **T2**, T1 | 70% cart abandonment; RTO risk engine; 36.36%–75% RTO reduction claims; 7.3–40% conversion lift |
| **Optimizer** | /optimizer-intelligent-payments-routing/ | **T3** | T4 | 5%–10%+ SR lift, failover, downtime alerts, 1Bn-txn routing model; Single View Recon → T4 |
| Route | /route/ | T4 | T1 | marketplace split settlement, on-hold settlements, "eliminates manual reconciliation" |
| Subscriptions | /subscriptions/ | **T3** | T4 | card change, retries, dunning; 57% subscription-recovery claim (blog) |
| UPI Autopay / e-Mandate | /upi-autopay/, /e-mandate/ | **T3** | T1 | "8% improvement in debit collections through intelligent retries"; Renewal Shield |
| **Smart Collect 2.0** | /smart-collect/ | **T4** | T3 | auto-recon of UPI/IMPS/NEFT/RTGS; "60+ hours/month" saved |
| Payment Links / Invoices / Payment Pages | /payment-links/, /invoices/, /payment-pages/ | **T3** | T4 | receivables collection, bulk links, AR tracking, reminders |
| Payment Buttons / QR | /payment-buttons/, /qr-code/ | T1 | T3 | no-code acquisition; COD→digital conversion |
| **Settlements & Instant Settlement** | /settlement/ | **T4** | T5 | T+0 / 10-second settlement, cash-flow timing, fee tradeoff |
| Instant Refunds | /instant-refunds/ | T2 | T4 | dispute/complaint deflection (Furlenco −70% complaints); NPS +10 |
| Reconciliation & Reports (dashboard, Optimizer Single View) | /docs/payments/settlements/dashboard/ | **T4** | — | cross-PG recon, settlement recon report |
| **Thirdwatch → Magic RTO Suite** | /blog/thirdwatch-has-merged-with-magic-checkout/ | **T2** | T3 | RTO/COD fraud prediction, junk-address detection |
| **Chargeback Shield / FraudShield** | /terms/chargeback-shield/ | **T2** | — | fraud chargeback cover; **non-fraud disputes explicitly excluded = open gap** |
| Biometric Passkey | newsroom 2026-03-31 | T3 | T2 | 35% of failures are auth-related; 95% SR claim |
| RazorpayX Payouts / Business Banking+ | /x/payouts/, /x/current-accounts/ | T4 | T5 | payout SR, bulk approvals, auto-recon, low-balance alerts |
| **Vendor Payments / Source-to-Pay** | /x/vendor-payments/, /x/ap-automation/ | **T4** | T2 | OCR invoices, 3-way match, TDS, GST ITC verification, approvals |
| RazorpayX Tax Payments | /x/tax-payments/ | **T4** | T5 | TDS/TCS/GST/advance tax, challans, deadline penalties |
| RazorpayX Payroll | /payroll/ | T4 | T5 | TDS/PF/PT/ESIC filing, 300 hrs/yr saved |
| Razorpay Capital (Cash Advance, WC loans) | /capital/... | T4 | T5 | cash-flow gap; payment-history underwriting; ₹8.1tn MSME receivables lock-up |
| Razorpay POS / DigiPOS | /pos/ | T5 | T4, T2 | AI recon, self-healing devices, COD→digital 21% |
| Omnichannel Payments | /omnichannel-payments/ | T4 | T1 | unified online+offline recon/settlement/refunds |
| **Engage** | /engage/ | **T1** | T3 | offers engine, loyalty, gift cards, contextual marketing |
| **Konnect (WhatsApp)** | /konnect/ | **T1** | T3, T2 | abandoned cart recovery, order/address confirmation to cut RTO |
| Merchant of Record / International | /merchant-of-record/ | T4 | T2, T1 | multi-jurisdiction GST/VAT remittance; intl card SR 70–80% |
| **Agentic Payments (UPI Reserve Pay / Circle, MCP, Codex, ChatGPT)** | /agentic-payments/ | **T1** | T2 | makes merchants transactable by AI buyers; delegated-spend risk |
| **Agent Studio** | /agent-studio/ | **T1** | **T2, T3, T4** | its agent roster is a near 1:1 map of tracks 2–4 |
| Agentic Business Banking (Insights/Receivables/Payouts/Bookkeeping/Reporting agents) | newsroom 2026-06-01 | **T4** | T3 | cash forecasting, receivables chasing, bookkeeping |
| RAY / Ray Smart Assist | newsroom 2024-02-23 | T5 | T1 | merchant-facing support/integration assistant |
| RazorSense | /razorsense/ | T5 | — | **design language only — not a product capability** |

---

## 9. Explicit "EVIDENCE NOT FOUND" register

1. No standalone **Thirdwatch** product page today (merged into Magic Checkout).
2. No standalone **Reconciliation** product page.
3. No **Razorpay Capital** page stating total disbursement, active borrower count, or ticket-size distribution I could open directly; ₹2 Cr / ₹100 Cr figures came from search snippets, not a directly-opened page.
4. No **2025 or 2026 edition** of "The Era of Rising Fintech"; no "State of Payments" annual report.
5. **/white-papers/** did not resolve to a usable index.
6. **/agentic-business-banking/** and **/digipos/** returned navigation-only content via WebFetch.
7. **RazorpayX Payouts hero stat tiles** (success rate, reconciliation accuracy) could not be resolved — animated counters; do not quote.
8. **Konnect "1X better CTRs / 1X better reach"** — same animation artefact; do not quote.
9. **Magic Checkout and Payment Gateway landing pages publish no headline SR/conversion statistic** — all Magic numbers come from testimonials, case studies, or the MagicX blog.
10. **Chargeback Shield coverage ceiling** is left literally blank ("INR [₹]") in the published terms.
11. Feature detail for RazorpayX Escrow+, Forex, Line of Credit, Corporate Cards, Softex Filing, Import-Export Code was not retrieved this session.
12. Conflicting merchant-count claims (5,000,000+ vs 1.5 million+ vs "8M+ business network" on Engage) are unreconciled by Razorpay; do not treat any as authoritative.
