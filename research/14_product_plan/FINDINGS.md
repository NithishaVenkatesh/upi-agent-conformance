# FINDINGS — consolidated research + adversarial critique
Produced 2026-08-27. Inputs: 5 independent research agents + 3 adversarial critics,
all grounded in this repo's code and corpus. Supersedes nothing; this is the
evidence base behind `FINAL_PLAN.md`.

EVIDENCE CLASSES USED THROUGHOUT:
  CONFIRMED  — the agent ran it or read it in this repo
  VERIFIED   — fetched from a primary source with a URL
  UNVERIFIED — prior knowledge / recollection; MUST be re-checked before citing
Several agents had their own web sub-agents killed by a process exit and said so
rather than fabricating. Those sections are marked INCOMPLETE.

===============================================================================
1. GAP AUDIT — built vs promised   [CONFIRMED: all four make targets were run]
===============================================================================

REAL OUTPUT:
  make test    exit 0   101 tests (NOT 95), 1.06s, 56% source coverage (NOT 85%)
  make demo    exit 0   6 scenes; CREATED A REAL RAZORPAY ORDER over the network
  make verify  exit 0   22 entries verified; 3/3 self-test fixtures; 5/5 attacks caught
  make eval    exit 2   8 scored / 16 attempted, positive class 2, HEADLINE SUPPRESSED
  .env: RAZORPAY_KEY_ID + SECRET set. NO Azure OpenAI vars -> FakeLLM confirmed.

--- MONEY PATH: PROMISED vs BUILT ---

| ARCHITECTURE.md claim | Reality |
|---|---|
| ARCH:60 "conformance verdict PASS?" gates the money path | NOT IMPLEMENTED. server.py:96 `decide(req, block, "PASS", now)` — HARDCODED STRING. gate/decide.py:42-45 unreachable in prod; only tests/test_gate.py:21 passes a non-PASS. THE ENGINE IS NOT CONNECTED TO THE GATE. |
| ARCH:61 block cap <= Rs10,000 | BUILT. decide.py:47-50 |
| ARCH:65 validity <= 90d as a CAP | BUILT. decide.py:59-63 (+ :64-66 expiry) |
| ARCH:62 amount <= remaining | BUILT. decide.py:52-54 |
| ARCH:63 retries <= 3/24h, timeouts only | PARTIAL. decide.py:74-81 exists; server.py:95 never sets is_retry/retry_of_timeout — DEAD IN THE LIVE PATH. classify_failure() has ZERO callers outside tests. |
| ARCH:64 one block per (customer, merchant) | PARTIAL. decide.py:68-72 reads concurrent_blocks_same_merchant, which server.py:44 hardcodes to 0 and server.py:71 lets the CLIENT supply. Never computed from state. |
| ARCH:67 "fail -> 403 {code, clause, quote, remaining}" | NOT AS SPECIFIED. server.py:163 returns HTTP 200 + JSON-RPC error. NO `remaining` field. |
| ARCH:68 "pass -> capture -> ledger.append(DECISION)" | INVERTED. server.py:97 appends BEFORE server.py:104 captures, and nothing appends after. order_id NEVER ENTERS THE LEDGER. The log records that authorisation was granted, not that money moved. |
| ARCH:71 decide() pure, replayable | BUILT, genuinely. Verified tests/test_gate.py:74 |
| ARCH:72 a gate check naming no clause fails CI | BUILT. self_conformance.py + conformance.yml; 3 self-test fixtures real |

--- FAILURE-MODE TABLE (ARCH:101-113) ---

| Row | Status |
|---|---|
| NPCI 403 -> serve local corpus | BUILT by construction (nothing fetches live) |
| Extraction low-confidence -> UNDETERMINED | BUILT. engine.py:82-85, llm.py:121-123 |
| Claim store unavailable -> fail closed | PARTIAL. decide.py:10 is a bare module-level json.load on a RELATIVE PATH. Fail-closed by crash. Also: importing gate from any cwd != repo root fails. |
| Counterparty terms hash changed -> invalidate | NOT IMPLEMENTED. `doc_sha256` appears ONLY in authoritative.json. No runtime reader, no invalidation path. |
| Razorpay timeout -> retry <=3/24h | NOT IMPLEMENTED end-to-end. No caller retries; no persisted 24h counter. |
| Duplicate request -> replay original | PARTIAL. Correct logic (server.py:90-94, checkout.py:46-47), IN-MEMORY ONLY. |
| Ledger append fails after capture -> RECONCILE_PENDING | NOT IMPLEMENTED. The string `RECONCILE` appears NOWHERE in the repo except ARCH:111. Structurally impossible as written, because the append happens BEFORE capture. |
| Ledger tamper -> refuse all authorisation | NOT IMPLEMENTED. Ledger.verify() has NO CALLER in the money path — only verify_ledger.py:3, demo.py:109, tamper.py, tests. A tampered ledger stops zero payments. |

--- "NUMBERS" SECTION (ARCH:86-99) ---
  Headline over N=50+          NOT MET, honestly declared. Real: 8 scored. MIN_N=50.
  Effective n beside headline  BUILT. harness.py:114-115
  Naive-regex baseline         BUILT. Confirmed 0/8.
  Ablation: HARM IN RUPEES     NOT IMPLEMENTED. No rupee figure anywhere. Report
                               has no rupee field; induced_harm is a COUNT.
                               => ARCH:93 IS CURRENTLY FALSE.
  Induced harm                 BUILT. harness.py:44, :101
  Abstention counted           BUILT. harness.py:39, :85-87

--- DOC DRIFT (the repo committed its own thesis again) ---
  ARCH:34   "95 tests, 85% coverage"        -> 101 tests, 56%
  ARCH:11 / README:15 "~2s, no network"     -> live Razorpay call. CONTRADICTED
                                               30 LINES LATER at ARCH:41. Same file.
  ARCH:18-28 "make demo output, verbatim"   -> shows `ALLOWED authorised` and
                                               `REFUSED retry_not_permitted ·
                                               Acquirer §3`. demo.py HAS NO RETRY
                                               SCENE and prints none of those lines.
  README:15 "two clause-cited refusals"     -> one (demo.py:58-66)
  NOTE: RECONCILE_PENDING and "ledger tamper -> refuse" are NOT drift. They are
  documented failure modes NEVER IMPLEMENTED. That is a build-quality hit, not a
  narrative. Do not soften it.

--- UNDECLARED GAPS (nothing in any doc admits these) ---

G1  IN-MEMORY MONEY STATE + REAL ORDERS = RESTART DOUBLE-CHARGE.
    server.py:55 blocks={}; checkout.py:25-26 dicts; server.py:44 used_idem_keys
    is a SET. No DB, no file, no serialisation. razorpay_client.py:62 now issues
    REAL orders. Restart -> replay idem_key -> SECOND REAL ORDER.
    checkout.py:48-49 explicitly reasons about crash-safety and then relies on a
    mechanism that does not survive the crash it describes.

G2  ZERO CONCURRENCY CONTROL. No Lock|flock|fcntl anywhere. Yet server.py:171 is
    ThreadingHTTPServer.
     - Ledger: read-all -> compute prev -> append -> overwrite .head, NON-ATOMIC.
       Two concurrent appends -> HEAD count mismatch -> verify() reports
       "truncated: HEAD commits to X, found Y" — A BENIGN RACE IS
       INDISTINGUISHABLE FROM A TAMPER ATTACK, and the tamper suite's entire
       credibility rests on that message.
     - TOCTOU double-spend: server.py:105-106 decrements remaining_minor AFTER
       decide.py:52 checks it. Two concurrent completions both pass, both
       capture, remaining_minor goes NEGATIVE past the Rs10,000 cap.
     - .head written with bare json.dump(open(...,"w")) — no fsync, no atomic
       rename. Crash mid-write -> verify() raises JSONDecodeError instead of
       reporting BROKEN.

G3  THE CLIENT SUPPLIES THE BLOCK. server.py:71
      self.blocks[c.id] = _default_block(now, **(args.get("block") or {}))
    The untrusted agent passes remaining_minor, created_ts, expires_ts,
    retries_24h, concurrent_blocks_same_merchant, used_idem_keys straight into
    gate input. Cap max_minor at Rs10,000 all you like — send
    remaining_minor: 999999999 and retries_24h: 0 forever.
    ARCH:74 claims adversarial input is handled because "the gate reads the claim
    store, never raw merchant text". That defends the AUTHORITY side and says
    nothing about the DECLARED-STATE side, which is wide open.

G4  RECONCILE_PENDING does not exist. Only ARCH:111. No constant, no test.
    It is the row a payments reviewer reads first.

G5  RAZORPAY ERRORS ESCAPE THE JSON-RPC LAYER. razorpay_client.py:69-70 raises
    RuntimeError; server.py:167 catches ONLY KeyError. -> HTTP 500 + Python
    traceback, and with protocol_version="HTTP/1.1" and no Content-Length on that
    path the keep-alive connection is left undefined.
    Worse: checkout.py:50-52 sets order_id/status only on success, so after a
    failure the checkout stays ready_for_payment WHILE AN ORDER MAY ALREADY EXIST
    AT RAZORPAY. No compensation. (That is what G4 was supposed to cover.)
    TimeoutError caught at :71; bare URLError/DNS failure NOT caught at all.

G6  THE EVAL'S ENTIRE POSITIVE CLASS COMES FROM AN UNCACHED LIVE CALL, AND
    FAILURE IS SILENT.  eval/cases.py:107-112
      try: from eval.probe_cases import probe; cases,_ = probe(verbose=False)
      except Exception: return []
    A bare except around the ONLY source of positive cases. No keys, no network,
    a rate-limit, a schema change, or ANY BUG IN probe_cases.py -> [] ->
    true_fail==0 -> harness.py:121 flips to VACUOUS. The batch then blames its
    own corpus for a swallowed exception.
    Also: probe() runs a binary search — ~33 LIVE ORDER-CREATION CALLS ON EVERY
    `make eval`. Undeclared, unrated, uncached.
    Also: eval/probe_findings.json is written by __main__ only and NEVER READ by
    harvest(). The cached artifact is decorative.
    Also: both probe cases share one subject each -> "positive class = 2" is
    really ONE API, TWO PARAMETERS, ONE RUN. n=2 with a shared failure mode.

G7  MCP IS JSON-RPC WEARING AN MCP COSTUME. No initialize|protocolVersion|
    serverInfo|notifications/ anywhere in merchant/. server.py:146-169 handles
    exactly tools/list and tools/call. Missing: the initialize handshake,
    notifications/initialized (and id-less notifications GET A RESPONSE ANYWAY,
    violating JSON-RPC 2.0), the {"content":[{"type":"text"}],"isError":bool}
    result shape, INTEGER error codes with a message (server.py:163/:166/:169 all
    emit STRING codes and no message), ping, resources/*, prompts/*, SSE or
    Streamable HTTP, Mcp-Session-Id.
    NO REAL MCP CLIENT WOULD COMPLETE A HANDSHAKE. No test asserts conformance.
    ARCH:53 calls it "MCP checkout tools" without qualification.

G8  THE UCP PROFILE IS HAND-ROLLED AND VALIDATED AGAINST NOTHING. ucp.py:24-50 is
    a literal dict. No schema in repo, no validator, no test against the spec the
    profile itself cites at ucp.py:30. declared_constraints and delegation_layer
    (ucp.py:47-48) are INVENTED EXTENSION KEYS inside config. eval/cases.py:25-42
    parses the four real profiles with .get() chains that would silently yield
    ZERO CASES on any shape change.

G9  HTTP SERVER SECURITY. No auth on /api/ucp/mcp (anyone reachable can spend the
    block). No rate limiting. `n = int(headers.get("Content-Length",0))` then
    rfile.read(n) with NO SIZE CAP — a declared 2GB body is read into memory.
    int() on a malformed header raises ValueError, uncaught -> 500. No security
    headers, no CORS policy (while server.py:132-137 explicitly reasons about
    browser origins). 127.0.0.1 binding is the only mitigation, and `make serve`
    advertises it as a service.

G10 CI RUNS NEITHER THE TESTS NOR THE EVAL. conformance.yml runs make demo,
    self_conformance, tamper, verify_ledger. NOT `make test` (101 tests). NOT
    `make eval`. And with no Razorpay secret in CI, make demo takes the
    FakeCapture branch — SO THE LIVE RAIL make demo NOW USES LOCALLY IS NEVER
    EXERCISED IN CI. No pip install step either.

G11 TEST QUALITY — better than average, three specific holes.
    Genuinely load-bearing: test_gate.py covers 13 refusal paths + a determinism
    check (:74); test_ledger.py is regression-anchored to real past defects
    (:35); test_razorpay.py:28-34 asserts replay does not double-charge;
    tamper.py:18-27 has an explicit VACUITY GUARD. Unusually disciplined.
    Holes: (a) ZERO concurrency tests — G1/G2 are invisible to the suite.
    (b) ZERO persistence tests — nothing builds a second Merchant and replays.
    (c) test_agent.py:10 greps the SOURCE TEXT of buyer.py for "from gate" —
        a real guard, but string-matching, not import-graph analysis;
        importlib.import_module("gate") would pass it.
    (d) test_probe_cases.py:16,18 hardcodes 1_500_000 and 91 — asserting a THIRD
        PARTY'S CURRENT BEHAVIOUR; will fail the day Razorpay changes a limit,
        and is network-marked so make test never runs it.
    (e) The seven eval/*.py modules at 0% unit coverage ARE the verification
        surfaces themselves.

--- HIGHEST-LEVERAGE ENGINEERING GAP (auditor's verdict) ---
"The money path has no durable state, and the state it does have is supplied by
the caller." A Razorpay engineer clones this, runs make demo, sees a real order
in their test dashboard, restarts, replays the idem key, gets a SECOND REAL
ORDER; then sends {"block":{"remaining_minor":999999999}} and watches the
'bounded' gate authorise past its own cap.
CLOSE SECOND, AND THE BIGGER *THESIS* PROBLEM: server.py:96 hardcodes "PASS".

===============================================================================
2. CORPUS / FIELD EVIDENCE  [CONFIRMED against local research/ corpus]
===============================================================================

SCOPE CORRECTION: the corpus records WHAT WINNERS SHIPPED AS DOCUMENTATION, not
whether they shipped a frontend. There is NO surface/has_frontend field in
corpus_metrics.json. "How many winners had a frontend" is NOT directly answerable.
What it DOES answer, repeatedly, is whether presentation depth separates winners.

--- Corpus A: protocol/payments + AI-native, n=45 ---
  ANY EVAL.md / BENCHMARK.md ............ 0/45  (0%)
  ANY ABLATION .......................... 0/45  (0%)
  precision/recall vs held-out set ...... 0/45  (0%)
  rollback story for money actions ...... 1/45
  "alternatives considered" ............. 1/45
  explicit threat model ................. 3/45
  quantitative results in a table ....... 3/45
  named HITL boundary ................... 8/45
  "where we deliberately did NOT use an LLM" 8/45 weak; 2/45 as an explicit claim
  limits/honesty section ................ 9/45
  CI workflows .......................... 10/45
  NO architecture section ANYWHERE ...... 13/45 (incl. two winners)
  systematic failure taxonomy ........... 1/45
  NO DIAGRAM OF ANY KIND ................ 16/45 (incl. outright winners)
  Quick Start / Setup — the #1 section .. 39/45 (86%)
  median architecture-section words ..... 137 (66% under 200)
  nobody leads with tech stack .......... 0/45

--- Corpus B: Google/NVIDIA, n=22 winners vs n=31 control ---
  authored ARCHITECTURE.md .............. 0/22
  eval numbers for agent systems ........ 0/19 non-TensorRT winners
  explicit test count ................... 1/22
  ablation / negative results ........... 3/22 — ALL THREE ORGANIZER-MANDATED
  metric/benchmark table ................ 4/22

  WINNERS vs NON-WINNERS:
    README words median ........ 1060  vs  778
    has architecture section ... 64%   vs  68%   <- LOSERS HIGHER
    ARCHITECTURE WORDS MEDIAN .. 135   vs  133
    diagram image .............. 23%   vs  23%   <- TIED
    ARCHITECTURE.md ............ 5%    vs  6%
  => "Architecture documentation depth does not separate winners from
      non-winners in this corpus."
  => "Rigor in this corpus correlates with BEING MADE TO DO IT, not with placing."

--- Corpus C: Microsoft/GitHub/AWS/etc, cohort n=58 ---
  C4 diagram / ADR / threat model / idempotency / ABLATION / benchmark table /
    explicit test count ................. 0/58 EACH
  "## Limitations" section .............. 1/58
  live deployed URL on a PaaS ........... 2/58
  human-in-the-loop / approval gate ..... 3/58
  demo video linked ..................... 14/58 (24%)
  median architecture words ............. 89
  WINNER REPOS WITH NO HUMAN-WRITTEN DOCUMENTATION AT ALL ... 25%
    (no README, empty README, two-word README, or an UNMODIFIED
     create-next-app / Angular CLI / Svelte / Lovable scaffold — i.e. an
     unmodified frontend scaffold counts as the ABSENCE of work, and still won)
  rho(repo size KB, architecture words) .. 0.12  (essentially none)
  rho(stars, architecture words) ......... 0.36  (weak)
  Twilio's four 2020 Grand Prize winners . 0 architecture words between them
  => "Whatever the vendor, the top prize does not correlate with documentation."

--- Cross-corpus, n=224 (99+125) ---
  repos using their OWN STDOUT as a proof anchor ......... 0 of 224
  repos VOLUNTEERING A WEAKNESS in their best number ..... 0 of 224
  systematic failure taxonomy ............................ 1 of 224

--- The live Razorpay field (261 public repos censused) ---
  Track 01 share ......................................... 16/261 = 6%
  Tracks 02/03/04 share .................................. 49%
  REPOS WITH A COMPROMISED MEASUREMENT TARGET ............ 10 of 10 measured
  repos that ablate their own system ..................... 0 of 10
  repos with an honest baseline .......................... 1 of 10
  shortlist quality: ~30% genuine · ~50% compromised/inert · ~20% theatre
  real held-out evaluation ............................... plausibly <10%;
                                                            defensible ~1 repo
  "sophisticated vocabulary predicts real engineering" .... ~50% of the time
  FIELD_BAR verdict: "much stronger than a normal hackathon and much weaker than
  it looks... The field has learned to MEASURE CAREFULLY. It has not learned to
  CHECK WHAT IT IS MEASURING. That gap is our opening, and it is wide."

--- The 12 direct competitors ---
| Repo | Track | Frontend | Files | Verdict | Demo |
|---|---|---|---|---|---|
| vaibhav375/recovery-ledger | T03 | Yes, 24 tsx | 183 | "Field bar-setter for integrity" | 7 |
| tfthushaar/razorpay_buildathon | T04 | Yes + Vercel | 117 | "Best bounded-autonomy mechanism" | 9 |
| shubhambhattog/recoup | T03 | Yes | 75 | "Excellent eng, one fatal baseline" | 9 |
| abhinav-phi/reflex | T03 | Yes | 190 | "Research-grade, circular target" | 7 |
| Adarsh-Me/Agent-Audit | T01 | Yes, 71 tsx | 352 | "Best problem framing; mock evidence" | 8 |
| komallbarhate/AI-Risk-Manager | T02 | No | 32 | "Real apparatus, tautological target" | 7 |
| Sivanandini/rto-risk-agent | T02 | Streamlit | 14 | "Good taste, circular data" | 6 |
| VeerGetGit/agentic_checkout | T01 | BIGGEST, node_modules committed | — | "PASSES EVERY SURFACE HEURISTIC, MEASURES NOTHING" | 4 |
| SaxenaLakshya/AI-Risk-Manager | T02 | No | 15 | "NOT_USEFUL — theatre" | 3 |
| MrBurber/KinGraph | T02 | No | 20 | "Honest writeup, inert premise" | 7 |
| ARYAN (aryanpajnee) | T01 | NONE | 28 | "Serious. THE CLOSEST THING IN THE FIELD" | — |

  VeerGetGit detail: backend/evals/ is a 0-BYTE __init__.py; three "test" scripts
  contain ZERO ASSERTIONS; a commit says "all 10 tests passing" and nothing in the
  repo can compute passing; payment_node.py:91 prints "Payment successful!" for an
  UNPAID order (its own DB has 5 orders, all status='pending'). Classified THEATRE.
  Sivanandini detail: dashboard.py is 418 lines of which ~150 are INLINE CSS/SVG,
  wrapped around "three hardcoded dicts in a for loop plus a Streamlit form.
  No loop, no tool use, no planning, no state, no trigger." Severity HIGH.
  ARYAN detail: "156 tests" claim SUBSTANTIALLY TRUE (153 def test_ + parametrize).
  "LLM never touches the money path" STRUCTURALLY TRUE — enforced by layout.
  Weaknesses: created 2026-08-25 (one day); the gate/ledger/agent layers are
  "specified and land next"; NO MEASUREMENT AT ALL — no batch metric, no held-out
  set, no baseline, no ablation. "Hasn't reached the measurement stage to be
  compromised at it."
  ALSO: "The FAILURES.md advantage is gone. At least one competitor is already
  writing the failure log live. It is now TABLE STAKES, not an edge."

--- Demonstrability, what actually scored ---
  9/10 shubhambhattog: "clean clone -> four commands -> full scorecard, 790-event
       ledger, graded eval, ALL OFFLINE IN UNDER A MINUTE; plus a human-gate
       toggle that VISIBLY COSTS Rs99k — the human gate blocking five actions on
       camera is a genuinely strong five-minute demo beat."
  8/10 Adarsh-Me: "make seed-demo && make demo-check is a ZERO-KEY DEMO PATH."
  4/10 VeerGetGit: "The React dashboard WOULD FILM WELL... but every demo needs
       live Groq + Razorpay keys and NO REVIEWER CAN REPRODUCE IT FROM A CLEAN
       CLONE."
  7/10 vaibhav375: "Deep and statistical rather than visual; HARD TO LAND IN A
       5-MINUTE VIDEO."
  abhinav-phi: "[Live Demo Video](#)" — THE LINK IS AN EMPTY ANCHOR.

--- Video craft ---
  FACT: "5-min pitch video, unlisted is fine"; public repo mandatory; video
  materially over 5 minutes is an implicit gate.
  Third-party briefing: build the video around "LIVE CODE EXECUTION, KEY FAILURE
  MODES HANDLED, AND ARCHITECTURE OVER STATIC SLIDES"; calls Build-Challenges the
  "Most Critical Field".
  Razorpay's own bundle: "12 answers. About 15 minutes... THE LAST ONE IS THE ONE
  WE READ FIRST" — "the last one" = "What broke, and how you got out."
  => Razorpay reads the FAILURE NARRATIVE BEFORE the repo and before the video.
  Only FOUR genuine participant videos existed at retrieval (449/521/402/16
  views); most repo video links are PLACEHOLDERS (youtu.be/YOUR_VIDEO_ID,
  PITCH_VIDEO_SCRIPT.txt). "A video surge is coming in the last ~10 days.
  RECORDING EARLY IS CHEAP INSURANCE."

--- FRONTEND VERDICT ---
  Rubric, verbatim from Razorpay's JS bundle: four pillars, equal billing,
  "NO MENTION OF NOVELTY, MODEL CHOICE, UI POLISH, OR SCALE."
  Evidence: presentation depth measured to have NO SIGNAL (135 vs 133 words);
  25% of winners ship nothing; the biggest frontend in the live field is THEATRE;
  the highest-rated competitor has NO UI.
  Counter-evidence, stated fairly: 7 of 11 live competitors have a frontend,
  including the bar-setter and both Demo-9s. The variable is UNCORRELATED IN BOTH
  DIRECTIONS — which is what a NEUTRAL variable looks like. But note the two 9s
  got there by making the DECISION visible (a gate blocking five actions, a
  calibration dial), NOT by making the page attractive.
  => Frontend polish is worth ~zero directly; its real cost is OPPORTUNITY COST.
     Build the minimum surface that makes a decision VISIBLE ON CAMERA and spend
     nothing further. The one asymmetry to respect is pillar 2, "does it run" —
     a ZERO-KEY `make demo` outranks any UI, and is exactly what VeerGetGit
     lacked despite the best-looking dashboard in the field.

--- REVIEW_*.md residual criticisms (11 of 15 resolved) ---
  STILL OPEN, and #8/#9/#10 have been asked for across THREE consecutive reviews:
   #8  "extractor returns schema-violating garbage" failure row — never landed
   #9  "self_conformance is not independent validation" disclosure — never landed
   #10 delete the "field's defining failure" em-dash clause — asked twice
   #11 `## Status` sits 8th of 10 — reader leaves with a materially wrong
       impression. A MOVE, not a cut.
   #12 "Verbatim" is not literally true (reflowed demo output)
   #13 `git clone ...` has a literal ellipsis; no Python pin, no requirements.txt
   #15 ~120 words of pure duplication across ARCHITECTURE/FAILURES/docstring;
       ARCHITECTURE.md has GROWN since the review
  All three PENALISED defects (unscripted tamper attacks, the vacuous CI claim,
  the missing money-path bounds) WERE executed and are now fixed.
  REVIEW_final: "Executed, this document is 87-88 and SHIP."

===============================================================================
3. DESIGN TOKENS  [VERIFIED from razorpay/blade, MIT]
===============================================================================
Sections on Indian fintech visual language, trust psychology, and the
policy-as-code UI genre are INCOMPLETE — those sub-agents were killed before
returning. Do not treat their absence as a finding.

Blade: @razorpay/blade v12.120.0, MIT, "Design System that powers Razorpay".
94 components. Razorpay also ships @razorpay/blade-mcp (get_blade_component_docs
etc). Docs: blade.razorpay.com

FONTS (fontFamily.web.ts)
  text:    "Inter", "Inter Fallback Arial", Arial
  heading: "TASA Orbiter", "TASA Orbiter Fallback Arial", Arial
  code:    "Menlo", San Francisco Mono, Courier New, Roboto Mono, monospace
  Both loaded as VARIABLE fonts, font-display: swap. TASA Orbiter weight axis
  125-950, stretch 75-125%; Inter 100-900.
  TASA ORBITER IS FREE — SIL OFL 1.1, on Google Fonts, commissioned for the
  Taiwan Space Agency (Local Remote). fonts.google.com/specimen/TASA+Orbiter
  Razorpay's Inter subset EXPLICITLY INCLUDES U+20B0-20BF — they deliberately
  subset the rupee sign into their Latin subset.
  Live site confirms TASA Orbiter + Inter Tight + Fragment Mono + Instrument
  Serif + Lato (Framer). docs uses Lato.

TYPE SCALE (typography.ts) desktop px:
  10 11 12 14 16 18 20 24 32 40 48 56 64 72
  lineHeights: 0 13 16 17 20 24 24 26 32 38 46 56 64 70 78
  letterSpacings: -3.3 / -1.3 / 0
  fontWeight: regular 400, medium 500, semibold 600, bold 700 — NO 800/900

SPACING (spacing.ts): 0 2 4 8 12 16 20 24 32 40 48 56
  NOT a pure 4pt grid — there is a 2px step and a 20px step.

RADIUS (border.ts): none 0, 2xsmall 2, xsmall 4, small 8, medium 12, large 16,
  xlarge 20, 2xlarge 24, max 9999, round 50%
WIDTH: none 0, thinner 0.5, thin 1, thick 1.5, thicker 2
  Blade's hairline is SUB-PIXEL (0.5px).

ELEVATION (elevation.web.ts) — unusually restrained:
  onLight lowRaised  0 2px 4px  hsla(200,10%,18%,0.06)
          midRaised  0 16px 12px hsla(200,10%,18%,0.06)
          highRaised 0 8px 24px -4px hsla(200,10%,18%,0.06)
  EVERY LIGHT-MODE SHADOW IS 6% OPACITY. Blade separates surfaces with BORDERS,
  NOT SHADOWS. Most copyable single fact in the system.

OPACITY: 0 .01 .06 .09 .12 .18 .24 .32 .48 .56 .64 .72 .80 .88 .94 1.0

MOTION (motion.ts):
  durations 2xquick 80, xquick 160, quick 200, moderate 280, xmoderate 360,
            gentle 480, xgentle 640, 2xgentle 960
  easings   entrance cubic-bezier(0,0,0.2,1) · exit (0.17,0,1,1) ·
            standard (0.3,0,0.2,1) · emphasized (0.5,0,0,1) ·
            overshoot (0.5,0,0.3,1.5) ·
            shake (1,0.5,0,0.5) — Blade documents "Use Case: Error States"

COLOR (bladeTheme.ts) — stored as hsla; hex conversions:
  surface.*.primary (brand)  azure.500    hsl(218,89%,51%)  #1364F1
  feedback.negative          crimson.600  hsl(4,85%,44%)    #D01E11
  feedback.positive          emerald.600  hsl(150,100%,28%) #008F47
  feedback.notice            cider.600    hsl(25,100%,44%)  #E05E00
  feedback.information       sapphire.600 hsl(200,100%,41%) #008BD1
  Reference frequency in bladeTheme.ts: azure/crimson/emerald/cider/sapphire = 86
  EACH; orchid/magenta/topaz = 32 each; forest 8; sea/cloud 4.
  => VIOLET IS NOT A RAZORPAY SEMANTIC COLOUR. (chart-only role INFERRED.)

  LIGHT NEUTRALS (blueGrayLight):
    0 #FFFFFF · 50 #F7F7F7 · 200 #DEE1E3 (border subtle) · 300 #C8CDD0 (border
    normal) · 700 #616D75 (text muted) · 1100 #292F32 (text subtle) ·
    1300 #050505 (text normal)
  DARK NEUTRALS (blueGrayDark):
    1200 #131415 · 1300 #1B1C1D · 1100 #1F2123 · 800 #3B3D40 · 600 #73787D ·
    300 #AEB0B2 · 500 #808589 · 0 #FFFFFF
  In dark mode surface.text.primary shifts azure.500 -> azure.300 #75AAFF —
  Blade LIGHTENS the brand blue rather than reusing it.

MARKETING SITE (scraped live):
  razorpay.com hex frequency: #192839 x78 (navy, dominant) · #40566D x19 ·
    #305EFF x13 (bright brand blue) · #F8FAFC x11 · #F0263C x9 · #0052B4 x9 ·
    #768EA7 x7 · #DFE3E9 x5 · #75A3FF x5
  razorpay.com/docs: #132644 x78 · #A2C5FB x4 · #48CFAD x2
  Marketing blue #305EFF is BRIGHTER than product azure.500 #1364F1 —
  deliberately different registers.
  razorpay.com/blog is WordPress and its palette (#9B51E0 #7BDCB5 #8ED1FC
  #F78DA7) is THE STOCK GUTENBERG DEFAULT, NOT RAZORPAY BRAND. Do not use.

VULCAN — the most relevant precedent. razorpay.com/foundation-model/ hex set is
  ALMOST ENTIRELY ACHROMATIC: #F4F4F4 #C8C8C8 #0D0D0D #000000 #FFFFFF #E5E5E5,
  and EXACTLY ONE CHROMATIC VALUE: #8FBFFF.
  Razorpay's newest AI-facing surface is near-monochrome with a single restrained
  blue accent. THIS IS THE REGISTER TO MATCH.

Amount component: defaults currency INR, uses @razorpay/i18nify-js
  formatNumberByParts (Indian grouping), and has `affixSubtle` — "makes the
  currency indicator and decimal digits small and faded". DE-EMPHASISED Rs AND
  PAISE, EMPHASISED RUPEES is a distinctive, verifiably-Razorpay typographic move.
UNVERIFIED: whether Blade sets font-variant-numeric: tabular-nums anywhere.
  Assume you must add it yourself.
UNVERIFIED: Fragment Mono's licence.

===============================================================================
4. THE HARVEST PREMISE — TESTED AND FALSIFIED  [CONFIRMED by fetching]
===============================================================================
The draft plan claimed "219 NPCI PDFs with working Wayback timestamps —
document discovery is SOLVED." A critic fetched them.

  corpus/npci/cdx_all.txt: 288 lines, 288 distinct URLs, 219 ending .pdf.
  (The other 69 are truncated/query-mangled.) That part is TRUE.

  18 random PDFs fetched via web.archive.org/web/{ts}id_/{url}:
    11/18 returned a real PDF.  FETCH YIELD ~61% -> ~130 of 219, not 219.
    The other 7: FIVE were ~5KB IMPERVA BOT-PROTECTION HTML SERVED UNDER A .PDF
    EXTENSION; one timeout; one HTML.
    0 OF THE 11 HAVE A TEXT LAYER. pypdf returns 0 characters on every one.
    The plan's own Stage-1 prefilter regex: 0 HITS ACROSS ALL 11 — because there
    are 0 characters to match.
    Same on the 6 PDFs already in corpus/npci/: 0/6 have extractable text.

  corpus/npci/PROVENANCE.md ALREADY DOCUMENTS ALL OF THIS:
    "Both are image-only scans — pdftotext returns EMPTY."
    "Trap: many snapshots are 1-3 KB Imperva bot-protection HTML masquerading
     as .pdf."
    "OC-228 DOES NOT APPEAR IN THE INDEX AT ALL."
  The two circulars the product is built on were NOT obtained from this index —
  they were fetched by a headless browser doing a same-origin fetch() after
  clearing Imperva. DISCOVERY IS SOLVED FOR TWO DOCUMENTS, BY A METHOD NOT IN
  THE PLAN.

  Real cost of Stage 0-2: fetch ~130 -> render EVERY PAGE to PNG (pdftoppm/sips,
  note /Rotate 270 per PROVENANCE) -> vision-LLM or OCR each page -> then filter.
  250-500 page renders and vision calls. 8-12h, not 5h.

  "8-15 claims/hour" is unsupported. The observed LIFETIME OUTPUT of this project
  is 7 authoritative claims from 4 documents, read visually off PNGs. Most NPCI
  circulars (chargeback procedures, brand guidelines, certification fees) contain
  NO NUMERIC CONSTRAINT, so the rate must be amortised over barren documents.
  Realistic: 4-8/hr -> a 6h timebox yields 25-45 CANDIDATES, not 45-70 claims.

  AND THE STRUCTURAL KILL: harvesting circulars grows the WRONG SIDE.
  eval/harness.py:75-110 iterates DECLARED cases. `scored` increments only when a
  case carries a PASS/FAIL label AND the verdict isn't UNDETERMINED. Adding 40
  authoritative claims about P2PM categories and chargeback windows adds EXACTLY
  ZERO to `scored`, because no counterparty has DECLARED anything about those
  subjects. Confirmed: make eval reports UNDETERMINED (abstained): 0 — there are
  no abstentions to convert.
  n>=50 requires ~50 INDEPENDENTLY-SOURCED DECLARED CLAIMS WITH GROUND TRUTH.
  That is Stage 4 — allocated 4h, the SMALLEST slice, and it is 100% of the gap.
  Even then you'd land a PASS-heavy pool where true_fail stays near 2 — a
  detection rate of 2/2 over 50, i.e. A FLATTERING DENOMINATOR, THE PRECISE THING
  harness.py:117-128 WAS WRITTEN TO REFUSE. Shipping it is self-indicting.

  IF IT YIELDS ONLY 20: harness.py:131 suppresses and batch.py exits 2 —
  IDENTICAL OUTPUT TO TODAY. 25-30h spent, eval moved nowhere, no video.
  This is the MOST LIKELY outcome and the draft had no branch for it.

===============================================================================
5. CRITIQUE ROUND — three adversarial lenses
===============================================================================

--- RUBRIC JUDGE: GO-WITH-CHANGES, 68/100 ---
 * Track 01's bar has NO METRIC CLAUSE. P3 (12h) served nothing graded.
 * "One failure handled gracefully" — bar clause 3 — HAD NO OWNER in the schedule.
 * The plan declared a frontend "worth ~zero" then made it THE LARGEST LINE ITEM
   (14h > P2's 10h). Either the belief is wrong or the number is. It's the number.
 * The decide() checks[] refactor is a MONEY-PATH CONTROL-FLOW CHANGE FOR A
   RENDERING REASON — banned by the plan's own cut list. And self_conformance.py:
   41-50 parses decide.py with ast matching literal Decision(allowed=False);
   restructure into a loop and the vacuity guard EITHER FIRES OR PASSES WHILE
   CHECKING NOTHING. Use a sibling trace() + a test asserting trace()[-1]==decide().
 * The six-drift framing is TOO CUTE. #1-#6 are defects found by a check that then
   BECAME CODE — that reads as engineering. A stale test count in a README is the
   WEAKEST of the seven. Leading with the weakest instance because it has the best
   rhetorical shape is the error. And the count was INFLATED (rows 1&3 are one
   defect; rows 5&6 are unimplemented promises, which is WORSE than drift).
 * P1 as drafted is CIRCULAR: our own ucp.py profile is built from the same 7
   claims as the store, so it CAN ONLY RETURN PASS (= FAILURES #3 again). An
   authored Cashfree doc is the compromised-target flaw. POINT IT AT THE PROBED
   RAZORPAY BOUNDS — real, declared by the counterparty's running code, already built.
 * G3 outranks P1: "P1 is a gate that doesn't fire; G3 is a gate the caller
   configures." ~2h. And Adarsh-Me/Agent-Audit — the NAMED DIRECT COMPETITOR —
   already resolves amounts server-side, agent sends only sku. Being beaten on
   this exact point is the worst available outcome.
 * BETTER FAILURES #7, found by running it: make demo twice created TWO DISTINCT
   REAL ORDERS (order_TUZG8GbOGU0GKY, order_TUZGosRS2KpJi4) because idem_key goes
   into `notes` — free-form metadata — while checkout.py:49 asserts it "MUST reach
   the payment API". A guard that cannot fire, ON THE MONEY PATH, first of its kind.
   (Verify Razorpay Orders API dedupe semantics before publishing; what is
    verified is the two order IDs.)
 * make verify on a FRESH CLONE: "ledger OK — empty (no HEAD anchor yet)", exit 0.
   README:16 tells a judge it walks the ledger. This is FAILURES #3(b)
   REINTRODUCED at the empty-clone case, in the SECOND COMMAND THE README TELLS A
   JUDGE TO RUN. 20 minutes. Best find available.
 * MISSING: WHERE_WE_DID_NOT_USE_AI.md with a COST column + an AST enforcement
   test with a vacuity guard (pillar 3 = 25% of the rubric; ~1.5h; cheapest point
   on the board; vaibhav375 ships tests/test_kernel_no_llm_imports.py).
 * MISSING: the only baseline is a STRAW MAN. FIELD_BAR:88 — "Every uplift claim
   in the field rests on a baseline the same author designed to lose." The project
   COMMITS THE THING IT INDICTS.
 * MISSING: clean-machine verification scheduled. (Good news: clone-and-run
   VERIFIED working on Python 3.14, stdlib only — schedule the check so you can
   CLAIM it.) Related: decide.py:10 opens a RELATIVE PATH at import time.
 * MISSING: research/ is 140 tracked files with NAMED TEARDOWNS of fellow
   applicants, two called "theatre", in a repo that MUST BE PUBLIC. Decide
   deliberately. (.env correctly gitignored; no secret found in history.)
 * MISSING: a submission-form draft as a scheduled artifact (3h). Read first,
   12-14 fields, NO EDITS AFTER SUBMIT.
 * MISSING: git-tag the MIN_N=50 pre-registration so it provably predates the result.
 * MISSING: aryanpajnee/RazorpayBuildathon still unexamined; FIELD_BAR:298
   explicitly recommends it before committing to Track 01.
 * REVERSAL: "DO NOT SUBMIT EARLY" is half right. The FORM freezes on submit; the
   REPO URL IS LIVE, so commits after submission still land. Dry-run the form D7,
   submit D8 evening, keep committing through D9.
 * Net: ~19h reclaimed and redeployed onto the three clauses actually graded.

--- FEASIBILITY CRITIC ---
 * THE DRAFT'S ARITHMETIC WAS WRONG BEFORE THE ESTIMATES: P3 header 12h / body
   15h; P4 header 14h / body 17h; §7 optional 22h. Listed ~80h, true ~110-112h,
   against ~55-60 available. Excludes the written submission entirely.
 * make demo is NOT byte-reproducible: creates a live order and prints a ledger
   count that grows every run. Normalise order_id and entry count or the committed
   transcript will never match twice.
 * P1 is CHEAPER than thought (4h) — engine.py:78, harness.py:21 and ucp.py:14 are
   already in the right shape. But CUT THE CACHE: counterparty_doc_sha256 DOES NOT
   EXIST anywhere in the repo. Inventing a field to cache a microsecond computation.
 * P2 is the LARGEST UNDERESTIMATE: 10h claimed, 13-19h real. SQLite alone 4-6h
   (used_idem_keys is a set; sqlite3 isn't thread-shareable under
   ThreadingHTTPServer without check_same_thread=False + a lock; blast radius
   includes test_merchant, test_server, test_e2e, and demo.py:59 M.blocks.clear()).
 * G3 DESTROYS THE HEADLINE REFUSAL SCENE. demo.py:61 and test_server.py:57-66
   BOTH trigger the money shot by the client posting block:{max_minor:2500000}.
   Stop trusting the client and there is NO WAY LEFT TO PRODUCE IT. Budget a
   REDESIGN (2-3h), not a patch.
 * G5 verify() in the money path is 0.5h, but ledger.py:19-22 re-reads and
   re-parses the WHOLE FILE — this makes every authorisation O(n). Fine at 76
   entries; state it.
 * DON'T MERGE P1 AND P2 — AMPUTATE P2/G1. checkout.py:22 ALREADY states the
   limitation. Trading a STATED limitation for an UNSTATED concurrency bug in a
   half-finished SQLite layer written under deadline is STRICTLY WORSE. Keep G3,
   G6, flock. Document the rest. (The suite runs in 1.06s — iteration is free,
   which argues for many small commits, not a two-day migration.)
 * RISKIEST ITEM IS P3, NOT P2: highest cost, lowest verified feasibility, no
   fallback branch. If it fails you lose the week AND the video.
 * SECOND RISKIEST AND ONLY UNRECOVERABLE: the video is D8 with NOTHING IN FRONT
   OF IT. Everything upstream slips into it. Move to D6.
 * SHIP THE SUPPRESSION AS THE FINDING. harness.py:117-128 + batch.py:24-25 are
   "the strongest code in this repository". Against a corpus where 0/224 winners
   volunteer a weakness in their own best number, a harness that REFUSES TO
   FLATTER ITS AUTHOR is worth more than a detection rate a solo student cannot
   honestly assemble in 9 days.
 * CHEAPER P2 (3.5h for ~80% of the credit): G3 + G6 + delete the two
   unimplemented ARCH:111 rows + a documented "WHAT THIS MONEY PATH DOES NOT
   SURVIVE" inventory with file:line and fix costs + the flock purely to keep
   make verify deterministic on camera. "A precise, self-indicting inventory of
   your own unfixed concurrency bugs, written by the person who found them,
   scores in the register FAILURES.md already scores in, AND CANNOT BE FAKED BY A
   COMPETITOR WHO DOESN'T KNOW THEIR OWN BUGS."
 * CHEAPER P3 (8h not 30h): probe caching + LOUD cases.py:111 + probe-parameter
   EXPANSION (frequency, type, method, currency, receipt length, amount floor,
   notes limits, contact validation — same code shape, bounded, 8 -> 20-25 scored
   with a real positive class) + rupee harm + one honest paragraph on N=50.
 * RISK 6, do it today: a Razorpay rate-limit DURING JUDGING -> cases.py:111
   swallows it -> eval reports VACUOUS TO THE REVIEWER. Headline finding vanishes.
 * RISK 8, already true: CI never runs make test. 10 minutes.

--- DESIGN / PRODUCT CRITIC ---
 * BLOCKING: screen 2 as specced CANNOT BE BUILT AND WOULD VIOLATE THE THESIS.
   OC-228/OC-200 are IMAGE-ONLY SCANS (PROVENANCE.md); there is no text layer and
   no extracted-text file in the repo. Rendering "circular text with anchors"
   means OCR-ing/transcribing it INTO the repo = A RESTATEMENT THAT OUTRAN ITS
   SOURCE, the exact artifact this project indicts.
   => Make it an IMAGE VIEWER. OC-228_live-2026-08-26_p2.png already exists, is
   already checksummed, and IS the actual provenance. Serve it with a highlight
   box, the doc SHA-256, and the source URL. "A scanned NPCI circular with a red
   box around 'maximum of Rs.10,000...' is the single strongest visual asset in
   this repository and the plan currently converts it into HTML paragraphs."
 * The 5 screens sum to 17h against a stated 14h, before CSS/shell/fonts/routing/
   statics. Call it 22h honest.
 * SCREENS 1, 2 AND 4 ARE THE SAME OBJECT VIEWED THREE WAYS. Collapse into one
   /decision/<id> with three bands. "On camera, navigation is dead time; every
   click is a cut you have to justify." (cf. Stripe payment detail, Vercel
   deployment page.)
 * DEAD WEIGHT: /ledger/<seq> — the payload is FOUR KEYS; a detail route over
   that is an empty page. /eval at 4h — Report is fourteen scalar fields; 2h.
 * MISSING AND CARRIES MORE WEIGHT THAN ANY OF THE FIVE: /drift. The plan's own
   video scene 5 is "the live drift... no competitor can have this" and IT IS
   RENDERED NOWHERE. "Every screen in the current five shows YOUR SYSTEM AGREEING
   WITH ITSELF. This is the only available screen that shows a finding ABOUT THE
   WORLD."
 * MISSING: RUPEES. Video scene 2 is "rupees on screen", problem taste is graded,
   and NOT ONE of the five screens displays a money amount at risk. The
   "Rs25,00,000 declared > Rs10,00,000 authorised" string ALREADY EXISTS in
   decide()'s detail field. Render it at 40px, not 13px.
 * Do the trace work on D1 ALONGSIDE P1, not D6. "Doing it on D6 as a prerequisite
   for a screen means discovering a semantic regression in the gate at 11pm two
   days before submission."
 * UI vs TERMINAL: split by function, 4:1 to terminal. Terminal owns "does it run"
   and the eval/tamper numbers (unedited-ness IS the evidence; stdout is expensive
   to fake, a browser renders any string you hand it). UI owns exactly THREE
   MOMENTS: refusal trace, circular scan, drift. ~90 seconds of 5 minutes.
   "You are not building an app, you are building three hero frames." That is the
   hard gold-plating stop.
   The Rs99k demo did NOT score because it was a UI — it scored because A QUANTITY
   WAS VISIBLY AT STAKE AND VISIBLY CHANGED. A judge scrubbing at 2x sees shapes
   and colour; a terminal at 2x is an undifferentiated grey wall.
 * SIX STDLIB TRAPS: (1) no hot reload — the real budget killer, 2-3h; fix with
   CSS in a real file served no-store + `make ui-snap` static render (TRIPLE
   DIVIDEND: no reload, committed HTML inspectable by a judge who won't run
   anything, and render-and-diff becomes a golden-file test — generated, not
   typed, ON THESIS). (2) HTTP/1.1 keep-alive: EVERY response needs correct
   Content-Length or the browser hangs. (3) static assets: NEVER
   os.path.join(root, self.path) — "shipping a directory traversal in a PAYMENTS
   SECURITY project is a self-own a reviewer will enjoy quoting"; use an explicit
   allowlist dict. (4) escaping: data contains " and Rs and § and >; one e()
   helper, every interpolation, enforced by a grep rule in self_conformance.py.
   (5) <meta charset> AND explicit UTF-8 — "mojibaked Rs/§ in a project about not
   corrupting a quote is thematically catastrophic". (6) five helpers only.
 * FONTS: TASA Orbiter is NOT on Google Fonts per this critic (the design agent
   says it is — RESOLVE BEFORE BUILDING). Either way you CANNOT use a Google
   Fonts <link> at all: it breaks offline operation and adds a network dependency
   to a project whose pitch is having none. Self-host three woff2 + licences.
 * "CIRCULAR" IS CORRECT AND NOT NOVEL — it is the house style of Stripe
   dashboard, Linear settings, Vercel project pages, EDGAR, Bloomberg. It reads
   INTENTIONAL when typography and spacing do the work colour normally does; it
   reads UNDER-DESIGNED when you remove the colour and replace it with nothing.
   THAT IS THE ENTIRE RISK.
   RISK 1 — one spacing value, no hierarchy. Enforce 3:1 SCALE CONTRAST on every
     page and go ASYMMETRIC (48px above a band label, 12px below). The gap BETWEEN
     sections must be ~4x the gap WITHIN one. "This single fix does more than
     everything else here."
   RISK 2 — 0.5px hairlines WILL LOOK BROKEN. On the non-retina 1080p display a
     judge watches your video on, they resolve to 1px OR TO NOTHING,
     inconsistently per element by subpixel position — some rows have a line and
     some don't, which reads unmistakably as a rendering bug. Use 1px in a light
     neutral (~#E8E8E8). And COLLAPSE ADJACENT BORDERS — a bordered table inside a
     bordered card doubles every line, "the single clearest tell of an
     unconsidered border-based design".
   RISK 3 — saturated colour as a FILL is "the fastest route to Bootstrap alert".
     Verdict word + a 3px left rule, nothing else.
     AND: #008F47 on white is ~3.6:1 and FAILS AA FOR NORMAL TEXT.
     DROP GREEN ENTIRELY — in an achromatic document "allowed" is plain near-black
     and ABSENCE OF RED MEANS ALLOWED. One colour is more opinionated than two,
     and cheaper.
   SMALLER: NO `shake` — it is a FORM-VALIDATION idiom and will read as "invalid
     input", cheapening a regulatory refusal into a typo. Pick ONE radius (4).
   NOT CONSIDERED IN THE PLAN: large flat near-white fields get BLOCKING
     ARTIFACTS around thin dark text at video bitrates. Use an off-white page
     (oklch(98.5% 0 0)) with pure-white cards — fixes it AND adds the layering
     this direction otherwise lacks.
 * CUT THAT SHOULD BE REINSTATED: "replay against history" was cut for the wrong
   reason — that reasoning applies to the UI, not the CHECK. decide() is pure and
   every input is in the ledger, so "replay the whole ledger, reproduce every
   decision byte-identically" is ~1 HOUR OF TEST CODE and the strongest available
   evidence for the determinism claim, which is the load-bearing claim of the
   architecture. Ship as `make replay`, not a screen.
 * PROMOTE TO MANDATORY: vendor disclosure to Razorpay. "You are submitting to
   Razorpay's own hackathon a finding that a Razorpay test API accepts values
   above what the circular authorises. Written notice BEFORE you present it is the
   difference between 'found a bug in the sponsor' and 'found a bug in the sponsor
   AND HANDLED IT LIKE A PROFESSIONAL' — and it de-risks the judging call, because
   YOU DO NOT WANT THE FIRST TIME RAZORPAY HEARS THIS TO BE FROM YOU ON CAMERA."
   Logging a non-reply is itself the artifact.
 * SAY "not attempted; could not verify access" about Vulcan rather than omitting
   silently — the same standard the project applies to everyone else.

===============================================================================
6. OPEN QUESTIONS / THINGS TO RE-VERIFY BEFORE CITING
===============================================================================
 * Is TASA Orbiter on Google Fonts? The design agent says YES with a URL; the
   design critic says NO. Resolve before building. (Either way: self-host.)
 * Fragment Mono's licence — UNVERIFIED.
 * Whether Blade sets font-variant-numeric anywhere — UNVERIFIED.
 * Whether orchid/magenta are strictly chart-only in bladeTheme.ts — INFERRED.
 * Razorpay Agent Studio / Agentic Payments / Vulcan — NO confirmed product page,
   GA status, or technical detail was obtained. DO NOT CITE.
 * UCP / ACP / SEP #216 / AP2 / x402 / NPCI UAP specs — UNVERIFIED this session.
   Note eval/cases.py already contains drift1-razorpay-sep216 as a local artifact;
   re-confirm against the live source before relying on it.
 * Razorpay Orders API dedupe semantics (for the FAILURES #7 idempotency claim) —
   verify against their docs. What IS verified is the two distinct order IDs.
 * Whether ACP/AP2/x402/UCP ship an official conformance checker — worth 20
   minutes; if none exists, "first public UCP profile inspector" is a real claim.
 * research/03_winners/ (41 files) and research/02_hackathons/ were NOT fully
   mined — a per-winner user-facing-surface tally, if it exists, would be there.
 * The comparable-product UI patterns (OPA/Styra, Vanta/Drata, Stripe Radar,
   Rekor/crt.sh, LangSmith/Braintrust, SSL Labs) are UNVERIFIED RECOLLECTION —
   canonical URLs, but not loaded this session. Re-check anything you assert
   on camera.
