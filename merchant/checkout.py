"""UCP checkout. Integer paise only. Idempotent completion."""
from dataclasses import dataclass, field
from typing import Optional, List, Dict
import uuid

CATALOG = {"sku1": {"name": "Cotton tote", "price_minor": 249900},
           "sku2": {"name": "Canvas backpack", "price_minor": 389900},
           "sku3": {"name": "Laptop sleeve", "price_minor": 149900}}


@dataclass
class Checkout:
    id: str
    items: List[Dict]
    currency: str
    total_minor: int
    status: str = "ready_for_payment"
    order_id: Optional[str] = None


class CheckoutStore:
    """In-memory. A real deployment swaps this for a database; nothing above it changes."""

    def __init__(self):
        self._c: Dict[str, Checkout] = {}
        self._idem: Dict[str, str] = {}

    def create(self, items: List[Dict], currency: str) -> Checkout:
        total = 0
        for it in items:
            if it["id"] not in CATALOG:
                raise KeyError(f"unknown sku {it['id']!r}")
            total += CATALOG[it["id"]]["price_minor"] * int(it["qty"])
        c = Checkout(id=f"cs_{uuid.uuid4().hex[:12]}", items=items,
                     currency=currency, total_minor=total)
        self._c[c.id] = c
        return c

    def get(self, cid: str) -> Checkout:
        if cid not in self._c:
            raise KeyError(f"unknown checkout session {cid!r}")
        return self._c[cid]

    def complete(self, cid: str, idem_key: str, capture=None) -> Checkout:
        c = self.get(cid)
        if idem_key in self._idem:          # replay: return the original, no side effects
            return self._c[self._idem[idem_key]]
        # idem_key MUST reach the payment API: our replay guard is in-process, so a
        # crash between capture and store would otherwise re-charge on retry.
        order_id = (capture(c, idem_key=idem_key) if capture
                    else f"order_test_{uuid.uuid4().hex[:10]}")
        c.order_id, c.status = order_id, "completed"
        self._idem[idem_key] = cid
        return c
