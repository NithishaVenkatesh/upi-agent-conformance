# India's Regulatory & Technical Rails for Delegated / Agent-Initiated Payments

| Field | Value |
|---|---|
| Retrieved | 2026-08-26 |
| Method | NPCI circular PDFs pulled directly from `npci.org.in/uploads/*` (Imperva-bypassed via headless browser same-origin `fetch`, then OCR-read page images); NPCI Strapi API `/api/circulars/upi`; RBI notifications + Master Directions via `rbi.org.in`; ACP PRs via `gh api`; Razorpay docs sitemap |
| Evidence class | Primary sources (NPCI operating circulars, RBI Master Directions) except where explicitly labelled otherwise |

**Reading guide.** Every capability is labelled one of:
- **GA** — generally available, shipped, usable by the public today
- **SPECCED** — a circular/spec exists and is binding on members, but rollout is limited/pilot
- **ANNOUNCED** — stated publicly, no published specification

Every rupee figure below is traced to a named circular. Where a figure could not be verified, it says `EVIDENCE NOT FOUND`.

---

## 0. The one-paragraph answer

> **An AI agent in India today can legally be authorised to spend at most ₹5,000 per transaction and ₹15,000 per month, from a single delegating user's bank account, on domestic P2M transactions only — and only as one of at most 5 delegated "IoT device / software profile" secondaries, inside NPCI's Closed User Group pilot, with every debit requiring "explicit user action".** That is UPI Circle Full Delegation as extended to software/AI profiles by NPCI circular OC-201B (8 Oct 2025). The alternative rail — UPI Autopay / e-mandate — permits far larger amounts (AFA-free up to ₹15,000, or ₹1,00,000 for insurance/mutual-fund/credit-card-bill categories) but is **not** agent-discretionary: it executes a pre-agreed merchant-specific recurring debit with a 24-hour pre-debit notification and a customer opt-out, not an agent's spending decision. There is **no third option**: RBI has issued nothing binding on AI-agent-initiated payments, and its Authentication Directions 2025 require two factors with at least one **dynamically created and unique to that transaction** — which structurally forbids an agent holding a static reusable credential.

---

## 1. UPI Circle

### 1.1 What it is — `FACT`

NPCI operating circular **NPCI/UPI/OC No.201/2024-25, dated 13 August 2024**, "Introduction of 'UPI Circle' – Delegated Payments for secondary users". Endorsed by the UPI Steering Committee meeting of 3 August 2023.

Verbatim:

> "UPI Circle is a feature where a UPI user acts as a primary to link with their trusted secondary users on their UPI App for either partial or full delegation. Primary user can authorize a trusted secondary user for performing transactions within the security protocols/ limits."

> "**Full Delegation** – Primary user authorizes a secondary user to initiate and complete UPI transactions as per defined spend limits"

> "**Partial Delegation** – Primary user authorizes initiation of payment requests from secondary users, Primary user shall complete UPI transaction with UPI PIN"

**This is the single most important distinction for agent design:**
- **Partial delegation** = the delegate can only *propose*. A human must approve each payment with a UPI PIN. Existing (full-size) UPI limits apply.
- **Full delegation** = the delegate can *execute autonomously* within limits. This is the only one that expresses bounded autonomous spend authority — and it is the one that is tightly capped.

### 1.2 LIMITS TABLE — exact figures with source per row

| # | Parameter | Exact value | Applies to | Source (circular no. + date) | URL |
|---|---|---|---|---|---|
| 1 | **Per-transaction cap** | **₹5,000** | Full delegation | OC No.201/2024-25, 13 Aug 2024, §7 — *"For full delegation, Members shall ensure a maximum monthly limit of ₹15,000/- per delegation and maximum per transaction limit of ₹5000"* | [OC 201 PDF](https://www.npci.org.in/uploads/UPI_OC_No_201_FY_24_25_Introduction_of_UPI_Circle_Delegated_Payments_for_secondary_users_cf6799f126.pdf) |
| 2 | **Monthly cap** | **₹15,000 per delegation** | Full delegation | OC No.201/2024-25, 13 Aug 2024, §7 (same sentence as above) | same |
| 3 | **Partial delegation limits** | **No special cap — "Existing UPI limits shall be applicable"** | Partial delegation | OC No.201/2024-25, 13 Aug 2024, §8 — *"Existing UPI limits shall be applicable in case of partial delegation"* | same |
| 4 | **Number of delegates** | **Up to 5 secondary users per primary**; a secondary user **can accept delegation from only one primary user** | Both | OC No.201/2024-25, 13 Aug 2024, §4 — *"A primary user can delegate to up to 5 secondary users and a secondary user can accept delegation from only one primary user"* | same |
| 5 | **Cooling period** | **First 24 hours after linking: daily transaction limit ₹5,000** | Both full and partial | OC No.201/2024-25, 13 Aug 2024, §9 — *"Members shall ensure that during the cooling period – first 24 hours, a daily transaction limit of ₹5000 shall be prescribed after successful linking of primary and their secondary user for both full and partial delegation"* | same |
| 6 | **Per-transaction cap (IoT / software / AI profile)** | **₹5,000** | IoT devices & software under Full Delegation | OC No.201B/2025-26, 8 Oct 2025, General §7 — *"Members shall ensure a maximum monthly limit of INR 15,000 per delegation and maximum per transaction limit of INR 5000 for IoT device app/software"* | [OC 201B PDF](https://www.npci.org.in/uploads/UPI_OC_No_201_B_FY_2025_26_Addendum_to_NPCI_UPI_2024_25_OC_201_Introduction_of_Io_T_devices_software_on_UPI_Circle_09ec83c893.pdf) |
| 7 | **Monthly cap (IoT / software / AI profile)** | **₹15,000 per delegation** | IoT / software | OC No.201B/2025-26, 8 Oct 2025, General §7 (same sentence) | same |
| 8 | **Cooling period (IoT / software)** | **24 hours, cumulative transaction limit ₹5,000** | IoT / software | OC No.201B/2025-26, 8 Oct 2025, General §8 — *"Members shall ensure 24 hours cooling period with cumulative transaction limit of INR 5,000/-"* | same |
| 9 | **Number of IoT/software delegates** | **Up to 5 IoT devices/software per primary UPI app**; a user can accept delegation for an IoT device/software **from only one Primary UPI App** | IoT / software | OC No.201B/2025-26, 8 Oct 2025, Primary UPI Apps §3 and Secondary Apps §6 — *"a user can authorize up to 5 IoT devices/software from primary UPI apps"* / *"a user can accept delegation for IoT device app/ software from only one Primary UPI App"* | same |
| 10 | **Auto-revocation on inactivity** | **6 months** | IoT / software | OC No.201B/2025-26, 8 Oct 2025, General §8 — *"shall auto-revoke the authorization for the IoT device app/ software if delegation is inactive for a period of 6 months or in case of any security concerns with the device such as device tampering etc."* | same |
| 11 | **Mandate lifetime / expiry (human full delegation, BHIM)** | **Minimum 1 month, maximum 5 years** | Full delegation, as implemented on BHIM | NBSL press release, 25 Nov 2025 — *"Set a monthly spending limit (up to ₹15,000) and the validity period (maximum term is 5 years while minimum is 1 month)"* | [NBSL press release PDF](https://www.npci.org.in/uploads/NBSL_Press_release_BHIM_Goes_Live_with_UPI_Circle_Full_Delegation_Enabling_Authorised_UPI_Payments_within_set_limits_7b308e643d.pdf) |
| 12 | **Transaction scope (IoT/software)** | **Domestic P2M only** | IoT / software | OC No.201B/2025-26, 8 Oct 2025, General §5 — *"Only domestic P2M transactions shall be permitted"* | [OC 201B PDF](https://www.npci.org.in/uploads/UPI_OC_No_201_B_FY_2025_26_Addendum_to_NPCI_UPI_2024_25_OC_201_Introduction_of_Io_T_devices_software_on_UPI_Circle_09ec83c893.pdf) |
| 13 | Merchant-category (MCC) restriction on a delegation | `EVIDENCE NOT FOUND` — no MCC/category-scoping control appears anywhere in OC 201, OC 201A or OC 201B. Delegation is amount-bounded and (for IoT) channel-bounded, **not** category-bounded. | — | — | — |

#### ⚠️ Unresolved discrepancy on the cooling-period figure — `FACT` that sources conflict

NPCI's **public product page** for UPI Circle (retrieved 2026-08-26) states a different first-24-hours figure than the circulars:

> "₹5,000 per transaction per device
> ₹15,000 monthly limit per device
> **₹2,000 limit for the first 24 hours after linking a new device**
> Maximum of 5 secondary devices/ software (IoT) can be linked"
> — <https://www.npci.org.in/product/upi-circle>

The circulars (OC 201 §9 and OC 201B §8) both say **₹5,000** for the first 24 hours. The product page says **₹2,000** (for IoT devices). `INFERENCE`: the product page may reflect a later tightening for the IoT/software track communicated outside a public circular, or it may be a product-page error. **Do not rely on either figure alone for a design; treat the first-24-hour window as ₹2,000–₹5,000 and design as if it is ₹2,000.** Per-transaction (₹5,000) and monthly (₹15,000) figures are consistent across all three sources and are safe.

### 1.3 Who can be a delegate — the constraint that actually blocks AI agents — `FACT`

**NPCI/UPI/OC/201A/2025-26, dated 8 July 2025**, "Full Delegation Additional Requirements", narrows Full Delegation to named human relationships:

> "1. Primary User via the Primary Payer PSP shall identify that the Secondary User to whom the delegation is being provided is from specific segments – viz., **a family member (Child/ Parent/ Spouse/ Sibling/ Other Family Member) or Domestic or Small Business Employee**"

> "3. Issuer Bank of the Primary User shall identify the Secondary User at the time of delegation by way of name, mobile number and ID number of an **Officially Valid Document as defined under Master Direction Know Your Customer (KYC) Direction, 2016**"

Compliance deadline for members already live on UPI Circle: **31 August 2025**.

**`INFERENCE` (high confidence): an AI agent cannot be a Full Delegation secondary user under the human track.** It is not a family member or an employee and cannot present an Officially Valid Document. This is precisely why NPCI created a *separate* track three months later.

### 1.4 The AI-agent track: OC-201B — `SPECCED`, pilot only

**NPCI/UPI/OC-201B/2025-26, dated 8 October 2025**, "Addendum to NPCI/UPI/2024-25/OC 201 – Introduction of IoT devices & software on UPI Circle". This is the actual regulatory basis for agentic UPI payments in India.

> "UPI Circle is now extended to IoT (Internet of Things) devices & software profiles wherein a UPI user can link and delegate payments to their IoTs Devices & Software profiles like Smart glasses, watch, TV, **AI Profiles** (initially for limited users in CUG), etc. under the **'Full Delegation'** framework as per defined monthly limits and security guidelines. It may be noted that **debit transactions using IoT shall be only initiated by explicit user action.**"

NPCI's own product page confirms both the AI use case and the pilot status:

> "For e.g., User can make payments directly through their trusted devices or software such as … D. **buy groceries/goods from AI chatbots**, etc."
> "**Note: Currently AI/Software driven IoT Payments are under pilot with limited users as a part of Closed User Group.**"
> — <https://www.npci.org.in/product/upi-circle>

**The binding constraints on the AI track, verbatim from OC-201B:**

| Constraint | Text |
|---|---|
| Explicit user action | *"debit transactions using IoT shall be only initiated by explicit user action"* |
| Domestic P2M only | *"Only domestic P2M transactions shall be permitted"* |
| Proximity at linking | *"At the time of linking, the primary and secondary devices shall be in close proximity"* |
| NPCI allow-list | *"Members shall ensure that only NPCI permitted IoT devices/software are allowed to be linked as secondary"* |
| Paid software only, CUG | *"it shall be ensured that only paid software profiles be allowed on this functionality. It should be noted that this feature shall be allowed for limited users to begin with and post the validations, the opening up to the complete user base shall be communicated."* |
| 2FA consent at linking | *"Primary UPI Apps shall clearly display the secondary device/software details and capture the user consent for linking and authorizing the device/software with 2 Factor Authentication."* |
| Secondary PSP due diligence | *"Secondary PSP Bank shall onboard the IoT device app/ software after completing the necessary due diligence and app security evaluation."* |
| Per-transaction validation | *"Issuer Banks shall validate device id/user id and requisite authorization details for every transaction before debiting the account for payment."* |
| Settlement identifier | *"A new purpose code '**BH**' is introduced in the existing UPI raw file to identify these transactions and settlements respectively."* |
| No exclusive tie-ups | *"It shall not create any exclusive tie-up with a particular secondary UPI App(s)."* |

**`INFERENCE` (high confidence), and this is the crux for a system design:** *"debit transactions using IoT shall be only initiated by explicit user action"* means the currently-permitted design is **agent-as-executor with a per-purchase human trigger**, not **agent-as-autonomous-buyer**. Full Delegation removes the *UPI PIN* from each transaction; OC-201B does **not** remove the *user action* from each transaction. An architecture that has an agent buy things unattended overnight is outside what OC-201B authorises today, regardless of whether it stays under ₹5,000.

### 1.5 Revocation, lifecycle, and AFA — `FACT`

| Mechanism | Requirement | Source |
|---|---|---|
| Limit management + delinking | *"Primary UPI Apps shall provide lifecycle management (limit management and delinking) and transaction history for the transactions made under the IoT devices/software."* | OC 201B, Primary UPI Apps §2 |
| Primary-side limit control | *"Members shall ensure limits control to be available for the primary to set usage controls over their secondary users"* | OC 201 §6 |
| Auto-revoke | Inactivity 6 months, or device tampering / security concern | OC 201B General §8 |
| Visibility | *"Members shall ensure that the Primary user have visibility of transactions performed by secondary users on their UPI App and bank account statement"* | OC 201 §10 |
| Secondary-user auth | *"UPI Apps shall ensure App passcode/ biometrics (finger/face), etc. mandatory for all secondary users"* | OC 201 §2 |
| Linking auth | Full delegation authorised by primary via **UPI PIN** (BHIM flow); IoT linking requires **2FA** + OTP on primary's registered mobile | NBSL press release; OC 201B |
| Detailed revocation TAT / API | `EVIDENCE NOT FOUND` — OC 201 §"Members are advised to refer to **UPI Circle Procedural Guidelines** for detailed information." The Procedural Guidelines are **members-only and not public.** | OC 201 |

**Who authenticates what, when — `INFERENCE` from the above, high confidence:**
1. **At delegation:** primary user authenticates with UPI PIN (+ 2FA / OTP for IoT), issuer bank KYC-identifies the secondary (human track), secondary PSP takes explicit consent.
2. **At each transaction under Full Delegation:** **no UPI PIN**. Issuer validates device id / user id / authorization details. Secondary user's app passcode or biometric gates app access.
3. **At each transaction under Partial Delegation:** primary user enters UPI PIN. Every time.

### 1.6 Who has shipped it — `FACT` (with a currency caveat)

NPCI's UPI Circle live-member asset list (recovered from Wayback CDX snapshots of `npci.org.in/images/npci/upi-circle/liveBanks/`, timestamps **2024-12-08 through 2025-05-27**) names 40 live members:

> Airtel Payments Bank, **Amazon Pay**, AU Small Finance, Axis, Bharat Co-op, **BHIM**, BoB, Canara, CBI, Cosmos, CUB, DCB, Dhanlaxmi, Federal, Fino, **Google Pay**, HDFC, ICICI, IDBI, IDFC, Indian, IndusInd, IOB, Janta, Karnataka, Karnataka Grameen, Kerala Gramin, **PhonePe**, PNB, RBL, Saraswat, SBI, SIB, Suroday, SVC, TJSB, TMB, UCO, Union, YES

Notably, **Google Pay and Amazon Pay assets first appear 2025-05-27**, later than the 2024-12-08 batch — `INFERENCE`: they went live on UPI Circle around mid-2025.

- **BHIM Full Delegation went live 25 November 2025** (BHIM Payments App v4.0.10) — `FACT`, NBSL press release. Note this is *Full* Delegation specifically; partial delegation shipped earlier.
- **Paytm:** `EVIDENCE NOT FOUND` in the recovered live-member list.
- **Caveat:** this list is from snapshots up to May 2025 and is not necessarily current as of Aug 2026. `GA` status applies to **human** UPI Circle. The **AI/software** track is explicitly **CUG pilot, not GA**.

---

## 2. NPCI UAP

### 2.1 Real name — `FACT` (but press-sourced, not NPCI-sourced)

**UAP = "Unified Agent Protocol".**

Single origin: **Business Standard, 9 July 2026** (Ajinkya Kawale), sourced to four people speaking on condition of anonymity:

> "The proposed new standard for artificial intelligence (AI)-led agentic payments, a **Unified Agent Protocol (UAP)**, could place the country among the first to build national infrastructure for agentic payments, said the persons, who spoke on condition anonymity. Work is underway at the National Payments Corporation of India (NPCI) to develop the proposed UAP in consultation with the industry, they said."

Design intent, same article:

> "The proposed protocol is being designed to create a trusted, common, interoperable infrastructure through which AI agents can be **registered, verified, and authorised** to transact across the UPI ecosystem **without changing the underlying rails** of the payments system."

<https://www.business-standard.com/finance/news/india-may-allow-agentic-ai-led-upi-transactions-under-new-npci-protocol-126070801343_1.html>

Corroboration is **derivative only** — MediaNama (10 Jul 2026) explicitly cites the Business Standard report. ~10 outlets ran the story the same day; all are rewrites of the one scoop. ABP Live's own headline hedges: *"NPCI's **Reported** Plan Explained."*

**Refuted expansions — `FACT`:** "Unified Agentic Protocol", "Universal Agentic Protocol", "UPI Agent Protocol", "UPI Agentic Payments", "Unified Agent **Payments**" — zero hits in any fetched source. Note: a peer Buildathon repo writes "Unified Agent Payments"; that is a **guess, and it is wrong**.

### 2.2 Status: weaker than ANNOUNCED — `FACT`

**Label: REPORTED / IN DEVELOPMENT.** NPCI has not officially announced UAP, let alone published a specification.

- **No specification exists publicly** — no URL, no repo, no PDF, no `github.com/npci` org.
- **No NPCI circular mentions it.** The full NPCI UPI circular index for FY 2026-27 (17 circulars, latest ~Aug 2026) and FY 2025-26 (41 circulars) was enumerated via NPCI's own `/api/circulars/upi` endpoint and grepped for `agent|AI|UAP|protocol|delegat|autopay|autonom`. **Zero UAP hits.**
- **No NPCI web page mentions it.** Wayback CDX over `npci.org.in*` filtered for `agent|agentic|UAP` returned only unrelated BBPS "live-agent-institutions" URLs.
- **No NPCI press release** — the Strapi API exposes no press-release endpoint.
- The only AI-in-UPI circular is **OC No. 227 / FY 2025-26, "Introduction of 'UPI HELP' – a pilot an AI powered support for UPI payments"** — AI *customer support*, not AI *payment initiation*.

⚠️ **Source-class warning:** every GitHub hit for "NPCI UAP" is a *Razorpay AI Buildathon submission* — i.e. other entrants in this same competition. That is circular evidence and must be discarded.

**Timeline:** BS breaks it 9 Jul 2026 → MediaNama 10 Jul → NDTV Profit 22 Jul → Storyboard18 31 Jul → **nothing since**. As of 26 Aug 2026 the story is ~4 weeks cold. GFF 2026 (early Oct) has not yet happened and is the plausible venue for a formal announcement.

**Pilot participants: `EVIDENCE NOT FOUND`.** No banks, PSPs, or apps named anywhere.

### 2.3 Relationship to UPI Circle — `INFERENCE`, high confidence

UAP is intended to sit **above** UPI Circle — an agent registry / identity / authorisation layer — not to replace it. Supported by (a) BS's *"without changing the underlying rails"*, and (b) the fact that the real shipped pilots ride on UPI Circle (§2.5).

### 2.4 Relationship to Google AP2 — `REFUTED`

- AP2's README (`gh api repos/google-agentic-commerce/AP2/readme`) contains **zero** occurrences of UPI, NPCI, India, or UAP.
- `ap2-protocol.org` mentions UPI exactly once, as roadmap aspiration: *"The roadmap includes e-wallets, 'push' payments such as real-time bank transfers (e.g., **UPI** and PIX), and digital currencies."*
- **There is no NPCI–AP2 relationship.**

**"NPCI + Google Cloud tie-up": `EVIDENCE NOT FOUND` — do not put this in a pitch.** `HYPOTHESIS`: it is a conflation of the **NPCI–NVIDIA** sovereign-AI infrastructure deal (18 Feb 2026, multiple outlets) with Google's separate India AI/Cloud push.

### 2.5 What is actually shipped — and this is the most useful finding here — `FACT` (press)

NPCI *is* doing agentic payments — through **partnerships intermediated by Razorpay**, riding on UPI Circle, not through a published protocol:

| Date | Event | Detail |
|---|---|---|
| **8–9 Oct 2025 (GFF 2025)** | **Razorpay + NPCI + OpenAI** agentic payments pilot on **ChatGPT** | Inc42: *"Powered by Razorpay's banking partners, **Axis Bank and Airtel Payments Bank**, and built on UPI innovations such as **UPI Circle and UPI Reserve Pay** … **BigBasket** is among the first merchants."* Status: **PILOT** |
| **20 Feb 2026** | **Razorpay + NPCI** agentic UPI payments on **Anthropic's Claude**, at the India AI Impact Summit | Live merchants: **Zomato, Swiggy, Zepto**. Status: **LAUNCHED** for those merchants. (Headlines corroborated across Entrackr / Business Today / AnalyticsIndiaMag; article bodies paywalled) |
| **18 Feb 2026** | NPCI + **NVIDIA** sovereign-AI infrastructure tie-up | Multiple outlets |

`INFERENCE` (high confidence): **UPI Circle + UPI Reserve Pay is the actual production substrate for agentic UPI payments in India today.** This is exactly the CUG pilot that OC-201B describes. It also means Razorpay's ACP SEP #216 is trying to standardise, in a global protocol, a capability its own company already runs privately with NPCI.

### 2.6 Regulatory headwind — `FACT` (press)

**MediaNama, 16 Jul 2026: "MeitY proposes mandatory human-in-the-loop interventions in agentic AI payments."** (Headline confirmed; body not fetched.) `INFERENCE`: this cuts directly against full autonomy and converges with OC-201B's *"explicit user action"* clause and FREE-AI para 4.4.49.

### 2.7 Competitive context — `FACT` (press)

- **Pine Labs launched P3P**, its own agentic payments protocol (MediaNama, Jun 2026).
- **Cashfree** launched an agentic-payments MCP at GFF 2025.
- NPCI CEO Dilip Asbe's public AI remarks (May–Jun 2026) emphasise **fraud detection, onboarding, and credit** — *not* agents spending money.

> **For the pitch:** reference UAP as *directional* — "NPCI is **reported** to be developing a Unified Agent Protocol" — and never as something you conform to. Anyone claiming "UAP compliance" is fabricating. Build on UPI Circle / OC-201B / UPI Reserve Pay, which are real and specced.

---

## 3. UPI Autopay / e-mandate

### 3.1 The governing law changed in April 2026 — `FACT`, and this is easy to get wrong

The entire 2019–2024 chain of e-mandate circulars was **repealed and consolidated** into a Master Direction:

> **RBI/DPSS/2026-27/396, RBI/CO.DPSS.POLC.No.S56/02.14.003/2026-27 — "Digital Payments – E-mandate Framework, 2026", dated 21 April 2026**, effective immediately.
> <https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13374>

It "consolidates all circulars pertaining to e-mandates". **Anything citing the 2019/2020/2021/2022/2023 circulars as live law is out of date.** Scope, verbatim: *"applicable to all Payment System Providers and Payment System Participants in respect of processing of recurring transactions, domestic or cross-border, using cards / PPI / UPI."* → **UPI Autopay is governed by exactly these limits; there is no separate RBI number for UPI Autopay.**

### 3.2 AFA threshold — current and historical

| Version | AFA-free ceiling | Date | Circular | Status |
|---|---|---|---|---|
| **CURRENT** | **₹15,000** general; **₹1,00,000** for insurance premiums / mutual fund subscriptions / credit card bills | **21 Apr 2026** | E-mandate Framework, 2026 (RBI/DPSS/2026-27/396) — *"(a) All recurring transactions may be authorised without AFA up to ₹15,000/- per transaction. Transactions above this amount shall be subject to AFA. (b) Payment of insurance premiums, subscription to mutual funds, and credit card bill payments may be made without AFA up to ₹1,00,000/- per transaction."* | **In force** |
| v5 | ₹1,00,000 (3 categories) | 12 Dec 2023 | RBI/2023-2024/88, CO.DPSS.POLC.No.S-882/02.14.003/2023-24 | Repealed 2026 |
| v4 | ₹15,000 | 16 Jun 2022 | RBI/2022-23/73, CO.DPSS.POLC.No.S-518/02.14.003/2022-23 | Repealed 2026 |
| v3 | ₹5,000 (w.e.f. 1 Jan 2021) | 4 Dec 2020 | RBI/2020-21/74, DPSS.CO.PD No.754/02.14.003/2020-21 | Repealed 2026 |
| v2 | extends framework to UPI (no new number) | 10 Jan 2020 | RBI/2019-20/139, DPSS.CO.PD No.1324/02.23.001/2019-20 | Repealed 2026 |
| v1 | ₹2,000 | 21 Aug 2019 | RBI/2019-20/47, DPSS.CO.PD.No.447/02.14.003/2019-20 | Repealed 2026 |

**NPCI's implementing circulars (the UPI-side mirror) — `FACT`:**

| NPCI circular | Date | What it set | URL |
|---|---|---|---|
| **NPCI/UPI/OC No. 151/2022-23** | 23 Jun 2022 | *"UPI AUTOPAY AFA (viz. UPI PIN) limit has been enhanced from ₹5,000/- to ₹15,000/- per transaction, with immediate effect."* … *"Payer Apps shall capture UPI PIN as an AFA, if the UPI AUTOPAY execution amount is more than ₹15,000/-, whereas process the execution without AFA for the transaction amount less than or equal to ₹15,000/-."* Cites RBI 16 Jun 2022. | [OC 151](https://www.npci.org.in/uploads/OC_151_UPI_AUTOPAY_AFA_limit_enhancement_and_compliance_69994c07fd.pdf) |
| **NPCI/UPI/OC-151A/2023-24** | 14 Dec 2023 | *"UPI AutoPay Additional Factor of Authentication (AFA) (viz. UPI PIN) limit has been relaxed from ₹15,000/- to ₹1,00,000/- for the Merchant Category Codes (MCC) mentioned in Annexure A"*. Adds: *"Issuer Banks shall validate Digital Signature (DS) and UPI PIN for execution amount more than ₹1,00,000/-. For execution amount less than or equal to ₹1,00,000/-, Issuer Bank shall process the execution basis the DS only."* And: *"AFA shall not be required for the 1st execution happening immediately (within 5 mins) of mandate creation for amount less than or equal to ₹1,00,000/-"* | [OC 151A](https://www.npci.org.in/uploads/UPI_OC_151_A_Enhancement_of_Limits_for_UPI_Auto_Pay_4ad9596240.pdf) |
| **NPCI/UPI/OC-223/2025-26** | 7 Oct 2025 | *"Enhancement of UPI Autopay"* — mandate **portability** between UPI apps, cross-app mandate viewing, Merchant Identifier Code (MIC) mandatory for purpose code 'AZ'. *"'Port Mandate' can be done only once in a rolling 90-day period."* *"All payer-initiated UPI Autopay operations, as per existing guidelines, shall require UPI PIN."* | [OC 223](https://www.npci.org.in/uploads/UPI_OC_No_223_FY_2025_26_Enhancement_of_UPI_Autopay_88b38535cb.pdf) |

`FACT`: UPI Autopay launched **22 July 2020** (OC 151 states *"UPI AUTOPAY (referred to as e-mandate for recurring payments) was launched on 22nd July 2020"*).

### 3.3 Pre-debit notification — `FACT`, verbatim from the current Master Direction

> **"6. Pre-transaction Notification**
> (a) An issuer shall send a pre-transaction notification to the customer, **at least 24 hours prior to the actual charge / debit**.
> (b) The pre-transaction notification shall, at the minimum, inform the customer about the **merchant's name, transaction amount, date / time of debit, reference number of e-mandate, reason for debit**, i.e., e-mandate registered by the customer.
> (c) The issuer shall provider a customer with a facility to **opt-out of any particular transaction or the e-mandate**. Any such opt-out shall be validated by the issuer using AFA. An intimation to this effect shall be sent to the customer.
> (d) Pre-transaction notification is **not required for e-mandates registered to auto-replenish balances of FASTag, and National Common Mobility Card (NCMC)**."

Channel choice (para 4(d)): *"The customer shall be given a facility to choose or change a mode among available options (SMS, email, etc.)"*.

Note it is **24 hours**, not days. Also from the 2026 MD: *"The first transaction under an e-mandate shall require AFA validation."* And a notable new clause: *"Payments under e-mandates shall not be subject to any other limits / controls set by the customer."*

NPCI adds a both-sides notification duty (OC 151A §4): *"It is mandatory for the PSP to notify the user before and after execution of any mandate via push notification, and Issuer Bank to notify the user via SMS before and after execution."*

The 2026 MD also **drops** the 2019 pipeline-transaction carve-out on withdrawal, and **adds** a grievance-redressal requirement to the post-transaction notification (§7, footnoted *"added, based on feedback"*).

### 3.3a Two ceilings bind every UPI Autopay debit — `FACT`

RBI **delegated UPI transaction limit-setting to NPCI** on 9 April 2025. Statement on Developmental and Regulatory Policies, item 5 "Enhancing transaction limits in UPI" (<https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=60178>):

> "At present, the transaction amount for UPI, covering both Person to Person (P2P) and Person to Merchant payments (P2M), is capped at **₹1 lakh** except for specific use cases of P2M payments which have higher limits, some at **₹2 lakh** and others at **₹5 lakh**.
> To enable the ecosystem to respond efficiently to new use cases, it is proposed that **NPCI, in consultation with banks and other stakeholders of the UPI ecosystem, may announce and revise such limits** based on evolving user needs. … Banks shall continue to have the discretion to decide their own internal limits within the limits announced by NPCI.
> **P2P transactions on UPI shall continue to be capped at ₹1 lakh**, as hitherto."

`INFERENCE` (high confidence): **two independent ceilings apply to any UPI Autopay debit** — (1) the RBI **AFA-free** ceiling (₹15,000 / ₹1,00,000), and (2) the **NPCI-set P2M value cap** (₹1–5 lakh depending on use case). The AFA ceiling is the binding one for agent design because it governs whether a human must re-authenticate. Current NPCI-published per-use-case P2M caps: `EVIDENCE NOT FOUND` (not located in the public circular corpus).

### 3.4 Decline codes / retry behaviour — partially found

| Item | Status |
|---|---|
| Dishonour due to insufficient funds | `SPECCED` — **NPCI UPI OC 125**, "Dishonor of UPI AutoPay transaction due to insufficiency of funds" ([PDF](https://www.npci.org.in/uploads/UPI_OC_125_Dishonor_of_UPI_Auto_Pay_transaction_due_to_insufficiency_of_funds_1b73d1b7c8.pdf)) |
| Non-revocation for loan/EMI category | `SPECCED` — **NPCI OC 125A**, "Non-revocation of UPI AUTOPAY mandate for loan repayment & EMI collection category" ([PDF](https://www.npci.org.in/uploads/OC_125_A_Addendum_to_OC_125_Non_revocation_of_UPI_AUTOPAY_mandate_for_loan_repayment_and_EMI_collection_category_37b2c92c41.pdf)) — **relevant**: a user cannot unilaterally revoke a mandate in this category |
| Deemed-debit response codes | `SPECCED` — **NPCI UPI OC 128** and **OC-128A (FY 26-27)**, "Extension of additional response codes under Deemed Debit for mandate execution" |
| Exact decline-code table & retry counts | `EVIDENCE NOT FOUND` — the specific code values live in the UPI Technical Specification / Procedural Guidelines, which are members-only |

### 3.5 2025–2026 changes

- **OC 223 (7 Oct 2025)** — mandate portability, MIC. `SPECCED`.
- **E-mandate Framework, 2026 (21 Apr 2026)** — consolidation; limits unchanged at ₹15,000 / ₹1,00,000. **In force.**
- `INFERENCE` (high confidence): ₹15,000 / ₹1,00,000 remain current and unamended as of 26 Aug 2026 — the Master Direction index shows no "(Updated as on …)" suffix and the pending-drafts page shows no e-mandate draft.

---

## 4. RBI's position on agent-initiated / autonomous payments

### 4.1 The binding position: nothing — `FACT` (a well-evidenced negative)

**As of 26 August 2026 the RBI has issued no circular, Direction, or Master Direction on AI-agent-initiated or autonomous payments.** Evidence for this negative:

1. Title sweep of every RBI notification `Id=12750 → 13690` (bracketing Jul 2024 → Aug 2026): **zero titles containing "Artificial" or "AI"**.
2. Master Directions index: zero occurrences of "artificial"; the Payment & Settlement System section holds 9 MDs, none AI-related.
3. **Payments Vision 2028** (issued 27 Mar 2026): its 15 "Specific Initiatives" contain **no agentic/autonomous payments item**. AI appears only as framing — *"an AI-led, data-driven approach to payments"* — and as a data-query interface for RBI itself.
4. RBI Annual Report 2025-26 payments chapter: no agentic payments mention.
5. Two flagship 2026 AI speeches — Governor Sanjay Malhotra, *"Winning in the AI Era"* (FIBAC, 11 Aug 2026) and DG Shirish Chandra Murmu, *"A Vision for Responsible AI, Resilient Banking"* (19 Aug 2026) — contain **zero occurrences of "agentic", "AI agent", "autonomous" or "initiate"**.

**Caveat on this negative:** the notification sweep was title-only. A circular discussing AI under a non-AI title would not be caught.

### 4.2 The real constraint: Authentication Directions 2025 — `FACT`, in force

> **RBI/2025-26/79, CO.DPSS.POLC.No. S 668/02-14-015/2025-2026 — "Authentication mechanisms for digital payment transactions", 25 September 2025**, compliance by **1 April 2026**.
> <https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12898>

> "All digital payment transactions shall be authenticated by at least two distinct factors of authentication … unless exempted."
> "for digital payment transactions, other than card present transactions, **at least one of the factors of authentication is dynamically created or proven, i.e., the proof of possession of the factor, being sent as part of the transaction, is unique to that transaction**."
> Liability: "If any loss arises out of transactions effected without complying with these directions, **the issuer shall compensate the customer for the loss in full without demur**."
> Annexure-1, standing exemption #2: "**Recurring transactions (other than the first) under the e-mandate framework**."

**`INFERENCE` — this is the single most design-relevant rule in the whole corpus:** an AI agent holding a **static, reusable** payment credential cannot lawfully authenticate a payment in India. One factor must be **freshly minted and bound to that specific transaction**. This is exactly why Razorpay's SEP #216 is built around a *"fresh one-time `upi_circle_cryptogram` … before each `complete_checkout_session` call"* rather than a stored token — the per-transaction cryptogram is the dynamic factor. Any design that stores a long-lived agent credential and replays it is not merely bad practice; it fails the Directions and shifts full liability to the issuer.

The only lawful paths today are therefore: (a) **e-mandate** (AFA once at registration + first transaction, then AFA-free within limits under the standing exemption), or (b) **UPI Circle Full Delegation** (per-transaction issuer validation of device id / authorization details in lieu of PIN).

### 4.3 What does exist: the FREE-AI report — `SPECCED`, advisory only, not binding

Committee constituted 26 Dec 2024 (chair: Dr. Pushpak Bhattacharyya, IIT Bombay); report released **13 August 2025** — "7 Sutras" + 26 recommendations under six pillars. NPCI deposed 5 Feb 2025.

The single passage on AI executing payments (**para 4.4.49**), verbatim:

> "Emerging developments in AI have given rise to increasingly autonomous systems that allow AI applications to independently execute tasks that would otherwise have required human involvement. When these systems are tasked with financial functions such as investment decisions, loan processing, **or payment execution**, they are able to operate with access to real-world customer assets like bank accounts or financial data. … **REs must use autonomous AI only after establishing clear safeguards and accountability frameworks**, supported by well-defined testing protocols and standard operating procedures (SoPs). Consumers should be made to fully understand the consequences before being allowed to use such tools. While exceptions may be considered for the use of autonomous AI in routine or low-risk tasks, **human oversight remains a critical factor in medium-risk to high-risk tasks**. … **REs must remain liable for the actions and outcomes of the autonomous AI systems they deploy.**"

Closest thing to agentic commerce (**para 2.1.8**):

> "Emerging protocols such as **Model Context Protocol (MCP) and Agent-to-Agent (A2A)** communication frameworks can facilitate an interoperable and collaborative agent ecosystem. … AI agents representing an SME borrower could interact with multiple AI-enabled lenders to obtain loan offers, perform comparative analysis, and **execute transactions in real time**."

- "**Agentic commerce**" as a term: `EVIDENCE NOT FOUND` in the report.
- There is **no** limit, mandate, authentication requirement, or consent architecture specific to AI-agent payment initiation.
- Recommendation 2 proposes an **AI Innovation Sandbox**, explicitly *"without any regulatory relaxations"*. **It has not launched** — the sandbox cohort table below shows no AI cohort.
- Governor Malhotra (11 Aug 2026) referred to *"the FREE-AI Committee's recommendations and draft guidelines on Model Risk Management"* — `ANNOUNCED`, still draft.

**FREE-AI adoption status — `FACT`, and it is decisive.** RBI Annual Report 2025-26 (released 29 May 2026), Ch. VI:

> "…the FREE-AI Committee … submitted its report on August 13, 2025. The Department **is undertaking an assessment of the Committee's report and recommendations, which will help in formulation of more specific guidance** for the entities in the financial sector."

> "The draft Directions on model risk management, applicable to all models including those using artificial intelligence (AI)/machine learning (ML), while also duly incorporating recommendations of the FREE-AI Committee, are **under final stages of completion**."

→ **Not even a draft published as of Aug 2026.** The live RBI Draft Notifications/Guidelines page (fetched 26 Aug 2026) shows no AI, e-mandate, or tokenisation draft pending.

**Regulatory Sandbox cohorts — `FACT`, no AI cohort exists.** RBI Annual Report 2025-26, Table VI.1 (as on 31 March 2026):

| Cohort | Theme | Applications | Shortlisted | Exited |
|---|---|---|---|---|
| 1 | Retail Payments | 32 | 6 | 6 |
| 2 | Cross-border Payments | 27 | 8 | 4 |
| 3 | MSME Lending | 22 | 8 | 5 |
| 4 | Prevention and Mitigation of Financial Frauds | 9 | 6 | 3 |
| 5 | Theme Neutral | 22 | 5 | 1 |
| On Tap | Closed Cohort Themes | 22 | 4 | 2 |

"On Tap" was expanded to accept Theme-Neutral applications (PR 9 Apr 2025, prid=60190). Separately, RBI announced a **CBDC and Asset Tokenisation (CAT) Sandbox** at Global Fintech Fest 2025 — CBDC/tokenisation, **not** agentic payments. FREE-AI's recommended "AI Innovation Sandbox" is a recommendation only; **no such cohort exists.**

**Governance note — `FACT`:** BPSS was replaced by the **Payments Regulatory Board (PRB)** from 9 May 2025; first PRB meeting 5 Jan 2026.

---

## 5. CoFT / Token HQ

### 5.1 RBI CoFT circular chain — `FACT`, in force (no Master Direction consolidates it)

| Circular | Date | Key mandate |
|---|---|---|
| RBI/2018-19/103, DPSS.CO.PD No.1463/02.14.003/2018-19 | **8 Jan 2019** | Permits card networks to offer tokenisation to token requestors. *"Token requestors shall not store PAN or any other card detail."* Token unique per **card + token requestor + device**. |
| RBI/2021-22/92, CO.DPSS.POLC.No.S-469/02-14-003/2021-22 | **25 Aug 2021** | Extends tokenisation scope to *"laptops, desktops, wearables (wrist watches, bands, etc.), **Internet of Things (IoT) devices**, etc."* |
| RBI/2021-22/96, CO.DPSS.POLC.No.S-516/02-14-003/2021-22 | **7 Sep 2021** | **The CoFT mandate.** *"Permit card issuers to offer card tokenisation services as **Token Service Providers (TSPs)**… Tokenisation of card data shall be done with explicit customer consent requiring AFA validation by card issuer."* *"With effect from January 1, 2022, no entity in the card transaction / payment chain, other than the card issuers and / or card networks, shall store the actual card data."* CoF token unique per **card + token requestor + merchant**. |
| RBI/2021-2022/142, CO.DPSS.POLC.No.S-1211/02-14-003/2021-22 | **23 Dec 2021** | Deadline extended to **30 Jun 2022** |
| RBI/2022-23/77, CO.DPSS.POLC.No.S-567/02-14-003/2022-23 | **24 Jun 2022** | Deadline extended to **30 Sep 2022** |
| RBI/2022-2023/95, CO.DPSS.POLC.No.S-760/02-14-003/2022-23 | **28 Jul 2022** | No further change to effective date; purge before **1 Oct 2022**. Merchant/PA may retain CoF data max **T+4 days**; acquiring banks until **31 Jan 2023**. |
| RBI/2023-24/91, CO.DPSS.POLC.No.S-919/02-14-003/2023-24 | **20 Dec 2023** | **CoFTA** — tokenisation directly through card issuing banks, via mobile/internet banking. *"only on explicit customer consent, and with AFA validation. If the cardholder selects multiple merchants… AFA validation may be combined for all these merchants."* |

**Corrections to common priors — `FACT`:** there is **no** Aug 2019 tokenisation circular (the device-scope extension is 25 Aug 2021) and **no** Oct 2022 CoFT circular. The CoFTA circular is dated **20 Dec 2023**, not 23 Dec.

**"TSP" in RBI's vocabulary means Token Service Provider** — a card-tokenisation role held by card issuers/networks. `INFERENCE` (high confidence): this is the term Razorpay's SEP #216 is borrowing when it says "Razorpay TSP", extended by analogy to a UPI cryptogram issuer. **RBI's TSP construct is card-specific and does not, in the published circulars, cover UPI.**

### 5.2 Razorpay Token HQ — `GA`, real and documented

Token HQ is a genuine, publicly documented Razorpay product surface with 25+ doc pages:

- <https://razorpay.com/docs/payments/payment-methods/cards/token-hq>
- Sub-surfaces: `razorpay-requestor`, `merchant-requestor`, `merchant-requestor-with-network-tokens`, `razorpay-requestor-with-network-tokens`, `push-tokenisation`, `dual-token`
- Each with `apis`, `token-lifecycle`, `webhooks`, `iin-validation`, `cvv-less-flow`, `guest-checkout-apis`, `alt-id-checkout`

This is `GA` and is the real CoFT-compliance product SEP #218 refers to.

---

## 6. Razorpay TSP

### 6.1 Verdict: not a public product surface — `FACT` (evidenced negative)

I pulled Razorpay's complete public documentation URL list (`https://razorpay.com/docs/build/sitemap/razorpay/IN/urls.txt`, **2,282 URLs**, retrieved 2026-08-26) and searched it:

| Term | Occurrences in 2,282 doc URLs |
|---|---|
| `tsp` | **0** |
| `circle` | **0** |
| `delegat` | **0** |
| `cryptogram` | **0** |
| `agentic` | **0** |
| `acp` | **0** |

**Both reference URLs cited in SEP #216 are broken — `FACT`:**

> SEP #216 "Reference" section: *"Razorpay UPI Circle Docs: https://razorpay.com/docs/payments/upi-circle"* → **HTTP 404** (verified 2026-08-26; also absent from the sitemap).
> *"NPCI UPI Circle Spec: https://www.npci.org.in/what-we-do/upi/upi-circle-spec"* → not a real NPCI route; NPCI's actual product page is `/product/upi-circle`. NPCI's site is a Next.js SPA that returns HTTP 200 for arbitrary paths, so a 200 here is not evidence of existence. `INFERENCE`: this URL does not resolve to a real spec.

**Conclusion — `INFERENCE`, high confidence:** "Razorpay TSP" is **internal-only or aspirational**. There is no public API, no documentation, no sandbox. A hackathon submission **cannot integrate against it** and must not claim to.

### 6.2 What Razorpay *does* publicly expose that is relevant — `GA`

| Surface | Docs |
|---|---|
| **TPAP Pro** — Razorpay operates as a UPI Third-Party App Provider with a full API surface: customer onboarding, `bind-device`, `create-vpa`, `set-reset-upi-pin`, `get-npci-token`, `mandate-flow`, `payments-flow`, `fundsource-lite`, `upi-number`, `complaints-flow` | `razorpay.com/docs/payments/tpap-pro`, `razorpay.com/docs/api/payments/tpap-pro/*` |
| **Recurring payments over UPI** (UPI Autopay) — `create-authorization-transaction`, `create-subsequent-payments`, `tokens`, plus UPI-OTM, UPI-TPV, **UPI Reserve Pay** variants | `razorpay.com/docs/payments/recurring-payments/upi` |
| **Razorpay MCP Server** — documented, with integrations for ChatGPT, Claude, Cursor, Gemini CLI, Replit, VS Code, Windsurf; `tools-reference`, `oauth`, `local`, `remote` | `razorpay.com/docs/mcp-server` |
| **Token HQ** (CoFT) | see §5.2 |

`INFERENCE`: **TPAP Pro + UPI Autopay + MCP Server is the buildable Razorpay surface.** UPI Circle is not.

### 6.3 What SEP #216 claims, checked against NPCI — `FACT`

SEP #216 (PR opened 2026-04-12, still open, no TSC sponsor) says:

> "Unlike the existing card-based `DelegatePaymentRequest` … UPI Circle uses a **cryptogram-based delegation model**: users authorize a mandate once, and the platform fetches a fresh one-time `upi_circle_cryptogram` from Razorpay TSP before each `complete_checkout_session` call."

**Three discrepancies against the NPCI circulars — these matter for a design:**

| SEP #216 claim | NPCI reality | Verdict |
|---|---|---|
| *"**Why ₹15,000 Limit?** NPCI's UPI Circle specification imposes a hard **per-transaction** limit."* | ₹15,000 is the **monthly per-delegation** cap. The **per-transaction** cap is **₹5,000** (OC 201 §7). | **SEP is wrong by 3×** on the per-transaction figure |
| *"Amount ceilings, **merchant category restrictions**, and expiry dates set at mandate creation"* | No MCC/category restriction exists anywhere in OC 201, 201A or 201B. | **Unsupported** |
| *"A primary UPI account holder to grant **an AI agent** pre-authorized spending power … Agent executes payments **without prompting for UPI PIN on each transaction**"* | OC 201A restricts human Full Delegation to family members / domestic or small-business employees with OVD KYC. The AI path exists only via OC 201B (IoT/software), which is **CUG pilot** and requires *"debit transactions using IoT shall be only initiated by explicit user action."* | **Materially overstated** — PIN is removed, *user action* is not |

`INFERENCE` (high confidence): SEP #216 describes a **desired** capability, not a shipped one. This is useful — it means the gap Razorpay is publicly failing to close is real, and correctly characterising it is itself a differentiator.

---

## 7. What bounded spend authority can legally express in India today

This is the synthesis section. **Six dimensions, and only three of them are actually expressible.**

### ✅ Expressible today

| Dimension | Maximum expressible | Rail | Enforced by |
|---|---|---|---|
| **Per-transaction ceiling** | **₹5,000** | UPI Circle Full Delegation | NPCI/issuer bank, hard cap — merchant cannot override |
| **Periodic (monthly) ceiling** | **₹15,000 per delegation** | UPI Circle Full Delegation | NPCI/issuer bank |
| **Delegation lifetime / expiry** | **1 month to 5 years** (BHIM impl.); auto-revoke after **6 months** inactivity for IoT/software | UPI Circle | Primary UPI app lifecycle mgmt |
| **Number of concurrent agents** | **5** delegates per primary; each agent bound to exactly **one** primary | UPI Circle | NPCI |
| **Revocability** | Anytime, by primary, from the primary UPI app (limit management + delinking) | UPI Circle | Primary UPI app |
| **Full auditability** | Primary sees every delegated transaction in-app **and** on the bank statement; purpose code `BH` tags them in settlement | UPI Circle | NPCI raw file + Net Settlement report |
| **Higher ceilings, if the payee is fixed in advance** | **₹15,000** AFA-free per transaction (₹1,00,000 for insurance / mutual funds / credit card bills) | UPI Autopay / e-mandate | RBI E-mandate Framework 2026 |

### ❌ NOT expressible today — `EVIDENCE NOT FOUND` for any mechanism

| Desired control | Status |
|---|---|
| **Merchant-category (MCC) scoping** of a delegation | No such control in any NPCI circular. You cannot say "this agent may spend only at grocery MCCs". |
| **Per-merchant allow-list** on a delegation | Not in UPI Circle. (Autopay is inherently single-merchant, but that is the *opposite* trade: you fix the merchant and lose agent discretion.) |
| **Velocity / count limits** (e.g. "max 3 transactions per day") | Beyond the 24-hour cooling window, no per-count control is specified. |
| **Customer-set sub-limits on an e-mandate** | Explicitly **forbidden** by the 2026 MD: *"Payments under e-mandates shall not be subject to any other limits / controls set by the customer."* |
| **Unattended autonomous purchase** | OC-201B: *"debit transactions using IoT shall be only initiated by explicit user action."* |
| **Cross-border agent payment** | OC-201B: *"Only domestic P2M transactions shall be permitted."* |
| **P2P agent payment** | Same clause — **P2M only**. |

### The structural picture — `INFERENCE`, high confidence

India has **two rails and they trade off against each other on exactly one axis: who chooses the payee.**

```
                 agent chooses payee?
                   NO            YES
              ┌──────────────┬──────────────┐
  high  ₹1L   │ UPI Autopay  │   (nothing)  │
  cap         │  e-mandate   │              │
        ₹15k  │   [GA]       │              │
              ├──────────────┼──────────────┤
  low         │              │ UPI Circle   │
  cap   ₹5k   │              │ Full Deleg.  │
              │              │ [CUG pilot   │
              │              │  for AI]     │
              └──────────────┴──────────────┘
```

**The empty quadrant — high cap *and* agent discretion — is the actual gap.** That is what ACP's `delegate_payment` assumes exists, what Razorpay's SEP #216 tries to assert exists, and what NPCI has not yet built. Nothing in the RBI or NPCI corpus fills it.

**Three consequences for a system design:**

1. **Design to ₹5,000 / ₹15,000, not to ₹15,000 / ₹1,00,000.** A demo that moves ₹40,000 through an "agent mandate" is describing something that does not exist on Indian rails. A demo that respects ₹5,000 per transaction and ₹15,000 per month is describing something real, and the constraint itself is the interesting part.
2. **The dynamic-credential requirement is non-negotiable and is the architecture.** RBI Authentication Directions 2025 require one factor *"dynamically created … unique to that transaction"*. Any agent-payment design must mint a fresh per-transaction credential. A stored token that the agent replays is unlawful and moves full liability to the issuer. Razorpay's per-call cryptogram design is the right shape for the wrong reason — it is right because of this Direction, not merely because it is tidy.
3. **"Explicit user action" is the honest boundary, and naming it is a strength.** The defensible framing is *bounded, revocable, fully-audited delegation with a human trigger per purchase* — an agent that does everything up to and including preparing the debit, with the human action as the final dynamic factor. That is simultaneously (a) what OC-201B actually permits, (b) what the Authentication Directions 2025 actually require, (c) what FREE-AI para 4.4.49 actually recommends (*"human oversight remains a critical factor in medium-risk to high-risk tasks"*), and (d) what **MeitY is reported to be about to mandate** (human-in-the-loop for agentic AI payments, 16 Jul 2026). **Four independent authorities converge on the same design.** That convergence is the argument — and it is stronger than any claim of autonomy would be.

4. **The substrate is already proven, which de-risks the build.** Razorpay + NPCI have run agentic UPI on ChatGPT since Oct 2025 and on Claude since Feb 2026, *"built on UPI Circle and UPI Reserve Pay"*. A design on that substrate is not speculative — it is the same substrate Razorpay itself chose. What is *not* available is the public API to it (§6.1), so a submission must simulate or stub the delegation layer and be explicit that it does so.

---

## 8. Availability matrix

| Capability | Status | Evidence |
|---|---|---|
| UPI Circle **partial** delegation | **GA** | OC 201 (13 Aug 2024); 40 live banks/apps incl. PhonePe, Google Pay, Amazon Pay, BHIM |
| UPI Circle **full** delegation (human secondary) | **GA** | OC 201 + OC 201A (8 Jul 2025, compliance by 31 Aug 2025); BHIM live 25 Nov 2025 |
| UPI Circle for **IoT devices** (glasses, watch, TV) | **SPECCED**, limited | OC 201B (8 Oct 2025) |
| UPI Circle for **AI Profiles / software** | **SPECCED — Closed User Group pilot, NOT GA** | OC 201B: *"AI Profiles (initially for limited users in CUG)"*; NPCI product page: *"Currently AI/Software driven IoT Payments are under pilot with limited users as a part of Closed User Group."* |
| Unattended (no user action) agent payment | **NOT PERMITTED** | OC 201B: *"debit transactions using IoT shall be only initiated by explicit user action"* |
| UPI Autopay / e-mandate | **GA** since 22 Jul 2020 | OC 151; RBI E-mandate Framework 2026 |
| UPI Autopay mandate **portability** | **SPECCED** | OC 223 (7 Oct 2025) |
| RBI E-mandate Framework, 2026 | **IN FORCE** (21 Apr 2026) | RBI/DPSS/2026-27/396 |
| RBI Authentication Directions 2025 | **IN FORCE** (compliance 1 Apr 2026) | RBI/2025-26/79 |
| RBI rules on AI-agent payments | **DOES NOT EXIST** | Evidenced negative, §4.1 |
| RBI FREE-AI report | **ADVISORY ONLY** (13 Aug 2025) | Not binding; no agentic payment limits |
| RBI CoFT / CoFTA | **IN FORCE** | 7 Sep 2021 + 20 Dec 2023 |
| Razorpay **Token HQ** | **GA**, documented | 25+ public doc pages |
| Razorpay **TPAP Pro** | **GA**, documented | Public API docs |
| Razorpay **MCP Server** | **GA**, documented | Public docs, 7 client integrations |
| Razorpay **TSP** (UPI cryptogram issuer) | **NOT PUBLIC** — no docs, no API, referenced URL 404s | §6.1 |
| Razorpay UPI Circle handler in ACP | **PROPOSED, UNMERGED** | SEP #216 open since 2026-04-12, no TSC sponsor |
| **NPCI UAP** ("Unified Agent Protocol") | **REPORTED / IN DEVELOPMENT** — weaker than ANNOUNCED. Single anonymous-sourced press scoop (BS, 9 Jul 2026); no NPCI statement, no circular, no spec | §2 |
| Agentic UPI on **ChatGPT** (Razorpay + NPCI + OpenAI, on UPI Circle + Reserve Pay) | **PILOT** since GFF 2025 (Oct 2025) | §2.5 |
| Agentic UPI on **Claude** (Razorpay + NPCI; Zomato/Swiggy/Zepto) | **LAUNCHED** for named merchants, 20 Feb 2026 | §2.5 |
| MeitY human-in-the-loop requirement for agentic AI payments | **PROPOSED** (16 Jul 2026, press) | §2.6 |

---

## 9. Evidence index

### NPCI primary sources (operating circulars, PDFs read in full)
| Circular | Date | URL |
|---|---|---|
| NPCI/UPI/OC No.201/2024-25 — Introduction of "UPI Circle" | 13 Aug 2024 | <https://www.npci.org.in/uploads/UPI_OC_No_201_FY_24_25_Introduction_of_UPI_Circle_Delegated_Payments_for_secondary_users_cf6799f126.pdf> |
| NPCI/UPI/OC/201A/2025-26 — Full Delegation Additional Requirements | 8 Jul 2025 | <https://www.npci.org.in/uploads/UPI_OC_No_201_A_FY_2025_26_Introduction_of_UPI_Circle_Delegated_Payments_for_secondary_users_Full_Delegation_Additional_Requirements_ba7e414c1a.pdf> |
| NPCI/UPI/OC-201B/2025-26 — IoT devices & software on UPI Circle | 8 Oct 2025 | <https://www.npci.org.in/uploads/UPI_OC_No_201_B_FY_2025_26_Addendum_to_NPCI_UPI_2024_25_OC_201_Introduction_of_Io_T_devices_software_on_UPI_Circle_09ec83c893.pdf> |
| NPCI/UPI/OC No.151/2022-23 — UPI AUTOPAY AFA limit enhancement | 23 Jun 2022 | <https://www.npci.org.in/uploads/OC_151_UPI_AUTOPAY_AFA_limit_enhancement_and_compliance_69994c07fd.pdf> |
| NPCI/UPI/OC-151A/2023-24 — Enhancement of Limits for UPI AutoPay | 14 Dec 2023 | <https://www.npci.org.in/uploads/UPI_OC_151_A_Enhancement_of_Limits_for_UPI_Auto_Pay_4ad9596240.pdf> |
| NPCI/UPI/OC-223/2025-26 — Enhancement of UPI Autopay | 7 Oct 2025 | <https://www.npci.org.in/uploads/UPI_OC_No_223_FY_2025_26_Enhancement_of_UPI_Autopay_88b38535cb.pdf> |
| NPCI/UPI/OC-226/2025-26 — Additional Authentication methods in UPI | 7 Oct 2025 | <https://www.npci.org.in/uploads/UPI_OC_No_226_FY_2025_26_Introduction_of_Additional_Authentication_methods_in_UPI_42c3693399.pdf> |
| NPCI OC 125A — Non-revocation of UPI AUTOPAY mandate for loan/EMI | — | <https://www.npci.org.in/uploads/OC_125_A_Addendum_to_OC_125_Non_revocation_of_UPI_AUTOPAY_mandate_for_loan_repayment_and_EMI_collection_category_37b2c92c41.pdf> |
| NBSL press release — BHIM Goes Live with UPI Circle Full Delegation | 25 Nov 2025 | <https://www.npci.org.in/uploads/NBSL_Press_release_BHIM_Goes_Live_with_UPI_Circle_Full_Delegation_Enabling_Authorised_UPI_Payments_within_set_limits_7b308e643d.pdf> |
| NPCI UPI Circle product page (limits table, CUG pilot note, AI chatbot use case) | retrieved 26 Aug 2026 | <https://www.npci.org.in/product/upi-circle> |
| NPCI circulars index API (used to enumerate all UPI circular titles FY19→FY27) | — | `https://www.npci.org.in/api/circulars/upi?pageNum=1&year=YYYY&sort=desc&size=100&locale=en` |

### RBI primary sources
| Document | Date | URL |
|---|---|---|
| **Digital Payments – E-mandate Framework, 2026** (Master Direction, current law) | 21 Apr 2026 | <https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13374> |
| **Authentication mechanisms for digital payment transactions Directions, 2025** | 25 Sep 2025 | <https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12898> |
| Master Direction on Regulation of Payment Aggregator | 15 Sep 2025 | <https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896> |
| E-mandate chain (all repealed 2026): Ids 11668, 11784, 12002, 12051, 12341, 12570, 12722 | 2019–2024 | `https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=<Id>&Mode=0` |
| Tokenisation / CoFT chain: Ids 11449, 11822, 12050, 12152, 12159, 12211, 12345, 12363, 12573 | 2019–2023 | same pattern |
| **SDRP — UPI transaction limits delegated to NPCI** (P2P stays ₹1 lakh) | 9 Apr 2025 | <https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=60178> |
| SDRP — FREE-AI committee proposed (item 9) | 6 Dec 2024 | <https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=59245> |
| Regulatory Sandbox "On Tap" expanded to Theme-Neutral | 9 Apr 2025 | <https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=60190> |
| RBI Annual Report 2025-26 (FREE-AI status; Sandbox cohort table VI.1) | 29 May 2026 | <https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=62821> |
| FREE-AI committee constituted (PR 2024-2025/1779) | 26 Dec 2024 | <https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=59377> |
| FREE-AI report released (PR 2025-2026/902) | 13 Aug 2025 | <https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=61018> |
| FREE-AI full report (103 pp) | 13 Aug 2025 | `https://rbidocs.rbi.org.in/rdocs//PublicationReport/Pdfs/FREEAIR130820250A24FF2D4578453F824C72ED9F5D5851.PDF` |
| Payments Vision 2028 | 27 Mar 2026 | `https://rbidocs.rbi.org.in/rdocs/PublicationReport/Pdfs/PAYMENTSVISION2028270326500316AFADEB47259CB970132BA01304.PDF` |
| Governor Malhotra, "Winning in the AI Era", FIBAC | 11 Aug 2026 | <https://www.rbi.org.in/Scripts/BS_SpeechesView.aspx?Id=1567> |
| DG Murmu, "A Vision for Responsible AI, Resilient Banking" | 19 Aug 2026 | <https://www.rbi.org.in/Scripts/BS_SpeechesView.aspx?Id=1570> |

### Razorpay / ACP
| Item | URL |
|---|---|
| ACP SEP #216 (Razorpay UPI Circle Delegated Payment Handler) — open, unsponsored | `gh api repos/agentic-commerce-protocol/agentic-commerce-protocol/pulls/216` |
| Razorpay docs complete URL list (2,282 URLs) | <https://razorpay.com/docs/build/sitemap/razorpay/IN/urls.txt> |
| Razorpay Token HQ | <https://razorpay.com/docs/payments/payment-methods/cards/token-hq> |
| Razorpay TPAP Pro | <https://razorpay.com/docs/payments/tpap-pro> |
| Razorpay recurring payments over UPI | <https://razorpay.com/docs/payments/recurring-payments/upi> |
| Razorpay MCP Server | <https://razorpay.com/docs/mcp-server> |
| `razorpay.com/docs/payments/upi-circle` (cited in SEP #216) | **HTTP 404**, verified 26 Aug 2026 |

### Press sources (secondary — labelled as such throughout)
| Item | URL / locator |
|---|---|
| **Business Standard, 9 Jul 2026 — the single origin source for UAP** (4 anonymous sources; hard paywall after para 3) | <https://www.business-standard.com/finance/news/india-may-allow-agentic-ai-led-upi-transactions-under-new-npci-protocol-126070801343_1.html> |
| MediaNama, 10 Jul 2026 — derivative of the above | <https://www.medianama.com/2026/07/223-npci-agentic-payments-upi/> |
| Inc42 (GFF 2025) — Razorpay/OpenAI/NPCI pilot, names Axis Bank + Airtel Payments Bank + BigBasket, "built on UPI Circle and UPI Reserve Pay" | <https://inc42.com/buzz/gff-2025-npcis-upi-innovations-power-plethora-of-launches-by-fintech-players/> |
| Google AP2 protocol site (clean negative on NPCI/UAP) | <https://ap2-protocol.org/> |
| Google AP2 README (clean negative on UPI/NPCI/India) | `gh api repos/google-agentic-commerce/AP2/readme` |
| Headlines/dates corroborated via Google News RSS (~8 queries): MeitY human-in-the-loop 16 Jul 2026; NDTV Profit 22 Jul 2026; Razorpay×Claude 20 Feb 2026; NPCI×NVIDIA 18 Feb 2026 | `https://news.google.com/rss/search?q=...` |

**Press sources tried and failed (substance unverified):** NDTV Profit UAP pieces, Outlook Business, MediaNama MeitY article body, Entrackr article — URLs never resolved or paywalled; **headlines and dates only**.

### Method notes for re-verification
- **npci.org.in is behind Imperva** and returns 403 to curl, WebFetch, and `r.jina.ai` for `/uploads/*`. The working technique: drive a real headless browser to any `npci.org.in` URL (the JS challenge clears after one reload), then use a **same-origin `fetch()`** to pull `/api/*` JSON and `/uploads/*.pdf` bytes. NPCI circular PDFs are **scanned images** — `pdftotext` yields nothing; render with `pdftoppm -png` and read the images.
- **rbi.org.in** notification/MD documents are reachable only by integer-ID (`?Id=N&Mode=0`; higher = later). `rbidocs.rbi.org.in` PDFs need a cookie jar plus a `Referer` from `www.rbi.org.in`.
- Session constraints encountered: WebSearch budget exhausted; firecrawl search index returning unrelated results; DuckDuckGo/Bing/Mojeek all serving captcha or decoy content to curl. DuckDuckGo **via the real browser** worked.

**Note on the RBI strand:** it was researched in two independent passes. They agree on every circular number, date, and figure. One discrepancy in *coverage* only: pass 1 surveyed Governor/DG speeches (Ids 1567, 1570) and found zero occurrences of "agentic"/"AI agent"/"autonomous"; pass 2 did not survey speeches. The positive fetch is retained.

### Open items
- **NPCI UAP** — expansion ("Unified Agent Protocol") rests on a **single anonymous-sourced press scoop**. No NPCI confirmation exists. Treat as directional; re-check after GFF 2026 (early Oct).
- **MeitY human-in-the-loop proposal** — only the headline is verified. The actual proposal text was not obtained and would materially affect any autonomy claim.
- **UPI Circle Procedural Guidelines** — members-only; contains the detailed revocation TAT and API contract. Not publicly obtainable.
- **UPI Circle live-member list** — recovered snapshot is from Dec 2024 – May 2025; current membership unverified.
- **Cooling-period figure** — ₹2,000 (product page) vs ₹5,000 (circulars) unresolved.

---

# ⚠️ SECTION R — UPI RESERVE PAY / SINGLE BLOCK MULTIPLE DEBITS (SBMD)

> **Added 2026-08-26. Primary sources: NPCI OC 200/2024-25 (31 Jul 2024) and NPCI/UPI/OC-228/2025-26 (8 Oct 2025), both retrieved from `npci.org.in/uploads/*` via same-origin browser `fetch`, rendered to page images and read visually (they are HP-scanned images; `pdftotext` returns nothing).**

## R.0 READ THIS FIRST — Circle and Reserve Pay are different rails

**Never quote a limit from one rail while naming the other.** This is the exact error class that made Razorpay's ACP SEP #216 wrong by 3× (it quoted UPI Circle's ₹15,000 *monthly* cap as a *per-transaction* cap).

| | **UPI Circle** — OC 201 / 201A / 201B | **UPI Reserve Pay / SBMD** — OC 200 / OC 228 |
|---|---|---|
| Mechanism | Primary account holder **delegates spend authority to a secondary user** (person, IoT device, or AI profile) | Customer **blocks their own funds** in their own account; debits are drawn against that block |
| Who holds the authority | A *different party* from the account holder | The *same* account holder; the merchant is the beneficiary |
| Scope of authority | Any payee, within amount limits | **One named merchant.** The block is merchant-specific |
| Per-transaction cap | **₹5,000** | **None specified.** Bounded only by unutilised block balance |
| Periodic cap | **₹15,000 per delegation per month** | **₹10,000 per block**, one live block per merchant |
| Duration | 1 month – 5 years (BHIM impl.) | **Max 90 days** |
| Count limit | **5 delegates** per primary | **1 live block** per customer per merchant; unlimited debits within it |
| Authorisation event | Delegation setup (UPI PIN + 2FA) | **Block creation (UPI PIN)** |
| Transaction type | Domestic P2M only (IoT/software track) | **P2M only** |
| Razorpay MCP support | **None** | **Yes** — `create_order` with `token.type = "single_block_multiple_debit"` |

**₹5,000 / ₹15,000 / 5 delegates belong to Circle. ₹10,000 / 90 days / 1 block belong to Reserve Pay. They are not interchangeable.**

---

## R.1 The circular corpus — complete, evidenced

Enumerating NPCI's own circular index (`/api/circulars/upi?year=YYYY&size=100`) for **every year 2018→2027** and filtering on `block|SBMD|reserve|multiple debit` returns **exactly two** SBMD circulars. There is **no OC 200A and no OC 228A** — `FACT` (evidenced negative, full-index sweep).

| Circular | Date | Title | Role |
|---|---|---|---|
| **NPCI/UPI/OC.No200/2024-25** | **31 Jul 2024** | Enablement of UPI Mandate feature of Single Block Multiple Debits | **Founding circular.** Signed Kunal Kalawatia, Chief of Products. Members to enable by **30 Nov 2024**. [PDF](https://www.npci.org.in/uploads/UPI_OC_No_200_FY_24_25_Enablement_of_UPI_Mandate_feature_of_Single_Block_Multiple_Debits_f2f9bc9230.pdf) |
| **NPCI/UPI/OC-228/2025-26** | **8 Oct 2025** | Enhancements in UPI Single Block Multiple Debits (UPI Reserve Pay) | **Addendum that names the product "UPI Reserve Pay" and sets the ₹10,000 / 90-day cap.** Signed Sourabh Tomar, Head UPI Product. [PDF](https://www.npci.org.in/uploads/UPI_OC_No_228_FY_2025_26_Enhancement_in_UPI_Single_Block_Multiple_Debits_UPI_Reserve_Pay_a9095c181d.pdf) |

Ancestry cited inside these: OC 56/2018-19 (14 Aug 2018, introduces UPI mandates), OC 78/2019-20 (27 Jan 2020, block-txn reconciliation), OC 88/2020-21 and OC 128/2021-22 (Deemed Debit scope, extended to SBMD).

---

## R.2 LIMITS TABLE — one source and one confidence per row

All quotes below are **verbatim** from the page images.

| # | Parameter | Value | Source (circular, date, clause) | Class | Confidence |
|---|---|---|---|---|---|
| 1 | **Maximum block amount** | **₹10,000 per block** | **OC-228, 8 Oct 2025, "Issuer Banks shall ensure" §5**: *"The block created to be maximum of Rs.10,000 of block limit and up to 90 days."* Restated at **"Acquiring entities" §5(b)**: *"Allow user to enter the amount and select the end date as per their choice up to maximum of Rs.10,000 of block limit and up to 90 days."* **Independently corroborated** by NPCI's own product page <https://www.npci.org.in/product/upi-reserve-pay> (retrieved 26 Aug 2026): *"Transaction Limits — **Maximum amount you can reserve: ₹10,000 per block**"* | PRIMARY ×2 | **VERY HIGH** — stated twice in the operative circular *and* on NPCI's public product page, all three agreeing |
| 2 | **Maximum block validity** | **90 days** | Same two OC-228 clauses as row 1. **Corroborated** by NPCI product page: *"**Maximum duration for the reserve: 90 days**"* | PRIMARY ×2 | **VERY HIGH** — same |
| 3 | **Aggregate cap across blocks** | **One live block per customer per merchant.** No cap on blocks across *different* merchants. | **OC-228, "Issuer Banks shall ensure" §4**: *"One mobile number (assumed as one customer) is allowed to create only one block at a time for the particular merchant."* | PRIMARY | **HIGH** for the per-merchant rule; **HIGH** that no cross-merchant aggregate cap is stated (evidenced negative across both circulars) |
| 4 | **Per-debit limit inside a block** | **`EVIDENCE NOT FOUND` — none specified.** A debit is bounded only by the unutilised block balance. | Neither OC 200 nor OC 228 states any per-debit sub-limit. OC-228 "Acquiring entities" §5(d) imposes only a balance check: *"The current block limits (unutilised) are always checked before initiating a debit."* | PRIMARY (evidenced negative) | **HIGH** |
| 5 | **Number of debits per block** | **Unlimited** until the block is exhausted, revoked, or expired. | **OC-228 recital**: *"block the funds in the account for multiple debits … till the reserved funds gets exhausted or the block has been revoked or expired."* **OC 200 §1**: *"shall allow multiple debits against the block. The fund shall be blocked in the account till the time mandate is expired, revoked or the mandate amount is exhausted."* | PRIMARY | **HIGH** |
| 6 | **AFA required per debit inside the block?** | **NO.** Authentication is front-loaded to block creation. | **OC 200 §3**: *"Members shall ensure that the mandate created successfully shall also be executed successfully. **All the necessary validation should be at the time of mandate creation only.**"* **OC 200 §(d)**: *"It is re-iterated that issuer bank shall do all the necessary validation at the time of mandate creation."* | PRIMARY | **HIGH** — the user's prior belief is **CONFIRMED** |
| 7 | **Per-debit issuer validation (≠ AFA)** | Issuer must still validate every debit (mandate validity + unutilised balance) — this is **not** a customer authentication event | **OC-228 "Acquiring entities" §5(c)**: *"…along with the responsibility of issuer to validate every debit."* | PRIMARY | **HIGH** |
| 8 | **Payee restriction** | **YES — the block is merchant-specific.** Unlike Circle, a Reserve Pay block is bound to one merchant. | OC-228 Issuer §4 (*"for the particular merchant"*); UPI Apps §2 requires *"merchant specific display along with merchant name"* | PRIMARY | **HIGH** — this **refutes** the expectation that Reserve Pay matches Circle's payee-agnosticism |
| 9 | **Transaction category** | **P2M only** | **OC 200 §(g)**: *"The Single Block Multiple Debit mandates shall be only applicable for P2M category of transactions."* | PRIMARY | **HIGH** |
| 10 | **Merchant eligibility principle** | *"online verified merchants with low ticket and high frequency transactions"* | **OC-228 "Acquiring entities" §1**: *"To begin with UPI Reserve Pay shall be enabled only for online verified merchants with low ticket and high frequency transactions and hence selection of the online merchants must adhere to this principle."* | PRIMARY | **HIGH** that this is the stated principle |
| 11 | **Enumerated MCC / business-category eligibility list** | **`EVIDENCE NOT FOUND`.** No MCC list appears in either circular. Categories are named only as *examples*, not as an allow-list. | OC-228 acquirer §4 names *"quick commerce, food delivery"* (instant debit required) and *"cab aggregators, EVs"* (debit permitted post-delivery). Razorpay's *"Ensure your business category supports … SBMD functionality"* implies an **acquirer-side** list, not an NPCI-published one. | PRIMARY (evidenced negative) + VENDOR | **HIGH** that NPCI publishes no MCC list; **MEDIUM** that the gating is acquirer/PA-side |
| 12 | **Category scoping mechanism that *does* exist** | **Purpose codes.** 76 = Securities brokers/dealers (Secondary Market); 77 = Online goods and service delivery; 78/79 reserved | **OC 200 §(a)** table. **OC-228 General §3** confirms Reserve Pay rides **purpose code 77**: *"Purpose code 77 in the existing UPI raw file … shall be available to identify these transactions"* | PRIMARY | **HIGH** |
| 13 | **Block cap for purpose code 76 (securities)** | **₹5 lakh per mandate creation** — a *different* track, not Razorpay's | **OC 200 §(c)**: *"The per transaction limit for such mandate creations shall be Rs 5 Lakh for the purpose code 76, while for purpose code 77 existing UPI limits shall be applicable."* | PRIMARY | **HIGH** on the quote. **MEDIUM** on whether OC-228's ₹10,000 overrides PC-76 — see R.3 |
| 14 | **Retry policy** | **Max 3 retries in 24 hours, timeouts only.** No retries for any other decline. | **OC-228 acquirer §3**: *"the timeout on the debit transaction … shall be treated as a decline transaction and will be reversed in real-time and shall not be settled (not to be treated as deemed debit). Only for afore-mentioned scenarios, acquiring entities may retry maximum 3 times in 24 hours (no retries for any other declines)."* | PRIMARY | **HIGH** |
| 15 | **Eligible source of funds** | Savings, Current, OD, RuPay Credit Card, pre-sanctioned Credit Lines — *"all UPI-permitted source of funds"* | **OC-228 recital + closing**: *"Members are advised to enable UPI Reserve Pay to all UPI-permitted source of funds (including SA, CA, OD, RuPay Credit Card, pre-sanctioned Credit lines, etc.)."* This is the **entire point** of OC-228 | PRIMARY | **HIGH** |
| 16 | **Block creation channels** | QR-based, Intent, SDK/Plug-In. **Payer-initiated only.** | **OC 200 §(b)**: *"Such mandate creations shall be payer-initiated mandates wherein the customer can create mandate from the below mentioned methods: i. QR based ii. Intent iii. SDK/Plug In … Other mode of initiation shall be envisaged later."* | PRIMARY | **HIGH** |
| 17 | **Revocation** | Customer may revoke at any time, from **both** the merchant platform and the UPI app | **OC 200 §(e)**: *"Customer shall also be provided with an option of revoking the mandate…"* **OC-228 acquirer §5(c)**: *"Easy access on merchant's platform to update and revoke."* **OC-228 UPI Apps §1**: *"Easy access to revoke the block."* | PRIMARY | **HIGH** |
| 18 | **Mandatory notifications** | SMS/email/other on **block creation, modification, debit, revoke and expiry** | **OC-228 Issuer §2**: *"Mandatory notifications in the form or SMS or email or other channels for block creation, modification, debit, revoke and expiry."* | PRIMARY | **HIGH** |
| 19 | **Purpose code / settlement identifier** | **77**, plus a line item in the Net Settlement Report | OC-228 General §3 | PRIMARY | **HIGH** |
| 20 | **Compliance deadline (founding)** | Members to enable by **30 Nov 2024** | **OC 200** closing: *"Member are requested to hereby note the changes and enable the feature by 30th November 2024."* | PRIMARY | **HIGH** |
| 21 | **Detailed product spec (Annexure A)** | **`EVIDENCE NOT FOUND`.** OC 200 references *"Annex A - Product Document on Mandate with Single Block and Multiple Debit"* but the annexure is **not included** in the published 3-page PDF. | OC 200 p.3 | PRIMARY (documented gap) | **HIGH** that it is missing from the public file |

---

## R.3 The ₹10,000 / 90-day figure — verdict on the prior single-sourced claim

> **CONFIRMED.** The earlier agent's *"Reserve Pay caps at ₹10,000 / 90 days"* is **correct** and is now traced to a named circular clause. It is **NPCI/UPI/OC-228/2025-26, 8 October 2025**, and it appears **twice**:
>
> - *Issuer Banks shall ensure* **§5** — *"The block created to be maximum of Rs.10,000 of block limit and up to 90 days."*
> - *Acquiring entities* **§5(b)** — *"Allow user to enter the amount and select the end date as per their choice up to maximum of Rs.10,000 of block limit and up to 90 days."*

**It is now double-sourced within the primary class.** NPCI's public product page <https://www.npci.org.in/product/upi-reserve-pay> (retrieved 26 Aug 2026, rendered via browser — the site is a Next.js SPA that returns HTTP 200 for arbitrary paths, so the *rendered text* is the evidence, not the status code) carries a **"Transaction Limits"** block reading verbatim:

> *"Maximum amount you can reserve: **₹10,000 per block**
> Maximum duration for the reserve: **90 days**"*

**This is the opposite of the UPI Circle situation.** For Circle, NPCI's product page **contradicts** the circulars on the cooling-period figure (₹2,000 vs ₹5,000 — see §1.2). For Reserve Pay, product page and circular **agree exactly**. Rows 1 and 2 are therefore **VERY HIGH** confidence, and are the safest numbers in this entire document.

**One honest residual ambiguity — `INFERENCE`, MEDIUM confidence.** OC-228 is framed as an addendum whose stated purpose is extending Reserve Pay *"to all UPI-permitted source of funds … for merchant segments"*, and it says *"All prior released NPCI guidelines for UPI Reserve Pay shall continue to be applicable."* The ₹10,000 / 90-day clauses are stated **without qualification** inside general "Issuer Banks shall ensure" and "Acquiring entities" obligation lists, and OC-228 identifies its scope as **purpose code 77**. Reading these together:

- **HIGH confidence:** ₹10,000 / 90 days is the operative cap for **purpose-code-77 UPI Reserve Pay** — the online-goods-and-services merchant track, i.e. **exactly the track Razorpay's MCP `single_block_multiple_debit` rides**. Design to this number.
- **MEDIUM confidence:** purpose code **76** (securities brokers, secondary market) retains its **₹5 lakh** block ceiling from OC 200 §(c) and is not touched by OC-228. This is textual inference, not an explicit carve-out.
- **What would resolve it:** the *Annex A Product Document* (R.2 row 21), which is not published.

**Do not state ₹10,000 as "the UPI Reserve Pay limit" without saying "per block, purpose code 77".**

---

## R.4 Three places where Razorpay's marketing copy diverges from OC-228 — `FACT`

This is the same defect class as SEP #216, found again, in a different Razorpay surface.

| Razorpay docs say (VENDOR) | OC-228 says (PRIMARY) | Verdict |
|---|---|---|
| *"**Guaranteed Collection:** Funds are pre-blocked, ensuring you receive payment regardless of customer's later financial situation."* | **Acquiring entities §2**: *"**The block created shall not be treated as the guarantee of payment**, only the successful debit response received by the merchant … shall be considered for payment."* | **REFUTED.** NPCI expressly negates the exact word Razorpay's headline uses. |
| *"debit exact amounts automatically as they fulfil orders … **without requiring additional customer authentication**"* | **Recital**: *"multiple debits **which can be initiated by the customer on the merchant's platform**"*. **Acquirer §2**: *"for the debit initiated by the **customer action** on merchant's platform"*. **Acquirer §4**: *"The **purchase action by the customer** must result into instant debit request without any delay."* | **HALF-TRUE, and the half that is false is the important one.** The *authentication* claim is correct (row 6 — AFA is front-loaded). But NPCI's default model still presumes a **customer purchase action per debit**. This is the **identical authentication-vs-action distinction** as OC-201B's *"explicit user action"*. |
| (implied: merchant debits at will) | **Acquirer §4 carve-out**: *"For use cases wherein amount is not fixed and is determined based on the services consumed (e.g.: cab aggregators, EVs, etc.), **merchant may debit post successful delivery of services**."* | **Narrow support.** Genuinely merchant-initiated debit is permitted, but as a **variable-amount, post-delivery** exception — not as a general licence for unattended debits. |
| Docs render a **"Limits"** heading and the sentence *"The following standard limits apply to UPI Reserve Pay:"* — **followed by no table** | ₹10,000 / 90 days, OC-228 | **Razorpay does not publish the number its own rail is capped at.** |

### Consequence for the thesis — `INFERENCE`, high confidence

The earlier correction in `RAIL_RECONCILIATION.md` said Reserve Pay had *"no per-debit re-auth"* and inferred that this made the rail more permissive than Circle. **Half of that survives, half does not:**

- **Survives:** no **AFA** per debit. OC 200 §3 is explicit — all validation happens at mandate creation.
- **Does not survive:** *"NPCI enforces the envelope's amount ceiling and nothing else — no payee restriction, no category, no velocity."* OC-228 in fact imposes **a payee restriction** (block is merchant-bound, row 8), **a merchant-eligibility principle** (row 10), **a one-live-block rule** (row 3), **a hard 90-day expiry** (row 2), and **a retry cap** (row 14). Reserve Pay is *more* constrained than the earlier note claimed, not less.
- **The sharpened claim:** *inside a single merchant's ₹10,000 / 90-day block, an agent can draw an unbounded number of debits of unbounded individual size with no further customer authentication — and NPCI's text presumes, but does not anywhere mandate in machine-checkable terms, a customer purchase action behind each one.* The gap between *"customer action"* as a presumption and *"customer action"* as an enforced control is precisely where a merchant-side agent operates unsupervised.

### ⚠️ R.4a — NPCI's two primary sources disagree on *who pulls the debit* — `FACT` that sources conflict

I must flag this rather than pick the reading that suits the thesis.

| Source | Says |
|---|---|
| **OC-228 (circular, 8 Oct 2025)** — customer-pull framing | *"multiple debits **which can be initiated by the customer** on the merchant's platform"* (recital); *"for the debit **initiated by the customer action** on merchant's platform"* (acquirer §2); *"The **purchase action by the customer** must result into instant debit request without any delay"* (acquirer §4) |
| **NPCI product page** (retrieved 26 Aug 2026) — merchant-pull framing | *"When you order goods or services, and select UPI Reserve Pay to make payments **the merchant shall be able to deduct money from your reserved amount**. You get notified each time money is deducted."* |
| **OC-228 acquirer §4, second sentence** — explicit merchant-pull carve-out | *"For use cases wherein amount is not fixed and is determined based on the services consumed (e.g.: cab aggregators, EVs, etc.), **merchant may debit post successful delivery of services**."* |

**Reconciliation — `INFERENCE`, medium-high confidence.** The **technical** actor pulling the debit is always the **merchant/acquirer** (there is no other party that could; the customer's UPI PIN is not in the loop after block creation — row 6). What OC-228's "customer action" language governs is the **business trigger**: NPCI's default expectation is that a merchant debit is *occasioned by* a customer purchase, and for fixed-amount categories (quick commerce, food delivery) it must be *instant* upon that purchase. The consumer-facing product page describes the same mechanism from the customer's point of view and simply says the merchant deducts.

**What this means, stated conservatively:**
- ✅ **Merchant-initiated debit with no customer authentication is unambiguously permitted** — explicitly so for variable-amount post-delivery categories, and as the underlying mechanism everywhere.
- ⚠️ **"Customer purchase action per debit" is NPCI's stated expectation for fixed-amount categories**, but it is a **conduct requirement on the acquirer, not a protocol control**. Nothing in UPI validates that a purchase action occurred.
- ❌ **Do not claim OC-228 "requires" a human action per debit.** It does not use mandatory language equivalent to OC-201B's *"shall be only initiated by explicit user action"*. That phrasing belongs to **Circle**, not Reserve Pay. Conflating them would be the same error in the opposite direction.

**Both rails land in the same place by different routes: NPCI removes the PIN. Circle expressly retains the human ("shall be only initiated by explicit user action"); Reserve Pay merely presumes one ("purchase action by the customer") and does not enforce it. Neither enforces it in the protocol — but only Circle mandates it in the text.**

---

## R.5 The Razorpay MCP server does not enforce either NPCI limit — `FACT`, verified by source inspection

**This is the sharpest evidence in the corpus for the thesis, and it is verifiable by anyone in thirty seconds.**

Source: `github.com/razorpay/razorpay-mcp-server`, HEAD `7950d51` (2026-03-26), read at `/tmp/rzpmcp`. The `create_order` tool is the *only* agent-reachable path to a Reserve Pay block.

### What the agent-facing schema accepts

`pkg/razorpay/orders.go` — the `token` object description given to the LLM, verbatim:

> *"Must contain: **max_amount** (positive number in paise, maximum debit amount - For INR: 100 paise = ₹1), **frequency** (as_presented/monthly/one_time/yearly/weekly/daily), **type='single_block_multiple_debit'** (only supported type), and optionally **expire_at** (Unix timestamp, defaults to today+60days)."*

### What the validators actually check — `pkg/razorpay/tools_params.go`

| Field | NPCI limit (OC-228) | MCP server validation | Gap |
|---|---|---|---|
| `max_amount` | **₹10,000 per block** (= 1,000,000 paise) | `validateTokenMaxAmount`: **`amt <= 0` → error. That is the entire check.** | **No ceiling.** `max_amount: 500000000` (₹50 lakh) passes client-side validation |
| `expire_at` | **90 days maximum** | `validateTokenExpireAt`: **`exp <= 0` → error. That is the entire check.** | **No ceiling.** Any positive Unix timestamp passes, including one 10 years out — or one **in the past** |
| `frequency` | *not an NPCI concept for SBMD* | Enumerated against 6 values | Over-specified relative to the rail |
| `type` | — | Enumerated against exactly one value | Fine |

**Repo-wide evidenced negative:** grepping every non-test `.go` file for `10000`, `1000000`, or a 90-day constant returns **exactly one hit**, and it is an unrelated paise-conversion example in `payments.go:720`. **Neither ₹10,000 nor 90 days appears anywhere in the codebase, the README, or `AGENTS.md`.**

The default is the one saving grace: when `expire_at` is omitted, the server sets `time.Now().AddDate(0, 0, 60)` — **60 days, comfortably inside the 90-day cap.** So the *default* is compliant and any *explicit* value is unchecked.

### Three claims this supports, at three different confidence levels

1. **`FACT`:** Razorpay's official MCP server performs **no client-side validation** of either binding NPCI Reserve Pay limit, and never states either number to the model.
2. **`INFERENCE`, high confidence:** an LLM driving this tool **cannot learn the limits from the interface**. The tool description is the model's entire world-model of the rail. It says "positive number in paise" where NPCI says "maximum of Rs.10,000". A model asked to reserve ₹50,000 has nothing in the schema telling it not to.
3. **`HYPOTHESIS` — explicitly not verified:** Razorpay's *backend* Orders API may reject over-limit values server-side. I could not test this without live credentials. **Do not claim the money would actually move.** The verified claim is narrower and still sufficient: *the agent-facing surface carries none of the constraint, so the failure — if it fails — is a late, opaque, server-side rejection rather than a constraint the agent could have respected.*

### Why this matters more than SEP #216 did

SEP #216 **mis-stated** a limit (₹15,000 monthly quoted as per-transaction — wrong by 3×). That is a documentation defect in an unmerged proposal.

The MCP server **omits the limit entirely**, in shipped code, on the rail Razorpay actually runs in production with NPCI. Same root cause — **the constraint has drifted from the regulation that authorises it** — but here the drift is all the way to zero, and it sits in the executable path rather than in prose.

> **The whole thesis in one sentence:** NPCI wrote ₹10,000 and 90 days into a binding circular on 8 October 2025; five months later Razorpay shipped the official agent interface to that rail with `max_amount > 0` and `expire_at > 0` as its complete validation, and told the model neither number.

---

## R.6 Open items on Reserve Pay

| Question | Status |
|---|---|
| **Which banks / PSPs support Reserve Pay, and since when** | **PARTIALLY RESOLVED — see R.7.** Previously `EVIDENCE NOT FOUND` (primary). NPCI's Reserve Pay product page carries **no live-member list** (unlike UPI Circle, which publishes one). No `/api/live-members` endpoint exists. OC 200 set a member enablement deadline of **30 Nov 2024** — that is an *obligation*, not evidence of who actually shipped. Press (secondary): Inc42's GFF 2025 report names **Axis Bank** and **Airtel Payments Bank** as Razorpay's banking partners for the OpenAI/NPCI pilot *"built on UPI innovations such as UPI Circle and UPI Reserve Pay"* — that is the only named-bank evidence located, and it is press, not NPCI. |
| **Enumerated MCC / eligible-business-category list** | **`EVIDENCE NOT FOUND`.** NPCI publishes none (R.2 row 11). Razorpay's *"Ensure your business category supports … SBMD functionality"* implies an **acquirer-side** allow-list that is not public. The only NPCI-stated gate is the *principle* in OC-228 acquirer §1 (*"online verified merchants with low ticket and high frequency transactions"*). |
| **Razorpay test-mode support for `single_block_multiple_debit`** | **`EVIDENCE NOT FOUND`, not yet verified by execution.** The MCP server applies no environment-specific gating in `create_order`. Probe exists at `tools/probe_testmode.py`. **Resolve by execution, not by reading docs.** |
| **Annex A — "Product Document on Mandate with Single Block and Multiple Debit"** | **`EVIDENCE NOT FOUND`.** Referenced on OC 200 p.3 but absent from the published 3-page PDF. This is where per-debit mechanics and any velocity rules would live. Likely members-only, as with the UPI Circle Procedural Guidelines. |
| **Does OC-228's ₹10,000 cap override purpose code 76's ₹5 lakh?** | **Unresolved** — see R.3. Design to ₹10,000 for the purpose-code-77 merchant track. |
| **Does Razorpay's backend reject over-limit `max_amount` / `expire_at`?** | **Unverified `HYPOTHESIS`** — see R.5. Requires live credentials. Do not assert either way. |

### Method note for re-verification

`npci.org.in` sits behind Imperva and returns **403 to plain `curl`**. Working technique, used for everything in this section:

1. Drive a real browser to any `npci.org.in` page (the JS challenge clears on first load).
2. From that page's own JS context, `fetch('/api/circulars/upi?pageNum=1&year=YYYY&sort=desc&size=100&locale=en')` → JSON listing. `size=200` errors; paginate at 100. The `year` param maps to the **FY start year** (`year=2025` → FY 2025-26).
3. Same-origin `fetch` the `/uploads/*.pdf`, base64 the `ArrayBuffer`, and exfiltrate it.
4. **The PDFs are HP-scanned images — `pdftotext` returns empty.** `pdftoppm -png -r 170` and read the pages visually.

Archived locally: `research/01_razorpay_signals/circulars/oc200.pdf`, `circulars/oc228.pdf`.

---

## R.7 Launch, apps and banks — second-pass findings

### R.7.1 Launch event — `FACT`, PRIMARY

**UPI Reserve Pay was launched by the RBI Governor at Global Fintech Fest 2025 on 8 October 2025** — the same day OC-228 is dated.

> *"Mumbai, 8 October 2025: The Reserve Bank of India (RBI) Governor, Shri Sanjay Malhotra, today announced the launch of four new product offerings at the Global Fintech Festival (GFF) 2025."*
> Section heading: *"UPI Reserve Pay – Single Block Multiple Debt (UPI SBMD) on Credit Accounts"* (NPCI's own typo for "Debit")
> — <https://www.npci.org.in/uploads/RBI_Governor_unveils_New_Generation_of_Digital_Payment_Initiatives_at_GFF_6494fabdfc.pdf>

`INFERENCE`, high confidence: **the GFF launch was scoped to *credit accounts*** (RuPay credit card, pre-sanctioned credit lines) — which is exactly what OC-228 does. The *feature* dates from OC 200 (31 Jul 2024, enablement deadline 30 Nov 2024); **what launched on 8 Oct 2025 is the credit-account extension plus the "UPI Reserve Pay" brand name.** Do not describe Reserve Pay as "launched Oct 2025" without that qualifier.

There is also a 23-page NPCI brand guideline: <https://www.npci.org.in/uploads/UPI_Reserve_Pay_Guidlines_b4cb359cbc.pdf> (NPCI's own filename typo, "Guidlines").

### R.7.2 Which UPI apps support it — VENDOR, thin

| App | Evidence | Class | Confidence |
|---|---|---|---|
| **BHIM, INDMoney, Navi, Paytm** | Listed on Razorpay's live Reserve Pay docs page | VENDOR | **MEDIUM** — vendor-stated, reproduced on the live page |
| **Navi — 10 Oct 2025** | <https://www.angelone.in/news/startups/navi-expands-upi-utility-with-reserve-pay-and-ev-recharge-features> — announced at GFF 2025, *"rolled out in phases for Android and iOS"* | SECONDARY | **MEDIUM** |
| BHIM SBI, PhonePe, GPay, BOB epay ("Coming Soon") | **Search-snippet only.** Could not be reproduced on the live page by two independent attempts. | UNVERIFIED | **LOW — do not cite** |
| **Paytm — 4 Mar 2025** | <https://digitalterminal.in/trending/paytm-upi-revolutionizes-stock-trading-with-single-block-multiple-debit-feature> | SECONDARY | **⚠️ DO NOT CONFLATE — see below** |

> ⚠️ **The Paytm March 2025 story is a different purpose code.** It describes SBMD **blocks for stock trading** on Axis (`@ptaxis`) and Yes Bank (`@ptyes`) handles — i.e. **purpose code 76, securities brokers, ₹5 lakh ceiling** (R.2 row 13). It is **not** the ₹10,000 merchant Reserve Pay track (purpose code 77). This is independent real-world confirmation that **the two purpose codes are separately deployed products with different limits**, and it strengthens the R.3 inference that OC-228's ₹10,000 does not reach PC-76.

**Banks: still `EVIDENCE NOT FOUND`.** No issuer bank has published a press release for SBMD / Reserve Pay. The only named-bank evidence remains press: Axis Bank + Airtel Payments Bank (Razorpay's partners in the GFF 2025 OpenAI pilot).

### R.7.3 Razorpay's own launch timing — `FACT`, VENDOR

Razorpay's Reserve Pay launch blog is dated **12 March 2026** — <https://razorpay.com/blog/upi-reserve-pay/> — **five months after** NPCI's OC-228 and the GFF launch. It names pilot merchants **Zepto, Zomato and Swiggy** and demos on ChatGPT / Gemini / Claude. Cashfree claims *"We are among the first to make UPI Reserve Pay available for all merchants."*

`INFERENCE`: the Razorpay MCP `create_order` SBMD support (HEAD dated 2026-03-26, R.5) lands in the **same fortnight** as that blog post. The missing limit validation is therefore not legacy drift from an old integration — **it shipped with the launch.**

### R.7.4 ⚠️ Conflict resolved: ₹10,000 per *block*, not per *month* — `FACT`

A second research pass surfaced **Cashfree stating the cap as ₹10,000 *per month*.** That pass could not adjudicate it, because it could only reach OC-228 as an **image-only PDF with no text layer** and had to rely on a regtech paraphrase (Complinity).

**I read the OC-228 page images directly. Cashfree is wrong.** The circular says, verbatim, in two places:

> *"The **block** created to be maximum of Rs.10,000 of **block limit** and up to 90 days."* (Issuer Banks §5)
> *"…up to maximum of Rs.10,000 of **block limit** and up to 90 days."* (Acquiring entities §5(b))

NPCI's product page independently agrees: *"Maximum amount you can reserve: **₹10,000 per block**."*

**Verdict: the cap is per block, with a 90-day maximum life and one live block per customer per merchant. There is no monthly cap anywhere in either circular.** A "per month" reading would be materially wrong in both directions — it implies a *recurring* ₹10,000 entitlement that does not exist, and it implies a *monthly* reset that the 90-day block lifetime contradicts.

> **This is the third independent instance of the same failure mode in this document:** SEP #216 mis-stated Circle's monthly cap as per-transaction; Razorpay's MCP server dropped the cap entirely; Cashfree restated a per-block cap as per-month. **Every vendor restatement of an NPCI limit found so far has been wrong. Only the circulars and NPCI's own product page have been reliable.** Treat any vendor-stated limit as unverified until traced to a circular clause.

### R.7.5 Corroboration of clauses I read directly

An independent pass via regtech summaries (Complinity, TeamLease RegTech — **SECONDARY**, paraphrase not verbatim) independently reports the same OC-228 substance I read from the page images: one block per merchant per customer; ₹10,000 for up to 90 days; *"Reserve Pay should initially be enabled for verified online merchants with low-ticket, high-frequency transactions"*; 3 retries in 24 hours; purpose code 77; extension to SA/CA/OD/RuPay CC/credit lines. TeamLease independently confirms OC-200's **30 Nov 2024** enablement deadline and **P2M-only** scope.

**No conflicts between the primary text I read and these paraphrases.** Rows 1–5, 9–11, 14–15 and 20 of R.2 are now corroborated across primary text **and** two independent secondary summaries.
