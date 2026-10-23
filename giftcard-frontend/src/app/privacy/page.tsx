"use client";

import React from "react";
import Layout from "@/components/Layout";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "1. Information we collect",
      content: [
        "We collect information you provide directly to us, including your name, email address, phone number, and payment information when you create an account, purchase a gift card, or contact our support team.",
        "We also automatically collect certain information when you use our platform, including your IP address, browser type, device identifiers, pages visited, and actions taken on the site.",
      ],
    },
    {
      title: "2. How we use your information",
      content: [
        "We use the information we collect to process transactions, maintain your wallet balance, and provide customer support. Your data helps us detect and prevent fraud, improve our services, and send you transaction confirmations.",
        "With your consent, we may send you marketing communications about new features, promotions, and partner offers. You can opt out at any time through your account settings.",
      ],
    },
    {
      title: "3. Information sharing",
      content: [
        "We do not sell your personal information to third parties. We share your data only with service providers who assist us in operating the platform (payment processors, email services, fraud prevention tools), and only to the extent necessary for them to perform their functions.",
        "We may disclose your information if required by law, subpoena, or government request, or to protect the rights, property, or safety of GiftNow, our users, or the public.",
      ],
    },
    {
      title: "4. Data security",
      content: [
        "We implement industry-standard security measures including AES-256 encryption for all gift card codes, TLS encryption for data in transit, and multi-factor authentication for account access.",
        "While we take extensive precautions to protect your data, no method of electronic storage or transmission is 100% secure. We encourage you to use strong passwords and keep your account credentials confidential.",
      ],
    },
    {
      title: "5. Data retention",
      content: [
        "We retain your personal information for as long as your account is active or as needed to provide services. Transaction records are kept for a minimum of 5 years as required by Nepali financial regulations.",
        "You can request deletion of your account and associated data by contacting support@giftnow.su-indra.com. Some data may be retained as required by law.",
      ],
    },
    {
      title: "6. Your rights",
      content: [
        "You have the right to access, correct, or delete your personal information. You can update your profile at any time through your account settings or by contacting our support team.",
        "You may also request a portable copy of your data in a structured, commonly used format.",
      ],
    },
    {
      title: "7. Changes to this policy",
      content: [
        "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our website and sending a notification to your registered email address.",
        "Your continued use of GiftNow after changes are posted constitutes acceptance of the updated policy.",
      ],
    },
  ];

  return (
    <Layout activePath="/privacy" showFooter>
      <div className="bg-white min-h-screen text-black">
        {/* Hero */}
        <section className="pt-20 pb-12 text-center">
          <div className="max-w-[800px] mx-auto px-4">
            <h1 className="text-[36px] md:text-[44px] font-bold text-black tracking-tight leading-tight">
              Privacy Policy
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
              GiftNow (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is operated by Su Indra Groups Pvt. Ltd. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our platform and services.
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
                If you have questions about this Privacy Policy, contact us at{" "}
                <a href="mailto:privacy@giftnow.com" className="font-medium text-black underline">
                  privacy@giftnow.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}