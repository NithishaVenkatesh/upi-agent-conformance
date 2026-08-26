# H016 — Agentic Commerce Hackathon 2026 (Prava) — TIER 2 ★ HIGHEST-RELEVANCE NON-RAZORPAY EVENT

- Organizer: **Prava** (pravapayments). Sponsors/partners: **OpenAI, Visa**, Linq, Localhost, Project NANDA, Senso
- Dates: 31 Jul – 2 Aug 2026 | Online (Devfolio) | Prize pool **$88,300** (OpenAI $48k, hackathon $15.8k, Senso $7.5k, Linq $6k, Visa $5k, Localhost $5k, Project NANDA $1k)
- Judges: Justin Leung (Visa), Harshit Marwah (OpenAI), Ramesh Raskar (MIT)
- Scale: 3,500 applicants → 400 builders → 160+ submissions
- Official URL: https://agentic-commerce.devfolio.co/overview (fetched 2026-08-26, HTTP 200)
- Winner source: https://36taransingh5-dotcom.github.io (1st-place winner's own portfolio — **self-reported**, not an organizer leaderboard)

**Why it matters:** this is the closest live analogue to Razorpay Track 01. Every submission had to make an AI agent *discover, decide and complete a real transaction* on a payments API under bounded authority — exactly the Buildathon Track 01 framing. The submission corpus is public on GitHub and unusually engineering-dense (mandates, scoped tokens, autonomy gates, refusal behaviour).

## VERIFIED PLACEMENTS
| Placement | Team | Project | Problem | Solution | Tech | Repo | Demo | Evidence |
|---|---|---|---|---|---|---|---|---|
| **1st overall** ($2,000 Visa cash + $3,000 OpenAI credits) | Taran Pal Singh (Univ. of Southampton) | **Parch** | Founders burn time researching vendors and vetting merchant trustworthiness before buying | "AI procurement employee": researches vendors, trust-checks merchants, *defends* a recommendation, then completes purchase via Prava once the human approves | Next.js, TypeScript, Prava SDK, Supabase, Tailwind | https://github.com/36taransingh5-dotcom/Parch (verified: 131 KB, TS, pushed 2026-08-03; README states "Originally built at the Prava Hackathon 2026") | https://parch-eta.vercel.app | FACT that the repo + self-reported award exist and are internally consistent with Devfolio's public prize/judge data; the **placement itself rests on a single self-reported source** — MEDIUM |
| Reported 2nd | @daiwik_mhi | JustDM | — | — | — | NO_PUBLIC_REPOSITORY | — | INFERENCE — UNVERIFIED |
| Reported 3rd | Shivang + Nilufa | Tokko | — | — | — | NO_PUBLIC_REPOSITORY | — | INFERENCE — UNVERIFIED |
| Reported 4th | @0xRowbo | Rowbo | — | — | — | NO_PUBLIC_REPOSITORY | — | INFERENCE — UNVERIFIED |
| Reported 5th | — | Toki | — | — | — | NO_PUBLIC_REPOSITORY | — | INFERENCE — UNVERIFIED |

> Placements 2–5 come from a secondary search summary. `x.com/pravapayments` returned HTTP 402 and Devfolio publishes no leaderboard. **Do not cite 2–5 as fact.**

## VERIFIED SUBMISSION REPOS (placement unknown, engineering strong)
These were submitted to this hackathon (self-declared in repo description) and all resolve HTTP 200. They are *not* verified winners, but several are architecturally closer to the Razorpay tracks than most confirmed winners elsewhere.

| Repo | Idea | Razorpay track |
|---|---|---|
| https://github.com/Soham109/sutra | GMP/1 "Group Mandate Protocol" — multi-principal group payments, N people / N cards / one atomic-enough commit (30 MB, 11★) | 01 |
| https://github.com/aayushdixit27/par-purchasing-agent | PAR — autonomous purchasing agent that **refuses when the listing is lying** (16 MB) | 02 / 01 |
| https://github.com/JackyCufe/pagerpay | On-call incident agent that can spend safely: Prava envelopes, **four autonomy gates**, adversarial cross-model review | 02 |
| https://github.com/KaranSinghBisht/accord | "Intent firewall" gating card issuance to matched intent | 02 |
| https://github.com/ishikatyagi-star/Strike | Conditional purchase **mandates** on Prava rails | 01 |
| https://github.com/EndPx/trimbot | Usage-decay **subscription downgrade** agent, iMessage + scoped payment tokens | 03 |
| https://github.com/phllp-tanstic/Intara | Price-capped renewal-decision agent | 03 |
| https://github.com/22f3003301/posy | Gifting concierge, OpenAI agent + Prava **one-time Visa tokens** | 01 |
| https://github.com/predgeAI/x402-prava-bridge | Bridges x402 wallet-only APIs to card rails | 01 / Open |
| https://github.com/devpras22/kusushi | Pharmacy procurement agent (6 MB) | 01 |
| https://github.com/hkarekar403/TravelGuard24 | Agent-driven travel booking + Prava payments adapter | 01 |
| https://github.com/omkar-103/supplysaathi | Voice procurement agent building a credit history (869 KB) | 04 / 01 |
| https://github.com/samratdebnath-programmer/Nexis-Agentic-Commerce-Core | "Agentic Commerce OS" — **LIKELY STUB** (34 KB) | 01 |
