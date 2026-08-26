# `aryanpajnee/RazorpayBuildathon` — the direct competitor

| Field | Value |
|---|---|
| URL | https://github.com/aryanpajnee/RazorpayBuildathon |
| Description | *"A merchant that an AI buyer agent can transact with autonomously, under signed and bounded authority. Razorpay AI Buildathon Track 01."* |
| Created / pushed | 2026-08-25 / 2026-08-25 |
| Size · lang · stars | 308 KB · Python · 0 |
| Inspected | 2026-08-26, source read from clone |
| Verdict | **Serious. The closest thing in the field to the direction this research was converging on.** |

## Why this repo matters more than any other in the field

An independent builder has read the same rubric, reached the same conclusions, and started building the same thesis. **The claim "nobody is doing bounded agent spend authority" is false and must not be made.**

## What it actually is

```
core/mandate.py        Intent + Cart Mandates. Canonical JSON, Ed25519 sign/verify, cart hashing
merchant/quote.py      Deterministic quote engine. Integer paise, GST in basis points, 90s TTL
merchant/catalog.py    Product lookup — "the buyer names a sku; the merchant names the price"
merchant/gateway.py    Razorpay order creation, idempotent on quote_id
merchant/webhooks.py   Webhook receipt. HMAC over raw bytes, replay-safe
buyer/llm.py           LLM behind a rate guard, structurally off the money path
docs/specs/            gate-spec, ledger-spec, mandate-spec, buyer-agent-spec
FAILURES.md            live failure log
```

## Claims verified against code — `FACT`

| Claim | Verdict |
|---|---|
| "156 tests" | **Substantially true.** 153 `def test_` across 6 files, 1 `parametrize` → ~156 collected. Not inflated. |
| "LLM never touches the money path" | **Structurally true.** No LLM/genai/gemini/openai import anywhere in `core/` or `merchant/`. It is enforced by layout, not merely asserted. |
| "All money is integer paise" | Consistent with `order.create` returning `amount: 9900` as int. |

## Where it hits the rubric squarely

- **Pillar 3 (AI judgment — "where you chose *not* to use one"):** *"The LLM never touches the money path… Quoting, mandate verification, authorisation, payment execution and idempotency are a deterministic state machine. The model does goal decomposition and product selection only."* This is a direct, structurally-enforced hit on the single most discriminating clause on the site.
- **Pillar 4 (Failure recovery):** `FAILURES.md` opens *"Kept live from day one. Razorpay's form asks for this and says it's the answer they read first, so it's written as things break — not reconstructed afterwards."* **They have decoded "the last one is the one we read first" too.** Entries are specific, costed ("~1 hour"), and end with "What I'd tell the next person."
- **Honest limitations section** naming three real defects unprompted: `UNIQUE`-constraint idempotency deduplicates *rows not actions* so a cross-process race can double-order; stock checked at quote time but never reserved; `gemini-3.6-flash` ignores `temperature` so no determinism claimed model-side.

## The genuinely good idea in it

> *"`verify()` proves a mandate was signed by the holder of the key it carries and has not changed since. It does **not** prove that key belongs to anyone entitled to spend — an attacker can generate their own keypair and produce a perfectly valid signature… **A valid signature proves origin, not permission.**"*

That distinction is correct, non-obvious, and is exactly the gap Web Bot Auth also refuses to close (*"an unresolved Signature-Agent is a claim rather than an identity"*). Independent convergence on the same insight from two directions is strong evidence the insight is real.

## Where it is weak — and where the opening is

**1. It is unfinished, and the unfinished parts are the load-bearing ones.** Verbatim: *"Status: in development… the enforcement **Gate**, audit **ledger** and agent layer are specified and land next. Demo and video to follow."* The Gate (7 checks, 14 refusal codes), the hash-chained ledger, and the buyer state machine exist only in `docs/specs/`. Created 2026-08-25 — one day of work. Ten days remain, so assume it will be finished.

**2. It has no measurement at all.** 153 unit tests, but **no batch metric, no held-out set, no baseline, no ablation.** Three of five track bars demand measured results over a batch; this has none yet.

> This is where it meets the field-wide finding: **every measured repo in the field has a compromised measurement target — nobody checks label leakage, nobody builds an honest baseline, nobody ablates, nobody reports effective n.** This repo hasn't reached the measurement stage to be compromised at it.

**3. Its own framing concedes the strategic point:** *"NPCI's Unified Agentic Protocol is **not live** — it is pending RBI approval. This implements an **AP2-style** mandate layer and treats UAP as the slot it plugs into when it ships."* (Corroboration pending from the India-rails agent — treat as `HYPOTHESIS` from a competitor's README, not `FACT`.)

## Consequences for our strategy — `INFERENCE`

1. **Do not claim novelty of the thesis.** Claim a better answer to a specific sub-problem.
2. **Differentiation cannot come from the mandate layer.** Signed mandates, Ed25519, cart hashing, deterministic money path — all occupied, competently.
3. **Differentiation is available in measurement**, which is the field's universal blind spot *and* this repo's current gap. Being the one entry whose headline number survives a determined attack — with a real baseline, an ablation proving the mechanism is load-bearing, and effective-`n` reported — is a defensible edge that nothing observed in the field currently holds.
4. **The `FAILURES.md` advantage is gone.** At least one competitor is already writing the failure log live. It is now table stakes, not an edge.
5. **Useful intelligence:** their `FAILURES.md` documents that Razorpay test-mode signup hard-gates on Business PAN via `easy.razorpay.com`, and the escape is to pick business type **Individual** (not Sole Proprietorship) which reveals a **"Get test keys"** button in the nav. **This will save us the same hour.**

## Open items
- Re-inspect near the deadline to see whether the Gate and ledger actually land.
- Their `docs/specs/gate-spec.md` (7 checks, 14 refusal codes) is worth reading as a design reference — it is a specification, not code, so reading it is competitive intelligence rather than reuse.
