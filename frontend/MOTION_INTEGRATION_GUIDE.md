# Motion Integration Guide

Quick reference for integrating motion-enhanced components into your Razorpay dashboard.

## Installation

Motion package is already installed:
```json
{
  "dependencies": {
    "motion": "^13.2.0"
  }
}
```

No additional setup needed. Start using components immediately.

## Component Library

### 1. Hash (Copy-Confirmation)

**Location**: `components/hash.tsx`  
**Purpose**: Display truncated hash with animated copy confirmation

**Props**:
```tsx
interface HashProps {
  value: string; // Full hash to copy
}
```

**Example**:
```tsx
import { Hash } from "@/components/hash";

export function TransactionRow() {
  return <Hash value="0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p" />;
}
```

**Behavior**:
- Displays first 6 + last 6 characters
- Click "Copy" → button scales, text changes to "✓"
- After 1500ms, reverts to "Copy"
- Full hash available in title attribute (hover)

---

### 2. JSONPayload (Expand/Collapse)

**Location**: `components/json-payload.tsx`  
**Purpose**: Display collapsible JSON with smooth height animation

**Props**:
```tsx
interface JSONPayloadProps {
  data: Record<string, any>;     // Object to display as JSON
  label?: string;                 // Section label (default: "Payload")
  defaultOpen?: boolean;          // Start expanded (default: false)
}
```

**Example**:
```tsx
import { JSONPayload } from "@/components/json-payload";

export function TransactionDetail() {
  const payload = {
    transactionId: "txn_123",
    amount: 2499,
    status: "completed",
  };

  return (
    <div className="space-y-6">
      <h1>Transaction Details</h1>
      <JSONPayload
        data={payload}
        label="Transaction Payload"
        defaultOpen={false}
      />
    </div>
  );
}
```

**Behavior**:
- Header shows label + chevron
- Click to expand/collapse
- Chevron rotates 180° smoothly
- Content slides down/up with fade effect (250ms)
- Always shows formatted JSON (not raw)

**Styling Notes**:
- Uses `font-[--font-mono]` for code display
- Inherits theme colors via CSS variables
- Mobile-friendly (scrolls horizontally if needed)

---

### 3. MobileSheet (Sidebar Entrance)

**Location**: `components/mobile-sheet.tsx`  
**Purpose**: Animated bottom-sheet for mobile navigation

**Props**:
```tsx
interface MobileSheetProps {
  isOpen: boolean;                // Control visibility
  onClose: () => void;            // Close callback
  title?: string;                 // Optional header
  children: ReactNode;            // Sheet content
}
```

**Example**:
```tsx
import { MobileSheet } from "@/components/mobile-sheet";
import { useState } from "react";

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <button onClick={() => setMenuOpen(true)}>Menu</button>

      <MobileSheet
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Navigation"
      >
        <nav className="space-y-4">
          <a href="/dashboard">Dashboard</a>
          <a href="/transactions">Transactions</a>
          <a href="/settings">Settings</a>
        </nav>
      </MobileSheet>
    </>
  );
}
```

**Behavior**:
- Hidden on desktop (`md:hidden`)
- Slides up from bottom on mobile
- Backdrop fades in behind sheet
- Click backdrop to close
- Header with close button (if title provided)
- Content scrolls if too tall

**Styling Notes**:
- Uses Tailwind's `max-h-[80vh]` (80% viewport height max)
- Inherits surface colors from theme
- Sticks to bottom on scroll

---

### 4. VerifyChain (Ledger Progression)

**Location**: `components/verify-chain.tsx`  
**Purpose**: Sequential verification indicator for ledger entries

**Props**:
```tsx
interface ChainLink {
  id: string;
  label: string;
  timestamp?: string;
}

interface VerifyChainProps {
  links: ChainLink[];              // Chain entries
  autoVerify?: boolean;            // Auto-progress (default: true)
  verifyDelay?: number;            // ms between each link (default: 200)
}
```

**Example**:
```tsx
import { VerifyChain } from "@/components/verify-chain";

export function LedgerView() {
  const entries = [
    { id: "1", label: "Transaction initiated", timestamp: "10:30:45" },
    { id: "2", label: "Validation complete", timestamp: "10:30:46" },
    { id: "3", label: "Sealed into ledger", timestamp: "10:30:47" },
  ];

  return (
    <div>
      <h2>Verification Chain</h2>
      <VerifyChain
        links={entries}
        autoVerify={true}
        verifyDelay={200}
      />
    </div>
  );
}
```

**Behavior**:
- Renders as vertical chain with circles and connecting lines
- Each circle lights up sequentially (200ms apart by default)
- When verified: circle glows green, check mark appears
- Connecting line between links animates to green when link is verified
- Auto-play: links reveal automatically on mount
- Respects `prefers-reduced-motion`: shows all immediately

**Customization**:
```tsx
// Fast verification (100ms per link)
<VerifyChain links={entries} verifyDelay={100} />

// Manual control (no auto-play)
<VerifyChain links={entries} autoVerify={false} />

// Custom timing
<VerifyChain links={entries} verifyDelay={250} />
```

**Styling Notes**:
- Green color from `--color-pass` CSS variable
- Gray for unverified from `--color-rule`
- Check mark from lucide-react `CheckCircle2`
- Connecting lines positioned absolutely (no layout impact)

---

### 5. GateFlow (Check Progression)

**Location**: `components/gate-flow.tsx`  
**Purpose**: Sequential validation checks with pass/fail indicators

**Props**:
```tsx
interface GateFlowProps {
  failing?: number; // Index of failing check (-1 = all pass)
}
```

**Example**:
```tsx
import { GateFlow } from "@/components/gate-flow";

export function TransactionValidation() {
  return (
    <div>
      <h2>Validation Progress</h2>
      <GateFlow failing={-1} /> {/* All checks pass */}
    </div>
  );
}

// Or with failure:
export function FailedValidation() {
  return <GateFlow failing={3} />; {/* 4th check fails */}
}
```

**Behavior**:
- Displays 7 checks horizontally: Conformance, Cap limit, Balance, Expiry, Validity, Retries, Blocks
- Each check circle reveals sequentially (120ms stagger)
- Unverified: gray circle with number
- Verified: green circle with checkmark (✓)
- Failed: red circle with X
- Connecting lines animate to green as checks pass
- Respects `prefers-reduced-motion`: shows all immediately

**Customization Notes**:
- Hardcoded checks list in component
- To change checks, edit `CHECKS` array in `gate-flow.tsx`
- Timing: 120ms per check = 840ms total (under 1.2s max)

---

## Pattern Reference

### Loading/Progression Pattern
Use `GateFlow` or `VerifyChain` for processes that unfold over time:

```tsx
// For technical validation steps
<GateFlow failing={-1} />

// For business logic steps
<VerifyChain links={ledgerEntries} autoVerify={true} />
```

### Data Inspection Pattern
Use `JSONPayload` when showing raw data:

```tsx
<JSONPayload
  data={apiResponse}
  label="API Response"
  defaultOpen={false}
/>
```

### Copy-to-Clipboard Pattern
Use `Hash` for displaying copyable identifiers:

```tsx
<Hash value={transactionId} />
```

### Mobile Navigation Pattern
Use `MobileSheet` for navigation below 768px:

```tsx
<MobileSheet
  isOpen={navOpen}
  onClose={() => setNavOpen(false)}
  title="Menu"
>
  {navLinks}
</MobileSheet>
```

---

## Common Use Cases

### Full Transaction Detail Page

```tsx
"use client";

import { GateFlow } from "@/components/gate-flow";
import { JSONPayload } from "@/components/json-payload";
import { Ruling } from "@/components/ruling";

export function TransactionDetail() {
  const decision = { /* decision data */ };
  const payload = { /* transaction payload */ };

  return (
    <div className="space-y-8">
      {/* Validation flow */}
      <GateFlow failing={-1} />

      {/* Decision ruling */}
      <Ruling decision={decision} variant="full" />

      {/* Raw transaction data */}
      <JSONPayload
        data={payload}
        label="Transaction Payload"
        defaultOpen={false}
      />
    </div>
  );
}
```

### Ledger with Verification Chain

```tsx
"use client";

import { VerifyChain } from "@/components/verify-chain";

export function LedgerPage() {
  const chainLinks = [
    { id: "1", label: "Entry created", timestamp: "10:30:45" },
    { id: "2", label: "Verified", timestamp: "10:30:46" },
    { id: "3", label: "Sealed", timestamp: "10:30:47" },
  ];

  return (
    <div>
      <h1>Ledger Entries</h1>
      <VerifyChain links={chainLinks} verifyDelay={200} />
    </div>
  );
}
```

### Mobile Navigation

```tsx
"use client";

import { MobileSheet } from "@/components/mobile-sheet";
import { useState } from "react";

export function Layout({ children }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <header>
        <button onClick={() => setNavOpen(true)}>☰</button>
      </header>

      <MobileSheet
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
        title="Navigation"
      >
        <nav>{/* nav items */}</nav>
      </MobileSheet>

      <main>{children}</main>
    </>
  );
}
```

---

## Styling Customization

All components use CSS variables for theming. Customize in your `globals.css`:

```css
:root {
  --color-pass: #10b981;      /* Green for verified */
  --color-fail: #ef4444;      /* Red for failed */
  --color-rule: #d1d5db;      /* Gray for unverified */
  --color-ink: #1f2937;       /* Text primary */
  --color-ink-2: #6b7280;     /* Text secondary */
  --color-ink-3: #9ca3af;     /* Text tertiary */
  --color-paper: #f9fafb;     /* Light background */
  --color-surface: #ffffff;   /* Card background */
  --font-mono: "SF Mono", Monaco, "Cascadia Code", monospace;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-pass: #34d399;
    --color-fail: #f87171;
    --color-rule: #4b5563;
    --color-ink: #f3f4f6;
    --color-ink-2: #d1d5db;
    --color-ink-3: #9ca3af;
    --color-paper: #111827;
    --color-surface: #1f2937;
  }
}
```

---

## Accessibility Checklist

- [x] All animations respect `prefers-reduced-motion`
- [x] Keyboard navigation works during animations
- [x] No motion-induced seizure triggers (no flashing, no rapid changes)
- [x] Color contrast maintained throughout animations
- [x] Animations don't steal focus
- [x] Animations don't block user input

---

## Performance Best Practices

1. **Avoid stacking animations**: Don't animate multiple properties simultaneously on same element
2. **Use GPU-safe properties**: Only `opacity`, `transform`, `backgroundColor`
3. **Reduce motion on mobile**: Consider shorter durations on small screens
4. **Test with DevTools**: Measure FPS during animations (should stay 60+)

---

## Troubleshooting

**Animation not playing?**
- Check `prefers-reduced-motion` is disabled in browser
- Verify `motion` package is installed: `npm list motion`
- Ensure component is wrapped in client boundary (`"use client"`)

**Animation causing jank?**
- Check DevTools Performance tab for layout thrashing
- Verify only GPU-safe properties are animated
- Consider reducing animation duration

**Styles not applying?**
- Verify CSS variables are defined in `globals.css`
- Check Tailwind configuration includes custom properties
- Ensure parent has correct color scheme set

**Mobile sheet not appearing?**
- Verify viewport is under 768px (check DevTools responsive mode)
- Check `isOpen` state is true
- Ensure `onClose` handler is properly bound

---

## Version Information

- Motion: 13.2.0
- React: 19.2.8
- Next.js: 16.3.3
- Tailwind CSS: 4.0

---

## Further Reading

- See `MOTION_DESIGN.md` for design philosophy and principles
- See `MOTION_IMPLEMENTATION_SUMMARY.md` for detailed implementation specs
- Motion docs: https://motion.dev/
