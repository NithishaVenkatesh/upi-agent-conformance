"""Buyer agent. The LLM here does goal decomposition and product choice ONLY —
it is structurally off the money path. These tests pin that boundary."""
import inspect, pytest
from agent.buyer import BuyerAgent, FakePlanner

def test_agent_module_never_imports_the_gate():
    """Structural guarantee, not a promise: the agent cannot authorise anything."""
    import agent.buyer as b
    src = inspect.getsource(b)
    for forbidden in ("from gate", "import gate", "razorpay_client", "decide("):
        assert forbidden not in src, f"agent touches the money path via {forbidden!r}"

def test_agent_plans_then_calls_tools(fake_merchant):
    a = BuyerAgent(fake_merchant, planner=FakePlanner(["sku1"]))
    r = a.buy("a tote bag under 3000 rupees", idem_key="t1")
    assert r["status"] == "completed"

def test_agent_surfaces_refusal_with_clause(fake_merchant_refusing):
    """When refused, the agent must report WHY — clause included — and stop."""
    a = BuyerAgent(fake_merchant_refusing, planner=FakePlanner(["sku1"]))
    r = a.buy("anything", idem_key="t2")
    assert r["refused"] is True
    assert r["clause"] and r["circular"]

def test_agent_does_not_retry_a_non_timeout_refusal(fake_merchant_refusing):
    """OC-228 §3 forbids it. The agent must not paper over a refusal by looping."""
    a = BuyerAgent(fake_merchant_refusing, planner=FakePlanner(["sku1"]))
    a.buy("anything", idem_key="t3")
    assert fake_merchant_refusing.complete_calls == 1

def test_agent_rejects_a_product_the_planner_invented(fake_merchant):
    """Hallucinated SKU must fail loudly, not be silently substituted."""
    a = BuyerAgent(fake_merchant, planner=FakePlanner(["sku_does_not_exist"]))
    with pytest.raises(KeyError):
        a.buy("something", idem_key="t4")
