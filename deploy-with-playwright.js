#!/usr/bin/env node

/**
 * Razorpay Payment Gate - Full Deployment Script with Playwright
 *
 * Usage:
 *   npm install playwright
 *   node deploy-with-playwright.js
 *
 * This script will open browser windows and guide you through:
 * 1. Deploying backend to Railway
 * 2. Deploying frontend to Vercel
 * 3. Updating CORS settings
 */

const { chromium } = require('playwright');
const fs = require('fs');
const readline = require('readline');

const CONFIG = {
  email: 'nithishaleni1806@gmail.com',
  password: 'Venkatvishal@18',
  repoOwner: 'nithisha',
  repoName: 'Razorpayy'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function log(message) {
  console.log(message);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function deployRailway() {
  log('\n' + '='.repeat(70));
  log('🚀 STEP 1: DEPLOY BACKEND TO RAILWAY');
  log('='.repeat(70));

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    log('\n📍 Opening Railway.app...');
    await page.goto('https://railway.app', { waitUntil: 'networkidle' });

    log('\n📋 FOLLOW THESE STEPS IN THE BROWSER:');
    log('   1. Click "Start Project"');
    log('   2. Click "Continue with GitHub"');
    log('   3. Authorize Railway');
    log('   4. Select "Razorpayy" repository');
    log('   5. Click "Deploy"');
    log('\nBrowser is open - complete these steps, then press Enter here:\n');

    await prompt('Press Enter after clicking Deploy on Railway...');

    log('⏳ Waiting for Railway dashboard...');
    await page.waitForTimeout(5000);

    // Get Railway URL
    const railwayUrl = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      for (let link of links) {
        if (link.href && link.href.includes('.railway.app')) {
          const match = link.href.match(/https:\/\/([^\/]+)/);
          if (match && !match[1].includes('www')) {
            return match[1];
          }
        }
      }
      return null;
    });

    if (railwayUrl) {
      log(`✓ Railway URL found: ${railwayUrl}`);
      fs.writeFileSync('.railway-url', railwayUrl);
    } else {
      const manualUrl = await prompt('\n❓ Could not auto-detect Railway URL. Enter it manually (e.g., myapp-prod.railway.app): ');
      fs.writeFileSync('.railway-url', manualUrl);
    }

    await browser.close();
    return railwayUrl || manualUrl;

  } catch (error) {
    log('❌ Error: ' + error.message);
    await browser.close();
    throw error;
  }
}

async function deployVercel(railwayUrl) {
  log('\n' + '='.repeat(70));
  log('🚀 STEP 2: DEPLOY FRONTEND TO VERCEL');
  log('='.repeat(70));

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    log('\n📍 Opening Vercel.com...');
    await page.goto('https://vercel.com', { waitUntil: 'networkidle' });

    log('\n📋 FOLLOW THESE STEPS IN THE BROWSER:');
    log('   1. Click "Sign In" or "Sign Up"');
    log('   2. Click "Continue with GitHub"');
    log('   3. Authorize if prompted');
    log('   4. Wait for dashboard, then click "Add New" → "Project"');
    log('   5. Select "Razorpayy" repository');
    log('   6. Click "Import"');
    log('   7. Set Root Directory: RazorPay/frontend');
    log('   8. Add these Environment Variables:');
    log(`      NEXT_PUBLIC_API_BASE_URL = https://${railwayUrl}`);
    log(`      NEXT_PUBLIC_MERCHANT_SERVER_URL = https://${railwayUrl}`);
    log('      NEXT_PUBLIC_DEMO_MODE = true');
    log('   9. Click "Deploy"');
    log('\nBrowser is open - complete these steps, then press Enter here:\n');

    await prompt('Press Enter after clicking Deploy on Vercel...');

    log('⏳ Waiting for Vercel deployment...');
    await page.waitForTimeout(10000);

    // Get Vercel URL
    const vercelUrl = await page.evaluate(() => {
      const currentUrl = window.location.href;
      const match = currentUrl.match(/https:\/\/([\w-]+)\.vercel\.app/);
      if (match) return match[1] + '.vercel.app';
      return null;
    });

    if (vercelUrl) {
      log(`✓ Vercel URL found: ${vercelUrl}`);
      fs.writeFileSync('.vercel-url', vercelUrl);
    } else {
      const manualUrl = await prompt('\n❓ Could not auto-detect Vercel URL. Enter it manually (e.g., myapp.vercel.app): ');
      fs.writeFileSync('.vercel-url', manualUrl);
    }

    await browser.close();
    return vercelUrl || manualUrl;

  } catch (error) {
    log('❌ Error: ' + error.message);
    await browser.close();
    throw error;
  }
}

async function updateCORS(railwayUrl, vercelUrl) {
  log('\n' + '='.repeat(70));
  log('🔧 STEP 3: UPDATE RAILWAY CORS');
  log('='.repeat(70));

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    log('\n📍 Opening Railway dashboard...');
    await page.goto('https://railway.app/dashboard', { waitUntil: 'networkidle' });

    log('\n📋 FOLLOW THESE STEPS IN THE BROWSER:');
    log('   1. Click on your backend service');
    log('   2. Go to "Variables" tab');
    log('   3. Find or create "ALLOWED_ORIGINS"');
    log(`   4. Set it to: https://${vercelUrl},http://localhost:3000`);
    log('   5. Click "Save"');
    log('\nBrowser is open - complete these steps, then press Enter here:\n');

    await prompt('Press Enter after updating CORS...');

    await browser.close();

  } catch (error) {
    log('⚠  Warning: ' + error.message);
    await browser.close();
  }
}

async function showResults(railwayUrl, vercelUrl) {
  log('\n' + '='.repeat(70));
  log('✅ DEPLOYMENT COMPLETE!');
  log('='.repeat(70));

  log('\n🌐 YOUR LIVE URLS:');
  log(`   Frontend: https://${vercelUrl}`);
  log(`   Backend:  https://${railwayUrl}`);
  log(`   API:      https://${railwayUrl}/api/ledger`);

  log('\n📝 DEMO CREDENTIALS:');
  log('   Email:    judge@razorpay.dev');
  log('   Password: demo');

  log('\n🎯 NEXT STEPS:');
  log(`   1. Open: https://${vercelUrl}`);
  log('   2. Click "Sign in as judge"');
  log('   3. Use demo credentials to login');
  log('   4. Show judges the dashboard and transactions');

  log('\n✨ Your hackathon project is LIVE! 🚀\n');

  // Save results
  const results = {
    frontend: `https://${vercelUrl}`,
    backend: `https://${railwayUrl}`,
    api: `https://${railwayUrl}/api/ledger`,
    demoEmail: 'judge@razorpay.dev',
    demoPassword: 'demo',
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync('deployment-results.json', JSON.stringify(results, null, 2));
  log('Results saved to: deployment-results.json\n');
}

async function main() {
  console.clear();
  log('\n' + '╔' + '═'.repeat(68) + '╗');
  log('║' + ' '.repeat(12) + '🚀 RAZORPAY HACKATHON DEPLOYMENT WITH PLAYWRIGHT' + ' '.repeat(5) + '║');
  log('╚' + '═'.repeat(68) + '╝');

  log('\nEmail: ' + CONFIG.email);
  log('Repository: ' + CONFIG.repoOwner + '/' + CONFIG.repoName);
  log('='.repeat(70));

  try {
    // Step 1: Railway
    const railwayUrl = await deployRailway();

    // Wait
    log('\n⏳ Waiting 30 seconds before Vercel deployment...');
    for (let i = 30; i > 0; i--) {
      process.stdout.write(`\r   Countdown: ${i}s remaining`);
      await sleep(1000);
    }
    console.log('\n');

    // Step 2: Vercel
    const vercelUrl = await deployVercel(railwayUrl);

    // Step 3: CORS
    await updateCORS(railwayUrl, vercelUrl);

    // Results
    await showResults(railwayUrl, vercelUrl);

    rl.close();

  } catch (error) {
    log('\n❌ Deployment failed: ' + error.message);
    rl.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { deployRailway, deployVercel, updateCORS };
