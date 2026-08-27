# DRAFT PLAN — from broken implementation to credible product
Razorpay AI Buildathon · Track 01 · deadline 5 Sept 2026 (9 days) · solo student builder

## 0. STRATEGIC VERDICT

The rubric (recovered verbatim from Razorpay's JS bundle) is four equal pillars:
problem taste · build quality · AI judgment · failure recovery.
"No mention of novelty, model choice, UI polish, or scale."

Corpus evidence (n=224 winner repos + 261-repo live field census):
- 0/224 use their own stdout as a proof anchor
- 0/224 volunteer a weakness in their own best number
- 0/45, 0/58 ship an ablation; 0/10 in the live field ablate
- 1/224 has a systematic failure taxonomy
- winners vs losers: architecture words 135 vs 133; losers MORE likely to have an
  architecture section; rho(repo size, arch words) = 0.12
- 25% of live winner repos have NO human-written documentation at all
- The biggest frontend in the live field (VeerGetGit, React+Vite, node_modules
  committed) is classified "theatre": 0-byte evals/__init__.py, zero assertions,
  prints "Payment successful!" for an unpaid order. Demo score 4/10.
- The competitor rated highest ("the closest thing in the field") has 28 tracked
  files and NO frontend.

=> A frontend is NOT the leverage. It is worth ~zero directly. Its only defensible
   justification is as a CAMERA INSTRUMENT for the mandatory 5-min video, and as
   proof of "does it run".

THE ACTUAL LEVERAGE, in order:
  P0. The repo has drifted from itself 6 more times. Fix, and harvest as narrative.
  P1. The thesis is not wired to the gate. Wire it.
  P2. The money path cannot survive a restart or a concurrent request. Fix it.
  P3. Close the eval gap to n>=50. The CDX index already exists — this is 1 day, not 3.
  P4. Minimal camera instrument, Blade tokens, zero deps.
  P5. Record the video early.

## 1. P0 — INTEGRITY (day 1, ~4h). Non-negotiable, do first.

The audit found ARCHITECTURE.md/README.md drifted from the code SIX times:

| Claim | Reality | Fix |
|---|---|---|
| "95 tests, 85% coverage" | 101 tests, 56% coverage | Print from CI, never hand-type |
| make demo "~2s, no network" | live Razorpay call; contradicted 30 lines later same file | Split: `make demo` offline default, `make demo-live` opt-in |
| "make demo output, verbatim" | shows ALLOWED + retry_not_permitted lines demo.py never prints | Generate the block from real stdout in CI |
| README "two clause-cited refusals" | one | Add the retry refusal scene (it's real, just unwired) or fix the text |
| RECONCILE_PENDING in failure table | string exists nowhere in repo | Implement it (P2) or delete the row |
| "Ledger tamper -> refuse all authorisation" | Ledger.verify() has NO caller in money path | Implement the caller (P2) or delete the row |

RULE TO ADOPT: every number in a doc must be generated, not typed.
Add `make docs-check` that regenerates the test count, coverage %, and the demo
transcript, and fails if the committed doc disagrees. This is `self_conformance.py`
pointed at prose instead of code — a direct, literal extension of the thesis.

NARRATIVE VALUE: this is FAILURES.md #7. The project built to catch restatements
that outran their source shipped six of them in the document arguing the thesis.
"The last one is the one we read first" — this is the strongest possible content
for that box, and no competitor can manufacture it.

## 2. P1 — WIRE THE THESIS (day 1-2, ~6h). The single most important code change.

merchant/server.py:96 —  `d = decide(req, block, "PASS", now)`
The conformance verdict is a HARDCODED STRING. gate/decide.py:42-45
(counterparty_not_conformant) is unreachable in production. The engine, the corpus,
the citations all work and NOTHING CONNECTS THEM TO THE MONEY PATH.

Fix:
1. At create_checkout, read the counterparty's declared_constraints (from their UCP
   profile, or ours for the demo), run conform.check_claim against the claim store,
   store the Verdict on the checkout.
2. At complete_checkout, pass that real verdict into decide().
3. Cache the verdict keyed by (counterparty_doc_sha256, store_version,
   extractor_version) — all three already recorded, so it is reproducible.
4. Add a demo scene: point the merchant at a NON-CONFORMANT counterparty profile
   (Cashfree's "Rs.10,000 per month") -> the gate refuses with
   counterparty_not_conformant, quoting OC-228.

This turns the project from "two systems in one repo" into one system. It is also
the scene that proves the thesis on camera.

## 3. P2 — MAKE THE MONEY PATH SURVIVABLE (day 2-3, ~10h)

G1. In-memory state + real Razorpay orders = restart -> double charge.
    Fix: SQLite (stdlib `sqlite3`, no dep). Tables: checkouts, blocks, idem_keys.
    checkout.py:48 already reasons about crash-safety then relies on a dict.
G2. Zero locking. ThreadingHTTPServer + shared mutable state.
    - Ledger append is read-all/compute/append/overwrite-head, non-atomic. Two
      concurrent appends produce HEAD count mismatch = INDISTINGUISHABLE FROM A
      TAMPER ATTACK. This directly undermines the tamper suite's credibility.
      Fix: fcntl.flock on the ledger file + atomic rename for .head + fsync.
    - TOCTOU double-spend: remaining_minor decremented AFTER the gate check.
      Fix: single SQLite transaction, check-and-decrement atomically.
    Add the two concurrency tests that currently do not exist.
G3. CLIENT SUPPLIES THE BLOCK. server.py:71 splats caller JSON into gate input.
    An agent sends {"block":{"remaining_minor":999999999}} and walks past the cap.
    Fix: block state is SERVER-AUTHORITATIVE. Caller may request a block; server
    derives max/remaining/expiry/retries from its own store. Never trust the caller.
    This is arguably the most embarrassing finding for a payments reviewer.
G4. RECONCILE_PENDING: implement. Append to ledger AFTER capture, and on append
    failure mark the block RECONCILE_PENDING and refuse further authorisation.
    Currently the append happens BEFORE capture, so order_id never enters the ledger
    — the log records that authorisation was granted, not that money moved.
G5. Ledger.verify() must be called in the money path. Tampered ledger -> refuse.
G6. Razorpay client errors escape the JSON-RPC layer -> 500 + Python traceback.
    Catch RuntimeError/URLError; return a structured JSON-RPC error.

## 4. P3 — CLOSE THE EVAL GAP (day 3-4, ~12h). The declared largest gap.

make eval currently exits 2: 8 scored, positive class = 2. MIN_N = 50.

THE KEY UNLOCK: corpus/npci/cdx_all.txt already contains 288 lines / 219 distinct
NPCI circular PDF URLs with working Wayback timestamps. Direct npci.org.in is 403
(Imperva) but web.archive.org/web/{ts}id_/{url} was verified returning real PDFs
today. Document discovery is SOLVED. The bottleneck is labelling, not finding.

Pipeline:
  Stage 0 fetch 219 PDFs via Wayback, ~1 req/2s, SHA-256 on write      ~1h
  Stage 1 regex prefilter to constraint-bearing pages (Rs|days|per txn
          |maximum|cap|shall not exceed) -> ~60-90 circulars survive    ~2h
  Stage 2 extract/llm.py over the shortlist -> candidate claims         ~2h
  Stage 3 HAND ADJUDICATION at 8-15 claims/hr  <-- the real cost        ~6h (TIMEBOX)
  Stage 4 declared side: extend eval/probe_cases.py to more mandate
          params; PSP docs via sitemap.xml/llms.txt                     ~4h

Realistic yield: 45-70 authoritative claims, 50-80 scoreable cases. n>=50 IS
reachable — but ONLY because the CDX index exists.

ALSO FIX (undeclared, found by audit):
- eval/cases.py:107-112 wraps the ONLY source of positive cases in a bare
  `except Exception: return []`. Any bug/ratelimit silently -> VACUOUS, and the
  harness then blames its own corpus for a swallowed exception. Make it LOUD.
- probe() fires ~30 live order-creation calls on every `make eval`. Undeclared,
  unrated, uncached. Cache to eval/probe_findings.json and READ it (currently
  written by __main__ only, never read by harvest()).
- "Ablation: harm reported in RUPEES" is promised in ARCHITECTURE.md and does not
  exist. induced_harm is a COUNT. Add the rupee figure — it is the pillar-3 line item.
- Blind re-label a 20% sample, publish the disagreement rate. An unaudited
  hand-label set is itself a restatement.

## 5. P4 — THE CAMERA INSTRUMENT (day 5-6, ~14h). Deliberately minimal.

CONSTRAINT: zero new dependencies. Server-rendered HTML strings from the existing
stdlib http.server. Blade TOKENS as CSS custom properties (MIT). NOT Blade React.
Adding npm/Vite would directly attack the "does it run" pillar the backend was
deliberately designed around.

The data models are ALREADY the UI: Decision(allowed,code,clause,quote,circular,
detail), ledger {seq,prev_hash,payload,hash} + HEAD{count,head}, and Report(...).
This is a rendering layer, not a feature build.

BUILD ONLY THIS SPINE (the one thing no comparable product has):
  refusal -> clause anchor -> circular text + its SHA-256 -> ledger entry -> `make verify`

| # | Screen | Hrs |
|---|---|---|
| 1 | /decision/<id> — every gate check in order, which fired, its clause+quote. Requires refactoring decide() to accumulate a checks[] trace instead of early-returning. | 5 |
| 2 | /circular/OC228#5 — corpus text, per-clause anchors, doc SHA-256. Every quote deep-links here. Converts citation from decoration into something checkable. | 3 |
| 3 | /ledger + /ledger/<seq> — prev_hash -> hash drawn as an actual rule between rows; genesis anchor; HEAD commitment. | 4 |
| 4 | "Verify this yourself" block — copyable exact commands + hashes to compare. Highest credibility per hour in the list. | 1 |
| 5 | /eval — Report fields; headline_suppressed rendered as a FIRST-CLASS HERO STATE, not an error. | 4 |

Design direction: "Circular" — near-achromatic, border-separated document surface.
- Fonts: TASA Orbiter (headings, OFL/free, Razorpay's actual brand face) + Inter
  (body) + JetBrains Mono (hashes — slashed zero, disambiguated 1/l/I 0/O)
- Colour: the ONLY saturated colour in the whole UI is the verdict.
  #D01E11 refuse / #008F47 allow. Accent #1364F1 for links+focus ONLY.
- Borders not shadows (Blade light shadows are all 6% alpha). 0.5px hairlines.
- Radius 4 on data surfaces, 8 on cards. Never 16-24.
- font-variant-numeric: tabular-nums lining-nums EVERYWHERE numbers appear.
- Light mode default. Vulcan (Razorpay's AI page) is 6 achromatic + one #8FBFFF.
- Motion: Blade's easings. `shake` ONCE on the refusal. Never `overshoot`.

BANNED: violet/purple gradients, glassmorphism, heavy shadows, dark-mode-default,
Inter-only, shadcn defaults, emoji in verdicts/ledger, large radii on data, hero
percentage with no denominator, hiding failures behind a toggle, paraphrasing or
ellipsing a regulatory quote.

## 6. CUT LIST — do not build

- Any npm/React/Vite frontend (attacks the graded "does it run" pillar)
- Policy editor / rule authoring UI (the policy is an NPCI circular; an editor
  contradicts the entire thesis)
- Merkle inclusion-proof visualiser (ledger is a LINEAR chain; building a tree to
  justify a graphic is a feature invented to serve a screen)
- %-complete donut charts (a percentage over n=3 is exactly the dishonest headline
  eval/harness.py refuses to print — self-refuting)
- Trace waterfall with latency/cost spans (money path is a pure function, no
  network, no clock; a latency waterfall of that is theatre)
- Impact analysis / replay-against-history (would replay ~5 demo rows)
- Annotation queue, dataset versioning UI, auth/multi-tenancy/RBAC, websockets
- Browser extension, fine-tuned extractor, x402, blockchain anchoring
- Full NPCI UAP implementation (UNVERIFIED that anything is published; claiming to
  implement an unpublished spec IS the drift being indicted)
- Benchmark vs Razorpay Vulcan (UNVERIFIED it is accessible)

## 7. OPTIONAL, IF TIME (day 7)

- pip-installable CLI wrapping the gate (backend is stdlib -> packaging is cheap) 5h
- GitHub Action wrapping the CLI (conformance.yml already exists)               3h
- Publish the claim dataset + datasheet (sources, protocol, disagreement rate)  4h
- Vendor disclosure: written notice to Razorpay re the Rs15,000/91-day finding,
  plus a response log. Logs the non-reply too — that is still the artifact.     2h
- External timestamp anchor (RFC-3161) closing the stated ledger residual limit 8h

## 8. VIDEO (day 7-8, record EARLY)

Corpus: only 4 genuine participant videos existed at retrieval; most repo video
links are placeholders. "A video surge is coming in the last ~10 days. Recording
early is cheap insurance." Briefing advises live code execution + failure modes +
architecture over static slides.

Scene order (money first, mechanism second, out-of-sample last):
 1. The hole — curl zouk.co.in/.well-known/ucp -> no UPI, in a country 80%+ UPI
 2. The money — merchant reads "Guaranteed Collection", ships, debit declines,
    rupees on screen. Then OC-228 §2: "shall NOT be treated as the guarantee"
 3. The check — agent resolves the claim, REFUSES, quoting the clause
 4. Controlled execution — conformant purchase, real Razorpay test order, receipt
 5. THE LIVE DRIFT — probe the running Razorpay test API by binary search: it
    accepts Rs15,000 and 91 days where OC-228 authorises Rs10,000 and 90.
    This is drift in RUNNING CODE, found by EXECUTING against it. No competitor
    can have this.
 6. The closer — and it caught us too. Six times. Here is FAILURES.md.

## 9. SCHEDULE

D1  P0 integrity (4h) + P1 wire thesis start (4h)
D2  P1 finish + P2 persistence/locking start
D3  P2 finish + concurrency tests
D4  P3 harvest stages 0-2
D5  P3 stage 3 adjudication (TIMEBOX 6h) + stage 4
D6  P4 camera instrument screens 1-4
D7  P4 screen 5 + optional (CLI or dataset) + docs regeneration
D8  Record video. Buffer.
D9  Submit. DO NOT SUBMIT EARLY — no edits after submission.

## 10. THE SUBMISSION FORM

"What broke, and how you got out" is read FIRST. Lead with FAILURES.md #7:
the artifact built to catch restatements that outran their source shipped six of
them in its own architecture document, and the fix was to make every number in
every doc generated rather than typed — self_conformance.py pointed at prose.
