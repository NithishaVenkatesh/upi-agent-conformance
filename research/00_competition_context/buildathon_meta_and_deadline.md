# Razorpay AI Buildathon — Meta & Deadline Research

**Compiled:** 2026-08-26
**Researcher note:** Firecrawl MCP was unavailable (Docker not running); research done via direct HTTP fetch (curl), WebSearch, WebFetch, and Jina reader proxy. Every claim below carries a source. Findings are labelled **FACT** (directly evidenced), **INFERENCE** (reasoned from evidence), or **HYPOTHESIS** (plausible, unverified).

---

## 1. DEADLINE

### Headline answer

## **DEADLINE: 5 SEPTEMBER 2026 — CONFIRMED FROM A RAZORPAY PRIMARY SOURCE.**

**FACT.** The deadline *is* on razorpay.com/buildathon/ — it lives in the page footer, which is rendered client-side and therefore invisible to a plain HTML fetch. It is hard-coded in Razorpay's own JavaScript bundle:

```
https://razorpay.com/build/browser/f50d7c33dce175db76f21a3cd3fed55c50efb6ee/js/modern/main.67f36351.js

p = { statement: "Your code speaks louder than your resume.",
      footer: ["Razorpay AI Buildathon", "Applications close 5 September"] }
```
(Bundle downloaded and grepped directly, 2026-08-26.)

No year is given in the string, but the program starts September 2026 and the form is titled "Razorpay AI Builder Internship 2026" → **5 September 2026**. Confidence: **HIGH on date, HIGH on provenance.** ~10 days remain as of 2026-08-26.

### Why it looked missing at first (methodological note worth keeping)

The server-rendered HTML at `razorpay.com/buildathon/` contains only ~4,280 characters of text and stops at "Apply now". Roughly half the page's copy — including the footer deadline, the evaluation rubric, the resume-diff section, and the form checklist — lives inside `main.67f36351.js` as a JS object. **Anything scraped from the raw HTML of this site is incomplete.** The full copy corpus is in the bundle.

### Corroboration

| Source | Deadline stated? |
|---|---|
| **`main.67f36351.js` (Razorpay's own bundle)** | **YES — "Applications close 5 September"** (primary, authoritative) |
| **Razorpay Careers, LinkedIn, 2026-08-25** | **YES — "Apply by 5 Sep."** Verbatim: *"Resumes are background noise. Your build is the signal. We're hiring AI Builder Interns through the Razorpay Buildathon. Five tracks… No aptitude test. No GD. Just a public repo and a 5-minute pitch. 6 or 12 months · Bangalore · Students only. Apply by 5 Sep."* (295 reactions, 9 comments at retrieval). **Second independent Razorpay-owned confirmation.** |
| https://razorpay.com/buildathon/ — server-rendered HTML only | NO (footer not in SSR output) |
| JSON-LD `schema.org/Event` block embedded in that page (extracted 2026-08-26) | **NO `startDate` / `endDate` at all.** The Event object has only `name`, `description`, `eventAttendanceMode`, `location`, `organizer`, `potentialAction → https://forms.gle/d9r2gvxp8cmoZhon9`. |
| The application Google Form itself (`docs.google.com/forms/d/e/1FAIpQLScJ9XSqVCB2oaPwEMH0Zk3I1OpILFW1WpWdWweQ2950jdRzlg/viewform`, form config `FB_PUBLIC_LOAD_DATA_` dumped 2026-08-26) | **NO.** Form title "Razorpay AI Builder Internship 2026". No deadline text in any field, description, or confirmation message. |
| web.archive.org | **NO CAPTURES EXIST.** `http://archive.org/wayback/available?url=razorpay.com/buildathon/` → `{"archived_snapshots":{}}`; CDX API `http://web.archive.org/cdx/search/cdx?url=razorpay.com/buildathon*&output=json` → `[]`. So there is no earlier version of the page that listed a deadline and later removed it. **FACT.** |

**FACT:** The deadline is published only in the client-rendered footer of razorpay.com/buildathon/. It is absent from the JSON-LD Event object and from the application form itself.

### Independent secondary corroboration (all say 5 September 2026)

1. **FACT** — Third-party "Master Briefing" PDF, `Razorpay_AI_Buildathon_Briefing.pdf` (Dropbox, linked from a YouTube creator's `buildathon.openinapp.link/briefing` shortlink; direct PDF retrieved 2026-08-26). States under "Important Timeline & Deadlines": *"Application Closing Date: September 5, 2026"* and in the checklist *"Submit the Google Form prior to September 5, 2026."*
   ⚠️ **INFERENCE: this PDF is NOT an official Razorpay document.** It is not hosted on razorpay.com, is titled "Master Briefing Document", and contains at least one factual drift from the real Google Form (it lists an "Email Address" field as field #1 of 12; the live form's first visible question is "Full Name"). Treat its *content* as a high-quality third-party digest, not as Razorpay's word.
2. **FACT** — X/Twitter post by @ajay_2512x, 2026-08-20 11:01 IST, 24.9K views: *"Applications close: 5 September"*. Third party, not Razorpay.
3. **FACT** — Velonx blog, "Razorpay AI Buildathon 2026: Tracks, Eligibility, Stipend & Selection Process", dated Aug 20 2026: *"Application deadline September 5, 2026"*; also notes explicitly *"Razorpay hasn't published a full public timeline beyond the application deadline."*
4. **FACT** — offcampusjobs4u.com: *"Last Date 05 September 2026"*, repeated in its FAQ.
5. **FACT** — fresherjobseva.com: *"apply online before 05 September 2026."*
6. **FACT** — coursejoiner.com (Aug 21 2026): *"Application Deadline September 5, 2026."*
7. **FACT** — YouTube video `mmENFZNA8qE` (published 2026-08-21), description: *"🔥 Applications Close: 5 September"* and *"⚠️ Applications close: 5 September"*.

### Dissenting source (now explained)

- **FACT** — fresherjobinfo.in states: *"Razorpay has not announced a last date for this drive."* (retrieved 2026-08-26). **INFERENCE:** that writer scraped the server-rendered HTML and never saw the client-rendered footer. Disregard.

### Practical reading

**RECOMMENDED ACTION:** treat **2026-09-05** as hard. Submit at least 48h early. The form has a **"Final Submission Confirmation"** checkbox stating *"no further changes or edits can be made after submitting"* — so there is no edit-after-submit escape hatch. Budget accordingly.

---

## 2. LAUNCH / ANNOUNCEMENT DATE

- **FACT** — Earliest dated public artefacts found are all **2026-08-20**:
  - X post @ajay_2512x — 2026-08-20 11:01 IST
  - Velonx explainer blog — Aug 20, 2026
  - YouTube `Qz9Jn8U_nXQ` (Shivam Chaudhary) — 2026-08-20
  - LinkedIn post by Vishwanath Barve — "5 days ago" as of 2026-08-26 → ~2026-08-21 (activity id 7496198940783210496)
  - LinkedIn post by Ashinee Kesanam — "3 days ago" as of 2026-08-26 → ~2026-08-23 (activity id 7496914271059144704)
- **FACT — earliest *official Razorpay* post: 2026-08-25 06:16 UTC** (Razorpay Careers on LinkedIn). That is **five days after** the earliest community post.
- **INFERENCE:** Public launch was **on or about 19–20 August 2026**. Razorpay seeded it quietly (page + Google Form, no newsroom item, no press) and let organic X/LinkedIn amplification run for five days before posting officially. The program is roughly **6 days old** as of 2026-08-26, with **10 days** to the deadline.
- **FACT — there is NO mainstream Indian tech-media coverage.** Direct site searches all returned zero relevant hits: Inc42 (0), Entrackr (0), YourStory (only unrelated "Viksit Bharat Buildathon" and YourStory's own GenAI Buildathon), Analytics India Magazine (0), and **Razorpay's own newsroom** `razorpay.com/newsroom/?s=buildathon` (0). Moneycontrol / ET / Business Standard were **not individually checked** — treat as *unchecked*, not *absent*.
- **INFERENCE:** the absence of a newsroom item confirms this is a talent-acquisition experiment run by the careers/recruiting function, not a PR campaign. That matters: the readers are engineers and recruiters, not journalists, and the evaluation will be correspondingly technical.
- **FACT (context)** — Razorpay announced **Vulcan**, "India's First Transformer-based AI Foundation Model built for payments", trained on ~3 trillion data points across 4 billion payments, on **2026-08-18** (AWS/Amazon press centre release), i.e. **two days before** the Buildathon surfaced publicly.
- **INFERENCE (strategically important):** The Buildathon is part of a coordinated August 2026 AI push, not a standalone campus stunt. Submissions that echo Vulcan-adjacent themes — payment reliability, routing, fraud/risk prediction, learning from transaction streams — sit inside the narrative Razorpay is already telling publicly.

---

## 3. PRIOR EDITIONS

**INFERENCE (moderate confidence): this is Razorpay's first *student-only, hiring-driven* buildathon.** No source anywhere states "first edition" — **EVIDENCE NOT FOUND** for an explicit first-edition claim. But Razorpay had already used the word "Buildathon" in April 2026 for a different event, so "first edition" is only true with qualifiers. Supporting: `razorpay.com/buildathon/` has **zero Wayback captures** (FACT).

### Razorpay's full competition history (FACT unless noted)

| Program | When | Audience | Public results / repos? |
|---|---|---|---|
| **Status 402** | Mar 2017 | Internal employees | Blog post only, no winner names. Razorpay's own blog calls it *"our first hackathon"* |
| **Razorpay FTX Hackathon** (Devfolio) | 10–13 Dec 2020 | Public, team-based | **YES — the only edition with fully public results and repos** |
| **FTX 2021 Hackathon** | 10–13 Dec 2021 | Public | Winners announced on X 2021-12-13; **no public project gallery**; exact winner list EVIDENCE NOT FOUND |
| **HACK:O(n)** | annual; 9th edition by Jul 2024 | Internal only | Aggregate stats only (800+ employees, 215 teams, 3 days, 50+ bounty challenges); no winner names or repos |
| **RBI HaRBInger** | 2023 | Razorpay *competed*, did not organise | Won 1st prize with "DrishtiPay" |
| **OpenCode Buildathon (GrowthX)** | ~Apr 2026 | 100 invited devs, hosted at Razorpay HQ | No public results found |
| **AI Buildathon** | Aug–Sep 2026 | **Students only, hiring funnel** | Ongoing |

### The one prior edition with a public corpus: FTX Hackathon 2020 (FACT)

Pulled from Devfolio's public project search API (`POST https://api.devfolio.co/api/search/projects`, `hackathon_slugs: ["ftx-hackathon"]`) — **26 projects total**:

- **Ka-ching** — Hackathon Winner, ₹200,000 — https://github.com/kunaltawatia/razorpay-ftx-hackathon
- **InOffice Pay | UPI For Businesses** — Second Prize, ₹100,000 — https://github.com/xDAnkit/inoffice-pay-razorpayx
- **Sahayak** — Third Prize, ₹50,000
- 23 further public submissions (Razorpay Spotlight, Rico, FINITY, Gullak, Scart, Fund+, …), most with public GitHub links

Judges: **Raju Shetty** (Head of Engineering, Razorpay), **Shashank Kumar** (Co-founder, Razorpay), Rajat Agarwal (Matrix Partners India), Ishaan Mittal (Sequoia), Kailash Nadh (CTO, Zerodha). Stated prize pool $4,813. Participant count: EVIDENCE NOT FOUND.
Razorpay also maintains https://github.com/razorpay/ftx-hackathon (created 2020-11-23, 145 subscribers) — wiki pointer only, no winners listed.

**INFERENCE:** FTX 2020 is worth 20 minutes of study only as a read on *taste* — what a Razorpay-convened panel picked when the pool was open-ended. It is 6 years stale and the 2026 bar (measured metrics, audit trails, held-out sets) is far more specific.

### ⚠️ Three decoys to keep out of any downstream artefact

1. **TipRanks, 2026-04-18: "Razorpay Hosts AI Buildathon to Deepen Ties With Developer Ecosystem"** — **NOT this program.** It describes the GrowthX **OpenCode Buildathon** hosted at Razorpay HQ: 100 participants, ₹100,000 in cash+credits, 8-hour session. Different event, audience, and organiser.
2. **"Voice AI Buildathon" / "Sarvam AI Buildathon"** (GrowthX®, Ringg AI, ~June 14, ₹3.5L prizes) — third-party community events *using Razorpay as a venue*, not Razorpay hiring programs.
3. **`hackortech.in` "Razorpay AI for Good Hackathon 2026, ₹1.2Cr prizes, deadline 2026-08-20"** — **likely aggregator fabrication.** Its "View original posting" link is a self-referencing anchor (`#`) with no upstream source, and there is zero corroboration on razorpay.com or any Razorpay channel. **Do not rely on it.**

### Not listed anywhere else (FACT / EVIDENCE NOT FOUND)

No Razorpay-hosted hackathon or ideathon found on Unstop, Devpost, HackerEarth, or Hack2Skill — for this program or any prior one. (Surfaced via web search 2026-08-26; LinkedIn post bodies were not directly retrievable.)

---

## 4. RAZORPAY COMMENTARY ON THE BAR

### 4a. The bar, as stated on razorpay.com/buildathon/ (FACT, verbatim, retrieved 2026-08-26)

Per-track "The bar" statements — **these are the actual scoring language and should be treated as the rubric**:

- **Track 01 — AI Growth & Agentic Commerce:** *"Every money action explainable, bounded and gated. Show the audit trail and one failure handled gracefully."* Context: *"NPCI's UAP and the global protocol race (ACP, AP2, x402) make agent-to-agent commerce the open problem of the year, and Razorpay's in-app pilots are already live."*
- **Track 02 — AI Risk Manager:** *"Honest metrics including false-positive cost. Strictly defense-only: anything offense-capable is disqualified."* Also: *"measured precision and recall on a held-out test set."*
- **Track 03 — AI Revenue Recovery:** *"Don't just identify the problem. Show measured money recovered across a batch, with compliant escalation, stopping rules, and an audit trail."*
- **Track 04 — AI Finance Controller:** *"Throughput plus measured accuracy plus an honest exception list. One cherry-picked match proves nothing."* Scope: *"one finance-ops loop across a 50+ record batch of synthetic data, reporting its match rate and the exceptions it could not resolve."* Framing: *"The 2026 builder consensus: verification capacity, not generation speed, is the bottleneck."*
- **Track 05 — Open Track:** *"Open doesn't mean easier. Show a real problem, a working product, meaningful use of AI, and evidence that it creates value. The same bar for execution, reliability, and depth applies here."*

Cross-cutting language on the page: *"No resume screening."* / *"Shortlisted builders go straight to a panel. No aptitude test. No group discussion. Your code speaks louder than your resume."*

**INFERENCE — the single loudest signal across all five tracks:** every bar demands **measured numbers on a batch plus an honest failure/exception list**. Three of five explicitly punish cherry-picking. A polished demo with no metrics loses to an ugly system with a held-out test set and a candid list of what it couldn't handle.

### 4b. The four-pillar rubric — **OFFICIAL, VERBATIM** (FACT)

**This is not a third-party synthesis.** It is Razorpay's own copy, in the page's JS bundle under `hired.rubric`, section heading *"04 — Get evaluated / We look at how you think, build and solve problems."* Verified two ways: (a) grepped out of `main.67f36351.js` on 2026-08-26; (b) visible in a screenshot of the live page headed *"We read the work, not the resume."*

| Pillar | Razorpay's exact wording |
|---|---|
| **Problem taste** | *"did you pick something that actually matters"* |
| **Build quality** | *"does it run, is it structured, would you trust it"* |
| **AI judgment** | *"the right tool in the right place, **and where you chose not to use one**"* |
| **Failure recovery** | *"what broke, and what you did about it"* |

**STRATEGIC READ (INFERENCE, high confidence):** "and where you chose not to use one" is the least obvious and most discriminating clause on the whole page. Razorpay is explicitly rewarding candidates who *removed* AI from parts of the system — deterministic rules on money paths, hard-coded validators, non-LLM fallbacks — and can defend those boundaries. A submission that is LLM-everywhere scores badly on pillar 3 by construction.

### 4c. The "resume diff" section — what they say they are throwing away (FACT, verbatim from bundle)

Razorpay renders a literal diff, `@@ -resume.pdf +proof @@`:

- **Removed:** `"9.1 CGPA, top 5% of batch"` · `"Python, C++, MS Office"` · `"Team player. Fast learner."`
- **Added:** `"a repo that actually runs"` · `"a 5-minute video of it working"` · **`"what broke at 2 AM, and how you got out"`**

### 4d. THE SINGLE MOST IMPORTANT LINE ON THE SITE (FACT, verbatim from bundle)

Under the form checklist, Razorpay writes:

> *"12 answers. About 15 minutes. We still take the resume. We just don't screen on it. **The last one is the one we read first.**"*

**FACT:** "the last one" = the final checklist item, **"What broke, and how you got out"** — i.e. the *Build Challenges & Technical Obstacles* free-text field on the form.
**INFERENCE (highest-leverage finding in this document):** Razorpay reads the failure narrative *before* the repo, the video, or the project description. That field is the de-facto first-round screen. Most applicants will treat it as an afterthought box; it should be the most carefully engineered artefact in the entire submission, and the build itself should be chosen partly so that it *generates* a genuinely interesting failure story with real 2-AM debugging detail.

### 4e. Four-step process, verbatim (FACT, from bundle)

`01 Pick a track` → `02 Build something real` → `03 Show your work: repo, 5-min video, architecture` → **`04 If it has signal, we call you in`**.
Note the wording of step 04: the threshold is **"signal"**, not completeness or polish.

### 4f. Third-party digest of the rubric (lower-grade, listed for completeness)

The third-party briefing PDF (E6) and YouTube `mmENFZNA8qE` restate the same four pillars in expanded language — e.g. *"Would a financial enterprise trust this code in production?"*, and *"hardcoded deterministic fallbacks for financial money paths"* as the example of AI judgment. **INFERENCE:** these are elaborations of Razorpay's four words, not additional inside information, but the elaborations are directionally sound. The PDF also advises building the 5-min video around *"live code execution, key failure modes handled, and architecture over static slides"* and calls the Build-Challenges field the *"Most Critical Field"* — which the official copy independently confirms.

### 4g. From Razorpay employees / leadership directly

**FACT — Razorpay Careers, LinkedIn, 2026-08-25** (295 reactions, 9 comments at retrieval), verbatim:
> *"**Resumes are background noise. Your build is the signal.** We're hiring AI Builder Interns through the Razorpay Buildathon. Five tracks… No aptitude test. No GD. Just a public repo and a 5-minute pitch. 6 or 12 months · Bangalore · Students only. **Apply by 5 Sep.**"*
https://www.linkedin.com/posts/razorpay-careers_razorpaybuildathon-aiinterns-hiring-activity-7497899727838076929-UjeL

**FACT — Sumit Premi (Razorpay recruiting), LinkedIn, ~2026-04-28**, verbatim:
> *"This is how we are hiring at Razorpay now!! Yesterday, I asked one of our engineering leaders for the JD, role scope, and requirements for an AI hire. The answer was simple: **'Hire AI builders for us. Engineers who can build using AI. Don't worry about anything else.'** … Earlier, hiring was: Role first, talent later. Now, it is becoming: **Builder first, role later.**"*
https://www.linkedin.com/posts/sumitpremi_this-is-how-we-are-hiring-at-razorpay-now-activity-7454759482183815168-9CdD

**FACT — Razorpay (company), LinkedIn, ~2026-07-14**, verbatim:
> *"A few months ago, **Harshil Mathur** put out a simple call. If you've been building with AI, come build with us. The response exceeded every expectation. **Thousands of builders reached out.** … This is not the traditional way to hiring. It's about solving real problems, shipping fast, and building AI-native products that operate at massive scale. Just share your proof of work and we will take it from there."*
https://www.linkedin.com/posts/razorpay_ai-hiring-builders-activity-7482734825880268800-JmzX
⚠️ **This "thousands of builders" figure refers to the razorpay.com/ai-builders general call, NOT the student Buildathon. Do not conflate.**

**EVIDENCE NOT FOUND:**
- Harshil Mathur, Shashank Kumar, or a CTO commenting **specifically on the AI Buildathon**.
- Any post about the AI Buildathon on razorpay.com/blog or engineering.razorpay.com.
- Any Razorpay-authored "common mistakes" / anti-pattern guidance beyond the per-track bars and the four pillars.

### 4h. ⚠️ Contamination warning — do NOT treat these as Razorpay's voice

`velonx.in`, `jobseekershub.co.in`, `fresherjobinfo.in`, `placement-officer.com`, `offcampusjobs4u.com`, `coursejoiner.com`, `thejobcompany.co.in` and the Dropbox "Master Briefing" PDF all **read like insider evaluation guidance but cite no Razorpay source and quote no Razorpay employee.** Velonx in particular asserts things like *"closer to how AI-native product teams evaluate engineers internally"* — that is editorial, not Razorpay. **Attribute nothing in a submission to Razorpay unless it appears in E1/E2b/E23/E24 or a Razorpay-owned social post.**

### 4i. FACT — the only explicit disqualification rule stated anywhere

**Track 02 (AI Risk Manager): *"Strictly defense-only: anything offense-capable is disqualified."*** This is the sole hard DQ on the entire site. If you touch Track 02, the repo must contain no tooling that could be repurposed to commit fraud — and the README should say so explicitly.

---

## 5. THE APPLICATION FORM — EXACT FIELD SCHEMA (FACT)

Extracted directly from the live form's `FB_PUBLIC_LOAD_DATA_` on 2026-08-26. Form title: **"Razorpay AI Builder Internship 2026"** / internal name "Razorpay AI Builder - Registration Form". This is the ground truth for what you must produce:

| # | Field | Type | Notes |
|---|---|---|---|
| 1 | Full Name | short text | required |
| 2 | College Name | short text | required |
| 3 | Graduation Year | dropdown | **Only 2027 / 2028 / 2029** — hard eligibility gate |
| 4 | In-person Internship availability starting September | radio Yes/No | Yes → branches to "Internship Details"; No → branches to "Track Selection" |
| 5 | Preferred Internship Duration | radio | 6-Month / 12-Month |
| 6 | Selected Track | dropdown | Track 1–4 + Open Track |
| 7 | Project Name / Title | short text | required |
| 8 | Project Objectives | **paragraph** | helper text: *"What does it solve?"* |
| 9 | GitHub Repository URL | short text | required, public repo |
| 10 | 5-min Pitch Video Link | short text | required |
| 11 | Build Challenges & Technical Obstacles | **paragraph** | helper text: *"What issues did you face while building, and how did you solve them?"* |
| 12 | Final Submission Confirmation | checkbox | *"I confirm that this is my official final project submission. I understand that no further changes or edits can be made after submitting."* |

### 5a. DISCREPANCY: the site says the form asks for a Resume file; the live form does not

**FACT.** Razorpay's own bundle lists the "about you" checklist as: *Full name · College · Graduation year · In-person from September: yes / no · 6 or 12 months: your pick · **Resume file*** — and the note says *"We still take the resume. We just don't screen on it."*
**FACT.** The live Google Form's field schema (dumped 2026-08-26) contains **no resume upload field and no email field**.
**HYPOTHESIS:** either (a) the form was simplified after the page copy was written, (b) a file-upload question is present but hidden from the anonymous form config because uploads require Google sign-in, or (c) the "12 things" count on the site is aspirational copy. **ACTION: have a resume PDF ready and be signed into a Google account when you open the form**, in case an upload question appears. Do not let a missing file block a last-minute submission.

**FACT — critical constraints derived from the schema:**
- **Graduation year is restricted to 2027, 2028, 2029.** Anyone graduating 2026 or earlier cannot submit. (Independently corroborated: YouTube `Qz9Jn8U_nXQ` title/description — *"Razorpay Internship [ Batch: 2027/2028/2029 ]"*.)
- **There is no "team members" field.** The form is structured for an individual submitter. A public question on X (@farazzprvt, 2026-08-20) asking *"We can build in group of 2-4 members or individual?"* has **no visible Razorpay answer** — **EVIDENCE NOT FOUND** on team eligibility.
- **Only two free-text answers exist** (Project Objectives, Build Challenges). All narrative persuasion lives in those two boxes plus the README and the video. **INFERENCE:** the Build Challenges box is disproportionately load-bearing — it is the only place the form asks you to prove engineering depth rather than assert it, and it maps 1:1 onto the "Failure Recovery" pillar.
- **No edit after submit.** Draft answers offline first.

---

## 5B. SIBLING PROGRAM: razorpay.com/ai-builders (the non-student version) — FACT

**FACT.** A second, separate Razorpay page exists: **https://razorpay.com/ai-builders/** — *"AI Builder Jobs at Razorpay | Hiring AI Talent"*, HTTP 200, applies via **https://razorpay.typeform.com/to/Aj64eENJ** (a *different* form from the Buildathon's Google Form). Copy extracted from its bundle `main.79862ea9.js` on 2026-08-26. Its copy corpus and the Buildathon's live in adjacent webpack modules, i.e. **they were built by the same team as one campaign.**

Verbatim highlights:

- **Headline:** *"Hiring the most obsessed AI Builders to solve the toughest problems"*
- **What this is:** *"A role for builders who can turn ambiguous business and product problems into working AI systems, prototypes, automations, and agentic experiences."*
- **Who should apply:** *"People who are always thinking how to harness AI, see every workflow as an agent loop, speak in prompts and GitHub links, and can show projects they have shipped or seriously prototyped."*
  - *"You use AI tools to think, build, debug, research, and ship faster."*
  - *"You can explain your work through real projects, experiments, or prototypes."*
  - *"You are excited about applying AI to payments, revenue, operations, support, sales, design, and marketing problems."*
- **Process:** *"Three steps. No nonsense."* → Fill the form · Submit your project or GitHub · **"If it has signal, we'll call in 48 hrs"**
- **What Razorpay has already built with AI (verbatim):** *"Razorpay teams have built **Slash, Call-E, AI-led marketing campaigns, Agentic Platform, Agentic Payments, and Agent Studio** to solve real production problems."* Immediately preceded by the heading: *"We're doing a lot with AI. We still don't think it's enough."*

**UNEXPLOITED LEAD (FACT that it exists, content unknown):** the campaign ships a **111-second mono MP3 voice clip** at `https://cdn.razorpay.com/static/assets/ai-builders/audio/voice-1.mp3` (HTTP 200, 1.82 MB, verified 2026-08-26). Referenced from the shared bundle as `/audio/voice-1.mp3`. **I could not transcribe it** — no local ASR available and Firecrawl (which has an `audio` scrape format) was down. **HYPOTHESIS:** this is a spoken message from a Razorpay leader about what they want from AI Builders — i.e. potentially the single richest piece of "commentary on the bar" that exists. **Recommend transcribing it as a follow-up.** Content: **EVIDENCE NOT FOUND.**

**INFERENCE — two strategic consequences:**
1. **Don't rebuild their existing surfaces.** Slash, Call-E (voice), Agent Studio, Agentic Platform and Agentic Payments already exist internally. A submission that is "an agent-building platform" or "an AI voice agent for merchants" is re-implementing something Razorpay ships. The scoring headroom is in what they *haven't* built — which is exactly why the track briefs push toward measurement, reconciliation, exception handling, and audit trails rather than agent frameworks.
2. **Turnaround is fast.** The sibling page promises a callback within 48 hours of a signal-positive submission. **HYPOTHESIS:** the Buildathon likely runs on a comparably fast loop, which is an argument for submitting well before 5 Sep rather than at the wire — earlier submissions may get a longer, less rushed read.

---

## 6. PUBLIC SUBMISSIONS SEEN IN THE WILD

**This is the most decision-relevant section in the document. The competitive field is large, public, and enumerable on GitHub.**

### 6.1 The field, measured (FACT — GitHub Search API, retrieved 2026-08-26)

- `gh api search/repositories?q=razorpay+buildathon` → **260 repositories**, of which **258 created after 2026-08-15**.
- `gh api search/code?q="Razorpay AI Buildathon"` → **828 file hits**.
- Creation curve (repos/day): 08-20: 13 · 08-21: 38 · 08-22: 61 · 08-23: 53 · 08-24: 47 · 08-25: 45 · 08-26: 2. **Running at ~50/day and still climbing 10 days before the deadline.**
- Languages (261 deduped): Python 144 · TypeScript 38 · JavaScript 24 · none 34 · HTML 11 · Jupyter 6 · Java 2 · C++ 1 · CSS 1.
- Stars: essentially zero. Max observed 3 (`Abhi120320/vault-guard`); only 12 of 261 have any star.
- **59 of 261 repos have no description at all.**

**INFERENCE:** if ~260 public repos exist 10 days out and the rate holds, the visible public field alone plausibly lands in the **500–900** range by 5 Sep, plus an unknown number of repos not named/described in a searchable way. This is the realistic denominator.

### 6.2 Track crowding (INFERENCE — keyword classification on repo name + description; overlapping, approximate)

| Track | ~Repos |
|---|---|
| **03 — AI Revenue Recovery** | ~82 (**most crowded**) |
| **02 — AI Risk Manager** | ~72 |
| **04 — AI Finance Controller** | ~43 |
| **01 — AI Growth & Agentic Commerce** | ~36 (**thinnest**) |
| unclassifiable / Open | ~76 |

**INFERENCE (actionable):** Track 01 (Agentic Commerce) is the least crowded of the four named tracks despite being the one Razorpay frames most urgently ("the open problem of the year", "Razorpay's in-app pilots are already live"). **HYPOTHESIS:** it is under-entered because it requires standing up real Razorpay test-mode payment flows plus protocol knowledge (UAP / ACP / AP2 / x402), which is a higher barrier than training a classifier. That barrier is precisely why it is the best odds-adjusted track for someone who can clear it.

### 6.3 The field is strongly bimodal (FACT + INFERENCE)

**The top ~20–30 repos are genuinely rigorous and are optimising directly at the published rubric.** Verified examples (all retrieved 2026-08-26):

| Repo | Track | What makes it strong |
|---|---|---|
| https://github.com/vaibhav375/recovery-ledger | 03 | ₹272,281 incremental recovery per 1,000 cases with **95% CI ₹103,930–₹433,387**; randomised no-contact holdout; deterministic compliance kernel emitting signed certificates; **documents four revisions to its own numbers (three real bugs) rather than quietly replacing them**; has a "where we deliberately did NOT use an LLM" table |
| https://github.com/Adarsh-Me/Agent-Audit | 01 | 640 randomised controlled LLM shopping trials; HHI, position-bias permutation tests, Wilson CIs, cross-model stability; zero-key demo path; Razorpay test-mode payment links + HMAC webhooks + MCP stdio server |
| https://github.com/abhinav-phi/reflex | 03 | **Pre-registered eval: +10.24pp recovery vs a tuned-naive baseline**; 164 passing tests; hash-chained ledger; "AI proposes, deterministic code disposes"; explicit post-mortem section |
| https://github.com/dixitkeshav/Razorpay-Anvil | 03 | Maps each of the 7 stated track-bar requirements to a named deliverable **and a named passing test file**; CUSUM + EWMA detectors; counterfactual replay; reproduces from a clean clone with no credentials; ships `docs/NON-GOALS.md` |
| https://github.com/JazR20/reckon | 04 | Positioning: *"a reconciliation agent whose product is knowing when to refuse"* |

Second tier (still solid): `AribAsim/Recovery-Copilot`, `Prince-Chakraborty/runwayguard-ai`, `poreddynarendra2006-debug/cash-application-agent`, `tfthushaar/razorpay_buildathon`, `Creative-Dhanush/askari`, `AkshatTrip2405/FraudLens`, `iamaanahmad/ReconGraph`, `Purvee25/sentinel-ap2`, `aryanpajnee/RazorpayBuildathon`, `AryanTandon2019/sequencer`, `SudhanvaJ-bit/revenue-recovery-agent`, `shivamshukla02/Recon-engine`, `prakyath006/rakshak-ai`, `venegallarupesh-source/merchantguard-ai`, `b24bs2141-cmd/RazorACP`, `Divyanshi-git/checkout-route-optimizer`, `sania252004/Cartwright-Autonomous-Shopping-Agent`, `abhishekck31/RevenueRadar`, `YeshwanthRajSelvaraj/VERITY-Agentic-Commerce-Razorpay`.

**And the floor is very low (FACT):** `suhaan07/razorpay_buildathon` is a **completely empty repo** (0 KB, 0 commits); `ellampirai/Razorpay-AI-Builder-Internship-` is 7 KB / 1 commit / 6 flat files; `N1CK99925/MoneyOS` is 9 KB / 2 commits; `kjudr05/Razorpay-buildathon` is 43 KB / 3 commits.

**INFERENCE — the single most important competitive read:** the median entry is not the competition. The bar is set by roughly 20–30 repos that already ship confidence intervals, randomised holdouts, pre-registered evals, hash-chained audit ledgers, abstention logic, and explicit "where I chose not to use an LLM" tables. **Beating the median is worthless; you are competing against that top band.** Note also that `recovery-ledger` scores points by *publicly correcting its own numbers four times* — that behaviour maps exactly onto Razorpay's "Failure recovery" pillar and "The last one is the one we read first."

**FACT (caveat):** many top repos show single-commit histories (`commits?per_page=1 → 1`), i.e. history squashed before publishing. **Commit count is not a usable quality proxy in this field.**

### 6.4 Pitch videos — mostly not recorded yet (FACT)

Only four genuine participant pitch videos located as of 2026-08-26:
- https://youtu.be/QrXr4CBUPfg — "AI-Driven GitHub Authenticity Engine" (449 views)
- https://youtu.be/VuCuOV1dHME — "AI Revenue Recovery Agent" (521 views)
- https://youtu.be/POwXmitl3cE — "Turning AI Conversations into Real Commerce" (402 views)
- https://youtu.be/GUJDFQwYj5M — "VillageConnect | AI-Powered Rural Commerce Platform" (16 views)

**FACT:** GitHub code search surfaces 15 repos referencing video links, but most are **placeholders or scripts** (`https://youtu.be/YOUR_VIDEO_ID`, `https://youtu.be/guardpay-demo`, `docs/PITCH_VIDEO_SCRIPT.txt`, `VideoPitchScriptModal.jsx`). One working non-placeholder: https://www.loom.com/share/28cbe2dad3834ad9aea497bf9cf5e335 (`TechySan031/RazorGrowth-Agent`).
**INFERENCE:** a video surge is coming in the last ~10 days. Recording early is cheap insurance; the video is a required field and a rushed one will drag down an otherwise strong build.

### 6.5 Notable meta-artifacts in competitor repos (FACT)

Several entrants are keeping explicit submission-strategy docs in-repo — e.g. `jahajeevan/Scout` → `docs/submission/PRE_FLIGHT.md`; `biru-codeastromer/maryada` → `docs/SUBMISSION.md`; `purvanshh/PayShield` → `docs/APPLICATION_ANSWERS.md`; `pratiksingh1702/RIP` → `Razorpay_Buildathon_Masterplan.md`; `Samrudh2006/Razorpay-Target-0.1percent-`. **These are readable competitor intelligence** and worth skimming directly.

### 6.6 Channels where the program is NOT present (FACT / EVIDENCE NOT FOUND)

- **Unstop:** FACT — not listed (public opportunity search API returns an empty data array).
- **Devfolio:** FACT — not listed (search 404; hackathon API returned 22 unrelated hits).
- **Devpost:** EVIDENCE NOT FOUND.
- **Reddit:** **EVIDENCE NOT FOUND, and this is a genuine hole** — eight distinct access routes (reddit.com/search.json, old.reddit, api.reddit.com, three redlib mirrors, WebSearch `site:reddit.com`, DuckDuckGo) all returned 403 or zero indexed results. **Do not read this as "no Reddit discussion exists."**
- **Telegram / Discord:** EVIDENCE NOT FOUND.
- **X "here is my submission" posts:** EVIDENCE NOT FOUND. All X chatter located is announcement amplification.
- **LinkedIn "I built X for the Buildathon" posts:** EVIDENCE NOT FOUND. Eight relevant LinkedIn posts were located by title, but **none of their bodies could be read** (LinkedIn returned 403 to the reader proxy; WebFetch cannot reach authenticated LinkedIn). All titles match the announcement template.

**INFERENCE:** Razorpay ran this entirely on its own domain with no aggregator platform, which is why **GitHub is the only high-signal public channel** and why there is no central submission gallery.

---

## 7. SCALE

- **EVIDENCE NOT FOUND** — no published applicant count, participant count, or number of intern slots for the AI Buildathon, from any source. No headcount cap is stated either.
- **BEST AVAILABLE PROXY (FACT):** **260 public GitHub repos** matching "razorpay buildathon", 258 created after 2026-08-15, accruing at ~45–60/day (see §6.1). This is a hard floor on the serious applicant count and the only real number anyone has.
- **FACT (reach proxies):** X post @ajay_2512x — 24.9K views / 391 likes / 422 bookmarks. YouTube announcement videos: Shivam Chaudhary **16,718 views**, Ashish Kumar 5,718, Multi Atoms Career 3,381, plus several smaller. Multiple job-aggregator sites republished within 72h.
- ⚠️ **Numbers that belong to OTHER Razorpay programs — do not substitute them (all FACT, all off-target):** *"Thousands of builders reached out"* → the **ai-builders** general call, ~2026-07-14, not the Buildathon. 100 participants / ₹100,000 → OpenCode Buildathon (GrowthX), Apr 2026. 800+ employees / 215 teams → HACK:O(n) 2024, internal. 26 projects → FTX 2020. 10,000+ attendees → FTX 2021 *conference*, not its hackathon.
- ⚠️ **Unverified third-party claims:** "Swags & Cash Prizes" (The Placement Plus, YouTube) and "₹60,000+ Stipend" (Code & Game, YouTube). **The official page confirms neither. There is no stated prize pool — the prize is the internship.** Treat as HYPOTHESIS at best.
- **INFERENCE:** Distribution is broad and mainstream-campus (job aggregators, placement-cell blogs, career YouTube), which produces a high-volume, low-median-quality pool — corroborated directly by the repo sample (empty repos, 1-commit repos, 59/261 with no description). **The marginal cost of standing out is dominated by evidence discipline — metrics, held-out sets, audit trails, honest exception lists — not by novelty of idea**, because the flood will mostly ship demos without measurement. But note §6.3: the top ~20–30 entrants have already figured this out, so evidence discipline is table stakes for the top band, not a differentiator against it.

---

## 8. EVIDENCE INDEX

| # | URL | Title / description | Source type | Retrieved | Supports |
|---|---|---|---|---|---|
| E1 | https://razorpay.com/buildathon/ | Razorpay AI Buildathon — Build. Show. Get hired. | Primary (Razorpay) | 2026-08-26 | Tracks, per-track bars, offer, absence of deadline |
| E2 | https://razorpay.com/buildathon/ (embedded JSON-LD) | schema.org Event object | Primary (Razorpay) | 2026-08-26 | No startDate/endDate; apply target = forms.gle link |
| **E2b** | **https://razorpay.com/build/browser/f50d7c33dce175db76f21a3cd3fed55c50efb6ee/js/modern/main.67f36351.js** | **Razorpay buildathon page JS bundle — full copy corpus** | **Primary (Razorpay)** | **2026-08-26** | **"Applications close 5 September"; verbatim 4-pillar rubric; "The last one is the one we read first"; resume-diff copy; 12-item form checklist; all 5 track passBars** |
| E2c | https://pbs.twimg.com/media/HQKRhJoawAADqqH (screenshot of live page, "We read the work, not the resume.") | Screenshot of Razorpay page section | Secondary capture of primary | 2026-08-26 | Independent visual confirmation the 4-pillar rubric is on the live site |
| E3 | https://forms.gle/d9r2gvxp8cmoZhon9 → https://docs.google.com/forms/d/e/1FAIpQLScJ9XSqVCB2oaPwEMH0Zk3I1OpILFW1WpWdWweQ2950jdRzlg/viewform | Razorpay AI Builder - Registration Form | Primary (Razorpay-owned form) | 2026-08-26 | Exact 12-field schema, grad-year gate, no-edit clause, no deadline |
| E4 | http://archive.org/wayback/available?url=razorpay.com/buildathon/ | Wayback availability API | Archive | 2026-08-26 | Zero captures |
| E5 | http://web.archive.org/cdx/search/cdx?url=razorpay.com/buildathon*&output=json | Wayback CDX index | Archive | 2026-08-26 | Empty result set — page is new, no removed earlier version |
| E6 | https://www.dropbox.com/scl/fi/r621ovdyieni9os3a6166/Razorpay_AI_Buildathon_Briefing.pdf?rlkey=rwoek8csclu7os51nxttop39d | "Razorpay AI Buildathon 2026 — Master Briefing Document" (4pp PDF) | **Third-party** digest, distributed via YouTube shortlink | 2026-08-26 | Sept 5 2026 deadline; four-pillar rubric; submission checklist |
| E7 | https://buildathon.openinapp.link/briefing | openinapp shortlink → the Dropbox PDF | Third-party redirect | 2026-08-26 | Provenance of E6 |
| E8 | https://x.com/ajay_2512x/status/2090393869473165453 | "🚨 Razorpay AI Buildathon… Applications close: 5 September" | Third-party social (X), 2026-08-20 | 2026-08-26 | Deadline; earliest dated mention; 24.9K views |
| E9 | https://x.com/farazzprvt/status/2090433544762053018 | Reply asking "group of 2-4 members or individual?" | Third-party social (X), 2026-08-20 | 2026-08-26 | Team eligibility is publicly unanswered |
| E10 | https://velonx.in/blog/razorpay-ai-buildathon-2026-tracks-eligibility-stipend-selection-process | Velonx explainer, Aug 20 2026 | Third-party blog | 2026-08-26 | Deadline Sept 5 2026; "no full public timeline beyond the application deadline" |
| E11 | https://offcampusjobs4u.com/razorpay-internship-2026-ai-intern/ | Razorpay Internship 2026 AI Intern | Job aggregator | 2026-08-26 | "Last Date 05 September 2026" |
| E12 | https://fresherjobseva.com/razorpay-internship-2026-ai-intern/ | Razorpay Internship 2026 AI Intern | Job aggregator | 2026-08-26 | "before 05 September 2026" |
| E13 | https://coursejoiner.com/internship/razorpay-ai-builder-internship-2026/ | Razorpay AI Builder Internship 2026 (Aug 21 2026) | Job aggregator | 2026-08-26 | "Application Deadline September 5, 2026" |
| E14 | https://fresherjobinfo.in/razorpay-ai-buildathon-internship-2026/ | Razorpay AI Buildathon Internship 2026 | Job aggregator | 2026-08-26 | **Dissent:** "Razorpay has not announced a last date" |
| E15 | https://www.placement-officer.com/2026/08/razorpay-ai-buildathon-2026-build-ai.html | Placement Officer, Aug 22 2026 | Placement-cell blog | 2026-08-26 | Coverage; prep advice; no independent deadline |
| E16 | https://www.youtube.com/watch?v=mmENFZNA8qE | "Razorpay AI Buildathon 2026 🔥 ₹75,000/Month AI Internship", pub 2026-08-21 | Third-party YouTube | 2026-08-26 | "Applications close: 5 September"; four-pillar rubric wording |
| E17 | https://www.youtube.com/watch?v=Qz9Jn8U_nXQ | "Razorpay Direct Test Internship Program – 2026", Shivam Chaudhary, pub 2026-08-20 | Third-party YouTube | 2026-08-26 | "Batch: 2027/2028/2029"; 14K views in 2 days |
| E18 | https://www.youtube.com/watch?v=to1Ya-xGopk | "Razorpay Buildathon 2026 | Everything you need to know", pub 2026-08-22 | Third-party YouTube | 2026-08-26 | Source of the briefing-PDF shortlink |
| E19 | https://www.linkedin.com/posts/ashinee20_razorpay-ai-buildathon-2026-build-show-activity-7496914271059144704-ukJE | Ashinee Kesanam LinkedIn post (~Aug 23 2026) | Third-party social | 2026-08-26 | "Application Deadline: September 5, 2026" |
| E20 | https://www.linkedin.com/posts/vishwanath-barve-151146323_razorpay-ai-buildathon-build-show-get-activity-7496198940783210496-APXP | Vishwanath Barve LinkedIn post (~Aug 21 2026) | Third-party social | 2026-08-26 | Circulation; **no** deadline mentioned |
| E23 | https://razorpay.com/ai-builders/ | "AI Builder Jobs at Razorpay \| Hiring AI Talent" | Primary (Razorpay) | 2026-08-26 | Sibling non-student program; typeform apply URL; existing Razorpay AI products |
| E24 | https://razorpay.com/build/browser/d840c7864888b032cf660f0ccd0576acc3d63cc0/js/modern/main.79862ea9.js | ai-builders page JS bundle | Primary (Razorpay) | 2026-08-26 | Verbatim "obsessed AI Builders" copy; "call in 48 hrs"; Slash / Call-E / Agent Studio / Agentic Platform / Agentic Payments |
| E25 | https://razorpay.typeform.com/to/Aj64eENJ | AI Builders application typeform | Primary (Razorpay) | 2026-08-26 (URL only) | Separate application path for the non-student program |
| E21 | https://press.aboutamazon.com/aws-international/2026/8/razorpay-launches-vulcan-indias-first-ai-payments-foundation-model-fueled-by-nvidia-and-aws-re-architecting-payments-for-a-350-bn-e-comm-future-by-2030 | Razorpay launches Vulcan, AI payments foundation model | Corporate press release, 2026-08-18 | 2026-08-26 | Razorpay's AI strategic context two days before Buildathon launch |
| E22 | https://www.instagram.com/reel/DcWJNDZImvV/ | "Kushal Vijay \| Razorpay announced AI Buildathon 2026 and hiring…" | Third-party social (Instagram reel) | 2026-08-26 (title only, body not retrieved) | Distribution breadth |
| **E26** | **https://www.linkedin.com/posts/razorpay-careers_razorpaybuildathon-aiinterns-hiring-activity-7497899727838076929-UjeL** | **Razorpay Careers — "Resumes are background noise. Your build is the signal… Apply by 5 Sep."** (2026-08-25) | **Primary (Razorpay)** | 2026-08-26 | **Second official confirmation of the 5 Sep deadline; earliest official Razorpay post** |
| E27 | https://www.linkedin.com/posts/sumitpremi_this-is-how-we-are-hiring-at-razorpay-now-activity-7454759482183815168-9CdD | Sumit Premi (Razorpay recruiting) — "Builder first, role later" (~2026-04-28) | Primary (Razorpay employee) | 2026-08-26 | Hiring philosophy behind the program |
| E28 | https://www.linkedin.com/posts/razorpay_ai-hiring-builders-activity-7482734825880268800-JmzX | Razorpay — Harshil Mathur's AI-builder call, "Thousands of builders reached out" (~2026-07-14) | Primary (Razorpay) | 2026-08-26 | Scale of the *sibling* ai-builders call (NOT the Buildathon) |
| E29 | `gh api search/repositories?q=razorpay+buildathon` (paginated, 261 deduped) | GitHub Search API | API | 2026-08-26 | 260 repos, creation curve, languages, stars, track crowding |
| E30 | `gh api search/code?q="Razorpay AI Buildathon"` | GitHub Code Search API | API | 2026-08-26 | 828 file hits; in-repo submission docs; video placeholders |
| E31 | https://github.com/vaibhav375/recovery-ledger · /Adarsh-Me/Agent-Audit · /abhinav-phi/reflex · /dixitkeshav/Razorpay-Anvil · /JazR20/reckon | Top-tier competitor repos | GitHub repos | 2026-08-26 | The actual competitive bar |
| E32 | https://github.com/suhaan07/razorpay_buildathon · /ellampirai/Razorpay-AI-Builder-Internship- · /N1CK99925/MoneyOS · /kjudr05/Razorpay-buildathon | Floor-tier competitor repos | GitHub repos | 2026-08-26 | Bimodal quality distribution |
| E33 | https://youtu.be/QrXr4CBUPfg · /VuCuOV1dHME · /POwXmitl3cE · /GUJDFQwYj5M | Four genuine participant pitch videos | YouTube | 2026-08-26 | What submitted pitches look like; videos not yet recorded en masse |
| E34 | `POST https://api.devfolio.co/api/search/projects` (`hackathon_slugs:["ftx-hackathon"]`) · https://ftx-hackathon.devfolio.co/ | Razorpay FTX Hackathon 2020 — 26 projects, named winners, judges, prize pool | Primary API + event page | 2026-08-26 | Only prior Razorpay competition with public results and repos |
| E35 | https://github.com/razorpay/ftx-hackathon | razorpay/ftx-hackathon (created 2020-11-23) | Primary (Razorpay GitHub org) | 2026-08-26 | Official prior hackathon repo |
| E36 | https://x.com/RazorpayFTX/status/1470247844661514241 | "The results are in! …#FTX2021 #Hackathon" (2021-12-13) | Primary (Razorpay X) | 2026-08-26 | FTX 2021 winners announced; names unreadable logged-out |
| E37 | https://razorpay.com/blog/razorpay-hackathon-status-402-24-hours-of-innovation/ | "Razorpay Hackathon: Status 402" (2017-08-09) — *"our first hackathon"* | Primary (Razorpay blog) | 2026-08-26 | Competition history |
| E38 | https://yourstory.com/2024/07/razorpay-employees-battle-hackon-2024 | HACK:O(n) 2024 — 800 employees, 215 teams, 9th edition | News | 2026-08-26 | Internal hackathon scale (off-target for this program) |
| E39 | https://www.tipranks.com/news/private-companies/razorpay-hosts-ai-buildathon-to-deepen-ties-with-developer-ecosystem | "Razorpay Hosts AI Buildathon…" (2026-04-18) | News aggregator | 2026-08-26 | ⚠️ **DECOY** — GrowthX OpenCode Buildathon, not this program |
| E40 | https://hackortech.in/hackathon/3842e95b57730583449f61999ec3c57a-razorpay-ai-for-good-hackathon-2026/ | "Razorpay AI for Good Hackathon 2026, ₹1.2Cr prizes" | Auto-scraping aggregator | 2026-08-26 | ⚠️ **LIKELY FABRICATED** — self-referencing source link, zero corroboration. Do not use. |
| E41 | https://inc42.com/?s=razorpay+buildathon · https://entrackr.com/?s=buildathon · https://yourstory.com/search?q=buildathon · https://analyticsindiamag.com/?s=razorpay+buildathon · https://razorpay.com/newsroom/?s=buildathon | Site searches | News/primary site search | 2026-08-26 | **Zero results each** — no press coverage, no newsroom item |
| E42 | unstop.com public opportunity search API · devfolio.co/search?q=razorpay buildathon | Platform listings | API/web | 2026-08-26 | **Not listed on Unstop or Devfolio** |
| E43 | https://cdn.razorpay.com/static/assets/ai-builders/audio/voice-1.mp3 | 111s mono MP3, 1.82 MB, HTTP 200 | Primary (Razorpay CDN) | 2026-08-26 | Untranscribed campaign audio — open lead |

---

## 9. OPEN QUESTIONS / EVIDENCE NOT FOUND

| Question | Status |
|---|---|
| Are team submissions allowed (2–4 people)? | **EVIDENCE NOT FOUND.** Asked publicly on X 2026-08-20, never answered by Razorpay. The form has no team field and no team-member questions → **INFERENCE: individual submission.** |
| Number of intern slots / headcount cap | **EVIDENCE NOT FOUND** |
| Applicant count for this program | **EVIDENCE NOT FOUND** (best proxy: 260+ public GitHub repos) |
| Post-deadline timeline (shortlist date, panel dates) | **EVIDENCE NOT FOUND** — Velonx notes Razorpay published nothing beyond the application deadline |
| Any prize money / swag beyond the internship | **EVIDENCE NOT FOUND** on official sources; only unverified YouTube claims |
| Does the form require a resume upload? | **CONFLICTING** — site copy says yes, live form schema shows no. See §5a |
| Content of the 111-second campaign voice clip | **EVIDENCE NOT FOUND** — not transcribed; recommend follow-up |
| Reddit discussion (r/developersIndia, r/Btechtards) | **EVIDENCE NOT FOUND, and unreliably so** — eight access routes all blocked/403. Genuine coverage hole |
| Bodies of the 8 relevant LinkedIn posts | **Mostly unread** (403). Only two were retrieved via WebFetch |
| Moneycontrol / ET / Business Standard coverage | **UNCHECKED**, not disproven |

---
