"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { giftnowAPI } from "@/lib/api";

interface CheckoutBreakdownProps {
  itemTotal: number;
  couponCode?: string;
  onUseWallet?: (amount: number) => void;
  accountId?: string;
}

interface CheckoutCalc {
  itemTotal: number;
  couponDiscount: number;
  subtotalAfterCoupon: number;
  walletUsed: number;
  walletRemaining: number;
  amountToPay: number;
  walletBalanceAfter: number;
}

export default function CheckoutBreakdown({
  itemTotal,
  couponCode,
  onUseWallet,
  accountId,
}: CheckoutBreakdownProps) {
  const [useWallet, setUseWallet] = useState(true);
  const [calculation, setCalculation] = useState<CheckoutCalc | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    loadCheckoutCalculation();
  }, [itemTotal, couponCode, useWallet]);

  const loadCheckoutCalculation = async () => {
    if (!accountId) return;

    setLoading(true);
    try {
      const result = await giftnowAPI.checkoutCalculate({
        itemTotal,
        couponCode,
        useWallet,
      });
      const data = (result.data || result) as CheckoutCalc;
      setCalculation(data);
      setWalletBalance(data.walletRemaining || 0);
      onUseWallet?.(data.walletUsed || 0);
    } catch (error) {
      console.error("Failed to calculate checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!calculation) {
    return <div className="text-gray-500">Loading checkout details...</div>;
  }

  const formatCurrency = (amount: number) =>
    `NPR ${amount.toLocaleString("en-NP", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>

      {/* Item Total */}
      <div className="flex justify-between text-gray-700">
        <span>Item Total</span>
        <span>{formatCurrency(calculation.itemTotal)}</span>
      </div>

      {/* Coupon Discount */}
      {calculation.couponDiscount > 0 && (
        <div className="flex justify-between text-green-700 font-semibold">
          <span>Coupon Discount</span>
          <span>-{formatCurrency(calculation.couponDiscount)}</span>
        </div>
      )}

      {/* Subtotal After Coupon */}
      <div className="border-t border-gray-300 pt-4 flex justify-between font-semibold text-gray-900">
        <span>Subtotal</span>
        <span>{formatCurrency(calculation.subtotalAfterCoupon)}</span>
      </div>

      {/* GiftNow Wallet Section */}
      {walletBalance > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useWallet}
                onChange={(e) => setUseWallet(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm font-semibold text-blue-900">
                Use GiftNow Balance
              </span>
            </label>
            <span className="text-sm text-blue-700">
              Available: {formatCurrency(walletBalance)}
            </span>
          </div>

          {useWallet && calculation.walletUsed > 0 && (
            <div className="text-sm text-blue-800">
              <p>Using: {formatCurrency(calculation.walletUsed)}</p>
              <p>Remaining: {formatCurrency(calculation.walletRemaining)}</p>
            </div>
          )}
        </div>
      )}

      {/* Amount to Pay */}
      <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
        <span className="text-lg font-bold text-gray-900">
          Total Amount to Pay
        </span>
        <span className="text-2xl font-bold text-blue-600">
          {formatCurrency(calculation.amountToPay)}
        </span>
      </div>

      {calculation.amountToPay === 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-2 text-center text-green-700 font-semibold">
          Fully covered by GiftNow balance!
        </div>
      )}
    </div>
  );
}