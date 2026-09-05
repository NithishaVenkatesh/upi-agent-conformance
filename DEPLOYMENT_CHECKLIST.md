# ✅ Deployment Checklist

Use this checklist to track your deployment progress.

---

## PRE-DEPLOYMENT (Local Testing)

- [ ] Clone/pull the latest code
- [ ] Backend starts: `cd RazorPay && python -m merchant.server`
- [ ] Backend API responds: `curl http://localhost:8080/api/ledger`
- [ ] Frontend builds: `cd frontend && npm run build` (no errors)
- [ ] Frontend dev server starts: `npm run dev`
- [ ] Frontend loads at `http://localhost:3000`
- [ ] Can login with `judge@razorpay.dev` / `demo`
- [ ] Dashboard shows transaction table
- [ ] Click a transaction → detail page loads
- [ ] Browser console has no errors

---

## BACKEND DEPLOYMENT (Railway)

### Account Setup
- [ ] Created Railway.app account
- [ ] Connected GitHub
- [ ] Created new project

### Configuration
- [ ] Selected "RazorPay" repository
- [ ] Root directory: `RazorPay` (or auto-detected)
- [ ] Start command: `python -m merchant.server`
- [ ] Environment variables added:
  - [ ] `PORT=8080`
  - [ ] `BIND_HOST=0.0.0.0`
  - [ ] `ALLOWED_ORIGINS=http://localhost:3000`

### Verification
- [ ] Deployment successful (no red errors in logs)
- [ ] Logs show: `merchant on http://0.0.0.0:8080`
- [ ] Railway URL copied: `_____________________`
- [ ] API endpoint responds: `https://[railway-url]/api/ledger`

---

## FRONTEND DEPLOYMENT (Vercel)

### Account Setup
- [ ] Created Vercel account
- [ ] Connected GitHub
- [ ] Project imported

### Configuration
- [ ] Project name: `razorpayy-frontend`
- [ ] Framework: Next.js (auto-detected)
- [ ] Root directory: `RazorPay/frontend`
- [ ] Environment variables added:
  - [ ] `NEXT_PUBLIC_API_BASE_URL=https://[railway-url]`
  - [ ] `NEXT_PUBLIC_MERCHANT_SERVER_URL=https://[railway-url]`
  - [ ] `NEXT_PUBLIC_DEMO_MODE=true`
- [ ] Deployment initiated

### Verification
- [ ] Build successful (shows green checkmark)
- [ ] Frontend loads at Vercel URL
- [ ] Vercel URL copied: `_____________________`

---

## POST-DEPLOYMENT SETUP

- [ ] Went back to Railway dashboard
- [ ] Updated `ALLOWED_ORIGINS` to include Vercel URL:
  ```
  https://[vercel-url].vercel.app,http://localhost:3000
  ```
- [ ] Railway service redeployed (check logs)

---

## FINAL VERIFICATION (Live Testing)

### Access Test
- [ ] Frontend URL opens without errors
- [ ] No "connection refused" messages

### Login Test
- [ ] Navigate to `/login` page
- [ ] Pre-filled credentials: `judge@razorpay.dev` / `demo`
- [ ] Click "Sign in" → redirects to `/app`

### Dashboard Test
- [ ] Dashboard loads
- [ ] Transactions table visible
- [ ] Status filter works (All/Allowed/Refused/Undetermined)
- [ ] No CORS errors in browser console (F12)

### Transaction Detail Test
- [ ] Click any transaction row
- [ ] GateFlow animation plays
- [ ] Evidence block displays decision
- [ ] JSON payload expandable
- [ ] All components render without errors

### API Test
- [ ] Visit: `https://[railway-url]/api/ledger`
- [ ] JSON response visible (array of entries)
- [ ] No HTTP 403 or 404 errors

### Browser Console Test (F12 → Console)
- [ ] No red error messages
- [ ] No CORS warnings
- [ ] Network tab shows successful API calls

---

## DEMO PREPARATION

### Credentials
- [ ] Demo login: `judge@razorpay.dev` / `demo` ✓
- [ ] Know your frontend URL
- [ ] Know your backend URL

### Demo Script
- [ ] Can show landing page (typographic hero)
- [ ] Can login and reach dashboard
- [ ] Can click transactions and show detail
- [ ] Can show evidence block with clause citation
- [ ] Can show constraints page
- [ ] Can show ledger chain

### Backup Plan
- [ ] If backend fails during demo, frontend falls back to mock data
- [ ] Mock data is built-in, so no network required for fallback
- [ ] Can still demo all UI features without live backend

---

## TROUBLESHOOTING LOG

If something doesn't work, note it here:

| Issue | Solution | Status |
|-------|----------|--------|
| | | |
| | | |
| | | |

---

## DEPLOYMENT SUMMARY

```
🎉 Deployment Complete!

Frontend:  https://__________________.vercel.app
Backend:   https://__________________.railway.app
Demo Login: judge@razorpay.dev / demo

Last Updated: __________
Deployed By:  __________
```

---

## URLS TO SHARE

**For Judges:**
```
Demo URL: https://[your-vercel-url].vercel.app
Login: judge@razorpay.dev / demo
Architecture: See README.md in repo
```

**For Yourself (Notes):**
```
Vercel Dashboard: https://vercel.com/dashboard
Railway Dashboard: https://railway.app
Frontend Logs: https://vercel.com/dashboard → [project] → Deployments
Backend Logs: https://railway.app → [service] → Logs
```

---

**Good luck with your demo! 🚀**
