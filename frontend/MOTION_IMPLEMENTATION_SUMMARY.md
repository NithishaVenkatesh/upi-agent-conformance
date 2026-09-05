# Motion Implementation Summary

## Overview

Five response-to-action motion feedback systems implemented for Razorpay dashboard using the Motion package (v13.2.0). All animations follow Emil Kowalski's restraint philosophy: purposeful, fast, and never decorative.

## Files Created & Modified

### New Components
1. **`components/json-payload.tsx`** - Expandable JSON with smooth height animation
2. **`components/mobile-sheet.tsx`** - Mobile sidebar with bottom-slide entrance
3. **`components/verify-chain.tsx`** - Ledger chain with sequential verification lights

### Modified Components
1. **`components/hash.tsx`** - Copy confirmation with scale + cross-fade
2. **`components/gate-flow.tsx`** - Refactored with Motion package + proper staggering

### Updated Pages
1. **`app/app/transactions/[id]/page.tsx`** - Integrated JSONPayload component
2. **`app/app/ledger/page.tsx`** - Integrated VerifyChain component

### Documentation
- **`MOTION_DESIGN.md`** - Comprehensive motion system documentation
- **`MOTION_IMPLEMENTATION_SUMMARY.md`** - This file

## Animation Specifications

### 1. Hash Component (Copy-Confirmation)
**File**: `components/hash.tsx`  
**Trigger**: Click "Copy" button  
**Frequency**: Occasional (daily)  
**Duration**: 120ms (button response) + 1500ms (state)

**Motion Sequence**:
```
User clicks → Button scales down 0.95 (120ms easeOut)
           → Text cross-fades "Copy" → "✓" (120ms easeOut)
           → State persists 1500ms
           → Reverts with reverse animation
```

**Key Implementation**:
- Button uses `animate={{ scale }}` for tactile feedback
- Text uses `key` + `AnimatePresence` for atomic cross-fade
- No fade-and-slide—just scale and opacity
- Respects `prefers-reduced-motion` implicitly via motion library

### 2. GateFlow (Verify-Chain Progression)
**File**: `components/gate-flow.tsx`  
**Trigger**: Component mount  
**Frequency**: Rare (once per transaction)  
**Duration**: 840ms total (7 checks × 120ms stagger)

**Motion Sequence**:
```
t=0ms    → Check 1 fades in, circle color animates
t=120ms  → Check 2 fades in, check mark scale-in
t=240ms  → Check 3 fades in, connector line color animates
...
t=720ms  → Check 7 completes
```

**Key Implementation**:
- Each check staggered by 120ms (under 1.2s max)
- Circle color animates `bg-[--color-rule]` → `bg-[--color-pass]`
- Check mark uses `key` + `initial={{ scale: 0 }}` for pop effect
- Connector lines animate color separately (no layout shift)
- **Accessibility**: `prefers-reduced-motion` skips delays, shows all immediately
- **Performance**: Uses `transform` and `backgroundColor` only (GPU-safe)

### 3. JSON Payload (Expand/Collapse)
**File**: `components/json-payload.tsx`  
**Trigger**: Click to expand/collapse  
**Frequency**: Occasional (manual inspection)  
**Duration**: 250ms (height) + 200ms (opacity)

**Motion Sequence**:
```
User clicks → Chevron rotates 180° (200ms easeOut)
           → Content height: 0 → auto (250ms easeOut)
           → Content opacity: 0 → 1 (200ms simultaneous)
```

**Key Implementation**:
- `AnimatePresence mode="sync"` prevents layout thrash
- Height animation calculated from 0 to `auto` (no hardcoded values)
- Opacity staggered slightly behind height (optical balance)
- Overflow hidden prevents content spillover during animation
- Respects `prefers-reduced-motion` via motion library default

### 4. Mobile Sheet (Sidebar Entrance)
**File**: `components/mobile-sheet.tsx`  
**Trigger**: Click navigation or open action  
**Frequency**: Occasional (mobile navigation)  
**Duration**: 200ms (backdrop) + 300ms (sheet)

**Motion Sequence**:
```
User opens → Backdrop fades in (200ms easeIn)
          → Sheet slides up from bottom (300ms easeOut)
          → Staggered timing (backdrop first) reduces perceived latency
```

**Key Implementation**:
- Backdrop fade (`opacity: 0 → 1`) separate from sheet motion
- Sheet slides `y: 100% → 0` with `easeOut` (quick deceleration at end)
- Exit animation reverses (sheet down + backdrop fade out)
- Hidden on desktop (`md:hidden`) - no wasted DOM
- `AnimatePresence mode="sync"` ensures clean unmount

### 5. Verify Chain (Ledger Progression)
**File**: `components/verify-chain.tsx`  
**Trigger**: Component mount  
**Frequency**: Rare (per ledger view)  
**Duration**: 200ms per link (1200ms total for 6 links)

**Motion Sequence**:
```
t=0ms    → Link 1 fades in, circle indicator animates
t=200ms  → Link 2 fades in, check mark appears, connecting line glows
t=400ms  → Link 3 fades in
...
t=1000ms → Link 6 completes, full chain verified
```

**Key Implementation**:
- Each link staggered by 200ms (1200ms total = 1.2s max allowed)
- Circle background animates `--color-rule` → `--color-pass`
- Check mark scales in (`scale: 0 → 1`) when verified
- Glow effect via `boxShadow` animation (no additional DOM elements)
- Connecting vertical lines animate color between links
- **Accessibility**: `prefers-reduced-motion` shows all links immediately
- **Auto-play**: Can be disabled via `autoVerify={false}` prop

## Timing Summary

| Component | Action | Duration | Logic |
|-----------|--------|----------|-------|
| **Hash** | Button press | 120ms | Tactile feedback (scale 0.95) |
| **Hash** | Confirmation state | 1500ms | Display check mark, then reset |
| **GateFlow** | Per-check reveal | 120ms stagger | 7 checks = 840ms total |
| **GateFlow** | Color transition | 180ms | Circle and line color change |
| **JSON** | Expand/collapse | 250ms | Height animation |
| **JSON** | Chevron rotation | 200ms | Visual cue for expand action |
| **Mobile Sheet** | Backdrop fade | 200ms | Context without distraction |
| **Mobile Sheet** | Slide entrance | 300ms | Bottom-to-top reveal |
| **Verify Chain** | Per-link reveal | 200ms stagger | 6 links = 1200ms total |
| **Verify Chain** | Glow effect | 200ms | Box shadow animation |

**All under 300ms except GateFlow (840ms) and VerifyChain (1200ms), both rare progressive flows.**

## Accessibility Compliance

✅ **prefers-reduced-motion support**:
- All sequential animations check `window.matchMedia("(prefers-reduced-motion: reduce)")`
- When enabled: Skip delays, show final state immediately
- No jank—state is rendered correctly, just without animation

✅ **Keyboard navigation**:
- All buttons remain focusable during animation
- No animation blocks interaction
- Animations don't steal focus

✅ **Color contrast**:
- Animations don't reduce color contrast
- Glow effects use opacity (not color change) for verification indicators
- Text remains readable throughout

## Performance Notes

✅ **GPU-optimized**:
- Only `opacity`, `transform` (scale/rotate/translate), and `backgroundColor` used
- No `width`, `height`, `left`, `top` on animated elements (except `AnimatePresence` height)
- No `will-change` needed—motion library handles GPU layers

✅ **Layout stability**:
- Staggered animations don't cause reflows on every step
- `AnimatePresence` with `overflow: hidden` prevents content spillover
- Connecting lines use `position: absolute` (removed from flow)

✅ **Reduced motion performance**:
- No animation delays fire when `prefers-reduced-motion` active
- State updates still instant
- Zero performance penalty for accessible users

## Usage Examples

### Adding copy-confirmation to a new component
```tsx
import { Hash } from "@/components/hash";

export function MyComponent() {
  return <Hash value="0x1a2b3c4d5e6f7g8h" />;
}
```

### Using VerifyChain with custom links
```tsx
import { VerifyChain } from "@/components/verify-chain";

const links = [
  { id: "1", label: "Step 1", timestamp: "10:30:45" },
  { id: "2", label: "Step 2", timestamp: "10:30:46" },
];

export function MyLedger() {
  return <VerifyChain links={links} autoVerify={true} verifyDelay={150} />;
}
```

### Opening mobile sheet programmatically
```tsx
import { MobileSheet } from "@/components/mobile-sheet";
import { useState } from "react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Menu</button>
      <MobileSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Navigation"
      >
        <nav>{/* navigation items */}</nav>
      </MobileSheet>
    </>
  );
}
```

### Conditional animation speed
```tsx
<VerifyChain
  links={links}
  autoVerify={true}
  verifyDelay={150} // Fast verification (150ms per link)
/>
```

## Testing Checklist

- [ ] Copy button responds immediately (120ms scale)
- [ ] Confirmation check mark appears and persists 1.5s
- [ ] GateFlow checks reveal sequentially (120ms stagger)
- [ ] JSON payload expands smoothly without jank
- [ ] Mobile sheet slides up from bottom on small screens
- [ ] Verify chain lights up sequentially on ledger page
- [ ] All animations respect `prefers-reduced-motion`
- [ ] No animations block user interaction
- [ ] Chrome DevTools Performance shows 60fps during animations
- [ ] Mobile sheet hidden on desktop (inspect element)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

**Motion package handles vendor prefixes automatically.**

## Next Steps

1. **Test in browser** - Run `npm run dev` and verify each animation
2. **Measure performance** - Chrome DevTools → Performance tab
3. **Audit accessibility** - Wave extension → Check WCAG 2.1 compliance
4. **Gather feedback** - User testing with actual transactions
5. **Future enhancements** - Spring-based easing, gesture animations, haptic feedback

## Motion Package Reference

- **Version**: 13.2.0
- **API**: `motion.dev` (successor to Framer Motion)
- **Key exports**: `motion`, `AnimatePresence`, `LayoutGroup`
- **Docs**: https://motion.dev/

## Questions?

See `MOTION_DESIGN.md` for detailed design philosophy and pattern library.
