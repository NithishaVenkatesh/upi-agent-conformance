"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link as LinkIcon, CheckCircle2 } from "lucide-react";

export interface ChainLink {
  id: string;
  label: string;
  timestamp?: string;
}

export interface VerifyChainProps {
  links: ChainLink[];
  autoVerify?: boolean;
  verifyDelay?: number; // Delay between verifying each link in ms
}

export function VerifyChain({
  links,
  autoVerify = true,
  verifyDelay = 200,
}: VerifyChainProps) {
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(media.matches);

    if (!autoVerify) return;

    if (media.matches) {
      setVerifiedCount(links.length);
      return;
    }

    const interval = setInterval(() => {
      setVerifiedCount((p) => Math.min(p + 1, links.length));
    }, verifyDelay);

    return () => clearInterval(interval);
  }, [autoVerify, links.length, verifyDelay]);

  return (
    <div className="space-y-4">
      {links.map((link, i) => {
        const isVerified = i < verifiedCount;

        return (
          <motion.div
            key={link.id}
            className="flex items-start gap-3"
            initial={!prefersReduced ? { opacity: 0.6 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.2,
              delay: prefersReduced ? 0 : i * (verifyDelay / 1000),
            }}
          >
            {/* Status indicator */}
            <motion.div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                isVerified
                  ? "bg-[--color-pass]"
                  : "bg-[--color-rule] border border-[--color-ink-3]"
              }`}
              animate={{
                backgroundColor: isVerified
                  ? "var(--color-pass)"
                  : "var(--color-rule)",
                boxShadow: isVerified
                  ? "0 0 8px rgba(var(--color-pass-rgb), 0.3)"
                  : "none",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {isVerified && (
                <motion.span
                  initial={!prefersReduced ? { scale: 0 } : {}}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </motion.span>
              )}
              {!isVerified && (
                <div className="w-2 h-2 bg-[--color-ink-3] rounded-full" />
              )}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <motion.div
                className="text-13px font-600 text-[--color-ink]"
                animate={{
                  color: isVerified ? "var(--color-ink)" : "var(--color-ink-2)",
                }}
                transition={{ duration: 0.2 }}
              >
                {link.label}
              </motion.div>
              {link.timestamp && (
                <div className="text-12px text-[--color-ink-3] mt-1">
                  {link.timestamp}
                </div>
              )}
            </div>

            {/* Connecting line */}
            {i < links.length - 1 && (
              <motion.div
                className="absolute left-[14px] top-[28px] w-0.5 h-[48px] -z-10"
                animate={{
                  backgroundColor: isVerified
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
  );
}
