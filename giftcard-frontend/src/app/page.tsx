"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Layout from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalContext";

function Img({
  className = "",
  iconSize = "w-10 h-10",
}: {
  className?: string;
  iconSize?: string;
}) {
  return (
    <div
      className={`bg-[#d9d9d9] flex items-center justify-center ${className}`}
    >
      <svg
        className={`${iconSize} text-[#b3b3b3]`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

export default function HomePage() {
  const { user, isCustomer } = useAuth();
  const { openAuth } = useAuthModal();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [email, setEmail] = useState("");

  const faqItems = [
    {
      q: "Do gift cards have an expiration date?",
      a: "No. GiftNow cards never expire. Your balance stays with you forever, whenever you need it.",
    },
    {
      q: "What payment methods are supported?",
      a: "We accept eSewa, Khalti, ConnectIPS, and major bank transfers. More payment options are being added regularly.",
    },
    {
      q: "How secure are the codes?",
      a: "Every GiftNow code is a 16-character alphanumeric code secured with industry-standard encryption and fraud detection.",
    },
    {
      q: "Can I top up my balance?",
      a: "Yes, GiftNow cards can be topped up anytime by visiting any Su Indra Group outlet or through the online portal.",
    },
    {
      q: "How do I redeem my balance?",
      a: "Simply present your gift code at checkout at any Su Indra Group partner merchant, either online or in-store.",
    },
  ];

  return (
    <Layout activePath="/" showFooter>
      {/* ── 1 · HERO ── */}
      <section 
        className="relative w-full h-[calc(100vh+4rem)] flex items-center justify-start -mt-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/giftnowbackground.png')" }}
      >
        <div className="absolute inset-0 bg-black/50 md:bg-gradient-to-r md:from-black/80 md:via-black/45 md:to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 w-full pt-20 flex flex-col items-start text-left">
          <h1 className="text-3xl md:text-[60px] font-bold text-white mb-4 leading-[1.2] max-w-xl md:max-w-2xl">
            Gift cards that work
            <br />
            everywhere
          </h1>
          <p className="text-slate-300 text-sm md:text-base mb-10 max-w-md md:max-w-lg leading-relaxed">
            Buy, send, and redeem gift cards instantly. Works across all
            Su-indra Groups stores and merchants on any platform physical,
            online, or in-store. Start gifting today.
          </p>
          <div className="flex gap-3 justify-start">
            {!user || !isCustomer ? (
              <button
                type="button"
                onClick={() => openAuth("signin")}
                className="px-6 py-2.5 bg-white text-[#1a1a1a] font-medium rounded text-sm hover:bg-gray-100 transition-colors"
              >
                Buy now
              </button>
            ) : (
              <Link
                href="/giftnow/buy"
                className="px-6 py-2.5 bg-white text-[#1a1a1a] font-medium rounded text-sm hover:bg-gray-100 transition-colors"
              >
                Buy now
              </Link>
            )}
            <Link
              href="/giftnow/redeem"
              className="px-6 py-2.5 border border-white/50 text-white font-medium rounded text-sm hover:bg-white/10 transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2 · EVERYTHING YOU NEED IN ONE PLACE ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-[960px] mx-auto px-4">
          <p className="text-[11px] font-medium text-[#888] uppercase tracking-[0.15em] text-center mb-1.5">
            Seamless
          </p>
          <h2 className="text-[22px] md:text-[28px] font-bold text-[#1a1a1a] text-center mb-3">
            Everything you need in one place
          </h2>
          <p className="text-center text-[#888] text-[13px] mb-12">
            Buy digital or physical cards, redeem instantly, spend freely across
            our entire network
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Left: Large card with image and text below */}
            <div className="border border-[#e5e5e5] rounded-lg overflow-hidden flex flex-col bg-white">
              <div className="relative w-full h-[280px]">
                <Image
                  src="/assets/One card, endless possibilities.png"
                  alt="One card, endless possibilities"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                <p className="text-[11px] font-medium text-[#888] uppercase tracking-wide mb-1.5">
                  Platform
                </p>
                <h3 className="text-[22px] font-bold text-[#1a1a1a] mb-3">
                  One card, endless possibilities
                </h3>
                <p className="text-[#666] text-[13.5px] leading-relaxed mb-6">
                  Use your balance across all sellers and categories without
                  limits
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <Link
                    href="/about"
                    className="px-5 py-2 border border-[#1a1a1a] text-[#1a1a1a] text-[13px] font-medium rounded hover:bg-[#f5f5f5] transition-colors text-center"
                  >
                    Explore
                  </Link>
                  <Link
                    href="/about"
                    className="text-[13px] font-medium text-[#1a1a1a] flex items-center gap-1 hover:underline"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: 2-row layout */}
            <div className="flex flex-col gap-6">
              {/* Top row: 2 cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Card 1: Instant delivery */}
                <div className="border border-[#e5e5e5] rounded-lg p-6 flex flex-col bg-white">
                  <svg
                    className="w-8 h-8 text-[#1a1a1a] mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <rect x="4" y="4" width="6" height="6" rx="1" />
                    <rect x="14" y="4" width="6" height="6" rx="1" />
                    <rect x="4" y="14" width="6" height="6" rx="1" />
                    <rect x="14" y="14" width="6" height="6" rx="1" />
                  </svg>
                  <h4 className="text-[15px] font-bold text-[#1a1a1a] mb-2">
                    Instant delivery, every time
                  </h4>
                  <p className="text-[#666] text-[12.5px] leading-relaxed mb-4">
                    Digital cards arrive in seconds, physical cards ship tracked
                  </p>
                  <Link
                    href="/about"
                    className="mt-auto text-[13px] font-medium text-[#1a1a1a] flex items-center gap-1 hover:underline"
                  >
                    Learn more
                  </Link>
                </div>

                {/* Card 2: Balance */}
                <div className="border border-[#e5e5e5] rounded-lg p-6 flex flex-col bg-white">
                  <svg
                    className="w-8 h-8 text-[#1a1a1a] mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                  >
                    <path d="M12 4v16M9 20h6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 8h16" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 8l-3 6h6l-3-6v9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17 8l-3 6h6l-3-6v9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h4 className="text-[15px] font-bold text-[#1a1a1a] mb-2">
                    Your balance, your rules
                  </h4>
                  <p className="text-[#666] text-[12.5px] leading-relaxed mb-4">
                    Denominations from NPR 100 to NPR 1,00,000 in any amount you
                    choose
                  </p>
                  <Link
                    href="/about"
                    className="mt-auto text-[13px] font-medium text-[#1a1a1a] flex items-center gap-1 hover:underline"
                  >
                    Learn more
                  </Link>
                </div>
              </div>

              {/* Bottom: 1 large card with horizontal split */}
              <div className="border border-[#e5e5e5] rounded-lg overflow-hidden flex-1 grid grid-cols-1 sm:grid-cols-2 bg-white">
                <div className="relative w-full h-full min-h-[160px]">
                  <Image
                    src="/assets/Protected by industry standards.png"
                    alt="Protected by industry standards"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <p className="text-[11px] font-medium text-[#888] uppercase tracking-wide mb-1.5">
                    Security
                  </p>
                  <h4 className="text-[16px] font-bold text-[#1a1a1a] mb-2">
                    Protected by industry standards
                  </h4>
                  <p className="text-[#666] text-[12.5px] leading-relaxed mb-4">
                    Every transaction encrypted, every code secure, every
                    wallet verified
                  </p>
                  <Link
                    href="/about"
                    className="text-[13px] font-medium text-[#1a1a1a] flex items-center gap-1 hover:underline"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 · THE NUMBERS SPEAK FOR THEMSELVES ── */}
      <section className="bg-[#fafafa] border-y border-[#e5e5e5] py-16 md:py-20">
        <div className="max-w-[960px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-10">
            <div>
              <h2 className="text-[22px] md:text-[28px] font-bold text-[#1a1a1a] leading-tight">
                The numbers speak for
                <br />
                themselves
              </h2>
            </div>
            <div>
              <p className="text-[#666] text-[13px] leading-relaxed">
                GiftNow processes transactions across Nepal&apos;s largest
                e-commerce ecosystem, reaching thousands of buyers across the
                entire Su Indra Groups network.
              </p>
              <div className="flex gap-3 mt-4">
                <button className="px-4 py-2 bg-[#1a1a1a] text-white text-[12px] font-medium rounded hover:bg-[#333] transition-colors">
                  Learn more
                </button>
                <button className="px-4 py-2 border border-[#e5e5e5] text-[#1a1a1a] text-[12px] font-medium rounded hover:border-[#ccc] transition-colors">
                  Sign up
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 text-center border-t border-[#e5e5e5] pt-8 gap-y-6 sm:gap-y-0">
            <div className="py-4">
              <p className="text-[32px] md:text-[44px] font-bold text-[#1a1a1a] leading-tight">
                50K+
              </p>
              <p className="text-[#888] text-[13px] mt-1">Cards issued</p>
            </div>
            <div className="py-4 border-y sm:border-y-0 sm:border-x border-[#e5e5e5]">
              <p className="text-[32px] md:text-[44px] font-bold text-[#1a1a1a] leading-tight">
                NPR 2.5Cr
              </p>
              <p className="text-[#888] text-[13px] mt-1">Total redeemed</p>
            </div>
            <div className="py-4">
              <p className="text-[32px] md:text-[44px] font-bold text-[#1a1a1a] leading-tight">
                500+
              </p>
              <p className="text-[#888] text-[13px] mt-1">
                Sellers and companies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 · DIGITAL OR PHYSICAL DELIVERY ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-[960px] mx-auto px-4">
          <p className="text-[11px] font-medium text-[#888] uppercase tracking-[0.15em] text-center mb-1.5">
            Instant
          </p>
          <h2 className="text-[22px] md:text-[28px] font-bold text-[#1a1a1a] text-center mb-3">
            Digital or physical delivery
          </h2>
          <p className="text-center text-[#888] text-[13px] mb-12">
            Send it now or send it later
          </p>

          <div className="flex flex-col gap-8">
            {/* Email Delivery Card */}
            <div className="border border-[#e5e5e5] rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <p className="text-[11px] font-medium text-[#888] uppercase tracking-wide mb-1.5">
                  Email
                </p>
                <h3 className="text-[22px] font-bold text-[#1a1a1a] mb-3">
                  Instant email delivery
                </h3>
                <p className="text-[#666] text-[13.5px] leading-relaxed mb-6">
                  Your recipient gets their card in seconds. No waiting. No delays. Just pure gifting speed.
                </p>
                <div className="flex items-center gap-4">
                  {!user || !isCustomer ? (
                    <button
                      type="button"
                      onClick={() => openAuth("signin")}
                      className="px-5 py-2 border border-[#1a1a1a] text-[#1a1a1a] text-[13px] font-medium rounded hover:bg-[#f5f5f5] transition-colors"
                    >
                      Buy
                    </button>
                  ) : (
                    <Link
                      href="/giftnow/buy"
                      className="px-5 py-2 border border-[#1a1a1a] text-[#1a1a1a] text-[13px] font-medium rounded hover:bg-[#f5f5f5] transition-colors text-center"
                    >
                      Buy
                    </Link>
                  )}
                  <Link
                    href="/about"
                    className="text-[13px] font-medium text-[#1a1a1a] flex items-center gap-1 hover:underline"
                  >
                    Learn
                  </Link>
                </div>
              </div>
              <div className="relative w-full min-h-[240px] md:h-full bg-white">
                <Image
                  src="/assets/Instant email delivery.png"
                  alt="Instant email delivery"
                  fill
                  className="object-contain p-6"
                />
              </div>
            </div>

            {/* Physical Delivery Card */}
            <div className="border border-[#e5e5e5] rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
              <div className="relative w-full min-h-[240px] md:h-full order-2 md:order-1 bg-white">
                <Image
                  src="/assets/Hassle-free redemption.png"
                  alt="Hassle-free redemption"
                  fill
                  className="object-contain p-6"
                />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center order-1 md:order-2">
                <p className="text-[11px] font-medium text-[#888] uppercase tracking-wide mb-1.5">
                  Physical
                </p>
                <h3 className="text-[22px] font-bold text-[#1a1a1a] mb-3">
                  Hassle-free redemption
                </h3>
                <p className="text-[#666] text-[13.5px] leading-relaxed mb-6">
                  Beautiful printed cards shipped anywhere in Nepal within 2-3 business days with premium packaging.
                </p>
                <div className="flex items-center gap-4">
                  {!user || !isCustomer ? (
                    <button
                      type="button"
                      onClick={() => openAuth("signin")}
                      className="px-5 py-2 border border-[#1a1a1a] text-[#1a1a1a] text-[13px] font-medium rounded hover:bg-[#f5f5f5] transition-colors"
                    >
                      Buy
                    </button>
                  ) : (
                    <Link
                      href="/giftnow/buy"
                      className="px-5 py-2 border border-[#1a1a1a] text-[#1a1a1a] text-[13px] font-medium rounded hover:bg-[#f5f5f5] transition-colors text-center"
                    >
                      Buy
                    </Link>
                  )}
                  <Link
                    href="/faq"
                    className="text-[13px] font-medium text-[#1a1a1a] flex items-center gap-1 hover:underline"
                  >
                    Learn
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5 · GIFTING MADE SIMPLE ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-[960px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="relative rounded-lg overflow-hidden bg-[#8c8c8c] min-h-[460px] flex flex-col justify-center items-center p-8 text-center text-white">
              <Image
                src="/assets/Gifting made simple.png"
                alt="Gifting made simple"
                fill
                className="object-cover opacity-45 mix-blend-multiply"
              />

              {/* Content overlay */}
              <div className="relative z-10 flex flex-col items-center max-w-sm">
                <p className="text-[11px] font-medium text-white/80 uppercase tracking-[0.15em] mb-2">
                  Peace
                </p>
                <h3 className="text-[28px] font-bold mb-4 leading-tight">
                  Gifting made simple
                </h3>
                <p className="text-white/90 text-[13.5px] leading-relaxed mb-6">
                  No guessing what they want. No awkward exchanges. A GiftNow card lets them choose, and you rest easy knowing they'll use it.
                </p>
                <div className="flex items-center gap-4">
                  {!user || !isCustomer ? (
                    <button
                      type="button"
                      onClick={() => openAuth("signin")}
                      className="px-5 py-2 border border-white text-white text-[13px] font-medium rounded hover:bg-white/10 transition-colors"
                    >
                      Buy
                    </button>
                  ) : (
                    <Link
                      href="/giftnow/buy"
                      className="px-5 py-2 border border-white text-white text-[13px] font-medium rounded hover:bg-white/10 transition-colors text-center"
                    >
                      Buy
                    </Link>
                  )}
                  <Link
                    href="/about"
                    className="text-[13px] font-medium text-white flex items-center gap-1 hover:underline"
                  >
                    Learn <span className="text-[10px] font-bold">&gt;</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Stacked feature cards */}
            <div className="flex flex-col gap-6 justify-between">
              {/* Card 1: Seamless redemption */}
              <div className="border border-[#e5e5e5] rounded-lg p-8 flex flex-col items-center text-center justify-center bg-white flex-1">
                <svg
                  className="w-8 h-8 text-[#1a1a1a] mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.2-1.5-3-1.5-3 0s1.8 2 3 2.5m0-2.5c1.2-1.5 3-1.5 3 0s-1.8 2-3 2.5"
                  />
                  <rect
                    x="4"
                    y="11"
                    width="16"
                    height="9"
                    rx="1"
                    strokeWidth={1.5}
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 14.5h16"
                  />
                </svg>
                <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-3">
                  Seamless redemption
                </h3>
                <p className="text-[#666] text-[13.5px] leading-relaxed mb-5 max-w-sm">
                  Redeem your card in seconds and your balance locks to your wallet. Spend it on your next purchase without friction.
                </p>
                <Link
                  href="/about"
                  className="text-[13px] font-medium text-[#1a1a1a] hover:underline"
                >
                  Learn
                </Link>
              </div>

              {/* Card 2: Fraud protection */}
              <div className="border border-[#e5e5e5] rounded-lg p-8 flex flex-col items-center text-center justify-center bg-white flex-1">
                <svg
                  className="w-8 h-8 text-[#1a1a1a] mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.2-1.5-3-1.5-3 0s1.8 2 3 2.5m0-2.5c1.2-1.5 3-1.5 3 0s-1.8 2-3 2.5"
                  />
                  <rect
                    x="4"
                    y="11"
                    width="16"
                    height="9"
                    rx="1"
                    strokeWidth={1.5}
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 14.5h16"
                  />
                </svg>
                <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-3">
                  Fraud protection
                </h3>
                <p className="text-[#666] text-[13.5px] leading-relaxed mb-5 max-w-sm">
                  Each card is secured by a unique 22-character code and QR verification. Your balance cannot be transferred once redeemed.
                </p>
                <Link
                  href="/faq"
                  className="text-[13px] font-medium text-[#1a1a1a] hover:underline"
                >
                  Learn
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 · SECURITY BUILT INTO EVERY TRANSACTION ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-[960px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[11px] font-medium text-[#888] uppercase tracking-[0.15em] mb-1.5">
                Trust
              </p>
              <h2 className="text-[22px] md:text-[28px] font-bold text-[#1a1a1a] mb-4">
                Security built into every
                <br />
                transaction
              </h2>
              <p className="text-[#666] text-[13px] leading-relaxed mb-6">
                Your gift cards are protected with enterprise-grade fraud
                prevention. Every code is unique and encrypted — no one can
                clone or misuse your gift cards.
              </p>
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div>
                  <h4 className="text-[13px] font-bold text-[#1a1a1a] mb-1">
                    Fraud prevention
                  </h4>
                  <p className="text-[#666] text-[12px] leading-relaxed">
                    Real-time scanning and instant alerts detect suspicious
                    codes and stop fraudulent transactions.
                  </p>
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#1a1a1a] mb-1">
                    Encrypted codes
                  </h4>
                  <p className="text-[#666] text-[12px] leading-relaxed">
                    All codes are generated and delivered with AES-256
                    encryption protecting your card balances end-to-end.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-[#1a1a1a] text-white text-[12px] font-medium rounded hover:bg-[#333] transition-colors">
                  Security
                </button>
                <button className="px-4 py-2 border border-[#e5e5e5] text-[#1a1a1a] text-[12px] font-medium rounded hover:border-[#ccc] transition-colors">
                  Learn more
                </button>
              </div>
            </div>
            <Image
              src="/assets/giftcard.png"
              alt="No Expiry - Gift Card"
              width={500}
              height={300}
              className="w-full h-auto rounded-lg object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── 7 · YOUR BALANCE NEVER EXPIRES ── */}
      <section className="bg-[#fafafa] border-y border-[#e5e5e5] py-16 md:py-20">
        <div className="max-w-[960px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[11px] font-medium text-[#888] uppercase tracking-[0.15em] mb-1.5">
                No expiry
              </p>
              <h2 className="text-[22px] md:text-[28px] font-bold text-[#1a1a1a] mb-3">
                Your balance never expires
              </h2>
              <p className="text-[#666] text-[13px] leading-relaxed mb-5">
                No expiration date. No hidden charges. Your GiftNow balance
                stays intact forever. Use it whenever you want, at any Su Indra
                Group store or partner platform.
              </p>
              <ul className="space-y-2.5 mb-6">
                <li className="flex items-center gap-2.5">
                  <svg
                    className="w-4 h-4 text-[#22c55e] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-[#444] text-[13px]">
                    Lifetime validity
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg
                    className="w-4 h-4 text-[#22c55e] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-[#444] text-[13px]">
                    No hidden limits
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg
                    className="w-4 h-4 text-[#22c55e] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-[#444] text-[13px]">
                    Use it on any day, at any time, at any place
                  </span>
                </li>
              </ul>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-[#1a1a1a] text-white text-[12px] font-medium rounded hover:bg-[#333] transition-colors">
                  Redeem
                </button>
                <button className="px-4 py-2 border border-[#e5e5e5] text-[#1a1a1a] text-[12px] font-medium rounded hover:border-[#ccc] transition-colors">
                  Learn more
                </button>
              </div>
            </div>
            <Image
              src="/assets/giftcard1.png"
              alt="No Expiry - Gift Card"
              width={500}
              height={300}
              className="w-full h-auto rounded-lg object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── 8 · REAL STORIES ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-[960px] mx-auto px-4">
          <p className="text-[11px] font-medium text-[#888] uppercase tracking-[0.15em] text-center mb-1.5">
            Testimonials
          </p>
          <h2 className="text-[22px] md:text-[28px] font-bold text-[#1a1a1a] text-center mb-2">
            Real stories
          </h2>
          <p className="text-center text-[#888] text-[13px] mb-10">
            Hear from real people who use GiftNow every day
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                stars: 5,
                name: "Priya Sharma",
                role: "Customer Review",
                text: "I use GiftNow to send gifts to friends and family in Kathmandu and they love it for the easy instant delivery and the ability to use it anywhere.",
              },
              {
                stars: 4,
                name: "Rajan K.",
                role: "HR Manager, TechCorp",
                text: "We use GiftNow for employee rewards. The bulk ordering and instant delivery save us hours every month.",
              },
              {
                stars: 5,
                name: "Anita Tamang",
                role: "Frequent Gifter",
                text: "The fact that cards never expire means I can buy them now and give them later. So convenient for planning ahead!",
              },
            ].map((t, i) => (
              <div key={i} className="border border-[#e5e5e5] rounded-lg p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <span key={s} className="text-[#f59e0b] text-[14px]">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-[#444] text-[13px] leading-relaxed mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#d9d9d9] flex items-center justify-center text-[11px] font-bold text-[#666]">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1a1a1a]">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-[#888]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9 · STAY IN THE LOOP ── */}
      <section className="bg-[#2d2d2d] py-14 md:py-16">
        <div className="max-w-[520px] mx-auto px-4 text-center">
          <h2 className="text-[22px] md:text-[26px] font-bold text-white mb-2">
            Stay in the loop
          </h2>
          <p className="text-[#999] text-[13px] mb-7">
            Get updates on our latest releases, merchant offers and platform
            news.
          </p>
          <div className="flex gap-2.5">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded text-[#1a1a1a] outline-none text-[13px] bg-white"
            />
            <Link href="auth/signup">
              <button className="px-5 py-2.5 bg-white text-[#1a1a1a] font-medium rounded text-[13px] hover:bg-gray-100 transition-colors whitespace-nowrap">
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 10 · FAQ ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-[640px] mx-auto px-4">
          <h2 className="text-[22px] md:text-[28px] font-bold text-[#1a1a1a] text-center mb-2">
            FAQ
          </h2>
          <p className="text-center text-[#888] text-[13px] mb-10">
            Find answers to common questions about GiftNow
          </p>

          <div className="space-y-2.5">
            {faqItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full text-left border border-[#e5e5e5] rounded-lg px-5 py-4 hover:border-[#ccc] transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-[#1a1a1a] text-[14px]">
                    {item.q}
                  </h3>
                  <span className="text-[18px] text-[#aaa] flex-shrink-0 leading-none font-light">
                    {expandedFaq === idx ? "−" : "+"}
                  </span>
                </div>
                {expandedFaq === idx && (
                  <p className="text-[#666] text-[13px] mt-3 leading-relaxed">
                    {item.a}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11 · GET STARTED CTA ── */}
      <section className="bg-[#fafafa] border-t border-[#e5e5e5] py-14 md:py-16">
        <div className="max-w-[520px] mx-auto px-4 text-center">
          <h2 className="text-[22px] md:text-[26px] font-bold text-[#1a1a1a] mb-3">
            Need more help?
          </h2>
          <p className="text-[#666] text-[13px] mb-7 leading-relaxed">
            Reach out on our support page.
          </p>
          <Link href="/contact">
            <button className="inline-block px-8 py-2.5 bg-[#1a1a1a] text-white font-medium rounded text-[13px] hover:bg-[#333] transition-colors">
              Contact us
            </button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}