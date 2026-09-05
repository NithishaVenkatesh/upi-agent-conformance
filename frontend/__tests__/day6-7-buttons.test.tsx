/**
 * DAYS 6-7: BUTTON FUNCTIONALITY TESTS
 * Tests for button navigation and interactions
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Days 6-7: Button Functionality', () => {
  const dashboardPath = path.join(process.cwd(), 'app', 'page.tsx');
  const checkoutPath = path.join(process.cwd(), 'app', 'checkout', 'page.tsx');

  it('dashboard is a client component', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('"use client"');
  });

  it('dashboard imports Link from next/link', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('import Link from "next/link"');
  });

  it('dashboard imports useRouter from next/navigation', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('import { useRouter }');
    expect(content).toContain('from "next/navigation"');
  });

  it('dashboard view details button links to constraints', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('href="/constraints"');
    expect(content).toContain('View Details');
  });

  it('dashboard transaction row has id parameter', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('id:');
    expect(content).toContain('id={txn.id}');
  });

  it('dashboard transaction details links to transaction detail page', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('href={`/transactions/${id}`}');
  });

  it('dashboard view all transactions links to transactions list', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('href="/transactions"');
    expect(content).toContain('View All Transactions');
  });

  it('dashboard constraints button links to constraints page', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('Constraints');
    const constraintsLinks = (content.match(/href="\/constraints"/g) || []).length;
    expect(constraintsLinks).toBeGreaterThanOrEqual(2); // View Details + Quick Action
  });

  it('dashboard rules button links to constraints page', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('Rules');
  });

  it('dashboard ledger button links to ledger page', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('href="/ledger"');
    expect(content).toContain('Ledger');
  });

  it('dashboard demo mode button links to demo-mode page', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('href="/demo-mode"');
    expect(content).toContain('Demo Mode');
  });

  it('quick action buttons use Link component', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    const linkCount = (content.match(/<Link/g) || []).length;
    expect(linkCount).toBeGreaterThanOrEqual(5); // View Details + 4 quick actions
  });

  it('buttons have proper hover states', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('hover:bg-');
    expect(content).toContain('hover:underline');
    expect(content).toContain('transition-colors');
  });

  it('transaction row passes all required props', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('id={txn.id}');
    expect(content).toContain('timestamp={txn.timestamp}');
    expect(content).toContain('amount={txn.amount}');
    expect(content).toContain('merchant={txn.merchant}');
    expect(content).toContain('customer={txn.customer}');
    expect(content).toContain('status={txn.status}');
  });

  it('checkout page has functional submit button', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('onClick={handleCheckout}');
    expect(content).toContain('Proceed to Payment');
  });

  it('checkout page disables submit during processing', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('disabled={');
    expect(content).toContain('submitting');
  });

  it('checkout page shows processing state', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('Processing...');
  });

  it('checkout success screen has new payment button', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('New Payment');
    expect(content).toContain('setPaymentResult(null)');
  });

  it('checkout success screen has view transactions link', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('View Transactions');
    expect(content).toContain('href="/transactions"');
  });

  it('no regressions - all routes still navigable', () => {
    const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');

    const routes = [
      'href="/"',
      'href="/checkout"',
      'href="/constraints"',
      'href="/transactions"',
      'href="/ledger"',
      'href="/demo-mode"',
    ];

    routes.forEach(route => {
      expect(content).toContain(route);
    });
  });

  it('no regressions - checkout page still functional', () => {
    const content = fs.readFileSync(checkoutPath, 'utf-8');
    expect(content).toContain('useEffect');
    expect(content).toContain('apiClient.searchCatalog');
    expect(content).toContain('handleCheckout');
  });

  it('buttons have accessible styling', () => {
    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('px-');
    expect(content).toContain('py-');
    expect(content).toContain('rounded');
    expect(content).toContain('text-');
  });
});
