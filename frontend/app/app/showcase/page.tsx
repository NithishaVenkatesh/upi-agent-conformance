"use client";

import Link from "next/link";
import { CheckCircle2, AlertCircle, HelpCircle, Lock, TrendingDown, Repeat2, Shield } from "lucide-react";

const DECISION_CODES = [
  {
    code: "authorised",
    title: "Authorised",
    clause: "Issuer §3",
    circular: "NPCI/UPI/OC No.228",
    description: "Transaction passes all compliance checks",
    quote: "Issuer may set limits on UPI payment amounts within regulatory bounds.",
    icon: CheckCircle2,
    color: "green",
    real_example: "₹8,500 purchase within ₹10,000 cap",
  },
  {
    code: "cap_exceeds_authority",
    title: "Cap Exceeds Authority",
    clause: "Issuer §5",
    circular: "NPCI/UPI/OC No.228",
    description: "Transaction amount exceeds regulatory block cap",
    quote: "Blocks must not exceed ₹10,000 per NPCI mandate.",
    icon: TrendingDown,
    color: "red",
    real_example: "₹15,000 transaction when limit is ₹10,000",
  },
  {
    code: "insufficient_block_balance",
    title: "Insufficient Balance",
    clause: "Issuer §2",
    circular: "NPCI/UPI/OC No.228",
    description: "Customer lacks sufficient funds in the reserved block",
    quote: "Customer must maintain sufficient funds in the payment instrument.",
    icon: AlertCircle,
    color: "red",
    real_example: "₹10,000 block with only ₹5,000 available",
  },
  {
    code: "block_expired",
    title: "Block Expired",
    clause: "Issuer §4",
    circular: "NPCI/UPI/OC No.228",
    description: "Payment block has exceeded its expiry timestamp",
    quote: "All blocks must be revalidated before payment processing.",
    icon: Lock,
    color: "red",
    real_example: "Block created 91 days ago (max is 90)",
  },
  {
    code: "validity_exceeds_authority",
    title: "Validity Exceeds Authority",
    clause: "Issuer §5",
    circular: "NPCI/UPI/OC No.228",
    description: "Block validity window exceeds 90-day regulatory limit",
    quote: "Validity windows must not exceed 90 calendar days.",
    icon: TrendingDown,
    color: "red",
    real_example: "Block requested for 120 days (max is 90)",
  },
  {
    code: "duplicate_block_for_merchant",
    title: "Duplicate Block",
    clause: "Issuer §5",
    circular: "NPCI/UPI/OC No.228",
    description: "Customer already has an active block with this merchant",
    quote: "No concurrent blocks from the same merchant to the same customer.",
    icon: Repeat2,
    color: "red",
    real_example: "Merchant tries to create 2nd block for same customer",
  },
  {
    code: "retry_not_permitted",
    title: "Retry Not Permitted",
    clause: "Issuer §3",
    circular: "NPCI/UPI/OC No.228",
    description: "Payment retry attempted on non-timeout failure",
    quote: "Retries are only permitted for timeout-class failures.",
    icon: AlertCircle,
    color: "red",
    real_example: "Retrying after a decline (not timeout)",
  },
  {
    code: "retry_budget_exhausted",
    title: "Retry Budget Exhausted",
    clause: "Issuer §3",
    circular: "NPCI/UPI/OC No.228",
    description: "Customer has exceeded 3 retry attempts in 24 hours",
    quote: "Retries limited to 3 per 24-hour period.",
    icon: Shield,
    color: "red",
    real_example: "4th retry attempt within 24 hours",
  },
];

export default function ShowcasePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[--color-rule] pb-6">
        <h1 className="text-2xl font-600 text-[--color-ink] mb-2">
          Decision Gallery
        </h1>
        <p className="text-sm text-[--color-ink-2]">
          All 8 decision codes with regulatory citations
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-900">
          <strong>Why this matters:</strong> Every transaction decision is deterministic and cites its regulatory basis.
          This gallery shows all possible outcomes with their regulatory justifications from NPCI circulars.
        </p>
      </div>

      {/* Decision Cards Grid */}
      <div className="grid grid-cols-2 gap-6">
        {DECISION_CODES.map((decision) => {
          const Icon = decision.icon;
          const isAllowed = decision.code === "authorised";

          return (
            <div
              key={decision.code}
              className={`border rounded-md p-6 ${
                isAllowed
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {/* Header with Icon */}
              <div className="flex items-start gap-3 mb-4">
                <Icon
                  size={24}
                  className={isAllowed ? "text-green-600" : "text-red-600"}
                />
                <div className="flex-1">
                  <h3 className={`font-600 text-lg ${isAllowed ? "text-green-900" : "text-red-900"}`}>
                    {decision.title}
                  </h3>
                  <p className={`text-xs font-mono mt-1 ${isAllowed ? "text-green-700" : "text-red-700"}`}>
                    {decision.code}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-4">
                {decision.description}
              </p>

              {/* Real Example */}
              <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                <p className="text-xs font-500 text-gray-600">Real Example:</p>
                <p className="text-xs text-gray-800 mt-1 font-mono">{decision.real_example}</p>
              </div>

              {/* Regulatory Info */}
              <div className="space-y-2 text-xs">
                <div>
                  <p className="font-500 text-gray-700">Regulatory Clause:</p>
                  <p className="font-mono bg-white p-2 rounded border border-gray-200 mt-1">
                    {decision.circular} • {decision.clause}
                  </p>
                </div>
                <div>
                  <p className="font-500 text-gray-700">Official Quote:</p>
                  <p className="bg-white p-2 rounded border border-gray-200 mt-1 italic">
                    {decision.quote}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Statistics */}
      <div className="border-t border-[--color-rule] pt-6 mt-8">
        <h2 className="text-lg font-600 text-[--color-ink] mb-4">
          Coverage & Proof
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-center">
            <p className="text-2xl font-700 text-blue-600">8</p>
            <p className="text-xs text-blue-900 mt-1">Decision Codes</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-center">
            <p className="text-2xl font-700 text-green-600">1</p>
            <p className="text-xs text-green-900 mt-1">Allowed</p>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-center">
            <p className="text-2xl font-700 text-red-600">7</p>
            <p className="text-xs text-red-900 mt-1">Refusal Codes</p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-md text-center">
            <p className="text-2xl font-700 text-purple-600">2</p>
            <p className="text-xs text-purple-900 mt-1">NPCI Circulars</p>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-4 text-sm pt-4">
        <Link href="/app/checkout" className="text-blue-600 hover:underline">← Back to Checkout</Link>
        <Link href="/app" className="text-blue-600 hover:underline">Dashboard →</Link>
      </div>
    </div>
  );
}
