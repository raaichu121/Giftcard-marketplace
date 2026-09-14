# Occasion and Card Design Features

## 1) Purpose

This feature manages festival/occasion themes and card templates used while buying gift cards.

## 2) Backend logic

Main files:

- `giftcard-backend/src/occasion/occasion.controller.ts`
- `giftcard-backend/src/occasion/occasion.service.ts`

Public endpoint:

- `GET /api/v1/gift-cards/occasions`
  - Returns active occasions + card templates for customers.

Admin endpoints:

- `GET /api/v1/gift-cards/occasions/admin/list`
- `POST /api/v1/gift-cards/occasions/admin`
- `PATCH /api/v1/gift-cards/occasions/admin/:id`
- `DELETE /api/v1/gift-cards/occasions/admin/:id`
- `POST /api/v1/gift-cards/occasions/admin/:id/cards`
- `PATCH /api/v1/gift-cards/occasions/admin/:id/cards/:cardId/default`
- `DELETE /api/v1/gift-cards/occasions/admin/cards/:cardId`
- `POST /api/v1/gift-cards/occasions/admin/upload-card`

Key logic:

- Occasion-level activation and ordering.
- Card template metadata (`imagePath`, `valueBox`, `valueColor`).
- Default template enforcement per occasion.
- Upload endpoint writes image file into frontend `public/cards/{slug}` folder.

## 3) Frontend logic

Main pages/components:

- `giftcard-frontend/src/app/admin/giftnow/occasions/page.tsx`
- `giftcard-frontend/src/components/giftnow/CardPicker` (used in buy flow)
- `giftcard-frontend/src/app/giftnow/buy/page.tsx`

What admin can do from UI:

- Create/edit/delete occasions
- Upload card images
- Add card templates
- Set default template
- Configure value box placement

What customer sees:

- Occasion cards list in purchase flow
- Template preview before final purchase

## 4) Tech used in this feature

- Prisma models: `Occasion`, `OccasionCard`
- Multer file upload (`FileInterceptor`, `diskStorage`)
- Role-guarded admin endpoints
- Next.js image rendering + picker components

## 5) Important note

This is one of the features with both strong backend and frontend implementation and directly affects gift card personalization UX.
