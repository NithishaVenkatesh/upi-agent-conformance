# Troubleshooting 403 Forbidden Errors

Complete guide to diagnose and fix HTTP 403 errors in the Vercel → Railway checkout flow.

## What Causes 403 Errors?

When you click "Proceed to Payment" and get a 403 error, the backend merchant service is rejecting your request because:

1. Your **frontend Origin header** doesn't match the backend's **ALLOWED_ORIGINS** list
2. The backend is checking CORS (Cross-Origin Resource Sharing) policies

**Code that does this check** (in `merchant/server.py` line 280-284):

```python
origin = self.headers.get("Origin", "")
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://127.0.0.1,http://localhost").split(",")
is_allowed = not origin or any(origin.startswith(allowed.strip()) for allowed in allowed_origins)
if origin and not is_allowed:
    return self._send(403, {"error": "origin not allowed"})
```

---

## The 403 Error Flow

```
1. Browser at https://myapp.vercel.app sends:
   POST /api/checkout/create
   Origin: https://myapp.vercel.app
   
2. Vercel frontend API route (/api/checkout/create) forwards to Railway
   
3. Railway backend checks:
   Is "https://myapp.vercel.app" in ALLOWED_ORIGINS?
   
4. If NO → Returns 403 "origin not allowed"
   If YES → Processes the request
```

---

## Step-by-Step Diagnosis

### Step 1: Identify Your Frontend URL

**What you need:** The exact URL your frontend is running on

**In browser:**
- Copy the URL from the address bar when on checkout page
- Should look like: `https://myapp.vercel.app/app/checkout`
- Your frontend URL is: `https://myapp.vercel.app` (without the path)

**Verify in console:**
```javascript
console.log('Frontend URL:', window.location.origin);
```

**Write it down:**
```
My Frontend URL: https://______.vercel.app
```

### Step 2: Check Backend ALLOWED_ORIGINS

**In Railway Dashboard:**

1. Go to https://railway.app/dashboard
2. Click your project
3. Click "merchant" service
4. Click "Variables" tab
5. Look for `ALLOWED_ORIGINS` variable
6. Note the value

**Write it down:**
```
Backend ALLOWED_ORIGINS: _________________________________
```

### Step 3: Compare URLs

Do these match exactly?

```
Frontend URL:        https://myapp.vercel.app
ALLOWED_ORIGINS:     https://myapp.vercel.app
                     ^^ Must include protocol
                     ^^ No path (/app/checkout)
                     ^^ Must be exact match
```

**Common mismatches:**
- ❌ Frontend: `https://myapp.vercel.app` vs Backend: `http://myapp.vercel.app` (different protocol)
- ❌ Frontend: `https://myapp.vercel.app` vs Backend: `https://myapp.vercel.app:443` (different port format)
- ❌ Frontend: `https://myapp.vercel.app:3000` vs Backend: `https://myapp.vercel.app` (missing port)

### Step 4: Check Browser Network Tab

**In your browser:**

1. Open Developer Tools (F12)
2. Click "Network" tab
3. On checkout page, click "Proceed to Payment"
4. Look for request to your backend (POST to `/api/checkout/create`)
5. Click on it
6. Look for:
   - **Request Headers** → `Origin: https://myapp.vercel.app`
   - **Response Headers** → Check for CORS errors
   - **Response Status** → Look for `403`

**Example of what to look for:**

```
Request URL: https://myapp.vercel.app/api/checkout/create
Request Method: POST
Status: 403 Forbidden

Request Headers:
- Origin: https://myapp.vercel.app
- Content-Type: application/json

Response Headers:
- Content-Type: application/json
```

### Step 5: Check API Route Logs

**In Vercel Dashboard:**

1. Go to https://vercel.com/dashboard
2. Click your project
3. Click "Deployments"
4. Click the active deployment
5. Click "Logs"
6. Click "Runtime Logs" tab
7. Look for log entries when you tried to create checkout

**Example log entries:**

```
=== CHECKOUT CREATE ===
NEXT_PUBLIC_API_BASE_URL: undefined
MERCHANT_URL: https://myapp.railway.app
Resolved merchantUrl: https://myapp.railway.app
Calling endpoint: https://myapp.railway.app/api/ucp/mcp
Request origin: https://myapp.vercel.app
Backend response status: 403
Backend error 403: origin not allowed
```

### Step 6: Check Backend Logs

**In Railway Dashboard:**

1. Go to https://railway.app/dashboard
2. Click your project
3. Click "Deployments"
4. Click the active deployment
5. Click "Logs"
6. Look for entries around the time you got the 403

**Example log entries:**

```
merchant on http://0.0.0.0:8080  (/.well-known/ucp · /api/ledger · /api/ucp/mcp)
```

The merchant server logs are minimal by design (quiet under normal operation).

---

## Common Causes and Fixes

### Cause 1: ALLOWED_ORIGINS Not Set

**Symptom:** 403 error with message "origin not allowed"

**Why:** Default `ALLOWED_ORIGINS` is only `http://127.0.0.1,http://localhost`

**Fix:**

1. Go to Railway Dashboard → merchant service → Variables
2. Click "Add Variable"
3. Enter:
   - Name: `ALLOWED_ORIGINS`
   - Value: `https://myapp.vercel.app`
4. Click "Add"
5. Changes take effect immediately

### Cause 2: Wrong Frontend URL Format

**Symptom:** 403 error, you set ALLOWED_ORIGINS but still getting error

**Why:** Protocol, domain, or port doesn't match exactly

**Fix:**

1. Get exact frontend URL from browser:
   ```javascript
   console.log(window.location.origin);
   ```
2. Copy the output (e.g., `https://myapp.vercel.app`)
3. Update `ALLOWED_ORIGINS` in Railway to match exactly

### Cause 3: Using HTTP Instead of HTTPS

**Symptom:** ALLOWED_ORIGINS set but still 403

**Why:** Your frontend runs on HTTPS but ALLOWED_ORIGINS has HTTP

**Fix:**

```
❌ ALLOWED_ORIGINS: http://myapp.vercel.app
✓ ALLOWED_ORIGINS: https://myapp.vercel.app
```

Vercel always uses HTTPS, so use HTTPS in ALLOWED_ORIGINS.

### Cause 4: Multiple Environment URLs

**Symptom:** Works locally but not in production (or vice versa)

**Why:** Need to add multiple origins for different environments

**Fix:**

Add all URLs separated by commas:

```
ALLOWED_ORIGINS: http://localhost:3000,https://myapp.vercel.app
```

### Cause 5: Environment Variable Not Deployed Yet

**Symptom:** You set MERCHANT_URL in Vercel but API route can't find it

**Why:** Vercel hasn't redeployed with the new variable

**Fix:**

1. Go to Vercel Dashboard → Deployments
2. Find current deployment
3. Click three dots → "Redeploy"
4. Wait for "Ready" status
5. Try again

---

## Verification Checklist

### Vercel Frontend

- [ ] Can access checkout page: `https://myapp.vercel.app/app/checkout`
- [ ] Browser console shows: `window.location.origin` = `https://myapp.vercel.app`
- [ ] Vercel environment variable `MERCHANT_URL` is set
- [ ] `MERCHANT_URL` points to Railway backend URL (e.g., `https://myapp.railway.app`)
- [ ] Vercel deployment is "Ready" status

### Railway Backend

- [ ] Merchant service is "Running"
- [ ] Environment variable `ALLOWED_ORIGINS` is set
- [ ] `ALLOWED_ORIGINS` includes your Vercel URL exactly
- [ ] Can access: `https://myapp.railway.app/` (shows demo page)
- [ ] Port is 8080 or correctly configured

### Network Connection

- [ ] Vercel can reach Railway (no firewall blocking)
- [ ] Railway can respond with CORS headers
- [ ] Origin header matches ALLOWED_ORIGINS

---

## Testing the Fix

### Test 1: Direct Backend Call

From your browser console, test if backend accepts your origin:

```javascript
// Test 1: Check if backend is reachable
fetch('https://myapp.railway.app/api/ucp/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': window.location.origin
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/list',
    id: 1
  })
})
.then(r => {
  console.log('Status:', r.status);
  if (r.status === 403) {
    console.log('ERROR: 403 - origin not allowed');
    console.log('Check ALLOWED_ORIGINS on Railway');
  } else if (r.status === 200) {
    console.log('SUCCESS: Backend accepted your origin');
  }
  return r.json();
})
.then(data => console.log('Response:', data))
.catch(e => console.log('ERROR:', e.message));
```

**Expected outcome:**
- If 403: Your origin is not in ALLOWED_ORIGINS
- If 200: Connection works, origin is allowed

### Test 2: Create Checkout Flow

1. On checkout page, add items to cart
2. Open Developer Tools (F12)
3. Click "Proceed to Payment"
4. In Network tab, watch for `/api/checkout/create` request
5. Check status code

**Expected:**
- ✓ Status 200 = Success
- ✗ Status 403 = ALLOWED_ORIGINS problem
- ✗ Status 500 = Razorpay credentials problem
- ✗ Status 0 = Network error (backend unreachable)

### Test 3: Check Logs

**Vercel logs:**
```bash
curl -H "Authorization: Bearer VERCEL_TOKEN" \
  https://api.vercel.com/v0/deployments/{deployment_id}/logs
```

**Railway logs:**
1. Railway Dashboard → Deployments → Logs
2. Should show requests being received

---

## If Still Getting 403 After These Steps

### Nuclear Option: Test with Wildcard (Emergency Only)

⚠️ **WARNING: Security Risk - Only for testing/debug**

Temporarily allow all origins to isolate the problem:

1. Railway Dashboard → merchant → Variables
2. Set: `ALLOWED_ORIGINS=*`
3. Try the checkout flow again

**If it works with `*`:**
- Problem is ALLOWED_ORIGINS configuration
- Set it to your specific frontend URL (not `*`)

**If it still fails with `*`:**
- Problem is something else (Razorpay credentials, network, etc.)

### Check These Next

If 403 persists even with `ALLOWED_ORIGINS=*`:

1. **Check Razorpay credentials:**
   ```javascript
   // Look in Railway logs for errors mentioning Razorpay
   ```

2. **Check if backend is running:**
   ```bash
   curl https://myapp.railway.app/
   # Should show HTML page, not 500 error
   ```

3. **Check firewall/network:**
   ```bash
   curl -v https://myapp.railway.app/api/ucp/mcp \
     -H "Origin: https://myapp.vercel.app"
   # Should not be blocked
   ```

---

## Solution Summary Table

| Symptom | Cause | Fix |
|---------|-------|-----|
| 403 "origin not allowed" | ALLOWED_ORIGINS not set | Add `ALLOWED_ORIGINS=https://myapp.vercel.app` to Railway |
| 403 still after setting ALLOWED_ORIGINS | URL mismatch | Verify exact URL with `window.location.origin` and update Railway |
| 403 only in production | Missing production URL | Add production URL to ALLOWED_ORIGINS |
| 403 in development and production | Multiple URLs needed | Use `ALLOWED_ORIGINS=http://localhost:3000,https://myapp.vercel.app` |
| Frontend can't find backend | MERCHANT_URL not set in Vercel | Add `MERCHANT_URL=https://myapp.railway.app` to Vercel |
| 500 error from backend | Razorpay credentials missing | Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to Railway |

---

## Support Resources

- **Vercel Environment Variables:** https://vercel.com/docs/projects/environment-variables
- **Railway Variables:** https://docs.railway.app/features/variables
- **MDN CORS Errors:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors
- **Next.js API Routes:** https://nextjs.org/docs/api-routes/introduction

---

## Getting Help

If you're still stuck:

1. **Gather this information:**
   - Your frontend URL (from browser address bar)
   - Your backend URL (from Railway public domain)
   - Current `ALLOWED_ORIGINS` value
   - Error message and status code
   - Backend logs (last 10 lines)
   - Frontend logs (last 10 lines)

2. **Check:**
   - ENVIRONMENT_VARIABLES_GUIDE.md
   - DEPLOYMENT_CONFIGURATION_CHECKLIST.md
   - These logs

3. **Report with:**
   - Exact frontend and backend URLs
   - Exact error message
   - Exact ALLOWED_ORIGINS value
   - Whether local dev works (indicates config issue)
   - Whether production fails (indicates deployment issue)
