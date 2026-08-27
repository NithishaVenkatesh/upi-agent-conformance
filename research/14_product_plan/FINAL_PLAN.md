# FINAL PLAN — Razorpay AI Buildathon, Track 01
Deadline 5 Sept 2026 · today 27 Aug · solo · ~60 productive hours
Synthesised from 5 research agents + 3 adversarial critics, all grounded in the code.

## THE ONE-LINE STRATEGY
Stop building. The system is 90% there. Spend the 9 days making the money path
un-attackable, making three moments visible on camera, and telling the truth about
the rest louder than anyone else in the field.

## TRACK 01'S BAR — the only thing being graded
"Every money action explainable, bounded and gated. Show the audit trail and one
failure handled gracefully."
THERE IS NO METRIC CLAUSE IN TRACK 01. (That is Track 02/03.) Everything below is
allocated against those three clauses + the four rubric pillars.

===============================================================================
PART A — WHAT IS ACTUALLY BROKEN (verified by running the code)
===============================================================================

TIER 1 — money path defects. Fix these or nothing else matters.

A1. THE THESIS IS NOT WIRED.  merchant/server.py:96
    d = decide(req, block, "PASS", now)   <- hardcoded string literal
    gate/decide.py:42-45 (counterparty_not_conformant) is UNREACHABLE in prod.
    The conformance engine, the corpus, the citations all work and nothing
    connects them to the money path.

A2. THE CALLER SUPPLIES THE BOUND.  merchant/server.py:71
    self.blocks[c.id] = _default_block(now, **(args.get("block") or {}))
    Caller JSON splatted into gate state. Send {"block":{"remaining_minor":
    999999999}} and every bound is evaluated against numbers the attacker chose.
    A caller-supplied bound is not a bound.
    !! The named direct competitor (Adarsh-Me/Agent-Audit) already resolves
       amounts server-side; the agent sends only sku. Being beaten here is the
       worst available outcome.

A3. IDEMPOTENCY IS INERT ON THE LIVE PATH.
    checkout.py:49 asserts "idem_key MUST reach the payment API".
    razorpay_client.py:59-61 puts it in `notes` — free-form metadata.
    Running `make demo` twice produced TWO distinct real orders
    (order_TUZG8GbOGU0GKY, order_TUZGosRS2KpJi4).
    -> This is FAILURES.md #7. A guard that cannot fire, on the money path,
       found by executing it. Same shape as #1-#6, first time with money.

A4. make verify RETURNS OK ON A FRESH CLONE HAVING VERIFIED NOTHING.
    gate/ledger.py:56 -> "ledger OK — empty (no HEAD anchor yet)", exit 0.
    README.md:16 tells a judge this command walks the ledger.
    This is FAILURES.md #3(b) REINTRODUCED at the empty-clone case, in the second
    command the README tells a judge to run. 20 minutes to fix. Best find available.

A5. RAZORPAY ERRORS ESCAPE THE JSON-RPC LAYER. server.py:167 catches only KeyError;
    RuntimeError from razorpay_client.py:70 -> HTTP 500 + Python traceback.

A6. LEDGER APPEND IS NON-ATOMIC. Two concurrent appends produce a HEAD count
    mismatch INDISTINGUISHABLE FROM A TAMPER ATTACK — undermining the exact
    message the tamper suite's credibility rests on.

TIER 2 — doc/code drift (the repo committed its own thesis again)

A7. ARCHITECTURE.md:34 "95 tests, 85% coverage"  -> real: 101 tests, 56%
A8. README.md:15 / ARCH:11 "~2s, no network"     -> makes a live Razorpay call,
    contradicted 30 lines later at ARCH:41, in the same file
A9. ARCH:18-28 "make demo output, verbatim"      -> shows ALLOWED + a
    retry_not_permitted refusal eval/demo.py NEVER PRINTS
A10. README "two clause-cited refusals"           -> one
A11. ARCH:111 RECONCILE_PENDING                   -> string exists nowhere in repo
A12. ARCH:112 "ledger tamper -> refuse all authorisation" -> Ledger.verify() has
     NO CALLER in the money path
     NOTE: A11/A12 are NOT drift. They are documented failure modes that were
     never implemented — i.e. the failure-modes table, the artifact that answers
     the bar's third clause, is partly aspirational. That is a build-quality hit.
     Do not soften it by calling it "drift".

TIER 3 — evaluation integrity

A13. eval/cases.py:107-112 wraps the ONLY source of positive cases in a bare
     `except Exception: return []`. A rate-limit DURING JUDGING silently drops
     both positive cases and the batch reports VACUOUS to the reviewer.
A14. probe() fires ~33 live API calls on every `make eval`. Undeclared, uncached.
     eval/probe_findings.json is written by __main__ only and NEVER READ.
A15. ARCH:93 promises "harm reported in RUPEES". induced_harm is a COUNT.
     The doc is currently false.
A16. The only baseline (extract/naive.py, 13 lines, scores 0/8) is a straw man.
     FIELD_BAR.md:88 indicts exactly this: "a baseline the same author designed
     to lose." The project currently commits the thing it indicts.
A17. CI runs demo/self_conformance/tamper/verify_ledger. NOT `make test`.
     101 tests exist; CI executes none.

TIER 4 — non-code

A18. research/ is 140 tracked files including named teardowns of fellow
     applicants (VeerGetGit, SaxenaLakshya, ARYAN), two called "theatre".
     THE REPO MUST BE PUBLIC. Decide this deliberately. Recommendation: move
     competitor teardowns to a private branch or strip to anonymised patterns.
     Keep the corpus statistics; drop the named verdicts.

===============================================================================
PART B — WHAT NOT TO BUILD (and why). All three critics converged here.
===============================================================================

CUT: the 219-PDF NPCI harvest to n>=50.        [~25-35h saved]
  Empirically tested: 61% fetch yield (Imperva HTML as .pdf); 0/11 fetched PDFs
  have a text layer; prefilter regex scores 0 hits; PROVENANCE.md already says
  all of this; OC-228 isn't even in the index.
  AND structurally: harvesting AUTHORITIES cannot create scored cases.
  eval/harness.py iterates DECLARED cases; UNDETERMINED(abstained)=0, so there
  are no abstentions to convert. Realistic yield: +0 scored cases.
  MOST LIKELY OUTCOME OF 30 HOURS: `make eval` prints exactly what it prints today.

CUT: SQLite persistence.                        [~5h]
  checkout.py:22 ALREADY states the limitation. Trading a stated limitation for
  an unstated concurrency bug in a half-finished SQLite layer written under
  deadline is strictly worse.

CUT: the decide() checks[] refactor.            [~2h + risk]
  It is a money-path control-flow change for a RENDERING reason — banned by the
  draft's own cut list. Worse: eval/self_conformance.py:41-50 parses decide.py
  with ast, matching literal Decision(allowed=False) calls. Restructure into a
  loop and the vacuity guard either fires or PASSES WHILE CHECKING NOTHING —
  the exact failure the instrument exists to catch.
  INSTEAD: sibling function trace(req, block, verdict, now) that returns the
  check list, + a test asserting trace()[-1] == decide() for every fixture.

CUT: RFC-3161 / external timestamp anchor.      [~8h]
  Closing a limit the project honestly STATES deletes an honesty artifact that
  scores. The stated-and-unclosed limit is worth more than the closure.

CUT: pip-installable CLI, GitHub Action, hosted checker, browser extension,
     blockchain anchoring, x402, UAP implementation, Vulcan benchmark.
     (Say "not attempted, could not verify access" for Vulcan — same standard
      the project applies to everyone else.)

CUT: blind 20% re-label. Over n~8-20 that is 2-4 claims; a disagreement rate
     over n=3 is exactly the vacuity harness.py:117 refuses.

CUT: verdict cache keyed on counterparty_doc_sha256 — THAT FIELD DOES NOT EXIST
     anywhere in the repo. Inventing a field to cache a microsecond computation.

CUT (frontend): policy editor, Merkle proof visualiser (the ledger is a LINEAR
     chain — building a tree to justify a graphic is a feature invented to serve
     a screen), %-complete donuts (a percentage over n=3 is the dishonest
     headline harness.py refuses to print — self-refuting), trace waterfall with
     latency spans (the money path is a pure function — theatre), annotation
     queue, dataset versioning UI, auth/RBAC, websockets, /ledger/<seq> detail
     route (four-key payload = empty page).

CUT: npm / React / Vite / any build step.
     merchant/server.py's docstring says it deliberately has zero dependencies
     because "does it run" is a graded pillar. Do not spend that.

===============================================================================
PART C — THE PLAN
===============================================================================

--- C1. INTEGRITY + EVAL SAFETY (D1, 7h) ---

1. Cache probe results; make eval/cases.py:107-112 LOUD.            1.5h
   Read eval/probe_findings.json instead of firing 33 live calls.
   A swallowed exception during judging currently deletes your headline finding.
2. Fix A4 — `make verify` on a fresh clone must exit 3 with
   "no ledger yet — run make demo first", not exit 0 with OK.        0.3h
3. Fence FOUR generated markers only (test count, coverage, demo transcript,
   eval headline). `make docs-check` regenerates and fails on disagreement.
   Do NOT build a general prose checker.                             3h
   Normalise order_id and ledger entry count first, or the transcript
   will never match twice.
4. Split `make demo` (offline, FakeCapture) / `make demo-live` (opt-in).  1h
   Currently ANY machine with RAZORPAY_KEY_ID set fires a live order.
5. Add `make test` to .github/workflows/conformance.yml.             0.2h
6. git tag the MIN_N=50 pre-registration so it provably predates the result. 0.2h

--- C2. FIX THE TRUST BOUNDARY, THEN WIRE THE THESIS (D2, 7h) ---
!! REORDERED 2026-08-27. The draft built a new demo scene on D2 against the
   block mechanism that D3 restructured. eval/demo.py:61 and
   tests/test_server.py:57-66 BOTH trigger the headline refusal via a
   CLIENT-POSTED block:{max_minor:2500000}. Redesign it BEFORE anything films
   against it, so the boundary is fixed once, not twice.
   SCOPE, TRACED: A1's verdict reads declared_constraints from a SERVER-SIDE
   source (probe_findings.json), NOT from caller args. A1 does not inherit A2's
   hole, and A2's fix does not restructure A1's input. The risk was REWORK AND A
   MISLEADING SCENE, not a shared vulnerability. Reordering removes both.

6b. A2: server-authoritative block state — MOVED HERE FROM D3.        3h
    Includes rebuilding the refusal trigger: a merchant-config path the SERVER
    owns, so a non-conformant block can still be declared for the demo without
    the caller setting its own bound.

7. A1: replace the hardcoded "PASS". Read declared_constraints -> conform ->
   thread the real Verdict into decide().                            4h
   !! POINT IT AT THE PROBED RAZORPAY BOUNDS, not at our own profile and not at
      an authored Cashfree doc. Our own profile is built from the same 7 claims
      as the store — it can only ever return PASS, which is FAILURES #3 again.
      An authored counterparty doc is the compromised-target flaw FIELD_BAR
      indicts. The live API's own probed bounds (Rs15,000 / 91d) are real, are
      declared by the counterparty's running code, and are ALREADY BUILT.
8. New demo scene: non-conformant counterparty -> counterparty_not_conformant,
   quoting OC-228. + tests.                                          3h

--- C3. HARDEN + GATE THE CAVEAT (D3, 7h) ---

9.  THE CAVEAT GATE — see COPY_DRAFTS.md §0.                          1h
    ROOT CAUSE of instance #8: probe_findings.json carries NUMBERS but not the
    CAVEAT, so every downstream renderer gets the figure unhedged BY DEFAULT.
    Add required fields `framing`, `not_claimed`, `alternatives_not_excluded`
    to each finding; add a self_conformance check that FAILS if a finding lacks
    them, or if a renderer emits `api_enforces_*` without them. Self-test it
    against a known-bad fixture first (FAILURES.md #3/#4: a check must prove it
    can fail before its pass is believed).
    THIS IS THE ONLY ITEM THAT PREVENTS INSTANCE #9. Detection has a ceiling —
    it only catches what someone thinks to check. This is a gate.
    Also inline the hedge at ARCHITECTURE.md:42, which currently hedges BY
    REFERENCE ("see LIVE_API_FINDINGS.md") rather than BY VALUE.
10. A5: catch RuntimeError/URLError at server.py:167 -> structured JSON-RPC.  1h
11. A6: fcntl.flock on the ledger + atomic rename + fsync for .head.  1.5h
    Purely so `make verify` is deterministic on camera.
12. WHAT THIS MONEY PATH DOES NOT SURVIVE — a written, file:line-cited inventory
    of the unfixed bugs: restart loses state, non-atomic decrement, O(n)
    re-read. Each with what a fix would cost.                        1.5h
    This scores in the same register FAILURES.md already scores in, and CANNOT
    BE FAKED by a competitor who does not know their own bugs.

--- C4. THE BAR'S THIRD CLAUSE + PILLAR 3 (D4, 7h) ---

13. A11/A12: implement RECONCILE_PENDING, and call Ledger.verify() in the money
    path. Append AFTER capture; on append failure mark the block
    RECONCILE_PENDING and refuse further authorisation.              3h
    THIS IS "one failure handled gracefully" — the bar clause that had NO OWNER.
    It is a video scene: kill the process mid-capture, show the refusal, show
    `make verify` surfacing it.
14. WHERE_WE_DID_NOT_USE_AI.md with a COST column + an AST test that fails if an
    LLM import appears in gate/ or conform/, WITH A VACUITY GUARD.    1.5h
    Pillar 3 is 25% of the rubric. Cheapest point on the board.
15. A15: rupee-denominated induced harm.                             1h
16. A16: BASELINE — first affordable arm (COPY_DRAFTS.md §4).          1.5h
    (A) SAME MODEL, GENERIC PROMPT — no schema, no scope rule, no quote rule,
        no confidence floor. Off-the-shelf in the sense that matters: nothing
        in the arm was designed by us to lose. RECOMMENDED.
    (B) a published tool with independent provenance (costs a dependency)
    (C) pre-register our own + git-tag it BEFORE seeing its result
    (D) if none feasible, DROP THE UPLIFT CLAIM and sweep downstream — pitch,
        README, ARCHITECTURE.md "Numbers", video script — so no uplift number
        survives without a legitimate comparison behind it.
    "TUNED" IS STRUCK: a second regex we also wrote and also tuned is the same
    strawman with better manners.
    extract/naive.py KEEPS its real job — reproducing the SEP #216 error as an
    existence proof — but is NOT a baseline and must stop being labelled one,
    including in ARCHITECTURE.md's "Numbers" table.

--- C5. THE THREE HERO FRAMES (D5, 7h) ---

You are not building an app. You are building THREE FRAMES, ~90 seconds of a
5-minute video. Terminal owns "does it run" and the numbers. Any pixel not in
one of these three frames gets zero effort.

Zero dependencies. Server-rendered HTML strings from the existing stdlib
http.server. Blade TOKENS as CSS custom properties (MIT). NOT Blade React.

17. /decision/<id> — ONE composite page, three bands.                4h
    band 1: the checks trace (via trace(), not a decide() refactor)
    band 2: THE EVIDENCE — the cropped SCAN with a highlight box
    band 3: verify-this-yourself commands for THIS object
    !! Band 2 must be the IMAGE. corpus/npci/PROVENANCE.md: OC-228 is an
       image-only scan, pdftotext returns EMPTY. Rendering "circular text with
       anchors" means TRANSCRIBING IT — producing a restatement that outran its
       source, the exact artifact this project indicts. Serve
       OC-228_live-2026-08-26_p2.png cropped, + doc SHA-256 + source URL.
    Render the rupee delta at 40px, not 13px. Problem taste is graded and no
    current screen shows money at risk.
18. /drift — the highest-value 2 hours in the whole plan.            2h
    LEFT: the scanned OC-228 clause, highlighted.
    RIGHT: the live Razorpay API's two probed values.
    The numbers differ. In the only colour on the site.
    Every other screen shows your system agreeing with itself. This is the only
    one that shows a finding ABOUT THE WORLD — a scanned regulatory document and
    a live production API disagreeing, both sides' evidence visible, both
    independently checkable. Render from committed JSON and stamp it
    "probed 2026-08-27, cached — re-run with make probe". Cached-and-labelled
    beats live-and-flaky on camera every time.
    !! THE CAVEAT RENDERS ON THE PAGE, BETWEEN the two columns and the
       conclusion — inside the field of view, not below the fold. Full copy at
       COPY_DRAFTS.md §1. Render it FROM `alternatives_not_excluded` in the
       JSON, NEVER hardcoded; if that field is empty the page REFUSES to render
       the comparison at all. THIS IS NOT "RAZORPAY IS WRONG" — three
       explanations cannot be ruled out (a later circular, a different purpose
       code, test-mode differences). The claim is narrower and still strong: the
       rail permits 1.5x what we can cite, and nothing surfaces the difference.
19. make ui-snap — render all pages to static web/snapshots/*.html.  1h
    Triple dividend: no hot-reload needed, committed HTML is inspectable by a
    judge who won't run anything, and render-and-diff becomes a golden-file test
    (generated, not typed — on thesis).

--- C6. RECORD THE VIDEO (D6, 6h) ---
EVERYTHING AFTER THIS POINT IS OPTIONAL. A video of a working D5 build beats no
video of a perfect D8 build. Corpus: only 4 genuine participant videos existed
at retrieval; a surge is coming in the final 10 days.

Scene order — money first, mechanism second, out-of-sample last:
 1. The hole   curl zouk.co.in/.well-known/ucp -> no UPI, in a country 80%+ UPI
 2. The money  "Guaranteed Collection" -> ships -> debit declines -> RUPEES.
               Then OC-228 §2: "shall NOT be treated as the guarantee of payment"
 3. The check  agent resolves the claim, REFUSES, quotes the clause   [FRAME 1]
 4. Bounded    conformant purchase, real test-mode order, hash-chained receipt
 5. Graceful   kill the process mid-capture -> RECONCILE_PENDING -> refuses
 6. THE DRIFT  the scan vs the live API. Rs15,000 vs Rs10,000. 91d vs 90d. [FRAME 2/3]
 7. The closer and it caught us too — seven times. FAILURES.md.

 OPTIONAL, if it fits: a REAL AI buyer (Claude/ChatGPT over MCP) connecting to
 the running merchant and being refused on camera with the clause read back.
 That is Track 01's task VERBATIM ("makes a merchant transactable by an AI buyer
 end to end") and no static page can produce it.

--- C7. SUBMISSION (D7, 7h) ---
20. The written submission. 3h. FULL DRAFTS OF BOTH FIELDS ALREADY EXIST at
    COPY_DRAFTS.md §3 — written 2026-08-27 while the reasoning was fresh,
    specifically so they cannot quietly re-merge under deadline pressure.
    THE SPLIT IS DELIBERATE — they are different questions:
      "What does it solve?"  -> PRODUCT PITCH: the drift finding, caveats
                                intact. A finding about the world.
      "What broke ...?"      -> FAILURE PITCH: A3, the inert idempotency key.
                                A defect in our own money path, found by
                                running it.
    The original conflation happened because both competed for one slot. They
    do not compete. Do not merge them.
    LEAD THE FAILURE FIELD WITH A3, not with stale doc numbers.
    A money-path defect found by running the code beats a Markdown defect.
    The shape: "a guard that could not fire" is now the seventh instance of one
    shape in this project. The first five were checks that could not fail; #6 was
    a claim that could not be checked; #7 is the first one on the money path,
    and it was shipping real orders.
21. Docs regeneration; make docs-check green.                        2h
22. Decide the research/ question (A18).                             0.5h
23. Re-record weak scenes.                                           1.5h

--- C8. SLACK (D8, 6h) ---
This is the day the SQLite you didn't write would have eaten.
If nothing broke: make replay (1h — replay the whole ledger, reproduce every
decision byte-identically; decide() is pure and every input is in the ledger;
strongest available evidence for the determinism claim, and /ledger then carries
one line: "N entries replayed, N decisions reproduced identically").
Then: vendor disclosure to Razorpay — DRAFTED at COPY_DRAFTS.md §2. Send BEFORE
submission. Framed as a QUESTION, not a finding. + response log
(2h — PROMOTE THIS TO MANDATORY IF IT FITS. You are submitting to Razorpay's own
hackathon a finding that a Razorpay API exceeds what the circular authorises.
Written notice BEFORE you present it is the difference between "found a bug in
the sponsor" and "found a bug in the sponsor and handled it like a professional".
Logging a non-reply is itself the artifact.)

--- C9. SUBMIT (D9) ---
Dry-run the form on D7. Submit D8 evening / D9 once the form text is final.
The FORM is frozen on submit; the REPO URL IS LIVE, so commits after submission
still land. Do not hold the form to the last hour.

~54h against ~60 available, with a genuine free day.
(The draft was ~112h against 60 with zero slack.)

===============================================================================
PART D — THE FRONTEND, PRECISELY
===============================================================================

DIRECTION: "Circular" — a near-achromatic, border-separated document surface.
Evidence: razorpay.com/foundation-model (Vulcan, their newest AI surface)
resolves to SIX achromatic values plus exactly one chromatic, #8FBFFF. No
gradients. No violet. That is Razorpay's own answer to "how should an AI product
look", and it is free to match.

TOKENS — all verified from razorpay/blade (MIT), copied as CSS custom properties.

  --font-heading: "TASA Orbiter"   <- Razorpay's actual brand face. SIL OFL, free.
  --font-text:    "Inter"          <- Razorpay subsets U+20B9 (Rs) into it
  --font-mono:    "JetBrains Mono" <- slashed zero, disambiguated 1/l/I 0/O.
                                      Blade specifies Menlo only because Blade
                                      rarely renders hashes. You render SHA-256.
  Self-host all three as woff2. NO Google Fonts <link> — it breaks offline
  operation and adds a network dependency to a project whose pitch is having none.
  font-display: swap, or headings pop in late on camera.

  type scale (Blade, verbatim): 10 11 12 14 16 18 20 24 32 40 48 56 64 72
  spacing    (Blade, verbatim): 0 2 4 8 12 16 20 24 32 40 48 56
  weight: never above 700 (Blade tops out at bold)

  --surface-page:  oklch(98.5% 0 0)  <- slightly OFF-white, not pure. Large flat
                   near-white fields get blocking artifacts around thin dark text
                   at video bitrates. Off-white page + pure-white cards also adds
                   the layering this direction otherwise lacks.
  --border:        #E8E8E8 at 1px    <- NOT 0.5px. On the 1080p display a judge
                   watches your video on, 0.5px resolves to 1px or to NOTHING,
                   inconsistently per element. Some rows get a line, some don't.
                   That reads unmistakably as a rendering bug.
                   Collapse adjacent borders — a bordered table inside a bordered
                   card doubles every line. Clearest tell of unconsidered design.
  --text:          #050505 / --text-muted: #616D75
  --refuse:        #D01E11   <- THE ONLY SATURATED COLOUR IN THE ENTIRE PRODUCT
  --accent:        #1364F1   <- links and focus rings ONLY

  DROP GREEN ENTIRELY. #008F47 on white is ~3.6:1 and FAILS AA for normal text.
  In an achromatic document "allowed" is plain near-black and ABSENCE OF RED
  MEANS ALLOWED. One colour is more opinionated than two, and it is cheaper.

  Use red as a WORD and a 3px left rule. NEVER as a filled banner background —
  that is the fastest route to "Bootstrap alert".

  font-variant-numeric: tabular-nums lining-nums   EVERYWHERE numbers appear.
  (Blade does not appear to set this — UNVERIFIED — so it is on you.)
  Rupee: follow Blade's Amount affixSubtle — Rs symbol and paise one step down
  and muted; rupee digits full size and full contrast.

  Radius: pick 4 and use it everywhere. Mixed radii at this scale is noise
  nobody perceives as intentional.
  Elevation: BORDERS, NOT SHADOWS. Every Blade light-mode shadow is 6% alpha.
  Motion: Blade's easings. NO `shake` — shake is a FORM-VALIDATION idiom and will
  read as "invalid input", cheapening a regulatory refusal into a typo. Use
  nothing, or a 120ms settle on the fired row. Never `overshoot`.
  Light mode default.

THE ONE RULE THAT MATTERS MOST: enforce 3:1 SCALE CONTRAST on every page.
Achromatic layouts die when every band has 16px padding and every row is 40px —
the page then reads as an unstyled <table> and the judge concludes you ran out of
time. On /decision: REFUSED at 40-48px, the code at 20px mono, the trace at 13px.
Go asymmetric: 48px above a band label, 12px below. The gap BETWEEN sections must
be visibly ~4x the gap WITHIN one. This single discipline does more than
everything else here.

SIX STDLIB TRAPS:
 1. No hot reload -> `make ui-snap` static render (item 19) + CSS in a real file
    served no-store, so browser-refresh suffices.
 2. protocol_version="HTTP/1.1" + keep-alive: EVERY response needs a correct
    Content-Length or the browser hangs. Your _send does it for JSON; a 40KB HTML
    string and a 2MB PNG will not.
 3. Static assets: do NOT os.path.join(root, self.path). Explicit allowlist dict.
    Shipping a directory traversal in a PAYMENTS SECURITY project is a self-own a
    reviewer will enjoy quoting.
 4. Escaping: your data contains " and Rs and § and > (declared Rs25,000 >
    authorised Rs10,000). One helper e(s)=html.escape(s, quote=True), every
    interpolation through it, enforced by a grep rule in self_conformance.py.
 5. <meta charset="utf-8"> AND explicit UTF-8 on the response. Mojibaked Rs/§ in
    a project about not corrupting a quote is thematically catastrophic.
 6. Five helpers only: page() band() kv() mono() verify_block(). Then stop.

BANNED: violet/purple gradients · any gradient · glassmorphism · heavy shadows ·
dark-mode-default · Inter-only · shadcn defaults · emoji in verdicts or the
ledger · large radii on data surfaces · a hero percentage with no denominator ·
hiding failures behind a toggle · greying out failures · paraphrasing, ellipsing
or highlighting inside a regulatory quote · colouring the whole UI blue ·
razorpay.com/blog colours (that is the stock Gutenberg palette, not brand).

===============================================================================
PART E — THE 30-SECOND JUDGE TEST
===============================================================================
BEFORE: "they're building a frontend they say is worthless and labelling 50
         circulars nobody asked for."
AFTER:  "the caller cannot set its own limit, the ledger refuses to authorise
         when tampered, here is the process being killed mid-capture, and here
         is a scanned NPCI circular next to a live Razorpay API that disagrees
         with it."
That is Track 01's bar, quoted back at them.
