"use client";

import React, { useEffect, useState } from "react";
import { giftnowAPI } from "@/lib/api";
import { formatNPR } from "@/lib/format";

export default function GiftNowHistory() {
  const [cards, setCards] = useState<
    {
      id: string;
      code: string;
      amount: number;
      type: string;
      status: string;
      recipientEmail?: string;
      createdAt: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await giftnowAPI.getPurchased();
        setCards((res.data as typeof cards) ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error)
    return (
      <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
        {error}
      </p>
    );

  if (!cards.length) {
    return (
      <p className="text-sm text-slate-500">No gift cards purchased yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
      {cards.map((c) => (
        <li key={c.id} className="px-4 py-3 bg-white text-sm">
          <div className="flex justify-between items-start">
            <span className="font-mono text-xs text-slate-600">{c.code}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                c.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700"
                  : c.status === "FULLY_REDEEMED"
                    ? "bg-slate-100 text-slate-600"
                    : "bg-red-50 text-red-700"
              }`}
            >
              {c.status}
            </span>
          </div>
          <p className="mt-1 font-medium">{formatNPR(Number(c.amount))}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {c.type}
            {c.recipientEmail ? ` · ${c.recipientEmail}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}