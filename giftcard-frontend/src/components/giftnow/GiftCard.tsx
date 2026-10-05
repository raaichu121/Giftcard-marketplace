"use client";

import React from "react";
import Image from "next/image";

export interface GiftCardProps {
  imagePath?: string;
  valueBox?: {
    top: string;
    right: string;
    width: string;
  };
  valueColor?: string;
  amount: number;
  currency?: string; // Default 'Rs.'
  recipient?: string;
  code?: string;
  pin?: string;
  shouldShowCode?: boolean;
  size?: "sm" | "md" | "lg" | "full"; // sm=240px, md=400px, lg=560px, full=100%
}

const SIZE_MAP = {
  sm: "240px",
  md: "400px",
  lg: "560px",
  full: "100%",
};

export default function GiftCard({
  imagePath,
  valueBox,
  valueColor,
  amount,
  currency = "Rs.",
  recipient,
  code,
  pin,
  shouldShowCode = false,
  size = "md",
}: GiftCardProps) {
  const width = SIZE_MAP[size];

  // Fallback styling for amount overlay container
  const top = valueBox?.top || "48%";
  const right = valueBox?.right || "6%";
  const widthPct = valueBox?.width || "32%";

  return (
    <div
      id="gift-card-print"
      className="relative rounded-2xl overflow-hidden select-none shadow-xl border border-white/10 flex-shrink-0"
      style={{
        width: width,
        containerType: "inline-size",
      }}
    >
      {/* 1. Background image — renders at its natural aspect ratio */}
      {imagePath ? (
        <Image
          src={imagePath}
          alt="Gift Card Occasion Design"
          width={1600}
          height={1100}
          sizes="(max-width: 640px) 100vw, 400px"
          style={{ width: "100%", height: "auto", display: "block" }}
          priority
          unoptimized // To allow loading custom dynamic public files without Next image optimization cache failures if not configured
        />
      ) : (
        <div
          className="bg-gradient-to-br from-gc-purple via-[#bd1b55] to-accent-600"
          style={{ aspectRatio: "1.586", width: "100%" }}
        />
      )}

      {/* 2. Amount overlay - sits inside the blank "GIFT CARD VALUE" box */}
      <div
        style={{
          position: "absolute",
          top: top,
          right: right,
          width: widthPct,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="font-black text-center whitespace-nowrap"
          style={{
            fontSize: "clamp(10px, 5cqi, 28px)",
            color: "#000000",
            lineHeight: 1,
          }}
        >
          {currency} {amount.toLocaleString("en-IN")}
        </span>
      </div>

      {/* 3. Recipient name (optional) */}
      {recipient && (
        <div
          className="absolute font-semibold opacity-80"
          style={{
            bottom: "16%",
            left: "6%",
            fontSize: "clamp(8px, 2.5cqi, 13px)",
            color: "#000000",
          }}
        >
          To: {recipient}
        </div>
      )}

      {/* 4. Card code + PIN (only shown on final delivered card or preview when claim code is ready) */}
      {shouldShowCode && code && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 animate-fade-in"
          style={{
            bottom: "6%",
          }}
        >
          <span
            className="font-mono tracking-widest font-bold opacity-60"
            style={{
              fontSize: "clamp(7px, 2cqi, 11px)",
              color: "#000000",
            }}
          >
            {code}
          </span>
          {pin && (
            <span
              className="font-mono opacity-55"
              style={{
                fontSize: "clamp(6px, 1.6cqi, 10px)",
                color: "#000000",
              }}
            >
              PIN: {pin}
            </span>
          )}
        </div>
      )}
    </div>
  );
}