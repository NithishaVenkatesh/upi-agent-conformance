"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import type { GateDecision } from "@/lib/types";

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
      // Call backend to create checkout
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
      // Call backend to complete checkout (processes through gate)
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
      setCheckout(prev =>
        prev ? { ...prev, status: "failed" } : null
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[--color-rule] pb-6">
        <h1 className="text-2xl font-600 text-[--color-ink] mb-2">
          Checkout
        </h1>
        <p className="text-sm text-[--color-ink-2]">
          Experience compliance-first payments through the UPI gate
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Product Catalog */}
        <div className="col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-600 text-[--color-ink] mb-4">Products</h2>
            <div className="space-y-3">
              {CATALOG.map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border border-[--color-rule] rounded-md hover:bg-[--color-surface-2]"
                >
                  <div>
                    <h3 className="font-500 text-[--color-ink]">{product.name}</h3>
                    <p className="text-sm text-[--color-ink-2]">{product.description}</p>
                    <p className="text-lg font-600 text-[--color-positive] mt-2">
                      ₹{(product.price_minor / 100).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="px-4 py-2 bg-[--color-primary] text-white rounded-md font-500 hover:opacity-90 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="space-y-4">
          <div className="border border-[--color-rule] rounded-md p-6 bg-[--color-surface-2]">
            <h2 className="flex items-center gap-2 text-lg font-600 text-[--color-ink] mb-4">
              <ShoppingCart size={20} />
              Cart
            </h2>

            {cart.length === 0 ? (
              <p className="text-sm text-[--color-ink-2]">No items in cart</p>
            ) : (
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border border-[--color-rule]">
                    <div className="flex-1">
                      <p className="text-sm font-500 text-[--color-ink]">{item.name}</p>
                      <p className="text-xs text-[--color-ink-2]">₹{(item.price_minor / 100).toFixed(2)} × {item.qty}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-xs">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-[--color-rule] pt-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[--color-ink-2]">Subtotal:</span>
                <span className="font-500 text-[--color-ink]">₹{(cartTotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-600 text-[--color-ink]">Total:</span>
                <span className="font-700 text-lg text-[--color-primary]">₹{(cartTotal / 100).toFixed(2)}</span>
              </div>
            </div>

            {!checkout ? (
              <button
                onClick={createCheckout}
                disabled={cart.length === 0 || loading}
                className="w-full py-2 bg-[--color-primary] text-white rounded-md font-500 hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? "Creating checkout..." : "Proceed to Payment"}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <p className="font-500">Checkout Created</p>
                  <p className="font-mono text-xs mt-1">{checkout.id}</p>
                </div>
                <button
                  onClick={processPayment}
                  disabled={checkout.status !== "ready" || loading}
                  className="w-full py-2 bg-[--color-positive] text-white rounded-md font-500 hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  <Zap size={16} />
                  {loading ? "Processing..." : "Process Payment"}
                </button>
              </div>
            )}
          </div>

          {/* Decision Detail */}
          {checkout?.decision && (
            <div className={`border rounded-md p-4 ${checkout.decision.allowed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <button
                onClick={() => setShowDecisionDetail(!showDecisionDetail)}
                className="w-full flex items-center gap-2 font-600 text-sm"
              >
                {checkout.decision.allowed ? (
                  <>
                    <CheckCircle2 size={16} className="text-green-600" />
                    <span className="text-green-900">Payment Allowed</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-red-600" />
                    <span className="text-red-900">Payment Refused</span>
                  </>
                )}
              </button>

              {showDecisionDetail && (
                <div className="mt-4 space-y-2 text-xs">
                  <div>
                    <p className="font-500 text-gray-700">Decision:</p>
                    <p className="font-mono bg-white p-2 rounded border border-gray-200">{checkout.decision.code}</p>
                  </div>
                  <div>
                    <p className="font-500 text-gray-700">Clause:</p>
                    <p className="font-mono bg-white p-2 rounded border border-gray-200">{checkout.decision.clause}</p>
                  </div>
                  <div>
                    <p className="font-500 text-gray-700">Regulatory Reference:</p>
                    <p className="font-mono bg-white p-2 rounded border border-gray-200">{checkout.decision.circular}</p>
                  </div>
                  <div>
                    <p className="font-500 text-gray-700">Quote:</p>
                    <p className="bg-white p-2 rounded border border-gray-200 italic">{checkout.decision.quote}</p>
                  </div>
                  <div>
                    <p className="font-500 text-gray-700">Detail:</p>
                    <p className="bg-white p-2 rounded border border-gray-200">{checkout.decision.detail}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-4 text-sm">
        <Link href="/app" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        <Link href="/app/ledger" className="text-blue-600 hover:underline">View Transaction Ledger →</Link>
      </div>
    </div>
  );
}
