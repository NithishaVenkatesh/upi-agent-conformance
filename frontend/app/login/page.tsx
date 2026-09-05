"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = () => {
    setError("");
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      router.push("/app");
    } catch (err) {
      setError("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[--color-paper] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="w-6 h-6 bg-[--color-ink]" />
          <h1 className="text-[1.5rem] font-600 text-[--color-ink]">
            Sign in as judge
          </h1>
          <p className="text-14px text-[--color-ink-2]">
            Verify payment compliance decisions
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-[--color-fail-bg] border border-[--color-fail] rounded-[3px]">
            <p className="text-13px text-[--color-fail] font-500">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} noValidate className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-13px font-500 text-[--color-ink-2] uppercase tracking-wide">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue="judge@razorpay.dev"
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-[3px] bg-[--color-surface] text-14px text-[--color-ink] focus-visible:outline-offset-0 focus-visible:outline-2 focus-visible:outline-[--color-ink] transition-colors ${
                error ? "border-[--color-fail]" : "border-[--color-rule]"
              }`}
              aria-invalid={error ? "true" : "false"}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-13px font-500 text-[--color-ink-2] uppercase tracking-wide">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              defaultValue="demo"
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-[3px] bg-[--color-surface] text-14px text-[--color-ink] focus-visible:outline-offset-0 focus-visible:outline-2 focus-visible:outline-[--color-ink] transition-colors ${
                error ? "border-[--color-fail]" : "border-[--color-rule]"
              }`}
              aria-invalid={error ? "true" : "false"}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-8 bg-[--color-ink] text-[--color-paper] rounded-[3px] font-500 text-14px hover:bg-[#14313A] hover:text-white active:bg-[#0a1619] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-13px text-[--color-ink-2]">
            Demo environment
          </p>
          <p className="text-13px text-[--color-ink-3]">
            Use email: <code className="text-12px bg-[--color-paper] px-2 py-1 rounded">judge@razorpay.dev</code>
          </p>
        </div>
      </div>
    </div>
  );
}
