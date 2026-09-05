"use client";

import { CheckCircle2, AlertCircle, TrendingDown, Lock, Repeat2, Shield } from "lucide-react";
import { Cite } from "@/components/cite";

const DECISION_CODES = [
  {
    code: "authorised",
    title: "Authorised",
    clause: "Issuer §3",
    circular: "NPCI/UPI/OC No.228",
    description: "Transaction passes all compliance checks",
    quote: "Issuer may set limits on UPI payment amounts within regulatory bounds.",
    icon: CheckCircle2,
    allowed: true,
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
    allowed: false,
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
    allowed: false,
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
    allowed: false,
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
    allowed: false,
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
    allowed: false,
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
    allowed: false,
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
    allowed: false,
    real_example: "4th retry attempt within 24 hours",
  },
];

export default function ShowcasePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[--color-rule] pb-6">
        <h1 className="text-xl font-600 text-[--color-ink] mb-2">Decision Gallery</h1>
        <p className="text-sm text-[--color-ink-2]">
          All 8 decision codes with regulatory citations
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-[--color-undet-bg] border border-[--color-undet] rounded-[3px]">
        <p className="text-sm text-[--color-ink]">
          <strong>Why this matters:</strong> Every transaction decision is deterministic and cites its regulatory basis.
          This gallery shows all possible outcomes with their regulatory justifications from NPCI circulars.
        </p>
      </div>

      {/* Decision Cards Grid */}
      <div className="grid grid-cols-2 gap-6">
        {DECISION_CODES.map((decision) => {
          const Icon = decision.icon;

          return (
            <div
              key={decision.code}
              className={`border rounded-[3px] p-6 ${
                decision.allowed
                  ? "bg-[--color-pass-bg] border-[--color-pass]"
                  : "bg-[--color-fail-bg] border-[--color-fail]"
              }`}
            >
              {/* Header with Icon */}
              <div className="flex items-start gap-3 mb-4">
                <Icon
                  size={20}
                  className={decision.allowed ? "text-[--color-pass]" : "text-[--color-fail]"}
                />
                <div className="flex-1">
                  <h3 className={`font-600 text-13px ${
                    decision.allowed ? "text-[--color-pass]" : "text-[--color-fail]"
                  }`}>
                    {decision.title}
                  </h3>
                  <p className={`text-11px font-mono mt-1 ${
                    decision.allowed ? "text-[--color-pass]" : "text-[--color-fail]"
                  }`}>
                    {decision.code}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-12px text-[--color-ink] mb-4">
                {decision.description}
              </p>

              {/* Real Example */}
              <div className="mb-4 p-3 bg-[--color-surface] rounded-[3px] border border-[--color-rule]">
                <p className="text-11px font-500 text-[--color-ink-2]">Real Example:</p>
                <p className="text-11px text-[--color-ink] mt-1 font-mono">{decision.real_example}</p>
              </div>

              {/* Regulatory Info */}
              <div className="space-y-3 text-11px">
                <div>
                  <p className="font-500 text-[--color-ink-2]">Regulatory Clause:</p>
                  <Cite circular={decision.circular} clause={decision.clause} />
                </div>
                <div>
                  <p className="font-500 text-[--color-ink-2]">Official Quote:</p>
                  <p className="bg-[--color-surface] p-2 rounded-[3px] border border-[--color-rule] mt-1 italic text-[--color-ink]">
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
        <h2 className="text-13px font-600 text-[--color-ink] uppercase tracking-wide mb-4">
          Coverage & Proof
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-[--color-undet-bg] border border-[--color-undet] rounded-[3px] text-center">
            <p className="text-20px font-700 text-[--color-undet]">8</p>
            <p className="text-11px text-[--color-ink] mt-1">Decision Codes</p>
          </div>
          <div className="p-4 bg-[--color-pass-bg] border border-[--color-pass] rounded-[3px] text-center">
            <p className="text-20px font-700 text-[--color-pass]">1</p>
            <p className="text-11px text-[--color-ink] mt-1">Allowed</p>
          </div>
          <div className="p-4 bg-[--color-fail-bg] border border-[--color-fail] rounded-[3px] text-center">
            <p className="text-20px font-700 text-[--color-fail]">7</p>
            <p className="text-11px text-[--color-ink] mt-1">Refusal Codes</p>
          </div>
          <div className="p-4 bg-[--color-surface-2] border border-[--color-rule] rounded-[3px] text-center">
            <p className="text-20px font-700 text-[--color-ink]">2</p>
            <p className="text-11px text-[--color-ink-2] mt-1">NPCI Circulars</p>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-[--color-rule] pt-6 text-sm">
        <a href="/app" className="text-[--color-ink] hover:text-[--color-pass]">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
