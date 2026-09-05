# Motion Design System

Response-to-action motion feedback for Razorpay dashboard. All animations follow Emil Kowalski's principles: **restraint, speed, and purposeful motion**. No decorative animations—motion communicates state changes and invites interaction.

## Core Principles

- **Frequency-based**: Animations scale to usage frequency
- **Purposeful**: Motion indicates state change or response to action
- **Restrained**: <300ms for high-frequency interactions; 1.2s max for progressive flows
- **Accessible**: All animations respect `prefers-reduced-motion`
- **GPU-optimized**: Use `transform` and `opacity` only

## Animations by Component

### 1. Hash Component (Copy Confirmation)
**Frequency**: Occasional (daily)  
**Duration**: 120ms (button response) + 1500ms (confirmation state)  
**Motion Type**: Scale + cross-fade

```tsx
// components/hash.tsx
```

**What happens**:
- Copy button briefly scales to 0.95 (tactile feedback)
- Text cross-fades "Copy" → "✓" (100ms in/out)
- Confirmation state persists 1500ms before reverting

**Why this matters**: Users need immediate visual confirmation that copy succeeded. The brief scale makes the interaction feel responsive without being playful.

### 2. GateFlow (Verify-Chain Progression)
**Frequency**: Rare (per transaction)  
**Duration**: 840ms total (7 checks × 120ms)  
**Motion Type**: Sequential fade-in + color transition

```tsx
// components/gate-flow.tsx
```

**What happens**:
- Each check circle fades in with a 120ms stagger (total: 840ms)
- Connecting lines animate color from gray → green when verified
- Check mark (✓) scales in when revealed
- Respects `prefers-reduced-motion`—shows all immediately

**Why this matters**: The progression tells a story of validation happening. Each new check signals forward progress. Under the 1.2s cap because this is a one-time flow per transaction.

### 3. JSON Payload (Expand/Collapse)
**Frequency**: Occasional (manual inspection)  
**Duration**: 250ms (height) + 200ms (opacity)  
**Motion Type**: Smooth height expansion + opacity crossfade

```tsx
// components/json-payload.tsx
```

**What happens**:
- Chevron rotates 180° in 200ms
- Content slides down/up using height animation (250ms)
- Opacity fades in/out simultaneously (200ms)
- Uses `AnimatePresence` to prevent layout thrash

**Why this matters**: Height animation prevents content from appearing suddenly. The chevron rotation cues the expand action. No jank on toggle—layout is calculated before animation starts.

### 4. Mobile Sheet (Sidebar Entrance)
**Frequency**: Occasional (mobile navigation)  
**Duration**: 300ms (slide) + 200ms (fade)  
**Motion Type**: Bottom-slide entrance + backdrop fade

```tsx
// components/mobile-sheet.tsx
```

**What happens**:
- Backdrop fades in over 200ms (prevents jank from simultaneous animations)
- Sheet slides up from bottom in 300ms with ease-out
- Exit reverses animations
- Hidden on desktop (`md:hidden`)

**Why this matters**: Bottom-slide is the mobile pattern—users expect content to enter from the bottom. The backdrop provides context without distraction.

### 5. Verify Chain (Ledger Progression)
**Frequency**: Rare (per ledger view)  
**Duration**: 200ms per link (1.2s for 6 links)  
**Motion Type**: Sequential fade + glow effect

```tsx
// components/verify-chain.tsx
```

**What happens**:
- Each link fades to full opacity with 200ms stagger
- Verified circles glow with box-shadow (green halo)
- Check mark appears inside when verified
- Connecting lines animate to green
- Auto-play by default; respects `prefers-reduced-motion`

**Why this matters**: Sequential reveal keeps the eye flowing down the chain. The glow effect creates a sense of "lighting up" verification. This is a once-per-page animation, so 1.2s is justified.

## Timing Breakdown

| Component | Action | Duration | Total |
|-----------|--------|----------|-------|
| Hash | Button press → confirm | 120ms + 1500ms | Staggered |
| GateFlow | Check reveal cycle | 840ms (7 × 120ms) | 840ms |
| JSON Payload | Expand/collapse | 250ms (height) | 250ms |
| Mobile Sheet | Slide entrance | 300ms + 200ms (backdrop) | 300ms |
| Verify Chain | Link progression | 200ms × 6 | 1200ms |

**All under 300ms except GateFlow (840ms) and Verify Chain (1200ms)—both are rare, progressive flows.**

## Accessibility

Every animation handles `prefers-reduced-motion`:

```tsx
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Fast-track completion
if (prefersReduced) {
  setRevealed(CHECKS.length); // Skip delays
  return;
}

// Normal flow with staggered reveals
```

Users who've set reduced motion get instant state completion, not instant animations.

## Performance Notes

- **GPU-safe**: Only `opacity` and `transform` (scale/rotate/translate) are used
- **No layout thrash**: Expand/collapse uses `height` with `overflow: hidden`
- **Reduced motion respected**: No delays or animations fire when opted out
- **Stagger optimization**: Delays are calculated client-side, not via CSS

## Motion Package (v13.2.0)

Using Framer Motion's modern successor:

```jsx
import { motion, AnimatePresence } from "motion/react";

// Simple animations
<motion.div animate={{ scale: 1 }} transition={{ duration: 0.2 }} />

// Layout transitions
<AnimatePresence mode="sync">
  {isOpen && <motion.div layoutId="sheet" />}
</AnimatePresence>

// Gesture-based (future)
<motion.div whileHover={{ scale: 1.05 }} />
```

## Common Patterns

### Sequential Reveal (Staggered)
```tsx
{items.map((item, i) => (
  <motion.div
    key={i}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{
      duration: 0.2,
      delay: i * 0.12, // 120ms between items
    }}
  />
))}
```

### Cross-fade
```tsx
<motion.span
  key={copied ? "check" : "copy"}
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
  transition={{ duration: 0.12, ease: "easeOut" }}
>
  {copied ? "✓" : "Copy"}
</motion.span>
```

### Height Expand (No Layout Thrash)
```tsx
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{
        height: { duration: 0.25, ease: "easeOut" },
        opacity: { duration: 0.2 },
      }}
      className="overflow-hidden"
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>
```

## Testing Motion

### Reduced Motion
```bash
# Chrome DevTools > Rendering > Emulate CSS media feature prefers-reduced-motion
# Test: motion should complete instantly, no delays
```

### Performance
```bash
# Chrome DevTools > Performance
# Record interaction, check:
# - No layout shifts during animation
# - FPS stays 60+
# - GPU layer rendering active
```

### Accessibility
```bash
# WAVE browser extension
# axe DevTools
# Test keyboard navigation works during animations
```

## Future Enhancements

- [ ] Spring-based easing for natural feel (e.g., `type: "spring"`)
- [ ] Gesture-based animations (swipe to dismiss, pinch-to-zoom)
- [ ] Haptic feedback integration (mobile)
- [ ] Animation breakpoints for tablet/desktop different timings
- [ ] Page transition animations (fade + slide between routes)

## References

- **Emil Kowalski** (Linear): Restraint philosophy, frequency-based decisions
- **Motion Package**: https://motion.dev/
- **MDN Web Docs**: CSS animations, GPU acceleration, `will-change`
- **Web Accessibility**: WCAG 2.1 Animation from Interactions guideline
