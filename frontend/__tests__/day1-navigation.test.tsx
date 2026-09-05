/**
 * DAY 1: FOUNDATION TESTS
 * Tests for navigation and routing fixes
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Day 1: Navigation and Routing', () => {
  it('app layout uses AppShell component', () => {
    const layoutPath = path.join(process.cwd(), 'app', 'app', 'layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');
    expect(content).toContain('AppShell');
  });

  it('app shell has navigation items', () => {
    const shellPath = path.join(process.cwd(), 'components', 'app-shell.tsx');
    const content = fs.readFileSync(shellPath, 'utf-8');

    const navItems = [
      'Overview',
      'Transactions',
      'Constraints',
      'Ledger',
      'Demo',
    ];

    navItems.forEach(item => {
      expect(content).toContain(item);
    });
  });

  it('transaction detail page exists at new route', () => {
    const txDetailPath = path.join(process.cwd(), 'app', 'app', 'transactions', '[id]', 'page.tsx');
    expect(fs.existsSync(txDetailPath)).toBe(true);
  });

  it('transaction detail uses GateFlow component', () => {
    const txDetailPath = path.join(process.cwd(), 'app', 'app', 'transactions', '[id]', 'page.tsx');
    const content = fs.readFileSync(txDetailPath, 'utf-8');
    expect(content).toContain('GateFlow');
  });

  it('no dark mode classes in layout', () => {
    const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');
    expect(content).not.toContain('dark:');
  });

  it('transaction detail has all required components', () => {
    const txDetailPath = path.join(process.cwd(), 'app', 'app', 'transactions', '[id]', 'page.tsx');
    const content = fs.readFileSync(txDetailPath, 'utf-8');

    const components = [
      'GateFlow',
      'Ruling',
      'JSONPayload',
    ];

    components.forEach(component => {
      expect(content).toContain(component);
    });
  });
});
