# MASTER BUILD PROMPT — Razorpay AI Buildathon submission

> **How to use this.** Hand this file to a fresh Claude Code session in this repository. It is self-contained: every fact is cited, every trap is named, every claim you may and may not make is enumerated. **Do not re-derive the research.** It is in `research/` (95 files, ~14,400 lines) and `corpus/` (checksummed primary sources).
>
> **Read `research/11_final_selection/` first — all four files. Then this. Then build.**

---

# PART 0 — THE SITUATION

You are building a **single-person submission** to the **Razorpay AI Buildathon**, a hiring funnel for AI Builder Interns (₹75,000/month, Bangalore, from September).

- **Deadline: 5 September 2026.** Hard stop. Applications close.
- **One shot.** The form's final checkbox reads: *"I confirm that this is my official final project submission. I understand that no further changes or edits can be made after submitting."*
- **One track only.** Ours is **Track 01 — AI Growth & Agentic Commerce**.
- **Three artifacts:** a **public GitHub repo**, a **5-minute pitch video** (unlisted is fine), and **the architecture** (no form field — it lives in the repo).
- **Not a prize hackathon.** There is no 1st/2nd/3rd. There is a **bar**, and a hiring panel. *"Your code speaks louder than your resume."*

## The real rubric — recovered from Razorpay's own JS bundle, not the visible page

The evaluation criteria are client-rendered and invisible to a normal visitor. Verbatim from `main.67f36351.js`:

```js
rubric: [
  { k:"Problem taste",    v:"did you pick something that actually matters" },
  { k:"Build quality",    v:"does it run, is it structured, would you trust it" },
  { k:"AI judgment",      v:"the right tool in the right place, and where you chose not to use one" },
  { k:"Failure recovery", v:"what broke, and what you did about it" }
]
```

**Four pillars, equal billing. No mention of novelty, model choice, UI polish, or scale.**

And the application checklist note, verbatim:
> *"12 answers. About 15 minutes. We still take the resume. We just don't screen on it. **The last one is the one we read first.**"*

"The last one" is **"What broke, and how you got out."** → **The failure narrative is the first-round screen.** Write it live, from day one. See Part 7.

**Track 01's bar, verbatim:** *"Every money action explainable, bounded and gated. Show the audit trail and one failure handled gracefully."*

---

# PART 1 — WHAT YOU ARE BUILDING

## Name
**`in.razorpay.upi` + Circular** — pick a single product name at build time. Suggested: **Circular**.

## The one sentence

> **Razorpay's own documentation tells merchants that UPI Reserve Pay guarantees collection. NPCI's circular says the opposite, in one sentence. A merchant who believes the documentation ships the goods, the debit declines, and the merchant eats the loss.**
>
> **We built the agent-payable Indian merchant that checks every payment claim against the circular that authorises it — and refuses, quoting the clause, when they don't match. We ran it against four real published documents. It caught all four.**

**Short form:** *An AI agent that verifies a merchant's payment terms against RBI and NPCI circulars before it spends — and can prove why it refused.*

⚠️ **v2 — re-narrated, not re-architected.** v1 framed this as a CI gate and read as a compliance linter. The architecture is unchanged; the **demo order** and the **metric's framing** changed. A reframe that tried to re-architect around "the customer's money gets stuck" was **rejected (60/100)** — see `research/10_idea_iterations/round_02/`.

## The two halves, and why neither works alone

| | Product surface (**A1**) | Measured core (**A4**) |
|---|---|---|
| What | A UCP payment handler `in.razorpay.upi` letting an agent pay an Indian merchant by UPI | A conformance engine: every numeric constraint must cite the clause authorising it |
| Strength | Best problem, best demo, judge verifies the "before" with one `curl` | The only irreplaceable LLM job; the only externally-sourced ground truth |
| Alone, fails because | **Ornamental AI** — fails rubric pillar 3 outright | **Reads as a linter**, not a working commerce product |

**They are one project.** A4 is the measured core; A1 is the host that makes it a product.

---

# PART 2 — THE PROBLEM (all verified; cite these, they are reproducible)

## 2.1 The UPI hole — a judge can reproduce this in ten seconds

```bash
curl -s https://zouk.co.in/.well-known/ucp | jq '.ucp.payment_handlers | keys'
# ["com.google.pay", "dev.shopify.card"]
```

Four live Indian D2C brands — `zouk.co.in`, `bombayshavingcompany.com`, `boat-lifestyle.com`, `mamaearth.in` — serve working **UCP** agentic-checkout profiles (`version 2026-04-08`, MCP endpoint `https://{shop}.myshopify.com/api/ucp/mcp`). All four declare exactly two payment handlers. **None accepts UPI.** Even the Google Pay handler is `"type": "CARD"` (VISA/MASTERCARD/AMEX/DISCOVER). `keys[]` — the merchant-attestation slot — is empty on all four.

> An AI agent shopping at an Indian brand, for an Indian customer, can pay by Visa, Mastercard, Amex, Discover or Diners Club — **in a country where UPI is 80%+ of digital payments.**

Archived evidence: `research/07_razorpay_winning_intersection/evidence/ucp_*.json`.

**Why it is buildable:** the handler is a self-declared JSON block against a published guide (`https://ucp.dev/specification/payment-handler-guide`, cited by Shopify's own live handler). **UCP explicitly invites a regional PSP to publish a handler with no committee approval** — the inverse of ACP, where Razorpay's six PRs have been stalled since 2026-05-15 awaiting a TSC sponsor.

## 2.2 The drift — four for four

**Every vendor restatement of an NPCI limit found in this entire research effort has been wrong.**

| # | Vendor | The claim | The circular | Failure mode |
|---|---|---|---|---|
| 1 | Razorpay, ACP SEP #216 | *"NPCI's UPI Circle specification imposes a hard **per-transaction** limit"* of ₹15,000 | OC-201 §7: ₹15,000 is the maximum **monthly** limit per delegation; per-transaction is **₹5,000** | **Scope — 3×** |
| 2 | Razorpay, official MCP server | *no limit stated or validated at all* | OC-228: **₹10,000** per block, **90 days** | **Omission** |
| 3 | Cashfree docs | cap is ₹10,000 **per month** | OC-228 §5 (twice): *"the **block** created to be maximum of Rs.10,000 of **block limit** and up to 90 days"* | **Period** |
| 4 | Razorpay Reserve Pay docs | *"**Guaranteed Collection:** Funds are pre-blocked, ensuring you receive payment regardless of customer's later financial situation."* | OC-228 acquirer §2: *"The block created shall **NOT** be treated as the guarantee of payment"* | **Semantic** |

**Two companies. Four distinct failure modes. A regex over rupee figures catches none of them — and #4 is not a figure at all.**

Timing kills the "legacy drift" defence: Razorpay's Reserve Pay launch blog is **12 Mar 2026**; the MCP server HEAD inspected is **26 Mar 2026**. The missing validation **shipped with the launch.**

## 2.3 ⚠️ HOW TO FRAME THIS — non-negotiable

**Never as a gotcha.** Naming an individual engineer's error to a panel that may include him is a bad trade, and it is not the point.

**The systemic framing, which is also the true one:**
> Constraint claims drift from the regulation that authorises them. We found **five** instances — across two companies **and this project itself** — in five different ways, during ordinary research. **Nothing catches this class of error.** Here is the mechanism that does.

**★ We are instance #5.** We wrote *"no tool revokes a block"* hours after our own source-read recorded `revoke_token`. See `FAILURES.md` #1. **Keep this in the pitch.** It removes any gotcha reading, it is the strongest evidence the mechanism is needed, and the failure box is the first thing they read.

The error is not the finding. **The absence of any mechanism that would catch it is the finding.**

---

# PART 3 — VERIFIED FACTS (with sources) AND THE TRAPS

## 3.1 UPI Circle — NPCI/UPI/OC No.201/2024-25, 13 Aug 2024
Read first-hand. `corpus/npci/OC-201_UPI_Circle.pdf`, SHA-256 `da9dcfbd7bdeca33…`

> §7 *"For full delegation, Members shall ensure a maximum **monthly limit of ₹15,000/- per delegation** and maximum **per transaction limit of ₹5000**"*
> §8 *"Existing UPI limits shall be applicable in case of **partial delegation**"*
> §9 *"during the cooling period – **first 24 hours, a daily transaction limit of ₹5000**"*
> §4 *"A primary user can delegate to **up to 5 secondary users** and a secondary user can accept delegation from **only one primary user**"*

⚠️ NPCI's **product page** says the first-24h limit is **₹2,000**; the **circular** says **₹5,000**. Divergence is real — cite the circular, note the divergence. **This divergence is itself a demo case.**

## 3.2 UPI Reserve Pay / SBMD — NPCI/UPI/OC No.228, 8 Oct 2025
Read first-hand. `corpus/npci/OC-228_SBMD_ReservePay_live-2026-08-26.pdf`, SHA-256 `f478fbc17a0391c8…`

> Issuer §5 / Acquirer §5(b): *"The block created to be maximum of **Rs.10,000 of block limit and up to 90 days**."* **No monthly cap exists.**
> Issuer §4: *"One mobile number (assumed as one customer) is allowed to create **only one block at a time for the particular merchant**."*
> Acquirer §1: *"…enabled only for **online verified merchants with low ticket and high frequency transactions**…"*
> Acquirer §2: *"The block created shall **not** be treated as the guarantee of payment…"*
> Acquirer §3: *"…acquiring entities may retry **maximum 3 times in 24 hours** (no retries for any other declines)."*
> Acquirer §5(c): *"Easy access on merchant's platform to **update and revoke** along with the responsibility of issuer to **validate every debit**."*
> Acquirer §5(d): *"The current block limits (**unutilised**) are always checked before initiating a debit."*
> Acquirer §5(e) / UPI Apps §2: *"Display of original block value, **remaining balance**, expiry date and transaction history (including creation, debits, modification)."*
> *"Members are advised to enable UPI Reserve Pay to **all UPI-permitted source of funds** (SA, CA, OD, RuPay Credit Card, pre-sanctioned Credit lines)."*

**The two rails are different. Never conflate them:**

| | **UPI Circle** (OC-201) | **UPI Reserve Pay / SBMD** (OC-228) |
|---|---|---|
| Delegates to | a secondary **person** | nobody — customer blocks **own** funds |
| Per-debit re-auth | AI Profiles: *"only initiated by explicit user action"* (OC-201B) | **none** |
| Limits | ₹5,000/txn, ₹15,000/month | ₹10,000/block, 90 days |
| Razorpay MCP support | **none** | **yes** — `token.type="single_block_multiple_debit"` |

**Reserve Pay is the rail Razorpay's agent surface implements. Build on it.**

## 3.3 The gap, stated correctly

`create_order` accepts `token.{max_amount, frequency, expire_at, type}`. Across all **43** MCP tools, that is the entire expressible spend authority.

**NPCI specifies materially more than Razorpay's agent surface implements:**

| NPCI requires (OC-228) | In Razorpay's MCP? |
|---|---|
| Block ≤ ₹10,000, ≤ 90 days | ❌ not validated |
| Retry ≤ 3 per 24h, timeouts only | ❌ no retry accounting |
| Unutilised balance checked before every debit | ❌ no tool returns remaining balance |
| ~~Revocation, easy access~~ | ✅ **`revoke_token` EXISTS — this row was my own drift, corrected. See `FAILURES.md` #1.** |
| Transaction history (creation, debits, modification) | ❌ |

> **The correct claim: NPCI specifies a good deal, and Razorpay's agent surface implements almost none of it.**
> **NOT** "NPCI specifies nothing beyond an amount" — that is false and we already corrected it.

## 3.4 ❌ CLAIMS YOU MUST NOT MAKE

| Do not say | Because |
|---|---|
| *"Nobody is building bounded agent mandates"* | **False.** `aryanpajnee/RazorpayBuildathon` does it competently — signed Ed25519 mandates, LLM structurally excluded from `core/`+`merchant/`, 153 real tests, live `FAILURES.md`. |
| *"The sell-side is unsolved"* | **False.** Shopify auto-generates UCP profiles, `llms.txt`, MCP endpoints. Agent-readiness auditing is an OSS genre since Apr 2026. **Catalog legibility is solved; payment is not.** |
| *"NPCI UAP requires RBI approval"* / building on UAP | **Not live.** Zero matches for `agentic`/`unified agent`/`UAP` across **all 221 NPCI UPI circulars 2019–2026**. Rests on one anonymously-sourced Business Standard piece. Correct name: *Unified Agent Protocol*. **Cite as the slot; never assert.** |
| *"NPCI enforces no payee/velocity restriction"* | **False** — corrected in §3.2. |
| *"This block may only be debited by the bound merchant"* | **`INFERENCE`, not verbatim.** That sentence is in neither circular. Annex A is unpublished. |
| Any framing as an exploit of the OTP/AFA flow | Track 02's disqualifier is offense-capability. Stay defensive; we are Track 01 regardless. |

## 3.5 Other traps
- **Razorpay TSP has no public API** — zero hits across 2,282 doc URLs. Stub and declare.
- **Test-mode signup hard-gates on Business PAN.** Escape: submit personal PAN, choose business type **Individual** (*not* Sole Proprietorship), then **"Get test keys"** appears **in the top nav**, not the flow. Don't fill bank details.
- **NPCI 403s all programmatic access.** Use Wayback (288 circulars archived) or a cleared headless browser. ⚠️ **Many snapshots are 1–3 KB Imperva bot-protection HTML wearing a `.pdf` extension.** Always check `file` and size. One is quarantined in `corpus/npci/` as a live example.
- **NPCI circulars are scans with no text layer.** Pages are `/Rotate 270` — un-rotate before rendering or content is clipped. Pipeline in `corpus/npci/PROVENANCE.md`.
- **ACP ≠ UCP tool names.** ACP `create_checkout_session` vs UCP `create_checkout`. Not interchangeable.
- **AP2 v0.2 renamed mandates** to Checkout/Payment (not Intent/Cart) and specifies **ECDSA, not Ed25519** — several Buildathon repos get this wrong.
- Webhook blacklist: ngrok.io, webhook.site, RequestBin, Beeceptor. Use `zrok`.
- `create_refund` is **not** available on the remote MCP server — needs the local Docker server.

---

# PART 4 — ARCHITECTURE

## 4.1 Principles (these ARE the rubric)

1. **The LLM never touches the money path.** Quoting, limit arithmetic, gate decisions, signature verification, idempotency: deterministic. The model does one job — Part 4.3.
2. **All money is integer paise.** No float ever touches a monetary value.
3. **No numeric bound may exist without a citation.** Enforced in CI. An uncited limit fails the build.
4. **Refusal is a first-class outcome**, counted and reported, never hidden.
5. **`UNDETERMINED` is a valid answer** and is counted separately from pass/fail.

## 4.2 Components

```
┌─ corpus/            Checksummed NPCI/RBI PDFs + provenance (already built)
│
├─ extract/           ★ THE ONLY LLM. Scanned circular page → ConstraintClaim[]
│                       {value_paise, unit, scope, subject, clause_ref, page, quote, confidence}
│
├─ store/             Normalised claims. Immutable. Every row carries doc SHA-256 + clause + quote.
│
├─ conform/           DETERMINISTIC. Declared constraint × authorising clause
│                       → PASS | FAIL(reason) | UNDETERMINED(why) + citation
│
├─ handler/           UCP payment handler `in.razorpay.upi`
│                       - handler declaration JSON (spec-conformant)
│                       - /.well-known/ucp publication
│                       - MCP tools: create_checkout, update_checkout, complete_checkout
│
├─ gate/              DETERMINISTIC ENFORCEMENT, per debit:
│                       amount ≤ block_limit · remaining_balance ≥ amount · not expired
│                       · retry ≤ 3/24h (timeouts only) · merchant binding · block ≤ ₹10,000/90d
│                       Every decision emits a refusal code + the clause it came from.
│
├─ ledger/            Hash-chained audit log. Append-only. Every decision + citation + inputs.
│
├─ buyer/             Agent harness driving purchases, incl. adversarial cases. LLM here is fine.
│
└─ eval/              ★ THE DIFFERENTIATOR. See Part 5.
```

## 4.3 Where the LLM is load-bearing — the pillar-3 argument

**The one irreplaceable job: joint extraction of `value + unit + scope` from scanned circulars.**

OC-201 §7 contains **three rupee figures with three different scopes in one paragraph**: ₹15,000 (monthly, per delegation, full-delegation only), ₹5,000 (per transaction), and — in §9 — a *different* ₹5,000 (daily, first 24 hours, both delegation types).

> **The naive baseline — "first ₹ figure near the word 'limit'" — returns ₹15,000 and mislabels it. That is exactly the error that shipped in Razorpay's SEP #216 and stood for four months.**

The deterministic alternative is not hypothetically worse. **It is the bug that actually shipped.** That is the strongest possible pillar-3 argument, and it is demonstrated on the document where the failure occurred — not on an example we authored.

## 4.4 ★ MANDATORY: the deliberate-non-use table

Rubric pillar 3 is *"the right tool in the right place, **and where you chose not to use one**."* Publish this in `ARCHITECTURE.md` as a table:

| Component | LLM? | Why / why not |
|---|---|---|
| Circular extraction | **Yes** | Joint value+unit+scope resolution; naive baseline reproduces a shipped 3× bug |
| Conformance comparison | **No** | Integer comparison. A model here would add nondeterminism to a decidable question. |
| Enforcement gate | **No** | Money path. Must be auditable and replayable. |
| Limit arithmetic | **No** | Integer paise. |
| Idempotency / signatures | **No** | Cryptographic and deterministic by definition. |
| Retry-velocity accounting | **No** | Counting. |
| Buyer agent | **Yes** | Goal decomposition, product selection — off the money path. |

**Most entrants will not have this table. It is a direct hit on the most discriminating clause on the site.**

---

# PART 5 — MEASUREMENT (this is what wins)

## 5.1 Why this is the differentiation

A forensic pass over the live field (261 repos; top band analysed) found:

> **Every measured repo has a compromised measurement target. Not one survives a determined 30-second attack. The field has learned to measure carefully; it has not learned to check *what* it is measuring.**

Documented: a depth-3 tree recovers 99.18% of one repo's labels; one "holdout" scores accuracy 1.0 with a perfectly diagonal confusion matrix; a 6.38× uplift rests on a baseline that recovers 0% *by construction*; deleting **all** identifier edges from a device/IP graph reproduces 100/100 results byte-identically; "640 trials" was 234 parses. Roughly **30% genuine / 50% compromised-or-inert / 20% theatre.**

**Our headline number must survive that attack. Nothing else in the field does.**

## 5.2 The primary metric

**Conformance detection over ≥50 payment-constraint claims** — framed as a **conformance rate**, not an accuracy score. *"Claims checked / violations found / clause cited"* reads as product output; *"extraction accuracy"* reads as a benchmark. Same computation, different headline.

**Over ≥50 constraint claims** drawn from documents **we did not author**: NPCI circulars, RBI directions, published PSP specs (ACP SEPs, UCP handler declarations, vendor docs).

Report, on the same line as the headline:
- **effective n** (claims actually parsed / claims attempted)
- **the naive baseline** ("first ₹ figure near 'limit'") — which reproduces the shipped 3× error
- **an ablation** deleting the extraction stage → conformance collapses (proves it is load-bearing)
- **refusals and `UNDETERMINED`** as first-class counted outcomes
- **induced harm in the same font as the win** — every case where we wrongly flagged a correct claim

## 5.3 The out-of-sample hit — the demo's killer moment

Run the checker over documents it has never seen, and it correctly flags **4/4** real published claims:
1. Razorpay SEP #216 — scope error (3×)
2. Razorpay MCP server — omission
3. Cashfree docs — period error
4. Razorpay Reserve Pay docs — semantic error

**This is not a self-authored test set. These are live, published, third-party documents, and the system is right about all four.**

## 5.4 Anti-tautology checklist — run before publishing any number

- [ ] Could a trivial baseline (stump, regex, single feature) recover my label? **Try it and report the result.**
- [ ] Did I write both the input and the label? If yes, **it is not a measurement.**
- [ ] Is my baseline one a competent engineer would actually deploy? (Razorpay ships Smart Retry — **a straw-man baseline is the fastest way to lose this panel.**)
- [ ] If I delete my central mechanism, do results change? **If not, say so.**
- [ ] Is effective n printed next to the headline?
- [ ] Are refusals counted, or silently dropped?

---

# PART 6 — THE 5-MINUTE DEMO

| # | Scene | Beat |
|---|---|---|
| 1 | **The hole** | `curl https://zouk.co.in/.well-known/ucp` → `com.google.pay`, `dev.shopify.card`. **No UPI**, in a country that is 80%+ UPI. |
| 2 | **The money** ★ | Merchant reads *"Guaranteed Collection"*, ships the service (OC-228 §4 permits post-service debit for metered categories), **debit declines, merchant eats it — rupees on screen.** Then the circular, one sentence: *"shall NOT be treated as the guarantee of payment."* |
| 3 | **The check** | Our agent reads the merchant's declared terms, resolves the claim against OC-228, and **refuses — quoting the clause.** |
| 4 | **Controlled execution** | A conformant purchase completes: real Razorpay **test-mode** payment, inside the bound, hash-chained receipt. |
| 5 | **The closer** ★ | Point it at four real published documents — two Razorpay, one Cashfree, **one our own**. **4/4, including ours.** |

**Money first, mechanism second, out-of-sample last.** That ordering is what stops it reading as a linter.

**Keep the demo cart under ₹5,000** (per-transaction ceiling) and the block under ₹10,000.

---

# PART 7 — `FAILURES.md` — WRITE IT FROM COMMIT ONE

*"The last one is the one we read first."*

**Write it live, as things break.** Do not reconstruct it at submission time — it reads differently and they will know.

Per entry: **What broke** · **How I got out** · **What I'd tell the next person** · **Cost (time)** · **Verified (evidence it's fixed)**.

Failures already guaranteed by this project — genuine and unchosen:
- NPCI 403s all programmatic access
- Wayback snapshots that are Imperva bot-pages wearing `.pdf`
- Scanned circulars with no text layer, rotated 270°
- The two-rails confusion (Circle vs Reserve Pay) — **we made this error ourselves and corrected it; that is worth telling**
- Razorpay test-mode signup gating on Business PAN

⚠️ **A competitor is already writing theirs live.** This is table stakes now, not an edge.

---

# PART 8 — BUILD ORDER

**Day 1 — kill gates before any feature code.**
1. ✅ **Kill-gate 1 CLEARED** — 288 circulars archived; OC-201, OC-228, OC-200 retrieved, read, checksummed in `corpus/npci/`.
2. ⚠️ **Kill-gate 2 — OPEN.** Run `python3 tools/probe_testmode.py` with `rzp_test_` keys in `.env`. It refuses live keys and creates orders only.
   - **PASS** → build the real mandate path.
   - **FAIL** → **fall back to UPI Autopay**, stub the delegation layer, and **declare the stub prominently.** Not a flaw — the tracks already require synthetic data.

**Days 2–3** — extractor + store + ≥50-claim eval set from third-party documents. **Build the eval harness before the product.**
**Days 4–5** — conformance engine + CI gate that fails the build on an uncited number.
**Days 6–7** — UCP handler, `/.well-known/ucp`, MCP tools, enforcement gate, hash-chained ledger.
**Day 8** — buyer agent, adversarial cases, the 4/4 out-of-sample run.
**Day 9** — `ARCHITECTURE.md`, non-use table, README, clone-and-run verification **on a clean machine**.
**Day 10** — video, final `FAILURES.md` pass, submit.

⚠️ **"Does it run" is a graded pillar.** Pin dependencies, ship seed data, and verify `git clone && <one command>` works from scratch. A reviewer will try it.

---

# PART 9 — INTEGRITY RULES FOR THE BUILD

**Our entire thesis is that vendors misstate NPCI limits. The one unacceptable outcome is us doing the same thing.**

- Every numeric bound in the codebase carries: circular number · date · clause · quote · document SHA-256.
- **CI fails on an uncited number.** This is the product and the discipline simultaneously.
- Label **FACT / INFERENCE / HYPOTHESIS** in docs. Write **`EVIDENCE NOT FOUND`** rather than guessing.
- Distinguish primary (NPCI/RBI) from secondary (press, mirrors) from vendor (marketing).
- When corrected, **strike through and annotate** — never silently edit. (See `RAIL_RECONCILIATION.md` for the pattern.)
- Never claim a capability you have not executed. If Reserve Pay is stubbed, **say so in the README, the architecture doc, and the video.**

---

# PART 10 — SUBMISSION CHECKLIST

- [ ] Public GitHub repo, clones and runs on a clean machine
- [ ] `ARCHITECTURE.md` with diagram, data flow, **and the deliberate-non-use table**
- [ ] `FAILURES.md`, written live
- [ ] `EVAL.md` — headline metric with effective n, baseline, ablation, refusals, induced harm
- [ ] The 4/4 out-of-sample conformance run, reproducible
- [ ] Hash-chained audit ledger, verifiable in both directions
- [ ] 5-minute video (unlisted YouTube fine) — **do not run over**
- [ ] Form: Track 01 · project name · what it solves · repo URL · video URL · **"What broke, and how you got out"** (write this last, and write it well)
- [ ] Resume ready (they take it; they don't screen on it)
- [ ] **Do not submit early. No edits after submission.**

---

## Scores at time of writing
Global hackathon strength **82/100** · Razorpay fit **88–95/100** · **Confidence 84/100**.
Held below 90 solely by kill-gate 2. **Fallback if it fails:** Payer's Conscience (buyer-side Section 43B(h) payables agent, 73/74) — the only escape axis a judge cannot rebut, and it needs zero test-mode access.
