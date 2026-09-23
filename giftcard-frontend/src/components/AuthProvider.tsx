"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI, getStoredUser, clearAuth, saveAuth } from "@/lib/api";

export interface User {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  loginWithOtp: (
    email?: string,
    phone?: string,
    code?: string,
    firstName?: string,
    lastName?: string,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isCustomer: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await authAPI.me();
      if (res.data) {
        setUser(res.data as Record<string, unknown>);
        localStorage.setItem("authUser", JSON.stringify(res.data));
      }
    } catch {
      clearAuth();
      setUser(null);
    }
  };

  useEffect(() => {
    const stored = getStoredUser();
    const token = localStorage.getItem("authToken");
    if (stored && token) {
      setUser(stored);
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    const { token, user: u } = res.data as {
      token: string;
      user: Record<string, unknown>;
    };
    saveAuth(token, u);
    setUser(u);
  };

  const loginWithGoogle = async (credential: string) => {
    const res = await authAPI.googleLogin(credential);
    const { token, user: u } = res.data as {
      token: string;
      user: Record<string, unknown>;
    };
    saveAuth(token, u);
    setUser(u);
  };

  const loginWithOtp = async (
    email?: string,
    phone?: string,
    code?: string,
    firstName?: string,
    lastName?: string,
  ) => {
    const res = await authAPI.verifyOtp(email, phone, code, firstName, lastName);
    const { token, user: u } = res.data as {
      token: string;
      user: Record<string, unknown>;
    };
    saveAuth(token, u);
    setUser(u);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const isCustomer = user?.role === "CUSTOMER";
  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        loginWithOtp,
        logout,
        refreshUser,
        isCustomer,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
