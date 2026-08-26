# REPO SHORTLIST — verified, clonable hackathon repos ranked against the Razorpay AI Buildathon tracks

**Compiled 2026-08-26.** Every URL below was verified with `gh repo view OWNER/NAME --json nameWithOwner,stargazerCount,primaryLanguage,pushedAt,diskUsage` and returned HTTP 200 on that date. **No repo is listed that was not verified.** Repos cited by a source but confirmed absent are listed at the bottom so nobody wastes a clone on them.

**Scoring (1–10)** = closeness to a Razorpay track × amount of real, liftable implementation. A verified *winner* with a thin repo scores lower than a verified *finalist/submission* with a deep, on-point one — the brief explicitly asks for transferable engineering, not trophies.

Legend — **Status**: `WINNER` = organizer-confirmed placement · `WINNER?` = placement reported but not organizer-confirmed · `SUBMISSION` = verified entry, placement unknown · `RIVAL` = in-flight Razorpay Buildathon 2026 competitor.
**Size** is `diskUsage` in KB. `STUB` = <60 KB or README-only.

---

## TIER A — clone these first (score 8–10)

| # | Score | Repo | Owner | ★ | Lang | Last push | Size | Status / event | Track | Why |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **10** | https://github.com/sinchana-gv/invoice-agent-x12-starter | sinchana-gv | 1 | Python | 2026-02-24 | 8,627 | **WINNER** — H029 Redis VL Innovator | 04 | The whole Track-04 loop in one repo: EDI 810 ingest → deterministic rule validation → vendor enrichment → **anomaly scoring** → ERP posting with a **dry-run mode** → **voice HITL approval**. Nothing else found implements dry-run + approval gate. |
| 2 | **10** | https://github.com/Hokutoman00/aegis-resilient-agents | Hokutoman00 | 0 | TypeScript | 2026-05-28 | 97 | **WINNER** — H030 TrueFoundry Resilient Agents | 03 | Built around a real payment-failure bug (`credit_balance_too_low` passed through as HTTP 400). 7-layer fallback, **Toxiproxy chaos testing**, and a signed "Aegis Receipt" audit trail per response. The failure taxonomy is directly re-skinnable to card decline codes. |
| 3 | **9** | https://github.com/ayanliger/gke-turns10-hackathon-vigil | ayanliger | 0 | Python | 2025-12-03 | 306 | **WINNER** (Honorable Mention) — H028 | 02 | Hierarchical multi-agent fraud detection running as a **sidecar** over Bank of Anthos — adds risk to an existing payment stack with zero changes to it. ADK + A2A + Gemini 2.5 Flash. |
| 4 | **9** | https://github.com/idoamram/planbound | idoamram | 0 | TypeScript | 2026-07-27 | 11,133 | SUBMISSION — H036 ETHGlobal Lisbon 2026 | 04 / 02 | shop → quote → **one human approval** → scoped account → **re-check price at execution**. The cleanest spend-envelope-with-revalidation implementation in the dataset, and it is large. |
| 5 | **9** | https://github.com/dhernz/Glassbox402 | dhernz | 1 | HTML/Node | 2026-07-26 | 1,175 | **WINNER** (1st, Hedera track) — H036 | 04 / 03 | Every settled payment writes an independent receipt to an append-only log, so the revenue dashboard is **auditable rather than trusted**. That is exactly the reconciliation-evidence problem in Track 04. |
| 6 | **9** | https://github.com/BackTrackCo/x402r-sdk | BackTrackCo | 1 | TypeScript | 2026-08-17 | 1,923 | **WINNER** — H019 EF x402 Hackathon | 02 / 03 | The only winning project anywhere that makes **refunds and dispute arbitration first-class payment primitives**. Pair with https://github.com/BackTrackCo/arbiter-examples (324 KB). |
| 7 | **9** | https://github.com/merdandt/SalesShortcut | merdandt | **82** | Python | 2025-06-28 | 1,243 | **WINNER** (Grand Prize) — H024 Google ADK | 01 | Full outbound funnel run by cooperating agents over **A2A**: lead discovery → research → proposal → AI voice call + email → funnel state. Most-starred repo in the dataset. |
| 8 | **9** | https://github.com/Outlier1217/dorahack-ai-escrow-commerce | Outlier1217 | 1 | JavaScript | 2026-01-19 | 227 | SUBMISSION — H038 | 02 | **XGBoost risk model auto-approves ≤200 MNEE and routes larger payments to admin review**, settling via escrow. The tiered auto-approve / manual-review threshold is the precision-recall trade-off Track 02 asks for, implemented. |
| 9 | **8** | https://github.com/jaybuidl/ask-trivium-hackathon | jaybuidl | 0 | TypeScript | 2026-07-26 | 421 | SUBMISSION — H036 | 02 | **Multi-LLM adjudication panel for disputed transactions.** Built precisely because x402 has no chargeback primitive — same shape as merchant dispute representment. |
| 10 | **8** | https://github.com/LingSiewWin/HumanMandate | LingSiewWin | 0 | TypeScript | 2026-07-26 | 1,360 | SUBMISSION — H036 | 02 | Daily spend caps + human-bound revocation + **step-up auth**, enforced with custom errors in a mainnet-deployed contract. Step-up auth is the exact action verb RBI HaRBInger's FraudLens won on. |
| 11 | **8** | https://github.com/MukundaKatta/crusoe-nemotron-harness | MukundaKatta | 1 | Python | 2026-06-13 | 35 | **WINNER** (Overall) — H030 | all | Tiny but high-leverage: a single context-manager facade giving any agent cost tracking, **tool-failure detection**, budget caps and snapshots, with "60 tests under 0.1s". This is the eval/observability harness a Buildathon panel will ask for. |
| 12 | **8** | https://github.com/liminalshruti/algorand-berlin-2026 | liminalshruti | 0 | TypeScript | 2026-07-15 | 2,626 | **WINNER** (1st, Infra existing) — H022 | 02 / 04 | Provenance anchoring (hash-only) plus a **settlement-refusal guard** — an agent that declines to settle. "Knowing when to refuse" is the property Razorpay's own rival submissions keep advertising. |
| 13 | **8** | https://github.com/intuition-box/Hourglass | intuition-box | 3 | HTML/TS | 2026-08-17 | 44,752 | SUBMISSION — H036 | 03 | **Bounded, revocable delegations for recurring operations** — the subscription-authority problem, with a large codebase and recent activity. |
| 14 | **8** | https://github.com/QuisTech/foxitsentinelpro | QuisTech | 0 | TypeScript | 2026-02-18 | 317 | **WINNER** — H031 Foxit Document Automation | 04 | **SHA-256 hash verification at every pipeline stage** + immutable audit ledger. A ready-made evidence chain for "prove this reconciled number came from those inputs". Live demo deployed. |
| 15 | **8** | https://github.com/armsves/AlgoEuPay | armsves | 2 | Kotlin | 2026-06-07 | 5,058 | **WINNER** (1st, Infra new) — H022 | 03 / 01 | End-to-end **QR checkout → instant IBAN settlement**, with a FastAPI backend, an Android app and a TypeScript SDK. Rare full-stack payment-rail build. |

## TIER B — strong secondary reads (score 6–7)

| # | Score | Repo | ★ | Lang | Push | Size | Status / event | Track | Why |
|---|---|---|---|---|---|---|---|---|---|
| 16 | 7 | https://github.com/MehmetHilmiEmel/Agentgateway_Hackathon | 3 | JS | 2026-07-07 | 134 | **WINNER** (runner-up) — H027 | 01 / 02 | Agent-commerce authz enforced at the **protocol boundary** (Keycloak JWT + CEL rules), not in a prompt. |
| 17 | 7 | https://github.com/sairammr/0g-permissions | 0 | Solidity | 2026-07-26 | 813 | SUBMISSION — H036 | 02 / 04 | ERC-4337 smart account, on-chain permission grants, **kill switch**. |
| 18 | 7 | https://github.com/jfsgomes/joule | 0 | TS | 2026-07-26 | 1,593 | SUBMISSION — H036 | 03 / 02 | Escrow custody + **delivery clock** + onchain verifier burn — verify before settle. |
| 19 | 7 | https://github.com/RequestTap/RequestTap-Router | 2 | HTML/JS | 2026-02-14 | 3,583 | **WINNER** (1st, Google AP2 track) — H021 | 01 | Drop-in router turning any API into a pay-per-request service for agents. Pair with `RequestTap-Adapter` (1,983 KB). `RequestTap-MCP` is a 17 KB **stub** — skip it. |
| 20 | 7 | https://github.com/pincerclaw/pincer-x402-starter | 2 | Python | 2026-02-10 | 4,195 | **WINNER** (2nd, Coinbase track) — H021 | 03 | Converts sponsor budgets into real-time subsidies so a payment that would fail on cost instead succeeds — an unusual angle on revenue recovery. |
| 21 | 7 | https://github.com/techwithhuz/mcp-security-governance | 5 | Go | 2026-04-06 | 87,645 | **WINNER** — H027 Secure & Govern MCP | 02 | Risk-scores an agent's own tool surface with AI risk analysis. Largest verified winner repo in the set. |
| 22 | 7 | https://github.com/ikodo0/deeptrace | 1 | TS | 2026-07-26 | 753 | **WINNER** (3rd, The Graph) — H036 | 02 | Read-only MCP server joining macro + micro data for anomaly spotting. **Has Vitest tests** — rare in hackathon code. |
| 23 | 7 | https://github.com/TeddyHuZz/solvent | 0 | TS | 2025-11-09 | 307 | SUBMISSION — H041 | 02 / 04 | Spending-rule-bound account so an agent never holds unrestricted custody. |
| 24 | 6 | https://github.com/Unknown1502/Compliance-Guardian-AI | 1 | Python | 2025-10-19 | 1,852 | **WINNER** (Best Amazon Q App) — H023 | 02 | LLM interprets regulatory requirements and scans infra/DB/repos for violations; has pytest + coverage config. |
| 25 | 6 | https://github.com/salvador-arreola/frugalia-mcp | 2 | Python | 2026-04-05 | 352 | **WINNER** — H027 Building Cool Agents | 04 | Agentic FinOps: detect → analyse → **resolve** cost waste autonomously. Closest thing to a "controller that acts". |
| 26 | 6 | https://github.com/SweetieBirdX/Kinora | 0 | TS | 2026-07-26 | 4,542 | SUBMISSION — H036 | 01 | LLM parses licensing terms into **machine-enforced rule gates** — natural-language policy → executable policy. |
| 27 | 6 | https://github.com/legasicrypto/skale-hackathon | 0 | TS | 2026-02-13 | 1,722 | **WINNER?** (2nd, Virtuals track) — H021 | 02 | Credit lines + on-chain reputation for agents. **Repo↔placement match unconfirmed.** |
| 28 | 6 | https://github.com/den-vasyliev/agentregistry-inventory | **25** | Go | 2026-07-01 | 4,129 | **WINNER** — H027 agentregistry track | 05 | Control plane / registry for MCP servers, agents, skills, models. Best-engineered infra repo found. |
| 29 | 6 | https://github.com/victorbash400/Cartmate | 0 | JS | 2025-09-14 | 1,628 | **WINNER** (EMEA regional) — H028 | 01 | 6-agent conversational commerce: discovery, visual style analysis, price comparison, cart management. |
| 30 | 6 | https://github.com/georgeIshaq/Auto_Security | 3 | Python | 2025-09-20 | 346 | **WINNER** (2 sponsor prizes) — H029 | 05 | Multi-agent scout/scanner/triage pipeline that opens issues and PRs — good triage-role decomposition to copy. |
| 31 | 6 | https://github.com/Galaksio-OS/galaksio | 6 | TS | 2025-12-18 | 1,255 | **WINNER?** — H020 Solana x402 | 01 | Pay-per-use resource access from on-chain payments. Placement unconfirmed. |
| 32 | 6 | https://github.com/bubon-ik/SingItAI | 6 | Python | 2026-08-24 | 6,632 | **WINNER** (bonus prize) — H022 | 01 | Voice-command spending with a **physical confirmation gate** — a genuinely different HITL modality. |

## TIER C — read selectively (score 4–5)
Verified real, on-topic, but thinner or further from the tracks.

| Repo | ★ | Lang | Size | Status / event | Track |
|---|---|---|---|---|---|
| https://github.com/36taransingh5-dotcom/Parch | 0 | TS | 131 | **WINNER?** 1st — H016 Prava (self-reported) | 01 |
| https://github.com/Soham109/sutra | 11 | HTML | 30,348 | SUBMISSION — H016 (Group Mandate Protocol, multi-principal payments) | 01 |
| https://github.com/aayushdixit27/par-purchasing-agent | 0 | Python | 16,136 | SUBMISSION — H016 (agent that refuses when the listing lies) | 02 |
| https://github.com/JackyCufe/pagerpay | 0 | TS | 122 | SUBMISSION — H016 (four autonomy gates, adversarial cross-model review) | 02 |
| https://github.com/KaranSinghBisht/accord | 0 | TS | 299 | SUBMISSION — H016 ("intent firewall" gating card issuance) | 02 |
| https://github.com/ishikatyagi-star/Strike | 0 | TS | 393 | SUBMISSION — H016 (conditional purchase mandates) | 01 |
| https://github.com/EndPx/trimbot | 0 | TS | 63 | SUBMISSION — H016 (usage-decay subscription downgrade, scoped tokens) | 03 |
| https://github.com/phllp-tanstic/Intara | 0 | TS | 87 | SUBMISSION — H016 (price-capped renewal decisions) | 03 |
| https://github.com/22f3003301/posy | 0 | TS | 3,249 | SUBMISSION — H016 (one-time Visa tokens) | 01 |
| https://github.com/predgeAI/x402-prava-bridge | 0 | JS | 50 | SUBMISSION — H016 (bridges x402 to card rails) | 01 |
| https://github.com/SioYooo/exactrun | 0 | JS | 515 | SUBMISSION — H017 Pinch ("proof-carrying collection runs") | 03 |
| https://github.com/SacSresta/pinch-buyer-agent | 0 | Python | 196 | SUBMISSION — H017 (buyer-side mandate/webhook agent) | 01/02 |
| https://github.com/bsbalkar/PinchPaymentsApp | 0 | JS | 10,410 | SUBMISSION — H017 | 03 |
| https://github.com/Outlier1217/skale-agentic-ai-escrow-commerce | 1 | JS | 227 | SUBMISSION — H021 | 02 |
| https://github.com/holyaustin/DynamixPay | 0 | TS | 1,572 | SUBMISSION — H038 (payroll/treasury agent) | 04 |
| https://github.com/qorexdevs/Verix | 0 | TS | 207 | SUBMISSION — H021 | 01 |
| https://github.com/0xE1337/agentforge | 0 | TS | 303 | SUBMISSION — H040 (pay-per-skill-call + rating) | 01 |
| https://github.com/Nuru-AI/sippar-algorand-x402 | 0 | TS | 1,390 | SUBMISSION — H022/H041 | 01 |
| https://github.com/mrtinhnguyen/x402r-mcp | 0 | JS | 147 | SUBMISSION — H041 (MCP server for x402 pay + refund) | 02/03 |
| https://github.com/sergeyshemyakov/juicebagmail | 0 | HTML | 4,568 | **WINNER** 1st — H022 | 01 |
| https://github.com/Dakavon/algorand-x402-hackathon | 0 | TS | 53,565 | **WINNER** 2nd — H022 (Volt402, M2M metered payment) | 01 |
| https://github.com/TriplEight/SPM | 1 | TS | 659 | **WINNER** 3rd — H022 | 01 |
| https://github.com/rustamino/team-localhost-x402 | 0 | Python | 349 | **WINNER** 3rd, Infra — H022 | 01 |
| https://github.com/LokoAnas/Algorand | 0 | Python | 496 | **WINNER** bonus — H022 (agent reputation scoring) | 02 |
| https://github.com/techMellouk/VibeQuant | 0 | TS | 46,249 | **WINNER** bonus — H022 | 05 |
| https://github.com/julian-hecker/gke-hackathon | 1 | Python | 515 | **WINNER** (HM) — H028 (voice banking agent, ADK+MCP+Twilio) | 05 |
| https://github.com/giovannamoeller/nero-fashion-frontend + https://github.com/xValentim/nero-fashion | 3 / 5 | TS / Jupyter | 921 / 43,198 | **WINNER** (LATAM) — H028 | 01 |
| https://github.com/omkar-103/supplysaathi | 0 | JS | 869 | SUBMISSION — H016 | 04/01 |
| https://github.com/devpras22/kusushi | 0 | TS | 6,033 | SUBMISSION — H016 | 01 |
| https://github.com/hkarekar403/TravelGuard24 | 0 | TS | 414 | SUBMISSION — H016 | 01 |
| https://github.com/coderhema/agentcart | 1 | TS | 138 | SUBMISSION — H041 | 01 |
| https://github.com/FetyEth/microapi-hub | 0 | TS | 327 | SUBMISSION — H020 Solana x402 | 01 |
| https://github.com/Hany-Almnaem/agentbridge | 0 | TS | 140 | SUBMISSION — H020 Solana x402 | 01 |
| https://github.com/0xCaptain888/agentswarm | 0 | HTML | 61 | SUBMISSION — H040 Circle Nanopayments | 01 |
| https://github.com/UIghodaro/Founder-OS | 2 | JS | 1,056 | **WINNER?** — H018 Warwick (self-reported) | 05 |
| https://github.com/riyaaparanji/FINCLUSION-FINSHIELD-IITH-_HACKATHON | 0 | Jupyter | 2,731 | SUBMISSION — H008 | 02 |
| https://github.com/papagala/mcp-clinical-platform | 3 | Makefile | 220 | **WINNER** (runner-up) — H027 | 05 |
| https://github.com/automateyournetwork/kagent_vision | 10 | HTML | 196 | **WINNER** — H027 starter track | 05 |
| https://github.com/MassimoC/kagent-dotnet | 2 | C# | 1,614 | **WINNER** (runner-up) — H027 | 05 |
| https://github.com/lethaltrifecta/oss-contributions-track | 0 | Python | 24,937 | **WINNER** — H027 OSS track (identity-aware agent control plane) | 05 |
| https://github.com/Ava-Optimizer/Ava-Optimizer-Avalanche | 2 | HTML | 2,347 | SUBMISSION — H037 | 05 |
| https://github.com/TheCNgen/zap | 0 | TS | 647 | SUBMISSION — H039 | 01 |

## TIER D — verified but do NOT clone (stubs)
| Repo | Size | Why |
|---|---|---|
| https://github.com/razorpay/ftx-hackathon | 7 KB | wiki/rules only |
| https://github.com/SpartanLabsXyz/simmer-x402-prediction-trading-agent | 15 KB | reference stub |
| https://github.com/RequestTap/RequestTap-MCP | 17 KB | stub |
| https://github.com/lawrencezcl/agentpay-dapp | 53 KB | likely stub |
| https://github.com/samratdebnath-programmer/Nexis-Agentic-Commerce-Core | 34 KB | "Agentic Commerce OS" in 34 KB |
| https://github.com/SacSresta/pinch-agent-payments | 2 KB | empty |
| https://github.com/katt3e/Clearspend | 38 KB | likely stub |
| https://github.com/isametron/SettleTrace | 11 KB | RIVAL, near-empty |
| https://github.com/Manu-code-all/Ledgerlens | 15 KB | RIVAL, near-empty |
| https://github.com/VivekKumarDwivedi/AI-Finance-Controller-Multi-Source-Reconciliation-Agent | 24 KB | RIVAL, near-empty |

---

## SPECIAL SECTION — LIVE RIVAL SUBMISSIONS (Razorpay AI Buildathon 2026)
**These are not winners.** They are public repos pushed 20–26 Aug 2026 by people competing against you in the same event. Read them for saturation ("is my idea already everywhere?") and for the bar the field is setting — not as prior art to imitate. All verified 2026-08-26. Full enumeration of 182 described repos: `/tmp/rzp_research/competitor_repos.tsv`.

| Repo | Track | Size | Notable claim |
|---|---|---|---|
| https://github.com/ektamishra4321/milaan-ai | 04 | 121 | fine-tuned Qwen2.5-3B beats Gemini (99.8% vs 97%); **P/R 1.000 on held-out ground truth**; deterministic audit-trail engine |
| https://github.com/adityasingh1786/certus-ai-finance-controller | 04 | — | "Double-Lock" verification (deterministic rules + multi-model consensus relay), 14-day cash forecast, **read-only MCP governance** |
| https://github.com/Samyak17Jain/reconciliation-sentinel | 04 | 116 | 3-way recon (bank + ledger + GST) with an **adversarial self-audit tier** |
| https://github.com/ch24btech11028-create/recoagent | 04 | 234 | deterministic solvers match; LLM explains only the residual; every explanation must **survive an arithmetic replay** |
| https://github.com/cloudavenue0012-creator/settlement-reconciliation-engine | 04 | 259 | recompute-and-diff verification + **eval harness scoring detection against ground truth** |
| https://github.com/JazR20/reckon | 04 | 825 | "a reconciliation agent whose product is knowing when to refuse" |
| https://github.com/Pranavsingh431/settlement-witness | 04 | 596 | evidence-first auditable payment→settlement recon |
| https://github.com/tfthushaar/razorpay_buildathon | 04 | — | calibrated autonomy, causal-chain matching, fee-leak audit, ERP posting |
| https://github.com/simpleciki/unreconciled | 04 | 125 | "the reconciliation agent that refuses to guess" |
| https://github.com/gopal-labs/AI-Risk-Manager | 02 | — | XGBoost + SHAP + NetworkX fraud-ring visualiser + Gemini analyst case summaries |
| https://github.com/ayubeh1513/Payment-Fraud-Risk-Scorer-Razorpay-Buildathon | 02 | — | honest **time-based split**, cost-optimal thresholding, Groq LLM explanations |
| https://github.com/Gullu-D/ai-risk-manager | 02 | — | return-abuse (wardrobing, item-swap) detection, **defense-only, honest held-out metrics** |
| https://github.com/Akshay1267/revenue-recovery-agent | 03 | — | root-cause diagnosis + bounded action + audit trail + **compliant stopping rules** |
| https://github.com/anditisyou/revenue-recovery-agent | 03 | — | classify failure reason → optimal retry (timing + channel + message) → execute → report recovered revenue |
| https://github.com/Chinmay0608/razorpay-buildathon-receivables-chaser | 03 | — | autonomous invoice chasing, Spring Boot + React + **Kafka** |
| https://github.com/aryanpajnee/RazorpayBuildathon | 01 | 308 | a merchant an AI buyer agent can transact with **under signed and bounded authority** |
| https://github.com/Sansyuh06/KEOZ | 01 | 220 | merchant-side financial **policy layer** for agentic commerce |

**Pattern to notice (INFERENCE):** the rival field has already converged on *deterministic-first, LLM-only-on-the-residual*, *held-out ground truth with published precision/recall*, and *explicit refusal/escalation*. Those three are now table stakes, not differentiators.

---

## CONFIRMED-ABSENT REPOS — do not clone, they do not exist
Verified 404 via `gh repo view` on 2026-08-26, despite being cited by a winner page or a search result:
- `GKE-hack/online-boutique` (cited on the V-Commerce Studio Devpost page, H028 APAC winner)
- `CognitionHive/nexum-prism`, `CognitionHive/nexum-engine`, `CognitionHive/nexum-product-backend`, `CognitionHive/nexum-fiducia` (H032)

## NO_PUBLIC_REPOSITORY — high-value winners with no code to clone
Study the write-ups, not the code.
- **AI-driven multi-agent fraud alert triage system** (H023, Best Bedrock AgentCore) — the closest published analogue to Track 02.
- **Province** (H023, 3rd overall) — 100% accuracy on 141 Form-1040 fields.
- **AegisAgent** (H023, 2nd overall) — evidence / policy-mapping / adversarial-challenger agents in debate rounds.
- **CardOS** (H028, NA regional winner) — 7-agent credit pipeline with explicit **Challenger** and **Arbiter** roles.
- **Erster**, **Lockpay**, **AgentTab**, **Panelet**, **AlphaOracle** (H022).
- **x402-sf** (Superfluid) and **Cheddr Payment Channels** (H019) — repos not located.
- All RBI HaRBInger winners (H005–H007) incl. **FraudLens**, and FinShield's **Team Jigyasa** (H008).
