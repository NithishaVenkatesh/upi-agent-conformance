# Razorpay Engineering Signals

**Retrieval date for every item below: 2026-08-26** (unless a different date is stated inline).
**Labels:** `FACT` = directly stated in the cited source. `INFERENCE` = my reasoning over multiple cited facts. `HYPOTHESIS` = plausible but unverified. `EVIDENCE NOT FOUND` = could not verify; do not treat as true.

---

## 0. Method & Tooling Caveats (read this before trusting anything below)

| Item | Detail |
|---|---|
| Primary source | `https://engineering.razorpay.com` — a **Medium publication**. `medium.com/razorpay-engineering` resolves to the identical content. `FACT` (RSS channel title is literally "Razorpay Engineering - Medium"). |
| Access obstacle | Both hostnames return **Cloudflare HTTP 403** to plain `curl`/WebFetch/Firecrawl for HTML pages. `FACT` (observed 403 with browser UA). |
| What worked | `https://engineering.razorpay.com/sitemap/sitemap.xml` (HTTP 200) and `https://engineering.razorpay.com/feed` (HTTP 200) are **not** blocked. Individual posts were retrieved via the `r.jina.ai` reader proxy. |
| Firecrawl MCP | **Broken during this session** — `firecrawl_search`, `firecrawl_scrape`, `firecrawl_map` all errored. `~/.superstack/web/bin/webup` failed with "Docker not running". Camoufox MCP also failed (native `better-sqlite3` NODE_MODULE_VERSION mismatch). |
| WebSearch | Session budget exhausted (200/200) partway through, which **limited section 3** (see gaps there). |
| Coverage | The sitemap yielded **84 post URLs with `lastmod` dates**. The sitemap also lists 175 `/tagged/*` pages, some with `lastmod` **earlier than the oldest post in the sitemap** (e.g. `outbox` 2021-04-07, `canary-deployments` 2021-04-29, `kyc` 2021-07-06, `redis` 2021-06-29). `INFERENCE`: posts published before 2021-06-04 exist but are **not** in the current sitemap, so the 84 is a floor, not the complete archive. |
| Date caveat | Sitemap `lastmod` is a *modification* date. Where the RSS feed gave a true `pubDate`, the two differ by up to ~8 days (e.g. Hermes post: sitemap 2026-07-22, RSS pubDate 2026-07-12). Treat single-source dates as ±1 week. |

---

## 1. Engineering Blog Themes

### 1a. Publication cadence by year (`FACT`, counted from sitemap)

| Year | Posts in sitemap |
|---|---|
| 2021 (from June) | 16 |
| 2022 | 19 |
| 2023 | 20 |
| 2024 | 10 |
| 2025 | 8 |
| 2026 (to Aug 24) | 11 |

`INFERENCE`: Output peaked 2022–2023 (~20/yr), halved through 2024–2025, and is rebounding in 2026 — but with a **completely different subject matter** (see 1b). The 2026 run rate (11 posts in ~8 months) is back near the 2022–23 peak.

### 1b. Recurring themes — what their engineers actually write about

Ranked by volume across the 84-post inventory. `INFERENCE` (thematic grouping is mine; the underlying titles/dates are `FACT`).

1. **Cost optimization / FinOps as an engineering discipline — the single loudest theme.** At least ten posts, each with a dollar figure in the title or body: `$2M` data platform, `$300,000` Kubernetes, spot instances (three separate posts across 2023/2024/2026), Graviton migration, `62%` metrics reduction. This is unusual — most eng blogs discuss cost incidentally; Razorpay leads with it.
2. **Data platform & real-time streaming.** Trino, Alluxio, Databricks, Spark, Flink, Kafka, CDC, Delta Lake, a three-part denormalized-streaming series, a CDP, and warehouse refresh optimization.
3. **AI agents / LLM systems — dominant since Dec 2025.** Nine of the eleven 2026 posts are agent/LLM posts. See 1d; this is the sharpest trend in the corpus.
4. **Platform & infrastructure engineering.** Kubernetes, Kong API gateway, Istio service mesh, Traefik ingress, Spinnaker, Terraform/GitOps, Consul leader election, internal developer platform (`devstack`, Developer Console).
5. **Observability.** A multi-year arc: Prometheus → Thanos → VictoriaMetrics → managed platform, plus distributed tracing (OpenCensus, Jaeger, Hypertrace) and alert management.
6. **Frontend & design systems.** Blade design system, module federation, React Native performance, reusable components, a frontend platform team.
7. **Incident management & SRE culture.** Command Center, 5-Why RCA format, production alert management.
8. **Payments domain engineering.** Downtime detection, linked/composable payments, notification service, outbox/dual-writes, merchant fraud dedup, rewards platform.
9. **Security / AppSec.** SAST program, Istio mTLS, secure-code-reviewer copilot, AI security triage.
10. **Engineering culture & process.** Interview guides, "The Platform Engineer", Jira adoption, estimation, hackathons, analytics team structure.

### 1c. Notable posts (22 posts; title / URL / date / topic)

Dates are sitemap `lastmod` unless marked †, where the RSS `pubDate` was available and is used.

| # | Title | URL | Date | Topic (one line) |
|---|---|---|---|---|
| 1 | How Razorpay Cut Its Metrics Bill by 62% Without Losing a Dashboard | https://engineering.razorpay.com/how-razorpay-cut-its-metrics-bill-by-62-without-losing-a-dashboard-2a7d5467df37 | 2026-08-24† | Cut daily metric ingestion 450B → 170B samples while migrating off self-hosted VictoriaMetrics. |
| 2 | CI Doesn't Need On-Demand: Moving Our Build Pipelines to Spot Instances | https://engineering.razorpay.com/ci-doesnt-need-on-demand-moving-our-build-pipelines-to-spot-instances-6fff1cd92ba8 | 2026-08-05† | Self-healing GitHub Actions runners on K8s: 80% of CI on spot at 99.2% job success. |
| 3 | How We Refresh Razorpay's Data Warehouse 10x Faster with Graphs and Indexes | https://engineering.razorpay.com/how-we-refresh-razorpays-data-warehouse-10x-faster-with-graphs-and-indexes-538abc244703 | 2026-07-14† | Dependency-graph-driven warehouse refresh. |
| 4 | Running Hermes at Razorpay: a Network-isolated, Self-improving "Second Brain" for every Employee | https://engineering.razorpay.com/running-hermes-at-razorpay-a-network-isolated-self-improving-second-brain-for-every-employee-f91d56bea3f1 | 2026-07-12† | 220 per-employee always-on AI agents, one K8s namespace each. |
| 5 | Turning Scattered Data Into Queryable Segments at Scale (Customer Data Platform) | https://engineering.razorpay.com/turning-scattered-data-into-queryable-segments-at-scale-how-razorpay-built-its-customer-data-3937c4b012de | 2026-06-26† | Consent-native CDP, 500M+ profiles, <30ms segment membership at 1,500+ RPS. |
| 6 | From 750 Hours to 2 Hours: AI-Powered Security Triage at Razorpay | https://engineering.razorpay.com/from-750-hours-to-2-hours-ai-powered-security-triage-at-razorpay-c8baeac3a1d3 | 2026-06-09† | 3-layer LLM triage over Semgrep SAST findings; L1 accuracy 75–80%. |
| 7 | Razorpay Oncall Agent: From 30-Minute Investigations to 90-Second AI Analysis | https://engineering.razorpay.com/razorpay-oncall-agent-from-30-minute-investigations-to-90-second-ai-analysis-5be7bcc461a4 | 2026-04-29† | LangGraph multi-agent incident investigation; targets MTTI. |
| 8 | The Checkout Frustration Razorpay Fixed: Combining Payment Methods | https://engineering.razorpay.com/the-checkout-frustration-razorpay-fixed-combining-payment-methods-0e0b05fdf104 | 2026-04-08† | "Linked Payments": composable multi-instrument payments, authorize-all-then-capture-all. |
| 9 | Building a Multi-Provider Rewards Platform | https://engineering.razorpay.com/building-a-multi-provider-rewards-platform-an-e-commerce-approach-to-rewards-at-scale-0be0f2b9131f | 2026-04-01† | Rewards modelled as e-commerce catalog/inventory. |
| 10 | How We Turned 5 Hours of RCA Writing Into 10 Minutes of Review | https://engineering.razorpay.com/how-we-turned-5-hours-of-rca-writing-into-10-minutes-of-review-3a154e69c8ec | 2026-03-03† | "RCA-GPT" drafts postmortems from Slack + Zoom + dashboards. |
| 11 | Meet Bumblebee: The Multi-Agent AI Architecture That Changed Fraud Detection | https://engineering.razorpay.com/meet-bumblebee-the-multi-agent-ai-architecture-that-changed-fraud-detection-at-razorpay-c2b6d5704f51 | 2025-12-17 | Planner/Fetcher/Analyzer agents for merchant risk review; 88% → 99%+ success. |
| 12 | Scaling Smarter: The Inside Story of Razorpay's AIOps Evolution | https://engineering.razorpay.com/scaling-smarter-the-inside-story-of-razorpays-aiops-evolution-6a2934ef58dd | 2025-01-02 | AIOps overview (largely conceptual — see quality caveat 1e). |
| 13 | Reducing Data Platform Cost by $2M | https://engineering.razorpay.com/reducing-data-platform-cost-by-2m-d8f82285c4ae | 2023-06-21 | Databricks/S3/Trino cost teardown; ~2PB storage reclaimed. |
| 14 | The Culture of Cost Optimization — Reducing Kubernetes cost by $300,000 | https://engineering.razorpay.com/the-culture-of-cost-optimization-reducing-kubernetes-cost-by-300-000-32611cdd19d9 | 2023-11-17 | VPA + mutating webhook to right-size thousands of microservices. |
| 15 | How Trino and Alluxio power analytics at Razorpay | https://engineering.razorpay.com/how-trino-and-alluxio-power-analytics-at-razorpay-803d3386daaf | 2022-07-26 | Self-managed Trino-on-K8s with Alluxio cache; custom autoscaler. |
| 16 | Real-time Denormalized Data Streaming Platform (Parts 1–3) | https://engineering.razorpay.com/real-time-denormalized-data-streaming-platform-part-1-9f3c730dd9c6 | 2023-03-30 / 05-12 / 05-05 | CDC → Kafka → Spark Structured Streaming into Delta on S3; 24h → <1h freshness. |
| 17 | Scaling to trillions of metric data points | https://engineering.razorpay.com/scaling-to-trillions-of-metric-data-points-f569a5b654f2 | 2021-07-30 | Prometheus → Thanos → VictoriaMetrics migration; the foundational observability post. |
| 18 | How an incident transformed Razorpay: building our Command Center | https://engineering.razorpay.com/how-an-incident-transformed-razorpay-building-our-command-center-ef56adb67f8e | 2022-09-20 | The 12 Aug 2021 outage and the 24x7 incident-command function it created. |
| 19 | How an incident transformed Razorpay: improving the 5-Why RCA format | https://engineering.razorpay.com/how-an-incident-transformed-razorpay-improving-the-5-why-rca-format-378de299b9a2 | 2022-07-17 | Part 1 of the incident-management series. |
| 20 | Achieving reliable dual writes in distributed systems | https://engineering.razorpay.com/achieving-reliable-dual-writes-in-distributed-systems-cb9ff3b9bfc1 | 2021-11-16 | Transactional outbox ("Outboxer") in Go with retry state machine. |
| 21 | Detecting downtimes to improve payments experience | https://engineering.razorpay.com/detecting-downtimes-to-improve-payments-experience-3bc2814152c | 2021-11-24 | Apache Flink CEP detecting issuer/method-level payment downtime. |
| 22 | How Razorpay's notification service handles increasing load | https://engineering.razorpay.com/how-razorpays-notification-service-handles-increasing-load-f787623a490f | 2022-05-16 | Priority SQS queues; system ceiling was 2K TPS, peak ~1K TPS. |

Additional notable posts not tabled above but confirmed in the sitemap: *The Making of Developer-Console* (2023-08-31), *Building a SAST program at Razorpay's scale* (2022-07-01), *Strengthening Application Security: Istio service mesh for mTLS* (2023-12-12), *Green signal with Traefik v2* (2024-03-06), *Cutting deep through Blade* (2024-05-13), *Innovate faster with Razorpay's open-source suite* (2024-02-23), *Building Splitz, Razorpay's platform for high-scale experimentation* (2021-07-14), *Detecting goroutine leaks with test cases* (2022-01-27), *Migrating to AWS Graviton* (2023-10-03), *The Platform Engineer* (2021-08-12).

### 1d. The 2026 pivot to AI agents (`FACT` on composition, `INFERENCE` on significance)

Nine of the eleven 2026 posts, plus the Dec-2025 Bumblebee post, are about LLM/agent systems: fraud review (Bumblebee), on-call investigation (Oncall Agent), postmortem drafting (RCA-GPT), security triage (Autonomous Security Special Ops), and a per-employee agent platform (Hermes). `INFERENCE`: Razorpay is publicly positioning itself as an *agent-operations* company, and — notably — is applying agents to its **own internal engineering toil** (on-call, RCA, security triage, code review) rather than to customer-facing payment flows. That is a meaningful distinction for anyone planning work in this space.

`FACT`: the Hermes post states the underlying agent is **not** Razorpay's: *"Hermes itself is an open-source agent by Nous Research; what we built is the platform that runs it safely & isolated, for the whole company."*

### 1e. Editorial quality is uneven (`FACT`, with caveat)

- The security-triage post contains an **unedited internal placeholder in published text**: `"[VERIFY: Vyom / Slash] doesn't just flag it."` `FACT` (present in the RSS `content:encoded` body as retrieved 2026-08-26). `INFERENCE`: light editorial review on at least some posts; also a leak of two internal tool codenames ("Vyom", "Slash").
- The AIOps post (2025-01-02) is substantially generic exposition ("What is AIOps?", "Benefits in Fintech") with few Razorpay-specific numbers, unlike the 2021–2023 infrastructure posts. `INFERENCE`: quality varies a lot by author; the older infra/data posts are markedly more technical than some of the 2024–2025 output.

---

## 2. Notable Public Repos

`FACT` for all metadata below (via authenticated `gh api`, 2026-08-26).

**Org total: 177 public repos.** Note: their own 2024 blog post claims *"more than 100+ repositories garnering over 2000+ GitHub stars"* (source: *Innovate faster with Razorpay's open-source suite*, 2024-02-23). The top-10 repos alone now exceed 2,000 stars, so that figure is stale.

> ### CRITICAL CAVEAT — `pushed_at` is misleading on this org
> Many Razorpay repos show a `pushed_at` of 2026-08-25 that reflects **automated commits, not development**. Commit inspection shows a fleet-wide pattern of bot commits: `"Add or update .cursorignore file"` (2025-04 → 2025-07), `"Remove genesis.yml workflow file"` (2025-09), and `"Add updated workflow file"`. `FACT`. Below I report **last substantive commit** separately. Anyone judging project health from `pushed_at` will be wrong.

| Repo | What it is | Why it exists | Stars | Lang | License | Created | Last *substantive* commit |
|---|---|---|---|---|---|---|---|
| **blade** | "Design System that powers Razorpay" — cross-platform (React Web + React Native), white-labelling, documented RFCs, 40+ components | Unify design and development across Dashboards, Websites, Mobile Apps | **649** | TypeScript | MIT | 2020-01-28 | **2026-08-25 — genuinely active** (`fix(Button): fade highlight overlay`, `feat: add razorsense dark mode`) |
| **ifsc** | Indian bank IFSC-code toolset + dataset, scraped from RBI sources; ships as npm/gem/PHP/Docker packages | Public utility for the Indian banking ecosystem | **393** | HTML | MIT | 2016-02-03 | **2026-07-15 — actively released** (v2.0.61) |
| **go-financial** | Go port of `numpy-financial` (fv, ipmt, pmt, amortization schedules, etc.) | Elementary financial functions natively in Go; backs their lending/amortization work | **317** | Go | MIT | 2020-12-09 | **2021-12-27** (later commits are CI/semgrep only) — effectively dormant |
| **razorpay-mcp-server** | "Razorpay MCP Server (Official)" — Model Context Protocol server exposing Razorpay APIs (capture_payment, fetch_payment, …) to AI tools; hosted remote option + local | Make Razorpay APIs first-class for AI agents | **229** | Go | MIT | 2025-04-26 | **2026-03-26** (`feat: add tool generator skill for AI agents`) |
| **devstack** | "Razorpay DevX cloud on laptop solution" — define a fleet of dependent microservices, deploy with one command, build/test/debug **inside** Kubernetes with hot reload, service-level routing via header propagation | README states it plainly: *"Simplify developer workflow and reduce the time taken to rollout features independently"* — because *"at razorpay, we run all our workloads on kubernetes"* | **133** | Go | Apache-2.0 | 2021-09-06 | **2022-11-24** (`Setup tool v2`) — dormant despite 2026 `pushed_at` |
| **metro** | "The Service Bus!" — async pub-sub messaging platform with durable storage, real-time delivery, HA and fault tolerance | Backbone for event-driven microservice communication | **56** | Go | MIT | 2020-11-06 | **2022-12-24** (2024 commits are CI YAML only). README still carries: *"metro is under active development currently. The first release is expected soon."* — `INFERENCE`: **abandoned**; that disclaimer has been stale for ~4 years |
| **razorpay-cli** | CLI for the Razorpay API (payments, orders, customers, invoices, refunds, settlements, disputes, links, QR, subscriptions, Route, Smart Collect) | Terminal-native API access; installs via `curl … install.sh` | **50** | Go | MIT | **2026-04-03** (new) | **2026-06-18** (`feat/cli-telemetry`) — active |
| **trino-gateway** | "Traffic routing for Trino Clusters" — stateless load balancer/routing proxy for Trino: cluster healthchecks, logical cluster groups, routing strategies (round robin / least load / random) | Directly productionizes the Trino architecture described in the 2022 Trino+Alluxio blog post | **31** | Python *(see note)* | none | 2021-08-24 | **2026-06-22** (`Adds trino-finance port`) — active |
| **alohomora** | "Razorpay's Secret Credential management system", distributed on PyPI as `razorpay.alohomora` | Secret distribution | **32** | Python | none | 2017-05-03 | Not separately verified — `EVIDENCE NOT FOUND` |
| **i18nify** | Internationalization library — countries, currencies, phone numbers, subdivisions/pincodes; Go + JS + React packages; public dataset | Powers "GeoSmart" (geosmart.razorpay.com), their i18n product surface | **28** | TypeScript | none | 2023-10-26 | **2026-08-25** (`feat: add 638 pincodes…`) — active, community/Hacktoberfest-tagged |
| **thirdeye** | Time-series anomaly detection + interactive RCA tool | **NOT Razorpay's own work — it is a FORK** of `project-thirdeye/thirdeye` (originally LinkedIn/Apache Pinot lineage; the README still carries Apache Pinot Travis badges) | **2** | Java | Apache-2.0 | 2021-03-22 | **2025-09-15** — bot commits only. `INFERENCE`: an evaluation fork, not a maintained product. Do not cite it as Razorpay engineering output. |

**Discrepancy worth flagging** (`FACT`): the `trino-gateway` README says it is *"written in Go and uses twirp framework"*, but GitHub reports the primary language as **Python**. `HYPOTHESIS`: the repo was rewritten or gained a large Python control-plane after the README was written, and the README was never updated.

**Other repos of note** (`FACT`, metadata only): `razorpay-node` (242★, JS), `razorpay-php` (206★, PHP), `razorpay-python` (173★), `react-native-razorpay` (133★), `razorpay-java` (73★), `razorpay-ruby` (66★), `razorpay-go` (59★), `concierge` (74★, Go — AWS security-group access control with 2FA), `bhadra` (16★, vulnerability management platform), `opensource.razorpay.com` (18★, their OSS showcase site), `ifsc-api` (88★).

**Freedom Finance Stack**: the 2024 open-source post announces a "Freedom Finance Stack" initiative at `freedomfinancestack.org`, claiming an open-sourced **ACS server** "utilized by over 20+ globally" and a forthcoming DrishtiPay SDK (RBI Harbinger 2023 award). `FACT` that the claim is made. The GitHub org `freedomfinancestack` returned **404** via `gh api`. `EVIDENCE NOT FOUND` for the actual code location — needs re-verification before relying on it.

---

## 3. Tech Stack

All items `FACT` unless marked, each grounded in a cited post or repo.

### Languages
- **Go** — dominant for new backend/infra services. Evidence: `metro`, `devstack`, `go-financial`, `razorpay-cli`, `razorpay-mcp-server`, `concierge` all Go; the Developer Console post writes bulk-insert code in Go using goroutines/channels; the outbox library ("Outboxer") is Go using `gorm`; a whole post on *Detecting goroutine leaks with test cases* (2022-01-27) and *Golang consuming all your resources* (2022-06-15).
- **PHP (Laravel)** — the legacy monolith. Evidence: `razorpay-php`, the `razorpay/opencensus-php` fork ("Tracing 100k spans with Razorpay OpenCensus PHP fork", 2021-09-18), tags `php`/`laravel`, and the K8s cost post naming *"Java, PHP, and Native code"* as workloads that **could not** be auto-optimized.
- **TypeScript / React / React Native** — Blade, i18nify, module federation, React Native performance and deep-linking posts.
- **Python** — `trino-gateway`, `alohomora`, data/ML tooling.
- **Java** — present but described as a constraint, not a focus (K8s cost post).

### Architecture
- **Monolith → microservices migration**, explicitly and repeatedly. `FACT`: the K8s cost post states *"As we are moving from monolith to microservices architecture… we have **thousands of microservices** across multiple Kubernetes clusters."* Corroborated by a 2020 podcast ("How Razorpay Migrated from Monolith to Microservices") and a 2022 talk on microservices data consistency, both listed in `public-presentations`.
- **Per-domain service + per-domain database.** `FACT`, from the Linked Payments post: *"each payment method has its own microservice and its own database"* — gift cards, UPI, and cards are separate services, which is why composing payments required explicit distributed orchestration.
- **Transactional outbox** for cross-service consistency (2021-11-16 post) — deliberately chosen *over* a Kafka/Kinesis broker for simple cases to avoid "broker setup overheads". Known gap admitted in the post: *"The current implementation does not guarantee the ordering of outbox jobs."*

### Infrastructure
- **Kubernetes — production since late 2016.** `FACT`, notable claim: *"Razorpay has perhaps been one of the first companies in the country to have gone with a production-grade Kubernetes infrastructure (somewhere late 2016)"* (Scaling to trillions of metric data points, 2021-07-30).
- **Multiple K8s clusters** for HA; **AWS** is the cloud (EC2, S3, EBS, RDS, SQS, SNS, CloudWatch, Graviton, Spot).
- **API gateway: Kong** (Kong-authored guest posts on PCI compliance, Terraform config management, and Spinnaker deploys — all in `public-presentations`).
- **Service mesh: Istio**, adopted for **mTLS** (2023-12-12).
- **Ingress: Traefik v2** (migration post, 2024-03-06).
- **CD: Spinnaker** (2021-06-04); **CI: GitHub Actions on Kubernetes** running **10,000+ jobs/day across hundreds of repositories** (2026-08-05).
- **IaC: Terraform** + GitOps, with two 2025 posts including one on **drift** ("The Dark Side of Terraform: Drifts, Chaos…").
- **Consul** for leader election (2021-06-15).
- **Spot instances everywhere** — the recurring cost lever (2023, 2024, 2026 posts).

### Data platform
- **Trino** (chosen over PrestoDB explicitly for *"much better Container + Kubernetes support and an active community"*), self-managed on Kubernetes via the community Helm chart, with **separate clusters per workload class** for SLA isolation.
- **Alluxio** as an S3 caching layer, **segregated per availability zone** to avoid inter-AZ transfer costs.
- **Databricks** for Spark workloads (migrated from a third-party-managed vendor platform in mid-2021 after *"severe reliability issues… frequent SLA breaches"*).
- **S3 data lake** + **Hive Metastore** + **Apache Hudi** for OLTP replication; **Delta Lake** format for facts.
- **Kafka** + **Debezium/Maxwell CDC** → **Spark Structured Streaming**.
- **Apache Flink** for real-time payment downtime detection (chosen over Spark for *"low latencies, high throughput, better APIs, libraries (like CEP)"*); also "Flink-powered model serving & real-time feature generation" (2020 talk).
- **Airflow** for orchestration; **Looker** for BI.
- **Custom Trino autoscaler** driven by Alertmanager webhooks — they explicitly **rejected HPA and KEDA** because of reactive thrashing and hardcoded cool-down periods.

### Observability — a well-documented multi-generation arc
1. **Prometheus** (statefulset on EBS PVCs) + Grafana + Alertmanager. Problems hit: not HA, single point of failure, vertical-scale-only, read/write on one instance.
2. **Thanos** + **Trickster** cache. Cost reached **~$12k/month**; HA Prometheus pairs "almost doubles the cost"; high-cardinality queries broke Thanos Store with OOM.
3. Evaluated and **rejected Uber's M3DB** (wanted an open Prometheus-compatible format) and **Cortex** (in-memory ingesters couldn't run on spot; node loss = metric loss).
4. **VictoriaMetrics**, replacing Prometheus itself with **vmAgent**. Migration completed *"in under a month across 4 different Kubernetes clusters"*. Claimed cost: **~$18/day** excluding EBS and data transfer.
5. **2026: migrating off self-hosted VictoriaMetrics to a managed platform** after a cascading storage-node failure (EBS volume throttling → traffic redistribution → cascading overload).
- **Tracing**: OpenCensus (incl. their own PHP fork), Jaeger, Hypertrace (2022-04-18), and a general "Tracing our observability journey" post.
- **Logging**: Fluent Bit DaemonSet → Kafka → Elasticsearch, with a Go service doing bulk inserts. Sized for *"the last 7 days of logs (~50GB logs per day)"* (Developer Console, 2023-08-31).

### AI / ML stack (2025–2026)
- **LangGraph** for the multi-agent on-call system; LLM as reasoning engine; **two separate RAG stores** (one for architecture/dependencies, one for alert runbooks).
- **Bumblebee** fraud architecture: explicitly abandoned **n8n** (*"visual programming feels fast until you need to actually maintain it"* — 10 nodes became 40+) and then a single **ReAct** agent (hit 70,000+ token contexts), landing on **Planner / parallel Fetchers / Analyzer** with aggressive context pruning.
- **Semgrep** for SAST, with LLM triage over its findings via GitHub fine-grained tokens.
- **Hermes** (open-source agent by **Nous Research**) on per-user isolated K8s namespaces; **Titan-v2 embeddings** for the vector index. AWS **Bedrock** referenced.
- `EVIDENCE NOT FOUND`: which foundation models they use for these systems. Posts consistently say "LLM" without naming a vendor or model.

### Other notable internal platforms
- **Splitz** — experimentation/feature-flag platform using **JsonLogic** rules, **MurmurHash** for bucketing, and **Redis Bloom filters (RedisBloom/Rebloom)** for segment membership.
- **Developer Console** — internal logging/observability dashboard.
- **Command Center / Incident Bot** — auto-pages stakeholders, opens a Slack thread, creates a Jira ticket, and spins up a Zoom room on alert.

---

## 4. Reliability & Scale Culture

### 4a. Published hard numbers (all `FACT`, each with source)

| Metric | Value | Source | Date |
|---|---|---|---|
| Metric samples ingested/day | **~450 billion → ~170 billion** (62% cut) | Metrics Bill post | 2026-08-24 |
| Managed-monitoring quote at ~400B samples/day | *"hundreds of thousands of dollars per month"* | Metrics Bill post | 2026-08-24 |
| Thanos-era observability cost | **~$12,000/month** | Scaling to trillions | 2021-07-30 |
| VictoriaMetrics-era cost | **~$18/day** (excl. EBS + data transfer) | Scaling to trillions | 2021-07-30 |
| Microservices | *"thousands of microservices across multiple Kubernetes clusters"* | K8s cost post | 2023-11-17 |
| Microservices (2018 milestone) | *"crossed a 100 mark"* | Scaling to trillions | 2021-07-30 |
| K8s in production since | **late 2016** | Scaling to trillions | 2021-07-30 |
| CI jobs | **10,000+ GitHub Actions jobs/day**, hundreds of repos; **80%** on spot; **99.2%** job success | CI/Spot post | 2026-08-05 |
| Spot economics cited | c5.2xlarge ~$0.34/hr on-demand → ~$0.08/hr spot | CI/Spot post | 2026-08-05 |
| Trino platform | **650 daily active users**, **~100k queries/day**, **P90 60s / P95 130s**, **~97% success rate** | Trino+Alluxio post | 2022-07-26 |
| Data platform savings | **~$2M/year**; ~2PB storage reclaimed; Trino infra cost down **>60%** | Reducing Data Platform Cost | 2023-06-21 |
| Kubernetes savings | **~$300,000/year** (first manual phase ~$250,000) | K8s cost post | 2023-11-17 |
| Merchant reports served | *"almost 10k reports daily to merchants"* | Reducing Data Platform Cost | 2023-06-21 |
| Notification service | ceiling **2K TPS**, typical peak **~1K TPS**; p99 degraded ~2s → ~4s at load | Notification post | 2022-05-16 |
| CDP | **500M+ user profiles**; **<30ms** membership check; **1,500+ RPS**; ingest *"tens of thousands per second"* | CDP post | 2026-06-26 |
| Merchants | *"over 12 million merchants"*, incl. *"2 million+ local merchants accepting QR payments every day"* | CDP post | 2026-06-26 |
| Streaming event volume | **~3–6 million events per 10-minute window** for common payment entities | Denormalized Streaming Pt.1 | 2023-03-30 |
| Schema churn | **30+ schema change requests per quarter** | Denormalized Streaming Pt.1 | 2023-03-30 |
| Fact table shape | ~300–400 columns, TBs of data, ~10–20 source tables | Denormalized Streaming Pt.1 | 2023-03-30 |
| Incident rate | **15–20 incidents weekly**; MTTI **20–40 min/incident** = 6–8 eng-hours/week | Oncall Agent post | 2026-04-29 |
| Alert posture | *"more than 90% of our alerts are proactive alerts"* | Command Center post | 2022-09-20 |
| Fraud review load | **20,000 alerts / 12,000 merchant reviews / 8,500 human hours per month** pre-automation | Bumblebee | 2025-12-17 |
| Bumblebee results | success 88% → **99%+**; eval time 35s → **8–12s**; token usage **−60%** | Bumblebee | 2025-12-17 |
| Security triage | ~**7–8 of every 10** SAST alerts were false positives; **750 hours → 2 hours** (~960x); L1 accuracy **75–80%** | Security Triage | 2026-06-09 |
| Hermes | **220** employee agents, ~**84** daily active; one instance logged **15,039 sessions in 8 weeks** (13,570 autonomous, 391 interactive); provisioning **<2 min**; **98 self-taught skills** | Hermes | 2026-07-12 |

### 4b. Incident and reliability culture (`FACT`)

The most substantive reliability signal is the **12 August 2021 outage**, which they narrate with unusual candour in "How an incident transformed Razorpay: building our Command Center":

> *"Around 6:50 pm, there was a sudden spike in alerts across the board… Such a scale of an incident was a first for Razorpay and it was truly a moment of panic and chaos… Teams were working in silos… 45 minutes had passed but there was no concrete answer from any engineering team as to what is causing this."*

What it produced (`FACT`):
- A **24x7 Command Center** team owning alert monitoring, conference-bridge convening, stakeholder comms, and incident chronology.
- Explicit metrics: **TTA** (Time To Acknowledge), **TTE** (Time To Engage), **TTR** (Time To Restore) — and later **MTTI** (Time To Investigate), which the 2026 Oncall Agent post argues is *"The Metric Nobody Optimizes For"*.
- An **Incident Commander** role; an **Incident Bot** that pages stakeholders, opens `#potential_outages` / `#outages` Slack channels, files Jira, and creates the Zoom room.
- A deliberate reform of the **5-Whys RCA format** (2022-07-17), and by 2026 an admission that RCA quality was still inconsistent: *"The 5-Whys section, arguably the most important part for organizational learning, was consistently the weakest."*

`INFERENCE`: reliability culture here is **process- and comms-led**, not chaos-engineering-led. The published artefacts are incident command structures, RCA templates, MTTI reduction, and proactive alerting ratios — not fault injection.

### 4c. Explicit gaps — do not fill these in

- **Payment TPS / peak transaction throughput: `EVIDENCE NOT FOUND`.** The only TPS figure published anywhere in the corpus is the **notification service** (2K ceiling / 1K peak, 2022) — that is a *notifications* subsystem, **not** the payment gateway. Do not extrapolate it to payments.
- **IPL / Diwali / Big Billion Days peak numbers: `EVIDENCE NOT FOUND`.** IPL, World Cup, festivals and "annual flagship sales by e-com" are named as *load drivers* in the notification post (2022-05-16) and Diwali appears as a *narrative device* in the CDP post — but **no peak traffic figure is attached to any of them** in any source I could reach.
- **Uptime / "five nines" / 99.99% SLA: `EVIDENCE NOT FOUND`.** `razorpay.com/payment-gateway` carries only the qualitative claim *"High success rate — Intelligent payment infrastructure that delivers high success rates across all payment methods."* No numeric availability commitment was found. The nearest numeric availability claim in the whole corpus is **frontend** crash-free sessions: *"Increased crash-free sessions to ~99.9X% (which was ~50% initially)"* (High Availability on Razorpay Payments Dashboard, 2022-03-14) — that is a **dashboard UI** metric, not API uptime.
- **Public incident postmortems: `EVIDENCE NOT FOUND`.** `status.razorpay.com` publishes live per-product status (Payments API, Checkout, Dashboard, Payment Link, RazorpayX Payouts, RazorpayX Payroll, …) with a 90-day history strip, showing "No recent incidents" across products at retrieval. It does **not** appear to publish written postmortems. The Command Center and RCA posts describe RCAs as **internal** artefacts.
- **Chaos engineering: `EVIDENCE NOT FOUND`.** No post, tag, or repo on fault injection, game days, or chaos tooling. The closest adjacent work is *"From Risk to Safety: Mastering Deployments with Shadow Analysis"* (2024-08-01) and *"Never have I ever gone live without perf"* (2023-01-18) — shadow traffic and perf testing, which is **not** chaos engineering.
- **Annual TPV figures: `EVIDENCE NOT FOUND`** (WebSearch budget was exhausted before newsroom/press-release sources could be checked).

---

## 5. Public Talks — `razorpay/public-presentations`

Repo: https://github.com/razorpay/public-presentations — 39★, no primary language, created 2021-03-30, Apache/none.

> **`FACT` — the curation is stale.** The last commit that added content was **2023-03-06** ("Add recent talks from the frontend team"). Everything after that is bot maintenance (`.cursorignore`, workflow files). The README's newest entry is **Dec 2022**, and it covers only 2020–2022. `INFERENCE`: Razorpay stopped maintaining its public-talks index over three years ago, even as the blog kept publishing. Do not treat this repo as a current picture of their conference presence.

**2022** (16 entries — heavily frontend-skewed): Algolia search in docs (Anshul Sahni); *Measuring the success of your design system* (Chaitanya Deorukhkar); *Razorpay Engineering's journey to microservices and ensuring data consistency* (Arjun Tomer); *The sorcery of building a cross-platform design system architecture* (Kamlesh Chandnani); *Calm down your overreactive forms with uncontrolled components* (Akash Hamirwasia); *Animations in React Made Easy!*; *Revamping Razorpay documentation website*; *How do we get a FOSS UPI mobile app* (Nemo); *IndiaFOSS: building Blaze as a FOSS project*; *endoflife.date recommendations*; *Composition over Context*; *Building SSG Around Vite Ecosystem*; *Say Hello to Open Source*; *Acing the JavaScript Interview*; a static-site-generators podcast; *Building a career in frontend development*.

**2021** (17 entries — the infra/payments-heavy year):
- **AI powered Smart routing for payments** (Aayush Gupta, Dec 2021) and **Dynamic Smart Routing for Payments** (Aayush Gupta & Ramya Bygari, Oct 2021) — *the only public payment-routing material found anywhere*.
- **KubeCon NA 2021: How we built a Cloud native Dev stack at scale** (Srinidhi, Venkat V) — the talk behind `devstack`.
- **Linux Open Source Summit: Improving Dev experience** (same authors).
- **Solving Metrics at scale with VictoriaMetrics** (Vaibhav Khurana, Bangalore Observability Meetup).
- Kong-hosted posts: *Simplifying PCI Compliance With Kong Gateway*; *Managing kong configurations using terraform*; *Deploying With Confidence Using Kong Gateway and Spinnaker*.
- **Boring AppSec weekly newsletter** (Sandesh Mysore Anand, Aug 2021–) — https://boringappsec.substack.com/
- *The Numbers Behind High Performing Engineering Teams* (Varun Achar); *Serverless: A Frontend Developer's Foot into the Cloud*; plus several community/career talks.

**2020** (5 entries): *How Razorpay Migrated from Monolith to Microservices* (Redis podcast); **Flink-powered model serving & real-time feature generation at Razorpay** (Shashank Agarwal, PDF in repo); **Authentication and Authorization for a Million Consumers at Scale Using Kong** (Abhishek Varshney, PDF in repo); *Logging the right way*; *Observability BLR Meetup*.

---

## 6. Targeted Topic Sweep (payment routing, retries, idempotency, reconciliation, ledger, fraud/ML, streaming)

| Topic | Verdict |
|---|---|
| **Payment routing** | **Thin but real.** Two 2021 talks — *AI powered Smart routing for payments* and *Dynamic Smart Routing for Payments* (Aayush Gupta, Ramya Bygari), links in `public-presentations`. Commercially this is their **Optimizer** product (`razorpay.com/optimizer-intelligent-payments-routing/`). `EVIDENCE NOT FOUND`: **no engineering blog post** on routing architecture. This is a notable content gap given it is a flagship capability. |
| **Retries** | Covered in two places. (a) Outbox job state machine: `pending → processing → {failed, deleted, retry_exhausted}` with a retry threshold (2021-11-16). (b) CI retry design: the `rerun-failed-jobs` engine plus a `spot-loss-checker` classifier that decides *whether a failure was retriable* by scanning runner logs for `√ Connected to GitHub`, catching *"95%+ of actual terminations"* — the post is explicitly about *"how to do retries without burning everything down"* (2026-08-05). |
| **Idempotency** | `EVIDENCE NOT FOUND` as a dedicated topic. The nearest thing is the two-phase Linked Payments design: *"we don't capture any payments until all authorizations in the chain succeed"*, with authorization reversal on partial failure and no merchant charge because nothing was captured (2026-04-08). That is a correctness/compensation pattern, not an idempotency-key writeup. |
| **Reconciliation** | Named as a **consequence to avoid**, never as a system. Denormalized Streaming Pt.1: *"Data has to be one hundred percent correct. A single event loss can result in the wrong fee or balance or payment status, resulting in reconciliation issues at the merchant's end."* `EVIDENCE NOT FOUND`: no post on a reconciliation engine. |
| **Ledger design** | **`EVIDENCE NOT FOUND`.** No blog post, tag, or repo on double-entry accounting or ledger architecture. Adjacent only: `go-financial` (amortization/interest math) and "split settlements" mentioned in passing in the Linked Payments post. This is the single largest gap relative to what a payments company might be expected to publish. |
| **Fraud / ML** | **Strong.** *Bumblebee* multi-agent merchant risk review (2025-12-17); *How does Razorpay Capital detect duplicate or fraud merchants* using Elasticsearch-based dedup/underwriting (2023-03-22); *Our obsession with merchant experience: breaking the risk review black box* (2026-02-11); *Flink-powered model serving & real-time feature generation* (2020 talk). |
| **Real-time streaming** | **Strong and the most technically detailed material in the corpus.** The three-part Denormalized Streaming Platform series (Mar–May 2023) is the deepest: CDC (Maxwell/Debezium) → Kafka → Spark Structured Streaming → Delta on S3, wrestling explicitly with mutable data, secondary-table updates against immutable S3 objects, rapid schema evolution, and 24h → <1h freshness. Plus Flink CEP for payment downtime detection (2021-11-24) and the CDP (2026-06-26). |

---

## 7. Relevance Notes

`INFERENCE` / `HYPOTHESIS` throughout this section — these are judgements, not sourced facts.

1. **They lead with cost, not scale.** Most payments companies market throughput; Razorpay's blog markets **dollars saved** ($2M, $300k, 62%, >60%, 70–90%). If you are pitching or building toward them, an efficiency framing is far better evidenced as resonant than a raw-scale framing. `INFERENCE`.
2. **The 2026 identity is agent-ops.** Ten of the last twelve posts are LLM/agent systems, all pointed at **internal engineering toil** — on-call investigation, RCA drafting, security triage, code review, merchant risk. Nothing published applies agents to the payment path itself. `INFERENCE`: there is an implicit trust boundary between "agents on our workflow" and "agents on our money", and it has not been crossed publicly.
3. **They publish failure honestly, which is rare and usable.** The Bumblebee post says *"We threw away two complete implementations"*; the Command Center post narrates panic and 45 minutes of no answers; the observability post lists rejected options (M3DB, Cortex, Thanos) with reasons. `INFERENCE`: technical arguments that acknowledge tradeoffs will land better than ones that don't.
4. **Go + Kubernetes is the safe assumption for anything new; PHP/Laravel is the legacy reality.** Any proposal touching the payment core must account for a monolith that still exists — their own cost post lists PHP and Java workloads as the ones they *could not* auto-optimize. `INFERENCE`.
5. **Do not judge their OSS by `pushed_at`.** `metro` (service bus) and `devstack` (KubeCon-featured dev platform) look active and are effectively **dormant since 2022**; `metro`'s README still promises a first release "soon". Genuinely alive: **blade**, **ifsc**, **i18nify**, **razorpay-cli**, **razorpay-mcp-server**, **trino-gateway**. `FACT` on the commit data, `INFERENCE` on the health call.
6. **`razorpay-mcp-server` (229★, official, Go) is the highest-signal AI-adjacent repo** and pairs directly with the internal agent posts. If a project needs an integration surface with Razorpay for agents, this is the sanctioned path, and it already contains "a tool generator skill for AI agents". `INFERENCE`.
7. **The biggest publishable gaps are ledger design, reconciliation, idempotency, and payment-routing architecture** — all core payments problems they demonstrably solve internally but have never written up. `HYPOTHESIS`: these are considered competitively sensitive (routing is a paid product, Optimizer). Any downstream plan that *assumes* published Razorpay prior art on these will be building on nothing.
8. **Two internal codenames leaked** via the unedited `[VERIFY: Vyom / Slash]` placeholder in the security-triage post: **Vyom** and **Slash**. A WebSearch result (not independently opened, so `HYPOTHESIS`) referenced a razorpay.com blog titled *"Razorpay Engineers Built Slash. Slash Builds the Rest."* describing Slash as an autonomous agent platform that writes code, opens and reviews PRs, and talks to 15+ internal systems. **Verify this before use** — I could not open the source.
9. **Blade is their most externally successful artefact** (649★, actively developed daily, own docs site, open-sourced Figma library, published RFCs). `INFERENCE`: design systems are where their OSS investment is genuinely sustained rather than announced.

---

## 8. Consolidated "EVIDENCE NOT FOUND" list

Do not treat any of these as established. Each was actively looked for and not confirmed:

- Payment-gateway TPS, peak throughput, or transactions/second figures of any kind.
- IPL / Diwali / Big Billion Days peak-traffic numbers.
- Any numeric uptime or availability SLA ("five nines", 99.99%) for Razorpay APIs.
- Externally published incident postmortems (status page shows status only, no writeups).
- Chaos engineering / fault injection / game-day practice.
- Ledger or double-entry accounting architecture.
- A reconciliation system writeup.
- A dedicated idempotency writeup.
- A payment-routing *engineering* post (talks exist; blog posts do not).
- Which LLM vendor/models power Bumblebee, Oncall Agent, RCA-GPT, or Hermes.
- The GitHub location of the "Freedom Finance Stack" ACS server (`freedomfinancestack` org returned 404).
- Annual TPV figures (WebSearch budget exhausted before newsroom sources were reachable).
- Blog posts published before 2021-06-04 (absent from the sitemap, though tag `lastmod` dates imply they exist).

---

## 9. Cross-verification addendum (added by coordinating agent, 2026-08-26)

Two items flagged above as unverified were independently confirmed by a parallel research pass. Details and full sourcing in `razorpay_ai_signals.md`.

**§7.8 "Slash" — HYPOTHESIS now upgraded to FACT.** The blog post exists: *"Razorpay Engineers Built Slash. Slash Builds the Rest."*, `https://razorpay.com/blog/razorpay-engineers-built-slash-slash-builds-the-rest/`, dated **2026-05-18**. Slash is an internal autonomous agent platform. Its **Slash Reviewer** is composed of specialised sub-agents each owning one dimension — bug detection, security, code quality, Razorpay design system, internationalization, pre-mortem — and each sub-agent **clones the repo and reads surrounding file context rather than working from the diff alone**. Reached via `@Slash` in Slack, ticket auto-assignment, and a GitHub CI trigger. This corroborates §1e's reading of the `[VERIFY: Vyom / Slash]` placeholder leak. **"Vyom" remains unverified.**

`INFERENCE`: §7.2's conclusion — that Razorpay has an implicit trust boundary between "agents on our workflow" and "agents on our money" — is **now contradicted on the customer-facing side.** See the next item.

**§7.2 "Nothing published applies agents to the payment path" — now superseded.** Razorpay ships **Agent Studio** (`https://razorpay.com/agent-studio/`, verified 2026-08-26), built on **Anthropic's Claude Agent SDK**, with live prebuilt merchant-facing agents: Dispute Responder, Subscription Recovery, Abandoned Cart Conversion, RTO Shield, RTO Insights, Settlement Insights, Cashflow Forecaster. Separately, **Vulcan** (2026-08-18) is a proprietary transformer foundation model for payments, in production.

The engineering *blog* has not covered these — which is itself the signal. `INFERENCE`: the agent-ops story is being told on the engineering blog (internal toil) while the customer-facing agent story is being told on product/marketing surfaces and press releases. Researching only the engineering blog produces a systematically incomplete picture of Razorpay's AI posture.

**§4c annual TPV — partially addressed.** The parallel product pass found Razorpay publishes *conflicting* merchant counts across surfaces (5M+ / 1.5M+ / "8M+ network"), while the CDP engineering post claims *"over 12 million merchants"*. `INFERENCE`: these figures are not reconcilable across sources and none should be quoted as authoritative.
