# H036 — ETHGlobal Lisbon 2026 — TIER 2/3 ★ RICHEST SOURCE OF AGENT-PAYMENT POLICY PATTERNS

- Organizer: ETHGlobal | 24–26 Jul 2026 | Lisbon, Portugal
- Relevant sponsor tracks: **Hedera "AI & Agentic Payments on Hedera"**, The Graph "Best AI Tooling", World AgentBook, 0G agent tooling
- Showcase: https://ethglobal.com/showcase (project pages carry an explicit "WINNER OF" badge)

## VERIFIED PLACEMENTS (badge-confirmed)
| Placement | Team | Project | Problem | Solution | Tech | Repo | Links | Evidence |
|---|---|---|---|---|---|---|---|---|
| **1st — Hedera "AI & Agentic Payments"** | dhernz | **Glassbox402** | x402 API monetization has no observability layer: operators can't see revenue/usage across chains, and there is **no auditable record that a settled payment matches the service delivered** | npm package `x402ify` wraps any API in an x402 paywall; settles across Hedera/Base/Solana; **every payment writes a receipt to Hedera Consensus Service** so the dashboard is auditable against an independent on-chain record rather than trusted; differential pricing for humans (World ID) vs agents | Node.js/Hono, x402ResourceServer, HTTPFacilitatorClient, Hedera HCS + blocky402 facilitator, World ID v4 | https://github.com/dhernz/Glassbox402 (HTML, 1.2 MB, 1★, 2026-07-26) | https://ethglobal.com/showcase/glassbox402-qyepd · video https://youtu.be/yFHJIv2xSRU | **FACT** ("WINNER OF" badge on official showcase) |
| **3rd — The Graph "Best AI Tooling"** | ikodo0 | **deeptrace** | Risk analysts must join macro market data with micro wallet-level behaviour to spot anomalies; these sit in separate silos | Read-only **MCP server** joining The Graph's Messari subgraphs (Uniswap V3, Aave v3, Seamless, Moonwell) with a custom Base indexer for wallet/swap data, exposed as MCP tool calls for LLM-driven analysis | Node/TS, GraphQL, Zod, **Vitest**, MCP SDK | https://github.com/ikodo0/deeptrace (TS, 753 KB, 1★, 2026-07-26) | https://ethglobal.com/showcase/deeptrace-7fqoz | **FACT** (badge) |

## HIGH-RELEVANCE SUBMISSIONS (verified repos, placement not claimed)
These are the densest cluster of *agent spend-policy* implementations found anywhere in this research. None is a confirmed winner — all are real, verified code.

| Project | Pattern | Razorpay track | Repo |
|---|---|---|---|
| **PlanBound** | shop → quote → **single human approval** → scoped account → **re-check price at execution time** | 04 / 02 | https://github.com/idoamram/planbound (TS, 11 MB) |
| **0g-permissions** | ERC-4337 smart account with on-chain permission grants and a **kill switch** | 02 / 04 | https://github.com/sairammr/0g-permissions (Solidity, 813 KB) |
| **HumanMandate** | Daily spend caps, human-bound revocation, **step-up auth**, custom-error policy enforcement, deployed to mainnet | 02 | https://github.com/LingSiewWin/HumanMandate (TS, 1.4 MB) |
| **Kinora** | LLM parses licensing terms into **machine-enforced rule gates** + identity verification | 01 | https://github.com/SweetieBirdX/Kinora (TS, 4.5 MB) |
| **Ask Trivium** | **Multi-LLM adjudication panel for disputed agent-to-agent transactions** — x402 has no chargeback primitive | 02 (disputes) | https://github.com/jaybuidl/ask-trivium-hackathon (TS, 421 KB) |
| **Hourglass** | Safe-based **bounded, revocable delegations for recurring operations** | 03 (subscriptions) | https://github.com/intuition-box/Hourglass (44 MB, 3★) |
| **Joule** | ERC-20 work-claim token, escrow custody + delivery clock + **onchain verifier burn** (verify before settle) | 03 / 02 | https://github.com/jfsgomes/joule (TS, 1.6 MB) |

## EVIDENCE NOT FOUND
Winner lists for **all other ETHGlobal events in window** (Agentic Ethereum Feb 2025, Prague, Cannes 2025/2026, New York 2025/2026, Buenos Aires, New Delhi, ETHOnline 2025). `/events/<slug>/prizes` renders track *rules*, not winner names, and the `/showcase` search UI returned the same ~32 most-recent-event projects regardless of query. Recorded as a tooling limitation, not an absence of winners.
