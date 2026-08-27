# 14 · Product plan — from working prototype to credible submission

Produced 2026-08-27, 9 days before the 5 Sept deadline.
Method: 5 independent research agents (design language · comparable product
surfaces · local winner-corpus mining · forensic built-vs-promised gap audit ·
feature/harvest research) followed by 3 adversarial critics (Razorpay-rubric
judge · feasibility attacker · design/product critic). Every load-bearing claim
was checked against this repo's own code, or fetched, or explicitly marked
UNVERIFIED.

| File | What it is |
|---|---|
| `FINAL_PLAN.md` | **Read this.** The 9-day plan: what's broken, what not to build, day-by-day, and the frontend spec. |
| `FINDINGS.md` | The evidence base. Gap audit, corpus statistics, Blade design tokens, the falsified harvest premise, and all three critiques in full. |
| `DRAFT_PLAN_superseded.md` | The pre-critique draft, kept so the corrections are legible. It was wrong about three material things — see below. |

## What the critique round changed

1. **Cut the 219-PDF harvest to n≥50.** Two critics killed it independently: one
   by fetching 18 PDFs (61% yield, **0/11 have a text layer**, `PROVENANCE.md`
   already said so), one by showing that harvesting *authorities* cannot create
   scored cases when `UNDETERMINED(abstained)=0`. Realistic yield: **+0**.
2. **The draft was ~112h against ~60 available.** Revised: ~54h with a free day.
3. **Ship the suppressed headline as the finding**, not as a wound. Against a
   corpus where **0 of 224 winners volunteer a weakness in their own best
   number**, a harness that refuses to flatter its author outscores a detection
   rate that cannot be honestly assembled in 9 days.

## The three findings that matter most

- `merchant/server.py:96` — `decide(req, block, "PASS", now)`. **The conformance
  verdict is a hardcoded string. The thesis is not wired to the money path.**
- `merchant/server.py:71` — caller JSON is splatted into gate state. **A
  caller-supplied bound is not a bound.**
- `make demo` twice produced two distinct real Razorpay orders, because
  `idem_key` goes into `notes`. **The idempotency guarantee is inert on the live
  path** — and that, not a stale test count, is `FAILURES.md` #7.

## Caveat on scope

Several sub-agents were killed by a process exit mid-research and said so rather
than inventing results. `FINDINGS.md` §3 (Indian fintech visual language, trust
psychology, policy-as-code UI genre) is INCOMPLETE, and §6 lists everything that
must be re-verified before it is cited anywhere public. Treat that list as
binding — this project's own failure log is six entries of what happens when a
confident restatement outruns its source.
