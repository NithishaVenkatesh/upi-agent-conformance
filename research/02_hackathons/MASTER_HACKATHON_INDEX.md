# MASTER HACKATHON INDEX — Razorpay AI Buildathon 2026 transferable-engineering dataset

**Compiled:** 2026-08-26 · **Window:** Feb 2025 – Aug 2026 (older Tier-1 Razorpay events included for completeness)
**Target competition:** Razorpay AI Buildathon 2026 — Track 01 AI Growth & Agentic Commerce · Track 02 AI Risk Manager · Track 03 AI Revenue Recovery · Track 04 AI Finance Controller · Track 05 Open

## Method & tool provenance (read this before trusting anything below)
- **Firecrawl MCP was unavailable** for the whole session (`firecrawl_search`/`firecrawl_scrape` errored; `~/.superstack/web/bin/webup` reported "Docker not running"). Fallback stack: **WebSearch** (budget exhausted mid-session at 200/200 calls), **WebFetch** (primary source retrieval), and the **authenticated `gh` CLI** (highest-yield tool by far).
- **Every GitHub URL in this dataset was verified with `gh repo view OWNER/NAME --json ...`.** A repo that failed to resolve is recorded as confirmed-absent, never as a URL. Example of a claim we deliberately killed: `GKE-hack/online-boutique`, cited on a Devpost winner page, does not exist.
- Evidence labels: **FACT** = stated on a retrieved source page. **INFERENCE** = our judgement or a single self-reported source.
- Evidence quality: **STRONG** = organizer-published winner list. **MEDIUM** = credible secondary/self-reported + corroborating artefact. **WEAK** = single unverified source.
- Deduplication rule applied: one competition = one H-ID. Recaps, tweets, news articles and galleries about the same event are *sources for that ID*, not new IDs.

## Headline findings
1. **TIER 1 (Razorpay's own): EVIDENCE NOT FOUND for any usable winner dataset.** The Buildathon itself has no winners (applications close 5 Sep 2026). The FTX Hackathon (2020/21) named two winners with no public repos. HACK:O(n) is internal-only. "AI for Good 2026" is aggregator-listed only, page 403s. The one strong Tier-1 datapoint is inverted: **Razorpay POS itself won 1st prize at RBI HaRBInger 2023** with DrishtiPay.
2. **The single most useful discovery is not a winner list at all** — it is that 100+ **rival Buildathon submissions are already public on GitHub** (pushed 20–26 Aug 2026), with descriptions quoting the official track names. That is live competitive intelligence on what the field is building *right now*. See `H001_winners.md`.
3. **Best repo yield per event:** H022 Algorand Berlin x402 (11 winners, 9 verified repos), H027 Solo.io MCP (8 winners, 8 repos), H028 GKE Turns 10 (banking/commerce base apps), H016 Prava Agentic Commerce (13+ verified submission repos, Visa/OpenAI-judged).
4. **Indian fintech competitions publish winners but never code.** Every RBI HaRBInger and FinShield winner is `NO_PUBLIC_REPOSITORY`. Useful for *what wins* (an action taxonomy: block / approve / step-up), useless for *how it was built*.

---

## COMPETITION REGISTRY (deduplicated)

| ID | Name | Organizer | Date | Location | Tier | Domain | Official URL | Winner source | Public projects | GH repos | Relevant winners | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| H001 | Razorpay AI Buildathon 2026 | Razorpay | apps close 5 Sep 2026 | Bengaluru | **1** | payments/AI hiring funnel | https://razorpay.com/buildathon/ | — none exist | rival subs only | yes (rivals) | **0 (none announced)** | STRONG (event) / NOT FOUND (winners) |
| H002 | Razorpay FTX Hackathon | Razorpay | 2020, 2021 | Devfolio | **1** | fintech open | https://ftx-hackathon.devfolio.co/ | x.com/RazorpayFTX/status/1470247844661514241 | gallery | rules repo only (stub) | 2 named | MEDIUM |
| H003 | Razorpay HACK:O(n) | Razorpay (internal) | ~Jul 2024 | offices | **1** | internal | yourstory.com/2024/07/razorpay-employees-battle-hackon-2024 | — | no | no | 0 | WEAK |
| H004 | Razorpay AI for Good Hackathon 2026 | Razorpay | 2026 | hybrid | **1** | AI for good | hackortech.in listing (403 on official) | — | unknown | unknown | 0 | WEAK |
| H005 | RBI HaRBInger 2023 (2nd) | RBI | Oct 2023 | Bengaluru | 2 | accessible digital banking | rbi.org.in | razorpay.com/newsroom/…drishtipay… | no | no | 1 | STRONG |
| H006 | RBI HaRBInger 2024 (3rd) | RBI | results 7 Jan 2025 | Bengaluru | 2 | zero financial frauds; divyang-friendly | rbi.org.in | charltonsquantum.com/rbi-announces-harbinger-2024-winners/ | no | no | 5 | STRONG |
| H007 | RBI HaRBInger 2025 (4th) | RBI | Oct 2025 → winners May 2026 | Bengaluru | 2 | tokenised KYC; offline CBDC; trust in DFS | rbi.org.in | cryptotimes.io/2026/05/19/… ; psuconnect.in/… | no | no | 6 | STRONG |
| H008 | FinShield Hackathon 2025 | Bank of India × IIT Hyderabad (DFS/IBA) | Sept 2025 | IIT Hyderabad | 2 | fraud, credit risk, passwordless auth | pr.iith.ac.in/…FinShield…pdf | campusvarta.com/…; deccanchronicle.com/… | no | no (1 unconfirmed) | 1 | MEDIUM |
| H009 | NPCI FinTech Hackathon @ Mumbai Tech Week | NPCI | Feb 2025 | Mumbai | 2 | UPI-scale fraud ML | x.com/NPCI_NPCI/status/1894035854412140800 | NOT FOUND | no | no | 0 | WEAK |
| H010 | Union Bank IDEA Hackathon 2025 | Union Bank of India | 2025 | India | 2 | banking | mediainfoline.com/… | partial | no | no | 0 | WEAK |
| H011 | Indian Bank × IIT Madras Innovision 2025 | Indian Bank / IIT Madras | 2025 | Chennai | 2 | fintech + cybersec | passionateinmarketing.com/… | partial | no | no | 0 | WEAK |
| H012 | IIT Kanpur × Ericsson National Fintech Hackathon 2026 | Ericsson / FIRST IIT-K | Oct 2025 → 2026 | pan-India | 2 | payment security/UX | iitk.ac.in/national-fintech-hackathon-2026 | in progress | no | no | 0 | NOT FOUND (in flight) |
| H013 | Barclays Hack-o-Hire (2nd ed) | Barclays India | 26–27 Apr 2025 | Pune | 2 | hiring hackathon | — | participant blog only | no | no | 0 | WEAK |
| H014 | Global Fintech Fest 2025 hackathons | SEBI/BSE/CDSL/NSDL/KFINTECH + GFF | 7–9 Oct 2025 | Mumbai | 2 | securities, rural fintech, banking AI | globalfintechfest.com/sebi-hackathon | NOT FOUND | no | no | 0 | WEAK |
| H015 | Inter-IIT Tech Meet 14.0 (Quant Finance) | IIT Patna | 11–15 Dec 2025 | Patna | 3 | quant finance | interiit-tech.com | iitdh.ac.in/… | no | no | 1 | MEDIUM (low relevance) |
| H016 | **Agentic Commerce Hackathon 2026** | **Prava** + OpenAI, Visa, Linq, Localhost, Project NANDA, Senso | 31 Jul – 2 Aug 2026 | online (Devfolio) | **2** | agentic commerce on a payments API | https://agentic-commerce.devfolio.co/overview | winner's own portfolio (self-reported) | yes | **yes, many** | 1 confirmed + 4 unverified + 13 verified submissions | MEDIUM |
| H017 | "Pinch Me! I Want 50K" | Pinch Payments + The Founders Union | Jul–10 Aug 2026 | Sydney | 2 | billing, subscriptions, receivables | https://pinch-me-i-want-50k.devpost.com/ | gallery unpublished | no | yes (4 subs) | 0 confirmed | WEAK |
| H018 | Warwick FinTech Hackathon 2026 | Univ. of Warwick societies | 2026 | Warwick UK | 3 | general fintech | NOT LOCATED | self-reported repo | GitHub only | yes (4) | 1 self-reported | WEAK |
| H019 | **Ethereum Foundation x402 Hackathon** | Ethereum Foundation DAT + x402 ecosystem | 8 Dec 2025 – 5 Jan 2026 | virtual | **2** | internet-native agent payments | https://www.x402hackathon.com/ | x.com/ethereumfndn/status/2012209845856796760 | yes | yes | 3 named | MEDIUM |
| H020 | Solana x402 Hackathon | Solana Foundation | late 2025 | global | 2 | x402 micropayments + agents | https://solana.com/x402/hackathon | x.com/solana_devs/status/1995884095705059548 | yes | yes | 2 named | MEDIUM |
| H021 | SF Agentic Commerce x402 Hackathon | SKALE + DoraHacks (Google AP2, Coinbase, Virtuals tracks) | 2026 | SF + online | 2 | agentic commerce | https://dorahacks.io/hackathon/x402 | skale.space/blog/…recap-winners | yes | yes | 2 confirmed | MEDIUM |
| H022 | **Agentic Commerce x402 Hackathon Berlin** | Algorand Foundation | Jun 2026 | Berlin | **2** | agentic commerce + payment infra | https://luma.com/agentic-commerce-hack | https://algorand.co/blog/agentic-commerce-x402-hackathon-berlin-recap | yes | **yes (9 verified)** | 11 | **STRONG** |
| H023 | **AWS AI Agent Global Hackathon** | AWS + Devpost | Oct→5 Dec 2025 | global | 3 | AI agents on AWS | https://aws-agent-hackathon.devpost.com/ | /updates/38140-congratulations-… | yes | partial | 8 placements, 4 relevant | STRONG |
| H024 | **ADK Hackathon with Google Cloud** | Google Cloud + Devpost | 12 May – 23 Jun 2025 | global | 3 | multi-agent w/ ADK | https://googlecloudmultiagents.devpost.com/ | cloud.google.com/blog/…adk-hackathon-results… | yes | yes | 8 placements, 2 relevant | STRONG |
| H025 | Microsoft AI Agents Hackathon 2025 | Microsoft | 8–30 Apr 2025 | global | 3 | Azure AI agents | https://microsoft.github.io/AI_Agents_Hackathon/ | /winners/ | yes (GH issues) | yes | 6 + 9 HMs | STRONG |
| H026 | Global Agent Hackathon (May 2025) | Agno | May 2025 | global | 3 | agents/RAG/tool use | github.com/global-agent-hackathon/global-agent-hackathon-may-2025 | agno.com/blog/global-agent-hackathon-winners | yes (PRs) | yes | ~30 placements, low fintech | STRONG |
| H027 | **2026 Hackathon for MCP & AI Agents** | Solo.io | Feb–Apr 2026 | global | 3 | MCP/agent infra, governance, security | solo.io | solo.io/blog/celebrating-the-winners-… | yes | **yes (8)** | 8 | STRONG |
| H028 | **GKE Turns 10 Hackathon** | Google Cloud | 2025 | global | 3 | multi-agent on Bank of Anthos / Online Boutique | cloud.google.com/blog/…gke-hackathon | same | yes | yes (4 of 6) | 6 | STRONG |
| H029 | MCP – AI Agents Hackathon | Creators Corner @ AWS Builder Loft | 19 Sep 2025 | SF + online | 3 | MCP tool-calling agents | https://mcp-ai-agents-hackathon.devpost.com/ | /project-gallery | yes | yes (2) | 2 | STRONG |
| H030 | **DevNetwork [AI + ML] Hackathon 2026** | DevNetwork | 11–28 May 2026 | S. San Francisco + online | 3 | agent resilience / infra harness | https://devnetwork-ai-ml-hack-2026.devpost.com/ | /project-gallery | yes | yes (2) | 2 | STRONG |
| H031 | DeveloperWeek 2026 Hackathon | DevNetwork | 2–20 Feb 2026 | San Jose + online | 3 | document automation | https://developerweek-2026-hackathon.devpost.com/ | /project-gallery | yes | yes (1) | 1 | STRONG |
| H032 | OpenAI Build Week | OpenAI + Devpost | 13–21 Jul 2026 | global | 3 | general LLM apps | https://openai.devpost.com/ | gallery | yes | none usable | 0 | WEAK |
| H033 | AWS Agentic AI Hackathon | AWS | 10 Oct 2025 | SF | 3 | agent security tooling | https://aws-agentic-ai-hackathon.devpost.com/ | /project-gallery | yes | — | 0 relevant | MEDIUM |
| H034 | Gradio Agents & MCP Hackathon 2025 | Hugging Face / Gradio | 2–17 Jun 2025 | global | 3 | Gradio MCP servers | https://huggingface.co/Agents-MCP-Hackathon | NOT FOUND (404s) | 603 Spaces | unverified | 0 | WEAK |
| H035 | Microsoft AI Dev Days Hackathon 2026 | Microsoft | 2026 | online | 3 | Azure AI agents | techcommunity.microsoft.com/blog/azure-events/…/4513528 | **blocked by SSO** | unknown | unknown | 0 | WEAK |

| H036 | **ETHGlobal Lisbon 2026** | ETHGlobal | 24–26 Jul 2026 | Lisbon | 2/3 | agentic payments (Hedera AI & Agentic Payments track) | https://ethglobal.com/events/lisbon2026 | https://ethglobal.com/showcase (per-project "WINNER OF" badge) | yes | **yes (9)** | 2 badge-confirmed + 7 high-relevance subs | STRONG |
| H037 | Avalanche Hack2Build: Payments x402 | Avalanche / Ava Labs | ~Dec 2025 | remote | 2 | payments infra | not located | NOT FOUND | submission repo only | yes (1) | 0 | WEAK |
| H038 | Cronos x402 Hackathon | Cronos / DoraHacks | Nov 2025 – Feb 2026 | remote | 2 | agent commerce, escrow, risk | not located | NOT FOUND | submission repos only | yes (3) | 0 | WEAK |
| H039 | Canteen × Aptos x402 Hackathon | Canteen + Aptos | Jan–Feb 2026 | remote | 2 | agent commerce | not located | NOT FOUND | submission repo only | yes (1) | 0 | WEAK |
| H040 | Agentic Commerce on Arc / Circle Nanopayments | Coinbase / Circle via lablab.ai | Apr 2026 | remote | 2 | agent-to-agent payments | https://lablab.ai/ai-hackathons/agentic-commerce-on-arc | **403 blocked** | submission repos only | yes (2) | 0 | WEAK |
| H041 | Unattributed "x402 Hackathon" submissions | various | 2025–2026 | remote | 2 | agent spend policy, x402 tooling | — | n/a (registry-hygiene entry) | yes | yes (5) | 0 | n/a |

**Totals: 41 competitions. Tier 1 = 4 (H001–H004). Tier 2 = 22. Tier 3 = 15.**


---

## Per-competition detail
Full placement tables, problem/solution write-ups, source URLs and repo verification live in one file per competition:
`research/03_winners/H001_winners.md` … `H0NN_winners.md`.

The prioritised, verified, clonable repo list is `REPO_SHORTLIST.md` in this directory.

---

## EVIDENCE NOT FOUND — consolidated
State these plainly rather than papering over them.

**Tier 1 (Razorpay):**
- No winner list for the Razorpay AI Buildathon 2026 — none exists yet (FACT, not a search failure).
- No public repo for either FTX Hackathon winner (InOffice Pay 2020; KeyboardCavalry 2021).
- No published team/project names for HACK:O(n).
- Razorpay AI for Good Hackathon 2026 — official page 403s; existence only aggregator-evidenced.
- No dedicated public RazorpayX hackathon exists (RazorpayX is a product line, not an event brand).
- "Razorpay AI Hackathon 2025" as a distinct event could not be confirmed.

**Tier 2 India:** NPCI MTW 2025 winners; Union Bank IDEA 2025 individual winners; Indian Bank Innovision 2025 winners; GFF 2025 (SEBI / Rural / Banking AI) winners; Barclays Hack-o-Hire winner name; Amex Campus Challenge/Makeathon winners; Setu / Cashfree / Juspay / Zerodha / Paytm public hackathons (no evidence any ran one in-window); IFSCA hackathons (unresearched).

**Tier 2 global payments (genuine research gap, not confirmed absence):** Stripe, Mastercard Agent Pay, PayPal, Adyen, Plaid, Block/Square, Checkout.com, Klarna, Airwallex, Marqeta, Modern Treasury, Ramp, Brex, Intuit/QuickBooks, Xero, Bill.com, Sardine, Sift, Unit21, Alloy, Nium, Wise, Revolut, SWIFT, Temenos, Finastra, FIS, Fiserv, Citi, JPMorgan, Goldman, HSBC, Barclays Rise, ING, BBVA, Santander, Money20/20 2025-26, Singapore FinTech Festival Hackcelerator, MAS APIX, Hong Kong FinTech Week, DIFC FinTech Hive. WebSearch budget exhaustion + Firecrawl outage stopped the long-tail sweep.

**Tier 3 unresearched (flagged, not negative evidence):** Microsoft Agent Academy Hackathon; LangChain/LangGraph Interrupt, CrewAI, LlamaIndex, Vellum, Modal, Mistral, Cerebras, Groq, Together AI, Vercel AI, Cloudflare Agents, Databricks, Snowflake, Salesforce Agentforce, UiPath, n8n hackathons 2025-26; MLH/university fintech sponsor prizes (TreeHacks, HackMIT, CalHacks, PennApps, HackHarvard); Kaggle fraud/credit/forecasting competitions 2025-26.

**Repos confirmed NOT to exist** (cited somewhere but 404 on `gh repo view`): `GKE-hack/online-boutique`; `CognitionHive/nexum-prism`, `nexum-engine`, `nexum-product-backend`, `nexum-fiducia`.
