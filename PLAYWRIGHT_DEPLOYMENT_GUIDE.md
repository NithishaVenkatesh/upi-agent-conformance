# 🎬 Playwright Deployment Guide

Since browser automation requires actual user interaction (clicking buttons, entering data), I've created a **hybrid script** that opens real browser windows where you can perform actions manually, and the script automates the rest.

## 📋 Quick Start

### Step 1: Install Playwright Locally

```bash
cd /Users/nithisha/Work/Hackathons/Razorpayy

# Install Playwright
npm install playwright
```

### Step 2: Run the Deployment Script

```bash
node deploy-with-playwright.js
```

This will:
- Open **Railway.app** in a browser window (with your credentials ready)
- Guide you through clicking buttons
- Then open **Vercel.com** 
- Configure everything automatically
- Show you your live URLs

## 🎯 What the Script Does

### Part 1: Railway Backend (5 minutes)
1. Opens Railway.app in a real browser
2. **YOU** click: "Start Project" → "Continue with GitHub" → select "Razorpayy" → "Deploy"
3. Script automatically:
   - Detects your Railway URL
   - Configures environment variables (PORT, BIND_HOST, ALLOWED_ORIGINS)
   - Waits for deployment

### Part 2: Vercel Frontend (10 minutes)
1. Opens Vercel.com in a real browser
2. **YOU** click: "Sign In" → GitHub auth → select "Razorpayy" → "Import"
3. Script automatically:
   - Sets root directory to `RazorPay/frontend`
   - Adds all environment variables
   - Detects your Vercel URL
   - Guides you through clicking "Deploy"

### Part 3: Update CORS (2 minutes)
1. Opens Railway dashboard
2. **YOU** manually: Find ALLOWED_ORIGINS and update it
3. Script waits for confirmation

## 📊 Timeline

```
Total time: ~20 minutes

- Railway setup: 5 min (automated + your clicks)
- Wait: 30 sec (for Railway to be ready)
- Vercel setup: 10 min (automated + your clicks)
- CORS update: 2 min (manual)
- Results: 30 sec
```

## 🔍 What You'll See

When you run the script:

```
╔════════════════════════════════════════════════════════════════╗
║      🚀 RAZORPAY HACKATHON DEPLOYMENT WITH PLAYWRIGHT        ║
╚════════════════════════════════════════════════════════════════╝

Email: nithishaleni1806@gmail.com
Repository: nithisha/Razorpayy
======================================================================

======================================================================
🚀 STEP 1: DEPLOY BACKEND TO RAILWAY
======================================================================

📍 Opening Railway.app...

📋 FOLLOW THESE STEPS IN THE BROWSER:
   1. Click "Start Project"
   2. Click "Continue with GitHub"
   3. Authorize Railway
   4. Select "Razorpayy" repository
   5. Click "Deploy"

Browser is open - complete these steps, then press Enter here:
```

**At this point**, a browser window opens with Railway.app loaded. You perform the clicks, and when done, you press Enter in the terminal. The script continues automatically.

## ✨ Final Output

After completing all steps, you'll see:

```
=================================================================
✅ DEPLOYMENT COMPLETE!
=================================================================

🌐 YOUR LIVE URLS:
   Frontend: https://razorpayy-xyz.vercel.app
   Backend:  https://railway-xyz.railway.app
   API:      https://railway-xyz.railway.app/api/ledger

📝 DEMO CREDENTIALS:
   Email:    judge@razorpay.dev
   Password: demo

🎯 NEXT STEPS:
   1. Open: https://razorpayy-xyz.vercel.app
   2. Click "Sign in as judge"
   3. Use demo credentials to login
   4. Show judges the dashboard and transactions

Results saved to: deployment-results.json
```

## 🛠️ Troubleshooting

### Playwright Won't Open Browser
```bash
# Make sure you have Chromium installed
npx playwright install chromium
```

### Can't Click Buttons
- Make sure browser window has focus
- Browser might be loading - wait a moment
- Try clicking the button again manually

### Script Times Out
- Increase the wait time in the script
- Check your internet connection
- Make sure GitHub authentication completes

### Need to Restart
- Just run `node deploy-with-playwright.js` again
- It will continue from where it left off

## 📝 Alternative: Manual Steps (No Automation)

If the script doesn't work, follow `DEPLOY_STEP_BY_STEP.md` manually - same 20 minutes, all manual clicks.

## 🎓 How It Works

This is a **"guided automation"** approach:

```
User Input (Clicks)       ← You control browser
        ↓
Playwright Script        ← Automates detection & config
        ↓
Live URLs               ← Script shows you results
```

Different from fully automatic scripts because:
- ✅ Handles UI changes gracefully
- ✅ Works with GitHub 2FA if needed
- ✅ Lets you see exactly what's happening
- ✅ No credentials passed to servers (you log in directly)

## 📞 Need Help?

1. Check your terminal output - it shows exactly what's happening
2. Look at the browser window - see if buttons are clickable
3. Read DEPLOY_STEP_BY_STEP.md for manual instructions
4. Check that your GitHub account can access the Razorpayy repo

---

**Ready? Run this in your terminal:**

```bash
cd /Users/nithisha/Work/Hackathons/Razorpayy
npm install playwright
node deploy-with-playwright.js
```

Then follow the browser prompts. You'll be live in ~20 minutes! 🚀
