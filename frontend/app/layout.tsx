import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "in.razorpay.upi — Payment Compliance Dashboard",
  description:
    "AI-powered regulatory compliance for UPI payments. Verify payment terms against NPCI/RBI circulars.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' font-weight='bold' fill='%2310b981'>✓</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-white dark:bg-slate-950 antialiased">
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                      in.razorpay.upi
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Payment Compliance Dashboard
                    </p>
                  </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Demo Mode
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                NPCI/UPI compliance enforced deterministically. Every decision cites regulatory authority.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
