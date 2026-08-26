# Repo census: abhinav-phi_reflex

- source: https://github.com/abhinav-phi/reflex.git
- head: b4f2a6e
- last commit: 2026-08-26T01:44:27+05:30
- first commit: 2026-08-23T04:20:14+05:30
- commits (shallow 50): 36
- authors:     28	abhinav-phi;     7	Team Reflex;     1	Abhinav;
- tracked files: 190
- repo size: 1.2M

## Language mix (tracked, by file count)
 100 py
  28 md
  15 tsx
  15 json
  10 ts
   4 txt
   2 yml
   2 jsonl
   1 web
   1 toml
   1 sh
   1 python
   1 png
   1 mako
   1 js
   1 ini
   1 html
   1 example
   1 css

## Largest tracked source files
584	banner.png
164	apps/web/package-lock.json
44	docs/1. PRD.md
36	docs/summary.md
32	docs/2. TechSpec.md
24	docs/5. Schema.md
24	apps/eval/runner.py
24	apps/eval/pipeline.py
20	docs/8. Rules.md
20	docs/6. ImplementationPlan.md
20	docs/3. AppFlow.md
20	data/generators/reply_corpus.jsonl
20	apps/workers/runner.py
20	apps/workers/dispatcher.py
20	alembic/versions/0001_baseline.py
16	README.md
16	packages/core/models.py
16	MANUAL_STEPS.md
16	docs/7.Tracker.md
16	docs/4. Design.md
16	apps/workers/planner.py
16	apps/api/main.py
12	tests/ai/test_diagnosis_accuracy.py
12	packages/shield/guardrails.py
12	packages/connectors/razorpay.py
12	LICENSE
12	eval/PROTOCOL.md
12	docs/limitations.md
12	CONTRIBUTING.md
12	AUDIT_REMEDIATION_REPORT.md

## Signal files present
  PRESENT  README.md
  PRESENT  docker-compose.yml
  PRESENT  Makefile
  PRESENT  pyproject.toml
  PRESENT  .env.example
  PRESENT  .github/workflows

## Directory tree (depth 3, excluding vendor/build)
.
alembic
alembic/versions
apps
apps/api
apps/api/routes
apps/eval
apps/web
apps/web/src
apps/workers
data
data/generators
data/seeds
docker
docs
eval
eval/results
eval/results/20260824T194332Z-smoke
eval/results/20260824T194627Z-smoke
eval/results/20260824T203526Z-smoke
eval/results/20260824T225305Z
eval/results/dx_holdout
eval/results/g5_repro_check
eval/results/superseded_pre_amendment
packages
packages/brain
packages/connectors
packages/core
packages/ledger
packages/prompts
packages/prompts/templates
packages/shield
reflex
scripts
tests
tests/ai
tests/api
tests/e2e
tests/integration
tests/load
tests/security
tests/unit

## Heuristic signal grep (counts)
  openai\|anthropic\|gemini\|litellm\|langchain\|llamaindex\|crewai\|autogen 0
  prompt                                                  104
  retry\|backoff\|tenacity                                0
  audit                                                   104
  precision\|recall\|f1_score\|confusion                  0
  eval\b\|evaluate\|benchmark                             0
  webhook                                                 112
  razorpay\|stripe\|paypal\|adyen                         0
  try:\|except\|catch\s*(                                 0
  test_\|describe(\|it(                                   0
  TODO\|FIXME\|HACK                                       0
  demo_mode\|MOCK\|hardcod\|dummy\|sample_data            0
