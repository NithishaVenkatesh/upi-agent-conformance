# How protocol/payments and AI-native hackathon winners actually document architecture

**Empirical corpus. n = 45 repositories, all verified to exist and all READMEs + full file trees retrieved via `gh api` on 2026-08-26.**

**Scope:** the two hackathon families closest to our own submission —
(a) **protocol/payments**: ETHGlobal Lisbon 2026 (H036), Algorand Builders Berlin 2026 (H022), EF x402 (H019), Solana x402 (H020/H041), Coinbase + Google AP2 tracks (H021), Cronos/DoraHacks (H038), SKALE/Virtuals;
(b) **AI-native/agent**: MCP_HACK//26 + AgentGateway (H027), Google ADK (H024), GKE Turns 10 (H028), TrueFoundry/Crusoe Resilient Agents (H030), Redis AI (H029), AWS Amazon Q (H023), Foxit (H031).

**Method.** For each repo: `gh api repos/{o}/{r}/readme` (raw) and `gh api repos/{o}/{r}/git/trees/{default}?recursive=1`; then programmatic extraction of headings, fenced-block diagram classification, marker regexes; then manual reading of the 14 separate architecture/design documents that exist across the corpus. No repo is listed that was not fetched. Placements are carried forward from `research/02_hackathons/REPO_SHORTLIST.md` (organizer-confirmed unless marked `?`).

**This document reports what these projects did. It does not recommend.**

---

## 1. Headline quantified findings

Every number below is over the same n = 45 unless stated.

1. **32 of 45 (71%) have architecture content inside the README; only 6 of 45 (13%) have a file literally named `architecture.md`/`ARCHITECTURE.md`.** Counting all separate design documents (`MECHANISM.md`, `APPROVAL_RAILS.md`, `DESIGN_AND_APPROACH.md`, an ADR, `RECEIPT.md`, `bounty-coverage.md`), **10 of 45 (22%)** ship architecture outside the README. **13 of 45 (29%) have no section that could be called architecture anywhere** — including two winners (`BackTrackCo/x402r-sdk`, EF x402 winner; `sergeyshemyakov/juicebagmail`, H022 1st).

2. **The architecture section is short. Median 137 words for the 32 that have one; 21 of those 32 (66%) are under 200 words.** Median across all 45 is 93 words. Median whole-README length is 976 words (Q1 579, Q3 1,435; min 69, max 11,444). The architecture section is typically **10–20% of the README**.

3. **ASCII box diagrams beat Mermaid roughly 2.5 : 1.** 20 of 45 (44%) have at least one ASCII/box-drawing diagram; **only 8 of 45 (18%) use Mermaid**; 9 of 45 (20%) embed a raster/vector image. **16 of 45 (36%) have no diagram of any kind** — including outright winners `BackTrackCo/x402r-sdk`, `sergeyshemyakov/juicebagmail`, `georgeIshaq/Auto_Security`, `Unknown1502/Compliance-Guardian-AI` (whose 6 PNG diagrams sit in `diagrams/` and are **never referenced from the README**).

4. **Tables carry more architecture than diagrams do.** 33 of 45 READMEs contain markdown tables; the median table-row count among those is ~15. The single most information-dense architecture artifacts in the corpus are tables, not pictures: Aegis's 7-layer table (`Layer | Job | Owner | Invariant monitored`), HumanMandate's refusal table (`case | revert selector | mainnet tx link`), Hourglass's `Trust model` table (`risk | what prevents it`).

5. **Deployment/run instructions dominate everything.** 39 of 45 (86%) have a Quick Start / Setup section — the single most common bucket, more common than "what it does" (51%) or "architecture" (46%). Median README allocates more words to `npm install` than to system design.

6. **Evaluation is essentially undocumented as a first-class artifact. 0 of 45 have an `EVAL.md` or `BENCHMARK.md`.** 18 of 45 (40%) mention any metric at all, and most of those are a bare test count in prose (`# 50 tests, 0 fail, ~150 assertions, <1s`). Exactly **3 repos present quantitative results in tabular form** (`Hokutoman00/aegis-resilient-agents` demo-scenario matrix, `MukundaKatta/crusoe-nemotron-harness` before/after run report, `LingSiewWin/HumanMandate` outcome/tx table). **0 have an ablation.** 10 of 45 (22%) have CI workflows; 14 of 45 (31%) show any badge.

7. **Failure handling is documented by 13 of 45 (29%)** and almost always as a *feature list*, not a taxonomy. The corpus contains exactly **one** systematic failure taxonomy (Aegis, 7 named layers each with a stated invariant and a Toxiproxy-injected demo scenario).

8. **Audit/receipt/provenance is the single strongest documentation habit in the payments half: 15 of 45 (33%) document an audit trail, receipt, or provenance mechanism** — and among the payments-family repos specifically it is closer to half. This is the one depth marker where money-touching projects clearly out-document AI-native ones.

9. **The human-in-the-loop boundary is documented by only 8 of 45 (18%), and "where we deliberately did NOT use an LLM" by only 8 of 45 (18%)** — with real overlap. Only **two** repos in the entire corpus state the no-LLM boundary as an explicit design claim rather than an incidental word: `ikodo0/deeptrace` ("**No model in the loop.** DeepTrace never calls an AI provider") and `SweetieBirdX/Kinora` ("**The buyer's haggle is rule-based, not an LLM.** Three rules… Light strategy, deliberately").

10. **A "limits / honesty / what we did not build" section appears in only 9 of 45 (20%) — but it is disproportionately concentrated in the strongest repos.** `idoamram/planbound` ("Honesty box", ~700 words), `SweetieBirdX/Kinora` ("Scope & known limitations" + `docs/bounty-coverage.md` §"Deliberately not done"), `ikodo0/deeptrace` ("What it does not do"), `jfsgomes/joule` (`docs/MECHANISM.md` §§"Limit 1–4"), `intuition-box/Hourglass` (a section literally titled **"Defect"** describing an exploitable hole in their own cap enforcement). Four of these five are ETHGlobal H036.

**Bonus finding — scaling is a non-topic.** Only 4 of 45 (9%) mention scaling, auto-scaling, or load balancing, and 2 of those are the AWS/Kubernetes repos where it is boilerplate. State/session modelling appears in 7 of 45 (16%). Cost appears in 13 of 45 (29%) but almost entirely as *product* pricing, not *inference* cost — the exception is `MukundaKatta/crusoe-nemotron-harness`, which is a cost-and-budget harness.

---

## 2. Section taxonomy by frequency

Buckets are over the 45 READMEs; a repo counts once per bucket.

| Section bucket | Repos | % | Most common verbatim heading forms |
|---|---:|---:|---|
| Quick start / Setup / Run it | 39 | 86% | `## Quick Start` (13), `## Setup` (4), `## Prerequisites` (4), `## Run it yourself`, `## Run locally`, `## Build & run` |
| What it does / Features / Solution | 23 | 51% | `## What It Does` (4), `## Key Features` (4), `## Features` (4), `## Overview` (4), `## What you get` (3), `## The solution` |
| **Architecture** | **21** | **46%** | `## Architecture` (17), `## Architecture Overview`, `## Current Architecture`, `## System Architecture`, `## 🔄 Architecture Flow` |
| License / Team / Ack | 20 | 44% | `## License` (16), `## Contributing` (6), `## Acknowledgments` (3), `## AI usage disclosure` |
| Tests / Verification | 19 | 42% | `## Tests`, `## Verify`, `## Verifying it`, `## Verify it without trusting this repo`, `## Validation`, `## Headless proofs (no browser)` |
| How it works / Flow | 18 | 40% | `## How it works` (8), `## How It Works (Architecture)`, `## Detection Flow`, `## Protocol Flow`, `## Core Mechanism`, `## The x402 Flow` |
| Repo layout / Project structure | 18 | 40% | `## Project Structure` (7), `## Repo layout` (3), `## Repository structure`, `## Monorepo Structure`, `## What is in this repo` |
| Docs links / TOC | 18 | 40% | `## Documentation` (4), `## Docs` (3), `## Table of Contents` (3), `## Links` (3), `## References` |
| Deployment | 16 | 35% | `## Deploy`, `## Production Deployment`, `## ☸️ Kubernetes Deployment (GCP)`, `## Docker Images` |
| Config / Env | 15 | 33% | `## Configuration` (6), `### Environment variables`, `## Required env` |
| Demo | 14 | 31% | `## The demo`, `## Demo Flow`, `## Demo Beat`, `## What Judges Should Try`, `## Judges Start Here`, `## Director Mode 🎬` |
| Problem | 13 | 28% | `## The Problem`, `## Why this matters` (3), `## Why`, `## The Problem Nobody Talks About` |
| Roadmap / Future / Status | 13 | 28% | `## Roadmap` (3), `## Status` (3), `## Future Improvements`, `## Development Status` |
| API reference / Endpoints / Tools | 11 | 24% | `## API Reference` (3), `## MCP Tools` (3), `## API Endpoints`, `### Endpoints`, `## Tools` |
| Tech stack | 10 | 22% | `## Tech Stack` (5), `## Technology Stack` (4), `## Hackathon stack` |
| **Limits / Honesty / Scope** | **9** | **20%** | `## Honesty box`, `## Scope & known limitations`, `## What it does not do`, `## Hackathon Scope Limitations`, `## Gotchas`, `## Known Issues & Contributions` |
| Security / Trust model | 8 | 17% | `## Security` (3), `## Trust model`, `## Security Notes`, `## Security Architecture` |

### The canonical winner README skeleton (modal order)

Reconstructed from the 21 repos that have an architecture section, in the order the headings actually appear:

```
# <Name> — <one-line what-it-is>
<bold one-sentence hook or blockquote>
## The problem / Why this matters        (28%)
## What it does / What you get           (51%)
## How it works  OR  ## Architecture     (46% / 40%)   ← 137 median words + one ASCII box diagram
## Tech stack                            (22%)
## Repo layout                           (40%)
## Quick start / Run it                  (86%)   ← usually the LONGEST section
## Tests / Verify                        (42%)
## Roadmap / Status                      (28%)
## License                               (36%)
```

Two variants deviate meaningfully and both are strong repos:
- **Judge-first** (`liminalshruti/algorand-berlin-2026`): `## Judges Start Here` → `## Source Of Truth` → `## Current Architecture` → `## Run It` → `## Demo Beat` → `## Status` → `## Verify`. Eight headings, 1,435 words, zero diagrams.
- **Claim-then-proof** (`SweetieBirdX/Kinora`, `LingSiewWin/HumanMandate`, `idoamram/planbound`): each architectural claim is immediately followed by a verifiable artifact — a mainnet tx hash, a `cast run` selector, a script name. Kinora's headings run `## What this targets` → `### The No-Solidity claim, and how to check it` → `## Architecture` → `## How the payment flow works` (6 numbered sub-beats) → `## The three gates` → `## Verifying it` → `## Verify it without trusting this repo` → `## Scope & known limitations`.

### Structure of the 6 separate architecture files (verbatim headings, in order)

| File | Words | Headings in order |
|---|---:|---|
| `Hokutoman00/aegis-resilient-agents` → `docs/ARCHITECTURE.md` | 1,484 | System overview · The 7 layers · L0 Hedge · L1 Retry · L2 Model fallback · L3 Provider fallback · L4 Semantic error fallback · L5 Graceful degradation contract · L6 Continuous self-chaos (shadow) · L0 MCP tool classification (preventing side-effect doubling) · Receipt · TF SPOF bypass (L3 fall-through) · Implementation order · References |
| `rustamino/team-localhost-x402` → `architecture.md` | 1,564 | Overview · Components · Flow · 0. Budget Authorization (one-time per session) · 1. Upload and Slicing · 2. Collecting Offers · 3. Fetching 402 Metadata (price discovery) · 4. Agentic Offer Selection · 5. Autonomous Payment (x402 client flow) · 6. Session Cleanup · Printer x402 Resource Server · Algorand / USDC Details · Pricing · Data Flow Summary · Hackathon Scope Limitations |
| `Unknown1502/Compliance-Guardian-AI` → `docs/ARCHITECTURE.md` | 1,699 | System Overview · Architecture Diagram · Core Components (API Gateway Layer, Compute Layer ×6 Lambdas, AI/ML Layer, Storage Layer) · Data Flow · Security Architecture · Scalability · Monitoring & Observability · Deployment Architecture · Performance Optimization · Disaster Recovery · Technology Stack Summary · Design Principles · Future Enhancements · References |
| `techwithhuz/mcp-security-governance` → `docs/DESIGN_AND_APPROACH.md` | 1,552 | (repo also ships `HARDENING_ARCHITECTURE.md`, `SKILL_GOVERNANCE_SCORING_ARCHITECTURE.md`, and 20+ other docs) |
| `TriplEight/SPM` → `docs/architecture.md` | 241 | *single heading:* `# SPM Architecture (imported into project memory)` — a flat prose paragraph beginning "Flow: agent → …" |
| `pincerclaw/pincer-x402-starter` → `docs/architecture.md` | 230 | Architecture · Protocol Flow · Key Components (Resource Server, Facilitator, Sponsors) |

The two **best-structured design documents in the corpus are not called "architecture"**:

- `den-vasyliev/agentregistry-inventory` → `docs/adr/001-inventory-over-runtime-architecture.md` (980w) — a textbook ADR: **Context · Decision · Core Principle · Sub-Decisions (6) · Alternatives Considered (3, each named and rejected with reasons) · Consequences (Positive / Negative / Risks)**. The only repo in 45 with a real "alternatives considered" section.
- `jfsgomes/joule` → `docs/MECHANISM.md` (4,887w) — an economic-mechanism spec: **What `faceValue` actually is · Parameters used throughout · The cast · Ledger, step by step (Setup / Redemption starts / Path A — delivered / Path B — timeout) · The property that makes `coverageRatio = 2` non-arbitrary · What the token is actually worth — there is no enforced price floor · Settlement: two paths, chosen by the verifier · Why the challenge half is not optional · The arbiter is the trust assumption — name it · The narrower claim this forces · Limits (4, each named) · Buyer protection is a separate claim — don't weld them together**.

---

## 3. README openings — what winners lead with

Classification of the first non-heading, non-badge line of all 45 READMEs:

| Opening move | Repos | % |
|---|---:|---:|
| **Capability sentence** ("X does Y") | 22 | 49% |
| **Bold/blockquote thesis or provocation** | 13 | 29% |
| Problem statement | 5 | 11% |
| Table of contents / meta | 3 | 7% |
| Demo link / live URL first | 2 | 4% |

**Nobody leads with tech stack.** Zero of 45 open with "Built with React, FastAPI and Postgres."

Representative first-two-sentences, verbatim:

- `LingSiewWin/HumanMandate` (H036) — *"**An allowance bound to a person, not an address.** Credit cards bind to a card. ERC-20 allowances bind to an address. Revoke either and the counterparty spins up a new credential."*
- `idoamram/planbound` (H036) — *"**Your agent asks for a plan, not a payment.** An AI agent that spends today either gets a funded key (no budget, no scope, no kill switch)…"*
- `QuisTech/foxitsentinelpro` (H031 WINNER) — *"> _A deal died. Not because the terms were wrong — but because no one could prove the document hadn't been altered._"*
- `sairammr/0g-permissions` (H036) — *"**Your AI agent gets a wallet. You keep the kill switch. Spend-capped permissions on 0G.**"*
- `Hokutoman00/aegis-resilient-agents` (H030 WINNER) — *"> **Hedge first, fallback second, continuously chaos-verified.**"*
- `intuition-box/Hourglass` (H036) — *"**Recurring on-chain payment agreements for Safe treasuries. Sign once, get charged every period — capped on-chain, documented on IPFS, revocable at any time.**"*
- `SweetieBirdX/Kinora` (H036) — *"**A music rights marketplace where two AI agents negotiate a licence and settle it themselves — on Hedera, with no Solidity anywhere.**"*
- `ikodo0/deeptrace` (H036, 3rd The Graph) — *"**Verifiable Base DeFi data for builders and AI agents.**"*
- `merdandt/SalesShortcut` (H024 Grand Prize) — *"A comprehensive AI-powered Sales Development Representative (SDR) system built with multi-agent architecture for automated lead generation, research, proposal generation, and outreach."* (the generic capability-sentence form, from the most-starred repo in the set)
- `julian-hecker/gke-hackathon` (H028 Honorable Mention) — *"Phone agent that can respond to banking inquiries in real time."* — **the entire README is 85 words**, three headings, one PNG.

**Observation with a count:** among the 13 that open with a bold thesis, 9 (69%) also carry at least one of {Limits section, HITL boundary, refusal documentation}. Among the 22 that open with a plain capability sentence, only 4 (18%) do.

---

## 4. Money-safety, bounds, refusal and audit trails — how payments winners document them

This is the strongest documentation cluster in the corpus and the one with the most transferable form. **The dominant pattern is: state the bound as an invariant, then link a transaction that proves the bound fired.** Refusals are documented as *evidence*, not as caveats.

### 4.1 The refusal-as-evidence table

`LingSiewWin/HumanMandate` (ETHGlobal H036, World Chain **mainnet**) is the purest instance. It documents four separate refusal cases, each as a row with the exact Solidity custom-error selector and a live mainnet explorer link:

> "Every branch that ends in a refusal is a real mainnet transaction, linked further down."
>
> "A revert here is a **designed refusal**, mined deliberately so it can be verified. Every selector was recovered with `cast run` and matched against `cast sig` — not guessed."
>
> | A wallet with **no human** behind it | `0x203ac8ca NotHumanBacked` | [`0x9ebb088a…1f0e`] |
> | Settle demanding a floor the route cannot pay | `0x76baadda SlippageTooHigh` | [`0x354bd126…4ea1f`] |
>
> "The refusal is the point. Quoted output was 939042 base units; demanding 1878084 was refused with both figures in the revert data."
>
> Test name, verbatim: `test_a_bad_route_is_refused_even_though_the_cap_was_respected` — *"the cap is obeyed and the transaction is still refused"*.

That last test name is the most compact statement of layered bounds in the whole corpus: it documents that passing one gate is not passing all of them.

### 4.2 Bounds documented as an enforced invariant, with the enforcer named

`intuition-box/Hourglass` (H036):

> "In every case the payer's obligation is bounded by the on-chain cap, and the payment stops the moment the delegation is revoked."
>
> "The `ERC20PeriodTransferEnforcer` caveat enforces the cap on-chain: at most the agreed amount per period, and a second charge within the same period reverts."
>
> "**Revoke whenever.** The Safe disables the delegation on-chain (`disableDelegation`…). Any later charge attempt reverts with `CannotUseADisabledDelegation`."

Plus a `## Trust model` table mapping each risk to the mechanism that prevents it, e.g. *"Signature bound to the exact agreement text | Cryptographic (delegation salt = `keccak256(terms)`)"* and *"Replay across chains or terms | Prevented by the EIP-712 domain (chainId + `DelegationManager`) and the unique salt"*.

`TeddyHuZz/solvent` (H041) states the invariant and its blast radius in one sentence:

> "The on-chain program **guarantees** the agent can never spend more than its allowance, making it truly trustless. The owner's main funds are always 100% safe."

`Dakavon/algorand-x402-hackathon` (H022, 2nd) compresses it to a bullet: *"🛡️ **Spend policy** — the agent refuses to exceed its budget/price cap (\"Budget exhausted\")."*

`RequestTap/RequestTap-Router` (H021 1st, Google AP2) documents bounds as protocol features: *"**AP2 Mandates** - Spend caps, tool allowlists, expiry, signature verification (Mandate + IntentMandate)"* and *"**Receipts** - Structured JSON receipts for every request (SUCCESS, DENIED, ERROR)"* — note the **DENIED receipt is a first-class outcome**, not an error path.

### 4.3 Self-disclosed defects in one's own safety mechanism

The single most unusual document in the corpus is `intuition-box/Hourglass` → `docs/APPROVAL_RAILS.md`, which contains a section headed **`## 5. Defect: the DCA per-swap cap does not bind`**:

> "The enforcer reads `balanceOf(recipient)` before and after the execution. Per §1 the module holds no tokens — its balance is 0 before and 0 after. **The observed delta is always 0, so it is always within cap. The per-swap loss limit never binds**, while the UI states \"Enforced on-chain\"."
>
> "The codebase disagrees with its own call site in three places: … `docs/DCA_IMPLEMENTATION_PLAN.md`, `docs/STRATEGY_IMPLEMENTATION_PLAN.md`, `docs/HOURGLASS_STRATEGIES.md` — all three specify `recipient: Safe`."
>
> "**Scope of the exposure.** The `functionCall` scope still holds, so this is not unlimited theft of arbitrary assets. But within those targets the agent can spend the Safe's entire funding-token balance in one swap instead of being held to `capPerSwap`."
>
> "**Fix:** `recipient: safe.safeAddress`. This changes `mandateSalt` … invalidating existing signed mandates — acceptable, since they enforce nothing today."
>
> "**Yield is not affected:** it passes `recipient: safeAddress` … so it does not depend on the measured account at all."

Structure worth noting: *defect → mechanism of the defect → where the docs and the code disagree → scope of exposure (bounded, explicitly) → fix and its cost → what is NOT affected*. This is one of only two places in 45 repos where a team documents a live hole in its own money-safety control.

### 4.4 Audit trail / receipt / provenance

15 of 45 (33%) document one. The forms found:

| Form | Repos |
|---|---|
| Signed structured receipt per response, with a published schema | `Hokutoman00/aegis-resilient-agents` (`docs/RECEIPT.md`, 868w, with a field reference for every key incl. `cost_usd_total`, `layers_fired`, `l6_chaos`, `signature`) |
| Independent append-only log per settled payment | `dhernz/Glassbox402`, `SweetieBirdX/Kinora` (Hedera HCS consensus topic) |
| SHA-256 hash at every pipeline stage → tamper-evident ledger | `QuisTech/foxitsentinelpro` |
| Explorer-link-per-claim (every assertion carries a tx hash) | `LingSiewWin/HumanMandate`, `SweetieBirdX/Kinora`, `jfsgomes/joule`, `sairammr/0g-permissions` |
| Structured JSON receipt with DENIED as an outcome class | `RequestTap/RequestTap-Router` |
| Provenance/coverage/freshness fields on every response | `ikodo0/deeptrace` |
| Git history as the audit log | `jfsgomes/joule` — *"`Co-Authored-By: Claude Opus 5` trailer — the git history is the audit log."* |

Quotes:

- `QuisTech/foxitsentinelpro` (H031 WINNER) frames the audit trail as the product: *"Every action — template selected, data injected, PDF generated, watermark applied — is SHA-256 hashed and written to a tamper-evident ledger. Stakeholders can verify document integrity at any future point."* Preceded by the problem framing *"🕳️ No audit trail — \"I sent it Tuesday\" is not a legal defense."*
- `Hokutoman00/aegis-resilient-agents`: *"Every response carries a signed **Aegis Receipt** — a JSON envelope showing which providers were tried, which layers fired, which contract budgets were spent, and how long ago Aegis last survived a chaos drill."*
- `SweetieBirdX/Kinora` states the *limit* of its own audit trail: *"**The compliance attestation is self-issued.** The seller attests the buyer against its own allow-list and writes the result to a consensus topic — a real, public, tamper-evident record, but **not third-party verification**."*
- `SweetieBirdX/Kinora` documents an information-leak property of refusals: *"**Only a price refusal discloses the floor.** A licence-type or use-case refusal says *\"this is not a matter of price\"* and reveals nothing further — so an agent cannot map the catalogue by probing with bids."* And: *"A mismatch deliberately does **not** echo the stored terms back: an agent probing with guesses is not told what the right answer was."*
- `jaybuidl/ask-trivium-hackathon` documents fail-closed startup behaviour: *"With no key set, a paying mode refuses **at startup**, not after nine analyses have already run."* and the design principle behind it: *"…while believing you bought an analysis is the one failure this design refuses to risk."*

### 4.5 Dry-run / safe-mode documentation

Only 2 of 45 document a dry-run mode:
- `sinchana-gv/invoice-agent-x12-starter` (H029 WINNER) — `ERP_DRY_RUN=1` is used in **five separate commands** in the runbook, and the README's "Runbook: end to end" splits into `### Path A: Quick demo with dry run ERP` and `### Path B: Full pipeline with Redis and optional mock ERP`. The dry run is the *default demo path*.
- `RequestTap/RequestTap-Router` — `--dry-run` on the provider test script.

---

## 5. The human-in-the-loop boundary, and where teams chose NOT to use an LLM

**8 of 45 (18%) document the HITL boundary; 8 of 45 (18%) touch the no-LLM boundary; only 2 state the no-LLM boundary as a deliberate design claim.**

### 5.1 HITL documented as an architectural position (not a TODO)

| Repo | Position taken | Verbatim |
|---|---|---|
| `bubon-ik/SingItAI` (H022 WINNER, bonus) | Human approves **every** payment, on a physical device | *"A local gateway checks the request, Firefly requires human approval for the exact payment, and only then is a transaction submitted on Algorand."* · *"Firefly displays `EURD PAYMENT`, the amount, and the receiver short address before the gateway submits the ASA transfer."* · *"**Private-key isolation:** SingIt never receives the Algorand private key."* · *"Firefly approves a deterministic spending policy hash before the agent can spend."* |
| `idoamram/planbound` (H036) | Human approves **the plan once**, then the envelope is bounded | *"…submits a plan, a human approves on their phone, and an envelope account is minted holding [the budget]"* · `### Hedera — envelope, dual control, HSS, HCS` · `### World — identity as step-up` · *"Per-service policy logic is off-chain. **The 2-of-2 key makes bypassing it impossible, not on-chain.**"* |
| `SweetieBirdX/Kinora` (H036) | **No human at all**, stated as the claim being defended | *"**No human approves any individual deal.** The musician set the terms once; everything after that is two agents and a ledger."* · heading `### 3. 402 → sign → 200, with no human in the loop` · *"0.41 ℏ to the rights holder, **no human approval anywhere in it**"* |
| `dhernz/Glassbox402` (H036, 1st Hedera) | Personhood as a **pricing tier**, not a login | *"human-verified pricing via **World ID Selfie Check**: a caller who proves a real, live person is behind them pays the base price; unverified bots pay 10× or are refused. Not a login — a per-request pricing and abuse-prevention mechanism."* |
| `LingSiewWin/HumanMandate` (H036) | Personhood bound at the **contract** layer | *"Revoking cuts off the **person**. They come back tomorrow on a brand-new address and enter at the same first gate — and are refused again."* |
| `ayanliger/gke-turns10-hackathon-vigil` (H028 WINNER, HM) | HITL as an **acknowledged gap** | Under `## Future Improvements`: *"- [ ] **Human-in-the-Loop**: Add approval workflow for high-stakes enforcement actions"* |
| `Outlier1217/dorahack-ai-escrow-commerce` (H038) | Threshold-based routing (per shortlist: auto-approve ≤200 MNEE, larger → admin review) | documented in code/flow, not in a named README section |
| `sinchana-gv/invoice-agent-x12-starter` (H029 WINNER) | Voice HITL approval + dry-run gate | dry-run path documented in the runbook; approval documented as a feature bullet |

**Note the split.** Two of the strongest H036 repos take *opposite* positions (Kinora: zero humans, by design and defended; PlanBound: one human, at plan time) and **both make the position an explicit, argued architectural claim rather than an implementation detail.** That framing — "here is where the human is, and here is why it is there and not elsewhere" — is the shared move, not the answer.

### 5.2 "Where we chose NOT to use an LLM"

Only two repos assert this as a property. Both put it under a trust heading, not a tech-stack heading.

`ikodo0/deeptrace` (H036, 3rd The Graph) — under `## Why you can trust the output`:

> "- **No model in the loop.** DeepTrace never calls an AI provider. It returns a verified structured envelope and nothing else — there is no generated prose, no reasoning field, and nothing for a model to hallucinate into the data. Interpretation is your client's job.
> - **Read-only.** Every tool is annotated read-only and idempotent. Nothing signs, sends, or mutates anything.
> - **Sourced.** Responses carry per-source provenance, coverage, and freshness. Subgraph deployments are pinned by hash and re-asserted on every call.
> - **Honest about gaps.** One source failing produces a `partial` result with a warning, not a silent hole.
> - **No invented numbers.** Financial values pass through as exact decimal strings. Windows are completed UTC days, so `24h` is the last full UTC day, not a rolling window. If those days are missing, the value is `null` rather than a shorter window quietly substituted."

Followed immediately by `## What it does not do` — *"DeepTrace is deliberately narrow, and it will tell you so rather than improvise"* — then five bullets each naming a scope boundary (Base only; two Uniswap tiers, not every pool; three lending markets, not every market; …), ending with *"**not** complete balances, full transaction history, portfolio value, P&L, or ownership."*

`SweetieBirdX/Kinora` (H036), under `## Scope & known limitations`:

> "**The buyer's haggle is rule-based, not an LLM.** Three rules: counter only when the refusal is about price, counter at the seller's disclosed floor, treat the budget as a hard wall. Light strategy, deliberately — there is no model [in it]."

And on the enforcement boundary between agent reasoning and server-side gating:

> "Ahead of the payment middleware sits `requireAcceptedLicence` (`src/x402/server.ts`). **Without it the three gates in the agent would be decorative, because the endpoint would sell a forbidden licence to anyone holding the price.**"
>
> "**An autonomous agent must not sign whatever it is handed** — a quote above the agreed maximum is refused outright, and the buyer's balance is checked against the quote before anything is signed."
>
> "Every offer passes through three checks, in order. **Each one can only ever *narrow* what happens next**, and each refusal says why in a sentence a person can read."

That last sentence — gates that can only narrow — is the clearest single-line statement of an agent-bounds architecture found in 45 repos.

---

## 6. How evaluation is presented (or isn't)

**There is no `EVAL.md` in this corpus.** Not one of 45. Evaluation appears in four forms, in descending frequency:

| Form | Count | Example |
|---|---:|---|
| A bare test count in prose or a code comment | 11 | `Hokutoman00`: *"`# 50 tests, 0 fail, ~150 assertions, <1s`"* · `sairammr/0g-permissions`: *"`contracts/ AgentPermissionManager + TeeAttestationChecker + AgenticID (Foundry, 29 tests)`"* |
| A verification *procedure* the reader can run (not a result) | 9 | `SweetieBirdX/Kinora` `## Verify it without trusting this repo` · `liminalshruti` `## Verify` · `sairammr` `## Headless proofs (no browser)` · `Dakavon` `## How to verify it's real (for judges)` |
| A results **table** | 3 | see below |
| A quantitative claim with a denominator | 2 | `SweetieBirdX/Kinora`: *"`npm run verify:royalty` performs both halves live and asserts the difference (**7/7**)"* |

**Nobody in this corpus reports precision/recall against a held-out set, and nobody runs an ablation.** (Contrast: the Razorpay 2026 *rival* field in `REPO_SHORTLIST.md` advertises exactly that — `ektamishra4321/milaan-ai` claims "P/R 1.000 on held-out ground truth". Held-out metrics are a rival-field norm, **not** a winner-corpus norm in these two families.)

### The three eval tables, verbatim in form

**1. `MukundaKatta/crusoe-nemotron-harness` (H030, overall winner) — the strongest eval artifact in 45 repos.** It is a *before/after* console dump under `## Sample run`, three scenes against one seeded provider:

> ```
> Scene 1: bare Nemotron provider. No harness, no visibility.
>   Tasks run:        10
>   Cost:             unknown
>   Budget cap hit:   unknown
>   Tool args safe:   unknown
>   Egress safe:      unknown
>   Snapshot stable:  unknown
>
> Scene 2: same agent wrapped in NemotronHarness.
> RunReport
>   p50_latency_ms       124 ms
>   p95_latency_ms       1003 ms
>   tool_failures        0
>   tokens_used          344 / 200000
>   usd_used             $0.000654 / $1.0000
>   aborted              no
>   Off-allowlist fetches blocked: 1
>
> Scene 3: same agent with a deliberately tight budget. We abort cleanly.
>   Aborted: Budget exceeded (tokens): current=110 + attempted=42 > cap=120.
> ```

Then a section headed **`## How each row gets computed`** — a table mapping every reported metric to the module that produces it (`total_cost_usd → cost.py`, `allowed_hosts → egress.py`, `tool_failures → vet.py`, `p50/p95_latency_ms → trace.py`, `tokens_used → budget.py`). **This is the only repo in 45 that documents metric provenance.** Using `unknown` as a literal value in the baseline column is the closest thing to an ablation anywhere in the corpus.

**2. `Hokutoman00/aegis-resilient-agents` (H030 WINNER) — `## Demo scenarios`**, a 6-row failure-injection matrix:

> | # | Failure injected | Layers that fire | Visible UX |
> | B | Anthropic `credit_balance_too_low` 400 | L4 catches, routes to OpenAI | "Provider switched" + Receipt |
> | E | All providers fail | L5 graceful contract + apologetic UX | Honest "I can't right now, but here's why" |
> | F | Shadow chaos | L6 background drill | Receipt: `last_chaos_survival: 47s ago` |
>
> "All scenarios use [Toxiproxy] to inject *real* network failures, not mocked errors."

Paired with a 7-row architecture table whose fourth column is literally **`Invariant monitored`** (e.g. L1: *"retries are non-destructive (tool side-effect taxonomy)"*; L5: *"user contract is honored"*). And a per-request budget contract, typed:

> ```ts
> type Contract = {
>   latency_budget_ms: number;   // e.g., 5000
>   cost_budget_usd:   number;   // e.g., 0.05
>   quality_floor:     'haiku' | 'sonnet' | 'opus' | 'gpt-4-mini' | 'gpt-4';
> }
> ```
> "If breaching the budget seems likely … **degrade explicitly**: drop to a smaller model, return a partial answer, or return a deliberate \"I can't right now, here's why\" response. **The Receipt always shows which budget was breached, by how much, and what the degraded response was.**"

**3. `LingSiewWin/HumanMandate` (H036) — the refusal/outcome table** described in §4.1: `case | expected outcome | mainnet tx`. It is an evaluation table in everything but name: every row is a test case with a verifiable result artifact.

### Evaluation-adjacent: the "requirement coverage" document

`SweetieBirdX/Kinora` ships `docs/bounty-coverage.md` (1,442w) with headings **`## Bounty 1 — No Solidity` · `## Bounty 2 — AI & Agentic Payments on Hedera` · `## Deliberately not done` · `## Worth knowing, by design`**. The third section is a table of *unbuilt* features with a "Why, and what it would take" column, prefaced:

> "Cut for time under a 12-hour budget. **Named here rather than left for a judge to discover.**"

Including an entry that scores itself against an unavailable dependency: *"**Third-party validation** — ❌ by necessity, then by choice. The ERC-8004 ValidationRegistry **has no deployment on any chain** … so there was nothing to call. Our attestation is therefore **self-issued**."*

`idoamram/planbound`'s `## Honesty box` (~700 words) is the same genre and goes further — it documents a bug the team found in its own verification surface:

> "**The panel named the wrong chain for a day.** … it would have reconciled one chain while claiming another. Both are fixed and the chain name now derives from a single constant. **Recorded because a verification surface that silently verifies nothing is worse than none — it looks like evidence.**"
>
> "**The subgraph is deployed and syncing, and currently reconciles nothing of ours.** … So the panel is live and correct and shows agreement on zero. **That is the rule working, not the panel failing.**"
>
> "Worth stating because it was not true for most of the build: the flow had been run only by the session that wrote it, and **\"tested\" and \"reported tested\" are different claims.** A third-party client closed that gap."

---

## 7. What is conspicuously ABSENT across these winners

Counted absences, n = 45:

| Absent thing | Repos lacking it | % |
|---|---:|---:|
| Any `EVAL.md` / `BENCHMARK.md` | 45 | **100%** |
| Any ablation study | 45 | **100%** |
| Any precision/recall against a held-out set | 45 | **100%** |
| Any "Alternatives considered" section | 44 | 98% |
| Any explicit threat model document | 42 | 93% |
| Documented scaling story | 41 | 91% |
| A "where we did NOT use an LLM" statement | 43 (weak: 37) | 96% |
| A stated cost-per-request / inference cost figure | 44 | 98% |
| A latency SLO or budget (as opposed to a latency mention) | 43 | 96% |
| A named HITL boundary | 37 | 82% |
| A limits/honesty section | 36 | 80% |
| A `SECURITY.md` | 42 | 93% (only `BackTrackCo/x402r-sdk`, `RequestTap/RequestTap-Router`, `bubon-ik/SingItAI` at root) |
| CI workflows | 35 | 78% |
| A state model / state machine description | 38 | 84% |
| A data model / schema section | 33 | 73% |
| Any diagram at all | 16 | 36% |
| A rollback/undo story for money-moving actions | 44 | 98% (only `BackTrackCo/x402r-sdk`, whose product *is* refunds) |

Two additional structural absences worth naming:

- **Nobody documents cost of the agent itself.** 13 repos mention "cost", but 12 mean *product pricing*. Only `MukundaKatta/crusoe-nemotron-harness` reports token/dollar spend of the agent run.
- **Diagrams are decoupled from the docs.** `Unknown1502/Compliance-Guardian-AI` ships six purpose-built PNGs (`Component Interaction Diagram.png`, `Data Flow Diagram.png`, `Sequence Diagram.png`, `System Flow Diagram.png`, `arch.png`, a wireframe) plus `diagrams/architecture.txt` — and its README embeds **zero images**. Building diagrams and not surfacing them is a real, repeated failure mode.

---

## 8. Per-repo table

All 45 rows. `Arch-section words` = words under the best-matching architecture/how-it-works heading up to the next same-or-higher heading. Diagram counts are of fenced Mermaid blocks, fenced/inline ASCII box diagrams, and non-badge embedded images in the README only. Depth markers are regex-detected and manually spot-checked. **All retrieved 2026-08-26.**

| Repo | Hackathon | Placement | README words | Arch-section words | Separate arch doc | Diagram (type x n) | Depth markers present |
|---|---|---|---|---|---|---|---|
| [armsves/AlgoEuPay](https://github.com/armsves/AlgoEuPay) | Algorand Builders Berlin 2026 (H022) | WINNER 1st (Infra new) | 503 | 98 | — | ASCII x1 | ReqLifecycle, Deploy |
| [automateyournetwork/kagent_vision](https://github.com/automateyournetwork/kagent_vision) | MCP_HACK//26 starter track (H027) | WINNER | 1,012 | 115 | — | **none** | APIContract, Deploy, Tradeoff |
| [ayanliger/gke-turns10-hackathon-vigil](https://github.com/ayanliger/gke-turns10-hackathon-vigil) | GKE Turns 10 (H028) | WINNER Honorable Mention | 1,032 | 206 | — | ASCII x1 | ReqLifecycle, Deploy, EvalMetrics, Scaling, HITL |
| [BackTrackCo/arbiter-examples](https://github.com/BackTrackCo/arbiter-examples) | EF x402 Hackathon (H019) | companion to WINNER | 69 | — | — | **none** | — |
| [BackTrackCo/x402r-sdk](https://github.com/BackTrackCo/x402r-sdk) | EF x402 Hackathon (H019) | WINNER | 270 | — | — | **none** | EvalMetrics |
| [bubon-ik/SingItAI](https://github.com/bubon-ik/SingItAI) | Algorand Builders Berlin 2026 (H022) | WINNER bonus | 1,213 | 96 | — | Mermaid x1 | ReqLifecycle, Failure, Cost, Latency, Tradeoff, HITL, NoLLM, Refusal, Bounds, AuditTrail |
| [Dakavon/algorand-x402-hackathon](https://github.com/Dakavon/algorand-x402-hackathon) | Algorand Builders Berlin 2026 (H022) | WINNER 2nd | 1,332 | 111 | — | ASCII x2 | StateModel, Cost, Latency, EvalMetrics, Tradeoff, Refusal, Bounds |
| [den-vasyliev/agentregistry-inventory](https://github.com/den-vasyliev/agentregistry-inventory) | MCP_HACK//26 agentregistry (H027) | WINNER | 1,435 | 159 | `docs/adr/001-inventory-over-runtime-architecture.md` 980w | ASCII x1 | APIContract, Deploy, EvalMetrics, Scaling, Refusal |
| [dhernz/Glassbox402](https://github.com/dhernz/Glassbox402) | ETHGlobal / Hedera track (H036) | WINNER 1st (Hedera) | 1,334 | 78 | — | **none** | Deploy, Cost, Tradeoff, HITL, Refusal, AuditTrail |
| [Galaksio-OS/galaksio](https://github.com/Galaksio-OS/galaksio) | Solana x402 (H020) | WINNER? (unconfirmed) | 283 | — | — | **none** | Tradeoff |
| [georgeIshaq/Auto_Security](https://github.com/georgeIshaq/Auto_Security) | Redis/AI hackathon (H029) | WINNER (2 sponsor prizes) | 579 | 42 | — | **none** | APIContract, Deploy, Security |
| [Hokutoman00/aegis-resilient-agents](https://github.com/Hokutoman00/aegis-resilient-agents) | TrueFoundry Resilient Agents (H030) | WINNER | 976 | — | `docs/ARCHITECTURE.md` 1,484w + `docs/RECEIPT.md` 868w | ASCII x1 | Failure, DataModel, APIContract, Deploy, Cost, Latency, EvalMetrics, Tradeoff, Bounds, AuditTrail |
| [idoamram/planbound](https://github.com/idoamram/planbound) | ETHGlobal Lisbon 2026 (H036) | SUBMISSION | 2,570 | — | — | **none** | ReqLifecycle, Failure, DataModel, Deploy, Cost, Tradeoff, Limits, HITL, Refusal, Bounds, AuditTrail |
| [ikodo0/deeptrace](https://github.com/ikodo0/deeptrace) | ETHGlobal / The Graph (H036) | WINNER 3rd | 1,322 | — | — | image x1 | StateModel, DataModel, Deploy, EvalMetrics, Tradeoff, Limits, NoLLM, AuditTrail |
| [intuition-box/Hourglass](https://github.com/intuition-box/Hourglass) | ETHGlobal (H036) | SUBMISSION | 1,481 | 326 | `docs/APPROVAL_RAILS.md` 1,434w (+12 docs/) | ASCII x1 | Failure, Deploy, EvalMetrics, Security, Limits, NoLLM, Refusal, Bounds, AuditTrail |
| [jaybuidl/ask-trivium-hackathon](https://github.com/jaybuidl/ask-trivium-hackathon) | ETHGlobal (H036) | SUBMISSION | 2,454 | 187 | — | ASCII x3 | Failure, DataModel, Deploy, Tradeoff, Limits, Refusal |
| [jfsgomes/joule](https://github.com/jfsgomes/joule) | ETHGlobal / Uniswap (H036) | SUBMISSION | 794 | 165 | `docs/MECHANISM.md` 4,887w | **none** | Failure, Cost, EvalMetrics, Security, Tradeoff, AuditTrail |
| [julian-hecker/gke-hackathon](https://github.com/julian-hecker/gke-hackathon) | GKE Turns 10 (H028) | WINNER Honorable Mention | 85 | 41 | — | image x1 | Deploy |
| [legasicrypto/skale-hackathon](https://github.com/legasicrypto/skale-hackathon) | SKALE / Virtuals (H021) | WINNER? 2nd (unconfirmed) | 726 | 54 | — | ASCII x3 | Deploy, Latency, Tradeoff, AuditTrail |
| [lethaltrifecta/oss-contributions-track](https://github.com/lethaltrifecta/oss-contributions-track) | MCP_HACK//26 OSS track (H027) | WINNER | 645 | 80 | — | image x2 | ReqLifecycle, Failure, Deploy, Tradeoff, NoLLM |
| [liminalshruti/algorand-berlin-2026](https://github.com/liminalshruti/algorand-berlin-2026) | Algorand Builders Berlin 2026 (H022) | WINNER 1st (Infra existing) | 1,435 | 255 | — | **none** | Failure, StateModel, DataModel, Deploy, Limits, NoLLM |
| [LingSiewWin/HumanMandate](https://github.com/LingSiewWin/HumanMandate) | ETHGlobal Lisbon / x402 (H036) | SUBMISSION | 1,244 | 137 | — | Mermaid x2 | EvalMetrics, Tradeoff, HITL, Refusal, Bounds |
| [LokoAnas/Algorand](https://github.com/LokoAnas/Algorand) | Algorand Builders Berlin 2026 (H022) | WINNER bonus | 1,089 | 61 | — | ASCII x3 | Deploy, Cost, Latency, Security, HITL, NoLLM, Refusal |
| [MassimoC/kagent-dotnet](https://github.com/MassimoC/kagent-dotnet) | MCP_HACK//26 AgentGateway (H027) | WINNER runner-up | 396 | — | — | image x4 | Deploy |
| [MehmetHilmiEmel/Agentgateway_Hackathon](https://github.com/MehmetHilmiEmel/Agentgateway_Hackathon) | AgentGateway Hackathon (H027) | WINNER runner-up | 1,869 | 204 | — | ASCII x5, image x1 | ReqLifecycle, DataModel, APIContract, Deploy, Latency |
| [merdandt/SalesShortcut](https://github.com/merdandt/SalesShortcut) | Google ADK Hackathon (H024) | WINNER Grand Prize | 1,305 | 158 | — | Mermaid x1, image x1 | Deploy, Security |
| [mrtinhnguyen/x402r-mcp](https://github.com/mrtinhnguyen/x402r-mcp) | x402 / MCP (H041) | SUBMISSION | 284 | — | — | **none** | APIContract, Deploy, EvalMetrics |
| [MukundaKatta/crusoe-nemotron-harness](https://github.com/MukundaKatta/crusoe-nemotron-harness) | Crusoe/Nemotron (H030) | WINNER overall | 635 | 93 | — | **none** | Failure, Deploy, Cost, Latency, EvalMetrics, Tradeoff, Bounds |
| [Outlier1217/dorahack-ai-escrow-commerce](https://github.com/Outlier1217/dorahack-ai-escrow-commerce) | Cronos x402 / DoraHacks (H038) | SUBMISSION | 700 | — | — | ASCII x1 | ReqLifecycle, Deploy, EvalMetrics, Refusal |
| [papagala/mcp-clinical-platform](https://github.com/papagala/mcp-clinical-platform) | MCP_HACK//26 (H027) | WINNER runner-up | 1,659 | 262 | — | ASCII x4 | Failure, StateModel, DataModel, Deploy, Tradeoff, Limits, AuditTrail |
| [pincerclaw/pincer-x402-starter](https://github.com/pincerclaw/pincer-x402-starter) | Coinbase track (H021) | WINNER 2nd | 916 | 119 | `docs/architecture.md` 230w | Mermaid x1 | ReqLifecycle, APIContract, Deploy, EvalMetrics, Tradeoff, Bounds |
| [QuisTech/foxitsentinelpro](https://github.com/QuisTech/foxitsentinelpro) | Foxit Document Automation (H031) | WINNER | 815 | 202 | — | ASCII x2, image x1 | Deploy, Security, AuditTrail |
| [RequestTap/RequestTap-Router](https://github.com/RequestTap/RequestTap-Router) | Google AP2 track (H021) | WINNER 1st | 2,116 | 138 | — | ASCII x3 | ReqLifecycle, StateModel, DataModel, APIContract, Deploy, Latency, Security, Tradeoff, Refusal, Bounds, AuditTrail |
| [rustamino/team-localhost-x402](https://github.com/rustamino/team-localhost-x402) | Algorand Builders Berlin 2026 (H022) | WINNER 3rd (Infra) | 244 | — | `architecture.md` 1,564w | **none** | — |
| [sairammr/0g-permissions](https://github.com/sairammr/0g-permissions) | ETHGlobal / 0G (H036) | SUBMISSION | 595 | — | — | **none** | StateModel, Deploy, EvalMetrics, Refusal, Bounds, AuditTrail |
| [salvador-arreola/frugalia-mcp](https://github.com/salvador-arreola/frugalia-mcp) | MCP_HACK//26 Building Cool Agents (H027) | WINNER | 1,194 | 209 | — | Mermaid x1, ASCII x2 | APIContract, Deploy, Latency, Bounds |
| [sergeyshemyakov/juicebagmail](https://github.com/sergeyshemyakov/juicebagmail) | Algorand Builders Berlin 2026 (H022) | WINNER 1st | 341 | — | — | **none** | DataModel, Cost |
| [sinchana-gv/invoice-agent-x12-starter](https://github.com/sinchana-gv/invoice-agent-x12-starter) | Redis VL Innovator (H029) | WINNER | 777 | — | — | ASCII x1 | Deploy, Refusal |
| [SweetieBirdX/Kinora](https://github.com/SweetieBirdX/Kinora) | ETHGlobal / Hedera (H036) | SUBMISSION | 3,861 | 1293 | `docs/bounty-coverage.md` 1,442w | Mermaid x2, ASCII x4 | ReqLifecycle, Failure, StateModel, DataModel, Deploy, Cost, EvalMetrics, Security, Tradeoff, Limits, HITL, NoLLM, Refusal, Bounds, AuditTrail |
| [techMellouk/VibeQuant](https://github.com/techMellouk/VibeQuant) | Algorand Builders Berlin 2026 (H022) | WINNER bonus | 250 | 41 | — | image x1 | Cost |
| [techwithhuz/mcp-security-governance](https://github.com/techwithhuz/mcp-security-governance) | MCP_HACK//26 Secure & Govern MCP (H027) | WINNER | 11,444 | 337 | `docs/DESIGN_AND_APPROACH.md` 1,552w + `HARDENING_ARCHITECTURE.md` | Mermaid x1, ASCII x3, image x1 | ReqLifecycle, Failure, DataModel, APIContract, Deploy, EvalMetrics, Security, Tradeoff, Limits, Refusal, AuditTrail |
| [TeddyHuZz/solvent](https://github.com/TeddyHuZz/solvent) | Solana x402 (H041) | SUBMISSION | 501 | 74 | — | **none** | Deploy, Bounds |
| [TriplEight/SPM](https://github.com/TriplEight/SPM) | Algorand Builders Berlin 2026 (H022) | WINNER 3rd | 732 | 75 | `docs/architecture.md` 241w | ASCII x2 | ReqLifecycle, Deploy, Cost, Security, NoLLM |
| [Unknown1502/Compliance-Guardian-AI](https://github.com/Unknown1502/Compliance-Guardian-AI) | AWS Amazon Q (H023) | WINNER Best Amazon Q App | 1,442 | 225 | `docs/ARCHITECTURE.md` 1,699w | **none** | ReqLifecycle, Failure, Deploy, EvalMetrics, Security, Scaling, HITL, AuditTrail |
| [victorbash400/Cartmate](https://github.com/victorbash400/Cartmate) | GKE Turns 10 EMEA (H028) | WINNER (EMEA regional) | 1,801 | 209 | — | Mermaid x2, ASCII x1 | DataModel, Deploy, Cost, Latency, EvalMetrics, Security, Scaling, Tradeoff |

**Marker key:** `ReqLifecycle` request/data/protocol flow described · `Failure` fallback, retry, chaos, degradation · `StateModel` state machine, session/task store, nonce, replay protection · `DataModel` schema, envelope, field reference · `APIContract` API/endpoints/tools reference section · `Deploy` deployment or run instructions · `Cost` budget or pricing · `Latency` latency/p95/finality/throughput · `EvalMetrics` any test count, score, or benchmark · `Security` security/trust-model/threat/tamper · `Scaling` scaling story · `Tradeoff` "why X over Y", alternatives, consequences · `Limits` limits/honesty/scope/known-issues section · `HITL` human-in-the-loop boundary · `NoLLM` deterministic / no-model boundary · `Refusal` refusal, revert, denial documented · `Bounds` caps, budgets, allowances, kill switch · `AuditTrail` receipts, ledgers, provenance.

---

## 9. Provenance and caveats on this corpus

- **n = 45.** Every repo was fetched live via `gh api` on **2026-08-26**; all 45 returned a README and a full recursive tree. No repo listed here was inferred.
- **Placements** are carried from `research/02_hackathons/REPO_SHORTLIST.md`, which verified each URL on the same date. Two placements are marked unconfirmed (`Galaksio-OS/galaksio`, `legasicrypto/skale-hackathon`) and no finding above hinges on them.
- **32 of 45 are organizer-confirmed winners or placed finalists, 2 are unconfirmed placements (`WINNER?`), 10 are verified submissions of unknown placement, and 1 (`BackTrackCo/arbiter-examples`) is the companion repo of a winner.** Findings are reported over all 45; where a finding is winner-specific it says so.
- **"Stub repos that won" is a real data point and it occurs here.** `julian-hecker/gke-hackathon` (H028 Honorable Mention) has an **85-word README**, three headings (`# live-agent` / `## Deployment` / `## Architecture`), and one `architecture.png` — and placed. `sergeyshemyakov/juicebagmail` (H022, 1st) has 341 words, eight headings, and **no diagram and no architecture section**. `techMellouk/VibeQuant` (H022 bonus) has 250 words and a 41-word architecture section. `BackTrackCo/x402r-sdk` (EF x402 winner) has a 270-word README with no architecture section at all — it is a package-index README, and the engineering evidence is 76 test files and a `SECURITY.md`.
- **Architecture-section word counts undercount repos whose entire README is architecture** but never uses a matching heading. `idoamram/planbound` (2,570 words) and `ikodo0/deeptrace` (1,322 words) both register 0 by the heading rule while being among the most architecturally detailed documents in the set. The table shows 0; the prose above corrects for it.
- **Regex-detected depth markers over-trigger on common words.** `Refusal`, `Bounds`, `Deploy` and `Tradeoff` in particular. Each of the qualitative claims in §4 and §5 was verified by reading the matching line; the headline counts in §1 for HITL, NoLLM, Limits, EvalMetrics and diagrams were manually confirmed repo by repo.
