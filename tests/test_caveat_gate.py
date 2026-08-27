"""A number may not travel without the hedge its source attached to it.

INSTANCE #8, and the reason this is a schema and not a discipline:
research/11_final_selection/LIVE_API_FINDINGS.md §4 states plainly that we
CANNOT conclude ₹15,000 is unauthorised — a later circular may have raised the
SBMD cap, a different purpose code may apply (our own corpus shows PC-76 at
₹5 lakh), or test mode may differ from production. That hedge lived in prose.
The figures lived in JSON. Prose hedges do not travel; JSON fields do. So every
downstream renderer — a page, a script line, a disclosure — got the number
unhedged BY DEFAULT, and the plan written to prevent exactly this restated the
finding without its caveat.

Detection has a ceiling: it only catches what someone thinks to check. This is
the gate. A finding without `alternatives_not_excluded` cannot load, and a
renderer that emits an enforced bound without also emitting the caveat fails CI.

Per FAILURES.md #3/#4 — a check must prove it can fail before its pass is
believed — the gate is self-tested against known-bad fixtures below.
"""
import json, pytest
from eval.probe_cache import (load_cached_cases, ProbeCacheError,
                              render_comparison, CaveatMissing, REQUIRED_CAVEAT_FIELDS)

_FINDING = {
    "parameter": "max_amount",
    "api_enforces_paise": 1500000,
    "circular_authorises_paise": 1000000,
    "circular": "NPCI/UPI/OC No.228 Issuer §5",
    "framing": "the live rail permits 1.5x what the circular we can retrieve authorises",
    "not_claimed": "that Razorpay is wrong, or that ₹15,000 is unauthorised",
    "alternatives_not_excluded": [
        "a later circular may have raised the SBMD cap and is not in our corpus",
        "a different purpose code may apply (PC-76 operates at ₹5 lakh)",
        "test mode may use different limits from production",
    ],
}
_CASES = [{"id": "x", "source": "s", "text": "t", "label": "FAIL",
           "declared": {"subject": "upi_reserve_pay_block_limit", "value": 1500000,
                        "unit": "INR_paise", "scope": "per_block"}}]


def _write(tmp_path, findings):
    p = tmp_path / "probe.json"
    p.write_text(json.dumps({"probed_at": "2026-08-27T01:43:15",
                             "findings": findings, "cases": _CASES}))
    return str(p)


# --- the gate self-testing: it must prove it CAN fail ---

@pytest.mark.parametrize("missing", sorted(REQUIRED_CAVEAT_FIELDS))
def test_gate_rejects_a_finding_missing_any_required_caveat_field(tmp_path, missing):
    bad = {k: v for k, v in _FINDING.items() if k != missing}
    with pytest.raises(ProbeCacheError) as e:
        load_cached_cases(_write(tmp_path, [bad]))
    assert missing in str(e.value)


def test_gate_rejects_an_empty_alternatives_list(tmp_path):
    """The field being present but empty is the likeliest way to defeat this."""
    bad = dict(_FINDING, alternatives_not_excluded=[])
    with pytest.raises(ProbeCacheError) as e:
        load_cached_cases(_write(tmp_path, [bad]))
    assert "alternatives_not_excluded" in str(e.value)


def test_gate_rejects_a_blank_framing_string(tmp_path):
    bad = dict(_FINDING, framing="   ")
    with pytest.raises(ProbeCacheError):
        load_cached_cases(_write(tmp_path, [bad]))


def test_gate_passes_a_properly_hedged_finding(tmp_path):
    cases, meta = load_cached_cases(_write(tmp_path, [_FINDING]))
    assert len(cases) == 1 and len(meta["findings"]) == 1


# --- the renderer cannot emit a number without the hedge ---

def test_renderer_emits_the_caveat_alongside_the_comparison():
    out = render_comparison(_FINDING)
    assert "15,000" in out and "10,000" in out
    for alt in _FINDING["alternatives_not_excluded"]:
        assert alt in out, "every alternative must render, not just the count"
    assert "not" in out.lower()


def test_renderer_REFUSES_a_finding_with_no_alternatives():
    """If the hedge is absent the comparison must not render AT ALL. A page that
    silently drops the caveat is worse than a page that fails to load."""
    with pytest.raises(CaveatMissing):
        render_comparison(dict(_FINDING, alternatives_not_excluded=[]))


def test_renderer_REFUSES_when_the_field_is_absent_entirely():
    with pytest.raises(CaveatMissing):
        render_comparison({k: v for k, v in _FINDING.items()
                           if k != "alternatives_not_excluded"})


# --- the shipped artifact must itself pass the gate ---

def test_the_committed_probe_findings_carry_their_caveats():
    cases, meta = load_cached_cases()          # eval/probe_findings.json
    assert meta["findings"], "no findings in the committed cache"
    for f in meta["findings"]:
        for k in REQUIRED_CAVEAT_FIELDS:
            assert f.get(k), f"committed finding {f['parameter']!r} is missing {k}"


def test_the_committed_findings_render_with_their_hedge():
    _, meta = load_cached_cases()
    for f in meta["findings"]:
        out = render_comparison(f)
        assert "cannot rule out" in out.lower() or "not" in out.lower()


# ---------------------------------------------- M2: the gate must have a caller

def test_make_eval_renders_the_figures_through_the_gate(capsys):
    """FINDINGS.md M2. render_comparison() was tested and had no production caller —
    the enforcement arm of the caveat gate, protecting the number this submission
    leans on hardest, was wired to nothing. H4 proved in the same session that a
    generator and its validator drift apart precisely through gaps like this."""
    import eval.batch
    eval.batch.main()
    out = capsys.readouterr().out
    assert "WHAT THIS IS NOT" in out, "the figures reached stdout without their hedge"
    assert "We cannot rule out" in out
    assert "WHAT IT IS" in out


def test_the_shipped_figures_never_appear_without_their_caveat(capsys):
    """The assertion that actually protects the claim: if a rupee figure from the
    probe is on screen, the words that hedge it are on screen too."""
    import eval.batch
    from eval.probe_cache import load_cached_cases
    eval.batch.main()
    out = capsys.readouterr().out
    _, meta = load_cached_cases()
    for f in meta["findings"]:
        api = f.get("api_enforces_paise") or f.get("api_enforces")
        shown = f"₹{api // 100:,}" if "api_enforces_paise" in f else f"{api} days"
        if shown in out:
            assert f["not_claimed"][:40] in out, f"{shown} printed without not_claimed"


def test_a_finding_that_loses_its_hedge_breaks_make_eval_loudly(monkeypatch):
    """Fail loud, not quiet: a stripped caveat must stop the run, not print bare."""
    import eval.batch
    from eval.probe_cache import CaveatMissing
    bare = ({}, {"probed_at": "x", "findings": [
        {"parameter": "max_amount", "api_enforces_paise": 1500000,
         "circular_authorises_paise": 1000000, "circular": "OC-228"}]})
    monkeypatch.setattr(eval.batch, "load_cached_cases", lambda *a, **k: bare)
    with pytest.raises((CaveatMissing, Exception)):
        eval.batch.main()
