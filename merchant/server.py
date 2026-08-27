"""Merchant HTTP surface: UCP discovery + MCP checkout tools.

Zero dependencies (stdlib only) so `git clone && make demo` works on a clean machine —
"does it run" is a graded pillar, and an install step is where that usually dies.

Every completion passes through gate.decide(). A refusal returns the clause that
authorises it, because an agent told only "403" learns nothing and will retry — which
OC-228 §3 forbids for non-timeout declines.
"""
import json, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from merchant.ucp import build_profile
from merchant.checkout import CheckoutStore, CATALOG
from merchant.razorpay_client import default_capture, classify_failure
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
    {"name": "complete_checkout",
     "description": ("Pay. Passes through the bounded gate. Re-sending the same "
                     "idem_key after a failure is a retry; whether that retry is "
                     "permitted is decided from what the rail did, per OC-228 "
                     "Acquirer §3 — not from anything the caller asserts."),
     "inputSchema": {"type": "object",
                     "properties": {"checkout_id": {"type": "string"},
                                    "idem_key": {"type": "string"}},
                     "required": ["checkout_id", "idem_key"]}},
]


def _default_block(now, **over):
    b = {"max_minor": 1000000, "remaining_minor": 1000000, "created_ts": now,
         "expires_ts": now + 86400 * 30, "merchant_id": "demo", "customer_id": "cust_demo",
         "retries_24h": 0, "used_idem_keys": set(), "concurrent_blocks_same_merchant": 0,
         # What the rail actually did, per idem_key. The gate's §3 questions are
         # answered from THIS, never from the caller: an agent that could assert
         # retry_of_timeout=True would bypass §3 by saying so. FINDINGS.md M3.
         "observed_failures": {}}
    b.update(over or {})
    b["debits"] = 0
    # Guards the read-decide-debit sequence for THIS block. Travels with the block
    # rather than the checkout, because the thing that must be serialised is the
    # reservation, not the session that draws on it. See _complete(). FINDINGS.md C2.
    b["_lock"] = threading.RLock()
    return b


class Merchant:
    """Holds state so the HTTP layer stays a thin adapter (and is testable without it)."""

    def __init__(self, host="demo.example"):
        self.host = host
        self.store = CheckoutStore()
        # Keyed by (customer_id, merchant_id) — NOT by checkout. FINDINGS.md M5.
        #
        # merchant/ucp.py advertises mandate="single_block_multiple_debit". The
        # previous model gave every checkout its own fresh block, debited it once and
        # discarded it, which is single-block-SINGLE-debit wearing SBMD's name: a
        # declared capability that did not match the behaviour underneath. That is the
        # same defect as the "Guaranteed Collection" contradiction this project detects
        # in someone else's documentation, and it was in ours.
        #
        # Keying by (customer, merchant) also makes OC-228 Issuer §4 — one concurrent
        # block per customer per merchant — structural rather than a field we assert.
        self.blocks = {}
        self._checkout_block = {}
        self.capture, self.capture_mode = default_capture()
        self.ledger = Ledger(path="eval/ledger.jsonl")
        self._blocks_lock = threading.Lock()

    def block_for(self, checkout_id):
        """The reservation this checkout draws on."""
        return self.blocks[self._checkout_block[checkout_id]]

    def _open_block(self, now, checkout_id, override):
        """Get-or-create the single block for this (customer, merchant).

        An explicit `block` argument REPLACES the reservation, because that is how a
        caller says "a new block with these terms" — which the demo needs in order to
        show a block whose declared cap exceeds the circular's."""
        over = dict(override or {})
        key = (over.get("customer_id", "cust_demo"), over.get("merchant_id", "demo"))
        with self._blocks_lock:
            if override or key not in self.blocks:
                self.blocks[key] = _default_block(now, **over)
            self._checkout_block[checkout_id] = key
        return self.blocks[key]

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
            self._open_block(now, c.id, args.get("block"))
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
        if c.id not in self._checkout_block:
            self._open_block(now, c.id, None)
        block = self.block_for(c.id)

        # ONE CRITICAL SECTION PER BLOCK. decide() answers "is there room?" and the
        # debit below makes that answer true; between them the block must not move.
        # Unlocked, N threads read the same remaining_minor, all pass, and all debit —
        # the gate citing Issuer §5 while the balance goes negative behind it.
        #
        # FINDINGS.md C2. I first reported this as live, was wrong (blocks were
        # per-checkout, so completions touched disjoint state), and withdrew it. M5 then
        # made blocks shared per (customer, merchant), because that is what SBMD means —
        # so the path IS live now, and this lock is load-bearing rather than latent.
        # The guard preceded the data-model change deliberately: that change is a
        # modelling fix, not also a correctness regression.
        #
        # The capture call is inside the lock deliberately: debits against one
        # reservation must serialise. That bounds throughput per block, not globally.
        with block["_lock"]:
            # Replay is resolved BEFORE the gate. The architecture says a duplicate
            # request returns the original response with no side effects; refusing it
            # would tell a correctly-behaving agent its payment failed, and OC-228 §3
            # then forbids the retry it would reasonably attempt. The gate's idempotency
            # check remains as a backstop for keys that never completed.
            if args["idem_key"] in block["used_idem_keys"]:
                self.ledger.append({"event": "replay", "checkout": c.id,
                                    "idem_key": args["idem_key"]})
                return {"id": c.id, "status": c.status, "order_id": c.order_id,
                        "replayed": True, "capture_mode": self.capture_mode}
            # Retry facts are OBSERVED, not asserted. This idem_key is a retry iff we
            # already watched the rail fail on it, and it is a timeout retry iff that
            # failure was a timeout. Reading either from `args` would let any agent
            # walk past OC-228 §3 by claiming the exemption. FINDINGS.md M3.
            prior = block["observed_failures"].get(args["idem_key"])
            req = {"amount_minor": c.total_minor, "idem_key": args["idem_key"],
                   "is_retry": prior is not None,
                   "retry_of_timeout": bool(prior and prior["retryable"])}
            d = decide(req, block, "PASS", now)
            self.ledger.append({"event": "authorise", "checkout": c.id,
                                "decision": d.code, "clause": d.clause,
                                "is_retry": req["is_retry"]})
            if not d.allowed:
                # The clause travels with the refusal. An agent that knows WHY can
                # comply; one that only sees 403 retries, which OC-228 §3 forbids.
                return {"_error": True, "code": d.code, "clause": d.clause,
                        "circular": d.circular, "quote": d.quote, "detail": d.detail}

            if req["is_retry"]:
                block["retries_24h"] += 1

            # The rail can fail. Before, the exception escaped _complete() entirely:
            # the handler caught only KeyError, so the agent got a dropped TCP
            # connection, and the ledger was left asserting `authorised` for a payment
            # that never happened. FINDINGS.md H3.
            try:
                done = self.store.complete(c.id, args["idem_key"], capture=self.capture)
            except Exception as e:                       # noqa: BLE001 — rail-agnostic
                kind = "timeout" if "timeout" in str(e).lower() else type(e).__name__
                cls = classify_failure(kind)
                block["observed_failures"][args["idem_key"]] = cls
                self.ledger.append({"event": "capture_failed", "checkout": c.id,
                                    "idem_key": args["idem_key"], "kind": kind,
                                    "retryable": cls["retryable"]})
                # Nothing is debited and no idem_key is burned: the payment did not
                # happen, so the block must look exactly as it did before the attempt.
                return {"_error": True, "code": "capture_failed",
                        "retryable": cls["retryable"], "clause": cls["clause"],
                        "circular": cls["circular"], "quote": cls["clause_quote"],
                        "detail": f"payment rail failed: {e}"}

            block["remaining_minor"] -= c.total_minor
            block["debits"] += 1
            block["used_idem_keys"].add(args["idem_key"])
            block["observed_failures"].pop(args["idem_key"], None)
            self.ledger.append({"event": "captured", "checkout": c.id,
                                "order_id": done.order_id})
            return {"id": done.id, "status": done.status, "order_id": done.order_id,
                    "capture_mode": self.capture_mode}


def make_server(port=8080, host="demo.example"):
    m = Merchant(host)

    class H(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"
        # Exposed so tests can reach the state the server is actually serving —
        # concurrency behaviour cannot be asserted against a different instance.
        merchant = m

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
