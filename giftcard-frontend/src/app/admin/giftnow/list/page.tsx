"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import NepalFooter from "@/components/Footer";
import { giftnowAPI } from "@/lib/api";
import { formatNPR } from "@/lib/format";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalContext";
import toast from "react-hot-toast/headless";

export default function AdminListGiftNowPage() {
  const { user, isAdmin } = useAuth();
  const { openAuth } = useAuthModal();

  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    status?: string;
    type?: string;
    createdBy?: string;
    code?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  const [pagination, setPagination] = useState({ limit: 50, offset: 0 });
  const [resetPinResult, setResetPinResult] = useState<{ code: string; pin?: string; isCustomerPurchase: boolean } | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const loadCards = async () => {
    setLoading(true);
    try {
      const res = await giftnowAPI.adminList(filter);
      setCards((res.data as any[]) || []);
    } catch (err) {
      console.error("Failed to load cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [filter]);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this card?")) return;
    try {
      await giftnowAPI.adminCancel(id);
      await loadCards();
    } catch (err) {
      toast.error("Failed to cancel card");
    }
  };

  const handleResetPin = async (id: string, code: string, isCustomerPurchase: boolean) => {
    if (!confirm(`Are you sure you want to reset the security PIN for card ${code}?`)) return;
    try {
      const res = await giftnowAPI.adminResetPin(id);
      setResetPinResult({
        code,
        pin: isCustomerPurchase ? undefined : res.data?.pin,
        isCustomerPurchase
      });
      await loadCards();
    } catch (err) {
      toast.error("Failed to reset security PIN");
    }
  };

  const handleExport = async () => {
    try {
      const res = await giftnowAPI.adminExport(filter);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `giftnow-export-${Date.now()}.csv`;
      a.click();
    } catch (err) {
      toast.error("Failed to export");
    }
  };

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-900">
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem("authRedirect", "/admin/giftnow/list");
                openAuth("signin");
              }}
              className="font-semibold text-blue-600 underline"
            >
              Sign in as admin
            </button>{" "}
            to view gift cards.
          </div>
        </div>
      </Layout>
    );
  }

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
                  Gift Cards
                </h1>
                <p className="text-[13px] text-[#666]">
                  Manage all issued gift cards across your platform
                </p>
              </div>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-black text-white rounded font-medium text-xs hover:bg-[#1a1a1a] transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>
        </section>

        {resetPinResult && (
          <div className="mx-4 md:mx-8 lg:mx-12 xl:mx-16 mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h4 className="text-emerald-800 font-bold text-sm">Security PIN Reset Successful</h4>
              <p className="text-xs text-emerald-600 mt-0.5">
                {resetPinResult.isCustomerPurchase ? (
                  <>
                    The security PIN for gift card <strong className="font-mono text-emerald-800">{resetPinResult.code}</strong> has been sent to recipent mail.
                  </>
                ) : (
                  <>
                    The security PIN for gift card <strong className="font-mono text-emerald-800">{resetPinResult.code}</strong> has been regenerated.
                  </>
                )}
              </p>
              {!resetPinResult.isCustomerPurchase && resetPinResult.pin && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">New PIN:</span>
                  <span className="font-mono text-base font-extrabold text-emerald-700 tracking-wider bg-white border border-emerald-200 px-3 py-1 rounded">
                    {resetPinResult.pin}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {!resetPinResult.isCustomerPurchase && resetPinResult.pin && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resetPinResult.pin || "");
                    toast.success("PIN copied to clipboard!");
                  }}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Copy PIN
                </button>
              )}
              <button
                onClick={() => setResetPinResult(null)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-semibold hover:bg-slate-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <section className="py-4 border-b border-[#e5e5e5]">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16">
            <div className="flex gap-3 flex-wrap items-center">
              <input
                type="text"
                value={filter.code || ""}
                onChange={(e) =>
                  setFilter({ ...filter, code: e.target.value || undefined })
                }
                placeholder="Search by Code..."
                className="px-3 py-1.5 border border-[#ddd] rounded font-medium text-xs text-[#333] focus:outline-none focus:border-black transition-colors w-48 font-mono bg-white"
              />

              <select
                value={filter.status || ""}
                onChange={(e) =>
                  setFilter({ ...filter, status: e.target.value || undefined })
                }
                className="px-3 py-1.5 border border-[#ddd] rounded font-medium text-xs text-[#333] focus:outline-none focus:border-black transition-colors bg-white"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="FULLY_REDEEMED">Redeemed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={filter.type || ""}
                onChange={(e) =>
                  setFilter({ ...filter, type: e.target.value || undefined })
                }
                className="px-3 py-1.5 border border-[#ddd] rounded font-medium text-xs text-[#333] focus:outline-none focus:border-black transition-colors bg-white"
              >
                <option value="">All Types</option>
                <option value="DIGITAL">Digital</option>
                <option value="CORPORATE_BULK">Bulk</option>
              </select>

              <select
                value={filter.createdBy || ""}
                onChange={(e) =>
                  setFilter({ ...filter, createdBy: e.target.value || undefined })
                }
                className="px-3 py-1.5 border border-[#ddd] rounded font-medium text-xs text-[#333] focus:outline-none focus:border-black transition-colors bg-white"
              >
                <option value="">All Issuers</option>
                <option value="ADMIN">Admin Issued</option>
                <option value="CUSTOMER">Customer Purchased</option>
              </select>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#666] font-medium">From:</span>
                <input
                  type="date"
                  value={filter.startDate || ""}
                  onChange={(e) =>
                    setFilter({ ...filter, startDate: e.target.value || undefined })
                  }
                  className="px-3 py-1.5 border border-[#ddd] rounded font-medium text-xs text-[#333] focus:outline-none focus:border-black transition-colors bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#666] font-medium">To:</span>
                <input
                  type="date"
                  value={filter.endDate || ""}
                  onChange={(e) =>
                    setFilter({ ...filter, endDate: e.target.value || undefined })
                  }
                  className="px-3 py-1.5 border border-[#ddd] rounded font-medium text-xs text-[#333] focus:outline-none focus:border-black transition-colors bg-white"
                />
              </div>

              {(filter.status || filter.type || filter.createdBy || filter.code || filter.startDate || filter.endDate) && (
                <button
                  onClick={() => setFilter({})}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Cards Display */}
        <section className="py-12">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16">
            {loading ? (
              <div className="text-center py-20">
                <div className="text-[#666]">Loading gift cards...</div>
              </div>
            ) : cards.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-[#999] text-[15px]">
                  No gift cards found
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map((card: any) => (
                  <div
                    key={card.id}
                    className="bg-white border border-[#e5e5e5] rounded-lg p-4 md:p-6 hover:border-black transition-all hover:shadow-sm"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-16 md:gap-8 items-center">
                      {/* Code */}
                      <div>
                        <div className="text-xs font-bold text-[#999] uppercase tracking-wider mb-1">
                          Code
                        </div>
                        <div className="font-mono text-[13px] font-semibold text-black break-words">
                          {card.code}
                        </div>
                      </div>

                      {/* Type */}
                      <div>
                        <div className="text-xs font-bold text-[#999] uppercase tracking-wider mb-1">
                          Type
                        </div>
                        <div className="text-[13px] font-medium text-[#333]">
                          {card.type === "DIGITAL" && "Digital"}
                          {card.type === "CORPORATE_BULK" && "Bulk"}
                        </div>
                      </div>

                      {/* Amount */}
                      <div>
                        <div className="text-xs font-bold text-[#999] uppercase tracking-wider mb-1">
                          Amount
                        </div>
                        <div className="text-[13px] font-semibold text-black">
                          {formatNPR(card.amount)}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <div className="text-xs font-bold text-[#999] uppercase tracking-wider mb-1">
                          Status
                        </div>
                        <div className="text-[12px] font-bold flex flex-wrap gap-1 items-center">
                          {card.status === "ACTIVE" && (
                            <span className="inline-block px-3 py-1 bg-[#d4edda] text-[#155724] rounded">
                              Active
                            </span>
                          )}
                          {card.status === "FULLY_REDEEMED" && (
                            <span className="inline-block px-3 py-1 bg-[#cce5ff] text-[#004085] rounded">
                              Redeemed
                            </span>
                          )}
                          {card.status === "CANCELLED" && (
                            <span className="inline-block px-3 py-1 bg-[#f8d7da] text-[#721c24] rounded">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <div>
                        <div className="text-xs font-bold text-[#999] uppercase tracking-wider mb-1">
                          Created
                        </div>
                        <div className="text-[13px] text-[#666]">
                          {new Date(card.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Issued By */}
                      <div>
                        <div className="text-xs font-bold text-[#999] uppercase tracking-wider mb-1">
                          Issued By
                        </div>
                        <div className="text-[12px] font-bold">
                          {card.isCustomerPurchase ? (
                            <span className="inline-block px-3 py-1 bg-[#e8f4fd] text-[#0c5460] rounded">
                              Customer
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 bg-[#f3e8ff] text-[#553c9a] rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="text-right flex flex-col md:flex-row gap-2 justify-end">
                        <button
                          onClick={() => setExpandedCardId(expandedCardId === card.id ? null : card.id)}
                          className="px-3 py-2 text-[12px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          {expandedCardId === card.id ? "Hide" : "Inquire"}
                        </button>
                        {card.status === "ACTIVE" && (
                          <>
                            <button
                              onClick={() => handleResetPin(card.id, card.code, !!card.isCustomerPurchase)}
                              className="px-3 py-2 text-[12px] font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
                            >
                              Reset PIN
                            </button>
                            <button
                              onClick={() => handleCancel(card.id)}
                              className="px-3 py-2 text-[12px] font-bold text-white bg-[#dc3545] rounded hover:bg-[#c82333] transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {expandedCardId === card.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-[12px] text-[#555] bg-[#fafafa] p-4 rounded-lg border border-slate-200/50">
                        <div className="space-y-2">
                          <h5 className="font-bold text-slate-800 text-[13px] mb-1 uppercase tracking-wider">Purchase & Issuance</h5>
                          <div>
                            <span className="font-semibold text-slate-600">Created At:</span>{" "}
                            <span>{new Date(card.createdAt).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-600">Issued By:</span>{" "}
                            <span>{card.isCustomerPurchase ? "Customer Purchase" : "Admin / Batch"}</span>
                          </div>
                          {card.isCustomerPurchase ? (
                            <>
                              <div>
                                <span className="font-semibold text-slate-600">Purchaser Name:</span>{" "}
                                <span>{card.purchaserName || "N/A"}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-600">Purchaser Email:</span>{" "}
                                <span>{card.purchaserEmail || "N/A"}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-600">Recipient Email:</span>{" "}
                                <span>{card.recipientEmail || "N/A"}</span>
                              </div>
                              {card.personalMessage && (
                                <div className="mt-1.5 p-2 bg-white border border-slate-200 rounded italic text-slate-600">
                                  "{card.personalMessage}"
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {card.batchId && (
                                <div>
                                  <span className="font-semibold text-slate-600">Batch ID:</span>{" "}
                                  <span className="font-mono">{card.batchId}</span>
                                </div>
                              )}
                              {card.recipientEmail && (
                                <div>
                                  <span className="font-semibold text-slate-600">Delivery Recipient:</span>{" "}
                                  <span>{card.recipientEmail}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-bold text-slate-800 text-[13px] mb-1 uppercase tracking-wider">Redemption & Status</h5>
                          <div>
                            <span className="font-semibold text-slate-600">Status:</span>{" "}
                            <span className="font-bold uppercase">{card.status}</span>
                          </div>
                          {card.status === "FULLY_REDEEMED" && (
                            <>
                              <div>
                                <span className="font-semibold text-slate-600">Redeemed At:</span>{" "}
                                <span>{card.redeemedAt ? new Date(card.redeemedAt).toLocaleString() : "N/A"}</span>
                              </div>
                              {card.redeemedByCustomer && (
                                <div>
                                  <span className="font-semibold text-slate-600">Redeemed By:</span>{" "}
                                  <span>
                                    {card.redeemedByCustomer.name} ({card.redeemedByCustomer.email})
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                          {card.status === "CANCELLED" && card.cancelledAt && (
                            <div>
                              <span className="font-semibold text-slate-600">Cancelled At:</span>{" "}
                              <span>{new Date(card.cancelledAt).toLocaleString()}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-slate-600">Security PIN Lockout attempts:</span>{" "}
                            <span>{card.pinAttempts} / 5</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <NepalFooter />
      </div>
    </Layout>
  );
}