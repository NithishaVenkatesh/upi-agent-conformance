"""The probe must refuse to invent a bound.

FINDINGS.md H1 and H2. The Rs.15,000 figure these guards protect is the project's
headline external finding — the /drift scene, the disclosure draft and the positive
class in eval/report.json all rest on it. It was produced by a binary search that
could not tell a rate-limit from a rule, and could not tell a discovered bound from
the edge of its own search range.

No network: every test drives the classifier and the search with synthetic responses.
"""
import pytest

from eval.probe_cases import (ACCEPTED, REJECTED_BY_RULE, INDETERMINATE,
                              IndeterminateProbe, _bisect, _bisect_checked, _classify)


# ---------------------------------------------------------------- H1: classification

def test_rule_rejection_is_the_only_thing_that_narrows_the_search():
    out, _ = _classify(400, {"error": {"description":
                                       "max_amount exceeds the permitted value"}})
    assert out == REJECTED_BY_RULE


@pytest.mark.parametrize("status,body,why", [
    (429, {"error": {"description": "Too many requests"}}, "rate limit"),
    (500, {"error": {"description": "we are having trouble"}}, "server error"),
    (502, {"error": {"description": "<html>bad gateway</html>"}}, "proxy html"),
    (401, {"error": {"description": "auth failed"}}, "auth"),
    (-1, {"error": {"description": "transport failure: timed out"}}, "network"),
    (400, {"error": {"description": "customer_id is required"}}, "4xx about another field"),
])
def test_everything_that_is_not_a_rule_is_indeterminate(status, body, why):
    """The old code mapped every one of these to the same False a real bound
    rejection produced."""
    out, _ = _classify(status, body)
    assert out == INDETERMINATE, f"{why} was read as a statement about the bound"


def test_a_transient_cannot_silently_lower_the_reported_bound():
    """THE REGRESSION. One injected transient below the true bound moved the reported
    figure from Rs.15,000 to Rs.12,587 — 16% error, cached as verified."""
    TRUE = 1_500_000
    seen = []

    def flaky(v):
        seen.append(v)
        if len(seen) == 4:
            return INDETERMINATE            # one 429, mid-search
        return ACCEPTED if v <= TRUE else REJECTED_BY_RULE

    with pytest.raises(IndeterminateProbe) as e:
        _bisect_checked(flaky, 100_00, 100_000_00)
    assert "throttle is not a limit" in str(e.value)


def test_a_clean_search_still_finds_the_exact_bound():
    """Fail-closed must not mean fail-always: the real probe has to still work."""
    TRUE = 1_500_000
    got = _bisect_checked(lambda v: ACCEPTED if v <= TRUE else REJECTED_BY_RULE,
                          100_00, 100_000_00)
    assert got == TRUE


def test_indeterminate_at_the_floor_aborts():
    with pytest.raises(IndeterminateProbe):
        _bisect_checked(lambda v: INDETERMINATE, 100_00, 100_000_00)


# ------------------------------------------------------------------- H2: the ceiling

def test_hitting_our_own_search_ceiling_is_not_a_discovery():
    """An API that accepts everything used to yield 'accepts up to Rs.99,999' —
    ceiling minus one, an artifact of our search range reported as the
    counterparty's limit."""
    with pytest.raises(IndeterminateProbe) as e:
        _bisect_checked(lambda v: ACCEPTED, 100_00, 100_000_00)
    assert "edge of our" in str(e.value)


def test_the_days_search_has_the_same_guard():
    with pytest.raises(IndeterminateProbe):
        _bisect_checked(lambda d: ACCEPTED, 1, 400)


def test_a_bound_well_inside_the_ceiling_is_reported_normally():
    """The committed values (Rs.15,000 of Rs.100,000; 91 of 400 days) sit comfortably
    inside their ceilings — this pins that the guard does not fire on them."""
    assert _bisect_checked(lambda v: ACCEPTED if v <= 1_500_000 else REJECTED_BY_RULE,
                           100_00, 100_000_00) == 1_500_000
    assert _bisect_checked(lambda d: ACCEPTED if d <= 91 else REJECTED_BY_RULE,
                           1, 400) == 91


def test_rejects_even_the_floor_returns_none_not_a_bound():
    assert _bisect_checked(lambda v: REJECTED_BY_RULE, 100_00, 100_000_00) is None


# ------------------------------------- H4: regeneration must not strip the hedge

def _prior(tmp_path, api_value=1_500_000):
    import json
    p = tmp_path / "prior.json"
    p.write_text(json.dumps({"findings": [{
        "parameter": "max_amount", "api_enforces_paise": api_value,
        "circular_authorises_paise": 1_000_000, "circular": "OC No.228 Issuer §5",
        "framing": "the live rail permits more than the circular we can retrieve",
        "not_claimed": "that Razorpay is wrong",
        "alternatives_not_excluded": ["a later circular may have raised the cap"]}]}))
    return str(p)


def test_regenerated_findings_carry_their_caveats_forward(tmp_path):
    """THE REGRESSION. `make probe` used to overwrite the artifact with bare figures,
    producing a cache that eval/probe_cache.py then refused to load. The generator and
    the validator disagreed, and the easy way out of that is to weaken the gate."""
    from eval.probe_cases import carry_caveats
    fresh = [{"parameter": "max_amount", "api_enforces_paise": 1_500_000,
              "circular_authorises_paise": 1_000_000, "circular": "OC No.228 Issuer §5"}]
    out = carry_caveats(fresh, prior_path=_prior(tmp_path))
    assert out[0]["framing"] and out[0]["not_claimed"]
    assert out[0]["alternatives_not_excluded"]


def test_the_result_of_regeneration_passes_the_gate_that_reads_it(tmp_path):
    """The two paths must agree — that is the whole finding."""
    from eval.probe_cases import carry_caveats
    from eval.probe_cache import _assert_hedged
    fresh = [{"parameter": "max_amount", "api_enforces_paise": 1_500_000,
              "circular_authorises_paise": 1_000_000, "circular": "OC No.228 Issuer §5"}]
    for f in carry_caveats(fresh, prior_path=_prior(tmp_path)):
        _assert_hedged(f)          # must not raise


def test_a_brand_new_parameter_cannot_be_auto_hedged(tmp_path):
    """A machine can regenerate a number. It cannot author the hedge. FAILURES.md #8."""
    from eval.probe_cases import carry_caveats, ProbeCaveatMissing
    fresh = [{"parameter": "frequency_cap", "api_enforces": 12,
              "circular_authorises": 4, "circular": "OC No.228"}]
    with pytest.raises(ProbeCaveatMissing) as e:
        carry_caveats(fresh, prior_path=_prior(tmp_path))
    assert "write them by hand" in str(e.value)


def test_a_moved_figure_is_flagged_not_silently_re_hedged(tmp_path):
    """The caveat prose was authored about a specific number. If the probe returns a
    different one, reusing that prose unexamined is the drift the gate exists to stop."""
    from eval.probe_cases import carry_caveats
    fresh = [{"parameter": "max_amount", "api_enforces_paise": 2_000_000,
              "circular_authorises_paise": 1_000_000, "circular": "OC No.228 Issuer §5"}]
    out = carry_caveats(fresh, prior_path=_prior(tmp_path, api_value=1_500_000))
    assert out[0]["value_changed_since_caveat"] is True
    assert out[0]["caveat_authored_for"] == 1_500_000


def test_the_shipped_artifact_still_passes_its_own_gate():
    """Guards the committed file itself, not a fixture."""
    from eval.probe_cache import load_cached_cases
    cases, meta = load_cached_cases()
    assert cases and meta["findings"]
