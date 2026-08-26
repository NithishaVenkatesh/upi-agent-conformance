"""Conformance engine tests.

Fixtures are the four REAL drifts found in published documents, plus our own (#5).
If the engine cannot catch these, it catches nothing that matters.
"""
import pytest
from conform.engine import check_claim, Verdict, Declared, Authoritative

AUTH = {
    "block_limit": Authoritative(subject="upi_reserve_pay_block_limit", value=1000000,
        unit="INR_paise", scope="per_block", circular="NPCI/UPI/OC No.228", clause="Issuer §5",
        quote="The block created to be maximum of Rs.10,000 of block limit and up to 90 days."),
    "circle_txn": Authoritative(subject="upi_circle_full_delegation", value=500000,
        unit="INR_paise", scope="per_transaction", circular="NPCI/UPI/OC No.201", clause="§7",
        quote="maximum per transaction limit of ₹5000"),
    "circle_month": Authoritative(subject="upi_circle_full_delegation", value=1500000,
        unit="INR_paise", scope="per_month_per_delegation", circular="NPCI/UPI/OC No.201",
        clause="§7", quote="a maximum monthly limit of ₹15,000/- per delegation"),
    "guarantee": Authoritative(subject="block_is_payment_guarantee", value=False,
        unit="predicate", scope="per_block", circular="NPCI/UPI/OC No.228", clause="Acquirer §2",
        quote="The block created shall not be treated as the guarantee of payment"),
}

# ---------- the five real drifts ----------

def test_drift1_scope_error_razorpay_sep216():
    """Razorpay SEP #216: ₹15,000 (a MONTHLY cap) asserted as per-transaction. Wrong by 3x."""
    d = Declared(subject="upi_circle_full_delegation", value=1500000, unit="INR_paise",
                 scope="per_transaction", source="razorpay/acp-sep-216")
    v = check_claim(d, list(AUTH.values()))
    assert v.result == "FAIL"
    assert v.code == "scope_mismatch"
    assert "per_transaction" in v.detail and "per_month_per_delegation" in v.detail
    assert v.clause == "§7"                      # cites the authorising clause
    assert "₹15,000" in v.quote or "15,000" in v.quote

def test_drift2_omission_razorpay_mcp():
    """Razorpay MCP server: declares a block with NO limit at all."""
    d = Declared(subject="upi_reserve_pay_block_limit", value=None, unit="INR_paise",
                 scope="per_block", source="razorpay/razorpay-mcp-server")
    v = check_claim(d, list(AUTH.values()))
    assert v.result == "FAIL"
    assert v.code == "omitted"

def test_drift3_period_error_cashfree():
    """Cashfree: a PER-BLOCK cap restated as per-month."""
    d = Declared(subject="upi_reserve_pay_block_limit", value=1000000, unit="INR_paise",
                 scope="per_month", source="cashfree/docs")
    v = check_claim(d, list(AUTH.values()))
    assert v.result == "FAIL"
    assert v.code == "scope_mismatch"

def test_drift4_semantic_guaranteed_collection():
    """Razorpay docs: 'Guaranteed Collection'. OC-228: 'shall NOT be treated as the guarantee'.
    Not a number. No regex reaches this."""
    d = Declared(subject="block_is_payment_guarantee", value=True, unit="predicate",
                 scope="per_block", source="razorpay/docs/reserve-pay")
    v = check_claim(d, list(AUTH.values()))
    assert v.result == "FAIL"
    assert v.code == "predicate_contradiction"
    assert "not be treated as the guarantee" in v.quote

def test_drift5_our_own_overclaim():
    """FAILURES.md #1: we claimed a bound stricter than the circular authorises."""
    d = Declared(subject="upi_reserve_pay_block_limit", value=2500000, unit="INR_paise",
                 scope="per_block", source="this-project/architecture")
    v = check_claim(d, list(AUTH.values()))
    assert v.result == "FAIL"
    assert v.code == "value_exceeds_authority"

# ---------- correct claims must PASS (induced-harm guard) ----------

@pytest.mark.parametrize("value,scope,subject", [
    (1000000, "per_block", "upi_reserve_pay_block_limit"),
    (500000, "per_transaction", "upi_circle_full_delegation"),
    (1500000, "per_month_per_delegation", "upi_circle_full_delegation"),
    (400000, "per_block", "upi_reserve_pay_block_limit"),      # stricter than authorised is fine
])
def test_conformant_claims_pass(value, scope, subject):
    d = Declared(subject=subject, value=value, unit="INR_paise", scope=scope, source="test")
    assert check_claim(d, list(AUTH.values())).result == "PASS"

def test_correct_predicate_passes():
    d = Declared(subject="block_is_payment_guarantee", value=False, unit="predicate",
                 scope="per_block", source="test")
    assert check_claim(d, list(AUTH.values())).result == "PASS"

# ---------- abstention ----------

def test_no_authority_is_undetermined_not_pass():
    """Never silently pass a claim we have no authority for. Fail-closed."""
    d = Declared(subject="some_unknown_limit", value=999, unit="INR_paise",
                 scope="per_block", source="test")
    v = check_claim(d, list(AUTH.values()))
    assert v.result == "UNDETERMINED"
    assert v.code == "no_authority_found"

def test_unit_mismatch_is_undetermined_not_fail():
    """Comparing paise to days is not a violation — it is a non-comparison."""
    d = Declared(subject="upi_reserve_pay_block_limit", value=90, unit="days",
                 scope="per_block", source="test")
    v = check_claim(d, list(AUTH.values())).result
    assert v == "UNDETERMINED"

def test_low_confidence_extraction_is_undetermined():
    d = Declared(subject="upi_reserve_pay_block_limit", value=1000000, unit="INR_paise",
                 scope="per_block", source="test", confidence=0.3)
    assert check_claim(d, list(AUTH.values())).result == "UNDETERMINED"

# ---------- every verdict must be citable ----------

def test_every_non_undetermined_verdict_carries_a_citation():
    """The invariant: no verdict without a clause."""
    cases = [
        Declared("upi_circle_full_delegation", 1500000, "INR_paise", "per_transaction", "x"),
        Declared("upi_reserve_pay_block_limit", 1000000, "INR_paise", "per_block", "x"),
        Declared("block_is_payment_guarantee", True, "predicate", "per_block", "x"),
    ]
    for d in cases:
        v = check_claim(d, list(AUTH.values()))
        assert v.clause, f"{v.result} verdict with no clause for {d.subject}"
        assert v.circular, f"{v.result} verdict with no circular for {d.subject}"
        assert v.quote, f"{v.result} verdict with no quote for {d.subject}"

def test_verdict_is_deterministic():
    d = Declared("upi_circle_full_delegation", 1500000, "INR_paise", "per_transaction", "x")
    a = list(AUTH.values())
    assert check_claim(d, a) == check_claim(d, a)
