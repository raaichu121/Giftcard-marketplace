"use client";

import React from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalContext";

export default function BusinessPage() {
  const { user } = useAuth();
  const { openAuth } = useAuthModal();

  const features = [
    {
      title: "Bulk purchasing",
      desc: "Order hundreds of gift cards at once with volume discounts. Perfect for holiday campaigns, employee rewards, and client appreciation programs.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: "API integration",
      desc: "Integrate our REST API into your checkout, CRM, or HR platform. Accept GiftNow as a payment method or distribute cards programmatically.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      title: "Custom branding",
      desc: "Add your company logo, colours, and messaging to gift cards. Create a premium branded experience for your recipients.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      title: "Analytics dashboard",
      desc: "Track redemption rates, card usage, and ROI in real-time. Export reports and integrate with your accounting tools.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Automated delivery",
      desc: "Schedule gift card deliveries by email or SMS. Set up recurring campaigns for birthdays, anniversaries, and milestones.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Dedicated support",
      desc: "Get a dedicated account manager, priority support, and custom SLA agreements for enterprise-grade reliability.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <Layout activePath="/business" showFooter>
      <div className="bg-white min-h-screen text-black">
        {/* Hero */}
        <section className="bg-[#1a1a1a] py-20 md:py-28">
          <div className="max-w-[800px] mx-auto px-4 text-center">
            <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-3">For business</p>
            <h1 className="text-[32px] md:text-[44px] font-bold text-white tracking-tight leading-tight">
              Gift cards for your business
            </h1>
            <p className="text-[14px] md:text-[15px] text-[#999] mt-4 max-w-[560px] mx-auto leading-relaxed">
              Reward employees, delight customers, and drive engagement with GiftNow&apos;s enterprise gift card solutions.
            </p>
            <div className="flex gap-3 justify-center mt-8">
              {!user ? (
                <button
                  onClick={() => openAuth("register")}
                  className="px-6 py-2.5 bg-white text-black text-[13px] font-medium rounded hover:bg-gray-100 transition-colors"
                >
                  Get started
                </button>
              ) : (
                <Link
                  href="/giftnow/buy"
                  className="px-6 py-2.5 bg-white text-black text-[13px] font-medium rounded hover:bg-gray-100 transition-colors"
                >
                  Get started
                </Link>
              )}
              <Link
                href="/contact"
                className="px-6 py-2.5 border border-white/40 text-white text-[13px] font-medium rounded hover:bg-white/10 transition-colors"
              >
                Talk to sales
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 md:py-20">
          <div className="max-w-[960px] mx-auto px-4 md:px-6">
            <h2 className="text-[22px] md:text-[28px] font-bold text-black text-center mb-2">
              Everything your business needs
            </h2>
            <p className="text-[13px] text-[#555] text-center mb-12">
              Tools to purchase, distribute, and track gift cards at scale
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="border border-[#e5e5e5] rounded-lg p-6 hover:border-[#ccc] transition-colors">
                  <div className="w-10 h-10 bg-[#f5f5f5] rounded-full flex items-center justify-center mb-4 text-black">
                    {f.icon}
                  </div>
                  <h3 className="text-[15px] font-bold text-black mb-2">{f.title}</h3>
                  <p className="text-[13px] text-[#555] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-[#fafafa] border-y border-[#e5e5e5]">
          <div className="max-w-[960px] mx-auto px-4 md:px-6">
            <h2 className="text-[22px] font-bold text-black text-center mb-10">Trusted by leading businesses</h2>
            <div className="grid grid-cols-3 text-center">
              <div className="py-4">
                <p className="text-[32px] md:text-[40px] font-bold text-black">500+</p>
                <p className="text-[12px] text-[#888] mt-1">Merchant partners</p>
              </div>
              <div className="py-4 border-x border-[#e5e5e5]">
                <p className="text-[32px] md:text-[40px] font-bold text-black">NPR 2.5Cr</p>
                <p className="text-[12px] text-[#888] mt-1">Processed</p>
              </div>
              <div className="py-4">
                <p className="text-[32px] md:text-[40px] font-bold text-black">99.9%</p>
                <p className="text-[12px] text-[#888] mt-1">Uptime</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="max-w-[500px] mx-auto px-4">
            <h2 className="text-[22px] font-bold text-black mb-2">Ready to scale your gifting?</h2>
            <p className="text-[13px] text-[#555] mb-6">
              Let&apos;s build a custom solution for your business.
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 py-2.5 bg-black text-white text-[13px] font-medium rounded hover:bg-neutral-800 transition-colors"
            >
              Contact sales
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
