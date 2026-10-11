"use client";

import React, { useState, useEffect } from "react";
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

type DeliveryType = "DIGITAL" | "PHYSICAL" | "CORPORATE_BULK";

interface GiftNowPurchaseProps {
  onSuccess?: (result: { code: string; amount: number }) => void;
}

export default function GiftNowPurchase({ onSuccess }: GiftNowPurchaseProps) {
  const [type, setType] = useState<DeliveryType>("DIGITAL");
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [deliveryChannel, setDeliveryChannel] = useState<"EMAIL" | "SMS">("EMAIL");
  const [personalMessage, setPersonalMessage] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [bulkCount, setBulkCount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ code: string; amount: number } | null>(
    null,
  );

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
          const supported = (["DIGITAL", "PHYSICAL", "CORPORATE_BULK"] as DeliveryType[]).filter(t => data.enabledTypes?.includes(t));
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

  const effectiveAmount = customAmount ? parseInt(customAmount, 10) : amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let err: string | null = null;
    if (!Number.isFinite(effectiveAmount) || effectiveAmount < settings.minAmount || effectiveAmount > settings.maxAmount) {
      err = `Amount must be between NPR ${settings.minAmount.toLocaleString("en-NP")} and NPR ${settings.maxAmount.toLocaleString("en-NP")}`;
    } else if (!Number.isInteger(effectiveAmount)) {
      err = "Enter a whole rupee amount";
    }

    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload: Parameters<typeof giftnowAPI.purchase>[0] = {
        type,
        amount: effectiveAmount,
        personalMessage: personalMessage || undefined,
        cardDesignId: selectedCard ? selectedCard.id : undefined,
      };

      if (type === "DIGITAL") {
        if (deliveryChannel === "EMAIL") {
          if (!recipientEmail.trim()) {
            setError("Recipient email is required for email delivery");
            setLoading(false);
            return;
          }
          payload.recipientEmail = recipientEmail.trim();
          payload.recipientPhone = undefined;
        } else {
          if (!recipientPhone.trim()) {
            setError("Recipient phone number is required for SMS delivery");
            setLoading(false);
            return;
          }
          payload.recipientPhone = recipientPhone.trim();
          payload.recipientEmail = undefined;
        }
        payload.deliveryChannel = deliveryChannel;
      } else if (type === "PHYSICAL") {
        payload.deliveryAddress = {
          street,
          city,
          country: "NP",
        };
      } else {
        const qty = Number(bulkCount);
        if (!qty || qty < 10) {
          setError("Corporate bulk requires at least 10 cards");
          setLoading(false);
          return;
        }
        if (!recipientEmail.trim()) {
          setError("Recipient email is required for corporate bulk CSV delivery");
          setLoading(false);
          return;
        }
        payload.quantity = qty;
        payload.recipientEmail = recipientEmail.trim();
      }

      const res = await giftnowAPI.purchase(payload);
      const data = res as { code: string; amount: number };
      const out = data.code
        ? data
        : (res.data as { code: string; amount: number });
      setResult(out);
      onSuccess?.(out);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  const presets = [500, 1000, 2000, 5000, 10000].filter(
    (p) => p >= settings.minAmount && p <= settings.maxAmount,
  );

  // Card color presets based on delivery type
  const getCardGradient = () => {
    if (type === "PHYSICAL") return "from-amber-500 via-[#d4af37] to-amber-700";
    if (type === "CORPORATE_BULK") return "from-slate-700 via-slate-800 to-[#1e293b]";
    return "from-gc-purple via-[#bd1b55] to-accent-600";
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      {/* Left side: Purchase form */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6 glass p-8 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Configure Gift Card</h2>

        {/* Card Design Picker */}
        <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
          <CardPicker
            occasions={occasions}
            selectedCard={selectedCard}
            onSelectCard={(card) => {
              setSelectedCard(card);
              setResult(null);
            }}
          />
        </div>

        {/* Delivery Type selector */}
        <div className="flex gap-2 p-1.5 bg-white/5 rounded-xl border border-white/5">
          {(["DIGITAL", "PHYSICAL", "CORPORATE_BULK"] as DeliveryType[])
            .filter((t) => settings.enabledTypes.includes(t))
            .map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  setError("");
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                  type === t
                    ? "bg-gc-purple text-white shadow-glow"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {t === "DIGITAL"
                  ? " Digital"
                  : t === "PHYSICAL"
                    ? " Physical"
                    : " Corporate"}
              </button>
            ),
          )}
        </div>

        {/* Amount Input */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Select Face Value
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setAmount(p);
                  setCustomAmount("");
                }}
                className={`px-4 py-2 text-xs font-bold border rounded-lg transition-all duration-200 ${
                  amount === p && !customAmount
                    ? "border-gc-purple bg-gc-purple/15 text-white shadow-glow"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                }`}
              >
                {formatNPR(p)}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">NPR</span>
            <input
              type="number"
              placeholder="Or enter custom whole amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min={settings.minAmount}
              max={settings.maxAmount}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs focus:outline-none focus:border-gc-purple focus:ring-1 focus:ring-gc-purple/20"
            />
          </div>
        </div>

        {/* Conditional inputs */}
        {type === "DIGITAL" ? (
          <div className="space-y-4">
            {/* Delivery Channel Selector — only show if both channels are enabled */}
            {settings.enabledChannels.includes("EMAIL") && settings.enabledChannels.includes("SMS") && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                  Delivery Channel
                </label>
                <div className="flex gap-2 p-1.5 bg-white/5 rounded-xl border border-white/5">
                  {(["EMAIL", "SMS"] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => {
                        setDeliveryChannel(ch);
                        setError("");
                      }}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                        deliveryChannel === ch
                          ? "bg-gc-purple text-white shadow-glow"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {ch === "EMAIL" ? "📧 Email Delivery" : "💬 SMS Delivery"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conditional recipient contact input based on selected channel */}
            {deliveryChannel === "EMAIL" ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs focus:outline-none focus:border-gc-purple"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Recipient Phone</label>
                <input
                  type="text"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="+977 98XXXXXXXX"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs focus:outline-none focus:border-gc-purple"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Gift Message (Optional)</label>
              <textarea
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="A warm greeting..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs resize-none focus:outline-none focus:border-gc-purple"
              />
            </div>
          </div>
        ) : type === "PHYSICAL" ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Street Address</label>
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Royal Palace Way"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs focus:outline-none focus:border-gc-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Kathmandu"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs focus:outline-none focus:border-gc-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Country</label>
              <input
                value="Nepal (NP)"
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/5 text-slate-500 rounded-lg text-xs"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Quantity (Min 10)</label>
                <input
                  type="number"
                  value={bulkCount}
                  onChange={(e) =>
                    setBulkCount(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  min={10}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs focus:outline-none focus:border-gc-purple"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Recipient Email</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="corporate@company.com"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs focus:outline-none focus:border-gc-purple"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
              Corporate bulk creates multiple cards in a single batch. Orders containing 100+ cards qualify for discounted custom rates handled by corporate accounts team.
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg">
             {error}
          </p>
        )}

        {result && (
          <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-2 animate-fade-in">
            <p className="font-bold text-emerald-400 flex items-center gap-1.5">
              {type === "CORPORATE_BULK" ? "Bulk Batch Initialized!" : "Gift Card Issued Successfully!"}
            </p>
            <div className="bg-black/20 p-3 rounded-lg space-y-1 font-mono text-slate-300 border border-white/5">
              <p><span className="text-slate-500">Code:</span> {result.code}</p>
              <p><span className="text-slate-500">Value:</span> {formatNPR(result.amount)}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-gc-purple to-accent-600 hover:shadow-glow text-white font-extrabold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 text-xs uppercase tracking-wider"
        >
          {loading ? "Processing Order…" : `Purchase Card — ${formatNPR(effectiveAmount)}`}
        </button>
      </form>

      {/* Right side: Live Preview Mockup Card */}
      <div className="lg:col-span-5 sticky top-28 space-y-6">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Live Card Preview</span>
        
        <div className="w-full flex justify-center">
          <GiftCard
            imagePath={selectedCard?.imagePath}
            valueBox={selectedCard?.valueBox}
            valueColor={selectedCard?.valueColor}
            amount={effectiveAmount}
            recipient={
              type === "DIGITAL"
                ? deliveryChannel === "EMAIL"
                  ? recipientEmail || "recipient@example.com"
                  : deliveryChannel === "SMS"
                    ? recipientPhone || "+977 98XXXXXXXX"
                    : `${recipientEmail || "recipient@example.com"} / ${recipientPhone || "+977 98XXXXXXXX"}`
                : type === "PHYSICAL"
                  ? street
                  : "Corporate Distribution"
            }
            code={result ? result.code : (type === "CORPORATE_BULK" ? "GN-BULK-BATCH-XXXX" : "GN-XXXX-XXXX-XXXX-XXXXXXXX")}
            shouldShowCode={!!result}
            size="full"
          />
        </div>

        {result && (
          <div className="flex justify-center pt-2">
            <CardDownload
              cardElementId="gift-card-print"
              filename={`giftnow-card-${result.code}.png`}
              className="w-full text-center py-3"
            />
          </div>
        )}
        
        <div className="glass p-4 rounded-xl text-[11px] text-slate-400 space-y-1.5 border border-white/5">
          <p className="font-bold text-slate-300">Preview highlights:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Dynamic occasion designs overlay templates loaded from server.</li>
            <li>DIGITAL delivery triggers instant email notifications with QR.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}