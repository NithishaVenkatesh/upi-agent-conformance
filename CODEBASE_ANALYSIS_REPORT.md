# COMPREHENSIVE CODEBASE ANALYSIS REPORT
## in.razorpay.upi — Bounded Agent Payments for Indian Merchants

**Project Date:** August 2026  
**Type:** Razorpay AI Buildathon - Payment Compliance System  
**Status:** Fully Implemented with 95+ Tests

---

## EXECUTIVE SUMMARY

This is a **payment processing and compliance system** for Indian merchants that:
1. **Validates merchant payment terms** against RBI/NPCI regulatory circulars
2. **Enforces payment bounds** via a deterministic authorization gate
3. **Maintains an immutable audit ledger** for all transactions
4. **Supports AI agent-based shopping** with product selection
5. **Provides compliance dashboard** with real-time visualization

The system is built with a **strict architectural principle**: *No rupee bound is enforced unless it traces to a clause in a checksummed document.*

The project splits into three major layers:
- **Backend (Python):** Payment processing, authorization gate, ledger, conformance engine
- **Frontend (Next.js/React):** Dashboard, ledger viewer, constraints explorer
- **Supporting Systems:** LLM extraction, test harness, evaluation framework

---

## PROJECT STRUCTURE

```
RazorPay/
├── agent/                 # AI buyer agent (LLM-based goal decomposition)
├── conform/               # Conformance engine (declared vs authoritative claims)
├── extract/               # LLM extraction from regulatory documents
├── gate/                  # Authorization gate + ledger system
├── merchant/              # HTTP server + UCP interface + checkout management
├── corpus/                # Regulatory documents + checksums + authoritative claims
├── frontend/              # Next.js dashboard UI
├── eval/                  # Evaluation harness, test runner, tamper detection
├── tests/                 # 95+ pytest test cases
├── research/              # Research on requirements and validation
└── tools/                 # Utilities (probe, test mode)
```

---

# BACKEND ARCHITECTURE

## 1. MERCHANT SERVER (`merchant/server.py`)

**Purpose:** HTTP interface for agentic payment processing

**Key Components:**

### Merchant Class
- **State Management:** Maintains checkouts, blocks (reservations), and block-to-checkout mappings
- **Payment Catalog:** Stores SKU definitions (products with prices in paise)
  ```
  sku1: Cotton tote - ₹2,499
  sku2: Canvas backpack - ₹3,899
  sku3: Laptop sleeve - ₹1,499
  ```

### HTTP Methods

**GET `/.well-known/ucp`**
- Returns UCP (Unified Commerce Profile) for the merchant
- Advertises payment capabilities via `merchant/ucp.py`
- Declares `mandate="single_block_multiple_debit"` (one block, multiple debits)

**GET `/`**
- Simple HTML page linking to UCP endpoint and MCP interface

**POST `/api/ucp/mcp`**
- JSON-RPC 2.0 endpoint for MCP (Model Context Protocol) tools
- CORS protection: Only accepts localhost origins (`127.0.0.1`, `localhost`)
- Prevents CSRF attacks from malicious webpages

### MCP Tool Interface

Five tools exposed to AI agents:

1. **`search_catalog`**
   - Input: `{"q": "search_query"}`
   - Output: List of products matching query
   - Used by agent to browse products

2. **`get_product`**
   - Input: `{"id": "sku1"}`
   - Output: Product details (name, price)
   - Validates product exists; fails loudly on hallucinated SKU

3. **`create_checkout`**
   - Input: `{"items": [{id, qty}], "currency": "INR", "block": {...optional}}`
   - Creates checkout session with line items
   - Allocates/retrieves block (payment reservation) for (customer, merchant) pair
   - Returns checkout ID and total amount in paise

4. **`update_checkout`**
   - Input: `{"checkout_id": "cs_xxx"}`
   - Returns current checkout status
   - Used for polling state

5. **`complete_checkout`**
   - Input: `{"checkout_id": "cs_xxx", "idem_key": "uuid"}`
   - **Critical:** Processes payment through the authorization gate
   - Returns success or refusal with clause citation
   - **Idempotency:** Same `idem_key` replays original response

---

### The `_complete()` Method - CRITICAL SECTION

This is the most complex method, where payment authorization happens:

```python
def _complete(self, args, now):
    # 1. Get checkout details
    c = self.store.get(args["checkout_id"])
    
    # 2. Get the block (reservation) for this checkout
    # Blocks are per (customer_id, merchant_id) not per checkout
    # "single_block_multiple_debit" means one block can be drawn multiple times
    block = self.block_for(c.id)
    
    # 3. CRITICAL SECTION START - Serialized with block._lock
    with block["_lock"]:
        # 4. REPLAY CHECK - Check for duplicate requests
        # Idempotency is RESOLVE BEFORE GATE (not after)
        # This prevents: agent gets 403 → retries → payment goes through twice
        if args["idem_key"] in block["used_idem_keys"]:
            ledger.append({"event": "replay", ...})
            return original_response  # No side effects
        
        # 5. RETRY DETECTION - Observe actual failures, not claimed
        # Never trust agent assertion of retry_of_timeout
        # Read from observed_failures dict: what the rail actually did
        prior = block["observed_failures"].get(args["idem_key"])
        
        # 6. BUILD REQUEST FOR GATE
        req = {
            "amount_minor": c.total_minor,
            "idem_key": args["idem_key"],
            "is_retry": prior is not None,
            "retry_of_timeout": bool(prior and prior["retryable"])
        }
        
        # 7. CALL GATE - Pure function, no side effects
        d = decide(req, block, "PASS", now)
        ledger.append({"event": "authorise", ...})
        
        # 8. GATE REFUSAL - Return with clause citation
        if not d.allowed:
            return {
                "_error": True,
                "code": d.code,
                "clause": d.clause,  # THIS is why agent can comply
                "circular": d.circular,
                "quote": d.quote,
                "detail": d.detail
            }
        
        # 9. CAPTURE PAYMENT - Call Razorpay API
        try:
            done = self.store.complete(c.id, args["idem_key"], capture=self.capture)
        except Exception as e:
            # Rail failure (timeout, network, etc)
            kind = "timeout" if "timeout" in str(e).lower() else type(e).__name__
            cls = classify_failure(kind)
            
            # Record this for retry decision
            block["observed_failures"][args["idem_key"]] = cls
            ledger.append({"event": "capture_failed", "retryable": cls["retryable"]})
            
            # Return error WITHOUT debiting block or burning idem_key
            # Next retry can attempt again
            return {"_error": True, "code": "capture_failed", ...}
        
        # 10. SUCCESS - Debit the block
        block["remaining_minor"] -= c.total_minor
        block["debits"] += 1
        block["used_idem_keys"].add(args["idem_key"])
        block["observed_failures"].pop(args["idem_key"], None)
        
        ledger.append({"event": "captured", "order_id": done.order_id})
        return {"id": done.id, "order_id": done.order_id, ...}
```

**Critical Design Decisions:**

1. **Block Locking:** `block["_lock"]` serializes all operations on a block
   - Two threads reading `remaining_minor` without lock → both pass → balance goes negative
   - This was the worst bug in the project (FINDINGS.md C1)

2. **Block Scoping:** Blocks are per `(customer_id, merchant_id)`, NOT per checkout
   - Implements "single_block_multiple_debit" (SBMD)
   - One customer can draw from one block multiple times within its limit
   - Enforces OC-228 Issuer §4: "one concurrent block per customer per merchant"

3. **Replay Before Gate:** Idempotency resolved before calling `decide()`
   - Correct: agent gets 403 → needs to retry → returns original response
   - Incorrect: agent gets 403 → gate already counted it → refuses retry
   - If gate refused replay, it would tell agent "payment failed" → agent retries → violates OC-228 §3

4. **Retry Facts Observed:** `observed_failures` dict records what the rail actually did
   - Agent CANNOT claim `retry_of_timeout=True`
   - Server reads from `block["observed_failures"][idem_key]`
   - Prevents agent from bypassing OC-228 §3 retry limits

5. **Capture Inside Lock:** Payment capture is serialized per block
   - Bounds throughput per block, not globally
   - Ensures no two debits race against the same `remaining_minor`

---

## 2. AUTHORIZATION GATE (`gate/decide.py`)

**Purpose:** Deterministic payment authorization against regulatory rules

**Key Properties:**
- Pure function: `decide(req, block, verdict, now_ts) → Decision`
- No LLM, no network, no clock reads (beyond `now_ts` parameter)
- Replayable from ledger
- Every refusal cites the NPCI clause that authorises it

**Decision Structure:**
```python
@dataclass(frozen=True)
class Decision:
    allowed: bool                    # True or False
    code: str                        # 'authorised', 'cap_exceeds_authority', etc
    clause: str                      # e.g. "NPCI/UPI/OC No.228 Issuer §5"
    quote: str                       # Exact text from circular
    circular: str                    # Document ID
    detail: str                      # Machine-readable reason
```

**Authorization Rules (from NPCI OC-228):**

| Rule | Source | Logic | Refusal Code |
|------|--------|-------|--------------|
| **Conformance Check** | OC-228 §5 | Declared constraints must PASS conformance | `counterparty_not_conformant` |
| **Cap ≤ ₹10,000** | OC-228 §5 | Block max cannot exceed ₹10,000 | `cap_exceeds_authority` |
| **Amount ≤ Remaining** | Integer Paise | Request cannot exceed block balance | `insufficient_block_balance` |
| **Validity ≤ 90 Days** | OC-228 §5 | Block created_ts to expires_ts ≤ 90 days | `validity_exceeds_authority` |
| **Block Expiry** | OC-228 §5 | now_ts must be ≤ block expires_ts | `block_expired` |
| **One Block Per Pair** | OC-228 §4 | Only one concurrent block per (customer, merchant) | `duplicate_block_for_merchant` |
| **Retry ≤ 3/24h** | OC-228 §3 | Max 3 retries in 24 hours | `retry_budget_exhausted` |
| **Retries for Timeouts Only** | OC-228 §3 | Retries only permitted if prior was timeout | `retry_not_permitted` |
| **Idempotency** | Standard | Key not already used | `idempotency_replay` |

**Implementation Details:**

```python
def decide(req, block, verdict, now_ts) -> Decision:
    # STEP 1: Conformance
    if verdict != "PASS":
        return Decision(False, "counterparty_not_conformant", ...)
    
    # STEP 2: Cap check (₹10,000 max)
    if block["max_minor"] > CLAIMED["OC228-5-block-max"]:
        return Decision(False, "cap_exceeds_authority", ...)
    
    # STEP 3: Amount check
    if req["amount_minor"] > block["remaining_minor"]:
        return Decision(False, "insufficient_block_balance", ...)
    
    # STEP 4: Validity duration (90 days)
    if block["created_ts"] + 90*86400 < block["expires_ts"]:
        return Decision(False, "validity_exceeds_authority", ...)
    
    # STEP 5: Block expiry
    if now_ts > block["expires_ts"]:
        return Decision(False, "block_expired", ...)
    
    # STEP 6: Only one concurrent block
    if block["concurrent_blocks_same_merchant"] > 0:
        return Decision(False, "duplicate_block_for_merchant", ...)
    
    # STEP 7: Retry rules
    if req["is_retry"]:
        if not req["retry_of_timeout"]:
            return Decision(False, "retry_not_permitted", ...)
        if block["retries_24h"] >= 3:
            return Decision(False, "retry_budget_exhausted", ...)
    
    # STEP 8: Idempotency
    if req["idem_key"] in block["used_idem_keys"]:
        return Decision(False, "idempotency_replay", ...)
    
    # ALL CHECKS PASS
    return Decision(True, "authorised", ...)
```

**Critical: Claim Store**

All clauses loaded from `corpus/claims/authoritative.json`:
```json
{
  "claims": [
    {
      "id": "OC228-5-block-max",
      "subject": "upi_reserve_pay_block_limit",
      "value_minor": 1000000,
      "scope": "per_block",
      "clause": "NPCI/UPI/OC No.228 Issuer §5",
      "quote": "The block created to be maximum of Rs.10,000...",
      "status": "RESOLVED"
    },
    ...
  ]
}
```

**Invariant:** Every check that refuses cites a claim. Checks with `clause=None` are rejected at import time by `eval/self_conformance.py`.

---

## 3. HASH-CHAINED AUDIT LEDGER (`gate/ledger.py`)

**Purpose:** Immutable, tamper-detectable record of all payment events

**Design:**
- Append-only JSON-lines file: `eval/ledger.jsonl`
- Each entry: `{seq, prev_hash, payload, hash}`
- Genesis anchor: SHA-256 of regulatory corpus
- HEAD marker: `eval/ledger.jsonl.head` commits to length + tip

**Hash Chain Formula:**
```
hash[i] = SHA-256(prev_hash[i-1] ‖ canonical_json(payload[i]))
genesis = SHA-256(corpus/claims/authoritative.json)
```

**Entry Structure:**
```python
{
  "seq": 0,
  "prev_hash": "corpus_sha256",
  "payload": {
    "event": "authorise" | "captured" | "capture_failed" | "replay",
    "checkout": "cs_xxx",
    "decision": "authorised",
    "clause": "NPCI/UPI/OC No.228 Issuer §5",
    "order_id": "order_xxx"
  },
  "hash": "sha256_of_prev_hash+payload"
}
```

**Verification (Bidirectional):**

Forward Walk (Replay):
```python
for i, entry in enumerate(ledger):
    expected_hash = SHA-256(entry["prev_hash"] + canonical_json(entry["payload"]))
    if expected_hash != entry["hash"]:
        return False, f"hash mismatch at seq {i}"
```

Backward Walk (Chain Integrity):
```python
for i in range(len(ledger)-1, 0, -1):
    if ledger[i]["prev_hash"] != ledger[i-1]["hash"]:
        return False, f"chain break between seq {i-1} and {i}"
```

HEAD Verification (Truncation Detection):
```python
head = load(ledger.jsonl.head)
if head["count"] != len(ledger):
    return False, f"truncated: HEAD commits to {head['count']} entries, found {len(ledger)}"
if head["head"] != ledger[-1]["hash"]:
    return False, "tip mismatch"
```

**Three States:**
```python
EMPTY    # No ledger, no HEAD — nothing walked yet (legitimate)
VERIFIED # Ledger consistent forward, backward, HEAD-anchored
BROKEN   # Inconsistency detected (attack or corruption)
```

**Tamper Detection Capabilities (all 5 tested):**
1. ✓ Edit payload in place → forward hash mismatch
2. ✓ Truncate tail → HEAD commits to more entries
3. ✓ Delete entire log → HEAD exists but log is empty
4. ✓ Re-forge whole chain → tip mismatch with HEAD
5. ✓ Truncate head → genesis anchor mismatch

**Known Limitation:**
- An attacker with write access to BOTH log AND HEAD can re-forge undetectably
- **Not** an attack vector in production deployments using append-only stores (Git, S3 with object lock)
- Hash chain proves **internal consistency**, not **authenticity**
- Would need external timestamping or cryptographic signing to close

**Thread Safety:**
```python
self._lock = threading.Lock()

def append(self, payload: dict) -> dict:
    with self._lock:
        entries = self._entries()
        prev = entries[-1]["hash"] if entries else genesis()
        entry = {...}
        write_entry_to_file()
        write_HEAD()
```

- Without lock: two threads read same tail → both emit seq=N → backward walk breaks permanently
- In-process lock is sufficient for ThreadingHTTPServer (deployed config)
- Multi-process setups need fcntl.flock() on the log file

---

## 4. CONFORMANCE ENGINE (`conform/engine.py`)

**Purpose:** Compare DECLARED constraints (from merchant docs) against AUTHORITATIVE claims (from regulatory circulars)

**Key Insight:** Extraction produces "declared" claims; conformance produces verdicts; the gate enforces verdicts

**Data Structures:**

```python
@dataclass(frozen=True)
class Declared:
    subject: str
    value: Union[int, bool, None]
    unit: str
    scope: str
    source: str
    confidence: float

@dataclass(frozen=True)
class Authoritative:
    subject: str
    value: Union[int, bool]
    unit: str
    scope: str
    circular: str
    clause: str
    quote: str
```

**Verdict (Three Outcomes):**

| Verdict | Meaning | Examples |
|---------|---------|----------|
| **PASS** | Declared ≤ Authoritative, all dimensions match | Declared ₹8,000 per-block vs Auth ₹10,000 per-block |
| **FAIL** | Declared contradicts Authoritative | Declared ₹15,000 vs Auth ₹10,000 |
| **UNDETERMINED** | Cannot decide (ambiguous, missing authority, low confidence) | Confidence 0.45 < 0.6 floor |

**Comparison Logic:**

1. **Confidence Floor:** If confidence < 0.6, return UNDETERMINED
   - Prevents low-confidence extractions from making authorization decisions

2. **Subject Match:** Find authorities for declared subject
   - No authority → UNDETERMINED

3. **Unit Match:** Find authorities with matching unit
   - Unit mismatch → UNDETERMINED (not comparable)

4. **Predicate Claims:** Boolean "Guaranteed Collection" type
   - Exact value match required → PASS
   - Mismatch → FAIL

5. **Omission Detection:** Drift #2
   - No bound declared but circular sets one → FAIL
   - Example: Merchant says "unlimited" but OC-228 §5 says max ₹10,000

6. **Scope Match:** Most critical dimension
   - "per_block" ≠ "per_transaction" (drifts #1, #3)
   - Aliases handled: "per_month" == "monthly"
   - Scope mismatch → FAIL

7. **Scope Mismatch Detection (Drift #4):** SEP #216 error
   - Declared ₹15,000 per-transaction vs Authority ₹15,000 per-month
   - Recognized by checking if value appears under DIFFERENT scope
   - Flagged as "scope_mismatch" not "value_exceeds_authority"

8. **Value Comparison:** Integer paise comparison
   - Declared > Authoritative → FAIL ("value_exceeds_authority")
   - Declared ≤ Authoritative → PASS ("conformant")

---

## 5. LLM EXTRACTION (`extract/llm.py`)

**Purpose:** Convert regulatory document text (scanned PDFs) into structured constraint claims

**Critical Architecture Rule:** The ONLY LLM in the constraint path

**Why LLM Here?**
- Naive regex reads "maximum monthly limit of ₹15,000 per transaction" and returns ₹15,000 per-transaction (SEP #216 error)
- LLM must jointly resolve value + unit + scope + meaning
- Once structured, comparison is integer + enum (decidable, no LLM needed)

**Three Hard Rules (Enforced, Not Trusted):**

1. **Schema Validation:** Output must conform to schema
   ```python
   if not all(field in claim for field in REQUIRED):
       continue
   ```

2. **Hallucination Prevention:** Every quote must appear verbatim in source
   ```python
   if _normalise_quote(claim["quote"]) not in _normalise_quote(text):
       continue
   ```

3. **Origin Tagging:** Output tagged `origin="declared"`, never authority
   ```python
   output["origin"] = "declared"
   ```

**Implementation:**

```python
def extract_claims(text: str, llm=None) -> List[dict]:
    raw = llm.complete(SYSTEM, text)
    parsed = json.loads(raw)
    
    hay = _normalise_quote(text)
    out = []
    
    for c in parsed:
        # RULE 1: Schema validation
        if not all(f in c for f in REQUIRED):
            continue
        
        if c["unit"] not in VALID_UNITS:
            continue
        
        # RULE 2: Hallucination check
        if _normalise_quote(str(c["quote"])) not in hay:
            continue
        
        # RULE 3: Confidence parsing
        try:
            conf = float(c["confidence"])
        except (TypeError, ValueError):
            continue
        
        if conf != conf or not (0.0 <= conf <= 1.0):
            continue
        
        status = "RESOLVED" if conf >= 0.6 else "UNDETERMINED"
        
        out.append({
            **{k: c[k] for k in REQUIRED},
            "status": status,
            "origin": "declared",
            "extractor": "azure-openai"
        })
    
    return out
```

**Confidence Floor:** 0.6
- Below this → status="UNDETERMINED"
- UNDETERMINED claims cannot be used to authorize

**Implementations:**

1. **FakeLLM:** Returns deterministic payload (for testing)
2. **AzureOpenAILLM:** Real Azure OpenAI API

---

## 6. BUYER AGENT (`agent/buyer.py`)

**Purpose:** Goal decomposition and product selection for shopping

**Key Property:** OFF THE MONEY PATH
- If buyer agent hallucinates, worst case: wrong product selected
- Gate then bounds the debit
- Agent can NEVER reach gate, ledger, or payment processing logic

**Architecture:** Agent speaks to merchant ONLY through MCP tools

**Buyer Agent Flow:**

```python
class BuyerAgent:
    def buy(self, goal: str, idem_key: str) -> dict:
        products = self.m.call("search_catalog", {"q": ""})["products"]
        ids = self.planner.choose(goal, products)
        
        if not ids:
            return {"refused": True, "code": "no_product_selected"}
        
        for i in ids:
            self.m.call("get_product", {"id": i})
        
        c = self.m.call("create_checkout",
                        {"items": [{"id": i, "qty": 1} for i in ids],
                         "currency": "INR"})
        
        r = self.m.call("complete_checkout",
                        {"checkout_id": c["id"], "idem_key": idem_key})
        
        if r.get("_error"):
            return {"refused": True, "code": r["code"], "clause": r["clause"]}
        
        return {"refused": False, **r}
```

---

## 7. CHECKOUT MANAGEMENT (`merchant/checkout.py`)

**Purpose:** In-memory checkout session store

**Catalog:**
```python
CATALOG = {
    "sku1": {"name": "Cotton tote", "price_minor": 249900},
    "sku2": {"name": "Canvas backpack", "price_minor": 389900},
    "sku3": {"name": "Laptop sleeve", "price_minor": 149900}
}
```

**CheckoutStore:**
- `create()` — Calculate total, generate ID, store
- `get()` — Retrieve checkout by ID
- `complete()` — Capture payment, record idem_key, update status

---

# FRONTEND ARCHITECTURE

## Technology Stack

- **Framework:** Next.js 15 (React)
- **Language:** TypeScript
- **Testing:** Vitest
- **Styling:** Tailwind CSS

---

## Frontend Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Dashboard
│   ├── ledger/page.tsx         # Audit ledger
│   ├── constraints/page.tsx    # Conformance details
│   └── demo-mode/page.tsx      # Demo reset
├── lib/
│   ├── api-client.ts           # MCP wrapper
│   ├── types.ts                # TypeScript types
│   └── constants.ts            # Constants
└── __tests__/                  # Tests
```

---

## Key Frontend Components

### 1. Dashboard (`app/page.tsx`)

**Display:**
- Payment Terms Compliance status
- Transaction metrics (Total, Passed, Refused, Undetermined)
- Recent transaction table
- Quick action buttons

**Components:**
- `MetricCard` — Status count with color coding
- `TransactionRow` — Individual transaction display
- Loading skeletons for async data

---

### 2. Audit Ledger (`app/ledger/page.tsx`)

**Display:**
- Ledger entry list with timestamps
- Hash chain visualization
- Forward/backward verification status
- Collapsible JSON payload details
- Integrity verification summary

---

### 3. Constraints Viewer (`app/constraints/page.tsx`)

**Display:**
- Declared vs authoritative bounds comparison
- Conformance verdict (PASS/FAIL/UNDETERMINED)
- Source documents with clause citations
- Quota usage visualization

---

### 4. Demo Mode (`app/demo-mode/page.tsx`)

**Scenarios:**
- Authorised purchase
- Cap exceeds authority refusal
- Retry not permitted refusal
- Demo data reset

---

## API Client (`frontend/lib/api-client.ts`)

**Methods:**

| Tool | Input | Output |
|------|-------|--------|
| `listTools()` | — | `[{name, description}]` |
| `searchCatalog(q)` | String | `[{id, name, price_minor}]` |
| `getProduct(id)` | ID | `{id, name, price_minor}` |
| `createCheckout(items, currency)` | Items array | `{id, total_minor, status}` |
| `updateCheckout(id)` | Checkout ID | `{id, status, total_minor}` |
| `completeCheckout(id, key)` | ID + key | `{success, error?, orderId?}` |

---

## Types (`frontend/lib/types.ts`)

```typescript
interface Checkout {
  id: string;
  items: Array<{id: string; qty: number}>;
  currency: string;
  total_minor: number;
  status: "ready_for_payment" | "completed";
  order_id?: string;
}

interface Transaction {
  id: number;
  timestamp: string;
  amount: string;
  merchant: string;
  customer: string;
  status: "ALLOWED" | "REFUSED" | "UNDETERMINED";
}

interface LedgerEntry {
  seq: number;
  timestamp: number;
  event: string;
  hash: string;
  prev_hash: string;
  payload: Record<string, unknown>;
  verified: boolean;
}
```

---

# PAYMENT FLOW (COMPLETE)

```
┌─────────────────┐
│   AI Agent      │
└────────┬────────┘
         │ (MCP tools)
         ▼
┌──────────────────────────────────────┐
│ Merchant Server                      │
│  - search_catalog()                  │
│  - get_product()                     │
│  - create_checkout()                 │
│  - complete_checkout()               │
└────────┬─────────────────────────────┘
         │
         ▼ (CRITICAL SECTION)
    ┌──────────────────────┐
    │ Block._lock (mutex)  │
    └──────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ AUTHORIZATION GATE                   │
│ decide(req, block, verdict)          │
│                                      │
│ Checks:                              │
│ - Conformance verdict == PASS        │
│ - cap ≤ ₹10,000                      │
│ - amount ≤ remaining                 │
│ - validity ≤ 90 days                 │
│ - block not expired                  │
│ - one block per (customer, mrch)     │
│ - retry ≤ 3/24h, timeouts only      │
│ - idem_key not used                  │
└────────┬──────────────────────────────┘
         │
         ├─ ALLOWED → Capture Payment → Razorpay API
         │                ├─ SUCCESS: Debit block
         │                │           Record in ledger
         │                │           Return 200
         │                └─ FAIL: Return error
         │                         Record retryability
         │
         └─ REFUSED → Record clause → Ledger
                      Return 403
```

**Ledger Events:**
```
authorise       → {event, checkout, decision, clause}
captured        → {event, checkout, order_id}
capture_failed  → {event, checkout, kind, retryable}
replay          → {event, checkout, idem_key}
```

---

# TESTING & VERIFICATION

## Test Suite

**95+ Tests Covering:**

| Category | Count |
|----------|-------|
| Merchant | ~15 |
| Gate | ~20 |
| Ledger | ~15 |
| Conformance | ~20 |
| Extract/LLM | ~10 |
| E2E | ~15 |

**Coverage:** 85%+

## Test Categories

### `test_razorpay.py`
- Razorpay client integration
- Order creation
- Error handling

### `test_gate.py`
- Cap enforcement (₹10,000 max)
- Retry limits (≤3/24h, timeouts only)
- Block expiry
- Idempotency
- One concurrent block per (customer, merchant)

### `test_ledger.py`
- Forward hash chain
- Backward chain integrity
- HEAD marker validation
- Genesis anchor
- 5 tamper attack scenarios

### `test_conform.py`
- Subject matching
- Unit matching
- Scope matching
- Drift detection (#1-5)
- SEP #216 error detection

### `test_extract_llm.py`
- Schema validation
- Hallucination prevention
- Confidence thresholding
- Quote verification
- Confidence floor (0.6)

## Tamper Detection (5 Attacks)

```
✓ Edit payload → forward hash mismatch
✓ Truncate tail → HEAD commits to more entries
✓ Delete entire log → HEAD exists but log is empty
✓ Re-forge chain → tip mismatch with HEAD
✓ Truncate HEAD → genesis anchor mismatch
```

---

# CRITICAL FAILURES FIXED

## Failure #1: Guaranteed Collection Contradiction
- **What:** Razorpay docs claim guaranteed; NPCI circular says opposite
- **Drift:** Predicate mismatch (true vs false)
- **Fix:** Conform engine with UNDETERMINED handling

## Failure #2: Ledger Truncation Vulnerability
- **What:** Deleting log without HEAD reads as verified
- **Fix:** Genesis anchor + HEAD commitment + EMPTY vs BROKEN distinction

## Failure #3: Vacuous Self-Conformance
- **What:** Self-test passes on broken gate
- **Fix:** CI checks against known-bad fixtures first

## Failure #4: Semantic Drift (SEP #216)
- **What:** "₹15,000/txn" labeled "₹15,000/month" = error
- **Why LLM:** Regex cannot separate value from unit from scope
- **Fix:** LLM extracts value + unit + scope jointly

## Failure #5: Concurrent Block Writes
- **What:** Two threads read same balance → both pass → negative
- **Fix:** RLock serializes read-decide-debit sequence

---

# CONFIGURATION & ENVIRONMENT

## .env Variables

```bash
# Razorpay (Optional)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

# Azure OpenAI (Optional)
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
AZURE_OPENAI_API_KEY=xxx
AZURE_OPENAI_DEPLOYMENT=xxx
AZURE_OPENAI_API_VERSION=2024-10-21
```

## Deployed Configuration

**Merchant Server:**
- Port: 8080
- Host: 127.0.0.1 (localhost)
- Protocol: HTTP/1.1 with keep-alive
- ThreadingHTTPServer (concurrent)

**Frontend:**
- Port: 3000
- API_BASE_URL: http://127.0.0.1:8080
- API_TIMEOUT_MS: 5000

**Ledger:**
- Location: eval/ledger.jsonl
- HEAD: eval/ledger.jsonl.head
- Locking: In-process (sufficient for ThreadingHTTPServer)

---

# SYSTEM CAPABILITIES & LIMITS

## What Works

✓ Bounded payment authorization (₹10,000 max)  
✓ Conformance checking (declared vs authoritative)  
✓ Deterministic gate (replayable from ledger)  
✓ Tamper detection (all 5 attacks caught)  
✓ Retry policy enforcement (3/24h, timeouts only)  
✓ Idempotency (replay-safe)  
✓ Single_block_multiple_debit (SBMD)  
✓ Regulatory claim store (checksummed corpus)  
✓ LLM extraction (Azure OpenAI)  
✓ AI agent integration (goal decomposition)  
✓ 95+ tests (85% coverage)  
✓ Live merchant verification (4 merchants tested)  

## Known Limits

- **Reserve Pay in test mode:** Unverified (TSP no public API)
- **Extraction at scale:** Tested on 7 claims only
- **Ledger authenticity:** Hash proves consistency, not authenticity
- **Multi-process safety:** Needs fcntl.flock() for multi-process
- **Razorpay Subscriptions:** Not available on test account
- **UNDETERMINED rates:** Potentially high on poor scans

---

# KEY DESIGN PRINCIPLES

1. **No Rupee Bound Without Citation**
   - Every authorization traces to a clause in a checksummed document

2. **Fail Closed**
   - Unavailable authority → refuse
   - Better to miss a sale than unbounded debit

3. **Where the LLM Is, Is Not**
   - **LLM:** Extraction, buyer agent
   - **Not LLM:** Conformance, gate, ledger, idempotency

4. **Serialized Blocks, Not Checkouts**
   - Blocks per (customer, merchant)
   - Multiple checkouts draw from one block (SBMD)
   - RLock prevents race conditions

5. **Replay Before Gate**
   - Idempotency resolved first
   - Prevents agent "denied" twice

6. **Observed Retry Facts**
   - Agent cannot claim retry_of_timeout
   - Server reads from observed_failures
   - Prevents agent bypass of retry limits

7. **Deterministic Gate**
   - Pure function, replayable
   - Every decision recorded with clause
   - Can replay months later

8. **Bidirectional Ledger Verification**
   - Forward: recompute each hash
   - Backward: verify chain links
   - HEAD: length + tip commitment

---

# SUMMARY

This is a **compliance-first payment system** that:

1. **Validates** merchant terms against regulatory circulars
2. **Enforces** payment bounds deterministically via a gate
3. **Records** every transaction in an immutable audit ledger
4. **Enables** AI agents to make purchases while bounded
5. **Provides** a dashboard for monitoring and audit

The architecture enforces: *No rupee moves unless it traces to a clause in a checksummed document.*

The system has caught 5 real drifts, implemented 95+ tests, and achieved 85% code coverage. It demonstrates how to build payment systems that are auditable, deterministic, and grounded in regulatory requirements.
