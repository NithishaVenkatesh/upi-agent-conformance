# Environment Variables Guide

## Overview

The Razorpay Demo application requires environment variables to be configured in both the frontend (Vercel) and backend (Railway). This guide documents all required variables and how to set them.

## Root Cause of 403 Errors

The 403 "Forbidden" error occurs when:
1. Frontend (Vercel) makes a request to Backend (Railway)
2. The frontend Origin header is not in the backend's `ALLOWED_ORIGINS` list
3. The backend rejects the request with HTTP 403

**Example error flow:**
- Frontend URL: `https://myapp.vercel.app`
- Backend URL: `https://backend.railway.app`
- Request from frontend includes: `Origin: https://myapp.vercel.app`
- Backend checks `ALLOWED_ORIGINS` env var
- If `https://myapp.vercel.app` is not in the list → 403 Forbidden

---

## Vercel Frontend Environment Variables

### Required Variables

#### `MERCHANT_URL`
- **What it is:** Base URL of the Railway backend service
- **Format:** `https://backend-domain.railway.app` (production) or `http://localhost:8080` (local)
- **Why needed:** API routes need to know where to send checkout requests
- **Example values:**
  - Production: `https://razorpay-merchant-prod.railway.app`
  - Local dev: `http://localhost:8080`
  - Alternative: `http://127.0.0.1:8080`
- **Set in Vercel:** Environment Variables → Add `MERCHANT_URL`
- **Visibility:** Can be public (not a secret)

#### `NEXT_PUBLIC_API_BASE_URL` (Optional)
- **What it is:** Alternative to `MERCHANT_URL`, takes precedence if both are set
- **Format:** Same as `MERCHANT_URL`
- **Why needed:** Allows overriding merchant URL without changing code
- **Example:** `https://razorpay-merchant-prod.railway.app`
- **Set in Vercel:** Environment Variables → Add `NEXT_PUBLIC_API_BASE_URL`
- **Visibility:** Public (Next.js will expose this to browser)
- **Note:** If both are set, `NEXT_PUBLIC_API_BASE_URL` takes precedence

#### Local Development `.env.local`
```
MERCHANT_URL=http://localhost:8080
```

---

## Railway Backend Environment Variables

### Required Variables

#### `ALLOWED_ORIGINS`
- **What it is:** Comma-separated list of allowed frontend origins (CORS)
- **Format:** `https://origin1.com,https://origin2.com`
- **Why needed:** Prevents Cross-Origin Resource Sharing (CORS) attacks
- **Example values:**
  - Production: `https://myapp.vercel.app`
  - Development: `http://localhost:3000,http://127.0.0.1:3000`
  - Multiple: `http://localhost:3000,https://myapp.vercel.app`
  - Open (insecure): `*` (not recommended for production)
- **Set in Railway:** Project Settings → Variables → Add `ALLOWED_ORIGINS`
- **Visibility:** Can be public
- **Important:** Must exactly match the frontend's Origin header (including protocol and port)

#### `PORT` (Standard)
- **What it is:** Port the merchant server listens on
- **Format:** Port number (e.g., `8080`, `3000`)
- **Default:** `8080`
- **Why needed:** Railway needs to know which port to expose
- **Example:** `8080`
- **Set in Railway:** Project Settings → Variables
- **Visibility:** Public

#### `BIND_HOST` (Advanced)
- **What it is:** Host address to bind the server to
- **Format:** IP address (e.g., `0.0.0.0`, `127.0.0.1`)
- **Default:** `0.0.0.0` (if PORT is set), `127.0.0.1` (if PORT not set)
- **Why needed:** Controls network interface the server accepts connections on
- **Railway context:** Should be `0.0.0.0` to accept external connections
- **Set in Railway:** Project Settings → Variables
- **Visibility:** Public
- **Note:** Railway automatically sets this correctly; usually no manual configuration needed

#### `LEDGER_PATH` (Optional)
- **What it is:** Path to persistent ledger file for transaction records
- **Format:** File path (e.g., `/tmp/ledger.jsonl`, `/data/ledger.jsonl`)
- **Default:** `/tmp/ledger.jsonl`
- **Why needed:** Stores transaction history and decision logs
- **Example:** `/data/ledger.jsonl`
- **Set in Railway:** Project Settings → Variables
- **Visibility:** Can be public
- **Note:** On Railway, `/tmp` may not be persistent between restarts. Use `/data/` if persistence is needed.

---

## Razorpay API Credentials (Backend)

These are used by the merchant server to interact with the Razorpay payment rail.

#### `RAZORPAY_KEY_ID`
- **What it is:** Razorpay API key for authentication
- **Format:** String starting with `rzp_test_` (test mode) or `rzp_live_` (production)
- **Example:** `rzp_test_abc123def456`
- **Set in Railway:** Project Settings → Variables (mark as secret)
- **Visibility:** **Must be kept secret** - use Railway Secrets
- **Source:** Razorpay Dashboard → API Keys
- **Mode:** Only test keys (`rzp_test_*`) are allowed in this demo

#### `RAZORPAY_KEY_SECRET`
- **What it is:** Razorpay API secret for signing requests
- **Format:** Base64-encoded string
- **Example:** `abc123def456...` (long string)
- **Set in Railway:** Project Settings → Variables (mark as secret)
- **Visibility:** **Must be kept secret** - use Railway Secrets
- **Source:** Razorpay Dashboard → API Keys
- **Critical:** Never expose this in frontend code or version control

---

## Summary: All Environment Variables

### Frontend (Vercel)

| Variable | Type | Value | Required | Visibility |
|----------|------|-------|----------|------------|
| `MERCHANT_URL` | String | `https://backend.railway.app` | Yes | Public |
| `NEXT_PUBLIC_API_BASE_URL` | String | `https://backend.railway.app` | No (overrides MERCHANT_URL) | Public |

### Backend (Railway)

| Variable | Type | Value | Required | Visibility |
|----------|------|-------|----------|------------|
| `ALLOWED_ORIGINS` | String | `https://app.vercel.app,https://app2.vercel.app` | Yes | Public |
| `PORT` | Number | `8080` | No (default provided) | Public |
| `BIND_HOST` | String | `0.0.0.0` | No (auto-set) | Public |
| `LEDGER_PATH` | String | `/tmp/ledger.jsonl` | No (default) | Public |
| `RAZORPAY_KEY_ID` | String | `rzp_test_...` | Yes | **Secret** |
| `RAZORPAY_KEY_SECRET` | String | `...` | Yes | **Secret** |

---

## How to Diagnose 403 Errors

### Step 1: Check Browser Console
1. Open your Vercel frontend URL in a browser
2. Open Developer Tools (F12 → Console)
3. Try to create a checkout
4. Look for error messages mentioning `403` or `origin not allowed`

### Step 2: Check Frontend Logs (Vercel)
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click "Deployments" → Select the active deployment
4. Click "Logs" and filter for "checkout"
5. Look for error messages from the API routes

### Step 3: Check Backend Logs (Railway)
1. Go to [https://railway.app/dashboard](https://railway.app/dashboard)
2. Select your project
3. Click "Deployments" → Select active deployment
4. Click "Logs"
5. Look for messages like `origin not allowed` when you make requests

### Step 4: Verify Origin Header
Run this in your browser console on the frontend:
```javascript
// Log the current origin
console.log('Current Origin:', window.location.origin);
```

Then verify this exact origin is in the backend's `ALLOWED_ORIGINS` env var.

---

## Configuration Steps

### Vercel Setup

1. **Navigate to Project Settings**
   - Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Click your project
   - Click "Settings" tab
   - Click "Environment Variables" in left sidebar

2. **Add `MERCHANT_URL`**
   - Name: `MERCHANT_URL`
   - Value: `https://your-backend.railway.app` (or `http://localhost:8080` for dev)
   - Environments: Select `Production`, `Preview`, and `Development` as needed
   - Click "Add"

3. **Redeploy**
   - Go to Deployments
   - Click "Redeploy" on the current deployment
   - Wait for redeployment to complete

### Railway Setup

1. **Navigate to Project Settings**
   - Go to [https://railway.app/dashboard](https://railway.app/dashboard)
   - Click your project
   - Click the "merchant" service
   - Click "Variables" tab

2. **Add `ALLOWED_ORIGINS`**
   - Name: `ALLOWED_ORIGINS`
   - Value: `https://your-app.vercel.app` (your Vercel frontend URL)
   - Click "Add"

3. **Add Razorpay Credentials**
   - Name: `RAZORPAY_KEY_ID`
   - Value: Your Razorpay test API key (starts with `rzp_test_`)
   - Mark as "Reference" if using Railway Secrets
   - Click "Add"
   
   - Name: `RAZORPAY_KEY_SECRET`
   - Value: Your Razorpay API secret
   - Click "Add"

4. **Deploy**
   - The changes take effect immediately
   - No manual redeploy needed

### Local Development Setup

1. **Frontend `.env.local`**
   ```
   MERCHANT_URL=http://localhost:8080
   ```

2. **Backend (merchant service)**
   - Set `ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`
   - Can be set via environment or `.env` file in project root

3. **Razorpay Credentials**
   - Add to `.env` file (NOT `.env.local`)
   - Or set via command line: `export RAZORPAY_KEY_ID=rzp_test_...`

---

## Verification Checklist

Use this checklist to verify your environment variables are correctly set:

### Frontend (Vercel)

- [ ] `MERCHANT_URL` is set to your Railway backend URL
- [ ] Run `curl -s https://your-vercel-app.vercel.app/api/checkout/create` and check for errors
- [ ] Browser console shows no CORS errors
- [ ] Frontend can reach the backend

### Backend (Railway)

- [ ] `ALLOWED_ORIGINS` includes your Vercel frontend URL
- [ ] Run `curl -s https://your-railway-backend.railway.app/api/ucp/mcp -H "Origin: https://your-vercel-app.vercel.app"` 
  - Should NOT return 403
- [ ] `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
- [ ] Test key is used (starts with `rzp_test_`)

### End-to-End Test

- [ ] Navigate to frontend checkout page
- [ ] Add items to cart
- [ ] Click "Proceed to Payment" - should create checkout
- [ ] Should see "Session Created" message
- [ ] Click "Process Payment" - should process through gate
- [ ] Should see decision (Allowed or Refused)
- [ ] No 403 errors in console

---

## Common Issues and Solutions

### Issue: 403 Forbidden when creating checkout

**Causes:**
1. `ALLOWED_ORIGINS` on backend is missing the frontend URL
2. Frontend origin doesn't exactly match (e.g., missing port or protocol)
3. Environment variables not deployed yet

**Solutions:**
1. Check `ALLOWED_ORIGINS` in Railway variables:
   - Go to Railway → Project → merchant service → Variables
   - Verify it includes your frontend URL exactly
2. Add all possible origins:
   ```
   https://myapp.vercel.app,http://localhost:3000,http://127.0.0.1:3000
   ```
3. Redeploy after changing:
   - Frontend: Go to Vercel → Deployments → Redeploy
   - Backend: Changes take effect immediately on Railway

### Issue: MERCHANT_URL not found

**Cause:**
- `MERCHANT_URL` or `NEXT_PUBLIC_API_BASE_URL` environment variable not set in Vercel

**Solution:**
1. Set in Vercel: Settings → Environment Variables → Add `MERCHANT_URL`
2. Value should be your Railway backend URL
3. Redeploy

### Issue: Razorpay key not valid

**Cause:**
- Using `rzp_live_*` key (production) in test mode
- Key format is incorrect
- Key not set at all

**Solution:**
1. Use only `rzp_test_*` keys for this demo
2. Verify key format (long alphanumeric string)
3. Get from Razorpay Dashboard → API Keys

### Issue: Ledger not persisting between restarts

**Cause:**
- Using `/tmp/ledger.jsonl` on Railway (not persistent)

**Solution:**
1. Change `LEDGER_PATH` to `/data/ledger.jsonl`
2. Railway persists `/data` directory

---

## Security Best Practices

1. **Never commit secrets to git:**
   - `.env` files should be in `.gitignore`
   - Use Railway/Vercel Secret management

2. **Use different keys for different environments:**
   - Test keys for staging/preview
   - Production keys only in production environment

3. **Restrict `ALLOWED_ORIGINS`:**
   - Don't use `*` in production (opens to CSRF attacks)
   - List only your actual frontend URLs

4. **Rotate keys regularly:**
   - Change Razorpay API keys periodically
   - Update in Railway/Vercel after rotation

5. **Monitor logs:**
   - Check for 403 errors (potential attack attempts)
   - Review transaction logs regularly

---

## Next Steps

1. Follow the Configuration Steps above for your environment
2. Use the Verification Checklist to confirm setup
3. Run the Playwright tests: `npm run test:e2e`
4. Check unit tests: `npm run test`

For issues, consult the "Common Issues and Solutions" section or check logs in Vercel/Railway dashboards.
