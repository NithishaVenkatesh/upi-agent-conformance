/**
 * Audit Ledger Page
 * Hash-chained ledger with forward/backward verification
 */

import { Suspense } from "react";

// Demo ledger entries
const DEMO_LEDGER_ENTRIES = [
  {
    seq: 1,
    timestamp: 1725110400,
    event: "checkout_created",
    hash: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    prev_hash: "00000000000000000000000000000000000000000000000000000000",
    payload: {
      checkout_id: "cs_abc001",
      amount: 249900,
      merchant: "mrch_001",
    },
    verified: true,
  },
  {
    seq: 2,
    timestamp: 1725111000,
    event: "constraints_extracted",
    hash: "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8",
    prev_hash: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    payload: {
      checkout_id: "cs_abc001",
      constraints: ["max_amount=1000000", "validity_days=90"],
    },
    verified: true,
  },
  {
    seq: 3,
    timestamp: 1725111600,
    event: "conformance_evaluated",
    hash: "c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9",
    prev_hash: "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8",
    payload: {
      checkout_id: "cs_abc001",
      verdict: "PASS",
      code: "conformant",
    },
    verified: true,
  },
  {
    seq: 4,
    timestamp: 1725112200,
    event: "gate_evaluated",
    hash: "d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0",
    prev_hash: "c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9",
    payload: {
      checkout_id: "cs_abc001",
      decision: "allowed",
      authority_clause: "Issuer 5",
    },
    verified: true,
  },
  {
    seq: 5,
    timestamp: 1725112800,
    event: "payment_captured",
    hash: "e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f",
    prev_hash: "d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0",
    payload: {
      checkout_id: "cs_abc001",
      amount: 249900,
      balance_remaining: 750100,
    },
    verified: true,
  },
];

function LedgerEntryCard({ entry }: { entry: (typeof DEMO_LEDGER_ENTRIES)[0] }) {
  const date = new Date(entry.timestamp * 1000);
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Entry #{entry.seq}
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
            {entry.event.replace(/_/g, " ")}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {timeStr}
          </p>
          {entry.verified && (
            <div className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs font-medium">
              ✓ VERIFIED
            </div>
          )}
        </div>
      </div>

      {/* Hash Chain */}
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
            Current Hash
          </p>
          <div className="bg-slate-50 dark:bg-slate-900 rounded p-2 font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
            {entry.hash}
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
            Previous Hash
          </p>
          <div className="bg-slate-50 dark:bg-slate-900 rounded p-2 font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
            {entry.prev_hash}
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center py-2">
        <span className="text-slate-400 dark:text-slate-600">↓</span>
      </div>

      {/* Payload */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
          Event Details ({Object.keys(entry.payload).length} fields)
        </summary>
        <div className="mt-3 bg-slate-50 dark:bg-slate-900 rounded p-4">
          <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap break-words">
            {JSON.stringify(entry.payload, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}

export default function LedgerPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Audit Ledger
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          Immutable record of all payment processing events. Each entry is
          cryptographically verified with hash chaining to detect tampering.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Total Entries
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {DEMO_LEDGER_ENTRIES.length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Verified</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
            {DEMO_LEDGER_ENTRIES.filter((e) => e.verified).length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Integrity Status
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            ✓ Clean
          </p>
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 dark:text-green-100">
          ✓ Ledger Integrity Verified
        </h3>
        <p className="text-sm text-green-700 dark:text-green-300 mt-2">
          All {DEMO_LEDGER_ENTRIES.length} entries validated. Forward and backward
          hash chain complete. No tampering detected.
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Event Timeline
        </h2>
        <Suspense fallback={<div className="h-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />}>
          <div className="space-y-4">
            {DEMO_LEDGER_ENTRIES.map((entry) => (
              <LedgerEntryCard key={entry.seq} entry={entry} />
            ))}
          </div>
        </Suspense>
      </div>

      {/* Verification Method */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          How Verification Works
        </h3>
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              1. Hash Chain
            </p>
            <p className="mt-1">
              Each entry includes SHA-256 hash of its payload plus the previous
              entry's hash, creating an immutable chain
            </p>
          </div>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="font-medium text-slate-900 dark:text-white">
              2. Forward Verification
            </p>
            <p className="mt-1">
              Replay computation from Entry #1. Verify each hash against
              recomputed value
            </p>
          </div>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="font-medium text-slate-900 dark:text-white">
              3. Backward Verification
            </p>
            <p className="mt-1">
              Walk backward from latest. Each entry's prev_hash matches
              previous entry's hash
            </p>
          </div>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="font-medium text-slate-900 dark:text-white">
              4. Integrity
            </p>
            <p className="mt-1">
              Any modification to any entry invalidates all hashes forward,
              making tampering impossible to hide
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Export Ledger
        </button>
        <button className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
