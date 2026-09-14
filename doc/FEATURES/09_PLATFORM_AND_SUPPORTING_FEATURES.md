# Platform and Supporting Features

## 1) Purpose

These features are foundational and support all business modules.

## 2) Backend platform features

### API foundation

- Global API prefix: `/api/v1`
- Swagger docs available at `/api/v1/docs`
- Global validation pipe with whitelist/transform
- CORS enabled with configurable origin

Main files:

- `giftcard-backend/src/main.ts`
- `giftcard-backend/src/app.module.ts`

### Health check

- `GET /health`
- File: `giftcard-backend/src/health/health.controller.ts`

### Data layer

- Prisma ORM + PostgreSQL
- Schema includes:
  - customers/admins
  - gift cards/batches
  - wallet and audit logs
  - OTPs
  - occasions and card templates

Main file:

- `giftcard-backend/prisma/schema.prisma`

## 3) Frontend supporting features

### API abstraction

- Centralized API methods and error mapping in:
  - `giftcard-frontend/src/lib/api.ts`

### Auth state and route protection

- Global auth context:
  - `giftcard-frontend/src/components/AuthProvider.tsx`
- Protected rendering guard:
  - `giftcard-frontend/src/components/RequireAuth.tsx`

### Main site pages

- Landing and informational pages exist under:
  - `src/app/page.tsx`, `about`, `business`, `contact`, `faq`, `terms`, `privacy`

These pages support product communication and user onboarding journey.

### Multi-language (i18n) support

- The frontend supports bilingual localization: English (`en`) and Nepali (`ne`).
- Implemented via a React context-based `LanguageProvider` and `useI18n` hook.
- Main file: `giftcard-frontend/src/lib/i18n.tsx`
- User language preference is persisted in `localStorage` under key `giftnow_lang`.
- Translation keys cover navigation, hero section, category labels, trust badges, and rewards text.
- Components use `t("key")` to render localized strings.

## 4) Tech used in supporting layer

- NestJS module architecture
- Pino logger integration
- Prisma migrations and generated client
- Next.js app-router pages
- Tailwind-driven UI

## 5) Current implementation observations

- Core gift card platform features (admin/auth/purchase/redeem/wallet/occasion/delivery) are implemented.
- At least one admin UI feature (bulk discount management) is present on frontend but backend endpoint is still missing.
- Checkout coupon logic is currently placeholder and ready for integration.
