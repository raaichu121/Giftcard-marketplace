"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { authAPI, getStoredUser } from "@/lib/api";

export default function LoginPage() {
  const { loginWithOtp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP Verification flow states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!otpSent) {
        // Step 1: Send OTP
        if (!email) {
          setError("Please enter your email");
          setLoading(false);
          return;
        }
        await authAPI.sendOtp(email, undefined);
        setOtpSent(true);
      } else {
        // Step 2: Verify OTP code and Login
        if (!otpCode || otpCode.length !== 6) {
          setError("Please enter a valid 6-digit verification code");
          setLoading(false);
          return;
        }

        await loginWithOtp(email, undefined, otpCode);

        const redirect =
          typeof window !== "undefined"
            ? sessionStorage.getItem("authRedirect")
            : null;
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("authRedirect");
        }
        
        const storedUser = getStoredUser();
        const isAdminUser =
          storedUser?.role === "ADMIN" ||
          storedUser?.role === "SUPER_ADMIN" ||
          storedUser?.role === "MODERATOR";
        const defaultDest = isAdminUser ? "/admin/giftnow" : "/customer/wallet";
        router.push(redirect || defaultDest);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Access Denied");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="text-center mb-4">
          <Link href="/" className="inline-block mb-2">
          <h1
            className="text-5xl font-black tracking-tight text-black"
            style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
          >
            GIFTNOW.
          </h1>
          </Link>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h2
            className="text-xl font-bold tracking-widest text-black uppercase"
            style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {otpSent ? "Verify Code" : "Sign In"}
          </h2>
        </div>

        {/* Form Card */}
        <div className="space-y-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {otpSent ? (
              // OTP Code Entry View
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-black">
                    Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                      setError("");
                    }}
                    className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black underline underline-offset-2 transition-colors"
                  >
                    Change Email
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  We sent a 6-digit verification code to{" "}
                  <strong className="text-black">{email}</strong>.
                </div>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit code"
                    required
                    className="w-full px-4 py-4 pr-12 border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:border-black tracking-[0.25em] text-center font-bold text-lg bg-white"
                    style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              // Email Input View
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-black mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@giftnow.com"
                    required
                    className="w-full px-4 py-4 pr-12 border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors text-base bg-white"
                    style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 4L12 13L2 4" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm font-medium">{error}</div>
            )}

            {/* CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white font-bold tracking-[0.25em] uppercase text-sm flex items-center justify-center gap-3 hover:bg-gray-900 disabled:opacity-50 transition-all duration-200"
              style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {otpSent ? "Verifying..." : "Sending..."}
                </span>
              ) : (
                <>
                  {otpSent ? "Verify & Login" : "Get OTP"}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Social Auth - Only show when OTP is not yet sent */}
          {!otpSent && (
            <>
              <div className="flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-6 text-xs font-medium tracking-widest text-gray-400 uppercase">
                  Or
                </span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <div>
                <SocialAuthButtons
                  onSuccess={() => {
                    const redirect =
                      typeof window !== "undefined"
                        ? sessionStorage.getItem("authRedirect")
                        : null;
                    if (typeof window !== "undefined") {
                      sessionStorage.removeItem("authRedirect");
                    }
                    
                    const storedUser = getStoredUser();
                    const isAdminUser =
                      storedUser?.role === "ADMIN" ||
                      storedUser?.role === "SUPER_ADMIN" ||
                      storedUser?.role === "MODERATOR";
                    const defaultDest = isAdminUser ? "/admin/giftnow" : "/customer/wallet";
                    router.push(redirect || defaultDest);
                  }}
                  onError={(msg) => setError(msg)}
                />
              </div>
            </>
          )}

          {/* Footer Link */}
          <p
            className="text-center text-sm font-bold tracking-widest uppercase text-black"
            style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
          >
            Create Profile?{" "}
            <Link
              href="/auth/signup"
              className="underline underline-offset-4 decoration-2 hover:opacity-70 transition-opacity"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
