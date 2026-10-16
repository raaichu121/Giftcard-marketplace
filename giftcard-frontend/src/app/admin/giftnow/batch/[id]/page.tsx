"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { giftnowAPI } from "@/lib/api";
import { formatNPR } from "@/lib/format";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalContext";

export default function AdminBatchDetailPage({ params }: { params: { id: string } }) {
  const { user, isAdmin } = useAuth();
  const { openAuth } = useAuthModal();

  const [batch, setBatch] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetPinResult, setResetPinResult] = useState<{ code: string; pin: string } | null>(null);

  const loadBatch = async () => {
    try {
      const res = await giftnowAPI.adminBatch(params.id);
      const data = res.data as any;
      setBatch(data.batch);
      setCards(data.cards || []);
    } catch (err) {
      console.error("Failed to load batch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatch();
  }, [params.id]);

  const handleResetPin = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to reset the security PIN for card ${code}?`)) return;
    try {
      const res = await giftnowAPI.adminResetPin(id);
      if (res.data?.pin) {
        setResetPinResult({ code, pin: res.data.pin });
        await loadBatch();
      } else {
        alert("Failed to reset security PIN: No PIN returned");
      }
    } catch (err) {
      alert("Failed to reset security PIN");
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
                sessionStorage.setItem("authRedirect", `/admin/giftnow/batch/${params.id}`);
                openAuth("signin");
              }}
              className="font-semibold text-blue-600 underline"
            >
              Sign in as admin
            </button>{" "}
            to view batch details.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading...</div>
        ) : batch ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{batch.name}</h1>
              <p className="text-slate-500 text-sm">Batch ID: {batch.id}</p>
            </div>

            {resetPinResult && (
              <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="text-emerald-800 font-bold text-sm"> Security PIN Reset Successful</h4>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    The security PIN for gift card <strong className="font-mono text-emerald-800">{resetPinResult.code}</strong> has been regenerated.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">New PIN:</span>
                    <span className="font-mono text-base font-extrabold text-emerald-700 tracking-wider bg-white border border-emerald-200 px-3 py-1 rounded">
                      {resetPinResult.pin}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resetPinResult.pin);
                      alert("PIN copied to clipboard!");
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Copy PIN
                  </button>
                  <button
                    onClick={() => setResetPinResult(null)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-semibold hover:bg-slate-300 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-xs text-slate-600 mb-1">Total Cards</div>
                <div className="text-2xl font-bold text-slate-900">{batch.totalCards}</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-xs text-slate-600 mb-1">Total Value</div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatNPR(batch.totalAmount)}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-xs text-slate-600 mb-1">Redemption Rate</div>
                <div className="text-2xl font-bold text-slate-900">
                  {cards.filter((c) => c.status === "FULLY_REDEEMED").length /
                    cards.length >
                  0
                    ? ((cards.filter((c) => c.status === "FULLY_REDEEMED").length /
                        cards.length) *
                        100).toFixed(1) + "%"
                    : "0%"}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-xs text-slate-600 mb-1">Created</div>
                <div className="text-sm font-mono text-slate-900">
                  {new Date(batch.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">Cards in Batch ({cards.length})</h2>
              </div>

              {cards.length === 0 ? (
                <div className="px-6 py-10 text-center text-slate-500">No cards found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium text-slate-700">Code</th>
                        <th className="px-6 py-3 text-left font-medium text-slate-700">Amount</th>
                        <th className="px-6 py-3 text-left font-medium text-slate-700">Status</th>
                        <th className="px-6 py-3 text-left font-medium text-slate-700">Created</th>
                        <th className="px-6 py-3 text-right font-medium text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cards.map((card: any) => (
                        <tr key={card.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-6 py-3 font-mono text-xs">{card.code}</td>
                          <td className="px-6 py-3">{formatNPR(card.amount)}</td>
                          <td className="px-6 py-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  card.status === "ACTIVE"
                                    ? "bg-green-100 text-green-800"
                                    : card.status === "FULLY_REDEEMED"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {card.status}
                              </span>
                              {card.pinAttempts >= 5 && (
                                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 rounded text-[11px] font-bold animate-pulse">
                                  🔒 Locked
                                </span>
                              )}
                              {card.pinAttempts > 0 && card.pinAttempts < 5 && (
                                <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">
                                  ⚠️ {card.pinAttempts}/5 attempts
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-xs">
                            {new Date(card.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3 text-right">
                            {card.status === "ACTIVE" && (
                              <button
                                onClick={() => handleResetPin(card.id, card.code)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
                              >
                                Reset PIN
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-slate-500">Batch not found</div>
        )}
      </div>
    </Layout>
  );
}