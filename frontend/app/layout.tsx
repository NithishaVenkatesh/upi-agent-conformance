import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Compliance Gateway - Regulatory Payment Platform",
  description: "Real-time regulatory compliance for UPI payments with NPCI/RBI verification",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-gray-50">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 shadow-lg sticky top-0 h-screen overflow-y-auto">
          <h1 className="text-2xl font-bold mb-8">
            <span className="text-blue-400">⚖️</span> Compliance
          </h1>

          <nav className="space-y-1 mb-8">
            <Link
              href="/dashboard"
              className="block px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/payments"
              className="block px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              💳 Payments
            </Link>
            <Link
              href="/violations"
              className="block px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              ⚠️ Violations
            </Link>
            <Link
              href="/merchant"
              className="block px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              👤 Merchant
            </Link>
            <Link
              href="/reports"
              className="block px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              📋 Reports
            </Link>
          </nav>

          <div className="mt-auto pt-8 border-t border-gray-700">
            <div className="text-xs text-gray-400 space-y-3">
              <div className="flex items-start gap-2">
                <span>🔐</span>
                <span>NPCI/RBI Compliant</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span>Audit Trail Enabled</span>
              </div>
              <div className="flex items-start gap-2">
                <span>🛡️</span>
                <span>Deterministic Money Path</span>
              </div>
              <div className="flex items-start gap-2">
                <span>📜</span>
                <span>Kill-Gate 2 Passed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
