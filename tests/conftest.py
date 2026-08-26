import pytest

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
