"use client";

import React, { useState } from "react";
import Layout from "@/components/Layout";
import NepalFooter from "@/components/Footer";
import { giftnowAPI } from "@/lib/api";
import { formatNPR } from "@/lib/format";
import {
  GIFTNOW_MIN_NPR,
  GIFTNOW_MAX_NPR,
  validateGiftNowAmount,
} from "@/lib/giftnow";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalContext";

type CardType = "DIGITAL" | "CORPORATE_BULK";

export default function AdminCreateGiftNowPage() {
  const { user, isAdmin } = useAuth();
  const { openAuth } = useAuthModal();

  const [type, setType] = useState<CardType>("DIGITAL");
  
  // FIX 1: Change states to strings so they can hold leading zeros and handle clear/backspace safely
  const [amount, setAmount] = useState("1000");
  const [quantity, setQuantity] = useState("10");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [batchName, setBatchName] = useState("");
  const [lastBatchId, setLastBatchId] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [createdCards, setCreatedCards] = useState<any[]>([]);

  const [lastCreatedCard, setLastCreatedCard] = useState<{
    code: string;
    pin: string;
    amount: number;
    personalMessage: string;
  } | null>(null);

  const [lastCreatedBatch, setLastCreatedBatch] = useState<{
    batchId: string;
    amount: number;
    personalMessage: string;
    cards: any[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLastBatchId("");
    setCreatedCode("");
    setCreatedCards([]);
    setLastCreatedCard(null);
    setLastCreatedBatch(null);

    // FIX 2: Convert the string states to numbers when sending to validation/API
    const numAmount = parseInt(amount, 10) || 0;
    const numQuantity = parseInt(quantity, 10) || 0;

    const err = validateGiftNowAmount(numAmount);
    if (err) {
      setError(err);
      return;
    }

    if (type === "CORPORATE_BULK" && numQuantity < 10) {
      setError("Bulk orders must have at least 10 cards");
      return;
    }

    setLoading(true);

    try {
      const res = await giftnowAPI.adminCreate({
        type,
        amount: numAmount,
        quantity: type === "CORPORATE_BULK" ? numQuantity : 1,
        batchName: batchName || `Batch ${new Date().toLocaleDateString()}`,
        personalMessage: personalMessage || undefined,
      });

      const batchId = (res as Record<string, unknown>).batchId;
      if (batchId) {
        setLastBatchId(batchId as string);
        const cards = (res as Record<string, unknown>).cards as any[];
        setCreatedCards(cards || []);
        
        setLastCreatedBatch({
          batchId: batchId as string,
          amount: numAmount,
          personalMessage,
          cards: cards || [],
        });
        
        setSuccess(`Created batch with ${numQuantity} cards (ID: ${batchId})`);
      } else {
        const code = (res as Record<string, unknown>).code as string;
        const pin = (res as Record<string, unknown>).pin as string;
        setCreatedCode(code || "");
        
        setLastCreatedCard({
          code: code || "",
          pin: pin || "",
          amount: numAmount,
          personalMessage,
        });
        
        setSuccess(`Created 1 gift card`);
      }

      setAmount("1000");
      setPersonalMessage("");
      setQuantity("10");
      setBatchName("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExportBatch = () => {
    if (!lastBatchId || createdCards.length === 0) return;
    try {
      const header = "index,code,pin,amount,batchId";
      const lines = createdCards.map((c, i) =>
        [i + 1, c.code, c.pin || "", c.amount, lastBatchId].join(",")
      );
      const csv = [header, ...lines].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `batch-${lastBatchId.slice(0, 8)}-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export batch");
    }
  };

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-900">
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem("authRedirect", "/admin/giftnow/create");
                openAuth("signin");
              }}
              className="font-semibold text-blue-600 underline"
            >
              Sign in as admin
            </button>{" "}
            to create gift cards.
          </div>
        </div>
      </Layout>
    );
  }

  const displayAmount = lastCreatedCard
    ? lastCreatedCard.amount
    : (lastCreatedBatch ? lastCreatedBatch.amount : (parseInt(amount, 10) || 0));

  const displayMessage = lastCreatedCard
    ? lastCreatedCard.personalMessage
    : (lastCreatedBatch ? lastCreatedBatch.personalMessage : personalMessage);

  const displayCode = lastCreatedCard
    ? lastCreatedCard.code
    : (lastCreatedBatch
        ? `BATCH - ${lastCreatedBatch.batchId.slice(0, 8)}...`
        : (type === "CORPORATE_BULK" ? "GN-BULK-BATCH-XXXX" : "GN-XXXX-XXXX-XXXX-XXXXXXXX"));

  return (
    <Layout showFooter={true}>
      <div className="bg-white flex-1">
        {/* Header Section */}
        <section className="py-6 border-b border-[#e5e5e5]">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16">
            <p className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-1">
              Create
            </p>
            <h1 className="text-[20px] md:text-[24px] font-bold text-black tracking-tight mb-1">
              Create Gift Cards
            </h1>
            <p className="text-[13px] text-[#666]">
              Create single or bulk gift cards for distribution
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16">
            <div className="space-y-8">
              {/* Card Type Selection */}
              <div>
                <label className="block text-[13px] font-bold text-black uppercase tracking-wider mb-4">
                  Card Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    ["DIGITAL", "CORPORATE_BULK"] as CardType[]
                  ).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setType(t);
                        setCreatedCode("");
                        setCreatedCards([]);
                        setSuccess("");
                        setLastCreatedCard(null);
                        setLastCreatedBatch(null);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        type === t
                          ? "border-black bg-black text-white"
                          : "border-[#ddd] bg-white text-black hover:border-black"
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {t === "DIGITAL" && "📧"}
                        {t === "CORPORATE_BULK" && "🏢"}
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider">
                        {t === "DIGITAL" && "Digital"}
                        {t === "CORPORATE_BULK" && "Bulk"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Two-Column Form & Preview Grid */}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Left Column: Form Inputs & Submit Button */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* FIX 3: Rewritten Amount Input */}
                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-[13px] font-bold text-black uppercase tracking-wider mb-3"
                    >
                      Amount (NPR)
                    </label>
                    <input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      value={amount}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        // Keeps exactly what you type, including zeros!
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setAmount(val);
                        setCreatedCode("");
                        setCreatedCards([]);
                        setSuccess("");
                        setLastCreatedCard(null);
                        setLastCreatedBatch(null);
                      }}
                      className="w-full px-4 py-3 border border-[#ddd] rounded font-medium text-base text-black focus:outline-none focus:border-black transition-colors"
                    />
                    <p className="text-[13px] text-[#666] mt-2">
                      Value:{" "}
                      <span className="font-bold text-black">
                        {formatNPR(parseInt(amount, 10) || 0)}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#999] mt-1">
                      Min: {formatNPR(GIFTNOW_MIN_NPR)} — Max:{" "}
                      {formatNPR(GIFTNOW_MAX_NPR)}
                    </p>
                  </div>

                  {/* Message (Optional) Input */}
                  <div>
                    <label
                      htmlFor="personalMessage"
                      className="block text-[13px] font-bold text-black uppercase tracking-wider mb-3"
                    >
                      Message (Optional)
                    </label>
                    <textarea
                      id="personalMessage"
                      rows={3}
                      value={personalMessage}
                      onChange={(e) => {
                        setPersonalMessage(e.target.value);
                        setCreatedCode("");
                        setCreatedCards([]);
                        setSuccess("");
                        setLastCreatedCard(null);
                        setLastCreatedBatch(null);
                      }}
                      placeholder="Add an optional personal message to be printed/included on the card..."
                      className="w-full px-4 py-3 border border-[#ddd] rounded font-medium text-sm text-black placeholder-[#999] focus:outline-none focus:border-black transition-colors resize-none"
                    />
                  </div>

                  {/* Conditional Fields for Bulk */}
                  {type === "CORPORATE_BULK" && (
                    <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-[#e5e5e5]">
                      
                      {/* FIX 4: Rewritten Quantity Input */}
                      <div>
                        <label
                          htmlFor="quantity"
                          className="block text-[13px] font-bold text-black uppercase tracking-wider mb-3"
                        >
                          Quantity
                        </label>
                        <input
                          id="quantity"
                          type="text"
                          inputMode="numeric"
                          value={quantity}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            // Clears out naturally so typing "50" won't append onto "10"
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setQuantity(val);
                            setCreatedCode("");
                            setCreatedCards([]);
                            setSuccess("");
                            setLastCreatedCard(null);
                            setLastCreatedBatch(null);
                          }}
                          className="w-full px-4 py-3 border border-[#ddd] rounded font-medium text-base text-black focus:outline-none focus:border-black transition-colors bg-white"
                        />
                        <p className="text-[13px] text-[#666] mt-2">
                          Total Value:{" "}
                          <span className="font-bold text-black">
                            {formatNPR((parseInt(amount, 10) || 0) * (parseInt(quantity, 10) || 0))}
                          </span>
                        </p>
                        <p className="text-[11px] text-[#999] mt-1">
                          Minimum 10 cards per bulk order
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="batchName"
                          className="block text-[13px] font-bold text-black uppercase tracking-wider mb-3"
                        >
                          Batch Name (Optional)
                        </label>
                        <input
                          id="batchName"
                          type="text"
                          value={batchName}
                          onChange={(e) => {
                            setBatchName(e.target.value);
                            setCreatedCode("");
                            setCreatedCards([]);
                            setSuccess("");
                            setLastCreatedCard(null);
                            setLastCreatedBatch(null);
                          }}
                          placeholder="e.g., Q1 Corporate Distribution"
                          className="w-full px-4 py-3 border border-[#ddd] rounded font-medium text-base text-black placeholder-[#999] focus:outline-none focus:border-black transition-colors bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Alert */}
                  {error && (
                    <div className="bg-[#fff3cd] border border-[#ffc107] rounded-lg p-4 text-[13px] text-[#856404]">
                      <div className="font-bold mb-1">Error</div>
                      {error}
                    </div>
                  )}

                  {/* Success Alert */}
                  {success && (
                    <div className="bg-[#d4edda] border border-[#28a745] rounded-lg p-4">
                      <div className="text-[13px] text-[#155724]">
                        <div className="font-bold mb-2">Success</div>
                        {success}
                      </div>
                      {lastBatchId && (
                        <button
                          type="button"
                          onClick={handleExportBatch}
                          className="mt-3 px-4 py-2 bg-[#28a745] text-white text-[13px] font-medium rounded hover:bg-[#218838] transition-colors"
                        >
                          Export Batch CSV
                        </button>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-black text-white rounded font-bold text-[14px] uppercase tracking-wider hover:bg-[#1a1a1a] disabled:bg-[#999] transition-colors"
                  >
                    {loading
                      ? "Creating..."
                      : `Create ${type === "CORPORATE_BULK" ? (parseInt(quantity, 10) || 0) + " Cards" : "Card"}`}
                  </button>
                </div>

                {/* Right Column: Card Preview */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
                  <label className="block text-[13px] font-bold text-black uppercase tracking-wider">
                    Card Preview
                  </label>
                  
                  <div className="relative w-full aspect-[1.586/1] bg-gradient-to-br from-[#802213] via-[#4d0c04] to-[#120000] text-white rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden border border-[#9a3412]/30 select-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transform -skew-x-12" />

                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                          GiftNow
                        </h2>
                      </div>
                      <div className="px-2.5 py-1 rounded-full border border-[#d97706]/40 bg-[#d97706]/10">
                        <span className="text-[9px] md:text-[10px] font-extrabold text-[#f59e0b] tracking-wider uppercase">
                          No Expiry
                        </span>
                      </div>
                    </div>

                    <div className="my-auto space-y-2">
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">
                          Card Code
                        </p>
                        <p className="font-mono text-sm md:text-base lg:text-lg xl:text-xl font-bold tracking-widest text-white drop-shadow break-all">
                          {displayCode}
                        </p>
                      </div>
                      {(lastCreatedCard?.pin || lastCreatedBatch) && (
                        <div>
                          <p className="text-[9px] md:text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">
                            Security PIN
                          </p>
                          <p className="font-mono text-lg md:text-xl font-bold tracking-[0.3em] text-emerald-400 drop-shadow">
                            {lastCreatedCard?.pin || "••••••"}
                          </p>
                        </div>
                      )}
                      {displayMessage && (
                        <p className="text-[11px] italic text-white/80 line-clamp-2 max-w-[85%] border-t border-white/10 pt-1">
                          "{displayMessage}"
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">
                          Value
                        </p>
                        <p className="text-lg md:text-2xl font-black tracking-tight">
                          {formatNPR(displayAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] md:text-[10px] text-white/80 font-medium">
                          Lifetime balance
                        </p>
                        <p className="text-[8px] md:text-[9px] text-white/50">
                          Platform-wide
                        </p>
                      </div>
                    </div>
                  </div>

                  {type === "CORPORATE_BULK" && createdCards.length > 0 && (
                    <div className="bg-gray-50 border border-[#e5e5e5] rounded-xl p-4 space-y-2.5 max-h-60 overflow-y-auto">
                      <div className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#e5e5e5] pb-2 flex justify-between items-center">
                        <span>Generated Codes ({createdCards.length})</span>
                        <span className="text-[10px] text-gray-500 normal-case font-normal">Scroll to view</span>
                      </div>
                      <div className="space-y-1.5 font-mono text-[11px] text-gray-700">
                        {createdCards.map((c, index) => (
                          <div key={c.id || index} className="flex justify-between py-1 border-b border-[#f3f3f3] last:border-0">
                            <span className="text-gray-400">#{index + 1}</span>
                            <span className="font-semibold text-black">{c.code}</span>
                            <span className="text-emerald-600 font-semibold">{c.pin || "—"}</span>
                            <span className="text-gray-500">{formatNPR(c.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}