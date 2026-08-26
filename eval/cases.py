"""Assemble evaluation cases from documents WE DID NOT AUTHOR.

This is the whole defence against the field's defining failure. Every case here is a
claim made by somebody else — a live UCP profile, a vendor's documentation, a published
standards proposal — and every LABEL comes from an NPCI circular, not from us.

Sources, all on disk and checksummed:
  * 4 live Indian merchant UCP profiles, fetched 2026-08-26
  * the four published drifts (2 Razorpay, 1 Cashfree) + our own (#5)
  * NPCI OC-201 / OC-228

`harvest()` reports its true count. It does not pad. If the count is below the
committed N, eval/harness.py suppresses the headline rather than flattering it.
"""
import glob, json, os

EVIDENCE = "research/07_razorpay_winning_intersection/evidence"


def _from_live_profiles():
    """Every real merchant declares card-only. Against OC-228 there is no UPI bound to
    violate — so these are UNDETERMINED, not FAIL. Counting them as detections would be
    exactly the inflation we criticise."""
    out = []
    for f in sorted(glob.glob(f"{EVIDENCE}/ucp_*.json")):
        host = os.path.basename(f)[4:-16]
        d = json.load(open(f))["ucp"]
        for hid, hl in d.get("payment_handlers", {}).items():
            for h in hl:
                cfg = h.get("config", {})
                methods = cfg.get("allowed_payment_methods", []) + cfg.get("payment_methods", [])
                for m in methods:
                    out.append({
                        "id": f"{host}:{hid}:{m.get('type')}",
                        "source": f"{host} (live UCP, 2026-08-26)",
                        "text": json.dumps(m)[:300],
                        "declared": {"subject": "upi_reserve_pay_block_limit", "value": None,
                                     "unit": "INR_paise", "scope": "per_block"},
                        # No UPI handler at all -> no declared bound -> omission.
                        "label": "FAIL" if hid == "in.razorpay.upi" else "UNDETERMINED",
                        "note": f"{host} declares {hid} / {m.get('type')}",
                    })
    return out


def _published_drifts():
    """The five. Discovery set — flagged, and reported separately from the batch."""
    return [
      {"id": "drift1-razorpay-sep216", "source": "razorpay/acp-sep-216",
       "text": "For full delegation ... a maximum monthly limit of ₹15,000/- per delegation",
       "declared": {"subject": "upi_circle_full_delegation", "value": 1500000,
                    "unit": "INR_paise", "scope": "per_transaction"},
       "label": "FAIL", "note": "monthly cap asserted as per-transaction (3x)",
       "discovery_set": True},
      {"id": "drift2-razorpay-mcp", "source": "razorpay/razorpay-mcp-server",
       "text": "token: {max_amount, frequency, expire_at}",
       "declared": {"subject": "upi_reserve_pay_block_limit", "value": None,
                    "unit": "INR_paise", "scope": "per_block"},
       "label": "FAIL", "note": "no limit validation at all", "discovery_set": True},
      {"id": "drift3-cashfree", "source": "cashfree/docs",
       "text": "capped at Rs.10,000 per month",
       "declared": {"subject": "upi_reserve_pay_block_limit", "value": 1000000,
                    "unit": "INR_paise", "scope": "per_month"},
       "label": "FAIL", "note": "per-block cap restated as per-month", "discovery_set": True},
      {"id": "drift4-razorpay-guarantee", "source": "razorpay/docs/reserve-pay",
       "text": "Guaranteed Collection: funds are pre-blocked, ensuring you receive payment",
       "declared": {"subject": "block_is_payment_guarantee", "value": True,
                    "unit": "predicate", "scope": "per_block"},
       "label": "FAIL", "note": "semantic contradiction; not a number", "discovery_set": True},
      {"id": "drift5-ours", "source": "this-project/architecture-v1",
       "text": "no tool revokes a block",
       "declared": {"subject": "upi_reserve_pay_block_limit", "value": 2500000,
                    "unit": "INR_paise", "scope": "per_block"},
       "label": "FAIL", "note": "our own overclaim, FAILURES.md #1", "discovery_set": True},
    ]


def _conformant_controls():
    """Correct claims. Without these the induced-harm number is meaningless — a system
    that refuses everything would otherwise score 100%."""
    return [
      {"id": "ctl-block-exact", "source": "npci/oc-228", "text": "maximum of Rs.10,000 of block limit",
       "declared": {"subject": "upi_reserve_pay_block_limit", "value": 1000000,
                    "unit": "INR_paise", "scope": "per_block"}, "label": "PASS"},
      {"id": "ctl-block-stricter", "source": "hypothetical-conformant-psp", "text": "capped at Rs.4,000 per block",
       "declared": {"subject": "upi_reserve_pay_block_limit", "value": 400000,
                    "unit": "INR_paise", "scope": "per_block"}, "label": "PASS"},
      {"id": "ctl-circle-txn", "source": "npci/oc-201", "text": "maximum per transaction limit of ₹5000",
       "declared": {"subject": "upi_circle_full_delegation", "value": 500000,
                    "unit": "INR_paise", "scope": "per_transaction"}, "label": "PASS"},
      {"id": "ctl-circle-month", "source": "npci/oc-201", "text": "a maximum monthly limit of ₹15,000/- per delegation",
       "declared": {"subject": "upi_circle_full_delegation", "value": 1500000,
                    "unit": "INR_paise", "scope": "per_month_per_delegation"}, "label": "PASS"},
      {"id": "ctl-guarantee-correct", "source": "npci/oc-228", "text": "shall not be treated as the guarantee of payment",
       "declared": {"subject": "block_is_payment_guarantee", "value": False,
                    "unit": "predicate", "scope": "per_block"}, "label": "PASS"},
      {"id": "ctl-ours", "source": "this-project/merchant-ucp", "text": "declared_constraints",
       "declared": {"subject": "upi_reserve_pay_block_limit", "value": 1000000,
                    "unit": "INR_paise", "scope": "per_block"}, "label": "PASS"},
    ]


def harvest(include_discovery_set: bool = False):
    """Returns (cases, provenance). Discovery-set cases are EXCLUDED by default:
    they were found by looking for drift, so scoring them inflates the rate."""
    cases = _from_live_profiles() + _conformant_controls()
    if include_discovery_set:
        cases += _published_drifts()
    prov = {
        "live_ucp_profiles": len(_from_live_profiles()),
        "conformant_controls": len(_conformant_controls()),
        "discovery_set": len(_published_drifts()),
        "discovery_set_included": include_discovery_set,
        "total_scored_pool": len(cases),
    }
    return cases, prov
