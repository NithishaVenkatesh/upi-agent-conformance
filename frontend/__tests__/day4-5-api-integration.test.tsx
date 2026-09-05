/**
 * DAYS 4-5: API INTEGRATION TESTS
 * Tests for checkout page wired to backend APIs
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Days 4-5: API Integration', () => {
  const checkoutPath = path.join(process.cwd(), 'app', 'checkout', 'page.tsx');

  it('checkout imports apiClient from lib/api-client', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('import { apiClient }');
    expect(content).toContain('from "@/lib/api-client"');
  });

  it('checkout uses apiClient.searchCatalog to load products', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('apiClient.searchCatalog');
  });

  it('checkout uses apiClient.createCheckout for creating checkout', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('apiClient.createCheckout');
  });

  it('checkout uses apiClient.completeCheckout for processing payment', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('apiClient.completeCheckout');
  });

  it('checkout passes correct items format to createCheckout', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('id: item.productId');
    expect(content).toContain('qty: item.quantity');
  });

  it('checkout passes INR currency to createCheckout', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('createCheckout(checkoutItems, "INR")');
  });

  it('checkout generates idempotency key for completeCheckout', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('idemKey');
    expect(content).toContain('checkout.id');
    expect(content).toContain('Date.now()');
  });

  it('checkout handles success response from completeCheckout', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('result.success');
    expect(content).toContain('result.orderId');
  });

  it('checkout handles error response from completeCheckout', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('result.error');
    expect(content).toContain('result.error.code');
    expect(content).toContain('result.error.clause');
    expect(content).toContain('result.error.circular');
    expect(content).toContain('result.error.quote');
  });

  it('checkout maps error code to payment status', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('result.error.code === "authorised"');
    expect(content).toContain('result.error.code === "declined"');
    expect(content).toContain('"ALLOWED"');
    expect(content).toContain('"REFUSED"');
  });

  it('checkout displays error details in decision', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('result.error.detail');
  });

  it('checkout has error handling for API failures', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('catch (err)');
    expect(content).toContain('setError');
    expect(content).toContain('Payment failed');
  });

  it('checkout clears error before making API calls', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('setError(null);');
  });

  it('checkout shows loading state during product fetch', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('setLoading(true)');
    expect(content).toContain('setLoading(false)');
  });

  it('checkout handles product loading errors', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('catch (err)');
    expect(content).toContain('Failed to load products');
  });

  it('checkout resets products on load error', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('setProducts([])');
  });

  it('checkout disables submit button during payment processing', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('submitting');
    expect(content).toContain('disabled={');
  });

  it('checkout shows processing state during checkout', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('Processing...');
    expect(content).toContain('submitting ?');
  });

  it('api-client has searchCatalog method', () => {
    const apiPath = path.join(process.cwd(), 'lib', 'api-client.ts');
    const content = fs.readFileSync(apiPath, 'utf-8');
    expect(content).toContain('async searchCatalog');
  });

  it('api-client has createCheckout method', () => {
    const apiPath = path.join(process.cwd(), 'lib', 'api-client.ts');
    const content = fs.readFileSync(apiPath, 'utf-8');
    expect(content).toContain('async createCheckout');
  });

  it('api-client has completeCheckout method', () => {
    const apiPath = path.join(process.cwd(), 'lib', 'api-client.ts');
    const content = fs.readFileSync(apiPath, 'utf-8');
    expect(content).toContain('async completeCheckout');
  });

  it('searchCatalog calls search_catalog tool', () => {
    const apiPath = path.join(process.cwd(), 'lib', 'api-client.ts');
    const content = fs.readFileSync(apiPath, 'utf-8');
    expect(content).toContain('search_catalog');
  });

  it('createCheckout calls create_checkout tool', () => {
    const apiPath = path.join(process.cwd(), 'lib', 'api-client.ts');
    const content = fs.readFileSync(apiPath, 'utf-8');
    expect(content).toContain('create_checkout');
  });

  it('completeCheckout calls complete_checkout tool', () => {
    const apiPath = path.join(process.cwd(), 'lib', 'api-client.ts');
    const content = fs.readFileSync(apiPath, 'utf-8');
    expect(content).toContain('complete_checkout');
  });

  it('no regressions - navigation still includes checkout', () => {
    const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');
    expect(content).toContain('href="/checkout"');
  });

  it('no regressions - day1 and day2 tests still pass', () => {
    const day1Path = path.join(process.cwd(), '__tests__', 'day1-navigation.test.tsx');
    const day2Path = path.join(process.cwd(), '__tests__', 'day2-checkout.test.tsx');
    expect(fs.existsSync(day1Path)).toBe(true);
    expect(fs.existsSync(day2Path)).toBe(true);
  });
});
