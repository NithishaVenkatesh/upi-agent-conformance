"""Resource usage monitor - tracks API calls, tokens, and costs.

Strict accounting for Azure OpenAI usage to prevent exploitation.
"""
import json
import time
from datetime import datetime
from pathlib import Path

RESOURCE_LOG = Path("eval/resource_usage.jsonl")
RATE_LIMIT = 5  # max calls per minute
BUDGET_WARNING = 0.50  # warn at $0.50
BUDGET_HARD_LIMIT = 2.00  # hard stop at $2.00

# Pricing (as of 2026-08-27, gpt-5-mini)
PRICING = {
    "input_tokens": 0.00015 / 1000,  # $0.00015 per 1K input tokens
    "output_tokens": 0.0006 / 1000,  # $0.0006 per 1K output tokens
}


class ResourceMonitor:
    def __init__(self):
        self.calls = []
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.total_cost = 0.0
        self.start_time = time.time()
        self.load_history()

    def load_history(self):
        """Load previous usage from log."""
        if RESOURCE_LOG.exists():
            for line in open(RESOURCE_LOG):
                entry = json.loads(line)
                if entry.get("type") == "call":
                    self.total_input_tokens += entry.get("input_tokens", 0)
                    self.total_output_tokens += entry.get("output_tokens", 0)
                    self.total_cost += entry.get("cost", 0)

    def log_call(self, prompt: str, response: str, model: str = "gpt-5-mini"):
        """Log an API call with token estimation and cost calculation."""
        # Rough token estimation: ~4 chars per token
        input_tokens = len(prompt) // 4
        output_tokens = len(response) // 4

        input_cost = input_tokens * PRICING["input_tokens"]
        output_cost = output_tokens * PRICING["output_tokens"]
        total_call_cost = input_cost + output_cost

        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "type": "call",
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "input_cost": round(input_cost, 6),
            "output_cost": round(output_cost, 6),
            "cost": round(total_call_cost, 6),
        }

        # Append to log
        with open(RESOURCE_LOG, "a") as f:
            f.write(json.dumps(entry) + "\n")

        # Update running totals
        self.total_input_tokens += input_tokens
        self.total_output_tokens += output_tokens
        self.total_cost += total_call_cost
        self.calls.append(entry)

        # Check limits
        self._check_limits()

        return entry

    def _check_limits(self):
        """Check resource limits and alert."""
        if self.total_cost >= BUDGET_HARD_LIMIT:
            raise RuntimeError(
                f"HARD BUDGET LIMIT EXCEEDED: ${self.total_cost:.4f} >= ${BUDGET_HARD_LIMIT}"
            )

        if self.total_cost >= BUDGET_WARNING:
            print(f"⚠️  WARNING: Cost approaching limit: ${self.total_cost:.4f} / ${BUDGET_HARD_LIMIT}")

    def summary(self) -> dict:
        """Get usage summary."""
        elapsed = time.time() - self.start_time
        return {
            "total_calls": len(self.calls),
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "total_tokens": self.total_input_tokens + self.total_output_tokens,
            "total_cost": round(self.total_cost, 6),
            "elapsed_seconds": int(elapsed),
            "rate_limit": f"{RATE_LIMIT} calls/min",
            "budget_limit": f"${BUDGET_HARD_LIMIT}",
            "cost_ratio": f"${self.total_cost:.4f} / ${BUDGET_HARD_LIMIT}",
        }

    def print_summary(self):
        """Print resource usage summary."""
        s = self.summary()
        print("\n" + "="*60)
        print("📊 RESOURCE USAGE SUMMARY")
        print("="*60)
        print(f"✓ Total API Calls: {s['total_calls']}")
        print(f"✓ Input Tokens: {s['total_input_tokens']:,}")
        print(f"✓ Output Tokens: {s['total_output_tokens']:,}")
        print(f"✓ Total Tokens: {s['total_tokens']:,}")
        print(f"✓ Total Cost: ${s['total_cost']:.6f}")
        print(f"✓ Elapsed Time: {s['elapsed_seconds']}s")
        print(f"✓ Rate Limit: {s['rate_limit']}")
        print(f"✓ Budget: {s['cost_ratio']}")
        print("="*60 + "\n")


# Global monitor instance
monitor = ResourceMonitor()
