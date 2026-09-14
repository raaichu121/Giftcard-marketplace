# Gift Card Purchase Features

## 1) Purpose

This feature lets users or guests buy gift cards.

Supported purchase types:

- DIGITAL
- CORPORATE_BULK
- PHYSICAL (both backend and frontend are fully implemented; frontend collects street address and city)

## 2) Backend logic

Main files:

- `giftcard-backend/src/giftcard/giftcard.controller.ts`
- `giftcard-backend/src/giftcard/giftcard.service.ts`

Endpoints:

- `POST /api/v1/gift-cards/purchase-guest`
  - Guest can buy cards without login.
  - Requires purchaser name and email.
- `POST /api/v1/gift-cards/purchase`
  - Logged-in customer purchase.
- `GET /api/v1/gift-cards/purchased`
  - Lists cards purchased by current customer.

Important backend steps:

- Validate amount boundaries (`validateAmount`).
- Validate required recipient details by card type.
- Generate unique gift code.
- Generate and hash PIN.
- Persist card in database.
- Attach QR code.
- Send delivery/confirmation emails.
- For bulk: create multiple cards and optionally CSV delivery.

## 3) Frontend logic

Main page:

- `giftcard-frontend/src/app/giftnow/buy/page.tsx`

What UI does:

- Collect purchaser details.
- Select card type: Digital, Physical, or Corporate Bulk.
- Choose card design from occasion templates.
- Enter amount.
- Enter recipient email and optional personal message (for Digital/Bulk).
- Collect street address and city (for Physical).
- Calls guest purchase API currently (`giftnowAPI.purchaseGuest`).
- Shows generated code (single) or batch output.

Admin purchase UI:

- `giftcard-frontend/src/app/admin/giftnow/create/page.tsx`
- Uses `giftnowAPI.adminCreate` for internal issuance.

## 4) Tech used in this feature

- Prisma models: `GiftCard`, `GiftCardBatch`, `OccasionCard`
- QR generation (`qrcode` package)
- Email queue trigger through delivery service
- Next.js + React form handling and validation
- Utility constraints for amount and quantity

## 5) Data models involved

- `GiftCard`
- `GiftCardBatch`
- `OccasionCard`
- `Customer` (for customer purchase context)
