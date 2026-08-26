"""CI gate: the project's own claims must cite a clause.

FAILURES.md #1 — this project asserted "no tool revokes a block" hours after its own
source-read recorded `revoke_token`. Drift appears in hours, not months.

FAILURES.md #3 — the first version of THIS FILE was vacuous: it read only positional
args, so `Decision(allowed=False, code="x")` skipped the check entirely; and it demanded
a Constant clause while every real refusal passes `c["clause"]` (a Subscript). It had no
possible true positive against the code it guarded. A verification surface that silently
verifies nothing is worse than none. It now self-tests against known-bad fixtures.
"""
import ast, json, sys

def _args(node):
    """Positional and keyword args, normalised. The v1 bug was reading only node.args."""
    out = list(node.args)
    kw = {k.arg: k.value for k in node.keywords}
    return out, kw

def _clause_present(pos, kw):
    """A clause may be a literal OR an expression like c["clause"]. Absent or empty-literal fails."""
    node = kw.get("clause") if "clause" in kw else (pos[2] if len(pos) > 2 else None)
    if node is None:
        return False
    if isinstance(node, ast.Constant):
        return bool(node.value)
    return True          # Subscript/Name/Attribute — a real expression

def check(src, known_ids):
    fails, cited, refusals = [], set(), 0
    tree = ast.parse(src)
    for n in ast.walk(tree):
        if not isinstance(n, ast.Call):
            continue
        fn = getattr(n.func, "id", "")
        pos, kw = _args(n)
        if fn == "_claim" and pos and isinstance(pos[0], ast.Constant):
            cited.add(pos[0].value)
            if pos[0].value not in known_ids:
                fails.append(f"cites unknown claim {pos[0].value!r}")
        if fn == "Decision":
            allowed = kw.get("allowed") if "allowed" in kw else (pos[0] if pos else None)
            if isinstance(allowed, ast.Constant) and allowed.value is False:
                refusals += 1
                code = kw.get("code") if "code" in kw else (pos[1] if len(pos) > 1 else None)
                code_v = code.value if isinstance(code, ast.Constant) else "?"
                if code_v == "idempotency_replay":
                    continue          # documented exemption: no clause governs replay
                if not _clause_present(pos, kw):
                    fails.append(f"refusal {code_v!r} carries no clause")
    if not cited:
        fails.append("vacuity guard: no claims cited at all")
    if not refusals:
        fails.append("vacuity guard: no refusals found — the check cannot fire")
    return fails, cited, refusals

SELF_TESTS = [
    ('Decision(allowed=False, code="sneaky")', "kwargs refusal with no clause"),
    ('Decision(False, "sneaky")',              "positional refusal with no clause"),
    ('Decision(False, "sneaky", "")',          "refusal with empty clause"),
]

if __name__ == "__main__":
    ids = {c["id"] for c in json.load(open("corpus/claims/authoritative.json"))["claims"]}
    # self-test FIRST: prove the check can fail before trusting it to pass
    for snippet, name in SELF_TESTS:
        f, _, _ = check(f"def _claim(x): pass\n_claim('OC228-5-block-max')\n{snippet}", ids)
        if not any("carries no clause" in x for x in f):
            print(f"  FAIL self-test: {name} was NOT caught — check is vacuous"); sys.exit(1)
    print(f"self-test: {len(SELF_TESTS)}/{len(SELF_TESTS)} known-bad fixtures caught")

    fails, cited, refusals = check(open("gate/decide.py").read(), ids)
    print(f"self-conformance: {len(cited)} claims cited, {refusals} refusals checked, {len(ids)} in store")
    for f in fails:
        print("  FAIL:", f)
    sys.exit(1 if fails else 0)
