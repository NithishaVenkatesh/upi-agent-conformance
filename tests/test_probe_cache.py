"""The eval's positive class must not depend on a live network call at judging time.

Two defects this pins:

(1) eval/cases.py wrapped the ONLY source of positive cases in a bare
    `except Exception: return []`. A missing key, a rate-limit, a schema change,
    or any bug in probe_cases.py silently produced zero positive cases, which
    flipped eval/harness.py to VACUOUS — and the batch then blamed its own corpus
    for a swallowed exception. Sixth instance of this project's signature shape:
    a failure that reports as a finding.

(2) probe() fired ~33 live order-creation calls on EVERY `make eval`, undeclared
    and uncached, while eval/probe_findings.json — written by __main__ only — was
    never read by anything. The cached artifact was decorative.

The fix inverts it: the cache is the source, it is committed, and `make eval`
therefore needs no keys and no network. Probing is an explicit act (`make probe`).
Absence of the cache is LOUD.
"""
import json, pytest
from eval.probe_cache import load_cached_cases, ProbeCacheError

GOOD = {
    "probed_at": "2026-08-27T01:43:15",
    "findings": [{"parameter": "max_amount", "api_enforces_paise": 1500000,
                  "circular_authorises_paise": 1000000,
                  "circular": "NPCI/UPI/OC No.228 Issuer §5"}],
    "cases": [{"id": "live-api:sbmd-max-amount", "source": "razorpay live test API",
               "text": "t", "label": "FAIL",
               "declared": {"subject": "upi_reserve_pay_block_limit", "value": 1500000,
                            "unit": "INR_paise", "scope": "per_block"}}],
}


def _write(tmp_path, obj):
    p = tmp_path / "probe.json"
    p.write_text(json.dumps(obj) if not isinstance(obj, str) else obj)
    return str(p)


def test_loads_cases_from_the_committed_cache(tmp_path):
    cases, meta = load_cached_cases(_write(tmp_path, GOOD))
    assert len(cases) == 1
    assert cases[0]["id"] == "live-api:sbmd-max-amount"
    assert meta["probed_at"] == "2026-08-27T01:43:15"


def test_missing_cache_is_LOUD_and_names_the_fix(tmp_path):
    with pytest.raises(ProbeCacheError) as e:
        load_cached_cases(str(tmp_path / "absent.json"))
    assert "make probe" in str(e.value)


def test_malformed_cache_is_LOUD(tmp_path):
    with pytest.raises(ProbeCacheError):
        load_cached_cases(_write(tmp_path, "{not json"))


def test_cache_with_no_cases_is_LOUD_not_an_empty_list(tmp_path):
    """The exact shape of the old bug: zero positive cases must be an ERROR,
    never a quiet [] that the harness then reports as VACUOUS."""
    bad = dict(GOOD, cases=[])
    with pytest.raises(ProbeCacheError) as e:
        load_cached_cases(_write(tmp_path, bad))
    assert "no cases" in str(e.value).lower()


def test_cache_missing_the_cases_key_is_LOUD(tmp_path):
    bad = {k: v for k, v in GOOD.items() if k != "cases"}
    with pytest.raises(ProbeCacheError):
        load_cached_cases(_write(tmp_path, bad))


def test_harvest_reads_the_cache_and_never_touches_the_network(monkeypatch):
    """A judge with no keys and no network must still get the positive class."""
    import eval.cases as C

    def _explode(*a, **k):
        raise AssertionError("harvest() must not probe the live API")
    monkeypatch.setattr("eval.probe_cases.probe", _explode, raising=False)
    monkeypatch.delenv("RAZORPAY_KEY_ID", raising=False)

    cases, prov = C.harvest(include_discovery_set=False)
    ids = {c["id"] for c in cases}
    assert "live-api:sbmd-max-amount" in ids
    assert prov["live_api_probed_bounds"] >= 1
    assert "live_api_probed_at" in prov, "provenance must date the cached probe"


def test_the_positive_class_survives_a_missing_key(monkeypatch):
    """Regression for the judging-time risk: no key must NOT empty the positive class."""
    import eval.cases as C
    monkeypatch.delenv("RAZORPAY_KEY_ID", raising=False)
    cases, _ = C.harvest(include_discovery_set=False)
    assert any(c["label"] == "FAIL" for c in cases), "positive class was silently emptied"
