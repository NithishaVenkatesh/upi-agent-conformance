# 🚀 Full Deployment Guide - Razorpay Payment Gate

This guide will help you deploy both the backend (Python) and frontend (Next.js) to production.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│           Vercel (Frontend)                         │
│  frontend/ → NEXT_PUBLIC_API_BASE_URL               │
└────────────────┬────────────────────────────────────┘
                 │ API calls to
                 ▼
┌─────────────────────────────────────────────────────┐
│        Railway (Backend Python Server)              │
│  /api/ledger        (Get transaction history)       │
│  /api/ucp/mcp       (MCP payment tools)             │
│  /.well-known/ucp   (UCP profile)                   │
└─────────────────────────────────────────────────────┘
```

---

## Part 1: Deploy Backend to Railway.app

Railway is a simple platform to host Python applications. Free tier available.

### Step 1.1: Sign Up for Railway
1. Go to https://railway.app
2. Click "Start Project"
3. Sign in with GitHub (recommended) or email

### Step 1.2: Create a New Project
1. Click "Create New Project"
2. Select "GitHub Repo"
3. Connect your GitHub account (if prompted)
4. Select this repository (`Razorpayy`)

### Step 1.3: Configure for Python Backend
1. Click "Add Service"
2. Select "Database" → Choose PostgreSQL (or skip if not needed)
3. Click "Add Service" → "GitHub Repo"
4. Select this repo again
5. In the settings, configure:
   - **Root Directory**: Leave empty (or set to `/RazorPay` if Railway can't find the app)
   - **Start Command**: 
     ```
     python -m merchant.server
     ```
   - **Environment**: Click "Variables" and add:
     ```
     PORT=8080
     BIND_HOST=0.0.0.0
     ALLOWED_ORIGINS=https://your-vercel-url.vercel.app,http://localhost:3000
     ```

### Step 1.4: Get Your Backend URL
1. After deployment, go to your Railway dashboard
2. Click on your service
3. Copy the **Railway URL** (looks like `https://xxx-xxx-xxx.railway.app`)
4. **Save this URL** — you'll need it for frontend deployment

---

## Part 2: Deploy Frontend to Vercel

### Step 2.1: Sign Up for Vercel
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub repos

### Step 2.2: Import Your Project
1. After signing in, click "Add New..." → "Project"
2. Find and select your `Razorpayy` repository
3. Click "Import"

### Step 2.3: Configure Environment Variables
1. After import, you'll see a "Configure Project" screen
2. Under "Environment Variables", add:
   ```
   NEXT_PUBLIC_API_BASE_URL = https://your-railway-url.railway.app
   NEXT_PUBLIC_MERCHANT_SERVER_URL = https://your-railway-url.railway.app
   NEXT_PUBLIC_DEMO_MODE = true
   ```
   
   Replace `your-railway-url` with the URL from Step 1.4

3. Set **Root Directory**: `RazorPay/frontend`

### Step 2.4: Deploy
1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. After deployment, you'll get a **Vercel URL** (looks like `https://xxx.vercel.app`)

### Step 2.5: Update Backend CORS Configuration
Now that you have your Vercel URL, update the backend to allow it:

1. Go back to Railway dashboard
2. Click your backend service
3. Click "Variables" 
4. Update `ALLOWED_ORIGINS`:
   ```
   https://your-vercel-url.vercel.app,http://localhost:3000
   ```
5. The app will auto-redeploy with the new CORS settings

---

## Part 3: Verification Checklist

### ✅ Test Your Deployment

1. **Frontend loads**
   - Open your Vercel URL in a browser
   - Should see the landing page

2. **Can login**
   - Click "Sign in as judge"
   - Use: `judge@razorpay.dev` / `demo`
   - Should see the dashboard

3. **Backend is connected**
   - Dashboard should load transaction data (or fallback to mock data)
   - Check browser console (F12 → Console tab) for any errors
   - No CORS errors should appear

4. **Click a transaction**
   - Click any row in the transactions table
   - Should navigate to detail view with GateFlow animation

5. **API is accessible**
   - Visit: `https://your-railway-url.railway.app/api/ledger`
   - Should see JSON array of ledger entries

---

## Part 4: Environment Variables Reference

### Backend Environment Variables (Railway)

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | 8080 | Server port |
| `BIND_HOST` | 127.0.0.1 | Listen address (use `0.0.0.0` for deployed) |
| `ALLOWED_ORIGINS` | `http://127.0.0.1,http://localhost` | CORS allowed origins |

### Frontend Environment Variables (Vercel)

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `https://xxx.railway.app` |
| `NEXT_PUBLIC_MERCHANT_SERVER_URL` | Merchant server URL | `https://xxx.railway.app` |
| `NEXT_PUBLIC_DEMO_MODE` | Enable demo mode | `true` |

---

## Part 5: Troubleshooting

### "Backend API not found" error
- Check that `NEXT_PUBLIC_API_BASE_URL` matches your Railway URL
- Make sure Railway backend is deployed and running
- Check Railway logs for errors

### CORS errors in browser console
- Add your Vercel URL to `ALLOWED_ORIGINS` in Railway
- Wait for Railway to redeploy (auto-redeploys on env var change)

### "No transactions showing"
- This is normal — it will show mock data if ledger is empty
- Run `make demo` locally to generate sample ledger data, or
- Just use the fallback mock transactions shown in the UI

### Build fails on Vercel
- Make sure **Root Directory** is set to `RazorPay/frontend`
- Check Vercel logs for the specific error
- Verify `package.json` exists in `RazorPay/frontend/`

### Railway deployment fails
- Make sure **Start Command** is: `python -m merchant.server`
- Check Railway logs for Python errors
- Verify Python version compatibility (should work on 3.8+)

---

## Part 6: Local Testing Before Deployment

Before deploying, test locally:

```bash
# Terminal 1: Start backend
cd RazorPay
BIND_HOST=0.0.0.0 python -m merchant.server

# Terminal 2: Start frontend
cd RazorPay/frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 npm run dev
```

Then visit `http://localhost:3000` and verify:
- [ ] Login works
- [ ] Dashboard loads transactions
- [ ] Can click through to transaction detail
- [ ] Browser console has no errors

---

## Part 7: Post-Deployment

### Monitor Logs
- **Vercel**: https://vercel.com/dashboard → click project → "Logs"
- **Railway**: https://railway.app → click project → "Logs"

### Update ALLOWED_ORIGINS
If you deploy multiple frontends or update URLs, update Railway env vars:
```
ALLOWED_ORIGINS=https://prod.vercel.app,https://staging.vercel.app,http://localhost:3000
```

### Database (Optional)
The payment gate doesn't require a database for basic operation — ledger is stored as JSONL file. For production, consider:
- Move ledger to PostgreSQL for durability
- Add Redis for session management
- Use S3 for ledger backup

---

## Quick Reference: Copy-Paste URLs

After deployment, update these in your notes:

```
Frontend URL: https://[your-vercel-project].vercel.app
Backend URL:  https://[your-railway-service].railway.app
Demo Login:   judge@razorpay.dev / demo
```

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Check GitHub Issues**: Add your error message to search existing issues

---

**Last Updated**: 2026-09-04
**Status**: Ready for Hackathon Demo 🎉
