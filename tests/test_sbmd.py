"""single_block_multiple_debit means what it says.

FINDINGS.md M5. merchant/ucp.py advertises
  {"type": "upi_reserve_pay", "mandate": "single_block_multiple_debit"}
and the server used to hand every checkout its own fresh block, debit it once, and
discard it. That is single-block-SINGLE-debit wearing SBMD's name — a declared
capability that does not match the underlying behaviour, which is structurally the
same defect as the "Guaranteed Collection" contradiction this project detects in
someone else's docs.

These tests pin the primitive against its own definition rather than its label:
ONE reservation, MANY debits, drawn down until the bound refuses the next one.
"""
import threading
import pytest

from gate.ledger import Ledger
from merchant.server import Merchant
from merchant.ucp import build_profile

TOTE = 249900          # sku1


def _m(tmp_path, **block):
    m = Merchant("demo.example")
    m.ledger = Ledger(path=str(tmp_path / "l.jsonl"))
    m.capture = lambda c, idem_key=None: f"order_{c.id}"
    m.capture_mode = "fake (sbmd test)"
    return m


def _co(m, **kw):
    return m.call("create_checkout",
                  {"items": [{"id": "sku1", "qty": 1}], "currency": "INR", **kw})["id"]


def _pay(m, cid, key):
    return m.call("complete_checkout", {"checkout_id": cid, "idem_key": key})


# ------------------------------------------------------- one block, many debits

def test_several_checkouts_for_one_customer_share_one_block(tmp_path):
    m = _m(tmp_path)
    a, b, c = _co(m), _co(m), _co(m)
    assert m.block_for(a) is m.block_for(b) is m.block_for(c), \
        "each checkout got its own block — that is not a single block"


def test_the_block_draws_down_across_successive_debits(tmp_path):
    """The behaviour the name promises, and the thing the old model could not do."""
    m = _m(tmp_path, )
    blk = None
    for i in range(3):
        cid = _co(m)
        blk = m.block_for(cid)
        before = blk["remaining_minor"]
        _pay(m, cid, f"d{i}")
        assert blk["remaining_minor"] == before - TOTE, "debit did not draw the block down"


def test_the_bound_refuses_the_debit_that_would_exceed_it(tmp_path):
    """OC-228 Issuer §5 through ACCUMULATED draw-down — the case the bound exists for
    and the one the old model could never reach."""
    m = _m(tmp_path)
    first = _co(m)
    m.block_for(first)["remaining_minor"] = TOTE * 2      # room for exactly two
    ok1 = _pay(m, first, "k1")
    ok2 = _pay(m, _co(m), "k2")
    third = _pay(m, _co(m), "k3")
    assert not ok1.get("_error") and not ok2.get("_error")
    assert third["_error"] and third["code"] == "insufficient_block_balance"
    assert third["clause"] == "Issuer §5" and third["quote"]


def test_the_balance_never_goes_negative(tmp_path):
    m = _m(tmp_path)
    first = _co(m)
    blk = m.block_for(first)
    blk["remaining_minor"] = TOTE * 2
    for i in range(6):
        _pay(m, _co(m) if i else first, f"n{i}")
    assert blk["remaining_minor"] >= 0


def test_different_customers_do_not_share_a_block(tmp_path):
    m = _m(tmp_path)
    a = _co(m, block={"customer_id": "cust_a"})
    b = _co(m, block={"customer_id": "cust_b"})
    assert m.block_for(a) is not m.block_for(b)


def test_one_block_per_customer_merchant_pair_satisfies_oc228_section_4(tmp_path):
    """OC-228 Issuer §4 allows exactly one concurrent block per (customer, merchant).
    Keying the block that way makes the rule structural rather than a field we set."""
    m = _m(tmp_path)
    for _ in range(4):
        _co(m)
    assert len(m.blocks) == 1
    assert all(b["concurrent_blocks_same_merchant"] == 0 for b in m.blocks.values())


# --------------------------------------------------- C2, now live rather than latent

def test_concurrent_debits_on_the_shared_block_cannot_overdraw(tmp_path):
    """FINDINGS.md C2 was withdrawn as unreachable because blocks were per-checkout.
    Under real SBMD they ARE shared, so this is now a live path — and the lock
    installed in 413c1d5 as a latent guard is what holds it."""
    m = _m(tmp_path)
    ids = [_co(m) for _ in range(8)]
    blk = m.block_for(ids[0])
    blk["remaining_minor"] = TOTE * 2
    barrier = threading.Barrier(len(ids))
    out = {}

    def buy(i):
        barrier.wait()
        out[i] = _pay(m, ids[i], f"c{i}")

    ts = [threading.Thread(target=buy, args=(i,)) for i in range(len(ids))]
    [t.start() for t in ts]
    [t.join() for t in ts]

    assert blk["remaining_minor"] >= 0, f"overdrawn to {blk['remaining_minor']}"
    assert len([r for r in out.values() if not r.get("_error")]) == 2
    ok, msg = m.ledger.verify()
    assert ok, msg


# ------------------------------------------------------- the claim matches the code

def test_the_profile_advertises_sbmd_and_the_server_performs_it(tmp_path):
    """The assertion that would have failed before: profile says one thing, server
    does another. Pinning them together is the point."""
    prof = build_profile("demo.example")["ucp"]
    methods = prof["payment_handlers"]["in.razorpay.upi"][0]["config"]["payment_methods"]
    sbmd = [x for x in methods if x.get("mandate") == "single_block_multiple_debit"]
    assert sbmd, "profile no longer advertises SBMD"

    m = _m(tmp_path)
    first = _co(m)
    blk = m.block_for(first)
    _pay(m, first, "p1")
    _pay(m, _co(m), "p2")
    assert blk["debits"] == 2, "advertised multiple debits, performed fewer"
