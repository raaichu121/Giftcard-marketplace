"use client";

import React, { useEffect, useState } from "react";
import { giftnowAPI } from "@/lib/api";
import { formatNPR } from "@/lib/format";
import GiftNowRedeem from "./GiftNowRedeem";

export default function GiftNowWallet() {
  const [wallet, setWallet] = useState<{
    balance: number;
    totalCredited: number;
    totalDebited: number;
  } | null>(null);
  const [history, setHistory] = useState<
    {
      operation: string;
      amount: number;
      balanceAfter: number;
      createdAt: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRedeem, setShowRedeem] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const w = await giftnowAPI.getWallet();
      const data =
        (w as { balance?: number }).balance !== undefined
          ? (w as {
              balance: number;
              totalCredited: number;
              totalDebited: number;
            })
          : (w.data as {
              balance: number;
              totalCredited: number;
              totalDebited: number;
            });
      setWallet(data);

      const h = await giftnowAPI.getWalletHistory(20, 0);
      const rows = (h.data as typeof history) ?? [];
      setHistory(rows);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <span className="w-10 h-10 border-4 border-gc-purple/30 border-t-gc-purple rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Securing Wallet Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3.5 rounded-xl">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 3D Glassmorphic Wallet Card */}
      <div className="w-full max-w-[420px] mx-auto aspect-[1.586/1] bg-gradient-to-br from-[#1d123b] via-[#33142e] to-[#6b254c] p-7 rounded-2xl shadow-glow border border-white/10 flex flex-col justify-between relative overflow-hidden group cursor-pointer">
        {/* Card shine overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.15),transparent)] pointer-events-none" />
        <div className="absolute top-0 -inset-full h-full w-1/2 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 opacity-30 group-hover:animate-[shimmer_1.5s_infinite]" />

        <div className="flex justify-between items-start">
          <div>
            <p className="text-[9px] uppercase font-bold tracking-widest text-[#a855f7]/70">
              GiftNow Premium Account
            </p>
            <p className="text-2xl font-black tracking-tight text-white mt-0.5">Wallet Card</p>
          </div>
          {/* Card chip icon */}
          <div className="w-9 h-7 bg-gradient-to-br from-gold-100 to-gold-400 rounded-md border border-gold-300 flex flex-col justify-around p-1 opacity-80">
            <div className="w-full h-[1px] bg-slate-800/25" />
            <div className="w-full h-[1px] bg-slate-800/25" />
            <div className="w-full h-[1px] bg-slate-800/25" />
          </div>
        </div>

        <div>
          <p className="text-[8px] uppercase font-bold tracking-widest text-slate-400">
            Available Balance
          </p>
          <p className="text-3xl font-black text-white mt-1 tracking-tight">
            {formatNPR(wallet?.balance ?? 0)}
          </p>
        </div>

        <div className="flex gap-8 border-t border-white/10 pt-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
          <div>
            <p className="opacity-75">Credited</p>
            <p className="text-xs font-black text-[#10b981] mt-0.5">
              {formatNPR(wallet?.totalCredited ?? 0)}
            </p>
          </div>
          <div className="border-l border-white/10 pl-8">
            <p className="opacity-75">Debited</p>
            <p className="text-xs font-black text-[#f43f5e] mt-0.5">
              {formatNPR(wallet?.totalDebited ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowRedeem(!showRedeem)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-300 border ${
            showRedeem
              ? "bg-white/10 border-white/20 text-white"
              : "bg-gc-purple/20 border-gc-purple/40 text-[#fce7f3] hover:shadow-glow"
          }`}
        >
          {showRedeem ? "Cancel Claim" : "Redeem Gift Card"}
        </button>
      </div>

      {/* Redeem Drop-down panel */}
      {showRedeem && (
        <div className="animate-slide-down">
          <GiftNowRedeem
            onSuccess={() => {
              load();
              setShowRedeem(false);
            }}
          />
        </div>
      )}

      {/* Recent activity timeline */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
          Wallet Activity logs
        </h3>

        {history.length > 0 ? (
          <div className="glass rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/10">
            {history.map((row, i) => {
              const isDebit = row.operation.includes("DEBIT");
              return (
                <div
                  key={i}
                  className="px-6 py-4 flex items-center justify-between text-xs hover:bg-white/[0.02] transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-white tracking-wide uppercase">
                      {row.operation.replace(/_/g, " ")}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {new Date(row.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-black text-sm ${
                        isDebit ? "text-[#f43f5e]" : "text-[#10b981]"
                      }`}
                    >
                      {isDebit ? "−" : "+"} {formatNPR(row.amount)}
                    </span>
                    <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                      Bal After: {formatNPR(row.balanceAfter)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 glass rounded-2xl border border-white/5">
            <p className="text-slate-400 text-xs">No transactions recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}