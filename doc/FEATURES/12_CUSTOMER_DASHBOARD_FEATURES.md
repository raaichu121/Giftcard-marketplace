# Customer Dashboard Features

## 1) Purpose

This feature provides the authenticated customer-facing dashboard where users can view their wallet, redeem gift cards, browse transaction history, and manage their purchased cards.

## 2) Frontend pages and components

### Customer Wallet page

Main page:

- `giftcard-frontend/src/app/customer/wallet/page.tsx`

This is the primary customer hub. It integrates multiple sub-components:

What UI provides:

- **Wallet summary**: displays current balance, total credited, and total debited.
- **Redeem a Card section**: embedded `GiftNowRedeem` component for redeeming gift card codes.
- **Transaction history**: paginated audit log of all wallet movements (credits, debits, admin cancels, refunds).
- **Purchased cards list**: shows gift cards the logged-in customer has purchased.

### GiftNowWallet component

Main file:

- `giftcard-frontend/src/components/giftnow/GiftNowWallet.tsx`

Displays wallet balance summary and provides visual layout for wallet data.

### GiftNowRedeem component

Main file:

- `giftcard-frontend/src/components/giftnow/GiftNowRedeem.tsx`

Two-step redemption flow:

1. **Step 1**: Enter gift card code. The UI calls `sendRedeemOtp` to check the code.
   - If card is customer-purchased → OTP is required (sent to recipient email).
   - If card is admin-issued → static PIN entry is required.
2. **Step 2**: Enter OTP or PIN and submit final redeem request.
   - On success, wallet is credited and balance refreshed.

Error handling includes visual differentiation:

- `CARD_PIN_LOCKED` → red alert with lock icon
- `INVALID_PIN` → amber warning showing remaining attempts

### GiftNowHistory component

Main file:

- `giftcard-frontend/src/components/giftnow/GiftNowHistory.tsx`

Renders a list of wallet audit log entries with operation type labels, amounts, and timestamps.

### CheckoutBreakdown component

Main file:

- `giftcard-frontend/src/components/giftnow/CheckoutBreakdown.tsx`

Displays checkout calculation breakdown showing item total, coupon discount, wallet usage, and remaining amount to pay externally.

### GiftNowCheckoutToggle component

Main file:

- `giftcard-frontend/src/components/giftnow/GiftNowCheckoutToggle.tsx`

UI toggle for enabling/disabling wallet usage during checkout flow.

## 3) API methods used

- `giftnowAPI.getWallet` — fetch wallet balance
- `giftnowAPI.getWalletHistory` — fetch paginated audit log
- `giftnowAPI.getPurchased` — fetch purchased cards list
- `giftnowAPI.sendRedeemOtp` — initiate code verification
- `giftnowAPI.redeem` — submit final redemption
- `giftnowAPI.debitForOrder` — debit wallet for checkout
- `giftnowAPI.checkoutCalculate` — get checkout breakdown
- `giftnowAPI.checkoutProcess` — finalize checkout

## 4) Route protection

- The `/customer/wallet` page is protected by `RequireAuth` component.
- Only authenticated users with role `CUSTOMER` can access.
- Unauthenticated users are redirected to the auth flow.

## 5) Tech used in this feature

- Next.js App Router page with `"use client"` directive
- React hooks for state management and data refresh on redeem/debit events
- `RequireAuth` wrapper component for route protection
- Centralized API client with error mapping