"""Derive conformance cases from what the LIVE Razorpay API actually enforces.

This is the strongest case source in the project, and the only one where the declared
constraint is stated by the counterparty's own running code rather than its prose.

Method: binary-search each mandate parameter against the real test-mode API until it
rejects. The largest accepted value IS Razorpay's declared bound - not a claim about a
bound, the bound itself. That is then checked against the circular.

Nobody can argue the label came from us. The API said it; the circular judges it.
"""
import base64, json, os, time, urllib.error, urllib.request

from gate.config import load_env

load_env()
_API = "https://api.razorpay.com/v1"


def _auth():
    kid = os.environ.get("RAZORPAY_KEY_ID", "")
    if not kid.startswith("rzp_test_"):
        raise RuntimeError("test-mode keys required; refusing to probe with anything else")
    return base64.b64encode(
        f"{kid}:{os.environ['RAZORPAY_KEY_SECRET']}".encode()).decode()


def _post(path, body, auth):
    r = urllib.request.Request(f"{_API}{path}", data=json.dumps(body).encode(), method="POST")
    r.add_header("Authorization", f"Basic {auth}")
    r.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(r, timeout=25) as x:
            return 200, json.loads(x.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def _customer(auth):
    s, c = _post("/customers", {"name": "Conformance Probe", "contact": "9000090009",
                                "email": f"probe{int(time.time())}@example.com",
                                "fail_existing": "0"}, auth)
    return c["id"]


def _try_mandate(auth, cid, max_minor, days):
    tok = {"frequency": "as_presented", "type": "single_block_multiple_debit",
           "max_amount": max_minor, "expire_at": int(time.time()) + 86400 * days}
    s, b = _post("/orders", {"amount": 10000, "currency": "INR", "method": "upi",
                             "customer_id": cid, "receipt": f"p{int(time.time()*1000)%10**9}",
                             "token": tok}, auth)
    return s == 200, (b.get("error", {}).get("description") if s != 200 else None)


def _bisect(fn, lo, hi, tol=1):
    """Largest value the API still accepts."""
    if not fn(lo):
        return None
    while hi - lo > tol:
        mid = (lo + hi) // 2
        if fn(mid):
            lo = mid
        else:
            hi = mid
    return lo


def probe(verbose=True):
    """Returns (cases, findings). Each case is a real declared bound from the live API."""
    auth = _auth()
    cid = _customer(auth)
    findings, cases = [], []

    max_amt = _bisect(lambda v: _try_mandate(auth, cid, v, 30)[0], 100_00, 100_000_00)
    if verbose:
        print(f"  live API accepts max_amount up to ₹{max_amt//100:,}")
    cases.append({
        "id": "live-api:sbmd-max-amount",
        "source": "razorpay live test API (probed, not documented)",
        "text": f"API accepts token.max_amount up to {max_amt} paise for single_block_multiple_debit",
        "declared": {"subject": "upi_reserve_pay_block_limit", "value": max_amt,
                     "unit": "INR_paise", "scope": "per_block"},
        "label": "FAIL" if max_amt > 1_000_000 else "PASS",
        "note": "the bound Razorpay's own code enforces, vs OC-228 Issuer §5",
    })
    findings.append({"parameter": "max_amount", "api_enforces_paise": max_amt,
                     "circular_authorises_paise": 1_000_000,
                     "circular": "NPCI/UPI/OC No.228 Issuer §5"})

    max_days = _bisect(lambda d: _try_mandate(auth, cid, 500_000, d)[0], 1, 400)
    if verbose:
        print(f"  live API accepts expire_at up to {max_days} days")
    cases.append({
        "id": "live-api:sbmd-validity",
        "source": "razorpay live test API (probed, not documented)",
        "text": f"API accepts token.expire_at up to {max_days} days",
        "declared": {"subject": "upi_reserve_pay_block_validity", "value": max_days,
                     "unit": "days", "scope": "per_block"},
        "label": "FAIL" if max_days > 90 else "PASS",
        "note": "vs OC-228 Issuer §5 'up to 90 days'",
    })
    findings.append({"parameter": "expire_at_days", "api_enforces": max_days,
                     "circular_authorises": 90,
                     "circular": "NPCI/UPI/OC No.228 Issuer §5"})
    return cases, findings


if __name__ == "__main__":
    print("probing the live Razorpay test API for its enforced mandate bounds...")
    cases, findings = probe()
    print()
    for f in findings:
        api = f.get("api_enforces_paise") or f.get("api_enforces")
        circ = f.get("circular_authorises_paise") or f.get("circular_authorises")
        verdict = "EXCEEDS" if api > circ else "within"
        print(f"  {f['parameter']:16} API={api:<9} circular={circ:<9} {verdict}  [{f['circular']}]")
    json.dump({"probed_at": time.strftime("%Y-%m-%dT%H:%M:%S"), "findings": findings,
               "cases": cases}, open("eval/probe_findings.json", "w"), indent=1)
    print("\n written: eval/probe_findings.json")
