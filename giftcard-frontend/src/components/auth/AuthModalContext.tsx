"use client";

import React, { createContext, useContext, useCallback } from "react";
import type { AuthTab } from "@/components/auth/AuthPanel";
import { useRouter } from "next/navigation";

interface AuthModalContextValue {
  openAuth: (tab?: AuthTab) => void;
  closeAuth: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const openAuth = useCallback(
    (next: AuthTab = "signin") => {
      router.push(next === "register" ? "/auth/signup" : "/auth/login");
    },
    [router],
  );

  const closeAuth = useCallback(() => {}, []);

  return (
    <AuthModalContext.Provider value={{ openAuth, closeAuth }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}
