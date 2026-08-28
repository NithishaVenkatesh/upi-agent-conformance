/**
 * TypeScript types mirroring backend models
 * Derived from backend contracts and data structures
 */

// Checkout
export interface CheckoutItem {
  id: string;
  qty: number;
}

export interface Checkout {
  id: string;
  items: CheckoutItem[];
  currency: string;
  total_minor: number;
  status: "ready_for_payment" | "completed";
  order_id?: string;
}

// Payment Block (Reservation)
export interface PaymentBlock {
  max_minor: number;
  remaining_minor: number;
  created_ts: number;
  expires_ts: number;
  merchant_id: string;
  customer_id: string;
  retries_24h: number;
  used_idem_keys: string[];
  observed_failures: Record<string, FailureRecord>;
  debits: number;
  concurrent_blocks_same_merchant: number;
}

export interface FailureRecord {
  retryable: boolean;
  clause: string;
  circular: string;
  clause_quote: string;
}

// Extracted Constraint
export interface ExtractedConstraint {
  subject: string;
  value: number | boolean | null;
  unit: string;
  scope: string;
  source: string;
  confidence: number;
}

// Authoritative Claim
export interface AuthoritativeClaim {
  id: string;
  doc_sha256: string;
  circular: string;
  clause: string;
  value: number | boolean;
  value_minor?: number;
  unit: string;
  scope: string;
  subject: string;
  status: "RESOLVED" | "UNRESOLVED";
  quote: string;
}

// Conformance Verdict
export type ConformanceResult = "PASS" | "FAIL" | "UNDETERMINED";

export interface ConformanceVerdict {
  result: ConformanceResult;
  code: string;
  detail: string;
  circular: string;
  clause: string;
  quote: string;
  source: string;
}

// Gate Decision
export interface GateDecision {
  allowed: boolean;
  code: string;
  clause: string;
  quote: string;
  circular: string;
  detail: string;
}

// Ledger Entry
export interface LedgerPayload {
  event: "authorise" | "captured" | "capture_failed" | "replay";
  checkout: string;
  decision?: string;
  clause?: string;
  circular?: string;
  is_retry?: boolean;
  idem_key?: string;
  order_id?: string;
  kind?: string;
  retryable?: boolean;
  detail?: string;
}

export interface LedgerEntry {
  seq: number;
  prev_hash: string;
  payload: LedgerPayload;
  hash: string;
}

// Transaction (UI model combining checkout + decision)
export interface Transaction {
  id: string;
  timestamp: number;
  checkout: Checkout;
  block: PaymentBlock;
  amount_minor: number;
  status: "ALLOWED" | "REFUSED" | "UNDETERMINED" | "PENDING" | "CAPTURE_FAILED";
  decision?: GateDecision;
  conformanceVerdict?: ConformanceVerdict;
  ledgerEntry?: LedgerEntry;
  error?: {
    code: string;
    clause?: string;
    circular?: string;
    quote?: string;
    detail: string;
  };
}

// API Responses
export interface MCPToolsResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: Record<string, any>;
  error?: Record<string, any>;
}

// Conformance Check Response
export interface ConformanceCheckResponse {
  constraints: Array<{
    subject: string;
    declared: ExtractedConstraint;
    authoritative: AuthoritativeClaim;
    verdict: ConformanceVerdict;
  }>;
  overall: ConformanceResult;
}

// Ledger Verification
export interface LedgerVerificationResult {
  state: "VERIFIED" | "EMPTY" | "BROKEN";
  message: string;
  entry_count?: number;
  forward_walk_valid?: boolean;
  backward_walk_valid?: boolean;
  genesis_valid?: boolean;
}

// Demo Scenario
export interface DemoScenario {
  name: string;
  description: string;
  transactions: Transaction[];
  ledgerEntries: LedgerEntry[];
}
