# GiftNow Feature Documentation Index

This folder explains all major implemented features in a simple way.

## How to use these docs

- Start from admin features first.
- Then read auth and customer-facing flows.
- Each file includes:
  - Purpose
  - Backend logic
  - Frontend logic
  - Tech used
  - Key APIs

## Feature files (ordered)

1. `01_ADMIN_FEATURES.md`
2. `02_AUTHENTICATION_FEATURES.md`
3. `03_GIFTCARD_PURCHASE_FEATURES.md`
4. `04_GIFTCARD_REDEMPTION_FEATURES.md`
5. `05_WALLET_FEATURES.md`
6. `06_CHECKOUT_WALLET_PAYMENT_FEATURES.md`
7. `07_OCCASION_AND_CARD_DESIGN_FEATURES.md`
8. `08_DELIVERY_AND_NOTIFICATION_FEATURES.md`
9. `09_PLATFORM_AND_SUPPORTING_FEATURES.md`
10. `10_ERROR_HANDLING_AND_VALIDATION_FEATURES.md`
11. `11_GIFTCARD_VISUAL_AND_DOWNLOAD_FEATURES.md`
12. `12_CUSTOMER_DASHBOARD_FEATURES.md`

## High-level tech stack in this project

- Backend: NestJS, Prisma, PostgreSQL, BullMQ, Redis, JWT, bcrypt, Nodemailer, Swagger
- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS
- Infrastructure support: Docker Compose (local stack), MailHog (non-prod email testing)
