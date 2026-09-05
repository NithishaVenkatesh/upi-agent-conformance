"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";

const CHECKS = [
  "Conformance",
  "Cap limit",
  "Balance",
  "Expiry",
  "Validity",
  "Retries",
  "Blocks",
];

const STEP_DELAY = 120; // 7 checks × 120ms = 840ms total (well under 1.2s)

export function GateFlow({ failing = -1 }: { failing?: number }) {
  const [revealed, setRevealed] = useState(0);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(media.matches);

    if (media.matches) {
      setRevealed(CHECKS.length);
      return;
    }

    const interval = setInterval(() => {
      setRevealed((p) => Math.min(p + 1, CHECKS.length));
    }, STEP_DELAY);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative py-8">
      <div className="flex items-center justify-between gap-2">
        {CHECKS.map((check, i) => {
          const isRevealed = i < revealed;
          const isFailing = i === failing;

          return (
            <motion.div
              key={i}
              className="flex flex-col items-center flex-1"
              initial={!prefersReduced ? { opacity: 0.6 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.2,
                delay: prefersReduced ? 0 : i * (STEP_DELAY / 1000),
              }}
            >
              {/* Circle indicator */}
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-12px font-600 ${
                  !isRevealed
                    ? "bg-[--color-rule] text-[--color-ink-3]"
                    : isFailing
                      ? "bg-[--color-fail] text-white"
                      : "bg-[--color-pass] text-white"
                }`}
                animate={{
                  backgroundColor: !isRevealed
                    ? "var(--color-rule)"
                    : isFailing
                      ? "var(--color-fail)"
                      : "var(--color-pass)",
                  scale: isRevealed && !isFailing ? 1 : 1,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <motion.span
                  key={`${i}-${isRevealed ? "revealed" : "hidden"}`}
                  initial={!prefersReduced && isRevealed ? { scale: 0 } : {}}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.18,
                    ease: "easeOut",
                  }}
                >
                  {!isRevealed ? i + 1 : isFailing ? "✗" : "✓"}
                </motion.span>
              </motion.div>

              {/* Label */}
              <div className="text-11px text-[--color-ink-3] mt-2 text-center max-w-16 leading-tight">
                {check}
              </div>

              {/* Connector line */}
              {i < CHECKS.length - 1 && (
                <motion.div
                  className={`absolute top-4 h-0.5 ${
                    i < revealed - 1
                      ? "bg-[--color-pass]"
                      : i === revealed - 1 && !isFailing
                        ? "bg-[--color-pass]"
                        : "bg-[--color-rule]"
                  }`}
                  style={{
                    left: `calc((${i + 0.5}) * (100% / ${CHECKS.length}) + 16px)`,
                    width: `calc(100% / ${CHECKS.length} - 32px)`,
                  }}
                  animate={{
                    backgroundColor:
                      i < revealed - 1 || (i === revealed - 1 && !isFailing)
                        ? "var(--color-pass)"
                        : "var(--color-rule)",
                  }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
