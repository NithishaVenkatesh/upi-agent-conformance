/**
 * Transaction Detail Page
 * Shows complete story: what was checked, why it passed/failed, proof in ledger
 */

import { Suspense } from "react";
import { STATUS_COLORS, STATUS_TEXT } from "@/lib/constants";

// Mock data - in Phase 5 will be fetched from API
const DEMO_TRANSACTION = {
  id: "cs_abc123def456",
  timestamp: "2026-08-28 14:32:15",
  checkout: {
    id: "cs_abc123def456",
    items: [{ id: "sku1", qty: 1, name: "Cotton tote" }],
    total_minor: 249900,
    currency: "INR",
  },
  block: {
    max_minor: 1000000,
    remaining_minor: 750100,
    created_ts: 1725110000,
    expires_ts: 1727788400,
    merchant_id: "demo",
    customer_id: "cust_001",
  },
  status: "ALLOWED" as const,
  decision: {
    allowed: true,
    code: "authorised",
    clause: "Issuer §5",
    quote: "The block created to be maximum of Rs.10,000 of block limit and up to 90 days.",
    circular: "NPCI/UPI/OC No.228",
    detail: "₹2,499 within ₹7,501 remaining",
  },
  conformanceVerdict: {
    result: "PASS" as const,
    code: "conformant",
    detail: "₹10,000 within ₹10,000 per_block",
    circular: "NPCI/UPI/OC No.228",
    clause: "Issuer §5",
    quote: "The block created to be maximum of Rs.10,000...",
    source: "merchant_profile",
  },
  ledgerEntry: {
    seq: 42,
    prev_hash: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
    payload: {
      event: "captured",
      checkout: "cs_abc123def456",
      order_id: "order_fake_000042",
    },
    hash: "f3e8d9a2c1b4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
  },
};

// Payment flow diagram
function PaymentFlowDiagram({
  status,
}: {
  status: "ALLOWED" | "REFUSED" | "UNDETERMINED";
}) {
  const stages = [
    { name: "Checkout", icon: "🛒", status: "complete" },
    { name: "Extract", icon: "📄", status: "complete" },
    { name: "Conform", icon: "✓", status: "complete" },
    {
      name: "Gate",
      icon: status === "ALLOWED" ? "✓" : "✗",
      status: status === "ALLOWED" ? "complete" : "failed",
    },
    { name: "Ledger", icon: "📝", status: "complete" },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
        Payment Flow
      </h3>
      <div className="flex items-center justify-between">
        {stages.map((stage, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold mb-2 ${
                stage.status === "complete"
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                  : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
              }`}
            >
              {stage.icon}
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center">
              {stage.name}
            </p>
            {idx < stages.length - 1 && (
              <div className="hidden sm:block absolute w-12 h-0.5 bg-green-400 dark:bg-green-600 ml-16 -mt-14"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Gate decision card - prominent display
function GateDecisionCard({
  decision,
  status,
}: {
  decision: typeof DEMO_TRANSACTION.decision;
  status: "ALLOWED" | "REFUSED" | "UNDETERMINED";
}) {
  const isAllowed = status === "ALLOWED";
  const bgColor = isAllowed
    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";

  const textColor = isAllowed
    ? "text-green-900 dark:text-green-100"
    : "text-red-900 dark:text-red-100";

  return (
    <div
      className={`${bgColor} rounded-lg border-2 p-8 space-y-6`}
    >
      <div>
        <p className={`text-sm font-semibold ${textColor} uppercase tracking-wider`}>
          {STATUS_TEXT[status]}
        </p>
        <p className={`text-3xl font-bold mt-2 ${textColor}`}>
          {decision.code.split("_").join(" ")}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Regulatory Authority
          </p>
          <p className={`text-sm font-semibold ${textColor} mt-1`}>
            {decision.circular} {decision.clause}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Quote from Circular
          </p>
          <p className={`text-sm italic ${textColor} mt-1`}>
            "{decision.quote}"
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Reason
          </p>
          <p className={`text-sm ${textColor} mt-1`}>{decision.detail}</p>
        </div>

        {!isAllowed && (
          <div className="pt-4 border-t border-current border-opacity-20">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              What to Do
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Review the regulatory requirement and adjust your payment terms to comply.
              Contact support if you need clarification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Expandable section
function ExpandableSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
      open={defaultOpen}
    >
      <summary className="px-6 py-4 cursor-pointer font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
        <span className="inline-block transition-transform group-open:rotate-180">
          ▼
        </span>
        {" " + title}
      </summary>
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
        {children}
      </div>
    </details>
  );
}

// Conformance check details
function ConformanceCheckDetails({
  verdict,
}: {
  verdict: typeof DEMO_TRANSACTION.conformanceVerdict;
}) {
  const resultColor =
    verdict.result === "PASS"
      ? "text-green-600 dark:text-green-400"
      : verdict.result === "FAIL"
        ? "text-red-600 dark:text-red-400"
        : "text-orange-600 dark:text-orange-400";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Result</p>
          <p className={`text-lg font-semibold ${resultColor}`}>
            {verdict.result}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Code</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {verdict.code}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Circular & Clause
        </p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
          {verdict.circular} {verdict.clause}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Quote
        </p>
        <p className="text-sm text-slate-900 dark:text-white mt-1 italic">
          "{verdict.quote}"
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Detail
        </p>
        <p className="text-sm text-slate-900 dark:text-white mt-1">
          {verdict.detail}
        </p>
      </div>
    </div>
  );
}

// Ledger entry details
function LedgerEntryDetails({
  entry,
}: {
  entry: typeof DEMO_TRANSACTION.ledgerEntry;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Sequence</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            #{entry.seq}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Event</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {entry.payload.event}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Hash (SHA-256)
        </p>
        <div className="flex gap-2 mt-1">
          <code className="flex-1 bg-slate-100 dark:bg-slate-900 p-2 rounded text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
            {entry.hash}
          </code>
          <button className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-600">
            Copy
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Previous Hash
        </p>
        <code className="block bg-slate-100 dark:bg-slate-900 p-2 rounded text-xs font-mono text-slate-700 dark:text-slate-300 break-all mt-1">
          {entry.prev_hash}
        </code>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            VERIFIED
          </p>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
          Hash chain intact, genesis anchor valid
        </p>
      </div>
    </div>
  );
}

export default function TransactionDetail({
  params,
}: {
  params: { id: string };
}) {
  const txn = DEMO_TRANSACTION;
  const isAllowed = txn.status === "ALLOWED";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Transaction ID: {txn.id}
          </p>
          <div className="flex items-center justify-between mt-4">
            <div>
              <p
                className="text-2xl font-bold"
                style={{ color: STATUS_COLORS[txn.status] }}
              >
                {STATUS_TEXT[txn.status]}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {txn.timestamp}
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Download Evidence
            </button>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">
            Amount
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹2,499
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">
            Merchant
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            demo
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">
            Customer
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            cust_001
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">
            Remaining
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹7,501
          </p>
        </div>
      </div>

      {/* Payment Flow */}
      <Suspense fallback={<div className="h-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />}>
        <PaymentFlowDiagram status={txn.status} />
      </Suspense>

      {/* Gate Decision */}
      <Suspense fallback={<div className="h-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />}>
        <GateDecisionCard decision={txn.decision} status={txn.status} />
      </Suspense>

      {/* Expandable Details */}
      <div className="space-y-4">
        <ExpandableSection title="Conformance Check Details">
          <ConformanceCheckDetails verdict={txn.conformanceVerdict} />
        </ExpandableSection>

        <ExpandableSection title="Block Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Max Amount
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  ₹10,000
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Validity
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  90 days
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Merchant ID
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  demo
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Customer ID
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  cust_001
                </p>
              </div>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection title="Ledger Entry & Verification">
          <LedgerEntryDetails entry={txn.ledgerEntry} />
        </ExpandableSection>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          View Full Rule
        </button>
        <button className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium">
          Back to Transactions
        </button>
      </div>
    </div>
  );
}
