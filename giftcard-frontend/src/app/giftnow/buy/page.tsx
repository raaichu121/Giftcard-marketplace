"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import NepalFooter from "@/components/Footer";
import { giftnowAPI } from "@/lib/api";
import { formatNPR } from "@/lib/format";
import {
  GIFTNOW_MIN_NPR,
  GIFTNOW_MAX_NPR,
  validateGiftNowAmount,
} from "@/lib/giftnow";
import GiftCard from "@/components/giftnow/GiftCard";
import CardPicker, { Occasion, OccasionCard } from "@/components/giftnow/CardPicker";
import CardDownload from "@/components/giftnow/CardDownload";
import toast from "react-hot-toast";

type CardType = "DIGITAL" | "CORPORATE_BULK";

export default function BuyGiftCardPage() {
  const [type, setType] = useState<CardType>("DIGITAL");
  const [amount, setAmount] = useState("1000");
  const [quantity, setQuantity] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [deliveryChannel, setDeliveryChannel] = useState<"EMAIL" | "SMS">("EMAIL");
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [createdCards, setCreatedCards] = useState<any[]>([]);

  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [selectedCard, setSelectedCard] = useState<OccasionCard | null>(null);
  const [settings, setSettings] = useState<{
    minAmount: number;
    maxAmount: number;
    enabledTypes: string[];
    enabledChannels: string[];
  }>({
    minAmount: 100,
    maxAmount: 100000,
    enabledTypes: ["DIGITAL", "PHYSICAL", "CORPORATE_BULK"],
    enabledChannels: ["EMAIL", "SMS"],
  });

  const [lastCreatedCard, setLastCreatedCard] = useState<{
    code: string;
    amount: number;
    personalMessage: string;
  } | null>(null);

  const [lastCreatedBatch, setLastCreatedBatch] = useState<{
    batchId: string;
    amount: number;
    personalMessage: string;
    cards: any[];
  } | null>(null);

  useEffect(() => {
    async function loadOccasions() {
      try {
        const res = await giftnowAPI.getOccasions();
        if (res?.data) {
          setOccasions(res.data);
        }
      } catch (err) {
        console.error("Failed to load occasions:", err);
      }
    }
    async function loadSettings() {
      try {
        const res = await giftnowAPI.getPublicSettings();
        const data = res?.data;
        if (data) {
          setSettings({
            ...data,
            enabledChannels: data.enabledChannels || ["EMAIL", "SMS"],
          });
          const supported = (["DIGITAL", "CORPORATE_BULK"] as CardType[]).filter(t => data.enabledTypes?.includes(t));
          if (supported.length > 0) {
            setType(prev => supported.includes(prev) ? prev : supported[0]);
          }
          // Sync deliveryChannel to enabled channels
          const channels = data.enabledChannels || ["EMAIL", "SMS"];
          setDeliveryChannel(prev => channels.includes(prev) ? prev : (channels[0] as "EMAIL" | "SMS") || "EMAIL");
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadOccasions();
    loadSettings();
  }, []);

  const clearPreview = () => {
    setCreatedCode("");
    setCreatedCards([]);
    setSuccess("");
    setLastCreatedCard(null);
    setLastCreatedBatch(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    clearPreview();

    // Validate purchaser details
    if (!purchaserName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!purchaserEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(purchaserEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    const numAmount = parseInt(amount, 10) || 0;
    const numQuantity = parseInt(quantity, 10) || 0;

    let err: string | null = null;
    if (!Number.isFinite(numAmount) || numAmount < settings.minAmount || numAmount > settings.maxAmount) {
      err = `Amount must be between NPR ${settings.minAmount.toLocaleString("en-NP")} and NPR ${settings.maxAmount.toLocaleString("en-NP")}`;
    } else if (!Number.isInteger(numAmount)) {
      err = "Enter a whole rupee amount";
    }

    if (err) {
      setError(err);
      return;
    }

    if (type === "DIGITAL") {
      if (deliveryChannel === "EMAIL") {
        if (!recipientEmail.trim()) {
          setError("Recipient email is required for email delivery");
          return;
        }
      } else {
        if (!recipientPhone.trim()) {
          setError("Recipient phone number is required for SMS delivery");
          return;
        }
      }
    } else if (type === "CORPORATE_BULK") {
      if (!recipientEmail.trim()) {
        setError("Recipient email is required for corporate bulk CSV delivery");
        return;
      }
      if (numQuantity < 10) {
        setError("Bulk orders must have at least 10 cards");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await giftnowAPI.purchaseGuest({
        type,
        amount: numAmount,
        recipientEmail: (type === "DIGITAL" && deliveryChannel === "EMAIL") || type === "CORPORATE_BULK" ? recipientEmail.trim() : undefined,
        recipientPhone: type === "DIGITAL" && deliveryChannel === "SMS" ? recipientPhone.trim() : undefined,
        deliveryChannel: type === "DIGITAL" ? deliveryChannel : "EMAIL",
        personalMessage: personalMessage || undefined,
        quantity: type === "CORPORATE_BULK" ? numQuantity : 1,
        purchaserName: purchaserName.trim(),
        purchaserEmail: purchaserEmail.trim(),
        cardDesignId: selectedCard ? selectedCard.id : undefined,
      });

      const cards = (res as Record<string, unknown>).cards as any[];
      if (cards && cards.length > 1) {
        const batchId = (res as Record<string, unknown>).batchId as string || "N/A";
        setCreatedCards(cards);
        setLastCreatedBatch({
          batchId,
          amount: numAmount,
          personalMessage,
          cards: cards,
        });
        setSuccess(`🎉 Successfully purchased ${numQuantity} gift cards!`);
      } else {
        const code = (res as Record<string, unknown>).code as string;
        setCreatedCode(code || "");
        setLastCreatedCard({
          code: code || "",
          amount: numAmount,
          personalMessage,
        });
        setSuccess("🎉 Your gift card has been created successfully!");
      }

      // Reset form
      setAmount("1000");
      setPersonalMessage("");
      setQuantity("10");
      setRecipientEmail("");
      setRecipientPhone("");
      setDeliveryChannel("EMAIL");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Purchase failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayAmount = lastCreatedCard
    ? lastCreatedCard.amount
    : lastCreatedBatch
      ? lastCreatedBatch.amount
      : parseInt(amount, 10) || 0;

  const displayMessage = lastCreatedCard
    ? lastCreatedCard.personalMessage
    : lastCreatedBatch
      ? lastCreatedBatch.personalMessage
      : personalMessage;

  const displayCode = lastCreatedCard
    ? lastCreatedCard.code
    : lastCreatedBatch
      ? `BATCH - ${lastCreatedBatch.batchId.slice(0, 8)}...`
      : type === "CORPORATE_BULK"
        ? "GN-BULK-BATCH-XXXX"
        : "GN-XXXX-XXXX-XXXX-XXXXXXXX";

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Header */}
        <section className="py-10 border-b border-[#e5e5e5] bg-gradient-to-b from-[#fafafa] to-white">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16 text-center">
            <h1 className="text-[28px] md:text-[36px] font-bold text-black tracking-tight mb-2">
              Buy a Gift Card
            </h1>
            <p className="text-[14px] text-[#666] max-w-lg mx-auto">
              Send the perfect gift no account needed. Choose an amount, personalize your message, and share instantly.
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
                  {(["DIGITAL", "CORPORATE_BULK"] as CardType[])
                    .filter((t) => settings.enabledTypes.includes(t))
                    .map((t) => (
                      <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setType(t);
                        clearPreview();
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
                      <div className="text-[10px] mt-1 opacity-70">
                        {t === "DIGITAL" && "Send via email instantly"}
                        {t === "CORPORATE_BULK" && "Order multiple cards"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Two-Column Form & Preview Grid */}
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
              >
                {/* Left Column: Form Inputs */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Your Details Section */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-[#e5e5e5] space-y-5">
                    <div className="text-[11px] font-bold text-[#888] uppercase tracking-wider border-b border-[#e5e5e5] pb-3">
                      Your Details
                    </div>

                    {/* Your Name */}
                    <div>
                      <label
                        htmlFor="purchaserName"
                        className="block text-[13px] font-bold text-black uppercase tracking-wider mb-2"
                      >
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="purchaserName"
                        type="text"
                        value={purchaserName}
                        onChange={(e) => {
                          setPurchaserName(e.target.value);
                          clearPreview();
                        }}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border border-[#ddd] rounded font-medium text-base text-black placeholder-[#999] focus:outline-none focus:border-black transition-colors bg-white"
                      />
                    </div>

                    {/* Your Email */}
                    <div>
                      <label
                        htmlFor="purchaserEmail"
                        className="block text-[13px] font-bold text-black uppercase tracking-wider mb-2"
                      >
                        Your Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="purchaserEmail"
                        type="email"
                        value={purchaserEmail}
                        onChange={(e) => {
                          setPurchaserEmail(e.target.value);
                          clearPreview();
                        }}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border border-[#ddd] rounded font-medium text-base text-black placeholder-[#999] focus:outline-none focus:border-black transition-colors bg-white"
                      />
                      <p className="text-[11px] text-[#999] mt-1">
                        Purchase confirmation will be sent here
                      </p>
                    </div>
                  </div>

                  {/* Card Design Picker */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-[#e5e5e5]">
                    <div className="text-[11px] font-bold text-[#888] uppercase tracking-wider border-b border-[#e5e5e5] pb-3 mb-4">
                      Choose Card Theme
                    </div>
                    <CardPicker
                      occasions={occasions}
                      selectedCard={selectedCard}
                      onSelectCard={(card) => {
                        setSelectedCard(card);
                        clearPreview();
                      }}
                    />
                  </div>

                  {/* Recipient Email & Phone for DIGITAL */}
                  {type === "DIGITAL" && (
                    <div className="space-y-6">
                      {/* Delivery Channel Selector — only show if both channels are enabled */}
                      {settings.enabledChannels.includes("EMAIL") && settings.enabledChannels.includes("SMS") && (
                        <div>
                          <label className="block text-[13px] font-bold text-black uppercase tracking-wider mb-3">
                            Delivery Channel
                          </label>
                          <div className="flex gap-2 p-1 bg-gray-50 border border-[#ddd] rounded-lg">
                            {(["EMAIL", "SMS"] as const).map((ch) => (
                              <button
                                key={ch}
                                type="button"
                                onClick={() => {
                                  setDeliveryChannel(ch);
                                  clearPreview();
                                }}
                                className={`flex-1 py-2 rounded text-[12px] font-bold transition-all duration-200 ${
                                  deliveryChannel === ch
                                    ? "bg-black text-white"
                                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                                }`}
                              >
                                {ch === "EMAIL" ? "Email Delivery" : "SMS Delivery"}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Conditional recipient contact input based on selected channel */}
                      {deliveryChannel === "EMAIL" ? (
                        <div>
                          <label
                            htmlFor="recipientEmail"
                            className="block text-[13px] font-bold text-black uppercase tracking-wider mb-3"
                          >
                            Recipient Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="recipientEmail"
                            type="email"
                            value={recipientEmail}
                            onChange={(e) => {
                              setRecipientEmail(e.target.value);
                              clearPreview();
                            }}
                            placeholder="recipient@example.com"
                            className="w-full px-4 py-3 border border-[#ddd] rounded font-medium text-base text-black placeholder-[#999] focus:outline-none focus:border-black transition-colors bg-white"
                          />
                        </div>
                      ) : (
                        <div>
                          <label
                            htmlFor="recipientPhone"
                            className="block text-[13px] font-bold text-black uppercase tracking-wider mb-3"
                          >
                            Recipient Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="recipientPhone"
                            type="text"
                            value={recipientPhone}
                            onChange={(e) => {
                              setRecipientPhone(e.target.value);
                              clearPreview();
                            }}
                            placeholder="+977 98XXXXXXXX"
                            className="w-full px-4 py-3 border border-[#ddd] rounded font-medium text-base text-black placeholder-[#999] focus:outline-none focus:border-black transition-colors bg-white"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recipient Email for CORPORATE_BULK */}
                  {type === "CORPORATE_BULK" && (
                    <div>
                      <label
                        htmlFor="recipientEmail"
                        className="block text-[13px] font-bold text-black uppercase tracking-wider mb-3"
                      >
                        Recipient Email (For CSV Delivery) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="recipientEmail"
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => {
                          setRecipientEmail(e.target.value);
                          clearPreview();
                        }}
                        placeholder="recipient@example.com"
                        className="w-full px-4 py-3 border border-[#ddd] rounded font-medium text-base text-black placeholder-[#999] focus:outline-none focus:border-black transition-colors bg-white"
                      />
                      <p className="text-[11px] text-[#999] mt-1">
                        A CSV file containing all generated bulk gift card codes will be sent to this email address
                      </p>
                    </div>
                  )}

                  {/* Amount Input */}
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
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setAmount(val);
                        clearPreview();
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
                      Min: {formatNPR(settings.minAmount)} — Max:{" "}
                      {formatNPR(settings.maxAmount)}
                    </p>
                  </div>

                  {/* Message (Optional) */}
                  <div>
                    <label
                      htmlFor="personalMessage"
                      className="block text-[13px] font-bold text-black uppercase tracking-wider mb-3"
                    >
                      Personal Message (Optional)
                    </label>
                    <textarea
                      id="personalMessage"
                      rows={3}
                      value={personalMessage}
                      onChange={(e) => {
                        setPersonalMessage(e.target.value);
                        clearPreview();
                      }}
                      placeholder="Add a personal message to make your gift extra special..."
                      className="w-full px-4 py-3 border border-[#ddd] rounded font-medium text-sm text-black placeholder-[#999] focus:outline-none focus:border-black transition-colors resize-none"
                    />
                  </div>

                  {/* Bulk-specific fields */}
                  {type === "CORPORATE_BULK" && (
                    <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-[#e5e5e5]">
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
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setQuantity(val);
                            clearPreview();
                          }}
                          className="w-full px-4 py-3 border border-[#ddd] rounded font-medium text-base text-black focus:outline-none focus:border-black transition-colors bg-white"
                        />
                        <p className="text-[13px] text-[#666] mt-2">
                          Total Value:{" "}
                          <span className="font-bold text-black">
                            {formatNPR(
                              (parseInt(amount, 10) || 0) *
                                (parseInt(quantity, 10) || 0)
                            )}
                          </span>
                        </p>
                        <p className="text-[11px] text-[#999] mt-1">
                          Minimum 10 cards per bulk order
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Alert */}
                  {error && (
                    <div className="bg-[#fff3cd] border border-[#ffc107] rounded-lg p-4 text-[13px] text-[#856404]">
                      <div className="font-bold mb-1">⚠ Error</div>
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
                      {createdCode && (
                        <div className="mt-3 bg-white/60 rounded p-3 border border-[#28a745]/20">
                          <p className="text-[11px] font-bold text-[#155724] uppercase tracking-wider mb-1">
                            Your Claim Code
                          </p>
                          <p className="font-mono text-[15px] font-bold text-[#155724] tracking-widest">
                            {createdCode}
                          </p>
                        </div>
                      )}
                      {createdCards && createdCards.length > 0 && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              const csvHeader = "Code,Amount\n";
                              const csvRows = createdCards
                                .map((c: any) => `${c.code},${c.amount}`)
                                .join("\n");
                              const blob = new Blob([csvHeader + csvRows], {
                                type: "text/csv;charset=utf-8;",
                              });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.setAttribute("href", url);
                              link.setAttribute(
                                "download",
                                `giftnow_bulk_codes_${Date.now()}.csv`
                              );
                              link.style.visibility = "hidden";
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#28a745] hover:bg-[#218838] text-white text-[12px] font-bold rounded transition-colors shadow-sm cursor-pointer"
                          >
                            Export Batch (CSV)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-[11px] text-[#999] text-center">
                    No account required • Instant delivery • No expiry
                  </p>
                </div>

                  {/* Right Column: Order Summary */}
                <div className="lg:col-span-5 lg:sticky lg:top-[88px]">
                  <div className="bg-white border border-[#e5e5e5] rounded-lg shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4">
                      <h2 className="text-[13px] font-bold text-black uppercase tracking-wider">Card summary</h2>
                    </div>

                    {/* Card Preview */}
                    <div className="px-6 pb-4">
                      <div className="w-full flex justify-center">
                         <GiftCard
                          imagePath={selectedCard?.imagePath}
                          valueBox={selectedCard?.valueBox}
                          valueColor={selectedCard?.valueColor}
                          amount={displayAmount}
                          recipient={
                            type === "DIGITAL"
                              ? deliveryChannel === "EMAIL"
                                ? recipientEmail || "recipient@example.com"
                                : recipientPhone || "+977 98XXXXXXXX"
                              : recipientEmail || undefined
                          }
                          code={displayCode}
                          shouldShowCode={!!lastCreatedCard || !!lastCreatedBatch}
                          size="full"
                        />
                      </div>

                      {success && createdCode && (
                        <div className="flex justify-center pt-2">
                          <CardDownload
                            cardElementId="gift-card-print"
                            filename={`giftnow-card-${createdCode}.png`}
                            className="w-full text-center py-3"
                          />
                        </div>
                      )}
                    </div>

                    {/* Detail Rows */}
                    <div className="px-6 space-y-3.5 text-[13px]">
                      {/* Theme */}
                      <div className="flex justify-between items-center">
                        <span className="text-[#666]">Theme</span>
                        <span className="font-bold text-black">{selectedCard?.name || "Default Design"}</span>
                      </div>

                      {/* Amount */}
                      <div className="flex justify-between items-center">
                        <span className="text-[#666]">Amount</span>
                        <span className="font-bold text-black">{formatNPR(parseInt(amount, 10) || 0)}</span>
                      </div>

                      {/* Delivery */}
                      <div className="flex justify-between items-center">
                        <span className="text-[#666]">Delivery</span>
                        <span className="font-bold text-black">
                          {type === "CORPORATE_BULK"
                            ? "Email (Bulk CSV)"
                            : deliveryChannel === "EMAIL"
                              ? "Email"
                              : "SMS"}
                        </span>
                      </div>

                      {/* Recipient Email — only show for EMAIL or CORPORATE_BULK */}
                      {((type === "DIGITAL" && deliveryChannel === "EMAIL" && recipientEmail.trim()) ||
                        type === "CORPORATE_BULK") && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#666]">Recipient Email</span>
                          <span className="font-bold text-black text-right truncate max-w-[180px]" title={recipientEmail}>
                            {recipientEmail}
                          </span>
                        </div>
                      )}

                      {/* Recipient Phone — only show for SMS */}
                      {type === "DIGITAL" && deliveryChannel === "SMS" && recipientPhone.trim() && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#666]">Recipient Phone</span>
                          <span className="font-bold text-black text-right truncate max-w-[180px]" title={recipientPhone}>
                            {recipientPhone}
                          </span>
                        </div>
                      )}

                      {/* Quantity */}
                      <div className="flex justify-between items-center">
                        <span className="text-[#666]">Quantity</span>
                        <div className="flex items-center gap-3">
                          {type === "CORPORATE_BULK" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = parseInt(quantity, 10) || 10;
                                  if (cur > 10) setQuantity(String(cur - 1));
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-full border border-[#ccc] text-[#555] hover:bg-[#f5f5f5] transition-colors text-sm font-bold"
                              >
                                −
                              </button>
                              <span className="font-bold text-black w-6 text-center">{quantity}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = parseInt(quantity, 10) || 10;
                                  setQuantity(String(cur + 1));
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-full border border-[#ccc] text-[#555] hover:bg-[#f5f5f5] transition-colors text-sm font-bold"
                              >
                                +
                              </button>
                            </>
                          ) : (
                            <span className="font-bold text-black">1</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-6 my-4 border-t border-[#e5e5e5]"></div>

                    {/* Total */}
                    <div className="px-6 pb-4 flex justify-between items-center">
                      <span className="text-[13px] font-bold text-black uppercase tracking-wider">Total</span>
                      <span className="text-[15px] font-bold text-black">
                        {formatNPR(
                          type === "CORPORATE_BULK"
                            ? (parseInt(amount, 10) || 0) * (parseInt(quantity, 10) || 0)
                            : parseInt(amount, 10) || 0
                        )}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 pb-4 space-y-3">
                      {/* Buy Now — form submit */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-[#000000] hover:bg-[#2b2928] text-white rounded-lg font-bold text-[13px] uppercase tracking-wider disabled:bg-[#ccc] transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                      >
                        <span>{loading ? "Processing..." : `Buy Now  ${formatNPR(
                          type === "CORPORATE_BULK"
                            ? (parseInt(amount, 10) || 0) * (parseInt(quantity, 10) || 0)
                            : parseInt(amount, 10) || 0
                        )}`}</span>
                      </button>

                      {/* Payment Buttons — FonePay & connectIPS */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => toast.success("FonePay payment coming soon!")}
                          className="py-3 bg-[#000000] hover:bg-[#2b2928] text-white rounded-lg font-bold text-[13px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <span>FonePay</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.success("connectIPS payment coming soon!")}
                          className="py-3 bg-[#000000] hover:bg-[#2b2928] text-white rounded-lg font-bold text-[13px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <span>ConnectIPS</span>
                        </button>
                      </div>
                    </div>

                    {/* Security Badge */}
                    <div className="px-6 pb-5 text-center">
                      <p className="text-[11px] text-[#999] flex items-center justify-center gap-1">
                        <span>SSL Encrypted · PCI DSS · PIN Protected</span>
                      </p>
                    </div>
                  </div>

                  {/* Generated Bulk Codes — shown after success */}
                  {type === "CORPORATE_BULK" && createdCards.length > 0 && (
                    <div className="mt-4 bg-gray-50 border border-[#e5e5e5] rounded-xl p-4 space-y-2.5 max-h-60 overflow-y-auto">
                      <div className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#e5e5e5] pb-2 flex justify-between items-center">
                        <span>Generated Codes ({createdCards.length})</span>
                        <span className="text-[10px] text-gray-500 normal-case font-normal">
                          Scroll to view
                        </span>
                      </div>
                      <div className="space-y-1.5 font-mono text-[11px] text-gray-700">
                        {createdCards.map((c: any, index: number) => (
                          <div
                            key={c.id || index}
                            className="flex justify-between py-1 border-b border-[#f3f3f3] last:border-0"
                          >
                            <span className="text-gray-400">
                              #{index + 1}
                            </span>
                            <span className="font-semibold text-black">
                              {c.code}
                            </span>
                            <span className="text-gray-500">
                              {formatNPR(c.amount)}
                            </span>
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
        <NepalFooter />
      </div>
    </Layout>
  );
}