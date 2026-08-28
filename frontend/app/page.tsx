/**
 * Dashboard Page
 * Entry point showing overview, metrics, recent transactions
 */

import { Suspense } from "react";
import { STATUS_COLORS, STATUS_TEXT } from "@/lib/constants";

// Skeleton component for loading state
function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-slate-200 dark:bg-slate-700 rounded-lg h-32 animate-pulse"
        />
      ))}
    </div>
  );
}

function TransactionTableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-slate-200 dark:bg-slate-700 rounded h-12 animate-pulse"
        />
      ))}
    </div>
  );
}

// Metrics card component
function MetricCard({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status: "ALLOWED" | "REFUSED" | "UNDETERMINED" | "total";
}) {
  const getStatusIcon = (s: string) => {
    switch (s) {
      case "ALLOWED":
        return "✓";
      case "REFUSED":
        return "✗";
      case "UNDETERMINED":
        return "?";
      default:
        return "";
    }
  };

  const getColor = (s: string) => {
    switch (s) {
      case "ALLOWED":
        return "text-green-600 dark:text-green-400";
      case "REFUSED":
        return "text-red-600 dark:text-red-400";
      case "UNDETERMINED":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${getColor(status)}`}>
            {getStatusIcon(status)} {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// Transaction row component
function TransactionRow({
  timestamp,
  amount,
  merchant,
  customer,
  status,
}: {
  timestamp: string;
  amount: string;
  merchant: string;
  customer: string;
  status: "ALLOWED" | "REFUSED" | "UNDETERMINED";
}) {
  const statusColor = STATUS_COLORS[status];
  const statusText = STATUS_TEXT[status];

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
      <div className="grid grid-cols-6 gap-4 items-center">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {timestamp}
        </div>
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {amount}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {merchant}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {customer}
        </div>
        <div
          className="text-sm font-medium"
          style={{ color: statusColor }}
        >
          {statusText}
        </div>
        <div className="text-right">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

// Demo data
const DEMO_TRANSACTIONS = [
  {
    id: 1,
    timestamp: "2026-08-28 14:32",
    amount: "₹2,499",
    merchant: "demo",
    customer: "cust_001",
    status: "ALLOWED" as const,
  },
  {
    id: 2,
    timestamp: "2026-08-28 14:28",
    amount: "₹3,899",
    merchant: "demo",
    customer: "cust_001",
    status: "REFUSED" as const,
  },
  {
    id: 3,
    timestamp: "2026-08-28 14:25",
    amount: "₹1,299",
    merchant: "demo",
    customer: "cust_002",
    status: "ALLOWED" as const,
  },
  {
    id: 4,
    timestamp: "2026-08-28 14:20",
    amount: "₹5,000",
    merchant: "demo",
    customer: "cust_003",
    status: "ALLOWED" as const,
  },
  {
    id: 5,
    timestamp: "2026-08-28 14:15",
    amount: "₹6,000",
    merchant: "demo",
    customer: "cust_003",
    status: "UNDETERMINED" as const,
  },
];

export default function Dashboard() {
  const totalTransactions = DEMO_TRANSACTIONS.length;
  const passed = DEMO_TRANSACTIONS.filter(
    (t) => t.status === "ALLOWED"
  ).length;
  const refused = DEMO_TRANSACTIONS.filter(
    (t) => t.status === "REFUSED"
  ).length;
  const undetermined = DEMO_TRANSACTIONS.filter(
    (t) => t.status === "UNDETERMINED"
  ).length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Payment Terms Compliance
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              ✓ COMPLIANT (3 of 3 rules pass)
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
              Last verified: just now
            </p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            View Details
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Transaction Summary
        </h3>
        <Suspense fallback={<MetricsSkeleton />}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard label="Total Transactions" value={totalTransactions} status="total" />
            <MetricCard label="Passed ✓" value={passed} status="ALLOWED" />
            <MetricCard label="Refused ✗" value={refused} status="REFUSED" />
            <MetricCard label="Undetermined ?" value={undetermined} status="UNDETERMINED" />
          </div>
        </Suspense>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Transactions
          </h3>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1 text-slate-900 dark:text-white">
              <option value="">All Status</option>
              <option value="ALLOWED">Passed</option>
              <option value="REFUSED">Refused</option>
              <option value="UNDETERMINED">Undetermined</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <Suspense fallback={<TransactionTableSkeleton />}>
            <div className="hidden md:grid md:grid-cols-6 gap-4 bg-slate-50 dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Timestamp
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Amount
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Merchant
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Customer
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">
                Action
              </div>
            </div>

            {DEMO_TRANSACTIONS.map((txn) => (
              <TransactionRow
                key={txn.id}
                timestamp={txn.timestamp}
                amount={txn.amount}
                merchant={txn.merchant}
                customer={txn.customer}
                status={txn.status}
              />
            ))}
          </Suspense>
        </div>

        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          View All Transactions →
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
          <div className="text-2xl mb-2">📋</div>
          <div className="font-semibold text-slate-900 dark:text-white">
            Constraints
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            View declared vs authority
          </div>
        </button>

        <button className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
          <div className="text-2xl mb-2">⚖️</div>
          <div className="font-semibold text-slate-900 dark:text-white">
            Rules
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Active compliance rules
          </div>
        </button>

        <button className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
          <div className="text-2xl mb-2">📊</div>
          <div className="font-semibold text-slate-900 dark:text-white">
            Ledger
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Audit trail timeline
          </div>
        </button>

        <button className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
          <div className="text-2xl mb-2">🎯</div>
          <div className="font-semibold text-slate-900 dark:text-white">
            Demo Mode
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Reset preloaded data
          </div>
        </button>
      </div>
    </div>
  );
}
