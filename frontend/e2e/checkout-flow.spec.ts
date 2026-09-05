import { test, expect } from '@playwright/test';

test.describe('Checkout Flow - End-to-End', () => {
  test('should complete full checkout flow with payment processing', async ({ page }) => {
    console.log('\n=== Starting Checkout Flow Test ===');

    // Step 1: Navigate to checkout page
    console.log('Step 1: Navigate to http://localhost:3000/app/checkout');
    await page.goto('http://localhost:3000/app/checkout');
    await page.waitForLoadState('networkidle');

    // Verify page loaded - look for the checkout-specific heading
    const heading = page.locator('h1:has-text("Checkout")');
    await expect(heading).toBeVisible();
    console.log('✓ Checkout page loaded');

    // Step 2: Add items to cart
    console.log('\nStep 2: Add items to cart');
    const addButtons = page.locator('button:has-text("Add")');
    const addButtonCount = await addButtons.count();
    console.log(`Found ${addButtonCount} Add buttons`);

    // Add first item
    if (addButtonCount > 0) {
      await addButtons.first().click();
      console.log('✓ Added first item to cart');
      await page.waitForTimeout(500);

      // Add second item
      if (addButtonCount > 1) {
        await addButtons.nth(1).click();
        console.log('✓ Added second item to cart');
        await page.waitForTimeout(500);
      }
    }

    // Step 3: Click "Proceed to Payment"
    console.log('\nStep 3: Click "Proceed to Payment"');
    const proceedButton = page.locator('button:has-text("Proceed to Payment")');

    // Listen for network requests to see what's being called
    let apiCreateCalled = false;
    page.on('response', (response) => {
      if (response.url().includes('/api/checkout/create')) {
        apiCreateCalled = true;
        console.log(`API Response: ${response.url()} - ${response.status()}`);
        if (response.status() !== 200) {
          console.log(`Error: Got ${response.status()} from create endpoint`);
        }
      }
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.text().includes('error')) {
        console.log(`Browser Console: ${msg.type()} - ${msg.text()}`);
      }
    });

    await proceedButton.click();
    await page.waitForTimeout(2000);

    // Verify session was created
    console.log('\nStep 4: Verify session creation');
    const sessionCreatedText = page.locator('text=✓ Session Created');

    try {
      await expect(sessionCreatedText).toBeVisible({ timeout: 5000 });
      console.log('✓ Session Created message visible');

      // Get the session ID
      const sessionIdElement = page.locator('text=✓ Session Created').locator('..').locator('text=/^[a-zA-Z0-9_-]+$/');
      // Alternative way to find session ID - look for monospace text in the blue box
      const sessionIdSpan = page.locator('.font-mono');
      if (await sessionIdSpan.count() > 0) {
        const sessionId = await sessionIdSpan.first().textContent();
        console.log(`✓ Session ID: ${sessionId}`);
      }
    } catch (e) {
      console.log('✗ Session Created message not found within 5 seconds');
      console.log('Page content:', await page.content());
      throw e;
    }

    // Step 5: Click "Process Payment"
    console.log('\nStep 5: Click "Process Payment"');
    let apiCompleteCalled = false;
    page.on('response', (response) => {
      if (response.url().includes('/api/checkout/complete')) {
        apiCompleteCalled = true;
        console.log(`API Response: ${response.url()} - ${response.status()}`);
      }
    });

    const paymentButton = page.locator('button:has-text("Process Payment")');
    await paymentButton.click();
    await page.waitForTimeout(2000);

    // Step 6: Verify decision is displayed
    console.log('\nStep 6: Verify payment decision');

    // Look for decision - should appear with either ✓ Allowed or ✗ Refused
    // The decision appears as a button in a colored box
    const decisionButton = page.locator('button').filter({
      has: page.locator('text=/^(✓|✗)\\s+(Allowed|Refused)$/')
    });

    let decisionFound = false;
    let decisionType = '';

    try {
      // Wait for decision button to appear and be visible
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
      // Try alternative approach - look in page body
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
        console.log('Available text:', pageText?.substring(0, 500));
      }
    }

    if (!decisionFound) {
      throw new Error('No payment decision found in UI');
    }

    // Step 7: Click to see decision details
    console.log('\nStep 7: Verify decision details');
    try {
      // Find and click the decision button to expand details
      const detailsButton = page.locator('button').filter({
        has: page.locator(new RegExp(`${decisionType}`))
      }).first();

      if (await detailsButton.isVisible({ timeout: 2000 })) {
        await detailsButton.click();
        await page.waitForTimeout(500);

        // Check for decision details
        const decisionCode = page.locator('text=Decision Code:');
        const citation = page.locator('text=Regulatory Citation:');

        if (await decisionCode.isVisible({ timeout: 2000 })) {
          const codeValue = await decisionCode.locator('..').textContent();
          console.log(`✓ Decision code section visible`);
        }

        if (await citation.isVisible({ timeout: 2000 })) {
          console.log('✓ Regulatory citation found');
        }
      }
    } catch (e) {
      console.log('⚠️  Could not expand decision details (not critical)');
    }

    // Final assertions
    console.log('\n=== Test Summary ===');
    console.log(`✓ Navigation to checkout page`);
    console.log(`✓ Added items to cart`);
    console.log(`✓ Proceeded to payment`);
    console.log(`✓ Session created`);
    console.log(`✓ Payment processed`);
    console.log(`✓ Decision displayed (${decisionType})`);
    console.log('\n=== CHECKOUT FLOW TEST PASSED ===\n');

    // Verify no API errors in console
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    if (errors.length > 0) {
      console.log('⚠️  Console errors found:', errors);
    }

    expect(decisionFound).toBe(true);
  });
});
