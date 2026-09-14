# Checkout and Wallet Payment Features

## 1) Purpose

Checkout calculates how much user pays from:

- coupon discount (placeholder currently)
- wallet balance
- remaining external payment amount

## 2) Backend logic

Main files:

- `giftcard-backend/src/checkout/checkout.controller.ts`
- `giftcard-backend/src/checkout/checkout.service.ts`

Endpoints:

- `POST /api/v1/gift-cards/checkout/calculate`
  - Returns computed checkout split.
- `POST /api/v1/gift-cards/checkout/process`
  - Validates wallet usage and debits wallet.

Calculation order:

1. Start with item total.
2. Apply coupon discount.
3. Apply wallet usage.
4. Output `amountToPay` externally.

Current status:

- Coupon integration is placeholder (`getCouponDiscount` returns 0 currently).
- Wallet validation exists and must match server calculation.
- **External Payment Gateways**: Payment methods (like eSewa or Khalti mentioned in user copy, landing pages, and FAQs) are placeholders. The backend `processCheckout` takes a `paymentMethod` string (e.g. during checkout verification) but only performs validation and wallet balance deductions, without executing actual calls to real payment gateways.

## 3) Frontend logic

Frontend API client includes:

- `giftnowAPI.checkoutCalculate`
- `giftnowAPI.checkoutProcess`

This project has backend-ready checkout APIs and frontend API wrappers. Full dedicated customer checkout page appears to be part of broader commerce flow outside the giftcard module pages shown.

## 4) Tech used in this feature

- NestJS service-based calculation module
- Wallet service integration for debits
- Validation through DTO + business checks
- Logging via Nest `Logger`

## 5) What this enables

- Correct wallet deduction before order confirmation
- Consistent server-side validation (prevents manipulated wallet amount from client)
