/**
 * Application constants, colors, status mappings
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Status colors
export const STATUS_COLORS = {
  ALLOWED: "#10b981", // green
  REFUSED: "#ef4444", // red
  UNDETERMINED: "#f97316", // orange
  PENDING: "#3b82f6", // blue
  CAPTURE_FAILED: "#f97316", // orange
} as const;

export const STATUS_TEXT = {
  ALLOWED: "✓ ALLOWED",
  REFUSED: "✗ REFUSED",
  UNDETERMINED: "? UNDETERMINED",
  PENDING: "⧗ PENDING",
  CAPTURE_FAILED: "⚠ CAPTURE FAILED",
} as const;

// Conformance result colors
export const CONFORMANCE_COLORS = {
  PASS: "#10b981",
  FAIL: "#ef4444",
  UNDETERMINED: "#f97316",
} as const;

// Gate decision codes
export const GATE_DECISION_CODES = {
  authorised: "Payment authorized",
  cap_exceeds_authority: "Cap exceeds regulatory authority",
  insufficient_block_balance: "Insufficient block balance",
  validity_exceeds_authority: "Validity exceeds regulatory authority",
  block_expired: "Payment block has expired",
  duplicate_block_for_merchant: "Duplicate block for merchant",
  retry_not_permitted: "Retry not permitted for non-timeout decline",
  retry_budget_exhausted: "Retry budget exhausted",
  idempotency_replay: "Idempotent replay - original response returned",
  counterparty_not_conformant: "Counterparty not conformant with rules",
  capture_failed: "Payment capture failed",
} as const;

// Conformance codes
export const CONFORMANCE_CODES = {
  conformant: "Constraint matches regulatory authority",
  value_exceeds_authority: "Declared value exceeds authoritative limit",
  scope_mismatch: "Declared scope does not match authority",
  omitted: "Required constraint not declared",
  predicate_contradiction: "Predicate contradicts authority",
  low_confidence: "Extraction confidence too low",
  no_authority_found: "No authoritative claim found",
  unit_mismatch: "Unit mismatch between declared and authority",
} as const;

// Regulatory circulars
export const CIRCULARS = {
  "NPCI/UPI/OC No.228": {
    title: "NPCI UPI Circular OC-228",
    url: "https://www.npci.org.in",
  },
  "NPCI/UPI/OC No.201": {
    title: "NPCI UPI Circular OC-201",
    url: "https://www.npci.org.in",
  },
  "RBI E-Mandate Master Direction": {
    title: "RBI E-Mandate Master Direction",
    url: "https://www.rbi.org.in",
  },
} as const;

// Pagination
export const ITEMS_PER_PAGE = 25;
export const LEDGER_VIRTUALIZATION_HEIGHT = 600;

// Timeouts
export const API_TIMEOUT_MS = 30000;
export const DEMO_DELAY_MS = 500; // Simulate processing delay

// Breakpoints
export const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1200,
} as const;

// Ledger states
export const LEDGER_STATES = {
  VERIFIED: "VERIFIED",
  EMPTY: "EMPTY",
  BROKEN: "BROKEN",
} as const;

// Demo catalog products
export const DEMO_CATALOG = {
  sku1: { name: "Cotton tote", price_minor: 249900 },
  sku2: { name: "Canvas backpack", price_minor: 389900 },
  sku3: { name: "Laptop sleeve", price_minor: 149900 },
} as const;
