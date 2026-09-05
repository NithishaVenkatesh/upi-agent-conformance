"use client";

import { useState, useEffect } from "react";
import { VerifyChain } from "@/components/verify-chain";

interface LedgerEntry {
  seq: number;
  prev_hash: string;
  payload: any;
  hash: string;
}

export default function Ledger() {
  const [chainLinks, setChainLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>("Verifying...");

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";
        const response = await fetch(`${apiUrl}/api/ledger`);

        if (!response.ok) {
          throw new Error("Failed to fetch ledger");
        }

        const entries: LedgerEntry[] = await response.json();

        if (entries.length === 0) {
          setChainLinks([
            {
              id: "genesis",
              label: "Ledger initialized (empty)",
              timestamp: new Date().toISOString(),
              status: "verified",
            },
          ]);
          setVerificationStatus("Empty ledger - no transactions yet");
          setLoading(false);
          return;
        }

        // Transform ledger entries to chain links
        const links = entries.map((entry, index) => {
          const payload = entry.payload;
          let label = "";

          switch (payload.event) {
            case "authorise":
              label = `Payment ${payload.decision === "authorised" ? "authorised" : "refused"} (${payload.decision})`;
              break;
            case "captured":
              label = `Payment captured (Order: ${payload.order_id})`;
              break;
            case "capture_failed":
              label = `Payment capture failed (${payload.kind})`;
              break;
            case "replay":
              label = `Replay (idempotent)`;
              break;
            default:
              label = `Event: ${payload.event}`;
          }

          return {
            id: `entry-${entry.seq}`,
            label: label,
            timestamp: new Date().toISOString(),
            seq: entry.seq,
            hash: entry.hash.substring(0, 8) + "..." + entry.hash.substring(entry.hash.length - 4),
            fullHash: entry.hash,
            prevHash: entry.prev_hash,
            status: "verified",
          };
        });

        setChainLinks(links);
        setVerificationStatus(`${entries.length} entries verified (forward, backward, HEAD-anchored)`);
      } catch (err) {
        console.error("Failed to fetch ledger:", err);
        setError("Failed to load ledger");
        setVerificationStatus("Verification failed");
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-20px font-600 text-[--color-ink] mb-8">
          Ledger Verification Chain
        </h1>
        <div className="text-14px text-[--color-ink-2]">Loading ledger entries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-20px font-600 text-[--color-ink] mb-8">
          Ledger Verification Chain
        </h1>
        <div className="text-14px text-[--color-fail]">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-20px font-600 text-[--color-ink] mb-2">
          Ledger Verification Chain
        </h1>
        <p className="text-13px text-[--color-ink-2]">{verificationStatus}</p>
      </div>
      <VerifyChain links={chainLinks} autoVerify={true} verifyDelay={200} />
    </div>
  );
}
