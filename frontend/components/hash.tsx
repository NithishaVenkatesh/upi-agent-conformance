"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Copy, Check } from "lucide-react";

export function Hash({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const truncated = value.slice(0, 6) + "…" + value.slice(-4);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-1.5">
      <code
        title={value}
        className="font-[--font-mono] text-xs text-[--color-ink-2] flex-1"
      >
        {truncated}
      </code>
      <motion.button
        onClick={handleCopy}
        className="relative p-1 text-xs font-500 text-[--color-ink] rounded hover:bg-[--color-paper] transition-colors"
        data-testid="hash-copy-button"
      >
        <motion.span
          key={copied ? "check" : "copy"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="inline-block"
        >
          {copied ? (
            <Check className="w-4 h-4" data-testid="hash-confirmation" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </motion.span>
      </motion.button>
    </div>
  );
}
