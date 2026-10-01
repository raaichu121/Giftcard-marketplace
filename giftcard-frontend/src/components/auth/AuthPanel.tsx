"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

export type AuthTab = "signin" | "register";
type InputMode = "email" | "phone";

interface AuthPanelProps {
  initialTab?: AuthTab;
  onTabChange?: (tab: AuthTab) => void;
  onClose?: () => void;
  showClose?: boolean;
}

export default function AuthPanel({
  initialTab = "signin",
  onTabChange,
  onClose,
  showClose = false,
}: AuthPanelProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [inputMode, setInputMode] = useState<InputMode>("email");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchTab = (next: AuthTab) => {
    setTab(next);
    setError("");
    setEmail("");
    setPhone("");
    setFullName("");
    setOtp("");
    setOtpSent(false);
    onTabChange?.(next);
  };

  const finishAuth = () => {
    onClose?.();
    const redirect =
      typeof window !== "undefined"
        ? sessionStorage.getItem("authRedirect")
        : null;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("authRedirect");
    }
    router.push(redirect || "/customer/wallet");
  };

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Simulate OTP request
      await new Promise((resolve) => setTimeout(resolve, 800));
      setOtpSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email || phone, otp);
      finishAuth();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setOtpSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-none overflow-hidden shadow-2xl w-full max-w-md flex flex-col">
      {/* Close button */}
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center text-black hover:opacity-60 transition-opacity z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Logo */}
      <div className="pt-10 pb-2 text-center">
        <h1
          className="text-5xl font-black tracking-tight text-black"
          style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
        >
          GIFTNOW.
        </h1>
      </div>

      {/* Heading */}
      <div className="pb-6 text-center">
        <h2
          className="text-2xl font-bold tracking-widest text-black uppercase"
          style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {tab === "signin" ? "Sign In" : "Create Account"}
        </h2>
      </div>

      {/* Form Content */}
      <div className="px-10 pb-10">
        {tab === "signin" ? (
          <>
            {/* Email / Phone Tab Switcher */}
            <div className="flex mb-8">
              <button
                type="button"
                onClick={() => {
                  setInputMode("email");
                  setError("");
                  setOtpSent(false);
                }}
                className={`flex-1 pb-3 text-sm font-bold tracking-widest uppercase transition-all duration-200 ${
                  inputMode === "email"
                    ? "text-black border-b-[3px] border-black"
                    : "text-gray-400 border-b-[3px] border-transparent hover:text-gray-600"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode("phone");
                  setError("");
                  setOtpSent(false);
                }}
                className={`flex-1 pb-3 text-sm font-bold tracking-widest uppercase transition-all duration-200 ${
                  inputMode === "phone"
                    ? "text-black border-b-[3px] border-black"
                    : "text-gray-400 border-b-[3px] border-transparent hover:text-gray-600"
                }`}
              >
                Phone
              </button>
            </div>

            {!otpSent ? (
              <form onSubmit={handleGetOtp} className="space-y-6">
                {/* Input Field */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2">
                    {inputMode === "email" ? "Email Address" : "Phone Number"}
                  </label>
                  <div className="relative">
                    <input
                      type={inputMode === "email" ? "email" : "tel"}
                      value={inputMode === "email" ? email : phone}
                      onChange={(e) =>
                        inputMode === "email"
                          ? setEmail(e.target.value)
                          : setPhone(e.target.value)
                      }
                      placeholder={
                        inputMode === "email"
                          ? "Enter your email"
                          : "Enter your phone number"
                      }
                      required
                      className="w-full px-4 py-4 pr-12 border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors text-base"
                      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {inputMode === "email" ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="M22 4L12 13L2 4" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <rect x="5" y="1" width="14" height="22" rx="3" />
                          <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm font-medium">{error}</div>
                )}

                {/* GET OTP Button */}
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
                      Sending...
                    </span>
                  ) : (
                    <>
                      Get OTP
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2">
                    Enter OTP
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    We sent a verification code to{" "}
                    <span className="font-semibold text-black">
                      {inputMode === "email" ? email : phone}
                    </span>
                  </p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    required
                    maxLength={6}
                    className="w-full px-4 py-4 border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors text-center text-2xl tracking-[0.5em] font-bold"
                    style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm font-medium">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-black text-white font-bold tracking-[0.25em] uppercase text-sm flex items-center justify-center gap-3 hover:bg-gray-900 disabled:opacity-50 transition-all duration-200"
                  style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-sm text-gray-500 hover:text-black font-medium transition-colors"
                >
                  ← Change {inputMode === "email" ? "email" : "phone number"}
                </button>
              </form>
            )}

            {/* OR Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-6 text-xs font-medium tracking-widest text-gray-400 uppercase">
                Or
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Continue with Google */}
            <SocialAuthButtons
              onSuccess={finishAuth}
              onError={(msg) => setError(msg)}
            />

            {/* New to GiftNow? */}
            <p className="text-center mt-8 text-sm font-bold tracking-widest uppercase text-black">
              New to GiftNow?{" "}
              <button
                type="button"
                onClick={() => switchTab("register")}
                className="underline underline-offset-4 decoration-2 hover:opacity-70 transition-opacity"
              >
                Create Account
              </button>
            </p>
          </>
        ) : (
          /* ---- REGISTER TAB ---- */
          <>
            {/* Email / Phone Tab Switcher */}
            <div className="flex mb-8">
              <button
                type="button"
                onClick={() => {
                  setInputMode("email");
                  setError("");
                  setOtpSent(false);
                }}
                className={`flex-1 pb-3 text-sm font-bold tracking-widest uppercase transition-all duration-200 ${
                  inputMode === "email"
                    ? "text-black border-b-[3px] border-black"
                    : "text-gray-400 border-b-[3px] border-transparent hover:text-gray-600"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode("phone");
                  setError("");
                  setOtpSent(false);
                }}
                className={`flex-1 pb-3 text-sm font-bold tracking-widest uppercase transition-all duration-200 ${
                  inputMode === "phone"
                    ? "text-black border-b-[3px] border-black"
                    : "text-gray-400 border-b-[3px] border-transparent hover:text-gray-600"
                }`}
              >
                Phone
              </button>
            </div>

            {!otpSent ? (
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-4 py-4 border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors text-base"
                    style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
                  />
                </div>

                {/* Email or Phone Input */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2">
                    {inputMode === "email" ? "Email Address" : "Phone Number"}
                  </label>
                  <div className="relative">
                    <input
                      type={inputMode === "email" ? "email" : "tel"}
                      value={inputMode === "email" ? email : phone}
                      onChange={(e) =>
                        inputMode === "email"
                          ? setEmail(e.target.value)
                          : setPhone(e.target.value)
                      }
                      placeholder={
                        inputMode === "email"
                          ? "Enter your email"
                          : "Enter your phone number"
                      }
                      required
                      className="w-full px-4 py-4 pr-12 border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors text-base"
                      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {inputMode === "email" ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="M22 4L12 13L2 4" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <rect x="5" y="1" width="14" height="22" rx="3" />
                          <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm font-medium">{error}</div>
                )}

                {/* GET OTP Button */}
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
                      Sending...
                    </span>
                  ) : (
                    <>
                      Get OTP
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2">
                    Enter OTP
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    We sent a verification code to{" "}
                    <span className="font-semibold text-black">
                      {inputMode === "email" ? email : phone}
                    </span>
                  </p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    required
                    maxLength={6}
                    className="w-full px-4 py-4 border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors text-center text-2xl tracking-[0.5em] font-bold"
                    style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm font-medium">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-black text-white font-bold tracking-[0.25em] uppercase text-sm flex items-center justify-center gap-3 hover:bg-gray-900 disabled:opacity-50 transition-all duration-200"
                  style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-sm text-gray-500 hover:text-black font-medium transition-colors"
                >
                  ← Go back
                </button>
              </form>
            )}

            {/* OR Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-6 text-xs font-medium tracking-widest text-gray-400 uppercase">
                Or
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Continue with Google */}
            <SocialAuthButtons
              onSuccess={finishAuth}
              onError={(msg) => setError(msg)}
            />

            {/* Already have account? */}
            <p className="text-center mt-8 text-sm font-bold tracking-widest uppercase text-black">
              Already on GiftNow?{" "}
              <button
                type="button"
                onClick={() => switchTab("signin")}
                className="underline underline-offset-4 decoration-2 hover:opacity-70 transition-opacity"
              >
                Sign In
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
