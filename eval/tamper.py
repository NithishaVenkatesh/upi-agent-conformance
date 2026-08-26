"""Five tamper attacks against the audit ledger. Run: python3 -m eval.tamper

Two of these PASSED on the first implementation, while ARCHITECTURE.md claimed otherwise.
Committed so the claim is checkable rather than asserted. See FAILURES.md #2.
"""
import json, hashlib, os, shutil, subprocess, sys
LOG, HEAD = "eval/ledger.jsonl", "eval/ledger.jsonl.head"

def verify():
    r = subprocess.run([sys.executable, "-m", "eval.verify_ledger"], capture_output=True, text=True)
    return r.returncode == 0, r.stdout.strip()

def snap():   return open(LOG).read(), open(HEAD).read()
def restore(s): open(LOG,"w").write(s[0]); open(HEAD,"w").write(s[1])

SENTINEL = "__TAMPERED__"

def _mutate_payload(es):
    """Must be a REAL change. Setting a field to a value it may already hold makes the
    attack a no-op, and a no-op verifies fine — the suite then reports CAUGHT/PASSED
    depending on ledger contents rather than on the ledger's actual properties.
    That happened. This asserts the mutation bit."""
    before = json.dumps(es[0]["payload"], sort_keys=True)
    es[0]["payload"]["decision"] = SENTINEL
    after = json.dumps(es[0]["payload"], sort_keys=True)
    assert before != after, "vacuity guard: mutation was a no-op, attack proves nothing"
    return es

def edit_in_place(es):
    return _mutate_payload(es)

def reforge(es):
    h = lambda p,pl: hashlib.sha256((p+json.dumps(pl,sort_keys=True,separators=(",",":"))).encode()).hexdigest()
    es = _mutate_payload(es)
    for i,e in enumerate(es):
        if i: e["prev_hash"] = es[i-1]["hash"]
        e["hash"] = h(e["prev_hash"], e["payload"])
    return es

ATTACKS = [
    ("edit a payload in place",      lambda es: edit_in_place(es),  None),
    ("truncate the head",            lambda es: es[1:],             None),
    ("truncate the tail",            lambda es: es[:-1],            None),
    ("re-forge the whole chain",     lambda es: reforge(es),        None),
    ("delete the entire log",        lambda es: [],                 None),
]

def main():
    if not os.path.exists(LOG):
        subprocess.run(["make","demo"], capture_output=True)
    base = snap()
    ok, msg = verify()
    assert ok, f"baseline must verify, got: {msg}"
    print(f"baseline: {msg}\n")
    failed = []
    for name, mutate, _ in ATTACKS:
        es = [json.loads(l) for l in open(LOG) if l.strip()]
        before = open(LOG).read()
        out = mutate(es)
        open(LOG,"w").write("".join(json.dumps(e)+"\n" for e in out))
        if open(LOG).read() == before:
            print(f"  [VACUOUS] {name:28} → mutation changed nothing; attack is meaningless")
            failed.append(f"{name} (vacuous)"); restore(base); continue
        ok, msg = verify()
        caught = not ok
        print(f"  [{'CAUGHT' if caught else 'PASSED'}] {name:28} → {msg}")
        if not caught: failed.append(name)
        restore(base)
    print()
    if failed:
        print(f"{len(failed)} attack(s) NOT caught: {failed}"); return 1
    print(f"all {len(ATTACKS)} attacks caught"); return 0

if __name__ == "__main__":
    sys.exit(main())
