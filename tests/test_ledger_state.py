"""Three-state ledger reporting.

FAILURES.md #3(b) was "deleting the entire ledger returned `ledger OK`". It was
fixed for the delete case and REINTRODUCED at the empty-clone case: on a fresh
clone `make verify` printed "ledger OK — empty (no HEAD anchor yet)" and exited
0, while README.md tells a judge that command walks the ledger. It verified
nothing and said OK.

The distinction that fixes it, and why it is two things and not one:
  * the MONEY PATH may proceed over an empty ledger — the first authorisation
    of all time has nothing behind it, and refusing it would be wrong.
  * a JUDGE running `make verify` must never be told "OK" for a walk of zero
    entries.
So `verify()` keeps its boolean for the gate, and `state()` carries the three-way
that the reporting command needs.
"""
import json, pytest
from gate.ledger import Ledger, VERIFIED, EMPTY, BROKEN


@pytest.fixture
def led(tmp_path):
    return Ledger(path=str(tmp_path / "l.jsonl"))


def test_fresh_clone_is_EMPTY_not_verified(led):
    st, msg = led.state()
    assert st == EMPTY
    assert "no ledger" in msg.lower()
    # the whole point: it must not read as a successful verification
    assert "ok" not in msg.lower().split()


def test_entries_are_VERIFIED(led):
    led.append({"a": 1}); led.append({"a": 2})
    st, msg = led.state()
    assert st == VERIFIED and "2 entries" in msg


def test_tampered_is_BROKEN(led):
    led.append({"a": 1})
    rows = [json.loads(l) for l in open(led.path)]
    rows[0]["payload"]["a"] = 99
    open(led.path, "w").write(json.dumps(rows[0]) + "\n")
    st, _ = led.state()
    assert st == BROKEN


def test_deleted_log_with_surviving_HEAD_is_BROKEN_not_EMPTY(led):
    """Regression for FAILURES.md #3(b) proper. An erased log is an ATTACK,
    not an absence, and must not be reported as a fresh clone."""
    led.append({"a": 1})
    open(led.path, "w").close()          # erase content, keep HEAD
    st, msg = led.state()
    assert st == BROKEN and "HEAD commits to 1" in msg


def test_verify_still_permits_the_money_path_over_an_empty_ledger(led):
    """The gate must not refuse the first authorisation of all time."""
    ok, _ = led.verify()
    assert ok is True


def test_verify_is_false_when_broken(led):
    led.append({"a": 1})
    open(led.path, "w").close()
    ok, _ = led.verify()
    assert ok is False


# --- the reporting command ---

def test_verify_ledger_exits_3_on_a_fresh_clone(tmp_path, capsys):
    from eval.verify_ledger import main
    code = main(path=str(tmp_path / "nothing.jsonl"))
    out = capsys.readouterr().out
    assert code == 3, "a walk of zero entries must not exit 0"
    assert "make demo" in out, "must tell the judge what to run"
    assert "OK" not in out


def test_verify_ledger_exits_0_when_it_really_verified(tmp_path, capsys):
    from eval.verify_ledger import main
    p = str(tmp_path / "l.jsonl")
    Ledger(path=p).append({"a": 1})
    code = main(path=p)
    assert code == 0 and "OK" in capsys.readouterr().out


def test_verify_ledger_exits_1_when_broken(tmp_path, capsys):
    from eval.verify_ledger import main
    p = str(tmp_path / "l.jsonl")
    Ledger(path=p).append({"a": 1})
    open(p, "w").close()
    code = main(path=p)
    assert code == 1 and "BROKEN" in capsys.readouterr().out
