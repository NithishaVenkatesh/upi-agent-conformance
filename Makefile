PY := $(shell [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3)

.PHONY: demo eval verify test serve all
demo:   ; @$(PY) -m eval.demo
eval:   ; @$(PY) -m eval.batch
verify: ; @$(PY) -m eval.verify_ledger && $(PY) eval/self_conformance.py && $(PY) -m eval.tamper
test:   ; @$(PY) -m pytest tests/ -q
serve:  ; @$(PY) -m merchant.server
all: test verify demo
