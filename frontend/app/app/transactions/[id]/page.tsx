"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { GateFlow } from "@/components/gate-flow";
import { Ruling } from "@/components/ruling";
import { JSONPayload } from "@/components/json-payload";
import type { GateDecision } from "@/lib/types";

// Mock transaction data for all possible tx-N IDs
const MOCK_TX_DATA: Record<string, any> = {
  "tx-1": {
    decision: {
      allowed: true,
      code: "authorised",
      clause: "Issuer §3",
      circular: "NPCI/UPI/OC No.228",
      quote: "Issuer may set limits on UPI payment amounts within regulatory bounds.",
      detail: "Amount within limit",
    },
    payload: {
      transactionId: "tx-1",
      status: "completed",
      amount: 249900,
      currency: "INR",
      timestamp: new Date(Date.now() - 240000).toISOString(),
      merchant: { id: "demo", name: "Demo Merchant" },
      customer: { id: "cust_001", phone: "+91-9876543210" },
      method: "upi",
    },
  },
  "tx-2": {
    decision: {
      allowed: false,
      code: "duplicate_block_for_merchant",
      clause: "Issuer §5",
      circular: "NPCI/UPI/OC No.228",
      quote: "No concurrent blocks from the same merchant to the same customer.",
      detail: "Duplicate block detected",
    },
    payload: {
      transactionId: "tx-2",
      status: "declined",
      amount: 389900,
      currency: "INR",
      timestamp: new Date(Date.now() - 180000).toISOString(),
      merchant: { id: "demo", name: "Demo Merchant" },
      customer: { id: "cust_002", phone: "+91-9876543210" },
      method: "upi",
    },
  },
  "tx-3": {
    decision: {
      allowed: true,
      code: "authorised",
      clause: "Issuer §3",
      circular: "NPCI/UPI/OC No.228",
      quote: "Issuer may set limits on UPI payment amounts within regulatory bounds.",
      detail: "Amount within limit",
    },
    payload: {
      transactionId: "tx-3",
      status: "completed",
      amount: 129900,
      currency: "INR",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      merchant: { id: "demo", name: "Demo Merchant" },
      customer: { id: "cust_003", phone: "+91-9876543210" },
      method: "upi",
    },
  },
  "tx-4": {
    decision: {
      allowed: true,
      code: "authorised",
      clause: "Issuer §3",
      circular: "NPCI/UPI/OC No.228",
      quote: "Issuer may set limits on UPI payment amounts within regulatory bounds.",
      detail: "Amount within limit",
    },
    payload: {
      transactionId: "tx-4",
      status: "completed",
      amount: 500000,
      currency: "INR",
      timestamp: new Date(Date.now() - 60000).toISOString(),
      merchant: { id: "demo", name: "Demo Merchant" },
      customer: { id: "cust_004", phone: "+91-9876543210" },
      method: "upi",
    },
  },
  "tx-5": {
    decision: {
      allowed: false,
      code: "insufficient_block_balance",
      clause: "Issuer §2",
      circular: "NPCI/UPI/OC No.228",
      quote: "Customer must maintain sufficient funds in the payment instrument.",
      detail: "Insufficient balance",
    },
    payload: {
      transactionId: "tx-5",
      status: "declined",
      amount: 600000,
      currency: "INR",
      timestamp: new Date().toISOString(),
      merchant: { id: "demo", name: "Demo Merchant" },
      customer: { id: "cust_005", phone: "+91-9876543210" },
      method: "upi",
    },
  },
};

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
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";

        try {
          const response = await fetch(`${apiUrl}/api/ledger`, {
            signal: AbortSignal.timeout(5000)
          });

          if (response.ok) {
            const entries = await response.json();

            if (Array.isArray(entries) && entries.length > 0) {
              for (const entry of entries) {
                if (entry.payload?.checkout === transactionId) {
                  const payload = entry.payload;
                  const decision: GateDecision = {
                    allowed: payload.decision === "authorised",
                    code: payload.decision,
                    clause: payload.clause || "Unknown",
                    circular: payload.circular || "NPCI/UPI/OC No.228",
                    quote: payload.quote || "Payment processed according to regulatory bounds.",
                    detail: payload.detail || "Payment processed",
                  };

                  setTransaction({
                    decision,
                    payload: {
                      transactionId,
                      status: payload.event === "captured" ? "completed" :
                              payload.decision === "authorised" ? "authorized" : "declined",
                      amount: 100000,
                      currency: "INR",
                      timestamp: new Date().toISOString(),
                      merchant: { id: "demo", name: "Demo Merchant" },
                      customer: { id: "cust_demo", phone: "+91-9876543210" },
                      method: "upi",
                      ledgerSeq: entry.seq,
                      ledgerHash: entry.hash,
                      prevHash: entry.prev_hash,
                    },
                  });
                  setLoading(false);
                  return;
                }
              }
            }
          }
        } catch (fetchErr) {
          console.warn("Backend unavailable, using mock data:", fetchErr);
        }

        // Fallback to mock data
        if (MOCK_TX_DATA[transactionId]) {
          setTransaction(MOCK_TX_DATA[transactionId]);
        } else {
          setError(`Transaction ${transactionId} not found`);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);


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
