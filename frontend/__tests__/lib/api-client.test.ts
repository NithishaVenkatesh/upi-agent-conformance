import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiClient } from "../../lib/api-client";

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("searchCatalog", () => {
    it("should search catalog and return products", async () => {
      const mockProducts = [
        { id: "sku1", name: "Cotton tote", price_minor: 249900 },
        { id: "sku2", name: "Canvas backpack", price_minor: 389900 },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          id: 1,
          result: { products: mockProducts },
        }),
      });

      const result = await apiClient.searchCatalog("");
      expect(result).toEqual(mockProducts);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8080/api/ucp/mcp",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should handle API errors gracefully", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          id: 1,
          error: { detail: "Product not found" },
        }),
      });

      await expect(apiClient.searchCatalog("invalid")).rejects.toThrow("Product not found");
    });
  });

  describe("createCheckout", () => {
    it("should create checkout session", async () => {
      const mockCheckout = {
        id: "cs_abc123",
        status: "ready_for_payment",
        total_minor: 249900,
        currency: "INR",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          id: 1,
          result: mockCheckout,
        }),
      });

      const result = await apiClient.createCheckout(
        [{ id: "sku1", qty: 1 }],
        "INR"
      );

      expect(result.id).toBe("cs_abc123");
      expect(result.status).toBe("ready_for_payment");
      expect(result.total_minor).toBe(249900);
    });

    it("should include block data in checkout creation", async () => {
      const mockCheckout = {
        id: "cs_abc123",
        status: "ready_for_payment",
        total_minor: 249900,
        currency: "INR",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          id: 1,
          result: mockCheckout,
        }),
      });

      const block = {
        max_minor: 1000000,
        expires_ts: Math.floor(Date.now() / 1000) + 86400 * 30,
      };

      const result = await apiClient.createCheckout(
        [{ id: "sku1", qty: 1 }],
        "INR",
        block
      );

      expect(result.id).toBe("cs_abc123");

      // Verify fetch was called with block data
      const callArgs = (global.fetch as any).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.params.arguments.block).toEqual(block);
    });
  });

  describe("completeCheckout", () => {
    it("should complete checkout on success", async () => {
      const mockResponse = {
        id: "cs_abc123",
        status: "completed",
        order_id: "order_fake_001",
        capture_mode: "STUBBED",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          id: 1,
          result: mockResponse,
        }),
      });

      const result = await apiClient.completeCheckout("cs_abc123", "idem_key_123");

      expect(result.success).toBe(true);
      expect(result.checkout.order_id).toBe("order_fake_001");
    });

    it("should handle payment refusal", async () => {
      const mockError = {
        _error: true,
        code: "cap_exceeds_authority",
        clause: "Issuer §5",
        circular: "NPCI/UPI/OC No.228",
        quote: "The block created to be maximum of Rs.10,000...",
        detail: "declared ₹25,000 > authorised ₹10,000",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          id: 1,
          result: mockError,
        }),
      });

      const result = await apiClient.completeCheckout("cs_abc123", "idem_key_123");

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("cap_exceeds_authority");
      expect(result.error?.clause).toBe("Issuer §5");
      expect(result.error?.quote).toContain("Rs.10,000");
    });

    it("should handle idempotent replay", async () => {
      const mockResponse = {
        id: "cs_abc123",
        status: "completed",
        order_id: "order_fake_001",
        replayed: true,
        capture_mode: "STUBBED",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          id: 1,
          result: mockResponse,
        }),
      });

      const result = await apiClient.completeCheckout("cs_abc123", "idem_key_123");

      expect(result.success).toBe(true);
      expect(result.checkout.order_id).toBe("order_fake_001");
    });
  });

  describe("error handling", () => {
    it("should handle network timeout", async () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";

      (global.fetch as any).mockRejectedValueOnce(abortError);

      await expect(apiClient.searchCatalog("")).rejects.toThrow(/timeout/i);
    });

    it("should handle HTTP errors", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(apiClient.searchCatalog("")).rejects.toThrow("HTTP 500");
    });

    it("should handle malformed JSON response", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(apiClient.searchCatalog("")).rejects.toThrow("Invalid JSON");
    });
  });
});
