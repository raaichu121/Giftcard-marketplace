"use client";

import React, { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import RequireAuth from "@/components/RequireAuth";
import { giftnowAPI, GiftNowApiError } from "@/lib/api";
import { formatNPR } from "@/lib/format";

type AuditFilter = "ALL" | "CREDIT" | "DEBIT" | "REFUND";

interface WalletData {
  accountId: string;
  balance: number;
  totalCredited: number;
  totalDebited: number;
}

interface AuditEntry {
  id: string;
  operation: string;
  amount: number | string;
  balanceBefore: number | string;
  balanceAfter: number | string;
  giftCardId?: string | null;
  orderId?: string | null;
  createdAt: string;
}

export default function MyWalletPage() {
  return (
    <Layout activePath="/customer/wallet" showFooter>
      <RequireAuth redirectTo="/customer/wallet">
        <WalletContent />
      </RequireAuth>
    </Layout>
  );
}

function WalletContent() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState<AuditFilter>("ALL");
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Redeem state
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemPin, setRedeemPin] = useState("");
  const [redeemOtp, setRedeemOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [redeemErrorCode, setRedeemErrorCode] = useState("");

  const fetchWallet = useCallback(async () => {
    try {
      const res = await giftnowAPI.getWallet();
      if (res) {
        setWallet(res as unknown as WalletData);
      }
    } catch {
      // Wallet will be created on first access
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await giftnowAPI.getWalletHistory(100, 0);
      const data = (res as Record<string, unknown>).data as AuditEntry[];
      setHistory(data || []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
    fetchHistory();
  }, [fetchWallet, fetchHistory]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;

    setRedeeming(true);
    setRedeemError("");
    setRedeemErrorCode("");
    setRedeemSuccess("");

    try {
      const res = await giftnowAPI.sendRedeemOtp(redeemCode.trim());
      const hasOtp = typeof res.requiresOtp === "boolean" ? res.requiresOtp : (res.data as any)?.requiresOtp;
      const email = typeof res.recipientEmail === "string" ? res.recipientEmail : (res.data as any)?.recipientEmail;
      const phone = typeof res.recipientPhone === "string" ? res.recipientPhone : (res.data as any)?.recipientPhone;
      
      setRequiresOtp(!!hasOtp);
      setRecipientEmail(email || "");
      setRecipientPhone(phone || "");
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof GiftNowApiError) {
        setRedeemError(err.message);
        setRedeemErrorCode(err.code);
      } else {
        setRedeemError(err instanceof Error ? err.message : "Failed to verify gift card code.");
        setRedeemErrorCode("");
      }
    } finally {
      setRedeeming(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;

    setRedeeming(true);
    setRedeemError("");
    setRedeemErrorCode("");
    setRedeemSuccess("");

    try {
      const res = await giftnowAPI.redeem(
        redeemCode.trim(),
        requiresOtp ? undefined : redeemPin || undefined,
        requiresOtp ? redeemOtp || undefined : undefined
      );
      const credited = (res as Record<string, unknown>).credited as number;
      setRedeemSuccess(
        `Successfully redeemed! ${formatNPR(credited || 0)} has been added to your wallet.`
      );
      setRedeemCode("");
      setRedeemPin("");
      setRedeemOtp("");
      setStep(1);
      // Refresh data
      fetchWallet();
      fetchHistory();
    } catch (err: unknown) {
      if (err instanceof GiftNowApiError) {
        setRedeemError(err.message);
        setRedeemErrorCode(err.code);
      } else {
        setRedeemError(err instanceof Error ? err.message : "Failed to redeem gift card. Please check the code and try again.");
        setRedeemErrorCode("");
      }
    } finally {
      setRedeeming(false);
    }
  };

  const balance = wallet?.balance ?? 0;
  const totalCredited = wallet?.totalCredited ?? 0;
  const totalDebited = wallet?.totalDebited ?? 0;

  const toNum = (v: number | string) =>
    typeof v === "number" ? v : Number(v) || 0;

  const filteredHistory = history.filter((entry) => {
    if (filter === "ALL") return true;
    if (filter === "CREDIT") return entry.operation === "CREDIT";
    if (filter === "DEBIT") return entry.operation === "DEBIT";
    if (filter === "REFUND")
      return (
        entry.operation === "REFUND_CREDIT" ||
        entry.operation === "ADMIN_CANCEL_DEBIT"
      );
    return true;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const operationLabel = (op: string) => {
    switch (op) {
      case "CREDIT":
        return "Credit";
      case "DEBIT":
        return "Debit";
      case "REFUND_CREDIT":
        return "Refund";
      case "ADMIN_CANCEL_DEBIT":
        return "Refund";
      default:
        return op;
    }
  };

  const operationNote = (entry: AuditEntry) => {
    if (entry.giftCardId) return "Gift card redeemed";
    if (entry.orderId) return `Order #${entry.orderId.slice(0, 8)}`;
    if (entry.operation === "REFUND_CREDIT" || entry.operation === "ADMIN_CANCEL_DEBIT")
      return "Admin refund";
    if (entry.operation === "CREDIT") return "Wallet credit";
    if (entry.operation === "DEBIT") return "Wallet debit";
    return "—";
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Page Header */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="px-4 md:px-8 lg:px-12 xl:px-16 py-8 flex items-center justify-between">
          <h1 className="text-[28px] md:text-[32px] font-bold text-black tracking-tight">
            My wallet
          </h1>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
            <div className="flex items-center gap-2 text-[13px] text-[#666]">
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Non-transferable balance</span>
            </div>
            <a
              href="https://www.buynownp.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 text-[12px] font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all text-center inline-flex items-center gap-1.5"
            >
              Start Shopping
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-12 xl:px-16 py-8 space-y-8">
        {/* Balance + Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-7">
            {loadingWallet ? (
              <div className="h-[200px] rounded-2xl bg-gradient-to-br from-[#802213] via-[#4d0c04] to-[#120000] animate-pulse" />
            ) : (
              <div className="relative h-full rounded-2xl bg-gradient-to-br from-[#802213] via-[#4d0c04] to-[#120000] text-white p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-xl min-h-[200px]">
                {/* Subtle shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transform -skew-x-12" />

                {/* Top row */}
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg
                        className="w-4 h-4 text-white/70"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span className="text-[11px] md:text-[12px] font-bold text-white/70 uppercase tracking-wider">
                        Available Balance
                      </span>
                    </div>
                    <p className="text-3xl md:text-4xl font-black tracking-tight mt-2">
                      NPR {toNum(balance).toLocaleString("en-NP")}
                    </p>
                  </div>
                  <div className="px-3 py-1.5 rounded-full border border-[#d97706]/40 bg-[#d97706]/15 flex items-center gap-1.5">
                    <svg
                      className="w-3 h-3 text-[#f59e0b]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <span className="text-[10px] font-extrabold text-[#f59e0b] tracking-wider uppercase">
                      No Expiry
                    </span>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="flex items-end gap-8 mt-auto pt-6 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">
                      Total Credited
                    </p>
                    <p className="text-lg md:text-xl font-bold">
                      NPR {toNum(totalCredited).toLocaleString("en-NP")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">
                      Total Spent
                    </p>
                    <p className="text-lg md:text-xl font-bold">
                      NPR {toNum(totalDebited).toLocaleString("en-NP")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {[
              { label: "Active balance", value: balance },
              { label: "Lifetime credits", value: totalCredited },
              { label: "Lifetime debits", value: totalDebited },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-[#e5e5e5] px-6 py-4 flex items-center justify-between transition-all hover:shadow-sm"
              >
                <span className="text-[14px] text-[#555] font-medium">
                  {stat.label}
                </span>
                <span className="text-[16px] md:text-[18px] font-bold text-black tracking-tight">
                  NPR {toNum(stat.value).toLocaleString("en-NP")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem Gift Card Section */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <svg
              className="w-5 h-5 text-[#802213]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
            <h2 className="text-[18px] font-bold text-black">
              Redeem a Gift Card
            </h2>
          </div>
          <p className="text-[13px] text-[#888] mb-5 ml-8">
            Enter your gift card claim code to add funds to your wallet.
          </p>

          {step === 1 ? (
            <form
              onSubmit={handleSendOtp}
              className="flex flex-col sm:flex-row gap-3 max-w-2xl items-stretch"
            >
              <div className="flex-1">
                <input
                  id="redeemCodeInput"
                  type="text"
                  value={redeemCode}
                  onChange={(e) => {
                    setRedeemCode(e.target.value.toUpperCase());
                    setRedeemError("");
                    setRedeemErrorCode("");
                    setRedeemSuccess("");
                  }}
                  placeholder="GN-XXXX-XXXX-XXXX-XXXXXXXX"
                  className="w-full h-[48px] px-4 border border-[#ddd] rounded-lg font-mono text-[14px] text-black placeholder-[#bbb] focus:outline-none focus:border-[#802213] focus:ring-2 focus:ring-[#802213]/10 transition-all tracking-wider bg-[#fafafa]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={redeeming || !redeemCode.trim()}
                className="h-[48px] px-6 bg-black text-white rounded-lg font-bold text-[12px] uppercase tracking-wider hover:bg-[#1a1a1a] disabled:bg-[#ccc] disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-w-[140px] shadow-sm"
              >
                {redeeming ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleRedeem}
              className="flex flex-col gap-4 max-w-2xl"
            >
              {/* Code display bar */}
              <div className="h-[48px] px-4 bg-[#f8f8f8] border border-[#e5e5e5] rounded-lg text-[13px] font-mono text-black font-semibold flex items-center justify-between">
                <span className="truncate mr-3">{redeemCode}</span>
                <button
                  type="button"
                  onClick={() => {
                    setRedeemError("");
                    setStep(1);
                  }}
                  className="shrink-0 h-[30px] px-3 text-[11px] font-bold text-[#802213] bg-white border border-[#ddd] rounded-md hover:bg-[#f0f0f0] transition-colors"
                >
                  Change
                </button>
              </div>

              {/* Input + Redeem button row */}
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                {requiresOtp ? (
                  <div className="flex-1 w-full">
                    <input
                      id="redeemOtpInput"
                      type="text"
                      inputMode="numeric"
                      value={redeemOtp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                        setRedeemOtp(val);
                        setRedeemError("");
                        setRedeemErrorCode("");
                        setRedeemSuccess("");
                      }}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="w-full h-[48px] px-4 border border-[#ddd] rounded-lg font-mono text-[14px] text-black placeholder-[#bbb] focus:outline-none focus:border-[#802213] focus:ring-2 focus:ring-[#802213]/10 transition-all tracking-[0.3em] text-center bg-[#fafafa]"
                      required
                    />
                    <p className="text-[11px] text-emerald-600 mt-1.5">
                      A passcode was sent to: <strong>{recipientPhone || recipientEmail}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 w-full">
                    <input
                      id="redeemPinInput"
                      type="text"
                      inputMode="numeric"
                      value={redeemPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                        setRedeemPin(val);
                        setRedeemError("");
                        setRedeemErrorCode("");
                        setRedeemSuccess("");
                      }}
                      placeholder="Enter 6-digit Security PIN"
                      maxLength={6}
                      className="w-full h-[48px] px-4 border border-[#ddd] rounded-lg font-mono text-[14px] text-black placeholder-[#bbb] focus:outline-none focus:border-[#802213] focus:ring-2 focus:ring-[#802213]/10 transition-all tracking-[0.3em] text-center bg-[#fafafa]"
                      required
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={redeeming || (requiresOtp ? redeemOtp.length !== 6 : redeemPin.length !== 6)}
                  className="h-[48px] px-6 bg-black text-white rounded-lg font-bold text-[12px] uppercase tracking-wider hover:bg-[#1a1a1a] disabled:bg-[#ccc] disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-w-[140px] shadow-sm shrink-0"
                >
                  {redeeming ? "Redeeming..." : "Redeem Code"}
                </button>
              </div>
            </form>
          )}

          {/* Feedback Messages */}
          {redeemSuccess && (
            <div className="mt-4 bg-[#d4edda] border border-[#28a745]/30 rounded-lg p-4 text-[13px] text-[#155724] font-medium flex items-center gap-2 max-w-2xl animate-fade-in">
              <svg className="w-5 h-5 shrink-0 text-[#28a745]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {redeemSuccess}
            </div>
          )}
          {redeemError && (
            <div className={`mt-4 rounded-lg p-4 text-[13px] font-medium flex items-center gap-2 max-w-2xl animate-fade-in ${
              redeemErrorCode === "CARD_PIN_LOCKED"
                ? "bg-[#f8d7da] border border-[#dc3545]/30 text-[#721c24]"
                : redeemErrorCode === "INVALID_PIN"
                  ? "bg-[#fff3cd] border border-[#ffc107]/30 text-[#856404]"
                  : "bg-[#fff3cd] border border-[#ffc107]/30 text-[#856404]"
            }`}>
              <svg className={`w-5 h-5 shrink-0 ${
                redeemErrorCode === "CARD_PIN_LOCKED" ? "text-[#dc3545]" : "text-[#ffc107]"
              }`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {redeemErrorCode === "CARD_PIN_LOCKED" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                )}
              </svg>
              {redeemError}
            </div>
          )}
        </div>

        {/* Audit Log Section */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 md:p-8 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-[18px] font-bold text-black">Audit log</h2>
              <p className="text-[13px] text-[#888] mt-0.5">
                Every credit, debit, and refund touching this wallet.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-[#f5f5f7] rounded-lg p-1 gap-0.5">
              {(["ALL", "CREDIT", "DEBIT", "REFUND"] as AuditFilter[]).map(
                (f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 text-[12px] font-semibold uppercase tracking-wider rounded-md transition-all ${
                      filter === f
                        ? "bg-white text-black shadow-sm"
                        : "text-[#888] hover:text-[#555]"
                    }`}
                  >
                    {f}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Table */}
          {loadingHistory ? (
            <div className="py-16 text-center text-[14px] text-[#999]">
              <svg
                className="animate-spin h-6 w-6 mx-auto mb-3 text-[#ccc]"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Loading transactions...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-16 text-center">
              <svg
                className="w-10 h-10 mx-auto mb-3 text-[#ddd]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <p className="text-[14px] text-[#999]">
                No transactions yet redeem a card to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 md:-mx-8">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#e5e5e5]">
                    {["When", "Type", "Note", "Amount", "Balance After"].map(
                      (col) => (
                        <th
                          key={col}
                          className={`px-6 md:px-8 py-3 text-[11px] font-bold uppercase tracking-wider text-[#999] ${
                            col === "Amount" || col === "Balance After"
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((entry) => {
                    const isCredit =
                      entry.operation === "CREDIT" ||
                      entry.operation === "REFUND_CREDIT" ||
                      entry.operation === "ADMIN_CANCEL_DEBIT";
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-[#f3f3f3] last:border-0 hover:bg-[#fafafa] transition-colors"
                      >
                        <td className="px-6 md:px-8 py-4 text-[13px] text-[#555] whitespace-nowrap">
                          {formatDate(entry.createdAt)}
                        </td>
                        <td className="px-6 md:px-8 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              entry.operation === "CREDIT"
                                ? "bg-green-50 text-green-700"
                                : entry.operation === "DEBIT"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {operationLabel(entry.operation)}
                          </span>
                        </td>
                        <td className="px-6 md:px-8 py-4 text-[13px] text-[#888]">
                          {operationNote(entry)}
                        </td>
                        <td
                          className={`px-6 md:px-8 py-4 text-[14px] font-semibold text-right whitespace-nowrap ${
                            isCredit ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isCredit ? "+" : "−"}{" "}
                          {formatNPR(toNum(entry.amount))}
                        </td>
                        <td className="px-6 md:px-8 py-4 text-[14px] font-semibold text-right text-black whitespace-nowrap">
                          {formatNPR(toNum(entry.balanceAfter))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}