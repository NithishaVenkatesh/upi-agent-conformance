"""Offline-by-default test session.

FINDINGS.md C3. pyproject.toml promises `-m 'not network'` gives an offline suite.
That promise was false: merchant/razorpay_client.py calls load_env() at IMPORT (the
right fix for `make demo` reporting STUBBED with valid keys beside it), so
default_capture() returned the LIVE client for every unmarked test that built a
Merchant. tests/test_server.py was creating real Razorpay orders on every run —
confirmed by order id order_TUaOKnO4eMBsdm, a real one, not order_fake_.

WHY THIS IS DONE AT IMPORT AND NOT IN A FIXTURE. The first attempt was an autouse
function-scoped fixture. It passed its own tests and did nothing where it mattered:
tests/test_server.py and tests/test_e2e.py build their servers in MODULE-scoped
fixtures, and pytest constructs higher-scoped fixtures FIRST, so the Merchant was
already holding a RazorpayCapture before any function-scoped guard ran. Probing the
live object proved it — `module-scoped server capture: RazorpayCapture /
live-test-mode` — while the suite was green. A guard that cannot fire, which is the
shape FAILURES.md exists to record; caught here only because it was tested against
the real object instead of trusted.

So the keys are neutralised at conftest IMPORT, before pytest builds any fixture and
before the test modules import razorpay_client. They are set to "" rather than
deleted, because load_env() skips names already present in os.environ — deleting
them would simply let the .env repopulate them. Empty is falsy at every site that
reads them, so every code path takes its no-credentials branch.
"""
import os

import pytest

_LIVE_KEYS = ("RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET",
              "AZURE_OPENAI_API_KEY", "AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_DEPLOYMENT")

for _k in _LIVE_KEYS:
    os.environ[_k] = ""          # blank, not deleted — see module docstring


@pytest.fixture
def live_env(monkeypatch):
    """Opt back IN to real credentials. The escape hatch for @pytest.mark.network,
    so the offline guarantee is not bought by making the live rail untestable."""
    from pathlib import Path
    env = Path(__file__).resolve().parent.parent / ".env"
    if not env.exists():
        pytest.skip("no .env present")
    loaded = {}
    for line in env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            loaded[k.strip()] = v.strip().strip('"').strip("'")
    if not loaded.get("RAZORPAY_KEY_ID"):
        pytest.skip("no RAZORPAY_KEY_ID in .env")
    for k, v in loaded.items():
        monkeypatch.setenv(k, v)
    return loaded


class _FakeMerchant:
    def __init__(self, refuse=False):
        self.refuse = refuse
        self.complete_calls = 0
    def call(self, name, args):
        if name == "search_catalog":
            return {"products": [{"id": "sku1", "name": "Cotton tote", "price_minor": 249900}]}
        if name == "get_product":
            if args["id"] != "sku1":
                raise KeyError(f"unknown product {args['id']!r}")
            return {"id": "sku1", "name": "Cotton tote", "price_minor": 249900}
        if name == "create_checkout":
            return {"id": "cs_test", "status": "ready_for_payment", "total_minor": 249900}
        if name == "complete_checkout":
            self.complete_calls += 1
            if self.refuse:
                return {"_error": True, "code": "cap_exceeds_authority",
                        "clause": "Issuer §5", "circular": "NPCI/UPI/OC No.228",
                        "quote": "maximum of Rs.10,000 of block limit", "detail": "x"}
            return {"id": "cs_test", "status": "completed", "order_id": "order_fake_1"}
        raise KeyError(name)

@pytest.fixture
def fake_merchant(): return _FakeMerchant()

@pytest.fixture
def fake_merchant_refusing(): return _FakeMerchant(refuse=True)
