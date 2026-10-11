"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { giftnowAPI } from "@/lib/api";

const deliveryAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().optional(),
});

type DeliveryAddress = z.infer<typeof deliveryAddressSchema>;

interface PhysicalDeliveryFormProps {
  amount: number;
  recipientEmail?: string;
  personalMessage?: string;
  onSuccess?: (data: any) => void;
  isSubmitting?: boolean;
}

export default function PhysicalDeliveryForm({
  amount,
  recipientEmail,
  personalMessage,
  onSuccess,
  isSubmitting = false,
}: PhysicalDeliveryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<DeliveryAddress>({
    resolver: zodResolver(deliveryAddressSchema),
  });

  const loading = isSubmitting || formSubmitting;

  const onSubmit = async (data: DeliveryAddress) => {
    try {
      const response = await giftnowAPI.purchase({
        type: "PHYSICAL",
        amount,
        recipientEmail,
        personalMessage,
        deliveryAddress: {
          ...data,
          country: data.country || "Nepal",
        },
      });

      toast.success(`Physical card ordered! Code: ${response.code}`);
      onSuccess?.(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to order physical card";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Recipient Full Name
        </label>
        <input
          type="text"
          placeholder="e.g., Rajesh Kumar"
          {...register("fullName")}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.fullName && (
          <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Street Address
        </label>
        <input
          type="text"
          placeholder="e.g., 123 Main Street, Apartment 4B"
          {...register("street")}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.street && (
          <p className="text-red-600 text-sm mt-1">{errors.street.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            City
          </label>
          <input
            type="text"
            placeholder="e.g., Kathmandu"
            {...register("city")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.city && (
            <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Postal Code
          </label>
          <input
            type="text"
            placeholder="e.g., 44600"
            {...register("postalCode")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.postalCode && (
            <p className="text-red-600 text-sm mt-1">
              {errors.postalCode.message}
            </p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Delivery Info:</strong> Physical card will be printed and
          delivered within 5-7 business days. Tracking number will be sent via
          email.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? "Processing..." : `Order Physical Card - NPR ${amount}`}
      </button>
    </form>
  );
}