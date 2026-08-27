"""`make test` must not touch the network, with or without a .env.

FINDINGS.md C3. These are the regression tests for a promise pyproject.toml was
already making and the suite had stopped keeping.
"""
import os
import pytest

from merchant.razorpay_client import default_capture, FakeCapture
from merchant.server import Merchant, make_server


@pytest.fixture(scope="module")
def module_scoped_server():
    """Deliberately module-scoped: this is the scope that defeated the first fix."""
    import threading
    srv = make_server(port=0)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    yield srv
    srv.shutdown()


def test_unmarked_tests_never_see_razorpay_keys():
    """The autouse fixture strips them regardless of what sits in .env."""
    assert not os.environ.get("RAZORPAY_KEY_ID")
    assert not os.environ.get("RAZORPAY_KEY_SECRET")


def test_default_capture_is_fake_in_the_offline_suite():
    cap, mode = default_capture()
    assert isinstance(cap, FakeCapture)
    assert "STUBBED" in mode


def test_merchant_built_in_a_test_never_holds_a_live_client():
    """The exact path tests/test_server.py takes. Before the fix this constructed a
    RazorpayCapture and completing a checkout created a real order."""
    m = Merchant("demo.example")
    assert isinstance(m.capture, FakeCapture), (
        f"merchant wired to {type(m.capture).__name__} in an offline test")


def test_completing_a_checkout_produces_a_fake_order_id():
    """The strongest form of the assertion: a real Razorpay id starts with `order_`
    followed by a base62 token. A fake one is self-identifying."""
    m = Merchant("demo.example")
    c = m.call("create_checkout", {"items": [{"id": "sku1", "qty": 1}], "currency": "INR"})
    r = m.call("complete_checkout", {"checkout_id": c["id"], "idem_key": "offline-1"})
    assert r["order_id"].startswith("order_fake_"), (
        f"order id {r['order_id']!r} did not come from FakeCapture — a live call was made")


def test_azure_keys_are_stripped_too():
    """extract/llm.py's default_llm() reaches Azure when a key is present. Same
    class of leak, same fix."""
    assert not os.environ.get("AZURE_OPENAI_API_KEY")


def test_a_module_scoped_server_is_also_guarded(module_scoped_server):
    """THE REGRESSION THAT MATTERED. The first attempt at this fix was an autouse
    function-scoped fixture; pytest builds module-scoped fixtures first, so the
    server was already holding a RazorpayCapture and the suite was green anyway.
    Asserting against the live object is the only thing that catches that."""
    m = module_scoped_server.RequestHandlerClass.merchant
    assert isinstance(m.capture, FakeCapture), (
        f"module-scoped fixture escaped the guard: {m.capture_mode}")


@pytest.mark.network
def test_the_marker_is_what_re_enables_the_live_rail(live_env):
    """Proves this is a switch and not a blanket ban — otherwise the offline
    guarantee would be bought by making the live integration untestable. Marked,
    so `make test` skips it."""
    cap, mode = default_capture()
    assert mode == "live-test-mode"
