/**
 * DAYS 2-3: CHECKOUT FLOW TESTS
 * Tests for product list, shopping cart, and payment initiation
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Days 2-3: Checkout Flow', () => {
  const checkoutPath = path.join(process.cwd(), 'app', 'checkout', 'page.tsx');

  it('checkout page is client component', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('"use client"');
  });

  it('checkout page imports React hooks', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('import { useEffect, useState }');
  });

  it('checkout page imports Next.js Link', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('import Link from "next/link"');
  });

  it('checkout page defines Product interface', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('interface Product');
    expect(content).toContain('id: string');
    expect(content).toContain('name: string');
    expect(content).toContain('price_minor: number');
  });

  it('checkout page defines CartItem interface', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('interface CartItem');
    expect(content).toContain('productId: string');
    expect(content).toContain('quantity: number');
  });

  it('checkout page defines PaymentBlock interface', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('interface PaymentBlock');
    expect(content).toContain('max_minor: number');
    expect(content).toContain('remaining_minor: number');
    expect(content).toContain('validity_days: number');
  });

  it('checkout page has product loading state', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('const [products, setProducts]');
    expect(content).toContain('const [loading, setLoading]');
  });

  it('checkout page has cart state', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('const [cart, setCart]');
  });

  it('checkout page has addToCart function', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('const addToCart = ');
    expect(content).toContain('productId === product.id');
  });

  it('checkout page has removeFromCart function', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('const removeFromCart = ');
    expect(content).toContain('productId !== productId');
  });

  it('checkout page has updateQuantity function', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('const updateQuantity = ');
  });

  it('checkout page calculates cartTotal', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('const cartTotal = cart.reduce');
    expect(content).toContain('price_minor * item.quantity');
  });

  it('checkout page has handleCheckout function', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('const handleCheckout = async');
    expect(content).toContain('cart.length === 0');
    expect(content).toContain('cartTotal > paymentBlock.remaining_minor');
  });

  it('checkout page displays payment block status', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('Payment Block Status');
    expect(content).toContain('Max Amount');
    expect(content).toContain('Remaining');
    expect(content).toContain('Validity');
  });

  it('checkout page displays products section', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('Products');
    expect(content).toContain('loading');
    expect(content).toContain('Add to Cart');
  });

  it('checkout page displays shopping cart section', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('Shopping Cart');
    expect(content).toContain('cart.length');
    expect(content).toContain('Your cart is empty');
  });

  it('checkout page has cart item quantity controls', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('updateQuantity(item.productId, item.quantity - 1)');
    expect(content).toContain('updateQuantity(item.productId, item.quantity + 1)');
  });

  it('checkout page has remove from cart button', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('removeFromCart(item.productId)');
    expect(content).toContain('Remove');
  });

  it('checkout page shows cart summary with total', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('Total Amount:');
    expect(content).toContain('Proceed to Payment');
  });

  it('checkout page shows balance exceeded warning', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('Exceeds available block balance');
    expect(content).toContain('cartTotal > paymentBlock.remaining_minor');
  });

  it('checkout page disables payment button when conditions not met', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('disabled={');
    expect(content).toContain('submitting ||');
    expect(content).toContain('cart.length === 0 ||');
    expect(content).toContain('cartTotal > paymentBlock.remaining_minor');
  });

  it('checkout page has success screen for allowed payments', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('paymentResult');
    expect(content).toContain('Payment Decision');
    expect(content).toContain('Regulatory Authority');
    expect(content).toContain('Quote from Circular');
    expect(content).toContain('Details');
  });

  it('checkout page has new payment button on success', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('New Payment');
    expect(content).toContain('setPaymentResult(null)');
    expect(content).toContain('setCart([])');
  });

  it('checkout page has view transactions link on success', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('href="/transactions"');
    expect(content).toContain('View Transactions');
  });

  it('checkout page has back to dashboard link', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('href="/"');
    expect(content).toContain('Back to Dashboard');
  });

  it('checkout page has dark mode classes for all sections', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('dark:');
    expect(content).toContain('dark:bg-');
    expect(content).toContain('dark:text-');
  });

  it('no regressions - navigation still has correct routes', () => {
    const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');

    const routes = [
      'href="/"',
      'href="/constraints"',
      'href="/transactions"',
      'href="/ledger"',
      'href="/demo-mode"',
    ];

    routes.forEach(route => {
      expect(content).toContain(route);
    });
  });

  it('no regressions - transaction detail page still intact', () => {
    const txDetailPath = path.join(process.cwd(), 'app', 'transactions', '[id]', 'page.tsx');
    const content = fs.readFileSync(txDetailPath, 'utf-8');

    expect(content).toContain('TransactionDetailContent transactionId={params.id}');
    expect(content).toContain('fetchTransaction(transactionId)');
    expect(content).toContain('href="/transactions"');
  });
});
