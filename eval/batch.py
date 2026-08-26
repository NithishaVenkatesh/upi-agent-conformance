"""make eval — the batch. Reports honestly or refuses to report."""
import json, sys
from eval.cases import harvest, _published_drifts
from eval.harness import run_batch

def main():
    cases, prov = harvest(include_discovery_set=False)
    print("=" * 74)
    print(" CONFORMANCE BATCH")
    print("=" * 74)
    print(" provenance — every case is a claim made by someone else:")
    for k, v in prov.items():
        print(f"   {k:26} {v}")
    print()

    r = run_batch(cases)
    print(r.render())

    print("\n discovery set (reported SEPARATELY — not part of the rate):")
    d = run_batch(_published_drifts(), min_n=1)
    print(f"   {d.detected}/{d.scored} published drifts detected")
    for x in d.detections:
        print(f"     {x['source']:34} {x['code']:24} {x['circular']} {x['clause']}")
    print("   These were found BY LOOKING FOR DRIFT. Reporting that we then detect")
    print("   them is selection-authored: an existence proof, not a detection rate.")

    json.dump({"report": r.as_dict(), "provenance": prov},
              open("eval/report.json", "w"), indent=1)
    print(f"\n written: eval/report.json")

    if r.headline_suppressed:
        print(f"\n EXIT 2 — {r.suppression_reason}")
        return 2
    return 0

if __name__ == "__main__":
    sys.exit(main())
