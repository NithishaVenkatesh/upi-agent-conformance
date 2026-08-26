"""Load .env once, from the repo root, for every entry point.

Previously only tools/probe_testmode.py read .env, so `make demo` reported
"STUBBED (no rzp_test_ keys present)" while valid keys sat in the file beside it.
A demo that understates what it is wired to is the same class of error as one that
overstates it — both are claims that do not match the system.
"""
import os
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent


def load_env(path: Path | None = None) -> list[str]:
    """Populate os.environ from .env without overriding anything already set.
    Returns the names loaded (never the values)."""
    p = path or (_ROOT / ".env")
    loaded = []
    if not p.exists():
        return loaded
    for line in p.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k, v = k.strip(), v.strip().strip('"').strip("'")
        if k not in os.environ:
            os.environ[k] = v
        loaded.append(k)
    return loaded
