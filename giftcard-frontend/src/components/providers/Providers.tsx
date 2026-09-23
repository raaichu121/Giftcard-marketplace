"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { AuthModalProvider } from "@/components/auth/AuthModalContext";
import GiftNowGoogleAuthProvider from "@/components/providers/GoogleAuthProvider";
import { LanguageProvider } from "@/lib/i18n";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <LanguageProvider>
      <GiftNowGoogleAuthProvider>
        <AuthProvider>
          <AuthModalProvider>
            {children}
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
          </AuthModalProvider>
        </AuthProvider>
      </GiftNowGoogleAuthProvider>
    </LanguageProvider>
  );
};

export default Providers;