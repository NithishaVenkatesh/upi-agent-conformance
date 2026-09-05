"use client";

import { VerifyChain } from "@/components/verify-chain";

export default function Ledger() {
  const chainLinks = [
    {
      id: "entry-1",
      label: "Transaction initiated",
      timestamp: "2026-09-03 10:30:45",
    },
    {
      id: "entry-2",
      label: "Gate flow validation complete",
      timestamp: "2026-09-03 10:30:45",
    },
    {
      id: "entry-3",
      label: "Merchant verification passed",
      timestamp: "2026-09-03 10:30:46",
    },
    {
      id: "entry-4",
      label: "Customer balance verified",
      timestamp: "2026-09-03 10:30:46",
    },
    {
      id: "entry-5",
      label: "Compliance checks completed",
      timestamp: "2026-09-03 10:30:47",
    },
    {
      id: "entry-6",
      label: "Sealed into ledger",
      timestamp: "2026-09-03 10:30:47",
    },
  ];

  return (
    <div>
      <h1 className="text-20px font-600 text-[--color-ink] mb-8">
        Ledger Verification Chain
      </h1>
      <VerifyChain links={chainLinks} autoVerify={true} verifyDelay={200} />
    </div>
  );
}
