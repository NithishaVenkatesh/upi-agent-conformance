"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldX } from "lucide-react";
import type { GateDecision } from "@/lib/types";
import { Verdict } from "@/components/verdict";
import { Money } from "@/components/money";

const MOCK_TRANSACTIONS: Array<{
  id: string;
  timestamp: number;
  amount_minor: number;
  status: "ALLOWED" | "REFUSED" | "UNDETERMINED";
  decision: GateDecision;
  customer_id: string;
}> = [
  {
    id: "tx-1",
    timestamp: 1693565520000,
    amount_minor: 249900,
    status: "ALLOWED",
    decision: {
      allowed: true,
      code: "authorised",
      clause: "Issuer §3",
      circular: "NPCI/UPI/OC No.228",
      quote: "Issuer may set limits on UPI payment amounts within regulatory bounds.",
      detail: "Amount within limit",
    },
    customer_id: "cust_001",
  },
  {
    id: "tx-2",
    timestamp: 1693565460000,
    amount_minor: 389900,
    status: "REFUSED",
    decision: {
      allowed: false,
      code: "duplicate_block_for_merchant",
      clause: "Issuer §5",
      circular: "NPCI/UPI/OC No.228",
      quote: "No concurrent blocks from the same merchant to the same customer.",
      detail: "Duplicate block detected",
    },
    customer_id: "cust_002",
  },
  {
    id: "tx-3",
    timestamp: 1693565400000,
    amount_minor: 129900,
    status: "ALLOWED",
    decision: {
      allowed: true,
      code: "authorised",
      clause: "Issuer §3",
      circular: "NPCI/UPI/OC No.228",
      quote: "Issuer may set limits on UPI payment amounts within regulatory bounds.",
      detail: "Amount within limit",
    },
    customer_id: "cust_003",
  },
  {
    id: "tx-4",
    timestamp: 1693565340000,
    amount_minor: 500000,
    status: "ALLOWED",
    decision: {
      allowed: true,
      code: "authorised",
      clause: "Issuer §3",
      circular: "NPCI/UPI/OC No.228",
      quote: "Issuer may set limits on UPI payment amounts within regulatory bounds.",
      detail: "Amount within limit",
    },
    customer_id: "cust_004",
  },
  {
    id: "tx-5",
    timestamp: 1693565280000,
    amount_minor: 600000,
    status: "REFUSED",
    decision: {
      allowed: false,
      code: "insufficient_block_balance",
      clause: "Issuer §2",
      circular: "NPCI/UPI/OC No.228",
      quote: "Customer must maintain sufficient funds in the payment instrument.",
      detail: "Insufficient balance",
    },
    customer_id: "cust_005",
  },
];

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function SegmentedControl({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Array<{ label: string; value: string }> }) {
  return (
    <fieldset className="flex gap-1 p-1 bg-[--color-paper] rounded-[3px] inline-flex border-0">
      <legend className="sr-only">Filter transactions by verdict status</legend>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2.5 text-13px font-500 rounded-[2px] transition-all min-h-[40px] min-w-[80px] ${
            value === opt.value
              ? "bg-[--color-surface] text-[--color-ink] border border-[--color-rule] shadow-sm"
              : "text-[--color-ink-2] hover:text-[--color-ink] hover:bg-[--color-surface] hover:bg-opacity-50"
          }`}
          aria-pressed={value === opt.value}
          aria-label={`Show ${opt.label.toLowerCase()} transactions`}
        >
          {opt.label}
        </button>
      ))}
    </fieldset>
  );
}

function TransactionsTable({
  transactions,
  statusFilter,
}: {
  transactions: Array<{
    id: string;
    timestamp: number;
    amount_minor: number;
    status: "ALLOWED" | "REFUSED" | "UNDETERMINED";
    decision: GateDecision;
    customer_id: string;
  }>;
  statusFilter: string;
}) {
  const router = useRouter();
  const filtered = statusFilter === "all" ? transactions : transactions.filter((t) => t.status === statusFilter);

  const handleRowClick = (txId: string) => {
    router.push(`/app/transactions/${txId}`);
  };

  const handleRowKeyDown = (e: React.KeyboardEvent, txId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRowClick(txId);
    }
  };

  return (
    <div className="mx-10 my-8 overflow-x-auto">
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[--color-rule] text-[--color-ink-3]">
            <th className="text-left text-12px font-400 pb-3 py-3 px-3 w-16">Time</th>
            <th className="text-right text-12px font-400 pb-3 py-3 px-3 w-24">Amount</th>
            <th className="text-left text-12px font-400 pb-3 py-3 px-3 flex-1">Customer</th>
            <th className="text-left text-12px font-400 pb-3 py-3 px-3 w-40">Verdict</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((tx) => (
            <tr
              key={tx.id}
              onClick={() => handleRowClick(tx.id)}
              onKeyDown={(e) => handleRowKeyDown(e, tx.id)}
              role="button"
              tabIndex={0}
              aria-label={`Transaction ${formatTime(tx.timestamp)}, ${tx.customer_id}, verdict: ${tx.status}`}
              className="border-b border-[--color-rule-2] hover:bg-[--color-paper] focus-visible:outline-2 focus-visible:outline-[--color-ink] focus-visible:outline-offset-0 transition-colors cursor-pointer"
            >
              <td className="py-2 px-3">
                <span className="text-12px font-[--font-mono] text-[--color-ink-2] flex items-center min-h-[48px] whitespace-nowrap">
                  {formatTime(tx.timestamp)}
                </span>
              </td>
              <td className="py-2 px-3 text-right">
                <span className="text-13px font-500 tabular-nums text-[--color-ink] flex items-center justify-end min-h-[48px] whitespace-nowrap">
                  <Money minor={tx.amount_minor} />
                </span>
              </td>
              <td className="py-2 px-3">
                <span className="text-12px font-[--font-mono] text-[--color-ink] flex items-center min-h-[48px] truncate">
                  {tx.customer_id}
                </span>
              </td>
              <td className="py-2 px-3">
                <div className="flex items-center gap-2 min-h-[48px]">
                  <Verdict status={tx.status} />
                  {tx.status === "REFUSED" && (
                    <code className="text-11px font-[--font-mono] text-[--color-ink-2] whitespace-nowrap">{tx.decision.clause}</code>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div className="py-8 text-center text-13px text-[--color-ink-3]">
          No transactions with status "{statusFilter}"
        </div>
      )}
    </div>
  );
}

function transformLedgerToTransactions(ledgerEntries: any[]): typeof MOCK_TRANSACTIONS {
  return ledgerEntries.map((entry, idx) => {
    const payload = entry.payload || {};
    const amount = payload.amount || 0;
    const status = payload.status === "BLOCKED" ? "REFUSED" : "ALLOWED";

    return {
      id: `tx-${entry.seq || idx}`,
      timestamp: Date.now() - (idx * 60000),
      amount_minor: amount * 100,
      status: status as "ALLOWED" | "REFUSED" | "UNDETERMINED",
      decision: {
        allowed: status === "ALLOWED",
        code: status === "ALLOWED" ? "authorised" : "blocked",
        clause: payload.clause || "NPCI/UPI OC No.228",
        circular: "NPCI/UPI/OC No.228",
        quote: payload.reason || (status === "ALLOWED" ? "Within limits" : "Transaction blocked"),
        detail: payload.reason || "",
      },
      customer_id: payload.customer || `cust_${idx}`,
    };
  });
}

export default function TransactionsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [transactions, setTransactions] = useState<typeof MOCK_TRANSACTIONS>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

        const response = await fetch(`${apiBase}/api/ledger`, {
          method: "GET",
          signal: AbortSignal.timeout(15000)
        });

        if (response.ok) {
          const ledgerEntries = await response.json();
          setTransactions(transformLedgerToTransactions(ledgerEntries));
        } else {
          setTransactions(MOCK_TRANSACTIONS);
        }
      } catch (error) {
        setTransactions(MOCK_TRANSACTIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Allowed", value: "ALLOWED" },
    { label: "Refused", value: "REFUSED" },
    { label: "Undetermined", value: "UNDETERMINED" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[--color-paper]">
      <div className="mx-10 my-8 mb-12">
        <h1 className="text-xl font-600 text-[--color-ink] mb-6">All Transactions</h1>
        <div className="mb-4">
          <SegmentedControl value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
        </div>
        {loading ? (
          <div className="py-8 text-center text-13px text-[--color-ink-3]">Loading transactions...</div>
        ) : (
          <TransactionsTable transactions={transactions} statusFilter={statusFilter} />
        )}
      </div>
    </div>
  );
}
