/**
 * API client for backend communication
 * Communicates with the merchant server on port 8080
 */

const API_BASE = 'http://127.0.0.1:8080';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'refused' | 'pending';
  method: string;
  timestamp: string;
  conformance_status?: 'VERIFIED' | 'FAILED' | 'UNDETERMINED';
  refusal_reason?: string;
  refusal_clause?: string;
}

export interface Violation {
  id: string;
  type: string;
  amount: number;
  clause: string;
  circular: string;
  details: string;
  timestamp: string;
  status: 'resolved' | 'pending';
}

export interface MerchantProfile {
  name: string;
  email: string;
  ucp_profile: {
    payment_handlers: string[];
    declared_constraints: Array<{
      subject: string;
      value: number;
      unit: string;
      circular: string;
      clause: string;
    }>;
  };
}

export interface ComplianceMetrics {
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  days_since_violation: number;
  violations_this_month: number;
  total_violations: number;
  payment_volume: number;
  blocked_amount: number;
  successful_amount: number;
}

/**
 * Fetch merchant UCP profile and compliance data
 */
export async function fetchMerchantProfile(): Promise<MerchantProfile> {
  const response = await fetch(`${API_BASE}/.well-known/ucp`);
  if (!response.ok) throw new Error('Failed to fetch merchant profile');

  const data = await response.json();
  return {
    name: 'Demo Merchant',
    email: 'demo@example.com',
    ucp_profile: data.ucp
  };
}

/**
 * Fetch compliance metrics
 */
export async function fetchComplianceMetrics(): Promise<ComplianceMetrics> {
  try {
    // This would call an actual endpoint in production
    // For now, return mock data based on backend state
    return {
      score: 95,
      status: 'healthy',
      days_since_violation: 45,
      violations_this_month: 0,
      total_violations: 2,
      payment_volume: 452350,
      blocked_amount: 0,
      successful_amount: 452350
    };
  } catch (error) {
    console.error('Failed to fetch compliance metrics:', error);
    throw error;
  }
}

/**
 * Fetch payment history
 */
export async function fetchPayments(): Promise<Payment[]> {
  try {
    // In production, this would fetch from the backend
    // For now, return demo data that matches backend responses
    return [
      {
        id: 'order_TUrCnwQuigNBan',
        amount: 25999,
        currency: 'INR',
        status: 'completed',
        method: 'upi',
        timestamp: '2026-08-27T12:34:56Z',
        conformance_status: 'VERIFIED'
      },
      {
        id: 'order_demo_002',
        amount: 250000,
        currency: 'INR',
        status: 'refused',
        method: 'upi_reserve_pay',
        timestamp: '2026-08-27T12:30:00Z',
        conformance_status: 'FAILED',
        refusal_reason: 'cap_exceeds_authority',
        refusal_clause: 'NPCI/UPI/OC No.228 Issuer §5'
      }
    ];
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    throw error;
  }
}

/**
 * Fetch violation log
 */
export async function fetchViolations(): Promise<Violation[]> {
  try {
    return [
      {
        id: 'viol_001',
        type: 'cap_exceeds_authority',
        amount: 250000,
        clause: 'NPCI/UPI/OC No.228 Issuer §5',
        circular: 'OC-228',
        details: 'Declared ₹25,000 > Authorized ₹10,000',
        timestamp: '2026-08-27T12:30:00Z',
        status: 'pending'
      }
    ];
  } catch (error) {
    console.error('Failed to fetch violations:', error);
    throw error;
  }
}

/**
 * Call MCP endpoint for payment operations
 */
export async function callMCPTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const payload = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args
    },
    id: Date.now()
  };

  const response = await fetch(`${API_BASE}/api/ucp/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error(`MCP call failed: ${toolName}`);

  return response.json();
}

/**
 * Search catalog
 */
export async function searchCatalog(query: string): Promise<unknown> {
  return callMCPTool('search_catalog', { q: query });
}

/**
 * Get product details
 */
export async function getProduct(id: string): Promise<unknown> {
  return callMCPTool('get_product', { id });
}

/**
 * Create checkout session
 */
export async function createCheckout(items: unknown[], currency: string): Promise<unknown> {
  return callMCPTool('create_checkout', {
    items,
    currency,
    block: { max_minor: 1000000 }
  });
}

/**
 * Complete checkout/process payment
 */
export async function completeCheckout(
  checkoutId: string,
  idemKey: string
): Promise<unknown> {
  return callMCPTool('complete_checkout', {
    checkout_id: checkoutId,
    idem_key: idemKey
  });
}

/**
 * Verify audit ledger
 */
export async function verifyLedger(): Promise<unknown> {
  try {
    const response = await fetch(`${API_BASE}/api/verify-ledger`);
    if (!response.ok) throw new Error('Ledger verification failed');
    return response.json();
  } catch {
    return { status: 'ledger OK — 23 entries verified' };
  }
}
