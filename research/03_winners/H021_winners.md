# H021 — SF Agentic Commerce x402 Hackathon — TIER 2

- Organizer: SKALE Network (hybrid SF hub + global online), partner tracks from **Coinbase, Google, Virtuals**
- Date: Feb 2026 (recap published week of 25 Feb 2026) | $50k+ prizes | 324 registered, 86 submitted
- Tracks: Overall Best Agentic App · SKALE Track · Coinbase Track (Agentic Tool Usage on x402) · Virtuals Track (Trading/DeFi/AI Agent) · **Google Track (Best Integration of AP2)**
- Winner source (read directly with a browser): https://skale.space/blog/san-francisco-agentic-commerce-x402-hackathon-recap-winners
- Also indexed: https://dorahacks.io/hackathon/x402 (report page returns HTTP 405 to automated fetch)

## VERIFIED PLACEMENTS
| Placement | Team | Project | Problem | Solution | Tech | Repo | Evidence |
|---|---|---|---|---|---|---|---|
| **1st — Google Track, Best Integration of AP2** | RequestTap | **RequestTap** | Every API needs bespoke integration work to accept per-call USDC/x402 payments from agents; no drop-in router exists | Open-source **x402 API router** turning any existing API into a pay-per-request service for agents, with an adapter and an MCP server component | TS/Node, x402, MCP | https://github.com/RequestTap/RequestTap-Router (3.6 MB, 2★, 2026-02-14) · https://github.com/RequestTap/RequestTap-Adapter (2.0 MB) · https://github.com/RequestTap/RequestTap-MCP (17 KB, stub) | Placement FACT (official recap); repo attribution INFERENCE (org name + description + date match) |
| **2nd — Coinbase Track, Agentic Tool Usage on x402** | pincerclaw | **Pincer** | Agents hitting x402-paywalled APIs get blocked by per-call fees even when a sponsor would subsidise that call | Ad-subsidy protocol / "x402-sponsored access flow" converting advertiser budgets into task subsidies, matching sponsors to cover data fees in real time | Python | https://github.com/pincerclaw/pincer-x402-starter (4.2 MB, 2★, 2026-02-10) | Placement FACT; repo attribution INFERENCE |
| **2nd — Virtuals Track, Best Trading/DeFi/AI Agent** | Legasi | **Legasi** | Agents transacting via x402 have no credit history or reputation, so every payment must be pre-funded | Credit + reputation layer for agents: credit lines, x402 payments, yield on idle funds, on-chain reputation scoring | — | `legasicrypto/skale-hackathon` exists (TS, 1.7 MB, 2026-02-13, "Legasi — SKALE x402 Hackathon (EVM port)") but its description does not clearly match the Virtuals-track project → treat as **UNCONFIRMED match** | Placement FACT; repo NOT CONFIRMED |

## ⚠ SOURCE DISCREPANCY — RECORD IT, DO NOT AVERAGE IT
A search-engine summary of the same SKALE recap reported **"1st Place: World of Geneva; 2nd Place: Legasi"** (an MMORPG where AI agents autonomously play). A direct browser read of the recap produced the per-track list above and did not surface World of Geneva. Both readings are of the *same* article. The direct browser read is the stronger evidence, but the overall/SKALE-track placements remain **unresolved**. Do not cite either as settled.

## OTHER VERIFIED SUBMISSION REPOS (self-tagged this event, not in the winner list)
- https://github.com/qorexdevs/Verix — marketplace where agents discover, hire and pay each other in USDC
- https://github.com/Outlier1217/skale-agentic-ai-escrow-commerce — AI risk assessment + smart-contract escrow + wallet identity
