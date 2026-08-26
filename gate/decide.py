"""Deterministic authorisation gate. No LLM. No network. No clock reads.

Pure function of (request, block_state, verdict, now). Replayable from the ledger.
INVARIANT: every check names the clause that authorises it. A check with
`clause=None` is rejected at import time by eval/self_conformance.py.
"""
from dataclasses import dataclass
import json

STORE = json.load(open("corpus/claims/authoritative.json"))
CLAIMS = {c["id"]: c for c in STORE["claims"]}


@dataclass(frozen=True)
class Decision:
    allowed: bool
    code: str
    clause: str = ""
    quote: str = ""
    circular: str = ""
    detail: str = ""

    def render(self) -> str:
        if self.allowed:
            return f"ALLOWED {self.code}"
        return (f'REFUSED {self.code} · {self.circular} {self.clause} · '
                f'"{self.quote}" · {self.detail}')


def _claim(cid):
    c = CLAIMS[cid]
    if c["status"] != "RESOLVED":
        raise ValueError(f"{cid} is {c['status']} — cannot authorise on an unresolved claim")
    return c


def decide(req, block, verdict, now_ts) -> Decision:
    """req: {amount_minor, idem_key, retry_of_timeout}
       block: {max_minor, remaining_minor, expires_ts, merchant_id, customer_id,
               retries_24h, used_idem_keys}"""

    if verdict != "PASS":
        c = _claim("OC228-5-block-max")
        return Decision(False, "counterparty_not_conformant", c["clause"], c["quote"],
                        c["circular"], f"conformance verdict={verdict}")

    c = _claim("OC228-5-block-max")
    if block["max_minor"] > c["value_minor"]:
        return Decision(False, "cap_exceeds_authority", c["clause"], c["quote"], c["circular"],
                        f'declared ₹{block["max_minor"]//100:,} > authorised ₹{c["value_minor"]//100:,}')

    if req["amount_minor"] > block["remaining_minor"]:
        return Decision(False, "insufficient_block_balance", c["clause"], c["quote"], c["circular"],
                        f'requested ₹{req["amount_minor"]//100:,} > remaining ₹{block["remaining_minor"]//100:,}')

    # Two distinct obligations from the same clause. The first version conflated them:
    # it checked expiry but printed "validity capped at 90 days" — asserting a bound it
    # never enforced. FAILURES.md #3.
    d = _claim("OC228-5-block-days")
    if block["created_ts"] + d["value_minor"] * 86400 < block["expires_ts"]:
        return Decision(False, "validity_exceeds_authority", d["clause"], d["quote"], d["circular"],
                        f'block validity {(block["expires_ts"]-block["created_ts"])//86400}d '
                        f'> authorised {d["value_minor"]}d')
    if now_ts > block["expires_ts"]:
        return Decision(False, "block_expired", d["clause"], d["quote"], d["circular"],
                        "block past its expiry")

    u = _claim("OC228-4-one-block")
    if block.get("concurrent_blocks_same_merchant", 0) > 0:
        return Decision(False, "duplicate_block_for_merchant", u["clause"], u["quote"], u["circular"],
                        f'{block["concurrent_blocks_same_merchant"]+1} concurrent blocks for '
                        f'({block["customer_id"]}, {block["merchant_id"]}); authorised: 1')

    r = _claim("OC228-3-retry")
    if req.get("is_retry"):
        if not req.get("retry_of_timeout"):
            return Decision(False, "retry_not_permitted", r["clause"], r["quote"], r["circular"],
                            "retry attempted on a non-timeout decline")
        if block["retries_24h"] >= r["value_minor"]:
            return Decision(False, "retry_budget_exhausted", r["clause"], r["quote"], r["circular"],
                            f'{block["retries_24h"]}/{r["value_minor"]} used in 24h')

    if req["idem_key"] in block["used_idem_keys"]:
        return Decision(False, "idempotency_replay", "n/a", "", "", "key already used — replaying original")

    return Decision(True, "authorised", c["clause"], c["quote"], c["circular"],
                    f'₹{req["amount_minor"]//100:,} within ₹{block["remaining_minor"]//100:,} remaining')
