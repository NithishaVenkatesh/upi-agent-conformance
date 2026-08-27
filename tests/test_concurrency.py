"""Concurrency tests for the money path and its audit trail.

WHY THIS FILE EXISTS. Every other test in this suite is single-threaded, while
merchant/server.py deploys a ThreadingHTTPServer. That gap is structural, not an
oversight in any one test: two legitimate concurrent agents were enough to
(a) corrupt the hash chain permanently and (b) overdraw a block past the bound the
gate exists to enforce. FINDINGS.md C1 and C2.

Both bugs were check-then-act across a thread boundary. Both are reproduced here
BEFORE the lock, so the tests fail without it.
"""
import json, threading, urllib.request
import pytest

from gate.ledger import Ledger
from merchant.server import Merchant, make_server


# --------------------------------------------------------------- C1: the ledger

def test_concurrent_appends_keep_the_chain_verifiable(tmp_path):
    """FINDINGS.md C1. Unlocked append() is read-modify-write: two threads read the
    same tail, compute the same prev_hash, and both write seq=N. The backward walk
    then breaks forever — and the break is INDISTINGUISHABLE from the tamper attack
    eval/tamper.py is proud of catching."""
    led = Ledger(path=str(tmp_path / "l.jsonl"))
    N = 24
    barrier = threading.Barrier(N)

    def w(i):
        barrier.wait()                      # maximise overlap
        led.append({"event": "authorise", "n": i})

    ts = [threading.Thread(target=w, args=(i,)) for i in range(N)]
    [t.start() for t in ts]
    [t.join() for t in ts]

    ok, msg = led.verify()
    assert ok, f"concurrent appends corrupted the chain: {msg}"


def test_concurrent_appends_lose_no_entries(tmp_path):
    """A lock that serialised by dropping writes would pass the test above."""
    led = Ledger(path=str(tmp_path / "l.jsonl"))
    N = 24
    barrier = threading.Barrier(N)

    def w(i):
        barrier.wait()
        led.append({"n": i})

    ts = [threading.Thread(target=w, args=(i,)) for i in range(N)]
    [t.start() for t in ts]
    [t.join() for t in ts]

    es = [json.loads(l) for l in open(led.path) if l.strip()]
    assert len(es) == N, f"expected {N} entries, found {len(es)}"
    assert [e["seq"] for e in es] == list(range(N)), "seq numbers collided or skipped"
    assert {e["payload"]["n"] for e in es} == set(range(N)), "an append was lost"
    assert json.load(open(led.head_path))["count"] == N, "HEAD count disagrees with the log"


# ---------------------------------------------------- C2: the block balance

def _merchant_with_shared_block(tmp_path, remaining_minor):
    """One block drawn on by several checkouts.

    This helper used to ALIAS the blocks together by hand, because the server gave
    every checkout its own. That aliasing is what made me report C2 as a live
    critical when it was not reachable — a condition I introduced, then read as a
    property of the system. Since M5 the server shares blocks per (customer,
    merchant) natively, so the helper no longer fabricates the premise: it just
    opens checkouts and sets the balance."""
    m = Merchant("demo.example")
    m.ledger = Ledger(path=str(tmp_path / "l.jsonl"))
    m.capture = lambda checkout, idem_key=None: f"order_{checkout.id}"
    m.capture_mode = "fake (concurrency test)"
    ids = [m.call("create_checkout", {"items": [{"id": "sku1", "qty": 1}],
                                      "currency": "INR"})["id"] for _ in range(8)]
    shared = m.block_for(ids[0])
    assert all(m.block_for(i) is shared for i in ids), "server did not share the block"
    shared["remaining_minor"] = remaining_minor
    return m, ids, shared


def test_concurrent_completes_cannot_overdraw_the_block(tmp_path):
    """FINDINGS.md C2 + M5. decide() checks amount <= remaining; server.py decrements
    later. Eight concurrent completes against a block with room for two all passed,
    and remaining went to -Rs.9,996, while the ledger recorded every one as
    'authorised, clause: Issuer S5' — the clause cited while it is violated.

    I originally reported this as live and it was not: blocks were per-checkout, so
    the completions never contended. It IS live now that M5 shares them, which is
    what SBMD requires. The lock went in first, deliberately."""
    tote = 249900
    m, ids, shared = _merchant_with_shared_block(tmp_path, remaining_minor=tote * 2)
    barrier = threading.Barrier(len(ids))
    results = {}

    def buy(i):
        barrier.wait()
        results[i] = m.call("complete_checkout",
                            {"checkout_id": ids[i], "idem_key": f"k{i}"})

    ts = [threading.Thread(target=buy, args=(i,)) for i in range(len(ids))]
    [t.start() for t in ts]
    [t.join() for t in ts]

    assert shared["remaining_minor"] >= 0, (
        f"block overdrawn to {shared['remaining_minor']} — OC-228 Issuer §5 not enforced")
    allowed = [r for r in results.values() if not r.get("_error")]
    assert len(allowed) == 2, f"block had room for exactly 2, {len(allowed)} succeeded"
    refused = [r for r in results.values() if r.get("_error")]
    assert all(r["code"] == "insufficient_block_balance" for r in refused)
    assert all(r["clause"] for r in refused), "a refusal travelled without its clause"


def test_concurrent_completes_leave_the_ledger_verifiable(tmp_path):
    """C1 and C2 meet here: the money path writes to the ledger under the same
    concurrency that broke it."""
    m, ids, shared = _merchant_with_shared_block(tmp_path, remaining_minor=10_000_000)
    barrier = threading.Barrier(len(ids))

    def buy(i):
        barrier.wait()
        m.call("complete_checkout", {"checkout_id": ids[i], "idem_key": f"k{i}"})

    ts = [threading.Thread(target=buy, args=(i,)) for i in range(len(ids))]
    [t.start() for t in ts]
    [t.join() for t in ts]

    ok, msg = m.ledger.verify()
    assert ok, f"money path corrupted its own audit trail: {msg}"


def test_concurrent_completes_over_http_keep_the_chain_intact(tmp_path):
    """End-to-end through the real ThreadingHTTPServer — the deployed configuration,
    and the one this suite never exercised."""
    srv = make_server(port=0)
    handler_merchant = srv.RequestHandlerClass.merchant
    handler_merchant.ledger = Ledger(path=str(tmp_path / "l.jsonl"))
    handler_merchant.capture = lambda c, idem_key=None: f"order_{c.id}"
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}/api/ucp/mcp"

    def rpc(name, args):
        b = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                        "params": {"name": name, "arguments": args}}).encode()
        r = urllib.request.Request(base, data=b, method="POST")
        r.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(r, timeout=10) as x:
            return json.loads(x.read())

    try:
        ids = [rpc("create_checkout", {"items": [{"id": "sku1", "qty": 1}],
                                       "currency": "INR"})["result"]["id"]
               for _ in range(8)]
        barrier = threading.Barrier(len(ids))

        def buy(i):
            barrier.wait()
            rpc("complete_checkout", {"checkout_id": ids[i], "idem_key": f"h{i}"})

        ts = [threading.Thread(target=buy, args=(i,)) for i in range(len(ids))]
        [t.start() for t in ts]
        [t.join() for t in ts]
    finally:
        srv.shutdown()

    ok, msg = handler_merchant.ledger.verify()
    assert ok, f"chain broken by concurrent HTTP traffic: {msg}"
