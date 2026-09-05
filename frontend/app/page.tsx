"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ruling } from "@/components/ruling";

export default function Landing() {
  const router = useRouter();
  const heroDecision = {
    allowed: false,
    code: "counterparty_not_conformant",
    clause: "Acquirer §2",
    quote: "The block created shall not be treated as the guarantee of payment",
    circular: "NPCI/UPI/OC No.228",
    detail: "Merchant claims otherwise",
  };

  return (
    <main className="min-h-screen bg-[--color-paper]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20 sm:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24">
          {/* Left Column: Legal Quote + Collision */}
          <div className="space-y-12">
            <div>
              <h1
                className="font-doc text-[2.5rem] leading-[1.35] text-[--color-ink] max-w-[35ch]"
                style={{ fontVariant: "normal", fontWeight: 400 }}
              >
                The block created shall not be treated as the guarantee of payment.
              </h1>

              <div className="mt-4 space-y-1">
                <div className="text-12px tracking-wide font-mono text-[--color-ink-2] uppercase">
                  NPCI/UPI OC No.228
                </div>
                <div className="text-12px tracking-wide font-mono text-[--color-ink-2] uppercase">
                  Acquirer §2
                </div>
              </div>
            </div>

            {/* Typographic Collision: Struck Merchant Claim */}
            <div className="pt-4 border-t border-[--color-rule]">
              <div className="text-[1.25rem] font-600 text-[--color-fail] line-through">
                Guaranteed Collection
              </div>
              <p className="text-14px text-[--color-ink] mt-6 leading-relaxed max-w-[45ch]">
                Merchant terms say otherwise. We catch it before the money moves.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 flex-col sm:flex-row">
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-3 bg-[--color-ink] text-[--color-paper] rounded-[3px] font-600 text-15px hover:bg-[#14313A] hover:text-white focus-visible:outline-2 focus-visible:outline-[--color-ink] focus-visible:outline-offset-0 active:bg-[#0a1619] active:scale-[0.98] transition-all duration-150 text-center min-h-[48px] flex items-center justify-center shadow-md hover:shadow-lg"
              >
                Open the dashboard
              </button>
              <a
                href="#architecture"
                className="px-6 py-3 text-[--color-ink-2] border-b border-[--color-ink-2] font-500 text-14px hover:text-[--color-ink] hover:border-[--color-ink] focus-visible:outline-2 focus-visible:outline-[--color-ink] focus-visible:outline-offset-0 active:opacity-60 transition-all duration-150 text-center min-h-[48px] flex items-center justify-center"
              >
                Read the architecture
              </a>
            </div>
          </div>

          {/* Right Column: Ruling Component */}
          <div>
            <Ruling decision={heroDecision} variant="full" />
          </div>
        </div>
      </div>

      {/* Process Blocks: Extract, Conform, Enforce */}
      <div className="border-t border-[--color-rule] bg-[--color-surface]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
            {[
              {
                title: "Extract",
                description: "Parse merchant claims, regulator policy, acquirer terms into structured rules."
              },
              {
                title: "Conform",
                description: "Cross-reference claims against regulation. Identify contradictions and gaps."
              },
              {
                title: "Enforce",
                description: "Block payments when claims don't match terms. Log the gate code and clause."
              }
            ].map((block, i) => (
              <div key={i} className="space-y-3 border-t-2 border-[--color-rule] pt-6">
                <h3 className="text-14px font-600 text-[--color-ink] tracking-wide uppercase">
                  {block.title}
                </h3>
                <p className="text-13px text-[--color-ink-2] leading-relaxed">
                  {block.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
          {[
            { value: "195", label: "tests" },
            { value: "7", label: "claims" },
            { value: "8", label: "codes" },
            { value: "0", label: "LLM on money path" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="font-600 text-[1.75rem] text-[--color-ink] tabular-nums">
                {stat.value}
              </div>
              <div className="text-12px text-[--color-ink-3] mt-2 tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Section */}
      <section id="architecture" className="border-t border-[--color-rule] bg-[--color-surface] py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-2xl font-600 text-[--color-ink] mb-8">Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-14px font-600 text-[--color-ink] tracking-wide uppercase mb-4">
                The Money Path
              </h3>
              <p className="text-14px text-[--color-ink-2] leading-relaxed mb-4">
                Every transaction flows through the bounded payment gate. The gate makes a deterministic decision based on merchant claims, regulatory policy, and acquirer terms.
              </p>
              <p className="text-14px text-[--color-ink-2] leading-relaxed">
                No LLM is on the money path. The gate uses structured rules extracted by an agent, then applies them mechanistically. Refusals cite the specific clause that was violated.
              </p>
            </div>
            <div>
              <h3 className="text-14px font-600 text-[--color-ink] tracking-wide uppercase mb-4">
                The Ledger
              </h3>
              <p className="text-14px text-[--color-ink-2] leading-relaxed mb-4">
                Every gate decision is sealed into a hash-chained ledger. The chain is anchored to a HEAD marker, enabling verification that:
              </p>
              <ul className="text-14px text-[--color-ink-2] leading-relaxed space-y-2 ml-4">
                <li>• No entries have been deleted</li>
                <li>• No entries have been modified</li>
                <li>• The order is preserved</li>
                <li>• The gate's decision history is tamper-evident</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
