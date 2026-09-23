"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RequireAuth({
  children,
  redirectTo = "/customer/wallet",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-[#999] text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center bg-[#f5f5f7]">
        <div className="max-w-md w-full mx-auto px-6 pt-12 md:pt-16 pb-16 text-center">
          {/* Lock Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-black flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 className="text-[24px] font-bold text-black mb-2 tracking-tight">
            Sign in to view your wallet
          </h1>
          <p className="text-[14px] text-[#888] mb-8 leading-relaxed">
            Log in or create an account to access your GiftNow wallet, redeem
            gift cards, and track your balance.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/auth/login`}
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("authRedirect", redirectTo);
                }
              }}
              className="px-8 py-3.5 bg-black text-white rounded-lg font-bold text-[13px] uppercase tracking-wider hover:bg-[#1a1a1a] transition-all shadow-sm text-center"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("authRedirect", redirectTo);
                }
              }}
              className="px-8 py-3.5 bg-white text-black border border-[#ddd] rounded-lg font-bold text-[13px] uppercase tracking-wider hover:border-black transition-all text-center"
            >
              Create Account
            </Link>
          </div>

          {/* Go back link */}
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-6 text-[13px] text-[#888] hover:text-black font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
