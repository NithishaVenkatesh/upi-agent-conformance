"""HTTP + MCP surface. Zero-dependency stdlib server so `make demo` needs no install."""
import json, threading, urllib.request, urllib.error, pytest
from merchant.server import make_server

@pytest.fixture(scope="module")
def base():
    srv = make_server(port=0)
    t = threading.Thread(target=srv.serve_forever, daemon=True); t.start()
    yield f"http://127.0.0.1:{srv.server_address[1]}"
    srv.shutdown()

def _get(url):
    with urllib.request.urlopen(url, timeout=5) as r:
        return r.status, json.loads(r.read())

def _rpc(base, method, params=None, _id=1):
    body = json.dumps({"jsonrpc":"2.0","id":_id,"method":method,
                       "params":params or {}}).encode()
    req = urllib.request.Request(f"{base}/api/ucp/mcp", data=body, method="POST")
    req.add_header("Content-Type","application/json")
    with urllib.request.urlopen(req, timeout=5) as r:
        return json.loads(r.read())

# ---- discovery ----
def test_well_known_ucp_served(base):
    s, b = _get(f"{base}/.well-known/ucp")
    assert s == 200 and "ucp" in b

def test_well_known_declares_upi(base):
    _, b = _get(f"{base}/.well-known/ucp")
    assert "in.razorpay.upi" in b["ucp"]["payment_handlers"]

def test_unknown_path_404(base):
    with pytest.raises(urllib.error.HTTPError) as e:
        _get(f"{base}/nope")
    assert e.value.code == 404

# ---- MCP tools ----
def test_tools_list(base):
    r = _rpc(base, "tools/list")
    names = {t["name"] for t in r["result"]["tools"]}
    assert {"search_catalog","get_product","create_checkout",
            "update_checkout","complete_checkout"} <= names

def test_search_catalog(base):
    r = _rpc(base, "tools/call", {"name":"search_catalog","arguments":{"q":"tote"}})
    assert r["result"]["products"]

def test_create_and_complete_checkout(base):
    c = _rpc(base, "tools/call", {"name":"create_checkout",
        "arguments":{"items":[{"id":"sku1","qty":1}],"currency":"INR"}})["result"]
    assert c["status"] == "ready_for_payment"
    d = _rpc(base, "tools/call", {"name":"complete_checkout",
        "arguments":{"checkout_id":c["id"],"idem_key":"e2e-1"}})["result"]
    assert d["status"] == "completed" and d["order_id"]

def test_gate_refusal_surfaces_clause_to_the_agent(base):
    """The agent must be told WHY, with the clause. A bare 403 teaches it nothing."""
    c = _rpc(base, "tools/call", {"name":"create_checkout",
        "arguments":{"items":[{"id":"sku2","qty":1}],"currency":"INR",
                     "block":{"max_minor":2500000}}})["result"]
    d = _rpc(base, "tools/call", {"name":"complete_checkout",
        "arguments":{"checkout_id":c["id"],"idem_key":"e2e-refuse"}})
    err = d.get("error") or d["result"]
    assert err["code"] == "cap_exceeds_authority"
    assert err["clause"] and err["circular"] and err["quote"]

def test_unknown_tool_is_an_error_not_a_crash(base):
    r = _rpc(base, "tools/call", {"name":"drop_tables","arguments":{}})
    assert "error" in r

def test_malformed_json_rejected(base):
    req = urllib.request.Request(f"{base}/api/ucp/mcp", data=b"{not json",method="POST")
    req.add_header("Content-Type","application/json")
    with pytest.raises(urllib.error.HTTPError) as e:
        urllib.request.urlopen(req, timeout=5)
    assert e.value.code == 400

def test_replayed_idem_key_returns_same_order(base):
    # Its own customer, therefore its own reservation. Blocks are now shared per
    # (customer, merchant) — real SBMD — so earlier tests in this module draw down
    # the default block and this one would otherwise be refused for lack of funds.
    # That refusal is the bound working; the old assumption was that every checkout
    # came with fresh money. FINDINGS.md M5.
    c = _rpc(base, "tools/call", {"name":"create_checkout",
        "arguments":{"items":[{"id":"sku3","qty":1}],"currency":"INR",
                     "block":{"customer_id":"cust_replay"}}})["result"]
    a = _rpc(base,"tools/call",{"name":"complete_checkout",
        "arguments":{"checkout_id":c["id"],"idem_key":"dup"}})["result"]
    b2 = _rpc(base,"tools/call",{"name":"complete_checkout",
        "arguments":{"checkout_id":c["id"],"idem_key":"dup"}})["result"]
    assert a["order_id"] == b2["order_id"]
