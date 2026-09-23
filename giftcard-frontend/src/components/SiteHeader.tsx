"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalContext";

interface SiteHeaderProps {
  activePath?: string;
}

export default function SiteHeader({ activePath = "/" }: SiteHeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin =
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN" ||
    user?.role === "MODERATOR";

  const isAdminPath = pathname?.startsWith("/admin") || activePath?.startsWith("/admin");

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-[#e5e5e5]">
      <div className="px-4 md:px-8 lg:px-12 xl:px-16 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <span className="text-[22px] font-extrabold tracking-tight text-black uppercase">
            GIFTNOW.
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {!isAdminPath && !isAdmin && (
            <>
              <Link
                href="/giftnow/buy"
                className={`text-[14px] font-medium transition-colors ${
                  activePath?.includes("/giftnow/buy")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                Buy Card
              </Link>
              <Link
                href="/customer/wallet"
                className={`text-[14px] font-medium transition-colors ${
                  activePath?.includes("/customer/wallet")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                My Wallet
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link
                href="/admin/giftnow/list"
                className={`text-[14px] font-medium transition-colors ${
                  activePath?.includes("/admin/giftnow/list")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                Cards List
              </Link>
              <Link
                href="/admin/giftnow/analytics"
                className={`text-[14px] font-medium transition-colors ${
                  activePath?.includes("/admin/giftnow/analytics")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                Analytics
              </Link>
              <Link
                href="/admin/giftnow/create"
                className={`text-[14px] font-medium transition-colors ${
                  activePath?.includes("/admin/giftnow/create")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                Create Cards
              </Link>
              <Link
                href="/admin/giftnow/occasions"
                className={`text-[14px] font-medium transition-colors ${
                  activePath?.includes("/admin/giftnow/occasions")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                Occasions
              </Link>
              <Link
                href="/admin/giftnow/settings"
                className={`text-[14px] font-medium transition-colors ${
                  activePath?.includes("/admin/giftnow/settings")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                Settings
              </Link>
            </>
          )}
        </nav>

        {/* Right Auth Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-[#000] hidden sm:inline">
                {(user.name as string) || "User"}
              </span>
              <button
                onClick={logout}
                className="border border-black px-4 py-1.5 text-[13px] font-medium rounded hover:bg-slate-50 transition-colors text-black"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuth("signin")}
                className="border border-black px-4 py-1.5 text-[13px] font-medium rounded hover:bg-slate-50 transition-colors bg-white text-black"
              >
                Sign in
              </button>
              <button
                onClick={() => openAuth("register")}
                className="bg-black text-white border border-black px-4 py-1.5 text-[13px] font-medium rounded hover:bg-neutral-800 transition-colors hidden sm:inline-block"
              >
                Get started
              </button>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-black hover:opacity-70 p-1.5 focus:outline-none ml-1 shrink-0"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#e5e5e5] px-4 md:px-8 py-4 space-y-2.5 shadow-sm">
          {!isAdminPath && !isAdmin && (
            <div className="flex flex-col gap-2">
              <Link
                href="/giftnow/buy"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-[14px] font-medium py-1.5 transition-colors ${
                  activePath?.includes("/giftnow/buy")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                Buy Card
              </Link>
              <Link
                href="/customer/wallet"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-[14px] font-medium py-1.5 transition-colors ${
                  activePath?.includes("/customer/wallet")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                My Wallet
              </Link>
            </div>
          )}
          {isAdmin && (
            <div className="flex flex-col gap-2">
              <Link
                href="/admin/giftnow/list"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-[14px] font-medium py-1.5 transition-colors ${
                  activePath?.includes("/admin/giftnow/list")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                Cards List
              </Link>
              <Link
                href="/admin/giftnow/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-[14px] font-medium py-1.5 transition-colors ${
                  activePath?.includes("/admin/giftnow/analytics")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                Analytics
              </Link>
              <Link
                href="/admin/giftnow/create"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-[14px] font-medium py-1.5 transition-colors ${
                  activePath?.includes("/admin/giftnow/create")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                Create Cards
              </Link>
              <Link
                href="/admin/giftnow/occasions"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-[14px] font-medium py-1.5 transition-colors ${
                  activePath?.includes("/admin/giftnow/occasions")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                Occasions
              </Link>
              <Link
                href="/admin/giftnow/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-[14px] font-medium py-1.5 transition-colors ${
                  activePath?.includes("/admin/giftnow/settings")
                    ? "text-black font-semibold"
                    : "text-[#555] hover:text-black"
                }`}
              >
                Settings
              </Link>
            </div>
          )}
          {!user && (
            <div className="flex flex-col gap-2 pt-2.5 border-t border-[#eee]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuth("signin");
                }}
                className="w-full text-left text-[14px] font-medium py-1.5 text-[#555] hover:text-black transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuth("register");
                }}
                className="w-full text-left text-[14px] font-medium py-1.5 text-[#555] hover:text-black transition-colors"
              >
                Get started
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}