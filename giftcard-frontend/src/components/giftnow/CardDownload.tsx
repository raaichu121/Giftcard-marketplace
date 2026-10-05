"use client";

import React, { useState } from "react";
import html2canvas from "html2canvas";

interface CardDownloadProps {
  cardElementId?: string; // default: 'gift-card-print'
  filename?: string;
  className?: string;
}

export default function CardDownload({
  cardElementId = "gift-card-print",
  filename,
  className = "",
}: CardDownloadProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    const el = document.getElementById(cardElementId);
    if (!el) return;

    setDownloading(true);
    try {
      // Ensure all images inside are loaded and allow CORS
      const canvas = await html2canvas(el, {
        scale: 3, // 3x high resolution output
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
      });

      const actualFilename = filename || `giftnow-card-${Date.now()}.png`;
      const link = document.createElement("a");
      link.download = actualFilename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to generate gift card PNG:", error);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className={`px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm ${className} disabled:opacity-60`}
    >
      {downloading ? "Generating PNG..." : "Download Card PNG"}
    </button>
  );
}