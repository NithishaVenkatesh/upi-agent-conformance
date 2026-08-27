"""make eval — the batch. Reports honestly or refuses to report."""
import json, sys
from eval.cases import harvest, _published_drifts
from eval.harness import run_batch
from eval.probe_cache import load_cached_cases, render_comparison

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

    # THE LIVE-API DRIFT, rendered through the gate rather than formatted here.
    # FINDINGS.md M2: render_comparison() existed, was tested, and had no production
    # caller — the enforcement arm of the caveat gate protecting the single number
    # this submission leans on hardest was wired to nothing. H4 then proved, in the
    # same session, that a generator and its validator drift apart exactly through
    # gaps like this. So the figures reach a human ONLY through the function that
    # refuses to print them bare.
    _, meta = load_cached_cases()
    print(f"\n live-API drift (probed {meta['probed_at']}), rendered through the")
    print(" caveat gate — these figures cannot be printed without their hedge:\n")
    for f in meta["findings"]:
        for line in render_comparison(f).splitlines():
            print(f"   {line}")
        print()

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
