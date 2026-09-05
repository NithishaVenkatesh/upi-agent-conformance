"use client";

import { Verdict } from "@/components/verdict";
import { Cite } from "@/components/cite";
import { Money } from "@/components/money";

const CONSTRAINTS_DATA = [
  {
    id: "txn-limit",
    label: "Transaction Limit",
    declared: { value: 100000, unit: "paise" },
    authoritative: { value: 50000, unit: "paise" },
    clause: "Issuer §3",
    circular: "NPCI/UPI/OC No.228",
    verdict: "REFUSED" as const,
  },
  {
    id: "monthly-ceiling",
    label: "Monthly Ceiling",
    declared: { value: 1500000, unit: "paise" },
    authoritative: { value: 500000, unit: "paise" },
    clause: "Issuer §4",
    circular: "NPCI/UPI/OC No.228",
    verdict: "REFUSED" as const,
  },
  {
    id: "kyc-status",
    label: "KYC Status Required",
    declared: { value: "yes", unit: "boolean" },
    authoritative: { value: "yes", unit: "boolean" },
    clause: "Acquirer §2",
    circular: "NPCI/UPI/OC No.228",
    verdict: "ALLOWED" as const,
  },
  {
    id: "merchant-category",
    label: "Merchant Category",
    declared: { value: "all", unit: "text" },
    authoritative: { value: "E-commerce only", unit: "text" },
    clause: "Issuer §5",
    circular: "NPCI/UPI/OC No.228",
    verdict: "REFUSED" as const,
  },
];

const OC201_CASE = {
  label: "OC-201 §7 Scope Case",
  description: "Two bounds in one sentence",
  monthlyBound: 1500000,
  transactionBound: 50000,
  detail: "Naive regex baseline returns wrong bound",
};

export default function Constraints() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[--color-rule] pb-6">
        <h1 className="text-xl font-600 text-[--color-ink] mb-2">
          Constraint Comparison
        </h1>
        <p className="text-sm text-[--color-ink-2]">
          Declared vs. Authoritative compliance rules
        </p>
      </div>

      {/* OC-201 §7 Callout */}
      <div className="border-l-2 border-[--color-fail] pl-4 py-4 bg-[--color-fail-bg] rounded-r">
        <div className="text-sm font-600 text-[--color-fail] mb-2">
          {OC201_CASE.label}
        </div>
        <div className="text-sm text-[--color-ink] mb-3">
          {OC201_CASE.description}: ₹15,000/month vs. ₹500/transaction
        </div>
        <p className="text-xs text-[--color-ink-2]">
          {OC201_CASE.detail}
        </p>
      </div>

      {/* Constraints Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[--color-rule]">
              <th className="text-left py-3 px-0 text-xs font-500 text-[--color-ink-3] w-32">
                Constraint
              </th>
              <th className="text-left py-3 px-4 text-xs font-500 text-[--color-ink-3] flex-1">
                Declared
              </th>
              <th className="text-left py-3 px-4 text-xs font-500 text-[--color-ink-3] flex-1">
                Authoritative
              </th>
              <th className="text-center py-3 px-4 text-xs font-500 text-[--color-ink-3] w-24">
                Verdict
              </th>
            </tr>
          </thead>
          <tbody>
            {CONSTRAINTS_DATA.map((constraint) => {
              const isViolated = constraint.verdict === "REFUSED";
              return (
                <tr
                  key={constraint.id}
                  className="border-b border-[--color-rule-2] hover:bg-[--color-paper] transition-colors"
                >
                  <td className="py-4 px-0">
                    <div className="text-sm font-500 text-[--color-ink] mb-1">
                      {constraint.label}
                    </div>
                    <Cite
                      circular={constraint.circular}
                      clause={constraint.clause}
                    />
                  </td>

                  <td
                    className={`py-4 px-4 ${
                      isViolated ? "bg-[--color-fail-bg]" : ""
                    }`}
                  >
                    <div className="text-sm font-500 text-[--color-ink]">
                      {constraint.declared.unit === "paise" ? (
                        <Money minor={constraint.declared.value as number} />
                      ) : (
                        constraint.declared.value
                      )}
                    </div>
                    <div className="text-xs text-[--color-ink-3]">
                      {constraint.declared.unit}
                    </div>
                  </td>

                  <td
                    className={`py-4 px-4 ${
                      isViolated ? "bg-[--color-fail-bg]" : ""
                    }`}
                  >
                    <div className="text-sm font-500 text-[--color-ink]">
                      {constraint.authoritative.unit === "paise" ? (
                        <Money minor={constraint.authoritative.value as number} />
                      ) : (
                        constraint.authoritative.value
                      )}
                    </div>
                    <div className="text-xs text-[--color-ink-3]">
                      {constraint.authoritative.unit}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <Verdict status={constraint.verdict} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="border-t border-[--color-rule] pt-6 text-xs text-[--color-ink-3] space-y-1">
        <p>
          <strong>Declared:</strong> Merchant claims in their terms
        </p>
        <p>
          <strong>Authoritative:</strong> NPCI/RBI regulatory bounds
        </p>
        <p>
          <strong>Verdict:</strong> Compliance status (only offending cells highlighted)
        </p>
      </div>
    </div>
  );
}
