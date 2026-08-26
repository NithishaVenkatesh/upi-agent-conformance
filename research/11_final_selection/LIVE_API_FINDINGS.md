# Kill-gate 2: PASSED — and the live API produced two new drifts plus a correction to our own

Probed 2026-08-27 against real Razorpay test-mode credentials.
Raw: `eval/probe_findings.json` · `research/00_competition_context/testmode_probe_results.json`

## 1. The gate: Reserve Pay works in test mode — `FACT`

```
[PASS] GATING *** CREATE UPI RESERVE PAY MANDATE ORDER ***  (HTTP 200)
```

`create_order` with `token.type = "single_block_multiple_debit"` returns **HTTP 200** and a real order id. **The architecture's primary rail is available.** No fallback needed.

Also observed: **Subscriptions and Plans return HTTP 401** on this account — so **UPI Autopay, the documented fallback, is *not* available here.** Had the gate failed, the fallback would have failed too. Settlements and Disputes are reachable.

## 2. What the live API actually enforces — probed by binary search

| Parameter | Live API accepts up to | OC-228 Issuer §5 authorises | Gap |
|---|---|---|---|
| `token.max_amount` | **₹15,000** (rejects ₹15,001) | **₹10,000** | **+₹5,000 (1.5×)** |
| `token.expire_at` | **91 days** (rejects 120) | **90 days** | **+1 day** |

Verbatim rejections:
> *"Max amount for SBMD mandate cannot be greater than Rs. 15,000.00"*
> *"Token expiry cannot be greater than 90 days for SBMD mandate."*

Note the second: **the error says 90, and the API accepts 91.** The message and the enforcement disagree by a day.

## 3. ⚠️ CORRECTION to our own drift #2 — `FACT`

We claimed: *"Razorpay MCP server — no limit stated or validated at all."*

**That is wrong at the API level, and the API is what matters.**
- `max_amount` is **mandatory**: *"The max_amount field is mandatory for UPI mandate creation."*
- Both bounds are **enforced server-side**, as shown above.

The accurate, narrower claim: **the MCP tool schema does not document the limits, but the API rejects violations.** A caller learns the bound by having a request refused, not by reading the interface.

That is a real usability and safety gap — an agent cannot know a bound before violating it — but it is **not** "no validation". Corrected in the drift table; the original overclaim is logged as `FAILURES.md` #6.

## 4. Two new drifts, found by execution rather than reading

| # | Source | Declared | Circular | Failure mode |
|---|---|---|---|---|
| **6** | Razorpay live API | `max_amount` ≤ **₹15,000** | OC-228 §5: **₹10,000** | **Enforcement exceeds authority (1.5×)** |
| **7** | Razorpay live API | `expire_at` ≤ **91 days** | OC-228 §5: **90 days** | **Off-by-one; error text says 90** |

**Both were found by running code, not reading documents.** Every earlier drift came from prose; these come from the rail itself.

### ⚠️ The honest caveat, which matters

**We cannot conclude from the public record that ₹15,000 is unauthorised.** Possible explanations we cannot rule out:
- a later circular raised the SBMD cap and is not in our corpus (OC-228 is the latest we retrieved, but NPCI 403s programmatic access and our enumeration may be incomplete);
- a different **purpose code** applies — the corpus already shows PC-76 (securities) operating at ₹5 lakh, so SBMD caps are demonstrably purpose-dependent;
- test mode may use different limits from production.

**So the finding is not "Razorpay is wrong."** It is: *the live rail permits 1.5× what the circular we can retrieve authorises, and nothing anywhere surfaces or explains the difference.* That is precisely the gap this project exists to make visible — and note that we found it in ninety seconds of probing, having spent days failing to find it in documentation.

## 5. Why this matters for the measurement

These two cases are the **strongest in the corpus**, because the declared constraint is stated by **the counterparty's own running code**, not its prose. The label cannot be argued to have come from us: the API said it, the circular judged it.

The scored batch moved from **0 positive cases (VACUOUS)** to **2 detected of 2**. Still far from N=50 — but the positive class is no longer empty, and `eval/probe_cases.py` is a repeatable generator rather than a hand-curated list.
