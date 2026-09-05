import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/checkout/complete
 * Completes checkout by processing payment through the compliance gate via MCP
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkout_id, idem_key } = body;

    if (!checkout_id || !idem_key) {
      return NextResponse.json(
        { error: "Missing checkout_id or idem_key" },
        { status: 400 }
      );
    }

    // Call merchant backend MCP endpoint
    const merchantUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.MERCHANT_URL || "http://127.0.0.1:8080";
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
          name: "complete_checkout",
          arguments: {
            checkout_id,
            idem_key,
          },
        },
        id: 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const result = await response.json();

    // Handle JSON-RPC error response (gate rejection)
    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: result.error.code,
            clause: result.error.clause,
            circular: result.error.circular,
            quote: result.error.quote,
            detail: result.error.detail,
          },
        },
        { status: 200 } // Return 200 even for gate rejections
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      checkout: {
        id: result.result?.id,
        status: result.result?.status,
        order_id: result.result?.order_id,
      },
      orderId: result.result?.order_id,
      decision: {
        allowed: true,
        code: "authorised",
        clause: result.result?.clause || "Issuer §5",
        circular: "NPCI/UPI/OC No.228",
        quote: "Payment authorized",
        detail: result.result?.detail || "Payment processed",
      },
    });
  } catch (error) {
    console.error("Checkout completion failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process payment"
      },
      { status: 500 }
    );
  }
}
