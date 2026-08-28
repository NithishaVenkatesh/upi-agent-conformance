/**
 * Demo Mode Page
 * Interactive demo scenarios and feature showcase
 */

import { Suspense } from "react";

const DEMO_SCENARIOS = [
  {
    id: "scenario_1",
    title: "Compliant Payment",
    description: "Payment within all regulatory limits - approved immediately",
    icon: "✓",
    color: "green",
    steps: [
      "User initiates 2,499 INR payment",
      "System extracts merchant constraints",
      "Conformance check: PASS (amount within 10,000 limit)",
      "Authority gate: ALLOWED (no violations)",
      "Payment captured & ledger verified",
    ],
  },
  {
    id: "scenario_2",
    title: "Violation Detected",
    description: "Payment exceeds authority limit - rejected with citation",
    icon: "✗",
    color: "red",
    steps: [
      "User initiates 15,000 INR payment",
      "System extracts constraints",
      "Conformance check: FAIL (exceeds 10,000 limit)",
      "Authority gate: REFUSED",
      "Citation shown: NPCI/UPI/OC No.228 Issuer 5",
    ],
  },
  {
    id: "scenario_3",
    title: "Low Confidence",
    description: "Unable to confidently verify constraints - marked UNDETERMINED",
    icon: "?",
    color: "orange",
    steps: [
      "User initiates payment",
      "Extraction confidence: 0.55 < 0.60 threshold",
      "Conformance check: UNDETERMINED",
      "Requires manual review",
      "Decision deferred pending merchant response",
    ],
  },
  {
    id: "scenario_4",
    title: "Block Expiry",
    description: "Payment block has expired - new block needed",
    icon: "⏰",
    color: "blue",
    steps: [
      "User attempts payment after 90 days",
      "Block expiry check: FAILED",
      "System requests new payment block",
      "Merchant can reauthorize",
      "Payment processing resumes",
    ],
  },
];

function ScenarioCard({
  scenario,
}: {
  scenario: (typeof DEMO_SCENARIOS)[0];
}) {
  const colorMap = {
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      icon: "text-green-600 dark:text-green-400",
      heading: "text-green-900 dark:text-green-100",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      heading: "text-red-900 dark:text-red-100",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800",
      icon: "text-orange-600 dark:text-orange-400",
      heading: "text-orange-900 dark:text-orange-100",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      heading: "text-blue-900 dark:text-blue-100",
    },
  };

  const colors = colorMap[scenario.color as keyof typeof colorMap];

  return (
    <div className={`rounded-lg border ${colors.bg} ${colors.border} p-6`}>
      <div className="flex items-start gap-4">
        <div className={`text-3xl ${colors.icon}`}>{scenario.icon}</div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${colors.heading}`}>
            {scenario.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {scenario.description}
          </p>

          {/* Steps */}
          <details className="mt-4 group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:underline">
              Show steps →
            </summary>
            <ol className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {scenario.steps.map((step, idx) => (
                <li key={idx} className="ml-4">
                  {idx + 1}. {step}
                </li>
              ))}
            </ol>
          </details>
        </div>
      </div>
    </div>
  );
}

export default function DemoModePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Demo Mode
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          Explore key payment scenarios and how the system handles compliance
          verification across different regulatory cases.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-lg border border-blue-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          🎯 Key Features Demonstrated
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              Progressive Disclosure
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Details revealed on demand, reducing cognitive load
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              Cryptographic Verification
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Hash-chained immutable ledger detects any tampering
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              Regulatory Citations
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Every decision backed by RBI/NPCI circular reference
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              Constraint Comparison
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Side-by-side merchant vs regulatory authority view
            </p>
          </div>
        </div>
      </div>

      {/* Scenarios */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Payment Scenarios
        </h2>
        <Suspense fallback={<div className="h-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />}>
          <div className="space-y-4">
            {DEMO_SCENARIOS.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </Suspense>
      </div>

      {/* Test Data */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          📊 Pre-loaded Test Data
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              Dashboard Transactions
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              5 entries
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              Constraints
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              3 constraints (all PASS)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              Ledger Entries
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              5 events (all verified)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              Merchants
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              3 test merchants
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          🚀 How to Use Demo Mode
        </h3>
        <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <span className="font-medium">1. Dashboard:</span> View 5 sample
            transactions showing all payment statuses
          </li>
          <li>
            <span className="font-medium">2. Constraints:</span> See how your
            payment terms compare to regulatory requirements
          </li>
          <li>
            <span className="font-medium">3. Transaction Details:</span> Click
            any transaction to see the complete payment flow
          </li>
          <li>
            <span className="font-medium">4. Audit Ledger:</span> Explore the
            immutable ledger with hash chain verification
          </li>
          <li>
            <span className="font-medium">5. This Page:</span> Review scenarios
            and understand system behavior
          </li>
        </ol>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          View Dashboard
        </button>
        <button className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium">
          Explore Constraints
        </button>
      </div>
    </div>
  );
}
