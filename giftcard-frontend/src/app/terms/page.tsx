"use client";

import React from "react";
import Layout from "@/components/Layout";

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: [
        "By accessing or using GiftNow, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.",
        "These terms apply to all users of the platform, including buyers, recipients, merchants, and corporate account holders.",
      ],
    },
    {
      title: "2. Gift Card Purchases",
      content: [
        "Gift cards can be purchased in denominations between NPR 100 and NPR 1,00,000. All purchases are final and non-refundable once a gift card code has been generated and delivered.",
        "We reserve the right to limit purchases or cancel orders suspected of fraudulent activity. Bulk purchases exceeding NPR 5,00,000 require identity verification.",
      ],
    },
    {
      title: "3. Redemption & Wallet",
      content: [
        "Gift card codes can be redeemed by entering the code on the redemption page while signed in to a valid customer account. Once redeemed, the balance is credited to your GiftNow wallet.",
        "Wallet balances are non-transferable and cannot be converted to cash. Balances do not expire. You may use your wallet balance for purchases at any GiftNow-supported merchant.",
      ],
    },
    {
      title: "4. Account Responsibilities",
      content: [
        "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.",
        "You must provide accurate and complete information when creating an account. We reserve the right to suspend or terminate accounts that contain false or misleading information.",
      ],
    },
    {
      title: "5. Prohibited Activities",
      content: [
        "You may not use GiftNow for any unlawful purpose, including money laundering, fraud, or the purchase of illegal goods or services.",
        "Attempting to reverse-engineer gift card codes, exploit system vulnerabilities, or interfere with platform operations is strictly prohibited and may result in legal action.",
      ],
    },
    {
      title: "6. Merchant Terms",
      content: [
        "Merchants who accept GiftNow payments agree to honour the full face value of gift card balances. Settlements are processed in NPR within 3-5 business days.",
        "Merchants are responsible for ensuring their integration with the GiftNow API meets our technical and security requirements.",
      ],
    },
    {
      title: "7. Limitation of Liability",
      content: [
        "GiftNow and Su Indra Groups Pvt. Ltd. shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.",
        "Our total liability in any matter arising out of these terms shall not exceed the amount you paid for the specific gift card transaction in question.",
      ],
    },
    {
      title: "8. Governing Law",
      content: [
        "These Terms are governed by the laws of Nepal. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Kathmandu, Nepal.",
      ],
    },
  ];

  return (
    <Layout activePath="/terms" showFooter>
      <div className="bg-white min-h-screen text-black">
        {/* Hero */}
        <section className="pt-20 pb-12 text-center">
          <div className="max-w-[800px] mx-auto px-4">
            <h1 className="text-[36px] md:text-[44px] font-bold text-black tracking-tight leading-tight">
              Terms of Service
            </h1>
            <p className="text-[14px] text-[#555] mt-4">
              Last updated: July 1, 2026
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="pb-20">
          <div className="max-w-[720px] mx-auto px-4 md:px-6">
            <p className="text-[13px] text-[#555] leading-relaxed mb-10">
              These Terms of Service govern your use of the GiftNow platform operated by Su Indra Groups Pvt. Ltd., Janakpurdham, Nepal. Please read them carefully before using our services.
            </p>

            <div className="space-y-8">
              {sections.map((s, i) => (
                <div key={i}>
                  <h2 className="text-[16px] font-bold text-black mb-3">{s.title}</h2>
                  <div className="space-y-3">
                    {s.content.map((p, pi) => (
                      <p key={pi} className="text-[13px] text-[#555] leading-relaxed">{p}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e5e5e5] mt-12 pt-8">
              <p className="text-[13px] text-[#555] leading-relaxed">
                Questions about these terms? Contact us at{" "}
                <a href="legal@giftnow.com" className="font-medium text-black underline">
                  legal@giftnow.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}