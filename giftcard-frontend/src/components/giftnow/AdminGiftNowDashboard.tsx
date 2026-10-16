"use client";

import React, { useEffect, useState } from "react";
import { giftnowAPI } from "@/lib/api";
import { formatNPR } from "@/lib/format";

export default function AdminGiftNowDashboard() {
  const [stats, setStats] = useState<Record<string, number | string> | null>(
    null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    giftnowAPI
      .adminAnalytics()
      .then((res) => setStats((res.data as Record<string, number | string>) ?? null))
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!stats) {
    return <p className="text-sm text-slate-600">Loading analytics…</p>;
  }

  const tiles = [
    { label: "Cards issued", value: stats.totalCardsIssued },
    { label: "Total value issued", value: formatNPR(Number(stats.totalValueIssued)) },
    { label: "Redeemed (count)", value: stats.totalRedeemedCount },
    { label: "Active codes", value: stats.activeCardsCount },
    {
      label: "Outstanding wallets",
      value: formatNPR(Number(stats.outstandingWalletBalances)),
    },
    { label: "Redemption rate", value: stats.redemptionRate },
    {
      label: "Avg denomination",
      value: formatNPR(Number(stats.averageDenomination)),
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="bg-white border border-slate-200 rounded-xl p-4"
        >
          <p className="text-xs text-slate-600 font-medium">{t.label}</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{t.value}</p>
        </div>
      ))}
    </div>
  );
}