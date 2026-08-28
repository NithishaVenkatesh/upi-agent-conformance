# Backend API Contracts & Data Models

## Core Data Models

### Checkout
```
{
  id: "cs_" + hex(12),
  items: [{id: "sku1", qty: 1}],
  currency: "INR",
  total_minor: 249900,  // in paise (₹ * 100)
  status: "ready_for_payment" | "completed",
  order_id: "order_test_..." | "order_rzp_..."
}
```

### Payment Block (Reservation)
```
{
  max_minor: 1000000,        // max ₹10,000 per OC-228 §5
  remaining_minor: 1000000,  // decreases per successful payment
  created_ts: unix_ts,
  expires_ts: unix_ts,       // max 90 days from created per OC-228 §5
  merchant_id: "demo",
  customer_id: "cust_demo",
  retries_24h: 0,            // counter ≤3 per OC-228 §3
  used_idem_keys: set(),     // for idempotency
  observed_failures: {},     // {idem_key → {retryable, clause, ...}}
  debits: 0,                 // counter of successful charges
  concurrent_blocks_same_merchant: 0,  // must = 0 per OC-228 §4
  _lock: RLock()             // serialization for this block
}
```

### Extracted Constraint (from LLM)
```
{
  subject: "upi_reserve_pay_block_limit",
  value: 1000000,           // int or bool or None
  unit: "INR_paise" | "days" | "count_per_24h" | "predicate",
  scope: "per_block" | "per_transaction" | "per_month" | "per_customer_per_merchant",
  source: "document_id",
  confidence: 0.95          // 1.0 for known, <0.6 → UNDETERMINED
}
```

### Authoritative Claim (from corpus)
```
{
  id: "OC228-5-block-max",
  doc_sha256: "...",
  circular: "NPCI/UPI/OC No.228",
  clause: "Issuer §5",
  value: 1000000,
  value_minor: 1000000,
  unit: "INR_paise",
  scope: "per_block",
  subject: "upi_reserve_pay_block_limit",
  status: "RESOLVED",
  quote: "The block created to be maximum of Rs.10,000..."
}
```

### Conformance Verdict
```
result: "PASS" | "FAIL" | "UNDETERMINED",
code: "conformant" | "value_exceeds_authority" | "scope_mismatch" | ...,
detail: "human explanation",
circular: "NPCI/UPI/OC No.228",
clause: "Issuer §5",
quote: "verbatim from circular",
source: "where declared came from"
```

### Gate Decision (Payment Authorization)
```
allowed: bool,
code: "authorised" | "cap_exceeds_authority" | "insufficient_block_balance" |
      "validity_exceeds_authority" | "block_expired" | "duplicate_block_for_merchant" |
      "retry_not_permitted" | "retry_budget_exhausted" | "idempotency_replay" |
      "counterparty_not_conformant",
clause: "Issuer §5",
quote: "verbatim from circular",
circular: "NPCI/UPI/OC No.228",
detail: "₹25,000 > authorised ₹10,000"
```

### Ledger Entry
```
{
  seq: 0,
  prev_hash: "genesis|previous_hash",
  payload: {
    event: "authorise" | "captured" | "capture_failed" | "replay",
    checkout: "cs_...",
    decision: "authorised" | "cap_exceeds_authority" | ...,
    clause: "Issuer §5",
    circular: "NPCI/UPI/OC No.228",
    is_retry: bool,
    idem_key: "...",
    order_id: "...",
    kind: "timeout" | "SocketError" | ...
  },
  hash: "sha256(prev_hash + canonical_json(payload))"
}
```

## MCP Tool Contract

### tools/list
Returns list of available tools with schemas

### search_catalog(q: string)
Returns: `{products: [{id, name, price_minor}, ...]}`

### get_product(id: string)
Returns: `{id, name, price_minor}`

### create_checkout(items: array, currency: string, block?: object)
- items: [{id: "sku1", qty: 1}]
- currency: "INR"
- block: {max_minor?, expires_ts?, merchant_id?, customer_id?}
Returns: `{id: "cs_...", status, total_minor, currency}`

### update_checkout(checkout_id: string)
Returns: `{id, status, total_minor}`

### complete_checkout(checkout_id: string, idem_key: string)
Returns on SUCCESS:
```
{
  id: "cs_...",
  status: "completed",
  order_id: "order_rzp_...",
  capture_mode: "live-test-mode" | "STUBBED..."
}
```

Returns on REFUSAL (gate decision):
```
{
  _error: true,
  code: "cap_exceeds_authority",
  clause: "Issuer §5",
  circular: "NPCI/UPI/OC No.228",
  quote: "verbatim from circular",
  detail: "declared ₹25,000 > authorised ₹10,000"
}
```

Returns on CAPTURE FAILURE:
```
{
  _error: true,
  code: "capture_failed",
  retryable: true | false,
  clause: "retry_not_permitted",
  circular: "NPCI/UPI/OC No.228",
  quote: "...",
  detail: "payment rail failed: timeout"
}
```

## Important State Transitions & Scenarios

### Happy Path (PASS)
1. create_checkout() → cs_123
2. complete_checkout(cs_123, idem_key_A) → order_id + ALLOWED
3. ledger records DECISION + CAPTURED

### Refusal at Gate (REFUSED)
1. create_checkout(block={max_minor: 2500000}) → cs_124  // ₹25,000
2. complete_checkout(cs_124, idem_key_B) → {_error: true, code: "cap_exceeds_authority", ...}
3. ledger records DECISION + REFUSED (with clause)

### Retry Flow (OC-228 §3)
1. complete_checkout(cs_125, idem_key_C) → capture_failed + {retryable: true}
2. system records observed_failure[idem_key_C] = {retryable: true}
3. complete_checkout(cs_125, idem_key_C) → SECOND ATTEMPT → ledger knows it's a retry
4. If timeout: allowed. If not timeout: REFUSED "retry_not_permitted"

### Idempotency
1. complete_checkout(cs_126, idem_key_D) → order_id_X + ALLOWED
2. complete_checkout(cs_126, idem_key_D) → order_id_X + {replayed: true}  // Same response, no side effects

### Block Expiry
1. create_checkout(block={expires_ts: now_ts}) → cs_127
2. wait until now > expires_ts
3. complete_checkout(cs_127, idem_key_E) → REFUSED "block_expired" + clause

## UCP Discovery Endpoint

GET /.well-known/ucp returns:
```
{
  ucp: {
    version: "2026-04-08",
    services: {
      "dev.ucp.shopping": [{
        version: "2026-04-08",
        transport: "mcp",
        endpoint: "http://127.0.0.1:8080/api/ucp/mcp",
        spec: "..."
      }]
    },
    capabilities: {
      "dev.ucp.shopping.checkout": [...],
      "dev.ucp.shopping.cart": [...],
      "dev.ucp.shopping.catalog.search": [...]
    },
    payment_handlers: {
      "in.razorpay.upi": [{
        id: "razorpay.upi",
        version: "2026-04-08",
        spec: "...",
        config: {
          environment: "test",
          payment_methods: [
            {type: "upi", flows: ["intent", "collect", "qr"]},
            {type: "upi_reserve_pay", mandate: "single_block_multiple_debit"}
          ],
          declared_constraints: [
            {subject: "upi_reserve_pay_block_limit", value: 1000000, unit: "INR_paise", ...},
            {subject: "upi_reserve_pay_block_validity", value: 90, unit: "days", ...},
            {subject: "block_is_payment_guarantee", value: false, unit: "predicate", ...}
          ],
          delegation_layer: "STUBBED — Razorpay TSP has no public API"
        }
      }]
    }
  }
}
```

## Ledger Verification Contract

### Forward Walk
- Each entry hash = SHA256(prev_hash ‖ canonical_json(payload))
- Stops at first hash mismatch

### Backward Walk
- START from HEAD (commitsto count + tip hash)
- Walk from last entry back to genesis
- Verifies count matches number of entries

### Tamper Detection
- Catches: edited payload, truncated tail, truncated head, re-forged chain, deleted log
- Does NOT catch: attacker with write access to BOTH log AND HEAD
- Anchored to: genesis = SHA256(corpus/claims/authoritative.json)
