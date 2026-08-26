# H019 — Ethereum Foundation x402 Hackathon — TIER 2

- Organizer: Ethereum Foundation Developer Acceleration Team + x402 ecosystem (Coinbase, Edge & Node, Merit Systems, Abstract, Eigencloud, Crossmint, Polygon, thirdweb, Corbits, Ultravioleta DAO, Pinata)
- Dates: 8 Dec 2025 – 5 Jan 2026 | Virtual | No cash prizes (distribution, mentorship, grant leads)
- Official: https://www.x402hackathon.com/ (fetched 2026-08-26)
- Winner announcement: https://x.com/ethereumfndn/status/2012209845856796760 (~17 Jan 2026), plus secondary coverage (Bitget, Binance Square, RootData, Phemex)

## VERIFIED PLACEMENTS
| Placement | Team | Project | Problem | Solution | Repo | Evidence |
|---|---|---|---|---|---|---|
| Winner (named in EF thread) | Superfluid | **x402-sf** | x402 has no native recurring/continuous payment primitive | End-to-end internet-native **continuous subscription** payment infrastructure on x402 | NOT LOCATED | FACT (placement) / repo NOT FOUND |
| Winner (named) | — | **Cheddr Payment Channels x402** | High-frequency agent requests create too many on-chain txs | Payment channels for micropayment streaming | NOT LOCATED | FACT (placement) |
| Winner (named) | BackTrackCo | **x402r** | No refund path when a paid data service fails to deliver — agents have no recourse | Refundable-payments protocol + **arbiter**, giving agents/APIs a simple trust/dispute mechanism | https://github.com/BackTrackCo/x402r-sdk (TS, 1.9 MB, pushed 2026-08-17) · https://github.com/BackTrackCo/arbiter-examples (TS, 324 KB) | FACT |

Related verified third-party implementation: https://github.com/mrtinhnguyen/x402r-mcp (MCP server letting agents make x402 payments and use the x402r refund protocol; JS, 147 KB — THIN).

**Note:** the EF thread says "a handful of winning projects" — the list above may be incomplete. Full leaderboard NOT FOUND.

**Why it matters:** x402r is the only hackathon-winning project found anywhere that treats *refunds and dispute arbitration* as first-class payment protocol primitives. Directly transferable to Razorpay Track 02 (returns/chargebacks) and Track 03. x402-sf is the same for *failed/continuing subscriptions* (Track 03).
