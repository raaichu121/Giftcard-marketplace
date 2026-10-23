"use client";

import React from "react";
import Link from "next/link";
import Layout from "@/components/Layout";

export default function AboutPage() {
  return (
    <Layout activePath="/about" showFooter>
      <div className="bg-white min-h-screen text-black">
        {/* Hero */}
        <section className="pt-20 pb-16 text-center">
          <div className="max-w-[800px] mx-auto px-4">
            <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-3">
              About us
            </p>
            <h1 className="text-[36px] md:text-[44px] font-bold text-black tracking-tight leading-tight">
              Building Nepal&apos;s gifting future
            </h1>
            <p className="text-[14px] md:text-[15px] text-[#555] mt-4 max-w-[600px] mx-auto leading-relaxed">
              GiftNow is a product of Su Indra Groups Pvt. Ltd., created to make digital and physical gift cards accessible, secure, and delightful for every Nepali.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 border-t border-[#e5e5e5]">
          <div className="max-w-[960px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-[22px] font-bold text-black mb-3">Our mission</h2>
                <p className="text-[13px] text-[#555] leading-relaxed">
                  To simplify gifting across Nepal by providing a secure, instant, and universally accepted gift card platform. We believe every moment of generosity should be effortless whether you&apos;re buying a birthday present or rewarding employees.
                </p>
              </div>
              <div>
                <h2 className="text-[22px] font-bold text-black mb-3">Our vision</h2>
                <p className="text-[13px] text-[#555] leading-relaxed">
                  To become the most trusted gift card ecosystem in South Asia connecting millions of buyers, recipients, and merchants on a single platform with world-class security and seamless user experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-[#fafafa] border-y border-[#e5e5e5]">
          <div className="max-w-[960px] mx-auto px-4 md:px-6">
            <h2 className="text-[22px] md:text-[28px] font-bold text-black text-center mb-12">
              What we stand for
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Trust & Security",
                  desc: "Every transaction is encrypted with AES-256. Our fraud detection systems monitor every code in real-time.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
                {
                  title: "Simplicity",
                  desc: "Buy in three clicks. Redeem in one step. We obsess over removing friction from every part of the experience.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                },
                {
                  title: "Local First",
                  desc: "Built in Nepal, for Nepal. We support local payment gateways, local merchants, and local currency always.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
              ].map((v, i) => (
                <div key={i} className="border border-[#e5e5e5] rounded-lg p-6 bg-white">
                  <div className="w-10 h-10 bg-[#f5f5f5] rounded-full flex items-center justify-center mb-4 text-black">
                    {v.icon}
                  </div>
                  <h3 className="text-[15px] font-bold text-black mb-2">{v.title}</h3>
                  <p className="text-[13px] text-[#555] leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team / Company Info */}
        <section className="py-16">
          <div className="max-w-[960px] mx-auto px-4 md:px-6 text-center">
            <h2 className="text-[22px] md:text-[28px] font-bold text-black mb-3">
              Su Indra Groups Pvt. Ltd.
            </h2>
            <p className="text-[13px] text-[#555] max-w-[600px] mx-auto leading-relaxed mb-8">
              Headquartered in Janakpurdham, Nepal, Su Indra Groups operates across e-commerce, fintech, and digital services. GiftNow is our flagship gifting platform designed to empower both consumers and businesses.
            </p>
            <div className="grid grid-cols-3 gap-6 max-w-[500px] mx-auto border-t border-[#e5e5e5] pt-8">
              <div>
                <p className="text-[28px] font-bold text-black">2025</p>
                <p className="text-[12px] text-[#888] mt-1">Founded</p>
              </div>
              <div className="border-x border-[#e5e5e5]">
                <p className="text-[28px] font-bold text-black">5K+</p>
                <p className="text-[12px] text-[#888] mt-1">Cards issued</p>
              </div>
              <div>
                <p className="text-[28px] font-bold text-black">50+</p>
                <p className="text-[12px] text-[#888] mt-1">Merchants</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#e5e5e5] py-16 text-center">
          <div className="max-w-[500px] mx-auto px-4">
            <h2 className="text-[22px] font-bold text-black mb-2">Want to work with us?</h2>
            <p className="text-[13px] text-[#555] mb-6">
              We&apos;re always looking for talented individuals to join our team.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/careers"
                className="px-6 py-2.5 bg-black text-white text-[13px] font-medium rounded hover:bg-neutral-800 transition-colors"
              >
                View careers
              </Link>
              <Link
                href="/contact"
                className="px-6 py-2.5 border border-black text-black text-[13px] font-medium rounded hover:bg-slate-50 transition-colors"
              >
                Contact us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}