# Round 01 — Judging Summary

**Panel:** IdeaAgent (adversarial) · **Judged:** 2026-08-26 · **Deadline:** 5 Sep 2026 (10 days)
**Ideas judged:** six, all Track 01 / agentic commerce · **Posture:** unimpressed by default, assuming a strong field

---

## Ranked table

| Rank | Idea | Global /100 | Razorpay fit /100 | Verdict | The one-line reason |
|---|---|---|---|---|---|
| **1** | **A4 / Clause · Circular** — no spend bound may exist without citing the clause authorising it | **82** | **88** | **GO** | The only idea whose measurement target it did not write itself, and the only one whose LLM is provably irreplaceable — the naive baseline reproduces a bug that actually shipped. |
| 2 | **B11 · Intent Drift** — did the agent buy what you actually asked for? | **79** | **46** | **NO-GO standalone · GO as component** | Best AI necessity and best product instinct in the pool, aimed at a question Razorpay did not ask. Strip `create_order` and nothing changes. |
| 3 | **A1 · `in.razorpay.upi`** — the UPI payment handler UCP is waiting for | **75** | **95** | **GO** | Best problem, best demo, highest Razorpay fit — undone by ornamental AI and a conformance metric scored against mutations the builder injected. |
| 4 | **A2 · Merchant Attestation Service** — filling the empty `keys[]` slot | **67** | **84** | **NO-GO** | "Is this merchant trustworthy" has no obtainable ground truth. The headline number is invented at both ends and cannot be fixed by iteration. |
| =5 | **A3 · The Constraint Layer** — eight authority types on a three-field rail | **63** | **88** | **NO-GO** | Best architecture, contested head-on by a better-executed competitor, and its metric ("does my gate match my spec") is a unit test wearing a metric's clothes. |
| =5 | **B1 · The Empty Quadrant** — a feasibility oracle for Indian agent payments | **63** | **68** | **NO-GO** | Dominated by A4: same engine, same circulars, same effort — but the model is demoted to a form-filler and nothing is enforced. |

**GO: 2 (A4, A1). GO-as-component: 1 (B11). NO-GO: 3 (A2, A3, B1).**

---

## The two attacks that sorted the field

**Attack 1 — pillar 3 ("the right tool in the right place, and where you chose not to use one"). Delete the LLM. What breaks?**

| Idea | What breaks if the LLM is deleted | Verdict |
|---|---|---|
| A4 | Everything — regex demonstrably cannot extract `(value, unit, scope)` jointly, and the proof is that the naive baseline *reproduces the real SEP #216 error* | **Passes, and can prove it** |
| B11 | Everything — no rule separates formal shoes from running shoes at the same price in the same category | **Passes** |
| A2 | Probably nothing — the design concedes the numeric rule produces the verdict; an honest ablation likely shows the model inert | **Fails quietly** |
| A3 | Nothing at runtime by design (correct), leaving the first half of the pillar empty; the competitor already enforces the same argument with an AST test | **Neutral, no longer differentiating** |
| B1 | Eight form fields, human-confirmed anyway | **Fails** |
| A1 | Prose. The handler publishes, the validator validates, the payment completes | **Fails** |

**Attack 2 — the 30-second measurement attack that killed every repo in the field. Where did the label come from?**

| Idea | Ground truth source | Survives? |
|---|---|---|
| A4 | Sentences in NPCI/RBI circulars written by third parties, checksum-pinned. Plus a genuine out-of-sample hit: it disagrees with a *published* document and the document is wrong | **Yes** — the only clean survivor. Residual weakness is single-annotator bias, disclosed |
| B11 | 150 (intent, cart) pairs the builder wrote, whose drift he designed, labelled by him | **No** — fixable in one move: real catalogues, real agent, discovered drift |
| A1 | 56 profiles the builder mutated. The label is the mutation script | **No** — a depth-1 stump scores ~1.00 |
| A2 | 100 invented merchants with planted labels. The independence claim is self-refuting: independent labels make the task unlearnable, so a good score disproves independence | **No, and unfixably** |
| A3 | A hand-written oracle encoding the same spec as the gate, by the same author | **No** — accuracy is 100% or it is a bug report |
| B1 | Invented scenarios, labelled from the same circular reading that produced the rule engine | **No** — doubly authored |

> **The field's universal blind spot is a compromised measurement target. Five of these six ideas reproduce it. One does not, and that one is A4.**

---

## Notes on the three NO-GOs

**A2** dies on an evidence problem, not a build problem — and evidence problems do not respond to iteration. Its verifier and `keys[]` publication step are a cheap, strong addition to A1. Adversarially testing a *verifier* (forged signature, expired claim, revoked key, replay, always-True verifier) is a real 50+ case metric with no invented ground truth; adversarially testing an *issuer's judgement about real businesses* is not.

**A3** dies on the competitor. `aryanpajnee/RazorpayBuildathon` has 153 verified tests, a structurally-enforced no-LLM money path, published Gate and ledger specs, and a live `FAILURES.md`. The corpus prescribed "differentiate on measurement," and this problem shape does not admit an honest one — specification conformance is what unit tests are for. Salvage the refusal-code taxonomy, the `remaining_authority` primitive, and the refund-decrement rule.

**B1** dies by domination. Same circulars, same OCR, same 403, same effort as A4 — but it chooses the form-filler over the hard extraction task and enforces nothing. Its empty-quadrant analysis remains the best framing asset in the corpus and belongs in the README and pitch video of whatever ships.

---

## Recommendation

**Build A4 / Clause as the measured core, hosted inside A1 as the product surface, and treat them as one project — not two.**

The judging makes the case almost mechanically. A1 has the best problem, the best demo and the highest Razorpay fit of anything available (95/100 — it is about UPI, about India, about the exact standards door Razorpay is publicly stuck outside, and a judge can verify its "before" state with one `curl` in ten seconds), and it fails on precisely two things: the LLM is ornamental, and its headline number is scored against mutations the builder injected. A4 has the opposite profile — the only load-bearing, provably-irreplaceable LLM job in the pool (joint value/unit/scope extraction from scanned circulars, where the naive "first ₹ figure" baseline reproduces the exact 3× error that shipped in Razorpay's own standards PR and sat unchallenged for four months), the only ground truth the builder did not author, and the single most memorable demo moment anyone in this field can produce — but it must fight to look like a product rather than a linter, and Track 01 asked for a working agentic-commerce system. Each supplies exactly what the other lacks, and the composite has one honest sentence: *an agent pays an Indian merchant by UPI, and no rupee bound anywhere in the system exists unless it cites the circular that authorises it — checked in CI, enforced at the money boundary, with the refusal quoting the clause.* That is a payments product with a verification spine, it hits all four rubric pillars without contortion (problem taste: a verified four-month-old defect in a public standards body; build quality: it clones, runs and refuses; AI judgment: a model doing something regex provably cannot, behind a human checksum, with the non-use argument written down and costed; failure recovery: OCR on scanned images behind a 403 will generate a real, unchosen debugging narrative — which is what gets read first), and it is the only configuration on the table whose headline number survives the attack the panel will actually run. **Two day-1 kill-gates must clear before any code is written: snapshot every primary NPCI/RBI source locally with checksums (`npci.org.in` 403s programmatic access, and the whole conformance premise dies without local copies), and execute one UPI test-mode payment end-to-end (business type *Individual*, not Sole Proprietorship, reveals "Get test keys").** B11 is the best pure-AI idea judged and should be added as a final semantic gate **only if the host lands first** — it is an upgrade, never the centre, because on its own it is excellent work submitted to the wrong company.
