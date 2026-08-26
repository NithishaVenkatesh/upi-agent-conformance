"""Eval harness tests. The harness must be honest BY CONSTRUCTION — the field's
defining failure is a compromised measurement target, so these tests pin the
properties that stop us reproducing it."""
import pytest
from eval.harness import run_batch, Report

CASES = [
  {"id":"c1","source":"razorpay/acp-sep-216","text":"limit of ₹15,000",
   "declared":{"subject":"upi_circle_full_delegation","value":1500000,"unit":"INR_paise","scope":"per_transaction"},
   "label":"FAIL"},
  {"id":"c2","source":"npci/oc-201","text":"limit of ₹5000",
   "declared":{"subject":"upi_circle_full_delegation","value":500000,"unit":"INR_paise","scope":"per_transaction"},
   "label":"PASS"},
  {"id":"c3","source":"cashfree/docs","text":"₹10,000 per month",
   "declared":{"subject":"upi_reserve_pay_block_limit","value":1000000,"unit":"INR_paise","scope":"per_month"},
   "label":"FAIL"},
  {"id":"c4","source":"unknown/doc","text":"some other limit",
   "declared":{"subject":"not_in_store","value":1,"unit":"INR_paise","scope":"per_block"},
   "label":"UNDETERMINED"},
]

def test_reports_effective_n_not_just_headline():
    r = run_batch(CASES)
    assert r.attempted == 4 and r.scored == 3      # UNDETERMINED is not scored
    assert r.effective_n_note

def test_undetermined_counted_separately_never_as_pass():
    """Abstentions must leave the scored denominator, not quietly join the numerator.
    (An earlier version of this test compared integer VALUES, which collide by
    coincidence and assert nothing. Test the invariant, not the numbers.)"""
    r = run_batch(CASES)
    # Two distinct things, deliberately separate:
    #   unlabelled   — no ground truth exists for this case; it cannot test anything
    #   undetermined — ground truth exists, and the engine abstained
    # Both must leave the scored denominator; only the second is a system behaviour.
    assert r.unlabelled == 1
    assert r.scored == r.attempted - r.unlabelled - r.undetermined
    assert r.true_pass + r.true_fail == r.scored
    assert r.detected <= r.true_fail

def test_induced_harm_is_reported():
    """Correct claims we wrongly refused. Must be a first-class number."""
    r = run_batch(CASES)
    assert hasattr(r, "induced_harm")
    assert isinstance(r.induced_harm, int)

def test_baseline_is_run_alongside():
    r = run_batch(CASES)
    assert r.baseline_detected is not None
    assert r.baseline_detected <= r.detected, "baseline should not beat the system"

def test_refuses_to_report_on_empty_batch():
    """A metric over nothing must not look like a pass."""
    with pytest.raises(ValueError):
        run_batch([])

def test_refuses_below_minimum_n():
    """The architecture commits to N>=50. Reporting a headline on 4 would be the
    cherry-pick the rubric explicitly warns about."""
    r = run_batch(CASES, min_n=50)
    assert r.headline_suppressed is True
    assert "50" in r.suppression_reason

def test_undetermined_LABEL_leaves_the_denominator():
    """Regression: 8 real cases labelled UNDETERMINED inflated `scored` while belonging
    to no class, violating the invariant the suite already asserted. The old fixture had
    no UNDETERMINED labels, so the test was fixture-blind and passed anyway."""
    cases = CASES + [{"id":"u1","source":"x","text":"",
                      "declared":{"subject":"upi_reserve_pay_block_limit","value":None,
                                  "unit":"INR_paise","scope":"per_block"},
                      "label":"UNDETERMINED"}]
    r = run_batch(cases)
    assert r.unlabelled == 2          # one already in CASES, plus the one added here
    assert r.true_pass + r.true_fail == r.scored, "unlabelled case leaked into scored"

def test_empty_positive_class_is_vacuous_not_zero_percent():
    """A detection rate of 0/0 measures nothing and must be refused, not printed."""
    controls_only = [c for c in CASES if c["label"] == "PASS"]
    r = run_batch(controls_only, min_n=1)
    assert r.vacuous is True
    assert r.headline_suppressed is True
    assert "VACUOUS" in r.suppression_reason

def test_report_is_deterministic():
    assert run_batch(CASES).as_dict() == run_batch(CASES).as_dict()

def test_every_detection_carries_a_citation():
    r = run_batch(CASES)
    for d in r.detections:
        assert d["clause"] and d["circular"]
