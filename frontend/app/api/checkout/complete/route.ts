import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/checkout/complete
 * Completes checkout by processing payment through the compliance gate
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

    // Call merchant backend to complete checkout (goes through gate)
    const merchantUrl = process.env.MERCHANT_URL || "http://localhost:8080";
    const response = await fetch(`${merchantUrl}/checkout/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_id,
        idem_key,
      }),
    });

    if (!response.ok) {
      // Even on failure, we want to return the decision details
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Checkout completion failed:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
