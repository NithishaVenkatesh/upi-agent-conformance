import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/checkout/create
 * Creates a checkout session by calling the merchant backend
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, currency } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid items" },
        { status: 400 }
      );
    }

    // Call merchant backend to create checkout
    const merchantUrl = process.env.MERCHANT_URL || "http://localhost:8080";
    const response = await fetch(`${merchantUrl}/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items,
        currency: currency || "INR",
      }),
    });

    if (!response.ok) {
      throw new Error(`Merchant server returned ${response.status}`);
    }

    const checkout = await response.json();
    return NextResponse.json(checkout);
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
