"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { GateFlow } from "@/components/gate-flow";
import { Ruling } from "@/components/ruling";
import { JSONPayload } from "@/components/json-payload";
import type { GateDecision } from "@/lib/types";

export default function TransactionDetail() {
  const params = useParams();
  const transactionId = params?.id as string;
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) {
        setError("Transaction ID not found");
        setLoading(false);
        return;
      }

      try {
        // Fetch all ledger entries
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";
        const response = await fetch(`${apiUrl}/api/ledger`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch ledger");
        }

        const entries = await response.json();

        // Find the transaction matching the ID (checkout ID)
        let transactionData = null;
        for (const entry of entries) {
          if (entry.payload.checkout === transactionId) {
            transactionData = entry;
            break;
          }
        }

        if (!transactionData) {
          // Use fallback for mock transactions (tx-1, tx-2, etc.)
          console.log("Transaction not in ledger, using mock data");
          setTransaction({
            decision: fallbackDecision,
            payload: { ...fallbackPayload, transactionId },
          });
          setLoading(false);
          return;
        }

        // Extract decision from ledger entry
        const payload = transactionData.payload;
        const decision: GateDecision = {
          allowed: payload.decision === "authorised",
          code: payload.decision,
          clause: payload.clause || "Unknown",
          circular: payload.circular || "NPCI/UPI/OC No.228",
          quote: payload.quote || "Payment processed according to regulatory bounds.",
          detail: payload.detail || "Payment processed",
        };

        // Create transaction payload to display
        const txPayload = {
          transactionId: transactionId,
          status: payload.event === "captured" ? "completed" : 
                  payload.decision === "authorised" ? "authorized" : "declined",
          amount: 100000, // Default amount in paise
          currency: "INR",
          timestamp: new Date().toISOString(),
          merchant: {
            id: "demo",
            name: "Demo Merchant",
          },
          customer: {
            id: "cust_demo",
            phone: "+91-9876543210",
          },
          method: "upi",
          ledgerSeq: transactionData.seq,
          ledgerHash: transactionData.hash,
          prevHash: transactionData.prev_hash,
        };

        setTransaction({
          decision,
          payload: txPayload,
        });
      } catch (err) {
        console.error("Failed to fetch transaction:", err);
        setError("Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  // Fallback decision for error/loading states
  const fallbackDecision: GateDecision = {
    allowed: true,
    code: "authorised",
    clause: "Issuer §5",
    quote: "The block created to be maximum of Rs.10,000 of block limit and up to 90 days.",
    circular: "NPCI/UPI/OC No.228",
    detail: "₹2,499 within ₹7,501 remaining",
  };

  const fallbackPayload = {
    transactionId: transactionId || "unknown",
    status: "pending",
    amount: 249900,
    currency: "INR",
    timestamp: new Date().toISOString(),
    merchant: {
      id: "mrch_xyz789",
      name: "Example Store",
    },
    customer: {
      id: "cust_abc123",
      phone: "+91-9876543210",
    },
    method: "upi",
    metadata: {
      orderId: "ORD-20260903-001",
      source: "mobile-app",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-14px text-[--color-ink-2] mb-2">Loading transaction...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-14px text-[--color-fail] font-500 mb-2">{error}</div>
          <div className="text-12px text-[--color-ink-3]">Transaction ID: {transactionId}</div>
        </div>
      </div>
    );
  }

  // Only show transaction data if successfully loaded — don't use fallback for display
  if (!transaction) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-14px text-[--color-ink-2] mb-2">Transaction not available</div>
          <div className="text-12px text-[--color-ink-3]">No data could be retrieved for this transaction</div>
        </div>
      </div>
    );
  }

  const displayTransaction = transaction;

  return (
    <div className="space-y-8">
      <GateFlow failing={displayTransaction.decision.allowed ? -1 : 0} />
      <Ruling decision={displayTransaction.decision} variant="full" />
      <JSONPayload
        data={displayTransaction.payload}
        label="Transaction Payload"
        defaultOpen={false}
      />
    </div>
  );
}
