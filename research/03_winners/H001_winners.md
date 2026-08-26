# H001 — Razorpay AI Buildathon 2026 (TIER 1)

- Organizer: Razorpay | Official URL: https://razorpay.com/buildathon/
- Dates: applications close 5 Sep 2026; program starts Sept 2026, Bengaluru, in-person
- Tracks: 01 AI Growth & Agentic Commerce · 02 AI Risk Manager · 03 AI Revenue Recovery · 04 AI Finance Controller · 05 Open
- Retrieved: 2026-08-26

## VERIFIED PLACEMENTS

**EVIDENCE NOT FOUND — no winners exist yet.** (FACT)

This is the *target* competition. It is a hiring funnel, not a ranked prize hackathon ("A student-only program to discover and hire our next generation of AI Builder Interns"; "The bar:" language per track). There is no 1st/2nd/3rd place and no public winner list, because the application window is still open as of 2026-08-26.

Source: https://razorpay.com/buildathon/ (official, retrieved 2026-08-26; snapshot in `research/00_competition_context/raw/`).

## COMPETITIVE INTELLIGENCE — IN-FLIGHT RIVAL SUBMISSIONS (NOT WINNERS)

`gh search repos "razorpay buildathon"` / `"razorpay hackathon"` returns 100+ public repos pushed 2026-08-20 → 2026-08-26 whose descriptions quote the official track names verbatim. These are **concurrent competitor submissions**, not verified winners, and must never be labelled as placements.

Full enumerated list (182 described repos across buildathon + adjacent queries): `/tmp/rzp_research/competitor_repos.tsv` (regenerate with the `gh search repos` sweep documented in MASTER_HACKATHON_INDEX.md).

Highest-signal examples (all `gh repo view` HTTP 200, 2026-08-26):
| Repo | Track | Signal |
|---|---|---|
| https://github.com/ektamishra4321/milaan-ai | 04 | claims P/R 1.000 on held-out ground truth; fine-tuned Qwen2.5-3B vs Gemini benchmark; deterministic audit-trail engine |
| https://github.com/Samyak17Jain/reconciliation-sentinel | 04 | 3-way recon (bank+ledger+GST) with adversarial self-audit tier |
| https://github.com/ch24btech11028-create/recoagent | 04 | deterministic solvers match, LLM explains only residuals, arithmetic replay validation |
| https://github.com/cloudavenue0012-creator/settlement-reconciliation-engine | 04 | recompute-and-diff + eval harness scoring against ground truth |
| https://github.com/JazR20/reckon | 04 | "a reconciliation agent whose product is knowing when to refuse" |
| https://github.com/Pranavsingh431/settlement-witness | 04 | evidence-first auditable payment-to-settlement recon |
| https://github.com/adityasingh1786/certus-ai-finance-controller | 04 | Double-Lock verification (deterministic + multi-model consensus), 14-day cash forecast, read-only MCP governance |
| https://github.com/gopal-labs/AI-Risk-Manager | 02 | XGBoost + SHAP + NetworkX fraud-ring viz + Gemini analyst case summaries |
| https://github.com/ayubeh1513/Payment-Fraud-Risk-Scorer-Razorpay-Buildathon | 02 | time-based split, cost-optimal thresholding, Groq LLM explanations |
| https://github.com/Akshay1267/revenue-recovery-agent | 03 | root-cause diagnosis + bounded action + audit trail + compliant stopping rules |
| https://github.com/aryanpajnee/RazorpayBuildathon | 01 | merchant transactable by an AI buyer agent under signed, bounded authority |
| https://github.com/Sansyuh06/KEOZ | 01 | merchant-side financial policy layer for agentic commerce |
