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

# THE CAVEAT GATE. Instance #8 of this project's shape was a restatement that
# outran its source: LIVE_API_FINDINGS.md §4 says plainly that we cannot conclude
# ₹15,000 is unauthorised, and that hedge lived in prose while the figures lived
# in JSON. Prose hedges do not travel; JSON fields do. So a number reached a page,
# a script line and a draft disclosure with the hedge stripped, BY DEFAULT.
#
# Detection has a ceiling — it only catches what someone thinks to check. These
# fields make the hedge structurally inseparable from the figure: a finding
# without them cannot load, and render_comparison() refuses to draw the
# comparison at all rather than draw it bare.
REQUIRED_CAVEAT_FIELDS = frozenset({
    "framing",                    # the narrower claim that IS supported
    "not_claimed",                # the stronger claim that is NOT
    "alternatives_not_excluded",  # what would fully account for it instead
})


class ProbeCacheError(RuntimeError):
    """Raised loudly. Never caught to produce an empty case list."""


class CaveatMissing(RuntimeError):
    """A renderer tried to emit an enforced bound without its hedge."""


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

    findings = blob.get("findings", [])
    for f in findings:
        _assert_hedged(f, path)

    meta = {"probed_at": blob.get("probed_at", "unknown"), "findings": findings}
    return cases, meta


def _assert_hedged(f: dict, path: str = DEFAULT_PATH):
    """Every finding carries the three caveat fields, non-empty."""
    name = f.get("parameter", "<unnamed>")
    for k in sorted(REQUIRED_CAVEAT_FIELDS):
        v = f.get(k)
        blank = v is None or (isinstance(v, str) and not v.strip()) or \
            (isinstance(v, (list, tuple)) and not v)
        if blank:
            raise ProbeCacheError(
                f"{path}: finding {name!r} is missing `{k}`. A probed bound may not "
                f"travel without the hedge its source attached to it — see "
                f"research/11_final_selection/LIVE_API_FINDINGS.md §4 and "
                f"FAILURES.md #8. Add the field; do not remove the check.")


def render_comparison(finding: dict) -> str:
    """The ONLY sanctioned way to state 'the API permits X, the circular says Y'.

    Refuses rather than degrades. A page that silently drops the caveat is worse
    than a page that fails to load, because it looks like evidence."""
    if not finding.get("alternatives_not_excluded"):
        raise CaveatMissing(
            f"refusing to render the comparison for "
            f"{finding.get('parameter', '<unnamed>')!r}: no alternatives_not_excluded. "
            f"The disagreement may not be shown without what would explain it away.")
    _assert_hedged(finding)

    api = finding.get("api_enforces_paise") or finding.get("api_enforces")
    circ = finding.get("circular_authorises_paise") or finding.get("circular_authorises")
    if "api_enforces_paise" in finding:
        api_s, circ_s = f"₹{api // 100:,}", f"₹{circ // 100:,}"
    else:
        api_s, circ_s = f"{api} days", f"{circ} days"

    lines = [
        f"{finding['parameter']}",
        f"  live test API accepts   {api_s}",
        f"  {finding['circular']} authorises   {circ_s}",
        "",
        f"  WHAT THIS IS NOT: a claim {finding['not_claimed']}.",
        "  We cannot rule out:",
    ]
    lines += [f"    - {a}" for a in finding["alternatives_not_excluded"]]
    lines += ["", f"  WHAT IT IS: {finding['framing']}."]
    return "\n".join(lines)
