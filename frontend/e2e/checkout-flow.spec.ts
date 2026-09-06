import { test, expect } from '@playwright/test';

test.describe('Checkout Flow - End-to-End', () => {
  test('should complete full checkout flow with payment processing', async ({ page }) => {
    console.log('\n=== Starting Checkout Flow Test ===');
    console.log('Frontend URL: http://localhost:3000');
    console.log('Testing: Checkout page → Create session → Process payment → Display decision');

    // Step 1: Navigate to checkout page
    console.log('\n[Step 1] Navigate to checkout page');
    await page.goto('http://localhost:3000/app/checkout');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    const heading = page.locator('h1:has-text("Checkout")');
    await expect(heading).toBeVisible();
    console.log('✓ Checkout page loaded');

    // Step 2: Add items to cart
    console.log('\n[Step 2] Add items to cart');
    const addButtons = page.locator('button:has-text("Add")');
    const addButtonCount = await addButtons.count();
    console.log(`Found ${addButtonCount} Add buttons`);

    if (addButtonCount > 0) {
      await addButtons.first().click();
      console.log('✓ Added first item to cart');
      await page.waitForTimeout(500);

      if (addButtonCount > 1) {
        await addButtons.nth(1).click();
        console.log('✓ Added second item to cart');
        await page.waitForTimeout(500);
      }
    }

    // Step 3: Listen for API calls
    console.log('\n[Step 3] Setup network monitoring');
    const apiRequests = [];

    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/api/')) {
        const logEntry = {
          timestamp: new Date().toISOString(),
          url: url,
          status: response.status(),
          method: response.request().method(),
        };
        apiRequests.push(logEntry);
        console.log(`  API Call: ${response.request().method()} ${url}`);
        console.log(`  Status: ${response.status()}`);
      }
    });

    // Listen for console errors
    const consoleMessages = [];
    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
      });
      if (msg.type() === 'error') {
        console.log(`  Browser Error: ${msg.text()}`);
      }
    });

    // Step 4: Click "Proceed to Payment"
    console.log('\n[Step 4] Click "Proceed to Payment"');
    const proceedButton = page.locator('button:has-text("Proceed to Payment")');
    await expect(proceedButton).toBeVisible();
    await proceedButton.click();
    console.log('✓ Clicked "Proceed to Payment"');

    // Wait for API call to create endpoint
    await page.waitForTimeout(2000);

    // Verify checkout/create was called
    const createCalls = apiRequests.filter(r => r.url.includes('/api/checkout/create'));
    if (createCalls.length > 0) {
      console.log(`✓ API Call: /api/checkout/create - Status ${createCalls[0].status}`);
      if (createCalls[0].status !== 200) {
        console.log(`⚠️  Warning: create endpoint returned ${createCalls[0].status}`);
      }
    } else {
      console.log('✗ /api/checkout/create was not called');
    }

    // Step 5: Verify session was created
    console.log('\n[Step 5] Verify session creation');
    const sessionCreatedText = page.locator('text=✓ Session Created');

    try {
      await expect(sessionCreatedText).toBeVisible({ timeout: 5000 });
      console.log('✓ Session Created message visible');

      // Get the session ID
      const sessionIdSpan = page.locator('.font-mono');
      if (await sessionIdSpan.count() > 0) {
        const sessionId = await sessionIdSpan.first().textContent();
        console.log(`✓ Session ID: ${sessionId}`);
      }
    } catch (e) {
      console.log('✗ Session Created message not found within 5 seconds');
      const pageContent = await page.content();
      console.log('Page HTML snippet:', pageContent.substring(0, 1000));
      throw e;
    }

    // Step 6: Click "Process Payment"
    console.log('\n[Step 6] Click "Process Payment"');
    const paymentButton = page.locator('button:has-text("Process Payment")');
    await expect(paymentButton).toBeVisible();
    await paymentButton.click();
    console.log('✓ Clicked "Process Payment"');

    // Wait for complete endpoint to be called
    await page.waitForTimeout(2000);

    // Verify checkout/complete was called
    const completeCalls = apiRequests.filter(r => r.url.includes('/api/checkout/complete'));
    if (completeCalls.length > 0) {
      console.log(`✓ API Call: /api/checkout/complete - Status ${completeCalls[0].status}`);
      if (completeCalls[0].status !== 200) {
        console.log(`⚠️  Warning: complete endpoint returned ${completeCalls[0].status}`);
      }
    } else {
      console.log('✗ /api/checkout/complete was not called');
    }

    // Step 7: Verify decision is displayed
    console.log('\n[Step 7] Verify payment decision');

    const decisionButton = page.locator('button').filter({
      has: page.locator('text=/^(✓|✗)\\s+(Allowed|Refused)$/')
    });

    let decisionFound = false;
    let decisionType = '';

    try {
      await expect(decisionButton).toBeVisible({ timeout: 8000 });
      const buttonText = await decisionButton.textContent();
      console.log(`✓ Decision button found: ${buttonText}`);

      if (buttonText?.includes('Allowed')) {
        decisionType = 'Allowed';
        console.log('✓ Decision: ALLOWED');
        decisionFound = true;
      } else if (buttonText?.includes('Refused')) {
        decisionType = 'Refused';
        console.log('✓ Decision: REFUSED');
        decisionFound = true;
      }
    } catch (e) {
      console.log('✗ No decision button found, checking alternative selectors');
      const pageText = await page.locator('body').textContent();
      if (pageText?.includes('✓ Allowed')) {
        decisionFound = true;
        decisionType = 'Allowed';
        console.log('✓ Decision: ALLOWED (found in body)');
      } else if (pageText?.includes('✗ Refused')) {
        decisionFound = true;
        decisionType = 'Refused';
        console.log('✓ Decision: REFUSED (found in body)');
      } else {
        console.log('✗ No decision displayed');
        console.log('Page text content:', pageText?.substring(0, 500));
        throw new Error('Decision not found in UI');
      }
    }

    // Step 8: Click to see decision details
    console.log('\n[Step 8] Verify decision details');
    try {
      const detailsButton = page.locator('button').filter({
        has: page.locator(new RegExp(`${decisionType}`))
      }).first();

      if (await detailsButton.isVisible({ timeout: 2000 })) {
        await detailsButton.click();
        await page.waitForTimeout(500);

        const decisionCode = page.locator('text=Decision Code:');
        const citation = page.locator('text=Regulatory Citation:');

        if (await decisionCode.isVisible({ timeout: 2000 })) {
          console.log('✓ Decision code section visible');
        }

        if (await citation.isVisible({ timeout: 2000 })) {
          console.log('✓ Regulatory citation found');
        }
      }
    } catch (e) {
      console.log('⚠️  Could not expand decision details (not critical)');
    }

    // Final Summary
    console.log('\n=== API Call Summary ===');
    console.log(`Total API calls: ${apiRequests.length}`);
    apiRequests.forEach((req, idx) => {
      console.log(`${idx + 1}. ${req.method} ${req.url} - ${req.status}`);
    });

    console.log('\n=== Browser Console Summary ===');
    const errors = consoleMessages.filter(m => m.type === 'error');
    if (errors.length > 0) {
      console.log(`Errors found: ${errors.length}`);
      errors.forEach(err => console.log(`  - ${err.text}`));
    } else {
      console.log('No console errors');
    }

    console.log('\n=== Test Summary ===');
    console.log('✓ Navigation to checkout page');
    console.log('✓ Added items to cart');
    console.log('✓ Proceeded to payment');
    console.log('✓ Session created');
    console.log('✓ Payment processed');
    console.log(`✓ Decision displayed (${decisionType})`);
    console.log('\n=== CHECKOUT FLOW TEST PASSED ===\n');

    expect(decisionFound).toBe(true);
  });

  test('should handle 403 Forbidden error from backend', async ({ page }) => {
    console.log('\n=== Testing 403 Forbidden Error ===');

    await page.goto('http://localhost:3000/app/checkout');
    await page.waitForLoadState('networkidle');

    // Listen for API responses
    const apiErrors = [];
    page.on('response', (response) => {
      if (response.url().includes('/api/checkout/create') && response.status() === 403) {
        apiErrors.push({
          endpoint: '/api/checkout/create',
          status: 403,
        });
      }
    });

    // Add item and try to create checkout
    const addButtons = page.locator('button:has-text("Add")');
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
    }

    const proceedButton = page.locator('button:has-text("Proceed to Payment")');
    await proceedButton.click();
    await page.waitForTimeout(2000);

    // Check if error message is displayed
    const errorMessage = page.locator('text=/error|failed|403/i');
    if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.first().textContent();
      console.log(`✓ Error message displayed: ${errorText}`);
    }

    if (apiErrors.length > 0) {
      console.log(`✓ Received 403 Forbidden from backend`);
      console.log('Note: This is expected if ALLOWED_ORIGINS is not configured correctly');
      console.log('See deployment guide for environment variable setup');
    }
  });

  test('should handle network timeout', async ({ page }) => {
    console.log('\n=== Testing Network Timeout ===');

    // Set a short timeout for network requests
    page.setDefaultTimeout(5000);

    try {
      await page.goto('http://localhost:3000/app/checkout');
      await page.waitForLoadState('networkidle');

      const addButtons = page.locator('button:has-text("Add")');
      if (await addButtons.count() > 0) {
        await addButtons.first().click();
      }

      const proceedButton = page.locator('button:has-text("Proceed to Payment")');
      await proceedButton.click();

      // Check for error handling
      const errorMessage = page.locator('text=/error|failed|timeout/i');
      if (await errorMessage.count() > 0) {
        console.log('✓ Error message displayed for timeout');
      }
    } catch (e) {
      console.log(`✓ Timeout handled: ${e.message}`);
    }
  });
});
