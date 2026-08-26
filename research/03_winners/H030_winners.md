# H030 — DevNetwork [AI + ML] Hackathon 2026 — TIER 3

- Organizer: DevNetwork (@ AI DevSummit 2026) | 11–28 May 2026 | South San Francisco Conference Center + online
- Official: https://devnetwork-ai-ml-hack-2026.devpost.com/ | Gallery: /project-gallery

## VERIFIED PLACEMENTS
| Placement | Team | Project | Problem | Solution | Tech | Repo | Evidence |
|---|---|---|---|---|---|---|---|
| **Overall Winner** | Mukunda Katta | **crusoe-nemotron-harness** | Production agent deployments have no unified cost / latency / failure / budget observability | Single context-manager facade wrapping agents with cost tracking, **tool-failure detection**, network-allowlist compliance, token usage, snapshots and **budget caps**; "60 tests under 0.1s"; zero runtime deps | Python 3.10+, OpenAI-compatible API, NVIDIA Nemotron | https://github.com/MukundaKatta/crusoe-nemotron-harness (Python, 35 KB, 1★, pushed 2026-06-13) | FACT |
| **Winner — TrueFoundry Resilient Agents Challenge** | Hokuto Torigoe (solo) | **Aegis — A Resilient AI Agent Runtime** | LLM gateways pass `credit_balance_too_low` (HTTP 400) through as a client error instead of failing over, causing **payment/inference outages** | 7-layer resilience runtime: hedge racing, exponential backoff, model fallback, provider fallback, gateway bypass, semantic error detection, graceful degradation, continuous **chaos testing**; every response carries a signed **"Aegis Receipt" audit trail** | Bun/TypeScript strict, Hono, OpenAI SDK/Agents SDK, MCP SDK, **Toxiproxy** chaos testing, Zod, TrueFoundry AI Gateway | https://github.com/Hokutoman00/aegis-resilient-agents (TS, 97 KB, pushed 2026-05-28) | FACT |

**Why both matter:** these are the two clearest examples in the whole dataset of *reliability engineering* winning a hackathon rather than a flashy demo — exactly the "defend it in front of a panel" property the Razorpay Buildathon selects for. Aegis's failure taxonomy + signed receipts is a directly liftable pattern for Track 03; crusoe-nemotron-harness is a liftable eval/observability harness for any track.
