# The Legal Spine — what an AI agent may actually spend in India

Every figure below traces to a named NPCI circular or RBI direction. Retrieved 2026-08-26.
NPCI circulars are **scanned images** — `pdftotext` returns nothing; they were read as page images.

## 1. UPI Circle limits — `FACT`, NPCI/UPI/OC No.201/2024-25 (13 Aug 2024)

| Parameter | Value |
|---|---|
| Per-transaction (**full** delegation) | **₹5,000** |
| Monthly (full delegation) | **₹15,000 per delegation** |
| **Partial** delegation | No special cap — *"existing UPI limits shall be applicable"* |
| Delegates | **5 max** per primary; a secondary may accept from **only one** primary |
| First 24 hours | ₹5,000 per circular — **but NPCI's product page says ₹2,000.** Conflict flagged; **design to ₹2,000.** |
| Mandate lifetime | 1 month – 5 years (BHIM) |
| **MCC / category scoping** | **Does not exist anywhere in the corpus.** |

### Two addenda that change everything

- **OC-201A (8 Jul 2025):** Full-Delegation secondaries must be **family members or domestic/small-business employees identified by KYC Officially Valid Document**. → **An AI agent cannot qualify as a full-delegation secondary.**
- **OC-201B (8 Oct 2025):** opens a separate track for *"IoT devices & software profiles like Smart glasses, watch, TV, **AI Profiles** (initially for limited users in CUG)"*. Same caps, **domestic P2M only**, auto-revoke after 6 months idle — and the decisive clause:

> ***"debit transactions using IoT shall be only initiated by explicit user action."***

NPCI's product page confirms the AI track is a **Closed User Group pilot, not GA**.

## 2. ⚠️ The binding constraint is AUTHENTICATION, not limits — `FACT`

**RBI Authentication Directions 2025** (in force **1 Apr 2026**) require two factors, at least one *"dynamically created or proven … unique to that transaction"*, with non-compliance shifting **full liability to the issuer**.

> **An agent holding a static credential cannot lawfully pay in India.**

RBI has issued **nothing binding** on AI-agent payments: FREE-AI is advisory and its recommendations remain "under assessment"; the model-risk draft Directions are unpublished; there is no AI sandbox cohort.
*Caveat: this rests on a title-only sweep of ~940 notifications — a relevant circular under a non-AI title could have been missed.*

## 3. What an agent can legally spend — the synthesis

> **At most ₹5,000 per transaction and ₹15,000 per month, domestic P2M only, as one of five delegates, inside a CUG pilot — and delegation removes the *UPI PIN*, not the *human*.**

The higher-value alternative, **UPI Autopay** (AFA-free to ₹15,000; ₹1,00,000 for insurance / mutual-fund / credit-card categories), buys those limits by **fixing the payee in advance** — so the agent has no discretion. The 2026 Master Direction explicitly **forbids customer-set sub-limits** on it.

**The quadrant everyone wants — high cap *and* agent discretion — is empty.** That is precisely the quadrant ACP's `delegate_payment` assumes exists.

### The convergence

Four independent sources land on the same design:

| Source | Requirement |
|---|---|
| NPCI OC-201B | *"only initiated by explicit user action"* |
| RBI Authentication Directions 2025 | a dynamic factor **unique to that transaction** |
| MCP spec (only normative payment sentence) | *"Servers **MUST** use URL mode"* for payment credentials |
| RBI FREE-AI + MeitY (reported) | human-in-the-loop |

> ⚠️ **CORRECTED — see `../01_razorpay_signals/RAIL_RECONCILIATION.md`. This holds for UPI Circle AI Profiles, NOT for UPI Reserve Pay.**
>
> **The per-purchase human trigger is not a limitation to engineer around. In India it is legally mandatory — and MCP already specifies the mechanism.** Nothing in the Indian agent surface uses it. Razorpay's own MCP server instead brokers the OTP **through the model** (`"next_tool": "submit_otp"`, `"otp_string": "{OTP_CODE_FROM_USER}"`).

## 4. ⚠️ Razorpay's own SEP #216 misstates NPCI's limits — `FACT`, verified verbatim

From the PR body of `agentic-commerce-protocol#216`, authored by `himanshu-rzp` (Razorpay):

> **"Why ₹15,000 Limit?** NPCI's UPI Circle specification imposes a hard **per-transaction** limit. Enforced at the mandate/bank level — not in the ACP schema. Merchants cannot override this; it is a regulatory constraint from RBI/NPCI."

**₹15,000 is the *monthly* cap. Per-transaction is ₹5,000.** The claim is wrong by **3×**.

Two further defects in the same document:
- It states the mandate carries *"Amount ceilings, **merchant category restrictions**, and expiry dates"* — **no MCC or category scoping exists anywhere in the NPCI corpus.**
- It is **internally inconsistent**: a later table says *"NPCI enforces per-transaction **and monthly** limits at the bank level"* — contradicting its own "₹15,000 per-transaction" heading.
- Both cited references are dead: `razorpay.com/docs/payments/upi-circle` → **HTTP 404** (verified, both URL variants).

### How to use this — and how not to

❌ **Not as a gotcha.** Naming an individual's error to a panel that may include him is a bad trade, and the point is not that one engineer slipped.

✅ **As the product argument.** A constraint claim written by the PSP with the most UPI expertise in the world, submitted into a public standards body, reviewed by Stripe and Meta, **drifted 3× from the circular that authorises it — and nothing caught it, for four months.**

> **That is the case for a conformance harness that validates declared constraints against the regulation that authorises them.** The error is not the finding; the *absence of any mechanism that would catch it* is the finding.

## 5. Razorpay TSP is not a public surface — `FACT`

Zero occurrences of `tsp`, `circle`, `delegat`, `cryptogram`, `agentic`, or `acp` across **all 2,282 Razorpay documentation URLs**. SEP #216's `upi_circle_cryptogram` "fetched from Razorpay TSP" has **no public API**.

**Generally available instead:** TPAP Pro · UPI Autopay · Token HQ · MCP Server.

→ **Consequence for the build: the delegation layer must be stubbed, and the stub must be declared.** Not a flaw — a disclosure requirement, and the same one the tracks already impose ("50+ record batch of **synthetic** data", "held-out test set").

## 6. The substrate already exists in production — `FACT`

Razorpay + NPCI have run agentic UPI **on ChatGPT since GFF 2025** (Axis Bank, Airtel Payments Bank, BigBasket) and **on Claude since Feb 2026** (Zomato, Swiggy, Zepto) — explicitly *"built on UPI Circle and UPI Reserve Pay"*, the same rails as OC-201B.

**What is missing is public API access, not capability.** This is what the Buildathon page means by *"Razorpay's in-app pilots are already live."*

## 7. UAP — thin evidence, handle with care

**"Unified Agent Protocol"** rests on a **single Business Standard scoop (9 Jul 2026) sourced to four anonymous people**; every other outlet is a rewrite. No NPCI statement, no press release, **no circular** (all FY25-26 and FY26-27 UPI circular titles enumerated — zero hits), no spec, no named participants.

⚠️ **Every GitHub hit for "NPCI UAP" is another Buildathon entrant — circular evidence.** Also refuted: no NPCI–AP2 relationship (AP2's README has zero mentions of UPI/NPCI/India) and no NPCI–Google Cloud tie-up (the actual partner is **NVIDIA**).

→ **Do not build on UAP. Cite it as the slot, attribute its status, do not assert it.**

## 8. Design constraints this fixes

| Constraint | Value |
|---|---|
| Demo cart ceiling | **< ₹5,000** per transaction (not ₹15,000 — that is the monthly envelope) |
| Monthly envelope | ₹15,000 |
| First-24h ceiling | design to **₹2,000** (conservative side of the conflict) |
| Delegates | ≤ 5 |
| Scope | domestic **P2M** only |
| Category limits | **must be implemented by us — NPCI has none** |
| Human trigger | **legally required per purchase** |
| Delegation API | **not public — stub and declare** |
