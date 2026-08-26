"""Money-path gate tests. Every refusal must cite the clause that authorises it."""
import time, pytest
from gate.decide import decide

NOW = 1_700_000_000
def blk(**kw):
    b = {"max_minor":1000000,"remaining_minor":450000,"created_ts":NOW,
         "expires_ts":NOW+86400*30,"merchant_id":"zouk","customer_id":"c1",
         "retries_24h":0,"used_idem_keys":set(),"concurrent_blocks_same_merchant":0}
    b.update(kw); return b
def req(**kw):
    r = {"amount_minor":100000,"idem_key":"k1"}; r.update(kw); return r

def test_conformant_purchase_allowed():
    d = decide(req(), blk(), "PASS", NOW)
    assert d.allowed and d.code == "authorised"

@pytest.mark.parametrize("verdict", ["FAIL", "UNDETERMINED"])
def test_non_pass_verdict_refuses(verdict):
    """UNDETERMINED must refuse, not pass. Fail-closed."""
    d = decide(req(), blk(), verdict, NOW)
    assert not d.allowed and d.code == "counterparty_not_conformant"

def test_block_cap_over_authority_refused():          # OC-228 §5
    d = decide(req(), blk(max_minor=2500000), "PASS", NOW)
    assert d.code == "cap_exceeds_authority" and "10,000" in d.quote

def test_validity_cap_is_enforced_not_just_expiry():  # OC-228 §5 — FAILURES.md #3
    d = decide(req(), blk(expires_ts=NOW+86400*180), "PASS", NOW)
    assert d.code == "validity_exceeds_authority" and "180d" in d.detail

def test_expired_block_refused():
    d = decide(req(), blk(created_ts=NOW-86400*100, expires_ts=NOW-86400*10), "PASS", NOW)
    assert d.code == "block_expired"

def test_insufficient_balance_refused():
    d = decide(req(amount_minor=500000), blk(remaining_minor=100000), "PASS", NOW)
    assert d.code == "insufficient_block_balance"

def test_retry_on_non_timeout_refused():              # OC-228 §3
    d = decide(req(is_retry=True, retry_of_timeout=False), blk(), "PASS", NOW)
    assert d.code == "retry_not_permitted"

def test_retry_budget_exhausted():                    # OC-228 §3
    d = decide(req(is_retry=True, retry_of_timeout=True), blk(retries_24h=3), "PASS", NOW)
    assert d.code == "retry_budget_exhausted"

def test_timeout_retry_within_budget_allowed():
    d = decide(req(is_retry=True, retry_of_timeout=True), blk(retries_24h=2), "PASS", NOW)
    assert d.allowed

def test_duplicate_block_refused():                   # OC-228 §4
    d = decide(req(), blk(concurrent_blocks_same_merchant=1), "PASS", NOW)
    assert d.code == "duplicate_block_for_merchant"

def test_idempotency_replay_refused():
    d = decide(req(idem_key="used"), blk(used_idem_keys={"used"}), "PASS", NOW)
    assert d.code == "idempotency_replay"

def test_every_refusal_cites_a_clause():
    """The invariant. idempotency_replay is the one documented exemption."""
    cases = [
        (req(), blk(max_minor=2500000)), (req(), blk(expires_ts=NOW+86400*180)),
        (req(amount_minor=999999999), blk()), (req(is_retry=True), blk()),
        (req(), blk(concurrent_blocks_same_merchant=1)), (req(), blk(), "FAIL"),
    ]
    for c in cases:
        d = decide(c[0], c[1], c[2] if len(c) > 2 else "PASS", NOW)
        assert not d.allowed
        assert d.clause and d.circular and d.quote, f"{d.code} has no citation"

def test_gate_is_pure_and_deterministic():
    a, b = blk(), blk()
    assert decide(req(), a, "PASS", NOW) == decide(req(), b, "PASS", NOW)

def test_gate_reads_no_clock():
    """now_ts is injected; the gate must not call time() itself, or it cannot replay."""
    import inspect
    from gate import decide as m
    assert "time.time()" not in inspect.getsource(m)
