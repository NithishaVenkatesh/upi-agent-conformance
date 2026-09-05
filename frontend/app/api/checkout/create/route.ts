import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/checkout/create
 * Creates a checkout session by calling the merchant backend via MCP
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, currency, block } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid items" },
        { status: 400 }
      );
    }

    // Call merchant backend MCP endpoint
    const merchantUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.MERCHANT_URL || "http://localhost:8080";
    const response = await fetch(`${merchantUrl}/api/ucp/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: req.headers.get("origin") || "http://localhost",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: "create_checkout",
          arguments: {
            items,
            currency: currency || "INR",
            ...(block && { block }),
          },
        },
        id: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error ${response.status}:`, errorText);
      throw new Error(`Backend returned ${response.status}`);
    }

    const result = await response.json();
    console.log("Checkout response:", result);

    // Handle JSON-RPC error response
    if (result.error) {
      console.error("Gate error:", result.error);
      return NextResponse.json(
        { error: result.error.detail || "Failed to create checkout" },
        { status: 400 }
      );
    }

    // Return the checkout session
    return NextResponse.json({
      id: result.result?.id,
      status: result.result?.status,
      total_minor: result.result?.total_minor,
      currency: result.result?.currency,
    });
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
