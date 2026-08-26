"""Ledger tests. The tamper suite (eval/tamper.py) runs the same attacks end-to-end;
these pin the unit behaviour, including the two that defeated v1 (FAILURES.md #2)."""
import json, os, pytest
from gate.ledger import Ledger, genesis

@pytest.fixture
def led(tmp_path):
    return Ledger(path=str(tmp_path / "l.jsonl"))

def test_empty_with_no_head_is_ok(led):
    ok, msg = led.verify(); assert ok

def test_append_then_verify(led):
    led.append({"a": 1}); led.append({"a": 2})
    ok, msg = led.verify(); assert ok and "2 entries" in msg

def test_chain_links_to_genesis(led):
    e = led.append({"a": 1}); assert e["prev_hash"] == genesis()

def test_in_place_edit_detected(led):
    led.append({"decision": "REFUSED"}); led.append({"decision": "ok"})
    es = [json.loads(l) for l in open(led.path)]
    es[0]["payload"]["decision"] = "authorised"        # flip, leave hashes
    open(led.path, "w").write("".join(json.dumps(e) + "\n" for e in es))
    ok, msg = led.verify(); assert not ok and "hash mismatch" in msg

def test_tail_truncation_detected(led):
    """v1 PASSED this — a truncated chain is internally consistent. FAILURES.md #2."""
    for i in range(3): led.append({"i": i})
    es = open(led.path).readlines()
    open(led.path, "w").writelines(es[:-1])
    ok, msg = led.verify(); assert not ok and "truncated" in msg

def test_full_deletion_detected(led):
    """v2 PASSED this — verify() short-circuited on empty before consulting HEAD."""
    led.append({"a": 1})
    open(led.path, "w").write("")
    ok, msg = led.verify(); assert not ok and "deleted" in msg

def test_reforge_detected_by_head_tip(led):
    import hashlib
    for i in range(2): led.append({"i": i})
    es = [json.loads(l) for l in open(led.path)]
    es[0]["payload"]["i"] = 99
    h = lambda p, pl: hashlib.sha256((p + json.dumps(pl, sort_keys=True, separators=(",", ":"))).encode()).hexdigest()
    for i, e in enumerate(es):
        if i: e["prev_hash"] = es[i-1]["hash"]
        e["hash"] = h(e["prev_hash"], e["payload"])
    open(led.path, "w").write("".join(json.dumps(e) + "\n" for e in es))
    ok, msg = led.verify(); assert not ok and "tip mismatch" in msg

def test_head_records_count_and_tip(led):
    led.append({"a": 1}); e = led.append({"a": 2})
    hd = json.load(open(led.head_path))
    assert hd["count"] == 2 and hd["head"] == e["hash"]

def test_genesis_moves_when_corpus_changes(led, monkeypatch):
    """A rebuilt corpus must invalidate the chain — verdicts are only reproducible
    against the corpus that produced them."""
    led.append({"a": 1})
    import gate.ledger as gl
    monkeypatch.setattr(gl, "genesis", lambda: "0" * 64)
    ok, msg = led.verify(); assert not ok and "genesis" in msg
