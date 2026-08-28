/**
 * API client for MCP tools
 * Wraps HTTP communication with merchant server
 */

import { API_BASE_URL, API_TIMEOUT_MS } from "./constants";
import type { MCPToolsResponse, Checkout, Transaction } from "./types";

let requestId = 0;

function getNextRequestId(): number {
  return ++requestId;
}

async function callMCPTool(
  method: string,
  params: Record<string, unknown> = {}
): Promise<MCPToolsResponse> {
  const id = getNextRequestId();
  const url = `${API_BASE_URL}/api/ucp/mcp`;

  const payload = {
    jsonrpc: "2.0",
    method,
    params,
    id,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: typeof window !== "undefined" ? window.location.origin : "http://localhost",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${API_TIMEOUT_MS}ms`);
    }
    throw error;
  }
}

export const apiClient = {
  /**
   * List available MCP tools
   */
  async listTools(): Promise<Array<{ name: string; description: string }>> {
    const response = await callMCPTool("tools/list");
    if (response.error) {
      throw new Error(response.error.detail || "Failed to list tools");
    }
    return response.result?.tools || [];
  },

  /**
   * Search catalog by query
   */
  async searchCatalog(q: string = ""): Promise<
    Array<{ id: string; name: string; price_minor: number }>
  > {
    const response = await callMCPTool("tools/call", {
      name: "search_catalog",
      arguments: { q },
    });
    if (response.error) {
      throw new Error(response.error.detail || "Catalog search failed");
    }
    return response.result?.products || [];
  },

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<{ id: string; name: string; price_minor: number }> {
    const response = await callMCPTool("tools/call", {
      name: "get_product",
      arguments: { id },
    });
    if (response.error) {
      throw new Error(response.error.detail || "Product not found");
    }
    return {
      id: response.result?.id || id,
      name: response.result?.name || "",
      price_minor: response.result?.price_minor || 0,
    };
  },

  /**
   * Create checkout session
   */
  async createCheckout(
    items: Array<{ id: string; qty: number }>,
    currency: string,
    block?: Record<string, unknown>
  ): Promise<Checkout> {
    const response = await callMCPTool("tools/call", {
      name: "create_checkout",
      arguments: { items, currency, ...(block && { block }) },
    });
    if (response.error) {
      throw new Error(response.error.detail || "Failed to create checkout");
    }
    return {
      id: response.result?.id || "",
      items,
      currency,
      total_minor: response.result?.total_minor || 0,
      status: (response.result?.status as "ready_for_payment" | "completed") || "ready_for_payment",
    };
  },

  /**
   * Update checkout
   */
  async updateCheckout(checkoutId: string): Promise<Checkout> {
    const response = await callMCPTool("tools/call", {
      name: "update_checkout",
      arguments: { checkout_id: checkoutId },
    });
    if (response.error) {
      throw new Error(response.error.detail || "Failed to update checkout");
    }
    return {
      id: response.result?.id || checkoutId,
      items: [],
      currency: response.result?.currency || "INR",
      total_minor: response.result?.total_minor || 0,
      status: (response.result?.status as "ready_for_payment" | "completed") || "ready_for_payment",
    };
  },

  /**
   * Complete checkout and process payment
   */
  async completeCheckout(
    checkoutId: string,
    idemKey: string
  ): Promise<{
    checkout: Checkout;
    success: boolean;
    error?: {
      code: string;
      clause?: string;
      circular?: string;
      quote?: string;
      detail: string;
    };
    orderId?: string;
  }> {
    const response = await callMCPTool("tools/call", {
      name: "complete_checkout",
      arguments: { checkout_id: checkoutId, idem_key: idemKey },
    });

    // Check if there was an error response
    if (response.result?._error || response.error) {
      const errorData = response.result || response.error || {};
      return {
        checkout: { id: checkoutId, items: [], currency: "INR", total_minor: 0, status: "ready_for_payment" },
        success: false,
        error: {
          code: errorData.code || "unknown",
          clause: errorData.clause,
          circular: errorData.circular,
          quote: errorData.quote,
          detail: errorData.detail || "Payment failed",
        },
      };
    }

    return {
      checkout: {
        id: response.result?.id || checkoutId,
        items: [],
        currency: "INR",
        total_minor: 0,
        status: (response.result?.status as "ready_for_payment" | "completed") || "completed",
        order_id: response.result?.order_id,
      },
      success: true,
      orderId: response.result?.order_id,
    };
  },
};
