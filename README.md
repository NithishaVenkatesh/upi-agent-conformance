# in.razorpay.upi — bounded agent payments for Indian merchants

An AI agent that verifies a merchant's payment terms against the RBI and NPCI circulars
that authorise them — and refuses, quoting the clause, when they don't match.

Four live Indian D2C brands serve agentic-checkout profiles today. **None accepts UPI**,
in a country that is 80%+ UPI:

```bash
curl -s https://zouk.co.in/.well-known/ucp | jq '.ucp.payment_handlers | keys'
# ["com.google.pay", "dev.shopify.card"]
```

```bash
make demo     # bounded purchase + two clause-cited refusals   (~2s, no network)
make verify   # ledger walked forward, backward, HEAD-anchored + self-conformance
```

**Architecture:** [`ARCHITECTURE.md`](ARCHITECTURE.md) — the money path, where the LLM is
and is not, failure modes, and what the audit ledger does *not* prove.

**What broke:** [`FAILURES.md`](FAILURES.md) — including the two times this project
committed the exact error it was built to catch.

Track 01 · Razorpay AI Buildathon. Money path is deterministic; the delegation layer is
stubbed and declared.
