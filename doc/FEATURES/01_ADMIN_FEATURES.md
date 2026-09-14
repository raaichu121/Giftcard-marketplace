# Admin Features

This is the first feature group to understand.

## 1) Purpose

Admin features allow operations teams to create, monitor, control, and export gift card data.

## 2) Backend logic

Main backend entry point:

- `giftcard-backend/src/admin/admin.controller.ts`

Admin endpoints:

- `POST /api/v1/gift-cards/admin/create`
  - Create single card or bulk batch.
  - Uses `GiftcardService.adminCreate`.
- `POST /api/v1/gift-cards/admin/cancel/:id`
  - Cancel card.
  - If card was already redeemed, system debits redeemed wallet amount (admin cancel debit flow).
- `POST /api/v1/gift-cards/admin/reset-pin/:id`
  - Regenerates card PIN and clears lock attempts.
  - Customer-purchased cards use OTP flow; PIN behavior differs by card type.
- `GET /api/v1/gift-cards/admin/list`
  - Filter cards by status, type, issuer, code, and date range.
- `GET /api/v1/gift-cards/admin/analytics`
  - Aggregated KPIs: issued count, redeemed count, outstanding balance, average denomination, etc.
- `GET /api/v1/gift-cards/admin/batch/:batchId`
  - Batch-level details and redemption rate.
- `GET /api/v1/gift-cards/admin/export`
  - CSV export of cards with filters.

Security:

- Protected with `JwtAuthGuard` + `RolesGuard`.
- Allowed roles: `SUPER_ADMIN`, `ADMIN`, `MODERATOR`.

## 3) Frontend logic

Main admin pages:

- `giftcard-frontend/src/app/admin/giftnow/page.tsx` (dashboard + quick list + export)
- `giftcard-frontend/src/app/admin/giftnow/create/page.tsx` (create single/bulk cards)
- `giftcard-frontend/src/app/admin/giftnow/list/page.tsx` (advanced filters, cancel, reset PIN)
- `giftcard-frontend/src/app/admin/giftnow/analytics/page.tsx` (KPI dashboard)
- `giftcard-frontend/src/app/admin/giftnow/batch/[id]/page.tsx` (batch details)

API client methods used:

- `giftnowAPI.adminCreate`
- `giftnowAPI.adminCancel`
- `giftnowAPI.adminResetPin`
- `giftnowAPI.adminList`
- `giftnowAPI.adminAnalytics`
- `giftnowAPI.adminBatch`
- `giftnowAPI.adminExport`

## 4) Tech used in this feature

- NestJS controllers + services
- Prisma (gift card, batch, wallet/audit queries)
- JWT + role-based authorization
- CSV generation for export
- Next.js App Router pages
- React state + client-side filtering controls

## 5) Important note

There is a frontend page for bulk discount management:

- `giftcard-frontend/src/app/admin/giftnow/discounts/page.tsx`

But backend endpoint for it is currently not implemented in the checked backend code:

- Frontend expects `PUT /api/v1/gift-cards/admin/bulk-discounts`
- No matching backend controller/service method exists yet

So this discount feature is currently UI-only/incomplete from API perspective.