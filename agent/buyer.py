"""Buyer agent — the LLM does goal decomposition and product selection, nothing else.

This module deliberately does NOT import the gate, the ledger, or the payment client.
It can only speak to the merchant over MCP tool calls, exactly as a third-party agent
would. If it could reach the gate it could be argued into bypassing it; it cannot,
because the capability is absent rather than merely unused.

A refusal ends the attempt. The agent reports the clause and stops — it does not retry,
because OC-228 §3 permits retries only for timeouts and forbids them for every other
decline. An agent that loops on a refusal converts one violation into four.
"""
from typing import List, Protocol


class Planner(Protocol):
    def choose(self, goal: str, products: List[dict]) -> List[str]: ...


class FakePlanner:
    """Deterministic stand-in for tests."""
    def __init__(self, skus: List[str]): self.skus = skus
    def choose(self, goal, products): return self.skus


class AzureOpenAIPlanner:
    """Real planner. Activates with Azure credentials; chooses SKUs from the catalog.

    It is given the catalog and asked to pick; it is never given a payment tool, so the
    worst a bad plan can do is select the wrong product — which the gate then bounds."""
    def __init__(self, llm=None):
        from extract.llm import default_llm
        self.llm = llm or default_llm()

    def choose(self, goal: str, products: List[dict]) -> List[str]:
        import json
        catalog = "\n".join(f'{p["id"]}: {p["name"]} — ₹{p["price_minor"]//100}'
                            for p in products)
        out = self.llm.complete(
            "Choose product IDs matching the shopper's goal. Return JSON "
            '{"ids": ["sku1"]}. Choose only from the listed IDs; never invent one.',
            f"Goal: {goal}\n\nCatalog:\n{catalog}")
        return json.loads(out).get("ids", [])


class BuyerAgent:
    def __init__(self, merchant, planner: Planner):
        self.m = merchant
        self.planner = planner

    def buy(self, goal: str, idem_key: str) -> dict:
        products = self.m.call("search_catalog", {"q": ""})["products"]
        ids = self.planner.choose(goal, products)
        if not ids:
            return {"refused": True, "code": "no_product_selected", "clause": "", "circular": ""}

        # Verify every chosen id against the catalog. A hallucinated SKU must fail
        # loudly here rather than be quietly substituted downstream.
        for i in ids:
            self.m.call("get_product", {"id": i})

        c = self.m.call("create_checkout",
                        {"items": [{"id": i, "qty": 1} for i in ids], "currency": "INR"})
        r = self.m.call("complete_checkout",
                        {"checkout_id": c["id"], "idem_key": idem_key})

        if r.get("_error"):
            return {"refused": True, "code": r["code"], "clause": r["clause"],
                    "circular": r["circular"], "quote": r["quote"]}
        return {"refused": False, **r}
