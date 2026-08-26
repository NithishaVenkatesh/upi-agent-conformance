"""Hash-chained, append-only ledger. Verified forward AND backward."""
import hashlib, json, os

GENESIS_ANCHOR = "corpus/claims/authoritative.json"

def _h(prev: str, payload: dict) -> str:
    canon = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256((prev + canon).encode()).hexdigest()

def genesis() -> str:
    """Chain is anchored to the corpus manifest, so a rebuilt corpus breaks the chain."""
    return hashlib.sha256(open(GENESIS_ANCHOR, "rb").read()).hexdigest()

class Ledger:
    def __init__(self, path="eval/ledger.jsonl"):
        self.path = path
        os.makedirs(os.path.dirname(path), exist_ok=True)

    def _entries(self):
        if not os.path.exists(self.path):
            return []
        return [json.loads(l) for l in open(self.path) if l.strip()]

    @property
    def head_path(self):
        return self.path + ".head"

    def append(self, payload: dict) -> dict:
        es = self._entries()
        prev = es[-1]["hash"] if es else genesis()
        e = {"seq": len(es), "prev_hash": prev, "payload": payload, "hash": _h(prev, payload)}
        with open(self.path, "a") as f:
            f.write(json.dumps(e) + "\n")
        # HEAD commits to length + tip. Without it, truncating the tail leaves an
        # internally-consistent chain that both walk directions accept. See FAILURES.md #2.
        json.dump({"count": len(es) + 1, "head": e["hash"]}, open(self.head_path, "w"))
        return e

    def verify(self):
        """Forward: each hash recomputes. Backward: each prev_hash matches its predecessor.
        HEAD: commits to length and tip.

        KNOWN LIMIT (measured, see FAILURES.md #2): an attacker with write access to BOTH
        the log and HEAD can re-forge the entire chain and this returns OK. A hash chain
        proves internal consistency, not authenticity. Detecting that needs an anchor we
        do not control — external timestamping or an append-only remote. Not implemented;
        stated rather than hidden."""
        es = self._entries()
        # HEAD is consulted BEFORE the empty short-circuit: deleting the whole log
        # must not read as "OK". Found by AgentA attacking this function.
        head_exists = os.path.exists(self.head_path)
        if not es:
            if head_exists:
                hd = json.load(open(self.head_path))
                return False, f"log deleted: HEAD commits to {hd['count']} entries, found 0"
            return True, "empty (no HEAD anchor yet)"
        if es[0]["prev_hash"] != genesis():
            return False, "genesis anchor mismatch — corpus changed or log truncated at head"
        for i, e in enumerate(es):                      # forward
            if _h(e["prev_hash"], e["payload"]) != e["hash"]:
                return False, f"forward: hash mismatch at seq {i}"
        for i in range(len(es) - 1, 0, -1):             # backward
            if es[i]["prev_hash"] != es[i - 1]["hash"]:
                return False, f"backward: chain break between seq {i-1} and {i}"
        if head_exists:                                 # length + tip commitment
            hd = json.load(open(self.head_path))
            if hd["count"] != len(es):
                return False, f"truncated: HEAD commits to {hd['count']} entries, found {len(es)}"
            if hd["head"] != es[-1]["hash"]:
                return False, "tip mismatch: HEAD does not match last entry"
        else:
            return False, "no HEAD anchor — truncation undetectable"
        return True, f"{len(es)} entries verified (forward, backward, HEAD-anchored)"
