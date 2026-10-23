"use client";

import React, { useState } from "react";
import Layout from "@/components/Layout";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    about: "",
    userType: "",
    message: "",
    agree: false,
  });

  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, userType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Form submitted! Details: " + JSON.stringify(formData));
  };

  return (
    <Layout activePath="/contact" showFooter>
      <div className="bg-white min-h-screen text-black">
        {/* Header Section */}
        <section className="pt-20 pb-16 text-center">
          <div className="max-w-[800px] mx-auto px-4">
            <h1 className="text-[36px] md:text-[44px] font-bold text-black tracking-tight leading-tight">
              Contact GiftNow support
            </h1>
            <p className="text-[14px] md:text-[15px] text-[#555] mt-4 max-w-[600px] mx-auto leading-relaxed">
              We're here to help. Reach out for assistance, feedback, or partnership inquiries.
            </p>
          </div>
        </section>

        {/* Section 1: Get in Touch (Reach out) */}
        <section className="py-12 border-t border-[#e5e5e5]">
          <div className="max-w-[960px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              {/* Left Column */}
              <div>
                <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-2">
                  Reach out
                </p>
                <h2 className="text-[28px] font-bold text-black mb-2">
                  Get in touch
                </h2>
                <p className="text-[13px] text-[#555] mb-10">
                  We respond to all inquiries within one business day
                </p>

                <div className="space-y-8">
                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="text-black mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px]">Email</h4>
                      <p className="text-[13px] text-[#555] mb-1.5">Send us a message anytime.</p>
                      <a href="mailto:support@giftnow.com" className="text-[13px] font-medium underline">
                        support@giftnow.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="text-black mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px]">Phone</h4>
                      <p className="text-[13px] text-[#555] mb-1.5">Available Monday through Friday.</p>
                      <a href="tel:+97714123456" className="text-[13px] font-medium underline">
                        +977 (1) 4123-456
                      </a>
                    </div>
                  </div>

                  {/* Office */}
                  <div className="flex gap-4">
                    <div className="text-black mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px]">Office</h4>
                      <p className="text-[13px] text-[#555] mb-1.5">Kathmandu, Nepal | Su Indra Groups headquarters</p>
                      <a href="#" className="text-[13px] font-medium underline flex items-center gap-1">
                        <span>Get directions</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Gray Placeholder box */}
              <div className="w-full bg-[#d9d9d9] h-[340px] flex items-center justify-center">
                <svg className="w-16 h-16 text-[#b0b0b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Send us a Message */}
        <section className="py-16 border-t border-[#e5e5e5]">
          <div className="max-w-[960px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              {/* Left Column info summary */}
              <div>
                <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-2">
                  Let's talk
                </p>
                <h2 className="text-[28px] font-bold text-black mb-2">
                  Send us a message
                </h2>
                <p className="text-[13px] text-[#555] mb-8">
                  Tell us what's on your mind and we'll get back to you promptly
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[13px]">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>support@giftnow.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>+977 (1) 4123-456</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Kathmandu, Nepal | Su Indra Groups headquarters</span>
                  </div>
                </div>
              </div>

              {/* Right Column Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Names */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-black mb-1.5" htmlFor="firstName">
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-black px-3 py-2 text-[13px] bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-black mb-1.5" htmlFor="lastName">
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-black px-3 py-2 text-[13px] bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-black mb-1.5" htmlFor="email">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-black px-3 py-2 text-[13px] bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-black mb-1.5" htmlFor="phone">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-black px-3 py-2 text-[13px] bg-white outline-none"
                    />
                  </div>
                </div>

                {/* About Select */}
                <div>
                  <label className="block text-[11px] font-bold text-black mb-1.5" htmlFor="about">
                    What is this about
                  </label>
                  <select
                    id="about"
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-black px-3 py-2 text-[13px] bg-white outline-none appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: "right 0.75rem center",
                      backgroundSize: "1.25rem",
                      backgroundRepeat: "no-repeat",
                      paddingRight: "2.5rem"
                    }}
                  >
                    <option value="">Select one...</option>
                    <option value="general">General inquiry</option>
                    <option value="partnership">Business partnership</option>
                    <option value="support">Technical support</option>
                    <option value="billing">Billing issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Describe yourself Radio Grid */}
                <div>
                  <label className="block text-[11px] font-bold text-black mb-2">
                    How would you describe yourself?
                  </label>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {[
                      "Individual buyer",
                      "Corporate partner",
                      "Bulk purchaser",
                      "Merchant or seller",
                      "Platform user",
                      "Other",
                    ].map((type) => (
                      <label key={type} className="flex items-center gap-2.5 text-[13px] cursor-pointer">
                        <input
                          type="radio"
                          name="userType"
                          checked={formData.userType === type}
                          onChange={() => handleRadioChange(type)}
                          className="w-4 h-4 accent-black border-black cursor-pointer"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[11px] font-bold text-black mb-1.5" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Tell us more..."
                    className="w-full border border-black px-3 py-2 text-[13px] bg-white outline-none resize-none"
                  ></textarea>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-2.5 text-[13px] font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Section 3: Bottom Newsletter Block (Stay updated) */}
        <section className="py-12 border-t border-[#e5e5e5] px-4 md:px-6">
          <div className="max-w-[960px] mx-auto bg-[#888888] text-white py-14 px-8 md:px-12 text-center rounded-sm">
            {/* Gray image placeholder inside newsletter */}
            <div className="w-16 h-16 bg-[#a3a3a3] mx-auto flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#d9d9d9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-[24px] md:text-[28px] font-bold mb-2">
              Stay updated on GiftNow news
            </h2>
            <p className="text-[13px] text-[#e0e0e0] max-w-[540px] mx-auto mb-8 leading-relaxed">
              Subscribe for product updates, seasonal campaigns, and exclusive offers delivered to your inbox
            </p>

            <div className="max-w-[420px] mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-[13px] text-black bg-white outline-none rounded-none placeholder-neutral-500"
                />
                <button className="bg-white text-black px-6 py-2.5 text-[13px] font-bold hover:bg-neutral-100 transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <p className="text-[11px] text-[#d9d9d9] mt-3.5 leading-normal">
                By subscribing you agree to our Terms and Conditions and Privacy Policy.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}