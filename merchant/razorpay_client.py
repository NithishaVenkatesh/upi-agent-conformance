"""Razorpay capture. Test mode only, by construction.

Activates when RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are present in the environment
or .env. Until then `FakeCapture` is used and the stub is DECLARED — in the README,
the architecture, and the demo output. A stub presented as a live integration would be
the same class of error this project exists to catch.
"""
import base64, json, os, urllib.error, urllib.request


class LiveKeyRefused(Exception):
    pass


# OC-228 acquirer §3 — the only retryable class, and the quote that authorises it.
_RETRY_CLAUSE = ("acquiring entities may retry maximum 3 times in 24 hours "
                 "(no retries for any other declines)")


def classify_failure(kind: str) -> dict:
    """Timeouts are retryable; nothing else is. This is a regulatory rule, not a
    reliability heuristic, so it is not tunable."""
    retryable = kind.lower() == "timeout"
    return {"kind": kind, "retryable": retryable,
            "circular": "NPCI/UPI/OC No.228", "clause": "Acquirer §3",
            "clause_quote": _RETRY_CLAUSE}


class FakeCapture:
    """Deterministic stand-in. Records calls so tests can assert on side effects."""
    def __init__(self): self.calls = []

    def __call__(self, checkout, idem_key=None):
        self.calls.append({"amount": checkout.total_minor, "currency": checkout.currency,
                           "idem_key": idem_key})
        return f"order_fake_{len(self.calls):06d}"


class RazorpayCapture:
    def __init__(self, key_id=None, key_secret=None):
        key_id = key_id or os.environ.get("RAZORPAY_KEY_ID", "")
        key_secret = key_secret or os.environ.get("RAZORPAY_KEY_SECRET", "")
        if not key_id:
            raise ValueError("RAZORPAY_KEY_ID not set")
        if not key_id.startswith("rzp_test_"):
            raise LiveKeyRefused(
                f"key is {key_id[:9]}… — this system is test-mode only. A live key "
                "could move real money; refusing before any request is made.")
        self.key_id, self.key_secret = key_id, key_secret
        self.auth = base64.b64encode(f"{key_id}:{key_secret}".encode()).decode()

    def __call__(self, checkout, idem_key=None):
        """Creates a Razorpay order for the checkout total. Orders only — no capture,
        no payout, no settlement. Test-mode orders are free and disposable."""
        body = json.dumps({"amount": checkout.total_minor, "currency": checkout.currency,
                           "receipt": checkout.id,
                           "notes": {"idem_key": idem_key or ""}}).encode()
        req = urllib.request.Request("https://api.razorpay.com/v1/orders",
                                     data=body, method="POST")
        req.add_header("Authorization", f"Basic {self.auth}")
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=25) as r:
                return json.loads(r.read())["id"]
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"razorpay {e.code}: {e.read().decode()[:200]}")
        except TimeoutError:
            raise RuntimeError("timeout")      # classify_failure() makes this retryable


def default_capture():
    """Live if test keys exist, fake otherwise. The demo prints which one is in use —
    a stubbed rail must never look like a live one."""
    if os.environ.get("RAZORPAY_KEY_ID"):
        return RazorpayCapture(), "live-test-mode"
    return FakeCapture(), "STUBBED (no rzp_test_ keys present)"
