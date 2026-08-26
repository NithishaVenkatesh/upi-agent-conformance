"""Razorpay capture tests. Fake by default; the live client activates with rzp_test_ keys."""
import pytest
from merchant.razorpay_client import RazorpayCapture, FakeCapture, LiveKeyRefused
from merchant.checkout import CheckoutStore

def test_refuses_live_keys():
    """A live key could move real money. Refuse before any request is made."""
    with pytest.raises(LiveKeyRefused):
        RazorpayCapture(key_id="rzp_live_abc", key_secret="x")

def test_accepts_test_keys():
    RazorpayCapture(key_id="rzp_test_abc", key_secret="x")     # must not raise

def test_amount_sent_is_integer_paise():
    f = FakeCapture()
    s = CheckoutStore()
    c = s.create(items=[{"id": "sku1", "qty": 2}], currency="INR")
    s.complete(c.id, idem_key="i1", capture=f)
    assert isinstance(f.calls[0]["amount"], int)
    assert f.calls[0]["amount"] == 499800                       # 2 x 249900

def test_idempotency_key_is_forwarded():
    f = FakeCapture(); s = CheckoutStore()
    c = s.create(items=[{"id": "sku1", "qty": 1}], currency="INR")
    s.complete(c.id, idem_key="idem_xyz", capture=f)
    assert f.calls[0]["idem_key"] == "idem_xyz"

def test_replay_does_not_call_razorpay_twice():
    """The architecture's rule: replay returns the original response, no side effects."""
    f = FakeCapture(); s = CheckoutStore()
    c = s.create(items=[{"id": "sku1", "qty": 1}], currency="INR")
    s.complete(c.id, idem_key="same", capture=f)
    s.complete(c.id, idem_key="same", capture=f)
    assert len(f.calls) == 1, "a replayed idempotency key hit the payment API twice"

def test_timeout_is_classified_as_retryable():
    """OC-228 §3: timeouts may be retried (<=3/24h). Any other decline may NOT."""
    from merchant.razorpay_client import classify_failure
    assert classify_failure("timeout")["retryable"] is True
    assert classify_failure("BAD_REQUEST_ERROR")["retryable"] is False
    assert classify_failure("GATEWAY_ERROR")["retryable"] is False

def test_non_timeout_decline_is_not_retryable_even_if_transient_looking():
    from merchant.razorpay_client import classify_failure
    assert classify_failure("SERVER_ERROR")["retryable"] is False
    assert "no retries for any other declines" in classify_failure("SERVER_ERROR")["clause_quote"]
