"""Env loading. Regression: only the probe loaded .env, so `make demo` reported
'STUBBED (no rzp_test_ keys present)' with valid keys sitting in the file beside it.
A demo that understates what it is wired to is as wrong as one that overstates it."""
import os, pytest
from gate.config import load_env

def test_loads_keys_from_env_file(tmp_path):
    p = tmp_path / ".env"
    p.write_text('A_KEY=abc\nB_KEY="quoted"\n# comment\n\n')
    for k in ("A_KEY", "B_KEY"):
        os.environ.pop(k, None)
    names = load_env(p)
    assert os.environ["A_KEY"] == "abc"
    assert os.environ["B_KEY"] == "quoted"
    assert set(names) == {"A_KEY", "B_KEY"}

def test_does_not_override_existing(tmp_path):
    os.environ["EXISTING"] = "from-shell"
    p = tmp_path / ".env"; p.write_text("EXISTING=from-file\n")
    load_env(p)
    assert os.environ["EXISTING"] == "from-shell", "shell env must win over .env"

def test_missing_file_is_not_an_error(tmp_path):
    assert load_env(tmp_path / "nope") == []

def test_returns_names_never_values(tmp_path):
    p = tmp_path / ".env"; p.write_text("SECRET=hunter2\n")
    assert load_env(p) == ["SECRET"]
