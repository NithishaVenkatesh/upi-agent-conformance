"""make verify's ledger arm. Exit codes are the interface:

  0  VERIFIED — entries were walked and every check held
  1  BROKEN   — a check failed, or a log was erased while HEAD survived
  3  EMPTY    — nothing to walk. NOT a success: on a fresh clone the old code
               printed "ledger OK" and exited 0, while README.md tells a judge
               this command walks the ledger. FAILURES.md #3(b), reintroduced at
               the empty-clone case and closed here.
"""
import sys
from gate.ledger import Ledger, VERIFIED, EMPTY


def main(path="eval/ledger.jsonl"):
    st, msg = Ledger(path=path).state()
    if st == EMPTY:
        print("ledger EMPTY — " + msg)
        return 3
    print(("ledger OK — " if st == VERIFIED else "ledger BROKEN — ") + msg)
    return 0 if st == VERIFIED else 1


if __name__ == "__main__":
    sys.exit(main())
