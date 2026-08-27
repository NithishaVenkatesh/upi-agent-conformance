"""Derive conformance cases from what the LIVE Razorpay API actually enforces.

This is the strongest case source in the project, and the only one where the declared
constraint is stated by the counterparty's own running code rather than its prose.

Method: binary-search each mandate parameter against the real test-mode API until it
rejects. The largest accepted value IS Razorpay's declared bound - not a claim about a
bound, the bound itself. That is then checked against the circular.

Nobody can argue the label came from us. The API said it; the circular judges it.
"""
import base64, json, os, time, urllib.error, urllib.request

from eval.probe_cache import REQUIRED_CAVEAT_FIELDS, _assert_hedged
from gate.config import load_env

load_env()
_API = "https://api.razorpay.com/v1"

# Three outcomes, because two silently corrupted the headline number. FINDINGS.md H1.
#
# _try_mandate used to return a bare bool: `s == 200`. So a 429, a 5xx, an auth blip
# or a network wobble produced exactly the same False as a genuine "max_amount exceeds
# permitted value", and _bisect moved its ceiling down on the strength of it. One
# injected transient below the true bound moved the reported figure from Rs.15,000 to
# Rs.12,587 — a 16% error, cached with a `probed_at` timestamp that makes it look
# freshly and cleanly verified.
#
# That figure is the project's headline external finding. Everything downstream rests
# on it. It is also the one place in this codebase that did not follow the fail-closed
# rule conform/engine.py applies everywhere else: an answer you cannot justify is
# UNDETERMINED, never a value.
ACCEPTED = "ACCEPTED"
REJECTED_BY_RULE = "REJECTED_BY_RULE"
INDETERMINATE = "INDETERMINATE"

# A rejection only narrows the search if the API says it is about the bound we are
# probing. Anything else — throttling, auth, an outage, a schema change — is the API
# declining to answer, not the API stating a limit.
_RULE_MARKERS = ("max_amount", "expire_at", "exceed", "greater than", "less than",
                 "should be", "must be", "invalid", "not supported", "maximum", "minimum")


class IndeterminateProbe(RuntimeError):
    """The API stopped answering. Raised rather than folded into a bound."""


class ProbeCaveatMissing(RuntimeError):
    """A regenerated finding had no hand-authored hedge to carry forward."""


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
        raw = e.read()
        try:
            return e.code, json.loads(raw)
        except (json.JSONDecodeError, ValueError):
            # FINDINGS.md L2: a proxy or CDN 502 is HTML, not JSON. Surface the status
            # with the body as text rather than dying mid-probe on a parse error.
            return e.code, {"error": {"description": raw.decode(errors="replace")[:300]}}
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return -1, {"error": {"description": f"transport failure: {e}"}}


def _customer(auth):
    s, c = _post("/customers", {"name": "Conformance Probe", "contact": "9000090009",
                                "email": f"probe{int(time.time())}@example.com",
                                "fail_existing": "0"}, auth)
    return c["id"]


def _classify(status, body):
    """(outcome, description). The whole point is that REJECTED_BY_RULE is earned,
    not assumed: a non-200 only narrows the search if the API says it is about the
    parameter we are probing."""
    if status == 200:
        return ACCEPTED, None
    desc = (body.get("error", {}) or {}).get("description", "") or ""
    if status == 429 or status >= 500 or status < 0:
        return INDETERMINATE, desc or f"HTTP {status}"
    if status in (401, 403):
        return INDETERMINATE, desc or f"auth failure (HTTP {status})"
    low = desc.lower()
    if status == 400 and any(m in low for m in _RULE_MARKERS):
        return REJECTED_BY_RULE, desc
    # A 4xx we cannot attribute to the bound. Refuse to read it as one.
    return INDETERMINATE, desc or f"unattributable HTTP {status}"


def _try_mandate(auth, cid, max_minor, days):
    tok = {"frequency": "as_presented", "type": "single_block_multiple_debit",
           "max_amount": max_minor, "expire_at": int(time.time()) + 86400 * days}
    s, b = _post("/orders", {"amount": 10000, "currency": "INR", "method": "upi",
                             "customer_id": cid, "receipt": f"p{int(time.time()*1000)%10**9}",
                             "token": tok}, auth)
    return _classify(s, b)


def _bisect(fn, lo, hi, tol=1):
    """Largest value the API still accepts, or a refusal to answer.

    `fn` returns one of ACCEPTED / REJECTED_BY_RULE / INDETERMINATE.

    Two guards, both from FINDINGS.md:
      H1 — INDETERMINATE aborts the search. A throttle or an outage is the API
           declining to answer; folding it into a ceiling invents a bound.
      H2 — the ceiling is checked. The loop narrows `lo` toward `hi` and never tests
           `hi`, so an unbounded parameter used to return hi-1 and be reported as a
           precise discovery: search 100 to 10,000,000 paise against an API that
           accepts everything yielded "the API accepts up to Rs.99,999". An artifact
           of our own search range, presented as a property of the counterparty.
    """
    r = fn(lo)
    if r == INDETERMINATE:
        raise IndeterminateProbe(
            f"the API stopped answering at the floor ({lo}); no bound can be claimed")
    if r == REJECTED_BY_RULE:
        return None                      # genuinely rejects even the smallest value
    while hi - lo > tol:
        mid = (lo + hi) // 2
        r = fn(mid)
        if r == INDETERMINATE:
            raise IndeterminateProbe(
                f"the API stopped answering at {mid} (searched {lo}..{hi}). Refusing to "
                f"report a bound: a throttle is not a limit, and a figure derived from "
                f"one would be cached as though it were verified.")
        lo, hi = (mid, hi) if r == ACCEPTED else (lo, mid)
    return lo


def _bisect_checked(fn, lo, hi, tol=1):
    """_bisect plus the H2 ceiling assertion, which needs the original `hi`."""
    result = _bisect(fn, lo, hi, tol)
    if result is not None and result >= hi - tol:
        raise IndeterminateProbe(
            f"search hit its own ceiling: the API accepted {result}, the highest value "
            f"probed was {hi}. This is not a discovered bound, it is the edge of our "
            f"search range. Raise `hi` and re-probe.")
    return result


def _authority(subject, unit):
    """The bound the CIRCULAR sets, read from the checksummed store.

    FINDINGS.md M1. These were hardcoded — `"FAIL" if max_amt > 1_000_000` and
    `if max_days > 90` — duplicating OC228-5-block-max and OC228-5-block-days as
    magic numbers in this file. Low severity as a bug; the store and the constants
    agreed. High severity as a CLAIM, because this module's own docstring says
    "Nobody can argue the label came from us. The API said it; the circular judges
    it." The declared value did come from the API. The LABEL came from a constant we
    typed. That is a small live instance of the exact pattern FAILURES.md is built
    around, sitting inside the machinery that detects it.

    Now the circular judges it, literally: same JSON the conformance engine reads."""
    from eval.harness import _load_authorities
    for a in _load_authorities():
        if a.subject == subject and a.unit == unit:
            return a
    raise RuntimeError(
        f"no authority for {subject!r}/{unit!r} in the claim store — refusing to label "
        f"a probed bound against a constant. Add the claim, do not hardcode the number.")


def probe(verbose=True):
    """Returns (cases, findings). Each case is a real declared bound from the live API."""
    auth = _auth()
    cid = _customer(auth)
    findings, cases = [], []
    amt_auth = _authority("upi_reserve_pay_block_limit", "INR_paise")
    day_auth = _authority("upi_reserve_pay_block_validity", "days")

    max_amt = _bisect_checked(lambda v: _try_mandate(auth, cid, v, 30)[0], 100_00, 100_000_00)
    if verbose:
        print(f"  live API accepts max_amount up to ₹{max_amt//100:,}")
    cases.append({
        "id": "live-api:sbmd-max-amount",
        "source": "razorpay live test API (probed, not documented)",
        "text": f"API accepts token.max_amount up to {max_amt} paise for single_block_multiple_debit",
        "declared": {"subject": "upi_reserve_pay_block_limit", "value": max_amt,
                     "unit": "INR_paise", "scope": "per_block"},
        "label": "FAIL" if max_amt > amt_auth.value else "PASS",
        "note": f"the bound Razorpay's own code enforces, vs {amt_auth.circular} "
                f"{amt_auth.clause}",
    })
    findings.append({"parameter": "max_amount", "api_enforces_paise": max_amt,
                     "circular_authorises_paise": amt_auth.value,
                     "circular": f"{amt_auth.circular} {amt_auth.clause}"})

    max_days = _bisect_checked(lambda d: _try_mandate(auth, cid, 500_000, d)[0], 1, 400)
    if verbose:
        print(f"  live API accepts expire_at up to {max_days} days")
    cases.append({
        "id": "live-api:sbmd-validity",
        "source": "razorpay live test API (probed, not documented)",
        "text": f"API accepts token.expire_at up to {max_days} days",
        "declared": {"subject": "upi_reserve_pay_block_validity", "value": max_days,
                     "unit": "days", "scope": "per_block"},
        "label": "FAIL" if max_days > day_auth.value else "PASS",
        "note": f"vs {day_auth.circular} {day_auth.clause} {day_auth.quote!r}",
    })
    findings.append({"parameter": "expire_at_days", "api_enforces": max_days,
                     "circular_authorises": day_auth.value,
                     "circular": f"{day_auth.circular} {day_auth.clause}"})
    return cases, findings


def carry_caveats(findings, prior_path="eval/probe_findings.json"):
    """Re-attach each finding's hedge from the committed file, by parameter name.

    FINDINGS.md H4. probe() produces figures; the caveats are hand-authored prose that
    lives only in the committed artifact. So `make probe` used to overwrite the file
    with findings stripped of the three required fields — producing a cache that
    eval/probe_cache.py then REFUSES to load. The regeneration path and the validation
    path disagreed, and the tempting way out of that is to weaken the gate.

    A genuinely NEW parameter has no prior hedge and cannot be auto-hedged: this raises
    instead, so a human writes the caveat before the number can ship. That is the point
    of FAILURES.md #8 — the hedge is not decoration to be regenerated, it is the part
    a machine cannot supply."""
    prior = {}
    if os.path.exists(prior_path):
        try:
            for f in json.load(open(prior_path)).get("findings", []):
                prior[f.get("parameter")] = f
        except (json.JSONDecodeError, OSError):
            prior = {}

    out = []
    for f in findings:
        was = prior.get(f["parameter"])
        if not was:
            raise ProbeCaveatMissing(
                f"new parameter {f['parameter']!r} has no caveat in {prior_path}. "
                f"A probed bound may not ship without `framing`, `not_claimed` and "
                f"`alternatives_not_excluded` — write them by hand, then re-run. "
                f"See FAILURES.md #8.")
        merged = dict(f)
        for k in REQUIRED_CAVEAT_FIELDS:
            merged[k] = was.get(k)
        _assert_hedged(merged, prior_path)

        # The hedge was written about a SPECIFIC figure. If the number moved, saying so
        # is the caveat's job too — silently reusing prose written for Rs.15,000 to
        # describe a different number is exactly the drift this gate exists to stop.
        old_api = was.get("api_enforces_paise", was.get("api_enforces"))
        new_api = merged.get("api_enforces_paise", merged.get("api_enforces"))
        if old_api != new_api:
            merged["caveat_authored_for"] = old_api
            merged["value_changed_since_caveat"] = True
            print(f"  !! {f['parameter']}: {old_api} -> {new_api}. The carried caveat was "
                  f"written for the old figure; re-read it before this ships.")
        out.append(merged)
    return out


if __name__ == "__main__":
    print("probing the live Razorpay test API for its enforced mandate bounds...")
    try:
        cases, findings = probe()
    except IndeterminateProbe as e:
        print(f"\n  ABORTED — {e}")
        print("  No file written. A bound we cannot justify is not written down.")
        raise SystemExit(2)

    findings = carry_caveats(findings)
    print()
    for f in findings:
        api = f.get("api_enforces_paise") or f.get("api_enforces")
        circ = f.get("circular_authorises_paise") or f.get("circular_authorises")
        verdict = "EXCEEDS" if api > circ else "within"
        print(f"  {f['parameter']:16} API={api:<9} circular={circ:<9} {verdict}  [{f['circular']}]")
    json.dump({"probed_at": time.strftime("%Y-%m-%dT%H:%M:%S"), "findings": findings,
               "cases": cases}, open("eval/probe_findings.json", "w"), indent=1)
    print("\n written: eval/probe_findings.json")
