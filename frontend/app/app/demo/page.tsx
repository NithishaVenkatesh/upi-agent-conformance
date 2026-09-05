"use client";

import { useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";

const DEMO_SCENARIOS = [
  {
    id: "scenario-1",
    title: "Compliant Payment",
    description: "Transaction passes all compliance checks",
    transactionId: "tx-1",
  },
  {
    id: "scenario-2",
    title: "Violation Detected",
    description: "Merchant attempts duplicate block (violates Issuer §5)",
    transactionId: "tx-2",
  },
  {
    id: "scenario-3",
    title: "Insufficient Balance",
    description: "Customer lacks funds (violates Issuer §2)",
    transactionId: "tx-5",
  },
  {
    id: "scenario-4",
    title: "Category Mismatch",
    description: "Merchant category exceeds authorization (violates Acquirer §2)",
    transactionId: "tx-3",
  },
];

export default function Demo() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[--color-rule] pb-6">
        <h1 className="text-xl font-600 text-[--color-ink] mb-2">
          Demo Scenarios
        </h1>
        <p className="text-sm text-[--color-ink-2]">
          Interactive payment gate decision flows
        </p>
      </div>

      {/* Scenarios Grid */}
      <div className="space-y-3">
        {DEMO_SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            className="border border-[--color-rule] bg-[--color-surface] rounded p-6 hover:border-[--color-ink] transition-colors cursor-pointer"
            onClick={() => setSelectedScenario(scenario.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-base font-600 text-[--color-ink] mb-1">
                  {scenario.title}
                </h3>
                <p className="text-sm text-[--color-ink-2]">
                  {scenario.description}
                </p>
              </div>
              <Link
                href={`/app/transactions/${scenario.transactionId}`}
                className="flex items-center gap-2 px-4 py-2 bg-[--color-ink] text-[--color-paper] rounded text-sm font-500 hover:bg-[#14313A] hover:text-white transition-colors flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
                data-testid={`demo-scenario-${scenario.id}`}
              >
                <Play className="w-4 h-4" />
                Run
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="border-t border-[--color-rule] pt-6 text-sm text-[--color-ink-3] space-y-2">
        <p>
          <strong>Click "Run"</strong> to navigate to the transaction detail view with the gate flow animation
        </p>
        <p>
          Each scenario demonstrates how the payment gate handles different compliance scenarios, with evidence blocks showing the regulatory clause and decision rationale.
        </p>
      </div>
    </div>
  );
}
