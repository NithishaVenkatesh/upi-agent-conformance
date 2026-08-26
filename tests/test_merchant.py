"""Merchant: UCP profile + checkout. The profile must declare what the four real
Indian merchants do not — a UPI payment handler."""
import json, pytest
from merchant.ucp import build_profile, PAYMENT_HANDLER_ID
from merchant.checkout import Checkout, CheckoutStore

def test_profile_declares_upi_handler():
    """The whole point: zouk/boat/mamaearth/bombayshaving declare card-only."""
    p = build_profile("demo.example")["ucp"]
    assert PAYMENT_HANDLER_ID in p["payment_handlers"]
    assert PAYMENT_HANDLER_ID == "in.razorpay.upi"

def test_profile_advertises_upi_methods_not_just_card():
    h = build_profile("demo.example")["ucp"]["payment_handlers"]["in.razorpay.upi"][0]
    methods = {m["type"] for m in h["config"]["payment_methods"]}
    assert "upi" in methods

def test_profile_is_valid_ucp_shape():
    p = build_profile("demo.example")["ucp"]
    for k in ("version", "services", "capabilities", "payment_handlers"):
        assert k in p, f"missing {k}"
    assert p["version"] == "2026-04-08"
    assert "dev.ucp.shopping.checkout" in p["capabilities"]

def test_profile_declares_its_bounds_for_conformance():
    """Our own handler must declare the bound it enforces, so it can be checked
    by the same engine we point at everyone else. We are instance #5."""
    h = build_profile("demo.example")["ucp"]["payment_handlers"]["in.razorpay.upi"][0]
    d = h["config"]["declared_constraints"]
    assert any(c["subject"] == "upi_reserve_pay_block_limit" for c in d)
    for c in d:
        assert c.get("clause") and c.get("circular"), "a declared bound with no citation"

def test_profile_serialises():
    json.dumps(build_profile("demo.example"))

# ---- checkout ----

def test_create_then_complete():
    s = CheckoutStore()
    c = s.create(items=[{"id": "sku1", "qty": 1}], currency="INR")
    assert c.status == "ready_for_payment" and c.total_minor > 0
    done = s.complete(c.id, idem_key="i1")
    assert done.status == "completed"

def test_complete_is_idempotent():
    s = CheckoutStore()
    c = s.create(items=[{"id": "sku1", "qty": 1}], currency="INR")
    a = s.complete(c.id, idem_key="i1")
    b = s.complete(c.id, idem_key="i1")
    assert a.order_id == b.order_id, "replay must not create a second order"

def test_totals_are_integer_paise():
    s = CheckoutStore()
    c = s.create(items=[{"id": "sku1", "qty": 3}], currency="INR")
    assert isinstance(c.total_minor, int)

def test_unknown_sku_rejected():
    s = CheckoutStore()
    with pytest.raises(KeyError):
        s.create(items=[{"id": "nope", "qty": 1}], currency="INR")

def test_cannot_complete_unknown_session():
    s = CheckoutStore()
    with pytest.raises(KeyError):
        s.complete("cs_missing", idem_key="i1")
