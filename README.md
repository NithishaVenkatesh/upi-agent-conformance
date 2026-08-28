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

---

## Security & Operational Limits

**Ledger tamper detection:** The hash-chained ledger (`eval/ledger.jsonl`) detects accidental corruption and internal consistency violations. **Limitation:** An attacker with write access to BOTH the ledger file AND the HEAD marker (`eval/ledger.jsonl.head`) can rebuild the chain undetectably. For production deployment:
- Use an append-only storage service (Git, S3 with object lock, Cloud Firestore) instead of local JSONL
- Cryptographically sign entries with an offline key
- Document operational procedures to prevent concurrent writes (this server uses an in-process lock, not fcntl, so multi-process setups are unsafe)

**HTTP protocol:** The merchant server uses HTTP/1.1 with keep-alive enabled. On localhost, this is safe. For WAN deployment, consider:
- Switching to HTTP/2 (better multiplexing, simpler framing)
- Documenting that idempotency keys are per-connection (replays across connections are the caller's responsibility, per OC-228 Acquirer §3)

**CORS:** The merchant server (`merchant/server.py`) accepts POST requests only from localhost origins (`127.0.0.1` and `localhost`). This prevents CSRF attacks from arbitrary webpages. If deployed on a remote host, update the origin check to match your deployment domain.
