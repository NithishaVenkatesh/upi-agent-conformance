"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutList, Scale, Link2, Gavel, LogOut } from "lucide-react";

const PRIMARY_NAV = [
  { label: "Decisions", icon: LayoutList, href: "/app" },
  { label: "Demo", icon: Gavel, href: "/app/demo" },
];

const REFERENCE_NAV = [
  { label: "Rules", icon: Scale, href: "/app/constraints" },
  { label: "Ledger", icon: Link2, href: "/app/ledger" },
];

export function Rail() {
  const pathname = usePathname();

  return (
    <div className="w-54 bg-[--color-surface] border-r border-[--color-rule] flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-6 border-b border-[--color-rule]">
        <div className="w-6 h-6 bg-[--color-ink] mb-3" />
        <div className="text-14px font-600 text-[--color-ink]">
          in.razorpay.upi
        </div>
        <div className="text-12px text-[--color-ink-3]">Payment gate</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/app");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-[3px] text-13px transition-colors ${
                isActive
                  ? "bg-[--color-paper] text-[--color-ink] font-500"
                  : "text-[--color-ink-2] hover:bg-[--color-paper]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        {/* Reference separator */}
        <div className="border-t border-[--color-rule] my-4 pt-4">
          <div className="text-11px text-[--color-ink-3] px-3 mb-2">Reference</div>
          {REFERENCE_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-[3px] text-13px transition-colors ${
                  isActive
                    ? "bg-[--color-paper] text-[--color-ink] font-500"
                    : "text-[--color-ink-2] hover:bg-[--color-paper]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-6 border-t border-[--color-rule] space-y-2">
        <div className="text-11px text-[--color-ink-3] px-3">Demo environment</div>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-13px text-[--color-ink-2] hover:text-[--color-ink] transition-colors">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
