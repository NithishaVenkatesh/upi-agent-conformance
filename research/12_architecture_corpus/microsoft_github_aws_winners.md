# Architecture-documentation corpus — Microsoft, GitHub, AWS, Atlassian, Slack, Twilio, Cloudflare, Notion hackathon winners

**Empirical study. Retrieval date for every row: 2026-08-26.** All repo metadata obtained live via `gh repo view`, `gh api repos/{o}/{r}/readme`, `gh api repos/{o}/{r}/contents`, `gh api repos/{o}/{r}/git/trees/HEAD?recursive=1`. No repo appears below that was not resolved on that date; repos that 404'd are recorded as 404, not silently dropped. Winner/finalist repos that turned out to be stubs, empty, or README-less **are recorded** — that is the point.

This file records **what winners actually shipped as documentation**, not what good documentation looks like.

**Corpus size: 125 winner/finalist repo URLs across 28 distinct events → 120 resolve → 104 have a non-empty README → 16 are alive with no README at all → 5 are HTTP 404.**

The corpus is deliberately split into two cohorts, because they behave very differently:

| Cohort | Events | Repos claimed | READMEs analysed | Sections |
|---|---|---|---|---|
| **A — AI-agent / enterprise-platform hackathons** (Microsoft, AWS, Atlassian) | 20 | 74 | 58 | §2–§7 |
| **B — general developer-platform hackathons** (GitHub, Slack, Twilio, Cloudflare, Notion) + a Game Off contrast set | 8 | 51 | 46 | §8 |

Headline numbers in §5–§7 are cohort A unless stated. §8d compares the two directly.

---

## 1. How the cohort was assembled, and evidence quality

| Evidence class | Meaning | Repos |
|---|---|---|
| **organizer-confirmed** | Placement stated on an organizer-owned page (microsoft.github.io, devblogs.microsoft.com, devpost `/updates/`) that links the repo, or links a submission issue containing the repo URL | 27 |
| **devpost winner-ribbon** | Placement string taken verbatim from the Devpost gallery `winner-ribbon` badge + the project page's prize label; repo taken from the project's own "Try it out" link | 45 |
| **SELF-REPORTED-WEAK** | Placement claim appears only in the repo's own GitHub description; no organizer page located | 2 |

Two organizer patterns made this possible and are worth naming:

1. **`microsoft/AI_Agents_Hackathon` and the two `microsoft/hack-together*` repos require every submission to be a GitHub issue with a mandatory `### Project Repository URL` field.** The organizer winners page links each winner to its issue. This gives organizer-confirmed placement → repo mappings with zero inference.
2. **Devpost galleries carry a `winner-ribbon` in the HTML and an exact prize label on each project page.** That is how the AWS and Atlassian placements below were pinned, including the organizers' own typo *"Honarable mentions"* on the AWS Lambda Hackathon, reproduced verbatim.

**Events searched that yielded nothing usable, and why (negative results):**

| Event | Outcome |
|---|---|
| Microsoft AI Dev Days Hackathon 2026 | Winners page on `techcommunity.microsoft.com` forces a Microsoft OIDC/SSO redirect; not retrievable by automated fetch. **0 repos.** |
| Microsoft RAGHack (`microsoft/RAG_Hack`) | Submission issues exist; **no winner list published in the repo or README**. **0 confirmed placements.** |
| Microsoft Imagine Cup | Organizer pages do not link repos. Only 2 repos found anywhere, both claiming placement **in their own repo description only**. |
| Atlassian Codegeist (all editions) | **Codegeist is structurally repo-poor.** Of 16 Codegeist 2024 winners, 1 has a public repo. Of 21 Codegeist 2025 winners, 4. Of 23 Codegeist Unleashed winners, 4 (one of which, `bitanath/codegeisthackathon`, 2nd place, is now 404). Forge apps ship to Marketplace without source. |
| AWS Game Builder Challenge | 12 winners, **1 public repo**. Game submissions almost never publish source. |
| AWS AI Agent Global Hackathon 2nd/3rd overall (AegisAgent, Province) and Best-Bedrock-AgentCore (fraud alert triage) | Devpost write-ups and live URLs exist; **no public repository**. |
| AWS Agentic AI Hackathon — Udon Cat, CommitDNA | Devpost links `chinesepowered/aws-secure-agent` and `yigitkonur/commitdna`; **both 404**. |
| AWS Agentic AI Hackathon — TidyShot, CodeShield; AWS Lambda 1st Prize (ForestShield); Lambda HMs Buzz CSV, VA Rating Assistant | **No repo link on Devpost at all.** |
| EcoLafaek (AWS 1st place overall) | Original `ajitonelsonn/EcoLafaek` **deleted**; only two third-party copies of the identical 63,199 KB tree survive. |

---

## 2. Per-repo table — Microsoft cohort

`RM w` = README words, fenced code stripped. `Arch w` = words under headings matching architecture/design/how-it-works/data-flow/components/tech-stack. `MMD` = Mermaid blocks. `ASCII` = fenced blocks with box-drawing chars or ≥2 arrow chains. `Imgs` = all inline images **including badges**.

### 2a. Microsoft AI Agents Hackathon 2025 (Apr 2025; 570 submissions, 18k registrants)
Evidence for every row: `https://microsoft.github.io/AI_Agents_Hackathon/winners/` + the linked submission issue. **Organizer-confirmed.**

| Repo | Project | Placement | Lang | ★ | KB | Pushed | RM w | Arch w | Heads | MMD | ASCII | Imgs | Separate arch doc |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| [oh-qi-qi/azure-ai-agent-hackathon-2025](https://github.com/oh-qi-qi/azure-ai-agent-hackathon-2025) | RiskWise | **Best Overall** | Python | 32 | 17,535 | 2025-05-01 | 1,619 | **925** | 34 | 0 | 2 | 14 | no (`docs/images/system_architecture.png` only) |
| [manasseh-zw/apollo](https://github.com/manasseh-zw/apollo) | Apollo | Best C# Agent | C# | 101 | 4,072 | 2025-06-08 | 1,480 | 354 | 9 | 0 | 0 | 17 | no (`docs/sys.png`) |
| [sdamache/konveyor-onboarding-agent](https://github.com/sdamache/konveyor-onboarding-agent) | Konveyor | Best Python Agent | Python | 8 | 1,537 | 2025-05-29 | 882 | 148 | 21 | **3** | 1 | 2 | **yes — `docs/architecture.md`, 565 w, 1 Mermaid** |
| [hgenix20/modelproof](https://github.com/hgenix20/modelproof) | ModelProof | Best JS/TS Agent | TypeScript | 6 | 4,070 | 2026-06-14 | 521 | 43 | 13 | 1 | 0 | 2 | no |
| [tagr/ai-agents-hack](https://github.com/tagr/ai-agents-hack) | TARIFFED! | Best Azure AI Agent Service | TSQL | 5 | 4,144 | 2025-04-30 | 608 | 43 | 10 | 0 | 0 | 12 | no |
| [Santhoshkumard11/WorkWizee](https://github.com/Santhoshkumard11/WorkWizee) | WorkWizee | Best Copilot Agent | Python | 4 | 1,789 | 2025-05-01 | 613 | 124 | 17 | 0 | 0 | 1 | no |
| [Xenixxxxx/bits-to-brain](https://github.com/Xenixxxxx/bits-to-brain) | Bits2Brain | Best Java Agent | Java | 4 | 825 | 2025-05-06 | 849 | 182 | 14 | 0 | 0 | 1 | no |
| [graceliu396/DeepStudy](https://github.com/graceliu396/DeepStudy) | DeepStudy | Honourable Mention | Python | 1 | 15,056 | 2025-05-01 | 641 | 360 | 10 | 0 | 0 | 3 | no |
| [eragornmitra/mm_retail_ai_chatbot_multi-modal](https://github.com/eragornmitra/mm_retail_ai_chatbot_multi-modal) | Agent Groot | Honourable Mention | Python | 0 | 18,524 | 2025-04-30 | 383 | **0** | **2** | 0 | 0 | 0 | no |
| [shanta3220/ai-agents-hackathon](https://github.com/shanta3220/ai-agents-hackathon) | Nuroxa | Honourable Mention | Python | 1 | 63,325 | 2026-06-29 | 696 | 19 | 11 | 0 | 0 | 0 | no |
| [rodcar/agentic-software-factory](https://github.com/rodcar/agentic-software-factory) | Agentic Software Factory | Honourable Mention | Python | 1 | **58** | 2025-05-23 | 189 | **0** | 9 | 0 | 0 | 0 | no |
| [AnassKartit/regulaite-hackathon](https://github.com/AnassKartit/regulaite-hackathon) | RegulAIte | Honourable Mention | Python | 0 | 99,293 | 2025-05-01 | 484 | **0** | 10 | 0 | 0 | 1 | **yes — `docs/Architecture.md`, 328 w + `architecture.drawio.png`** |
| [ai-partners/personal-finance-manager](https://github.com/ai-partners/personal-finance-manager) | Personal Finance Manager | Honourable Mention | Python | 6 | 13,230 | 2025-05-20 | 597 | 217 | 12 | 0 | 0 | 2 | no |
| `YuriyMorozyuk95/DocAssistant.Researchy` | DocAssistant.Researchy | Honourable Mention | — | — | — | — | — | — | — | — | — | — | **404 — deleted/private (owner alive)** |
| `AIGUE-Brasil/sirius-teste` | Sirius | Honourable Mention | — | — | — | — | — | — | — | — | — | — | **404 — deleted/private (owner alive)** |
| `denivadim/ai_recruiter` | Seveum | Honourable Mention | — | — | — | — | — | — | — | — | — | — | **404 — deleted/private (owner alive)** |

### 2b. Microsoft Hack Together: Microsoft Graph and .NET (Mar 2023)
Evidence: `https://devblogs.microsoft.com/microsoft365dev/announcing-the-hack-together-microsoft-graph-and-net-winners/`. **Organizer-confirmed.**

| Repo | Project | Placement | Lang | ★ | KB | RM w | Arch w | Heads | MMD | Imgs |
|---|---|---|---|---|---|---|---|---|---|---|
| [aksoftware98/hack-together23](https://github.com/aksoftware98/hack-together23) | Magic Note | **1st place** | C# | 14 | 26,802 | 1,695 | 113 | 11 | 0 | 8 |
| `hassou/ScheduleEase` | ScheduleEase | 2nd place | — | — | — | — | — | — | — | **404** |
| [Rahtoken/magi-msgraph-hackathon](https://github.com/Rahtoken/magi-msgraph-hackathon) | magi | 3rd place | C# | 8 | **17** | **148** | 18 | 10 | 1 | 2 |
| [svrooij/msgraph-sdk-dotnet-batching](https://github.com/svrooij/msgraph-sdk-dotnet-batching) | Graph SDK Batching | Honourable mention | C# | 1 | 56 | 412 | **0** | 6 | 0 | 1 |

### 2c. Microsoft HackTogether: Teams Global Hack (2023)
Evidence: `https://devblogs.microsoft.com/microsoft365dev/announcing-the-hacktogether-microsoft-teams-global-hack-winners/`. **Organizer-confirmed.**

| Repo | Project | Placement | Lang | ★ | KB | RM w | Arch w | Heads | Imgs |
|---|---|---|---|---|---|---|---|---|---|
| [rfjschouten/Live-Patient-Review-HackTogetherTeams](https://github.com/rfjschouten/Live-Patient-Review-HackTogetherTeams) | Live Patient Review | **Grand prize winner** | JavaScript | 0 | 7,083 | 1,286 | **0** | 14 | 6 |
| [kunj-sangani/TestYourKnowledgeBot](https://github.com/kunj-sangani/TestYourKnowledgeBot) | Knowledge Quest Teams Bot | Best AI-powered solution | — | 1 | 136 | **NO README AT ALL** | — | — | — |
| [Tanddant/TeamsGuestUserOverview](https://github.com/Tanddant/TeamsGuestUserOverview) | Guest user overview in Teams | Best productivity-focused solution | TypeScript | 5 | 2,184 | 408 | **0** | 11 | 4 |
| `YuriyMorozyuk95/DocAssistant` | DocAssistant | Community hack winner | — | — | — | — | — | — | **404** |

### 2d. Microsoft Imagine Cup — `SELF-REPORTED-WEAK`

| Repo | Project | Claimed placement | Lang | ★ | KB | RM w | Arch w | Heads | Imgs |
|---|---|---|---|---|---|---|---|---|---|
| [Eyetist/Eyetist_Client](https://github.com/Eyetist/Eyetist_Client) | EyeTist | "2023 Imagine Cup World Finalist" (repo description only) | JavaScript | 3 | 93,032 | 488 | 29 | 17 | 23 |
| [Rajdip019/booklee](https://github.com/Rajdip019/booklee) | Booklee | "Finals of Microsoft Imagine Cup 2022" (repo description only) | JavaScript | 24 | 1,819 | 1,178 | **0** | 19 | 22 |

---

## 3. Per-repo table — AWS cohort

Evidence for every row: Devpost gallery `winner-ribbon` + project-page prize label; repo from the project's "Try it out" link. Placement strings are Devpost's own wording.

### 3a. AWS AI Agent Global Hackathon (submissions to 20 Oct 2025; winners 5 Dec 2025 at re:Invent)

| Repo | Project | Placement | Lang | ★ | KB | RM w | Arch w | Heads | MMD | ASCII | Imgs | Separate arch artifact |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| [martinwangjian/EcoLafaek](https://github.com/martinwangjian/EcoLafaek) | EcoLafaek | **1st Place** (public copy; original deleted) | Dart | 0 | 63,199 | 1,365 | 342 | 30 | 0 | 1 | 21 | no |
| [chandra447/Oratio](https://github.com/chandra447/Oratio) | Oratio | Best Amazon Bedrock Application | Python | 3 | 2,883 | 1,078 | **466** | 32 | **8** | 0 | 1 | **yes — `agent-creator/ARCHITECTURE.md` 1,219 w; `docs/Oratio.drawio.png`; `.kiro/specs/oratio-platform/design.md`** |
| [Unknown1502/Compliance-Guardian-AI](https://github.com/Unknown1502/Compliance-Guardian-AI) | Compliance Guardian AI | Best Amazon Q Application | Python | 1 | 1,852 | 998 | 380 | **43** | 0 | 0 | 3 (all badges) | **yes — `docs/ARCHITECTURE.md` 997 w + `diagrams/` (6 PNGs, unreferenced by README)** |
| [akashtalole/Drishti-AI-Navigator-App](https://github.com/akashtalole/Drishti-AI-Navigator-App) | Drishti AI Navigator | Best Amazon Nova Act Integration | Python | 3 | 2,677 | 1,739 | **11** | **78** | 0 | 4 | 4 | **yes — `architecture/` dir: 6 PNGs, 1 SVG, 1 `.mermaid`, `AWS_Architecture_Diagrams.md`** |
| [marcosanyo/AgentShell](https://github.com/marcosanyo/AgentShell) | AgentShell | Best Strands SDK Implementation | Python | 3 | 575 | 2,045 | 207 | 57 | 0 | 2 | 2 | **yes — `docs/agentshell_architecture.drawio.png` + `.png`** |

### 3b. AWS Agentic AI Hackathon (10 Oct 2025, AWS SF Builders Loft)

| Repo | Project | Placement | Lang | ★ | KB | RM w | Arch w | Heads | ASCII | Imgs | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [persist-os/aws-hackathon](https://github.com/persist-os/aws-hackathon) | Darwin | Best Use of Semgrep | Python | 0 | 3,477 | 1,994 | 163 | **59** | 1 | 0 | no images at all, 59 headings |
| [Umar-Turdiev/AuditArc](https://github.com/Umar-Turdiev/AuditArc) | AuditArc | AWS Credits and More! | TypeScript | 0 | 385 | **150** | **0** | 7 | 0 | 0 | |
| [vedvkandge2000/LexiQ-…-legal-research-platform](https://github.com/vedvkandge2000/LexiQ-AI-powered-multi-agent-legal-research-platform) | Lexiq | Best Use of AWS + Best Use of Vanta | Python | 0 | 2,096 | 599 | **0** | 34 | 1 | 0 | |
| [jiuShiQi97/cookielens](https://github.com/jiuShiQi97/cookielens) | CookieLens | AWS Credits and More! | Python | 0 | 62,454 | 741 | 83 | 24 | 0 | 0 | |
| [highheat4/Self-Healing-Cloud](https://github.com/highheat4/Self-Healing-Cloud) | Self-Healing Cloud | organizer-listed winner, **no Devpost ribbon** | Python | 0 | 988 | **NO README** | — | — | — | — | ships `Cloud Agent Architecture.png` + a **46,737-byte `PLAN.md`** (hour-by-hour build spec with an `## Architecture` section) instead |
| [Mistobaan/2025-oct-10-aws-hackaton](https://github.com/Mistobaan/2025-oct-10-aws-hackaton) | ShopSentry | organizer-listed winner, **no Devpost ribbon** | TypeScript | 1 | 1,189 | **138** | **0** | 3 | 0 | 0 | |

### 3c. AWS Lambda Hackathon (2025)

| Repo | Project | Placement | Lang | ★ | KB | RM w | Arch w | Heads | MMD | ASCII | Imgs | Separate arch artifact |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| [Eduardismund/aws-hackathon-project](https://github.com/Eduardismund/aws-hackathon-project) | Smart Meeting Assistant | **2nd Prize** | JavaScript | 4 | 364 | 1,322 | **831** | 26 | 0 | 0 | 1 | no |
| [Crockwell-Solutions/drone-delivery-service](https://github.com/Crockwell-Solutions/drone-delivery-service) | Drone SoundAware | **3rd Prize** | TypeScript | 1 | 83,031 | 1,387 | 101 | 20 | 0 | 1 | 4 | `resources/images/architecture.png` |
| [Aristide021/OutScan](https://github.com/Aristide021/OutScan) | OutScan | "Honarable mentions" *(sic)* | Python | 0 | 9,480 | 1,290 | 242 | 45 | **3** | 1 | 9 | **yes — `diagrams/1-high-level-architecture.mmd`, `2-aws-infrastructure.mmd`, `3-data-flow-sequence.mmd`** |
| [alexbonella/awslambda-hack-smartclip-ai](https://github.com/alexbonella/awslambda-hack-smartclip-ai) | Smart Clip AI | "Honarable mentions" *(sic)* | Python | 1 | 91,969 | 764 | 82 | 12 | 0 | 0 | 7 | no |

1st Prize (**ForestShield**) has no GitHub link on Devpost.

### 3d. AWS MCP Agents Hackathon (SF, May 2025) — 11 winners, **6 with no README**

| Repo | Project | Placement | Lang | KB | RM w | Arch w | Heads |
|---|---|---|---|---|---|---|---|
| [MasMedIm/Potemkin](https://github.com/MasMedIm/Potemkin) | SpotCheck | Top Overall (AWS + DuploCloud) | Python | 23,168 | 488 | **0** | 12 |
| [michaelwaves/rfp-junior](https://github.com/michaelwaves/rfp-junior) | RFP Junior | Best Use of Auth0 | — | 23,286 | **NO README** (3 sub-READMEs in `backend/`, `frontend/`) | — | — |
| [BarathwajAnandan/Sniffy-hackathon](https://github.com/BarathwajAnandan/Sniffy-hackathon) | Sniffy | Best use of Browserbase / bem / Operant AI | — | 21,984 | **NO README** (all sub-READMEs belong to a vendored `woodpecker` tree) | — | — |
| [noteldar/truckerbuddy](https://github.com/noteldar/truckerbuddy) | Atarino | **Best Use of AWS** | — | **10** | **NO README** (only `README_VOICE_MCP_INTEGRATION.md`) | — | — |
| [derek-byte/mcp-hackathon](https://github.com/derek-byte/mcp-hackathon) | Vagari MCP | Best Use of MiniMax Audio | JavaScript | 9,665 | 887 | **0** | 43 |
| [headlesz/WordSurf](https://github.com/headlesz/WordSurf) | WordSurf | Best Use of MiniMax Audio | JavaScript | 941 | 391 | 64 | 12 |
| [Aaron-Chen/Aaron-and-Michael-Amazon-MCP-Agent-Hackathon](https://github.com/Aaron-Chen/Aaron-and-Michael-Amazon-MCP-Agent-Hackathon) | eBaySnipe | Best Use of MiniMax Audio | — | 3,027 | **NO README** | — | — |
| [ljoukov/voice-root](https://github.com/ljoukov/voice-root) | VoiceRoot | Best Use of MiniMax Audio | Svelte | 112 | **86** | **0** | 4 |
| [BayramAnnakov/saleshq](https://github.com/BayramAnnakov/saleshq) | SalesHQ | Best Use of Apify | TypeScript | 574 | 341 | 44 | 8 |
| [jishnu28/aws-hackloft-sfo](https://github.com/jishnu28/aws-hackloft-sfo) | ScoutWise | Best Use of Clarifai | — | 20,860 | **NO README anywhere in tree** | — | — |
| [mgesteban/collegematcher](https://github.com/mgesteban/collegematcher) | Community College Matcher | Best use of n8n | — | 1,348 | **NO README** (has `CLAUDE.md`, `memory-bank/`) | — | — |

### 3e. MCP-AWS Enterprise Agents Challenge (Jul 2025) — 11 winners, **3 with no README, 1 with a 2-word README**

| Repo | Project | Placement | Lang | KB | RM w | Arch w | Heads |
|---|---|---|---|---|---|---|---|
| [techcto/openapi-mcp-server](https://github.com/techcto/openapi-mcp-server) | Osirus.ai | Best use of AWS AI / Dynatrace / Top 5 Overall | JavaScript | 180 | **2,181** | **0** | 35 |
| [JasonLKelly/awshackjuly2025](https://github.com/JasonLKelly/awshackjuly2025) | Rokko | Most fun use of ClickHouse / Best use of Confluent Cloud | JavaScript | 13,056 | 1,119 | **727** | 19 |
| [EdgarBabajanyan/snowcone](https://github.com/EdgarBabajanyan/snowcone) | Snowcone | Best Use of Snowflake | Python | **8** | **53** | 0 | 4 |
| [sammydick22/InventoryPulse-backend](https://github.com/sammydick22/InventoryPulse-backend) | InventoryPulse (backend) | Best Use of NLX / Snowflake / Temporal | Python | 793 | 555 | **0** | 30 |
| [sammydick22/invento-flow-ai](https://github.com/sammydick22/invento-flow-ai) | InventoryPulse (frontend) | same | TypeScript | 284 | 261 | **0** | 6 |
| [Jeeevii/LangBridgeAI](https://github.com/Jeeevii/LangBridgeAI) | LangBridge AI | Best Use of MiniMax / Bright Data MCP / Top 5 Overall | — | 165 | **NO README** | — | — |
| [Prasanna721/ai-incident-agents](https://github.com/Prasanna721/ai-incident-agents) | AI Incident On-Call Agent | Best Use of MongoDB | — | 20 | **`README.md` exists and is 0 bytes** | — | — |
| [Aditya-Dawadikar/BotTalk](https://github.com/Aditya-Dawadikar/BotTalk) | BotTalk | Best use of Tavily MCP | Python | 3,111 | 379 | 332 | 8 |
| [yuviji/barter](https://github.com/yuviji/barter) | Arbitrage Agent | Best use of Tavily MCP / Top 5 Overall | TypeScript | 230 | 756 | 262 | 7 |
| [rajashekarcs2023/secureAI](https://github.com/rajashekarcs2023/secureAI) | SecureCode AI | Best use of Wiz | TypeScript | 86 | **2** | 0 | 1 |
| [michaelwaves/steve](https://github.com/michaelwaves/steve) | Steve | Top 5 Overall Teams | — | 165 | **NO README** (`backend/README.md` is 0 bytes) | — | — |

### 3f. MCP – AI Agents Hackathon @ AWS Builder Loft (19 Sep 2025) and AWS Game Builder Challenge

| Repo | Project | Placement | Event | Lang | KB | RM w | Arch w | Heads |
|---|---|---|---|---|---|---|---|---|
| [sinchana-gv/invoice-agent-x12-starter](https://github.com/sinchana-gv/invoice-agent-x12-starter) | Invoice Agent X12→ERP | Winner — Redis VL Innovator | MCP AI Agents @ AWS Builder Loft | Python | 8,627 | 505 | 53 | 21 |
| [georgeIshaq/Auto_Security](https://github.com/georgeIshaq/Auto_Security) | Auto_Sec | Winner — Best Bright Data MCP + Best Horizon3.ai | same | Python | 346 | 536 | 42 | 20 |
| [0xMuluh/sonique](https://github.com/0xMuluh/sonique) | sonIQue | Honorable Mention | AWS Game Builder Challenge (Amazon Q Developer) | TypeScript | 240,590 | 534 | **0** | 10 |

---

## 4. Per-repo table — Atlassian Codegeist cohort

Codegeist is the most extreme case in the corpus: the **highest per-repo documentation quality and the lowest repo-publication rate**. 60 winners across three editions → 9 public repos → 1 now 404.

| Repo | Project | Placement | Edition | Lang | ★ | KB | RM w | Arch w | Heads | MMD | Imgs | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| [vzakharchenko/Forge-Secure-Notes-for-Jira](https://github.com/vzakharchenko/Forge-Secure-Notes-for-Jira) | Secure Notes for Jira | **1st Place** | Codegeist 2025 (Williams Racing Ed.) | TypeScript | 9 | 5,969 | **5,197** | **1,699** | 39 | 0 | 14 | **the corpus maximum on both counts.** 14 badges incl. SonarCloud coverage + quality gate, Snyk, DeepScan, REUSE, 4 LoC badges. Ships `diagram.drawio`. |
| [Manoranjanmaharana1/SherlockSync](https://github.com/Manoranjanmaharana1/SherlockSync) | Sherlock Sync | **2nd Place** | Codegeist 2025 | JavaScript | 1 | 197 | 603 | **0** | 18 | 0 | 3 | |
| [samalpartha/incident-war-room](https://github.com/samalpartha/incident-war-room) | Rovo Autonomous Team Orchestrator | Bonus: Best App built using Rovo Dev | Codegeist 2025 | HTML | 1 | 2,228 | 903 | 105 | 19 | **3** | 5 | |
| [pooja-bhavani/DevOps-Commander](https://github.com/pooja-bhavani/DevOps-Commander) | DevOps Commander | Bonus: Best App built using Rovo Dev | Codegeist 2025 | TypeScript | 0 | **64** | 1,313 | 130 | **54** | 0 | 12 | 64 KB of code, 54 headings |
| [capablesoft/codegeist-assets](https://github.com/capablesoft/codegeist-assets) | Capable Images for Confluence | **First Place** | Codegeist 2024 | (none) | 0 | 28,332 | **54** | **0** | **1** | 0 | 0 | a first-place winner with a 54-word, single-heading README |
| [Cloud-Jas/MeetingMiner](https://github.com/Cloud-Jas/MeetingMiner) | Meeting Miner | Bonus Prize \| Responsible AI | Codegeist Unleashed | C# | 2 | 91 | 1,819 | **1,338** | 15 | 0 | 17 | 2nd-highest arch word count in the corpus |
| [Domminique/gen-ai](https://github.com/Domminique/gen-ai) | Scrum Masterika | Bonus Prize \| Responsible AI | Codegeist Unleashed | JavaScript | 2 | 583 | 1,229 | 497 | 12 | 0 | 3 | |
| [kvnal/spothelp](https://github.com/kvnal/spothelp) | SpotHelp | Bonus Prize \| Regional Winner | Codegeist Unleashed | JavaScript | 0 | 300 | **147** | **0** | 4 | 0 | 0 | |
| `bitanath/codegeisthackathon` | Junebug | 2nd Place | Codegeist Unleashed | — | — | — | — | — | — | — | — | **404** |

---

## 5. Empirical section-heading taxonomy

Derived from **all headings, verbatim, in document order**, across the **58** winner READMEs that exist and are non-empty. A repo counts once per canonical category regardless of how many of its headings map to it.

| Rank | Canonical section | Repos | % | Representative verbatim headings observed in the corpus |
|---|---|---|---|---|
| 1 | **Installation / Setup / Getting Started / Prerequisites** | 38/58 | **65%** | `## Quick Start`, `## 🚀 Getting Started`, `### Prerequisites`, `## 🔧 Local quick‑start (5 min)`, `## Setup Instructions`, `## Minimal Path to Awesome`, `## Steps to Run the Code`, `### Development server` |
| 2 | **Features / What it does / Capabilities** | 31/58 | 53% | `## Features`, `## 🛠️ Key Features`, `## Core Features`, `## What it does`, `## ⚙️ Features`, `## ✨ Key Differentiators` |
| 3 | **Data flow / Workflow / How it works / How we built it** | 26/58 | 45% | `## 🔄 Research Flow`, `### Flowchart`, `## How we built it`, `## 🧠 How It Works`, `### Agent Workflow`, `## ▶️ Runbook: end to end`, `## Semantic Kernel Multi-Agent Flow`, `## AgentCreator Pipeline` |
| 4 | **Architecture** | 25/58 | **43%** | `## Architecture`, `## 🏗️ Architecture`, `## 💻 Architecture`, `### Architecture`, `## ⚙️ Architecture`, `### **Technical Architecture**`, `## 🔍 Solution Architecture Benefits`, `## Tech Stack & System Architecture`, `## 🏗️ Development Architecture & Quality`, `## Two-Tier Agent Architecture`, `## High-Level Architecture` |
| 5 | **Overview / Summary / Solution / About** | 24/58 | 41% | `## Overview`, `## Summary`, `## 💡 The Solution: Konveyor`, `## System Overview`, `## 🧠 About the Project`, `### Solution` |
| 6 | **Problem statement / Inspiration / Why** | 20/58 | 34% | `## Inspiration`, `## 🤯 Problem Statement`, `## 🌟 The Problem: Broken Engineer Onboarding`, `### Problem`, `## The Problem Statement`, `### Why ReAct for CodeGenerator?` |
| 7 | **Configuration / Env vars** | 19/58 | 33% | `### Configuration`, `## Environment Variables`, `### Environment Setup`, `### 4) Configure environment`, `### Structure of config.json` |
| 8 | **Tech stack / Technologies** | 18/58 | 31% | `## Tech Stack`, `## Technology Stack`, `### Technologies`, `## Backend Technologies`, `### Libraries Used`, `## Technology Stack Summary` |
| 8 | **Deployment** | 18/58 | 31% | `## ☁️ Deployment`, `## 🌐 Deployment (Azure)`, `## Deployment Flow`, `## Deployment Architecture`, `### Deploy the app to Azure`, `## How To Test and Deploy` |
| 10 | **API / Endpoints** | 17/58 | 29% | `## API Usage`, `## API Documentation`, `### Serverless Endpoints`, `### Health Check`, `## Interaction Modes`, `### Mode 1: Text Chat (REST API)` |
| 10 | **Project structure / Repo map** | 17/58 | 29% | `## Project Structure`, `## Repository Structure`, `## Monorepo Structure`, `## 📂 Repo map`, `### Module Structure`, `### Component Structure` |
| 10 | **License** | 17/58 | 29% | `## License`, `## 📄 License & Security` |
| 10 | **Testing / CI** | 17/58 | 29% | `## Testing`, `## ✅ Tests & CI`, `### CI/CD Pipeline`, `## Testing Checklist`, `### Code Quality Tools` |
| 14 | **Future work / Roadmap / Limitations** | 14/58 | 24% | `## 🔮 Future Enhancements`, `## Future Directions`, `## 📌 Future Scope`, `## Current Limtations:` *(sic)*, `## Next Steps`, `### Planned 📋` |
| 14 | **Security / Responsible AI** | 14/58 | 24% | `## Security`, `## Security Architecture`, `## Security Considerations`, `### Security Design`, `## Responsible AI Components in RiskWise`, `### 🔒 Logging & Privacy`, `### Code Interpreter Sandbox` |
| 16 | **Components / Modules / Agents** | 13/58 | 22% | `## Core Components`, `## System Components`, `### Agent Layer`, `### Manager Layer`, `### Plugin Layer`, `## Agent Capabilities`, `### 🧠 Meet Your Finance Agents`, `### Tier 1: Voice Agent (Nova Sonic)` |
| 16 | **Demo / Video / Screenshots** | 13/58 | 22% | `## Demo`, `## Video Demo`, `### Project Video`, `### Samples`, `## 🎥 Demo`, `# See the app in action here:`, `# Demo Script (5 minutes)` |
| 18 | **Contributing** | 12/58 | 21% | `## Contributing`, `## 🤝 Contributing` |
| 19 | **Impact / Business value / Differentiation** | 9/58 | 16% | `## Business Impact`, `## 🚀 The Impact`, `## 🌐 Why Konveyor is Different`, `## Benefits of Two-Tier Architecture`, `## Who Is It For?` |
| 19 | **Team / Author / Contact** | 9/58 | 16% | `## 👥 Team`, `### Author`, `## 💬 Contact`, `## Team Roles & Responsibilities (4 Hours)`, `## 💬 Support` |
| 21 | **Troubleshooting / FAQ** | 7/58 | 12% | `## Troubleshooting`, `## 🙋 FAQ` |
| 22 | **Design decisions / Tradeoffs** | 6/58 | **10%** | `## 💡 Challenges & Design Decisions`, `## Key Design Decisions`, `## Design Principles`, `### Optimization Strategies` |
| 22 | **Acknowledgements / References** | 6/58 | 10% | `## Acknowledgments`, `## 📚 References`, `## Document History` |
| 22 | **Metrics / Evaluation** | 6/58 | 10% | `## Safety Assessment Metrics`, `## Performance Considerations`, `### AgentCreator Pipeline Latency`, `## Monitoring & Observability` |
| 25 | **Usage** | 5/58 | 9% | `## Usage`, `## 📝 Usage Guide` |
| 26 | **Award / Hackathon alignment / Judging** | 3/58 | 5% | `## 🏆 Award`, `## 🏆 Hackathon Alignment`, `## 📝 Judging checklist`, `## Hackathon Project` |
| 26 | **Table of contents** | 3/58 | 5% | `## Table of Content` *(sic)*, `## Table of Contents`, `## 📖 Quick Navigation` |
| 26 | **Version history / Changelog** | 3/58 | 5% | `## Version history`, `## Superseded by Microsoft.Graph.Core 3.0.1` |

### 5a. The literal most-repeated headings (emoji and punctuation stripped, exact string match, ≥3 repos)

This is the raw form of the taxonomy — no canonicalisation, just how many repos use the identical heading text.

| Count | Verbatim heading |
|---|---|
| 22 | `Prerequisites` |
| 16 | `License` |
| **14** | **`Architecture`** |
| 12 | `Project Structure` |
| 11 | `Installation` |
| 11 | `Features` |
| 10 | `Overview` |
| 10 | `Getting Started` |
| 10 | `Contributing` |
| 8 | `Quick Start` |
| 7 | `Key Features` · `Configuration` · `Inspiration` · `Testing` · `Support` |
| 6 | `Technology Stack` · `Troubleshooting` |
| 5 | `Deployment` · `Tech Stack` · `Acknowledgments` · `What it does` · `Requirements` |
| 4 | `How we built it` · `Technical Architecture` · `System Architecture` · `Environment Variables` |
| 3 | `Security Best Practices` · `Setup` · `Frontend` · `Backend` · `Components` · `Development` · `Demo` · `API Endpoints` · `API Reference` · `Development Guidelines` · `Notes` · **`Challenges we ran into`** |

`Architecture` / `Technical Architecture` / `System Architecture` together account for 22 headings.

**A distinct sub-genre: the README that is a copy of the Devpost submission form.** Devpost's fixed prompts — `Inspiration`, `What it does`, `How we built it`, `Challenges we ran into`, `Accomplishments that we're proud of`, `What we learned`, `What's next` — appear as literal headings in the corpus (5, 4, 4, 3, 2, 2, 2 repos respectively). **5 of 58 repos (9%) use three or more of them**, and two (`Domminique/gen-ai`, Codegeist Unleashed Responsible-AI winner; `yuviji/barter`, MCP-AWS Top 5 Overall) use **all seven**. In those repos the README *is* the pitch, verbatim. `Challenges we ran into` is the only place in the entire corpus where a narrative of technical difficulty is a named section — and it comes from the submission form, not from the engineers.

### 5b. Which section comes FIRST after the title

| First body section | Repos |
|---|---|
| Overview / Summary / Solution | 10 |
| Problem statement / Inspiration | 8 |
| Features / What it does | 6 |
| Installation / Setup | 5 |
| Table of contents | 3 |
| Project structure / Repo map | 3 |
| Demo / Video | 2 |
| Everything else (one each): Impact, Award, `Project Goal`, `Steps to Run the Code`, Version history, `License`, `Development server`, `📖 Quick Navigation`, `1. Relationship between the disabled and depression`, `a. Sign-in / Sign-up` | 10 |

**No README in the corpus opens with an Architecture heading.** Where an architecture heading exists, its position among body sections in the Microsoft cohort is 2, 2, 3, 3, 3, 3, 4, 5, 7, 8 — **median position 3**. It is consistently the third thing a reader meets, after a product description and a feature list.

---

## 6. Quantified findings

Base: **74 claimed → 69 alive → 58 with a non-empty README.** Percentages are over the 58 unless stated.

1. **11 of 69 live winner repos (16%) have no usable README** — 10 have no README file at all, and `Prasanna721/ai-incident-agents` ("Best Use of MongoDB") has a `README.md` that is **0 bytes**. A 12th, `rajashekarcs2023/secureAI` ("Best use of Wiz"), has a **2-word** README. The affected placements include **"Best Use of AWS"** (`noteldar/truckerbuddy`, 10 KB total), **"Best Use of Clarifai"** (`jishnu28/aws-hackloft-sfo`, 20,860 KB of code, no README anywhere in the tree), **"Top 5 Overall Teams"** (`michaelwaves/steve`), and Microsoft's **"Best AI-powered solution"** (`kunj-sangani/TestYourKnowledgeBot`).
2. **The no-README rate is event-specific, not universal.** AWS MCP Agents Hackathon: **6 of 11 winners (55%) have no README.** MCP-AWS Enterprise Agents Challenge: 3 of 11 no README + 1 empty + 1 two-word = **5 of 11 (45%) effectively undocumented.** Microsoft AI Agents Hackathon 2025: **0 of 13 live repos.** Atlassian Codegeist: **0 of 8.** Same year, same kind of judging panel — the difference is that the two AWS in-person one-day events produced almost no documentation, while the multi-week online events produced some.
2b. **5 of 58 winner READMEs (9%) are unmodified generator scaffolds** — the team never edited the file the tool wrote:
   - `Umar-Turdiev/AuditArc` (AWS Agentic AI, "AWS Credits and More!") — *"This project was generated with Angular CLI version 18.2.21. Run `ng serve` for a dev server."*
   - `Mistobaan/2025-oct-10-aws-hackaton` (ShopSentry, organizer-listed winner) — *"This is a Next.js project bootstrapped with `create-next-app`."*
   - `ljoukov/voice-root` (AWS MCP Agents, Best Use of MiniMax Audio) — *"Everything you need to build a Svelte project, powered by `sv`."*
   - `sammydick22/invento-flow-ai` (MCP-AWS Enterprise, Best Use of NLX/Snowflake/Temporal) — the default **Lovable** project README: *"URL: https://lovable.dev/projects/e4e80561-…"*
   - `kvnal/spothelp` (Codegeist Unleashed, Bonus Prize | Regional Winner) — titled **`# Forge Hello World`**: *"This project contains a Forge app written in Javascript that displays `Hello World!` in a Jira service management queue page."* — the unmodified Atlassian Forge template.

   Combined with the 11 no-README, 1 empty-README and 1 two-word-README repos, **17 of 69 live winner repos (25%) contain no human-written project documentation at all.**

2c. **The only public repo from Codegeist 2024's First Place is not source code.** `capablesoft/codegeist-assets`, 28,332 KB, entire README: *"This repository serves as an image asset library for our Codegeist project. Since DevPost supports images within text but does not offer direct upload capabilities, we use this repo to store and manage our visual assets."*

3. **5 of 74 claimed winner repos (7%) are HTTP 404 today**, plus 2 more that Devpost links but which never resolved (`chinesepowered/aws-secure-agent`, `yigitkonur/commitdna`), plus the deleted original of the AWS 1st-place overall winner (`ajitonelsonn/EcoLafaek`). In every case the **owner account still resolves 200** — these are deliberate deletions/privatisations. Casualties include a 2nd-place, a 3rd-place-equivalent, and a category winner.
4. **25 of 58 READMEs (43%) contain a heading matching `architecture`.** The other 33 do not.
5. **Median architecture-section length is 43.5 words; mean is 186.** **22 of 58 (38%) have exactly 0 words** of architecture content. The distribution is extremely long-tailed. Top 8 by architecture words: `vzakharchenko/Forge-Secure-Notes-for-Jira` **1,699** (Codegeist 2025 1st), `Cloud-Jas/MeetingMiner` **1,338** (Codegeist Unleashed bonus), `oh-qi-qi/azure-ai-agent-hackathon-2025` **925** (MS Best Overall), `Eduardismund/aws-hackathon-project` **831** (AWS Lambda 2nd), `JasonLKelly/awshackjuly2025` **727** (MCP-AWS sponsor prize), `Domminique/gen-ai` **497** (Codegeist Unleashed bonus), `chandra447/Oratio` **466** (AWS Best Bedrock), `Unknown1502/Compliance-Guardian-AI` **380** (AWS Best Amazon Q). **Three of the top six are Atlassian Codegeist entries**, from the event with the lowest repo-publication rate in the corpus.
5b. **Measuring strictly — words under a heading literally containing "architect" and nothing else — the 25 repos that have one give: median 89 words, mean 161, min 5, max 861.** Full distribution, ascending:

| Words | Repo | Placement |
|---|---|---|
| **5** | `Santhoshkumard11/WorkWizee` | MS Best Copilot Agent |
| **6** | `alexbonella/awslambda-hack-smartclip-ai` | AWS Lambda "Honarable mention" |
| **6** | `hgenix20/modelproof` | MS Best JS/TS Agent |
| **10** | `akashtalole/Drishti-AI-Navigator-App` | AWS Best Nova Act |
| **11** | `martinwangjian/EcoLafaek` | AWS **1st Place overall** |
| 42 | `georgeIshaq/Auto_Security` | 2 sponsor prizes |
| 43 | `tagr/ai-agents-hack` | MS Best Azure AI Agent Service |
| 44 | `pooja-bhavani/DevOps-Commander` | Codegeist 2025 bonus |
| 52 | `persist-os/aws-hackathon` | AWS Best Use of Semgrep |
| 56 | `JasonLKelly/awshackjuly2025` | MCP-AWS 2 sponsor prizes |
| 64 | `headlesz/WordSurf` | AWS MCP Best MiniMax |
| 86 | `samalpartha/incident-war-room` | Codegeist 2025 bonus |
| 89 | `Aditya-Dawadikar/BotTalk` | MCP-AWS Best Tavily |
| 101 | `Crockwell-Solutions/drone-delivery-service` | AWS Lambda **3rd Prize** |
| 114 | `marcosanyo/AgentShell` | AWS Best Strands SDK |
| 148 | `sdamache/konveyor-onboarding-agent` | MS Best Python Agent |
| 153 | `Aristide021/OutScan` | AWS Lambda "Honarable mention" |
| 182 | `Xenixxxxx/bits-to-brain` | MS Best Java Agent |
| 183 | `ai-partners/personal-finance-manager` | MS Honourable Mention |
| 190 | `chandra447/Oratio` | AWS Best Bedrock |
| 192 | `Unknown1502/Compliance-Guardian-AI` | AWS Best Amazon Q |
| 244 | `manasseh-zw/apollo` | MS Best C# Agent |
| 360 | `graceliu396/DeepStudy` | MS Honourable Mention |
| **775** | `Eduardismund/aws-hackathon-project` | AWS Lambda **2nd Prize** |
| **861** | `vzakharchenko/Forge-Secure-Notes-for-Jira` | Codegeist 2025 **1st Place** |

**5 of 25 architecture sections are ≤25 words. 13 of 25 are ≤100 words. Only 3 of 58 repos in the entire corpus have ≥300 words under an explicit architecture heading.** The AWS 1st-place-overall winner's architecture section is **11 words**.

6. **Median README is 627 words** (min 2, max 5,197). Architecture is a small minority of an already short document — median 43.5/627 ≈ **7% of README words**.
7. **Separate architecture documents exist in 8 of 58 (14%)**, and only **1 has a top-level `ARCHITECTURE.md`**. Full inventory:
   - `chandra447/Oratio` → `agent-creator/ARCHITECTURE.md` (**1,219 w**, 1 Mermaid) + `docs/Oratio.drawio.png` + `.kiro/specs/oratio-platform/design.md`
   - `Unknown1502/Compliance-Guardian-AI` → `docs/ARCHITECTURE.md` (997 w, **0 diagrams**) + `diagrams/` (6 PNGs the README never links)
   - `sdamache/konveyor-onboarding-agent` → `docs/architecture.md` (565 w, 1 Mermaid)
   - `AnassKartit/regulaite-hackathon` → `docs/Architecture.md` (328 w) + `docs/architecture.drawio.png`
   - `akashtalole/Drishti-AI-Navigator-App` → `architecture/` dir: `AWS_Architecture_Diagrams.md`, `High-Level System Architecture.png`, `Data Flow & Storage.png`, `Security & IAM.png`, `Browser Automation Architecture.png`, `AWS Services Integration.png`, `.mermaid`, `.svg` — while the README's own architecture section is **11 words**
   - `Aristide021/OutScan` → `diagrams/1-high-level-architecture.mmd`, `2-aws-infrastructure.mmd`, `3-data-flow-sequence.mmd`
   - `marcosanyo/AgentShell` → `docs/agentshell_architecture.drawio.png` + `.png`
   - `vzakharchenko/Forge-Secure-Notes-for-Jira` → `diagram.drawio`
8. **Mermaid is rare: 6 of 58 (10%).** Counts: Oratio 8, Konveyor 3, OutScan 3, incident-war-room 3, ModelProof 1, magi 1. Median across the corpus is **0**. ASCII/box-drawing diagrams are more common than Mermaid: **15 of 58 (26%)**.
9. **Diagram inventory: 23 of 58 (40%) ship a diagram of any kind.** By type — ASCII 15, rendered image (PNG/JPG/SVG) 13, Mermaid 6, drawio (as `.drawio` source or `.drawio.png` export) **5**, `.mmd` standalone files 3, Excalidraw **0**, C4 **0**.
10. **What the diagrams depict** (classified from filename and alt text): component/system layout **~14**, data flow **~6**, sequence **3** (`ModelProof-Sequence-Diagram.png`, `Compliance-Guardian/diagrams/Sequence Diagram.png`, `OutScan/diagrams/3-data-flow-sequence.mmd`), security/IAM **2** (`Drishti/architecture/Security & IAM.png`, `Compliance-Guardian` security section), **explicit deployment topology 1** (`Drishti/architecture/AWS Services Integration.png`). Sequence diagrams — the only artifact that lets a reader follow one request end-to-end — appear in **3 of 58 repos (5%)**.
11. **Depth markers across the 58 READMEs** (regex over the full README; a hit means the topic is *mentioned*, not treated well):

| Depth marker | Repos | % |
|---|---|---|
| security / authz / secrets | 24/58 | 41% |
| deployment instructions or topology | 22/58 | 38% |
| scaling / concurrency | 18/58 | 31% |
| observability / tracing / monitoring | 15/58 | 26% |
| API contract / endpoints | 14/58 | 24% |
| failure handling / retries / fallback | 13/58 | 22% |
| latency / performance numbers | 7/58 | 12% |
| data model / schema | 7/58 | 12% |
| cost | 11/58 | 19% |
| request lifecycle / sequence walkthrough | 6/58 | 10% |
| state / persistence design | 6/58 | 10% |
| evaluation / accuracy / metrics | 6/58 | 10% |
| **explicit tradeoffs / "why X over Y"** | **5/58** | **9%** |

12. **Zero-hit and near-zero categories across all 58 READMEs** — searched for and found in essentially no winner:

| Searched for | Hits |
|---|---|
| C4 model / container diagram / context diagram | **0/58** |
| ADR / architecture decision record | **0/58** |
| Threat model | **0/58** |
| Idempotency | **0/58** |
| Ablation study | **0/58** |
| Numeric benchmark table (a Markdown table with a latency / p95 / accuracy / precision / recall / throughput column) | **0/58** |
| Explicit test count ("N tests") | **0/58** |
| Excalidraw | **0/58** |
| Coverage percentage | 1/58 |
| A `## Limitations` section | 1/58 |
| Cost per run/request stated | 2/58 — and only one is load-bearing: `Aristide021/OutScan` leads with *"Processing 100,000+ sequences daily at **$0.23 per million** vs **$8,200** HPC costs"* and closes with *"💰 35,000x cost reduction"*. It is an AWS Lambda **"Honarable mention"**, not a prize winner. |
| Live deployed URL on a recognisable PaaS host | 2/58 |
| Retry / backoff | 3/58 |
| Human-in-the-loop / approval gate / dry-run | 3/58 |
| SLO / SLA / uptime target | 4/58 |

13. **The repos are better engineered than they are documented.** Tree-walking the Microsoft cohort: **11/23 contain at least one test file**, but only **3** name a test runner in the README and **0** state a test count. `konveyor-onboarding-agent` ships **35 test files**; its README's only mention of testing is a `### CI/CD Pipeline` heading. **8/23 ship infrastructure-as-code** (`.bicep`+`azure.yaml`+`infra/` in 3, `main.tf` in 2, `Dockerfile`/`docker-compose` in 5) and **6/23 have GitHub Actions workflows**, but only 1 carries a CI badge. The same gap appears in the AWS cohort: `Drishti-AI-Navigator-App` ships nine architecture artifacts in an `architecture/` directory and writes 11 words about architecture in its README; `Compliance-Guardian-AI` ships six diagrams the README never references.
14. **Only 2 of 58 (3%) have a CI badge.** One of them, `vzakharchenko/Forge-Secure-Notes-for-Jira` (Codegeist 2025 1st place), is the corpus's only serious rigor display: 14 badges including SonarCloud **coverage** and **quality gate**, Snyk vulnerabilities, DeepScan grade, REUSE compliance, and four generated lines-of-code badges. Nothing else in 58 repos comes close. 19/58 (33%) have any shields.io badge at all.
15. **The demo video roughly matches architecture as an explanatory device.** 14/58 (24%) link a YouTube/Loom demo; 25/58 have an architecture heading whose median content is 43.5 words. In the Microsoft cohort the two are exactly tied at 10 each.
16. **Setup instructions are the most reliable section (65%) and the most stable convention across 2023→2026.**
17. **Architecture documentation improves with recency in the Microsoft line, and it is the only clear time trend.** Of the **5** 2023 Microsoft winners with a README, **0** have any `architecture` heading (architecture word counts 113, 18, 0, 0, 0; median 0). Of the **13** 2025 Microsoft AI-Agents winners with a README, **8 do (62%)**. Mermaid does not follow the trend — `magi`, 3rd place with a 148-word README, already used it in March 2023.
18. **Placement predicts *some* documentation, not deep documentation.** Microsoft cohort split, 16 placed/category winners vs 7 honourable mentions:

| | Placed winners (n=16) | Honourable mentions (n=7) |
|---|---|---|
| Median README words | **731** (148–1,695) | **484** (189–696) |
| Median architecture words | **48** (0–925) | **0** (0–360) |
| Median heading count | **15.5** (9–43) | **10** (2–12) |
| Has an architecture heading | 8/16 = 50% | 2/7 = 29% |

Across the whole corpus the relationship is weaker still: a Codegeist **First Place** has a 54-word single-heading README; an AWS Lambda **"Honarable mention"** ships three standalone Mermaid diagram files.

18b. **Repository size does not predict architecture documentation; stars weakly do.** Over the 58 READMEs, Spearman ρ(`diskUsage` KB, architecture words) = **0.12** — essentially no relationship. `0xMuluh/sonique` is 240,590 KB with 0 architecture words; `Cloud-Jas/MeetingMiner` is 91 KB with 1,338. Spearman ρ(stars, architecture words) = **0.36** — a weak positive relationship, consistent with documentation driving stars rather than the reverse (the two most-starred repos in the corpus, `manasseh-zw/apollo` at 101★ and `oh-qi-qi/azure-ai-agent-hackathon-2025` at 32★, rank 9th and 3rd on architecture words). The top of the architecture-words table is not the top of the stars table: #1 `vzakharchenko/Forge-Secure-Notes-for-Jira` has 9★, #2 `Cloud-Jas/MeetingMiner` has 2★, #5 `JasonLKelly/awshackjuly2025` has **0★**.

19. **Per-event summary** (median over that event's READMEs):

| Event | Claimed | 404 | No README | READMEs | Med RM words | Med arch words | Has arch heading | Uses Mermaid |
|---|---|---|---|---|---|---|---|---|
| Microsoft AI Agents Hackathon 2025 | 16 | 3 | 0 | 13 | 613 | 124 | 8/13 | 2 |
| Microsoft Hack Together: Graph + .NET (2023) | 4 | 1 | 0 | 3 | 412 | 18 | 0/3 | 1 |
| Microsoft HackTogether: Teams (2023) | 4 | 1 | 1 | 2 | 847 | 0 | 0/2 | 0 |
| Microsoft Imagine Cup (self-reported) | 2 | 0 | 0 | 2 | 833 | 15 | 0/2 | 0 |
| AWS AI Agent Global Hackathon | 5 | 0 | 0 | 5 | 1,365 | 342 | **5/5** | 1 |
| AWS Agentic AI Hackathon (1-day, SF) | 6 | 0 | 1 | 5 | 599 | 0 | 1/5 | 0 |
| AWS Lambda Hackathon | 4 | 0 | 0 | 4 | 1,306 | 172 | **4/4** | 1 |
| AWS MCP Agents Hackathon (1-day, SF) | 11 | 0 | **6** | 5 | 391 | 0 | 1/5 | 0 |
| MCP-AWS Enterprise Agents Challenge | 11 | 0 | **3** | 8 | 379 | 0 | 2/8 | 0 |
| MCP AI Agents @ AWS Builder Loft (1-day) | 2 | 0 | 0 | 2 | 520 | 48 | 1/2 | 0 |
| AWS Game Builder Challenge | 1 | 0 | 0 | 1 | 534 | 0 | 0/1 | 0 |
| Atlassian Codegeist 2024 | 1 | 0 | 0 | 1 | 54 | 0 | 0/1 | 0 |
| Atlassian Codegeist 2025 | 4 | 0 | 0 | 4 | 1,108 | 118 | 3/4 | 1 |
| Atlassian Codegeist Unleashed | 4 | 1 | 0 | 3 | 1,229 | 497 | 0/3 | 0 |

The strongest single predictor in this table is **event format**: multi-week online hackathons (AWS AI Agent Global, AWS Lambda, Microsoft 2025, Codegeist) produce 4/4–5/5 architecture-heading rates and median README ≥ 600 words; **one-day in-person hackathons** (AWS Agentic AI, AWS MCP Agents, MCP-AWS Enterprise, AWS Builder Loft) produce 1/5, 1/5, 2/8, 1/2 and median READMEs of 379–599 words with a median of **0 architecture words**.

20. **README opening line.** In the Microsoft cohort: 12 lead with "X is a …" product description, 6 lead with the problem, 2 with a demo/pitch, 3 with repo housekeeping. Nobody leads with architecture. Verbatim first two sentences of the most distinctive:
    - **RiskWise** (Best Overall, MS 2025) — *"RiskWise is a proof-of-concept Agentic AI application built for today's volatile global landscape, designed to support expeditors with near real-time, explainable market and risk intelligence across global supply chains. Instead of replacing human decision-makers, RiskWise acts as an intelligent assistant."*
    - **Konveyor** (Best Python, MS 2025) — *"A lone engineer stands at the mouth of a shadowy codebase, torch flickering. By their side floats Konveyor—a spectral AI guide, whispering ancient commit lore, sketching system blueprints mid-air, and illuminating architectural runes hidden in legacy stone."*
    - **DeepStudy** (HM, MS 2025) — *"251 million. That's the staggering number of children and youth currently out of school worldwide (UNESCO)."*
    - **RegulAIte** (HM, MS 2025) — *"Fast pitch for judges: Drag-and-drop a regulation PDF, click Scan, and get a color-coded risk heat-map in 60 seconds. Powered by GPT-4.1 (RAG-backed) + Azure AI Search."*
    - **TARIFFED!** (Best Azure AI Agent Service) — opens with a **blockquote of the U.S. International Trade Commission's definition of the Harmonized Tariff Schedule**: domain context before any product claim.
    - **Secure Notes for Jira** (Codegeist 2025 1st) — opens with **14 CI/quality badges**, then: *"Share sensitive information securely within Jira issues. Create one-time, expiring encrypted notes with out-of-band key exchange."*
    - **Magic Note** (1st, Graph+.NET 2023) — *"THIS PROJECT HAS BEEN REDEVELOPED FOR PRODUCTION USE AND IT'S AVAILABLE ON MICROSOFT STORE."*
    - **Guest user overview** (Best productivity, Teams 2023) — opens with a **licensing caveat**: *"Beware this use the Azure Active Directory reporting API, if you have an Office 365 E3/E5 you do not have this license…"*
21. **The house style is emoji headings.** 25 of 58 READMEs (43%) use at least one emoji in a heading; **314 of 1,132 headings across the corpus (28%) carry an emoji**. Of the **39 distinct architecture headings** in the corpus, **17 carry an emoji and 11 of those are specifically 🏗️** — `## 🏗️ Architecture`, `## 🏗️ System Architecture`, `## 🏗️ Technical Architecture`, `## 🏗️ Architecture & Tech Stack`, `## 🏗️ Development Architecture & Quality`, `## 🏗 Architecture`. The hard-hat emoji is the single most reliable lexical marker of an architecture section in hackathon-winner READMEs.

22. **The word "architect*" appears at all in only 12 of the 23 Microsoft READMEs; in 5 of those 12 it appears exactly once** — as the heading and nowhere else in the body. Only two Microsoft repos use it more than four times (`apollo`: 10, `konveyor-onboarding-agent`: 8).

---

## 7. What an "Architecture" section actually contains — verbatim samples

The heading count (43%) overstates the content. Reproduced verbatim, these are **entire** architecture sections:

**`Santhoshkumard11/WorkWizee` — Microsoft Best Copilot Agent — complete `## Architecture` section:**
```
<img src="./images/architecture.png" alt="Logo" width="700" height="350">
```
One image tag. Nothing else.

**`tagr/ai-agents-hack` — Best Use of Azure AI Agent Service — complete `### Architecture` section:** three images with one-line italic captions, e.g. *"Figure 2. Overall system diagram with agents and .NET Aspire Blazor web application"*. Zero body prose.

**`georgeIshaq/Auto_Security` — AWS Builder Loft sponsor-prize winner — complete `## Architecture` section:**
```
- **Backend**: Flask API (`app.py`) with GitHub integration using PyGithub
- **Frontend**: Next.js application with TypeScript and Tailwind CSS
- **API Endpoints**:
  - `GET /health` - Health check
  - `GET /api/repositories` - List GitHub repositories
  - `GET /api/repositories/<owner>/<repo>` - Get repository details
```
A tech-stack list labelled "Architecture" — **the single most common pattern in the corpus**.

**`manasseh-zw/apollo` — Microsoft Best C# Agent — `## 🏗️ Architecture`** is one image plus a nested bullet list of Backend / Frontend / Deployment technologies. Apollo does however carry `## 💡 Challenges & Design Decisions`, one of only 6 tradeoff sections in 58 repos, reproduced in full:
> - **Agent Communication:** Implemented a state machine to pass information outside of chat history context window, preventing rate limiting and enabling better context management.
> - **Vector Search:** Utilized Kernel Memory's struct RAG search client which is optimized for retrieving memory-wide context needed for agentic workflows.
> - **Processing Strategy:** Implemented asynchronous queues for ingestion to prevent blocking while processing multiple search queries.
> - **Synthesis Strategy:** Developed a two-stage synthesis for better control over structure and source attribution, where Kernel Memory handles section-specific content and a large context LLM produces the final report.

Four bullets, ~110 words.

**`hgenix20/modelproof` — Microsoft Best JS/TS Agent — one of only three request-lifecycle artifacts.** 43 words of prose plus a Mermaid `sequenceDiagram` with 9 named participants (`ChatWindow.tsx`, `AuditPanel.tsx`, `Agent Coordinator`, `RiskAuditorAgent`, `CrossModelRAGAgent`, three named models, `Azure AI Inference Client`) and 13 numbered messages.

**`Aristide021/OutScan` — AWS Lambda "Honarable mention" — the corpus's best-structured diagram set.** Three standalone `.mmd` files rather than inline blocks: `1-high-level-architecture.mmd`, `2-aws-infrastructure.mmd`, `3-data-flow-sequence.mmd`. The third is a `sequenceDiagram` with 12 participants including `Step Functions`, `Lambda (Bedrock)`, `DynamoDB`, `SNS`, and 8+ numbered messages annotated with `Note over` blocks.

**`highheat4/Self-Healing-Cloud` — AWS Agentic AI Hackathon winner — has no README, and instead ships a 46,737-byte `PLAN.md`** whose headings are `## Architecture` → `## Team Roles & Responsibilities (4 Hours)` → `## Monorepo Structure` → `## Hour-by-Hour Implementation Plan` (`### Hour 1: Foundation Setup`, `### Hour 2: Backend Implementation`, `### Hour 3: Frontend Implementation`, `### Hour 4: Integration & Testing`) → `# Demo Script (5 minutes)` → `## Testing Checklist`. This is a **build plan for the team**, not documentation for a reader — an artifact class that does not appear anywhere else in the corpus, and it displaced the README entirely.

### The three deepest documents in 58 repos

1. **`chandra447/Oratio/agent-creator/ARCHITECTURE.md` — 1,219 words** (AWS Best Amazon Bedrock Application). Headings in order: `System Overview` → `High-Level Architecture` → `AgentCreator Pipeline` (`Pipeline Stages`, `DSPy Module Selection`, **`Why ReAct for CodeGenerator?`**, `MCP Integration`, `Example ReAct Flow`, `Pipeline Output`) → `Two-Tier Agent Architecture` (`Architecture Diagram`, `Tier 1: Voice Agent (Nova Sonic)`, `Tier 2: Business Logic Agent (Generated from SOP)`, `Benefits of Two-Tier Architecture`) → `Interaction Modes` (`Mode 1: Text Chat (REST API)`, `Mode 2: Voice Chat (WebSocket + Nova Sonic)`) → **`Data Model` / `DynamoDB Tables`** → `Deployment Flow` → **`Key Design Decisions`** (5 numbered) → **`Performance Considerations` / `AgentCreator Pipeline Latency` / `Optimization Strategies`** → `Security Considerations` (`Code Interpreter Sandbox`, `Input Validation`, `API Key Management`) → `Next Steps` (`Completed ✅` / `In Progress 🔄` / `Planned 📋`) → `References` → `Document History`. **This is the only artifact in the corpus that covers data model, design rationale, latency and security in one place.** The repo also contains `.kiro/specs/oratio-platform/design.md` — a spec-driven-development artifact from an AI coding tool, not hand-written docs.
2. **`vzakharchenko/Forge-Secure-Notes-for-Jira` README — 5,197 words, 1,699 of them architecture** (Codegeist 2025 1st Place). Heading path: `## 🧠 About the Project` → `### Inspiration` → `### 🔒 Security Features` → `### 🖥 UI Features` → `## 🛠 Technical Implementation` → `### Architecture` → `### Jira Service Management Portal Integration` → `### Forge Permissions & Scopes` → **`### Security Design`** → `### 🔒 Logging & Privacy` → `## 🚀 Getting Started` → `## 📝 Usage Guide` → **`## 🏗️ Development Architecture & Quality`** → `### Component Structure` → **`### Frontend-Backend Contract`** → **`### Dependency Injection (DI)`** → `### Code Quality Tools`.
3. **`Unknown1502/Compliance-Guardian-AI/docs/ARCHITECTURE.md` — 997 words, 0 inline diagrams** (AWS Best Amazon Q Application). `System Overview` → `Architecture Diagram` *(a heading with no diagram under it)* → `Core Components` (`1. API Gateway Layer`, `2. Compute Layer (AWS Lambda)` with six named Lambdas, `3. AI/ML Layer (Amazon Bedrock)`, `4. Storage Layer` incl. `4.1 DynamoDB Tables`) → `Data Flow` → `Scan Request Flow` → `Security Architecture` → `Scalability` → `Monitoring & Observability` → `Deployment Architecture` → `Performance Optimization` (`Caching Strategy`, `Cold Start Mitigation`) → `Disaster Recovery` → `Technology Stack Summary` → `Design Principles` → `Future Enhancements` → `References`.

Runner-up: `sdamache/konveyor-onboarding-agent/docs/architecture.md`, 565 words, numbered: `1. Overview` → `2. High-Level Architecture` → `3. Module Descriptions` (3.1–3.7) → `4. Data Flow` → `5. Deployment & Infrastructure` → `6. Security` → `7. Future Enhancements`.

---

## 8. GitHub, GitLab, Slack, Cloudflare, Vercel, Twilio, Notion, Zoom, Stripe — a second, contrasting cohort

A separate sweep of these platforms produced **51 further verified winner repos across 8 events**, all organizer-confirmed (github.blog posts, `slack.devpost.com` project pages, DEV.to winner announcements). This cohort is a useful control: it is the *same kind of event* run by the *same kind of company*, but the projects are general developer tools and games rather than AI agents.

### 8a. Platforms that yielded ZERO public winner repos (negative results)

| Platform | Finding |
|---|---|
| **Vercel** | Full `vercel.com` sitemap enumerated (6,403 URLs). `/blog/hackathon-winners` (2019) is the **only** winners post on the entire domain and it links no repositories. Vercel/v0 appear only as prize sponsors in third-party events. **0 repos.** |
| **Zoom** | No Zoom-hosted Devpost event; `zoomapps.devpost.com` 404s. Devpost has **no Zoom technology tag at all** (`/software/built-with/zoom*` 404s, against a 200 control on `built-with/slack`). **0 repos.** |
| **Stripe** | No `stripe*.devpost.com`. `/software/built-with/stripe` exists but contains dependency-users inside other organisers' events, with zero winner ribbons. No Stripe-run developer competition with a public winners list was located. **0 repos.** |
| **GitLab** | **Zero on GitHub by design.** The GitLab AI Hackathon mandates that submission repos live at `gitlab.com/gitlab-ai-hackathon/participants/<id>`. All 19 winners were checked; every one resolves to gitlab.com, none to GitHub. Corroborated across 3 GitLab events (56 winners; 1 incidental GitHub mirror). **0 GitHub repos — this is a policy artifact, not an absence of work.** |
| **"GitHub Copilot Hackathon"** | **No judged competition exists.** Every repo matching the name (`microsoft/CopilotHackathon` and its clones, `microsoft/github-copilot-advanced-hackathon`, `microsoft/Vancouver-Web-Summit-2026-GitHub-Copilot-SDK-Hackathon`) is organizer training material, not a winner submission. `githubcopilot.devpost.com` and `githubuniverse.devpost.com` both 404. GitHub's actual competitive events are **For the Love of Code** and **Game Off**. |
| **Twilio Segment "DataPalooza"** | Gallery carries **no winner badges** and no winners were ever announced. Six candidate repos were dropped: they are submissions, not winners. |

### 8b. Per-repo results — developer-platform cohort (42 repos, all alive, all with a README)

| Event | Repos | No README | Med README words | Med arch words | Has arch heading | Mermaid |
|---|---|---|---|---|---|---|
| **GitHub: For the Love of Code 2025** | 18 | 0 | 720 | **0** | **3/18** | 0 |
| **Twilio × DEV Hackathon 2020** | 11 | 0 | 356 | **0** | **0/11** | 0 |
| **Twilio Challenge 2024 (DEV)** | 4 | 0 | **90** | **0** | 1/4 | 0 |
| **Slack: Digital HQ Slackathon** | 3 | 0 | 617 | **0** | **0/3** | 0 |
| **Slack Agent Builder Challenge** | 1 | 0 | 1,202 | 221 | 0/1 | 0 |
| **Cloudflare AI Challenge (DEV)** | 2 | 0 | 325 | **0** | **0/2** | 0 |
| **Notion MCP Challenge (DEV)** | 3 | 0 | **1,624** | **209** | **2/3** | 0 |

**GitHub — For the Love of Code 2025** (evidence: `https://github.blog/open-source/from-karaoke-terminals-to-ai-resumes-the-winners-of-githubs-for-the-love-of-code-challenge/`, "top three entries from each category"):

| Repo | Category winner | ★ | KB | RM w | Arch w | Heads | ASCII | Imgs |
|---|---|---|---|---|---|---|---|---|
| [cpstroum/flight-tracker-bluefruit](https://github.com/cpstroum/flight-tracker-bluefruit) | Buttons, beeps & blinkenlights | 8 | 2,237 | 324 | 0 | 5 | 0 | 2 |
| [ozh/cadrephoto](https://github.com/ozh/cadrephoto) | Buttons, beeps & blinkenlights | 21 | 503 | 708 | 0 | 8 | 0 | 5 |
| [SUNSET-Sejong-University/BuildIn](https://github.com/SUNSET-Sejong-University/BuildIn) | Buttons, beeps & blinkenlights | 0 | 2,988 | 377 | 0 | 11 | 0 | 2 |
| [Critlist/restoHack](https://github.com/Critlist/restoHack) | Terminal talent | 54 | 1,878 | 747 | 0 | 17 | 0 | 2 |
| [FedeCarollo/jukebox-cli](https://github.com/FedeCarollo/jukebox-cli) | Terminal talent | **227** | 33,527 | 733 | 90 | 29 | 2 | 1 |
| [heza-ru/Tuneminal](https://github.com/heza-ru/Tuneminal) | Terminal talent | 13 | 38,726 | 979 | 0 | 47 | 2 | 10 |
| [heza-ru/Netstalgia](https://github.com/heza-ru/Netstalgia) | World wide wonders | 14 | 13,679 | **1,988** | 332 | **64** | 1 | 7 |
| [Awesome-XV/Bionic-Reader](https://github.com/Awesome-XV/Bionic-Reader) | World wide wonders | 29 | 1,923 | 1,101 | 0 | 29 | 0 | 2 |
| [rawrnuck/thegitroastshow](https://github.com/rawrnuck/thegitroastshow) | World wide wonders | 7 | 26,910 | 348 | 0 | 12 | 1 | 0 |
| [shirsakm/nightlio](https://github.com/shirsakm/nightlio) | World wide wonders (added 4th) | **241** | 18,477 | 1,036 | 0 | 15 | 0 | 8 |
| [omkardongre/medi-vision-assistant-ai](https://github.com/omkardongre/medi-vision-assistant-ai) | Agents of change | 4 | 367 | 1,065 | 144 | 36 | 0 | 10 |
| [katawiecz/quiviva](https://github.com/katawiecz/quiviva) | Agents of change | 18 | 109,592 | 1,191 | 0 | 24 | 1 | 7 |
| [FedeCarollo/ai_dventure](https://github.com/FedeCarollo/ai_dventure) | Game on | 9 | 88 | 432 | 0 | 11 | 0 | 1 |
| [sandra-aliaga/beatbugging](https://github.com/sandra-aliaga/beatbugging) | Game on | 37 | 27,445 | 464 | 62 | 11 | 0 | 6 |
| [FontesHabana/MuMind](https://github.com/FontesHabana/MuMind) | Game on | 3 | 1,500 | 164 | 0 | 9 | 0 | 2 |
| [chornonoh-vova/gitfrag](https://github.com/chornonoh-vova/gitfrag) | Everything but the kitchen sink | 8 | 107 | **103** | 0 | **1** | 0 | 2 |
| [redhatsam09/code-sensei](https://github.com/redhatsam09/code-sensei) | Everything but the kitchen sink | 9 | 11,096 | 444 | 107 | 10 | 0 | 4 |
| [master-wayne7/reviewer-karma-action](https://github.com/master-wayne7/reviewer-karma-action) | Everything but the kitchen sink | 3 | 35 | 749 | 37 | 32 | 0 | 4 |

`answeryt/Neosgenesis` (also a FTLOC winner) is **HTTP 404**. `cyprieng/github-breakout` (850★) appears in the post as an *illustrative entry*, **not** a category winner, and is deliberately excluded.

**Slack** (evidence: `slack.devpost.com` project pages):

| Repo | Project | Placement | Event | ★ | KB | RM w | Arch w | Heads |
|---|---|---|---|---|---|---|---|---|
| [slindelow/relay-slack-agent](https://github.com/slindelow/relay-slack-agent) | Relay | Second Place \| New Slack Agent | Slack Agent Builder Challenge | 0 | 1,023 | 1,202 | 221 | 19 |
| [Mandryl/daily-scrum-supporter](https://github.com/Mandryl/daily-scrum-supporter) | Daily Scrum Supporter | Third Place | Digital HQ Slackathon | 0 | 308 | 617 | 0 | 19 |
| [anqkhieu/Easy-Image-View](https://github.com/anqkhieu/Easy-Image-View) | Easy Image View | Bonus Prize \| Most Valuable Feedback | Digital HQ Slackathon | 0 | 2,393 | 947 | 209 | 9 |
| [solid-droid/Black-Box](https://github.com/solid-droid/Black-Box) | Black Box | Bonus Prize \| Most Valuable Feedback | Digital HQ Slackathon | 3 | 278 | **146** | 0 | **1** |

`4KInc/firstresponder-slack` and `pyroscope-io/slackbot` (also Slack winners) are **HTTP 404**.

**Cloudflare, Notion, Twilio** (evidence: DEV.to organizer winner posts):

| Repo | Project | Placement | Event | ★ | KB | RM w | Arch w | Heads |
|---|---|---|---|---|---|---|---|---|
| [kaarthik108/di1](https://github.com/kaarthik108/di1) | di1 | **Overall Winner** | Cloudflare AI Challenge | 49 | 3,349 | 392 | **0** | 4 |
| [anselm94/cf-challenge-ai-storycard](https://github.com/anselm94/cf-challenge-ai-storycard) | AI StoryCard | Multiple Models Prize Category Winner | Cloudflare AI Challenge | 15 | 15,782 | 258 | **0** | 7 |
| [georgekobaidze/noterunway](https://github.com/georgekobaidze/noterunway) | NoteRunway | 🏆 **First Place** | Notion MCP Challenge | 12 | 2,529 | **2,429** | 376 | **42** |
| [yashksaini-coder/DevNotion](https://github.com/yashksaini-coder/DevNotion) | DevNotion | 🏅 Runner Up | Notion MCP Challenge | 17 | 2,154 | 1,624 | 113 | 14 |
| [Caposto/notion-mcp-incident-management-assistant](https://github.com/Caposto/notion-mcp-incident-management-assistant) | Notion MCP Incident Mgmt Assistant | 🏅 Runner Up | Notion MCP Challenge | 0 | 402 | 476 | 209 | 10 |
| [codeAdrian/homeBound](https://github.com/codeAdrian/homeBound) | homeBound | **Grand Prize** — COVID-19 Communications | Twilio × DEV 2020 | 9 | 1,991 | 247 | **0** | 6 |
| [Godwin9911/stream-my-pc](https://github.com/Godwin9911/stream-my-pc) | Stream My PC | **Grand Prize** — Engaging Engagements | Twilio × DEV 2020 | 12 | 1,391 | 395 | 25 | 15 |
| [emgoto/trello-twilio](https://github.com/emgoto/trello-twilio) | Trello-Twilio | **Grand Prize** — Interesting Integrations | Twilio × DEV 2020 | 15 | 196 | 352 | **0** | 7 |
| [caseorganic/hypothetitech](https://github.com/caseorganic/hypothetitech) | Hypothetitech | **Grand Prize** — Exciting X-Factors | Twilio × DEV 2020 | 2 | **20** | 565 | **0** | 10 |
| [quarantineaid/quarantineaid-backend](https://github.com/quarantineaid/quarantineaid-backend) | QuarantineAid | Top 10 Runner-Up | Twilio × DEV 2020 | 6 | 1,874 | 655 | 34 | 14 |
| [InventorsDev/covid-hack](https://github.com/InventorsDev/covid-hack) | COVID Hack | Top 10 Runner-Up | Twilio × DEV 2020 | 2 | 2,232 | 249 | 85 | 11 |
| [Suvink/volunteer-me](https://github.com/Suvink/volunteer-me) | Volunteer Me | Top 10 Runner-Up | Twilio × DEV 2020 | 12 | 8,986 | 429 | 44 | 10 |
| [hayleycd/in_case_of_emergency](https://github.com/hayleycd/in_case_of_emergency) | In Case of Emergency | Top 10 Runner-Up | Twilio × DEV 2020 | 1 | 2,674 | **53** | 0 | **1** |
| [mattdini/sms-postcard](https://github.com/mattdini/sms-postcard) | SMS Postcard | Top 10 Runner-Up | Twilio × DEV 2020 | 8 | 222 | 356 | 0 | 9 |
| [MiniCodeMonkey/curbside](https://github.com/MiniCodeMonkey/curbside) | Curbside | Top 10 Runner-Up | Twilio × DEV 2020 | 9 | 2,506 | **136** | 0 | 9 |
| [ryanrousseau/octwilio](https://github.com/ryanrousseau/octwilio) | Octwilio | Top 10 Runner-Up | Twilio × DEV 2020 | 0 | 99 | 627 | 42 | 15 |
| [ashiqsultan/twilio-whatsapp-ai-bot](https://github.com/ashiqsultan/twilio-whatsapp-ai-bot) | Twilio WhatsApp AI Bot | **Overall Prompt Winner** | Twilio Challenge 2024 | 14 | 160 | **100** | 0 | **2** |
| [ansh-saini/recycle-whatsapp-bot](https://github.com/ansh-saini/recycle-whatsapp-bot) | Recycle WhatsApp Bot | Prize Category Winner | Twilio Challenge 2024 | 3 | 34 | **66** | 0 | 3 |
| [mtwn105/xpenser-whatsapp-bot](https://github.com/mtwn105/xpenser-whatsapp-bot) | Xpenser | Prize Category Winner | Twilio Challenge 2024 | 4 | 669 | **79** | 30 | 9 |
| [Magody/DungeonsAndTwilio](https://github.com/Magody/DungeonsAndTwilio) | Dungeons and Twilio | Prize Category Winner | Twilio Challenge 2024 | 1 | 14 | 484 | 0 | 10 |

`julianandreszb/ai-storytelling` (Cloudflare's third category winner) is **HTTP 404**.

### 8c. GitHub Game Off 2025 top-10 — the floor of the whole study

Evidence: `https://github.blog/open-source/gaming/light-waves-rising-tides-and-drifting-ships-game-off-2025-winners/`. Game jams are a different genre and are reported separately, not folded into the main statistics.

| Repo | Rank | ★ | KB | README |
|---|---|---|---|---|
| `Wafflenaut-Games/Evaw` | **#1 overall** | — | — | **HTTP 404** |
| [Nademtis/Where-The-Water-Flows](https://github.com/Nademtis/Where-The-Water-Flows) | #2 | 55 | 17,053 | 133 words, 6 headings |
| [ICD-ICD/BEACON](https://github.com/ICD-ICD/BEACON) | #3 | 43 | 8,552 | **20 words, 0 headings** |
| [shshwdr/wave](https://github.com/shshwdr/wave) | #4 | 23 | 377,953 | **none** |
| [Yolo-Arts/Wave-Drifter](https://github.com/Yolo-Arts/Wave-Drifter) | #5 | 61 | 24,928 | 94 words, 1 heading |
| [Grumelkeks/GO2025-Waves](https://github.com/Grumelkeks/GO2025-Waves) | #6 | 27 | 540,139 | **none** |
| [BaiBaitw/Froggy-Love](https://github.com/BaiBaitw/Froggy-Love) | #7 | 35 | **1,032,520** | **none** |
| [aznoqmous/fish-storm](https://github.com/aznoqmous/fish-storm) | #8 | 43 | 325,529 | **none** |
| [conor-wilson/la-ola](https://github.com/conor-wilson/la-ola) | #9 | 29 | 22,080 | **18 words, 1 heading** |
| [devAdaid/WaveStory](https://github.com/devAdaid/WaveStory) | #10 | 20 | 163,476 | **none** |

**5 of the 9 surviving top-10 Game Off 2025 finishers have no README. The median README among the other 4 is 57 words. Zero have an architecture heading, a diagram, or any depth marker.** `BaiBaitw/Froggy-Love` is 1,032,520 KB (~1 GB) of game assets with no documentation whatsoever. GitHub's own #1 finisher is a 404.

### 8d. Quantified comparison — AI-agent hackathons vs. general developer-platform hackathons

| Metric | Microsoft / AWS / Atlassian (58 READMEs) | GitHub / Slack / Twilio / Cloudflare / Notion (42 READMEs) |
|---|---|---|
| Has an architecture heading | **25/58 = 43%** | **6/42 = 14%** |
| Median README words | 627 | 454 |
| Median architecture words | 43.5 | **0** |
| Uses Mermaid | 6/58 = 10% | **0/42 = 0%** |
| Uses an ASCII diagram | 15/58 = 26% | 7/42 = 17% |
| Explicit tradeoffs / "why X over Y" | 5/58 = 9% | **1/46 = 2%** |
| Request lifecycle / sequence walkthrough | 6/58 = 10% | **0/46 = 0%** |
| Latency / performance numbers | 7/58 = 12% | **0/46 = 0%** |
| API contract / endpoints | 14/58 = 24% | 3/46 = 7% |
| Deployment instructions / topology | 22/58 = 38% | 5/46 = 11% |
| Data model / schema | 7/58 = 12% | 2/46 = 4% |
| Demo video linked | 14/58 = 24% | 5/46 = 11% |
| Has a `## License` section | 17/58 = 29% | 19/46 = 41% |
| C4 / ADR / threat model / idempotency / ablation / benchmark table | **0** on all six | **0** on all six |

(The 46-denominator rows include the 4 Game Off READMEs; the 42-denominator rows are developer-platform only.)

**Architecture documentation is ~3× more common in AI-agent hackathons than in general developer-platform hackathons, and Mermaid is exclusive to the agent cohort.** The two exceptions in the non-agent cohort are themselves agent-shaped: the **Notion MCP Challenge** (2/3 winners have an architecture heading; median README 1,624 words — the highest per-event median in the entire 125-repo study) and the **Slack Agent Builder Challenge**. The moment a hackathon is about an agent or an MCP server, architecture prose appears; when it is about a CLI tool, a Slack app, or a WhatsApp bot, it does not.

Notably, **`gitfrag`, `chornonoh-vova`'s GitHub category winner, has a 103-word README with one heading; `ashiqsultan/twilio-whatsapp-ai-bot`, the Twilio 2024 Overall Prompt Winner, has 100 words and two headings; `hayleycd/in_case_of_emergency`, a Twilio Top-10 Runner-Up, has 53 words and one heading.** Four Twilio 2020 Grand Prize winners — the top award in each of four categories — have **0 architecture words between them**.

---

## 9. What the data says

*(Numbers below are cohort A — Microsoft/AWS/Atlassian, 58 READMEs — unless a cohort is named. Whole-corpus figures: 125 claimed, 120 alive, 104 READMEs, 31/104 with an architecture heading, 6/104 using Mermaid, median README 560 words.)*


- **The bar is a README with setup instructions, and it is not even universally met.** 65% have setup; 43% have an architecture heading; 10% use Mermaid; 14% have a separate architecture document. **25% of live winner repos contain no human-written documentation at all** — no README, an empty README, a two-word README, or an unmodified `create-next-app` / Angular CLI / Svelte / Lovable / Forge-Hello-World scaffold. 0% have an ADR, a threat model, a C4 diagram, an ablation, or a benchmark table.
- **"Architecture" in this corpus overwhelmingly means one image or one tech-stack bullet list.** Under a heading that literally says "architecture", the median is **89 words**; 5 of 25 are ≤25 words; only 3 of 58 repos exceed 300. The AWS 1st-place-overall winner's architecture section is 11 words; Microsoft's Best Copilot Agent's is a single `<img>` tag.
- **Event format predicts documentation more strongly than placement does.** One-day in-person AWS hackathons produced a 45–55% no-README rate and a median of 0 architecture words. Multi-week online events (Microsoft AI Agents, AWS AI Agent Global, AWS Lambda, Codegeist) produced 4/4–5/5 architecture-heading rates. Winning a one-day event requires a working demo, not a document.
- **Depth, where it exists, is concentrated in a handful of `docs/ARCHITECTURE.md`-style files** — 8 repos out of 58 — and most of those come from **sponsor-category** winners rather than grand-prize winners. Grand-prize winners in this corpus span 1,699, 925, 831, 342, 113, 54 and 0 architecture words. There is no consistent grand-prize documentation standard.
- **Artifacts outrun documentation by roughly 2×.** Repos ship test suites, Terraform, Bicep, CI workflows and diagram directories that their READMEs never mention. `Drishti-AI-Navigator-App` has nine architecture artifacts and an 11-word architecture section; `Compliance-Guardian-AI` has six diagrams the README never links.
- **Documentation is not durable.** 7% of organizer-linked winner repos are already 404 with their owner accounts still live, including a 2nd place and the original of a 1st-place-overall winner.
- **A visible sub-genre of winner README is the Devpost submission form pasted into Markdown** — `Inspiration` / `What it does` / `How we built it` / `Challenges we ran into` / `What we learned` / `What's next`. 9% of the corpus uses three or more of these headings; two use all seven. Those READMEs are pitch documents, and they are what won.
- **The absent list is more uniform than the present list.** Across 20 events, three organizers and four years: no cost model, no latency numbers, no data-model documentation (12%, and mostly incidental), no failure taxonomy, no evaluation table, no decision records, no threat models. The three rigor behaviours the current Razorpay Buildathon field is converging on — published precision/recall on held-out ground truth, deterministic-first with LLM-only-on-the-residual, and explicit refusal/escalation — appear in **0 of 58** repos in this corpus.
- **The subject matter of the hackathon predicts architecture documentation better than the organiser does.** Across 104 winner READMEs on three continents of platform vendor, architecture prose tracks *agents and MCP servers*: 43% of AI-agent-hackathon winners have an architecture heading versus 14% of general developer-platform winners, and Mermaid appears in 10% of the former and **0%** of the latter. The two non-agent events that buck the trend — Notion MCP Challenge and Slack Agent Builder Challenge — are themselves agent events. Game jams sit at the floor: **5 of 9 surviving Game Off 2025 top-10 finishers have no README**, and the four that do average 57 words.
- **Whatever the vendor, the top prize does not correlate with documentation.** GitHub's Game Off 2025 #1 is a 404. Twilio's four 2020 Grand Prize winners have 0 architecture words between them. Cloudflare's Overall Winner has 0. Codegeist 2024's First Place published an image-asset repository. The AWS 1st-place overall winner writes 11 words about architecture. Against that, an AWS Lambda *"Honarable mention"* ships three standalone Mermaid diagram files, and a Codegeist bonus-prize winner writes 1,338 words of architecture.
- **One repo behaves completely differently from the other 57.** `vzakharchenko/Forge-Secure-Notes-for-Jira` (Codegeist 2025 1st Place) carries SonarCloud coverage and quality-gate badges, Snyk, DeepScan, REUSE, generated LoC badges, a 1,699-word architecture treatment, an explicit `Frontend-Backend Contract` section and a `Dependency Injection` section. It is a working professional's repo entered into a hackathon, and it is unlike everything else in the corpus.

---

## Appendix A — method and reproducibility

- Repo metadata: `gh repo view {owner}/{name} --json nameWithOwner,stargazerCount,primaryLanguage,pushedAt,diskUsage,description,isArchived`
- README: `gh api repos/{o}/{r}/readme --jq .content` → base64-decode. A non-200 here with a 200 on `gh repo view` is recorded as "alive, no README"; a 200 with 0 bytes is recorded as "empty README".
- File inventory: `gh api repos/{o}/{r}/contents` and `gh api "repos/{o}/{r}/git/trees/HEAD?recursive=1"` filtered on `(?i)architect|design|adr|diagram|\.drawio|\.excalidraw|\.mmd`.
- Headings: `^#{1,4}\s+` outside fenced code blocks, preserving level and order. All verbatim headings quoted in this file were re-grepped against the cached README to confirm they exist.
- Word counts: whitespace-token count after stripping ```` ``` ```` fenced blocks.
- "Architecture section words": words between an architecture-matching heading and the next heading of equal-or-shallower level, summed across matching headings. The matcher deliberately includes `how it works`, `data flow`, `components` and `tech stack` — so it is an **over-count**, and the medians reported are upper bounds.
- Diagram detection: Mermaid = ```` ```mermaid ````; ASCII = fenced non-Mermaid block containing box-drawing characters or ≥2 arrow chains; image = Markdown `![]()` or `<img src>`, then hand-separated into badges vs. screenshots vs. diagrams by filename and alt text.
- Diagram liveness: `curl -sIL` against `raw.githubusercontent.com/{repo}/{default_branch}/{path}`. All 12 architecture-diagram images checked in the Microsoft cohort returned 200.
- Devpost placements: the gallery HTML's `winner-ribbon` element plus the exact prize-label block on each project page; repo URLs taken from each project's "Try it out" links.
- Raw per-repo metrics for all 74 rows (placement, event, evidence URL, all counts, all headings verbatim, depth-marker booleans) are in `corpus_metrics.json` alongside this file. README text caches are under `/tmp/archcorpus/` and are **not** committed; no repository was cloned.
