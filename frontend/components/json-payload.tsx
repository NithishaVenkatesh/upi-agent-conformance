"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

export interface JSONPayloadProps {
  data: Record<string, any>;
  label?: string;
  defaultOpen?: boolean;
}

export function JSONPayload({
  data,
  label = "Payload",
  defaultOpen = false,
}: JSONPayloadProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-[--color-rule] rounded-[3px] bg-[--color-surface] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-13px text-[--color-ink-2] bg-[--color-paper] hover:bg-[--color-paper] hover:bg-opacity-50 transition-colors"
      >
        <span>{label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="payload-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.25, ease: "easeOut" },
              opacity: { duration: 0.2 },
            }}
            className="overflow-hidden"
          >
            <pre className="px-6 py-4 text-12px font-[--font-mono] text-[--color-ink-2] whitespace-pre-wrap word-break bg-[--color-surface] border-t border-[--color-rule]">
              {JSON.stringify(data, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
