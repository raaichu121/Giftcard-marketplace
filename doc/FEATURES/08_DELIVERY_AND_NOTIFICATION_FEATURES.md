# Delivery and Notification Features

## 1) Purpose

This feature handles message delivery and asynchronous jobs for:

- Digital gift email
- Purchase confirmation
- Redeem OTP email
- Reset PIN email
- Bulk CSV email delivery
- Physical card print job queue

## 2) Backend logic

Main files:

- `giftcard-backend/src/delivery/delivery.module.ts`
- `giftcard-backend/src/delivery/delivery.service.ts`
- `giftcard-backend/src/delivery/processors/*`

Queue setup:

- `email-queue` — **actively used** for all email delivery jobs
- `bulk-queue` — registered in module, **not actively enqueued** by any service
- `print-queue` — registered in module, **not actively enqueued** by any service

How delivery is used:

- Purchase flow calls delivery service to send gift + confirmation emails.
- Redemption flow uses delivery for OTP emails.
- Admin reset PIN flow uses delivery reset PIN email.
- Bulk CSV delivery sends gift card codes as email attachment.

Active email delivery methods in `DeliveryService`:

- `sendDigitalGiftEmail` — sends gift card details to recipient
- `sendPurchaseConfirmation` — sends purchase receipt to purchaser (with optional CSV attachment for bulk)
- `sendBulkGiftCsvEmail` — sends bulk batch CSV to corporate recipient
- `sendRedeemOtpEmail` — sends 6-digit OTP for customer-purchased card redemption
- `sendResetPinEmail` — sends new PIN after admin resets a card's PIN

QR support:

- `attachQrCode` generates Data URL QR using `qrcode` package and stores in gift card record.

## 3) Frontend logic

Frontend does not send email directly.
It triggers backend feature actions (purchase/redeem/admin reset), and backend queues communication jobs.

User-visible effects from frontend actions:

- Recipient gets gift card mail
- Purchaser gets confirmation mail
- Redeemer gets OTP mail
- Admin reset PIN sends new details mail

## 4) Tech used in this feature

- BullMQ queues
- Redis as queue backend
- Nodemailer transport (MailHog in non-prod, SendGrid SMTP in production)
- HTML email templates (inline styles, built directly in service methods)
- QR code generation library

## 5) Environment behavior

- Production mode: SendGrid SMTP (`smtp.sendgrid.net`).
- Non-production: MailHog route for local testing.

## 6) Queue activity status

| Queue | Processor | Registered | Actively Enqueued |
| --- | --- | --- | --- |
| `email-queue` | `EmailProcessor` | Yes | Yes — all email methods use this |
| `bulk-queue` | `BulkProcessor` | Yes | No — bulk cards are created synchronously in `GiftcardService` |
| `print-queue` | `PrintProcessor` | Yes | No — `sendPhysicalCardPrintJob` exists in service but is never called |

The `BulkProcessor` contains logic for asynchronous bulk code generation, but the current purchase flow generates bulk cards synchronously within `GiftcardService.purchase` and `GiftcardService.adminCreate`.

The `PrintProcessor` and `sendPhysicalCardPrintJob` method exist as scaffolding for a future physical card printing workflow.

