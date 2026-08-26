# H029 — MCP – AI Agents Hackathon (Creators Corner) — TIER 3

- Organizer: Creators Corner, hosted at AWS Builder Loft | 19 Sep 2025 | San Francisco + online | ~$50K sponsor prizes, 56 submissions
- Official: https://mcp-ai-agents-hackathon.devpost.com/ | Gallery: https://mcp-ai-agents-hackathon.devpost.com/project-gallery
- Sponsor prize categories: Bright Data, LlamaIndex, Redis VL, Horizon3.ai, HoneyHive, etc.

## VERIFIED PLACEMENTS
| Placement | Team | Project | Problem | Solution | Tech | Repo | Evidence |
|---|---|---|---|---|---|---|---|
| **Winner — Redis VL Innovator** | Sinchana Gupta Garla Venkatesha (solo) | **Invoice Agent (X12 → ERP)** | Manual EDI 810 invoice processing into ERP is slow and error-prone | Parses EDI 810 invoices → validates against business rules → enriches vendor data → computes **anomaly scores** → posts to ERP (**live or dry-run**) → Streamlit dashboard → **voice-based approval (HITL)** | Python, Streamlit, SQLite, Redis vector similarity, Pandas, Apify, Gladia STT, Docker | https://github.com/sinchana-gv/invoice-agent-x12-starter (Python, 8.6 MB, 1★, pushed 2026-02-24) | FACT — **direct Track-04 analogue** |
| Winner — Best Bright Data MCP + Best Horizon3.ai | George Ishaq, Godson Ajodo, Ian Wafula | Auto_Sec | Manual CVE triage/remediation across repos | Multi-agent pipeline (scout / scanner / triage) that searches CVEs, scans repos, opens issues and PRs with fixes | Python, Flask, LlamaIndex, Redis vector search, GPT-4 + embeddings, PyGithub, Bright Data MCP, Docker | https://github.com/georgeIshaq/Auto_Security (Python, 346 KB, 3★) | FACT |

**Why Invoice Agent matters:** it is the only verified hackathon winner found that implements the exact Track-04 loop — structured document ingest, deterministic rule validation, anomaly scoring on the residual, a **dry-run mode**, and a human approval gate before posting to the system of record.
