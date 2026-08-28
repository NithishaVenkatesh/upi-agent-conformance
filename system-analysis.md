# System Analysis Summary

## Core Architecture
- **Extract** (LLM): Document → Constraints (NPCI/RBI circular interpretation)
- **Conform** (Logic): Declared terms vs Extracted constraints → PASS/FAIL/UNDETERMINED
- **Gate** (Logic): Deterministic enforcement, audit ledger, regulatory citations
- **Merchant**: UCP payment handler + MCP tools
- **Agent**: LLM-based buyer (off money path)

## Key Values to Communicate
1. **AI Understanding** - System reads and interprets regulatory documents
2. **Deterministic Enforcement** - Rule-based gate with zero ambiguity
3. **Transparency** - Every decision cites the exact regulatory clause
4. **Regulatory Compliance** - NPCI/RBI compliance is built-in
5. **Audit Trail** - Complete, tamper-detected ledger

## Current Workflow (from demo)
1. Agent searches catalog
2. Agent creates checkout with payment block (cap + validity)
3. System extracts constraints from authority documents
4. System checks conformance (declared vs authoritative)
5. Gate decides: PASS → payment, or REFUSED with clause citation
6. Payment captured and logged
7. Evidence and audit trail available

## Backend State Available
- Checkout (items, total)
- Payment Block (max amount, expiry, customer/merchant)
- Constraints (extracted from documents)
- Conformance (verdict + why)
- Gate Decision (PASS/REFUSED with citation)
- Ledger (immutable transaction history)
- Retry tracking (observed failures, 24h count)

## Critical Design Considerations
- **Fail-closed behavior** is a feature, not a bug
- System refuses ambiguity (UNDETERMINED counts as refusal)
- Regulatory clauses are evidence, not policy
- Money path is deterministic; AI is only in extraction + goal decomposition
- Concurrency safety matters (block-level locking)
- Idempotency must be visible to user
