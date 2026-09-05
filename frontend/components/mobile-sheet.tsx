"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export interface MobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function MobileSheet({
  isOpen,
  onClose,
  title,
  children,
}: MobileSheetProps) {
  return (
    <AnimatePresence mode="sync">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              y: { duration: 0.3, ease: "easeOut" },
              opacity: { duration: 0.2 },
            }}
            className="fixed bottom-0 left-0 right-0 bg-[--color-surface] border-t border-[--color-rule] rounded-t-lg z-50 md:hidden max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[--color-rule] sticky top-0 bg-[--color-paper]">
                <h2 className="text-14px font-600 text-[--color-ink]">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1 text-[--color-ink-2] hover:text-[--color-ink] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
