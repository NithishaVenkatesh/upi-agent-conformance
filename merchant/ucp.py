"""UCP profile for a merchant an AI agent can pay by UPI.

The four live Indian D2C merchants we measured (zouk.co.in, bombayshavingcompany.com,
boat-lifestyle.com, mamaearth.in) all serve `com.google.pay` + `dev.shopify.card` and
nothing else. This profile declares the handler that is missing from all of them.

`declared_constraints` is deliberately present: our own handler states the bounds it
enforces, with citations, so the conformance engine can be pointed at US as readily as
at anyone else. We are instance #5 in our own drift table.
"""
PAYMENT_HANDLER_ID = "in.razorpay.upi"
UCP_VERSION = "2026-04-08"

DECLARED_CONSTRAINTS = [
    {"subject": "upi_reserve_pay_block_limit", "value": 1000000, "unit": "INR_paise",
     "scope": "per_block", "circular": "NPCI/UPI/OC No.228", "clause": "Issuer §5"},
    {"subject": "upi_reserve_pay_block_validity", "value": 90, "unit": "days",
     "scope": "per_block", "circular": "NPCI/UPI/OC No.228", "clause": "Issuer §5"},
    {"subject": "block_is_payment_guarantee", "value": False, "unit": "predicate",
     "scope": "per_block", "circular": "NPCI/UPI/OC No.228", "clause": "Acquirer §2"},
]


def build_profile(host: str) -> dict:
    base = f"https://{host}"
    return {"ucp": {
        "version": UCP_VERSION,
        "services": {"dev.ucp.shopping": [{
            "version": UCP_VERSION, "transport": "mcp", "endpoint": f"{base}/api/ucp/mcp",
            "spec": "https://ucp.dev/2026-04-08/specification/overview/"}]},
        "capabilities": {
            "dev.ucp.shopping.checkout": [{"version": UCP_VERSION}],
            "dev.ucp.shopping.cart": [{"version": UCP_VERSION}],
            "dev.ucp.shopping.catalog.search": [{"version": UCP_VERSION}],
        },
        "payment_handlers": {PAYMENT_HANDLER_ID: [{
            "id": "razorpay.upi",
            "version": UCP_VERSION,
            "spec": "https://ucp.dev/specification/payment-handler-guide",
            "config": {
                "environment": "test",
                "payment_methods": [
                    {"type": "upi", "flows": ["intent", "collect", "qr"]},
                    {"type": "upi_reserve_pay", "mandate": "single_block_multiple_debit"},
                ],
                # Stated, not implied. See module docstring.
                "declared_constraints": DECLARED_CONSTRAINTS,
                "delegation_layer": "STUBBED — Razorpay TSP has no public API",
            }}]},
    }}
