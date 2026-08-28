# Manual Testing Guide

**Backend Server**: ✅ Running on http://127.0.0.1:8080
**Status**: Ready for testing

---

## What's Running

### Backend Server (Python)
- **URL**: http://127.0.0.1:8080
- **Type**: Merchant server with UCP (Universal Commerce Platform) interface
- **API Type**: MCP (Model Context Protocol) compatible
- **Port**: 8080

### Available Endpoints

#### 1. UCP Discovery
```bash
curl http://127.0.0.1:8080/.well-known/ucp
```
Returns merchant capabilities:
- ✅ Merchant profile (UPI payment handler)
- ✅ Declared constraints (from NPCI circulars)
- ✅ Payment methods (UPI, UPI Reserve Pay)
- ✅ Regulatory bounds (₹10,000 per block, 90 days validity)

#### 2. MCP Endpoint
```bash
curl -X POST http://127.0.0.1:8080/api/ucp/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

---

## Manual Testing Scenarios

### Scenario 1: Browse Product Catalog
**What it tests**: Catalog search functionality

```bash
curl -X POST http://127.0.0.1:8080/api/ucp/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_catalog",
      "arguments": {"q": "phone"}
    },
    "id": 1
  }'
```

Expected: Returns matching products

### Scenario 2: Get Product Details
**What it tests**: Product information retrieval

```bash
curl -X POST http://127.0.0.1:8080/api/ucp/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_product",
      "arguments": {"id": "prod_phone_1"}
    },
    "id": 2
  }'
```

Expected: Returns product price, description, availability

### Scenario 3: Create Checkout Session
**What it tests**: Cart and checkout initialization

```bash
curl -X POST http://127.0.0.1:8080/api/ucp/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "create_checkout",
      "arguments": {
        "items": [{"product_id": "prod_phone_1", "quantity": 1}],
        "currency": "INR",
        "block": {"max_minor": 1000000}
      }
    },
    "id": 3
  }'
```

Expected: Returns checkout_id for payment

### Scenario 4: Update Checkout (Add More Items)
**What it tests**: Checkout modification

```bash
curl -X POST http://127.0.0.1:8080/api/ucp/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "update_checkout",
      "arguments": {"checkout_id": "<checkout_id_from_scenario_3>"}
    },
    "id": 4
  }'
```

Expected: Returns updated checkout with new items

### Scenario 5: Process Payment - SUCCESS Case
**What it tests**: Successful payment within bounds

```bash
curl -X POST http://127.0.0.1:8080/api/ucp/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "complete_checkout",
      "arguments": {
        "checkout_id": "<checkout_id_from_scenario_3>",
        "idem_key": "agent_001_2026_08_27_000001"
      }
    },
    "id": 5
  }'
```

Expected: 
- Order created
- Payment processed
- Conformance verified
- Audit ledger updated

### Scenario 6: Process Payment - REFUSAL Case
**What it tests**: Payment refusal with regulatory citation

```bash
curl -X POST http://127.0.0.1:8080/api/ucp/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "complete_checkout",
      "arguments": {
        "checkout_id": "<checkout_id_from_scenario_3>",
        "block": {"max_minor": 2500000}  // ₹25,000 - exceeds ₹10,000 limit
      }
    },
    "id": 6
  }'
```

Expected:
- Payment REFUSED
- Reason: cap_exceeds_authority
- Clause cited: NPCI/UPI/OC No.228 Issuer §5
- Limit shown: ₹10,000 vs declared ₹25,000

---

## Using Python Requests (Easier)

If you prefer Python, save this as `test_manual.py`:

```python
#!/usr/bin/env python3
import json
import urllib.request

BASE_URL = "http://127.0.0.1:8080"

def call_mcp(method, params):
    """Call MCP endpoint"""
    data = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {"name": method, "arguments": params},
        "id": 1
    }
    
    req = urllib.request.Request(
        f"{BASE_URL}/api/ucp/mcp",
        data=json.dumps(data).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

# Test 1: Get UCP Profile
print("=" * 60)
print("1. UCP DISCOVERY")
print("=" * 60)
req = urllib.request.Request(f"{BASE_URL}/.well-known/ucp")
with urllib.request.urlopen(req) as response:
    profile = json.loads(response.read().decode('utf-8'))
    print(json.dumps(profile, indent=2))

# Test 2: Search Catalog
print("\n" + "=" * 60)
print("2. SEARCH CATALOG")
print("=" * 60)
result = call_mcp("search_catalog", {"q": "phone"})
print(json.dumps(result, indent=2))

# Test 3: Create Checkout
print("\n" + "=" * 60)
print("3. CREATE CHECKOUT")
print("=" * 60)
result = call_mcp("create_checkout", {
    "items": [{"product_id": "prod_phone_1", "quantity": 1}],
    "currency": "INR",
    "block": {"max_minor": 1000000}
})
print(json.dumps(result, indent=2))

# Extract checkout_id for next test
checkout_id = result.get("result", {}).get("checkout_id")

if checkout_id:
    # Test 4: Complete Payment
    print("\n" + "=" * 60)
    print("4. PROCESS PAYMENT (SUCCESS)")
    print("=" * 60)
    result = call_mcp("complete_checkout", {
        "checkout_id": checkout_id,
        "idem_key": "test_001"
    })
    print(json.dumps(result, indent=2))
```

Run with:
```bash
python3 test_manual.py
```

---

## Key Things to Look For

### When Testing Successful Payment ✅
- Order ID created (order_xxxxx)
- Status: "completed"
- Razorpay payment processed
- Audit ledger updated
- No refusal message

### When Testing Payment Refusal ❌
- Status: "refused"
- Reason code: cap_exceeds_authority, etc.
- **Regulatory clause cited** - THIS is the key innovation!
- Example: "NPCI/UPI/OC No.228 Issuer §5"
- Description of why rejected

### Audit Trail Features
After each payment:
```bash
python3 -m eval.verify_ledger
```

Should show:
- Entries verified (forward, backward, HEAD-anchored)
- No tampering detected
- All decisions logged

---

## Expected Output Examples

### Successful Payment Response
```json
{
  "order_id": "order_TUrCnwQuigNBan",
  "status": "completed",
  "amount": 25999,
  "currency": "INR",
  "payment_method": "upi",
  "conformance": "VERIFIED",
  "ledger_entry": "2026-08-27T12:34:56Z"
}
```

### Payment Refusal Response
```json
{
  "status": "refused",
  "reason": "cap_exceeds_authority",
  "refusal_clause": "NPCI/UPI/OC No.228 Issuer §5",
  "refusal_text": "The block created to be maximum of Rs.10,000 of block limit and up to 90 days.",
  "details": {
    "declared": 2500000,
    "authorized": 1000000,
    "difference": 1500000,
    "unit": "paise"
  }
}
```

---

## Server Commands

### Keep Server Running
```bash
# Server is already running in background
# To see logs, use:
ps aux | grep merchant.server
```

### Restart Server
```bash
# Kill the old one
pkill -f "merchant.server"

# Start new one
cd ~/Work/Hackathons/Razorpayy/RazorPay
python3 -m merchant.server &
```

### Stop Server
```bash
pkill -f "merchant.server"
```

---

## Testing Checklist

- [ ] UCP Discovery returns merchant profile
- [ ] Payment handlers show "in.razorpay.upi"
- [ ] Declared constraints are NPCI-cited
- [ ] Catalog search works
- [ ] Create checkout works
- [ ] Successful payment completes
- [ ] Refusal payment shows regulatory clause
- [ ] Audit ledger verifies
- [ ] No errors in responses

---

## Common Issues & Solutions

### Issue: Connection refused (127.0.0.1:8080)
**Solution**: Start the server again
```bash
cd ~/Work/Hackathons/Razorpayy/RazorPay
python3 -m merchant.server &
```

### Issue: JSON parsing errors
**Solution**: Ensure Content-Type header is set to "application/json"

### Issue: checkout_id not found in response
**Solution**: Check if create_checkout succeeded - look for "result" in response

### Issue: Payment keeps getting refused
**Solution**: Check that block max_minor doesn't exceed 1,000,000 (₹10,000 limit)

---

## What This Demonstrates

✅ **Production-Ready Backend**: Handles requests, processes payments
✅ **Regulatory Compliance**: Every decision backed by NPCI circulars
✅ **Explainable Decisions**: Refusals cite the specific regulation
✅ **Audit Trail**: Every transaction logged and verified
✅ **Error Handling**: Proper HTTP responses for all scenarios

---

## Next Steps

1. **Test all scenarios** above using curl or Python
2. **Verify audit ledger** after each payment with `python3 -m eval.verify_ledger`
3. **Document findings** - screenshot successful payment + refusal
4. **Show judges** - This is production-ready code!

**Happy testing! 🚀**
