"""Naive regex extractor — the ABLATION ARM, not a fallback.

Strategy: "take the first ₹ figure near the word 'limit'". This is the obvious
deterministic approach, and it is exactly what produces the error that shipped in
Razorpay's ACP SEP #216 — ₹15,000, a MONTHLY cap, asserted as per-transaction.

It exists to be beaten. `make eval` reports its score beside the real extractor's, and
the difference IS the pillar-3 argument: the deterministic alternative is not
hypothetically worse, it is the bug that actually shipped.
"""
import re

_AMOUNT = re.compile(r"(?:₹|Rs\.?\s*)\s*([\d,]+)", re.I)
_NEAR = 60          # chars either side of "limit" — the naive window


def naive_extract(text: str) -> list:
    """Return the first amount found near the word 'limit', labelled per_transaction.

    The mislabelling is the point. A naive reader sees a rupee figure beside the word
    'limit' and assumes the most common scope. It has no way to bind ₹15,000 to
    'monthly' and ₹5000 to 'per transaction' when both sit in one sentence.
    """
    out = []
    for m in re.finditer(r"limit", text, re.I):
        window = text[max(0, m.start() - _NEAR): m.end() + _NEAR]
        a = _AMOUNT.search(window)
        if not a:
            continue
        out.append({
            "value_minor": int(a.group(1).replace(",", "")) * 100,
            "unit": "INR_paise",
            "scope": "per_transaction",     # <- the assumption that shipped
            "extractor": "naive-regex",
            "confidence": 1.0,              # naive extractors are always confident
        })
        break                                # "first ₹ near 'limit'"
    return out
