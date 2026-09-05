# Frontend redesign brief — in.razorpay.upi

**For:** Claude Code
**Repo:** `frontend/` (Next.js 16, React 19, TypeScript strict, Tailwind v4, Vitest)
**Goal:** replace the current dark generic dashboard with a light, opinionated, product-grade interface — without touching backend logic or adding architectural complexity.

Read this whole file before writing any code.

---

## 1. What this product is

A payment gate for Indian UPI merchants. It extracts payment limits from merchant term sheets with an LLM, compares them against checksummed NPCI/RBI circulars (OC No.201, OC No.228), and refuses any transaction the merchant's terms aren't authorized to allow. Every refusal cites a specific clause and quotes it verbatim. Every decision is appended to a hash-chained ledger.

The core invariant: *no rupee bound is enforced unless it traces to a clause in a checksummed document.*

**The design thesis follows from that.** This is not a metrics dashboard. It is an **evidence interface**. The most important object in the product is not a number — it is a refusal with a clause attached to it. The current UI buries that behind a "Details" link and leads with four counters that any CRUD app could show. Reverse this. The clause, the verbatim quote, and the hash chain are the product; the counters are context.

Audience: hackathon judges (Razorpay AI Buildathon, Track 01) who will spend 3–5 minutes in the UI. They need to reach the evidence fast and see that it is real.

---

## 2. Scope and guardrails

### In scope
- Everything under `frontend/app/` and `frontend/components/`
- `frontend/app/globals.css` (design tokens)
- New landing page and demo authentication
- Route restructuring (`/` becomes marketing, app moves to `/app/*`)

### Out of scope — do not touch
- Any Python (`gate/`, `conform/`, `extract/`, `merchant/`, `agent/`, `eval/`, `corpus/`)
- `frontend/lib/types.ts` — the interfaces mirror backend models. Read them, don't change them.
- `frontend/lib/api-client.ts` — the MCP/JSON-RPC wrapper works. Leave it.
- `frontend/lib/constants.ts` — you may **add** design-related exports, but do not change the shape of `DEMO_TRANSACTIONS`, `DEMO_CONSTRAINTS`, or the ledger fixtures. Tests assert on them.

This is a presentation-layer refactor. If you find yourself editing data logic, stop and reconsider.

### Test safety — read carefully
The repo currently claims **100 frontend tests, 100% pass**. That claim is part of the pitch. A CSS refactor must not silently invalidate it.

Before Phase 1:
1. Run `npm run test:run` and record the baseline.
2. Open `__tests__/app/transaction-detail.test.tsx`, `constraints.test.ts`, `ledger.test.ts`, `demo-mode.test.ts`. Note every element these tests query by text, role, or test id.
3. Add stable `data-testid` attributes to those elements **before** restructuring their markup, and update the tests to query by test id rather than by class or DOM position.

After every phase: `npm run test:run && npx tsc --noEmit`. Both must be clean before moving on. If a test breaks because the assertion is genuinely obsolete, fix the assertion deliberately and say so in the commit message — never delete a test to make the suite green.

---

## 3. Design direction

### 3.1 The organising idea: a register, not a dashboard

Regulatory instruments — circulars, dockets, ledgers, statute — have a visual vernacular: ruled rows, marginal citations, numbered sequences, verbatim quotation, hairlines rather than boxes. Borrow that. The interface should read like an official register that happens to be live, not like a SaaS analytics template.

Practical consequences:
- **Ruled rows, not cards.** Lists of transactions, ledger entries, and constraints are hairline-separated rows in a single column. Do not chop content into a grid of identical rounded cards.
- **Marginal citations.** The content column has a left margin (~72px) where sequence numbers and clause references hang, like marginalia in a legal document. This is the layout's signature.
- **Cards are rare and mean something.** Reserve a bordered surface for exactly one thing: the evidence block for a refusal. When everything is a card, nothing is emphasised.
- **Small radii.** 4px on interactive controls, 0 on ruled containers and table regions. Documents don't have 16px corners.

### 3.2 Colour

**The rule that defines this palette: colour means a regulatory outcome. Nothing else gets to be coloured.** No brand accent hue, no coloured buttons, no tinted chrome. Buttons are ink. Links are ink with an underline. The only saturated pixels on screen are verdicts. This is a strong constraint and it is the point — it makes a single refusal visible from across the room during a demo.

```css
@theme {
  /* surfaces — cool paper, not cream */
  --color-paper:    #F2F3F0;   /* page canvas */
  --color-surface:  #FFFFFF;   /* raised regions, table bodies */
  --color-rule:     #D9DBD4;   /* hairline, 1px */
  --color-rule-2:   #ECEDE9;   /* faint hairline, internal row separators */

  /* ink */
  --color-ink:      #0C2027;   /* primary text, buttons — deep petrol, not black */
  --color-ink-2:    #4A5B5F;   /* secondary text */
  --color-ink-3:    #8A9799;   /* metadata, placeholders */

  /* verdicts — printed, not neon */
  --color-pass:     #1F6B4A;   --color-pass-bg:  #EDF3EF;
  --color-fail:     #9B2C2C;   --color-fail-bg:  #F6EDEC;   /* oxblood */
  --color-undet:    #8A6212;   --color-undet-bg: #F5F1E6;   /* ochre */
}
```

Why these and not the obvious ones: `#F2F3F0` is a cool grey-green paper rather than the cream (#F4F1EA) that every generated page uses. `#0C2027` is a petrol ink with a real hue rather than a tinted near-black standing in for `#000`. Oxblood and ochre read as stamped or printed; Tailwind's `rose-600` and `amber-500` read as a UI kit.

**Ship light mode only.** Delete the dark variants. You prefer light, judges will see light, and maintaining both doubles the QA surface for zero points. Remove `dark:` classes as you rewrite each file rather than in one sweep.

### 3.3 Typography

Use the **IBM Plex superfamily** — one family, three voices, loaded via `next/font/google`:

| Face | Role | Rationale |
|---|---|---|
| IBM Plex Sans | All interface text, headings, labels | Institutional and technical without being neutral-to-the-point-of-invisible. Not Inter/Geist, which is the default reach. |
| IBM Plex Mono | Machine-generated values only | See the strict rule below. |
| IBM Plex Serif | Verbatim circular quotes only | Marks quoted regulatory authority as a different kind of text from UI chrome. |

```ts
// app/layout.tsx
import { IBM_Plex_Sans, IBM_Plex_Mono, IBM_Plex_Serif } from "next/font/google";

const sans  = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-sans" });
const mono  = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400","500"],       variable: "--font-mono" });
const serif = IBM_Plex_Serif({ subsets: ["latin"], weight: ["400"],            variable: "--font-serif", style: ["normal","italic"] });
```

**Monospace rule (strict).** Mono is reserved for values a machine produced and a human may need to compare character by character: SHA-256 hashes, `cust_001`, refusal codes like `duplicate_block_for_merchant`, clause identifiers, timestamps, idempotency keys, JSON payloads. It is **never** used for section labels, headings, nav items, button text, or captions. Mono-as-decoration is the single fastest way to make this look generated.

Rupee amounts stay in Plex Sans with `font-variant-numeric: tabular-nums`, always right-aligned in tables so decimal columns line up.

Type scale (rem, 16px base): 0.75 / 0.8125 / 0.875 / 1 / 1.25 / 1.75 / 2.5. Weights 400, 500, 600 only. Body line-height 1.55; serif quotes 1.7. Cap prose line length at 72ch.

### 3.4 Anti-patterns — do not produce these

These are the tells that make a generated interface obvious. Every one of them is currently in the codebase or was in the first draft of this brief:

- **Emoji as icons.** Delete every `✓`, `✗`, `?`, `⚠️`, `✅` from JSX. Use `lucide-react`.
- **ALL-CAPS tracked-out eyebrow labels** above headings (`TRANSACTION SUMMARY` in letter-spaced small caps). Sentence case, normal tracking.
- **Middle-dot meta strings** — `NPCI/UPI/OC No.228 · Issuer §4 · verified 12s ago`. Use separate elements with spacing or explicit labels.
- **`→` appended to button and link text.** The button says "Open the dashboard". Nothing else.
- **Fade-and-slide-up on every section and hover-lift on every card.** See §7.
- **Identical rounded cards for everything**, one radius regardless of hierarchy, the same soft grey shadow under each.
- **Numbered markers (01 / 02 / 03)** on content that isn't a sequence. The 5-stage gate flow *is* a sequence and may be numbered. Three feature blurbs on the landing page are not.
- **Gradients, glows, mesh backgrounds, decorative blur.** None.
- Accenting one word of a headline in a different colour or italic.

---

## 4. Route structure

Move the app under `/app/*` so `/` is free for marketing.

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Landing page (new) |
| `/login` | `app/login/page.tsx` | Demo sign-in (new) |
| `/app` | `app/app/page.tsx` | Dashboard (move current `app/page.tsx` here) |
| `/app/transactions/[id]` | move existing | Transaction detail |
| `/app/constraints` | move existing | Declared vs authoritative |
| `/app/ledger` | move existing | Hash-chained audit log |
| `/app/demo` | move existing `demo-mode` | Demo scenarios |
| — | `app/app/layout.tsx` | App shell (sidebar + top bar) |
| — | `app/(marketing)/layout.tsx` | Minimal chrome for `/` and `/login` |

Update every internal `Link href` when you move files. Grep for `href="/` and `href="/transactions` after the move; a broken nav link in front of a judge costs more than any amount of polish.

---

## 5. Component inventory

Install: `npm i lucide-react motion`, then `npx shadcn@latest init` and add only `button`, `badge`, `table`, `tabs`, `dialog`, `skeleton`, `separator`. shadcn copies source into `components/ui/` — it is not a runtime dependency to fight, and it is Tailwind v4 compatible.

Then build six project primitives in `components/`. Everything else composes from these; once they exist each page is roughly an hour of work.

### `<Verdict status="ALLOWED" | "REFUSED" | "UNDETERMINED" />`
A pill: tinted background, matching text colour, no border, 4px radius, sentence case ("Allowed", not "ALLOWED"). Optional `size="sm"` for table rows. Maps through `STATUS_COLORS` in `lib/constants.ts` — do not hardcode the mapping in two places.

### `<Money paise={249900} />`
Formats minor units to `₹2,499` using `Intl.NumberFormat("en-IN")`, applies `tabular-nums`, right-aligns by default. The backend speaks paise everywhere; the UI must never do rupee arithmetic itself.

### `<Hash value="a91f...c0d4" />`
Mono, truncated in the middle to first-6 + last-4, `title` attribute carrying the full value, click-to-copy with a brief check state. Used in the ledger, on receipts, and on the corpus checksums.

### `<ClauseCite circular="NPCI/UPI/OC No.228" clause="Issuer §4" />`
Small inline citation. Circular name in sans at `--color-ink-2`, clause identifier in mono. Links to the corresponding row in `/app/constraints` when a match exists.

### `<Evidence />`
**The most important component in the app.** Props: `code`, `circular`, `clause`, `quote`, `requested`, `remaining`, `ledgerSeq`, `ledgerHash`.

Layout, top to bottom:
1. A row with a `ShieldX` icon, the refusal code in mono at `--color-fail`, and the citation pushed right.
2. The verbatim quote, set in **IBM Plex Serif** at 1.0625rem, with a 2px left rule in `--color-fail` and left padding. No quotation marks — the rule and the face already mark it as quoted. Do not round the corners of a single-sided border.
3. A footer line: requested amount, remaining balance, ledger sequence and hash.

Surface: white, 1px `--color-fail` border at 25% opacity or `--color-rule` if that reads too loud, 4px radius, 16px padding.

This component appears on the dashboard (for the most recent refusal), on transaction detail, and in the demo scenarios. It is the thing judges will screenshot.

### `<GateFlow stages={...} failedAt={2} />`
The 5-stage payment flow. Horizontal on desktop, vertical stack below 768px. Each stage is a numbered marker on a hairline connector, with a label. Stages before the failure render in ink; the failed stage renders in `--color-fail` and anchors an `<Evidence>` block directly beneath it; stages after render at `--color-ink-3`. This is the one place numbered markers are correct — it is genuinely a sequence.

---

## 6. Page specifications

### 6.1 App shell — `app/app/layout.tsx`

Left sidebar, 224px, `--color-surface`, `border-r --color-rule`, full height, non-collapsing on desktop and a slide-over sheet below 1024px.

- Top: a small square ink mark and the wordmark `in.razorpay.upi` in Plex Sans 500, with `Payment gate` beneath at 0.75rem `--color-ink-3`.
- Nav items with `lucide-react` icons: Overview (`LayoutGrid`), Transactions (`ArrowLeftRight`), Constraints (`Scale`), Ledger (`Link2`), Demo (`Play`). Active item gets `bg-paper` and ink text; inactive is `--color-ink-2`. Use `usePathname()` for the active state — the current UI has no active nav state at all, which is a large part of why it reads as unfinished.
- Bottom: a "Demo mode" toggle and a small avatar with the signed-in name.

Top bar: 56px, `border-b --color-rule`, breadcrumb on the left in sans, a "Verify ledger" button on the right that runs the hash-chain check and shows the result inline.

Content: `max-w-[1040px]`, `px-10 py-8`, left-aligned, with the 72px marginal column reserved on screens above 1280px.

### 6.2 Landing — `app/page.tsx`

One screen above the fold. The hero is a **typographic collision**, not a stat block or a gradient:

> The block created shall not be treated as the guarantee of payment.

Set that in Plex Serif at 2.5rem, left-aligned, max 20ch–40ch per line, attributed beneath in sans at 0.8125rem: NPCI/UPI OC No.228, Acquirer §2. Directly under it, the merchant's contradicting claim — `Guaranteed Collection` — rendered with a strikethrough rule in `--color-fail`. Then one line of body copy: *Merchant terms say otherwise. We catch it before the money moves.*

Two actions: "Open the dashboard" (ink button → `/login`) and "Read the architecture" (underlined ink link → GitHub). No arrow glyphs.

Below the fold, in one column:
- Three ruled blocks — Extract, Conform, Enforce — one sentence each, hairline-separated, not cards, not numbered.
- A single ruled strip of real figures: 195 tests, 7 authoritative claims, 8 refusal codes, 0 LLM calls on the money path. Label and value on one line each, values in tabular figures.
- Footer: one line, GitHub link, event attribution.

Copy discipline: active voice, sentence case, no "seamless", "unlock", "leverage", "simply", no exclamation marks.

### 6.3 Login — `app/login/page.tsx`

Centred, narrow (max 360px), on `--color-paper`. Wordmark, one line of body copy, two disabled-looking-but-real fields pre-filled with the demo credentials, and one ink button: **Sign in as judge**. One click, straight to `/app`. Include a small line beneath: *Demo environment. Credentials are pre-filled.*

### 6.4 Dashboard — `app/app/page.tsx`

Order matters. Lead with evidence, not counters.

1. **Status strip** (not a 250px hero card). One ruled line: compliance state, "3 of 3 rules pass" as a `<Verdict>` pill, and when it was last verified. Under 64px tall.
2. **Most recent refusal** rendered as a full `<Evidence>` block. If there are no refusals, an empty state that says what would appear here — an invitation, not "Nothing here yet."
3. **Three counters** as a ruled row, not a card grid: allowed / refused / undetermined. Small sans label, value at 1.75rem/500 tabular, one line of context beneath ("₹8,798 captured", "1 clause cited", "confidence below 0.60"). Hairline separators between them.
4. **Transactions table.** Rows at ~40px, not 90px. Columns: time (mono, 0.8125rem, `--color-ink-2`), amount (right-aligned, tabular), customer (mono), verdict (`<Verdict>` pill, with the clause reference beside it when refused). Whole row is a link to the detail page; hover sets `bg-paper`. Header row in sans at `--color-ink-3`, sentence case, no caps. Keep the existing status filter but restyle it as a small segmented control, not a native `<select>`.

### 6.5 Transaction detail — `app/app/transactions/[id]/page.tsx`

`<GateFlow>` at the top, the `<Evidence>` block anchored to the failing stage, then the conformance results as ruled rows (declared value, authoritative value, verdict, confidence), then the ledger entry with `<Hash>` and an expandable JSON payload in mono.

### 6.6 Constraints — `app/app/constraints/page.tsx`

A two-column ruled comparison: declared on the left, authoritative on the right, verdict in the margin. Each row carries its `<ClauseCite>`. Where a declared value exceeds authority, tint only the offending cell, not the whole row.

Include the OC-201 §7 scope case prominently — two bounds in one sentence, ₹15,000/month versus ₹5,000/transaction, where the naive regex baseline returns the wrong one. That's a strong specific detail; give it a labelled row rather than hiding it.

### 6.7 Ledger — `app/app/ledger/page.tsx`

Vertical chain: entries down the page, each with its sequence number in the left margin, connected by a continuous hairline that literally renders the chain. Each entry shows `<Hash>` for its own hash and previous hash, the payload type, and a verification state. Genesis anchor at the top, HEAD commitment at the bottom. A "Verify chain" action that walks the chain and marks each link.

### 6.8 Demo — `app/app/demo/page.tsx`

Four scenarios as ruled rows with a "Run" button each. Running one navigates to the resulting transaction detail with the gate flow animation playing. Keep the pre-loaded data summary, drop the "navigation instructions" block — if the UI needs instructions, fix the UI.

---

## 7. Motion

**One orchestrated moment, plus response-to-action feedback. Nothing else.**

The one moment is `<GateFlow>`: stages illuminate in sequence at ~160ms intervals, and when the sequence reaches a failing stage, the `<Evidence>` block expands beneath it. Total under 1.2s. Triggered on mount of the transaction detail page and by the demo scenarios. Rehearse the demo to land on this.

Response-to-action motion that is welcome: the copy-confirmation state on `<Hash>`, the expand/collapse of the JSON payload, the sidebar sheet on mobile, the verify-chain progression.

Do **not** add: fade-and-slide-up entrances on every section, staggered card reveals, hover-lift on rows or cards, number count-ups, scroll-triggered reveals, page transition wipes. These are the generic default and read as generated.

All motion respects `prefers-reduced-motion: reduce` — under that query, `GateFlow` renders in its final state immediately. Cap durations at 300ms except the single gate sequence.

---

## 8. Demo authentication

No NextAuth, no database, no provider. Roughly 60 lines total.

- `app/api/auth/route.ts` — a POST handler that checks the credential against `process.env.DEMO_PASSWORD` (default in `.env.local`), sets an `httpOnly`, `sameSite: "lax"` cookie named `rzp_demo`, and returns 200. Note that `cookies()` is async in this Next version — `const jar = await cookies()`.
- `middleware.ts` at the project root with `export const config = { matcher: ["/app/:path*"] }` — redirect to `/login` when the cookie is absent.
- A "Sign out" item in the sidebar footer that clears the cookie and returns to `/`.

This looks entirely real, costs nothing to maintain, and puts a judge inside the product in one click.

---

## 9. Build order

Work in phases. Run `npm run test:run && npx tsc --noEmit` at the end of each. Commit per phase.

| Phase | Est. | Deliverable | Done when |
|---|---|---|---|
| 0 | 30m | Test-safety pass: baseline recorded, `data-testid` added, tests query by test id | Baseline suite green, no markup changed yet |
| 1 | 30m | Tokens in `globals.css`, three Plex faces wired, `lucide-react` installed, every emoji glyph deleted from JSX | `grep -rn "✓\|✗\|✅\|⚠️" app/ components/` returns nothing |
| 2 | 60m | Route move to `/app/*`, app shell with sidebar and active nav state | Every nav link resolves; no 404 on any route |
| 3 | 90m | shadcn primitives + the six project components, each rendered on a scratch page | All six render; `Evidence` matches §5 |
| 4 | 60m | Dashboard rebuilt per §6.4 | Evidence block above the counters; rows ≤44px |
| 5 | 60m | Landing + login + middleware | One click from `/` to `/app` |
| 6 | 60m | Transaction detail, constraints, ledger, demo rebuilt | All four use the shared primitives |
| 7 | 30m | `GateFlow` motion, reduced-motion handling, mobile pass at 390px | No horizontal scroll at 390px; keyboard focus visible throughout |

Take a screenshot at the end of phases 4, 5, and 6 and critique it against §3.4 before continuing. If a screen looks like it could belong to any other product, name what is generic about it and fix that specifically.

---

## 10. Quality floor

Non-negotiable, and cheap if done as you go rather than at the end:

- Responsive to 390px. The sidebar becomes a sheet; `GateFlow` stacks vertically; tables scroll horizontally inside a wrapper rather than overflowing the page.
- Visible keyboard focus on every interactive element. A 2px `--color-ink` outline with 2px offset is fine; do not remove default outlines without replacing them.
- Verdict is never carried by colour alone — the pill always has a text label, so the design survives colour blindness and a projector with bad calibration.
- All text meets 4.5:1 against its background. Check `--color-ink-3` on `--color-paper` specifically; lighten the paper or darken the ink if it fails.
- Real empty states and error states on every list. An empty ledger says what will appear there; a failed API call says what happened and what to do, in the interface's voice, without apologising or exposing a raw exception.

---

## 11. Do not build

Each of these costs hours and earns nothing from a judge:

- Dark mode (remove the existing one)
- A charting library — there is no time series worth charting here
- A state manager — server components and `useState` are sufficient
- Real authentication, user accounts, or a database
- Pricing, marketing sub-pages, testimonials, or a blog
- Internationalisation
- A settings page
- Toast notification infrastructure — inline feedback is enough at this size

---

## 12. Definition of done

- `npm run build` clean, `npx tsc --noEmit` clean, `npm run test:run` at or above the recorded baseline
- No emoji glyphs, no `dark:` classes, no ALL-CAPS labels, no `→` in button text anywhere in `app/` or `components/`
- Landing → login → dashboard → a refusal's evidence, in four clicks
- The gate flow animation runs once, cleanly, on transaction detail
- Every page renders correctly at 390px, 768px, and 1440px
