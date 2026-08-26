# H023 — AWS AI Agent Global Hackathon — TIER 3

- Organizer: AWS + Devpost | submissions to 20 Oct 2025; winners announced 5 Dec 2025 at re:Invent | Global/online | $45,000 prize pool
- Official: https://aws-agent-hackathon.devpost.com/
- Winner announcement: https://aws-agent-hackathon.devpost.com/updates/38140-congratulations-to-the-winners-of-the-aws-ai-agent-global-hackathon (fetched 2026-08-26)

## VERIFIED PLACEMENTS
| Placement | Team | Project | Problem | Solution | Tech | Repo | Evidence |
|---|---|---|---|---|---|---|---|
| 1st overall | — | EcoLafaek | Waste management in Timor-Leste | Citizen reporting app + autonomous Bedrock Nova-Pro agent chaining tools via AgentCore | Bedrock Nova-Pro, AgentCore | https://devpost.com/software/ecolafaek | not checked (out of domain) | FACT |
| 2nd overall | Greg Kleine | **AegisAgent** | Insurance-claim evidence scattered across photos, invoices, forms, policy docs | 3 agents — evidence extraction/normalisation, policy-clause mapping, **adversarial challenger** — with an orchestrator running debate rounds until consensus or more evidence needed; produces transparent, **audit-friendly** coverage decisions | Bedrock, Nova Pro, Titan, FastAPI, FAISS, App Runner, Docker/ECR | NO_PUBLIC_REPOSITORY (demo: https://3vhp3hyhxz.us-east-1.awsapprunner.com/) | FACT |
| 3rd overall | Anh Lam | **Province** | US tax filing is confusing (DIY) or expensive ($300-500 CPA) | AI-native tax agent: extracts W-2/1099, auto-fills IRS Form 1040 — **100% accuracy across 141 fields** via agentic field mapping with no manual config — explains calcs in plain English | Next.js 15, FastAPI, Bedrock Claude 3.5 Sonnet v2, Bedrock Data Automation, Strands SDK, DynamoDB, ElasticSearch, EventBridge, AWS CDK, PyMuPDF | NO_PUBLIC_REPOSITORY (live: https://www.provincetax.com) | FACT |
| Best Bedrock AgentCore Implementation | Kaushik Dey, Saurav Jalan, Mridhula Sridhar | **AI-driven multi-agent fraud alert triage system** | Fraud monitoring emits thousands of daily alerts, **>90% false positives**, swamping compliance teams | Alert-Triage agent (Athena enrichment, allowlists, multi-layer risk scoring → dismiss / review / escalate); Investigation agent (entity-level analytics, fraud typologies); Report agent (structured SARs to S3); React analyst UI whose feedback continuously refines accuracy | Bedrock, Bedrock AgentCore, **LangGraph**, Athena, Lambda, API Gateway, S3, Python | NO_PUBLIC_REPOSITORY | FACT — **the single closest published analogue to Razorpay Track 02** |
| Best Amazon Q Application | Nikhil Tale +1 | Compliance Guardian AI System | Manual compliance audits are slow and catch violations late | Agent scans cloud infra, DBs and code repos for violations; LLM interprets regulatory requirements | Python, Lambda, Bedrock Claude 3.5 Sonnet/Nova, FastAPI, Redis, DynamoDB, pytest/Coverage | https://github.com/Unknown1502/Compliance-Guardian-AI (Python, 1.8 MB, pushed 2025-10-19) | FACT |
| Best Amazon Bedrock Application | — | Oratio | — | — | Bedrock | https://devpost.com/software/oratio | FACT (placement) |
| Best Amazon Nova Act Integration | — | Drishti AI Navigator | — | — | Nova Act | https://devpost.com/software/drishti-ai-navigator | FACT (placement) |
| Best Strands SDK Implementation | — | AgentShell | — | — | Strands SDK | https://devpost.com/software/agentshell-from-model-context-to-control | FACT (placement) |

**Pattern worth stealing (INFERENCE):** the two most Razorpay-relevant winners (fraud triage, AegisAgent) both won by *reducing analyst workload with an explicit action taxonomy* (dismiss/review/escalate; covered/not-covered-with-reasons) plus an adversarial or feedback loop — not by scoring better. Province won by publishing a hard accuracy number on a fixed batch (141/141 fields).
