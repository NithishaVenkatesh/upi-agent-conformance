"""Merchant HTTP surface: UCP discovery + MCP checkout tools.

Zero dependencies (stdlib only) so `git clone && make demo` works on a clean machine —
"does it run" is a graded pillar, and an install step is where that usually dies.

Every completion passes through gate.decide(). A refusal returns the clause that
authorises it, because an agent told only "403" learns nothing and will retry — which
OC-228 §3 forbids for non-timeout declines.
"""
import json, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from merchant.ucp import build_profile
from merchant.checkout import CheckoutStore, CATALOG
from merchant.razorpay_client import default_capture
from gate.decide import decide
from gate.ledger import Ledger

TOOLS = [
    {"name": "search_catalog", "description": "Search products",
     "inputSchema": {"type": "object", "properties": {"q": {"type": "string"}}}},
    {"name": "get_product", "description": "Fetch one product",
     "inputSchema": {"type": "object", "properties": {"id": {"type": "string"}},
                     "required": ["id"]}},
    {"name": "create_checkout", "description": "Open a checkout session",
     "inputSchema": {"type": "object",
                     "properties": {"items": {"type": "array"}, "currency": {"type": "string"},
                                    "block": {"type": "object"}},
                     "required": ["items", "currency"]}},
    {"name": "update_checkout", "description": "Update a checkout session",
     "inputSchema": {"type": "object", "properties": {"checkout_id": {"type": "string"}},
                     "required": ["checkout_id"]}},
    {"name": "complete_checkout", "description": "Pay. Passes through the bounded gate.",
     "inputSchema": {"type": "object",
                     "properties": {"checkout_id": {"type": "string"},
                                    "idem_key": {"type": "string"}},
                     "required": ["checkout_id", "idem_key"]}},
]


def _default_block(now, **over):
    b = {"max_minor": 1000000, "remaining_minor": 1000000, "created_ts": now,
         "expires_ts": now + 86400 * 30, "merchant_id": "demo", "customer_id": "cust_demo",
         "retries_24h": 0, "used_idem_keys": set(), "concurrent_blocks_same_merchant": 0}
    b.update(over or {})
    return b


class Merchant:
    """Holds state so the HTTP layer stays a thin adapter (and is testable without it)."""

    def __init__(self, host="demo.example"):
        self.host = host
        self.store = CheckoutStore()
        self.blocks = {}
        self.capture, self.capture_mode = default_capture()
        self.ledger = Ledger(path="eval/ledger.jsonl")

    def call(self, name, args):
        now = int(time.time())
        if name == "search_catalog":
            q = (args.get("q") or "").lower()
            return {"products": [{"id": k, **v} for k, v in CATALOG.items()
                                 if q in v["name"].lower() or not q]}
        if name == "get_product":
            if args["id"] not in CATALOG:
                raise KeyError(f"unknown product {args['id']!r}")
            return {"id": args["id"], **CATALOG[args["id"]]}
        if name == "create_checkout":
            c = self.store.create(args["items"], args["currency"])
            self.blocks[c.id] = _default_block(now, **(args.get("block") or {}))
            return {"id": c.id, "status": c.status, "total_minor": c.total_minor,
                    "currency": c.currency}
        if name == "update_checkout":
            c = self.store.get(args["checkout_id"])
            return {"id": c.id, "status": c.status, "total_minor": c.total_minor}
        if name == "complete_checkout":
            return self._complete(args, now)
        raise KeyError(f"unknown tool {name!r}")

    def _complete(self, args, now):
        c = self.store.get(args["checkout_id"])
        block = self.blocks.get(c.id) or _default_block(now)

        # Replay is resolved BEFORE the gate. The architecture says a duplicate request
        # returns the original response with no side effects; refusing it would tell a
        # correctly-behaving agent its payment failed, and OC-228 §3 then forbids the
        # retry it would reasonably attempt. The gate's idempotency check remains as a
        # backstop for keys that never completed.
        if args["idem_key"] in block["used_idem_keys"]:
            self.ledger.append({"event": "replay", "checkout": c.id,
                                "idem_key": args["idem_key"]})
            return {"id": c.id, "status": c.status, "order_id": c.order_id,
                    "replayed": True, "capture_mode": self.capture_mode}
        req = {"amount_minor": c.total_minor, "idem_key": args["idem_key"]}
        d = decide(req, block, "PASS", now)
        self.ledger.append({"event": "authorise", "checkout": c.id,
                            "decision": d.code, "clause": d.clause})
        if not d.allowed:
            # The clause travels with the refusal. An agent that knows WHY can comply;
            # one that only sees 403 retries, which OC-228 §3 forbids.
            return {"_error": True, "code": d.code, "clause": d.clause,
                    "circular": d.circular, "quote": d.quote, "detail": d.detail}
        done = self.store.complete(c.id, args["idem_key"], capture=self.capture)
        block["remaining_minor"] -= c.total_minor
        block["used_idem_keys"].add(args["idem_key"])
        return {"id": done.id, "status": done.status, "order_id": done.order_id,
                "capture_mode": self.capture_mode}


def make_server(port=8080, host="demo.example"):
    m = Merchant(host)

    class H(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, *a):  # quiet under test
            pass

        def _send(self, code, obj):
            b = json.dumps(obj).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(b)))
            self.end_headers()
            self.wfile.write(b)

        def do_GET(self):
            if self.path == "/.well-known/ucp":
                return self._send(200, build_profile(m.host))
            if self.path == "/":
                # A real origin, so a browser-based agent can fetch the MCP endpoint
                # without being blocked by the null origin of about:blank.
                body = (b"<!doctype html><meta charset=utf-8><title>demo merchant</title>"
                        b"<h1>Demo merchant</h1><p>Agent-payable by UPI.</p>"
                        b"<ul><li><a href='/.well-known/ucp'>/.well-known/ucp</a></li>"
                        b"<li>POST /api/ucp/mcp</li></ul>")
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            self._send(404, {"error": "not found"})

        def do_POST(self):
            if self.path != "/api/ucp/mcp":
                return self._send(404, {"error": "not found"})
            n = int(self.headers.get("Content-Length", 0))
            try:
                rpc = json.loads(self.rfile.read(n))
            except json.JSONDecodeError:
                return self._send(400, {"error": "malformed json"})
            rid = rpc.get("id")
            try:
                if rpc.get("method") == "tools/list":
                    return self._send(200, {"jsonrpc": "2.0", "id": rid,
                                            "result": {"tools": TOOLS}})
                if rpc.get("method") == "tools/call":
                    p = rpc.get("params") or {}
                    res = m.call(p.get("name"), p.get("arguments") or {})
                    if isinstance(res, dict) and res.pop("_error", False):
                        return self._send(200, {"jsonrpc": "2.0", "id": rid, "error": res})
                    return self._send(200, {"jsonrpc": "2.0", "id": rid, "result": res})
                return self._send(200, {"jsonrpc": "2.0", "id": rid,
                                        "error": {"code": "unknown_method"}})
            except KeyError as e:
                return self._send(200, {"jsonrpc": "2.0", "id": rid,
                                        "error": {"code": "not_found", "detail": str(e)}})

    return ThreadingHTTPServer(("127.0.0.1", port), H)


if __name__ == "__main__":
    s = make_server(port=8080)
    print(f"merchant on http://127.0.0.1:{s.server_address[1]}  "
          f"(/.well-known/ucp · /api/ucp/mcp)")
    s.serve_forever()
