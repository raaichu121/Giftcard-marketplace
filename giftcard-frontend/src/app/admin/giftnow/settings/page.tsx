"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import NepalFooter from "@/components/Footer";
import { giftnowAPI } from "@/lib/api";
import { formatNPR } from "@/lib/format";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalContext";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const { user, isAdmin } = useAuth();
  const { openAuth } = useAuthModal();

  const [minAmount, setMinAmount] = useState<number>(100);
  const [maxAmount, setMaxAmount] = useState<number>(100000);
  const [enabledTypes, setEnabledTypes] = useState<string[]>(["DIGITAL", "PHYSICAL", "CORPORATE_BULK"]);
  const [enabledChannels, setEnabledChannels] = useState<string[]>(["EMAIL", "SMS"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) return;

    setLoading(true);
    giftnowAPI
      .getAdminSettings()
      .then((res) => {
        if (res.data) {
          setMinAmount(res.data.minAmount);
          setMaxAmount(res.data.maxAmount);
          setEnabledTypes(res.data.enabledTypes || []);
          setEnabledChannels(res.data.enabledChannels || ["EMAIL", "SMS"]);
        }
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        toast.error("Failed to load platform settings");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-900">
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem("authRedirect", "/admin/giftnow/settings");
                openAuth("signin");
              }}
              className="font-semibold text-blue-600 underline"
            >
              Sign in as admin
            </button>{" "}
            to view platform settings.
          </div>
        </div>
      </Layout>
    );
  }

  const handleToggleType = (type: string) => {
    if (enabledTypes.includes(type)) {
      setEnabledTypes(enabledTypes.filter((t) => t !== type));
    } else {
      setEnabledTypes([...enabledTypes, type]);
    }
  };

  const handleToggleChannel = (channel: string) => {
    if (enabledChannels.includes(channel)) {
      if (enabledChannels.length === 1) {
        toast.error("At least one delivery channel must be enabled");
        return;
      }
      setEnabledChannels(enabledChannels.filter((c) => c !== channel));
    } else {
      setEnabledChannels([...enabledChannels, channel]);
    }
  };

  const handleSave = async () => {
    if (enabledTypes.length === 0) {
      toast.error("At least one card type must be enabled");
      return;
    }
    if (enabledChannels.length === 0) {
      toast.error("At least one delivery channel must be enabled");
      return;
    }
    if (minAmount <= 0) {
      toast.error("Min amount must be positive");
      return;
    }
    if (maxAmount < minAmount) {
      toast.error("Max amount must be greater than or equal to Min amount");
      return;
    }

    setSaving(true);
    try {
      await giftnowAPI.updateAdminSettings({
        minAmount,
        maxAmount,
        enabledTypes,
        enabledChannels,
      });
      toast.success("Settings updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const cardTypes = [
    { key: "DIGITAL", label: "Digital Card", desc: "Sent instantly to recipient email" },
    { key: "PHYSICAL", label: "Physical Card", desc: "Printed card delivered by post" },
    { key: "CORPORATE_BULK", label: "Corporate Bulk", desc: "Batch issue cards via CSV download" },
  ];

  const deliveryChannels = [
    { key: "EMAIL", label: "Email Channel", desc: "Enable gift card delivery and OTP verification via Email" },
    { key: "SMS", label: "SMS Channel", desc: "Enable gift card delivery and OTP verification via SMS" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <section className="py-6 border-b border-[#e5e5e5] bg-white">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-1">
                  Dashboard
                </p>
                <h1 className="text-[20px] md:text-[24px] font-bold text-black tracking-tight mb-1">
                  Platform Settings
                </h1>
                <p className="text-[13px] text-[#666]">
                  Configure global GiftNow parameters and business rules
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="px-5 py-2 bg-black text-white rounded font-medium text-xs hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-0">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16">
            {loading ? (
              <div className="text-center py-20 text-[#999] text-sm">Loading settings...</div>
            ) : (
              <div className="divide-y divide-[#e5e5e5]">

                {/* ── Card Types Section ── */}
                <div className="py-6">
                  <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-5">
                    Card Types
                  </div>

                  <div className="space-y-0 divide-y divide-[#f0f0f0]">
                    {cardTypes.map((item) => {
                      const isChecked = enabledTypes.includes(item.key);
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between py-4 cursor-pointer group"
                          onClick={() => handleToggleType(item.key)}
                        >
                          <div>
                            <p className="text-[13px] font-semibold text-black group-hover:text-black/80 transition-colors">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-[#999] mt-0.5">{item.desc}</p>
                          </div>
                          <div
                            className={`relative w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 shrink-0 ml-6 ${
                              isChecked ? "bg-black" : "bg-[#ddd]"
                            }`}
                          >
                            <div
                              className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${
                                isChecked ? "translate-x-5" : ""
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Delivery Channels Section ── */}
                <div className="py-6">
                  <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-5">
                    Delivery Channels
                  </div>

                  <div className="space-y-0 divide-y divide-[#f0f0f0]">
                    {deliveryChannels.map((item) => {
                      const isChecked = enabledChannels.includes(item.key);
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between py-4 cursor-pointer group"
                          onClick={() => handleToggleChannel(item.key)}
                        >
                          <div>
                            <p className="text-[13px] font-semibold text-black group-hover:text-black/80 transition-colors">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-[#999] mt-0.5">{item.desc}</p>
                          </div>
                          <div
                            className={`relative w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 shrink-0 ml-6 ${
                              isChecked ? "bg-black" : "bg-[#ddd]"
                            }`}
                          >
                            <div
                              className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${
                                isChecked ? "translate-x-5" : ""
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Amount Limits Section ── */}
                <div className="py-6">
                  <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-5">
                    Amount Limits
                  </div>

                  <div className="space-y-0 divide-y divide-[#f0f0f0]">
                    {/* Min Amount */}
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-[13px] font-semibold text-black">
                          Minimum Amount
                        </p>
                        <p className="text-[11px] text-[#999] mt-0.5">
                          Lowest value a customer can set for a gift card
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-6">
                        <span className="text-[11px] font-medium text-[#999]">Rs.</span>
                        <input
                          type="number"
                          value={minAmount}
                          onChange={(e) => setMinAmount(Math.max(1, parseInt(e.target.value, 10) || 0))}
                          className="w-28 px-3 py-2 border border-[#ddd] rounded font-medium text-[13px] text-black text-right focus:outline-none focus:border-black transition-colors bg-white"
                        />
                      </div>
                    </div>

                    {/* Max Amount */}
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-[13px] font-semibold text-black">
                          Maximum Amount
                        </p>
                        <p className="text-[11px] text-[#999] mt-0.5">
                          Highest value a customer can set for a gift card
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-6">
                        <span className="text-[11px] font-medium text-[#999]">Rs.</span>
                        <input
                          type="number"
                          value={maxAmount}
                          onChange={(e) => setMaxAmount(Math.max(1, parseInt(e.target.value, 10) || 0))}
                          className="w-28 px-3 py-2 border border-[#ddd] rounded font-medium text-[13px] text-black text-right focus:outline-none focus:border-black transition-colors bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </section>
        <NepalFooter />
      </div>
    </Layout>
  );
}