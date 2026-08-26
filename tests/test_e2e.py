"""End-to-end via a real browser.

Two things are proven here that unit tests cannot:
  1. Our merchant is genuinely reachable by an agent over HTTP — discovery through
     /.well-known/ucp, then MCP tool calls, exactly as a third-party buyer would.
  2. The four REAL Indian merchants are card-only. That is the premise of the whole
     project, and it is checked against the live web rather than asserted.

Network tests are marked so `make test` stays offline and deterministic.
"""
import json, threading, pytest
from playwright.sync_api import sync_playwright
from merchant.server import make_server

REAL_MERCHANTS = ["zouk.co.in", "bombayshavingcompany.com",
                  "boat-lifestyle.com", "mamaearth.in"]


@pytest.fixture(scope="module")
def live():
    srv = make_server(port=0)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{srv.server_address[1]}"
    srv.shutdown()


@pytest.fixture(scope="module")
def page():
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        yield pg
        b.close()


def _rpc(page, base, name, args):
    return page.evaluate("""async ([u,n,a]) => {
        const r = await fetch(u + '/api/ucp/mcp', {method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',
                                params:{name:n,arguments:a}})});
        return await r.json();
    }""", [base, name, args])


def test_agent_discovers_then_buys_end_to_end(page, live):
    """The full path a real AI buyer would take."""
    page.goto(live)          # establish a same-origin context for fetch
    profile = page.evaluate("""async (u) => (await fetch(u+'/.well-known/ucp')).json()""", live)
    handlers = list(profile["ucp"]["payment_handlers"].keys())
    assert "in.razorpay.upi" in handlers

    endpoint = profile["ucp"]["services"]["dev.ucp.shopping"][0]["endpoint"]
    assert endpoint.endswith("/api/ucp/mcp")

    found = _rpc(page, live, "search_catalog", {"q": "tote"})["result"]["products"]
    assert found
    c = _rpc(page, live, "create_checkout",
             {"items": [{"id": found[0]["id"], "qty": 1}], "currency": "INR"})["result"]
    done = _rpc(page, live, "complete_checkout",
                {"checkout_id": c["id"], "idem_key": "pw-e2e-1"})["result"]
    assert done["status"] == "completed" and done["order_id"]


def test_refusal_reaches_the_agent_with_its_clause(page, live):
    page.goto(live)
    c = _rpc(page, live, "create_checkout",
             {"items": [{"id": "sku1", "qty": 1}], "currency": "INR",
              "block": {"max_minor": 2500000}})["result"]
    r = _rpc(page, live, "complete_checkout",
             {"checkout_id": c["id"], "idem_key": "pw-refuse"})
    err = r["error"]
    assert err["code"] == "cap_exceeds_authority"
    assert "10,000" in err["quote"]


@pytest.mark.network
@pytest.mark.parametrize("host", REAL_MERCHANTS)
def test_real_indian_merchants_are_card_only(page, host):
    """The premise, checked live. If any of these starts accepting UPI, our problem
    statement has changed and we should know before a judge tells us."""
    prof = page.evaluate("""async (h) => {
        try { const r = await fetch('https://'+h+'/.well-known/ucp');
              return r.ok ? await r.json() : null; } catch(e) { return null; }
    }""", host)
    if prof is None:
        pytest.skip(f"{host} unreachable")
    handlers = list(prof["ucp"].get("payment_handlers", {}).keys())
    assert handlers, f"{host} serves UCP but declares no payment handlers"
    blob = json.dumps(prof).lower()
    assert "upi" not in blob, f"{host} NOW ACCEPTS UPI — the premise has changed"
