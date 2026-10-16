"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import NepalFooter from "@/components/Footer";
import { giftnowAPI } from "@/lib/api";
import { formatNPR } from "@/lib/format";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalContext";

export default function AdminAnalyticsGiftNowPage() {
  const { user, isAdmin } = useAuth();
  const { openAuth } = useAuthModal();

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await giftnowAPI.adminAnalytics();
        setAnalytics((res.data as any) || {});
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-900">
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem(
                  "authRedirect",
                  "/admin/giftnow/analytics",
                );
                openAuth("signin");
              }}
              className="font-semibold text-blue-600 underline"
            >
              Sign in as admin
            </button>{" "}
            to view analytics.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <section className="py-6 border-b border-[#e5e5e5]">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16">
            <p className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-1">
              Dashboard
            </p>
            <h1 className="text-[20px] md:text-[24px] font-bold text-black tracking-tight mb-1">
              Analytics
            </h1>
            <p className="text-[13px] text-[#666]">
              Real-time insights and platform performance metrics
            </p>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="py-12">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16">
            {loading ? (
              <div className="text-center py-20">
                <div className="text-[#666]">Loading analytics...</div>
              </div>
            ) : analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Cards Issued */}
                <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:border-black transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider">
                        Total Cards Issued
                      </p>
                      <div className="text-[32px] font-bold text-black mt-2">
                        {analytics.totalCardsIssued?.toLocaleString() || 0}
                      </div>
                    </div>
                    </div>
                  <p className="text-[12px] text-[#999]">All time</p>
                </div>

                {/* Total Value Issued */}
                <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:border-black transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider">
                        Total Value Issued
                      </p>
                      <div className="text-[28px] font-bold text-black mt-2 break-all">
                        {formatNPR(analytics.totalValueIssued || 0)}
                      </div>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#999]">Cumulative amount</p>
                </div>

                {/* Redemption Rate */}
                <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:border-black transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider">
                        Redemption Rate
                      </p>
                      <div className="text-[32px] font-bold text-black mt-2">
                        {analytics.redemptionRate || "0%"}
                      </div>
                      <p className="text-[12px] text-[#666] mt-2">
                        {analytics.totalRedeemedCount?.toLocaleString() || 0} of{" "}
                        {analytics.totalCardsIssued?.toLocaleString() || 0}{" "}
                        redeemed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Active Cards */}
                <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:border-black transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider">
                        Active Cards
                      </p>
                      <div className="text-[32px] font-bold text-black mt-2">
                        {analytics.activeCardsCount?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#999]">Ready to redeem</p>
                </div>

                {/* Outstanding Balances */}
                <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:border-black transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider">
                        Outstanding Balances
                      </p>
                      <div className="text-[28px] font-bold text-black mt-2 break-all">
                        {formatNPR(analytics.outstandingWalletBalances || 0)}
                      </div>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#999]">In customer wallets</p>
                </div>

                {/* Average Denomination */}
                <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:border-black transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider">
                        Average Denomination
                      </p>
                      <div className="text-[28px] font-bold text-black mt-2 break-all">
                        {formatNPR(analytics.averageDenomination || 0)}
                      </div>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#999]">Per card</p>
                </div>

                {/* Admin Issued Cards */}
                <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:border-black transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider">
                        Admin Issued
                      </p>
                      <div className="text-[32px] font-bold text-black mt-2">
                        {analytics.adminCreatedCount?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#999]">Created by admins</p>
                </div>

                {/* Customer Purchased Cards */}
                <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:border-black transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider">
                        Customer Purchased
                      </p>
                      <div className="text-[32px] font-bold text-black mt-2">
                        {analytics.customerPurchasedCount?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#999]">Purchased by customers</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-[#999]">No data available</div>
              </div>
            )}
          </div>
        </section>
        <NepalFooter />
      </div>
    </Layout>
  );
}