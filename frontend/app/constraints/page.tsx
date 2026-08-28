/**
 * Constraints Comparison Page
 * Shows declared vs authoritative constraints side-by-side
 */

import { Suspense } from "react";
import { CONFORMANCE_COLORS } from "@/lib/constants";

// Demo constraints data
const DEMO_CONSTRAINTS = [
  {
    subject: "upi_reserve_pay_block_limit",
    declared: {
      value: 1000000,
      unit: "INR_paise",
      scope: "per_block",
      source: "merchant_profile",
      confidence: 1.0,
    },
    authoritative: {
      value: 1000000,
      unit: "INR_paise",
      scope: "per_block",
      circular: "NPCI/UPI/OC No.228",
      clause: "Issuer §5",
      quote: "The block created to be maximum of Rs.10,000 of block limit and up to 90 days.",
    },
    verdict: {
      result: "PASS" as const,
      code: "conformant",
      detail: "10000 within 10000 per_block",
    },
  },
  {
    subject: "upi_reserve_pay_block_validity",
    declared: {
      value: 90,
      unit: "days",
      scope: "per_block",
      source: "merchant_profile",
      confidence: 1.0,
    },
    authoritative: {
      value: 90,
      unit: "days",
      scope: "per_block",
      circular: "NPCI/UPI/OC No.228",
      clause: "Issuer §5",
      quote: "The block created to be maximum of Rs.10,000 of block limit and up to 90 days.",
    },
    verdict: {
      result: "PASS" as const,
      code: "conformant",
      detail: "90 days equals 90 days per_block",
    },
  },
  {
    subject: "block_is_payment_guarantee",
    declared: {
      value: false,
      unit: "predicate",
      scope: "per_block",
      source: "merchant_profile",
      confidence: 1.0,
    },
    authoritative: {
      value: false,
      unit: "predicate",
      scope: "per_block",
      circular: "NPCI/UPI/OC No.228",
      clause: "Acquirer §2",
      quote: "The block created shall not be treated as the guarantee of payment.",
    },
    verdict: {
      result: "PASS" as const,
      code: "conformant",
      detail: "False equals False",
    },
  },
];

function ConstraintCard({ constraint }: { constraint: (typeof DEMO_CONSTRAINTS)[0] }) {
  const verdictColor = CONFORMANCE_COLORS[constraint.verdict.result];
  const verdictIcon = constraint.verdict.result === "PASS" ? "✓" : "✗";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {constraint.subject.replace(/_/g, " ")}
        </h3>
        <div
          className="inline-block mt-2 px-3 py-1 rounded text-sm font-medium"
          style={{ color: verdictColor, backgroundColor: `${verdictColor}20` }}
        >
          {verdictIcon} {constraint.verdict.result}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Declared */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Your Declaration
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-slate-600 dark:text-slate-400">Value</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {typeof constraint.declared.value === "boolean"
                  ? constraint.declared.value.toString()
                  : constraint.declared.value}
              </p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">Unit</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {constraint.declared.unit}
              </p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">Scope</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {constraint.declared.scope}
              </p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">Confidence</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {Math.round(constraint.declared.confidence * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Authoritative */}
        <div className="space-y-4 border-l border-slate-200 dark:border-slate-700 pl-6">
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Regulatory Authority
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-slate-600 dark:text-slate-400">Value</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {typeof constraint.authoritative.value === "boolean"
                  ? constraint.authoritative.value.toString()
                  : constraint.authoritative.value}
              </p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">Unit</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {constraint.authoritative.unit}
              </p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">Source</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {constraint.authoritative.circular}
              </p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">Clause</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {constraint.authoritative.clause}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded p-4 border-l-4" style={{ borderColor: verdictColor }}>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Quote from Circular
        </p>
        <p className="text-sm text-slate-900 dark:text-white italic mt-2">
          "{constraint.authoritative.quote}"
        </p>
      </div>

      {/* Conformance Detail */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-4 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          {constraint.verdict.detail}
        </p>
      </div>
    </div>
  );
}

export default function ConstraintsPage() {
  const passedCount = DEMO_CONSTRAINTS.filter(
    (c) => c.verdict.result === "PASS"
  ).length;
  const totalCount = DEMO_CONSTRAINTS.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Constraints & Compliance
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          Verify your payment terms against regulatory authority. Each constraint is
          checked against NPCI and RBI circulars to ensure compliance.
        </p>
      </div>

      {/* Status Summary */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">
              ✓ COMPLIANT ({passedCount} of {totalCount} rules pass)
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
              Your payment terms match all applicable regulatory requirements
            </p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Download Report
          </button>
        </div>
      </div>

      {/* Constraints List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Constraint Details
        </h2>
        <Suspense fallback={<div className="h-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />}>
          <div className="space-y-6">
            {DEMO_CONSTRAINTS.map((constraint, idx) => (
              <ConstraintCard key={idx} constraint={constraint} />
            ))}
          </div>
        </Suspense>
      </div>

      {/* Sources */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Regulatory Sources
        </h3>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              NPCI/UPI/OC No.228
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Official circular from National Payments Corporation of India
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              Status: VERIFIED • Last updated: 2026-08-26
            </p>
          </div>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="font-medium text-slate-900 dark:text-white">
              RBI E-Mandate Master Direction
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Reserve Bank of India official directive
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              Status: VERIFIED • Last updated: 2026-08-26
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          View Rules
        </button>
        <button className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
