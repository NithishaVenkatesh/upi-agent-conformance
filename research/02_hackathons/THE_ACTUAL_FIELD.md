# The Actual Competitive Field — 261 public repos, enumerated

| Field | Value |
|---|---|
| Method | `gh api search/repositories q="razorpay buildathon"`, 3 pages × 100, deduplicated |
| Retrieved | 2026-08-26 |
| Raw data | `competitor_field_2026-08-26.jsonl` (261 records) |
| Evidence class | **FACT** — direct GitHub API census |

## Why this supersedes the generic hackathon-winner research

The original research plan assumed we would have to reverse-engineer winning patterns from *other* competitions. We don't have to. **This competition's field is public and enumerable in real time**, because every submission requires a public GitHub repo and almost everyone names it after the Buildathon.

Direct observation of the actual competing field beats transferable inference from unrelated hackathons. The Tier-2/Tier-3 hackathon corpus remains useful for *engineering patterns*, but **this** is the ground truth on what we are actually up against.

## Scale and velocity — `FACT`

| Query | GitHub `total_count` |
|---|---|
| `razorpay buildathon` | **261** |
| `razorpay ai buildathon` | 183 |
| `razorpay ai builder` | 64 |

Creation dates — the field materialised in six days:

| Date | New repos |
|---|---|
| 2026-08-20 | 13 |
| 2026-08-21 | 38 |
| 2026-08-22 | 61 |
| 2026-08-23 | 53 |
| 2026-08-24 | 47 |
| 2026-08-25 | 45 |
| 2026-08-26 | 2 (partial day) |

Steady ~45–60/day with no sign of decay. Deadline is 5 September.
`INFERENCE:` extrapolating ~45/day for 10 more days → **roughly 650–750 public repos by close.** Note this undercounts (private-until-submission repos, repos not named for the Buildathon) and overcounts (abandoned starts).

## Quality distribution — `FACT`

- **25 / 261 (10%) are completely empty** (`size == 0`).
- **59 / 261 (23%) have no description at all.**
- Languages: Python 144, TypeScript 38, none 34, JavaScript 24, HTML 11, Jupyter 6.

`INFERENCE:` the field is **bimodal**. Roughly a third is noise — empty repos, unstarted ideas, description-less dumps. The real contest is a top band of perhaps 30–60 serious builds. **Beating the median is worth nothing.**

## Track distribution — `FACT` (keyword heuristic over descriptions; ~34% unclassifiable)

| Track | Repos | Share |
|---|---|---|
| Unknown / unclassifiable | 91 | 34% |
| **T3 — AI Revenue Recovery** | 63 | **24%** |
| **T2 — AI Risk Manager** | 40 | **15%** |
| Multi-track / ambiguous | 23 | 8% |
| **T4 — AI Finance Controller** | 28 | **10%** |
| **T1 — AI Growth & Agentic Commerce** | **16** | **6%** |

> **Track 01 is the thinnest entered track by a factor of ~4 versus Track 03** — despite Razorpay framing it most urgently on the page ("the open problem of the year", "in-app pilots are already live").

`INFERENCE — the central strategic observation of this document:` Track 01 is under-entered because it is genuinely harder. It demands real Razorpay test-mode integration *plus* engagement with the UAP/ACP/AP2/x402 protocol layer, whereas Tracks 02/03 can be approached as a familiar tabular-ML or LLM-workflow exercise on synthetic CSVs. **That barrier is precisely why it is the best odds-adjusted track for someone able to clear it** — and it compounds with the Agent Studio problem below.

## The Agent Studio collision — cross-reference

Razorpay's shipped **Agent Studio** reportedly includes prebuilt Dispute Responder, RTO Shield, Subscription Recovery, Abandoned Cart Conversion, Settlement Insights, and Cashflow Forecaster agents. Those map almost one-to-one onto the example directions for Tracks 02/03/04 — **which is where 49% of the enumerated field is building.**

So the majority of the field is building a student version of a product the judges shipped, and will be measured against an invisible production baseline. See `../00_competition_context/THE_REAL_RUBRIC.md` §6.

## The substantive top band — repos to study

Filtered to `size > 500 KB` with a real description. These are the actual competition.

| Size | Lang | Repo | Track | Description |
|---|---|---|---|---|
| 87 MB | Python | `manimimohit-glitch/voice-recovery-agent` | T3 | Hinglish AI voice agent for failed-payment recovery |
| 47 MB | Python | `srijan2607/fraud-pulse` | T2/T3 | Chargeback risk manager, CNP fraud, coordinated detection |
| 45 MB | Python | `komallbarhate/AI-Risk-Manager` | T2 | Return-abuse scorer — LightGBM + TreeSHAP + rules |
| 33 MB | Python | `Thouseef68/razorpay-fraud-detector` | T2 | Two-layer fraud detection |
| 18 MB | Python | `sreechandhana54/recovr-ai-revenue-recovery` | T3 | Revenue recovery agent |
| 17 MB | Python | `SuryaSK-dev/razorpay-ai-finance-controller` | T4 | Multi-source recon + tax validation |
| 12 MB | Python | `NitheeshP19/AI-Revenue-recovery-Engine` | T3 | Agentic microservice intercepting failed payments |
| 12 MB | Python | `PRERITARYA/pariksheai` | T2 | Payment confirmation verifier |
| 10 MB | Python | `VeerGetGit/RazorPay_agentic_checkout` | T1 | Conversational UPI checkout |
| 2.8 MB | TS | **`Adarsh-Me/Agent-Audit`** | **T1** | *"Can AI shopping agents actually see, choose, and buy from your catalog?"* — **directly occupies the sell-side gap** |
| 2.4 MB | TS | `Devviratt/recoverai` | T3 | Revenue recovery agent |
| 2.4 MB | Python | `tfthushaar/razorpay_buildathon` | T4 | Settlement recon, **calibrated autonomy**, causal-chain matching |
| 2.3 MB | HTML | `vaibhav375/recovery-ledger` | T3 | **Incremental recovery measurement** |
| 1.7 MB | Python | `Sivanandinisaravanakumar/rto-risk-agent` | T2 | RTO scoring, explainable ML, guardrails |
| 1.7 MB | Python | `AdityaWagh19/Aegis` | T3 | Failed UPI Autopay recovery, compliance framing |
| 1.2 MB | Python | `abhinav-phi/reflex` | T2/T3 | **Rules-first + LLM** root-cause diagnosis |
| 1.2 MB | Python | `Shikari-ai/recoup` | T3 | Autonomous revenue recovery |
| 1.1 MB | Python | `Sree-26/Recovery-Agent` | T3 | Root-cause + bounded recovery |
| 919 KB | Python | `Amritbiswas07/kosh-ai-finance-controller` | T4 | Three-way settlement recon |
| 898 KB | Python | `MrBurber/KinGraph` | T2 | Defense-only device/IP/address clustering |
| 889 KB | TS | `shubhambhattog/recoup` | T3 | Bounded recovery, **"recovers more than naive baseline"** |

**Note the sophistication of the descriptions in the top band** — "calibrated autonomy", "incremental recovery measurement", "cost-weighted evaluation", "rules-first + LLM", "recovers more than a naive baseline", "guardrailed decisions". These builders have read the same bar we have. Several are already doing exactly the things the rubric rewards.

## Caveats

- Repo `size` measures git object size, which is inflated by committed datasets, notebooks, images and model artifacts. **It is a weak proxy for engineering quality** — the 87 MB repo may just contain audio files. Size was used only to *shortlist for inspection*, not to rank.
- Keyword track-classification is heuristic; 34% could not be classified from description alone. Treat track shares as ±5pp.
- A search on `"razorpay buildathon"` misses submissions whose repo name and description avoid those words.
