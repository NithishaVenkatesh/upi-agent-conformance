# COPY DRAFTS — written 2026-08-27, before the artifacts they describe
Every external-source claim below carries the source's own hedge inline.
Source of record: research/11_final_selection/LIVE_API_FINDINGS.md §4.

===============================================================================
0. THE PREVENTION GATE — schema, not process
===============================================================================
ROOT CAUSE of instance #8: eval/probe_findings.json carries NUMBERS but not the
CAVEAT. Prose hedges don't travel; JSON fields do. Every downstream renderer
(a page, a script line, a slide) therefore gets the number unhedged BY DEFAULT.

FIX — make the hedge structurally inseparable from the figure:

  eval/probe_findings.json gains two required fields per finding:

    "framing": "the live rail permits 1.5x what the circular we can retrieve
                authorises, and nothing anywhere surfaces the difference",
    "not_claimed": "that Razorpay is wrong, or that Rs15,000 is unauthorised",
    "alternatives_not_excluded": [
      "a later circular may have raised the SBMD cap and is not in our corpus",
      "a different purpose code may apply (PC-76 operates at Rs5 lakh, so SBMD
       caps are demonstrably purpose-dependent)",
      "test mode may use different limits from production"
    ]

  THEN: a check in eval/self_conformance.py that FAILS if any finding in
  probe_findings.json lacks a non-empty `alternatives_not_excluded`, AND fails
  if a renderer emits `api_enforces_*` without also emitting that field.
  Self-test it against a known-bad fixture first — same discipline as the
  existing three fixtures, per FAILURES.md #3/#4: a check must prove it can fail
  before its pass is believed.

This converts "we happened to catch this one" into a gate. It is ~1h and it is
the only item here that prevents instance #9.

ALSO FROM THE SWEEP:
  ARCHITECTURE.md:42 hedges BY REFERENCE ("see LIVE_API_FINDINGS.md ... including
  why this is not stated as 'Razorpay is wrong'") rather than BY VALUE. A judge
  reading the Status table sees "two new drifts" and a link. Inline the hedge.
  README.md: no live-API claim. Clean, no action.
  All other Rs15,000 occurrences are the OC-201 MONTHLY figure — a different
  number, correctly scoped. No action.

===============================================================================
1. /drift — PAGE COPY
===============================================================================
Layout: the caveat block sits BETWEEN the two columns and the conclusion, not
after it. If the page's visual force is "these two numbers disagree", the hedge
must be inside that field of view, not below the fold.

---------------------------------------------------------------------------
                    WHAT THE RAIL PERMITS vs WHAT WE CAN CITE
                         probed 2026-08-27T01:43:15 IST
---------------------------------------------------------------------------

  THE CIRCULAR WE RETRIEVED          |   THE LIVE TEST API, PROBED
  NPCI/UPI/OC No.228 · Issuer §5     |   api.razorpay.com/v1/orders
  [scanned page image, clause boxed] |   token.type=single_block_multiple_debit
                                     |
  "The block created to be maximum   |   max_amount   accepted up to  Rs15,000
   of Rs.10,000 of block limit and   |                rejected at    Rs15,001
   up to 90 days."                   |   expire_at    accepted up to  91 days
                                     |                rejected at    120 days
  sha256 f478fbc17a0391c8...         |
  retrieved 2026-08-26               |   verbatim rejection:
                                     |   "Max amount for SBMD mandate cannot be
                                     |    greater than Rs. 15,000.00"
                                     |   "Token expiry cannot be greater than
                                     |    90 days for SBMD mandate."
---------------------------------------------------------------------------

  ! WHAT THIS IS NOT

    This is not a claim that Razorpay is wrong, or that Rs15,000 is
    unauthorised. We cannot conclude that from the public record. At least
    three explanations we CANNOT rule out:

      - A later circular may have raised the SBMD cap and may not be in our
        corpus. OC-228 is the most recent we could retrieve; NPCI returns 403
        to programmatic access and our enumeration may be incomplete.
      - A different purpose code may apply. Our own corpus shows PC-76
        (securities) operating at Rs5 lakh, so SBMD caps are demonstrably
        purpose-dependent.
      - Test mode may use different limits from production.

  WHAT IT IS

    The live rail permits 1.5x what the circular we can retrieve authorises,
    and nothing in the tool schema, the docs, or the API surfaces or explains
    the difference. A caller learns the bound by having a request refused.

    That gap is the thing this project exists to make visible. We found it in
    ninety seconds of probing, after days of failing to find it in
    documentation.

  ONE MORE, SMALLER, AND HARDER TO EXPLAIN AWAY

    The API's own error text says 90 days. The API accepts 91.
    The message and the enforcement disagree by one day.

  CHECK IT YOURSELF
    $ python3 tools/probe_testmode.py     # ~33 live test-mode calls
    $ cat eval/probe_findings.json        # cached, probed 2026-08-27T01:43:15

---------------------------------------------------------------------------

NOTE FOR THE BUILD: render the caveat FROM `alternatives_not_excluded` in the
JSON (§0), never as hardcoded page text. If the field is empty the page must
refuse to render the comparison at all. That is the gate doing its job.

===============================================================================
2. DISCLOSURE TO RAZORPAY — draft, DO NOT SEND UNREVIEWED
===============================================================================
Tone rule: this is a QUESTION from someone who expects to be wrong, not a
finding. Every sentence should survive being read aloud by the engineer who
wrote the endpoint.

---
Subject: Question about SBMD mandate limits in test mode vs NPCI OC-228

Hello,

I'm a student building a project for the AI Buildathon (Track 01) that checks
payment-constraint claims against the NPCI circulars that authorise them. While
probing test mode with my own rzp_test_ keys, I found something I can't account
for from the public record, and I'd rather ask than assume.

Creating an order with token.type="single_block_multiple_debit", the API accepts
max_amount up to Rs15,000 and rejects Rs15,001, and accepts expire_at up to 91
days. The most recent NPCI circular I've been able to retrieve, OC No.228
Issuer §5, reads: "The block created to be maximum of Rs.10,000 of block limit
and up to 90 days."

I'm not assuming the API is wrong -- there are at least three explanations I
can't rule out, and any of them would fully account for it:

  1. A later circular raised the SBMD cap and isn't in my corpus. NPCI returns
     403 to programmatic access, so my enumeration is likely incomplete.
  2. A different purpose code applies. I can see PC-76 operating at Rs5 lakh,
     so these caps are clearly purpose-dependent.
  3. Test mode uses different limits from production.

If any of those is the answer, I'd be grateful to know which, and I'll correct
my write-up. If it would help, I'm happy to share the exact request bodies.

Separately and much more minor: the rejection message for expire_at reads
"Token expiry cannot be greater than 90 days for SBMD mandate", but 91 is
accepted. That one looks like an off-by-one in the message or the check.

For transparency: this project is a buildathon submission and the comparison
above appears in it. I wanted you to see it and have the chance to correct it
before I submit, rather than after. If any of this is inaccurate or shouldn't be
published, please tell me and I'll change it.

Thank you,
[name] · [repo URL]
---

HANDLING: send BEFORE the submission, not after. Log the send timestamp and any
reply -- or the absence of one -- in research/11_final_selection/. A logged
non-reply is still the artifact; it evidences that notice was given.
IF THEY REPLY WITH AN EXPLANATION: the finding does not disappear, it IMPROVES.
"We asked; here is what they said; here is the corrected claim" is a better
story than the original, and it is FAILURES.md #6's shape exactly.

===============================================================================
3. SUBMISSION FORM — the two fields, deliberately separated
===============================================================================
The original conflation happened because both answers were competing for one
slot. They are different questions. Keep them apart.

--- FIELD: "Project Objectives / What does it solve?" ---
    (the PRODUCT pitch — the drift finding, caveats intact)

A merchant reads Razorpay's Reserve Pay documentation -- "Guaranteed Collection:
funds are pre-blocked, ensuring you receive payment regardless of customer's
later financial situation" -- designs a ship-first flow, delivers the service,
and the debit declines. NPCI OC-228 acquirer §2 says the opposite in one
sentence: "The block created shall NOT be treated as the guarantee of payment."
Nothing checks a vendor's restatement against the circular that authorises it.

This is an agent-payable Indian merchant whose every payment passes a gate that
refuses, quoting the clause, when a declared constraint doesn't match the
checksummed circular behind it. The model reads documents; the model never moves
money.

It caught four published contradictions across two companies. Then, probing
Razorpay's own test API, it found the live rail accepts a Rs15,000 block cap and
a 91-day expiry where the circular we could retrieve authorises Rs10,000 and 90
days -- found by executing against the API, not by reading about it.

We are careful about what that last one means: we cannot conclude Rs15,000 is
unauthorised. A later circular may have raised it, a different purpose code may
apply, or test mode may differ from production. The claim is narrower and still
worth making: the rail permits 1.5x what we can cite, and nothing surfaces the
difference. We have written to Razorpay to ask which explanation is right.

The point isn't a gotcha. It's that constraint claims drift from the regulation
authorising them, nothing catches it, and this is the mechanism that does --
including when the drift is ours.

--- FIELD: "What broke, and how you got out?" ---
    (the FAILURE pitch — A3, the money-path defect)

Six times, this project committed the exact error it was built to catch. The
sixth was the one that mattered, because I found it by running the code rather
than reading it.

merchant/checkout.py carries a comment I wrote: "idem_key MUST reach the payment
API: our replay guard is in-process, so a crash between capture and store would
otherwise re-charge on retry." The guard was real. But the client put idem_key
into the order's `notes` field -- free-form metadata that no deduplication reads.
I ran `make demo` twice and got two distinct real orders, order_TUZG8GbOGU0GKY
and order_TUZGosRS2KpJi4. The idempotency guarantee was inert on the live path,
and had been since the day live keys landed.

That is the seventh instance of one shape in this project. The first five were
checks that could not fail: a CI gate with no possible true positive, a tamper
suite whose mutation was a no-op, an eval harness reporting a rate over an empty
positive class. The sixth was a claim that could not be checked -- an assertion
about someone else's server that nothing in my test suite could refute. This one
is the first on the money path, and it was shipping real orders.

What I changed is not the fix; the fix was small. It is that every one of these
became a test that proves it can fail before its pass is believed --
eval/tamper.py asserts its own mutation actually mutated; self_conformance.py
runs three known-bad fixtures before trusting itself; eval/harness.py refuses to
print a headline over an empty positive class and currently exits 2 against me.

The eighth instance appeared while I was writing the plan to prevent the
seventh: I restated the Rs15,000 finding without carrying the caveat my own
source document had attached to it. So the caveat now lives in the JSON schema
beside the number, and a check fails if a renderer emits one without the other.
Detection has a ceiling -- it only catches what someone thinks to check. That
one is a gate.

===============================================================================
4. BASELINE — the decision, made concretely (replaces "tuned")
===============================================================================
"Tuned baseline" was hand-waving and is struck.

DECISION PROCEDURE, in order. Take the first that is affordable:

  (A) SAME MODEL, GENERIC PROMPT. The comparison arm is the identical Azure
      deployment asked plainly -- "extract any limits from this text" -- with NO
      scope-binding instruction, NO schema, NO verbatim-quote rule, NO
      confidence floor. This is off-the-shelf in the sense that matters: nothing
      in the arm was designed by us to lose, because nothing in the arm was
      designed by us at all. The uplift then measures exactly what we claim it
      measures -- the schema and the scope discipline, not the model.
      COST: ~1h. This is the recommended arm.

  (B) A PUBLISHED TOOL with independent provenance (a general document-QA model
      or a table-extraction library whose authors never saw this task).
      COST: 2-4h + a dependency, which we are otherwise refusing to add.

  (C) PRE-REGISTER OUR OWN. Commit the baseline and its config, git-tag it, THEN
      run ours. Same discipline as the MIN_N=50 tag. The tag is what makes it
      legitimate: it proves the arm was fixed before its result was known.
      COST: ~1h, but weaker than (A) and only used if (A) is unavailable.

  (D) IF NONE ARE FEASIBLE: DROP THE UPLIFT CLAIM ENTIRELY.
      And then sweep for it downstream -- the pitch, README, ARCHITECTURE.md
      "Numbers" table, the video script -- so no uplift number survives without
      a legitimate comparison behind it.

extract/naive.py DOES NOT GO AWAY. It keeps its real job: reproducing the exact
SEP #216 error, as an existence proof that the obvious deterministic approach
produces the bug that actually shipped. That is an ILLUSTRATION, and it is
honest as one. It is simply not a baseline, and must never again be labelled
one -- including in ARCHITECTURE.md's "Numbers" table, which currently calls it
"Baseline".
