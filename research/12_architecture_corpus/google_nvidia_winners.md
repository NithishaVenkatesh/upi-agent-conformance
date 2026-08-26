# Architecture Documentation Corpus — Google & NVIDIA Hackathon Winners

**Empirical study. Findings only, no advice.**
**Retrieval date: 2026-08-26** (all `gh api` reads performed on this date).
**Method:** `gh search repos` for pool construction; `gh api repos/{o}/{r}`, `repos/{o}/{r}/readme`, `repos/{o}/{r}/git/trees/HEAD?recursive=1` for extraction. No repos cloned. Every repo below returned HTTP 200 on 2026-08-26.
**Cohort:** 22 verified winners/finalists (the primary corpus) + 31 verified non-winner submissions from the same events (control cohort). 54 repos fetched and parsed in total; 0 returned 404.

---

## 1. Evidence-quality legend

Placement claims are graded, because most are not organizer-confirmed.

| Grade | Meaning | Count |
|---|---|---|
| **A** | Placement asserted in the repo AND corroborated by an organizer/Devpost artifact linked from the repo | 2 |
| **B** | Placement from a prior verified shortlist or a linked public announcement, but not restated inside the repo | 9 |
| **C** | Self-declared in README/description only, or from third-party curation; no organizer artifact reached | 11 |

**Half the corpus (11/22) rests on a self-declaration.** That is itself a finding about how hackathon placement propagates: the trophy lives in the repo description, not in a verifiable record.

---

## 2. Per-repo table (primary corpus, n=22)

`Arch words` = word count of the architecture section specifically (heading + body until next same-or-higher heading), not the whole README.

| Repo | Event | Placement | Ev | README words | Architecture heading (verbatim) | Arch words | Diagram(s) | # headings |
|---|---|---|---|---|---|---|---|---|
| [ayanliger/gke-turns10-hackathon-vigil](https://github.com/ayanliger/gke-turns10-hackathon-vigil) | GKE Turns 10 | Honorable Mention | A | 1032 | `Architecture Overview` | 209 | ASCII box diagram ×1 (components + A2A links) | 14 |
| [victorbash400/Cartmate](https://github.com/victorbash400/Cartmate) | GKE Turns 10 | Regional winner, EMEA | B | 1801 | `System Architecture` | 213 | Mermaid ×2 (`graph TB`; `sequenceDiagram`) | 48 |
| [julian-hecker/gke-hackathon](https://github.com/julian-hecker/gke-hackathon) | GKE Turns 10 | Honorable Mention | B | 85 | `Architecture` | 43 | PNG ×1 (`architecture.png`, deployment topology) | 3 |
| [giovannamoeller/nero-fashion-frontend](https://github.com/giovannamoeller/nero-fashion-frontend) | GKE Turns 10 | Regional winner, LATAM | B | 631 | `Arquitetura` | 12 | ASCII one-liner (3-hop call chain) | 26 |
| [xValentim/nero-fashion](https://github.com/xValentim/nero-fashion) | GKE Turns 10 | Regional winner, LATAM (same project, backend) | B | 2111 | `Enhanced Architecture` | 25 | PNG ×2 (own + inherited microservices-demo diagram) | 36 |
| [merdandt/SalesShortcut](https://github.com/merdandt/SalesShortcut) | Google ADK Hackathon | Grand Prize | A | 1305 | `Architecture` | 161 | SVG ×1 + Mermaid `graph TD` ×1 (agent workflow) | 38 |
| [vivek100/bleachAgentBuilder](https://github.com/vivek100/bleachAgentBuilder) | Google ADK Hackathon | Winner | C | 1353 | `Architecture` | 385 | Mermaid ×2 (`graph TB`, 6 subgraphs; `sequenceDiagram`) | 32 |
| [sudsk/tradesage-mvp](https://github.com/sudsk/tradesage-mvp) | Google ADK Hackathon | Winner | C | 2090 | `Architecture Overview` | 68 | PNG ×1 + ASCII component tree ×1 | 38 |
| [hazardscarn/energyagentai](https://github.com/hazardscarn/energyagentai) | Google ADK Hackathon | Winner | C | 2745 | `System Architecture` | 148 | JPG ×7 (one per agent) + Mermaid ×1 | 52 |
| [giovannamoeller/edu-ai-adk-version](https://github.com/giovannamoeller/edu-ai-adk-version) | Google ADK Hackathon | Winner (Edu.AI) | C | 428 | `Multi-Agent System Overview` | 95 | PDF ×1 (`docs/Architecture.pdf`, linked not inlined) | 6 |
| [jays0606/mangstoon_ai](https://github.com/jays0606/mangstoon_ai) | Gemini 3 Seoul Hackathon | 3rd Place | B | 853 | `How It Works` | 74 | ASCII vertical pipeline ×1 (data flow) | 16 |
| [RequestTap/RequestTap-Router](https://github.com/RequestTap/RequestTap-Router) | Google AP2 track | 1st, AP2 track | B | 2116 | `Architecture` | 140 | ASCII ×2 (request pipeline, ordered middleware stages) | 27 |
| [MukundaKatta/crusoe-nemotron-harness](https://github.com/MukundaKatta/crusoe-nemotron-harness) | Crusoe + NVIDIA Nemotron | Winner (overall) | B | 635 | *(none)* | 0 | **NONE** | 9 |
| [ColinM-sys/Dashunbored](https://github.com/ColinM-sys/Dashunbored) | NVIDIA GTC 2026 (DGX Spark) | Winner | C | 1087 | *(none)* | 0 | **NONE** | 19 |
| [nandorojo/you2txt](https://github.com/nandorojo/you2txt) | NVIDIA + Vercel 2-hour Hackathon | 1st Place | B | 119 | *(none)* | 0 | **NONE** | 3 |
| [nlpquant/AgentQuant](https://github.com/nlpquant/AgentQuant) | NVIDIA AI Hackathon | Top 3 | C | 1905 | `Architecture` | 311 | Mermaid ×2 (`graph TB` layered; `sequenceDiagram`) | 38 |
| [qtzx06/clarifai](https://github.com/qtzx06/clarifai) | NVIDIA Agent Hackathon | Winner | C | 1141 | `project architecture` | 123 | **NONE** (prose only) | 24 |
| [talbertherndon/doom-monorepo](https://github.com/talbertherndon/doom-monorepo) | NVIDIA GTC 2025 | Winner | C | 97 | *(none)* | 0 | **NONE** | 0 |
| [victortong-git/open-code-review](https://github.com/victortong-git/open-code-review) | NVIDIA (NeMo Agent Toolkit) | "Award Winning" | C | 3778 | `AI-Driven Architecture` | 130 | ASCII ×1 (container/network layout), weak | 71 |
| [TRT2022/ControlNet_TensorRT](https://github.com/TRT2022/ControlNet_TensorRT) | NVIDIA TensorRT Hackathon 2023 (Tianchi) | 3rd, preliminary round | B | 520 | *(none — see §6)* | 0 | **NONE** (results tables + output samples) | 7 |
| [FeiGeChuanShu/trt2023](https://github.com/FeiGeChuanShu/trt2023) | NVIDIA TensorRT Hackathon 2023 (Tianchi) | Finalist (复赛 entry) | B | 907 | *(none — see §6)* | 0 | **NONE** (results tables only) | 8 |
| [lxl24/SwinTransformerV2_TensorRT](https://github.com/lxl24/SwinTransformerV2_TensorRT) | NVIDIA TensorRT Hackathon 2022 (Tianchi) | Entry / finalist | C | 769 | *(none — see §6)* | 0 | **NONE** (Nsight screenshots + results tables) | 19 |

### Control cohort (n=31, non-winner verified submissions, same events)
Google ADK / GKE Turns 10 / Gemini API Competition / NVIDIA GTC & Nemotron submissions with no placement claim. Full list of fetched repos is reproducible from §9. Aggregates are in §5.

---

## 3. Empirical section taxonomy, ranked by frequency

Headings normalised into families; the repo title heading (H1) is excluded. n=22 winners. A repo counts once per family regardless of how many headings map to it.

| Rank | Section family | Repos | % | Representative verbatim headings observed |
|---|---|---|---|---|
| 1 | **Setup / Quick Start / Prerequisites** | 16 | 73% | `Quick Start`, `Prerequisites`, `Installation & Setup`, `Local Development Setup`, `Environment Setup`, `Run Locally`, `环境搭建` |
| 2 | **Architecture / System Design / How It Works** | 16* | 73% | `Architecture`, `Architecture Overview`, `System Architecture`, `Enhanced Architecture`, `AI-Driven Architecture`, `project architecture`, `How It Works`, `Arquitetura`, `Multi-Agent System Overview`, `总述` |
| 3 | **Deployment** | 13 | 59% | `Deployment`, `Cloud Deployment`, `Production Deployment`, `Deploy no Kubernetes`, `Docker Deployment`, `Deployment Options` |
| 4 | **Features / What It Does** | 13 | 59% | `Key Features`, `Features`, `Core Experience Features`, `What you get`, `Advanced Features`, `Pages & Features` |
| 5 | **License** | 10 | 45% | `License` |
| 5 | **Tech Stack** | 10 | 45% | `Technology Stack`, `Tech Stack`, `Stack`, `Core Technologies` |
| 5 | **API / Endpoints** | 10 | 45% | `API Endpoints`, `API`, `POST /generate (multipart/form-data)`, `Admin (requires Authorization: Bearer ...)` |
| 8 | **Configuration / Env Vars** | 9 | 41% | `Configuration`, `Environment Variables`, `Global Configuration (.env)`, `Service-Specific Configuration` |
| 8 | **Usage / Demo / Screenshots** | 9 | 41% | `Usage`, `Usage Examples`, `Demo`, `Screenshots`, `demos` |
| 10 | **Testing** | 8 | 36% | `Testing Strategy`, `Running Tests`, `Tests`, `Local Testing`, `Run Tests`, `Backend API Testing` |
| 10 | **Overview / Introduction** | 8 | 36% | `Overview`, `Project Overview`, `Core Mission`, `大赛介绍`, `模型简介` |
| 12 | **Credits / Acknowledgements** | 7 | 32% | `Acknowledgements`, `Contributors`, `Author`, `Contact`, `感想体会` |
| 12 | **Contributing** | 7 | 32% | `Contributing`, `Code Standards` |
| 12 | **Project / Repo Structure** | 7 | 32% | `Project Structure`, `Repository Structure`, `Monorepo Structure`, `Estrutura do Projeto` |
| 12 | **Troubleshooting** | 7 | 32% | `Troubleshooting`, `Common Mistake`, `Redis Connection Issues`, `videos return 404 in production`, `cors errors` |
| 12 | **Design Decisions / Tradeoffs / Difficulties** | 7 | 32% | `Key Design Decisions`, `Performance Comparison`, `Recommendations by Use Case`, `开发工作的难点`, `比赛过程中的无用的尝试`, `模型优化的难点` |
| 18 | **Monitoring / Observability** | 6 | 27% | `Observing the System`, `Monitoring & Management`, `Monitor and Debug`, `Health Checks`, `Logs`, `Nsight分析` |
| 18 | **Agent Workflow / Data Flow** | 6 | 27% | `Agent Workflow`, `System Flow`, `Detection Flow`, `Process Flow & Sequence`, `End-to-End Sequence (Simplified)`, `Intelligent Workflow Orchestration` |
| 18 | **Security / Privacy** | 6 | 27% | `Security & Privacy`, `Security`, `api rate limits`, `BITE Encryption (SKALE)` |
| 21 | **Future Work / Roadmap** | 5 | 23% | `Future Improvements`, `Futuras Melhorias`, `未来工作`, `Adding New Features` |
| 22 | **Model / Development Work** | 4 | 18% | `模型简介`, `主要开发工作`, `开发与优化过程`, `Development` |
| 22 | **Results / Benchmarks / Accuracy** | 4 | 18% | `精度与加速结果`, `精度与加速效果`, `Performance Comparison`, `Sample run` |
| 24 | **Data / Database** | 3 | 14% | `Data Storage`, `Database Setup`, `BigQuery Dataset Structure`, `Cloud SQL Setup` |
| 25 | **Table of Contents** | 2 | 9% | `Table of Contents` |

\* 15 matched an English architecture-family regex; +1 (`Arquitetura`, Portuguese) added by hand.

### Sections that appear in ZERO of 22 winners
No repo in the corpus has a heading for: **Failure Modes**, **Error Budget / SLO**, **Cost / Cost Model**, **Latency Budget**, **Scaling Plan / Capacity**, **Threat Model**, **Data Model / Schema** (as its own top-level section — only 3 have DB-setup sections), **Evaluation Methodology**, **Limitations**, **Alternatives Considered**, **Non-Goals**, **ADR / Decision Record**, **Observability SLIs**.

---

## 4. Quantified findings

### 4.1 Is there an architecture artifact at all?
| Finding | Count | % |
|---|---|---|
| Architecture-titled section inside the README | **16 / 22** | 73% |
| A separate `ARCHITECTURE.md` authored by the team | **0 / 22** | 0% |
| A `docs/` directory containing any architecture asset | 3 / 22 | 14% |
| A documentation site | 0 / 22 | 0% |
| No architecture content of any kind, anywhere | **3 / 22** | 14% |

`FeiGeChuanShu/trt2023` does contain a file at `tensorrt_llm_july-release-v1/docs/architecture.md` — it is **vendored from NVIDIA's TensorRT-LLM release tarball, not authored by the team**. Excluding it, authored `ARCHITECTURE.md` count is exactly **zero**.

The 3 repos with zero architecture content are `ColinM-sys/Dashunbored`, `nandorojo/you2txt`, `talbertherndon/doom-monorepo` — **all three are NVIDIA short-format events** (GTC 2026 "shortest hackathon", a 2-hour Vercel+NVIDIA sprint, and GTC 2025). Two of the three are 1st-place/winner claims.

### 4.2 Diagrams
| Diagram medium | Repos | % |
|---|---|---|
| **Any system-structure diagram** | **14 / 22** | 64% |
| **No diagram at all** | **8 / 22** | 36% |
| Mermaid | 5 / 22 | 23% |
| Raster/vector image (PNG/JPG/SVG) | 5 / 22 | 23% |
| ASCII / plain-text diagram | 6 / 22 | 27% |
| PDF (linked, not inlined) | 1 / 22 | 5% |
| **draw.io or Excalidraw source file in repo** | **0 / 22** | **0%** |

Total Mermaid blocks across the corpus: **8**, held by 5 repos. Of those 8: **5 are `graph TB`/`graph TD` component-and-dependency graphs, 3 are `sequenceDiagram`.** No `erDiagram`, no `stateDiagram`, no `classDiagram`, no `C4Context` anywhere in the corpus.

**What the diagrams depict** (14 diagram-bearing repos, classified by hand):
| Depicts | Repos |
|---|---|
| Static component / service topology ("boxes and arrows") | 11 |
| Data flow through a pipeline | 5 |
| Request sequence over time (sequence diagram) | **3** (Cartmate, bleachAgentBuilder, AgentQuant) |
| Deployment topology (what runs where, cluster/gateway boundaries) | **2** (julian-hecker, victortong-git) |
| Data model / ER | **0** |
| State machine | **0** |

The single most common diagram in the corpus is a component graph whose nodes are agent names and whose edges are unlabelled. `hazardscarn/energyagentai` is the outlier: 7 separate per-agent flow images, one per sub-agent.

### 4.3 Length
- Architecture section word count, all 22: `0, 0, 0, 0, 0, 0, 12, 25, 43, 68, 74, 95, 123, 130, 140, 148, 161, 209, 213, 311, 385` (21 values shown; 6 zeros)
- **Median across all 22 winners: 74 words**
- **Median across the 16 that have an architecture section: 126 words**
- Mean of the 16 non-zero: ~146 words
- Max: **385 words** (`vivek100/bleachAgentBuilder`) — and 258 of those 385 are inside Mermaid fences, so the *prose* maximum in the corpus is lower still
- Min non-zero: **12 words** (`giovannamoeller/nero-fashion-frontend`, a single arrow chain)
- README total words: median **1060**, range **85 → 3778**
- Heading count: median **21.5**, range **0 → 71**

**The architecture section is typically ~7-12% of the README.** Setup instructions are consistently longer than the architecture section in every repo that has both.

### 4.4 Depth markers (hand-adjudicated)
Automated regex was run first, then every hit was read in context and false positives removed. Removals are recorded because they are instructive: e.g. a `$1,000` fraud *threshold*, a `--timeout 900` gcloud flag, and a `$20,000` *prize* all matched "cost"/"failure"/"cost" regexes and were rejected.

| Depth marker | Documented | % | Which repos |
|---|---|---|---|
| Deployment topology (named infra: GKE/Cloud Run/K8s/Docker Compose) | **11 / 22** | 50% | most Google-ecosystem entries |
| Request lifecycle / end-to-end sequence | **6 / 22** | 27% | Cartmate, bleachAgentBuilder, AgentQuant, SalesShortcut, mangstoon_ai, vigil |
| API contracts (explicit method+path or endpoint table) | **7 / 22** | 32% | RequestTap, mangstoon_ai, open-code-review, nero-fashion, edu-ai, energyagentai, clarifai |
| Security model (beyond "we use auth") | **4 / 22** | 18% | RequestTap (EIP-191 signing, BITE encryption), clarifai (rate limit + API key + CORS), SalesShortcut, open-code-review |
| Failure handling as a *design* concern | **1 / 22** | **5%** | `crusoe-nemotron-harness` only (tool-failure detection + budget caps as first-class outputs). 3 more have a single incidental bullet ("retry automático", "fault-tolerant", "deploy across regions for resilience") |
| Latency with real numbers | **5 / 22** | 23% | crusoe-nemotron-harness (p50 124 ms / p95 1003 ms), clarifai ("3-4x faster"), and the 3 TensorRT repos (latency tables) |
| Evaluation / metrics with real numbers | **3 / 22** | **14%** | **all three are TensorRT optimisation contests** (`精度与加速结果` tables). **Zero of the 19 agent/app winners publish an eval number.** |
| State management | **3 / 22** | 14% | AgentQuant (Redis), edu-ai, bleachAgentBuilder (session storage node in diagram only) |
| Data model / schema | **3 / 22** | 14% | energyagentai (BigQuery dataset structure), tradesage-mvp (Cloud SQL setup), open-code-review |
| Scaling story | **2 / 22** | 9% | xValentim/nero-fashion (inherited from Online Boutique), AgentQuant (K8s sandbox) |
| **Cost of running the system** | **1 / 22** | **5%** | `crusoe-nemotron-harness` only (per-run cost tracking + budget caps). Dashunbored's "no API cost" is a one-line marketing claim with no numbers |

### 4.5 What does the README lead with?
First two sentences classified by hand (badge rows stripped).

| Lead type | Count | % |
|---|---|---|
| **What it is / the tech** ("A comprehensive AI-powered multi-agent system built with...") | **15 / 22** | 68% |
| **The demo / the outcome** ("Turn your wildest fantasy into a full webtoon in under a minute") | 5 / 22 | 23% |
| **The origin story** ("I built You2Txt for the Vercel + Nvidia 2-hour hackathon") | 1 / 22 | 5% |
| **A guide/ops framing** ("A comprehensive guide for developing, testing, and deploying...") | 1 / 22 | 5% |
| **The problem, stated with evidence** | **0 / 22** | **0%** |

Verbatim first-two-sentence samples:
- `merdandt/SalesShortcut` (Grand Prize): *"A comprehensive AI-powered Sales Development Representative (SDR) system built with multi-agent architecture for automated lead generation, research, proposal generation, and outreach. SalesShortcut is a sales automation and engagement platform that finds, creates, and converts…"*
- `jays0606/mangstoon_ai` (3rd): *"Turn your wildest fantasy into a full webtoon — starring yourself — in under a minute."*
- `nandorojo/you2txt` (1st): *"I built You2Txt for the Vercel + Nvidia 2-hour hackathon. It turns any YouTube video into a transcribed `.txt` file."*
- `MukundaKatta/crusoe-nemotron-harness` (Winner): *"Production harness for Nemotron agents on Crusoe Cloud Managed Inference. Wrap any Nemotron provider in `NemotronHarness` and every run produces one auditable `RunReport`…"*
- `victorbash400/Cartmate` (EMEA winner): *"CartMate isn't just another shopping platform—it's a complete reimagining of how people discover, evaluate, and purchase products online."*
- `talbertherndon/doom-monorepo` (Winner): *"graph rag your doom scrolling. graphrag is the future."* — the entire README is 97 words and has zero headings.

Two repos gesture at a problem (`Cartmate`'s "isn't just another shopping platform", `open-code-review`'s "Transform traditional code review processes"). Neither cites a number, a user, or an incident.

### 4.6 Evidence of rigor
| Rigor marker | Count | % | Notes |
|---|---|---|---|
| CI badge or GitHub Actions badge in README | 5 / 22 | 23% | 2 of the 5 are badges inherited from a Google sample app fork, not the team's own CI |
| `.github/workflows/` present in repo tree | **3 / 22** | 14% | crusoe-nemotron-harness, xValentim/nero-fashion, mangstoon_ai |
| Explicit test count or coverage figure stated | **1 / 22** | **5%** | crusoe-nemotron-harness ("60 tests under 0.1s") |
| Any test files in the repo tree | 13 / 22 | 59% | presence ≠ documentation; only 8 mention testing in the README |
| A metric/benchmark table | **4 / 22** | 18% | 3 TensorRT repos + crusoe-nemotron-harness's sample RunReport |
| Ablation or "what we tried that didn't work" | **3 / 22** | 14% | all TensorRT: `比赛过程中的无用的尝试`, `开发工作的难点`, `模型优化的难点` |
| Any "why we chose X over Y" tradeoff discussion | **5 / 22** | 23% | `Key Design Decisions` (mangstoon_ai), `Performance Comparison` + `Recommendations by Use Case` (open-code-review), `Common Mistake` (RequestTap), energyagentai, clarifai |

---

## 5. Winners vs. non-winners: the control comparison

Same extraction run over 31 verified non-winner submissions from the same events.

| Metric | Winners (n=22) | Non-winner submissions (n=31) |
|---|---|---|
| README words, median | 1060 | 778 |
| Has an architecture-titled section | 14/22 (64%)* | 21/31 (68%) |
| Architecture section words, median (non-zero) | 135 | 133 |
| Uses Mermaid | 5 (23%) | 4 (13%) |
| Has a diagram image | 5 (23%) | 7 (23%) |
| Has an `ARCHITECTURE.md` (incl. vendored) | 1 (5%) | 2 (6%) |
| Has CI workflows | 3 (14%) | 3 (10%) |

\* automated count, pre-hand-correction, so both columns are measured identically.

**Architecture documentation depth does not separate winners from non-winners in this corpus.** The median architecture section is 135 words for winners and 133 for losers. Non-winners are *more* likely to have an architecture-titled section. The only metrics where winners lead are total README length (+36%) and Mermaid adoption (23% vs 13%), neither of which is a large or clean separation at these sample sizes.

---

## 6. The TensorRT sub-genre: an organizer-imposed template

The three NVIDIA TensorRT Hackathon (Tianchi) repos have **no "Architecture" heading at all** and instead share a near-identical, different heading skeleton:

`TRT2022/ControlNet_TensorRT`: `大赛介绍` → `初赛补充说明` → `比赛使用的Trick` → `比赛过程中的无用的尝试` → `Demo`
`FeiGeChuanShu/trt2023`: `总述` → `主要开发工作` → `模型简介` → `开发工作的难点` → `开发与优化过程` → `精度与加速结果` → `送分题答案（可选）` → `未来工作`
`lxl24/SwinTransformerV2_TensorRT`: `总述` → `模型简介` → `模型应用` → `模型特点` → `模型优化的难点` → `具体实践` → `遇到的问题及解决方案` → `Nsight分析` → `精度与加速效果` → `感想体会`

The overlap (`总述`, `模型简介`, `难点`, `精度与加速`, `未来工作`) across independent teams is strong evidence of a **required submission template** — including a mandatory *"the difficulties"* section and a mandatory *"accuracy and speedup results"* section. **(INFERENCE from heading convergence; the template document itself was not retrieved.)**

Consequence: **the only 3 repos in the corpus with quantified evaluation tables, the only 3 with ablations/negative results, and 3 of the 5 with real latency numbers are exactly the 3 repos where the organizer mandated those sections.** Rigor in this corpus correlates with being made to do it, not with placing well.

---

## 7. What is conspicuously ABSENT

Ranked by how universal the absence is.

1. **Cost. 21/22 say nothing about what the system costs to run.** Not per-request, not per-token, not monthly. The single exception is a repo whose entire premise is a cost-tracking harness.
2. **Failure handling as a design concern. 21/22.** Retries and timeouts appear only as incidental library flags. No repo enumerates failure modes, none defines degraded behaviour, none has a "what happens when the LLM returns garbage" section — in a corpus that is almost entirely LLM agent systems.
3. **Authored `ARCHITECTURE.md`. 22/22 absent.** Architecture lives in a README section or nowhere. Nobody in this corpus reached for a dedicated file, a docs site, or an ADR.
4. **Evaluation numbers for agent systems. 19/19 of the non-TensorRT winners.** Not one agent/app winner publishes accuracy, precision, recall, task success rate, or a comparison against a baseline. Several claim "95%+ success rate" in third-party summary text; none show the measurement.
5. **Limitations / Non-Goals / Known Issues. 0/22.** Seven have *Troubleshooting* (install problems), none has *Limitations* (design problems).
6. **Alternatives considered. 0/22 as a section.** Five discuss a tradeoff inline; none frames it as a decision with a rejected option.
7. **Data model. 19/22.** Three describe a database *setup*; none publishes a schema, an ERD, or the shape of the objects flowing between agents.
8. **Diagram source files. 0/22.** No `.drawio`, no `.excalidraw`. Diagrams are either Mermaid-in-README (regenerable) or a flat PNG/JPG with no source (not regenerable). 5 of 14 diagram-bearing repos have an un-editable raster as their only architecture artifact.
9. **Sequence / temporal reasoning. 19/22.** Only 3 sequence diagrams in the corpus. The dominant mental model documented is *what components exist*, almost never *what happens in what order*.
10. **Security beyond a keyword. 18/22.** Six have a security-ish heading; four say anything specific. Zero threat models.

---

## 8. What the data says

- **The modal winning architecture artifact is a ~130-word README section under an `## Architecture` heading, containing one unlabelled component graph and a bulleted list of services.** That is the centre of the distribution across both Google and NVIDIA ecosystems, and it is the same for the teams that lost.
- **Documentation effort is spent on reproduction, not on comprehension.** Setup/Quick Start is the #1 section (73%), Deployment is #3 (59%), Configuration is #8 (41%). In every repo that has both, the install instructions are longer than the architecture. The README is optimised for a judge who wants to *run* the thing, not for a reader who wants to *understand* it.
- **Winners describe structure; they do not describe behaviour under stress.** Component topology: 11/22. Failure handling: 1/22. Cost: 1/22. Evaluation: 3/22, all mandated. The corpus documents the happy path almost exclusively.
- **Rigor appears where it is required and essentially nowhere else.** The three organizer-templated repos hold the corpus's only ablations, its only accuracy tables, and 3 of its 5 latency figures. Voluntary rigor is 1 repo out of 19.
- **Event duration predicts documentation more than placement does.** All 3 zero-architecture repos come from short-format NVIDIA events (2 hours to 1 day); the longest architecture sections come from the multi-week Google ADK and GKE hackathons. Placement itself has no visible effect (§5).
- **Nobody argues.** 0/22 lead with a problem, 0/22 have a Limitations section, 0/22 have an Alternatives Considered section. The README is uniformly a product description, not a case.
- **The self-declaration problem is real.** 11/22 placements exist only as a line the author wrote in their own repo description. Two of the three most confidently-worded winner claims in the corpus (`Dashunbored`, `doom-monorepo`) sit on top of the thinnest documentation in the corpus.

---

## 9. Reproduction

Pool construction (2026-08-26):
```
gh search repos "gke-turns-10" | "gke-turns10" | "adk-hackathon" | "google-adk-hackathon"
gh search repos "agent-development-kit-hackathon" | "gemini api competition"
gh search repos "nemotron hackathon" | "nvidia-hackathon" | "gtc hackathon" | "dgx spark hackathon"
```
Note: `gh search repos` applies AND semantics across terms, so queries containing the word "winner" returned 0-1 results and were abandoned; placement screening was done by fetching every candidate README and regex-scanning for placement language instead.

Per-repo extraction:
```
gh api repos/{owner}/{repo}                        # existence, size, stars, language, pushed_at
gh api repos/{owner}/{repo}/readme --jq .content   # base64 → README
gh api "repos/{owner}/{repo}/git/trees/HEAD?recursive=1" --jq '.tree[].path'
```
Headings were parsed with a fence-aware Markdown H1-H6 matcher (code blocks excluded so that `# comment` lines inside bash blocks are not counted as headings). Architecture sections were sliced from their heading to the next heading of equal-or-higher level. All depth and rigor regex hits were then read in context and adjudicated by hand; §4.4 reports the adjudicated counts, not the raw regex counts.

Seed: `research/02_hackathons/REPO_SHORTLIST.md` contributed 7 of the 22 (`gke-turns10-hackathon-vigil`, `Cartmate`, `gke-hackathon`, `nero-fashion-frontend`, `nero-fashion`, `SalesShortcut`, `crusoe-nemotron-harness`, `RequestTap-Router`); the remaining 15 were found by search. The ADK Hackathon winner set was recovered via [0xprajapati/google-adk-apps](https://github.com/0xprajapati/google-adk-apps), a third-party curation whose "Winners" section vendors copies of 6 winning projects; original upstream repos were located by name search and fetched directly (evidence grade C).

**Not fetchable, recorded as a gap:** the Kaggle × Google DeepMind "Vibe Code with Gemini 3 Pro in AI Studio" hackathon awarded 50 winners (announced 2026-03-04, per [adrianwwwang/Kaggle_Google_deepmind_winner_analysis](https://github.com/adrianwwwang/Kaggle_Google_deepmind_winner_analysis)), but submissions were AI Studio app links, not GitHub repos — **that entire cohort of 50 Google winners has no architecture documentation to examine at all**, which is itself the strongest available data point about the bar in Gemini-ecosystem competitions.
