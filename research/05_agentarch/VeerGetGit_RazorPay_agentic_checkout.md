# AgentArch — VeerGetGit/RazorPay_agentic_checkout

| Field | Value |
|---|---|
| Repository | `VeerGetGit/RazorPay_agentic_checkout` |
| Local clone | `/tmp/rzp_scratch/VeerGetGit_RazorPay_agentic_checkout` |
| Competition | Razorpay AI Buildathon 2026 — **Track 01** (conversational UPI checkout) |
| Placement | UNDETERMINED — no placement information in repo or README |
| Stack | Python · FastAPI · LangGraph · LangChain-Groq · SQLAlchemy/SQLite · React/Vite frontend |
| Backend size | 4,232 LOC across 33 `.py` files (`find backend -name "*.py" \| xargs wc -l`) |
| Tracked files | 2,486 — of which **2,408 are `frontend/node_modules`** (`git ls-files \| grep -c node_modules`) |
| Last commit | `a2c5af5` "feat: agent fully production ready — all 10 scenarios working" |

---

## Original Problem

Conversational commerce checkout: a user shops by chat, the agent finds products,
builds a cart, enforces a spend cap, takes explicit consent, and creates a
Razorpay order. The problem is well-chosen for Track 01 — agentic checkout with
a spend guard and an audit trail is exactly the shape Razorpay asked for.

## Original Solution (as claimed)

There is effectively **no stated solution**. `README.md` is two lines:

```
# RazorPay_agentic_checkout
 AI agent for conversational UPI checkout — Razorpay AI Buildathon 2026
```

There is no setup section, no architecture description, no metrics, no failure
narrative, no run command, and no `.env` documentation beyond a bare
`backend/.env.example`. Because there is no README to contradict, most of the
overclaims in this repo live in **docstrings**, which is worse: they are read as
documentation by a reviewer opening the file.

---

## Actual Architecture (from code)

### Shape

A hand-wired **LangGraph state machine**, not an agent. There is no tool-calling
loop, no planner, no `bind_tools` anywhere. `agent/graph.py:60-149` declares 11
nodes and 3 conditional routers in a fixed topology:

```
input_guard → intent → {catalog | checkout} → spend_guard → action_guard
            → payment → {audit_logger | recovery} → output_guard → respond → END
```

`agent/graph.py:156` compiles one process-global graph instance.

### Where the LLM actually is

Exactly **four** call sites, all Groq via `RateLimitedChatGroq`
(`agent/llm.py:15-33`):

| Site | File:line | What the output does | Load-bearing? |
|---|---|---|---|
| Intent classification | `agent/nodes/intent_node.py:71` | 5-way string label → `route_after_intent` | **Decorative.** Output is constrained to 5 words; any unexpected value silently becomes `"browse"` (`intent_node.py:79-82`); on exception it also becomes `"browse"` (`intent_node.py:113-116`). A regex over the same keyword list in the prompt would route identically. |
| Search-keyword extraction | `agent/nodes/catalog_node.py:97-121` | One word fed into a SQL `ILIKE %...%` (`catalog_node.py:127-131`) | **Decorative.** On any exception it returns `"all"` (`catalog_node.py:123-125`). The downstream `_search_products` already has three regex/keyword fallback tiers (`catalog_node.py:133-171`) that do the job without it. |
| Recovery message | `agent/nodes/recovery_node.py:65-68` | Free text shown to the user on payment failure | **Load-bearing** — this is the one place LLM prose actually reaches the user, and even here the retry/support decision is appended deterministically (`recovery_node.py:73-82`). |
| Final response fallback | `agent/nodes/respond_node.py:56-60` | Free text | **Near-dead.** `respond_node.py:41-50` short-circuits whenever `final_response` is set — which every other node sets. Reachable only for `intent ∈ {cancel, unknown}`. |

**Everything the user sees on the happy path is a hardcoded Python f-string.**
`catalog_node.py` is 457 lines of `re.sub`, keyword lists and templates
(`_is_add_to_cart` 12-57, `_is_remove_from_cart` 60-62, `_is_cart_query` 65-75,
`_extract_product_name` 78-92, plus template blocks at 176-192, 245-259, 302-311,
367-378, 388-398). The verdict the rubric asks for — *"would a for-loop and a
regex do this?"* — is answered by the repo itself: **it already is a for-loop and
a regex**, with two LLM calls decorating the edges.

### Data / state

- SQLite via SQLAlchemy (`db/database.py`), models `Product`, `Order`, `Session`,
  `AuditLog` (`db/models.py`).
- Seed catalog: 20 products across 4 categories (`db/seed.py`), run on startup
  (`main.py:44`). Seed data is real and present.
- **Cart lives in a module-level Python dict** — `api/chat.py:17
  `_cart_store = {}``, read at `chat.py:95` and written at `chat.py:109-112`.
  Single-process only, lost on restart, never evicted (unbounded growth), and
  invisible to the DB that the spend guard trusts.
- Session auth: opaque 64-hex bearer token (`db/session_store.py:31`), validated
  per request (`api/chat.py:62-84`) with a session-id/token match check. This is
  genuinely correct and better than most hackathon repos.

### Sync/async

All LLM and DB work is **synchronous inside `async def` handlers**
(`api/chat.py:106` calls `graph.invoke`, not `ainvoke`). The rate limiter calls
`time.sleep()` **while holding a `threading.Lock`** (`rate_limiter/groq_limiter.py:44,62,78`)
and is invoked from `ainvoke` too (`agent/llm.py:31`), so a throttle event blocks
the event loop and serialises every concurrent request.

---

## What The Code Proves

### 1. There is no measurement. At all. — `FACT`

`backend/evals/` contains **one file, `__init__.py`, zero bytes**. It is an empty
Python package with a name that implies an eval harness.

The three root-level scripts — `test_agent.py` (129 lines), `rigorous_test.py`
(171), `advanced_test.py` (109) — contain **zero assertions**:

```
$ grep -c "assert" test_agent.py rigorous_test.py advanced_test.py
test_agent.py:0
advanced_test.py:0
rigorous_test.py:0
```

They `httpx.post` at a live `http://127.0.0.1:8000`, `print()` the first 120
characters of the response, and `time.sleep(3)` between calls. There is no
expected value, no pass/fail, no score, no batch, no held-out set, no baseline,
no precision, no recall, no confusion, no exception list. A human must read the
stdout and decide. The commit message `28aa4e0 "all 10 agent tests passing"`
describes a judgement the code cannot make.

**Verdict: measurement is absent, not theatre.** There is no number to be
suspicious of because there is no number. Against a rubric whose Track-01 bar is
"measured precision and recall on a held-out test set", this is a categorical
miss.

### 2. No money ever moved — and the code tells the user it did — `FACT`

`agent/tools/razorpay_tools.py:82-90` calls `razorpay_client.order.create(...)`.
A Razorpay **Order** is an intent object; it is not a payment. `verify_payment`
exists at `razorpay_tools.py:131` and `get_order_status` at `:186`, and the list
`razorpay_tools` at `:223-227` exports all three — but grepping the entire repo,
**neither is ever called** and the list is never bound to any LLM:

```
$ grep -rn "verify_payment|get_order_status|razorpay_tools" backend frontend/src
→ only the definitions themselves, plus payment_node.py:4 importing create_razorpay_order
```

The committed database proves the consequence. `backend/db/razorpay_agent.db`
(tracked in git despite `.gitignore` containing `*.db`) holds 5 real orders from
the author's own runs:

```
order_TU9OxHYKqBGlBu  79999.0  pending
order_TU9PPEQYb4RDpc   4499.0  pending
order_TU9femscXDRlaY  29994.0  pending
order_TU9g4oZCCXZRIV  79999.0  pending
order_TU9gYShkWhnf1w   4499.0  pending
```

**Every one is `pending`.** Not one capture, in the author's own demo data.
Meanwhile `payment_node.py:90-95` returns `"Payment successful! 🎉"` and
`payment_node.py:62` calls `update_spent(...)`, **decrementing the user's spend
cap against an unpaid order**. The single most load-bearing state in a
money-safety system is mutated on an event that is not a payment.

### 3. The consent gate can be bypassed by the phrase that opens it — `FACT`

The intent prompt maps `"buy it"` → `checkout` (`intent_node.py:41`). Routing
sends `checkout` → `checkout_node` → `spend_guard` → `action_guard`, all inside
**one graph invocation for one user message**. `action_guard_node` then reads
`human_messages[-1]` (`action_guard.py:19-20`) — **the same message** — and
checks it against:

```python
confirm_keywords = ["yes","confirm","proceed","pay","ok","okay","sure",
                    "go ahead","do it","confirm payment","buy it","buy",
                    "purchase","yes please","haan","ha"]      # action_guard.py:23-28
is_confirming = any(kw in user_message for kw in confirm_keywords)  # :35
```

`"buy it"` matches `"buy it"`, `"buy"`, and (via substring) nothing else — but it
matches. So `consent_given = True` (`:57-62`), `route_consent` returns
`"confirmed"` (`route_spend.py:42-44`), and `payment_node` fires. The order
summary built at `checkout_node.py:45-52` ending *"Reply **Yes** to confirm
payment or **No** to cancel"* is written into `final_response` and then
**overwritten** by `payment_node.py:90` before the user ever sees it.

The two-step human-in-the-loop confirmation that is the entire point of the node
never happens on the primary path. The author's own `test_agent.py:118-126` (T10
"Cancel Flow") sends `'buy it'` then `'no cancel'` — the order was already
created on the first message.

Substring matching makes it worse: `"ok"` is a substring of `"book"`, `"look"`,
`"broke"`; `"pay"` is a substring of `"payment"`; `"buy"` of `"buying"`.

### 4. The retry stopping rule is unreachable — `FACT`

`recovery_node.py:73` gates on `retry_count < 3`, and `agent/state.py:126-128`
documents *"recovery_node stops retrying after 3 attempts"*. But
`get_initial_state(...)` sets `retry_count = 0` (`agent/state.py:198`) and
`api/chat.py:87` calls it **fresh on every HTTP request**. Within a single graph
run `retry_count` can only reach 1. The `>= 3` branch (`recovery_node.py:78-82`,
"contact support") is dead code. There is no bounded-attempt stopping rule in
practice — only in the docstring.

### 5. The input guard's docstring describes three models that do not exist — `FACT`

`agent/nodes/input_guard.py:14-18` states:

```
Runs 4 checks in order:
1. Malformed input    (pure Python)
2. Toxic language     (Guardrails AI)
3. Prompt injection   (Llama Prompt Guard 2 86M)
4. Off-topic request  (compound-mini)
```

and logs `"All 4 checks passed"` at `:66`. The actual `validate_input`
(`validators/input_validators.py:55-70`) runs **three pure-Python substring
scans** over two hardcoded lists (`INJECTION_KEYWORDS` `:12-33`, `TOXIC_KEYWORDS`
`:35-38`). There is no Guardrails AI, no Llama Prompt Guard, no `compound-mini`,
no model of any kind in the file. `GROQ_MODEL_GUARD` appears in `.env.example:4`
and is **never read by any code** (`grep -rn getenv backend`). Similarly
`agent/llm.py:52` claims `llm_mini` is *"Used by: ShoppingTopicGuard in
input_validators.py"* — no such class exists.

This is a false claim about a **safety** layer, which is the worst place to make
one.

The lists themselves are unbounded substring matches: `"die"` in `TOXIC_KEYWORDS`
blocks *"indie"*, *"studies"*, *"bodies"*; `"hate"` blocks *"I hate waiting"*.
False-positive cost is never measured.

### 6. The one genuinely good idea is disabled by its own skip list — `FACT`

`PriceHallucinationGuard` (`validators/output_validators.py:19-93`) is the best
thing in the repo: it regexes every `₹NNN` out of the model's output and asserts
each price exists in the product table within ±1 rupee (`:53-73`). Grounding
generated numbers against the system of record is exactly the right pattern for
money.

Then `:38-47` short-circuits it:

```python
skip_phrases = ["Cart total","Order Summary","order_","Payment successful","🛒",
                "Total:","Remaining:","Here's what you can buy",
                "products from our catalog","Added to cart","Removed from cart",
                "what you can buy","you can buy with"]
if any(phrase in value for phrase in skip_phrases): return PassResult()
```

Cross-reference the templates: every catalog listing begins `"Here are products
from our catalog:"` (`catalog_node.py:390`), every cart view contains `"🛒"`
(`catalog_node.py:184`), every budget query begins `"Here's what you can buy
with ₹..."` (`catalog_node.py:319`), every checkout summary contains `"Total:"`
(`checkout_node.py:48`). **The skip list covers essentially every path that
contains a price.** The guard passes trivially on the cases it was built for.
It also fails open on exception (`:89-91`).

### 7. Other absences and defects — `FACT`

- **`requirements.txt` pins nothing.** 22 dependencies, zero version specifiers,
  `httpx` listed twice. `guardrails-ai-toxic-language` and
  `guardrails-ai-detect-pii` are not installable PyPI distributions (Guardrails
  Hub validators install via `guardrails hub install`), so `pip install -r
  requirements.txt` fails on a clean machine. `spacy`/`presidio-*` are listed and
  never imported. This alone likely fails the *"does it run"* gate.
- **`.env.example` does not match the code.** `GROQ_MODEL=compound` /
  `GROQ_MODEL_MINI=compound-mini` vs code defaults `groq/compound` /
  `openai/gpt-oss-20b` (`agent/llm.py:40-41`). `GROQ_MODEL_GUARD`,
  `SPEND_LIMIT_DEFAULT`, `SESSION_EXPIRY_MINUTES` and `DATABASE_URL` — the file
  has a UTF-8 BOM on line 1, which breaks the first key name in some loaders.
  (`SPEND_LIMIT_DEFAULT`/`SESSION_EXPIRY_MINUTES` *are* read, at
  `db/session_store.py:16-17`; `GROQ_MODEL_GUARD` and `DATABASE_URL` are not read
  anywhere.)
- **Duplicate audit writes.** `audit_logger_node` persists the audit log with a
  dedupe check (`agent/nodes/audit_logger.py:36-45`), and then `api/chat.py:120-140`
  persists the *same* `result["audit_log"]` again **without** a dedupe check. The
  success path double-writes every entry. An audit trail that lies about how many
  times something happened is a bad audit trail.
- **Duplicate check fails open.** `validators/spend_validators.py:98-100` catches
  any DB exception in the duplicate-order check and returns `{"passed": True}`.
  A DB blip authorises a double order.
- **Rate limiter contradicts itself.** Docstring says `5500 TPM ... Groq free
  tier = 6000` (`groq_limiter.py:16-17`); the shared instance is constructed with
  `tpm=13000` (`:115`), over double the stated tier limit.
- **Dead code / copy-paste.** `spend_guard.py:61-73` assigns `remaining` and
  `block_response` twice in a row, the first pair discarded.
  `route_intent.py:29-32` has unreachable trailing whitespace after `return`.
- **20 live session bearer tokens committed** in `razorpay_agent.db` (`sessions`
  table), alongside 388 audit rows from the author's own testing. No API keys
  leaked, but shipping auth credentials in git is a habit that fails a security
  review.
- **97% of the repository is `frontend/node_modules`** (2,408 of 2,486 tracked
  files). `.gitignore` was fixed at commit `336a8fc` but the files were never
  `git rm --cached`'d.

### Claims verified

| Claim (docstring) | Status |
|---|---|
| Spend cap enforced in code, not prompt (`spend_guard.py:20-21`) | **VERIFIED** — `validators/spend_validators.py:119-160`, four ordered checks, limit read from DB session (`api/chat.py:90`), not from user text. |
| Idempotency key prevents double orders (`razorpay_tools.py:27-40`) | **VERIFIED** — MD5 of `session_id + cart + amount + minute`, checked against `Order.idempotency_key` before creating (`:66-79`). Genuine, if the 1-minute granularity is arbitrary. |
| Session token cannot be reset by the user | **VERIFIED** — `secrets.token_hex(32)`, DB-side spend limit, id/token match enforced (`api/chat.py:77-84`). |
| Audit trail persisted and streamed | **VERIFIED but degraded** — `AuditLog` rows exist (388 in the committed DB), SSE endpoint at `api/stream.py`; entries are double-written (see above). |
| Checkout summary built without an LLM (`checkout_node.py:13`) | **VERIFIED** — and it's the right call. This is the repo's one implicit deliberate-non-use-of-AI decision, but it is a docstring line, not a documented rationale. |

### Claims contradicted

| Claim | Contradicted by |
|---|---|
| "4 checks: Guardrails AI, Llama Prompt Guard 2, compound-mini" (`input_guard.py:14-18`) | `validators/input_validators.py` — three substring scans, no model. |
| "recovery_node stops retrying after 3 attempts" (`state.py:128`) | `retry_count` reset to 0 per request (`state.py:198` + `chat.py:87`). |
| "Layer 4 Guardrail — verifies explicit user consent before ANY money moves" (`action_guard.py:12-13`) | Same-turn keyword match on the checkout trigger (`action_guard.py:19-35`). |
| "Payment successful!" (`payment_node.py:91`) | All 5 committed orders are `status='pending'`; `verify_payment` never called. |
| "Price hallucination guard" (`output_guard.py:16-22`) | 13-phrase skip list covering every priced template (`output_validators.py:38-50`). |
| "all 10 agent tests passing" (commit `28aa4e0`) | Zero assertions in any test file. |
| `llm_mini` "Used by: ShoppingTopicGuard" (`llm.py:52`) | No such class exists in the repo. |

---

## Candidate Patterns

### P1 — Output-grounding validator: cross-check generated numbers against the system of record
- **Type:** `COMPONENT_PATTERN`
- **Source:** `backend/validators/output_validators.py:19-93` (`PriceHallucinationGuard`), wired at `:98-105`, invoked from `agent/nodes/output_guard.py:35`.
- **Why strong:** It inverts the usual guardrail direction. Most output guards check *style* (toxicity, PII). This one checks *factual consistency with the database* — regex every `₹NNN` out of the model's text, look each up in the catalog, fail the response if any price is invented. It is cheap (one query), deterministic, and catches the specific hallucination class that costs money.
- **Why relevant:** Razorpay's bar is "would you trust it". A model that quotes a wrong price, a wrong fee, a wrong outstanding balance or a wrong refund amount is a support ticket and possibly a liability. This is the smallest machine that makes a generated number trustworthy.
- **Razorpay applicability:** Directly transferable to Track 02 (reconciliation amounts), Track 03 (recovery amounts quoted to customers) and Track 05 (any generated summary containing figures). Generalises beyond prices to any entity: order IDs, invoice numbers, dates, account last-4.
- **How to independently reimplement:** (1) Define an extraction regex per entity class you care about. (2) Resolve each extracted value against the authoritative store in one batched query. (3) On mismatch, do **not** silently repair — block and emit a safe fallback plus an audit row naming the offending value. (4) **Never add a skip list.** If a path produces too many false positives, narrow the *extraction* regex or widen the *lookup*, not the bypass.
- **Risks:** The repo demonstrates the failure mode precisely — a skip list added to quiet false positives disabled the guard entirely. Also fails open on exception here (`:89-91`); a money-path guard should fail closed.
- **Score: 7/10**

### P2 — Deterministic multi-check spend validator returning `{passed, reason}`
- **Type:** `COMPONENT_PATTERN`
- **Source:** `backend/validators/spend_validators.py:12-160` — four independent pure functions (`check_amount`, `check_spend_limit`, `check_duplicate_order`, `check_cart_not_empty`) composed by `validate_spend` (`:119-160`) which stops at first failure and returns a human-readable reason.
- **Why strong:** Cheap checks ordered before expensive ones; each check is independently unit-testable; the failure *reason* is a first-class return value that flows straight into the user-facing message (`spend_guard.py:62-66`) **and** the audit row (`:52-58`). The limit is read from the DB session, never from conversational state.
- **Why relevant:** "Every money action explainable, bounded and gated" — this is the smallest structure that gives you all three from one call.
- **Razorpay applicability:** Universal. Any money-touching agent needs this shape.
- **How to independently reimplement:** Pure predicates, ordered cheapest-first, single composer, `{passed, reason, ...context}` return. Emit the reason to both the user and the ledger. **Fail closed** on internal errors — this repo fails open (`:98-100`), which is the one thing to change.
- **Risks:** Trivially degraded by fail-open exception handling. The 60-second duplicate window is an unjustified magic number.
- **Score: 6/10**

### P3 — Self-throttling LLM subclass (rate limit as a decorator, not a caller responsibility)
- **Type:** `COMPONENT_PATTERN`
- **Source:** `backend/agent/llm.py:15-33` — `class RateLimitedChatGroq(ChatGroq)` overriding `invoke`/`ainvoke` to call `groq_limiter.wait_if_needed()` first; limiter at `rate_limiter/groq_limiter.py:11-110`.
- **Why strong:** The insight is right: putting the throttle in the model object means no node can forget it, and the invariant holds by construction rather than by discipline. Free-tier rate limits are a real cause of 2AM demo failures.
- **Why relevant:** A hiring reviewer running your demo on a free API tier will hit 429s. Structural immunity is worth more than a retry decorator sprinkled on 11 call sites.
- **Razorpay applicability:** Moderate — infrastructure hygiene, not money safety.
- **How to independently reimplement:** Same idea, but fix the three defects: (a) use `asyncio.sleep` in `ainvoke` and never `time.sleep` on the event loop; (b) **release the lock before sleeping** — this implementation sleeps while holding `threading.Lock` (`groq_limiter.py:44,62,78`), serialising all concurrent requests; (c) charge *actual* token usage from the response, not a hardcoded `estimated_tokens=400` (`llm.py:26`).
- **Risks:** As written it is a global concurrency bottleneck and a blocked event loop. The instance also violates its own documented tier limit (`tpm=13000` vs docstring `5500`).
- **Score: 4/10**

## Selected Patterns

- **P1 — Output-grounding validator.** Take the idea, invert the two decisions that
  ruined it here: fail **closed**, and never add a bypass list.
- **P2 — Deterministic multi-check money validator with reasons.** Take the shape;
  fail closed.

## Rejected Patterns

- **The 11-node LangGraph topology.** It looks like architecture and is actually a
  linear `if/elif` chain with extra ceremony. Nothing in `graph.py:60-149` needs a
  graph library — there are no cycles, no parallel branches, no checkpointing, no
  interrupts. LangGraph's genuine feature for this problem is
  `interrupt_before=["payment"]`, which would have produced a real two-turn human
  gate; it is not used. Reimplementing this topology buys nothing.
- **The consent guard (`action_guard.py`).** Actively harmful as a template:
  unbounded substring matching over a 16-word keyword list, evaluated against the
  same message that triggered checkout, with no persisted `awaiting_consent`
  state across turns. Anyone copying it copies the bypass.
- **The input guard (`input_validators.py`).** Two hardcoded substring lists with
  no word boundaries, no measurement of false positives, and a docstring claiming
  three models that are not present. Deterministic input filtering is a legitimate
  choice — but it has to be *stated* as a choice and its false-positive cost
  measured, which is exactly what the rubric's "where you chose not to use one"
  clause rewards. Here it is an undocumented shortcut dressed as an ML pipeline.
- **The "test" scripts.** Zero assertions. Reusing this shape teaches the wrong
  reflex.

---

## Four Pillars Assessment

| Pillar | Verdict |
|---|---|
| **(a) Does it actually run?** | **Probably not on a clean clone.** `requirements.txt` pins nothing and lists at least two non-installable distributions (`guardrails-ai-toxic-language`, `guardrails-ai-detect-pii`). No README, no run command, no port, no ordering (`uvicorn main:app` from `backend/`? `npm run dev` in `frontend/`?). `.env.example` model names contradict code defaults and the file carries a BOM. Requires a live Groq key **and** live Razorpay test keys before the server will even pass its startup health check (`main.py:52`). Seed catalog is present and correct (20 products, `db/seed.py`) and the DB is committed, which helps — but everything else is friction. |
| **(b) Is it structured?** | **Yes, superficially — and it is the repo's real strength.** Clean separation: `nodes/` (one file per node), `edges/`, `tools/`, `validators/`, `db/`, `api/`, `rate_limiter/`. Files are small and single-purpose except `catalog_node.py` (457 lines, 5+ responsibilities). The structure is legible in 60 seconds. What is inside the boxes does not match the labels. |
| **(c) Deliberate non-use of AI?** | **Two instances, neither documented as a decision.** `checkout_node.py:13` — *"Builds order summary from cart WITHOUT LLM call"* — is correct and deliberate but is one docstring line, not a rationale. `input_validators.py` is entirely deterministic but its own consumer's docstring claims it uses three models, so it reads as a *failure* to wire up AI rather than a choice not to. **There is no "why there is no LLM in this path" table, and no README to put one in.** This is a direct miss on the highest-signal clause of the rubric. |
| **(d) Is failure handling real?** | **Broad but shallow, and fails open in the wrong places.** Every node has a `try/except` returning a safe fallback (`intent_node.py:101`, `catalog_node.py:~430`, `payment_node.py:121`, `recovery_node.py:100`, `respond_node.py:74`) — genuinely more disciplined than most hackathon code, and `recovery_node` even has a fallback for its own failure. But: no retries anywhere; no timeouts on the Groq or Razorpay clients (`razorpay_tools.py:19-24` constructs the client with no timeout); the duplicate check fails **open** on exception (`spend_validators.py:100`); the price guard fails **open** on exception (`output_validators.py:91`); the retry ceiling is unreachable; and the catch-all at `api/chat.py:157` converts any agent exception into a generic 500 with no correlation id. |

## Audit Trail / Bounded Actions / Stopping Rules

| Requirement | Implemented? | Evidence |
|---|---|---|
| Audit trail | **Partially real** | `db/models.py` `AuditLog`; every node appends a structured `{node, action, detail, status, timestamp}` dict to `state["audit_log"]`; persisted at `audit_logger.py:47-56` and **again** at `api/chat.py:126-135` without dedupe → duplicated rows on the success path. Exposed via `api/audit.py` and SSE `api/stream.py`. The committed DB has 388 rows, so it demonstrably works. |
| Bounded actions — spend cap | **Real** | `validators/spend_validators.py:31-58`, limit from DB (`chat.py:90`), enforced before payment. |
| Bounded actions — max transaction | **Real** | `spend_validators.py:21-25` (₹500,000 hard ceiling). |
| Bounded actions — idempotency | **Real** | `razorpay_tools.py:27-40, 66-79`. |
| Bounded actions — rate limit | **Real but flawed** | `groq_limiter.py`; blocks the event loop; instance exceeds documented tier. |
| Gated autonomy — human consent | **NOT REAL** | Bypassed same-turn by the checkout trigger word (`action_guard.py:23-35`). No `interrupt_before` on the payment node. |
| Stopping rule — retry ceiling | **NOT REAL** | `retry_count` reset per request (`state.py:198`); `>= 3` branch unreachable. |
| Stopping rule — session expiry | **Real** | `db/session_store.py`, background expiry job (`main.py:48`). |
| Escalation to human | **Absent** | No escalation path anywhere. `recovery_node.py:80-81` prints a support email address in unreachable code. |

## The Single Best Engineering Idea

**Ground every number the model emits against the system of record before it
reaches the user** — `validators/output_validators.py:19-93`. Regex the entities
out of the generated text, resolve each against the authoritative store, block
the response on any mismatch, and write the offending value to the audit log.
It is ten lines of real logic and it converts "the model said ₹45,000" from a
liability into a caught error. Worth reimplementing verbatim — minus the skip
list, and failing closed.

## The Weakest Thing (30 seconds)

A Razorpay engineer opens `agent/tools/razorpay_tools.py`, sees
`razorpay_client.order.create(...)` and no `payment.fetch` / signature
verification anywhere, opens the committed `razorpay_agent.db`, and finds all
five orders sitting at `status='pending'`. **Creating an Order is not taking a
payment** — and `payment_node.py:91` says "Payment successful! 🎉" while
`payment_node.py:62` decrements the user's spend cap against it. On a Razorpay
track, judged by Razorpay engineers, mistaking an order object for a settled
payment is the one error that cannot be talked around.

Second, ten seconds later: `backend/evals/` is empty.

## Overclaim Ledger

There is no README, so every entry below is a **docstring or commit message**
claim contradicted by the code in the same repository.

| # | Claim | Location of claim | What the code shows |
|---|---|---|---|
| 1 | "Runs 4 checks: Guardrails AI · Llama Prompt Guard 2 86M · compound-mini" | `agent/nodes/input_guard.py:14-18`, log at `:66` | Three pure-Python substring scans, zero models (`validators/input_validators.py:40-70`). `GROQ_MODEL_GUARD` never read. |
| 2 | "Payment successful! 🎉" / `payment_status = "success"` | `agent/nodes/payment_node.py:80-95` | Only a Razorpay **Order** was created (`razorpay_tools.py:82`). All 5 committed orders are `pending`. `verify_payment` (`:131`) never called. |
| 3 | "Layer 4 Guardrail — verifies explicit user consent before ANY money moves" | `agent/nodes/action_guard.py:12-13` | Same message that triggered `checkout` satisfies the consent keyword match; payment fires in one turn (`action_guard.py:19-35` + `intent_node.py:41`). |
| 4 | "recovery_node stops retrying after 3 attempts" | `agent/state.py:126-128`, `recovery_node.py:22-23` | `retry_count = 0` at `state.py:198`, re-initialised per request at `chat.py:87`. Branch unreachable. |
| 5 | "all 10 agent tests passing" / "all 28 backend files complete — health check 25/25 passing" | commits `28aa4e0`, `bd97d50` | Zero `assert` statements in `test_agent.py`, `rigorous_test.py`, `advanced_test.py`. No pass/fail computation exists. |
| 6 | "Price hallucination guard — prices must exist in DB" | `agent/nodes/output_guard.py:16-22` | 13-phrase skip list (`output_validators.py:38-50`) matches every priced response template in `catalog_node.py`/`checkout_node.py`. |
| 7 | `llm_mini` "Used by: ShoppingTopicGuard in input_validators.py" | `agent/llm.py:52` | No `ShoppingTopicGuard` anywhere in the repo. |
| 8 | "Max 5500 TPM (Groq free tier = 6000 — we stay under)" | `rate_limiter/groq_limiter.py:16-17` | Instance constructed with `tpm=13000` (`:115`). |
| 9 | Rate limiter "Thread-safe — works with FastAPI's concurrent requests" | `groq_limiter.py:19` | `time.sleep()` inside the held lock (`:44,62,78`), called from `ainvoke` (`llm.py:31`) — blocks the event loop and serialises all requests. |
| 10 | "Audit logger ... avoid duplicates on retry" | `agent/nodes/audit_logger.py:37-45` | `api/chat.py:126-135` writes the same entries again with no dedupe. |
| 11 | "Non-blocking — if DB write fails, conversation continues. **Session ownership verified before every write.**" | `agent/nodes/audit_logger.py:19-20` | No ownership verification in the function body (`:34-64`). |
| 12 | `.env.example` documents `GROQ_MODEL=compound`, `GROQ_MODEL_MINI=compound-mini`, `GROQ_MODEL_GUARD`, `DATABASE_URL` | `backend/.env.example:2-4,9` | Code defaults are `groq/compound` / `openai/gpt-oss-20b` (`llm.py:40-41`); `GROQ_MODEL_GUARD` and `DATABASE_URL` are never read anywhere. |
| 13 | `razorpay_tools` exported as a tool list for LangChain | `agent/tools/razorpay_tools.py:222-227` | Never bound to any model; `verify_payment` and `get_order_status` are dead code. |
| 14 | `.gitignore` excludes `*.db` and `node_modules/` | `.gitignore` | `backend/db/razorpay_agent.db` is tracked (with 20 live session tokens); 2,408 `frontend/node_modules` files are tracked. |

---

## Overall Scores

| Dimension | Score | Justification |
|---|---|---|
| Idea | **6/10** | Conversational checkout with a code-enforced spend cap and an audit trail is a legitimate, on-brief Track 01 problem — but it is the most obvious reading of the track, with no differentiating angle. |
| Solution | **3/10** | It demos solving the problem: the happy path returns templated text and creates an unpaid Order object that the system reports as a completed payment. |
| Architecture | **4/10** | Directory structure and node/edge separation are genuinely legible, which is worth something; the graph itself is a linear if/elif in LangGraph costume, cart state is a process-global dict, and the layer names do not describe the layers. |
| AI usage | **2/10** | Four LLM calls: two are trivially replaceable by the regex machinery already sitting next to them, one is nearly dead code, and only the recovery message is load-bearing — 457 lines of `re` and f-strings do the actual work, and no deliberate-non-use decision is documented. |
| Razorpay relevance | **5/10** | Correct track, correct vocabulary (spend cap, consent, audit, idempotency), and the idempotency key is real — but mistaking an Order for a payment is a domain error in front of the exact audience that will notice. |
| Engineering quality | **3/10** | Consistent try/except discipline and real session auth are credits; unpinned and partly uninstallable dependencies, a fail-open money check, a blocked event loop, duplicated audit rows, an unreachable stopping rule, no assertions anywhere, committed credentials and 2,408 committed `node_modules` files are the debits. |
| Demonstrability | **4/10** | The React dashboard (SpendMeter, AuditTrail, ConsentReceipt) would film well, and blocking an over-limit purchase is a real on-camera moment — but every demo needs live Groq + Razorpay keys and no reviewer can reproduce it from a clean clone. |

## Final AgentArch Verdict

**Verdict: `NOT_USEFUL` as a whole; salvage `P1` (output-grounding validator) and
`P2` (multi-check money validator) as components.** A well-organised skeleton
whose guardrail layers are named after protections it does not implement — the
consent gate is bypassed by its own trigger word, the retry ceiling is
unreachable, the price guard is disabled by its own skip list, the eval package
is empty, and the "successful payment" is an unpaid Razorpay Order that
nonetheless decrements the spend cap.
