"""The committed probe result, read as data.

WHY THIS EXISTS. The live-API cases are the strongest evidence in the project —
the declared bound is stated by the counterparty's own running code, so the label
cannot be argued to have come from us. That made them the worst possible thing to
compute at judging time:

  * eval/cases.py wrapped the probe in `except Exception: return []`, so any
    failure — no key, a rate-limit, a schema change, a bug — silently produced
    zero positive cases and flipped the harness to VACUOUS. The batch then
    blamed its own corpus for a swallowed exception.
  * probe() fired ~33 live order-creation calls on every `make eval`, undeclared
    and uncached, while eval/probe_findings.json was written by __main__ only and
    read by nothing.

So the artifact is now the source. It is committed, which means `make eval` needs
no keys and no network, and a reviewer gets the same numbers we did. Probing is an
explicit act — `make probe` — that REWRITES this file.

Absence or damage is LOUD. A missing cache must never look like a clean run over
an empty positive class; that confusion is the exact defect FAILURES.md #5 logged.
"""
import json
import os

DEFAULT_PATH = "eval/probe_findings.json"


class ProbeCacheError(RuntimeError):
    """Raised loudly. Never caught to produce an empty case list."""


def load_cached_cases(path: str = DEFAULT_PATH):
    """(cases, meta). Raises ProbeCacheError rather than degrading to []."""
    if not os.path.exists(path):
        raise ProbeCacheError(
            f"{path} is missing — the live-API positive class cannot be loaded. "
            f"Run `make probe` to regenerate it (requires rzp_test_ keys and makes "
            f"~33 live test-mode calls). Refusing to continue with an empty positive "
            f"class: a batch that silently loses its only violations reports VACUOUS "
            f"and blames its own corpus.")
    try:
        blob = json.load(open(path))
    except (json.JSONDecodeError, OSError) as e:
        raise ProbeCacheError(f"{path} is unreadable ({e}). Run `make probe`.") from e

    if "cases" not in blob:
        raise ProbeCacheError(f"{path} has no `cases` key — schema changed? Run `make probe`.")
    cases = blob["cases"]
    if not isinstance(cases, list) or not cases:
        raise ProbeCacheError(
            f"{path} contains no cases. This is an ERROR, not an empty result: the "
            f"probe either never ran or returned nothing. Run `make probe`.")

    meta = {"probed_at": blob.get("probed_at", "unknown"),
            "findings": blob.get("findings", [])}
    return cases, meta
