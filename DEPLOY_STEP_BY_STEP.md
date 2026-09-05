# 🎬 Step-by-Step Deployment Walkthrough

> **Time Estimate**: 15-20 minutes total
> **Difficulty**: Beginner-Friendly ✅

---

## 🔥 BEFORE YOU START

Make sure you have:
- [ ] GitHub account (for signing into Railway & Vercel)
- [ ] This repository pushed to GitHub
- [ ] Laptop with terminal/command line

---

## PART A: Deploy Backend to Railway (5 minutes)

### A1. Go to Railway.app
1. Open https://railway.app in your browser
2. Click **"Start Project"** (top-right button)

### A2. Sign in with GitHub
1. Click **"Continue with GitHub"**
2. Authorize Railway to access your repositories
3. You'll be redirected to the project setup page

### A3. Create New Project
1. Click **"New Project"** (or "+ Create")
2. Select **"GitHub Repo"**
3. Find and select your **Razorpayy** repository
4. Click **"Deploy"**

### A4. Wait for Initial Deploy
Railway will auto-detect it's a Python project. Let it run.
- You'll see logs streaming in
- Wait until you see: `merchant on http://0.0.0.0:8080`

### A5. Configure Environment Variables
1. Click on your deployed service
2. Click **"Variables"** tab
3. Add these variables:

| Key | Value |
|-----|-------|
| `PORT` | `8080` |
| `BIND_HOST` | `0.0.0.0` |
| `ALLOWED_ORIGINS` | `http://localhost:3000` |

4. Click "Save" — Railway auto-redeploys

### A6. Get Your Backend URL ⭐
1. Click **"Deployments"** tab
2. Under your service URL, copy the domain (looks like `xyz-prod.railway.app`)
3. **SAVE THIS** — you'll need it next!

```
My Backend URL: ___________________________
```

---

## PART B: Deploy Frontend to Vercel (10 minutes)

### B1. Go to Vercel.com
1. Open https://vercel.com in your browser
2. Click **"Sign Up"**

### B2. Sign in with GitHub
1. Click **"Continue with GitHub"**
2. Authorize Vercel
3. You're now in the Vercel dashboard

### B3. Import Your Project
1. Click **"Add New..."** (top-left)
2. Click **"Project"**
3. Click **"GitHub"** (if not already connected, click "Connect GitHub" first)
4. Search for **"Razorpayy"**
5. Click **"Select"** or **"Import"**

### B4. Configure Project Settings
1. **Project Name**: `razorpayy-frontend` (or any name)
2. **Framework**: Should auto-detect as "Next.js" ✓
3. **Root Directory**: Click to expand, set to `RazorPay/frontend`
4. Leave other settings as default

### B5. Add Environment Variables ⚠️ IMPORTANT
Click **"Environment Variables"** and add these:

**Add Variable 1:**
- **Name**: `NEXT_PUBLIC_API_BASE_URL`
- **Value**: `https://your-railway-url.railway.app` ← Replace with your backend URL from A6
- Click **"Add"**

**Add Variable 2:**
- **Name**: `NEXT_PUBLIC_MERCHANT_SERVER_URL`
- **Value**: `https://your-railway-url.railway.app` ← Same as above
- Click **"Add"**

**Add Variable 3:**
- **Name**: `NEXT_PUBLIC_DEMO_MODE`
- **Value**: `true`
- Click **"Add"**

### B6. Deploy
1. Click **"Deploy"**
2. Wait for build (usually 2-3 minutes)
3. You'll see: `✓ Production deployment successful`

### B7. Get Your Frontend URL ⭐
1. Click the **"Visit"** button, or
2. Copy the URL shown at the top (looks like `xyz.vercel.app`)

```
My Frontend URL: ___________________________
```

---

## PART C: Update Backend CORS (2 minutes)

Now the backend needs to know it's being called from your Vercel frontend.

### C1. Update Railway Configuration
1. Go back to https://railway.app
2. Click on your backend service
3. Click **"Variables"** tab
4. Find `ALLOWED_ORIGINS`
5. Change the value to:
   ```
   https://your-vercel-url.vercel.app,http://localhost:3000
   ```
   (Replace `your-vercel-url` with your actual Vercel URL from B7)

6. Click "Save"
7. Railway auto-redeploys

---

## ✅ VERIFICATION: Is It Working?

### Test 1: Frontend Loads
1. Open your Vercel URL from B7
2. Should see: Razorpay logo and "bounded agent payments" text
3. ✓ Success!

### Test 2: Can Login
1. Click **"Sign in as judge"**
2. Enter: `judge@razorpay.dev` / `demo`
3. Should see the dashboard with transactions
4. ✓ Success!

### Test 3: Backend Connected
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for any red error messages
4. If NO red errors → ✓ Success!
5. If "CORS" error → Go back to Part C and update ALLOWED_ORIGINS

### Test 4: Transaction Detail
1. Click any row in the transactions table
2. Should animate and show transaction detail
3. ✓ Success!

### Test 5: API is Live
1. In a new tab, visit: `https://your-railway-url.railway.app/api/ledger`
2. Should see JSON array of transactions
3. ✓ Success!

---

## 🎉 DEPLOYMENT COMPLETE!

Your hackathon project is now live! 🚀

### Share with judges:
```
Frontend: https://your-vercel-url.vercel.app
Login: judge@razorpay.dev / demo
```

---

## ⚠️ TROUBLESHOOTING

### Q: "Backend not found" error
**A:** 
1. Make sure `NEXT_PUBLIC_API_BASE_URL` has HTTPS (not HTTP)
2. Make sure it matches your Railway URL exactly
3. Wait 2 minutes for Railway to fully deploy
4. Refresh the page

### Q: CORS error in browser console
**A:**
1. Go to Railway dashboard
2. Update `ALLOWED_ORIGINS` with your Vercel URL
3. Wait for auto-redeploy (1 minute)
4. Refresh browser

### Q: "Vercelbuild fails"
**A:**
1. Check Root Directory is set to `RazorPay/frontend`
2. Check Vercel logs (click "Deployments" → "View Build Logs")
3. Push fix to GitHub and re-deploy

### Q: Backend won't start
**A:**
1. Check Railway logs (click service → "Logs")
2. Make sure Python version is 3.8+
3. Make sure Start Command is: `python -m merchant.server`
4. Restart deployment manually in Railway

---

## 📞 If You Get Stuck

1. **Check logs**: Always look at platform logs first
   - Railway: Service → Logs
   - Vercel: Deployments → Logs

2. **Verify URLs**: 
   - Frontend env vars must match actual Railway URL
   - Railway CORS must match actual Vercel URL

3. **Full guide**: Read `DEPLOYMENT_GUIDE.md` for more details

---

**You got this! 💪 Your hackathon project is going live!**
