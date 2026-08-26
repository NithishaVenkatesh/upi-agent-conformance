import sys
from gate.ledger import Ledger
ok, msg = Ledger().verify()
print(("ledger OK — " if ok else "ledger BROKEN — ") + msg)
sys.exit(0 if ok else 1)
