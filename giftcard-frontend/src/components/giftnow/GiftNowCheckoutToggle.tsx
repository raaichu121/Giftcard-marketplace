"use client";

import React, { useEffect, useState } from "react";
import { giftnowAPI } from "@/lib/api";
import { formatNPR } from "@/lib/format";

interface GiftNowCheckoutToggleProps {
  orderTotal: number;
  couponDiscount?: number;
  onApplyChange?: (applied: number, enabled: boolean) => void;
}

/**
 * Checkout: coupon first, then GiftNow wallet (SRS §4.5).
 */
export default function GiftNowCheckoutToggle({
  orderTotal,
  couponDiscount = 0,
  onApplyChange,
}: GiftNowCheckoutToggleProps) {
  const [enabled, setEnabled] = useState(true);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    giftnowAPI
      .getWallet()
      .then((w) => {
        const data = (w as { balance?: number }).balance !== undefined
          ? (w as { balance: number })
          : (w.data as { balance: number });
        setBalance(data.balance ?? 0);
      })
      .catch(() => setBalance(0))
      .finally(() => setLoading(false));
  }, []);

  const afterCoupon = Math.max(0, orderTotal - couponDiscount);
  const applied = enabled ? Math.min(balance, afterCoupon) : 0;
  const finalPayable = afterCoupon - applied;

  useEffect(() => {
    onApplyChange?.(applied, enabled && balance > 0);
  }, [applied, enabled, balance, onApplyChange]);

  if (loading || balance <= 0) return null;

  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-blue-600"
        />
        <span className="text-sm font-medium text-slate-900">
          Use GiftNow balance ({formatNPR(balance)} available)
        </span>
      </label>

      <dl className="text-sm space-y-1 text-slate-600">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatNPR(orderTotal)}</dd>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <dt>Coupon</dt>
            <dd>{formatNPR(couponDiscount)}</dd>
          </div>
        )}
        {applied > 0 && (
          <div className="flex justify-between text-blue-700">
            <dt>GiftNow balance</dt>
            <dd>{formatNPR(applied)}</dd>
          </div>
        )}
        <div className="flex justify-between font-semibold text-slate-900 pt-1 border-t border-slate-200">
          <dt>Payable</dt>
          <dd>{formatNPR(finalPayable)}</dd>
        </div>
      </dl>
    </div>
  );
}