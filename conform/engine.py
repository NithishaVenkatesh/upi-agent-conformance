"""Conformance engine — deterministic. No LLM, no network, no clock.

Compares a DECLARED constraint (from a counterparty's docs/config, extracted upstream)
against the AUTHORITATIVE claim from a checksummed circular.

Design note: the LLM's job upstream is to turn prose into a structured claim. Once a
claim is structured, deciding whether it conforms is integer + enum comparison — a
decidable question, so a model here would only add nondeterminism. That split is the
whole point of the architecture's "where the LLM is, and is not" table.
"""
from dataclasses import dataclass
from typing import Optional, Union, List

CONFIDENCE_FLOOR = 0.6      # below this we abstain rather than guess

# Scopes that mean the same thing. Anything not related here is a genuine mismatch.
_SCOPE_ALIASES = {
    "per_month_per_delegation": {"per_month_per_delegation", "monthly_per_delegation"},
    "per_transaction": {"per_transaction", "per_txn"},
    "per_block": {"per_block"},
    "per_month": {"per_month", "monthly"},
}


def _scope_eq(a: str, b: str) -> bool:
    if a == b:
        return True
    for group in _SCOPE_ALIASES.values():
        if a in group and b in group:
            return True
    return False


@dataclass(frozen=True)
class Declared:
    subject: str
    value: Union[int, bool, None]
    unit: str
    scope: str
    source: str
    confidence: float = 1.0


@dataclass(frozen=True)
class Authoritative:
    subject: str
    value: Union[int, bool]
    unit: str
    scope: str
    circular: str
    clause: str
    quote: str


@dataclass(frozen=True)
class Verdict:
    result: str          # PASS | FAIL | UNDETERMINED
    code: str
    detail: str = ""
    circular: str = ""
    clause: str = ""
    quote: str = ""
    source: str = ""

    def render(self) -> str:
        if self.result == "PASS":
            return f"PASS {self.source} · {self.circular} {self.clause}"
        return (f'{self.result} {self.code} · {self.source} · '
                f'{self.circular} {self.clause} · "{self.quote}" · {self.detail}')


def _fmt(v, unit):
    if unit == "INR_paise" and isinstance(v, int):
        return f"₹{v // 100:,}"
    return str(v)


def check_claim(declared: Declared, authorities: List[Authoritative]) -> Verdict:
    """Never returns PASS without an authority. Absence of authority is abstention,
    not permission — the architecture's fail-closed rule."""

    if declared.confidence < CONFIDENCE_FLOOR:
        return Verdict("UNDETERMINED", "low_confidence",
                       f"extraction confidence {declared.confidence:.2f} < {CONFIDENCE_FLOOR}",
                       source=declared.source)

    subject_matches = [a for a in authorities if a.subject == declared.subject]
    if not subject_matches:
        return Verdict("UNDETERMINED", "no_authority_found",
                       f"no authoritative claim for subject {declared.subject!r}",
                       source=declared.source)

    # Prefer an authority whose unit matches; that is the only comparable one.
    unit_matches = [a for a in subject_matches if a.unit == declared.unit]
    if not unit_matches:
        a = subject_matches[0]
        return Verdict("UNDETERMINED", "unit_mismatch",
                       f"declared unit {declared.unit!r}, authority is {a.unit!r} — not comparable",
                       a.circular, a.clause, a.quote, declared.source)

    # --- predicate claims (drift #4: "Guaranteed Collection") ---
    if declared.unit == "predicate":
        a = unit_matches[0]
        if declared.value != a.value:
            return Verdict("FAIL", "predicate_contradiction",
                           f"declared {declared.subject}={declared.value}, "
                           f"circular states {a.value}",
                           a.circular, a.clause, a.quote, declared.source)
        return Verdict("PASS", "conformant", "", a.circular, a.clause, a.quote, declared.source)

    # --- omission (drift #2) ---
    if declared.value is None:
        a = unit_matches[0]
        return Verdict("FAIL", "omitted",
                       f"no bound declared, but {a.circular} {a.clause} sets "
                       f"{_fmt(a.value, a.unit)} {a.scope}",
                       a.circular, a.clause, a.quote, declared.source)

    # --- scope mismatch (drifts #1 and #3) ---
    scoped = [a for a in unit_matches if _scope_eq(a.scope, declared.scope)]
    if not scoped:
        # The value may exist in the circular under a DIFFERENT scope — that is the
        # 3x error: right number, wrong unit of account.
        same_value = [a for a in unit_matches if a.value == declared.value]
        a = same_value[0] if same_value else unit_matches[0]
        extra = (" — the value is correct but the scope is not; this is the "
                 "SEP #216 failure mode" if same_value else "")
        return Verdict("FAIL", "scope_mismatch",
                       f"declared scope {declared.scope!r}, circular authorises "
                       f"{_fmt(a.value, a.unit)} {a.scope!r}{extra}",
                       a.circular, a.clause, a.quote, declared.source)

    a = scoped[0]

    # Before calling this an over-claim, check whether the declared value is an EXACT
    # match for a DIFFERENT scope's authority. If it is, the defect is mislabelling, not
    # excess — "₹15,000 per transaction" is the monthly cap wearing the wrong label.
    # Diagnosing that as value_exceeds_authority would name the wrong bug and imply the
    # wrong fix (lower the number, rather than correct the scope). This IS SEP #216.
    if declared.value != a.value:
        elsewhere = [x for x in unit_matches
                     if x.value == declared.value and not _scope_eq(x.scope, declared.scope)]
        if elsewhere:
            e = elsewhere[0]
            return Verdict("FAIL", "scope_mismatch",
                           f"declared {_fmt(declared.value, e.unit)} as {declared.scope!r}, "
                           f"but the circular sets that figure as {e.scope!r}; the "
                           f"{declared.scope!r} limit is {_fmt(a.value, a.unit)} — the value is "
                           f"correct and the scope is not, which is the SEP #216 failure mode",
                           e.circular, e.clause, e.quote, declared.source)

    # --- value exceeds authority (drift #5, ours) ---
    if declared.value > a.value:
        return Verdict("FAIL", "value_exceeds_authority",
                       f"declared {_fmt(declared.value, a.unit)} > authorised "
                       f"{_fmt(a.value, a.unit)} {a.scope}",
                       a.circular, a.clause, a.quote, declared.source)

    # Stricter than authorised is conformant.
    return Verdict("PASS", "conformant",
                   f"{_fmt(declared.value, a.unit)} within {_fmt(a.value, a.unit)} {a.scope}",
                   a.circular, a.clause, a.quote, declared.source)
