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
          decision: {
            allowed: false,
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

    // Success response: backend doesn't return decision details, only checkout confirmation
    // Frontend knows: if capture succeeded (no _error), then gate allowed it
    const backendResult = result.result || {};
    return NextResponse.json({
      success: true,
      checkout: {
        id: backendResult.id,
        status: backendResult.status,
        order_id: backendResult.order_id,
      },
      orderId: backendResult.order_id,
      decision: {
        allowed: true,
        code: "authorised",
        clause: "Issuer §5",
        circular: "NPCI/UPI/OC No.228",
        quote: "Payment authorized by compliance gate",
        detail: "Payment captured successfully",
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
