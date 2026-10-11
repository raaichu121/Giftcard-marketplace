"use client";

import React, { useState } from "react";
import { giftnowAPI, GiftNowApiError } from "@/lib/api";
import { formatNPR } from "@/lib/format";
import {
  isValidGiftNowCodeFormat,
  maskGiftNowCodeInput,
  normalizeGiftNowCodeInput,
} from "@/lib/giftnow";

interface GiftNowRedeemProps {
  onSuccess?: (result: { walletBalance: number; credited: number }) => void;
}

export default function GiftNowRedeem({ onSuccess }: GiftNowRedeemProps) {
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 1.5 | 2>(1);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<"EMAIL" | "SMS" | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    walletBalance: number;
    credited: number;
  } | null>(null);
  const [errorCode, setErrorCode] = useState("");

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(maskGiftNowCodeInput(text));
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeGiftNowCodeInput(code);
    if (!isValidGiftNowCodeFormat(normalized)) {
      setError("Please enter a valid code format: GN-XXXX-XXXX-XXXX-XXXXXXXX");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await giftnowAPI.sendRedeemOtp(normalized);
      const hasOtp = typeof res.requiresOtp === "boolean" ? res.requiresOtp : (res.data as any)?.requiresOtp;
      const email = typeof res.recipientEmail === "string" ? res.recipientEmail : (res.data as any)?.recipientEmail;
      const phone = typeof res.recipientPhone === "string" ? res.recipientPhone : (res.data as any)?.recipientPhone;
      const channelSelect = typeof res.requiresChannelSelection === "boolean" ? res.requiresChannelSelection : (res.data as any)?.requiresChannelSelection;
      
      setRequiresOtp(!!hasOtp);
      setRecipientEmail(email || "");
      setRecipientPhone(phone || "");

      if (channelSelect) {
        setStep(1.5);
      } else {
        setSelectedChannel(phone ? "SMS" : "EMAIL");
        setStep(2);
      }
    } catch (err: unknown) {
      if (err instanceof GiftNowApiError) {
        setError(err.message);
        setErrorCode(err.code);
      } else {
        setError(err instanceof Error ? err.message : "Code validation failed");
        setErrorCode("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtpForChannel = async (channel: "EMAIL" | "SMS") => {
    setLoading(true);
    setError("");
    try {
      const normalized = normalizeGiftNowCodeInput(code);
      const res = await giftnowAPI.sendRedeemOtp(normalized, channel);
      const email = typeof res.recipientEmail === "string" ? res.recipientEmail : (res.data as any)?.recipientEmail;
      const phone = typeof res.recipientPhone === "string" ? res.recipientPhone : (res.data as any)?.recipientPhone;
      
      setRecipientEmail(email || "");
      setRecipientPhone(phone || "");
      setSelectedChannel(channel);
      setRequiresOtp(true);
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof GiftNowApiError) {
        setError(err.message);
        setErrorCode(err.code);
      } else {
        setError(err instanceof Error ? err.message : "OTP dispatch failed");
        setErrorCode("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeGiftNowCodeInput(code);

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await giftnowAPI.redeem(
        normalized,
        requiresOtp ? undefined : pin || undefined,
        requiresOtp ? otp || undefined : undefined
      );
      const data =
        "walletBalance" in res && typeof res.walletBalance === "number"
          ? {
              walletBalance: res.walletBalance,
              credited: res.credited as number,
            }
          : (res.data as { walletBalance: number; credited: number });
      setResult(data);
      onSuccess?.(data);
      setCode("");
      setPin("");
      setOtp("");
      setSelectedChannel(null);
      setStep(1);
    } catch (err: unknown) {
      if (err instanceof GiftNowApiError) {
        setError(err.message);
        setErrorCode(err.code);
      } else {
        setError(err instanceof Error ? err.message : "Redemption failed");
        setErrorCode("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-8 rounded-2xl border border-white/10 max-w-lg mx-auto relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gc-purple/10 blur-3xl rounded-full" />
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 text-xl mb-3 text-gold-400">
          🎁
        </div>
        <h2 className="text-xl font-bold text-white">Redeem Claim Code</h2>
        <p className="text-xs text-slate-400 mt-1.5">
          Type or paste your 16-character code below to credit your wallet balance instantly.
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleVerifyCode} className="space-y-6 relative z-10">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
              Gift card code
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(maskGiftNowCodeInput(e.target.value))}
                placeholder="GN-XXXX-XXXX-XXXX-XXXXXXXX"
                className="w-full pl-4 pr-16 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:border-gc-purple focus:ring-1 focus:ring-gc-purple/20"
                required
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-extrabold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
              >
                Paste
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs px-4 py-3 rounded-lg flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          {result && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-2.5 animate-fade-in text-center">
              <p className="font-bold text-emerald-400">
                Value Claimed Successfully!
              </p>
              <div className="grid grid-cols-2 gap-4 bg-black/20 p-3 rounded-lg text-slate-300 border border-white/5">
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Credited</p>
                  <p className="text-sm font-bold text-white mt-0.5">{formatNPR(result.credited)}</p>
                </div>
                <div className="border-l border-white/5">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">New Wallet Balance</p>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">{formatNPR(result.walletBalance)}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-gc-purple to-accent-600 hover:shadow-glow text-white font-extrabold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 text-xs uppercase tracking-wider"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying code...
              </span>
            ) : (
              "Verify Code"
            )}
          </button>
        </form>
      ) : step === 1.5 ? (
        <div className="space-y-6 relative z-10 animate-fade-in">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs">
            <span className="text-slate-400">Verifying code:</span>{" "}
            <span className="font-mono text-white font-bold tracking-wider">{code}</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider block text-center">
              Where should we send your 6-digit verification code?
            </h3>
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Select one of the verified delivery channels linked to this card to receive your passcode.
            </p>
            
            <div className="grid grid-cols-1 gap-3 mt-4">
              {recipientEmail && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSendOtpForChannel("EMAIL")}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📧</span>
                    <div>
                      <p className="text-xs font-bold text-white">Email Address</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{recipientEmail}</p>
                    </div>
                  </div>
                  <span className="text-slate-500 group-hover:text-white transition-all text-xs">Send OTP &rarr;</span>
                </button>
              )}

              {recipientPhone && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSendOtpForChannel("SMS")}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💬</span>
                    <div>
                      <p className="text-xs font-bold text-white">SMS Notification</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{recipientPhone}</p>
                    </div>
                  </div>
                  <span className="text-slate-500 group-hover:text-white transition-all text-xs">Send OTP &rarr;</span>
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="text-xs px-4 py-3 rounded-lg flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider border border-white/10"
          >
            Back
          </button>
        </div>
      ) : (
        <form onSubmit={handleRedeem} className="space-y-6 relative z-10">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs">
            <span className="text-slate-400">Verifying code:</span>{" "}
            <span className="font-mono text-white font-bold tracking-wider">{code}</span>
          </div>

          {requiresOtp ? (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                Verification OTP Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                  setOtp(val);
                }}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full pl-4 pr-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-mono tracking-[0.4em] text-center focus:outline-none focus:border-gc-purple focus:ring-1 focus:ring-gc-purple/20"
                required
              />
              <p className="text-[10px] text-emerald-400 mt-1">
                A 6-digit passcode has been sent to the recipient's{" "}
                {selectedChannel === "SMS" ? (
                  <>phone number: <strong>{recipientPhone}</strong></>
                ) : (
                  <>email address: <strong>{recipientEmail}</strong></>
                )}.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                Security PIN
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                  setPin(val);
                }}
                placeholder="Enter 6-digit PIN"
                maxLength={6}
                className="w-full pl-4 pr-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-mono tracking-[0.4em] text-center focus:outline-none focus:border-gc-purple focus:ring-1 focus:ring-gc-purple/20"
                required
              />
              <p className="text-[9px] text-slate-500 mt-1">
                The 6-digit security PIN is required to redeem this physical or bulk gift card.
              </p>
            </div>
          )}

          {error && (
            <div className={`text-xs px-4 py-3 rounded-lg flex items-center gap-2 ${
              errorCode === "CARD_PIN_LOCKED"
                ? "text-red-400 bg-red-500/10 border border-red-500/20"
                : errorCode === "INVALID_PIN"
                  ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                  : "text-red-400 bg-red-500/10 border border-red-500/20"
            }`}>
              {errorCode === "CARD_PIN_LOCKED" ? "🔒" : "⚠️"} {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setError("");
                // Go back to channel selection if we had selection options, else back to code input
                if (recipientEmail && recipientPhone) {
                  setStep(1.5);
                } else {
                  setStep(1);
                }
              }}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider border border-white/10"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-gradient-to-r from-gc-purple to-accent-600 hover:shadow-glow text-white font-extrabold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 text-xs uppercase tracking-wider"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Redeeming...
                </span>
              ) : (
                "Redeem Card"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}