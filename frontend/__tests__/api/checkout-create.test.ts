import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Unit tests for /api/checkout/create route
 * Tests the checkout session creation with merchant backend via MCP
 */

// Mock fetch globally
global.fetch = vi.fn();

describe('POST /api/checkout/create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env vars before each test
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    delete process.env.MERCHANT_URL;
  });

  describe('Input Validation', () => {
    it('should reject request with missing items', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: { id: 'chk_123', status: 'ready' } }),
      });

      // Import route directly for testing
      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          currency: 'INR',
          // items missing
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid items');
    });

    it('should reject request with empty items array', async () => {
      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [],
          currency: 'INR',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid items');
    });

    it('should reject request with invalid items type', async () => {
      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: 'not-an-array',
          currency: 'INR',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid items');
    });

    it('should reject malformed JSON', async () => {
      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: 'not-json',
      });

      const response = await POST(request as any);
      expect(response.status).toBe(500);
    });
  });

  describe('Environment Variable Resolution', () => {
    it('should use NEXT_PUBLIC_API_BASE_URL when set', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: { id: 'chk_123', status: 'ready' } }),
      });

      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
      process.env.MERCHANT_URL = 'http://fallback:8080';

      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: 'sku1', qty: 1 }],
          currency: 'INR',
        }),
        headers: { 'origin': 'http://localhost:3000' },
      });

      await POST(request as any);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toContain('https://api.example.com');
    });

    it('should fall back to MERCHANT_URL when NEXT_PUBLIC_API_BASE_URL not set', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: { id: 'chk_123', status: 'ready' } }),
      });

      process.env.MERCHANT_URL = 'http://merchant:8080';
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: 'sku1', qty: 1 }],
          currency: 'INR',
        }),
        headers: { 'origin': 'http://localhost:3000' },
      });

      await POST(request as any);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toContain('http://merchant:8080');
    });

    it('should use localhost:8080 as default when no env vars set', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: { id: 'chk_123', status: 'ready' } }),
      });

      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.MERCHANT_URL;

      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: 'sku1', qty: 1 }],
          currency: 'INR',
        }),
        headers: { 'origin': 'http://localhost:3000' },
      });

      await POST(request as any);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toContain('http://localhost:8080');
    });
  });

  describe('Backend Communication', () => {
    it('should call backend with correct JSON-RPC format', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: { id: 'chk_123', status: 'ready', total_minor: 50000, currency: 'INR' } }),
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: 'sku1', qty: 2 }],
          currency: 'INR',
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
          name: 'create_checkout',
          arguments: {
            items: [{ id: 'sku1', qty: 2 }],
            currency: 'INR',
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
        json: async () => ({ result: { id: 'chk_123', status: 'ready' } }),
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: 'sku1', qty: 1 }],
          currency: 'INR',
        }),
        headers: { 'origin': 'https://myapp.vercel.app' },
      });

      await POST(request as any);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].headers.Origin).toBe('https://myapp.vercel.app');
    });

    it('should include block parameter when provided', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: { id: 'chk_123', status: 'ready' } }),
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const blockData = {
        max_minor: 500000,
        customer_id: 'cust_123',
      };

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: 'sku1', qty: 1 }],
          currency: 'INR',
          block: blockData,
        }),
        headers: { 'origin': 'http://localhost:3000' },
      });

      await POST(request as any);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.params.arguments.block).toEqual(blockData);
    });
  });

  describe('Success Responses', () => {
    it('should return checkout session on successful creation', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: {
            id: 'chk_abc123',
            status: 'ready',
            total_minor: 125000,
            currency: 'INR',
          },
        }),
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [
            { id: 'sku1', qty: 1 },
            { id: 'sku2', qty: 1 },
          ],
          currency: 'INR',
        }),
        headers: { 'origin': 'http://localhost:3000' },
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('chk_abc123');
      expect(data.status).toBe('ready');
      expect(data.total_minor).toBe(125000);
      expect(data.currency).toBe('INR');
    });

    it('should use INR currency by default', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: { id: 'chk_123', status: 'ready' } }),
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: 'sku1', qty: 1 }],
          // currency not specified
        }),
        headers: { 'origin': 'http://localhost:3000' },
      });

      await POST(request as any);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.params.arguments.currency).toBe('INR');
    });
  });

  describe('Error Handling', () => {
    it('should handle backend 403 Forbidden error', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'origin not allowed',
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: 'sku1', qty: 1 }],
          currency: 'INR',
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

      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: 'sku1', qty: 1 }],
          currency: 'INR',
        }),
        headers: { 'origin': 'http://localhost:3000' },
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Backend returned 500');
    });

    it('should handle JSON-RPC error response', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          error: {
            code: 'not_found',
            detail: 'Product not found',
          },
        }),
      });

      process.env.MERCHANT_URL = 'http://localhost:8080';

      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: 'unknown_sku', qty: 1 }],
          currency: 'INR',
        }),
        headers: { 'origin': 'http://localhost:3000' },
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Product not found');
    });

    it('should handle fetch network error', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      process.env.MERCHANT_URL = 'http://unreachable:8080';

      const route = await import('../../app/api/checkout/create/route');
      const { POST } = route;

      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: 'sku1', qty: 1 }],
          currency: 'INR',
        }),
        headers: { 'origin': 'http://localhost:3000' },
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('ECONNREFUSED');
    });
  });
});
