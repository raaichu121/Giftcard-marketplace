"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { giftnowAPI } from "@/lib/api";
import toast from "react-hot-toast";

interface BulkDiscount {
  minQuantity: number;
  maxQuantity: number;
  discountPercent: number;
}

const DEFAULT_DISCOUNTS: BulkDiscount[] = [
  { minQuantity: 10, maxQuantity: 49, discountPercent: 2 },
  { minQuantity: 50, maxQuantity: 99, discountPercent: 5 },
  { minQuantity: 100, maxQuantity: 499, discountPercent: 8 },
  { minQuantity: 500, maxQuantity: 999, discountPercent: 10 },
  { minQuantity: 1000, maxQuantity: 9999, discountPercent: 12 },
];

export default function AdminBulkDiscountsPage() {
  const [discounts, setDiscounts] = useState<BulkDiscount[]>(DEFAULT_DISCOUNTS);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);

  const handleDiscountChange = (
    index: number,
    field: keyof BulkDiscount,
    value: number,
  ) => {
    const updated = [...discounts];
    updated[index] = { ...updated[index], [field]: value };
    setDiscounts(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validation: ensure minQuantity < maxQuantity for each tier
      for (const discount of discounts) {
        if (discount.minQuantity >= discount.maxQuantity) {
          throw new Error(
            `Invalid tier: Min quantity must be less than max quantity`,
          );
        }
        if (discount.discountPercent < 0 || discount.discountPercent > 100) {
          throw new Error(
            `Invalid discount: Must be between 0-100%`,
          );
        }
      }

      await giftnowAPI.adminSetBulkDiscounts(discounts);
      toast.success("Bulk discounts updated successfully");
      setEditing(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save discounts";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    const newDiscount: BulkDiscount = {
      minQuantity: 2000,
      maxQuantity: 9999,
      discountPercent: 15,
    };
    setDiscounts([...discounts, newDiscount]);
    setEditing(discounts.length);
  };

  const handleDeleteRow = (index: number) => {
    setDiscounts(discounts.filter((_, i) => i !== index));
  };

  return (
    <Layout activePath="/admin/giftnow">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Bulk Order Discounts
        </h1>
        <p className="text-slate-500 mb-8">
          Configure percentage discounts based on order quantity
        </p>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Min Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Max Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Discount %
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((discount, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      {editing === index ? (
                        <input
                          type="number"
                          value={discount.minQuantity}
                          onChange={(e) =>
                            handleDiscountChange(
                              index,
                              "minQuantity",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      ) : (
                        <span className="text-sm">{discount.minQuantity}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editing === index ? (
                        <input
                          type="number"
                          value={discount.maxQuantity}
                          onChange={(e) =>
                            handleDiscountChange(
                              index,
                              "maxQuantity",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      ) : (
                        <span className="text-sm">{discount.maxQuantity}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editing === index ? (
                        <input
                          type="number"
                          value={discount.discountPercent}
                          onChange={(e) =>
                            handleDiscountChange(
                              index,
                              "discountPercent",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-green-700">
                          {discount.discountPercent}%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {editing === index ? (
                          <>
                            <button
                              onClick={handleSave}
                              disabled={loading}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="px-3 py-1 bg-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-400"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditing(index)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRow(index)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleAddRow}
            className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700"
          >
            + Add Discount Tier
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • When a customer orders a bulk card between min-max quantity,
              they get that discount
            </li>
            <li>• Discounts are applied automatically at checkout</li>
            <li>• Example: Order 50 cards = 5% discount applied</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}