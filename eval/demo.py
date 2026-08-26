"""make demo — the whole path, end to end, in one run. No network. ~2s.

Scene 1  the hole: what four real Indian merchants declare
Scene 2  our merchant declares the missing UPI handler
Scene 3  an agent buys, bounded
Scene 4  a refusal, quoting the clause that authorises it
Scene 5  the ledger, verified in both directions
"""
import json, threading, time, urllib.request
from merchant.server import make_server
from merchant.ucp import build_profile
from agent.buyer import BuyerAgent, FakePlanner
from gate.ledger import Ledger
from merchant.razorpay_client import default_capture

BAR = "─" * 74
def h(n, t): print(f"\n{BAR}\n {n}. {t}\n{BAR}")

# Captured live 2026-08-26; see research/07_.../evidence/ucp_*.json
REAL = {"zouk.co.in": ["com.google.pay", "dev.shopify.card"],
        "bombayshavingcompany.com": ["com.google.pay", "dev.shopify.card"],
        "boat-lifestyle.com": ["com.google.pay", "dev.shopify.card"],
        "mamaearth.in": ["com.google.pay", "dev.shopify.card"]}

h(1, "The hole — four live Indian merchants, agentic checkout")
for host, handlers in REAL.items():
    print(f"  {host:28} {', '.join(handlers)}     UPI: NO")
print("\n  India is 80%+ UPI. An agent shopping here can pay by Visa, Mastercard,")
print("  Amex, Discover or Diners Club — and not by UPI.")

h(2, "Our merchant — declaring the handler that is missing")
prof = build_profile("demo.example")["ucp"]
ph = prof["payment_handlers"]["in.razorpay.upi"][0]["config"]
print(f"  payment_handlers: {list(prof['payment_handlers'])}")
print(f"  methods:          {[m['type'] for m in ph['payment_methods']]}")
print(f"  delegation layer: {ph['delegation_layer']}")
print("\n  It also declares the bounds it enforces, with citations — so the same")
print("  conformance engine can be pointed at us:")
for c in ph["declared_constraints"]:
    v = c["value"]
    v = f"₹{v//100:,}" if c["unit"] == "INR_paise" else v
    print(f"    {c['subject']:34} {str(v):>9} {c['scope']:24} {c['circular']} {c['clause']}")

srv = make_server(port=0)
threading.Thread(target=srv.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{srv.server_address[1]}"
merchant = srv.RequestHandlerClass.__qualname__  # noqa
from merchant.server import Merchant
M = Merchant("demo.example")

h(3, "An agent buys — bounded")
cap, mode = default_capture()
print(f"  payment rail: {mode}")
a = BuyerAgent(M, planner=FakePlanner(["sku1"]))
r = a.buy("a cotton tote under ₹3000", idem_key="demo-1")
print(f"  → {r['status']}  order={r['order_id']}  ({r['capture_mode']})")

h(4, "A refusal — with the clause that authorises it")
M.blocks.clear()
c = M.call("create_checkout", {"items": [{"id": "sku2", "qty": 1}], "currency": "INR",
                               "block": {"max_minor": 2500000}})
res = M.call("complete_checkout", {"checkout_id": c["id"], "idem_key": "demo-2"})
print(f"  REFUSED {res['code']}")
print(f"    {res['circular']} {res['clause']}")
print(f"    \"{res['quote']}\"")
print(f"    {res['detail']}")

h(5, "The semantic catch — what no regex can reach")
# Verbatim from Razorpay's own Reserve Pay documentation page.
VENDOR_DOC = ("Guaranteed Collection: Funds are pre-blocked, ensuring you receive "
              "payment regardless of customer's later financial situation.")
print(f'  vendor doc says:\n    "{VENDOR_DOC}"\n')

from extract.naive import naive_extract
from extract.llm import extract_claims, FakeLLM, ExtractionError
from conform.engine import check_claim, Declared, Authoritative
from eval.harness import _load_authorities

nb = naive_extract(VENDOR_DOC)
print(f"  naive regex baseline  → {len(nb)} claims. It is looking for a rupee figure;")
print( "                          this drift is a claim about MEANING, not a number.\n")

try:
    claims = extract_claims(VENDOR_DOC)
    src = "Azure OpenAI (live)"
except ExtractionError:
    # No key present. Use the deterministic stand-in and SAY SO — a stubbed extractor
    # presented as a live one would be the drift this project exists to catch.
    claims = extract_claims(VENDOR_DOC, llm=FakeLLM([{
        "subject": "block_is_payment_guarantee", "value": True, "unit": "predicate",
        "scope": "per_block", "clause": "vendor-doc",
        "quote": "Funds are pre-blocked, ensuring you receive payment", "confidence": 0.95}]))
    src = "FakeLLM (deterministic stand-in — no AZURE_OPENAI_API_KEY present)"

print(f"  extractor [{src}]")
for c in claims:
    print(f"    → {c['subject']} = {c['value']}   ({c['unit']}, origin={c['origin']})")

auth = _load_authorities()
for c in claims:
    v = check_claim(Declared(subject=c["subject"], value=c["value"], unit=c["unit"],
                             scope=c["scope"], source="razorpay/docs/reserve-pay"), auth)
    print(f"\n  CONFORMANCE: {v.result}  {v.code}")
    print(f"    {v.circular} {v.clause}")
    print(f'    "{v.quote}"')
    print(f"    {v.detail}")

h(6, "The audit ledger")
ok, msg = Ledger(path='eval/ledger.jsonl').verify()
print(f"  {'OK' if ok else 'BROKEN'} — {msg}")
print("  5 tamper attacks: python3 -m eval.tamper")
srv.shutdown()
print()
