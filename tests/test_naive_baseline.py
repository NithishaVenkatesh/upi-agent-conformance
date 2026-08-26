"""The naive baseline must REPRODUCE the real shipped error.

This is the ablation arm. If a regex could read these circulars correctly, the LLM in
this system would be ornamental and the architecture's pillar-3 claim would be false.
The test asserts the baseline FAILS in the exact way Razorpay's SEP #216 failed.
"""
from extract.naive import naive_extract

# Verbatim from NPCI/UPI/OC No.201/2024-25 §7, read from the scan.
OC201_S7 = ("For full delegation, Members shall ensure a maximum monthly limit of "
            "₹15,000/- per delegation and maximum per transaction limit of ₹5000")
# Verbatim from OC-228 acquirer §2 — the semantic drift. No number at all.
OC228_S2 = ("The block created shall not be treated as the guarantee of payment, only "
            "the successful debit response received by the merchant shall be considered "
            "for payment.")

def test_naive_reproduces_the_3x_scope_error():
    """'first ₹ near the word limit' grabs ₹15,000 and mislabels it per-transaction.
    That is precisely the claim that shipped in SEP #216 and stood four months."""
    out = naive_extract(OC201_S7)
    assert out, "baseline extracted nothing"
    first = out[0]
    assert first["value_minor"] == 1500000, "expected the naive grab to be ₹15,000"
    assert first["scope"] == "per_transaction", (
        "the baseline must reproduce the shipped mislabelling; if it gets scope right, "
        "the LLM is not load-bearing and the architecture's claim is false")

def test_naive_misses_the_true_per_transaction_limit():
    """₹5,000 is the real per-transaction cap. The naive pass never surfaces it as such."""
    out = naive_extract(OC201_S7)
    assert not any(o["value_minor"] == 500000 and o["scope"] == "per_transaction"
                   for o in out)

def test_naive_cannot_see_semantic_drift():
    """Drift #4 is not a number. A numeric extractor is structurally blind to it."""
    assert naive_extract(OC228_S2) == []

def test_naive_is_deterministic():
    assert naive_extract(OC201_S7) == naive_extract(OC201_S7)

def test_naive_handles_lakh_and_comma_formats():
    assert naive_extract("subject to a limit of Rs.10,000 per block")[0]["value_minor"] == 1000000
