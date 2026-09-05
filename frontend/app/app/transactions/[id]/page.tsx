"use client";

import { useState } from "react";
import { GateFlow } from "@/components/gate-flow";
import { Ruling } from "@/components/ruling";
import { JSONPayload } from "@/components/json-payload";

export default function TransactionDetail() {
  const decision = {
    allowed: true,
    code: "authorised",
    clause: "Issuer §5",
    quote: "The block created to be maximum of Rs.10,000 of block limit and up to 90 days.",
    circular: "NPCI/UPI/OC No.228",
    detail: "₹2,499 within ₹7,501 remaining",
  };

  const transactionPayload = {
    transactionId: "txn_1a2b3c4d5e6f",
    status: "completed",
    amount: 2499,
    currency: "INR",
    timestamp: "2026-09-03T10:30:45.123Z",
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

  return (
    <div className="space-y-8">
      <GateFlow failing={-1} />
      <Ruling decision={decision} variant="full" />
      <JSONPayload
        data={transactionPayload}
        label="Transaction Payload"
        defaultOpen={false}
      />
    </div>
  );
}
