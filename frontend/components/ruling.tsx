import { Lock, ShieldX, ShieldCheck, HelpCircle } from "lucide-react";
import type { GateDecision } from "@/lib/types";
import { Verdict } from "./verdict";
import { Money } from "./money";
import { Cite } from "./cite";
import { Hash } from "./hash";

const MARK = {
  ALLOWED: {
    icon: ShieldCheck,
    word: "Allowed",
    color: "text-[--color-pass]",
  },
  REFUSED: {
    icon: ShieldX,
    word: "Refused",
    color: "text-[--color-fail]",
  },
  UNDETERMINED: {
    icon: HelpCircle,
    word: "Undetermined",
    color: "text-[--color-undet]",
  },
} as const;

export function Ruling({
  decision,
  variant = "full",
}: {
  decision: GateDecision;
  variant?: "full" | "compact";
}) {
  const verdict = decision.allowed ? "ALLOWED" : "REFUSED";
  const mark = MARK[verdict];
  const Icon = mark.icon;

  return (
    <div
      className={`border border-[--color-rule] rounded-[3px] bg-[--color-surface] ${
        !decision.allowed ? "border-[--color-fail] border-opacity-30" : ""
      }`}
    >
      {/* Masthead */}
      <div className="border-b border-[--color-rule] px-6 py-4 flex items-center justify-between text-13px text-[--color-ink-2] bg-[--color-paper]">
        <span>Gate decision</span>
        <code className="font-[--font-mono] truncate max-w-xs" title={decision.code}>
          {decision.code}
        </code>
      </div>

      {/* The finding */}
      <div className="px-6 py-8">
        <div className={`text-40px font-newsreader font-400 ${mark.color} mb-1`}>
          {mark.word}
        </div>
        {!decision.allowed && (
          <div className="font-[--font-mono] text-13px text-[--color-ink-2] break-all" title={decision.code}>
            {decision.code}
          </div>
        )}
      </div>

      {variant === "full" && (
        <>
          {/* Facts strip */}
          <div className="border-t border-b border-[--color-rule] px-6 py-6 grid grid-cols-4 gap-8 text-14px">
            {[
              { label: "Requested", value: "₹" + decision.detail.split("₹")[1]?.split(" ")[0] || "—" },
              { label: "Customer", value: decision.code },
              { label: "Decided in", value: "<1ms" },
              { label: "Status", value: verdict },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-12px text-[--color-ink-3] mb-2">
                  {item.label}
                </div>
                <div className="font-600 text-[--color-ink] truncate" title={item.value}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Authority */}
          <div className="border-t border-[--color-rule] px-6 py-6">
            <div className="text-13px text-[--color-ink-2] mb-3">
              Regulatory authority
            </div>
            <Cite circular={decision.circular} clause={decision.clause} />
          </div>

          {/* Quotation */}
          <div className="border-t border-[--color-rule] px-6 py-6">
            <div
              className={`pl-4 border-l-2 border-[--color-pass] ${
                !decision.allowed
                  ? "border-[--color-fail]"
                  : "border-[--color-pass]"
              }`}
              style={{
                borderLeftColor: !decision.allowed ? "var(--color-fail)" : "var(--color-pass)",
              }}
            >
              <blockquote className="font-newsreader text-17px leading-relaxed italic text-[--color-ink]">
                "{decision.quote}"
              </blockquote>
            </div>
          </div>

          {/* Seal */}
          <div className="border-t border-[--color-rule] px-6 py-6 flex items-center gap-4">
            <div className="w-9 h-9 rounded-full border border-[--color-ink] flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-[--color-ink]" />
            </div>
            <div>
              <div className="text-12px text-[--color-ink-3]">
                Sealed into ledger
              </div>
              <code className="text-12px text-[--color-ink-2] font-[--font-mono]">
                Entry #1
              </code>
            </div>
          </div>
        </>
      )}

      {variant === "compact" && (
        <>
          {/* Compact: just quotation and seal */}
          <div className="border-t border-[--color-rule] px-6 py-6">
            <div
              className={`pl-4 border-l-2 ${
                !decision.allowed
                  ? "border-[--color-fail]"
                  : "border-[--color-pass]"
              }`}
              style={{
                borderLeftColor: !decision.allowed ? "var(--color-fail)" : "var(--color-pass)",
              }}
            >
              <blockquote className="font-newsreader text-17px leading-relaxed italic text-[--color-ink]">
                "{decision.quote}"
              </blockquote>
            </div>
          </div>

          <div className="border-t border-[--color-rule] px-6 py-4 text-12px text-[--color-ink-3]">
            Sealed into ledger
          </div>
        </>
      )}
    </div>
  );
}
