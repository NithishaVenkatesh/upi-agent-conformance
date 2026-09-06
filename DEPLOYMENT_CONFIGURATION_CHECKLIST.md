# Deployment Configuration Checklist

Quick reference for setting up Vercel frontend and Railway backend.

## Before You Start

1. Have your Vercel project URL ready (e.g., `https://myapp.vercel.app`)
2. Have your Railway project URL ready (e.g., `https://backend.railway.app`)
3. Have Razorpay test API credentials ready (`rzp_test_*` key and secret)
4. Be logged into both Vercel and Railway dashboards

---

## Vercel Frontend Configuration

### ✓ Step 1: Get Your Frontend URL

```
Your Vercel Frontend URL: https://______.vercel.app
                         (or your custom domain)
```

**Where to find:** Vercel Dashboard → Project → Deployments → Visit domain

### ✓ Step 2: Get Your Backend URL

```
Your Railway Backend URL: https://______.railway.app
```

**Where to find:** Railway Dashboard → Project → merchant service → Public URL

### ✓ Step 3: Add Environment Variables

**In Vercel Dashboard:**

1. Click "Settings" tab
2. Click "Environment Variables" (left sidebar)
3. Add this variable:

```
Name:  MERCHANT_URL
Value: https://______.railway.app
```

4. Select Environments: ☑ Production ☑ Preview ☑ Development
5. Click "Add"

**Result:** Vercel now knows where to find the backend

### ✓ Step 4: Redeploy Frontend

1. Go to "Deployments" tab
2. Find your active deployment
3. Click three dots menu → "Redeploy"
4. Wait for "Ready" status (takes ~2-3 min)

**Verification:** Try to reach checkout page at `https://______.vercel.app/app/checkout`

---

## Railway Backend Configuration

### ✓ Step 1: Navigate to Variables

**In Railway Dashboard:**

1. Click your project
2. Click "merchant" service
3. Click "Variables" tab

### ✓ Step 2: Add ALLOWED_ORIGINS

This is the most critical variable (causes 403 errors if wrong).

```
Name:  ALLOWED_ORIGINS
Value: https://______.vercel.app
```

where `https://______.vercel.app` is your Vercel frontend URL exactly as shown in browser.

**If you have multiple environments, add all:**
```
https://myapp.vercel.app,http://localhost:3000,http://127.0.0.1:3000
```

Click "Add"

**Result:** Backend now accepts requests from your frontend

### ✓ Step 3: Add Razorpay Credentials

**Add RAZORPAY_KEY_ID:**

```
Name:  RAZORPAY_KEY_ID
Value: rzp_test_xxxxxxxxxxxxxxxx
```

Click "Add"

**Add RAZORPAY_KEY_SECRET:**

```
Name:  RAZORPAY_KEY_SECRET
Value: xxxxxxxxxxxxxxxxxxxx
```

Click "Add"

**Important:** These should be Secret variables in production. In Railway, mark them as secret.

**Where to get credentials:**
1. Log into Razorpay Dashboard
2. Settings → API Keys
3. Copy "Key ID" (starts with `rzp_test_`)
4. Copy "Key Secret"

### ✓ Step 4: Verify Deployment

**In Railway:**

1. Click "Deployments" tab
2. Wait for status to show "Success"
3. No manual redeploy needed - changes take effect immediately

---

## Testing Configuration

### Quick Smoke Test

1. Open your Vercel frontend: `https://______.vercel.app/app/checkout`
2. Open browser Developer Tools (F12)
3. Click Console tab
4. Add an item to cart
5. Click "Proceed to Payment"
6. Watch for errors in console

**Expected:** Should see checkout session created (no 403 errors)

### Diagnostic: Check Origins

Run this in browser console on your Vercel frontend:

```javascript
// Check current origin
console.log('Current origin:', window.location.origin);

// Verify it's included in backend ALLOWED_ORIGINS
```

### Diagnostic: Check Backend is Reachable

Run this in browser console:

```javascript
// Test if backend is reachable
fetch('https://______.railway.app/').then(r => {
  console.log('Backend status:', r.status);
  if (r.status === 403) {
    console.log('ERROR: 403 Forbidden - check ALLOWED_ORIGINS');
  }
}).catch(e => {
  console.log('ERROR: Cannot reach backend -', e.message);
});
```

---

## Environment Variables Summary

### Required for Frontend (Vercel)

| Variable | Value | Example |
|----------|-------|---------|
| `MERCHANT_URL` | Railway backend URL | `https://razorpay-merchant.railway.app` |

### Required for Backend (Railway)

| Variable | Value | Example |
|----------|-------|---------|
| `ALLOWED_ORIGINS` | Your Vercel URL | `https://myapp.vercel.app` |
| `RAZORPAY_KEY_ID` | Razorpay test key | `rzp_test_abc123def456` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | `xyz789...` |

---

## Debugging 403 Forbidden Errors

### Problem: Getting 403 when clicking "Proceed to Payment"

**Step 1: Check ALLOWED_ORIGINS**

In Railway Dashboard:
1. merchant service → Variables tab
2. Find `ALLOWED_ORIGINS`
3. Value must include your Vercel frontend URL

**Step 2: Verify Exact URL Match**

In browser console on Vercel frontend:
```javascript
console.log(window.location.origin);
```

This value must be in `ALLOWED_ORIGINS` on Railway.

**Step 3: Check Both Protocols**

If you have both HTTP and HTTPS, add both:
```
http://localhost:3000,https://myapp.vercel.app
```

**Step 4: Redeploy if Changed**

After changing `ALLOWED_ORIGINS`:
- Frontend: Vercel → Deployments → Redeploy
- Backend: Railway changes take effect immediately

### Problem: 500 Error from Backend

**Possible causes:**
1. Razorpay credentials not set
2. Razorpay credentials are wrong
3. Backend service crashed

**Solutions:**
1. Check Railway → Logs for error messages
2. Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
3. Verify using `rzp_test_*` key (not `rzp_live_*`)
4. Restart the service: Railway → merchant → More → Restart

---

## Verification Checklist

### Frontend (Vercel)

- [ ] `MERCHANT_URL` environment variable is set
- [ ] `MERCHANT_URL` points to your Railway backend
- [ ] Frontend is redeployed after setting variable
- [ ] Can navigate to `/app/checkout` page
- [ ] No CORS errors in browser console

### Backend (Railway)

- [ ] `ALLOWED_ORIGINS` is set
- [ ] `ALLOWED_ORIGINS` includes your Vercel frontend URL exactly
- [ ] `RAZORPAY_KEY_ID` is set (starts with `rzp_test_`)
- [ ] `RAZORPAY_KEY_SECRET` is set
- [ ] Service status shows "Running"
- [ ] Recent logs don't show errors

### End-to-End

- [ ] Can reach frontend checkout page
- [ ] Can add items to cart
- [ ] Can create checkout (no 403 error)
- [ ] Can see "Session Created" message
- [ ] Can process payment
- [ ] Can see decision (Allowed/Refused)

---

## Common Configuration Mistakes

### ❌ Mistake 1: Wrong ALLOWED_ORIGINS Format

```
❌ WRONG:  myapp.vercel.app
✓ RIGHT:  https://myapp.vercel.app
```

Must include protocol (`https://`) and exact domain.

### ❌ Mistake 2: MERCHANT_URL with Wrong Protocol

```
❌ WRONG:  http://myapp.railway.app (should be https)
✓ RIGHT:  https://myapp.railway.app
```

For Railway, use HTTPS (HTTP may not work).

### ❌ Mistake 3: Razorpay Live Keys in Test

```
❌ WRONG:  rzp_live_abc123def456
✓ RIGHT:  rzp_test_abc123def456
```

This demo only accepts test keys (starts with `rzp_test_`).

### ❌ Mistake 4: Forgot to Redeploy

After changing Vercel environment variables:
```
❌ WRONG: Just save and expect it to work
✓ RIGHT: Redeploy the project for changes to take effect
```

Railway changes take effect immediately; Vercel requires redeploy.

### ❌ Mistake 5: Using Localhost URLs in Production

```
❌ WRONG:  ALLOWED_ORIGINS = http://localhost:3000
✓ RIGHT:  ALLOWED_ORIGINS = https://myapp.vercel.app
```

In production, use actual domain URLs.

---

## Environment Variable Templates

### Vercel Environment File (.env.local for local dev)

```env
# Local development - points to local merchant service
MERCHANT_URL=http://localhost:8080
```

### Vercel Production Environment Variables

```
MERCHANT_URL=https://razorpay-merchant.railway.app
```

### Railway Variables (merchant service)

```
ALLOWED_ORIGINS=https://myapp.vercel.app,http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

---

## Support Resources

- **Vercel Documentation:** https://vercel.com/docs/projects/environment-variables
- **Railway Documentation:** https://docs.railway.app/features/variables
- **Next.js Environment Variables:** https://nextjs.org/docs/basic-features/environment-variables
- **CORS Troubleshooting:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors

---

## Next Steps After Configuration

1. **Run Unit Tests**
   ```bash
   npm run test
   ```

2. **Run E2E Tests**
   ```bash
   npm run test:e2e
   ```

3. **Check Frontend Logs**
   - Vercel Dashboard → Deployments → Logs

4. **Check Backend Logs**
   - Railway Dashboard → Deployments → Logs

5. **Monitor in Production**
   - Watch for 403 errors in logs
   - Check transaction ledger at `/api/ledger` endpoint
