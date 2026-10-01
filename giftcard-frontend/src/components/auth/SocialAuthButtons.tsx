"use client";

import React from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/components/AuthProvider";

interface SocialAuthButtonsProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export default function SocialAuthButtons({
  onSuccess,
  onError,
}: SocialAuthButtonsProps) {
  const { loginWithGoogle } = useAuth();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogle = async (res: CredentialResponse) => {
    if (!res.credential) {
      onError?.("Google sign-in was cancelled");
      return;
    }
    try {
      await loginWithGoogle(res.credential);
      onSuccess?.();
    } catch (err: unknown) {
      onError?.(err instanceof Error ? err.message : "Google sign-in failed");
    }
  };

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-4 border-2 border-gray-300 bg-white flex items-center justify-center gap-3 text-gray-400 cursor-not-allowed"
        style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
      >
        {/* Google "G" Icon */}
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">
          Continue with Google
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full relative">
        {/* Styled wrapper to match design */}
        <div className="w-full py-4 border-2 border-black bg-white flex items-center justify-center gap-3 pointer-events-none">
          {/* Google "G" Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span
            className="text-xs font-bold tracking-[0.2em] uppercase text-black"
            style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
          >
            Continue with Google
          </span>
        </div>
        {/* Invisible Google Login on top to capture clicks */}
        <div className="absolute inset-0 opacity-0 overflow-hidden">
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => onError?.("Google sign-in failed")}
            theme="outline"
            size="large"
            width="100%"
            text="signin_with"
            shape="rectangular"
          />
        </div>
      </div>
    </div>
  );
}
