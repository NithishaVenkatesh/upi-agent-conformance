# The Real Rubric — recovered from Razorpay's own JS bundle

| Field | Value |
|---|---|
| Source | `https://razorpay.com/build/browser/f50d7c33dce175db76f21a3cd3fed55c50efb6ee/js/modern/main.67f36351.js` |
| Retrieved | 2026-08-26 |
| Snapshot | `raw/main_bundle_2026-08-26.js` (224,809 bytes) |
| Evidence class | **FACT — primary source.** This is Razorpay's own first-party content object, not reporting about it. |

## Why this file matters

The server-rendered HTML of razorpay.com/buildathon contains only ~4.3 KB of text. **The evaluation rubric, the deadline, and the application checklist are client-rendered and therefore invisible to an ordinary scrape.** Most applicants will never see them. They are hard-coded as a plain JS object in the bundle above.

---

## 1. THE DEADLINE — `FACT`

```js
p = { statement:"Your code speaks louder than your resume.",
      footer:["Razorpay AI Buildathon","Applications close 5 September"] }
```

> **Applications close 5 September.**

Retrieved 2026-08-26 → **10 days remaining.** Independently corroborated by Razorpay Careers on LinkedIn (2026-08-25, "Apply by 5 Sep").

Combined with the form's no-edit confirmation checkbox — *"I understand that no further changes or edits can be made after submitting"* — there is **one shot and a hard stop.**

## 2. THE EVALUATION RUBRIC — `FACT`, verbatim

```js
hired: {
  s04: { n:"04", title:"Get evaluated",
         sub:"We look at how you think, build and solve problems." },
  rubric: [
    { k:"Problem taste",     v:"did you pick something that actually matters" },
    { k:"Build quality",     v:"does it run, is it structured, would you trust it" },
    { k:"AI judgment",       v:"the right tool in the right place, and where you chose not to use one" },
    { k:"Failure recovery",  v:"what broke, and what you did about it" }
  ], ... }
```

**Four pillars. Equal billing. No mention of novelty, model choice, UI polish, or scale.**

| Pillar | Verbatim test | What it actually demands |
|---|---|---|
| **Problem taste** | *"did you pick something that actually matters"* | Problem selection is itself graded. A flawless build of a trivial problem fails pillar 1. This is why the market-evidence work is not optional decoration. |
| **Build quality** | *"does it run, is it structured, would you trust it"* | Three separate gates. **"Does it run"** — a reviewer will clone and execute it; setup must be frictionless. **"Is it structured"** — legible architecture. **"Would you trust it"** — the hardest one, and it is about money-safety, not test coverage. |
| **AI judgment** | *"the right tool in the right place, **and where you chose not to use one**"* | The most discriminating clause on the entire site. An LLM-everywhere system **fails this pillar by construction.** You are explicitly rewarded for the places you used a deterministic rule, a SQL query, or a regex instead — and for being able to say why. |
| **Failure recovery** | *"what broke, and what you did about it"* | See §3 — this is the first thing they read. |

## 3. THE FAILURE NARRATIVE IS THE FIRST-ROUND SCREEN — `FACT`

The application checklist object:

```js
build: { label:"about the build", items:[
  "Your track", "Project name", "What it solves",
  "GitHub repo URL, public", "5-min pitch video, unlisted is fine",
  "What broke, and how you got out" ]},
note: "12 answers. About 15 minutes. We still take the resume.
       We just don't screen on it. The last one is the one we read first."
```

> **"The last one is the one we read first."**

"The last one" is *"What broke, and how you got out."*

`INFERENCE — very high confidence:` Razorpay reads the failure narrative **before** the repo and before the video. Nearly every applicant will treat that box as an afterthought. It is, on this evidence, the highest-leverage 300 words in the entire submission — and the project should be **chosen partly for whether it will generate a genuinely interesting failure story.**

Reinforced by the resume-diff object on the page:

```js
r = { file: "@@ -resume.pdf  +proof @@",
      removed: ["9.1 CGPA, top 5% of batch", '"Python, C++, MS Office"', '"Team player. Fast learner."'],
      added:   ["a repo that actually runs", "a 5-minute video of it working",
                "what broke at 2 AM, and how you got out"] }
```

## 4. PROCESS AND TIMING — `FACT`

```js
s = [{n:"01",t:"Pick a track"}, {n:"02",t:"Build something real"},
     {n:"03",t:"Show your work: repo, 5-min video, architecture"},
     {n:"04",t:"If it has signal, we call you in"}]
```

From the sibling `/ai-builders/` page: *"Three steps. No nonsense. — Fill the form · Submit your project or GitHub · **If it has signal, we'll call in 48 hrs**"* → shortlist callback within ~48 hours of review.

Also confirmed: **"5-min pitch video, unlisted is fine"** — unlisted YouTube is explicitly acceptable. And **"GitHub repo URL, public"** — public is mandatory.

## 5. DISCREPANCY TO RESOLVE — `FACT`

The site checklist lists **12** items including a **"Resume file"**. The live Google Form I parsed on 2026-08-26 has **14 items and no file-upload field**. Possibilities: the file upload requires Google sign-in to render; or the form was revised. Non-blocking, but **have a resume ready.**

## 6. WHAT RAZORPAY SAYS IT HAS ALREADY BUILT — `FACT`

From the `/ai-builders/` content object:

> *"**We're doing a lot with AI. We still don't think it's enough.** Razorpay teams have built **Slash, Call-E, AI-led marketing campaigns, Agentic Platform, Agentic Payments, and Agent Studio** to solve real production problems."*

And separately, `https://razorpay.com/foundation-model/`:

> *"Meet **Razorpay Vulcan**, India's first AI Payments Foundation Model, built with **NVIDIA and AWS** to improve payment success, fraud detection and checkout."*
> *"Decisions made in milliseconds. See the intelligence behind every transaction."*
> *"Every transaction moves through a web of methods, banks, networks and risk checks."*

**Strategic consequence — this is the most important competitive fact in the whole corpus.** Razorpay already ships, in production: a payments foundation model (Vulcan), an agent platform, agentic payments, and **Agent Studio** — whose prebuilt agents reportedly include Dispute Responder, RTO Shield, Subscription Recovery, Abandoned Cart Conversion, Settlement Insights and Cashflow Forecaster.

Those map almost exactly onto the "example directions" for Tracks 02, 03 and 04.

> Therefore: **the obvious build in Tracks 02/03/04 is a re-demo of a product Razorpay already sells** — judged by the people who built it, against a production baseline the applicant cannot see. That is not automatically fatal (see the saturation rule), but it raises the bar for differentiation enormously, and it must be answered head-on in any idea from those tracks.

## 7. WHO THEY WANT — `FACT`

> *"People who are always thinking how to harness AI, **see every workflow as an agent loop**, speak in prompts and GitHub links, and can show projects they have shipped or seriously prototyped."*
> *"A role for builders who can turn **ambiguous business and product problems** into working AI systems, prototypes, automations, and agentic experiences."*

## 8. CONSOLIDATED: WHAT WINS

Merging the four rubric pillars with the five track "bars":

1. **Pick a problem that visibly matters** — and be able to defend the choice with evidence.
2. **Ship a repo that clones-and-runs.** Not a demo video of a repo.
3. **Use AI surgically, and document where you deliberately did not.** A written "why there is no LLM in this path" table is a direct hit on pillar 3.
4. **Report honest numbers over a batch**, including the false-positive cost and the exceptions you could not resolve.
5. **Bound and gate every money action; leave an audit trail.**
6. **Write the failure narrative as a first-class artifact** — it is read first.
