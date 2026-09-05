"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ArrowLeftRight,
  Scale,
  Link2,
  Play,
  Menu,
  X,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { href: "/app", label: "Overview", icon: LayoutGrid },
  { href: "/app/checkout", label: "Checkout", icon: ShoppingCart },
  { href: "/app/showcase", label: "Decisions", icon: Sparkles },
  { href: "/app/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/app/constraints", label: "Constraints", icon: Scale },
  { href: "/app/ledger", label: "Ledger", icon: Link2 },
  { href: "/app/demo", label: "Demo", icon: Play },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 border-r border-[--color-rule] bg-[--color-surface] flex flex-col">
      <div className="p-6 border-b border-[--color-rule-2]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-[--color-ink] rounded-sm"></div>
          <span className="font-600 text-sm text-[--color-ink]">
            in.razorpay.upi
          </span>
        </div>
        <p className="text-xs text-[--color-ink-3]">Payment gate</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded text-sm transition-all relative min-h-[44px] ${
                isActive
                  ? "bg-[--color-paper] text-[--color-ink] font-500"
                  : "text-[--color-ink-2] hover:text-[--color-ink] hover:bg-[--color-surface]"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[--color-ink] rounded-r"></div>
              )}
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-[--color-rule-2]">
        <div className="flex items-center gap-2 p-2 bg-[--color-paper] rounded">
          <div className="w-6 h-6 bg-[--color-ink] rounded text-white flex items-center justify-center text-xs font-600">
            J
          </div>
          <div>
            <p className="text-xs font-500 text-[--color-ink]">Judge</p>
            <p className="text-xs text-[--color-ink-3]">Demo environment</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (menuOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [menuOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }
  };

  const getBreadcrumb = () => {
    if (pathname === "/app") return "Overview";
    if (pathname.startsWith("/app/transactions")) return "Transactions";
    if (pathname.startsWith("/app/constraints")) return "Constraints";
    if (pathname.startsWith("/app/ledger")) return "Ledger";
    if (pathname.startsWith("/app/demo")) return "Demo";
    return "Dashboard";
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-0 h-14 border-b border-[--color-rule] bg-[--color-surface] flex items-center justify-between px-8 z-40 md:left-56">
        <h1 className="text-sm font-500 text-[--color-ink]">
          {getBreadcrumb()}
        </h1>
        <button
          ref={menuButtonRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-11 h-11 rounded hover:bg-[--color-paper] active:bg-[--color-rule] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[--color-ink] focus-visible:outline-offset-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-[--color-ink]" />
        </button>
      </header>

      {menuOpen && (
        <motion.div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {menuOpen && (
        <motion.nav
          className="fixed left-0 top-0 h-screen w-64 bg-[--color-surface] border-r border-[--color-rule] z-30 md:hidden flex flex-col"
          initial={{ x: -256 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          onKeyDown={handleKeyDown}
        >
          <div className="p-4 flex justify-between items-center border-b border-[--color-rule-2]">
            <h2 className="font-600 text-sm">Menu</h2>
            <button
              ref={closeButtonRef}
              onClick={() => {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              className="p-2 hover:bg-[--color-paper] active:bg-[--color-rule] rounded transition-all duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[--color-ink] focus-visible:outline-offset-0"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="py-4 space-y-1 px-2 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors min-h-[44px] ${
                    isActive
                      ? "bg-[--color-paper] text-[--color-ink] font-500"
                      : "text-[--color-ink-2] hover:text-[--color-ink] hover:bg-[--color-paper]"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[--color-paper]">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col ml-0 md:ml-56">
        <TopBar />
        <main className="flex-1 pt-14 p-8">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
