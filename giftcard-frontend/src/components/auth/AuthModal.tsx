"use client";

import React, { useEffect } from "react";
import AuthPanel, { type AuthTab } from "@/components/auth/AuthPanel";

interface AuthModalProps {
  open: boolean;
  tab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  onClose: () => void;
}

export default function AuthModal({ open, tab, onTabChange, onClose }: AuthModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in or register"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="relative w-full max-w-md">
        <AuthPanel
          initialTab={tab}
          onTabChange={onTabChange}
          onClose={onClose}
          showClose
        />
      </div>
    </div>
  );
}
