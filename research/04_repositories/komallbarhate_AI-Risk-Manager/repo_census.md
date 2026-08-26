# Repo census: komallbarhate_AI-Risk-Manager

- source: https://github.com/komallbarhate/AI-Risk-Manager.git
- head: b528366
- last commit: 2026-08-22T05:30:48+05:30
- first commit: 2026-08-22T05:16:08+05:30
- commits (shallow 50): 2
- authors:      2	komallbarhate;
- tracked files: 32
- repo size:  44M

## Language mix (tracked, by file count)
  16 py
   8 csv
   2 parquet
   2 md
   1 txt
   1 pkl
   1 jsonl

## Largest tracked source files
17244	data/raw/olist_orders_dataset.csv
15408	data/processed/train.parquet
15080	data/raw/olist_order_items_dataset.csv
14012	data/raw/olist_order_reviews_dataset.csv
8824	data/raw/olist_customers_dataset.csv
5644	data/raw/olist_order_payments_dataset.csv
4092	data/processed/test.parquet
2324	data/raw/olist_products_dataset.csv
672	models/risk_scorer.pkl
172	data/raw/olist_sellers_dataset.csv
36	logs/audit_trail.jsonl
16	scripts/label_count_audit.py
16	README.md
16	pipeline/feature_builder.py
16	demo.py
12	scripts/r5_signal_validation.py
12	scoring/model.py
12	eval/evaluate.py
8	scripts/repeat_customer_analysis.py
8	scoring/heuristics.py
8	agent/decision_engine.py
4	scripts/find_real_failure_case.py
4	scripts/download_olist.py
4	scoring/__init__.py
4	requirements.txt
4	reports/evaluation_summary.md
4	pipeline/__init__.py
4	eval/__init__.py
4	data/raw/product_category_name_translation.csv
4	agent/audit_logger.py

## Signal files present
  PRESENT  README.md
  PRESENT  requirements.txt

## Directory tree (depth 3, excluding vendor/build)
.
agent
data
data/processed
data/raw
eval
logs
models
pipeline
reports
scoring
scripts

## Heuristic signal grep (counts)
  openai\|anthropic\|gemini\|litellm\|langchain\|llamaindex\|crewai\|autogen 0
  prompt                                                  0
  retry\|backoff\|tenacity                                0
  audit                                                   42
  precision\|recall\|f1_score\|confusion                  0
  eval\b\|evaluate\|benchmark                             0
  webhook                                                 0
  razorpay\|stripe\|paypal\|adyen                         0
  try:\|except\|catch\s*(                                 0
  test_\|describe(\|it(                                   0
  TODO\|FIXME\|HACK                                       0
  demo_mode\|MOCK\|hardcod\|dummy\|sample_data            0
