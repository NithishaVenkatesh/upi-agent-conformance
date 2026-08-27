"""OC-228 Acquirer §3 through the running server, not just through decide().

FINDINGS.md M3 and H3. Two of the gate's nine refusals — the two enforcing §3, the
clause the buyer agent and the README lean on hardest — were correct, tested, and
structurally unreachable: the server built `req` with only amount_minor and idem_key
and never set `is_retry`. And classify_failure(), which encodes "timeouts are
retryable, nothing else is", had zero production callers.

The failure path was worse than unreachable. A raising capture escaped _complete(),
the handler caught only KeyError, and the agent got a dropped TCP connection —
while the ledger had already recorded `authorised` for a payment that never happened.
"""
import json, threading, urllib.request
import pytest

from gate.ledger import Ledger
from merchant.server import Merchant


class _Rail:
    """A payment rail that fails on demand, then recovers."""
    def __init__(self, fail_times=1, exc=None):
        self.calls, self.fail_times = 0, fail_times
        self.exc = exc or RuntimeError("timeout")

    def __call__(self, checkout, idem_key=None):
        self.calls += 1
        if self.calls <= self.fail_times:
            raise self.exc
        return f"order_recovered_{self.calls}"


def _merchant(tmp_path, rail):
    m = Merchant("demo.example")
    m.ledger = Ledger(path=str(tmp_path / "l.jsonl"))
    m.capture, m.capture_mode = rail, "fake (retry test)"
    return m


def _checkout(m):
    return m.call("create_checkout",
                  {"items": [{"id": "sku1", "qty": 1}], "currency": "INR"})["id"]


# ------------------------------------------------- H3: the failure reaches the agent

def test_a_rail_failure_returns_a_refusal_not_a_dropped_connection(tmp_path):
    m = _merchant(tmp_path, _Rail(fail_times=1))
    r = m.call("complete_checkout", {"checkout_id": _checkout(m), "idem_key": "t1"})
    assert r.get("_error"), "capture raised and the caller got no structured error"
    assert r["code"] == "capture_failed"


def test_the_failure_carries_its_retryability_and_the_clause(tmp_path):
    """classify_failure() finally has a caller. A timeout is the ONE retryable class."""
    m = _merchant(tmp_path, _Rail(fail_times=1))
    r = m.call("complete_checkout", {"checkout_id": _checkout(m), "idem_key": "t2"})
    assert r["retryable"] is True
    assert r["clause"] == "Acquirer §3"
    assert "no retries for any other declines" in r["quote"]


def test_a_non_timeout_failure_is_not_retryable(tmp_path):
    m = _merchant(tmp_path, _Rail(fail_times=1, exc=RuntimeError("razorpay 400: bad")))
    r = m.call("complete_checkout", {"checkout_id": _checkout(m), "idem_key": "t3"})
    assert r["retryable"] is False


def test_the_ledger_records_the_failure_not_just_the_authorisation(tmp_path):
    """Before: the chain said `authorised` for a payment that never happened."""
    m = _merchant(tmp_path, _Rail(fail_times=1))
    m.call("complete_checkout", {"checkout_id": _checkout(m), "idem_key": "t4"})
    events = [json.loads(l)["payload"]["event"] for l in open(m.ledger.path)]
    assert "capture_failed" in events, f"outcome never recorded: {events}"
    ok, msg = m.ledger.verify()
    assert ok, msg


def test_a_failed_capture_does_not_consume_the_block_balance(tmp_path):
    m = _merchant(tmp_path, _Rail(fail_times=1))
    cid = _checkout(m)
    blk = m.block_for(cid)
    before = blk["remaining_minor"]
    m.call("complete_checkout", {"checkout_id": cid, "idem_key": "t5"})
    assert blk["remaining_minor"] == before, "debited for a payment that failed"
    assert blk["debits"] == 0, "a failed capture counted as a debit"
    assert "t5" not in blk["used_idem_keys"], "idem key burned on a failure"


# --------------------------------------------------- M3: §3 reachable from the server

def test_retrying_a_timeout_is_permitted_and_succeeds(tmp_path):
    m = _merchant(tmp_path, _Rail(fail_times=1))
    cid = _checkout(m)
    first = m.call("complete_checkout", {"checkout_id": cid, "idem_key": "r1"})
    assert first["_error"] and first["retryable"]
    second = m.call("complete_checkout", {"checkout_id": cid, "idem_key": "r1"})
    assert not second.get("_error"), f"legal retry refused: {second}"
    assert second["order_id"].startswith("order_recovered_")


def test_retrying_a_non_timeout_decline_is_refused_by_the_gate(tmp_path):
    """The refusal that could not fire. OC-228 §3 forbids retrying anything but a
    timeout, and the server now supplies the gate the facts it needs to say so."""
    m = _merchant(tmp_path, _Rail(fail_times=1, exc=RuntimeError("razorpay 400: bad")))
    cid = _checkout(m)
    m.call("complete_checkout", {"checkout_id": cid, "idem_key": "r2"})
    again = m.call("complete_checkout", {"checkout_id": cid, "idem_key": "r2"})
    assert again["_error"] and again["code"] == "retry_not_permitted"
    assert again["clause"] and again["circular"]


def test_the_retry_budget_is_enforced_at_three_per_24h(tmp_path):
    """The other unreachable refusal."""
    m = _merchant(tmp_path, _Rail(fail_times=99))
    cid = _checkout(m)
    codes = [m.call("complete_checkout", {"checkout_id": cid, "idem_key": "r3"})
             for _ in range(6)]
    assert any(c.get("code") == "retry_budget_exhausted" for c in codes), \
        [c.get("code") for c in codes]


def test_an_agent_cannot_assert_its_way_past_section_3(tmp_path):
    """The retry facts come from what the server OBSERVED, never from the caller.
    A client-supplied retry_of_timeout would let any agent bypass §3 by claiming it."""
    m = _merchant(tmp_path, _Rail(fail_times=1, exc=RuntimeError("razorpay 400: bad")))
    cid = _checkout(m)
    m.call("complete_checkout", {"checkout_id": cid, "idem_key": "r4"})
    spoofed = m.call("complete_checkout", {"checkout_id": cid, "idem_key": "r4",
                                           "is_retry": False, "retry_of_timeout": True})
    assert spoofed["_error"] and spoofed["code"] == "retry_not_permitted", \
        "a caller talked its way past OC-228 §3"


def test_a_successful_first_attempt_is_not_treated_as_a_retry(tmp_path):
    m = _merchant(tmp_path, _Rail(fail_times=0))
    r = m.call("complete_checkout", {"checkout_id": _checkout(m), "idem_key": "ok1"})
    assert not r.get("_error") and r["order_id"]
