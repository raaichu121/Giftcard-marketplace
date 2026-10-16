"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import AdminGiftNowDashboard from "@/components/giftnow/AdminGiftNowDashboard";
import { giftnowAPI } from "@/lib/api";
import { formatNPR } from "@/lib/format";

export default function AdminGiftNowPage() {
  const [cards, setCards] = useState<unknown[]>([]);

  const loadCards = () => {
    giftnowAPI.adminList().then((res) => setCards((res.data as unknown[]) ?? []));
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleExport = () => {
    giftnowAPI.adminExport().then(async (res) => {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "giftnow-export.csv";
      a.click();
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10 text-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">GiftNow Admin</h1>
        <p className="text-slate-600 mb-8">SRS platform gift card operations</p>

        <AdminGiftNowDashboard />

        <section className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-slate-900">All GiftNow cards</h2>
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-1.5 border border-slate-300 text-slate-800 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
            >
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Code</th>
                  <th className="text-left px-4 py-3 font-semibold">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 divide-y divide-slate-100">
                {(cards as { id: string; code: string; amount: number; type: string; status: string }[]).map(
                  (c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-900">{c.code}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{formatNPR(Number(c.amount))}</td>
                      <td className="px-4 py-3 text-slate-600">{c.type}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          c.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {c.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}