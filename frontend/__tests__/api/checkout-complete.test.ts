import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Unit tests for /api/checkout/complete route
 * Tests the payment processing flow through the compliance gate
 */

global.fetch = vi.fn();

describe('POST /api/checkout/complete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    delete process.env.MERCHANT_URL;
  });

  describe('Input Validation', () => {
    it('should reject request with missing checkout_id', async () => {
      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          idem_key: 'payment_123',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing checkout_id or idem_key');
    });

    it('should reject request with missing idem_key', async () => {
      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          checkout_id: 'chk_123',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing checkout_id or idem_key');
    });

    it('should reject malformed JSON', async () => {
      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: 'malformed',
      });

      const response = await POST(request as any);
      expect(response.status).toBe(500);
    });
  });

  describe('Backend Communication', () => {
    it('should call backend with correct JSON-RPC format', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: {
            id: 'chk_123',
            status: 'completed',
            order_id: 'ord_789',
          },
        }),
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          checkout_id: 'chk_123',
          idem_key: 'payment_456',
        }),
        headers: { 'origin': 'http://localhost:3000' },
      });

      await POST(request as any);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody).toEqual({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'complete_checkout',
          arguments: {
            checkout_id: 'chk_123',
            idem_key: 'payment_456',
          },
        },
        id: 1,
      });
    });

    it('should forward Origin header to backend', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: { id: 'chk_123', status: 'completed' } }),
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          checkout_id: 'chk_123',
          idem_key: 'payment_456',
        }),
        headers: { 'origin': 'https://app.vercel.app' },
      });

      await POST(request as any);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].headers.Origin).toBe('https://app.vercel.app');
    });
  });

  describe('Success Path - Payment Allowed', () => {
    it('should return success when gate allows payment', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: {
            id: 'chk_123',
            status: 'completed',
            order_id: 'ord_abc',
          },
        }),
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          checkout_id: 'chk_123',
          idem_key: 'payment_456',
        }),
        headers: { 'origin': 'http://localhost:3000' },
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.checkout.id).toBe('chk_123');
      expect(data.checkout.status).toBe('completed');
      expect(data.checkout.order_id).toBe('ord_abc');
      expect(data.orderId).toBe('ord_abc');
      expect(data.decision.allowed).toBe(true);
      expect(data.decision.code).toBe('authorised');
    });

    it('should include decision details on allowed payment', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: {
            id: 'chk_123',
            status: 'completed',
            order_id: 'ord_xyz',
          },
        }),
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          checkout_id: 'chk_123',
          idem_key: 'payment_456',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(data.decision).toEqual({
        allowed: true,
        code: 'authorised',
        clause: 'Issuer §5',
        circular: 'NPCI/UPI/OC No.228',
        quote: 'Payment authorized by compliance gate',
        detail: 'Payment captured successfully',
      });
    });
  });

  describe('Failure Path - Payment Refused', () => {
    it('should return decision details when gate refuses payment', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          error: {
            code: 'declined',
            clause: 'Issuer §4',
            circular: 'NPCI/UPI/OC No.228',
            quote: 'Concurrent block limit exceeded',
            detail: 'Customer already has active block',
          },
        }),
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          checkout_id: 'chk_123',
          idem_key: 'payment_456',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.decision.allowed).toBe(false);
      expect(data.decision.code).toBe('declined');
      expect(data.decision.clause).toBe('Issuer §4');
      expect(data.decision.detail).toBe('Customer already has active block');
    });

    it('should preserve error code, clause, circular, quote, and detail', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          error: {
            code: 'retry_forbidden',
            clause: 'Acquirer §3',
            circular: 'NPCI/UPI/OC No.228',
            quote: 'Non-timeout retries forbidden',
            detail: 'This failure is not retryable',
          },
        }),
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          checkout_id: 'chk_789',
          idem_key: 'payment_999',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(data.decision.code).toBe('retry_forbidden');
      expect(data.decision.clause).toBe('Acquirer §3');
      expect(data.decision.circular).toBe('NPCI/UPI/OC No.228');
      expect(data.decision.quote).toBe('Non-timeout retries forbidden');
      expect(data.decision.detail).toBe('This failure is not retryable');
    });
  });

  describe('Error Handling', () => {
    it('should handle backend 403 Forbidden', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'origin not allowed',
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          checkout_id: 'chk_123',
          idem_key: 'payment_456',
        }),
        headers: { 'origin': 'https://unauthorized.app' },
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Backend returned 403');
    });

    it('should handle backend 500 error', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          checkout_id: 'chk_123',
          idem_key: 'payment_456',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Backend returned 500');
    });

    it('should handle fetch network error', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      process.env.MERCHANT_URL = 'http://unreachable:8080';

      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          checkout_id: 'chk_123',
          idem_key: 'payment_456',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to process payment');
    });

    it('should handle malformed JSON response from backend', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          checkout_id: 'chk_123',
          idem_key: 'payment_456',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('Environment Variable Resolution', () => {
    it('should use NEXT_PUBLIC_API_BASE_URL when set', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: { id: 'chk_123', status: 'completed' } }),
      });

      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
      process.env.MERCHANT_URL = 'http://fallback:8080';

      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          checkout_id: 'chk_123',
          idem_key: 'payment_456',
        }),
      });

      await POST(request as any);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toContain('https://api.example.com');
    });

    it('should fall back to MERCHANT_URL', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: { id: 'chk_123', status: 'completed' } }),
      });

      process.env.MERCHANT_URL = 'http://merchant:9000';
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      const route = await import('../../app/api/checkout/complete/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({
          checkout_id: 'chk_123',
          idem_key: 'payment_456',
        }),
      });

      await POST(request as any);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toContain('http://merchant:9000');
    });
  });
});
