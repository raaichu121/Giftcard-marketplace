# Wallet Features

## 1) Purpose

Wallet is the balance system where redeemed gift card value is stored and later spent.

## 2) Backend logic

Main files:

- `giftcard-backend/src/wallet/wallet.controller.ts`
- `giftcard-backend/src/wallet/wallet.service.ts`
- `giftcard-backend/src/wallet/audit.service.ts`

Endpoints:

- `GET /api/v1/gift-cards/wallet`
  - Returns wallet balance summary.
- `GET /api/v1/gift-cards/wallet/history`
  - Returns paginated audit history.
- `POST /api/v1/gift-cards/wallet/debit`
  - Debits wallet for order payment.

Core wallet operations:

- Auto-create wallet on first access.
- `creditWallet` used by redemption flow.
- `debitWallet` used by checkout flow.
- `adminCancelDebit` used when admin cancels previously redeemed card.

Concurrency and consistency:

- Uses transaction + row-level locking (`FOR UPDATE`) to avoid race conditions.

Audit trail:

- Every wallet movement creates `GiftCardAuditLog` record.
- Supported operations include `CREDIT`, `DEBIT`, `ADMIN_CANCEL_DEBIT`, `REFUND_CREDIT`.

## 3) Frontend logic

Main page:

- `giftcard-frontend/src/app/customer/wallet/page.tsx`

Displayed wallet data:

- Current balance
- Total credited
- Total debited
- Full transaction history with filters

Integration methods:

- `giftnowAPI.getWallet`
- `giftnowAPI.getWalletHistory`
- `giftnowAPI.redeem`
- `giftnowAPI.debitForOrder`

## 4) Tech used in this feature

- Prisma + PostgreSQL decimal balances
- Explicit SQL row locking through Prisma raw query
- Audit log model and service abstraction
- React hooks for refresh after redeem/debit events

## 5) Important business rule

Wallet balance is non-transferable and intended for checkout usage within the platform flow.
