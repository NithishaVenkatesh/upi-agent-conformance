# Frontend Improvement Plan: in.razorpay.upi Dashboard

**Status:** Comprehensive Plan | **Date:** 2 September 2026 | **Author:** Multi-Agent Research Swarm

---

## Executive Summary

The Razorpay UPI compliance dashboard backend is production-grade and fully functional. The frontend, however, is a high-fidelity prototype—disconnected from backend APIs, with all data hardcoded and no real user interactivity.

This plan transforms the frontend from prototype to production-grade system by:
1. **Connecting the API client** to all pages (replacing hardcoded demo data)
2. **Building a merchant-centric checkout workflow** (currently 100% missing)
3. **Implementing complete UX flows** for payment decisions with regulatory citations
4. **Creating a production-ready component system** (38 components, 100% WCAG AA)
5. **Delivering in 4 phases over 8 weeks** with working product every 2 weeks

### Key Outcomes
- ✅ Merchant can complete payment → see decision → understand why in <2 minutes
- ✅ 100% of decisions cite NPCI/RBI regulatory authority
- ✅ Audit trail fully immutable and verifiable
- ✅ Mobile-first responsive design (375px → 1440px)
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Dark mode built-in from day 1
- ✅ >50 NPS on compliance clarity within 2 months

---

## 1. Current State Assessment

### Critical Issues
- **P0:** Frontend entirely demo-only; zero connection to backend APIs
- **P0:** No checkout/payment workflow; users cannot initiate transactions
- **P0:** Transaction detail page ignores route parameters; always shows same transaction
- **P0:** No navigation menu; users must manually edit URLs
- **P1:** All buttons are non-functional (no onClick handlers)
- **P1:** Status filter select renders but doesn't filter results
- **P1:** No error handling, loading states, or resilience patterns

### What Works Well
- Information architecture conceptually sound (dashboard, constraints, transaction detail, ledger, demo mode)
- Visual design is professional and consistent (colors, typography, spacing)
- Dark mode CSS is comprehensive
- TypeScript types match backend models
- API client skeleton is production-quality

### Scope Assessment
- **Audit Result:** 4/10 — Prototype/Mockup classification
- **Gap Size:** Large but manageable (payment flow ~2-3 weeks, constraints ~1 week, ledger/analytics ~2 weeks)
- **Risk:** Low technical risk (architecture is sound, backend stable, framework modern)

---

## 2. Vision Statement

### What Success Looks Like
A compliance-first merchant dashboard where:
- **Every payment decision is self-explanatory** — regulatory citation, applicable clause, direct quote visible at decision point
- **Debugging failures takes <2 minutes** — one detail page shows everything needed to understand why a payment was refused
- **Audit trail is immutable** — hash-chained ledger with tamper detection catches any system tampering
- **Regulatory confidence is high** — merchants know every term conforms to NPCI/RBI standards
- **Mobile experience is first-class** — bottom-tab navigation, responsive layouts, 44x44px touch targets
- **Accessibility is not optional** — WCAG 2.1 AA compliance, keyboard-navigable, screen-reader friendly

### Success Metrics
| Metric | Target | Why |
|--------|--------|-----|
| Compliance clarity NPS | >50 | Merchants understand decisions without support tickets |
| Payment form completion | <2 minutes | Quick onboarding → higher adoption |
| Ledger verification | 100% pass rate | Zero undetected tampering |
| Load time (LCP) | <2.5s | Merchants on Indian 4G networks |
| Mobile adoption | >40% | Many merchants work on phones |
| WCAG AA compliance | 100% | Regulatory requirement + accessibility |
| Test coverage | >95% | Financial app with <1% bug tolerance |

---

## 3. User Experience Design

### Merchant Persona

**Name:** Priya (28) — Small D2C e-commerce merchant  
**Business:** Handmade textiles, ₹5-50 lakh annual UPI revenue  
**Tech Level:** Basic (uses Shopify, Razorpay dashboard, WhatsApp for customer support)  
**Primary Goal:** Maximize payment success without regulatory penalties  
**Key Pain Point:** "Why did that payment fail? Is it my fault, the customer's fault, or a rule I broke?"  
**Decision:** Adopts systems with <5% activation friction; abandons if compliance is complex

### Critical User Journeys

#### Journey 1: Onboarding (Week 1)
```
Priya logs in → Declares payment terms → Sees conformance checks pass ✓ 
→ Processes first test transaction → Sees decision + citation → Understands why allowed
```
**Time to value:** 5 minutes  
**Friction:** Zero (pre-filled defaults, auto-conformance check)  
**Success:** Feels confident system protects her compliance

#### Journey 2: Daily Operations (Ongoing)
```
Customer initiates payment → Priya sees transaction in dashboard → 
Payment decision shows (allowed/refused) → If refused, Priya sees regulatory reason → 
Clicks "View Rule" to understand what she needs to change
```
**Friction Point:** Priya must understand refusal codes without support  
**Solution:** Plain-language explanation + regulatory citation + suggested fix

#### Journey 3: Debugging Failure (Reactive)
```
Priya: "Payment failed, why?" → Clicks "Details" → Sees full decision path → 
Sees conformance check results → Sees applicable rule → Sees regulatory quote
→ Understands: "Ah, my block validity is 90 days, rule says max 90, it expired"
```
**Time to resolution:** <2 minutes  
**Success:** Priya fixes problem herself (doesn't contact support)

#### Journey 4: Compliance Review (Quarterly)
```
Priya navigates to /constraints → Reviews all declared terms vs regulatory authority → 
All show PASS ✓ with green badges → Clicks "Download Report" → Exports audit-ready PDF → 
Sends to accountant for tax filing
```
**Success:** Priya has proof of compliance for regulatory audit

---

## 4. Information Architecture

### Complete Sitemap

```
Dashboard
├── Overview (compliance status, recent transactions, alerts, quick actions)
├── Quick Stats (total, passed, refused, undetermined)
├── Recent Transactions Feed
├── Alerts & Notifications
└── Quick Action Cards (upload terms, view checks, process payment)

Compliance Hub
├── Compliance Status (overall PASS/FAIL, last verified)
├── Constraint Comparison (declared vs regulatory, side-by-side)
├── Conformance Verdicts (each rule, PASS/FAIL, regulatory citation)
├── Regulatory Documents (NPCI/RBI circulars, SHA-256, last updated)
├── Upload & Manage Terms (document upload, extraction results, version history)
└── Generate Compliance Reports

Transactions & Payments
├── Transaction List (filtered: all, approved, blocked, pending; sortable, paginated)
├── Transaction Detail (full decision path, conformance checks, ledger entry, download evidence)
├── Payment Block Management (active blocks, remaining balance, retry budget, expiry countdown)
├── Payment Appeals (if blocked, appeal form and history)
└── Financial Ledger (daily/monthly, settlements, chargebacks)

Audit & Compliance Records
├── Audit Trail (all system events, timestamps, user actions, filters)
├── Audit Event Details (what changed, who, when, affected entities)
├── Compliance Timeline (status changes, check dates, remediation completion)
└── Export & Reports (audit logs, compliance certifications)

Settings & Administration
├── Merchant Profile (business info, UPI ID, contact details, tier)
├── User Management (team members, roles, access logs)
├── Webhook Configuration (callbacks, test, logs)
├── Demo Mode (toggle, sample transactions, reset)
├── Integration Settings (API keys, logs, connected systems)
└── Notification Preferences (alerts, email, webhooks)
```

### Navigation Structure

**Desktop:**
- Top horizontal nav: Logo | Dashboard | Compliance | Transactions | Audit | Settings | User Menu | Notifications
- Left sidebar (context-aware): Subsections for current section (e.g., constraints, verdicts when in Compliance)
- Breadcrumb trail: Root → Section → Detail

**Mobile:**
- Bottom tab nav: Dashboard | Compliance | Transactions | Audit | More
- Top header: Back button | Page title | Search/Filter icon
- Context drawer: Triggered by section-specific filters

### URL Structure
```
/                                    → Dashboard
/compliance                          → Compliance hub
/compliance/constraints              → Constraints comparison
/compliance/constraints/:id           → Constraint detail + edit
/compliance/verdicts                 → Conformance verdicts
/compliance/verdicts/:id             → Verdict detail with citations
/compliance/documents                → Regulatory documents library
/compliance/upload                   → Upload terms
/compliance/reports                  → Generate reports

/transactions                        → Transaction list
/transactions/:id                    → Transaction detail + decision
/transactions/:id/block-details      → Block reason + appeal (if blocked)
/transactions/:id/audit              → Audit trail for transaction

/payments/blocks                     → Active payment blocks
/payments/blocks/:id                 → Block detail + remediation
/payments/appeals                    → Submitted appeals
/payments/ledger                     → Financial ledger

/audit                               → Audit trail (main view)
/audit/:event-id                     → Event detail
/audit/search                        → Advanced search
/audit/export                        → Export logs

/settings                            → Settings hub
/settings/profile                    → Merchant profile
/settings/users                      → User management
/settings/webhooks                   → Webhook configuration
/settings/integrations               → API & integrations
/settings/notifications              → Alert preferences

/demo                                → Demo mode
/demo/scenarios                      → Example scenarios
/help                                → Help & FAQs
```

---

## 5. Component System (38 Components)

### Atomic Components (11)
- Button (Primary/Secondary/Danger/Ghost/Loading/Icon)
- FormInput (Text/Email/Password/Number/Search/Textarea)
- Badge (Status/Tag/Count/Pill/Dismissible)
- Icon (16px/24px/32px/48px)
- StatusIndicator (Allowed/Refused/Undetermined/Pending)
- Typography (Heading/Paragraph/Label/Hint)
- Checkbox, RadioButton, ToggleSwitch, Select, Spinner

### Molecular Components (13)
- FormGroup (label + input + error + helper text)
- Card (Standard/Metric/Action/Status/Featured)
- Table (sortable, pagination, row actions)
- Chip/Tag (dismissible/selectable)
- Alert/Toast (Success/Error/Warning/Info)
- ProgressIndicator (Bar/Ring/Stepper)
- Tooltip, Pagination, SearchInput, Modal, DropdownMenu, Timeline, Breadcrumb

### Organism Components (10)
- Header (logo, nav, user menu, theme toggle)
- Sidebar (collapsible, nested nav)
- TransactionTable (sortable, filterable, expandable, inline actions)
- MetricsDashboard (4-column grid, responsive, skeleton)
- ComplianceChart (Pie/Bar/Gauge)
- TimelineView (audit trail)
- PaymentFlowDiagram (stages, status coloring)
- DashboardLayout (header + sidebar + content)
- FormWizard (multi-step)
- DataVisualization (charts with accessibility)

### Design Tokens

**Colors:**
```
Primary: #0052CC (blue)
Success: #10B981 (green) 
Danger: #EF4444 (red)
Warning: #F59E0B (orange)
Info: #3B82F6 (blue)
Neutral: #94A3B8 → #0F172A (light → dark)
Dark Mode: Inverted backgrounds, increased shadow opacity
```

**Typography:**
```
Display 1: 36px Bold / Display 2: 30px Bold
Heading 1: 24px Semibold / Heading 2: 20px Semibold / Heading 3: 18px Semibold
Body Large: 16px Regular / Body: 14px Regular / Body Small: 12px Regular
Code: 14px Monospace
Label: 12px Medium Uppercase
```

**Spacing Scale:**
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px
(applies to margin, padding, gap consistently)
```

**Shadows:**
```
Flat: No shadow
Subtle: 0 1px 2px rgba(0,0,0,0.05)
Raised: 0 4px 6px rgba(0,0,0,0.1)
Floating: 0 20px 25px rgba(0,0,0,0.1)
Deep: 0 25px 50px rgba(0,0,0,0.25)
(Dark mode uses 0.5 opacity)
```

---

## 6. Technology Stack (Production-Ready)

### State Management
- **TanStack Query v5** — Server state (transactions, constraints, ledger, conformance)
  - 30s TTL for transactions, 5min for ledger, 24h for settings
  - Background refetching, automatic deduplication
  - Offline queue, pessimistic/optimistic updates
- **Zustand + Immer** — Client state (filters, modals, pagination)
  - Lightweight (2KB), excellent TypeScript, built-in persistence
  - Devtools for debugging

### Data Fetching
- **TanStack Query v5** with caching strategies:
  - Stale-While-Revalidate: Catalog, constraints
  - Write-Through: Payments, term amendments
  - Polling + Event-Driven: Transaction list (5min TTL, 30s poll)
  - Network-First: Real-time decisions (no cache)
- **Axios** with request/response interceptors (auth, retry logic)
- **OpenAPI code generation** (orval) for auto-generated type-safe API clients

### Form Handling
- **React Hook Form** — Minimal re-renders, dependency watching, Controller pattern
- **Zod** — TypeScript-first validation with coercion (e.g., decimal precision for amounts)
- **Custom validators** for domain-specific rules (amount within block, valid dates)

### UI Components
- **shadcn/ui** (Radix UI + Tailwind) — Copy-paste accessible components
  - Table, Form, Dialog, Dropdown, Sheet (mobile sidebar)
  - WCAG 2.1 AA compliant, dark mode built-in
- **Custom financial components** — TransactionRow, AmountDisplay, LedgerTable, ConformanceStatus

### Styling
- **Tailwind CSS 4** — Utility-first, no CSS files needed
- **CSS Variables** — Theme switching (dark mode), token consistency
- **CSS Modules** (optional) — Component-scoped styles if needed
- **Dark mode:** `@media (prefers-color-scheme: dark)` + Tailwind `dark:` prefix

### Testing
- **Vitest** — Unit/integration tests (fast, ESM-native)
- **React Testing Library** — Test user behavior, not implementation
- **Playwright** — E2E testing (critical flows, multi-browser)
- **MSW** — Mock Service Worker (predictable test data)
- **axe** — Automated accessibility testing

### Monitoring
- **Sentry** — Error capture, session replay, performance RUM
- **Pino** — Structured JSON logging (audit trail friendly)
- **Web Vitals tracking** — LCP, FID, CLS per page
- **Custom metrics** — Transaction latency by operation type

### DevTools
- **Storybook 8** — Component documentation + visual regression
- **Next.js 16** with Vercel — Build optimization, edge functions
- **GitHub Actions** — CI/CD (tests, linting, bundle analysis)
- **TypeScript strict mode** — Compile-time safety
- **Figma** — Design system with token sync

---

## 7. Implementation Roadmap (8 Weeks)

### Phase 0: MVP (1.5 weeks) — Payment Transparency
**Goal:** Merchant can pay and understand decision

#### Features
- Payment form (amount, block settings, validation)
- Decision display card (ALLOWED/REFUSED/UNDETERMINED + regulatory cite)
- Transaction detail page (decision + conformance + ledger)
- 5 demo scenarios (happy path, refusal, undetermined, retry, expiry)
- Error handling (clear messages, retry buttons)

#### Components
- PaymentForm, DecisionCard, PaymentBlockDisplay, TransactionDetail
- ConformanceSection, LedgerEntryDisplay, LoadingStates, ErrorCard

#### Success Criteria
- Merchant creates payment in <2 min
- All 3 decision states display with regulatory citations
- Mobile responsive (375px, 768px, 1200px)
- 95%+ test coverage of payment paths
- WCAG ready (semantic HTML, ARIA labels)

### Phase 1: Core Compliance (2.5 weeks) — Rules & Constraints
**Goal:** Merchant understands rules before payment

#### Features
- Constraints page (declared vs authoritative, side-by-side)
- Rules detail (full text, regulatory metadata, examples)
- Conformance check results (overall + rule-by-rule)
- Enhanced payment form (show applicable rules before submit)
- Rule linking (clickable references in decision displays)

#### Components
- ConstraintsList, ConstraintRow, RuleDetailPage, ConformanceResultsPage
- RuleLinker, ConfidenceIndicator, SourceBadge, RuleExamples

### Phase 2: Audit & Analytics (2.5 weeks) — Deep Visibility
**Goal:** Merchant can verify integrity and analyze trends

#### Features
- Ledger page (audit trail, verification status, hash validation, tamper detection)
- Transaction history (paginated, filterable, sortable)
- Analytics dashboard (approval rate timeline, failure reasons pie, retry success bar)
- Export functionality (JSON, CSV)
- Advanced filtering (multi-field, date ranges)

#### Components
- TransactionHistory, LedgerTimeline, AnalyticsDashboard, FilterBar, ExportModal

### Phase 3: Polish (1.5 weeks) — Production Grade
**Goal:** Ship-ready product

#### Features
- Animations & transitions (200-300ms smooth state changes)
- Performance optimization (code splitting, image optimization, caching)
- Keyboard shortcuts (Cmd+K search, vim navigation)
- WCAG 2.1 AA audit (screen reader, keyboard-only)
- Help & documentation (in-app tips, FAQ, videos)
- Error recovery (retry logic, offline indicators)

#### Effort: 8 weeks | Team: 4-5 developers | Cost: 160-200 person-days

#### Parallel Work Streams
```
Stream 1: Payment Flow (2 devs)
  → Payment form + Decision card + Processing page

Stream 2: Rules & Constraints (1.5 devs)
  → Rules detail + Constraints list + Conformance display

Stream 3: Audit & Analytics (1.5 devs)
  → Ledger + Transaction history + Analytics dashboard

Stream 4: Testing & QA (shared across streams)
  → Unit tests, integration tests, accessibility audit, E2E

Stream 5: Demo Mode (0.5 dev)
  → Scenario loader, preloaded data, reset mechanism

All streams execute in parallel with 2x daily syncs
```

---

## 8. Visual Design Language

### Color Palette

| Intent | Light | Dark | Usage |
|--------|-------|------|-------|
| Primary | #0052CC | #3B82F6 | Buttons, links, focus ring |
| Success | #10B981 | #10B981 | ALLOWED status, pass badge |
| Danger | #EF4444 | #EF4444 | REFUSED status, errors |
| Warning | #F59E0B | #F59E0B | UNDETERMINED, warnings |
| Neutral | #94A3B8 → #0F172A | #94A3B8 → #F1F5F9 | Text, borders, backgrounds |

### Typography System
- Font: Geist (sans-serif), Geist Mono (code)
- Display: 36px Bold (h1), 30px Bold (h2)
- Heading: 24px Semibold (h3), 20px Semibold (h4), 18px Semibold (h5)
- Body: 16px Regular (large), 14px Regular (default), 12px Regular (small)
- Code: 14px Monospace
- Label: 12px Medium Uppercase

### Component Styles

**Buttons:**
- Primary: Solid color, 2px border radius, 12px padding, white text
- Secondary: Border only, transparent background
- Danger: Red background, white text (for destructive)
- Ghost: Text only, no background (for secondary actions)
- All: 150ms transition on hover/focus, visible 3px focus ring

**Cards:**
- Background: white (light) / #1E293B (dark)
- Border: 1px #E2E8F0 (light) / #475569 (dark)
- Radius: 6px
- Shadow: Raised (0 4px 6px)
- Padding: 24px (standard), 16px (compact)

**Status Badges:**
- Allowed: Green bg, green text, checkmark icon ✓
- Refused: Red bg, red text, X icon ✗
- Undetermined: Orange bg, orange text, ? icon

### Responsive Breakpoints
```
Mobile: 375px (1 column, 14px font, 12px gutters)
Tablet: 640px (2 columns, 14px font, 16px gutters)
Desktop: 1024px (3-4 columns, 16px font, 24px gutters)
Large: 1280px (4+ columns, 18px font, 32px gutters)
```

**Mobile-First Stacking Rules:**
- Grids: 1 col → 2 col → 3-4 col
- Tables: Card view → Horizontal scroll → Full table
- Nav: Hamburger → Collapse → Full horizontal
- Modals: Full-screen → 80vw → 500px
- Touch targets: 44x44px minimum, 8px spacing

---

## 9. Feature Specifications

### Feature 1: Payment Authorization Flow

**User Initiates Payment**
1. Fills amount, selects payment block
2. System shows applicable rules (preview)
3. User clicks "Proceed to Payment"

**Decision Processing**
1. Frontend calls `complete_checkout(checkout_id, idem_key)`
2. Backend evaluates 6 checks: cap ≤ ₹10k, validity ≤ 90d, balance sufficient, retries ≤ 3/24h, one block per merchant/customer, idempotency key unused
3. Returns: `{allowed: true/false, code, clause, circular, quote, detail, decision_id}`

**Decision Display**
- ALLOWED: Green card with receipt, next steps
- REFUSED: Red card with plain-language reason + regulatory clause + quote
- UNDETERMINED: Orange card with explanation + contact support

**Ledger Entry Created**
- Sequence number, hash, decision code, timestamp, regulatory clause reference

**Error Handling**
- Network timeout: "Payment processing, please wait" + manual retry
- Razorpay error: Classify (timeout vs decline) + show in refusal with clause cite
- Ledger append fails: "Approved but unrecorded" warning + support link

**Components:**
- PaymentForm (amount input, block selector, validation)
- DecisionCard (result display with cite)
- PaymentBlockDisplay (max, remaining, validity)
- ProcessingOverlay (spinner + status text)
- SuccessModal (receipt + next actions)
- RefusalCard (reason + rule + quote + suggestions)

---

### Feature 2: Constraints Comparison View

**User Navigates to /constraints**
1. Displays compliance summary: "X of Y constraints conformant"
2. Shows constraint cards arranged vertically

**For Each Constraint**
1. Subject (e.g., "Block Limit"), Declared value, Authoritative value
2. Conformance badge: ✓ PASS, ✗ FAIL, ? UNDETERMINED
3. Regulatory source: "NPCI/UPI/OC No.228 Issuer §5"
4. Direct quote: "The block created to be maximum of Rs.10,000..."
5. Confidence level: 0-100% (for extracted constraints)

**Expandable Details**
- Full comparison data
- Remediation guidance for failed constraints
- Source verification badge

**Export**
- "Download Report" → PDF with all details and citations

**Components:**
- ConstraintCard (declared vs authoritative side-by-side)
- ConformanceVerdict (PASS/FAIL/UNDETERMINED badge with color)
- RegulatoryQuote (highlighted quote + source)
- SourceBadge (circular name + clause + verification status)
- ConfidenceScore (percentage with tooltip)

---

### Feature 3: Audit Ledger & Verification

**User Navigates to /ledger**
1. Summary: Total entries, date range, last verification time
2. Entries in reverse chronological order (newest first)
3. Each entry: Sequence, timestamp, type, amount, result badge

**Per Entry**
1. Expandable to see full payload, hash, previous hash
2. Verification status: ✓ Verified, ⚠ Invalid, ⏳ Pending
3. Hash chain visualization (shows relationship to previous)

**Full Ledger Verification**
1. Check all hashes, detect tampering
2. Display verification result: "No tampering detected" or alert with details
3. Show HEAD anchor (commits to total length + tip hash)

**Filtering**
- By status (ALLOWED/REFUSED/etc), date range, merchant ID, transaction type

**Export**
- Download full ledger as JSONL for external audit
- Include SHA-256 hashes and verification status

**Error Cases**
- Hash mismatch: "Ledger Tamper Detected" alert with entry details
- HEAD anchor mismatch: Show discrepancy clearly
- Missing entries: "Gap detected: sequence jumps from N to N+2"

**Components:**
- LedgerEntryCard (expandable, shows hash chain)
- VerificationStatus (badge, timestamp)
- HashChainViz (visual relationship)
- TamperAlert (prominent if detected)
- ExportModal (format selector, progress)

---

### Feature 4: Error Handling & Resilience

**Network Errors**
- Timeout (>30s): "Payment processing. This may take a minute." + manual retry
- Connection error: "Network error. Retrying..." with exponential backoff
- Failed after 3 retries: Show error with "Contact support" link

**API Errors**
- 400 Bad Request: "Invalid input. Please check form." + field highlights
- 401/403: "Session expired. Please log in again." + redirect
- 404 Not Found: "Resource not found. Please refresh page."
- 429 Rate Limit: "Too many requests. Please wait a moment."
- 5xx Server Error: "Server error. Please try again in a moment." + retry button

**Conformance Errors**
- Verdict contradicts expectations: "Conformance check inconclusive. Manual review required."
- Circular updated after decision: "Conformance re-verified (results changed)" banner

**Ledger Errors**
- Append fails after capture: "Transaction approved but ledger entry pending. Do not retry payment."
- File corrupted: "Ledger unreadable. Please contact support immediately."

**UI Patterns**
- Error boundary catches crashes: "Something went wrong. Please refresh."
- Fallback UI with manual recovery options
- Toast notifications for transient errors
- Modal dialogs for critical errors

---

## 10. Success Criteria & Metrics

### Completion Metrics
- [ ] 100% of features shipped per phase
- [ ] <2s LCP on transaction list (p95)
- [ ] <100ms p99 API response time
- [ ] 0 critical bugs in production
- [ ] >95% test coverage of payment paths

### Quality Standards
- [ ] WCAG 2.1 AA compliance (automated + manual audit)
- [ ] Lighthouse score >90 (performance + accessibility + best practices)
- [ ] TypeScript strict mode, no 'any' types
- [ ] Zero console errors/warnings in production

### User Satisfaction
- [ ] >50 NPS (Net Promoter Score) for compliance clarity
- [ ] >80% merchant adoption of Phase 0 features within 2 weeks
- [ ] <5 support tickets per 1000 merchants about basic flow
- [ ] <1% payment failure rate due to merchant misconfiguration

### Business Metrics
- [ ] Payment success rate >99%
- [ ] Ledger verification always valid (0 tampering detected)
- [ ] 0 unplanned downtime during staged rollout
- [ ] Mobile adoption >40% of DAU

---

## 11. Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| API latency >100ms | Medium | Payment UX delayed, confusion | TanStack Query caching + prefetch, backend optimization |
| Ledger bugs cause hash mismatch | Low | Loss of audit trust | Hash verification tests, tamper detection in CI, manual audit pre-launch |
| Regulatory rule changes mid-development | Low | Feature becomes invalid | Weekly circular check automation, version control for rules, legal review gate |
| Mobile UX friction | Medium | <40% adoption | Usability testing each phase, bottom-tab nav, 44x44px touch targets |
| Circular dependency in state updates | Low | UI becomes slow | Zustand architecture with computed selectors, performance monitoring |
| Compliance liability for wrong citation | Low | Regulatory penalty | Legal review of all regulatory text, cite-to-source verification, audit trail |
| Staged rollout fails | Low | Unplanned rollback, user churn | Monitoring alerts, kill switches per feature, canary deployment, instant rollback |
| Bundle size explosion | Medium | Slow load on slow networks | Code splitting per route, tree-shaking, bundle analyzer, 50KB budget |

---

## 12. Go-Live Strategy

### Pre-Production Checklist
- [ ] Load test: 100 concurrent users
- [ ] Security audit: OWASP top 10, XSS, CSRF, injection
- [ ] Accessibility audit: WCAG 2.1 AA, screen reader testing
- [ ] Mobile testing: iOS/Android, 375px-1440px screens
- [ ] Browser testing: Chrome, Firefox, Safari, Edge
- [ ] Dark mode verification: All pages
- [ ] Error scenario testing: Network down, API timeouts, payment failures
- [ ] Ledger verification validation: Hash chain, tamper detection

### Staged Rollout (4 Weeks Total)
```
Week 1: Internal Testing
  - Team only
  - All features enabled
  - Full logs + monitoring

Week 2: Beta Merchants (5-10)
  - Trusted customers
  - Phase 0 only
  - Daily check-ins

Week 3: Early Access (50+ merchants)
  - Limited availability
  - Phase 0 + Phase 1
  - Monitoring dashboards live

Week 4: General Availability
  - Unrestricted access
  - All phases
  - Standard support
```

### Monitoring & Alerting
```
Critical Metrics:
  - Page load LCP <2.5s (p95) — alert if >3s
  - API error rate <0.5% — alert if >1%
  - Payment success rate >99% — alert if <98%
  - 500 errors <1 per day — alert if >5/day
  - Ledger verification always valid — alert on any failure
```

### Rollback Plan
- Feature flags: Toggle Phase 3 → Phase 2 → Phase 1 → Phase 0
- CDN cache invalidation: Max 5 minutes
- Git revert to previous tag: <1 minute rollback
- Merchant notification: Within 5 minutes if degraded
- Database: No changes (frontend-only), zero risk

---

## 13. Team & Effort Estimates

### Skills Required
- Frontend Engineers (3-4): React, TypeScript, Next.js, Tailwind, API integration
- QA Engineer (1): Vitest, Playwright, accessibility testing
- Product Manager (1): Roadmap, merchant feedback, go-live coordination
- UX/Design Review (optional): Design tokens, component review

### Effort Breakdown
| Phase | Components | Effort (person-weeks) |
|-------|-----------|----------------------|
| Phase 0 | Payment flow + Decision | 6-7 |
| Phase 1 | Constraints + Rules | 5-6 |
| Phase 2 | Ledger + Analytics | 5-6 |
| Phase 3 | Polish + Optimization | 3 |
| **Total** | **38 components** | **19-22** |

### Parallel Execution
- 4-5 developers across 5 work streams
- 2x daily syncs to prevent conflicts
- 8 weeks wall-clock time, 160-200 person-days

---

## Conclusion

This plan transforms a prototype into a production-grade compliance dashboard. The 8-week timeline, phased delivery, and parallel work streams enable shipping working product every 2 weeks while maintaining quality standards.

**Key Success Factors:**
1. Backend APIs are production-ready ✅
2. Team is full-stack capable ✅
3. Requirements are clear and measurable ✅
4. Architecture enables parallel work ✅
5. Monitoring strategy is comprehensive ✅

**Next Steps:**
1. Approve this plan
2. Assign team members to work streams
3. Set up development environment (Storybook, tests, monitoring)
4. Begin Phase 0 implementation
5. Ship MVP in 1.5 weeks

---

**Document Generated By:** Multi-Agent Research Swarm (11 agents)  
**Research Agents:** Product UX | Information Architecture | Data Flow | Component System | Feature Flows  
**Design Agents:** IA Design | Component Architecture | Tech Stack | Roadmap | Visual Design  
**Synthesis Agent:** Comprehensive Plan Compilation  
