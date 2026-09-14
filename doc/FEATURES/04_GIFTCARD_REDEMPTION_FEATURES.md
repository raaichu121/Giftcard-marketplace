# Gift Card Redemption Features

## 1) Purpose

This feature converts gift card value into customer wallet balance.

## 2) Backend logic

Main files:

- `giftcard-backend/src/giftcard/redemption.service.ts`
- `giftcard-backend/src/giftcard/giftcard.controller.ts`

Endpoints:

- `POST /api/v1/gift-cards/redeem/send-otp`
  - Checks card state and sends OTP when required.
- `POST /api/v1/gift-cards/redeem`
  - Redeems card to wallet.

Rules by card source:

- Customer-purchased card:
  - OTP-based redemption required.
- Non-customer/admin-issued card:
  - Static PIN-based redemption used.

Security controls:

- Redeem route protected by `JwtAuthGuard`, roles, and `RedeemRateLimitGuard`.
- Invalid attempts increase `pinAttempts`.
- Lock after max attempts (`MAX_PIN_ATTEMPTS`).
- OTP expires in 5 minutes.

Transactional flow:

- Verify card status.
- Validate OTP or PIN.
- Update card status from `ACTIVE` -> `FULLY_REDEEMED`.
- Credit wallet in transaction.
- Reset attempts on success.

## 3) Frontend logic

Main page section:

- `giftcard-frontend/src/app/customer/wallet/page.tsx`

UX flow:

1. User enters card code.
2. UI calls `sendRedeemOtp`.
3. If OTP required, show masked recipient info and OTP input.
4. Submit final redeem request with OTP or PIN.
5. Refresh wallet and history on success.

## 4) Tech used in this feature

- Prisma transactional update patterns
- bcrypt PIN compare for static-PIN cards
- OTP storage in `giftnow_otps`
- Rate limiting guard on redemption APIs
- React multi-step redeem state UI

## 5) Error design

Mapped error codes include:

- `GIFT_CARD_NOT_FOUND`
- `GIFT_CARD_ALREADY_REDEEMED`
- `GIFT_CARD_CANCELLED`
- `INVALID_PIN`
- `CARD_PIN_LOCKED`
- `RATE_LIMIT_EXCEEDED`

Frontend maps these to user-friendly messages in `src/lib/api.ts`.
