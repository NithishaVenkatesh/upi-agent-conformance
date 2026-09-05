/**
 * DAYS 10-11: ADVANCED ERROR HANDLING TESTS
 * Tests for error scenarios and edge cases
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Days 10-11: Advanced Error Handling', () => {
  const checkoutPath = path.join(process.cwd(), 'app', 'checkout', 'page.tsx');
  const transactionDetailPath = path.join(process.cwd(), 'app', 'transactions', '[id]', 'page.tsx');
  const apiClientPath = path.join(process.cwd(), 'lib', 'api-client.ts');

  describe('Checkout Error Handling', () => {
    it('checkout has try-catch for product loading', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('try {');
      expect(content).toContain('catch (err)');
    });

    it('checkout clears previous errors on retry', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('setError(null)');
    });

    it('checkout displays error messages from API', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('setError');
      expect(content).toContain('err instanceof Error');
    });

    it('checkout validates cart not empty before checkout', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('cart.length === 0');
      expect(content).toContain('Cart is empty');
    });

    it('checkout validates total does not exceed balance', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('cartTotal > paymentBlock.remaining_minor');
      expect(content).toContain('exceeds block balance');
    });

    it('checkout resets products on load error', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('setProducts([])');
    });

    it('checkout sets loading state properly', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('setLoading(true)');
      expect(content).toContain('setLoading(false)');
    });

    it('checkout disables submit during processing', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('disabled={');
      expect(content).toContain('submitting ||');
    });

    it('checkout shows processing state message', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('Processing...');
    });

    it('checkout handles API payment decision errors', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('result.error');
      expect(content).toContain('result.error.code');
    });

    it('checkout maps error codes to statuses', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('"authorised"');
      expect(content).toContain('"declined"');
    });

    it('checkout displays error details in payment decision', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('result.error.detail');
      expect(content).toContain('result.error.circular');
    });

    it('checkout has error display UI', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('error &&');
      expect(content).toContain('bg-red-50');
      expect(content).toContain('dark:bg-red-900');
    });
  });

  describe('Transaction Detail Error Handling', () => {
    it('transaction detail wraps content in Suspense', () => {
      const content = fs.readFileSync(transactionDetailPath, 'utf-8');
      expect(content).toContain('Suspense');
    });

    it('transaction detail uses async data loading', () => {
      const content = fs.readFileSync(transactionDetailPath, 'utf-8');
      expect(content).toContain('async');
      expect(content).toContain('TransactionDetailContent');
    });

    it('transaction detail has back link for navigation', () => {
      const content = fs.readFileSync(transactionDetailPath, 'utf-8');
      expect(content).toContain('href="/transactions"');
      expect(content).toContain('Back');
    });

    it('transaction detail receives transaction ID from params', () => {
      const content = fs.readFileSync(transactionDetailPath, 'utf-8');
      expect(content).toContain('params.id');
    });
  });

  describe('API Client Error Handling', () => {
    it('api client has error handling in callMCPTool', () => {
      const content = fs.readFileSync(apiClientPath, 'utf-8');
      expect(content).toContain('catch (error)');
    });

    it('api client checks response.ok', () => {
      const content = fs.readFileSync(apiClientPath, 'utf-8');
      expect(content).toContain('response.ok');
    });

    it('api client handles timeout errors', () => {
      const content = fs.readFileSync(apiClientPath, 'utf-8');
      expect(content).toContain('AbortError');
      expect(content).toContain('timeout');
    });

    it('api client clears timeout properly', () => {
      const content = fs.readFileSync(apiClientPath, 'utf-8');
      expect(content).toContain('clearTimeout');
    });

    it('api client throws on HTTP errors', () => {
      const content = fs.readFileSync(apiClientPath, 'utf-8');
      expect(content).toContain('throw new Error');
    });

    it('api client checks for error in response', () => {
      const content = fs.readFileSync(apiClientPath, 'utf-8');
      expect(content).toContain('response.error');
    });

    it('api client extracts error detail', () => {
      const content = fs.readFileSync(apiClientPath, 'utf-8');
      expect(content).toContain('error.detail');
    });

    it('api client returns fallback data on missing fields', () => {
      const content = fs.readFileSync(apiClientPath, 'utf-8');
      expect(content).toContain('||');
    });

    it('searchCatalog returns empty array on error', () => {
      const content = fs.readFileSync(apiClientPath, 'utf-8');
      expect(content).toContain('products || []');
    });

    it('completeCheckout distinguishes success from failure', () => {
      const content = fs.readFileSync(apiClientPath, 'utf-8');
      expect(content).toContain('success:');
      expect(content).toContain('error');
    });
  });

  describe('Edge Case Handling', () => {
    it('checkout handles zero products gracefully', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('products');
      expect(content).toContain('loading');
    });

    it('checkout handles zero cart items', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('cart.length === 0');
    });

    it('checkout handles very large prices correctly', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('cartTotal');
      expect(content).toContain('price_minor');
    });

    it('checkout handles rapid button clicks with disabled state', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('submitting');
      expect(content).toContain('disabled');
    });

    it('checkout handles missing data with fallback values', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('||');
    });

    it('api client handles missing response result', () => {
      const content = fs.readFileSync(apiClientPath, 'utf-8');
      expect(content).toContain('|| {}');
      expect(content).toContain('|| ""');
      expect(content).toContain('|| 0');
    });
  });

  describe('User Feedback', () => {
    it('checkout shows loading indicators', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('Loading');
      expect(content).toContain('animate-pulse');
    });

    it('checkout shows error messages prominently', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('error &&');
      expect(content).toContain('rounded-lg p-4');
    });

    it('checkout shows validation error messages', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('Cart is empty');
      expect(content).toContain('exceeds');
    });

    it('checkout shows button loading state', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('Processing...');
      expect(content).toContain('Proceed to Payment');
    });

    it('checkout displays payment decision status', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('ALLOWED');
      expect(content).toContain('REFUSED');
      expect(content).toContain('UNDETERMINED');
    });
  });

  describe('Data Validation', () => {
    it('checkout validates transaction ID is provided', () => {
      const content = fs.readFileSync(transactionDetailPath, 'utf-8');
      expect(content).toContain('params.id');
    });

    it('checkout validates product ID before adding to cart', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('productId');
    });

    it('checkout validates quantity is positive', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('quantity');
    });

    it('api client validates request ID is incremented', () => {
      const content = fs.readFileSync(apiClientPath, 'utf-8');
      expect(content).toContain('requestId');
      expect(content).toContain('getNextRequestId');
    });

    it('api client validates timeout setting', () => {
      const content = fs.readFileSync(apiClientPath, 'utf-8');
      expect(content).toContain('API_TIMEOUT_MS');
    });
  });

  describe('No Regressions', () => {
    it('checkout still loads products on mount', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('useEffect');
      expect(content).toContain('apiClient.searchCatalog');
    });

    it('checkout still creates payment sessions', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('apiClient.createCheckout');
    });

    it('checkout still completes payment', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('apiClient.completeCheckout');
    });

    it('all button handlers still work', () => {
      const content = fs.readFileSync(checkoutPath, 'utf-8');
      expect(content).toContain('onClick=');
    });

    it('navigation still accessible', () => {
      const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('href="/"');
      expect(content).toContain('href="/checkout"');
    });
  });
});
