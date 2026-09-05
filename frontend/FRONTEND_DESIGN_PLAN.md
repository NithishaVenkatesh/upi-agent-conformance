# 📋 FRONTEND DESIGN PLAN
**Date**: 2026-09-03  
**Status**: Ready for Implementation  
**Based on**: FRONTEND_AUDIT.md findings

---

## DESIGN PRINCIPLES GUIDING FIXES

### Primary Principles (from UX research)
1. **Semantic HTML First** - Correct element usage enables accessibility
2. **Visible Focus States** - WCAG 2.2 requirement; 2px minimum outline
3. **Keyboard Navigation** - All interactive elements must be reachable via Tab
4. **Aria Labels** - Buttons/controls need accessible names for screen readers
5. **Focus Management** - Modal/menu open should move focus appropriately
6. **Single Purpose Per Control** - One link per table row, not one per cell
7. **Hierarchy Through Visual Weight** - Primary CTA should be visually dominant
8. **Regulatory Aesthetic** - Verdicts only on actual decisions, not placeholders

### Sources
- WCAG 2.2 (Focus Visible: 2.4.7, Focus Not Obscured: 2.4.11)
- Apple Human Interface Guidelines (Interaction & Feedback)
- Nielsen Norman Group (Usability Heuristics)
- WAI-ARIA Authoring Practices

---

## FIX #1: Add H1 Tag to Landing Page

**Issue #1 (P1)**: Missing semantic H1  
**WCAG Reference**: Heading structure (2.4.10)

### Problem
- Hero text is a `<blockquote>`, not an `<h1>`
- Screen readers don't announce a page heading
- Violates semantic HTML best practices

### Design Solution
Replace the blockquote with a proper heading hierarchy:

```jsx
// BEFORE (semantic HTML issue)
<blockquote className="font-doc text-[2.5rem] ...">
  The block created shall not be treated as the guarantee of payment.
</blockquote>

// AFTER (semantically correct)
<h1 className="font-doc text-[2.5rem] leading-[1.35] text-[--color-ink] max-w-[35ch]">
  The block created shall not be treated as the guarantee of payment.
</h1>
```

### Why This Works
- ✅ Semantic HTML - screen readers announce it as a heading
- ✅ Same visual styling (font-doc = serif, 2.5rem size)
- ✅ No layout changes - purely semantic fix
- ✅ Maintains regulatory aesthetic (serif typography for legal quote)

### Acceptance Criteria
- [ ] H1 element exists in DOM
- [ ] H1 text content = opening regulatory quote
- [ ] Visual styling unchanged from current design
- [ ] Screen readers announce "The block created shall not be treated as the guarantee of payment, heading level 1"

---

## FIX #2: Add Focus-Visible Outline to Landing Page Buttons

**Issue #2 (P1)**: No focus outline (accessibility)  
**WCAG Reference**: Focus Visible (2.4.7)

### Problem
- Landing page buttons lack `focus-visible` CSS
- Keyboard users can't see which element has focus
- Login page buttons HAVE this (correct) but landing doesn't (inconsistent)
- Violates WCAG 2.2 Focus Visible requirement

### Design Solution
Add the same focus-visible pattern used on login page:

```jsx
// BEFORE (no focus visible)
<Link
  href="/login"
  className="px-6 py-3 bg-[--color-ink] text-[--color-paper] rounded-[3px] ... hover:bg-[#14313A] ..."
>
  Open the dashboard
</Link>

// AFTER (with focus visible)
<Link
  href="/login"
  className="px-6 py-3 bg-[--color-ink] text-[--color-paper] rounded-[3px] ... hover:bg-[#14313A] focus-visible:outline-2 focus-visible:outline-[--color-ink] focus-visible:outline-offset-0 ..."
>
  Open the dashboard
</Link>
```

### Why This Works
- ✅ 2px outline meets WCAG minimum
- ✅ High contrast (dark ink on light paper)
- ✅ Offset = 0 matches compact design
- ✅ Consistent with login page implementation

### Acceptance Criteria
- [ ] Tab to button → 2px outline appears
- [ ] Outline color is `--color-ink`
- [ ] Outline offset is 0
- [ ] Both buttons ("Open dashboard" and "Read architecture") have focus outlines
- [ ] Focus outline visible on all keyboard navigation

---

## FIX #3: Add Semantic Button Element (or ARIA Label)

**Issue #3 (P1)**: Link styled as button  
**WCAG Reference**: ARIA: button role (4.1.2)

### Problem
- "Open the dashboard" is a `<Link>` but styled as a button
- Screen readers announce it as "link" not "button"
- Visual role ≠ semantic role (confusing to users)

### Design Solution - Option A (Recommended): Use Button Element
```jsx
// BEFORE (Link styled as button)
<Link href="/login" className="... bg-[--color-ink] ...">
  Open the dashboard
</Link>

// AFTER (Semantic button with navigation)
const router = useRouter();
const handleClick = () => router.push('/login');

<button
  onClick={handleClick}
  className="px-6 py-3 bg-[--color-ink] text-[--color-paper] rounded-[3px] font-500 text-14px hover:bg-[#14313A] focus-visible:outline-2 focus-visible:outline-[--color-ink] active:bg-[#0a1619] active:scale-[0.98] transition-all duration-150 min-h-[48px]"
>
  Open the dashboard
</button>
```

### Why This Works
- ✅ `<button>` element = screen readers announce "button"
- ✅ Mouse and keyboard both work
- ✅ Visual styling unchanged
- ✅ Next.js router.push handles navigation same as Link

### Acceptance Criteria
- [ ] Element is a `<button>`, not a `<Link>`
- [ ] Click handler navigates to /login
- [ ] Keyboard: Space/Enter triggers navigation
- [ ] Screen reader announces "button"
- [ ] Visual styling and animation unchanged

---

## FIX #4: Add Aria-Labels to Segmented Control

**Issue #4 (P2)**: Missing ARIA labels  
**WCAG Reference**: Accessible Names (4.1.2)

### Problem
- SegmentedControl buttons have `aria-pressed` but no `aria-label`
- Screen reader says "All button, pressed" but not what it filters
- Unclear that this is a status filter

### Design Solution
```jsx
// BEFORE (no aria-label)
<button
  key={opt.value}
  onClick={() => onChange(opt.value)}
  className={...}
  aria-pressed={value === opt.value}
>
  {opt.label}
</button>

// AFTER (with aria-label and grouping)
<fieldset className="flex gap-1 p-1 bg-[--color-paper] rounded-[3px] inline-flex">
  <legend className="sr-only">Filter transactions by verdict status</legend>
  
  {options.map((opt) => (
    <button
      key={opt.value}
      onClick={() => onChange(opt.value)}
      className={...}
      aria-pressed={value === opt.value}
      aria-label={`Show ${opt.label.toLowerCase()} transactions`}
    >
      {opt.label}
    </button>
  ))}
</fieldset>
```

### Why This Works
- ✅ `<fieldset>` + `<legend>` group the control
- ✅ `aria-label` explains each button's purpose
- ✅ Screen reader announces: "Filter transactions by verdict status, Show all transactions button"
- ✅ `.sr-only` hides legend visually but keeps it for screen readers

### Acceptance Criteria
- [ ] Fieldset wraps the button group
- [ ] Legend text = "Filter transactions by verdict status"
- [ ] Each button has aria-label
- [ ] Screen reader announces control group and individual button purposes

---

## FIX #5: Add Focus Management to Mobile Menu

**Issue #5 (P2)**: No focus management  
**WCAG Reference**: Focus Management (2.4.3)

### Problem
- Mobile menu opens but focus doesn't move to it
- Keyboard user must manually tab to reach menu items
- No focus trap (can tab out of menu while open)

### Design Solution
```jsx
// BEFORE (no focus management)
{menuOpen && (
  <motion.nav className="fixed left-0 top-0 ...">
    {/* menu items */}
  </motion.nav>
)}

// AFTER (with focus management)
{menuOpen && (
  <motion.nav
    className="fixed left-0 top-0 ... z-30 md:hidden flex flex-col"
    initial={{ x: -256 }}
    animate={{ x: 0 }}
    transition={{ duration: 0.3 }}
    role="dialog"
    aria-modal="true"
    aria-label="Mobile navigation menu"
    ref={menuRef}
    onKeyDown={(e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    }}
  >
    <div className="p-4 flex justify-between items-center border-b border-[--color-rule-2]">
      <h2 className="font-600 text-sm">Menu</h2>
      <button
        ref={closeButtonRef}
        onClick={() => setMenuOpen(false)}
        className="... min-h-[44px] min-w-[44px] ..."
        aria-label="Close menu"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
    {/* menu items */}
  </motion.nav>
)}
```

Also add at component mount:
```jsx
useEffect(() => {
  if (menuOpen && closeButtonRef.current) {
    closeButtonRef.current.focus();
  }
}, [menuOpen]);
```

### Why This Works
- ✅ `role="dialog" aria-modal="true"` announces to screen readers
- ✅ Focus moves to close button when menu opens
- ✅ Escape key closes menu (standard pattern)
- ✅ Logical focus order: close button → nav items

### Acceptance Criteria
- [ ] Menu opens, focus moves to close button
- [ ] Pressing Tab navigates through menu items
- [ ] Pressing Escape closes menu
- [ ] After menu closes, focus returns to menu button
- [ ] Screen reader announces "Mobile navigation menu, dialog"

---

## FIX #6: Simplify Transaction Table Navigation

**Issue #6 (P2)**: Too many links per row  
**UX Research**: Information Architecture, efficient navigation

### Problem
- 4 links per row × 5 rows = 25 focus stops
- Same destination (/app/transactions/:id) for each cell
- Inefficient keyboard navigation
- Better: clickable row with single link

### Design Solution
```jsx
// BEFORE (4 separate links per row)
<tr className="border-b border-[--color-rule-2] hover:bg-[--color-paper]">
  <td>
    <Link href={`/app/transactions/${tx.id}`} className="...">
      {formatTime(tx.timestamp)}
    </Link>
  </td>
  <td>
    <Link href={`/app/transactions/${tx.id}`} className="...">
      <Money minor={tx.amount_minor} />
    </Link>
  </td>
  {/* ... 2 more link cells ... */}
</tr>

// AFTER (single link, row as container)
<tr 
  className="border-b border-[--color-rule-2] hover:bg-[--color-paper] cursor-pointer transition-colors"
  onClick={() => router.push(`/app/transactions/${tx.id}`)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      router.push(`/app/transactions/${tx.id}`);
    }
  }}
  role="button"
  tabIndex={0}
  aria-label={`Transaction ${formatTime(tx.timestamp)}, ${tx.customer_id}, verdict: ${tx.status}`}
>
  <td className="py-2 px-0">
    <span className="text-12px font-[--font-mono] text-[--color-ink-2]">
      {formatTime(tx.timestamp)}
    </span>
  </td>
  {/* ... other cells, no links ... */}
</tr>
```

### Why This Works
- ✅ Tab once per row (5 total focus stops instead of 25)
- ✅ Click or keyboard (Enter/Space) navigate to detail
- ✅ Hover state still present (mouse users see feedback)
- ✅ `role="button" tabIndex={0}` makes it keyboard accessible

### Acceptance Criteria
- [ ] Each row has single focus stop (1 tabIndex per row)
- [ ] Click row → navigate to transaction detail
- [ ] Enter/Space on row → navigate to transaction detail
- [ ] Tab through table: 5 focus stops (1 per row)
- [ ] aria-label describes row content

---

## FIX #7: Wire Up Demo Mode Toggle or Remove It

**Issue #9 (P3)**: Non-functional control  
**Design Principle**: No deceptive UI

### Problem
- Demo mode checkbox exists but does nothing
- User might click it expecting behavior
- Placeholder functionality looks finished

### Design Solution - Option A: Remove It (Recommended)
```jsx
// BEFORE
<div className="p-6 border-t border-[--color-rule-2] space-y-3">
  <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
    <input
      type="checkbox"
      className="w-5 h-5 rounded"
      defaultChecked
      aria-label="Toggle demo mode"
    />
    <span className="text-sm text-[--color-ink-2]">Demo mode</span>
  </label>
  <div className="flex items-center gap-2 p-2 bg-[--color-paper] rounded">
    {/* user card */}
  </div>
</div>

// AFTER (Remove toggle, keep user card)
<div className="p-6 border-t border-[--color-rule-2] space-y-3">
  <div className="flex items-center gap-2 p-2 bg-[--color-paper] rounded">
    {/* user card */}
  </div>
</div>
```

OR

### Design Solution - Option B: Implement It (If desired)
```jsx
// Add to parent component state
const [demoMode, setDemoMode] = useState(true);

// Use in filter logic
const filteredTransactions = demoMode 
  ? MOCK_TRANSACTIONS  // show demo data
  : REAL_TRANSACTIONS;  // show real data (when backend ready)

// Add onChange to checkbox
<input
  type="checkbox"
  checked={demoMode}
  onChange={(e) => setDemoMode(e.target.checked)}
  aria-label="Toggle demo mode (demo data vs. real data)"
/>
```

### Why This Works
- ✅ Option A: Removes deceptive UI, simplifies sidebar
- ✅ Option B: Makes feature functional, ties to real data source
- ✅ Either way: No false promises about functionality

### Acceptance Criteria
- [ ] Either: Remove checkbox entirely, OR
- [ ] Checkbox onChange toggles between demo and real data
- [ ] If removed: no visual gap left in sidebar
- [ ] If kept: aria-label describes what it does

---

## FIX #8: Update Hardcoded User Data

**Issue #10 (P3)**: Placeholder content  
**Design Principle**: Real data, not mock

### Problem
- User card shows hardcoded "J" and "Judge"
- Should reflect authenticated user
- Currently unusable for real authentication

### Design Solution
```jsx
// BEFORE (hardcoded)
<div className="flex items-center gap-2 p-2 bg-[--color-paper] rounded">
  <div className="w-6 h-6 bg-[--color-ink] rounded text-white flex items-center justify-center text-xs font-600">
    J
  </div>
  <div>
    <p className="text-xs font-500 text-[--color-ink]">Judge</p>
    <p className="text-xs text-[--color-ink-3]">Demo</p>
  </div>
</div>

// AFTER (dynamic)
{/* Assuming auth context provides user data */}
<div className="flex items-center gap-2 p-2 bg-[--color-paper] rounded">
  <div className="w-6 h-6 bg-[--color-ink] rounded text-white flex items-center justify-center text-xs font-600">
    {user?.name?.[0]?.toUpperCase() || '?'}
  </div>
  <div>
    <p className="text-xs font-500 text-[--color-ink]">{user?.name || 'User'}</p>
    <p className="text-xs text-[--color-ink-3]">{user?.role || 'Demo'}</p>
  </div>
</div>
```

### Acceptance Criteria
- [ ] User card shows authenticated user's first letter
- [ ] User card shows authenticated user's name
- [ ] User role/status displayed from auth context
- [ ] Falls back gracefully if user data unavailable

---

## FIX #9: Improve Landing Page Button Hierarchy

**Issue #11 (P3)**: Unclear CTA priority  
**Design Principle**: Visual hierarchy, Nielsen's Usability Heuristics

### Problem
- Two CTAs at similar visual weight
- "Open Dashboard" should be clearly primary (most important for demo)
- "Read Architecture" is secondary

### Design Solution
```jsx
// BEFORE (equal weight)
<div className="flex gap-4 pt-6 flex-col sm:flex-row">
  <Link href="/login" className="px-6 py-3 bg-[--color-ink] text-[--color-paper] ...">
    Open the dashboard
  </Link>
  <a href="#architecture" className="px-6 py-3 text-[--color-ink] border-b-2 ...">
    Read the architecture
  </a>
</div>

// AFTER (clear hierarchy)
<div className="flex gap-4 pt-6 flex-col sm:flex-row">
  <button
    onClick={() => router.push('/login')}
    className="px-8 py-3 bg-[--color-ink] text-[--color-paper] rounded-[3px] font-600 text-15px hover:bg-[#14313A] focus-visible:outline-2 focus-visible:outline-[--color-ink] active:bg-[#0a1619] active:scale-[0.98] transition-all duration-150 min-h-[48px] shadow-md hover:shadow-lg"
  >
    Open the dashboard
  </button>
  <a
    href="#architecture"
    className="px-6 py-3 text-[--color-ink-2] border-b border-[--color-ink-2] font-500 text-14px hover:text-[--color-ink] hover:border-[--color-ink] transition-all duration-150 min-h-[48px] flex items-center justify-center"
  >
    Read the architecture
  </a>
</div>
```

### Why This Works
- ✅ Primary: larger padding (px-8), font-600 weight, shadow
- ✅ Secondary: smaller padding (px-6), font-500, no shadow
- ✅ Primary draws eye first (size + shadow)
- ✅ Both clearly interactive

### Acceptance Criteria
- [ ] Primary button visually larger/darker than secondary
- [ ] Primary button has subtle shadow
- [ ] Secondary link remains understandable but visually subordinate
- [ ] Judge's eye drawn to "Open Dashboard" first on first glance

---

## IMPLEMENTATION PRIORITY

### Phase 1 (Critical - Same Day)
- [ ] FIX #1: Add H1 tag
- [ ] FIX #2: Add focus-visible outlines
- [ ] FIX #3: Update button semantics
- [ ] FIX #4: Add aria-labels to filter

### Phase 2 (Major - Next 1-2 Hours)
- [ ] FIX #5: Focus management on mobile menu
- [ ] FIX #6: Simplify table navigation
- [ ] FIX #9: Improve button hierarchy

### Phase 3 (Polish - Polish Phase)
- [ ] FIX #7: Demo mode (remove or wire)
- [ ] FIX #8: User card data binding
- [ ] FIX #10 (from audit): Table header alignment (cosmetic)

---

## ACCEPTANCE CRITERIA CHECKLIST

After implementation, all of these must be true:

### Keyboard Navigation
- [ ] Tab order is logical (top to bottom, left to right)
- [ ] All interactive elements reachable via Tab
- [ ] No keyboard traps
- [ ] Focus visible on all elements (2px outline minimum)
- [ ] Escape closes modals/menus
- [ ] Enter/Space activate buttons

### Screen Reader
- [ ] Page has H1 heading
- [ ] Links and buttons have accessible names
- [ ] Form fields have labels
- [ ] Status updates announced
- [ ] Menu/dialog properly announced with role and aria-label

### Visual Design
- [ ] Primary CTA visually dominant
- [ ] Focus outlines high contrast
- [ ] Color not sole means of communication
- [ ] Consistent button heights (48px minimum)
- [ ] Proper spacing throughout

### Responsive
- [ ] Works 390px to 1440px
- [ ] Mobile menu functional
- [ ] Touch targets ≥44px
- [ ] No horizontal scroll (except intentional)

---

## NEXT PHASE

After design plan approval:
1. **Implement fixes** (Phase 1, 2, 3)
2. **Verify each fix** locally
3. **Run QA audit** (FRONTEND_VERIFICATION.md)
4. **Fix remaining issues**
5. **Final audit** and quality gate

**Status**: Ready for implementation phase
