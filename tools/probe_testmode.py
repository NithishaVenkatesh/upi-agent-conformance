#!/usr/bin/env python3
"""
Razorpay test-mode capability probe.

Answers the architecture-gating question:
  Can test mode create a UPI Reserve Pay mandate order
  (token.type = single_block_multiple_debit) end to end?

Safety:
  - REFUSES to run with anything other than an rzp_test_ key.
  - Creates orders only (no capture, no payout, no settlement, no money movement).
    Test-mode orders are free and disposable.
Usage:
  export RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=yyy
  python3 tools/probe_testmode.py
"""
import os, sys, json, base64, time, urllib.request, urllib.error

# load .env if present (never commit it; .gitignore covers it)
_envf = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(_envf):
    for _line in open(_envf):
        _line = _line.strip()
        if not _line or _line.startswith("#") or "=" not in _line:
            continue
        _k, _v = _line.split("=", 1)
        os.environ.setdefault(_k.strip(), _v.strip().strip('"').strip("'"))

KEY = os.environ.get("RAZORPAY_KEY_ID", "").strip()
SEC = os.environ.get("RAZORPAY_KEY_SECRET", "").strip()
BASE = "https://api.razorpay.com/v1"

if not KEY or not SEC:
    sys.exit("MISSING CREDENTIALS: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET")
if not KEY.startswith("rzp_test_"):
    sys.exit(f"REFUSING TO RUN: key is {KEY[:8]}… — this probe is test-mode only. "
             "A live key could move real money.")

AUTH = base64.b64encode(f"{KEY}:{SEC}".encode()).decode()
results = []

def call(method, path, body=None, note=""):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Basic {AUTH}")
    req.add_header("Content-Type", "application/json")
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.status, json.loads(r.read().decode() or "{}"), time.time()-t0
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try: payload = json.loads(raw)
        except Exception: payload = {"raw": raw[:400]}
        return e.code, payload, time.time()-t0
    except Exception as e:
        return -1, {"error": str(e)}, time.time()-t0

def record(name, gating, status, payload, dt, expect_ok=(200,201)):
    ok = status in expect_ok
    err = ""
    if not ok:
        d = payload.get("error", payload)
        err = f"{d.get('code','')}/{d.get('description', json.dumps(d)[:160])}" if isinstance(d, dict) else str(d)[:160]
    results.append(dict(name=name, gating=gating, ok=ok, status=status, err=err, secs=round(dt,2)))
    flag = "GATING" if gating else "info  "
    print(f"[{'PASS' if ok else 'FAIL'}] {flag} {name}  (HTTP {status}, {dt:.2f}s)")
    if not ok: print(f"           → {err}")
    return ok, payload

print("=" * 78)
print(f"Razorpay test-mode probe · key {KEY[:14]}… · {time.strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 78)

# 1. auth / baseline read
record("auth + read (fetch orders)", False, *call("GET", "/orders?count=1"))

# 2. plain order — proves write works at all
ok, plain = record("create PLAIN order (₹100)", False,
                   *call("POST", "/orders", {"amount": 10000, "currency": "INR",
                                             "receipt": f"probe_{int(time.time())}"}))

# 3. customer — prerequisite for a mandate order
ok, cust = record("create customer", False,
                  *call("POST", "/customers", {"name": "Probe User",
                                               "contact": "9000090000",
                                               "email": f"probe{int(time.time())}@example.com",
                                               "fail_existing": "0"}))
cust_id = cust.get("id") if ok else None

# 4. ===== THE GATE =====
if cust_id:
    mandate = {
        "amount": 10000, "currency": "INR", "method": "upi",
        "customer_id": cust_id,
        "receipt": f"mandate_{int(time.time())}",
        "token": {"max_amount": 500000,          # ₹5,000 — NPCI OC-201 per-txn cap
                  "frequency": "as_presented",
                  "type": "single_block_multiple_debit",
                  "expire_at": int(time.time()) + 60*60*24*30},
    }
    record("*** CREATE UPI RESERVE PAY MANDATE ORDER ***", True,
           *call("POST", "/orders", mandate))
else:
    results.append(dict(name="*** CREATE UPI RESERVE PAY MANDATE ORDER ***", gating=True,
                        ok=False, status=0, err="skipped — no customer_id", secs=0))
    print("[SKIP] GATING mandate order — customer creation failed")

# 5. fallback rail: UPI Autopay / subscriptions surface
record("subscriptions API reachable", False, *call("GET", "/subscriptions?count=1"))
record("plans API reachable",         False, *call("GET", "/plans?count=1"))
# 6. adjacent surfaces referenced by the tracks
record("settlements API (test mode)", False, *call("GET", "/settlements?count=1"))
record("disputes API (test mode)",    False, *call("GET", "/disputes?count=1"))

print("\n" + "=" * 78)
gate = [r for r in results if r["gating"]]
print("VERDICT")
for r in gate:
    print(f"  {'✅ SUPPORTED' if r['ok'] else '❌ NOT SUPPORTED'} — {r['name']}")
    if not r["ok"]: print(f"     reason: {r['err']}")
print(f"\n  {sum(1 for r in results if r['ok'])}/{len(results)} checks passed")
print("=" * 78)

out = "research/00_competition_context/testmode_probe_results.json"
os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump({"run_at": time.strftime("%Y-%m-%dT%H:%M:%S"), "key_prefix": KEY[:14],
           "results": results}, open(out, "w"), indent=2)
print(f"\nwritten: {out}")
sys.exit(0 if all(r["ok"] for r in gate) else 1)
