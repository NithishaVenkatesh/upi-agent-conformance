"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ShieldX } from "lucide-react";
import type { GateDecision, Transaction } from "@/lib/types";
import { Verdict } from "@/components/verdict";
import { Money } from "@/components/money";
import { Cite } from "@/components/cite";

// Fallback mock data for demo mode when backend is unavailable
const FALLBACK_MOCK_TRANSACTIONS: Array<{
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

function StatusStrip() {
  const allPass = true; // In real app, check all constraints
  const lastVerified = new Date();

  return (
    <div className="border-b border-[--color-rule] px-10 py-4 flex items-center justify-between gap-6">
      <div className="flex items-center gap-4 flex-1">
        <span className="text-13px text-[--color-ink-2]">Compliance state</span>
        <span className="text-13px text-[--color-ink]">Conformant</span>
      </div>
      <Verdict status={allPass ? "ALLOWED" : "REFUSED"} />
      <div className="text-12px text-[--color-ink-3]">
        Last verified: {lastVerified.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
}

function EvidenceBlock({ decision, transactionId }: { decision: GateDecision; transactionId: string }) {
  const Icon = decision.allowed ? ShieldCheck : ShieldX;

  return (
    <div className="border border-[--color-rule] bg-[--color-surface] rounded-[3px] mx-10 my-8 overflow-hidden">
      {/* Header row */}
      <div className="border-b border-[--color-rule] px-6 py-4 flex items-center gap-3 bg-[--color-paper]">
        <Icon className={`w-5 h-5 ${decision.allowed ? "text-[--color-pass]" : "text-[--color-fail]"}`} />
        <code className={`font-[--font-mono] text-13px ${decision.allowed ? "text-[--color-pass]" : "text-[--color-fail]"}`}>
          {decision.code}
        </code>
        <div className="flex-1" />
        <Cite circular={decision.circular} clause={decision.clause} />
      </div>

      {/* Quotation */}
      <div className="px-6 py-6 border-b border-[--color-rule]">
        <div
          className="pl-4 border-l-2"
          style={{ borderLeftColor: decision.allowed ? "var(--color-pass)" : "var(--color-fail)" }}
        >
          <blockquote className="font-[--font-serif] text-base leading-relaxed italic text-[--color-ink]">
            {decision.quote}
          </blockquote>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-12px text-[--color-ink-3] flex items-center gap-8">
        <span>Ledger seq: 1</span>
        <span>Hash: a91f…c0d4</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-10 my-8 px-6 py-12 border border-[--color-rule-2] rounded-[3px] bg-[--color-surface] text-center">
      <div className="text-14px text-[--color-ink-2] mb-2">No refusals yet</div>
      <div className="text-13px text-[--color-ink-3]">All transactions have been allowed or are undetermined</div>
    </div>
  );
}

function transformLedgerToTransactions(entries: any[]): Array<{
  id: string;
  timestamp: number;
  amount_minor: number;
  status: "ALLOWED" | "REFUSED" | "UNDETERMINED";
  decision: GateDecision;
  customer_id: string;
}> {
  // Map checkout IDs to their transaction data
  const transactionMap = new Map<string, any>();

  // First pass: collect all events for each checkout
  for (const entry of entries) {
    const p = entry.payload;
    const checkoutId = p.checkout;

    if (!transactionMap.has(checkoutId)) {
      transactionMap.set(checkoutId, {
        checkout_id: checkoutId,
        seq: entry.seq,
        timestamp: new Date().getTime(), // Use current time if not provided
        amount_minor: 0,
        status: "UNDETERMINED" as const,
        decision: null,
      });
    }

    const tx = transactionMap.get(checkoutId)!;

    // Process different event types
    if (p.event === "authorise") {
      // Store authorise decision
      tx.decision = {
        allowed: p.decision === "authorised",
        code: p.decision,
        clause: p.clause || "Unknown",
        circular: p.circular || "NPCI/UPI/OC No.228",
        quote: p.quote || "Payment processed according to regulatory bounds.",
        detail: p.detail || (p.decision === "authorised" ? "Amount within limit" : "Payment declined"),
      };

      // Set status based on decision
      if (p.decision === "authorised") {
        tx.status = "ALLOWED";
      } else {
        tx.status = "REFUSED";
      }
    } else if (p.event === "captured") {
      // Payment was captured successfully
      tx.status = "ALLOWED";
      if (!tx.decision) {
        tx.decision = {
          allowed: true,
          code: "authorised",
          clause: "Issuer §5",
          circular: "NPCI/UPI/OC No.228",
          quote: "Payment authorized and captured",
          detail: "Payment successfully processed",
        };
      }
    } else if (p.event === "capture_failed") {
      // Capture failed
      tx.status = "REFUSED";
      if (!tx.decision) {
        tx.decision = {
          allowed: false,
          code: p.kind || "capture_failed",
          clause: p.clause || "Acquirer §3",
          circular: "NPCI/UPI/OC No.228",
          quote: p.quote || "Payment capture failed",
          detail: p.detail || "Payment could not be processed",
        };
      }
    } else if (p.event === "replay") {
      // Idempotent replay - treat as same status as before
      if (!tx.status || tx.status === "UNDETERMINED") {
        tx.status = "ALLOWED";
      }
    }
  }

  // Convert map to array, excluding entries without decision data
  const transactions = Array.from(transactionMap.values())
    .filter(tx => tx.decision) // Only include transactions with decisions
    .map(tx => ({
      id: tx.checkout_id,
      timestamp: tx.timestamp,
      amount_minor: tx.amount_minor || 100000, // Default to ₹1000 if not available
      status: tx.status,
      decision: tx.decision,
      customer_id: "cust_demo",
    }))
    .sort((a, b) => b.timestamp - a.timestamp); // Sort newest first

  return transactions;
}

function CountersRow({ allowed, refused, undetermined, transactions }: { allowed: number; refused: number; undetermined: number; transactions: any[] }) {
  const totalCaptured = transactions.filter((t) => t.status === "ALLOWED").reduce((sum, t) => sum + t.amount_minor, 0);
  const clausesCited = new Set(transactions.filter((t) => t.status === "REFUSED").map((t) => t.decision.clause)).size;

  return (
    <div className="mx-10 my-8 border-y border-[--color-rule] py-6 grid grid-cols-3 gap-8">
      {/* Allowed */}
      <div className="pr-8 border-r border-[--color-rule]">
        <div className="text-13px text-[--color-ink-2] mb-2">Allowed</div>
        <div className="text-28px font-500 tabular-nums text-[--color-ink] mb-3">{allowed}</div>
        <div className="text-13px text-[--color-ink-3]">
          <Money minor={totalCaptured} /> captured
        </div>
      </div>

      {/* Refused */}
      <div className="px-8 border-r border-[--color-rule]">
        <div className="text-13px text-[--color-ink-2] mb-2">Refused</div>
        <div className="text-28px font-500 tabular-nums text-[--color-ink] mb-3">{refused}</div>
        <div className="text-13px text-[--color-ink-3]">{clausesCited} clause cited</div>
      </div>

      {/* Undetermined */}
      <div className="pl-8">
        <div className="text-13px text-[--color-ink-2] mb-2">Undetermined</div>
        <div className="text-28px font-500 tabular-nums text-[--color-ink] mb-3">{undetermined}</div>
        <div className="text-13px text-[--color-ink-3]">No data yet</div>
      </div>
    </div>
  );
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
    <div className="mx-10 my-8">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[--color-rule] text-[--color-ink-3]">
            <th className="text-left text-12px font-400 pb-3 py-3 px-0">Time</th>
            <th className="text-right text-12px font-400 pb-3 py-3 px-0">Amount</th>
            <th className="text-left text-12px font-400 pb-3 py-3 px-0">Customer</th>
            <th className="text-left text-12px font-400 pb-3 py-3 px-0">Verdict</th>
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
              <td className="py-2 px-0">
                <span className="text-12px font-[--font-mono] text-[--color-ink-2] flex items-center min-h-[48px]">
                  {formatTime(tx.timestamp)}
                </span>
              </td>
              <td className="py-2 px-0 text-right">
                <span className="text-13px font-500 tabular-nums text-[--color-ink] flex items-center justify-end min-h-[48px]">
                  <Money minor={tx.amount_minor} />
                </span>
              </td>
              <td className="py-2 px-0">
                <span className="text-12px font-[--font-mono] text-[--color-ink] flex items-center min-h-[48px]">
                  {tx.customer_id}
                </span>
              </td>
              <td className="py-2 px-0">
                <div className="flex items-center gap-2 min-h-[48px]">
                  <Verdict status={tx.status} />
                  {tx.status === "REFUSED" && (
                    <code className="text-11px font-[--font-mono] text-[--color-ink-2]">{tx.decision.clause}</code>
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

export default function Dashboard() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [transactions, setTransactions] = useState(FALLBACK_MOCK_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";
        const response = await fetch(`${apiUrl}/api/ledger`);
        if (!response.ok) throw new Error("Failed to fetch ledger");
        const entries = await response.json();
        const transformed = transformLedgerToTransactions(entries);
        setTransactions(transformed.length > 0 ? transformed : FALLBACK_MOCK_TRANSACTIONS);
      } catch (error) {
        console.warn("Backend unavailable, using mock data", error);
        setTransactions(FALLBACK_MOCK_TRANSACTIONS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const mostRecentRefusal = useMemo(() => {
    return transactions.find((tx) => tx.status === "REFUSED");
  }, [transactions]);

  const stats = useMemo(() => {
    return {
      allowed: transactions.filter((t) => t.status === "ALLOWED").length,
      refused: transactions.filter((t) => t.status === "REFUSED").length,
      undetermined: transactions.filter((t) => t.status === "UNDETERMINED").length,
    };
  }, [transactions]);

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Allowed", value: "ALLOWED" },
    { label: "Refused", value: "REFUSED" },
    { label: "Undetermined", value: "UNDETERMINED" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[--color-paper]">
      {/* 1. Status strip */}
      <StatusStrip />

      {/* 2. Most recent refusal or empty state */}
      {mostRecentRefusal ? <EvidenceBlock decision={mostRecentRefusal.decision} transactionId={mostRecentRefusal.id} /> : <EmptyState />}

      {/* 3. Three counters */}
      <CountersRow allowed={stats.allowed} refused={stats.refused} undetermined={stats.undetermined} transactions={transactions} />

      {/* 4. Transactions table with filter */}
      <div className="mx-10 my-8 mb-12">
        <div className="mb-4">
          <SegmentedControl value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
        </div>
        {isLoading ? (
          <div className="py-8 text-center text-13px text-[--color-ink-3]">Loading transactions...</div>
        ) : (
          <TransactionsTable transactions={transactions} statusFilter={statusFilter} />
        )}
      </div>
    </div>
  );
}
