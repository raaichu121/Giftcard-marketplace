"use client";

import React, { useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<{ [key: number]: boolean }>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
  });

  const toggleItem = (index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const faqList = [
    {
      q: "How do I buy a card?",
      a: "Visit the purchase page and select your delivery method, digital for instant email or physical for tracked delivery. Choose your amount between NPR 100 and NPR 1,00,000, pick a seasonal template, and complete checkout with Fonepay, eSewa, or cash on delivery.",
    },
    {
      q: "Do cards ever expire?",
      a: "No. GiftNow cards remain valid indefinitely. Your balance stays in your wallet until you use it, with no time pressure or hidden expiration dates.",
    },
    {
      q: "Can I use my balance anywhere?",
      a: "Yes. Your wallet balance works across all Su Indra Groups sellers and product categories. Apply it at checkout and watch it deduct automatically after any coupons.",
    },
    {
      q: "What if I lose my card code?",
      a: "Your balance is tied to your account wallet once redeemed. If you lose the code before claiming it, contact support immediately with your order details and we'll help recover it.",
    },
    {
      q: "Can I transfer my balance?",
      a: "No. Once redeemed to your wallet, the balance is locked to your account and cannot be transferred to another person or account.",
    },
  ];

  return (
    <Layout activePath="/faq" showFooter>
      <div className="bg-white min-h-screen text-black">
        {/* Hero Section */}
        <section className="pt-20 pb-16 text-center">
          <div className="max-w-[800px] mx-auto px-4">
            <h1 className="text-[36px] md:text-[44px] font-bold text-black tracking-tight leading-tight">
              Frequently Asked Questions
            </h1>
          {/* Accordion Boxes */}
            <div className="space-y-5 mt-12 text-left max-w-[640px] mx-auto">
              {faqList.map((item, idx) => {
                const isOpen = openItems[idx];
                return (
                  <div
                    key={idx}
                    className="border border-black bg-white transition-all duration-200"
                  >
                    <button
                      onClick={() => toggleItem(idx)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-[15px] text-black"
                    >
                      <span>{item.q}</span>
                      <span className="text-[16px] text-black shrink-0">
                        {isOpen ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-[13px] text-[#333] leading-relaxed border-t border-transparent">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Need More Help Section */}
        <section className="border-t border-[#e5e5e5] py-20 text-center">
          <div className="max-w-[600px] mx-auto px-4">
            <h2 className="text-[24px] md:text-[28px] font-bold text-black">
              Need more help?
            </h2>
            <p className="text-[13px] md:text-[14px] text-[#555] mt-2 mb-8">
              Our support team is ready to assist with any questions.
            </p>
            <Link
              href="/contact"
              className="inline-block border border-black px-6 py-2.5 text-[13px] font-medium rounded hover:bg-slate-50 transition-colors text-black"
            >
              Contact
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
