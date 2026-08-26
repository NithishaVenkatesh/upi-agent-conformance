"""Live-API probe. Network-marked: needs real rzp_test_ keys."""
import os, pytest
from gate.config import load_env
load_env()
pytestmark = pytest.mark.network
needs_keys = pytest.mark.skipif(
    not os.environ.get("RAZORPAY_KEY_ID", "").startswith("rzp_test_"),
    reason="needs rzp_test_ credentials")

@needs_keys
def test_probe_finds_the_enforced_bounds():
    from eval.probe_cases import probe
    cases, findings = probe(verbose=False)
    assert len(cases) == 2
    amt = [f for f in findings if f["parameter"] == "max_amount"][0]
    assert amt["api_enforces_paise"] == 1_500_000, "API accepted a different max_amount"
    days = [f for f in findings if f["parameter"] == "expire_at_days"][0]
    assert days["api_enforces"] == 91

@needs_keys
def test_probe_cases_are_detected_as_violations():
    """The point: these are positive cases the engine must catch, and the label came
    from Razorpay's own running code — not from us."""
    from eval.probe_cases import probe
    from eval.harness import run_batch
    cases, _ = probe(verbose=False)
    r = run_batch(cases, min_n=1)
    assert r.true_fail == 2 and r.detected == 2

@needs_keys
def test_probe_refuses_non_test_keys(monkeypatch):
    monkeypatch.setenv("RAZORPAY_KEY_ID", "rzp_live_nope")
    from eval.probe_cases import _auth
    with pytest.raises(RuntimeError, match="test-mode"):
        _auth()
