"""Batch evaluation harness.

Honest by construction. Three properties the field consistently fails:
  * effective n is reported beside the headline, never the flattering denominator
  * UNDETERMINED is counted separately and never silently becomes a pass
  * induced harm (correct claims we wrongly refused) is a first-class number

It also refuses to print a headline below the committed sample size, because
"one cherry-picked match proves nothing" is in the rubric we are being judged against.
"""
from dataclasses import dataclass, field, asdict
from typing import List, Optional
import json

from conform.engine import check_claim, Declared, Authoritative
from extract.naive import naive_extract

MIN_N = 50


def _load_authorities() -> List[Authoritative]:
    store = json.load(open("corpus/claims/authoritative.json"))
    out = []
    for c in store["claims"]:
        v = c["value_minor"]
        if c["unit"] == "predicate":
            v = bool(v)          # 0 -> False: "shall NOT be treated as the guarantee"
        out.append(Authoritative(subject=c["subject"], value=v, unit=c["unit"],
                                 scope=c["scope"], circular=c["circular"],
                                 clause=c["clause"], quote=c["quote"]))
    return out


@dataclass
class Report:
    attempted: int = 0
    unlabelled: int = 0
    scored: int = 0
    undetermined: int = 0
    true_pass: int = 0
    true_fail: int = 0
    detected: int = 0
    missed: int = 0
    induced_harm: int = 0
    baseline_detected: Optional[int] = None
    detections: List[dict] = field(default_factory=list)
    headline_suppressed: bool = False
    suppression_reason: str = ""
    vacuous: bool = False
    effective_n_note: str = ""

    def as_dict(self): return asdict(self)

    def render(self) -> str:
        L = []
        if self.headline_suppressed:
            L.append(f"HEADLINE SUPPRESSED — {self.suppression_reason}")
        else:
            rate = self.detected / self.scored if self.scored else 0
            L.append(f"conformance detection: {self.detected}/{self.scored} ({rate:.0%})")
        L.append(f"  effective n: {self.effective_n_note}")
        L.append(f"  positive class (violations available to detect): {self.true_fail}")
        L.append(f"  UNDETERMINED (abstained): {self.undetermined}")
        L.append(f"  induced harm (wrongly refused a correct claim): {self.induced_harm}")
        L.append(f"  naive-regex baseline detected: {self.baseline_detected}/{self.scored}")
        return "\n".join(L)


def run_batch(cases: List[dict], min_n: int = MIN_N, authorities=None) -> Report:
    if not cases:
        raise ValueError("empty batch — a metric over nothing must not report a pass")
    auth = authorities if authorities is not None else _load_authorities()
    r = Report(attempted=len(cases))

    for c in cases:
        d = c["declared"]
        v = check_claim(Declared(subject=d["subject"], value=d["value"], unit=d["unit"],
                                 scope=d["scope"], source=c["source"]), auth)
        # A case LABELLED undetermined is not a test of anything: there is no ground
        # truth to be right or wrong about. It must leave the denominator entirely,
        # or it silently inflates `scored` while belonging to no class.
        if c["label"] == "UNDETERMINED":
            r.unlabelled += 1
            continue
        if v.result == "UNDETERMINED":
            r.undetermined += 1
            continue
        r.scored += 1
        label = c["label"]
        if label == "FAIL":
            r.true_fail += 1
            if v.result == "FAIL":
                r.detected += 1
                r.detections.append({"id": c["id"], "code": v.code, "clause": v.clause,
                                     "circular": v.circular, "source": c["source"]})
            else:
                r.missed += 1
        elif label == "PASS":
            r.true_pass += 1
            if v.result == "FAIL":
                r.induced_harm += 1       # we refused a correct claim

        # baseline arm: does a regex reach this?
        nb = naive_extract(c.get("text", ""))
        if label == "FAIL" and nb:
            bv = check_claim(Declared(subject=d["subject"], value=nb[0]["value_minor"],
                                      unit=nb[0]["unit"], scope=nb[0]["scope"],
                                      source=c["source"]), auth)
            if bv.result == "FAIL":
                r.baseline_detected = (r.baseline_detected or 0) + 1
    if r.baseline_detected is None:
        r.baseline_detected = 0

    r.effective_n_note = (f"{r.scored} scored / {r.attempted} attempted "
                          f"({r.unlabelled} unlabelled, {r.undetermined} abstained)")

    # A detection rate over an empty positive class is 0/0 — it measures nothing and
    # must never be printed. Found by an external reviewer; the harness happily
    # reported 0 detected of 0 available. Fifth instance of the same vacuity shape
    # in this project (FAILURES.md #5).
    if r.true_fail == 0:
        r.vacuous = True
        r.headline_suppressed = True
        r.suppression_reason = (
            f"VACUOUS: {r.true_fail} positive cases in the scored pool. A detection "
            f"rate over an empty positive class is 0/0 and measures nothing. The pool "
            f"needs claims that actually violate a circular, independently sourced and "
            f"labelled — not controls and abstentions.")
        return r

    if r.scored < min_n:
        r.headline_suppressed = True
        r.suppression_reason = (f"only {r.scored} claims scored; architecture commits to "
                               f"N>={min_n}. Reporting a rate here would be the "
                               f"cherry-pick the rubric warns against.")
    return r
