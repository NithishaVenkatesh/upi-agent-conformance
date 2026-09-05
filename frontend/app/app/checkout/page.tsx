"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import type { GateDecision } from "@/lib/types";
import { Verdict } from "@/components/verdict";
import { Money } from "@/components/money";
import { Cite } from "@/components/cite";

const CATALOG = [
  { id: "sku1", name: "Cotton tote", price_minor: 249900, description: "Eco-friendly cotton tote bag" },
  { id: "sku2", name: "Canvas backpack", price_minor: 389900, description: "Durable canvas backpack" },
  { id: "sku3", name: "Laptop sleeve", price_minor: 149900, description: "Protective laptop sleeve" },
];

interface CartItem {
  id: string;
  name: string;
  price_minor: number;
  qty: number;
}

interface CheckoutSession {
  id: string;
  items: CartItem[];
  total_minor: number;
  status: "ready" | "processing" | "completed" | "failed";
  decision?: GateDecision;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkout, setCheckout] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDecisionDetail, setShowDecisionDetail] = useState(false);

  const addToCart = (sku: string) => {
    const product = CATALOG.find(p => p.id === sku);
    if (!product) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === sku);
      if (existing) {
        return prev.map(item =>
          item.id === sku ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (sku: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.id !== sku));
    } else {
      setCart(prev =>
        prev.map(item => item.id === sku ? { ...item, qty } : item)
      );
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price_minor * item.qty), 0);

  const createCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, qty: item.qty })),
          currency: "INR",
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout");
      const session = await response.json();
      setCheckout({ ...session, status: "ready" });
    } catch (error) {
      console.error("Checkout creation failed:", error);
      setCheckout({
        id: "error",
        items: cart,
        total_minor: cartTotal,
        status: "failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!checkout) return;
    setCheckout(prev => prev ? { ...prev, status: "processing" } : null);
    setLoading(true);

    try {
      const response = await fetch("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkout_id: checkout.id,
          idem_key: `payment_${Date.now()}`,
        }),
      });

      if (!response.ok) throw new Error("Payment failed");
      const result = await response.json();
      setCheckout(prev =>
        prev ? { ...prev, status: "completed", decision: result.decision } : null
      );
    } catch (error) {
      console.error("Payment processing failed:", error);
      setCheckout(prev => prev ? { ...prev, status: "failed" } : null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[--color-rule] pb-6">
        <h1 className="text-xl font-600 text-[--color-ink] mb-2">Checkout</h1>
        <p className="text-sm text-[--color-ink-2]">
          Experience compliance-first payments through the UPI gate
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Product Catalog */}
        <div className="col-span-2 space-y-6">
          <div>
            <h2 className="text-13px font-600 text-[--color-ink] uppercase tracking-wide mb-4">
              Products
            </h2>
            <div className="space-y-3">
              {CATALOG.map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border border-[--color-rule] rounded-[3px] hover:bg-[--color-surface-2]"
                >
                  <div className="flex-1">
                    <h3 className="font-500 text-13px text-[--color-ink]">{product.name}</h3>
                    <p className="text-12px text-[--color-ink-2] mt-1">{product.description}</p>
                    <p className="font-600 text-13px text-[--color-ink] mt-2">
                      <Money minor={product.price_minor} />
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="px-4 py-2.5 bg-[--color-pass] text-white rounded-[3px] font-500 text-13px hover:opacity-90 transition min-h-[40px]"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="space-y-4">
          <div className="border border-[--color-rule] rounded-[3px] p-6 bg-[--color-surface]">
            <h2 className="font-600 text-13px text-[--color-ink] uppercase tracking-wide mb-4">
              Cart
            </h2>

            {cart.length === 0 ? (
              <p className="text-12px text-[--color-ink-2]">No items</p>
            ) : (
              <div className="space-y-2 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-[--color-paper] rounded-[3px] border border-[--color-rule-2]">
                    <div className="flex-1">
                      <p className="text-12px font-500 text-[--color-ink]">{item.name}</p>
                      <p className="text-11px text-[--color-ink-2]">
                        <Money minor={item.price_minor} /> × {item.qty}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="p-1 hover:bg-[--color-rule] rounded"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-11px">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="p-1 hover:bg-[--color-rule] rounded"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-[--color-rule] pt-4 mb-4">
              <div className="flex justify-between mb-2 text-12px">
                <span className="text-[--color-ink-2]">Subtotal:</span>
                <span className="font-500 text-[--color-ink]"><Money minor={cartTotal} /></span>
              </div>
              <div className="flex justify-between font-600 text-13px">
                <span className="text-[--color-ink]">Total:</span>
                <span className="text-[--color-ink]"><Money minor={cartTotal} /></span>
              </div>
            </div>

            {!checkout ? (
              <button
                onClick={createCheckout}
                disabled={cart.length === 0 || loading}
                className="w-full py-2.5 bg-[--color-pass] text-white rounded-[3px] font-500 text-13px hover:opacity-90 disabled:opacity-50 transition min-h-[44px]"
              >
                {loading ? "Creating..." : "Proceed to Payment"}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="p-2 bg-[--color-pass-bg] border border-[--color-pass] rounded-[3px] text-11px text-[--color-ink]">
                  <p className="font-500">Checkout Created</p>
                  <p className="font-mono text-10px mt-1 text-[--color-ink-2]">{checkout.id}</p>
                </div>
                <button
                  onClick={processPayment}
                  disabled={checkout.status !== "ready" || loading}
                  className="w-full py-2.5 bg-[--color-pass] text-white rounded-[3px] font-500 text-13px hover:opacity-90 disabled:opacity-50 transition min-h-[44px]"
                >
                  {loading ? "Processing..." : "Process Payment"}
                </button>
              </div>
            )}
          </div>

          {/* Decision Detail */}
          {checkout?.decision && (
            <div className={`border rounded-[3px] p-4 ${
              checkout.decision.allowed
                ? "bg-[--color-pass-bg] border-[--color-pass]"
                : "bg-[--color-fail-bg] border-[--color-fail]"
            }`}>
              <button
                onClick={() => setShowDecisionDetail(!showDecisionDetail)}
                className="w-full flex items-center justify-between font-600 text-12px text-[--color-ink]"
              >
                <span>{checkout.decision.allowed ? "✓ Allowed" : "✗ Refused"}</span>
                <span className="text-11px">{showDecisionDetail ? "−" : "+"}</span>
              </button>

              {showDecisionDetail && (
                <div className="mt-3 space-y-2 text-11px">
                  <div>
                    <p className="font-500 text-[--color-ink]">Decision Code:</p>
                    <p className="font-mono bg-[--color-surface] p-2 rounded-[3px] border border-[--color-rule] mt-1 text-[--color-ink-2]">
                      {checkout.decision.code}
                    </p>
                  </div>
                  <div>
                    <p className="font-500 text-[--color-ink]">Regulatory Citation:</p>
                    <Cite circular={checkout.decision.circular} clause={checkout.decision.clause} />
                  </div>
                  <div>
                    <p className="font-500 text-[--color-ink]">Quote:</p>
                    <p className="bg-[--color-surface] p-2 rounded-[3px] border border-[--color-rule] mt-1 italic text-[--color-ink]">
                      {checkout.decision.quote}
                    </p>
                  </div>
                  <div>
                    <p className="font-500 text-[--color-ink]">Details:</p>
                    <p className="bg-[--color-surface] p-2 rounded-[3px] border border-[--color-rule] mt-1 text-[--color-ink]">
                      {checkout.decision.detail}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-[--color-rule] pt-6 text-sm">
        <Link href="/app" className="text-[--color-ink] hover:text-[--color-pass]">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
